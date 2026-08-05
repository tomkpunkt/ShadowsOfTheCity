---
choiceIds:
  - choice.schamane.geisterpfad
  - choice.class-feat.schamane.1
  - choice.class-feat.schamane.2
  - choice.class-feat.schamane.4
  - choice.class-feat.schamane.6
  - choice.class-feat.schamane.8
  - choice.class-feat.schamane.10
  - choice.class-feat.schamane.12
  - choice.class-feat.schamane.14
  - choice.class-feat.schamane.16
  - choice.class-feat.schamane.18
  - choice.class-feat.schamane.20
  - choice.class-skills.schamane
  - choice.class-spells.schamane
editorialStatus: reviewed
examples: []
featureIds:
  - class-feature.schamane.ahnenverbindung
  - class-feature.schamane.geisterpfad.pfad-des-wolfs
  - class-feature.schamane.geisterpfad.pfad-des-sturms
  - class-feature.schamane.geisterpfad.pfad-der-flamme
  - class-feature.schamane.geisterpfad.pfad-der-erde
  - class-feature.schamane.geisterpfad.pfad-des-geistes
  - class-feature.schamane.geisterpfad
  - class-feature.schamane.totemritual
  - class-feature.schamane.ahnensegen
  - class-feature.schamane.naturverbundenheit
  - class-feature.schamane.grosser-ruf
  - class-feature.schamane.wachter-der-ahnen
hpPerLevel: 8
id: class.schamane
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
legacy:
  notes:
    - Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing.
  paths:
    - classes/klasse_schamane.md
name: Schamane
references: []
rulesText: "# **Schamane**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Ich spreche mit dem Wind, und der Wind erinnert sich an dich.“\r

  \r

  Schamanen sind die Bewahrer des alten Wissens – Vermittler zwischen Körper und Geist, zwischen den Lebenden und den Ahnen.  \r

  Ihre Macht entspringt nicht Büchern oder Maschinen, sondern der Verbindung zur Welt selbst.  \r

  Im Zeitalter des Goldes (1990 n. 0) sind sie selten geworden, meist unter Orks, Halblingen oder isolierten Gemeinschaften zu finden. In einer Zeit, in der Magie fast verschwunden ist, verkörpern sie das, was von ihr bleibt – rein, wild und unerklärlich.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  Schamanen sind **spirituelle Zauberwirker**, die über Natur, Ahnen und Geister wirken.  \r

  Sie dienen als Heiler, Führer und Vermittler.  \r

  Ihre Magie ist instinktiv, nicht gelernt, und folgt den Stimmen des Geflechts selbst – den letzten Echos der Welt vor der Dunkelheit.\r

  \r

  ---\r

  \r

  ## **Rolle im Spiel**\r

  Der Schamane ist ein **Unterstützer und Heiler**, aber auch ein mächtiger Beschwörer.  \r

  Er verbindet Magie, Instinkt und Glauben zu einem einzigartigen, uralten Stil.  \r

  Er kann Geister rufen, die Natur beeinflussen und Wunden heilen – doch immer im Einklang mit der Balance.\r

  \r

  ---\r

  \r

  ## **Schlüsselattribut**\r

  **Weisheit** (spirituelle Verbindung, Einsicht).  \r

  Sekundär: **Konstitution** (Ausdauer) oder **Charisma** (Ahnenruf).\r

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

  | **Waffen** | Einfache Waffen, Stäbe, Speere, Schleudern |\r

  | **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |\r

  | **Fertigkeiten** | Wahrnehmung (Geübt) |\r

  | **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |\r

  | **Klassenmerkmal** | Ahnenverbindung, Geisterpfad, Totemritual |\r

  \r

  ---\r

  \r

  ## **Klassenmerkmale**\r

  \r

  ### **Ahnenverbindung**\r

  Du trägst die Stimmen deiner Ahnen in dir.  \r

  Einmal pro Tag kannst du bei einer Probe auf Überleben, Religion oder Diplomatie +2 hinzufügen, wenn du dich von ihnen leiten lässt.  \r

  Du erhältst Fertigkeitstraining in **Religion** und **Überleben**.\r

  \r

  ---\r

  \r

  ### **Geisterpfad (1. Stufe)**\r

  Wähle, welcher Geist dich leitet. Jeder Pfad bestimmt deine Zauber, Fähigkeiten und deinen Fokus.\r

  \r

  #### **Pfad des Wolfs**\r

  Du folgst dem Ruf der Jagd und der Gemeinschaft.  \r

  - Du erhältst Fertigkeitstraining in Heimlichkeit oder Diplomatie.  \r

  - Wenn du einen Verbündeten heilst, erhält dieser +1 auf Angriffswürfe für 1 Runde.  \r

  \r

  #### **Pfad des Sturms**\r

  Du verkörperst Zorn und Erneuerung.  \r

  - Du erhältst den Cantrip *Electric Arc* oder *Gust*.  \r

  - Wenn du einen Zauber mit Blitz- oder Windschaden wirkst, verursachst +1 Schaden.  \r

  \r

  #### **Pfad der Flamme**\r

  Du ehrst den Kreislauf von Zerstörung und Wiedergeburt.  \r

  - Du erhältst den Cantrip *Produce Flame*.  \r

  - Wenn du einen Gegner mit einem Feuerschaden-Zauber triffst, erhältst 1 TP Heilung.  \r

  \r

  #### **Pfad der Erde**\r

  Du bist fest verwurzelt in der Welt.  \r

  - Du erhältst den Cantrip *Tanglefoot*.  \r

  - Du erhältst Resistenz 2 gegen physische Schäden.  \r

  \r

  #### **Pfad des Geistes**\r

  Du bist Medium zwischen den Welten.  \r

  - Du erhältst Fertigkeitstraining in Diplomatie oder Einschüchtern.  \r

  - Du kannst einmal pro Tag *Speak with Spirits* oder *Detect Magic* wirken.\r

  \r

  ---\r

  \r

  ### **Totemritual (3. Stufe)**\r

  Du trägst ein Totem oder ein Symbol, das dich mit deinem Geist verbindet.  \r

  Wenn du ein Ritual mit einem Totem durchführst, erhältst +1 auf den Zauberwurf und kannst Verbündeten in 10 Fuß +1 auf Willenswürfe gewähren (1 Minute).  \r

  Das Ritual kann 10 Minuten dauern und hat keine Kosten.\r

  \r

  ---\r

  \r

  ### **Ahnensegen (7. Stufe)**\r

  Deine Ahnen schützen dich.  \r

  Einmal pro Tag kannst du einen misslungenen Willenswurf wiederholen.  \r

  Wenn du dies tust, erscheint ein geisterhafter Schimmer um dich.  \r

  Außerdem erhältst du Resistenz 2 gegen mentale Effekte.\r

  \r

  ---\r

  \r

  ### **Naturverbundenheit (11. Stufe)**\r

  Du bist eins mit deiner Umgebung.  \r

  Du erhältst +2 auf Überleben und Wahrnehmung in der Natur.  \r

  Einmal pro Tag kannst du *Entangle* oder *Water Walk* wirken, ohne Materialien.\r

  \r

  ---\r

  \r

  ### **Großer Ruf (15. Stufe)**\r

  Du kannst die Macht deines Geistes vollständig entfesseln.  \r

  Einmal pro Tag kannst du eine Manifestation beschwören, die 1 Minute anhält.  \r

  - **Wolf:** Verbündete erhalten +1 auf Schaden.  \r

  - **Sturm:** Gegner in 10 Fuß erleiden 1W6 Elektrizitätsschaden pro 2 Stufen.  \r

  - **Flamme:** Gegner, die dich treffen, erleiden 1W4 Feuerschaden.  \r

  - **Erde:** Du erhältst Resistenz 5 gegen physischen Schaden.  \r

  - **Geist:** Du kannst mit allen Kreaturen in 30 Fuß telepathisch kommunizieren.  \r

  \r

  ---\r

  \r

  ### **Wächter der Ahnen (20. Stufe)**\r

  Dein Geist verschmilzt mit dem deiner Vorfahren.  \r

  Du erhältst:  \r

  - Immunität gegen Furcht und mentale Effekte,  \r

  - Resistenz 5 gegen Elementarschaden,  \r

  - und kannst einmal pro Tag *Resurrect* oder *Nature’s Avatar* wirken, ohne Materialien.  \r

  Wenn du stirbst, bleibt dein Geist 1 Minute lang als schützende Präsenz bestehen (+1 auf alle Würfe deiner Verbündeten).\r

  \r

  ---\r

  \r

  ## **Klassen-Feats**\r

  \r

  | Stufe | Name | Effekt |\r

  |:--|:--|:--|\r

  | **1** | Totem der Heilung | +1 auf Heilzauber, die du auf andere wirkst. |\r

  | **2** | Geisterblick | Du kannst Geister, Illusionen und magische Auren sehen. |\r

  | **4** | Natürliche Führung | +2 auf Diplomatie gegen Tiere oder Naturgeister. |\r

  | **6** | Ahnenschrei | Du kannst 1/Tag einen Gegner mit einem Geisterruf in Furcht versetzen (SG 20). |\r

  | **8** | Lebende Erde | Wenn du stillstehst, erhältst Resistenz 2 gegen physischen Schaden. |\r

  | **10** | Sturmläufer | Du ignorierst schwieriges Gelände durch Wind oder Wasser. |\r

  | **12** | Flammenbote | +1 auf alle Feuerschaden-Zauber. |\r

  | **14** | Erdenhüter | Du erhältst 1W8 Heilung, wenn du Zauber der Natur wirkst. |\r

  | **16** | Geistwächter | Du kannst 1 Geistwesen dauerhaft an dich binden (Bonus auf Initiative +1). |\r

  | **18** | Ewiger Zyklus | Wenn du stirbst, hinterlässt du eine heilende Aura (1W6 pro Runde, 1 Minute). |\r

  | **20** | Stimme der Welt | Du kannst 1/Tag direkt mit dem Geflecht sprechen (freie Vision oder Weissagung). |\r

  \r

  ---\r

  \r

  ## **Archetypen**\r

  \r

  ### **Ahnenrufer**\r

  Du rufst Geister vergangener Krieger oder Heiler.  \r

  Einmal pro Tag kannst du *Summon Spirit* oder *Bless* wirken.  \r

  Wenn du einen Geist rufst, erhältst +1 auf Angriff und Schaden für 1 Minute.\r

  \r

  ### **Heilpfad-Wächter**\r

  Du konzentrierst dich auf das Leben.  \r

  Du erhältst Fertigkeitstraining in Medizin und +2 auf Heilungszauber.  \r

  Wenn du erfolgreich stabilisierst, heilt das Ziel 1W4 zusätzliche TP.\r

  \r

  ### **Naturwandler**\r

  Du verschmilzt mit der Umwelt.  \r

  Einmal pro Tag kannst du dich 10 Minuten lang in einen Tiergeist verwandeln (+10 Fuß Bewegung, +2 auf Wahrnehmung).  \r

  Du erhältst +1 auf Heimlichkeit in natürlicher Umgebung.\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  Schamanen sind die letzten echten Stimmen der alten Welt. Sie sind weder Magier noch Priester, sondern Brücken zwischen dem, was war, und dem, was kommt.  \r

  Im Spiel verkörpern sie Harmonie, Opfer und Weisheit – aber auch Isolation und den Schmerz des Wissens.  \r

  Ein Schamane ist nie nur Zauberwirker – er ist **das Gewissen der Welt**."
schemaVersion: 1
source: legacy.world-rules
spellcastingProgressionId: spellcasting.primal-prepared
status: legacy
summary: Schamanen sind die Bewahrer des alten Wissens – Vermittler zwischen Körper und Geist, zwischen den Lebenden und den Ahnen.
trainedSkillChoices: 4
traits: []
type: class
---

# **Schamane**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**
> „Ich spreche mit dem Wind, und der Wind erinnert sich an dich.“

Schamanen sind die Bewahrer des alten Wissens – Vermittler zwischen Körper und Geist, zwischen den Lebenden und den Ahnen.  
Ihre Macht entspringt nicht Büchern oder Maschinen, sondern der Verbindung zur Welt selbst.  
Im Zeitalter des Goldes (1990 n. 0) sind sie selten geworden, meist unter Orks, Halblingen oder isolierten Gemeinschaften zu finden. In einer Zeit, in der Magie fast verschwunden ist, verkörpern sie das, was von ihr bleibt – rein, wild und unerklärlich.

---

## **Übersicht**
Schamanen sind **spirituelle Zauberwirker**, die über Natur, Ahnen und Geister wirken.  
Sie dienen als Heiler, Führer und Vermittler.  
Ihre Magie ist instinktiv, nicht gelernt, und folgt den Stimmen des Geflechts selbst – den letzten Echos der Welt vor der Dunkelheit.

---

## **Rolle im Spiel**
Der Schamane ist ein **Unterstützer und Heiler**, aber auch ein mächtiger Beschwörer.  
Er verbindet Magie, Instinkt und Glauben zu einem einzigartigen, uralten Stil.  
Er kann Geister rufen, die Natur beeinflussen und Wunden heilen – doch immer im Einklang mit der Balance.

---

## **Schlüsselattribut**
**Weisheit** (spirituelle Verbindung, Einsicht).  
Sekundär: **Konstitution** (Ausdauer) oder **Charisma** (Ahnenruf).

---

## **Trefferpunkte**
8 plus dein Konstitutionsmodifikator

---

## **Anfangsproficiencies**
| Kategorie | Grad |
|:--|:--|
| **Rüstung** | Leichte Rüstung |
| **Waffen** | Einfache Waffen, Stäbe, Speere, Schleudern |
| **Rettungswürfe** | Willen (Experte), Zähigkeit (Geübt), Reflex (Geübt) |
| **Fertigkeiten** | Wahrnehmung (Geübt) |
| **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |
| **Klassenmerkmal** | Ahnenverbindung, Geisterpfad, Totemritual |

---

## **Klassenmerkmale**

### **Ahnenverbindung**
Du trägst die Stimmen deiner Ahnen in dir.  
Einmal pro Tag kannst du bei einer Probe auf Überleben, Religion oder Diplomatie +2 hinzufügen, wenn du dich von ihnen leiten lässt.  
Du erhältst Fertigkeitstraining in **Religion** und **Überleben**.

---

### **Geisterpfad (1. Stufe)**
Wähle, welcher Geist dich leitet. Jeder Pfad bestimmt deine Zauber, Fähigkeiten und deinen Fokus.

#### **Pfad des Wolfs**
Du folgst dem Ruf der Jagd und der Gemeinschaft.  
- Du erhältst Fertigkeitstraining in Heimlichkeit oder Diplomatie.  
- Wenn du einen Verbündeten heilst, erhält dieser +1 auf Angriffswürfe für 1 Runde.  

#### **Pfad des Sturms**
Du verkörperst Zorn und Erneuerung.  
- Du erhältst den Cantrip *Electric Arc* oder *Gust*.  
- Wenn du einen Zauber mit Blitz- oder Windschaden wirkst, verursachst +1 Schaden.  

#### **Pfad der Flamme**
Du ehrst den Kreislauf von Zerstörung und Wiedergeburt.  
- Du erhältst den Cantrip *Produce Flame*.  
- Wenn du einen Gegner mit einem Feuerschaden-Zauber triffst, erhältst 1 TP Heilung.  

#### **Pfad der Erde**
Du bist fest verwurzelt in der Welt.  
- Du erhältst den Cantrip *Tanglefoot*.  
- Du erhältst Resistenz 2 gegen physische Schäden.  

#### **Pfad des Geistes**
Du bist Medium zwischen den Welten.  
- Du erhältst Fertigkeitstraining in Diplomatie oder Einschüchtern.  
- Du kannst einmal pro Tag *Speak with Spirits* oder *Detect Magic* wirken.

---

### **Totemritual (3. Stufe)**
Du trägst ein Totem oder ein Symbol, das dich mit deinem Geist verbindet.  
Wenn du ein Ritual mit einem Totem durchführst, erhältst +1 auf den Zauberwurf und kannst Verbündeten in 10 Fuß +1 auf Willenswürfe gewähren (1 Minute).  
Das Ritual kann 10 Minuten dauern und hat keine Kosten.

---

### **Ahnensegen (7. Stufe)**
Deine Ahnen schützen dich.  
Einmal pro Tag kannst du einen misslungenen Willenswurf wiederholen.  
Wenn du dies tust, erscheint ein geisterhafter Schimmer um dich.  
Außerdem erhältst du Resistenz 2 gegen mentale Effekte.

---

### **Naturverbundenheit (11. Stufe)**
Du bist eins mit deiner Umgebung.  
Du erhältst +2 auf Überleben und Wahrnehmung in der Natur.  
Einmal pro Tag kannst du *Entangle* oder *Water Walk* wirken, ohne Materialien.

---

### **Großer Ruf (15. Stufe)**
Du kannst die Macht deines Geistes vollständig entfesseln.  
Einmal pro Tag kannst du eine Manifestation beschwören, die 1 Minute anhält.  
- **Wolf:** Verbündete erhalten +1 auf Schaden.  
- **Sturm:** Gegner in 10 Fuß erleiden 1W6 Elektrizitätsschaden pro 2 Stufen.  
- **Flamme:** Gegner, die dich treffen, erleiden 1W4 Feuerschaden.  
- **Erde:** Du erhältst Resistenz 5 gegen physischen Schaden.  
- **Geist:** Du kannst mit allen Kreaturen in 30 Fuß telepathisch kommunizieren.  

---

### **Wächter der Ahnen (20. Stufe)**
Dein Geist verschmilzt mit dem deiner Vorfahren.  
Du erhältst:  
- Immunität gegen Furcht und mentale Effekte,  
- Resistenz 5 gegen Elementarschaden,  
- und kannst einmal pro Tag *Resurrect* oder *Nature’s Avatar* wirken, ohne Materialien.  
Wenn du stirbst, bleibt dein Geist 1 Minute lang als schützende Präsenz bestehen (+1 auf alle Würfe deiner Verbündeten).

---

## **Klassen-Feats**

| Stufe | Name | Effekt |
|:--|:--|:--|
| **1** | Totem der Heilung | +1 auf Heilzauber, die du auf andere wirkst. |
| **2** | Geisterblick | Du kannst Geister, Illusionen und magische Auren sehen. |
| **4** | Natürliche Führung | +2 auf Diplomatie gegen Tiere oder Naturgeister. |
| **6** | Ahnenschrei | Du kannst 1/Tag einen Gegner mit einem Geisterruf in Furcht versetzen (SG 20). |
| **8** | Lebende Erde | Wenn du stillstehst, erhältst Resistenz 2 gegen physischen Schaden. |
| **10** | Sturmläufer | Du ignorierst schwieriges Gelände durch Wind oder Wasser. |
| **12** | Flammenbote | +1 auf alle Feuerschaden-Zauber. |
| **14** | Erdenhüter | Du erhältst 1W8 Heilung, wenn du Zauber der Natur wirkst. |
| **16** | Geistwächter | Du kannst 1 Geistwesen dauerhaft an dich binden (Bonus auf Initiative +1). |
| **18** | Ewiger Zyklus | Wenn du stirbst, hinterlässt du eine heilende Aura (1W6 pro Runde, 1 Minute). |
| **20** | Stimme der Welt | Du kannst 1/Tag direkt mit dem Geflecht sprechen (freie Vision oder Weissagung). |

---

## **Archetypen**

### **Ahnenrufer**
Du rufst Geister vergangener Krieger oder Heiler.  
Einmal pro Tag kannst du *Summon Spirit* oder *Bless* wirken.  
Wenn du einen Geist rufst, erhältst +1 auf Angriff und Schaden für 1 Minute.

### **Heilpfad-Wächter**
Du konzentrierst dich auf das Leben.  
Du erhältst Fertigkeitstraining in Medizin und +2 auf Heilungszauber.  
Wenn du erfolgreich stabilisierst, heilt das Ziel 1W4 zusätzliche TP.

### **Naturwandler**
Du verschmilzt mit der Umwelt.  
Einmal pro Tag kannst du dich 10 Minuten lang in einen Tiergeist verwandeln (+10 Fuß Bewegung, +2 auf Wahrnehmung).  
Du erhältst +1 auf Heimlichkeit in natürlicher Umgebung.

---

## **Beschreibung im Spiel**
Schamanen sind die letzten echten Stimmen der alten Welt. Sie sind weder Magier noch Priester, sondern Brücken zwischen dem, was war, und dem, was kommt.  
Im Spiel verkörpern sie Harmonie, Opfer und Weisheit – aber auch Isolation und den Schmerz des Wissens.  
Ein Schamane ist nie nur Zauberwirker – er ist **das Gewissen der Welt**.
