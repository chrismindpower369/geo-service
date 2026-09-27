# GEO-Service MVP – Zusammenfassung

## Ergebnis

Die Blöcke 1–5 der Mission wurden aufgesetzt, anschließend der Meilenstein „manueller Hotel-Pilot“ gemäß `docs/superpowers/specs/2026-09-27-manual-nuernberg-hotel-pilot-design.md` umgesetzt (siehe Nachtrag dort). Ergebnis: ein quellenbelegter Pilotbericht für Hotel VICTORIA Nürnberg mit konkretem JSON-LD-Vorschlag und zwei dokumentierten KI-Testläufen (Momentaufnahmen, keine Messreihe), vier ausdrücklich simulierte Lead-Berichte, ein sauber getrenntes Audit-Datenmodell und eine korrekt gekennzeichnete, unsent E-Mail-Outbox.

## Umsetzung

- **Worker/API:** `src/index.ts` enthält `GET /health` und `POST /api/audit/simulate` inklusive JSON-/Pflichtfeld-/HTTP(S)-URL-Validierung. Es werden keine externen APIs aufgerufen; der Antwortvertrag mit `mode: "simulation"` bleibt erhalten.
- **Audit-Datenmodell getrennt von Formatierung:** `src/audit.ts` definiert `AuditStage`, `AuditStatus`, `AuditCheckData`, `AuditReportData` und `createSimulatedAuditData` getrennt von der Markdown-Funktion `formatAuditReportMarkdown`. Die Simulationsergebnisse tragen den Status `needs-review` und behaupten keine Messwerte.
- **Cloudflare-Konfiguration:** `wrangler.toml` verweist lokal auf den Worker-Einstiegspunkt. Es wurde nichts deployt.
- **Tests:** Vitest prüft Audit-Datenmodell und Markdown-Formatierung, Endpunkte und Eingabevalidierung sowie die Outbox (für vier Kandidaten Simulationsplatzhalter, für den Piloten ein quellenbelegter Bericht). Der JSON-LD-Block des Pilotberichts wird geparst; ein Drift-Guard (`tests/consistency.test.ts`) sichert den Pilot/Simulation-Schnitt. Ein Test pinnt die Byte-Identität zwischen `src/pilotReport.ts` und `outbox/reports/hotel-victoria.md`; ein weiterer belegt die Kopplung, indem er das Audit-Datenmodell verändert und die geänderte Überschrift im gerenderten Markdown erwartet. Der Bericht wird aus dem Datenmodell erzeugt (`scripts/render-pilot-report.ts`); der Drift-Guard nutzt Node-APIs, daher bleibt `@types/node` benötigt.
- **Nürnberg-Kandidaten:** `outbox/nuernberg-leads.json` enthält fünf reale Kandidaten mit öffentlich gelisteten Kontaktdaten, Quell-URLs, je Lead einem `status` und für den Piloten zusätzlich `auditScope`. Der Bäcker Feihl hat seinen Hauptsitz in Neumarkt; seine offizielle B2B-Seite nennt Lieferungen in die Nürnberg-Region.
- **Pilot-Validierung:** `outbox/pilot-validation-notion.md` ist ein Notion-fähiger Kurzbrief mit der Validierungsfrage an einen echten Interessenten und den Muss-Kriterien, ab wann eine Automatisierung startet. Er ist Vorbereitung, keine bereits durchgeführte Validierung.
- **Abhängigkeiten:** `@types/node` bleibt als devDependency, weil der neue Konsistenz-Test `node:fs`/`node:path`/`node:url` nutzt.

## Manueller Pilot vs. Simulation

- **Ein belegter Pilotbericht:** `outbox/reports/hotel-victoria.md` ist der manuelle Pilot für das Hotel VICTORIA Nürnberg – Status `reviewed`, kein Simulationsreport. Er enthält die manuell geprüften Website-Fakten (Microdata `Hotel`/`PostalAddress`/`telephone`/`priceRange`/`AggregateRating`, kein JSON-LD-Script in der beobachteten Startseitenansicht, keine `amenityFeature`-/`makesOffer`-/Zimmerknoten), den JSON-LD-Einbauvorschlag und Quellen-Abrufdaten. Jede Sachangabe nennt ihre offizielle Quelle; es gibt keinen Gesamtscore und keine Erfolgsaussage. Alle nummerierten Abschnitte werden aus dem Audit-Datenmodell gerendert (Überschrift, Befund, Narrative und Evidenz je Prüfbereich); der Mitbewerber-Prüfbereich ist als „nicht Teil dieses Piloten“ ausgewiesen.
- **KI-Zitierungsanalyse: zwei dokumentierte Testläufe.** Der Review-Brief behauptete regelmäßige Top-Nennungen bei ChatGPT und Perplexity. Am 27.09.2026 wurde der neutrale Freigabe-Prompt je einmal in frischen, anonymen Chats geprüft: **Perplexity** nannte Hotel VICTORIA an erster Stelle von drei Empfehlungen und zitierte die offizielle Homepage als erste Quelle (Antwort-URL protokolliert); **Duck.ai** (angezeigtes Modell „GPT-5.6 Luna“) nannte es nicht unter den Top-3; **ChatGPT** blieb wegen Anmeldepflicht ungeprüft. Beide Läufe sind Momentaufnahmen eines Tages, keine Messreihe — die Behauptung „regelmäßiger“ Nennungen bleibt nicht verifiziert. Frühere Notizen zu Läufen ohne Prüfbelege und zu einem Connector-Fehler sind weiterhin nicht als Ergebnisse übernommen. Für Durchlauf 1 liegt der vollständige Antworttext samt Quellenangaben als Rohbeleg in `outbox/evidence/2026-09-27-perplexity-run1.md`; Durchlauf 2 ist ohne Verlaufslink nicht mehr im Original abrufbar, dort sind wörtliche Zitate und die Quellen-URLs belegt. Ein Test prüft, dass jeder im Bericht genannte Belegpfad existiert und den Prompt enthält.
- **Vier Simulationen bleiben Simulationen:** Die Berichte zu Bäcker Feihl, Bäckerei Christian Albert, Zahnarztpraxis Dr. Miriam Fischer und art & business hotel tragen weiterhin den Status `simulated` und den Hinweis „kein Sichtbarkeits-Audit“. Die Tests prüfen beide Zustände getrennt.
- **E-Mail-Entwürfe:** Alle fünf Entwürfe in `outbox/email-drafts.md` sind unsent. Entwurf 5 (Hotel VICTORIA, an `book@hotelvictoria.de`) beschreibt den Pilotbericht korrekt als Website-/Schema-Prüfung samt der beiden dokumentierten Testläufe als Momentaufnahme; die übrigen vier Entwürfe bleiben Simulationen. Es wurde keine E-Mail versendet.

## Verifikation

- `npm test` — bestanden (5 Testdateien, 21 Tests), inkl. Byte-identitäts-Pinning zwischen `src/pilotReport.ts` und dem committeten Report.
- `npm run typecheck` — bestanden (`tsc --noEmit`).
- Der JSON-LD-Block im Pilotbericht wird im Test geparst; Schema-Vokabular wurde gegen die verlinkten Schema.org-Seiten geprüft. Das belegt keine Rich-Results-Berechtigung und keine Wirkung auf KI-Antworten.
- Netzwerkzugriffe: lesende Aufrufe offizieller Hotel-Seiten für die Website-Fakten. Kein Deployment, kein E-Mail-Versand, keine Kontaktaufnahme.

## Git-Status

Arbeitsbranch: `feat/hotel-victoria-pilot`. Die Implementierung wird mit diesem Stand committet (Pilot-Commit gemäß Freigabe-Brief); `node_modules/` wird per `.gitignore` ausgeschlossen.
