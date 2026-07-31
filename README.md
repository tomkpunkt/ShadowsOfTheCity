# Shadows of the City

Ein datengetriebener Character Builder für eine Cyberpunk-/Urban-Fantasy-
Rollenspieladaption mit Pathfinder-2e-naher Regelstruktur.

## Projektstatus

Version `0.1.1` ist ein reproduzierbarer Testbuild. Der vollständige Katalog
enthält 737 Entitäten, davon 724 aktive und 13 fachlich gesperrte Entwürfe.
Charakterwerte werden ausschließlich durch die frameworkfreie Rules Engine
berechnet; der Builder zeigt Herkunftsnachweise, offene Entscheidungen,
Voraussetzungsfehler und Katalogkompatibilität an.

Der Testbuild unterstützt:

- Charaktere von Stufe 1 bis 20 mit Abstammung, Herkunft, Hintergrund und Klasse
- Attribute, Fertigkeiten, Kompetenzen, Talente, Klassenmerkmale und Choices
- Zauberprogression, Ausrüstung, Angriffe, Trefferpunkte, RK, Rettungswürfe und
  Wahrnehmung
- automatische Neuberechnung und Erhalt ungültig gewordener Entscheidungen
- Local Storage, JSON-Import/-Export und Migration alter Charakterformate
- interaktiven Charakterbogen mit Kampf, Aktionen, Zaubern, Inventar,
  Ressourcen, Zuständen, Notizen und lokaler Würfelablage
- getrennten Build und versionierten Session State mit Format-2-Migration
- mehrseitigen A4-Druck/PDF, kompakten Statblock und vollständigen JSON-Roundtrip
- Kompendium, Suche, Filter und begründete gesperrte Optionen

## Voraussetzungen

- Node.js 22 oder neuer
- npm
- Chromium für Browserprüfungen

## Installation und Entwicklung

```bash
git clone https://github.com/tomkpunkt/ShadowsOfTheCity.git
cd ShadowsOfTheCity
npm ci
npx playwright install chromium
npm run dev
```

Der Entwicklungsserver kompiliert den Content vor dem Start und beobachtet
Änderungen unter `content/`. Standardmäßig ist die Anwendung unter
`http://127.0.0.1:5173` erreichbar.

## Qualitätssicherung

```bash
npm run lint
npm run typecheck
npm run content:validate
npm run content:compile
npm run content:verify-generated
npm run test
npm run test:e2e
npm run build
npm run verify
```

`npm run verify` ist der vollständige lokale Merge-Vertrag einschließlich
Migration, Contentaudits, Architekturprüfung, Templates, Build, Browsertests
und Formatprüfung. Weitere Einzelkommandos stehen in
[`docs/testing.md`](docs/testing.md).

## Content hinzufügen

Kanonischer Content liegt als Markdown mit strikt validiertem YAML-Frontmatter
unter `content/`. Neue handgeschriebene Dateien werden unter `content/custom/`
angelegt:

```bash
npm run content:new -- --type feat --id feat.example
npm run content:validate -- --file content/custom/feat/feat.example.md
npm run content:explain -- --id feat.example
npm run content:references -- --id feat.example
npm run content:compile
```

Zwölf kompilierbare Vorlagen decken Klassen, Klassenmerkmale, Abstammungen,
Herkünfte, Hintergründe, Fertigkeiten, Talente, Zauber, Waffen, Rüstungen,
Ausrüstung und Choices ab. Details stehen in
[`docs/content-authoring.md`](docs/content-authoring.md) und
[`docs/content-schema.md`](docs/content-schema.md).

## Testbuild 0.1.1

```bash
npm ci
npm run release:build
npm run release:verify
```

Die Ausgabe liegt in `dist/` und `release/`:

- `release/shadows-of-the-city-0.1.1.zip`
- `release/shadows-of-the-city-0.1.1-checksums.txt`
- `release/shadows-of-the-city-0.1.1-build-report.md`

Das ZIP enthält nur Laufzeitdateien, den kompilierten Katalog, Manifest,
Versions- und Buildinformationen sowie Lizenz-, Quellen- und
Drittlizenzhinweise. Der genaue Ablauf steht in
[`docs/release-process.md`](docs/release-process.md).

## Architektur

```text
content
  -> packages/shared
  -> packages/content-compiler
  -> generated catalog
  -> packages/rules-engine
  -> apps/character-builder
```

`npm run architecture:audit` verhindert verbotene Gegenimporte, Browserzugriffe
in der Engine und Rohcontentimporte in der UI. Eine Übersicht steht in
[`docs/architecture.md`](docs/architecture.md).

## Bekannte Einschränkungen

- 381 Textregeln sind nur teilweise strukturiert und 27 reine Anzeigeregeln;
  ihre situativen Bestandteile werden nicht in permanente Werte eingerechnet.
- Zwei fachlich ungeklärte Regeln sind mit Entscheidungs-ID blockiert.
- 13 Entwurfsentitäten sind nicht auswählbar.
- Balance oberhalb Stufe 1 und Bestiary-Werte aus dem isolierten
  D&D-5e-Legacybestand benötigen weitere Spieltests.
- Der Katalog ist für den Offline-Testbuild bewusst vollständig im
  Web-Bundle enthalten.

## Lizenz und Quellen

Für das Projekt ist derzeit keine Open-Source-Lizenz erklärt. Es gilt der
Hinweis in [`LICENSE.txt`](LICENSE.txt). Quellen- und Provenienzhinweise stehen
in [`SOURCES.md`](SOURCES.md).
