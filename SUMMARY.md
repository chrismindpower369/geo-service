# GEO-Service MVP – Zusammenfassung

## Ergebnis

Die Blöcke 1–5 der Mission wurden aufgesetzt, anschließend der Meilenstein „manueller Hotel-Pilot“ gemäß `docs/superpowers/specs/2026-09-27-manual-nuernberg-hotel-pilot-design.md` umgesetzt (siehe Nachtrag dort). Zwei parallel laufende Arbeitsstränge haben denselben Baum bearbeitet: einer hat `src/` auf ein evidenzfähiges Report-Modell umgebaut und die vier übrigen Lead-Berichte neu erzeugt, der andere hat den manuellen Piloten samt KI-Einzelruns beigesteuert und zusammengeführt.

## Umsetzung

- **Worker/API:** `src/index.ts` enthält `GET /health` und `POST /api/audit/simulate` inklusive JSON-/Pflichtfeld-/HTTP(S)-URL-Validierung. Es werden keine externen APIs aufgerufen; der Antwortvertrag mit `mode: "simulation"` bleibt erhalten.
- **Audit und Reports:** `src/audit.ts` erzeugt Prüfdaten mit Status (`simulated`, `reviewed`, `needs-review`) und optionalen `evidence`-Feldern sowie Markdown-Reports. Für die vier übrigen Leads sind das Simulationsplatzhalter mit dem ausdrücklichen Vermerk, dass kein Sichtbarkeits-Audit stattgefunden hat.
- **Cloudflare-Konfiguration:** `wrangler.toml` verweist lokal auf den Worker-Einstiegspunkt. Es wurde nichts deployt.
- **Tests:** Vitest prüft Audit und Reports, Endpunkte und Eingabevalidierung sowie die Outbox-Datensätze. Für die Outbox wird unterschieden: genau ein quellenbelegter Pilotbericht (datierte Einzelruns, Zitat-URLs, Kennzeichnung „nicht verifiziert“/„nicht stabil“, ohne Simulationshinweis) gegenüber vier Simulationsplatzhaltern.
- **Nürnberg-Kandidaten:** `outbox/nuernberg-leads.json` enthält fünf reale Kandidaten mit öffentlich gelisteten Kontaktdaten, Quell-URLs, einem `status` je Lead und für den Piloten einem `auditScope`. Der Bäcker Feihl hat seinen Hauptsitz in Neumarkt; seine offizielle B2B-Seite nennt Lieferungen in die Nürnberg-Region.

## Manueller Pilot vs. Simulation

- **Ein belegter Pilotbericht:** `outbox/reports/hotel-victoria-nuernberg.md` ist der manuelle Pilot für das Hotel VICTORIA Nürnberg – Status `reviewed`, kein Simulationsreport. Er enthält die manuell geprüften Website-Fakten (u. a. Microdata `Hotel`/`PostalAddress`/`AggregateRating`, kein JSON-LD in der beobachteten Startseitenansicht), einen JSON-LD-Einbauvorschlag sowie die unten beschriebenen KI-Einzelruns. Jede Sachangabe nennt ihre offizielle Quelle; es gibt keinen Gesamtscore und keine Erfolgsaussage.
- **Vier Simulationen bleiben Simulationen:** Die Berichte zu Bäcker Feihl, Bäckerei Christian Albert, Zahnarztpraxis Dr. Miriam Fischer und art & business hotel tragen weiterhin den Status `simulated` und den Hinweis „kein Sichtbarkeits-Audit“. Die Tests prüfen beide Zustände getrennt.
- **Zwei KI-Einzelruns – bewusste Abweichung vom Design:** Das Design schließt Live-Abfragen an KI- oder Suchdienste aus. Auf ausdrückliche Weisung vom 2026-09-27 wurden dennoch zwei manuelle Durchläufe im Browser mit vier neutralen Fragen (deutsch und englisch, ohne Nennung des Hauses) erhoben: **Durchlauf A** über **Duck.ai** (angezeigtes Modell „GPT-5.6 Luna“, ca. 18:19–18:22) und **Durchlauf B** über **arena.ai** (Text-Chat „Direct“, Modell-Label „Max“, Anbieter laut Seite Google bzw. Meta, ca. 18:24–18:29). Beide sind in Abschnitt 2 des Pilotberichts dokumentiert.
- **Methodische Korrektur in Durchlauf A:** Die vier Fragen liefen dort in **einem fortlaufenden Chat**, nicht in frischen Chats – der Kontext der Vorfragen blieb erhalten. Ein **Kontrolllauf A′** (Duck.ai, frischer Chat, nur Frage 1, ca. 18:29–18:30) bestätigte die Nennung an erster Stelle, sodass die Nennungen in Durchlauf A nicht auf dem Gesprächskontext beruhen.
- **Befund zur Stabilität: nicht stabil.** Durchlauf A nannte das Haus in 4 von 4 Fragen, Durchlauf B nur in 2 von 4; in B waren beide Nennungen sachlich falsch (Handwerkerhof/Königstor und 30 bis 50 Personen statt Königstraße 80 und sechs Räume bis 120 m²), und B lieferte keine Zitat-URLs. **Grenzen:** beide Durchläufe liegen am selben Tag Minuten auseinander – zeitliche Stabilität ist nicht geprüft, und es gibt keinen Anspruch auf Messung.
- **Hinweis zur Sitzung:** Die zweite Oberfläche (arena.ai) lief im geteilten Browser in einer dort bereits angemeldeten Sitzung dieser Person; es wurden keine Zugangsdaten eingegeben oder verändert.
- **Zuerst gewählter Erhebungsweg gescheitert:** Der verbundene Perplexity-Zugang lieferte am 2026-09-27 `401 Unauthorized` („Invalid API key“). Der Schlüssel ist im Connector zu erneuern; es wurden weder Antworten erfunden noch Suchtreffer als KI-Antwort ausgegeben.
- **Keine erfolgte Kundenvalidierung:** Die im Bericht formulierte Validierungsfrage ist Bestandteil des Artefakts und nicht das Ergebnis eines Gesprächs.
- **Offene Inkonsistenz:** `outbox/email-drafts.md` nennt in Entwurf 5 den Report weiterhin „ausschließlich eine Simulation“ – das passt nicht mehr zum Pilotstatus. Die Datei lag außerhalb des jeweiligen Änderungsumfangs und blieb unverändert.

## Verifikation

- `npm test` — **bestanden: 3 Testdateien, 10 Tests**.
- `npm run typecheck` — **bestanden** (`tsc --noEmit`).
- Der Pilotbericht wurde gegen die verlinkten offiziellen Seiten quergeprüft; es wurde keine ungemessene KI-Sichtbarkeit als Fakt dargestellt.
- Netzwerkzugriffe: sechs lesende Aufrufe offizieller Hotel-Seiten sowie die neun Fragen der dokumentierten KI-Einzelruns in zwei Browser-Oberflächen. Kein Deployment, kein Commit, kein E-Mail-Versand, keine Kontaktaufnahme.

## Git-Status

Arbeitsbranch: `feat/hotel-victoria-pilot`. Die Implementierung ist lokal und **nicht committet**; `node_modules/` wird per `.gitignore` ausgeschlossen.
