"""Converts the ten new armchairs into the chair format of the game (like mock2/chairs_new.json):
one entry per id with name, w, h, seat and an SVG of 1px-high rectangles per colour. The new chairs take over the
ids of the old ones, so saved room settings keep working."""
import json, os, sys
from collections import defaultdict
from PIL import Image

MAP = [  # old id -> new chair file
    ('wing_red', '01_ohrensessel_decke.png'), ('egg', '02_rundsessel_senf.png'), ('club', '03_chesterfield.png'),
    ('strandkorb', '04_korbsessel.png'), ('peacock', '05_bluemchen_volant.png'), ('sofa', '06_cordsessel.png'),
    ('rocking', '07_schaukelstuhl.png'), ('beanbag', '08_teddysessel.png'), ('wing_check', '09_grossvatersessel.png'),
    ('velvet', '10_muschelsessel.png'),
]


def to_svg(im):
    im = im.convert('RGBA'); w, h = im.size; p = im.load()
    runs = defaultdict(list)
    for y in range(h):
        x = 0
        while x < w:
            c = p[x, y]
            if c[3] == 0:
                x += 1; continue
            x0 = x
            while x < w and p[x, y] == c:
                x += 1
            runs['#%02x%02x%02x' % c[:3]].append('M%d %dh%dv1h-%dz' % (x0, y, x - x0, x - x0))
    return ''.join('<path fill="%s" d="%s"/>' % (col, ''.join(r)) for col, r in runs.items())


if __name__ == '__main__':
    d = sys.argv[1]
    meta = {m['datei']: m for m in json.load(open(os.path.join(d, 'sessel.json')))}
    out = {}
    for cid, fn in MAP:
        m = meta[fn]
        out[cid] = dict(id=cid, name=m['name'], w='48', h='42', seat=str(m['seat']), svg=to_svg(Image.open(os.path.join(d, fn))))
    json.dump(out, open(os.path.join(d, 'chairs_neu.json'), 'w'), ensure_ascii=False)
    print(len(out), os.path.getsize(os.path.join(d, 'chairs_neu.json')))
