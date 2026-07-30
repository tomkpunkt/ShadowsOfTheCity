# Tests und Qualitätskontrolle

## Testpyramide

- `packages/shared/src/schemas.test.ts`: IDs, Prädikate, Choices und
  Entitätsschemas
- `packages/content-compiler/src/compiler.test.ts`: positive Fixture,
  Pflichtfelder, Duplikate, tote und falsch typisierte Referenzen,
  Prädikate, Effekte, Level, leere Choices, Zyklen, Determinismus und Versionen
- `packages/rules-engine/src/engine.test.ts`: Formeln, Progression,
  Voraussetzungen, Stacking, Herkunft und Determinismus
- `packages/rules-engine/src/content-regression.test.ts`: vier vollständige
  Builds aus dem echten Katalog
- `apps/character-builder/src/*.test.tsx`: UI- und Storage-Integration
- `apps/character-builder/e2e`: Browserworkflows und visuelle Regression
- `scripts/audit-content-quality.ts`: Platzhalter, Kurztexte, Labels und Markdown
- `scripts/audit-builder-reachability.ts`: Einzelpfad für jede Runtime-Entität
- `scripts/audit-class-progression.ts`: jede Klasse auf allen Stufen bis 20

Die vier Regressionsfiguren verwenden Ork/Söldner, Mensch/Agent, Elf/Magier
und Gnom/Ingenieur. Damit werden Kampf-, Skill-, Zauber- und Technikpfade mit
tatsächlich migrierten Optionen geprüft.

## Kommandos

```bash
npm run lint
npm run typecheck
npm run content:validate
npm run content:compile
npm run content:migration:verify
npm run content:check-generated
npm run content:quality
npm run content:reachability
npm run progression:audit
npm run test
npm run build
npm run test:e2e
npm run verify
```

Vor dem ersten lokalen E2E-Lauf ist einmalig
`npx playwright install chromium` nötig. Playwright startet den Dev-Server
selbst oder verwendet einen bereits laufenden Server auf Port 4173.

## E2E-Vertrag

Die Browsertests starten mit einem leeren Charakter, prüfen eine konkret
begründete gesperrte Option, bauen einen vollständigen Magier, wählen
Fertigkeit, Talent und Zauber, erreichen den validen Abschluss, exportieren
JSON, erzeugen absichtlich einen ungültigen Build, importieren und korrigieren
ihn und prüfen Persistenz nach Reload. Weitere Szenarien prüfen mehrere Stufen,
das Kompendium, Suche und Filter, komplexes Markdown sowie mobile Grenzen.

Die visuelle Suite erzeugt 13 feste Zustände unter
`docs/review/screenshots/`. Ihr manueller Prüfbericht steht in
`docs/review/08-visual-quality-review.md`.

## CI

`.github/workflows/ci.yml` verwendet Node 22, `npm ci`, einen harten Audit der
Produktionsabhängigkeiten, Chromium und `npm run verify`. Bei Fehlern wird der
Playwright-Report als Artefakt hochgeladen.

Der vollständige npm-Audit weist derzeit nur fünf High-Hinweise im
ESLint-Entwicklungspfad aus. Der Produktionsaudit ist sauber. npm bietet dafür
nur ein erzwungenes Major-Upgrade auf ESLint 10; dieses wird separat mit
Kompatibilitätsprüfung durchgeführt, nicht per `--force`.
