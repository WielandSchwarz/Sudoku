"""Builds the new living room strip: hallway (Diele) | divider | old living room up to just behind the piano."""
from PIL import Image
from draw import Layer, P, C, INK, mul, shadow
from px import tile
import os
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'basis') + os.sep

ROOM = Image.open(B + 'room_native.png').convert('RGBA')
FLOOR = Image.open(B + 'floor48.png').convert('RGBA')      # the current floor, exactly as the game draws it (48x16)
WALL = Image.open(B + 'wall_cream.png').convert('RGBA')    # the current wallpaper (16x16)
H = 135
WALL_END = 97          # baseboard rows 97..99, floor from row 100
FLOOR_Y = 100
CUT = 184              # old room is kept from x=0 up to here (the piano started at 186)
OLD_END = 246          # the room now ends here (old coordinates): just behind where the piano stood


class Room:
    def __init__(self, DL=76, DV=8):
        self.DL, self.DV = DL, DV
        self.S = DL + DV                       # old x -> new x offset
        self.W = self.S + OLD_END
        self.L = Layer(self.W, H)
        L = self.L
        # current wallpaper and floor everywhere, aligned with the old room
        for y in range(H):
            for x in range(self.W):
                ox = x - self.S
                if y < WALL_END:
                    c = WALL.getpixel(((ox + 8) % 16, (y + 8) % 16))
                elif y < FLOOR_Y:
                    c = C('fff6e8')
                else:
                    c = FLOOR.getpixel((ox % 48, (y + 12) % 16))
                L.p[x, y] = c
        # the old room, left part with bookcase, armchair, lamp, terrace door, geranium, clock, pictures
        L.im.paste(ROOM.crop((0, 0, CUT, H)), (self.S, 0))
        L.p = L.im.load()

    def o(self, x):
        """old-room x -> new x"""
        return x + self.S

    def hall_surface(self, wall=None, floor=None, x0=0, x1=None, wainscot=None):
        """own wallpaper / floor for the hallway part (tiles at 1 room px, never scaled)"""
        L = self.L; x1 = self.DL if x1 is None else x1
        wt = tile(*wall) if wall else None
        ft = tile(*floor) if floor else None
        for y in range(H):
            for x in range(x0, x1):
                if y < WALL_END and wt:
                    L.p[x, y] = wt.getpixel((x % wt.width, y % wt.height))
                elif y >= FLOOR_Y and ft:
                    L.p[x, y] = ft.getpixel((x % ft.width, (y - FLOOR_Y) % ft.height))
        if wainscot:
            self.wainscot(x0, x1, *wainscot)

    def wainscot(self, x0, x1, top=66, base='bw3', light='bw4', dark='bw2'):
        """wooden panelling on the lower wall, calm: vertical boards with a cap rail"""
        L = self.L
        for x in range(x0, x1):
            for y in range(top, WALL_END):
                k = (x - x0) % 8
                c = dark if k == 0 else (light if k == 1 else base)
                L.px(x, y, c)
            L.px(x, top - 2, INK); L.px(x, top - 1, 'bw4'); L.px(x, top, 'bw2')

    def put(self, layer, x, y, floor_shadow=None):
        """paste an outlined object; floor_shadow=(dx, w) draws the standard floor shadow under it"""
        if floor_shadow:
            dx, w = floor_shadow
            shadow(self.L, x + dx, y + layer.h - 2, w, 3)
        self.L.paste(layer, x, y)

    def save(self, path, scale=4):
        self.L.im.save(path)
        if scale:
            self.L.im.resize((self.W * scale, H * scale), Image.NEAREST).save(path.replace('.png', '_x%d.png' % scale))
