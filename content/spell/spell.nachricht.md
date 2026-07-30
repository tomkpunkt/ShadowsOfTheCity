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
    text: '# Nachricht Quelle: Welt-Regelwerk (Zeitalter des Goldes) --- ## Spell-Info | Tradition | Rang | Zeit | Reichweite | Ziel | Dauer | |:--|:--|:--|:--|:--|:--| | Arcane, Occult | Cantrip | 2 Aktionen | 120 Fuß | 1 Kreatur | Sofort | --- ## Beschreibung Du sendest eine kurze Nachricht direkt in den Geist einer Kreatur. Effekt: Du kannst eine Nachricht von bis zu 25 Wörtern an das Ziel senden. Das Ziel kann eine Antwort von bis zu 25 Wörtern zurücksenden. Zusätzlich: Die Nachricht ist völlig privat und kann von anderen nicht abgefangen werden. --- ## Höhere Ränge - Rang 1: Reichweite 240 Fuß, Nachricht kann bis zu 50 Wörter enthalten - Rang 2: Reichweite 480 Fuß, Nachricht kann bis zu 100 Wörter enthalten - Rang 3: Reichweite 960 Fuß, Nachricht kann bis zu 200 Wörter enthalten --- ## Besondere Regeln - Geflecht-Verstärkung: In Gebieten mit starkem magischen Geflecht kann die Nachricht über größere Entfernungen gesendet werden. - Technologische Interferenz: Moderne Überwachungssysteme können die Nachricht möglicherweise stören oder abfangen. --- ## Flavortext > „Die Gedanken sind frei – und manchmal können sie die gefährlichsten Nachrichten übertragen." Message ist ein unverzichtbarer Cantrip für Magier, die in den Schatten der Stadt operieren. Er ermöglicht sichere Kommunikation ohne die Gefahr, abgehört zu werden.'
heightened: []
id: spell.nachricht
legacy:
  notes:
    - Bei Rangkonflikten gilt vorläufig die Detaildatei; Dauer und Höhenstufen bleiben Freitext.
  paths:
    - spells/spell_nachricht.md
    - spells/TOC.md
name: Nachricht
range:
  kind: distance
  unit: feet
  value: 120
rank: 0
references: []
schemaVersion: 1
source: legacy.world-rules
status: legacy
summary: Du sendest eine kurze Nachricht direkt in den Geist einer Kreatur.
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

# **Nachricht**
**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Spell-Info**
| **Tradition** | **Rang** | **Zeit** | **Reichweite** | **Ziel** | **Dauer** |
|:--|:--|:--|:--|:--|:--|
| Arcane, Occult | Cantrip | 2 Aktionen | 120 Fuß | 1 Kreatur | Sofort |

---

## **Beschreibung**
Du sendest eine kurze Nachricht direkt in den Geist einer Kreatur.

**Effekt:** Du kannst eine Nachricht von bis zu 25 Wörtern an das Ziel senden. Das Ziel kann eine Antwort von bis zu 25 Wörtern zurücksenden.
**Zusätzlich:** Die Nachricht ist völlig privat und kann von anderen nicht abgefangen werden.

---

## **Höhere Ränge**
- **Rang 1:** Reichweite 240 Fuß, Nachricht kann bis zu 50 Wörter enthalten
- **Rang 2:** Reichweite 480 Fuß, Nachricht kann bis zu 100 Wörter enthalten
- **Rang 3:** Reichweite 960 Fuß, Nachricht kann bis zu 200 Wörter enthalten

---

## **Besondere Regeln**
- **Geflecht-Verstärkung:** In Gebieten mit starkem magischen Geflecht kann die Nachricht über größere Entfernungen gesendet werden.
- **Technologische Interferenz:** Moderne Überwachungssysteme können die Nachricht möglicherweise stören oder abfangen.

---

## **Flavortext**
> „Die Gedanken sind frei – und manchmal können sie die gefährlichsten Nachrichten übertragen."

Message ist ein unverzichtbarer Cantrip für Magier, die in den Schatten der Stadt operieren. Er ermöglicht sichere Kommunikation ohne die Gefahr, abgehört zu werden.
