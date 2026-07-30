# Character Builder

## Architektur

Die Webanwendung liegt unter `apps/character-builder` und verwendet React 19
mit Vite. Sie importiert ausschließlich `generated/catalog.json`,
`@sotc/shared` und `@sotc/rules-engine`. Klassen, Abstammungen, Backgrounds,
Choices, Feats, Zauber und Ausrüstung werden nicht in Komponenten definiert.

Die Oberfläche besitzt elf Arbeitsbereiche:

1. Übersicht
2. Abstammung und Herkunft
3. Background
4. Klasse und Klassenoption
5. Attribute
6. Skills
7. Feats und automatische Features
8. Zauber
9. Ausrüstung
10. Abschlussprüfung
11. druckbarer Charakterbogen

## Interaktion

Jede Änderung erzeugt einen neuen `CharacterState` und ruft die Rules Engine
erneut auf. Choice-Karten zeigen `available`, `selected`, `locked` oder
`invalid`. Gesperrte beziehungsweise ungültige Optionen enthalten den ersten
konkreten Requirement-Failure; die Detailansicht zeigt vollständigen
Markdown-Body, Traits, Quelle, Status und stabile ID.

Suche und kontextabhängige Filter arbeiten auf dem kompilierten Katalog.
Levelnavigation blendet nur aktuell relevante Choices ein. Eine frühere,
inzwischen ungültige Auswahl wird weder beim Klassen- noch beim
Abstammungswechsel gelöscht.

## Speicherung

Der aktive Build wird debounced und versioniert in `localStorage` gespeichert.
Das JSON-Format enthält:

- `formatVersion`
- `catalogHash`
- Kernentscheidungen
- Choice-IDs mit ausgewählten Entitäts-IDs
- freie Attributsverbesserungen
- Inventar
- optionale Notizen
- durchgeführte Katalogmigrationen und Konflikte

JSON-Export verwendet dasselbe Format. Beim Import validiert Zod die komplette
Struktur. Sind alle IDs im aktuellen Katalog vorhanden, wird ein abweichender
Hash protokolliert und aktualisiert. Bei unbekannten IDs bleibt der alte Hash
erhalten; alle Werte bleiben sichtbar und die Abschlussprüfung listet jeden
Konflikt.

## Visuelles System

Das eigenständige Design ist eine kompakte Arbeitsoberfläche mit heller
Inhaltsfläche, dunkler Navigation, Petrol für aktive Zustände, Gold für offene
Entscheidungen und Rot für Fehler. Die lokale Stadtillustration unter
`src/assets/city-builder.png` wurde eigens für dieses Projekt erzeugt. Sie
erscheint in Navigation und Charakterbogen, enthält keine fremden Marken oder
UI-Vorlagen.

Bei schmalen Viewports startet die Navigation geschlossen und klappt nach einer
Auswahl wieder ein. Karten, Metriken und Attributfelder verwenden feste
responsive Raster. Der Charakterbogen besitzt eigene Print-Styles und bezieht
alle Werte aus `CalculatedCharacter`.

## Entwicklung und Build

`npm run dev` kompiliert den Content vor dem Start. Das Vite-Plugin beobachtet
`content/**/*.md`, startet bei Änderungen den Compiler und lässt Vite den
aktualisierten Katalog neu laden. Compilerfehler erscheinen mit Dateipfad im
Terminal; ein ungültiger Startkatalog verhindert den Start.

`npm run build` kompiliert Content, führt Typecheck und Tests aus und baut danach
die Workspaces. `npm run content:check-generated` vergleicht alle drei
generierten Dateien bytegenau mit einer frischen In-Memory-Kompilierung.
