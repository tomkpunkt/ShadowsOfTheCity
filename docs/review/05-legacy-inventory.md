# Legacy-Inventar für Version 0.1.0

Jeder Bestand besitzt genau einen Zielstatus. `retain-with-justification` bedeutet hier
nicht, dass er Teil der Laufzeitarchitektur bleibt, sondern dass er als geprüfte
Quellprovenienz oder expliziter Importvertrag weiterhin benötigt wird.

| Legacy-ID | Pfad oder Format | Funktion und aktueller Nutzer | Zielstatus | Strategie | Entfernungskriterium |
|:--|:--|:--|:--|:--|:--|
| `LEGACY-CONTENT-BESTIARY` | `bestiary/**/*.md` | Quelle für 34 isolierte Kreaturen; nur Migrationsprüfung | retain-with-justification | unverändert als Provenienz behalten; `legacySystem` verhindert Vermischung mit Charakterregeln | erst nach fachlicher SotC-Konvertierung aller Kreaturen und archivierter Originalquelle |
| `LEGACY-CONTENT-CLASSES` | `classes/**/*.md` | Quelle für Klassen, Merkmale, Choices und Klassentalente | retain-with-justification | kanonische Inhalte bleiben unter `content/`; Legacy nur reproduzierbare Quelle | wenn ein signiertes Migrations-Freeze-Manifest die Originaltexte ersetzt |
| `LEGACY-CONTENT-FEATS` | `feats/**/*.md` | Detailquellen für allgemeine Talente | retain-with-justification | IDs und Texte sind migriert; Quelle bleibt für Diff und Provenienz | nach archivierter Originalquelle und vollständiger Regelentscheidung |
| `LEGACY-CONTENT-GEAR` | `gear/**/*.md` | Tabellenquelle für 80 Gegenstände | retain-with-justification | strukturierte Gegenstandsdaten sind kanonisch; Altquelle bleibt Nachweis | nach archivierter Originalquelle und Klärung aller zwölf Entwürfe |
| `LEGACY-CONTENT-RACES` | `races/**/*.md` | Quelle für Abstammungen, Herkünfte und Abstammungstalente | retain-with-justification | Begriff `ancestry` und stabile IDs sind kanonisch; Alttexte bleiben Provenienz | nach archivierter Originalquelle |
| `LEGACY-CONTENT-SPELLS` | `spells/**/*.md` | Quelle für 14 Zauber und Rangkonflikte | retain-with-justification | Detaildatei-Priorität bleibt dokumentierte Importkonvention | nach fachlicher Entscheidung zu allen Rang- und Höhenkonflikten |
| `LEGACY-CONTENT-RULES` | `rules/**/*.md` | Quelle für Kernregeln, Skills und Playtest-Hintergründe | retain-with-justification | strukturierte Kernregeln und Konventionen werden kanonisch ergänzt | wenn jede verwendete Konvention als getestete Regelentität vorliegt |
| `LEGACY-CONTENT-LORE` | `lore/**/*.md`, `regelwerk_outline.md` | Setting- und Planungsquellen ohne Laufzeitimport | retain-with-justification | als redaktionelle Quellen behalten, nicht in Rules Engine laden | nur bei Übernahme in eine eigene Lore-Contentdomäne |
| `LEGACY-MIGRATOR` | `packages/content-compiler/src/migrate.ts` | deterministischer Einmalimport und Regression der 64 Quellen | adapt | auf zentral geprüfte Aliases, Regelklassifikation und Schema-Migration ausrichten | wenn ein eingefrorenes Importartefakt denselben Verlustfreiheitsnachweis liefert |
| `LEGACY-MANIFEST` | `content/migration-manifest.json` | Zuordnung jeder Altquelle zu kanonischen IDs | adapt | um Zielstatus, Entscheidungen und Aliasprüfung ergänzen | bleibt bis zum Wegfall des letzten Legacy-Imports |
| `LEGACY-CHARACTER-V1` | LocalStorage-Key `shadows-of-the-city.characters.v1` | aktuell gespeicherte Character-Builds | migrate | versionierte Pipeline bis Character-Format 2; Originalwerte bei Konflikten erhalten | wenn keine unterstützte Installation mehr V1-Daten erzeugt |
| `LEGACY-CHARACTER-JSON` | exportiertes Format mit `formatVersion: 1` | Dateiimport und -export | migrate | Parser erkennt Version, Aliases und Konflikte; Export schreibt nur neues Format | Importunterstützung bleibt mindestens bis Version 0.2 |
| `LEGACY-CATALOG-HASH` | Character-Feld `catalogHash` | grobe Kompatibilitätsprüfung | adapt | um Schema-, App- und Character-Version ergänzen und Status differenzieren | kein Wegfall; wird Teil des neuen Formats |
| `LEGACY-STORAGE-FALLBACK` | `loadCharacter()` | ersetzt unbekannte oder beschädigte Daten durch leeren Build | replace | strukturierter Ladefehler mit Wiederherstellungsoption statt stiller Ersatzwerte | nach Tests für beschädigte und veraltete Formate |
| `LEGACY-UI-STATE` | direkte State- und Choice-Manipulation in `App.tsx` | steuert Builder und Persistenz | replace | Application Service validiert Dokumente und delegiert Regeln ausschließlich an Engine | wenn E2E Änderung, Konflikt und Korrektur belegt |
| `LEGACY-CHOICE-MATCHER` | Compiler und Rules Engine | prüft Optionsfilter in zwei Implementierungen | replace | gemeinsame pure Selector-Funktion in der Rules Engine beziehungsweise Shared-Schicht | wenn Compiler- und Engine-Tests denselben Vertrag verwenden |
| `LEGACY-TEXT-EFFECT` | `{kind: text, machineReadable: false}` | bewahrt 410 nicht ausgeführte Regeln | adapt | jeder Effekt erhält Umsetzungsstatus oder Entscheidungs-ID; eindeutige Kerne werden formalisiert | wenn nur `display-only`, `partially-structured` oder blockierte Entscheidungen verbleiben |
| `LEGACY-CREATURE-DND5E` | `legacySystem: dnd5e` | isoliert alte Statblocks | retain-with-justification | nicht in Character-Berechnungen verwenden; sichtbar kennzeichnen | nach separatem Kreaturen-Balancing |
| `LEGACY-BUILD-OUTPUT` | `dist/`, `test-results/`, `playwright-report/` | lokale Build- und Testausgabe | remove | weiterhin ignorieren und vor Release reproduzierbar neu erzeugen | bei jedem Clean-Build automatisch entfernbar |

## Alias- und ID-Strategie

Stabile kanonische IDs bleiben unverändert. Alte Schreibweisen werden künftig in einer
zentralen Aliasdatei aufgelöst. Unbekannte Werte werden mit Originalwert und Konflikt
erhalten. Alias-Zyklen, mehrere Ziele und Ziele ohne Katalogeintrag sind harte
Compilerfehler.

## Ergebnis

Kein Legacy-Bestand wird von der Anwendung stillschweigend umgangen. Die produktive
Laufzeit verwendet bereits ausschließlich den kompilierten Katalog. Verbleibende
Legacy-Komponenten haben einen belegbaren Import-, Migrations- oder Provenienzzweck und
ein konkretes Entfernungskriterium.
