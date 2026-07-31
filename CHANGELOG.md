# Changelog

Alle wesentlichen Änderungen dieses Projekts werden hier dokumentiert.

## 0.1.1 - 2026-07-31

### Hinzugefügt

- spielbarer Charakterbogen mit zehn persistenten Bereichen für Desktop und
  Mobil
- Character-Format 3 mit getrenntem Build und Session State Version 1
- Schaden, Heilung, temporäre TP, Undo und sichtbarer TP-Verlauf
- Zustände, manuelle Modifikatoren, Ressourcen, Rast und Aktionsnutzungen
- Angriffs-, Fertigkeits-, Rettungs- und Schadenswürfe mit validierten Formeln
- Zauberplatzverbrauch, aktives Inventar, Munition, Verbrauch und Notizen
- mehrseitiger A4-Druck/PDF, kompakter Statblock und Session-JSON-Roundtrip
- Format-2-Migration, beschädigungsresistente Session-Wiederherstellung und
  kontrollierte Bereinigung verwaister Einträge

### Geändert

- Charakterbogen und Markdown-Details werden bei Bedarf als eigene Chunks
  geladen; der Katalog liegt in einem separaten Build-Chunk
- Startcode von 1.920,40 kB auf 373,75 kB reduziert
- Creator-Rücksprünge öffnen direkt Zauber, Talente oder Ausrüstung
- letzter Creator-/Bogenbereich wird lokal wiederhergestellt

### Entfernt

- rudimentäre statische Character-Sheet-Komponente und deren tote CSS-Regeln
- paralleler Format-2-Speicherpfad als aktuelles Charakterformat

### Bekannte Einschränkungen

- Situative Freitextregeln und freie Zustände werden angezeigt, aber nicht
  automatisch verrechnet.
- Vorbereitete Einzelzauber, Währungen und Angriffsvarianten benötigen weitere
  strukturierte Katalogdaten.
- Direkter PDF-Download wird nicht dupliziert; PDF wird zuverlässig über den
  Browserdruck erzeugt.

## 0.1.0 - 2026-07-30

### Hinzugefügt

- Deterministische, frameworkfreie Rules Engine für Werte, Kompetenzen, Grants,
  Ressourcen, Bewegung, Aktionen, Angriffe, Zauber und Bedingungen
- rekursives Voraussetzungssystem mit `all`, `any` und `not`
- vollständige Herkunftsnachweise für berechnete Charakterwerte
- Character-Format 2 mit Katalog-Hash und versionierter Legacy-Migration
- zentrale Alias-Tabelle für zehn alte IDs
- vollständig integrierter Character Builder mit Abschnittsstatus,
  Kompatibilitätsanzeige, Import, Export, Speicherung und Druckansicht
- zwölf validierte Contentvorlagen und CLI für Anlage, Prüfung, Erklärung und
  Referenzanalyse
- reproduzierbarer Testbuild mit ZIP, SHA-256-Prüfsumme und Buildbericht
- Architektur-, Content-, Unit-, Integrations- und Browserprüfungen in CI

### Geändert

- 737 Entitäten in einen strikt validierten, stabil sortierten Katalog
  überführt
- zentrale Charakterwirkungen als 41 strukturierte Regelknoten formalisiert
- alle 410 verbleibenden Textregeln eindeutig klassifiziert
- Content-, Compiler-, Speicher- und UI-Fehlergrenzen ohne stille Fallbacks
  gehärtet
- produktive Berechnungslogik vollständig aus der UI entfernt

### Entfernt

- parallele produktive Legacy-Datenpfade und alte Charakterrepräsentationen
- Source Maps, Tests, Screenshots, Caches und Zwischenstände aus dem
  Release-Artefakt
- nachweislich tote oder redundante Übergangspfade gemäß Cleanup-Bericht

### Bekannte Einschränkungen

- 381 teilweise strukturierte und 27 reine Anzeigetextregeln bleiben für
  situative Wirkungen erhalten.
- Zwei fachliche Regelfragen sind blockiert; 13 Entwurfsentitäten bleiben
  gesperrt.
- Balanceentscheidungen oberhalb Stufe 1 benötigen weitere Spieltests.
