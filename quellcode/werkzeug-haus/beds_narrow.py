# narrower versions of the seven beds (W = 66 instead of ~97) so they fit between night stand and chest
import math, random
from beds_lib import G, C, pal, rell, line, quilt, mkg
W = 66; M = W // 2
def canopy_back(g):
    for x in (0, W - 4): g.rect(x, 4, x + 3, 78, 'wd'); g.rect(x + 1, 4, x + 1, 78, 'wd3'); rell(g, x + 1.5, 3, 2.6, 2.4, 0, 'wd3')
    g.rect(0, 6, W - 1, 12, 'gp'); g.rect(0, 6, W - 1, 7, 'gp2')
    for x in range(0, W, 6): rell(g, x + 3, 13, 3, 2.4, 0, 'gp')
    for x in range(0, W, 4):
        for y in range(8, 12): g.put(x + (y % 2) * 2, y, 'gp2')
    for (x0, s) in ((4, 1), (W - 5, -1)):
        g.poly([(x0, 12), (x0 + 11 * s, 12), (x0 + 4 * s, 46), (x0 + 2 * s, 60), (x0, 60)], 'gp')
        for y in range(14, 58, 3): g.put(x0 + (3 + (y // 3) % 2) * s, y, 'gp2')
        rell(g, x0 + 4 * s, 46, 3, 2, 0, 'gp3')
    g.rect(6, 40, W - 7, 56, 'wd'); g.rect(6, 40, W - 7, 41, 'wd3'); g.rect(9, 43, W - 10, 53, 'wd2'); g.rect(10, 44, W - 11, 52, 'wd')
    rell(g, M - .5, 47, 4, 3.4, 0, 'gp3'); g.poly([(M - 4.5, 48), (M + 3.5, 48), (M - .5, 53)], 'gp3')
    g.rect(8, 54, W - 9, 64, 'pil2'); rell(g, M, 55, 14, 5, 0, 'pil'); g.put(M - 9, 53, 'wh')
def canopy_front(g):   # 66 wide, both front posts
    quilt(g, 4, 4, W - 5, 18, ('gp', 'qb', 'gp2', 'qb')); g.rect(4, 19, W - 5, 20, 'pil2')
    g.rect(0, 21, W - 1, 26, 'wd'); g.rect(0, 21, W - 1, 21, 'wd3')
    for x in (0, W - 4): g.rect(x, 0, x + 3, 30, 'wd'); g.rect(x + 1, 0, x + 1, 30, 'wd3'); rell(g, x + 1.5, 0, 2.6, 2.4, 0, 'wd3')
def nest_back(g):
    rell(g, M, 36, M - 1, 20, 0, 'wv2'); rell(g, M, 33, M - 5, 16, 0, 'wv')
    for y in range(20, 54, 3):
        for x in range(4, W - 2, 6): g.put(x + (y // 3) % 2 * 3, y, 'wv2'); g.put(x + 1 + (y // 3) % 2 * 3, y, 'wv3')
    rell(g, M, 28, M - 10, 9, 0, 'kn'); rell(g, M, 27, M - 13, 7, 0, 'kn3')
    for k in range(9): line(g, 8 + k * 6, 24 + (k % 3), 12 + k * 6, 19 + (k % 2), 'hay')
    rell(g, M, 26, 12, 5, 0, 'cr'); rell(g, M - 4, 24, 4, 1.6, 0, 'wh')
def nest_front(g):
    g.poly([(0, 8), (W - 1, 8), (W - 8, 28), (7, 28)], 'wv')
    for y in range(9, 28, 3):
        for x in range(2, W - 3, 6): g.rect(x + (y // 3) % 2 * 3, y, x + 2 + (y // 3) % 2 * 3, y, 'wv2')
    g.rect(0, 5, W - 1, 9, 'wv3'); g.rect(0, 9, W - 1, 9, 'wv2')
    for x in range(5, W - 5, 5): g.rect(x, 0, x + 3, 5, 'kn' if (x // 5) % 2 else 'kn2')
    g.rect(5, 0, W - 6, 1, 'kn3')
    for k in range(5): line(g, 10 + k * 10, 5, 14 + k * 10, 1, 'hay')
    for x in (12, W - 16): g.rect(x, 28, x + 4, 31, 'wv2')
def crate_back(g):
    for k in range(8): y = 2 + abs(k - 3.5) * 0.8; g.put(4 + k * 8, int(y), 'K'); g.rect(4 + k * 8, int(y) + 1, 6 + k * 8, int(y) + 3, ('lt', 'qa', 'qd', 'lt2', 'qc')[k % 5])
    for (x, y, rx, ry, c) in ((12, 36, 11, 10, 'mint'), (M, 32, 12, 10, 'qe'), (W - 12, 36, 11, 10, 'qc'), (22, 43, 9, 6, 'cr'), (W - 22, 43, 9, 6, 'gp')):
        rell(g, x, y, rx, ry, 0, c); rell(g, x - rx * 0.3, y - ry * 0.3, rx * 0.35, ry * 0.3, 0, 'pil'); g.put(int(x), int(y + ry * 0.4), 'pil2')
    g.rect(2, 44, W - 3, 52, 'pil2')
def crate_front(g):
    quilt(g, 0, 0, W - 1, 12, ('mint', 'qb', 'qe', 'qb', 'gp')); g.rect(0, 13, W - 1, 14, 'pil2')
    g.rect(0, 15, W - 1, 27, 'wd'); g.rect(0, 15, W - 1, 15, 'wd3'); g.rect(0, 21, W - 1, 21, 'wd2')
    for x in (0, M - 1, W - 3): g.rect(x, 15, x + 2, 27, 'wd2')
    g.rect(M - 14, 18, M - 4, 24, 'wh'); g.rect(M - 13, 19, M - 5, 23, 'cr')
def walnut_back(g):
    rell(g, M, 34, M - 1, 20, 0, 'ws_'); rell(g, M, 32, M - 5, 16, 0, 'wsi')
    rnd = random.Random(1)
    for k in range(22):
        a = rnd.uniform(3.2, 6.2); x, y = M + math.cos(a) * (M - 3), 34 + math.sin(a) * 18
        g.put(x, y, 'ws2_'); g.put(x + 1, y, 'ws3_')
    rell(g, M, 26, 12, 5, 0, 'cr')
def walnut_front(g):
    rell(g, M, 6, M, 16, 0, 'ws_')
    for y in range(0, 6):
        for x in range(0, W + 1): g.p[y][x] = None
    rnd = random.Random(2)
    for k in range(28): g.put(rnd.uniform(4, W - 4), rnd.uniform(7, 20), rnd.choice(['ws2_', 'ws3_']))
    g.poly([(4, 8), (W - 4, 8), (W - 12, 0), (12, 0)], 'lf1'); line(g, 10, 4, W - 10, 4, 'lf2')
    for x in range(14, W - 12, 8): line(g, x, 4, x + 4, 0, 'lf2'); line(g, x, 4, x + 4, 8, 'lf2')
    g.rect(4, 8, W - 4, 9, 'ws3_')
def match_back(g):
    g.rect(2, 20, W - 3, 50, 'mb2'); g.rect(4, 22, W - 5, 48, 'mb')
    g.rect(4, 6, W - 5, 22, 'mb'); g.rect(4, 6, W - 5, 8, 'mb2')
    g.rect(10, 10, W - 11, 20, 'mbl'); g.rect(12, 12, W - 13, 18, 'mbl2'); rell(g, 20, 15, 3, 2.4, 0, 'mbl')
    for x in range(28, W - 14, 6): g.rect(x, 14, x + 3, 16, 'mbl')
    rell(g, M, 40, 12, 5, 0, 'pil')
def match_front(g):
    quilt(g, 0, 0, W - 3, 12, ('fl1', 'q2', 'fl3', 'q2', 'fl2')); g.rect(0, 13, W - 3, 14, 'pil2')
    g.rect(0, 15, W - 1, 26, 'mb2'); g.rect(2, 16, W - 3, 25, 'mb')
    g.rect(M - 14, 18, M + 14, 23, 'mbl'); g.rect(M - 12, 19, M + 12, 22, 'mbl2')
    for x in range(M - 9, M + 10, 4): g.put(x, 20, 'mbl'); g.put(x + 1, 21, 'mbl')
def mush_back(g):
    g.rect(M - 4, 14, M + 4, 66, 'stem'); g.rect(M - 3, 14, M - 2, 66, 'stem2')
    rell(g, M, 14, M - 1, 14, 0, 'mush2'); rell(g, M, 12, M - 3, 12, 0, 'mush')
    for (x, y, r) in ((10, 8, 3.4), (26, 4, 3), (42, 6, 3.6), (56, 12, 2.6), (18, 16, 2.2), (48, 18, 2.2), (M, 13, 2)): rell(g, x, y, r, r * 0.8, 0, 'stem')
    g.rect(0, 14, W - 1, 18, 'mush2')
    for x in range(2, W - 1, 4): g.rect(x, 18, x + 1, 22, 'stem2')
    rell(g, M, 56, M - 2, 10, 0, 'moss2'); rell(g, M, 54, M - 4, 8, 0, 'moss')
    rell(g, M, 52, 12, 5, 0, 'pil')
def mush_front(g):
    quilt(g, 0, 0, W - 3, 12, ('moss', 'lf3', 'moss', 'q2'))
    for x in range(4, W - 3, 9): rell(g, x, 6, 2, 1.6, 0, 'fl3')
    g.rect(0, 13, W - 1, 22, 'moss2'); g.rect(0, 13, W - 1, 14, 'moss')
    for x in range(2, W - 1, 5): g.rect(x, 22, x + 2, 24, 'moss2')
def cloud_back(g):
    for (x, y, r) in ((14, 30, 13), (28, 22, 15), (44, 24, 14), (54, 32, 11), (M, 34, 17)): rell(g, x, y, r, r * 0.8, 0, 'cl1')
    for (x, y, r) in ((14, 32, 9), (44, 28, 9)): rell(g, x + 2, y + 4, r, r * 0.4, 0, 'cl2')
    for (x, y) in ((20, 0), (M, -2), (W - 20, 2)): g.rect(x, y, x, y + 6, 'cl3')
    for (x, y) in ((20, 8), (M, 6), (W - 20, 10)): g.poly([(x - 3, y), (x + 3, y), (x, y - 4)], 'star'); g.poly([(x - 3, y - 2), (x + 3, y - 2), (x, y + 2)], 'star')
    rell(g, M, 34, 11, 5, 0, 'cl2')
def cloud_front(g):
    quilt(g, 2, 0, W - 3, 10, ('q3', 'cl1', 'q1', 'cl1'))
    for (x, r) in ((8, 8), (22, 9), (M, 10), (W - 22, 9), (W - 8, 8)): rell(g, x, 16, r, r * 0.65, 0, 'cl1')
    for (x, r) in ((8, 5), (M, 7), (W - 8, 5)): rell(g, x + 1, 19, r, r * 0.3, 0, 'cl3')
# (name, back, back size, front, front size, back pos, front pos, hamster)   positions for a bed whose left edge is at x = 0
NBEDS = [('Himmelbett', canopy_back, (W, 80), canopy_front, (W, 32), (0, 28), (0, 82), (M, 100)),
         ('Körbchen-Nest', nest_back, (W, 58), nest_front, (W, 32), (0, 64), (0, 90), (M, 100)),
         ('Kissenkiste', crate_back, (W, 54), crate_front, (W, 28), (0, 50), (0, 90), (M, 100)),
         ('Walnuss-Bett', walnut_back, (W, 56), walnut_front, (W + 1, 24), (0, 66), (0, 92), (M, 100)),
         ('Streichholz-Schachtel', match_back, (W, 52), match_front, (W, 28), (0, 54), (0, 90), (M, 100)),
         ('Fliegenpilz-Bett', mush_back, (W, 68), mush_front, (W, 26), (0, 34), (0, 90), (M, 100)),
         ('Wolkenbett', cloud_back, (W, 56), cloud_front, (W, 27), (0, 54), (0, 88), (M, 100))]
