# Implementierungsfortschritt

Dieses Dokument wird nach jeder Phase aktualisiert. Eine Phase ist nur
`complete`, wenn ihre Ergebnisse geprüft wurden und das Repository in einem
validen Zustand ist.

| Phase | Status | Ergebnis |
|:--|:--|:--|
| 0 - Baseline | complete | 64 Ausgangsdateien und alle erkannten Entitätstypen inventarisiert |
| 1 - Review | complete | 32 priorisierte Befunde aus der vollständigen Quellenprüfung dokumentiert |
| 2 - Datenmodell | complete | Versioniertes Zod-Modell für 24 Entitätstypen, Prädikate, Effekte und Choices |
| 3 - Migration | complete | 64 Quellen reproduzierbar auf 681 validierte Entitäten migriert |
| 4 - Content Compiler | complete | Deterministischer Katalog, Referenzprüfung, Hash und harte Fehler |
| 5 - Rules Engine | pending | |
| 6 - Character Builder | pending | |
| 7 - Speicherung/Import/Export | pending | |
| 8 - Start- und Build-Aktualisierung | pending | |
| 9 - Tests | pending | |
| 10 - CI | pending | |
| 11 - Dokumentation | pending | |
| 12 - Abschlussprüfung | pending | |

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

- 681 Entitäten aus 681 Authoring-Dateien kompiliert
- Referenzen und geschlossene Traits vollständig aufgelöst
- deterministische Ausgabe und Compilerfehler in Vitest geprüft
- `npm run content:compile`
- `npm run content:migration:verify`

Offene Punkte:

- keine für Phase 4; zusätzliche Grenzfalltests folgen gesammelt in Phase 9.

## Nächster konkreter Schritt

Frameworkunabhängige Rules Engine mit typisierten Prädikaten, Effektanwendung,
Choice-Auflösung, Validierungszuständen und Herkunftsnachweisen implementieren.
