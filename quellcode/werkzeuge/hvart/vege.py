from lib import *
OUT = {}
def add(n, s, o=(0, 0)): r, p = s.rows(); OUT[n] = {'r': r, 'p': p, 'o': list(o)}
OR = ['#5a2408', '#8a3a10', '#c05a14', '#e8781e', '#f8963a', '#ffc078', '#ffe0b0']
def carrot(L, W=13):
    s = S(2 * W + 3, L + 2); cx = W + 1
    for i in range(L):
        w = max(1, round(W * (1 - (i / L) ** 1.15 * .93)))
        if i < 3: w = W - (3 - i)
        for j in range(-w, w + 1):
            u = j / (w + .5); l = lit(u, -.15) - (i / L) * .1
            t = band(l, (-.3, .05, .35, .62)) + 0
            s.put(cx + j, i + 1, OR[t])
        if i % 7 == 3 and 4 < i < L - 6:      # growth rings: a dark dash with a light lip above
            a = -w + 1 + int(hx(i, 1) * 3); b = w - 1 - int(hx(i, 2) * 4)
            for j in range(a, b):
                if hx(j, i) < .85: s.put(cx + j, i + 1, OR[2]); s.put(cx + j, i, OR[5] if j < 0 else OR[4])
        if i % 11 == 6 and i < L - 8: s.put(cx + (w + 1 if (i // 11) % 2 else -w - 1), i + 1, OR[1])   # root hairs
    for j in range(-W + 3, W - 2): s.put(cx + j, 0, '#7a6a2a' if abs(j) > 3 else '#5a7a2a')
    s.outline(OR[0]); return s, (cx, 1)
s, o = carrot(64); add('carrot_v', s, o)
s2, o2 = carrot(120)
t = S(s2.h, s2.w)                         # lay it down: tip to the right
for y in range(s2.h):
    for x in range(s2.w): t.g[x][y] = s2.g[y][x]
add('carrot_h', t, (o2[1], o2[0]))
def fronds(a0=0.0, W=52, H=44, bx=26, by=43):
    s = S(W, H)
    for f in (-2, -1, 0, 1, 2):
        ang = f * .32 + a0; L = 36 - abs(f) * 5
        for q in range(L):
            x, y = bx + math.sin(ang) * q, by - math.cos(ang) * q
            s.put(x, y, G6[3]); s.put(x + 1, y, G6[2])
            if q > 7 and q % 3 == 0:
                sz = 4 if q < L - 6 else 3
                for side in (-1, 1):
                    for k in range(1, sz + 1):
                        s.put(x + side * k, y - k * .5 - 1, G6[5] if side < 0 else G6[4])
                    s.put(x + side * (sz + 1), y - sz * .5 - 2, G6[6] if side < 0 else G6[5])
        s.put(bx + math.sin(ang) * L, by - math.cos(ang) * L - 1, G6[6])
    s.outline(G6[0]); return s, (bx, by)
s, o = fronds(); add('fronds', s, o)
s, o = fronds(-1.45, 46, 50, 44, 30); add('fronds_h', s, o)
ON = ['#5a2e0c', '#8a4e1a', '#b8782a', '#d8a048', '#ecc070', '#f8dc98', '#fff4d0']
def onion(sc):
    rx, ry = 13 * sc, 12 * sc; W, H = int(rx * 2 + 4), int(ry * 2 + 10 * sc + 8); s = S(W, H); cx, cy = W / 2, ry + 5 * sc + 2
    for y in range(H):
        for x in range(W):
            dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            # teardrop: narrower towards the top neck
            if dy < 0: dx /= (1 - (-dy) ** 2.2 * .55)
            if dx*dx + dy*dy <= 1:
                l = lit(dx, dy); t = band(l, (-.3, .02, .32, .6))
                if abs(math.sin(dx * 3.3)) < .09 and abs(dy) < .85: t = max(1, t - 1)   # papery stripes
                s.put(x, y, ON[t])
    nk = int(5 * sc) + 2
    for k in range(nk):
        for j in (-1, 0, 1): s.put(cx + j - .5, cy - ry - k + 1, ON[3 if j < 0 else 2] if k < nk - 2 else '#8aa04a')
    s.put(cx - 4, cy - ry * .4, ON[6]); s.put(cx - 5, cy - ry * .3, ON[6]); s.put(cx - 4, cy - ry * .25, ON[5])
    for r in range(-4, 5, 2):
        for k in range(int(3 + abs(r) % 3 * sc)): s.put(cx + r * sc - .5 + (k // 3) * (1 if r > 0 else -1), cy + ry + k, '#e8d8b0' if k % 2 == 0 else '#c8b890')
    s.outline(ON[0]); return s, (round(cx), round(cy))
for sc, n in ((1, 'onion'), (1.4, 'onion_b')):
    s, o = onion(sc); add(n, s, o)
def onionleaves():
    s = S(40, 46); bx, by = 20, 45
    for f in (-2, -1, 0, 1, 2):
        ang = f * .18; L = 42 - abs(f) * 6
        for q in range(L):
            x, y = bx + math.sin(ang) * q * (1 + q / 90), by - math.cos(ang) * q
            s.put(x - 1, y, G6[5]); s.put(x, y, G6[4]); s.put(x + 1, y, G6[3])
            if q == L - 1: s.put(x, y - 1, G6[4])
    s.outline(G6[0]); return s, (bx, by)
s, o = onionleaves(); add('onionleaves', s, o)
def clump():
    s = S(14, 12); P = ['#2e1a0c', '#4e301c', '#6a4428', '#8a5e3a', '#a87850']
    for y in range(12):
        for x in range(14):
            dx, dy = (x + .5 - 7) / 6.2, (y + .5 - 6.3) / 4.8
            if dx*dx + dy*dy + .25 * math.sin(x * 2.1 + y) <= 1:
                l = lit(dx, dy) + (hx(x, y, 6) - .5) * .5; s.put(x, y, P[1 + min(3, max(0, band(l, (-.2, .2, .5)) - 1))])
    s.outline(P[0]); return s, (7, 6)
s, o = clump(); add('clump', s, o)
# ---------- strawberry ----------
def berry(ripe):
    s = S(17, 20); C = ['#5a0a12', '#8a1620', '#c0222c', '#e8403a', '#ff705a', '#ffb8a0'] if ripe else ['#4a5a2a', '#9ab070', '#c4d8a0', '#e0ecc4', '#f4f8e4', '#ffffff']
    cx, cy = 8.5, 10
    for y in range(4, 20):
        for x in range(17):
            v = (y - 4) / 15.0; w = 7.6 * (1 - v ** 1.6) ** .6 if v < 1 else 0
            if w <= 0: continue
            dx = (x + .5 - cx) / w; dy = v * 2 - .8
            if abs(dx) <= 1:
                l = lit(dx, dy * .8); s.put(x, y, C[band(l, (-.25, .1, .42, .7))])
    for y in range(6, 18, 2):
        for x in range(2, 16, 3):
            xx = x + (1 if (y // 2) % 2 else 0)
            if s.get(xx, y) and s.get(xx, y + 1) and s.get(xx - 1, y) and s.get(xx + 1, y):
                s.put(xx, y, '#ffe060' if ripe else '#c8c070'); s.put(xx, y + 1, C[1])
    s.put(5, 7, C[5]); s.put(4, 8, C[5])
    for (x, y, c) in ((8, 0, G6[3]), (8, 1, G6[3]), (9, 1, G6[4]), (4, 3, G6[3]), (5, 3, G6[4]), (6, 3, G6[5]), (7, 3, G6[4]), (8, 3, G6[3]), (9, 3, G6[4]), (10, 3, G6[5]), (11, 3, G6[4]), (12, 3, G6[3]),
                      (3, 4, G6[2]), (6, 4, G6[3]), (8, 2, G6[4]), (10, 4, G6[3]), (13, 4, G6[2]), (5, 2, G6[4]), (11, 2, G6[4])): s.put(x, y, c)
    s.outline(C[0]); return s, (8, 11)
for r, n in ((True, 'sberry'), (False, 'sberry_u')):
    s, o = berry(r); add(n, s, o)
def sleaf():
    s = S(48, 40); cx, cy = 24, 28
    for (ox, oy, ang) in ((-11, -2, math.pi + .35), (11, -2, -.35), (0, -10, -math.pi / 2)):
        leaflet(s, cx + math.cos(ang) * 2, cy + math.sin(ang) * 2 - 0, ang, 16, 7.4)
    s.outline(G6[0]); return s, (cx, cy - 6)
s, o = sleaf(); add('sleaf', s, o)
def crate(W=32, H=21):
    s = S(W, H); Wd = ['#3a2414', '#7a4e2a', '#9a6a3a', '#b8844c', '#d8a868', '#f0c890']
    for y in range(H):
        for x in range(W):
            pl = y // 7; yy = y % 7
            t = 3 if yy in (1, 2, 3, 4) else 2 if yy == 5 else 4 if yy == 0 else 1
            if x < 3 or x > W - 4: t = 4 if x < 3 else 2
            if hx(x // 5, y, 3) < .1 and 0 < yy < 5: t = 2
            s.put(x, y, Wd[t])
    for y in (2, 9, 16): s.put(1, y, Wd[0]); s.put(W - 2, y, Wd[0])
    s.outline(Wd[0]); return s, (0, 0)
s, o = crate(); add('crate', s, o)
# ---------- cucumber ----------
CU = ['#14301a', '#1e4a22', '#2e6a2a', '#3e8a3a', '#5aa04a', '#8ac868', '#c8eaa0']
def cucumber(L):
    W = 6; s = S(2 * W + 3, L + 9); cx = W + 1
    for i in range(L):
        w = W - (2 if i < 2 or i > L - 3 else 1 if i < 4 or i > L - 5 else 0)
        for j in range(-w, w + 1):
            u = j / (w + .5); t = band(lit(u, -.1), (-.3, .05, .35, .62))
            if j in (-2, 2) and t >= 3: t = min(6, t + 1) if j < 0 else t   # pale stripes
            s.put(cx + j, i + 7, CU[t])
        if i % 3 == 1 and 2 < i < L - 3:
            jx = (-3 if (i // 3) % 2 else 2) + (1 if hx(i, 3) < .5 else 0)
            s.put(cx + jx, i + 7, CU[6]); s.put(cx + jx, i + 8, CU[1])
    s.put(cx, L + 7, '#f0d050'); s.put(cx - 1, L + 7, '#c8a030')
    for k in range(7): s.put(cx - (1 if k > 3 else 0), k, '#5a8a3a'); s.put(cx + 1 - (1 if k > 3 else 0), k, '#3e6a2a')
    s.outline(CU[0]); return s, (cx, 6)
for L, n in ((40, 'cuc'), (20, 'cuc_s')):
    s, o = cucumber(L); add(n, s, o)
def bigleaf(P=G6):
    s = S(38, 34); cx, cy = 19, 17
    for y in range(34):
        for x in range(38):
            dx, dy = x + .5 - cx, (y + .5 - cy) * 1.1; rr = math.hypot(dx, dy); a = math.atan2(dy, dx)
            lob = 14.5 + math.cos(a * 5 + .3) * 3.4 + (.8 if int(a * 22) % 2 == 0 else 0)
            if rr > lob: continue
            # radiating veins, lit from top-left, slight cupping
            vein = abs(math.sin((a + .3 / 5) * 5 / 2 + math.pi / 2)) < .06 * (1 + 6 / max(rr, 1)) and 2 < rr < lob - 2
            seg = math.cos(a * 5 + .3); l = (-dx * .5 - dy * .7) / 16 + (1 - rr / lob) * .2 + seg * .12 * (rr / lob)
            t = band(l, (-.3, -.05, .2, .45))
            if vein: t = min(6, t + 1)
            if rr > lob - 1.3: t = max(1, t - 1)
            s.put(x, y, P[t])
    s.outline(P[0]); return s, (cx, cy)
s, o = bigleaf(); add('bigleaf', s, o)
def vine(x0, x1, y0, per, amp):
    W = x1 - x0 + 4; s = S(W, 30); oy = 14
    yy = lambda vx: y0 + math.sin(vx / per) * amp
    for vx in range(x0, x1):
        y = yy(vx) - y0 + oy
        s.put(vx - x0, y - 1, CU[5]); s.put(vx - x0, y, CU[4]); s.put(vx - x0, y + 1, CU[3]); s.put(vx - x0, y + 2, CU[2])
    for lx in range(x0 + 10, x1 - 6, 26):
        y = yy(lx) - y0 + oy; up = (lx // 26) % 2 < 1
        leaflet(s, lx - x0 + 1, y + (-1 if up else 2), -1.1 if up else 1.1, 8, 3.6)
        tx = lx + 13; ty = yy(tx) - y0 + oy - 2   # a curly tendril
        for k in range(14):
            a = k * .55; r = 3.5 - k * .2; s.put(tx - x0 + math.cos(a) * r + k * .3, ty - 2 - math.sin(a) * r - k * .25, CU[4])
    s.outline(CU[0]); return s, (0, oy)
s, o = vine(20, 170, 52, 14, 4); add('vine_a', s, o)
s, o = vine(80, 176, 62, 10, 3); add('vine_b', s, o)
PU = ['#5a2008', '#8a3a10', '#c05a14', '#e8781e', '#f8963a', '#ffbe6a', '#ffe2a8']
def pumpkin():
    s = S(58, 50); cx, cy = 29, 28
    for y in range(50):
        for x in range(58):
            dx, dy = (x + .5 - cx) / 27, (y + .5 - cy) / 20
            if dx*dx + dy*dy > 1: continue
            # ribs: each rib its own bulge, shaded by its own curve
            rib = (dx + 1) * 3.2; f = rib - math.floor(rib); bulge = math.sin(f * math.pi)
            nx = dx * .7 + (f - .5) * .9; l = lit(nx, dy) * .85 + bulge * .18
            t = band(l, (-.25, .06, .34, .6))
            if f < .08 or f > .94: t = 2
            s.put(x, y, PU[t])
    for y in range(1, 10):
        for k in range(-2, 3):
            s.put(cx + k + (1 if y < 4 else 0), y, ['#3a5a1a', '#5a7a2a', '#7a9a3a', '#5a7a2a', '#3e5a1e'][k + 2])
    s.put(cx - 8, cy - 10, PU[6]); s.put(cx - 9, cy - 9, PU[6]); s.put(cx - 9, cy - 8, PU[5])
    s.outline(PU[0]); return s, (cx, cy)
s, o = pumpkin(); add('pumpkin', s, o)
json.dump(OUT, open('vege.json', 'w'))
# preview
pv = Image.new('RGBA', (360, 140), (110, 80, 50, 255)); xs = 2
for n in ['carrot_v', 'fronds', 'onion', 'onion_b', 'onionleaves', 'clump', 'sberry', 'sberry_u', 'sleaf', 'crate', 'cuc', 'cuc_s', 'bigleaf', 'pumpkin']:
    d = OUT[n]; h_ = len(d['r']); w_ = len(d['r'][0]); im = Image.new('RGBA', (w_, h_), (0, 0, 0, 0))
    for y, r in enumerate(d['r']):
        for x, ch in enumerate(r):
            if ch in d['p']: c = d['p'][ch]; im.putpixel((x, y), tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) + (255,))
    if xs + w_ > 360: break
    pv.alpha_composite(im, (xs, 2 if n not in ('cuc','cuc_s','bigleaf','pumpkin','crate','sleaf') else 70)); xs += w_ + 3
    if n == 'clump': xs = 2
pv.resize((1440, 560), Image.NEAREST).save('vege_prev.png')
