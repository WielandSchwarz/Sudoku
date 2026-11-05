from lib import *
PALS = {
 'summer': ['#1e3a1a', '#2c5826', '#3a7030', '#4a8a3e', '#5aa04e', '#78bc5e', '#a8dc78'],
 'autumn': ['#4a2410', '#7a3a18', '#9a4a20', '#c8702a', '#e0943a', '#f0b850', '#f8dc8a'],
}
CL = [(58, 22, 20), (36, 28, 17), (80, 28, 17), (22, 42, 14), (96, 42, 14), (46, 40, 19), (72, 40, 19),
      (58, 38, 16), (30, 56, 14), (88, 56, 14), (58, 56, 18), (14, 56, 9), (104, 56, 9)]
def crown(season, W=118, H=78):
    P = PALS[season]; s = S(W, H); own = [[-1]*W for _ in range(H)]; LX, LY, LZ = -.5, -.72, .48
    for i, (cx, cy, r) in enumerate(CL):
        for y in range(H):
            for x in range(W):
                dx, dy = x + .5 - cx, y + .5 - cy; d = math.hypot(dx, dy); a = math.atan2(dy, dx)
                if d < r + 1.1 * math.sin(a * 8 + i * 1.7) + .6 * math.sin(a * 13 + i): own[y][x] = i
    for y in range(H):
        for x in range(W):
            i = own[y][x]
            if i < 0: continue
            cx, cy, r = CL[i]; nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / r; q = nx*nx + ny*ny
            nz = math.sqrt(max(0, 1 - min(q, 1))); l = nx*LX + ny*LY + nz*LZ - (y / H) * .25
            t = 1 if l < -.25 else 2 if l < .05 else 3 if l < .32 else 4 if l < .55 else 5
            # cast shadow from a cluster in front (drawn later), light from the upper left
            for sx, sy in ((-1, -2), (-2, -3), (0, -2)):
                j = own[y + sy][x + sx] if 0 <= y + sy < H and 0 <= x + sx < W else -1
                if j > i: t = max(1, min(t, 2) - (1 if (sx, sy) == (-1, -2) else 0)); break
            s.put(x, y, P[t]); own[y][x] = i * 10 + t if False else own[y][x]
    # leaf texture: little leaf marks on a loose grid, a tone lighter in the light, darker in the shade
    base = [r[:] for r in s.g]
    for gy in range(0, H, 3):
        for gx in range(0, W, 4):
            x = gx + int(hx(gx, gy, 3) * 4) - (2 if (gy // 3) % 2 else 0); y = gy + int(hx(gx, gy, 5) * 3)
            c = s.get(x, y)
            if c is None or c not in P: continue
            t = P.index(c)
            if hx(x, y, 9) < .25: continue
            nt = min(6, t + 1) if t >= 3 else max(1, t - 1)
            for (ax, ay) in ((0, 0), (1, 0), (-1, 1)) if t >= 3 else ((0, 0), (1, 1), (-1, 0)):
                if s.get(x + ax, y + ay) == c: s.put(x + ax, y + ay, P[nt])
    s.outline(P[0])
    return s
def trunk(W=34, H=60):
    s = S(W, H); B = ['#3a2414', '#5a3a22', '#7a5232', '#9a6e46', '#b88a5a']
    for y in range(H):
        hw = 5 + (max(0, y - 46) ** 1.6) * .22 + (max(0, 10 - y)) * .0
        cx = W / 2 + math.sin(y / 9) * .8
        for x in range(W):
            dx = x + .5 - cx
            if abs(dx) <= hw:
                u = (dx + hw) / (2 * hw); t = 3 if u < .3 else 2 if u < .72 else 1
                if u < .14: t = 4 if hx(x, y) < .5 else 3
                if hx(x // 2, y // 5, 2) < .22 and .2 < u < .85: t = max(1, t - 1)   # bark furrows
                s.put(x, y, B[t])
    # two branches reaching up into the crown
    for side in (-1, 1):
        for k in range(16):
            x = W / 2 + side * (2 + k * .9); y = 12 - k * .8
            for w in range(3): s.put(x + side * 0, y + w, B[2 if w else 3])
    s.outline(B[0]); return s
def fruit(kind, ripe=True):
    if kind == 'apple':
        s = S(15, 16); C = ['#5a1410', '#861c18', '#b02a22', '#e0402e', '#f86a4a', '#ffb08a'] if ripe else ['#2c4a14', '#4a7020', '#6a9a30', '#8ac44a', '#a8dc6a', '#d8f4a0']
        for y in range(3, 16):
            for x in range(15):
                dx, dy = (x + .5 - 7.5) / 7, (y + .5 - 9.5) / 6.4
                dent = .25 * math.exp(-((x + .5 - 7.5) ** 2) / 4) if y < 6 else 0
                if dx*dx + dy*dy <= 1 and not (y + .5 - 3.2 < dent * 6 and abs(x + .5 - 7.5) < 1.5):
                    l = -dx * .55 - dy * .7 + math.sqrt(max(0, 1 - dx*dx - dy*dy)) * .5
                    s.put(x, y, C[1 if l < -.15 else 2 if l < .2 else 3 if l < .55 else 4])
        if ripe:
            for y in range(6, 14):
                for x in range(8, 13):
                    if s.get(x, y) == C[3] and hx(x, y, 4) < .35: s.put(x, y, '#e8783a')
        s.put(4, 7, C[5]); s.put(5, 7, C[5]); s.put(4, 8, C[5])
        for y in range(0, 5): s.put(7 + (1 if y < 1 else 0), y, '#5a3a1a')
        for (x, y, c) in ((9, 1, '#5aa04e'), (10, 1, '#78bc5e'), (11, 1, '#78bc5e'), (9, 2, '#3a7030'), (10, 2, '#5aa04e'), (11, 2, '#5aa04e'), (12, 2, '#3a7030'), (12, 1, '#a8dc78')): s.put(x, y, c)
        s.outline(C[0]); return s
    if kind == 'pear':
        s = S(14, 18); C = ['#4a5212', '#7a8a1e', '#a8b830', '#c8d850', '#e4ec84', '#fafcc8']
        for y in range(3, 18):
            for x in range(14):
                cx = 7; r = 3.2 if y < 9 else 6.4 - abs(y - 12.5) * .35 if y < 18 else 0
                if y >= 9: r = 6.4 * math.sqrt(max(0, 1 - ((y + .5 - 12.6) / 5.4) ** 2))
                else: r = 3.4 + (y - 3) * .25
                dx = (x + .5 - cx) / max(r, .1)
                if abs(dx) <= 1 and (y >= 4 or abs(dx) < .7):
                    l = -dx * .7 - (y - 10) / 16
                    s.put(x, y, C[1 if l < -.3 else 2 if l < .15 else 3 if l < .5 else 4])
        s.put(5, 11, C[5]); s.put(5, 12, C[5]); s.put(6, 6, C[5])
        for y in range(0, 4): s.put(7, y, '#5a3a1a')
        s.outline(C[0]); return s
    if kind == 'plum':
        s = S(12, 15); C = ['#1e0a2e', '#3a1a52', '#5a2c78', '#7a44a0', '#a87ac8', '#d4c0ec']
        for y in range(3, 15):
            for x in range(12):
                dx, dy = (x + .5 - 6) / 5.6, (y + .5 - 9) / 6
                if dx*dx + dy*dy <= 1:
                    l = -dx * .6 - dy * .6; t = 1 if l < -.2 else 2 if l < .2 else 3 if l < .55 else 4
                    if abs(x + .5 - 7) < .6 and 4 < y < 13: t = max(1, t - 1)
                    s.put(x, y, C[t])
        s.put(3, 6, C[5]); s.put(3, 7, C[5])
        for y in range(0, 4): s.put(6, y, '#5a3a1a')
        s.outline(C[0]); return s
    if kind == 'cherry':
        s = S(14, 16); C = ['#3a0610', '#6a0e1e', '#a01a2c', '#d0283a', '#f05a62', '#ffb0b0']
        for (cx, cy) in ((3.8, 11.5), (10, 12.5)):
            for y in range(16):
                for x in range(14):
                    dx, dy = (x + .5 - cx) / 3.5, (y + .5 - cy) / 3.4
                    if dx*dx + dy*dy <= 1: l = -dx * .6 - dy * .6; s.put(x, y, C[1 if l < -.25 else 2 if l < .15 else 3 if l < .55 else 4])
            s.put(cx - 1.5, cy - 1.5, C[5])
        for k in range(8): s.put(4 + k * .15, 7 - k, '#4a7a2a'); s.put(10 - k * .55, 8 - k * .85, '#4a7a2a')
        s.put(6, 0, '#4a7a2a'); s.put(7, 0, '#78bc5e'); s.put(8, 0, '#78bc5e'); s.put(8, 1, '#5aa04e')
        s.outline(C[0]); return s
OUT = {}
def add(name, s):
    r, p = s.rows(); OUT[name] = {'r': r, 'p': p}
for se in PALS: add('crown_' + se, crown(se))
add('trunk', trunk())
for k in ('apple', 'pear', 'plum', 'cherry'): add(k, fruit(k, True))
add('apple_u', fruit('apple', False))
json.dump(OUT, open('tree.json', 'w'))
# preview on a sky colour
sky = (143, 208, 244, 255); pv = Image.new('RGBA', (360, 150), sky)
c = crown('summer').img(); t = trunk().img(); pv.alpha_composite(t, (59 - 17 + 0, 66)); pv.alpha_composite(c, (17, 4))
c2 = crown('autumn').img(); pv.alpha_composite(t, (239 - 17, 66)); pv.alpha_composite(c2, (197, 4))
for i, k in enumerate(['apple', 'pear', 'plum', 'cherry']):
    im = fruit(k).img(); pv.alpha_composite(im, (30 + i * 22, 30 + (i % 2) * 14))
pv.resize((1080, 450), Image.NEAREST).save('tree_prev.png')
