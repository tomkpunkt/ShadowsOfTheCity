# Druckbogen und PDF

`buildCharacterPrintModel` projiziert dasselbe `CalculatedCharacter`, das die
Webansicht verwendet. `PrintCharacterSheet` rendert eine eigenständige,
druckfreundliche A4-Struktur und keinen Screenshot der Bedienoberfläche.

Seiten:

1. Identität, Kernwerte, Attribute, Rettungswürfe und Fertigkeiten
2. Kampf, Angriffe, Aktionen, Ausrüstung, Zustände und Ressourcen
3. Talente und Merkmale
4. Zauberwerte, Plätze und bekannte Zauber, nur bei Zaubercharakteren
5. Inventar, Biografie, Notizen und Statblock

`@media print` blendet Navigation und Eingabefelder aus, setzt A4-Hochformat,
stabile Seitenumbrüche, Schwarzweißkontrast und lesbare Mindestgrößen. Der
Button **Drucken / PDF** öffnet den Browserdruck; dort kann ohne zusätzliche
Bibliothek als PDF gespeichert werden. Lange Einträge werden nach Möglichkeit
als Einheit umbrochen und Tabellen verwenden feste Spaltenbreiten.
