# Pilot-Validierung Hotel VICTORIA Nürnberg – Kurzbrief

**Stand:** 27.09.2026 · **Branch:** `feat/hotel-victoria-pilot` · **Zweck:** interne Notiz zur Vorbereitung der Validierung. Dies ist ein Arbeitsartefakt, **keine** abgeschlossene Kundenvalidierung und keine Erfolgszusage. Es wurde keine E-Mail versendet.

## 1. Der Pilot in einem Satz

Für das Hotel VICTORIA Nürnberg liegt ein manuell recherchierter, quellenbelegter Website- und Schema-Bericht vor (`outbox/reports/hotel-victoria.md`): Er dokumentiert die öffentlich sichtbaren Fakten und schlägt einen ergänzenden Schema.org-JSON-LD-Block für Hotel, Zimmer, Ausstattung und Angebote vor – ohne Wirkungsversprechen.

## 2. Was der Pilot belegt – und was ausdrücklich nicht

**Belegt:**

- Jede Sachangabe nennt ihre offizielle Quelle (Impressum, Ankunfts-, Zimmer-, Meeting-, Event- und A–Z-Seite), gelesen am 27.09.2026.
- Die Startseite trägt `Hotel`-Microdata (Adresse, Telefon, Preisbereich, Bewertung) und in der untersuchten Ansicht **kein** JSON-LD-Script; Angebots- und Ausstattungsdaten liegen sichtbar auf eigenen Unterseiten.
- Der JSON-LD-Vorschlag ist syntaktisch gültiges JSON und wird im Test geparst; die verwendeten Schema.org-Typen wurden gegen die offiziellen Seiten geprüft.
- Abschnitt 2 des Berichts protokolliert drei dokumentierte Testläufe mit identischem, neutralem Prompt (Datum, System, wörtliche Antwort, Zitat-URLs); der vollständige Antworttext zweier Läufe liegt als Rohbeleg in `outbox/evidence/`.

**Ausdrücklich nicht belegt:**

- Kein Ranking-Audit und kein Gesamtscore.
- Keine Aussage, dass das Haus „regelmäßig“ in KI-Empfehlungen erscheint. Drei Läufe an einem Tag sind eine Momentaufnahme, keine Messreihe; die Behauptung aus dem Review-Brief bleibt damit **nicht verifiziert**.
- Keine Zusage zu Rich Results, Sichtbarkeit oder besseren KI-Antworten durch den JSON-LD-Einbau – der Block ist ein Vorschlag.
- Kein Nachweis zeitlicher Stabilität und keine Auswertung über mehrere Tage oder Systeme.
- Die vier übrigen Lead-Berichte sind Platzhalter mit Status `simulated`; sie wurden nie live geprüft.

## 3. Die Validierungsfrage an einen echten Interessenten

> „Ist dieser Bericht für Sie in dieser Form verständlich und konkret genug, um daraus eine Entscheidung oder eine Aufgabe für Ihr Web-/Marketingteam abzuleiten – und welche Angabe fehlt Ihnen, damit er nützlich wird?“

Konkret nachfassen:

1. Ist ohne Erklärung klar, was der technische Befund ist und was der JSON-LD-Block bewirken soll?
2. Würde jemand aus dem Team den Block einbauen (lassen) – und welche Angaben müssten wir dafür liefern?
3. Welche Messung wäre glaubwürdig: welcher Prompt, welche Systeme, welcher Zeitraum, welcher Beleg (Zitat-URLs)?

## 4. Kriterien: Wann startet die Automatisierung?

Automatisierung (wiederkehrende, protokollierte Messung plus Reportgenerierung) startet erst, wenn **alle** Muss-Kriterien erfüllt sind:

- Ein echter Interessent bestätigt, dass der Bericht verständlich ist und einen nächsten Schritt auslöst (Antwort auf Frage 1 und 2).
- Ein Messverfahren ist gemeinsam festgelegt: fixer Prompt, feste Systeme bzw. Modelllabels, feste Kadenz und Protokoll von Datum, vollständiger Antwort und Zitat-URLs (Antwort auf Frage 3).
- Der Interessent will das Ergebnis regelmäßig sehen und benennt eine verantwortliche Person.
- Die Auswertung ist so definierbar, dass Einzelmessungen nicht zu Ranking- oder Regelmäßigkeitsaussagen hochgerechnet werden.

**Nicht starten bzw. verschieben, wenn:**

- Die Rückmeldung „nicht verständlich“ oder „kein Bedarf“ lautet.
- Kein belastbares Messverfahren zustande kommt (dann bleibt es bei manuellen Einzelprüfungen).
- Das Interesse sich auf „Ranking“ oder „Garantie“ richtet – das kann dieses Verfahren nicht liefern.
- Ein benötigtes System nur angemeldet erreichbar ist und keine geeignete Sitzung bereitsteht (so war der ChatGPT-Lauf nicht anonym, sondern eine bestehende angemeldete Sitzung).

## 5. Nächste Schritte

1. Diesen Kurzbrief und den Pilotbericht einer realen Ansprechperson vorlegen und die Fragen aus Abschnitt 3 stellen.
2. Antworten wörtlich protokollieren; erst danach über Automatisierung entscheiden.
3. Bis dahin bleiben alle Aussagen zur KI-Sichtbarkeit Momentaufnahmen; die vier Simulationsberichte bleiben als Simulation gekennzeichnet.
