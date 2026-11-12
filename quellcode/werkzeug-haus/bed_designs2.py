# five bedroom layouts, round 2: beds with depth (the hamster lies between pillow and quilt) and a place for the fish tank
import math, random
_s = open('bed_designs.py').read(); exec(_s[:_s.index('# ---------- 1:')])
from ham_lay import put_ham
C(aqw='#9ad8e0', aqw2='#c8eef2', aqg='#e8d29c', fish='#f08a24', fish2='#ffc070')
def tank(a, x, yb):   # the fish tank (26 x 20) standing with its base on y = yb
    y = yb - 19
    a.rect(x, y, x + 25, yb, 'irn'); a.rect(x, y, x + 25, y + 1, 'irn2')
    a.rect(x + 2, y + 3, x + 23, yb - 3, 'aqw'); a.rect(x + 2, y + 3, x + 23, y + 4, 'aqw2')
    a.rect(x + 2, yb - 5, x + 23, yb - 3, 'aqg'); a.px('fp3', [(x + 5, yb - 4), (x + 12, yb - 5), (x + 19, yb - 4)])
    for (px, h) in ((x + 4, 8), (x + 6, 5), (x + 19, 9), (x + 21, 6)):
        for k in range(h): a.put(px + (k // 2) % 2, yb - 6 - k, 'hb' if k % 3 else 'hb2')
    rell(a, x + 13, y + 9, 3, 1.8, 0, 'fish'); a.poly([(x + 16, y + 9), (x + 18, y + 7), (x + 18, y + 11)], 'fish'); a.put(x + 11, y + 8, 'K'); a.put(x + 13, y + 8, 'fish2')
    a.px('wh', [(x + 9, y + 6), (x + 8, y + 5)])
    a.rect(x + 23, y + 3, x + 23, yb - 3, 'aqw2')
def bedset(x0, x1, HB, q, frame=('wd', 'wd3', 'wd2'), sheet='pil', pil=('pil', 'pil2')):
    """2.5D bed: behind the hamster the mattress top and a pillow, in front of him the quilt (its top seen from above, then its front) and the rail.
    The hamster stands with his feet on HB; the quilt starts 20 above, so head and shoulders peek out like in the current bed."""
    QT = HB - 12
    def back(a):
        a.rect(x0 + 2, HB - 34, x1 - 2, QT + 2, sheet); a.rect(x0 + 2, HB - 34, x1 - 2, HB - 34, 'pil2')
        for x in range(x0 + 6, x1 - 4, 9): a.put(x, QT - 2, 'pil2')
        cx = (x0 + x1) // 2
        rell(a, cx, HB - 32, 15, 4.6, 0, pil[1]); rell(a, cx, HB - 33, 14, 3.8, 0, pil[0]); a.put(cx - 10, HB - 35, 'wh')
    def front(a):
        a.rect(x0, QT, x1, QT + 5, q[2]); a.rect(x0, QT, x1, QT + 1, 'pil'); a.rect(x0, QT + 2, x1, QT + 2, 'pil2')   # folded sheet edge, quilt top
        for x in range(x0, x1 + 1, 7): a.rect(x, QT + 3, x + 2, QT + 5, q[0])
        for y in range(QT + 6, QT + 15):
            for x in range(x0, x1 + 1): a.put(x, y, (q[0], q[1])[((x - x0) // 7 + (y - QT - 6) // 4) % 2])
        a.rect(x0, QT + 6, x1, QT + 6, q[2])
        for x in range(x0 + 1, x1, 3): a.put(x, QT + 15, q[0])
        a.rect(x0 - 2, QT + 15, x1 + 2, QT + 19, frame[0]); a.rect(x0 - 2, QT + 15, x1 + 2, QT + 15, frame[1]); a.rect(x0 - 2, QT + 19, x1 + 2, QT + 19, frame[2])
    return back, front
def hamlay(cx, HB):
    def f(a): put_ham(a, pal, cx, HB)
    g = G(*S); f(g); return g

# ---------- 1: Alkoven ----------
def d1(ham=True):
    g = G(*S); rnd = random.Random(1)
    g.rect(0, 0, 179, 99, 'pe3')
    for y in range(10, 60, 9):
        for x in range((y // 9) % 2 * 6, 180, 12): g.put(x, y, 'pe2')
    g.rect(0, 60, 179, 99, 'sg1')
    for x in range(0, 180, 8): g.rect(x, 62, x, 97, 'sg2'); g.rect(x + 1, 62, x + 1, 97, 'sg3')
    g.rect(0, 58, 179, 61, 'sg2'); g.rect(0, 58, 179, 58, 'sg3'); g.rect(0, 61, 179, 61, 'sg4')
    planks(g, 100, rnd); beams(g)
    ow = lambda x, y: ((x + .5 - 106) / 10) ** 2 + ((y + .5 - 32) / 10) ** 2 <= 1
    hole(g, ow, 94, 20, 118, 44)
    slope(g)
    HB = 82; bb, bf = bedset(12, 80, HB, ('te3', 'pw1', 'mu3'))
    def alcove(a):
        a.rect(4, 14, 88, 99, 'wd'); a.rect(8, 22, 84, 99, 'sg4')
        for x in range(8, 85, 6): a.rect(x, 22, x, 99, 'sg2')
        a.rect(4, 14, 88, 16, 'wd3'); a.rect(86, 16, 88, 99, 'wd2')
        a.rect(8, 20, 84, 22, 'te1'); a.rect(8, 20, 84, 20, 'te3')
        for x in range(8, 84, 7): rell(a, x + 3.5, 23, 3.5, 2.6, 0, 'te1'); a.put(int(x + 3), 22, 'te3')
        for (x0, s) in ((8, 1), (84, -1)):
            a.poly([(x0, 22), (x0 + 10 * s, 22), (x0 + 3 * s, 50), (x0 + 4 * s, 68), (x0, 68)], 'te1')
            for y in range(26, 66, 4): a.put(x0 + 2 * s, y, 'te2')
            rell(a, x0 + 4 * s, 50, 3, 1.6, 0, 'mu1')
        a.rect(22, 33, 42, 34, 'wd3'); a.rect(22, 35, 42, 35, 'wd2')
        for (x, c) in ((25, 'bk2'), (28, 'bk1'), (31, 'bk3')): a.rect(x, 27, x + 2, 32, c)
        rell(a, 70, 30, 3, 3, 0, 'lg'); a.rect(69, 25, 71, 26, 'brs'); a.put(69, 29, 'wh')   # a little hanging light
        a.rect(70, 22, 70, 24, 'brs2')
        bb(a)
    def alcove_front(a):
        bf(a)
        for x in (4, 86): a.rect(x, 50, x + 2, 99, 'wd'); a.rect(x, 50, x, 99, 'wd3')
        a.rect(6, 90, 86, 99, 'wd2'); a.rect(12, 92, 44, 98, 'wd'); a.rect(48, 92, 80, 98, 'wd'); a.rect(27, 94, 29, 95, 'brs'); a.rect(63, 94, 65, 95, 'brs')
    def frame(a):
        for yy in range(18, 47):
            for xx in range(92, 121):
                d = ((xx + .5 - 106) / 10) ** 2 + ((yy + .5 - 32) / 10) ** 2
                if 1 < d <= 1.55: a.p[yy][xx] = 'brs' if d < 1.28 else 'brs2'
        for (x, y) in ((106, 19), (106, 45), (93, 32), (119, 32)): a.put(x, y, 'wh')
        a.rect(106, 23, 106, 41, 'brs2')
    def cabinet(a):   # a low cabinet under the porthole carries the fish tank
        a.rect(93, 78, 119, 99, 'wd'); a.rect(91, 76, 121, 78, 'wd3'); a.rect(91, 78, 121, 78, 'wd2'); a.rect(119, 79, 119, 99, 'wd2')
        a.rect(96, 81, 116, 96, 'sg1'); a.rect(96, 81, 116, 81, 'sg3'); a.rect(106, 82, 106, 96, 'sg2'); a.put(104, 88, 'brs'); a.put(108, 88, 'brs')
        tank(a, 93, 75)
    def wardrobe(a):
        a.rect(126, 30, 150, 99, 'wd'); a.rect(124, 26, 152, 30, 'wd3'); a.rect(124, 30, 152, 30, 'wd2'); a.rect(149, 31, 150, 99, 'wd2')
        for x0 in (129, 139):
            a.rect(x0, 34, x0 + 8, 86, 'sg1'); a.rect(x0, 34, x0 + 8, 34, 'sg3'); a.rect(x0 + 8, 35, x0 + 8, 86, 'sg2'); rell(a, x0 + 4, 48, 2.2, 3, 0, 'sg3')
        a.put(137, 60, 'brs'); a.put(139, 60, 'brs')
        a.rect(128, 89, 148, 96, 'wd2'); a.rect(129, 90, 147, 95, 'wd'); a.rect(137, 92, 139, 93, 'brs')
        a.rect(132, 20, 140, 25, 'qa'); a.rect(132, 20, 140, 20, 'qb'); a.rect(141, 22, 146, 25, 'bk2')
    def rug(a):
        for y in range(106, 130):
            for x in range(40, 140):
                d = ((x - 90) / 50) ** 2 + ((y - 118) / 12) ** 2
                if d <= 1: a.put(x, y, 'te1' if d > .75 else ('pw1' if d > .45 else 'mu3'))
        for x in range(46, 136, 6): a.put(x, 118, 'te3')
    L = [lay(alcove), lay(frame), lay(cabinet), lay(wardrobe), lay(rug)]
    if ham: L.append(hamlay(46, HB))
    return comp(g, *L, lay(alcove_front), railing(g))

# ---------- 2: Leseecke ----------
def d2(ham=True):
    g = G(*S); rnd = random.Random(2)
    g.rect(0, 0, 179, 99, 'pe1')
    for x in range(0, 180, 12): g.rect(x, 0, x + 5, 99, 'pe3')
    for x in range(3, 180, 12):
        for y in range(8, 98, 12): g.put(x, y, 'pe2')
    planks(g, 100, rnd); beams(g)
    win = lambda x, y: 16 <= x <= 36 and 22 <= y <= 46
    hole(g, win, 14, 20, 38, 48)
    slope(g)
    HB = 92; bb, bf = bedset(54, 110, HB, ('te1', 'te3', 'te3'))
    def window(a):
        a.rect(13, 19, 39, 49, 'wd')
        for yy in range(22, 47):
            for xx in range(16, 37): a.p[yy][xx] = None
        a.rect(26, 22, 26, 46, 'wd'); a.rect(16, 33, 36, 33, 'wd')
        a.rect(10, 49, 42, 52, 'wd3'); a.rect(10, 52, 42, 52, 'wd2')
        for x0 in (4, 40):
            a.rect(x0, 16, x0 + 6, 54, 'mu1'); a.rect(x0 + 5, 16, x0 + 6, 54, 'mu2')
            for yy in range(20, 54, 5): a.rect(x0, yy, x0 + 4, yy, 'mu3')
        a.rect(2, 14, 50, 15, 'brs2'); plant(a, 20, 49); plant(a, 32, 49)
    def frames(a):
        for (x0, y0, w, h, c) in ((60, 24, 12, 16, 'sk1'), (76, 20, 14, 20, 'sg1'), (94, 26, 10, 12, 'rs1')):
            a.rect(x0, y0, x0 + w, y0 + h, 'wd'); a.rect(x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, c); a.rect(x0, y0, x0 + w, y0, 'wd3')
        rell(a, 66, 34, 2.6, 2.6, 0, 'hb'); a.rect(66, 34, 66, 37, 'hb2')
        rell(a, 83, 27, 2.6, 2.6, 0, 'mu1'); a.poly([(78, 37), (83, 31), (88, 37)], 'sg4')
        rell(a, 99, 32, 2.4, 2.2, 0, 'hr1'); a.put(99, 34, 'hr2')
    def bed(a):   # upholstered headboard against the wall
        rell(a, 82, 50, 28, 8, 0, 'mu2'); a.rect(54, 50, 110, 70, 'mu2'); rell(a, 82, 49, 26, 7, 0, 'mu1'); a.rect(56, 49, 108, 70, 'mu1')
        for x in range(62, 106, 8):
            for y in (54, 62): a.put(x, y, 'mu2'); a.put(x + 4, y + 4, 'mu2')
        a.rect(51, 56, 53, 104, 'wd2'); a.rect(111, 56, 113, 104, 'wd2'); a.rect(51, 56, 53, 56, 'wd3'); a.rect(111, 56, 113, 56, 'wd3')
        bb(a)
        # night stand left with the lamp, a chest of drawers right with the fish tank
        x0 = 30; a.rect(x0, 80, x0 + 16, 99, 'wd'); a.rect(x0 - 1, 78, x0 + 17, 80, 'wd3'); a.rect(x0 + 16, 81, x0 + 16, 99, 'wd2')
        a.rect(x0 + 2, 84, x0 + 14, 90, 'wd2'); a.rect(x0 + 3, 85, x0 + 13, 89, 'wd'); a.rect(x0 + 7, 87, x0 + 9, 87, 'brs')
        lamp(a, 37, 78); a.rect(41, 74, 45, 77, 'bk2'); a.rect(41, 74, 45, 74, 'bk3')
        x0 = 118; a.rect(x0, 76, x0 + 28, 99, 'wd'); a.rect(x0 - 1, 74, x0 + 29, 76, 'wd3'); a.rect(x0 + 28, 77, x0 + 28, 99, 'wd2')
        for y in (79, 86, 93): a.rect(x0 + 2, y, x0 + 26, y + 5, 'wd2'); a.rect(x0 + 3, y + 1, x0 + 25, y + 4, 'wd'); a.rect(x0 + 13, y + 2, x0 + 15, y + 2, 'brs')
        tank(a, 119, 73)
    def bed_front(a):
        bf(a); a.rect(53, 100, 55, 104, 'wd2'); a.rect(109, 100, 111, 104, 'wd2')
    def chair(a):
        a.rect(154, 70, 176, 96, 'sg2'); rell(a, 165, 70, 11, 5, 0, 'sg2'); rell(a, 165, 70, 9, 4, 0, 'sg1'); a.rect(156, 70, 174, 88, 'sg1')
        for x0 in (151, 172): a.rect(x0, 80, x0 + 6, 96, 'sg2'); a.rect(x0, 80, x0 + 6, 81, 'sg3')
        a.rect(156, 86, 172, 92, 'sg3'); a.rect(156, 92, 172, 92, 'sg2')
        a.rect(153, 97, 154, 100, 'wd2'); a.rect(174, 97, 175, 100, 'wd2'); rell(a, 162, 78, 4, 4, 0, 'qa'); rell(a, 162, 78, 2, 2, 0, 'qb')
    def rug(a):
        rell(a, 82, 118, 46, 10, 0, 'mu2'); rell(a, 82, 118, 43, 8.6, 0, 'mu1'); rell(a, 82, 118, 35, 6.4, 0, 'pw1'); rell(a, 82, 118, 26, 4.4, 0, 'te3')
    L = [lay(window), lay(frames), lay(bed), lay(chair), lay(rug)]
    if ham: L.append(hamlay(82, HB))
    return comp(g, *L, lay(bed_front), railing(g))

# ---------- 3: Hochbett ----------
def d3(ham=True):
    g = G(*S); rnd = random.Random(3)
    g.rect(0, 0, 179, 99, 'sk1')
    for (cx, cy) in ((130, 22), (70, 14), (160, 60), (110, 76), (30, 84)):
        for (dx, rx) in ((0, 6), (6, 4), (-5, 4)): rell(g, cx + dx, cy, rx, 2.6, 0, 'sk3')
    g.rect(0, 88, 179, 99, 'wn1'); g.rect(0, 87, 179, 87, 'wn3')
    for y in range(100, 135):
        for x in range(180):
            yy = y - 100; blk = x // 12; dd = (x % 12) + (yy if blk % 2 else -yy)
            c = 'fp1' if (dd // 4) % 2 else 'fp3'
            if dd % 4 == 0 or x % 12 == 0: c = 'fp4'
            g.put(x, y, c)
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3'); beams(g)
    aw_ = lambda x, y: (102 <= x <= 128 and 30 <= y <= 54) or (((x + .5 - 115) / 13) ** 2 + ((y + .5 - 30) / 11) ** 2 <= 1 and y < 30)
    hole(g, aw_, 100, 17, 130, 56)
    slope(g)
    HB = 52; bb, bf = bedset(12, 76, HB, ('lv1', 'pw1', 'lv3'))
    def win(a):
        for yy in range(15, 59):
            for xx in range(97, 134):
                outer = (99 <= xx <= 131 and 30 <= yy <= 57) or (((xx + .5 - 115) / 16) ** 2 + ((yy + .5 - 30) / 14) ** 2 <= 1 and yy < 30)
                if outer and not aw_(xx, yy): a.p[yy][xx] = 'wn1'
        a.rect(115, 19, 115, 54, 'wn1'); a.rect(102, 38, 128, 38, 'wn1')
        a.rect(96, 57, 134, 60, 'wn2'); a.rect(96, 57, 134, 57, 'wn1')
        for k, x in enumerate(range(140, 172, 8)): a.poly([(x, 10), (x + 5, 10), (x + 2.5, 15)], ('qa', 'mu1', 'te1', 'lv1')[k % 4])
    def loft(a):
        for x in (8, 78): a.rect(x, 24, x + 3, 99, 'wd'); a.rect(x + 3, 24, x + 3, 99, 'wd2'); a.rect(x, 24, x, 99, 'wd3')
        a.rect(8, 24, 81, 26, 'wd'); a.rect(8, 24, 81, 24, 'wd3')   # head rail at the wall
        bb(a)
        for y in range(30, 100, 7): a.rect(84, y, 92, y + 1, 'wd3'); a.rect(84, y + 1, 92, y + 1, 'wd2')
        a.rect(84, 26, 85, 99, 'wd'); a.rect(91, 26, 92, 99, 'wd'); a.rect(92, 26, 92, 99, 'wd2')
        a.rect(14, 76, 70, 78, 'wd3'); a.rect(14, 78, 70, 78, 'wd2'); a.rect(16, 79, 18, 99, 'wd2'); a.rect(66, 79, 68, 99, 'wd2')
        a.rect(48, 79, 64, 92, 'wd'); a.rect(50, 81, 62, 84, 'wd2'); a.rect(55, 82, 57, 82, 'brs'); a.rect(50, 86, 62, 88, 'wd2')
        lamp(a, 22, 76, 'te1', 'te2')
        a.rect(30, 71, 40, 75, 'pw1'); a.rect(30, 71, 40, 71, 'wh'); line(a, 32, 73, 38, 73, 'bk2'); a.rect(42, 68, 44, 75, 'mu1'); a.rect(45, 70, 46, 75, 'qa')
    def loft_front(a):
        bf(a)
    def stool(a):
        rell(a, 36, 89, 8, 2.4, 0, 'qa'); a.rect(30, 91, 31, 99, 'wd2'); a.rect(41, 91, 42, 99, 'wd2'); a.rect(31, 96, 41, 96, 'wd2')
    def shelf(a):
        a.rect(138, 76, 166, 99, 'wn1'); a.rect(136, 74, 168, 76, 'wn2'); a.rect(136, 74, 168, 74, 'wn1'); a.rect(166, 77, 166, 99, 'wn3')
        a.rect(138, 87, 166, 88, 'wn3'); books(a, 140, 164, 86, random.Random(8))
        for (x, c) in ((141, 'qa'), (150, 'te1'), (158, 'mu1')): a.rect(x, 90, x + 5, 98, c); a.rect(x, 90, x + 5, 90, 'wh')
        tank(a, 139, 73)
    def rug(a):
        for j, c in enumerate(('te1', 'pw1', 'mu1', 'pw1', 'lv1')): rell(a, 112, 118, 30 - j * 5, 8 - j * 1.4, 0, c)
    L = [lay(win), lay(loft), lay(shelf), lay(rug), lay(stool)]
    if ham: L.append(hamlay(44, HB))
    return comp(g, *L, lay(loft_front), railing(g))

# ---------- 4: Fenstersitz ----------
def d4(ham=True):
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
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3'); beams(g)
    dw = lambda x, y: 38 <= x <= 84 and 22 <= y <= 58
    hole(g, dw, 38, 22, 84, 58)
    slope(g)
    HB = 92; bb, bf = bedset(94, 146, HB, ('rs3', 'pw1', 'rs2'))
    def nook(a):
        a.rect(30, 14, 92, 21, 'wn2'); a.rect(30, 14, 92, 14, 'wn1')
        a.poly([(30, 21), (38, 22), (38, 64), (30, 68)], 'wn3'); a.poly([(92, 21), (84, 22), (84, 64), (92, 68)], 'wn2')
        a.rect(36, 20, 86, 22, 'wd'); a.rect(61, 22, 61, 58, 'wd'); a.rect(38, 40, 84, 40, 'wd')
        for x in range(38, 85):
            for y in range(22, 28):
                if (x + y) % 3 == 0: a.put(x, y, 'lace')
            if x % 2: a.put(x, 28, 'lace')
        a.rect(28, 60, 94, 68, 'wd'); a.rect(28, 60, 94, 60, 'wd3')
        a.rect(30, 58, 92, 60, 'lv1'); a.rect(30, 58, 92, 58, 'lv3')
        rell(a, 40, 54, 7, 5, 0, 'pil'); rell(a, 53, 55, 6, 4, 0, 'te3'); rell(a, 82, 54, 7, 5, 0, 'mu3'); rell(a, 82, 54, 3, 2, 0, 'mu1')
        a.rect(30, 70, 92, 99, 'wn1'); a.rect(30, 68, 92, 70, 'wn2')
        for x0 in (33, 53, 73): a.rect(x0, 73, x0 + 16, 95, 'wn2'); a.rect(x0 + 1, 74, x0 + 15, 94, 'wn1'); a.rect(x0 + 7, 83, x0 + 9, 84, 'brs')
        for x in (44, 50, 72, 78): line(a, x, 22, x, 29 + (x % 5), 'hb2'); rell(a, x, 31 + (x % 5), 2.4, 2, 0, 'hb')
    def bed(a):
        a.rect(90, 50, 94, 104, 'wd'); a.rect(146, 50, 150, 104, 'wd'); a.rect(91, 50, 91, 104, 'wd3'); a.rect(147, 50, 147, 104, 'wd3')
        rell(a, 92, 49, 3, 2.4, 0, 'wd3'); rell(a, 148, 49, 3, 2.4, 0, 'wd3')
        a.rect(94, 54, 146, 68, 'wd'); a.rect(94, 54, 146, 55, 'wd3')
        for x in range(97, 144, 6): a.rect(x, 57, x + 2, 67, 'wd2')
        bb(a)
    def bed_front(a): bf(a)
    def chest(a):   # a painted chest with the fish tank on top
        a.rect(2, 82, 26, 99, 'te1'); a.rect(1, 80, 27, 83, 'te3'); a.rect(26, 83, 26, 99, 'te2')
        a.rect(4, 86, 24, 96, 'te2'); a.rect(5, 87, 23, 95, 'te1'); rell(a, 14, 91, 2.4, 2.4, 0, 'mu1')
        tank(a, 1, 79)
    def lights(a):
        for k in range(16):
            x = 100 + k * 5; y = 9 + int(4 * math.sin(k / 15 * math.pi))
            if x > 175 - int(30 - y * 30 / 74) - 2: break
            a.put(x, y, 'wd2'); rell(a, x, y + 2, 1.4, 1.6, 0, ('lg', 'lg2', 'mn')[k % 3])
    def rug(a):
        for y in range(106, 130):
            for x in range(40, 130):
                if ((x - 85) / 45) ** 2 + ((y - 118) / 12) ** 2 <= 1: a.put(x, y, 'lv1' if ((x // 4) + (y // 3)) % 2 else 'lv3')
    L = [lay(nook), lay(lights), lay(bed), lay(chest), lay(rug)]
    if ham: L.append(hamlay(120, HB))
    return comp(g, *L, lay(bed_front), railing(g))

# ---------- 5: Sternenzimmer ----------
def d5(ham=True):
    g = G(*S); rnd = random.Random(5)
    g.rect(0, 0, 179, 99, 'nb1')
    for k in range(120): g.put(rnd.randint(0, 179), rnd.randint(4, 98), rnd.choice(['nb2', 'nb2', 'nb4']))
    for k in range(22):
        x, y = rnd.randint(2, 177), rnd.randint(8, 80)
        g.put(x, y, 'nb3'); g.put(x - 1, y, 'nb3'); g.put(x + 1, y, 'nb3'); g.put(x, y - 1, 'nb3'); g.put(x, y + 1, 'nb3')
    g.rect(0, 84, 179, 99, 'nb2'); g.rect(0, 84, 179, 84, 'nb4')
    planks(g, 100, rnd); beams(g); slope(g, skylight=True)
    HB = 94; bb, bf = bedset(10, 86, HB, ('nb2', 'lv1', 'nb4'), frame=('wd', 'wd3', 'wd2'))
    def moon(a):
        rell(a, 100, 32, 10, 10, 0, 'mn'); rell(a, 96, 28, 3, 3, 0, 'mn2'); rell(a, 104, 36, 2.4, 2, 0, 'mn2'); rell(a, 102, 25, 1.6, 1.6, 0, 'mn2')
    def lanterns(a):
        line(a, 8, 14, 86, 18, 'nb4')
        for k, x in enumerate(range(14, 86, 12)):
            y = 14 + int((x - 8) / 78 * 4) + 1
            a.rect(x, y, x, y + 2, 'nb4'); rell(a, x, y + 6, 4, 4.4, 0, ('lg', 'qa', 'te3', 'lv1')[k % 4]); a.rect(x - 2, y + 2, x + 2, y + 2, 'wd2'); a.rect(x - 2, y + 10, x + 2, y + 10, 'wd2'); a.put(x - 1, y + 5, 'wh')
    def futon(a):   # cushions against the wall, then the low mattress
        for (x, c, d) in ((18, 'lv1', 'lv2'), (78, 'mu1', 'mu2')): rell(a, x, 64, 10, 8, 0, d); rell(a, x, 64, 8.4, 6.6, 0, c); a.put(x - 3, 61, 'wh')
        bb(a)
    def futon_front(a):
        bf(a)
        for x in range(12, 86, 8): a.put(x + 3, HB - 12, 'nb3')
    def telescope(a):
        a.poly([(132, 52), (148, 42), (151, 47), (135, 57)], 'brs'); a.poly([(135, 57), (151, 47), (151, 48), (135, 58)], 'brs2')
        a.poly([(146, 42), (156, 36), (158, 40), (148, 46)], 'brs2'); a.rect(130, 52, 132, 58, 'brs2'); rell(a, 140, 53, 2, 2, 0, 'irn2')
        line(a, 140, 55, 130, 99, 'irn'); line(a, 140, 55, 150, 99, 'irn'); line(a, 140, 55, 140, 99, 'irn2'); a.rect(136, 76, 144, 76, 'irn')
    def stand(a):   # a round side table with the fish tank
        a.rect(94, 80, 124, 82, 'wd3'); a.rect(94, 82, 124, 82, 'wd2'); a.rect(108, 83, 110, 99, 'wd2'); a.rect(102, 98, 116, 99, 'wd2')
        tank(a, 96, 79)
    def rug(a):
        for y in range(106, 130):
            for x in range(70, 150):
                d = ((x - 110) / 40) ** 2 + ((y - 118) / 12) ** 2
                if d <= 1: a.put(x, y, 'nb2' if d > .7 else ('nb1' if d > .4 else 'nb4'))
        for (x, y) in ((96, 114), (120, 121), (110, 112), (128, 116), (92, 122)): a.put(x, y, 'nb3')
    L = [lay(moon), lay(lanterns), lay(futon), lay(stand), lay(telescope), lay(rug)]
    if ham: L.append(hamlay(48, HB))
    return comp(g, *L, lay(futon_front), railing(g))

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
    for i, g in enumerate(gs): img(g, 3).save('../bad/sz2_%d.png' % (i + 1))
    sheet = Image.new('RGB', (3 * 370 + 10, 2 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for i, g in enumerate(gs):
        c, r = i % 3, i // 3
        sheet.paste(img(g), (10 + c * 370, 20 + r * 300)); d.text((10 + c * 370, 4 + r * 300), str(i + 1) + ': ' + NAMES[i], fill=(0, 0, 0))
    sheet.paste(Image.open('../bad/ig_bed.png').resize((360, 270)), (10 + 2 * 370, 20 + 300)); d.text((10 + 2 * 370, 4 + 300), 'zum Vergleich: aktuell', fill=(0, 0, 0))
    sheet.save('../bad/sz2_sheet.png'); print('ok')
