---
choice:
  effects: []
  excludes: []
  filter:
    classId: class.mediziner
    entityTypes:
      - class-feature
    traitsAll:
      - trait.class-option.mediziner.fachrichtung
  id: choice.mediziner.fachrichtung
  kind: class-option
  level: 1
  max: 1
  min: 1
  prerequisites:
    - class:
        id: class.mediziner
  repeatable: false
id: choice.mediziner.fachrichtung
legacy:
  notes: []
  paths:
    - classes/klasse_mediziner.md
name: Fachrichtung wählen
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Wähle eine Option für Fachrichtung.
traits: []
type: choice
---

Wähle eine Option für Fachrichtung.
