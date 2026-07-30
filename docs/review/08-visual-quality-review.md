# Visuelle Qualitätsprüfung

Die Screenshots wurden mit Playwright bei 1440 x 900 Pixeln und für die mobile
Ansicht bei 390 x 844 Pixeln erzeugt. Alle Dateien liegen unter
`docs/review/screenshots/`.

## Geprüfte Zustände

| Datei | Zustand | Ergebnis |
|:--|:--|:--|
| `01-start.png` | Startseite | klare Hierarchie, deutsche Prüfhinweise, keine Überläufe |
| `02-ancestry.png` | Abstammungsauswahl | stabile Karten, lesbare Kurztexte und Merkmale |
| `03-background.png` | Hintergrundauswahl | Auswirkungen und Status verständlich |
| `04-class.png` | Klassenauswahl | Rollenbeschreibung und Kernwerte scanbar |
| `05-feats.png` | Talentliste | Sperrgründe und Verfügbarkeit eindeutig |
| `06-spells.png` | Zauberliste | Rang, Tradition und Kurztext konsistent |
| `07-feat-detail.png` | Talentdetail | Voraussetzungen, Effekte und Textregelhinweis getrennt |
| `08-spell-detail.png` | komplexer Zauber | Parameterblock und responsive Markdown-Tabelle korrekt |
| `09-class-detail.png` | Klassendetail | Progression und Referenzen ohne leere Rasterzelle |
| `10-markdown-table.png` | Markdown-Tabelle | horizontal scrollbar, keine rohe Tabellensyntax |
| `11-locked-option.png` | gesperrte Option | deutsche Attribute und konkrete Ist-/Soll-Werte |
| `12-review.png` | Abschlussprüfung | Probleme als Nutzeraussagen statt Fehlercodes |
| `13-mobile.png` | mobile Ansicht | Navigation, Karten und Inhalte innerhalb des Viewports |

## Befunde und Korrekturen

| Befund | Korrektur | Nachweis |
|:--|:--|:--|
| `Background` erschien in Prüfhinweisen | Rules Engine verwendet `Hintergrund` | `01-start.png` |
| `Feats & Features` und `Feat` waren sichtbare englische Begriffe | zentrale Anzeige als `Talente und Merkmale` beziehungsweise `Talent` | `05-feats.png`, `11-locked-option.png` |
| Voraussetzungen zeigten Attribute wie `dexterity` | Prädikate werden über die typsicheren deutschen Formatter ausgegeben | `11-locked-option.png` |
| Legacy-Markdown enthielt englische Abschnittsbegriffe | Anzeige normalisiert vorhandene Begriffe vor dem sicheren Rendern | `08-spell-detail.png` |
| Zauberdauer konnte als technischer Ersatzwert erscheinen | verständlicher Hinweis auf den vollständigen Regeltext | `08-spell-detail.png` |
| ungerade Detailraster erzeugten eine graue Leerfläche | Rasterhintergrund auf die tatsächlichen Detailfelder begrenzt | `09-class-detail.png` |

## Abschlussbewertung

Nach der Korrekturrunde wurden alle Screenshots neu erzeugt. Es verbleiben
keine abgeschnittenen Haupttexte, rohen IDs, ungerenderten Markdown-Strukturen,
überlaufenden Chips oder unverständlichen technischen Labels. Tabellen nutzen
bei geringerer Breite einen eigenen horizontalen Scrollbereich. Die mobile
Ansicht bleibt ohne horizontalen Seitenüberlauf bedienbar.
