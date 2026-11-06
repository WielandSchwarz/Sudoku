# Wohnzimmer mit Diele: 4 Varianten (Entwurf)

Wunsch von Wieland: Links liegen Haustür und Diele, dann kommt ein kleiner Trenner, danach das bisherige Wohnzimmer. Es endet direkt hinter dem Klavier. Statt des Klaviers steht dort ein Grammophon.

**Status:** Wieland hat Variante 1 (Landhaus) mit einem Fenster gewählt. Aktueller Raum-Entwurf ist **1D** (Runde 4). Die 10 neuen Sessel sind freigegeben und ersetzen die bisherigen (Runde 5). Das Grammophon aus Runde 7 ist freigegeben (Form). Die Farbe ist noch nicht gewählt, die vier Farben können auch als Auswahl im Einrichten-Menü dienen. Runde 8: Die Türen aus dem Tür-Slot als Haustür und die 10 neuen Tapeten sind freigegeben. Runde 9: eigene Farben für jede Tapete im Möbel-Menü und die Bodenprüfung, freigegeben. Runde 10: neue Böden für Wohnraum und Diele zur Auswahl. Der Raum selbst ist noch nicht zum Einbau freigegeben.

## Runde 10 und 11: neue Böden für Wohnraum und Diele (20 + 14)

Wieland findet die bisherige Bodenauswahl nicht schick genug. Deshalb gibt es neue Böden, getrennt für Wohnraum und Diele.

- **Wohnraum, 10 Böden** (`boeden2/uebersicht_wohnraum_x2.png`): Honig-Eiche, Walnuss breit, Weiß geölt, Kirsche schmal, Kiefer mit Ästen (Dielenbretter mit versetzten Stößen, Maserung, Lichtkante, Fuge und Nagelpunkten), Chevron-Eiche, Tafelparkett, Sisal, Altrosa Teppich, Salbei-Teppich.
- **Diele, 6 Böden** (`boeden2/uebersicht_diele_x2.png`): Schachbrett Marmor, Zementfliesen Blau, Zementfliesen Grün, Terrakotta-Sechsecke, Schieferplatten, Sechseck-Mosaik mit Blüten.
- **Runde 11, weitere 10 Wohnraum-Böden** (`boeden2/uebersicht_wohnraum_2_x2.png`): Räuchereiche, Esche hell schmal, Altholz bunt, Dielen graublau gestrichen, Würfelparkett (isometrische Würfel), Kork, Terrazzo, Kelim-Streifen, Berber-Teppich, Blauer Sternenteppich.
- **Runde 11, weitere 8 Diele-Böden** (`boeden2/uebersicht_diele_2_x2.png`): Rauten rot-creme, Kieselmosaik, Sandsteinplatten, Achteckfliesen mit Einleger, Holzpflaster, Klinker im Fischgrät, Zementfliesen Stern, Zementfliesen Rosa.
- Insgesamt also 20 Wohnraum- und 14 Diele-Böden, alle in `boeden2/boeden_neu.json`.
- **Neu für den Einbau:** Die Diele bekommt eine eigene Bodenauswahl. Bisher hatte sie den festen Schachbrettboden. Vorschlag: Im Möbel-Menü unter „Boden“ zwei Titel mit je einer Kartenreihe, „Wohnraum“ und „Diele“. Der Diele-Boden reicht von x=0 bis zum Holzpfosten (x=91), der Wohnraum-Boden beginnt dort.
- `boeden2/boeden_neu.json` enthält `wohnraum` und `diele`, je Boden `id`, `name`, `w`, `h` und `tile` (SVG 1:1, `w`/`h` = doppelte Kachelgröße wie bei den bisherigen Böden, Kachel beginnt an der Bodenkante y=100). Geprüft: pixelgleich zu den PNGs.
- Einzelne Kacheln: `boeden2/wohnraum_*.png`, `boeden2/diele_*.png`. Ganze Räume: `boeden2/vorschau_*.png`.
- Erzeugt mit `python3 werkzeug/boeden2.py boeden2`.
- Offen: Ersetzen die neuen Wohnraum-Böden die bisherigen 12, oder kommen sie dazu?

## Runde 9: eigene Tapetenfarben im Möbel-Menü, Böden geprüft

### Tapetenfarben selbst wählen
- Wunsch: Für jede Tapete lassen sich die Farben selbst anpassen, alles unten im Möbel-Menü.
- Entwurf: `vorschau/moebelmenue_tapetenfarben.png`. Unter „Tapete auswählen“ kommen zwei Titel mit je einer Reihe von 10 kleinen Feldern: **Grundfarbe** und **Musterfarbe**. Das erste Feld ist „Original“ und zeigt die Tapete selbst. Die übrigen Grundfarben-Felder sind voll gefüllt, die Musterfarben-Felder zeigen eine Pixel-Raute in der Farbe auf dem aktuellen Grund. Es gibt keine Erklärtexte. Die gewählte Farbe hat den orangen Rahmen wie eine gewählte Möbelkarte, das Zimmer färbt sich sofort um.
- Die Farben stehen in `tapeten/farben.json` (Namen und Hexwerte, `null` = Original): Grund Creme, Weiß, Salbei, Altrosa, Himmelblau, Butter, Lavendel, Tannengrün, Nachtblau. Muster Haselnuss, Rosa, Kirschrot, Blattgrün, Taubenblau, Honig, Flieder, Weiß, Mokka.
- Umfärben: `werkzeug/tapete_farben.js` → `recolorWallSvg(svg, grund, muster)`. Die Funktion arbeitet direkt auf jedem Tapeten-SVG, alt und neu, ohne Zusatzdaten. Grund ist die häufigste Farbe der Kachel. Alle anderen Farben gelten als Muster: Ihr Mittelwert wandert zur gewählten Musterfarbe, aber höchstens bis zum 1,4-Fachen des ursprünglichen Kontrasts. So bleiben ruhige Tapeten ruhig, helle Punkte und dunkle Linien bleiben als Abweichung erhalten. Geprüft: Bei allen 20 Tapeten wird der Grund richtig erkannt. In allen 2000 Kombinationen liefern JS und Python (`werkzeug/tapete_farben.py`) identische Farben.
- Beispiele für alle 20 Tapeten in 5 Kombinationen: `tapeten/farben_beispiele.png`.
- Speichern: je Tapete die gewählte Grund- und Musterfarbe (Index in den beiden Listen) neben der Tapeten-ID. Beim Wechsel der Tapete gilt deren gespeicherte Wahl.

### Böden
- Alle 12 Böden aus `mock2/room3.json` → `floor` passen in den neuen Raum: `boeden/uebersicht_x2.png`, einzeln `boeden/vorschau_*.png`. Die Diele behält ihren festen Schachbrettboden, der Boden-Slot gilt ab dem Holzpfosten. Gezeichnet mit `werkzeug/boeden.py`.
- **Fehler gefunden:** Der Standardboden „Helle Dielen“ wird heute um ein Drittel gestreckt. `build.py` (Zeile 96) setzt `floor[0].tile` auf `interior2.json` → `floor_planks` (viewBox 36×12), lässt aber `w`=96/`h`=36 der alten Kachel stehen. Angezeigt wird `w/2` = 48 statt 36 Raumpixel. Fix: `w`=72, `h`=24 setzen. Alle anderen Böden und alle Tapeten werden 1:1 angezeigt. Die Vorschauen in `boeden/` zeigen die Dielen schon ungestreckt.

## Runde 8: neue Tapeten, Türen aus dem Tür-Slot als Haustür (freigegeben)

### Tapeten
- Wieland wollte deutlich verschiedene Tapeten, nicht nur neue Farben. Die reinen Farbvarianten der Rautentapete sind verworfen und entfernt.
- 10 neue Tapeten mit eigenen Mustern, alle mit wenig Kontrast, damit die Wand ruhig bleibt: Grüne Ranken, Rosé-Damast, Bonbonstreifen, Fächermuster, Waldpilze, Rosenspalier, Kirschen, Strickmuster, Bienenwaben, Backstein. Sie unterscheiden sich auch von den bisherigen zehn (Creme, Mintstreifen, Rosa Punkte, Blaues Karo, Blümchen, Sonnenblumen, Sternennacht, Holzpaneele, Herzchen, Wolkenhimmel).
- `tapeten/tapeten_neu.json` enthält je Tapete `id`, `name`, `w`, `h` und `tile`, ein nahtlos kachelndes SVG im Format von `furn2.json` → `wall` (Kachel 1:1, `w`/`h` wie bei den bisherigen Einträgen doppelt so groß wie die viewBox). Geprüft: pixelgleich zu den PNGs.
- `tapeten/tapete_*.png` sind die Kacheln, `tapeten/vorschau_*.png` das ganze Zimmer (Diele mit Grüner Landhaustür) mit jeder Tapete, `tapeten/uebersicht_x2.png` alle zusammen.
- Erzeugt mit `python3 werkzeug/tapeten2.py tapeten`.
- Freigegeben (Runde 9). Bei den Waldpilzen sind die Stiele jetzt weiß mit Schattenkante, vorher waren sie kaum vom Grund zu unterscheiden.
- Offen: Kommen sie zu den bisherigen Tapeten dazu, oder ersetzen sie einige?

### Türen
- Ohne Terrassentür wird der Tür-Slot zur Haustür in der Diele. Die sechs Modelle aus `mock2/room3.json` → `door` passen unverändert: Weiße Terrassentür, Holztür mit Bullauge, Grüne Landhaustür, Bogentür, Blaue Sprossentür, Rote Scheunentür. Rahmen und Türblatt bleiben getrennt, das Aufgehen funktioniert also weiter.
- Weil die Türen 48 px breit sind (meine gezeichnete Haustür war 32 px), wird die Diele 12 px breiter: `diele_breite` 88 statt 76, altes Zimmer ab x=96 statt 84, Raum 342 px breit. Tür bei x=4, Unterkante y=99, Fußmatte 40 px breit, Hakenleiste und Bank bei x=58, Holzpfosten bei x=92.
- Hinter den Glasflächen zeigt das Spiel den Garten wie bisher an der Terrassentür. In der Vorschau ist dafür der Garten aus dem Erkerfenster eingesetzt.
- Der Weg in den Garten führt dann durch die Haustür.
- Vorschau: `vorschau/tueren_diele_x4.png` (alle sechs), ganze Räume in `vorschau/tuer-*.png`, Positionen in `layout_landhaus.json` unter `tuer-*`.

## Runde 5 bis 7: neue Sessel freigegeben, neue Grammophone

### Sessel: zum Einbau freigegeben
- Wieland hat alle 10 neuen Sessel freigegeben. Sie **ersetzen die bisherigen 10 Sessel vollständig**.
- `sessel/chairs_neu.json` hat dasselbe Format wie `mock2/chairs_new.json`: je ID `id`, `name`, `w`, `h`, `seat`, `svg` mit SVG-Pfaden 1:1, pixelgleich zu den PNGs geprüft. Die neuen Sessel übernehmen die IDs der alten, damit gespeicherte Einrichtungen gültig bleiben:
  - `wing_red`: Ohrensessel mit Strickdecke
  - `wing_check`: Karierter Großvatersessel
  - `velvet`: Muschelsessel
  - `club`: Chesterfield
  - `beanbag`: Teddy-Sessel (behält die `squish`-Animation)
  - `rocking`: Schaukelstuhl mit Patchwork
  - `egg`: Gelber Rundsessel
  - `strandkorb`: Korbsessel mit Schaffell
  - `peacock`: Blümchen-Ohrensessel
  - `sofa`: Cord-Kuschelsessel
- Hinweis für den Einbau: `build.py` überschreibt heute `chair[0]` (wing_red) mit `interior2.json` → `chair_wing_red` und mischt `chairs_new.json` ein (`club`, `egg`). Beide Überschreibungen müssen durch `chairs_neu.json` ersetzt werden.
- Umwandeln aus den PNGs: `python3 werkzeug/sessel_svg.py sessel`.

### Grammophone
Die Entwürfe aus Runde 4 (frontaler Trichter), Runde 5 (Schwanenhals zum Sessel) und Runde 6 (vier Grundformen) sind verworfen, ihre Dateien entfernt.

**Runde 7, zur Auswahl:** ein neu konstruiertes, klassisches Grammophon, leicht von oben gesehen. Der Kasten hat eine sichtbare Oberseite, auf der die Platte als Scheibe liegt. Hinten links sitzen Schalldose und Tonarm, von dort steigt ein gerader Blütentrichter nach rechts oben auf, mit glattem Goldrand und dunklem Inneren. Vorn am Kasten ist ein Messingschild, rechts die Kurbel, unten Messingfüße. Es steht auf einem ruhigen Plattenschrank mit zwei Türen und einem offenen Fach voller Plattenhüllen. Vier Farben: 1 Messing, 2 Kupfer, 3 Tannengrün, 4 Kirschrot (dunklerer Kasten).
- Übersicht: `vorschau/grammophon4_optionen_x4.png`, ganze Räume in `vorschau/grammophon4-*.png`, Teile in `teile/grammophon4-*` (`grammophon`, `grammophon_moebel`).
- Positionen (alt): Plattenschrank x=106, Unterkante y=106. Pinnwand bei y=10, zwischen Pinnwand und Trichter bleiben 2 px Luft.
- Gezeichnet mit `werkzeug/grammophon4.py`.

## Runde 4: 1D, Pinnwand über dem Grammophon, Grammophon-Entwürfe, 10 neue Sessel
- **1D** (`vorschau/variante-1d*`) unterscheidet sich von 1C so: Die Pinnwand (`pcBoard`) hängt über dem Grammophon (alt x=103, y=12), das Wandbrett ist entfernt. Über dem ersten Regal ist die Wand jetzt frei. Das Grammophon steht 4 px weiter vorn (Unterkante y=106 statt 102), also etwas von der Wand weg. Das Schiffsbild bleibt über dem zweiten Regal.
- Das Schiffsmodell (`pcModel`) stand bisher auf dem Wandbrett und braucht einen neuen Platz. Den legt Wieland noch fest.
- **Grammophon-Entwürfe A bis D:** von Wieland verworfen, Dateien entfernt. Neue Entwürfe siehe Runde 5.
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
