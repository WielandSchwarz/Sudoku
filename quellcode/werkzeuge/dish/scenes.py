from dlib import *
import random
def tiles(sc, y0, y1, c1, c2, grout, tw=10, th=6):
    for y in range(y0, y1):
        for x in range(sc.w):
            row = (y - y0) // th; xo = (tw // 2) * (row % 2)
            g = (y - y0) % th == th - 1 or (x + xo) % tw == tw - 1
            sc.px(x, y, grout if g else (c1 if hx((x + xo) // tw, row, 2) < .5 else c2))
def wood(sc, x0, y0, w, h, P, plank=5, vertical=False):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            k = ((x - x0) if vertical else (y - y0)) // plank; t = (x - x0) if vertical else (y - y0)
            c = P[1] if hx(k, 3) < .5 else P[2]
            if t % plank == plank - 1: c = P[0]
            elif hx(x // 6 if not vertical else y // 6, k, 7) < .06: c = P[0]
            sc.px(x, y, c)
def counter_top(sc, y0, y1, P):          # a counter top seen from above: lighter at the back edge, a lit front lip
    for y in range(y0, y1):
        for x in range(sc.w):
            t = (y - y0) / max(1, (y1 - y0))
            c = P[2] if hx(x // 9, y // 3, 4) < .5 else P[1]
            if y == y0: c = P[0]
            sc.px(x, y, c)
    sc.rect(0, y1, sc.w, 1, P[3]); sc.rect(0, y1 + 1, sc.w, 2, P[1]); sc.rect(0, y1 + 3, sc.w, 1, P[0])
def cabinets(sc, y0, P, n=4):
    sc.rect(0, y0, sc.w, sc.h - y0, P[1])
    w = sc.w // n
    for i in range(n):
        x = i * w + 3; sc.rect(x, y0 + 4, w - 6, sc.h - y0 - 4, P[2]); sc.rect(x, y0 + 4, w - 6, 1, P[3]); sc.rect(x, y0 + 4, 1, sc.h - y0 - 4, P[3])
        sc.rect(x + w - 7, y0 + 4, 1, sc.h - y0 - 4, P[0]); sc.rect(x + (w - 6) // 2 + (2 if i % 2 else -3), y0 + 12, 2, 2, '#3a2414')
def basin(sc, x0, y0, w, h, rim, inner, water, foam=False, depth=7):
    # the sink opening seen from above: a rim, the inner back wall, water filling the bottom
    for y in range(y0 - 2, y0 + h + 2):
        for x in range(x0 - 2, x0 + w + 2):
            sc.px(x, y, rim[0] if y < y0 or y >= y0 + h or x < x0 or x >= x0 + w else None) if False else None
    sc.rect(x0 - 3, y0 - 3, w + 6, h + 6, K); sc.rect(x0 - 2, y0 - 2, w + 4, h + 4, rim[1]); sc.rect(x0 - 2, y0 - 2, w + 4, 1, rim[2]); sc.rect(x0 - 2, y0 + h + 1, w + 4, 1, rim[0])
    sc.rect(x0, y0, w, h, inner[0])
    sc.rect(x0, y0, w, depth, inner[1]); sc.rect(x0, y0, 2, h, inner[1]); sc.rect(x0 + w - 2, y0, 2, h, inner[2])
    sc.rect(x0, y0, w, 1, '#2a1a10')
    for y in range(y0 + depth, y0 + h):
        for x in range(x0 + 2, x0 + w - 2):
            c = water[0]
            if (y - y0) % 5 == 2 and hx(x // 6, y, 5) < .45: c = water[1]
            if (y - y0) % 5 == 2 and hx(x // 6, y, 5) < .12: c = water[2]
            sc.px(x, y, c)
    if foam:
        random.seed(x0 + y0)
        for k in range(int(w * h / 60)):
            bx = x0 + 4 + random.random() * (w - 8); by = y0 + depth + 2 + random.random() * (h - depth - 4) * (.5 if random.random() < .6 else 1)
            r = 1.2 + random.random() * 2.2
            for yy in range(int(by - r - 1), int(by + r + 2)):
                for xx in range(int(bx - r - 1), int(bx + r + 2)):
                    d = math.hypot(xx + .5 - bx, yy + .5 - by)
                    if d <= r: sc.px(xx, yy, '#ffffff' if (xx - bx) + (yy - by) < -r * .3 else '#e4eef8')
                    elif d <= r + .8: sc.px(xx, yy, '#b8d4ec')
    sc.rect(x0 + 2, y0 + depth, w - 4, 1, water[2])
def faucet(sc, x, y, metal=('#5a6470', '#a8b4c0', '#e0e8f0')):
    for k in range(10): sc.px(x, y - k, metal[1]); sc.px(x + 1, y - k, metal[0]); sc.px(x - 1, y - k, metal[2])
    for k in range(8): sc.px(x + k, y - 10 - (1 if 1 < k < 6 else 0), metal[1]); sc.px(x + k, y - 9 - (1 if 1 < k < 6 else 0), metal[0])
    sc.rect(x + 7, y - 9, 2, 3, metal[1]); sc.rect(x - 4, y - 4, 3, 2, '#c83a2a')
def window(sc, x, y, w, h, frame='#f4ead8', fd='#c8b490'):
    sc.rect(x - 2, y - 2, w + 4, h + 4, K); sc.rect(x - 1, y - 1, w + 2, h + 2, frame)
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            t = (yy - y) / h
            c = '#8fd0f4' if t < .45 else '#c8ecfc' if t < .55 else None
            if t >= .5: c = '#4a8a3a' if hx(xx // 2, yy // 2, 3) < .5 else '#3a7030'
            if .48 < t < .62 and hx(xx // 3, 1, 4) < .6: c = '#6aa84a'
            sc.px(xx, yy, c)
    sc.rect(x + w // 2, y, 1, h, frame); sc.rect(x, y + h // 2, w, 1, frame); sc.rect(x - 2, y + h + 2, w + 4, 2, fd)
WD = ('#7a4e2a', '#b8844c', '#c8945a', '#e0b07a')
DIRT = {'jam': '#c8283a', 'soup': '#d8a030', 'cof': '#6a3a1a', 'cream': '#f8f0d0', 'herb': '#4a8a3a', 'burnt': '#3a2214'}
def mixed_stack(sc, x, y, seed=1):
    random.seed(seed)
    items = [(plate(18, dirt=[(-4, -2, 3, DIRT['jam']), (5, 2, 2, DIRT['cream'])]), 3, 0),
             (plate(17, col=('#3a7ac8', '#6aa0e8', '#a8c8f8', '#2a5a9a'), dirt=[(2, 0, 5, DIRT['soup'])]), 3, 1),
             (plate(16, rimc='#c8a040'), 3, -1),
             (bowl(12, dirt=[(0, 0, 4, DIRT['soup'])], depth=8), 9, 1),
             (cup(band_='#d84a4a', h=11, rx=6), 0, -1)]
    return stack(sc, items, x, y)
# ---------------- option 1: farmhouse sink under the window ----------------
def opt1():
    sc = Scene(); tiles(sc, 0, 64, '#f4f0e8', '#ece6da', '#c8c0b0')
    window(sc, 66, 6, 48, 34)
    sc.rect(0, 40, 180, 3, '#c8945a'); sc.rect(0, 43, 180, 1, '#7a4e2a')   # shelf
    for i, (xx, c) in enumerate(((8, '#c83a2a'), (16, '#e8a03a'), (26, '#4a8a3a'), (148, '#3a7ac8'), (158, '#f4ead8'), (168, '#c83a2a'))): sc.rect(xx, 32, 6, 8, K); sc.rect(xx + 1, 33, 4, 7, c)
    counter_top(sc, 64, 102, ('#7a4e2a', '#c8945a', '#d8a868', '#5a3a22')); cabinets(sc, 106, ('#5a3a22', '#8a5e3a', '#a87448', '#c8945a'))
    basin(sc, 58, 68, 66, 30, ('#a8a49c', '#f4f0e8', '#ffffff'), ('#d8d4cc', '#c4c0b8', '#e8e4dc'), ('#7ab8e0', '#8ac8ec', '#c8ecfc'), foam=True)
    faucet(sc, 120, 66)
    # a 2.5d pile on a wooden board at the left
    sc.rect(4, 94, 46, 6, K); sc.rect(5, 94, 44, 4, '#d8a868'); sc.rect(5, 98, 44, 1, '#8a5e3a')
    mixed_stack(sc, 27, 98)
    sc.spr(glass(), 42, 74); sc.spr(spoon(), 34, 90)
    # wooden plate rack at the right, plates standing upright
    sc.rect(132, 70, 44, 26, None) if False else None
    for k in range(5):
        p_ = S(8, 26)
        ell(p_, 4, 13, 3.2, 12, lambda dx, dy, d: '#c8ccd4' if d > .75 else ('#ffffff' if dy < -.2 else '#e8ecf0'))
        p_.outline(K); sc.spr(p_, 135 + k * 7, 66)
    sc.rect(132, 90, 44, 4, K); sc.rect(133, 90, 42, 3, '#c8945a'); sc.rect(133, 82, 42, 1, '#8a5e3a')
    sc.spr(cup(band_='#3a7ac8', dirt=None), 160, 56)
    return sc
# ---------------- option 2: double sink, wash left, rinse right, blue tiles ----------------
def opt2():
    sc = Scene(); tiles(sc, 0, 62, '#7ab0d8', '#8ac0e4', '#f4f8fc', 8, 8)
    counter_top(sc, 62, 104, ('#5a6470', '#c8ccd4', '#d8dce4', '#3a424c')); cabinets(sc, 108, ('#2a4a6a', '#4a7aa8', '#5a8ab8', '#7aa8d4'), 3)
    basin(sc, 46, 68, 48, 30, ('#5a6470', '#a8b4c0', '#e0e8f0'), ('#8a96a2', '#7a8692', '#a8b4c0'), ('#7ab8e0', '#8ac8ec', '#c8ecfc'), foam=True)
    basin(sc, 102, 68, 40, 30, ('#5a6470', '#a8b4c0', '#e0e8f0'), ('#8a96a2', '#7a8692', '#a8b4c0'), ('#5aa0d8', '#6ab0e4', '#c8ecfc'))
    faucet(sc, 97, 66)
    # pile on the left: pans and pots below, plates and a cup on top
    items = [(pan(15, 9), 4, 2), (pot(12, 9), 11, 0), (plate(16, dirt=[(-3, 0, 4, DIRT['herb'])]), 3, 0), (plate(15, col=('#e8c84a', '#f8e070', '#fff4b0', '#c8a030')), 3, 1), (bowl(11, col=('#4a9a5a', '#6ab87a', '#9ad8a8', '#2e6a3a'), depth=8), 9, 0), (cup(h=11, rx=6), 0, 0)]
    stack(sc, items, 22, 100)
    # drying: a towel on the counter right with clean pieces lying on it
    sc.rect(146, 74, 30, 24, K); sc.rect(147, 75, 28, 22, '#ffffff')
    for yy in range(75, 97, 4): sc.rect(147, yy, 28, 1, '#e84a4a')
    sc.spr(plate(10), 148, 80); sc.spr(glass(10, 3), 166, 74); sc.spr(spoon(10), 150, 90)
    # a sponge and a brush
    sc.rect(36, 64, 8, 4, K); sc.rect(37, 64, 6, 2, '#f8d84a'); sc.rect(37, 66, 6, 1, '#4a9a3a')
    return sc
# ---------------- option 3: close up, pile tower and a drainer, warm evening light ----------------
def opt3():
    sc = Scene(); 
    for y in range(0, 58):
        for x in range(180): sc.px(x, y, '#e8c898' if hx(x // 4, y // 4, 6) < .5 else '#e0be8c')
    window(sc, 40, 4, 90, 40, '#c8945a', '#8a5e3a')
    for x in range(40, 130):     # evening sky in the window
        for y in range(4, 22): sc.px(x, y, '#f4a878' if y < 12 else '#f8d0a0')
    sc.rect(84, 4, 2, 40, '#c8945a')
    counter_top(sc, 58, 100, ('#4a3020', '#8a5e3a', '#9a6a44', '#3a2414')); cabinets(sc, 104, ('#3a2414', '#6a4428', '#7a5232', '#9a6a44'), 4)
    basin(sc, 60, 64, 58, 32, ('#8a7a6a', '#d8c8b0', '#f4e8d0'), ('#b8a890', '#a89880', '#c8b8a0'), ('#7ab8e0', '#8ac8ec', '#c8ecfc'), foam=True)
    faucet(sc, 112, 62, ('#6a4a1a', '#c8a040', '#f0d070'))
    # a tall wobbly tower, a little skewed
    items = [(plate(19, dirt=[(4, 1, 4, DIRT['jam'])]), 3, 0), (plate(19), 3, 1), (plate(18, col=('#d86a4a', '#f08a6a', '#ffb090', '#a84a34')), 3, 2), (plate(17, dirt=[(-3, 0, 5, DIRT['soup'])]), 3, 3),
             (bowl(13, col=('#e8ecf0', '#ffffff', '#ffffff', '#a8b0bc'), dirt=[(0, 0, 5, DIRT['cream'])], depth=8), 9, 4), (bowl(10, col=('#3a7ac8', '#6aa0e8', '#a8c8f8', '#2a5a9a'), depth=7), 8, 5), (cup(band_='#e8a03a', h=11, rx=6), 0, 6)]
    stack(sc, items, 28, 98)
    sc.spr(glass(15, 5), 48, 76); sc.spr(glass(12, 4), 40, 84)
    # a wire drainer at the right
    for k in range(6):
        x = 132 + k * 7; sc.rect(x, 64, 1, 30, '#a8b0bc'); sc.rect(x + 1, 64, 1, 30, '#5a6470')
    sc.rect(128, 92, 48, 4, K); sc.rect(129, 92, 46, 3, '#c8ccd4')
    sc.spr(cup(band_='#4a9a5a', dirt=None), 150, 54)
    # a candle glow on the sill
    sc.rect(126, 40, 4, 6, K); sc.rect(127, 40, 2, 5, '#fff4d0'); sc.px(128, 38, '#ffd34a'); sc.px(128, 37, '#ff9a30')
    return sc
# ---------------- option 4: outside: a zinc tub on the terrace, garden behind ----------------
def opt4():
    sc = Scene()
    for y in range(0, 40):
        for x in range(180): sc.px(x, y, '#8fd0f4' if y < 24 else '#c8ecfc')
    for x in range(180):
        top = 28 + round(math.sin(x / 9) * 3 + math.sin(x / 4) * 1)
        for y in range(top, 52): sc.px(x, y, '#5aa04e' if y == top else ('#4a8a3e' if hx(x // 2, y // 2, 2) < .6 else '#3a7030'))
    for y in range(52, 64):
        for x in range(180): sc.px(x, y, '#6ab84a' if hx(x // 2, y, 3) < .5 else '#5aa046')
    wood(sc, 0, 64, 180, 71, ('#7a4e2a', '#b8844c', '#c8945a'), 6, True)
    # the zinc tub on a crate, foam on the water
    sc.rect(58, 96, 64, 20, K); sc.rect(59, 96, 62, 18, '#a87448'); sc.rect(59, 104, 62, 1, '#7a4e2a')
    t = S(70, 40)
    for y in range(12, 36):
        for x in range(3, 67):
            u = (x + .5 - 35) / 32
            if abs(u) > 1 or y > 24 + 11 * math.sqrt(max(0, 1 - u * u)): continue
            t.put(x, y, '#f0f4f8' if -.8 < u < -.55 else '#c8d0d8' if u < .2 else '#a8b4c0' if u < .7 else '#8a96a2')
            if (y - 12) % 8 == 4: t.put(x, y, '#8a96a2')
    ell(t, 35, 12, 32, 10, lambda dx, dy, d: ('#f0f4f8' if dy < 0 else '#a8b4c0') if d > .8 else ('#6ab0e4' if hx(int((dx + 1) * 9), int((dy + 1) * 4), 3) < .7 else '#8ac8ec'))
    for (bx, by, r) in ((22, 10, 3), (27, 12, 2.4), (40, 9, 2.8), (46, 13, 2), (33, 15, 2.2), (18, 14, 1.6), (50, 10, 1.8)):
        ell(t, bx, by, r, r * .8, lambda dx, dy, d: '#ffffff' if dx + dy < -.3 else '#e4eef8')
    t.outline(K); sc.spr(t, 55, 60)
    # a pump at the back
    sc.rect(128, 40, 6, 28, K); sc.rect(129, 41, 4, 26, '#3a7a5a'); sc.rect(126, 42, 14, 3, K); sc.rect(127, 43, 12, 1, '#3a7a5a'); sc.rect(136, 34, 2, 10, '#3a7a5a')
    # dishes in a wicker basket on the left, 2.5d pile
    sc.rect(4, 100, 46, 14, K); sc.rect(5, 101, 44, 12, '#c8945a')
    for x in range(5, 49, 3): sc.rect(x, 101, 1, 12, '#a87448')
    items = [(plate(18, dirt=[(0, 0, 5, DIRT['herb'])]), 3, 0), (pan(13, 9), 5, 3), (bowl(12, col=('#c8a040', '#e8c860', '#f8e090', '#9a7a2a'), depth=8), 9, 0), (plate(14, col=('#3a7ac8', '#6aa0e8', '#a8c8f8', '#2a5a9a')), 3, 0), (cup(band_='#c83a2a', h=11, rx=6), 0, 0)]
    stack(sc, items, 27, 102)
    # drying on a bench at the right with a towel over it, a line with a cloth
    sc.rect(132, 92, 46, 5, K); sc.rect(133, 92, 44, 3, '#d8a868'); sc.rect(136, 97, 3, 14, K); sc.rect(170, 97, 3, 14, K)
    sc.spr(plate(10), 136, 84); sc.spr(cup(dirt=None), 158, 80); sc.spr(glass(), 166, 80)
    for x in range(0, 180): sc.px(x, 30 + round((x - 90) ** 2 / 900), '#e8e0d0')
    sc.rect(40, 31, 12, 10, K); sc.rect(41, 31, 10, 9, '#e84a4a'); sc.rect(41, 34, 10, 1, '#ffffff')
    return sc
for i, f in enumerate((opt1, opt2, opt3, opt4), 1):
    f().save('opt%d.png' % i)
from PIL import Image
ims = [Image.open('opt%d.png' % i) for i in range(1, 5)]
o = Image.new('RGB', (720 * 2 + 20, 540 * 2 + 20), 'white')
for i, im in enumerate(ims): o.paste(im, ((i % 2) * 740, (i // 2) * 560))
o.save('options.png')
