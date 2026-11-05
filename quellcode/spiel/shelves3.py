# detailed shelves drawn natively at one pixel per scene unit (36 wide), several of them tall, one with a Titanic model
import sys, json, math, random, re
sys.path.insert(0, '../wild'); from lib import G
from meadow2 import rell, line
from PIL import Image, ImageDraw
pal = dict(K='#3a2414')
def C(n, h): pal[n] = h
for n, h in dict(w1='#9a6634', w2='#764a22', w3='#ba844a', wb='#4e3018', wb2='#3e2410',
                 o1='#b8803e', o2='#90602a', o3='#d4a060', ob='#5e3e22', ob2='#4a2e18',
                 s1='#c89458', s2='#a6743c', s3='#e2b274', sb='#6a4626', sb2='#563820',
                 r1='#5a3a2a', r2='#44281a', r3='#704a34',
                 gd='#e9b949', gd2='#b8862a', gl='#cfe6f0', gl2='#b4d4e2', gl3='#f2fbff',
                 g1='#5aa04e', g2='#3e7c3c', g3='#8ccc72', tc='#c9744a', tc2='#a85a34', tc3='#e0946a',
                 hull='#2a2a32', hull2='#3e3e48', red='#b8332a', wh='#f6f4ee', wh2='#d8d4ca', fun='#e8a83c', fun2='#c4842a', blk='#1d1a14',
                 sea='#4f86c6', cr='#fff4dc', jar='#e4f0f2', jar2='#c4dce2', nut='#a8743c', nut2='#7a4e24', seedc='#efe0b0', rd='#e8554a', bl='#4f86c6', pk='#f29aa8', ye='#ffd34e',
                 pu='#9a7ad0', te='#2aa8a8', gr='#5aa04e', org='#f07a2a', glb='#3a8ac8', glb2='#5ab05a', ph='#bfe3f7', ph2='#8fd06a').items(): C(n, h)
BOOKS = [('#8e3a2e', '#6a2820'), ('#4a6a3a', '#344e28'), ('#b07a2e', '#8a5c1c'), ('#6a4a7a', '#4e345c'), ('#3e5a6e', '#2c4252'), ('#a4583a', '#80402a'),
         ('#7a6a3a', '#5c4e28'), ('#c09a5a', '#9a7840'), ('#5e3a2a', '#44281c'), ('#8a7a52', '#6a5c3a'), ('#6e2e2e', '#521f1f'), ('#3e4e3a', '#2c3a28')]
for i, (a, b) in enumerate(BOOKS): C('b%d' % i, a); C('B%d' % i, b)
def paths(g): return ''.join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k, v in g.paths().items())

def cabinet(g, H, wood, boards, top='flat', base=True):
    w1, w2, w3, wb, wb2 = {'w': ('w1', 'w2', 'w3', 'wb', 'wb2'), 'o': ('o1', 'o2', 'o3', 'ob', 'ob2'), 's': ('s1', 's2', 's3', 'sb', 'sb2'), 'r': ('r1', 'r2', 'r3', 'wb', 'wb2')}[wood]
    t0 = 0 if top == 'flat' else 6
    g.rect(1, t0, 34, H - 1, w1)
    g.rect(4, t0 + 3, 31, H - 5, wb)
    for x in range(5, 31, 6): g.rect(x, t0 + 3, x, H - 5, wb2)   # back panel planks
    g.rect(1, t0, 34, t0 + 2, w1); g.rect(1, t0, 34, t0, w3); g.rect(0, t0 + 1, 35, t0 + 2, w1)
    g.rect(1, t0, 3, H - 1, w1); g.rect(32, t0, 34, H - 1, w1); g.rect(1, t0, 1, H - 1, w3); g.rect(34, t0 + 1, 34, H - 1, w2)
    if base: g.rect(1, H - 4, 34, H - 1, w2); g.rect(2, H - 4, 33, H - 4, w1); g.rect(3, H - 2, 32, H - 2, wb2)
    for y in boards:
        g.rect(4, y, 31, y + 1, w1); g.rect(4, y, 31, y, w3); g.rect(4, y + 2, 31, y + 2, wb2)
    for y in range(t0 + 4, H - 5, 5): g.put(2, y, w2); g.put(33, y + 2, w3)   # wood grain
    if top == 'flat':   # soften the top into a gentle curve with little corbels under the boards
        for x in range(0, 36):
            yy = int(2.6 - 2.6 * math.sin(math.pi * (x + .5) / 36))
            for y in range(0, yy): g.p[y][x] = None
        g.rect(13, 0, 22, 0, w3) if False else None
    for y in boards:
        g.put(4, y + 2, w1); g.put(4, y + 3, w1); g.put(5, y + 2, w1); g.put(31, y + 2, w1); g.put(31, y + 3, w1); g.put(30, y + 2, w1)
    if top == 'arch':
        for x in range(1, 35):
            yy = int(6 - 6 * math.sin(math.pi * (x - 0.5) / 34) ** 0.6)
            for y in range(yy, t0 + 1): g.put(x, y, w1)
            g.put(x, yy, w3)
    return w1, w2, w3

def books(g, x0, x1, ybase, maxh, seed, lean=True, sorted_colors=False):
    rnd = random.Random(seed); x = x0; k = 0
    while x <= x1 - 2:
        if rnd.random() < 0.08 and x < x1 - 6: x += 2; continue
        bw = rnd.choice([2, 2, 3, 3, 4]); bh = rnd.randint(max(5, maxh - 5), maxh)
        if x + bw - 1 > x1: break
        ci = (k * 2) % len(BOOKS) if sorted_colors else rnd.randrange(len(BOOKS)); k += 1
        a, b = 'b%d' % ci, 'B%d' % ci
        g.rect(x, ybase - bh + 1, x + bw - 1, ybase, a); g.rect(x + bw - 1, ybase - bh + 1, x + bw - 1, ybase, b)
        g.rect(x, ybase - bh + 2, x + bw - 2, ybase - bh + 2, b); g.rect(x, ybase - 2, x + bw - 2, ybase - 2, b)
        if bh > 7 and bw > 2: g.put(x + (bw - 1) // 2, ybase - bh // 2, 'gd')
        x += bw
    if lean and x < x1 - 3:   # a leaning book at the end of the row
        ci = rnd.randrange(len(BOOKS)); bh = maxh - 1
        for t in range(bh):
            xx = x + int(t * 0.45)
            g.put(xx, ybase - t, 'b%d' % ci); g.put(xx + 1, ybase - t, 'b%d' % ci); g.put(xx + 2, ybase - t, 'B%d' % ci)
    return x

def stack(g, x, ybase, n, seed):
    rnd = random.Random(seed)
    for i in range(n):
        ci = rnd.randrange(len(BOOKS)); w = rnd.randint(7, 9); xo = x + rnd.randint(-1, 1)
        g.rect(xo, ybase - i * 2 - 1, xo + w, ybase - i * 2, 'b%d' % ci); g.rect(xo, ybase - i * 2, xo + w, ybase - i * 2, 'B%d' % ci); g.put(xo + w, ybase - i * 2 - 1, 'cr')

LEAVES = []
def plant(g, cx, ybase, kind='round', pot='tc'):
    p2, p3 = {'tc': ('tc2', 'tc3'), 's1': ('s2', 's3'), 'bl': ('B1', 'b1')}[pot]
    g.rect(cx - 3, ybase - 4, cx + 2, ybase, pot); g.rect(cx - 4, ybase - 5, cx + 3, ybase - 4, pot); g.rect(cx - 4, ybase - 4, cx + 3, ybase - 4, p2); g.put(cx - 2, ybase - 2, p3); g.rect(cx + 2, ybase - 3, cx + 2, ybase, p2)
    lg = G(36, g.h)
    if kind == 'round':
        for (dx, dy, r) in [(-3, -8, 2.6), (2, -9, 2.8), (0, -12, 2.6), (-4, -12, 2), (4, -13, 2)]: lg.ell(cx + dx + .5, ybase + dy, r, r * 0.8, 'g1')
        lg.px('g3', [(cx - 4, ybase - 9), (cx + 1, ybase - 11), (cx - 1, ybase - 13)]); lg.px('g2', [(cx, ybase - 7), (cx + 3, ybase - 8), (cx - 2, ybase - 10)])
    elif kind == 'trail':   # trailing ivy hanging over the board
        for side in (-1, 1):
            for t in range(9):
                x = cx + side * (2 + t * 0.5); y = ybase - 6 + t * 1.4
                lg.put(x, y, 'g2')
                if t % 2: lg.ell(x + side, y, 1.5, 1.1, 'g1')
        lg.ell(cx + .5, ybase - 7, 3.6, 2.2, 'g1'); lg.px('g3', [(cx - 1, ybase - 8), (cx + 2, ybase - 8)])
    elif kind == 'succ':
        for a in range(-150, -20, 26):
            r = math.radians(a)
            for t in range(5): lg.put(cx + math.cos(r) * t * 0.9, ybase - 6 + math.sin(r) * t, 'g1' if t < 4 else 'g3')
        lg.ell(cx + .5, ybase - 6, 2.4, 1.4, 'g2')
    elif kind == 'flower':
        for dx in (-2, 0, 2): lg.rect(cx + dx, ybase - 11 + abs(dx), cx + dx, ybase - 6, 'g2')
        for dx, c in ((-2, 'pk'), (0, 'ye'), (2, 'rd')): lg.ell(cx + dx + .5, ybase - 12 + abs(dx), 1.6, 1.4, c)
        lg.ell(cx - 3.5, ybase - 7, 1.8, 1, 'g1'); lg.ell(cx + 4, ybase - 8, 1.8, 1, 'g1')
    lg.outline('K')
    ys = [y for y in range(lg.h) for x in range(36) if lg.p[y][x]]
    LEAVES.append(dict(svg=paths(lg), ox=cx + 0.5, oy=ybase - 5))

C('hon', '#f0a830'); C('hon2', '#c88018'); C('clay', '#c8744a'); C('clay2', '#a05634'); C('clay3', '#e09068'); C('tea', '#4e7a8a'); C('tea2', '#36606e'); C('tea3', '#7aa2b0')
C('scr', '#f0e2c0'); C('scr2', '#d4c094'); C('herb', '#6e9a4a'); C('herb2', '#4e7a34'); C('herb3', '#c8b45a'); C('mush', '#d8543a'); C('mush2', '#fff4dc'); C('wax', '#fff4dc'); C('wax2', '#ecdcb8')
def honey(g, x, ybase):
    rell(g, x + 3, ybase - 3.5, 3.4, 3.6, 0, 'hon'); g.rect(x + 1, ybase - 8, x + 5, ybase - 7, 'clay'); g.rect(x, ybase - 9, x + 6, ybase - 9, 'clay2')
    g.put(x + 2, ybase - 5, 'wax'); g.put(x + 4, ybase - 2, 'hon2'); g.put(x + 5, ybase - 3, 'hon2')
def drip_candle(g, x, ybase, h=7):
    g.rect(x - 1, ybase - 1, x + 3, ybase, 'clay2'); g.rect(x, ybase - h, x + 2, ybase - 2, 'wax'); g.rect(x + 2, ybase - h + 1, x + 2, ybase - 2, 'wax2')
    g.put(x, ybase - h + 2, 'wax2'); g.put(x, ybase - h + 3, 'wax2'); g.put(x + 1, ybase - h - 1, 'blk'); g.put(x + 1, ybase - h - 2, 'ye'); g.put(x + 1, ybase - h - 3, 'org')
def teapot(g, x, ybase):
    rell(g, x + 5, ybase - 3.5, 4.6, 3.6, 0, 'tea'); g.rect(x + 3, ybase - 8, x + 7, ybase - 7, 'tea2'); g.put(x + 5, ybase - 9, 'tea2')
    line(g, x + 9, ybase - 4, x + 12, ybase - 7, 'tea'); g.put(x + 12, ybase - 8, 'tea')
    for y in range(ybase - 6, ybase - 1): g.put(x - 1, y, 'tea2')
    g.put(x + 3, ybase - 5, 'tea3'); g.put(x + 4, ybase - 6, 'tea3'); g.rect(x + 2, ybase, x + 8, ybase, 'tea2')
def mug(g, x, ybase, c='clay'):
    g.rect(x, ybase - 4, x + 3, ybase, c); g.rect(x + 4, ybase - 3, x + 4, ybase - 1, c); g.put(x + 1, ybase - 3, 'clay3')
def scrolls(g, x, ybase):
    for k, (dx, dy) in enumerate([(0, 0), (4, 0), (2, -3)]):
        g.rect(x + dx, ybase - 2 + dy, x + dx + 6, ybase + dy, 'scr'); g.put(x + dx, ybase - 1 + dy, 'scr2'); g.put(x + dx + 6, ybase - 1 + dy, 'scr2'); g.put(x + dx + 3, ybase - 1 + dy, 'rd')
def herbs(g, x, ytop, n=3):
    # dried herb bundles hanging under a board
    for k in range(n):
        xx = x + k * 4
        g.rect(xx + 1, ytop, xx + 1, ytop + 2, 'scr2'); g.rect(xx, ytop + 2, xx + 2, ytop + 2, 'rd')
        for t in range(5): g.put(xx + (t % 3) - 0.5, ytop + 3 + t, 'herb' if t % 2 else 'herb3' if k % 2 else 'herb2'); g.put(xx + 1, ytop + 3 + t, 'herb2')
def mushrooms(g, x, ybase):
    for (dx, r) in ((0, 2.6), (5, 2), (9, 2.4)):
        g.rect(x + dx, ybase - 3, x + dx + 1, ybase, 'mush2'); rell(g, x + dx + 1, ybase - 4, r, r * 0.7, 0, 'mush'); g.put(x + dx, ybase - 5, 'mush2')
def frame_photo_old(g, x, ybase):
    g.rect(x, ybase - 8, x + 7, ybase, 'gd'); g.rect(x + 1, ybase - 7, x + 6, ybase - 1, 'ph'); g.rect(x + 1, ybase - 3, x + 6, ybase - 1, 'ph2')
    g.ell(x + 4, ybase - 4, 1.6, 1.4, 'o3'); g.put(x + 3, ybase - 5, 'o3'); g.put(x + 5, ybase - 5, 'o3'); g.put(x + 4, ybase - 4, 'blk')
    g.rect(x + 7, ybase - 8, x + 7, ybase, 'gd2')
def globe_old(g, cx, ybase):
    g.rect(cx - 3, ybase - 1, cx + 3, ybase, 'w2'); g.rect(cx, ybase - 3, cx, ybase - 1, 'gd2')
    g.ell(cx + .5, ybase - 7.5, 4.2, 4.2, 'glb'); g.px('glb2', [(cx - 2, ybase - 9), (cx - 1, ybase - 9), (cx - 1, ybase - 8), (cx + 2, ybase - 7), (cx + 2, ybase - 6), (cx + 3, ybase - 6), (cx - 2, ybase - 5)])
    for t in range(-5, 6): g.put(cx + 5, ybase - 7 + t, 'gd') if abs(t) < 5 else None
def globe(g, cx, ybase): teapot(g, cx - 5, ybase)
def hamfig(g, x, ybase): mug(g, x, ybase)
def frame_photo(g, x, ybase): scrolls(g, x, ybase)
def candle(g, x, ybase): drip_candle(g, x + 1, ybase)
def jar(g, x, ybase, fill, fill2, tall=8):
    g.rect(x, ybase - tall, x + 5, ybase, 'jar'); g.rect(x + 1, ybase - tall + 3, x + 4, ybase - 1, fill)
    for k in range(3): g.put(x + 1 + k * 1.5, ybase - 2 - (k % 2) * 2, fill2)
    g.rect(x, ybase - tall - 1, x + 5, ybase - tall, 'scr'); g.rect(x, ybase - tall, x + 5, ybase - tall, 'scr2'); g.put(x + 1, ybase - tall - 1, 'rd'); g.put(x + 4, ybase - tall + 1, 'jar2')
def candle_old(g, x, ybase):
    g.rect(x, ybase - 1, x + 4, ybase, 'gd2'); g.rect(x + 1, ybase - 6, x + 3, ybase - 2, 'cr'); g.put(x + 2, ybase - 7, 'blk'); g.put(x + 2, ybase - 8, 'ye'); g.put(x + 2, ybase - 9, 'org')
def hamfig_old(g, x, ybase):
    g.ell(x + 3, ybase - 3, 3.2, 3, 'o3'); g.ell(x + 3, ybase - 2, 2, 1.6, 'cr'); g.put(x + 1, ybase - 6, 'o2'); g.put(x + 5, ybase - 6, 'o2'); g.put(x + 2, ybase - 4, 'blk'); g.put(x + 4, ybase - 4, 'blk')
def basket(g, x0, x1, ybase, h=7):
    g.rect(x0, ybase - h, x1, ybase, 'o3')
    for y in range(ybase - h, ybase + 1):
        for x in range(x0, x1 + 1):
            if (x + y) % 3 == 0: g.put(x, y, 'o2')
    g.rect(x0, ybase - h, x1, ybase - h, 'o2')
def titanic(g, x0, ybase):
    # the RMS Titanic as a model on a stand: bow to the right, black hull with portholes, red below the waterline,
    # white decks, four buff funnels with black tops raked back, two thin masts
    g.rect(x0 + 9, ybase - 1, x0 + 18, ybase, 'w2'); g.rect(x0 + 11, ybase - 2, x0 + 12, ybase - 2, 'w2'); g.rect(x0 + 16, ybase - 2, x0 + 17, ybase - 2, 'w2')
    hy = ybase - 3
    g.rect(x0 + 1, hy - 4, x0 + 27, hy - 4, 'wh')
    for y, (a, b) in zip(range(hy - 3, hy), [(0, 27), (1, 26), (2, 25)]): g.rect(x0 + a, y, x0 + b, y, 'hull')
    g.rect(x0 + 3, hy, x0 + 24, hy, 'red')
    for x in range(x0 + 3, x0 + 25, 2): g.put(x, hy - 2, 'hull2')
    g.rect(x0 + 5, hy - 6, x0 + 23, hy - 5, 'wh'); g.rect(x0 + 7, hy - 7, x0 + 21, hy - 7, 'wh')
    for x in range(x0 + 6, x0 + 23, 2): g.put(x, hy - 5, 'wh2')
    for x in range(x0 + 8, x0 + 21, 3): g.put(x, hy - 7, 'wh2')
    for fx in (x0 + 9, x0 + 13, x0 + 17, x0 + 21):
        for y in range(hy - 12, hy - 7):
            xo = fx - (hy - 8 - y) // 3
            g.put(xo, y, 'fun'); g.put(xo + 1, y, 'fun2')
        top = fx - (hy - 8 - (hy - 12)) // 3
        g.put(top, hy - 12, 'blk'); g.put(top + 1, hy - 12, 'blk')
    for mx, top in ((x0 + 4, hy - 15), (x0 + 25, hy - 14)):
        for y in range(top, hy - 4): g.put(mx, y, 'w2')

items = []
def add(id_, name, H, fn):
    global LEAVES
    LEAVES = []
    g = G(36, H); fn(g); g.outline('K')
    items.append(dict(id=id_, name=name, w=36, h=H, svg=paths(g), leaves=LEAVES))

def small(g):
    cabinet(g, 52, 'w', [17, 32]); books(g, 5, 24, 16, 11, 1); plant(g, 27, 16, 'round')
    books(g, 5, 18, 31, 12, 2, lean=False); frame_photo(g, 21, 31); stack(g, 5, 46, 3, 3); hamfig(g, 18, 46); candle(g, 26, 46)
    herbs(g, 6, 18, 2); honey(g, 23, 31)
def oak(g):
    cabinet(g, 82, 'o', [16, 31, 46, 61]); globe(g, 9, 15); books(g, 15, 30, 15, 11, 4, lean=False)
    books(g, 5, 30, 30, 12, 5); books(g, 5, 18, 45, 12, 6, lean=False); frame_photo(g, 20, 45); plant(g, 10, 60, 'trail'); books(g, 16, 30, 60, 11, 7)
    stack(g, 6, 76, 4, 8); basket(g, 18, 30, 76, 7)
    herbs(g, 6, 47, 3)
def white(g):
    cabinet(g, 62, 's', [17, 33, 48]); plant(g, 9, 16, 'trail', 's1'); plant(g, 19, 16, 'succ', 's1'); plant(g, 27, 16, 'round', 's1')
    books(g, 5, 18, 32, 12, 9, lean=False); plant(g, 25, 32, 'flower', 's1'); candle(g, 6, 47); plant(g, 16, 47, 'round', 'tc'); jar(g, 23, 47, 'seedc', 'nut2', 7)
    basket(g, 6, 29, 58, 6)
    herbs(g, 6, 34, 2)
def ladder(g):
    H = 74
    for y in range(H):   # two rails leaning against the wall
        xl = 2 + int((H - y) * 0.06); xr = 33 - int((H - y) * 0.06)
        g.put(xl, y, 'o1'); g.put(xl + 1, y, 'o2'); g.put(xr, y, 'o1'); g.put(xr - 1, y, 'o2')
    for i, y in enumerate([14, 29, 44, 59, 72]):
        xl = 2 + int((H - y) * 0.06); xr = 33 - int((H - y) * 0.06)
        g.rect(xl, y, xr, y + 1, 'o1'); g.rect(xl, y, xr, y, 'o3')
    books(g, 8, 20, 13, 9, 10); plant(g, 24, 13, 'succ')
    books(g, 6, 18, 28, 11, 11, lean=False); globe(g, 24, 28)
    plant(g, 9, 43, 'trail'); books(g, 13, 28, 43, 11, 12)
    stack(g, 6, 58, 3, 13); jar(g, 18, 58, 'nut', 'nut2'); candle(g, 26, 58)
    basket(g, 5, 30, 71, 9)
def arch(g):
    cabinet(g, 66, 'w', [21, 36, 51], top='arch'); g.ell(18, 12, 5, 5, 'gd'); g.ell(18, 12, 3.6, 3.6, 'cr'); g.put(18, 12, 'blk'); g.rect(18, 10, 18, 12, 'blk'); g.rect(18, 12, 20, 12, 'blk')
    books(g, 5, 30, 20, 9, 14, lean=False)
    books(g, 5, 20, 35, 12, 15); plant(g, 26, 35, 'flower')
    frame_photo(g, 5, 50); books(g, 14, 30, 50, 12, 16, lean=False)
    stack(g, 6, 61, 3, 17); hamfig(g, 22, 61)
    herbs(g, 6, 37, 3)
def pantry(g):
    cabinet(g, 62, 'w', [17, 32, 47])
    jar(g, 5, 16, 'seedc', 'nut2', 9); jar(g, 12, 16, 'nut', 'nut2', 10); jar(g, 19, 16, 'g3', 'g2', 8); jar(g, 26, 16, 'rd', 'B0', 9)
    jar(g, 5, 31, 'ye', 'B3', 8); jar(g, 12, 31, 'org', 'B5', 10); plant(g, 23, 31, 'round')
    basket(g, 5, 17, 46, 7); basket(g, 19, 30, 46, 7); g.px('nut', [(8, 39), (11, 38), (22, 38), (26, 39)])
    stack(g, 6, 58, 2, 18); jar(g, 21, 58, 'seedc', 'nut2', 8)
    herbs(g, 5, 18, 5); honey(g, 23, 58)
def cube(g):
    cabinet(g, 58, 's', [19, 37]); g.rect(17, 3, 18, 53, 's1'); g.rect(17, 3, 17, 53, 's3')
    books(g, 5, 15, 18, 12, 19, lean=False); plant(g, 25, 18, 'succ', 's1')
    basket(g, 5, 15, 36, 9); globe(g, 25, 36)
    plant(g, 10, 53, 'round', 's1'); books(g, 20, 30, 53, 12, 20)
def rainbow(g):
    cabinet(g, 56, 's', [18, 36]); books(g, 5, 30, 17, 13, 21, lean=False, sorted_colors=True)
    books(g, 5, 26, 35, 13, 22, sorted_colors=True); books(g, 5, 30, 51, 12, 23, lean=False, sorted_colors=True)
    herbs(g, 6, 19, 6)
def crates(g):
    H = 70
    for (x0, y0, x1, y1) in [(1, 46, 34, 69), (3, 23, 28, 45), (8, 2, 30, 22)]:
        g.rect(x0, y0, x1, y1, 'o1'); g.rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2, 'ob')
        for y in range(y0 + 2, y1 - 1, 4): g.rect(x0 + 2, y, x1 - 2, y, 'ob2')
        g.rect(x0, y0, x1, y0, 'o3'); g.rect(x1, y0, x1, y1, 'o2')
    books(g, 10, 22, 20, 12, 24, lean=False); plant(g, 26, 20, 'succ')
    books(g, 5, 18, 43, 13, 25); jar(g, 20, 43, 'nut', 'nut2')
    stack(g, 4, 67, 4, 26); basket(g, 15, 31, 67, 10)
    mushrooms(g, 5, 20)
def tree(g):
    H = 78
    g.rect(16, 6, 19, H - 1, 'w1'); g.rect(16, 6, 16, H - 1, 'w3'); g.rect(19, 6, 19, H - 1, 'w2'); g.rect(12, H - 3, 23, H - 1, 'w2')
    for y in range(10, H - 3, 6): g.put(17 + (y // 6) % 2, y, 'w2')
    for (side, y) in [(-1, 22), (1, 36), (-1, 52), (1, 66)]:
        x0, x1 = (3, 16) if side < 0 else (19, 33)
        g.rect(x0, y, x1, y + 1, 'w1'); g.rect(x0, y, x1, y, 'w3')
        for t in range(5): g.put((x0 + 3 + t) if side < 0 else (x1 - 3 - t), y + 2 + t, 'w1'); g.put((x0 + 4 + t) if side < 0 else (x1 - 4 - t), y + 2 + t, 'w2')
    books(g, 4, 14, 21, 10, 27, lean=False); plant(g, 28, 35, 'flower'); books(g, 20, 25, 35, 10, 28, lean=False)
    frame_photo(g, 5, 51); hamfig(g, 22, 65); candle(g, 28, 65)
    lg = G(36, H)
    for (cx, cy, r) in [(18, 8, 8), (10, 10, 5), (26, 10, 5.4), (18, 2.6, 5)]: lg.ell(cx, cy, r, r * 0.7, 'g1')
    for (x, y) in [(13, 6), (20, 4), (24, 8), (9, 9), (16, 10), (27, 11)]: lg.px('g3', [(x, y), (x + 1, y)])
    for (x, y) in [(15, 11), (22, 12), (11, 12), (19, 7)]: lg.put(x, y, 'g2')
    lg.outline('K'); LEAVES.append(dict(svg=paths(lg), ox=18, oy=14))
def titanic_case(g):
    cabinet(g, 86, 'r', [32, 48, 64])
    # glass display case at the top with the ship model
    g.rect(4, 3, 31, 31, 'gl'); g.rect(4, 3, 31, 3, 'gl2'); g.rect(4, 26, 31, 31, 'gl2')
    for k in range(3):
        for t in range(10): g.put(7 + k * 9 + t // 2, 6 + t, 'gl3')
    titanic(g, 4, 29)
    g.rect(14, 30, 21, 31, 'gd'); g.rect(15, 30, 20, 30, 'gd2')
    g.rect(3, 3, 3, 31, 'gd2'); g.rect(32, 3, 32, 31, 'gd2'); g.rect(17, 3, 18, 25, 'gl2') if False else None
    books(g, 5, 30, 47, 12, 29, lean=False)
    books(g, 5, 18, 63, 12, 30); globe(g, 25, 63)
    stack(g, 6, 81, 3, 31); frame_photo(g, 17, 81); candle(g, 27, 81)
def tower(g):
    cabinet(g, 90, 'o', [17, 32, 47, 62, 76])
    books(g, 5, 30, 16, 12, 32); plant(g, 10, 31, 'trail'); books(g, 15, 30, 31, 12, 33, lean=False)
    books(g, 5, 30, 46, 12, 34); frame_photo(g, 5, 61); books(g, 14, 30, 61, 12, 35)
    jar(g, 6, 75, 'seedc', 'nut2'); hamfig(g, 14, 75); books(g, 21, 30, 75, 11, 36, lean=False)
    basket(g, 5, 30, 85, 7)

    herbs(g, 6, 63, 2)
# ======== cosy contents: each shelf has its own theme, books are only one of many things ========
C('tin', '#8a3a2e'); C('tin2', '#6a2820'); C('tin3', '#c8a03a'); C('cupw', '#f4ecdc'); C('cupw2', '#d8ccb4'); C('sand', '#e8c87a'); C('glas', '#d8eef4'); C('glas2', '#b4d4e0')
C('ap', '#d4443a'); C('ap2', '#a82e26'); C('ap3', '#ff7a6a'); C('ch', '#f2c64a'); C('ch2', '#d4a42a'); C('brd', '#c88a44'); C('brd2', '#a06a2c'); C('brd3', '#e4aa64')
C('sack', '#d8c49a'); C('sack2', '#b8a274'); C('yr', '#d8584a'); C('yb', '#5a7ad0'); C('yy', '#e8c040'); C('yg', '#6aa05a'); C('pmk', '#e8822a'); C('pmk2', '#c0601a')
C('pot_', '#a8845c'); C('pot2_', '#8a6a44'); C('car', '#f08a2a'); C('cone', '#8a5a30'); C('cone2', '#6a4222'); C('egg', '#cfe8f0'); C('ink', '#2a2e3a'); C('fea', '#f6f2ea'); C('bot', '#4e8a6a'); C('bot2', '#8a4a6a'); C('bot3', '#c8a03a')
for _k, _v in dict(ir='#4a4a52', ir2='#6e6e78', st='#a8a49a', st2='#7e7a70', org='#f07a2a', ye='#ffd34e', rd='#e8554a', blk='#2b1d12').items():
    pal.setdefault(_k, _v)
def cups(g, x, ybase, n=3):
    for k in range(n):
        xx = x + k * 5
        g.rect(xx, ybase - 3, xx + 3, ybase, 'cupw'); g.rect(xx + 3, ybase - 3, xx + 3, ybase, 'cupw2'); g.put(xx + 4, ybase - 2, 'cupw2'); g.put(xx + 1, ybase - 2, 'tea')
def tins(g, x, ybase):
    for k, (h, c) in enumerate([(8, 'tin'), (6, 'tea'), (7, 'herb2')]):
        xx = x + k * 5
        g.rect(xx, ybase - h, xx + 3, ybase, c); g.rect(xx, ybase - h, xx + 3, ybase - h, 'tin3'); g.rect(xx, ybase - h // 2, xx + 3, ybase - h // 2, 'tin3')
def hourglass(g, x, ybase):
    g.rect(x, ybase - 10, x + 6, ybase - 10, 'w2'); g.rect(x, ybase, x + 6, ybase, 'w2'); g.rect(x, ybase - 9, x, ybase - 1, 'w2'); g.rect(x + 6, ybase - 9, x + 6, ybase - 1, 'w2')
    for t in range(4): g.rect(x + 1 + t // 2, ybase - 9 + t, x + 5 - t // 2, ybase - 9 + t, 'glas')
    for t in range(4): g.rect(x + 1 + (3 - t) // 2, ybase - 4 + t, x + 5 - (3 - t) // 2, ybase - 4 + t, 'sand' if t > 0 else 'glas')
    g.put(x + 3, ybase - 5, 'sand')
def bottles(g, x, ybase):
    for k, (c, h) in enumerate([('bot', 9), ('bot2', 7), ('bot3', 8)]):
        xx = x + k * 5
        g.rect(xx, ybase - h + 3, xx + 3, ybase, c); g.rect(xx + 1, ybase - h, xx + 2, ybase - h + 2, c); g.rect(xx + 1, ybase - h - 1, xx + 2, ybase - h - 1, 'cone'); g.put(xx + 1, ybase - h + 4, 'glas')
        g.rect(xx, ybase - 3, xx + 3, ybase - 2, 'scr')
def lantern_s(g, x, ybase):
    g.rect(x + 2, ybase - 11, x + 3, ybase - 10, 'ir'); g.rect(x, ybase - 9, x + 5, ybase - 9, 'ir'); g.rect(x, ybase - 8, x + 5, ybase - 1, 'hon'); g.rect(x, ybase - 8, x, ybase - 1, 'ir'); g.rect(x + 5, ybase - 8, x + 5, ybase - 1, 'ir')
    g.put(x + 2, ybase - 5, 'ye'); g.put(x + 3, ybase - 4, 'org'); g.rect(x, ybase, x + 5, ybase, 'ir')
def mortar(g, x, ybase):
    rell(g, x + 4, ybase - 2, 4, 2.6, 0, 'st'); g.rect(x, ybase - 4, x + 8, ybase - 4, 'st2'); line(g, x + 5, ybase - 4, x + 8, ybase - 9, 'w3'); g.put(x + 8, ybase - 10, 'w3')
def seedpacks(g, x, ybase):
    for k, c in enumerate(['ye', 'rd', 'herb']):
        g.rect(x + k * 4, ybase - 6, x + k * 4 + 3, ybase, 'scr'); g.rect(x + k * 4 + 1, ybase - 4, x + k * 4 + 2, ybase - 3, c)
def can(g, x, ybase):
    g.rect(x + 2, ybase - 6, x + 8, ybase, 'tea'); g.rect(x + 2, ybase - 6, x + 8, ybase - 6, 'tea3'); line(g, x + 2, ybase - 4, x - 1, ybase - 8, 'tea'); g.put(x - 2, ybase - 9, 'tea2')
    g.rect(x + 9, ybase - 5, x + 9, ybase - 2, 'tea2'); g.rect(x + 4, ybase - 8, x + 7, ybase - 8, 'tea2')
def apples(g, x, ybase):
    rell(g, x + 5, ybase - 1, 5.6, 2, 0, 'w3')
    for (dx, dy) in [(1, 3), (5, 3), (9, 3), (3, 6), (7, 6)]: rell(g, x + dx, ybase - dy, 2, 1.8, 0, 'ap'); g.put(x + dx - 1, ybase - dy - 1, 'ap3'); g.put(x + dx, ybase - dy - 2, 'herb2')
def cheese(g, x, ybase):
    g.rect(x, ybase - 5, x + 9, ybase, 'ch'); g.rect(x, ybase - 5, x + 9, ybase - 5, 'ch2'); g.poly([(x + 6, ybase - 5), (x + 9, ybase - 5), (x + 9, ybase)], 'ch2')
    g.px('ch2', [(x + 2, ybase - 2), (x + 4, ybase - 3)])
def bread(g, x, ybase):
    rell(g, x + 5, ybase - 2.5, 5.6, 3, 0, 'brd'); g.rect(x, ybase, x + 10, ybase, 'brd2')
    for k in range(3): g.put(x + 2 + k * 3, ybase - 4, 'brd3'); g.put(x + 3 + k * 3, ybase - 3, 'brd2')
def sack(g, x, ybase):
    g.poly([(x + 1, ybase - 8), (x + 8, ybase - 8), (x + 10, ybase), (x - 1, ybase)], 'sack'); g.rect(x + 2, ybase - 10, x + 7, ybase - 9, 'sack2'); g.put(x + 4, ybase - 4, 'sack2'); g.put(x + 5, ybase - 5, 'sack2')
def yarn(g, x, ybase):
    for k, c in enumerate(['yr', 'yb', 'yy']):
        cx = x + 3 + k * 6; rell(g, cx, ybase - 3, 3, 3, 0, c)
        for t in range(-2, 3): g.put(cx + t, ybase - 3 - t * 0.6, 'cupw2' if k != 2 else 'ch2')
    line(g, x + 18, ybase - 4, x + 21, ybase - 9, 'w2'); line(g, x + 19, ybase - 4, x + 23, ybase - 8, 'w2')
def blankets(g, x, ybase):
    for k, c in enumerate(['yr', 'yg', 'yy', 'yb']):
        g.rect(x, ybase - 2 - k * 2, x + 12, ybase - k * 2, c); g.put(x + 12, ybase - 1 - k * 2, 'cupw')
        for xx in range(x + 1, x + 12, 3): g.put(xx, ybase - 1 - k * 2, 'cupw')
def pumpkin(g, x, ybase, r=4):
    rell(g, x + r, ybase - r * 0.8, r, r * 0.8, 0, 'pmk'); g.rect(x + r, ybase - r * 1.6 - 1, x + r, ybase - r * 1.6, 'herb2')
    g.rect(x + r - 1, ybase - r * 1.5, x + r - 1, ybase - 1, 'pmk2'); g.rect(x + r + 1, ybase - r * 1.5, x + r + 1, ybase - 1, 'pmk2')
def potatoes(g, x, ybase):
    for (dx, dy) in [(0, 2), (4, 2), (8, 2), (2, 4), (6, 4)]: rell(g, x + dx + 1.5, ybase - dy, 2, 1.5, 0, 'pot_'); g.put(x + dx + 1, ybase - dy, 'pot2_')
def carrots(g, x, ybase):
    for k in range(3):
        xx = x + k * 3; g.poly([(xx, ybase - 7), (xx + 2, ybase - 7), (xx + 1, ybase)], 'car'); g.rect(xx, ybase - 9, xx + 2, ybase - 8, 'herb')
def cones(g, x, ybase):
    for k in range(3):
        xx = x + k * 4; rell(g, xx + 1.5, ybase - 2.5, 1.8, 2.8, 0, 'cone')
        for t in range(3): g.put(xx + (t % 2), ybase - 1 - t * 1.5, 'cone2')
def nest(g, x, ybase):
    rell(g, x + 5, ybase - 1.5, 5.6, 2.2, 0, 'w2'); rell(g, x + 5, ybase - 2.5, 4, 1.2, 0, 'wb')
    for k in range(3): rell(g, x + 3 + k * 2, ybase - 3.5, 1.2, 1.4, 0, 'egg')
    for k in range(6): g.put(x + k * 2, ybase - 1 + (k % 2), 'w3')
def quill(g, x, ybase):
    g.rect(x, ybase - 3, x + 3, ybase, 'ink'); g.put(x + 1, ybase - 3, 'glas2'); line(g, x + 2, ybase - 3, x + 6, ybase - 12, 'fea'); line(g, x + 3, ybase - 4, x + 7, ybase - 11, 'fea'); g.put(x + 3, ybase - 5, 'cupw2')
def compass(g, x, ybase):
    rell(g, x + 3, ybase - 3, 3.2, 3, 0, 'gd'); rell(g, x + 3, ybase - 3, 2, 1.8, 0, 'cupw'); g.put(x + 3, ybase - 4, 'rd'); g.put(x + 3, ybase - 2, 'ink')
def map_(g, x, ybase):
    g.rect(x, ybase - 1, x + 10, ybase, 'scr'); g.rect(x, ybase - 9, x + 1, ybase, 'scr2'); g.rect(x + 1, ybase - 8, x + 9, ybase - 1, 'scr')
    line(g, x + 2, ybase - 6, x + 8, ybase - 3, 'herb2'); g.put(x + 6, ybase - 6, 'rd'); g.put(x + 7, ybase - 5, 'rd')

def small(g):   # Teeregal
    cabinet(g, 52, 'w', [17, 32]); teapot(g, 6, 16); cups(g, 20, 16, 2); honey(g, 4, 31); tins(g, 13, 31); drip_candle(g, 28, 31)
    herbs(g, 6, 18, 2); books(g, 5, 16, 46, 10, 2, lean=False); cups(g, 20, 46, 2)
def oak(g):   # Kuriositäten
    cabinet(g, 82, 'o', [16, 31, 46, 61]); hourglass(g, 6, 15); map_(g, 15, 15); compass(g, 27, 15)
    bottles(g, 5, 30); lantern_s(g, 22, 30); books(g, 5, 18, 45, 11, 6, lean=False); nest(g, 20, 45)
    mushrooms(g, 6, 60); books(g, 18, 30, 60, 11, 7); herbs(g, 6, 47, 3)
    basket(g, 5, 30, 76, 7)
def white(g):   # Kräuterregal
    cabinet(g, 62, 's', [17, 33, 48]); plant(g, 9, 16, 'succ', 'tc'); plant(g, 18, 16, 'round', 'tc'); plant(g, 27, 16, 'flower', 'tc')
    herbs(g, 6, 19, 6); mortar(g, 6, 32); seedpacks(g, 17, 32); drip_candle(g, 29, 32)
    can(g, 7, 47); jar(g, 21, 47, 'seedc', 'nut2', 7); basket(g, 6, 29, 58, 6)
def ladder(g):   # Gärtnerleiter
    H = 74
    for y in range(H):
        xl = 2 + int((H - y) * 0.06); xr = 33 - int((H - y) * 0.06)
        g.put(xl, y, 'o1'); g.put(xl + 1, y, 'o2'); g.put(xr, y, 'o1'); g.put(xr - 1, y, 'o2')
    for y in [14, 29, 44, 59, 72]:
        xl = 2 + int((H - y) * 0.06); xr = 33 - int((H - y) * 0.06)
        g.rect(xl, y, xr, y + 1, 'o1'); g.rect(xl, y, xr, y, 'o3')
    plant(g, 12, 13, 'succ'); plant(g, 22, 13, 'flower')
    can(g, 8, 28); seedpacks(g, 20, 28)
    plant(g, 9, 43, 'round'); carrots(g, 16, 43); mortar(g, 22, 43)
    pumpkin(g, 6, 58); potatoes(g, 16, 58)
    basket(g, 5, 30, 71, 9)
def arch(g):
    cabinet(g, 66, 'w', [21, 36, 51], top='arch'); g.ell(18, 12, 5, 5, 'gd'); g.ell(18, 12, 3.6, 3.6, 'cr'); g.put(18, 12, 'blk'); g.rect(18, 10, 18, 12, 'blk'); g.rect(18, 12, 20, 12, 'blk')
    drip_candle(g, 6, 20); drip_candle(g, 28, 20, 5); books(g, 11, 24, 20, 9, 14, lean=False)
    apples(g, 6, 35); hamfig_old(g, 22, 35) if False else mug(g, 24, 35, 'tea')
    herbs(g, 6, 37, 3); books(g, 18, 30, 50, 12, 16, lean=False)
    lantern_s(g, 7, 61); stack(g, 17, 61, 3, 17)
def pantry(g):   # Speisekammer
    cabinet(g, 62, 'w', [17, 32, 47])
    jar(g, 5, 16, 'ap', 'ap2', 9); jar(g, 12, 16, 'hon', 'hon2', 10); jar(g, 19, 16, 'g3', 'g2', 8); jar(g, 26, 16, 'ye', 'B2', 9)
    cheese(g, 5, 31); bread(g, 18, 31)
    herbs(g, 5, 18, 5); apples(g, 5, 46); sack(g, 20, 46)
    potatoes(g, 6, 58); honey(g, 23, 58)
def cube(g):   # Fächerregal mit Wolle
    cabinet(g, 58, 's', [19, 37]); g.rect(17, 3, 18, 53, 's1'); g.rect(17, 3, 17, 53, 's3')
    yarn(g, 5, 18) if False else None
    for k, c in enumerate(['yr', 'yb']): rell(g, 8 + k * 5, 15.5, 2.6, 2.6, 0, c)
    blankets(g, 20, 18)
    basket(g, 5, 15, 36, 9); for_ = None
    rell(g, 24, 33, 3, 3, 0, 'yy'); rell(g, 29, 33, 2.6, 2.6, 0, 'yg'); line(g, 22, 30, 31, 26, 'w2')
    cups(g, 5, 53, 2); plant(g, 25, 53, 'round', 'tc')
def rainbow(g):   # Bücherwand
    cabinet(g, 56, 's', [18, 36]); books(g, 5, 30, 17, 13, 21, lean=False, sorted_colors=True)
    books(g, 5, 22, 35, 13, 22, sorted_colors=True); quill(g, 25, 35)
    books(g, 5, 30, 51, 12, 23, lean=False, sorted_colors=True)
def crates(g):   # Erntekisten
    for (x0, y0, x1, y1) in [(1, 46, 34, 69), (3, 23, 28, 45), (8, 2, 30, 22)]:
        g.rect(x0, y0, x1, y1, 'o1'); g.rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2, 'ob')
        for y in range(y0 + 2, y1 - 1, 4): g.rect(x0 + 2, y, x1 - 2, y, 'ob2')
        g.rect(x0, y0, x1, y0, 'o3'); g.rect(x1, y0, x1, y1, 'o2')
    apples(g, 11, 20); mushrooms(g, 22, 20) if False else carrots(g, 23, 20)
    pumpkin(g, 5, 43, 5); potatoes(g, 16, 43)
    pumpkin(g, 4, 67, 4); sack(g, 14, 67); apples(g, 22, 67)
def tree(g):
    H = 78
    g.rect(16, 6, 19, H - 1, 'w1'); g.rect(16, 6, 16, H - 1, 'w3'); g.rect(19, 6, 19, H - 1, 'w2'); g.rect(12, H - 3, 23, H - 1, 'w2')
    for y in range(10, H - 3, 6): g.put(17 + (y // 6) % 2, y, 'w2')
    for (side, y) in [(-1, 22), (1, 36), (-1, 52), (1, 66)]:
        x0, x1 = (3, 16) if side < 0 else (19, 33)
        g.rect(x0, y, x1, y + 1, 'w1'); g.rect(x0, y, x1, y, 'w3')
        for t in range(5): g.put((x0 + 3 + t) if side < 0 else (x1 - 3 - t), y + 2 + t, 'w1'); g.put((x0 + 4 + t) if side < 0 else (x1 - 4 - t), y + 2 + t, 'w2')
    nest(g, 4, 21); lantern_s(g, 25, 35); cones(g, 4, 51); drip_candle(g, 27, 65); mushrooms(g, 20, 65) if False else None
    lg = G(36, H)
    for (cx, cy, r) in [(18, 8, 8), (10, 10, 5), (26, 10, 5.4), (18, 2.6, 5)]: lg.ell(cx, cy, r, r * 0.7, 'g1')
    for (x, y) in [(13, 6), (20, 4), (24, 8), (9, 9), (16, 10), (27, 11)]: lg.px('g3', [(x, y), (x + 1, y)])
    lg.outline('K'); LEAVES.append(dict(svg=paths(lg), ox=18, oy=14))
def tower(g):   # Schreibstube
    cabinet(g, 90, 'o', [17, 32, 47, 62, 76])
    books(g, 5, 30, 16, 12, 32); quill(g, 6, 31); map_(g, 14, 31); drip_candle(g, 28, 31)
    books(g, 5, 22, 46, 12, 34); hourglass(g, 25, 46); scrolls(g, 5, 61); books(g, 18, 30, 61, 11, 35, lean=False)
    tins(g, 6, 75); compass(g, 23, 75)
    basket(g, 5, 30, 85, 7); herbs(g, 6, 63, 2)

for a in [('small', 'Teeregal', 52, small), ('oak', 'Kuriositätenregal', 82, oak), ('white', 'Kräuterregal', 62, white), ('ladder', 'Gärtnerleiter', 74, ladder),
          ('arch', 'Bogenregal mit Uhr', 66, arch), ('pantry', 'Speisekammer', 62, pantry), ('cube', 'Wollregal', 58, cube), ('rainbow', 'Bücherwand', 56, rainbow),
          ('crates', 'Erntekisten', 70, crates), ('tree', 'Baumregal', 78, tree), ('titanic', 'Vitrine mit Titanic', 86, titanic_case), ('tower', 'Schreibstube', 90, tower)]:
    add(*a)
json.dump(items, open('shelves3.json', 'w'), ensure_ascii=False)
sc = 5; sheet = Image.new('RGB', (len(items) * 38 * sc, 92 * sc), '#fbe9d4'); d = ImageDraw.Draw(sheet)
for i, it in enumerate(items):
    oy = (92 - it['h']) * sc
    for svg in [it['svg']] + [l['svg'] for l in it['leaves']]:
        for m in re.finditer(r'fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
            for x, y, n in re.findall(r'M(\d+) (\d+)h(\d+)', m.group(2)):
                x, y, n = int(x), int(y), int(n); d.rectangle([i * 38 * sc + x * sc, oy + y * sc, i * 38 * sc + (x + n) * sc - 1, oy + y * sc + sc - 1], fill=m.group(1))
sheet.save('shelves3.png'); print(len(items))
