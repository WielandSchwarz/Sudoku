from dlib import *
import random
def sea_window(sc, x0, y0, w, h, fog=False):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            t = (y - y0) / h
            if t < .55:
                c = '#9fd4f0' if t < .3 else '#c4e6f6'
            else:
                u = (t - .55) / .45
                c = '#3a7ab0' if hx(x // (2 + int(u * 4)), y, 3) < .55 else '#4a8ac0'
                if hx(x // 3, y, 7) < .06 * (1 + u): c = '#d8eef8'
            if fog: c = {'#9fd4f0': '#d8e4ea', '#c4e6f6': '#e0e8ec', '#3a7ab0': '#8aa4b8', '#4a8ac0': '#9ab4c4', '#d8eef8': '#e4eef4'}.get(c, c)
            sc.px(x, y, c)
def bridge(fog=False):
    sc = Scene()
    # wheelhouse: wood walls, three big windows with brass frames
    for y in range(0, 135):
        for x in range(180):
            sc.px(x, y, '#8a5a34' if (x // 6) % 2 else '#7a4e2a')
    sc.rect(0, 0, 180, 4, '#5a3a22')
    for i in range(3):
        x0 = 8 + i * 56
        sc.rect(x0 - 3, 7, 52, 52, K); sc.rect(x0 - 2, 8, 50, 50, '#c8a040'); sc.rect(x0 - 2, 8, 50, 1, '#f0d070')
        sea_window(sc, x0, 10, 46, 46, fog)
    # horizon content: the bow with the mast, an iceberg far right, a gull
    for k in range(40):
        y = 56 - k * .35
        sc.rect(90 - (40 - k) // 2 + 0, int(y), (40 - k), 1, '#2a2a30') if k % 1 == 0 else None
    sc.rect(88, 18, 2, 30, '#3a2414'); sc.rect(80, 24, 18, 1, '#3a2414')
    for k in range(10): sc.px(89 + k, 18 + k * .8, '#e8e0d0')   # stay
    if not fog:
        ice = S(16, 10)
        ell(ice, 8, 9, 8, 7, lambda dx, dy, d: '#ffffff' if dx < -.1 else '#cfe6f2' if dx < .4 else '#a8c8dc')
        ice.outline('#4a6a80'); sc.spr(ice, 140, 24)
        sc.px(40, 20, '#3a2414'); sc.px(39, 19, '#3a2414'); sc.px(41, 19, '#3a2414')
    else:
        sc.px(150, 30, '#ffd34a'); sc.px(151, 30, '#ffd34a')   # a lamp in the fog
    # dashboard
    sc.rect(0, 62, 180, 6, K); sc.rect(0, 62, 180, 4, '#c8945a'); sc.rect(0, 62, 180, 1, '#e0b07a')
    for y in range(68, 135):
        for x in range(180): sc.px(x, y, '#6a4428' if (y // 7) % 2 else '#5a3a22')
    # the ship's wheel in the middle
    w = S(52, 52); cx = cy = 26
    for a in range(8):
        ang = a * math.pi / 4
        for r10 in range(0, 250):
            r = r10 / 10
            w.put(cx + math.cos(ang) * r, cy + math.sin(ang) * r, '#c8945a' if r < 17 else '#e0b07a')
        w.put(cx + math.cos(ang) * 24, cy + math.sin(ang) * 24, '#a87448'); w.put(cx + math.cos(ang) * 25, cy + math.sin(ang) * 25, '#c8945a')
    ell(w, cx, cy, 18, 18, lambda dx, dy, d: '#8a5a32' if d > .8 else None)
    ell(w, cx, cy, 16.4, 16.4, lambda dx, dy, d: None)
    for y in range(52):
        for x in range(52):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if 15.5 < d < 18.5: w.put(x, y, '#a87448' if (x + y) % 5 else '#8a5a32')
            if d < 4.5: w.put(x, y, '#f0d070' if x + y < 52 else '#c8a040')
    w.outline(K); sc.spr(w, 64, 62)
    # engine order telegraph on the left: brass column with a round dial
    sc.rect(22, 92, 8, 40, K); sc.rect(23, 92, 6, 40, '#c8a040'); sc.rect(23, 92, 2, 40, '#f0d070')
    t = S(30, 30)
    ell(t, 15, 15, 14, 14, lambda dx, dy, d: '#c8a040' if d > .78 else '#f8f4ec')
    for a, c in ((-150, '#c83a2a'), (-110, '#e8a03a'), (-70, '#6fae5a'), (-30, '#6fae5a')):
        r_ = math.radians(a); t.put(15 + math.cos(r_) * 9, 15 + math.sin(r_) * 9, c); t.put(15 + math.cos(r_) * 10, 15 + math.sin(r_) * 10, c)
    for k in range(10): t.put(15 + math.cos(math.radians(-60)) * k, 15 + math.sin(math.radians(-60)) * k, '#3a2414')
    t.outline(K); sc.spr(t, 11, 70)
    # compass binnacle right of the wheel
    sc.rect(126, 96, 14, 36, K); sc.rect(127, 96, 12, 36, '#3a5a8a')
    b = S(22, 14); ell(b, 11, 7, 10, 6, lambda dx, dy, d: '#c8a040' if d > .7 else '#f8f4ec'); b.put(11, 3, '#c83a2a'); b.put(11, 4, '#c83a2a'); b.outline(K); sc.spr(b, 122, 84)
    # the whistle cord on the right with a wooden handle, and the speaking tube to the stokehold
    sc.rect(160, 4, 1, 70, '#e8d8b0'); sc.rect(158, 74, 5, 8, K); sc.rect(159, 74, 3, 7, '#c8945a')
    sc.rect(148, 70, 6, 50, K); sc.rect(149, 70, 4, 50, '#c8a040'); sc.rect(146, 66, 10, 6, K); sc.rect(147, 67, 8, 4, '#f0d070')
    # a captain's cap on a peg (the hamster stands at the wheel in the game)
    sc.rect(170, 40, 8, 3, K); sc.rect(171, 38, 6, 3, '#1e2a4a'); sc.rect(170, 41, 8, 1, '#f0d070')
    return sc
def card(title, sub, lines, w=170, h=60):
    pass
a = bridge(False); b = bridge(True)
a.save('bridge_a.png'); b.save('bridge_b.png')
