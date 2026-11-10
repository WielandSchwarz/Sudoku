# Bimmelbahn art, third pass: consistent light from the top left, rim shading on every shape, drop shadows to the bottom right,
# textured grass, tiled roofs, shaded train. Same sprite keys and coordinates as art2.py, so the game code stays the same.
import json, math, io, base64, os
from PIL import Image
exec(open('art2.py').read().split("# ---------------------------------------------------------------- map pieces")[0])
T0=(0,0,0,0)
# ---------------------------------------------------------------- shading tools
def isedge(o,x,y):
    if not (0<=x<o.w and 0<=y<o.h): return True
    q=o.p[x,y]; return q[3]==0 or q==INK
def rim(o,col,hi=None,lo=None,lo2=None,box=None):
    """light from the top left: the top/left edge of every region of colour col gets hi, the bottom/right edge lo (and lo2 one pixel further in)"""
    c=H(col); x0,y0,x1,y1=box or (0,0,o.w,o.h); pts=[(x,y) for y in range(y0,y1) for x in range(x0,x1) if o.p[x,y]==c]
    up={};dn={};dn2={}
    for x,y in pts:
        if isedge(o,x,y-1) or isedge(o,x-1,y): up[(x,y)]=1
        elif isedge(o,x,y+1) or isedge(o,x+1,y): dn[(x,y)]=1
        elif lo2 and (isedge(o,x,y+2) or isedge(o,x+2,y)): dn2[(x,y)]=1
    if lo:
        for q in dn: o.p[q]=H(lo)
    if lo2:
        for q in dn2: o.p[q]=H(lo2)
    if hi:
        for q in up: o.p[q]=H(hi)
def shadow(W,lay,x,y,ox=2,oy=2,f=.8,mask=None):
    """drop shadow of a layer onto W, offset to the bottom right"""
    im=lay.im if hasattr(lay,'im') else lay; P=im.load(); w,h=im.size; seen=mask if mask is not None else set()
    for yy in range(h):
        for xx in range(w):
            if P[xx,yy][3]:
                tx,ty=x+xx+ox,y+yy+oy
                if 0<=tx<W.w and 0<=ty<W.h and (tx,ty) not in seen:
                    q=W.p[tx,ty]; W.p[tx,ty]=(int(q[0]*f),int(q[1]*f),int(q[2]*f*1.04 if q[2]*f*1.04<255 else 255),q[3]); seen.add((tx,ty))
def place(W,lay,x,y,sh=(2,2),f=.8):
    if sh: shadow(W,lay,x,y,sh[0],sh[1],f)
    W.on(lay,x,y)
def ellshadow(W,cx,cy,rx,ry,f=.8):
    for y in range(int(cy-ry)-1,int(cy+ry)+2):
        for x in range(int(cx-rx)-1,int(cx+rx)+2):
            if 0<=x<W.w and 0<=y<W.h and ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1:
                q=W.p[x,y]; W.p[x,y]=(int(q[0]*f),int(q[1]*f),int(q[2]*f),q[3])
def noise(x,y,s=10,seed=1):
    def h(i,j): v=math.sin(i*127.1+j*311.7+seed*74.7)*43758.5453; return v-math.floor(v)
    i,j=math.floor(x/s),math.floor(y/s); fx,fy=x/s-i,y/s-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy)
    a,b,c,d=h(i,j),h(i+1,j),h(i,j+1),h(i+1,j+1)
    return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy
BAY=((0,2),(3,1))
G0='#b0d88c'; G1='#9cc87a'; G2='#8cba6c'; G3='#7aa85c'   # grass: light, base, dark, darker
# ---------------------------------------------------------------- shared props (map scale)
def tree_m(W,x,y,big=False):
    r=6 if not big else 7; t=L(2*r+6,2*r+8); cx=r+3
    t.r(cx-1,r+3,2,r,BARK)
    for (dx,dy,rr) in ((0,0,r),(-r*.55,r*.35,r*.62),(r*.55,r*.35,r*.62),(0,-r*.35,r*.7)): t.ell(cx+dx,r+2+dy,rr,rr*.9,TREE[1])
    t.outline()
    rim(t,TREE[1],None,TREE[2],None)
    for (dx,dy,rr) in ((-1.6,-1.4,r*.55),(-3,1,r*.3)): t.ell(cx+dx,r+2+dy,rr,rr*.85,TREE[0])
    for (a,b) in ((-2,-3),(-1,-3),(-3,-2)): t.px(cx+a,r+2+b,'#9ad278')
    for (a,b) in ((2,2),(3,1),(1,3),(-2,3),(4,-1)): t.px(cx+a,r+2+b,TREE[2])
    t.px(cx,2*r+5,dark(BARK)); t.px(cx-1,r+4+2,'#a87048')
    ellshadow(W,x+2,y,r*.9,2.2,.78); place(W,t,x-cx,y-(2*r+6),(3,1),.82)
def fir_m(W,x,y,h=14):
    w=int(h*.62)|1; t=L(w+4,h+4); cx=(w+4)//2
    tiers=((0,h*.42,w*.5),(h*.22,h*.68,w*.78),(h*.46,h,w))
    for top,bot,wid in tiers:
        poly(t,[(cx+.5,top),(cx+.5+wid/2,bot),(cx+.5-wid/2,bot)],FIR[1])
    t.r(cx-1,h,2,3,BARK); t.outline()
    for yy in range(t.h):   # left half lit, right half in shade
        for xx in range(t.w):
            if t.p[xx,yy]==H(FIR[1]):
                if xx>cx: t.p[xx,yy]=H(FIR[2])
                elif xx<cx-1 and (xx+yy)%5==0: t.p[xx,yy]=H(FIR[0])
    for top,bot,wid in tiers:   # zigzag lower edge of each tier
        yb=int(bot)-1
        for xx in range(int(cx-wid/2)+1,int(cx+wid/2)+1):
            if (xx+yb)%2==0 and t.p[xx,yb][3] and t.p[xx,yb]!=INK: t.p[xx,yb]=H(FIR[2]) if xx>cx else H('#447e3e')
        t.px(cx-1,int(top)+1,'#78b86a'); t.px(cx-2,int(top)+3,'#78b86a')
    ellshadow(W,x+3,y,w*.5,2,.78); place(W,t,x-cx,y-h-2,(3,1),.82)
def bush_m(W,x,y,c=TREE[1]):
    t=L(11,7); t.ell(4,4,3.4,2.6,c); t.ell(7,4.4,2.8,2.2,c); t.outline(); rim(t,c,light(c,.25),dark(c,.22)); t.px(3,2,light(c,.45))
    place(W,t,x-5,y-6,(2,1),.82)
def roof_tiles(t,x0,y0,x1,y1,c):
    for yy in range(y0,y1):
        for xx in range(x0,x1):
            if t.p[xx,yy]==H(c):
                if (yy-y0)%2==1: t.p[xx,yy]=H(dark(c,.12))
                elif (xx+(yy//2)*2)%4==0: t.p[xx,yy]=H(dark(c,.06))
def house_m(W,x,y,roof,w=12,h=7):
    t=L(w+3,h+10); poly(t,[(1,7),(w/2+1.5,0),(w+2,7)],roof); t.r(2,7,w-1,h,CREAM); t.r(1,6,w+1,2,roof); t.outline()
    roof_tiles(t,1,1,w+2,8,roof); rim(t,roof,light(roof,.35),dark(roof,.28))
    t.r(2,8,w-1,1,CREAM2); rim(t,CREAM,None,CREAM2,None)
    t.r(w//2+1,h+3,2,5,WOOD2); t.px(w//2+1,h+3,WOOD)
    for wx in (3,w-3): t.r(wx,10,2,2,'#7ab8d8'); t.px(wx,10,'#d8f0fc')
    t.r(w-3,1,2,3,'#a85a34') if w>10 else None
    place(W,t,x,y,(2,2),.8)
def station_m(W,k,x,y):
    c=ROOF[k]; t=L(24,18)
    poly(t,[(1,8),(4,1),(19,1),(22,8)],c); t.r(3,8,18,8,CREAM); t.outline()
    roof_tiles(t,1,1,23,8,c); rim(t,c,light(c,.35),dark(c,.28)); t.r(3,9,18,1,dark(CREAM,.18)); rim(t,CREAM,None,CREAM2,None,(0,10,24,18))
    t.r(10,11,4,5,WOOD2); t.r(11,11,2,5,WOOD); t.px(13,13,'#e9b949')
    for wx in (5,16): t.r(wx,11,3,3,'#7ab8d8'); t.px(wx,11,'#d8f0fc'); t.r(wx,14,3,1,'#fff8ec')
    s=L(9,9); s.ell(4.5,4.5,3.4,3.4,'#fff8ec'); s.outline(); s.ell(4.5,4.5,2.1,2.1,c); s.px(3,3,light(c,.5)); t.on(s,7,0)
    place(W,t,x-12,y-17,(2,2),.8)
# ---------------------------------------------------------------- map
def segd(x,y):
    best=99
    for (x0,y0),(x1,y1) in SEGS:
        ax,bx=min(x0,x1),max(x0,x1); ay,by=min(y0,y1),max(y0,y1)
        dx=max(ax-x,0,x-bx); dy=max(ay-y,0,y-by)
        d=math.hypot(dx,dy) if dx and dy else max(dx,dy)
        best=min(best,d)
    return best
NODES={'dorf':(22,22),'j1':(70,22),'muehle':(158,22),'j2':(158,56),'see':(158,84),'wald':(22,84),'berg':(96,56),'c1':(70,56)}
SEG=[('dorf','j1'),('j1','muehle'),('j1','c1'),('c1','berg'),('berg','j2'),('muehle','j2'),('j2','see'),('see','wald'),('wald','dorf')]
SEGS=[(NODES[a],NODES[b]) for a,b in SEG]
def mountain_m():
    m=L(84,32)
    A=[(0,30),(14,6),(20,10),(26,2),(40,30)]; B=[(26,30),(46,4),(54,9),(62,0),(84,30)]
    poly(m,A,'#9a9aa6'); poly(m,B,'#9a9aa6'); m.outline()
    # shade the faces that look away from the light: right of each ridge line
    def shade_right(px,py,bx,col):
        for y in range(py,31):
            xr=px+(bx-px)*(y-py)/(30-py)
            for x in range(int(xr)+1,84):
                if m.p[x,y]==H('#9a9aa6'): m.p[x,y]=H(col)
                elif m.p[x,y]==INK or m.p[x,y][3]==0: break
    shade_right(26,2,33,'#7c7c8a'); shade_right(14,6,12,'#86869a'); shade_right(62,0,70,'#7c7c8a'); shade_right(46,4,44,'#86869a')
    for (x,y) in ((8,22),(18,18),(34,24),(50,20),(70,22),(60,14)): m.px(x,y,'#b4b4c0'); m.px(x+1,y,'#b4b4c0')
    for (pk,pts) in (((26,2),[(22,7),(26,2),(31,9),(28,8),(26,10),(24,8)]),((62,0),[(57,5),(62,0),(67,7),(64,6),(62,8),(60,6)]),((46,4),[(43,8),(46,4),(49,8),(47,7)])):
        poly(m,pts,'#fff8ec')
        for y in range(m.h):
            for x in range(pk[0]+1,m.w):
                if m.p[x,y]==H('#fff8ec'): m.p[x,y]=H('#d8e2ee')
    for x in range(1,83):
        for y in range(23,30):
            q=m.p[x,y]
            if q[3] and q!=INK and (noise(x,y,3,5)>.55 or y>27): m.p[x,y]=H('#7aa85c') if q==H('#9a9aa6') else H('#6a9850')
    return m
def windmill_m(W,x,y):
    t=L(14,17); poly(t,[(4,3),(10,3),(12,16),(2,16)],CREAM); poly(t,[(2,4),(7,-1),(12,4)],'#c8463c'); t.outline()
    rim(t,CREAM,'#fffaf0',CREAM2,'#ead9bc'); rim(t,'#c8463c','#e8706a','#9a2e28')
    t.r(6,11,2,5,WOOD2); t.px(6,11,WOOD); t.r(6,6,2,2,'#7ab8d8')
    place(W,t,x-7,y-3,(2,2),.8)
def sails(n,R=8,size=19,frame=WOOD2,cloth=('#fff8ec','#e4d4b4')):
    s=L(size,size); c=size/2
    for i in range(4):
        a=n*math.pi/6+i*math.pi/2; ca,sa=math.cos(a),math.sin(a)
        for r in range(3,R+1):
            for w in (1,2,3) if size<30 else (1,2,3,4,5,6):
                px=c+ca*r-sa*w; py=c+sa*r+ca*w
                lat=(r%3==0) if size<30 else (r%4==0 or w==6)
                s.px(int(px),int(py),frame if lat else (cloth[0] if (i%2==0) else cloth[1]))
        for r in range(0,R+1): s.px(int(c+ca*r),int(c+sa*r),frame)
    s.outline(); s.ell(c,c,1.6 if size<30 else 2.6,1.6 if size<30 else 2.6,'#5a3418'); return s
def field_m(W,x,y,w,h):
    f=L(w+2,h+2); f.r(1,1,w,h,'#d8b048'); f.outline()
    for yy in range(1,h+1):
        for xx in range(1,w+1):
            f.p[xx,yy]=H('#e9c860' if yy%3==1 else '#d8b048' if yy%3==2 else '#c09434')
    for i in range(w//4): f.px(2+i*4,2+(i*2)%(h-1),'#f6dc80')
    place(W,f,x,y,(1,1),.85)
def build_map():
    W=L(180,104)
    for y in range(104):   # grass: soft noise patches with ordered dither between tones
        for x in range(180):
            v=noise(x,y,14,3)*.7+noise(x,y,5,9)*.3; b=BAY[y%2][x%2]/4*.08
            W.p[x,y]=H(G0 if v+b>.74 else G1 if v+b>.4 else G2)
    for i in range(520):
        x=(i*53+7)%180; y=(i*29+3)%104
        if segd(x+.5,y+.5)>6: W.px(x,y,G3); W.px(x+1,y-1,G3); W.px(x+1,y,G0) if i%2 else None
    # lake: sand ring, wet sand, shallow and deep water
    lk=L(76,20); lk.ell(38,10.5,37,8.8,'#ecdcaa'); lk.outline(); lk.ell(38.6,11,34,7.2,'#c8b484'); lk.ell(39,11.2,33,6.6,'#8cd0f0'); lk.ell(40,11.6,28,5,WAT[1]); lk.ell(42,12,20,3.4,'#68b0e0')
    rim(lk,'#ecdcaa','#f6ead0',None)
    W.on(lk,73,87)
    for (x,y,w) in ((86,94,6),(100,99,9),(120,93,5),(133,98,7),(112,101,4),(94,96,3)): W.r(x,y,w,1,'#d4f0fc')
    for (x,y) in ((90,97),(124,100)):
        W.r(x,y,3,2,'#5aa84e'); W.px(x,y,'#7cc86a'); W.px(x+2,y+1,'#3e8434')
    for (x,y) in ((79,96),(82,99),(140,93),(143,96),(77,93)):
        W.r(x,y-4,1,5,'#4e8c3c'); W.px(x,y-5,WOOD2); W.px(x,y-6,WOOD2); W.px(x+1,y-2,'#6aa84e')
    pier=L(11,6); pier.r(1,1,9,3,WOOD); pier.r(1,4,1,2,WOOD2); pier.r(8,4,1,2,WOOD2); pier.outline()
    for xx in range(1,10,3): pier.r(xx,1,1,3,WOOD2)
    pier.r(1,1,9,1,light(WOOD,.3)); place(W,pier,145,92,(1,1),.8)
    # stream
    sp=[(128,49),(128,52),(127,56),(126,60),(127,64),(129,68),(130,72),(129,76),(128,80),(128,84),(127,88),(126,91)]
    for (x,y),(x2,y2) in zip(sp,sp[1:]):
        for t in range(0,5):
            yy=int(y+(y2-y)*t/4); xx=int(x+(x2-x)*t/4)
            W.r(xx-3,yy,7,1,'#c8b484'); W.r(xx-2,yy,5,1,WAT[1]); W.px(xx+2,yy,'#68b0e0'); W.px(xx-4,yy,INK); W.px(xx+4,yy,INK)
    for y in range(51,92,4): W.px(126+(y//4)%2,y,'#d4f0fc'); W.px(127+(y//4)%2,y+1,'#d4f0fc')
    # mountain
    mt=mountain_m(); place(W,mt,74,24,(3,1),.82)
    # tracks: ballast with edge shading, sleepers, rails with their shadow
    for y in range(104):
        for x in range(180):
            d=segd(x+.5,y+.5)
            if d<=4.6:
                W.p[x,y]=H('#ddd2b0' if noise(x,y,2,4)>.62 else '#d0c4a0' if noise(x,y,2,4)>.25 else '#bcae88')
            elif d<=5.6: W.p[x,y]=H('#ac9e78')
            elif d<=6.6:
                q=W.p[x,y]; W.p[x,y]=(int(q[0]*.88),int(q[1]*.88),int(q[2]*.88),255)
    for (x0,y0),(x1,y1) in SEGS:
        if y0==y1:
            for x in range(min(x0,x1)+4,max(x0,x1)-3):
                if x%4==0: W.r(x,y0-3,2,7,WOOD2); W.r(x,y0-3,1,7,'#a87048'); W.px(x+1,y0+3,'#5a3a20'); W.px(x+2,y0+3,'#ac9e78')
        else:
            for y in range(min(y0,y1)+4,max(y0,y1)-3):
                if y%4==0: W.r(x0-3,y,7,2,WOOD2); W.r(x0-3,y,7,1,'#a87048'); W.px(x0+3,y+1,'#5a3a20'); W.px(x0-3,y+2,'#ac9e78')
    rails=set()
    for y in range(104):
        for x in range(180):
            d=segd(x+.5,y+.5)
            if 1.5<d<=2.5: rails.add((x,y))
    for (x,y) in rails:
        W.p[x,y]=H('#9a9aa6')
        for (dx,dy) in ((1,0),(0,1)):
            if (x+dx,y+dy) not in rails and segd(x+dx+.5,y+dy+.5)<=4.6: W.px(x+dx,y+dy,'#8a7c5c')
    for (x,y) in rails:
        if (x-1,y) not in rails and (x,y-1) not in rails: pass
        if (x+y)%7==0: W.p[x,y]=H('#d0d0d8')
    # bridges over the stream
    for by in (56,84):
        br=L(15,15); br.r(1,1,13,1,WOOD); br.r(1,13,13,1,WOOD); br.outline()
        for xx in (1,5,9,13): br.r(xx,0,1,1,INK); br.r(xx,14,1,1,INK)
        br.r(1,1,13,1,light(WOOD,.3)); br.r(1,13,13,1,WOOD2)
        place(W,br,120,by-7,(1,1),.8)
    # stations and platforms
    for k,(x,y,side) in {'dorf':(22,22,'u'),'muehle':(158,22,'u'),'berg':(96,56,'u'),'see':(158,84,'d'),'wald':(22,84,'d')}.items():
        py=y-7 if side=='u' else y+5
        pf=L(24,4); pf.r(1,1,22,2,STONE); pf.outline(); pf.r(1,1,22,1,STONEL); place(W,pf,x-12,py,(1,1),.82)
        if side=='u': station_m(W,k,x,y-6)
        else: station_m(W,k,x,y+24)
    # Dorf
    house_m(W,35,0,'#c8463c',12,7); house_m(W,50,4,'#4a7ac0',10,6)
    fence=L(36,4)
    for xx in range(0,34,3): fence.r(xx+1,1,1,2,WOOD)
    fence.r(1,1,33,1,WOOD); fence.outline(); place(W,fence,28,38,(1,1),.85)
    for x in range(31,61,4):
        for y in range(44,50,3):
            W.px(x,y,'#3e8434'); W.px(x+1,y,'#5aa84e'); W.px(x,y-1,'#7cc86a')
            if (x+y)%3==0: W.px(x+1,y+1,'#e8604a')
    tree_m(W,58,38)
    # Mühle
    field_m(W,93,2,21,13); windmill_m(W,128,9); field_m(W,164,28,13,9); field_m(W,164,42,13,9)
    tree_m(W,172,74)
    # Wald
    for (x,y,h) in ((6,52,15),(13,76,17),(4,94,15),(40,102,14),(52,98,12),(63,103,15),(10,104,13),(30,84,12),(46,82,10),(16,62,11)): fir_m(W,x,y,h)
    bush_m(W,64,80); bush_m(W,84,78,TREE[2]); bush_m(W,150,49)
    tree_m(W,104,79,True); tree_m(W,146,75)
    for i in range(46):
        x=(i*37+21)%180; y=(i*23+5)%104
        if segd(x+.5,y+.5)>6.5 and W.p[x,y][1]>150: W.px(x,y,('#ffffff','#f6d84a','#f4a3b4')[i%3])
    return W.im
# ---------------------------------------------------------------- map train (3/4 view)
def m_engine(d):
    if d in 'rl':
        t=L(14,11); t.r(1,3,12,6,'#c8463c'); t.r(1,1,5,8,'#c8463c'); t.r(0,0,7,2,'#5a3418'); t.r(9,0,2,3,'#3a3a3a'); t.outline()
        t.r(6,3,7,1,'#e8706a'); t.r(1,2,5,1,'#e8706a'); t.r(2,3,3,2,'#bfe4f4'); t.r(7,4,1,4,'#e9b949'); t.r(10,4,1,4,'#e9b949'); t.r(1,8,12,1,'#8a2a24'); t.r(6,7,7,1,'#a8362e')
        t.px(3,9,'#5e5e68'); t.px(8,9,'#5e5e68'); t.px(11,9,'#5e5e68'); t.px(9,0,'#5e5e68')
        return t.im if d=='r' else t.im.transpose(Image.FLIP_LEFT_RIGHT)
    t=L(10,14); t.r(2,1,6,12,'#c8463c'); t.r(1,8,8,5,'#5a3418'); t.r(2,9,6,3,'#c8463c'); t.outline()
    t.r(2,1,1,7,'#e8706a'); t.r(7,1,1,7,'#a8362e'); t.r(4,2,2,2,'#3a3a3a'); t.r(3,5,4,1,'#e9b949'); t.r(3,10,4,1,'#bfe4f4'); t.r(1,8,8,1,'#7a4a28')
    return t.im if d=='u' else t.im.transpose(Image.FLIP_TOP_BOTTOM)
def m_coach(d):
    if d in 'rl':
        t=L(12,10); t.r(1,1,10,7,'#4e8c3c'); t.r(0,0,12,2,'#6a4a3a'); t.outline()
        t.r(1,0,10,1,'#8a6a58'); t.r(1,2,10,4,'#f4e8d0'); t.r(2,3,2,2,'#7ab8d8'); t.r(5,3,2,2,'#7ab8d8'); t.r(8,3,2,2,'#7ab8d8'); t.r(1,6,10,1,'#4e8c3c'); t.r(1,7,10,1,'#3e7030')
        t.px(2,8,'#5e5e68'); t.px(9,8,'#5e5e68'); return t.im
    t=L(10,12); t.r(1,1,8,10,'#6a4a3a'); t.outline(); t.r(2,1,6,10,'#7a5a48'); t.r(2,1,2,10,'#8a6a58'); t.r(1,2,1,8,'#4e8c3c'); t.r(8,2,1,8,'#3e7030'); return t.im
def puff(r):
    s=L(2*r+3,2*r+3); s.ell(r+1.5,r+1.5,r,r,'#ffffff'); s.outline(); rim(s,'#ffffff',None,'#dce6ee'); return s.im
# ---------------------------------------------------------------- station scene
def sky(W):
    bands=('#9ed2ee','#acd9f1','#bce1f4','#cae8f6','#d8eef8'); hgt=(14,12,12,12,40)
    y=0
    for i,(c,h) in enumerate(zip(bands,hgt)):
        W.r(0,y,180,h,c)
        if i:
            for x in range(0,180,2): W.px(x+(y%2),y,bands[i-1])
        y+=h
def cloud(W,x,y,w):
    c=L(w+4,13); c.ell(w/2+2,8,w/2,3.6,'#ffffff'); c.ell(w/3+2,6,w/4,3.6,'#ffffff'); c.ell(w*.62+2,5,w/5,3.4,'#ffffff'); c.outline()
    for xx in range(c.w):
        for yy in range(c.h):
            if c.p[xx,yy]==H('#ffffff') and (yy>=9 or (yy>=8 and xx%2)): c.p[xx,yy]=H('#e2ecf4')
    W.on(c,x,y)
def hills(W,col1,col2,y1=60,y2=66,far=None):
    if far:
        f=L(180,104); f.ell(100,y1+6,90,16,far); f.ell(10,y1+10,40,14,far); f.outline()
        for yy in range(f.h):
            for xx in range(f.w):
                if f.p[xx,yy]==INK: f.p[xx,yy]=H(dark(far,.18))
        W.on(f,0,-4)
    h=L(180,104); h.ell(36,y1+12,70,20,col1); h.ell(150,y2+12,72,20,col2); h.outline()
    rim(h,col1,light(col1,.2),None); rim(h,col2,light(col2,.2),None)
    for yy in range(h.h):
        for xx in range(h.w):
            q=h.p[xx,yy]
            if q[3] and q!=INK and noise(xx,yy,4,8)>.66: h.p[xx,yy]=H(dark(q,.06))
    W.on(h)
def s_house(W,x,y,w,h,roof,col=CREAM):
    t=L(w+6,h+12); poly(t,[(1,10),(w/2+3,0),(w+5,10)],roof); t.r(3,10,w,h,col); t.outline()
    roof_tiles(t,0,0,w+6,10,roof); rim(t,roof,light(roof,.35),dark(roof,.3))
    t.r(3,10,w,1,dark(col,.22)); rim(t,col,None,dark(col,.1),None,(0,11,w+6,h+12))
    for wx in range(6,w-1,8):
        t.r(wx,13,5,5,INK); t.r(wx+1,14,3,3,'#7ab8d8'); t.px(wx+1,14,'#d8f0fc'); t.r(wx,18,5,1,'#fff8ec')
    t.r(w-1,2,3,5,'#a85a34'); t.r(w-1,2,1,5,'#c8794a')
    place(W,t,x,y,(2,1),.86)
def church(W,x,y):
    t=L(16,40); t.r(3,12,10,27,CREAM); poly(t,[(2,13),(8,0),(14,13)],'#4a7ac0'); t.outline()
    roof_tiles(t,0,0,16,13,'#4a7ac0'); rim(t,'#4a7ac0','#7aa4e0','#34589a'); rim(t,CREAM,'#fffaf0','#ddcaa8',CREAM2,(0,13,16,40))
    t.r(6,18,4,7,INK); t.r(7,19,2,5,'#7ab8d8'); t.px(7,19,'#d8f0fc'); t.px(8,0,'#e9b949'); t.ell(8,30,2.4,2.4,'#fff8ec'); t.px(8,30,INK); t.px(8,29,INK); t.r(3,13,10,1,'#ddcaa8')
    place(W,t,x,y,(2,1),.86)
def big_tree(W,x,y,r=9):
    t=L(int(r*2+6),int(r*2+10)); cx=r+3
    t.r(cx-1,int(r*1.5),3,int(r*.9)+3,BARK)
    for (dx,dy,rr) in ((0,0,r),(-r*.55,r*.35,r*.62),(r*.55,r*.35,r*.62),(0,-r*.35,r*.7)): t.ell(cx+dx,r+1+dy,rr,rr*.9,TREE[1])
    t.outline(); rim(t,TREE[1],None,TREE[2],'#4e8a3e')
    t.ell(cx-2,r-1,r*.5,r*.4,TREE[0]); t.r(cx-4,r-3,2,1,'#9ad278')
    rim(t,BARK,'#a87048','#6a4428')
    place(W,t,int(x-cx),int(y-r*2-6),(2,1),.86)
def s_windmill(W,x,y):
    t=L(30,46); poly(t,[(9,8),(21,8),(27,45),(3,45)],CREAM); poly(t,[(5,10),(15,-1),(25,10)],'#c8463c'); t.outline()
    roof_tiles(t,0,0,30,11,'#c8463c'); rim(t,'#c8463c','#e8706a','#9a2e28')
    for yy in range(9,45):   # tower: lit left, shaded right
        for xx in range(30):
            if t.p[xx,yy]==H(CREAM):
                xl=9-(yy-8)*6/37; xr=21+(yy-8)*6/37; f=(xx-xl)/(xr-xl)
                t.p[xx,yy]=H('#fffaf0' if f<.18 else CREAM if f<.62 else '#e8d8b8' if f<.85 else '#d8c4a0')
    t.r(12,34,6,11,INK); t.r(13,35,4,10,WOOD); t.r(13,35,1,10,'#c08a50'); t.r(16,35,1,10,WOOD2)
    t.r(13,18,4,6,INK); t.r(14,19,2,4,'#7ab8d8'); t.px(14,19,'#d8f0fc'); t.r(13,24,4,1,'#fff8ec')
    t.r(4,10,22,1,'#9a2e28')
    place(W,t,x-15,y-6,(3,1),.86)
def s_sails(n): return sails(n,R=19,size=41)
def bench(W,x,y):
    b=L(22,10); b.r(1,1,20,2,WOOD); b.r(1,4,20,2,WOOD); b.r(3,6,2,3,'#5e5e68'); b.r(17,6,2,3,'#5e5e68'); b.outline()
    b.r(1,1,20,1,'#c08a50'); b.r(1,4,20,1,'#c08a50'); b.r(1,2,20,1,WOOD2) if False else None; b.r(1,5,20,1,WOOD2)
    ellshadow(W,x+13,y+9,11,1.6,.82); W.on(b,x,y)
def flowerpot(W,x,y,c):
    f=L(10,11); f.r(2,6,6,4,'#c8794a'); f.ell(5,4,4,3.2,'#5aa84e'); f.outline(); f.r(2,6,6,1,'#e8a070'); f.r(6,7,2,3,'#a85a34'); rim(f,'#5aa84e','#7cc86a','#3e8434')
    for (a,b) in ((3,3),(6,2),(5,5),(7,4)): f.px(a,b,c)
    ellshadow(W,x+2,y,5,1.4,.82); W.on(f,x-5,y-10)
def suitcase(W,x,y,c):
    s=L(12,10); s.r(1,2,10,7,c); s.r(4,0,4,3,INK); s.outline(); s.r(5,1,2,1,T0); rim(s,c,light(c,.3),dark(c,.25)); s.r(5,4,2,2,'#e9b949'); s.r(3,2,1,7,dark(c,.15))
    ellshadow(W,x+8,y,6,1.4,.82); W.on(s,x,y-9)
def mushroom(W,x,y):
    m=L(9,8); m.ell(4.5,3,3.6,2.4,'#e8604a'); m.r(3,4,3,3,'#fff8ec'); m.outline(); rim(m,'#e8604a','#f48a74','#b8423a'); m.px(3,2,'#ffffff'); m.px(6,3,'#ffffff'); m.px(5,5,'#e4d4b4')
    ellshadow(W,x+1,y,4,1.2,.82); W.on(m,x-4,y-7)
def rock(W,x,y,w=10,h=6):
    r=L(w+2,h+2); r.ell(w/2+1,h/2+1.4,w/2,h/2,'#9a9aa6'); r.outline(); rim(r,'#9a9aa6','#c0c0ca','#76767f');
    ellshadow(W,x+w/2+2,y,w/2+1,1.4,.82); W.on(r,x,y-h-1)
def sailboat(W,x,y):
    b=L(18,18); poly(b,[(9,1),(9,12),(2,12)],'#fff8ec'); poly(b,[(10,3),(10,12),(15,12)],'#f4a3b4'); poly(b,[(1,13),(17,13),(14,16),(4,16)],WOOD); b.outline(); b.r(9,1,1,12,WOOD2)
    rim(b,'#fff8ec',None,'#e4d8c4'); rim(b,'#f4a3b4',None,'#d88494'); rim(b,WOOD,'#c08a50',WOOD2)
    W.on(b,x,y); W.r(x+3,y+18,12,1,'#5aa8dc'); W.r(x+5,y+19,8,1,'#68b0e0')
def gull(W,x,y):
    for (a,b) in ((0,0),(1,-1),(2,0),(3,-1),(4,0)): W.px(x+a,y+b,INK)
def station_building(W,k):
    c=ROOF[k]; t=L(78,58)
    t.r(5,22,68,36,CREAM); poly(t,[(1,24),(11,6),(67,6),(77,24)],c); t.outline()
    roof_tiles(t,0,6,78,25,c); rim(t,c,light(c,.35),dark(c,.3),dark(c,.18))
    t.r(11,6,56,1,light(c,.45))
    for yy in range(25,58):   # facade: eaves shadow, lit left, shaded right
        for xx in range(78):
            if t.p[xx,yy]==H(CREAM):
                if yy<27: t.p[xx,yy]=H('#d8c4a0')
                elif xx>68: t.p[xx,yy]=H('#e4d0ac')
                elif noise(xx,yy,3,2)>.78: t.p[xx,yy]=H('#efe0c4')
    t.r(5,26,1,32,'#fffaf0')
    for wx in (9,57):   # windows with frame, cross and sill
        t.r(wx,30,12,12,INK); t.r(wx+1,31,10,10,'#7ab8d8'); t.r(wx+1,31,10,3,'#9ccce4'); t.px(wx+2,32,'#d8f0fc'); t.px(wx+3,32,'#d8f0fc'); t.px(wx+2,33,'#d8f0fc')
        t.r(wx+5,31,1,10,INK); t.r(wx+1,36,10,1,INK); t.r(wx-1,42,14,2,'#fff8ec'); t.r(wx-1,44,14,1,INK); t.r(wx-1,43,14,1,'#e4d4b4')
        t.r(wx-3,30,2,12,c); t.r(wx+13,30,2,12,dark(c,.2))
    W.on(t,51,10); shadow(W,t,51,10,2,0,.88)
    W.on(t,51,10)
    cl=L(16,16); cl.ell(8,8,7,7,'#5a3418'); cl.outline(); cl.ell(8,8,5.4,5.4,'#fff8ec'); cl.r(8,4,1,5,INK); cl.r(8,8,3,1,INK)
    for (a,b) in ((8,3),(13,8),(8,13),(3,8)): cl.px(a,b,'#a89a88')
    cl.px(6,5,'#ffffff'); W.on(cl,82,3)
    nm=NAMES[k]; w=tw(nm)+12; bd=L(w+2,14); bd.r(1,1,w,12,'#fff8ec'); bd.outline(); rim(bd,'#fff8ec','#ffffff','#e4d4b4')
    bd.r(2,2,w-2,1,c); text(bd,nm,7,5,INK)
    W.on(bd,90-w//2,36); W.r(90-w//2+3,50,w-4,1,'#d8c4a0')
def platform_scene(W,k):
    W.r(0,96,180,39,G1)
    W.r(0,100,180,2,'#ac9e78')
    for x in range(0,180,6): W.r(x,104,4,2,WOOD2); W.r(x,104,4,1,'#a87048')
    W.r(0,102,180,1,'#c0c0ca'); W.r(0,103,180,1,'#6e6e78')
    W.r(0,106,180,1,'#ac9e78')
    for x in range(0,180):
        if noise(x,98,2,4)>.5: W.px(x,101,'#d0c4a0')
    pf=L(180,24); pf.r(0,1,180,20,STONE); pf.outline()
    for x in range(0,180,14):   # paving stones: each lit top-left, shaded bottom-right
        for row,(y0,h) in enumerate(((5,6),(11,6))):
            ox=x+(7 if row else 0)
            for yy in range(y0,y0+h):
                for xx in range(ox,ox+14):
                    if 0<=xx<180:
                        e=(xx==ox or yy==y0); f=(xx==ox+13 or yy==y0+h-1)
                        pf.p[xx,yy]=H('#b0a898' if f else '#d4ccbc' if e else ('#c8c0b0' if noise(xx,yy,3,row+1)>.4 else '#c0b8a8'))
    pf.r(0,1,180,2,STONEL); pf.r(0,3,180,1,'#f4e8a0'); pf.r(0,4,180,1,'#d8cc84')
    pf.r(0,17,180,1,'#d8d0c0'); pf.r(0,18,180,3,STONE2); pf.r(0,20,180,1,'#8a7c6c')
    W.on(pf,0,107)
    W.r(0,129,180,6,G2); W.r(0,129,180,1,'#6a9850')
    for i in range(40): x=(i*37+5)%180; y=130+(i*13)%4; W.px(x,y,G3); W.px(x,y-1,G1) if i%3==0 else None
    for i in range(10): x=(i*53+9)%176; W.px(x,131+(i*7)%3,('#ffffff','#f6d84a','#f4a3b4')[i%3])
def side_bg(k):
    W=L(180,135); sky(W)
    cloud(W,10,8,26); cloud(W,118,4,32); cloud(W,150,24,18)
    if k=='dorf':
        hills(W,'#8ab86a','#7aa85a',50,54,'#a8cca0')
        s_house(W,-2,40,22,14,'#c8463c'); church(W,26,16); s_house(W,130,38,24,16,'#4a7ac0'); s_house(W,156,44,22,12,'#e9b949')
        big_tree(W,48,68,8)
    elif k=='muehle':
        hills(W,'#a8c87a','#98b86a',52,52,'#bcd4a8')
        for i,y in enumerate(range(54,72,3)):
            W.r(128,y,52,1,'#e9c860'); W.r(128,y+1,52,1,'#d8b048'); W.r(128,y+2,52,1,'#c09434')
        for (x,y) in ((140,48),(160,50)):
            hs=L(16,11); hs.ell(8,6,7,4.4,'#e9c860'); hs.outline(); rim(hs,'#e9c860','#f6dc80','#c09434','#d8b048')
            for xx in range(3,14,3): hs.px(xx,5,'#c09434')
            place(W,hs,x,y,(2,1),.86)
        s_windmill(W,26,28)
    elif k=='see':
        hills(W,'#8ab86a','#7aa85a',40,42,'#a8cca0')
        W.r(0,50,180,46,WAT[1]); W.r(0,50,180,1,'#5a90b8'); W.r(0,51,180,2,'#68b0e0')
        for y in range(53,96):
            for x in range(180):
                if noise(x,y,6,7)>.7 and y%3==0: W.px(x,y,'#9cd4f0')
        for (x,y,w) in ((8,57,10),(36,60,14),(150,56,9),(132,62,12),(20,63,8)): W.r(x,y,w,1,'#d4f0fc')
        sailboat(W,16,35); sailboat(W,146,37); gull(W,40,22); gull(W,136,26); gull(W,148,22)
    elif k=='wald':
        hills(W,'#6a9a50','#5a8a44',46,48,'#8ab49a')
        for (x,y,h) in ((10,72,48),(32,70,38),(140,70,42),(162,74,52),(124,68,30),(46,66,26),(180,70,34)): fir_m(W,x,y,h)
    elif k=='berg':
        m=L(180,80)
        A=[(0,78),(30,18),(44,30),(62,6),(96,78)]; B=[(80,78),(126,10),(140,22),(152,4),(180,40),(180,78)]
        poly(m,A,'#a4a4b0'); poly(m,B,'#9a9aa6'); m.outline()
        def shade(px,py,bx,col,base):
            for y in range(py,80):
                xr=px+(bx-px)*(y-py)/(78-py)
                for x in range(int(xr)+1,180):
                    if m.p[x,y]==H(base): m.p[x,y]=H(col)
                    elif m.p[x,y]==INK or m.p[x,y][3]==0: break
        shade(62,6,74,'#80808e','#a4a4b0'); shade(30,18,40,'#8c8c9a','#a4a4b0'); shade(152,4,166,'#7a7a88','#9a9aa6'); shade(126,10,132,'#868694','#9a9aa6')
        for (pk,pts) in (((62,6),[(54,16),(62,6),(70,18),(66,16),(62,20),(58,17)]),((152,4),[(146,12),(152,4),(160,14),(156,12),(152,16),(149,13)]),((30,18),[(24,30),(30,18),(36,28),(30,26)]),((126,10),[(120,20),(126,10),(132,18),(126,17)])):
            poly(m,pts,'#fff8ec')
            for y in range(80):
                for x in range(pk[0]+1,180):
                    if m.p[x,y]==H('#fff8ec'): m.p[x,y]=H('#d8e2ee')
        for (x,y) in ((20,50),(50,40),(110,44),(140,36),(70,56),(160,52)): m.r(x,y,3,1,'#c4c4ce'); m.r(x+1,y+1,3,1,'#76767f')
        W.on(m,0,4); hills(W,'#7aa85a','#6a9a50',58,60)
    if k!='see':
        for y in range(70,96): W.r(0,y,180,1,G1)
    station_building(W,k)
    platform_scene(W,k)
    Y=126
    if k=='dorf': bench(W,24,Y-9); flowerpot(W,52,Y,'#e8604a'); flowerpot(W,62,Y,'#f6d84a')
    elif k=='muehle': suitcase(W,26,Y-1,'#c8794a'); suitcase(W,36,Y-1,'#4a7ac0'); flowerpot(W,58,Y,'#ffffff')
    elif k=='see': bench(W,24,Y-9); flowerpot(W,56,Y,'#f4a3b4')
    elif k=='wald': mushroom(W,30,Y); mushroom(W,37,Y+1); bench(W,46,Y-9)
    elif k=='berg': rock(W,24,Y+1,10,6); suitcase(W,40,Y-1,'#c8463c'); bench(W,54,Y-9)
    border(W)
    return W.im
# ---------------------------------------------------------------- side train
CO='#4e8c3c'
def s_coach():
    t=L(56,38)
    t.r(2,5,52,22,CO); t.r(0,1,56,5,'#6a4a3a'); t.r(3,0,50,1,'#6a4a3a'); t.r(2,27,52,4,'#3a3a3a'); t.r(0,23,3,4,'#3a3a3a'); t.r(53,23,3,4,'#3a3a3a')
    t.outline()
    t.r(3,0,50,1,'#9a7a66'); t.r(1,1,54,1,'#8a6a58'); t.r(1,4,54,1,'#5a3e30'); t.r(1,5,54,1,'#2e5a26')   # roof: lit top, shadow under the eaves
    t.r(2,6,52,2,'#5e9c4a'); t.r(2,8,52,1,'#6aa84e'); t.r(2,9,52,12,CREAM); t.r(2,9,52,1,'#fffaf0'); t.r(2,20,52,1,CREAM2)
    t.r(2,21,52,4,CO); t.r(2,24,52,1,'#3e7030'); t.r(2,25,52,2,'#346028')
    for x in (19,36): t.r(x,9,1,12,CREAM2)
    for s in range(3):
        x=5+s*16; t.r(x,9,13,12,INK); t.r(x+1,10,11,10,'#7ab8d8'); t.r(x+1,10,11,4,'#9ccce4')
        for i in range(4): t.px(x+2+i,13-i,'#d8f0fc'); t.px(x+3+i,13-i,'#d8f0fc') if i<3 else None
    t.r(2,27,52,1,'#5e5e68'); t.r(8,28,6,2,'#5e5e68'); t.r(42,28,6,2,'#5e5e68')
    t.px(1,24,'#8a8a94'); t.px(54,24,'#8a8a94'); t.px(0,23,'#5e5e68'); t.px(55,23,'#5e5e68')
    for x in (3,52): t.r(x,10,1,10,'#e9b949')
    return t
def s_engine():
    t=L(70,46)
    t.r(2,8,24,28,'#c8463c'); t.r(0,4,28,5,'#5a3418')
    t.r(24,18,36,18,'#c8463c'); t.r(56,16,6,20,'#3a3a3a')
    poly(t,[(47,4),(55,4),(54,7),(53,18),(49,18),(48,7)],'#3a3a3a')
    t.ell(38,17,5,4,'#e9b949')
    t.r(0,34,64,4,'#5a3418'); poly(t,[(60,38),(68,38),(64,44),(58,44)],'#8a8a94'); t.r(62,24,4,6,'#e9b949')
    t.outline()
    # boiler: a cylinder in three bands (light, base, dark), not a gradient
    t.r(25,18,31,2,'#f08a7e'); t.r(25,20,31,2,'#e0645a'); t.r(25,29,31,3,'#a8362e'); t.r(25,32,31,2,'#8a2a24')
    t.r(3,9,22,2,'#e8706a'); t.r(3,11,1,23,'#e0645a'); t.r(23,11,2,23,'#a8362e'); t.r(3,31,20,3,'#a8362e')
    t.r(1,4,26,1,'#7a4a28'); t.r(1,8,26,1,'#3e2410')
    for x in (32,44): t.r(x,18,2,16,'#e9b949'); t.r(x,18,1,16,'#f6d880'); t.r(x+1,30,1,4,'#b88a2a')
    rim(t,'#e9b949','#f6d880','#b88a2a',None,(30,10,46,22))
    t.r(57,17,1,18,'#5e5e68'); t.r(60,17,1,18,'#2a2a2a'); t.r(48,5,6,1,'#7e7e88'); t.r(49,8,1,9,'#5e5e68'); t.r(52,8,1,9,'#2a2a2a')
    t.r(63,25,2,2,'#fff8ec'); t.r(62,29,4,1,'#b88a2a')
    t.r(1,35,62,1,'#7a4a28'); t.r(1,37,62,1,'#3e2410')
    for xx in (60,62,64): t.px(xx,40,'#5e5e68'); t.px(xx,42,'#5e5e68')
    t.r(6,13,14,12,INK); t.r(7,14,12,10,'#7ab8d8'); t.r(7,14,12,3,'#9ccce4')
    hm=L(12,11); hm.ell(6,6,4.6,4,'#e8a860'); hm.ell(2.4,2.4,1.8,1.8,'#e8a860'); hm.ell(9.6,2.4,1.8,1.8,'#e8a860'); hm.outline(); rim(hm,'#e8a860','#f4c088','#c88440'); hm.r(4,7,4,2,'#fff6e4'); hm.px(4,5,INK); hm.px(8,5,INK); hm.px(6,7,'#e07f95')
    cap=L(10,4); cap.r(1,1,8,2,'#4a7ac0'); cap.r(6,2,4,1,'#4a7ac0'); cap.outline(); cap.r(1,1,8,1,'#7aa4e0')
    t.on(hm,7,15); t.on(cap,7,13); t.r(6,25,14,1,'#fff8ec')
    return t
def wheel(r,n):
    s=L(2*r+3,2*r+3); c=r+1.5; big=r>4; s.ell(c,c,r,r,'#c8463c' if big else '#3a3a3a'); s.outline()
    s.ell(c,c,r-1.2,r-1.2,'#2a2a2a' if big else '#5e5e68')
    for i in range(3 if big else 2):
        a=n*math.pi/(6 if big else 4)+i*math.pi/(3 if big else 2)
        for rr in range(-r+1,r): s.px(int(c+math.cos(a)*rr),int(c+math.sin(a)*rr),'#c8463c' if big else '#8a8a94')
    if big:
        for yy in range(s.h):
            for xx in range(s.w):
                q=s.p[xx,yy]
                if q==H('#c8463c'):
                    d=math.hypot(xx+.5-c,yy+.5-c)
                    if d>r-1.2: s.p[xx,yy]=H('#e8706a' if (xx+yy)<2*c-2 else '#8a2a24')
    s.ell(c,c,1.2,1.2,'#e9b949'); return s.im
# ---------------------------------------------------------------- write
A=json.load(open('../ham2/zug.json'))   # keep heads, bodies, pins, switches
A['map']=uri(build_map())
for d in 'rlud': A['me_'+d]=uri(m_engine(d)); A['mc_'+d]=uri(m_coach(d))
for i in range(3): A['ms%d'%i]=uri(sails(i).im); A['bs%d'%i]=uri(s_sails(i).im)
for i,r in enumerate((2,3,4)): A['puff%d'%i]=uri(puff(r))
for k in ST: A['side_'+k]=uri(side_bg(k))
A['s_coach']=uri(s_coach().im); A['s_engine']=uri(s_engine().im)
for n in range(2): A['whs%d'%n]=uri(wheel(4,n)); A['whb%d'%n]=uri(wheel(6,n))
# animal bodies and heads with the same rim shading
for k in ('maus','hase','fuchs','frosch','igel'):
    col={'maus':'#9a9aa6','hase':'#e8e0d8','fuchs':'#e8742c','frosch':'#6aa84e','igel':'#8a5a34'}[k]
    b=L(18,13); b.ell(9,6,6,4.4,col)
    if k=='maus': b.px(15,4,'#e8a0b0'); b.px(16,3,'#e8a0b0'); b.px(17,2,'#e8a0b0')
    if k=='fuchs': b.ell(15,4,2.6,1.8,col)
    if k=='hase': b.ell(15,5,1.6,1.6,col)
    b.r(5,10,2,2,col); b.r(11,10,2,2,col); b.outline(); rim(b,col,light(col,.3),dark(col,.22))
    if k!='igel': b.r(7,7,5,2,light(col,.5))
    if k=='fuchs': b.px(16,4,'#fff6e4')
    if k=='igel':
        for x in range(4,15,2): b.px(x,2,'#5a3418'); b.px(x+1,3,'#5a3418')
    A['b_'+k]=uri(b.im)
json.dump(A,open('../ham2/zug.json','w')); print(os.path.getsize('../ham2/zug.json')//1024,'KB')
