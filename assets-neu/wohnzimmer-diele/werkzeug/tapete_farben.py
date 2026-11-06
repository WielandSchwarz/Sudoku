"""Own colours for every wallpaper: two choices in the furniture menu, ground colour and pattern colour.
Works for every tile SVG (old and new wallpapers) without extra data:
- ground = the colour that covers most of the tile; it is replaced by the chosen ground colour.
- pattern = all other colours; the mean pattern colour moves towards the chosen pattern colour, but keeps the
  original contrast to the ground (x1.4). Light dots and dark lines keep their offset, so details stay.
The same algorithm is in tapete_farben.js for the game."""
import colorsys, re
from collections import Counter

GRUND = [  # first entry None = original colours
    None, '#f7ead2', '#fbf8f2', '#dfe6cf', '#f2d9d4', '#d9e6ee', '#f7eabf', '#e5def0', '#5b7860', '#46557a']
GRUND_NAMEN = ['Original', 'Creme', 'Weiß', 'Salbei', 'Altrosa', 'Himmelblau', 'Butter', 'Lavendel', 'Tannengrün', 'Nachtblau']
MUSTER = [
    None, '#b08a68', '#e2a0a8', '#d07068', '#9ab884', '#8aa8c8', '#e0b860', '#b0a0cc', '#ffffff', '#6a5a50']
MUSTER_NAMEN = ['Original', 'Haselnuss', 'Rosa', 'Kirschrot', 'Blattgrün', 'Taubenblau', 'Honig', 'Flieder', 'Weiß', 'Mokka']


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))


def tohex(rgb):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(v * 255 + .5))) for v in rgb)


def colours(svg):
    """colour -> pixel count, read from the 1px-rectangle paths (h = width of each run)"""
    cnt = Counter()
    for m in re.finditer(r'<path fill="(#[0-9a-fA-F]{6})" d="([^"]+)"', svg):
        cnt[m.group(1).lower()] += sum(int(w) for w in re.findall(r'h(\d+)v1', m.group(2)))
    return cnt


def mapping(svg, grund=None, muster=None):
    """ground -> grund. Pattern colours are described relative to the ground: a share 'alpha' along the line from the
    ground to the mean pattern colour, plus a remainder (light dots, dark lines). With a new pattern colour the mean
    pattern colour moves towards it, but only as far as the original contrast (x1.4), so calm wallpapers stay calm."""
    cnt = colours(svg)
    ground = cnt.most_common(1)[0][0]
    pats = [c for c in cnt if c != ground]
    m = {}
    g0 = hx(ground)
    gn = hx(grund) if grund else g0
    if grund:
        m[ground] = grund
    if muster and pats:
        w = sum(cnt[c] for c in pats)
        m0 = tuple(sum(hx(c)[k] * cnt[c] for c in pats) / w for k in range(3))
        D = tuple(m0[k] - g0[k] for k in range(3))
        dl2 = sum(v * v for v in D)
        pn = hx(muster)
        dr = tuple(pn[k] - gn[k] for k in range(3))
        pl = sum(v * v for v in dr) ** .5
        sc = min(1.0, (dl2 ** .5) * 1.4 / pl) if pl > 0 else 0.0
        mn = tuple(gn[k] + dr[k] * sc for k in range(3))
        for c in pats:
            cv = hx(c)
            a = (sum((cv[k] - g0[k]) * D[k] for k in range(3)) / dl2) if dl2 > 0 else 1.0
            nc = tuple(gn[k] + a * (mn[k] - gn[k]) + (cv[k] - (g0[k] + a * D[k])) for k in range(3))
            m[c] = tohex(nc)
    return m


def recolor_svg(svg, grund=None, muster=None):
    m = mapping(svg, grund, muster)
    return re.sub(r'fill="(#[0-9a-fA-F]{6})"', lambda mm: 'fill="%s"' % m.get(mm.group(1).lower(), mm.group(1)), svg)
