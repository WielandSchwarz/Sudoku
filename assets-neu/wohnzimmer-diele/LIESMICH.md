# Wohnzimmer mit Diele: 4 Varianten (Entwurf)

Wunsch von Wieland: Links liegen Haustür und Diele, dann kommt ein kleiner Trenner, danach das bisherige Wohnzimmer. Es endet direkt hinter dem Klavier. Statt des Klaviers steht dort ein Grammophon.

**Status:** Wieland hat Variante 1 (Landhaus) gewählt. Daraus sind zwei Fassungen entstanden, die Wahl zwischen ihnen steht noch aus. Bitte erst einbauen, wenn Wieland eine davon freigegeben hat.

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
