---
category: general
editorialStatus: needs-rules-decision
effects:
  - kind: value
    operation: add
    scale: per-level
    target: hit-points
    value: 1
  - classification: requires-rules-decision
    decisionId: rules-decision.feat.zahigkeit-prerequisite
    kind: text
    machineReadable: false
    text: +1 TP pro Stufe
examples: []
id: feat.general.zahigkeit
legacy:
  notes: []
  paths:
    - feats/feats_overview.md
    - feats/feat_zaehigkeit.md
level: 1
name: Zähigkeit
prerequisites:
  - all:
      - attribute:
          gte: 13
          id: strength
references: []
rulesText: "# Zähigkeit\r

  \r

  **Quelle:** Welt-Regelwerk (Zeitalter des Goldes)\r

  \r

  ---\r

  \r

  ## **Flavortext**\r

  \r

  > „Hartnäckigkeit ist der Schlüssel zum Überleben in den Schatten der Stadt.\"\r

  \r

  Zähigkeit ist eine grundlegende Überlebensfähigkeit, die es Charakteren ermöglicht, mehr Schaden zu ertragen und länger im Kampf zu bestehen. Diese Fähigkeit ist besonders wertvoll für Kämpfer und alle, die sich regelmäßig in gefährliche Situationen begeben.\r

  \r

  ---\r

  \r

  ## **Übersicht**\r

  \r

  Zähigkeit erhöht die Trefferpunkte eines Charakters dauerhaft, wodurch er mehr Schaden überstehen kann. Diese Fähigkeit ist besonders nützlich für Frontkämpfer und Charaktere, die sich häufig in gefährlichen Situationen befinden.\r

  \r

  ---\r

  \r

  ## **Mechanische Details**\r

  \r

  ### **Voraussetzungen**\r

  - **Stufe:** 1+\r

  - **Konstitution:** 13+\r

  \r

  ### **Effekt**\r

  - **Trefferpunkte:** +1 Trefferpunkt pro Charakterstufe\r

  - **Stapelbar:** Nein (nur einmal erhältlich)\r

  \r

  ### **Berechnung**\r

  - **Neue TP-Formel:** (Klassen-TP + Konstitutionsmodifikator + Stufe) × Stufen\r

  - **Beispiel:** Ein Charakter der Stufe 5 mit Konstitution 16 (+3) und Klassen-TP 8 erhält: (8 + 3 + 5) × 5 = 80 TP\r

  \r

  ---\r

  \r

  ## **Spielmechanische Auswirkungen**\r

  \r

  ### **Vorteile**\r

  - **Überlebensfähigkeit:** Deutlich erhöhte Widerstandsfähigkeit\r

  - **Kampfdauer:** Längere Überlebenszeit in Kämpfen\r

  - **Risikobereitschaft:** Ermöglicht aggressivere Taktiken\r

  - **Gruppenschutz:** Kann als \"Tank\" für die Gruppe fungieren\r

  \r

  ### **Nachteile**\r

  - **Feat-Slot:** Verbraucht einen wertvollen Feat-Slot\r

  - **Frühe Investition:** Muss früh gewählt werden für maximale Wirkung\r

  - **Spezialisierung:** Fokussiert auf Überleben statt andere Fähigkeiten\r

  \r

  ---\r

  \r

  ## **Synergien**\r

  \r

  ### **Gute Kombinationen**\r

  - **Schnelle Erholung:** Verstärkt die Regenerationsfähigkeit\r

  - **Zäher Hund:** Synergie mit niedrigen TP-Werten\r

  - **Defensiver Kämpfer:** Kombiniert Überleben mit Verteidigung\r

  - **Konstitutionsboni:** Verstärkt den Effekt zusätzlich\r

  \r

  ### **Klassenempfehlungen**\r

  - **Söldner:** Frontkämpfer profitieren am meisten\r

  - **Wächter:** Defensive Kämpfer nutzen die TP optimal\r

  - **Raufbold:** Straßenkämpfer brauchen Überlebensfähigkeit\r

  - **Agent:** Spione können riskantere Missionen überstehen\r

  \r

  ---\r

  \r

  ## **Taktische Anwendung**\r

  \r

  ### **Kampf**\r

  - **Frontlinie:** Als Hauptziel für Gegner fungieren\r

  - **Schutz:** Verbündete vor Schaden schützen\r

  - **Durchhaltevermögen:** Lange Kämpfe überstehen\r

  - **Risikomanagement:** Gefährliche Manöver wagen\r

  \r

  ### **Außerhalb des Kampfes**\r

  - **Gefährliche Missionen:** Risikoreiche Aufträge übernehmen\r

  - **Umweltgefahren:** Gift, Fallen, etc. besser überstehen\r

  - **Tortur:** Widerstandsfähigkeit gegen Verhöre\r

  - **Extreme Bedingungen:** Hitze, Kälte, Hunger besser ertragen\r

  \r

  ---\r

  \r

  ## **Fluff und Hintergrund**\r

  \r

  ### **Charakterkonzepte**\r

  - **Veteran:** Erfahrener Kämpfer mit vielen Narben\r

  - **Überlebenskünstler:** Jemand, der schon alles überlebt hat\r

  - **Beschützer:** Jemand, der andere beschützen will\r

  - **Glückspilz:** Jemand, der immer wieder dem Tod entrinnt\r

  \r

  ### **Geschichtliche Integration**\r

  - **Kriegsveteranen:** Viele Söldner haben diese Fähigkeit\r

  - **Slumbewohner:** Orks und andere Unterdrückte entwickeln Zähigkeit\r

  - **Konzernangestellte:** Sicherheitskräfte und Bodyguards\r

  - **Geheimdienstler:** Agenten, die gefährliche Missionen überstehen\r

  \r

  ---\r

  \r

  ## **Regeltechnische Details**\r

  \r

  ### **Interaktionen**\r

  - **Magische Heilung:** Funktioniert normal mit erhöhten TP\r

  - **Natürliche Heilung:** Regeneriert proportional zu den erhöhten TP\r

  - **Temporäre TP:** Werden zu den erhöhten TP addiert\r

  - **TP-Maximum:** Das neue Maximum wird dauerhaft erhöht\r

  \r

  ### **Spezialfälle**\r

  - **TP-Verlust:** Verlorene TP werden normal behandelt\r

  - **Bewusstlosigkeit:** Tritt bei 0 TP ein, unabhängig vom Maximum\r

  - **Tod:** Tritt bei negativen TP ein, unabhängig vom Maximum\r

  - **Regeneration:** Funktioniert normal mit erhöhten TP\r

  \r

  ---\r

  \r

  ## **Beschreibung im Spiel**\r

  \r

  Zähigkeit ist eine der grundlegendsten Überlebensfähigkeiten im Zeitalter des Goldes. In einer Welt voller Gefahren, wo Konzernkriege, magische Anomalien und kriminelle Aktivitäten an der Tagesordnung sind, ist die Fähigkeit, mehr Schaden zu ertragen, oft der Unterschied zwischen Leben und Tod.\r

  \r

  Diese Fähigkeit repräsentiert nicht nur physische Robustheit, sondern auch mentale Stärke und den Willen zu überleben. Charaktere mit Zähigkeit haben gelernt, Schmerz zu ignorieren und auch unter extremen Bedingungen weiterzukämpfen."
schemaVersion: 1
source: legacy.world-rules
status: draft
summary: Zähigkeit ist eine grundlegende Überlebensfähigkeit, die es Charakteren ermöglicht, mehr Schaden zu ertragen und länger im Kampf zu bestehen.
traits:
  - trait.general
type: feat
---

# Zähigkeit

**Quelle:** Welt-Regelwerk (Zeitalter des Goldes)

---

## **Flavortext**

> „Hartnäckigkeit ist der Schlüssel zum Überleben in den Schatten der Stadt."

Zähigkeit ist eine grundlegende Überlebensfähigkeit, die es Charakteren ermöglicht, mehr Schaden zu ertragen und länger im Kampf zu bestehen. Diese Fähigkeit ist besonders wertvoll für Kämpfer und alle, die sich regelmäßig in gefährliche Situationen begeben.

---

## **Übersicht**

Zähigkeit erhöht die Trefferpunkte eines Charakters dauerhaft, wodurch er mehr Schaden überstehen kann. Diese Fähigkeit ist besonders nützlich für Frontkämpfer und Charaktere, die sich häufig in gefährlichen Situationen befinden.

---

## **Mechanische Details**

### **Voraussetzungen**
- **Stufe:** 1+
- **Konstitution:** 13+

### **Effekt**
- **Trefferpunkte:** +1 Trefferpunkt pro Charakterstufe
- **Stapelbar:** Nein (nur einmal erhältlich)

### **Berechnung**
- **Neue TP-Formel:** (Klassen-TP + Konstitutionsmodifikator + Stufe) × Stufen
- **Beispiel:** Ein Charakter der Stufe 5 mit Konstitution 16 (+3) und Klassen-TP 8 erhält: (8 + 3 + 5) × 5 = 80 TP

---

## **Spielmechanische Auswirkungen**

### **Vorteile**
- **Überlebensfähigkeit:** Deutlich erhöhte Widerstandsfähigkeit
- **Kampfdauer:** Längere Überlebenszeit in Kämpfen
- **Risikobereitschaft:** Ermöglicht aggressivere Taktiken
- **Gruppenschutz:** Kann als "Tank" für die Gruppe fungieren

### **Nachteile**
- **Feat-Slot:** Verbraucht einen wertvollen Feat-Slot
- **Frühe Investition:** Muss früh gewählt werden für maximale Wirkung
- **Spezialisierung:** Fokussiert auf Überleben statt andere Fähigkeiten

---

## **Synergien**

### **Gute Kombinationen**
- **Schnelle Erholung:** Verstärkt die Regenerationsfähigkeit
- **Zäher Hund:** Synergie mit niedrigen TP-Werten
- **Defensiver Kämpfer:** Kombiniert Überleben mit Verteidigung
- **Konstitutionsboni:** Verstärkt den Effekt zusätzlich

### **Klassenempfehlungen**
- **Söldner:** Frontkämpfer profitieren am meisten
- **Wächter:** Defensive Kämpfer nutzen die TP optimal
- **Raufbold:** Straßenkämpfer brauchen Überlebensfähigkeit
- **Agent:** Spione können riskantere Missionen überstehen

---

## **Taktische Anwendung**

### **Kampf**
- **Frontlinie:** Als Hauptziel für Gegner fungieren
- **Schutz:** Verbündete vor Schaden schützen
- **Durchhaltevermögen:** Lange Kämpfe überstehen
- **Risikomanagement:** Gefährliche Manöver wagen

### **Außerhalb des Kampfes**
- **Gefährliche Missionen:** Risikoreiche Aufträge übernehmen
- **Umweltgefahren:** Gift, Fallen, etc. besser überstehen
- **Tortur:** Widerstandsfähigkeit gegen Verhöre
- **Extreme Bedingungen:** Hitze, Kälte, Hunger besser ertragen

---

## **Fluff und Hintergrund**

### **Charakterkonzepte**
- **Veteran:** Erfahrener Kämpfer mit vielen Narben
- **Überlebenskünstler:** Jemand, der schon alles überlebt hat
- **Beschützer:** Jemand, der andere beschützen will
- **Glückspilz:** Jemand, der immer wieder dem Tod entrinnt

### **Geschichtliche Integration**
- **Kriegsveteranen:** Viele Söldner haben diese Fähigkeit
- **Slumbewohner:** Orks und andere Unterdrückte entwickeln Zähigkeit
- **Konzernangestellte:** Sicherheitskräfte und Bodyguards
- **Geheimdienstler:** Agenten, die gefährliche Missionen überstehen

---

## **Regeltechnische Details**

### **Interaktionen**
- **Magische Heilung:** Funktioniert normal mit erhöhten TP
- **Natürliche Heilung:** Regeneriert proportional zu den erhöhten TP
- **Temporäre TP:** Werden zu den erhöhten TP addiert
- **TP-Maximum:** Das neue Maximum wird dauerhaft erhöht

### **Spezialfälle**
- **TP-Verlust:** Verlorene TP werden normal behandelt
- **Bewusstlosigkeit:** Tritt bei 0 TP ein, unabhängig vom Maximum
- **Tod:** Tritt bei negativen TP ein, unabhängig vom Maximum
- **Regeneration:** Funktioniert normal mit erhöhten TP

---

## **Beschreibung im Spiel**

Zähigkeit ist eine der grundlegendsten Überlebensfähigkeiten im Zeitalter des Goldes. In einer Welt voller Gefahren, wo Konzernkriege, magische Anomalien und kriminelle Aktivitäten an der Tagesordnung sind, ist die Fähigkeit, mehr Schaden zu ertragen, oft der Unterschied zwischen Leben und Tod.

Diese Fähigkeit repräsentiert nicht nur physische Robustheit, sondern auch mentale Stärke und den Willen zu überleben. Charaktere mit Zähigkeit haben gelernt, Schmerz zu ignorieren und auch unter extremen Bedingungen weiterzukämpfen.
