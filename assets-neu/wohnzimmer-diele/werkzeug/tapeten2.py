"""Ten new wallpapers with their own patterns (not just colours). Seamless tiles drawn at 1 room px = 1 image px,
low contrast so the wall stays calm. Output: tile PNGs, SVG tiles in the game's format, room previews."""
import math, os, json, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


class Tile:
    def __init__(self, w, h, ground):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), hx(ground)); self.p = self.im.load()

    def px(self, x, y, c):
        self.p[int(x) % self.w, int(y) % self.h] = hx(c)

    def get(self, x, y):
        return self.p[int(x) % self.w, int(y) % self.h]

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, c)

    def ascii(self, x, y, rows, pal):
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch in pal:
                    self.px(x + i, y + j, pal[ch])


# ------------------------------------------------------------------ the ten patterns
def ranken():
    """trailing vines with little leaves and a few white blossoms, sage"""
    t = Tile(24, 24, '#e2e9d4')
    for off, ph in ((5, 0), (17, math.pi)):
        for y in range(24):
            x = off + round(2.2 * math.sin(2 * math.pi * y / 24 + ph))
            t.px(x, y, '#c2d0aa')
        for y in (3, 11, 19):
            x = off + round(2.2 * math.sin(2 * math.pi * y / 24 + ph))
            s = 1 if (y // 8) % 2 == 0 else -1
            t.px(x + s, y, '#a9bc8e'); t.px(x + 2 * s, y - 1, '#a9bc8e'); t.px(x + 2 * s, y, '#b6c79c')
        y = 7 if ph == 0 else 15
        x = off + round(2.2 * math.sin(2 * math.pi * y / 24 + ph))
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            t.px(x + dx, y + dy, '#f6f4ea')
        t.px(x, y, '#e8cf8a')
    return t


def damast():
    """tone-on-tone damask: oval frames with a four-leaf ornament inside, small diamonds between, dusty rose"""
    t = Tile(24, 32, '#ecd5cf')
    c = '#e0c0b8'; l = '#f3e2dc'
    for cx, cy in ((12, 16), (0, 0)):
        for y in range(-12, 13):
            for x in range(-8, 9):
                e = (x / 7.5) ** 2 + (y / 11.5) ** 2
                if .8 < e <= 1.0:
                    t.px(cx + x, cy + y, c)
        # four leaves around a centre dot
        for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
            for k in range(1, 5):
                t.px(cx + sx * (k // 2 + 1), cy + sy * k, c)
                if k in (2, 3):
                    t.px(cx + sx * (k // 2 + 2), cy + sy * k, c)
        t.px(cx, cy, c); t.px(cx, cy - 1, l); t.px(cx, cy + 1, c)
        t.px(cx, cy - 7, c); t.px(cx, cy - 8, c); t.px(cx, cy + 7, c); t.px(cx, cy + 8, c)
        t.px(cx, cy - 10, l); t.px(cx, cy + 10, l)
    for cx, cy in ((0, 16), (12, 0)):
        for d in range(3):
            t.px(cx + d, cy + 2 - d, c); t.px(cx - d, cy + 2 - d, c); t.px(cx + d, cy - 2 + d, c); t.px(cx - d, cy - 2 + d, c)
    return t


def bonbonstreifen():
    """wide butter-yellow and cream stripes with a thin coral pinstripe and a dotted line"""
    t = Tile(16, 16, '#f9f0dc')
    t.rect(0, 0, 6, 16, '#f3e0b4')
    for y in range(16):
        t.px(8, y, '#e9a594')
        if y % 3 == 0:
            t.px(12, y, '#ffffff')
    return t


def faecher():
    """scallop / fan pattern (art deco), light teal"""
    t = Tile(16, 16, '#d3e6e2')
    for cx0, cy0 in ((0, 0), (8, 8), (16, 0), (0, 16), (16, 16), (8, -8), (8, 24)):
        for y in range(-9, 1):
            for x in range(-9, 10):
                r = math.hypot(x, y)
                xx, yy = cx0 + x, cy0 + y + 8
                if 7.2 < r <= 8.2:
                    t.px(xx, yy, '#a9cdc7')
                elif 4.2 < r <= 5.0:
                    t.px(xx, yy, '#bcd9d4')
                elif r <= 1.2:
                    t.px(xx, yy, '#eef7f5')
    return t


def waldpilze():
    """little red toadstools, acorns and leaves scattered on warm beige"""
    t = Tile(32, 32, '#efe3cf')
    pilz = ["..rrr..", ".rwrrr.", "rrrrwrr", "..cCs..", "..cCs.."]
    eichel = [".bb.", "bbbb", ".aa.", ".aa."]
    blatt = [".g", "gg", "g."]
    P = {'r': '#d9897a', 'w': '#fffaf2', 'c': '#ffffff', 'C': '#fbf5ea', 's': '#d8c4a6', 'b': '#b89270', 'a': '#cfab82', 'g': '#b7c08c'}
    t.ascii(3, 4, pilz, P); t.ascii(19, 20, pilz, P)
    t.ascii(22, 5, eichel, P); t.ascii(6, 21, eichel, P)
    t.ascii(14, 13, blatt, P); t.ascii(29, 14, blatt, P); t.ascii(13, 28, blatt, P)
    return t


def spalier():
    """garden trellis: thin diagonal lattice with tiny rosebuds at the crossings"""
    t = Tile(16, 16, '#e5edd9')
    for i in range(16):
        t.px(i, i, '#c8d6b4'); t.px(i, 15 - i, '#c8d6b4')
    for x, y in ((0, 0), (8, 8)):
        t.px(x, y, '#e8a6ac'); t.px(x + 1, y, '#f0c0c4'); t.px(x, y + 1, '#d89096'); t.px(x - 1, y, '#a9bf90')
    return t


def kirschen():
    """cherry pairs with stems and a leaf on cream"""
    t = Tile(24, 24, '#fbf2e4')
    k = ["...s.l", "..s.ll", ".s..s.", "rr..rr", "rR..rR"]
    P = {'s': '#a88a5a', 'l': '#a7bf86', 'r': '#e07e7a', 'R': '#c8605c'}
    t.ascii(3, 2, k, P); t.ascii(15, 14, k, P)
    return t


def strick():
    """knitted-sweater texture: stacked V-stitches in vertical columns with darker grooves, oatmeal"""
    t = Tile(7, 4, '#d6c3a2')                     # ground = the groove between the stitch columns
    pal = {'L': '#f1e5cf', 'M': '#e5d4b8', 'D': '#dac8a8'}
    t.ascii(0, 0, ["LM..MD", "LMM.MD", ".LMMD.", "..LD.."], pal)
    return t


def bienenwaben():
    """honeycomb as a proper hexagon grid (nearest-centre cells), light honey, a few filled cells"""
    t = Tile(24, 20, '#f7e7bc')
    centres = []
    for r in range(-1, 3):
        for q in range(-1, 4):
            centres.append((q * 12 + (6 if r % 2 else 0), r * 10))
    filled = {(18, 0), (6, 10)}
    for y in range(20):
        for x in range(24):
            ds = sorted((math.hypot((x + .5 - cx) * 1.0, (y + .5 - cy) * 1.15), (cx, cy)) for cx, cy in centres)
            if ds[1][0] - ds[0][0] < 1.1:
                t.px(x, y, '#e8cf92')
            elif (ds[0][1][0] % 24, ds[0][1][1] % 20) in filled:
                t.px(x, y, '#f1d68e')
    t.px(17, 2, '#f9ecc4'); t.px(16, 3, '#f9ecc4'); t.px(5, 12, '#f9ecc4'); t.px(4, 13, '#f9ecc4')
    return t


def backstein():
    """soft brick wall in pale terracotta with light mortar, a few lighter bricks"""
    t = Tile(24, 12, '#eedfcc')
    cols = ['#e3b9a2', '#ddb099', '#e7c2ad']
    for row in range(2):
        y0 = row * 6
        off = 0 if row == 0 else 6
        for i in range(2):
            x0 = off + i * 12
            c = cols[(row * 2 + i) % 3]
            for yy in range(y0, y0 + 5):
                for xx in range(x0, x0 + 11):
                    t.px(xx, yy, c)
            t.px(x0 + 1, y0, '#ecccb8'); t.px(x0 + 2, y0, '#ecccb8')
            t.px(x0 + 9, y0 + 4, '#d4a48c')
    return t


ALL = [
    ('ranken', 'Grüne Ranken', ranken), ('damast', 'Rosé-Damast', damast), ('bonbon', 'Bonbonstreifen', bonbonstreifen),
    ('faecher', 'Fächermuster', faecher), ('pilze', 'Waldpilze', waldpilze), ('spalier', 'Rosenspalier', spalier),
    ('kirschen', 'Kirschen', kirschen), ('strick', 'Strickmuster', strick), ('waben', 'Bienenwaben', bienenwaben),
    ('backstein', 'Backstein', backstein),
]


def to_svg(im):
    from collections import defaultdict
    w, h = im.size; p = im.load(); runs = defaultdict(list)
    for y in range(h):
        x = 0
        while x < w:
            c = p[x, y]; x0 = x
            while x < w and p[x, y] == c:
                x += 1
            runs['#%02x%02x%02x' % c[:3]].append('M%d %dh%dv1h-%dz' % (x0, y, x - x0, x - x0))
    body = ''.join('<path fill="%s" d="%s"/>' % (c, ''.join(r)) for c, r in runs.items())
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" shape-rendering="crispEdges">%s</svg>'
            % (w, h, w, h, body))


def recolor_room(room_im, S, tile, wall_end=97):
    from scene import WALL
    im = room_im.copy(); p = im.load(); tp = tile.load(); tw, th = tile.size
    for y in range(wall_end):
        for x in range(im.width):
            if p[x, y] == WALL.getpixel(((x - S + 8) % 16, (y + 8) % 16)):
                p[x, y] = tp[(x - S) % tw, y % th]
    return im


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    data = {}
    for tid, name, f in ALL:
        t = f()
        t.im.save(os.path.join(out, 'tapete_%s.png' % tid))
        data['wall_' + tid] = dict(id=tid, name=name, w=t.w * 2, h=t.h * 2, tile=to_svg(t.im))
    json.dump(data, open(os.path.join(out, 'tapeten_neu.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(data))
