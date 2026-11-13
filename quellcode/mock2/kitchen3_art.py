# kitchen, round 3: new dishes, tab icons, the frying pan view, the coffee corner
import json, math, random
_src = open('extras_art.py').read()
exec(_src[:_src.index("pg = pov_bg(); put_svg('pov_bg', pg)")].replace("json.dump(OUT, open('extras.json', 'w'))", "pass"))   # never touch extras.json from here
OUT = {}
def put(name, g): OUT[name] = dict(w=g.w, h=g.h, svg=paths(g))
def mk3(name, w, h, fn, ol=True):
    g = G(w, h); fn(g)
    if ol: g.outline('K')
    put(name, g)
def half3(name, w2, h2, fn):
    g = G(w2, h2); fn(g); g.outline('K'); OUT[name] = dict(w=w2 // 2, h=h2 // 2, svg='<g transform="scale(.5)">' + paths(g) + '</g>')
C(jam='#d8343a', jam2='#a8242a', jlid='#f0e2c0', jlid2='#c8463c', brd='#c88a44', brd2='#a06a2c', brd3='#e4aa64', bowl='#f4ecdc', bowl2='#d8ccb4', sal='#6aa84a', sal2='#9ad070', cuc='#5aa04a',
  cake='#f0c88a', cake2='#d8a464', cake3='#fff4dc', carr='#f08a24', soup1='#f09030', soup2='#d84030', soup3='#ffb060', herb='#4e8a32',
  hon='#f0b030', hon2='#c88a18', nut='#a06a3a', nut2='#7a4a24', nut3='#c89060', pk='#e8822a', pk2='#c0601a', tm='#e2483a', tm2='#b8302a', ch='#d83a2a', ch2='#a8281e',
  pc='#f4d48a', pc2='#dcae5a', pc3='#fff0c0', cof='#6a3a20', cof2='#4a2814', cream='#fff4e0', cup='#fbf6ec', cup2='#d8ccb4', tea='#d89040', tea2='#b06a24', coc='#8a5030',
  can='#3a3a42', can2='#5a5a64', can3='#8a8a96', can4='#c4c4ce', grw='#a06a38', grw2='#7e4e24', grw3='#c08a50', brs='#d8a840', brs2='#a87c20', brs3='#f0d070')
# ---------------- dishes (shown 7 x 6, drawn 14 x 12) ----------------
def rolls(g):   # three herb rolls on a little board
    g.rect(0, 9, 13, 11, 'wd'); g.rect(0, 9, 13, 9, 'wd3')
    for (x, y) in ((3, 6), (10, 6), (6.5, 4)):
        rell(g, x, y, 3.2, 2.6, 0, 'brd'); g.put(int(x) - 1, int(y) - 1, 'brd3'); g.put(int(x), int(y) - 1, 'herb'); g.put(int(x) + 1, int(y), 'brd2')
half3('d_rolls', 14, 12, rolls)
def nutroll(g):   # a spiral bun glazed with honey
    rell(g, 7, 7, 6, 4.4, 0, 'brd'); rell(g, 7, 6, 4.4, 3, 0, 'brd3'); rell(g, 7, 6, 2.6, 1.8, 0, 'brd'); g.put(7, 6, 'brd2')
    g.px('hon', [(3, 5), (10, 5), (5, 9), (9, 9), (12, 7)]); g.px('nut', [(5, 4), (9, 7), (4, 7)]); g.rect(2, 10, 12, 11, 'brd2')
half3('d_nutroll', 14, 12, nutroll)
def muffin(g):
    g.poly([(3, 6), (11, 6), (10, 11), (4, 11)], 'pk');
    for x in range(4, 11, 2): g.rect(x, 7, x, 10, 'pk2')
    rell(g, 7, 5, 5, 3.4, 0, 'cake2'); rell(g, 6, 4, 3, 1.8, 0, 'cake'); g.px('ye', [(5, 3), (8, 4)]); g.put(9, 2, 'pk')
half3('d_muffin', 14, 12, muffin)
def tart(g):
    g.poly([(1, 7), (13, 7), (12, 11), (2, 11)], 'brd'); g.rect(1, 7, 13, 7, 'brd3'); for_x = [g.put(x, 9, 'brd2') for x in range(2, 13, 2)]
    rell(g, 7, 6, 6, 2, 0, 'cake3')
    for (x, y) in ((3, 5), (6, 4), (9, 4), (11, 5), (7, 6)): rell(g, x, y, 1.6, 1.6, 0, 'jam'); g.put(x, y - 1, 'herb')
half3('d_tart', 14, 12, tart)
def soupf(c, c2, extra=None):
    def f(g):
        g.poly([(1, 5), (13, 5), (11, 11), (3, 11)], 'bowl'); rell(g, 7, 5, 6, 1.6, 0, c); g.put(5, 5, c2); g.put(9, 4, c2)
        g.rect(3, 10, 11, 11, 'bowl2'); g.put(4, 2, 'wh'); g.put(9, 1, 'wh')
        if extra: extra(g)
    return f
half3('d_csoup', 14, 12, soupf('carr', 'soup3', lambda g: g.put(8, 4, 'herb')))
half3('d_chili', 14, 12, soupf('ch2', 'tm', lambda g: (g.put(7, 4, 'pk'), g.put(10, 5, 'ch'), g.put(4, 4, 'sal'))))
def pancake(g):   # a stack with strawberries and honey
    rell(g, 7, 10, 6.6, 1.8, 0, 'bowl')
    for k, y in enumerate((8, 6, 4)): rell(g, 7, y, 5.6, 1.8, 0, 'pc2'); rell(g, 7, y - .6, 5, 1.2, 0, 'pc')
    g.px('hon', [(4, 4), (9, 5), (11, 7)]); rell(g, 6, 2, 1.6, 1.4, 0, 'jam'); rell(g, 9, 2.4, 1.4, 1.2, 0, 'jam'); g.put(6, 1, 'herb')
half3('d_pancake', 14, 12, pancake)
def veg(g):   # a little iron pan with carrot and pumpkin pieces
    rell(g, 6, 7, 5.6, 3.6, 0, 'can'); rell(g, 6, 6.6, 4.4, 2.6, 0, 'can2'); g.rect(11, 6, 13, 7, 'wd')
    g.px('carr', [(4, 6), (7, 5)]); g.px('pk', [(5, 7), (8, 7)]); g.px('herb', [(6, 6), (3, 7), (9, 6)])
half3('d_veg', 14, 12, veg)
def rosti(g):
    rell(g, 7, 9, 6.6, 2, 0, 'bowl'); rell(g, 7, 7, 5.4, 3, 0, 'pk2'); rell(g, 7, 6.4, 4.6, 2.4, 0, 'pk')
    for (x, y) in ((4, 6), (6, 5), (9, 6), (7, 7), (10, 7)): g.put(x, y, 'soup3')
    g.put(8, 4, 'herb'); g.put(9, 4, 'sal')
half3('d_rosti', 14, 12, rosti)
def dsalad(g):
    g.poly([(1, 6), (13, 6), (11, 11), (3, 11)], 'bowl'); g.rect(1, 6, 13, 6, 'bowl2')
    for (x, y, c) in ((4, 4, 'sal2'), (7, 3, 'sal'), (10, 4, 'sal2'), (6, 5, 'sal'), (9, 5, 'sal')): rell(g, x, y, 2, 1.2, 0, c)
    g.px('nut', [(5, 4), (8, 5), (11, 5)]); g.px('ye', [(7, 2)])
half3('d_dsalad', 14, 12, dsalad)
def tsalad(g):
    g.poly([(1, 6), (13, 6), (11, 11), (3, 11)], 'bowl'); g.rect(1, 6, 13, 6, 'bowl2')
    for (x, y) in ((4, 4), (7, 3), (10, 4), (6, 5), (9, 5)): rell(g, x, y, 1.8, 1.4, 0, 'tm'); g.put(x, y - 1, 'tm3' if 'tm3' in pal else 'soup3')
    g.px('herb', [(5, 3), (8, 4), (11, 3)])
half3('d_tsalad', 14, 12, tsalad)
def jarf(fill, fill2, lid, lid2, deco):
    def f(g):
        g.rect(2, 3, 11, 11, 'jr'); g.rect(3, 5, 10, 10, fill); g.rect(1, 1, 12, 3, lid); g.px(lid2, [(3, 2), (6, 2), (9, 2)]); g.put(4, 6, 'jr'); g.rect(10, 5, 10, 10, fill2); deco(g)
    return f
half3('d_nutcream', 14, 12, jarf('nut3', 'nut2', 'hon', 'hon2', lambda g: g.px('nut', [(6, 7), (8, 8)])))
half3('d_csauce', 14, 12, jarf('ch', 'ch2', 'jlid', 'ch2', lambda g: (g.put(6, 7, 'herb'), g.put(7, 8, 'ye'))))
half3('d_pickles', 14, 12, jarf('cuc', 'herb', 'jlid', 'hb2', lambda g: (g.rect(5, 6, 5, 9, 'sal2'), g.rect(8, 6, 8, 9, 'sal2'), g.put(6, 5, 'ye'))))
def cupf(c, c2, top):
    def f(g):
        rell(g, 7, 10, 6.4, 1.6, 0, 'cup2'); g.poly([(2, 4), (11, 4), (10, 10), (3, 10)], 'cup'); g.rect(10, 5, 10, 9, 'cup2')
        rell(g, 12, 7, 2, 2.2, 0, 'cup'); rell(g, 12, 7, 1, 1.2, 0, 'wh' if 'wh' in pal else 'cup')
        rell(g, 6.5, 4, 4.5, 1.2, 0, c); g.put(5, 4, c2); top(g)
    return f
half3('d_coffee', 14, 12, cupf('cof', 'cream', lambda g: (g.put(6, 4, 'cream'), g.put(7, 4, 'cream'), g.put(4, 1, 'wh'), g.put(8, 0, 'wh'))))
half3('d_tea', 14, 12, cupf('tea', 'tea2', lambda g: (g.rect(11, 1, 11, 4, 'wh'), g.rect(10, 0, 12, 1, 'jam'))))
half3('d_cocoa', 14, 12, cupf('coc', 'cream', lambda g: (rell(g, 6.5, 3, 3, 1.4, 0, 'cream'), g.put(6, 2, 'coc'))))
# ---------------- tab icons (10 x 10, one pixel each) ----------------
def i_bake(g): rell(g, 5, 6, 4.4, 3, 0, 'brd'); g.rect(1, 8, 9, 9, 'brd2'); g.px('brd3', [(3, 5), (5, 4), (7, 5)])
def i_cook(g): g.rect(1, 4, 8, 9, 'can'); g.rect(0, 3, 9, 4, 'can2'); g.rect(2, 5, 2, 8, 'can3'); g.px('wh', [(3, 1), (6, 0), (5, 2)])
def i_fry(g): rell(g, 4, 6, 3.6, 2.6, 0, 'can'); rell(g, 4, 5.6, 2.6, 1.6, 0, 'pc'); g.rect(8, 5, 9, 6, 'wd'); g.put(4, 5, 'pc3')
def i_fresh(g): g.poly([(0, 5), (9, 5), (7, 9), (2, 9)], 'bowl'); g.px('sal', [(2, 3), (4, 2), (6, 3), (7, 4)]); g.px('sal2', [(3, 4), (5, 3)]); g.put(5, 4, 'tm')
def i_jar(g): g.rect(2, 3, 7, 9, 'jr'); g.rect(3, 5, 6, 8, 'jam'); g.rect(1, 1, 8, 3, 'jlid'); g.put(3, 2, 'jlid2'); g.put(6, 2, 'jlid2')
def i_drink(g): g.poly([(1, 3), (7, 3), (6, 9), (2, 9)], 'cup'); rell(g, 8, 6, 1.6, 1.8, 0, 'cup'); g.rect(2, 3, 6, 3, 'cof'); g.px('wh', [(3, 0), (5, 1)])
for k, f in (('bake', i_bake), ('cook', i_cook), ('fry', i_fry), ('fresh', i_fresh), ('jar', i_jar), ('drink', i_drink)): mk3('ti_' + k, 10, 10, f)
# ---------------- the coffee corner on the kitchen table: hand grinder, moka pot, a cup ----------------
def coffee_corner(g):
    # grinder: wooden box, a brass bowl on top, the crank
    g.rect(1, 7, 9, 16, 'grw'); g.rect(1, 7, 9, 7, 'grw3'); g.rect(9, 8, 9, 16, 'grw2'); g.rect(3, 12, 7, 14, 'grw2'); g.rect(4, 13, 6, 13, 'brs')
    rell(g, 5, 6, 4, 1.6, 0, 'brs'); g.rect(2, 4, 8, 6, 'brs'); g.rect(2, 4, 8, 4, 'brs3'); g.rect(8, 5, 8, 6, 'brs2')
    g.rect(5, 1, 5, 3, 'can'); g.rect(5, 1, 9, 1, 'can'); g.rect(9, 0, 10, 2, 'grw3')
    # moka pot: eight-sided steel, a black handle, the lid knob
    g.poly([(13, 16), (20, 16), (19, 11), (14, 11)], 'can3'); g.rect(14, 11, 19, 11, 'can4'); g.rect(18, 12, 18, 15, 'can2')
    g.rect(14, 10, 19, 10, 'can'); g.poly([(14, 10), (19, 10), (20, 5), (13, 5)], 'can3'); g.rect(13, 5, 20, 5, 'can4'); g.rect(15, 6, 15, 9, 'can4'); g.rect(19, 6, 19, 9, 'can2')
    g.rect(15, 3, 18, 4, 'can3'); g.rect(16, 2, 17, 2, 'K'); g.rect(21, 6, 22, 10, 'K'); g.put(12, 6, 'can3')
    # a little cup in front
    g.poly([(23, 13), (28, 13), (27, 16), (24, 16)], 'cup'); g.rect(24, 13, 27, 13, 'cof'); g.rect(28, 14, 29, 15, 'cup')
mk3('k_coffee', 31, 18, coffee_corner)
# ---------------- the frying pan seen from the hamster's eyes (over the fire, like the pot) ----------------
def pan_bg():
    g = G(180, 135); rnd = random.Random(7)
    bricks(g, rnd, 'hb_', 'hb2_', 'hb3_', 12, 5, 6)
    region(g, R(0, 0, 179, 14), lambda k: dk(k, .25)); region(g, R(0, 15, 179, 24), lambda k: dk(k, .25), 0)
    softE(g, 96, 76, 96, 64, lambda k: tone(k, .16, WARM), 8)
    rell(g, 96, 76, 72, 46, 0, 'hb2_'); rell(g, 96, 78, 66, 41, 0, 'emb1'); rell(g, 96, 80, 60, 37, 0, 'emb2')
    for k in range(60):
        a = rnd.uniform(-0.3, math.pi + 0.3); r = rnd.uniform(0.86, 1.04)
        x, y = 96 + math.cos(a) * 60 * r, 80 + math.sin(a) * 37 * r
        c = rnd.choice(['emb1', 'ash', 'ash2', 'fz4', 'fz2']); rell(g, x, y, rnd.uniform(1.6, 2.8), rnd.uniform(1.2, 2), 0, c)
        if c in ('fz4', 'fz2'): g.put(x, y, 'fz3' if rnd.random() < .4 else 'fz')
    # the long wooden handle to the right
    g.rect(146, 64, 179, 73, 'K'); g.rect(147, 65, 179, 72, 'wd'); g.rect(147, 65, 179, 66, 'wd3'); g.rect(147, 71, 179, 72, 'wd2')
    for x in range(152, 179, 7): g.rect(x, 68, x + 3, 68, 'wd2')
    g.rect(140, 63, 150, 74, 'K'); g.rect(141, 64, 149, 73, 'rim2'); g.rect(141, 64, 149, 65, 'rim4'); g.put(145, 69, 'K'); g.put(145, 70, 'rim3')
    # the pan: a low shaded iron rim, a flat dark bottom with a soft sheen
    rell(g, 97, 72, 56, 37, 0, 'K')
    def rimv(x, y):
        a = math.atan2((y + .5 - 69) / 36, (x + .5 - 96) / 54); return 0.5 + 0.45 * math.cos(a + math.radians(135))
    grad(g, E(96, 69, 54, 36), rimv, [dk('rim', .3), 'rim', 'rim2', 'rim3', 'rim4'])
    rell(g, 96, 70, 49, 31, 0, 'K'); rell(g, 96, 70, 48, 30, 0, dk('rim', .45))
    softE(g, 84, 62, 26, 12, lambda k: lt(k, .1), 5)
    for a in range(200, 300, 3): r_ = math.radians(a); g.put(96 + math.cos(r_) * 52, 69 + math.sin(r_) * 34, 'rim4')
    # the board with the spatula at the bottom left
    g.rect(2, 96, 38, 134, 'cb5'); g.rect(3, 97, 37, 128, 'cb'); g.rect(3, 129, 37, 133, 'cb6'); g.rect(3, 97, 37, 97, 'cb4')
    for yy in range(101, 127, 5): x = 5 + rnd.randint(0, 6); g.rect(x, yy, x + rnd.randint(10, 26), yy, rnd.choice(['cb2', 'cb3']))
    vignette(g, 4, .22)
    return g
put('pan_bg', pan_bg())
json.dump(OUT, open('kitchen3.json', 'w')); print(len(OUT), 'pieces', len(json.dumps(OUT)) // 1024, 'KB')

# ================= frying, side view: the pan swings up and the pancake does a somersault (sprite frames) =================
C(pa1='#f6e6b1', pa2='#e8d49a', pa3='#fff6d4', pb1='#e0a851', pb2='#c88a3a', pb3='#f0c070', pe_='#d8b878')
def fry_bg():
    g = G(180, 135); rnd = random.Random(9)
    bricks(g, rnd, 'hb_', 'hb2_', 'hb3_', 12, 5, 6)
    region(g, R(0, 0, 179, 14), lambda k: dk(k, .25))
    # the hearth opening: dark inside, the fire low, a grate the pan stands on
    for y in range(40, 135):
        for x in range(10, 170):
            if ((x + .5 - 90) / 80) ** 2 + ((y + .5 - 120) / 78) ** 2 <= 1: g.p[y][x] = 'K' if ((x + .5 - 90) / 80) ** 2 + ((y + .5 - 120) / 78) ** 2 > .955 else dk('hb2_', .55)
    softE(g, 90, 118, 70, 30, lambda k: tone(k, .3, WARM), 10)
    rell(g, 90, 124, 54, 9, 0, 'emb1'); rell(g, 90, 126, 46, 6, 0, 'emb2')
    for k in range(40):
        x, y = rnd.uniform(40, 140), rnd.uniform(118, 132); rell(g, x, y, rnd.uniform(1.6, 3), 1.4, 0, rnd.choice(['emb1', 'ash', 'fz4', 'fz2']))
    for (fx, h) in ((60, 14), (72, 20), (84, 24), (96, 22), (108, 18), (120, 13)):   # flames
        g.poly([(fx - 6, 124), (fx + 6, 124), (fx + 1, 124 - h), (fx - 1, 124 - h)], 'fz2'); g.poly([(fx - 3, 124), (fx + 3, 124), (fx, 124 - h * .6)], 'fz4'); g.put(fx, 123 - int(h * .3), 'fz3')
    g.rect(34, 104, 146, 106, 'K'); g.rect(35, 104, 145, 104, 'rim3'); g.rect(35, 105, 145, 105, 'rim')
    for x in (40, 140): g.rect(x - 1, 106, x + 1, 120, 'K'); g.rect(x, 106, x, 119, 'rim2')
    vignette(g, 4, .22)
    return g
put('fry_bg', fry_bg())
PIV = (178, 84)   # the pan turns round the end of its handle
def rot(pts, ang, dy):
    a = math.radians(ang); c, s = math.cos(a), math.sin(a)
    return [(PIV[0] + (x - PIV[0]) * c - (y - PIV[1]) * s, PIV[1] + (x - PIV[0]) * s + (y - PIV[1]) * c + dy) for (x, y) in pts]
def pan_layer(ang, dy, part):
    g = G(180, 135)
    def P(pts, k): g.poly(rot(pts, ang, dy), k)
    if part == 'back':   # the inside you see over the front rim, and the back rim
        P([(40 + 50 * (1 - math.cos(t)) , 90 - 7 * math.sin(t)) for t in [i / 24 * math.pi for i in range(25)]] + [(140, 92), (40, 92)], 'rim')
        P([(44 + 46 * (1 - math.cos(t)), 91 - 5 * math.sin(t)) for t in [i / 24 * math.pi for i in range(25)]] + [(136, 92), (44, 92)], dk('rim', .45))
    else:                # the front: the low wall of the pan with a shine, and the long handle
        P([(38, 91), (142, 91), (136, 101), (44, 101)], 'rim2'); P([(38, 91), (142, 91), (141, 93), (39, 93)], 'rim4'); P([(44, 99), (136, 99), (136, 101), (44, 101)], dk('rim', .2))
        P([(56, 94), (70, 94), (69, 96), (57, 96)], 'rim4')
        P([(141, 91), (150, 89), (151, 94), (140, 96)], 'rim2'); P([(150, 87), (179, 80), (179, 87), (151, 93)], 'wd'); P([(150, 87), (179, 80), (179, 82), (150, 89)], 'wd3'); P([(151, 92), (179, 86), (179, 87), (151, 93)], 'wd2')
    g.outline('K'); return g
FR = [(0, 0), (6, -3), (12, -6), (4, -3)]   # rest, swing, top of the swing, settling
for i, (a, dy) in enumerate(FR):
    put('panb_%d' % i, pan_layer(a, dy, 'back')); put('panf_%d' % i, pan_layer(a, dy, 'front'))
# the pancake (and the rösti) turning over: 9 frames from flat to upside down. Face A is the side up at the start.
PR, PHI = 24, 14
def cake_frame(th, tex):
    W_, H_ = 56, 56; g = G(W_, H_); cx, cy = 28, 28
    s = math.sin(math.radians(th + PHI)); ry = max(1.0, PR * abs(s)); face = 'a' if s > 0 else 'b'
    thick = 2
    # the edge: a darker band on the side turned away from the light
    eo = thick if s > 0 else -thick
    for y in range(H_):
        for x in range(W_):
            u = (x + .5 - cx) / PR; v = (y + .5 - cy - eo * .5) / max(ry, 1)
            if u * u + v * v <= 1: g.p[y][x] = 'pe_'
    for y in range(H_):
        for x in range(W_):
            u = (x + .5 - cx) / PR; v = (y + .5 - (cy - eo * .5)) / max(ry, 1)
            if u * u + v * v <= 1:
                k = 'p' + face + '1'
                if u * u + v * v > .8: k = 'p' + face + '2'
                elif u < -.25 and v < -.25 and u * u + v * v < .45: k = 'p' + face + '3'
                g.p[y][x] = k
    if ry > 3:   # a little texture: holes in the batter, shreds in the rösti
        r2 = random.Random(3 if face == 'a' else 5)
        for q in range(tex):
            u, v = r2.uniform(-.75, .75), r2.uniform(-.7, .7)
            if u * u + v * v < .6: g.put(cx + u * PR, cy - eo * .5 + v * ry, 'p' + face + '2')
    g.outline('K'); return g
for f in range(9):
    put('cakef_%d' % f, cake_frame(f * 22.5, 14))
json.dump(OUT, open('kitchen3.json', 'w')); print('fry frames', len(OUT), len(json.dumps(OUT)) // 1024, 'KB')
