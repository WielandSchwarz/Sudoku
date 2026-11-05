from lib import G
import json, re, math
from PIL import Image, ImageDraw
pal=dict(K='#3a2414')
def C(n,h): pal[n]=h; return n
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
out={}
# ---- bottle (14 x 38) ----
C('bp','#d6ecf6'); C('bw','#7cbfe8'); C('bW','#a8d8f4'); C('bh','#ffffff'); C('cap','#e8762c'); C('capd','#b8561a'); C('mt','#aab0bc'); C('mtd','#787e8a'); C('br','#c9c2b4')
g=G(16,40)
g.rect(2,3,13,27,'bp'); g.p[3][2]=None; g.p[3][13]=None
g.rect(3,11,12,26,'bw'); g.rect(3,11,12,11,'bW')
g.rect(4,4,4,24,'bh'); g.rect(5,5,5,8,'bh')
g.rect(3,28,12,31,'cap'); g.rect(3,31,12,31,'capd'); g.px('capd',[(5,29),(8,29),(11,29)])
g.rect(7,32,8,37,'mt'); g.rect(8,32,8,37,'mtd'); g.rect(6,37,9,38,'mt'); g.px('mtd',[(9,38)])
g.rect(0,14,1,18,'br'); g.rect(14,14,15,18,'br')   # holder clips
g.outline('K'); out['bottle']=dict(svg=paths(g),w=16,h=40)
# ---- bowl (28 x 14) with seed pile ----
C('bo','#f4a3b4'); C('bo2','#e07f95'); C('bo3','#fcd0d8'); C('sd','#5a4632'); C('sd2','#f4ead2'); C('sd3','#d8b878'); C('cr','#f08a24')
g=G(28,14)
g.poly([(0,4),(28,4),(25,13),(3,13)],'bo'); g.rect(1,4,26,5,'bo3'); g.rect(3,12,24,12,'bo2')
g.px('bo2',[(2,8),(3,10),(25,8),(24,10)]); g.px('bo3',[(5,7),(6,7),(7,7)])
for x in range(8,21,3): g.px('bo2',[(x,9)])
g.outline('K'); out['bowl']=dict(svg=paths(g),w=28,h=14)
p=G(28,14)
p.ell(14,5,11,3.4,'sd3')
for k,(x,y) in enumerate([(6,4),(9,3),(12,2),(15,3),(18,4),(21,4),(8,5),(11,4),(14,5),(17,5),(20,5),(13,3),(16,2),(10,6),(19,6)]):
    c='sd' if k%3 else 'sd2'
    p.px(c,[(x,y),(x+1,y)]); p.px('sd2' if c=='sd' else 'sd',[(x,y+1)])
p.px('cr',[(23,3),(24,3),(24,4)])
for y in range(5,14):
    for x in range(28): 
        if y>5: p.p[y][x]=None
out['pile']=dict(svg=paths(p),w=28,h=14)
# ---- window (48 x 46): frame + curtains, panes transparent ----
C('wf','#fffaf0'); C('wf2','#e6dccb'); C('cu','#f2b2c0'); C('cu2','#e08aa0'); C('cu3','#fbd4dc'); C('rod','#8a5a30'); C('pot','#c9744a'); C('cac','#6fae4a'); C('cac2','#4e8a32'); C('flw','#ff8aa8')
fr=G(48,46)
fr.rect(6,4,41,39,'wf'); fr.rect(9,7,38,36,None) if False else None
for y in range(7,37):
    for x in range(9,39):
        if x in (23,24) or y in (21,22): continue
        fr.p[y][x]=None
fr.rect(6,4,41,4,'wf2'); fr.rect(4,38,43,41,'wf'); fr.rect(4,41,43,41,'wf2')
fr.px('wf2',[(9,20),(10,20),(11,20)])
# little cactus on the sill
fr.rect(30,34,34,37,'pot'); fr.rect(31,29,33,33,'cac'); fr.px('cac2',[(33,30),(33,31),(33,32)]); fr.px('cac',[(29,31),(29,30),(35,30),(35,31)]); fr.px('flw',[(32,28)])
fr.outline('K')
out['window']=dict(svg=paths(fr),w=48,h=46)
def curtain(left):
    g=G(48,46)
    xs=range(0,12) if left else range(36,48)
    for y in range(2,44):
        bulge = int(2*math.sin(y/44*math.pi))
        for x in xs:
            xx = x - (bulge if left else -bulge)
            if left and x>9+ (2 if 22<y<30 else 0): continue
            if not left and x<38-(2 if 22<y<30 else 0): continue
            g.put(x,y,'cu')
    # tie-back narrowing
    for y in range(24,28):
        for x in xs:
            if (left and x>6) or (not left and x<41): g.p[y][x]=None
    # folds
    for x in (list(xs)[2::3]):
        for y in range(3,44):
            if g.p[y][x]=='cu': g.p[y][x]='cu2'
    for y in range(2,44):
        for x in xs:
            if g.p[y][x]=='cu' and (x+1<48 and g.p[y][x+1]=='cu2'): g.p[y][x]='cu3'
    g.rect(0 if left else 37,25,10 if left else 47,26,'flw')
    g.outline('K')
    return g
out['curtainL']=dict(svg=paths(curtain(True)),w=48,h=46)
out['curtainR']=dict(svg=paths(curtain(False)),w=48,h=46)
rod=G(48,4); rod.rect(1,1,46,2,'rod'); rod.rect(0,0,2,3,'rod'); rod.rect(45,0,47,3,'rod'); rod.outline('K'); out['rod']=dict(svg=paths(rod),w=48,h=4)
# ---- rug (70 x 20) ----
C('ru1','#e8a0a8'); C('ru2','#f4d7a0'); C('ru3','#b4d6c8'); C('ru4','#fff4dc')
g=G(70,20)
for i,(c,rx,ry) in enumerate([('ru1',34.5,9.6),('ru2',30,8),('ru3',25,6.4),('ru4',20,5),('ru1',15,3.6),('ru2',9,2)]):
    g.ell(35,10,rx,ry,c)
for y in range(20):
    for x in range(70):
        if g.p[y][x] and (x+y)%5==0 and g.p[y][x]!='ru4': g.p[y][x]={'ru1':'cu2','ru2':'sd3','ru3':'cac'}.get(g.p[y][x],g.p[y][x]) if (x*y)%7==0 else g.p[y][x]
out['rug']=dict(svg=paths(g),w=70,h=20)
# ---- floor tile (36 x 12) ----
C('fl','#e6c697'); C('fl2','#d4ae7a'); C('fl3','#f0d6ac'); C('fl4','#c49a64')
g=G(36,12); g.rect(0,0,35,11,'fl')
g.rect(0,0,35,0,'fl3'); g.rect(0,5,35,5,'fl4'); g.rect(0,6,35,6,'fl3'); g.rect(0,11,35,11,'fl4')
g.px('fl4',[(11,0),(11,1),(11,2),(11,3),(11,4),(29,6),(29,7),(29,8),(29,9),(29,10)])
g.px('fl2',[(3,2),(4,2),(5,2),(18,3),(19,3),(24,2),(25,2),(26,2),(2,8),(3,8),(14,9),(15,9),(16,9),(33,8),(34,8)])
g.px('fl4',[(13,2),(27,8)])
out['floor']=dict(tile=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 12" width="36" height="12" shape-rendering="crispEdges">{paths(g)}</svg>',w=36,h=12)
json.dump(out,open('props.json','w'))
# preview
def raster(svg,w,h,sc,bg='#fbe9d4'):
    im=Image.new('RGB',(w*sc,h*sc),bg); d=ImageDraw.Draw(im)
    for m in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
        for x,y,n in re.findall(r'M(\d+) (\d+)h(\d+)', m.group(2)):
            x,y,n=int(x),int(y),int(n); d.rectangle([x*sc,y*sc,(x+n)*sc-1,y*sc+sc-1],fill=m.group(1))
    return im
ims=[raster(out['bottle']['svg'],16,40,5),raster(out['bowl']['svg']+out['pile']['svg'],28,14,5),raster(out['rod']['svg']+out['window']['svg']+out['curtainL']['svg']+out['curtainR']['svg'],48,46,5,'#bfe3f7'),raster(out['rug']['svg'],70,20,4),raster(out['floor']['tile'],36,12,5)]
W=sum(i.width for i in ims)+50; sh=Image.new('RGB',(W,240),'#ccc'); x=0
for i in ims: sh.paste(i,(x,0)); x+=i.width+10
sh.save('props.png')
