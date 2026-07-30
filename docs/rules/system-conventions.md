# Systemkonventionen 0.1.0

Diese Konventionen schließen ausschließlich technische Auslegungslücken, die
aus dem vorhandenen Regelbestand sicher ableitbar sind. Eine fachlich offene
Kernregel erhält stattdessen eine `rules-decision.*`-ID und wird blockiert.

## Zahlen und Dauer

- Ein eindeutig bezifferter, bedingungsloser Modifikator ohne genannten Typ ist
  `untyped`. Die Migration erfindet keinen Status-, Umstands- oder Gegenstandstyp.
- Gewählte Abstammungs-, Herkunfts-, Klassen- und Talentmerkmale gelten
  dauerhaft, sofern der Regeltext eine Dauer oder Nutzung nicht ausdrücklich
  begrenzt.
- Situative Effekte bleiben außerhalb permanenter Summen. Sie werden als
  `partially-structured` oder `display-only` erklärt, bis ihre Bedingung formal
  modelliert ist.
- Attributsmodifikatoren sind `floor((Attribut - 10) / 2)`.
- Charakterstufen liegen zwischen 1 und 20. Zauberränge liegen zwischen 0 und
  10. Kompetenzränge enden bei `legendary`.

## Stapelung und Operationen

- Untypisierte Boni und Mali stapeln vollständig.
- Je Typ (`status`, `circumstance`, `item`) gilt nur der höchste positive Bonus
  und der niedrigste negative Malus. Bonus und Malus desselben Typs wirken
  gemeinsam.
- Die stabile Reihenfolge lautet: Basiswert, `set`/`replace`, Kompetenz,
  untypisierte Addition, typisierte Stapelung, `minimum`, `maximum`, finale
  Ableitung.
- Gleichrangige Effekte werden nach ihrer Quell-ID sortiert. Damit ist die
  Berechnung unabhängig von Dateisystem- und Katalogreihenfolge.
- `proficiency-rule:set` ersetzt einen Rang. `at-least` behält den höheren Rang.
  `increase` steigt schrittweise und höchstens bis `legendary`.
- Mehrfach gewährte Talente, Merkmale, Zauber, Gegenstände, Sprachen, Aktionen
  und Choices werden über ihre kanonische ID dedupliziert.

## Aktionen, Reichweite und Ressourcen

- Eine nicht genannte Aktionsart, Aktionszahl, Reichweite, Kapazität,
  Nachladezeit, Dauer oder Erholungsperiode wird nicht ergänzt.
- Ressourcen ohne vorhandenen Wert beginnen für die mathematische Operation bei
  null; dies gewährt die Ressource nicht automatisch. Nur ein
  `resource-rule` erzeugt einen berechneten Ressourceneintrag.
- Situative Bewegungs- und Kampfmodifikatoren werden nicht in permanente Werte
  eingerechnet, solange das gemeinsame Prädikatmodell ihre Bedingung nicht
  ausdrückt.

## Choices und automatische Vergaben

- Später ungültig gewordene Auswahlen bleiben im Character-Dokument erhalten.
  Die Engine meldet sie als `invalid` und nennt Voraussetzung, Ist- und Sollwert.
- Fehlende Pflichtauswahlen ergeben `incomplete`; fachlich blockierte
  Voraussetzungen ergeben `blocked`.
- Automatische Vergaben werden als Fixpunkt berechnet. Neue Merkmale werden
  erneut ausgewertet; jede Quell-ID wird dabei höchstens einmal verarbeitet.
- Automatisch freigeschaltete Choices verwenden denselben Resolver wie normale
  Choices. Es gibt keine zweite Auswahlsprache in der UI.

## IDs, Versionen und Fehler

- Character-Dokumente speichern Formatversion, Content-Schemaversion,
  Katalog-Hash sowie Erstellungs- und Speicherversion.
- Legacy-IDs werden ausschließlich über `content/legacy-aliases.json`
  aufgelöst. Schattenzuordnungen, Zyklen und unbekannte Ziele sind Buildfehler.
- Unbekannte alte Werte bleiben unter `legacyValues` erhalten und erzeugen
  einen sichtbaren Migrationskonflikt.
- Unbekannte Katalog-IDs, Effektarten und Prädikatarten werden nie ignoriert.
  Schemaparse- oder Referenzfehler brechen Compiler beziehungsweise Engine ab.
- Ein abweichender Katalog-Hash wird als Kompatibilitätsproblem gemeldet; es
  gibt keinen stillen Fallback auf einen leeren oder alten Katalog.

## Fachlich offene Regeln

`feat.general.zahigkeit` nennt in zwei Quellen unterschiedliche
Attributsvoraussetzungen. Der eindeutige TP-Effekt ist strukturiert, die Auswahl
bleibt jedoch unter `rules-decision.feat.zahigkeit-prerequisite` blockiert, bis
die Voraussetzung redaktionell entschieden ist.
