# Inhalts- und Regelreview

Stand: Phase 1 auf Basis des unveränderten Inhaltsbestands von Commit `6a92f9d`

## Zusammenfassung

Das Repository besitzt eine starke Setting-Identität, neun unterscheidbare
Klassen, acht ausgearbeitete Abstammungen und zahlreiche konkrete
Auswahloptionen. Als redaktionelles Regelarchiv ist es umfangreich. Als Quelle
für einen deterministischen Character Builder ist es derzeit nicht
ausreichend formalisiert.

Die wichtigsten Ursachen sind:

1. Es existieren keine stabilen IDs, Schemas oder maschinenlesbaren Referenzen.
2. Die vollständige Charaktererschaffung und Backgrounds fehlen.
3. Kernformeln für Proficiency, Trefferpunkte, RK, Rettungswürfe und
   Zauberwerte sind unvollständig oder widersprüchlich.
4. PF2e-nahe Begriffe, eigene Hausregeln und D&D-5e-Mechaniken werden vermischt.
5. Klassen und Abstammungen referenzieren zahlreiche nicht vorhandene oder
   anders benannte Skills, Feats und Zauber.
6. Übersicht und Detaildatei sind mehrfach konkurrierende Wahrheitsquellen.

## Prüfbereich und Methode

Alle 64 Ausgangsdateien wurden vollständig gelesen. Für jeden Inhaltsbereich
wurden Detaildateien, Übersichten, TOCs und zentrale Regeln gegeneinander
geprüft. Entitätszahlen und Pfade stehen ausführlich in
`docs/review/00-baseline-inventory.md`.

Dieses Review ändert keine bestehende Regel. Kanonische Empfehlungen werden
erst in Phase 2 als versionierte Datenmodell- und Regelentscheidungen
umgesetzt.

## Inhaltsinventar

### Klassen

Bestand:

- 9 Klassen-Dateien
- 69 Klassenmerkmale
- 30 Unteroptionen von Klassenmerkmalen
- 99 Klassen-Feat-Zeilen
- 27 Archetypen

Wiederkehrende Felder:

- Name und Quelle
- Flavortext, Übersicht und Rolle
- ein oder zwei Schlüsselattribute
- Trefferpunkte
- Anfangsproficiencies
- Klassenmerkmale mit teilweise genannten Stufen
- Klassen-Feat-Tabelle
- Archetypen

Vollständigkeit:

- Redaktionell: hoch
- Mechanisch: mittel
- Builder-tauglich: niedrig

Fehlende Pflichtinformationen:

- eindeutiges Schlüsselattribut, wenn mehrere genannt werden
- vollständige Level-1-bis-20-Progression
- Proficiency-Steigerungen
- Klassen-SG-Formel
- Feat-Slot-Progression und Kennzeichnung, ob Tabellenzeilen automatisch
  gewährt oder wählbar sind
- Spellcasting-Progression für Magier, Okkultist und Schamane
- maschinenlesbare Auswahlfilter, Voraussetzungen und Effekte

Abweichende Schreibweisen:

- `Arkane Kunde`, `Magie`, `Okkultismus` und `Religion` konkurrieren als
  magische Skills.
- `Kriegskunst` und `Kriegsführung` werden wechselnd verwendet.
- `AC` und `RK`, `CHA-Mod` und `Charisma-Modifikator`, `WIS` und `WE` werden
  gemischt.

Tote oder nicht auflösbare Referenzen:

- Feats: `Power Attack`, `Point-Blank Shot`, `Shield Block`, `Sneak Attack`
- Zauber/Fähigkeiten unter anderem: `Alarm`, `Banish`, `Bless`,
  `Calm Emotions`, `Electric Arc`, `Entangle`, `Fear`, `Guidance`, `Gust`,
  `Healing Burst`, `Lay on Hands`, `Nature's Avatar`, `Prestidigitation`,
  `Resurrect`, `Speak with Dead`, `Speak with Spirits`, `Suggestion`,
  `Summon Entity`, `Summon Spirit`, `Tanglefoot`, `Water Walk`, `Wish`
- Englisch benannte Referenzen mit möglichem deutschen Gegenstück:
  `Daze`, `Detect Magic`, `Dispel Magic`, `Light`, `Message`,
  `Produce Flame`, `Shield`

### Abstammungen und Heritages

Bestand:

- 8 Abstammungen
- 8 angeborene Abstammungsmerkmale
- 40 Abstammungs-Feats
- 40 Heritages

Wiederkehrende Felder:

- Trefferpunkte, Größe, Bewegung
- Attributsverbesserungen und Attributsfehler
- Sprachen und Merkmale
- ein angeborenes Merkmal
- fünf Feats auf Stufe 1, 5, 9, 13 und 17
- fünf Heritages

Vollständigkeit:

- Redaktionell: hoch
- Mechanisch: mittel
- Builder-tauglich: mittel bis niedrig

Fehlende Pflichtinformationen:

- numerische Definition der Attributsverbesserungen
- Auswahlregel für die freie Verbesserung
- Sprachwahlfilter
- Level-/Feat-Slot-Regel für Abstammungs-Feats
- eindeutige Trait- und Sprach-IDs
- strukturierte Effekte für Resistenzen, Training und angeborene Zauber

Die acht Dateien sind untereinander strukturell konsistenter als die
Klassen-Dateien. Das Schema in `races/TOC.md` beschreibt jedoch andere
Abschnitte als die realen Dateien und nennt Heritages oder Abstammungs-Feats
nicht.

### Backgrounds

Bestand:

- 0 Background-Dateien
- freie Background-Faktoren in `rules/social_mechanics.md`
- mehrere Berufe, Kontakte, Herkunftsideen und Lebenspfad-Begriffe im Fließtext

Vollständigkeit: nicht implementiert.

Ein Builder kann daher derzeit keine Background-Auswahl anbieten und daraus
keine Attributs-, Skill-, Feat-, Vermögens- oder Kontaktentscheidung ableiten.

### Skills und Proficiency

`rules/core_mechanics.md` definiert 16 Skills mit zugeordnetem Attribut:

- Athletik, Akrobatik, Heimlichkeit, Fahrzeugführung
- Überzeugen, Einschüchtern, Diplomatie, Täuschen
- Wissenschaft, Technologie, Magie, Gesellschaft
- Wahrnehmung, Überleben, Medizin, Magie Erkennen

Zusätzlich verwendete, aber nicht in dieser Liste definierte Skills sind
mindestens:

- Arkane Kunde
- Darbietung
- Diebeskunst
- Handwerk
- Heilkunde
- Ingenieurwesen
- Kriegskunst/Kriegsführung
- Mechanik
- Naturkunde
- Okkultismus
- Religion

Die Ränge `Geübt` und `Experte` erscheinen in Klassen und Abstammungen. Eine
vollständige Rangfolge, Rangwerte und Progression fehlen. Wahrnehmung wird
zugleich als Skill und als eigener Anfangsproficiency-Wert behandelt.

### Allgemeine Feats

Bestand:

- 21 Feats in `feats/feats_overview.md`
- 11 davon mit Detaildatei
- 10 nur als Tabellenzeile

Die Detaildateien besitzen gut erkennbare Abschnitte für Voraussetzung,
Effekt, Synergien und Sonderfälle. Voraussetzungen und Effekte sind jedoch
freie Listen. Mehrere Sonderfälle behaupten zusätzliche Effekte, die im
eigentlichen Effektabschnitt fehlen.

Beispiel: `Verbesserte Wahrnehmung` definiert als Haupteffekt `+2
Wahrnehmung`, nennt unter Spezialfällen aber zusätzlich `-2 Heimlichkeit` für
Gegner. Unklar ist, ob dies eine weitere Regel oder nur eine Erklärung sein
soll.

### Zauber und Spellcasting

Bestand:

- 14 Zauber-Dateien
- vier tatsächlich verwendete Traditionen: Arcane, Divine, Occult, Primal
- nur drei im TOC erklärte Traditionen; Primal fehlt dort

Gemeinsame Felder:

- Tradition, Rang, Zeit, Reichweite, Ziel und Dauer
- Beschreibung und Haupteffekt
- höhere Ränge
- Setting-Sonderregeln

TOC und Detaildatei widersprechen sich bei mindestens sechs Zaubern:

| Zauber | TOC | Detaildatei |
|:--|:--|:--|
| Blitzschlag | Cantrip | Rang 1 |
| Gedankenlesen | Rang 1 | Rang 2 |
| Gedankenkontrolle | Rang 2 | Rang 4 |
| Nachricht | Rang 1 | Cantrip |
| Magie erkennen | Rang 1 | Cantrip |
| Teleportation | Rang 4 | Rang 5 |

Zusätzlich fehlen:

- Spellcasting-Progression
- Slots pro Rang und Level
- bekannte oder vorbereitete Zauber pro Klasse
- eindeutige Casting-Attribute
- Zauberangriffs- und Zauber-SG-Formel
- Listen-/Traditionszugang pro Klasse
- strukturierte Defense-, Schaden-, Heightening- und Flächenmodelle

### Waffen, Rüstungen und Ausrüstung

Bestand:

- 41 eindeutige Waffenkonzepte aus 54 Definitionsvorkommen
- 12 Rüstungen
- 28 sonstige Gegenstände

Wiederkehrende Felder:

- Name, Schaden oder Rüstungsschutz
- freie Eigenschaften
- Preis
- teilweise Reichweite und Gewicht

Fehlende Pflichtinformationen:

- Gegenstandsstufe
- Bulk
- Hände als eigenes Feld
- Waffengruppe und Proficiency-Kategorie
- Schadensart als geschlossener Wert
- Nachlade-, Kapazitäts- und Munitionsregeln
- RK-Bonus versus Schadensreduktion
- Seltenheit und Verfügbarkeit als strukturierte Felder
- auswertbare Boni und Aktivierungen

Duplikate:

- zwölf Basis-Nahkampfwaffen in zwei Dateien
- Speer zweimal in der Ausrüstungsübersicht
- Tarnkleidung als Rüstung und als Kleidung ohne Typabgrenzung im Namen

### Bestiary

Bestand:

- 34 eindeutige Kreaturenkonzepte
- 8 Detaildateien
- 28 Einträge in der Übersicht
- 17 Variationsabschnitte in Detaildateien

Die Detailstatblocks verwenden ausdrücklich ein D&D-5e-ähnliches Modell:

- Challenge Ratings wie `1/8`, `1/4` und `1/2`
- Attributswerte mit D&D-artigen Modifikatoren
- passive Wahrnehmung
- Bonusaktionen
- Mehrfachangriff
- Legendenaktionen
- Weisheits- und Konstitutionsrettungswürfe gegen feste SGs

Dies ist mit der behaupteten PF2e-nahen Systembasis nicht kompatibel. Das
Bestiary ist als Lore-/Designquelle wertvoll, benötigt aber vor einer
Regelintegration ein eigenes kanonisches Kreaturenschema und eine
Systemmigration.

### Regeln, Ressourcen und Setting-Systeme

`rules/core_mechanics.md` und `rules/social_mechanics.md` enthalten zahlreiche
verwendbare Regelideen, aber kaum vollständige ausführbare Definitionen.

Vorhanden:

- d20-Würfe und Erfolgsgrade
- sechs Attribute
- Skill-Liste
- Initiative und Kampfaktionsarten
- Trefferpunkte, Heilung und Rast
- Zauberränge und Traditionen
- Technologie- und soziale Themen
- Erfahrung und Level 1 bis 20
- soziale Stufe, Vermögen, Kontakte, Wohnorte und Einfluss

Unvollständig oder nur beschreibend:

- Hacking, Fahrzeuge, Cyberware, Magitech und Überwachung
- Zustände
- Ressourcenverbrauch
- Ruheregeln und genaue Heilformeln
- Aktionskosten
- Klassen-, Zauber- und Gegenstands-SGs
- Bonusarten und Stacking
- Charaktererschaffung

## Regelkonsistenz

### Attribute und Attributssteigerungen

Der Kerntext nennt Startwert 10, "Rassenboni +2 bis +4", Klassenbonus +1 und
Verbesserung +1 alle fünf Stufen. Abstammungen nennen dagegen nur Attribute,
keine Zahlen. Allgemeine Feats verwenden Voraussetzungen wie 13, 14 oder 15.
Eine Formel für Attributsmodifikatoren fehlt.

Kanonische Empfehlung:

- sechs Attribute mit Wert und daraus berechnetem Modifikator
- ein einheitliches Boost-/Flaw-Modell
- Boosts bei der Charaktererschaffung aus Abstammung, Background, Klasse und
  freien Entscheidungen
- Level-Boosts als explizite Choice-Progression
- Voraussetzungen dürfen Attributswerte prüfen, müssen aber auf demselben
  Wertebereich beruhen

### Skills und Skill-Proficiency

Die Skill-Liste und die tatsächlich verwendeten Namen stimmen nicht überein.
Der Glossareintrag `Fertigkeitsbonus = Stufenbonus + Attributmodifikator +
andere Boni` lässt Proficiency-Ränge aus.

Kanonische Empfehlung:

- geschlossene Skill-Liste mit Alias-Migration
- Wahrnehmung als eigener abgeleiteter Wert, nicht als normaler Skill
- Ränge `untrained`, `trained`, `expert`, `master`, `legendary`
- Bonusformel aus Level, Rangbonus, Attribut und typisierten Boni

### Wahrnehmung

Wahrnehmung ist gleichzeitig Skill, Klassenproficiency, Initiativequelle und
Ziel mehrerer Feats. Dadurch können Training und Boni nicht eindeutig
gestapelt werden.

Kanonische Empfehlung:

- eigener Proficiency-Wert mit Weisheitsmodifikator
- situative Wahrnehmungsboni bleiben Effekte
- Initiative kann Wahrnehmung oder einen explizit gewählten Skill verwenden

### Rettungswürfe

Klassen definieren Anfangsränge, aber keine Formel oder spätere Progression.
Bestiary-Einträge verwenden teilweise Attributsrettungswürfe statt der drei
Rettungswürfe Zähigkeit, Reflex und Willen.

Kanonische Empfehlung:

- drei geschlossene Saves mit eigener Proficiency
- klassenbasierte Level-Progression
- keine D&D-Attributssaves im kanonischen Modell

### Trefferpunkte

Vier Quellen konkurrieren:

- Kernregeln: Klassenwert plus Konstitutionsmodifikator, danach
  Konstitutionsmodifikator pro Stufe
- Klassen: fester Klassenwert plus Konstitutionsmodifikator
- Abstammungen: eigener TP-Wert
- Feat Zähigkeit: `+1 TP pro Stufe`, aber abweichende Beispiel-Formel

Kanonische Empfehlung:

`maxHp = ancestryHp + level * (classHpPerLevel + constitutionModifier) +
flatLevelBasedEffects`

Negative Ergebnisse pro Level dürfen den Klassenbeitrag nicht unkontrolliert
unter null senken. Das Zähigkeits-Feat addiert genau `level`.

### Rüstungsklasse

Keine vollständige RK-Formel existiert. Rüstung wird einerseits als RK-Bonus,
andererseits als Schadensreduktion beschrieben. Klassen- und Feat-Boni nennen
meist keinen Bonustyp.

Kanonische Empfehlung:

`RK = 10 + dexterityCapAdjustedModifier + armorProficiency + itemBonus +
stackingBonuses`

Allgemeine physische Resistenz bleibt ein separater Effekt und wird nicht aus
dem Rüstungsbonus abgeleitet.

### Klassen-SG, Zauber-SG und Zauberangriffe

Alle drei Bereiche sind undefiniert. Einzelne Texte verwenden feste SGs,
Attributswerte oder "deinen Zauber-SG" ohne Berechnungsgrundlage.

Kanonische Empfehlung:

- `DC = 10 + proficiency + keyAttributeModifier + typedBonuses`
- Klassen- und Spellcasting-Proficiency getrennt modellieren
- Angriffswert verwendet dieselben Bestandteile ohne Basis 10

### Waffen- und Rüstungsproficiency

Klassen nennen Freitextkategorien wie einfache, militärische oder
Handfeuerwaffen. Ausrüstungsdateien verwenden einfache, kriegerische,
zweihändige, Projektil- und traditionelle Kategorien. Die Mengen sind nicht
aufeinander abbildbar.

Kanonische Empfehlung:

- geschlossene Kategorien und Gruppen
- jede Waffe referenziert Kategorie und Gruppe
- jede Klasse erhält Proficiency-Effekte auf diese IDs
- "zweihändig" ist ein Trait/Hände-Wert, keine Proficiency-Kategorie

### Aktionsökonomie

Das Repository enthält gleichzeitig:

- Standard-, Bewegungs- und Reaktionsaktionen
- Zauber mit ein oder zwei Aktionen
- Klassenfähigkeiten mit drei Aktionen
- freie Aktionen
- Bonusaktionen und Legendenaktionen im Bestiary
- Mehrfachangriffe als zusammengesetzte D&D-Aktion

Kanonische Empfehlung:

- PF2e-nahe drei Aktionen pro Zug plus eine Reaktion
- freie Aktionen und Exploration-/Downtime-Aktivitäten explizit
- keine Bonusaktionen oder Legendenaktionen
- jede ausführbare Fähigkeit erhält eine maschinenlesbare Aktionsart

### Levelprogression und Feat-Vergabe

Klassenmerkmale erscheinen auf 1, 3, 7, 11, 15 und 20. Klassen-Feat-Tabellen
enthalten je eine Zeile auf 1, 2 und danach jeder geraden Stufe. Es ist nicht
definiert, ob alle Tabellenzeilen automatisch gewährt oder aus einer Liste
gewählt werden. Allgemeine Feats besitzen nur Mindestlevel.

Kanonische Empfehlung:

- Klassenmerkmale automatisch auf definierten Levels
- separate Choice-Progression für Klassen-, Skill-, allgemeine und
  Abstammungs-Feats
- vorhandene Tabellenzeilen als Optionen, nicht automatisch alle gewähren
- fehlende Alternativen werden als Content-Lücke sichtbar gehalten

### Voraussetzungen

Allgemeine Feats besitzen einfache Level-/Attributsvoraussetzungen.
Abstammungs-Feats nennen nur auf Stufe 1 explizit die Abstammung; spätere
Voraussetzungen sind implizit. Klassen-Feats besitzen keine explizite
Klassenbindung außer ihrem Dateikontext.

Kanonische Empfehlung:

- alle impliziten Containerbedingungen bei der Migration explizit machen
- deklarativer Ausdrucksbaum für Level, Attribute, Proficiency, Klasse,
  Abstammung, Traits, Feats, Features, Zauber und Ressourcen

### Prepared und Spontaneous Spellcasting

Der Magier bereitet `Stufe + INT-Modifikator` Zauber vor und kann später einen
"bekannten" Zauber spontan höher wirken. Okkultist und Schamane besitzen keine
vollständige Zauberzugangsregel.

Kanonische Empfehlung:

- Magier: vorbereitet aus Zauberbuch
- Okkultist: spontan mit Repertoire
- Schamane: spontan oder vorbereitet als bewusste kanonische Entscheidung;
  empfohlen ist spontan mit pfadgebundenen Granted Spells
- Slots und Spell-Rank-Zugang als separate Progressionsentitäten

### Ausrüstung, Bulk, Preis und Traits

Preise sind vorhanden, aber Startgeld und Verfügbarkeit führen teilweise dazu,
dass grundlegende moderne Waffen für niedrige soziale Stufen praktisch nicht
erreichbar sind. Bulk fehlt vollständig. Traits sind freie Begriffe und
enthalten teils pauschale numerische Boni.

Kanonische Empfehlung:

- Preis zunächst erhalten, Balancewarnung dokumentieren
- Bulk, Level, Seltenheit, Hände, Kapazität und Munition ergänzen
- Traits schließen und ihre Regeln zentral definieren
- numerische Boni als Effects statt im Trait-Namen oder Fließtext

### Cyberpunk-spezifische Mechaniken

Technologie, Hacking, Fahrzeuge, Überwachung, Cyberware und Implantate sind
thematisch präsent. Mechanisch existieren fast nur Skillnamen, Gegenstände und
freie Boni. Ein Hacking- oder Fahrzeugsubsystem ist nicht definiert.

Kanonische Empfehlung:

- für den ersten Builder-Katalog vorhandene Technologie als Equipment und
  Traits migrieren
- Cyberware als eigener Gegenstandstyp mit Slots/Belastung vorbereiten
- Hacking und Fahrzeuge als offen dokumentierte Regelmodule führen, bis
  ausführbare Regeln vorhanden sind
- keine erfundenen Vollsysteme als angeblich vorhandenen Content ausgeben

## PF2e-nahe Systemlogik

### Übernommene Grundideen

- d20 gegen SG
- vier Erfolgsgrade als Zielbild
- Level 1 bis 20
- sechs Attribute
- Proficiency-Begriffe wie geübt und Experte
- drei Rettungswürfe
- Abstammungen, Heritages, Klassen, Feats und Zauberränge
- Aktionen und Reaktionen
- Traits und typisierte Bonusidee in einzelnen Texten

### Bewusste oder settingbedingte Abweichungen

- moderne Waffen, Konzerne, soziale Stufe und Netzwerke
- Technologie-, Wissenschafts- und Fahrzeugskills
- Geflecht-Interferenz und Magieregulierung
- Berufe, Cyberware und technomagische Gegenstände
- Gold-basierte moderne Ökonomie

Diese Abweichungen sind grundsätzlich tragfähig, benötigen aber formale
Regeldefinitionen.

### Wahrscheinlich unbeabsichtigte Abweichungen

- Erfolg angeblich bei einem natürlichen Würfelergebnis von 10+, unabhängig
  vom SG
- natürliche 20 bzw. 1 als pauschal automatischer Erfolg/Fehlschlag
- fehlende Proficiency-Rangkomponente
- Rüstung als Schadensreduktion und RK-Bonus zugleich
- D&D-5e-Bestiarymechaniken
- Bonusaktionen, passive Wahrnehmung und Challenge Ratings
- direkte Attributssaves statt Zähigkeit/Reflex/Willen
- Trefferpunkte und Zähigkeits-Feat-Formel

### Nur beschriebene, nicht formale Regeln

- nahezu alle Klassenmerkmale und Feats
- Zauber-Heightening und Flächen
- soziale Konflikte
- Kontakte und Gefälligkeiten
- Hacking, Fahrzeuge und Cyberware
- Bedingungen und Resistenztypen
- Crafting, Reparatur und Gerätehaltbarkeit

### Progressions- und Balance-Risiken

- pauschale `+1`- und `+2`-Boni ohne Typ können unbegrenzt stapeln
- mehrere permanente physische Resistenzen können Schaden stark entwerten
- wiederholte "bei 0 TP auf 1 TP bleiben"-Effekte besitzen keine gemeinsame
  Cooldown-/Stacking-Regel
- automatische Erfolge und kritische Erfolge umgehen die Erfolgsgradlogik
- feste SGs skalieren nicht mit Level
- Zauber-Slots und Zugang zu hohen Rängen fehlen
- manche Level-20-Effekte sind rein narrativ, andere mathematisch extrem stark

## Priorisierte Befunde

Statuswerte:

- `open`: noch nicht umgesetzt
- `accepted`: kanonische Richtung für die Migration festgelegt
- `deferred`: bewusst außerhalb des ersten Builder-Umfangs

| ID | Schwere | Betroffene Dateien | Beschreibung und Auswirkung | Empfohlene Lösung | Status |
|:--|:--|:--|:--|:--|:--|
| REV-B001 | BLOCKER | alle Contentdateien | Keine IDs, Schemas oder strukturierten Referenzen; ein Compiler kann Entitäten nicht zuverlässig unterscheiden oder verknüpfen. | Versioniertes Frontmatter-Schema und stabile sprachunabhängige IDs einführen. | accepted |
| REV-B002 | BLOCKER | `rules/`, `regelwerk_outline.md` | Backgrounds und vollständige Charaktererschaffung fehlen; ein valider Charakter kann nicht vollständig gebaut werden. | Kanonische Backgrounds und Character-Creation-Progression ergänzen, Annahmen dokumentieren. | accepted |
| REV-B003 | BLOCKER | Klassen, Abstammungen, Feats | Choices, Voraussetzungen und Effekte liegen fast vollständig als Text vor; Verfügbarkeit und Neuberechnung sind nicht ausführbar. | Typisierte Choice-, Predicate- und Effect-Modelle einführen. | accepted |
| REV-C001 | CRITICAL | `rules/core_mechanics.md`, `bestiary/`, Klassen, Zauber | PF2e-nahe Aktionen, D&D-Bonusaktionen, Mehrfachangriffe und Legendenaktionen widersprechen sich. Kampfoptionen können nicht in einer Engine ausgewertet werden. | Drei-Aktionen-Modell plus Reaktion kanonisieren; Bestiary separat migrieren. | accepted |
| REV-C002 | CRITICAL | `rules/core_mechanics.md`, Klassen, Abstammungen, `feat_zaehigkeit.md` | Vier widersprüchliche TP-Quellen; Zähigkeitsbeispiel erzeugt quadratische Zusatz-TP. | Einheitliche HP-Formel verwenden; Zähigkeit addiert exakt Charakterlevel. | accepted |
| REV-C003 | CRITICAL | `spells/TOC.md`, sechs Zauberdateien | Zauberränge widersprechen sich; Zugang und Heightening wären nicht deterministisch. | Detaildatei als bewahrte Primärquelle nutzen, Konflikte pro Zauber in Migration dokumentieren und kanonisch entscheiden. | open |
| REV-C004 | CRITICAL | `klasse_magier.md`, `klasse_okkultist.md`, `klasse_schamane.md` | Keine vollständige Spellcasting-Progression, Slots oder Zugriffslisten. | Eigene `spellcasting-progression`-Entitäten für alle drei Klassen anlegen. | accepted |
| REV-C005 | CRITICAL | Klassen, Abstammungen | Mehr als zwanzig Zauber-/Feat-Referenzen besitzen keine Datei oder verwenden einen anderen Namen. | Aliase migrieren, echte fehlende Inhalte als unresolved migration issues erfassen; Compiler muss tote Referenzen ablehnen. | accepted |
| REV-C006 | CRITICAL | `rules/core_mechanics.md`, alle Klassen | Proficiency-Formeln und Levelprogression fehlen; fast alle Kernwerte sind unberechenbar. | Geschlossenes Rangmodell und Progressionseffekte definieren. | accepted |
| REV-C007 | CRITICAL | `rules/social_mechanics.md` | Beispiel Mira ergibt rechnerisch 5, dokumentiert ist 4; Bereiche erfordern freie Entscheidungen ohne Choice-Regel. | Formel testen, Beispiel korrigieren und alle Bereichswerte als Auswahl modellieren. | open |
| REV-C008 | CRITICAL | `bestiary/` | Bestiary ist regeltechnisch D&D 5e und nicht mit dem Spielerregelmodell kompatibel. | Kreaturen als eigener Migrationstrack; Originalwerte erhalten, kanonische PF2e-nahe Werte erst nach Balanceentscheidung. | deferred |
| REV-M001 | MAJOR | Kernregeln, Abstammungen, Feats | Attributsboni, Modifierformel und Levelsteigerungen sind unvollständig bzw. widersprüchlich. | Einheitliches Boost-/Flaw-Modell und Modifierformel definieren. | accepted |
| REV-M002 | MAJOR | Kernregeln, Klassen, Abstammungen | Mindestens elf nicht definierte Skillnamen und mehrere Synonyme. | Skill-Katalog mit Alias-Tabelle erstellen; unbekannte Namen als Compilerfehler. | accepted |
| REV-M003 | MAJOR | Kernregeln, Ausrüstung, Klassen | Rüstung reduziert Schaden und erhöht zugleich RK; keine RK-Formel. | Item-Bonus und Resistenz trennen, RK-Formel kanonisieren. | accepted |
| REV-M004 | MAJOR | Klassen, Abstammungen, Feats | Feat-Vergabe ist nicht definiert; Tabellen können als automatische Vergabe missverstanden werden. | Levelbasierte Choice-Slots getrennt nach Feat-Art definieren. | accepted |
| REV-M005 | MAJOR | alle Regeln | Boni besitzen meist keinen Typ; Stacking und Überschreibungen sind unbestimmt. | Bonusarten `status`, `circumstance`, `item`, `untyped` mit Stacking-Regeln einführen. | accepted |
| REV-M006 | MAJOR | `gear/` | Bulk, Level, Munition, Kapazität, Hände und konsistente Kategorien fehlen. | Gegenstandsschemas vervollständigen; unklare Werte als dokumentierte Migrationwarnung behandeln. | open |
| REV-M007 | MAJOR | Kernregeln, Ausrüstung, Outline | Hacking, Fahrzeuge und Cyberware werden als implementiert suggeriert, besitzen aber kein ausführbares Subsystem. | Im ersten Katalog als unvollständige Module markieren; keine stillen Regelannahmen. | accepted |
| REV-M008 | MAJOR | Ausrüstung, Bestiary | Übersicht und Detaildatei definieren dieselben Entitäten mehrfach. | Migrationsmanifest mit einer kanonischen Ziel-ID und allen Ursprungspfaden. | accepted |
| REV-M009 | MAJOR | Klassen, Zauber, Bestiary | Conditions wie Furcht, gelähmt, verwirrt, Blutung oder Erschöpfung sind nicht zentral definiert. | Condition-Entitäten mit Stufen, Dauer und maschinenlesbaren Effekten erstellen. | open |
| REV-M010 | MAJOR | `spells/`, Zauberklassen | Prepared/spontaneous, bekannte Zauber und Zauberbuchregeln widersprechen bzw. fehlen. | Casting-Mode pro Progression explizit festlegen. | accepted |
| REV-M011 | MAJOR | `rules/core_mechanics.md` | Erfolgsregel "Erfolg bei 10+ auf dem Würfel" widerspricht d20 gegen SG; natürliche 20/1 sind ungenau. | SG-Vergleich mit vier Graden und einstufiger Verschiebung durch natürliche 20/1 kanonisieren. | accepted |
| REV-M012 | MAJOR | `rules/social_mechanics.md` | Einfluss addiert offenbar vollen Charismawert, Skill und soziale Stufe; Wertebereich und Probe fehlen. | Charisma-Modifikator und Gesellschaftsbonus verwenden; Einfluss als abgeleiteten Wert spezifizieren. | open |
| REV-M013 | MAJOR | Klassen | `Fertigkeiten pro Stufe` suggeriert jährliche/levelweise Skillvergabe und erzeugt extreme Mengen. | Als Anzahl zusätzlich trainierter Skills auf Stufe 1 kanonisieren, sofern keine andere Progression beschlossen wird. | accepted |
| REV-M014 | MAJOR | Zauber | Flächen, Defense und Erfolgsgrade stehen in Fließtext; Feuerball ist Einzelziel mit Fläche nur bei kritischem Erfolg. | Spell-Schema mit Target/Area/Defense/Outcomes; ungewöhnliche Originalregel ausdrücklich erhalten oder migrieren. | open |
| REV-N001 | MINOR | TOCs, Detaildateien | Deutsch/Englisch und Singular/Plural wechseln; Referenzen sind dadurch fragil. | Anzeigenamen beibehalten, stabile englische IDs und Aliaslisten verwenden. | accepted |
| REV-N002 | MINOR | `races/TOC.md` | Dokumentiertes Rassen-Schema entspricht nicht den tatsächlichen Dateien. | Authoring-Dokumentation aus dem formalen Schema generieren/aktualisieren. | open |
| REV-N003 | MINOR | alle Dateien | Quelle ist überall derselbe freie Text; Status und Provenienz fehlen. | `source` als ID, `status` als Enum und optionale Legacy-Pfade ergänzen. | accepted |
| REV-N004 | MINOR | Ausrüstung, soziale Regeln | Preise, Startgeld und Unterhalt sind nicht gegeneinander balanciert. | Werte zunächst migrieren, anschließend datenbasierten Economy-Report erzeugen. | deferred |
| REV-E001 | EDITORIAL | `races/mensch_zeitalter_des_goldes.md` | "Fertigkeits-Fehlerpunkt" ist sehr wahrscheinlich ein Tippfehler für Feat-Punkt. | Original im Migrationsbericht bewahren, kanonisch als Choice für einen Feat behandeln. | open |
| REV-E002 | EDITORIAL | README, Outline | Mehrere Bereiche werden als vollständig implementiert bezeichnet, obwohl formale Regeln fehlen. | Status nach Abschluss der Migration anhand automatischer Coverage berichten. | open |
| REV-E003 | EDITORIAL | Timeline und mehrere Dateien | Rechtschreibung und Terminologie variieren; dies erschwert Suche, nicht aber die Regelmigration. | Redaktionelle Korrekturen getrennt und nach der strukturellen Migration durchführen. | deferred |

## Kanonische Entscheidungen für Phase 2

Die folgenden Richtungen gelten als angenommen, weil sie für einen
deterministischen Builder notwendig und mit dem erklärten Projektziel
vereinbar sind:

- PF2e-nahe drei Aktionen plus Reaktion
- vier Erfolgsgrade über Vergleich mit einem SG
- Wahrnehmung als eigener Proficiency-Wert
- drei Rettungswürfe
- fünf Proficiency-Ränge
- typisierte Boni und definierte Stacking-Regeln
- Abstammungs-TP plus klassenbasierte TP pro Level
- vorbereiteter Magier, spontaner Okkultist
- bestehende Texte bleiben Legacy-/Lore-Quelle
- Konflikte und Annahmen werden im Migrationsreport statt durch stille
  Textänderungen dokumentiert
- Bestiary wird inventarisiert und schemafähig gemacht, aber eine vollständige
  Kampfbalancierung ist vom Character-Builder-Kern entkoppelt

Noch offen bleiben:

- kanonischer Rang der sechs widersprüchlichen Zauber
- Casting-Mode des Schamanen
- endgültige Skill-Alias-Zuordnung
- genaue Background-Liste
- vollständige Feat-Slot-Progression
- Economy- und Bestiary-Balance

