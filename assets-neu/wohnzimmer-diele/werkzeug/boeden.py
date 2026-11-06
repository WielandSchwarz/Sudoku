"""Shows every floor of the floor slot (mock2/room3.json) in the new living room, each tile at 1:1.
'Helle Dielen' is shown with the tile the game really uses (interior2 floor_planks, 36x12) at its true size."""
import json, re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from px import render, SP
from scene import FLOOR
from draw import mul

R3 = json.load(open(SP + '../mock2/room3.json'))
N = json.load(open(SP + '../mock2/interior2.json'))


def floors():
    out = []
    for it in R3['floor']:
        svg = N['floor_planks']['tile'] if it['id'] == 'planks' else it['tile']
        vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
        out.append((it['id'], it['name'], render(svg, int(float(vb.group(1))), int(float(vb.group(2))))))
    return out


def refloor(room_im, S, tile, x0=None, floor_y=100):
    """swap the floor wherever the room still shows the old floor (or its 0.875 shadow); x0 = where the slot floor starts"""
    im = room_im.copy(); p = im.load(); tp = tile.load(); tw, th = tile.size
    x0 = S if x0 is None else x0
    fcols = set(FLOOR.getdata()); scols = {mul(c, .875) for c in fcols}
    for y in range(floor_y, im.height):
        for x in range(x0, im.width):
            old = FLOOR.getpixel(((x - S) % 48, (y + 12) % 16))
            new = tp[(x - S) % tw, (y - floor_y) % th]
            if p[x, y] == old:
                p[x, y] = new
            elif p[x, y] == mul(old, .875) or p[x, y] in scols:
                p[x, y] = mul(new, .875)      # furniture shadows that were cut out together with the old floor
            elif p[x, y] in fcols:
                p[x, y] = new
    return im


def refloor_diele(room_im, tile, x1=91, floor_y=100, old=None):
    """swap the hallway floor (fixed checker from furn2 floor 'checker') up to x1"""
    from px import tile as ftile
    old = old or ftile('checker', 'floor')
    im = room_im.copy(); p = im.load(); tp = tile.load(); tw, th = tile.size; op = old.load(); ow, oh = old.size
    for y in range(floor_y, im.height):
        for x in range(0, x1):
            o = op[x % ow, (y - floor_y) % oh]; n = tp[x % tw, (y - floor_y) % th]
            if p[x, y] == o:
                p[x, y] = n
            elif p[x, y] == mul(o, .875):
                p[x, y] = mul(n, .875)
    return im
