# every end scene of the pipe puzzle as a smooth loop (u runs 0..1) or a little story; good and bad outcomes
exec(open('cu_lib.py').read())
S=math.sin; Cs=math.cos
def paw(W,x,y):
    pw=L(8,7); pw.ell(3.5,3,3,2.6,'#9a9aa6'); pw.outline(); pw.r(2,2,3,1,'#bcbcc6'); W.on(pw,x-4,y-3)

# ---------------------------------------------------------------- shared rooms
def room_shower(W, cold=False):
    W.r(0,0,120,90,'#f4f2ec'); tiles(W,0,78); wallshade(W,30,78)
    W.r(0,78,120,12,'#e8eef2'); W.r(0,78,120,1,'#c8d0d4'); W.r(0,84,120,1,'#d8dde2')
    cur=L(120,90)
    for x in range(2,22):
        for y in range(4,78): cur.px(x,y,'#f4a3b4' if (x//3)%2 else '#fbd4dc')
    for x in range(2,22,3): cur.r(x,4,1,74,'#e07f95')
    cur.outline(); castshadow(W,cur,3,0); W.on(cur)
    W.r(0,3,120,2,INK); W.r(0,3,120,1,'#c8c8c0')
    for x in range(3,22,4): W.r(x,2,2,4,INK)
    pipe=L(120,90); pipe.r(100,8,4,80,'#d8d8d0'); pipe.r(62,8,42,4,'#d8d8d0'); pipe.r(58,8,6,8,'#d8d8d0'); pipe.ell(60.5,17,13,3.6,'#d8d8d0'); pipe.outline(); castshadow(W,pipe); W.on(pipe)
    W.r(48,16,26,1,WH); W.r(97,50,10,6,INK); W.r(98,51,8,4,'#4a8ac8' if cold else '#c8463c'); W.r(98,51,8,1,'#8cc4ec' if cold else '#e8706a')
    for k in range(48,74,3): W.px(k,20,INK)
    if cold:
        for k in range(49,74,4): W.r(k,21,1,2+(k%3),WH); W.px(k,23+(k%3),'#cfeefc')
        for (x,y) in ((24,4),(25,5),(26,4),(118,6),(117,7),(24,76),(26,75)): W.px(x,y,WH)
def drops(W,u,x0,w,y0,y1,n,col=None,skip=None,speed=2):
    for i in range(n):
        x=x0+(i*7)%w; ln=3+(i%3); y=y0+((i*11+u*(y1-y0)*speed)%(y1-y0))
        if skip and skip(x,y) and i%4: continue
        W.r(x,int(y),1,ln,(col or WAT)[1] if i%2 else (col or WAT)[0])
def notes(W,u,x,y):
    for k in range(2):
        v=(u+k*.5)%1; nx=int(x+k*60+S(TAU*v)*3); ny=int(y+14-v*18)
        if v<.85: note(W,nx,ny)

def cu_shower(u):
    W=L(120,90); room_shower(W)
    mo=mouse_big('sing' if (u*4)%1<.5 else 'happy'); W.im.alpha_composite(mo,(36,30))
    wob=S(TAU*u)*1.2
    fo=L(120,90); fo.ell(60+wob,32,10,4.5,WH); fo.ell(52+wob,33,5,3.5,WH); fo.ell(68+wob,33,5,3.5,WH); fo.ell(60+wob*1.5,28,5,3,WH); fo.outline(flat=True); W.on(fo)
    drops(W,u,48,27,22,78,46,skip=lambda x,y: 40<=x<=80 and 38<=y<=74)
    for i in range(6):
        v=(u+i/6)%1; bubble(W,26+i*14+S(TAU*v+i)*3,70-v*64,1.5+(i%3)*.6)
    W.r(36,80,50,1,WAT[1]); W.r(40+int(S(TAU*u)*3),82,6,1,WAT[0]); W.r(70-int(S(TAU*u)*3),81,8,1,WAT[0])
    shadow(W,94,84,9,2); duck(W,86,70+int(round(S(TAU*u*2))),-1)
    notes(W,u,20,6)
    frame(W); return W.im
def cu_shower_cold(u):
    W=L(120,90); room_shower(W,cold=True)
    jit=1 if int(u*24)%2 else -1
    mo=tint(mouse_big('shiver'),'#8cc8f0',.35); W.im.alpha_composite(mo,(36+jit,30))
    drops(W,u,48,27,22,78,40,col=('#ffffff','#cfeefc','#a8dcf6'),skip=lambda x,y: 40<=x<=80 and 38<=y<=74,speed=1.5)
    for (x,y) in ((34,44),(32,48),(84,44),(86,48)):
        W.r(x+jit,y,1,3,INK)                       # shiver lines
    snow(W,u,12,3)
    ic=L(120,90)
    for k,x in enumerate(range(38,84,6)): ic.r(x,78,4,2,'#e8f6ff')
    W.on(ic)
    W.r(36,80,50,1,'#cfeefc')
    frame(W); return W.im

# ---------------------------------------------------------------- bathtub
def room_bath(W):
    W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80); wallshade(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    win=L(120,90); win.r(78,6,30,28,'#bfe4f4'); win.outline(); win.r(92,6,2,28,'#8a5a30'); win.r(78,19,30,2,'#8a5a30'); castshadow(W,win); W.on(win); W.r(79,7,12,1,WH)
    tap=L(120,90); tap.r(6,26,5,24,CU[1]); tap.r(6,26,16,5,CU[1]); tap.r(19,30,4,6,CU[1]); tap.outline(); W.on(tap)
def tub_front(W, cold=False):
    tb=L(120,90); tb.ell(60,58,54,18,WH)
    for y in range(90):
        for x in range(120):
            if y<52: tb.p[x,y]=(0,0,0,0)
    tb.r(6,52,108,4,WH); tb.outline(); W.on(tb)
    W.r(8,57,104,2,'#e8eef2'); W.r(14,66,92,2,'#d8dde2'); W.r(10,53,100,1,'#fbfbf8')
    shadow(W,60,86,50,3)
    for fx in (22,98):
        ft=L(14,14); ft.r(3,1,7,8,'#e9b949'); ft.r(1,8,11,3,'#e9b949'); ft.outline(); W.on(ft,fx-7,72)
    rim=L(120,90); rim.r(4,51,112,3,WH); rim.outline(); W.on(rim)
    if cold:
        for x in range(8,112,7): W.r(x,54,3,1,'#e8f6ff'); W.px(x+1,55,'#cfeefc')
def cu_tub(u):
    W=L(120,90); room_bath(W)
    for i in range(6): W.r(20+(i%2),37+((i*2+int(u*12))%12),1,2,WAT[1])
    mo=mouse_big('closed' if .3<(u%1)<.55 else 'happy'); W.im.alpha_composite(mo,(50,10+int(round(S(TAU*u)))))
    for i,(bx,by,r) in enumerate(((44,50,5),(54,47,6),(66,48,6),(78,50,5),(88,49,4),(34,51,4),(98,51,3),(60,44,4))):
        bubble(W,bx+S(TAU*u+i)*.8,by-abs(S(TAU*u+i*.7))*1.5,r)
    duck(W,26+int(round(S(TAU*u)*3)),40+int(round(S(TAU*u*2))))
    for i in range(5):
        v=(u+i/5)%1; bubble(W,38+i*14+S(TAU*v)*2,46-v*40,1.4+(i%2)*.6)
    tub_front(W)
    frame(W); return W.im
def cu_tub_cold(u):
    W=L(120,90); room_bath(W)
    hop=abs(S(TAU*u*2))*6
    mo=tint(mouse_big('shiver'),'#8cc8f0',.35); W.im.alpha_composite(mo,(56+(1 if int(u*24)%2 else -1),2-int(hop)))
    tub_front(W,cold=True)
    for i,(x,y) in enumerate(((24,46),(40,47),(76,46),(92,47))):     # ice cubes bobbing on the icy water
        ic=L(11,10); ic.r(1,1,8,7,'#e8f6ff'); ic.r(1,1,8,2,WH); ic.r(6,3,2,4,'#cfeefc'); ic.outline(flat=True); W.on(ic,x,y+int(round(S(TAU*u+i))))
    W.r(8,52,104,1,'#cfeefc')
    snow(W,u,10,5)
    for (x,y) in ((48,20),(46,24),(84,20),(86,24)): W.r(x,y-int(hop),1,3,INK)
    frame(W); return W.im

# ---------------------------------------------------------------- coffee corner (a story in 16 pictures, u = 0..1)
def room_coffee(W, shake=0, light='#5aa84e', tank=0):
    W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,66); wallshade(W,42,66)
    sh=L(120,90); sh.r(62,14,54,3,'#b8844c'); sh.r(64,17,3,5,'#9a6a3c'); sh.r(110,17,3,5,'#9a6a3c'); sh.outline(); castshadow(W,sh); W.on(sh)
    jar=L(120,90); jar.r(68,3,12,11,'#e8eef2'); jar.r(67,1,14,3,'#b8844c'); jar.outline(); castshadow(W,jar,2,1); W.on(jar)
    for (bx,by) in ((70,8),(73,10),(76,7),(71,11),(77,11),(74,6)): W.r(bx,by,2,2,'#6a3a1c')
    for cx0 in (88,100):
        cu=L(120,90); cu.r(cx0,8,8,6,WH); cu.r(cx0+8,9,2,3,WH); cu.outline(); castshadow(W,cu,2,1); W.on(cu)
    cnt=L(120,90); cnt.r(0,66,120,24,'#b8844c'); cnt.r(0,66,120,3,'#d09a5a'); cnt.r(4,72,54,15,'#9a6a3c'); cnt.r(62,72,54,15,'#9a6a3c'); cnt.outline(); W.on(cnt)
    W.r(30,79,3,2,'#e9b949'); W.r(88,79,3,2,'#e9b949')
    mc=L(120,90); mc.r(6+shake,14,40,52,'#c8463c'); mc.r(6+shake,14,40,4,'#e8706a'); mc.r(38+shake,18,8,48,'#a03a32'); mc.r(10,60,32,6,'#8a8a84')
    mc.r(13+shake,40,26,5,'#d8d8d0'); mc.r(20+shake,45,10,3,'#8a8a84'); mc.r(30+shake,43,12,3,'#3a3a3a'); mc.outline(); castshadow(W,mc,4,0); W.on(mc)
    for x in range(12,42,3): W.r(x,62,1,3,'#6a6a64')
    W.r(32+shake,22,4,4,INK); W.r(33+shake,23,2,2,light)
    W.r(32+shake,30,5,4,INK); W.r(33+shake,31,3,2,'#f6c84a')
    W.r(8,4,30,10,'#e8eef2'); W.r(7,3,32,1,INK); W.r(7,14,32,1,INK); W.r(7,3,1,12,INK); W.r(38,3,1,12,INK); W.r(8,7+int(tank),30,7-int(tank),WAT[1])
    pl=L(120,90); pl.ell(100,66,9,2.4,WH); pl.outline(flat=True); W.on(pl)
    ck=L(120,90); ck.ell(100,63,5,2.6,'#d8a060'); ck.outline(); W.on(ck); W.px(98,63,'#6a3a1c'); W.px(101,62,'#6a3a1c')
def gauge(W,shake,ang):
    g=L(20,20); g.ell(8,8,7,7,'#fff8ec'); g.outline(); W.on(g,10+shake,20)
    for k in range(1,6): W.px(18+shake+round(Cs(ang)*k),28+round(S(ang)*k),'#c8463c')
def steam(W,u,x,y,n=4,h=24,col=WH):
    for i in range(n):
        v=(u*2+i/n)%1; W.r(int(x+S(TAU*v+i)*2+(i%2)*3),int(y-v*h),1,2,col)
def cup_small(W,x,y,fill):
    cp=L(20,14); cp.r(1,3,12,9,WH); cp.r(13,5,3,5,WH); cp.outline()
    if fill>0: f=int(round(fill*4)); cp.r(2,4+(4-f),10,f,'#6a3a1c'); cp.r(2,4+(4-f),10,1,'#a8703a')
    W.on(cp,x,y)
def mug_in_paws(W,x,y,hot=True):
    cp2=L(20,14); cp2.r(1,3,12,9,WH); cp2.r(13,5,3,5,WH); cp2.outline(); cp2.r(2,4,10,1,'#a8703a'); cp2.r(2,5,10,3,'#6a3a1c'); W.on(cp2,x,y)
    paw(W,x+1,y+7); paw(W,x+15,y+7)
def cu_coffee(u):
    st=u*8; k=int(st); f=st-k
    shake=(1 if int(u*48)%2 else 0) if 1<=st<2.6 else 0
    ang=-2.4+min(1,st/2.5)*2.0
    room_coffee(W:=L(120,90),shake,'#5aa84e' if st>=.6 else '#4a6a44',min(4,st*1.2))
    gauge(W,shake,ang)
    if 1<=st<2.6:
        for i in range(4): v=(u*6+i/4)%1; bubble(W,14+i*7,3-v*4,1.5+(i%2))
    fill=0 if st<2 else min(1,(st-2)/1.8)
    if st<4: cup_small(W,17,51,fill)
    if 2<=st<3.8: W.r(24,48,1,4,'#6a3a1c'); W.r(25,48+int(u*20)%3,1,2,'#8a5a2c')
    if 2<=st<4.5: steam(W,u,22,48,4,24)
    if st>=3:
        for i in range(5): W.px(40+i*6,int(36-S(i+TAU*u*2)*3),'#c8a070'); W.px(41+i*6,int(35-S(i+TAU*u*2)*3),'#c8a070')
    pose='happy' if st<1 else 'stand' if st<3 else 'sniff' if st<4 else 'happy' if st<5 else 'sip' if st<6 else 'foam' if st<7 else 'grin'
    W.im.alpha_composite(mouse_big(pose),(56,17))
    if st>=4:
        lift=0 if st<5 else min(1,(st-5)*2) if st<6 else max(0,1-(st-6)*2)
        y0=int(52-lift*8)
        mug_in_paws(W,73,y0-6)
        if st<5 or st>=6: steam(W,u,77,y0-8,3,12)
    if 6<=st<7:
        fo=L(120,90); fo.ell(80,49,5,1.6,WH); fo.ell(76,50,2,1.3,WH); fo.ell(84,50,2,1.3,WH); fo.outline(flat=True); W.on(fo)
    if st>=5: heart(W,96+int(S(TAU*u*3)),int(10-(st-5)*2))
    if st>=7: sparkle(W,70,24,int(u*32)%2==0); sparkle(W,92,28,int(u*32)%2==1)
    frame(W); return W.im
def cu_coffee_cold(u):
    st=u*4
    W=L(120,90); room_coffee(W,0,'#c8463c' if int(u*12)%2 else '#6a2a24',4)
    gauge(W,0,-2.4)
    cup_small(W,17,51,1) if st<1.2 else None
    W.r(24,49,1,2,'#6a3a1c') if int(u*8)%2 else None              # one sad drip, no steam
    pose='stand' if st<1.2 else 'sip' if st<2 else 'yuck'
    jit=(1 if int(u*24)%2 else -1) if st>=2 else 0
    W.im.alpha_composite(tint(mouse_big(pose),'#a8d0b0',.12 if st>=2 else 0),(56+jit,17))
    y0=52 if st<1.2 else 44 if st<2 else 54
    if st>=1.2:
        cp2=L(20,14); cp2.r(1,3,12,9,WH); cp2.r(13,5,3,5,WH); cp2.outline(); cp2.r(2,4,10,1,'#7a5a3a'); cp2.r(2,5,10,3,'#5a3a1c'); W.on(cp2,73+jit,y0-6)
        paw(W,74+jit,y0+1); paw(W,88+jit,y0+1)
    if st>=2:
        for (x,y) in ((62,24),(60,28),(104,24),(106,28)): W.r(x,y,1,3,INK)
        for i in range(3): v=(u*3+i/3)%1; W.r(80+i*4,int(40-v*10),1,1,'#8ab07a')   # a little green "yuck" puff
    frame(W); return W.im

# ---------------------------------------------------------------- wash basin (a story in 16 pictures)
def room_sink(W, water=False, reflection=None):
    W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80); wallshade(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    mf=L(120,90); mf.ell(38,20,19,15,'#b8844c'); mf.outline(); castshadow(W,mf); W.on(mf)
    mi=L(120,90); mi.ell(38,20,16,12,'#cfe4ee'); W.on(mi)
    if reflection is not None:
        rf=mouse_big('grin').crop((8,6,40,40)); q=rf.load()
        for y in range(rf.height):
            for x in range(rf.width):
                c=q[x,y]
                if c[3]: q[x,y]=(int(c[0]*.55+207*.45),int(c[1]*.55+228*.45),int(c[2]*.55+238*.45),int(255*reflection))
        mk=Image.new('L',(120,90),0); mp=mk.load()
        for y in range(90):
            for x in range(120):
                if ((x+.5-38)/16)**2+((y+.5-20)/12)**2<=1: mp[x,y]=255
        tmp=Image.new('RGBA',(120,90),(0,0,0,0)); tmp.alpha_composite(rf,(23,8))
        W.im.paste(tmp,(0,0),Image.composite(tmp,Image.new('RGBA',(120,90),(0,0,0,0)),mk).split()[3])
    for (x,y,w) in ((28,12,7),(26,15,3),(44,26,4)): W.r(x,y,w,1,WH)
    tap=L(120,90); tap.r(36,38,5,10,'#d8d8d0'); tap.r(36,38,12,4,'#d8d8d0'); tap.r(45,41,3,4,'#d8d8d0'); tap.r(33,36,11,3,'#d8d8d0'); tap.outline(); W.on(tap)
    shadow(W,40,85,10,2,.3)
    ped=L(120,90); ped.r(34,62,12,19,WH); ped.r(32,78,16,3,WH); ped.outline(); W.on(ped)
    bs=L(120,90); bs.ell(40,55,26,9,WH); bs.r(14,50,52,5,WH); bs.outline()
    for y in range(90):
        for x in range(120):
            if y<50 and bs.p[x,y]!=INK: bs.p[x,y]=(0,0,0,0)
    W.on(bs); W.r(16,51,48,2,'#c8d4dc')
    if water: W.r(18,52,44,1,WAT[1]); W.r(22,52,12,1,WAT[0])
    tube=L(120,90); tube.r(18,46,12,4,WH); tube.r(18,46,3,4,'#5aa0d8'); tube.r(30,47,2,2,'#5aa0d8'); tube.outline(); W.on(tube); W.r(22,47,6,1,'#e8506a')
    shadow(W,88,86,18,2,.3)
    stl=L(120,90); stl.r(70,66,36,5,'#8cc4ec'); stl.r(73,71,4,10,'#5a9ad0'); stl.r(99,71,4,10,'#5a9ad0'); stl.r(77,75,22,2,'#5a9ad0'); stl.outline(); W.on(stl)
def brush(W,x,y):
    br=L(120,90)
    for i in range(4): br.r(x+i*2,y+6-i*2,3,3,'#5aa0d8')
    br.r(x+8,y-2,4,5,WH); br.outline(); W.on(br)
def cu_sink(u):
    st=u*8
    W=L(120,90); room_sink(W, water=st>=4, reflection=(min(1,(st-6.6)*1.5) if st>=6.6 else None))
    if 4<=st<6:
        for i in range(4): W.r(46,45+((i*2+int(u*48))%8),1,2,WAT[1] if i%2 else WAT[0])
    duck(W,22,40+(int(round(S(TAU*u*6))) if st>=4 else 0))   # the duck is always there, it bobs once the water runs
    if not (4<=st<5): cup=L(120,90); cup.r(56,41,7,9,'#8cc4ec'); cup.outline(); W.on(cup)
    pose='happy' if st<1 else 'brush' if st<4 else 'closed' if st<5 else 'sing' if st<6 else 'grin'
    W.im.alpha_composite(mouse_big(pose),(64,17))
    if st<1:
        brush(W,72,52); W.r(84,51,4,2,'#e8506a') if st>.4 else None
        tb=L(120,90); tb.r(88,46,10,4,WH); tb.r(95,46,3,4,'#5aa0d8'); tb.outline(); W.on(tb); paw(W,72,60); paw(W,96,48)
    elif st<4:
        bx=int(round(S(TAU*u*10)*2.5)); by=int(round(abs(S(TAU*u*10))))
        brush(W,76+bx,50-by); paw(W,77+bx,59-by)
        n=(st-1)/3*5
        fo=L(120,90); fo.ell(90,52,2+n*.6,1.6+n*.25,WH); fo.ell(86,53,1.6+n*.3,1.3+n*.2,WH)
        if n>3: fo.ell(94,51,2,1.6,WH)
        fo.outline(flat=True); W.on(fo)
        for i in range(int(n)):
            v=(u*4+i/5)%1; bubble(W,92+i*4+S(TAU*v)*2,48-v*20,1.3)
    elif st<5:
        cup=L(120,90); cup.r(84,44,7,9,'#8cc4ec'); cup.outline(); W.on(cup); paw(W,84,52); paw(W,92,52)
    elif st<6:
        for i in range(6): v=(u*8+i/6)%1; bubble(W,82+i*3+S(TAU*v)*1.5,48-v*12,1.2+(i%2)*.4)
    else:
        for i,(sx,sy) in enumerate(((86,46),(92,44),(80,40))): sparkle(W,sx,sy,(int(u*40)+i)%2==0)
    frame(W); return W.im

# ---------------------------------------------------------------- flower
def room_plant(W):
    W.r(0,0,120,90,'#dde9ef'); W.r(0,50,120,2,'#8fbcd4'); tiles(W,52,74); wallshade(W,52,74)
    W.r(0,74,120,16,'#f8f8f4'); W.r(0,74,120,2,INK); W.r(0,76,120,1,WH)
    win=L(120,90); win.r(10,6,40,36,'#bfe4f4'); win.outline(); win.r(29,6,2,36,'#8a5a30'); win.r(10,23,40,2,'#8a5a30'); castshadow(W,win); W.on(win); W.r(11,7,16,1,WH)
def pot(W):
    shadow(W,68,77,20,2,.25)
    p=L(120,90); p.r(52,60,32,6,'#d0744c'); p.r(55,66,26,10,'#c8643c'); p.r(52,60,32,2,'#e8946a'); p.outline(); W.on(p); W.r(54,62,28,1,'#5a3418')
def cu_plant(u):
    W=L(120,90); room_plant(W)
    sw=S(TAU*u)*1.5
    pl=L(120,90); pl.r(66,22,3,40,'#4e8c3c'); pl.ell(56+sw,44,9,3.6,'#6aa84e'); pl.ell(79-sw,36,9,3.6,'#6aa84e'); pl.ell(57+sw,30,7,3,'#6aa84e'); pl.ell(78-sw,50,7,3,'#6aa84e')
    op=4.2+S(TAU*u)*.6
    for k in range(6):
        a=k*math.pi/3+u*.6; pl.ell(67.5+Cs(a)*op*1.6,18+S(a)*op*1.4,op*.9,op*.8,'#f08ab0')
    pl.outline(flat=True); W.on(pl)
    W.r(65,17,5,4,'#f8d850'); W.r(66,16,3,1,'#f8d850')
    pot(W)
    mo=mouse_big('closed' if (u*2)%1<.5 else 'happy'); W.im.alpha_composite(mo,(4,27+int(round(S(TAU*u*2)*.6))))
    hv=(u*2)%1; heart(W,40+int(S(TAU*hv)*2),int(28-hv*14)) if hv<.8 else None
    bx=86+int(S(TAU*u)*10); by=12+int(S(TAU*u*2)*5); flap=int(u*16)%2
    bt=L(14,10); bt.ell(3.5,4,3,3-flap*1.5,'#f6c84a'); bt.ell(10.5,4,3,3-flap*1.5,'#f6c84a'); bt.outline(); bt.r(6,2,2,6,INK); W.on(bt,bx,by)
    for i in range(3): W.r(30+i*20,int(4+((u*10+i*3)%10)),1,2,WAT[1])
    frame(W); return W.im
def cu_plant_hot(u):
    W=L(120,90); room_plant(W)
    droop=min(1,u*1.6)
    pl=L(120,90)
    for i in range(40):
        y=62-i; x=66+int((i/40)**2*droop*14); pl.r(x,y,3,1,'#6a8c3c')
    tipx=66+int(droop*14); tipy=22+int(droop*10)
    pl.ell(56,48+droop*4,8,3,'#8aa84e'); pl.ell(80,42+droop*6,8,3,'#8aa84e')
    for k in range(5):
        a=k*1.2+1.4; pl.ell(tipx+2+Cs(a)*4,tipy+4+S(a)*3+droop*3,3,2.4,'#d88aa0')
    pl.outline(flat=True); W.on(pl)
    pot(W)
    for i in range(4): v=(u*2+i/4)%1; W.r(int(58+i*6+S(TAU*v+i)*2),int(58-v*20),1,2,WH)
    jit=1 if int(u*24)%2 else 0
    mo=mouse_big('worried'); W.im.alpha_composite(mo,(4+jit,27))
    sw=L(5,6); sw.r(1,1,2,3,'#8cc4ec'); sw.px(2,0,'#8cc4ec'); sw.outline(flat=True); W.on(sw,46,30+int(u*6)%4)
    t=L(120,90); t.r(0,0,120,90,(240,128,96,40)); W.im.alpha_composite(t.im)
    frame(W); return W.im

# ---------------------------------------------------------------- a leak: water sprays out of an open pipe end, the mouse gets splashed
def cu_leak(u):
    W=L(120,90); W.r(0,0,120,90,'#dde9ef'); W.r(0,40,120,2,'#8fbcd4'); tiles(W,42,80); wallshade(W,42,80)
    W.r(0,80,120,10,'#c08a50'); W.r(0,80,120,1,'#7a4a26')
    for x in range(0,120,26): W.r(x,81,1,9,'#a87040')
    p=L(120,90); p.r(0,14,44,9,CU[1]); p.r(0,14,44,2,CU[0]); p.r(0,21,44,2,CU[2]); p.r(40,11,6,15,CU[1]); p.r(40,11,2,15,CU[0]); p.outline(); castshadow(W,p); W.on(p)
    W.r(43,16,2,5,INK)
    for i in range(56):
        v=(u*2+i/56)%1; sp=(i%7)-3
        x=46+v*44+sp*v*5; y=18+v*v*62-v*10+sp*v*4
        if y<80: W.r(int(x),int(y),2 if i%3 else 1,2,WAT[1] if i%2 else WAT[0])
    W.r(45,16,3,5,WAT[1]); W.r(45,17,2,1,WAT[0])
    pw=int(30+S(TAU*u)*2); W.r(78-pw//2,81,pw,1,WAT[1]); W.r(82-pw//4,82,pw//2,1,WAT[0])
    shake=int(round(S(TAU*u*6)*2))
    mo=tint(mouse_big('shiver' if (u*2)%1<.5 else 'worried'),'#8cc8f0',.15); W.im.alpha_composite(mo,(66+shake,31))
    for i in range(10):
        a=TAU*(i/10+u); W.r(int(90+Cs(a)*20),int(50+S(a)*14),1,2,WAT[1] if i%2 else WAT[0])
    for (x,y) in ((62,40),(60,44),(110,40),(112,44)): W.r(x+shake,y,1,3,INK)
    frame(W); return W.im

SCENES=[('shower',cu_shower,12),('shower_cold',cu_shower_cold,12),('tub',cu_tub,12),('tub_cold',cu_tub_cold,12),
        ('coffee',cu_coffee,24),('coffee_cold',cu_coffee_cold,16),('sink',cu_sink,24),('plant',cu_plant,12),('plant_hot',cu_plant_hot,12),('leak',cu_leak,12)]
CL={}; COUNT={}
for k,fn,n in SCENES:
    COUNT[k]=n
    for i in range(n): CL['cu_%s%d'%(k,i)]=fn(i/n)
o=frames_to_json(CL); o['_count']=COUNT
json.dump(o,open('../ham2/rpcloseups.json','w'))
S3=2; sh=Image.new('RGBA',(6*(120*S3+6),len(SCENES)*(90*S3+6)),(255,255,255,255))
for r,(k,fn,n) in enumerate(SCENES):
    for j in range(6): sh.alpha_composite(CL['cu_%s%d'%(k,int(j*n/6))].resize((240,180),Image.NEAREST),(j*246,r*186))
sh.save('st/all_scenes.png')
import os; print('ok', os.path.getsize('../ham2/rpcloseups.json')//1024,'KB')
