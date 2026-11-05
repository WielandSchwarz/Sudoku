import sys, math
sys.path.insert(0, '../hvart')
from lib import S, hx, lit, band
from PIL import Image
def H(c): return tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) + (255,)
class Scene:
    def __init__(s, w=180, h=135): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 255)); s.w, s.h = w, h
    def px(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.w and 0 <= y < s.h: s.im.putpixel((x, y), H(c))
    def rect(s, x, y, w, h, c):
        for yy in range(int(y), int(y + h)):
            for xx in range(int(x), int(x + w)): s.px(xx, yy, c)
    def spr(s, sp, x, y):
        for yy in range(sp.h):
            for xx in range(sp.w):
                c = sp.g[yy][xx]
                if c: s.px(x + xx, y + yy, c)
    def save(s, fn, k=4): s.im.resize((s.w * k, s.h * k), Image.NEAREST).save(fn)
def ell(sp, cx, cy, rx, ry, f):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            d = dx * dx + dy * dy
            if d <= 1:
                c = f(dx, dy, d)
                if c: sp.put(x, y, c)
# ---------- 2.5d dishes, seen from above-front (squash .45) ----------
K = '#3a2414'
def plate(rx=13, col=('#c8ccd4', '#e8ecf0', '#ffffff', '#a8b0bc'), rimc=None, dirt=None, th=2):
    ry = rx * .42; W, Hh = int(rx * 2 + 4), int(ry * 2 + th + 4); s = S(W, Hh); cx, cy = W / 2, ry + 2
    for k in range(th, 0, -1): ell(s, cx, cy + k, rx, ry, lambda dx, dy, d: col[3])
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: col[0] if d > .82 else (col[2] if dx < -.2 and dy < 0 and d > .55 else col[1]) if d > .55 else col[1] if d > .5 else (col[2] if dx + dy < -.5 else col[1]))
    if rimc: ell(s, cx, cy, rx, ry, lambda dx, dy, d: rimc if .7 < d < .8 else None)
    if dirt:
        for (ox, oy, r, c) in dirt: ell(s, cx + ox, cy + oy * .45, r, r * .5, lambda dx, dy, d: c)
    s.outline(K); return s
def bowl(rx=10, col=('#d86a4a', '#f08a6a', '#ffb090', '#a84a34'), inner=('#f4ead8', '#fffaf0'), depth=6, dirt=None):
    ry = rx * .42; W, Hh = int(rx * 2 + 4), int(ry * 2 + depth + 5); s = S(W, Hh); cx, cy = W / 2, ry + 2
    for y in range(int(cy), int(cy + depth + ry)):
        t = (y - cy) / (depth + ry)
        w = rx * (1 - t * .35)
        for x in range(int(cx - w), int(cx + w) + 1):
            u = (x + .5 - cx) / w
            if (y - cy - depth * (1 - abs(u) ** 2 * 0)) > ry * math.sqrt(max(0, 1 - u * u)) * .9: continue
            s.put(x, y, col[2] if u < -.55 else col[1] if u < .25 else col[0] if u < .7 else col[3])
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: col[1] if d > .78 else (inner[0] if dy < .1 else inner[1]))
    if dirt:
        for (ox, oy, r, c) in dirt: ell(s, cx + ox, cy + 1 + oy * .45, r, r * .5, lambda dx, dy, d: c)
    s.outline(K); return s
def cup(col=('#e8ecf0', '#ffffff', '#c8ccd4', '#a8b0bc'), band_=None, h=9, rx=5, dirt='#6a3a1a'):
    ry = rx * .45; W, Hh = int(rx * 2 + 9), int(h + ry * 2 + 4); s = S(W, Hh); cx, cy = rx + 2, ry + 2
    for y in range(int(cy), int(cy + h)):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            u = (x + .5 - cx) / rx
            c = col[1] if u < -.4 else col[0] if u < .4 else col[2]
            if band_ and y - cy in (3, 4): c = band_
            s.put(x, y, c)
    ell(s, cx, cy + h, rx, ry, lambda dx, dy, d: col[2] if dy > 0 else None)
    for k in range(5): s.put(cx + rx + 1 + (1 if 0 < k < 4 else 0), cy + 1 + k, col[2]); 
    s.put(cx + rx + 3, cy + 2, col[2]); s.put(cx + rx + 3, cy + 3, col[2]); s.put(cx + rx + 3, cy + 4, col[2])
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: col[3] if d > .6 else dirt if dirt else '#d8dce4')
    s.outline(K); return s
def glass(h=12, rx=4):
    ry = rx * .45; W, Hh = int(rx * 2 + 4), int(h + ry * 2 + 4); s = S(W, Hh); cx, cy = rx + 2, ry + 2
    for y in range(int(cy), int(cy + h)):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            u = (x + .5 - cx) / rx
            s.put(x, y, '#ffffff' if -.7 < u < -.3 else '#cfe8f4' if u < .5 else '#a8cce0')
    ell(s, cx, cy + h, rx, ry, lambda dx, dy, d: '#a8cce0' if dy > 0 else None)
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: '#e4f4fc' if d > .5 else '#bcdcec')
    s.outline('#4a6a80'); return s
def pan(rx=12, handle=12):
    ry = rx * .45; W, Hh = int(rx * 2 + handle + 4), int(ry * 2 + 6); s = S(W, Hh); cx, cy = rx + 2, ry + 2
    for k in range(3, 0, -1): ell(s, cx, cy + k, rx, ry, lambda dx, dy, d: '#2a2a30')
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: '#5a5a64' if d > .8 else ('#46464e' if dx + dy > -.4 else '#6a6a76'))
    ell(s, cx + 2, cy, rx * .45, ry * .45, lambda dx, dy, d: '#3a2a20')
    for k in range(handle): s.put(cx + rx + k, cy + 1 - k * .15, '#5a3a22'); s.put(cx + rx + k, cy + 2 - k * .15, '#3e2816')
    s.outline(K); return s
def pot(rx=10, h=9, col=('#8a9aa8', '#b8c8d4', '#e0ecf4', '#5a6a78')):
    ry = rx * .42; W, Hh = int(rx * 2 + 8), int(h + ry * 2 + 4); s = S(W, Hh); cx, cy = W / 2, ry + 2
    for y in range(int(cy), int(cy + h)):
        for x in range(int(cx - rx), int(cx + rx) + 1):
            u = (x + .5 - cx) / rx; s.put(x, y, col[2] if -.75 < u < -.45 else col[1] if u < .3 else col[0] if u < .75 else col[3])
    ell(s, cx, cy + h, rx, ry, lambda dx, dy, d: col[3] if dy > 0 else None)
    for sd in (-1, 1):
        for k in range(3): s.put(cx + sd * (rx + 1 + k), cy + 2, col[3]); s.put(cx + sd * (rx + 3), cy + 3, col[3])
    ell(s, cx, cy, rx, ry, lambda dx, dy, d: col[0] if d > .7 else '#4a3a30')
    s.outline(K); return s
def spoon(L=14, c='#c8ccd4'):
    s = S(L + 4, 8)
    for k in range(L - 4): s.put(2 + k, 4, c); s.put(2 + k, 5, '#8a929c')
    ell(s, L - 1, 4.5, 3, 2, lambda dx, dy, d: '#ffffff' if dx + dy < -.5 else c)
    s.outline(K); return s
def stack(sc, items, x, y):
    """items bottom->top: (sprite, lift, dx) ; returns top y"""
    for sp, lift, dx in items:
        sc.spr(sp, int(x - sp.w / 2 + dx), int(y - sp.h + 2)); y -= lift
    return y
