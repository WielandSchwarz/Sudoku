# Close-up of a 1912 ship's wireless desk: mahogany wall, Marconi receiver, brass Morse key. 180 x 135, layers as PNG data URLs -> morse.json
import json, math, io, base64
from lib import G
from PIL import Image
K = '#2a1810'
W, H = 180, 135
MA, MA2, MA3 = '#6a3a24', '#4e2a1a', '#8a5034'
WD, WD2, WD3 = '#8a4e2c', '#6a3a20', '#a8683c'
LE, LE2, LE3 = '#3e6a4a', '#34583e', '#4e7e5a'
BR, BR2, BR3 = '#d8a840', '#a87c20', '#f6dc80'
EB, EB2, EB3 = '#2e2630', '#1e1820', '#5a5060'
PA, PA2 = '#f4ead4', '#dccfb0'
CU, CU2 = '#c8743a', '#a0582a'

def lay(fn):
    g = G(W, H); fn(g); g.outline(K); return g
def ell(g, cx, cy, rx, ry, c):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: g.put(x, y, c)
def comp(*ls):
    g = G(W, H)
    for l in ls:
        for y in range(H):
            for x in range(W):
                if l.p[y][x] is not None: g.p[y][x] = l.p[y][x]
    return g

def wall(g):
    for y in range(0, 72):
        for x in range(W):
            c = MA
            if x % 30 in (0, 1): c = MA2
            elif x % 30 == 2: c = MA3
            if y in (3, 4) or y in (60, 61): c = MA2
            if y == 5 or y == 62: c = MA3
            g.p[y][x] = c
    g.rect(0, 64, W - 1, 71, WD2); g.rect(0, 64, W - 1, 64, WD3)            # skirting rail behind the desk
def porthole(g):
    cx, cy, r = 14, 22, 9
    for y in range(cy - r - 3, cy + r + 4):
        for x in range(cx - r - 3, cx + r + 4):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if d <= r: g.put(x, y, '#1c2450' if y < cy + 3 else '#1e3a6a')
            elif d <= r + 2.6: g.put(x, y, BR if d < r + 1.4 else BR2)
    for (x, y) in ((10, 17), (17, 15), (13, 20), (19, 21)): g.put(x, y, '#fff6c8')
    for k in range(5): g.put(cx - 5 + k * 2, cy + 5, '#3a5a8a')
def card(g):   # the code card pinned to the wall; the game writes on it
    g.rect(30, 8, 149, 54, PA); g.rect(30, 54, 149, 54, PA2); g.rect(149, 8, 149, 54, PA2)
    for (x, y) in ((33, 10), (146, 10)): g.rect(x, y, x + 1, y + 1, BR2)
def desk(g):
    for y in range(72, H):
        for x in range(W):
            c = WD if (x * 3 + y) % 23 else WD2
            g.p[y][x] = c
    g.rect(0, 72, W - 1, 73, WD3)
    for y in range(80, H):
        for x in range(6, W - 6):
            g.p[y][x] = LE if (x + y * 2) % 19 else LE2
    g.rect(6, 80, W - 7, 80, LE3)
    for x in range(8, W - 8, 4): g.put(x, 82, BR2)     # gold tooling on the leather
def receiver(g):   # Marconi magnetic detector: varnished box, one tuning dial, a horizontal coil, brass plate
    g.rect(4, 48, 52, 82, WD); g.rect(4, 48, 52, 51, WD3); g.rect(50, 52, 52, 82, WD2); g.rect(4, 80, 52, 82, WD2)
    ell(g, 17, 64, 8, 8, EB); ell(g, 17, 64, 6, 6, '#e8dcc0')
    for t in range(0, 360, 30): g.put(int(17 + math.cos(math.radians(t)) * 5), int(64 + math.sin(math.radians(t)) * 5), EB)
    g.put(17, 63, CU2); g.put(18, 62, CU2); g.put(19, 61, CU2)
    g.rect(30, 58, 47, 66, CU); g.rect(30, 58, 47, 58, '#e8945a')
    for x in range(31, 47, 2): g.rect(x, 59, x, 66, CU2)
    g.rect(28, 56, 29, 68, BR2); g.rect(48, 56, 49, 68, BR2)
    g.rect(30, 72, 46, 76, BR); g.rect(30, 72, 46, 72, BR3); g.rect(33, 74, 43, 74, BR2)
def lamp(g):
    g.rect(150, 94, 172, 98, BR2); g.rect(150, 94, 172, 94, BR3)
    g.rect(159, 60, 162, 94, BR); g.rect(159, 60, 159, 94, BR3)
    g.poly([(146, 58), (176, 58), (170, 46), (152, 46)], '#2e7a4a'); g.rect(152, 46, 170, 47, '#4e9a6a'); g.rect(146, 57, 176, 58, '#1e5a34')
    g.rect(156, 59, 165, 60, '#fff6c8')
def phones(g):   # headphones hanging on a brass hook on the wall
    g.rect(160, 6, 162, 9, BR2)
    for t in range(0, 181, 5):
        a = math.radians(180 + t); g.put(int(161 + math.cos(a) * 9), int(22 + math.sin(a) * 12), EB); g.put(int(161 + math.cos(a) * 8), int(22 + math.sin(a) * 11), EB3)
    for cx in (152, 170): ell(g, cx, 26, 3.4, 5, EB); ell(g, cx, 25, 1.6, 3, EB3)
def notepad(g):
    g.poly([(4, 102), (34, 100), (36, 132), (6, 134)], PA); g.rect(4, 101, 34, 102, PA2)
    for y in range(108, 132, 6):
        for x in range(7, 34):
            if g.p[y][x] == PA: g.p[y][x] = '#c8d8e8'
def keybase(g):   # the Morse key: mahogany slab with a brass yoke, back spring screw, front contact
    g.poly([(48, 94), (144, 94), (150, 112), (42, 112)], WD3)
    for x in range(50, 144, 11): g.rect(x, 97, x + 6, 97, WD)
    g.rect(42, 112, 150, 124, WD2); g.rect(42, 124, 150, 124, K)
    for x in range(46, 148, 12): g.rect(x, 116, x + 6, 116, WD)
    g.rect(80, 84, 83, 104, BR2); g.rect(80, 84, 80, 104, BR3); g.rect(104, 84, 107, 104, BR2); g.rect(104, 84, 104, 104, BR3)
    g.rect(76, 102, 112, 107, BR); g.rect(76, 102, 112, 102, BR3); g.rect(76, 107, 112, 107, BR2)
    g.rect(54, 96, 60, 103, BR); g.rect(54, 96, 54, 103, BR3); ell(g, 57, 95, 3.5, 1.8, BR3)
    g.rect(130, 100, 140, 104, BR2); ell(g, 135, 100, 5, 1.8, BR3)
    for (x, y) in ((48, 106), (144, 106)): ell(g, x, y, 2, 1.2, BR3)
    g.rect(90, 109, 98, 111, CU); g.rect(90, 109, 98, 109, '#e8945a')
def lever(down):
    def f(g):
        dy = 4 if down else 0
        for x in range(54, 138):
            y = int(round(84 + dy * (x - 93) / 44))
            g.rect(x, y, x, y + 3, BR); g.put(x, y, BR3); g.put(x, y + 3, BR2)
        g.rect(55, 88, 59, 95, '#c8c8d0'); g.rect(55, 89, 59, 89, '#9a9aa8'); g.rect(55, 92, 59, 92, '#9a9aa8')   # spring
        ell(g, 93.5, 86, 4.5, 4.5, BR); ell(g, 93.5, 86, 2, 2, BR3); g.put(93, 86, BR2)                              # pivot boss
        ky = 74 + dy
        g.rect(130, ky + 7, 140, ky + 12, EB2); g.rect(131, ky + 7, 131, ky + 12, EB)                                 # knob stem
        ell(g, 135, ky + 5, 11, 4.6, EB); ell(g, 135, ky + 4, 10, 3.6, EB3 if not down else EB); ell(g, 131, ky + 3, 3, 1.2, '#8a8090')
        if down:
            for (x, y, c) in ((135, 99, '#fff6c8'), (134, 98, '#ffe9a0'), (136, 98, '#ffe9a0'), (135, 97, '#ffe9a0')): g.put(x, y, c)
    return lay(f)

def png(g):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); P = im.load()
    for y in range(H):
        for x in range(W):
            c = g.p[y][x]
            if c: P[x, y] = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return im, 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

bg = comp(lay(wall), lay(porthole), lay(card), lay(desk), lay(receiver), lay(lamp), lay(phones), lay(notepad), lay(keybase))
out = {}
for k, g in (('mo_bg', bg), ('mo_up', lever(False)), ('mo_dn', lever(True))):
    im, out[k] = png(g)
    if k == 'mo_bg': base = im.copy()
    else:
        pv = base.copy(); pv.alpha_composite(im); pv.resize((W * 4, H * 4), Image.NEAREST).save('/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/' + k + '.png')
json.dump(out, open('morse.json', 'w')); print({k: len(v) // 1024 for k, v in out.items()})
