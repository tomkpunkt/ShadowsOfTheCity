---
choiceIds:
  - choice.okkultist.pfad-der-macht
  - choice.class-feat.okkultist.1
  - choice.class-feat.okkultist.2
  - choice.class-feat.okkultist.4
  - choice.class-feat.okkultist.6
  - choice.class-feat.okkultist.8
  - choice.class-feat.okkultist.10
  - choice.class-feat.okkultist.12
  - choice.class-feat.okkultist.14
  - choice.class-feat.okkultist.16
  - choice.class-feat.okkultist.18
  - choice.class-feat.okkultist.20
  - choice.class-skills.okkultist
  - choice.class-spells.okkultist
editorialStatus: reviewed
examples: []
featureIds:
  - class-feature.okkultist.okkultes-wissen
  - class-feature.okkultist.ritualmagie
  - class-feature.okkultist.pfad-der-macht.blutpakt
  - class-feature.okkultist.pfad-der-macht.geisterruf
  - class-feature.okkultist.pfad-der-macht.schattenpakt
  - class-feature.okkultist.pfad-der-macht.runenpfad
  - class-feature.okkultist.pfad-der-macht
  - class-feature.okkultist.okkulte-prasenz
  - class-feature.okkultist.verbotene-kraft
  - class-feature.okkultist.seelenanker
  - class-feature.okkultist.ruf-der-tiefe
  - class-feature.okkultist.verbotener-aufstieg
hpPerLevel: 6
id: class.okkultist
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
  - charisma
legacy:
  notes:
    - Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing.
  paths:
    - classes/klasse_okkultist.md
name: Okkultist
references: []
rulesText: "# **Okkultist**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Magie ist kein Werkzeug. Sie ist Hunger, Erinnerung – und Preis zugleich.“\r

  \r

  Okkultisten sind die Grenzgänger zwischen Leben und Tod, Wissenschaft und Aberglaube. Sie rühren an Dinge, die nicht berührt werden sollen, und bezahlen dafür mit Verstand, Blut oder Seele.  \r

  Im Zeitalter des Goldes (1990 n. 0) sind sie die Erben der Hexen, Blutmagier und Ritualisten vergangener Zeitalter – Überreste der Dunklen Ära, in der Magie gefürchtet und vergöttert zugleich war.  \r

  Manche suchen Wissen, andere Macht – doch alle wissen: Wenn du das Geflecht berührst, berührt es dich zurück.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  Okkultisten sind **Zauberwirker des Verbotenen**, die ihre Kraft aus Ritualen, Blut, Symbolen und alten Pakten schöpfen.  \r

  Sie kombinieren arkanes Wissen mit religiösen oder esoterischen Praktiken.  \r

  Ihre Magie ist mächtig, aber gefährlich – für sich selbst und andere.\r

  \r

  ---\r

  \r

  ## **Rolle im Spiel**\r

  Der Okkultist ist ein **Unterstützer und Kontrollzauberwirker** mit Zugriff auf seltene oder verbotene Kräfte.  \r

  Er kann die Realität verzerren, Geister beschwören, Gedanken beeinflussen und Lebenskraft manipulieren.  \r

  Seine Zauber sind oft riskant, aber wirkungsvoll – der Preis für Macht ist stets real.\r

  \r

  ---\r

  \r

  ## **Schlüsselattribut**\r

  **Charisma** (Willenskraft, Präsenz) oder **Weisheit** (spirituelle Verbindung).  \r

  Sekundär: **Konstitution** (Blutmagie, Ausdauer).\r

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

  | **Rüstung** | Keine |\r

  | **Waffen** | Einfache Waffen, Dolche, Ritualklingen |\r

  | **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |\r

  | **Fertigkeiten** | Wahrnehmung (Geübt) |\r

  | **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |\r

  | **Klassenmerkmal** | Okkultes Wissen, Ritualmagie, Pfad der Macht |\r

  \r

  ---\r

  \r

  ## **Klassenmerkmale**\r

  \r

  ### **Okkultes Wissen**\r

  Du kennst die verborgenen Symbole und Sprachen der alten Welt.  \r

  Du erhältst Fertigkeitstraining in **Okkultismus** und **Religion**.  \r

  Einmal pro Stunde kannst du eine Probe auf Arkane Kunde oder Religion wiederholen, wenn sie mit Ritualen, Geistern oder Flüchen zu tun hat.\r

  \r

  ---\r

  \r

  ### **Ritualmagie**\r

  Du kannst Rituale durchführen, um mächtige, aber gefährliche Effekte zu erzielen.  \r

  Ein Ritual dauert mindestens 10 Minuten und erfordert Komponenten im Wert von 1 GP pro Zaubergrad.  \r

  Rituale können:  \r

  - Geister beschwören (*Summon Spirit*),  \r

  - Orte segnen oder verfluchen,  \r

  - Erinnerung oder Emotionen verändern (*Suggestion*, *Calm Emotions*).  \r

  \r

  Jedes Ritual birgt ein Risiko: Scheitert dein Wurf um 5 oder mehr, erleidest du 1W6 mentalen Schaden pro Zaubergrad.\r

  \r

  ---\r

  \r

  ### **Pfad der Macht (1. Stufe)**\r

  Wähle, welche Quelle dich verändert hat.\r

  \r

  #### **Blutpakt**\r

  Du hast Macht durch Opfer erhalten.  \r

  - Du erhältst Resistenz 2 gegen Blutungs- und Krankheitseffekte.  \r

  - Du kannst 1 Mal pro Tag 1W4 TP opfern, um +1 auf einen Zauberwurf zu erhalten.  \r

  \r

  #### **Geisterruf**\r

  Du bist Medium zwischen den Welten.  \r

  - Du erhältst Fertigkeitstraining in Diplomatie oder Einschüchtern.  \r

  - Einmal pro Tag kannst du *Speak with Dead* wirken.  \r

  \r

  #### **Schattenpakt**\r

  Du hast einen Vertrag mit einem Wesen aus der Dunkelheit geschlossen.  \r

  - Du erhältst Dunkelsicht.  \r

  - Du kannst einmal pro Tag *Fear* wirken (Attribut: Charisma).  \r

  \r

  #### **Runenpfad**\r

  Du beherrschst uralte Zeichen, die Realität beeinflussen.  \r

  - Du erhältst Fertigkeitstraining in Handwerk (Runen).  \r

  - Du kannst einmal pro Stunde eine Rune aktivieren, die +1 auf AC oder Angriffe gewährt (1 Runde).\r

  \r

  ---\r

  \r

  ### **Okkulte Präsenz (3. Stufe)**\r

  Deine Nähe verändert die Welt.  \r

  Du erhältst +1 auf Einschüchtern und Diplomatie gegen religiöse oder magisch begabte Kreaturen.  \r

  Wenn du einen Zauber wirkst, der Furcht oder Kontrolle verursacht, erhalten Ziele –1 auf ihren Rettungswurf.\r

  \r

  ---\r

  \r

  ### **Verbotene Kraft (7. Stufe)**\r

  Du lernst, deine Macht zu verstärken – zum Preis deiner Vitalität.  \r

  Einmal pro Tag kannst du beim Wirken eines Zaubers 1W8 TP opfern, um +2 auf SG und Schaden des Zaubers zu erhalten.\r

  \r

  ---\r

  \r

  ### **Seelenanker (11. Stufe)**\r

  Dein Geist ist durch Schmerz gestählt.  \r

  Du erhältst Resistenz 2 gegen mentale Effekte und bist immun gegen Furcht 1 Minute pro Tag (freie Aktion, 1/Tag).\r

  \r

  ---\r

  \r

  ### **Ruf der Tiefe (15. Stufe)**\r

  Die Dunkelheit antwortet deinem Willen.  \r

  Einmal pro Tag kannst du *Summon Entity* oder *Banish* wirken.  \r

  Wenn du ein beschworenes Wesen kontrollierst, erhält es +1 auf Angriffe, solange du Schaden erleidest.\r

  \r

  ---\r

  \r

  ### **Verbotener Aufstieg (20. Stufe)**\r

  Du bist kein Sterblicher mehr, sondern ein Knotenpunkt des Geflechts.  \r

  Du erhältst:  \r

  - Immunität gegen mentale und Furchteffekte,  \r

  - Resistenz 5 gegen magischen Schaden,  \r

  - und kannst einmal pro Tag *Wish* oder ein äquivalentes Ritual ausführen – doch jedes Mal steigt das Risiko, dauerhaft 1 Attributspunkt zu verlieren.\r

  \r

  ---\r

  \r

  ## **Klassen-Feats**\r

  \r

  | Stufe | Name | Effekt |\r

  |:--|:--|:--|\r

  | **1** | Blutopfer | Du kannst 1W4 TP opfern, um +1 auf einen Zauberwurf zu erhalten. |\r

  | **2** | Hexensinn | Du spürst aktive Magie und Flüche im Umkreis von 30 Fuß. |\r

  | **4** | Dunkle Bindung | +1 auf Angriffe beschworener Wesen. |\r

  | **6** | Runen der Macht | +1 auf Zauber-SGs, wenn du zuvor ein Ritual vollzogen hast. |\r

  | **8** | Seelenflamme | Du kannst 1W6 Schaden verursachen, wenn du Schaden erleidest (1/Tag). |\r

  | **10** | Blutmagie | Wenn du Schaden durch eigene Zauber erleidest, reduziere ihn um 1 pro Zaubergrad. |\r

  | **12** | Doppelte Präsenz | Du kannst mit Geistern kommunizieren, die dich sehen, ohne zu sprechen. |\r

  | **14** | Bannkreis | Du kannst 1/Tag einen Schutzkreis gegen eine Kreaturenart ziehen (SG 20). |\r

  | **16** | Geisterarmee | Du kannst bis zu 2 beschworene Wesen gleichzeitig kontrollieren. |\r

  | **18** | Verfluchter Wille | Wenn du 0 TP erreichst, kannst du einmal 1W10 TP zurückgewinnen (1/Tag). |\r

  | **20** | Geflechtzerriss | Du kannst 1/Tag eine Zone instabiler Magie erschaffen (20 Fuß, 1 Minute). |\r

  \r

  ---\r

  \r

  ## **Archetypen**\r

  \r

  ### **Blutmagier**\r

  Du opferst dich für Macht.  \r

  Du erhältst +1 auf Zauber-SGs, wenn du bei der Vorbereitung 1W6 TP opferst.  \r

  Einmal pro Woche kannst du ein Blutritual durchführen, das dir Resistenz 5 gegen Tod und Krankheit gibt (1 Tag).\r

  \r

  ### **Kultist**\r

  Du bist Teil einer Sekte, die Wissen und Macht aus der Dunkelheit zieht.  \r

  Du erhältst Fertigkeitstraining in Religion und Einschüchtern.  \r

  Wenn du an einem Ritual mit anderen teilnimmst, erhöht sich dessen Effekt um +1 auf SG oder Schaden.\r

  \r

  ### **Grabrufpriester**\r

  Du wandelst zwischen Leben und Tod.  \r

  Du erhältst Fertigkeitstraining in Medizin und Religion.  \r

  Einmal pro Tag kannst du einen gefallenen Verbündeten stabilisieren, ohne Materialkomponenten.\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  Okkultisten sind gefährlich, faszinierend und tragisch. Sie nutzen Macht, die kein Mensch begreifen sollte, und zahlen dafür den Preis.  \r

  Im Spiel sind sie ambivalente Figuren – Heiler oder Verderber, Wissende oder Wahnsinnige.  \r

  Sie verkörpern die Grenze zwischen Ordnung und Chaos, Leben und Tod – und erinnern daran, dass Wissen immer Opfer verlangt."
schemaVersion: 1
source: legacy.world-rules
spellcastingProgressionId: spellcasting.occult-spontaneous
status: legacy
summary: Okkultisten sind die Grenzgänger zwischen Leben und Tod, Wissenschaft und Aberglaube.
trainedSkillChoices: 4
traits: []
type: class
---

# **Okkultist**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**
> „Magie ist kein Werkzeug. Sie ist Hunger, Erinnerung – und Preis zugleich.“

Okkultisten sind die Grenzgänger zwischen Leben und Tod, Wissenschaft und Aberglaube. Sie rühren an Dinge, die nicht berührt werden sollen, und bezahlen dafür mit Verstand, Blut oder Seele.  
Im Zeitalter des Goldes (1990 n. 0) sind sie die Erben der Hexen, Blutmagier und Ritualisten vergangener Zeitalter – Überreste der Dunklen Ära, in der Magie gefürchtet und vergöttert zugleich war.  
Manche suchen Wissen, andere Macht – doch alle wissen: Wenn du das Geflecht berührst, berührt es dich zurück.

---

## **Übersicht**
Okkultisten sind **Zauberwirker des Verbotenen**, die ihre Kraft aus Ritualen, Blut, Symbolen und alten Pakten schöpfen.  
Sie kombinieren arkanes Wissen mit religiösen oder esoterischen Praktiken.  
Ihre Magie ist mächtig, aber gefährlich – für sich selbst und andere.

---

## **Rolle im Spiel**
Der Okkultist ist ein **Unterstützer und Kontrollzauberwirker** mit Zugriff auf seltene oder verbotene Kräfte.  
Er kann die Realität verzerren, Geister beschwören, Gedanken beeinflussen und Lebenskraft manipulieren.  
Seine Zauber sind oft riskant, aber wirkungsvoll – der Preis für Macht ist stets real.

---

## **Schlüsselattribut**
**Charisma** (Willenskraft, Präsenz) oder **Weisheit** (spirituelle Verbindung).  
Sekundär: **Konstitution** (Blutmagie, Ausdauer).

---

## **Trefferpunkte**
8 plus dein Konstitutionsmodifikator

---

## **Anfangsproficiencies**
| Kategorie | Grad |
|:--|:--|
| **Rüstung** | Keine |
| **Waffen** | Einfache Waffen, Dolche, Ritualklingen |
| **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |
| **Fertigkeiten** | Wahrnehmung (Geübt) |
| **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |
| **Klassenmerkmal** | Okkultes Wissen, Ritualmagie, Pfad der Macht |

---

## **Klassenmerkmale**

### **Okkultes Wissen**
Du kennst die verborgenen Symbole und Sprachen der alten Welt.  
Du erhältst Fertigkeitstraining in **Okkultismus** und **Religion**.  
Einmal pro Stunde kannst du eine Probe auf Arkane Kunde oder Religion wiederholen, wenn sie mit Ritualen, Geistern oder Flüchen zu tun hat.

---

### **Ritualmagie**
Du kannst Rituale durchführen, um mächtige, aber gefährliche Effekte zu erzielen.  
Ein Ritual dauert mindestens 10 Minuten und erfordert Komponenten im Wert von 1 GP pro Zaubergrad.  
Rituale können:  
- Geister beschwören (*Summon Spirit*),  
- Orte segnen oder verfluchen,  
- Erinnerung oder Emotionen verändern (*Suggestion*, *Calm Emotions*).  

Jedes Ritual birgt ein Risiko: Scheitert dein Wurf um 5 oder mehr, erleidest du 1W6 mentalen Schaden pro Zaubergrad.

---

### **Pfad der Macht (1. Stufe)**
Wähle, welche Quelle dich verändert hat.

#### **Blutpakt**
Du hast Macht durch Opfer erhalten.  
- Du erhältst Resistenz 2 gegen Blutungs- und Krankheitseffekte.  
- Du kannst 1 Mal pro Tag 1W4 TP opfern, um +1 auf einen Zauberwurf zu erhalten.  

#### **Geisterruf**
Du bist Medium zwischen den Welten.  
- Du erhältst Fertigkeitstraining in Diplomatie oder Einschüchtern.  
- Einmal pro Tag kannst du *Speak with Dead* wirken.  

#### **Schattenpakt**
Du hast einen Vertrag mit einem Wesen aus der Dunkelheit geschlossen.  
- Du erhältst Dunkelsicht.  
- Du kannst einmal pro Tag *Fear* wirken (Attribut: Charisma).  

#### **Runenpfad**
Du beherrschst uralte Zeichen, die Realität beeinflussen.  
- Du erhältst Fertigkeitstraining in Handwerk (Runen).  
- Du kannst einmal pro Stunde eine Rune aktivieren, die +1 auf AC oder Angriffe gewährt (1 Runde).

---

### **Okkulte Präsenz (3. Stufe)**
Deine Nähe verändert die Welt.  
Du erhältst +1 auf Einschüchtern und Diplomatie gegen religiöse oder magisch begabte Kreaturen.  
Wenn du einen Zauber wirkst, der Furcht oder Kontrolle verursacht, erhalten Ziele –1 auf ihren Rettungswurf.

---

### **Verbotene Kraft (7. Stufe)**
Du lernst, deine Macht zu verstärken – zum Preis deiner Vitalität.  
Einmal pro Tag kannst du beim Wirken eines Zaubers 1W8 TP opfern, um +2 auf SG und Schaden des Zaubers zu erhalten.

---

### **Seelenanker (11. Stufe)**
Dein Geist ist durch Schmerz gestählt.  
Du erhältst Resistenz 2 gegen mentale Effekte und bist immun gegen Furcht 1 Minute pro Tag (freie Aktion, 1/Tag).

---

### **Ruf der Tiefe (15. Stufe)**
Die Dunkelheit antwortet deinem Willen.  
Einmal pro Tag kannst du *Summon Entity* oder *Banish* wirken.  
Wenn du ein beschworenes Wesen kontrollierst, erhält es +1 auf Angriffe, solange du Schaden erleidest.

---

### **Verbotener Aufstieg (20. Stufe)**
Du bist kein Sterblicher mehr, sondern ein Knotenpunkt des Geflechts.  
Du erhältst:  
- Immunität gegen mentale und Furchteffekte,  
- Resistenz 5 gegen magischen Schaden,  
- und kannst einmal pro Tag *Wish* oder ein äquivalentes Ritual ausführen – doch jedes Mal steigt das Risiko, dauerhaft 1 Attributspunkt zu verlieren.

---

## **Klassen-Feats**

| Stufe | Name | Effekt |
|:--|:--|:--|
| **1** | Blutopfer | Du kannst 1W4 TP opfern, um +1 auf einen Zauberwurf zu erhalten. |
| **2** | Hexensinn | Du spürst aktive Magie und Flüche im Umkreis von 30 Fuß. |
| **4** | Dunkle Bindung | +1 auf Angriffe beschworener Wesen. |
| **6** | Runen der Macht | +1 auf Zauber-SGs, wenn du zuvor ein Ritual vollzogen hast. |
| **8** | Seelenflamme | Du kannst 1W6 Schaden verursachen, wenn du Schaden erleidest (1/Tag). |
| **10** | Blutmagie | Wenn du Schaden durch eigene Zauber erleidest, reduziere ihn um 1 pro Zaubergrad. |
| **12** | Doppelte Präsenz | Du kannst mit Geistern kommunizieren, die dich sehen, ohne zu sprechen. |
| **14** | Bannkreis | Du kannst 1/Tag einen Schutzkreis gegen eine Kreaturenart ziehen (SG 20). |
| **16** | Geisterarmee | Du kannst bis zu 2 beschworene Wesen gleichzeitig kontrollieren. |
| **18** | Verfluchter Wille | Wenn du 0 TP erreichst, kannst du einmal 1W10 TP zurückgewinnen (1/Tag). |
| **20** | Geflechtzerriss | Du kannst 1/Tag eine Zone instabiler Magie erschaffen (20 Fuß, 1 Minute). |

---

## **Archetypen**

### **Blutmagier**
Du opferst dich für Macht.  
Du erhältst +1 auf Zauber-SGs, wenn du bei der Vorbereitung 1W6 TP opferst.  
Einmal pro Woche kannst du ein Blutritual durchführen, das dir Resistenz 5 gegen Tod und Krankheit gibt (1 Tag).

### **Kultist**
Du bist Teil einer Sekte, die Wissen und Macht aus der Dunkelheit zieht.  
Du erhältst Fertigkeitstraining in Religion und Einschüchtern.  
Wenn du an einem Ritual mit anderen teilnimmst, erhöht sich dessen Effekt um +1 auf SG oder Schaden.

### **Grabrufpriester**
Du wandelst zwischen Leben und Tod.  
Du erhältst Fertigkeitstraining in Medizin und Religion.  
Einmal pro Tag kannst du einen gefallenen Verbündeten stabilisieren, ohne Materialkomponenten.

---

## **Beschreibung im Spiel**
Okkultisten sind gefährlich, faszinierend und tragisch. Sie nutzen Macht, die kein Mensch begreifen sollte, und zahlen dafür den Preis.  
Im Spiel sind sie ambivalente Figuren – Heiler oder Verderber, Wissende oder Wahnsinnige.  
Sie verkörpern die Grenze zwischen Ordnung und Chaos, Leben und Tod – und erinnern daran, dass Wissen immer Opfer verlangt.
