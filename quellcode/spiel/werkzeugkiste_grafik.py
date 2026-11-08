from PIL import Image
W,H=18,12
im=Image.new('RGBA',(W,H),(0,0,0,0));p=im.load()
def C(h):h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
def r(x,y,w,h,c):
    for yy in range(y,y+h):
        for xx in range(x,x+w):
            if 0<=xx<W and 0<=yy<H:p[xx,yy]=C(c)
INK='#3a2414'
r(5,0,8,4,INK);r(6,1,6,1,'#8a8a84');r(7,2,4,2,(0,0,0,0)) if False else None
r(7,2,4,2,'#00000000'[:7]) if False else None
r(0,3,18,9,INK);r(1,4,16,7,'#c8463c');r(1,4,16,2,'#e8706a');r(14,4,3,7,'#a03a32');r(1,7,16,1,INK);r(8,6,2,3,INK);r(8,7,2,1,'#e9b949')
# handle hole
for (x,y) in [(7,2),(8,2),(9,2),(10,2)]: p[x,y]=(0,0,0,0)
# copper pipe sticking out
r(3,1,3,3,INK);r(4,1,1,2,'#c8794a')
rows=[]
for y in range(H):
    x=0
    while x<W:
        c=p[x,y]
        if c[3]==0:x+=1;continue
        x0=x
        while x<W and p[x,y]==c:x+=1
        rows.append('<rect x="%d" y="%d" width="%d" height="1" fill="#%02x%02x%02x"/>'%(x0,y,x-x0,c[0],c[1],c[2]))
open('../ham2/toolbox.svg.txt','w').write(''.join(rows))
im.resize((W*8,H*8),Image.NEAREST).save('box.png')
