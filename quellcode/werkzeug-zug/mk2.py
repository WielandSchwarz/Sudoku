# drafts for the train game (variant B): map with switches, a switch being flipped, the platform in side view, the end of the day
import math
from PIL import Image
exec(open('../rohr/stations.py').read().split("# ---------------------------------------------------------------- shower")[0])
ST={'dorf':'#e9b949','muehle':'#c8463c','see':'#4a9ad0','wald':'#4e8c3c','berg':'#9a9aa6'}
POS={'dorf':(22,22),'muehle':(158,22),'berg':(96,56),'wald':(22,84),'see':(158,84)}
# tracks: lists of corner points
TRACKS=[[(22,22),(70,22)],[(70,22),(158,22)],[(70,22),(70,56),(96,56)],[(96,56),(158,56)],
        [(158,22),(158,56)],[(158,56),(158,84)],[(22,22),(22,84)],[(22,84),(158,84)]]
SW={'j1':((70,22),{'muehle':(1,0),'berg':(0,1)}),'j2':((158,56),{'see':(0,1),'berg':(-1,0)})}
def head(W,x,y,kind):
    h=L(13,13); c={'maus':'#9a9aa6','hase':'#e8e0d8','fuchs':'#e8742c','frosch':'#6aa84e','igel':'#8a5a34'}[kind]
    if kind in('maus','fuchs'): h.ell(2.5,3,2,2.2,c); h.ell(9.5,3,2,2.2,c)
    if kind=='hase': h.r(3,0,2,5,c); h.r(7,0,2,5,c)
    if kind=='frosch': h.ell(3.5,4,2,2,c); h.ell(8.5,4,2,2,c)
    h.ell(6,7.5,4.3,3.6,c); h.outline()
    if kind=='maus': h.px(2,3,'#f4a3b4'); h.px(9,3,'#f4a3b4'); h.px(6,9,'#e07f95')
    if kind=='hase': h.r(3,1,1,3,'#f4a3b4'); h.r(8,1,1,3,'#f4a3b4'); h.px(6,9,'#e07f95')
    if kind=='fuchs': h.r(4,9,5,2,'#fff6e4'); h.px(6,9,INK)
    if kind=='frosch': h.px(3,4,INK); h.px(8,4,INK); h.r(4,9,4,1,INK)
    if kind=='igel':
        for (a,b) in ((2,5),(4,4),(6,4),(8,4),(10,5)): h.px(a,b,'#5a3418')
        h.r(4,7,5,4,'#e8c898'); h.px(6,10,INK)
    if kind!='frosch': h.px(4,7,INK); h.px(8,7,INK)
    W.on(h,int(x),int(y))
def dot(W,x,y,col,r=3.1):
    b=L(int(r*2+3),int(r*2+3)); b.ell(r+1.5,r+1.5,r,r,col); b.outline(); W.on(b,x,y)
def clock(W,x,y,f):
    c=L(9,9); c.ell(4.5,4.5,3.6,3.6,'#fff8ec'); c.outline()
    for yy in range(9):
        for xx in range(9):
            q=c.p[xx,yy]
            if q[3] and q!=C(INK):
                a=(math.atan2(xx+.5-4.5,-(yy+.5-4.5))/(2*math.pi))%1
                if a<f: c.p[xx,yy]=C('#5aa84e' if f>.5 else '#e9b949' if f>.25 else '#e8604a')
    W.on(c,x,y)
def rails(W,pts,dim=False):
    sl='#8a6a4c' if not dim else '#b0a080'; rl='#5a5a62' if not dim else '#b4b4b0'
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        if y0==y1:
            for x in range(min(x0,x1),max(x0,x1)+1):
                if x%4==0: W.r(x,y0-3,2,7,sl)
            for x in range(min(x0,x1),max(x0,x1)+1): W.px(x,y0-2,rl); W.px(x,y0+2,rl)
        else:
            for y in range(min(y0,y1),max(y0,y1)+1):
                if y%4==0: W.r(x0-3,y,7,2,sl)
            for y in range(min(y0,y1),max(y0,y1)+1): W.px(x0-2,y,rl); W.px(x0+2,y,rl)
def station(W,k):
    x,y=POS[k]
    hs=L(18,16); hs.r(2,6,14,9,'#f4e8d0'); hs.r(1,2,16,5,ST[k]); hs.r(1,2,16,1,'#ffffff'); hs.r(7,9,4,6,'#8a5a34'); hs.outline(); W.on(hs,x-9,y-15)
def waiting(W,k,animals,side):
    x,y=POS[k]; n=len(animals)
    if not n: return
    bw=n*16+4; bx=x-bw//2 if side=='u' else (x+12 if side=='r' else x-12-bw); by=y-36 if side=='u' else y+6
    if side in('r','l'): by=y-8
    b=L(bw+2,20); b.r(1,1,bw,18,'#fff8ec'); b.outline(); W.on(b,bx,by)
    for i,(a,dst) in enumerate(animals): head(W,bx+3+i*16,by+4,a); dot(W,bx+12+i*16,by+1,ST[dst])
def switch(W,j,to,hot=False):
    (x,y),br=SW[j]
    for dst,(dx,dy) in br.items():   # the branch not taken is drawn faded
        if dst!=to:
            for i in range(4,14):
                W.px(x+dx*i-(2 if dy else 0)*(1 if dy else 0),y+dy*i,'#c8d8b0') if False else None
    s=L(17,17); s.ell(8.5,8.5,7.4,7.4,'#ffe08a' if hot else '#fff8ec'); s.outline(); W.on(s,x-8,y-8)
    dx,dy=br[to]
    for i in range(-3,4): W.px(x+dx*i,y+dy*i,INK); W.px(x+dx*i+dy,y+dy*i+dx,INK) if False else None
    for k in (1,2): W.px(x+dx*(3-k)-dy*k,y+dy*(3-k)-dx*k,INK); W.px(x+dx*(3-k)+dy*k,y+dy*(3-k)+dx*k,INK)
    if hot:
        for (a,b) in ((-11,-11),(11,-11),(-11,11),(11,11)): W.px(x+a,y+b,'#ffffff'); W.px(x+a+(1 if a<0 else -1),y+b,'#ffffff')
def dim_branch(W,j,to):
    (x,y),br=SW[j]
    for dst,(dx,dy) in br.items():
        if dst==to: continue
        for i in range(8,22):
            px,py=x+dx*i,y+dy*i
            for o in range(-3,4):
                q=(px+o,py) if dy else (px,py+o)
                c=W.p[q[0],q[1]]
                if c[3] and c!=(156,200,122,255): W.p[q[0],q[1]]=(int(c[0]*.4+156*.6),int(c[1]*.4+200*.6),int(c[2]*.4+122*.6),255)
def grass(W):
    W.r(0,0,180,104,'#9cc87a')
    for i in range(160): x=(i*53+7)%180; y=(i*29+3)%104; W.px(x,y,'#8ab86a'); W.px(x+1,y,'#8ab86a')
    for (x,y) in ((112,30),(40,46),(120,66),(52,64),(6,98-10)):
        t=L(12,14); t.ell(6,5,5,4.4,'#5a9a44'); t.r(5,9,2,4,'#8a5a34'); t.outline(); W.on(t,x,y)
    lk=L(40,14); lk.ell(20,7,18,5.6,'#7cc4ec'); lk.outline(); W.on(lk,96,90) if False else None
def mini_train(W,x,y):
    t=L(34,9); t.r(22,1,11,7,'#c8463c'); t.r(28,0,3,2,'#3a3a3a'); t.r(1,1,10,7,'#4e8c3c'); t.r(12,1,9,7,'#4e8c3c'); t.outline(); W.on(t,x,y-4)
    for wx in (3,7,14,18): W.px(x+wx,y-2,'#bfe4f4')
    W.px(x+30,y-2,'#bfe4f4')
def seats(W,riders):
    W.r(0,104,180,31,INK); W.r(0,105,180,30,'#b07a46'); W.r(0,105,180,2,'#c8945a')
    for wv in range(2):
        x0=4+wv*88
        wg=L(86,28); wg.r(1,2,84,23,'#4e8c3c'); wg.r(1,2,84,2,'#6aa84e'); wg.outline(); W.on(wg,x0,105)
        for s in range(3):
            i=wv*3+s; sx=x0+4+s*27
            W.r(sx,110,24,16,INK); W.r(sx+1,111,22,14,'#bfe4f4')
            if i<len(riders) and riders[i]:
                a,dst,f=riders[i]; head(W,sx+1,112,a); dot(W,sx+14,111,ST[dst],2.2); clock(W,sx+14,117,f)
def border(W): W.r(0,0,180,1,INK); W.r(0,134,180,1,INK); W.r(0,0,1,135,INK); W.r(179,0,1,135,INK)
def mapview(sw,train,riders,waits,hot=None):
    W=L(180,135); grass(W)
    for t in TRACKS: rails(W,t)
    for j,to in sw.items(): dim_branch(W,j,to)
    for k in POS: station(W,k)
    mini_train(W,*train)
    for j,to in sw.items(): switch(W,j,to,hot==j)
    for k,(side,an) in waits.items(): waiting(W,k,an,side)
    seats(W,riders); border(W); return W.im
riders=[('maus','see',.75),('hase','muehle',.5),('igel','berg',.22),None,None,None]
waits={'muehle':('l',[('fuchs','wald')]),'see':('l',[('frosch','dorf'),('maus','berg')]),'wald':('r',[('hase','dorf')])}
OUT=[('1_karte',mapview({'j1':'muehle','j2':'see'},(30,22),riders,waits)),
     ('2_weiche_umgestellt',mapview({'j1':'berg','j2':'see'},(34,22),riders,waits,hot='j1'))]
# ---------------------------------------------------------------- side view at the platform "See"
def side():
    W=L(180,135); W.r(0,0,180,104,'#cfe8f4')
    for (x,y,w) in ((14,10,26),(104,6,30),(150,18,20)):
        cl=L(w+4,10); cl.ell(w/2+2,5,w/2,3.4,'#ffffff'); cl.outline(); W.on(cl,x,y)
    hl=L(180,104); hl.ell(30,66,56,22,'#8ab86a'); hl.ell(150,70,64,22,'#7aa85a'); hl.outline(); W.on(hl)
    for y in range(52,104): W.r(0,y,180,1,'#9cc87a') if y>66 else None
    bd=L(180,104); bd.r(60,30,56,32,'#f4e8d0'); bd.r(56,24,64,8,ST['see']); bd.r(56,24,64,2,'#8cc4ec'); bd.r(100,42,10,20,'#8a5a34'); bd.r(66,38,12,10,'#bfe4f4'); bd.outline(); W.on(bd)
    sg=L(30,11); sg.r(1,1,28,9,'#fff8ec'); sg.outline(); W.on(sg,73,12)
    dot(W,75,12,ST['see']); W.r(85,15,12,1,INK); W.r(85,17,8,1,INK)
    # rails
    W.r(0,92,180,2,'#5a5a62')
    for x in range(0,180,6): W.r(x,94,4,2,'#8a6a4c')
    # the train: two coaches and the engine, hamster in the cab
    def coach(x,heads):
        c=L(54,30); c.r(1,3,52,22,'#4e8c3c'); c.r(1,3,52,2,'#6aa84e'); c.r(1,1,52,3,'#8a5a34'); c.r(1,22,52,3,'#3e7030'); c.outline(); W.on(c,x,60)
        for s in range(3):
            W.r(x+5+s*16,66,12,11,INK); W.r(x+6+s*16,67,10,9,'#bfe4f4')
            if s<len(heads) and heads[s]: head(W,x+5+s*16,66,heads[s])
        for wx in (x+10,x+42):
            wh=L(10,10); wh.ell(5,5,4,4,'#3a3a3a'); wh.outline(); wh.px(5,5,'#8a8a8a'); W.on(wh,wx-5,84)
    coach(2,['hase','igel',None]); coach(58,[None,None,None])
    lo=L(66,44)
    lo.r(36,6,24,30,'#c8463c'); lo.r(36,6,24,3,'#e8706a'); lo.r(2,18,38,18,'#c8463c'); lo.r(2,18,38,2,'#e8706a'); lo.r(8,4,7,14,'#3a3a3a'); lo.r(6,2,11,3,'#3a3a3a'); lo.r(0,32,62,5,'#5a3418'); lo.r(60,26,4,8,'#3a3a3a')
    lo.outline(); W.on(lo,112,48)
    W.r(152,58,12,10,INK); W.r(153,59,10,8,'#bfe4f4')
    hm=L(12,11); hm.ell(6,6,4.6,4,'#e8a860'); hm.ell(2.4,2.4,1.8,1.8,'#e8a860'); hm.ell(9.6,2.4,1.8,1.8,'#e8a860'); hm.outline(); hm.r(4,7,4,2,'#fff6e4'); hm.px(4,5,INK); hm.px(8,5,INK); W.on(hm,152,58)
    for wx in (122,138,154): wh=L(14,14); wh.ell(7,7,6,6,'#3a3a3a'); wh.outline(); wh.px(7,7,'#8a8a8a'); W.on(wh,wx-7,80)
    for i in range(3): v=i/3; st=L(12,8); st.ell(6,4,4+i,3,'#ffffff'); st.outline(); W.on(st,118+i*4,36-i*8)
    # platform in front with the animals
    W.r(0,104,180,31,'#9cc87a')
    pf=L(180,30); pf.r(0,1,180,22,'#c8c0b0'); pf.r(0,1,180,2,'#e0d8c8'); pf.r(0,20,180,3,'#a89a88'); pf.outline(); W.on(pf,0,97)
    for x in range(0,180,12): W.r(x,100,1,18,'#b8b0a0')
    def animal(x,kind,dst,f,toward):
        b=L(16,12); b.ell(8,6,6,4.6,{'maus':'#9a9aa6','frosch':'#6aa84e','fuchs':'#e8742c'}[kind]); b.outline(); W.on(b,x-8,104)
        head(W,x-6,94,kind); dot(W,x+4,90,ST[dst]); clock(W,x-14,90,f)
        ax=x-3; W.r(ax,120,7,1,INK)
        tip=ax+6 if toward>0 else ax
        W.px(tip-toward,119,INK); W.px(tip-toward,121,INK)
    animal(76,'maus','see',.6,1)       # she has arrived and walks off
    animal(100,'frosch','dorf',1,-1)   # boards
    animal(170,'maus','berg',1,-1)
    border(W)
    return W.im
OUT.append(('3_bahnhof',side()))
def result():
    W=L(180,135); W.r(0,0,180,135,'#9cc87a'); grass(W)
    for t in TRACKS: rails(W,t)
    for k in POS: station(W,k)
    ov=L(180,135); ov.r(0,0,180,135,(40,30,20,90)); W.im.alpha_composite(ov.im)
    card=L(122,112); card.r(1,1,120,110,'#fff8ec'); card.outline(); W.on(card,29,12)
    rows=[('maus','see',1),('hase','muehle',1),('igel','berg',0),('fuchs','wald',1),('frosch','dorf',1),('hase','dorf',1)]
    for i,(a,dst,ok) in enumerate(rows):
        y=18+i*13; head(W,38,y,a); dot(W,54,y+3,ST[dst])
        for x in range(66,104,3): W.px(x,y+7,'#d8c8a8')
        b=L(12,12); b.ell(6,6,5,5,'#5aa84e' if ok else '#e8604a'); b.outline(); W.on(b,106,y+1)
        if ok:
            for (a2,b2) in ((109,y+7),(110,y+8),(111,y+7),(112,y+6),(113,y+5)): W.px(a2,b2,'#ffffff')
        else:
            for d in range(-2,3): W.px(111+d,y+7+d,'#ffffff'); W.px(111+d,y+7-d,'#ffffff')
    for k in range(3):
        stl=L(14,14)
        pts=[(7,0),(9,5),(14,5),(10,8),(12,13),(7,10),(2,13),(4,8),(0,5),(5,5)]
        for yy in range(14):
            for xx in range(14):
                inside=False; j=len(pts)-1
                for i in range(len(pts)):
                    xi,yi=pts[i]; xj,yj=pts[j]
                    if ((yi>yy+.5)!=(yj>yy+.5)) and (xx+.5 < (xj-xi)*(yy+.5-yi)/(yj-yi)+xi): inside=not inside
                    j=i
                if inside: stl.px(xx,yy,'#f6c84a' if k<2 else '#e8dcc0')
        stl.outline(); W.on(stl,68+k*16,96)
    border(W); return W.im
OUT.append(('4_tagesende',result()))
for n,im in OUT: im.resize((720,540),Image.NEAREST).save(n+'.png')
sh=Image.new('RGB',(2*730,2*550),'white')
for i,(n,im) in enumerate(OUT): sh.paste(im.convert('RGB').resize((720,540),Image.NEAREST),((i%2)*730,(i//2)*550))
sh.save('zug_entwurf.png'); print('ok')
