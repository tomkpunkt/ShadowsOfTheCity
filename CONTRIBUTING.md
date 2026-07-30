# Mitwirken

## Voraussetzungen

- Node.js 22 oder neuer
- npm aus der Node-Installation
- Chromium für E2E: `npx playwright install chromium`

## Einrichtung

```bash
npm ci
npm run content:validate
npm run dev
```

Die Anwendung läuft standardmäßig unter `http://127.0.0.1:5173`; für
Playwright wird Port 4173 verwendet.

## Änderungen

- Erstelle einen thematischen Branch.
- Halte IDs stabil und verwende Referenzen statt Anzeigenamen.
- Bearbeite Regeln im Authoring-Layer unter `content/`.
- Erzeuge nach Contentänderungen den Katalog mit `npm run content:compile`.
- Ändere generierte JSON-Dateien niemals von Hand.
- Bewahre Legacy-Inhalte und dokumentierte Konflikte.
- Ergänze Tests entsprechend Risiko und Reichweite.

Details stehen in `docs/content-authoring.md`, `docs/content-schema.md` und
`docs/testing.md`.

## Vor einem Commit

```bash
npm run verify
git diff --check
```

Committe kleine, thematische Einheiten. Contentänderung und zugehörige
generierte Artefakte gehören in denselben Commit. Nutze kein
`npm audit fix --force`, ohne das daraus entstehende Major-Upgrade separat zu
prüfen.

## Release-Kandidaten

Ein Release-Kandidat wird ausschließlich aus einem geprüften Commit gebaut:

```bash
npm ci
npm run verify
npm run release:build
npm run release:verify
```

`dist/` und `release/` sind generiert und werden nicht committed. Änderungen an
Version, Katalog, Buildskript oder Release-Metadaten benötigen einen neuen
Release-Build. Die vollständige Checkliste steht in
`docs/release-process.md`.

## Pull Requests

Beschreibe Motivation, fachliche Entscheidungen, Tests und verbleibende
Unsicherheiten. CI muss grün sein. Neue Regelwidersprüche benötigen einen
Eintrag im Review oder Migrationsbericht; eine stillschweigende kanonische
Änderung ist nicht zulässig.
