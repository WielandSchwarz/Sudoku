# Bimmelbahn art, second pass: a detailed map (village, windmill, mountain, lake, forest, stream with bridges)
# and a station scene per stop (own backdrop, station building with its name, platform; train and wheels as separate sprites so it can roll in)
import json, math, io, base64, os
from PIL import Image
exec(open('mk2.py').read().split("riders=[")[0])   # L, INK, head, dot, clock, ST ...
def uri(im): b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def H(c): return C(c)
def poly(o,pts,c):
    ys=[p[1] for p in pts]
    for y in range(int(min(ys)),int(max(ys))+1):
        xs=[]; n=len(pts)
        for i in range(n):
            (x0,y0),(x1,y1)=pts[i],pts[(i+1)%n]
            if (y0>y+.5)!=(y1>y+.5): xs.append(x0+(y+.5-y0)*(x1-x0)/(y1-y0))
        xs.sort()
        for a,b in zip(xs[::2],xs[1::2]):
            for x in range(int(math.ceil(a-.5)),int(math.floor(b-.5))+1): o.px(x,y,c)
def line(o,x0,y0,x1,y1,c):
    n=int(max(abs(x1-x0),abs(y1-y0)))+1
    for i in range(n+1): t=i/max(1,n); o.px(round(x0+(x1-x0)*t),round(y0+(y1-y0)*t),c)
GR='#9cc87a'; GR2='#8ab86a'; GR3='#7aa85a'; GRL='#b4d892'
TREE=('#7ab85e','#5a9a44','#447e36'); FIR=('#5a9a50','#3e7a3a','#2e5e2e'); BARK='#8a5a34'
CREAM='#f4e8d0'; CREAM2='#e4d4b4'; WOOD='#a8743c'; WOOD2='#8a5a34'; STONE='#c8c0b0'; STONE2='#a89a88'; STONEL='#e0d8c8'
WAT=('#d4f0fc','#7cc4ec','#5aa8dc','#4a90c4')
ROOF={k:v for k,v in ST.items()}
def light(c,f=.25):
    r,g,b,a=H(c); return (int(r+(255-r)*f),int(g+(255-g)*f),int(b+(255-b)*f),255)
def dark(c,f=.2):
    r,g,b,a=H(c); return (int(r*(1-f)),int(g*(1-f)),int(b*(1-f)),255)
# ---------------------------------------------------------------- tiny font for station names
FONT={'D':['110','101','101','101','110'],'O':['010','101','101','101','010'],'R':['110','101','110','101','101'],'F':['111','100','110','100','100'],
 'M':['10001','11011','10101','10001','10001'],'H':['101','101','111','101','101'],'L':['100','100','100','100','111'],'E':['111','100','110','100','111'],
 'S':['011','100','010','001','110'],'W':['10001','10001','10101','11011','10001'],'A':['010','101','111','101','101'],'B':['110','101','110','101','110'],
 'G':['011','100','101','101','011'],'U':['101','101','101','101','111']}
def text(o,s,x,y,c):
    for ch in s:
        if ch=='Ü':
            g=FONT['U']; o.px(x,y-2,c); o.px(x+2,y-2,c)
        else: g=FONT[ch]
        for yy,row in enumerate(g):
            for xx,v in enumerate(row):
                if v=='1': o.px(x+xx,y+yy,c)
        x+=len(g[0])+1
    return x
def tw(s): return sum(len(FONT['U' if ch=='Ü' else ch][0])+1 for ch in s)-1
NAMES={'dorf':'DORF','muehle':'MÜHLE','see':'SEE','wald':'WALD','berg':'BERG'}
# ---------------------------------------------------------------- map pieces
NODES={'dorf':(22,22),'j1':(70,22),'muehle':(158,22),'j2':(158,56),'see':(158,84),'wald':(22,84),'berg':(96,56),'c1':(70,56)}
SEG=[('dorf','j1'),('j1','muehle'),('j1','c1'),('c1','berg'),('berg','j2'),('muehle','j2'),('j2','see'),('see','wald'),('wald','dorf')]
SEGS=[(NODES[a],NODES[b]) for a,b in SEG]
def segd(x,y):
    """distance of pixel centre to the nearest track centre line: perpendicular offset, rounded at the ends"""
    best=99
    for (x0,y0),(x1,y1) in SEGS:
        ax,bx=min(x0,x1),max(x0,x1); ay,by=min(y0,y1),max(y0,y1)
        dx=max(ax-x,0,x-bx); dy=max(ay-y,0,y-by)
        d=math.hypot(dx,dy) if dx and dy else max(dx,dy)
        best=min(best,d)
    return best
def tree(o,x,y,s=0):   # round deciduous tree, foot at (x,y)
    t=L(14,16); t.r(6,10,2,5,BARK); t.ell(7,6,6,5.4,TREE[1]); t.outline()
    t.ell(6,5,4,3.4,TREE[0]); t.px(4,3,light(TREE[0],.3)); t.px(5,3,light(TREE[0],.3))
    for (a,b) in ((9,8),(10,7),(8,9),(4,9)): t.px(a,b,TREE[2])
    t.px(7,14,dark(BARK)); o.on(t,x-7,y-15)
def fir(o,x,y,h=14):
    w=h*0.6; t=L(int(w)+4,h+3)
    cx=(int(w)+4)/2
    for i,(top,bot,wid) in enumerate(((0,h*.45,w*.55),(h*.25,h*.72,w*.8),(h*.5,h,w))):
        poly(t,[(cx,top),(cx+wid/2,bot),(cx-wid/2,bot)],FIR[1])
    t.r(int(cx)-1,h,2,3,BARK); t.outline()
    for i,(top,bot,wid) in enumerate(((0,h*.45,w*.55),(h*.25,h*.72,w*.8),(h*.5,h,w))):
        for yy in range(int(top)+2,int(bot)):
            xx=int(cx-(yy-top)/(bot-top)*wid/2)+1
            if t.p[xx,yy]==H(FIR[1]): t.px(xx,yy,FIR[0])
        t.r(int(cx-wid/2)+2,int(bot)-1,int(wid)-3,1,FIR[2])
    o.on(t,int(x-cx),y-h-2)
def bush(o,x,y,c=TREE[1]):
    t=L(9,6); t.ell(4.5,3.5,3.6,2.4,c); t.outline(); t.px(3,2,light(c,.3)); o.on(t,x-4,y-5)
def flowers(o,area,n,seed,cols=('#ffffff','#f6d84a','#f4a3b4')):
    x0,y0,x1,y1=area
    for i in range(n):
        x=x0+(i*37+seed*11)%(x1-x0); y=y0+(i*23+seed*7)%(y1-y0)
        if segd(x+.5,y+.5)>5.5: o.px(x,y,cols[i%len(cols)])
def house(o,x,y,roof,w=12,h=8,door=True):   # 3/4 view: roof on top, facade below; (x,y) is the top-left of the roof
    t=L(w+2,h+9); poly(t,[(1,6),(w/2+1,0),(w+1,6)],roof); t.r(1,6,w,1,roof); t.r(2,7,w-2,h,CREAM); t.outline()
    t.r(2,7,w-2,1,CREAM2)
    for yy in range(1,6): t.px(int(w/2+1-yy*w/12)+1,yy,light(roof,.3))
    if door: t.r(int(w/2),h+2,2,5,WOOD2); t.r(3,9,2,2,'#bfe4f4'); t.r(w-3,9,2,2,'#bfe4f4')
    else: t.r(3,9,2,2,'#bfe4f4'); t.r(w-3,9,2,2,'#bfe4f4')
    t.px(3,9,INK) if False else None
    o.on(t,x,y)
def station_map(o,k,x,y):   # little station building, front facing down; (x,y) = centre of its front bottom
    c=ROOF[k]; t=L(22,17)
    t.r(1,4,20,3,c); t.r(2,1,18,3,c); t.r(3,7,16,8,CREAM); t.outline()
    t.r(2,1,18,1,light(c,.35)); t.r(1,6,20,1,dark(c,.2)); t.r(3,7,16,1,CREAM2)
    t.r(9,10,4,5,WOOD2); t.px(10,12,WOOD); t.r(4,9,3,3,'#bfe4f4'); t.r(15,9,3,3,'#bfe4f4'); t.px(4,9,'#ffffff'); t.px(15,9,'#ffffff')
    s=L(9,9); s.ell(4.5,4.5,3.4,3.4,'#fff8ec'); s.outline(); s.ell(4.5,4.5,2,2,c)   # round sign in the station colour
    t.on(s,6,0)
    o.on(t,x-11,y-16)
def platform_map(o,x0,y0,x1,y1):
    o.r(x0,y0,x1-x0,y1-y0,STONE); o.r(x0,y0,x1-x0,1,STONEL)
def windmill_body(o,x,y):   # tower; hub at (x,y)
    t=L(14,16); poly(t,[(4,3),(10,3),(12,15),(2,15)],'#f4e8d0'); poly(t,[(3,4),(7,-1),(11,4)],'#c8463c'); t.outline()
    t.r(6,10,2,5,WOOD2); t.px(5,7,'#bfe4f4'); t.r(4,13,1,2,CREAM2); t.r(9,8,1,7,CREAM2)
    o.on(t,x-7,y-3)
def sails(n,R=8,size=19):
    s=L(size,size); c=size/2
    for i in range(4):
        a=n*math.pi/6+i*math.pi/2; ca,sa=math.cos(a),math.sin(a)
        for r in range(2,R+1):
            for w in (1,2,3):
                if r<3: continue
                px=c+ca*r-sa*w; py=c+sa*r+ca*w
                s.px(int(px),int(py),'#fff8ec' if (r+w)%3 else '#e4d4b4')
        for r in range(0,R+1): s.px(int(c+ca*r),int(c+sa*r),WOOD2)
    s.outline(); s.px(int(c),int(c),INK); return s
def duck(o=None):
    d=L(7,6); d.ell(3.5,3.6,2.8,1.8,'#fff8ec'); d.ell(5,1.8,1.4,1.4,'#fff8ec'); d.outline(); d.px(6,2,'#f0a040'); d.px(5,1,INK); return d
def mountain(o):
    m=L(84,32)
    poly(m,[(0,30),(14,6),(20,10),(26,2),(40,30)],'#9a9aa6'); poly(m,[(26,30),(46,4),(54,9),(62,0),(84,30)],'#8a8a96'); m.outline()
    poly(m,[(22,6),(26,2),(30,8),(27,7),(24,9)],'#fff8ec'); poly(m,[(57,4),(62,0),(66,6),(63,5),(60,7)],'#fff8ec'); poly(m,[(43,8),(46,4),(49,8),(46,7)],'#fff8ec')
    for (x0,y0,x1,y1) in ((14,7,6,22),(46,5,36,22),(62,1,52,20)): line(m,x0,y0,x1,y1,'#b4b4be')
    for (x0,y0,x1,y1) in ((27,4,34,22),(63,2,72,22)): line(m,x0,y0,x1,y1,'#76767f')
    for x in range(1,83):
        for y in range(22,30):
            if m.p[x,y][3] and m.p[x,y]!=INK and (x+y)%5==0: m.px(x,y,'#7aa85a')
    return m
def build_map():
    W=L(180,104); W.r(0,0,180,104,GR)
    for i in range(420):   # grass texture: tufts
        x=(i*53+7)%180; y=(i*29+3)%104
        if segd(x+.5,y+.5)>5.5: W.px(x,y,GR2); W.px(x+1,y-1,GR2) if i%3==0 else None
    for i in range(90):
        x=(i*71+19)%180; y=(i*43+11)%104
        if segd(x+.5,y+.5)>5.5: W.px(x,y,GRL)
    # lake (bottom, right), sandy shore
    lk=L(74,18); lk.ell(37,10,36,8.4,'#e8d8a8'); lk.outline(); lk.ell(38,10.5,33,6.6,WAT[1]); W.on(lk,74,88)
    for (x,y,w) in ((86,94,6),(100,98,9),(120,93,5),(132,99,7),(112,101,4)): W.r(x,y,w,1,WAT[0])
    for (x,y) in ((80,96),(83,99),(141,93),(139,97)): W.r(x,y-3,1,4,'#5a8a3c'); W.px(x,y-4,WOOD2)
    W.r(146,93,8,3,WOOD); W.r(146,93,8,1,light(WOOD,.3)); W.r(146,96,1,2,WOOD2); W.r(153,96,1,2,WOOD2)   # little pier
    # stream from the mountain to the lake (under two bridges)
    sp=[(128,48),(128,52),(127,56),(126,60),(127,64),(129,68),(130,72),(129,76),(128,80),(128,84),(127,88),(126,91)]
    for (x,y),(x2,y2) in zip(sp,sp[1:]):
        for t in range(0,5):
            yy=y+(y2-y)*t/4; xx=x+(x2-x)*t/4
            W.r(int(xx)-2,int(yy),5,1,WAT[1]); W.px(int(xx)-3,int(yy),INK); W.px(int(xx)+3,int(yy),INK)
    for y in range(50,92,5): W.px(127 if y%2 else 128,y,WAT[0])
    # mountain behind the Berg station
    W.on(mountain(W),74,24)
    # ballast, sleepers, rails
    for y in range(104):
        for x in range(180):
            d=segd(x+.5,y+.5)
            if d<=4.6: W.px(x,y,'#d4c8a4' if (x*7+y*3)%11 else '#b8aa84')
            elif d<=5.6: W.px(x,y,'#b8aa84')
    for (x0,y0),(x1,y1) in SEGS:
        if y0==y1:
            for x in range(min(x0,x1)+4,max(x0,x1)-3):
                if x%4==0: W.r(x,y0-3,2,7,WOOD2); W.px(x,y0-3,WOOD); W.px(x+1,y0+3,'#6a4428')
        else:
            for y in range(min(y0,y1)+4,max(y0,y1)-3):
                if y%4==0: W.r(x0-3,y,7,2,WOOD2); W.px(x0-3,y,WOOD); W.px(x0+3,y+1,'#6a4428')
    for y in range(104):
        for x in range(180):
            d=segd(x+.5,y+.5)
            if 1.5<d<=2.5: W.px(x,y,'#5e5e68')
    # bridges where the stream crosses
    for by in (56,84):
        W.r(121,by-6,13,1,INK); W.r(121,by+6,13,1,INK); W.r(121,by-5,13,1,light(WOOD,.25)); W.r(121,by+5,13,1,WOOD2)
        for x in (121,125,129,133): W.px(x,by-7,INK); W.px(x,by+7,INK)
    # stations and platforms
    for k,(x,y,side) in {'dorf':(22,22,'u'),'muehle':(158,22,'u'),'berg':(96,56,'u'),'see':(158,84,'d'),'wald':(22,84,'d')}.items():
        if side=='u': platform_map(W,x-11,y-6,x+11,y-4); station_map(W,k,x,y-6)
        else: platform_map(W,x-11,y+5,x+11,y+7); station_map(W,k,x,y+23)
    # Dorf: houses along the top, a garden inside the loop
    house(W,36,1,'#c8463c',12,7); house(W,50,4,'#4a7ac0',10,6)
    W.r(2,30,1,1,INK)
    for x in range(30,62,3): W.px(x,40,WOOD2); W.px(x,41,WOOD2)
    W.r(30,39,32,1,WOOD)
    for x in range(31,61,4):
        for y in range(43,49,3): W.px(x,y,'#5aa84e'); W.px(x+1,y,'#e8604a') if (x+y)%3==0 else None
    tree(W,58,36)
    # Mühle: windmill, wheat fields
    def field(x,y,w,h):
        f=L(w+2,h+2); f.r(1,1,w,h,'#d8b048'); f.outline()
        for yy in range(2,h+1,2): f.r(1,yy,w,1,'#e9c860')
        for i in range(w//3): f.px(2+i*3,1+(i*2)%h,'#c09030')
        W.on(f,x,y)
    field(94,2,20,13)
    W.r(95,2,1,15,INK) if False else None
    windmill_body(W,128,9)
    field(165,28,12,9); field(165,42,12,9)
    tree(W,172,72)
    # Wald: firs left and bottom
    for (x,y,h) in ((6,50,14),(12,74,16),(4,90,15),(40,100,14),(52,96,12),(62,102,15),(9,104,13),(30,82,12),(46,80,10)): fir(W,x,y,h)
    bush(W,64,80); bush(W,84,78,TREE[2]); bush(W,150,48)
    # meadow inside: a few trees and flowers
    tree(W,104,78); tree(W,146,74)
    flowers(W,(26,60,150,82),40,3); flowers(W,(0,0,180,104),40,7)
    return W.im
# ---------------------------------------------------------------- map train sprites (3/4 view)
def m_engine(d):
    if d in 'rl':
        t=L(14,11); t.r(1,3,12,6,'#c8463c'); t.r(1,1,5,8,'#c8463c'); t.r(0,0,7,2,'#5a3418'); t.r(9,0,2,3,'#3a3a3a'); t.outline()
        t.r(1,3,12,1,'#e8706a'); t.r(2,3,3,2,'#bfe4f4'); t.r(7,4,1,4,'#e9b949'); t.r(1,8,12,1,'#8a2a24')
        t.px(3,9,'#3a3a3a'); t.px(8,9,'#3a3a3a'); t.px(11,9,'#3a3a3a')
        im=t.im
        return im if d=='r' else im.transpose(Image.FLIP_LEFT_RIGHT)
    t=L(10,14); t.r(2,1,6,12,'#c8463c'); t.r(1,8,8,5,'#5a3418'); t.r(2,9,6,3,'#c8463c'); t.outline()
    t.r(2,1,1,7,'#e8706a'); t.r(4,2,2,2,'#3a3a3a'); t.r(4,5,2,1,'#e9b949'); t.r(3,10,4,1,'#bfe4f4')
    im=t.im
    return im if d=='u' else im.transpose(Image.FLIP_TOP_BOTTOM)
def m_coach(d):
    if d in 'rl':
        t=L(12,10); t.r(1,1,10,7,'#4e8c3c'); t.r(0,0,12,2,'#6a4a3a'); t.outline()
        t.r(1,2,10,1,'#6aa84e'); t.r(2,3,2,2,'#bfe4f4'); t.r(5,3,2,2,'#bfe4f4'); t.r(8,3,2,2,'#bfe4f4'); t.r(1,7,10,1,'#3e7030')
        t.px(2,8,'#3a3a3a'); t.px(9,8,'#3a3a3a'); return t.im
    t=L(10,12); t.r(1,1,8,10,'#6a4a3a'); t.outline(); t.r(2,1,6,10,'#7a5a48'); t.r(2,1,1,10,'#8a6a58'); t.r(1,2,1,8,'#4e8c3c'); t.r(8,2,1,8,'#3e7030'); return t.im
def puff(r):
    s=L(2*r+3,2*r+3); s.ell(r+1.5,r+1.5,r,r,'#ffffff'); s.outline(); s.px(r,r,'#ffffff')
    if r>=3: s.r(int(r+1.5)+1,int(r+1.5)+1,max(1,r-2),1,'#e4ecf0')
    return s.im
# ---------------------------------------------------------------- station scene
SKY=('#a8d8f0','#bfe4f4','#d4eef8')
def sky(W):
    W.r(0,0,180,22,SKY[0]); W.r(0,22,180,22,SKY[1]); W.r(0,44,180,40,SKY[2])
    for x in range(0,180,2): W.px(x,22,SKY[1]); W.px(x+1,44,SKY[2])
def cloud(W,x,y,w):
    c=L(w+4,12); c.ell(w/2+2,7,w/2,3.6,'#ffffff'); c.ell(w/3+2,5,w/4,3.4,'#ffffff'); c.ell(w*.62+2,4.4,w/5,3.2,'#ffffff'); c.outline()
    c.r(3,9,w-2,1,'#e4ecf0'); W.on(c,x,y)
def hills(W,col1,col2,y1=60,y2=66):
    h=L(180,104); h.ell(36,y1+12,70,20,col1); h.ell(150,y2+12,72,20,col2); h.outline(); W.on(h)
def s_house(W,x,y,w,h,roof,col=CREAM):
    t=L(w+6,h+12); poly(t,[(1,10),(w/2+3,0),(w+5,10)],roof); t.r(3,10,w,h,col); t.outline()
    for yy in range(2,10): t.px(int(w/2+3-yy*(w/2+2)/10)+1,yy,light(roof,.3))
    t.r(3,10,w,1,dark(col,.12));
    for wx in range(6,w,8): t.r(wx,13,4,4,INK); t.r(wx+1,14,2,2,'#bfe4f4')
    W.on(t,x,y)
def church(W,x,y):
    t=L(16,40); t.r(3,12,10,27,'#f4e8d0'); poly(t,[(2,13),(8,0),(14,13)],'#4a7ac0'); t.outline()
    t.r(6,18,4,6,INK); t.r(7,19,2,4,'#bfe4f4'); t.px(8,1,'#e9b949'); t.ell(8,29,2,2,'#fff8ec'); t.px(8,29,INK); t.r(3,12,10,1,CREAM2)
    for yy in range(2,13): t.px(int(8-yy*6/13)+1,yy,light('#4a7ac0',.3))
    W.on(t,x,y)
def big_fir(W,x,y,h): fir(W,x,y,h)
def big_tree(W,x,y,r=9):
    t=L(int(r*2+4),int(r*2+10)); t.r(int(r+1),int(r*1.6),3,int(r*.9)+2,BARK); t.ell(r+2,r+1,r,r*.85,TREE[1]); t.outline()
    t.ell(r+.5,r-.5,r*.65,r*.55,TREE[0]); t.r(int(r*.6),int(r*.5),2,1,light(TREE[0],.3)); W.on(t,int(x-r-2),int(y-r*2-6))
def s_windmill(W,x,y):   # big windmill tower, hub at (x,y)
    t=L(30,46); poly(t,[(9,8),(21,8),(27,45),(3,45)],'#f4e8d0'); poly(t,[(6,10),(15,-1),(24,10)],'#c8463c'); t.outline()
    for yy in range(1,10): t.px(int(15-yy*.9)+1,yy,light('#c8463c',.3))
    t.r(12,34,6,11,WOOD2); t.r(13,35,4,10,WOOD); t.r(13,18,4,5,INK); t.r(14,19,2,3,'#bfe4f4'); t.r(4,8,22,2,dark('#c8463c'))
    for yy in range(12,45): t.px(int(9-(yy-8)*6/37)+2,yy,'#fff8ec'); t.px(int(21+(yy-8)*6/37)-2,yy,CREAM2)
    W.on(t,x-15,y-6)
def s_sails(n):
    return sails(n,R=19,size=41)
def bench(W,x,y):
    b=L(22,10); b.r(1,1,20,2,WOOD); b.r(1,4,20,2,WOOD); b.r(3,6,2,3,'#5e5e68'); b.r(17,6,2,3,'#5e5e68'); b.outline(); b.r(1,1,20,1,light(WOOD,.3)); W.on(b,x,y)
def lamp(W,x,y):
    l=L(9,34); l.r(4,6,1,26,'#5e5e68'); l.r(3,31,3,2,'#5e5e68'); l.r(1,1,7,5,'#3a3a3a'); l.outline(); l.r(2,2,5,3,'#ffe08a'); l.px(2,2,'#fff8ec'); W.on(l,x-4,y-33)
def flowerpot(W,x,y,c):
    f=L(10,11); f.r(2,6,6,4,'#c8794a'); f.ell(5,4,4,3.2,'#5aa84e'); f.outline(); f.r(2,6,6,1,'#e8a070')
    for (a,b) in ((3,3),(6,2),(5,5),(7,4)): f.px(a,b,c)
    W.on(f,x-5,y-10)
def suitcase(W,x,y,c):
    s=L(12,10); s.r(1,2,10,7,c); s.r(4,0,4,3,INK); s.outline(); s.r(5,1,2,1,(0,0,0,0)); s.r(1,2,10,1,light(c,.3)); s.r(5,4,2,2,'#e9b949'); W.on(s,x,y-9)
def mushroom(W,x,y):
    m=L(9,8); m.ell(4.5,3,3.6,2.4,'#e8604a'); m.r(3,4,3,3,'#fff8ec'); m.outline(); m.px(3,2,'#ffffff'); m.px(6,3,'#ffffff'); W.on(m,x-4,y-7)
def rock(W,x,y,w=10,h=6):
    r=L(w+2,h+2); r.ell(w/2+1,h/2+1.4,w/2,h/2,'#9a9aa6'); r.outline(); r.r(3,2,w//3,1,'#bcbcc6'); W.on(r,x,y-h-1)
def sailboat(W,x,y):
    b=L(18,18); poly(b,[(9,1),(9,12),(2,12)],'#fff8ec'); poly(b,[(10,3),(10,12),(15,12)],'#f4a3b4'); poly(b,[(1,13),(17,13),(14,16),(4,16)],WOOD); b.outline(); b.r(9,1,1,12,WOOD2); W.on(b,x,y)
def gull(W,x,y):
    for (a,b) in ((0,0),(1,-1),(2,0),(3,-1),(4,0)): W.px(x+a,y+b,INK)
def station_building(W,k):
    c=ROOF[k]; t=L(76,56)
    t.r(4,22,68,34,CREAM); poly(t,[(0,24),(10,6),(66,6),(76,24)],c); t.outline()
    t.r(10,6,56,1,light(c,.35)); t.r(1,23,74,1,dark(c,.25)); t.r(4,24,68,1,CREAM2)
    for x in range(14,66,6): line(t,x,8,x-3 if x<38 else x+3,22,light(c,.18))
    # clock gable
    g=L(20,18); poly(g,[(1,17),(10,1),(19,17)],c); g.outline(); g.ell(10,11,4,4,'#fff8ec'); g.ell(10,11,3,3,'#fff8ec'); g.px(10,9,INK); g.px(10,10,INK); g.px(11,11,INK); g.px(12,11,INK)
    g.r(7,6,1,1,light(c,.3)); t.on(g,28,-1) if False else None
    W.on(t,52,10)
    cl=L(14,14); cl.ell(7,7,6,6,'#fff8ec'); cl.outline(); cl.ell(7,7,4.6,4.6,'#fff8ec'); cl.r(7,3,1,5,INK); cl.r(7,7,3,1,INK); cl.px(7,1,INK) if False else None
    W.on(cl,83,4)
    # name board
    nm=NAMES[k]; w=tw(nm)+10; bd=L(w+2,13); bd.r(1,1,w,11,'#fff8ec'); bd.outline(); bd.r(1,10,w,2,CREAM2)
    text(bd,nm,6,4,INK); dot(bd,-1,2,c,2.1) if False else None
    W.on(bd,90-w//2,37)
    for wx in (60,108): W.r(wx,38,10,10,INK); W.r(wx+1,39,8,8,'#bfe4f4'); W.r(wx+1,39,2,2,'#ffffff'); W.r(wx+5,39,1,8,INK)
def platform_scene(W,k):
    W.r(0,96,180,39,GR)
    W.r(0,102,180,1,'#5e5e68'); W.r(0,103,180,1,'#8a8a94')
    for x in range(0,180,6): W.r(x,104,4,2,WOOD2)
    W.r(0,106,180,2,'#b8aa84')
    pf=L(180,24); pf.r(0,1,180,20,STONE); pf.outline()
    pf.r(0,1,180,2,STONEL); pf.r(0,4,180,1,'#f4e8a0'); pf.r(0,18,180,3,STONE2)
    for x in range(0,180,14):
        for y in (6,12): pf.r(x+(7 if y==12 else 0),y,1,5 if y==6 else 5,'#b8b0a0')
    pf.r(0,11,180,1,'#b8b0a0'); pf.r(0,17,180,1,'#b8b0a0')
    W.on(pf,0,107)
    W.r(0,129,180,6,'#8ab86a')
    for i in range(30): x=(i*37+5)%180; y=130+(i*13)%4; W.px(x,y,GR3)
    for i in range(10): x=(i*53+9)%176; W.px(x,131+(i*7)%3,('#ffffff','#f6d84a','#f4a3b4')[i%3])
def side_bg(k):
    W=L(180,135); sky(W)
    cloud(W,10,8,26); cloud(W,118,4,32); cloud(W,150,24,18)
    if k=='dorf':
        hills(W,'#8ab86a','#7aa85a',50,54)
        s_house(W,-2,40,22,14,'#c8463c'); church(W,26,16); s_house(W,130,38,24,16,'#4a7ac0'); s_house(W,156,44,22,12,'#e9b949')
        big_tree(W,48,68,8); big_tree(W,176,46,6) if False else None
    elif k=='muehle':
        hills(W,'#a8c87a','#98b86a',52,52)
        for i,y in enumerate(range(54,70,3)): W.r(128,y,52,2,'#e9c860' if i%2 else '#d8b048'); W.r(44,y,8,2,'#e9c860' if i%2 else '#d8b048')
        for (x,y) in ((140,48),(160,50)):
            hs=L(14,10); hs.ell(7,6,6,4,'#e9c860'); hs.outline(); hs.r(3,4,8,1,'#d8b048'); W.on(hs,x,y)
        s_windmill(W,26,28)
    elif k=='see':
        hills(W,'#8ab86a','#7aa85a',40,42)
        W.r(0,50,180,46,WAT[1]); W.r(0,50,180,1,INK)
        for (x,y,w) in ((8,54,10),(36,58,14),(150,55,9),(132,60,12),(20,61,8)): W.r(x,y,w,1,WAT[0])
        sailboat(W,16,35); sailboat(W,146,37); gull(W,40,22); gull(W,136,26); gull(W,148,22)
    elif k=='wald':
        hills(W,'#6a9a50','#5a8a44',46,48)
        for (x,y,h) in ((10,72,48),(32,70,38),(140,70,42),(162,74,52),(124,68,30),(46,66,26),(180,70,34)): fir(W,x,y,h)
    elif k=='berg':
        m=L(180,80)
        poly(m,[(0,78),(30,18),(44,30),(62,6),(96,78)],'#9a9aa6'); poly(m,[(80,78),(126,10),(140,22),(152,4),(180,40),(180,78)],'#8a8a96'); m.outline()
        poly(m,[(54,16),(62,6),(70,18),(64,15),(58,19)],'#fff8ec'); poly(m,[(146,12),(152,4),(160,14),(154,12),(150,15)],'#fff8ec'); poly(m,[(24,30),(30,18),(36,28),(30,26)],'#fff8ec'); poly(m,[(120,20),(126,10),(132,18),(126,17)],'#fff8ec')
        for (x0,y0,x1,y1) in ((30,19,16,60),(62,7,46,60),(126,11,108,60),(152,5,136,60)): line(m,x0,y0,x1,y1,'#b4b4be')
        for (x0,y0,x1,y1) in ((62,7,76,50),(152,5,168,50)): line(m,x0,y0,x1,y1,'#76767f')
        W.on(m,0,4); hills(W,'#7aa85a','#6a9a50',58,60)
    if k!='see':
        for y in range(70,96): W.r(0,y,180,1,GR)
    station_building(W,k)
    platform_scene(W,k)
    # platform props (behind the animals)
    Y=126
    if k=='dorf': bench(W,24,Y-9); flowerpot(W,52,Y,'#e8604a'); flowerpot(W,62,Y,'#f6d84a')
    elif k=='muehle': suitcase(W,26,Y-1,'#c8794a'); suitcase(W,36,Y-1,'#4a7ac0'); flowerpot(W,58,Y,'#ffffff')
    elif k=='see': bench(W,24,Y-9); flowerpot(W,56,Y,'#f4a3b4')
    elif k=='wald': mushroom(W,30,Y); mushroom(W,37,Y+1); bench(W,46,Y-9)
    elif k=='berg': rock(W,24,Y+1,10,6); suitcase(W,40,Y-1,'#c8463c'); bench(W,54,Y-9)
    border(W)
    return W.im
# ---------------------------------------------------------------- the side-view train (separate, so it can roll in)
CO='#4e8c3c'
def s_coach():
    t=L(56,38)
    t.r(2,5,52,22,CO); t.r(0,1,56,5,'#6a4a3a'); t.r(3,0,50,1,'#6a4a3a'); t.r(2,27,52,4,'#3a3a3a'); t.r(0,23,3,4,'#3a3a3a'); t.r(53,23,3,4,'#3a3a3a')
    t.outline()
    t.r(3,0,50,1,'#8a6a58'); t.r(1,1,54,1,'#8a6a58'); t.r(1,5,54,1,dark('#6a4a3a',.3))
    t.r(2,6,52,2,'#6aa84e'); t.r(2,9,52,12,CREAM); t.r(2,21,52,1,CREAM2); t.r(2,25,52,2,'#3e7030')
    for s in range(3):
        x=5+s*16; t.r(x,9,13,12,INK); t.r(x+1,10,11,10,'#bfe4f4'); t.r(x+1,10,3,1,'#ffffff'); t.px(x+1,11,'#ffffff')
    t.px(1,24,'#8a8a94'); t.px(54,24,'#8a8a94')
    return t
def s_engine():
    t=L(70,46)
    t.r(2,8,24,28,'#c8463c'); t.r(0,4,28,5,'#5a3418')   # cab and its roof
    t.r(24,18,36,18,'#c8463c')                            # boiler
    t.r(56,16,6,20,'#3a3a3a')                             # smoke box
    poly(t,[(47,4),(55,4),(54,7),(53,18),(49,18),(48,7)],'#3a3a3a')   # chimney
    t.ell(38,17,5,4,'#e9b949')                            # dome
    t.r(0,34,64,4,'#5a3418')                              # frame
    poly(t,[(60,38),(68,38),(64,44),(58,44)],'#8a8a94')   # cow catcher
    t.r(62,24,4,6,'#e9b949')                              # lamp
    t.outline()
    t.r(1,4,26,1,'#7a4a28'); t.r(3,9,22,2,'#e8706a'); t.r(25,18,31,2,'#e8706a'); t.r(25,33,31,1,'#8a2a24'); t.r(3,33,22,1,'#8a2a24')
    for x in (32,44): t.r(x,18,2,16,'#e9b949'); t.r(x,18,1,16,'#f6d880')
    t.r(36,14,3,2,'#f6d880'); t.r(48,4,7,1,'#5e5e68'); t.r(63,25,2,2,'#fff8ec'); t.r(57,17,1,18,'#5e5e68')
    t.r(6,13,14,12,INK); t.r(7,14,12,10,'#bfe4f4')
    hm=L(12,11); hm.ell(6,6,4.6,4,'#e8a860'); hm.ell(2.4,2.4,1.8,1.8,'#e8a860'); hm.ell(9.6,2.4,1.8,1.8,'#e8a860'); hm.outline(); hm.r(4,7,4,2,'#fff6e4'); hm.px(4,5,INK); hm.px(8,5,INK); hm.px(6,7,'#e07f95')
    cap=L(10,4); cap.r(1,1,8,2,'#4a7ac0'); cap.r(6,2,4,1,'#4a7ac0'); cap.outline()
    t.on(hm,7,15); t.on(cap,7,13)
    return t
def wheel(r,n,spokes=True):
    s=L(2*r+3,2*r+3); c=r+1.5; s.ell(c,c,r,r,'#c8463c' if r>4 else '#3a3a3a'); s.outline(); s.ell(c,c,r-1.2,r-1.2,'#3a3a3a' if r>4 else '#5e5e68')
    for i in range(2 if r<=4 else 3):
        a=n*math.pi/(6 if r>4 else 4)+i*math.pi/(3 if r>4 else 2)
        for rr in range(-r+1,r):
            s.px(int(c+math.cos(a)*rr),int(c+math.sin(a)*rr),'#c8463c' if r>4 else '#8a8a94')
    s.px(int(c),int(c),'#e9b949'); return s.im
# ---------------------------------------------------------------- write
A={}
A['map']=uri(build_map())
for k in ('maus','hase','fuchs','frosch','igel'):
    h=L(13,13); head(h,0,0,k); A['h_'+k]=uri(h.im)
    col={'maus':'#9a9aa6','hase':'#e8e0d8','fuchs':'#e8742c','frosch':'#6aa84e','igel':'#8a5a34'}[k]
    b=L(18,13); b.ell(9,6,6,4.4,col)
    if k in ('maus',): b.px(15,4,'#e8a0b0'); b.px(16,3,'#e8a0b0'); b.px(17,2,'#e8a0b0')
    if k=='fuchs': b.ell(15,4,2.6,1.8,col)
    if k=='hase': b.ell(15,5,1.6,1.6,col)
    b.r(5,10,2,2,col); b.r(11,10,2,2,col); b.outline()
    b.r(5,4,8,1,light(col,.3)); b.r(6,8,6,1,light(col,.45)) if k!='igel' else None
    if k=='fuchs': b.px(16,4,'#fff6e4')
    if k=='igel':
        for x in range(4,15,2): b.px(x,2,'#5a3418'); b.px(x+1,3,'#5a3418')
    A['b_'+k]=uri(b.im)
for k,col in ST.items():
    p=L(9,9); dot(p,0,0,col); A['p_'+k]=uri(p.im)
for hot in (0,1):
    s=L(17,17); s.ell(8.5,8.5,7.4,7.4,'#ffe08a' if hot else '#fff8ec'); s.outline(); s.ell(8.5,8.5,5.6,5.6,'#ffe08a' if hot else '#fff8ec'); s.r(4,13,9,1,'#efd9b8' if not hot else '#e9c860')
    A['sw%d'%hot]=uri(s.im)
for d in 'rlud': A['me_'+d]=uri(m_engine(d)); A['mc_'+d]=uri(m_coach(d))
for i in range(3): A['ms%d'%i]=uri(sails(i).im); A['bs%d'%i]=uri(s_sails(i).im)
A['duck']=uri(duck().im)
for i,r in enumerate((2,3,4)): A['puff%d'%i]=uri(puff(r))
for k in ST: A['side_'+k]=uri(side_bg(k))
A['s_coach']=uri(s_coach().im); A['s_engine']=uri(s_engine().im)
for n in range(2): A['whs%d'%n]=uri(wheel(4,n)); A['whb%d'%n]=uri(wheel(6,n))
json.dump(A,open('../ham2/zug.json','w')); print(os.path.getsize('../ham2/zug.json')//1024,'KB')
