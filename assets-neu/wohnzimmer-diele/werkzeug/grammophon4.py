"""Round 7: a carefully constructed gramophone in the usual pixel-art view, seen slightly from above:
box with a visible top on which the record lies as a disc, straight tone-arm neck at the back left,
a wide morning-glory horn flaring up and to the right with a clean scalloped rim, seen at three quarters."""
import math
from draw import Layer, P, C, INK, mul


def tc(c):
    return c if isinstance(c, tuple) else (P[c] if c in P else C(c))


def grammophon4(horn=('8a6420', 'b8862a', 'd8a43a', 'f0c450', 'fbe2a0'), inner=('4a3010', '7a5418', 'a87a28'),
                rim=('e9b949', 'fff2c0'), box=('3e2410', '5a3418', '7a4a24', '9a6634', 'ba844a'), trim='e9b949', petals=8):
    W, H = 38, 45
    L = Layer(W, H)
    hp = [tc(c) for c in horn]; ip = [tc(c) for c in inner]; rp = [tc(c) for c in rim]; bp = [tc(c) for c in box]
    # ---------------- box
    bx0, bx1 = 3, 29                 # front face x range
    ty0, ty1 = 27, 33                # top face rows (seen from slightly above)
    fy1 = 42                         # bottom of front face
    for y in range(ty0, ty1):
        L.hl(bx0, y, bx1 - bx0, bp[4] if y == ty0 else bp[3])
    L.rect(bx0, ty1, bx1 - bx0, fy1 - ty1, bp[2])
    L.hl(bx0, ty1, bx1 - bx0, tc(trim))                       # brass edge between top and front
    L.vl(bx0, ty1 + 1, fy1 - ty1 - 1, bp[3]); L.vl(bx1 - 1, ty1 + 1, fy1 - ty1 - 1, bp[1])
    L.hl(bx0, fy1 - 1, bx1 - bx0, bp[0])
    L.frame(bx0 + 3, ty1 + 2, bx1 - bx0 - 6, fy1 - ty1 - 4, bp[1])   # front panel
    L.hl(bx0 + 4, ty1 + 3, bx1 - bx0 - 8, bp[3])
    cxp = (bx0 + bx1) // 2
    L.rect(cxp - 2, ty1 + 4, 4, 2, tc(trim)); L.px(cxp - 2, ty1 + 4, rp[1])          # little brass plate
    for fx in (bx0, bx1 - 3):                                  # feet
        L.rect(fx, fy1, 3, 2, tc(trim)); L.px(fx, fy1, rp[1])
    # crank
    for (x, y, c) in ((bx1, 35, tc(trim)), (bx1 + 1, 35, tc(trim)), (bx1 + 2, 35, tc(trim)), (bx1 + 2, 36, tc(trim)),
                      (bx1 + 2, 37, tc(trim)), (bx1 + 3, 37, bp[3]), (bx1 + 4, 37, bp[3])):
        L.px(x, y, c)
    # ---------------- record on the top: a flat disc
    rcx, rcy, rrx, rry = 17, 30, 10, 3.1
    for y in range(ty0 - 1, ty1 + 1):
        for x in range(bx0, bx1):
            dx = (x + .5 - rcx) / rrx; dy = (y + .5 - rcy) / rry
            d = dx * dx + dy * dy
            if d <= 1:
                c = tc('2a2a2a')
                if d < .1:
                    c = tc('c8463c')
                elif dy < -.25 and -.7 < dx < .1 and d > .35:
                    c = tc('4a4444')                  # sheen on the grooves
                L.px(x, y, c)
    L.px(rcx, rcy, tc('fff8ec'))
    # ---------------- horn: straight axis from the neck (back left) to the bell (upper right)
    nx, ny = 8.0, 27.0               # neck foot (back left of the box)
    bxc, byc = 25.0, 11.0            # centre of the bell opening
    ax, ay = bxc - nx, byc - ny; alen = math.hypot(ax, ay); ux, uy = ax / alen, ay / alen
    vx, vy = -uy, ux                 # perpendicular
    R = 11.0                         # bell radius
    # body: radius grows like a trumpet towards the bell
    for y in range(0, ty0 + 1):
        for x in range(0, W):
            px_, py_ = x + .5 - nx, y + .5 - ny
            t = (px_ * ux + py_ * uy) / alen
            if t < 0 or t > 1:
                continue
            r = 1.4 + (R - 1.4) * t ** 3.2
            s = px_ * vx + py_ * vy
            if abs(s) <= r:
                k = s / max(r, 1)            # -1 .. 1 across; light side is the upper left (k < 0)
                c = hp[4] if k < -.55 else hp[3] if k < -.1 else hp[2] if k < .45 else hp[1] if k < .8 else hp[0]
                L.px(x, y, c)
    # bell opening: ellipse facing us at three quarters, scalloped rim, dark throat offset towards the neck
    a, b = R * .62, R + .6
    for y in range(-2, ty0):
        for x in range(0, W):
            px_, py_ = x + .5 - bxc, y + .5 - byc
            u = px_ * ux + py_ * uy; v = px_ * vx + py_ * vy
            th = math.atan2(v / b, u / a)
            sc = 1 + .045 * math.cos(th * petals)
            q = (u / (a * sc)) ** 2 + (v / (b * sc)) ** 2
            if q > 1:
                continue
            if q > .72:
                c = rp[1] if v < -b * .25 else rp[0]
            else:
                tu, tv = u + a * .3, v            # throat sits a bit towards the neck
                tq = (tu / (a * .55)) ** 2 + (tv / (b * .45)) ** 2
                c = ip[0] if tq < 1 else (ip[2] if v < -b * .35 and q > .4 else ip[1])
            L.px(x, y, c)
    # sound box where the neck meets the record
    L.rect(7, 26, 4, 3, tc('d4c8b2')); L.px(7, 26, tc('fff8ec')); L.px(9, 27, tc('5a5252')); L.hl(11, 28, 3, tc('d4c8b2'))
    return L.outline()


def plattenschrank4(w=32, h=22, wood=('3e2410', '5a3418', '7a4a24', '9a6634', 'ba844a')):
    """calm low cabinet: two plain doors with brass knobs, an open shelf with records at the bottom"""
    bp = [tc(c) for c in wood]
    L = Layer(w, h)
    L.rect(0, 0, w, 3, bp[3]); L.hl(0, 0, w, bp[4]); L.hl(0, 2, w, bp[1])
    L.rect(1, 3, w - 2, h - 5, bp[1])
    half = (w - 4) // 2
    for x0 in (2, 2 + half):
        L.rect(x0, 4, half - 1, 9, bp[2]); L.hl(x0, 4, half - 1, bp[3]); L.vl(x0, 4, 9, bp[3])
    L.px(2 + half - 3, 8, tc('e9b949')); L.px(2 + half + 1, 8, tc('e9b949'))
    cols = ['c8463c', 'fff8ec', '4e7a8a', 'f0c040', 'e88a9c', '5aa04e', 'e8955a', '8a7ab0']
    L.rect(2, 14, w - 4, h - 17, bp[0])
    for i in range(w - 6):
        hh = h - 18 - (1 if i % 4 == 1 else 0)
        L.vl(3 + i, 15 + (h - 18 - hh), hh, tc(cols[(i * 3) % len(cols)]))
    L.rect(1, h - 2, 3, 2, bp[1]); L.rect(w - 4, h - 2, 3, 2, bp[1])
    return L.outline()


VARIANTS = {
    'messing': dict(name='Messing', kw={}),
    'kupfer': dict(name='Kupfer', kw=dict(horn=('7a3a20', 'a0522c', 'c46a3c', 'e0905e', 'f6c08a'), inner=('3a1808', '6a3018', '9a4a28'))),
    'gruen': dict(name='Tannengrün mit Goldrand', kw=dict(horn=('1e3c24', '2e5c34', '3e7c44', '5aa05a', '8cc87a'), inner=('10200f', '1e3c24', '2e5c34'))),
    'kirsch': dict(name='Kirschrot mit Goldrand', kw=dict(horn=('5a1418', '7e2024', 'a8342c', 'c8504a', 'e07a6a'), inner=('2a0808', '5a1418', '7e2024'),
                                                          box=('2b1d12', '3e2410', '4e3018', '6a4020', '8a5a30'))),
}
