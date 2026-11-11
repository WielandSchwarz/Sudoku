# the bath as layers so it can be furnished: 4 walls, 4 floors, 3 tubs (back rim + front), 3 sinks, fixed things; merged into house.json
import json, random
src = open('bath_designs.py').read().replace("if __name__ == '__main__':", "if False:")
exec(src)
WX = 54
def mkl(fn, w=180, h=135, ol=True):
    g = G(w, h); fn(g)
    if ol: g.outline('K')
    return dict(w=g.w, h=g.h, svg=paths(g))
def wall_l(i):
    def f(g):
        wall(g, i)
        for yy in range(14, 52):   # the window over the tub: a hole, the sky shows through
            for xx in range(WX - 14, WX + 14):
                if yy >= 26 and yy < 50 or ((xx + .5 - WX) / 14) ** 2 + ((yy + .5 - 26) / 12) ** 2 <= 1 and yy < 26: g.p[yy][xx] = None
    return mkl(f, ol=False)
def floor_l(i): return mkl(lambda g: floor(g, i, random.Random(7)), ol=False)
def fixed(g):
    beams(g)
    for yy in range(12, 54):
        for xx in range(WX - 17, WX + 18):
            inside = yy >= 26 and WX - 14 <= xx <= WX + 13 and yy < 50 or ((xx + .5 - WX) / 14) ** 2 + ((yy + .5 - 26) / 12) ** 2 <= 1 and yy < 26
            outer = yy >= 26 and WX - 17 <= xx <= WX + 16 or ((xx + .5 - WX) / 17) ** 2 + ((yy + .5 - 26) / 15) ** 2 <= 1
            if outer and not inside and yy < 52: g.p[yy][xx] = 'wd'
    g.rect(WX, 14, WX, 49, 'wd'); g.rect(WX - 14, 32, WX + 13, 32, 'wd'); g.rect(WX - 19, 50, WX + 19, 53, 'wd3'); g.rect(WX - 19, 53, WX + 19, 53, 'wd2')
    rell(g, WX - 10, 48, 3, 2.4, 0, 'cu'); g.rect(WX - 11, 42, WX - 9, 46, 'hb'); g.put(WX - 12, 43, 'hb2'); g.put(WX - 8, 43, 'hb2')
    rell(g, WX + 10, 48, 2.6, 2, 0, 'cu'); g.put(WX + 10, 44, 'qa'); g.put(WX + 9, 45, 'hb'); g.put(WX + 11, 45, 'hb')
    # shower: the pipe comes down at the left end of the tub, below the roof slope
    g.rect(24, 34, 25, 74, 'cu'); g.rect(25, 34, 25, 74, 'cu2'); g.rect(25, 32, 33, 33, 'cu'); g.poly([(29, 34), (39, 34), (37, 38), (31, 38)], 'cu'); g.px('cu2', [(32, 39), (34, 39), (36, 39)])
    g.rect(20, 70, 30, 71, 'cu'); rell(g, 21, 68, 2, 1.4, 0, 'jr'); rell(g, 29, 68, 2, 1.4, 0, 'jr')
    # mirror and shelf above the sink
    rell(g, SX, 38, 9, 12, 0, 'wd'); rell(g, SX, 38, 7.5, 10.5, 0, 'jr'); g.rect(SX - 4, 30, SX - 3, 40, 'tub3'); g.put(SX - 2, 32, 'tub3')
    g.rect(SX - 12, 54, SX + 12, 55, 'wd'); g.rect(SX - 12, 54, SX + 12, 54, 'wd3')
    for (x, c) in ((SX - 9, 'qc'), (SX - 5, 'qa'), (SX + 7, 'qd')): g.rect(x, 48, x + 2, 53, c); g.put(x + 1, 47, 'wh')
    # towel rail and laundry basket
    g.rect(162, 60, 172, 61, 'cu'); g.rect(163, 62, 167, 80, 'tw1'); g.rect(164, 62, 164, 80, 'tw2'); g.rect(168, 62, 171, 76, 'tw3')
    g.poly([(100, 92), (116, 92), (114, 108), (102, 108)], 'aw3')
    for yy in range(93, 108, 2): g.rect(101, yy, 115, yy, 'tb')
    g.rect(103, 90, 112, 92, 'tw3'); g.put(110, 89, 'tw1')
TUBB = [lambda g: tub_back(g, 0), lambda g: tub3_back(g, 0), lambda g: tub3_back(g, 2)]
TUBF = [lambda g: tub_front_v(g, 0), lambda g: tub3_front(g, 0), lambda g: tub3_front(g, 2)]
SINK = [lambda g: sink3(g, 0), lambda g: sink3(g, 1), lambda g: sink3(g, 3)]
def front_l(fn):
    t = G(77, 34); s0 = G(77, 34)
    fn(s0)
    for y in range(34):
        for x in range(77):
            if s0.p[y][x] is not None and y + 2 < 34: t.p[y + 2][x] = s0.p[y][x]
    # pixels drawn at negative y (duck head, slipper end) are lost by G; redraw the duck so it sits on the rim
    rell(t, 66, 3.5, 3, 2.2, 0, 'duck'); rell(t, 69, 1.5, 1.6, 1.6, 0, 'duck'); t.put(71, 2, 'bk'); t.put(69, 1, 'K')
    t.outline('K'); return dict(w=77, h=34, svg=paths(t))
H = json.load(open('house.json'))
A = H['art']
for i in range(4): A['ba_wall_%d' % i] = wall_l(i); A['ba_floor_%d' % i] = floor_l(i)
A['ba_fix'] = mkl(fixed)
for i in range(3): A['ba_tubb_%d' % i] = mkl(TUBB[i]); A['ba_tub_%d' % i] = front_l(TUBF[i]); A['ba_sink_%d' % i] = mkl(SINK[i])
json.dump(H, open('house.json', 'w')); print('bath layers ok')
