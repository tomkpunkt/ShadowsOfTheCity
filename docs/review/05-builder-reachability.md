# Builder-Reichweite

Automatischer Stand für Katalog `427f9dfc8f4ecec665ed08d9ee714d34a3f14659dcb1d2f462dd62a1622431ae`.

## Ergebnis

- 737 Entitäten geprüft
- 737 im Builder oder Kompendium erreichbar
- 356 auswählbar
- 301 automatisch oder durch eine Auswahl eingebunden
- 80 informativ im Kompendium
- 0 ausdrücklich ausgenommen
- 0 blockierende Befunde

| Typ | Gesamt | Erreichbar | Auswählbar | Automatisch | Informativ | Ausnahme |
|:--|:--|:--|:--|:--|:--|:--|
| `ancestry` | 8 | 8 | 8 | 0 | 0 | 0 |
| `armor` | 12 | 12 | 12 | 0 | 0 | 0 |
| `background` | 8 | 8 | 8 | 0 | 0 | 0 |
| `choice` | 168 | 168 | 0 | 168 | 0 | 0 |
| `class` | 9 | 9 | 9 | 0 | 0 | 0 |
| `class-feature` | 99 | 99 | 30 | 69 | 0 | 0 |
| `creature` | 34 | 34 | 0 | 0 | 34 | 0 |
| `equipment` | 28 | 28 | 28 | 0 | 0 | 0 |
| `feat` | 195 | 195 | 148 | 8 | 39 | 0 |
| `heritage` | 40 | 40 | 40 | 0 | 0 | 0 |
| `language` | 10 | 10 | 0 | 10 | 0 | 0 |
| `proficiency` | 16 | 16 | 0 | 16 | 0 | 0 |
| `rule` | 4 | 4 | 0 | 0 | 4 | 0 |
| `skill` | 19 | 19 | 19 | 0 | 0 | 0 |
| `spell` | 14 | 14 | 14 | 0 | 0 | 0 |
| `spellcasting-progression` | 3 | 3 | 0 | 3 | 0 | 0 |
| `trait` | 30 | 30 | 0 | 27 | 3 | 0 |
| `weapon` | 40 | 40 | 40 | 0 | 0 | 0 |

## Prüfvertrag

Der Audit bricht mit Exit-Code 1 ab, wenn eine aktive Entität weder erreichbar
noch mit konkreter Begründung in `scripts/audit-allowlist.json` ausgenommen
ist, eine Pflichtauswahl zu wenige Optionen besitzt oder die Allowlist eine
unbekannte ID enthält. Die maschinenlesbare Einzelprüfung aller Entitäten steht
in `generated/builder-reachability-report.json`.

## Blockierende Befunde

Keine.
