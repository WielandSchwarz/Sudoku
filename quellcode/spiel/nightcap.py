import sys, json, math
sys.path.insert(0, '../wild'); from lib import G
pal={'K':'#3a2414','W':'#fbf6ee','W2':'#e2d8ca','W3':'#c9bcab','B':'#9fc2e8','B2':'#7aa2d0','Y':'#f5d76a'}
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k,v in g.paths().items())
def cap():
    g=G(48,52)
    # dome over the head
    for y in range(1,12):
        for x in range(48):
            if ((x+.5-24)/10.8)**2+((y+.5-11.5)/8.8)**2<=1 and y<=10: g.p[y][x]='W'
    # cone flopping over to the right: a tapering tube from the crown down the side
    pts=[(24,5.6,4.4),(28,4.4,3.4),(31.5,3.9,2.8),(35,4.6,2.5),(37.8,6.4,2.3),(39.8,9,2.0),(41,12,1.7),(41.6,14.4,1.4)]
    for i in range(len(pts)-1):
        (x0,y0,r0),(x1,y1,r1)=pts[i],pts[i+1]
        for t in [k/14 for k in range(15)]:
            cx=x0+(x1-x0)*t; cy=y0+(y1-y0)*t; r=r0+(r1-r0)*t
            for y in range(int(cy-r)-1,int(cy+r)+2):
                for x in range(int(cx-r)-1,int(cx+r)+2):
                    if 0<=x<48 and 0<=y<52 and (x+.5-cx)**2+(y+.5-cy)**2<=r*r: g.p[y][x]='W'
    # soft shading underneath the fold and on the right
    for y in range(52):
        for x in range(48):
            if g.p[y][x]=='W':
                below = y+1<52 and not g.p[y+1][x]
                right = x+1<48 and not g.p[y][x+1]
                if (x>=30 and (below or right)) or (x<30 and x>=27 and y>=6): g.p[y][x]='W2'
    for x,y in [(31,5),(32,5),(33,5),(34,6),(35,6),(36,7),(37,7)]:
        if g.p[y][x]: g.p[y][x]='W2'
    # cuff: thick rolled band with a light-blue stripe
    for x in range(13,35):
        g.put(x,8,'W'); g.put(x,9,'B' if x%2 else 'B2'); g.put(x,10,'W2')
    g.put(12,10,'W2'); g.put(35,10,'W2')
    # a few little stars on the cap
    for x,y in [(18,5),(24,3),(29,6)]: g.put(x,y,'Y')
    # pompom at the tip
    g.ell(42,16,2.6,2.4,'W'); g.put(43,17,'W2'); g.put(42,18,'W2'); g.put(41,15,'W'); g.put(43,16,'W3')
    g.outline('K'); return paths(g)
o=json.load(open('outfit.json')); o['nightcap']=cap(); json.dump(o,open('outfit.json','w')); print('ok')
