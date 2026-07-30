# Legacy-Charaktermigration

Die Migration liegt in `apps/character-builder/src/storage.ts` und ist
deterministisch sowie separat testbar.

## Pipeline

```text
unversioniert / Format 0
  -> normalisierte Legacy-Felder
  -> Format 2

Format 1
  -> Aliasauflösung und Ausrüstungsübernahme
  -> Format 2

Format 2 mit altem Katalog
  -> Aliasauflösung und Konfliktprüfung
  -> aktueller Katalog-Hash oder teilweise inkompatibler Erhalt
```

Format 1 besaß keinen getrennten Ausrüstungszustand. Seine
`inventoryIds` werden deshalb einmalig auch als `equippedItemIds` übernommen.
Bei Format 2 bleiben Inventar und Ausrüstung getrennt erhalten.

## Aliasvertrag

`content/legacy-aliases.json` ist die einzige Aliasquelle. Der Compiler lehnt
Zyklen, unbekannte Ziele und Aliase ab, die eine kanonische Entität
überschreiben. Aufgelöste IDs werden an allen Identitäts-, Choice-, Inventar-
und Ausrüstungspositionen ersetzt.

## Kompatibilitätszustände

- `compatible`: Format und Katalog stimmen überein.
- `migrated`: alle Werte wurden eindeutig auf den aktuellen Katalog übertragen.
- `partially-incompatible`: mindestens ein Originalwert blieb mit Konflikt
  erhalten und erfordert Nutzerkorrektur.
- `unreadable`: JSON oder Format konnte nicht gelesen werden.

Ein abweichender Katalog-Hash allein ist keine Erlaubnis zum Löschen. Nur wenn
alle referenzierten IDs eindeutig auflösbar sind, wird der Hash aktualisiert.
