"""Round 5: completely new gramophones. Classic side view: a swan-neck horn rising from the back of the box and
opening towards the armchair (upper left), with a sound box resting on the record. Each on its own piece of furniture."""
import math
from draw import Layer, P, C, INK, mul
from objects import beistelltisch


def tc(c):
    return c if isinstance(c, tuple) else (P[c] if c in P else C(c))


def bez(p0, p1, p2, t):
    return ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
            (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])


def horn_profile(L, p0, p1, p2, r0, r1, pal, rim, inside, pattern=None, scallop=0):
    """swan-neck horn along a quadratic curve; radius grows towards the bell; mouth seen at an angle"""
    pal = [tc(c) for c in pal]; rim = [tc(c) for c in rim]; inside = [tc(c) for c in inside]
    N = 120
    pts = [bez(p0, p1, p2, i / N) for i in range(N + 1)]
    rad = [r0 + (r1 - r0) * (i / N) ** 2.4 for i in range(N + 1)]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    for y in range(int(min(ys) - r1 - 2), int(max(ys) + r1 + 3)):
        for x in range(int(min(xs) - r1 - 2), int(max(xs) + r1 + 3)):
            best = None
            for i in range(N + 1):
                dx = x + .5 - pts[i][0]; dy = y + .5 - pts[i][1]
                d = dx * dx + dy * dy
                if d <= rad[i] ** 2 and (best is None or i > best[0]):
                    best = (i, dx, dy)
            if not best:
                continue
            i, dx, dy = best
            j = min(N, i + 1); k = max(0, i - 1)
            tx, ty = pts[j][0] - pts[k][0], pts[j][1] - pts[k][1]
            tl = math.hypot(tx, ty) or 1
            nx, ny = ty / tl, -tx / tl              # normal; choose the one pointing up
            if ny > 0:
                nx, ny = -nx, -ny
            s = (dx * nx + dy * ny) / max(1, rad[i])
            c = pal[4] if s > .55 else pal[3] if s > .15 else pal[2] if s > -.35 else pal[1] if s > -.75 else pal[0]
            if pattern:
                c = pattern(x, y, i / N, s, c) or c
            L.px(x, y, c)
    # collar where the neck meets the sound box
    # mouth
    ex, ey = pts[-1]; tx, ty = pts[-1][0] - pts[-8][0], pts[-1][1] - pts[-8][1]
    tl = math.hypot(tx, ty); ux, uy = tx / tl, ty / tl; vx, vy = -uy, ux
    a = max(2.6, r1 * .5); b = r1 + 1
    cx, cy = ex + ux * .6, ey + uy * .6
    for y in range(int(cy - b - 3), int(cy + b + 4)):
        for x in range(int(cx - b - 3), int(cx + b + 4)):
            px_, py_ = x + .5 - cx, y + .5 - cy
            u = px_ * ux + py_ * uy; v = px_ * vx + py_ * vy
            th = math.atan2(v, u)
            bb = b * (1 + scallop * math.cos(th * 6)) if scallop else b
            q = (u / a) ** 2 + (v / bb) ** 2
            if q <= 1:
                if q > .55:
                    c = rim[1] if v * vy < 0 or (v < 0) else rim[0]
                    c = rim[1] if (py_ < 0) else rim[0]
                elif q > .22:
                    c = inside[1]
                else:
                    c = inside[0]
                L.px(x, y, c)


def soundbox(L, x, y):
    """the round sound box (Schalldose) on the record, silver with a dark centre"""
    L.rect(x, y, 4, 4, 'c2'); L.px(x, y, 'c4'); L.px(x + 1, y + 1, 'k3'); L.px(x + 2, y + 2, 'k3'); L.px(x + 3, y + 3, 'c1')
    L.px(x + 1, y + 4, 'c1'); L.px(x + 1, y + 5, 'c2')


def gbox(L, x, y, w, h, wood, trim='br3', front=None):
    d0, d, m, l = [tc(c) for c in wood]
    L.rect(x, y, w, h, m); L.hl(x, y, w, l); L.vl(x, y, h, l); L.vl(x + w - 1, y + 1, h - 1, d); L.hl(x, y + h - 1, w, d0)
    L.hl(x, y + 1, w, tc(trim))
    for cx in (x, x + w - 2):                     # brass corner caps
        L.rect(cx, y + h - 2, 2, 2, tc(trim))
    if front:
        front(L, x, y, w, h)
    # crank on the right side
    L.px(x + w, y + 3, 'br2'); L.px(x + w + 1, y + 3, 'br2'); L.px(x + w + 1, y + 4, 'br2'); L.px(x + w + 1, y + 5, 'br2'); L.px(x + w + 2, y + 5, 'wd3'); L.px(x + w + 2, y + 6, 'wd3')


def record(L, x, y, w):
    L.rect(x, y, w, 2, 'k2'); L.hl(x + 1, y, w - 2, 'k3'); L.rect(x + w // 2 - 2, y, 4, 1, 'r3')


def build_gram(horn, box, rec=True):
    """returns an outlined layer with box + record + sound box + horn"""
    L = Layer(40, 50)
    bx, by, bw, bh = box['x'], box['y'], box['w'], box['h']
    gbox(L, bx, by, bw, bh, box['wood'], box.get('trim', 'br3'), box.get('front'))
    record(L, bx + 1, by - 2, bw - 2)
    p0 = (bx + bw - 6, by - 4)
    soundbox(L, bx + bw - 8, by - 6)
    horn_profile(L, p0, horn['p1'], horn['p2'], horn.get('r0', 1.3), horn.get('r1', 9), horn['pal'], horn['rim'], horn['inside'],
                 horn.get('pattern'), horn.get('scallop', 0))
    o = L.outline()
    bb = o.im.getbbox(); out = Layer(bb[2] - bb[0], bb[3] - bb[1]); out.paste(o.im.crop(bb), 0, 0)
    return out


# ------------------------------------------------------------------ furniture under the gramophones
def lacetisch(w=28, h=22):
    """round side table with lace doily and a lower shelf with records lying on it"""
    L = Layer(w, h)
    L.rect(0, 0, w, 3, 'wd3'); L.hl(0, 0, w, 'wd4'); L.hl(0, 2, w, 'wd2')
    for x in range(1, w - 1):
        if x % 3 != 1:
            L.px(x, 3, 'c3')
        if x % 3 == 0 and 3 < x < w - 3:
            L.px(x, 4, 'c3')
    for x in (3, w - 5):
        L.rect(x, 3, 2, h - 3, 'wd2'); L.vl(x, 3, h - 3, 'wd3')
    L.rect(1, h - 8, w - 2, 2, 'wd3'); L.hl(1, h - 8, w - 2, 'wd4')
    for i, c in enumerate(('r3', 'k2', 'u3', 'k2', 'y2')):
        L.hl(6 + (i % 2), h - 9 - i, w - 14, c)
    return L.outline()


def kommoedchen(w=28, h=26, col=('c1', 'c2', 'c3', 'c4'), knob='br3'):
    """small painted cabinet with a drawer, a door and curved legs"""
    d, m, l, hl = col
    L = Layer(w, h)
    L.rect(0, 0, w, 3, l); L.hl(0, 0, w, hl); L.hl(0, 2, w, d)
    L.rect(1, 3, w - 2, h - 8, m); L.vl(1, 3, h - 8, l); L.vl(w - 2, 3, h - 8, d)
    L.frame(3, 5, w - 6, 5, d); L.px(w // 2, 7, knob)
    L.frame(3, 12, w - 6, h - 19, d); L.px(w - 7, 14 + (h - 19) // 2 - 1, knob)
    L.rect(1, h - 5, w - 2, 1, d)
    for x, s in ((2, 1), (w - 4, -1)):
        L.px(x, h - 4, m); L.px(x + (1 if s > 0 else 1), h - 3, m); L.px(x + (0 if s > 0 else 2), h - 2, m); L.px(x + (0 if s > 0 else 2), h - 1, d)
        L.px(x + 1, h - 4, m)
    return L.outline()


def kistenstapel(w=28):
    """two wooden crates stacked, full of colourful record sleeves"""
    L = Layer(w, 23)
    cols = ['r3', 'c3', 'u3', 'y2', 'pk2', 'g3', 'o3', 'lav2', 'c3', 'r4', 'u4', 'mint1', 'y3']
    for row, y0 in enumerate((0, 11)):
        for i in range(w - 4):
            hh = 9 - ((i + row) % 3 == 0)
            L.vl(2 + i, y0 + (9 - hh), hh, cols[(i * 2 + row * 5) % len(cols)])
        L.rect(0, y0 + 4, w, 8, 'bw3'); L.hl(0, y0 + 4, w, 'bw4'); L.hl(0, y0 + 8, w, 'bw2'); L.hl(0, y0 + 11, w, 'bw2')
        L.rect(w // 2 - 3, y0 + 6, 6, 1, 'bw1')
        L.vl(0, y0 + 4, 8, 'bw2'); L.vl(w - 1, y0 + 4, 8, 'bw1')
    return L.outline()


def nachttruhe(w=28, h=22):
    """low walnut chest with two drawers and brass handles, records leaning at the side"""
    L = Layer(w, h)
    L.rect(0, 0, w, 3, 'wd3'); L.hl(0, 0, w, 'wd4'); L.hl(0, 2, w, 'wd1')
    L.rect(1, 3, w - 2, h - 6, 'wd1')
    for y0 in (4, 4 + (h - 8) // 2):
        L.rect(2, y0, w - 4, (h - 8) // 2 - 1, 'wd2'); L.hl(2, y0, w - 4, 'wd3')
        L.rect(w // 2 - 3, y0 + 3, 6, 1, 'br3'); L.px(w // 2 - 3, y0 + 2, 'br2'); L.px(w // 2 + 2, y0 + 2, 'br2')
    L.rect(1, h - 3, 3, 3, 'wd1'); L.rect(w - 4, h - 3, 3, 3, 'wd1')
    return L.outline()


# ------------------------------------------------------------------ the four designs
def roses(x, y, t, s, c):
    if t < .25:
        return None
    u, v = x % 5, (y + (x // 5) * 2) % 5
    if (u, v) in ((2, 2), (3, 2), (2, 3)):
        return P['pk2']
    if (u, v) == (3, 3):
        return P['pk3']
    if (u, v) == (1, 3):
        return P['g3']
    return None


def staves(x, y, t, s, c):
    if t > .2 and abs((s * 4) % 1 - .5) < .12:
        return mul(c, .82)
    return None


def stars(x, y, t, s, c):
    if t > .2 and ((x * 7 + y * 13) % 23 == 0):
        return P['y3']
    return None


DESIGNS = {
    'kupfer': dict(
        name='Kupfer-Schwanenhals auf Spitzentisch',
        horn=dict(p1=(34, 18), p2=(12, 16), r1=9.5, pal=('7a3a20', 'a0522c', 'c46a3c', 'e0905e', 'f6c08a'),
                  rim=('e9b949', 'fbe2a0'), inside=('4a2010', '7a3a20')),
        box=dict(x=6, y=41, w=20, h=8, wood=('3e2410', '764a22', '9a6634', 'ba844a')),
        moebel=lacetisch),
    'rosen': dict(
        name='Rosen-Emaille auf cremefarbenem Kommödchen',
        horn=dict(p1=(34, 20), p2=(12, 17), r1=9, pal=('c8b49a', 'e0d0b8', 'f4ecdc', 'fff8ec', 'ffffff'),
                  rim=('e9b949', 'fbe2a0'), inside=('a88a70', 'd8c4a8'), pattern=roses),
        box=dict(x=6, y=41, w=20, h=8, wood=('5a9a80', '7ab8a0', 'a8d8c4', 'd4f0e4'), trim='br3'),
        moebel=lambda: kommoedchen(28, 22, ('c1', 'c2', 'c3', 'c4'))),
    'walnuss': dict(
        name='Walnuss-Trichter auf Plattenkisten',
        horn=dict(p1=(35, 19), p2=(11, 15), r1=10, pal=('3e2410', '5a3418', '764a22', '9a6634', 'ba844a'),
                  rim=('b8862a', 'e9b949'), inside=('2b1d12', '4e3018'), pattern=staves),
        box=dict(x=6, y=41, w=20, h=8, wood=('2b1d12', '4e3018', '6a4020', '8a5a30')),
        moebel=kistenstapel),
    'sterne': dict(
        name='Nachtblau mit Goldsternen auf Walnusstruhe',
        horn=dict(p1=(33, 19), p2=(12, 16), r1=9.5, pal=('1a2a48', '24385e', '304a78', '46669a', '6a8ac0'),
                  rim=('e9b949', 'fbe2a0'), inside=('101828', '1a2a48'), pattern=stars, scallop=.08),
        box=dict(x=6, y=41, w=20, h=8, wood=('1e1616', '2a2a2a', '3a3434', '5a5252'), trim='br3'),
        moebel=nachttruhe),
}


def gram(key):
    d = DESIGNS[key]
    return build_gram(d['horn'], d['box']), d['moebel'](), d['name']
