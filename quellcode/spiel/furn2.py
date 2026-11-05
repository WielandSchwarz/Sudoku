exec(open('furn_base.py').read())
import math, json, re
from PIL import Image, ImageDraw

def hx(c): return tuple(int(c[i:i+2],16) for i in (1,3,5))
def tohex(t): return '#%02x%02x%02x'%tuple(max(0,min(255,round(v))) for v in t)
def mix(a,b,t): a,b=hx(a),hx(b); return tohex([a[i]+(b[i]-a[i])*t for i in range(3)])
def shade(name,kind):
    k=name+kind
    if k not in PAL: PAL[k]=mix(PAL[name],'#fff8e8',0.32) if kind=='+' else mix(PAL[name],'#2b1d12',0.26)
    return k
def scale2x(g):
    n=G(g.w*2,g.h*2); P=g.p
    def at(x,y): return P[y][x] if 0<=x<g.w and 0<=y<g.h else None
    for y in range(g.h):
        for x in range(g.w):
            p=P[y][x]; A=at(x,y-1); B=at(x+1,y); C_=at(x-1,y); D=at(x,y+1)
            e1=e2=e3=e4=p
            if C_==A and C_!=D and A!=B: e1=A
            if A==B and A!=C_ and B!=D: e2=B
            if D==C_ and D!=B and C_!=A: e3=C_
            if B==D and B!=A and D!=C_: e4=D
            n.p[2*y][2*x]=e1; n.p[2*y][2*x+1]=e2; n.p[2*y+1][2*x]=e3; n.p[2*y+1][2*x+1]=e4
    return n
WOOD={'w1','w2','w3','ok','okd','tr','cr1','cr2','b1','b2','b3','wd','bk','in'}
FABRIC={'r1','g1','p1','u1','m1','c1','c2','c3','o1','e1','m3','r3','g3','p3','u3'}
NOSHADE={'K','in'}
def finish(g,texture=True):
    W,H=g.w,g.h; src=[r[:] for r in g.p]
    for y in range(H):
        for x in range(W):
            c=src[y][x]
            if c is None or c in NOSHADE or c.endswith('+') or c.endswith('-'): continue
            up=src[y-1][x] if y>0 else None; dn=src[y+1][x] if y<H-1 else None
            rt=src[y][x+1] if x<W-1 else None
            if up!=c: g.p[y][x]=shade(c,'+')
            elif dn!=c or rt!=c: g.p[y][x]=shade(c,'-')
            elif texture and c in WOOD and ((y*7+(x//6)*5)%13==0 or (y*7+(x//6)*5)%13==1) and (x%6)!=0: g.p[y][x]=shade(c,'-')
            elif texture and c in FABRIC and (x*3+y*5)%17==0: g.p[y][x]=shade(c,'-')
    return g

# ---------- per item details (fine coordinates) ----------
def pillow(g,x,y,w,h,c,stripe=None):
    for yy in range(y,y+h):
        for xx in range(x,x+w):
            if (xx in(x,x+w-1)) and (yy in(y,y+h-1)): continue
            g.put(xx,yy,c)
    if stripe:
        for xx in range(x+1,x+w-1): g.put(xx,y+h//2,stripe)
def dots(g,c,pts):
    for p in pts: g.put(p[0],p[1],c)
C('cream','#fff4dc'); C('mustard','#e0a82e'); C('lav','#b6a0dc'); C('lav2','#8e76c0'); C('teal','#4fa3a0'); C('gry','#9a9aa6'); C('glb','#6aa8d8'); C('glg','#7cc06a')
C('pic','#fbe9d4'); C('frm','#c9a046'); C('mug','#f4f1ea'); C('hgl','#e8d6a8'); C('sand','#e0b85a'); C('can','#f6efe0'); C('flame','#ffb030'); C('bird','#e9d07a'); C('birdk','#8a5a30')
DETAIL={
 # chairs
 'wing_red': lambda g: (dots(g,'r2',[(16,10),(24,10),(32,10),(20,16),(28,16),(16,22),(24,22),(32,22)]), pillow(g,28,20,9,7,'cream','r3')),
 'wing_check': lambda g: ( [g.put(x,y,'mustard') for x in range(36,46) for y in range(20,30) if (x+y)%3!=0], dots(g,'k2',[(37,30),(40,31),(43,30)]) ),
 'velvet': lambda g: pillow(g,18,20,8,7,'cream','p2'),
 'club': lambda g: dots(g,'b2',[(14,8),(20,6),(26,6),(32,8),(17,12),(23,11),(29,12)]),
 'beanbag': lambda g: ([g.put(x,y,'u2') for x,y in [(12,14),(13,15),(14,16),(15,17),(30,12),(31,13),(32,14)]], pillow(g,26,22,8,6,'mustard')),
 'rocking': lambda g: dots(g,'c1-',[(14,20),(22,20),(30,20)]),
 'egg': lambda g: (dots(g,'o1-',[(20,14),(26,14),(32,14),(23,20),(29,20)]), pillow(g,21,24,9,6,'cream','o1')),
 'strandkorb': lambda g: pillow(g,13,21,7,5,'mustard'),
 'peacock': lambda g: pillow(g,18,21,12,5,'cream','c3'),
 'owl': lambda g: owl_eyes(g),
 'sofa': lambda g: (pillow(g,6,15,9,8,'mustard'), pillow(g,32,15,9,8,'p1','p2'), [g.put(23,y,'m2') for y in range(24,31)]),
 # shelves: little trinkets
 'small': lambda g: (pillow(g,20,40,6,5,'mug'), g.put(26,42,'mug')),
 'oak': lambda g: None,
 'ladder': lambda g: None,
 'arch': lambda g: (g.rect(20,15,26,21,'frm'), g.rect(21,16,25,20,'pic'), g.rect(22,18,24,20,'b3')),
 'cube': lambda g: None,
 'crates': lambda g: None,
 'white': lambda g: None,
}
def owl_eyes(g):
    for cx in (10.8,21.2):
        g.ell(cx,12,4.4,4.4,'oy'); g.ell(cx,12.4,2.2,2.4,'K')
        g.put(int(cx)-1,11,'cream')
def frame_globe(g,x,y):
    g.ell(x+3,y+3,3.2,3.2,'glb'); dots(g,'glg',[(x+2,y+2),(x+3,y+2),(x+4,y+4),(x+2,y+5)]); g.rect(x+2,y+7,x+4,y+7,'frm')

def build(it):
    g=scale2x(it['raw'])
    f=DETAIL.get(it['id'])
    if f: f(g)
    finish(g, texture=True)
    g.outline(K)
    # clock faces: clean dial with twelve ticks
    for (cx,cy,r,rim,facec) in it.get('faces',[]):
        CX,CY,R=cx*2,cy*2,r*2
        for y in range(g.h):
            for x in range(g.w):
                d=((x+.5-CX)**2+(y+.5-CY)**2)**.5
                if d<R-0.6: g.p[y][x]=facec
                elif d<R+0.4 and g.p[y][x] not in (None,): g.p[y][x]=shade(facec,'-')
        if R<5: continue
        for k in range(12):
            a=math.radians(k*30); rr=R-1.6
            x=int(CX+rr*math.sin(a)); y=int(CY-rr*math.cos(a)); g.put(x,y,'K' if k%3==0 else shade(rim,'-'))
            if k%3==0 and R>8:
                x2=int(CX+(rr-1)*math.sin(a)); y2=int(CY-(rr-1)*math.cos(a)); g.put(x2,y2,'K')
    return g

ANIM_LEAF={'lf','lv'}
def split_leaves(g):
    """move leaf pixels into separate sway groups"""
    W,H=g.w,g.h; seen=set(); groups=[]
    isleaf=lambda c: c is not None and (c.rstrip('+-') in ANIM_LEAF)
    for y in range(H):
        for x in range(W):
            if isleaf(g.p[y][x]) and (x,y) not in seen:
                st=[(x,y)]; comp=[]; seen.add((x,y))
                while st:
                    a,b=st.pop(); comp.append((a,b))
                    for dx in (-1,0,1):
                        for dy in (-1,0,1):
                            n=(a+dx,b+dy)
                            if 0<=n[0]<W and 0<=n[1]<H and n not in seen and isleaf(g.p[n[1]][n[0]]): seen.add(n); st.append(n)
                groups.append(comp)
    out=[]
    for comp in groups:
        lg=G(W,H)
        for (x,y) in comp: lg.p[y][x]=g.p[y][x]
        # take adjacent outline pixels along
        for (x,y) in comp:
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                a,b=x+dx,y+dy
                if 0<=a<W and 0<=b<H and g.p[b][a]=='K':
                    lg.p[b][a]='K'
        # restore what is behind in the main image
        for (x,y) in comp:
            behind=None
            for dx in range(1,8):
                if x-dx>=0 and g.p[y][x-dx] is not None and not isleaf(g.p[y][x-dx]) and g.p[y][x-dx]!='K': behind=g.p[y][x-dx]; break
            g.p[y][x]=behind if behind in ('in','in+','in-') else None if behind is None else behind
        ys=[p[1] for p in comp]; xs=[p[0] for p in comp]
        out.append(dict(svg=paths(lg), ox=(min(xs)+max(xs)+1)/2, oy=max(ys)+1))
    return out

result={'chair':[],'clock':[],'shelf':[],'wall':[]}
SEAT={'wing_red':30,'wing_check':30,'velvet':30,'club':27,'beanbag':28,'rocking':22,'egg':28,'strandkorb':26,'peacock':27,'sofa':27}
for cat in ('chair','clock','shelf'):
    for it in items[cat]:
        g=build(it)
        d=dict(id=it['id'],name=it['name'],w=g.w,h=g.h)
        if cat=='shelf' or it['id']=='tree':
            d['leaves']=split_leaves(g)
        d['svg']=paths(g)
        if cat=='clock':
            d['cx']=it['cx']*2; d['cy']=it['cy']*2; d['r']=it['r']*2
            if 'pendulum' in it: p=dict(it['pendulum']); p['x']*=2; p['y']*=2; p['len']*=2; d['pendulum']=p
            for k in ('weights','second'):
                if k in it: d[k]=it[k]
        if cat=='chair': d['seat']=SEAT[it['id']]
        result[cat].append(d)

# ---------- clock extras: animated parts ----------
def find(cat,id): return [x for x in result[cat] if x['id']==id][0]
# owl eyelids (cover both eyes) – fine eye centres (10.8,12) and (21.2,12)
lid=G(32,40); lid.ell(10.8,12,4.6,4.6,'ow'); lid.ell(21.2,12,4.6,4.6,'ow'); lid.rect(6,12,15,12,'ow-'); lid.rect(17,12,26,12,'ow-')
for (cx,cy) in ((10.8,12),(21.2,12)):
    for y in range(40):
        for x in range(32):
            d=((x+.5-cx)**2+(y+.5-cy)**2)**.5
            if 4.3<d<=5.2 and lid.p[y][x] is None: pass
shade('ow','-')
find('clock','owl')['lid']=paths(lid)
# cuckoo bird
bd=G(12,9)
for y,row in enumerate(["....KKK.....","...KbbbK....","..KbbKbbK...","KKKbbbbbbK..","KyKbbbbbbbK.","..KbbbbbbbbK","...KbbbbbKK.","....KKKKK...","............"]):
    for x,ch in enumerate(row):
        if ch!='.': bd.p[y][x]={'K':'K','b':'bird','y':'flame'}[ch]
find('clock','cuckoo')['bird']=paths(bd)
# alarm ring marks
rg=G(32,34)
for pts in ([(1,4),(0,5)],[(30,4),(31,5)],[(2,0),(3,1)],[(29,0),(28,1)],[(0,10),(1,10)],[(30,10),(31,10)]):
    for x,y in pts: rg.p[y][x]='K'
find('clock','alarm')['ring']=paths(rg)
# star twinkles
tw=G(36,36)
for (x,y) in ((18,0),(35,12),(30,33),(5,33),(0,12)):
    for dx,dy in ((0,0),(1,0),(-1,0),(0,1),(0,-1)): tw.put(x+dx,y+dy,'flame')
find('clock','star')['twinkle']=paths(tw)

# ---------- wallpapers: 2x tiles with extra detail ----------
def tile2(it):
    g=scale2x(it['raw']); W,H=g.w,g.h
    id_=it['id']
    if id_=='flowers':
        for (x,y) in ((4,4),(16,16)): g.put(x+1,y+1,'fy+' if 'fy+' in PAL else shade('fy','+'))
    if id_=='cream':
        g.p[1][1]=None
    if id_=='planks':
        for x in range(W):
            if (x//3)%5==2: g.put(x,7,shade('pl','-'))
        g.put(3,12,'pl2'); g.put(15,3,'pl2')
    if id_=='gingham':
        for y in range(H):
            for x in range(W):
                if (x+y)%4==0 and g.p[y][x]=='bl2': g.p[y][x]=shade('bl2','+')
    if id_=='hearts':
        for (x,y) in ((3,3),(13,13)): g.put(x,y,shade('hr','+'))
    if id_=='sunflower':
        for (x,y) in ((11,11),(12,12)): g.put(x,y,shade('sf3','+'))
    for y in range(H):
        for x in range(W):
            if g.p[y][x] is None: g.p[y][x]=it['raw'].p[0][0]
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" shape-rendering="crispEdges">'+paths(g)+'</svg>'
    d=dict(id=id_,name=it['name'],tile=svg,w=it['w'],h=it['h'])
    if id_=='stars':
        tw=G(W,H)
        for (x,y) in ((14,6),(8,18),(20,2),(3,10)): tw.put(x,y,'ns'); tw.put(x+1,y,shade('ns','+'))
        d['twinkle']=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" shape-rendering="crispEdges">'+paths(tw)+'</svg>'
    if id_=='clouds': d['drift']=True
    return d
for it in items['wall']: result['wall'].append(tile2(it))

# ---------- FLOORS (tiles, 1 pixel = 1 room pixel) ----------
import random
def ftile(id_,name,w,h,draw):
    g=G(w,h); draw(g)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" shape-rendering="crispEdges">'+paths(g)+'</svg>'
    result['floor'].append(dict(id=id_,name=name,tile=svg,w=w*2,h=h*2))
result['floor']=[]
def planks(base,dark,light,knot):
    C('fa',base); C('fb',dark); C('fc',light); C('fk',knot)
    def d(g):
        g.rect(0,0,35,11,'fa'); g.rect(0,0,35,0,'fc'); g.rect(0,5,35,5,'fb'); g.rect(0,6,35,6,'fc'); g.rect(0,11,35,11,'fb')
        g.px('fb',[(11,y) for y in range(0,5)]+[(29,y) for y in range(6,11)])
        g.px('fk',[(3,2),(4,2),(5,2),(18,3),(19,3),(24,2),(25,2),(26,2),(2,8),(3,8),(14,9),(15,9),(16,9),(33,8),(34,8)])
        g.px('fb',[(13,2),(27,8)])
    return d
ftile('planks','Helle Dielen',36,12,planks('#e6c697','#c49a64','#f0d6ac','#d4ae7a'))
C('pa','#8a5a34'); C('pb','#6a4024'); C('pc','#a8744a'); C('pk','#7a4c2c')
def dark(g):
    g.rect(0,0,35,11,'pa'); g.rect(0,0,35,0,'pc'); g.rect(0,3,35,3,'pb'); g.rect(0,4,35,4,'pc'); g.rect(0,7,35,7,'pb'); g.rect(0,8,35,8,'pc'); g.rect(0,11,35,11,'pb')
    g.px('pb',[(8,y) for y in (1,2)]+[(26,y) for y in (5,6)]+[(17,y) for y in (9,10)]+[(33,y) for y in (1,2)])
    g.px('pk',[(3,1),(4,1),(14,6),(15,6),(21,2),(22,2),(29,9),(30,9),(5,10)])
ftile('parquet','Dunkles Parkett',36,12,dark)
C('ha','#d9ae74'); C('hb','#b88a52'); C('hc','#ecc890')
def herring(g):
    g.rect(0,0,15,15,'ha')
    for y in range(16):
        for x in range(16):
            u=(x+y)%16; v=(x-y)%16
            if (x//4+y//4)%2==0:
                if u%4==0: g.p[y][x]='hb'
                elif u%4==1: g.p[y][x]='hc'
            else:
                if v%4==0: g.p[y][x]='hb'
                elif v%4==1: g.p[y][x]='hc'
ftile('herring','Rautenparkett',16,16,herring)
C('ta','#f4ead8'); C('tb','#c8644a'); C('tc','#ffffff'); C('td','#a84a34')
def checker(g):
    for y in range(16):
        for x in range(16):
            g.p[y][x]='ta' if (x//8+y//8)%2==0 else 'tb'
    g.px('tc',[(1,1),(2,1),(1,2)]); g.px('td',[(14,6),(13,7)]); g.px('tc',[(9,9),(10,9),(9,10)]); g.px('td',[(6,14),(5,15)])
ftile('checker','Schachbrettfliesen',16,16,checker)
C('ka','#d9825a'); C('kb','#b8603e'); C('kc','#eaa07a'); C('kg','#efe2cc')
def terra(g):
    g.rect(0,0,11,11,'kg')
    for (x0,y0) in ((0,0),(6,6),(-6,6),(6,-6)):
        for y in range(y0+1,y0+6):
            for x in range(x0+1,x0+11):
                if 0<=x<12 and 0<=y<12: g.p[y][x]='ka'
    for y in range(12):
        for x in range(12):
            if g.p[y][x]=='ka' and (y in (1,7)): g.p[y][x]='kc'
            if g.p[y][x]=='ka' and (y in (5,11)): g.p[y][x]='kb'
ftile('terracotta','Ziegelboden',12,12,terra)
def carpet(id_,name,a,b,c):
    C(id_+'1',a); C(id_+'2',b); C(id_+'3',c)
    def d(g):
        random.seed(id_)
        for y in range(12):
            for x in range(12):
                r=random.random(); g.p[y][x]=id_+('2' if r<0.18 else '3' if r<0.3 else '1')
    ftile(id_,name,12,12,d)
carpet('carpet','Beiger Teppich','#e8d6b8','#d8c2a0','#f4e6cc')
carpet('pinkcarpet','Rosa Teppich','#f4c4cc','#e6a8b4','#fcdce2')
C('ma','#c4e6d8'); C('mb','#f4f1ea'); C('mc','#e0f4ec'); C('md','#9ccab8')
def mint(g):
    g.rect(0,0,7,7,'mb')
    g.rect(0,0,6,6,'ma'); g.rect(0,0,6,0,'mc'); g.rect(0,0,0,6,'mc'); g.rect(1,6,6,6,'md'); g.rect(6,1,6,6,'md')
ftile('mint','Mintfliesen',8,8,mint)
C('sa','#e2cf8a'); C('sb','#c8b26a'); C('sc','#f0e2a8'); C('sg','#6e8a4a')
def tatami(g):
    g.rect(0,0,15,7,'sa')
    for y in range(8):
        for x in range(16):
            if (x+(y//2)*2)%4==0: g.p[y][x]='sb'
            elif (x+(y//2)*2)%4==1: g.p[y][x]='sc'
    g.rect(0,7,15,7,'sg')
ftile('tatami','Strohmatte',16,8,tatami)
C('oa','#c89a68'); C('ob','#a87a4c'); C('oc','#e0b888'); C('od','#8a5e38')
def cork(g):
    random.seed(7)
    for y in range(12):
        for x in range(12):
            r=random.random(); g.p[y][x]='ob' if r<0.2 else 'oc' if r<0.32 else 'od' if r<0.36 else 'oa'
ftile('cork','Kork',12,12,cork)

json.dump(result,open('furn2.json','w'),ensure_ascii=False)

# ---------- sheet ----------
def raster(svg,w,h,sc,bg=None):
    im=Image.new('RGBA',(w*sc,h*sc),bg or (0,0,0,0)); d=ImageDraw.Draw(im)
    for m in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
        for x,y,n in re.findall(r'M(\d+) (\d+)h(\d+)', m.group(2)):
            x,y,n=int(x),int(y),int(n); d.rectangle([x*sc,y*sc,(x+n)*sc-1,y*sc+sc-1],fill=m.group(1))
    return im
sheet=Image.new('RGB',(10*170,5*190),'#fff8ee')
for r,cat in enumerate(['chair','clock','shelf','wall','floor']):
    for i,it in enumerate(result[cat]):
        if cat in('wall','floor'):
            mm=re.search(r'viewBox="0 0 (\d+) (\d+)"',it['tile']); w,h=int(mm.group(1)),int(mm.group(2))
            t=raster(it['tile'],w,h,3); im=Image.new('RGB',(150,150))
            for yy in range(0,150,t.height):
                for xx in range(0,150,t.width): im.paste(t,(xx,yy))
        else:
            sc=max(1,min(150//it['w'],170//it['h'])); svg=it['svg']+''.join(l['svg'] for l in it.get('leaves',[]))
            im=raster(svg,it['w'],it['h'],sc)
        sheet.paste(im,(i*170+10,r*190+10),im if im.mode=='RGBA' else None)
sheet.save('furn2_sheet.png'); print('ok', {k:len(v) for k,v in result.items()}, len(json.dumps(result))//1024,'KB')
