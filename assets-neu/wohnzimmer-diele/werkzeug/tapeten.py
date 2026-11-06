"""New wallpaper colours: the current wallpaper tile (interior2.json wall_cream, 16x16, four colours:
ground, diamond motif, light dot, accent) recoloured. Same pattern, new mood. Output: tile PNGs, the SVG tiles in the
game's format and room previews."""
import colorsys, json, os, re
from PIL import Image

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'quellcode', 'mock2', 'interior2.json')
CREAM = ['#f7e6cc', '#efd6b4', '#fbf0de', '#e8c8a0']      # ground, motif, light dot, accent

FARBEN = [  # id, name, ground colour
    ('salbei', 'Salbeigrün', '#dfe6cf'),
    ('altrosa', 'Altrosa', '#f2d9d4'),
    ('himmel', 'Himmelblau', '#d9e6ee'),
    ('butter', 'Buttergelb', '#f7eabf'),
    ('lavendel', 'Lavendel', '#e5def0'),
    ('pfirsich', 'Pfirsich', '#f6dcc6'),
    ('mint', 'Mint', '#d6ede2'),
    ('leinen', 'Leinen', '#e7ddd0'),
    ('tanne', 'Tannengrün', '#5b7860'),
    ('nachtblau', 'Nachtblau', '#46557a'),
]


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def tohex(rgb):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in rgb)


def derive(ground):
    """the three pattern colours from the ground colour, with the same relations as in the cream tile"""
    r, g, b = [v / 255 for v in hx(ground)]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    dark = v < .6
    def mk(sf, vf):
        rr, gg, bb = colorsys.hsv_to_rgb(h, max(0, min(1, s * sf + (0.04 if sf > 1 else 0))), max(0, min(1, v * vf)))
        return tohex((rr * 255, gg * 255, bb * 255))
    if dark:   # on dark wallpaper the motif is lighter than the ground
        return [ground, mk(.9, 1.16), mk(.6, 1.32), mk(1.0, 1.26)]
    return [ground, mk(1.35, .955), mk(.55, 1.025), mk(1.8, .915)]


def tile_svg(cols):
    svg = json.load(open(SRC))['wall_cream']['tile']
    for a, b in zip(CREAM, cols):
        svg = svg.replace('fill="%s"' % a, 'fill="%s"' % b)
    return svg


def tile_png(cols):
    """the tile as an image, built from the cream tile by swapping colours"""
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from scene import WALL
    m = {hx(a): hx(b) for a, b in zip(CREAM, cols)}
    im = WALL.convert('RGB').copy(); p = im.load()
    for y in range(16):
        for x in range(16):
            p[x, y] = m.get(p[x, y], p[x, y])
    return im.convert('RGBA')


def recolor_room(room_im, S, cols, wall_end=97):
    """swap the wallpaper in a finished room image: only pixels that still show the cream wallpaper at their place"""
    from scene import WALL
    new = tile_png(cols)
    im = room_im.copy(); p = im.load()
    for y in range(wall_end):
        for x in range(im.width):
            tx, ty = (x - S + 8) % 16, (y + 8) % 16
            if p[x, y] == WALL.getpixel((tx, ty)):
                p[x, y] = new.getpixel((tx, ty))
    return im


if __name__ == '__main__':
    import sys
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    data = {}
    for tid, name, g in FARBEN:
        cols = derive(g)
        tile_png(cols).save(os.path.join(out, 'tapete_%s.png' % tid))
        data['wall_' + tid] = dict(id=tid, name=name, w=32, h=32, farben=cols, tile=tile_svg(cols))
    json.dump(data, open(os.path.join(out, 'tapeten_neu.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(data))
