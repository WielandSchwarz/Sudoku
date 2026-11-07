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
.row button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
''' + css + '''
</style>
<div class="wrap">
  <div class="game" id="game"></div>
  <div class="ctl" aria-label="Vorschau-Einstellungen">
    <div class="row" data-k="season"><span>Jahreszeit</span><button type="button" data-v="fruehling">Frühling</button><button type="button" data-v="sommer">Sommer</button><button type="button" data-v="herbst">Herbst</button><button type="button" data-v="winter">Winter</button></div>
    <div class="row" data-k="time"><span>Tageszeit</span><button type="button" data-v="auto">Uhrzeit</button><button type="button" data-v="tag">Tag</button><button type="button" data-v="abend">Abend</button><button type="button" data-v="nacht">Nacht</button></div>
    <div class="row" data-k="weather"><span>Wetter</span><button type="button" data-v="sonne">Sonne</button><button type="button" data-v="wolken">Wolken</button><button type="button" data-v="regen">Regen</button><button type="button" data-v="schnee">Schnee</button></div>
  </div>
</div>
<script>
var ART = ''' + art + ''';
''' + js + '''
(function () {
  var m = new Date().getMonth(), season = m < 2 || m === 11 ? "winter" : m < 5 ? "fruehling" : m < 8 ? "sommer" : "herbst";
  var env = { season: season, time: "auto", weather: "sonne" };
  var game = mountObstsalat(document.getElementById("game"), ART, env); window.__os = game;
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
