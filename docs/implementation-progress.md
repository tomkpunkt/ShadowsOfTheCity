# Implementierungsfortschritt

Dieses Dokument wird nach jeder Phase aktualisiert. Eine Phase ist nur
`complete`, wenn ihre Ergebnisse geprüft wurden und das Repository in einem
validen Zustand ist.

| Phase | Status | Ergebnis |
|:--|:--|:--|
| 0 - Baseline | complete | 64 Ausgangsdateien und alle erkannten Entitätstypen inventarisiert |
| 1 - Review | complete | 32 priorisierte Befunde aus der vollständigen Quellenprüfung dokumentiert |
| 2 - Datenmodell | pending | |
| 3 - Migration | pending | |
| 4 - Content Compiler | pending | |
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

## Nächster konkreter Schritt

Versioniertes Datenmodell, ID-Konventionen, Prädikate, Effekte und Choices für
Phase 2 implementieren.
