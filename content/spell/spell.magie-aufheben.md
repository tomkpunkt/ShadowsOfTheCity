---
actions:
  kind: fixed
  value: 2
defense:
  kind: none
duration: Siehe Legacy-Beschreibung
effects:
  - kind: text
    machineReadable: false
    text: '# Magie Aufheben Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Divine, Occult, Primal | 3 | 2 Aktionen | 60 Fuß | 1 magischer Effekt | Sofort | --- ## Beschreibung Du unterbrichst einen aktiven magischen Effekt und beendest ihn vorzeitig. Zauberwurf: Zauberwurf gegen den ursprünglichen Zauber-SG des Effekts Effekt: Der magische Effekt wird beendet, wenn dein Wurf erfolgreich ist. Kritischer Erfolg: Der Effekt wird beendet und kann für 1 Stunde nicht erneut gewirkt werden. --- ## Höhere Ränge - Rang 4: Du kannst alle magischen Effekte auf einem Ziel beenden - Rang 5: Du kannst alle magischen Effekte in einem 10-Fuß-Radius beenden - Rang 6: Du kannst alle magischen Effekte in einem 20-Fuß-Radius beenden --- ## Besondere Regeln - Geflecht-Verstärkung: In Gebieten mit starkem magischen Geflecht erhältst du +2 auf den Zauberwurf. - Technologische Interferenz: Moderne Überwachungssysteme können die Magieunterdrückung stören oder umleiten. --- ## Flavortext > „Die Macht, die Magie bricht – ein gefährliches Wissen in den Händen derer, die das Geflecht verstehen." Dispel Magic ist einer der mächtigsten Zauber für Magier. Er ermöglicht es ihnen, die magischen Effekte ihrer Gegner zu neutralisieren und das Gleichgewicht wiederherzustellen.'
heightened: []
id: spell.magie-aufheben
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_magie_aufheben.md
    - spells/TOC.md
name: Magie Aufheben
range:
  kind: distance
  unit: feet
  value: 120
rank: 3
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
target:
  count: 1
  kind: effect
traditions:
  - arcane
  - divine
  - occult
  - primal
traits:
  - trait.magic
type: spell
---

# **Magie Aufheben**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Divine, Occult, Primal | 3 | 2 Aktionen | 60 Fuß | 1 magischer Effekt | Sofort |

---

## **Beschreibung**
Du unterbrichst einen aktiven magischen Effekt und beendest ihn vorzeitig.

**Zauberwurf:** Zauberwurf gegen den ursprünglichen Zauber-SG des Effekts
**Effekt:** Der magische Effekt wird beendet, wenn dein Wurf erfolgreich ist.
**Kritischer Erfolg:** Der Effekt wird beendet und kann für 1 Stunde nicht erneut gewirkt werden.

---

## **Höhere Ränge**
- **Rang 4:** Du kannst alle magischen Effekte auf einem Ziel beenden
- **Rang 5:** Du kannst alle magischen Effekte in einem 10-Fuß-Radius beenden
- **Rang 6:** Du kannst alle magischen Effekte in einem 20-Fuß-Radius beenden

---

## **Besondere Regeln**
- **Geflecht-Verstärkung:** In Gebieten mit starkem magischen Geflecht erhältst du +2 auf den Zauberwurf.
- **Technologische Interferenz:** Moderne Überwachungssysteme können die Magieunterdrückung stören oder umleiten.

---

## **Flavortext**
> „Die Macht, die Magie bricht – ein gefährliches Wissen in den Händen derer, die das Geflecht verstehen."

Dispel Magic ist einer der mächtigsten Zauber für Magier. Er ermöglicht es ihnen, die magischen Effekte ihrer Gegner zu neutralisieren und das Gleichgewicht wiederherzustellen.
