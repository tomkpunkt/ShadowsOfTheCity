# Implementierungsfortschritt

Dieses Dokument wird nach jeder Phase aktualisiert. Eine Phase ist nur
`complete`, wenn ihre Ergebnisse geprüft wurden und das Repository in einem
validen Zustand ist.

| Phase | Status | Ergebnis |
|:--|:--|:--|
| 0 - Baseline | complete | 64 Ausgangsdateien und alle erkannten Entitätstypen inventarisiert |
| 1 - Review | complete | 32 priorisierte Befunde aus der vollständigen Quellenprüfung dokumentiert |
| 2 - Datenmodell | complete | Versioniertes Zod-Modell für 24 Entitätstypen, Prädikate, Effekte und Choices |
| 3 - Migration | complete | 64 Quellen reproduzierbar auf 734 validierte Entitäten migriert |
| 4 - Content Compiler | complete | Deterministischer Katalog, Referenzprüfung, Hash und harte Fehler |
| 5 - Rules Engine | complete | Frameworkfreie Neuberechnung, Prädikate, Effekte, Choices und Herkunftsnachweise |
| 6 - Character Builder | complete | Responsive React-App mit elf datengetriebenen Arbeitsbereichen |
| 7 - Speicherung/Import/Export | complete | Versioniertes LocalStorage, JSON-Import/-Export und sichtbare Migrationen |
| 8 - Start- und Build-Aktualisierung | complete | Compile-before-start, Content-Watch und Stale-Katalog-Prüfung |
| 9 - Tests | complete | 35 Unit-/Integrationstests, vier reale Builds und ein vollständiger Playwright-Workflow |
| 10 - CI | complete | GitHub Actions prüft Audit, Content, Code, Build und Chromium-E2E |
| 11 - Dokumentation | complete | Architektur, Authoring, Migration, Tests und Contribution vollständig dokumentiert |
| 12 - Abschlussprüfung | complete | Vollständige Verify-Kette grün und Abschlussbericht erstellt |

## Phase 0 - Baseline

Status: `complete`

Bearbeitete Dateien:

- `docs/review/00-baseline-inventory.md`
- `docs/implementation-progress.md`

Entscheidungen:

- Der unveränderte Commit `6a92f9d` ist die Migrations-Baseline.
- Entitätsvorkommen und eindeutige Entitätskandidaten werden getrennt gezählt.
- `ancestry` wird im neuen Modell der kanonische Begriff; bestehende
  Rassen-/Volks-Texte bleiben erhalten.
- Übersichtseinträge ohne Detaildatei werden nicht verworfen.

Ausgeführte Prüfungen:

- Git-Branch, Upstream, Commit und Arbeitsbaum geprüft
- sämtliche 64 Dateien und 12 Verzeichnisse erfasst
- Überschriften, Tabellenzeilen, Detaildateien und freie Querverweise gezählt
- Klassen, Abstammungen, Feats, Zauber, Ausrüstung und Bestiary separat
  gegengeprüft
- `git diff --check` ohne Befund ausgeführt

Offene Punkte:

- keine

## Phase 1 - Fachliches und strukturelles Review

Status: `complete`

Bearbeitete Dateien:

- `docs/review/01-content-and-rules-review.md`
- `docs/implementation-progress.md`

Entscheidungen:

- PF2e-nahe Drei-Aktionen-Ökonomie wird die kanonische Basis.
- Wahrnehmung wird als eigener Proficiency-Wert behandelt.
- Proficiency verwendet fünf geschlossene Ränge.
- Trefferpunkte verwenden Abstammungs-TP plus klassenbasierte TP pro Level.
- Bestiary-Inhalte werden erhalten, ihre D&D-5e-Mechanik wird jedoch nicht
  unbemerkt in die Character-Rules-Engine übernommen.
- Konflikte in Zauberrängen, Skills und Referenzen bleiben bis zur expliziten
  Migrationsentscheidung offen.

Ausgeführte Prüfungen:

- alle 64 Ausgangsdateien vollständig gelesen
- Klassen, Abstammungen, Feats, Zauber, Ausrüstung, Bestiary, Regeln, Lore und
  TOCs jeweils miteinander verglichen
- freie Zauber- und Feat-Referenzen extrahiert
- Regelbereiche aus dem Masterauftrag einzeln bewertet
- Befunde nach BLOCKER, CRITICAL, MAJOR, MINOR und EDITORIAL priorisiert
- 32 Befund-IDs auf Eindeutigkeit geprüft
- `git diff --check` ohne Befund ausgeführt

Offene Punkte:

- keine

## Phase 2 - Kanonisches Datenmodell

Status: `complete`

Bearbeitete Dateien:

- `packages/shared/src/schemas.ts`
- `packages/shared/src/types.ts`
- `packages/shared/src/schemas.test.ts`
- `docs/content-schema.md`

Entscheidungen:

- Schema-Version 1 verwendet strikt validiertes YAML-Frontmatter.
- Anzeigenamen und Dateinamen sind von stabilen ASCII-IDs getrennt.
- Prädikate und Effekte sind rekursive, geschlossene Ausdrucksbäume.
- Nicht eindeutig formalisierbare Altregeln verwenden ausschließlich den
  expliziten Effekt `text` mit `machineReadable: false`.
- Wahrnehmung ist eine eigene Proficiency und kein Skill.

Ausgeführte Prüfungen:

- gültige und ungültige Entitäten gegen Zod geprüft
- unbekannte Prädikat- und Effektoperatoren abgewiesen
- ID-Format und Choice-Grenzen getestet
- TypeScript Strict Mode ausgeführt

Offene Punkte:

- Legacy-Texteffekte werden in späteren Schema-Versionen nach
  Playtest-Entscheidungen weiter formalisiert.

## Phase 3 - Migration

Status: `complete`

Bearbeitete Dateien:

- `packages/content-compiler/src/migrate.ts`
- `packages/content-compiler/src/verify-migration.ts`
- `content/`
- `content/migration-manifest.json`
- `docs/review/02-migration-report.md`

Entscheidungen:

- GFM-Markdown wird als AST aus Überschriften, Tabellen und Abschnitten gelesen.
- Sämtliche 64 Altdateien bleiben unverändert und sind im Manifest erfasst.
- Backgrounds und Zauberprogressionen sind ausdrücklich markierte
  Playtest-Ergänzungen.
- D&D-5e-artige Bestiary-Werte bleiben durch `legacySystem: dnd5e` isoliert.
- Die Baseline-Zahl von 41 Waffen wurde auf 40 eindeutige Konzepte korrigiert;
  `Seelenfänger` ist in beiden Waffenquellen dasselbe Konzept.

Ausgeführte Prüfungen:

- `npm run content:migrate`
- `npm run content:migration:verify`
- 64 Quellzuordnungen und Mindestzahlen geprüft
- jede Entität vor dem Schreiben gegen das Runtime-Schema validiert
- mechanische Quelldateien ohne Zuordnung als Fehler geprüft

Offene Punkte:

- Bestiary-Balance, Schamanen-Casting und Legacy-Texteffekte benötigen
  Playtests, sind aber ohne stillen Datenverlust dokumentiert.

## Phase 4 - Content Compiler

Status: `complete`

Bearbeitete Dateien:

- `packages/content-compiler/src/compiler.ts`
- `packages/content-compiler/src/cli.ts`
- `packages/content-compiler/src/validation.ts`
- `packages/content-compiler/src/compiler.test.ts`
- `generated/catalog.json`
- `generated/catalog.manifest.json`
- `generated/content-validation-report.json`

Entscheidungen:

- Der Katalog ist stabil nach ID sortiert und enthält keine Zeitstempel.
- Sein SHA-256-Hash wird ausschließlich aus Schema-Version und normalisierten
  Entitäten berechnet.
- Schemafehler, doppelte IDs, tote Referenzen, unmögliche Pflichtauswahlen und
  Choice-Zyklen brechen den Build ab.
- `npm run verify` enthält Content-Validierung und
  Migrationsvollständigkeitsprüfung.

Ausgeführte Prüfungen:

- 734 Entitäten aus 734 Authoring-Dateien kompiliert
- Referenzen und geschlossene Traits vollständig aufgelöst
- deterministische Ausgabe und Compilerfehler in Vitest geprüft
- `npm run content:compile`
- `npm run content:migration:verify`

Offene Punkte:

- keine für Phase 4; zusätzliche Grenzfalltests folgen gesammelt in Phase 9.

## Phase 5 - Rules Engine

Status: `complete`

Bearbeitete Dateien:

- `packages/rules-engine/src/types.ts`
- `packages/rules-engine/src/predicate.ts`
- `packages/rules-engine/src/effects.ts`
- `packages/rules-engine/src/engine.ts`
- `packages/rules-engine/src/engine.test.ts`
- `docs/rules-engine.md`

Entscheidungen:

- Die Engine verwendet keine React-, DOM- oder Storage-APIs.
- Sämtliche Neuberechnungen sind reine Funktionen aus Katalog und
  Charakterentscheidungen.
- Ungültig gewordene Entscheidungen bleiben mit konkreten Requirement-Failures
  erhalten.
- Typisierte Boni stapeln pro Typ nur als stärkster Bonus und stärkste Strafe;
  untypisierte Beiträge stapeln.
- Numerische Ergebnisse einschließlich Zauberplätzen und Ressourcen enthalten
  Herkunftsnachweise.

Ausgeführte Prüfungen:

- Level-1-Charakter und Levelaufstieg berechnet
- Attribute, TP, RK, Skills, Saves, Zauberwerte und Waffenwerte geprüft
- automatische Features und vorbereitete Zauberprogression geprüft
- ungültige abhängige Auswahl samt Ist-/Soll-Begründung geprüft
- Katalog-Hash-Konflikt ohne Datenverlust geprüft
- deterministische Neuberechnung geprüft
- 8 Rules-Engine-Tests erfolgreich

Offene Punkte:

- Content-basierte Regressionstests mit mehreren realen Builds folgen in
  Phase 9.

## Phase 6 - Character Builder

Status: `complete`

Bearbeitete Dateien:

- `apps/character-builder/src/App.tsx`
- `apps/character-builder/src/styles.css`
- `apps/character-builder/src/catalog.ts`
- `apps/character-builder/src/assets/city-builder.png`
- `apps/character-builder/vite.config.ts`
- `docs/character-builder.md`

Entscheidungen:

- Die UI importiert ausschließlich kompilierten Katalog und Rules Engine.
- Elf Arbeitsbereiche decken Aufbau, Abschlussprüfung und Charakterbogen ab.
- Gesperrte und ungültige Optionen bleiben sichtbar und begründet.
- Das eigenständige visuelle System nutzt ein lokal erzeugtes Stadtmotiv,
  Petrol, Gold und Rot auf einer neutralen Arbeitsfläche.
- Mobile Navigation startet geschlossen; der Charakterbogen besitzt
  Print-Styles.

Ausgeführte Prüfungen:

- Desktop bei 1440 × 900 im Browser geprüft
- Mobile bei 390 × 844 im Browser geprüft
- Kartenraster, Textüberlauf, Bildasset und Charakterbogen geprüft
- keine Browser-Konsolenfehler
- Testing-Library-Auswahl gegen den realen Katalog erfolgreich
- Vite-Produktionsbuild erfolgreich

Offene Punkte:

- Bundle-Splitting des vollständig eingebetteten Offline-Katalogs ist eine
  optionale spätere Optimierung.

## Phase 7 - Speicherung, Import und Export

Status: `complete`

Bearbeitete Dateien:

- `apps/character-builder/src/storage.ts`
- `apps/character-builder/src/storage.test.ts`

Entscheidungen:

- LocalStorage und Export verwenden dasselbe Format Version 1.
- Katalogmigrationen werden mit Quell-/Zielhash, Zeitpunkt und Konflikten
  gespeichert.
- Unbekannte IDs werden nie entfernt oder ersetzt.
- Ein Hash wird nur automatisch aktualisiert, wenn sämtliche referenzierten IDs
  noch auflösbar sind.

Ausgeführte Prüfungen:

- Speichern und Laden round-trip getestet
- beschädigten LocalStorage getestet
- Import mit unbekannten IDs und abweichendem Hash getestet
- konfliktfreie Katalogmigration getestet

Offene Punkte:

- keine

## Phase 8 - Aktualisierung bei Start und Build

Status: `complete`

Bearbeitete Dateien:

- `apps/character-builder/vite.config.ts`
- `package.json`
- `packages/content-compiler/src/cli.ts`

Entscheidungen:

- Development kompiliert vor Start und beobachtet anschließend
  `content/**/*.md`.
- Production kompiliert Content und führt Typecheck sowie Tests vor dem
  Workspace-Build aus.
- `content:check-generated` vergleicht Katalog, Manifest und Report bytegenau.

Ausgeführte Prüfungen:

- Dev-Server auf `http://127.0.0.1:4173/` gestartet
- Hot-Reload-Pipeline und aktuellen Katalog im Browser geprüft
- Vite-Produktionsbuild erfolgreich
- Stale-Katalog-Prüfung gegen aktuelle generierte Dateien ausgeführt

Offene Punkte:

- keine

## Phase 9 - Tests

Status: `complete`

Bearbeitete Dateien:

- `packages/content-compiler/src/compiler.test.ts`
- `packages/rules-engine/src/content-regression.test.ts`
- `apps/character-builder/src/App.test.tsx`
- `apps/character-builder/src/storage.test.ts`
- `apps/character-builder/e2e/character-builder.spec.ts`
- `playwright.config.ts`

Entscheidungen:

- Referenzen werden neben ihrer Existenz auch auf den erwarteten Entitätstyp
  geprüft.
- Level-Filter verwenden bei Zaubern deren Rang.
- Content-Regressionen vervollständigen Pflicht-Choices ausschließlich aus
  verfügbaren Optionen des realen Katalogs.
- Der E2E-Test umfasst den kompletten Build sowie Sperrgrund, Zauber,
  Export/Import, ungültige Zwischenlage, Korrektur und Reload.

Ausgeführte Prüfungen:

- 11 Content-Compiler-Tests erfolgreich
- 12 Rules-Engine- und Content-Regressions-Tests erfolgreich
- 12 Shared-, Storage- und UI-Tests erfolgreich
- Playwright Chromium: 1 vollständiger Workflow erfolgreich

Offene Punkte:

- keine

## Phase 10 - CI und Qualitätskontrolle

Status: `complete`

Bearbeitete Dateien:

- `.github/workflows/ci.yml`
- `package.json`
- `package-lock.json`

Entscheidungen:

- CI verwendet Node 22 und `npm ci`.
- `npm run verify` ist lokal und in CI derselbe Merge-Vertrag.
- Der Produktionsaudit ist hart; ein nur per Breaking Change behebbarer
  ESLint-Entwicklungsbefund ist dokumentiert.
- Playwright installiert Chromium in CI und lädt den Bericht nur bei Fehlern
  hoch.

Ausgeführte Prüfungen:

- `npm audit --omit=dev --audit-level=high`: 0 Schwachstellen
- lokaler Chromium-E2E-Lauf erfolgreich
- Workflow-Syntax und verwendete npm-Kommandos gegengeprüft

Offene Punkte:

- ESLint 10 separat evaluieren, sobald der TypeScript-ESLint-Stack dafür
  freigegeben ist.

## Phase 11 - Dokumentation

Status: `complete`

Bearbeitete Dateien:

- `docs/architecture.md`
- `docs/content-authoring.md`
- `docs/content-schema.md`
- `docs/rules-engine.md`
- `docs/character-builder.md`
- `docs/testing.md`
- `docs/migration.md`
- `CONTRIBUTING.md`

Entscheidungen:

- Dokumentation beschreibt nur implementierte Kommandos und Datenverträge.
- Authoring enthält vollständige Beispiele für Klasse, Background, Feat,
  Skill und Zauber sowie Choice-, Prädikat-, Effekt- und Versionsregeln.
- Sicherheitsbefunde werden nach Produktions- und Entwicklungsabhängigkeiten
  getrennt ausgewiesen.

Ausgeführte Prüfungen:

- geforderte Dokumentliste gegen den Masterauftrag geprüft
- Beispiele mit den Zod-Feldern und realen Contentdateien abgeglichen
- Architektur-, Build- und Testkommandos gegen `package.json` geprüft

Offene Punkte:

- `docs/review/03-final-verification.md` wird als Ergebnis von Phase 12 erzeugt.

## Phase 12 - Abschlussprüfung

Status: `complete`

Bearbeitete Dateien:

- `docs/review/03-final-verification.md`
- `docs/implementation-progress.md`

Entscheidungen:

- Offene fachliche Regeln bleiben sichtbar und werden nicht als implementiert
  ausgegeben.
- Der nicht blockierende Bundle-Hinweis und der ESLint-Entwicklungsbefund sind
  im Abschlussbericht festgehalten.
- `npm run verify` ist der abschließende reproduzierbare Qualitätsvertrag.

Ausgeführte Prüfungen:

- `npm run verify` vollständig erfolgreich
- 64 Ausgangsquellen und 734 Entitäten durch Migration geprüft
- 35 Vitest-Tests und ein Playwright-E2E erfolgreich
- Vite-Produktionsbuild und Prettier-Check erfolgreich
- Produktionsaudit mit 0 Schwachstellen
- `git diff --check` ohne Whitespace-Fehler

Offene Punkte:

- keine für den Masterauftrag; fachliche Playtest-Themen stehen im
  Abschlussbericht.

## Folgeauftrag: Content- und UI-Qualitätsaudit

| Phase | Status | Analysierte Bereiche | Befunde | Geänderte Dateien | Prüfungen | Offene Entscheidungen |
|:--|:--|:--|:--|:--|:--|:--|
| 1 - aktueller Stand | complete | Content, Schemas, Compiler, Katalog, Engine, UI, Tests | 734 Entitäten; 208 kurze Alttexte; kein Markdown-Renderer; 56 zuvor unsichtbare Katalogfelder | `scripts/audit-content-quality.ts`, `docs/review/04-content-ui-quality-baseline.md` | automatisiertes Inventar, Katalogstatistik, TODO-/FIXME-Suche | keine |
| 2 - Builder-Vollständigkeit | complete | Choices, Referenzen, automatische Vergaben, Details | 80 Entitäten ohne direkten Builder-Pfad | `scripts/audit-builder-reachability.ts`, `scripts/audit-allowlist.json`, `docs/review/05-builder-reachability.md` | 734 Einzelpfade, 168 Choices, Rückreferenzen | keine Ausnahmen erforderlich |
| 3 - Inhaltsqualität | complete | Namen, Kurz- und Langtexte, Platzhalter, Rohdaten, Markdown | 0 aktive Platzhalter; 0 technische Anzeigenamen; 410 Textregeln | `scripts/audit-content-quality.ts`, `docs/review/06-content-quality-audit.md` | Muster-, Längen-, Syntax- und Sicherheitsprüfung | Textregeln nur nach fachlicher Freigabe weiter formalisieren |
| 4 - deutsche Labels | complete | Typen, Status, Attribute, Ränge, Aktionen, Effekte, Fehler | rohe Enum-Werte und englische Fallbacks in regulären Ansichten | `apps/character-builder/src/i18n/de.ts`, `packages/rules-engine/src/engine.ts` | vollständige Record-Typen, Unit- und E2E-Prüfung | keine |
| 5 - Contenttexte | complete | alle 734 Authoring-Dateien und typspezifische Kurztexte | fehlendes `summary`; fünf fragmentarische Talenttexte | `packages/shared/src/schemas.ts`, `packages/content-compiler/src/migrate.ts`, `content/` | deterministische Migration, 734 vollständige sichtbare Beschreibungen | 208 knappe Alttexte können später atmosphärisch erweitert werden |
| 6 - Markdown | complete | tatsächlich verwendete GFM-Strukturen, Links, HTML | Markdown wurde zuvor als Klartext gezeigt | `MarkdownContent.tsx`, `MarkdownContent.test.tsx`, `compiler.ts` | GFM, Sanitizing, interne Links, Tabellen, verschachtelte Listen | Definitionslisten, Fußnoten und Callouts derzeit nicht benötigt |
| 7 - Detailansichten | complete | Klassen, Hintergründe, Abstammungen, Zauber, Ausrüstung, Choices, Skills, Kreaturen | generische Ansicht ließ strukturierte Werte und Herkunft aus | `EntityDetails.tsx`, `entity-presentation.ts`, `styles.css` | typspezifische UI- und Browsertests | keine |
| 8 - Listen und Suche | complete | Karten, Kompendium, Volltextsuche, Typ-/Statusfilter | kein Gesamtzugang; Suche nur in Name und Beschreibung | `App.tsx`, `styles.css`, `App.test.tsx` | Suche in sechs Feldgruppen, Filterkombination, Reset, Leerzustand | keine |
| 9 - Progression | complete | neun Klassen, Stufen 1 bis 20, Features, Choices, Talente, Skills, Zauber | 0 strukturelle Lücken oder widersprüchliche Choices | `scripts/audit-class-progression.ts`, `docs/review/07-class-progression-audit.md` | 180 Klassenstufen automatisiert geprüft | Balance oberhalb Stufe 1 bleibt Spieltestthema |
| 10 - Tests | complete | Compiler, i18n, Markdown, UI, Storage, reale Katalogpfade | fehlende Sicherheits-, Lokalisierungs- und Mehrstufenszenarien | `compiler.test.ts`, `de.test.ts`, `App.test.tsx`, `quality-audit.e2e.ts` | 45 Vitest- und 9 Playwright-Tests | keine |
| 11 - visuelle Prüfung | complete | 13 Desktop- und Mobile-Zustände | englische Begriffe, rohe Attributwerte, leere Rasterfläche | `visual-review.e2e.ts`, `docs/review/screenshots/`, `docs/review/08-visual-quality-review.md` | Playwright-Screenshots und manuelle Bildprüfung | keine |
| 12 - Abschlussprüfung | complete | vollständiger Qualitätsvertrag und Dokumentation | keine blockierenden Restbefunde | `package.json`, `docs/review/09-content-ui-final-verification.md`, mehrere Fachdocs | alle geforderten Einzelkommandos, `npm run verify`, `git diff --check` | fachliche Textregel- und Balanceentscheidungen getrennt dokumentiert |

## Nächster konkreter Schritt

Den geprüften Commit veröffentlichen und per Pull Request gegen `main`
begutachten lassen.
