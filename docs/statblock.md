# Kompakter Statblock

`createStatblock` erzeugt einen kopierbaren Text aus Dokument,
`CalculatedCharacter` und `CharacterSheetModel`. Enthalten sind Identität,
Stufe, Abstammung, Klasse, Wahrnehmung, Sprachen, geübte Fertigkeiten,
Attribute, Gegenstände und Mengen, RK, Rettungswürfe, TP, Bewegung, Angriffe,
wichtige Aktionen, Merkmale und Zauber.

Der Statblock steht in der Webansicht, auf der letzten Druckseite und über die
Zwischenablage zur Verfügung. Er ist eine Kurzreferenz und ersetzt den
vollständigen Bogen nicht. Ein Unit-Test stellt sicher, dass Engine- und
Session-Werte, insbesondere aktuelle TP und Inventarmengen, übernommen werden.
