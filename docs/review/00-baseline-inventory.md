# Baseline-Inventur

Stand: Repository-Commit `6a92f9d` auf Branch `main`

## Zweck und Zählregeln

Diese Inventur beschreibt den unveränderten Ausgangsbestand vor der Migration. Eine
"erkannte Entität" ist ein benanntes, potenziell spielmechanisches Objekt in einer
Übersicht, Tabelle, Überschrift oder Detaildatei. Da noch keine stabilen IDs
existieren, werden Vorkommen, eindeutige Namen und Detailgrade getrennt ausgewiesen.

Annahmen:

- `race` und `ancestry` werden in der Baseline synonym behandelt. Im neuen Modell
  wird `ancestry` der kanonische Begriff.
- Tabellenzeilen in Übersichtsdateien zählen als Entitäten, auch wenn keine
  Detaildatei existiert.
- Klassen-Feats und Abstammungs-Feats zählen zusätzlich zu den allgemeinen Feats,
  weil sie eigenständige Auswahloptionen darstellen.
- Varianten und Vorlagen im Bestiary bzw. bei Waffen zählen als Entitätskandidaten.
- Lore-Abschnitte werden erfasst, aber erst dann zu Katalogentitäten, wenn sie für
  Auswahl, Regeln oder Referenzen benötigt werden.

## Repository-Zustand

| Merkmal | Wert |
|:--|:--|
| Branch | `main` |
| Upstream | `origin/main` |
| Commit | `6a92f9d Update bestiary: Add HTML stat block styling and new variations` |
| Arbeitsbaum | sauber |
| Dateien | 64 |
| Markdown-Dateien | 64 |
| Andere Dateiformate | 0 |
| Verzeichnisse | 12 |
| Umfang | 378.094 Bytes |
| Frontmatter | 0 Dateien |
| Stabile IDs | 0 |
| Formale Schemas | 0 |
| Automatisierte Tests | 0 |
| Build-/Package-Konfiguration | nicht vorhanden |

## Inhaltsinventar

| Entitätstyp | Dateien | Erkannte Entitäten | Detailgrad | Quellen |
|:--|--:|--:|:--|:--|
| Klassen | 9 | 9 | je eine Detaildatei | `classes/klasse_*.md` |
| Klassenmerkmale | 9 | 69 Merkmale, 30 Unteroptionen | Fließtext | Klassen-Dateien |
| Klassen-Feats | 9 | 99 Tabellenzeilen | Kurzdefinition | Klassen-Dateien |
| Archetypen | 9 | 27 | Kurzbeschreibung | Klassen-Dateien |
| Abstammungen | 8 | 8 | je eine Detaildatei | `races/*_zeitalter_des_goldes.md` |
| Abstammungsmerkmale | 8 | 8 | Fließtext | Abstammungs-Dateien |
| Abstammungs-Feats | 8 | 40 | Kurzdefinition | Abstammungs-Dateien |
| Heritages | 8 | 40 | Kurzdefinition | Abstammungs-Dateien |
| Backgrounds | 0 | 0 | fehlt | nur freie Erwähnungen in Regeln |
| Skills | 1 | 16 | Name, Attribut, Kurztext | `rules/core_mechanics.md` |
| Allgemeine Feats | 12 | 21 im Katalog | 11 detailliert, 10 nur Übersicht | `feats/` |
| Zauber | 15 | 14 | je eine Detaildatei und TOC-Eintrag | `spells/` |
| Waffen | 2 | 54 Vorkommen, 41 eindeutige Konzepte | gemischt | `gear/` |
| Rüstungen | 1 | 12 | Tabellenzeilen | `gear/equipment/equipment_overview.md` |
| Sonstige Ausrüstung | 1 | 28 | Tabellenzeilen | Kleidung, Technik, Fahrzeuge, Magie |
| Kreaturen/NPCs | 10 | 34 eindeutige Konzepte | 8 Detaildateien, übrige Übersicht/Varianten | `bestiary/` |
| Sprachen | 8 | 10 Kandidaten | freie Namen | Abstammungs-Dateien |
| Zaubertraditionen | 15 | 4 verwendet, 3 im TOC erklärt | freie Namen | Zauber-Dateien |
| Regelbereiche | 2 | 2 große Regeldokumente | Fließtext und Tabellen | `rules/` |
| Lore-Bereiche | 2 | Timeline und Mächteverzeichnis | Fließtext | `lore/` |
| Traits | mehrere | nicht belastbar zählbar | freie, nicht geschlossene Begriffe | alle Inhaltsbereiche |
| Conditions | mehrere | nicht kanonisch definiert | freie Erwähnungen | Zauber, Klassen, Bestiary |
| Cyberware | 1 Übersicht | 1 Rüstung plus freie Erwähnungen | unvollständig | Ausrüstung und Outline |

## Klassen

Alle neun Klassen besitzen Schlüsselattribut, Trefferpunkte,
Anfangsproficiencies, Klassenmerkmale, elf Klassen-Feat-Zeilen und drei
Archetypen.

| Datei | Merkmale | Unteroptionen | Klassen-Feats | Archetypen |
|:--|--:|--:|--:|--:|
| `classes/klasse_agent.md` | 8 | 3 | 11 | 3 |
| `classes/klasse_ingenieur.md` | 8 | 4 | 11 | 3 |
| `classes/klasse_magier.md` | 8 | 4 | 11 | 3 |
| `classes/klasse_mediziner.md` | 8 | 4 | 11 | 3 |
| `classes/klasse_okkultist.md` | 8 | 4 | 11 | 3 |
| `classes/klasse_raufbold.md` | 8 | 0 | 11 | 3 |
| `classes/klasse_schamane.md` | 7 | 5 | 11 | 3 |
| `classes/klasse_soeldner.md` | 7 | 3 | 11 | 3 |
| `classes/klasse_waechter.md` | 7 | 3 | 11 | 3 |
| **Summe** | **69** | **30** | **99** | **27** |

Die Klassen-Feat-Tabellen verwenden Namen als implizite Referenzen. Keines dieser
99 Vorkommen besitzt eine ID oder eine separate Detaildatei.

## Abstammungen

| Datei | Abstammungs-Feats | Heritages |
|:--|--:|--:|
| `races/elfen_zeitalter_des_goldes.md` | 5 | 5 |
| `races/gnome_zeitalter_des_goldes.md` | 5 | 5 |
| `races/goblins_zeitalter_des_goldes.md` | 5 | 5 |
| `races/halblinge_zeitalter_des_goldes.md` | 5 | 5 |
| `races/mensch_zeitalter_des_goldes.md` | 5 | 5 |
| `races/orks_zeitalter_des_goldes.md` | 5 | 5 |
| `races/tieflinge_zeitalter_des_goldes.md` | 5 | 5 |
| `races/zwerge_zeitalter_des_goldes.md` | 5 | 5 |
| **Summe** | **40** | **40** |

Gemeinsame Felder sind Trefferpunkte, Größe, Bewegung,
Attributsverbesserungen, Attributsfehler, Sprachen und Merkmale. Die Werte stehen
in Markdown-Tabellen und sind noch nicht typisiert.

## Skills und Proficiencies

`rules/core_mechanics.md` nennt 16 Skills:

- Physisch: Athletik, Akrobatik, Heimlichkeit, Fahrzeugführung
- Sozial: Überzeugen, Einschüchtern, Diplomatie, Täuschen
- Wissen: Wissenschaft, Technologie, Magie, Gesellschaft
- Wahrnehmung: Wahrnehmung, Überleben, Medizin, Magie Erkennen

Es gibt keine Skill-Dateien, IDs oder vollständige Proficiency-Progression. Die
Begriffe "Geübt" und "Experte" werden in Klassen verwendet; ein geschlossenes
Rangmodell mit untrainiert, geübt, Experte, Meister und legendär fehlt.

## Allgemeine Feats

`feats/feats_overview.md` katalogisiert 21 Feats. Elf besitzen Detaildateien:

- `feat_athletischer_kampfstil.md`
- `feat_beruf_arzt.md`
- `feat_beruf_mechaniker.md`
- `feat_defensiver_kaempfer.md`
- `feat_netzwerker.md`
- `feat_reflextraining.md`
- `feat_schattendealer.md`
- `feat_schnelle_erholung.md`
- `feat_taktiker.md`
- `feat_verbesserte_wahrnehmung.md`
- `feat_zaehigkeit.md`

Nur in der Übersicht vorhanden sind Doppelleben, Gesellschaftlicher Aufsteiger,
Improvisierter Kämpfer, Zäher Hund, Adrenalinrausch, Sanitäter, Hacker, Söldner,
Wissenschaftler und Diplomat.

## Zauber

Es existieren 14 Detaildateien:

`spell_benommenheit.md`, `spell_blitzschlag.md`, `spell_feuerball.md`,
`spell_flamme_erschaffen.md`, `spell_gedankenkontrolle.md`,
`spell_gedankenlesen.md`, `spell_heilung.md`, `spell_licht.md`,
`spell_magie_aufheben.md`, `spell_magie_erkennen.md`, `spell_nachricht.md`,
`spell_schutzschild.md`, `spell_teleportation.md` und
`spell_unsichtbarkeit.md`.

Jede Datei enthält eine Spell-Info-Tabelle, Beschreibung, höhere Ränge,
Sonderregeln und Flavortext. TOC und Detaildateien widersprechen sich bei
mindestens Blitzschlag, Gedankenlesen, Gedankenkontrolle, Nachricht,
Magie erkennen und Teleportation hinsichtlich des Rangs.

## Ausrüstung

`gear/equipment/equipment_overview.md` enthält:

- 28 Waffenzeilen, davon 27 eindeutige Namen (Speer erscheint zweimal)
- 12 Rüstungen
- 8 Kleidungsstücke
- 12 Technologie-/Transportobjekte
- 8 magische Gegenstände oder Komponenten

`gear/weapons/melee/melee_weapons.md` enthält 12 bereits in der Übersicht
vorhandene Nahkampfwaffen sowie 14 weitere technologische, verzauberte,
elementare oder spezialisierte Waffenvarianten. Damit ergeben sich 54
Definitionsvorkommen und 41 eindeutige Waffenkonzepte.

Bulk, Gegenstandsstufe, Seltenheit und einheitliche Traits fehlen. Gewicht ist
nur für die zwölf ausführlichen Nahkampfwaffen vorhanden.

## Bestiary

`bestiary/bestiary_overview.md` nennt 28 Kreaturen oder Varianten. Acht
Detaildateien liegen unter `bestiary/humanoid/`. Diese enthalten 17
Variationsabschnitte; sechs davon sind zusätzliche Konzernschläger- bzw.
Konzernagent-Varianten, die nicht im Überblick stehen. Daraus ergeben sich 34
eindeutige Kreaturenkonzepte.

`bestiary/bestiary_template.md` ist eine Vorlage und keine spielbare Entität.
Die Statblocks enthalten eingebettetes HTML und frei formatierte Werte statt
maschinenlesbarer Felder.

## Formate und Konventionen

- Überschriften und Markdown-Tabellen sind die primären Strukturen.
- Einzeldateien beginnen mit einer H1 und häufig einer freien `Quelle`-Zeile.
- Dateinamen verwenden deutsche Namen, teilweise Singular, teilweise Plural.
- Umlaute werden in Dateinamen meist transliteriert, in Anzeigenamen nicht.
- Querverweise sind freie Namen oder Pfade in Code-Format; echte Markdown-Links
  werden nicht verwendet.
- IDs, Statuswerte, Schema-Versionen, Quellen-IDs und Referenzlisten fehlen.
- Begriffe wechseln zwischen Deutsch und Englisch, etwa `AC`/`RK`,
  `Arcane`/`arkan`, `race`/`Rasse`/`Volk` und `Cantrip`/Rang 0.

## Frühe Duplikate und tote Referenzen

- Die zwölf Basis-Nahkampfwaffen stehen sowohl in der Ausrüstungsübersicht als
  auch in `melee_weapons.md`.
- Speer steht in der Ausrüstungsübersicht in zwei Waffenkategorien.
- Mehrere Bestiary-Varianten stehen zugleich im Überblick und in Detaildateien.
- `feats_overview.md` nennt zehn Feats ohne Detaildatei.
- Klassen nennen Waffen, Skills, Zauber und Feats nur per Freitext; dadurch ist
  keine Referenzauflösung möglich.
- README und Outline behaupten teilweise "vollständig implementierte" Systeme,
  obwohl Backgrounds, formale Progression, Proficiency-Regeln und Builder-Daten
  fehlen.

## Vollständige Dateiliste

### Wurzel

`README.md`, `regelwerk_outline.md`

### Klassen

`classes/TOC.md`, `classes/klasse_agent.md`,
`classes/klasse_ingenieur.md`, `classes/klasse_magier.md`,
`classes/klasse_mediziner.md`, `classes/klasse_okkultist.md`,
`classes/klasse_raufbold.md`, `classes/klasse_schamane.md`,
`classes/klasse_soeldner.md`, `classes/klasse_waechter.md`

### Abstammungen

`races/TOC.md`, `races/elfen_zeitalter_des_goldes.md`,
`races/gnome_zeitalter_des_goldes.md`,
`races/goblins_zeitalter_des_goldes.md`,
`races/halblinge_zeitalter_des_goldes.md`,
`races/mensch_zeitalter_des_goldes.md`,
`races/orks_zeitalter_des_goldes.md`,
`races/tieflinge_zeitalter_des_goldes.md`,
`races/zwerge_zeitalter_des_goldes.md`

### Feats

`feats/feats_overview.md` sowie die elf oben aufgeführten Detaildateien.

### Zauber

`spells/TOC.md` sowie die 14 oben aufgeführten Detaildateien.

### Regeln und Lore

`rules/core_mechanics.md`, `rules/social_mechanics.md`,
`lore/maechte_der_welt_1990.md`, `lore/welt_timeline.md`

### Ausrüstung

`gear/equipment/equipment_overview.md`,
`gear/weapons/melee/melee_weapons.md`

### Bestiary

`bestiary/bestiary_overview.md`, `bestiary/bestiary_template.md`,
`bestiary/humanoid/junior_manager.md`,
`bestiary/humanoid/konzernagent.md`,
`bestiary/humanoid/konzernangestellter.md`,
`bestiary/humanoid/konzernschlaeger.md`,
`bestiary/humanoid/konzernvorstand.md`,
`bestiary/humanoid/ork_schlaeger.md`,
`bestiary/humanoid/senior_manager.md`,
`bestiary/humanoid/strassenschlaeger.md`

## Baseline-Risiken für die Migration

1. Namen sind die einzigen Identifikatoren; gleichnamige Einträge können nicht
   zuverlässig unterschieden werden.
2. Viele Regeln sind beschreibend und enthalten keine ausführbare Formel.
3. Übersicht und Detaildatei können unterschiedliche Werte enthalten.
4. Ein fehlendes Objekt kann derzeit weder automatisch erkannt noch als erlaubte
   Ausnahme dokumentiert werden.
5. Für einen vollständigen Builder müssen fehlende Backgrounds und
   Charaktererschaffungsschritte kanonisch ergänzt werden.

