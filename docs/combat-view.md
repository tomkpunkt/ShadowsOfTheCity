# Kampfansicht

Die Kampfansicht bündelt interaktive TP-Verwaltung, TP-Verlauf, Zustände,
Verteidigung, Rettungswürfe und alle Angriffe aus dem Engine-Ergebnis.

Ein Angriff zeigt Name, Angriffsbonus, Schadensformel und -art, Reichweite,
Hände, Kapazität, Nachladen und Merkmale. Nur Waffen, deren Session-Zustand
ausgerüstet oder aktiv ist, erzeugen einen Angriff. Bonus und Schaden werden
nicht in der UI zusammengesetzt.

Angriffs-, Schadens- und Rettungswürfe verwenden die validierte lokale
Würfelablage. Ohne angegebenen SG wird kein Erfolg oder kritischer Ausgang
behauptet. Mehrfachangriffsmalus, Feuerarten und alternative Nutzung werden nur
angezeigt, sobald der Katalog dafür strukturierte Varianten liefert.

Schaden verbraucht zuerst temporäre TP. Heilung ist auf das Engine-Maximum
begrenzt. Die letzte TP-Änderung kann rückgängig gemacht werden; die letzten
Änderungen bleiben mit Quelle sichtbar.
