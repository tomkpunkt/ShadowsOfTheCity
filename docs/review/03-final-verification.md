# Abschlussprüfung

Datum: 30. Juli 2026  
Branch: `codex/character-builder`  
Baseline: `6a92f9d`  
Katalog-Hash: `858ad3fd4530a031fe4d43a4402db77574424e0a36578c05a1981700857cf5b6`

## 1. Architektur

Das Repository besitzt vier getrennte Ebenen:

1. Markdown-Authoring mit versioniertem YAML-Frontmatter unter `content/`
2. Zod-Schemas und deterministischer Content Compiler in `packages/`
3. frameworkunabhängige Rules Engine mit Prädikaten, Effekten und Herleitungen
4. datengetriebener React/Vite Character Builder mit Speicherung und Druck

Der Builder importiert ausschließlich den kompilierten Katalog und die Rules
Engine. Regelentitäten und Berechnungsformeln sind nicht in UI-Komponenten
dupliziert.

## 2. Migrierte Entitäten

| Typ | Anzahl |
|:--|--:|
| ancestry | 8 |
| armor | 12 |
| background | 8 |
| choice | 168 |
| class | 9 |
| class-feature | 99 |
| creature | 34 |
| equipment | 28 |
| feat | 195 |
| heritage | 40 |
| language | 10 |
| proficiency | 16 |
| rule | 4 |
| skill | 19 |
| spell | 14 |
| spellcasting-progression | 3 |
| trait | 27 |
| weapon | 40 |
| **Gesamt** | **734** |

Alle 64 Ausgangsdateien sind im Migrationsmanifest erfasst. Die 41
Waffenvorkommen der Baseline ergeben nach dokumentierter Zusammenführung des
doppelten `Seelenfänger` 40 eindeutige Entitäten.

## 3. Review-Befunde

Das Review enthält 32 Befunde: 3 BLOCKER, 8 CRITICAL, 14 MAJOR, 4 MINOR und
3 EDITORIAL.

- 20 Befunde wurden durch Schema, Migration, kanonische Projektentscheidung,
  Compiler, Engine oder klare Modulgrenze umgesetzt.
- 9 fachliche Fragen bleiben offen und sind mit Originalinformation und
  Auswirkung dokumentiert.
- 3 Bereiche sind ausdrücklich zurückgestellt: Bestiary-Neubalancing,
  Economy-Balancing und redaktionelle Vereinheitlichung.

Kein offener Befund wird von der Runtime als implementierte Maschinenregel
ausgegeben.

## 4. Verbleibende fachliche Unsicherheiten

- Einzelne Zauberränge, Reichweiten und Heightening-Angaben widersprechen sich.
  Die Detaildatei ist vorläufig kanonisch; Abweichungen bleiben im
  Migrationshinweis.
- Hacking, Fahrzeuge und Cyberware besitzen Schemas, aber noch kein
  vollständiges, balanciertes Subsystem.
- Bulk, Preise, Munition und Economy benötigen einen eigenen Playtest.
- Conditions und mehrere Sonderregeln liegen noch als
  `machineReadable: false` vor.
- Bestiary-Werte bleiben als D&D-5e-Legacy isoliert und werden nicht für
  Spielercharaktere verwendet.
- Die genaue Anzahl bekannter oder vorbereiteter Zauber ist als Playtestregel
  markiert.

## 5. Ausgeführte Befehle

```text
npm run lint
npm run typecheck
npm run content:validate
npm run content:compile
npm run content:migration:verify
npm run content:check-generated
npm run test
npm run build
npm run test:e2e
npm run format:check
npm run verify
npm audit --omit=dev --audit-level=high
git diff --check
```

## 6. Testergebnisse

- Vitest: 6 Testdateien, 35 Tests, 35 erfolgreich
- Compiler: 11 Tests einschließlich Fehlerfällen und Determinismus
- Rules Engine: 8 isolierte Tests
- echte Content-Regression: 4 vollständige Archetypen
- Shared/UI/Storage: 12 Tests
- Playwright Chromium: 1 vollständiger Character-Build erfolgreich

Der E2E-Test prüft leeren Start, Sperrbegründung, Abstammung, Herkunft,
Background, Klasse, Klassenoption, Attribute, Skills, Zauber, Feats, validen
Abschluss, Export, Import, ungültige Zwischenlage, Korrektur und Persistenz.

## 7. Build-Ergebnis

`npm run verify` ist erfolgreich. Der Produktionsbuild erzeugt eine
funktionierende Vite-Anwendung. Content-Katalog, Manifest und
Validierungsbericht sind bytegenau reproduzierbar und enthalten keine
Zeitstempel.

Der Produktionsaudit meldet 0 Schwachstellen. Der vollständige Audit meldet
fünf High-Hinweise ausschließlich im ESLint-Entwicklungspfad und bietet nur
ein Breaking-Change-Upgrade auf ESLint 10 an.

## 8. Bekannte Einschränkungen

- Das eingebettete Offline-Katalog-Bundle ist minifiziert etwa 1,15 MB groß;
  Vite gibt dafür eine nicht blockierende Chunk-Warnung aus.
- Das lokale Stadtmotiv ist etwa 2,57 MB groß.
- Legacy-Texteffekte sind sichtbar, aber bewusst nicht berechnet.
- Der Builder verwaltet derzeit einen aktiven lokalen Charakter statt einer
  Mehrcharakter-Bibliothek.
- Der Character Builder ist lokal ausführbar, aber nicht öffentlich deployed.

## 9. Empfohlene nächste Schritte

1. Offene Zauber- und Condition-Regeln fachlich entscheiden und als
   Schema-Version 2 migrieren.
2. Hacking, Cyberware und Fahrzeuge als getrennte, getestete Regelmodule
   spezifizieren.
3. Katalog und Bildasset per Lazy Loading beziehungsweise optimierten Formaten
   verkleinern.
4. Economy- und Bestiary-Balance mit datenbasierten Playtests bearbeiten.
5. ESLint 10 nach Freigabe des TypeScript-ESLint-Stacks separat evaluieren.

## 10. Größere geänderte Bereiche

- `content/` und `content/migration-manifest.json`
- `packages/shared`
- `packages/content-compiler`
- `packages/rules-engine`
- `apps/character-builder`
- `generated/`
- `.github/workflows/ci.yml`
- `docs/` und `CONTRIBUTING.md`
- Root-Tooling, npm-Workspaces und Lockdatei

## Vollständigkeitsurteil

Jede relevante Ausgangsdatei ist zugeordnet, jede der 734 Runtime-Entitäten
besitzt eine stabile ID und entspricht dem Schema, alle erkannten Referenzen
sind auflösbar und erwartete Referenztypen werden geprüft. Pflichtentscheidungen
des Stufe-1-Builds sind im Builder darstellbar. Nicht formal auswertbare Regeln
sind ausdrücklich gekennzeichnet. Die Migrationsprüfung meldet keinen
undokumentierten Verlust.
