# art for the house: bathroom, attic bedroom and the house map in five styles
import json, math, random
from ahelp import G, C, pal, paths, rell, line, shade
OUT = {}
def put_svg(name, g): OUT[name] = dict(w=g.w, h=g.h, svg=paths(g))
def mk(name, w, h, fn, ol=True):
    g = G(w, h); fn(g)
    if ol: g.outline('K')
    put_svg(name, g)
C(fp1='#c8945a', fp2='#bc8a50', fp3='#dcae72', fp4='#8a5e32', nail='#5e3a1c', bm='#6a4422', bm2='#4e3018', bm3='#8a5a30',
  wd='#a06a38', wd2='#7e4e24', wd3='#c08a50', wh='#fff8ec', rd='#c8463c', ye='#f0c040', hb='#6e9a4a', hb2='#4e7a34', cu='#d07a44', cu2='#a85a2c', cu3='#f0a070',
  iron='#3a3a42', iron2='#5a5a64', jr='#e4f0f2', jr2='#c4dce2', gd='#e0b040', gd2='#b08420',
  bw1='#dbe8ee', bw2='#c6d8e2', bt1='#f6f8f8', bt2='#d4dee2', bt3='#9ec4c0', bt4='#7aa8a4', tub='#f8f6f2', tub2='#dcd8d0', tub3='#ffffff', tubi='#c8e4ec', wat='#9ad0e4', wat2='#c4e8f2',
  fr='#e8f2f6', fr2='#cfe2ea', tw1='#e8706a', tw2='#f6efe2', tw3='#7ab0d4', duck='#ffd84a', duck2='#e8a020', bk='#f08a24', mat='#8ac0b8', mat2='#6aa098',
  aw='#f4e2b4', aw2='#e8d29c', aw3='#d0a46a', rf1='#c08a50', rf2='#a06a38', rf3='#dcae72', qa='#e8706a', qb='#f6efe2', qc='#7ab0d4', qd='#9ad070', qe='#f0c040', pil='#fffaf0', pil2='#e8e0d0',
  lt='#ffe08a', lt2='#ff9a4a', tb='#b07a44', tb2='#8a5a2e')
def planks(g, y0=100, rnd=None):
    rnd = rnd or random.Random(3)
    rows = [(y0, 6), (y0 + 6, 7), (y0 + 13, 8), (y0 + 21, 9), (y0 + 30, 5)]
    for r, (yy, hgt) in enumerate(rows):
        g.rect(0, yy, 179, min(134, yy + hgt - 1), 'fp1' if r % 2 else 'fp2')
        g.rect(0, yy, 179, yy, 'fp3'); g.rect(0, min(134, yy + hgt - 1), 179, min(134, yy + hgt - 1), 'fp4')
        x = (r * 37) % 60 - 20
        while x < 180:
            if x > 0: g.rect(x, yy, x, min(134, yy + hgt - 1), 'fp4'); g.put(x + 2, yy + 2, 'nail')
            x += 52 + (r * 7) % 15
        for k in range(22):
            gx_, gy_ = rnd.randint(0, 175), yy + rnd.randint(1, max(1, hgt - 2))
            for t in range(rnd.randint(3, 9)): g.put(gx_ + t, gy_, 'fp3' if k % 3 else 'fp4')
    g.rect(0, y0 - 3, 179, y0, 'wd2'); g.rect(0, y0 - 3, 179, y0 - 3, 'wd3')
def beams(g):
    g.rect(0, 0, 179, 6, 'bm'); g.rect(0, 6, 179, 6, 'bm2'); g.rect(0, 0, 179, 0, 'bm3')
    for x in (0, 174):
        g.rect(x, 0, x + 5, 99, 'bm'); g.rect(x + 5, 0, x + 5, 99, 'bm2'); g.rect(x, 0, x, 99, 'bm3')
    for x in range(8, 172, 7): g.put(x, 3, 'bm2'); g.put(x + 3, 2, 'bm3')

# ================= bathroom =================
def bath_bg():
    g = G(180, 135); rnd = random.Random(7)
    g.rect(0, 0, 179, 99, 'bw1')
    for y in range(12, 60, 8):
        for x in range((y // 8) % 2 * 5, 180, 10): g.put(x, y, 'bw2'); g.put(x + 1, y, 'bw2')
    g.rect(0, 58, 179, 99, 'bt1')
    for y in range(58, 99, 6): g.rect(0, y, 179, y, 'bt2')
    for y in range(58, 99, 6):
        for x in range(((y - 58) // 6) % 2 * 4, 180, 8): g.rect(x, y, x, y + 5, 'bt2')
    g.rect(0, 56, 179, 58, 'bt3'); g.rect(0, 58, 179, 58, 'bt4')
    planks(g, 100, rnd)
    beams(g)
    for yy in range(16, 52):
        for xx in range(122, 150):
            if yy >= 28 or ((xx + .5 - 136) / 14) ** 2 + ((yy + .5 - 28) / 12) ** 2 <= 1:
                g.p[yy][xx] = None   # clear glass: the sky shows through
    for yy in range(14, 54):
        for xx in range(119, 153):
            inside = yy >= 28 and 122 <= xx <= 149 and yy < 52 or ((xx + .5 - 136) / 14) ** 2 + ((yy + .5 - 28) / 12) ** 2 <= 1 and yy < 28
            outer = yy >= 28 and 119 <= xx <= 152 or ((xx + .5 - 136) / 17) ** 2 + ((yy + .5 - 28) / 15) ** 2 <= 1
            if outer and not inside and yy < 54: g.p[yy][xx] = 'wd'
    g.rect(136, 16, 136, 51, 'wd'); g.rect(122, 34, 149, 34, 'wd')
    g.rect(117, 52, 155, 55, 'wd3'); g.rect(117, 55, 155, 55, 'wd2')
    rell(g, 126, 50, 3, 2.4, 0, 'cu'); g.rect(125, 44, 127, 48, 'hb'); g.put(124, 45, 'hb2'); g.put(128, 45, 'hb2')
    for k in range(4): g.rect(144 + k, 46 + (k % 2), 144 + k, 51, 'hb' if k % 2 else 'hb2')
    rell(g, 146, 51, 3, 1.6, 0, 'cu')
    # copper pipes, tap and shower over the tub
    g.rect(52, 30, 53, 74, 'cu'); g.rect(53, 30, 53, 74, 'cu2'); g.rect(44, 28, 53, 29, 'cu'); g.poly([(36, 30), (48, 30), (46, 34), (38, 34)], 'cu')
    g.px('cu2', [(39, 35), (42, 35), (45, 35)]); g.rect(48, 70, 58, 71, 'cu'); g.rect(56, 72, 58, 74, 'cu'); g.put(57, 75, 'cu3')
    rell(g, 50, 68, 2, 1.4, 0, 'jr'); rell(g, 56, 68, 2, 1.4, 0, 'jr')
    # tub back rim and inside (the front is its own sprite)
    rell(g, 52, 80, 38, 6, 0, 'tub2'); rell(g, 52, 80, 36, 5, 0, 'tubi'); rell(g, 52, 81, 33, 3.6, 0, 'tub2')
    # mirror, sink
    rell(g, 104, 34, 9, 12, 0, 'wd'); rell(g, 104, 34, 7.5, 10.5, 0, 'jr'); g.rect(100, 26, 101, 36, 'tub3'); g.put(102, 28, 'tub3')
    g.rect(101, 76, 107, 99, 'tub2'); g.rect(102, 76, 106, 99, 'tub'); rell(g, 104, 74, 11, 3.6, 0, 'tub'); rell(g, 104, 73, 9, 2, 0, 'tubi')
    g.rect(103, 66, 105, 71, 'cu'); g.rect(103, 66, 108, 67, 'cu')
    g.rect(94, 52, 114, 53, 'wd'); g.rect(94, 52, 114, 52, 'wd3')
    for (x, c) in ((96, 'qc'), (100, 'qa'), (110, 'qd')): g.rect(x, 46, x + 2, 51, c); g.put(x + 1, 45, 'wh')
    # towel rail with towels
    g.rect(160, 60, 172, 61, 'cu'); g.rect(161, 62, 166, 80, 'tw1'); g.rect(162, 62, 162, 80, 'tw2'); g.rect(165, 62, 165, 80, 'tw2')
    g.rect(167, 62, 171, 76, 'tw3'); g.rect(167, 70, 171, 70, 'tw2')
    # bath mat
    for yy in range(110, 120):
        for xx in range(30, 78): g.put(xx, yy, 'mat' if (xx // 3 + yy // 3) % 2 else 'mat2')
    for xx in range(30, 78, 2): g.put(xx, 120, 'mat'); g.put(xx + 1, 109, 'mat')
    # laundry basket
    g.poly([(140, 92), (156, 92), (154, 108), (142, 108)], 'aw3')
    for yy in range(93, 108, 2): g.rect(141, yy, 155, yy, 'tb')
    g.rect(143, 90, 152, 92, 'tw3'); g.put(150, 89, 'tw1')
    g.outline('K')
    return g
put_svg('bath_bg', bath_bg())
def tub_front(g):
    # clawfoot tub seen from the front, the hamster sits behind it
    g.poly([(0, 6), (76, 6), (72, 22), (66, 26), (10, 26), (4, 22)], 'tub')
    g.rect(0, 4, 76, 7, 'tub3'); g.rect(3, 8, 73, 9, 'tub3')
    shade(g, 'tub', 'tub2', 'bottom')
    for x in (8, 66): g.rect(x, 26, x + 3, 30, 'gd'); g.rect(x - 1, 30, x + 4, 31, 'gd2')
    g.rect(2, 4, 74, 4, 'tub2')
    # little duck on the rim
    rell(g, 66, 1.5, 3, 2.2, 0, 'duck'); rell(g, 69, -0.5, 1.6, 1.6, 0, 'duck'); g.put(71, 0, 'bk'); g.put(69, -1, 'K')
mk('bath_tub', 77, 32, tub_front)
def foam(g):
    rnd = random.Random(2)
    for k in range(26):
        x = rnd.uniform(6, 66); y = rnd.uniform(5, 10); r = rnd.uniform(2.4, 4.4)
        rell(g, x, y, r, r * 0.75, 0, 'tub3')
    for k in range(14): g.put(rnd.uniform(6, 66), rnd.uniform(6, 11), 'wat2')
    for k in range(6): rell(g, rnd.uniform(8, 64), rnd.uniform(3, 6), 1.2, 1.2, 0, 'wat2')
mk('bath_foam', 72, 13, foam, ol=False)
def water(g): rell(g, 36, 4, 33, 3.4, 0, 'wat'); rell(g, 30, 3.4, 18, 1.2, 0, 'wat2')
mk('bath_water', 72, 8, water, ol=False)
def bubble(g): rell(g, 2.5, 2.5, 2.4, 2.4, 0, 'wat2'); rell(g, 2.5, 2.5, 1.4, 1.4, 0, 'tub3'); g.put(1, 1, 'tub3')
mk('bubble', 5, 5, bubble, ol=False)
C(tw4='#c8504a', tw5='#fbe4dc', twh='#ffffff')
def towel_hang(g):
    # brass hook, the towel gathered at the top, falling open in soft folds with a striped hem and fringe
    rell(g, 12, 2, 2.4, 2, 0, 'gd'); g.put(11, 1, 'tub3'); g.rect(11, 3, 13, 4, 'gd2')
    for y in range(5, 31):
        half = 2.5 + min(7.5, (y - 5) * 0.85); wob = math.sin(y / 3) * 0.5
        for x in range(int(12 - half + wob), int(12 + half + wob) + 1): g.put(x, y, 'tw5')
    for (x0, sw) in ((8, 1), (12, 0), (16, -1)):
        for y in range(9, 30): g.put(x0 + (sw if (y // 6) % 2 else 0), y, 'tw2')
    for y in range(5, 31):
        half = 2.5 + min(7.5, (y - 5) * 0.85); wob = math.sin(y / 3) * 0.5
        g.put(int(12 + half + wob), y, 'tw2'); g.put(int(12 + half + wob) - 1, y, 'tw2') if y > 12 else None
    g.rect(3, 23, 21, 25, 'tw1'); g.rect(3, 27, 21, 27, 'tw1')
    for x in range(4, 21, 2): g.rect(x, 31, x, 32, 'tw2')
mk('towel_hang', 25, 34, towel_hang)
def towel_wrap(g):
    # a hooded towel wrapped around the hamster, the face peeks out (fits the 48 x 52 hamster)
    rell(g, 24, 30, 21, 21, 0, 'tw1'); g.rect(4, 32, 44, 51, 'tw1')
    rell(g, 24, 30, 19, 19, 0, 'tw5'); g.rect(6, 34, 42, 51, 'tw5')
    for y in (38, 43, 48): g.rect(6, y, 42, y + 1, 'tw1')
    rell(g, 14, 10, 5, 6, 0, 'tw1'); rell(g, 34, 10, 5, 6, 0, 'tw1'); rell(g, 14, 11, 3, 4, 0, 'tw5'); rell(g, 34, 11, 3, 4, 0, 'tw5')
    for y in range(52):
        for x in range(48):
            if ((x + .5 - 24) / 13) ** 2 + ((y + .5 - 27) / 10.5) ** 2 <= 1: g.p[y][x] = None
    g.poly([(22, 36), (26, 36), (27, 51), (21, 51)], 'tw1')
    for x in (6, 42): g.rect(x, 46, x, 51, 'tw4')
mk('towel_wrap', 48, 52, towel_wrap)
def splash(g):
    # a crown of water shooting up out of the tub
    for (x, h, w2) in ((4, 10, 2), (9, 15, 2), (14, 19, 2), (20, 21, 3), (26, 19, 2), (31, 15, 2), (36, 10, 2)):
        for y in range(20 - h, 21):
            ww = max(1, round(w2 * (y - (20 - h)) / h + 0.5))
            for dx in range(-ww + 1, ww): g.put(x + dx + (x - 20) * (20 - y) // 40, y, 'wat')
        g.put(x, 20 - h, 'tub3'); g.put(x - 1, 20 - h + 1, 'wat2')
        rell(g, x, 20 - h - 2, 1.2, 1.2, 0, 'wat2')
    rell(g, 20, 19, 18, 2.4, 0, 'wat2'); rell(g, 20, 19, 12, 1.2, 0, 'tub3')
    for (x, y) in ((1, 6), (39, 6), (7, 1), (33, 1), (20, -1)): g.put(x, y + 1, 'wat')
mk('splash', 41, 22, splash, ol=False)
def puddle(g): rell(g, 10, 2.5, 10, 2.4, 0, 'wat'); rell(g, 7, 2, 4, 0.8, 0, 'wat2')
mk('puddle', 21, 5, puddle, ol=False)
def drip(g): g.rect(1, 0, 1, 0, 'wat2'); rell(g, 1.5, 2.5, 1.4, 1.6, 0, 'wat'); g.put(1, 2, 'tub3')
mk('drip', 3, 5, drip, ol=False)


# ================= attic bedroom =================
def bed_bg():
    g = G(180, 135); rnd = random.Random(9)
    g.rect(0, 0, 179, 99, 'aw')
    for y in range(8, 98, 10):
        for x in range((y // 10) % 2 * 7, 180, 14): g.put(x, y, 'aw3'); g.put(x - 1, y + 1, 'hb'); g.put(x + 1, y + 1, 'hb'); g.put(x, y - 1, 'qa')
    planks(g, 100, rnd)
    # sloped ceiling on both sides, wooden boards with rafters
    for side in (0, 1):
        for y in range(0, 64):
            w = int(62 - y * 62 / 64)
            for x in range(w):
                xx = x if side == 0 else 179 - x
                c = 'rf1' if (x + y * 0) // 7 % 2 else 'rf2'
                if (x - (62 - y)) % 7 == 0: c = 'rf3'
                g.put(xx, y, c)
            edge = w if side == 0 else 179 - w
            g.put(edge, y, 'bm'); g.put(edge + (1 if side == 0 else -1), y, 'bm2')
        for k in range(3):
            y0 = 14 + k * 18; w0 = int(62 - y0 * 62 / 64)
            if side == 0: g.rect(0, y0, w0, y0 + 2, 'bm'); g.rect(0, y0 + 2, w0, y0 + 2, 'bm2')
            else: g.rect(179 - w0, y0, 179, y0 + 2, 'bm'); g.rect(179 - w0, y0 + 2, 179, y0 + 2, 'bm2')
    g.rect(0, 0, 179, 4, 'bm'); g.rect(0, 4, 179, 4, 'bm2')
    # round window with the sky behind
    for yy in range(12, 50):
        for xx in range(71, 109):
            d = ((xx + .5 - 90) / 17) ** 2 + ((yy + .5 - 31) / 17) ** 2
            if d <= 1: g.p[yy][xx] = None
            elif d <= 1.3: g.p[yy][xx] = 'wd'
    for yy in range(14, 48):
        if ((90.5 - 90) / 17) ** 2 + ((yy + .5 - 31) / 17) ** 2 <= 1: g.put(90, yy, 'wd2')
    for xx in range(73, 108):
        if ((xx + .5 - 90) / 17) ** 2 <= 1: g.put(xx, 31, 'wd2')
    g.rect(68, 51, 112, 53, 'wd3'); g.rect(68, 53, 112, 53, 'wd2')
    for (x0, x1) in ((64, 72), (108, 116)):
        g.rect(x0, 10, x1, 44, 'qc')
        for yy in range(10, 45, 3): g.rect(x0, yy, x1, yy, 'qb')
    g.rect(62, 8, 118, 9, 'wd2')
    # string lights along the slopes
    for side in (0, 1):
        for k in range(8):
            y = 20 + k * 5; x = int(62 - y * 62 / 64) + 2
            xx = x + 3 if side == 0 else 176 - x
            g.put(xx, y + 2, 'iron'); g.rect(xx, y + 3, xx + 1, y + 4, ('lt', 'lt2', 'qa', 'qd')[k % 4])
    # wardrobe-chest under the right slope with a teddy, nightstand with candle and book
    g.rect(132, 72, 164, 99, 'wd'); g.rect(130, 70, 166, 72, 'wd3')
    for y in (76, 84, 92): g.rect(134, y, 162, y + 5, 'wd2'); g.rect(135, y + 1, 161, y + 4, 'wd'); g.rect(146, y + 2, 149, y + 3, 'gd')
    rell(g, 148, 64, 6, 6, 0, 'tb'); rell(g, 148, 57, 4, 4, 0, 'tb'); rell(g, 145, 54, 1.6, 1.6, 0, 'tb'); rell(g, 151, 54, 1.6, 1.6, 0, 'tb')
    rell(g, 148, 65, 3, 3.4, 0, 'aw2'); g.px('K', [(147, 57), (149, 57)]); g.put(148, 58, 'tb2')
    g.rect(92, 84, 106, 99, 'wd'); g.rect(90, 82, 108, 84, 'wd3'); g.rect(94, 88, 104, 92, 'wd2'); g.rect(98, 89, 100, 90, 'gd')
    g.rect(98, 74, 100, 81, 'wh'); g.put(99, 73, 'ye'); g.put(99, 72, 'lt2'); rell(g, 99, 81.5, 3, 0.8, 0, 'gd')
    g.rect(102, 79, 107, 81, 'qa'); g.rect(102, 79, 107, 79, 'qb')
    # round braided rug
    for i, c in enumerate(('qc', 'qb', 'qa', 'qb', 'qe')): rell(g, 92, 118, 34 - i * 6, 9 - i * 1.6, 0, c)
    # stairs down: banister at the right front
    g.rect(150, 104, 179, 106, 'wd'); g.rect(150, 104, 179, 104, 'wd3')
    for x in range(152, 180, 5): g.rect(x, 106, x + 1, 120, 'wd2')
    g.rect(150, 106, 151, 122, 'wd'); rell(g, 150.5, 103, 2, 1.6, 0, 'wd3')
    g.outline('K')
    return g
put_svg('bed_bg', bed_bg())
def bed_back(g):
    # headboard with a heart, mattress and pillow
    g.rect(0, 0, 5, 30, 'wd'); g.rect(1, 0, 1, 30, 'wd3'); g.rect(4, 6, 50, 24, 'wd'); g.rect(4, 6, 50, 6, 'wd3')
    rell(g, 25, 14, 3, 2.6, 0, 'qa'); g.poly([(22, 15), (28, 15), (25, 19)], 'qa')
    g.rect(6, 22, 66, 28, 'pil2'); rell(g, 18, 22, 10, 4, 0, 'pil'); g.put(14, 21, 'wh')
mk('bed_back', 70, 31, bed_back)
def bed_front(g):
    # patchwork quilt and footboard in front of the hamster
    colors = ['qa', 'qb', 'qc', 'qd', 'qe']
    for yy in range(0, 12):
        for xx in range(0, 64):
            g.put(xx, yy, colors[((xx // 8) + (yy // 6) * 2) % 5])
    for xx in range(0, 64, 8): g.rect(xx, 0, xx, 11, 'pil2')
    g.rect(0, 0, 63, 1, 'pil'); g.rect(0, 12, 63, 13, 'pil2')
    g.rect(62, -4, 67, 18, 'wd'); g.rect(63, -4, 63, 18, 'wd3')
    g.rect(0, 14, 63, 17, 'wd'); g.rect(0, 14, 63, 14, 'wd3')
    for x in (1, 60): g.rect(x, 18, x + 2, 21, 'wd2')
mk('bed_front', 68, 22, bed_front)

# ================= the house map, five styles =================
STYLES = [
    dict(name='Fachwerkhaus', wall='#f2e6c8', wall2='#e2d2ac', beam='#5a3a22', roof='#b8483a', roof2='#8e3428', roof3='#d8685a', chim='#a8583a', trim='#5a3a22', kind='timber'),
    dict(name='Schwedenhaus', wall='#a83a2c', wall2='#8a2c22', beam='#fff8ec', roof='#4a4a52', roof2='#34343c', roof3='#6a6a74', chim='#5a5a64', trim='#fff8ec', kind='boards'),
    dict(name='Reetdach-Cottage', wall='#a8a296', wall2='#8a8478', beam='#c4beb2', roof='#d8b45a', roof2='#b08a38', roof3='#ecd07a', chim='#8a8478', trim='#6a5a48', kind='stone'),
    dict(name='Stadthaus', wall='#bfe0cc', wall2='#a2ccb4', beam='#f4a3b4', roof='#5a6a8a', roof2='#44526e', roof3='#7a8aaa', chim='#e8a0a8', trim='#f6efe2', kind='pastel'),
    dict(name='Blockhütte', wall='#8a5a32', wall2='#6a4224', beam='#b07a44', roof='#5a8a3a', roof2='#3e6a2a', roof3='#7aaa52', chim='#7a746c', trim='#4e3018', kind='logs'),
]
for i, st in enumerate(STYLES):
    C(**{'sw%d' % i: st['wall'], 'sx%d' % i: st['wall2'], 'sb%d' % i: st['beam'], 'sr%d' % i: st['roof'], 'ss%d' % i: st['roof2'], 'st%d' % i: st['roof3'], 'sc%d' % i: st['chim'], 'sm%d' % i: st['trim']})
C(far='#7fae8a', far2='#6a9a7a', st3='#b8b2a8', msky='#bfe3f7', msky2='#d6eefa', mgr='#7ab84a', mgr2='#5e9a3a', mgr3='#9ad060', mdirt='#8a6a44', rbath='#dbe8ee', rliv='#f3e6cf', rkit='#efe0c4', rbed='#f4e2b4', rflo='#c8945a', mtree='#4e8a3a', mtree2='#2e6a2a', mtree3='#6ea84a', mtrunk='#6e4a2e', mfence='#c8a878', moss='#8ac860', mush='#e85a4a')
# room boxes on the map (x0, y0, x1, y1): the inside of each room
ROOMS = dict(bath=(19, 72, 50, 104), room=(54, 72, 96, 104), kitchen=(100, 72, 131, 104), bedroom=(40, 40, 110, 64), garden=(142, 60, 179, 118))
C(mk1='#f3e6cf', mk2='#e8d6b4', mb1='#dbe8ee', mb2='#c6d8e2', mbt='#f6f8f8', mkt='#efe0c4', mkt2='#e2ceaa', mbd='#f4e2b4', mbd2='#e8d29c',
  oak1='#6abf4e', oak2='#4e9a3a', oak3='#9ad86a', oakd='#3a6e30', hdg1='#4e8a3a', hdg2='#3a6e2e', hdg3='#6aa84a', gm1='#78b848', gm2='#5a9a3a', gm3='#9ad060',
  smk='#eef2f6', smk2='#d6dde6', glow='#ffd88a', brk='#a8583a', brk2='#86402a', fire='#ffb040', fire2='#ff7a2a', soil='#5a3a22', pth='#c4a676', pth2='#ac8e60')
C(qe='#e9a44c', so='#2a1a12', mo='#8a7a6a', st1='#9a948c', moss='#8ac860', mush='#e85a4a', trunk='#6e4a2e', tub2='#dcd8d0', pt='#f4a3b4', pt3='#ffc8d4')
def layer(): return G(180, 135)
def compose(layers):
    g = G(180, 135)
    for (l, ol) in layers:
        if ol: l.outline('K')
        for y in range(135):
            for x in range(180):
                if l.p[y][x] is not None: g.p[y][x] = l.p[y][x]
    return g
def hexdark(h, t):
    a = [int(h[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(int(v * (1 - t)) for v in a)
def darkkey(k, t=0.22):
    nk = k + '_d%d' % int(t * 100)
    if nk not in pal: pal[nk] = hexdark(pal[k], t)
    return nk
def shade_area(g, inside, t=0.22, soft=None):
    """darken every pixel where inside(x,y); soft(x,y) gives a checkerboard edge"""
    for y in range(135):
        for x in range(180):
            c = g.p[y][x]
            if c is None or c == 'K': continue
            if inside(x, y) or (soft and soft(x, y) and (x + y) % 2 == 0): g.p[y][x] = darkkey(c, t)
# roof outline per style: top(x) = y of the outer roof surface, None outside the roof
def roof_fn(i):
    if i == 0: return (lambda x: 4 + abs(x - 75) * 60 / 71 if 4 <= x <= 146 else None), 64
    if i == 1: return (lambda x: 20 + abs(x - 75) * 46 / 77 if -2 <= x <= 152 else None), 66
    if i == 2: return (lambda x: 66 - 58 * math.sqrt(max(0, 1 - ((x - 75) / 77) ** 2)) if -2 <= x <= 152 else None), 66
    if i == 3:
        def m(x):
            if x < 8 or x > 142: return None
            if x < 22: return 64 - (x - 8) * 40 / 14
            if x > 128: return 64 - (142 - x) * 40 / 14
            return 22 + abs(x - 75) * 6 / 53
        return m, 64
    return (lambda x: 0 + abs(x - 75) * 70 / 77 if -2 <= x <= 152 else None), 70
GROUND = dict(bath=(19, 72, 50, 104), room=(54, 72, 96, 104), kitchen=(100, 72, 131, 104), garden=(150, 60, 179, 118))
ROOMS_BY_STYLE = []
ATTIC = []
GROUND2 = dict(room=(19, 72, 96, 104), kitchen=(100, 72, 131, 104), garden=(150, 60, 179, 118))
def house_map(i):
    st = STYLES[i]; w, x2, b, r, r2, r3, ch, tr = ['%s%d' % (k, i) for k in ('sw', 'sx', 'sb', 'sr', 'ss', 'st', 'sc', 'sm')]
    top, eave = roof_fn(3); thick = {0: 12, 1: 10, 2: 15, 3: 13, 4: 12}[i]
    rnd = random.Random(20 + i); L = []
    # --- background: sky, the garden's far tree line and hedge, meadow ---
    # the surroundings come from the garden itself (season aware), see house.js
    # --- the house body ---
    wall = layer(); wall.rect(12, eave - 2, 138, 108, w)
    kind = st['kind']
    if kind == 'timber':
        wall.rect(12, eave - 2, 138, eave, b); wall.rect(12, 105, 138, 108, b)
        for x in (12, 13, 17, 18, 132, 133, 137, 138): wall.rect(x, eave, x, 108, b)
        for (xa, xb) in ((12, 18), (132, 138)):
            for y in range(eave, 104, 10): line(wall, xa, y, xb, y + 10, b)
    elif kind == 'boards':
        for x in range(12, 139, 3): wall.rect(x, eave - 2, x, 108, x2)
        wall.rect(12, eave - 2, 14, 108, b); wall.rect(136, eave - 2, 138, 108, b)
    elif kind == 'stone':
        wall.rect(9, eave - 2, 141, 108, w)
        for k in range(130): rell(wall, rnd.uniform(9, 141), rnd.uniform(eave - 1, 108), rnd.uniform(1.8, 3.4), rnd.uniform(1.3, 2.2), 0, rnd.choice([w, x2, b]))
    elif kind == 'pastel':
        wall.rect(12, eave - 2, 138, eave + 1, b); wall.rect(12, 101, 138, 108, x2)
        for x in range(14, 138, 6): wall.put(x, eave + 3, b)
    else:
        for y in range(eave - 2, 109, 4):
            wall.rect(12, y, 138, y, x2); rell(wall, 10, y + 2, 3, 2, 0, b); rell(wall, 140, y + 2, 3, 2, 0, b); wall.put(9, y + 2, x2); wall.put(141, y + 2, x2)
    L.append((wall, True))
    found = layer(); found.rect(8, 106, 142, 111, 'st1')
    for x in range(8, 143, 7): found.rect(x, 106, x, 111, 'mo')
    found.rect(8, 106, 142, 106, 'st3' if 'st3' in pal else 'wh')
    L.append((found, True))
    # --- roof (and the attic room inside it) ---
    roof = layer()
    for x in range(-2, 153):
        t = top(x)
        if t is None or not (0 <= x < 180): continue
        for y in range(max(0, int(t)), eave + 1):
            row = (y - int(t)) // 4
            if kind == 'stone':
                c = r if (x * 3 + y * 5) % 7 else r3
                if (y + (x // 3)) % 4 == 0: c = r2
            elif kind == 'logs':
                c = r if (x + y) % 5 else r3
                if y % 5 == 0: c = r2
            elif kind == 'pastel':
                c = r if ((x + (y // 4) % 2 * 3) // 6) % 2 else r3
                if y % 4 == 3: c = r2
            else:
                c = r if ((x + ((y // 4) % 2) * 3) // 6 + y // 4) % 2 else r3
                if y % 4 == 3: c = r2
            roof.put(x, y, c)
    # light from the left: the right half of the roof lies in shade
    for x in range(76, 153):
        t = top(x)
        if t is None or not (0 <= x < 180): continue
        for y in range(max(0, int(t)), eave + 1):
            c = roof.p[y][x]
            if c and ((x > 80) or (x + y) % 2): roof.p[y][x] = darkkey(c, 0.14)
    if kind == 'stone':   # thatch fringe hanging over the walls
        for x in range(-2, 153, 2):
            if 0 <= x < 180: roof.rect(x, eave, x, eave + 2 + (x * 7) % 3, r2)
    if kind == 'boards' or kind == 'timber':   # bargeboards along the gable
        for x in range(-2, 153):
            t = top(x)
            if t is not None and 0 <= x < 180: roof.put(x, int(t), tr if kind == 'boards' else r3); roof.put(x, int(t) + 1, tr if kind == 'boards' else r3)
    if kind == 'pastel':   # cresting on the flat top and dormers in the steep sides
        for x in range(22, 129, 3): roof.rect(x, 18, x, 21, 'gd'); roof.put(x + 1, 19, 'gd')
    if kind == 'logs':
        for k in range(12): rell(roof, rnd.uniform(25, 125), rnd.uniform(20, 64), rnd.uniform(2, 4), 1.6, 0, 'moss')
    L.append((roof, True))
    if kind == 'logs':
        mush = layer()
        for (x, y) in ((24, 54), (124, 50), (102, 34)): mush.rect(x, y + 1, x, y + 3, 'wh'); rell(mush, x, y, 2.4, 1.6, 0, 'mush'); mush.put(x - 1, y - 1, 'wh')
        L.append((mush, True))
    # chimney: brick, stone at the gable end, pastel, log cabin stone stack
    chim = layer()
    if kind == 'stone':
        chim.rect(0, 14, 9, 108, 'st1')
        for k in range(30): rell(chim, rnd.uniform(1, 8), rnd.uniform(16, 106), 2, 1.5, 0, rnd.choice(['st3', 'mo', 'st1']))
        chim.rect(-1, 11, 10, 14, 'mo')
    else:
        cx0 = {0: 104, 1: 108, 3: 110, 4: 40}[i]
        ctop = int((top(cx0 + 4) or 20) - 14)
        chim.rect(cx0, ctop, cx0 + 9, int(top(cx0 + 4)) + 4, ch); chim.rect(cx0 - 2, ctop - 3, cx0 + 11, ctop, tr)
        for y in range(ctop + 3, int(top(cx0 + 4)) + 4, 4): chim.rect(cx0, y, cx0 + 9, y, x2 if kind != 'timber' else 'brk2')
    L.append((chim, True))
    smoke = layer()
    sx = 4 if kind == 'stone' else {0: 108, 1: 112, 3: 114, 4: 44}[i] + 1
    sy = 8 if kind == 'stone' else int((top(sx + 3) or 20) - 20)
    for (dx, dy, rr) in ((0, 0, 3.2), (5, -5, 2.6), (11, -9, 2)): rell(smoke, sx + dx, sy + dy, rr, rr * .8, 0, 'smk'); smoke.put(int(sx + dx - 1), int(sy + dy - 1), 'wh')
    L.append((smoke, False))
    # attic room: inside the roof, a little below its surface
    att = layer(); xs = []
    for x in range(14, 137):
        t = top(x)
        if t is None: continue
        for y in range(int(t) + thick, eave + 1):
            if y < 65: att.put(x, y, 'mbd' if (x * 3 + y * 7) % 11 else 'mbd2'); xs.append((x, y))
        if int(t) + thick < 65: att.put(x, int(t) + thick, 'wd2')
    # rafters and a purlin following the roof, posts holding it
    for x in range(14, 137):
        t = top(x)
        if t is None: continue
        y = int(t) + thick + 6
        if y < 62 and att.p[y][x]: att.put(x, y, 'rf2'); att.put(x, y + 1, 'rf1')
        if x % 18 == 0:
            for yy in range(int(t) + thick + 1, 65):
                if att.p[yy][x]: att.put(x, yy, 'rf1'); att.put(x + 1, yy, 'rf2')
    # dithered shade right under the roof
    for x in range(14, 137):
        t = top(x)
        if t is None: continue
        for yy in range(int(t) + thick + 1, int(t) + thick + 4):
            if 0 <= yy < 65 and att.p[yy][x] and (x + yy) % 2 == 0: att.p[yy][x] = darkkey(att.p[yy][x], 0.14)
    for x in range(14, 137):
        t = top(x)
        if t is None: continue
        for y in range(int(t) + thick, 65):
            if att.p[y][x] and x <= 55: att.put(x, y, 'mb1' if (x * 3 + y * 7) % 11 else 'mb2')
            if att.p[y][x] and x <= 55 and y >= 56: att.put(x, y, 'mbt' if y % 3 else 'bt2')
    L.append((att, False))
    part = layer()
    for x in range(56, 59):
        t = top(x)
        for y in range(int(t) + thick, 65): part.put(x, y, w if x == 57 else x2)
    L.append((part, True))
    ys = [y for (x, y) in xs]; tops = {}
    for (x, y) in xs: tops[x] = min(tops.get(x, 99), y)
    bx = [x for x in tops if tops[x] <= 50 and x >= 59]
    broom = (59, max(40, min(tops[x] for x in bx)), max(bx), 64)
    bathr = (min(x for x in tops if tops[x] <= 58), max(40, min(tops[x] for x in tops if 20 <= x <= 55)), 55, 64)
    # ground floor rooms
    for name, bg1, bg2 in (('room', 'mk1', 'mk2'), ('kitchen', 'mkt', 'mkt2')):
        x0, y0, x1, y1 = GROUND2[name]; rm = layer()
        rm.rect(x0, y0, x1, y1, bg1)
        for y in range(y0 + 3, y1 - 4, 5):
            for x in range(x0 + 2 + ((y // 5) % 2) * 3, x1, 6): rm.put(x, y, bg2)
        if name == 'room':   # the hall: chequered floor by the front door
            for y in range(y1 - 3, y1):
                for x in range(x0, 40): rm.put(x, y, 'wh' if ((x // 2) + (y // 2)) % 2 else 'iron2')
        rm.rect(x0, y1 - 3, x1, y1, 'fp1'); rm.rect(x0, y1 - 3, x1, y1 - 3, 'fp3'); rm.rect(x0, y1, x1, y1, 'fp4')
        # soft shadow in the upper corners of every room
        for y in range(y0, y0 + 4):
            for x in range(x0, x1 + 1):
                if (x + y) % 2 == 0 or y == y0: rm.p[y][x] = darkkey(rm.p[y][x], 0.12)
        L.append((rm, False))
    slab = layer(); slab.rect(12, 65, 138, 69, 'wd'); slab.rect(12, 65, 138, 65, 'wd3'); slab.rect(12, 69, 138, 69, 'wd2')
    for x in (97, 98, 99): slab.rect(x, 70, x, 104, w if x != 99 else x2)
    slab.rect(40, 70, 41, 76, 'wd'); slab.rect(40, 70, 40, 104, 'wd2')
    L.append((slab, True))
    # --- tiny furniture ---
    f = layer()
    f.rect(21, 80, 29, 101, 'mgr2'); f.rect(22, 81, 28, 100, 'oak1'); f.rect(23, 83, 27, 89, 'jr2'); f.rect(25, 83, 25, 89, 'oak1'); f.put(27, 92, 'gd'); f.rect(20, 101, 30, 101, 'gd')
    f.rect(32, 82, 38, 83, 'wd'); f.rect(33, 84, 35, 93, 'rd'); f.rect(36, 84, 37, 90, 'tw1'); rell(f, 35, 81, 3, 1, 0, 'ye')
    f.rect(58, 90, 72, 100, 'rd'); f.rect(56, 92, 59, 100, 'rd'); f.rect(71, 92, 74, 100, 'rd'); f.rect(59, 95, 71, 96, 'qa'); f.rect(58, 90, 72, 90, 'pt3')
    f.rect(76, 82, 76, 101, 'gd'); f.poly([(73, 82), (79, 82), (78, 77), (74, 77)], 'qe'); f.rect(74, 101, 78, 102, 'gd')
    f.rect(83, 78, 94, 101, 'wh'); f.rect(85, 80, 92, 88, 'jr2'); f.rect(88, 80, 88, 88, 'wh'); f.rect(85, 84, 92, 84, 'wh'); f.put(92, 92, 'gd')
    rell(f, 64, 80, 4, 4, 0, 'wd'); rell(f, 64, 80, 3, 3, 0, 'wh'); f.put(64, 79, 'K'); f.put(65, 80, 'K')
    rell(f, 76, 103, 12, 1.6, 0, 'pt')
    f.rect(102, 80, 117, 101, 'brk')
    for y in range(82, 101, 3): f.rect(102, y, 117, y, 'brk2')
    f.rect(105, 88, 114, 101, 'so'); rell(f, 109.5, 88, 4.5, 3, 0, 'so')
    f.poly([(106, 101), (108, 95), (110, 101)], 'fire2'); f.poly([(109, 101), (111, 96), (113, 101)], 'fire'); rell(f, 109.5, 94, 3, 2, 0, 'iron')
    f.rect(119, 84, 130, 85, 'wd'); rell(f, 122, 88, 2, 2, 0, 'cu'); rell(f, 127, 88, 1.6, 1.6, 0, 'cu')
    f.rect(120, 95, 130, 96, 'wd'); f.rect(121, 97, 121, 101, 'wd2'); f.rect(129, 97, 129, 101, 'wd2'); rell(f, 125, 94, 2.4, 1, 0, 'cu')
    # attic: bed, round window, teddy, string lights (positioned inside the attic room)
    bx0, by0, bx1, by1 = broom; mid = (bx0 + bx1) // 2 - 4
    # upstairs bath: a little tub with foam, a towel and a mirror
    ux = 22; rell(f, ux + 11, 60, 10, 2.4, 0, 'tub2'); f.poly([(ux + 1, 60), (ux + 21, 60), (ux + 19, 64), (ux + 3, 64)], 'tub'); f.rect(ux + 1, 60, ux + 21, 60, 'tub3')
    for k in range(6): rell(f, ux + 3 + k * 3, 58 + (k % 2), 2, 1.5, 0, 'tub3')
    f.rect(ux + 25, 52, ux + 28, 60, 'tw1'); f.rect(ux + 26, 52, ux + 26, 60, 'tw2'); f.rect(ux + 24, 51, ux + 30, 51, 'cu')
    rell(f, ux + 15, 50, 2.6, 3.2, 0, 'wd'); rell(f, ux + 15, 50, 1.8, 2.4, 0, 'jr')
    f.rect(mid - 28, 55, mid - 25, 64, 'wd'); f.rect(mid - 26, 58, mid - 2, 61, 'pil2'); rell(f, mid - 21, 58, 4, 2, 0, 'pil')
    for k in range(5): f.rect(mid - 17 + k * 3, 59, mid - 15 + k * 3, 62, ('qa', 'qb', 'qc', 'qd', 'qe')[k])
    f.rect(mid - 4, 57, mid - 2, 64, 'wd'); f.rect(mid - 26, 62, mid - 2, 63, 'wd')
    wy = max(by0 + 6, 46)
    rell(f, mid + 8, wy, 5, 5, 0, 'wd'); rell(f, mid + 8, wy, 3.8, 3.8, 0, 'msky'); f.rect(mid + 8, wy - 4, mid + 8, wy + 4, 'wd'); f.rect(mid + 4, wy, mid + 12, wy, 'wd')
    rell(f, mid + 20, 60, 3, 3.4, 0, 'tb'); rell(f, mid + 20, 55.5, 2.4, 2.2, 0, 'tb'); f.put(mid + 18, 54, 'tb'); f.put(mid + 22, 54, 'tb'); f.put(mid + 19, 55, 'K'); f.put(mid + 21, 55, 'K')
    for k in range(6): f.rect(124 - k * 3, 64 + k, 128 - k * 3, 64 + k, 'wd3')
    rell(f, mid - 12, 64, 16, 1.4, 0, 'qc')
    L.append((f, True))
    lights = layer()
    for k in range(10):
        x = bx0 + 4 + k * (bx1 - bx0 - 8) / 9; t = top(int(x))
        if t is not None: lights.put(int(x), int(t) + thick + 3 + (k % 2), ('lt', 'qa', 'qd', 'lt2')[k % 4])
    L.append((lights, False))
    # --- outside details per style ---
    ex = layer()
    # garden door on the right wall
    ex.rect(138, 88, 145, 108, tr); ex.rect(139, 89, 144, 107, 'wd'); rell(ex, 141.5, 89, 3.5, 3, 0, 'wd'); ex.put(143, 99, 'gd')
    ex.rect(137, 107, 147, 109, 'st1')
    if kind == 'timber':   # bench and rain barrel on the left
        ex.rect(0, 96, 7, 108, 'wd'); ex.rect(0, 99, 7, 99, 'iron'); ex.rect(0, 104, 7, 104, 'iron'); rell(ex, 3.5, 96, 3.5, 1.2, 0, 'wat')
    elif kind == 'boards':   # white veranda with railing on the right, a flag pole
        ex.rect(146, 80, 152, 82, 'wh'); ex.rect(150, 82, 151, 108, 'wh'); ex.rect(146, 96, 152, 96, 'wh')
        for x in range(146, 152, 2): ex.rect(x, 96, x, 108, 'wh')
        ex.rect(3, 40, 3, 108, 'wh'); ex.rect(4, 40, 10, 42, 'qc'); ex.rect(4, 43, 10, 45, 'ye'); ex.rect(4, 46, 10, 48, 'qc')
    elif kind == 'stone':   # climbing roses
        for k in range(16): rell(ex, 12 + rnd.uniform(0, 4), 70 + k * 2.4, 1.6, 1.4, 0, 'hb' if k % 3 else 'rd')
    elif kind == 'pastel':   # lamp post and a striped awning over the garden door
        ex.rect(3, 72, 4, 108, 'iron'); rell(ex, 3.5, 70, 3, 3, 0, 'lt'); ex.rect(1, 66, 6, 67, 'iron')
        for x in range(136, 148): ex.rect(x, 84, x, 87, 'pt' if (x // 2) % 2 else 'wh')
    else:   # wood pile and lantern
        for k in range(9): rell(ex, 3 + (k % 3) * 3, 107 - (k // 3) * 3, 1.6, 1.6, 0, 'wd3'); 
        for k in range(9): ex.put(3 + (k % 3) * 3, 107 - (k // 3) * 3, 'wd2')
        ex.rect(146, 82, 149, 86, 'iron'); ex.rect(147, 83, 148, 85, 'lt')
    L.append((ex, True))
    # little things around the house: bushes in the style of the garden hedge, flower pots, stepping stones
    out = layer(); rnd2 = random.Random(70 + i)
    for (cx, cy, wdt) in ((4, 104, 10), (148, 104, 8)):
        for k in range(14):
            x0, y0, rr = cx + rnd2.uniform(-wdt, wdt), cy + rnd2.uniform(-5, 3), rnd2.uniform(2.6, 4.4)
            rell(out, x0 + .5, y0 + 1, rr, rr * .8, 0, 'hdg2'); rell(out, x0, y0, rr * .9, rr * .7, 0, 'hdg1'); rell(out, x0 - rr * .3, y0 - rr * .3, rr * .4, rr * .3, 0, 'hdg3')
        for k in range(5): out.put(cx + rnd2.uniform(-wdt, wdt), cy + rnd2.uniform(-5, 2), rnd2.choice(['rd', 'ye', 'wh', 'pt']))
    for (x, c) in ((127, 'rd'), (133, 'ye')):
        out.poly([(x - 3, 108), (x + 3, 108), (x + 2, 112), (x - 2, 112)], 'cu'); out.rect(x - 3, 108, x + 3, 108, 'cu3')
        rell(out, x, 106, 2.6, 1.8, 0, 'hb'); rell(out, x, 104.5, 1.4, 1.2, 0, c)
    for k, (x, y) in enumerate(((146, 113), (152, 115), (158, 116))): rell(out, x, y, 3, 1.4, 0, 'st1'); out.put(x - 1, y - 1, 'st3')
    L.append((out, True))
    g = compose(L)
    # shadow on the ground (drawn as its own see-through layer in the page)
    shadow = layer()
    for y in range(108, 117):
        for x in range(4, 160):
            inside = 108 <= y <= 113 and 6 <= x <= 150 and (y - 108) < (150 - x) * 0.25
            soft = 113 < y <= 116 and 6 <= x <= 156 and (x + y) % 2 == 0
            if (inside or soft) and g.p[y][x] is None: shadow.put(x, y, 'K')
    put_svg('house_shadow_%d' % i, shadow)
    # snow lying on the roof and the chimney (shown in winter)
    snow = layer()
    for x in range(-2, 153):
        t = top(x)
        if t is None or not (0 <= x < 180): continue
        for d in range(0, 3 if (x // 5) % 3 else 4):
            y = int(t) + d - 1
            if 0 <= y < 135: snow.put(x, y, 'wh' if d < 2 else 'smk2')
    for x in range(10, 141, 1): snow.put(x, 106, 'wh'); snow.put(x, 105, 'wh') if x % 3 else None
    put_svg('house_snow_%d' % i, outl2(snow) if 'outl2' in globals() else snow)
    ROOMS_BY_STYLE.append(dict(GROUND2, bedroom=broom, bath=bathr))
    ap = ''
    for x in range(14, 137):
        t = top(x)
        if t is None: continue
        y0 = int(t) + thick
        if y0 < 65: ap += 'M%d %dh1V65h-1z' % (x, y0)
    ATTIC.append(ap)
    return g

for i in range(5): put_svg('house_%d' % i, house_map(i))
def map_ham(g):
    rell(g, 6, 6, 5.6, 5, 0, 'qe'); g.put(2, 2, 'qe'); rell(g, 2, 1.6, 1.8, 1.8, 0, 'qe'); rell(g, 10, 1.6, 1.8, 1.8, 0, 'qe')
    rell(g, 6, 8, 3.4, 2.4, 0, 'wh'); g.px('K', [(4, 5), (8, 5)]); g.put(6, 7, 'qa')
C(qe='#e9a44c')
mk('map_ham', 13, 12, map_ham)

# ================= the stairwell, seen in a small pop-up while the hamster climbs (100 x 64) =================
C(sw1='#f3e6cf', sw2='#e8d6b4', sw3='#d8c09a', stp='#a06a38', stp2='#7e4e24', stp3='#c08a50', run='#c8463c', run2='#a8342c', run3='#e8706a')
STEPS = [(6 + 13 * k, 58 - 7 * k) for k in range(7)]
def stairs_view():
    def L(): return G(100, 64)
    def comp(ls):
        g = G(100, 64)
        for (l, ol) in ls:
            if ol: l.outline('K')
            for y in range(64):
                for x in range(100):
                    if l.p[y][x] is not None: g.p[y][x] = l.p[y][x]
        return g
    wall = L(); wall.rect(0, 0, 99, 63, 'sw1')
    for y in range(4, 64, 8):
        for x in range((y // 8) % 2 * 6, 100, 12): wall.put(x, y, 'sw3'); wall.put(x, y - 1, 'sw2'); wall.put(x - 1, y, 'sw2'); wall.put(x + 1, y, 'sw2'); wall.put(x, y + 1, 'sw2')
    rell(wall, 22, 12, 10, 8, 0, 'mbd'); rell(wall, 22, 12, 6, 5, 0, 'mbd2')
    deco = L()
    deco.rect(21, 8, 23, 14, 'gd'); rell(deco, 22, 7, 3, 2, 0, 'lt')
    rell(deco, 68, 6, 5, 5, 0, 'wd'); rell(deco, 68, 6, 3.8, 3.8, 0, 'msky'); deco.rect(68, 2, 68, 10, 'wd'); deco.rect(64, 6, 72, 6, 'wd')
    deco.rect(44, 4, 55, 15, 'wd'); deco.rect(45, 5, 54, 14, 'jr'); rell(deco, 49.5, 8, 2.6, 2.6, 0, 'ye'); deco.put(49, 8, 'cu2'); deco.rect(49, 11, 49, 14, 'hb'); deco.put(48, 12, 'hb')
    steps = L()
    for k, (x, y) in enumerate(STEPS):
        steps.rect(x, y, min(99, x + 13), 63, 'stp2')
        steps.rect(x, y, min(99, x + 13), y + 1, 'stp3'); steps.rect(x, y + 2, min(99, x + 13), y + 6, 'stp')
        steps.rect(x + 3, y, min(99, x + 10), y + 4, 'run'); steps.rect(x + 3, y, min(99, x + 10), y, 'run3'); steps.rect(x + 3, y + 4, min(99, x + 10), y + 4, 'run2')
        for yy in range(y + 8, 64, 3): steps.put(x + (yy * 3) % 13, yy, 'wd2')
    rail = L()
    for k, (x, y) in enumerate(STEPS): rail.rect(x + 6, y - 11, x + 6, y - 1, 'wd3')
    for x in range(6, 100):
        y = 47 - (x - 6) * 7 / 13; rail.put(x, int(y), 'wd'); rail.put(x, int(y) + 1, 'wd')
    rell(rail, 7, 47, 2, 2, 0, 'wd3')
    return comp([(wall, False), (deco, True), (steps, True), (rail, True)])
put_svg('stairs_view', stairs_view())

# ================= the bedroom in layers, so it can be furnished (3 choices each) =================
from beds_lib import BEDS, mkg
C(ws1='#f6dce0', ws2='#e8b4bc', ws3='#fbeef0', nb1='#3e4a7a', nb2='#4e5a8e', nb3='#ffe08a', nb4='#c8d0f0', cp1='#9aa6c0', cp2='#8a96b2', cp3='#b0bcd4',
  sh1='#fbf8f2', sh2='#e8e2d6', sh3='#d8d0c0', hr1='#f4a3b4', hr2='#e07f95', hr3='#ffc8d4', lace='#fbf8f2', fb='#a0603a', egg5='#c4a8ec')
def bwin_hole(w):
    if w == 0: return lambda x, y: ((x + .5 - 90) / 17) ** 2 + ((y + .5 - 31) / 17) ** 2 <= 1
    if w == 1: return lambda x, y: 75 <= x <= 105 and 16 <= y <= 46
    return lambda x, y: (76 <= x <= 104 and 26 <= y <= 48) or (((x + .5 - 90) / 14) ** 2 + ((y + .5 - 26) / 12) ** 2 <= 1 and y < 26)
def outl2(g): g.outline('K'); return g
def b_wall(i, w):
    g = G(180, 135); rnd = random.Random(40 + i)
    if i == 0:
        g.rect(0, 0, 179, 99, 'aw')
        for y in range(8, 98, 10):
            for x in range((y // 10) % 2 * 7, 180, 14): g.put(x, y, 'aw3'); g.put(x - 1, y + 1, 'hb'); g.put(x + 1, y + 1, 'hb'); g.put(x, y - 1, 'qa')
    elif i == 1:   # rosy stripes with tiny dots
        g.rect(0, 0, 179, 99, 'ws3')
        for x in range(0, 180, 10): g.rect(x, 0, x + 3, 99, 'ws1'); g.rect(x + 4, 0, x + 4, 99, 'ws2')
        for y in range(6, 99, 9):
            for x in range(7, 180, 10): g.put(x, y + (x // 10) % 2 * 4, 'ws2')
    else:          # night blue with little stars and moons
        g.rect(0, 0, 179, 99, 'nb1')
        for k in range(110):
            x, y = rnd.randint(0, 179), rnd.randint(4, 98); g.put(x, y, rnd.choice(['nb2', 'nb2', 'nb4']))
        for k in range(26):
            x, y = rnd.randint(2, 177), rnd.randint(6, 96)
            if k % 5 == 0: rell(g, x, y, 2, 2, 0, 'nb3'); g.put(x + 1, y - 1, 'nb1'); g.put(x + 1, y, 'nb1')
            else: g.put(x, y, 'nb3'); g.put(x - 1, y, 'nb3'); g.put(x + 1, y, 'nb3'); g.put(x, y - 1, 'nb3'); g.put(x, y + 1, 'nb3')
    inside = bwin_hole(w)
    for yy in range(10, 52):
        for xx in range(70, 111):
            if inside(xx, yy): g.p[yy][xx] = None
    return g
def b_slope(side=1):
    g = G(180, 135); W0, Y0 = 30, 74
    for y in range(0, Y0):
        wdt = int(W0 - y * W0 / Y0)
        for x in range(wdt):
            xx = x if side == 0 else 179 - x
            c = 'rf1' if x // 7 % 2 else 'rf2'
            if (x - (W0 - y)) % 7 == 0: c = 'rf3'
            g.put(xx, y, c)
        edge = wdt if side == 0 else 179 - wdt
        g.put(edge, y, 'bm'); g.put(edge + (1 if side == 0 else -1), y, 'bm2')
    for k in range(3):
        y0 = 12 + k * 18; w0 = int(W0 - y0 * W0 / Y0)
        if side == 0: g.rect(0, y0, w0, y0 + 2, 'bm'); g.rect(0, y0 + 2, w0, y0 + 2, 'bm2')
        else: g.rect(179 - w0, y0, 179, y0 + 2, 'bm'); g.rect(179 - w0, y0 + 2, 179, y0 + 2, 'bm2')
    g.rect(0, 0, 179, 4, 'bm'); g.rect(0, 4, 179, 4, 'bm2')
    return g
def b_window(i):
    g = G(180, 135); inside = bwin_hole(i)
    if i == 0:
        for yy in range(12, 50):
            for xx in range(71, 109):
                d = ((xx + .5 - 90) / 17) ** 2 + ((yy + .5 - 31) / 17) ** 2
                if 1 < d <= 1.3: g.p[yy][xx] = 'wd'
        for yy in range(14, 48):
            if inside(90, yy): g.put(90, yy, 'wd2')
        for xx in range(73, 108):
            if inside(xx, 31): g.put(xx, 31, 'wd2')
        g.rect(68, 51, 112, 53, 'wd3'); g.rect(68, 53, 112, 53, 'wd2')
        for (x0, x1) in ((64, 72), (108, 116)):
            g.rect(x0, 10, x1, 44, 'qc')
            for yy in range(10, 45, 3): g.rect(x0, yy, x1, yy, 'qb')
        g.rect(62, 8, 118, 9, 'wd2')
    elif i == 1:   # square dormer window with shutters and a flower box
        g.rect(72, 13, 108, 49, 'wd')
        for yy in range(16, 47):
            for xx in range(75, 106): g.p[yy][xx] = None
        g.rect(90, 16, 90, 46, 'wd'); g.rect(75, 31, 105, 31, 'wd')
        for x0 in (60, 109):
            g.rect(x0, 12, x0 + 10, 50, 'qc'); g.rect(x0, 12, x0 + 10, 12, 'kn2' if 'kn2' in pal else 'qc')
            for yy in range(15, 50, 3): g.rect(x0 + 1, yy, x0 + 9, yy, 'qb')
        g.rect(70, 50, 110, 55, 'fb'); g.rect(70, 50, 110, 50, 'wd3')
        for kk, x in enumerate(range(73, 108, 5)): g.rect(x, 46, x, 49, 'hb2'); rell(g, x, 45, 1.8, 1.6, 0, ('rd', 'ye', 'egg5', 'wh')[kk % 4])
    else:          # arched window with lace and a cushioned window seat
        for yy in range(10, 52):
            for xx in range(72, 109):
                if (xx >= 73 and xx <= 107 and yy >= 26) or ((xx + .5 - 90) / 17) ** 2 + ((yy + .5 - 26) / 15) ** 2 <= 1:
                    if not inside(xx, yy): g.p[yy][xx] = 'wd'
        g.rect(90, 14, 90, 48, 'wd2'); g.rect(77, 34, 103, 34, 'wd2')
        for xx in range(77, 104):
            for yy in range(15, 26):
                if inside(xx, yy) and (xx + yy) % 3 == 0 and yy < 21: g.put(xx, yy, 'lace')
            if xx % 2: g.put(xx, 21, 'lace')
        g.rect(66, 49, 114, 56, 'wd'); g.rect(66, 49, 114, 49, 'wd3'); rell(g, 90, 49, 22, 2.4, 0, 'hr1'); rell(g, 78, 47, 5, 3, 0, 'pil'); rell(g, 102, 47, 5, 3, 0, 'qc')
    return g
def b_floor(i):
    g = G(180, 135); rnd = random.Random(60 + i)
    if i == 0: planks(g, 100, rnd); return g
    if i == 1:
        for y in range(100, 135):
            for x in range(180):
                yy = y - 100; blk = x // 14; dd = (x % 14) + (yy if blk % 2 else -yy)
                c = 'fp1' if (dd // 5) % 2 else 'fp3'
                if dd % 5 == 0 or x % 14 == 0: c = 'fp4'
                g.put(x, y, c)
    else:          # soft wall-to-wall carpet
        for y in range(100, 135):
            for x in range(180): g.put(x, y, 'cp1' if (x + y * 3) % 7 else 'cp2')
        for k in range(160): g.put(rnd.randint(0, 179), rnd.randint(101, 134), 'cp3')
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
    return g
def b_rug(i):
    g = G(180, 135)
    if i == 0:
        for j, c in enumerate(('qc', 'qb', 'qa', 'qb', 'qe')): rell(g, 92, 118, 34 - j * 6, 9 - j * 1.6, 0, c)
    elif i == 1:   # fluffy sheepskin
        rnd = random.Random(3)
        rell(g, 92, 118, 30, 9, 0, 'sh1')
        for a in range(0, 360, 14):
            r = math.radians(a); rell(g, 92 + math.cos(r) * 29, 118 + math.sin(r) * 8.6, 3, 2, 0, 'sh1')
        for k in range(60): g.put(92 + rnd.uniform(-26, 26), 118 + rnd.uniform(-7, 7), rnd.choice(['sh2', 'sh3']))
    else:          # pink heart rug
        for y in range(104, 132):
            for x in range(64, 121):
                u = (x - 92) / 26; v = -(y - 114) / 16
                if (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0: g.put(x, y, 'hr1')
        for y in range(104, 132):
            for x in range(64, 121):
                u = (x - 92) / 21; v = -(y - 114.5) / 12.5
                if (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0: g.put(x, y, 'hr3' if (x + y) % 5 else 'hr1')
    return g
def b_front():
    g = G(180, 135)
    g.rect(132, 72, 164, 99, 'wd'); g.rect(130, 70, 166, 72, 'wd3')
    for y in (76, 84, 92): g.rect(134, y, 162, y + 5, 'wd2'); g.rect(135, y + 1, 161, y + 4, 'wd'); g.rect(146, y + 2, 149, y + 3, 'gd')
    rell(g, 148, 64, 6, 6, 0, 'tb'); rell(g, 148, 57, 4, 4, 0, 'tb'); rell(g, 145, 54, 1.6, 1.6, 0, 'tb'); rell(g, 151, 54, 1.6, 1.6, 0, 'tb')
    rell(g, 148, 65, 3, 3.4, 0, 'aw2'); g.px('K', [(147, 57), (149, 57)]); g.put(148, 58, 'tb2')
    g.rect(108, 84, 122, 99, 'wd'); g.rect(106, 82, 124, 84, 'wd3'); g.rect(110, 88, 120, 92, 'wd2'); g.rect(114, 89, 116, 90, 'gd')
    g.rect(114, 74, 116, 81, 'wh'); g.put(115, 73, 'ye'); g.put(115, 72, 'lt2'); rell(g, 115, 81.5, 3, 0.8, 0, 'gd')
    g.rect(118, 79, 123, 81, 'qa'); g.rect(118, 79, 123, 79, 'qb')
    g.rect(150, 104, 179, 106, 'wd'); g.rect(150, 104, 179, 104, 'wd3')
    for x in range(152, 180, 5): g.rect(x, 106, x + 1, 120, 'wd2')
    g.rect(150, 106, 151, 122, 'wd'); rell(g, 150.5, 103, 2, 1.6, 0, 'wd3')
    return g
for w in range(3):
    for i in range(3): put_svg('bw_%d_%d' % (i, w), b_wall(i, w))
for i in range(3):
    put_svg('bf_%d' % i, b_floor(i)); put_svg('bwin_%d' % i, outl2(b_window(i))); put_svg('br_%d' % i, outl2(b_rug(i)))
put_svg('b_slope', outl2(b_slope())); put_svg('bath_slope', outl2(b_slope(0))); put_svg('b_front', outl2(b_front()))
BEDINFO = []
for n, (name, bf, bsz, ff, fsz, bpos, fpos, hpos) in enumerate(BEDS[:3] + BEDS[4:]):
    put_svg('bedb_%d' % n, mkg(bf, *bsz)); put_svg('bedf_%d' % n, mkg(ff, *fsz))
    BEDINFO.append(dict(name=name, back=bpos, front=fpos, ham=hpos))

# a tiny side-view hamster for the stairwell pop-up, same pixel size as the stairs
C(mh='#e9a44c', mh2='#c98232', mh3='#f7c47e', mhw='#fff6e4', mhp='#f4a3b4')
def mini_ham(step):
    # the hamster from the front, as we always see him, at the stairwell's pixel size
    def f(g):
        rell(g, 9, 10.5, 7.6, 6.6, 0, 'mh')
        for x in (3.6, 14.4): rell(g, x, 4.4, 2.2, 2.2, 0, 'mh'); g.put(int(x), 4, 'mhp')
        rell(g, 6, 6.5, 2.4, 1.4, 0, 'mh3')
        rell(g, 9, 14.4, 4.4, 2.8, 0, 'mhw'); rell(g, 9, 11.2, 2.8, 1.6, 0, 'mhw')
        g.px('K', [(6, 7), (6, 8), (12, 7), (12, 8)]); g.px('wh', [(6, 7), (12, 7)]) if False else None; g.put(9, 10, 'mhp')
        g.px('mhp', [(4, 10), (14, 10)])
        g.px('mh2', [(7, 13), (11, 13)])
        if step: g.px('mhp', [(5, 17), (6, 17), (12, 16), (13, 16)])
        else: g.px('mhp', [(5, 16), (6, 16), (12, 17), (13, 17)])
    return f
mk('mini_ham0', 18, 18, mini_ham(0)); mk('mini_ham1', 18, 18, mini_ham(1))

# ================= festival decorations =================
C(fir='#2e6a3a', fir2='#3e8a4a', fir3='#5aa864', fir4='#1e4a2a', bow='#d8433a', bow2='#a02a24', gold='#f0c040', gold2='#c89418', glw='#fff2a8',
  cand='#e85a4a', cand2='#f6efe2', web='#f4f0f8', web2='#c8c4d0', bat='#3a2e44', bat2='#5a4a6a', ghost='#f6f6fb', ghost2='#d8d8e8', jo='#f08a2a', jo2='#c8641a', jo3='#ffb060', jl='#ffe08a', jd='#3a1a08',
  hp='#f08a2a', hp2='#3a2e44', hp3='#8a5ac8', sto='#d8433a', sto2='#f6efe2', sto3='#3e8a4a', gb1='#d8433a', gb2='#3e6ea8', gb3='#f0c040', gb4='#3e8a4a', gb5='#c4a8ec', gbr='#f6efe2',
  gin='#b8763a', gin2='#8a5222', gin3='#f6efe2', mil='#f8f8f8', bal1='#ff5a5a', bal2='#ffd84a', bal3='#6ab0ff', bal4='#9ad070', bal5='#f4a0c0', cf='#ffffff')
def garland(g):
    w = g.w
    for x in range(w):
        y = 3 + 4 * math.sin(((x % 42) / 42) * math.pi)
        for d in range(-2, 3): g.put(x, y + d, 'fir' if (x + d) % 3 else 'fir2')
        if x % 3 == 0: g.put(x, y - 3, 'fir3'); g.put(x + 1, y + 3, 'fir4')
    for x in range(0, w, 42):
        rell(g, x, 3, 3, 2.2, 0, 'bow'); g.poly([(x - 1, 4), (x - 4, 10), (x - 1, 9)], 'bow2'); g.poly([(x + 1, 4), (x + 4, 10), (x + 1, 9)], 'bow2'); g.put(x, 3, 'bow2')
    for x in range(14, w, 14): rell(g, x, 3 + 4 * math.sin(((x % 42) / 42) * math.pi) + 2.5, 1.4, 1.4, 0, 'gold' if (x // 14) % 2 else 'bow')
mk('f_garland', 170, 12, garland)
def wreath(n):
    def f(g):
        g.rect(4, 0, 4, 12, 'bow'); g.rect(29, 0, 29, 12, 'bow'); g.rect(16, 0, 17, 9, 'bow')
        rell(g, 16.5, 22, 15, 5, 0, 'fir4'); rell(g, 16.5, 21, 14, 4.4, 0, 'fir')
        for a in range(0, 360, 20): r = math.radians(a); g.put(16.5 + math.cos(r) * 12, 21 + math.sin(r) * 3.6, 'fir3')
        rell(g, 16.5, 21, 7, 1.8, 0, 'fir4')
        for (x, y) in ((7, 23), (26, 23), (13, 25), (20, 25)): rell(g, x, y, 1.2, 1.2, 0, 'bow')
        for k, x in enumerate((6, 13, 20, 27)):
            yb = 20 - (1 if k in (1, 2) else 0)
            g.rect(x - 1, yb - 7, x + 1, yb, 'cand'); g.rect(x - 1, yb - 7, x - 1, yb, 'cand2')
            if k < n: g.put(x, yb - 9, 'glw'); g.put(x, yb - 8, 'gold'); g.put(x, yb - 10, 'jl')
            else: g.put(x, yb - 8, 'jd')
    return f
for n in range(5): mk('f_wreath%d' % n, 34, 28, wreath(n))
def hstar(g):
    # a glowing paper star hanging in the window
    g.rect(9, 0, 9, 4, 'bow2')
    cx, cy = 9.5, 13
    for i in range(8):
        r = math.radians(i * 45 - 90); l = 8 if i % 2 == 0 else 6
        g.poly([(cx + math.cos(r - .5) * 3, cy + math.sin(r - .5) * 3), (cx + math.cos(r) * l, cy + math.sin(r) * l), (cx + math.cos(r + .5) * 3, cy + math.sin(r + .5) * 3)], 'gold' if i % 2 else 'glw')
    rell(g, cx, cy, 3.4, 3.4, 0, 'jl'); rell(g, cx - 1, cy - 1, 1.2, 1.2, 0, 'glw')
mk('f_star', 20, 23, hstar)
def stocking(c, c2):
    def f(g):
        g.rect(1, 0, 8, 3, 'sto2'); g.poly([(2, 3), (8, 3), (8, 12), (12, 14), (11, 17), (4, 16), (2, 13)], c)
        g.rect(3, 6, 7, 6, c2); g.rect(3, 10, 7, 10, c2); g.put(10, 15, 'sto2'); g.put(5, 15, 'sto2')
    return f
mk('f_stock0', 14, 18, stocking('sto', 'sto2')); mk('f_stock1', 14, 18, stocking('sto3', 'sto2')); mk('f_stock2', 14, 18, stocking('gb2', 'gold'))
def mistle(g):
    g.rect(8, 0, 8, 5, 'bow2'); rell(g, 8, 6, 2.6, 1.8, 0, 'bow')
    for (x, y, a) in ((3, 10, 'fir2'), (13, 10, 'fir2'), (6, 13, 'fir3'), (10, 13, 'fir3')): rell(g, x, y, 3, 1.6, 0, a)
    for (x, y) in ((7, 9), (9, 10), (8, 11)): rell(g, x, y, 1.2, 1.2, 0, 'mil')
mk('f_mistle', 17, 16, mistle)
# --- pumpkin night ---
def web(g):
    for a in range(0, 91, 15):
        r = math.radians(a)
        for t in range(0, 28): g.put(math.cos(r) * t, math.sin(r) * t, 'web')
    for rr in (6, 11, 16, 21, 26):
        for a in range(0, 91, 3): r = math.radians(a); g.put(math.cos(r) * rr - (a % 15) * 0.05, math.sin(r) * rr - (a % 15) * 0.05, 'web2' if rr > 16 else 'web')
    rell(g, 15, 15, 2, 2.4, 0, 'bat'); g.put(14, 13, 'bat'); g.put(16, 13, 'bat'); g.px('bat', [(12, 15), (18, 15), (12, 17), (18, 17)])
mk('f_web', 28, 28, web, ol=False)
def bat(up):
    def f(g):
        rell(g, 7, 4, 2, 2, 0, 'bat'); g.put(6, 2, 'bat'); g.put(8, 2, 'bat'); g.put(6, 4, 'jl'); g.put(8, 4, 'jl')
        if up: g.poly([(5, 4), (0, 0), (1, 4), (3, 5)], 'bat2'); g.poly([(9, 4), (14, 0), (13, 4), (11, 5)], 'bat2')
        else: g.poly([(5, 4), (0, 6), (2, 7), (4, 6)], 'bat2'); g.poly([(9, 4), (14, 6), (12, 7), (10, 6)], 'bat2')
    return f
mk('f_bat0', 15, 8, bat(True)); mk('f_bat1', 15, 8, bat(False))
def ghost(g):
    rell(g, 8, 7, 7, 7, 0, 'ghost'); g.rect(1, 7, 15, 16, 'ghost')
    for x in range(1, 16, 4): rell(g, x + 1.5, 16.5, 2, 1.6, 0, 'ghost')
    g.rect(13, 7, 15, 16, 'ghost2'); g.px('K', [(5, 6), (5, 7), (10, 6), (10, 7)]); rell(g, 7.5, 10, 1.6, 1.2, 0, 'K'); g.px('bp' if 'bp' in pal else 'jl', [(3, 9), (12, 9)])
mk('f_ghost', 17, 19, ghost)
def jack(face, lit):
    def f(g):
        rell(g, 9, 9, 8.6, 7, 0, 'jo'); g.rect(6, 3, 6, 15, 'jo2'); g.rect(12, 3, 12, 15, 'jo2'); rell(g, 5, 6, 2, 1.6, 0, 'jo3')
        g.rect(8, 0, 10, 3, 'fir'); g.put(11, 1, 'fir3')
        c = 'jl' if lit else 'jd'
        if face == 0: g.poly([(4, 6), (7, 6), (5.5, 9)], c); g.poly([(11, 6), (14, 6), (12.5, 9)], c); g.poly([(4, 11), (14, 11), (12, 14), (6, 14)], c); g.px('jo', [(7, 11), (10, 11), (8, 13), (11, 13)])
        else: g.poly([(4, 7), (7, 5), (7, 8)], c); g.poly([(14, 7), (11, 5), (11, 8)], c); g.poly([(3, 11), (15, 10), (9, 15)], c); g.px('jo', [(6, 11), (9, 11), (12, 11)])
    return f
for face in (0, 1):
    for lit in (0, 1): mk('f_jack%d%s' % (face, 'on' if lit else 'off'), 18, 17, jack(face, lit))
def hbunting(g):
    w = g.w
    for x in range(w): g.put(x, 1 + 2 * math.sin(x / w * math.pi), 'jd')
    for k, x in enumerate(range(2, w - 6, 10)):
        y = 2 + 2 * math.sin(x / w * math.pi); c = ('hp', 'hp2', 'hp3')[k % 3]
        g.poly([(x, y), (x + 8, y), (x + 4, y + 8)], c)
        if c == 'hp2': g.put(x + 4, y + 3, 'jl')
mk('f_hbunting', 170, 12, hbunting)
def candle(g): g.rect(1, 4, 4, 11, 'cand2'); g.rect(4, 5, 4, 11, 'web2'); g.put(2, 2, 'jl'); g.put(2, 3, 'gold'); g.put(3, 1, 'glw'); rell(g, 2.5, 11.5, 3, 1, 0, 'web2')
mk('f_candle', 6, 13, candle)
# --- christmas ---
def bigtree(g):
    g.rect(20, 56, 24, 63, 'gin2'); g.poly([(14, 63), (30, 63), (28, 67), (16, 67)], 'bow'); g.rect(14, 63, 30, 63, 'gold')
    for k, (y0, hw) in enumerate(((6, 6), (14, 10), (22, 13), (31, 16), (40, 19), (49, 21))):
        g.poly([(22 - hw, y0 + 9), (22, y0 - 4), (22 + hw, y0 + 9)], 'fir')
        for x in range(22 - hw, 22 + hw + 1, 2): g.put(x, y0 + 9, 'fir4'); g.put(x + 1, y0 + 8, 'fir')
        g.poly([(22 - hw + 3, y0 + 6), (22, y0 - 2), (22 - 1, y0 + 6)], 'fir2')
    for k in range(5): line(g, 22 - 4 - k * 4, 14 + k * 9, 22 + 4 + k * 4, 18 + k * 9, 'gold')
    rnd = random.Random(5)
    for k in range(18):
        y = rnd.uniform(12, 56); hw = (y - 4) * 0.4
        x = 22 + rnd.uniform(-hw, hw); rell(g, x, y, 1.4, 1.4, 0, rnd.choice(['gb1', 'gb2', 'gb3', 'gb5'])); g.put(int(x) - 1, int(y) - 1, 'gbr')
mk('f_xtree', 45, 68, bigtree)
def treelights(g):
    rnd = random.Random(9)
    for k in range(26):
        y = rnd.uniform(10, 56); hw = (y - 4) * 0.42; g.put(22 + rnd.uniform(-hw, hw), y, rnd.choice(['glw', 'jl', 'bal3', 'bal5']))
    for (a, l) in [(i * 72, 5) for i in range(5)]:
        r = math.radians(a - 90); g.poly([(22 + math.cos(r - .5) * 1.6, 3 + math.sin(r - .5) * 1.6), (22 + math.cos(r) * l, 3 + math.sin(r) * l), (22 + math.cos(r + .5) * 1.6, 3 + math.sin(r + .5) * 1.6)], 'gold')
    rell(g, 22, 3, 1.6, 1.6, 0, 'glw')
mk('f_xlights', 45, 68, treelights, ol=False)
def gift(w, h, c, c2):
    def f(g):
        g.rect(0, 3, w - 1, h - 1, c); g.rect(w // 2 - 1, 3, w // 2, h - 1, c2); g.rect(0, 3 + (h - 3) // 2, w - 1, 3 + (h - 3) // 2, c2)
        g.rect(0, 3, w - 1, 3, c2); rell(g, w // 2 - 2, 2, 2, 1.6, 0, c2); rell(g, w // 2 + 2, 2, 2, 1.6, 0, c2)
    return f
for k, (w, h, c, c2) in enumerate(((12, 11, 'gb1', 'gb3'), (9, 13, 'gb2', 'gbr'), (14, 9, 'gb4', 'gb1'), (8, 8, 'gb5', 'gb3'))): mk('f_gift%d' % k, w, h, gift(w, h, c, c2))
def ginger(g):
    g.rect(2, 8, 17, 17, 'gin'); g.poly([(0, 9), (9.5, 0), (19, 9)], 'gin2')
    for x in range(1, 19, 2): g.put(x, 9 - abs(x - 9.5) * 0.9 + 1, 'gin3')
    g.rect(8, 12, 11, 17, 'gin2'); g.rect(4, 11, 6, 13, 'gold'); g.rect(13, 11, 15, 13, 'gold')
    g.px('bow', [(3, 15), (16, 15), (9, 5)]); g.px('fir3', [(5, 16), (14, 16)])
mk('f_ginger', 20, 18, ginger)
def cookies(g):
    rell(g, 6, 7, 6, 1.8, 0, 'mil'); for_ = [rell(g, x, 5.6, 1.8, 1.2, 0, 'gin') for x in (3.5, 7, 10)]
    g.rect(13, 0, 17, 8, 'mil'); g.rect(13, 0, 13, 8, 'web2'); g.rect(14, 2, 16, 7, 'cf')
mk('f_cookies', 18, 9, cookies)
# --- new year's eve ---
def pbunting(g):
    w = g.w
    for x in range(w): g.put(x, 1 + 2 * math.sin(x / w * math.pi), 'jd')
    for k, x in enumerate(range(2, w - 6, 9)):
        y = 2 + 2 * math.sin(x / w * math.pi); g.poly([(x, y), (x + 7, y), (x + 3.5, y + 7)], ('bal1', 'bal2', 'bal3', 'bal4', 'bal5')[k % 5])
mk('f_pbunting', 170, 11, pbunting)
def balloon(c):
    g = G(11, 26)
    rell(g, 5, 6, 4.6, 5.6, 0, c); g.put(3, 3, 'cf'); g.put(3, 4, 'cf'); g.poly([(4, 12), (6, 12), (5, 11)], c)
    g.outline('K')
    for y in range(14, 26): g.put(5 + (1 if (y // 3) % 2 else 0), y, 'web2')
    return g
for k, c in enumerate(('bal1', 'bal3', 'bal2', 'bal5')): put_svg('f_balloon%d' % k, balloon(c))
DIG = {'0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '011', '001', '111'],
       '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'], '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
       '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111']}
for d, rows in DIG.items():
    def fd(g, rows=rows):
        for y, r in enumerate(rows):
            for x, ch in enumerate(r):
                if ch == '1': g.put(x, y, 'gold')
    mk('f_dig' + d, 3, 5, fd, ol=False)
json.dump(dict(art=OUT, styles=[s['name'] for s in STYLES], rooms=ROOMS_BY_STYLE, attic=ATTIC, steps=STEPS, beds=BEDINFO), open('house.json', 'w'))
print(len(OUT), sum(len(v['svg']) for v in OUT.values()) // 1024, 'KB')
