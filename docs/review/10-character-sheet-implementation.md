# Implementierungsbericht Charakterbogen 0.1.1

## Ergebnis

Der rudimentäre statische Bogen wurde durch eine modulare Spieloberfläche mit
zehn Ansichten ersetzt. Creator und Bogen verwenden dasselbe
`CharacterDocument`, denselben Katalog und genau einen Aufruf der Rules Engine.

Implementiert sind interaktive TP und Undo, Zustände, kontrollierte manuelle
Modifikatoren, Angriffe und Würfe, Aktionen und Nutzungen, sortierbare
Fertigkeiten, deduplizierte Merkmale, Zauberplätze, aktives Inventar,
generische Ressourcen und Rast, Biografie, mehrere Sitzungsnotizen,
Session-Verläufe, JSON-Roundtrip, Statblock und eigenständiger A4-Druck.

## Architektur

- Character-Format 3 trennt `build` und Session State Version 1.
- Reine Session-Operationen liegen in der frameworkfreien Rules Engine.
- Strukturierte Session-Effekte verwenden die normale Effektpipeline.
- `CharacterSheetModel`, `CharacterPrintModel` und Statblock sind Projektionen
  desselben Engine-Ergebnisses.
- Bogen und Markdown-Details werden dynamisch geladen.
- Der Katalog liegt in einem eigenen Build-Chunk.

## Performance

Vorheriger Einzelchunk:

- JavaScript: 1.920,40 kB, 299,92 kB gzip

Build 0.1.1 nach Aufteilung:

- Startcode: 373,75 kB, 111,57 kB gzip
- Katalog: 1.379,01 kB, 137,65 kB gzip
- Charakterbogen: 59,60 kB, 15,11 kB gzip
- Markdown-Details: 165,31 kB, 50,52 kB gzip

Der Charakterbogen und Markdownrenderer werden erst beim Öffnen geladen.
Offline-Betrieb bleibt erhalten, weil alle Chunks lokale Build-Artefakte sind.

## Bewusste Grenzen

- Freie Zustände und Freitextregeln verändern keine Werte automatisch.
- Vorbereitete Einzelzauber werden ohne strukturiertes Katalogmodell nicht
  erfunden.
- Mehrfachangriffsvarianten erscheinen erst mit strukturierten Engine-Daten.
- PDF-Ausgabe verwendet den verlässlichen Browserdruck.
- Währungen bleiben Anzeigeinhalt, bis ein strukturiertes Währungsmodell
  existiert.
