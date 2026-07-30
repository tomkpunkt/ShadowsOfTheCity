# Cleanup- und Architekturbericht 0.1.0

Stand: 30. Juli 2026

## Entfernte Parallelpfade

- Die produktive Verwendung des alten Effekts `skill-training` wurde entfernt.
  Die Legacy-Migration schreibt ausschließlich `proficiency-rule: at-least`.
- Character-State-DTO und Rules-Engine-State sind kein Doppelmodell mehr,
  sondern verwenden `CharacterDocumentSchema` als gemeinsamen Vertrag.
- Format-1-Speicherung und zeitstempelabhängige Migration wurden durch die
  deterministische Format-2-Pipeline ersetzt.
- Freie Attributanzahl, Abschnittsstatus, Voraussetzungen und berechnete Werte
  werden nicht mehr in React parallel berechnet.
- Nicht ausgerüstete Inventargegenstände liefern keine Kampf- oder
  Rüstungswirkung.

## Bewusst erhaltener Legacy-Bestand

Die 64 Markdown-Quellen, der Migrationsparser, die alten Storage-Schlüssel und
die rückwärts lesbaren Effektvarianten bleiben gemäß
`docs/review/05-legacy-inventory.md` erhalten. Sie sind für reproduzierbare
Content- beziehungsweise Charaktermigration weiterhin aufgerufen und daher
kein toter Parallelbestand. Produktive UI und Engine importieren sie nicht.

## Dateien und Abhängigkeiten

Es wurde kein eigenständiges totes Produktionsmodul gefunden. Test-Fixtures,
Screenshots und Audit-Skripte besitzen weiterhin aufrufende npm-Skripte oder
Tests. Alle direkten Abhängigkeiten sind durch produktive Importe belegt:

- Character Builder: React, React DOM, Lucide, React Markdown, Remark GFM,
  Zod und die beiden Workspace-Pakete.
- Content Compiler: Gray Matter, MDAST, Remark, Unified, YAML und Shared.
- Rules Engine: ausschließlich Shared.
- Shared: ausschließlich Zod.

Entfernte direkte Abhängigkeiten: **0**. Große Versionssprünge wurden nicht
vorgenommen.

## Automatisierte Nachweise

- `npm run architecture:audit`
- `npm run lint`
- `npm run typecheck`
- `npm run content:templates`
- `npm run test` mit 73 Tests
- `npm run test:e2e` mit 18 Browsertests

Der Architektur-Audit blockiert UI-Importe in Compiler oder Engine,
Engine-/UI-Importe in Shared, Compilerimporte in der Engine und
Rohcontentimporte im Builder.
