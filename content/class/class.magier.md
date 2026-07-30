---
choiceIds:
  - choice.magier.schule-der-magie
  - choice.class-feat.magier.1
  - choice.class-feat.magier.2
  - choice.class-feat.magier.4
  - choice.class-feat.magier.6
  - choice.class-feat.magier.8
  - choice.class-feat.magier.10
  - choice.class-feat.magier.12
  - choice.class-feat.magier.14
  - choice.class-feat.magier.16
  - choice.class-feat.magier.18
  - choice.class-feat.magier.20
  - choice.class-skills.magier
  - choice.class-spells.magier
editorialStatus: reviewed
examples: []
featureIds:
  - class-feature.magier.arkanes-studium
  - class-feature.magier.zauberbuch
  - class-feature.magier.schule-der-magie.schule-der-elemente
  - class-feature.magier.schule-der-magie.schule-der-erkenntnis
  - class-feature.magier.schule-der-magie.schule-der-schatten
  - class-feature.magier.schule-der-magie.schule-des-schutzes
  - class-feature.magier.schule-der-magie
  - class-feature.magier.arkaner-fokus
  - class-feature.magier.zaubererweiterung
  - class-feature.magier.geflechtverstandnis
  - class-feature.magier.arkane-meisterschaft
  - class-feature.magier.huter-des-wissens
hpPerLevel: 6
id: class.magier
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
  - intelligence
legacy:
  notes:
    - Freie Anfangsproficiencies bleiben im Legacy-Text erhalten und benötigen Balancing.
  paths:
    - classes/klasse_magier.md
name: Magier
references: []
rulesText: "# **Magier**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Das Geflecht ist kein Werkzeug – es ist eine Sprache. Wer sie spricht, verändert die Welt.“\r

  \r

  Magier sind die Erben des alten Wissens – jene wenigen, die die Sprache der Magie noch verstehen. In einer Welt, die sich auf Maschinen und Stahl verlässt, sind sie Relikte und zugleich Vorboten.  \r

  Ein einziger Zauber kann ganze Städte erschüttern – und deshalb fürchten die Mächte der Welt jeden, der das Geflecht berührt.  \r

  Ob an den Universitäten der Föderation, in den Archiven der Elfenhäuser oder als einsame Wanderer, Magier sind Forscher, Lehrer, Ketzer – und die letzten Hüter des wahren Wissens.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  Magier sind **intellektuelle Zauberwirker**, die das magische Geflecht wissenschaftlich untersuchen und manipulieren.  \r

  Sie stehen zwischen Vergangenheit und Moderne, zwischen Forschung und Verbot.  \r

  In der Ära des Goldes sind sie selten, überwacht und zugleich unersetzlich – denn niemand versteht die Risse im Geflecht besser als sie.\r

  \r

  ---\r

  \r

  ## **Rolle im Spiel**\r

  Der Magier ist der **klassische Zauberwirker**. Seine Macht liegt in Vorbereitung, Wissen und Disziplin.  \r

  Er kann mächtige arkane Effekte wirken, Feinde vernichten, Verbündete stärken oder die Realität selbst verändern – solange er das Gleichgewicht wahrt.\r

  \r

  ---\r

  \r

  ## **Schlüsselattribut**\r

  **Intelligenz** (Zauberwirken, Wissen).  \r

  Sekundär: **Weisheit** (Erkenntnis) oder **Charisma** (Überzeugung).\r

  \r

  ---\r

  \r

  ## **Trefferpunkte**\r

  6 plus dein Konstitutionsmodifikator\r

  \r

  ---\r

  \r

  ## **Anfangsproficiencies**\r

  | Kategorie | Grad |\r

  |:--|:--|\r

  | **Rüstung** | Keine |\r

  | **Waffen** | Einfache Waffen (Stäbe, Dolche, Schleudern) |\r

  | **Rettungswürfe** | Willen (Experte), Reflex (Geübt), Zähigkeit (Geübt) |\r

  | **Fertigkeiten** | Wahrnehmung (Geübt) |\r

  | **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |\r

  | **Klassenmerkmal** | Arkanes Studium, Zauberbuch, Schule der Magie |\r

  \r

  ---\r

  \r

  ## **Klassenmerkmale**\r

  \r

  ### **Arkanes Studium**\r

  Du hast jahrelang das Geflecht studiert.  \r

  Du erhältst Fertigkeitstraining in **Arkane Kunde** und **Wissenschaft**. Wenn du bereits in einem dieser Bereiche trainiert bist, wähle eine andere Wissensfertigkeit.  \r

  Zusätzlich kannst du die Präsenz aktiver Magie in einem Umkreis von 30 Fuß automatisch spüren.\r

  \r

  ---\r

  \r

  ### **Zauberbuch**\r

  Du besitzt ein persönliches Grimoire, in dem du Zauberformeln, Notizen und Theorien aufzeichnest.  \r

  **Effekt:** Du kannst Zauber aus deinem Buch vorbereiten, indem du 10 Minuten pro Zaubergrad meditierst.  \r

  Du kannst täglich eine Anzahl an Zaubern vorbereiten, die deiner **Stufe + INT-Modifikator** entspricht.  \r

  Wenn du dein Zauberbuch verlierst, kannst du es in einer Woche neu rekonstruieren, sofern du Zugang zu Materialien und Notizen hast.\r

  \r

  ---\r

  \r

  ### **Schule der Magie (1. Stufe)**\r

  Wähle deine Spezialisierung innerhalb des Geflechts. Jede Schule bietet einzigartige Boni.\r

  \r

  #### **Schule der Elemente**\r

  Du kanalisiert rohe Energie.  \r

  - Du erhältst den Cantrip *Produce Flame* oder *Electric Arc*.  \r

  - Wenn du einen Zauber wirkst, der Schaden verursacht, erhältst +1 auf den Schadenswurf.\r

  \r

  #### **Schule der Erkenntnis**\r

  Du suchst Wissen über Macht.  \r

  - Du erhältst den Cantrip *Detect Magic*.  \r

  - Du erhältst +1 auf Arkane Kunde und Wahrnehmung.  \r

  \r

  #### **Schule der Schatten**\r

  Du nutzt das Unsichtbare als Waffe.  \r

  - Du erhältst den Cantrip *Daze* oder *Message*.  \r

  - Einmal pro Stunde kannst du dich für 1 Runde teilweise unsichtbar machen (Heimlichkeitsbonus +2).  \r

  \r

  #### **Schule des Schutzes**\r

  Du webst Energie in Schilde und Barrieren.  \r

  - Du erhältst den Cantrip *Shield*.  \r

  - Du erhältst +1 auf Rettungswürfe gegen magische Effekte.  \r

  \r

  ---\r

  \r

  ### **Arkaner Fokus (3. Stufe)**\r

  Du kannst Magie durch ein Artefakt, einen Ring oder ein Symbol kanalisieren.  \r

  Wenn du einen Zauber wirkst, der Schaden oder Heilung verursacht, kannst du einmal pro Runde +1 auf den Effektwurf addieren.  \r

  Wenn dein Fokus zerstört wird, kannst du ihn innerhalb einer Stunde neu binden.\r

  \r

  ---\r

  \r

  ### **Zaubererweiterung (7. Stufe)**\r

  Du lernst, Magie auf neue Weise zu verweben.  \r

  Einmal pro Tag kannst du einen bekannten Zauber spontan auf einen höheren Grad wirken, ohne ihn vorzubereiten.\r

  \r

  ---\r

  \r

  ### **Geflechtverständnis (11. Stufe)**\r

  Du begreifst die Strömungen des Unsichtbaren.  \r

  Du erhältst Resistenz 2 gegen arkane Effekte und kannst *Detect Magic* unbegrenzt oft wirken.  \r

  Außerdem erkennst du magische Instabilitäten automatisch (SG 15).\r

  \r

  ---\r

  \r

  ### **Arkane Meisterschaft (15. Stufe)**\r

  Deine Kontrolle über das Geflecht ist nahezu perfekt.  \r

  Einmal pro Tag kannst du einen Zauber ohne Materialkomponenten wirken.  \r

  Zauber mit einer Wirkzeit von „1 Minute“ oder weniger kannst du in 3 Aktionen wirken.\r

  \r

  ---\r

  \r

  ### **Hüter des Wissens (20. Stufe)**\r

  Dein Name ist in den geheimen Archiven der Welt vermerkt.  \r

  Du erhältst:  \r

  - Resistenz 5 gegen magischen Schaden,  \r

  - Immunität gegen geistige Kontrolle,  \r

  - und die Fähigkeit, *Dispel Magic* einmal pro Stunde kostenlos zu wirken.\r

  \r

  ---\r

  \r

  ## **Klassen-Feats**\r

  \r

  | Stufe | Name | Effekt |\r

  |:--|:--|:--|\r

  | **1** | Arkaner Schild | Du erhältst +1 auf AC gegen magische Angriffe. |\r

  | **2** | Ritualist | Du kannst Rituale doppelt so schnell ausführen. |\r

  | **4** | Magische Theorie | +1 auf Würfe mit Arkane Kunde. |\r

  | **6** | Konzentrationsmeister | Wenn du beim Wirken eines Zaubers Schaden erleidest, +2 auf den Konzentrationswurf. |\r

  | **8** | Doppelte Formel | Du kannst zwei verschiedene Cantrips gleichzeitig vorbereiten. |\r

  | **10** | Arkane Verbindung | Du kannst über dein Geflecht mit einem bekannten Magier kommunizieren. |\r

  | **12** | Verbesserter Fokus | +2 auf Schadenswürfe von Zaubern deines Spezialgebiets. |\r

  | **14** | Geflechtsresonanz | Du kannst einmal pro Tag einen Zauber, der dich betrifft, reflektieren (Willenswurf SG 20). |\r

  | **16** | Zauberfluss | Du kannst 2 Zauber pro Runde wirken, solange einer ein Cantrip ist. |\r

  | **18** | Arkaner Sturm | Du kannst alle Gegner in 20 Fuß 1W6 Schaden pro Zaubergrad erleiden lassen (1/Tag). |\r

  | **20** | Meister des Geflechts | Du bist immun gegen Magieunterdrückung und Zauberresistenz. |\r

  \r

  ---\r

  \r

  ## **Archetypen**\r

  \r

  ### **Akademiker der Föderation**\r

  Du bist Gelehrter einer Universität oder Forschungsanstalt.  \r

  Du erhältst Fertigkeitstraining in Wissenschaft und Gesellschaft.  \r

  Einmal pro Woche kannst du auf Bibliotheksressourcen zugreifen, um eine Wissensprobe automatisch erfolgreich zu machen.\r

  \r

  ### **Einsiedler des Südblocks**\r

  Du hast das Studium der Magie fern der Welt betrieben.  \r

  Du erhältst +1 auf Überleben und Weisheitssaves gegen mentale Effekte.  \r

  Einmal pro Tag kannst du *Detect Magic* und *Light* ohne Komponenten wirken.\r

  \r

  ### **Ratsschüler**\r

  Du wurdest in einem elfischen Zirkel des Gleichgewichts ausgebildet.  \r

  Du erhältst Fertigkeitstraining in Diplomatie und Arkane Kunde.  \r

  Wenn du einen Zauber wirkst, der Gleichgewicht oder Stabilität betrifft, erhältst +1 auf den SG.\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  Magier sind die Brücke zwischen altem Wissen und moderner Vernunft.  \r

  Sie sind Forscher, Ketzer, Idealisten und Monsterjäger zugleich.  \r

  Im Spiel verkörpern sie das Streben nach Erkenntnis – und den ewigen Kampf zwischen Macht und Verantwortung."
schemaVersion: 1
source: legacy.world-rules
spellcastingProgressionId: spellcasting.arcane-prepared
status: legacy
summary: Magier sind die Erben des alten Wissens – jene wenigen, die die Sprache der Magie noch verstehen.
trainedSkillChoices: 4
traits: []
type: class
---

# **Magier**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**
> „Das Geflecht ist kein Werkzeug – es ist eine Sprache. Wer sie spricht, verändert die Welt.“

Magier sind die Erben des alten Wissens – jene wenigen, die die Sprache der Magie noch verstehen. In einer Welt, die sich auf Maschinen und Stahl verlässt, sind sie Relikte und zugleich Vorboten.  
Ein einziger Zauber kann ganze Städte erschüttern – und deshalb fürchten die Mächte der Welt jeden, der das Geflecht berührt.  
Ob an den Universitäten der Föderation, in den Archiven der Elfenhäuser oder als einsame Wanderer, Magier sind Forscher, Lehrer, Ketzer – und die letzten Hüter des wahren Wissens.

---

## **Übersicht**
Magier sind **intellektuelle Zauberwirker**, die das magische Geflecht wissenschaftlich untersuchen und manipulieren.  
Sie stehen zwischen Vergangenheit und Moderne, zwischen Forschung und Verbot.  
In der Ära des Goldes sind sie selten, überwacht und zugleich unersetzlich – denn niemand versteht die Risse im Geflecht besser als sie.

---

## **Rolle im Spiel**
Der Magier ist der **klassische Zauberwirker**. Seine Macht liegt in Vorbereitung, Wissen und Disziplin.  
Er kann mächtige arkane Effekte wirken, Feinde vernichten, Verbündete stärken oder die Realität selbst verändern – solange er das Gleichgewicht wahrt.

---

## **Schlüsselattribut**
**Intelligenz** (Zauberwirken, Wissen).  
Sekundär: **Weisheit** (Erkenntnis) oder **Charisma** (Überzeugung).

---

## **Trefferpunkte**
6 plus dein Konstitutionsmodifikator

---

## **Anfangsproficiencies**
| Kategorie | Grad |
|:--|:--|
| **Rüstung** | Keine |
| **Waffen** | Einfache Waffen (Stäbe, Dolche, Schleudern) |
| **Rettungswürfe** | Willen (Experte), Reflex (Geübt), Zähigkeit (Geübt) |
| **Fertigkeiten** | Wahrnehmung (Geübt) |
| **Fertigkeiten pro Stufe** | 4 + INT-Modifikator |
| **Klassenmerkmal** | Arkanes Studium, Zauberbuch, Schule der Magie |

---

## **Klassenmerkmale**

### **Arkanes Studium**
Du hast jahrelang das Geflecht studiert.  
Du erhältst Fertigkeitstraining in **Arkane Kunde** und **Wissenschaft**. Wenn du bereits in einem dieser Bereiche trainiert bist, wähle eine andere Wissensfertigkeit.  
Zusätzlich kannst du die Präsenz aktiver Magie in einem Umkreis von 30 Fuß automatisch spüren.

---

### **Zauberbuch**
Du besitzt ein persönliches Grimoire, in dem du Zauberformeln, Notizen und Theorien aufzeichnest.  
**Effekt:** Du kannst Zauber aus deinem Buch vorbereiten, indem du 10 Minuten pro Zaubergrad meditierst.  
Du kannst täglich eine Anzahl an Zaubern vorbereiten, die deiner **Stufe + INT-Modifikator** entspricht.  
Wenn du dein Zauberbuch verlierst, kannst du es in einer Woche neu rekonstruieren, sofern du Zugang zu Materialien und Notizen hast.

---

### **Schule der Magie (1. Stufe)**
Wähle deine Spezialisierung innerhalb des Geflechts. Jede Schule bietet einzigartige Boni.

#### **Schule der Elemente**
Du kanalisiert rohe Energie.  
- Du erhältst den Cantrip *Produce Flame* oder *Electric Arc*.  
- Wenn du einen Zauber wirkst, der Schaden verursacht, erhältst +1 auf den Schadenswurf.

#### **Schule der Erkenntnis**
Du suchst Wissen über Macht.  
- Du erhältst den Cantrip *Detect Magic*.  
- Du erhältst +1 auf Arkane Kunde und Wahrnehmung.  

#### **Schule der Schatten**
Du nutzt das Unsichtbare als Waffe.  
- Du erhältst den Cantrip *Daze* oder *Message*.  
- Einmal pro Stunde kannst du dich für 1 Runde teilweise unsichtbar machen (Heimlichkeitsbonus +2).  

#### **Schule des Schutzes**
Du webst Energie in Schilde und Barrieren.  
- Du erhältst den Cantrip *Shield*.  
- Du erhältst +1 auf Rettungswürfe gegen magische Effekte.  

---

### **Arkaner Fokus (3. Stufe)**
Du kannst Magie durch ein Artefakt, einen Ring oder ein Symbol kanalisieren.  
Wenn du einen Zauber wirkst, der Schaden oder Heilung verursacht, kannst du einmal pro Runde +1 auf den Effektwurf addieren.  
Wenn dein Fokus zerstört wird, kannst du ihn innerhalb einer Stunde neu binden.

---

### **Zaubererweiterung (7. Stufe)**
Du lernst, Magie auf neue Weise zu verweben.  
Einmal pro Tag kannst du einen bekannten Zauber spontan auf einen höheren Grad wirken, ohne ihn vorzubereiten.

---

### **Geflechtverständnis (11. Stufe)**
Du begreifst die Strömungen des Unsichtbaren.  
Du erhältst Resistenz 2 gegen arkane Effekte und kannst *Detect Magic* unbegrenzt oft wirken.  
Außerdem erkennst du magische Instabilitäten automatisch (SG 15).

---

### **Arkane Meisterschaft (15. Stufe)**
Deine Kontrolle über das Geflecht ist nahezu perfekt.  
Einmal pro Tag kannst du einen Zauber ohne Materialkomponenten wirken.  
Zauber mit einer Wirkzeit von „1 Minute“ oder weniger kannst du in 3 Aktionen wirken.

---

### **Hüter des Wissens (20. Stufe)**
Dein Name ist in den geheimen Archiven der Welt vermerkt.  
Du erhältst:  
- Resistenz 5 gegen magischen Schaden,  
- Immunität gegen geistige Kontrolle,  
- und die Fähigkeit, *Dispel Magic* einmal pro Stunde kostenlos zu wirken.

---

## **Klassen-Feats**

| Stufe | Name | Effekt |
|:--|:--|:--|
| **1** | Arkaner Schild | Du erhältst +1 auf AC gegen magische Angriffe. |
| **2** | Ritualist | Du kannst Rituale doppelt so schnell ausführen. |
| **4** | Magische Theorie | +1 auf Würfe mit Arkane Kunde. |
| **6** | Konzentrationsmeister | Wenn du beim Wirken eines Zaubers Schaden erleidest, +2 auf den Konzentrationswurf. |
| **8** | Doppelte Formel | Du kannst zwei verschiedene Cantrips gleichzeitig vorbereiten. |
| **10** | Arkane Verbindung | Du kannst über dein Geflecht mit einem bekannten Magier kommunizieren. |
| **12** | Verbesserter Fokus | +2 auf Schadenswürfe von Zaubern deines Spezialgebiets. |
| **14** | Geflechtsresonanz | Du kannst einmal pro Tag einen Zauber, der dich betrifft, reflektieren (Willenswurf SG 20). |
| **16** | Zauberfluss | Du kannst 2 Zauber pro Runde wirken, solange einer ein Cantrip ist. |
| **18** | Arkaner Sturm | Du kannst alle Gegner in 20 Fuß 1W6 Schaden pro Zaubergrad erleiden lassen (1/Tag). |
| **20** | Meister des Geflechts | Du bist immun gegen Magieunterdrückung und Zauberresistenz. |

---

## **Archetypen**

### **Akademiker der Föderation**
Du bist Gelehrter einer Universität oder Forschungsanstalt.  
Du erhältst Fertigkeitstraining in Wissenschaft und Gesellschaft.  
Einmal pro Woche kannst du auf Bibliotheksressourcen zugreifen, um eine Wissensprobe automatisch erfolgreich zu machen.

### **Einsiedler des Südblocks**
Du hast das Studium der Magie fern der Welt betrieben.  
Du erhältst +1 auf Überleben und Weisheitssaves gegen mentale Effekte.  
Einmal pro Tag kannst du *Detect Magic* und *Light* ohne Komponenten wirken.

### **Ratsschüler**
Du wurdest in einem elfischen Zirkel des Gleichgewichts ausgebildet.  
Du erhältst Fertigkeitstraining in Diplomatie und Arkane Kunde.  
Wenn du einen Zauber wirkst, der Gleichgewicht oder Stabilität betrifft, erhältst +1 auf den SG.

---

## **Beschreibung im Spiel**
Magier sind die Brücke zwischen altem Wissen und moderner Vernunft.  
Sie sind Forscher, Ketzer, Idealisten und Monsterjäger zugleich.  
Im Spiel verkörpern sie das Streben nach Erkenntnis – und den ewigen Kampf zwischen Macht und Verantwortung.
