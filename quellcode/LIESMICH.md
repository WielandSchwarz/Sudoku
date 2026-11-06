# Quellcode des Hamster-Spiels

- `spiel/` – alle Quelldateien (JS, CSS, JSON mit Pixel-Art, Python-Generatoren). `python3 spiel/build.py` baut die Vorschau nach `/home/claude/hamster-preview.html` (Ziel mit `HAMOUT=...` änderbar).
- `mock2/`, `wild/`, `wlde/` – weitere Grafikdaten, die `build.py` braucht.
- `werkzeuge/` – Python-Generatoren für Sprites (Ernte `hvart`, Abwasch `dish`).

## Zusammenarbeit mehrerer Chats
- Dieser Ordner wird **nur vom Haupt-Chat** geändert. Andere Chats lesen ihn nur.
- Neue Assets kommen in **`assets-neu/`** (eigener Unterordner pro Thema, z. B. `assets-neu/kapitaen-schiffe/`), mit kurzer Notiz, was es ist und wo es hin soll.
- Der Haupt-Chat holt `assets-neu/` und baut die Teile ein.

## Gestaltungsregeln
Alle Pixel gleich groß (nie skalieren, größere Grafik = mehr Pixel) · 1px-Umrisse · ruhige Hintergründe, detaillierte Vordergründe · weiter unten = weiter vorne · keine Hände/Pfoten-Animationen · keine gelben Kreise · wenig Text, nur ein Popup zugleich · Texte auf Deutsch.

## Wohnzimmer mit Diele (eingebaut aus assets-neu/wohnzimmer-diele)
- Die Diele liegt links vom alten Zimmer bei x -96 bis -4, die Wand endet bei 246. Die Kamera läuft von -96 bis 66 (`wide.js`).
- `diele.json` wird mit `werkzeug/diele_assets.py` aus `assets-neu/wohnzimmer-diele` erzeugt: Wandbild, Vertäfelung, Grammophon (4 Farben), neue Sessel, Böden für Wohnraum und Diele, neue Tapeten, Tapetenfarben.
- `wallcol.js` ist `werkzeug/tapete_farben.js` aus dem Asset-Ordner (Umfärben der Tapeten).
