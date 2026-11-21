import math, json
from base import *
K = '#3a2414'
def recol(g, m):
    for r in g.p:
        for i, c in enumerate(r):
            if c in m: r[i] = m[c]
    return g
def ell(g, cx, cy, rx, ry, c):
    for y in range(32):
        for x in range(32):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: g.p[y][x] = c
def shade(g, cx, cy, rx, ry, base, lo, hi):
    # recolour an ellipse region: lower-right rim darker, upper-left lighter
    for y in range(32):
        for x in range(32):
            u, v = (x + .5 - cx) / rx, (y + .5 - cy) / ry
            if u * u + v * v <= 1 and g.p[y][x] == base:
                if u * .4 + v * .9 > .62: g.p[y][x] = lo
                elif u * .5 + v * .8 < -.55: g.p[y][x] = hi
def plate(g, cy=25):
    ell(g, 16, cy, 15, 5, '#f8f2e6'); ell(g, 16, cy + 1, 11, 3, '#e8dcc8'); ell(g, 16, cy + .5, 10.5, 2.6, '#f0e6d6')
    for x in range(3, 30):
        if g.p[cy + 4][x]: g.p[cy + 4][x] = '#dccfb8'
def done(g): g.outline(K); return g
def new(): return G(32, 32)
OUT = {}

# 1 rolls
g = new()
for cx, cy in ((16, 12), (9, 19), (23, 19)):
    ell(g, cx, cy, 7.5, 6.5, '#e0a858'); shade(g, cx, cy, 7.5, 6.5, '#e0a858', '#b87a3a', '#f4cc84')
    for k in range(-3, 4): g.put(cx + k, cy - 1 + abs(k) // 3, '#a86a2e')
    for dx, dy in ((-3, -3), (2, -4), (4, 1), (-4, 2)): g.put(cx + dx, cy + dy, '#6fae4a')
    g.outline(K)
OUT['rolls'] = done(g)

# 2 nutroll: spiral buns on a plate
g = new(); plate(g, 25)
for cx, cy in ((11, 19), (21, 18)):
    ell(g, cx, cy, 7, 5.5, '#d8a050'); shade(g, cx, cy, 7, 5.5, '#d8a050', '#a86a2a', '#ecc078')
    for t in range(90, 640, 6):
        r = (t - 90) / 550 * 5.2; a = math.radians(t)
        g.put(round(cx - .5 + math.cos(a) * r * 1.1), round(cy - .5 + math.sin(a) * r * .75), '#a86a2a')
    for dx in (-3, 2): g.put(cx + dx, cy - 3, '#ffd870')
    g.put(cx - 2, cy - 3, '#6a3e1a'); g.put(cx + 3, cy - 2, '#6a3e1a')
    g.outline(K)
OUT['nutroll'] = done(g)

# 3 muffin
g = new()
g.poly([(7, 17), (25, 17), (22, 29), (10, 29)], '#f0d8b0')
for x in range(9, 25, 3): 
    for y in range(17, 29): 
        if g.p[y][x]: g.p[y][x] = '#d4b48a'
for y in range(17, 30):
    for x in range(32):
        if g.p[y][x] and x > 19: g.p[y][x] = '#dcc098' if g.p[y][x] == '#f0d8b0' else '#c0a070'
ell(g, 16, 14, 11, 7, '#e08a3a'); shade(g, 16, 14, 11, 7, '#e08a3a', '#b8682a', '#f4ac5a')
for x in range(5, 28):
    if g.p[17][x] == '#e08a3a' or g.p[17][x] == '#b8682a': g.p[18][x] = '#b8682a'
for sx, sy in ((11, 10), (16, 9), (20, 11), (14, 13), (19, 15), (9, 14)): g.put(sx, sy, '#f0e6d6'); g.put(sx, sy + 1, '#9a8a7a')
OUT['muffin'] = done(g)

# 4 tart
g = new(); plate(g, 26)
g.poly([(6, 17), (26, 17), (24, 25), (8, 25)], '#e8b870')
for y in range(17, 26):
    for x in range(32):
        if g.p[y][x] == '#e8b870' and (x - 6) % 4 == 0: g.p[y][x] = '#d09a50'
ell(g, 16, 17, 10, 3.5, '#d0302a'); ell(g, 16, 16.5, 8, 2.4, '#e8444a')
for cx, cy in ((11, 14), (16, 12), (21, 14), (14, 16), (19, 16)):
    ell(g, cx, cy, 2.6, 2.6, '#e2382e'); g.put(cx - 1, cy - 1, '#ff8a8a'); g.put(cx, cy - 2, '#6fae4a')
ell(g, 16, 9, 2.5, 2, '#ffffff'); g.put(16, 7, '#ffffff')
g.outline(K)
for x in range(6, 27):
    if g.p[25][x] == '#e8b870' or g.p[25][x] == '#d09a50': g.p[25][x] = '#c08440'
OUT['tart'] = done(g)

# 5 csoup / 6 chili: pumpkin soup bowl recoloured
g = recol(load('d_psoup'), {'#f0a040': '#f08a30', '#ffc878': '#ffb060'})
for cx, cy in ((10, 14), (22, 13)): ell(g, cx, cy, 2.2, 1.4, '#e05e14'); g.put(cx, cy, '#ffb060')
OUT['csoup'] = g
g = recol(load('d_psoup'), {'#f0a040': '#c8442e', '#ffc878': '#e86a4a', '#a8dc6a': '#e2382e', '#6fae4a': '#a8201e'})
for cx, cy in ((9, 14), (14, 12), (24, 14)): g.rect(cx, cy, cx + 1, cy, '#f0a040'); g.put(cx, cy + 1, '#c87a20')
for cx, cy in ((19, 12), (12, 15)): g.rect(cx, cy, cx + 1, cy, '#7a3a20')
OUT['chili'] = g

# 7 pancake stack
g = new(); plate(g, 25)
for i, cy in enumerate((22, 19, 16)):
    ell(g, 16, cy, 11, 3.6, '#c88a40'); ell(g, 16, cy - .8, 10.4, 2.8, '#e8b060')
ell(g, 16, 14.5, 8, 2.2, '#f4cc84')
for cx, cy in ((12, 12), (17, 11), (21, 13)):
    ell(g, cx, cy, 2.4, 2.2, '#e2382e'); g.put(cx - 1, cy - 1, '#ff8a8a'); g.put(cx, cy - 2, '#6fae4a')
ell(g, 15, 14, 3, 1.4, '#ffffff')
OUT['pancake'] = done(g)

# 8 veg: in a pan
g = new()
g.rect(25, 18, 31, 20, '#4a4a56'); g.rect(25, 18, 31, 18, '#6a6a78')
ell(g, 14, 19, 13, 7, '#4a4a56'); ell(g, 14, 18, 11, 5, '#2e2e38')
for cx, cy, c, c2 in ((8, 17, '#f08a30', '#ffb060'), (13, 15, '#f0a040', '#ffc878'), (18, 17, '#f08a30', '#ffb060'), (11, 20, '#f0a040', '#ffc878'), (17, 21, '#f08a30', '#ffb060'), (21, 15, '#f0a040', '#ffc878')):
    g.rect(cx, cy, cx + 2, cy + 1, c); g.put(cx, cy, c2)
for x, y in ((10, 15), (15, 18), (20, 19), (7, 20), (14, 21), (19, 14), (12, 18)): g.put(x, y, '#6fae4a'); g.put(x + 1, y, '#a8dc6a')
for x in range(2, 27):
    if g.p[25][x] == '#4a4a56': g.p[25][x] = '#34343e'
OUT['veg'] = done(g)

# 9 rosti: three golden patties on a plate
g = new(); plate(g, 25)
for cx, cy in ((10, 20), (22, 20), (16, 16)):
    ell(g, cx, cy, 6.5, 3.6, '#a8661e'); ell(g, cx, cy - .8, 6, 2.8, '#e0a040')
    for k in range(9): g.put(cx - 4 + (k * 7) % 9, cy - 2 + (k * 5) % 3, '#c07c2c' if k % 2 else '#f4c464')
    g.put(cx - 1, cy - 2, '#6fae4a'); g.put(cx + 2, cy - 1, '#6fae4a')
    g.outline(K)
OUT['rosti'] = done(g)

# 10 dsalad / 11 tsalad: salad bowl recoloured
g = recol(load('d_salad'), {'#e2382e': '#f0b020', '#ff6a5a': '#ffe060'})
for x, y in ((9, 10), (21, 9), (14, 8)): g.put(x, y, '#ffd83a'); g.put(x + 1, y, '#f0b020')
for x, y in ((7, 11), (17, 12), (23, 11)): g.put(x, y, '#8a5a2a'); g.put(x, y + 1, '#6a3e1a')
OUT['dsalad'] = g
g = recol(load('d_salad'), {'#a8dc6a': '#e8443a', '#9ad070': '#d0302a', '#cdeea0': '#ffb0a0', '#e2382e': '#e8443a', '#ff6a5a': '#ffb0a0'})
for cx, cy in ((9, 10), (15, 9), (21, 11)):
    for dx, dy in ((-1, 0), (1, 0), (0, -1)): g.put(cx + dx, cy + dy, '#ffd0b0')
for x, y in ((12, 7), (18, 8), (7, 9), (23, 10)): g.put(x, y, '#6fae4a')
OUT['tsalad'] = g

# 12 nutcream / 13 csauce / 14 pickles: jam jar recoloured
LABEL = [(x, y) for y in range(17, 24) for x in range(10, 18)]
g = recol(load('d_jam'), {'#ff6a5a': '#f8dc90', '#e2382e': '#d8a040', '#a8201e': '#a87c20', '#e8444a': '#a0622e', '#b02a32': '#7a4620', '#ff8a8a': '#c88a50'})
for x, y in LABEL:
    if g.p[y][x] in ('#d8a040', '#6fae4a'): g.p[y][x] = '#f0e6d6'
ell(g, 14, 21, 2.6, 2.2, '#b07a40'); g.rect(12, 18, 16, 19, '#6fae4a'); g.put(14, 17, '#6a3e1a'); g.put(13, 20, '#d8a868')
OUT['nutcream'] = g
g = recol(load('d_jam'), {'#e8444a': '#e8502a', '#b02a32': '#b0301e', '#ff8a8a': '#ff8a5a'})
for x, y in LABEL:
    if g.p[y][x] in ('#e2382e', '#6fae4a'): g.p[y][x] = '#f0e6d6'
for k in range(5): g.put(11 + k, 22 - k, '#e2382e'); g.put(12 + k, 22 - k, '#e2382e')
g.put(16, 17, '#6fae4a'); g.put(17, 17, '#6fae4a')
OUT['csauce'] = g
g = recol(load('d_jam'), {'#ff6a5a': '#a8dc6a', '#e2382e': '#6fae4a', '#a8201e': '#4e8a34', '#e8444a': '#d8ecb0', '#b02a32': '#b4d090', '#ff8a8a': '#ecf8d4', '#f0e6d6': '#d8ecb0', '#d4c4ac': '#d8ecb0'})
for x, y in LABEL:
    if g.p[y][x] in ('#6fae4a', '#a8dc6a'): g.p[y][x] = '#d8ecb0'
for cx in (11, 15, 19):
    ell(g, cx, 21, 1.8, 6.5, '#5a9a3a'); g.rect(cx - 1, 17, cx - 1, 25, '#7ab85a')
    for y in (18, 21, 24): g.put(cx + 1, y, '#3e7a2a')
for x, y in ((13, 15), (14, 14), (15, 15), (17, 14)): g.put(x, y, '#4e8a34')
OUT['pickles'] = g

def svg(g):
    return ''.join(f'<path fill="{c}" d="{"".join(p)}"/>' for c, p in g.paths().items())
json.dump({'d_' + k: {'w': 32, 'h': 32, 'svg': svg(v)} for k, v in OUT.items()}, open('dishes_big.json', 'w'))
o = '<body style="margin:0;background:#fbf1de;display:flex;flex-wrap:wrap;gap:10px;padding:10px;width:1060px;font:bold 13px sans-serif;color:#3a2414">'
for k, v in OUT.items(): o += f'<div style="text-align:center"><svg width=192 height=192 viewBox="0 0 32 32" shape-rendering=crispEdges>{svg(v)}</svg><br>{k}</div>'
open('dishes.html', 'w').write(o)
