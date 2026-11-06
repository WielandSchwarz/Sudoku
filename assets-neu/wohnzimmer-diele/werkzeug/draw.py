"""Small pixel-art toolkit: every object is drawn on its own layer at 1 room pixel = 1 image pixel,
then gets a 1px ink outline around its silhouette."""
from PIL import Image

def C(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

INK = C('3a2414')
T = (0, 0, 0, 0)

# palette taken from the existing furniture
P = {
    'ink': INK, 'ink2': C('2b1d12'),
    'wd0': C('3e2410'), 'wd1': C('4e3018'), 'wd2': C('764a22'), 'wd3': C('9a6634'), 'wd4': C('ba844a'), 'wd5': C('d8a868'),
    'bw1': C('6e4428'), 'bw2': C('8a5a34'), 'bw3': C('a87448'), 'bw4': C('c8905a'), 'bw5': C('dcae78'),
    'br1': C('8a6420'), 'br2': C('b8862a'), 'br3': C('e9b949'), 'br4': C('fbe2a0'), 'br5': C('fff6d8'),
    'r1': C('8a2822'), 'r2': C('a8342c'), 'r3': C('c8463c'), 'r4': C('e0645a'), 'r5': C('f08a7e'),
    'g1': C('2e5c30'), 'g2': C('3e7c3c'), 'g3': C('5aa04e'), 'g4': C('8cc86a'),
    'u1': C('2a4a5a'), 'u2': C('36606e'), 'u3': C('4e7a8a'), 'u4': C('7aa6b4'), 'u5': C('b4d4dc'),
    'c1': C('d4c8b2'), 'c2': C('e6dccb'), 'c3': C('fff8ec'), 'c4': C('ffffff'),
    'k1': C('1e1616'), 'k2': C('2a2a2a'), 'k3': C('3a3434'), 'k4': C('5a5252'),
    'o1': C('a85a2a'), 'o2': C('c8744a'), 'o3': C('e8955a'), 'o4': C('f6c08a'),
    'y1': C('c89a3a'), 'y2': C('f0c040'), 'y3': C('f8de78'),
    'sky': C('bfe0f0'), 'sky2': C('9ccce4'),
    'mint1': C('7ab8a0'), 'mint2': C('a8d8c4'), 'mint3': C('d4f0e4'),
    'pk1': C('c8607a'), 'pk2': C('e88a9c'), 'pk3': C('f4b4c0'),
    'lav1': C('6a5a8a'), 'lav2': C('8a7ab0'), 'lav3': C('b4a8d4'),
    'gl1': C('9cc4d0'), 'gl2': C('c8e4ec'), 'gl3': C('eef8fa'),
}


class Layer:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w, h), T)
        self.p = self.im.load()

    def px(self, x, y, c):
        if c is None:
            return
        if isinstance(c, str):
            c = P[c]
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[x, y] = c

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.p[x, y]
        return T

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, c)

    def hl(self, x, y, w, c):
        self.rect(x, y, w, 1, c)

    def vl(self, x, y, h, c):
        self.rect(x, y, 1, h, c)

    def frame(self, x, y, w, h, c):
        self.hl(x, y, w, c); self.hl(x, y + h - 1, w, c); self.vl(x, y, h, c); self.vl(x + w - 1, y, h, c)

    def ell(self, cx, cy, rx, ry, c, test=None):
        for yy in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for xx in range(int(cx - rx) - 1, int(cx + rx) + 2):
                dx = (xx + .5 - cx) / rx; dy = (yy + .5 - cy) / ry
                if dx * dx + dy * dy <= 1:
                    self.px(xx, yy, c if test is None else test(xx, yy, dx, dy))

    def ascii(self, x, y, rows, pal):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in ' .':
                    continue
                self.px(x + i, y + j, pal[ch])

    def outline(self, c=INK, diag=False):
        """1px outline around everything opaque (outside the silhouette); the layer grows by 1 on each side."""
        n = Layer(self.w + 2, self.h + 2)
        n.im.paste(self.im, (1, 1))
        src = n.im.copy().load()
        nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (1, -1), (-1, 1), (-1, -1)] if diag else [])
        for y in range(n.h):
            for x in range(n.w):
                if src[x, y][3]:
                    continue
                for dx, dy in nb:
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < n.w and 0 <= yy < n.h and src[xx, yy][3]:
                        n.p[x, y] = c
                        break
        return n

    def paste(self, other, x, y):
        self.im.alpha_composite(other.im if isinstance(other, Layer) else other, (x, y))
        self.p = self.im.load()


def mul(c, f):
    return (min(255, int(c[0] * f)), min(255, int(c[1] * f)), min(255, int(c[2] * f)), 255)


def shadow(scene, x, y, w, h=3, f=.875):
    """soft floor shadow under a standing object: a flat rounded band, floor colours * 0.875 like the existing ones"""
    for yy in range(y, y + h):
        inset = 1 if (yy == y or yy == y + h - 1) and w > 4 else 0
        for xx in range(x + inset, x + w - inset):
            if 0 <= xx < scene.w and 0 <= yy < scene.h:
                scene.p[xx, yy] = mul(scene.p[xx, yy], f)
