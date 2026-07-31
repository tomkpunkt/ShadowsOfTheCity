# Character-Sheet-Baseline für Version 0.1.1

Stand: 31. Juli 2026  
Ausgangscommit: `f57dbd2968e84ca82dc0a62541eb149df9ed35eb`  
Ausgangsversion: `0.1.0`

## Prüfauftrag

Diese Bestandsaufnahme beschreibt den produktiven Charakterbogen vor Beginn der
Arbeiten an Version 0.1.1. Geprüft wurden Komponenten, Charaktermodell,
Rules-Engine-Anbindung, Speicherung, Import und Export, Druck, responsive
Darstellung, Tests sowie mögliche Alt- und Prototyppfade.

Vor produktiven Änderungen lief `npm run verify` vollständig erfolgreich.

## Baseline

| Bereich | Stand 0.1.0 |
|:--|:--|
| Runtime-Entitäten | 737 |
| Katalog-Hash | `0a4d85905617f2a12ff8a4a141fb099410f2910ee4f5c0e6fc992a8698df3c4b` |
| Character-Format | 2 |
| Content-Schema | 1 |
| Unit-/Integrationstests | 77 erfolgreich |
| E2E-Tests | 19 erfolgreich |
| JavaScript | 1.920,40 kB, 299,92 kB gzip |
| CSS | 27,98 kB, 6,17 kB gzip |
| lokales Bildasset | 2.571,28 kB |

Der Build meldet erwartungsgemäß einen Chunk oberhalb von 500 kB. Ursache ist
vor allem der synchrone Import des vollständigen `generated/catalog.json` in
`apps/character-builder/src/catalog.ts`.

## Produktive Pfade

Es gibt genau einen produktiven React-Einstieg und einen produktiven
Charakterbogen:

- `apps/character-builder/src/main.tsx` startet die Anwendung.
- `apps/character-builder/src/App.tsx` enthält Creator, Navigation,
  Detailansicht und `CharacterSheet`.
- `apps/character-builder/src/storage.ts` ist der einzige Pfad für Local
  Storage, Migration, JSON-Import und JSON-Export.
- `packages/shared/src/schemas.ts` definiert das verbindliche
  `CharacterDocumentSchema`.
- `packages/rules-engine/src/engine.ts` erzeugt das einzige ausgewertete
  Charaktermodell.
- `apps/character-builder/src/styles.css` enthält die Bildschirm- und
  Druckdarstellung.

Nicht angebundene Character-Sheet-, PDF-, Statblock-, Session-State- oder
Würfel-Prototypen wurden im Repository nicht gefunden.

## Vorhandene Funktionen

Der bestehende Charakterbogen ist als zwölfter Creator-Bereich erreichbar und
zeigt:

- Name, Stufe, Abstammung, Hintergrund und Klasse,
- maximale Trefferpunkte, Rüstungsklasse, Wahrnehmung und Bewegung,
- Attribute,
- Rettungswürfe,
- Klassen-SG und Zauber-SG,
- ausschließlich trainierte Fertigkeiten,
- zusammengefasste Listen für Talente und Merkmale, Zauber und Ausrüstung,
- Buildstatus und Zahl der geprüften Inhalte,
- einen Aufruf von `window.print()`.

Alle dargestellten Zahlen stammen aus `calculateCharacter`. Für die wenigen
vorhandenen Werte existiert damit keine zweite UI-Berechnung.

Der Creator bietet bereits:

- debounced Autosave nach Buildänderungen,
- explizites lokales Speichern,
- JSON-Import und JSON-Export,
- Format-0-/1-/2- und Katalogmigration,
- sichtbare Importkonflikte,
- Detaildarstellung für alle Katalogentitäten,
- responsive Creator-Navigation,
- Neuanlage eines Charakters mit Bestätigung.

## Character- und Session-Modell

`CharacterDocumentSchema` ist in Format 2 ein flaches Builddokument. Es enthält
Identität, Level, Entscheidungen, Attributsverbesserungen, Inventar-IDs,
ausgerüstete IDs, einfache Optionen, eine einzelne Notiz, Migrationen und
Legacywerte.

Ein versionierter Session State existiert nicht. Dadurch fehlen insbesondere:

- aktuelle und temporäre Trefferpunkte als veränderlicher Zustand,
- HP-Verlauf und Rückgängig-Funktion,
- aktive und beendete Zustände,
- manuelle temporäre Modifikatoren,
- aktuelle Ressourcenstände und Nutzungsverläufe,
- verbrauchte Zauberplätze,
- Aktions- und Fähigkeitsnutzungen,
- Mengen, Munition, Ladungen und Verbrauchszustände von Gegenständen,
- Geldänderungen,
- strukturierte Sitzungsnotizen,
- Würfelverlauf,
- verwaiste Session-Einträge nach Buildänderungen.

`equippedItemIds` liegt derzeit im dauerhaften Builddokument, obwohl
Ausrüstungsaktivierung nach dem Zielmodell Session State sein soll. Die
Inventarauswahl fügt einen Gegenstand zugleich zum Inventar und zur
ausgerüsteten Menge hinzu. Menge, Trageort und Aktivierung können nicht getrennt
werden.

## Rules Engine

Die Engine liefert bereits wesentlich mehr als der Charakterbogen verwendet:

- `ExplainedValue` mit vollständigem `breakdown` und Quellen-IDs,
- maximale Trefferpunkte und einen berechneten temporären TP-Wert,
- Rüstungsklasse, Wahrnehmung, Initiative, Rettungswürfe und Fertigkeiten,
- Klassen-SG, Zauber-SG und Zauberangriff,
- Zauberplätze nach Rang,
- Waffenangriffe einschließlich Angriffsbonus, Schaden, Reichweite,
  Kapazität, Nachladen und Traits,
- Bewegungstypen,
- Last,
- Sprachen und Kompetenzen,
- gewährte und gewählte Talente, Merkmale, Zauber, Gegenstände und Aktionen,
- datengetriebene Aktionen,
- Ressourcenmaxima und deren Aufschlüsselungen,
- strukturierte Buildprobleme und ignorierte Textregeln.

Diese Daten sind im rudimentären Bogen nicht oder nur teilweise angebunden.
Insbesondere fehlen Wertaufschlüsselungen, Initiative, Sprachen, Last,
Zauberangriff, Zauberplätze, Ressourcen, Aktionen, Angriffe und
Kompetenzränge.

Die Engine akzeptiert bislang ausschließlich den Build. Session-Effekte,
manuelle Modifikatoren und aktive Zustände können daher noch nicht über
denselben Berechnungspfad einfließen.

## Speicherung und Migration

Der produktive Schlüssel lautet
`shadows-of-the-city.characters.v2`. Gespeichert wird eine Collection-Hülle mit
einem aktiven Format-2-Dokument. Autosave reagiert nur auf Änderungen am
Buildobjekt und ist auf 180 ms entprellt.

Stärken des bestehenden Pfads:

- Zod validiert Speichern, Laden, Import und Export.
- Unbekannte IDs und Felder werden bei Legacy-Migrationen erhalten.
- Katalogkonflikte werden sichtbar gemeldet.
- Identische Dokumente werden ohne Zeitstempel byte-stabil exportiert.
- Beschädigte Daten ersetzen den aktiven Build nicht stillschweigend.

Lücken für 0.1.1:

- keine unabhängige Validierung und Reparatur des Session State,
- keine Migration von Format 2 auf ein Build-/Session-Dokument,
- keine Erhaltung eines beschädigten Session-Originals für späteren Export,
- keine Konfliktprüfung zwischen geändertem Build und bestehender Sitzung,
- kein vollständiger Export mit optionalen Sitzungsnotizen.

## Druck, PDF und Statblock

Die Druckfunktion ruft nur `window.print()` für dieselbe
`CharacterSheet`-DOM-Struktur auf. Print-CSS entfernt Navigation und
Hintergrundbild, definiert aber:

- kein A4-Seitenmodell,
- keine Seitenstruktur,
- keine stabilen Seitenumbrüche,
- keine bedingte Zauberseite,
- keine Fortsetzungslogik für lange Listen,
- keine Graustufenprüfung,
- kein eigenes Druckdatenmodell.

Ein direkter PDF-Export existiert nicht. Browserdruck ist der einzige
Ausgabepfad. Ein kompakter Statblock existiert weder als Datenmodell noch als
Web-, Text- oder Druckansicht.

## Responsive Darstellung und Bedienbarkeit

Der Creator besitzt getestete Desktop- und Mobile-Raster. Der bisherige Bogen
fällt unterhalb der Desktopbreite von drei auf eine Spalte zurück; sein Kopf
wird gestapelt und die vier Vitalwerte werden zweispaltig.

Für eine Spieloberfläche fehlen:

- feste oder schnell erreichbare Bogen-Navigation,
- persistierter letzter Bereich,
- mobile Schnellaktionen für Schaden, Heilung und Zustände,
- Kontextpanel beziehungsweise Detailsheets,
- Touch-optimierte Zustands-, Ressourcen- und Inventarsteuerung,
- Fokusmanagement für Dialoge,
- Live-Regionen für wichtige Sitzungsänderungen.

Status besitzt Text und Symbol und wird nicht ausschließlich über Farbe
vermittelt. Die neuen interaktiven Anforderungen sind mangels Funktionen noch
nicht auf Tastatur- oder Screenreader-Nutzung prüfbar.

## Nicht persistierte UI-Zustände

Folgende Zustände gehen bei einem Reload verloren:

- aktiver Creator- beziehungsweise Bogenbereich,
- geöffnete Detailentität,
- Zustand der mobilen Seitenleiste,
- Such-, Filter-, Sortier- und Gruppierungswerte,
- sichtbares Ergebnislimit des Kompendiums.

Spielzustände werden nicht nur nicht persistiert, sondern existieren noch
nicht.

## Doppelte oder provisorische Logik

- `CharacterSheet` lebt direkt in der großen `App.tsx`; fachliche Bereiche
  besitzen keine eigenen Komponenten oder View-Modelle.
- Der Druckbutton existiert im Workspace-Kopf und erneut im Bogenkopf.
- Inventaraufnahme und Ausrüsten sind in einer einzigen UI-Aktion gekoppelt.
- Die `notes`-Zeichenkette deckt weder Biografie noch strukturierte
  Sitzungsnotizen ab.
- `temporaryHitPoints` ist ein berechneter Enginewert, aber kein verwaltbarer
  Sitzungswert.
- Der Charakterbogen formatiert Pluszeichen direkt in der UI. Das ist
  Darstellung, keine Regellogik; die wiederholte Formatierung sollte dennoch
  zentralisiert werden.

Eine zweite produktive Charakterberechnung wurde nicht gefunden.

## Hart codierte Werte

Folgende Werte sind im aktuellen Pfad fest verdrahtet:

- Local-Storage-Schlüssel und Formatnummer 2,
- Autosave-Verzögerung 180 ms und Speicherindikator 1.200 ms,
- Creator-Schrittliste und deren Reihenfolge,
- vier Vitalwerte und drei Bogen-Spalten,
- Textzusammenfassung über den Trenner `·`,
- Einheit `Fuß`,
- Print-Kopf und Einseitenstruktur,
- Kompendium-Startlimit 96,
- Mobile-Grenze 760/761 px.

Die Zahlen des Charakters selbst werden nicht hart codiert.

## Testabdeckung

Die Baseline besitzt starke Tests für Build, Content und Engine:

- Schema- und Character-Format-2-Validierung,
- Legacy- und Katalogmigration,
- Formeln und Herkunftsnachweise der Engine,
- reale Kampf-, Zauber-, Technik-, Skill- und Legacy-Builds,
- Creator-Navigation, Katalog, Markdown und responsive Grenzen,
- JSON-Roundtrip und Reload.

Für den Charakterbogen prüft E2E nur:

- Navigation zum Bereich,
- Aufruf von `window.print()`.

Nicht getestet werden Inhalt und Layout des Druckbogens, HP-Interaktionen,
Zustände, Ressourcen, Aktionen, Angriffe, Würfe, Zauberplatzverbrauch,
Inventarmengen, Session-Roundtrip, Statblock oder PDF.

Die visuelle Suite schreibt Screenshots bei jedem Lauf direkt in den
Dokumentationsordner und vergleicht sie nicht gegen feste Referenzen. Mehrere
PNG-Dateien ändern sich bei einem unveränderten Quellstand. Das ist ein
provisorischer Aufnahmeprozess, kein stabiler visueller Regressionstest.

## Abweichung zum Zielbild 0.1.1

Der vorhandene Bogen ist eine korrekte, aber statische Buildzusammenfassung.
Er ist keine zentrale Spieloberfläche. Die wichtigste Architekturarbeit ist
daher nicht eine Erweiterung einzelner Karten, sondern:

1. Format 3 mit strikt getrenntem `build` und versioniertem `session`,
2. Session-State-Operationen als getestete Domänenfunktionen,
3. Engine-Auswertung aus Build, Session und Katalog,
4. eigenes Character-Sheet-View-Model aus dem Engine-Ergebnis,
5. modularer Bogen mit zehn spielbaren Hauptbereichen,
6. separate Druck- und Statblock-View-Modelle,
7. lazy geladene Katalogdetails statt synchron eingebettetem Vollkatalog.

## Phase-0-Ergebnis

Die Ausgangslage ist stabil und alle vorhandenen Prüfungen bestehen. Es gibt
keinen alten Parallelbogen zu entfernen. Die vorhandene Rules Engine liefert
eine tragfähige Basis, muss aber kontrolliert um Session-Eingaben und
Session-Erklärungen erweitert werden. Produktive Implementierung beginnt erst
mit dem Format-3- und Session-State-Modell.
