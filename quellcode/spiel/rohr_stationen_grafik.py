# pixel art for the bathroom stations of the pipe puzzle; every object is drawn as fills on its own layer and gets an automatic 1px ink outline
import json, base64, io, math
from PIL import Image
INK=(58,36,20,255)
def C(h):
    if isinstance(h,tuple): return h
    h=h.lstrip('#'); return (int(h[0:2],16),int(h[2:4],16),int(h[4:6],16),255)
class L:
    def __init__(s,w,h): s.w,s.h=w,h; s.im=Image.new('RGBA',(w,h),(0,0,0,0)); s.p=s.im.load()
    def px(s,x,y,c):
        x,y=int(x),int(y)
        if 0<=x<s.w and 0<=y<s.h: s.p[x,y]=C(c)
    def r(s,x,y,w,h,c):
        for yy in range(int(y),int(y+h)):
            for xx in range(int(x),int(x+w)): s.px(xx,yy,c)
    def ell(s,cx,cy,rx,ry,c):
        for y in range(int(cy-ry)-1,int(cy+ry)+2):
            for x in range(int(cx-rx)-1,int(cx+rx)+2):
                if ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1: s.px(x,y,c)
    def outline(s):
        q=[(x,y) for y in range(s.h) for x in range(s.w) if s.p[x,y][3]==0 and any(0<=x+dx<s.w and 0<=y+dy<s.h and s.p[x+dx,y+dy][3] and s.p[x+dx,y+dy]!=INK for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)))]
        for x,y in q: s.p[x,y]=INK
        return s
    def on(s,o,x=0,y=0): s.im.alpha_composite(o.im,(x,y)); return s
G='#a8a8b0'; GL='#c8c8d0'; GD='#8a8a94'; PK='#f0a0b0'; WH='#ffffff'
CU=('#e8a070','#c8794a','#a85a34','#7a3e22'); WAT=('#cfeefc','#7cc4ec','#4a9ad0')
MG='#9a9aa6'; MGL='#bcbcc6'; MGD='#76767f'; MP='#f4a3b4'; MC='#fff6e4'; MCD='#efd9b8'; MN='#e07f95'; MT='#e8a0b0'
def mouse(W,x,yb,pose='stand',f=1,extra=None):
    """the mouse from the game, seen from the front, small: feet on row yb, centred on x"""
    m=L(17,15); cx=8
    if pose!='sleep':
        for i,(tx,ty) in enumerate(((12,12),(13,11),(14,10),(14,9),(15,8))): m.px(tx,ty,MT)        # tail
    m.ell(cx-4,3.2,2.6,2.6,MG); m.ell(cx+4,3.2,2.6,2.6,MG)                                           # ears
    m.ell(cx,6.6,4.2,3.6,MG)                                                                           # head
    m.ell(cx,11,3.4,2.6,MG)                                                                            # body
    m.outline()
    m.ell(cx-4,3.4,1.4,1.4,MP); m.ell(cx+4,3.4,1.4,1.4,MP)
    m.r(cx-3,4,6,1,MGL)                                                                                # light on the head
    m.ell(cx,11.4,2,1.8,MC); m.r(cx-1,13,3,1,MCD)                                                      # belly
    m.r(cx-1,8,3,2,MC); m.px(cx,8,MN)                                                                  # muzzle and nose
    if pose in('happy','sing','brush','sip'): m.px(cx-3,6,INK); m.px(cx-2,5,INK); m.px(cx+2,5,INK); m.px(cx+3,6,INK)
    elif pose=='sleep': m.r(cx-3,6,2,1,INK); m.r(cx+2,6,2,1,INK)
    else: m.px(cx-2,6,INK); m.px(cx+2,6,INK); m.px(cx-2,5,'#2b1d12') if False else None
    m.px(cx-4,8,MP); m.px(cx+4,8,MP)                                                                   # cheeks
    if pose=='sing': m.px(cx,9,INK)
    if pose not in('sit','sleep'): m.px(cx-2,14,MP); m.px(cx+2,14,MP)                                 # feet
    if pose=='wet':
        m.px(cx-3,2,INK); m.px(cx,1,INK) if False else None
    W.on(m,int(x-8),int(yb-14))
    return m
def towel(W,x,yb,f=1):
    t=L(10,5); t.r(1,1,8,3,'#f4a3b4'); t.r(1,1,8,1,'#fbd4dc'); t.outline(); W.on(t,int(x-5),int(yb-6))
def frames_to_json(d):
    o={}
    for k,im in d.items():
        b=io.BytesIO(); im.save(b,'PNG'); o[k]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    return o
OUT={}
def intake(W,x):   # the short pipe stub where the water comes in from above
    p=L(9,5); p.r(2,0,5,5,CU[1]); p.r(2,0,1,5,CU[0]); p.r(5,0,1,5,CU[2]); p.r(1,1,7,2,CU[1]); p.r(1,1,7,1,CU[0]); p.outline(); W.on(p,x-4,-1)

# ---------------------------------------------------------------- shower (2x2 cells, 32x32): the mouse waits in a towel, then showers with foam
def shower(state,fr):
    W=L(32,32)
    t=L(32,32); t.r(2,27,28,4,'#e8eef2'); t.r(2,27,28,1,WH); t.outline(); W.on(t)            # the tray
    pipe=L(32,32); pipe.r(7,0,3,6,CU[1]); pipe.r(7,0,1,6,CU[0]); pipe.r(7,3,10,3,CU[1]); pipe.r(7,3,10,1,CU[0]); pipe.r(14,3,3,5,CU[1]); pipe.r(14,3,1,5,CU[0]); pipe.r(9,7,12,3,CU[1]); pipe.r(9,7,12,1,CU[0]); pipe.r(9,9,12,1,CU[2]); pipe.outline(); W.on(pipe)
    for k in range(10,21,2): W.px(k,10,INK)
    rail=L(32,4); rail.r(1,1,30,1,'#b4b4ac'); rail.outline(); W.on(rail,0,1)
    cur=L(32,30)                                                     # curtain half drawn on the right
    for x in range(26,31):
        for y in range(3,27):
            cur.px(x,y,'#8cc4ec' if (x+ (y//4))%3 else '#cce6f8')
    cur.outline(); W.on(cur,0,0)
    intake(W,8)
    if state=='idle':
        mouse(W,14,26,'stand',1); towel(W,12,24)
        if fr: W.px(9,15,GD); W.px(10,14,GD)        # shiver lines
        else: W.px(20,15,GD); W.px(21,14,GD)
    else:
        mouse(W,15,26,'sing' if state=='win' else 'happy',1)
        for i in range(22):
            x=10+(i*5)%11; y=11+((i*7+fr*4)%15)
            if 12<=x<=18 and 13<=y<=19: continue
            W.px(x,y,WAT[1] if i%2 else WAT[0]); W.px(x,y+1,WAT[1])
        foam=L(32,32); foam.ell(16,13.5,3,1.6,WH); foam.ell(13,14,1.6,1.3,WH); foam.outline(); W.on(foam)
        for i,(bx,by) in enumerate(((10,9),(22,13),(8,18))):
            b=L(5,5); b.ell(2,2,1.4,1.4,WH); b.outline(); W.on(b,bx,by-(fr*2 if i!=1 else -fr))
        if state=='win':
            n=L(6,7); n.r(3,0,1,5,INK); n.r(4,0,2,1,INK); n.r(1,4,3,2,INK); W.on(n,3+fr*2,3)
        W.r(4,26,24,1,WAT[1]) if state=='win' else None
    return W.im
for st in ('idle','on','win'):
    for fr in (0,1): OUT['shower_%s%d'%(st,fr)]=shower(st,fr)

# ---------------------------------------------------------------- bathtub (3x2 cells, 48x32): an empty tub, then a bubble bath with a duck
def tub(state,fr):
    W=L(48,32); intake(W,8)
    tap=L(48,32); tap.r(7,3,3,6,CU[1]); tap.r(7,3,1,6,CU[0]); tap.r(7,8,7,3,CU[1]); tap.r(7,8,7,1,CU[0]); tap.r(12,10,2,3,CU[1]); tap.outline(); W.on(tap)
    if state!='idle':
        for i in range(5): W.px(12+(i%2),14+i+((fr*2)%3)*0,WAT[1] if i%2 else WAT[0])
    back=L(48,32); back.r(4,15,42,3,WH); back.outline(); W.on(back)
    if state!='idle':
        w=L(48,32); w.r(5,16,40,2,WAT[1]); W.on(w)
        mouse(W,31,17,'sing' if state=='win' else 'happy',-1)
        for i,(bx,by,r) in enumerate(((16,14,2.2),(21,13,2.6),(26,15,2),(38,14,2.4),(42,15,1.8),(12,15,1.8))):
            b=L(48,32); b.ell(bx,by-(fr if i%2 else 0),r,r*.85,WH); b.outline(); W.on(b)
        d=L(10,8); d.ell(4,5,3.2,2,'#f6d040'); d.ell(6.5,2.5,1.8,1.8,'#f6d040'); d.outline(); d.px(8.6,2.6,'#e8650c'); d.px(7,2,INK); W.on(d,17+fr,9)
        if state=='win':
            for i in range(3): b=L(5,5); b.ell(2,2,1.4,1.4,WH); b.outline(); W.on(b,22+i*6,2+((i+fr)%2)*2)
    body=L(48,32); body.ell(25,19,21,8,WH); body.r(4,15,42,5,WH)
    for y in range(0,32):
        for x in range(48):
            if y<16: body.p[x,y]=(0,0,0,0)
    body.r(5,20,40,1,'#e8eef2'); body.r(6,24,37,1,'#d8dde2')
    body.outline(); W.on(body)
    rim=L(48,32); rim.r(3,15,44,2,WH); rim.r(3,15,44,1,'#fbfbf8'); rim.outline(); W.on(rim)
    for fx in (9,39):
        ft=L(6,6); ft.r(1,1,3,3,'#e9b949'); ft.r(1,1,1,3,'#f8d870'); ft.outline(); W.on(ft,fx-2,26)
    if state=='idle':
        mouse(W,40,15,'sit',-1); towel(W,30,16)
        d=L(10,8); d.ell(4,5,3.2,2,'#f6d040'); d.ell(6.5,2.5,1.8,1.8,'#f6d040'); d.outline(); d.px(8.6,2.6,'#e8650c'); d.px(7,2,INK); W.on(d,15,9)
        if fr: W.px(43,6,GD); W.px(45,6,GD); W.px(44,5,GD)     # a little "?"-ish waiting puff
    return W.im
for st in ('idle','on','win'):
    for fr in (0,1): OUT['tub_%s%d'%(st,fr)]=tub(st,fr)

# ---------------------------------------------------------------- coffee corner (2x2, 32x32): a counter with an espresso machine, the mouse holds out her cup
def coffee(state,fr):
    W=L(32,32); intake(W,8)
    cnt=L(32,32); cnt.r(1,21,30,10,'#b8844c'); cnt.r(1,21,30,2,'#d09a5a'); cnt.r(1,29,30,2,'#8a5a34'); cnt.r(3,24,12,4,'#9a6a3c'); cnt.r(17,24,12,4,'#9a6a3c'); cnt.outline(); W.on(cnt)
    W.px(9,26,'#e9b949'); W.px(23,26,'#e9b949')
    mc=L(32,32); mc.r(3,5,13,15,'#c8463c'); mc.r(3,5,13,2,'#e8706a'); mc.r(13,7,3,13,'#a03a32'); mc.r(4,18,11,2,'#8a8a84'); mc.r(5,8,5,4,'#fff8ec'); mc.r(11,12,6,2,'#b4b4ac'); mc.outline(); W.on(mc)
    W.px(7,9,INK); W.px(7,10,INK) if state=='idle' else W.px(8,9,INK)
    W.px(14,14,INK)
    cup=L(8,6); cup.r(1,1,4,4,WH); cup.r(5,2,1,2,WH); cup.outline(); 
    if state=='idle':
        mouse(W,24,21,'up',-1); W.on(cup,10,15) if False else None
        c2=L(8,6); c2.r(1,1,4,3,WH); c2.outline(); W.on(c2,16,10)       # she holds the cup up
        if fr: W.px(20,6,GD); W.px(21,5,GD); W.px(22,6,GD)
    else:
        cp=L(8,7); cp.r(1,2,4,4,WH); cp.r(5,3,1,2,WH); cp.outline(); cp.r(1,2,4,1,'#6a3a1c'); W.on(cp,11,14)
        W.px(14,13,'#6a3a1c'); W.px(14,14,'#6a3a1c') if fr else None
        for i in range(3):
            y=10-((i*4+fr*2)%9); W.px(13+(i%2)+(1 if (y%3==0) else 0),y,WH)
        mouse(W,24,21,'sip' if state=='win' else 'happy',-1)
        if state=='win':
            h=L(7,6); h.r(1,1,2,1,'#e8506a'); h.r(4,1,2,1,'#e8506a'); h.r(1,2,5,1,'#e8506a'); h.r(2,3,3,1,'#e8506a'); h.px(3,4,'#e8506a'); W.on(h,22,1+fr)
            c3=L(8,6); c3.r(1,1,4,3,WH); c3.outline(); c3.r(1,1,4,1,'#6a3a1c'); W.on(c3,15,11)
    return W.im
for st in ('idle','on','win'):
    for fr in (0,1): OUT['coffee_%s%d'%(st,fr)]=coffee(st,fr)

# ---------------------------------------------------------------- wash basin (2x2, 32x32): mirror, basin, the mouse on a stool with a toothbrush
def sink(state,fr):
    W=L(32,32); intake(W,8)
    mir=L(32,32); mir.ell(22,7,6,5.5,'#cfe4ee'); mir.outline(); mir.ell(20.5,5.5,2,1.5,WH); W.on(mir)
    pipe=L(32,32); pipe.r(7,3,3,9,CU[1]); pipe.r(7,3,1,9,CU[0]); pipe.r(7,10,7,3,CU[1]); pipe.r(7,10,7,1,CU[0]); pipe.outline(); W.on(pipe)
    if state!='idle':
        for i in range(3): W.px(12+fr*0,13+i,WAT[1] if (i+fr)%2 else WAT[0])
    ped=L(32,32); ped.r(11,21,6,10,WH); ped.r(11,21,2,10,'#fbfbf8'); ped.r(15,21,2,10,'#d8dde2'); ped.outline(); W.on(ped)
    bs=L(32,32); bs.ell(14,15,9,4,WH); bs.r(5,13,18,2,WH); bs.outline()
    for y in range(32):
        for x in range(32):
            if y<13 and bs.p[x,y]!=INK: bs.p[x,y]=(0,0,0,0)
    bs.r(6,14,16,1,'#e8eef2' if state=='idle' else WAT[1]); W.on(bs)
    stool=L(32,32); stool.r(22,24,9,2,'#8cc4ec'); stool.r(23,26,2,5,'#5a9ad0'); stool.r(28,26,2,5,'#5a9ad0'); stool.outline(); W.on(stool)
    if state=='idle':
        mouse(W,26,24,'stand',-1)
        tb=L(8,4); tb.r(1,1,5,1,'#e8706a'); tb.r(0,0,2,2,WH); tb.outline(); W.on(tb,15,11)
        if fr: W.px(28,9,GD); W.px(29,8,GD)
    else:
        mouse(W,26,24,'brush' if state!='win' else 'happy',-1)
        tb=L(8,4); tb.r(1,1,5,1,'#e8706a'); tb.r(0,0,2,2,WH); tb.outline(); W.on(tb,13+fr,13)
        fo=L(32,32); fo.ell(17.5,15,1.6,1.3,WH); fo.outline(); W.on(fo)
        if state=='win':
            d=L(10,8); d.ell(4,5,3,1.8,'#f6d040'); d.ell(6.3,2.6,1.7,1.7,'#f6d040'); d.outline(); d.px(8.4,2.6,'#e8650c'); d.px(7,2,INK); W.on(d,4+fr,8)
            for (sx,sy) in ((18,6),(26,4)):
                W.px(sx,sy-1-fr,WH); W.px(sx,sy+1-fr,WH); W.px(sx-1,sy-fr,WH); W.px(sx+1,sy-fr,WH); W.px(sx,sy-fr,'#f8d850')
    return W.im
for st in ('idle','on','win'):
    for fr in (0,1): OUT['sink_%s%d'%(st,fr)]=sink(st,fr)

# ---------------------------------------------------------------- flower pot (1x2, 16x32): a droopy plant perks up and blooms
def plant(state,fr):
    W=L(16,32); intake(W,8)
    if state!='idle':
        for i in range(3): W.px(8,6+((i*3+fr*2)%9),WAT[1])
    pl=L(16,32)
    if state=='idle':
        pl.r(7,18,2,6,'#6a8c3c'); pl.r(4,17,4,2,'#8aa84e'); pl.r(9,19,4,2,'#8aa84e'); pl.r(5,23,1,1,'#8aa84e')
    else:
        top=12 if state=='on' else 9
        pl.r(7,top,2,24-top,'#4e8c3c'); pl.ell(4.5,top+6,3,1.6,'#6aa84e'); pl.ell(11.5,top+4,3,1.6,'#6aa84e'); pl.ell(4.5,top+11,2.6,1.4,'#6aa84e')
        if state=='win':
            pl.ell(8,top-2,3.6,3.2,'#f08ab0'); pl.ell(13,top+8,2,2,'#f6c84a')
    pl.outline()
    if state=='win': pl.ell(8,top-2,1.2,1.2,'#f8d850'); pl.px(13,top+8,'#e8650c')
    W.on(pl)
    pot=L(16,32); pot.r(2,23,12,3,'#d0744c'); pot.r(3,26,10,6,'#c8643c'); pot.r(3,26,2,6,'#e08454'); pot.r(11,26,2,6,'#a84a2c'); pot.r(2,23,12,1,'#e8946a'); pot.outline(); W.on(pot)
    W.r(3,24,10,1,'#5a3418')
    if state=='win':
        b=L(8,6); b.r(1,1,2,2,'#f6c84a'); b.r(4,1,2,2,'#f6c84a'); b.outline(); b.px(3,3,INK); W.on(b,1+fr*2,2+fr)
    return W.im
for st in ('idle','on','win'):
    for fr in (0,1): OUT['plant_%s%d'%(st,fr)]=plant(st,fr)

# ---------------------------------------------------------------- the mouse's basket (1 cell): she sleeps there and hops up when a leak sprays her
def bed(state,fr):
    W=L(16,20)
    if state=='sleep':
        mouse(W,8,17,'sleep',1)
        for k in range(fr+1): W.px(13+k,4-k*2,GD); W.px(14+k,4-k*2,GD)
    else:
        mouse(W,8,15-fr,'stand',1)
        W.px(15,3,'#c8463c'); W.px(15,4,'#c8463c'); W.px(15,5,'#c8463c'); W.px(15,7,'#c8463c')
        for (dx,dy) in ((2,6),(13,3),(1,10)): W.px(dx,dy+fr,WAT[1]); W.px(dx,dy+1+fr,WAT[0])
    bk=L(16,20); bk.r(1,14,14,5,'#d0a060'); bk.r(1,14,14,1,'#e8c080')
    for x in range(2,15,3): bk.r(x,15,1,4,'#b08040')
    bk.outline(); W.on(bk)
    return W.im
for st in ('sleep','wet'):
    for fr in (0,1): OUT['bed_%s%d'%(st,fr)]=bed(st,fr)

json.dump(frames_to_json(OUT),open('../ham2/rpstations.json','w'))
# preview sheet
keys=list(OUT); S=4
cols=6; cw=52*S; ch=36*S
sheet=Image.new('RGBA',(cols*cw,((len(keys)+cols-1)//cols)*ch),(232,236,240,255))
for i,k in enumerate(keys):
    im=OUT[k].resize((OUT[k].width*S,OUT[k].height*S),Image.NEAREST); sheet.alpha_composite(im,((i%cols)*cw+4,(i//cols)*ch+4))
sheet.save('st/sheet.png'); print(len(keys))
big=[OUT[k] for k in ('shower_idle0','shower_on0','tub_on0','coffee_idle0','coffee_win0','sink_on0','bed_sleep0','bed_wet0')]
S2=8; x=0; bs=Image.new('RGBA',(sum(i.width*S2+16 for i in big),40*S2),(232,236,240,255))
for i in big: bs.alpha_composite(i.resize((i.width*S2,i.height*S2),Image.NEAREST),(x,0)); x+=i.width*S2+16
bs.save('st/big.png')
