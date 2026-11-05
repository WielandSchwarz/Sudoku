import math, json
from PIL import Image
class S:
    def __init__(s, w, h): s.w, s.h = w, h; s.g = [[None]*w for _ in range(h)]
    def put(s, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def get(s, x, y):
        x, y = int(round(x)), int(round(y))
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else None
    def outline(s, col, inner=None):
        o = [r[:] for r in s.g]
        for y in range(s.h):
            for x in range(s.w):
                if s.g[y][x] is None:
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                        if s.get(x+dx, y+dy) not in (None,): o[y][x] = col; break
        s.g = o
    def rows(s):
        cols = sorted({c for r in s.g for c in r if c})
        keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        pal = {keys[i]: c for i, c in enumerate(cols)}; inv = {c: k for k, c in pal.items()}
        return [''.join(inv[c] if c else '.' for c in r) for r in s.g], pal
    def img(s, k=1, bg=None):
        im = Image.new('RGBA', (s.w, s.h), bg or (0,0,0,0))
        for y in range(s.h):
            for x in range(s.w):
                c = s.g[y][x]
                if c: im.putpixel((x, y), tuple(int(c[i:i+2], 16) for i in (1,3,5)) + (255,))
        return im.resize((s.w*k, s.h*k), Image.NEAREST)
def h(n):  # deterministic hash 0..1
    n = (n ^ 61) ^ (n >> 16); n = (n + (n << 3)) & 0xffffffff; n ^= n >> 4; n = (n * 0x27d4eb2d) & 0xffffffff; n ^= n >> 15; return n / 0xffffffff
def hx(x, y, s=0): return h((x * 73856093) ^ (y * 19349663) ^ (s * 83492791))
def band(l, cuts=(-.25, .08, .4, .68)):
    i = 1
    for c in cuts:
        if l >= c: i += 1
    return i   # 1..5
def lit(nx, ny, LX=-.55, LY=-.72, LZ=.42):
    q = nx*nx + ny*ny; nz = math.sqrt(max(0, 1 - min(q, 1))); return nx*LX + ny*LY + nz*LZ
G6 = ['#1a3a16', '#24501e', '#336a28', '#448a34', '#5aa646', '#7cc45c', '#a8e080']
def leaflet(s, x, y, ang, L, Wd, P=G6, serr=True, vein=True):
    ca, sa = math.cos(ang), math.sin(ang)
    for t in range(int(L * 10) + 1):
        u = t / 10.0
        w = Wd * math.sin(math.pi * min(1, u / L)) ** .75
        if serr and int(u * 1.5) % 2 and u > .8: w -= .6
        for k in range(-int(w * 10) - 1, int(w * 10) + 2):
            v = k / 10.0
            if abs(v) > w: continue
            px, py = x + ca * u - sa * v, y + sa * u + ca * v
            # which side faces up/left (lit)
            nxs, nys = -sa * (1 if v >= 0 else -1), ca * (1 if v >= 0 else -1)
            l = -(nxs * .55 + nys * .75)
            nv = abs(v) / max(w, .1)
            t2 = 4 + (1 if l > .1 else 0) - (1 if l < -.3 else 0)
            if nv > .8: t2 -= 1
            if nv < .5 and l > .2 and u / L < .6: t2 += 1
            if vein and nv < .13: t2 = min(6, t2 + 1)
            s.put(px, py, P[max(1, min(6, t2))])
