# Implementierungsfortschritt

Dieses Dokument wird nach jeder Phase aktualisiert. Eine Phase ist nur
`complete`, wenn ihre Ergebnisse geprüft wurden und das Repository in einem
validen Zustand ist.

| Phase | Status | Ergebnis |
|:--|:--|:--|
| 0 - Baseline | complete | 64 Ausgangsdateien und alle erkannten Entitätstypen inventarisiert |
| 1 - Review | pending | |
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

## Nächster konkreter Schritt

Jede relevante Quelldatei für Phase 1 vollständig inhaltlich prüfen und Befunde
mit stabilen Review-IDs erfassen.
