# five new layouts for the attic bedroom (design sheet first)
import math, random
exec(open('house_art.py').read().split("# ================= bathroom =================")[0])
C(sky='#bfe3f2', sky2='#e4f4fa', sg1='#c8d8b4', sg2='#a8bc94', sg3='#e0ead0', sg4='#86a074',
  mu1='#e8b84a', mu2='#c8962e', mu3='#f4d27a', pe1='#f8e4cc', pe2='#eccaa8', pe3='#fdf2e4', pe4='#d8a880',
  sk1='#d8eaf4', sk2='#c0dcee', sk3='#eef6fa', nb1='#3e4a7a', nb2='#4e5a8e', nb3='#ffe08a', nb4='#c8d0f0', nb5='#2e3862',
  rs1='#f9dfe4', rs2='#f0c4cc', rs3='#e8a0ac', wn1='#fbf6ec', wn2='#e8dcc8', wn3='#d4c4aa',
  lv1='#c8b4e0', lv2='#a890c8', lv3='#e2d6f0', te1='#6aa8a0', te2='#4e8a82', te3='#8cc4bc',
  pw1='#f6efe2', pw2='#e4d8c4', bk1='#c8463c', bk2='#3e6a9a', bk3='#e0b040', bk4='#5a8a4a', bk5='#8a5aa0',
  mn='#fff2c0', mn2='#f0d890', lg='#ffcf6a', lg2='#ff9a4a', brs='#d8a840', brs2='#a87c20', irn='#4a4a56', irn2='#6a6a78')
S = 180, 135
_src = open('house_art.py').read(); exec(_src[_src.index('def b_slope'):_src.index('def b_window')])
C(lace='#fbf8f2', hr1='#f4a3b4', hr2='#e07f95', cp1='#9aa6c0', cp2='#8a96b2', cp3='#b0bcd4')
def lay(fn):
    g = G(*S); fn(g); g.outline('K'); return g
def comp(base, *ls):
    for l in ls:
        for y in range(135):
            for x in range(180):
                if l.p[y][x] is not None: base.p[y][x] = l.p[y][x]
    return base
def hole(g, test, x0, y0, x1, y1, night=False):   # a window opening: sky with a little cloud
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if test(x, y): g.p[y][x] = ('nb5' if night else ('sky2' if y < y0 + 4 else 'sky'))
    if not night:
        cx, cy = x0 + (x1 - x0) * .35, y0 + (y1 - y0) * .4
        for (dx, rx) in ((0, 5), (5, 4), (-4, 3)):
            for y in range(int(cy - 3), int(cy + 3)):
                for x in range(int(cx + dx - rx), int(cx + dx + rx) + 1):
                    if test(x, y) and ((x - cx - dx) / rx) ** 2 + ((y - cy) / 2.6) ** 2 <= 1: g.p[y][x] = 'wh'
    else:
        for (x, y) in ((x0 + 4, y0 + 5), (x1 - 6, y0 + 9), (x0 + 11, y1 - 6), (x1 - 3, y1 - 3)):
            if test(x, y): g.p[y][x] = 'nb3'
def slope(g, skylight=False):
    s = b_slope(1)
    if skylight:   # a roof window in the slope: the frame follows the slant
        for y in range(12, 49):
            w = int(30 - y * 30 / 74); xl = 179 - w + 3
            for x in range(xl, 178):
                fr = y in (12, 13, 47, 48) or x in (xl, xl + 1, 176, 177) or y == 30
                s.p[y][x] = ('wd3' if y in (12, 13) or x in (xl, xl + 1) else 'wd') if fr else 'nb5'
        for (x, y) in ((170, 20), (173, 26), (167, 38), (172, 42), (163, 44)): s.p[y][x] = 'nb3'
    s.outline('K'); comp(g, s)
def railing(g):   # the stairs come up at the right in every layout
    def f(r):
        r.rect(150, 104, 179, 106, 'wd'); r.rect(150, 104, 179, 104, 'wd3')
        for x in range(152, 180, 5): r.rect(x, 106, x + 1, 120, 'wd2')
        r.rect(150, 106, 151, 122, 'wd'); rell(r, 150.5, 103, 2, 1.6, 0, 'wd3')
    return lay(f)
def lamp(g, x, y, shade_c='mu1', shade_d='mu2'):   # little table lamp standing at (x, y)
    g.rect(x - 1, y - 7, x, y - 1, 'brs'); g.rect(x - 3, y - 1, x + 2, y, 'brs2')
    g.poly([(x - 4, y - 13), (x + 3, y - 13), (x + 5, y - 7), (x - 6, y - 7)], shade_c); g.rect(x - 6, y - 7, x + 5, y - 7, shade_d)
    g.rect(x - 4, y - 13, x + 3, y - 13, 'mu3' if shade_c == 'mu1' else 'wh')
def books(g, x0, x1, ybot, rnd):
    x = x0
    while x < x1 - 2:
        w = rnd.choice((2, 2, 3)); h = rnd.randint(6, 9); c = rnd.choice(('bk1', 'bk2', 'bk3', 'bk4', 'bk5', 'qb'))
        if x + w > x1: break
        g.rect(x, ybot - h, x + w - 1, ybot, c); g.put(x, ybot - h + 2, 'wh' if c != 'qb' else 'qa')
        x += w + (1 if rnd.random() < .15 else 0)
def plant(g, x, y, big=False):
    g.poly([(x - 4, y - 6), (x + 4, y - 6), (x + 3, y), (x - 3, y)], 'cu'); g.rect(x - 4, y - 6, x + 4, y - 6, 'cu3'); g.rect(x + 2, y - 5, x + 3, y - 1, 'cu2')
    n = 7 if big else 5
    for k in range(n):
        a = math.radians(-160 + k * 140 / (n - 1)); L = 9 if big else 6
        line(g, x, y - 7, x + math.cos(a) * L, y - 7 + math.sin(a) * L, 'hb')
        rell(g, x + math.cos(a) * L, y - 7 + math.sin(a) * L, 2.2, 1.4, 0, 'hb' if k % 2 else 'hb2')
def quilt2(g, x0, y0, x1, y1, a, b, c=None):   # patchwork with a soft top fold
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            k = ((x - x0) // 6 + (y - y0) // 5) % (3 if c else 2)
            g.put(x, y, (a, b, c)[k] if c else (a, b)[k])
    g.rect(x0, y0, x1, y0 + 2, 'pil'); g.rect(x0, y0 + 2, x1, y0 + 2, 'pil2')

# ---------- 1: Alkoven: a cabin bed built into a panelled nook, porthole window, wardrobe ----------
def d1():
    g = G(*S); rnd = random.Random(1)
    g.rect(0, 0, 179, 99, 'pe3')
    for y in range(10, 60, 9):
        for x in range((y // 9) % 2 * 6, 180, 12): g.put(x, y, 'pe2')
    g.rect(0, 60, 179, 99, 'sg1')
    for x in range(0, 180, 8): g.rect(x, 62, x, 97, 'sg2'); g.rect(x + 1, 62, x + 1, 97, 'sg3')
    g.rect(0, 58, 179, 61, 'sg2'); g.rect(0, 58, 179, 58, 'sg3'); g.rect(0, 61, 179, 61, 'sg4')
    planks(g, 100, rnd); beams(g)
    ow = lambda x, y: ((x + .5 - 112) / 11) ** 2 + ((y + .5 - 34) / 11) ** 2 <= 1
    hole(g, ow, 100, 22, 124, 46)
    slope(g)
    def alcove(a):   # the nook: a wooden frame with a scalloped valance, curtains tied back
        a.rect(6, 18, 84, 99, 'wd'); a.rect(10, 26, 80, 99, 'sg4')
        for x in range(10, 81, 6): a.rect(x, 26, x, 99, 'sg2')
        a.rect(6, 18, 84, 20, 'wd3'); a.rect(82, 20, 84, 99, 'wd2')
        for x in range(10, 81, 7): rell(a, x + 3.5, 27, 3.5, 2.6, 0, 'te1'); a.put(int(x + 3), 26, 'te3')
        a.rect(10, 24, 80, 26, 'te1'); a.rect(10, 24, 80, 24, 'te3')
        for (x0, s) in ((10, 1), (80, -1)):
            a.poly([(x0, 26), (x0 + 12 * s, 26), (x0 + 4 * s, 56), (x0 + 6 * s, 78), (x0, 78)], 'te1')
            for y in range(30, 76, 4): a.put(x0 + 3 * s, y, 'te2')
            rell(a, x0 + 5 * s, 56, 3, 1.6, 0, 'mu1')
        a.rect(30, 40, 60, 41, 'wd3'); a.rect(30, 42, 60, 42, 'wd2')   # a little shelf inside
        for (x, c) in ((34, 'bk2'), (37, 'bk1'), (40, 'bk3')): a.rect(x, 33, x + 2, 39, c)
        rell(a, 54, 37, 3, 3, 0, 'lg'); a.rect(53, 33, 55, 34, 'brs'); a.put(53, 36, 'wh')
        a.rect(18, 60, 74, 66, 'pil2'); rell(a, 34, 61, 11, 4, 0, 'pil'); rell(a, 56, 62, 8, 3.4, 0, 'rs2')
    def alcove_front(a):
        quilt2(a, 10, 66, 80, 84, 'te3', 'pw1', 'mu3')
        a.rect(6, 84, 84, 92, 'wd'); a.rect(6, 84, 84, 84, 'wd3'); a.rect(10, 86, 80, 90, 'wd2'); a.rect(11, 87, 79, 89, 'wd')
        for x in (22, 45, 68): rell(a, x, 88, 1.4, 1.4, 0, 'brs')
        a.rect(6, 92, 84, 99, 'wd2'); a.rect(30, 93, 44, 98, 'wd'); a.rect(50, 93, 64, 98, 'wd'); a.rect(36, 95, 38, 96, 'brs'); a.rect(56, 95, 58, 96, 'brs')
    def frame(a):
        for yy in range(20, 49):
            for xx in range(98, 127):
                d = ((xx + .5 - 112) / 11) ** 2 + ((yy + .5 - 34) / 11) ** 2
                if 1 < d <= 1.5: a.p[yy][xx] = 'brs' if d < 1.25 else 'brs2'
        for (x, y) in ((112, 21), (112, 47), (99, 34), (125, 34)): a.put(x, y, 'wh')
        a.rect(112, 23, 112, 45, 'brs2')
    def wardrobe(a):
        a.rect(124, 30, 150, 99, 'wd'); a.rect(122, 26, 152, 30, 'wd3'); a.rect(122, 30, 152, 30, 'wd2'); a.rect(149, 31, 150, 99, 'wd2')
        for x0 in (127, 138):
            a.rect(x0, 34, x0 + 9, 86, 'sg1'); a.rect(x0, 34, x0 + 9, 34, 'sg3'); a.rect(x0 + 9, 35, x0 + 9, 86, 'sg2')
            rell(a, x0 + 4.5, 48, 2.4, 3, 0, 'sg3')
        a.put(136, 60, 'brs'); a.put(139, 60, 'brs')
        a.rect(126, 89, 148, 96, 'wd2'); a.rect(127, 90, 147, 95, 'wd'); a.rect(136, 92, 138, 93, 'brs')
        a.rect(132, 20, 140, 25, 'qa'); a.rect(132, 20, 140, 20, 'qb'); a.rect(141, 22, 146, 25, 'bk2')
    def rug(a):
        a.rect(60, 108, 132, 126, 'te1'); a.rect(62, 110, 130, 124, 'pw1')
        for x in range(64, 129, 6): a.rect(x, 114, x + 2, 120, 'te3' if x % 12 else 'mu1')
        for x in range(60, 133, 3): a.put(x, 127, 'pw2'); a.put(x, 107, 'pw2')
    return comp(g, lay(alcove), lay(frame), lay(wardrobe), lay(rug), lay(alcove_front), railing(g))

# ---------- 2: Leseecke: the bed in the middle with two night stands, pictures above, a reading chair ----------
def d2():
    g = G(*S); rnd = random.Random(2)
    g.rect(0, 0, 179, 99, 'pe1')
    for x in range(0, 180, 12): g.rect(x, 0, x + 5, 99, 'pe3')
    for x in range(3, 180, 12):
        for y in range(8, 98, 12): g.put(x, y, 'pe2')
    planks(g, 100, rnd)
    for y in range(101, 135, 3):
        for x in range(0, 180):
            if (x + y * 2) % 23 == 0: g.put(x, y, 'fp4')
    beams(g)
    win = lambda x, y: 18 <= x <= 40 and 22 <= y <= 48
    hole(g, win, 16, 20, 42, 50)
    slope(g)
    def window(a):
        a.rect(15, 19, 43, 51, 'wd');
        for yy in range(22, 49):
            for xx in range(18, 41): a.p[yy][xx] = None
        a.rect(29, 22, 29, 48, 'wd'); a.rect(18, 34, 40, 34, 'wd')
        a.rect(12, 51, 46, 54, 'wd3'); a.rect(12, 54, 46, 54, 'wd2')
        for x0 in (6, 44):
            a.rect(x0, 16, x0 + 7, 56, 'mu1'); a.rect(x0 + 6, 16, x0 + 7, 56, 'mu2')
            for yy in range(20, 56, 5): a.rect(x0, yy, x0 + 5, yy, 'mu3')
        a.rect(4, 14, 54, 15, 'brs2')
        plant(a, 22, 51); plant(a, 36, 51)
    def frames(a):
        for (x0, y0, w, h, c) in ((68, 22, 14, 18, 'sk1'), (86, 18, 16, 22, 'sg1'), (106, 24, 12, 14, 'rs1')):
            a.rect(x0, y0, x0 + w, y0 + h, 'wd'); a.rect(x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, c)
            a.rect(x0, y0, x0 + w, y0, 'wd3')
        rell(a, 75, 34, 3, 3, 0, 'hb'); a.rect(75, 34, 75, 37, 'hb2')
        rell(a, 94, 26, 3, 3, 0, 'mu1'); a.poly([(88, 37), (94, 30), (100, 37)], 'sg4')
        rell(a, 112, 31, 2.6, 2.4, 0, 'hr1'); a.put(112, 33, 'hr2')
    def bed(a):   # upholstered headboard against the wall
        rell(a, 92, 56, 30, 10, 0, 'mu2'); a.rect(62, 56, 122, 82, 'mu2'); rell(a, 92, 55, 28, 8.6, 0, 'mu1'); a.rect(64, 55, 120, 82, 'mu1')
        for x in range(70, 118, 8):
            for y in (60, 70): a.put(x, y, 'mu2'); a.put(x + 4, y + 5, 'mu2')
        a.rect(60, 64, 62, 99, 'wd2'); a.rect(122, 64, 124, 99, 'wd2')
        a.rect(66, 74, 118, 82, 'pil2'); rell(a, 80, 74, 11, 4.4, 0, 'pil'); rell(a, 104, 74, 11, 4.4, 0, 'pil'); rell(a, 92, 77, 6, 3, 0, 'te3')
        def ns(x0):
            a.rect(x0, 78, x0 + 16, 99, 'wd'); a.rect(x0 - 1, 76, x0 + 17, 78, 'wd3'); a.rect(x0 + 16, 79, x0 + 16, 99, 'wd2')
            a.rect(x0 + 2, 82, x0 + 14, 88, 'wd2'); a.rect(x0 + 3, 83, x0 + 13, 87, 'wd'); a.rect(x0 + 7, 85, x0 + 9, 85, 'brs')
            a.rect(x0 + 1, 96, x0 + 2, 99, 'wd2'); a.rect(x0 + 14, 96, x0 + 15, 99, 'wd2')
        ns(40); ns(128)
        lamp(a, 47, 76); lamp(a, 136, 76, 'te1', 'te2')
        a.rect(51, 72, 55, 75, 'bk2'); a.rect(51, 72, 55, 72, 'bk3'); a.rect(130, 73, 132, 75, 'qa')
    def bed_front(a):
        quilt2(a, 64, 82, 120, 96, 'te1', 'te3')
        for x in range(64, 121, 4): a.put(x, 97, 'te2')
        a.rect(60, 96, 124, 100, 'wd'); a.rect(60, 96, 124, 96, 'wd3'); a.rect(61, 100, 63, 104, 'wd2'); a.rect(121, 100, 123, 104, 'wd2')
    def chair(a):   # an armchair by the stairs, a basket of books
        a.rect(152, 70, 176, 96, 'sg2'); rell(a, 164, 70, 12, 5, 0, 'sg2'); rell(a, 164, 70, 10, 4, 0, 'sg1'); a.rect(154, 70, 174, 88, 'sg1')
        for (x0) in (149, 172): a.rect(x0, 80, x0 + 6, 96, 'sg2'); a.rect(x0, 80, x0 + 6, 81, 'sg3')
        a.rect(154, 86, 172, 92, 'sg3'); a.rect(154, 92, 172, 92, 'sg2')
        a.rect(151, 97, 152, 100, 'wd2'); a.rect(174, 97, 175, 100, 'wd2')
        rell(a, 160, 78, 4, 4, 0, 'qa'); rell(a, 160, 78, 2, 2, 0, 'qb')
    def rug(a):
        rell(a, 92, 116, 40, 10, 0, 'mu2'); rell(a, 92, 116, 37, 8.6, 0, 'mu1'); rell(a, 92, 116, 30, 6.4, 0, 'pw1'); rell(a, 92, 116, 22, 4.4, 0, 'te3')
    return comp(g, lay(window), lay(frames), lay(bed), lay(chair), lay(rug), lay(bed_front), railing(g))

# ---------- 3: Hochbett: a loft bed with a ladder, a little desk underneath, arched window ----------
def d3():
    g = G(*S); rnd = random.Random(3)
    g.rect(0, 0, 179, 99, 'sk1')
    for (cx, cy) in ((26, 16), (130, 22), (70, 12), (160, 60), (100, 70)):
        for (dx, rx) in ((0, 6), (6, 4), (-5, 4)): rell(g, cx + dx, cy, rx, 2.6, 0, 'sk3')
    g.rect(0, 86, 179, 99, 'wn1'); g.rect(0, 85, 179, 85, 'wn3')
    for y in range(100, 135):
        for x in range(180):
            yy = y - 100; blk = x // 12; dd = (x % 12) + (yy if blk % 2 else -yy)
            c = 'fp1' if (dd // 4) % 2 else 'fp3'
            if dd % 4 == 0 or x % 12 == 0: c = 'fp4'
            g.put(x, y, c)
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
    beams(g)
    aw_ = lambda x, y: (100 <= x <= 128 and 30 <= y <= 56) or (((x + .5 - 114) / 14) ** 2 + ((y + .5 - 30) / 12) ** 2 <= 1 and y < 30)
    hole(g, aw_, 98, 16, 130, 58)
    slope(g)
    def win(a):
        for yy in range(14, 61):
            for xx in range(95, 134):
                inside = aw_(xx, yy)
                outer = (97 <= xx <= 131 and 30 <= yy <= 59) or (((xx + .5 - 114) / 17) ** 2 + ((yy + .5 - 30) / 15) ** 2 <= 1 and yy < 30)
                if outer and not inside: a.p[yy][xx] = 'wn1'
        a.rect(114, 18, 114, 56, 'wn1'); a.rect(100, 38, 128, 38, 'wn1')
        a.rect(94, 59, 134, 62, 'wn2'); a.rect(94, 59, 134, 59, 'wn1')
        for x in range(96, 134, 9): rell(a, x + 4, 57, 3, 2.4, 0, ('qa', 'mu1', 'te1', 'rs3', 'lv1')[(x // 9) % 5])
    def bunting(a):
        for k in range(12):
            x = 10 + k * 7; y = 10 + int(3 * math.sin(k / 11 * math.pi))
            a.poly([(x, y), (x + 5, y), (x + 2.5, y + 5)], ('qa', 'mu1', 'te1', 'lv1')[k % 4])
        line(a, 9, 10, 94, 10, 'wd2')
    def loft(a):
        for x in (8, 78): a.rect(x, 30, x + 3, 99, 'wd'); a.rect(x + 3, 30, x + 3, 99, 'wd2'); a.rect(x, 30, x, 99, 'wd3')
        a.rect(8, 56, 81, 62, 'wd'); a.rect(8, 56, 81, 56, 'wd3'); a.rect(8, 62, 81, 62, 'wd2')
        quilt2(a, 12, 44, 77, 55, 'lv1', 'pw1', 'lv3'); rell(a, 22, 44, 8, 3.4, 0, 'pil')
        a.rect(8, 34, 81, 36, 'wd'); a.rect(8, 34, 81, 34, 'wd3')
        for x in range(14, 78, 6): a.rect(x, 37, x + 1, 43, 'wd2')
        rell(a, 66, 40, 4, 4, 0, 'tb'); rell(a, 63, 36, 1.6, 1.6, 0, 'tb'); rell(a, 69, 36, 1.6, 1.6, 0, 'tb'); a.put(65, 40, 'K'); a.put(67, 40, 'K')
        for y in range(30, 100, 7): a.rect(84, y, 92, y + 1, 'wd3'); a.rect(84, y + 1, 92, y + 1, 'wd2')
        a.rect(84, 30, 85, 99, 'wd'); a.rect(91, 30, 92, 99, 'wd'); a.rect(92, 30, 92, 99, 'wd2')
        # the desk under the loft
        a.rect(14, 78, 70, 80, 'wd3'); a.rect(14, 80, 70, 80, 'wd2'); a.rect(16, 81, 18, 99, 'wd2'); a.rect(66, 81, 68, 99, 'wd2')
        a.rect(48, 81, 64, 92, 'wd'); a.rect(50, 83, 62, 86, 'wd2'); a.rect(55, 84, 57, 84, 'brs'); a.rect(50, 88, 62, 90, 'wd2')
        lamp(a, 22, 78, 'te1', 'te2')
        a.rect(30, 73, 40, 77, 'pw1'); a.rect(30, 73, 40, 73, 'wh'); line(a, 32, 75, 38, 75, 'bk2'); a.rect(42, 70, 44, 77, 'mu1'); a.rect(45, 72, 46, 77, 'qa')
        a.rect(28, 64, 44, 70, 'pw1'); a.rect(28, 64, 44, 64, 'pw2'); rell(a, 33, 67, 2, 2, 0, 'hb'); a.put(40, 66, 'qa')
        books(a, 20, 76, 54, random.Random(5)) if False else None
    def stool(a):
        rell(a, 36, 90, 8, 2.4, 0, 'qa'); rell(a, 36, 89, 7, 1.6, 0, 'tw1') if 'tw1' in pal else None
        a.rect(30, 92, 31, 99, 'wd2'); a.rect(41, 92, 42, 99, 'wd2'); a.rect(31, 96, 41, 96, 'wd2')
    def shelf(a):   # low shelf with toys under the window
        a.rect(140, 74, 164, 99, 'wn1'); a.rect(138, 72, 166, 74, 'wn2'); a.rect(138, 72, 166, 72, 'wn1'); a.rect(164, 75, 164, 99, 'wn3')
        a.rect(140, 86, 164, 87, 'wn3')
        books(a, 142, 162, 85, random.Random(8))
        for (x, c) in ((143, 'qa'), (151, 'te1'), (158, 'mu1')): a.rect(x, 90, x + 5, 98, c); a.rect(x, 90, x + 5, 90, 'wh')
        plant(a, 152, 72, True)
    def rug(a):
        for j, c in enumerate(('te1', 'pw1', 'mu1', 'pw1', 'lv1')): rell(a, 110, 118, 30 - j * 5, 8 - j * 1.4, 0, c)
    return comp(g, lay(win), lay(bunting), lay(loft), lay(shelf), lay(rug), lay(stool), railing(g))

# ---------- 4: Fenstersitz: a big dormer with a cushioned seat, the bed on the right, a chest ----------
def d4():
    g = G(*S); rnd = random.Random(4)
    g.rect(0, 0, 179, 99, 'rs1')
    for y in range(10, 60, 10):
        for x in range((y // 10) % 2 * 8, 180, 16):
            g.put(x, y, 'rs3'); g.put(x - 1, y, 'rs2'); g.put(x + 1, y, 'rs2'); g.put(x, y - 1, 'rs2'); g.put(x, y + 1, 'hb')
    g.rect(0, 62, 179, 99, 'wn1')
    for x in range(0, 180, 10): g.rect(x, 64, x, 97, 'wn2')
    g.rect(0, 60, 179, 63, 'wn2'); g.rect(0, 60, 179, 60, 'wn1'); g.rect(0, 63, 179, 63, 'wn3')
    for y in range(100, 135):
        for x in range(180): g.put(x, y, 'cp1' if (x + y * 3) % 7 else 'cp2')
    for k in range(160): g.put(rnd.randint(0, 179), rnd.randint(101, 134), 'cp3')
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
    beams(g)
    dw = lambda x, y: 30 <= x <= 84 and 22 <= y <= 60
    hole(g, dw, 30, 22, 84, 60)
    slope(g)
    def nook(a):   # deep dormer: side walls, lace, and the seat
        a.rect(22, 14, 92, 21, 'wn2'); a.rect(22, 14, 92, 14, 'wn1')
        a.poly([(22, 21), (30, 22), (30, 66), (22, 70)], 'wn3'); a.poly([(92, 21), (84, 22), (84, 66), (92, 70)], 'wn2')
        a.rect(28, 20, 86, 22, 'wd'); a.rect(56, 22, 57, 60, 'wd'); a.rect(30, 40, 84, 41, 'wd')
        for x in range(30, 85):
            for y in range(22, 30):
                if (x + y) % 3 == 0 and y < 28: a.put(x, y, 'lace')
            if x % 2: a.put(x, 29, 'lace')
        a.rect(20, 62, 94, 70, 'wd'); a.rect(20, 62, 94, 62, 'wd3')
        rell(a, 57, 61, 36, 3, 0, 'lv1'); a.rect(22, 60, 92, 62, 'lv1'); a.rect(22, 60, 92, 60, 'lv3')
        rell(a, 32, 56, 7, 5, 0, 'pil'); rell(a, 46, 57, 6, 4, 0, 'te3'); rell(a, 80, 56, 7, 5, 0, 'mu3'); rell(a, 80, 56, 3, 2, 0, 'mu1')
        a.rect(22, 72, 92, 99, 'wn1'); a.rect(22, 70, 92, 72, 'wn2')
        for x0 in (25, 49, 73): a.rect(x0, 75, x0 + 16, 95, 'wn2'); a.rect(x0 + 1, 76, x0 + 15, 94, 'wn1'); a.rect(x0 + 7, 84, x0 + 9, 85, 'brs')
        for x in (34, 44, 70, 80):
            line(a, x, 22, x, 30 + (x % 7), 'hb2'); rell(a, x, 32 + (x % 7), 2.4, 2, 0, 'hb')
    def bed(a):
        a.rect(98, 54, 102, 99, 'wd'); a.rect(144, 54, 148, 99, 'wd'); a.rect(99, 54, 99, 99, 'wd3'); a.rect(145, 54, 145, 99, 'wd3')
        rell(a, 100, 53, 3, 2.4, 0, 'wd3'); rell(a, 146, 53, 3, 2.4, 0, 'wd3')
        a.rect(102, 58, 144, 76, 'wd'); a.rect(102, 58, 144, 59, 'wd3')
        for x in range(105, 142, 6): a.rect(x, 61, x + 2, 74, 'wd2')
        a.rect(103, 74, 143, 82, 'pil2'); rell(a, 114, 75, 10, 4, 0, 'pil'); rell(a, 132, 75, 9, 4, 0, 'rs2')
        rell(a, 124, 73, 4, 4, 0, 'tb'); rell(a, 121, 69, 1.6, 1.6, 0, 'tb'); rell(a, 127, 69, 1.6, 1.6, 0, 'tb'); a.put(123, 72, 'K'); a.put(125, 72, 'K'); rell(a, 124, 76, 2, 2, 0, 'aw2')
    def bed_front(a):
        quilt2(a, 100, 82, 146, 96, 'rs3', 'pw1', 'rs2')
        a.rect(96, 96, 150, 101, 'wd'); a.rect(96, 96, 150, 96, 'wd3'); a.rect(97, 101, 99, 105, 'wd2'); a.rect(147, 101, 149, 105, 'wd2')
    def chest(a):   # a painted chest at the left wall with a blanket
        a.rect(2, 82, 18, 99, 'te1'); a.rect(1, 80, 19, 83, 'te3'); a.rect(18, 83, 18, 99, 'te2')
        a.rect(4, 87, 16, 95, 'te2'); a.rect(5, 88, 15, 94, 'te1'); rell(a, 10, 91, 2.4, 2.4, 0, 'mu1')
        a.rect(3, 76, 16, 80, 'mu1'); a.rect(3, 76, 16, 76, 'mu3'); a.rect(12, 77, 16, 84, 'mu2')
    def lights(a):   # a string of little lights along the beam
        for k in range(16):
            x = 100 + k * 5; y = 9 + int(4 * math.sin(k / 15 * math.pi))
            if x > 175 - int(30 - y * 30 / 74) - 2: break
            a.put(x, y, 'wd2'); rell(a, x, y + 2, 1.4, 1.6, 0, ('lg', 'lg2', 'mn')[k % 3])
    def rug(a):
        for y in range(106, 130):
            for x in range(52, 136):
                if ((x - 94) / 42) ** 2 + ((y - 118) / 12) ** 2 <= 1: a.put(x, y, 'lv1' if ((x // 4) + (y // 3)) % 2 else 'lv3')
    return comp(g, lay(nook), lay(lights), lay(bed), lay(chest), lay(rug), lay(bed_front), railing(g))

# ---------- 5: Sternenzimmer: night blue, a skylight in the slope with a telescope, a low futon with cushions ----------
def d5():
    g = G(*S); rnd = random.Random(5)
    g.rect(0, 0, 179, 99, 'nb1')
    for k in range(120): g.put(rnd.randint(0, 179), rnd.randint(4, 98), rnd.choice(['nb2', 'nb2', 'nb4']))
    for k in range(22):
        x, y = rnd.randint(2, 177), rnd.randint(8, 80)
        g.put(x, y, 'nb3'); g.put(x - 1, y, 'nb3'); g.put(x + 1, y, 'nb3'); g.put(x, y - 1, 'nb3'); g.put(x, y + 1, 'nb3')
    g.rect(0, 84, 179, 99, 'nb2'); g.rect(0, 84, 179, 84, 'nb4')
    planks(g, 100, rnd)
    beams(g)
    slope(g, skylight=True)
    def moon(a):   # a round moon lamp on the wall
        rell(a, 96, 34, 11, 11, 0, 'mn'); rell(a, 92, 30, 3, 3, 0, 'mn2'); rell(a, 101, 38, 2.4, 2, 0, 'mn2'); rell(a, 98, 27, 1.6, 1.6, 0, 'mn2')
    def lanterns(a):
        line(a, 8, 14, 90, 18, 'nb4')
        for k, x in enumerate(range(14, 90, 12)):
            y = 14 + int((x - 8) / 82 * 4) + 1
            a.rect(x, y, x, y + 2, 'nb4'); rell(a, x, y + 6, 4, 4.4, 0, ('lg', 'qa', 'te3', 'lv1')[k % 4]); a.rect(x - 2, y + 2, x + 2, y + 2, 'wd2'); a.rect(x - 2, y + 10, x + 2, y + 10, 'wd2')
            a.put(x - 1, y + 5, 'wh')
    def futon(a):   # low bed on a wooden platform, lots of cushions against the wall
        rell(a, 26, 72, 12, 9, 0, 'lv2'); rell(a, 26, 72, 10, 7.4, 0, 'lv1')
        rell(a, 48, 70, 13, 10, 0, 'te2'); rell(a, 48, 70, 11, 8.4, 0, 'te1')
        rell(a, 70, 73, 11, 8, 0, 'mu2'); rell(a, 70, 73, 9, 6.4, 0, 'mu1')
        for (x, y) in ((24, 70), (48, 68), (70, 72)): a.put(x, y, 'wh')
        rell(a, 40, 80, 9, 4, 0, 'pil'); rell(a, 60, 81, 8, 3.6, 0, 'nb4')
    def futon_front(a):
        quilt2(a, 8, 82, 88, 94, 'nb2', 'lv1', 'nb4')
        for x in range(8, 89, 6): a.put(x + 3, 88, 'nb3')
        a.rect(6, 94, 90, 99, 'wd'); a.rect(6, 94, 90, 94, 'wd3'); a.rect(6, 99, 90, 99, 'wd2')
    def telescope(a):   # on a tripod, pointing up into the skylight
        a.poly([(132, 52), (148, 42), (151, 47), (135, 57)], 'brs'); a.poly([(135, 57), (151, 47), (151, 48), (135, 58)], 'brs2')
        a.poly([(146, 42), (156, 36), (158, 40), (148, 46)], 'brs2'); a.rect(130, 52, 132, 58, 'brs2')
        rell(a, 140, 53, 2, 2, 0, 'irn2')
        line(a, 140, 55, 130, 99, 'irn'); line(a, 140, 55, 150, 99, 'irn'); line(a, 140, 55, 140, 99, 'irn2')
        a.rect(136, 76, 144, 76, 'irn')
    def stand(a):   # a little round table with a book and a star globe
        a.rect(100, 82, 120, 84, 'wd3'); a.rect(100, 84, 120, 84, 'wd2'); a.rect(109, 85, 111, 99, 'wd2'); a.rect(104, 98, 116, 99, 'wd2')
        rell(a, 107, 76, 5, 5, 0, 'nb2'); a.rect(106, 81, 108, 81, 'brs'); a.put(105, 74, 'nb3'); a.put(109, 77, 'nb3'); a.put(107, 73, 'mn')
        a.rect(112, 78, 119, 81, 'bk2'); a.rect(112, 78, 119, 78, 'pw1')
    def rug(a):
        for y in range(106, 130):
            for x in range(70, 150):
                d = ((x - 110) / 40) ** 2 + ((y - 118) / 12) ** 2
                if d <= 1: a.put(x, y, 'nb2' if d > .7 else ('nb1' if d > .4 else 'nb4'))
        for (x, y) in ((96, 114), (120, 121), (110, 112), (128, 116), (92, 122)): a.put(x, y, 'nb3')
    return comp(g, lay(moon), lay(lanterns), lay(futon), lay(stand), lay(telescope), lay(rug), lay(futon_front), railing(g))

NAMES = ['Alkoven', 'Leseecke', 'Hochbett', 'Fenstersitz', 'Sternenzimmer']
if __name__ == '__main__':
    from PIL import Image, ImageDraw
    def img(g, s=2):
        im = Image.new('RGB', (g.w, g.h), (255, 255, 255)); P = im.load()
        for y in range(g.h):
            for x in range(g.w):
                c = g.p[y][x]
                if c is not None:
                    h = pal[c] if c in pal else '#3a2414'; P[x, y] = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
        return im.resize((g.w * s, g.h * s), Image.NEAREST)
    gs = [d1(), d2(), d3(), d4(), d5()]
    for i, g in enumerate(gs): img(g, 3).save('../bad/sz_%d.png' % (i + 1))
    sheet = Image.new('RGB', (3 * 370 + 10, 2 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for i, g in enumerate(gs):
        c, r = i % 3, i // 3
        sheet.paste(img(g), (10 + c * 370, 20 + r * 300)); d.text((10 + c * 370, 4 + r * 300), str(i + 1) + ': ' + NAMES[i], fill=(0, 0, 0))
    sheet.save('../bad/sz_sheet.png'); print('ok')
