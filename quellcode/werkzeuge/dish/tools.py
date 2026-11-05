from dlib import *
import json
OUT = json.load(open('dwspr.json'))
def add(n, s): r, p = s.rows(); OUT[n] = {'r': r, 'p': p}
Y = ['#7a4a08', '#c87a10', '#e8a818', '#f8c828', '#ffe060', '#fff4b0']
def duck(sq=False):
    s = S(20, 16); by = 10 + (1 if sq else 0)
    ell(s, 9, by, 8, 4.6 - (1 if sq else 0), lambda dx, dy, d: Y[band(lit(dx, dy), (-.35, -.05, .3, .6))])        # body
    for k in range(4): s.put(1 + k * .5, by - 3 - k, Y[3])                                                          # tail up at the back
    ell(s, 13, by - 6 + (1 if sq else 0), 3.8, 3.6, lambda dx, dy, d: Y[band(lit(dx, dy), (-.35, -.05, .3, .6))])   # head
    hy = by - 6 + (1 if sq else 0)
    for (x, y, c) in ((17, hy + 1, '#e8650c'), (18, hy + 1, '#e8650c'), (17, hy + 2, '#c84a08'), (18, hy + 2, '#f08030'), (16, hy + 2, '#c84a08')): s.put(x, y, c)
    s.put(14, hy - 1, '#2a1a10'); s.put(15, hy - 1, '#2a1a10'); s.put(14, hy - 2, '#fff4b0')
    for k in range(5): s.put(6 + k, by - 1 + (1 if k in (0, 4) else 0), Y[1])                                      # wing line
    s.put(4, by - 2, Y[5]); s.put(5, by - 3, Y[5])
    s.outline('#5a3a08'); return s
add('duck', duck()); add('duck_sq', duck(True))
def sponge():
    s = S(20, 14)
    for y in range(14):
        for x in range(20):
            if 2 <= x <= 17 and 1 <= y <= 8:                    # yellow foam block, top face lighter
                c = '#fff1a8' if y <= 2 else '#ffd34a' if x < 14 else '#e8b030'
                if hx(x, y, 4) < .14 and y > 2: c = '#d89a20'
                s.put(x, y, c)
            if 2 <= x <= 17 and 9 <= y <= 11: s.put(x, y, '#6fc05a' if x < 14 else '#4e9a3a')   # green scouring layer
    s.put(4, 2, '#ffffff'); s.put(5, 2, '#ffffff'); s.put(4, 3, '#fffbe0')
    s.outline(K); return s
add('t_sponge', sponge())
def brush():
    s = S(14, 32)
    for y in range(0, 18): s.put(6, y, '#c8945a'); s.put(7, y, '#8a5a32')                  # wooden handle
    s.put(6, 0, '#e0b07a'); s.put(7, 0, '#c8945a')
    for y in range(1, 4): s.put(6, y + 1, '#3a2414') if y == 2 else None                  # hanging hole
    for y in range(18, 21): s.put(6, y, '#a8b0bc'); s.put(7, y, '#7a8692')                # metal ferrule
    for y in range(21, 31):                                                             # bristles: spiky tufts round the wire, light on the left
        w = 5 if y % 2 else 4
        if y in (21, 30): w = 3
        for x in range(int(7 - w), int(7 + w)):
            u = (x + .5 - 7) / w
            s.put(x, y, '#ffffff' if u < -.4 else '#f0ead8' if u < .3 else '#d0c4ac')
        s.put(6, y, '#a8b0bc') if y % 3 == 0 else None
    s.outline(K); return s
add('t_brush', brush())
def towel():
    W, H = 36, 24; s = S(W, H)
    for y in range(H):
        for x in range(W):
            if x < 1 or x > W - 2: continue
            top = 1 + round(math.sin(x / 5) * .8)
            if y < top or y > H - 4: continue
            c = '#f8f2e6' if (x + y) % 2 else '#fffaf0'                               # terry cloth texture
            if y > H - 9: c = '#e8dccc' if (x + y) % 2 else '#f0e6d6'                # the folded-under part, a shade darker
            if 5 <= y - top <= 8: c = '#e8554a' if (x + y) % 2 else '#f06a5a'          # red stripes
            if 10 <= y - top <= 11: c = '#5a8ad8' if (x + y) % 2 else '#6a9ae8'
            if x > W - 6: c = {'#f8f2e6': '#e8dccc', '#fffaf0': '#f0e6d6'}.get(c, c)  # shade on the right
            s.put(x, y, c)
    for x in range(1, W - 1, 2): s.put(x, H - 3, '#e8dccc'); s.put(x, H - 2, '#d8ccb8')   # fringe
    for x in range(1, W - 1): s.put(x, H - 9, '#d8ccb8')                              # the fold line
    s.outline(K); return s
add('t_towel', towel())
json.dump(OUT, open('dwspr.json', 'w'))
sc = Scene(110, 40)
for y in range(40):
    for x in range(110): sc.px(x, y, '#9ac6e2')
for n, x, y in (('duck', 2, 2), ('duck_sq', 2, 22), ('t_sponge', 26, 4), ('t_brush', 50, 4), ('t_towel', 70, 8)):
    d = OUT[n]; sp = S(len(d['r'][0]), len(d['r']))
    for yy, r in enumerate(d['r']):
        for xx, ch in enumerate(r):
            if ch in d['p']: sp.g[yy][xx] = d['p'][ch]
    sc.spr(sp, x, y)
sc.save('tools_prev.png', 8)
