from lib import G
import json, math, re
from PIL import Image, ImageDraw
pal=dict(K='#3a2414')
def C(n,h): pal[n]=h; return n
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
W,H=24,36
C('g1','#5aa04e'); C('g2','#3e7c3c'); C('g3','#8ccc72'); C('g4','#2e6030')
C('tc','#c9744a'); C('tc2','#a85a34'); C('tc3','#e0946a')
C('wc','#f4f1ea'); C('wc2','#d4cfc4'); C('bl','#4f86c6'); C('bl2','#36639a'); C('bl3','#86b2e2')
C('br','#8a5a30'); C('br2','#5e3a1c'); C('bk','#d8b47a'); C('bk2','#b08a50')
C('ye','#ffd34e'); C('ye2','#e0a820'); C('pk','#f29aa8'); C('pk2','#d86a80'); C('rd','#e8554a'); C('pu','#9a7ad0'); C('pu2','#6e52a8')
C('gl','#cfe8f5'); C('gl2','#a8d0e8'); C('st','#9a9aa6'); C('st2','#6e6e7a'); C('cr','#fff4dc')
def pot(kind):
    g=G(W,H)
    if kind=='terra':
        g.rect(6,27,17,35,'tc'); g.rect(5,25,18,27,'tc'); g.rect(5,27,18,27,'tc2'); g.rect(7,28,7,34,'tc3'); g.rect(16,28,17,35,'tc2')
    elif kind=='white':
        g.poly([(6,26),(18,26),(17,36),(7,36)],'wc'); g.rect(6,26,17,27,'wc2'); g.px('wc2',[(16,y) for y in range(28,35)])
    elif kind=='blue':
        g.poly([(5,26),(19,26),(17,36),(7,36)],'bl'); g.rect(5,26,18,27,'bl3'); g.px('bl2',[(16,y) for y in range(28,35)]); g.px('bl3',[(8,29),(8,30),(8,31)])
    elif kind=='tray':
        g.rect(3,31,20,34,'bl2'); g.rect(3,31,20,31,'bl'); g.rect(4,35,6,35,'bl2'); g.rect(17,35,19,35,'bl2')
    elif kind=='stone':
        g.poly([(5,25),(19,25),(18,36),(6,36)],'st'); g.rect(5,25,18,26,'st2'); g.px('st2',[(9,30),(14,32),(11,34)])
    elif kind=='cream':
        g.poly([(6,27),(18,27),(16,36),(8,36)],'cr'); g.rect(6,27,17,28,'wc2'); g.rect(6,31,17,31,'pk')
    elif kind=='box':
        g.rect(2,27,21,35,'br'); g.rect(2,27,21,27,'bk'); g.rect(2,31,21,31,'br2'); g.px('br2',[(7,y) for y in range(28,36)]+[(16,y) for y in range(28,36)])
    elif kind=='vase':
        g.poly([(8,22),(15,22),(17,30),(15,36),(8,36),(6,30)],'gl'); g.rect(8,29,15,35,'gl2'); g.px('cr',[(9,24),(9,25),(9,26)])
    elif kind=='basket':
        g.poly([(4,26),(20,26),(18,36),(6,36)],'bk')
        for y in range(26,36):
            for x in range(4,21):
                if g.p[y][x] and (x+y)%3==0: g.p[y][x]='bk2'
        g.rect(4,26,19,27,'bk2')
    g.outline('K'); return g
def foliage(fn):
    g=G(W,H); fn(g); g.outline('K'); return g
def monstera(g):
    for x,y in [(11,16),(12,20),(13,24)]: g.rect(x,y,x+1,y+3,'g2')
    for cx,cy,rx,ry in [(7,13,6,4.6),(16,9,6.4,5.2),(13,19,6,4),(18,17,4.6,3.6),(6,21,4.4,3.2)]:
        g.ell(cx,cy,rx,ry,'g1')
        for t in range(-2,3):
            a=math.atan2(-1,t*0.7)
            for r in range(2,int(rx)):
                x=int(cx+math.cos(a)*r*1.0+(t*0.8)); y=int(cy+r*0.15*t)
        g.px('g3',[(int(cx-rx/2),int(cy-1)),(int(cx-rx/2)+1,int(cy-1))])
        for k in (-2,0,2):
            for r in range(int(rx)-2,int(rx)+1):
                g.put(int(cx+k*0.9+ (1 if k>0 else -1 if k<0 else 0)*r*0.5), int(cy+ry-1-(r-(rx-2))),None)
        g.px('g2',[(int(cx),y) for y in range(int(cy-ry+1),int(cy+ry))])
def cactus(g):
    g.ell(12,17,4.6,11,'g1'); g.ell(6,15,2.2,4.4,'g1'); g.ell(18,11,2.2,4.4,'g1'); g.rect(7,17,9,19,'g1'); g.rect(15,13,17,15,'g1')
    for x in (10,14): g.px('g2',[(x,y) for y in range(8,27)])
    g.px('g3',[(11,8),(11,9),(11,10),(11,11)]); g.px('cr',[(9,12),(13,16),(15,21),(10,23),(6,13),(18,9)])
    g.ell(12,5.6,2.6,2,'pk'); g.px('pk2',[(12,6)]); g.px('ye',[(12,5)])
    for y in range(28,36): g.p[y]=[None]*W
def sunflower(g):
    g.rect(11,12,12,27,'g2'); g.ell(7,19,4,2,'g1'); g.ell(16,22,4,2,'g1'); g.px('g3',[(5,19),(6,18),(15,22)])
    g.ell(12,8,7,6.4,'ye'); 
    for a in range(0,360,40):
        g.put(int(12+6.8*math.cos(math.radians(a))),int(8+6.2*math.sin(math.radians(a))),'ye2')
    g.ell(12,8,3.4,3.2,'br'); g.px('br2',[(11,7),(13,8),(12,9),(11,9)])
def bonsai(g):
    g.poly([(11,31),(14,31),(14,26),(10,22),(12,18),(11,16),(9,18),(8,22),(11,26)],'br'); g.px('br2',[(12,28),(12,29),(10,21)])
    for cx,cy,rx,ry in [(7,11,5,3.4),(16,8,6,4),(12,15,4.6,2.8),(19,13,3.4,2.4)]: g.ell(cx,cy,rx,ry,'g1')
    g.px('g3',[(5,10),(6,9),(14,6),(15,5),(16,5),(11,14)]); g.px('g2',[(8,13),(17,10),(13,16),(19,14)])
def zz(g):
    for (x0,ang,ln) in [(10,-15,20),(13,10,22),(8,-35,15),(15,35,16),(12,0,24)]:
        a=math.radians(ang)
        for t in range(ln):
            x=int(x0+math.sin(a)*t); y=int(27-math.cos(a)*t); g.put(x,y,'g2')
            if t>4 and t%3==0:
                g.ell(x-1.8,y,1.8,1.1,'g1'); g.ell(x+2.2,y,1.8,1.1,'g1')
    g.px('g3',[(12,4),(13,5)])
def spider(g):
    for ang in range(-80,81,20):
        a=math.radians(ang)
        for t in range(12):
            x=12+math.sin(a)*t*1.15; y=26-math.cos(a)*t*1.3+ (t*t*0.06 if abs(ang)>30 else 0)
            g.put(int(x),int(y),'g1'); g.put(int(x)+1,int(y),'cr' if t%2 else 'g1')
    g.ell(12,25,4,2,'g2')
def lavender(g):
    for x in range(4,21,2):
        top=10+(x*7)%6
        g.rect(x,top,x,27,'g2')
        for y in range(top-4,top+3): g.put(x,y,'pu' if y%2 else 'pu2'); 
        g.put(x+1,top-2,'pu')
def tulips(g):
    for x,top,c,c2 in [(8,10,'rd','pk2'),(12,6,'pk','pk2'),(16,9,'ye','ye2')]:
        g.rect(x,top+3,x,24,'g2')
        g.rect(x-2,top-1,x+2,top+3,c); g.px(c2,[(x,top-1),(x-2,top+3),(x+2,top+3)]); g.put(x-1,top-2,c); g.put(x+1,top-2,c)
    g.ell(6,18,1.6,4,'g1'); g.ell(18,17,1.6,4,'g1')
def lemon(g):
    g.rect(11,17,12,27,'br'); g.ell(12,10,9,8,'g1'); g.ell(9,8,4,3,'g3')
    for (x,y) in [(7,10),(15,7),(17,13),(10,14),(13,4)]: g.ell(x+.5,y+.5,1.6,1.3,'ye'); g.put(x,y+1,'ye2')
    g.px('g2',[(5,13),(18,10),(12,16),(14,15)])
def fern(g):
    for ang in range(-80,81,20):
        a=math.radians(ang)
        ln=15 if abs(ang)<50 else 12
        for t in range(ln):
            bend=t*t*0.035*(1 if abs(ang)>10 else 0)
            x=12+math.sin(a)*t*1.15; y=26-math.cos(a)*t*1.25+bend
            g.put(int(round(x)),int(round(y)),'g2')
            if t>1 and t<ln-1:
                w=2 if t<ln-4 else 1
                for k in range(1,w+1):
                    g.put(int(round(x-math.cos(a)*k)),int(round(y-math.sin(a)*k)),'g1')
                    g.put(int(round(x+math.cos(a)*k)),int(round(y+math.sin(a)*k)),'g1' if k==1 else 'g3')
PLANTS=[('cactus','Kleiner Kaktus','white',cactus),('monstera','Monstera','terra',monstera),('sunflower','Sonnenblume','blue',sunflower),('bonsai','Bonsai','tray',bonsai),
        ('zz','Glücksfeder','stone',zz),('spider','Grünlilie','cream',spider),('lavender','Lavendel','box',lavender),('tulips','Tulpen','vase',tulips),
        ('lemon','Zitronenbäumchen','terra',lemon),('fern','Farn im Korb','basket',fern)]
out=[]
for pid,name,potk,fn in PLANTS:
    pg=pot(potk); fg=foliage(fn)
    # where the foliage meets the pot: the sway pivots there
    oy=max([y for y in range(H) for x in range(W) if fg.p[y][x]] or [26])
    out.append(dict(id=pid,name=name,w=W,h=H,svg=paths(pg),leaves=[dict(svg=paths(fg),ox=12,oy=min(oy+1,30))],fg_first=pid in ('bonsai',)))
json.dump(out,open('plants.json','w'),ensure_ascii=False)
sheet=Image.new('RGB',(10*130,170),'#fbe9d4'); d=ImageDraw.Draw(sheet)
for i,it in enumerate(out):
    for svg in (it['svg'],it['leaves'][0]['svg']):
        for m in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
            for x,y,n in re.findall(r'M(\d+) (\d+)h(\d+)', m.group(2)):
                x,y,n=int(x),int(y),int(n); d.rectangle([i*130+5+x*4,5+y*4,i*130+5+(x+n)*4-1,5+y*4+3],fill=m.group(1))
sheet.save('plants.png'); print('ok')
