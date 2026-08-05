---
# classId muss auf eine bestehende Klasse zeigen.
schemaVersion: 1
id: template.class-feature
type: class-feature
name: Beispielmerkmal
source: source.core
status: playtest
editorialStatus: reviewed
summary: Ein minimales Klassenmerkmal mit einem eindeutig strukturierten Effekt.
rulesText: Das Merkmal erhöht die Wahrnehmung dauerhaft um einen untypisierten Punkt.
traits: []
references: []
examples: []
classId: class.magier
level: 1
prerequisites: []
effects:
  - kind: value
    target: perception
    operation: add
    value: 1
    bonusType: untyped
choiceIds: []
---

# Beispielmerkmal

Erkläre Auslöser, Wirkung, Dauer und jede situative Einschränkung.
