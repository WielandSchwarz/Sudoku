# Wohnzimmer mit Diele: 4 Varianten (Entwurf)

Wunsch von Wieland: Links liegen Haustür und Diele, dann kommt ein kleiner Trenner, danach das bisherige Wohnzimmer. Es endet direkt hinter dem Klavier. Statt des Klaviers steht dort ein Grammophon.

**Status:** Wieland hat Variante 1 (Landhaus) mit einem Fenster gewählt. Aktueller Entwurf ist **1D** (Runde 4). Offen sind noch die Wahl des Grammophons und die Auswahl der neuen Sessel. Die Freigabe zum Einbau steht noch aus.

## Runde 4: 1D, Pinnwand über dem Grammophon, Grammophon-Entwürfe, 10 neue Sessel
- **1D** (`vorschau/variante-1d*`) unterscheidet sich von 1C so: Die Pinnwand (`pcBoard`) hängt über dem Grammophon (alt x=103, y=12), das Wandbrett ist entfernt. Über dem ersten Regal ist die Wand jetzt frei. Das Grammophon steht 4 px weiter vorn (Unterkante y=106 statt 102), also etwas von der Wand weg. Das Schiffsbild bleibt über dem zweiten Regal.
- Das Schiffsmodell (`pcModel`) stand bisher auf dem Wandbrett und braucht einen neuen Platz. Den legt Wieland noch fest.
- **Grammophon-Entwürfe** (`vorschau/grammophon_optionen_x4.png`, ganze Räume in `vorschau/grammophon-*.png`, Teile in `teile/grammophon-*`): A Messingtrichter (bisher), B Holztrichter, C grüner Blütentrichter mit Goldrand, D Standgrammophon mit offenem Deckel, Stoffbespannung und Plattenfach. Wieland wählt noch.
- **10 neue Sessel** (`sessel/`, Übersicht `sessel/uebersicht_x4.png`): gleiches Format wie die Einträge in `furn2.json` → `chair` (48×42, 1:1). `sessel.json` enthält je Sessel `name`, `beschreibung` und `seat` (y der Sitzfläche für `seatPos`). Sie sind als PNG gespeichert. Für `furn2.json` müssen sie in das dortige SVG-Pfadformat umgewandelt werden (1 Rechteck je Pixelzeile und Farbe). Gezeichnet wurden sie mit `werkzeug/sessel.py`.

## Runde 3: 1C, gemütlicher angeordnet
Wünsche: Es bleibt bei einem Fenster. Die Möbel sollen gemütlicher stehen, das Grammophon neben dem Sessel, dazu ein zweites Bücherregal. Der Gummibaum ganz rechts fällt weg.

Anordnung von links nach rechts (alte Koordinaten, neu = alt + 84):
- **Boden:** Regal (alt x=1, unverändert), Leselampe (x=39, vorher 87), Sessel (x=55, vorher 38), Musiktruhe mit Messing-Grammophon (x=106), Geranie unter dem Fenster (x=160, vorher 138), zweites Bücherregal `regal_zwei` (x=210, oben y=54). Der Teppich liegt vor Sessel und Grammophon (x=62).
- **Wand:** Pinnwand über dem Regal (x=1), Uhr über dem Sessel (x=63), Wandbrett mit Kaktus, Büchern und Platte über dem Grammophon (x=99, y=12; das Schiffsmodell gehört weiter dorthin), Fenster (Mitte x=180, oben y=26), Schiffsbild über dem zweiten Regal (x=216).
- **Zweites Regal:** gleicher Korpus wie das alte, mit neuem Inhalt: Bücher und Efeutopf oben, liegende Bücher, ein Teelicht und Schallplatten in der Mitte, Wollkorb und Bücher unten. Damit es als Slot-Möbel wählbar wird, braucht es beim Einbau einen Eintrag wie die anderen Regale. Bis dahin ist es feste Deko.
- Alle Positionen stehen in `layout_landhaus.json` unter `variante-1c`. Die Spots aus `app.js` (`SPOT.chairFront`, `SPOT.window`, `SPOT.plant`, `L.lamp`, `L.chair`, `L.plant`, `L.clockCx`) müssen an die neuen Plätze angepasst werden.

## Runde 2: Landhaus ohne Terrassentür, mit Fenstern
Wünsche: Die Terrassentür kommt weg. Das Wohnzimmer soll ruhiger und gemütlicher werden. Es braucht ein oder zwei Fenster.

- **1A, ein Fenster** (`vorschau/variante-1a*`): Das Fenster sitzt dort, wo die Terrassentür war (alt x=126 Mitte, oben y=26). Die Pinnwand hängt über dem Regal, die Uhr bleibt über dem Sessel, das Schiffsbild hängt rechts neben dem Fenster.
- **1B, zwei Fenster** (`vorschau/variante-1b*`): Ein Fenster hängt über dem Sessel (alt x=62), das zweite an Stelle der Terrassentür (alt x=125). Die Uhr hängt über dem Regal, die Pinnwand rechts neben dem zweiten Fenster, das Schiffsbild in der Diele über der Hakenleiste.
- Die Diele und die Musikecke sind wie in Variante 1.
- Die Fenster sind im Stil des alten Zimmerfensters gezeichnet (`props.window`): weißer Rahmen, 2×2 Scheiben mit 2px-Sprossen, weiße Fensterbank. Dazu kommen eine Holzstange und gebundene Vorhänge in den Farben der alten Erker-Vorhänge. Hinter dem Glas ist im Entwurf der Garten aus dem Erkerfenster zu sehen. Beim Einbau sollte dort wie bisher die echte Gartenszene mit Tageszeit und Wetter erscheinen.
- Pinnwand (`pcBoard`), Schiffsbild (`dzPic`) und Schiffsmodell auf dem Wandbrett behalten ihre Funktion, nur ihre Positionen ändern sich.
- Die alten Möbel sind unverändert, nur verschoben. Regal, Sessel, Lampe, Geranie und Teppich stehen an ihren bisherigen Plätzen.
- `layout_landhaus.json` enthält alle Positionen. Bei Teilen mit `ebene: "alt"` stehen in `alt_x`/`alt_y` die bisherigen Koordinaten.
- `python3 werkzeug/landhaus.py <zielordner>` erzeugt beide Fassungen neu.
- Offen: Ohne Terrassentür braucht der Weg in den Garten einen neuen Platz. Naheliegend ist die Haustür.

## Runde 1

## Was sich am Raum ändert
- Der Raum wird 328 bis 334 px breit statt 360 px (siehe `layout.json` → `breite`).
- Das alte Wohnzimmer bleibt von x=0 bis 184 unverändert: Regal, Sessel, Lampe, Terrassentür, Geranie, Uhr, Bilder, linker Teppich. Es rückt um `altes_zimmer_versatz` nach rechts.
- Klavier, Hocker, Erkerfenster mit Fensterbank, Gitarre, Ampelpflanzen und rechter Teppich fallen weg. Die Wand endet bei alt x=246.
- Das Wandbrett über dem Klavier (Kaktus, Bücher, Schallplatte) bleibt, hängt aber 6 px höher (`wandbrett_alt`), damit der Trichter darunter passt.

## Die Varianten
| | Diele | Trenner | Musikecke |
|---|---|---|---|
| 1 Landhaus | grüne Tür, Hakenleiste mit Mantel, Strohhut, Schal, Bank mit Gummistiefeln. Holzvertäfelung, Schachbrettfliesen | Holzpfosten mit Kopfbändern | Messing-Grammophon auf Musiktruhe, Gummibaum |
| 2 Fliesen und Halbwand | blaue Tür, Garderobenständer, ovaler Spiegel, Schirmständer. Mintstreifen, Ziegelboden | Halbwand aus Holz mit Efeutopf | Holztrichter-Grammophon auf Beistelltisch, Plattenkiste, zwei Bilder, Gummibaum |
| 3 Portiere | rote Tür, Schlüsselbrett, Kommode mit Spiegel, Schale und Tulpen, Läufer. Tapete und Dielen wie im Wohnzimmer | Wandvorsprung mit grünem Samtvorhang | blauer Blütentrichter auf Plattenschrank, Efeu, Notenständer |
| 4 Holzpaneele und Regal | Holztür, Hakenleiste mit Tasche, Filzhut, Mantel, Bank. Holzpaneele, Rautenparkett | schmales Regal mit Büchern, Glas, Pflanze, Platten | Koffergrammophon auf Kommode, Plattenstapel, Gummibaum |

## Dateien
- `vorschau/variante-N.png`: ganzer Raum in Originalpixeln. `variante-N_x4_mit_hamster.png` ist vierfach vergrößert, mit Hamster zum Größenvergleich.
- `teile/variante-N/*.png`: jedes neue Teil einzeln, in Originalpixeln, mit 1px-Umriss. `diele_flaechen.png` enthält Tapete, Boden, Vertäfelung und Eckleiste der Diele ohne Möbel.
- `layout.json`: je Variante alle Teile mit `x`, `y`, `w`, `h` in neuen Raumkoordinaten (y=0 oben, Fußleiste y=97..99, Boden ab y=100). `ebene` ist `wand`, `boden` (steht, mit Schatten = Boden × 0,875 unter der Unterkante `unten`) oder `liegt` (Matte, Läufer). Die Reihenfolge in der Liste ist die Zeichenreihenfolge.
- `werkzeug/`: Python-Skripte, mit denen alles gezeichnet wurde. `python3 werkzeug/variants.py <zielordner>` erzeugt Vorschauen, Teile und `layout.json` neu. Teile ändern sich in `objects.py`, die Anordnung in `variants.py`. `basis/` enthält das alte Zimmer in Originalpixeln (aus der Vorschau aufgenommen), die aktuelle Boden- und Tapetenkachel und den Hamster.

## Hinweise zum Einbau
- Die neuen Böden und Tapeten der Diele sind die Kacheln aus `furn2.json` im Maßstab 1:1. Der bestehende Wohnzimmerboden wird im Spiel auf 48×16 gestreckt (Kachel 36×12). Das ist schon heute so, ich habe es nicht geändert.
- Halbwand (Variante 2) und Regal (Variante 4) stehen auf dem Boden. Wenn der Hamster durch die Diele läuft, sollte er davor gezeichnet werden.
- Das Fenster der Haustür zeigt im Entwurf einen festen Himmel. Beim Einbau sollte es wie die Terrassentür den echten Garten mit Tageszeit und Wetter zeigen.
- Offene Fragen an Wieland: Was passiert beim Antippen der Haustür? Kommt der Weg ins Bad, bisher links vom Wohnzimmer, jetzt aus der Diele? Was macht der Hamster am Grammophon (statt `playPiano`)?
