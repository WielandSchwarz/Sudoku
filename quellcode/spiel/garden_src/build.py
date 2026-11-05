import re, json
D='/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/'
s=open(D+'v3_backup.html').read()
# css
a=s.index('/* scene */'); b=s.index('/* needs */')
s=s[:a]+open(D+'scene.css').read()+'\n'+s[b:]
s=s.replace('.actions { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));','.actions { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));')
# scene html
a=s.index('  <div class="scene" id="scene">'); b=s.index('  <div class="needs" id="needs">')
s=s[:a]+open(D+'scene.html').read()+'\n'+s[b:]
# remove wheel button
s=re.sub(r'\s*<button type="button" class="act" id="a-wheel">.*?</button>','',s,flags=re.S)
s=s.replace('viewBox="0 0 32 31"','viewBox="0 0 48 46"')
# demo texts
s=s.replace('<p>Oben siehst du den neuen Startbildschirm. Der Sudoku-Knopf öffnet in der App dein Sudoku, hier zeigt er nur einen Hinweis.</p>',
 '<p>Oben siehst du den neuen Startbildschirm. Der Sudoku-Knopf öffnet in der App dein Sudoku, hier zeigt er nur einen Hinweis.</p>\n    <p>Lass den Hamster ein paar Minuten in Ruhe, dann putzt er sich, schnuppert am Regal, schaut aus dem Fenster oder macht es sich im Sessel bequem. Tippe auch die Möbel und das Fenster an.</p>')

s=s.replace('Probier es mit „1 Stunde glücklich“ (zweimal) und dann „Sudoku gelöst“.</p>','Probier es mit „1 Stunde glücklich“ (zweimal) und dann „Sudoku gelöst“. Du siehst dann den Gelöst-Bildschirm aus der Sudoku-App, und der Hamster packt das Paket in seinem Zimmer aus.</p>')
import re as _re
s=_re.sub(r'<p>Möbel gibt es fürs Sudoku-Lösen.*?</p>','<p>Garten: Tippe im Zimmer auf die Terrassentür, dann geht dein Hamster hinaus. Zurück ins Haus geht es mit einem Tipp auf den linken Rand des Gartens. Im Beet pflanzt du Samen, gießt sie und erntest, die Ernte findest du dann unter Füttern. Samen gibt es fürs Sudoku-Lösen.</p><p>Ist dein Hamster glücklich, bringt das nächste gelöste Sudoku ein Paket. Die Schnecke liefert es ins Zimmer. Probier es mit „Glücklich machen“ und dann „Sudoku gelöst“.</p>',s,flags=_re.S)
s=s.replace('<button type="button" class="btn" id="d-happy">1 Stunde glücklich</button>','<button type="button" class="btn" id="d-happy">Glücklich machen</button>')
# --- v5 changes: no small descriptions, no name suggestions, floor tab, stoppable music ---
s=re.sub(r'<small[^>]*>.*?</small>','',s)
s=re.sub(r'\s*<div class="suggest">.*?</div>','',s,flags=re.S)
s=s.replace('<span class="dot" id="start-dot" hidden></span>','<span class="dot" id="start-dot" hidden></span><span class="pkg-badge" id="start-pkg" hidden></span>')
s=s.replace('<span>Weiterspielen: Mittel · 8:42</span>','').replace('<span id="start-ham-state">Wartet darauf, dass du ihm einen Namen gibst.</span>','')
s=s.replace('<button type="button" class="tab" data-cat="wall">Tapete</button>','<button type="button" class="tab" data-cat="plant">Pflanze</button>\n      <button type="button" class="tab" data-cat="wall">Tapete</button>\n      <button type="button" class="tab" data-cat="floor">Boden</button>')
s=s.replace('<button type="button" class="tab" data-cat="floor">Boden</button>','<button type="button" class="tab" data-cat="floor">Boden</button>'+''.join('\n      <button type="button" class="tab" data-cat="%s">%s</button>' % c for c in (('fence','Zaun'),('shed','Gartenhaus'),('bench','Bank'),('gplant','Pflanzen'),('path','Weg'),('bed','Beet'))))
s=s.replace('<div class="catalog" id="catalog" hidden>','<div class="garden-panel" id="garden-panel" hidden></div>\n  <div class="catalog" id="catalog" hidden>')
s=s.replace('<button type="button" class="btn" id="d-unlock">Alle Möbel freischalten</button>','<button type="button" class="btn" id="d-unlock">Alle Möbel freischalten</button>\n      <button type="button" class="btn" id="d-season">Jahreszeit wechseln</button>\n      <button type="button" class="btn" id="d-visit">Besuch kommen lassen</button>')
s=s.replace('.tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));','.tabs { display: grid; border-radius: 16px !important; grid-template-columns: repeat(3, minmax(0, 1fr));')
s=s.replace('.track-stop { font: inherit; font-size: 0.85rem; border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; padding: 6px; align-self: center; }',
 '.track-head { margin: 6px 2px 0; font-size: 0.78rem; font-weight: 700; color: var(--muted); }\n.track-stop { font: inherit; font-size: 0.9rem; font-weight: 700; border: 0; border-radius: 10px; background: var(--orange); color: #fff; cursor: pointer; padding: 11px; min-height: 44px; }\n#name-input.nudge { animation: nudge .35s steps(4); box-shadow: 0 0 0 2px var(--orange); }\n@keyframes nudge { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }')
# script
old=s[s.index('<script>'):s.index('</script>')+9]
music=old[old.index('  // ---- pixel music'):old.index('  function wheel()')]
music=music.replace('''    music.t = setInterval(function () {
      if (!s.music) return;
      fx("note", "0 0 5 7", 30 + Math.random() * 40, 30 + Math.random() * 20, true);
      s.fun = clamp(s.fun + 1.5); s.energy = clamp(s.energy - 0.3); renderNeeds(); updateThought();
    }, Math.max(500, 120000 / tr.bpm));
    refresh(); renderTracks();''','''    music.t = setInterval(function () {
      if (!s.music) return;
      s.fun = clamp(s.fun + 1.5); s.energy = clamp(s.energy - 0.3); renderNeeds();
    }, Math.max(500, 120000 / tr.bpm));
    if (busy && interruptible()) interrupt();
    thought.className = "thought"; startDance(tr); refresh(); renderTracks();''')
music=music.replace('function stopMusic() { clearInterval(music.t); stopAudio(); }','function stopMusic() { clearInterval(music.t); clearInterval(beatT); stopAudio(); if (!busy && !s.asleep) settle(); }')
music=music.replace('current = tr; ham.style.setProperty("--beat", (60 / tr.bpm) + "s");','current = tr;')
music=music.replace('function music() {\n    if (busy || s.asleep) return;','function music() {\n    if (s.asleep) return;\n    if (s.music) { s.music = false; stopMusic(); document.getElementById("tracks").hidden = true; say("Musik aus."); refresh(); return; }')
music=re.sub(r"\+ '</b><small>' \+ t\.mood \+ ' · ' \+ t\.bpm \+ ' bpm</small></button>'", "+ '</b></button>'", music)
music=music.replace('Musik ausschalten</button>','Musik aus</button>')
music=music.replace('say("Musik aus."); refresh(); renderTracks(); });','say("Musik aus."); document.getElementById("tracks").hidden = true; refresh(); });')
assert 'if (s.music) { s.music = false' in music and '<small>' not in music
music=music.replace('" }\n  ];\n  var SEMI','" }'+open(D+'newtracks.js').read()+'\n  ];\n  var SEMI')
assert 'Wuselwalzer' in music
music=music.replace('fresh: true, ','').replace("i === 0 ? '<p class=\"track-head\">Bisher</p>' : ''","''")
music=music.replace("el.innerHTML = TRACKS.map(function (t) {\n      return '<button","el.innerHTML = TRACKS.map(function (t, i) {\n      return (t.fresh && !TRACKS[i - 1].fresh ? '<p class=\"track-head\">Neue Vorschläge</p>' : i === 0 ? '<p class=\"track-head\">Bisher</p>' : '') + '<button")
assert 'track-head' in music
assert 'startDance' in music and 'clearInterval(beatT)' in music
# note icon in track list uses ART.note
music=music.replace("ART.note","A.note").replace('viewBox="0 0 5 7">\' + A.note','viewBox="0 0 5 7">\' + A.note')
js=open(D+'app.js').read()
H=json.load(open(D+'ham2.json'))
for k in [k for k in list(H['art']) if re.match(r'(walk|bwalk|stand|curl|sniff)\d*$',k)]: H['art'].pop(k); H['size'].pop(k)
F=json.load(open(D+'furn2.json')); F['plant']=json.load(open(D+'plants.json')); P=json.load(open(D+'props.json')); P.pop('bottle',None)
def J(o): return json.dumps(o,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
GD=json.load(open(D+'garden.json'))
ANI=json.load(open(D+'animals.json')); ANI={k:v for k,v in ANI.items() if k in ('chick','frog','turtle','igel','hare','mouse','badger','fox','robin','squirrel','tit','ladybug')}
js=js.replace('/*GARDEN*/',open(D+'garden.js').read()).replace('/*GARDENDATA*/',J(GD)).replace('/*ANIMALSDATA*/',J(ANI)).replace('/*SNAILSVG*/',open(D+'snail.svg.txt').read().replace("'","\\'"))
js=js.replace('/*HAM*/',J(H)).replace('/*FURN*/',J(F)).replace('/*PROPS*/',J(P)).replace('/*MUSIC*/',music).replace('/*FURNJS*/',open(D+'furn.js').read())
import os
if os.environ.get('HAMTEST'): js=js.replace('/*TESTHOOK*/','window.__act=function(n){ act(n, {window:lookOutside, read:readBook, binky:binky}[n]); };')
import base64
js=js.replace('/*BOARDIMG*/','data:image/jpeg;base64,'+base64.b64encode(open(D+'solved_board.jpg','rb').read()).decode())
s=s.replace(old,'<script>\n'+js+'\n</script>')
s=('<meta charset="utf-8">\n'+s if not s.startswith('<meta charset') else s); s=s.replace('</style>','.track-head { margin: 6px 2px 0; font-size: 0.78rem; font-weight: 700; color: var(--muted); }\n</style>',1); s=s.replace('Laufrad-Galopp','Pfötchen-Galopp').replace('name: "Schlummerlied"','name: "Kuschelnest-Wiegenlied"').replace('name: "Sonnenblumenfeld"','name: "Sonnenblumen-Schmaus"').replace('name: "Regentropfen"','name: "Schnurrhaar-Regen"').replace('name: "Morgenkaffee"','name: "Frühstück im Napf"').replace('name: "Wuselwalzer"','name: "Backentaschen-Walzer"').replace('name: "Mondschein-Spieluhr"','name: "Mondschein im Hamsterbau"').replace('name: "Sudoku-Swing"','name: "Nager-Swing"').replace('name: "Kirschblüte"','name: "Kirschkern-Melodie"').replace('name: "Wolkenreise"','name: "Hamsterträume"').replace('name: "Kuschel-Bossa"','name: "Knabber-Bossa"').replace('.bottle { z-index: 2; }\n','')
open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html'),'w').write(s)
print(len(s)//1024,'KB')
_h=open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html')).read()
_h=_h.replace("""i === 0 ? '<p class="track-head">Bisher</p>' : ''""","''")
open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html'),'w').write(_h)
