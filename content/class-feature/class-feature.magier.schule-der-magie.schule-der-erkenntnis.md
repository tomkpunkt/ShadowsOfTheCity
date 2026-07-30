---
choiceIds: []
classId: class.magier
editorialStatus: reviewed
effects:
  - grantType: spell
    id: spell.magie-erkennen
    kind: grant
    quantity: 1
  - bonusType: untyped
    kind: value
    operation: add
    scale: flat
    selector: skill.arcana
    target: skill
    value: 1
  - bonusType: untyped
    kind: value
    operation: add
    scale: flat
    target: perception
    value: 1
  - classification: partially-structured
    kind: text
    machineReadable: false
    text: Du suchst Wissen über Macht. - Du erhältst den Cantrip Detect Magic. - Du erhältst +1 auf Arkane Kunde und Wahrnehmung.
examples: []
id: class-feature.magier.schule-der-magie.schule-der-erkenntnis
legacy:
  notes: []
  paths:
    - classes/klasse_magier.md
level: 1
name: Schule der Erkenntnis
prerequisites: []
references: []
rulesText: "Du suchst Wissen über Macht.  \r

  - Du erhältst den Cantrip *Detect Magic*.  \r

  - Du erhältst +1 auf Arkane Kunde und Wahrnehmung."
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Du suchst Wissen über Macht.
traits:
  - trait.class-option
  - trait.class-option.magier.schule-der-magie
type: class-feature
---

Du suchst Wissen über Macht.  
- Du erhältst den Cantrip *Detect Magic*.  
- Du erhältst +1 auf Arkane Kunde und Wahrnehmung.
