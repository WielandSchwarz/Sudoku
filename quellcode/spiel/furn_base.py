from lib import G
from PIL import Image, ImageDraw
import json, math, re
PAL={}
def C(name,hexv): PAL[name]=hexv; return name
K=C('K','#2b1d12')
items={'chair':[],'clock':[],'shelf':[],'wall':[]}
def paths(g):
    return ''.join(f'<path fill="{PAL[k]}" d="{"".join(v)}"></path>' for k,v in g.paths().items())
FACES=[]
def add(cat,id,name,g,extra=None,outline=True):
    d=dict(id=id,name=name,raw=g,faces=list(FACES)); d.update(extra or {})
    FACES.clear(); items[cat].append(d); return g
def on(g,c,fn):
    for y in range(g.h):
        for x in range(g.w):
            if g.p[y][x] is not None and fn(x,y,g.p[y][x]): g.p[y][x]=c

# ---------- ARMCHAIRS (24 x 21) ----------
def wing(main,dark,light,leg,pattern=None,tufted=False):
    g=G(24,21)
    g.rect(5,1,18,13,main); g.px(None,[]) 
    g.p[1][5]=None; g.p[1][18]=None
    g.rect(2,4,5,15,main); g.rect(18,4,21,15,main); g.p[4][2]=None; g.p[4][21]=None
    g.rect(1,10,5,16,main); g.rect(18,10,22,16,main)
    g.rect(6,12,17,15,light)
    g.rect(2,16,21,18,dark)
    if pattern=='check': on(g,dark,lambda x,y,c: c==main and (x//2+y//2)%2==0)
    if pattern=='stripe': on(g,dark,lambda x,y,c: c==main and x%3==0)
    if tufted: g.px(dark,[(8,4),(12,4),(16,4),(10,7),(14,7),(8,10),(12,10),(16,10)])
    g.px(leg,[(4,19),(4,20),(19,19),(19,20)])
    return g
red=C('r1','#c8463c'); redd=C('r2','#9a3028'); redl=C('r3','#e4766a'); wood=C('w1','#8a5a30'); woodl=C('w2','#b07a44'); woodd=C('w3','#5e3a1c')
add('chair','wing_red','Roter Ohrensessel',wing(red,redd,redl,wood))
grn=C('g1','#5e9a5a'); grnd=C('g2','#3e7040'); grnl=C('g3','#8cc488')
add('chair','wing_check','Karierter Ohrensessel',wing(grn,grnd,grnl,woodd,pattern='check'))
pink=C('p1','#e89aaa'); pinkd=C('p2','#c4687e'); pinkl=C('p3','#f6c4cc')
add('chair','velvet','Rosa Samtsessel',wing(pink,pinkd,pinkl,C('gd','#d9a43a'),tufted=True))
# club chair
g=G(24,21); brown=C('b1','#9a5a32'); brownd=C('b2','#6e3a1c'); brownl=C('b3','#c4844e')
g.ell(12,8,9.6,7,brown); g.ell(4,13,3.4,4.8,brown); g.ell(20,13,3.4,4.8,brown); g.rect(3,14,20,18,brownd); g.ell(12,13.4,7.4,2.6,brownl)
g.px(brownl,[(7,5),(8,4),(9,4)]); g.px(woodd,[(5,19),(18,19)])
add('chair','club','Leder-Clubsessel',g)
# beanbag
g=G(24,21); blue=C('u1','#4f86c6'); blued=C('u2','#36639a'); bluel=C('u3','#86b2e2')
g.ell(12,14.6,10.6,6,blue); g.ell(12,9,7.4,6,blue); g.ell(9,8,2.6,1.8,bluel); g.ell(12,14,5,2,blued); g.shade_edge(blue,blued,'bottom')
add('chair','beanbag','Blauer Sitzsack',g)
# rocking chair
g=G(24,21); cushion=C('c1','#f0c84a')
for x in (6,9,12,15): g.rect(x,1,x+1,11,woodl)
g.rect(5,0,18,1,wood); g.rect(5,1,5,12,wood); g.rect(18,1,18,12,wood)
g.rect(6,9,17,11,cushion); g.rect(4,12,19,13,wood)
g.px(wood,[(5,14),(5,15),(6,16),(6,17),(18,14),(18,15),(17,16),(17,17)])
g.px(woodd,[(1,17),(2,18),(3,19),(4,19),(5,19),(6,19),(7,19),(8,19),(9,19),(10,19),(11,19),(12,19),(13,19),(14,19),(15,19),(16,19),(17,19),(18,19),(19,19),(20,19),(21,18),(22,17)])
add('chair','rocking','Schaukelstuhl',g)
# egg chair
g=G(24,21); white=C('e1','#f4f1ea'); whited=C('e2','#d4cfc4'); org=C('o1','#e8762c')
g.ell(12,9.6,10,9.6,white); g.ell(13,10.6,6.6,7.2,org); g.shade_edge(white,whited,'right'); g.rect(11,19,12,19,whited); g.rect(8,20,15,20,whited)
add('chair','egg','Ei-Sessel',g)
# strandkorb
g=G(24,21); wick=C('k1','#d8b47a'); wickd=C('k2','#b08a50'); st1=C('s1','#3e6eb4'); st2=C('s2','#f4f1ea')
g.rect(2,2,21,19,wick); g.p[2][2]=None; g.p[2][21]=None; g.rect(3,1,20,1,wick)
on(g,wickd,lambda x,y,c: c==wick and y%2==0)
g.rect(5,3,18,11,st1); on(g,st2,lambda x,y,c: c==st1 and x%4<2)
g.rect(5,12,18,13,C('c2','#f4d7a0'))
add('chair','strandkorb','Strandkorb',g)
# peacock rattan
g=G(24,21); rat=C('t1','#caa26a'); ratd=C('t2','#9a7440'); cush=C('c3','#7fb2a2')
g.ell(12,9,11,9,rat)
on(g,ratd,lambda x,y,c: c==rat and int((math.degrees(math.atan2(y+.5-12,x+.5-12))+360)/14)%2==0)
g.ell(12,13,6,2.4,cush); g.rect(9,15,14,16,rat); g.rect(10,17,13,18,ratd); g.rect(7,19,16,20,rat)
add('chair','peacock','Pfauen-Korbsessel',g)
# mini sofa
g=G(24,21); mint=C('m1','#7cc4ae'); mintd=C('m2','#4e9a84'); mintl=C('m3','#b4e2d4')
g.rect(1,6,22,15,mint); g.rect(0,10,3,17,mint); g.rect(20,10,23,17,mint); g.rect(4,12,11,15,mintl); g.rect(12,12,19,15,mintl); g.rect(1,16,22,17,mintd)
g.px(woodd,[(2,18),(2,19),(21,18),(21,19)]); g.px(mintd,[(11,8),(12,8)])
add('chair','sofa','Mintgrünes Sofa',g)

# ---------- CLOCKS ----------
cw=C('f1','#fffaf0'); gold=C('gl','#e0b040'); goldd=C('gk','#b08420')
def face(g,cx,cy,r,rim,facec=cw):
    FACES.append((cx,cy,r-1.6,rim,facec)); g.ell(cx,cy,r,r,rim); g.ell(cx,cy,r-1.6,r-1.6,facec)
    for dx,dy in ((0,-1),(1,0),(0,1),(-1,0)):
        x=int(cx-.5+dx*(r-2.6)); y=int(cy-.5+dy*(r-2.6)); g.px(K,[(x,y)])
# 1 round
g=G(16,16); face(g,8,8,7.6,C('rm','#4a3a2e')); add('clock','round','Runde Wanduhr',g,{'cx':8,'cy':8,'r':5.2})
# 2 cuckoo
g=G(16,26); g.poly([(8,0),(16,6),(0,6)],woodd); g.rect(2,6,13,17,wood); g.px(woodl,[(3,7),(4,7)]); g.rect(7,7,8,8,K); face(g,8,12.5,4.4,woodd)
add('clock','cuckoo','Kuckucksuhr',g,{'cx':8,'cy':12.5,'r':2.8,'pendulum':{'x':8,'y':18,'len':5,'bob':'w3'},'weights':True})
# 3 sunburst
g=G(18,18)
for a in range(0,360,30):
    for rr in (6,7,8):
        x=int(9+rr*math.cos(math.radians(a))); y=int(9+rr*math.sin(math.radians(a))); g.px(gold,[(x,y)])
face(g,9,9,5.4,goldd); add('clock','sunburst','Sonnen-Uhr',g,{'cx':9,'cy':9,'r':3.4})
# 4 regulator
g=G(12,26); g.rect(0,2,11,25,wood); g.poly([(0,2),(6,0),(11,2)],woodd); g.rect(2,13,9,23,C('gs','#cfe4ea')); face(g,6,7.5,4.6,goldd)
add('clock','regulator','Pendeluhr',g,{'cx':6,'cy':7.5,'r':3,'pendulum':{'x':6,'y':13,'len':8,'bob':'gl'}})
# 5 owl clock
g=G(16,20); owl=C('ow','#8a6a48'); owll=C('ol','#c69a62')
g.poly([(2,4),(3,0),(6,3)],owl); g.poly([(14,4),(13,0),(10,3)],owl); g.ell(8,10,7,9.4,owl); g.ell(5.4,6,2.2,2.2,C('oy','#f2c230')); g.ell(10.6,6,2.2,2.2,'oy'); g.px(K,[(5,6),(10,6)]); g.px(C('ob','#e8762c'),[(7,8),(8,8)]); face(g,8,13.4,4.6,owll)
add('clock','owl','Eulen-Uhr',g,{'cx':8,'cy':13.4,'r':3})
# 6 station clock
g=G(16,16); face(g,8,8,7.6,K,C('wh','#ffffff'))
for a in range(0,360,30):
    x=int(8+5.6*math.cos(math.radians(a))); y=int(8+5.6*math.sin(math.radians(a))); g.px(K,[(x,y)])
add('clock','station','Bahnhofsuhr',g,{'cx':8,'cy':8,'r':5,'second':True})
# 7 alarm clock
g=G(16,17); ar=C('ar','#d8463c'); g.ell(3.6,2.6,2.6,2.2,gold); g.ell(12.4,2.6,2.6,2.2,gold); face(g,8,9,6.4,ar); g.px(ar,[(3,15),(12,15),(2,16),(13,16)])
add('clock','alarm','Wecker',g,{'cx':8,'cy':9,'r':4.2})
# 8 wood slice
g=G(16,16); g.ell(8,8,7.6,7.6,C('bk','#6e4a2e')); g.ell(8,8,6.4,6.4,C('wd','#e6c690'))
for rr in (4.6,2.8):
    for y in range(16):
        for x in range(16):
            d=((x+.5-8)**2+(y+.5-8)**2)**.5
            if abs(d-rr)<.5: g.p[y][x]=C('wr','#c9a46a')
add('clock','woodslice','Holzscheiben-Uhr',g,{'cx':8,'cy':8,'r':5})
# 9 mushroom
g=G(16,18); cap=C('mc','#d8463c'); g.ell(8,5,8,5.4,cap); g.rect(0,5,15,6,cap); g.px(cw,[(4,2),(5,2),(10,3),(11,3),(7,1),(2,5),(13,5)]); g.rect(3,7,12,17,C('ms','#f4e6cc')); face(g,8,12,4.2,C('mr','#c9b48a'))
add('clock','mushroom','Pilz-Uhr',g,{'cx':8,'cy':12,'r':2.8})
# 10 star clock
g=G(18,18); star=C('sy','#f2c230'); pts=[]
for i in range(10):
    a=math.radians(-90+i*36); rr=8.8 if i%2==0 else 4.2; pts.append((9+rr*math.cos(a),9.4+rr*math.sin(a)))
g.poly(pts,star); face(g,9,9.6,3.8,C('so','#d89a20'))
add('clock','star','Stern-Uhr',g,{'cx':9,'cy':9.6,'r':2.4})

# ---------- BOOKSHELVES (18 x 26) ----------
BOOKC=['#c8463c','#4f86c6','#5e9a5a','#e0b040','#8a5aa8','#e8762c','#4a3a2e','#d97aa0']
for i,c in enumerate(BOOKC): C(f'bk{i}',c)
def books(g,x0,x1,ybase,hmax,seed,rainbow=False):
    x=x0; i=seed
    while x<=x1:
        w=1 if (i*7)%3 else 2; h=hmax-((i*5)%3)
        c=f'bk{(i if rainbow else (i*3+seed))%8}'
        if x+w-1>x1: break
        g.rect(x,ybase-h+1,x+w-1,ybase,c); x+=w; i+=1
        if (i*11)%9==0 and x<=x1-1: x+=1
def frame(g,wd,wdk,shelves,x0=1,x1=16,top=1,bottom=25):
    g.rect(x0,top,x1,bottom,wdk); g.rect(x0+1,top+1,x1-1,bottom-1,C('in','#4a2e18'))
    for y in shelves: g.rect(x0,y,x1,y,wd)
    g.rect(x0,top,x1,top,wd); g.rect(x0,top,x0,bottom,wd); g.rect(x1,top,x1,bottom,wd); g.rect(x0,bottom,x1,bottom,wd)
def plant(g,x,y):
    g.rect(x,y-1,x+2,y,C('pt','#c9744a')); g.px(C('lf','#5e9a5a'),[(x,y-3),(x+1,y-4),(x+2,y-3),(x+1,y-2),(x-1,y-4),(x+3,y-4)])
def jar(g,x,y,fill):
    g.rect(x,y-3,x+2,y,C('jr','#cfe4ea')); g.rect(x,y-1,x+2,y,fill); g.rect(x,y-4,x+2,y-4,C('jl','#d8463c'))
# 1 small wood
g=G(18,26); frame(g,'w2','w1',[9,17]); books(g,3,14,8,5,1); books(g,3,14,16,5,4); books(g,3,9,24,5,7); plant(g,12,24)
add('shelf','small','Kleines Holzregal',g)
# 2 white with plants
g=G(18,26); C('wt','#f4f1ea'); C('wtd','#d4cfc4'); frame(g,'wt','wtd',[9,17]); PAL['in']='#4a2e18'
plant(g,4,8); plant(g,11,8); books(g,3,9,16,5,2); plant(g,12,16); plant(g,6,24); books(g,10,14,24,4,5)
add('shelf','white','Weißes Pflanzenregal',g)
# 3 dark oak full
g=G(18,26); C('ok','#5a3a22'); C('okd','#3e2614'); frame(g,'ok','okd',[7,13,19]); books(g,3,14,6,4,2); books(g,3,14,12,4,5); books(g,3,14,18,4,1); books(g,3,14,24,4,6)
add('shelf','oak','Volles Eichenregal',g)
# 4 ladder
g=G(18,26)
for y,(a,b) in zip([7,13,19,25],[(5,12),(4,13),(3,14),(2,15)]):
    g.rect(a,y,b,y,'w2'); books(g,a+1,b-1,y-1,4,y)
g.px('w1',[(6-int(y/6),y) for y in range(0,26)]+[(11+int(y/6),y) for y in range(0,26)])
add('shelf','ladder','Leiterregal',g)
# 5 arch
g=G(18,26); frame(g,'w2','w1',[12,19],top=4); g.ell(8.5,5,7.5,4.6,'w1'); g.ell(8.5,5.6,6,3.4,'in'); g.rect(1,4,16,4,'w1'); g.rect(2,5,15,11,'in')
plant(g,7,11); books(g,3,14,18,5,3); books(g,3,14,24,4,6)
add('shelf','arch','Bogenregal',g)
# 6 pantry jars
g=G(18,26); frame(g,'w2','w1',[9,17]); C('sd','#3a2a1e'); C('cr','#e8762c'); C('gr','#e0b040')
for i,x in enumerate((3,7,11)):
    jar(g,x,8,['sd','cr','gr'][i]); jar(g,x,16,['gr','sd','cr'][i]); jar(g,x,24,['cr','gr','sd'][i])
add('shelf','pantry','Vorratsregal',g)
# 7 cube shelf
g=G(18,26); frame(g,'wt','wtd',[9,17]); g.rect(8,1,9,25,'wt')
books(g,3,7,8,5,1); g.ell(12.5,6.4,2,2,C('bl','#4f86c6')); g.rect(3,14,6,16,C('cb','#e0b040')); books(g,10,15,16,5,4); plant(g,3,24); books(g,10,15,24,4,7)
add('shelf','cube','Würfelregal',g)
# 8 rainbow
g=G(18,26); frame(g,'wt','wtd',[9,17]); books(g,3,14,8,5,0,True); books(g,3,14,16,5,0,True); books(g,3,14,24,5,0,True)
add('shelf','rainbow','Regenbogenregal',g)
# 9 crate tower
g=G(18,26); C('cr1','#c9a46a'); C('cr2','#9a7440')
for (x,y) in [(1,18),(8,18),(4,10),(9,2)]:
    g.rect(x,y,x+7,y+7,'cr2'); g.rect(x+1,y+1,x+6,y+6,'cr1'); g.rect(x+1,y+3,x+6,y+3,'cr2')
books(g,2,7,24,4,2); plant(g,10,24); books(g,5,10,16,4,5)
add('shelf','crates','Kistenturm',g)
# 10 tree
g=G(18,26); trunk=C('tr','#7a5230'); g.rect(8,2,10,25,trunk); g.rect(6,24,12,25,trunk)
for y,(a,b) in [(8,(2,8)),(14,(10,16)),(20,(2,8))]:
    g.rect(a,y,b,y,trunk); books(g,a+1,b-1,y-1,4,y)
g.ell(9,3,5,3,C('lv','#6fae4a')); g.px('lv',[(14,13),(15,12),(3,19),(2,18),(3,7),(2,6)])
add('shelf','tree','Baumregal',g)

# ---------- WALLPAPERS (tiles) ----------
def tile(id,name,w,h,bg,dots,scale=4):
    g=G(w,h); g.rect(0,0,w-1,h-1,bg)
    for c,pts in dots: g.px(c,pts)
    items['wall'].append(dict(id=id,name=name,raw=g,w=w*scale,h=h*scale))
C('wc','#fbe9d4'); C('wc2','#f3d9bb')
tile('cream','Creme',8,8,'wc',[('wc2',[(0,0),(4,4)])])
C('mt','#e2f2ea'); C('mt2','#b8dccb'); tile('stripes','Mintstreifen',8,8,'mt',[('mt2',[(x,y) for y in range(8) for x in (0,1)])])
C('pk','#fbe4e8'); C('pk2','#f2b2c0'); tile('dots','Rosa Punkte',8,8,'pk',[('pk2',[(1,1),(2,1),(1,2),(2,2),(5,5),(6,5),(5,6),(6,6)])])
C('bl1','#e4eefa'); C('bl2','#bcd4f0'); C('bl3','#94b8e6'); tile('gingham','Blaues Karo',8,8,'bl1',[('bl2',[(x,y) for y in range(8) for x in range(8) if (x<4)!=(y<4)]),('bl3',[(x,y) for y in range(4) for x in range(4)])])
C('fl','#fff6ec'); C('fp','#f29aa8'); C('fy','#f2c230'); C('fg','#8cc488'); tile('flowers','Blümchen',12,12,'fl',[('fp',[(2,1),(1,2),(3,2),(2,3),(8,7),(7,8),(9,8),(8,9)]),('fy',[(2,2),(8,8)]),('fg',[(2,4),(8,10),(3,5),(9,11)])])
C('sf','#fff1c4'); C('sf2','#f2c230'); C('sf3','#8a5a30'); tile('sunflower','Sonnenblumen',12,12,'sf',[('sf2',[(5,4),(6,4),(4,5),(7,5),(4,6),(7,6),(5,7),(6,7)]),('sf3',[(5,5),(6,5),(5,6),(6,6)]),('fg',[(5,9),(6,10),(5,11)])])
C('nb','#2a3a6a'); C('ns','#f2d36a'); C('nw','#9ab0e6'); tile('stars','Sternennacht',12,12,'nb',[('ns',[(2,2),(1,2),(3,2),(2,1),(2,3),(9,8)]),('nw',[(7,3),(4,9),(10,1)])])
C('pl','#d9b98a'); C('pl2','#c49e6c'); C('pl3','#e6c99e'); tile('planks','Holzpaneele',12,8,'pl',[('pl2',[(0,y) for y in range(8)]+[(6,y) for y in range(8)]),('pl3',[(2,2),(3,2),(8,5),(9,5)])])
C('ht','#fdeef0'); C('hr','#e8768a'); tile('hearts','Herzchen',10,10,'ht',[('hr',[(1,1),(3,1),(0,2),(1,2),(2,2),(3,2),(4,2),(1,3),(2,3),(3,3),(2,4),(6,6),(8,6),(5,7),(6,7),(7,7),(8,7),(9,7),(6,8),(7,8),(8,8),(7,9)])])
C('sk','#dff0fb'); C('cl','#ffffff'); tile('clouds','Wolkenhimmel',16,12,'sk',[('cl',[(2,3),(3,3),(4,3),(1,4),(2,4),(3,4),(4,4),(5,4),(3,2),(10,8),(11,8),(12,8),(9,9),(10,9),(11,9),(12,9),(13,9),(11,7)])])
