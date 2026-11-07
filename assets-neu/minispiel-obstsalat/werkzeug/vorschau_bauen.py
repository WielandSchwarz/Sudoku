"""Builds the playable preview vorschau.html (art, CSS and JS inlined) with switches for season, time of day and weather."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
O = os.path.abspath(os.path.join(HERE, '..'))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(O, 'vorschau.html')
art = open(os.path.join(O, 'grafik', 'obstsalat_art.json')).read()
css = open(os.path.join(O, 'obstsalat.css')).read()
js = open(os.path.join(O, 'obstsalat.js')).read()
page = '''<title>Obstsalat</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Layout: the game frame on top like in the app, the preview switches below it */
:root { --bg: #fbf3e6; --card: #fff8ec; --ink: #3a2414; --muted: #8a6e58; --accent: #e8650c; --line: #3a2414; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #211a15; --card: #352a21; --ink: #f4e6d4; --muted: #bba48e; --accent: #ff8a3a; --line: #120c08; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #211a15; --card: #352a21; --ink: #f4e6d4; --muted: #bba48e; --accent: #ff8a3a; --line: #120c08; color-scheme: dark }
body { background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.wrap { max-width: 720px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 16px 32px; display: flex; flex-direction: column; gap: 16px; }
.game { box-shadow: 0 0 0 3px var(--line); }
.ctl { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.row > span { width: 92px; color: var(--muted); font-size: 13px; font-weight: 600; }
.row button { all: unset; cursor: pointer; padding: 6px 10px; background: var(--card); color: var(--ink); box-shadow: inset 0 0 0 2px var(--line); font-size: 14px; font-weight: 600; }
.row button[aria-pressed="true"] { background: var(--accent); color: #fff; }
.row input { all: unset; padding: 6px 10px; background: var(--card); color: var(--ink); box-shadow: inset 0 0 0 2px var(--line); font-size: 14px; font-weight: 600; width: 180px; max-width: 60vw; }
.row input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.row button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
''' + css + '''
</style>
<div class="wrap">
  <div class="game" id="game"></div>
  <div class="ctl" aria-label="Vorschau-Einstellungen">
    <div class="row" data-k="season"><span>Jahreszeit</span><button type="button" data-v="fruehling">Frühling</button><button type="button" data-v="sommer">Sommer</button><button type="button" data-v="herbst">Herbst</button><button type="button" data-v="winter">Winter</button></div>
    <div class="row" data-k="time"><span>Tageszeit</span><button type="button" data-v="auto">Uhrzeit</button><button type="button" data-v="tag">Tag</button><button type="button" data-v="abend">Abend</button><button type="button" data-v="nacht">Nacht</button></div>
    <label class="row name"><span>Hamstername</span><input id="hname" type="text" maxlength="20" autocomplete="off" placeholder="Name"></label>
    <div class="row" data-k="weather"><span>Wetter</span><button type="button" data-v="sonne">Sonne</button><button type="button" data-v="wolken">Wolken</button><button type="button" data-v="regen">Regen</button><button type="button" data-v="schnee">Schnee</button></div>
  </div>
</div>
<script>
var ART = ''' + art + ''';
''' + js + '''
(function () {
  var m = new Date().getMonth(), season = m < 2 || m === 11 ? "winter" : m < 5 ? "fruehling" : m < 8 ? "sommer" : "herbst";
  var env = { season: season, time: "auto", weather: "sonne" };
  // the hamster's name (in the app it is the name set for the hamster); here a field below the game, kept in this browser
  var hname = document.getElementById("hname");
  try { hname.value = localStorage.getItem("obstsalat-hamster") || ""; } catch (e) {}
  hname.addEventListener("input", function () { try { localStorage.setItem("obstsalat-hamster", hname.value.trim()); } catch (e) {} });
  function hamster() { return hname.value.trim().replace(/\\s+/g, " ").slice(0, 20); }
  // leaderboard in the preview: the page's shared database, one row per person (rekorde/<id> = { best, runs, at, hamster }); without a hamster name the profile name
  var caps = window.claude && window.claude.use ? Promise.all([window.claude.use("db"), window.claude.use("user")]) : Promise.resolve([null, null]);
  function withTimeout(p) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, 10000); })]); }
  var board = {
    submit: function (score) {
      return withTimeout(caps.then(function (c) {
        var db = c[0], user = c[1]; if (!db || !user) throw new Error("offline");
        return user.id().then(function (id) {
          if (!id) throw new Error("no id");
          var ref = db.collection("rekorde").doc(id);
          return ref.get().then(function (snap) {
            var old = snap.exists ? snap.data() : null, best = Math.max(old ? +old.best || 0 : 0, score);
            if (!old && score <= 0) return;                // nothing to save yet
            return ref.set({ best: best, runs: (old ? +old.runs || 0 : 0) + 1, at: old && best === +old.best ? +old.at || Date.now() : Date.now(), hamster: hamster() || (old && old.hamster) || "" });
          }).then(function () {
            return db.collection("rekorde").orderBy("best", "desc").limit(50).get();
          }).then(function (q) {
            var docs = q.docs.map(function (d) { var v = d.data() || {}; return { id: d.id, best: +v.best || 0, at: +v.at || 0, hamster: typeof v.hamster === "string" ? v.hamster.slice(0, 20) : "" }; })
              .filter(function (d) { return d.best > 0; })
              .sort(function (a, b) { return b.best - a.best || a.at - b.at; });
            return user.profiles(docs.map(function (d) { return d.id; })).then(function (ps) {
              var rows = docs.map(function (d) { return { name: d.hamster || (ps[d.id] && ps[d.id].name) || "Hamster", score: d.best, me: d.id === id }; });
              var rank = 0; rows.forEach(function (r, i) { if (r.me) rank = i + 1; });
              return { rows: rows, rank: rank || null };
            });
          });
        });
      }));
    }
  };
  var game = mountObstsalat(document.getElementById("game"), ART, Object.assign({ board: board, get hamsterName() { return hamster(); } }, env)); window.__os = game;
  function mark() { document.querySelectorAll(".row").forEach(function (r) { r.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", env[r.dataset.k] === b.dataset.v ? "true" : "false"); }); }); }
  document.querySelectorAll(".row button").forEach(function (b) {
    b.addEventListener("click", function () { var k = b.parentElement.dataset.k; env[k] = b.dataset.v; game.setEnv(env); mark(); });
  });
  mark();
})();
</script>
'''
open(out, 'w').write(page)
print(out, len(page) // 1024, 'KB')
