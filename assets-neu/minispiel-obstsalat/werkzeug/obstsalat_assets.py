"""Graphics for the mini game "Obstsalat" (slice fruit, like Fruit Ninja, cosy):
garden backgrounds for four seasons (180x135), fruit and vegetables (new, larger sprites, 1px outline),
a pine cone as the thing not to cut, a golden apple as bonus, the salad bowl in four fill levels and a big
bowl for the result window, and the hamster faces composed from the game's own layers.
Everything at 1 room px = 1 image px. Output: obstsalat_art.json (PNG data URIs) + PNG sheet."""
import base64, io, json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from PIL import Image
from draw import Layer, P, C, INK, mul

REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SP = os.path.join(REPO, 'quellcode', 'spiel') + os.sep


def hx(c):
    return C(c) if isinstance(c, str) and c.startswith('#') else (P[c] if isinstance(c, str) else c)


def uri(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


# ------------------------------------------------------------------ background
SEASONS = {
    'fruehling': dict(sky=('#a9d4ec', '#bfe0f0', '#d6eef6'), hill='#a6cf90', hedge=('#4e8e46', '#5fa252', '#7cbc68'),
                      crown=('#5c9c4c', '#78b866', '#96cc7e'), dots=('#f4b4c0', '#fff6f8'), meadow=('#86c266', '#9ad07a', '#76b45a'),
                      flowers=('#fff8ec', '#f8d850', '#f0a0b8'), nfl=36),
    'sommer': dict(sky=('#9fcfee', '#b8def2', '#d2ecf8'), hill='#9cc888', hedge=('#447e3e', '#55944a', '#6fae5e'),
                   crown=('#4a8a42', '#5ea050', '#78b866'), dots=('#d84a3c', '#f07060'), meadow=('#7ab858', '#8ec86a', '#6aa84e'),
                   flowers=('#fff8ec', '#f8d850', '#e8705a'), nfl=24),
    'herbst': dict(sky=('#b4d4e6', '#c8e0ec', '#dceaf0'), hill='#b8c888', hedge=('#6a8a3e', '#86a048', '#a8b860'),
                   crown=('#c8702e', '#e0963c', '#f0bc58'), dots=('#b84a2a', '#f4d070'), meadow=('#a8b860', '#bac870', '#94a650'),
                   flowers=('#e0963c', '#c8702e', '#f0bc58'), nfl=30),
    'winter': dict(sky=('#c4d6e2', '#d4e2ea', '#e4eef2'), hill='#e4ecf0', hedge=('#4a6e50', '#5a7e5e', '#f4f8fa'),
                   crown=None, dots=None, meadow=('#eef4f8', '#ffffff', '#d8e4ec'), flowers=(), nfl=0),
}


def background(se):
    s = SEASONS[se]
    rnd = random.Random(7)
    L = Layer(180, 135)
    sky = [hx(c) for c in s['sky']]
    for y in range(0, 96):
        band = 0 if y < 26 else 1 if y < 50 else 2
        for x in range(180):
            c = sky[band]
            if band < 2 and y in (25, 49) and (x + y) % 2 == 0:
                c = sky[band + 1]                     # soft dithered seam
            L.px(x, y, c)
    for cx, cy, w in ((42, 13, 22), (126, 22, 28), (92, 8, 14)):          # calm clouds
        for y in range(cy - 3, cy + 3):
            half = int(w / 2 * math.sqrt(max(0, 1 - ((y - cy + .5) / 3.4) ** 2)))
            for x in range(cx - half, cx + half):
                L.px(x, y, C('#fff8ec') if y < cy + 1 else C('#e8f0f2'))
    for x in range(180):                                                   # distant hills
        top = int(64 + 4 * math.sin(x / 23.0) + 3 * math.sin(x / 9.0 + 1))
        for y in range(top, 96):
            L.px(x, y, hx(s['hill']))
    hd = [hx(c) for c in s['hedge']]
    for x in range(180):                                                   # hedge
        top = int(76 + 2.5 * math.sin(x / 5.0) + 1.5 * math.sin(x / 2.3 + 2))
        for y in range(top, 98):
            c = hd[1]
            if y <= top + 1:
                c = hd[2]
            elif (x * 7 + y * 13) % 11 == 0:
                c = hd[0]
            elif (x * 5 + y * 3) % 17 == 0:
                c = hd[2] if se != 'winter' else hd[1]
            L.px(x, y, c)
    # two fruit trees at the edges, only partly in the picture
    for (tx, cy, r) in ((8, 28, 27), (172, 24, 25)):
        for y in range(cy, 100):
            for x in range(tx - 3, tx + 4):
                L.px(x, y, C('#7a5234') if x < tx + 2 else C('#5e3e26'))
        if s['crown']:
            cr = [hx(c) for c in s['crown']]
            blobs = [(0, -6, 13), (-11, 2, 11), (11, 1, 11), (-5, -16, 10), (7, -15, 10), (0, 8, 10), (-16, -8, 8), (16, -7, 8)]
            for (bx, by, br) in blobs:                          # leaf clusters, back to front, each lit from the top left
                for y in range(cy + by - br, cy + by + br + 1):
                    for x in range(tx + bx - br, tx + bx + br + 1):
                        ddx, ddy = (x + .5 - tx - bx) / br, (y + .5 - cy - by) / br
                        d = ddx * ddx + ddy * ddy
                        if d > 1:
                            continue
                        c = cr[1]
                        if (ddx + .45) ** 2 + (ddy + .5) ** 2 < .35:
                            c = cr[2]
                        elif ddx * .5 + ddy * .85 > .45:
                            c = cr[0]
                        if (x * 7 + y * 5) % 11 == 0 and c != cr[0]:
                            c = cr[0]
                        L.px(x, y, c)
            if s['dots']:
                for _ in range(30):
                    bx, by, br = blobs[rnd.randrange(len(blobs))]
                    a2 = rnd.uniform(0, 2 * math.pi); rr = rnd.uniform(.1, .8) * br
                    x, y = int(tx + bx + math.cos(a2) * rr), int(cy + by + math.sin(a2) * rr)
                    L.px(x, y, hx(s['dots'][0])); L.px(x + 1, y, hx(s['dots'][1]) if se == 'fruehling' else hx(s['dots'][0]))
        else:                                                              # winter: bare branches with snow on top
            for k in range(6):
                a2 = -math.pi / 2 + (k - 2.5) * .5
                length = r * (.85 if k in (2, 3) else .65)
                for t in range(int(length)):
                    bend = math.sin(t / length * 2.2) * 2
                    x, y = int(tx + math.cos(a2) * t + bend), int(cy + 8 + math.sin(a2) * t)
                    L.px(x, y, C('#6a4a30')); L.px(x, y + 1, C('#5e3e26')) if t < 6 else None
                    L.px(x, y - 1, C('#ffffff'))
                    if t > 6 and t % 5 == 0:                               # twigs
                        for u in range(4):
                            L.px(x + u * (1 if k > 2 else -1), y - u, C('#6a4a30')); L.px(x + u * (1 if k > 2 else -1), y - u - 1, C('#ffffff'))
    md = [hx(c) for c in s['meadow']]
    for y in range(98, 135):                                               # meadow, a bit darker in front
        for x in range(180):
            c = md[0]
            if y < 101:
                c = md[1]
            elif (x * 11 + y * 7) % 23 == 0:
                c = md[2]
            elif (x * 3 + y * 5) % 19 == 0 and y > 104:
                c = md[1]
            if y > 122 and (x + y) % 2 == 0 and se != 'winter':
                c = mul(c, .96)
            L.px(x, y, c)
    for _ in range(s['nfl']):
        x, y = rnd.randrange(14, 176), rnd.randrange(101, 133)
        c = hx(rnd.choice(s['flowers']))
        L.px(x, y, c); L.px(x, y + 1, md[2])
    if se == 'herbst':
        for _ in range(26):
            x, y = rnd.randrange(14, 176), rnd.randrange(100, 133)
            L.px(x, y, hx(rnd.choice(('#c8702e', '#e0963c', '#b84a2a')))); L.px(x + 1, y, hx('#e0963c'))
    if se == 'winter':
        for _ in range(40):
            x, y = rnd.randrange(0, 180), rnd.randrange(100, 133)
            L.px(x, y, C('#d0dce6'))
    return L.im


# ------------------------------------------------------------------ fruit
def shaded(L, fn, cols, light=(-.45, -.55)):
    """fill a shape fn(x,y)->(dx,dy) normalised or None with 4 tones: highlight, light, base, shade"""
    hl, li, ba, sh = [hx(c) for c in cols]
    for y in range(L.h):
        for x in range(L.w):
            v = fn(x, y)
            if v is None:
                continue
            dx, dy = v
            d = (dx - light[0]) ** 2 + (dy - light[1]) ** 2
            c = ba
            if d < .09:
                c = hl
            elif d < .55:
                c = li
            elif dx * .6 + dy * .8 > .55:
                c = sh
            L.px(x, y, c)


def ellfn(cx, cy, rx, ry):
    def f(x, y):
        dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
        return (dx, dy) if dx * dx + dy * dy <= 1 else None
    return f


K = 1.5   # fruit is drawn with 1.5x as many pixels as the first draft (more pixels, never scaled)


def apfel(cols=('#f8a090', '#e8584a', '#c83c34', '#962a26'), leaf=True):
    w, h = 22, 23
    L = Layer(w, h)
    cx, cy, rx, ry = w / 2, 13.6, 10.2, 9.4
    def f(x, y):
        dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
        dip = .22 * math.exp(-((x + .5 - cx) / 2.6) ** 2) if dy < -.55 else 0
        return (dx, dy) if dx * dx + dy * dy <= 1 and dy > -1 + dip * 1.5 else None
    shaded(L, f, cols)
    L.vl(10, 1, 5, C('#6a4428')); L.vl(11, 1, 4, C('#5a3820'))
    if leaf:
        for (x, y) in ((13, 3), (14, 3), (15, 2), (16, 2), (14, 2), (15, 1), (16, 1), (17, 1), (13, 4)):
            L.px(x, y, C('#6aa84e'))
        L.px(15, 2, C('#8cc86a')); L.px(16, 1, C('#8cc86a'))
    return L.outline()


def birne():
    w, h = 19, 25
    L = Layer(w, h)
    def f(x, y):
        a = ellfn(9.5, 8, 5.2, 5.6)(x, y); b = ellfn(9.5, 16.5, 8.6, 7.6)(x, y)
        if b:
            return b
        if a:
            return (a[0] * .6, a[1] * .6 - .5)
        if 8 <= y <= 12:
            ww = 4.4 + (y - 8) * .7
            if abs(x + .5 - 9.5) <= ww:
                return ((x + .5 - 9.5) / 9, -.4)
        return None
    shaded(L, f, ('#f4f6b0', '#d8dc60', '#b8c044', '#8a9230'))
    L.vl(9, 0, 3, C('#6a4428')); L.px(10, 0, C('#6a4428'))
    for (x, y) in ((6, 17), (13, 13), (11, 20), (5, 12)):
        L.px(x, y, C('#a8a83c'))
    return L.outline()


def pflaume():
    w, h = 18, 21
    L = Layer(w, h)
    shaded(L, ellfn(9, 11.4, 8.4, 9.4), ('#c8a8e0', '#8a5aac', '#6a3e8c', '#4a2866'))
    for y in range(4, 18):
        L.px(10 if y < 11 else 10, y, C('#58307a'))
    L.px(9, 0, C('#6a4428')); L.px(9, 1, C('#6a4428')); L.px(9, 2, C('#6a4428'))
    for (x, y) in ((5, 6), (6, 5), (4, 8)):
        L.px(x, y, C('#d8c4ec'))
    return L.outline()


def erdbeere():
    w, h = 19, 22
    L = Layer(w, h)
    widths = [0, 0, 0, 0, 15, 18, 19, 19, 19, 18, 17, 16, 15, 14, 12, 11, 9, 7, 5, 3, 1, 0]
    def f(x, y):
        ww = widths[y] if y < len(widths) else 0
        if ww and abs(x + .5 - 9.5) <= ww / 2:
            return ((x + .5 - 9.5) / 9.5, (y - 11) / 10)
        return None
    shaded(L, f, ('#ff9a8a', '#f05a4a', '#d8343a', '#a82430'))
    for (x, y) in ((4, 7), (9, 7), (14, 8), (6, 10), (12, 11), (3, 12), (9, 13), (15, 12), (6, 15), (11, 16), (8, 18), (5, 9), (13, 14)):
        L.px(x, y, C('#f8d850')); L.px(x, y + 1, C('#c8303a'))
    for (x, y) in ((4, 3), (5, 4), (6, 4), (7, 3), (8, 2), (9, 2), (10, 2), (11, 3), (12, 4), (13, 4), (14, 3), (6, 5), (9, 3), (9, 4), (12, 5), (8, 4), (10, 4)):
        L.px(x, y, C('#5aa04e'))
    L.vl(9, 0, 2, C('#3e7c3c'))
    return L.outline()


def tomate():
    w, h = 22, 20
    L = Layer(w, h)
    shaded(L, ellfn(11, 11.6, 10.4, 8.4), ('#ff9a7a', '#f05a3c', '#d8402c', '#a82c22'))
    for (x, y) in ((7, 3), (8, 4), (9, 4), (10, 3), (11, 2), (12, 3), (13, 4), (14, 4), (15, 3), (6, 4), (16, 4), (11, 3), (11, 4), (10, 5), (12, 5)):
        L.px(x, y, C('#5aa04e'))
    L.vl(11, 0, 2, C('#3e7c3c'))
    return L.outline()


def moehre():
    w, h = 13, 29
    L = Layer(w, h)
    def f(x, y):
        if y < 8:
            return None
        ww = max(1, 10 - (y - 8) * .45)
        if abs(x + .5 - 6.5) <= ww / 2:
            return ((x + .5 - 6.5) / 5, (y - 17) / 11)
        return None
    shaded(L, f, ('#ffc890', '#f8963c', '#e8762a', '#b8561e'))
    for y in (12, 16, 20, 24):
        L.px(5, y, C('#c8601e')); L.px(6, y, C('#c8601e')); L.px(7, y - 1, C('#d86a24'))
    for (x, y) in ((3, 1), (4, 2), (4, 3), (5, 4), (6, 0), (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (7, 1), (7, 2), (8, 2), (9, 3), (8, 3), (7, 4), (5, 5), (6, 6), (7, 6), (5, 6)):
        L.px(x, y, C('#5aa04e'))
    L.px(6, 2, C('#8cc86a')); L.px(4, 2, C('#8cc86a'))
    return L.outline()


def kuerbis():
    w, h = 27, 23
    L = Layer(w, h)
    shaded(L, ellfn(13.5, 13.8, 13, 9), ('#ffd08a', '#f8a03c', '#e8822a', '#b85e1e'))
    for x in (7, 13, 20):
        for y in range(6, 22):
            if L.get(x, y)[3]:
                L.px(x, y, C('#c8681e'))
    L.rect(12, 1, 3, 5, C('#6a8a3e')); L.vl(12, 1, 5, C('#8aaa50')); L.px(15, 1, C('#6a8a3e'))
    return L.outline()


def kirschen():
    w, h = 21, 22
    L = Layer(w, h)
    for cx in (5.2, 15.6):
        shaded(L, ellfn(cx, 15.6, 5.2, 5.2), ('#ff8a8a', '#e03c44', '#b82434', '#861826'))
    for t in range(14):
        L.px(int(5 + t * .45), 11 - int(t * .75), C('#6a8a3e'))
        L.px(int(15 - t * .25), 11 - int(t * .75), C('#6a8a3e'))
    for (x, y) in ((9, 0), (10, 0), (11, 1), (12, 1), (13, 1), (12, 0)):
        L.px(x, y, C('#5aa04e'))
    return L.outline()


def zapfen():
    w, h = 16, 22
    L = Layer(w, h)
    shaded(L, ellfn(8, 11, 7.4, 10.4), ('#c8925c', '#a87040', '#8a5630', '#6a4024'))
    for y in range(2, 21):
        for x in range(1, 15):
            if L.get(x, y)[3] and ((x + (y // 2)) % 3 == 0) and y % 2 == 0:
                L.px(x, y, C('#5a361e'))
            if L.get(x, y)[3] and ((x + (y // 2)) % 3 == 1) and y % 2 == 1:
                L.px(x, y, C('#d8a870'))
    return L.outline()


# ---------- bomb equivalent and specials
def stachelkastanie():
    """the bomb: a spiky green chestnut husk, split open a little so the shiny chestnut shows"""
    w, h = 24, 24
    L = Layer(w, h)
    cx = cy = 12
    shaded(L, ellfn(cx, cy, 8.4, 8.4), ('#b8d870', '#8ab848', '#6a9a38', '#4a7a28'))
    for k in range(16):                                   # spines all around
        a = k * math.pi / 8 + .2
        for t in range(9, 12):
            L.px(int(cx + math.cos(a) * t), int(cy + math.sin(a) * t), C('#4a7a28') if t < 11 else C('#86a848'))
    for y in range(5, 20):                                # spines on the surface
        for x in range(5, 20):
            if L.get(x, y)[3] and (x * 3 + y * 5) % 7 == 0:
                L.px(x, y, C('#d8f0a0'))
    for (x, y) in ((10, 9), (11, 8), (12, 8), (13, 9), (14, 10), (10, 10), (11, 9), (12, 9), (13, 10), (11, 10), (12, 10)):
        L.px(x, y, C('#7a3a1e'))                          # chestnut peeking out
    L.px(11, 8, C('#c86a3a')); L.px(12, 8, C('#c86a3a'))
    return L.outline()


def frostbeere():
    """special: frosty blueberries -> slow motion"""
    w, h = 20, 20
    L = Layer(w, h)
    for (bx, by) in ((6.5, 12.5), (13.5, 12.5), (10, 7)):
        shaded(L, ellfn(bx, by, 5.4, 5.4), ('#e8f6ff', '#9cc8f0', '#5a8ad0', '#3a5aa0'))
    for (x, y) in ((4, 9), (9, 4), (14, 10), (8, 14), (12, 6), (16, 14), (3, 13)):
        L.px(x, y, C('#ffffff'))
    for (x, y) in ((6, 12), (13, 12), (10, 7)):
        L.px(x, y, C('#2a3a70')); L.px(x + 1, y, C('#2a3a70'))
    return L.outline()


def sonnenblume():
    """special: sunflower head -> double points"""
    w, h = 24, 24
    L = Layer(w, h)
    for k in range(12):
        a = k * math.pi / 6
        shaded(L, ellfn(12 + math.cos(a) * 7.4, 12 + math.sin(a) * 7.4, 3.2, 3.2), ('#fff2a0', '#f8d040', '#e8b020', '#c08a18'))
    shaded(L, ellfn(12, 12, 6.2, 6.2), ('#a8703a', '#7a4a24', '#5a3418', '#3e2410'))
    for y in range(7, 18):
        for x in range(7, 18):
            if (x + y) % 3 == 0 and ((x + .5 - 12) ** 2 + (y + .5 - 12) ** 2) < 30:
                L.px(x, y, C('#2e1a0c'))
    return L.outline()


def honigwabe():
    """special: a piece of honeycomb with a drip -> fruit rain"""
    w, h = 22, 23
    L = Layer(w, h)
    cells = [(7, 5), (14, 5), (3.5, 11), (10.5, 11), (17.5, 11), (7, 17), (14, 17)]
    for (cx, cy) in cells:
        for y in range(int(cy - 4), int(cy + 4)):
            for x in range(int(cx - 4), int(cx + 4)):
                dx, dy = abs(x + .5 - cx), abs(y + .5 - cy)
                d = max(dx * .87 + dy * .5, dy)               # hexagon distance
                if d <= 3.6:
                    L.px(x, y, C('#c88a28') if d > 2.7 else (C('#fff0a0') if dx + dy < 1.4 and x + .5 < cx else C('#f8c848')))
    for y in range(20, 23):
        L.px(14, y, C('#f0b030'))
    L.px(14, 22, C('#f8d060'))
    return L.outline()


FRUITS = {   # name: (sprite, flesh colour, seed colour, radius for hit tests, weight per season)
    'apfel': (apfel, '#f8ecc0', '#6a4428', 10, dict(fruehling=1, sommer=2, herbst=4, winter=3)),
    'birne': (birne, '#f6f2c8', '#6a4428', 10, dict(fruehling=1, sommer=2, herbst=3, winter=2)),
    'pflaume': (pflaume, '#f0b83c', '#b8862a', 9, dict(fruehling=0, sommer=2, herbst=3, winter=1)),
    'erdbeere': (erdbeere, '#f8c4c0', '#ffffff', 9, dict(fruehling=3, sommer=4, herbst=1, winter=1)),
    'tomate': (tomate, '#f07a5a', '#f8e090', 10, dict(fruehling=1, sommer=4, herbst=2, winter=1)),
    'moehre': (moehre, '#f8b05a', '#ffd08a', 8, dict(fruehling=2, sommer=2, herbst=2, winter=2)),
    'kuerbis': (kuerbis, '#f8c050', '#fff2c0', 12, dict(fruehling=0, sommer=1, herbst=4, winter=1)),
    'kirschen': (kirschen, '#f07070', '#f8e8c0', 10, dict(fruehling=2, sommer=3, herbst=0, winter=0)),
}
GOLD = (lambda: apfel(('#fff6c0', '#f8d850', '#e0b030', '#a87c20'), leaf=True), '#fff2b0', '#c89a3a', 10)
CONE = (zapfen, '#d8a870', '#6a4024', 9)
SPECIAL = {
    'kastanie': (stachelkastanie, '#f4e4c0', '#7a3a1e', 11),
    'frostbeere': (frostbeere, '#d8ecff', '#ffffff', 10),
    'sonnenblume': (sonnenblume, '#f8e080', '#5a3418', 11),
    'honigwabe': (honigwabe, '#fff0a0', '#f0b030', 10),
}


# ------------------------------------------------------------------ bowl
def schuessel(fill=0, w=34, h=13):
    """wooden salad bowl, front view, with a heap of fruit pieces growing with `fill` (0..3)"""
    L = Layer(w, h + 9)
    top = 9
    heap_cols = ['#e8584a', '#f8ecc0', '#d8dc60', '#8a5aac', '#f05a4a', '#f8963c', '#f8d850', '#5aa04e']
    rnd = random.Random(3)
    if fill:
        hh = [0, 3, 6, 9][fill]
        for x in range(3, w - 3):
            dx = (x + .5 - w / 2) / (w / 2 - 3)
            col_h = int(hh * math.sqrt(max(0, 1 - dx * dx)))
            for y in range(top - col_h, top + 1):
                L.px(x, y, C(heap_cols[(x // 2 + y) % len(heap_cols)]) if (x + y) % 3 else C(rnd.choice(heap_cols)))
    for y in range(top, top + h):
        t = (y - top) / (h - 1)
        half = (w / 2) * math.sqrt(max(0, 1 - t ** 2.2))
        for x in range(w):
            if abs(x + .5 - w / 2) <= half:
                c = C('#b8844e') if x + .5 < w / 2 - half * .4 else C('#9a6634')
                if y == top:
                    c = C('#d8a868')
                elif y == top + 1:
                    c = C('#7a4a24')
                elif (y - top) % 4 == 3:
                    c = mul(c, .9)
                L.px(x, y, c)
    return L.outline()


def schuessel_gross():
    """the big bowl for the result window: drawn anew with more pixels, never scaled"""
    w, h = 64, 22
    L = Layer(w, h + 20)
    top = 18
    rnd = random.Random(11)
    pieces = [('#e8584a', '#f8ecc0'), ('#d8dc60', '#f6f2c8'), ('#8a5aac', '#f0b83c'), ('#f05a4a', '#f8c4c0'), ('#f8963c', '#f8b05a'), ('#e03c44', '#f07070')]
    for x in range(4, w - 4):
        dx = (x + .5 - w / 2) / (w / 2 - 4)
        col_h = int(17 * math.sqrt(max(0, 1 - dx * dx)))
        for y in range(top - col_h, top + 1):
            L.px(x, y, C('#f8ecc0'))
    for _ in range(70):                                  # fruit pieces: little wedges with skin and flesh
        x = rnd.randrange(6, w - 9); dx = (x + 1 - w / 2) / (w / 2 - 4)
        hmax = int(17 * math.sqrt(max(0, 1 - dx * dx)))
        if hmax < 2:
            continue
        y = top - rnd.randrange(0, hmax)
        sk, fl = C(rnd.choice(pieces)[0]), None
        fl = C([p[1] for p in pieces if C(p[0]) == sk][0])
        L.rect(x, y, 3, 2, fl); L.hl(x, y + 1, 3, sk); L.px(x, y, sk)
    for (x, y) in ((28, 1), (29, 1), (30, 2), (29, 2), (27, 2)):     # a mint leaf on top
        L.px(x, y, C('#5aa04e'))
    for y in range(top, top + h):
        t = (y - top) / (h - 1)
        half = (w / 2) * math.sqrt(max(0, 1 - t ** 2.2))
        for x in range(w):
            if abs(x + .5 - w / 2) <= half:
                c = C('#c8925a') if x + .5 < w / 2 - half * .35 else C('#a87040')
                if y == top:
                    c = C('#e0b478')
                elif y == top + 1:
                    c = C('#7a4a24')
                elif (y - top) % 5 == 4:
                    c = mul(c, .9)
                L.px(x, y, c)
    return L.outline()


# ------------------------------------------------------------------ hamster (from the game's own layers)
def hamster_faces():
    import re
    from px_lite import render
    H = json.load(open(SP + 'ham2.json')); a = H['art']; s = H['size']
    def r(k):
        w, h = s[k]; return render(a[k], w, h)
    faces = {'normal': ['body', 'ears_up', 'eyes_open', 'mouth_smile', 'nose', 'whisk0', 'paws_down'],
             'froh': ['body', 'ears_up', 'eyes_happy', 'mouth_grin', 'nose', 'whisk0', 'paws_down', 'blush'],
             'schreck': ['body', 'ears_flat', 'eyes_wide', 'mouth_open', 'nose', 'whisk1', 'paws_down'],
             'blinzeln': ['body', 'ears_up', 'eyes_sleep', 'mouth_smile', 'nose', 'whisk0', 'paws_down']}
    out = {}
    for n, ls in faces.items():
        im = Image.new('RGBA', (48, 46))
        for k in ls:
            im.alpha_composite(r(k))
        out[n] = im
    return out


def build(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    art = {'bg': {}, 'fruit': {}, 'bowl': [], 'ham': {}}
    for se in SEASONS:
        im = background(se); art['bg'][se] = uri(im); im.save(os.path.join(out_dir, 'bg_%s.png' % se))
    for name, (f, flesh, seed, r, weights) in FRUITS.items():
        L = f(); art['fruit'][name] = dict(img=uri(L.im), w=L.w, h=L.h, flesh=flesh, seed=seed, r=r, weights=weights)
        L.im.save(os.path.join(out_dir, 'obst_%s.png' % name))
    for name, (f, flesh, seed, r) in [('goldapfel', GOLD), ('zapfen', CONE)] + list(SPECIAL.items()):
        L = f(); art['fruit'][name] = dict(img=uri(L.im), w=L.w, h=L.h, flesh=flesh, seed=seed, r=r, weights={})
        L.im.save(os.path.join(out_dir, 'obst_%s.png' % name))
    for k in range(4):
        L = schuessel(k); art['bowl'].append(dict(img=uri(L.im), w=L.w, h=L.h)); L.im.save(os.path.join(out_dir, 'schuessel_%d.png' % k))
    L = schuessel_gross(); art['bowl_big'] = dict(img=uri(L.im), w=L.w, h=L.h); L.im.save(os.path.join(out_dir, 'schuessel_gross.png'))
    for n, im in hamster_faces().items():
        art['ham'][n] = uri(im); im.save(os.path.join(out_dir, 'hamster_%s.png' % n))
    json.dump(art, open(os.path.join(out_dir, 'obstsalat_art.json'), 'w'))
    return art


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'grafik'))
