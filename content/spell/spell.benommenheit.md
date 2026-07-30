---
actions:
  kind: fixed
  value: 2
defense:
  kind: save
  save: will
duration: Siehe Legacy-Beschreibung
effects:
  - kind: text
    machineReadable: false
    text: '# Benommenheit Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Occult | Cantrip | 2 Aktionen | 60 Fuß | 1 Kreatur | 1 Runde | --- ## Beschreibung Du greifst in den Geist deines Ziels ein und verursachst Verwirrung. Zauberwurf: Willenswurf gegen deinen Zauber-SG Effekt: Das Ziel wird verwirrt und kann nur eine Aktion pro Runde ausführen. Widerstand: Das Ziel kann einen Willenswurf gegen deinen Zauber-SG machen, um dem Effekt zu widerstehen. --- ## Höhere Ränge - Rang 1: Dauer 2 Runden, das Ziel kann keine Aktionen ausführen - Rang 2: Dauer 3 Runden, das Ziel kann keine Aktionen ausführen - Rang 3: Dauer 4 Runden, das Ziel kann keine Aktionen ausführen --- ## Besondere Regeln - Geflecht-Empfindlichkeit: Kreaturen mit starkem magischen Geflecht (Elfen, einige Menschen) sind schwerer zu verwirren und erhalten +2 auf ihren Willenswurf. - Technologische Abwehr: Moderne Gehirn-Computer-Schnittstellen können die Verwirrung stören oder umleiten. --- ## Flavortext > „Ein kleiner Stoß in den Geist – manchmal genügt das, um einen Gegner aus dem Gleichgewicht zu bringen." Daze ist ein subtiler aber effektiver Cantrip für Magier der Schule der Schatten. Er ist besonders nützlich, um Gegner zu neutralisieren, ohne sie zu verletzen.'
heightened: []
id: spell.benommenheit
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_benommenheit.md
    - spells/TOC.md
name: Benommenheit
range:
  kind: distance
  unit: feet
  value: 30
rank: 0
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
target:
  count: 1
  kind: creature
traditions:
  - arcane
  - occult
traits:
  - trait.magic
type: spell
---

# **Benommenheit**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Occult | Cantrip | 2 Aktionen | 60 Fuß | 1 Kreatur | 1 Runde |

---

## **Beschreibung**
Du greifst in den Geist deines Ziels ein und verursachst Verwirrung.

**Zauberwurf:** Willenswurf gegen deinen Zauber-SG
**Effekt:** Das Ziel wird verwirrt und kann nur eine Aktion pro Runde ausführen.
**Widerstand:** Das Ziel kann einen Willenswurf gegen deinen Zauber-SG machen, um dem Effekt zu widerstehen.

---

## **Höhere Ränge**
- **Rang 1:** Dauer 2 Runden, das Ziel kann keine Aktionen ausführen
- **Rang 2:** Dauer 3 Runden, das Ziel kann keine Aktionen ausführen
- **Rang 3:** Dauer 4 Runden, das Ziel kann keine Aktionen ausführen

---

## **Besondere Regeln**
- **Geflecht-Empfindlichkeit:** Kreaturen mit starkem magischen Geflecht (Elfen, einige Menschen) sind schwerer zu verwirren und erhalten +2 auf ihren Willenswurf.
- **Technologische Abwehr:** Moderne Gehirn-Computer-Schnittstellen können die Verwirrung stören oder umleiten.

---

## **Flavortext**
> „Ein kleiner Stoß in den Geist – manchmal genügt das, um einen Gegner aus dem Gleichgewicht zu bringen."

Daze ist ein subtiler aber effektiver Cantrip für Magier der Schule der Schatten. Er ist besonders nützlich, um Gegner zu neutralisieren, ohne sie zu verletzen.
