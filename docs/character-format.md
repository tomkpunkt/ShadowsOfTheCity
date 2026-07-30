# Character-Format 2

Version 0.1.0 speichert genau eine kanonische Charakterrepräsentation. Das
Zod-Schema `CharacterDocumentSchema` in `packages/shared/src/schemas.ts` ist
für Engine, Local Storage, Import und Export verbindlich.

## Pflichtfelder

```json
{
  "formatVersion": 2,
  "contentSchemaVersion": 1,
  "catalogHash": "<sha256>",
  "createdWithVersion": "0.1.0",
  "lastSavedWithVersion": "0.1.0",
  "name": "Nyx",
  "level": 1,
  "choices": {},
  "attributeBoosts": [],
  "inventoryIds": [],
  "equippedItemIds": [],
  "options": {},
  "migrations": [],
  "legacyValues": {}
}
```

Abstammung, Herkunft, Hintergrund und Klasse sind während des Aufbaus
optional. Die Engine meldet fehlende Kernauswahlen als `incomplete`.
`equippedItemIds` muss eine Teilmenge von `inventoryIds` sein.

## Erhalt und Validierung

- Unbekannte IDs werden nicht gelöscht. Migrationen halten sie samt Konflikt
  unter ihrer ursprünglichen Position fest.
- Unbekannte alte Felder werden unter `legacyValues` gespeichert.
- Ungültig gewordene Choices bleiben in `choices`; die Engine erklärt ihre
  verletzten Voraussetzungen.
- Jeder Migrationsnachweis nennt Schritt-ID, Quell- und Zielformat,
  Katalog-Hashes, Konflikte und erhaltene Werte.
- Export ist formatiertes, strikt validiertes JSON ohne Zeitstempel. Dadurch
  sind identische Dokumente byte-stabil.

## Speicherung

Der aktuelle Local-Storage-Schlüssel ist
`shadows-of-the-city.characters.v2`. Beim Laden werden zuerst v2 und danach die
bekannten v1-/unversionierten Schlüssel geprüft. Beschädigtes JSON wird als
`unreadable` gemeldet; es gibt keinen still akzeptierten Ersatzstand.
