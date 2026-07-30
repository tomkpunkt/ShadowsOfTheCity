# Regel- und Text-Effekt-Formalisierung für 0.1.0

Stand: 30. Juli 2026

## Ergebnis

Der vollständige Katalog enthält weiterhin 737 Entitäten. 724 sind aktiv und
13 sind als fachlich ungeklärte Entwürfe blockiert. Der Katalog-Hash lautet
`5b86828a1740cbf4eafb1017f8b51c3cc7147a140e1ccbe16e4ac49502e08730`.

| Kennzahl | Anzahl |
|:--|--:|
| Effektknoten gesamt | 451 |
| strukturierte `value`-Effekte | 16 |
| strukturierte `proficiency-rule`-Effekte | 22 |
| strukturierte `grant`-Effekte | 3 |
| Text-Effekte | 410 |
| `partially-structured` | 381 |
| `display-only` | 27 |
| `requires-rules-decision` | 2 |
| Entitäten mit strukturiertem Charakterfeld oder Effekt | 346 |

Kein Text-Effekt bleibt unklassifiziert. Die frühere Effektart
`skill-training` wird bei der Migration in `proficiency-rule: at-least`
überführt.

## Neu formalisierte Regeln

Folgende eindeutige, permanente Kernwirkungen wurden ergänzt:

- Reflextraining: `+1` Reflex.
- Verbesserte Wahrnehmung: `+2` Wahrnehmung.
- Mechaniker: `+2` Technologie; Werkzeug- und Reparaturtext bleibt situativ.
- Wachsamkeit und Veteraneninstinkt: je `+1` Wahrnehmung und Initiative.
- Schnelle Reaktion und Kriegsinstinkt: je `+2` Initiative; situative
  Überraschungsregeln bleiben Text.
- Spionageausbildung: Heimlichkeit, Täuschen und Gesellschaft mindestens
  `trained`.
- Manipulator: Diplomatie und Täuschen jeweils um einen Rang erhöhen.
- Arkanes Studium: Arkane Kunde und Wissenschaft mindestens `trained`.
- Medizinische Ausbildung: Medizin und Wissenschaft mindestens `trained`.
- Ahnenverbindung: Religion und Überleben mindestens `trained`.
- Hochhaus-Erbe: `+1` Gesellschaft und Diplomatie.
- Verdrängter: `+1` Heimlichkeit und Täuschen.
- Verborgener Wächter: Heimlichkeit und Wahrnehmung mindestens `trained`.
- Waldhüter der Dämmerung: Überleben mindestens `trained`, Zauber Nachricht.
- Schule der Erkenntnis: Magie erkennen, `+1` Arkane Kunde und Wahrnehmung.
- Schule des Schutzes: Zauber Schutzschild.
- Zähigkeit: `+1` Trefferpunkt pro Stufe.

Die Migration ist die einzige Quelle dieser Ergänzungen. Erneutes
`npm run content:migrate` erzeugt denselben Frontmatter-Bestand.

## Bewusst nicht permanent eingerechnet

Netzwerker und Schattendealer nennen numerische Boni nur in urbaner Umgebung
beziehungsweise bei illegalen Transaktionen. Diese Zahlen bleiben
`partially-structured`, bis die Umgebungs- und Aktionsbedingungen als
Charakteroptionen oder Laufzeitkontext modelliert sind. Dasselbe gilt für
ziel-, waffen-, zustands-, dauer- und nutzungsabhängige Nebenwirkungen.

## Fachlich blockiert

- `equipment.artefakt`:
  `rules-decision.equipment.artefakt-special-plus-four`
- `feat.general.zahigkeit`:
  `rules-decision.feat.zahigkeit-prerequisite`

Bei Zähigkeit ist die TP-Wirkung eindeutig, die Quellen widersprechen sich aber
bei Stärke 13 gegenüber Konstitution 13. Die Entität bleibt deshalb `draft`
und `needs-rules-decision`; die Engine darf ihre Auswahl nicht als gültig
behandeln.

## Prüfung

Erfolgreich ausgeführt:

- `npm run content:migrate`
- `npm run content:validate`
- `npm run content:compile`
- `npm run content:check-generated`
- `npm run typecheck`
- `npm run test` mit 70 Tests
