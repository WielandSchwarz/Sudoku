from lib import *
G = ['#1a3a16', '#24501e', '#336a28', '#448a34', '#5aa646', '#7cc45c', '#a8e080']
def tomato(ripe=True):
    s = S(19, 18); C = ['#5a0e0a', '#8a1a12', '#b8261a', '#e03c26', '#f8664a', '#ffb49a'] if ripe else ['#2a4a14', '#3e6a1e', '#58902c', '#78b440', '#9cd060', '#d4f0a4']
    for y in range(3, 18):
        for x in range(19):
            dx, dy = (x + .5 - 9.5) / 9, (y + .5 - 10.5) / 7.2
            q = dx*dx + dy*dy
            if q <= 1:
                l = -dx * .5 - dy * .75 + math.sqrt(max(0, 1 - q)) * .45
                lobe = math.cos((x + .5 - 9.5) / 9 * math.pi * 1.5)    # soft ribs
                l += lobe * .08
                s.put(x, y, C[1 if l < -.1 else 2 if l < .22 else 3 if l < .55 else 4])
    for (x, y) in ((5, 7), (6, 7), (5, 8)): s.put(x, y, C[5])
    s.put(7, 6, C[4])
    # calyx: a five-pointed green star with a stub
    for (x, y, c) in ((9, 0, G[3]), (9, 1, G[3]), (10, 1, G[4]), (9, 2, G[3]), (6, 3, G[3]), (7, 3, G[4]), (8, 3, G[4]), (9, 3, G[3]), (10, 3, G[4]), (11, 3, G[4]), (12, 3, G[3]),
                      (5, 4, G[3]), (8, 4, G[3]), (10, 4, G[3]), (13, 4, G[3]), (8, 5, G[2]), (11, 5, G[2]), (4, 4, G[2]), (14, 4, G[2])): s.put(x, y, c)
    s.outline(C[0]); return s
def leaflet(s, x, y, ang, L, Wd, own):
    ca, sa = math.cos(ang), math.sin(ang)
    for t in range(int(L * 10)):
        u = t / 10.0
        w = Wd * math.sin(math.pi * min(1, u / L)) ** .8
        for k in range(-int(w * 10) - 2, int(w * 10) + 3):
            v = k / 10.0
            # serrated edge
            if abs(v) > w - .7 * (1 if int(u * 1.6) % 2 else 0) * (u > .5): continue
            px, py = x + ca * u - sa * v, y + sa * u + ca * v
            l = -(-sa * (1 if v > 0 else -1)) * .4 - .2 * (1 if v < 0 else -1) * ca
            side = 1 if v * ca < 0 or (v > 0 and sa < 0) else 0
            nv = abs(v) / max(w, .1)
            t2 = 5 if nv > .55 and side else 4 if side else 3
            if nv < .14: t2 = 6 if side else 5         # midrib
            if nv > .85 and not side: t2 = 2
            s.put(px, py, G[t2])
def leaf(s, x, y, ang, L):
    ca, sa = math.cos(ang), math.sin(ang)
    for t in range(int(L)):
        s.put(x + ca * t, y + sa * t, G[2]); s.put(x + ca * t, y + sa * t + 1, G[1])
    for n, u in enumerate([.3, .58, .82]):
        bx, by = x + ca * L * u, y + sa * L * u
        for sgn in (-1, 1):
            leaflet(s, bx, by, ang + sgn * (1.1 - n * .15), 8.5 - n * 1.2, 3.4 - n * .4, None)
    leaflet(s, x + ca * L - 1, y + sa * L, ang + .25, 10, 4, None)
def plant():
    W, H = 104, 90; s = S(W, H)   # placed with its stem foot at (90, 106) -> sprite x0 = 38, y0 = 16
    stem = lambda y: 52 + math.sin(y / 11) * 1.2
    leaves = [(0, 38, -1, 20), (0, 44, 1, 20), (0, 60, -1, 18), (0, 66, 1, 18), (0, 24, -1, 14), (0, 28, 1, 14), (0, 78, -1, 12), (0, 80, 1, 11), (0, 16, 1, 9), (0, 14, -1, 8)]
    for (lx, ly, sd, L) in leaves:
        sx = stem(ly)
        a = math.atan2(-6, sd * L)
        leaf(s, sx, ly, math.atan2(-.2 + (ly / 140), sd), L)
    for y in range(12, H):
        cx = stem(y)
        for k in range(-2, 2):
            t = 5 if k == -2 else 4 if k == -1 else 3 if k == 0 else 2
            s.put(cx + k, y, G[t])
        if hx(0, y, 7) < .3: s.put(cx - 3, y, G[5])   # little hairs
        if hx(1, y, 7) < .3: s.put(cx + 2, y, G[4])
    s.outline(G[0]); return s
def stake(H=86):
    s = S(5, H); Wd = ['#3a2414', '#8a5a34', '#b0784a', '#c8945a', '#e0b07a']
    for y in range(H):
        for x in range(1, 4): s.put(x, y, Wd[4 if x == 1 else 3 if x == 2 else 2])
        if y % 11 == 5: s.put(2, y, Wd[1]); s.put(2, y + 1, Wd[1])
    s.outline(Wd[0]); return s
OUT = {}
def add(n, s): r, p = s.rows(); OUT[n] = {'r': r, 'p': p}
add('tom', tomato(True)); add('tom_u', tomato(False)); add('tomplant', plant()); add('stake', stake())
json.dump(OUT, open('tomato.json', 'w'))
pv = Image.new('RGBA', (180, 135), (143, 208, 244, 255))
pv.alpha_composite(stake().img(), (94, 22)); pv.alpha_composite(plant().img(), (38, 16))
for (x, y, r) in [[66, 56, 1], [84, 70, 1], [104, 58, 0], [72, 86, 1], [102, 84, 1], [88, 44, 0]]:
    pv.alpha_composite(tomato(bool(r)).img(), (x - 9, y - 10))
pv.resize((720, 540), Image.NEAREST).save('tom_prev.png')
