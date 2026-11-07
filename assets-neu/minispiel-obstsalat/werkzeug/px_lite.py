import re, json
from PIL import Image
import os
SP=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'quellcode', 'spiel') + os.sep
def hexc(h):
    h=h.lstrip('#')
    if len(h)==3: h=''.join(c*2 for c in h)
    return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
def svg_paths(svg):
    for m in re.finditer(r'<path([^>]*)>',svg):
        a=m.group(1); f=re.search(r'fill="([^"]+)"',a); d=re.search(r'\sd="([^"]+)"',a)
        op=re.search(r'opacity="([^"]+)"',a)
        if f and d: yield f.group(1), d.group(1), float(op.group(1)) if op else 1.0
    for m in re.finditer(r'<rect([^>]*)/?>',svg):
        a=m.group(1); g=lambda k,dv=0: float(re.search(k+r'="([^"]+)"',a).group(1)) if re.search(r'\s'+k+r'="',a) else dv
        f=re.search(r'fill="([^"]+)"',a)
        if f: yield f.group(1), 'M%g %gh%gv%gh%gz'%(g('x'),g('y'),g('width'),g('height'),-g('width')), 1.0
def rects(d):
    toks=re.findall(r'[MmHhVvZzLl]|-?[\d.]+',d); i=0; x=y=0; pts=[]; out=[]
    cmd=None
    while i<len(toks):
        t=toks[i]
        if t.isalpha(): cmd=t; i+=1
        if cmd in 'Zz':
            if pts: xs=[p[0] for p in pts]; ys=[p[1] for p in pts]; out.append((min(xs),min(ys),max(xs),max(ys)))
            pts=[]; continue
        if cmd=='M': x=float(toks[i]); y=float(toks[i+1]); i+=2; pts=[(x,y)]; cmd='L'
        elif cmd=='m': x+=float(toks[i]); y+=float(toks[i+1]); i+=2; pts=[(x,y)]; cmd='l'
        elif cmd=='L': x=float(toks[i]); y=float(toks[i+1]); i+=2; pts.append((x,y))
        elif cmd=='l': x+=float(toks[i]); y+=float(toks[i+1]); i+=2; pts.append((x,y))
        elif cmd=='h': x+=float(toks[i]); i+=1; pts.append((x,y))
        elif cmd=='H': x=float(toks[i]); i+=1; pts.append((x,y))
        elif cmd=='v': y+=float(toks[i]); i+=1; pts.append((x,y))
        elif cmd=='V': y=float(toks[i]); i+=1; pts.append((x,y))
        else: i+=1
    if pts: xs=[p[0] for p in pts]; ys=[p[1] for p in pts]; out.append((min(xs),min(ys),max(xs),max(ys)))
    return out
def render(svg,w,h):
    im=Image.new('RGBA',(w,h),(0,0,0,0)); P=im.load()
    for f,d,op in svg_paths(svg):
        if f=='none': continue
        c=hexc(f)
        for x0,y0,x1,y1 in rects(d):
            for yy in range(int(y0),int(y1)):
                for xx in range(int(x0),int(x1)):
                    if 0<=xx<w and 0<=yy<h:
                        if op<1:
                            b=P[xx,yy]; P[xx,yy]=tuple(int(b[k]*(1-op)+c[k]*op) for k in range(3))+(255,)
                        else: P[xx,yy]=c
    return im
def tile(name,kind):
    d=json.load(open(SP+'furn2.json'))
    it=[t for t in d[kind] if t['id']==name][0]; s=it['tile']
    vb=re.search(r'viewBox="0 0 (\d+) (\d+)"',s); w,h=int(vb.group(1)),int(vb.group(2))
    return render(s,w,h)
