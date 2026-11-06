# builds ham2/diele.json from assets-neu/wohnzimmer-diele (the approved "tuer-sage" layout)
import json, base64, io
from PIL import Image
A='/home/claude/sudoku-repo/assets-neu/wohnzimmer-diele/'
OUT='/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/ham2/diele.json'
lay=json.load(open(A+'layout_landhaus.json'))['varianten']['tuer-sage']
W=342; back=Image.new('RGBA',(W,135),(0,0,0,0))
def png(p): return Image.open(A+p).convert('RGBA')
def url(im): b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
# the wainscot of the hall (from diele_flaechen: only the panelling, wallpaper and floor come from the game)
df=png('teile/tuer-sage/diele_flaechen.png')
r0=None
for y in range(40,100):
    if df.getpixel((10,y))[:3]==(0x3a,0x24,0x14) or sum(df.getpixel((10,y))[:3])<300: r0=y; break
r1=r0
while r1<134 and sum(df.getpixel((10,r1))[:3])<560: r1+=1
print('wainscot rows', r0, r1)
wc=df.crop((0,r0,92,r1)); wain=Image.new('RGBA',(W,135),(0,0,0,0)); wain.alpha_composite(wc,(0,r0))
skip={'haustuer','teppich','uhr','pinnwand','schiffsbild','regal','lampe','sessel','grammophon','grammophon_moebel','geranie'}
def shadow(x,w,bottom):
    sh=Image.new('RGBA',(w+2,3),(0,0,0,32)); back.alpha_composite(sh,(x-1,bottom-1))
for t in lay['teile']:
    if t['name'] in skip: continue
    im=png(t['datei'])
    if t['name']=='fenster':   # clear glass: the real garden shows through
        px=im.load()
        for y in range(5,37):
            for x in range(6,44):
                c='%02x%02x%02x'%px[x,y][:3]
                if c not in ('3a2414','fff8ec','ffffff','e6dccb'): px[x,y]=(0,0,0,0)
    if t.get('schatten'): shadow(t['x'],t['w'],t['unten'])
    back.alpha_composite(im,(t['x'],t['y']))
# shadow under the record cabinet (the gramophone itself is a choosable piece)
shadow(202,34,106)
back.save('back.png')
# the gramophone as furniture: horn on top of the cabinet, one piece 40x69, four colours
def svgpaths(im):
    px=im.load(); w,h=im.size; runs={}
    for y in range(h):
        x=0
        while x<w:
            p=px[x,y]
            if p[3]<128: x+=1; continue
            c='#%02x%02x%02x'%p[:3]; x2=x
            while x2+1<w and px[x2+1,y][3]>=128 and '#%02x%02x%02x'%px[x2+1,y][:3]==c: x2+=1
            runs.setdefault(c,[]).append('M%d %dh%dv1h-%dz'%(x,y,x2-x+1,x2-x+1)); x=x2+1
    return ''.join('<path fill="%s" d="%s"/>'%(c,''.join(d)) for c,d in runs.items())
gram=[]
for gid,nm in [('messing','Grammophon Messing'),('kupfer','Grammophon Kupfer'),('gruen','Grammophon Tannengrün'),('kirsch','Grammophon Kirschrot')]:
    top=png('teile/grammophon4-'+gid+'/grammophon.png'); cab=png('teile/grammophon4-'+gid+'/grammophon_moebel.png')
    g=Image.new('RGBA',(40,69),(0,0,0,0)); g.alpha_composite(cab,(1,45)); g.alpha_composite(top,(0,0))
    gram.append({'id':gid,'name':nm,'w':40,'h':69,'svg':svgpaths(g)})
    if gid=='messing': g.save('gram_messing.png')
ch=json.load(open(A+'sessel/chairs_neu.json'))
chairs={k:{'id':v['id'],'name':v['name'],'w':int(v['w']),'h':int(v['h']),'seat':int(v['seat']),'svg':v['svg']} for k,v in ch.items()}
bo=json.load(open(A+'boeden2/boeden_auswahl.json'))
floors=[dict(v) for v in bo['wohnraum'].values()]; dfloors=[dict(v) for v in bo['diele'].values()]
tp=json.load(open(A+'tapeten/tapeten_neu.json')); walls=[dict(v) for v in tp.values()]
fa=json.load(open(A+'tapeten/farben.json'))
json.dump({'back':url(back),'wain':url(wain),'gram':gram,'chairs':chairs,'floor':floors,'dfloor':dfloors,'wall':walls,'farben':fa},open(OUT,'w'))
print('floors',[f['id'] for f in floors],'dfloors',[f['id'] for f in dfloors],'walls',[w['id'] for w in walls])
