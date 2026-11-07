import sys, math, json, os
W='/home/claude/sudoku-repo/assets-neu/minispiel-obstsalat/werkzeug'
sys.path.insert(0, W)
from obstsalat_assets import Layer, shaded, ellfn, C, uri
from PIL import Image

def pusteblume():
    w, h = 22, 25; L = Layer(w, h)
    L.vl(10, 15, 10, C('#6aa84e')); L.vl(11, 15, 10, C('#4e8c3c'))
    shaded(L, ellfn(11, 9.5, 9.6, 9.0), ('#ffffff', '#f6f6f0', '#e4e4dc', '#c8c8c0'))
    for k in range(16):                                      # little seed parachutes as dots and rays
        a = k * math.pi / 8
        x, y = int(11 + math.cos(a) * 7), int(9.5 + math.sin(a) * 6.6)
        L.px(x, y, C('#b8b8ae'))
    for k in range(8):
        a = k * math.pi / 4 + .3
        L.px(int(11 + math.cos(a) * 3.5), int(9.5 + math.sin(a) * 3.2), C('#c8c8bc'))
    L.px(10, 9, C('#a89c6c')); L.px(11, 9, C('#a89c6c')); L.px(10, 10, C('#8a7e50')); L.px(11, 10, C('#8a7e50'))
    return L.outline()

def kokosnuss():
    w, h = 24, 23; L = Layer(w, h)
    shaded(L, ellfn(12, 11.8, 11.2, 10.6), ('#c8905a', '#9a6436', '#7a4a26', '#56321a'))
    import random; r = random.Random(4)
    for i in range(46):                                      # fibres
        x, y = r.randint(2, 21), r.randint(2, 20)
        if L.get(x, y) and L.get(x, y)[3]: L.px(x, y, C('#b88050') if r.random() < .5 else C('#5e3a1e'))
    for (x, y) in ((9, 8), (14, 8), (11, 12)):              # the three eyes
        L.px(x, y, C('#2e1a0c')); L.px(x + 1, y, C('#2e1a0c')); L.px(x, y + 1, C('#3e2412'))
    return L.outline()

def kokosstueck():
    w, h = 11, 8; L = Layer(w, h)
    for y in range(h):
        for x in range(w):
            dx, dy = (x + .5 - 5.5) / 5.4, (y + .5 - 1) / 6.6
            if dy >= 0 and dx * dx + dy * dy <= 1:
                d = dx * dx + dy * dy
                L.px(x, y, C('#7a4a26') if d > .72 else C('#ffffff') if y < 3 else C('#f2ece0'))
    L.px(3, 1, C('#fffaf2')); L.px(4, 1, C('#fffaf2'))
    return L.outline()

def wassermelone():
    w, h = 32, 24; L = Layer(w, h)
    shaded(L, ellfn(16, 12, 15.2, 11.2), ('#b8e890', '#6ab048', '#4a9036', '#2e6a24'))
    for y in range(h):
        for x in range(w):
            p = L.get(x, y)
            if p and p[3]:
                s = math.sin((x - 16) * .55 + math.sin(y * .5) * .9)
                if s > .62: L.px(x, y, C('#2e6a24') if (x * .6 + y * .8) > 20 else C('#3e7e2e'))
    L.px(8, 6, C('#e0f8c0')); L.px(9, 5, C('#e0f8c0')); L.px(10, 5, C('#e0f8c0'))
    return L.outline()

def regenbogenerdbeere():
    w, h = 19, 22; L = Layer(w, h)
    widths = [0, 0, 0, 0, 15, 18, 19, 19, 19, 18, 17, 16, 15, 14, 12, 11, 9, 7, 5, 3, 1, 0]
    bands = ['#f05a5a', '#f8a040', '#f8e050', '#70c860', '#5aa8e8', '#a878e0']
    for y in range(h):
        ww = widths[y]
        for x in range(w):
            if ww and abs(x + .5 - 9.5) <= ww / 2:
                c = C(bands[min(5, max(0, (y - 4) // 3))])
                dx = (x + .5 - 9.5) / 9.5
                if dx > .45: c = tuple(int(v * .8) for v in c[:3]) + (255,)
                elif dx < -.5 and y < 12: c = tuple(min(255, int(v * 1.15)) for v in c[:3]) + (255,)
                L.px(x, y, c)
    for (x, y) in ((4, 7), (9, 7), (14, 8), (6, 10), (12, 11), (9, 13), (6, 15), (11, 16), (8, 18), (13, 14)):
        L.px(x, y, C('#ffffff'))
    for (x, y) in ((4, 3), (5, 4), (6, 4), (7, 3), (8, 2), (9, 2), (10, 2), (11, 3), (12, 4), (13, 4), (14, 3), (9, 3), (9, 4)):
        L.px(x, y, C('#5aa04e'))
    L.vl(9, 0, 2, C('#3e7c3c'))
    return L.outline()

def kleeblatt():
    w, h = 22, 24; L = Layer(w, h)
    L.vl(11, 15, 9, C('#4e8c3c')); L.px(12, 22, C('#4e8c3c')); L.px(12, 23, C('#4e8c3c'))
    for (cx, cy) in ((7.2, 6.6), (14.8, 6.6), (7.2, 13.4), (14.8, 13.4)):
        def f(x, y, cx=cx, cy=cy):
            for (ox, oy) in ((-1.9, 0), (1.9, 0)):
                pass
            a = ellfn(cx - 1.7 * (1 if cx < 11 else -1) * 0, cy, 4.6, 4.4)(x, y)
            return a
        shaded(L, f, ('#c8f0a0', '#78c858', '#58a844', '#3e8434'))
    for (x, y) in ((11, 10), (10, 10), (11, 9), (10, 9)):
        L.px(x, y, C('#3e8434'))
    for (x, y) in ((7, 6), (14, 6), (7, 13), (14, 13)):
        L.px(x, y, C('#f0fff0'))
    return L.outline()

def uhrbluete():
    w, h = 24, 24; L = Layer(w, h)
    for k in range(10):
        a = k * math.pi / 5
        shaded(L, ellfn(12 + math.cos(a) * 7.6, 12 + math.sin(a) * 7.6, 3.4, 3.4), ('#ffffff', '#f8e0f0', '#f0b8d8', '#d090b8'))
    shaded(L, ellfn(12, 12, 6.0, 6.0), ('#ffffff', '#fff8e8', '#f4ead0', '#d8c8a8'))
    for k in range(4):
        a = k * math.pi / 2
        L.px(int(12 + math.cos(a) * 4.4 - .01), int(12 + math.sin(a) * 4.4), C('#8a6a4a'))
    L.vl(11, 8, 4, C('#3a2414')); L.px(12, 11, C('#3a2414')); L.px(13, 11, C('#3a2414')); L.px(14, 11, C('#3a2414'))
    L.px(11, 11, C('#e8463c'))
    return L.outline()

def gluehbeere():
    w, h = 20, 21; L = Layer(w, h)
    for (bx, by) in ((6.5, 13.5), (13.5, 13.5), (10, 7.5)):
        shaded(L, ellfn(bx, by, 5.4, 5.4), ('#ffffe0', '#f8f070', '#d8d038', '#a8a028'))
    for (x, y) in ((5, 11), (12, 11), (9, 5)):
        L.px(x, y, C('#ffffff'))
    L.vl(10, 0, 2, C('#4e8c3c')); L.px(11, 1, C('#6aa84e'))
    return L.outline()

NEW = {
    'pusteblume': (pusteblume, '#f6f6f0', '#a89c6c', 10),
    'kokosnuss': (kokosnuss, '#ffffff', '#f2ece0', 11),
    'kokosstueck': (kokosstueck, '#ffffff', '#f2ece0', 5),
    'wassermelone': (wassermelone, '#f05a5a', '#2e1a0c', 14),
    'regenbogenerdbeere': (regenbogenerdbeere, '#fff0f8', '#ffffff', 9),
    'kleeblatt': (kleeblatt, '#c8f0a0', '#58a844', 10),
    'uhrbluete': (uhrbluete, '#fff8e8', '#f0b8d8', 11),
    'gluehbeere': (gluehbeere, '#ffffc0', '#f8f070', 10),
}
if __name__ == '__main__':
    D = os.path.dirname(os.path.abspath(__file__)); out = {}
    ims = []
    for k, (f, fl, sd, r) in NEW.items():
        L = f(); out[k] = dict(img=uri(L.im), w=L.w, h=L.h, flesh=fl, seed=sd, r=r, weights={}); ims.append(L.im); L.im.save(os.path.join(D, 'obst_' + k + '.png'))
    json.dump(out, open(os.path.join(D, 'neu.json'), 'w'))
    Wd = sum(i.width + 4 for i in ims); Hd = max(i.height for i in ims)
    c = Image.new('RGBA', (Wd, Hd), (150, 200, 130, 255)); x = 0
    for i in ims: c.alpha_composite(i, (x, 0)); x += i.width + 4
    c.resize((Wd * 6, Hd * 6), Image.NEAREST).save(os.path.join(D, 'neu_sheet.png'))
