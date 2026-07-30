---
choiceIds:
  - choice.mediziner.fachrichtung
  - choice.class-feat.mediziner.1
  - choice.class-feat.mediziner.2
  - choice.class-feat.mediziner.4
  - choice.class-feat.mediziner.6
  - choice.class-feat.mediziner.8
  - choice.class-feat.mediziner.10
  - choice.class-feat.mediziner.12
  - choice.class-feat.mediziner.14
  - choice.class-feat.mediziner.16
  - choice.class-feat.mediziner.18
  - choice.class-feat.mediziner.20
  - choice.class-skills.mediziner
editorialStatus: reviewed
examples: []
featureIds:
  - class-feature.mediziner.medizinische-ausbildung
  - class-feature.mediziner.erste-hilfe
  - class-feature.mediziner.fachrichtung.feldarzt
  - class-feature.mediziner.fachrichtung.chirurg
  - class-feature.mediziner.fachrichtung.forscher
  - class-feature.mediziner.fachrichtung.psychologe
  - class-feature.mediziner.fachrichtung
  - class-feature.mediziner.schnelle-stabilisierung
  - class-feature.mediziner.medizinische-prazision
  - class-feature.mediziner.erweiterte-diagnostik
  - class-feature.mediziner.lebensretter
  - class-feature.mediziner.heilgenie
hpPerLevel: 8
id: class.mediziner
initialProficiencies:
  armor:
    proficiency.armor.light: trained
    proficiency.armor.unarmored: trained
  perception: trained
  saves:
    fortitude: trained
    reflex: trained
    will: trained
  skills: {}
  weapons:
    proficiency.weapon.simple: trained
    proficiency.weapon.unarmed: trained
keyAttributes:
  - wisdom
  - intelligence
legacy:
  notes:
    - Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing.
  paths:
    - classes/klasse_mediziner.md
name: Mediziner
references: []
rulesText: "# **Mediziner**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Ich kann dich retten. Wenn du stillhältst.“\r

  \r

  Mediziner sind jene, die zwischen Leben und Tod verhandeln – mit Skalpell, Verband und Wissen statt mit Gebeten oder Magie.  \r

  Sie sind Ärzte, Sanitäter und Forscher, die sich der Erhaltung des Lebens verschrieben haben – oder zumindest dem Versuch, es zu verstehen.  \r

  Im Zeitalter des Goldes (1990 n. 0) arbeiten sie in Krankenhäusern, auf Schlachtfeldern oder in improvisierten Lazaretten. Manche dienen in den Armeen des Nordimperiums, andere in den mobilen Kliniken der Föderation oder als geheime Forscher für Konzerne wie **Helix Dynamics** oder **NovoChem**.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  Mediziner sind **Heiler und Wissensspezialisten**, die auf Biologie, Anatomie und Chemie basieren.  \r

  Sie vereinen die Disziplin des Wissenschaftlers mit der Präzision des Chirurgen.  \r

  Manche sind Feldärzte, andere Wissenschaftler – alle aber verstehen den schmalen Grat zwischen Heilung und Experiment.\r

  \r

  ---\r

  \r

  ## **Rolle im Spiel**\r

  Der Mediziner ist der **Heiler und Unterstützer** der Gruppe.  \r

  Er kann Wunden schließen, Krankheiten behandeln, Gifte neutralisieren und Körperfunktionen wiederherstellen.  \r

  Er ist weniger ein Kämpfer als ein Überlebensgarant – jemand, der selbst im schlimmsten Chaos einen kühlen Kopf behält.\r

  \r

  ---\r

  \r

  ## **Schlüsselattribut**\r

  **Weisheit** (Diagnose, Einfühlungsvermögen) oder **Intelligenz** (medizinisches Wissen).  \r

  Sekundär: **Geschicklichkeit** (Chirurgie, Präzision).\r

  \r

  ---\r

  \r

  ## **Trefferpunkte**\r

  8 plus dein Konstitutionsmodifikator\r

  \r

  ---\r

  \r

  ## **Anfangsproficiencies**\r

  | Kategorie | Grad |\r

  |:--|:--|\r

  | **Rüstung** | Leichte Rüstung |\r

  | **Waffen** | Einfache Waffen, chirurgische Werkzeuge (zählen als Dolche) |\r

  | **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |\r

  | **Fertigkeiten** | Wahrnehmung (Geübt) |\r

  | **Fertigkeiten pro Stufe** | 5 + INT-Modifikator |\r

  | **Klassenmerkmal** | Medizinische Ausbildung, Erste Hilfe, Fachrichtung |\r

  \r

  ---\r

  \r

  ## **Klassenmerkmale**\r

  \r

  ### **Medizinische Ausbildung**\r

  Du bist ausgebildeter Arzt oder Sanitäter.  \r

  Du erhältst Fertigkeitstraining in **Medizin** und **Wissenschaft (Biologie oder Chemie)**.  \r

  Wenn du einen Wurf zur Heilung, Diagnose oder Behandlung von Giften/Krankheiten ablegst, erhältst +1 auf das Ergebnis.  \r

  Du kannst medizinische Ausrüstung improvisieren (z. B. Verband, Schiene, Desinfektionsmittel).\r

  \r

  ---\r

  \r

  ### **Erste Hilfe**\r

  Du kannst eine Aktion aufwenden, um einen Verbündeten innerhalb von 5 Fuß zu stabilisieren (SG 15).  \r

  Bei Erfolg: Der Verbündete stoppt Blutungen oder erhält 1W6 Trefferpunkte.  \r

  Bei einem kritischen Erfolg: 1W6 + Weisheitsmodifikator.  \r

  Du kannst diese Fähigkeit pro Ziel nur einmal alle 10 Minuten anwenden.\r

  \r

  ---\r

  \r

  ### **Fachrichtung (1. Stufe)**\r

  Wähle deinen medizinischen Schwerpunkt.\r

  \r

  #### **Feldarzt**\r

  Du arbeitest an der Front – schnell, präzise, unerschütterlich.  \r

  - Du erhältst +1 auf Medizin in stressigen Situationen (Kampf, Chaos).  \r

  - Du kannst Erste Hilfe als eine Aktion anwenden (statt zwei).  \r

  - Du erhältst Resistenz 2 gegen Blutungs- und Erschöpfungseffekte.\r

  \r

  #### **Chirurg**\r

  Du bist Spezialist für Operationen und Präzision.  \r

  - Du erhältst Fertigkeitstraining in Handwerk (Chirurgie).  \r

  - Du kannst einmal pro Stunde eine kritische Wunde (SG 20) behandeln, um 1W8 + WIS-Modifikator TP wiederherzustellen.  \r

  - Wenn du improvisierte Werkzeuge verwendest, erleidest du keinen Malus.\r

  \r

  #### **Forscher**\r

  Du bist Wissenschaftler der Heilkunst.  \r

  - Du erhältst Fertigkeitstraining in Wissenschaft und Naturkunde.  \r

  - Du kannst einmal pro Tag ein Heilserum herstellen (Heilung 1W8 oder +2 auf Zähigkeit für 1 Stunde).  \r

  - Du erhältst +1 auf Würfe gegen Krankheiten und Gifte.\r

  \r

  #### **Psychologe**\r

  Du heilst den Geist, nicht den Körper.  \r

  - Du erhältst Fertigkeitstraining in Diplomatie und Einschüchtern.  \r

  - Du kannst einmal pro Tag *Calm Emotions* wirken.  \r

  - Wenn du einen Verbündeten nach einem Furchteffekt beruhigst, erhält dieser +2 auf den nächsten Willenswurf.\r

  \r

  ---\r

  \r

  ### **Schnelle Stabilisierung (3. Stufe)**\r

  Du kannst einen sterbenden Verbündeten in einer Aktion stabilisieren.  \r

  Wenn du dies tust, erhält das Ziel sofort 1W8 TP.  \r

  Einmal pro Stunde kannst du stattdessen eine Adrenalininjektion einsetzen, um +1 auf Angriff und Schaden für 1 Minute zu gewähren (danach 1W6 Erschöpfungsschaden).\r

  \r

  ---\r

  \r

  ### **Medizinische Präzision (7. Stufe)**\r

  Du kannst Verletzungen gezielt behandeln.  \r

  Wenn du 10 Minuten mit einem Verwundeten verbringst, kann dieser zusätzlich 1W10 TP heilen.  \r

  Bei kritischem Erfolg: + Konstitutionsmodifikator.  \r

  Wenn du dies auf dich selbst anwendest, halbiert sich die Zeit.\r

  \r

  ---\r

  \r

  ### **Erweiterte Diagnostik (11. Stufe)**\r

  Du erkennst Symptome, bevor sie auftreten.  \r

  Du erhältst +2 auf Medizin und Wahrnehmung, wenn du Krankheiten, Gifte oder Täuschung erkennst.  \r

  Einmal pro Tag kannst du sofort den Effekt eines Giftes neutralisieren (SG 20).\r

  \r

  ---\r

  \r

  ### **Lebensretter (15. Stufe)**\r

  Du kannst das Unmögliche möglich machen.  \r

  Wenn ein Verbündeter innerhalb von 30 Fuß stirbt, kannst du innerhalb von 1 Runde handeln, um ihn zurückzuholen (SG 25).  \r

  Bei Erfolg stabilisiert sich das Ziel auf 1 TP und erhält Resistenz 2 gegen weiteren Schaden für 1 Minute.  \r

  Diese Fähigkeit kann einmal pro Tag eingesetzt werden.\r

  \r

  ---\r

  \r

  ### **Heilgenie (20. Stufe)**\r

  Dein Name ist Legende in der Medizin.  \r

  Du erhältst:  \r

  - +2 auf alle Medizin- und Wissenschaftsproben,  \r

  - Immunität gegen Krankheiten,  \r

  - Resistenz 5 gegen Gifte,  \r

  - und kannst einmal pro Woche ein echtes medizinisches Wunder vollbringen – z. B. die Heilung einer unheilbaren Krankheit oder Wiederherstellung eines verstümmelten Körpers.\r

  \r

  ---\r

  \r

  ## **Klassen-Feats**\r

  \r

  | Stufe | Name | Effekt |\r

  |:--|:--|:--|\r

  | **1** | Saubere Schnitte | Du erhältst +1 auf Handwerksproben bei Operationen. |\r

  | **2** | Stabile Hände | Du kannst Erste Hilfe unter Druck ohne Malus durchführen. |\r

  | **4** | Adrenalinschub | Du kannst einem Verbündeten +1 auf Initiative geben (1/Tag). |\r

  | **6** | Schmerzstiller | Du kannst 1W6 Schaden verhindern, wenn du ein Ziel behandelst. |\r

  | **8** | Kampfsanitäter | Du kannst dich während der Heilung bewegen, ohne die Aktion zu verlieren. |\r

  | **10** | Organisierter Geist | +2 auf Medizin in chaotischen Situationen. |\r

  | **12** | Meister der Chirurgie | Du kannst kritische Verletzungen in der halben Zeit behandeln. |\r

  | **14** | Antitoxin | Du kannst 1/Tag einen Trank herstellen, der +2 gegen Gifte gewährt. |\r

  | **16** | Notfalltherapie | Du kannst einen Zauberähnlichen Effekt („Lesser Restoration“) einmal täglich anwenden. |\r

  | **18** | Lebenswille | Wenn du stirbst, kannst du 1W6 TP zurückgewinnen (1/Tag). |\r

  | **20** | Wunderdoktor | Du kannst 1 gefährliche Krankheit oder Zustand pro Tag heilen, unabhängig vom SG. |\r

  \r

  ---\r

  \r

  ## **Archetypen**\r

  \r

  ### **Feldsanitäter**\r

  Du bist Spezialist in der Erstversorgung.  \r

  Du kannst Erste Hilfe im Kampf anwenden (keine Gelegenheitsangriffe).  \r

  Einmal pro Stunde kannst du 1W8 TP sofort heilen.\r

  \r

  ### **Klinikarzt**\r

  Du bist Forscher und Mediziner in einem zivilen Umfeld.  \r

  Du erhältst Fertigkeitstraining in Wissenschaft und Diplomatie.  \r

  Einmal pro Tag kannst du ein Heilmittel herstellen, das +2 auf Zähigkeit und Willen gewährt (1 Stunde).\r

  \r

  ### **Seuchenforscher**\r

  Du bist geübt im Umgang mit Krankheiten und biologischen Gefahren.  \r

  Du erhältst Resistenz 2 gegen Krankheiten und +1 auf Proben gegen Gifte.  \r

  Einmal pro Woche kannst du eine Probe auf Wissenschaft (SG 25) ablegen, um den Verlauf einer Krankheit dauerhaft zu beenden.\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  Mediziner sind das Gewissen und die Hoffnung der modernen Welt. Sie sind keine Zauberer – aber sie können Leben retten, wo selbst Magie versagt.  \r

  Im Spiel verkörpern sie Menschlichkeit, Rationalität und Mut – die letzte Grenze zwischen Leben und Tod, in einer Welt, die beides zu oft missachtet."
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Mediziner sind jene, die zwischen Leben und Tod verhandeln – mit Skalpell, Verband und Wissen statt mit Gebeten oder Magie.
trainedSkillChoices: 4
traits: []
type: class
---

# **Mediziner**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**
> „Ich kann dich retten. Wenn du stillhältst.“

Mediziner sind jene, die zwischen Leben und Tod verhandeln – mit Skalpell, Verband und Wissen statt mit Gebeten oder Magie.  
Sie sind Ärzte, Sanitäter und Forscher, die sich der Erhaltung des Lebens verschrieben haben – oder zumindest dem Versuch, es zu verstehen.  
Im Zeitalter des Goldes (1990 n. 0) arbeiten sie in Krankenhäusern, auf Schlachtfeldern oder in improvisierten Lazaretten. Manche dienen in den Armeen des Nordimperiums, andere in den mobilen Kliniken der Föderation oder als geheime Forscher für Konzerne wie **Helix Dynamics** oder **NovoChem**.

---

## **Übersicht**
Mediziner sind **Heiler und Wissensspezialisten**, die auf Biologie, Anatomie und Chemie basieren.  
Sie vereinen die Disziplin des Wissenschaftlers mit der Präzision des Chirurgen.  
Manche sind Feldärzte, andere Wissenschaftler – alle aber verstehen den schmalen Grat zwischen Heilung und Experiment.

---

## **Rolle im Spiel**
Der Mediziner ist der **Heiler und Unterstützer** der Gruppe.  
Er kann Wunden schließen, Krankheiten behandeln, Gifte neutralisieren und Körperfunktionen wiederherstellen.  
Er ist weniger ein Kämpfer als ein Überlebensgarant – jemand, der selbst im schlimmsten Chaos einen kühlen Kopf behält.

---

## **Schlüsselattribut**
**Weisheit** (Diagnose, Einfühlungsvermögen) oder **Intelligenz** (medizinisches Wissen).  
Sekundär: **Geschicklichkeit** (Chirurgie, Präzision).

---

## **Trefferpunkte**
8 plus dein Konstitutionsmodifikator

---

## **Anfangsproficiencies**
| Kategorie | Grad |
|:--|:--|
| **Rüstung** | Leichte Rüstung |
| **Waffen** | Einfache Waffen, chirurgische Werkzeuge (zählen als Dolche) |
| **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |
| **Fertigkeiten** | Wahrnehmung (Geübt) |
| **Fertigkeiten pro Stufe** | 5 + INT-Modifikator |
| **Klassenmerkmal** | Medizinische Ausbildung, Erste Hilfe, Fachrichtung |

---

## **Klassenmerkmale**

### **Medizinische Ausbildung**
Du bist ausgebildeter Arzt oder Sanitäter.  
Du erhältst Fertigkeitstraining in **Medizin** und **Wissenschaft (Biologie oder Chemie)**.  
Wenn du einen Wurf zur Heilung, Diagnose oder Behandlung von Giften/Krankheiten ablegst, erhältst +1 auf das Ergebnis.  
Du kannst medizinische Ausrüstung improvisieren (z. B. Verband, Schiene, Desinfektionsmittel).

---

### **Erste Hilfe**
Du kannst eine Aktion aufwenden, um einen Verbündeten innerhalb von 5 Fuß zu stabilisieren (SG 15).  
Bei Erfolg: Der Verbündete stoppt Blutungen oder erhält 1W6 Trefferpunkte.  
Bei einem kritischen Erfolg: 1W6 + Weisheitsmodifikator.  
Du kannst diese Fähigkeit pro Ziel nur einmal alle 10 Minuten anwenden.

---

### **Fachrichtung (1. Stufe)**
Wähle deinen medizinischen Schwerpunkt.

#### **Feldarzt**
Du arbeitest an der Front – schnell, präzise, unerschütterlich.  
- Du erhältst +1 auf Medizin in stressigen Situationen (Kampf, Chaos).  
- Du kannst Erste Hilfe als eine Aktion anwenden (statt zwei).  
- Du erhältst Resistenz 2 gegen Blutungs- und Erschöpfungseffekte.

#### **Chirurg**
Du bist Spezialist für Operationen und Präzision.  
- Du erhältst Fertigkeitstraining in Handwerk (Chirurgie).  
- Du kannst einmal pro Stunde eine kritische Wunde (SG 20) behandeln, um 1W8 + WIS-Modifikator TP wiederherzustellen.  
- Wenn du improvisierte Werkzeuge verwendest, erleidest du keinen Malus.

#### **Forscher**
Du bist Wissenschaftler der Heilkunst.  
- Du erhältst Fertigkeitstraining in Wissenschaft und Naturkunde.  
- Du kannst einmal pro Tag ein Heilserum herstellen (Heilung 1W8 oder +2 auf Zähigkeit für 1 Stunde).  
- Du erhältst +1 auf Würfe gegen Krankheiten und Gifte.

#### **Psychologe**
Du heilst den Geist, nicht den Körper.  
- Du erhältst Fertigkeitstraining in Diplomatie und Einschüchtern.  
- Du kannst einmal pro Tag *Calm Emotions* wirken.  
- Wenn du einen Verbündeten nach einem Furchteffekt beruhigst, erhält dieser +2 auf den nächsten Willenswurf.

---

### **Schnelle Stabilisierung (3. Stufe)**
Du kannst einen sterbenden Verbündeten in einer Aktion stabilisieren.  
Wenn du dies tust, erhält das Ziel sofort 1W8 TP.  
Einmal pro Stunde kannst du stattdessen eine Adrenalininjektion einsetzen, um +1 auf Angriff und Schaden für 1 Minute zu gewähren (danach 1W6 Erschöpfungsschaden).

---

### **Medizinische Präzision (7. Stufe)**
Du kannst Verletzungen gezielt behandeln.  
Wenn du 10 Minuten mit einem Verwundeten verbringst, kann dieser zusätzlich 1W10 TP heilen.  
Bei kritischem Erfolg: + Konstitutionsmodifikator.  
Wenn du dies auf dich selbst anwendest, halbiert sich die Zeit.

---

### **Erweiterte Diagnostik (11. Stufe)**
Du erkennst Symptome, bevor sie auftreten.  
Du erhältst +2 auf Medizin und Wahrnehmung, wenn du Krankheiten, Gifte oder Täuschung erkennst.  
Einmal pro Tag kannst du sofort den Effekt eines Giftes neutralisieren (SG 20).

---

### **Lebensretter (15. Stufe)**
Du kannst das Unmögliche möglich machen.  
Wenn ein Verbündeter innerhalb von 30 Fuß stirbt, kannst du innerhalb von 1 Runde handeln, um ihn zurückzuholen (SG 25).  
Bei Erfolg stabilisiert sich das Ziel auf 1 TP und erhält Resistenz 2 gegen weiteren Schaden für 1 Minute.  
Diese Fähigkeit kann einmal pro Tag eingesetzt werden.

---

### **Heilgenie (20. Stufe)**
Dein Name ist Legende in der Medizin.  
Du erhältst:  
- +2 auf alle Medizin- und Wissenschaftsproben,  
- Immunität gegen Krankheiten,  
- Resistenz 5 gegen Gifte,  
- und kannst einmal pro Woche ein echtes medizinisches Wunder vollbringen – z. B. die Heilung einer unheilbaren Krankheit oder Wiederherstellung eines verstümmelten Körpers.

---

## **Klassen-Feats**

| Stufe | Name | Effekt |
|:--|:--|:--|
| **1** | Saubere Schnitte | Du erhältst +1 auf Handwerksproben bei Operationen. |
| **2** | Stabile Hände | Du kannst Erste Hilfe unter Druck ohne Malus durchführen. |
| **4** | Adrenalinschub | Du kannst einem Verbündeten +1 auf Initiative geben (1/Tag). |
| **6** | Schmerzstiller | Du kannst 1W6 Schaden verhindern, wenn du ein Ziel behandelst. |
| **8** | Kampfsanitäter | Du kannst dich während der Heilung bewegen, ohne die Aktion zu verlieren. |
| **10** | Organisierter Geist | +2 auf Medizin in chaotischen Situationen. |
| **12** | Meister der Chirurgie | Du kannst kritische Verletzungen in der halben Zeit behandeln. |
| **14** | Antitoxin | Du kannst 1/Tag einen Trank herstellen, der +2 gegen Gifte gewährt. |
| **16** | Notfalltherapie | Du kannst einen Zauberähnlichen Effekt („Lesser Restoration“) einmal täglich anwenden. |
| **18** | Lebenswille | Wenn du stirbst, kannst du 1W6 TP zurückgewinnen (1/Tag). |
| **20** | Wunderdoktor | Du kannst 1 gefährliche Krankheit oder Zustand pro Tag heilen, unabhängig vom SG. |

---

## **Archetypen**

### **Feldsanitäter**
Du bist Spezialist in der Erstversorgung.  
Du kannst Erste Hilfe im Kampf anwenden (keine Gelegenheitsangriffe).  
Einmal pro Stunde kannst du 1W8 TP sofort heilen.

### **Klinikarzt**
Du bist Forscher und Mediziner in einem zivilen Umfeld.  
Du erhältst Fertigkeitstraining in Wissenschaft und Diplomatie.  
Einmal pro Tag kannst du ein Heilmittel herstellen, das +2 auf Zähigkeit und Willen gewährt (1 Stunde).

### **Seuchenforscher**
Du bist geübt im Umgang mit Krankheiten und biologischen Gefahren.  
Du erhältst Resistenz 2 gegen Krankheiten und +1 auf Proben gegen Gifte.  
Einmal pro Woche kannst du eine Probe auf Wissenschaft (SG 25) ablegen, um den Verlauf einer Krankheit dauerhaft zu beenden.

---

## **Beschreibung im Spiel**
Mediziner sind das Gewissen und die Hoffnung der modernen Welt. Sie sind keine Zauberer – aber sie können Leben retten, wo selbst Magie versagt.  
Im Spiel verkörpern sie Menschlichkeit, Rationalität und Mut – die letzte Grenze zwischen Leben und Tod, in einer Welt, die beides zu oft missachtet.
