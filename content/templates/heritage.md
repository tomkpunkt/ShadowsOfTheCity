---
# ancestryId und die Voraussetzung müssen dieselbe Abstammung nennen.
schemaVersion: 1
id: template.heritage
type: heritage
name: Beispielherkunft
source: source.core
status: playtest
editorialStatus: reviewed
summary: Eine minimale Herkunft mit eindeutiger Abstammungsbindung und Kompetenzregel.
rulesText: Diese Herkunft macht den Charakter mindestens geübt in Gesellschaft.
traits: [trait.ancestry]
references: []
examples: []
ancestryId: ancestry.elf
prerequisites:
  - ancestry: { id: ancestry.elf }
effects:
  - kind: proficiency-rule
    proficiencyId: skill.society
    operation: at-least
    rank: trained
---

# Beispielherkunft

Beschreibe die Herkunft und trenne permanente Werte von situativen Vorteilen.
