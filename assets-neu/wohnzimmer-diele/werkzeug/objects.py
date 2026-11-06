"""The new pieces for hallway, divider and music corner. Every function returns an outlined Layer
(1 room px = 1 image px). Sizes are given without the outline."""
import math
from draw import Layer, P, C, INK, mul

# ------------------------------------------------------------------ hallway
DOOR_COLORS = {
    'gruen': ('g1', 'g2', 'g3'),
    'blau': ('u2', 'u3', 'u4'),
    'rot': ('r1', 'r2', 'r3'),
    'holz': ('wd2', 'wd3', 'wd4'),
}


def haustuer(color='gruen', frame='c3', window='bogen'):
    """front door, 30x53 (+outline). Painted leaf, glass window up top, two panels, brass knob and letter slot."""
    d, m, l = DOOR_COLORS[color]
    w, h = 30, 53
    L = Layer(w, h)
    # lintel (wooden like the terrace door) and frame
    L.rect(0, 0, w, 3, 'wd3'); L.hl(0, 0, w, 'wd4'); L.hl(0, 2, w, 'wd2')
    L.rect(0, 3, 3, h - 3, frame); L.rect(w - 3, 3, 3, h - 3, frame)
    L.vl(2, 3, h - 3, 'c2'); L.vl(w - 3, 3, h - 3, 'c2')
    for y in range(7, h - 2, 8):            # little nail dots in the frame like on the terrace door
        L.px(1, y, 'c1'); L.px(w - 2, y, 'c1')
    # leaf
    x0, y0, x1, y1 = 3, 3, w - 3, h       # leaf spans x0..x1-1
    L.rect(x0, y0, x1 - x0, y1 - y0, m)
    L.vl(x0, y0, y1 - y0, INK); L.vl(x1 - 1, y0, y1 - y0, INK); L.hl(x0, y0, x1 - x0, INK)
    L.vl(x0 + 1, y0 + 1, y1 - y0 - 1, l)   # light edge left
    L.vl(x1 - 2, y0 + 1, y1 - y0 - 1, d)   # shade edge right
    # window
    wx0, wx1, wy0, wy1 = 8, 22, 7, 21
    cx = (wx0 + wx1) / 2
    for y in range(wy0, wy1):
        for x in range(wx0, wx1):
            if window == 'bogen' and y < wy0 + 5:
                dx = (x + .5 - cx) / ((wx1 - wx0) / 2); dy = (wy0 + 5 - y - .5) / 5
                if dx * dx + dy * dy > 1:
                    continue
            L.px(x, y, INK)
    for y in range(wy0 + 1, wy1 - 1):
        for x in range(wx0 + 1, wx1 - 1):
            if window == 'bogen' and y < wy0 + 6:
                dx = (x + .5 - cx) / ((wx1 - wx0) / 2 - 1); dy = (wy0 + 6 - y - .5) / 5
                if dx * dx + dy * dy > 1:
                    continue
            # sky, then the tops of the garden trees
            L.px(x, y, 'sky' if y < wy0 + 8 else ('g4' if y < wy0 + 10 else 'g3'))
    for y in range(wy0 + 1, wy1 - 1):       # glazing bars
        L.px(int(cx) - 1, y, INK); L.px(int(cx), y, m)
    L.hl(wx0 + 1, wy0 + 8, wx1 - wx0 - 2, INK)
    L.px(wx0 + 2, wy0 + 4, 'c4'); L.px(int(cx) + 2, wy0 + 3, 'c4'); L.px(wx0 + 2, wy0 + 10, 'c4'); L.px(int(cx) + 2, wy0 + 10, 'c4')
    # sill under the window
    L.hl(wx0 - 1, wy1, wx1 - wx0 + 2, d)
    # letter slot
    L.rect(10, 25, 10, 2, 'br2'); L.hl(10, 25, 10, 'br3'); L.hl(11, 26, 8, 'br1')
    # two panels
    for py0, py1 in ((29, 38), (41, 50)):
        L.hl(7, py0, 16, d); L.vl(7, py0, py1 - py0, d)
        L.hl(8, py1 - 1, 15, l); L.vl(22, py0 + 1, py1 - py0 - 1, l)
    # brass knob + keyhole
    L.rect(22, 33, 2, 2, 'br3'); L.px(22, 33, 'br4'); L.px(23, 34, 'br1'); L.px(22, 36, 'k1')
    # threshold
    L.hl(0, h - 1, w, 'c1')
    return L.outline()


def fussmatte(w=28, kind='kokos'):
    """doormat lying on the floor in front of the door (flat strip, 4 rows)"""
    L = Layer(w, 4)
    if kind == 'kokos':
        L.rect(0, 0, w, 4, 'y1'); L.hl(0, 0, w, 'bw4')
        for x in range(1, w - 1, 3):
            L.px(x, 2, 'bw3')
        L.hl(0, 3, w, 'bw3')
    else:  # rag rug, striped
        cols = ['pk2', 'c3', 'mint2', 'c3', 'u4', 'c3']
        for x in range(w):
            L.vl(x, 0, 4, cols[(x // 2) % len(cols)])
    return L.outline()


def laeufer(w=60, base='r3', edge='y2'):
    """long runner rug on the hallway floor (flat, 6 rows)"""
    L = Layer(w, 6)
    L.rect(0, 0, w, 6, base)
    L.hl(0, 1, w, edge); L.hl(0, 4, w, edge)
    for x in range(3, w - 3, 6):
        L.px(x, 2, edge); L.px(x + 1, 3, edge); L.px(x + 2, 2, edge)
    for x in range(0, w, 2):                  # fringe at both ends handled by outline gaps
        pass
    L.hl(0, 0, w, mul(P[base], 1.1)); L.hl(0, 5, w, mul(P[base], .8))
    return L.outline()


def hakenleiste(w=26, n=3):
    """wall board with brass hooks; returns layer and hook x positions (relative, incl. outline)"""
    L = Layer(w, 6)
    L.rect(0, 0, w, 4, 'bw3'); L.hl(0, 0, w, 'bw4'); L.hl(0, 3, w, 'bw2')
    L.px(1, 1, 'bw1'); L.px(w - 2, 1, 'bw1')
    hooks = [int(4 + i * (w - 8) / (n - 1)) for i in range(n)]
    for x in hooks:
        L.px(x, 4, 'br2'); L.px(x, 5, 'br3'); L.px(x + 1, 5, 'br3')
    o = L.outline()
    return o, [x + 1 for x in hooks]


def mantel(c=('o1', 'o2', 'o3'), h=28):
    """coat hanging from a hook (11 wide at the hem)"""
    d, m, l = c
    L = Layer(11, h)
    for y in range(h):
        hw = 2 if y < 3 else min(5, 2 + (y - 1) // 3)
        cxl = 5 - hw; cxr = 5 + hw
        L.rect(cxl, y, cxr - cxl + 1, 1, m)
        L.px(cxl, y, l); L.px(cxr, y, d)
    # collar
    L.px(3, 3, l); L.px(4, 4, l); L.px(7, 3, d); L.px(6, 4, d); L.px(5, 2, d); L.px(5, 3, d)
    # front edge + buttons
    for y in range(5, h):
        L.px(5, y, d)
    for y in range(7, h - 2, 5):
        L.px(6, y, 'br3')
    # pocket and belt
    L.hl(2, 18, 3, d); L.hl(1, 13, 9, d); L.px(5, 13, 'br3')
    # sleeve hint
    L.vl(1, 9, 10, d)
    L.hl(0, h - 1, 11, d)
    return L.outline()


def schal(c1='r3', c2='c3', h=22):
    """striped scarf hanging over a hook: two tails with fringe"""
    L = Layer(6, h)
    for y in range(h - 2):
        col = c1 if (y // 3) % 2 == 0 else c2
        L.rect(0, y, 2, 1, col)
        if y > 1:
            L.rect(3, y - 2 + 4 if False else y, 3, 1, col)
    L.rect(0, 0, 6, 2, c1)
    L.px(2, 2, mul(P[c1], .8))
    for x in (0, 1, 3, 5):                    # fringe
        L.px(x, h - 2, c2); L.px(x, h - 1, c2)
    L.vl(3, 2, h - 4, mul(P[c1], .8) if True else None)
    return L.outline()


def hut(kind='stroh'):
    """hat hanging on a hook"""
    if kind == 'stroh':
        L = Layer(13, 6)
        L.rect(3, 0, 7, 4, 'y2'); L.hl(3, 0, 7, 'y3'); L.hl(3, 3, 7, 'r3'); L.px(4, 1, 'y3')
        L.rect(0, 4, 13, 2, 'y1'); L.hl(1, 4, 11, 'y2')
    else:  # dark felt hat
        L = Layer(12, 6)
        L.rect(3, 0, 6, 4, 'k3'); L.hl(3, 0, 6, 'k4'); L.hl(3, 3, 6, 'r2')
        L.rect(0, 4, 12, 2, 'k2'); L.hl(1, 4, 10, 'k3')
    return L.outline()


def tasche(c=('wd1', 'wd2', 'wd3')):
    """little satchel hanging by its strap"""
    d, m, l = c
    L = Layer(9, 16)
    L.vl(2, 0, 7, m); L.vl(6, 0, 7, m); L.hl(3, 0, 3, m)
    L.rect(0, 7, 9, 9, m); L.hl(0, 7, 9, l); L.vl(0, 7, 9, l); L.vl(8, 8, 8, d); L.hl(0, 15, 9, d)
    L.rect(0, 7, 9, 4, d); L.hl(0, 7, 9, m); L.px(4, 11, 'br3'); L.px(4, 10, 'br2')
    return L.outline()


def bank(w=26, cushion=('r2', 'r3', 'r4'), boots=True):
    """shoe bench with cushion and rubber boots on the lower shelf; 14 high"""
    d, m, l = cushion
    L = Layer(w, 15)
    L.rect(1, 0, w - 2, 3, m); L.hl(1, 0, w - 2, l)
    for x in range(3, w - 3, 4):
        L.px(x, 1, d)
    L.rect(0, 3, w, 2, 'bw3'); L.hl(0, 3, w, 'bw4'); L.hl(0, 4, w, 'bw2')
    L.rect(1, 5, 2, 10, 'bw2'); L.rect(w - 3, 5, 2, 10, 'bw2'); L.vl(1, 5, 10, 'bw3'); L.vl(w - 3, 5, 10, 'bw3')
    L.rect(1, 12, w - 2, 1, 'bw2')
    o = L.outline()
    if boots:
        b = gummistiefel()
        o.paste(b, 6, 6); o.paste(b, 11, 6)
        s = schuhe()
        o.paste(s, w - 10, 10)
    return o


def gummistiefel(c=('y1', 'y2', 'y3')):
    d, m, l = c
    L = Layer(4, 7)
    L.rect(0, 0, 3, 5, m); L.vl(0, 0, 5, l); L.vl(2, 1, 4, d)
    L.rect(0, 5, 4, 2, m); L.hl(0, 6, 4, d); L.px(3, 5, m)
    L.hl(0, 0, 3, l)
    return L.outline()


def schuhe():
    L = Layer(7, 2)
    L.rect(0, 0, 3, 2, 'wd2'); L.rect(4, 0, 3, 2, 'wd2'); L.px(0, 0, 'wd3'); L.px(4, 0, 'wd3')
    return L.outline()


def schirmstaender(c=('u2', 'u3', 'u4')):
    """umbrella stand with two closed umbrellas (one red, one green), 9x24"""
    d, m, l = c
    L = Layer(10, 24)
    # umbrellas first (behind the rim)
    # red umbrella: crook handle up top
    L.px(2, 0, 'wd2'); L.px(3, 0, 'wd2'); L.px(1, 1, 'wd2'); L.px(1, 2, 'wd2'); L.px(2, 3, 'wd2')
    L.vl(3, 1, 3, 'wd2')
    for y in range(4, 12):
        hw = 1 if y < 6 else 2
        L.rect(3 - hw + 1, y, hw * 2 - 1 if hw > 1 else 1, 1, 'r3')
    L.vl(3, 6, 6, 'r2'); L.px(2, 6, 'r4')
    # green umbrella: straight handle with knob
    L.rect(6, 2, 2, 2, 'wd3'); L.vl(7, 4, 2, 'k3')
    for y in range(6, 12):
        L.rect(6, y, 3, 1, 'g3')
    L.vl(8, 6, 6, 'g2'); L.px(6, 7, 'g4')
    # pot
    L.rect(0, 11, 10, 13, m)
    L.hl(0, 11, 10, l); L.hl(0, 12, 10, d)
    L.vl(0, 12, 12, l); L.vl(9, 12, 12, d)
    for y in (15, 19):
        L.hl(1, y, 8, 'c3')
    L.px(2, 17, 'c3'); L.px(5, 17, 'c3'); L.px(8, 17, 'c3')
    L.hl(0, 23, 10, d)
    return L.outline()


def spiegel(w=14, h=20, frame=('wd2', 'wd3', 'wd4')):
    """oval wall mirror with wooden frame"""
    d, m, l = frame
    L = Layer(w, h)
    cx, cy, rx, ry = w / 2, h / 2, w / 2, h / 2

    def f(x, y, dx, dy):
        r = dx * dx + dy * dy
        if r > .62:
            return l if (dx < -.2 and dy < 0) else (d if (dx > .2 and dy > 0) else m)
        if r > .55:
            return d
        # glass: soft gradient and a diagonal shine
        if abs((dx + dy) + .45) < .12 or abs((dx + dy) + .05) < .06:
            return 'gl3'
        return 'gl2' if dy < .25 else 'gl1'
    L.ell(cx, cy, rx, ry, None, f)
    return L.outline()


def kommode(w=32, h=22, wood=('wd1', 'wd2', 'wd3', 'wd4')):
    """little chest of drawers with brass knobs"""
    dd, d, m, l = wood
    L = Layer(w, h)
    L.rect(0, 0, w, 3, m); L.hl(0, 0, w, l); L.hl(0, 2, w, d)
    L.rect(1, 3, w - 2, h - 6, d)
    for i, (y0, y1) in enumerate(((4, 10), (11, 17))):
        L.rect(2, y0, w - 4, y1 - y0, m); L.hl(2, y0, w - 4, l); L.hl(2, y1 - 1, w - 4, dd)
        for kx in (w // 3, 2 * w // 3):
            L.px(kx, (y0 + y1) // 2 - 1, 'br3'); L.px(kx, (y0 + y1) // 2, 'br1')
    L.rect(1, h - 3, w - 2, 1, dd)
    L.rect(1, h - 2, 3, 2, d); L.rect(w - 4, h - 2, 3, 2, d)
    return L.outline()


def schale_schluessel():
    """blue bowl with a key ring"""
    L = Layer(9, 4)
    L.px(3, 0, 'br3'); L.px(4, 0, 'br2'); L.px(5, 0, 'br3')
    L.rect(0, 1, 9, 2, 'u3'); L.hl(0, 1, 9, 'u4'); L.rect(1, 3, 7, 1, 'u2')
    return L.outline()


def vase_blumen(flower=('y2', 'y3'), vase=('c2', 'c3')):
    """small vase with three tulips"""
    L = Layer(9, 14)
    for x, top in ((1, 2), (4, 0), (7, 3)):
        L.vl(x + 0, top + 3, 8 - top, 'g2')
        L.rect(x - 1 if x > 0 else 0, top, 2, 3, flower[0]); L.px(x, top, flower[1])
    L.px(2, 7, 'g3'); L.px(6, 8, 'g3')
    L.rect(2, 9, 5, 5, vase[1]); L.vl(6, 10, 4, vase[0]); L.hl(2, 13, 5, vase[0])
    return L.outline()


def garderobenstaender(h=62, wood=('wd1', 'wd2', 'wd3')):
    """free-standing coat stand: pole, four hooks, three feet; hat, scarf and coat on it"""
    d, m, l = wood
    w = 21
    L = Layer(w, h)
    cx = w // 2
    L.rect(cx - 1, 2, 2, h - 6, m); L.vl(cx - 1, 2, h - 6, l)
    L.rect(cx - 1, 0, 2, 2, l)
    # hooks
    for y, s in ((6, -1), (6, 1), (12, -1), (12, 1)):
        for k in range(4):
            L.px(cx + s * (1 + k), y + (k // 2), m)
        L.px(cx + s * 5, y + 1, m); L.px(cx + s * 5, y, m)
    # feet
    for k in range(6):
        L.px(cx - 2 - k, h - 4 + k // 2, m); L.px(cx + 1 + k, h - 4 + k // 2, m)
    L.rect(cx - 1, h - 4, 2, 3, d)
    o = L.outline()
    o.paste(hut('filz'), cx - 6 + 1, 0)
    o.paste(mantel(('u1', 'u2', 'u3'), 30), cx + 1, 12)
    o.paste(schal('r3', 'c3', 20), cx - 7, 12)
    return o


def wandlampe(on=True):
    """small brass wall sconce with a fabric shade"""
    L = Layer(9, 12)
    L.rect(1, 0, 7, 5, 'y3' if on else 'c2'); L.hl(1, 0, 7, 'c3'); L.hl(0, 4, 9, 'y2' if on else 'c1')
    L.px(2, 1, 'c4')
    L.vl(4, 5, 4, 'br2'); L.rect(3, 9, 3, 3, 'br2'); L.px(3, 9, 'br3')
    return L.outline()


def bild(w=14, h=11, motiv='berg'):
    """small framed picture"""
    L = Layer(w, h)
    L.frame(0, 0, w, h, 'wd3'); L.frame(1, 1, w - 2, h - 2, 'wd2')
    for y in range(2, h - 2):
        for x in range(2, w - 2):
            L.px(x, y, 'sky' if y < h // 2 else 'g4')
    if motiv == 'berg':
        for x in range(2, w - 2):
            top = abs(x - w * .4) * 1.1 + 3
            for y in range(int(top), h - 2):
                L.px(x, y, 'u4' if y < h - 4 else 'g3')
        L.px(int(w * .4), 3, 'c4'); L.px(int(w * .4) - 1, 4, 'c4'); L.px(int(w * .4) + 1, 4, 'c4')
    else:  # flower
        L.rect(2, h - 4, w - 4, 2, 'g3')
        L.vl(w // 2, 4, h - 6, 'g2'); L.rect(w // 2 - 1, 3, 3, 2, 'r3'); L.px(w // 2, 3, 'y2')
    return L.outline()


def schluesselbrett():
    """little wooden key board with two keys"""
    L = Layer(12, 8)
    L.rect(0, 0, 12, 3, 'bw3'); L.hl(0, 0, 12, 'bw4'); L.hl(0, 2, 12, 'bw2')
    for x in (3, 8):
        L.px(x, 3, 'br2'); L.vl(x, 4, 2, 'br3'); L.rect(x - 1, 6, 3, 2, 'br3'); L.px(x, 6, 'br1')
    return L.outline()


# ------------------------------------------------------------------ dividers (full height = 100 rows to the floor)
def pfosten(h=100):
    """wooden post at the junction, with two braces under the ceiling"""
    w = 26
    L = Layer(w, h)
    cx0 = 10
    L.rect(cx0, 0, 6, h - 3, 'wd2'); L.vl(cx0, 0, h - 3, 'wd3'); L.vl(cx0 + 5, 0, h - 3, 'wd1')
    for y in range(8, h - 6, 11):        # wood grain
        L.vl(cx0 + 2, y, 4, 'wd1'); L.vl(cx0 + 3, y + 5, 3, 'wd3')
    # braces (Kopfbänder), 3 thick, 45 degrees
    for k in range(10):
        for t in range(3):
            L.px(cx0 - 1 - k, 10 - k + t, 'wd2' if t else 'wd3')
            L.px(cx0 + 6 + k, 10 - k + t, 'wd2' if t else 'wd3')
    L.rect(0, 0, w, 2, 'wd2'); L.hl(0, 0, w, 'wd3')   # beam under the ceiling
    # plinth
    L.rect(cx0 - 1, h - 3, 8, 3, 'wd1'); L.hl(cx0 - 1, h - 3, 8, 'wd2')
    return L.outline(), cx0


def halbwand(h=42):
    """end of a low half-wall: panelled wooden post with a wooden cap and a trailing ivy pot on top"""
    w = 10
    L = Layer(w + 2, h)
    L.rect(1, 3, w, h - 3, 'bw3'); L.vl(1, 3, h - 3, 'bw4'); L.vl(w, 3, h - 3, 'bw2')
    for y in range(8, h - 6, 9):
        L.hl(2, y, w - 2, 'bw2'); L.hl(2, y + 1, w - 2, 'bw4')
    L.rect(1, h - 4, w, 4, 'bw2'); L.hl(1, h - 4, w, 'bw1')
    L.rect(0, 0, w + 2, 3, 'wd3'); L.hl(0, 0, w + 2, 'wd4'); L.hl(0, 2, w + 2, 'wd2')
    o = L.outline()
    pot = efeutopf()
    top = 9                                   # the pot's base rests on the cap, the ivy hangs down in front
    full = Layer(o.w + 6, o.h + top)
    full.paste(o, 3, top)
    full.paste(pot, (full.w - pot.w) // 2, 0)
    return full


def efeutopf():
    """terracotta pot with ivy trailing over the edge"""
    L = Layer(14, 18)
    for x, y in ((2, 0), (5, 1), (9, 0), (11, 2), (1, 3), (7, 2)):
        L.rect(x, y, 2, 2, 'g3'); L.px(x, y, 'g4')
    L.rect(3, 3, 8, 5, 'o2'); L.hl(2, 3, 10, 'o3'); L.vl(10, 4, 4, 'o1')
    for x, ln in ((2, 9), (11, 12), (5, 5)):
        for y in range(5, 5 + ln):
            L.px(x + (1 if (y // 3) % 2 else 0), y, 'g2' if y % 3 else 'g3')
    return L.outline()


def portiere(h=100, c=('g1', 'g2', 'g3'), side='rechts'):
    """velvet door curtain on a brass rod, swept to one side and tied back with a gold tassel"""
    d, m, l = c
    w = 18
    L = Layer(w, h)
    tie = 60
    for y in range(6, h):
        if y < tie:                     # from the full rod width, swept towards the tie
            t = (y - 6) / (tie - 6)
            x0 = int(round(1 + t * 8)); x1 = w - 1
        else:
            t = min(1, (y - tie) / 26)
            x0 = int(round(9 - t * 4)); x1 = w - 1
        for x in range(x0, x1):
            k = (x - x0) * 4 // max(1, (x1 - x0)) if False else (x - x0) % 3
            L.px(x, y, l if k == 0 else (m if k == 1 else d))
        L.px(x0, y, l)
    # gathered heading under the rod
    for x in range(1, w - 1):
        L.px(x, 5, m if x % 2 else d); L.px(x, 6, l if x % 2 else m)
    L.hl(0, 3, w, 'br2'); L.hl(0, 4, w, 'br3'); L.rect(0, 2, 1, 4, 'br3'); L.rect(w - 1, 2, 1, 4, 'br3')
    for x in range(2, w - 1, 3):
        L.px(x, 5, 'br3')
    # hem
    L.hl(5, h - 1, w - 6, d)
    # tie + tassel
    L.hl(8, tie, w - 9, 'br3'); L.hl(8, tie + 1, w - 9, 'br2')
    L.vl(9, tie + 2, 3, 'br2'); L.rect(8, tie + 5, 3, 4, 'br3'); L.px(8, tie + 5, 'br4'); L.hl(8, tie + 9, 3, 'br2')
    o = L.outline()
    if side == 'links':
        o.im = o.im.transpose(0); o.p = o.im.load()
    return o


def raumteiler(h=60):
    """slim open shelf as a divider: books, a jar, a plant"""
    w = 14
    L = Layer(w, h)
    L.rect(0, 0, w, h, 'bw2'); L.rect(2, 2, w - 4, h - 4, 'wd1')
    L.vl(0, 0, h, 'bw3'); L.hl(0, 0, w, 'bw4')
    shelves = [16, 30, 44]
    for y in shelves:
        L.rect(0, y, w, 2, 'bw3'); L.hl(0, y, w, 'bw4')
    L.rect(0, h - 3, w, 3, 'bw2')
    o = L.outline()
    # books on the 2nd compartment
    cols = ['r3', 'u3', 'y2', 'g3', 'lav2']
    for i, cc in enumerate(cols[:4]):
        o.rect(3 + i * 2, 21 - (i % 2), 2, 10 + (i % 2), cc); o.px(3 + i * 2, 21 - (i % 2), mul(P[cc], 1.15))
    # jar
    o.rect(4, 37, 6, 7, 'gl2'); o.hl(4, 37, 6, 'br2'); o.px(5, 39, 'gl3'); o.rect(5, 41, 4, 2, 'o3')
    # little plant in top compartment
    o.rect(5, 12, 5, 5, 'o2'); o.hl(4, 12, 7, 'o3')
    for x, y in ((4, 9), (7, 7), (9, 10), (6, 10)):
        o.rect(x, y, 2, 2, 'g3'); o.px(x, y, 'g4')
    # records leaning in the bottom
    o.rect(3, 50, 8, 8, 'k2'); o.rect(4, 49, 6, 9, 'pk2'); o.rect(5, 52, 3, 3, 'c3')
    return o


# ------------------------------------------------------------------ music corner
def horn(style='messing', r=9, neck_len=13):
    """a gramophone horn: big bell opening towards the viewer (upper right) and a tapering neck down-left.
    returns (layer, (x, y) of the neck end in the layer)"""
    pal = {
        'messing': ('br1', 'br2', 'br3', 'br4', 'wd1'),
        'holz': ('wd1', 'wd2', 'wd3', 'wd4', 'wd0'),
        'blau': ('u1', 'u2', 'u3', 'u5', 'u1'),
        'gruen': ('g1', 'g2', 'g3', 'g4', 'g1'),
    }[style]
    dd, d, m, l, throat = pal
    W = r * 2 + neck_len + 2
    Hh = r * 2 + neck_len + 2
    L = Layer(W, Hh)
    cx, cy = W - r - 1, r + 1
    nx0, ny0 = cx - r * .45, cy + r * .45
    ex, ey = 2, Hh - 3
    steps = 40
    for i in range(steps + 1):
        t = i / steps
        x = nx0 + (ex - nx0) * t
        y = ny0 + (ey - ny0) * t + math.sin(t * math.pi) * 2.5
        wdt = 3.2 - 1.6 * t
        for yy in range(int(y - wdt / 2), int(y + wdt / 2) + 1):
            for xx in range(int(x - wdt / 2), int(x + wdt / 2) + 1):
                if L.get(xx, yy)[3] == 0:
                    L.px(xx, yy, l if yy < y - wdt / 4 else (m if yy < y + wdt / 4 else d))
    flower = style in ('blau', 'gruen')
    wood = style == 'holz'

    def f(x, y, dx, dy):
        rr = math.sqrt(dx * dx + dy * dy)
        ang = math.atan2(dy, dx)
        if flower:                                    # scalloped rim like a morning glory
            edge = .93 + .07 * math.cos(ang * 5)
            if rr > edge:
                return None
            if rr > edge - .14:
                return 'c4' if dy < -.3 and dx < 0 else l
        else:
            if rr > .82:
                return l if dy < .15 else m
            if rr > .74:
                return d
        tdx, tdy = dx + .28, dy - .28
        tr = math.sqrt(tdx * tdx + tdy * tdy)
        if tr < .18:
            return throat
        if tr < .38:
            return dd
        if wood and abs(math.sin(ang * 5)) < .12 and tr > .45:   # the staves of a wooden horn
            return d
        return d if tr < .6 else m
    for yy in range(int(cy - r) - 1, int(cy + r) + 2):
        for xx in range(int(cx - r) - 1, int(cx + r) + 2):
            dx = (xx + .5 - cx) / r; dy = (yy + .5 - cy) / r
            if dx * dx + dy * dy <= 1:
                c = f(xx, yy, dx, dy)
                if c:
                    L.px(xx, yy, c)
    L.px(int(cx - r * .5), int(cy - r * .72), 'c4' if style == 'messing' else l)
    return L.outline(), (ex + 1, ey + 1)


KURBEL = ["k..", "kbk", ".bk", ".bw", "..w"]


def grammophon(style='messing', box=('wd1', 'wd2', 'wd3', 'wd4'), r=9):
    """gramophone: wooden box with a brass rim, record, crank and horn. Base 18 wide."""
    dd, d, m, l = box
    hl_, (nx, ny) = horn(style, r)
    bw, bh = 18, 8
    W = max(hl_.w, bw + 6) + 2
    Hh = hl_.h + bh + 2
    out = Layer(W + 4, Hh)
    B = Layer(bw, bh)
    B.rect(0, 0, bw, bh, m); B.hl(0, 0, bw, 'br3'); B.hl(0, 1, bw, l); B.hl(0, bh - 1, bw, dd); B.vl(bw - 1, 1, bh - 2, d)
    B.frame(3, 3, bw - 6, 3, d); B.px(3, 3, l)                     # small front panel
    B.px(0, bh - 1, 'br2'); B.px(bw - 1, bh - 1, 'br2')            # brass feet
    Bo = B.outline()
    Rr = Layer(16, 2)
    Rr.rect(0, 0, 16, 2, 'k2'); Rr.hl(1, 0, 14, 'k3'); Rr.rect(6, 0, 4, 1, 'r3')
    Ro = Rr.outline()
    bx = 2; by = Hh - Bo.h
    hx = max(0, bx + 3 - nx + 2); hy = by - 2 - ny + 1
    out.paste(hl_, hx, max(0, hy))
    out.paste(Ro, bx + 1, by - 2)
    out.paste(Bo, bx, by)
    # crank on the right side: shaft, arm, wooden handle
    cxr = bx + Bo.w - 1
    K = Layer(3, 5); K.ascii(0, 0, ["...", ".b.", ".b.", "..w", "..w"], {'b': 'br2', 'w': 'wd3'})
    K.px(0, 1, 'br2')
    out.paste(K.outline(), cxr - 1, by + 1)
    return out


def koffergrammophon():
    """portable suitcase gramophone, lid open: red lining, record, little crank"""
    w = 24
    L = Layer(w, 22)
    # open lid standing up at the back
    L.rect(1, 0, w - 2, 12, 'r2'); L.rect(3, 2, w - 6, 9, 'r3'); L.hl(3, 2, w - 6, 'r4')
    L.px(4, 4, 'r4'); L.px(5, 4, 'r4')
    # a few records in the lid pocket
    L.rect(w - 9, 5, 5, 6, 'pk3'); L.rect(w - 8, 6, 3, 3, 'c3')
    # case body
    L.rect(0, 13, w, 9, 'wd2'); L.hl(0, 13, w, 'wd3'); L.hl(0, 21, w, 'wd1')
    L.hl(0, 15, w, 'br2'); L.rect(w // 2 - 2, 17, 4, 2, 'br3'); L.px(w // 2 - 2, 17, 'br4')
    L.rect(1, 13, 1, 9, 'br2'); L.rect(w - 2, 13, 1, 9, 'br2')
    # record: thin disc
    L.rect(3, 11, 16, 2, 'k2'); L.hl(4, 11, 14, 'k3'); L.rect(9, 11, 4, 1, 'y2')
    # tone arm
    L.hl(17, 10, 4, 'c2'); L.px(16, 11, 'c1'); L.px(21, 10, 'c2'); L.px(21, 11, 'k3')
    return L.outline()


def musiktruhe(w=30, h=24, wood=('wd0', 'wd1', 'wd2', 'wd3')):
    """music cabinet with two doors and turned legs"""
    dd, d, m, l = wood
    L = Layer(w, h)
    L.rect(0, 0, w, 3, m); L.hl(0, 0, w, l); L.hl(0, 2, w, d)
    L.rect(1, 3, w - 2, h - 8, d)
    half = (w - 2) // 2
    for x0 in (2, 1 + half + 1):
        L.rect(x0, 4, half - 2, h - 10, m); L.hl(x0, 4, half - 2, l); L.vl(x0, 4, h - 10, l)
        L.hl(x0, h - 7, half - 2, dd); L.vl(x0 + half - 3, 5, h - 11, dd)
        # carved sound grille: little arches
        for gx in range(x0 + 2, x0 + half - 3, 3):
            L.vl(gx, 7, 6, dd); L.px(gx, 6, d)
    L.px(half, 11, 'br3'); L.px(half + 2, 11, 'br3')
    L.rect(1, h - 5, w - 2, 1, dd)
    for lx in (2, w - 5):
        L.rect(lx, h - 4, 3, 1, m); L.rect(lx + 1, h - 3, 1, 2, m); L.rect(lx, h - 1, 3, 1, d)
    return L.outline()


def plattenschrank(w=40, h=22, wood=('bw1', 'bw2', 'bw3', 'bw4')):
    """low record cabinet with open cubbies full of colourful record sleeves"""
    dd, d, m, l = wood
    L = Layer(w, h)
    L.rect(0, 0, w, h - 2, m); L.hl(0, 0, w, l); L.hl(0, 1, w, l)
    cub = 4; cw = (w - 2) // cub
    sleeves = [['r3', 'y2', 'u3', 'c3', 'g3', 'pk2', 'o3'], ['lav2', 'c3', 'r4', 'u4', 'y3', 'g4']]
    for i in range(cub):
        x0 = 1 + i * cw + 1
        L.rect(x0, 3, cw - 2, h - 7, dd)
        for j in range(cw - 3):
            col = sleeves[i % 2][(i * 3 + j) % len(sleeves[i % 2])]
            hh = h - 8 - ((i + j) % 3 == 0)
            L.vl(x0 + 1 + j, h - 5 - hh, hh, col)
        L.vl(x0 + cw - 2, 3, h - 7, d)
    L.hl(0, h - 4, w, d); L.hl(0, h - 3, w, dd)
    L.rect(1, h - 2, 3, 2, d); L.rect(w - 4, h - 2, 3, 2, d)
    return L.outline()


def beistelltisch(w=20, h=22):
    """round side table with a lace doily, one central leg and three feet"""
    L = Layer(w, h)
    L.rect(0, 0, w, 3, 'wd3'); L.hl(0, 0, w, 'wd4'); L.hl(0, 2, w, 'wd2')
    for x in range(1, w - 1, 2):            # doily edge hanging over
        L.px(x, 3, 'c3')
    L.hl(2, 3, w - 4, 'c3')
    cx = w // 2
    L.rect(cx - 1, 4, 3, h - 7, 'wd2'); L.vl(cx - 1, 4, h - 7, 'wd3')
    L.rect(cx - 2, 9, 5, 2, 'wd3'); L.rect(cx - 2, h - 8, 5, 2, 'wd3')
    for k in range(5):
        L.px(cx - 2 - k, h - 3 + k // 3, 'wd2'); L.px(cx + 2 + k, h - 3 + k // 3, 'wd2')
    L.rect(cx - 1, h - 3, 3, 3, 'wd2')
    return L.outline()


def plattenkiste():
    """wooden crate on the floor with record sleeves sticking out"""
    L = Layer(16, 14)
    cols = ['r3', 'c3', 'u3', 'y2', 'pk2', 'g3', 'lav2']
    for i in range(7):
        L.rect(1 + i * 2, 1 + (i % 3), 2, 7, cols[i])
        L.px(1 + i * 2, 1 + (i % 3), mul(P[cols[i]], 1.12))
    L.rect(0, 6, 16, 8, 'bw3'); L.hl(0, 6, 16, 'bw4'); L.hl(0, 10, 16, 'bw2'); L.hl(0, 13, 16, 'bw2')
    L.rect(6, 8, 4, 1, 'bw1')
    return L.outline()


def plattenstapel():
    """small stack of records lying flat"""
    L = Layer(16, 5)
    cols = ['r3', 'k2', 'u3', 'k2', 'y2']
    for i, c in enumerate(cols):
        L.hl(i % 2, i, 16 - (i % 2), c)
    return L.outline()


def blatt(length, width, angle, light='g4', mid='g3', dark='g2', edge='g1'):
    """one pointed leaf (rotated), with a middle vein; outlined in dark green so overlapping leaves stay readable"""
    n = int(length + 4)
    L = Layer(n * 2, n * 2)
    ca, sa = math.cos(angle), math.sin(angle)
    for yy in range(n * 2):
        for xx in range(n * 2):
            dx, dy = xx + .5 - n, yy + .5 - n
            u = dx * ca + dy * sa                 # along the leaf
            v = -dx * sa + dy * ca                # across
            if 0 <= u <= length:
                half = width / 2 * math.sin(math.pi * u / length) ** .7
                if abs(v) <= half:
                    c = (light if v < -half * .35 else mid) if v < 0 else dark
                    if abs(v) < .5 and u > 1:
                        c = dark if v < 0 else edge
                    L.px(xx, yy, c)
    o = L.outline(P[edge])
    return o, n + 1


def zimmerpflanze(h=42, pot=('o1', 'o2', 'o3'), seed=0):
    """tall leafy rubber plant in a terracotta pot"""
    w = 24
    L = Layer(w, h)
    cx = w // 2
    top = h - 12
    # stems
    for x0, y0, x1, y1 in ((cx, top, cx - 3, 6), (cx, top, cx + 4, 10), (cx, top, cx, 2)):
        for t in range(30):
            x = int(round(x0 + (x1 - x0) * t / 29)); y = int(round(y0 + (y1 - y0) * t / 29))
            L.px(x, y, 'wd2')
    leaves = [  # (x, y, length, width, angle in degrees)
        (cx - 3, 22, 9, 5, 200), (cx + 3, 24, 9, 5, -20), (cx - 3, 15, 8, 5, 215), (cx + 4, 17, 8, 5, -35),
        (cx - 2, 8, 8, 4, 235), (cx + 3, 10, 8, 4, -55), (cx, 3, 7, 4, 270), (cx - 1, 26, 7, 4, 160), (cx + 1, 28, 7, 4, 15),
    ]
    for (x, y, ln, wd, a) in leaves:
        b, off = blatt(ln, wd, math.radians(a))
        L.paste(b, x - off, y - off)
    L.rect(cx - 6, h - 10, 12, 10, pot[1]); L.rect(cx - 7, h - 11, 14, 3, pot[2]); L.hl(cx - 7, h - 9, 14, pot[0]); L.vl(cx + 4, h - 8, 8, pot[0])
    L.vl(cx - 5, h - 8, 7, pot[2])
    return L.outline()


def notenstaender():
    """little brass music stand with an open sheet"""
    L = Layer(12, 34)
    L.rect(0, 0, 12, 8, 'c3'); L.vl(6, 0, 8, 'c1')
    for y in (2, 4, 6):
        L.hl(1, y, 4, 'k4'); L.hl(7, y, 4, 'k4')
    L.hl(0, 8, 12, 'br2')
    L.vl(6, 9, 21, 'br2'); L.vl(5, 9, 21, 'br3')
    for k in range(5):
        L.px(5 - k, 30 + k // 2, 'br2'); L.px(6 + k, 30 + k // 2, 'br2')
    return L.outline()


def pilaster(h=100, w=6):
    """a slim piece of wall jutting out between hallway and living room: wallpaper in shade, skirting, corner edge"""
    from scene import WALL
    L = Layer(w, h)
    for y in range(h):
        for x in range(w):
            if y < 97:
                c = WALL.getpixel(((x + 3) % 16, (y + 8) % 16)); c = mul(c, .9 if x < w - 1 else .97)
            else:
                c = C('e8dccb') if x < w - 1 else C('fff6e8')
            L.px(x, y, c)
    L.vl(w - 1, 0, 97, mul(C('fbf0de'), 1))
    return L.outline()
