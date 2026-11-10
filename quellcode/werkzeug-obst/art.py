# Obstsalat additions: pineapple + rings, honey jar, blender and glass for the smoothie finale (masks for the liquid)
import json, io, base64, math, os, shutil
from PIL import Image
os.chdir(os.path.dirname(os.path.abspath(__file__)))
exec(open('../zug/art2.py').read().split("# ---------------------------------------------------------------- map pieces")[0].replace("exec(open('mk2.py')", "exec(open('../zug/mk2.py')").replace("open('../rohr/stations.py')", "open('../rohr/stations.py')"))
def uri(im): b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def band(o,col,shades,cx,cy,r):
    """diagonal light from the top left, like the existing fruit: 3 bands over a round shape"""
    c=H(col)
    for y in range(o.h):
        for x in range(o.w):
            if o.p[x,y]==c:
                d=((x+.5-cx)+(y+.5-cy))/(2*r)
                if d<-.45: o.p[x,y]=H(shades[0])
                elif d>.35: o.p[x,y]=H(shades[2])
                elif d>.05: o.p[x,y]=H(shades[1])
def ananas():
    t=L(22,33)
    for i,(a,b) in enumerate(((10,0),(7,2),(13,1),(4,5),(17,4),(8,4),(12,4),(6,8),(15,7))):   # crown: spiky leaves
        poly(t,[(9,13),(a,b),(a+3,b+1.5),(12,13)],'#5aa84e')
    t.ell(11,22,8.6,10,'#e8b030'); t.outline()
    for y in range(t.h):
        for x in range(t.w):
            if t.p[x,y]==H('#5aa84e'):
                if x>11: t.p[x,y]=H('#3e8434')
                elif (x+y)%4==0: t.p[x,y]=H('#7cc86a')
    band(t,'#e8b030',('#f6d060','#d89a20','#b87818'),11,22,9)
    for y in range(13,32):   # diamond pattern of the skin
        for x in range(3,20):
            q=t.p[x,y]
            if q[3] and q!=INK and (x+y)%4==0 and (x-y)%4==0: t.p[x,y]=H('#8a5410')
            elif q[3] and q!=INK and ((x+y)%4==2 and (x-y)%4==2): t.p[x,y]=H('#fff0a0') if x<11 and y<23 else q
    return t
def ring():
    t=L(15,12); t.ell(7.5,6,6.6,5.2,'#f8e070'); t.outline(); t.ell(7.5,6,2.2,1.8,(0,0,0,0))
    for y in range(t.h):
        for x in range(t.w):
            q=t.p[x,y]
            if q==H('#f8e070') and ((x-7.5)/6.6)**2+((y-6)/5.2)**2>.62: t.p[x,y]=H('#e8b030')
            if q[3]==0 and ((x+.5-7.5)/2.2)**2+((y+.5-6)/1.8)**2<=1.6 and ((x+.5-7.5)/2.2)**2+((y+.5-6)/1.8)**2>.7: pass
    # ink around the hole
    for y in range(t.h):
        for x in range(t.w):
            if t.p[x,y][3]==0 and 3<x<12 and 2<y<10 and any(t.p[x+dx,y+dy]==H('#f8e070') for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))): t.p[x,y]=INK
    for (x,y) in ((4,4),(10,3),(11,8),(4,8)): t.px(x,y,'#fff6c0')
    return t
def honigglas():
    t=L(21,25)
    t.r(3,7,15,16,'#e8a020'); t.r(4,5,13,3,'#f0e0c8'); t.r(2,2,17,4,'#e04a3a'); t.r(1,4,19,2,'#e04a3a'); t.outline()
    for x in range(2,19):   # checked cloth lid
        for y in range(2,6):
            if (x//2+y//2)%2 and t.p[x,y]==H('#e04a3a'): t.p[x,y]=H('#fff8ec')
    t.r(3,6,15,1,'#c8794a')
    band(t,'#e8a020',('#f8c850','#e8a020','#c07010'),10,15,8)
    t.r(5,12,11,6,'#fff8ec'); t.r(5,17,11,1,'#e4d4b4'); t.r(8,14,5,1,'#e8a020'); t.r(9,15,3,1,'#e8a020')
    t.r(5,8,1,3,'#fff6c0'); t.px(6,8,'#fff6c0'); t.r(16,9,1,10,'#a85a10')
    return t
def blender():
    back=L(34,50); front=L(34,50); mask=L(34,50)
    # jug: a slightly tapered glass, lid on top, base below
    jug=[(6,7),(28,7),(26,35),(8,35)]
    poly(back,jug,'#e4f2f8'); poly(mask,[(7,8),(27,8),(25,34),(9,34)],'#ffffff')
    for y in range(8,35):   # back wall of the glass: faint
        for x in range(34):
            if back.p[x,y]==H('#e4f2f8') and (x+y)%9==0: back.p[x,y]=H('#d0e6f0')
    # front: outline of the jug, highlights, lid, handle, base with button
    fr=L(34,50); poly(fr,jug,'#ffffff'); fr.outline()
    for y in range(50):
        for x in range(34):
            if fr.p[x,y]==INK: front.p[x,y]=INK
    for y in range(9,33): front.px(9+(y-9)*1/14,y,'#ffffff') if y%5 else None;
    for y in range(10,30): front.px(11,y,'#ffffff') if y<24 else None
    front.r(23,12,1,14,'#c8e4f0')
    for y in range(12,32,5): front.r(24,y,3,1,INK)   # measuring marks
    lid=L(34,8); lid.r(5,2,24,4,'#3a3a3a'); lid.r(14,0,6,3,'#3a3a3a'); lid.outline(); lid.r(6,2,22,1,'#5e5e68'); lid.r(15,0,4,1,'#5e5e68')
    front.on(lid,0,2)
    hd=L(8,22); hd.r(1,1,5,20,'#3a3a3a'); hd.r(3,4,2,14,(0,0,0,0)); hd.outline(); hd.r(1,1,1,20,'#5e5e68'); front.on(hd,26,10)
    base=L(34,15); poly(base,[(7,1),(27,1),(30,13),(4,13)],'#e04a3a'); base.outline()
    band(base,'#e04a3a',('#f07a6a','#d03a2c','#a82a20'),17,7,12)
    base.ell(17,8,2.6,2.6,'#fff8ec'); base.px(17,8,'#3a3a3a'); base.r(8,2,18,1,'#5e5e68'); base.r(6,12,22,1,'#a82a20')
    front.on(base,0,35); back.on(base,0,35)
    return back,front,mask
def glas():
    back=L(26,34); front=L(26,34); mask=L(26,34)
    g=[(5,6),(21,6),(19,32),(7,32)]
    poly(back,g,'#eaf4f8'); poly(mask,[(6,7),(20,7),(18,31),(8,31)],'#ffffff')
    fr=L(26,34); poly(fr,g,'#ffffff'); fr.outline()
    for y in range(34):
        for x in range(26):
            if fr.p[x,y]==INK: front.p[x,y]=INK
    for y in range(9,28): front.px(8,y,'#ffffff')
    front.r(9,10,1,6,'#ffffff')
    # straw: red and white, sticking out to the top right
    st=L(26,34)
    for i in range(18):
        x=int(15+i*.25); y=24-i*1.3
        st.r(x,int(y),2,2,'#e04a3a' if (i//2)%2 else '#fff8ec')
    for y in range(0,3): st.r(19,y,2,1,'#e04a3a' if y%2 else '#fff8ec')
    st.r(19,0,4,2,'#fff8ec'); st.r(21,0,2,2,'#e04a3a'); st.outline()
    front.on(st); back.on(st)
    # a slice of orange on the rim
    sl=L(10,8); sl.ell(5,5,4,4,'#f8a040'); sl.outline(); sl.ell(5,5,2.6,2.6,'#ffd080'); sl.r(0,5,10,3,(0,0,0,0))
    for x in range(10):
        if sl.p[x,4]==H('#f8a040') or sl.p[x,4]==H('#ffd080'): sl.p[x,4]=INK if x in (1,8) else sl.p[x,4]
    return back,front,mask
A=json.load(open('../ham2/obst.json'))
if not os.path.exists('obst_orig.json'): shutil.copy('../ham2/obst.json','obst_orig.json')
A=json.load(open('obst_orig.json'))
for k,lay,fl,sd in (('ananas',ananas(),'#f8e070','#e8b030'),('ananasring',ring(),'#fff0a0','#e8b030'),('honigglas',honigglas(),'#f8c850','#e09020')):
    r={'ananas':10,'ananasring':6,'honigglas':10}[k]
    A['fruit'][k]={'img':uri(lay.im),'w':lay.w,'h':lay.h,'r':r,'flesh':fl,'seed':sd,'weights':{}}
b,f,m=blender(); g1,g2,g3=glas()
A['smoothie']={'blender_back':uri(b.im),'blender_front':uri(f.im),'blender_mask':uri(m.im),'bw':34,'bh':50,'glas_back':uri(g1.im),'glas_front':uri(g2.im),'glas_mask':uri(g3.im),'gw':26,'gh':34}
json.dump(A,open('../ham2/obst.json','w'))
sh=Image.new('RGBA',(160,56),(156,200,122,255)); x=2
for lay in (ananas(),ring(),honigglas()): sh.alpha_composite(lay.im,(x,2)); x+=lay.w+4
sh.alpha_composite(b.im,(x,2)); sh.alpha_composite(f.im,(x,2)); x+=36
sh.alpha_composite(g1.im,(x,2)); sh.alpha_composite(g2.im,(x,2))
sh.resize((800,280),Image.NEAREST).save('art_sheet.png'); print('ok', os.path.getsize('../ham2/obst.json')//1024)
