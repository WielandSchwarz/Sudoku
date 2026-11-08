from PIL import Image, ImageDraw, ImageFont
import math
INK=(58,36,20,255)
def C(h): h=h.lstrip('#'); return (int(h[0:2],16),int(h[2:4],16),int(h[4:6],16),255)
base=Image.open('../diele/gram_messing.png').convert('RGBA')
CAB=base.crop((0,45,40,69))
class P:
    def __init__(s,w=40,h=69): s.im=Image.new('RGBA',(w,h),(0,0,0,0)); s.p=s.im.load(); s.w=w; s.h=h
    def px(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.p[x,y]=C(c) if isinstance(c,str) else c
    def r(s,x,y,w,h,c):
        for yy in range(y,y+h):
            for xx in range(x,x+w): s.px(xx,yy,c)
    def box(s,x,y,w,h,c,hi=None,sh=None):          # filled box with 1px ink frame, light top-left, dark bottom-right
        s.r(x,y,w,h,INK); s.r(x+1,y+1,w-2,h-2,c)
        if hi: s.r(x+1,y+1,w-2,1,hi); s.r(x+1,y+1,1,h-2,hi)
        if sh: s.r(x+1,y+h-2,w-2,1,sh); s.r(x+w-2,y+1,1,h-2,sh)
    def ell(s,cx,cy,rx,ry,c):
        for y in range(int(cy-ry)-1,int(cy+ry)+2):
            for x in range(int(cx-rx)-1,int(cx+rx)+2):
                if ((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1: s.px(x,y,c)
    def outline(s):
        a=s.im.copy(); q=a.load()
        for y in range(s.h):
            for x in range(s.w):
                if q[x,y][3]==0 and any(0<=x+dx<s.w and 0<=y+dy<s.h and q[x+dx,y+dy][3]>0 for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))): s.p[x,y]=INK
        return s
    def cab(s): s.im.alpha_composite(CAB,(0,45)); return s

def koffer():                         # suitcase record player, lid open, on the record cabinet
    s=P().cab()
    s.box(5,14,30,20,'#c8463c','#e06a58','#a0302c')            # open lid (behind)
    s.r(7,16,26,16,'#f4e8d0'); s.r(7,16,26,1,'#fff8ec'); s.r(31,16,2,16,'#e2d2b4')
    for x in range(9,31,4): s.r(x,18,2,1,'#e2d2b4')            # little speaker holes in the lid
    s.r(10,24,20,6,'#e2d2b4'); s.r(11,25,18,4,'#d4c09c')
    s.box(3,33,34,12,'#c8463c','#e06a58','#a0302c')            # case
    s.r(4,34,32,2,'#f4e8d0')                                    # cream top face
    s.r(4,40,32,1,'#f4e8d0'); s.r(17,41,6,2,'#d8d8d0'); s.px(17,41,INK); s.px(22,41,INK)   # band and clasp
    s.ell(14,34.5,7,1.6,'#2a2a2a'); s.r(12,34,4,1,'#c8463c'); s.px(13,34,'#f4e8d0')        # record
    s.r(24,32,2,3,'#b8b8b0'); s.r(22,32,8,1,'#d8d8d0'); s.px(29,33,'#8a8a84')               # tone arm
    s.px(32,36,'#f4e8d0'); s.px(33,36,'#f4e8d0')
    return s.outline()

def radio():                          # wooden tube radio with an arched top
    s=P().cab()
    for y in range(16,45):
        for x in range(4,36):
            dy=y-16; arch=math.sqrt(max(0,1-((x+.5-20)/16)**2))*8
            if dy>=8-arch: s.px(x,y,'#9a5a2c')
    for y in range(16,45):
        for x in range(4,36):
            if s.p[x,y][3] and (x<6 or x>33 or y>42): s.px(x,y,'#6e3e1c' if x>33 or y>42 else '#b87440')
    for y in range(19,33):                                       # speaker cloth with wooden slats
        for x in range(8,32):
            arch=math.sqrt(max(0,1-((x+.5-20)/12)**2))*6
            if y-19>=6-arch: s.px(x,y,'#e8c890' if (x-8)%4 else '#7a4a26')
    s.r(8,34,24,5,INK); s.r(9,35,22,3,'#fff2c0'); s.px(18,35,'#c8463c'); s.px(18,36,'#c8463c'); s.px(18,37,'#c8463c')
    for x in range(10,31,3): s.px(x,37,'#c8a060')
    s.ell(10,41.5,1.6,1.6,'#e9b949'); s.ell(30,41.5,1.6,1.6,'#e9b949')
    return s.outline()

def jukebox():                        # jukebox with a rainbow arch, stands on its own
    s=P()
    for y in range(4,69):
        for x in range(3,37):
            if y<22:
                if ((x+.5-20)/17)**2+((y+.5-22)/18)**2<=1: s.px(x,y,'#8a4a24')
            else: s.px(x,y,'#8a4a24')
    bands=['#e04a3a','#f0963a','#f4d050','#78c060','#4a9ae0']
    for i,c in enumerate(bands):
        for y in range(6,40):
            for x in range(5,35):
                d=((x+.5-20)/(15-i*1.4))**2+((y+.5-22)/(16-i*1.4))**2
                d2=((x+.5-20)/(15-(i+1)*1.4))**2+((y+.5-22)/(16-(i+1)*1.4))**2
                if d<=1 and d2>1 and y<38: s.px(x,y,c)
    for y in range(13,30):                                      # glass dome with records inside
        for x in range(13,27):
            if ((x+.5-20)/7)**2+((y+.5-22)/8)**2<=1 or y>=22: s.px(x,y,'#cfe8f0')
    for k in range(3): s.r(14,23+k*2,12,1,'#2a2a2a'); s.px(19,23+k*2,'#c8463c')
    s.r(15,16,1,4,'#ffffff')
    s.box(6,38,28,9,'#d8d8d0','#ffffff','#a8a8a0')               # selector panel
    for x in range(9,32,3): s.r(x,40,2,1,'#e04a3a' if x%2 else '#4a9ae0'); s.r(x,43,2,1,'#2a2a2a')
    s.box(8,48,24,14,'#c8c8c0','#ececE4','#a0a098')               # grille
    for y in range(50,61,2): s.r(10,y,20,1,'#8a8a84')
    s.r(3,63,34,6,'#6e3a1c'); s.r(3,63,34,1,'#a86a3a')
    for x in range(4,36): 
        if s.p[x,40][3] and (x<6 or x>33): s.px(x,40,'#6e3a1c')
    return s.outline()

def klavier():                        # small upright piano
    s=P()
    s.box(1,20,38,26,'#3a2a24','#5a443a','#24180f')              # body
    s.box(0,18,40,4,'#4a362c','#6a5246',None)                    # lid
    s.r(6,24,28,10,'#2a1c16'); s.r(7,25,26,8,'#4a362c')          # front panel
    for x in range(9,32,5): s.r(x,26,3,6,'#5a443a')
    s.r(10,19,4,1,'#e9b949'); s.r(26,19,4,1,'#e9b949')           # brass on the lid
    s.r(1,36,38,6,INK); s.r(2,37,36,4,'#fff8ec')                 # keys
    for x in range(4,37,3): s.r(x,37,1,4,'#d8d0c0')
    for x in [4,7,13,16,19,25,28,34]: s.r(x,37,2,2,'#1a1210')
    s.box(1,45,38,16,'#3a2a24','#5a443a','#24180f')              # lower part
    s.r(5,48,30,10,'#2a1c16'); s.r(6,49,28,8,'#4a362c')
    s.r(3,61,4,8,'#24180f'); s.r(33,61,4,8,'#24180f'); s.r(14,62,2,4,'#e9b949'); s.r(18,62,2,4,'#e9b949'); s.r(22,62,2,4,'#e9b949')
    s.r(8,10,2,8,'#fff8ec'); s.px(8,9,'#f4d050'); s.px(8,8,'#f08030')        # candle on the piano
    s.r(30,13,7,5,'#fff2c0'); s.r(31,14,5,1,'#8a6a4a'); s.r(31,16,4,1,'#8a6a4a')   # sheet music
    return s.outline()

def drehorgel():                      # barrel organ on a little cart with golden pipes and a crank
    s=P()
    s.box(4,30,30,26,'#b04a34','#d06a50','#8a3024')
    s.r(7,33,24,14,INK); s.r(8,34,22,12,'#3a2414')
    for i,x in enumerate(range(9,30,3)):                         # pipes
        h=4+abs(3-i)*2; s.r(x,46-h-6,2,h+6,'#e9b949'); s.px(x,46-h-6,'#fff2c0'); s.r(x+1,46-h-5,1,h+5,'#b8862a'); s.px(x,44,INK); s.px(x+1,44,INK)
    s.r(5,49,28,1,'#e9b949'); s.r(5,52,28,1,'#e9b949')
    for x in range(8,31,6): s.ell(x,26,1.6,1.6,'#e9b949')       # decoration on top
    s.box(3,26,32,5,'#8a3024','#b04a34',None)
    s.r(35,40,3,2,'#8a8a84'); s.r(37,38,2,6,'#8a8a84'); s.r(36,44,3,2,'#6a4a2a')   # crank
    s.r(2,56,34,3,'#6a3a1c')
    s.ell(9,62,5.5,5.5,INK); s.ell(9,62,4.5,4.5,'#8a5a2c'); s.ell(9,62,1.4,1.4,'#e9b949')
    s.ell(29,62,5.5,5.5,INK); s.ell(29,62,4.5,4.5,'#8a5a2c'); s.ell(29,62,1.4,1.4,'#e9b949')
    for a in range(0,360,60):
        for rr in (2,3,4):
            s.px(int(9+math.cos(math.radians(a))*rr), int(62+math.sin(math.radians(a))*rr), '#5a3418')
            s.px(int(29+math.cos(math.radians(a))*rr), int(62+math.sin(math.radians(a))*rr), '#5a3418')
    s.r(18,15,4,11,'#6a3a1c'); s.box(14,10,12,6,'#f4e8d0','#fff8ec','#d8c8a8')         # sign on a post
    s.r(16,12,8,1,'#c8463c')
    return s.outline()

def spieluhr():                       # music box with a little turning dancer, on the record cabinet
    s=P().cab()
    s.box(6,24,28,8,'#8a5a9a','#aa7aba','#6a3a7a')               # open lid (behind)
    s.r(8,26,24,4,'#f8e0f0'); s.r(8,26,24,1,'#fff4fa')
    s.box(5,32,30,13,'#8a5a9a','#aa7aba','#6a3a7a')              # box
    s.r(6,33,28,2,'#d8b0e0')
    s.r(8,38,24,1,'#e9b949'); s.r(8,41,24,1,'#e9b949'); s.ell(20,39.5,2,2,'#e9b949'); s.px(20,39,'#fff2c0')
    s.r(19,22,2,11,'#d8d8d0')                                    # the dancer's pole
    s.ell(20,19,2.2,2.2,'#f4c8a8'); s.r(18,15,4,3,'#6a3a1c'); s.px(19,19,INK); s.px(21,19,INK)   # head with hair
    s.r(18,21,4,3,'#f08ab0'); s.ell(20,25,5,1.6,'#f8b0cc'); s.r(19,26,1,4,'#f4c8a8'); s.r(21,26,1,4,'#f4c8a8')
    s.px(15,23,'#f4c8a8'); s.px(16,22,'#f4c8a8'); s.px(24,22,'#f4c8a8'); s.px(25,21,'#f4c8a8')
    s.r(35,37,3,1,'#c8c8c0'); s.r(37,36,1,3,'#c8c8c0')           # key
    s.outline(); _notes(s); return s

def _notes(s):
    for (x,y) in [(9,13),(29,9)]:                       # two eighth notes floating up
        s.r(x,y,2,2,'#3a2414'); s.r(x+2,y-4,1,5,'#3a2414'); s.px(x+3,y-3,'#3a2414'); s.px(x+4,y-2,'#3a2414')

def recorder():                       # a 70s cassette recorder with two speakers, on the record cabinet
    s=P().cab()
    s.r(10,24,20,2,'#8a8a84'); s.r(9,26,2,6,'#8a8a84'); s.r(29,26,2,6,'#8a8a84')   # handle
    s.box(2,30,36,15,'#c8c8c0','#ececE4','#9a9a94')
    for cx in (9,31):
        s.ell(cx,38,5.6,5.6,INK); s.ell(cx,38,4.6,4.6,'#4a4a4a'); s.ell(cx,38,2.4,2.4,'#2a2a2a'); s.px(cx-1,37,'#8a8a84')
    s.box(15,33,10,8,'#2a2a2a',None,None); s.r(17,35,6,3,'#e9b949'); s.ell(18,36.5,1,1,'#2a2a2a'); s.ell(22,36.5,1,1,'#2a2a2a')   # cassette
    for x in range(15,26,2): s.r(x,42,1,2,'#3a3a3a')
    s.r(4,31,8,1,'#e04a3a'); s.r(28,31,8,1,'#4a9ae0')
    return s.outline()

def stereo():                         # a hi-fi tower with two speakers, stands on its own
    s=P()
    for x0 in (0,30):                                            # speakers
        s.box(x0,30,10,39,'#7a4a26','#9a6a3a','#5a3418')
        s.ell(x0+5,40,3.2,3.2,INK); s.ell(x0+5,40,2.3,2.3,'#3a3a3a'); s.px(x0+5,40,'#6a6a6a')
        s.ell(x0+5,52,3.6,3.6,INK); s.ell(x0+5,52,2.7,2.7,'#3a3a3a'); s.px(x0+5,52,'#6a6a6a')
        s.ell(x0+5,34,1.2,1.2,'#d8d8d0')
    s.box(11,22,18,47,'#3a3a3a','#5a5a5a','#2a2a2a')             # tower
    s.r(12,23,16,6,'#5a5a5a'); s.ell(20,25.5,6,1.4,'#1a1a1a'); s.px(20,25,'#e04a3a'); s.r(25,23,1,3,'#d8d8d0')   # record player on top
    s.r(12,30,16,1,INK); s.r(13,32,10,3,'#1a3a2a'); s.r(14,33,6,1,'#78e090'); s.ell(25,33.5,1.4,1.4,'#c8c8c0')   # receiver
    s.r(12,37,16,1,INK); s.r(13,39,14,4,'#2a2a2a'); s.r(15,40,4,2,'#8a8a84'); s.r(21,40,4,2,'#8a8a84')          # double cassette deck
    s.r(12,45,16,1,INK); s.r(13,47,14,2,'#2a2a2a'); s.r(14,47,6,1,'#c8c8c0')                                  # cd drawer
    for x in range(14,27,3): s.px(x,51,'#c8c8c0')
    s.r(12,55,16,13,'#2a2a2a'); 
    for i in range(4): s.r(13,57+i*3,14,2,['#e04a3a','#f4d050','#4a9ae0','#78c060'][i])   # records in the bottom
    return s.outline()

D=[('koffer','Koffer-Plattenspieler',koffer),('radio','Röhrenradio',radio),('jukebox','Musikbox',jukebox),('klavier','Klavier',klavier),
   ('drehorgel','Drehorgel',drehorgel),('spieluhr','Spieluhr',spieluhr),('recorder','Kassettenrekorder',recorder),('stereo','Stereoanlage',stereo)]
ims=[]
ONCAB={'koffer','radio','spieluhr','recorder'}
for k,n,f in D:
    im=f().im
    if k in ONCAB:                                   # centre the piece on the cabinet (the cabinet's middle is x=18)
        top=im.crop((0,0,40,45)); bb=top.getbbox(); body=(bb[0]+bb[2])/2 if k!='spieluhr' else 20
        dx=round(18-body) if k!='spieluhr' else -2
        n2=Image.new('RGBA',(40,69),(0,0,0,0)); n2.alpha_composite(CAB,(0,45)); n2.alpha_composite(top,(dx,0)) if dx>=0 else n2.paste(top.crop((-dx,0,40,45)),(0,0),top.crop((-dx,0,40,45))); im=n2
    elif k=='jukebox':
        n2=Image.new('RGBA',(40,69),(0,0,0,0)); c=im.crop((2,0,40,69)); n2.paste(c,(0,0),c); im=n2
    if k=='spieluhr':
        q=im.load()
        for yy in range(38,45):
            for xx in range(0,2): q[xx,yy]=(0,0,0,0)
    im.save('m_'+k+'.png'); ims.append((n,im))
ims=[('Grammophon (bisher)',base)]+ims
S=6; cw=56; W=cw*len(ims); H=100
sheet=Image.new('RGBA',(W,H),C('#e8dcc4'))
d=ImageDraw.Draw(sheet); d.rectangle([0,80,W,H],fill=C('#b07a46'))
for i,(n,im) in enumerate(ims):
    x=i*cw+(cw-im.width)//2; sh=Image.new('RGBA',(im.width-4,3),(0,0,0,40)); sheet.alpha_composite(sh,(x+2,79)); sheet.alpha_composite(im,(x,80-im.height))
big=sheet.resize((W*S,H*S),Image.NEAREST)
d=ImageDraw.Draw(big)
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except: f=None
for i,(n,im) in enumerate(ims):
    tw=d.textlength(n,font=f); d.text((i*cw*S+(cw*S-tw)/2,83*S),n,fill=(255,248,236),font=f)
big.save('musik_sheet.png'); print(big.size)
