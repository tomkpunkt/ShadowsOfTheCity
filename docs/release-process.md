# Release-Prozess

## Voraussetzungen

- frischer Checkout des gewünschten Commits
- Node.js 22 oder neuer
- npm
- installierte Chromium-Binaries für die abschließenden E2E-Tests

## Reproduzierbarer Build

```bash
npm ci
npx playwright install chromium
npm run verify
npm run release:build
npm run release:verify
```

`release:build` führt zuerst den vollständigen Produktionsbuild aus, löscht nur
die geprüften generierten Verzeichnisse `dist/` und `release/`, kopiert die
statische Anwendung und ergänzt Katalog, Manifest, Lizenz-, Quellen-,
Drittlizenz-, Versions- und Buildinformationen.

Der ZIP-Writer sortiert alle Pfade, verwendet eine feste Archivzeit und
speichert die Dateien ohne plattformabhängige Metadaten. Identische Eingaben
erzeugen deshalb byteidentische ZIP-Dateien.

## Artefakte

```text
dist/
release/shadows-of-the-city-0.1.1.zip
release/shadows-of-the-city-0.1.1-checksums.txt
release/shadows-of-the-city-0.1.1-build-report.md
```

`release:verify` prüft:

- SHA-256-Prüfsumme des ZIPs
- konsistente Versionen aller Workspaces
- Content-Schema- und Character-Format-Version
- Katalog-Hash und exakt 737 Entitäten
- alle erforderlichen Laufzeitdateien
- Ausschluss von Tests, Source Maps, Screenshots, Caches und Git-Dateien

## Veröffentlichung

1. Arbeitsbaum und finalen Commit prüfen.
2. `npm ci` in einem frischen Checkout ausführen.
3. vollständige Abschlussprüfung ausführen.
4. Release erneut bauen und verifizieren.
5. ZIP, Checksums und Buildbericht gemeinsam veröffentlichen.
6. Prüfsumme des veröffentlichten ZIPs mit der Textdatei vergleichen.

Die generierten Verzeichnisse sind absichtlich über `.gitignore` ausgeschlossen.
Der Buildbericht hält den Quellcommit, Versionen, Katalogzahlen,
Regelklassifikation, Testergebnis und bekannte Einschränkungen fest.
