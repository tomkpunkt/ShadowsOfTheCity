# Würfelablage

Die Würfelablage liegt in `packages/rules-engine/src/dice.ts` und verwendet
keine Codeauswertung. Erlaubt sind Summen und Differenzen aus Würfeltermen und
Ganzzahlen, zum Beispiel:

```text
1d20+8
2d6+4
1d8+1d6+3
```

Grenzen:

- höchstens 12 Terme
- höchstens 100 Würfel je Term
- 2 bis 1.000 Seiten
- endliche Ganzzahlmodifikatoren
- keine Bezeichner, Klammern oder beliebige Ausdrücke

Der Zufallszahlengenerator ist für Tests injizierbar. Die UI speichert Formel,
Einzelwürfe, Modifikator, Summe, Quelle und Zeit im Session State. Angriff,
Schaden, Fertigkeit und Rettungswurf können direkt würfeln; ohne SG erfolgt
keine automatische Erfolgsbewertung.
