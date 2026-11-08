import json, re
from PIL import Image
def svg_to_img(svg, w, h):
    im=Image.new('RGBA',(w,h),(0,0,0,0)); p=im.load()
    for fill, d in re.findall(r'<path[^>]*fill="(#[0-9a-fA-F]{6})"[^>]*d="([^"]+)"', svg):
        col=tuple(int(fill[i:i+2],16) for i in (1,3,5))+(255,)
        for m in re.finditer(r'M(-?\d+) (-?\d+)h(-?\d+)v(-?\d+)h-?\d+z', d):
            x,y,ww,hh=map(int,m.groups())
            for yy in range(y,y+hh):
                for xx in range(x,x+ww):
                    if 0<=xx<w and 0<=yy<h: p[xx,yy]=col
    return im
if __name__=='__main__':
    a=json.load(open('../mock2/animals3.json'))['mouse']
    im=svg_to_img(a['svg'],48,50); im.save('st/mouse48.png'); im.resize((480,500),Image.NEAREST).save('st/mouse48_big.png')
    px=im.load()
    for y in range(20,34):
        print(''.join({(43,29,18,255):'E',(58,36,20,255):'k'}.get(px[x,y],'.' if px[x,y][3]==0 else 'o') for x in range(48)))
