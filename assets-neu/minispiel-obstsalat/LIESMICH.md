# Minispiel „Obstsalat“ (Entwurf zum Ausprobieren)

Wunsch von Wieland: ein Minispiel ähnlich Fruit Ninja, passend zum Hamster-Spiel.

**Status:** spielbare Vorschau. Bitte erst einbauen, wenn Wieland sie freigegeben hat.

## Spielablauf
- Obst und Gemüse fliegen von unten aus der Wiese hoch. Mit einem Wisch wird es zerschnitten: Das Stück teilt sich entlang der Wischrichtung in zwei Hälften mit Fruchtfleisch an der Schnittkante, dazu ein paar Saftspritzer.
- Jede Frucht füllt die Salatschüssel neben dem Hamster und den Fortschrittsbalken. Der Balken ist ein Holzrahmen mit Nägeln, senkrecht am linken Rand, mit durchgehender Füllung und goldenem Optimalbereich oben, ohne Beschriftung.
- Mehrere Früchte in einem Wisch geben einen Bonus (+1 je Frucht ab der dritten), der Hamster freut sich und hüpft. Der goldene Apfel ist selten und bringt +4.
- Tannenzapfen soll man nicht schneiden: Ein Schnitt kostet 4, der Balken blinkt, das Bild wackelt kurz, der Hamster erschrickt. Herunterfallendes Obst kostet nichts.
- Je voller die Schüssel, desto mehr fliegt gleichzeitig.
- Ist der Balken voll, ist der Obstsalat fertig: Das Bild wird abgedunkelt, eine große, eigens gezeichnete Schüssel erscheint mit einem großen Titel. Wer den Hamster antippt, beendet die Runde früher. Der Titel richtet sich dann nach der Füllung („Kleiner Obstsalat“, „Ein paar Stückchen“).
- Es gibt keine Knöpfe im Spiel außer dem ×, keine Erklärtexte, nur das Banner „Obstsalat“ am Anfang. Es gibt keine Hand- oder Pfotenanimation, der Hamster reagiert mit dem Gesicht und einem kleinen Hüpfer des ganzen Körpers.

## Umgebung
- Gartenszene in vier Jahreszeiten (`grafik/bg_*.png`): Himmel, Hügel, Hecke, zwei Obstbäume am Rand, Wiese. Frühling mit Blüten, Sommer mit Äpfeln, Herbst mit buntem Laub, Winter mit Schnee auf Hecke und kahlen Ästen.
- Tageszeit nach der Uhr (Tag, Abend, Nacht mit Sternen und Glühwürmchen), Wetter (Sonne, Wolken, Regen, Schnee). Im Spiel sollen `season()`, `daylight()` und `weather.type` diese Werte liefern.
- Welche Früchte fliegen, hängt von der Jahreszeit ab (Gewichte in `obstsalat_art.json` → `fruit.*.weights`): im Sommer viele Beeren und Tomaten, im Herbst Äpfel, Birnen, Kürbis.

## Dateien
- `vorschau.html`: spielbare Vorschau mit Schaltern für Jahreszeit, Tageszeit und Wetter.
- `obstsalat.js`: das Spiel als eine Funktion `mountObstsalat(root, ART, opts)` → `{ setEnv, restart, destroy, state }`. Es zeichnet auf ein Canvas mit 180×135 Raumpixeln, alle Positionen auf ganze Pixel gerundet, nichts wird gedreht oder skaliert.
- `obstsalat.css`: Banner und × im Stil von `.bee-pov .bp-ban` / `.bp-x`.
- `grafik/`: alle Grafiken einzeln als PNG und gebündelt in `obstsalat_art.json` (Data-URIs).
  - Früchte, neu gezeichnet und größer als die Beet-Sprites (12 bis 19 px, 1px-Umriss): Apfel, Birne, Pflaume, Erdbeere, Tomate, Möhre, Kürbis, Kirschen, dazu Goldapfel und Tannenzapfen. Je Frucht Fruchtfleisch- und Kernfarbe für die Schnittkante.
  - Salatschüssel in 4 Füllständen, große Schüssel für das Ergebnis.
  - Hamster aus den Ebenen von `ham2.json` zusammengesetzt (normal, froh, Schreck, blinzeln), 48×46 in Originalpixeln.
- `werkzeug/obstsalat_assets.py` erzeugt `grafik/`, `werkzeug/vorschau_bauen.py` baut `vorschau.html`.

## Hinweise zum Einbau
- Als eigene Ansicht wie die anderen Minispiele (`bee-pov`), die Wetterschicht kann die vorhandene `.bp-env` übernehmen.
- Wo im Spiel das Minispiel startet und was es als Belohnung gibt (z. B. eine Portion Obstsalat zum Füttern), ist noch offen.
