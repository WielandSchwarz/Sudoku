// Sudoku account sync – Cloudflare Worker with a D1 database bound as "DB".
// POST /api/login  { name, pin, create }        -> { ok, name, seen, state, stateUpdated }
// POST /api/save   { name, pin, seen, state, stateUpdated } -> same shape, merged
// POST /api/top    { game, name? }              -> { ok, rows, me, total }   (Bestenliste der Minispiele, siehe unten)
// POST /api/score  { game, name, pin, score, hamster } -> same shape as /api/top, after saving the score
//                  (the board shows the hamster's name; without one the account name)
// The PIN is stored only as a salted PBKDF2 hash. After 8 wrong PINs the account locks for 15 minutes.

const ALLOWED_ORIGINS = ["https://wielandschwarz.github.io", "http://localhost:8765"];
const MAX_BODY = 200000;
const MAX_FAILS = 8;
const LOCK_MS = 15 * 60 * 1000;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function reply(origin, status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });
}

function cleanName(name) {
  if (typeof name !== "string") return null;
  const display = name.trim().replace(/\s+/g, " ");
  if (display.length < 2 || display.length > 20) return null;
  if (!/^[\p{L}\p{N} _.-]+$/u.test(display)) return null;
  return { display, key: display.toLowerCase() };
}

function validPin(pin) { return typeof pin === "string" && /^\d{4}$/.test(pin); }

function toHex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }
function fromHex(hex) { return new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16))); }

async function hashPin(pin, saltHex) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromHex(saltHex), iterations: 5000, hash: "SHA-256" }, key, 256);
  return toHex(bits);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function merge(stored, incoming) {
  const seen = Array.from(new Set([...(stored.seen || []), ...(Array.isArray(incoming.seen) ? incoming.seen : [])]))
    .filter(x => typeof x === "string" && x.length < 30).slice(0, 200);
  let state = stored.state || null, stateUpdated = stored.stateUpdated || 0;
  const inUpdated = Number(incoming.stateUpdated) || 0;
  if (incoming.state && typeof incoming.state === "object" && inUpdated > stateUpdated) {
    state = incoming.state; stateUpdated = inUpdated;
  }
  return { seen, state, stateUpdated };
}

async function checkAccount(env, row, pin, now) {
  if (row.locked_until > now) return { error: "locked", status: 429, until: row.locked_until };
  const hash = await hashPin(pin, row.pin_salt);
  if (!safeEqual(hash, row.pin_hash)) {
    const failed = row.failed + 1;
    const locked = failed >= MAX_FAILS ? now + LOCK_MS : 0;
    await env.DB.prepare("UPDATE accounts SET failed = ?, locked_until = ? WHERE name_key = ?")
      .bind(locked ? 0 : failed, locked, row.name_key).run();
    return { error: locked ? "locked" : "wrong_pin", status: locked ? 429 : 401, until: locked || undefined };
  }
  if (row.failed) await env.DB.prepare("UPDATE accounts SET failed = 0 WHERE name_key = ?").bind(row.name_key).run();
  return null;
}

// ---------- Bestenliste der Minispiele (Tabelle "scores", siehe schema.sql)
const GAMES = { obstsalat: { max: 3000, gapMs: 40000 } };   // höchster glaubwürdiger Wert, Mindestabstand zwischen zwei Runden

function cleanHamster(n) {                                      // the hamster's name as shown on the board
  if (typeof n !== "string") return null;
  const v = n.trim().replace(/\s+/g, " ");
  if (v.length < 1 || v.length > 20 || !/^[\p{L}\p{N} _.'-]+$/u.test(v)) return null;
  return v;
}

async function topList(env, game, nameKey) {
  const rows = (await env.DB.prepare("SELECT name_key, display_name, best FROM scores WHERE game = ? AND best > 0 ORDER BY best DESC, updated ASC LIMIT 10")
    .bind(game).all()).results || [];
  const total = (await env.DB.prepare("SELECT COUNT(*) AS n FROM scores WHERE game = ? AND best > 0").bind(game).first()).n;
  let me = null;
  if (nameKey) {
    const mine = await env.DB.prepare("SELECT display_name, best, updated FROM scores WHERE game = ? AND name_key = ?").bind(game, nameKey).first();
    if (mine && mine.best > 0) {
      const rank = (await env.DB.prepare("SELECT COUNT(*) AS n FROM scores WHERE game = ? AND (best > ? OR (best = ? AND updated < ?))")
        .bind(game, mine.best, mine.best, mine.updated).first()).n + 1;
      me = { name: mine.display_name, score: mine.best, rank };
    }
  }
  return { ok: true, rows: rows.map(r => ({ name: r.display_name, score: r.best, me: !!nameKey && r.name_key === nameKey })), me, total };
}

async function scores(path, body, env, origin) {
  const game = typeof body.game === "string" && GAMES[body.game] ? body.game : null;
  if (!game) return reply(origin, 400, { ok: false, error: "bad_game" });
  const name = cleanName(body.name);
  if (path === "/api/top") return reply(origin, 200, await topList(env, game, name && name.key));

  if (!name) return reply(origin, 400, { ok: false, error: "bad_name" });
  if (!validPin(body.pin)) return reply(origin, 400, { ok: false, error: "bad_pin" });
  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 0 || score > GAMES[game].max) return reply(origin, 400, { ok: false, error: "bad_score" });
  const now = Date.now();
  const row = await env.DB.prepare("SELECT * FROM accounts WHERE name_key = ?").bind(name.key).first();
  if (!row) return reply(origin, 404, { ok: false, error: "no_account" });
  const err = await checkAccount(env, row, body.pin, now);
  if (err) return reply(origin, err.status, { ok: false, error: err.error, until: err.until });

  const prev = await env.DB.prepare("SELECT best, last_at FROM scores WHERE game = ? AND name_key = ?").bind(game, name.key).first();
  if (!prev || now - prev.last_at >= GAMES[game].gapMs) {                 // too many rounds in a row are ignored, the list still comes back
    await env.DB.prepare(
      "INSERT INTO scores (game, name_key, display_name, best, runs, last_at, updated) VALUES (?, ?, ?, ?, 1, ?, ?) " +
      "ON CONFLICT (game, name_key) DO UPDATE SET display_name = excluded.display_name, runs = runs + 1, last_at = excluded.last_at, " +
      "updated = CASE WHEN excluded.best > best THEN excluded.updated ELSE updated END, best = MAX(best, excluded.best)")
      .bind(game, name.key, cleanHamster(body.hamster) || row.display_name, score, now, now).run();
  }
  return reply(origin, 200, await topList(env, game, name.key));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url);
    if (request.method !== "POST" || !["/api/login", "/api/save", "/api/top", "/api/score"].includes(url.pathname)) {
      return reply(origin, 404, { ok: false, error: "not_found" });
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(origin, 413, { ok: false, error: "too_large" });
    let body;
    try { body = JSON.parse(raw); } catch (e) { return reply(origin, 400, { ok: false, error: "bad_json" }); }
    if (url.pathname === "/api/top" || url.pathname === "/api/score") return scores(url.pathname, body, env, origin);

    const name = cleanName(body.name);
    if (!name) return reply(origin, 400, { ok: false, error: "bad_name" });
    if (!validPin(body.pin)) return reply(origin, 400, { ok: false, error: "bad_pin" });
    const now = Date.now();

    let row = await env.DB.prepare("SELECT * FROM accounts WHERE name_key = ?").bind(name.key).first();

    if (url.pathname === "/api/login") {
      if (!row) {
        if (!body.create) return reply(origin, 404, { ok: false, error: "no_account" });
        const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
        const hash = await hashPin(body.pin, salt);
        const data = merge({}, body);
        await env.DB.prepare("INSERT INTO accounts (name_key, display_name, pin_salt, pin_hash, data, updated, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .bind(name.key, name.display, salt, hash, JSON.stringify(data), now, now).run();
        return reply(origin, 200, { ok: true, created: true, name: name.display, ...data });
      }
      if (body.create) return reply(origin, 409, { ok: false, error: "name_taken" });
      const err = await checkAccount(env, row, body.pin, now);
      if (err) return reply(origin, err.status, { ok: false, error: err.error, until: err.until });
      return reply(origin, 200, { ok: true, name: row.display_name, ...JSON.parse(row.data) });
    }

    // /api/save
    if (!row) return reply(origin, 404, { ok: false, error: "no_account" });
    const err = await checkAccount(env, row, body.pin, now);
    if (err) return reply(origin, err.status, { ok: false, error: err.error, until: err.until });
    const data = merge(JSON.parse(row.data), body);
    await env.DB.prepare("UPDATE accounts SET data = ?, updated = ? WHERE name_key = ?").bind(JSON.stringify(data), now, name.key).run();
    return reply(origin, 200, { ok: true, name: row.display_name, ...data });
  }
};
