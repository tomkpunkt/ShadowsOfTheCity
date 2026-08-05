# Character Builder

## Architektur

Die Webanwendung liegt unter `apps/character-builder` und verwendet React 19
mit Vite. Sie importiert ausschließlich `generated/catalog.json`,
`@sotc/shared` und `@sotc/rules-engine`. Klassen, Abstammungen, Hintergründe,
Choices, Talente, Zauber und Ausrüstung werden nicht in Komponenten definiert.

Die Oberfläche besitzt zwölf Arbeitsbereiche:

1. Übersicht
2. Abstammung und Herkunft
3. Hintergrund
4. Klasse und Klassenoption
5. Attribute
6. Fertigkeiten
7. Talente und automatische Merkmale
8. Zauber
9. Ausrüstung
10. vollständiges Kompendium
11. Abschlussprüfung
12. druckbarer Charakterbogen

## Interaktion

Jede Änderung erzeugt einen neuen `CharacterState` und ruft die Rules Engine
erneut auf. Choice-Karten unterscheiden verfügbare, ausgewählte, gesperrte und
ungültige Zustände. Gesperrte beziehungsweise ungültige Optionen enthalten den
ersten konkreten, deutsch formatierten Sperrgrund. Typabhängige Detailansichten
zeigen vollständigen Markdown-Body, strukturierte Regelwerte, Traits, Quelle,
Status und Herkunft, aber keine technische ID.

Die Volltextsuche berücksichtigt Name, Kurzbeschreibung, Regeltext, Traits,
Typ und Quelle. Das Kompendium macht alle 734 Runtime-Entitäten erreichbar und
bietet Typ- und Statusfilter, aktive Filteranzeige, Zurücksetzen und
schrittweises Nachladen. Levelnavigation blendet nur aktuell relevante Choices
ein. Eine frühere, inzwischen ungültige Auswahl wird weder beim Klassen- noch
beim Abstammungswechsel gelöscht.

Markdown wird mit `react-markdown` und `remark-gfm` sicher gerendert. Interne
Referenzen öffnen den Detaildialog; eingebettetes HTML wird nicht ausgeführt.

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
