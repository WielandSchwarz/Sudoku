# close-up backgrounds for coffee and tea at home: a calm piece of the kitchen wall and its wooden worktop
# (the café's close-ups recoloured, plus a new wall), same pixel size as the café ones
import json, base64, io, math, random
from PIL import Image
TA = json.load(open('../ham2/teaart.json'))
def load(k): return Image.open(io.BytesIO(base64.b64decode(TA[k].split(',')[1]))).convert('RGBA')
def b64(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
K = (58, 36, 20)
PL = [(246, 234, 210), (240, 226, 200), (250, 242, 224)]
WOOD = [(150, 98, 52), (182, 126, 70), (206, 154, 94), (228, 184, 126)]       # the kitchen's honey beech, dark to light
TILE, TILE2, BLUE, BLUE2, GROUT = (250, 247, 238), (236, 232, 222), (112, 156, 204), (78, 116, 172), (210, 200, 182)
rnd = random.Random(4)
def plaster(x, y):
    h = (x * 7 + y * 13 + (x * y) % 11) % 23
    return PL[1] if h == 0 else PL[2] if h == 5 else PL[0]
TILE_TOP = 62
def tile(x, y):   # white tiles with a small blue flower in every other one, as by the kitchen stove
    tx, ty = x % 12, (y - TILE_TOP) % 12
    if tx == 11 or ty == 11: return GROUT
    if tx == 0 or ty == 0: return TILE
    cell = (x // 12 + (y - TILE_TOP) // 12) % 2
    if cell and 4 <= tx <= 7 and 4 <= ty <= 7:
        if (tx, ty) in ((5, 5), (6, 6), (5, 6), (6, 5)): return BLUE2 if (tx + ty) % 2 else (240, 196, 80)
        if tx in (4, 7) and ty in (5, 6) or ty in (4, 7) and tx in (5, 6): return BLUE
    if tx >= 9 or ty >= 9: return TILE2
    return TILE
def wall_px(x, y):
    if y <= 6:   # the ceiling beam
        if y == 6: return K
        return WOOD[3] if y == 0 else WOOD[2] if y < 4 else WOOD[1]
    if y == 7: return (210, 196, 170)
    if y >= TILE_TOP: return tile(x, y)
    if y == TILE_TOP - 1: return (214, 196, 160)
    return plaster(x, y)
def kitchen_wall():
    im = Image.new('RGBA', (180, 135)); p = im.load()
    for y in range(135):
        for x in range(180): p[x, y] = wall_px(x, y) + (255,)
    # a little plate rail on the left with two plates and a cup hook row: calm, only a few things
    for x in range(10, 74):
        p[x, 34] = K; p[x, 35] = WOOD[3]; p[x, 36] = WOOD[2]; p[x, 37] = WOOD[1]; p[x, 38] = K
    for (cx, cy, r) in ((24, 26, 8), (44, 26, 8)):
        for y in range(cy - r - 1, cy + r + 2):
            for x in range(cx - r - 1, cx + r + 2):
                d = math.hypot(x + .5 - cx, y + .5 - cy)
                if y > 34: continue
                if d <= r + .5: p[x, y] = (K if d > r - .5 else BLUE if r - 2.5 < d <= r - 1.5 else (250, 248, 242) if d < r - 3.5 or (x - cx) < -2 else (236, 232, 224)) + (255,)
    for x in (60, 66):   # two hooks with a sieve and a whisk shape
        p[x, 39] = K; p[x, 40] = K
    for y in range(41, 52):
        p[66, y] = K
    for y in range(42, 50):
        for x in range(63, 70):
            if (x - 66) ** 2 / 9 + (y - 46) ** 2 / 16 <= 1: p[x, y] = ((214, 216, 222) if (x + y) % 2 else (180, 182, 190)) + (255,)
    for y in range(41, 50):
        for x in range(56, 65):
            d = math.hypot(x + .5 - 60, y + .5 - 46)
            if d <= 4.5: p[x, y] = (K if d > 3.7 else (120, 124, 132) if (x + y) % 2 else (168, 172, 180)) + (255,)
    return im
def ramp_recolor(im, keep_top=None):
    p = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = p[x, y]
            if a == 0 or (r, g, b) == K: continue
            l = (r * .3 + g * .59 + b * .11)
            i = 0 if l < 105 else 1 if l < 140 else 2 if l < 175 else 3
            p[x, y] = WOOD[i] + (255,)
    return im
def kitchen_counter():
    im = load('bg_counter'); p = im.load(); W, H = im.size
    ramp_recolor(im)
    top = min(yy for yy in range(H) for xx in range(W) if p[xx, yy][3] > 0)
    for yy in range(top + 3, H):   # butcher-block joints on the worktop front
        for xx in range(0, W, 15):
            if p[xx, yy][3] and p[xx, yy][:3] != K: p[xx, yy] = WOOD[1] + (255,)
    return im
def kitchen_shelf():
    im = load('bg_shelf'); p = im.load(); W, H = im.size
    CREAM = {(242, 226, 196), (230, 210, 174), (255, 244, 220)}
    for y in range(H):
        for x in range(W):
            r, g, b, a = p[x, y]
            if a == 0: continue
            c = (r, g, b)
            if c in CREAM: p[x, y] = wall_px(x, y) + (255,)
            elif c != K and abs(r - g) > 30 and r > g > b:   # wood: shelves and brackets
                l = (r * .3 + g * .59 + b * .11); i = 0 if l < 105 else 1 if l < 140 else 2 if l < 175 else 3
                p[x, y] = WOOD[i] + (255,)
    return im
OUT = {'kc_wall': b64(kitchen_wall()), 'kc_counter': b64(kitchen_counter()), 'kc_shelf': b64(kitchen_shelf())}
json.dump(OUT, open('kitchen_closeup.json', 'w'))
prev = Image.new('RGBA', (180 * 3 + 20, 135), (255, 255, 255, 255))
w = kitchen_wall(); w.alpha_composite(kitchen_counter()); prev.paste(w, (0, 0))
prev.paste(kitchen_shelf(), (190, 0)); prev.paste(kitchen_counter(), (380, 0), kitchen_counter())
prev.resize((prev.width * 3, prev.height * 3), Image.NEAREST).save('../bad/kc_prev.png'); print('ok')
