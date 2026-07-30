# Redaktionelle Abschlussprüfung

## Redaktion

| Kennzahl | Anzahl |
|:--|--:|
| geprüfte Entitäten | 737 |
| aktive Entitäten | 725 |
| neu geschriebene Entitäten (`rewritten`) | 95 |
| geprüft und leicht strukturell überarbeitet (`reviewed`) | 630 |
| unverändert ohne redaktionellen Status übernommen | 0 |
| fachlich blockierte Entwürfe | 12 |
| verbleibend `migrated` | 0 |
| `reviewed` | 630 |
| `rewritten` | 95 |
| `needs-rules-decision` | 12 |

Die 95 Neufassungen bestehen aus 19 Fertigkeiten, 8 Hintergründen und 68 aktiven Gegenständen. Elf Waffenmodifikationen ohne eigenständige Grundwerte sowie das nicht vollständig definierte Artefakt bleiben als Entwurf gesperrt.

## Textqualität

- Durchschnittliche Kurztextlänge: 81 Zeichen; Median: 75 Zeichen.
- Identische Kurztexte: 0.
- Generische Platzhalter- oder Migrationstexte: 0.
- Kurztexte unter 20 Zeichen: 0; unter dem Orientierungswert von 80 Zeichen: 392.
- Ähnlichkeitsheuristik: 189 Entitäten besitzen mindestens einen Kandidaten ab 0,72 Jaccard-Ähnlichkeit. Diese Fälle sind im JSON einzeln ausgewiesen; es verbleiben keine wortgleichen oder blockierenden Paare.
- Automatische Qualitätsblocker: 0; dokumentierte redaktionelle Hinweise: 69.
- Korrigierte Markdown-Darstellungsprobleme: 1 doppelte Wiedergabe bei identischem Regel- und Quelltext.
- Fachliche Ausnahmen: 12 gesperrte Entwürfe; keine Ausnahme ist aktiv auswählbar.

Die Einzelbewertung mit Quelle, Feldlängen, Satzprüfung, Wirkungs- und Nutzungsheuristik, Voraussetzungen, Zahlenabgleich, Wiederholung und Ähnlichkeit steht in `generated/editorial-quality-report.json`.

## Klassifikation

80 Gegenstände sind vollständig klassifiziert: 40 Waffen, 12 Rüstungen und 28 Ausrüstungsgegenstände.

### Hauptkategorien

| Kategorie | Anzahl |
|:--|--:|
| weapon | 40 |
| armor | 9 |
| protective-clothing | 7 |
| magical-item | 6 |
| electronics | 4 |
| everyday | 3 |
| vehicle | 3 |
| communication | 2 |
| surveillance | 2 |
| tool | 2 |
| medical | 1 |
| service | 1 |

### Technologie und Verfügbarkeit

| Technologieniveau | Anzahl | Verfügbarkeit | Anzahl |
|:--|--:|:--|--:|
| arcane | 20 | licensed | 34 |
| archaic | 20 | common | 17 |
| biotech | 2 | registered | 15 |
| conventional | 22 | restricted | 9 |
| high-tech | 11 | black-market | 3 |
| magitech | 5 | illegal | 1 |
|  |  | unique | 1 |

### Herkunft

Mehrfachzuordnungen sind zulässig: zivil 29, okkult 26, Konzern 20, Militär 16, Straße 12, Behörde 8, Industrie 6, Medizin 4, andersweltlich 4 und kriminell 1.

Mehrdeutige Klassifikationen: 12. Keine Entität verwendet eine Kategorie `special`; Qualität bleibt bei allen Einträgen bewusst ungesetzt, weil sie nicht sicher aus Preis oder Seltenheit abgeleitet werden darf.

## Maschinenlesbarkeit

| Klasse | Regeltexte |
|:--|--:|
| rein erzählerisch | 199 |
| situative Textregel | 103 |
| charakterwertrelevant | 101 |
| auswahlrelevant | 188 |
| voraussetzungsrelevant | 32 |
| kampfwertrelevant | 102 |
| fachlich ungeklärt | 12 |

410 Wirkungen sind ausdrücklich als Text-Effekt modelliert; 8 Entitäten besitzen bereits strukturierte Effekte. Neu formalisiert wurden 0 Regeln. Bei den übrigen klar wirkenden Boni fehlen in der Quelle insbesondere Ziel-ID, Bonusart, Dauer oder Stapelung, sodass eine Automatisierung eine nicht beauftragte Regeländerung wäre.

## Prüfungen

- `npm run content:migrate`: 64 Quellen zu 737 Entitäten.
- `npm run content:validate`: 737 gültige Dateien.
- `npm run editorial:quality`: 0 Blocker.
- `npm run equipment:classification`: 80 von 80 vollständig.
- `npm run machine-readability:audit`: 737 von 737 Regeltexten klassifiziert.
- `npm run typecheck`: erfolgreich.
- `npm run test`: 52 von 52 Tests erfolgreich.
- `npm run test:e2e`: 16 von 16 Browserprüfungen erfolgreich.
- Vite-Produktionsbuild: erfolgreich.
- Visuelle Prüfung: 13 neue Screenshots auf Desktop und Mobil geprüft.

## Ergebnis

Alle aktiven Entitäten sind mindestens `reviewed`, alle vorhandenen Gegenstände besitzen eine mehrdimensionale Klassifikation und alle Klassifikationswerte sind in der UI deutsch lokalisiert. Der Katalog kann nach Kategorie, Unterkategorie, Technik, Verfügbarkeit, Herkunft, Qualität, Merkmal, Stufe, Preis und Last gefiltert sowie nach Haupt- oder Unterkategorie und optional nach Technologie gruppiert werden. Offene Kernregeln sind ausschließlich als nicht auswählbare Entwürfe dokumentiert.
