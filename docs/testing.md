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
- `apps/character-builder/e2e`: vollständiger Browserworkflow

Die vier Regressionsfiguren verwenden Ork/Söldner, Mensch/Agent, Elf/Magier
und Gnom/Ingenieur. Damit werden Kampf-, Skill-, Zauber- und Technikpfade mit
tatsächlich migrierten Optionen geprüft.

## Kommandos

```bash
npm run lint
npm run typecheck
npm run content:validate
npm run content:migration:verify
npm run content:check-generated
npm run test
npm run build
npm run test:e2e
npm run verify
```

Vor dem ersten lokalen E2E-Lauf ist einmalig
`npx playwright install chromium` nötig. Playwright startet den Dev-Server
selbst oder verwendet einen bereits laufenden Server auf Port 4173.

## E2E-Vertrag

Der zentrale Test startet mit einem leeren Charakter, prüft eine konkret
begründete gesperrte Option, baut einen vollständigen Magier, wählt Skill,
Feat und Zauber, erreicht den validen Abschluss, exportiert JSON, erzeugt
absichtlich einen ungültigen Build, importiert und korrigiert ihn und prüft
Persistenz nach Reload.

## CI

`.github/workflows/ci.yml` verwendet Node 22, `npm ci`, einen harten Audit der
Produktionsabhängigkeiten, Chromium und `npm run verify`. Bei Fehlern wird der
Playwright-Report als Artefakt hochgeladen.

Der vollständige npm-Audit weist derzeit nur fünf High-Hinweise im
ESLint-Entwicklungspfad aus. Der Produktionsaudit ist sauber. npm bietet dafür
nur ein erzwungenes Major-Upgrade auf ESLint 10; dieses wird separat mit
Kompatibilitätsprüfung durchgeführt, nicht per `--force`.
