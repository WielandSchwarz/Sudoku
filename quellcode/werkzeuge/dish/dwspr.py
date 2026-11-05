from dlib import *
import json
OUT = {}
def add(n, s): r, p = s.rows(); OUT[n] = {'r': r, 'p': p}
W3 = ('#d8d0c4', '#f8f4ec', '#ffffff', '#b8b0a4')
add('plate', plate(14, col=W3, rimc='#6a9ad8', dirt=[(-4, -1, 3, '#c8283a'), (4, 2, 2, '#f8f0d0'), (1, -3, 1.5, '#c8945a')]))
add('plate2', plate(14, col=W3, rimc='#e8650c', dirt=[(-2, 0, 5, '#d8a030'), (6, 3, 2, '#d8a030')]))
add('cup', cup(col=('#f8f4ec', '#ffffff', '#d8d0c4', '#b8b0a4'), band_='#e8650c', h=9, rx=5))
def fork25():
    s = S(24, 6)
    for k in range(13): s.put(2 + k, 3, '#c8d0d8'); s.put(2 + k, 4, '#8a929c')
    for k in range(4): s.put(15 + k, 2, '#eef2f6'); s.put(15 + k, 3, '#c8d0d8'); s.put(15 + k, 4, '#c8d0d8')
    for t in range(4): s.put(19 + (1 if t % 2 else 0) + 1, 1 + t, '#eef2f6' if t < 2 else '#c8d0d8')
    for t in (1, 3): s.put(20, t + 1, None)
    s.put(2, 3, '#eef2f6'); s.outline(K); return s
add('fork', fork25())
def teapot(clean=False):
    s = S(26, 20); cx, cy = 13, 12
    ell(s, cx, cy, 8, 7, lambda dx, dy, d: '#ffffff' if (dx + dy < -.6 and d > .3) else '#f8f4ec' if dx < .45 else '#d8d0c4')
    for x in range(int(cx - 8), int(cx + 9)):
        if s.get(x, cy) : s.put(x, cy, '#6fae5a')
    for k in range(6): s.put(cx - 9 - k, cy - 1 - k * .7, '#f8f4ec'); s.put(cx - 9 - k, cy - k * .7, '#d8d0c4')
    for k in range(-2, 3): s.put(cx + 9 + (1 if abs(k) < 2 else 0), cy + k - 1, '#d8d0c4')
    s.put(cx + 9, cy - 4, '#d8d0c4'); s.put(cx + 9, cy + 2, '#d8d0c4')
    ell(s, cx, cy - 6, 4, 1.8, lambda dx, dy, d: '#ffffff' if dy < 0 else '#e8e0d4')
    s.put(cx, cy - 8, '#f8f4ec'); s.put(cx, cy - 9, '#f8f4ec')
    s.outline(K); return s
add('pot', teapot()); add('pot_c', teapot(True))
def plate_up(rim):
    s = S(8, 26)
    ell(s, 4, 13, 3.2, 12, lambda dx, dy, d: '#d8d0c4' if d > .78 else (rim if d > .6 else ('#ffffff' if dy < -.2 else '#f8f4ec')))
    s.outline(K); return s
add('plate_up', plate_up('#6a9ad8')); add('plate2_up', plate_up('#e8650c'))
add('cup_c', cup(col=('#f8f4ec', '#ffffff', '#d8d0c4', '#b8b0a4'), band_='#e8650c', h=9, rx=5, dirt=None))
def bottle():
    s = S(12, 28)
    for y in range(8, 28):
        w = 5 if y > 11 else 3 + (y - 8) * .6
        if y > 25: w -= (y - 25) * .6
        for x in range(12):
            u = (x + .5 - 6) / w
            if abs(u) <= 1: s.put(x, y, '#a8e890' if u < -.5 else '#5ab04a' if u < .45 else '#3e8a3a')
    for y in range(14, 22):
        for x in range(3, 9): s.put(x, y, '#fff8ec' if y > 14 else '#ffffff')
    for x in (4, 5, 6): s.put(x, 17, '#e8650c')
    for x in (4, 5): s.put(x, 19, '#e8650c')
    for y in range(3, 8):
        for x in range(4, 8): s.put(x, y, '#f4f0e6' if x > 4 else '#ffffff')
    for y in range(0, 3): s.put(6, y, '#e8650c')
    s.outline(K); return s
add('bottle', bottle())
json.dump(OUT, open('dwspr.json', 'w'))
# preview: the stack and rack together
sc = Scene()
for y in range(135):
    for x in range(180): sc.px(x, y, '#e0b07a')
items = [(S_, l, d) for S_, l, d in []]
for n, x, y in (('plate', 4, 80), ('plate2', 4, 70), ('cup', 40, 70), ('fork', 40, 90), ('pot', 70, 70), ('pot_c', 100, 70), ('plate_up', 130, 60), ('plate2_up', 140, 60), ('cup_c', 150, 60), ('bottle', 165, 60)):
    d = OUT[n]; sp = S(len(d['r'][0]), len(d['r']))
    for yy, r in enumerate(d['r']):
        for xx, ch in enumerate(r):
            if ch in d['p']: sp.g[yy][xx] = d['p'][ch]
    sc.spr(sp, x, y)
sc.save('dwspr_prev.png')
# ---------- more variety ----------
BL = ('#2a5a9a', '#3a7ac8', '#6aa0e8', '#a8c8f8')
add('bowl', bowl(10, col=(BL[1], BL[2], BL[3], BL[0]), dirt=[(-2, 0, 3, '#f8f0d0'), (2, 1, 1.5, '#e8b84a'), (-3, 1, 1.2, '#e8b84a')], depth=6))
add('glass', glass(13, 4))
def glass_dirty():
    s = glass(13, 4)
    for y in range(8, 14):
        for x in range(2, 9):
            if s.g[y][x] and s.g[y][x] != '#4a6a80': s.g[y][x] = '#f8b048' if x < 5 else '#e8963a'
    return s
OUT.pop('glass'); add('glass', glass_dirty()); add('glass_c', glass(13, 4))
add('pan', pan(12, 10)); add('pan_c', pan(12, 10))
def spoon25(up=False):
    if not up:
        s = S(22, 8)
        for k in range(12): s.put(2 + k, 4, '#c8d0d8'); s.put(2 + k, 5, '#8a929c')
        ell(s, 17, 4.5, 3.5, 2.4, lambda dx, dy, d: '#ffffff' if dx + dy < -.4 else '#c8d0d8')
        ell(s, 17, 4.5, 1.6, 1, lambda dx, dy, d: '#c8283a')
        s.outline(K); return s
    s = S(7, 20)
    for k in range(13): s.put(3, 7 + k, '#c8d0d8'); s.put(4, 7 + k, '#8a929c')
    ell(s, 3.5, 4, 2.6, 3.4, lambda dx, dy, d: '#ffffff' if dx < -.2 else '#c8d0d8')
    s.outline(K); return s
add('spoon', spoon25()); add('spoon_up', spoon25(True))
def fork_up():
    s = S(7, 20)
    for k in range(12): s.put(3, 8 + k, '#c8d0d8'); s.put(4, 8 + k, '#8a929c')
    for y in range(4, 8):
        for x in range(1, 6): s.put(x, y, '#eef2f6' if x < 3 else '#c8d0d8')
    for x in (1, 3, 5):
        for y in range(0, 4): s.put(x, y, '#eef2f6')
    s.outline(K); return s
add('fork_up', fork_up())
GR = ('#3e8a3a', '#6fae5a', '#a8d890', '#2e6a2a')
add('mug', cup(col=(GR[1], GR[2], GR[0], GR[3]), band_='#f8f4ec', h=11, rx=6, dirt='#5a3418'))
add('mug_c', cup(col=(GR[1], GR[2], GR[0], GR[3]), band_='#f8f4ec', h=11, rx=6, dirt=None))
def bowl_up():
    s = S(12, 24)
    ell(s, 6, 12, 5, 11, lambda dx, dy, d: BL[0] if d > .82 else (BL[2] if dx < -.3 else BL[1]))
    ell(s, 7, 12, 3, 8.5, lambda dx, dy, d: '#f8f4ec' if dx < .2 else '#e4dcd0')
    s.outline(K); return s
add('bowl_up', bowl_up())
# ---------- the rack in 2.5d: posts, an upper shelf, a tray with a lip, dowels with round tops, a cutlery pot ----------
def rack_bg():
    W, Hh = 47, 62; s = S(W, Hh); ox, oy = 133, 34
    Wd = ['#3a2414', '#7a4e2a', '#a87448', '#c8945a', '#e0b07a', '#f0c890']
    def box(x0, y0, w, top, front, dep=0):
        for y in range(y0, y0 + top):
            for x in range(x0, x0 + w): s.put(x - ox, y - oy, Wd[4] if y == y0 else Wd[3])
        for y in range(y0 + top, y0 + top + front):
            for x in range(x0, x0 + w): s.put(x - ox, y - oy, Wd[2] if y < y0 + top + front - 1 else Wd[1])
    for px in (135, 175):                        # back posts
        for y in range(36, 88): s.put(px - ox, y - oy, Wd[2]); s.put(px + 1 - ox, y - oy, Wd[3]); s.put(px + 2 - ox, y - oy, Wd[1])
    box(135, 54, 43, 5, 3)                       # upper shelf for cups and glasses: top face and front edge
    box(134, 82, 45, 6, 5)                       # the tray at the bottom
    for x in (137, 146, 155, 164):               # dowels between the plate slots, round tops
        for y in range(66, 84): s.put(x - ox, y - oy, Wd[4]); s.put(x + 1 - ox, y - oy, Wd[2])
        s.put(x - ox, 65 - oy, Wd[5]); s.put(x + 1 - ox, 65 - oy, Wd[4])
    s.outline(Wd[0]); return s
def rack_cutlery():                              # the cutlery pot on the shelf (drawn in front of what stands in it)
    s = S(13, 12)
    for y in range(3, 12):
        for x in range(1, 12):
            u = (x + .5 - 6.5) / 5.5
            if abs(u) <= 1: s.put(x, y, '#e0e8f0' if u < -.5 else '#a8b4c0' if u < .4 else '#7a8692')
    ell(s, 6.5, 3, 5.5, 2, lambda dx, dy, d: '#5a6470' if d < .6 else '#c8d0d8')
    s.outline(K); return s
add('rack_bg', rack_bg()); add('rack_cut', rack_cutlery())
json.dump(OUT, open('dwspr.json', 'w'))
# ---------- smaller versions for the rack ----------
add('cup_r', cup(col=('#f8f4ec', '#ffffff', '#d8d0c4', '#b8b0a4'), band_='#e8650c', h=8, rx=4, dirt=None))
add('mug_r', cup(col=(GR[1], GR[2], GR[0], GR[3]), band_='#f8f4ec', h=9, rx=4.5, dirt=None))
add('glass_r', glass(10, 3))
def teapot_s():
    s = S(20, 15); cx, cy = 10, 9
    ell(s, cx, cy, 6, 5, lambda dx, dy, d: '#ffffff' if (dx + dy < -.6 and d > .3) else '#f8f4ec' if dx < .45 else '#d8d0c4')
    for x in range(cx - 6, cx + 7):
        if s.get(x, cy): s.put(x, cy, '#6fae5a')
    for k in range(4): s.put(cx - 7 - k, cy - 1 - k * .7, '#f8f4ec')
    for k in range(-2, 2): s.put(cx + 7, cy + k, '#d8d0c4')
    ell(s, cx, cy - 4.5, 3, 1.4, lambda dx, dy, d: '#ffffff')
    s.put(cx, cy - 6, '#f8f4ec')
    s.outline(K); return s
add('pot_r', teapot_s())
def pan_hang():
    s = S(16, 32)
    for k in range(11): s.put(7, k + 1, '#8a5a32'); s.put(8, k + 1, '#5a3a22')
    s.put(7, 0, '#2a2a30'); s.put(8, 0, '#2a2a30')
    ell(s, 7.5, 21, 7, 9.5, lambda dx, dy, d: '#2a2a30' if d > .85 else ('#6a6a76' if dx < -.3 else '#5a5a64' if dx < .3 else '#46464e'))
    ell(s, 8, 21.5, 4.5, 6.5, lambda dx, dy, d: '#46464e' if dx > -.2 else '#5a5a64')
    s.outline(K); return s
add('pan_r', pan_hang())
json.dump(OUT, open('dwspr.json', 'w'))
