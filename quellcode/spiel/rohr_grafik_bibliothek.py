# big close-up scenes (120x90) for the finale of the pipe puzzle, with the game's mouse at its real size
import json, math, io, base64
from PIL import Image
exec(open('stations.py').read().split("# ---------------------------------------------------------------- shower")[0])
from msprite import svg_to_img
M0=svg_to_img(json.load(open('../mock2/animals3.json'))['mouse']['svg'],48,50)

def _mix(c,t,a): return (int(c[0]+(t[0]-c[0])*a),int(c[1]+(t[1]-c[1])*a),int(c[2]+(t[2]-c[2])*a),255)
def shade(lay,dark=3,amt=.3,lamt=.45):
    """2.5D rim shading, light from the top left: darker towards the bottom/right edge, a highlight on the top/left edge (thin parts are left alone)"""
    p=lay.p; w,h=lay.w,lay.h; src=lay.im.copy().load()
    def edge(x,y): return not(0<=x<w and 0<=y<h) or src[x,y][3]==0 or src[x,y]==INK
    for y in range(h):
        for x in range(w):
            c=src[x,y]
            if c[3]==0 or c==INK: continue
            dk=0
            for k in range(1,dark+1):
                if edge(x+k,y) or edge(x,y+k): dk=max(dk,(dark+1-k)/dark)
            if dk and not(edge(x-1,y) and edge(x+1,y)) and not(edge(x,y-1) and edge(x,y+1)) and (not edge(x-2,y) or not edge(x,y-2)):
                p[x,y]=_mix(c,(40,40,90,255),amt*dk); continue
            if (edge(x-1,y) or edge(x,y-1)) and not edge(x+1,y) and not edge(x,y+1): p[x,y]=_mix(c,(255,255,255,255),lamt)
def shadow(W,cx,cy,rx,ry,a=.22):
    for y in range(int(cy-ry)-1,int(cy+ry)+2):
        for x in range(int(cx-rx)-1,int(cx+rx)+2):
            if 0<=x<W.w and 0<=y<W.h and ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1: W.p[x,y]=_mix(W.p[x,y],(40,30,40,255),a)
_old_outline=L.outline
def _outline_shaded(self):
    _old_outline(self); shade(self); return self
L.outline=_outline_shaded
FUR=(154,154,166,255)
def mouse_big(pose='happy'):
    m=M0.copy(); p=m.load()
    if pose in('happy','sing','sip','brush','closed','grin','foam'):
        for ex in (15,27):
            for y in range(25,28):
                for x in range(ex,ex+2): p[x,y]=FUR
            if pose=='closed':
                for x in range(ex-1,ex+3): p[x,26]=INK
            else:
                p[ex-1,27]=INK; p[ex,26]=INK; p[ex+1,26]=INK; p[ex+2,27]=INK
    if pose in('grin','foam'):
        for x in range(19,26): p[x,33]=INK
        p[19,34]=INK; p[25,34]=INK
        for x in range(20,25): p[x,34]=(255,255,255,255)
        p[22,34]=(200,200,210,255)
        for x in range(20,25): p[x,35]=INK
    if pose=='sniff':
        for ex in (15,27):
            for y in range(25,28):
                for x in range(ex,ex+2): p[x,y]=FUR
            for x in range(ex-1,ex+3): p[x,26]=INK
        p[21,31]=C('#e07f95'); p[23,31]=C('#e07f95')
    if pose in('shiver','yuck','worried'):
        for ex in (15,27):
            for y in range(25,28):
                for x in range(ex,ex+2): p[x,y]=FUR
    if pose=='shiver':
        for ex in (15,27):
            for x in range(ex-1,ex+3): p[x,26]=INK
        for i,x in enumerate(range(19,26)): p[x,33+(i%2)]=INK
    if pose=='yuck':
        for (a,b) in ((14,25),(15,26),(14,27),(29,25),(28,26),(29,27)): p[a,b]=INK
        for x in range(19,26): p[x,33]=INK
        for y in range(34,38):
            for x in range(21,24): p[x,y]=C('#f07890')
        p[20,34]=INK; p[24,34]=INK; p[20,35]=INK; p[24,35]=INK; p[20,36]=INK; p[24,36]=INK; p[21,38]=INK; p[22,38]=INK; p[23,38]=INK; p[22,35]=C('#d05070')
    if pose=='worried':
        for ex in (15,27):
            for y in range(24,28):
                for x in range(ex-1,ex+3): p[x,y]=INK
            p[ex,25]=(255,255,255,255)
        p[22,34]=INK; p[21,35]=INK; p[23,35]=INK; p[22,36]=INK
    if pose=='sing':
        for y in range(33,36):
            for x in range(23,26): p[x,y]=INK
        p[24,35]=C('#e07f95')
    return m
def tiles(W,y0,y1,base='#f4f2ec',grout='#d8dde2',tw=12,th=6):
    for y in range(y0,y1,th):
        W.r(0,y+th-1,W.w,1,grout)
        for x in range(((y-y0)//th)%2*(tw//2),W.w,tw): W.r(x,y,1,th-1,grout)
def wallshade(W,y0,y1):
    for y in range(y0,y1):
        a=max(0,(y-y0)/(y1-y0))**2*.12
        for x in range(W.w): W.p[x,y]=_mix(W.p[x,y],(40,40,70,255),a)
def castshadow(W,lay,dx=3,dy=2,a=.16):
    q=lay.p
    for y in range(lay.h):
        for x in range(lay.w):
            if q[x,y][3] and 0<=x+dx<W.w and 0<=y+dy<W.h: W.p[x+dx,y+dy]=_mix(W.p[x+dx,y+dy],(40,40,70,255),a)
def frame(W):
    W.r(0,0,W.w,1,INK); W.r(0,W.h-1,W.w,1,INK); W.r(0,0,1,W.h,INK); W.r(W.w-1,0,1,W.h,INK)
def bubble(W,x,y,r):
    b=L(int(r*2+4),int(r*2+4)); b.ell(r+2,r+2,r,r,'#f4fbff'); b.outline(); b.px(r+1,r+.5,WH); W.on(b,int(x-r-2),int(y-r-2))
def duck(W,x,y,f=1):
    d=L(18,14); d.ell(8,9,6,3.6,'#f6d040'); d.ell(12,4.5,3.4,3.2,'#f6d040'); d.r(2,7,3,2,'#f6d040'); d.outline()
    d.r(16,4,2,2,'#e8650c'); d.px(13,3,INK); d.r(4,10,8,1,'#d8a820'); d.px(12,2,WH)
    if f<0: d.im=d.im.transpose(Image.FLIP_LEFT_RIGHT)
    W.on(d,x,y)
def heart(W,x,y):
    h=L(9,8); h.r(1,1,2,1,'#e8506a'); h.r(5,1,2,1,'#e8506a'); h.r(0,2,8,2,'#e8506a'); h.r(1,4,6,1,'#e8506a'); h.r(2,5,4,1,'#e8506a'); h.r(3,6,2,1,'#e8506a'); W.on(h,x,y)
def note(W,x,y):
    W.r(x+3,y,1,6,INK); W.r(x+4,y,3,1,INK); W.r(x+6,y,1,2,INK); W.r(x+1,y+5,3,2,INK)

TAU=2*math.pi
def tint(im,col,a):
    q=im.load(); t=C(col)
    for y in range(im.height):
        for x in range(im.width):
            c=q[x,y]
            if c[3] and c!=INK: q[x,y]=_mix(c,t,a)
    return im
def snow(W,u,n=10,seed=1):
    for i in range(n):
        x=(i*37+seed*11)%118+1; y=((i*23+u*90)%92)-2; x+=int(math.sin(TAU*u+i)*2)
        W.px(x,y,WH); W.px(x+1,y,'#e8f4ff') if i%3==0 else None
def sparkle(W,x,y,on=True,col='#f8d850'):
    if on: W.px(x,y-1,WH); W.px(x,y+1,WH); W.px(x-1,y,WH); W.px(x+1,y,WH); W.px(x,y,col)
