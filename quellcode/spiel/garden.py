from lib import G
import json, math, re, random
from PIL import Image, ImageDraw
pal=dict(K='#3a2414')
def C(n,h): pal[n]=h; return n
# seasonal placeholders, replaced in JS
for n,h in dict(L1='#0a0001',L2='#0a0002',L3='#0a0003',L4='#0a0004',H1='#0a0011',H2='#0a0012',H3='#0a0013',G2='#0a0022',G3='#0a0023',SN='#0a0031').items(): C(n,h)
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
out={}
def keep(name,g,extra=None):
    d=dict(svg=paths(g),w=g.w,h=g.h); d.update(extra or {}); out[name]=d
def tile(name,g):
    out[name]=dict(tile=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {g.w} {g.h}" width="{g.w}" height="{g.h}" shape-rendering="crispEdges">'+paths(g)+'</svg>',w=g.w,h=g.h)
C('wf','#fffaf0'); C('wf2','#e6dccb'); C('wd','#b07a44'); C('wd2','#8a5a30'); C('wd3','#c9955a'); C('wd4','#5e3a1c')
C('st','#a8a8b4'); C('st2','#7e7e8c'); C('st3','#cacad4'); C('wa','#6fb4e6'); C('wa2','#4f94c8'); C('wa3','#a8d8f4')
C('rf','#c8463c'); C('rf2','#9a3028'); C('or','#e8762c'); C('or2','#c25a18'); C('cr','#fff4dc'); C('cr2','#efe2c4')
C('gl','#cfe8f5'); C('gl2','#a8d0e8'); C('gr','#5aa04e'); C('gr2','#3e7c3c'); C('gr3','#8ccc72')
C('pk','#f29aa8'); C('pk2','#d86a80'); C('ye','#ffd34e'); C('ye2','#e0a820'); C('rd','#e8554a'); C('rd2','#b8382f'); C('wh','#ffffff')
C('br','#8a5a30'); C('br2','#5e3a1c'); C('so','#6e4a2e'); C('so2','#4e3220'); C('so3','#8e6644'); C('cu','#5e9a3a'); C('cu2','#3e7a2a')
C('lb','#ffe58a'); C('rope','#d8b47a'); C('rope2','#b08a50'); C('pu','#9a7ad0')

# ---- terrace door in the room (frame + leaf; glass is transparent) ----
fr=G(48,48)
fr.rect(3,1,44,47,'wf'); fr.rect(3,1,44,1,'wf2')
for y in range(4,47):
    for x in range(7,41): fr.p[y][x]=None
fr.rect(3,46,44,47,'wf2'); fr.outline('K'); keep('door_frame',fr)
lf=G(48,48)
lf.rect(7,4,40,46,'wf')
for (x0,y0,x1,y1) in [(10,7,22,18),(25,7,37,18),(10,21,22,30),(25,21,37,30)]:
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): lf.p[y][x]=None
lf.rect(10,33,37,44,'wf2'); lf.rect(12,35,35,42,'wf'); lf.px('wf2',[(12,35),(13,35)])
lf.rect(36,31,38,32,'ye2'); lf.outline('K'); keep('door_leaf',lf)

# ---- house wall with the back door (garden, fixed way home) ----
hw=G(40,96)
hw.rect(0,6,37,95,'cr')
for y in range(10,92,5): hw.rect(0,y,37,y,'cr2')
hw.poly([(0,0),(39,0),(39,8),(0,8)],'rf'); hw.rect(0,7,39,8,'rf2')
for x in range(0,40,5): hw.rect(x,0,x,6,'rf2')
hw.rect(7,48,30,91,'wd2'); hw.rect(9,50,28,91,'wd'); hw.rect(12,53,25,66,'gl'); hw.rect(18,53,19,66,'wf'); hw.rect(12,59,25,60,'wf')
hw.rect(12,70,25,88,'wd3'); hw.px('ye',[(25,76),(26,76)])
hw.rect(4,91,33,95,'st'); hw.rect(4,91,33,91,'st3')
hw.rect(32,52,35,58,'K'); hw.rect(33,53,34,57,'lb')
hw.outline('K'); keep('housewall',hw,{'lampx':33.5,'lampy':55})

# ---- seasonal tree ----
tr=G(60,72)
tr.poly([(27,72),(34,72),(33,50),(38,40),(35,38),(31,46),(29,36),(26,38),(28,50)],'br')
tr.px('br2',[(31,y) for y in range(52,72)])
for cx,cy,rx,ry in [(30,22,22,16),(14,30,10,8),(46,30,11,8),(22,12,11,9),(40,13,11,9)]: tr.ell(cx,cy,rx,ry,'L1')
for cx,cy,rx,ry in [(22,18,6,4),(38,16,5,4),(14,27,4,3)]: tr.ell(cx,cy,rx,ry,'L3')
for x,y in [(34,30),(20,34),(44,26),(26,26),(48,34),(12,34)]: tr.ell(x,y,3,2,'L2')
random.seed(3)
for k in range(16):
    x=random.randint(10,50); y=random.randint(8,38)
    if tr.p[y][x] in ('L1','L2','L3'): tr.p[y][x]='L4'; 
tr.outline('K')
keep('tree',tr)
# ---- hills ----
hl=G(180,40)
for x in range(180):
    h1=int(18+7*math.sin(x/23)+4*math.sin(x/9+1)); h2=int(26+5*math.sin(x/31+2))
    for y in range(h1,40): hl.p[y][x]='H1'
    for y in range(h2,40): hl.p[y][x]='H2'
for x in range(0,180,3):
    y=int(18+7*math.sin(x/23)+4*math.sin(x/9+1))
    if 0<=y<40: hl.p[y][x]='H3'
keep('hills',hl)
# ---- ground tiles ----
gt=G(24,12)
for (x,y) in [(3,4),(4,3),(5,4),(15,9),(16,8),(17,9),(20,2),(9,10)]: gt.p[y][x]='G2'
for (x,y) in [(4,4),(16,9),(10,6),(21,3)]: gt.p[y][x]='G3'
tile('grass',gt)
ft=G(32,20)
for (x,y,c) in [(4,4,'pk'),(18,12,'ye'),(27,5,'wh'),(10,16,'pu'),(23,18,'pk')]:
    ft.px(c,[(x-1,y),(x+1,y),(x,y-1),(x,y+1)]); ft.p[y][x]='ye2' if c!='ye' else 'or'
tile('flowers',ft)
lt=G(28,18)
for (x,y,c) in [(3,3,'or'),(14,9,'rd'),(22,4,'ye2'),(8,14,'or2'),(24,15,'rd2')]:
    lt.px(c,[(x,y),(x+1,y),(x,y+1)])
tile('leaves',lt)
st=G(24,12)
for (x,y) in [(3,4),(15,9),(20,2)]: st.p[y][x]='wa3'
tile('snowtile',st)

# ---- fences (tiles repeating along the width) ----
f=G(10,26)
f.rect(2,3,7,25,'wf'); f.poly([(2,3),(4.5,0),(7,3)],'wf'); f.rect(0,8,9,10,'wf'); f.rect(0,18,9,20,'wf'); f.px('wf2',[(7,y) for y in range(3,26)])
f.px('SN',[(3,0),(4,0),(5,0),(2,1),(6,1),(0,7),(1,7),(2,7),(7,7),(8,7),(9,7)])
f.outline('K'); tile('fence_picket',f)
f=G(16,24)
for x0 in (1,9): f.rect(x0,2,x0+5,23,'wd'); f.px('wd2',[(x0+4,y) for y in range(2,24)]); f.px('wd4',[(x0+2,6),(x0+2,15)])
f.rect(0,7,15,9,'wd3'); f.rect(0,16,15,18,'wd3')
f.px('SN',[(x,1) for x in range(1,7)]+[(x,1) for x in range(9,15)]+[(x,6) for x in range(0,16)])
f.outline('K'); tile('fence_wood',f)
f=G(16,26)
f.ell(8,14,8.5,12.5,'L1'); f.rect(0,12,15,25,'L1')
for (x,y) in [(4,6),(11,9),(6,15),(13,18),(3,21),(9,23)]: f.ell(x,y,2,1.5,'L2')
for (x,y) in [(6,3),(12,6),(3,12)]: f.p[y][x]='L3'
for (x,y) in [(5,10),(12,14),(8,20)]: f.p[y][x]='L4'
f.px('SN',[(x,1) for x in range(4,12)]+[(x,2) for x in range(2,14)])
tile('fence_hedge',f)
FENCES=[('picket','Lattenzaun','fence_picket'),('wood','Holzzaun','fence_wood'),('hedge','Hecke','fence_hedge')]

# ---- sheds ----
def shed_wood():
    g=G(48,46); g.rect(4,18,43,45,'wd')
    for y in range(20,45,4): g.rect(4,y,43,y,'wd2')
    g.poly([(0,20),(24,2),(47,20)],'rf'); g.rect(0,19,47,20,'rf2'); g.rect(17,26,30,45,'wd4'); g.rect(18,27,29,45,'wd3'); g.px('ye',[(27,36)])
    g.rect(34,25,40,31,'gl'); g.rect(37,25,37,31,'wf'); g.rect(6,25,12,31,'gl'); g.rect(9,25,9,31,'wf')
    g.outline('K'); g.px('SN',[(x,int(1+abs(x-24)*0.75)) for x in range(1,47)]+[(x,int(2+abs(x-24)*0.75)) for x in range(3,45)]); return g
def shed_ham():
    g=G(48,46); g.ell(24,32,20,14,'or'); g.rect(4,32,43,45,'or'); g.ell(24,16,22,10,'rf'); g.rect(2,16,45,18,'rf2')
    g.ell(24,38,7,7,'K'); g.rect(17,38,30,45,'K'); g.ell(10,30,3,3,'gl'); g.ell(38,30,3,3,'gl'); g.px('wh',[(9,29),(37,29)])
    g.px('cr',[(15,24),(16,24),(31,25)])
    g.outline('K'); g.px('SN',[(x,y) for x in range(4,44) for y in range(5,9) if ((x+.5-24)/22)**2+((y+.5-16)/10)**2<=1 and ((x+.5-24)/22)**2+((y-.5-16)/10)**2>1]); return g
def shed_glass():
    g=G(48,46); g.rect(4,18,43,45,'gl'); g.poly([(2,19),(24,4),(45,19)],'gl2')
    for x in range(4,44,8): g.rect(x,18,x,45,'wf')
    for y in (18,31,45): g.rect(4,y,43,y,'wf')
    g.px('wf',[(int(2+t*1.47),int(19-t)) for t in range(16)]+[(int(45-t*1.4),int(19-t)) for t in range(16)])
    for x0 in (8,20,32): g.ell(x0+3,38,3,4,'gr'); g.px('rd',[(x0+3,36)])
    g.outline('K'); g.px('SN',[(int(3+t*1.4),int(18-t)) for t in range(15)]+[(int(44-t*1.4),int(18-t)) for t in range(15)]); return g
SHEDS=[('woodshed','Gartenhaus',shed_wood()),('hamhouse','Hamsterhäuschen',shed_ham()),('greenhouse','Gewächshaus',shed_glass())]
# ---- benches ----
def bench():
    g=G(40,24); g.rect(2,6,37,9,'wd'); g.rect(2,11,37,12,'wd'); g.rect(1,14,38,16,'wd3'); g.rect(3,17,5,23,'wd2'); g.rect(34,17,36,23,'wd2'); g.rect(2,4,4,15,'wd2'); g.rect(35,4,37,15,'wd2')
    g.px('SN',[(x,5) for x in range(2,38)]+[(x,13) for x in range(1,39)]); g.outline('K'); return g
def hammock():
    g=G(54,32); g.rect(2,2,4,31,'wd2'); g.rect(49,2,51,31,'wd2')
    for x in range(5,49):
        y=int(9+ (1-((x-27)/22)**2)*10); g.rect(x,y,x,y+2,'rope'); 
        if x%3==0: g.p[y+1][x]='rope2'
    g.px('rope2',[(5,8),(6,8),(48,8),(47,8)]); g.ell(27,20,8,2,'pk')
    g.px('SN',[(3,1),(50,1)]); g.outline('K'); return g
def swing():
    g=G(38,36); g.rect(2,2,35,4,'wd'); g.rect(3,5,5,35,'wd2'); g.rect(32,5,34,35,'wd2')
    g.rect(12,5,12,25,'rope'); g.rect(25,5,25,25,'rope'); g.rect(10,25,27,27,'rf')
    g.px('SN',[(x,1) for x in range(2,36)]+[(x,24) for x in range(10,28)]); g.outline('K'); return g
BENCHES=[('bench','Gartenbank',bench()),('hammock','Hängematte',hammock()),('swing','Schaukel',swing())]
# ---- ponds ----
def lily():
    g=G(52,20); g.ell(26,10,25,9,'st'); g.ell(26,10,22,7.4,'wa'); g.ell(20,8,8,2.4,'wa3')
    for (x,y) in [(14,12),(34,9),(40,13)]: g.ell(x,y,3.4,2,'gr'); g.p[y][x]='gr2'
    g.px('pk',[(34,8),(33,8),(35,8),(34,7)]); g.px('ye',[(34,8)])
    g.outline('K'); return g
def fountain():
    g=G(32,34); g.ell(16,26,15,7,'st'); g.ell(16,25,12,4.6,'wa'); g.rect(13,8,18,24,'st3'); g.ell(16,8,6,2.5,'st'); g.ell(16,7,4,1.6,'wa')
    g.px('st2',[(18,y) for y in range(9,24)]); g.outline('K'); return g
def creek():
    g=G(58,18)
    for x in range(58):
        y=int(8+3*math.sin(x/9)); g.rect(x,y-3,x,y+3,'wa')
        g.p[y-3][x]='wa3' if x%4 else 'wa'
    for (x,y,r) in [(6,13,3),(20,4,2.5),(33,14,3.2),(47,5,2.6),(54,12,2.4)]: g.ell(x,y,r,r*0.7,'st'); g.p[int(y-1)][x]='st3'
    g.outline('K'); return g
PONDS=[('lily','Seerosenteich',lily()),('fountain','Brunnen',fountain()),('creek','Bachlauf',creek())]
# ---- paths (decals from the house door towards the middle) ----
def p_stones():
    g=G(70,26)
    for k,(x,y) in enumerate([(6,3),(16,7),(27,11),(39,15),(51,19),(63,22)]): g.ell(x,y,4.4,2.6,'st'); g.p[y-1][x-1]='st3'; g.p[y+1][x+1]='st2'
    g.outline('K'); return g
def p_planks():
    g=G(70,26)
    for k in range(9):
        x=5+k*7.2; y=1+k*2.5; g.poly([(x-4,y),(x+5,y),(x+8,y+5),(x-1,y+5)],'wd3'); g.px('wd2',[(int(x+1),int(y+3)),(int(x+4),int(y+3))])
    g.outline('K'); return g
def p_gravel():
    g=G(70,26)
    for t in range(70):
        y=int(t*0.36)
        for w in range(-5,6): g.put(t,y+w+4,'st3' if (t*7+w*3)%5 else 'st')
    g.outline('K'); return g
PATHS=[('stones','Trittsteine',p_stones()),('planks','Holzsteg',p_planks()),('gravel','Kiesweg',p_gravel())]
# ---- beds (three plots) ----
def bed(kind):
    g=G(66,22)
    if kind=='wood':
        g.rect(1,8,64,21,'wd'); g.rect(1,8,64,9,'wd3'); g.rect(4,10,61,13,'so'); g.px('so2',[(x,13) for x in range(4,62,3)])
        for x in (1,22,43,64): g.rect(x,8,x,21,'wd2')
    if kind=='stone':
        for x in range(1,65,6): g.ell(x+3,15,3.4,3,'st'); g.p[13][x+2]='st3'
        g.rect(4,10,61,13,'so'); g.px('so2',[(x,12) for x in range(5,61,4)])
    if kind=='raised':
        g.rect(1,2,64,21,'wd2'); g.rect(1,2,64,4,'wd3'); g.rect(4,4,61,7,'so')
        for y in (10,15): g.rect(1,y,64,y,'wd4')
        g.rect(2,19,6,21,'wd4'); g.rect(59,19,63,21,'wd4')
    g.outline('K'); return g
BEDS=[('wood','Holzbeet',bed('wood'),11),('stone','Steinbeet',bed('stone'),11),('raised','Hochbeet',bed('raised'),5)]

# ---- crops: four stages each (12 x 20) ----
def mound(g):
    g.ell(6,18,5,2,'so3'); g.px('so2',[(4,18),(8,19)])
def crop(kind,stage):
    g=G(12,20); mound(g)
    if stage==0: g.px('ye2',[(6,17)])
    if stage>=1: g.rect(5,13,6,17,'gr2'); g.ell(4,12,2,1.2,'gr'); g.ell(8,12,2,1.2,'gr')
    if stage>=2:
        g.rect(5,8,6,17,'gr2'); g.ell(3,10,2.6,1.6,'gr'); g.ell(9,9,2.6,1.6,'gr'); g.ell(6,7,2,1.4,'gr3')
    if stage==3:
        if kind=='strawberry': 
            for (x,y) in [(2,13),(9,14),(6,11)]: g.ell(x+.5,y+.5,1.6,1.8,'rd'); g.px('ye',[(x,y)]); g.px('gr',[(x,y-1)])
        if kind=='cucumber': g.rect(8,11,9,16,'cu'); g.px('cu2',[(9,13),(9,15)]); g.ell(3,6,1.4,1.4,'ye')
        if kind=='dandelion': g.rect(5,3,6,9,'gr2'); g.ell(6,3,3,2.6,'ye'); g.px('ye2',[(6,3),(5,2)])
        if kind=='sunflower': g.rect(5,4,6,10,'gr2'); g.ell(6,4,4,3.6,'ye'); g.ell(6,4,1.8,1.6,'br')
    for y in range(20): g.p[y][11]=g.p[y][11]
    g.outline('K'); return g
CROPS=[('strawberry','Erdbeere',4),('cucumber','Gurke',3),('dandelion','Löwenzahn',2),('sunflower','Sonnenblume',6)]
for cid,_,_ in CROPS:
    for st in range(4): keep(f'crop_{cid}{st}',crop(cid,st))
# foods to hold, seed packets
def spr(rows,name,mp):
    g=G(len(rows[0]),len(rows))
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': g.p[y][x]=mp[ch]
    keep(name,g)
spr([".KgK..","KrrrK.","KrwrrK","KrrrrK",".KrrK.","..KK.."],'f_strawberry',{'K':'K','g':'gr','r':'rd','w':'ye'})
spr(["..KK.",".KcK.","KccK.","KcCK.","KccK.","KcCK.","KccK.",".KK.."],'f_cucumber',{'K':'K','c':'cu','C':'cu2'})
spr([".KyK.","KyyyK","KyYyK",".KyK.","..g..","..g..",".gg..","..g.."],'f_dandelion',{'K':'K','y':'ye','Y':'ye2','g':'gr2'})
spr([".KyyK.","KybbyK","KbBbbK","KbbBbK","KybbyK",".KyyK."],'f_sunflower',{'K':'K','y':'ye','b':'br','B':'br2'})
for cid,col in [('strawberry','rd'),('cucumber','cu'),('dandelion','ye'),('sunflower','or')]:
    g=G(8,10); g.rect(0,1,7,9,'cr'); g.rect(0,1,7,2,col); g.ell(4,6,2,2,col); g.rect(2,0,5,0,'cr2'); g.outline('K'); keep('seed_'+cid,g)
# tools, critters, particles
g=G(14,10); g.rect(3,3,10,9,'st'); g.rect(3,3,10,3,'st3'); g.poly([(10,5),(13,1),(14,2),(11,7)],'st'); g.rect(0,2,3,4,'st2'); g.outline('K'); keep('can',g)
for i,wy in enumerate((0,2)):
    g=G(9,7); g.ell(2.5,2.5+wy*0.5,2.4,2.4-wy*0.6,'or'); g.ell(6.5,2.5+wy*0.5,2.4,2.4-wy*0.6,'or'); g.rect(4,1,4,6,'K'); g.px('ye',[(2,2),(6,2)]); keep(f'butterfly{i}',g)
for n,c in [('leaf_a','or'),('leaf_b','rd'),('leaf_c','ye2')]:
    g=G(3,3); g.px(c,[(1,0),(0,1),(1,1),(2,1),(1,2)]); keep(n,g)
g=G(3,3); g.px('wh',[(1,0),(0,1),(1,1),(2,1),(1,2)]); keep('snowflake',g)
g=G(2,2); g.px('pk',[(0,0),(1,0),(0,1)]); keep('petal',g)
g=G(2,2); g.px('so',[(0,0),(1,0),(0,1),(1,1)]); keep('dirt',g)
g=G(34,12); random.seed(5)
g.ell(17,8,16,5,'or')
for k in range(60):
    x=random.randint(2,32); y=random.randint(3,11)
    if g.p[y][x]: g.p[y][x]=random.choice(['or','or2','rd','ye2','rd2'])
g.outline('K'); keep('leafpile',g)
def snowham(stage):
    g=G(18,24)
    g.ell(9,18,8,6,'wh')
    if stage>=1: g.ell(9,9,6.4,5.6,'wh')
    if stage>=2:
        g.ell(4,4.6,2.2,2.2,'wh'); g.ell(14,4.6,2.2,2.2,'wh'); g.ell(9,9,6.4,5.6,'wh')
        g.px('K',[(7,8),(11,8)]); g.px('or',[(9,10)]); g.px('rd',[(6,15),(7,15),(8,15),(9,15),(10,15),(11,15),(12,15)])
    for y in range(24):
        for x in range(18):
            if g.p[y][x]=='wh' and (y>0 and g.p[y-1][x] is None) is False and (y<23 and g.p[y+1][x] is None): g.p[y][x]='wa3'
    g.outline('K'); return g
for i in range(3): keep(f'snowham{i}',snowham(i))
D=dict(art=out,fences=FENCES,sheds=[(i,n) for i,n,_ in SHEDS],benches=[(i,n) for i,n,_ in BENCHES],ponds=[(i,n) for i,n,_ in PONDS],paths=[(i,n) for i,n,_ in PATHS],beds=[(i,n,y) for i,n,_,y in BEDS],crops=CROPS)
for cat,lst in (('shed',SHEDS),('bench',BENCHES),('pond',PONDS),('path',PATHS)):
    for i,n,g in lst: keep(f'{cat}_{i}',g)
for i,n,g,y in BEDS: keep(f'bed_{i}',g)

# ---- garden plants (decoration, three spots) ----
C('tc','#c9744a'); C('tc2','#a85a34'); C('ro','#e8557a'); C('ro2','#b83a5a'); C('hy','#7ea8e8'); C('hy2','#5a84cc'); C('hy3','#b0ccf4'); C('pm','#f08a24'); C('pm2','#c8681a'); C('be','#5a3a9a'); C('gs','#c8c070'); C('gs2','#a89a46')
GW2,GH2=26,30
def snowcap(g):
    tops={}
    for x in range(g.w):
        for y in range(g.h):
            if g.p[y][x] is not None: tops[x]=y; break
    for x,y in tops.items():
        if y>0: g.p[y-1][x]='SN'
    return g
def gp(fn):
    g=G(GW2,GH2); fn(g); g.outline('K'); return snowcap(g)
def rosebush(g):
    g.ell(13,19,11,9,'L1'); g.ell(8,22,5,5,'L2'); g.ell(19,15,5,4,'L3')
    for (x,y) in [(7,14),(14,11),(19,18),(10,21),(17,24),(4,20)]: g.ell(x+.5,y+.5,1.8,1.8,'ro'); g.p[y][x]='ro2'
    g.rect(11,27,14,29,'br')
def lavbush(g):
    for x in range(3,23,2):
        top=6+(x*5)%7
        g.rect(x,top+6,x,28,'gr2')
        for y in range(top,top+7): g.put(x,y,'pu' if y%2 else 'be')
    g.ell(13,26,10,3,'gr')
def hydrangea(g):
    g.ell(13,20,11,8,'L1')
    for (x,y) in [(7,14),(16,12),(19,19),(9,21)]: g.ell(x,y,4,3.4,'hy'); g.ell(x-1,y-1,2,1.5,'hy3'); g.p[y+1][x+1]='hy2'
def sunflowers(g):
    for x0,top in [(6,4),(14,1),(21,6)]:
        g.rect(x0,top+5,x0,29,'gr2'); g.ell(x0-2,top+14,2.5,1.3,'gr'); g.ell(x0+2,top+18,2.5,1.3,'gr')
        g.ell(x0,top+3,4,3.6,'ye'); g.ell(x0,top+3,1.8,1.6,'br')
def grass(g):
    for k in range(13):
        x0=2+k*1.8; h=10+(k*7)%12
        for t in range(h): g.put(int(x0+math.sin(k)*t*0.25),29-t,'gs' if t%3 else 'gs2')
    for (x,y) in [(6,8),(12,5),(19,9)]: g.ell(x,y,1.4,2.6,'cr')
def boxwood(g):
    g.ell(13,17,11,11,'L1'); g.ell(10,13,5,4,'L3'); g.ell(16,22,5,3,'L2'); g.rect(10,26,16,29,'tc'); g.rect(9,26,17,26,'tc2')
def berries(g):
    g.ell(13,18,11,10,'L1'); g.ell(9,14,4,3,'L3'); g.ell(17,22,5,3,'L2')
    for (x,y) in [(6,18),(11,22),(16,15),(19,20),(9,12),(14,26),(20,25)]: g.px('be',[(x,y),(x+1,y),(x,y+1)])
def pumpkins(g):
    for x in range(1,25): g.put(x,int(22+2*math.sin(x/3)),'gr2')
    for (cx,cy,r) in [(7,25,5),(18,24,6)]:
        g.ell(cx,cy,r,r*0.75,'pm'); g.px('pm2',[(cx,y) for y in range(int(cy-r*0.7),int(cy+r*0.7))]); g.rect(cx,int(cy-r*0.75)-2,cx+1,int(cy-r*0.75),'gr2')
    g.ell(12,18,3,2,'gr'); g.ell(22,17,3,2,'gr')
def tulipbed(g):
    for x,c,c2 in [(4,'rd','rd2'),(9,'ye','ye2'),(14,'pk','pk2'),(19,'rd','rd2'),(23,'pu','be')]:
        g.rect(x,14,x,28,'gr2'); g.rect(x-1,10,x+1,14,c); g.px(c2,[(x,10)]); g.ell(x-1.5,21,1.2,3,'gr')
    g.rect(1,27,24,29,'so')
def bigfern(g):
    for ang in range(-80,81,16):
        a=math.radians(ang); ln=14 if abs(ang)<50 else 11
        for t in range(ln):
            x=13+math.sin(a)*t*1.15; y=28-math.cos(a)*t*1.3+t*t*0.03*(1 if abs(ang)>10 else 0)
            g.put(int(round(x)),int(round(y)),'L2')
            if 1<t<ln-1:
                g.put(int(round(x-math.cos(a))),int(round(y-math.sin(a))),'L1'); g.put(int(round(x+math.cos(a))),int(round(y+math.sin(a))),'L1')
GPLANTS=[('rosebush','Rosenbusch',rosebush),('lavbush','Lavendelbusch',lavbush),('hydrangea','Hortensie',hydrangea),('sunflowers','Sonnenblumen',sunflowers),('grass','Ziergras',grass),
         ('boxwood','Buchsbaumkugel',boxwood),('berries','Beerenstrauch',berries),('pumpkins','Kürbisse',pumpkins),('tulipbed','Tulpenreihe',tulipbed),('bigfern','Großer Farn',bigfern)]
for pid,name,fn in GPLANTS: keep('gplant_'+pid,gp(fn))
# a smaller background tree (round crown) and a fir
t2=G(40,56)
t2.rect(18,38,21,55,'br'); t2.px('br2',[(21,y) for y in range(38,56)])
t2.ell(20,22,17,17,'L1'); t2.ell(14,16,7,6,'L3'); t2.ell(26,30,7,5,'L2'); t2.ell(10,28,4,3,'L2')
random.seed(9)
for k in range(10):
    x=random.randint(6,34); y=random.randint(8,36)
    if t2.p[y][x] in ('L1','L2','L3'): t2.p[y][x]='L4'
t2.outline('K'); keep('tree2',t2)
fir=G(34,60)
fir.rect(15,50,18,59,'br')
for k,(y0,w) in enumerate([(2,4),(10,8),(18,11),(27,14),(37,16)]):
    fir.poly([(17,y0),(17+w,y0+14),(17-w,y0+14)],'gr2')
    fir.poly([(17,y0+2),(17+w-3,y0+13),(17,y0+13)],'gr')
fir.outline('K')
for x in range(34):
    for y in range(60):
        if fir.p[y][x] in ('gr','gr2') and y>0 and fir.p[y-1][x]=='K': fir.p[y][x]='SN' if False else fir.p[y][x]
keep('fir',snowcap(fir))

D['gplants']=[(i,n) for i,n,_ in GPLANTS]
json.dump(D,open('garden.json','w'),ensure_ascii=False)
# sheet
SEASON={'L1':'#5aa04e','L2':'#3e7c3c','L3':'#8ccc72','L4':'#f29aa8','H1':'#8cc488','H2':'#6fae5a','H3':'#a8d89a','G2':'#4e8a3a','G3':'#9ad47a','SN':'#ffffff'}
def raster(svg,w,h,sc):
    im=Image.new('RGBA',(w*sc,h*sc),(0,0,0,0)); d=ImageDraw.Draw(im)
    for m in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
        col=m.group(1)
        for k,v in SEASON.items():
            if pal[k]==col: col=v
        for x,y,n in re.findall(r'M(\d+) (\d+)h(\d+)', m.group(2)):
            x,y,n=int(x),int(y),int(n); d.rectangle([x*sc,y*sc,(x+n)*sc-1,y*sc+sc-1],fill=col)
    return im
names=[k for k in out if 'svg' in out[k]]
sheet=Image.new('RGB',(1400,1000),'#cfe8c0'); x=y=5; rowh=0
for k in names:
    it=out[k]; sc=3 if it['w']<70 else 2
    im=raster(it['svg'],it['w'],it['h'],sc)
    if x+im.width>1395: x=5; y+=rowh+8; rowh=0
    sheet.paste(im,(x,y),im); x+=im.width+8; rowh=max(rowh,im.height)
sheet.save('garden_sheet.png'); print('ok',len(names))
