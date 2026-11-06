"""New floors: 10 for the living room (woods and carpets) and 6 for the hallway (tiles and stone).
Seamless tiles at 1 room px = 1 image px (shown 1:1, w/h = 2x tile size like the other entries)."""
import math, os, json, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tapeten2 import Tile, hx, to_svg


def shade(c, f):
    r, g, b, a = hx(c)
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(v * f))) for v in (r, g, b))


# ------------------------------------------------------------------ boards
def planks(w, rowh, joints, base, seed=1, grain=.9, gap=.62, light=1.08, knots=0, nails=True, var=(.94, 1.0, 1.05)):
    """horizontal floorboards: rows of height rowh, joints[i] = x positions of board ends in row i"""
    rows = len(joints)
    t = Tile(w, rowh * rows, base)
    rnd = random.Random(seed)
    for r, js in enumerate(joints):
        y0 = r * rowh
        js = sorted(js)
        bounds = list(zip(js, js[1:] + [js[0] + w]))
        for bi, (a, b) in enumerate(bounds):
            f = var[(r * 3 + bi) % len(var)]
            col = shade(base, f)
            for y in range(y0, y0 + rowh):
                for x in range(a, b):
                    t.px(x, y, col)
            for y in range(y0 + 1, y0 + rowh - 1):          # grain streaks
                x = a + rnd.randint(1, 6)
                while x < b - 3:
                    ln = rnd.randint(4, 14)
                    for k in range(ln):
                        if x + k < b - 1:
                            t.px(x + k, y, shade(col, grain))
                    x += ln + rnd.randint(6, 16)
            for x in range(a, b):                            # top highlight, bottom gap
                t.px(x, y0, shade(col, light))
                t.px(x, y0 + rowh - 1, shade(base, gap))
            for y in range(y0, y0 + rowh):                   # board end
                t.px(a, y, shade(base, gap))
            if nails:
                for nx in (a + 2, b - 3):
                    t.px(nx, y0 + 2, shade(base, .7)); t.px(nx, y0 + rowh - 3, shade(base, .7))
            for _ in range(knots):
                kx = rnd.randint(a + 6, max(a + 7, b - 8)); ky = y0 + rowh // 2
                t.px(kx, ky, shade(col, .6)); t.px(kx + 1, ky, shade(col, .72)); t.px(kx - 1, ky, shade(col, .8))
                t.px(kx, ky - 1, shade(col, .85)); t.px(kx + 2, ky, shade(col, .88)); t.px(kx - 2, ky, shade(col, .9))
    return t


def chevron(base, cw=8, sw=4, seed=3, var=(.92, 1.0, 1.06, .97)):
    """chevron parquet: columns of slanted slats, direction alternating per column"""
    w, h = cw * 2, sw * 2 * 2
    t = Tile(w * 1, cw * 2, base)
    for y in range(t.h):
        for x in range(t.w):
            col = x // cw; lx = x % cw
            off = lx if col % 2 == 0 else cw - 1 - lx
            k = (y + off)
            slat = (k // sw)
            c = shade(base, var[(slat + col * 2) % len(var)])
            if k % sw == 0:
                c = shade(base, .7)
            elif k % sw == 1:
                c = shade(c, 1.07)
            t.px(x, y, c)
    return t


def tafelparkett(base, n=8, seed=4, var=(.93, 1.0, 1.06, .97)):
    """basket weave: squares of n px, alternately with horizontal and vertical slats of 2 px"""
    t = Tile(n * 2, n * 2, base)
    for y in range(n * 2):
        for x in range(n * 2):
            sq = (x // n + y // n) % 2
            lx, ly = x % n, y % n
            k = ly if sq == 0 else lx
            slat = k // 2
            c = shade(base, var[(slat + sq * 2 + (x // n) * 3) % len(var)])
            if k % 2 == 1:
                c = shade(c, .9)
            if lx == 0 or ly == 0:
                c = shade(base, .72)
            t.px(x, y, c)
    return t


def sisal(base):
    """woven sisal: twill weave with a slightly stronger weft line every 4 rows"""
    t = Tile(8, 8, base)
    for y in range(8):
        for x in range(8):
            k = ((x + y) // 2) % 2
            c = shade(base, 1.05 if k else .93)
            if y % 4 == 3:
                c = shade(base, .88 if x % 2 else .96)
            t.px(x, y, c)
    return t


def teppich(base, motif, seed=7, size=16):
    """soft velour carpet: gentle noise and a small repeating motif"""
    t = Tile(size, size, base)
    rnd = random.Random(seed)
    for y in range(size):
        for x in range(size):
            r = rnd.random()
            if r < .12:
                t.px(x, y, shade(base, .95))
            elif r < .2:
                t.px(x, y, shade(base, 1.04))
    motif(t)
    return t


def kleine_raute(c):
    def f(t):
        for (x, y) in ((8, 6), (7, 7), (9, 7), (8, 8)):
            t.px(x, y, c)
        t.px(0, 0, c); t.px(0, 15, c); t.px(15, 0, c); t.px(15, 15, c) if False else None
    return f


def spalierlinien(c):
    def f(t):
        for i in range(16):
            if i % 2 == 0:
                t.px(i, i, c); t.px(i, 15 - i, c)
    return f


# ------------------------------------------------------------------ hallway tiles
def schachbrett_marmor():
    t = Tile(16, 16, '#efe9dc')
    rnd = random.Random(11)
    for y in range(16):
        for x in range(16):
            dark = ((x // 8) + (y // 8)) % 2
            c = '#4c4c56' if dark else '#efe9dc'
            if (x + y * 2) % 9 == 0 and rnd.random() < .7:          # soft marble veins
                c = '#5e5e6a' if dark else '#e2dccd'
            if x % 8 == 7 or y % 8 == 7:
                c = '#cfc8b8' if not dark else '#3c3c44'
            t.px(x, y, c)
    return t


def zementfliese(ground='#f1e9d8', main='#5f86a6', light='#a9c4d8', grout='#d6ccb8'):
    """encaustic cement tile, 16 px: four-leaf flower in the middle, quarter flowers in the corners make a rosette"""
    t = Tile(16, 16, ground)
    for y in range(16):
        for x in range(16):
            dx, dy = x - 7.5, y - 7.5
            r = math.hypot(dx, dy); a = math.atan2(dy, dx)
            petal = r < 3.2 + 2.2 * abs(math.cos(2 * a))
            if petal and r > 1.2:
                t.px(x, y, main if r > 2.3 else light)
            elif r <= 1.2:
                t.px(x, y, '#e7b85a')
            cx, cy = min(x, 15 - x), min(y, 15 - y)              # corner quarter circles
            if math.hypot(cx + .5, cy + .5) < 3.2 and not petal:
                t.px(x, y, light)
            if abs(abs(dx) - abs(dy)) < .6 and 4.2 < r < 6.6:     # thin diagonal lines towards the corners
                t.px(x, y, main)
            if x == 15 or y == 15:
                t.px(x, y, grout)
    return t


def tomettes():
    """hexagonal terracotta tiles (tomettes) with light grout, colours varying per tile"""
    t = Tile(24, 20, '#d9c6ad')
    cols = ['#c66a46', '#b85e3e', '#cf7752', '#bf6844']
    centres = [(q * 12 + (6 if r % 2 else 0), r * 10) for r in range(-1, 3) for q in range(-1, 4)]
    for y in range(20):
        for x in range(24):
            ds = sorted((math.hypot(x + .5 - cx, (y + .5 - cy) * 1.15), (cx, cy)) for cx, cy in centres)
            if ds[1][0] - ds[0][0] < 1.0:
                continue
            cx, cy = ds[0][1]
            i = ((cx // 6) * 7 + (cy // 10) * 3) % len(cols)
            c = cols[i]
            if ds[0][0] < 2.0 and (x + y) % 3 == 0:
                c = shade(c, 1.08)
            t.px(x, y, c)
    return t


def schiefer():
    """slate slabs 16x8, staggered, cool grey-blue with fine texture"""
    t = Tile(32, 16, '#a8a8a0')
    cols = ['#5d6672', '#66707c', '#58616c', '#6c7682']
    rnd = random.Random(21)
    for row in range(2):
        off = 0 if row == 0 else 8
        for i in range(2):
            c = cols[(row * 2 + i) % 4]
            x0 = off + i * 16; y0 = row * 8
            for y in range(y0, y0 + 7):
                for x in range(x0, x0 + 15):
                    cc = c
                    r = rnd.random()
                    if r < .1:
                        cc = shade(c, 1.1)
                    elif r < .18:
                        cc = shade(c, .9)
                    if y == y0:
                        cc = shade(c, 1.15)
                    t.px(x, y, cc)
    return t


def hexmosaik():
    """small white hexagon mosaic (6 px stones) with little blue-green flowers"""
    t = Tile(36, 36, '#c8c2b4')
    centres = [(q * 6 + (3 if r % 2 else 0), r * 6) for r in range(-1, 8) for q in range(-1, 8)]
    flower_c = {(18, 24)}                       # one rosette per tile
    for y in range(36):
        for x in range(36):
            ds = sorted((math.hypot(x + .5 - cx, (y + .5 - cy) * .9), (cx, cy)) for cx, cy in centres)
            if ds[1][0] - ds[0][0] < .9:
                continue
            cx, cy = ds[0][1]
            c = '#f6f3ec'
            for fx, fy in flower_c:
                dd = math.hypot(cx - fx, cy - fy)
                if dd < .1:
                    c = '#e8b84e'
                elif dd < 7.2:
                    c = '#6f9fa0'
            if ds[0][0] < 1.6 and c == '#f6f3ec' and (x + y) % 4 == 0:
                c = '#ffffff'
            t.px(x, y, c)
    return t


def ziegel_fischgraet():
    t = chevron('#c27a5a', cw=8, sw=4, var=(.92, 1.0, 1.06, .96))
    return t


# ------------------------------------------------------------------ catalogue
WOHN = [
    ('eiche', 'Honig-Eiche', lambda: planks(64, 8, [[0], [32]], '#d7a46a', seed=2)),
    ('walnuss', 'Walnuss breit', lambda: planks(64, 10, [[0], [40]], '#7a5034', seed=5, light=1.12)),
    ('weissgeoelt', 'Weiß geölt', lambda: planks(64, 8, [[0], [24]], '#e6dccb', seed=7, grain=.95, gap=.78, light=1.03)),
    ('kirsch', 'Kirsche schmal', lambda: planks(48, 6, [[0], [16], [32]], '#b86a48', seed=9, nails=False)),
    ('kiefer', 'Kiefer mit Ästen', lambda: planks(64, 9, [[0], [36]], '#dcae6c', seed=13, knots=1)),
    ('chevron', 'Chevron-Eiche', lambda: chevron('#cf9a62')),
    ('tafel', 'Tafelparkett', lambda: tafelparkett('#c8925c')),
    ('sisal', 'Sisal', lambda: sisal('#d8c49a')),
    ('rosateppich', 'Altrosa Teppich', lambda: teppich('#e2b4b0', kleine_raute('#ecc6c2'))),
    ('salbeiteppich', 'Salbei-Teppich', lambda: teppich('#a8b894', spalierlinien('#b6c4a2'))),
]
DIELE = [
    ('schachbrett', 'Schachbrett Marmor', schachbrett_marmor),
    ('zement_blau', 'Zementfliesen Blau', zementfliese),
    ('zement_gruen', 'Zementfliesen Grün', lambda: zementfliese('#f1e8d6', '#6f9466', '#b4cca6')),
    ('tomettes', 'Terrakotta-Sechsecke', tomettes),
    ('schiefer', 'Schieferplatten', schiefer),
    ('mosaik', 'Sechseck-Mosaik', hexmosaik),
]


# ------------------------------------------------------------------ round 2 of floors
def wuerfel(top='#e4c290', left='#b88956', right='#8c623e'):
    """tumbling blocks: inlaid parquet that looks like stacked cubes (2:1 isometric, cube 16 wide)"""
    t = Tile(16, 24, left)
    for y in range(24):
        for x in range(16):
            c = None
            for j in range(-2, 4):
                for i in range(-2, 3):
                    ox = i * 16 + (j % 2) * 8; oy = j * 12
                    lx, ly = x + .5 - ox, y + .5 - oy
                    if abs(lx - 8) / 8 + abs(ly - 4) / 4 <= 1:
                        c = top
                    elif 0 <= lx < 8 and 4 + lx / 2 <= ly < 12 + lx / 2:
                        c = left
                    elif 8 <= lx < 16 and 4 + (16 - lx) / 2 <= ly < 12 + (16 - lx) / 2:
                        c = right
                    if c:
                        break
                if c:
                    break
            t.px(x, y, c or left)
    src = t.im.copy().load()
    for y in range(24):
        for x in range(16):
            c = src[x, y]
            if src[(x + 1) % 16, y] != c or src[x, (y + 1) % 24] != c:
                t.px(x, y, shade('#%02x%02x%02x' % c[:3], .86))
    return t


def kork(base='#c79a68'):
    t = Tile(16, 16, base)
    rnd = random.Random(31)
    for y in range(16):
        for x in range(16):
            r = rnd.random()
            if r < .18:
                t.px(x, y, shade(base, .82))
            elif r < .3:
                t.px(x, y, shade(base, 1.1))
            elif r < .33:
                t.px(x, y, shade(base, .66))
    return t


def terrazzo(base='#ece4d6'):
    t = Tile(24, 24, base)
    rnd = random.Random(41)
    chips = ['#c89a86', '#9aa8a0', '#d8c088', '#b0a8a0', '#e0b0a0']
    for _ in range(26):
        x, y = rnd.randrange(24), rnd.randrange(24); c = rnd.choice(chips)
        t.px(x, y, c)
        if rnd.random() < .5:
            t.px(x + 1, y, c)
        if rnd.random() < .3:
            t.px(x, y + 1, shade(c, .9))
    return t


def kelim(cols=('#d9a08a', '#efe2c8', '#9fb39a', '#efe2c8', '#c8b07a', '#efe2c8')):
    """flat-woven striped rug with small zigzags in the wide stripes"""
    t = Tile(16, 24, cols[1])
    hs = [5, 3, 5, 3, 5, 3]
    y = 0
    for c, h in zip(cols, hs):
        for yy in range(y, y + h):
            for x in range(16):
                t.px(x, yy, c)
        if h == 5:
            for x in range(16):
                t.px(x, y + 2 + (1 if (x // 2) % 2 else -1), shade(c, 1.12))
        y += h
    return t


def berber(base='#efe6d4', line='#b8946a'):
    t = Tile(16, 16, base)
    rnd = random.Random(51)
    for y in range(16):
        for x in range(16):
            if rnd.random() < .1:
                t.px(x, y, shade(base, .95))
    for i in range(8):
        for (x, y) in ((8 + i, i), (8 - i, i), (8 + i, 15 - i), (8 - i, 15 - i)):
            t.px(x, y, line)
    t.px(8, 8, line)
    return t


def sternteppich(base='#7d93b4', star='#e8d8a0'):
    t = teppich(base, lambda tt: None, seed=61)
    for cx, cy in ((4, 4), (12, 12)):
        for (dx, dy) in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
            tt = (cx + dx, cy + dy); t.px(*tt, star)
    return t


WOHN2 = [
    ('raeuchereiche', 'Räuchereiche', lambda: planks(64, 9, [[0], [28]], '#8a7262', seed=71, light=1.1)),
    ('esche', 'Esche hell schmal', lambda: planks(48, 6, [[0], [20], [36]], '#ead2a8', seed=73, gap=.75, nails=False)),
    ('altholz', 'Altholz bunt', lambda: planks(64, 8, [[0, 40], [20]], '#b88a5a', seed=75, var=(.78, 1.0, 1.18, .9, 1.08), knots=1)),
    ('graublau', 'Dielen graublau gestrichen', lambda: planks(64, 9, [[0], [32]], '#9fb0b8', seed=77, grain=.96, gap=.72, light=1.06)),
    ('wuerfel', 'Würfelparkett', wuerfel),
    ('kork', 'Kork', kork),
    ('terrazzo', 'Terrazzo', terrazzo),
    ('kelim', 'Kelim-Streifen', kelim),
    ('berber', 'Berber-Teppich', berber),
    ('sternteppich', 'Blauer Sternenteppich', sternteppich),
]


def rauten(a='#c8604a', b='#efe4d0', grout='#d8c8b0'):
    """diagonal checkerboard (diamonds)"""
    t = Tile(16, 16, b)
    for y in range(16):
        for x in range(16):
            u, v = (x + y) % 16, (x - y) % 16
            c = a if ((u // 8) + (v // 8)) % 2 else b
            if u % 8 == 0 or v % 8 == 0:
                c = grout
            t.px(x, y, c)
    return t


def kiesel():
    t = Tile(24, 24, '#b8ab98')
    rnd = random.Random(81)
    cols = ['#e2dccf', '#cfc6b6', '#bfb3a0', '#d8cbb5', '#a8a090']
    for _ in range(60):
        cx, cy = rnd.uniform(0, 24), rnd.uniform(0, 24); rx, ry = rnd.uniform(1.2, 2.6), rnd.uniform(.9, 1.8); c = rnd.choice(cols)
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1:
                    t.px(x, y, shade(c, 1.08) if y < cy - ry * .3 else c)
    return t


def sandstein():
    """irregular warm sandstone flags"""
    t = Tile(32, 24, '#cdb89a')
    rects = [(0, 0, 13, 9), (14, 0, 31, 7), (0, 10, 9, 23), (10, 10, 22, 17), (23, 8, 31, 16), (10, 18, 22, 23), (23, 17, 31, 23)]
    cols = ['#e6cfa6', '#dcc298', '#e9d6b2', '#d6bb90']
    rnd = random.Random(91)
    for i, (x0, y0, x1, y1) in enumerate(rects):
        c = cols[i % len(cols)]
        for y in range(y0, y1):
            for x in range(x0, x1):
                cc = c
                if rnd.random() < .12:
                    cc = shade(c, .94)
                if y == y0:
                    cc = shade(c, 1.06)
                t.px(x, y, cc)
    return t


def achteck():
    """classic hallway tiles: white octagons with small dark square inserts"""
    t = Tile(12, 12, '#d4ccbc')
    for y in range(12):
        for x in range(12):
            dx, dy = abs(x - 5.5), abs(y - 5.5)
            if dx <= 5 and dy <= 5 and dx + dy <= 7.5:
                t.px(x, y, '#f4efe4' if (dx + dy < 6.5) else '#e4ddcf')
    for (x, y) in ((11, 11), (0, 11), (11, 0), (0, 0), (1, 0), (0, 1), (11, 1), (1, 11), (10, 0), (0, 10), (10, 11), (11, 10)):
        t.px(x, y, '#3e4652')
    return t


def holzpflaster():
    """end-grain wood blocks in a brick bond, with growth rings"""
    t = Tile(24, 16, '#6a4a30')
    cols = ['#b88a5a', '#a87a4c', '#c4986a']
    for row in range(2):
        off = 0 if row == 0 else 6
        for i in range(2):
            x0 = off + i * 12; y0 = row * 8; c = cols[(row + i) % 3]
            for y in range(y0, y0 + 7):
                for x in range(x0, x0 + 11):
                    r = math.hypot(x - (x0 + 5), (y - (y0 + 3)) * 1.4)
                    t.px(x, y, shade(c, .88) if int(r) % 2 else c)
    return t


def zement_stern(ground='#f0e6d2', main='#c9784e', light='#e8b878', grout='#d6ccb8'):
    """cement tile with an eight-pointed star"""
    t = Tile(16, 16, ground)
    for y in range(16):
        for x in range(16):
            dx, dy = x - 7.5, y - 7.5
            sq, di = max(abs(dx), abs(dy)), abs(dx) + abs(dy)
            if sq < 3.6 or di < 6.4:
                t.px(x, y, light if (sq < 2.4 and di < 3.8) else main)
            if max(abs(dx), abs(dy)) < 1.2:
                t.px(x, y, ground)
            if x == 15 or y == 15:
                t.px(x, y, grout)
    return t


DIELE2 = [
    ('rauten', 'Rauten rot-creme', rauten),
    ('kiesel', 'Kieselmosaik', kiesel),
    ('sandstein', 'Sandsteinplatten', sandstein),
    ('achteck', 'Achteckfliesen mit Einleger', achteck),
    ('holzpflaster', 'Holzpflaster', holzpflaster),
    ('klinker', 'Klinker im Fischgrät', ziegel_fischgraet),
    ('zement_stern', 'Zementfliesen Stern', zement_stern),
    ('zement_rosa', 'Zementfliesen Rosa', lambda: zementfliese('#f3e6dc', '#c97a86', '#e8b4b8')),
]


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    data = {'wohnraum': {}, 'diele': {}}
    for kind, items in (('wohnraum', WOHN + WOHN2), ('diele', DIELE + DIELE2)):
        for fid, name, f in items:
            t = f()
            t.im.save(os.path.join(out, '%s_%s.png' % (kind, fid)))
            data[kind][fid] = dict(id=fid, name=name, w=t.w * 2, h=t.h * 2, tile=to_svg(t.im))
    json.dump(data, open(os.path.join(out, 'boeden_neu.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(data['wohnraum']), len(data['diele']))
