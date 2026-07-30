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
    text: '# Magie Erkennen Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Divine, Occult, Primal | Cantrip | 2 Aktionen | 30 Fuß | 1 Objekt oder Kreatur | 1 Minute | --- ## Beschreibung Du spürst die Präsenz aktiver Magie in deiner Umgebung. Effekt: Du erkennst automatisch alle aktiven magischen Effekte innerhalb von 30 Fuß. Du kannst auch feststellen, ob ein Objekt oder eine Kreatur magisch ist. Zusätzlich: Du erhältst einen allgemeinen Eindruck von der Art der Magie (arkane, göttliche, okkulte oder natürliche). --- ## Höhere Ränge - Rang 1: Reichweite 60 Fuß, du kannst die genaue Art der Magie identifizieren - Rang 2: Reichweite 120 Fuß, du kannst die Stärke der Magie abschätzen - Rang 3: Reichweite 240 Fuß, du kannst die Quelle der Magie lokalisieren --- ## Besondere Regeln - Geflecht-Empfindlichkeit: In Gebieten mit starkem magischen Geflecht kann der Zauber überwältigend werden und dir Kopfschmerzen verursachen. - Technologische Interferenz: Moderne Überwachungssysteme können die Magieerkennung stören oder falsche Signale erzeugen. --- ## Flavortext > „Die Augen eines Magiers sehen mehr als die der Sterblichen – sie sehen die unsichtbaren Strömungen der Macht." Detect Magic ist einer der grundlegendsten Zauber für jeden Magier. In einer Welt, wo Magie versteckt praktiziert wird, ist die Fähigkeit, magische Effekte zu erkennen, überlebenswichtig.'
heightened: []
id: spell.magie-erkennen
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_magie_erkennen.md
    - spells/TOC.md
name: Magie Erkennen
range:
  kind: self
rank: 0
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
target:
  area:
    shape: emanation
    size: 30
    unit: feet
  kind: area
traditions:
  - arcane
  - divine
  - occult
  - primal
traits:
  - trait.magic
type: spell
---

# **Magie Erkennen**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Divine, Occult, Primal | Cantrip | 2 Aktionen | 30 Fuß | 1 Objekt oder Kreatur | 1 Minute |

---

## **Beschreibung**
Du spürst die Präsenz aktiver Magie in deiner Umgebung.

**Effekt:** Du erkennst automatisch alle aktiven magischen Effekte innerhalb von 30 Fuß. Du kannst auch feststellen, ob ein Objekt oder eine Kreatur magisch ist.
**Zusätzlich:** Du erhältst einen allgemeinen Eindruck von der Art der Magie (arkane, göttliche, okkulte oder natürliche).

---

## **Höhere Ränge**
- **Rang 1:** Reichweite 60 Fuß, du kannst die genaue Art der Magie identifizieren
- **Rang 2:** Reichweite 120 Fuß, du kannst die Stärke der Magie abschätzen
- **Rang 3:** Reichweite 240 Fuß, du kannst die Quelle der Magie lokalisieren

---

## **Besondere Regeln**
- **Geflecht-Empfindlichkeit:** In Gebieten mit starkem magischen Geflecht kann der Zauber überwältigend werden und dir Kopfschmerzen verursachen.
- **Technologische Interferenz:** Moderne Überwachungssysteme können die Magieerkennung stören oder falsche Signale erzeugen.

---

## **Flavortext**
> „Die Augen eines Magiers sehen mehr als die der Sterblichen – sie sehen die unsichtbaren Strömungen der Macht."

Detect Magic ist einer der grundlegendsten Zauber für jeden Magier. In einer Welt, wo Magie versteckt praktiziert wird, ist die Fähigkeit, magische Effekte zu erkennen, überlebenswichtig.
