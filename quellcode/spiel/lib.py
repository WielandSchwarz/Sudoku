from PIL import Image
class G:
    def __init__(s,w,h): s.w,s.h=w,h; s.p=[[None]*w for _ in range(h)]
    def put(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.p[y][x]=c
    def ell(s,cx,cy,rx,ry,c):
        for y in range(s.h):
            for x in range(s.w):
                if ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1: s.p[y][x]=c
    def rect(s,x0,y0,x1,y1,c):
        for y in range(y0,y1+1):
            for x in range(x0,x1+1): s.put(x,y,c)
    def poly(s,pts,c):
        for y in range(s.h):
            for x in range(s.w):
                px,py=x+.5,y+.5; ins=False; j=len(pts)-1
                for i in range(len(pts)):
                    xi,yi=pts[i]; xj,yj=pts[j]
                    if (yi>py)!=(yj>py) and px<(xj-xi)*(py-yi)/(yj-yi)+xi: ins=not ins
                    j=i
                if ins: s.p[y][x]=c
    def px(s,c,pts):
        for x,y in pts: s.put(x,y,c)
    def clear_below(s,y0):
        for y in range(y0,s.h): s.p[y]=[None]*s.w
    def only(s,f):  # recolor within mask
        pass
    def outline(s,c='K',diag=False):
        add=[]
        for y in range(s.h):
            for x in range(s.w):
                if s.p[y][x] is None:
                    nb=[(1,0),(-1,0),(0,1),(0,-1)]+([(1,1),(1,-1),(-1,1),(-1,-1)] if diag else [])
                    if any(0<=x+dx<s.w and 0<=y+dy<s.h and s.p[y+dy][x+dx] not in (None,c) for dx,dy in nb): add.append((x,y))
        for x,y in add: s.p[y][x]=c
    def shade_edge(s,src,dst,side='bottom'):
        d={'bottom':(0,1),'top':(0,-1),'right':(1,0),'left':(-1,0)}[side]
        ch=[]
        for y in range(s.h):
            for x in range(s.w):
                if s.p[y][x]==src:
                    nx,ny=x+d[0],y+d[1]
                    if not(0<=nx<s.w and 0<=ny<s.h) or s.p[ny][nx]!=src: ch.append((x,y))
        for x,y in ch: s.p[y][x]=dst
    def paths(s):
        cols={}
        for y,r in enumerate(s.p):
            x=0
            while x<s.w:
                c=r[x]
                if c is None: x+=1; continue
                n=1
                while x+n<s.w and r[x+n]==c: n+=1
                cols.setdefault(c,[]).append(f"M{x} {y}h{n}v1h-{n}z"); x+=n
        return cols
    def png(s,pal,fn,sc=12):
        im=Image.new('RGB',(s.w*sc,s.h*sc),'#ffffff')
        from PIL import ImageDraw; d=ImageDraw.Draw(im)
        for y,r in enumerate(s.p):
            for x,c in enumerate(r):
                if c: d.rectangle([x*sc,y*sc,x*sc+sc-1,y*sc+sc-1],fill=pal[c])
        im.save(fn)
