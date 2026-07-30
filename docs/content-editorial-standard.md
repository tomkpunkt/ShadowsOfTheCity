# Redaktioneller Contentstandard

## Zweck der Textfelder

Jede Runtime-Entität besitzt einen eigenständigen `summary`, einen
`editorialStatus` und einen vollständigen `rulesText`. Der Markdown-Body bleibt
als `description` die quellennahe Gesamtdarstellung erhalten.

- `summary`: konkreter, vollständiger Satz für Karten und Suche; Zielwert 80
  bis 220 Zeichen
- `flavorText`: optionale, knappe Einordnung in Cyberpunk, Urban Fantasy oder
  Noir; enthält keine neue Regel
- `rulesText`: alle sicher belegten Regeln in verständlicher Reihenfolge
- `usageNotes`: optionale praktische Nutzung, ohne Regelwirkung zu erfinden
- `limitations`: optionale belegte Einschränkungen und Sonderfälle
- `examples`: nur für Beispiele, die eine vorhandene Regel wirklich erklären

Inhalte ohne ausreichend sichere Regelgrundlage behalten die betreffende
Wirkung als gekennzeichnete Textregel. Redaktionelle Arbeit ändert keine Zahl,
Voraussetzung, Aktion, Reichweite oder Wirkung.

## Redaktionsstatus

| Status | Bedeutung |
|:--|:--|
| `migrated` | technisch übernommen, noch nicht redaktionell abgeschlossen |
| `reviewed` | einzeln gegen Quelle und strukturierte Felder geprüft |
| `rewritten` | Kurz- oder Regeltext substanziell und quellentreu neu gefasst |
| `needs-rules-decision` | wesentliche Mechanik benötigt eine fachliche Entscheidung |

Aktive Inhalte müssen mindestens `reviewed` sein. `needs-rules-decision`
kennzeichnet nur Entitäten, deren sichere Nutzung ohne Entscheidung nicht
möglich ist.

## Gemeinsame Terminologie

- `Talent`, nicht `Feat`
- `Fertigkeit`, nicht `Skill`
- `Merkmal`, nicht `Feature`
- `Hintergrund`, nicht `Background`
- `Stufe` für Charakter- und Talentstufen, `Rang` für Zauber
- `Kompetenzrang` für ungeübt, geübt, Experte, Meister und legendär
- `Fuß`, `GP`, `Last`, `Rüstungsklasse`, `Rettungswurf`

Technische IDs, Dateinamen, Migrationsterminologie und rohe Enum-Werte gehören
nicht in sichtbare Texte.

## Anforderungen nach Entitätstyp

| Typ | Inhalt des Kurztexts | Erforderlicher Regeltext | Sinnvolle Markdown-Struktur |
|:--|:--|:--|:--|
| Klasse | Rolle, Kernmechanik und Spielweise | TP, Schlüsselattribute, Kompetenzen, Merkmale, Choices, Progression | Rolle, Kernwerte, Progression, Spielweise |
| Klassenmerkmal | konkrete Wirkung und Vergabezeitpunkt | Stufe, Aktion, Voraussetzungen, Effekte, offene Textregel | Wirkung, Anwendung, Einschränkung |
| Abstammung | körperliche und spielmechanische Identität | TP, Größe, Bewegung, Attribute, Sprachen, Merkmale, Herkünfte | Einordnung, Spielwerte, Gesellschaft |
| Herkunft | prägende Besonderheit und mechanische Wirkung | Abstammungsbezug, Voraussetzungen, Effekte | Wirkung, Einschränkung |
| Hintergrund | soziale Rolle und konkrete Startvorteile | Attribute, Fertigkeit, Talent, Choices, Effekte | Einordnung, Spielwerte |
| Fertigkeit | typische Aufgaben und verwendetes Attribut | trainierte und untrainierte Anwendung, belegte Grenzen | Anwendung, Attribut |
| Talent | konkrete Wirkung oder freigeschaltete Handlung | Stufe, Kategorie, Voraussetzungen, Aktion, Effekte | Wirkung, Anwendung, Einschränkung |
| Zauber | eindeutige Wirkung und Ziel | Rang, Tradition, Aktionen, Reichweite, Ziel, Dauer, Abwehr, Steigerung | Wirkung, Parameter, höhere Ränge |
| Waffe | Waffenart, Schaden und Einsatzprofil | Hände, Schaden, Reichweite, Kapazität, Klassifikation, Beschränkung | Wirkung, Werte, Nutzung |
| Rüstung | Schutzart und RK-Wirkung | Bonus, GE-Limit, Last, Klassifikation | Schutzwirkung, Werte, Einschränkung |
| Ausrüstung | konkrete Funktion und typischer Einsatz | Preis, Last, Effekte, Klassifikation, belegte Grenzen | Funktion, Anwendung |
| Choice | welche Entscheidung auf welcher Stufe getroffen wird | Art, Minimum, Maximum, Filter, Voraussetzungen | Auswahl und Grenzen |
| Kreatur | Rolle im Setting und erkennbare Gefahr | Stufe, TP, RK, Bewegung, Regelsystem | Auftreten, Werte |
| Regel | präzise Aussage des Regelvertrags | Schlüssel und vollständiger Wert | Regel, Beispiel nur bei Bedarf |
| Trait | Bedeutung des Merkmals | anwendbare Entitätstypen | ein kurzer Definitionsabsatz |
| Sprache | gesellschaftliche Verwendung | Seltenheit | Einordnung |
| Kompetenz | abgedeckter Regelbereich | Kategorie und Attribut, soweit vorhanden | Definition |
| Zauberprogression | Klasse, Tradition und Vorbereitungsart | Ränge, Plätze und Kompetenzfortschritt | Progression |

## Qualitätsbeispiele

Schlecht:

> Dieser Gegenstand kann in verschiedenen Situationen nützlich sein.

Gut:

> Der Scanner untersucht seine Umgebung mit erweiterten Sensoren und unterstützt
> Proben, bei denen verborgene Signale oder ungewöhnliche Stoffe erkannt werden.

Schlecht:

> Athletik ist eine Fertigkeit mit Stärke als typischem Attribut.

Gut:

> Athletik nutzt Stärke für Klettern, Springen, Schwimmen und andere
> Kraftleistungen, bei denen Bewegung gegen körperlichen Widerstand gelingt.

Schlecht:

> Wähle ein verfügbares Magier-Talent.

Gut:

> Wähle auf Stufe 6 ein Magiertalent, dessen Stufe deine aktuelle
> Charakterstufe nicht überschreitet.

Schlecht sind außerdem zusammengezogene Tabellenzeilen, reine Stichwortketten,
Namenswiederholungen und Texte, deren Wirkung nur in unsichtbaren Feldern steht.

## Ausrüstungstaxonomie

Die Klassifikation trennt sechs Dimensionen:

1. `category`: Gegenstandsart
2. `subcategory`: typabhängige Unterart
3. `technologyLevel`: technischer oder magischer Funktionsstand
4. `availability`: rechtlicher oder praktischer Zugang
5. `origins`: mehrere belegbare Herkunftsbereiche
6. `quality`: optionale Eigenschaft einer ausdrücklich beschriebenen Variante

`special` ist in keiner Dimension zulässig. Magie, Technologie und rechtlicher
Zugang werden nicht in einer Sammelkategorie vermischt. Traits beschreiben nur
zusätzliche Funktionen wie `concealable`, `silent`, `connected` oder
`traceable`.

### Technologiestufen

| Wert | Deutsches Label | Definition |
|:--|:--|:--|
| `archaic` | Archaisch | traditionelle, handwerkliche oder vorindustrielle Technik |
| `conventional` | Konventionell | etablierte industrielle Technik |
| `low-tech` | Low-Tech | einfache, verbreitete und modular reparierbare Zukunftstechnik |
| `high-tech` | High-Tech | komplexe Elektronik oder hochwertige Spezialfertigung |
| `experimental` | Experimentell | Prototyp oder instabile Forschungsanfertigung |
| `biotech` | Biotechnologisch | organische, genetische, neurologische oder medizinische Technik |
| `arcane` | Arkan | primär durch Magie, Rituale, Geister oder Essenzen betrieben |
| `magitech` | Arkanotechnisch | untrennbar verbundenes technisches und magisches System |

### Verfügbarkeit

`common`, `registered`, `licensed`, `restricted`, `military`, `illegal`,
`black-market` und `unique` werden als frei verfügbar,
registrierungspflichtig, lizenzpflichtig, eingeschränkt, militärisch
kontrolliert, illegal, Schwarzmarkt und einzigartig angezeigt.

### Qualitätsstufen

`improvised`, `poor`, `standard`, `professional`, `premium`, `military`,
`prototype` und `masterwork` sind zulässig, werden aber nur gesetzt, wenn die
Quelle die konkrete Ausführung beschreibt. Preis oder Seltenheit allein reichen
nicht aus.
