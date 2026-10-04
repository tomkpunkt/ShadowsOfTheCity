# Inhalts- und Stufenabdeckungs-Audit

Stand: Katalog `5c5f15d1…` (911 Entitäten, Version 0.1.2 auf `main`).
Grundlage sind der generierte Katalog, die Rules Engine und ein Testlauf mit
der Engine (Söldner, Stufe 1 und 20). Alle Zahlen wurden aus dem Katalog
ausgelesen; Punkte, die nur aus dem Code oder den Daten abgeleitet sind, sind
als „abgeleitet“ markiert.

## 1. Gesamtbild

| Bereich | Bestand | Von der Engine berechnet |
|:--|:--|:--|
| Klassenmerkmale | 99 | 9 mit strukturiertem Effekt, Rest Text |
| Klassentalente | 99 (11 je Klasse) | 2 |
| Abstammungstalente | 48 | 0 |
| Herkunft (Heritage) | 40 | 4 |
| Zauber | 14 | 0 (alle Text) |
| Ausrüstung (equipment) | 164 | 0 |
| Waffen / Rüstungen | 64 / 26 | Werte ja, Sondereffekte nein |
| Kreaturen | 34 | keine Engine-Abdeckung |

410 von 911 Entitäten tragen mindestens einen Text-Effekt, den die Engine
ignoriert. 165 davon nennen einen Zahlenbonus (`+N`), 147 eine Aktion,
Reaktion oder Nutzungsgrenze. Die Inhalte sind also vorhanden, aber
überwiegend Beschreibung, nicht Regel.

## 2. Kritische Fehler in den Daten

1. **Alle Fernkampfwaffen sind für jede Klasse ungeübt.** *(behoben: neue Kompetenz `proficiency.weapon.ranged`, alle Klassen starten geübt, Regressionstest ergänzt)*
   - Die 20 Fernkampfwaffen (Pistole, Gewehr, Schrotflinte, …) haben die
     Kategorie `trait.item.weapon.ranged`. Die Engine leitet daraus
     `proficiency.weapon.ranged` ab. Diese Kompetenz existiert nicht; es gibt
     nur `simple`, `martial`, `firearm` und `unarmed`.
   - Geprüft: Ein Söldner mit Pistole hat auf Stufe 1 und auf Stufe 20 den
     Angriffsbonus +0 („Waffen-Proficiency (untrained)“). Ein Nahkampfwaffen-
     Söldner hat +3 bzw. +22.
   - `martial` und `firearm` werden von keiner Waffe und keiner Klasse genutzt.
   - Lösung: Kategorien und Kompetenz-IDs zusammenführen (entweder Waffen auf
     `firearm`/`martial` umstellen oder `proficiency.weapon.ranged` anlegen)
     und die Engine per Test absichern, dass jede Waffenkategorie eine
     vorhandene Kompetenz hat.
2. **Alle Klassen starten mit identischen Kompetenzen.** *(behoben: Startkompetenzen folgen den Klassentabellen im Altbestand, Regressionstest ergänzt)* Ursprünglich: Einfache Waffen,
   unbewaffnet, leichte Rüstung, alle Rettungswürfe und Wahrnehmung „trained“,
   keine Fertigkeiten. Söldner und Wächter haben keinen Vorteil gegenüber dem
   Magier. Mittlere und schwere Rüstungen kann keine Klasse tragen, ohne
   ungeübt zu sein.
3. **Schadensarten sind auf Stich und Wucht reduziert.** Alle 64 Waffen
   verursachen Stich- oder Wuchtschaden, auch Schwerter, Klingen und
   Schusswaffen; es gibt keinen Hieb-, Feuer- oder Elektroschaden. Ohne
   Resistenzen im System hat das nur kosmetische Folgen, verhindert aber
   spätere Regeln.
4. **Kein einziges Cyberware-Objekt.** Das Schema und die Engine kennen
   `cyberware`, der Katalog enthält aber keins. Für eine Cyberpunk-Adaption
   fehlt damit ein Kernthema (Augmentierungen, Essenz/Humanitätskosten).

## 3. Abdeckung pro Stufe (1 bis 20)

Legende: **B** berechnet, **A** Auswahl vorhanden (Wirkung Text), **T** nur
Beschreibung, **–** fehlt vollständig.

| Stufe | Vorgesehen (PF2e-Vorbild) | Status im Projekt |
|:--|:--|:--|
| 1 | Abstammung, Herkunft, Hintergrund, Klasse, Attribute, Startfertigkeiten, Abstammungs-, Klassen-, Allgemeintalent | Abstammung, Herkunft, Hintergrund, Klasse **B**; 4 Fertigkeiten **B**; Talente **A**; freie Attribute **B** |
| 2 | Klassentalent, Fertigkeitstalent | Klassentalent **A**; Fertigkeitstalent **–** |
| 3 | Allgemeintalent, Fertigkeitssteigerung, Klassenmerkmal | Klassenmerkmal **T**; Allgemeintalent **–**; Fertigkeitssteigerung **–** |
| 4 | Klassentalent, Fertigkeitstalent | Klassentalent **A**; Fertigkeitstalent **–** |
| 5 | Attributsverbesserungen, Abstammungstalent, Fertigkeitssteigerung | Abstammungstalent **A**; Attribute **–**; Fertigkeitssteigerung **–** |
| 6 | Klassentalent, Fertigkeitstalent | Klassentalent **A** |
| 7 | Allgemeintalent, Klassenmerkmal, Rang-Erhöhungen | Klassenmerkmal **T**; Zauber-Kompetenz Expert **B**; sonst **–** |
| 8 | Klassentalent | **A** |
| 9 | Abstammungstalent, Fertigkeitssteigerung | Abstammungstalent **A**; Zauberplätze Rang 5 **B**; Rest **–** |
| 10 | Attribute, Klassentalent | Klassentalent **A**; Attribute **–** |
| 11 | Allgemeintalent, Klassenmerkmal | Klassenmerkmal **T** (Söldner teilweise **B**) |
| 12 | Klassentalent | **A** |
| 13 | Abstammungstalent | **A** |
| 14 | Klassentalent | **A** |
| 15 | Attribute, Allgemeintalent, Klassenmerkmal, Rang-Erhöhungen | Klassenmerkmal **T**; Zauber-Kompetenz Master **B**; Attribute **–** |
| 16 | Klassentalent | **A** |
| 17 | Abstammungstalent | **A** |
| 18 | Klassentalent | **A** |
| 19 | Allgemeintalent, Zauber-Kompetenz Legendary | Zauber-Kompetenz **B**; Allgemeintalent **–** |
| 20 | Attribute, Klassentalent, Klassenmerkmal | Klassentalent **A**, Klassenmerkmal **T**; Attribute **–** |

Der Katalog liefert nur auf den Stufen 1, 3, 7, 11, 15 und 20 Klassenmerkmale
(je Klasse 8 bis 12 Merkmale).
Die Stufen 2, 4 bis 6, 8 bis 10, 12 bis 14, 16 bis 19 haben nur das
Klassentalent.

### Charaktereinstellungen, die der Code nicht abdeckt

Diese Entscheidungen gehören zu einer Stufe, haben aber weder eine Auswahl
noch eine Berechnung:

- **Attributsverbesserungen auf 5, 10, 15, 20.** *(behoben: `levelBoosts` im Charakter, Auswahl im Builder, Berechnung in der Engine)* Ursprünglich: Kein Feld im Charakter,
  kein Effekt. Ein Charakter von Stufe 20 hat dieselben Attribute wie auf
  Stufe 1.
- **Kompetenzsteigerungen.** *(teilweise behoben: `proficiencyIncreases` je Klasse für Waffen, Rüstung, Wahrnehmung, Rettungswürfe und Klassen-SG; Fertigkeitssteigerungen fehlen weiter)* Ursprünglich: Im gesamten Katalog gibt es nur 22
  `proficiency-rule`-Effekte und ausschließlich „trained“ (2 mal
  „increase“ beim Agenten). Es gibt keine Quelle für Expert, Master oder
  Legendary bei Fertigkeiten, Rettungswürfen, Wahrnehmung, Waffen, Rüstung
  oder Klassen-SG. Die einzige Ausnahme ist die Zauber-Kompetenz (7/15/19).
- **Fertigkeitssteigerungen und Fertigkeitstalente.** *(Fertigkeitssteigerungen behoben: `skillIncreases` ab Stufe 3 alle zwei Stufen, Auswahl im Builder; Fertigkeitstalente fehlen weiter)* Ursprünglich: Keine
  Auswahl, obwohl 4 Fertigkeitstalente im Katalog stehen.
- **Allgemeintalente ab Stufe 3.** *(behoben: Auswahlen auf Stufe 3, 7, 11, 15, 19; Fertigkeitstalente auf geraden Stufen, optional wegen nur 4 Talenten im Katalog)* Ursprünglich: Nur `choice.general-feat.1` existiert;
  die 10 Allgemeintalente sind auf Stufe 1 (eins auf Stufe 2) beschränkt.
- **Zusatzsprachen durch Intelligenz.** `additionalLanguagesFromIntelligence`
  ist an jeder Abstammung gesetzt, wird aber nirgends ausgewertet
  (abgeleitet: kein Treffer in Engine oder UI).
- **Zauberauswahl.** *(teilweise behoben: Rang und Anzahl hängen jetzt von Stufe und Plätzen ab; Zaubertricks bleiben Teil derselben Auswahl, Vorbereitung und Repertoire-Wechsel beim Aufstieg fehlen weiter)* Ursprünglich: Eine Auswahl auf Stufe 1 mit 0 bis 10 Zaubern, unabhängig
  von Zauberplätzen, Zauberrang und Stufe. Spontane und vorbereitete Zauber
  sowie Zaubertricks (Rang 0) sind nicht getrennt; Repertoire-Erweiterung beim
  Aufstieg fehlt.
- **Zauberplätze ab Stufe 10.** *(behoben: Tabelle für Stufe 1 bis 20, Ränge 1 bis 10)* Ursprünglich: Die Tabelle endet bei Stufe 9 (5 Ränge), höhere
  Stufen erben diese Zeile.
- **Ausrüstungsbudget.** Preise werden angezeigt, es gibt aber kein Startgeld,
  keine Vermögensgrenze nach Stufe und keine Kaufabrechnung
  (abgeleitet: `priceGp` wird nur in der Detailansicht genutzt).
- **Mehrfachauswahl desselben Talents.** Jeder Talent-Slot ist eine eigene
  Auswahl; die Engine erzwingt keine Eindeutigkeit über Slots hinweg
  (abgeleitet). Da es pro Klassen-Stufe nur ein Talent gibt, ist die Auswahl
  ohnehin nahezu vorgegeben.

## 4. Struktur- und Inhaltsschwächen

### Talente
- Pro Klasse gibt es exakt 11 Klassentalente, eines pro Slot (1, 2, 4, …, 20).
  Auf Stufe 1 ist die „Auswahl“ ein einziges Talent, auf Stufe 2 zwei Talente
  (das der Stufe 1 zählt mit). Es gibt keinen Build-Spielraum.
- 38 Talente sind nur im Kompendium lesbar und in keiner Auswahl erreichbar:
  27 Archetyp-, 7 Berufs- und 4 Fertigkeitstalente
  (`builder-reachability`: Status „informational“).
- Keine Voraussetzungsketten (`hasFeat`) und keine Mehrfachvoraussetzungen
  bei Klassentalenten; es gibt keinen Talent-Baum.
- 2 von 99 Klassentalenten und 0 von 48 Abstammungstalenten sind
  strukturiert.

### Klassen
- Schlüsselattribute: Söldner, Wächter, Raufbold, Mediziner haben je zwei,
  Agent drei. Der Klassen-SG nutzt jetzt das beste; eine echte Wahl im Builder
  fehlt.
- Kein Klassenmerkmal verändert Rüstungs-, Waffen- oder Rettungswurfränge,
  weshalb Klassen sich nur über Text unterscheiden.
- Der Raufbold hat nur 8 Merkmale und das Merkmal „Zähigkeit“ trägt denselben
  Namen wie das gesperrte Allgemeintalent (`feat.general.zahigkeit`, Beispiel
  im Text rechnet +25 statt +5 TP).

### Fertigkeiten und Hintergründe
- Fertigkeitsliste mit Überschneidungen: `persuasion` und `diplomacy`,
  `magic`, `arcana` und `detect-magic`, `technology` und `mechanics`. Ohne
  Regelentscheidung, welche Fertigkeit für welche Probe gilt, sind mehrere
  Einträge doppelt belegt.
- Alle Klassen wählen genau 4 Fertigkeiten; ein Intelligenz-Bonus fehlt.
- Jeder Hintergrund gibt genau eine Fertigkeit, kein Hintergrundtalent
  (`grantedFeatIds` leer) und keine Auswahl.
- Kompetenzliste ohne `proficiency.spell.divine`, obwohl 5 Zauber die
  Tradition `divine` tragen (sie sind nur über Mehrfachtraditionen erreichbar).

### Zauber
- 14 Zauber für vier Traditionen: arkan 12, okkult 9, ursprünglich 7,
  göttlich 5. Primal erreicht höchstens Rang 3, obwohl Schamanen bis Rang 5
  Plätze erhalten. Es gibt keine Auswahl für Ränge 1 bis 4 mit mehr als 1 bis
  2 Zaubern je Rang.
- Alle 14 Zauber sind Text-Effekte (kein Schaden, Rettungswurf oder Dauer
  strukturiert).

### Ausrüstung
- 164 Ausrüstungsgegenstände, davon 68 Crafting-Materialien und 21
  Ritualwerkzeuge; kein Gegenstand hat einen strukturierten Effekt.
- Gegenstandsstufen: 80 auf Stufe 0, 5 auf Stufe 7, 3 auf jeder Stufe 8 bis
  10, nichts darüber. Charaktere ab Stufe 11 finden keine passende Ausrüstung.
- Alle Waffen haben Stich- oder Wuchtschaden; nur 11 Waffen haben mehr als ein
  Merkmal, `reload` ist nirgends gesetzt.
- Doppelte Namen: `armor.tarnkleidung` und `equipment.tarnkleidung`.
- 11 Waffen und 1 Ausrüstungsgegenstand sind gesperrte Entwürfe
  (`weapon.1-waffe` … `weapon.seelenfanger`, `equipment.artefakt`), weil die
  Quelle Modifikationen statt Waffen beschreibt.
- Rüstungswerte: siehe Review-Punkt 5 (leichte Rüstungen mit +6 und Grenze 0,
  identische Duplikate `magische-rustung`/`moderne-rustung`), dazu fehlen
  Stärkeanforderung, Rüstungsmalus und Tempoabzug im Schema.

### Kreaturen
- 34 Kreaturen mit Stufen 0 bis 4 (15 auf Stufe 0). Spieler reichen bis Stufe
  20, es gibt also keine Gegner ab Stufe 5.
- Kreaturen haben nur TP, RK und Tempo, keine Rettungswürfe, Angriffe oder
  Wahrnehmung.
- TP wirken zu hoch gegen Spielerwerte: Stufe-1-Kreaturen haben 30 bis 55 TP,
  ein Spieler auf Stufe 1 hat etwa 19 TP. Das ist eine Balancing-Frage.

### Redaktion und Dateiqualität
- 627 von 911 Entitäten haben Status `legacy`; nur 174 sind `canonical`.
- 234 Regeltexte enthalten noch echte Wagenrückläufe (`\r`) aus der
  Migration.
- Laut Editorial-Report sind 287 Zusammenfassungen einander sehr ähnlich und
  422 kürzer als 80 Zeichen; 69 Einträge sind für die manuelle Prüfung
  markiert.
- Der Katalog enthält 13 gesperrte Entwürfe (`needs-rules-decision`).

## 5. Empfohlene Reihenfolge

1. **Daten-Fehler beheben:** Waffenkategorien und Kompetenz-IDs bereinigen,
   Test dafür ergänzen (Abschnitt 2, Punkt 1). Danach Klassenstartwerte
   differenzieren (Punkt 2).
2. **Progressionsmodell entscheiden und bauen:** ein Schema für Kompetenzränge
   pro Klasse und Stufe (Rettungswürfe, Wahrnehmung, Waffen, Rüstung,
   Klassen-SG), Attributsverbesserungen auf 5/10/15/20, Fertigkeitssteigerungen
   und Allgemein- sowie Fertigkeitstalente. Das schließt den größten Teil der
   Lücken in Abschnitt 3 und ersetzt hunderte Textregeln.
3. **Zauber:** Zaubertabelle bis Stufe 20 (Ränge 6 bis 10 oder bewusste
   Obergrenze), Repertoire- und Vorbereitungsregeln, Zaubertricks getrennt,
   Katalog auf mindestens 3 bis 5 Zauber je Rang und Tradition erweitern.
4. **Inhalte:** Cyberware-Katalog, Gegenstände und Kreaturen für Stufen 11 bis
   20, Schadensarten, Waffenmerkmale, Rüstungswerte und Rüstungsmalus.
5. **Klassentalente:** pro Slot mehrere Talente anbieten, sonst bleibt die
   Auswahl ohne Wirkung; danach die Textregeln der meistgenutzten Talente
   strukturieren.
6. **Bereinigung:** Fertigkeitsdopplungen entscheiden, `\r` entfernen,
   Namens- und Duplikatprobleme lösen.

Die Punkte 1 (Waffenkategorie) und 6 sind ohne Regelentscheidung möglich.
Die Punkte 2 bis 5 verlangen Vorgaben zu Balancing und Regelumfang.
