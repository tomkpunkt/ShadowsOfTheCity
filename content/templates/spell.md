---
schemaVersion: 1
id: template.spell
type: spell
name: Beispielzauber
source: source.core
status: playtest
editorialStatus: reviewed
summary: Ein minimaler Zaubertrick mit Aktionen, Reichweite, Ziel und Verteidigung.
rulesText: Der Zauber sendet eine kurze arkane Nachricht an eine Kreatur in 60 Fuß Reichweite.
traits: [trait.magic]
references: []
examples: []
rank: 0
traditions: [arcane]
actions: { kind: fixed, value: 2 }
range: { kind: distance, value: 60, unit: feet }
target: { kind: creature, count: 1 }
duration: Sofort
defense: { kind: none }
effects:
  - kind: text
    text: Die Nachricht ist eine reine Kommunikationswirkung ohne numerischen Charakterwert.
    machineReadable: false
    classification: display-only
heightened: []
---

# Beispielzauber

Beschreibe Wirkung, Ziel, Dauer, Verteidigung und erhöhte Wirkung präzise.
