from lib import *
OUT = {}
def add(n, s, o=(0, 0)): r, p = s.rows(); OUT[n] = {'r': r, 'p': p, 'o': list(o)}
def ball(s, cx, cy, rx, ry, C, cuts=(-.25, .1, .42, .7)):
    for y in range(int(cy - ry - 1), int(cy + ry + 2)):
        for x in range(int(cx - rx - 1), int(cx + rx + 2)):
            dx, dy = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            if dx*dx + dy*dy <= 1: s.put(x, y, C[band(lit(dx, dy), cuts)])
# ---------- sunflower ----------
PET = ['#7a4a08', '#b87a10', '#e0a018', '#f4c020', '#ffd84a', '#fff0a0']
DK = ['#1e1008', '#3a2410', '#5a3a1a', '#7a5228', '#9a6a34']
def sunhead(R):
    E = R + 15; W = 2 * E + 2; s = S(W, W); c = W / 2
    n = 30
    for k in range(n):                       # petals: long pointed ovals around the disc, back row darker
        a = k / n * math.pi * 2 + (0.1 if k % 2 else 0); L = 15 if k % 2 == 0 else 13; wd = 3.6
        ca, sa = math.cos(a), math.sin(a)
        for t in range(int(L * 4)):
            u = t / 4.0; w = wd * math.sin(math.pi * min(1, (u + 1.5) / (L + 1.5))) ** .7
            for vv in range(-int(w * 4), int(w * 4) + 1):
                v = vv / 4.0; px, py = c + ca * (R - 2 + u) - sa * v, c + sa * (R - 2 + u) + ca * v
                side = v * (-sa * -.55 + ca * -.72)
                tt = 3 + (1 if side > 0 else 0) + (1 if abs(v) < .6 and u < L * .7 else 0) - (1 if k % 2 else 0) - (1 if u > L - 2 else 0)
                if s.get(px, py) is None or k % 2 == 0: s.put(px, py, PET[max(1, min(5, tt))])
    for y in range(W):
        for x in range(W):
            dx, dy = x + .5 - c, y + .5 - c; d = math.hypot(dx, dy)
            if d <= R:
                l = lit(dx / R, dy / R) * .6 + (hx(x, y, 2) - .5) * .3
                t = 2 if l < -.05 else 3 if l < .3 else 4
                if d > R - 2: t = 1
                elif d > R - 4: t = min(t, 2)
                s.put(x, y, DK[t])
    s.outline(PET[0]); return s, (int(c), int(c))
for R, n in ((30, 'sunhead'), (42, 'sunhead_b')):
    s, o = sunhead(R); add(n, s, o)
def sunstem():
    s = S(44, 64)   # at (68, 58): stem x 88..92 from y 60 to 120
    for y in range(2, 64):
        for k in range(-2, 3): s.put(22 + k, y, G6[[5, 4, 4, 3, 2][k + 2]])
    leaflet(s, 21, 28, math.pi + .35, 18, 6)
    leaflet(s, 23, 40, -.3, 18, 6)
    s.outline(G6[0]); return s, (0, 0)
s, o = sunstem(); add('sunstem', s, o)
def tray(W=36, H=9, cols=('#3a2414', '#8a6038', '#b8905a', '#d8b47a', '#f0d8a8')):
    s = S(W, H)
    for y in range(H):
        for x in range(W):
            if y < 2: s.put(x, y, cols[4] if y == 0 else cols[3])
            elif x > 1 and x < W - 2: s.put(x, y, cols[2] if y < H - 2 else cols[1])
    s.outline(cols[0]); return s, (0, 0)
s, o = tray(); add('tray', s, o)
s, o = tray(36, 16, ('#3a2414', '#a8946e', '#e0d0b0', '#f4ead4', '#fffaf0')); add('seedbowl', s, o)
# ---------- herbs ----------
def herb(y1, lean, ph):
    H = 106 - y1 + 6; s = S(24, H); bx = 12
    sx = lambda y: bx + lean * (106 - y) / 40.0
    for y in range(106, y1, -1):
        yy = y - y1 + 3; x = sx(y)
        s.put(x, yy, G6[3]); s.put(x + 1, yy, G6[2])
        if (106 - y + ph) % 10 == 5 and y < 100:
            sd = 1 if y % 2 else -1
            for q, dy0 in ((sd, 0), (-sd, -2)):
                leaflet(s, x + q * 1, yy + dy0, (-.5 if q > 0 else math.pi + .5), 5.5, 2.5)
    tx = sx(y1); ball(s, tx, 3, 2.6, 2.6, G6[1:])
    s.outline(G6[0]); return s, (bx, H - 3)
for i, x in enumerate([64, 72, 80, 88, 96, 104, 112]):
    s, o = herb(30 + (i % 3) * 6, ((x * 13) % 3) - 1, (x * 7) % 5); add('herb%d' % i, s, o)
def herbbundle():
    s = S(80, 26)
    for hs in range(7):
        y0, y1 = 3 + hs * 2.4, 13 + hs * 1.2
        for xx in range(0, 72):
            yy = y0 + (y1 - y0) * xx / 72; s.put(xx + 2, yy, G6[3] if xx < 48 else '#6a9a3a'); s.put(xx + 2, yy + 1, G6[2])
        if hs % 2 == 0:
            for lx in range(4 + (hs % 4) * 2, 44, 9):
                ly = y0 + (y1 - y0) * lx / 72; sd = 1 if (lx // 9) % 2 else -1
                leaflet(s, lx + 2, ly, -math.pi / 2 * sd - .7 * sd + (math.pi if sd < 0 else 0) * 0, 5, 2.3)
    s.outline(G6[0]); return s, (0, 0)
s, o = herbbundle(); add('herbbundle', s, o)
# ---------- dandelion ----------
DG = ['#1a3a16', '#24501e', '#3a7a2c', '#4e9a3a', '#6ab84a', '#94d070', '#c4e8a0']
def dleaf(ang, L):
    W = 2 * L + 10; s = S(W, int(L * 1.3) + 10); cx, cy = W / 2, s.h / 2
    ca, sa = math.cos(ang), math.sin(ang)
    for i10 in range(L * 4):
        i = i10 / 4.0
        w = max(1.5, 5 - abs(i - L * .55) / L * 6) + (3 if (i % 7) < 4 else 0) * (1 if i < L - 3 else .4) * min(1, i / 6)
        for j10 in range(-int(w * 4), int(w * 4) + 1):
            j = j10 / 4.0
            x = cx + ca * i - sa * j; y = cy + (sa * i + ca * j) * .55
            nv = abs(j) / w; up = (j * ca) < 0
            t = 4 + (1 if up else 0) - (1 if nv > .75 else 0)
            if nv < .15: t = 6
            s.put(x, y, DG[t])
    s.outline(DG[0]); return s, (int(cx), int(cy))
for i in range(5):
    s, o = dleaf(-math.pi * .9 + i * math.pi * .45, 34); add('dleaf%d' % i, s, o)
s, o = dleaf(0, 26); add('dleaf_t', s, o)
def crownk(rx=5, ry=3.5, C=('#2e1a0c', '#4e301c', '#6a4428', '#8a5e3a', '#a87850', '#c89a6a')):
    s = S(int(rx * 2 + 3), int(ry * 2 + 3)); ball(s, rx + 1.5, ry + 1.5, rx, ry, C); s.outline(C[0]); return s, (int(rx + 1.5), int(ry + 1.5))
s, o = crownk(); add('dcrown', s, o)
s, o = crownk(14, 4.5); add('rcrown', s, o)
# ---------- chili ----------
def chili(ripe):
    s = S(10, 20); C = ['#5a0a08', '#8a1810', '#c02818', '#e84028', '#ff7050', '#ffb090'] if ripe else ['#1e3a14', '#2e5a1e', '#3e7a28', '#5aa040', '#8ad06a', '#c4ec9a']
    for i in range(16):
        w = 2.3 if i < 3 else 2.3 - (i - 3) * .15; cx = 4.5 + math.sin(i / 6) * 2
        for x in range(10):
            dx = (x + .5 - cx) / max(w, .5)
            if abs(dx) <= 1: s.put(x, i + 3, C[band(lit(dx, -.2), (-.3, .05, .4, .7))])
    s.put(3, 5, C[5]); s.put(3, 6, C[5])
    for (x, y, c) in ((4, 0, G6[3]), (4, 1, G6[3]), (5, 1, G6[4]), (2, 2, G6[3]), (3, 2, G6[4]), (4, 2, G6[4]), (5, 2, G6[4]), (6, 2, G6[3])): s.put(x, y, c)
    s.outline(C[0]); return s, (4, 0)
for r, n in ((True, 'chili'), (False, 'chili_u')):
    s, o = chili(r); add(n, s, o)
def chiliplant():
    W, H = 80, 82; s = S(W, H); bx = 40   # stem foot at (90, 106) -> origin (50, 24)
    for y in range(6, H):
        for k in range(-2, 2): s.put(bx + k, y, G6[[5, 4, 3, 2][k + 2]])
    for (y, sd, L) in ((26, -1, 20), (30, 1, 18), (48, -1, 16), (52, 1, 18), (14, 1, 12), (12, -1, 12), (66, -1, 12), (68, 1, 12)):
        ex, ey = bx + sd * L, y - 6
        for q in range(L):
            s.put(bx + sd * q, y - q * 6 / L, G6[3]); s.put(bx + sd * q, y - q * 6 / L + 1, G6[2])
        leaflet(s, ex, ey, (0 if sd > 0 else math.pi) - .5 * sd, 10, 3.6)
        leaflet(s, bx + sd * L * .5, y - 3, (0 if sd > 0 else math.pi) + .9 * sd, 7, 2.8)
    leaflet(s, bx, 7, -math.pi / 2, 8, 3)
    s.outline(G6[0]); return s, (bx, H - 1)
s, o = chiliplant(); add('chiliplant', s, o)
# ---------- rhubarb ----------
RH = ['#4a0a14', '#8a1a2c', '#c0283c', '#d8384a', '#f06a7a', '#ffa8b4']
def rstalk(bx, ang, L=58):
    W = 60; s = S(W, L + 2); ox = 30
    for q in range(L):
        x = ox + (bx - 90) * q / L + math.sin(ang) * q * .4; y = L - q
        for k in range(-3, 4): s.put(x + k, y, RH[[5, 5, 4, 3, 3, 2, 1][k + 3]] if q % 7 else RH[[5, 4, 4, 4, 3, 2, 1][k + 3]])
    s.outline(RH[0]); return s, (ox, L)
for i, (bx, ang) in enumerate(((70, -.5), (90, 0), (110, .5))):
    s, o = rstalk(bx, ang); add('rstalk%d' % i, s, o)
def rstalk_h():
    s = S(92, 8)
    for x in range(1, 91):
        for y in range(1, 7): s.put(x, y, RH[[5, 5, 4, 3, 2, 1][y - 1]] if x % 9 else RH[[5, 4, 4, 4, 2, 1][y - 1]])
    s.outline(RH[0]); return s, (1, 1)
s, o = rstalk_h(); add('rstalk_h', s, o)
# ---------- bowl and basket ----------
def bowl():
    s = S(36, 14); C = ['#3a2414', '#a8946e', '#c8b490', '#e8d8b8', '#fff8ec', '#ffffff']
    for y in range(14):
        for x in range(36):
            dx, dy = (x + .5 - 18) / 17, (y + .5 - 3) / 10
            if dy >= -.05 and dx*dx + dy*dy <= 1:
                l = -dx * .7 - dy * .3; s.put(x, y, C[2 if l < -.3 else 3 if l < .25 else 4])
    for x in range(2, 34): s.put(x, 3, C[5] if x < 22 else C[4]); s.put(x, 4, C[1])
    for x in range(12, 24): s.put(x, 13, C[1])
    s.outline(C[0]); return s, (18, 4)
s, o = bowl(); add('bowl', s, o)
WB = ['#3a2414', '#6a4226', '#8a5a34', '#a87448', '#c8945a', '#d8a868', '#f0c890']
def basket():
    back = S(30, 12); front = S(30, 23)
    for x in range(3, 27): back.put(x, 2, WB[5]); back.put(x, 1, WB[6] if x < 20 else WB[5])
    for y in range(3, 11): back.put(3, y, WB[4]); back.put(26, y, WB[2])
    for x in range(5, 25): back.put(x, 4, WB[3])     # inner back rim
    back.outline(WB[0])
    for y in range(23):
        for x in range(30):
            if y < 3: t = 6 if y == 0 else 5 if y == 1 else 3
            elif y > 20: t = 1
            else:
                r, c2 = (y - 3) // 4, x // 4; odd = (r + c2) % 2; yy = (y - 3) % 4
                t = (5 if odd else 4) if yy < 3 else 2
                if r >= 3 and yy < 3: t -= 1
                if odd and yy == 0 and x % 4 in (1, 2): t = 6
                if x == 0: t = 5
                if x == 29: t = 2
            front.put(x, y, WB[t])
    front.outline(WB[0])
    return back, front
b, f = basket(); add('bk_back', b, (1, 10)); add('bk_front', f, (1, 1))
# ---------- berry bushes ----------
LFB = {'blueberry': ['#1a3420', '#24482a', '#346a3a', '#4a8a50', '#62a464', '#86c080', '#b0dca8']}
def bush(kind):
    W, H = 120, 100; s = S(W, H); ox, oy = 30, 14    # bush covers x 30..150, y 14..114
    cane = ['#3a2414', '#5a3a28', '#7a4a3a', '#9a6a52', '#b88a6a'] if kind in ('blackberry', 'gooseberry') else ['#3a2414', '#6a4a30', '#8a6a4a', '#a8865e', '#c8a478']
    P = LFB.get(kind, G6)
    canes = [(90, 112, 60, 30), (90, 112, 120, 34), (90, 112, 76, 20), (90, 112, 106, 22), (90, 112, 92, 26), (90, 112, 50, 60), (90, 112, 132, 62)]
    pts = []
    for ci, (x0, y0, x1, y1) in enumerate(canes):
        for q in range(120):
            u = q / 120; x = x0 + (x1 - x0) * u - ox; y = y0 - (y0 - y1) * u + math.sin(u * 3) * 4 - oy
            wd = 2 if u < .55 else 1
            s.put(x, y, cane[3]); s.put(x + 1, y, cane[2])
            if wd == 2: s.put(x - 1, y, cane[4]); s.put(x + 2, y, cane[1])
            if kind in ('blackberry', 'gooseberry') and q % 14 == 6: s.put(x + 2 + wd, y - 1, '#e8d8c0')
            if q in (40, 62, 84, 104) : pts.append((x, y, -1 if x1 < 90 else 1 if x1 > 90 else (1 if q % 2 else -1), ci, q))
    for (x, y, sd, ci, q) in pts:   # leaves sitting on the canes, pointing outwards and a little up
        for side in (sd, -sd) if q in (62, 104) else (sd,):
            a = (-.55 if side > 0 else math.pi + .55) + (hx(ci, q) - .5) * .5
            px, py = x + math.cos(a) * 2, y + math.sin(a) * 2
            s.put(x + side, y - 1, P[3])
            leaflet(s, px, py, a, 12, 4.6, P)
    s.outline(P[0]); return s, (0, 0)
for k in ('raspberry', 'blackberry', 'gooseberry', 'blueberry', 'currant'):
    s, o = bush(k); add('bush_' + k, s, o)
def drupe(kind, ripe):
    if kind == 'raspberry': C = ['#5a0a1e', '#8a1a34', '#c02848', '#e8405e', '#ff7a92', '#ffc0cc'] if ripe else ['#6a5a3a', '#a88a6a', '#c8aa88', '#e0c8a8', '#f0dcc0', '#fff4e4']
    else: C = ['#10061a', '#24102e', '#3a1a4a', '#56306a', '#8a6aaa', '#c0a8dc'] if ripe else ['#5a0a0a', '#8a1a1a', '#b82a2a', '#d84030', '#ff7a6a', '#ffc0b0']
    s = S(15, 17)
    for (cx, cy) in [(4, 6), (7, 5), (10, 6), (3, 9), (6, 9), (9, 9), (11, 9), (4, 12), (7, 12), (10, 12), (5, 15), (8, 15), (7, 7.5), (7, 10.5), (5.5, 13.5), (8.5, 13.5)]:
        ball(s, cx + .5, cy, 1.9, 1.9, C)
    for (x, y, c) in ((6, 1, G6[3]), (7, 0, G6[3]), (7, 1, G6[4]), (8, 1, G6[3]), (4, 3, G6[3]), (5, 2, G6[4]), (6, 3, G6[4]), (9, 2, G6[4]), (10, 3, G6[3]), (8, 3, G6[4])): s.put(x, y, c)
    s.outline(C[0]); return s, (7, 9)
for kind in ('raspberry', 'blackberry'):
    for r in (True, False):
        s, o = drupe(kind, r); add(kind[:4] + ('' if r else '_u'), s, o)
def smallball(rx, ry, C, crown=None):
    s = S(int(rx * 2 + 4), int(ry * 2 + 5)); cx, cy = rx + 2, ry + 3
    ball(s, cx, cy, rx, ry, C); s.put(cx - rx * .4, cy - ry * .45, C[5])
    if crown == 'blue':
        for (dx, dy) in ((-1, -ry), (0, -ry - .5), (1, -ry)): s.put(cx + dx - .5, cy + dy, C[1])
    if crown == 'stripe':
        for v in (-3, 0, 3):
            for y in range(int(cy - ry + 2), int(cy + ry - 1)): 
                if s.get(cx + v, y): s.put(cx + v, y, C[4] if v < 0 else C[3])
        s.put(cx, cy - ry - 1, '#5a4a2a'); s.put(cx, cy - ry - 2, '#5a4a2a')
    s.outline(C[0]); return s, (int(cx), int(cy))
for (n, rx, ry, Cr, Cu, cr) in (
    ('blue', 4.2, 4.2, ['#141a40', '#24306a', '#3a4c9a', '#5a6ec8', '#8aa0e8', '#d0dcf8'], ['#3a5a20', '#5a7a2a', '#8ab050', '#b0d070', '#d0e898', '#f0f8d0'], 'blue'),
    ('curr', 3.2, 3.2, ['#5a0808', '#8a1018', '#c01c28', '#e8303a', '#ff7a7a', '#ffc8c8'], ['#3a5a20', '#5a7a2a', '#88a858', '#a8c878', '#c8e098', '#f0f8d0'], None),
    ('goos', 6, 7, ['#4a5a1a', '#7a8a2a', '#a0b440', '#c8d860', '#e4ec90', '#fafcd0'], ['#2e5a1e', '#4a7a2a', '#6a9a38', '#8ab848', '#b0d870', '#e0f4b0'], 'stripe')):
    s, o = smallball(rx, ry, Cr, cr); add(n, s, o)
    s, o = smallball(rx, ry, Cu, cr); add(n + '_u', s, o)
json.dump(OUT, open('rest.json', 'w'))
# preview sheet
pv = Image.new('RGBA', (560, 300), (110, 80, 50, 255)); xs, ys, rowh = 2, 2, 0
import sys
for n, d in [(k, v) for k, v in OUT.items() if k.startswith('bush') ]:
    h_ = len(d['r']); w_ = len(d['r'][0]); im = Image.new('RGBA', (w_, h_), (0, 0, 0, 0))
    for y, r in enumerate(d['r']):
        for x, ch in enumerate(r):
            if ch in d['p']: c = d['p'][ch]; im.putpixel((x, y), tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) + (255,))
    if xs + w_ > 560: xs = 2; ys += rowh + 3; rowh = 0
    if ys + h_ > 300: continue
    pv.alpha_composite(im, (xs, ys)); xs += w_ + 3; rowh = max(rowh, h_)
pv.resize((1680, 900), Image.NEAREST).save('rest_prev.png')
