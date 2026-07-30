---
actions:
  kind: fixed
  value: 2
defense:
  basic: true
  kind: save
  save: reflex
duration: Siehe Legacy-Beschreibung
effects:
  - kind: text
    machineReadable: false
    text: '# Blitzschlag Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Primal | 1 | 2 Aktionen | 120 Fuß | 1 Kreatur | Sofort | --- ## Beschreibung Du schleuderst einen Blitz aus reiner Energie auf dein Ziel. Zauberwurf: Angriffswurf gegen AC des Ziels Schaden: 2W12 Elektrizitäts-Schaden Kritischer Erfolg: Der Blitz springt zu einem weiteren Ziel innerhalb von 30 Fuß und verursacht dort 1W12 Elektrizitäts-Schaden. --- ## Höhere Ränge - Rang 2: 3W12 Schaden, Blitz springt zu 2 weiteren Zielen - Rang 3: 4W12 Schaden, Blitz springt zu 3 weiteren Zielen - Rang 4: 5W12 Schaden, Blitz springt zu 4 weiteren Zielen --- ## Besondere Regeln - Technologische Verstärkung: In Gebieten mit starker elektrischer Infrastruktur (Kraftwerke, Hochspannungsleitungen) kann der Blitzschlag zusätzliche 1W6 Schaden verursachen. - Geflecht-Interferenz: In Gebieten mit beschädigtem magischen Geflecht kann der Blitz unvorhersehbar werden und versehentlich technologische Geräte beschädigen. --- ## Flavortext > „Die Macht des Sturms lebt noch in den Drähten der Stadt – manchmal bricht sie durch und entfacht ein Inferno." Blitzschlag ist ein gefährlicher Zauber in einer technologischen Welt. Während er gegen lebende Ziele wirksam ist, kann er auch versehentlich technologische Geräte beschädigen oder Stromausfälle verursachen. Besonders gefährlich ist er in Gebieten mit starker elektrischer Infrastruktur.'
heightened: []
id: spell.blitzschlag
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_blitzschlag.md
    - spells/TOC.md
name: Blitzschlag
range:
  kind: distance
  unit: feet
  value: 120
rank: 1
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
target:
  area:
    shape: line
    size: 60
    unit: feet
  kind: area
traditions:
  - arcane
  - primal
traits:
  - trait.magic
type: spell
---

# **Blitzschlag**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Primal | 1 | 2 Aktionen | 120 Fuß | 1 Kreatur | Sofort |

---

## **Beschreibung**
Du schleuderst einen Blitz aus reiner Energie auf dein Ziel.

**Zauberwurf:** Angriffswurf gegen AC des Ziels
**Schaden:** 2W12 Elektrizitäts-Schaden
**Kritischer Erfolg:** Der Blitz springt zu einem weiteren Ziel innerhalb von 30 Fuß und verursacht dort 1W12 Elektrizitäts-Schaden.

---

## **Höhere Ränge**
- **Rang 2:** 3W12 Schaden, Blitz springt zu 2 weiteren Zielen
- **Rang 3:** 4W12 Schaden, Blitz springt zu 3 weiteren Zielen
- **Rang 4:** 5W12 Schaden, Blitz springt zu 4 weiteren Zielen

---

## **Besondere Regeln**
- **Technologische Verstärkung:** In Gebieten mit starker elektrischer Infrastruktur (Kraftwerke, Hochspannungsleitungen) kann der Blitzschlag zusätzliche 1W6 Schaden verursachen.
- **Geflecht-Interferenz:** In Gebieten mit beschädigtem magischen Geflecht kann der Blitz unvorhersehbar werden und versehentlich technologische Geräte beschädigen.

---

## **Flavortext**
> „Die Macht des Sturms lebt noch in den Drähten der Stadt – manchmal bricht sie durch und entfacht ein Inferno."

Blitzschlag ist ein gefährlicher Zauber in einer technologischen Welt. Während er gegen lebende Ziele wirksam ist, kann er auch versehentlich technologische Geräte beschädigen oder Stromausfälle verursachen. Besonders gefährlich ist er in Gebieten mit starker elektrischer Infrastruktur.
