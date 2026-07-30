---
schemaVersion: 1
id: template.background
type: background
name: Beispielhintergrund
source: source.core
status: playtest
editorialStatus: reviewed
summary: Ein minimaler Hintergrund mit Attributs- und Fertigkeitsausbildung.
rulesText: Der Hintergrund verbessert Intelligenz und gewährt eine freie Verbesserung sowie Wissenschaftstraining.
traits: []
references: []
examples: []
boosts: [intelligence]
freeBoosts: 1
trainedSkillIds: [skill.science]
grantedFeatIds: []
choiceIds: []
effects:
  - kind: proficiency-rule
    proficiencyId: skill.science
    operation: at-least
    rank: trained
---

# Beispielhintergrund

Beschreibe Ausbildung, Kontakte und Grenzen dieses Hintergrunds.
