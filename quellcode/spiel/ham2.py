from lib import G
from PIL import Image, ImageDraw
import json, re
pal=dict(K='#3a2414',O='#e9a44c',o='#c98232',Q='#f7c47e',W='#fff6e4',w2='#efd9b8',P='#f4a3b4',p='#e07f95',E='#24160c',e='#ffffff',M='#b4485e',B='#f6b8c4',T='#a86a2c')
out={}; sizes={}
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
def keep(name,g,size): out[name]=paths(g); sizes[name]=size

# ================= FRONT (48 x 46) =================
FW,FH=48,46
def f(): return G(FW,FH)
def make_body(liftL=0, liftR=0, tall=False):
    H_=52 if tall else 46
    b=G(FW,H_)
    if tall:
        b.ell(24,37.5,15.4,13.6,'O')     # stretched body
    else:
        b.ell(24,33.5,17,11.8,'O')
    b.ell(24,20,15.6,12.6,'O')           # head
    if tall: b.ell(24,38.5,9.4,10,'W')
    else: b.ell(24,35.5,10.4,9.2,'W')    # belly
    b.ell(14.6,25.4,5.8,4.3,'W'); b.ell(33.4,25.4,5.8,4.3,'W'); b.ell(24,27,5.2,3.6,'W')
    b.ell(24,23,2.2,4,'W')
    b.shade_edge('O','o','bottom')
    for x,y in [(17,9),(18,8),(19,8),(20,8),(21,8),(22,8),(16,10),(15,11),(14,12),(26,8),(27,8),(28,8),(29,8),(30,8),(31,9),(9,25),(9,24),(39,24),(39,25)]:
        if b.p[y][x]=='O': b.p[y][x]='Q'
    b.px('o',[(23,9),(24,9),(23,10),(24,10),(24,11),(8,20),(8,21),(40,20),(40,21),(9,29),(10,30),(39,29),(38,30)])
    b.shade_edge('W','w2','bottom')
    b.clear_below(H_)
    b.outline('K')
    fy=50.3 if tall else 44.3
    ft=G(FW,H_)
    for cx,lift in ((15.5,liftL),(32.5,liftR)):
        x=cx+(-1 if cx<24 else 1)*(1 if lift else 0)
        ft.ell(x,fy-lift,3.8,1.9,'P')
        ft.px('p',[(int(x)-1,int(fy-lift)+1),(int(x)+1,int(fy-lift)+1)])
    ft.clear_below(H_); ft.outline('K')
    for y in range(H_):
        for x in range(FW):
            if ft.p[y][x] is not None and (ft.p[y][x]!='K' or b.p[y][x] in (None,'K')): b.p[y][x]=ft.p[y][x]
    return b
keep('body',make_body(),(FW,FH))
keep('body_l',make_body(liftL=2),(FW,FH))
keep('body_r',make_body(liftR=2),(FW,FH))
keep('body_tall',make_body(tall=True),(FW,52))
# ears
def ears(kind):
    g=f()
    if kind=='up':
        g.ell(12,9.5,5,5,'O'); g.ell(36,9.5,5,5,'O'); g.ell(12.6,10.2,2.7,2.7,'P'); g.ell(35.4,10.2,2.7,2.7,'P'); g.px('p',[(13,11),(35,11)])
    elif kind=='flat':
        g.ell(8.5,14,5.4,3.2,'O'); g.ell(39.5,14,5.4,3.2,'O'); g.ell(9,14.4,3,1.6,'P'); g.ell(39,14.4,3,1.6,'P')
    elif kind=='twitch':  # left ear folded slightly
        g.ell(10.5,11,5,4.2,'O'); g.ell(36,9.5,5,5,'O'); g.ell(11,11.6,2.6,2.2,'P'); g.ell(35.4,10.2,2.7,2.7,'P'); g.px('p',[(35,11)])
    # remove what the head covers (keep only outside head ellipse)
    for y in range(FH):
        for x in range(FW):
            if ((x+.5-24)/15.6)**2+((y+.5-20)/12.6)**2<=1: g.p[y][x]=None
    g.outline('K')
    # do not draw outline over head
    for y in range(FH):
        for x in range(FW):
            if ((x+.5-24)/15.6)**2+((y+.5-20)/12.6)**2<=0.97: g.p[y][x]=None
    return g
for k in ('up','flat','twitch'): keep('ears_'+k,ears(k),(FW,FH))
# eyes (left eye cols 15-18, right eye cols 29-32, rows 17-21)
def eyes(kind):
    g=f(); L,R=15,30
    if kind in('open','look_l','look_r','wide'):
        h=5 if kind=='wide' else 4; y0=17 if kind=='wide' else 18; w=4 if kind=='wide' else 3
        for x0 in (L,R):
            g.rect(x0,y0,x0+w-1,y0+h-1,'E')
            g.p[y0][x0]=None; g.p[y0][x0+w-1]=None
            hx = x0 + (0 if kind=='look_l' else (w-2 if kind=='look_r' else 0))
            g.put(hx+ (1 if kind=='open' or kind=='wide' else 0), y0+1,'e')
            g.put(hx+ (1 if kind!='look_r' else 0)+ (1 if kind=='wide' else 0), y0+h-2 if kind=='wide' else y0+1, 'e')
        if kind=='wide':
            for x0 in (L,R): g.put(x0+2,y0+3,'e')
    elif kind=='half':
        for x0 in (L,R): g.rect(x0,20,x0+2,21,'E'); g.rect(x0-1,19,x0+3,19,'E')
    elif kind=='happy':
        for x0 in (L,R): g.px('E',[(x0-1,20),(x0,19),(x0+1,18),(x0+2,19),(x0+3,20)])
    elif kind=='sleep':
        for x0 in (L,R): g.px('E',[(x0-1,19),(x0,20),(x0+1,20),(x0+2,20),(x0+3,19)])
    elif kind=='sad':
        for x0 in (L,R): g.rect(x0,19,x0+2,21,'E'); g.put(x0+1,19,'e')
        g.px('E',[(L-1,16),(L,16),(L+1,15),(R+1,15),(R+2,16),(R+3,16)])
    elif kind=='tired':
        for x0 in (L,R): g.rect(x0,19,x0+2,21,'E'); g.rect(x0-1,18,x0+3,18,'w2'); g.put(x0+1,19,'e')
    elif kind=='down':
        for x0 in (L,R): g.rect(x0,20,x0+2,21,'E'); g.put(x0,20,'e'); g.rect(x0-1,19,x0+3,19,'E')
    elif kind=='grumpy':
        for x0 in (L,R): g.rect(x0,19,x0+2,20,'E')
        g.px('E',[(L-1,17),(L,17),(L+1,18),(L+2,18),(R,18),(R+1,18),(R+2,17),(R+3,17)])
    return g
for k in ('open','look_l','look_r','wide','half','happy','sleep','sad','tired','grumpy','down'): keep('eyes_'+k,eyes(k),(FW,FH))
# nose
g=f(); g.rect(23,24,24,24,'p'); g.px('P',[(23,25),(24,25)]); keep('nose',g,(FW,FH))
g=f(); g.rect(23,23,24,23,'p'); g.px('P',[(23,24),(24,24)]); g.px('w2',[(22,24),(25,24)]); keep('nose_up',g,(FW,FH))
# mouths (under nose at rows 26-30)
def m(kind):
    g=f()
    if kind=='smile': g.px('E',[(23,26),(24,26),(22,27),(25,27),(21,27),(26,27)]); g.px('E',[(23,27),(24,27)])
    if kind=='smile': g=f(); g.px('E',[(23,26),(24,26),(21,27),(22,28),(23,27),(24,27),(25,28),(26,27)])
    if kind=='open': g.px('E',[(23,26),(24,26)]); g.rect(22,27,25,29,'M'); g.px('B',[(23,29),(24,29)]); g.px('e',[(23,27),(24,27)])
    if kind=='flat': g.px('E',[(23,26),(24,26),(22,27),(25,27)])
    if kind=='frown': g.px('E',[(23,26),(24,26),(22,28),(21,29),(23,27),(24,27),(25,28),(26,29)])
    if kind=='yawn': g.px('E',[(23,25),(24,25)]); g.rect(21,26,26,30,'M'); g.rect(22,29,25,30,'B'); g.px('e',[(22,26),(25,26)])
    if kind=='chew': g.px('E',[(23,26),(24,26),(22,27),(23,28),(24,28),(25,27)]); g.px('e',[(23,27),(24,27)])
    if kind=='grin': g.px('E',[(22,26),(23,26),(24,26),(25,26),(21,27),(26,27),(22,28),(25,28),(23,29),(24,29)]); g.rect(22,27,25,27,'M'); g.px('B',[(23,28),(24,28)])
    if kind=='teeth': g.px('E',[(23,26),(24,26),(22,27),(25,27)]); g.px('e',[(23,27),(24,27),(23,28),(24,28)])
    return g
for k in ('smile','open','flat','frown','yawn','chew','teeth','grin'): keep('mouth_'+k,m(k),(FW,FH))
# whiskers (2 frames)
for i,dy in enumerate((0,1)):
    g=f(); c='T'
    g.px(c,[(8,24+dy),(9,24+dy),(10,25),(11,25),(5,25+dy),(6,25+dy),(7,25+dy)][:0])
    for (x0,y0,x1,y1) in [(19,26,7,23+dy),(19,27,6,27+dy),(28,26,40,23+dy),(28,27,41,27+dy)]:
        n=max(abs(x1-x0),abs(y1-y0))
        for t in range(n+1):
            x=round(x0+(x1-x0)*t/n); y=round(y0+(y1-y0)*t/n)
            if abs(x-24)>5: g.put(x,y,c)
    keep(f'whisk{i}',g,(FW,FH))
g=f(); g.ell(11.5,27.5,2.6,1.3,'B'); g.ell(36.5,27.5,2.6,1.3,'B'); keep('blush',g,(FW,FH))
# cheek pouches
for k,(rx,ry) in {'s':(6.6,5.2),'l':(8.6,6.6)}.items():
    g=f(); g.ell(24-9.8-(rx-6.6)*0.6,27,rx,ry,'W'); g.ell(24+9.8+(rx-6.6)*0.6,27,rx,ry,'W')
    g.shade_edge('W','w2','bottom'); g.outline('K')
    for y in range(FH):
        for x in range(FW):
            if abs(x+.5-24)<6.2 and y<31: g.p[y][x]=None
    keep('cheeks_'+k,g,(FW,FH))
# paws
def inside(x,y):
    return ((x+.5-24)/15.6)**2+((y+.5-20)/12.6)**2<=1 or ((x+.5-24)/17)**2+((y+.5-33.5)/11.8)**2<=1
def paws(kind):
    g=f()
    if kind=='down':
        for x0 in (19,26): g.rect(x0,31,x0+2,32,'P'); g.px('p',[(x0,32),(x0+2,32)])
        g.outline('K')
        for x0 in (19,26): g.px('O',[(x0-1,30),(x0+3,30)]) if False else None
    elif kind=='hold':
        for x0 in (19,26): g.rect(x0,29,x0+2,31,'P'); g.px('p',[(x0,31),(x0+2,31)])
        g.outline('K')
    elif kind=='wash_l':
        g.ell(16.5,22,2.6,2.8,'P'); g.ell(29,29,2,1.8,'P'); g.outline('K')
    elif kind=='wash_r':
        g.ell(31.5,22,2.6,2.8,'P'); g.ell(19,29,2,1.8,'P'); g.outline('K')
    elif kind=='up':
        for sx in (1,-1):
            for t in range(5):
                x=int(24+sx*(15+t*0.6)); y=int(31-t*1.5)
                for xx in (x,x+sx):
                    if not inside(xx,y): g.put(xx,y,'O')
            g.ell(24+sx*18.6,23.4,2.3,2.4,'P')
        g.outline('K')
    elif kind in ('side_l','side_r'):
        sx=-1 if kind=='side_l' else 1
        for t in range(8):
            x=int(24+sx*(15+t))
            for yy in (30,31):
                if not inside(x,yy): g.put(x,yy,'O')
        g.ell(24+sx*23.2,30.5,2.2,2.2,'P')
        ox=19 if sx>0 else 26
        g.rect(ox,31,ox+2,32,'P')
        g.outline('K')
    elif kind=='cover':
        g.ell(16.5,20,3.3,2.6,'P'); g.ell(31.5,20,3.3,2.6,'P'); g.outline('K')
    return g
for k in ('down','hold','wash_l','wash_r','up','cover','side_l','side_r'): keep('paws_'+k,paws(k),(FW,FH))

# blanket (patchwork quilt) pulled up to three heights, paws holding the edge
pal.update(q1='#f2b2c0',q2='#fff1d6',q3='#a8d8c4',q4='#f2cc6a',qs='#ffffff',qd='#c98a98')
def blanket(T):
    g=f(); cols=['q1','q2','q3','q4']
    for y in range(T,46):
        for x in range(4,44):
            top = T + (1 if (x//5)%2 else 0)
            if y<top: continue
            c=cols[((x-4)//7 + (y-T)//6*2)%4]
            g.p[y][x]=c
    for x in range(4,44):
        top=T+(1 if (x//5)%2 else 0)
        g.put(x,top,'q2'); g.put(x,top+1,'q2'); g.put(x,top+2,'qd')
    for y in range(T+3,46):
        for x in range(4,44):
            if (x-4)%7==0 and y%2==0: g.put(x,y,'qs')
            if (y-T)%6==0 and x%2==0 and y>T+3: g.put(x,y,'qs')
    g.outline('K')
    for x0 in (16,28):
        g.rect(x0,T-1,x0+2,T,'P'); g.put(x0,T,'p'); g.put(x0+2,T,'p')
        g.px('K',[(x0-1,T-1),(x0-1,T),(x0+3,T-1),(x0+3,T),(x0,T-2),(x0+1,T-2),(x0+2,T-2)])
    return g
for i,T in enumerate((40,35,30)): keep(f'blanket{i}',blanket(T),(FW,FH))

# back view, standing on the hind legs with the paws on the window sill
def back(tilt, tail):
    g=G(FW,52)
    g.ell(24,37.5,15.4,13.6,'O')
    g.ell(24,20,15.6,12.6,'O')
    g.shade_edge('O','o','bottom')
    for x,y in [(17,9),(18,8),(19,8),(20,8),(21,8),(22,8),(26,8),(27,8),(28,8),(29,8),(30,8),(16,10),(31,9),(12,26),(11,28),(36,26),(37,28)]:
        if g.p[y][x]=='O': g.p[y][x]='Q'
    g.px('o',[(18,30),(19,31),(29,31),(30,30),(16,40),(32,40)])
    for cx in (16,32): g.ell(cx,50.4,3.6,1.6,'P')
    g.px('p',[(15,50),(17,50),(31,50),(33,50)])
    g.ell(24+tail,47.6,2.2,1.8,'Q')
    g.clear_below(52); g.outline('K')
    # arms reaching up to the sill
    for sx in (1,-1):
        for y in range(34,40):
            g.put(int(24+sx*14),y,'O'); g.put(int(24+sx*15),y,'O')
        g.ell(24+sx*14.5,33.6,2.4,1.6,'P')
    # ears from behind (outer side only)
    e=G(FW,52)
    e.ell(12,9.5+tilt,5,5,'O'); e.ell(36,9.5-tilt,5,5,'O'); e.ell(12,10+tilt,2.6,2.6,'o'); e.ell(36,10-tilt,2.6,2.6,'o')
    for y in range(52):
        for x in range(FW):
            if ((x+.5-24)/15.6)**2+((y+.5-20)/12.6)**2<=1: e.p[y][x]=None
    e.outline('K')
    for y in range(52):
        for x in range(FW):
            if e.p[y][x] and not (((x+.5-24)/15.6)**2+((y+.5-20)/12.6)**2<=0.97): g.p[y][x]=e.p[y][x]
    g.outline('K')
    return g
keep('back0',back(0,0),(FW,52)); keep('back1',back(1,1),(FW,52))
pal.update(bk='#c8463c',bkd='#8e2e26',pg='#fffaf0',pl='#c9c2b4')
def book(kind):
    if kind=='closed':
        g=G(10,12); g.rect(0,0,9,11,'bk'); g.rect(0,0,1,11,'bkd'); g.rect(8,1,9,10,'pg'); g.rect(3,3,6,4,'pg'); g.outline('K')
        return g
    # held open towards the hamster: from the front we see the outside of the cover
    g=G(22,14)
    g.rect(1,3,9,12,'bk'); g.rect(12,3,20,12,'bk')          # back and front cover
    g.rect(10,2,11,13,'bkd')                               # spine
    g.rect(2,2,9,2,'pg'); g.rect(12,2,19,2,'pg')           # page edges peeking out at the top
    g.rect(14,5,18,6,'pg'); g.rect(15,8,17,8,'pg')         # title on the front cover
    g.px('bkd',[(1,y) for y in range(3,13)]+[(20,y) for y in range(3,13)])
    if kind=='flip':
        g.rect(12,0,16,1,'pg'); g.px('pg',[(11,1),(17,1)])  # a page turning over the top
    g.outline('K')
    g.ell(2,11.5,2,1.6,'P'); g.ell(19.5,11.5,2,1.6,'P')
    return g
keep('book',book('closed'),(10,12)); keep('book_open',book('open'),(22,14)); keep('book_flip',book('flip'),(22,14))

# ================= SIDE WALK (facing right, 48 x 34) =================
SW,SH=48,34
def side(frame):
    g=G(SW,SH); bob=(0,1,0,1)[frame]
    # feet first (back layer)
    fx=[(10,37),(14,33),(10,37),(7,40)][frame]
    back=[(14,9),(10,13),(14,9),(17,6)][frame]
    for x in (back[1],):  g.ell(x,31.5,2.6,1.6,'p')
    for x in (fx[0]+28-8,): pass
    g.ell(22,19+bob,17,11.2,'O')          # body
    g.ell(36,16+bob,10.4,9.4,'O')         # head
    g.ell(44.5,19+bob,3.4,3,'O')          # snout
    g.ell(22,25.5+bob,12,4.5,'W')         # belly
    g.ell(40.5,21+bob,4.6,3.6,'W')        # cheek
    for y in range(SH):
        for x in range(SW):
            if g.p[y][x]=='W' and y<22+bob and x<36: g.p[y][x]='O'
    g.shade_edge('O','o','bottom')
    for x,y in [(14,9),(15,9),(16,8),(17,8),(18,8),(19,8),(20,8),(21,8),(22,8),(23,8),(30,7),(31,7),(32,6),(33,6),(34,6),(35,6),(36,6),(37,6),(38,6)]:
        y+=bob
        if 0<=y<SH and g.p[y][x]=='O': g.p[y][x]='Q'
    g.px('o',[(26,9+bob),(27,9+bob),(26,10+bob)])
    # tail
    g.px('O',[(4,17+bob),(4,18+bob),(5,17+bob),(5,18+bob)])
    # front and back feet (visible)
    ff=[34,37,34,31][frame]; bf=[12,9,12,15][frame]
    g.ell(ff,31.6,2.8,1.7,'P'); g.ell(bf,31.6,3.2,1.7,'P')
    g.ell(ff+5 if frame%2 else ff-3,31.4,2.2,1.4,'p') if False else None
    g.clear_below(34)
    g.outline('K')
    # ear (on top of outline)
    g.ell(31,8+bob,3.6,3.8,'O'); g.ell(31.4,8.6+bob,1.8,2,'P')
    g.px('K',[(28,5+bob),(29,4+bob),(30,4+bob),(31,4+bob),(32,4+bob),(33,5+bob),(34,6+bob),(27,6+bob),(27,7+bob),(34,7+bob)])
    # eye, nose
    g.rect(38,13+bob,39,15+bob,'E'); g.put(38,13+bob,'e')
    g.px('P',[(47,18+bob)]); g.px('p',[(47,19+bob)])
    g.px('E',[(45,21+bob),(44,22+bob)])
    # whiskers
    for x,y in [(42,18),(41,17),(40,16),(42,20),(41,20),(40,20)]: pass
    g.px('T',[(45,17+bob),(46,16+bob),(47,15+bob)])
    return g
for i in range(4): keep(f'walk{i}',side(i),(SW,SH))
# side sniff (head lowered, nose to floor)
g=side(0); keep('sniff',g,(SW,SH))

# ================= STAND (side, upright, 36 x 48) =================
STW,STH=36,48
def stand(lick, bob=0, fa=13, fb=20, lifta=0, liftb=0, arm=0):
    g=G(STW,STH); o=-bob
    g.ell(15,31.5+o,10.6,11.6,'O')
    g.ell(19,14+o,9.2,8.6,'O'); g.ell(26.5,15+o,3.2,3,'O')
    g.ell(19,33+o,6.4,8.6,'W'); g.ell(23,19+o,4.4,3.6,'W')
    g.px('O',[(4,36+o),(3,37+o),(4,37+o)])
    for y in range(STH):
        for x in range(STW):
            if g.p[y][x]=='W' and x<17 and y>24+o: g.p[y][x]='O'
    g.shade_edge('O','o','bottom')
    for x,y in [(13,7),(14,6),(15,6),(16,6),(17,5),(18,5),(19,5),(6,26),(5,28),(5,30),(5,32)]:
        y+=o
        if 0<=y<STH and g.p[y][x]=='O': g.p[y][x]='Q'
    for y in range(44,STH): g.p[y]=[None]*STW
    # legs: far leg darker, near leg light
    g.rect(fa-1,38+o,fa+1,45-lifta,'o'); g.ell(fa+0.8,46-lifta,3.2,1.6,'p')
    g.rect(fb-1,38+o,fb+1,45-liftb,'O'); g.px('o',[(fb+1,y) for y in range(38+o,46-liftb)]); g.ell(fb+0.8,46-liftb,3.4,1.7,'P')
    g.clear_below(48)
    g.outline('K')
    ax=arm
    g.ell(24.5+ax,25+o-abs(ax)*0.3,2.4,2,'P'); g.ell(21.5-ax*0.5,27+o,2.2,1.8,'P')
    g.px('K',[(int(26+ax),24+o),(int(27+ax),25+o),(int(26+ax),27+o),(int(23-ax*0.5),28+o),(int(24-ax*0.5),28+o)])
    g.ell(13,6+o,3.4,3.6,'O'); g.ell(13.4,6.6+o,1.7,1.9,'P'); g.px('K',[(10,4+o),(11,3+o),(12,2+o),(13,2+o),(14,2+o),(15,3+o),(16,4+o),(9,5+o),(9,6+o),(16,5+o)])
    g.rect(21,10+o,22,12+o,'E'); g.put(21,10+o,'e')
    g.px('P',[(29,14+o)]); g.px('p',[(29,15+o)])
    g.px('E',[(27,17+o),(26,18+o)])
    if lick: g.px('M',[(28,18+o),(29,18+o)]); g.px('B',[(29,19+o)])
    g.px('T',[(27,13+o),(28,12+o),(29,11+o)])
    return g
for i,(bob,fa,fb,la,lb,arm) in enumerate([(0,10,21,0,0,2),(1,14,17,3,0,0),(0,21,10,0,0,-2),(1,17,14,0,3,0)]):
    keep(f'bwalk{i}',stand(False,bob,fa,fb,la,lb,arm),(STW,STH))
keep('stand0',stand(False),(STW,STH)); keep('stand1',stand(True),(STW,STH))

# ================= CURL (sleep ball, 46 x 30) =================
CW,CH=46,30
def curl(dream):
    g=G(CW,CH)
    g.ell(21,17,19.5,12.6,'O')
    for y in range(28,CH): g.p[y]=[None]*CW
    g.rect(4,27,38,27,'O')
    g.ell(37,19,7.6,7.4,'O')                 # head tucked at the right
    g.ell(38.5,22,5.6,3.8,'W')               # muzzle and cheek
    g.shade_edge('O','o','bottom')
    for x,y in [(10,6),(11,5),(12,5),(13,4),(14,4),(15,4),(16,4),(17,4),(18,4),(19,4),(20,4),(8,7),(7,8),(6,9),(34,12),(35,12),(36,12)]:
        if g.p[y][x]=='O': g.p[y][x]='Q'
    g.px('o',[(17,9),(18,9),(19,10),(12,13),(13,14),(14,14),(24,11),(25,12)])
    g.px('O',[(1,18),(2,18),(1,19),(2,19)])  # tail
    for y in range(CH):
        for x in range(CW):
            d=((x+.5-37)/7.6)**2+((y+.5-19)/7.4)**2
            if 0.82<d<=1.0 and x<37 and g.p[y][x] in ('O','Q'): g.p[y][x]='T'
    g.outline('K')
    g.ell(32,9.5,3.6,3.4,'O'); g.ell(32.3,10,1.8,1.7,'P'); g.ell(40.5,11.5,3.2,3,'O'); g.ell(40.7,12,1.5,1.4,'P')
    g.px('K',[(29,7),(30,6),(31,6),(32,6),(33,6),(34,6),(35,7),(28,8),(38,9),(39,8),(40,8),(41,8),(42,8),(43,9),(44,10),(44,11)])
    g.px('E',[(36,17),(37,18),(38,18),(39,17)])     # closed eye
    g.px('p',[(44,21),(44,22)]); g.px('P',[(43,21)])  # nose
    g.px('E',[(42,24),(43,24)] if dream else [(42,24)])
    g.px('P',[(34,25),(35,25),(36,25)]); g.px('p',[(34,26),(36,26)])  # paw tucked
    g.px('B',[(35,21),(36,21)])
    return g
keep('curl0',curl(False),(CW,CH)); keep('curl1',curl(True),(CW,CH))

# ================= small sprites =================
def sprite(rows,name):
    g=G(len(rows[0]),len(rows))
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': g.p[y][x]=ch
    keep(name,g,(g.w,g.h))
pal.update(R='#e8554a',r='#b8382f',G='#6fae4a',g='#4e8a32',A='#f08a24',a='#c8681a',D='#3a2a1e',d='#5a4632',S='#9cc8ee',s='#d8ecfb',Y='#ffd34e',y='#e8a820',L='#ffffff')
sprite(["..K...",".KDK..","KDsDK.","KDsDK.","KDsDK.","KDsDK.",".KDK..","..K..."],'seed')
sprite(["..gG..","..Gg..","..G...",".KAAK.","KAAaAK","KAAAAK",".KAaK.",".KAAK.","..KAK.","..KK..","...K.."],'carrot')
sprite(["....g..","...K...",".KRRKK.","KRRLRRK","KRLRRRK","KRRRRrK","KRRRRrK",".KrRrK.","..KKK.."],'apple')
sprite([".RR.RR.","RLRRRRR","RRRRRRR",".RRRRR.","..RRR..","...R..."],'heart')
sprite(["...KK","..KKK","..K.K","..K..","..K..","KKK..","KKK.."],'note')
sprite(["KKKK","..K.",".K..","KKKK"],'zz')
sprite(["..Y..","..Y..","YYLYY","..Y..","..Y.."],'spark')
sprite(["KK","KK","KK","..","KK"],'bang')
sprite([".S.","SsS",".S."],'bubble')
sprite(["D"],'crumb')
sprite([".S..","SsS.","SSS.",".S.."],'drop')
json.dump({'art':out,'size':sizes},open('ham2.json','w'))

# ---------- preview sheet ----------
def raster(names,w,h,sc=6,flip=False):
    im=Image.new('RGB',(w*sc,h*sc),'#fbe9d4'); d=ImageDraw.Draw(im)
    for L in names:
        for mm in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', out[L]):
            for x,y,n in re.findall(r'M(\d+) (\d+)h(\d+)', mm.group(2)):
                x,y,n=int(x),int(y),int(n); d.rectangle([x*sc,y*sc,(x+n)*sc-1,y*sc+sc-1],fill=mm.group(1))
    return im
F=['body','ears_up','whisk0','nose']
combos=[F+['eyes_open','mouth_smile','paws_down'],F+['eyes_happy','mouth_smile','blush','paws_down'],F[:1]+['ears_flat','whisk1','nose','eyes_happy','mouth_smile','blush','paws_down'],F+['cheeks_l','eyes_happy','mouth_chew','paws_hold'],F+['eyes_look_l','mouth_flat','paws_down'],F[:1]+['ears_up','nose','eyes_wide','mouth_open','paws_down'],F+['eyes_happy','mouth_flat','paws_wash_l'],F+['eyes_happy','mouth_open','paws_up','blush'],F+['eyes_tired','mouth_yawn','paws_down'],F[:1]+['ears_flat','nose','eyes_grumpy','mouth_frown','paws_down'],F+['eyes_sad','mouth_frown','paws_down'],F+['eyes_sleep','mouth_flat','paws_cover']]
combos=[['back0'],['body','ears_up','whisk0','nose','eyes_happy','mouth_grin','paws_side_r','blush'],['body','ears_up','whisk0','nose','eyes_happy','mouth_open','paws_up'],['body','ears_up','whisk0','nose','eyes_happy','mouth_open','paws_side_l'],['body','ears_up','whisk0','nose','eyes_down','mouth_smile','paws_hold'],['body_l','ears_up','whisk0','nose','eyes_look_r','mouth_smile','paws_down'],['body_r','ears_up','whisk0','nose','eyes_look_r','mouth_smile','paws_down'],['body_tall','ears_up','whisk0','nose','eyes_look_l','mouth_open','paws_hold']]+combos[:1]+[F+['eyes_sleep','mouth_flat','blanket2'],F+['eyes_half','mouth_flat','blanket1'],F[:1]+['ears_up','nose','eyes_sleep','mouth_flat','blanket0']]
ims=[raster(c,FW,52 if ('body_tall' in c or 'back0' in c) else FH) for c in combos]+[raster([f'bwalk{i}'],STW,STH) for i in range(4)]
W=sum(i.width for i in ims[:6])+60; sheet=Image.new('RGB',(W, max(i.height for i in ims)*3+40),'#ccc')
x=y=0
for k,i in enumerate(ims):
    if k in (6,12): x=0; y+=FH*6+10
    sheet.paste(i,(x,y)); x+=i.width+10
sheet.save('sheet.png'); print(sheet.size)
