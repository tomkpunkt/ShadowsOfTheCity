---
actions:
  kind: fixed
  value: 2
defense:
  kind: armor-class
duration: Siehe Legacy-Beschreibung
effects:
  - kind: text
    machineReadable: false
    text: '# Flamme Erschaffen Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Primal | Cantrip | 2 Aktionen | 30 Fuß | 1 Kreatur oder Objekt | Sofort | --- ## Beschreibung Du erschaffst eine kleine Flamme in deiner Hand und schleuderst sie auf dein Ziel. Zauberwurf: Angriffswurf gegen AC des Ziels Schaden: 1W4 + dein Attributsmodifikator Feuer-Schaden Kritischer Erfolg: Die Flamme entzündet sich und verursacht zusätzlich 1W4 Feuer-Schaden pro Runde für 3 Runden. --- ## Höhere Ränge - Rang 1: 2W4 + Attributsmodifikator Schaden - Rang 2: 3W4 + Attributsmodifikator Schaden - Rang 3: 4W4 + Attributsmodifikator Schaden --- ## Besondere Regeln - Geflecht-Verstärkung: In Gebieten mit starkem natürlichen magischen Geflecht (Wälder, unberührte Natur) erhält die Flamme zusätzliche 1W2 Schaden. - Urbaner Kontext: In dicht besiedelten Gebieten kann die Flamme versehentlich Zivilisten treffen oder Brände verursachen. --- ## Flavortext > „Die erste Flamme, die ein Magier lernt zu beherrschen – klein, aber mächtig genug, um die Dunkelheit zu vertreiben." Produce Flame ist oft der erste Zauber, den ein Magier lernt. Er ist einfach, aber effektiv, und in den gefährlichen Straßen der Stadt kann selbst eine kleine Flamme den Unterschied zwischen Leben und Tod bedeuten.'
heightened: []
id: spell.flamme-erschaffen
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_flamme_erschaffen.md
    - spells/TOC.md
name: Flamme Erschaffen
range:
  kind: distance
  unit: feet
  value: 30
rank: 0
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Du erschaffst eine kleine Flamme in deiner Hand und schleuderst sie auf dein Ziel.
target:
  count: 1
  kind: creature
traditions:
  - arcane
  - primal
traits:
  - trait.magic
type: spell
---

# **Flamme Erschaffen**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Primal | Cantrip | 2 Aktionen | 30 Fuß | 1 Kreatur oder Objekt | Sofort |

---

## **Beschreibung**
Du erschaffst eine kleine Flamme in deiner Hand und schleuderst sie auf dein Ziel.

**Zauberwurf:** Angriffswurf gegen AC des Ziels
**Schaden:** 1W4 + dein Attributsmodifikator Feuer-Schaden
**Kritischer Erfolg:** Die Flamme entzündet sich und verursacht zusätzlich 1W4 Feuer-Schaden pro Runde für 3 Runden.

---

## **Höhere Ränge**
- **Rang 1:** 2W4 + Attributsmodifikator Schaden
- **Rang 2:** 3W4 + Attributsmodifikator Schaden
- **Rang 3:** 4W4 + Attributsmodifikator Schaden

---

## **Besondere Regeln**
- **Geflecht-Verstärkung:** In Gebieten mit starkem natürlichen magischen Geflecht (Wälder, unberührte Natur) erhält die Flamme zusätzliche 1W2 Schaden.
- **Urbaner Kontext:** In dicht besiedelten Gebieten kann die Flamme versehentlich Zivilisten treffen oder Brände verursachen.

---

## **Flavortext**
> „Die erste Flamme, die ein Magier lernt zu beherrschen – klein, aber mächtig genug, um die Dunkelheit zu vertreiben."

Produce Flame ist oft der erste Zauber, den ein Magier lernt. Er ist einfach, aber effektiv, und in den gefährlichen Straßen der Stadt kann selbst eine kleine Flamme den Unterschied zwischen Leben und Tod bedeuten.
