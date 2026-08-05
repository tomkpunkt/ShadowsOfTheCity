---
schemaVersion: 1
id: template.choice
type: choice
name: Beispielauswahl
source: source.core
status: playtest
editorialStatus: reviewed
summary: Eine minimale Auswahl für genau ein allgemeines Talent der ersten Stufe.
rulesText: Wähle genau ein verfügbares allgemeines Talent bis einschließlich Stufe eins.
traits: []
references: []
examples: []
choice:
  id: template.choice
  level: 1
  kind: feat
  min: 1
  max: 1
  filter:
    entityTypes: [feat]
    category: general
    maxLevel: 1
  prerequisites: []
  effects: []
  excludes: []
  repeatable: false
---

# Beispielauswahl

Beschreibe Anlass, Anzahl, Filter, Voraussetzungen und Wiederholbarkeit.
