# indoor potted plants at double resolution (48 x 72 art, shown 24 x 36 scene units)
import sys, json, math, random, re
sys.path.insert(0, '../wild'); from lib import G
from meadow2 import line, curve, rell, leaf, serrate_leaf, bez
from PIL import Image, ImageDraw
pal = dict(K='#3a2414')
def C(n, h): pal[n] = h
for n, h in dict(g1='#5aa04e', g2='#3e7c3c', g3='#8ccc72', g4='#2e6030', g5='#b4e08e', tc='#c9744a', tc2='#a85a34', tc3='#e0946a', soil='#5a3a22', soil2='#3e2614',
                 wc='#f4f1ea', wc2='#d4cfc4', wc3='#ffffff', bl='#4f86c6', bl2='#36639a', bl3='#86b2e2', br='#8a5a30', br2='#5e3a1c', br3='#a8743e', bk='#d8b47a', bk2='#b08a50', bk3='#ecd09a',
                 ye='#ffd34e', ye2='#e0a820', ye3='#fff09a', pk='#f29aa8', pk2='#d86a80', pk3='#ffd0dc', rd='#e8554a', rd2='#b83a30', pu='#9a7ad0', pu2='#6e52a8', pu3='#c4a8ec',
                 gl='#cfe8f5', gl2='#a8d0e8', gl3='#f2fbff', st='#9a9aa6', st2='#6e6e7a', st3='#bcbcc6', cr='#fff4dc', crm='#efe2c4', sp='#e8f0d8', org='#f0a030', wat='#8cc4e8').items(): C(n, h)
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k, v in g.paths().items())
def soft_outline(g):
    def f(x, y): return 0 <= x < g.w and 0 <= y < g.h and g.p[y][x] is not None
    thick = set()
    for y in range(g.h - 1):
        for x in range(g.w - 1):
            if f(x, y) and f(x + 1, y) and f(x, y + 1) and f(x + 1, y + 1): thick.update([(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)])
    add = [(x, y) for y in range(g.h) for x in range(g.w) if not f(x, y) and any((x + dx, y + dy) in thick for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in add: g.p[y][x] = 'K'
W, H = 48, 72
pal.update(dict(cop='#c8784a', cop2='#9a5430', cop3='#eaa070', bar='#9a6a3a', bar2='#744a22', bar3='#b8884e', hoop='#4a4a52', glz='#6a8a5a', glz2='#4e6a42', glz3='#8aaa78'))
pal.update(dict(clay_='#c8744a', clay2_='#a05634', clay3_='#e09068', scr_='#f0e2c0', rd_='#c8463c', tom='#e2483a', tom2='#b8302a', stake='#a8845c'))
def pot(kind):
    g = G(W, H)
    if kind == 'crock':
        g.poly([(12, 52), (36, 52), (35, 70), (13, 70)], 'clay_'); g.rect(11, 50, 36, 53, 'clay_'); g.rect(11, 50, 36, 50, 'clay3_'); g.rect(13, 51, 34, 52, 'soil')
        g.rect(13, 58, 35, 61, 'glz'); g.rect(13, 61, 35, 61, 'glz2'); g.px('glz3', [(15, 58), (16, 58)])
        for y in range(54, 70): g.put(31, y, 'clay2_'); g.put(32, y, 'clay2_'); g.put(15, y, 'clay3_')
        g.outline('K'); return g
    if kind == 'barrel':
        g.poly([(11, 51), (37, 51), (38, 61), (37, 71), (11, 71), (10, 61)], 'bar')
        for x in range(13, 37, 4): g.rect(x, 52, x, 70, 'bar2')
        for y in (54, 67): g.rect(10, y, 38, y + 1, 'hoop')
        g.rect(12, 51, 36, 52, 'soil'); g.px('bar3', [(15, 58), (15, 59), (23, 62), (31, 57)])
        g.outline('K'); return g
    if kind == 'copper':
        g.poly([(12, 53), (36, 53), (34, 69), (14, 69)], 'cop'); g.rect(10, 51, 37, 53, 'cop3'); g.rect(12, 51, 35, 51, 'soil')
        for y in range(55, 68): g.put(16, y, 'cop3'); g.put(31, y, 'cop2'); g.put(32, y, 'cop2')
        rell(g, 9, 58, 2, 3, 0, 'cop2'); rell(g, 38, 58, 2, 3, 0, 'cop2'); g.rect(14, 70, 34, 71, 'cop2')
        g.outline('K'); return g
    if kind == 'jug':
        g.poly([(17, 44), (30, 44), (34, 56), (32, 71), (15, 71), (13, 56)], 'clay_'); g.rect(17, 44, 30, 45, 'clay2_')
        rell(g, 35, 54, 3, 6, 0, 'clay_'); rell(g, 35, 54, 1.4, 4, 0, None) if False else None
        g.rect(14, 58, 33, 60, 'scr_'); g.px('rd_', [(17, 59), (21, 59), (25, 59), (29, 59)])
        for y in range(47, 70): g.put(17, y, 'clay3_')
        g.outline('K'); return g
    if kind == 'herbbox':
        g.rect(4, 56, 43, 70, 'bar'); g.rect(4, 56, 43, 57, 'bar3'); g.rect(5, 55, 42, 56, 'soil')
        for x in (17, 30): g.rect(x, 58, x, 70, 'bar2')
        g.rect(8, 61, 14, 64, 'scr_'); g.rect(21, 61, 27, 64, 'scr_'); g.rect(33, 61, 39, 64, 'scr_')
        g.outline('K'); return g
    if kind == 'terra':
        g.poly([(12, 54), (36, 54), (34, 71), (14, 71)], 'tc'); g.rect(10, 50, 37, 55, 'tc'); g.rect(10, 50, 37, 50, 'tc3'); g.rect(10, 55, 37, 56, 'tc2')
        g.rect(12, 51, 35, 52, 'soil'); g.px('soil2', [(15, 52), (22, 51), (30, 52)])
        for y in range(57, 70): g.put(16, y, 'tc3'); g.put(32 - (y - 57) // 7, y, 'tc2'); g.put(33 - (y - 57) // 7, y, 'tc2')
    elif kind == 'white':
        g.poly([(12, 52), (36, 52), (34, 71), (14, 71)], 'wc'); g.rect(12, 52, 35, 54, 'wc2'); g.rect(13, 52, 34, 53, 'soil')
        for y in range(56, 70): g.put(31, y, 'wc2'); g.put(32, y, 'wc2'); g.put(15, y, 'wc3')
        for x in range(15, 33, 4): g.put(x, 62, 'bl3'); g.put(x + 1, 63, 'bl3')
    elif kind == 'blue':
        g.poly([(10, 52), (38, 52), (34, 71), (14, 71)], 'bl'); g.rect(10, 52, 37, 54, 'bl3'); g.rect(12, 52, 35, 52, 'soil')
        for y in range(56, 70): g.put(31, y, 'bl2'); g.put(32, y, 'bl2'); g.put(15, y, 'bl3')
        for x in range(13, 36, 3): g.put(x, 60, 'wc'); 
    elif kind == 'tray':
        g.rect(6, 62, 41, 68, 'bl2'); g.rect(6, 62, 41, 62, 'bl3'); g.rect(7, 63, 40, 64, 'soil'); g.px('st', [(12, 63), (30, 63), (31, 63)]); g.px('g3', [(16, 63), (17, 63), (26, 63)])
        g.rect(8, 69, 12, 70, 'bl2'); g.rect(35, 69, 39, 70, 'bl2')
    elif kind == 'stone':
        g.poly([(10, 50), (38, 50), (36, 71), (12, 71)], 'st'); g.rect(10, 50, 37, 52, 'st2'); g.rect(12, 50, 35, 50, 'soil')
        g.px('st2', [(17, 58), (18, 58), (27, 63), (22, 67), (31, 57)]); g.px('st3', [(14, 55), (14, 56), (25, 60)])
    elif kind == 'cream':
        g.poly([(12, 54), (36, 54), (32, 71), (16, 71)], 'cr'); g.rect(12, 54, 35, 56, 'crm'); g.rect(14, 54, 33, 54, 'soil')
        g.rect(13, 61, 34, 62, 'pk'); g.px('pk2', [(x, 62) for x in range(14, 34, 3)])
    elif kind == 'box':
        g.rect(4, 54, 43, 70, 'br'); g.rect(4, 54, 43, 55, 'bk'); g.rect(4, 62, 43, 62, 'br2'); g.rect(5, 54, 42, 54, 'bk3')
        for x in (14, 33): g.rect(x, 56, x, 70, 'br2')
        for y in (58, 66): g.put(8, y, 'br3'); g.put(24, y + 1, 'br3'); g.put(38, y, 'br3')
    elif kind == 'vase':
        g.poly([(16, 44), (31, 44), (35, 58), (31, 71), (16, 71), (12, 58)], 'gl'); g.rect(15, 58, 32, 70, 'wat')
        for y in range(47, 68): g.put(17, y, 'gl3')
        g.rect(16, 44, 31, 45, 'gl2')
    elif kind == 'basket':
        g.poly([(8, 52), (40, 52), (36, 71), (12, 71)], 'bk')
        for y in range(52, 72):
            for x in range(8, 41):
                if g.p[y][x] and ((x // 2 + y // 2) % 2 == 0): g.p[y][x] = 'bk2'
        g.rect(8, 51, 39, 53, 'bk3'); g.rect(8, 53, 39, 53, 'bk2')
    g.outline('K'); return g

def cactus(g):
    # saguaro-like columns with ribs, spines and a pink bloom
    def col(cx, top, bot, r):
        for y in range(top, bot + 1):
            rr = r if y > top + r else math.sqrt(max(0, r * r - (top + r - y) ** 2))
            for x in range(int(cx - rr), int(cx + rr) + 1): g.put(x, y, 'g1')
        for x in (cx - r * 0.5, cx + r * 0.4):
            for y in range(top + 2, bot): g.put(x, y, 'g2')
        for y in range(top + 2, bot, 1): g.put(cx - r * 0.75, y, 'g3')
        for y in range(top + 3, bot, 4): g.px('sp', [(cx - r - 1, y), (cx + r + 1, y + 2), (cx - 1, y + 1)])
    col(24, 12, 55, 7); col(12, 24, 40, 3.5); g.rect(12, 38, 18, 41, 'g1'); col(36, 18, 34, 3.5); g.rect(30, 32, 36, 35, 'g1')
    for a in range(0, 360, 60): rell(g, 24 + math.cos(math.radians(a)) * 2.4, 10 + math.sin(math.radians(a)) * 1.6, 1.8, 1.4, a, 'pk')
    g.px('pk2', [(23, 10), (25, 11)]); g.put(24, 10, 'ye')
def monstera(g):
    stems = [((24, 54), (14, 38), (10, 24)), ((24, 54), (30, 34), (34, 14)), ((24, 54), (20, 30), (22, 8)), ((24, 54), (36, 44), (42, 34)), ((24, 54), (10, 48), (5, 42))]
    for p0, p1, p2 in stems: curve(g, p0, p1, p2, 'g2')
    for (cx, cy, rx, ry, ang) in [(10, 22, 9, 7, -20), (34, 13, 10, 7.6, 15), (22, 8, 8, 6.2, 0), (41, 33, 7, 5, 30), (6, 41, 6.4, 4.6, -30)]:
        rell(g, cx, cy, rx, ry, ang, 'g1')
        a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
        def at(u, v): return cx + u * ca - v * sa, cy + u * sa + v * ca
        # deep slits from the edge toward the midrib, and a row of small holes
        for k in (-2.2, -1.1, 0.0, 1.1, 2.2):
            u = k * rx / 3.2
            for side in (1, -1):
                lim = ry * math.sqrt(max(0, 1 - (u / rx) ** 2))
                for t in range(0, 7):
                    v = side * (lim - t * 0.5)
                    if abs(v) < lim * 0.45: break
                    x, y = at(u + side * t * 0.25, v); g.put(x, y, None)
        for k in (-1.6, -0.55, 0.55, 1.6):
            for side in (1, -1):
                x, y = at(k * rx / 3.2, side * ry * 0.3); g.put(x, y, None)
        x0, y0 = at(-rx * 0.9, 0); x1, y1 = at(rx * 0.85, 0); line(g, x0, y0, x1, y1, 'g2')
        x, y = at(-rx * 0.35, -ry * 0.55); g.put(x, y, 'g3'); g.put(x + 1, y, 'g5')
def sunflower(g):
    curve(g, (24, 54), (25, 36), (24, 20), 'g2'); curve(g, (23, 54), (24, 36), (23, 20), 'g2')
    serrate_leaf(g, 24, 42, 11, 3.4, 200, 'g1', 'g2'); serrate_leaf(g, 24, 34, 10, 3, -25, 'g1', 'g2'); serrate_leaf(g, 24, 48, 8, 2.6, -10, 'g1', 'g2')
    for a in range(0, 360, 20):
        r = math.radians(a); rell(g, 24 + math.cos(r) * 8.5, 15 + math.sin(r) * 8, 3.2, 1.6, a, 'ye' if a % 40 else 'ye2')
    for a in range(10, 370, 40):
        r = math.radians(a); g.put(24 + math.cos(r) * 10, 15 + math.sin(r) * 9.5, 'ye3')
    rell(g, 24, 15, 6, 5.6, 0, 'br'); 
    for y in range(10, 21):
        for x in range(18, 31):
            if g.p[y][x] == 'br' and (x + y) % 2 == 0: g.p[y][x] = 'br2'
    g.px('br3', [(22, 12), (23, 12), (21, 13)])
def bonsai(g):
    # twisted trunk with cloud-shaped pads
    pts = curve(g, (24, 62), (14, 50), (22, 40), 'br'); curve(g, (25, 62), (15, 50), (23, 40), 'br'); curve(g, (26, 61), (16, 50), (24, 40), 'br2')
    curve(g, (22, 40), (30, 34), (24, 26), 'br'); curve(g, (23, 40), (31, 34), (25, 26), 'br')
    curve(g, (20, 46), (10, 42), (8, 34), 'br'); curve(g, (24, 34), (36, 32), (38, 26), 'br')
    for (cx, cy, rx, ry) in [(10, 30, 8, 4.6), (24, 20, 10, 5.6), (38, 23, 7.6, 4.4), (17, 38, 5, 3)]:
        rell(g, cx, cy, rx, ry, 0, 'g1'); rell(g, cx + 1, cy + ry * 0.45, rx * 0.8, ry * 0.4, 0, 'g2'); rell(g, cx - rx * 0.3, cy - ry * 0.3, rx * 0.45, ry * 0.4, 0, 'g3')
        rnd = random.Random(int(cx * 10 + cy))
        for k in range(int(rx * 1.6)): g.put(cx + rnd.uniform(-rx, rx) * 0.8, cy + rnd.uniform(-ry, ry) * 0.6, rnd.choice(['g5', 'g2', 'g4']))
def zz(g):
    # Glücksfeder: upright stems with glossy oval leaflets in pairs
    for (x0, ang, ln) in [(22, -14, 40), (26, 12, 44), (18, -32, 30), (30, 34, 32), (24, 0, 48)]:
        a = math.radians(ang); pts = []
        for t in range(ln):
            x = x0 + math.sin(a) * t; y = 55 - math.cos(a) * t; pts.append((x, y)); g.put(x, y, 'g2'); g.put(x + 1, y, 'g4')
        for t in range(8, ln - 2, 5):
            x, y = pts[t]; s = 1 - t / ln * 0.4
            rell(g, x - 3.4 * s - 0.5, y - 1, 3.2 * s, 1.6 * s, -25 - ang, 'g1'); rell(g, x + 4 * s, y - 1, 3.2 * s, 1.6 * s, 25 - ang, 'g1')
            g.put(x - 4 * s, y - 2, 'g5'); g.put(x + 4 * s, y - 2, 'g5')
        x, y = pts[-1]; rell(g, x, y - 2, 1.6, 3, ang, 'g1'); g.put(x, y - 3, 'g5')
def spider(g):
    # Grünlilie: long narrow arching leaves with a cream stripe, two runners with baby plants hanging over the pot
    for ang in (-78, -58, -40, -24, -10, 6, 20, 36, 54, 74):
        a = math.radians(ang); ln = 30 - abs(ang) * 0.08
        end = (24 + math.sin(a) * ln * 0.95, 52 - math.cos(a) * ln * 0.5 + (abs(ang) > 30) * ln * 0.45)
        pts = bez((24, 52), (24 + math.sin(a) * ln * 0.45, 52 - math.cos(a) * ln * 0.95), end, 60)
        for k, (x, y) in enumerate(pts):
            g.put(x, y, 'cr' if k < 52 else 'g1')
            nx, ny = (-math.cos(a), -math.sin(a) * 0.5)
            if k < 50: g.put(x + (1 if ang < 0 else -1), y + (0 if abs(ang) > 45 else 1), 'g1' if (ang // 10) % 2 else 'g2')
    for side in (1, -1):
        curve(g, (24 + side * 4, 48), (24 + side * 20, 42), (24 + side * 19, 62), 'g3')
        for ang in range(-70, 71, 35):
            a = math.radians(ang)
            for t in range(5): g.put(24 + side * 19 + math.sin(a) * t, 62 - math.cos(a) * t * 0.9, 'g1')
def lavender(g):
    rnd = random.Random(3)
    for k in range(14):
        x0 = 8 + k * 2.4; top = rnd.randint(4, 18); lean = rnd.uniform(-3, 3)
        pts = curve(g, (24 + (x0 - 24) * 0.4, 56), (x0, 36), (x0 + lean, top + 10), 'g2')
        for j in range(9):
            y = top + j * 1.3; x = x0 + lean - j * lean * 0.05
            g.put(x - 1, y, 'pu' if j % 2 else 'pu2'); g.put(x + 1, y + 0.6, 'pu2' if j % 2 else 'pu'); g.put(x, y - 0.5, 'pu3' if j % 3 == 0 else 'pu')
    for k in range(10):
        x = rnd.uniform(10, 38); leaf(g, x, 56, rnd.uniform(6, 9), 0.9, rnd.choice([-110, -70, -100, -80]), 'g3')
def tulips(g):
    for (x, top, c, c2, c3, bend) in [(16, 18, 'rd', 'rd2', 'pk3', -4), (24, 8, 'pk', 'pk2', 'pk3', 0), (32, 16, 'ye', 'ye2', 'ye3', 4), (20, 26, 'pu', 'pu2', 'pu3', -2), (29, 24, 'rd', 'rd2', 'pk3', 3)]:
        curve(g, (24, 58), (24 + bend * 0.3, (top + 58) / 2), (x, top + 6), 'g2')
        rell(g, x - 2, top + 3, 2.6, 4.2, -8, c); rell(g, x + 2, top + 3, 2.6, 4.2, 8, c); rell(g, x, top + 2, 2.4, 4.6, 0, c2)
        g.put(x - 3, top + 1, c3); g.put(x - 3, top + 2, c3); g.px(c, [(x - 1, top - 2), (x + 1, top - 2)])
    for (x, ang) in [(20, -100), (28, -80), (24, -95)]: leaf(g, x, 46, 14, 2.2, ang, 'g1', 'g2')
def lemon(g):
    curve(g, (24, 54), (22, 44), (24, 30), 'br'); curve(g, (25, 54), (23, 44), (25, 30), 'br'); curve(g, (24, 40), (16, 36), (14, 30), 'br'); curve(g, (24, 36), (32, 33), (34, 27), 'br')
    rell(g, 24, 18, 18, 14, 0, 'g1')
    rnd = random.Random(5)
    for k in range(70):
        a = rnd.uniform(0, 6.28); d = rnd.uniform(0, 1) ** 0.6
        x = 24 + math.cos(a) * d * 17; y = 18 + math.sin(a) * d * 13
        rell(g, x, y, 1.8, 1.0, rnd.uniform(0, 180), rnd.choice(['g1', 'g2', 'g3', 'g1']))
    for k in range(18):
        a = rnd.uniform(0, 6.28); x = 24 + math.cos(a) * 17.5; y = 18 + math.sin(a) * 13.5; rell(g, x, y, 1.8, 1.0, math.degrees(a) + 90, 'g1')
    for (x, y) in [(14, 18), (30, 10), (34, 22), (20, 26), (26, 14), (10, 24)]:
        rell(g, x + .5, y + .5, 2.6, 2.1, 0, 'ye'); g.put(x + 1, y + 2, 'ye2'); g.put(x + 2, y + 1, 'ye2'); g.put(x - 1, y, 'ye3'); g.put(x + 3, y, 'g2')
    for (x, y) in [(18, 8), (36, 16)]: g.px('wc', [(x, y), (x + 1, y), (x, y + 1)])
def fern(g):
    fronds = [((22, 52), (4, 34), (1, 50)), ((26, 52), (44, 34), (47, 50)), ((23, 52), (8, 14), (4, 24)), ((25, 52), (40, 14), (44, 24)), ((24, 52), (18, 10), (28, 4))]
    for fi, (p0, p1, p2) in enumerate(fronds):
        pts = bez(p0, p1, p2, 200); L = [0]
        for a, b in zip(pts, pts[1:]): L.append(L[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
        tot = L[-1]; nxt = tot * 0.1
        for k in range(1, len(pts) - 1):
            if L[k] < nxt: continue
            nxt += 3.2; t = L[k] / tot
            x, y = pts[k]; dx, dy = pts[k + 1][0] - pts[k - 1][0], pts[k + 1][1] - pts[k - 1][1]; d = math.hypot(dx, dy) or 1; dx, dy = dx / d, dy / d
            size = 6 * (math.sin(math.pi * min(1, t * 1.1)) ** 0.7) + 0.6
            for sgn in (1, -1):
                ox, oy = -dy * sgn, dx * sgn
                ex, ey = x + (ox * 0.85 + dx * 0.5) * size, y + (oy * 0.85 + dy * 0.5) * size
                line(g, x, y, ex, ey, 'g1')
                if size > 2.2: line(g, x + dx * 0.9, y + dy * 0.9, x + dx * 0.9 + (ox * 0.85 + dx * 0.5) * size * 0.75, y + dy * 0.9 + (oy * 0.85 + dy * 0.5) * size * 0.75, 'g2' if sgn > 0 else 'g1')
                g.put(round(ex), round(ey), 'g3')
        for a, b in zip(pts, pts[1:]): line(g, a[0], a[1], b[0], b[1], 'g2')
def geraniums(g):
    for (x, ang) in [(14, 200), (20, 230), (28, -50), (34, -20), (24, 260)]:
        for k in range(3): pass
        rell(g, x + (5 if ang < 0 else -5) * 0.6, 44 - (ang == 260) * 6, 5, 4, 0, 'g1'); g.put(x, 44, 'g3')
    for (x, y) in [(13, 40), (33, 41), (23, 36), (18, 46), (30, 46)]: rell(g, x, y, 4.2, 3.4, 0, 'g1'); rell(g, x + 1, y + 1, 2.4, 1.6, 0, 'g2'); g.put(x - 1, y - 1, 'g3')
    for (x, y) in [(14, 20), (24, 12), (34, 19), (19, 27), (30, 27)]:
        curve(g, (24, 50), (x, y + 12), (x, y + 3), 'g2')
        for a in range(0, 360, 50): rell(g, x + math.cos(math.radians(a)) * 2.6, y + math.sin(math.radians(a)) * 2.4, 1.8, 1.6, 0, 'rd')
        g.px('pk3', [(x - 1, y - 1)]); g.put(x, y, 'rd2'); g.put(x + 1, y + 1, 'rd2')
def rosemary(g):
    rnd = random.Random(8)
    for k in range(13):
        x0 = 12 + k * 2; top = rnd.randint(6, 20); lean = rnd.uniform(-5, 5)
        pts = curve(g, (24 + (x0 - 24) * 0.3, 52), (x0, 34), (x0 + lean, top), 'br2')
        for j, (x, y) in enumerate(pts[::2]):
            if y < 48: g.put(x - 1, y, 'g2' if j % 2 else 'g1'); g.put(x + 1, y + 0.5, 'g1' if j % 2 else 'g3')
        if k % 3 == 0: g.put(x0 + lean, top - 1, 'pu3'); g.put(x0 + lean + 1, top, 'pu')
def ivy(g):
    # ivy spilling over the rim and trailing down the pot
    for side in (-1, 1):
        for vine in range(3):
            pts = curve(g, (24 + side * 4, 50), (24 + side * (14 + vine * 3), 40 - vine * 6), (24 + side * (16 + vine * 2), 58 + vine * 4), 'g2')
            for j in range(4, len(pts), 5):
                x, y = pts[j]
                rell(g, x, y, 2.4, 2, side * 30, 'g1' if j % 2 else 'g3'); g.put(x, y, 'g2')
    for (x, y) in [(20, 40), (28, 38), (24, 32), (16, 44), (32, 44)]: rell(g, x, y, 3, 2.4, 0, 'g1'); g.put(x, y + 1, 'g2'); g.put(x - 1, y - 1, 'g3')
def tomato(g):
    g.rect(31, 6, 32, 54, 'stake'); g.rect(32, 6, 32, 54, 'br2')
    pts = curve(g, (24, 52), (20, 30), (28, 10), 'g2')
    for j in range(3, len(pts), 6):
        x, y = pts[j]; side = 1 if (j // 6) % 2 else -1
        serrate_leaf(g, x, y, 7, 2, 180 + side * -160 if side > 0 else 200, 'g1', 'g2') if side < 0 else serrate_leaf(g, x, y, 7, 2, -20, 'g1', 'g2')
    for (x, y) in [(22, 30), (27, 24), (19, 40), (26, 38), (23, 18)]: rell(g, x, y, 2.6, 2.4, 0, 'tom'); g.put(x - 1, y - 1, 'pk3'); g.put(x + 1, y + 1, 'tom2'); g.put(x, y - 3, 'g2')
    for y in (16, 30, 44): g.rect(28, y, 31, y, 'scr_')
def wildflowers(g):
    for (x, top, c, c2) in [(16, 14, 'ye', 'ye2'), (22, 6, 'wc', 'pk'), (28, 10, 'pu', 'pu2'), (32, 18, 'rd', 'rd2'), (19, 22, 'pk', 'pk2'), (26, 18, 'ye', 'org'), (12, 24, 'wc', 'ye')]:
        curve(g, (24, 46), (24 + (x - 24) * 0.4, (top + 46) / 2), (x, top + 2), 'g2')
        for a in range(0, 360, 60): g.put(x + math.cos(math.radians(a)) * 1.8, top + math.sin(math.radians(a)) * 1.6, c)
        g.put(x, top, c2)
    for (x, ang) in [(18, -110), (30, -70), (22, -95), (27, -85)]: leaf(g, x, 46, 9, 1.4, ang, 'g1', 'g2')
    for k in range(5): g.put(14 + k * 5, 30 + (k % 2) * 4, 'g3')
def apple(g):
    lemon(g)
    for y in range(g.h):
        for x in range(g.w):
            if g.p[y][x] == 'ye': g.p[y][x] = 'rd'
            elif g.p[y][x] == 'ye2': g.p[y][x] = 'rd2'
            elif g.p[y][x] == 'ye3': g.p[y][x] = 'pk3'
def herbbox(g):
    # three herbs growing out of the soil: bushy basil, chives with purple pompoms, curly parsley
    rnd = random.Random(3)
    # basil: short stems with pairs of rounded, pointed leaves, rooted in the soil
    for k, (sx, top, lean) in enumerate([(7, 40, -4), (12, 34, 0), (16, 42, 3)]):
        pts = curve(g, (sx, 55), (sx + lean * 0.3, (55 + top) / 2), (sx + lean, top), 'g2')
        for f, sz in ((0.35, 4.6), (0.7, 3.8)):
            x, y = pts[int(len(pts) * f)]
            for ang, c in ((215, 'g1'), (-35, 'g3')):
                leaf(g, x, y, sz, sz * 0.42, ang, c, 'g2')
        x, y = pts[-1]; leaf(g, x, y + 1, 3.4, 1.4, -90, 'g1', 'g2')
    # chives: a tuft of thin hollow leaves with round purple flower heads
    for k in range(10):
        x = 20 + k * 0.9; top = rnd.randint(28, 38)
        curve(g, (x, 55), (x + (k - 4.5) * 0.2, 46), (x + (k - 4.5) * 0.7, top), 'g2' if k % 2 else 'g1')
        if k in (2, 6, 8):
            fx = x + (k - 4.5) * 0.7; rell(g, fx, top - 1.5, 2, 2, 0, 'pu3'); g.put(fx - 1, top - 2, 'pu'); g.put(fx + 1, top - 1, 'pu2')
    # parsley: stems fanning out, each ending in a clump of small toothed leaflets
    for k, (ex, ey) in enumerate([(31, 40), (35, 34), (39, 39), (34, 44), (40, 46)]):
        curve(g, (36, 55), (36 + (ex - 36) * 0.4, (55 + ey) / 2 + 2), (ex, ey), 'g2')
        for a in range(0, 360, 60):
            r = math.radians(a); x = ex + math.cos(r) * 2; y = ey + math.sin(r) * 1.7
            rell(g, x, y, 1.4, 1.2, 0, 'g1'); g.put(x + math.cos(r), y + math.sin(r), 'g3' if a % 120 else 'g1')
        g.put(ex, ey, 'g2')
PLANTS = [('cactus', 'Geranien im Tontopf', 'crock', geraniums), ('monstera', 'Monstera im Fass', 'barrel', monstera), ('sunflower', 'Sonnenblume im Fass', 'barrel', sunflower), ('bonsai', 'Kräuterkiste', 'herbbox', herbbox),
          ('zz', 'Rosmarin im Kupfertopf', 'copper', rosemary), ('spider', 'Tomatenstaude', 'crock', tomato), ('lavender', 'Lavendel', 'box', lavender), ('tulips', 'Wildblumen im Krug', 'jug', wildflowers),
          ('lemon', 'Apfelbäumchen', 'barrel', apple), ('fern', 'Farn im Korb', 'basket', fern)]
PS = 40 / 48   # shown 40 x 60 scene units, close to the hamster's pixel size
def half(svg): return '<g transform="scale(%.4f)">' % PS + svg + '</g>'
out = []
for pid, name, potk, fn in PLANTS:
    pg = pot(potk); fg = G(W, H); fn(fg)
    if pid == 'fern': fg.outline('K') if False else None
    soft_outline(fg)
    oy = max([y for y in range(H) for x in range(W) if fg.p[y][x]] or [52])
    out.append(dict(id=pid, name=name, w=40, h=60, svg=half(paths(pg)), leaves=[dict(svg=half(paths(fg)), ox=20, oy=round(min(oy + 1, 60) * PS, 1))], fg_first=pid in ('tulips',)))
json.dump(out, open('plants.json', 'w'), ensure_ascii=False)
sc = 4; sheet = Image.new('RGB', (10 * (W * sc + 10), H * sc + 10), '#fbe9d4'); d = ImageDraw.Draw(sheet)
for i, (pid, name, potk, fn) in enumerate(PLANTS):
    pg = pot(potk); fg = G(W, H); fn(fg); soft_outline(fg)
    order = (fg, pg) if pid in ('tulips', 'spider') else (pg, fg)
    for gg in order:
        for y in range(H):
            for x in range(W):
                c = gg.p[y][x]
                if c: d.rectangle([i * (W * sc + 10) + x * sc, 5 + y * sc, i * (W * sc + 10) + x * sc + sc - 1, 5 + y * sc + sc - 1], fill=pal[c])
sheet.save('plants.png'); print('ok')
