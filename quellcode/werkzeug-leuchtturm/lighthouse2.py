# Lighthouse v2: entrance (proper staircase) + one keeper's room (ladder to the lantern) + lantern at night (minigame scene).
import math, random
from lighthouse import *
from lighthouse import _H

# ---------------- a solid staircase running along the back wall, seen from the side ----------------
def staircase(x0, x1, floor_y, steps):
    def st(a):
        sw = (x1 - x0) / steps; rise = (floor_y + 1) / steps
        for k in range(steps):
            sx = int(x0 + k * sw); ex = int(x0 + (k + 1) * sw) - 1; ty = int(floor_y - (k + 1) * rise)
            by = min(floor_y - 1, int(ty + rise + 9))
            a.rect(sx, ty, ex, by, WD2)                                # stringer band under the treads
            a.rect(sx, by, ex, by, DK)
            a.rect(sx, ty - 2, ex + 1, ty, WD3); a.rect(sx, ty + 1, ex + 1, ty + 2, WD)   # tread: top face + nosing
        # handrail on the front edge with balusters
        for k in range(steps + 1):
            px = int(x0 + k * sw); py = int(floor_y - k * rise)
            if k % 2 == 0 and 0 < k < steps + 1: a.rect(px, py - 15, px, py - 3, DK)
        line(a, x0, floor_y - 17, x1, -6, DK); line(a, x0, floor_y - 18, x1, -7, WD3)
        a.rect(x0 - 1, floor_y - 20, x0 + 2, floor_y - 1, DK); a.rect(x0 - 2, floor_y - 22, x0 + 3, floor_y - 20, WD3)   # the newel post
    return lay(st)

def ceiling(g, hole=None):   # beams; optional opening where the stair/ladder passes through
    g.rect(INX0, 0, INX1, 4, WD2); g.rect(INX0, 5, INX1, 5, DK)
    for x in range(INX0 + 12, INX1, 26): g.rect(x, 0, x + 4, 7, WD); g.rect(x, 7, x + 4, 7, DK)
    if hole: g.rect(hole[0], 0, hole[1], 5, '#3a2a1c')

# ---------------- ground: the entrance ----------------
def room_entrance():
    rnd = random.Random(1); g = G(W, RH); outside(g, 'rocks', rnd); tower_wall(g, True, stripe=RED); ceiling(g, (128, 159))
    def door(a):
        X = 52
        a.rect(X - 17, 52, X + 17, 110, WD2); ell(a, X, 52, 17, 12, WD2)
        a.rect(X - 14, 54, X + 14, 110, WD); ell(a, X, 54, 14, 10, WD)
        for x in range(X - 10, X + 14, 6): a.rect(x, 50, x, 110, WD2)
        ell(a, X, 56, 5, 5, SKY2); a.rect(X, 51, X, 61, BRS2); a.rect(X - 5, 56, X + 5, 56, BRS2)
        ell(a, X + 10, 84, 2.4, 2.4, IRN); ell(a, X + 10, 84, 1.2, 1.2, WD)
    def wallthings(a):
        lifebuoy(a, 90, 40); coat(a, 24, 58)
    def nook(a):   # under the stairs: crates, a storm lantern, rope
        crate(a, 120, 94, 16, 16); crate(a, 138, 98, 12, 12); rope(a, 108, 106)
        a.rect(125, 87, 129, 93, IRN); a.rect(124, 86, 130, 86, IRN2); ell(a, 127, 90, 1.4, 1.4, GLOW)
    def front(a):
        boots(a, 72, 110)
        for j, c in enumerate(('#7ab05a', CREAM, '#7ab05a')): ell(a, 60, 123, 26 - j * 7, 6 - j * 1.6, c)   # doormat rug
    return comp(g, lay(door), lay(wallthings), lay(nook), staircase(100, 160, 112, 9), lay(front))

# ---------------- upstairs: the keeper's room (sleep + sit + stove), ladder up to the lantern ----------------
def ladder(x, top, bottom):
    def l(a):
        for dx in (0, 12): a.rect(x + dx, top, x + dx + 1, bottom, WD); a.rect(x + dx, top, x + dx, bottom, WD3)
        for y in range(top + 6, bottom - 2, 9): a.rect(x + 2, y, x + 11, y + 1, WD2); a.rect(x + 2, y, x + 11, y, WD3)
    return lay(l)

def room_keeper():
    rnd = random.Random(3); g = G(W, RH); outside(g, 'seaview', rnd); tower_wall(g, True); ceiling(g, (136, 156))
    def win(a): roundwin(a, 112, 40, 11, lambda x, y: seaview(x, y, 44))
    def bed(a):   # box bed in the curve of the wall with a patchwork quilt and a little curtain
        a.rect(20, 56, 64, 110, WD2); a.rect(22, 60, 62, 106, '#3a2a1c')
        a.rect(20, 56, 64, 58, WD3)
        ell(a, 32, 82, 8, 4, CREAM)
        for y in range(86, 104):
            for x in range(23, 62): a.put(x, y, ('#d8584a', CREAM, '#e8b84a', '#7ab05a')[((x - 23) // 7 + (y - 86) // 5) % 4])
        a.rect(20, 104, 64, 110, WD); a.rect(20, 104, 64, 104, WD3)
        a.poly([(22, 60), (34, 60), (28, 84), (22, 84)], '#e8706a')   # curtain tied to the side
    def stove(a):
        a.rect(72, 78, 88, 108, IRN); a.rect(71, 76, 89, 78, IRN2); a.rect(75, 84, 85, 96, '#2a2a32'); ell(a, 80, 90, 3.4, 2.6, '#f08a24'); a.put(80, 88, GLOW)
        a.rect(73, 108, 75, 111, IRN); a.rect(85, 108, 87, 111, IRN)
        a.rect(78, 6, 82, 76, IRN2); a.rect(79, 6, 79, 76, '#8a8a96')
        ell(a, 85, 72, 4, 3, '#c8463c'); a.rect(88, 70, 91, 71, '#c8463c'); a.rect(83, 68, 87, 68, IRN)
    def chair(a):
        a.rect(98, 76, 124, 104, '#a8c090'); ell(a, 111, 76, 13, 5, '#a8c090'); ell(a, 111, 76, 11, 4, '#c8dcb4'); a.rect(100, 76, 122, 92, '#c8dcb4')
        for x0 in (94, 120): a.rect(x0, 85, x0 + 6, 104, '#a8c090'); a.rect(x0, 85, x0 + 6, 86, '#dce8cc')
        a.rect(102, 90, 118, 97, '#e8706a')
        for x in range(102, 119, 4): a.rect(x, 90, x + 1, 97, '#f8c4c0')
        a.rect(97, 104, 99, 110, WD2); a.rect(119, 104, 121, 110, WD2)
    def rug(a):
        for j, c in enumerate(('#3e6a9a', CREAM, '#d8584a', CREAM, '#3e6a9a')): ell(a, 80, 122, 38 - j * 7, 8 - j * 1.4, c)
    def stairwell(a):   # where the staircase from below arrives: a railed opening in the floor, front left
        a.poly([(128, 128), (162, 128), (162, 116), (130, 116)], '#3a2a1c')
        for k in range(3): a.rect(132 + k * 2, 118 + k * 3, 160, 118 + k * 3, WD3)   # top treads peeking up
    def rail(a):
        for x in (126, 140): a.rect(x, 100, x + 1, 128, DK)
        a.rect(124, 99, 160, 101, WD3); a.rect(124, 101, 160, 101, DK)
    L = [lay(win), lay(rug), lay(bed), lay(stove), lay(chair), ladder(140, 2, 111), lay(stairwell), lay(rail)]
    comp(g, *L)
    hg = G(W, RH); put_ham(hg, 78, 124, AWAKE); comp(g, hg)
    return g

# ---------------- top: the lantern at night = minigame scene (beam guides a boat past the rocks) ----------------
NSKY, NSKY2, NSEA, NSEA2, NSEA3 = '#1c2450', '#283464', '#1e3a6a', '#16305a', '#2a4a7e'
def lantern_night(beam_ang=-152):
    g = G(W, RH); rnd = random.Random(6)
    for y in range(RH):
        for x in range(W): g.p[y][x] = NSKY if y < 22 else NSKY2 if y < 32 else (NSEA3 if y < 34 else NSEA if (x * 3 + y * 7) % 13 else NSEA2)
    for k in range(30): g.put(rnd.randint(0, 179), rnd.randint(4, 28), '#fff6c8' if k % 4 else '#ffffff')
    ell(g, 150, 14, 5, 5, '#fff6c8'); ell(g, 152, 12, 4, 4, NSKY)
    for k in range(26): x = rnd.randint(0, 175); y = rnd.randint(38, 96); g.rect(x, y, x + 3, y, NSEA3)
    def rocks(a):
        for (cx, cy, w) in ((50, 56, 12), (132, 48, 9), (108, 74, 14), (22, 82, 10)):
            a.poly([(cx - w, cy + 4), (cx - w // 2, cy - 4), (cx + w // 2, cy - 5), (cx + w, cy + 4)], '#4a4e66'); a.rect(cx - w // 2, cy - 4, cx + w // 3, cy - 4, '#6a6e88')
            a.rect(cx - w - 2, cy + 5, cx + w + 2, cy + 5, NSEA3)
    def boat(a):
        X, Y = 30, 60
        a.poly([(X, Y), (X + 18, Y), (X + 15, Y + 5), (X + 3, Y + 5)], WD); a.rect(X, Y, X + 18, Y, WD3)
        a.rect(X + 8, Y - 12, X + 8, Y - 1, DK); a.poly([(X + 9, Y - 12), (X + 16, Y - 2), (X + 9, Y - 2)], CREAM)
        a.rect(X + 3, Y - 3, X + 5, Y - 1, GLOW)
    def harbor(a):   # the safe harbour light the boats must reach
        a.rect(150, 70, 179, 78, WD2); a.rect(150, 70, 179, 70, WD3)
        for x in range(152, 179, 6): a.rect(x, 78, x + 1, 86, WD2)
        a.rect(160, 58, 162, 69, IRN); a.rect(158, 54, 164, 58, GLOW)
    comp(g, lay(rocks), lay(boat), lay(harbor))
    LX, LY = 90, 112; LIT = {NSKY: '#4a5a94', NSKY2: '#5a6aa4', NSEA: '#4a6ea4', NSEA2: '#3e6298', NSEA3: '#6a8ec0', '#4a4e66': '#8a8ea8', '#6a6e88': '#aaaec4', WD: WD3, CREAM: '#ffffff'}
    for y in range(RH):
        for x in range(W):
            dx, dy = x - LX, y - LY; d = math.hypot(dx, dy)
            if d < 16: continue
            an = math.degrees(math.atan2(dy, dx)); diff = abs((an - beam_ang + 180) % 360 - 180)
            if diff < 6 + d * .015 and g.p[y][x] in LIT: g.p[y][x] = LIT[g.p[y][x]]
    def room(a):
        a.rect(0, 0, 179, 2, IRN)
        for x in (0, 59, 119, 177): a.rect(x, 0, x + 2, 104, IRN)
        a.rect(0, 100, 179, 104, IRN); a.rect(0, 100, 179, 100, IRN2)
        for x in range(4, 180, 9): a.rect(x, 92, x, 99, IRN)
        a.rect(0, 91, 179, 91, IRN2)
        for y in range(105, RH):
            for x in range(W): a.put(x, y, BRS2 if (y - 105) % 6 == 0 else '#8a6a30' if (x + y) % 17 else '#a07c3c')
    def lens(a):
        for r, c in ((16, GLOW), (12, GLOW2), (8, '#fff0b0'), (4, '#ffffff')): ell(a, LX, LY - 6, r * .8, r, c)
        for k in range(-2, 3): a.rect(LX - 10, LY - 6 + k * 6, LX + 10, LY - 6 + k * 6, BRS)
        a.rect(LX - 14, 118, LX + 14, 134, BRS2); a.rect(LX - 12, 120, LX + 12, 134, BRS); a.rect(LX - 12, 120, LX + 12, 121, BRS3)
        a.rect(LX + 14, 124, LX + 24, 126, BRS2); ell(a, LX + 26, 125, 3, 3, BRS2); ell(a, LX + 26, 125, 1.5, 1.5, BRS3)
    comp(g, lay(room), lay(lens))
    hg = G(W, RH); put_ham(hg, 134, 134, AWAKE); comp(g, hg)
    return g

def outside_view2():
    g = outside_view()
    g.rect(88, 46, 92, 75, None) if False else None
    return g

if __name__ == '__main__':
    def img(g, s):
        im = Image.new('RGB', (g.w, g.h)); P = im.load()
        for y in range(g.h):
            for x in range(g.w):
                c = g.p[y][x] or '#ffffff'; c = '#3a2414' if c == K else c
                P[x, y] = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
        return im.resize((g.w * s, g.h * s), Image.NEAREST)
    S = 2
    floors = [('Laterne – Minispiel', lantern_night()), ('Wärterstube', room_keeper()), ('Eingang', room_entrance())]
    FT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    pad = 34; colw = W * S
    sheet = Image.new('RGB', (colw * 2 + 60, len(floors) * (RH * S + pad) + 20), (250, 246, 238)); d = ImageDraw.Draw(sheet)
    d.text((20, 8), 'Außen', fill=(58, 36, 20), font=FT); sheet.paste(img(outside_view(), S), (20, 8 + pad - 6))
    x2 = colw + 40
    for i, (n, gfl) in enumerate(floors):
        y = 8 + i * (RH * S + pad)
        d.text((x2, y), n, fill=(58, 36, 20), font=FT); sheet.paste(img(gfl, S), (x2, y + pad - 6))
    sheet.save('lighthouse_v2.png'); print(sheet.size)
