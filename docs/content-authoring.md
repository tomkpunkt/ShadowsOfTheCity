# Content Authoring

## Arbeitsablauf

1. Lege eine Markdown-Datei im passenden Unterordner von `content/` an.
2. Vergib eine dauerhafte ASCII-ID in Kleinbuchstaben, etwa
   `feat.general.taktiker`. Namen und Dateinamen dürfen später wechseln, die ID
   nicht.
3. Setze `schemaVersion`, `type`, `name`, `summary`, `source`, `status`,
   `traits` und `references`.
4. Referenziere ausschließlich IDs, niemals Anzeigenamen.
5. Schreibe Spielmechanik in typisierte Felder, Prädikate und Effekte. Der
   Markdown-Body bleibt die ausführliche Beschreibung. Interne Verweise
   verwenden `[[id]]` oder `[[id|Anzeigetext]]`.
6. Führe `npm run content:validate` und `npm run content:compile` aus.
7. Committe Authoring-Datei und aktualisierte Dateien unter `generated/`
   gemeinsam.

Statuswerte sind `draft`, `playtest`, `canonical` und `legacy`. Trait-IDs
müssen als eigene `trait`-Entitäten existieren.

## Vollständige Beispiele

### Klasse

```markdown
---
schemaVersion: 1
id: class.beispiel
type: class
name: Beispielklasse
summary: Eine vielseitige Beispielklasse für die Authoring-Dokumentation.
source: source.core
status: playtest
traits: []
references: []
keyAttributes:
  - intelligence
hpPerLevel: 8
trainedSkillChoices: 4
initialProficiencies:
  perception: trained
  saves:
    fortitude: trained
    reflex: trained
    will: trained
  skills:
    skill.crafting: trained
  weapons:
    proficiency.weapon.simple: trained
  armor:
    proficiency.armor.light: trained
featureIds:
  - class-feature.beispiel.grundlage
choiceIds:
  - choice.class-skills.beispiel
---

# Beispielklasse

Beschreibung, Rolle und Hintergrund der Klasse.
```

### Background

```markdown
---
schemaVersion: 1
id: background.beispiel
type: background
name: Beispielbackground
summary: Dieser Hintergrund verbindet Wissen mit praktischer Forschung.
source: source.core
status: playtest
traits: []
references: []
boosts:
  - intelligence
  - wisdom
freeBoosts: 1
trainedSkillIds:
  - skill.science
grantedFeatIds: []
choiceIds: []
effects:
  - kind: skill-training
    skillId: skill.science
    rank: trained
---

# Beispielbackground

Woher die Figur kommt und welche Verbindungen sie besitzt.
```

### Feat mit Voraussetzung und Effekt

```markdown
---
schemaVersion: 1
id: feat.general.beispiel
type: feat
name: Beispiel-Feat
summary: Dieses Talent verbessert die taktische Wahrnehmung.
source: source.core
status: playtest
traits:
  - trait.general
references: []
category: general
level: 1
prerequisites:
  - all:
      - attribute:
          id: intelligence
          gte: 13
      - not:
          hasFeat:
            id: feat.general.beispiel-sperre
effects:
  - kind: modifier
    target: perception
    bonusType: circumstance
    value: 1
    label: Beispiel-Feat
---

# Beispiel-Feat

Du erkennst taktische Veränderungen schneller.
```

### Skill

```markdown
---
schemaVersion: 1
id: skill.beispiel
type: skill
name: Beispielskill
summary: Diese Fertigkeit deckt ein klar abgegrenztes Wissensgebiet ab.
source: source.core
status: playtest
traits: []
references: []
attribute: intelligence
---

# Beispielskill

Anwendungsfälle, Aktionen und besondere Grenzen.
```

### Zauber

```markdown
---
schemaVersion: 1
id: spell.beispiel
type: spell
name: Beispielzauber
summary: Dieser Zauber verlangsamt ein Ziel für kurze Zeit.
source: source.core
status: playtest
traits:
  - trait.magic
references: []
rank: 1
traditions:
  - arcane
actions:
  kind: fixed
  value: 2
range:
  kind: distance
  value: 30
  unit: feet
target:
  kind: creature
  count: 1
duration: 1 Runde
defense:
  kind: save
  save: reflex
  basic: true
effects:
  - kind: modifier
    target: speed
    bonusType: status
    value: -5
heightened: []
---

# Beispielzauber

Der Zauber verlangsamt ein Ziel kurzzeitig.
```

## Choices

Choices sind eigene Entitäten. Der Filter bestimmt die Kandidaten, das
Prädikat die Verfügbarkeit der Choice.

```yaml
schemaVersion: 1
id: choice.class-skills.beispiel
type: choice
name: Beispiel-Fertigkeiten
source: source.core
status: playtest
traits: []
references: []
choice:
  id: choice.class-skills.beispiel
  level: 1
  kind: skill
  min: 4
  max: 4
  filter:
    entityTypes:
      - skill
  prerequisites:
    - class:
        id: class.beispiel
  effects: []
  excludes: []
  repeatable: false
```

Level-Filter verwenden bei Zaubern den Rang. `classId` und `ancestryId` im
Filter prüfen Eigenschaften der Option; die gewählte Charakterklasse oder
Abstammung gehört deshalb in `prerequisites`.

## Prädikate und Effekte

Prädikate sind rekursiv und unterstützen `all`, `any`, `not`, Level,
Attribute, Proficiencies, Klasse, Abstammung, Background, Traits, Feats,
Features, Tradition, Zauber, Gegenstände und Ressourcen. Unbekannte Operatoren
sind Fehler.

Effekte unterstützen Attribute, Modifikatoren, Proficiencies, Trefferpunkte,
Geschwindigkeit, Wahrnehmung, Saves, Skill-Training, Waffen-/Rüstungstraining,
Grants, Zauberzugang, Ressourcen, Choice-Freischaltung und Bedingungen.
Nicht formalisierte Sonderregeln müssen ausdrücklich als
`machineReadable: false` markiert werden.

## Fehlermeldungen

- `SCHEMA_VALIDATION_FAILED`: Feldpfad und erwarteten Typ korrigieren.
- `DUPLICATE_ID`: Eine ID umbenennen und alle Referenzen aktualisieren.
- `UNRESOLVED_REFERENCE`: Zielentität ergänzen oder ID korrigieren.
- `REFERENCE_TYPE_MISMATCH`: Referenz zeigt auf den falschen Entitätstyp.
- `CHOICE_WITHOUT_OPTIONS`: Filter oder Mindestzahl korrigieren.
- `CHOICE_DEPENDENCY_CYCLE`: zyklische `unlock-choice`-Kette auflösen.

Der Compiler bricht bei diesen Fehlern mit Exit-Code ungleich null ab.

## Schema-Version migrieren

Eine Versionsänderung wird nie nur im Frontmatter hochgezählt:

1. `SCHEMA_VERSION` und Zod-Schemas in `packages/shared` erweitern.
2. Eine deterministische Migration von Version N auf N+1 implementieren.
3. Fixture-Tests für alte, migrierte und neue Daten ergänzen.
4. `content/` migrieren und den Katalog neu erzeugen.
5. Authoring-, Schema- und Migrationsdokumentation aktualisieren.
6. `npm run verify` ausführen.

Eine nicht unterstützte Version bleibt bis zur expliziten Migration ein harter
Buildfehler.
