"""Composes the four variants of the new living room: Diele | Trenner | Wohnzimmer (ends just behind where the piano stood).
Every placed piece is logged with name, position and layer, and exported as its own PNG."""
import json, os
from PIL import Image
from scene import Room, OLD_END, WALL, H
from objects import *
from draw import shadow, Layer

from scene import B
ROOMNAT = Image.open(B + 'room_native.png').convert('RGBA')
HAM = Image.open(B + 'hamster.png').convert('RGBA')


class V:
    def __init__(self, key, title, DL, DV):
        self.key, self.title = key, title
        self.R = Room(DL=DL, DV=DV)
        self.items = []
        self.notes = {}

    # ---- placing
    def wall(self, name, obj, x, y):
        self.R.L.paste(obj, x, y)
        self.items.append(dict(name=name, x=x, y=y, w=obj.w, h=obj.h, ebene='wand', img=obj))
        return y

    def stand(self, name, obj, x, bottom=102, sh=True):
        y = bottom - obj.h + 1
        if sh:
            shadow(self.R.L, x + 2, bottom - 1, obj.w - 4, 3)
        self.R.L.paste(obj, x, y)
        self.items.append(dict(name=name, x=x, y=y, w=obj.w, h=obj.h, ebene='boden', unten=bottom, schatten=sh, img=obj))
        return y

    def flat(self, name, obj, x, y):
        """lies on the floor (doormat, runner): drawn under everything that stands"""
        self.R.L.paste(obj, x, y)
        self.items.append(dict(name=name, x=x, y=y, w=obj.w, h=obj.h, ebene='liegt', img=obj))

    def on_top(self, name, base_top, obj, x):
        y = base_top - obj.h + 2
        return self.wall(name, obj, x, y)

    def snap(self):
        """the hallway surfaces (wallpaper, floor, panelling, corner strip) before any furniture"""
        self.bg = self.R.L.im.crop((0, 0, self.R.S + 2, H))

    def old_shelf(self, dy=-6, x=188):
        """the wall shelf that hung above the piano stays, 6 px higher so the horn fits under it"""
        lay = Layer(48, 24)
        for y in range(18, 40):
            for sx in range(188, 234):
                c = ROOMNAT.getpixel((sx, y))
                if c != WALL.getpixel(((sx + 8) % 16, (y + 8) % 16)):
                    lay.px(sx - 188, y - 18, c)
        self.wall('wandbrett_alt', lay, self.R.o(x), 18 + dy)

    def seam(self, x, wall=True):
        for y in range(0, 135):
            if 97 <= y < 100 or (y < 97 and not wall):
                continue
            self.R.L.px(x, y, 'bw4' if y < 97 else 'bw3'); self.R.L.px(x + 1, y, 'bw2')

    # ---- output
    def export(self, out):
        R = self.R
        os.makedirs(out + '/teile/' + self.key, exist_ok=True)
        os.makedirs(out + '/vorschau', exist_ok=True)
        R.L.im.save(out + '/vorschau/%s.png' % self.key)
        prev = R.L.im.copy()
        if HAM is not None:
            hx, hb = self.notes.get('hamster', (24, 118))
            prev.alpha_composite(HAM, (hx, hb - HAM.height))
        prev.resize((R.W * 4, H * 4), Image.NEAREST).save(out + '/vorschau/%s_x4_mit_hamster.png' % self.key)
        self.bg.save(out + '/teile/%s/diele_flaechen.png' % self.key)
        used = {}
        rows = []
        for it in self.items:
            n = it['name']; used[n] = used.get(n, 0) + 1
            fn = n if used[n] == 1 else '%s_%d' % (n, used[n])
            it['img'].im.save(out + '/teile/%s/%s.png' % (self.key, fn))
            rows.append({k: v for k, v in it.items() if k != 'img'} | {'datei': 'teile/%s/%s.png' % (self.key, fn)})
        return dict(titel=self.title, breite=R.W, diele_breite=R.DL, trenner_breite=R.DV,
                    altes_zimmer_versatz=R.S, altes_zimmer_bis=OLD_END, **self.notes.get('meta', {}), teile=rows)


# ---------------------------------------------------------------- variant 1
def v1():
    v = V('variante-1', 'Landhaus: grüne Haustür, Hakenleiste mit Bank, Holzpfosten, Messing-Grammophon auf Musiktruhe', 76, 8)
    R = v.R
    R.hall_surface(floor=('checker', 'floor'), x0=0, x1=80, wainscot=(64, 'bw3', 'bw4', 'bw2'))
    v.seam(79, wall=False)
    v.snap()
    v.notes['meta'] = dict(diele_tapete='wie Wohnzimmer (Creme), unten Holzvertäfelung ab y=62', diele_boden='Schachbrettfliesen (furn2 floor checker, 1:1)')
    door = haustuer('gruen')
    v.wall('haustuer', door, 8, 101 - door.h)
    v.flat('fussmatte', fussmatte(28), 9, 101)
    hb, hooks = hakenleiste(26)
    v.wall('hakenleiste', hb, 46, 44)
    v.wall('mantel', mantel(), 46 + hooks[0] - 5, 49)
    v.wall('strohhut', hut('stroh'), 46 + hooks[1] - 7, 48)
    v.wall('schal', schal(), 46 + hooks[2] - 2, 49)
    v.stand('bank', bank(26), 46, 103)
    post, cx0 = pfosten()
    v.wall('trenner_holzpfosten', post, 80 - 3 - (cx0 + 1), 0)
    v.old_shelf()
    top = v.stand('musiktruhe', musiktruhe(30, 24), R.o(188), 102)
    v.on_top('grammophon_messing', top, grammophon('messing'), R.o(188) + 2)
    v.stand('gummibaum', zimmerpflanze(), R.o(222), 103)
    v.notes['hamster'] = (40, 120)
    return v


# ---------------------------------------------------------------- variant 2
def v2():
    v = V('variante-2', 'Fliesen und Halbwand: blaue Haustür, Garderobenständer, Spiegel, Schirmständer, Halbwand mit Efeu, Holztrichter-Grammophon auf Beistelltisch', 76, 10)
    R = v.R
    R.hall_surface(wall=('stripes', 'wall'), floor=('terracotta', 'floor'), x0=0, x1=81)
    v.seam(80)
    v.snap()
    v.notes['meta'] = dict(diele_tapete='Mintstreifen (furn2 wall stripes, 1:1)', diele_boden='Ziegelboden (furn2 floor terracotta, 1:1)')
    v.stand('garderobenstaender', garderobenstaender(), 3, 104)
    door = haustuer('blau', window='eckig')
    v.wall('haustuer', door, 28, 101 - door.h)
    v.flat('fussmatte', fussmatte(28, 'flicken'), 29, 101)
    v.wall('spiegel', spiegel(14, 20), 61, 27)
    v.stand('schirmstaender', schirmstaender(), 63, 102)
    hw = halbwand(34)
    v.stand('trenner_halbwand', hw, 81 - hw.w // 2, 104)
    v.wall('bild_berg', bild(16, 12, 'berg'), R.o(194), 26)
    v.wall('bild_blume', bild(12, 10, 'blume'), R.o(214), 30)
    top = v.stand('beistelltisch', beistelltisch(22, 24), R.o(188), 103)
    v.on_top('grammophon_holz', top, grammophon('holz'), R.o(188) - 1)
    v.stand('plattenkiste', plattenkiste(), R.o(212), 104)
    v.stand('gummibaum', zimmerpflanze(44), R.o(222), 103)
    v.notes['hamster'] = (26, 121)
    return v


# ---------------------------------------------------------------- variant 3
def v3():
    v = V('variante-3', 'Portiere: rote Haustür, Kommode mit Spiegel, Läufer, Wandvorsprung mit grünem Samtvorhang, blauer Blütentrichter auf Plattenschrank', 76, 6)
    R = v.R
    v.snap()
    v.notes['meta'] = dict(diele_tapete='wie Wohnzimmer', diele_boden='wie Wohnzimmer')
    door = haustuer('rot')
    v.wall('haustuer', door, 5, 101 - door.h)
    v.wall('schluesselbrett', schluesselbrett(), 38, 46)
    v.wall('spiegel', spiegel(16, 22), 51, 40)
    top = v.stand('kommode', kommode(30, 22), 43, 102)
    v.on_top('schale_schluessel', top, schale_schluessel(), 46)
    v.on_top('vase_tulpen', top, vase_blumen(), 63)
    v.flat('laeufer', laeufer(62, 'r2', 'o3'), 4, 104)
    v.wall('trenner_wandvorsprung', pilaster(), 75, 0)
    cur = portiere(100, side='rechts')
    v.wall('trenner_portiere', cur, 76 - cur.w + 2, 0)
    v.old_shelf()
    top = v.stand('plattenschrank', plattenschrank(40, 22), R.o(188), 102)
    v.on_top('grammophon_bluete', top, grammophon('blau'), R.o(188))
    v.wall('efeutopf', efeutopf(), R.o(219), 62)
    v.stand('notenstaender', notenstaender(), R.o(232), 103)
    v.notes['hamster'] = (30, 121)
    return v


# ---------------------------------------------------------------- variant 4
def v4():
    v = V('variante-4', 'Holzpaneele und Regal: Holz-Haustür, Hakenleiste mit Bank, schmales Regal als Trenner, Koffergrammophon auf Kommode', 72, 16)
    R = v.R
    R.hall_surface(wall=('planks', 'wall'), floor=('herring', 'floor'), x0=0, x1=80)
    v.seam(79)
    v.snap()
    v.notes['meta'] = dict(diele_tapete='Holzpaneele (furn2 wall planks, 1:1)', diele_boden='Rautenparkett (furn2 floor herring, 1:1)')
    v.wall('bild_berg', bild(14, 11, 'berg'), 10, 26)
    hb, hooks = hakenleiste(26)
    v.wall('hakenleiste', hb, 4, 44)
    v.wall('tasche', tasche(), 4 + hooks[0] - 4, 49)
    v.wall('filzhut', hut('filz'), 4 + hooks[1] - 6, 48)
    v.wall('mantel', mantel(('g1', 'g2', 'g3'), 26), 4 + hooks[2] - 5, 49)
    v.stand('bank', bank(26, ('u2', 'u3', 'u4')), 3, 103)
    door = haustuer('holz')
    v.wall('haustuer', door, 37, 101 - door.h)
    v.flat('fussmatte', fussmatte(28), 38, 101)
    rt = raumteiler(60)
    v.stand('trenner_regal', rt, 80 - rt.w // 2, 103)
    v.old_shelf()
    top = v.stand('kommode', kommode(28, 22, ('bw1', 'bw2', 'bw3', 'bw4')), R.o(190), 102)
    v.on_top('koffergrammophon', top, koffergrammophon(), R.o(190) + 3)
    v.stand('gummibaum', zimmerpflanze(42), R.o(222), 103)
    v.flat('plattenstapel', plattenstapel(), R.o(214), 98)
    v.notes['hamster'] = (18, 121)
    return v


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else 'out'
    lay = {}
    for f in (v1, v2, v3, v4):
        v = f(); lay[v.key] = v.export(out); print(v.key, v.R.W, len(v.items))
    json.dump(dict(
        einheit='1 Bildpixel = 1 Raumpixel (wie room 360x135); y=0 oben, Fußleiste y=97..99, Boden ab y=100',
        reihenfolge='Teile in der Liste von oben nach unten zeichnen (später = weiter vorne)',
        varianten=lay), open(out + '/layout.json', 'w'), ensure_ascii=False, indent=1)
