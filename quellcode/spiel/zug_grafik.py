# sprites for the first playable train game
import json
exec(open('mk2.py').read().split("riders=[")[0])
import io, base64
def uri(im): b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
A={}
# map background: grass, tracks, stations
W=L(180,104); W.r(0,0,180,104,'#9cc87a'); grass(W)
for t in TRACKS: rails(W,t)
for k in POS: station(W,k)
A['map']=uri(W.im)
# heads, bodies, pins
for k in ('maus','hase','fuchs','frosch','igel'):
    h=L(13,13); head(h,0,0,k); A['h_'+k]=uri(h.im)
    b=L(16,12); b.ell(8,6,6,4.6,{'maus':'#9a9aa6','hase':'#e8e0d8','fuchs':'#e8742c','frosch':'#6aa84e','igel':'#8a5a34'}[k]); b.outline(); A['b_'+k]=uri(b.im)
for k,col in ST.items():
    p=L(9,9); dot(p,0,0,col); A['p_'+k]=uri(p.im)
for hot in (0,1):
    s=L(17,17); s.ell(8.5,8.5,7.4,7.4,'#ffe08a' if hot else '#fff8ec'); s.outline(); A['sw%d'%hot]=uri(s.im)
# side view per station: sky, hills, building with the station colour, rails, train, platform (animals are drawn live)
def side_bg(k):
    W=L(180,135); W.r(0,0,180,104,'#cfe8f4')
    for (x,y,w) in ((14,10,26),(104,6,30),(150,18,20)):
        cl=L(w+4,10); cl.ell(w/2+2,5,w/2,3.4,'#ffffff'); cl.outline(); W.on(cl,x,y)
    hl=L(180,104); hl.ell(30,66,56,22,'#8ab86a'); hl.ell(150,70,64,22,'#7aa85a'); hl.outline(); W.on(hl)
    for y in range(67,104): W.r(0,y,180,1,'#9cc87a')
    bd=L(180,104); bd.r(60,30,56,32,'#f4e8d0'); bd.r(56,24,64,8,ST[k]); bd.r(56,24,64,1,'#ffffff'); bd.r(100,42,10,20,'#8a5a34'); bd.r(66,38,12,10,'#bfe4f4'); bd.outline(); W.on(bd)
    sg=L(30,11); sg.r(1,1,28,9,'#fff8ec'); sg.outline(); W.on(sg,73,12); dot(W,75,12,ST[k]); W.r(85,15,12,1,INK); W.r(85,17,8,1,INK)
    W.r(0,92,180,2,'#5a5a62')
    for x in range(0,180,6): W.r(x,94,4,2,'#8a6a4c')
    def coach(x):
        c=L(54,30); c.r(1,3,52,22,'#4e8c3c'); c.r(1,3,52,2,'#6aa84e'); c.r(1,1,52,3,'#8a5a34'); c.r(1,22,52,3,'#3e7030'); c.outline(); W.on(c,x,60)
        for s in range(3): W.r(x+5+s*16,66,12,11,INK); W.r(x+6+s*16,67,10,9,'#bfe4f4')
        for wx in (x+10,x+42): wh=L(10,10); wh.ell(5,5,4,4,'#3a3a3a'); wh.outline(); wh.px(5,5,'#8a8a8a'); W.on(wh,wx-5,84)
    coach(2); coach(58)
    lo=L(66,44); lo.r(36,6,24,30,'#c8463c'); lo.r(36,6,24,3,'#e8706a'); lo.r(2,18,38,18,'#c8463c'); lo.r(2,18,38,2,'#e8706a'); lo.r(8,4,7,14,'#3a3a3a'); lo.r(6,2,11,3,'#3a3a3a'); lo.r(0,32,62,5,'#5a3418'); lo.r(60,26,4,8,'#3a3a3a'); lo.outline(); W.on(lo,112,48)
    W.r(152,58,12,10,INK); W.r(153,59,10,8,'#bfe4f4')
    hm=L(12,11); hm.ell(6,6,4.6,4,'#e8a860'); hm.ell(2.4,2.4,1.8,1.8,'#e8a860'); hm.ell(9.6,2.4,1.8,1.8,'#e8a860'); hm.outline(); hm.r(4,7,4,2,'#fff6e4'); hm.px(4,5,INK); hm.px(8,5,INK); W.on(hm,152,58)
    for wx in (122,138,154): wh=L(14,14); wh.ell(7,7,6,6,'#3a3a3a'); wh.outline(); wh.px(7,7,'#8a8a8a'); W.on(wh,wx-7,80)
    W.r(0,104,180,31,'#9cc87a')
    pf=L(180,30); pf.r(0,1,180,22,'#c8c0b0'); pf.r(0,1,180,2,'#e0d8c8'); pf.r(0,20,180,3,'#a89a88'); pf.outline(); W.on(pf,0,97)
    for x in range(0,180,12): W.r(x,100,1,18,'#b8b0a0')
    border(W); return W.im
for k in ST: A['side_'+k]=uri(side_bg(k))
json.dump(A,open('../ham2/zug.json','w')); import os; print(os.path.getsize('../ham2/zug.json')//1024,'KB')
