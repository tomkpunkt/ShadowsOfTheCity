# Spielbarer Charakterbogen

## Datenfluss

Der Charakterbogen verwendet keine eigene Charakterberechnung:

```text
CharacterDocument.build + CharacterDocument.session + Catalog
  -> calculateCharacter
  -> CalculatedCharacter
  -> CharacterSheetModel
  -> Webansichten, Druckmodell und Statblock
```

Buildentscheidungen werden im Creator geändert. Trefferpunkte, Zustände,
Verbräuche, Ausrüstung, Ressourcen, Würfe und Sitzungsnotizen liegen im
versionierten Session State. Änderungen werden nach 180 ms automatisch lokal
gespeichert; der zuletzt verwendete Bogenbereich und die Creator-/Bogenansicht
werden wiederhergestellt.

## Bereiche

Der Bogen besitzt zehn persistente Ansichten:

1. Übersicht
2. Kampf
3. Aktionen
4. Fertigkeiten
5. Talente und Merkmale
6. Zauber
7. Inventar
8. Ressourcen
9. Biografie und Notizen
10. Bogen und Export

Der Kopf hält TP, RK, Wahrnehmung, Bewegung, eine primäre Ressource sowie
Schnellaktionen für Schaden, Heilung, temporäre TP, Rast, Zustand, Speichern,
Bearbeiten, JSON und Druck erreichbar. Auf kleinen Viewports werden Kopfwerte
zweispaltig und die Hauptnavigation horizontal bedienbar dargestellt.

## Herkunft und Konflikte

Alle Aufschlüsselungen stammen aus `ExplainedValue` der Rules Engine.
Strukturierte Zustände und manuelle Modifikatoren laufen durch die normale
Effekt- und Stackingpipeline. Freie Zustände bleiben sichtbar, sind aber
informativ.

Nach Buildänderungen bleiben Session-Einträge erhalten. Die Engine kennzeichnet
ungültige Quellen als verwaist; der Bogen zeigt Ursache und eine kontrollierte
Löschaktion. Zauber, Talente und Inventar führen direkt in die passende
Creator-Seite zurück.

## Erweiterung

Neue berechnete Werte werden zuerst als Engine-Ergebnis mit Aufschlüsselung
implementiert und danach in `character-sheet/model.ts` projiziert. Neue
veränderliche Werte benötigen ein Feld im Session-Schema, eine reine Operation
in `packages/rules-engine/src/session.ts`, Migrationsdefaults, UI und Tests.
Regelformeln gehören niemals in React-Komponenten.
