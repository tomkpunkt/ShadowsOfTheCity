# Zauberverwaltung

Zaubertraditionen, bekannte Zauber, Zauberangriff, Zauber-SG und Platzmaxima
stammen vollständig aus `CalculatedCharacter`. Die Webansicht sortiert bekannte
Zauber nach Rang und Name und öffnet den vollständigen strukturierten
Katalogeintrag.

`session.spellSlotUsage` speichert ausschließlich verbrauchte Plätze je Rang.
`useSpellSlot` begrenzt den Verbrauch auf das Engine-Maximum;
`restoreSpellSlot` nimmt genau einen Verbrauch zurück. Zaubertricks verbrauchen
keinen Platz. Wirken und manuelles Markieren erzeugen einen sichtbaren
Sitzungsverlauf.

Die dauerhafte Zauberauswahl bleibt im Build und wird im Creator bearbeitet.
Vorbereitete Einzelplätze werden erst unterstützt, wenn der Katalog eine
strukturierte Vorbereitungsbelegung liefert; 0.1.1 erfindet keine Belegung aus
Freitextregeln.
