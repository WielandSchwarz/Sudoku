# Einbau: neues Wohnzimmer mit Diele (freigegebener Stand)

Kurzfassung für den Haupt-Chat. Hier steht nur, was Wieland freigegeben hat. Den ganzen Verlauf mit allen Runden enthält `LIESMICH.md`. Alle Pfade sind relativ zu `assets-neu/wohnzimmer-diele/`.

## 1. Raum
- Vorlage: `vorschau/tuer-sage.png` (Originalpixel) und `vorschau/tuer-sage_x4_mit_hamster.png`. Alle Positionen stehen in `layout_landhaus.json` unter `varianten` → `tuer-sage` → `teile`: x, y, w, h, Ebene, Zeichenreihenfolge und je Teil ein PNG in `teile/tuer-sage/`.
- Raumbreite 342 px statt 360. Links liegt die Diele (0 bis 88), dann der Holzpfosten als Trenner (bei x=92), ab x=96 das Wohnzimmer. Neue Koordinate = alte Wohnzimmer-Koordinate + 96. Die Wand endet bei alt x=246, direkt hinter der früheren Klavierstelle.
- **Weg fallen:** Terrassentür, Klavier mit Hocker, Erkerfenster mit Fensterbank, Gitarre, Ampelpflanzen, rechter Teppich, Gummibaum, Wandbrett über dem Klavier.
- **Diele:** Haustür aus dem Tür-Slot bei x=4 (Unterkante y=99), Fußmatte, Hakenleiste mit Mantel, Strohhut und Schal bei x=58, darunter die Bank mit Gummistiefeln, Holzvertäfelung ab y=62.
- **Wohnzimmer, von links (alte x):** Regal x=1 (Slot), Stehlampe x=39 (Slot), Sessel x=55 (Slot), Plattenschrank mit Grammophon x=106 mit Unterkante y=106 (4 px vor der Wand), Geranie x=160 vor dem Fenster (Slot), zweites Bücherregal x=210, oben y=54 (feste Deko, `teile/tuer-sage/regal_zwei.png`). Teppich x=62.
- **Wand:** Uhr über dem Sessel (x=63, Slot). Pinnwand `pcBoard` über dem Grammophon (x=103, y=10). Fenster mit Vorhängen und Stange, Mitte x=180, oben y=26. Hinter dem Glas soll die Gartenszene mit Tageszeit und Wetter erscheinen. Schiffsbild `dzPic` über dem zweiten Regal (x=216, y=24).
- **Anzupassen:** `L.*`, `SPOT.*` und `L.clockCx` in `app.js` auf die neuen Plätze, Kamera-Grenze auf 342 px Breite. Das Schiffsmodell `pcModel` stand auf dem Wandbrett und braucht einen neuen Platz, den Wieland noch festlegt. Der Weg in den Garten führt jetzt durch die Haustür.

## 2. Grammophon
- Form freigegeben: `werkzeug/grammophon4.py`, Teile in `teile/tuer-sage/grammophon.png` und `grammophon_moebel.png` (Plattenschrank).
- Vier Farben: Messing, Kupfer, Tannengrün, Kirschrot (`vorschau/grammophon4_optionen_x4.png`, `teile/grammophon4-*`). Vorschlag: als eigene Auswahl im Möbel-Menü anbieten, Standard Messing. Wieland hat noch keine Farbe festgelegt.
- Der Hamster spielt künftig am Grammophon statt am Klavier (`playPiano`).

## 3. Sessel (ersetzen alle 10 bisherigen)
- `sessel/chairs_neu.json`, gleiches Format wie `mock2/chairs_new.json`, die IDs der alten Sessel bleiben erhalten. Die Zuordnung der Namen steht in `LIESMICH.md`, Runde 5.
- Die Überschreibungen in `build.py` (`chair[0]` aus `interior2.json` und das Einmischen von `chairs_new.json`) durch `chairs_neu.json` ersetzen.

## 4. Türen
- Die 6 Türen aus `mock2/room3.json` → `door` werden unverändert zur Haustür in der Diele. Das Aufgehen bleibt erhalten.

## 5. Tapeten
- 10 neue Tapeten in `tapeten/tapeten_neu.json`, im Format von `furn2.json` → `wall`. Sie kommen zu den bisherigen 10 dazu, falls Wieland nichts anderes sagt.
- **Farben selbst wählen:** Im Möbel-Menü unter „Tapete auswählen“ kommen zwei Reihen mit je 10 Feldern, „Grundfarbe“ und „Musterfarbe“, das erste Feld ist „Original“. Entwurf: `vorschau/moebelmenue_tapetenfarben.png`. Farben in `tapeten/farben.json`, Umfärben mit `werkzeug/tapete_farben.js` → `recolorWallSvg(svg, grund, muster)` für jede Tapete. Je Tapete die gewählten Indizes speichern.

## 6. Böden
- Getrennte Auswahl für Wohnraum und Diele, im Möbel-Menü unter „Boden“ mit zwei Titeln.
- `boeden2/boeden_auswahl.json`: Wohnraum 7 (Honig-Eiche, Walnuss breit, Chevron-Eiche, Tafelparkett, Kork, Kelim-Streifen, Blauer Sternenteppich), Diele 6 (Schachbrett Marmor, Schieferplatten, Rauten rot-creme, Sandsteinplatten, Holzpflaster, Klinker im Fischgrät). Sie **ersetzen** die bisherigen 12 Böden.
- Standard: Wohnraum Honig-Eiche, Diele Schachbrett Marmor. Der Diele-Boden reicht bis zum Holzpfosten (x=91). Gespeicherte alte Boden-IDs fallen auf den Standard.
- Alle Kacheln 1:1, `w`/`h` = doppelte Kachelgröße wie bei den bisherigen Einträgen.

## 7. Bekannte Abweichung
- Die 10 Pflanzen in `plants.json` werden mit `scale(0.8333)` gezeichnet, ihre Pixel sind also kleiner als die Raumpixel.

## Übersichten
- Möbelkatalog mit allen auswählbaren Teilen: Artifact „Wohnzimmer-Möbelkatalog“.
- Werkzeuge zum Neuerzeugen: `werkzeug/` (siehe `LIESMICH.md`).
