# more detailed garden beds in the scene's pixel style (same 66x22 size, same soil line)
from lib import G
import json, random
pal=dict(K='#3a2414')
def C(**kw): pal.update(kw)
C(wd='#b07a44', wd2='#8a5a30', wd3='#c9955a', wd4='#5e3a1c', wd5='#dcae72',
  so='#6e4a2e', so2='#4e3220', so3='#8e6644', so4='#a07a52',
  st='#a8a8b4', st2='#7e7e8c', st3='#cacad4', st4='#62626e', mo='#6fa046', mo2='#4e7c34', gr='#5aa04e', gr2='#3e7c3c', gr3='#8ccc72', nl='#4a4a52')
def paths(g):
    d={}
    for y in range(g.h):
        for x in range(g.w):
            c=g.p[y][x]
            if c: d.setdefault(c,[]).append(f'M{x} {y}h1v1h-1z')
    return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in d.items())
def soil(g, x0, x1, y0, y1, r):
    g.rect(x0,y0,x1,y1,'so'); g.rect(x0,y0,x1,y0,'so2')
    for y in range(y0+1,y1+1):
        for x in range(x0,x1+1):
            v=r.random()
            if v<.16: g.put(x,y,'so3')
            elif v<.24: g.put(x,y,'so2')
            elif v<.27 and y>y0+1: g.put(x,y,'so4')
    # three gentle mounds where the plants sit
    for cx in (12,33,54):
        for dx in range(-6,7):
            if abs(dx)<5: g.put(cx+dx,y0+1,'so3' if (dx+cx)%3 else 'so4')
def plank(g, x0, x1, y0, y1, r, light='wd3', base='wd', dark='wd2'):
    g.rect(x0,y0,x1,y1,base); g.rect(x0,y0,x1,y0,light); g.rect(x0,y1,x1,y1,dark)
    for y in range(y0+1,y1):
        x=x0+r.randint(0,6)
        while x<x1-3:
            ln=r.randint(3,8); g.rect(x,y,min(x1-1,x+ln),y,dark if r.random()<.6 else light); x+=ln+r.randint(5,11)
    for _ in range(max(1,(x1-x0)//28)):
        kx=r.randint(x0+5,x1-6); ky=(y0+y1)//2; g.put(kx,ky,'wd4'); g.put(kx+1,ky,dark); g.put(kx-1,ky,dark)
def tuft(g, x, y, r):
    for dx,h in ((0,2),(1,3),(2,1),(-1,1)):
        for k in range(h): g.put(x+dx,y-k,'gr' if k else 'gr2')
    g.put(x+1,y-3,'gr3')
def wood():
    r=random.Random(7); g=G(66,22)
    g.rect(1,7,64,9,'wd3'); g.rect(1,7,64,7,'wd5'); g.rect(3,9,62,9,'wd2')      # top rim
    soil(g,4,61,10,13,r)
    plank(g,1,64,14,17,r); plank(g,1,64,18,21,r)
    g.rect(1,14,64,14,'wd5'); g.rect(1,17,64,17,'wd4')
    for x in (1,62):                                                              # corner posts
        g.rect(x,6,x+2,21,'wd2'); g.rect(x,6,x+2,6,'wd3'); g.rect(x+1,7,x+1,21,'wd')
        for y in (10,16,19): g.put(x+1,y,'nl')
    for x in (22,43): g.rect(x,14,x,21,'wd2'); g.put(x,15,'nl'); g.put(x,19,'nl')
    g.outline('K')
    for x,y in ((5,21),(29,21),(47,21),(60,21)): tuft(g,x,y,r)
    return g
def stone():
    r=random.Random(3); g=G(66,22)
    soil(g,4,61,10,13,r)
    stones=[]
    for row,(y,ry,step,off) in enumerate(((16.5,3.4,7,3.5),(19.5,2.4,8,0))):
        x=off
        while x<64:
            stones.append((x+r.uniform(-.5,.5),y+r.uniform(-.4,.4),r.uniform(3.2,4.2) if row==0 else r.uniform(3.6,4.6),ry)); x+=step+r.uniform(-1,1)
    stones.sort(key=lambda t:t[1])
    for (cx,cy,rx,ry) in stones:
        cx=max(rx,min(65-rx,cx))
        g.ell(cx,cy,rx+.9,ry+.9,'st4'); g.ell(cx,cy,rx,ry,'st')
        g.ell(cx-.8,cy-.8,rx*.55,ry*.45,'st3'); g.put(int(cx+rx*.5),int(cy+ry*.6),'st2'); g.put(int(cx+rx*.5)-1,int(cy+ry*.6),'st2')
    for x in range(1,65):
        if r.random()<.35 and g.p[13][x]: g.put(x,13,'mo')
        if r.random()<.15: g.put(x,14,'mo2')
    g.outline('K')
    for x,y in ((8,21),(36,21),(57,21)): tuft(g,x,y,r)
    return g
def raised():
    r=random.Random(11); g=G(66,22)
    g.rect(1,1,64,3,'wd3'); g.rect(1,1,64,1,'wd5'); g.rect(3,3,62,3,'wd2')
    soil(g,4,61,4,7,r)
    plank(g,1,64,8,11,r); plank(g,1,64,12,15,r)
    g.rect(1,8,64,8,'wd5'); g.rect(1,11,64,11,'wd4'); g.rect(1,15,64,15,'wd4')
    for x in (1,61):
        g.rect(x,0,x+3,21,'wd2'); g.rect(x,0,x+3,0,'wd3'); g.rect(x+1,1,x+1,21,'wd')
        for y in (5,10,14): g.put(x+2,y,'nl')
    g.rect(5,16,60,17,'wd2'); g.rect(5,16,60,16,'wd')                             # cross brace shadow
    g.outline('K')
    for x,y in ((7,21),(58,21)): tuft(g,x,y,r)
    return g
# shift the soil mounds of the raised bed: soil row there is 5
out={}
for k,fn in (('wood',wood),('stone',stone),('raised',raised)):
    g=fn(); out['bed_'+k]=dict(svg=paths(g),w=g.w,h=g.h)
    from PIL import Image
    im=Image.new('RGBA',(g.w,g.h))
    for y in range(g.h):
        for x in range(g.w):
            c=g.p[y][x]
            if c: im.putpixel((x,y),tuple(int(pal[c][i:i+2],16) for i in (1,3,5))+(255,))
    im.resize((g.w*10,g.h*10),Image.NEAREST).save(f'/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/mock2/bed2_{k}.png')
json.dump(out,open('beds2.json','w'))
print('ok')
