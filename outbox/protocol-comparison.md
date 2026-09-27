# Protokoll-Vergleich: nennt das System das Haus?

**Erzeugt aus:** `outbox/evidence/*.md` (`npm run render:status`). Nur ableitbare Angaben: ob der Hausname im protokollierten Antworttext vorkommt und welche Quellenangaben festgehalten wurden. Rangfolgen stehen im Bericht, wo sie von Hand aus der Seite gelesen wurden — nicht hier.

| Datum | System | Beleg | Nennt das Haus | Quellen | anonym | Antwort-URL |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-27 | ChatGPT | `2026-09-27-chatgpt-run1.md` | ja | 1 | nein | nein |
| 2026-09-27 | Perplexity | `2026-09-27-perplexity-run1.md` | ja | 5 | ja | ja |

## Was diese Belege stützen

- 2 Belege an 1 Tag: Der Hausname kommt in 2 von 2 Belegen vor.
- Alle Belege stammen von einem einzigen Tag. Damit ist **nichts** über zeitliche Stabilität oder „regelmäßige“ Nennungen belegt.
- Für Duck.ai liegt kein Rohbeleg vor; der Lauf ist dort nur im Bericht zusammengefasst und nicht neu prüfbar.

## Was diese Belege nicht stützen

- Keine Rangfolge: die Tabelle prüft nur, ob der Name vorkommt, nicht an welcher Stelle.
- Keine Aussage über andere Prompts, Regionen, Konten oder Sprachversionen.
- Keine Wirkung des JSON-LD-Vorschlags: die Belege zeigen Antworten, keinen Ursache-Wirkungs-Zusammenhang.
