from dlib import *
from PIL import Image
import random
base = Image.open('kitchen1x.png').convert('RGBA')
WALL = (230, 208, 168, 255)
def clear_table(im):
    for y in range(80, 118):
        for x in range(119, 176):
            if y < 99:
                c = WALL
                if (x * 7 + y * 13) % 41 == 0: c = (240, 223, 190, 255)
                im.putpixel((x, y), c)
            else:
                sy = y + 16 if y + 16 < 135 else y + 8
                im.putpixel((x, y), im.getpixel((x, min(134, sy))))
def paste(im, sp, x, y):
    for yy in range(sp.h):
        for xx in range(sp.w):
            c = sp.g[yy][xx]
            if c and 0 <= x + xx < 180 and 0 <= y + yy < 135: im.putpixel((x + xx, y + yy), H(c))
Wd = ['#3a2414', '#7a4e2a', '#a87448', '#c8945a', '#e0b07a', '#f0c890']
def sink_cabinet(style):
    W, Hh = 46, 40; s = S(W, Hh)
    # cabinet body with two doors
    for y in range(14, Hh):
        for x in range(1, W - 1): s.put(x, y, Wd[2] if style == 'wood' else '#f4ead8' if x < W - 4 else '#d8ccb4')
    for d in (0, 1):
        x0 = 3 + d * 21
        for y in range(17, Hh - 2):
            for x in range(x0, x0 + 19):
                edge = x in (x0, x0 + 18) or y in (17, Hh - 3)
                if style == 'wood': s.put(x, y, Wd[1] if edge else (Wd[3] if x < x0 + 3 else Wd[2]))
                else: s.put(x, y, '#c8b490' if edge else ('#ffffff' if x < x0 + 3 else '#efe4cc'))
        s.put(x0 + (16 if d == 0 else 2), 26, '#3a2414'); s.put(x0 + (16 if d == 0 else 2), 27, '#e8d8b0')
    # a striped tea towel hanging on the left door
    for y in range(19, 31):
        for x in range(6, 13): s.put(x, y, '#e8554a' if (y - 19) % 4 < 2 else '#fff8ec')
    # counter top seen a little from above, the basin set into it
    for y in range(6, 14):
        for x in range(0, W): s.put(x, y, Wd[4] if y == 6 else Wd[3] if y < 12 else Wd[1])
    for y in range(7, 12):
        for x in range(8, 36):
            c = '#e8eef4' if style == 'wood' else '#ffffff'
            if 8 < y < 11 and 10 < x < 34: c = '#7a96b0' if y == 9 else '#9ac6e2'
            if y == 8 and 10 < x < 34: c = '#5a646e'
            s.put(x, y, c)
    # brass or chrome tap at the back
    metal = ('#6a4a1a', '#c8a040', '#f0d070') if style == 'wood' else ('#5a6470', '#a8b4c0', '#e0e8f0')
    for k in range(6): s.put(38, 6 - k, metal[1]); s.put(39, 6 - k, metal[0])
    for k in range(6): s.put(38 - k, 0 + (1 if k in (0, 5) else 0), metal[1]); s.put(38 - k, 1 + (1 if k in (0, 5) else 0), metal[0])
    s.put(32, 2, metal[2]); s.put(32, 3, metal[1]); s.put(41, 4, '#c83a2a'); s.put(42, 4, '#c83a2a')
    # a little pile of dirty dishes on the right of the basin: the way into the washing-up game
    p1 = plate(6, col=('#d8d0c4', '#f8f4ec', '#ffffff', '#b8b0a4'), rimc='#6a9ad8', dirt=[(-1, 0, 1.4, '#c8283a')], th=1)
    for yy in range(p1.h):
        for xx in range(p1.w):
            if p1.g[yy][xx]: s.put(34 + xx, 3 + yy, p1.g[yy][xx])
    c1 = cup(col=('#f8f4ec', '#ffffff', '#d8d0c4', '#b8b0a4'), band_='#e8650c', h=5, rx=3)
    for yy in range(c1.h):
        for xx in range(c1.w):
            if c1.g[yy][xx]: s.put(36 + xx, -4 + yy + 3, c1.g[yy][xx])
    s.outline(K); return s
def washstand():
    W, Hh = 40, 40; s = S(W, Hh)
    for x in (4, 34):                               # four turned legs (two seen) and a shelf
        for y in range(12, Hh): s.put(x, y, Wd[3]); s.put(x + 1, y, Wd[1])
    for y in range(28, 31):
        for x in range(4, 36): s.put(x, y, Wd[3] if y == 28 else Wd[2])
    for y in range(9, 13):                          # top board
        for x in range(1, W - 1): s.put(x, y, Wd[4] if y == 9 else Wd[2])
    # an enamel basin on top, white with a blue rim, water inside
    ell(s, 20, 8, 15, 4.5, lambda dx, dy, d: '#3a6aa8' if d > .85 else '#ffffff' if d > .62 else ('#9ac6e2' if dy > -.2 else '#7aaed0'))
    for x in range(6, 35): s.put(x, 10, '#e8eef4'); s.put(x, 11, '#c8d0d8')
    # a jug on the lower shelf and a towel on the side bar
    for y in range(20, 28):
        for x in range(10, 17): s.put(x, y, '#ffffff' if x < 13 else '#d8dce4')
    s.put(17, 22, '#d8dce4'); s.put(17, 23, '#d8dce4')
    for y in range(13, 24):
        for x in range(36, 40): s.put(x, y, '#e8554a' if (y - 13) % 4 < 2 else '#fff8ec')
    # the dirty pile on the right of the basin
    p1 = plate(5, col=('#d8d0c4', '#f8f4ec', '#ffffff', '#b8b0a4'), rimc='#6a9ad8', dirt=[(0, 0, 1.2, '#c8283a')], th=1)
    for yy in range(p1.h):
        for xx in range(p1.w):
            if p1.g[yy][xx]: s.put(28 + xx, 1 + yy, p1.g[yy][xx])
    s.outline(K); return s
def table_small(im, x0, y0):
    # move the original table: copy it from the untouched picture
    src = Image.open('kitchen1x.png').convert('RGBA')
    for y in range(84, 117):
        for x in range(121, 175):
            c = src.getpixel((x, y))
            if y >= 99 and abs(c[0] - 126) + abs(c[1] - 78) + abs(c[2] - 36) > 30 and c[:3] not in ((58, 36, 20), (160, 106, 56), (220, 174, 114), (192, 138, 80), (188, 138, 80), (200, 148, 90), (138, 94, 50)): pass
            # keep only the table pixels: skip wall and floor colours
            if c[:3] in ((230, 208, 168), (240, 223, 190)): continue
            if y >= 100 and c[:3] in ((188, 138, 80), (220, 174, 114), (200, 148, 90)) and not (125 <= x <= 128 or 168 <= x <= 172 or 140 <= x <= 160): continue
            im.putpixel((x - 121 + x0, y - 84 + y0), c)
A = base.copy(); clear_table(A); paste(A, sink_cabinet('wood'), 121, 59)
B = base.copy(); clear_table(B); paste(B, sink_cabinet('white'), 121, 59)
C = base.copy(); clear_table(C); paste(C, washstand(), 124, 59)
o = Image.new('RGB', (720 * 3 + 20, 540), 'white')
for i, im in enumerate((A, B, C)): o.paste(im.resize((720, 540), Image.NEAREST), (i * 730, 0))
o.save('kitchen_sinks.png')
