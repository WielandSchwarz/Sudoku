from PIL import Image
W,H=24,17
im=Image.new('RGBA',(W,H),(0,0,0,0));p=im.load()
def C(h):h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
def r(x,y,w,h,c):
    for yy in range(y,y+h):
        for xx in range(x,x+w):
            if 0<=xx<W and 0<=yy<H:p[xx,yy]=C(c)
INK='#3a2414'
# legs
r(2,9,4,8,INK);r(3,9,2,8,'#8a5a34');r(3,9,1,8,'#a87444')
r(18,9,4,8,INK);r(19,9,2,8,'#8a5a34');r(19,9,1,8,'#a87444')
r(5,13,14,2,INK);r(5,13,14,1,'#7a4a26')  # stretcher
# top plank
r(0,6,24,4,INK);r(1,7,22,2,'#b8844c');r(1,7,22,1,'#d09a5a');r(1,9,22,0,'#000')
# vice on the right end
r(19,2,4,5,INK);r(20,3,2,3,'#8a8a84');r(20,3,2,1,'#b4b4ac');r(17,4,2,1,INK)
# copper elbow lying on the bench
r(3,1,9,4,INK);r(8,1,4,6,INK);r(4,2,6,2,'#c8794a');r(4,2,6,1,'#e8a070');r(9,2,2,4,'#c8794a');r(9,2,1,4,'#e8a070');r(4,3,7,1,'#a85a34');r(9,3,1,3,'#e8a070');r(10,4,1,2,'#a85a34')
# wrench
r(13,4,4,2,INK);r(12,3,2,3,INK);r(14,4,2,1,'#b4b4ac')
rows=[]
for y in range(H):
    x=0
    while x<W:
        c=p[x,y]
        if c[3]==0:x+=1;continue
        x0=x
        while x<W and p[x,y]==c:x+=1
        rows.append('<rect x="%d" y="%d" width="%d" height="1" fill="#%02x%02x%02x"/>'%(x0,y,x-x0,c[0],c[1],c[2]))
open('bench.svg.txt','w').write(''.join(rows))
im.resize((W*8,H*8),Image.NEAREST).save('bench.png')
