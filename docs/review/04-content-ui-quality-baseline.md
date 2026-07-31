# Content- und UI-Qualitätsbaseline

Die Baseline wird von `scripts/audit-content-quality.ts` aus dem kompilierten
Katalog erzeugt. Sie beschreibt den Zustand vor der UI-Qualitätsschicht und
bleibt dadurch reproduzierbar.

## Katalog

| Entitätstyp | Anzahl |
|:--|:--|
| `ancestry` | 8 |
| `armor` | 26 |
| `background` | 8 |
| `choice` | 168 |
| `class` | 9 |
| `class-feature` | 99 |
| `creature` | 34 |
| `equipment` | 164 |
| `feat` | 195 |
| `heritage` | 40 |
| `language` | 10 |
| `proficiency` | 16 |
| `rule` | 4 |
| `skill` | 19 |
| `spell` | 14 |
| `spellcasting-progression` | 3 |
| `trait` | 30 |
| `weapon` | 64 |

## Automatisierte Qualitätszahlen

- Vollständige sichtbare Beschreibungen aus Kurztext, Regeltext und typisierten Details: 911
- Leere Beschreibungen: 0
- Alttexte mit weniger als 40 Klartextzeichen: 42
- Verdächtige technische Labels: 0
- Sichtbare Platzhaltermuster: 0
- Entitäten mit Markdown-Struktur: 139
- Entitäten mit nicht maschinenlesbarer Textregel: 410
- Katalogfelder, die vor diesem Auftrag nicht in der generischen Detailansicht sichtbar waren: 66

## UI-Ausgangslage

- Markdown-Unterstützung: keine Parser-Pipeline; Detailtexte wurden als Klartext ausgegeben.
- Kurztexte: reguläre Ausdrücke entfernten Markdown-Zeichen ohne AST.
- Labels: einzelne lokale Maps in `App.tsx`; Entitätstyp, Status, Quelle und mehrere Enum-Werte wurden roh ausgegeben.
- Details: generischer Drawer mit Name, Typ, Beschreibung, Quelle, Status und technischer ID.
- Suche: Name und Beschreibung, ohne Traits, Typ, Quelle oder strukturierte Regelfelder.
- Filter: Verfügbarkeit bei Choices und Typ bei Ausrüstung, ohne zentrale Reset- oder Aktivanzeige.
- Reichweite: direkte Kernentscheidungen, Engine-Choices und Ausrüstung; kein vollständiges Kompendium.

## Unsichtbare Felder der Ausgangsansicht

- `actions`
- `additionalLanguagesFromIntelligence`
- `ancestryId`
- `appliesTo`
- `armorClass`
- `attribute`
- `availability`
- `boosts`
- `bulk`
- `capacity`
- `castingAttribute`
- `category`
- `categoryId`
- `choice`
- `choiceIds`
- `classId`
- `damage`
- `defense`
- `dexterityCap`
- `duration`
- `editorialStatus`
- `effects`
- `examples`
- `featIds`
- `featureIds`
- `flavorText`
- `flaws`
- `freeBoosts`
- `grantedFeatIds`
- `groupId`
- `hands`
- `heightened`
- `heritageIds`
- `hp`
- `hpPerLevel`
- `initialProficiencies`
- `itemBonus`
- `key`
- `keyAttributes`
- `languageIds`
- `legacy`
- `legacySystem`
- `limitations`
- `mode`
- `origins`
- `prerequisites`
- `priceGp`
- `proficiencyByLevel`
- `range`
- `rarity`
- `references`
- `repertoireByLevel`
- `rulesText`
- `schemaVersion`
- `size`
- `slotsByLevel`
- `speed`
- `spellcastingProgressionId`
- `subcategory`
- `summary`
- `target`
- `technologyLevel`
- `tradition`
- `trainedSkillChoices`
- `trainedSkillIds`
- `value`

Die aktuelle Reichweite nach Umsetzung wird separat durch
`generated/builder-reachability-report.json` belegt.
