---
actions:
  kind: fixed
  value: 2
defense:
  basic: true
  kind: save
  save: reflex
duration: Siehe Legacy-Beschreibung
editorialStatus: reviewed
effects:
  - kind: text
    machineReadable: false
    text: '# Feuerball Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Primal | 3 | 2 Aktionen | 120 Fuß | 1 Kreatur oder Objekt | Sofort | --- ## Beschreibung Du schleuderst einen flammenden Ball aus reiner Magie auf dein Ziel. Der Feuerball explodiert bei Kontakt und verursacht massiven Feuerschaden. Zauberwurf: Angriffswurf gegen AC des Ziels Schaden: 6W6 Feuer-Schaden Kritischer Erfolg: Der Feuerball explodiert in einem 10-Fuß-Radius um das Ziel. Alle Kreaturen in diesem Bereich erleiden 6W6 Feuer-Schaden (Reflexwurf gegen SG 20 für die Hälfte). Erfolg: Das Ziel erleidet 6W6 Feuer-Schaden. Fehlschlag: Der Feuerball verfehlt und erleidet keinen Schaden. --- ## Höhere Ränge - Rang 4: 8W6 Schaden, Kritischer Erfolg: 15-Fuß-Radius - Rang 5: 10W6 Schaden, Kritischer Erfolg: 20-Fuß-Radius - Rang 6: 12W6 Schaden, Kritischer Erfolg: 25-Fuß-Radius --- ## Besondere Regeln - Geflecht-Interferenz: In Gebieten mit beschädigtem magischen Geflecht (wie um ehemalige Atomtestgelände) kann der Zauber unvorhersehbar werden. Der SL würfelt einen W20: Bei 1-5 explodiert der Feuerball bereits nach 30 Fuß, bei 16-20 wird er zu einem Eisball. - Urbaner Kontext: In dicht besiedelten Gebieten kann der Feuerball versehentlich Zivilisten treffen. Der SL sollte die Konsequenzen für unschuldige Opfer berücksichtigen. --- ## Flavortext > „Die alte Magie lebt noch in den Schatten der Stadt – manchmal bricht sie durch die Ritzen der Realität und entfacht ein Inferno." In einer Welt, wo Magie versteckt praktiziert wird, ist der Feuerball ein gefährlicher Zauber. Er erinnert an die Zeiten vor der stellaren Konjunktion, als Magie frei und mächtig war. Heute wird er von den Erleuchteten und anderen Untergrundmagiern verwendet, oft mit tödlichen Konsequenzen für alle Beteiligten.'
examples: []
heightened: []
id: spell.feuerball
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_feuerball.md
    - spells/TOC.md
name: Feuerball
range:
  kind: distance
  unit: feet
  value: 500
rank: 3
references: []
rulesText: "# **Feuerball**\r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Spell-Info**\r

  | **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |\r

  |:--|:--|:--|:--|:--|:--|\r

  | Arcane, Primal | 3 | 2 Aktionen | 120 Fuß | 1 Kreatur oder Objekt | Sofort |\r

  \r

  ---\r

  \r

  ## **Beschreibung**\r

  Du schleuderst einen flammenden Ball aus reiner Magie auf dein Ziel. Der Feuerball explodiert bei Kontakt und verursacht massiven Feuerschaden.\r

  \r

  **Zauberwurf:** Angriffswurf gegen AC des Ziels\r

  **Schaden:** 6W6 Feuer-Schaden\r

  **Kritischer Erfolg:** Der Feuerball explodiert in einem 10-Fuß-Radius um das Ziel. Alle Kreaturen in diesem Bereich erleiden 6W6 Feuer-Schaden (Reflexwurf gegen SG 20 für die Hälfte).\r

  **Erfolg:** Das Ziel erleidet 6W6 Feuer-Schaden.\r

  **Fehlschlag:** Der Feuerball verfehlt und erleidet keinen Schaden.\r

  \r

  ---\r

  \r

  ## **Höhere Ränge**\r

  - **Rang 4:** 8W6 Schaden, Kritischer Erfolg: 15-Fuß-Radius\r

  - **Rang 5:** 10W6 Schaden, Kritischer Erfolg: 20-Fuß-Radius\r

  - **Rang 6:** 12W6 Schaden, Kritischer Erfolg: 25-Fuß-Radius\r

  \r

  ---\r

  \r

  ## **Besondere Regeln**\r

  - **Geflecht-Interferenz:** In Gebieten mit beschädigtem magischen Geflecht (wie um ehemalige Atomtestgelände) kann der Zauber unvorhersehbar werden. Der SL würfelt einen W20: Bei 1-5 explodiert der Feuerball bereits nach 30 Fuß, bei 16-20 wird er zu einem Eisball.\r

  - **Urbaner Kontext:** In dicht besiedelten Gebieten kann der Feuerball versehentlich Zivilisten treffen. Der SL sollte die Konsequenzen für unschuldige Opfer berücksichtigen.\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  > „Die alte Magie lebt noch in den Schatten der Stadt – manchmal bricht sie durch die Ritzen der Realität und entfacht ein Inferno.\"\r

  \r

  In einer Welt, wo Magie versteckt praktiziert wird, ist der Feuerball ein gefährlicher Zauber. Er erinnert an die Zeiten vor der stellaren Konjunktion, als Magie frei und mächtig war. Heute wird er von den Erleuchteten und anderen Untergrundmagiern verwendet, oft mit tödlichen Konsequenzen für alle Beteiligten."
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Du schleuderst einen flammenden Ball aus reiner Magie auf dein Ziel.
target:
  area:
    shape: burst
    size: 20
    unit: feet
  kind: area
traditions:
  - arcane
  - primal
traits:
  - trait.magic
type: spell
---

# **Feuerball**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Primal | 3 | 2 Aktionen | 120 Fuß | 1 Kreatur oder Objekt | Sofort |

---

## **Beschreibung**
Du schleuderst einen flammenden Ball aus reiner Magie auf dein Ziel. Der Feuerball explodiert bei Kontakt und verursacht massiven Feuerschaden.

**Zauberwurf:** Angriffswurf gegen AC des Ziels
**Schaden:** 6W6 Feuer-Schaden
**Kritischer Erfolg:** Der Feuerball explodiert in einem 10-Fuß-Radius um das Ziel. Alle Kreaturen in diesem Bereich erleiden 6W6 Feuer-Schaden (Reflexwurf gegen SG 20 für die Hälfte).
**Erfolg:** Das Ziel erleidet 6W6 Feuer-Schaden.
**Fehlschlag:** Der Feuerball verfehlt und erleidet keinen Schaden.

---

## **Höhere Ränge**
- **Rang 4:** 8W6 Schaden, Kritischer Erfolg: 15-Fuß-Radius
- **Rang 5:** 10W6 Schaden, Kritischer Erfolg: 20-Fuß-Radius
- **Rang 6:** 12W6 Schaden, Kritischer Erfolg: 25-Fuß-Radius

---

## **Besondere Regeln**
- **Geflecht-Interferenz:** In Gebieten mit beschädigtem magischen Geflecht (wie um ehemalige Atomtestgelände) kann der Zauber unvorhersehbar werden. Der SL würfelt einen W20: Bei 1-5 explodiert der Feuerball bereits nach 30 Fuß, bei 16-20 wird er zu einem Eisball.
- **Urbaner Kontext:** In dicht besiedelten Gebieten kann der Feuerball versehentlich Zivilisten treffen. Der SL sollte die Konsequenzen für unschuldige Opfer berücksichtigen.

---

## **Flavortext**
> „Die alte Magie lebt noch in den Schatten der Stadt – manchmal bricht sie durch die Ritzen der Realität und entfacht ein Inferno."

In einer Welt, wo Magie versteckt praktiziert wird, ist der Feuerball ein gefährlicher Zauber. Er erinnert an die Zeiten vor der stellaren Konjunktion, als Magie frei und mächtig war. Heute wird er von den Erleuchteten und anderen Untergrundmagiern verwendet, oft mit tödlichen Konsequenzen für alle Beteiligten.
