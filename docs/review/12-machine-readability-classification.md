# Klassifikation der Maschinenlesbarkeit

## Ergebnis

Der Katalog enthält 737 redaktionelle Regeltexte für 737 Entitäten, darunter 410 ausdrücklich als Text-Effekt modellierte Wirkungen. 8 Entitäten besitzen mindestens einen strukturierten Regeleffekt. In diesem Auftrag wurden bewusst 0 Freitextregeln neu formalisiert: Die Quelle benennt bei vielen Boni weder Stapelungsart noch Dauer oder eindeutige Ziel-ID. Eine Automatisierung wäre daher eine neue Regelentscheidung.

| Klasse | Freitextregeln |
|:--|:--|
| character-value | 101 |
| combat-value | 102 |
| narrative | 199 |
| prerequisite | 32 |
| selection | 188 |
| situational-text-rule | 103 |
| unresolved | 12 |

## Bewertungsmaßstab

`narrative` bleibt beschreibend. `situational-text-rule` benötigt einen maschinenlesbaren Auslöser. `character-value` und `combat-value` benötigen Ziel-ID, Modifikatortyp, Dauer und Stapelung. `selection` und `prerequisite` werden gegen vorhandene Auswahl- und Voraussetzungsschemata geprüft. `unresolved` bleibt bis zur fachlichen Entscheidung gesperrt.

## Offene Regelentscheidungen

| Entität | Quelltext | Empfehlung |
|:--|:--|:--|
| equipment.artefakt | Artefakt: +4 Magie, +4 Spezial Der Quellenpreis beträgt 1200 GS; die vorläufig migrierte Last beträgt 1. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.1-waffe | Die Quelle definiert +1 Waffe ausschließlich als Modifikation: +1 auf Angriffswürfe und Schaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.2-waffe | Die Quelle definiert +2 Waffe ausschließlich als Modifikation: +2 auf Angriffswürfe und Schaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.3-waffe | Die Quelle definiert +3 Waffe ausschließlich als Modifikation: +3 auf Angriffswürfe und Schaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.blitzwaffe | Die Quelle definiert Blitzwaffe ausschließlich als Modifikation: +1d4 Blitzschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.damonenjager | Die Quelle definiert Dämonenjäger ausschließlich als Modifikation: +1d4 Dämonenschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.eiswaffe | Die Quelle definiert Eiswaffe ausschließlich als Modifikation: +1d4 Eisschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.erdwaffe | Die Quelle definiert Erdwaffe ausschließlich als Modifikation: +1d4 Erdschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.feuerwaffe | Die Quelle definiert Feuerwaffe ausschließlich als Modifikation: +1d4 Feuerschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.geisterjager | Die Quelle definiert Geisterjäger ausschließlich als Modifikation: +1d4 Geisterschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.konstruktjager | Die Quelle definiert Konstruktjäger ausschließlich als Modifikation: +1d4 Konstruktschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |
| weapon.seelenfanger | Die Quelle definiert Seelenfänger ausschließlich als Modifikation: +1d4 Seelenschaden Eigenständige Grundwerte, Preis, Last, Hände und die genaue Anwendung auf eine Basiswaffe sind nicht festgelegt. | Fachliche Zielgröße und Wirkung entscheiden; bis dahin nicht automatisieren. |

Die vollständige Zuordnung jeder Freitextregel steht in `generated/machine-readability-classification.json`.
