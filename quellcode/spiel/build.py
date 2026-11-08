import re, json, os
D='/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/'
_IC=json.load(open(D+'../mock2/icons.json'))
def _WDX():
    w=json.load(open(D+'../wild/wilddecor.json')); w['art']['nut']['svg']=_half('nut')
    if os.environ.get('GARDEN2','1')=='1': w['art'].update(json.load(open(D+'meadow26.json')))
    return w
def _half(k): return '<g transform="scale(.5)">'+_IC[k]['svg']+'</g>'
def _icon(k, cls='px'): v=_IC[k]; return '<svg class="%s" viewBox="0 0 %d %d">%s</svg>'%(cls,v['w'],v['h'],v['svg'])
s=open(D+'v3_backup.html').read()
# css
a=s.index('/* scene */'); b=s.index('/* needs */')
import base64 as _b64
_SK=json.load(open(D+'../mock2/room3.json'))['sky']
def _uri(svg,w,h): return 'url(data:image/svg+xml;base64,'+_b64.b64encode(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges">%s</svg>'%(w,h,svg)).encode()).decode()+')'
_SKYCSS='''
/* pixel sun, moon and clouds */
.sky .sun, .g-sun { background: %s center/contain no-repeat !important; border-radius: 0 !important; box-shadow: none !important; }
.sky.sky-eve .sun, .g-sky.g-eve .g-sun { background-image: %s !important; }
.sky.sky-night .sun, .g-moon { background: %s center/contain no-repeat !important; border-radius: 0 !important; box-shadow: none !important; }
.sky i, .g-cloud { background: %s center/contain no-repeat !important; border-radius: 0 !important; height: auto !important; aspect-ratio: 22 / 9; opacity: 1; }
.sky i:nth-child(2n), .g-cloud:nth-child(2n) { background-image: %s !important; }
.sky.sky-night i { background: #f2d36a !important; aspect-ratio: 1; }
.g-sky.g-night .g-cloud { opacity: .25; }
''' % (_uri(_SK['sun'],16,16), _uri(_SK['sunEve'],16,16), _uri(_SK['moon'],16,16), _uri(_SK['cloudA'],22,9), _uri(_SK['cloudB'],22,9))
s=s[:a]+open(D+'scene.css').read()+_SKYCSS+(open(D+'extras.css').read() if not os.environ.get('NOEXTRAS') else '')+'\n'+s[b:]
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
s=s.replace('<button type="button" class="tab" data-cat="floor">Boden</button>','<button type="button" class="tab" data-cat="floor">Boden</button>'+''.join('\n      <button type="button" class="tab" data-cat="%s">%s</button>' % c for c in (('dfloor','Dielenboden'),('gram','Musik'),('door','Tür'),('lamp','Lampe'),('rug','Teppich'),('meadow','Wiese'),('deco','Deko'),('bed','Beet'))))
s=s.replace('<button type="button" class="btn" id="d-unlock">Alle Möbel freischalten</button>','<button type="button" class="btn" id="d-unlock">Alle Möbel freischalten</button>\n      <button type="button" class="btn" id="d-season">Jahreszeit wechseln</button>\n      <button type="button" class="btn" id="d-visit">Besuch kommen lassen</button>'+('\n      <button type="button" class="btn" id="d-weather">Wetter wechseln</button>\n      <button type="button" class="btn" id="d-fest">Fest wechseln</button>\n      <button type="button" class="btn" id="d-harvest">Ernte geben (zum Kochen)</button>' if not os.environ.get('NOEXTRAS') else ''))
s=s.replace('.tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));','.tabs { display: grid; border-radius: 16px !important; grid-template-columns: repeat(3, minmax(0, 1fr));')
s=s.replace('.track-stop { font: inherit; font-size: 0.85rem; border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; padding: 6px; align-self: center; }',
 '.track-head { margin: 6px 2px 0; font-size: 0.78rem; font-weight: 700; color: var(--muted); }\n.track-stop { font: inherit; font-size: 0.9rem; font-weight: 700; border: 0; border-radius: 10px; background: var(--orange); color: #fff; cursor: pointer; padding: 11px; min-height: 44px; }\n#name-input.nudge { animation: nudge .35s steps(4); box-shadow: 0 0 0 2px var(--orange); }\n@keyframes nudge { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }')
# script
for _id,_k in (('a-feed','i_feed'),('a-pet','i_pet'),('a-sleep','i_sleep'),('a-music','i_music')):
    s=re.sub(r'(<button type="button" class="act" id="'+_id+r'"[^>]*>)<svg.*?</svg>', lambda m: m.group(1)+_icon(_k), s, count=1, flags=re.S)
for _f in ('seed','carrot','apple'):
    s=re.sub(r'(<button type="button" class="food-btn" data-food="'+_f+r'">)<svg.*?</svg>', lambda m: m.group(1)+_icon(_f), s, count=1, flags=re.S)
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
F=json.load(open(D+'furn2.json')); _NC=json.load(open(D+'../mock2/chairs_new.json')); F['chair']=[dict(c, **_NC[c['id']]) if c['id'] in _NC else c for c in F['chair']]; F['plant']=json.load(open(D+'plants.json')); F['shelf']=json.load(open(D+'shelves3.json'));
_R3=json.load(open(D+'../mock2/room3.json')); F['door']=_R3['door']; F['lamp']=_R3['lamp']; F['rug']=_R3['rug']; F['floor']=_R3['floor']

import os as _os
if True:  # approved detail art
    _N=json.load(open(D+'../mock2/interior2.json'))
    F['chair'][0]['svg']=_N['chair_wing_red']['svg']; F['clock'][0]['svg']=_N['clock_round']['svg']
    F['wall'][0]['tile']=_N['wall_cream']['tile']; F['floor'][0]['tile']=_N['floor_planks']['tile']
if True:  # the living room with the hall (assets-neu/wohnzimmer-diele, approved): new chairs, floors for room and hall, ten more wallpapers, the gramophone
    _DI=json.load(open(D+'diele.json'))
    F['chair']=[dict(c, **{k: _DI['chairs'][c['id']][k] for k in ('name','w','h','seat','svg')}) if c['id'] in _DI['chairs'] else c for c in F['chair']]
    F['floor']=_DI['floor']; F['dfloor']=_DI['dfloor']; F['wall']=F['wall']+_DI['wall']; F['gram']=[dict(g, crafted=True) if g['id']!='messing' else dict(g, name='Grammophon') for g in _DI['gram']]+json.load(open(D+'musik.json'))   # colours of the gramophone are a colour choice now, plus eight more music pieces
P=json.load(open(D+'props.json')); P.pop('bottle',None)
if True:  # approved detail art
    for _k in ('lamp_on','lamp_off','bowl','rug'): P[_k]['svg']=_N[_k]['svg']
for _k in ('seed','carrot','apple'): H['art'][_k]=_half(_k)
def J(o): return json.dumps(o,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
GD=json.load(open(D+'garden.json'))
if os.environ.get('GARDEN2','1')=='1': GD['art'].update(json.load(open(D+'beds2.json')))
for _k in ('f_strawberry','f_cucumber','f_dandelion','f_sunflower'): GD['art'][_k]['svg']=_half(_k)
ANI=json.load(open(D+'animals.json')); ANI={k:v for k,v in ANI.items() if k in ('chick','frog','turtle','igel','hare','mouse','badger','fox','robin','squirrel','tit')}
ANI.update({k:v for k,v in json.load(open(D+'../mock2/animals3.json')).items() if k in ANI})
_EXTRAS = not os.environ.get('NOEXTRAS')
def _steamjs():
    js = open(D+'steam.js').read().replace('/*STEAMART*/', open(D+'steam.json').read())
    mk = '  // ===================== souvenirs of the voyages'
    cap = open(D+'captain.js').read() + (open(D+'captain2.js').read() + open(D+'rowing.js').read()).replace('/*KPHAM*/', json.dumps((lambda _h: {'art': {k: _h['art'][k] for k in ['bwalk0','bwalk1','bwalk2','bwalk3','stand0','stand1']}, 'size': {k: _h['size'][k] for k in ['bwalk0','bwalk1','bwalk2','bwalk3','stand0','stand1']}})(json.load(open(D+'ham2.json'))))) if os.environ.get('CAPTAIN','1') == '1' else ''
    if os.environ.get('POSTCARDS','1') == '1': return js.replace('/*PCART*/', open(D+'postcards.json', encoding='utf-8').read()) + cap
    return (js[:js.index(mk)] if mk in js else js) + cap
_gjs = open(D+'garden.js').read() + (open(D+'extras.js').read().replace('/*EXTRASART*/', open(D+'../mock2/extras.json').read()).replace('/*STORMBG*/', open(D+'../mock2/stormbg.json').read()) + open(D+'pixfont.js').read() + open(D+'house.js').read().replace('/*HOUSEART*/', open(D+'../mock2/house.json').read()) + open(D+'words.js').read().replace('/*WORDSDATA*/', open(D+'../wlde/words_de.json', encoding='utf-8').read()).replace('/*WORDANI*/', json.dumps({k:v for k,v in json.load(open(D+'../mock2/animals3.json')).items() if k in ('igel','hare','squirrel','robin','tit','fox','mouse','badger','owl','otter')}, separators=(',',':'))) + open(D+'tiles.js').read() + open(D+'va.js').read() + open(D+'life.js').read().replace('/*RIPPLE*/', open(D+'ripple.json').read()).replace('/*LIFEART*/', open(D+'../mock2/life.json').read()).replace('/*PONDART*/', open(D+'../mock2/pond.json').read()).replace('/*CRAFTFURN*/', open(D+'../mock2/craft_furn.json').read()).replace('/*CROPS2*/', open(D+'../mock2/crops2.json').read()).replace('/*WORLDFOOD*/', open(D+'../mock2/worldfood.json').read()).replace('/*ITEMBIG*/', open(D+'../mock2/itembig.json').read()).replace('/*MEADOW52*/', open(D+'meadow52.json').read()).replace('/*ALLANI*/', open(D+'../mock2/animals3.json').read()) + open(D+'plant.js').read().replace('/*PLANTZOOM*/', open(D+'../mock2/plantzoom.json').read()) + (open(D+'garden2.js').read().replace('/*GH2*/', open(D+'gh2.json').read()) if os.environ.get('GARDEN2','1')=='1' else '') + (open(D+'bee.js').read().replace('/*BEEART*/', open(D+'bee.json').read()).replace('/*BEEZOOM*/', open(D+'beezoom.json').read()) if os.environ.get('BEE','1')=='1' else '') + (open(D+'frog.js').read().replace('/*FROGART*/', open(D+'frog.json').read()) if os.environ.get('FROG','1')=='1' else '') + (open(D+'battleship.js').read().replace('/*BSART*/', open(D+'bs.json').read()) if os.environ.get('BSHIP','1')=='1' else '') + ((open(D+'bedx.js').read() + open(D+'aquarium.js').read()).replace('/*BEDX*/', open(D+'bedx.json').read()) if os.environ.get('BEDX','1')=='1' else '') + (open(D+'social.js').read() if os.environ.get('SOCIAL','1')=='1' else '') + (open(D+'kitchen2.js').read().replace('/*KITCHEN2*/', open(D+'kitchen2.json').read()) if os.environ.get('KITCHEN2','1')=='1' else '') + (open(D+'cafe.js').read().replace('/*CAFEART*/', open(D+'cafe.json').read()).replace('/*HATS*/', open(D+'hats.json').read()).replace('/*CFTHEMES*/', open(D+'cfthemes.json').read()).replace('/*CAFEOUT*/', open(D+'cafeout.json').read()).replace('/*CFPLANTS*/', open(D+'cfplants.json').read() if os.environ.get('CFPLANTS','1')=='1' else '{}') + open(D+'teamix.js').read().replace('/*TEAART*/', open(D+'teaart.json').read()).replace('/*FESTZOOM*/', open(D+'festzoom.json').read()) + open(D+'coffee.js').read().replace('/*COFFEEART*/', open(D+'coffeeart.json').read()) + open(D+'bake.js').read().replace('/*BAKEART*/', json.dumps(dict(json.load(open(D+'bakeart.json')), **json.load(open(D+'fruit.json'))['bake']))) + open(D+'guests.js').read() if os.environ.get('CAFE','1')=='1' else '') + (open(D+'worldmap.js').read().replace('/*WORLDMAP*/', open(D+'worldmap.json').read()) if os.environ.get('WORLD','1')=='1' else '') + open(D+'fishing.js').read().replace('/*FISHGAME*/', open(D+'fishgame.json').read()) + open(D+'fruit.js').read().replace('/*FRUIT*/', json.dumps({k: v for k, v in json.load(open(D+'fruit.json')).items() if k != 'bake'})) + open(D+'seedcap.js').read() + (open(D+'mushroom.js').read().replace('/*MUSHGAME*/', open(D+'mush.json').read()) if os.environ.get('MUSH','1')=='1' else '') + (_steamjs() if os.environ.get('STEAM','1')=='1' else '') + (open(D+'wide.js').read().replace('/*DIELE*/', json.dumps({k: v for k, v in json.load(open(D+'diele.json')).items() if k in ('back','wain','farben')})).replace('/*WALLCOL*/', open(D+'wallcol.js').read()).replace('/*WIDEART*/', open(D+'wide.json').read()).replace('/*WBHALF*/', open(D+'wbhalf.json').read()) if os.environ.get('WIDE','1')=='1' else '') + (open(D+'minis.js').read().replace('/*MINISART*/', open(D+'minis.json').read()) + open(D+'dish2.js').read() if os.environ.get('MINIS','1')=='1' else '') + (open(D+'plant2.js').read() if os.environ.get('PLANT2','1')=='1' else '') + (open(D+'cafe2.js').read() if os.environ.get('CAFE2','1')=='1' and os.environ.get('CAFE','1')=='1' else '') + open(D+'interact.js').read() + open(D+'lake.js').read() + open(D+'osgame.js').read() + open(D+'osboard.js').read() + open(D+'obst.js').read().replace('/*OBSTART*/', open(D+'obst.json').read()) + open(D+'pipes.js').read().replace('/*PIPELOGIC*/', open(D+'pipelogic.js').read()).replace('/*RPLEVELS*/', open(D+'rplevels.json').read()).replace('/*RPSTATIONS*/', open(D+'rpstations.json').read()).replace('/*BENCHART*/', json.dumps(open(D+'bench.svg.txt').read())).replace('/*TOOLART*/', json.dumps(open(D+'toolbox.svg.txt').read())) + open(D+'sound.js').read() if _EXTRAS else '')
js=js.replace('/*GARDEN*/',_gjs).replace('/*GARDENDATA*/',J(GD)).replace('/*OUTFIT*/',open(D+'outfit.json').read()).replace('/*WILDBG*/',J(json.load(open(D+'../wild/wildbg.json')))).replace('/*WILDDECOR*/',J(_WDX())).replace('/*ANIMALSDATA*/',J(ANI)).replace('/*SNAILSVG*/',open(D+'snail.svg.txt').read().replace("'","\\'"))
js=js.replace('/*HAM*/',J(H)).replace('/*FURN*/',J(F)).replace('/*PROPS*/',J(P)).replace('/*MUSIC*/',music).replace('/*FURNJS*/',open(D+'furn.js').read())
import os
if os.environ.get('HAMTEST'): js=js.replace('/*GTEST*/','window.__dbg=function(){ return {busy:busy,cur:cur,place:place2,asleep:s.asleep,op:ham.style.opacity}; }; window.__SZ=SZ; window.__pending=function(){return home.pending;}; window.__pickTest=function(){ home.pending=null; return pickGift(); }; window.__setPend=function(c,i){ home.pending={cat:c,id:i,delivered:true}; renderPackage(); }; window.__open=function(){ openPackage(); }; window.__home=home; window.__FOOD=FOOD; window.__A=A; window.__DISHES=DISHES; window.__plant=function(a,prog){ a.forEach(function(c,i){ garden.plots[i]={crop:c,prog:prog,wetUntil:0,t:Date.now()}; }); renderBed(); }; window.__gvisit=function(id){ if (visitor) { visitor.el.remove(); visitor=null; } spawnVisitor(true,id); }; window.__garden=garden; window.__tick=tickGarden;').replace('/*TESTHOOK*/','window.__act=function(n){ act(n, {window:lookOutside, read:readBook, binky:binky}[n]); };')
import base64
if os.environ.get('COOK2','1')=='1':
    _h='function head(i, txt) { $p("pov-step").textContent = "Schritt " + (i + 1) + " von " + plan.length; $p("pov-text").textContent = txt; }'
    assert _h in js
    js=js.replace(_h,'function head(i, txt) { var nm = { cut: "Schneiden", add: "Zutaten rein", stir: "Umrühren", heat: "Erhitzen", mash: "Zerdrücken", knead: "Kneten", bake: "Backen", season: "Abschmecken", skim: "Abschöpfen", gel: "Gelierprobe", planer: "Hobeln", shake: "Schütteln" }[plan[i][0]] || "Verzieren"; $p("pov-step").textContent = (i + 1) + " · " + nm; $p("pov-text").textContent = txt; pov.classList.toggle("c2-gauge", plan[i][0] === "heat"); }')
    _st='<span class="pov-stars">\' + "★★★".slice(0, stars) + \'<s>\' + "★★★".slice(stars) + \'</s></span>'
    assert _st in js, "stars"
    _S1='<svg viewBox="0 0 9 9" aria-hidden="true" shape-rendering="crispEdges"><path fill="#3a2414" d="M4 0h1v2h1v1h3v1H8v1H7v2h1v2H7V8H6V7H3v1H2v1H1V7h1V5H1V4H0V3h3V2h1z"/><path fill="#ffd34a" d="M4 2h1v2h3v1H7v2H6V6H3v1H2V5H1V4h3z"/><path fill="#fff2a0" d="M4 2h1v2H4z"/></svg>'
    _S0=_S1.replace('#ffd34a','#e6d4ba').replace('#fff2a0','#e6d4ba')
    js=js.replace(_st,'<span class="pov-stars">\' + [0, 1, 2].map(function (q) { return q < stars ? \''+_S1+'\' : \''+_S0+'\'; }).join("") + \'</span>')
js=js.replace('/*BOARDIMG*/','data:image/jpeg;base64,'+base64.b64encode(open(D+'solved_board.jpg','rb').read()).decode())
s=s.replace(old,'<script>\n'+('window.__EXTRAS = true;\n' if not os.environ.get('NOEXTRAS') else '')+js+'\n</script>')
s=('<meta charset="utf-8">\n'+s if not s.startswith('<meta charset') else s); s=s.replace('</style>','.track-head { margin: 6px 2px 0; font-size: 0.78rem; font-weight: 700; color: var(--muted); }\n</style>',1); s=s.replace('Laufrad-Galopp','Pfötchen-Galopp').replace('name: "Schlummerlied"','name: "Kuschelnest-Wiegenlied"').replace('name: "Sonnenblumenfeld"','name: "Sonnenblumen-Schmaus"').replace('name: "Regentropfen"','name: "Schnurrhaar-Regen"').replace('name: "Morgenkaffee"','name: "Frühstück im Napf"').replace('name: "Wuselwalzer"','name: "Backentaschen-Walzer"').replace('name: "Mondschein-Spieluhr"','name: "Mondschein im Hamsterbau"').replace('name: "Sudoku-Swing"','name: "Nager-Swing"').replace('name: "Kirschblüte"','name: "Kirschkern-Melodie"').replace('name: "Wolkenreise"','name: "Hamsterträume"').replace('name: "Kuschel-Bossa"','name: "Knabber-Bossa"').replace('.bottle { z-index: 2; }\n','')
if not os.environ.get('NOEXTRAS'):
    s=s.replace('</style>', open(D+'words.css').read()+open(D+'tiles.css').read()+open(D+'life.css').read()+open(D+'va.css').read()+open(D+'fishing.css').read()+(open(D+'mush.css').read() if os.environ.get('MUSH','1')=='1' else '')+(open(D+'steam.css').read()+open(D+'captain.css').read() if os.environ.get('STEAM','1')=='1' else '')+(open(D+'wide.css').read() if os.environ.get('WIDE','1')=='1' else '')+open(D+'pixui.css').read()+(open(D+'cook2.css').read() if os.environ.get('COOK2','1')=='1' else '')+(open(D+'worldmap.css').read() if os.environ.get('WORLD','1')=='1' else '')+(open(D+'cafe.css').read() if os.environ.get('CAFE','1')=='1' else '')+(open(D+'social.css').read() if os.environ.get('SOCIAL','1')=='1' else '')+(open(D+'bedx.css').read() if os.environ.get('BEDX','1')=='1' else '')+(open(D+'garden2.css').read() if os.environ.get('GARDEN2','1')=='1' else '')+(open(D+'bee.css').read() if os.environ.get('BEE','1')=='1' else '')+(open(D+'frog.css').read() if os.environ.get('FROG','1')=='1' else '')+(open(D+'battleship.css').read() if os.environ.get('BSHIP','1')=='1' else '')+open(D+'obst.css').read()+'\n</style>', 1)
    _gw = '    <button type="button" class="choice" id="go-hamster">'
    assert _gw in s
    s=s.replace(_gw, '    <button type="button" class="choice" id="go-words">\n      <span class="pic"><span class="mini-letters"><i>M</i><i>A</i><i>U</i><i>S</i><i class="g">E</i><i>L</i><i>O</i><i>C</i><i>H</i></span></span>\n      <span class="txt"><strong>Mumpsch</strong></span>\n    </button>\n'+_gw, 1)
    _ns = '  <section class="naming" id="scr-name" hidden>'
    assert _ns in s
    s=s.replace(_ns, '  <section class="words" id="scr-words" hidden></section>\n  <section class="words tiles" id="scr-tiles" hidden></section>\n\n'+_ns, 1)
    s=s.replace(_gw, '    <button type="button" class="choice" id="go-tiles">\n      <span class="pic"><span class="mini-tiles"><i style="background:#e8554a"></i><i></i><i style="background:#4a8ad8"></i><i style="background:#f2c230"></i><i style="background:#e8554a"></i><i></i><i></i><i style="background:#5aaa4a"></i><i style="background:#4a8ad8"></i></span></span>\n      <span class="txt"><strong>Farbklecks</strong></span>\n    </button>\n'+_gw, 1)
# the hamster card comes first on the start screen
_hm = _re.search(r'    <button type="button" class="choice" id="go-hamster">.*?</button>\n', s, _re.S)
if _hm:
    _blk = _hm.group(0); s = s.replace(_blk, '', 1)
    _first = s.index('    <button type="button" class="choice"')
    s = s[:_first] + _blk + s[_first:]
open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html'),'w').write(s)
print(len(s)//1024,'KB')
_h=open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html')).read()
_h=_h.replace("""i === 0 ? '<p class="track-head">Bisher</p>' : ''""","''")
open(os.environ.get('HAMOUT','/home/claude/hamster-preview.html'),'w').write(_h)
