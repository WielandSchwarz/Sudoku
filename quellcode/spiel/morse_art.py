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
    g.rect(30, 6, 149, 42, PA); g.rect(30, 42, 149, 42, PA2); g.rect(149, 6, 149, 42, PA2)
    for (x, y) in ((33, 8), (146, 8)): g.rect(x, y, x + 1, y + 1, BR2)
def desk(g):
    for y in range(72, H):
        for x in range(W):
            c = WD if (x * 3 + y) % 23 else WD2
            g.p[y][x] = c
    g.rect(0, 72, W - 1, 73, WD3)
    for y in range(80, H):
        for x in range(6, W - 6):
            g.p[y][x] = LE if (x + y * 2) % 19 else LE2
    for y in range(84, 112):
        for x in range(136, W - 6):
            if ((x - 160) / 26) ** 2 + ((y - 99) / 10) ** 2 <= 1: g.p[y][x] = LE3 if (x + y * 2) % 19 else LE
    g.rect(6, 80, W - 7, 80, LE3)
    for x in range(8, W - 8, 4): g.put(x, 82, BR2)     # gold tooling on the leather
def receiver(g):   # Marconi magnetic detector as a box seen from front-above: top face, front face, right side
    g.poly([(9, 43), (51, 43), (46, 53), (2, 53)], WD3)                  # top face (back edge leans towards the middle)
    for x in range(10, 50, 7): g.rect(x - (x - 9) // 9, 47, x + 3 - (x - 9) // 9, 47, WD)
    g.rect(2, 53, 46, 84, WD); g.rect(2, 53, 46, 53, '#c08050')         # front face
    g.poly([(46, 53), (51, 43), (51, 75), (46, 84)], WD2)                 # right side face
    g.rect(2, 82, 46, 84, WD2)
    # the coil lying on top: a copper cylinder between two brass cheeks
    g.rect(22, 41, 40, 47, CU); g.rect(22, 41, 40, 42, '#e8945a'); g.rect(22, 47, 40, 47, CU2)
    for x in range(24, 40, 2): g.rect(x, 43, x, 46, CU2)
    for cx in (21, 41): ell(g, cx, 44, 1.6, 4, BR); g.put(cx - 1, 42, BR3)
    for cx in (11, 15): g.rect(cx, 40, cx + 1, 49, BR2); g.rect(cx, 40, cx, 49, BR3); ell(g, cx + .5, 40, 1.8, 1, BR3)   # terminals
    # tuning dial on the front: brass ring, ivory scale, ebonite knob standing out with a shadow
    ell(g, 16, 68, 9, 9, BR2); ell(g, 16, 67.5, 8, 8, BR); ell(g, 16, 68, 6.5, 6.5, '#e8dcc0')
    for t in range(200, 341, 20): g.put(int(16 + math.cos(math.radians(t)) * 5), int(68 + math.sin(math.radians(t)) * 5), EB)
    ell(g, 17.5, 70, 3.4, 3, '#b8a888'); ell(g, 16, 68, 3.4, 3, EB); ell(g, 16, 67, 3, 2.2, EB3); g.put(15, 66, '#8a8090')
    g.rect(16, 62, 16, 65, CU2)
    # brass name plate and two small switches
    g.rect(28, 60, 42, 66, BR); g.rect(28, 60, 42, 60, BR3); g.rect(28, 66, 42, 66, BR2); g.rect(30, 63, 40, 63, BR2)
    ell(g, 31, 75, 2.4, 2.4, EB); g.rect(31, 71, 32, 74, BR3)
    ell(g, 39, 75, 3.4, 3.4, BR2); ell(g, 39, 74.6, 2.6, 2.6, BR); ell(g, 39, 75, 2, 2, '#6a2a1a'); g.put(38, 74, '#9a4a2a')   # signal lamp (lights up in the game)
def lamp(g):     # brass desk lamp: round foot with thickness, round stem, green cone shade seen from above
    ell(g, 161, 97, 12, 4, BR2); ell(g, 161, 95.5, 12, 4, BR); ell(g, 159, 94.5, 7, 2, BR3)
    for y in range(58, 95):
        g.rect(159, y, 163, y, BR); g.put(159, y, BR3); g.put(163, y, BR2)
    ell(g, 161, 94, 3, 1.4, BR2); ell(g, 161, 93.5, 2.5, 1, BR)
    # the shade: a cone between a small top opening and a wide rim
    for y in range(46, 59):
        t = (y - 46) / 12; hw = 6 + t * 10
        for x in range(int(161 - hw), int(161 + hw) + 1):
            u = (x - 161) / hw
            g.put(x, y, '#5aaa7a' if u < -.55 else '#2e7a4a' if u < .45 else '#1e5a34')
    for x in range(145, 178):      # front of the rim curves down
        u = (x - 161) / 16; yy = 58 + int(round((1 - u * u) ** .5 * 3)) if abs(u) <= 1 else 58
        g.rect(x, 57, x, yy, '#1e5a34'); g.put(x, yy, BR2)
    ell(g, 161, 46, 6, 1.8, '#1e4a2c'); ell(g, 161, 45.6, 4.5, 1.1, '#fff6c8')    # the opening at the top, the bulb glowing inside
    ell(g, 161, 45, 1.6, 1.6, BR2)
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

def shifted(l, dy):
    g = G(W, H)
    for y in range(H - dy): g.p[y + dy] = l.p[y][:]
    return g
bg = comp(lay(wall), lay(porthole), lay(card), lay(desk), shifted(lay(receiver), 3), lay(lamp), lay(phones), lay(notepad), lay(keybase))
out = {}
for k, g in (('mo_bg', bg), ('mo_up', lever(False)), ('mo_dn', lever(True))):
    im, out[k] = png(g)
    if k == 'mo_bg': base = im.copy()
    else:
        pv = base.copy(); pv.alpha_composite(im); pv.resize((W * 4, H * 4), Image.NEAREST).save('/tmp/claude-0/-home-claude/c2f4144c-e47f-55b9-ac0f-58d21a2c6cc1/scratchpad/' + k + '.png')
json.dump(out, open('morse.json', 'w')); print({k: len(v) // 1024 for k, v in out.items()})
