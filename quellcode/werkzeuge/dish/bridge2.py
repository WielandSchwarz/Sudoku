from dlib import *
from bridge import sea_window
def sea_persp(sc, hz=40, fog=0.0):
    for y in range(135):
        for x in range(180):
            if y < hz:
                t = y / hz; c = (int(150 + 60 * t), int(208 + 30 * t), int(240 + 10 * t))
            else:
                u = (y - hz) / (135 - hz); per = 1 + int(u * 7)
                c = (58, 122, 176) if hx(x // per, int((y - hz) ** 1.15) // max(1, per // 2), 3) < .55 else (74, 138, 192)
                if hx(x // (per + 1), y, 7) < .03 + .05 * u: c = (216, 238, 248)
            if fog: c = tuple(int(c[i] * (1 - fog) + (226, 232, 236)[i] * fog) for i in range(3))
            sc.im.putpixel((x, y), c + (255,))
def buoy(r, col):          # a channel buoy drawn at its distance size (no scaling)
    s = S(int(r * 2 + 4), int(r * 3.2 + 4)); cx = r + 2
    for y in range(int(r * 3.2)):
        w = r * (1 - (y / (r * 3.2)) ** 2 * .3) if y > r * .6 else r * .5
        for x in range(int(cx - w), int(cx + w) + 1):
            u = (x + .5 - cx) / max(w, .5); s.put(x, y + 2, ['#ffffff', col[0], col[1], col[2]][0 if u < -.6 and y > r else 1 if u < .2 else 2] if True else None)
    s.put(cx, 0, '#ffd34a'); s.put(cx, 1, '#3a2414')
    for x in range(int(cx - r), int(cx + r) + 1): s.put(x, int(r * 3.2) + 1, '#d8eef8')
    s.outline(K); return s
def iceberg(w, h):
    s = S(w + 2, h + 3)
    for y in range(h):
        for x in range(w):
            top = h * (.2 + .5 * abs(math.sin(x / w * 3.1 + .4)) * (1 - abs(x - w / 2) / w))
            if y >= h - top * 1.6 or (y > h * .3 and abs(x - w * .55) < w * .25):
                u = x / w; s.put(x + 1, y, '#ffffff' if u < .4 else '#d8ecf8' if u < .7 else '#a8c8dc')
    for x in range(w): s.put(x + 1, h, '#d8eef8')
    s.outline('#4a6a80'); return s
def steering():
    sc = Scene(); sea_persp(sc)
    # a red-green gate of buoys far, nearer gate, an iceberg on the right, a fishing boat far left
    sc.spr(buoy(1.5, ('#c83a2a', '#a82a1e', '#7a1a12')), 70, 40); sc.spr(buoy(1.5, ('#4a9a3a', '#3a7a2e', '#2a5a20')), 104, 40)
    sc.spr(buoy(3, ('#c83a2a', '#a82a1e', '#7a1a12')), 46, 52); sc.spr(buoy(3, ('#4a9a3a', '#3a7a2e', '#2a5a20')), 120, 52)
    sc.spr(iceberg(26, 14), 140, 30)
    b = S(12, 7)
    for x in range(1, 11): b.put(x, 4, '#8a5a32'); b.put(x, 5, '#6a4226')
    for y in range(0, 4): b.put(6, y, '#3a2414')
    b.put(7, 1, '#fff8ec'); b.put(8, 2, '#fff8ec'); b.put(7, 2, '#fff8ec'); b.outline(K); sc.spr(b, 18, 36)
    # the bow below, with a hint of the bow wave
    for y in range(96, 135):
        hw = (y - 96) * 1.1
        for x in range(int(90 - hw), int(90 + hw) + 1):
            u = (x - 90) / max(hw, 1)
            sc.px(x, y, '#e8e0d0' if abs(u) > .88 else '#a87448' if abs(u) > .8 else '#c8945a' if (x // 3) % 2 else '#b8844c')
        sc.px(90 - hw - 1, y, '#ffffff'); sc.px(90 + hw + 1, y, '#ffffff')
    sc.rect(89, 92, 2, 10, '#3a2414'); sc.px(90, 91, '#c83a2a')   # jack staff
    # compass tape at the top
    sc.rect(50, 2, 80, 9, K); sc.rect(51, 3, 78, 7, '#f8f4ec')
    for i, l in enumerate(['NW', '', 'N', '', 'NO', '']):
        x = 54 + i * 14; sc.rect(x, 3, 1, 3 if l else 2, '#3a2414')
    sc.rect(89, 3, 2, 7, '#c83a2a')
    return sc
def binoculars():
    sc = Scene(); sea_persp(sc, 70)
    # what you see through the glasses: a whale blowing far out, a ship with signal flags
    wh = S(34, 16)
    ell(wh, 17, 11, 15, 4, lambda dx, dy, d: '#3a4a5a' if dy < .2 else '#5a6a7a')
    for k in range(6): wh.put(30 + k * .6, 8 - k, '#3a4a5a')
    ell(wh, 13, 9, 1.5, 1, lambda dx, dy, d: '#2a3a4a')
    wh.outline(K)
    sp = S(16, 14)
    for k in range(10):
        a = -math.pi / 2 + (k - 4.5) * .22
        for r in range(4, 12): sp.put(8 + math.cos(a) * r * .9, 12 + math.sin(a) * r, '#ffffff' if r < 9 else '#d8eef8')
    sc.spr(wh, 70, 60); sc.spr(sp, 75, 50)
    for x in range(180):
        for y in range(135):
            l = math.hypot(x - 62, (y - 62) * 1.05); r = math.hypot(x - 118, (y - 62) * 1.05)
            if min(l, r) > 46: sc.px(x, y, '#141018')
            elif min(l, r) > 44: sc.px(x, y, '#3a3a44')
    return sc
def logbook():
    sc = Scene()
    for y in range(135):
        for x in range(180): sc.px(x, y, '#f4e6c8' if (x + y) % 7 else '#ecdcb8')
    sc.rect(88, 0, 4, 135, '#c8a87a'); sc.rect(90, 0, 1, 135, '#a8885a')
    items = [('#3a4a5a', 'whale'), ('#ffffff', 'ice'), ('#c83a2a', 'buoy'), ('#8a5a32', 'boat'), ('#f8f4ec', 'gull'), (None, '?'), (None, '?'), (None, '?')]
    for i, (c, n) in enumerate(items):
        x = 12 + (i % 2) * 36 + (i // 4) * 92; y = 14 + ((i // 2) % 2) * 50
        sc.rect(x, y, 30, 36, K); sc.rect(x + 1, y + 1, 28, 34, '#fffaf0' if c else '#e0d4bc')
        if c: sc.rect(x + 8, y + 10, 14, 10, c); sc.rect(x + 8, y + 20, 14, 1, '#3a2414')
        else: sc.rect(x + 13, y + 12, 4, 6, '#b8a888'); sc.rect(x + 14, y + 20, 2, 2, '#b8a888')
    return sc
for n, f in (('st', steering), ('bn', binoculars), ('lb', logbook)): f().save('cap2_%s.png' % n)
