# Rules Engine

## Grenze

`packages/rules-engine` ist frameworkunabhängig. Das Paket importiert weder
React noch DOM-, Storage- oder andere Browser-APIs. Eingangswerte sind der
kompilierte Katalog und ein versionierter `CharacterState`; das Ergebnis ist ein
vollständig neu berechneter `CalculatedCharacter`.

Die Engine verändert eingehende Entscheidungen nicht. Wird eine Voraussetzung
durch eine frühere Änderung ungültig, bleibt die Auswahl erhalten und erscheint
mit `invalid`, konkreten `RequirementFailure`-Einträgen und aktuellem Istwert.

## Ablauf

1. Katalog und Hash validieren.
2. Kernentscheidungen und referenzierte IDs prüfen.
3. feste und freie Attributsverbesserungen anwenden.
4. anfängliche Proficiencies aus Klasse und Background aufbauen.
5. automatische Features bis zur aktuellen Stufe bestimmen.
6. ausgewählte und gewährte Effekte deterministisch anwenden.
7. Choices filtern und Voraussetzungen auswerten.
8. abgeleitete Werte samt Herkunft berechnen.
9. Gesamtzustand aus allen Issues bestimmen.

## Formeln

- Attributsmodifikator: `floor((Attribut - 10) / 2)`
- Proficiency-Bonus: `0` für untrainiert, sonst
  `Level + 2/4/6/8` für geübt/Experte/Meister/legendär
- Trefferpunkte:
  `Abstammungs-TP + Level * (Klassen-TP + KO-Modifikator + TP-Effekte)`
- RK:
  `10 + begrenzter GE-Modifikator + Rüstungs-Proficiency + Gegenstandsbonus + Modifikatoren`
- Save, Skill, Wahrnehmung und Angriffe:
  `Attributsmodifikator + Proficiency + Modifikatoren`
- Klassen- und Zauber-SG ergänzen jeweils eine Basis von `10`.

Die Formeln sind kanonische Projektentscheidungen aus dem Review und keine
kopierten Regeltexte.

## Bonus-Stacking

Untypisierte Modifikatoren stapeln. Pro Ziel werden jeweils nur der höchste
positive und der niedrigste negative `status`-, `circumstance`- und
`item`-Modifikator verwendet. Jeder angewendete Beitrag steht im Breakdown;
verdrängte Beiträge erscheinen nicht als wirksamer Wert.

## Herkunft

`ExplainedValue` enthält `value` und `breakdown`. Jeder Breakdown-Eintrag nennt:

- stabile `sourceId`
- sichtbares Label
- numerischen Beitrag
- Herkunftsart wie `base`, `attribute`, `proficiency`, `item` oder `status`

Attribute, Trefferpunkte, RK, Wahrnehmung, Saves, Skills, Klassen-SG,
Zauber-SG, Zauberangriff, Zauberplätze, Waffenangriff, Waffenschaden,
Geschwindigkeit, Bulk und Ressourcen verwenden dieses Format.

## Validierungszustände

- `valid`: alle derzeit relevanten Pflichtentscheidungen und Voraussetzungen
  sind erfüllt.
- `incomplete`: eine noch erreichbare Pflichtentscheidung fehlt.
- `invalid`: eine vorhandene Auswahl, ID, Grenze oder Katalogversion ist
  widersprüchlich.
- `blocked`: eine Auswahl kann wegen einer früheren offenen Entscheidung oder
  ausdrücklich nicht automatisierten Regel noch nicht verlässlich ausgewertet
  werden.

Gesamtpriorität ist `invalid`, danach `blocked`, `incomplete`, `valid`.

## Legacy-Text

Effekte mit `machineReadable: false` werden gesammelt, aber nicht als
Berechnung ausgeführt. Mit `includeLegacyTextWarnings` können sie als
`blocked`-Issues sichtbar gemacht werden. Der normale Builder kann sie als
Hinweise anzeigen, ohne eine nicht implementierte Regel vorzutäuschen.
