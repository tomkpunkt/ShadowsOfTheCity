# Visuelle Prüfung von Redaktion und Katalog

## Umfang

Die Prüfung deckt 13 neue Zustände des Ausrüstungskatalogs und der redaktionellen Detailansicht ab. Playwright erzeugt die Bilder reproduzierbar in `docs/review/screenshots/`.

| Bild | Zustand | Prüfergebnis |
|:--|:--|:--|
| `14-equipment-categories.png` | Hauptkategorien | Gruppenüberschriften, Zähler und Karten sind eindeutig und ohne Verschachtelung lesbar. |
| `15-technology-subgroups.png` | Untergruppen nach Technologie | Technologieüberschriften und Teilmengen werden getrennt und mit korrekten Zählern dargestellt. |
| `16-combined-equipment-filters.png` | kombinierte Filter | Auswahlfelder, aktive Eingrenzungen und Trefferzahl bleiben nachvollziehbar. |
| `17-equipment-card.png` | Ausrüstungskarte | Kategorie, Unterkategorie, Technik, Stufe, Kurztext, Merkmale und Status sind sichtbar. |
| `18-weapon-detail.png` | Waffendetail | Schaden, Reichweite, Preis, Last, Herkunft, Verfügbarkeit und Regeltext sind vollständig lesbar. |
| `19-armor-detail.png` | Rüstungsdetail | Schutzwert, GE-Limit und Klassifikation erscheinen ohne leere Felder. |
| `20-high-tech-item.png` | High-Tech-Gerät | Technik- und Herkunftslabels sind lokalisiert und klar getrennt. |
| `21-archaic-item.png` | archaischer Gegenstand | Die technologische Einordnung ist auf Karte und Detail konsistent. |
| `22-arcane-item.png` | arkaner Gegenstand | Arkane Klassifikation und Regelwerte sind ohne technische IDs sichtbar. |
| `23-magitech-item.png` | arkanotechnischer Gegenstand | `magitech` wird konsistent als „Arkanotechnisch“ dargestellt. |
| `24-long-feat-text.png` | langer Talenttext | Der Regeltext fließt vollständig im Drawer und wird nicht abgeschnitten. |
| `25-structured-spell.png` | strukturierter Zauber | Parameter, Markdown-Tabelle und Textregelhinweis besitzen konsistente Abstände. |
| `26-mobile-equipment.png` | mobile Ausrüstungsliste | Filter sind einspaltig, die Navigation ist geschlossen und Karten liegen vollständig im Viewport. |

## Behobene Befunde

- Der strukturierte Schadenstyp wurde zunächst als unbekannte Referenz angezeigt. Die beiden vorhandenen Schadenstypen besitzen nun eigene deutsche Labels.
- Der erste Mobilshot wurde während der Navigationstransition aufgenommen. Der Test wartet nun auf deren Ende.
- Das zweispaltige Filterraster konnte auf 390 Pixel Breite horizontal überlaufen. Unter 500 Pixeln wird es verbindlich einspaltig.
- Identische Regel- und Quelltexte erzeugten doppelte Markdown-Tabellen. Die Detailansicht unterdrückt den redundanten Quelltextabschnitt.

## Ergebnis

Desktop und Mobil zeigen keine überlappenden Bedienelemente, abgeschnittenen Regeltexte oder leeren Detailzeilen. Karten bleiben kompakt, während vollständige Regeln und Klassifikationswerte im Drawer lesbar sind. Die 13 Screenshots wurden nach den Korrekturen erneut erzeugt und manuell geprüft.
