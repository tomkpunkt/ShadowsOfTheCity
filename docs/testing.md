# Tests und Qualitätskontrolle

## Testpyramide

- `packages/shared/src/schemas.test.ts`: strikte Schemata, Prädikate,
  Effektknoten, Character-Format und Versionen
- `packages/content-compiler/src/compiler.test.ts`: Frontmatter, Duplikate,
  Referenzen, Aliase, Choices, Determinismus, ungültiger Content und Migration
- `packages/rules-engine/src/effects.test.ts`: formale Effektfamilien,
  Reihenfolge, Grenzen, Stacking und Bedingungen
- `packages/rules-engine/src/predicate.test.ts`: atomare und rekursive
  Voraussetzungen
- `packages/rules-engine/src/engine.test.ts`: Formeln, Progression, Choices,
  automatische Grants, Herkunft und Fehlerzustände
- `packages/rules-engine/src/content-regression.test.ts`: vier vollständige
  Builds aus dem echten Katalog
- `apps/character-builder/src/legacy-regression.test.ts`: fünfter vollständiger
  Real-Content-Build nach Format-1- und Alias-Migration
- `apps/character-builder/src/*.test.tsx`: UI-, Katalog-, Markdown- und
  Storage-Integration
- `apps/character-builder/e2e`: Browserworkflows, Mobilansicht und visuelle
  Regression
- `scripts/release-utils.test.ts`: deterministische ZIP-Ausgabe und Pfadprüfung

Die fünf Regressionsfiguren verwenden Ork/Söldner, Mensch/Agent, Elf/Magier,
Gnom/Ingenieur und einen importierten Format-1-Ork/Söldner. Damit werden
Kampf-, Skill-, Zauber-, Technik- und Legacy-Pfade mit dem vollständigen
Katalog geprüft.

## Einzelkommandos

```bash
npm run lint
npm run typecheck
npm run content:migrate
npm run content:migration:verify
npm run content:validate
npm run content:compile
npm run content:verify-generated
npm run content:quality
npm run editorial:quality
npm run equipment:classification
npm run machine-readability:audit
npm run content:reachability
npm run progression:audit
npm run architecture:audit
npm run content:templates
npm run test
npm run test:e2e
npm run build
npm run release:build
npm run release:verify
npm run verify
```

Vor dem ersten lokalen E2E-Lauf ist einmalig
`npx playwright install chromium` nötig. Playwright startet den Vite-Server
selbst oder verwendet einen bereits laufenden Server auf Port 4173.

## E2E-Vertrag

Die 18 Browserprüfungen decken unter anderem ab:

- neuen und vollständigen Charakter erstellen
- frühere Choices ändern, Konflikt erhalten und gezielt korrigieren
- gesperrte Optionen mit Ist-/Soll-Begründung anzeigen
- Format-1-Charakter importieren und Katalogkompatibilität anzeigen
- speichern, neu laden, exportieren und reimportieren
- Charakterbogen und Druckansicht öffnen
- Kompendium, Suche, kombinierte Filter und Detailansichten verwenden
- Desktop- und Mobile-Grenzen ohne Textüberlauf prüfen

Die visuelle Suite erzeugt dokumentierte Zustände unter
`docs/review/screenshots/`. Der manuelle Prüfbericht steht in
`docs/review/08-visual-quality-review.md`.

## Build- und Release-Tests

Der Produktionsbuild kompiliert den realen Katalog, führt Typecheck und alle
Unit-/Integrationstests aus und baut anschließend die Workspaces.
`content:verify-generated` weist veraltete generierte Dateien bytegenau ab.
Compiler-Fixtures prüfen ungültigen Content und alte Schema-Versionen;
Storage- und E2E-Tests prüfen ungültige Legacy-Importe.

`release:build` erzeugt ein deterministisches Laufzeit-ZIP.
`release:verify` prüft Prüfsumme, Versionskonsistenz, Katalogmetadaten,
Pflichtdateien und verbotene Pfade.

## CI

`.github/workflows/ci.yml` verwendet Node 22, `npm ci`, einen harten Audit der
Produktionsabhängigkeiten und Chromium. Lint, Typecheck, Contentvalidierung,
Kompilierung, Stale-Check, Architektur, Templates, Unit-/Integrationstests,
E2E, Build, Release-Build, Releaseprüfung und der vollständige
Repository-Vertrag laufen als sichtbare Schritte. Bei Fehlern wird der
Playwright-Report als Artefakt hochgeladen.
