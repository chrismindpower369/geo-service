# GEO-Service MVP – Zusammenfassung

## Ergebnis

Die Blöcke 1–5 der Mission wurden aufgesetzt, anschließend der Meilenstein „manueller Hotel-Pilot“ gemäß `docs/superpowers/specs/2026-09-27-manual-nuernberg-hotel-pilot-design.md` umgesetzt (siehe Nachtrag dort). Ergebnis: ein quellenbelegter Pilotbericht für Hotel VICTORIA Nürnberg mit konkretem JSON-LD-Vorschlag, vier ausdrücklich simulierte Lead-Berichte, ein sauber getrenntes Audit-Datenmodell und eine korrekt gekennzeichnete, unsent E-Mail-Outbox.

## Umsetzung

- **Worker/API:** `src/index.ts` enthält `GET /health` und `POST /api/audit/simulate` inklusive JSON-/Pflichtfeld-/HTTP(S)-URL-Validierung. Es werden keine externen APIs aufgerufen; der Antwortvertrag mit `mode: "simulation"` bleibt erhalten.
- **Audit-Datenmodell getrennt von Formatierung:** `src/audit.ts` definiert `AuditStage`, `AuditStatus`, `AuditCheckData`, `AuditReportData` und `createSimulatedAuditData` getrennt von der Markdown-Funktion `formatAuditReportMarkdown`. Die Simulationsergebnisse tragen den Status `needs-review` und behaupten keine Messwerte.
- **Cloudflare-Konfiguration:** `wrangler.toml` verweist lokal auf den Worker-Einstiegspunkt. Es wurde nichts deployt.
- **Tests:** Vitest prüft Audit-Datenmodell und Markdown-Formatierung, Endpunkte und Eingabevalidierung, die Outbox (genau ein quellenbelegter Pilotbericht gegenüber vier Simulationsplatzhaltern, JSON-LD-Block wird geparst) sowie einen Drift-Guard (`tests/consistency.test.ts`), der die Pilot-/Simulations-Unterscheidung repo-weit absichert. Der Drift-Guard nutzt Node-APIs, daher bleibt `@types/node` benötigt.
- **Nürnberg-Kandidaten:** `outbox/nuernberg-leads.json` enthält fünf reale Kandidaten mit öffentlich gelisteten Kontaktdaten, Quell-URLs, je Lead einem `status` und für den Piloten zusätzlich `auditScope`. Der Bäcker Feihl hat seinen Hauptsitz in Neumarkt; seine offizielle B2B-Seite nennt Lieferungen in die Nürnberg-Region.
- **Abhängigkeiten:** `@types/node` bleibt als devDependency, weil der neue Konsistenz-Test `node:fs`/`node:path`/`node:url` nutzt.

## Manueller Pilot vs. Simulation

- **Ein belegter Pilotbericht:** `outbox/reports/hotel-victoria.md` ist der manuelle Pilot für das Hotel VICTORIA Nürnberg – Status `reviewed`, kein Simulationsreport. Er enthält die manuell geprüften Website-Fakten (Microdata `Hotel`/`PostalAddress`/`telephone`/`priceRange`/`AggregateRating`, kein JSON-LD-Script in der beobachteten Startseitenansicht, keine `amenityFeature`-/`makesOffer`-/Zimmerknoten), den JSON-LD-Einbauvorschlag und Quellen-Abrufdaten. Jede Sachangabe nennt ihre offizielle Quelle; es gibt keinen Gesamtscore und keine Erfolgsaussage.
- **KI-Zitierungsanalyse: nicht verifiziert.** Der Review-Brief behauptet regelmäßige Top-Nennungen bei ChatGPT und Perplexity; dafür liegen keine verifizierbaren Antwortmitschnitte oder Zitat-URLs vor. Der Pilotbericht übernimmt diese Behauptung nicht als Befund, kennt keine KI-Einzelruns und markiert die Stufe ausdrücklich als nicht gemessen. Auch frühere Notizen zu Duck.ai-/arena.ai-Läufen und einem Perplexity-Connector-Fehler sind nicht als Ergebnisse belegt und wurden aus Bericht und Zusammenfassung entfernt.
- **Vier Simulationen bleiben Simulationen:** Die Berichte zu Bäcker Feihl, Bäckerei Christian Albert, Zahnarztpraxis Dr. Miriam Fischer und art & business hotel tragen weiterhin den Status `simulated` und den Hinweis „kein Sichtbarkeits-Audit“. Die Tests prüfen beide Zustände getrennt.
- **E-Mail-Entwürfe:** Alle fünf Entwürfe in `outbox/email-drafts.md` sind unsent. Entwurf 5 (Hotel VICTORIA, an `book@hotelvictoria.de`) beschreibt den Pilotbericht korrekt als Website-/Schema-Prüfung und kennzeichnet die KI-Zitierung als nicht verifiziert; die übrigen vier Entwürfe bleiben Simulationen. Es wurde keine E-Mail versendet.

## Verifikation

- `npm test` — bestanden (4 Testdateien, 15 Tests).
- `npm run typecheck` — bestanden (`tsc --noEmit`).
- Der JSON-LD-Block im Pilotbericht wird im Test geparst; Schema-Vokabular wurde gegen die verlinkten Schema.org-Seiten geprüft. Das belegt keine Rich-Results-Berechtigung und keine Wirkung auf KI-Antworten.
- Netzwerkzugriffe: lesende Aufrufe offizieller Hotel-Seiten für die Website-Fakten. Kein Deployment, kein E-Mail-Versand, keine Kontaktaufnahme.

## Git-Status

Arbeitsbranch: `feat/hotel-victoria-pilot`. Die Implementierung wird mit diesem Stand committet (Pilot-Commit gemäß Freigabe-Brief); `node_modules/` wird per `.gitignore` ausgeschlossen.
