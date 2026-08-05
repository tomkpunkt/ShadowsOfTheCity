# Migration

## Quelle und Ziel

Die 64 ursprünglichen Markdown-Dateien bleiben unverändert in ihren
Legacy-Verzeichnissen. `packages/content-compiler/src/migrate.ts` liest sie mit
Unified, Remark und GFM als Syntaxbaum und erzeugt versionierte
Authoring-Dateien unter `content/`. Die Migration verwendet keine
oberflächliche Volltext-RegEx als primären Parser.

`content/migration-manifest.json` ordnet jeder Quelle erzeugte IDs, automatisch
übernommene Felder, manuelle Ergänzungen, Warnungen und Ausnahmen zu. Der
menschenlesbare Bericht liegt in `docs/review/02-migration-report.md`.

## Reproduzierbarer Lauf

```bash
npm run content:migrate
npm run content:migration:verify
npm run content:compile
npm run content:check-generated
```

`migrate` erzeugt Authoring-Dateien, Manifest und Review-Bericht neu.
`migrate:verify` vergleicht alle mechanischen Quellen und die Baseline-
Mindestzahlen. Ein nicht zugeordnetes Ausgangsdokument oder ein nicht
dokumentierter Verlust beendet den Lauf mit Fehler.

## Entscheidungen

- Backgrounds und Spellcasting-Progressionen sind gekennzeichnete
  Playtest-Ergänzungen, weil die Quellen keine vollständigen formalen Entitäten
  enthielten.
- Die Baseline zählte 41 Waffenvorkommen; nach Zusammenführung des doppelt
  beschriebenen `Seelenfänger` bestehen 40 stabile Waffenentitäten.
- Rangkonflikte bei Zaubern verwenden vorläufig die Detaildatei und bleiben im
  Legacy-Hinweis erhalten.
- Bestiary-Statblöcke bleiben als `creature` mit `legacySystem: dnd5e`
  isoliert.
- Nicht eindeutige Sonderregeln bleiben als nicht maschinenlesbare Texteffekte
  erhalten und werden nicht als implementiert ausgegeben.

## Katalog- und Charaktermigration

Katalogdaten werden immer aus Authoring-Dateien neu kompiliert. Gespeicherte
Charaktere tragen `formatVersion` und `catalogHash`. Beim Import wird ein
abweichender Hash aktualisiert, wenn alle IDs noch existieren. Andernfalls
bleiben Hash und unbekannte Werte erhalten, und jeder Konflikt wird sichtbar
gemeldet. Die Migration wird mit Quellhash, Zielhash, Zeitpunkt und
Konfliktliste im Charakter protokolliert.

## Künftige Schema-Migrationen

Neue Schema-Versionen benötigen eine explizite Transformationsfunktion,
Fixture-Tests und eine aktualisierte Manifest-/Review-Dokumentation. Alte
Versionen dürfen weder stillschweigend akzeptiert noch verworfen werden.
