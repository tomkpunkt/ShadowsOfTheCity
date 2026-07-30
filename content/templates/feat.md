---
schemaVersion: 1
id: template.feat
type: feat
name: Beispieltalent
source: source.core
status: playtest
editorialStatus: reviewed
summary: Ein minimales allgemeines Talent mit formaler Voraussetzung und Wertänderung.
rulesText: Ab Intelligenz 13 erhöht das Talent Technologie dauerhaft um einen untypisierten Punkt.
traits: [trait.general]
references: []
examples: []
category: general
level: 1
prerequisites:
  - attribute: { id: intelligence, gte: 13 }
effects:
  - kind: value
    target: skill
    selector: skill.technology
    operation: add
    value: 1
    bonusType: untyped
---

# Beispieltalent

Beschreibe Ziel, Operation, Wert, Dauer und Bedingungen ohne zusätzliche Annahmen.
