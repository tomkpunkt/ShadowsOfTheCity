# Content-Schema

## Geltungsbereich

Der kanonische Authoring-Layer liegt unter `content/`. Jede Markdown-Datei
enthält YAML-Frontmatter nach Schema-Version 1 und einen erhaltenen Markdown-
Body. Die Runtime-Schemas liegen in `packages/shared/src/schemas.ts`; die daraus
abgeleiteten TypeScript-Typen werden aus `@sotc/shared` exportiert.

Das Schema kennt die Entitätstypen `class`, `class-feature`, `ancestry`,
`heritage`, `background`, `skill`, `feat`, `spell`,
`spellcasting-progression`, `weapon`, `armor`, `equipment`, `trait`,
`language`, `proficiency`, `choice`, `effect`, `rule`, `condition`,
`resource`, `cyberware`, `creature` und `character-build`.

## Gemeinsame Felder

Jede Entität besitzt:

- `schemaVersion`: aktuell exakt `1`
- `id`: stabile ASCII-ID aus Segmenten, zum Beispiel `spell.feuerball`
- `type`: geschlossener Entitätstyp
- `name`: lokalisierbarer Anzeigename, nicht Teil der Referenzlogik
- `summary`: verständliche Kurzbeschreibung für Karten und Suchergebnisse
- `source`: stabile Quellen-ID
- `status`: `draft`, `playtest`, `canonical` oder `legacy`
- `traits`: auflösbare Trait-IDs
- `references`: zusätzliche explizite Referenzen
- `legacy`: optionale Quellpfade und Migrationshinweise

Der Markdown-Body wird beim Kompilieren als `description` übernommen. Eine
Umbenennung ändert eine bestehende ID nicht. Die einmalig erzeugten Legacy-IDs
gelten nach der Migration als unveränderlich.

## Referenzen

Referenzen verwenden ausschließlich IDs. Der Compiler durchsucht typisierte
ID-Felder, Traits, Ausschlüsse, explizite Referenzlisten und interne
Markdown-Referenzen. Jede Referenz muss auf genau eine Entität zeigen. Doppelte
IDs und tote Referenzen sind harte Buildfehler.

```yaml
trainedSkillIds:
  - skill.medicine
grantedFeatIds:
  - feat.general.zaehigkeit
```

Im Markdown-Body sind `[[feat.general.zaehigkeit]]` und
`[[feat.general.zaehigkeit|Zähigkeit]]` zulässig. Beide Formen werden beim
Kompilieren aufgelöst und im Builder als interne Detailverknüpfung dargestellt.

## Voraussetzungen

`PredicateSchema` ist ein rekursiver, strikt validierter Ausdrucksbaum. Er
unterstützt `all`, `any`, `not`, Level, Attribute, Proficiency, Klasse,
Abstammung, Background, Traits, Feats, Features, Zaubertradition, bekannte
Zauber, Gegenstände und Ressourcen. Zusätzliche Schlüssel oder unbekannte
Operatoren werden abgelehnt.

```yaml
prerequisites:
  - all:
      - characterLevel:
          gte: 4
      - proficiency:
          id: skill.athletics
          rankAtLeast: expert
```

## Effekte

Maschinenlesbare Effekte umfassen Attribute, typisierte Modifikatoren,
Proficiency, Trefferpunkte, Bewegung, Wahrnehmung, Rettungswürfe,
Skill-Training, Waffen- und Rüstungsproficiency, gewährte Feats und Features,
Zauberzugang, Ressourcen, freigeschaltete Choices und bedingte Effekte.

Nicht eindeutig formalisierbare Legacy-Regeln werden ausdrücklich so markiert:

```yaml
effects:
  - kind: text
    text: Einmal pro Tag darf die Probe wiederholt werden.
    machineReadable: false
```

`machineReadable: false` verhindert, dass erhaltene Regelprosa fälschlich als
berechnete Regel ausgegeben wird. Für den Builder notwendige Kernwerte werden
in späteren Schema-Migrationen schrittweise formalisiert.

## Choices

Eine Choice enthält stabile ID, Level, Art, Mindest- und Höchstzahl, Filter,
Voraussetzungen, Effekte, Ausschlüsse und Wiederholbarkeit. Filter können
Entitätstyp, Traits, Klasse, Abstammung, Kategorie, Tradition und Level
einschränken. Der Compiler bricht ab, wenn eine verpflichtende Choice nicht
genügend mögliche Optionen besitzt oder Choice-Freischaltungen einen Zyklus
bilden.

## Versionierung

Schema-Versionen werden nicht implizit hochgestuft. Eine neue Version benötigt:

1. ein neues Runtime-Schema,
2. eine deterministische Datenmigration,
3. Tests für alte und neue Eingaben,
4. eine aktualisierte Authoring-Dokumentation,
5. einen neu kompilierten Katalog.

Eine nicht unterstützte `schemaVersion` ist ein harter Fehler.
