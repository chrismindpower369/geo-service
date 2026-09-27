# Protokoll-Vergleich: nennt das System das Haus?

**Erzeugt aus:** `outbox/evidence/*.md` (`npm run render:status`). Nur ableitbare Angaben: ob der Hausname im protokollierten Antworttext vorkommt und welche Reihenfolge beim Lauf festgehalten wurde. Fehlt die Reihenfolge, bleibt die Spalte leer — sie wird nicht geschätzt.

| Datum | System | Beleg | Nennt das Haus | Reihenfolge (protokolliert) | Quellen | anonym | Antwort-URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-27 | ChatGPT | `2026-09-27-chatgpt-run1.md` | ja | Hotel VICTORIA → Hotel Elch Boutique → Karl August - a Neighborhood Hotel | 1 | nein | nein |
| 2026-09-27 | Duck.ai | `2026-09-27-duck-ai-run1.md` | nein | Hotel Elch Boutique → Scandic Nürnberg Central → Leonardo Royal Hotel Nürnberg | 6 | ja | nein |
| 2026-09-27 | Perplexity | `2026-09-27-perplexity-run1.md` | ja | Hotel VICTORIA Nürnberg → Hotel Drei Raben → Hotel Elch Boutique | 5 | ja | ja |

## Was diese Belege stützen

- 3 Belege an 1 Tag: Der Hausname kommt in 2 von 3 Belegen vor.
- In 2 von 3 Belegen mit protokollierter Reihenfolge nennt die Antwort das Haus an erster Stelle.
- Alle Belege stammen von einem einzigen Tag. Damit ist **nichts** über zeitliche Stabilität oder „regelmäßige“ Nennungen belegt.

## Was diese Belege nicht stützen

- Keine Rangfolge über diese Läufe hinaus: die Spalte „Reihenfolge“ gibt nur wieder, was beim jeweiligen Lauf festgehalten wurde — nicht, wie das System bei anderen Fragen oder zu anderen Zeiten sortiert.
- Keine Aussage über andere Prompts, Regionen, Konten oder Sprachversionen.
- Keine Wirkung des JSON-LD-Vorschlags: die Belege zeigen Antworten, keinen Ursache-Wirkungs-Zusammenhang.
