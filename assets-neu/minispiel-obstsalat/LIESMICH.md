# Minispiel „Obstsalat“ (Entwurf zum Ausprobieren)

Wunsch von Wieland: ein Minispiel ähnlich Fruit Ninja, passend zum Hamster-Spiel.

**Status:** spielbare Vorschau, Runde 3 (schönerer Garten, 60-Sekunden-Timer mit Punkten statt Füllbalken, Kastanie kostet 10 Punkte). Runde 2 brachte: höher, größer, mehr Obst, Kombo-Animation, Sonder-Früchte. Bitte erst einbauen, wenn Wieland sie freigegeben hat.

## Spielablauf (Runde 3)
- Obst und Gemüse fliegen von unten aus der Wiese bis weit nach oben (Scheitelpunkt bei y=14 bis 48). Mit einem Wisch wird es zerschnitten: Das Stück teilt sich entlang der Wischrichtung in zwei Hälften mit Fruchtfleisch und Kernen an der Schnittkante, dazu Saftspritzer.
- Die Früchte sind größer und mit mehr Pixeln neu gezeichnet (18 bis 29 px), nicht vergrößert.
- **Immer mehr:** Das Obst kommt in Salven. Die Salven werden mit der Zeit größer (1 bis 7 Stück) und kommen schneller. Immer öfter fliegen die Früchte dicht beieinander, damit große Kombos möglich sind.
- **Timer statt Balken:** Eine Runde dauert 60 Sekunden. Oben links stehen zwei kleine Schilder in der App-Schrift: Apfel mit Punktzahl, Sanduhr mit Restzeit. In den letzten 10 Sekunden wird das Uhr-Schild orange und hüpft jede Sekunde. In der Zeitlupe läuft auch die Uhr langsamer.
- Jede Frucht gibt 1 Punkt und füllt die Salatschüssel neben dem Hamster (voll ab 80 Punkten).
- **Kombo** (3 oder mehr Früchte in einem Wisch): Bonus von Anzahl − 1 Punkten. Ein Abzeichen „3er-Kombi“ mit „+2“ springt in Stufen auf, wackelt und schwebt weg, die Farbe hängt von der Größe ab (orange, rosa, lila, blau). Bunte Pixel-Konfetti in den Farben der geschnittenen Früchte fliegen, helle Strahlen schießen vom letzten Treffer aus, der Hamster freut sich mit Doppelsprung. Ab 5 Früchten blitzt das Bild kurz hell auf.
- **Sonder-Früchte** (etwa alle 11 bis 17 Sekunden eine, mit blinkendem Leuchtrand entlang des Umrisses):
  - Frostbeeren: **Zeitlupe** für 5 Sekunden. Alles fliegt langsamer, an den Rändern zieht Frost mit Eiszapfen auf, das Bild wird kühler.
  - Sonnenblume: **doppelte Punkte** für 7 Sekunden, „×2“ unter der Punktzahl.
  - Honigwabe: **Obstregen** für 4 Sekunden. Von links und rechts fliegt Obst quer durchs Bild.
  - Der aktive Effekt steht als Banner oben, mit kleiner Zeitleiste darin.
- Der goldene Apfel ist selten und bringt +4.
- **Bombe = Stachelkastanie:** Sie zittert leicht in der Luft. Wer sie zerschneidet, löst einen weißen Blitz aus, Stacheln fliegen, das übrige Obst wird weggestoßen, der Hamster erschrickt, und es gibt **−10 Punkte** (nicht unter 0). Das Punkte-Schild wackelt rot. Die Runde läuft weiter. Ab 6 Sekunden taucht sie auf, mit der Zeit etwas häufiger (bis 20 % pro Stück einer Salve). Herunterfallendes Obst kostet weiterhin nichts. Der Tannenzapfen aus Runde 1 kommt nicht mehr vor.
- **Ende:** Zeit abgelaufen oder Hamster angetippt. Die große Ergebnis-Schüssel ist so voll wie die Punkte (voll ab 80), darunter Titel und Punktzahl groß. Titel: „Neuer Rekord!“ (Bestwert im Browser gespeichert), sonst „Obstsalat!“ ab 80, „Kleiner Obstsalat“ ab 40, „Ein paar Stückchen“. Antippen startet neu.
- Es gibt keine Knöpfe im Spiel außer dem ×, keine Erklärtexte, keine Hand- oder Pfotenanimation.

## Umgebung
- Gartenszene in vier Jahreszeiten (`grafik/bg_*.png`), Runde 3 neu gezeichnet: Himmel in weichen Stufen mit runden Wolken, zwei Hügelketten (hinten mit kleinen Bäumen), Hecke aus beleuchteten Blattballen, davor ein weißer Lattenzaun, zwei Obstbäume mit Rinde und Wurzelansatz, Wiese mit Grasbüscheln und Blumen, vorne hohe Grashalme als Rahmen. Frühling mit Blüten, Sommer mit Äpfeln, Herbst mit buntem Laub und Blättern im Gras, Winter mit Schnee auf Hecke und Zaun und kahlen Ästen.
- Tageszeit nach der Uhr (Tag, Abend, Nacht mit Sternen und Glühwürmchen), Wetter (Sonne, Wolken, Regen, Schnee). Im Spiel sollen `season()`, `daylight()` und `weather.type` diese Werte liefern.
- Welche Früchte fliegen, hängt von der Jahreszeit ab (Gewichte in `obstsalat_art.json` → `fruit.*.weights`): im Sommer viele Beeren und Tomaten, im Herbst Äpfel, Birnen, Kürbis.

## Dateien
- `vorschau.html`: spielbare Vorschau mit Schaltern für Jahreszeit, Tageszeit und Wetter.
- `obstsalat.js`: das Spiel als eine Funktion `mountObstsalat(root, ART, opts)` → `{ setEnv, restart, destroy, state }`. Es zeichnet auf ein Canvas mit 180×135 Raumpixeln, alle Positionen auf ganze Pixel gerundet, nichts wird gedreht oder skaliert.
- `obstsalat.css`: Banner und × im Stil von `.bee-pov .bp-ban` / `.bp-x`.
- `grafik/`: alle Grafiken einzeln als PNG und gebündelt in `obstsalat_art.json` (Data-URIs).
  - Früchte, neu gezeichnet (18 bis 29 px, 1px-Umriss): Apfel, Birne, Pflaume, Erdbeere, Tomate, Möhre, Kürbis, Kirschen, Goldapfel. Sonder-Früchte: Frostbeeren, Sonnenblume, Honigwabe. Bombe: Stachelkastanie. Je Stück Fruchtfleisch- und Kernfarbe für die Schnittkante. Der Tannenzapfen liegt noch bei, wird aber nicht mehr benutzt.
  - Salatschüssel in 4 Füllständen, große Schüssel für das Ergebnis.
  - Icons für die Anzeige: Apfel und Sanduhr (je 9 px), werden in Raumpixel-Größe angezeigt (`--os-px` = Breite / 180).
  - Hamster aus den Ebenen von `ham2.json` zusammengesetzt (normal, froh, Schreck, blinzeln), 48×46 in Originalpixeln.
- `werkzeug/obstsalat_assets.py` erzeugt `grafik/`, `werkzeug/vorschau_bauen.py` baut `vorschau.html`.

## Hinweise zum Einbau
- Als eigene Ansicht wie die anderen Minispiele (`bee-pov`), die Wetterschicht kann die vorhandene `.bp-env` übernehmen.
- Wo im Spiel das Minispiel startet und was es als Belohnung gibt (z. B. eine Portion Obstsalat zum Füttern), ist noch offen.
