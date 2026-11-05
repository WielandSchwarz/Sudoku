from dlib import *
from PIL import Image
base = Image.open('cafe1x.png').convert('RGBA')
def paste(im, sp, x, y):
    for yy in range(sp.h):
        for xx in range(sp.w):
            c = sp.g[yy][xx]
            if c and 0 <= x + xx < im.width and 0 <= y + yy < im.height: im.putpixel((x + xx, y + yy), H(c))
Wd = ['#3a2414', '#6e4a2e', '#8a5a34', '#a8744a', '#c8945a', '#e0b07a']
def cabinet(style):
    W, Hh = 40, 40; s = S(W, Hh); top = 12
    for y in range(top + 6, Hh):
        for x in range(1, W):
            s.put(x, y, Wd[2] if style == 'wood' else '#9a9a92')
    # door panels / stone front
    if style == 'wood':
        for d in (0, 1):
            x0 = 3 + d * 18
            for y in range(top + 9, Hh - 2):
                for x in range(x0, x0 + 16): s.put(x, y, Wd[1] if x in (x0, x0 + 15) or y in (top + 9, Hh - 3) else (Wd[3] if x < x0 + 3 else Wd[2]))
            s.put(x0 + (13 if d == 0 else 2), top + 18, '#3a2414')
        for y in range(top + 11, top + 22):
            for x in range(6, 12): s.put(x, y, '#e8554a' if (y - top - 11) % 4 < 2 else '#fff8ec')   # tea towel on the door
    else:
        for y in range(top + 6, Hh):
            for x in range(1, W):
                row = (y - top - 6) // 5; xo = 4 * (row % 2)
                g = (y - top - 6) % 5 == 4 or (x + xo) % 9 == 8
                s.put(x, y, '#6a6a62' if g else ('#b8b4a8' if (x // 9 + row) % 2 else '#a8a498'))
    # worktop with the basin let in, seen a little from above
    for y in range(top, top + 6):
        for x in range(0, W): s.put(x, y, Wd[5] if y == top else Wd[4] if y < top + 5 else Wd[1])
    bc = ('#e8eef4', '#7a96b0', '#9ac6e2') if style == 'wood' else ('#c8c4b8', '#6a8aa4', '#8ab8d8')
    for y in range(top + 1, top + 5):
        for x in range(13, 35):
            c = bc[0]
            if top + 1 < y < top + 4 and 15 < x < 33: c = bc[1] if y == top + 2 else bc[2]
            s.put(x, y, c)
    # the dirty pile on the left of the basin
    pl = plate(5, col=('#d8d0c4', '#f8f4ec', '#ffffff', '#b8b0a4'), rimc='#6a9ad8', dirt=[(0, 0, 1.2, '#c8283a')], th=1)
    for k in range(3):
        for yy in range(pl.h):
            for xx in range(pl.w):
                if pl.g[yy][xx]: s.put(1 + xx, top - 4 - k * 2 + yy, pl.g[yy][xx])
    cu = cup(col=('#f8f4ec', '#ffffff', '#d8d0c4', '#b8b0a4'), band_='#e8650c', h=4, rx=2.5)
    for yy in range(cu.h):
        for xx in range(cu.w):
            if cu.g[yy][xx]: s.put(3 + xx, top - 13 + yy, cu.g[yy][xx])
    s.outline(K); return s
def tap(style):
    s = S(14, 14)
    if style == 'wood':
        m = ('#6a4a1a', '#c8a040', '#f0d070')
        for k in range(6): s.put(10, k, m[1]); s.put(11, k, m[0])
        for k in range(7): s.put(10 - k, 6 + (1 if k > 4 else 0), m[1]); s.put(10 - k, 7 + (1 if k > 4 else 0), m[0])
        s.put(4, 9, m[1]); s.put(4, 10, m[0]); s.put(12, 2, '#c83a2a'); s.put(13, 2, '#c83a2a')
    else:   # a green hand pump
        for y in range(1, 14): s.put(9, y, '#3a7a5a'); s.put(10, y, '#2a5a42')
        for k in range(7): s.put(9 - k, 4, '#3a7a5a'); s.put(9 - k, 5, '#2a5a42')
        s.put(2, 6, '#3a7a5a'); s.put(2, 7, '#3a7a5a')
        for k in range(5): s.put(11 + k * .6, 2 - k * .5, '#3a7a5a')
    s.outline(K); return s
out = []
for style in ('wood', 'stone'):
    im = base.copy()
    # clear the old worktable: wall above, panel below
    for y in range(70, 106):
        for x in range(432, 470): im.putpixel((x, y), im.getpixel((x - 60 if y < 103 else x, y)) if False else im.getpixel((x, y)))
    paste(im, cabinet(style), 431, 66)
    paste(im, tap(style), 448, 58)
    out.append(im.crop((290, 0, 470, 135)))
o = Image.new('RGB', (720 * 2 + 20, 540), 'white')
for i, im in enumerate(out): o.paste(im.resize((720, 540), Image.NEAREST), (i * 740, 0))
o.save('cafe_sinks.png')
