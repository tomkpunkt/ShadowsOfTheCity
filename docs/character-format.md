# Character-Format 3

Version 0.1.1 trennt dauerhafte Charakterentscheidungen von veränderlichem
Sitzungszustand. Das Zod-Schema `CharacterDocumentSchema` in
`packages/shared/src/schemas.ts` ist für Engine, Local Storage, Import und
Export verbindlich.

## Dokumentstruktur

```json
{
  "formatVersion": 3,
  "contentSchemaVersion": 1,
  "catalogHash": "<sha256>",
  "createdWithVersion": "0.1.1",
  "lastSavedWithVersion": "0.1.1",
  "build": {
    "name": "Nyx",
    "level": 1,
    "choices": {},
    "attributeBoosts": [],
    "inventoryIds": [],
    "options": {},
    "biography": {}
  },
  "session": {
    "version": 1,
    "currentHp": null,
    "temporaryHp": 0,
    "conditions": [],
    "resources": {},
    "spellSlotUsage": {},
    "actionUses": {},
    "itemStates": {},
    "manualModifiers": [],
    "notes": [],
    "hpHistory": [],
    "log": [],
    "diceHistory": [],
    "activeView": "overview"
  },
  "migrations": [],
  "legacyValues": {}
}
```

`currentHp: null` bedeutet, dass noch kein Sitzungswert gesetzt wurde. Die
Rules Engine verwendet dann die berechneten maximalen Trefferpunkte. Nach der
ersten HP-Änderung wird ein konkreter, begrenzter Wert gespeichert.

## Build

Der Build enthält ausschließlich dauerhafte Entscheidungen:

- Identität und Stufe,
- Abstammung, Herkunft, Hintergrund und Klasse,
- Choices und Attributsverbesserungen,
- dauerhaft erworbenes Inventar,
- dauerhafte Optionen,
- Biografie und allgemeine Buildnotiz.

Fehlende Kernauswahlen sind während des Aufbaus erlaubt und werden von der
Engine als `incomplete` gemeldet.

## Session State

Der Session State ist eigenständig mit Version 1 validiert. Er enthält:

- aktuelle und temporäre Trefferpunkte,
- HP-Verlauf,
- Zustände,
- aktuelle Ressourcen,
- verbrauchte Zauberplätze,
- verwendete begrenzte Aktionen,
- Mengen, Ausrüstung, Aktivierung, Verbrauch und Munition,
- sichtbare manuelle Modifikatoren,
- Sitzungsnotizen und Ereignisverlauf,
- Würfelergebnisse,
- zuletzt verwendeten Bogenbereich.

Ausgerüstete Gegenstände liegen nicht mehr im Build. Nur ein im Session State
ausgerüsteter oder aktiver Gegenstand liefert strukturierte Effekte an die
Rules Engine.

## Erhalt und Validierung

- Build und Session werden unabhängig validiert.
- Ein beschädigter Session State verwirft keinen gültigen Build.
- Das unlesbare Session-Original bleibt unter
  `legacyValues.unreadableSessionState` exportierbar.
- Unbekannte Build- und Session-IDs werden nicht gelöscht.
- Die Engine meldet Session-Einträge ohne gültige Buildquelle als verwaist.
- Manuelle Modifikatoren erscheinen mit eigener Session-Quelle in
  Wertaufschlüsselungen.
- Jeder Migrationsnachweis nennt Schritt-ID, Quell- und Zielformat,
  Katalog-Hashes, Konflikte und erhaltene Werte.

## Migration

Format 0, 1 und 2 werden deterministisch auf Format 3 migriert. Vorherige
`equippedItemIds` werden in `session.itemStates` überführt. Fehlende
Session-Werte erhalten leere Defaults; es werden keine Zustände, Verbräuche
oder Schäden erfunden.

Der aktuelle Local-Storage-Schlüssel ist
`shadows-of-the-city.characters.v3`. Beim Laden werden danach die bekannten
v2-, v1- und unversionierten Schlüssel geprüft.
