# Builder-Reichweite

Automatischer Stand für Katalog `dc1dd600b8fdd004ec0b1abb8e7bf31c31019cfcd972f02d523d2c0c1e2c4aa2`.

## Ergebnis

- 927 Entitäten geprüft
- 927 im Builder oder Kompendium erreichbar
- 535 auswählbar
- 317 automatisch oder durch eine Auswahl eingebunden
- 75 informativ im Kompendium
- 0 ausdrücklich ausgenommen
- 0 blockierende Befunde

| Typ | Gesamt | Erreichbar | Auswählbar | Automatisch | Informativ | Ausnahme |
|:--|:--|:--|:--|:--|:--|:--|
| `ancestry` | 8 | 8 | 8 | 0 | 0 | 0 |
| `armor` | 26 | 26 | 26 | 0 | 0 | 0 |
| `background` | 8 | 8 | 8 | 0 | 0 | 0 |
| `choice` | 183 | 183 | 0 | 183 | 0 | 0 |
| `class` | 9 | 9 | 9 | 0 | 0 | 0 |
| `class-feature` | 99 | 99 | 30 | 69 | 0 | 0 |
| `creature` | 34 | 34 | 0 | 0 | 34 | 0 |
| `equipment` | 164 | 164 | 164 | 0 | 0 | 0 |
| `feat` | 195 | 195 | 153 | 8 | 34 | 0 |
| `heritage` | 40 | 40 | 40 | 0 | 0 | 0 |
| `language` | 10 | 10 | 0 | 10 | 0 | 0 |
| `proficiency` | 17 | 17 | 0 | 17 | 0 | 0 |
| `rule` | 4 | 4 | 0 | 0 | 4 | 0 |
| `skill` | 19 | 19 | 19 | 0 | 0 | 0 |
| `spell` | 14 | 14 | 14 | 0 | 0 | 0 |
| `spellcasting-progression` | 3 | 3 | 0 | 3 | 0 | 0 |
| `trait` | 30 | 30 | 0 | 27 | 3 | 0 |
| `weapon` | 64 | 64 | 64 | 0 | 0 | 0 |

## Prüfvertrag

Der Audit bricht mit Exit-Code 1 ab, wenn eine aktive Entität weder erreichbar
noch mit konkreter Begründung in `scripts/audit-allowlist.json` ausgenommen
ist, eine Pflichtauswahl zu wenige Optionen besitzt oder die Allowlist eine
unbekannte ID enthält. Die maschinenlesbare Einzelprüfung aller Entitäten steht
in `generated/builder-reachability-report.json`.

## Blockierende Befunde

Keine.
