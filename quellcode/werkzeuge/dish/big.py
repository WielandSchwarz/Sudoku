from scenes import *
import json, base64, io
WB = json.load(open('../ham2/wbhalf.json'))
def garden_img(se='summer'):
    g = Image.new('RGBA', (120, 68), (143, 208, 244, 255))
    for y in range(68):
        for x in range(120):
            t = y / 30
            if y < 30: g.putpixel((x, y), (int(143 + (200 - 143) * t), int(208 + (236 - 208) * t), int(244 + (252 - 244) * t), 255))
    for k in ['far', 't0', 't1', 't2', 't3', 'rest', 'fg']:
        im = Image.open(io.BytesIO(base64.b64decode(WB[k + '_' + se].split(',')[1]))).convert('RGBA'); g.alpha_composite(im)
    return g
def garden_window(sc, x, y, w, h, frame, fd, se='summer', ox=20, oy=6, mull=True):
    g = garden_img(se)
    sc.rect(x - 3, y - 3, w + 6, h + 6, K); sc.rect(x - 2, y - 2, w + 4, h + 4, frame)
    for yy in range(h):
        for xx in range(w):
            c = g.getpixel(((xx + ox) % 120, min(67, yy + oy))); sc.im.putpixel((x + xx, y + yy), c)
    if mull: sc.rect(x + w // 2 - 1, y, 2, h, frame); sc.rect(x, y + h // 2, w, 1, frame)
    sc.rect(x - 4, y + h + 2, w + 8, 3, fd); sc.rect(x - 4, y + h + 5, w + 8, 1, K)
def big_sink(sc, x0, y0, w, h, rim, inner, water):
    basin(sc, x0, y0, w, h, rim, inner, water, foam=False, depth=8)
    # the piece being washed, top view, big like in the game
    cx, cy = x0 + w / 2, y0 + h / 2 + 4; R = 26
    p = S(60, 60)
    ell(p, 30, 30, R + .5, R + .5, lambda dx, dy, d: '#a8b0bc' if d > .93 else '#ffffff' if (d > .6 and dx + dy < -.4) else '#e8ecf0' if d > .55 else '#dfe4ea' if d > .5 else '#f4f6f8')
    for (bx, by, r, c) in ((-8, -6, 6, '#c8283a'), (6, 4, 4, '#c8283a'), (10, -10, 2.4, '#f8f0d0'), (-4, 10, 3, '#d8a030')):
        ell(p, 30 + bx, 30 + by, r, r * .9, lambda dx, dy, d: c if hx(int(dx * 9), int(dy * 9), 1) < .9 else None)
    p.outline(K); sc.spr(p, int(cx - 30), int(cy - 30))
    random.seed(3)
    for k in range(9):
        bx, by, r = x0 + 6 + random.random() * (w - 12), y0 + h - 8 - random.random() * 8, 1.4 + random.random() * 2
        for yy in range(int(by - r - 1), int(by + r + 2)):
            for xx in range(int(bx - r - 1), int(bx + r + 2)):
                d = math.hypot(xx + .5 - bx, yy + .5 - by)
                if d <= r: sc.px(xx, yy, '#ffffff' if (xx - bx) + (yy - by) < -r * .3 else '#e4eef8')
                elif d <= r + .8: sc.px(xx, yy, '#b8d4ec')
def rack(sc, x, y):
    for k in range(4):
        p_ = S(8, 26); ell(p_, 4, 13, 3.2, 12, lambda dx, dy, d: '#c8ccd4' if d > .75 else ('#ffffff' if dy < -.2 else '#e8ecf0')); p_.outline(K); sc.spr(p_, x + 3 + k * 7, y)
    sc.rect(x, y + 24, 38, 4, K); sc.rect(x + 1, y + 24, 36, 3, '#c8945a'); sc.rect(x + 1, y + 16, 36, 1, '#8a5e3a')
    sc.spr(cup(band_='#3a7ac8', dirt=None), x + 30, y + 4)
def variantA(se):
    sc = Scene(); tiles(sc, 0, 40, '#f4f0e8', '#ece6da', '#c8c0b0')
    garden_window(sc, 50, 4, 80, 28, '#f4ead8', '#c8b490', se)
    sc.rect(10, 22, 6, 8, K); sc.rect(11, 23, 4, 7, '#c83a2a'); sc.rect(20, 24, 6, 6, K); sc.rect(21, 25, 4, 5, '#4a8a3a'); sc.rect(6, 30, 26, 2, '#c8945a')
    sc.rect(150, 18, 2, 14, K); sc.rect(146, 16, 10, 3, K); sc.rect(147, 16, 8, 2, '#4a8a3a')
    counter_top(sc, 40, 106, ('#7a4e2a', '#c8945a', '#d8a868', '#5a3a22')); cabinets(sc, 110, ('#5a3a22', '#8a5e3a', '#a87448', '#c8945a'))
    big_sink(sc, 44, 42, 92, 62, ('#a8a49c', '#f4f0e8', '#ffffff'), ('#d8d4cc', '#c4c0b8', '#e8e4dc'), ('#7ab8e0', '#8ac8ec', '#c8ecfc'))
    faucet(sc, 132, 46)
    sc.rect(2, 98, 40, 6, K); sc.rect(3, 98, 38, 4, '#d8a868')
    mixed_stack(sc, 22, 102)
    rack(sc, 139, 72)
    return sc
def variantB(se):
    sc = Scene()
    for y in range(0, 40):
        for x in range(180): sc.px(x, y, '#e8c898' if hx(x // 4, y // 4, 6) < .5 else '#e0be8c')
    garden_window(sc, 46, 3, 88, 30, '#c8945a', '#8a5e3a', se, 16, 4)
    sc.rect(40, 1, 6, 36, '#c83a3a'); sc.rect(134, 1, 6, 36, '#c83a3a')
    for yy in range(1, 37, 4): sc.rect(40, yy, 6, 1, '#f4ead8'); sc.rect(134, yy, 6, 1, '#f4ead8')
    counter_top(sc, 40, 106, ('#4a3020', '#8a5e3a', '#9a6a44', '#3a2414')); cabinets(sc, 110, ('#3a2414', '#6a4428', '#7a5232', '#9a6a44'))
    big_sink(sc, 44, 42, 92, 62, ('#5a6470', '#a8b4c0', '#e0e8f0'), ('#8a96a2', '#7a8692', '#a8b4c0'), ('#7ab8e0', '#8ac8ec', '#c8ecfc'))
    faucet(sc, 132, 46, ('#6a4a1a', '#c8a040', '#f0d070'))
    items = [(pan(15, 9), 4, 2), (plate(17, dirt=[(-3, 0, 4, DIRT['herb'])]), 3, 0), (plate(16, col=('#e8c84a', '#f8e070', '#fff4b0', '#c8a030')), 3, 1), (bowl(12, col=('#4a9a5a', '#6ab87a', '#9ad8a8', '#2e6a3a'), depth=8), 9, 0), (cup(h=11, rx=6), 0, 0)]
    stack(sc, items, 22, 102)
    for k in range(5):
        x = 142 + k * 7; sc.rect(x, 70, 1, 28, '#a8b0bc'); sc.rect(x + 1, 70, 1, 28, '#5a6470')
    sc.rect(138, 96, 40, 4, K); sc.rect(139, 96, 38, 3, '#c8ccd4'); sc.spr(glass(14, 5), 160, 76)
    return sc
a = variantA('summer'); b = variantB('autumn')
a.save('bigA.png'); b.save('bigB.png')
o = Image.new('RGB', (720 * 2 + 20, 540), 'white'); o.paste(Image.open('bigA.png'), (0, 0)); o.paste(Image.open('bigB.png'), (740, 0)); o.save('big_options.png')
