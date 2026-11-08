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
CL={}
# ---------------------------------------------------------------- 1 the shower
def cu_shower(fr):
    W=L(120,90); W.r(0,0,120,90,'#f4f2ec'); tiles(W,0,78); wallshade(W,30,78)
    W.r(0,78,120,12,'#e8eef2'); W.r(0,78,120,1,'#c8d0d4'); W.r(0,84,120,1,'#d8dde2')
    cur=L(120,90)
    for x in range(2,22):
        for y in range(4,78): cur.px(x,y,'#f4a3b4' if (x//3)%2 else '#fbd4dc')
    for x in range(2,22,3): cur.r(x,4,1,74,'#e07f95')
    cur.outline(); castshadow(W,cur,3,0); W.on(cur)
    W.r(0,3,120,2,INK); W.r(0,3,120,1,'#c8c8c0')
    for x in range(3,22,4): W.r(x,2,2,4,INK)
    pipe=L(120,90); pipe.r(100,8,4,80,'#d8d8d0'); pipe.r(100,8,1,80,WH); pipe.r(103,8,1,80,'#a8a8a0'); pipe.r(62,8,42,4,'#d8d8d0'); pipe.r(62,8,42,1,WH)
    pipe.r(58,8,6,8,'#d8d8d0'); pipe.ell(60.5,17,13,3.6,'#d8d8d0'); pipe.outline(); castshadow(W,pipe); W.on(pipe)
    W.r(48,16,26,1,WH); W.r(97,50,10,6,INK); W.r(98,51,8,4,'#c8463c'); W.r(98,51,8,1,'#e8706a')
    for k in range(48,74,3): W.px(k,20,INK)
    mo=mouse_big('sing' if fr%2 else 'happy'); W.im.alpha_composite(mo,(36,30))
    fo=L(120,90); fo.ell(60,32,10,4.5,WH); fo.ell(52,33,5,3.5,WH); fo.ell(68,33,5,3.5,WH); fo.ell(60,28,5,3,WH); fo.outline(); fo.ell(57,29,2,1,'#f4fbff'); W.on(fo)
    for i in range(46):
        x=48+(i*7)%27; ln=3+(i%3); y=22+((i*11+fr*9)%56)
        if 40<=x<=80 and 38<=y<=74 and i%4: continue
        W.r(x,y,1,ln,WAT[1] if i%2 else WAT[0])
    for i,(bx,by) in enumerate(((30,40),(86,30),(92,58),(28,64),(80,14))):
        bubble(W,bx+((fr+i)%2),by-((fr*3+i*5)%12),2+(i%2))
    W.r(36,80,50,1,WAT[1]); W.r(40,82,6,1,WAT[0]); W.r(70,81,8,1,WAT[0])
    shadow(W,94,84,9,2); duck(W,86,70,-1)
    if fr%2: note(W,22,10+(fr//2)*3); note(W,88,22)
    frame(W); return W.im
# ---------------------------------------------------------------- 2 the bathtub
def cu_tub(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80); wallshade(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    win=L(120,90); win.r(78,6,30,28,'#bfe4f4'); win.outline(); win.r(92,6,2,28,'#8a5a30'); win.r(78,19,30,2,'#8a5a30'); castshadow(W,win); W.on(win); W.r(79,7,12,1,WH)
    tap=L(120,90); tap.r(6,26,5,24,CU[1]); tap.r(6,26,1,24,CU[0]); tap.r(6,26,16,5,CU[1]); tap.r(6,26,16,1,CU[0]); tap.r(19,30,4,6,CU[1]); tap.outline(); W.on(tap)
    for i in range(6): W.r(20+(i%2),37+i*2+(fr%2),1,2,WAT[1])
    mo=mouse_big('closed' if fr in(1,2) else 'happy'); W.im.alpha_composite(mo,(50,10))
    for i,(bx,by,r) in enumerate(((44,50,5),(54,47,6),(66,48,6),(78,50,5),(88,49,4),(34,51,4),(98,51,3),(60,44,4))):
        bubble(W,bx,by-((fr+i)%2),r)
    duck(W,26+fr%2*2,40+(fr//2))
    for i in range(4): bubble(W,40+i*14,30-((fr*4+i*7)%22),1.5+(i%2))
    tb=L(120,90); tb.ell(60,58,54,18,WH); 
    for y in range(90):
        for x in range(120):
            if y<52: tb.p[x,y]=(0,0,0,0)
    tb.r(6,52,108,4,WH); tb.outline(); W.on(tb)
    W.r(8,57,104,2,'#e8eef2'); W.r(14,66,92,2,'#d8dde2'); W.r(10,53,100,1,'#fbfbf8')
    shadow(W,60,86,50,3)
    for fx in (22,98):
        ft=L(14,14); ft.r(3,1,7,8,'#e9b949'); ft.r(1,8,11,3,'#e9b949'); ft.r(3,1,2,8,'#f8d870'); ft.outline(); W.on(ft,fx-7,72)
    rim=L(120,90); rim.r(4,51,112,3,WH); rim.r(4,51,112,1,'#fbfbf8'); rim.outline(); W.on(rim)
    frame(W); return W.im
# ---------------------------------------------------------------- 3 the coffee corner: a little story in 8 pictures
def paw(W,x,y):
    pw=L(8,7); pw.ell(3.5,3,3,2.6,'#9a9aa6'); pw.outline(); pw.r(2,2,3,1,'#bcbcc6'); W.on(pw,x-4,y-3)
def cu_coffee(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,66); wallshade(W,42,66)
    sh=L(120,90); sh.r(62,14,54,3,'#b8844c'); sh.r(64,17,3,5,'#9a6a3c'); sh.r(110,17,3,5,'#9a6a3c'); sh.outline(); castshadow(W,sh); W.on(sh)      # a shelf with a bean jar and cups
    jar=L(120,90); jar.r(68,3,12,11,'#e8eef2'); jar.r(67,1,14,3,'#b8844c'); jar.outline(); castshadow(W,jar,2,1); W.on(jar)
    for (bx,by) in ((70,8),(73,10),(76,7),(71,11),(77,11),(74,6)): W.r(bx,by,2,2,'#6a3a1c')
    for cx0 in (88,100):
        cu=L(120,90); cu.r(cx0,8,8,6,WH); cu.r(cx0+8,9,2,3,WH); cu.outline(); castshadow(W,cu,2,1); W.on(cu)
    cnt=L(120,90); cnt.r(0,66,120,24,'#b8844c'); cnt.r(0,66,120,3,'#d09a5a'); cnt.r(4,72,54,15,'#9a6a3c'); cnt.r(62,72,54,15,'#9a6a3c'); cnt.outline(); W.on(cnt)
    W.r(30,79,3,2,'#e9b949'); W.r(88,79,3,2,'#e9b949')
    shake=1 if fr in(1,2) else 0
    mc=L(120,90); mc.r(6+shake,14,40,52,'#c8463c'); mc.r(6+shake,14,40,4,'#e8706a'); mc.r(38+shake,18,8,48,'#a03a32'); mc.r(10,60,32,6,'#8a8a84'); mc.r(10,60,32,1,'#b4b4ac')
    mc.r(13+shake,40,26,5,'#d8d8d0'); mc.r(13+shake,40,26,1,WH); mc.r(20+shake,45,10,3,'#8a8a84'); mc.r(30+shake,43,12,3,'#3a3a3a'); mc.outline(); castshadow(W,mc,4,0); W.on(mc)
    for x in range(12,42,3): W.r(x,62,1,3,'#6a6a64')     # drip tray grille
    g=L(20,20); g.ell(8,8,7,7,'#fff8ec'); g.outline(); W.on(g,10+shake,20)        # pressure gauge with a needle that rises
    ang=[-2.4,-1.2,-.6,-.4,-.4,-.4,-.4,-.4][fr]; W.r(18+shake,28,1,1,INK)
    for k in range(1,6): W.px(18+shake+round(math.cos(ang)*k),28+round(math.sin(ang)*k),'#c8463c')
    W.r(32+shake,22,4,4,INK); W.r(33+shake,23,2,2,'#5aa84e' if fr>=1 else '#4a6a44')    # the green light
    W.r(32+shake,30,5,4,INK); W.r(33+shake,31,3,2,'#f6c84a')                              # the button
    W.r(8,4,30,10,'#e8eef2'); W.r(7,3,32,1,INK); W.r(7,14,32,1,INK); W.r(7,3,1,12,INK); W.r(38,3,1,12,INK); W.r(8,7+min(fr,4),30,7-min(fr,4),WAT[1])   # the water tank empties a little
    if fr in(1,2):
        for i in range(4): bubble(W,14+i*7,2-(fr-1)*2-(i%2),1.5+(i%2))
    cupfill=[0,0,1,3,4,4,4,4][fr]
    cp=L(20,14); cp.r(1,3,12,9,WH); cp.r(13,5,3,5,WH); cp.outline(); 
    if cupfill: cp.r(2,4+ (4-cupfill),10,cupfill,'#6a3a1c'); cp.r(2,4+(4-cupfill),10,1,'#a8703a')
    if fr<4: W.on(cp,17,51)
    if fr in(2,3): W.r(24,48,1,4,'#6a3a1c'); W.r(25,48,1,3,'#8a5a2c')
    if 2<=fr<=4:
        for i in range(4):
            u=((fr*3+i*4)%12)/12; W.r(22+int(math.sin((u+i)*6)*2)+(i%2)*4,int(48-u*24),1,2,WH)
    if fr>=3:    # the aroma drifts over to her nose
        for i in range(5): W.px(40+i*6,int(36-math.sin(i+fr)*3),'#c8a070'); W.px(41+i*6,int(35-math.sin(i+fr)*3),'#c8a070')
    pl=L(120,90); pl.ell(100,66,9,2.4,WH); pl.outline(); W.on(pl)     # a plate with a cookie
    ck=L(120,90); ck.ell(100,63,5,2.6,'#d8a060'); ck.outline(); W.on(ck); W.px(98,63,'#6a3a1c'); W.px(101,62,'#6a3a1c')
    pose=['happy','stand','stand','sniff','happy','sip','foam','grin'][fr]
    mo=mouse_big(pose); W.im.alpha_composite(mo,(56,17))
    if fr>=4:
        y0=[0,0,0,0,52,44,50,50][fr]
        cp2=L(20,14); cp2.r(1,3,12,9,WH); cp2.r(13,5,3,5,WH); cp2.outline(); cp2.r(2,4,10,1,'#a8703a'); cp2.r(2,5,10,3,'#6a3a1c')
        W.on(cp2,73,y0-8 if fr==5 else y0-6); paw(W,74,y0+1 if fr!=5 else y0-1); paw(W,88,y0+1 if fr!=5 else y0-1)
        if fr in(4,6,7):
            for i in range(3): u=((fr*3+i*4)%12)/12; W.r(77+i*3,int(y0-8-u*10),1,2,WH)
    if fr==6:
        fo=L(120,90); fo.ell(80,49,5,1.6,WH); fo.ell(76,50,2,1.3,WH); fo.ell(84,50,2,1.3,WH); fo.outline(); W.on(fo)
    if fr>=5: heart(W,96+(fr%2),6+(fr%2)*2)
    if fr==7:
        for (sx,sy) in ((70,24),(92,28)):
            W.px(sx,sy-1,WH); W.px(sx,sy+1,WH); W.px(sx-1,sy,WH); W.px(sx+1,sy,WH); W.px(sx,sy,'#f8d850')
    frame(W); return W.im
# ---------------------------------------------------------------- 4 the wash basin: toothpaste, brushing, rinsing, a sparkly grin (8 pictures)
def cu_sink(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80); wallshade(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    mf=L(120,90); mf.ell(38,20,19,15,'#b8844c'); mf.outline(); castshadow(W,mf); W.on(mf)
    mi=L(120,90); mi.ell(38,20,16,12,'#cfe4ee'); W.on(mi)
    for (x,y,w) in ((28,12,7),(26,15,3),(44,26,4)): W.r(x,y,w,1,WH)
    W.r(23,21,30,1,'#b8d4e0')
    if fr==7:    # her reflection waves back
        rf=mouse_big('grin').crop((8,6,40,40)); q=rf.load()
        for y in range(rf.height):
            for x in range(rf.width):
                c=q[x,y]
                if c[3]: q[x,y]=(int(c[0]*.55+207*.45),int(c[1]*.55+228*.45),int(c[2]*.55+238*.45),255)
        mk=Image.new('L',(120,90),0); mp=mk.load()
        for y in range(90):
            for x in range(120):
                if ((x+.5-38)/16)**2+((y+.5-20)/12)**2<=1: mp[x,y]=255
        tmp=Image.new('RGBA',(120,90),(0,0,0,0)); tmp.alpha_composite(rf,(23,8)); W.im.paste(tmp,(0,0),Image.composite(tmp,Image.new('RGBA',(120,90),(0,0,0,0)),mk).split()[3])
    tap=L(120,90); tap.r(36,38,5,10,'#d8d8d0'); tap.r(36,38,12,4,'#d8d8d0'); tap.r(45,41,3,4,'#d8d8d0'); tap.r(33,36,11,3,'#d8d8d0'); tap.outline(); W.on(tap)
    if fr in(4,5,6,7):
        for i in range(4): W.r(46,45+i*2+(fr%2),1,2,WAT[1] if i%2 else WAT[0])
    shadow(W,40,85,10,2,.3)
    ped=L(120,90); ped.r(34,62,12,19,WH); ped.r(32,78,16,3,WH); ped.outline(); W.on(ped)
    bs=L(120,90); bs.ell(40,55,26,9,WH); bs.r(14,50,52,5,WH); bs.outline()
    for y in range(90):
        for x in range(120):
            if y<50 and bs.p[x,y]!=INK: bs.p[x,y]=(0,0,0,0)
    W.on(bs); W.r(16,51,48,2,'#c8d4dc')
    if fr>=4: W.r(18,52,44,1,WAT[1]); W.r(22,52,12,1,WAT[0])
    if fr==5:
        for i in range(4): bubble(W,30+i*6,49-(i%2)*2,1.4)
    cupx,cupy=(56,41)
    if fr!=4:
        cup=L(120,90); cup.r(cupx,cupy,7,9,'#8cc4ec'); cup.outline(); W.on(cup)
    if fr>=1:
        W.r(58,36,1,6,'#e8706a'); W.r(57,35,3,2,WH) if False else None
    tube=L(120,90); tube.r(18,46,12,4,WH); tube.r(18,46,3,4,'#5aa0d8'); tube.r(30,47,2,2,'#5aa0d8'); tube.outline(); W.on(tube); W.r(22,47,6,1,'#e8506a')
    shadow(W,88,86,18,2,.3)
    st=L(120,90); st.r(70,66,36,5,'#8cc4ec'); st.r(73,71,4,10,'#5a9ad0'); st.r(99,71,4,10,'#5a9ad0'); st.r(77,75,22,2,'#5a9ad0'); st.outline(); W.on(st)
    pose=['happy','brush','brush','brush','closed','sing','grin','grin'][fr]
    mo=mouse_big(pose); W.im.alpha_composite(mo,(64,17))
    if fr==0:     # toothpaste onto the brush
        br=L(120,90); br.r(72,58,14,3,'#5aa0d8'); br.r(84,55,5,4,WH); br.outline(); W.on(br); W.r(85,53,4,2,'#e8506a'); W.r(85,52,3,1,WH)
        tb=L(120,90); tb.r(88,46,10,4,WH); tb.r(95,46,3,4,'#5aa0d8'); tb.outline(); W.on(tb); paw(W,72,60); paw(W,96,48)
    elif fr in(1,2,3):
        by=[0,0,1,0][fr]; bx=[0,0,3,-1][fr]
        br=L(120,90); br.r(76+bx,58-by,3,3,'#5aa0d8'); br.r(78+bx,56-by,3,3,'#5aa0d8'); br.r(80+bx,54-by,3,3,'#5aa0d8'); br.r(82+bx,52-by,3,2,'#5aa0d8'); br.r(84+bx,48-by,4,5,WH); br.outline(); W.on(br)
        paw(W,77+bx,59-by)
        n=[0,2,3,5][fr]
        fo=L(120,90); fo.ell(90,52,2+n*.6,1.6+n*.25,WH); fo.ell(86,53,1.6+n*.3,1.3+n*.2,WH)
        if n>3: fo.ell(94,51,2,1.6,WH)
        fo.outline(); W.on(fo)
        for i in range(n-1): bubble(W,96+i*5,44-((fr*3+i*5)%14),1.5)
    elif fr==4:   # rinsing with the cup
        cup=L(120,90); cup.r(84,44,7,9,'#8cc4ec'); cup.outline(); W.on(cup); paw(W,84,52); paw(W,92,52)
    elif fr==5:   # gurgle!
        for i in range(5): bubble(W,82+i*4,46-((i*5)%9),1.4)
        for i in range(4): W.r(80+i*5,36-i%2*2,1,2,WAT[1])
    else:
        for (sx,sy) in ((86,46),(92,44),(80,40)):
            if (fr+sx)%2 or fr==7: W.px(sx,sy-1,WH); W.px(sx,sy+1,WH); W.px(sx-1,sy,WH); W.px(sx+1,sy,WH); W.px(sx,sy,'#f8d850')
        if fr==7: duck(W,22,40)
    frame(W); return W.im
# ---------------------------------------------------------------- 5 the flower
def cu_plant(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,50,120,2,'#8fbcd4'); tiles(W,52,74); wallshade(W,52,74)
    W.r(0,74,120,16,'#f8f8f4'); W.r(0,74,120,2,INK); W.r(0,76,120,1,WH)
    win=L(120,90); win.r(10,6,40,36,'#bfe4f4'); win.outline(); win.r(29,6,2,36,'#8a5a30'); win.r(10,23,40,2,'#8a5a30'); castshadow(W,win); W.on(win); W.r(11,7,16,1,WH)
    pl=L(120,90); pl.r(66,22,3,40,'#4e8c3c'); pl.ell(56,44,9,3.6,'#6aa84e'); pl.ell(79,36,9,3.6,'#6aa84e'); pl.ell(57,30,7,3,'#6aa84e'); pl.ell(78,50,7,3,'#6aa84e')
    op=2+fr if fr<3 else 5
    for k in range(6):
        a=k*math.pi/3+fr*.15; pl.ell(67.5+math.cos(a)*op*1.6,18+math.sin(a)*op*1.4,op*.9,op*.8,'#f08ab0')
    pl.outline(); W.on(pl)
    W.r(65,17,5,4,'#f8d850'); W.r(66,16,3,1,'#f8d850'); W.r(55,44,8,1,'#8ac86a'); W.r(77,36,8,1,'#8ac86a')
    shadow(W,68,77,20,2,.25)
    pot=L(120,90); pot.r(52,60,32,6,'#d0744c'); pot.r(55,66,26,10,'#c8643c'); pot.r(55,66,5,10,'#e08454'); pot.r(75,66,6,10,'#a84a2c'); pot.r(52,60,32,2,'#e8946a'); pot.outline(); W.on(pot)
    W.r(54,62,28,1,'#5a3418')
    mo=mouse_big('closed' if fr%2 else 'happy'); W.im.alpha_composite(mo,(4,27))
    if fr%2: heart(W,40,24)
    bx=86+int(math.sin(fr*1.6)*8); by=10+int(math.cos(fr*1.6)*4); fl=fr%2
    bt=L(14,10); bt.ell(3.5,4,3,3-fl,'#f6c84a'); bt.ell(10.5,4,3,3-fl,'#f6c84a'); bt.outline(); bt.r(6,2,2,6,INK); W.on(bt,bx,by)
    for i in range(3): W.r(30+i*20,4+((fr*3+i*7)%10),1,2,WAT[1])
    frame(W); return W.im
for k,fn in (('shower',cu_shower),('tub',cu_tub),('coffee',cu_coffee),('sink',cu_sink),('plant',cu_plant)):
    for fr in range(8 if k in('coffee','sink') else 4): CL['cu_%s%d'%(k,fr)]=fn(fr)
json.dump(frames_to_json(CL),open('../ham2/rpcloseups.json','w'))
big=Image.new('RGBA',(2*(120*4+12),2*(90*4+12)),(255,255,255,255))
for i,k in enumerate(('cu_coffee0','cu_coffee3','cu_coffee6','cu_sink2')): big.alpha_composite(CL[k].resize((480,360),Image.NEAREST),((i%2)*492,(i//2)*372))
big.save('st/cu_zoom.png')
S=3; ks=list(CL)
sh=Image.new('RGBA',(4*(120*S+12),((len(ks)+3)//4)*(90*S+12)),(255,255,255,255))
for i,k in enumerate(ks): sh.alpha_composite(CL[k].resize((120*S,90*S),Image.NEAREST),((i%4)*(120*S+12),(i//4)*(90*S+12)))
sh.save('st/closeups.png'); print('ok')

st8=Image.new('RGBA',(4*(120*3+8),4*(90*3+8)),(255,255,255,255))
for i in range(8):
    st8.alpha_composite(CL['cu_coffee%d'%i].resize((360,270),Image.NEAREST),((i%4)*368,(i//4)*278))
    st8.alpha_composite(CL['cu_sink%d'%i].resize((360,270),Image.NEAREST),((i%4)*368,2*278+(i//4)*278))
st8.save('st/story8.png')
