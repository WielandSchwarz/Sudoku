# winter hat and scarf for the hamster, in the 48 x 52 sprite space; colours are placeholders swapped in JS
import sys, json, math
sys.path.insert(0, '../wild'); from lib import G
OUT='#3a2414'
pal={'K':OUT,'C1':'#0b0001','C2':'#0b0002','W':'#fff4e6','W2':'#e8dccb'}
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
body_rows={20:(7,41),22:(8,40),24:(8,39),26:(8,39),28:(8,39),30:(7,40)}
def hat(dy=0):
    g=G(48,52)
    for y in range(0,12):
        for x in range(48):
            if ((x+.5-24)/10.6)**2+((y+.5-(11+dy))/8.6)**2<=1 and y<=10+dy: g.p[y][x]='C1'
    for x in range(13,35):
        for y in (9+dy,10+dy): g.put(x,y,'C2' if x%2 else 'C1')
    for x in range(15,33):
        if g.p[5+dy][x]: g.put(x,5+dy,'W')
        if g.p[6+dy][x] and x%2==0: g.put(x,6+dy,'W')
    g.ell(24,2.2+dy,2.6,2.3,'W'); g.put(25,3+dy,'W2'); g.put(23,1+dy,'W'); g.put(25,1+dy,'W2')
    g.outline('K'); return paths(g)
def scarf(back=False):
    g=G(48,52)
    rows={29:(7,40),30:(7,40),31:(7,40),32:(8,39)} if not back else {27:(9,38),28:(10,37),29:(10,37),30:(10,37)}
    for y,(a,b) in rows.items():
        for x in range(a,b+1): g.put(x,y,'C1' if (x+y)%4 else 'C2')
    y0=min(rows); y1=max(rows)
    for x in range(48):
        if g.p[y1][x]: g.p[y1][x]='C2'
    if not back:
        # knot and hanging end with a fringe
        g.ell(31,31,3,2.4,'C1'); g.put(31,31,'C2'); g.put(30,30,'C2')
        for i,y in enumerate(range(33,41)):
            x0=30+i*0.25
            for x in range(int(x0),int(x0)+4): g.put(x,y,'C1' if y%3 else 'C2')
        for i,x in enumerate(range(32,36)):
            g.put(x,41,'W' if i%2==0 else 'C2'); g.put(x,42,'W' if i%2==0 else None)
        for x in range(9,39,6): g.put(x,30,'W')
    else:
        for x in range(12,36,6): g.put(x,28,'W')
    g.outline('K'); return paths(g)
json.dump({'hat':hat(),'hat_back':hat(-1),'scarf':scarf(),'scarf_back':scarf(True)},open('outfit.json','w'))
print('ok')
