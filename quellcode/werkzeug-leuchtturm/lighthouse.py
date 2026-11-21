# Design: the lighthouse as a second home. Five floors, each a 180 x 135 room like the house rooms, stacked as one tall level.
import json, re, math, random
from lib import G
from PIL import Image, ImageDraw, ImageFont
K = 'K'
W, RH = 180, 135
def lay(fn, h=RH):
    g = G(W, h); fn(g); g.outline(K); return g
def comp(base, *ls):
    for l in ls:
        for y in range(base.h):
            for x in range(base.w):
                if l.p[y][x] is not None: base.p[y][x] = l.p[y][x]
    return base
def ell(g, cx, cy, rx, ry, c):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1: g.put(x, y, c)
def line(g, x0, y0, x1, y1, c):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1): t = i / max(n, 1); g.put(int(round(x0 + (x1 - x0) * t)), int(round(y0 + (y1 - y0) * t)), c)
# palette (hex keys straight away)
SKY, SKY2, SKY3 = '#bfe3f2', '#d6eef8', '#e8f6fb'
SEA, SEA2, SEA3 = '#5aa0c8', '#468ab4', '#8cc4e2'
STONE, STONE2, STONE3 = '#cfc6b8', '#b0a696', '#e2dbcf'
WHITE, WHITE2, WHITE3 = '#f4efe6', '#e2dacb', '#fffaf2'
RED, RED2, RED3 = '#d8584a', '#b0403a', '#ec7c6a'
WD, WD2, WD3 = '#a06a38', '#7e4e24', '#c08a50'
DK, DK2 = '#6a4224', '#4e2e16'
BRS, BRS2, BRS3 = '#d8a840', '#a87c20', '#f0d070'
IRN, IRN2 = '#4a4a56', '#6a6a78'
CREAM = '#fff4e0'
GLOW, GLOW2 = '#ffe9a0', '#fff6c8'

# ---------------- the tower walls: a round room seen in cutaway; outside the cut you see sky, sea or rocks ----------------
INX0, INX1 = 20, 159          # inside of the tower wall
def outside(g, kind, rnd):
    for y in range(RH):
        for x in range(W):
            if kind == 'sky': c = SKY3 if y < 30 else SKY2 if y < 80 else SKY
            elif kind == 'seaview': c = SKY2 if y < 70 else (SEA3 if y < 74 else SEA if y < 110 else SEA2)
            else: c = SEA if y < 40 else (STONE2 if (x * 7 + y * 3) % 11 else STONE)
            g.p[y][x] = c
    if kind == 'sky':
        for (cx, cy) in ((8, 30), (172, 60)): ell(g, cx, cy, 7, 3, '#ffffff'); ell(g, cx + 5, cy - 1, 4, 2.4, '#ffffff')
    if kind == 'seaview':
        for k in range(14): x = rnd.randint(0, 179); g.rect(x, 80 + rnd.randint(0, 25), x + 2, 80 + rnd.randint(0, 25), SEA3)
def tower_wall(g, inner, floor_y=112, plank=WD, plank2=WD2, plank3=WD3, wall=WHITE, wall2=WHITE2, wall3=WHITE3, stripe=None):
    # back wall of the round room: whitewashed, with soft shading towards the curved sides
    for y in range(0, floor_y):
        for x in range(INX0, INX1 + 1):
            u = (x - 89.5) / 70
            c = wall
            if abs(u) > .78: c = wall2
            elif abs(u) < .35 and (x + y * 3) % 29 == 0: c = wall3
            if (y % 14 == 0) and abs(u) < .9 and (x // 3) % 7 != 0: c = wall2 if abs(u) > .5 else c   # faint stone courses
            g.p[y][x] = c
    if stripe:   # a band of the red outside stripe shows through the wall section at the sides
        pass
    # the floor: planks seen at an angle, round towards the front
    for y in range(floor_y, RH):
        for x in range(INX0 - 4, INX1 + 5):
            c = plank if (y - floor_y) % 6 else plank2
            if (x + (y // 6) * 13) % 31 == 0: c = plank2
            if (y - floor_y) % 6 == 1 and (x * 3 + y) % 9 == 0: c = plank3
            g.p[y][x] = c
    g.rect(INX0, floor_y - 2, INX1, floor_y - 1, plank2); g.rect(INX0, floor_y - 3, INX1, floor_y - 3, plank3)   # skirting
    # the cut wall: thick stone on both sides, white outside with the red band where it passes
    for side in (0, 1):
        x0 = 12 if side == 0 else INX1 + 1; x1 = INX0 - 1 if side == 0 else 167
        for y in range(RH):
            for x in range(x0, x1 + 1):
                c = STONE if ((x // 4) + (y // 5)) % 2 else STONE3
                if y % 5 == 0 or (x % 4 == 0 and (y // 5) % 2): c = STONE2
                g.p[y][x] = c
        xo = 11 if side == 0 else 168   # the outer skin: a white or red edge line
        for y in range(RH): g.p[y][xo] = (stripe if stripe else WHITE) ; g.p[y][xo + (-1 if side == 0 else 1)] = K
        for y in range(RH): g.p[y][x1 if side == 0 else x0] = K

# ---------------- props ----------------
def stairs(g, side, floor_y=112, up=True, down=True):
    # a spiral stair hugging the wall: wooden steps going up through a hatch in the ceiling
    x0 = INX1 - 26 if side == 'r' else INX0 + 2
    def st(a):
        for k in range(7):
            sx = x0 + (k * 3 if side == 'r' else 22 - k * 3); sy = floor_y - 4 - k * 15
            a.rect(sx, sy, sx + 10, sy + 3, WD); a.rect(sx, sy, sx + 10, sy, WD3); a.rect(sx, sy + 3, sx + 10, sy + 3, WD2)
        a.rect(x0 + (24 if side == 'r' else 0), 0, x0 + (25 if side == 'r' else 1), floor_y - 2, DK)   # the newel post
        for y in range(4, floor_y - 6, 15): a.rect(x0 + (24 if side == 'r' else 0) - 1, y, x0 + (24 if side == 'r' else 0) + 2, y + 1, DK2)
    return lay(st)
def hatch_ceiling(g, side):   # the opening in the ceiling where the stair disappears
    x0 = INX1 - 30 if side == 'r' else INX0 + 2
    g.rect(INX0, 0, INX1, 3, WD2); g.rect(INX0, 4, INX1, 4, DK)
    g.rect(x0, 0, x0 + 28, 4, '#3a2a1c')
def roundwin(a, cx, cy, r, inside):
    for y in range(cy - r - 3, cy + r + 4):
        for x in range(cx - r - 3, cx + r + 4):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if d <= r: a.put(x, y, inside(x, y))
            elif d <= r + 2.6: a.put(x, y, BRS if d < r + 1.6 else BRS2)
    a.rect(cx, cy - r, cx, cy + r, BRS2); a.rect(cx - r, cy, cx + r, cy, BRS2)
def seaview(x, y, cy):
    return SKY2 if y < cy else (SEA3 if y == cy else SEA if (x + y) % 5 else SEA3)
def lifebuoy(a, cx, cy):
    for y in range(cy - 9, cy + 10):
        for x in range(cx - 9, cx + 10):
            d = math.hypot(x + .5 - cx, y + .5 - cy); ang = math.degrees(math.atan2(y + .5 - cy, x + .5 - cx)) % 360
            if 4.5 < d <= 9: a.put(x, y, RED if (ang // 45) % 2 else WHITE)
    a.rect(cx - 1, cy - 12, cx, cy - 9, '#c8a878')
def boots(a, x, y):
    for dx in (0, 7):
        a.rect(x + dx, y - 12, x + dx + 4, y - 1, '#e8c040'); a.rect(x + dx, y - 3, x + dx + 7, y, '#e8c040'); a.rect(x + dx + 1, y - 12, x + dx + 1, y - 3, '#f8dc70'); a.rect(x + dx, y, x + dx + 7, y, '#a88820')
def coat(a, x, y):   # oilskin coat and sou'wester on a hook
    a.rect(x + 5, y, x + 6, y + 2, BRS2)
    a.poly([(x + 1, y + 3), (x + 10, y + 3), (x + 13, y + 30), (x - 2, y + 30)], '#e8c040'); a.rect(x + 5, y + 6, x + 5, y + 28, '#c89c20')
    for yy in range(8, 28, 6): a.put(x + 7, y + yy, '#8a6a10')
    a.poly([(x - 1, y - 2), (x + 12, y - 2), (x + 10, y - 7), (x + 1, y - 7)], '#e8c040'); a.rect(x - 3, y - 2, x + 14, y - 1, '#c89c20')
def rope(a, cx, cy):
    for r in (7, 5, 3):
        for t in range(0, 360, 8):
            a.put(cx + math.cos(math.radians(t)) * r, cy + math.sin(math.radians(t)) * r * .45, '#c8a878' if (t // 8) % 2 else '#a88858')
def crate(a, x, y, w, h):
    a.rect(x, y, x + w, y + h, WD); a.rect(x, y, x + w, y + 1, WD3); a.rect(x + w, y, x + w, y + h, WD2)
    for xx in range(x + 4, x + w, 5): a.rect(xx, y + 2, xx, y + h, WD2)
def plant(a, x, y):
    a.poly([(x - 4, y - 6), (x + 4, y - 6), (x + 3, y), (x - 3, y)], '#d07a45'); a.rect(x - 4, y - 6, x + 4, y - 6, '#f0a071')
    for k in range(5): ang = math.radians(-160 + k * 35); line(a, x, y - 7, x + math.cos(ang) * 6, y - 7 + math.sin(ang) * 6, '#5aa04e'); ell(a, x + math.cos(ang) * 6, y - 7 + math.sin(ang) * 6, 2, 1.3, '#7ac05e')
def books(a, x0, x1, yb, seed):
    r = random.Random(seed); x = x0
    while x < x1 - 2:
        w = r.choice((2, 2, 3)); h = r.randint(5, 8); a.rect(x, yb - h, x + w - 1, yb, r.choice(('#c8463c', '#3e6a9a', '#e0b040', '#5a8a4a', '#8a5aa0'))); x += w

# ---------------- hamster ----------------
_H = json.load(open('ham2.json'))
def put_ham(g, cx, bottom, parts):
    w, h = _H['size'][parts[0]]
    for k in parts:
        for col, d in re.findall(r'<path fill="(#[0-9a-fA-F]{6})" d="([^"]*)"', _H['art'][k]):
            for x, y, ww, hh in re.findall(r'M(-?\d+) (-?\d+)h(\d+)v(\d+)', d):
                for yy in range(int(y), int(y) + int(hh)):
                    for xx in range(int(x), int(x) + int(ww)):
                        X, Y = cx - w // 2 + xx, bottom - h + yy
                        if 0 <= X < g.w and 0 <= Y < g.h: g.p[Y][X] = col
AWAKE = ['body', 'ears_up', 'cheeks_s', 'eyes_happy', 'nose', 'mouth_smile', 'whisk0', 'blush', 'paws_down']

# ---------------- floor 1: the entrance (rocks outside) ----------------
def floor_entrance():
    rnd = random.Random(1); g = G(W, RH); outside(g, 'rocks', rnd); tower_wall(g, True, stripe=RED); hatch_ceiling(g, 'r')
    def door(a):   # the round-topped door with a little window and an iron ring
        a.rect(72, 52, 106, 110, WD2); ell(a, 89, 52, 17, 12, WD2)
        a.rect(75, 54, 103, 110, WD); ell(a, 89, 54, 14, 10, WD)
        for x in range(79, 103, 6): a.rect(x, 50, x, 110, WD2)
        ell(a, 89, 56, 5, 5, SKY2); a.rect(89, 51, 89, 61, BRS2); a.rect(84, 56, 94, 56, BRS2)
        ell(a, 99, 84, 2.4, 2.4, IRN); ell(a, 99, 84, 1.2, 1.2, WD)
    def things(a):
        lifebuoy(a, 50, 50); coat(a, 32, 56); boots(a, 30, 110); rope(a, 60, 104); crate(a, 112, 92, 16, 18); crate(a, 116, 80, 10, 12)
        a.rect(117, 74, 121, 79, IRN); a.rect(116, 73, 122, 73, IRN2); ell(a, 119, 77, 1.4, 1.4, GLOW)   # a storm lantern on the crates
    return comp(g, lay(door), stairs(g, 'r'), lay(things))
# ---------------- floor 2: the chart room with a big round window ----------------
def floor_charts():
    rnd = random.Random(2); g = G(W, RH); outside(g, 'seaview', rnd); tower_wall(g, True); hatch_ceiling(g, 'l')
    def win(a): roundwin(a, 98, 44, 18, lambda x, y: seaview(x, y, 50))
    def desk(a):
        a.rect(70, 82, 128, 85, WD3); a.rect(70, 85, 128, 85, WD2); a.rect(72, 86, 74, 110, WD2); a.rect(124, 86, 126, 110, WD2)
        a.rect(80, 78, 104, 82, CREAM); line(a, 84, 80, 98, 79, '#3e6a9a'); a.put(92, 81, RED)   # the chart
        ell(a, 114, 80, 4, 2, BRS); ell(a, 114, 80, 2, 1, CREAM); a.put(114, 79, RED)                # compass
    def scope(a):   # telescope on a tripod by the window
        a.poly([(130, 50), (148, 40), (150, 44), (132, 54)], BRS); a.poly([(146, 38), (154, 34), (156, 38), (148, 42)], BRS2)
        line(a, 140, 50, 132, 110, IRN); line(a, 140, 50, 148, 110, IRN); line(a, 140, 50, 140, 110, IRN2)
    def shelf(a):   # a shelf with a ship in a bottle and books
        a.rect(48, 40, 74, 42, WD); a.rect(48, 40, 74, 40, WD3)
        ell(a, 60, 36, 9, 3.6, '#cfeaf0'); a.rect(68, 35, 71, 37, '#cfeaf0'); a.rect(56, 34, 62, 37, WD2); a.rect(58, 30, 58, 34, IRN); a.poly([(59, 30), (62, 33), (59, 33)], WHITE)
        books(a, 48, 74, 54, 4); a.rect(48, 55, 74, 57, WD); a.rect(48, 55, 74, 55, WD3)
    return comp(g, lay(win), stairs(g, 'l'), lay(desk), lay(scope), lay(shelf))
# ---------------- floor 3: the keeper's sitting room with a little stove ----------------
def floor_stube():
    rnd = random.Random(3); g = G(W, RH); outside(g, 'seaview', rnd); tower_wall(g, True, stripe=RED); hatch_ceiling(g, 'r')
    def win(a): roundwin(a, 54, 46, 11, lambda x, y: seaview(x, y, 50))
    def stove(a):   # a small black iron stove with a kettle and a stovepipe going up
        a.rect(30, 74, 50, 108, IRN); a.rect(29, 72, 51, 74, IRN2); a.rect(33, 82, 47, 96, '#2a2a32'); ell(a, 40, 90, 4, 3, '#f08a24'); a.put(40, 88, GLOW)
        a.rect(31, 108, 33, 111, IRN); a.rect(47, 108, 49, 111, IRN)
        a.rect(37, 4, 42, 72, IRN2); a.rect(38, 4, 38, 72, '#8a8a96')
        ell(a, 46, 68, 5, 4, '#c8463c'); a.rect(50, 65, 54, 66, '#c8463c'); a.rect(44, 63, 48, 64, IRN)   # the red kettle
    def chair(a):   # a deep armchair with a knitted blanket
        a.rect(96, 72, 126, 104, '#a8c090'); ell(a, 111, 72, 15, 6, '#a8c090'); ell(a, 111, 72, 13, 5, '#c8dcb4'); a.rect(98, 72, 124, 92, '#c8dcb4')
        for x0 in (92, 122): a.rect(x0, 82, x0 + 7, 104, '#a8c090'); a.rect(x0, 82, x0 + 7, 83, '#dce8cc')
        a.rect(100, 88, 120, 96, '#e8706a');
        for x in range(100, 121, 4): a.rect(x, 88, x + 1, 96, '#f8c4c0')
        a.rect(95, 104, 97, 110, WD2); a.rect(121, 104, 123, 110, WD2)
    def rug(a):
        for j, c in enumerate(('#3e6a9a', CREAM, '#d8584a', CREAM, '#3e6a9a')): ell(a, 88, 121, 44 - j * 8, 9 - j * 1.6, c)
    def wallshelf(a):
        a.rect(66, 30, 88, 32, WD); a.rect(66, 30, 88, 30, WD3)
        for k, c in enumerate(('#e8b84a', '#d8584a', '#7ab05a')): a.rect(68 + k * 7, 23, 72 + k * 7, 29, c); a.rect(68 + k * 7, 22, 72 + k * 7, 22, CREAM)
        plant(a, 82, 30)
    L = [lay(win), lay(rug), lay(stove), lay(wallshelf), stairs(g, 'r'), lay(chair)]
    comp(g, *L)
    hg = G(W, RH); put_ham(hg, 72, 118, AWAKE); comp(g, hg)
    return g
# ---------------- floor 4: the bed chamber ----------------
def floor_bed():
    rnd = random.Random(4); g = G(W, RH); outside(g, 'sky', rnd); tower_wall(g, True); hatch_ceiling(g, 'l')
    def win(a): roundwin(a, 120, 40, 10, lambda x, y: SKY2 if y < 44 else SEA3)
    def bed(a):   # a box bed in the curve of the wall with a patchwork quilt
        a.rect(60, 70, 130, 108, WD); a.rect(60, 70, 130, 72, WD3); a.rect(62, 74, 128, 92, '#3e6a9a')
        ell(a, 76, 82, 10, 5, CREAM)
        for y in range(88, 104):
            for x in range(62, 129): a.put(x, y, ('#d8584a', CREAM, '#e8b84a', '#7ab05a')[((x - 62) // 8 + (y - 88) // 5) % 4])
        a.rect(60, 104, 130, 110, WD2)
    def chest(a):
        a.rect(132, 92, 152, 110, '#3e6a9a'); a.rect(131, 88, 153, 92, '#5a8ac0'); a.rect(132, 98, 152, 99, BRS); a.rect(140, 94, 143, 98, BRS2)
    def lamp(a):
        line(a, 92, 5, 92, 30, IRN); a.rect(88, 30, 96, 36, BRS); ell(a, 92, 38, 3, 2, GLOW)
    return comp(g, lay(win), stairs(g, 'l'), lay(bed), lay(chest), lay(lamp))
# ---------------- top: the lantern room ----------------
def lantern():
    g = G(W, RH); rnd = random.Random(5)
    for y in range(RH):
        for x in range(W): g.p[y][x] = SKY3 if y < 40 else SKY2 if y < 90 else SKY
    for (cx, cy) in ((22, 22), (150, 30), (60, 12)): ell(g, cx, cy, 8, 3, '#ffffff'); ell(g, cx + 6, cy - 1, 5, 2.4, '#ffffff')
    def roof(a):
        a.poly([(40, 30), (140, 30), (90, 4)], RED); a.poly([(90, 4), (140, 30), (110, 30)], RED2); a.rect(40, 30, 140, 32, RED2)
        ell(a, 90, 3, 3, 3, IRN); a.rect(89, 0, 90, 2, IRN)
    def glass(a):   # the glazed room: thin iron mullions, sky through the panes
        a.rect(44, 33, 136, 96, '#d6eef8')
        for x in range(44, 137, 15): a.rect(x, 33, x + 1, 96, IRN)
        a.rect(44, 33, 136, 34, IRN); a.rect(44, 95, 136, 96, IRN)
    def lens(a):   # the big lens with rings, glowing
        for r, c in ((22, GLOW), (18, GLOW2), (14, '#fff0b0'), (10, GLOW2), (6, '#ffffff')): ell(a, 90, 62, r * .7, r, c)
        for k in range(-3, 4): a.rect(76, 62 + k * 6, 104, 62 + k * 6, BRS)
        a.rect(80, 86, 100, 96, BRS2); a.rect(82, 88, 98, 94, BRS)
    def gallery(a):   # the walkway outside with a railing
        a.rect(20, 96, 160, 102, IRN); a.rect(20, 96, 160, 96, IRN2)
        a.rect(20, 80, 160, 81, IRN)
        for x in range(22, 160, 7): a.rect(x, 82, x, 95, IRN)
        for y in range(103, 135):   # the top of the tower below, white and red
            hw = 50 + (y - 103) * .3
            for x in range(int(90 - hw), int(90 + hw) + 1): a.put(x, y, RED if (y - 103) // 16 % 2 == 0 else WHITE)
    comp(g, lay(roof), lay(glass), lay(lens), lay(gallery))
    # gulls
    for (x, y) in ((24, 50), (34, 46), (160, 60)): line(g, x - 3, y - 1, x, y, K); line(g, x, y, x + 3, y - 1, K)
    return g

# ---------------- the outside: the lighthouse on its rock (as seen from the lake shore / the map) ----------------
def outside_view():
    g = G(W, RH); rnd = random.Random(8)
    for y in range(RH):
        for x in range(W): g.p[y][x] = SKY3 if y < 30 else SKY2 if y < 70 else (SEA3 if y < 74 else SEA if y < 112 else SEA2)
    for k in range(30): x = rnd.randint(0, 179); y = rnd.randint(80, 130); g.rect(x, y, x + 3, y, SEA3)
    def rocks(a):
        a.poly([(50, 120), (130, 120), (140, 132), (40, 132)], STONE2); a.poly([(60, 106), (120, 106), (134, 122), (46, 122)], STONE); a.rect(60, 106, 120, 108, STONE3)
        a.poly([(118, 112), (150, 112), (156, 126), (116, 126)], STONE2)
    def tower(a):
        for y in range(28, 108):
            hw = 9 + (y - 28) * .14
            for x in range(int(90 - hw), int(90 + hw) + 1):
                band = ((y - 28) // 16) % 2 == 1
                c = RED if band else WHITE
                if x > 90 + hw * .45: c = RED2 if band else WHITE2
                a.put(x, y, c)
        a.rect(86, 92, 93, 107, WD); ell(a, 89.5, 92, 3.6, 3, WD)                 # door
        for (wy) in (50, 70): a.rect(89, wy, 91, wy + 3, '#3e6a9a')                # little windows
        a.rect(76, 26, 104, 28, IRN); for_ = [a.rect(x, 20, x, 25, IRN) for x in range(77, 104, 4)]
        a.rect(82, 14, 98, 26, GLOW); a.rect(82, 14, 98, 14, IRN); for__ = [a.rect(x, 14, x, 26, IRN) for x in (86, 90, 94)]
        a.poly([(80, 14), (100, 14), (90, 5)], RED); a.poly([(90, 5), (100, 14), (94, 14)], RED2); ell(a, 90, 4, 1.6, 1.6, IRN)
        a.rect(70, 104, 84, 106, WD2); a.rect(71, 100, 73, 104, WD2)                # a little jetty post
    comp(g, lay(rocks), lay(tower))
    for r in (6, 10, 14):   # the glow
        for t in range(0, 360, 10):
            x, y = 90 + math.cos(math.radians(t)) * r * 1.4, 20 + math.sin(math.radians(t)) * r * .8
            if 0 <= int(y) < RH and g.p[int(y)][int(x)] in (SKY3, SKY2): g.p[int(y)][int(x)] = GLOW
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
    floors = [('Laterne', lantern()), ('Schlafkammer', floor_bed()), ('Wärterstube', floor_stube()), ('Kartenraum', floor_charts()), ('Eingang', floor_entrance())]
    try: FT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    except Exception: FT = ImageFont.load_default()
    pad = 34; colw = W * S
    sheet = Image.new('RGB', (colw * 2 + 60, len(floors) * (RH * S + pad) + 20), (250, 246, 238)); d = ImageDraw.Draw(sheet)
    d.text((20, 8), 'Außen', fill=(58, 36, 20), font=FT); sheet.paste(img(outside_view(), S), (20, 8 + pad - 6))
    x2 = colw + 40
    for i, (n, gfl) in enumerate(floors):
        y = 8 + i * (RH * S + pad)
        d.text((x2, y), n, fill=(58, 36, 20), font=FT); sheet.paste(img(gfl, S), (x2, y + pad - 6))
    sheet.save('lighthouse_design.png'); print(sheet.size)
