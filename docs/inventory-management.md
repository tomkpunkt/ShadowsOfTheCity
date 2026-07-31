# Inventarverwaltung

Der Build enthält dauerhaft erworbene Inventar-IDs. Der Session State hält je
Gegenstand Menge, Trageort, Ausrüstung, Aktivierung, Verbrauch, Munition und
Notiz.

Die Engine wendet strukturierte Gegenstandseffekte nur an, wenn der Gegenstand
zum Build gehört, noch vorhanden und ausgerüstet oder aktiv ist. Angriffe
erscheinen deshalb erst nach dem Ausrüsten einer Waffe. Verwaiste Zustände
bleiben nach Creator-Änderungen sichtbar und können kontrolliert entfernt
werden.

Die Ansicht zeigt Kategorie, Stufe, Last, Menge und Bedienzustände. Der
vollständige Katalogeintrag enthält Unterkategorie, Preis, Technologie,
Verfügbarkeit, Herkunft, Qualität, Merkmale und Regeltext. Last und ihre
Aufschlüsselung kommen aus der Rules Engine. Währungen werden erst automatisch
geführt, wenn ein strukturiertes Währungsmodell im Katalog vorhanden ist.
