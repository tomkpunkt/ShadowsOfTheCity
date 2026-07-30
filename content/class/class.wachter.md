---
choiceIds:
  - choice.wachter.eid
  - choice.class-feat.wachter.1
  - choice.class-feat.wachter.2
  - choice.class-feat.wachter.4
  - choice.class-feat.wachter.6
  - choice.class-feat.wachter.8
  - choice.class-feat.wachter.10
  - choice.class-feat.wachter.12
  - choice.class-feat.wachter.14
  - choice.class-feat.wachter.16
  - choice.class-feat.wachter.18
  - choice.class-feat.wachter.20
  - choice.class-skills.wachter
editorialStatus: reviewed
examples: []
featureIds:
  - class-feature.wachter.eid.eid-der-ordnung
  - class-feature.wachter.eid.eid-des-lichts
  - class-feature.wachter.eid.eid-des-stahls
  - class-feature.wachter.eid
  - class-feature.wachter.wachterhaltung
  - class-feature.wachter.schutzreaktion
  - class-feature.wachter.standhaftigkeit
  - class-feature.wachter.heiliger-schwur
  - class-feature.wachter.eiserne-prasenz
  - class-feature.wachter.letzter-schild
hpPerLevel: 10
id: class.wachter
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
  - constitution
  - wisdom
legacy:
  notes:
    - Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing.
  paths:
    - classes/klasse_waechter.md
name: Wächter
references: []
rulesText: "# **Wächter**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Wenn niemand mehr für das Richtige kämpft, bleibt nur noch das Schwert der Pflicht.“\r

  \r

  Wächter sind die letzten Idealisten in einer Welt der Kompromisse. Sie glauben an Ordnung, Schutz und Verantwortung – selbst dann, wenn niemand mehr an sie glaubt. Ob sie als Stadtwachen, Paladine alter Glaubensrichtungen oder persönliche Leibgardisten elfischer Familien dienen, Wächter stehen zwischen Chaos und Zivilisation.  \r

  Ihre Rüstung ist mehr als Metall – sie ist Symbol einer Überzeugung, dass Recht, Pflicht und Ehre mehr bedeuten als Macht.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  Wächter sind **disziplinierte Verteidiger**. Sie vereinen Kampfkunst mit moralischer oder ideologischer Stärke.  \r

  Während Söldner für Geld kämpfen und Agenten für Ziele, kämpfen Wächter für Prinzipien. Manche folgen religiösen Orden wie dem **Ordo Lux Aeterna**, andere schützen Unschuldige aus reinem Pflichtgefühl.\r

  \r

  ---\r

  \r

  ## **Rolle im Spiel**\r

  Der Wächter ist der **Tank, Beschützer und moralische Anker** einer Gruppe. Er zieht Angriffe auf sich, schützt Verbündete und bringt Stabilität in chaotische Situationen.  \r

  Seine Stärke liegt in seiner Zähigkeit, seiner Disziplin und seiner Fähigkeit, seine Überzeugung zu einer Waffe zu machen.\r

  \r

  ---\r

  \r

  ## **Schlüsselattribut**\r

  **Konstitution** (Standhaftigkeit) oder **Charisma** (Glaube, Präsenz).  \r

  Sekundär: **Stärke** (Nahkampf) oder **Weisheit** (Wahrnehmung, Führung).\r

  \r

  ---\r

  \r

  ## **Trefferpunkte**\r

  10 plus dein Konstitutionsmodifikator\r

  \r

  ---\r

  \r

  ## **Anfangsproficiencies**\r

  | Kategorie | Grad |\r

  |:--|:--|\r

  | **Rüstung** | Leichte, Mittlere, Schwere Rüstung, Schilde |\r

  | **Waffen** | Alle einfachen und militärischen Waffen |\r

  | **Rettungswürfe** | Zähigkeit (Experte), Willen (Experte), Reflex (Geübt) |\r

  | **Fertigkeiten** | Wahrnehmung (Geübt) |\r

  | **Fertigkeiten pro Stufe** | 3 + INT-Modifikator |\r

  | **Klassenmerkmal** | Eid, Wächterhaltung, Verteidigungsreaktionen |\r

  \r

  ---\r

  \r

  ## **Klassenmerkmale**\r

  \r

  ### **Eid**\r

  Du legst einen Eid ab, der deine Pflicht und Macht bestimmt.  \r

  Wähle eine der folgenden Richtungen:\r

  \r

  #### **Eid der Ordnung**\r

  Du glaubst an Gesetz und Struktur.  \r

  - Erhalte +1 auf Willenswürfe gegen mentale Effekte.  \r

  - Wenn du ein Verbündeten verteidigst, erhält dieser +1 AC.  \r

  \r

  #### **Eid des Lichts**\r

  Du dienst dem Schutz Unschuldiger oder einem göttlichen Prinzip.  \r

  - Du erhältst Fertigkeitstraining in Religion und Medizin.  \r

  - Einmal pro Tag kannst du *Lay on Hands* wirken (Attribut: Charisma).  \r

  \r

  #### **Eid des Stahls**\r

  Du vertraust allein auf die Waffe in deiner Hand.  \r

  - Du erhältst den Feat *Power Attack*.  \r

  - Wenn du einen Gegner besiegst, erhältst bis zum Ende deines nächsten Zuges +1 auf Angriffswürfe.  \r

  \r

  ---\r

  \r

  ### **Wächterhaltung (1. Stufe)**\r

  Du nimmst eine Position ein, um Verbündete zu schützen.  \r

  **Effekt:** Wenn du die Aktion *Verteidigen* ausführst, erhältst zusätzlich Resistenz 2 gegen physischen Schaden bis zum Beginn deines nächsten Zuges.  \r

  Wenn du einen Schild führst, erhöhst du dessen Härte um 2.\r

  \r

  ---\r

  \r

  ### **Schutzreaktion (3. Stufe)**\r

  Wenn ein Verbündeter innerhalb von 5 Fuß von dir angegriffen wird, kannst du als Reaktion versuchen, den Schlag abzufangen.  \r

  Würfle einen Reflexwurf gegen SG des Angriffs: bei Erfolg nimmst du die Hälfte des Schadens auf dich.\r

  \r

  ---\r

  \r

  ### **Standhaftigkeit (7. Stufe)**\r

  Du bist selbst unter Schmerz und Blutverlust unbeirrbar.  \r

  Einmal pro Tag kannst du einen misslungenen Zähigkeitswurf wiederholen.  \r

  Außerdem ignorierst du Mali durch Erschöpfung 1.\r

  \r

  ---\r

  \r

  ### **Heiliger Schwur (11. Stufe)**\r

  Dein Eid verleiht dir außergewöhnliche Kraft.  \r

  Einmal pro Tag kannst du deinen Eid aktivieren:  \r

  - **Eid der Ordnung:** Du und Verbündete im Umkreis von 10 Fuß erhalten +1 auf AC und Rettungswürfe (1 Minute).  \r

  - **Eid des Lichts:** Du strahlst Licht aus, das Untote und Dämonen in 10 Fuß –1 auf Angriffe gibt.  \r

  - **Eid des Stahls:** Du erhältst +2 auf Schaden für 1 Minute.  \r

  \r

  ---\r

  \r

  ### **Eiserne Präsenz (15. Stufe)**\r

  Deine bloße Anwesenheit inspiriert Mut.  \r

  Alle Verbündeten im Umkreis von 10 Fuß erhalten +1 auf Willenswürfe gegen Furcht und mentale Effekte.\r

  \r

  ---\r

  \r

  ### **Letzter Schild (20. Stufe)**\r

  Du bist das Bollwerk, das niemals fällt.  \r

  Wenn du auf 0 TP fallen würdest, bleibst du stattdessen bei 1 TP und kannst sofort eine Verteidigungsreaktion ausführen.  \r

  Einmal pro Tag kannst du alle negativen Zustände entfernen, wenn du dich entscheidest, 10 Minuten zu meditieren.\r

  \r

  ---\r

  \r

  ## **Klassen-Feats**\r

  \r

  | Stufe | Name | Effekt |\r

  |:--|:--|:--|\r

  | **1** | Schildparade | Wenn du den Schildblock nutzt, reduziere zusätzlichen Schaden um 2. |\r

  | **2** | Wachsamkeit | +1 auf Wahrnehmung und Initiative. |\r

  | **4** | Stählerne Verteidigung | +1 AC, solange du Rüstung trägst. |\r

  | **6** | Schutz des Schwachen | Wenn du einen Verbündeten verteidigst, erhält dieser Resistenz 2 gegen Schaden. |\r

  | **8** | Unerbittlich | Wenn du Schaden erleidest, reduziere ihn um 1 pro 5 Stufen. |\r

  | **10** | Heilende Berührung | Einmal pro Stunde kannst du 1W8 + CHA-Mod TP wiederherstellen. |\r

  | **12** | Wille des Eides | Immunität gegen Furcht für 1 Minute (1/Tag). |\r

  | **14** | Eiserne Bastion | +1 auf Zähigkeit, +2 auf AC, wenn du stillstehst. |\r

  | **16** | Unerschütterlich | Du kannst einen misslungenen Rettungswurf wiederholen (1/Tag). |\r

  | **18** | Licht der Hoffnung | Alle Verbündeten im Umkreis von 20 Fuß erhalten +1 auf Rettungswürfe. |\r

  | **20** | Wächter des Gleichgewichts | Du kannst einmal pro Tag zwischen Leben und Tod wählen: Einen Gefallenen retten oder einen Gegner endgültig bannen. |\r

  \r

  ---\r

  \r

  ## **Archetypen**\r

  \r

  ### **Ordenswächter**\r

  Du bist Teil eines heiligen Ordens wie dem *Ordo Lux Aeterna*.  \r

  Du erhältst Fertigkeitstraining in Religion und Einschüchtern.  \r

  Wenn du gegen dämonische oder magische Kreaturen kämpfst, erhältst +1 auf Schaden.\r

  \r

  ### **Königswächter**\r

  Du schützt eine Person, nicht eine Idee.  \r

  Wenn du die Aktion *Verteidigen* auf denselben Verbündeten anwendest, erhält dieser Resistenz 3 gegen physischen Schaden.\r

  \r

  ### **Straßenpatrouille**\r

  Du bist Wächter der einfachen Leute.  \r

  Du erhältst +1 auf Wahrnehmung und Diplomatie in städtischen Gebieten und kannst „Bedrohung“ ohne Mali einschätzen.\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  Wächter verkörpern Pflicht, Loyalität und Opferbereitschaft.  \r

  In einer Welt der Korruption sind sie jene, die noch an Prinzipien glauben – auch wenn diese Prinzipien sie zerstören.  \r

  Im Spiel sind Wächter der Fels in der Brandung: beständig, aufopfernd, moralisch – und oft das letzte Licht im Dunkel."
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Wächter sind die letzten Idealisten in einer Welt der Kompromisse.
trainedSkillChoices: 4
traits: []
type: class
---

# **Wächter**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**
> „Wenn niemand mehr für das Richtige kämpft, bleibt nur noch das Schwert der Pflicht.“

Wächter sind die letzten Idealisten in einer Welt der Kompromisse. Sie glauben an Ordnung, Schutz und Verantwortung – selbst dann, wenn niemand mehr an sie glaubt. Ob sie als Stadtwachen, Paladine alter Glaubensrichtungen oder persönliche Leibgardisten elfischer Familien dienen, Wächter stehen zwischen Chaos und Zivilisation.  
Ihre Rüstung ist mehr als Metall – sie ist Symbol einer Überzeugung, dass Recht, Pflicht und Ehre mehr bedeuten als Macht.

---

## **Übersicht**
Wächter sind **disziplinierte Verteidiger**. Sie vereinen Kampfkunst mit moralischer oder ideologischer Stärke.  
Während Söldner für Geld kämpfen und Agenten für Ziele, kämpfen Wächter für Prinzipien. Manche folgen religiösen Orden wie dem **Ordo Lux Aeterna**, andere schützen Unschuldige aus reinem Pflichtgefühl.

---

## **Rolle im Spiel**
Der Wächter ist der **Tank, Beschützer und moralische Anker** einer Gruppe. Er zieht Angriffe auf sich, schützt Verbündete und bringt Stabilität in chaotische Situationen.  
Seine Stärke liegt in seiner Zähigkeit, seiner Disziplin und seiner Fähigkeit, seine Überzeugung zu einer Waffe zu machen.

---

## **Schlüsselattribut**
**Konstitution** (Standhaftigkeit) oder **Charisma** (Glaube, Präsenz).  
Sekundär: **Stärke** (Nahkampf) oder **Weisheit** (Wahrnehmung, Führung).

---

## **Trefferpunkte**
10 plus dein Konstitutionsmodifikator

---

## **Anfangsproficiencies**
| Kategorie | Grad |
|:--|:--|
| **Rüstung** | Leichte, Mittlere, Schwere Rüstung, Schilde |
| **Waffen** | Alle einfachen und militärischen Waffen |
| **Rettungswürfe** | Zähigkeit (Experte), Willen (Experte), Reflex (Geübt) |
| **Fertigkeiten** | Wahrnehmung (Geübt) |
| **Fertigkeiten pro Stufe** | 3 + INT-Modifikator |
| **Klassenmerkmal** | Eid, Wächterhaltung, Verteidigungsreaktionen |

---

## **Klassenmerkmale**

### **Eid**
Du legst einen Eid ab, der deine Pflicht und Macht bestimmt.  
Wähle eine der folgenden Richtungen:

#### **Eid der Ordnung**
Du glaubst an Gesetz und Struktur.  
- Erhalte +1 auf Willenswürfe gegen mentale Effekte.  
- Wenn du ein Verbündeten verteidigst, erhält dieser +1 AC.  

#### **Eid des Lichts**
Du dienst dem Schutz Unschuldiger oder einem göttlichen Prinzip.  
- Du erhältst Fertigkeitstraining in Religion und Medizin.  
- Einmal pro Tag kannst du *Lay on Hands* wirken (Attribut: Charisma).  

#### **Eid des Stahls**
Du vertraust allein auf die Waffe in deiner Hand.  
- Du erhältst den Feat *Power Attack*.  
- Wenn du einen Gegner besiegst, erhältst bis zum Ende deines nächsten Zuges +1 auf Angriffswürfe.  

---

### **Wächterhaltung (1. Stufe)**
Du nimmst eine Position ein, um Verbündete zu schützen.  
**Effekt:** Wenn du die Aktion *Verteidigen* ausführst, erhältst zusätzlich Resistenz 2 gegen physischen Schaden bis zum Beginn deines nächsten Zuges.  
Wenn du einen Schild führst, erhöhst du dessen Härte um 2.

---

### **Schutzreaktion (3. Stufe)**
Wenn ein Verbündeter innerhalb von 5 Fuß von dir angegriffen wird, kannst du als Reaktion versuchen, den Schlag abzufangen.  
Würfle einen Reflexwurf gegen SG des Angriffs: bei Erfolg nimmst du die Hälfte des Schadens auf dich.

---

### **Standhaftigkeit (7. Stufe)**
Du bist selbst unter Schmerz und Blutverlust unbeirrbar.  
Einmal pro Tag kannst du einen misslungenen Zähigkeitswurf wiederholen.  
Außerdem ignorierst du Mali durch Erschöpfung 1.

---

### **Heiliger Schwur (11. Stufe)**
Dein Eid verleiht dir außergewöhnliche Kraft.  
Einmal pro Tag kannst du deinen Eid aktivieren:  
- **Eid der Ordnung:** Du und Verbündete im Umkreis von 10 Fuß erhalten +1 auf AC und Rettungswürfe (1 Minute).  
- **Eid des Lichts:** Du strahlst Licht aus, das Untote und Dämonen in 10 Fuß –1 auf Angriffe gibt.  
- **Eid des Stahls:** Du erhältst +2 auf Schaden für 1 Minute.  

---

### **Eiserne Präsenz (15. Stufe)**
Deine bloße Anwesenheit inspiriert Mut.  
Alle Verbündeten im Umkreis von 10 Fuß erhalten +1 auf Willenswürfe gegen Furcht und mentale Effekte.

---

### **Letzter Schild (20. Stufe)**
Du bist das Bollwerk, das niemals fällt.  
Wenn du auf 0 TP fallen würdest, bleibst du stattdessen bei 1 TP und kannst sofort eine Verteidigungsreaktion ausführen.  
Einmal pro Tag kannst du alle negativen Zustände entfernen, wenn du dich entscheidest, 10 Minuten zu meditieren.

---

## **Klassen-Feats**

| Stufe | Name | Effekt |
|:--|:--|:--|
| **1** | Schildparade | Wenn du den Schildblock nutzt, reduziere zusätzlichen Schaden um 2. |
| **2** | Wachsamkeit | +1 auf Wahrnehmung und Initiative. |
| **4** | Stählerne Verteidigung | +1 AC, solange du Rüstung trägst. |
| **6** | Schutz des Schwachen | Wenn du einen Verbündeten verteidigst, erhält dieser Resistenz 2 gegen Schaden. |
| **8** | Unerbittlich | Wenn du Schaden erleidest, reduziere ihn um 1 pro 5 Stufen. |
| **10** | Heilende Berührung | Einmal pro Stunde kannst du 1W8 + CHA-Mod TP wiederherstellen. |
| **12** | Wille des Eides | Immunität gegen Furcht für 1 Minute (1/Tag). |
| **14** | Eiserne Bastion | +1 auf Zähigkeit, +2 auf AC, wenn du stillstehst. |
| **16** | Unerschütterlich | Du kannst einen misslungenen Rettungswurf wiederholen (1/Tag). |
| **18** | Licht der Hoffnung | Alle Verbündeten im Umkreis von 20 Fuß erhalten +1 auf Rettungswürfe. |
| **20** | Wächter des Gleichgewichts | Du kannst einmal pro Tag zwischen Leben und Tod wählen: Einen Gefallenen retten oder einen Gegner endgültig bannen. |

---

## **Archetypen**

### **Ordenswächter**
Du bist Teil eines heiligen Ordens wie dem *Ordo Lux Aeterna*.  
Du erhältst Fertigkeitstraining in Religion und Einschüchtern.  
Wenn du gegen dämonische oder magische Kreaturen kämpfst, erhältst +1 auf Schaden.

### **Königswächter**
Du schützt eine Person, nicht eine Idee.  
Wenn du die Aktion *Verteidigen* auf denselben Verbündeten anwendest, erhält dieser Resistenz 3 gegen physischen Schaden.

### **Straßenpatrouille**
Du bist Wächter der einfachen Leute.  
Du erhältst +1 auf Wahrnehmung und Diplomatie in städtischen Gebieten und kannst „Bedrohung“ ohne Mali einschätzen.

---

## **Beschreibung im Spiel**
Wächter verkörpern Pflicht, Loyalität und Opferbereitschaft.  
In einer Welt der Korruption sind sie jene, die noch an Prinzipien glauben – auch wenn diese Prinzipien sie zerstören.  
Im Spiel sind Wächter der Fels in der Brandung: beständig, aufopfernd, moralisch – und oft das letzte Licht im Dunkel.
