# Messplan: KI-Empfehlungen für Hotel VICTORIA Nürnberg

**Was das ist:** der Vorschlag für eine protokollierte Messreihe dazu, wie Ihr Haus in KI-Antworten vorkommt. Der Plan beschreibt, was gemessen wird — nicht, was dabei herauskommt. Er ist aus den Rohbelegen in `outbox/evidence` abgeleitet.

## Wie gemessen wird

- In jedem Lauf dieselbe Frage, ohne Nennung Ihres Hauses: „Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.“
- Je Lauf ein frischer Chat und ein System. Festgehalten werden Datum, System, angezeigtes Modelllabel, die vollständige Antwort und alle sichtbaren Quellenangaben.
- Jeder Lauf wird als Rohbeleg abgelegt und ist damit später nachprüfbar; Zusammenfassungen ersetzen keinen Beleg.

## Was schon vorliegt

| Tag | System | Ihr Haus genannt | Position in der Antwort |
| --- | --- | --- | --- |
| 2026-09-27 | ChatGPT | ja | Hotel VICTORIA → Hotel Elch Boutique → Karl August - a Neighborhood Hotel |
| 2026-09-27 | Perplexity | ja | Hotel VICTORIA Nürnberg → Hotel Drei Raben → Hotel Elch Boutique |

- 2 Belege von 7 geplanten Tagen: In 2 von 2 Antworten wird Ihr Haus genannt.
- Für **Duck.ai** gibt es keinen Rohbeleg (bewusst offen: der anonyme Chat hatte keinen Verlaufslink und ist nach dem Schließen nicht abrufbar; vorhanden ist nur die Zusammenfassung im Pilotbericht); der Lauf ist damit nicht neu prüfbar.

## Was noch fehlt

- 6 von 7 Tagen sind noch nicht gemessen; bisher belegt ist 2026-09-27.
- Pro Tag und System ein Lauf: erst mehrere Tage erlauben eine Aussage darüber, ob eine Nennung stabil bleibt. Ein einzelner Tag belegt das nicht.
- `2026-09-27-chatgpt-run1.md`: Antwort-URL fehlt (der Lauf ist nicht per Link nachprüfbar).
- `2026-09-27-chatgpt-run1.md`: Anonymität fehlt (der Lauf lief in einer bestehenden angemeldeten Sitzung).
- `2026-09-27-perplexity-run1.md`: Modelllabel fehlt (das Produkt zeigte kein Modelllabel an).

## Was diese Messung nicht ist

- Kein Ranking-Audit, kein Sichtbarkeits-Score und keine Erfolgszusage. Die Reihenfolge einer Antwort ist eine Momentaufnahme des jeweiligen Systems.
- Keine Aussage über andere Fragen, Orte, Sprachen, Konten oder Zeitpunkte als die protokollierten.
- Kein Nachweis, dass ein technischer Eingriff auf Ihrer Website eine Nennung verändert — dafür wäre ein Vorher-Nachher-Vergleich nötig.

## Was wir dafür brauchen

- Ihre Freigabe für genau diese Frage und die genannten Systeme.
- 7 Messtage, an denen tatsächlich gemessen wird.
- Für Systeme mit Anmeldepflicht eine bestehende Sitzung; ohne sie bleibt das System ausdrücklich „nicht geprüft“.
