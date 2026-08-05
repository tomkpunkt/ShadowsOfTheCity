# Session State

## Verantwortung

Der Session State beschreibt ausschließlich veränderliche Werte einer
Spielsitzung. Er überschreibt keine dauerhafte Buildentscheidung. Die
kanonische Auswertung lautet:

```text
CharacterDocument.build
  + CharacterDocument.session
  + Catalog
  -> Rules Engine
  -> CalculatedCharacter
```

Die React-Oberfläche verändert Session-Werte über reine Funktionen aus
`packages/rules-engine/src/session.ts`. Trefferpunkte, Ressourcenlimits,
Zauberplätze und regelwirksame Modifikatoren werden nicht in Komponenten
berechnet.

## Trefferpunkte

`applyDamage` verbraucht zuerst temporäre Trefferpunkte und reduziert danach
aktuelle Trefferpunkte bis mindestens null. `applyHealing` begrenzt Heilung auf
das berechnete Maximum. `setTemporaryHp` setzt den konkreten temporären Wert.

Jede Änderung erzeugt einen Eintrag in `hpHistory`. `undoLastHpChange` stellt
die Werte vor der letzten Änderung wieder her und protokolliert den Undo-Schritt.
Negative, nicht endliche und ungültige Eingaben werden abgewiesen.

## Zustände

Ein Zustand besitzt eine Session-ID, Anzeigename, optionale Katalog-ID, Quelle,
optionalen Wert, Dauer, Startangabe, Notiz und Aktivstatus. Freie Zustände
bleiben sichtbar, verändern aber keine Werte.

Ist `conditionId` gesetzt und verweist auf eine strukturierte
`condition`-Entität, nimmt die Engine deren Effekte nur im aktiven Zustand in
die gemeinsame Effektpipeline auf.

## Manuelle Modifikatoren

Manuelle Modifikatoren besitzen Ziel, optionalen Selektor, Wert, Bonustyp,
Quelle, Bedingung, Dauer, Notiz und Aktivstatus. Aktive Einträge werden von der
Engine in dieselbe Stacking- und Aufschlüsselungspipeline wie Content-Effekte
eingespeist. Ihre Herkunft beginnt mit `session.` und bleibt damit sichtbar.

## Ressourcen und Nutzungen

Ressourcen speichern aktuellen Wert, optionales Maximum, Quelle, Gruppe und
Wiederherstellungsregel. Das tatsächliche Maximum stammt bevorzugt aus dem
ausgewerteten Build. Änderungen werden auf null und Maximum begrenzt.

Unterstützte Wiederherstellungen:

- `encounter`
- `short-rest`
- `daily`
- `manual`
- `never`

Eine Rast füllt nur passende Ressourcen. Zauberplatzverbrauch und begrenzte
Aktionen besitzen getrennte, begrenzte Nutzungszähler.

## Gegenstände

`itemStates` hält Menge, ausgerüsteten und aktiven Zustand, Verbrauch,
Munition, Trageort und Notiz. Der Build enthält nur die dauerhaft erworbenen
Inventar-IDs.

Die Engine wendet Gegenstandseffekte nur an, wenn:

- der Gegenstand zum aktuellen Buildinventar gehört,
- seine Menge größer als der Verbrauch ist,
- er ausgerüstet oder ausdrücklich aktiv ist.

Ein Session-Eintrag bleibt bei einer Buildänderung erhalten und wird als
verwaist gemeldet, bis der Nutzer ihn kontrolliert entfernt oder die Quelle
wiederherstellt.

## Migration und Reparatur

Format-2-Inventar wird beim Import verlustfrei auf Build und Session verteilt.
Ausgerüstete IDs werden zu ausgerüsteten Session-Gegenständen mit Menge 1.

Kann ein Format-3-Sessionblock nicht validiert werden, wird:

1. der Build separat validiert,
2. ein leerer Session State eingesetzt,
3. ein sichtbarer Konflikt erzeugt,
4. das ursprüngliche Sessionobjekt unter `legacyValues` erhalten.

Dadurch bleibt ein gültiger Charakter auch bei reparaturbedürftigen
Sitzungsdaten verwendbar.
