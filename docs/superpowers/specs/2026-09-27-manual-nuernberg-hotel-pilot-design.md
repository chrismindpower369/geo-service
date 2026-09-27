# Manueller Nürnberg-Hotel-Pilot – Design

**Status:** Von der Nutzerin/dem Nutzer freigegeben; vor Umsetzung zur Prüfung vorzulegen.  
**Datum:** 2026-09-27  
**Geltungsbereich:** Nächster Produkt-Meilenstein des GEO-Service

## Kontext und Ziel

Das Repository enthält ein erstes technisches Grundgerüst, aber die derzeitige Audit-Logik liefert ausschließlich simulierte Aussagen. Auf der verknüpften Notion-Projektseite ist als nächster Meilenstein formuliert, zuerst ein beispielhaftes manuelles Audit mit klarer Zielgruppe, Lieferumfang und Abnahmekriterium zu validieren und erst danach Software zu automatisieren. Dieser Entwurf folgt dieser Reihenfolge.

Ziel ist ein einzelner nachvollziehbarer manueller Pilotbericht für **unabhängige Hotels mit Tagungs- oder Eventangebot in Nürnberg**, am Beispiel des **Hotel VICTORIA Nürnberg**. Die Auswahl ist ein repräsentatives Testbeispiel, keine Aussage, dass das Hotel einer Teilnahme oder Kontaktaufnahme zugestimmt hat.

## Ansätze und Entscheidung

1. **Manueller Pilot zuerst (gewählt):** validiert Verständlichkeit und Nutzen, bevor eine noch unbestätigte Messmethode automatisiert wird.
2. **Live-Scanner sofort:** könnte Technik liefern, würde aber die ausdrücklich im Notion-Projekt notierte Reihenfolge „erst validieren, dann automatisieren“ überspringen.
3. **Manueller Pilot und Scanner parallel:** erhöht Umfang und Wartungsrisiko, bevor die Messmethode feststeht.

Es wird ausschließlich Ansatz 1 für diesen Meilenstein spezifiziert.

## Umfang des Piloten

- Einen belegten, einseitigen Beispielbericht für Hotel VICTORIA Nürnberg im bereits bestehenden Pfad `outbox/reports/hotel-victoria.md` erstellen bzw. ersetzen.
- Die offizielle Hotel-Website manuell abrufen und nur tatsächlich beobachtbare Website-Fakten berichten. Jeder Fakt erhält eine konkrete offizielle Quell-URL und ein Abrufdatum.
- Beobachtung, Interpretation, Empfehlung und Hypothese optisch bzw. sprachlich unterscheiden.
- Technische Beobachtungen dürfen sich auf direkt geprüfte Inhalte der öffentlichen Website beschränken, zum Beispiel sichtbare Unternehmens-/Eventinformationen oder tatsächlich vorgefundene strukturierte Daten. Eine nicht erfolgte Prüfung wird explizit als „nicht geprüft“ markiert.
- Direkte Erwähnungen durch KI-Systeme und Mitbewerbervergleiche werden als „nicht geprüft“ markiert, solange keine manuell erhobenen, reproduzierbar dokumentierten Ergebnisse vorliegen. Es werden dafür keine KI-, Such- oder sonstigen APIs verwendet.
- Es werden keine Sichtbarkeitsscores, Erfolgsgarantien oder Wirkungsversprechen ausgegeben.
- Eine abschließende Validierungsfrage im Muster soll einen echten Interessenten nach Verständlichkeit und praktischem Nutzen fragen. Die Frage ist Bestandteil des Artefakts, keine bereits erfolgte Kundenvalidierung.

## Datenfluss und betroffene Dateien

1. Die Prüferin/der Prüfer öffnet die offizielle Event- und Kontaktseite des Hotels mit gewöhnlichen, lesenden HTTPS-GET-Abrufen; es gibt kein Crawling und keine automatisierten Folgeabfragen.
2. Tatsachen werden im vorhandenen Beispielbericht mit Quelllink und Abrufdatum festgehalten. Nicht belegbare oder nicht geprüfte Stufen sind eindeutig gekennzeichnet.
3. `tests/outbox.test.ts` wird so angepasst, dass der manuelle Hotel-Pilot von den vier weiterhin rein simulierten Berichten unterschieden und auf Quellen-/Abrufhinweise sowie Kennzeichnung ungeprüfter Aussagen geprüft wird.
4. `SUMMARY.md` wird angepasst, damit die Abgrenzung zwischen einem belegten Beispiel-Pilot und vier Simulationen transparent ist.

**Änderungsumfang:** `outbox/reports/hotel-victoria.md`, `tests/outbox.test.ts` und `SUMMARY.md`.

## Explizit nicht im Umfang

- Keine Änderung an Worker-Routen, `src/`, Audit-Engine oder Datenmodell.
- Keine neue Live-Route. `/api/audit/simulate` behält seine jetzige rein simulierende, netzwerkfreie Funktion.
- Kein automatisierter lokaler Scanner und keine Erzeugung aller Berichte aus einer zentralen Datenquelle in diesem Meilenstein.
- Keine automatisierten Requests an die fünf Lead-Websites, kein Redirect-Following, kein Crawling und keine Live-Abfragen an KI- oder Suchdienste.
- Keine Kontaktaufnahme, kein E-Mail-Versand, keine Deployment- oder Commit-Änderung außerhalb der in der späteren Implementierungsaufgabe ausdrücklich autorisierten Dateien.
- Die vier weiteren Leads und ihre Probeberichte bleiben im bestehenden Simulationszustand.

## Sicherheit und Integrität

- Nur offizielle, öffentliche Seiten des gewählten Hotels werden für manuelle, lesende Prüfungen verwendet.
- Es werden keine Formulare abgesendet und keine Inhalte verändert.
- Im Bericht wird zwischen einer tatsächlich beobachteten Seiteigenschaft und einer GEO-Wirkungsannahme unterschieden.
- Wenn ein Merkmal nicht verifiziert werden kann, wird es ausgelassen oder „nicht geprüft“ genannt; fehlende Evidenz wird nicht als negatives Ergebnis interpretiert.
- Kein E-Mail-Entwurf wird versendet.

## Fehlerbehandlung

- Eine nicht erreichbare oder nicht eindeutige Quelle wird nicht als Fakt übernommen; der betreffende Punkt bleibt offen bzw. „nicht geprüft“.
- Widersprüchliche Seiteninhalte werden als Unsicherheit dokumentiert oder nicht verwendet.
- Eine manuelle Prüfung darf keine Authentisierung, Umgehung einer Zugriffskontrolle oder Belastung der Website erfordern. Falls das der Fall wäre, wird die Prüfung gestoppt und der Punkt als ungeprüft markiert.

## Abnahmekriterien

1. Der Einseiten-Pilot benennt Zielgruppe, Prüfdatum, geprüfte offizielle Quellen und den Simulations-/Pilotstatus verständlich.
2. Jede tatsächliche Sachbehauptung im Pilot ist über eine angegebene offizielle URL nachvollziehbar.
3. KI-Nennung und Mitbewerbervergleich sind entweder durch reproduzierbare manuelle Evidenz belegt oder klar „nicht geprüft“; im geplanten Umfang werden sie nicht abgefragt.
4. Website-Eigenschaften werden nur behauptet, wenn sie an den angegebenen Seiten manuell beobachtet wurden.
5. Es gibt keinen Gesamtscore, keine Erfolgsgarantie und keinen irreführenden Eindruck eines vollständigen automatischen Audits.
6. Die vier übrigen Berichte bleiben als Simulation gekennzeichnet; die Tests kontrollieren diese Unterscheidung.
7. `npm test` und `npm run typecheck` sind erfolgreich.
8. Kein Netzwerkverkehr außer den ausdrücklich erlaubten lesenden GET-Aufrufen zu den offiziellen Seiten des Hotel-VICTORIA-Piloten; kein Versand und kein Deployment.

## Teststrategie

- `npm test`: Report-Datei und Statuskennzeichnung für genau den einen Pilotbericht prüfen, Quellen-/Abrufhinweise voraussetzen und sicherstellen, dass die vier übrigen Leads weiter explizite Simulationen referenzieren.
- `npm run typecheck`: regressionsfreie Typprüfung des bestehenden Projekts.
- Manuelle Review: Bericht gegen die verlinkten offiziellen Quellen querprüfen und sicherstellen, dass keine ungemessene KI-Sichtbarkeit als Fakt erscheint.

## Nachtrag 2026-09-27 (nach Umsetzung) – ersetzt die Abgrenzung oben, wo sie abweicht

Bei der Umsetzung hat sich der Umfang erweitert. Damit Design und Code zusammenpassen, hält dieser Nachtrag den tatsächlichen Stand fest:

1. **Report-Modell statt reiner Simulation.** `src/audit.ts` und `src/index.ts` wurden umgebaut: Prüfdaten tragen jetzt einen Status (`simulated`, `reviewed`, `needs-review`) und optionale `evidence`-Einträge; die vier übrigen Lead-Berichte sind Simulationsplatzhalter mit dem Vermerk „kein Sichtbarkeits-Audit“. Der Endpunkt `/api/audit/simulate` behält seinen bisherigen Vertrag (`mode: "simulation"`) und bleibt netzwerkfrei. Der Satz „Keine Änderung an Worker-Routen, `src/`, Audit-Engine oder Datenmodell“ ist damit **überholt**.
2. **Ein Pilotbericht, wie im Design vorgesehen.** Der zusammengeführte Pilot liegt weiterhin unter `outbox/reports/hotel-victoria.md`; ein während der Umsetzung parallel entstandener zweiter Bericht wurde in diesen Pfad zusammengeführt.
3. **KI-Einzelruns ausdrücklich dokumentiert.** Der Absatz „Direkte Erwähnungen … nur bei manuell erhobenen, reproduzierbar dokumentierten Ergebnissen“ und der Ausschluss „keine Live-Abfragen an KI- oder Suchdienste“ wurden in einem Punkt erweitert: Auf Weisung vom 2026-09-27 wurden zwei manuelle Einzelruns (Duck.ai und arena.ai) mit vier neutralen Fragen erfasst und im Bericht als **nicht reproduzierbare Momentaufnahme** gekennzeichnet; Ergebnis: die Nennung ist über zwei Systeme **nicht stabil**. Die Läufe ersetzen keine Messreihe, und Abnahmekriterium 3 bleibt in der Sache gültig (kein Anspruch auf Messung, kein Anspruch auf „Regelmäßigkeit“), wird aber nicht mehr durch „wird nicht abgefragt“ definiert.
4. **Leads-Datenmodell.** `outbox/nuernberg-leads.json` trägt je Lead ein `status`-Feld und für den Piloten zusätzlich `auditScope`.
5. **Unverändert gültig:** kein E-Mail-Versand, keine Kontaktaufnahme, kein Deployment, kein Commit, kein Scanner, kein Crawling; die manuelle, lesende Prüfung offizieller Seiten bleibt die Evidenzgrundlage.

## Entscheidungspunkte nach der Pilotvalidierung

Automatisierung wird erst nach Rückmeldung eines echten Interessenten erneut vorgeschlagen. Die Rückmeldung soll klären, ob Zielgruppe, Befunde und Empfehlungen verständlich und nützlich sind sowie welche konkreten Messkriterien fehlen. Diese Spezifikation setzt keine erfolgreiche Kundenvalidierung voraus und autorisiert keinen nachfolgenden Scanner.
