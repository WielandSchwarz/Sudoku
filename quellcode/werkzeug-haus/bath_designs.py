# bath furnishing: wall, floor and tub variants (design sheet first; the same functions build the game layers)
import json, math, random
exec(open('house_art.py').read().split("# ================= bathroom =================")[0])
C(mt1='#cfeee0', mt2='#b4e0cc', mt3='#e6f8f0', mt4='#8ec8b0', mo1='#e8706a', mo2='#f0c040', mo3='#7ab0d4', mo4='#9ad070',
  rs1='#f9dfe4', rs2='#f0c4cc', rs3='#e8a0ac', wn1='#fbf6ec', wn2='#e8dcc8', wn3='#d4c4aa',
  tc1='#d88a5a', tc2='#c4744a', tc3='#e8a478', tc4='#a85a34', cr1='#f6ecd8', cr2='#ead8b8',
  ck1='#f6f2ea', ck2='#3e3e4a', ck3='#ffffff', ck4='#2a2a34', hx1='#f2f6f4', hx2='#cfe6dc', hx3='#a8d0c0',
  ba1='#b07a44', ba2='#8a5a2e', ba3='#d09a5c', ba4='#5a3418', bnd='#7a7a86', bnd2='#a4a4b0',
  co1='#d88a50', co2='#b0602c', co3='#f4b07a', co4='#8a4420',
  pk1='#f6b8c4', pk2='#e898a8', pk3='#fcd8e0', pk4='#c87888', bse='#7ab0d4', bse2='#5a90b8')
WALLS = ['Hellblau', 'Mint-Mosaik', 'Rosa Vertäfelung', 'Terrakotta']
FLOORS = ['Holzdielen', 'Schachbrett', 'Mint-Fliesen', 'Terrakotta-Fliesen']
TUBS = ['Löwenfuß-Wanne', 'Holzzuber', 'Kupferwanne', 'Rosa Retro-Wanne']
def wall(g, i):
    if i == 0:
        g.rect(0, 0, 179, 99, 'bw1')
        for y in range(12, 60, 8):
            for x in range((y // 8) % 2 * 5, 180, 10): g.put(x, y, 'bw2'); g.put(x + 1, y, 'bw2')
        g.rect(0, 58, 179, 99, 'bt1')
        for y in range(58, 99, 6): g.rect(0, y, 179, y, 'bt2')
        for y in range(58, 99, 6):
            for x in range(((y - 58) // 6) % 2 * 4, 180, 8): g.rect(x, y, x, y + 5, 'bt2')
        g.rect(0, 56, 179, 58, 'bt3'); g.rect(0, 58, 179, 58, 'bt4')
    elif i == 1:   # mint plaster, a colourful mosaic band, mint subway tiles
        g.rect(0, 0, 179, 99, 'mt3')
        for y in range(10, 54, 7):
            for x in range((y // 7) % 2 * 6, 180, 12): g.put(x, y, 'mt1')
        g.rect(0, 56, 179, 99, 'mt1')
        for y in range(60, 99, 5): g.rect(0, y, 179, y, 'mt4')
        for y in range(60, 99, 5):
            for x in range(((y - 60) // 5) % 2 * 5, 180, 10): g.rect(x, y, x, y + 4, 'mt4')
        for x in range(0, 180, 3):
            for y in (55, 57): g.rect(x, y, x + 1, y + 1, ('mo1', 'mo2', 'mo3', 'mo4')[(x // 3 + y) % 4])
        g.rect(0, 54, 179, 54, 'mt4'); g.rect(0, 59, 179, 59, 'mt4')
    elif i == 2:   # rosy wallpaper with little flowers, white panelling below
        g.rect(0, 0, 179, 99, 'rs1')
        for y in range(10, 56, 9):
            for x in range((y // 9) % 2 * 7, 180, 14): g.put(x, y, 'rs3'); g.put(x - 1, y, 'rs2'); g.put(x + 1, y, 'rs2'); g.put(x, y - 1, 'rs2'); g.put(x, y + 1, 'hb')
        g.rect(0, 58, 179, 99, 'wn1')
        for x in range(0, 180, 9): g.rect(x, 60, x, 99, 'wn2'); g.rect(x + 1, 60, x + 1, 99, 'wn1')
        g.rect(0, 56, 179, 59, 'wn2'); g.rect(0, 56, 179, 56, 'wn1'); g.rect(0, 59, 179, 59, 'wn3')
    else:          # cream plaster above, warm terracotta tiles below
        g.rect(0, 0, 179, 99, 'cr1')
        for k in range(160): g.put((k * 53) % 180, 6 + (k * 29) % 50, 'cr2')
        g.rect(0, 57, 179, 99, 'tc1')
        for y in range(57, 99, 7):
            for x in range(0, 180, 7):
                c = ('tc1', 'tc2', 'tc3')[((x // 7) * 5 + (y // 7) * 3) % 3]
                g.rect(x + 1, y + 1, x + 6, y + 6, c); g.put(x + 1, y + 1, 'tc3')
            g.rect(0, y, 179, y, 'cr2')
        for x in range(0, 180, 7): g.rect(x, 57, x, 99, 'cr2')
        g.rect(0, 55, 179, 56, 'tc4')
def floor(g, i, rnd):
    if i == 0: planks(g, 100, rnd); return
    g.rect(0, 97, 179, 100, 'wd2'); g.rect(0, 97, 179, 97, 'wd3')
    if i == 1:
        rows = [(100, 6), (106, 7), (113, 8), (121, 9), (130, 5)]
        for r, (yy, h) in enumerate(rows):
            w = 12
            for x in range(0, 180, w):
                c = 'ck1' if ((x // w) + r) % 2 else 'ck2'
                g.rect(max(0, x), yy, min(179, x + w - 1), min(134, yy + h - 1), c)
                if c == 'ck1': g.rect(max(0, x), yy, min(179, x + w - 1), yy, 'ck3')
    elif i == 2:
        for y in range(100, 135):
            for x in range(180):
                yy = y - 100; row = yy // 6; xx = x + (row % 2) * 6
                cx, cy = xx % 12, yy % 6
                edge = cx in (0, 11) or (cy == 0 and 3 <= cx <= 8)
                g.put(x, y, 'hx3' if edge else ('hx1' if (xx // 12 + row) % 3 else 'hx2'))
    else:
        for y in range(100, 135):
            for x in range(180):
                yy = y - 100; s = 9 + yy // 9
                c = ('tc1', 'tc2', 'tc3', 'tc1')[((x // s) * 3 + (yy // 8)) % 4]
                if x % s == 0 or yy % 8 == 0: c = 'tc4'
                g.put(x, y, c)
def tub_back(g, i):   # the far rim and the inside, drawn into the room behind the hamster
    if i == 1:
        rell(g, 52, 80, 36, 6, 0, 'ba1'); rell(g, 52, 80, 34, 5, 0, 'tubi'); rell(g, 52, 81, 31, 3.6, 0, 'ba2')
    elif i == 2:
        rell(g, 52, 80, 38, 6, 0, 'co1'); rell(g, 52, 80, 36, 5, 0, 'tubi'); rell(g, 52, 81, 33, 3.6, 0, 'co2')
    elif i == 3:
        rell(g, 52, 80, 38, 6, 0, 'pk2'); rell(g, 52, 80, 36, 5, 0, 'tubi'); rell(g, 52, 81, 33, 3.6, 0, 'pk2')
    else:
        rell(g, 52, 80, 38, 6, 0, 'tub2'); rell(g, 52, 80, 36, 5, 0, 'tubi'); rell(g, 52, 81, 33, 3.6, 0, 'tub2')
def tub_front_v(g, i):
    if i == 0:
        g.poly([(0, 6), (76, 6), (72, 22), (66, 26), (10, 26), (4, 22)], 'tub')
        g.rect(0, 4, 76, 7, 'tub3'); g.rect(3, 8, 73, 9, 'tub3'); shade(g, 'tub', 'tub2', 'bottom')
        for x in (8, 66): g.rect(x, 26, x + 3, 30, 'gd'); g.rect(x - 1, 30, x + 4, 31, 'gd2')
        g.rect(2, 4, 74, 4, 'tub2')
    elif i == 1:   # wooden tub: staves with iron bands, standing on the floor
        g.poly([(2, 5), (74, 5), (71, 30), (5, 30)], 'ba1')
        for x in range(6, 72, 7): g.rect(x, 6, x, 29, 'ba2'); g.rect(x + 1, 6, x + 1, 29, 'ba3')
        for y in (9, 22): g.rect(2, y, 74, y + 2, 'bnd'); g.rect(2, y, 74, y, 'bnd2')
        g.rect(0, 3, 76, 6, 'ba3'); g.rect(0, 3, 76, 3, 'tub3')
        shade(g, 'ba1', 'ba2', 'bottom')
    elif i == 2:   # copper tub with a rolled rim on a low plinth
        g.poly([(0, 6), (76, 6), (73, 20), (64, 27), (12, 27), (3, 20)], 'co1')
        g.rect(0, 3, 76, 7, 'co3'); g.rect(0, 7, 76, 7, 'co2')
        for x in range(10, 70, 9): g.rect(x, 9, x + 1, 24, 'co3')
        shade(g, 'co1', 'co2', 'bottom'); g.rect(14, 27, 62, 31, 'co4'); g.rect(14, 27, 62, 27, 'co2')
    else:          # pastel pink retro tub, panelled front with a blue tile base
        g.rect(1, 6, 75, 27, 'pk1'); g.rect(0, 3, 76, 7, 'pk3'); g.rect(0, 7, 76, 7, 'pk2')
        for x0 in (5, 29, 53): g.rect(x0, 11, x0 + 18, 23, 'pk3'); g.rect(x0, 23, x0 + 18, 23, 'pk2'); g.rect(x0 + 18, 11, x0 + 18, 23, 'pk2')
        g.rect(1, 27, 75, 31, 'bse')
        for x in range(1, 76, 5): g.rect(x, 27, x, 31, 'bse2')
    # little duck on the rim
    rell(g, 66, 1.5, 3, 2.2, 0, 'duck'); rell(g, 69, -0.5, 1.6, 1.6, 0, 'duck'); g.put(71, 0, 'bk'); g.put(69, -1, 'K')
def scene(wi, fi, ti, t2=None, sk=0):
    g = G(180, 135); rnd = random.Random(7)
    wall(g, wi); floor(g, fi, rnd); beams(g)
    # window, mirror, sink, pipes, towel rail, basket: as in the bath now
    for yy in range(16, 52):
        for xx in range(122, 150):
            if yy >= 28 or ((xx + .5 - 136) / 14) ** 2 + ((yy + .5 - 28) / 12) ** 2 <= 1: g.p[yy][xx] = 'msky' if 'msky' in pal else 'jr'
    for yy in range(14, 54):
        for xx in range(119, 153):
            inside = yy >= 28 and 122 <= xx <= 149 and yy < 52 or ((xx + .5 - 136) / 14) ** 2 + ((yy + .5 - 28) / 12) ** 2 <= 1 and yy < 28
            outer = yy >= 28 and 119 <= xx <= 152 or ((xx + .5 - 136) / 17) ** 2 + ((yy + .5 - 28) / 15) ** 2 <= 1
            if outer and not inside and yy < 54: g.p[yy][xx] = 'wd'
    g.rect(136, 16, 136, 51, 'wd'); g.rect(122, 34, 149, 34, 'wd'); g.rect(117, 52, 155, 55, 'wd3'); g.rect(117, 55, 155, 55, 'wd2')
    g.rect(52, 30, 53, 74, 'cu'); g.rect(53, 30, 53, 74, 'cu2'); g.rect(44, 28, 53, 29, 'cu'); g.poly([(36, 30), (48, 30), (46, 34), (38, 34)], 'cu')
    tub_back(g, ti) if t2 is None else tub2_back(g, t2)
    rell(g, 104, 34, 9, 12, 0, 'wd'); rell(g, 104, 34, 7.5, 10.5, 0, 'jr'); g.rect(100, 26, 101, 36, 'tub3')
    sink(g, sk)
    g.rect(160, 60, 172, 61, 'cu'); g.rect(161, 62, 166, 80, 'tw1'); g.rect(162, 62, 162, 80, 'tw2'); g.rect(167, 62, 171, 76, 'tw3')
    g.poly([(140, 92), (156, 92), (154, 108), (142, 108)], 'aw3')
    for yy in range(93, 108, 2): g.rect(141, yy, 155, yy, 'tb')
    g.outline('K')
    t = G(77, 33); (tub_front_v(t, ti) if t2 is None else tub2_front(t, t2)); t.outline('K')
    for y in range(t.h):
        for x in range(t.w):
            if t.p[y][x] is not None and 0 <= 14 + x < 180 and 0 <= 76 + y - 1 < 135: g.p[76 + y - 1][14 + x] = t.p[y][x]
    return g

C(sh1='#fbe8ec', sh2='#f0c8d2', sh3='#ffffff', sh4='#d8a0b0', pe1='#f8f4f0', wn_1='#a8743c', wn_2='#8a5a2e', wn_3='#c8945a', wn_4='#6a4224',
  cupw='#fbf8f2', cupw2='#e8e0d4', cupb='#7ab0d4', cupb2='#5a90b8', zn1='#b8bcc4', zn2='#9aa0aa', zn3='#d8dce2', zn4='#7a808a',
  ms1='#e8463c', ms2='#c8342c', ms3='#ff7a6a', msw='#fff8ec', stm='#f2ead8', stm2='#dcd0b8', jg1='#7ab0d4', jg2='#5a90b8', jg3='#a8d0ec')
TUBS2 = ['Muschel-Wanne', 'Walnuss-Wanne', 'Teetassen-Wanne', 'Zinkwanne']
def tub2_back(g, i):
    col = {0: 'sh2', 1: 'wn_2', 2: 'cupw2', 3: 'zn2'}[i]
    rell(g, 52, 80, 37, 6, 0, col); rell(g, 52, 80, 35, 5, 0, 'tubi'); rell(g, 52, 81, 32, 3.6, 0, col)
def tub2_front(g, i):
    if i == 0:   # a big scallop shell, pearly pink ribs fanning out
        g.poly([(0, 6), (76, 6), (70, 20), (56, 29), (20, 29), (6, 20)], 'sh1')
        for k in range(9):
            x = 4 + k * 8.6; line(g, 38, 31, int(x), 7, 'sh2')
        g.rect(0, 3, 76, 7, 'sh3'); g.rect(0, 7, 76, 7, 'sh2')
        for x in range(2, 76, 8): rell(g, x + 4, 5, 4, 2.2, 0, 'sh1'); g.put(x + 3, 4, 'sh3')
        shade(g, 'sh1', 'sh4', 'bottom'); rell(g, 38, 30, 6, 2, 0, 'sh4')
    elif i == 1:   # half a walnut shell, wrinkled, on little twig feet
        rell(g, 38, 6, 38, 24, 0, 'wn_1')
        for y in range(0, 6): g.rect(0, y, 76, y, None) if False else None
        for k in range(26):
            x, y = 6 + (k * 23) % 66, 9 + (k * 13) % 16; line(g, x, y, x + 5, y + 2, 'wn_2')
        for k in range(10): g.put(8 + (k * 17) % 60, 10 + (k * 7) % 12, 'wn_3')
        g.rect(0, 3, 76, 6, 'wn_3'); g.rect(0, 6, 76, 6, 'wn_4')
        shade(g, 'wn_1', 'wn_4', 'bottom')
        for x in (16, 58): g.rect(x, 27, x + 2, 31, 'wn_4')
        for yy in range(31, 33):
            for xx in range(77): pass
    elif i == 2:   # a giant teacup on its saucer, blue rim and a handle
        g.poly([(4, 5), (72, 5), (66, 22), (58, 27), (18, 27), (10, 22)], 'cupw')
        g.rect(2, 3, 74, 6, 'cupw'); g.rect(2, 6, 74, 7, 'cupb')
        for x in range(10, 68, 12): rell(g, x + 4, 15, 2.6, 2.6, 0, 'cupb'); g.put(x + 4, 15, 'cupw')
        shade(g, 'cupw', 'cupw2', 'bottom')
        rell(g, 38, 29, 34, 3, 0, 'cupw'); rell(g, 38, 29, 34, 3, 0, 'cupw'); g.rect(6, 29, 70, 29, 'cupb')
        for y in range(9, 20):
            g.put(73 + int(3 * math.sin((y - 9) / 11 * math.pi)), y, 'cupw')
            g.put(74 + int(3 * math.sin((y - 9) / 11 * math.pi)), y, 'cupw2')
    else:   # old oval zinc washtub with handles, ribbed
        g.poly([(2, 6), (74, 6), (70, 27), (6, 27)], 'zn1')
        for y in (11, 17, 23): g.rect(3, y, 73, y, 'zn2'); g.rect(3, y - 1, 73, y - 1, 'zn3')
        g.rect(0, 3, 76, 7, 'zn3'); g.rect(0, 7, 76, 7, 'zn4'); shade(g, 'zn1', 'zn2', 'bottom')
        for x in (-2, 74): g.rect(x if x > 0 else 0, 9, (x if x > 0 else 0) + 2, 14, 'zn4')
        g.rect(4, 27, 72, 29, 'zn4')
    rell(g, 66, 1.5, 3, 2.2, 0, 'duck'); rell(g, 69, -0.5, 1.6, 1.6, 0, 'duck'); g.put(71, 0, 'bk'); g.put(69, -1, 'K')
SINKS = ['Säulen-Waschbecken', 'Waschschüssel mit Krug', 'Muschel-Waschbecken', 'Pilz-Waschbecken']
def sink(g, i):
    if i == 0:
        g.rect(101, 76, 107, 99, 'tub2'); g.rect(102, 76, 106, 99, 'tub'); rell(g, 104, 74, 11, 3.6, 0, 'tub'); rell(g, 104, 73, 9, 2, 0, 'tubi')
        g.rect(103, 66, 105, 71, 'cu'); g.rect(103, 66, 108, 67, 'cu')
    elif i == 1:   # a wooden washstand with a bowl and a water jug
        g.rect(92, 78, 116, 81, 'wd3'); g.rect(92, 81, 116, 81, 'wd2'); g.rect(94, 82, 96, 99, 'wd'); g.rect(112, 82, 114, 99, 'wd'); g.rect(94, 92, 114, 93, 'wd2')
        rell(g, 104, 76, 10, 3, 0, 'jg3'); rell(g, 104, 75, 8, 1.6, 0, 'tubi'); g.rect(95, 76, 113, 77, 'jg1')
        g.poly([(108, 62), (114, 62), (115, 74), (107, 74)], 'jg1'); g.rect(108, 62, 114, 63, 'jg3'); g.put(107, 61, 'jg1'); g.rect(115, 64, 116, 70, 'jg2')
        g.rect(97, 90, 104, 91, 'tw1')
    elif i == 2:   # a scallop shell basin on a slim stand
        g.rect(102, 80, 106, 99, 'pe1'); g.rect(105, 80, 106, 99, 'sh2')
        g.poly([(91, 72), (117, 72), (112, 79), (96, 79)], 'sh1')
        for k in range(6): line(g, 104, 80, 92 + k * 5, 72, 'sh2')
        g.rect(91, 71, 117, 72, 'sh3'); rell(g, 104, 71, 10, 1.4, 0, 'tubi')
        g.rect(103, 63, 105, 69, 'gd'); g.rect(103, 63, 108, 64, 'gd'); g.put(108, 65, 'wat2')
    else:   # a toadstool: red cap with white spots as the basin, a cream stem
        g.poly([(100, 80), (108, 80), (110, 99), (98, 99)], 'stm'); g.rect(106, 80, 109, 99, 'stm2')
        rell(g, 104, 76, 13, 5, 0, 'ms1'); g.rect(91, 76, 117, 80, 'ms1'); rell(g, 104, 80, 13, 2, 0, 'ms2')
        for (x, y, r) in ((96, 77, 1.6), (103, 79, 1.4), (111, 77, 1.8), (107, 75, 1.2)): rell(g, x, y, r, r, 0, 'msw')
        rell(g, 104, 73, 10, 1.8, 0, 'tubi'); g.rect(92, 72, 116, 73, 'ms3')
        g.rect(103, 64, 105, 70, 'cu'); g.rect(103, 64, 108, 65, 'cu')
def scene2(tub=None, sk=0):
    g = scene(0, 0, 0)
    return g

if __name__ == '__main__':
    from PIL import Image
    def img(g, s=2):
        im = Image.new('RGB', (g.w, g.h), (255, 255, 255)); P = im.load()
        for y in range(g.h):
            for x in range(g.w):
                c = g.p[y][x]
                if c is not None:
                    h = pal[c] if c in pal else '#3a2414'; P[x, y] = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
        return im.resize((g.w * s, g.h * s), Image.NEAREST)
    from PIL import ImageDraw
    sheet = Image.new('RGB', (4 * 370 + 10, 3 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    rows = [[scene(0, 0, 0, t2=i) for i in range(4)], [scene(0, 0, 0, sk=i) for i in range(4)]]
    labels = [TUBS2, SINKS]; heads = ['Wanne', 'Waschbecken']
    sheet = Image.new('RGB', (4 * 370 + 10, 2 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for r in range(2):
        for c in range(4):
            sheet.paste(img(rows[r][c]), (10 + c * 370, 20 + r * 300))
            d.text((10 + c * 370, 4 + r * 300), heads[r] + ' ' + str(c + 1) + ': ' + labels[r][c], fill=(0, 0, 0))
    sheet.save('../bad/bad_designs2.png'); print('ok')

# ---------- third round: new layout (window over the tub, sink on the right), new tubs, detailed sinks ----------
C(sl1='#fbf6ea', sl2='#e8dcc4', sl3='#1e2a3a', sl4='#34445a', sg1='#9cb89a', sg2='#7e9c7c', sg3='#bcd4b8', sg4='#5e7c5e',
  tl1='#6a9ed0', tl2='#4e82b8', tl3='#9cc4e8', tl4='#3a6a9c', cr='#e8e8ee', cr2='#b8b8c4', cr3='#ffffff', br1='#e0b040', br2='#b08420', br3='#f6d880',
  vd1='#8a5a32', vd2='#6a4224', vd3='#a8743c', gi1='#f6f0e4', gi2='#e8706a', gi3='#f4a3a0', soap='#f4c8d8', soap2='#e8a0b8', ir='#3a3a42', ir2='#5a5a64')
TUBS3 = ['Pantoffelwanne', 'Holzverkleidete Wanne', 'Salbeigrüne Emaille-Wanne', 'Gekachelte Wanne']
def tub3_back(g, i):
    col = {0: 'sl2', 1: 'vd1', 2: 'sg2', 3: 'tl2'}[i]
    if i == 3: g.rect(14, 75, 90, 82, 'tl1'); g.rect(14, 75, 90, 75, 'tl3'); rell(g, 52, 80, 34, 3.6, 0, 'tubi'); return
    rell(g, 52, 80, 37, 6, 0, col); rell(g, 52, 80, 35, 5, 0, 'tubi'); rell(g, 52, 81, 32, 3.6, 0, col)
def tub3_front(g, i):
    if i == 0:   # slipper bath: one end rises high, cream inside, deep navy outside, brass feet
        g.poly([(0, 0), (8, -2), (14, 4), (76, 6), (72, 22), (64, 27), (12, 27), (3, 20)], 'sl3')
        g.poly([(1, 1), (7, 0), (12, 5), (75, 6), (75, 8), (2, 6)], 'sl1')
        for y in range(9, 25): g.put(5 + (y > 18), y, 'sl4')
        shade(g, 'sl3', 'sl4', 'top')
        for x in (10, 62): g.rect(x, 27, x + 3, 30, 'br1'); g.rect(x - 1, 30, x + 4, 31, 'br2'); g.put(x, 27, 'br3')
    elif i == 1:   # built in with a wooden panel front and a wide tiled ledge
        g.rect(0, 3, 76, 7, 'bt1'); g.rect(0, 7, 76, 7, 'bt3')
        g.rect(1, 8, 75, 30, 'vd3')
        for x0 in (4, 28, 52):
            g.rect(x0, 11, x0 + 20, 27, 'vd1'); g.rect(x0 + 1, 12, x0 + 19, 26, 'vd3'); g.rect(x0 + 1, 12, x0 + 19, 12, 'wd3'); g.rect(x0 + 19, 12, x0 + 19, 26, 'vd2')
        g.rect(1, 29, 75, 30, 'vd2')
    elif i == 2:   # roll top, painted sage green outside, white rim, brass ball feet
        g.poly([(0, 6), (76, 6), (72, 22), (66, 26), (10, 26), (4, 22)], 'sg1')
        g.rect(0, 3, 76, 7, 'tub3'); g.rect(1, 7, 75, 8, 'tub2')
        for x in range(8, 70, 10): g.rect(x, 10, x, 22, 'sg3')
        shade(g, 'sg1', 'sg2', 'bottom')
        for x in (9, 65): rell(g, x + 1.5, 28, 2.4, 2.4, 0, 'br1'); g.put(x, 27, 'br3')
    else:   # tiled surround with a blue tile front and a white top
        g.rect(0, 3, 76, 7, 'tub3'); g.rect(0, 7, 76, 7, 'bt3')
        g.rect(0, 8, 76, 31, 'tl1')
        for y in range(8, 32, 6): g.rect(0, y, 76, y, 'tl4')
        for y in range(8, 32, 6):
            for x in range(((y - 8) // 6) % 2 * 3, 77, 6): g.rect(x, y, x, y + 5, 'tl4')
        for k in range(14): g.put((k * 23) % 75 + 1, 9 + (k * 7) % 21, 'tl3')
    rell(g, 66, 1.5, 3, 2.2, 0, 'duck'); rell(g, 69, -0.5, 1.6, 1.6, 0, 'duck'); g.put(71, 0, 'bk'); g.put(69, -1, 'K')
SINKS3 = ['Säulen-Waschbecken', 'Holz-Waschtisch', 'Waschtisch mit Krug', 'Becken mit Vorhang']
SX = 140   # the sink stands on the right now
def sink3(g, i):
    x = SX
    if i == 0:   # porcelain pedestal: curved column, a wide basin with a lip, a chrome mixer tap, soap
        g.poly([(x - 3, 82), (x + 3, 82), (x + 4, 96), (x + 6, 99), (x - 6, 99), (x - 4, 96)], 'tub'); g.rect(x + 1, 83, x + 3, 98, 'tub2')
        g.poly([(x - 14, 72), (x + 14, 72), (x + 11, 80), (x + 5, 83), (x - 5, 83), (x - 11, 80)], 'tub'); g.rect(x - 14, 71, x + 14, 72, 'tub3')
        shade(g, 'tub', 'tub2', 'bottom'); rell(g, x, 71, 11, 1.4, 0, 'tubi')
        g.rect(x - 1, 63, x + 1, 69, 'cr'); g.rect(x - 1, 63, x + 6, 64, 'cr'); g.put(x + 6, 65, 'cr2'); rell(g, x - 5, 66, 1.6, 1.6, 0, 'cr'); rell(g, x + 5, 68, 1.6, 1.6, 0, 'cr')
        g.rect(x + 8, 69, x + 12, 70, 'soap'); g.rect(x + 8, 70, x + 12, 70, 'soap2')
    elif i == 1:   # wooden vanity with two doors, a round bowl on top and a brass tap
        g.rect(x - 15, 80, x + 15, 99, 'vd1'); g.rect(x - 16, 78, x + 16, 80, 'vd3'); g.rect(x - 16, 80, x + 16, 80, 'vd2')
        for x0 in (x - 13, x + 1): g.rect(x0, 83, x0 + 12, 96, 'vd3'); g.rect(x0, 83, x0 + 12, 83, 'wd3'); g.rect(x0 + 12, 83, x0 + 12, 96, 'vd2')
        g.rect(x - 2, 88, x - 1, 91, 'br1'); g.rect(x + 2, 88, x + 3, 91, 'br1')
        rell(g, x, 75, 10, 3.6, 0, 'tub'); rell(g, x, 74, 8, 1.6, 0, 'tubi'); g.rect(x - 10, 77, x + 10, 78, 'tub2')
        g.rect(x - 1, 64, x + 1, 72, 'br1'); g.rect(x - 1, 64, x + 6, 65, 'br1'); g.put(x, 64, 'br3'); g.put(x + 6, 66, 'br2')
        g.rect(x + 9, 74, x + 13, 77, 'gi2'); g.rect(x + 10, 72, x + 12, 73, 'gi1')
    elif i == 2:   # wrought iron washstand: bowl, jug, a towel on the side bar
        g.rect(x - 14, 76, x - 13, 99, 'ir'); g.rect(x + 13, 76, x + 14, 99, 'ir'); g.rect(x - 14, 90, x + 14, 91, 'ir'); g.rect(x - 16, 76, x + 16, 77, 'ir2')
        for (a, b) in ((x - 13, 99), (x + 13, 99)): g.rect(a - 1, b - 1, a + 1, b, 'ir')
        rell(g, x - 2, 74, 11, 3.4, 0, 'jg3'); rell(g, x - 2, 73, 9, 1.6, 0, 'tubi'); g.rect(x - 13, 74, x + 9, 75, 'jg1')
        g.poly([(x + 5, 58), (x + 11, 58), (x + 13, 72), (x + 4, 72)], 'jg1'); g.rect(x + 5, 58, x + 11, 59, 'jg3'); g.put(x + 4, 57, 'jg1'); g.rect(x + 13, 61, x + 14, 68, 'jg2')
        for xx in range(x + 6, x + 12, 2): g.put(xx, 64, 'jg3')
        g.rect(x + 15, 78, x + 18, 92, 'gi2'); g.rect(x + 16, 78, x + 16, 92, 'gi1')
    else:   # square ceramic basin on a console, a gingham curtain hiding the pipes
        g.rect(x - 16, 72, x + 16, 77, 'tub'); g.rect(x - 16, 72, x + 16, 72, 'tub3'); g.rect(x - 16, 77, x + 16, 77, 'tub2'); rell(g, x, 73, 12, 1.2, 0, 'tubi')
        for xx in range(x - 16, x + 17):
            for yy in range(78, 99):
                fold = (xx - x + 16) % 6
                g.put(xx, yy, 'gi2' if ((xx // 3) + (yy // 3)) % 2 else ('gi1' if fold else 'gi3'))
        for xx in range(x - 16, x + 17, 2): g.put(xx, 99, 'gi2')
        g.rect(x - 16, 78, x + 16, 78, 'gi2')
        g.rect(x - 1, 64, x + 1, 71, 'cr'); g.rect(x - 1, 64, x + 6, 65, 'cr'); g.put(x + 6, 66, 'cr2')
        g.rect(x - 12, 69, x - 8, 71, 'soap'); g.rect(x - 12, 71, x - 8, 71, 'soap2')
def scene3(t=0, sk=0):
    g = G(180, 135); rnd = random.Random(7)
    wall(g, 0); floor(g, 0, rnd); beams(g)
    # arched window now above the tub
    WX = 54
    for yy in range(14, 52):
        for xx in range(WX - 17, WX + 18):
            inside = yy >= 26 and WX - 14 <= xx <= WX + 13 and yy < 50 or ((xx + .5 - WX) / 14) ** 2 + ((yy + .5 - 26) / 12) ** 2 <= 1 and yy < 26
            outer = yy >= 26 and WX - 17 <= xx <= WX + 16 or ((xx + .5 - WX) / 17) ** 2 + ((yy + .5 - 26) / 15) ** 2 <= 1
            if inside: g.p[yy][xx] = 'jr' if (xx + yy) % 9 else 'tub3'
            elif outer and yy < 52: g.p[yy][xx] = 'wd'
    g.rect(WX, 14, WX, 49, 'wd'); g.rect(WX - 14, 32, WX + 13, 32, 'wd'); g.rect(WX - 19, 50, WX + 19, 53, 'wd3'); g.rect(WX - 19, 53, WX + 19, 53, 'wd2')
    rell(g, WX - 10, 48, 3, 2.4, 0, 'cu'); g.rect(WX - 11, 42, WX - 9, 46, 'hb'); g.put(WX - 12, 43, 'hb2'); g.put(WX - 8, 43, 'hb2')
    # shower: the pipe comes down at the left end of the tub
    g.rect(18, 24, 19, 74, 'cu'); g.rect(19, 24, 19, 74, 'cu2'); g.rect(19, 22, 30, 23, 'cu'); g.poly([(26, 24), (36, 24), (34, 28), (28, 28)], 'cu'); g.px('cu2', [(29, 29), (31, 29), (33, 29)])
    tub3_back(g, t)
    # mirror above the sink, a little shelf
    rell(g, SX, 38, 9, 12, 0, 'wd'); rell(g, SX, 38, 7.5, 10.5, 0, 'jr'); g.rect(SX - 4, 30, SX - 3, 40, 'tub3'); g.put(SX - 2, 32, 'tub3')
    g.rect(SX - 12, 54, SX + 12, 55, 'wd'); g.rect(SX - 12, 54, SX + 12, 54, 'wd3')
    for (x, c) in ((SX - 9, 'qc'), (SX - 5, 'qa'), (SX + 7, 'qd')): g.rect(x, 48, x + 2, 53, c); g.put(x + 1, 47, 'wh')
    sink3(g, sk)
    g.rect(162, 60, 172, 61, 'cu'); g.rect(163, 62, 167, 80, 'tw1'); g.rect(164, 62, 164, 80, 'tw2'); g.rect(168, 62, 171, 76, 'tw3')
    g.poly([(100, 92), (116, 92), (114, 108), (102, 108)], 'aw3')
    for yy in range(93, 108, 2): g.rect(101, yy, 115, yy, 'tb')
    g.outline('K')
    tt = G(77, 34); tub3_front(tt, t); tt.outline('K')
    for y in range(tt.h):
        for x in range(tt.w):
            if tt.p[y][x] is not None and 0 <= 76 + y - 2 < 135: g.p[76 + y - 2][14 + x] = tt.p[y][x]
    return g
if __name__ == '__main__':
    rows = [[scene3(t=i) for i in range(4)], [scene3(sk=i) for i in range(4)]]
    sheet = Image.new('RGB', (4 * 370 + 10, 2 * 300 + 10), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for r, (labs, head) in enumerate(((TUBS3, 'Wanne'), (SINKS3, 'Waschbecken'))):
        for c in range(4):
            sheet.paste(img(rows[r][c]), (10 + c * 370, 20 + r * 300)); d.text((10 + c * 370, 4 + r * 300), head + ' ' + str(c + 1) + ': ' + labs[c], fill=(0, 0, 0))
    sheet.save('../bad/bad_designs3.png'); print('ok3')
