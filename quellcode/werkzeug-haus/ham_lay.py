# the game's hamster, rasterised at the room's pixel size (1 hamster pixel = 1 room pixel in the bedroom)
import json, re
_H = json.load(open('../ham2/ham2.json'))
def ham_grid(parts):
    w, h = _H['size'][parts[0]]; grid = [[None] * w for _ in range(h)]
    for k in parts:
        for col, d in re.findall(r'<path fill="(#[0-9a-fA-F]{6})" d="([^"]*)"', _H['art'][k]):
            for x, y, ww, hh in re.findall(r'M(-?\d+) (-?\d+)h(\d+)v(\d+)', d):
                x, y, ww, hh = int(x), int(y), int(ww), int(hh)
                for yy in range(y, y + hh):
                    for xx in range(x, x + ww):
                        if 0 <= yy < h and 0 <= xx < w: grid[yy][xx] = col
    return grid
SLEEP = ['body', 'ears_flat', 'cheeks_s', 'eyes_sleep', 'nose', 'mouth_flat', 'whisk0', 'blush', 'paws_down']
def put_ham(g, pal, cx, bottom, parts=SLEEP):
    gr = ham_grid(parts); h = len(gr); w = len(gr[0])
    for y in range(h):
        for x in range(w):
            c = gr[y][x]
            if c: pal.setdefault('h' + c, c); X, Y = cx - w // 2 + x, bottom - h + y
            if c and 0 <= X < g.w and 0 <= Y < g.h: g.p[Y][X] = 'h' + c
