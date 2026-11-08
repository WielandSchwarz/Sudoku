# big close-up scenes (120x90) for the finale of the pipe puzzle, with the game's mouse at its real size
import json, math, io, base64
from PIL import Image
exec(open('stations.py').read().split("# ---------------------------------------------------------------- shower")[0])
from msprite import svg_to_img
M0=svg_to_img(json.load(open('../mock2/animals3.json'))['mouse']['svg'],48,50)
FUR=(154,154,166,255)
def mouse_big(pose='happy'):
    m=M0.copy(); p=m.load()
    if pose in('happy','sing','sip','brush','closed'):
        for ex in (15,27):
            for y in range(25,28):
                for x in range(ex,ex+2): p[x,y]=FUR
            if pose=='closed':
                for x in range(ex-1,ex+3): p[x,26]=INK
            else:
                p[ex-1,27]=INK; p[ex,26]=INK; p[ex+1,26]=INK; p[ex+2,27]=INK
    if pose=='sing':
        for y in range(33,36):
            for x in range(23,26): p[x,y]=INK
        p[24,35]=C('#e07f95')
    return m
def tiles(W,y0,y1,base='#f4f2ec',grout='#d8dde2',tw=12,th=6):
    for y in range(y0,y1,th):
        W.r(0,y+th-1,W.w,1,grout)
        for x in range(((y-y0)//th)%2*(tw//2),W.w,tw): W.r(x,y,1,th-1,grout)
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
    W=L(120,90); W.r(0,0,120,90,'#f4f2ec'); tiles(W,0,78)
    W.r(0,78,120,12,'#e8eef2'); W.r(0,78,120,1,'#c8d0d4'); W.r(0,84,120,1,'#d8dde2')
    cur=L(120,90)
    for x in range(2,22):
        for y in range(4,78): cur.px(x,y,'#f4a3b4' if (x//3)%2 else '#fbd4dc')
    for x in range(2,22,3): cur.r(x,4,1,74,'#e07f95')
    cur.outline(); W.on(cur)
    W.r(0,3,120,2,INK); W.r(0,3,120,1,'#c8c8c0')
    for x in range(3,22,4): W.r(x,2,2,4,INK)
    pipe=L(120,90); pipe.r(100,8,4,80,'#d8d8d0'); pipe.r(100,8,1,80,WH); pipe.r(103,8,1,80,'#a8a8a0'); pipe.r(62,8,42,4,'#d8d8d0'); pipe.r(62,8,42,1,WH)
    pipe.r(58,8,6,8,'#d8d8d0'); pipe.ell(60.5,17,13,3.6,'#d8d8d0'); pipe.outline(); W.on(pipe)
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
    duck(W,86,70,-1)
    if fr%2: note(W,22,10+(fr//2)*3); note(W,88,22)
    frame(W); return W.im
# ---------------------------------------------------------------- 2 the bathtub
def cu_tub(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    win=L(120,90); win.r(78,6,30,28,'#bfe4f4'); win.outline(); win.r(92,6,2,28,'#8a5a30'); win.r(78,19,30,2,'#8a5a30'); W.on(win); W.r(79,7,12,1,WH)
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
    for fx in (22,98):
        ft=L(14,14); ft.r(3,1,7,8,'#e9b949'); ft.r(1,8,11,3,'#e9b949'); ft.r(3,1,2,8,'#f8d870'); ft.outline(); W.on(ft,fx-7,72)
    rim=L(120,90); rim.r(4,51,112,3,WH); rim.r(4,51,112,1,'#fbfbf8'); rim.outline(); W.on(rim)
    frame(W); return W.im
# ---------------------------------------------------------------- 3 the coffee corner
def cu_coffee(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,66)
    cnt=L(120,90); cnt.r(0,66,120,24,'#b8844c'); cnt.r(0,66,120,3,'#d09a5a'); cnt.r(4,72,54,15,'#9a6a3c'); cnt.r(62,72,54,15,'#9a6a3c'); cnt.outline(); W.on(cnt)
    W.r(30,79,3,2,'#e9b949'); W.r(88,79,3,2,'#e9b949')
    mc=L(120,90); mc.r(6,14,40,52,'#c8463c'); mc.r(6,14,40,4,'#e8706a'); mc.r(38,18,8,48,'#a03a32'); mc.r(10,60,32,6,'#8a8a84'); mc.r(10,60,32,1,'#b4b4ac')
    mc.r(12,24,14,12,'#fff8ec'); mc.r(14,42,26,5,'#b4b4ac'); mc.r(18,47,8,3,'#8a8a84'); mc.outline(); W.on(mc)
    W.r(18,30,1,4,'#c8463c'); W.r(19,29,1,2,'#c8463c')
    for k,(x,y) in enumerate(((13,27),(24,27),(13,33),(24,33))): W.px(x,y,INK)
    W.r(8,4,30,10,'#e8eef2'); W.r(7,3,32,1,INK); W.r(7,14,32,1,INK); W.r(7,3,1,12,INK); W.r(38,3,1,12,INK); W.r(8,9,30,5,WAT[1])   # water tank on top
    cp=L(20,14); cp.r(1,3,12,9,WH); cp.r(13,5,3,5,WH); cp.r(1,3,12,2,'#6a3a1c'); cp.outline(); W.on(cp,14,52)
    for i in range(3): W.r(21,50+i*1,2,1,'#6a3a1c') if (i+fr)%2 else None
    W.r(21,50,1,2,'#6a3a1c')
    for i in range(5):
        u=((fr*2+i*3)%10)/10; W.r(18+int(math.sin((u+i)*6)*2)+i%2*4,int(48-u*30),1,2,WH)
    mo=mouse_big('sip' if fr%2 else 'happy'); W.im.alpha_composite(mo,(60,17))
    mug=L(20,16); mug.r(1,2,11,11,'#f4a3b4'); mug.r(1,2,3,11,'#fbd4dc'); mug.r(12,4,4,6,'#f4a3b4'); mug.r(1,2,11,2,'#6a3a1c'); mug.outline(); mug.r(13,6,2,2,(0,0,0,0)); W.on(mug,77,40)
    for i in range(3):
        u=((fr*3+i*4)%12)/12; W.r(80+i*3+int(math.sin((u+i)*7)*1.5),int(40-u*16),1,2,WH)
    if fr%2: heart(W,98,10+fr)
    frame(W); return W.im
# ---------------------------------------------------------------- 4 the wash basin
def cu_sink(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,44,120,2,'#8fbcd4'); tiles(W,46,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    mir=L(120,90); mir.ell(60,22,26,18,'#cfe4ee'); mir.outline(); W.on(mir); W.r(36,21,48,1,'#b8d4e0')
    for (x,y,w) in ((46,10,8),(44,13,4)): W.r(x,y,w,1,WH)
    mo=mouse_big('brush' if fr%2 else 'happy'); W.im.alpha_composite(mo,(36,12))
    tb=L(30,8); tb.r(1,3,18,2,'#5aa0d8'); tb.r(18,1,6,5,WH); tb.r(1,3,18,1,'#8cc4ec'); tb.outline(); W.on(tb,58-(fr%2)*2,40)
    fo=L(120,90); fo.ell(60,44,6,3,WH); fo.ell(54,45,3,2,WH); fo.outline(); W.on(fo)
    for i in range(3): bubble(W,48+i*10+(fr%2),38-((fr*3+i*5)%14),1.5)
    ped=L(120,90); ped.r(52,64,16,18,WH); ped.r(52,64,4,18,'#fbfbf8'); ped.r(64,64,4,18,'#d8dde2'); ped.outline(); W.on(ped)
    bs=L(120,90); bs.ell(60,54,34,11,WH); bs.r(26,50,68,4,WH); bs.outline()
    for y in range(90):
        for x in range(120):
            if y<50 and bs.p[x,y]!=INK: bs.p[x,y]=(0,0,0,0)
    W.on(bs); W.r(28,51,64,1,'#fbfbf8'); W.r(30,53,60,2,WAT[1]); W.r(34,53,20,1,WAT[0])
    tap=L(120,90); tap.r(22,40,4,12,'#d8d8d0'); tap.r(22,40,12,4,'#d8d8d0'); tap.r(22,40,12,1,WH); tap.outline(); W.on(tap)
    for i in range(4): W.r(32,45+i*2+(fr%2),1,2,WAT[1])
    if fr>=2: duck(W,72,42)
    for (sx,sy) in ((26,20),(92,14)):
        if fr%2: W.px(sx,sy-1,WH); W.px(sx,sy+1,WH); W.px(sx-1,sy,WH); W.px(sx+1,sy,WH); W.px(sx,sy,'#f8d850')
    frame(W); return W.im
# ---------------------------------------------------------------- 5 the flower
def cu_plant(fr):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,50,120,2,'#8fbcd4'); tiles(W,52,74)
    W.r(0,74,120,16,'#f8f8f4'); W.r(0,74,120,2,INK); W.r(0,76,120,1,WH)
    win=L(120,90); win.r(10,6,40,36,'#bfe4f4'); win.outline(); win.r(29,6,2,36,'#8a5a30'); win.r(10,23,40,2,'#8a5a30'); W.on(win); W.r(11,7,16,1,WH)
    pl=L(120,90); pl.r(66,22,3,40,'#4e8c3c'); pl.ell(56,44,9,3.6,'#6aa84e'); pl.ell(79,36,9,3.6,'#6aa84e'); pl.ell(57,30,7,3,'#6aa84e'); pl.ell(78,50,7,3,'#6aa84e')
    op=2+fr if fr<3 else 5
    for k in range(6):
        a=k*math.pi/3+fr*.15; pl.ell(67.5+math.cos(a)*op*1.6,18+math.sin(a)*op*1.4,op*.9,op*.8,'#f08ab0')
    pl.outline(); W.on(pl)
    W.r(65,17,5,4,'#f8d850'); W.r(66,16,3,1,'#f8d850'); W.r(55,44,8,1,'#8ac86a'); W.r(77,36,8,1,'#8ac86a')
    pot=L(120,90); pot.r(52,60,32,6,'#d0744c'); pot.r(55,66,26,10,'#c8643c'); pot.r(55,66,5,10,'#e08454'); pot.r(75,66,6,10,'#a84a2c'); pot.r(52,60,32,2,'#e8946a'); pot.outline(); W.on(pot)
    W.r(54,62,28,1,'#5a3418')
    mo=mouse_big('closed' if fr%2 else 'happy'); W.im.alpha_composite(mo,(4,27))
    if fr%2: heart(W,40,24)
    bx=86+int(math.sin(fr*1.6)*8); by=10+int(math.cos(fr*1.6)*4); fl=fr%2
    bt=L(14,10); bt.ell(3.5,4,3,3-fl,'#f6c84a'); bt.ell(10.5,4,3,3-fl,'#f6c84a'); bt.outline(); bt.r(6,2,2,6,INK); W.on(bt,bx,by)
    for i in range(3): W.r(30+i*20,4+((fr*3+i*7)%10),1,2,WAT[1])
    frame(W); return W.im
for k,fn in (('shower',cu_shower),('tub',cu_tub),('coffee',cu_coffee),('sink',cu_sink),('plant',cu_plant)):
    for fr in range(4): CL['cu_%s%d'%(k,fr)]=fn(fr)
json.dump(frames_to_json(CL),open('../ham2/rpcloseups.json','w'))
S=3; ks=list(CL)
sh=Image.new('RGBA',(4*(120*S+12),5*(90*S+12)),(255,255,255,255))
for i,k in enumerate(ks): sh.alpha_composite(CL[k].resize((120*S,90*S),Image.NEAREST),((i%4)*(120*S+12),(i//4)*(90*S+12)))
sh.save('st/closeups.png'); print('ok')
