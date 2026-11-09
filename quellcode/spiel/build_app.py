"""Builds the hamster into the sudoku app.
Input: the built mockup (hamster-preview.html, made by build.py) and /home/claude/sudoku.src.html (the plain sudoku app).
Output: /home/claude/sudoku.html (artifact source), pwa/index.html and Sudoku-offline.html."""
import re, json, os, subprocess
D = '/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/'
H = '/home/claude/'
VERSION = os.environ.get('APPVERSION', '77')
DATE = '09.11.2026'

subprocess.run(['python3', D + 'build.py'], check=True, env=dict({k: v for k, v in os.environ.items() if k != 'NOEXTRAS'}, HAMOUT=D + 'mock_for_app.html', COOK2='1', GARDEN2='1', BEE='1', FROG=os.environ.get('FROG', '0'), BSHIP=os.environ.get('BSHIP', '1'), BEDX=os.environ.get('BEDX', '0'), SOCIAL=os.environ.get('SOCIAL', '0'), CAFE=os.environ.get('CAFE', '0'), WORLD=os.environ.get('WORLD', '0'), KITCHEN2=os.environ.get('KITCHEN2', '0'), CFPLANTS=os.environ.get('CFPLANTS', '0'), POSTCARDS=os.environ.get('POSTCARDS', '0'), WIDE=os.environ.get('WIDE', '0'), MINIS=os.environ.get('MINIS', '0'), PLANT2=os.environ.get('PLANT2', '0'), CAFE2=os.environ.get('CAFE2', '0')))
mock = open(D + 'mock_for_app.html').read()

def rep(s, a, b, count=1):
    assert a in s, 'missing: ' + a[:100]
    return s.replace(a, b, count)

# ---------------- pieces of the mockup ----------------
css = mock[mock.index('<style>') + 7: mock.index('</style>')]
html = mock[mock.index('<div class="page">'): mock.index('<script>')]
js = mock[mock.index('<script>') + 8: mock.rindex('</script>')]
html = re.sub(r'\s*<section class="demo">.*?</section>', '', html, flags=re.S)
html = rep(html, 'class="status" id="status"', 'class="ham-status" id="ham-status"')
html = rep(html, '3 Tage alt · 5 Leckerli', '')
html = rep(html, 'Tippe Krümel an oder streichle mit dem Finger über ihn.', '')
html = rep(html, '<button type="button" class="close" id="ham-close" aria-label="Zurück zur Übersicht">×</button>', '<div class="top-btns"><button type="button" class="close albumbtn" id="ham-album-btn" aria-label="Tier-Album"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="4.5" ry="3.8"/><circle cx="6" cy="10.5" r="1.9"/><circle cx="9.6" cy="6.6" r="1.9"/><circle cx="14.4" cy="6.6" r="1.9"/><circle cx="18" cy="10.5" r="1.9"/></svg></button><button type="button" class="close" id="ham-close" aria-label="Zurück zur Übersicht">×</button></div>')
html += '<div class="ham-album" id="ham-album" hidden><div class="ham-album-card" role="dialog" aria-labelledby="ham-album-title"><div class="ham-album-top"><h2 id="ham-album-title">Tier-Album</h2><button type="button" class="close" id="ham-album-close" aria-label="Album schließen">×</button></div><p class="ham-album-sub"><span id="ham-album-count"></span> · Jeder Besuch im Garten bringt ein Herz, bei 3 Herzen gibt es ein Geschenk.</p><div class="album-grid" id="ham-album-grid"></div></div></div>'
html = '<div id="ham-root">\n' + html + '\n</div>\n'

# ---------------- css: scope everything to #ham-root, rename keyframes ----------------
def blocks(s):
    """split css text into (prelude, body) blocks at top level"""
    out, i, n = [], 0, len(s)
    while i < n:
        j = s.find('{', i)
        if j < 0: break
        depth, k = 1, j + 1
        while depth and k < n:
            if s[k] == '{': depth += 1
            elif s[k] == '}': depth -= 1
            k += 1
        out.append((s[i:j].strip(), s[j + 1:k - 1]))
        i = k
    return out
kf_names = re.findall(r'@keyframes\s+([\w-]+)', css)
def scope_sel(sel):
    sel = sel.strip()
    if not sel: return sel
    if sel.startswith(':root'): return '#ham-root' + sel[5:]
    if sel in ('html', 'body'): return '#ham-root'
    if sel == '*': return '#ham-root *'
    return '#ham-root ' + sel
def scope(s):
    res = []
    for pre, body in blocks(s):
        pre = re.sub(r'/\*.*?\*/', '', pre, flags=re.S).strip()
        if pre.startswith('@keyframes'):
            name = pre.split()[1]
            res.append('@keyframes h-' + name + ' {' + body + '}')
        elif pre.startswith('@font-face'):
            res.append(pre + ' {' + body + '}')
        elif pre.startswith('@media'):
            res.append(pre + ' {' + scope(body) + '}')
        else:
            res.append(', '.join(scope_sel(x) for x in pre.split(',')) + ' {' + body + '}')
    return '\n'.join(res)
css = css.replace('.status {', '.ham-status {')
css = re.sub(r'\.toast \{[^}]*\}', '', css)
scoped = scope(css)
def rename_anim(m):
    val = m.group(2)
    for nme in kf_names:
        val = re.sub(r'(?<![\w-])' + re.escape(nme) + r'(?![\w-])', 'h-' + nme, val)
    return m.group(1) + val
scoped = re.sub(r'(animation(?:-name)?\s*:)([^;}]*)', rename_anim, scoped)
scoped += '\n#ham-root .slot-front.rock > svg { transform-origin: 50% 100%; animation: h-rock 1.6s ease-in-out infinite alternate; }\n#ham-root .slot-front.sway > svg { transform-origin: 50% 100%; animation: h-sway2 2.4s ease-in-out infinite alternate; }\n'

# ---------------- js: app mode ----------------
js = js.replace('document.getElementById("d-', '$id("d-')
js = rep(js, '"use strict";', '"use strict";\n  var DUMMY = document.createElement("div"); function $id(i) { return document.getElementById(i) || DUMMY; }')
js = rep(js, 'statusEl = document.getElementById("status")', 'statusEl = document.getElementById("ham-status")')
js = rep(js, 'function reset() { var name = s && s.name; s = { food: 70, energy: 80, love: 60, fun: 55, asleep: false, music: false, treats: 5, name: name || null }; }',
         'function reset() { var name = s && s.name; s = { food: 70, energy: 80, love: 60, fun: 55, asleep: false, music: false, treats: 3, name: name || null, born: Date.now(), t: Date.now() }; }')
js = rep(js, 'document.getElementById("ham-age").textContent = "3 Tage alt · " + s.treats + " Leckerli";',
         'var days = Math.floor((Date.now() - (s.born || Date.now())) / 86400000); document.getElementById("ham-age").textContent = (days < 1 ? "Neu eingezogen" : days === 1 ? "1 Tag alt" : days + " Tage alt") + " · " + s.treats + (s.treats === 1 ? " Apfel" : " Äpfel"); if (typeof renderCosy === "function" && home) renderCosy();')
# the demo's fast sleep and fake time go away; real time comes from app_mode
js = rep(js, '  setInterval(function () { if (s.asleep) { passHours(0.25); renderNeeds(); } }, 1500);\n', '')
js = rep(js, '  setInterval(function () { passHours(1 / 120); renderNeeds(); if (!busy) updateThought(); }, 30000);\n', '')
js = rep(js, 'document.getElementById("go-sudoku").addEventListener("click", function () { toast("In der App öffnet sich hier dein Sudoku."); });',
         'document.getElementById("go-sudoku").addEventListener("click", function () { window.Nav.show("sudoku"); });')
js = rep(js, 'document.getElementById("go-hamster").addEventListener("click", function () { if (!s.name) openNaming(); else { show("scr-hamster"); refresh(); if (home.pending) later(openPackage, 900); } });',
         'document.getElementById("go-hamster").addEventListener("click", function () { window.Nav.show("hamster"); if (s.name && home.pending) later(openPackage, 900); });')
js = rep(js, 'document.getElementById("ham-close").addEventListener("click", function () { s.music = false; stopMusic(); document.getElementById("tracks").hidden = true; show("scr-start"); });',
         'document.getElementById("ham-close").addEventListener("click", function () { window.Nav.show("home"); });')
js = js.replace('document.body.appendChild(wrap)', 'document.getElementById("ham-root").appendChild(wrap)')
js = rep(js, 'var first = !s.name; s.name = v;', 'var first = !s.name; s.name = v; if (first) { s.born = Date.now(); persistNow(); }')
# chair animations also move the armrests in front of the hamster
js = rep(js, 'if (it && it.id === "rocking") slotEl("chair").classList.add("rock");', 'if (it && it.id === "rocking") chairCls("rock", true);')
js = rep(js, 'if (it && it.id === "egg") slotEl("chair").classList.add("sway");', 'if (it && it.id === "egg") chairCls("sway", true);')
js = rep(js, 'slotEl("chair").classList.remove("rock", "sway");', 'chairCls("rock", false); chairCls("sway", false);')
js = rep(js, 'function slotAnim(cat, cls, ms) { var el = slotEl(cat);', 'function slotAnim(cat, cls, ms) { if (cat === "chair") { var fr = document.getElementById("slot-chair-front"); fr.classList.remove(cls); void fr.offsetWidth; fr.classList.add(cls); if (ms) later(function () { fr.classList.remove(cls); }, ms); } var el = slotEl(cat);')
js = rep(js, 'slotEl("chair").classList.toggle("rock", c && c.id === "rocking"); slotEl("chair").classList.toggle("sway", c && c.id === "egg");', 'chairCls("rock", !!(c && c.id === "rocking")); chairCls("sway", !!(c && c.id === "egg"));')
# happiness line instead of the two-hour streak
a = js.index('  function renderCosy() {'); b = js.index('\n  }\n', a) + 4
js = js[:a] + '''  function renderCosy() {
    var avg = (s.food + s.energy + s.love + s.fun) / 4, happy = isHappy();
    var txt = home.pending ? "Ein Paket wartet auf " + N() : ownedCount() >= 60 ? "Alle Möbel gesammelt" : happy ? N() + " ist glücklich: Das nächste Sudoku bringt ein Paket" : "Ist " + N() + " glücklich, bringt das nächste Sudoku ein Paket";
    document.getElementById("cosy-text").textContent = txt;
    document.getElementById("cosy-count").textContent = ownedCount() + "/60 Möbel";
    document.getElementById("cosy-bar").style.width = Math.min(100, avg / 70 * 100) + "%";
    document.getElementById("cosy-meter").setAttribute("aria-valuenow", Math.round(Math.min(100, avg / 70 * 100)));
  }
''' + js[b:]
js = js.replace('aria-label="Glücklich-Zeit bis zum nächsten Möbelstück"', 'aria-label="Wie glücklich dein Hamster ist"')
html = html.replace('aria-label="Glücklich-Zeit bis zum nächsten Möbelstück" aria-valuemin="0" aria-valuemax="120"', 'aria-label="Wie glücklich dein Hamster ist" aria-valuemin="0" aria-valuemax="100"')
html = html.replace('Leckerli', 'Äpfel')
js = js.replace('Keine Leckerli mehr. Löse ein Sudoku, dann gibt es neue.', 'Keine Äpfel mehr. Löse ein Sudoku, dann gibt es neue.')
# songs: Wieland's choice and names
SONGS = {"polka": "Knusper Knusper", "galopp": "Kleine Pfoten, schnelle Pfoten", "schlummer": "Kuschelnest", "sonne": "Sonnenblumen-Schmaus",
         "kaffee": "Frühstück im Napf", "walzer": "Volle Backentaschen", "spieluhr": "Mondschein im Hamsterbau", "kirsch": "Winter-Schlummer",
         "hoedown": "Happy Hamster", "wolken": "Hamsterträume", "bossa": "Knabber Knabber"}
for drop in ("regen", "swing"):
    m = re.search(r',\s*\{ id: "' + drop + r'".*?\}', js, flags=re.S)
    assert m, drop
    js = js[:m.start()] + js[m.end():]
for tid, name in SONGS.items():
    js, n = re.subn(r'(\{ id: "' + tid + r'",[^}]*?name: ")[^"]*(")', lambda m: m.group(1) + name + m.group(2), js, count=1)
    assert n == 1, tid
# app mode block before the start-up line, and a different start-up
start = js.index('  layoutRoom(); renderRoom();')
js = js[:start] + open(D + 'app_mode.js').read() + '\n  layoutRoom(); renderRoom(); moveTo(SPOT.home.x, SPOT.home.y, 0); front(mood()); renderCosy(); refresh(); show("scr-start"); lastSig = sig(); later(idle, 2500);\n})();\n'
js = js.replace('/*TESTHOOK*/', '')

# ---------------- sudoku side ----------------
src = open(H + 'sudoku.src.html').read()
src = rep(src, '<p class="opt-version">Version 20 · 29.10.2026</p>', '<p class="opt-version">Version ' + VERSION + ' · ' + DATE + '</p>')
# home button and hidden sudoku screen at start
src = rep(src, '<div class="app" id="app">', '<div class="app" id="app" hidden>')
src = rep(src, '.cel {\n  position: absolute; inset: 0;', '.cel {\n  position: absolute; inset: 0; z-index: 5;')   # the celebrating animal sits above the killer cage lines
src = rep(src, '  var account = null, syncing = false, syncTimer = null, lastSync = 0;', '  var account = null, syncing = false, syncTimer = null, lastSync = 0;\n  window.__sudokuAccount = function () { return account; };')
src = rep(src, '''    <h1>Sudoku</h1>''', '''    <div class="title-row"><button type="button" class="iconbtn homebtn" id="home-btn" aria-label="Zum Spielzimmer"><svg viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9.5h11V10"/><path d="M10.5 19.5v-5h3v5"/></svg></button><h1>Sudoku</h1></div>''')
src = rep(src, '''      <p id="result-line"></p>
    </div>''', '''      <p id="result-line"></p>
    </div>
    <div class="rewards" id="rewards" hidden></div>''')
sud_css = '''
#ham-root .top-btns { display: flex; gap: 8px; align-items: center; }
#ham-root .albumbtn { display: flex; align-items: center; justify-content: center; padding: 0; }
#ham-root .albumbtn svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; }
#ham-root .albumbtn svg ellipse, #ham-root .albumbtn svg circle { fill: none; }
.ham-album { position: fixed; inset: 0; z-index: 2000; background: rgba(43, 29, 18, .45); display: flex; align-items: flex-start; justify-content: center; padding: max(16px, env(safe-area-inset-top)) 12px 16px; overflow-y: auto; }
.ham-album[hidden] { display: none; }
.ham-album-card { width: 100%; max-width: 520px; background: var(--line, #fdf2e6); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.25); }
.ham-album-top { display: flex; align-items: center; justify-content: space-between; }
.ham-album-top h2 { margin: 0; font-size: 1.35rem; }
.ham-album-sub { margin: 0; font-size: 0.82rem; line-height: 1.4; color: #7a604f; }
.ham-album-sub span { font-weight: 700; color: var(--chip-on); }
.sticker .hearts { display: flex; gap: 1px; font-size: 0.8rem; line-height: 1; color: #e8554a; letter-spacing: 0; }
.sticker .hearts i { font-style: normal; }
.sticker .hearts i.off { color: #e2d6c8; }
.sticker .hearts b { font-size: 0.75rem; color: #a8463c; margin-left: 2px; font-weight: 700; }
.sticker .hcount { font-size: 0.62rem; color: #7a604f; font-weight: 600; text-align: center; line-height: 1.2; }

.title-row { display: flex; align-items: center; gap: 10px; }
.homebtn { width: 40px; height: 40px; }
.rewards { display: flex; flex-direction: column; gap: 8px; }
.reward { display: flex; align-items: center; gap: 10px; font-size: 0.92rem; background: #fff; border-radius: 12px; padding: 8px 10px; box-shadow: inset 0 0 0 1.5px var(--rule); color: var(--ink); }
.reward .ricon { width: 28px; flex: none; display: flex; justify-content: center; }
.reward .ricon svg { width: 18px; height: auto; shape-rendering: crispEdges; display: block; }
.reward.gift .ricon svg { width: 28px; animation: rw-wob 1.4s ease-in-out infinite; transform-origin: 50% 100%; }
.reward.gift button { flex: none; margin-left: auto; min-height: 38px; padding: 6px 14px; border: 0; border-radius: 10px; background: var(--chip-on); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.reward.dim { color: var(--muted); }
.reward.dim .ricon { filter: grayscale(1) opacity(.5); }
@keyframes rw-wob { 0%, 88%, 100% { transform: none; } 92% { transform: rotate(-6deg); } 96% { transform: rotate(6deg); } }
'''
src = rep(src, '\n</style>', sud_css + '\n/* ===== hamster ===== */\n' + scoped + '\n</style>')
# hamster markup and script go in front of the sudoku app
src = rep(src, '<div class="app" id="app" hidden>', html + '<div class="app" id="app" hidden>')
src = rep(src, '<script>\n(function () {', '<script>\n' + js + '\n</script>\n<script>\n(function () {')
# saving and syncing include the hamster
src = rep(src, 'function snapshotState() { return { game: game, showMistakes: showMistakes, pendingDiff: pendingDiff, pendingKind: pendingKind, autoNotes: autoNotes }; }',
          'function snapshotState() { return { game: game, showMistakes: showMistakes, pendingDiff: pendingDiff, pendingKind: pendingKind, autoNotes: autoNotes, hamster: window.HamsterApp ? window.HamsterApp.exportState() : undefined }; }\n  window.SudokuSave = function () { save(); };\n  window.SudokuSaveQuiet = function () { save(true); };')
src = rep(src, '''        stateUpdated = s.stateUpdated || 0;
      }''', '''        stateUpdated = s.stateUpdated || 0;
        if (s.hamster && window.HamsterApp) { try { window.HamsterApp.importState(s.hamster); } catch (e) {} }
      }''')
src = rep(src, '''  function applyServer(r) {''', '''  function applyServer(r) {
    if (r.state && r.state.hamster && window.HamsterApp) window.HamsterApp.mergeServer(r.state.hamster, r.stateUpdated > stateUpdated);''')
# a solved sudoku feeds the hamster (and maybe brings a package)
src = rep(src, '''    game.done = true;
    sel = null;
    celebrate();''', '''    game.done = true;
    sel = null;
    if (!game.revealed && window.HamsterApp) game.reward = window.HamsterApp.onSolved(game.diff, game.kind);
    celebrate();''')
src = rep(src, '''    document.getElementById("lvl").textContent = DIFFS[game.diff].label;''', '''    renderRewards();
    document.getElementById("lvl").textContent = DIFFS[game.diff].label;''')
src = rep(src, '''  function startNew(diff) {''', '''  function renderRewards() {
    var el = document.getElementById("rewards"), r = game.done && game.reward;
    el.hidden = !r;
    if (!r) return;
    var HA = window.HamsterApp;
    var rows = '<div class="reward"><span class="ricon">' + HA.appleSVG + '</span><span>+' + r.apples + (r.apples === 1 ? " Apfel" : " Äpfel") + ' für ' + esc(r.name) + '</span></div>';
    if (r.gift && HA.hasPending()) rows += '<div class="reward gift"><span class="ricon">' + HA.giftSVG + '</span><span><b>Ein Paket für ' + esc(r.name) + '!</b><br>Es wartet in seinem Zimmer.</span><button type="button" id="r-gift">Öffnen</button></div>';
    else if (!r.gift && !r.all) rows += '<div class="reward dim"><span class="ricon">' + HA.giftSVG + '</span><span>Ist ' + esc(r.name) + ' glücklich, bringt ein Sudoku ein Paket.</span></div>';
    el.innerHTML = rows;
  }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  document.getElementById("rewards").addEventListener("click", function (e) { if (e.target.closest("#r-gift")) window.HamsterApp.openPackageSoon(); });
  document.getElementById("home-btn").addEventListener("click", function () { window.Nav.show("home"); });
  function startNew(diff) {''')
# timer, visitors and keyboard only on the sudoku screen
src = rep(src, 'if (game && !game.done && document.visibilityState === "visible") {', 'if (game && !game.done && document.visibilityState === "visible" && (!window.Nav || window.Nav.current === "sudoku")) {')
src = rep(src, '''  document.addEventListener("keydown", function (e) {
    if (!game) return;''', '''  document.addEventListener("keydown", function (e) {
    if (!game || (window.Nav && window.Nav.current !== "sudoku")) return;''')
src = rep(src, '<title>Sudoku Notebook</title>', '<title>Sudoku & Hamster</title>')
# syncing can never get stuck: a request that hangs (iOS suspends apps in the background) times out, and a new sync may start after 20 s
src = rep(src, """  function post(path, body) {
    return fetch(SYNC_URL + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true })
      .then(function (res) { return res.json().catch(function () { return { ok: false, error: "network" }; }); }, function () { return { ok: false, error: "network" }; });
  }""", """  function post(path, body) {
    var req = fetch(SYNC_URL + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: document.visibilityState === "hidden" })
      .then(function (res) { return res.json().catch(function () { return { ok: false, error: "network" }; }); }, function () { return { ok: false, error: "network" }; });
    return Promise.race([req, new Promise(function (res) { setTimeout(function () { res({ ok: false, error: "network" }); }, 15000); })]);
  }
  var syncStart = 0, SYNC_SEEN = "sudoku-last-sync";
  function showLastSync() {
    var el = document.getElementById("acc-last"), t = 0; try { t = +localStorage.getItem(SYNC_SEEN) || 0; } catch (e) {}
    if (el) el.textContent = t ? "Zuletzt abgeglichen: " + new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + " Uhr" : "";
  }""")
src = rep(src, """    if (!canSync || !account || syncing) return;
    syncing = true; syncDirty = false;""", """    if (!canSync || !account || (syncing && Date.now() - syncStart < 20000)) return;
    syncing = true; syncStart = Date.now(); syncDirty = false;""")
src = rep(src, """      if (r.ok) {
        lastSync = Date.now(); applyServer(r);""", """      if (r.ok) {
        lastSync = Date.now(); try { localStorage.setItem(SYNC_SEEN, String(lastSync)); } catch (e) {} showLastSync(); applyServer(r);""")
src = rep(src, '<p class="acc-text">Angemeldet als <strong id="acc-who"></strong></p>', '<p class="acc-text">Angemeldet als <strong id="acc-who"></strong></p><p class="acc-text" id="acc-last"></p>')
src = rep(src, """    if (account) document.getElementById("acc-who").textContent = account.name;
  }""", """    if (account) document.getElementById("acc-who").textContent = account.name;
    if (typeof showLastSync === "function") showLastSync();
  }""")
# logging in on a device: the account's saved state always wins over whatever this device has (a fresh install must never overwrite it)
src = rep(src, """      renderAccount(); applyServer(r);
      setStatus(r.created""", """      var adopt = !r.created && r.state && typeof r.state === "object";
      if (adopt) stateUpdated = 0;
      renderAccount(); applyServer(r);
      if (adopt) { stateUpdated = r.stateUpdated || 1; save(true); }
      setStatus(r.created""")
src = rep(src, '"Angemeldet. Stand abgeglichen."', '"Angemeldet. Dein Spielstand ist geladen."')
# the account box moves from the sudoku options to the start page, below the games
_a = src.index('    <div class="account" id="account">'); _b = src.index('    <p class="opt-version">')
_acc = src[_a:_b]; src = src[:_a] + src[_b:]
_acc = _acc.replace('<strong class="acc-title">Konto</strong>', '<strong class="acc-title">Dein Konto</strong>').replace('Melde dich an, um Album und Spielstand auf mehreren Geräten zu nutzen.', 'Melde dich an, damit dein Hamster und alle Spielstände auf jedem Gerät da sind.')
_s = src.index('<section class="start" id="scr-start">'); _e = src.index('</section>', _s)
src = src[:_e] + _acc.replace('class="account"', 'class="account acc-start"') + src[_e:]
src = rep(src, '\n</style>', """
.account.acc-start { margin-top: 14px; padding: 16px; border-top: 0; border-radius: 16px; background: var(--soft); box-shadow: inset 0 0 0 1.5px var(--rule); }
.account.acc-start .acc-title { font-size: 1.05rem; }
.account.acc-start .acc-text { font-size: 0.95rem; }
.account.acc-start .acc-btn { font-size: 0.95rem; padding: 10px 16px; }
.account.acc-start .acc-status { font-size: 0.9rem; }
</style>""")

# seed reward row after a solved sudoku
src = rep(src, """    else if (!r.gift && !r.all) rows += '<div class="reward dim">""", """    if (r.seed) rows += '<div class="reward"><span class="ricon">' + HA.seedSVG(r.seed) + '</span><span>Ein Tütchen ' + esc(r.seedName) + '-Samen für den Garten</span></div>';
    if (r.furnName) rows += '<div class="reward"><span class="ricon">' + HA.giftSVG + '</span><span>Neu für dein Zuhause: ' + esc(r.furnName) + '</span></div>';
    if (!r.gift && !r.all) rows += '<div class="reward dim">""")
src = rep(src, """    if (r.gift && HA.hasPending()) rows +=""", """    if (r.gift && HA.hasPending()) rows +=""")
src = rep(src, '''  function renderAlbum() {''', '''  window.SudokuAlbum = function () { renderAlbum("ham-album-grid", "ham-album-count", window.HamsterApp && window.HamsterApp.friendInfo ? window.HamsterApp.friendInfo() : null); };
  function renderAlbum(gridId, countId, fr) {''')
src = rep(src, '''    document.getElementById("album-count").textContent = n + " von " + all.length + " entdeckt";
    var grid = document.getElementById("album-grid");''', '''    document.getElementById(countId || "album-count").textContent = n + " von " + all.length + " entdeckt";
    var grid = document.getElementById(gridId || "album-grid");''')
src = rep(src, '''        '<span>' + (got ? a.name.replace("Papageientaucher", "Papageien\\u00adtaucher") : "???") + '</span></div>';''', '''        '<span>' + (got ? a.name.replace("Papageientaucher", "Papageien\\u00adtaucher") : "???") + '</span>' + (fr && got && fr.visitors.indexOf(a.id) >= 0 ? heartsHTML(fr.friends[a.id] || 0) : "") + '</div>';''')
src = rep(src, '''  var albumBtn = document.getElementById("album-btn"), albumPanel = document.getElementById("album");''', '''  var albumBtn = document.getElementById("album-btn"), albumPanel = document.getElementById("album");
  function heartsHTML(h) {
    var row = "", hs = Math.min(5, h);   // at most five hearts show; more are still counted behind the scenes
    for (var i = 0; i < 5; i++) row += '<i' + (i < hs ? "" : ' class="off"') + '>\u2665</i>';
    return '<span class="hearts" aria-label="' + hs + (hs === 1 ? ' Herz' : ' Herzen') + '">' + row + '</span>';
  }''')
# garden visitors only come once they are in the album
src = rep(src, '  var SEEN_KEY = "sudoku-animals-seen";\n  var seen = {};\n', '  var SEEN_KEY = "sudoku-animals-seen";\n  var seen = {};\n  window.HamsterSeen = function () { return seen; };\n')   # the album's seen list (anchored, so no other 'var seen' is hit)
# album and visiting animals: the detailed drawings, plus the grown-up duck
NEWA = json.load(open(D + '../mock2/animals3.json'))
dec = json.JSONDecoder(); out = []; last = 0
for m in re.finditer(r'(= |\.concat\()\[\{"id"', src):
    st = m.end() - len('[{"id"')
    if st < last: continue
    arr, ln = dec.raw_decode(src[st:])
    for a in arr:
        if a['id'] in NEWA: a['vb'] = NEWA[a['id']]['vb']; a['svg'] = NEWA[a['id']]['svg']
    if any(a['id'] == 'koala' for a in arr):
        arr.append({'id': 'duck', 'name': 'Ente', 'vb': NEWA['duck']['vb'], 'wraps': ['flutter', 'hop-s'], 'say': ['Quak, super gemacht!', 'Das war entenstark!', 'Schnatterhaft gut!'], 'svg': NEWA['duck']['svg']})
    out.append(src[last:st]); out.append(json.dumps(arr, ensure_ascii=False)); last = st + ln
out.append(src[last:]); src = ''.join(out)
assert '"id": "duck"' in src
open(H + 'sudoku.html', 'w').write(src)

# ---------------- pwa and offline wrappers ----------------
body = src.split('\n', 1)[1]   # without the <title> line
first_style_end = body.index('</style>') + len('</style>')
pwa_head = ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
            '<title>Hamster</title><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Hamster"><meta name="theme-color" content="#ffffff">\n')
off_head = ('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>Sudoku Notebook</title>\n')
reset = '\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font-size:14px}</style></head><body>'
pwa = pwa_head + body[:first_style_end] + reset + body[first_style_end:].rstrip('\n') + '\n<script>if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).catch(function(){});}</script></body></html>\n'
off = off_head + body[:first_style_end] + reset + body[first_style_end:].rstrip('\n') + '\n</body></html>\n'
open(H + 'pwa/index.html', 'w').write(pwa)
open(H + 'Sudoku-offline.html', 'w').write(off)
sw = open(H + 'pwa/sw.js').read()
sw = re.sub(r"sudoku-v\d+", 'sudoku-v' + VERSION, sw)
open(H + 'pwa/sw.js', 'w').write(sw)
print('built', len(src) // 1024, 'KB')
