# Abschlussprüfung für Content und UI

## 1. Vollständigkeit

- Aktive Entitäten: 734, davon 724 Altbestand und 10 Testinhalte
- Im Builder erreichbar: 734 von 734
- Auswählbar: 356
- Automatisch oder über Choices eingebunden: 298
- Informativ über das neue Kompendium eingebunden: 80
- Erlaubte Ausnahmen: 0
- Zuvor ohne regulären Builder-Pfad, nun über das Kompendium eingebunden: 80
- Nach den typspezifischen Qualitätskriterien unvollständig: 0
- Gesperrte Entwürfe: 0

Der Einzelbeleg steht in `generated/builder-reachability-report.json`. Jede
Entität enthält Referenzen, Rückreferenzen, Erreichbarkeitsweg,
Detaildarstellbarkeit und Art ihrer Regelwirkung.

## 2. Textqualität

- Gefundene aktive Platzhalter: 0
- Entfernte aktive Platzhalter: 0
- Mit einer aus der vorhandenen Quelle abgeleiteten Kurzbeschreibung versehen: 734
- Direkt redaktionell überarbeitete Regeltexte: 5
- Vollständige sichtbare Beschreibungen aus Kurztext, Regeltext und typisierten Details: 734
- Alttexte unter 40 Klartextzeichen: 208; sie werden nicht als alleinige
  Detaildarstellung verwendet
- Fachlich offene Textregeln: 410, ausdrücklich als nicht maschinenlesbar
  gekennzeichnet

Die Terminologie verwendet unter anderem `Talent`, `Merkmal`, `Hintergrund`,
`Fertigkeit`, `Kompetenz`, `Stufe`, `Rang` und `Fuß` konsistent. Fehlende
fachliche Regeln wurden nicht erfunden.

## 3. Labels

- Zentral lokalisierte geschlossene Enum-Werte: 83
- Zentral definierte Navigationswerte: 12
- Insgesamt gezählte Enum- und Navigationswerte: 95
- Frühere technische Fallbacks für Typen, Status, Attribute, Ränge,
  Rettungswürfe, Traditionen, Aktionen, Reichweiten, Choice-Arten,
  Voraussetzungen und Effekte: ersetzt
- Verbleibende unbekannte Labels in regulären Ansichten: 0

Unbekannte Referenzen werden in der Entwicklung protokolliert und in der
Produktion ohne Roh-ID als `Unbekannter Katalogeintrag` dargestellt. Unit- und
E2E-Tests prüfen, dass IDs und englische Enum-Werte nicht in den regulären
Nutzeransichten erscheinen.

## 4. Markdown

Unterstützt werden Absätze, Zeilenumbrüche, Überschriften, Fett, Kursiv,
geordnete und ungeordnete verschachtelte Listen, GFM-Tabellen, Blockquotes,
Inline-Code, Codeblöcke, Trennlinien, Links und interne Entitätsreferenzen.
Interne Referenzen der Form `[[id]]` und `[[id|Text]]` werden beim Kompilieren
validiert und öffnen im Builder den passenden Detaildialog.

Eingebettetes HTML wird nicht ausgeführt, `javascript:`-Links werden verworfen
und externe Links erhalten `noopener` und `noreferrer`. Die Fixtures prüfen
Struktur, Sonderzeichen, lange Wörter, Tabellen, interne Navigation und
potenziell gefährliche Eingaben.

## 5. Progression

- Vollständig technisch geprüfte Klassen: 9 von 9
- Geprüftes Maximallevel je Klasse: 20
- Unvollständige Progressionen: 0
- Leere oder widersprüchliche Pflicht-Choices: 0
- Strukturelle Progressionsfehler: 0

Stufen oberhalb von 1 bleiben wegen ihrer Herkunft aus dem Altbestand als
Testprogression gekennzeichnet. Der Audit bestätigt technische Konsistenz,
nicht fachliche Balance.

## 6. Tests

- Vitest: 45 Tests in 8 Dateien
- Playwright: 9 Szenarien
- E2E-Abdeckung: vollständiger Stufe-1-Charakter, mehrere Stufen,
  Zauberauswahl, komplexes Markdown, gesperrtes Talent, Export/Import,
  Katalogwechsel, Suche/Filter und mobile Ansicht
- Visuelle Prüfung: 13 neu erzeugte Screenshots
- Produktionsbuild: erfolgreich
- Vollständiger `npm run verify`: erfolgreich

## 7. Offene Punkte

Technische Restarbeiten: keine blockierenden. Eine spätere Aufteilung des
eingebetteten Offline-Katalogs kann die Bundlegröße reduzieren.

Fachliche Regelentscheidungen: Die 410 Textregeln benötigen für weitere
Automatisierung jeweils eine bestätigte Regelinterpretation.

Redaktionelle Aufgaben: Die 208 kurzen Alttexte können langfristig um mehr
Atmosphäre und Anwendungsbeispiele ergänzt werden; ihre sichtbaren
Kurzbeschreibungen und typisierten Details sind bereits vollständig.

Balance-Themen: Progressionen oberhalb von Stufe 1 und die zehn Testinhalte
benötigen Spieltests. Bewusst zurückgestellt sind Definitionslisten, Fußnoten,
Callouts und unsicheres eingebettetes HTML, da der aktuelle Content sie nicht
für die Regeldarstellung benötigt.

## Prüfkommandos

Alle geforderten Einzelkommandos sowie `git diff --check` wurden erfolgreich
ausgeführt. `npm run verify` bündelt Lint, Migration, generierte Dateien,
Qualitäts-, Erreichbarkeits- und Progressionsaudit, Build, Browser-Tests und
Formatprüfung.
