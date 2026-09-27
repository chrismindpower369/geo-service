# Prompt-Vorlage: universelle Struktur für dokumentierte Aufgaben

Diese Vorlage ist für Prompts gedacht, deren Ergebnis dokumentiert werden muss — also überall dort, wo eine Aussage später belegt oder weiterverwendet wird (Recherche, Reports, E-Mails, Analysen). Sie erzwingt die sechs Punkte, die einen Prompt brauchbar machen: klare Rolle, messbarer Auftrag, harte Grenzen, Nachvollziehbarkeit, getreue Beispiele und prüfbare Abnahme.

## Kurzanleitung

1. **Kopieren, Platzhalter füllen.** Alles in `{{doppelten Klammern}}` wird ersetzt; was nicht passt, wird gestrichen — nicht leer gelassen. Abschnitte mit `(optional)` dürfen entfallen.
2. **Auftrag in einem Satz mit Erfolgskriterium.** „Erstelle X, sodass Y erkennbar ist" statt „Behandle X". Wenn sich das Kriterium nicht schreiben lässt, ist der Auftrag noch nicht klar — erst klären, dann prompten.
3. **Grenzen als MUSS / DARF NICHT.** Pro Zeile eine Regel, positiv umkehrbar formuliert: statt „keine Behauptungen ohne Beleg" besser „jede Kernaussage trägt eine Quelle oder das Label „unbestätigt"".
4. **Beispiele ehrlich halten.** Ein echtes Eingabe-/Ausgabepaar plus ein Gegenbeispiel mit Verstoßbegründung wirkt stärker als jede Beschreibung. Platzhalter-Beispiele weglassen statt aufblasen.
5. **Vor Ausführung prüfen:** Lässt sich jedes Abnahmekriterium mit ja/nein beantworten? Wenn nein, ist es keine Abnahme, sondern eine Laune — umformulieren.

Faustregel: Ein Prompt, der nicht ohne Rückfrage ausfüllbar ist, wird auch vom Modell nicht ohne Raten ausgefüllt.

## Die Vorlage

```markdown
# Rolle
Du bist {{ROLLE_MIT_EXPERTISE, z. B. „Senior Prompt-Engineer für Recherche-Workflows"}}.
Arbeite präzise, belege Aussagen und erfinde keine Fakten.

# Auftrag
{{EIN messbarer Satz: Was soll entstehen, woran ist Erfolg erkennbar?}}

# Kontext
- System/Umgebung: {{z. B. Chat-UI, Browser-Panel, CLI}}
- Betroffene Artefakte: {{Dateien, Komponenten, Produkte}}
- Verbindliche Vorgaben: {{Standards, Styleguide, Datenschutz}}

# Constraints
- MUSS: {{harte Anforderung — eine je Zeile}}
- DARF NICHT: {{Grenze in positiv-umkehrter Form}}
- Bei Unklarheit: {{Default, z. B. „Irreversibles nachfragen, Reversibles dokumentieren"}}

# Vorgehen
1. {{Schritt}}
2. {{Schritt}}
3. {{Schritt}}
Denke Schritt für Schritt; zeige die Begründung ausschließlich im Abschnitt „Begründung" der Ausgabe.

# Ausgabeformat
Gib ausschließlich diese Abschnitte in dieser Reihenfolge aus:
1. **Zusammenfassung** — max. 3 Sätze
2. **Ergebnis** — {{Struktur: Tabelle | Liste | JSON nach Schema X}}
3. **Begründung** — ein Stichpunkt je wesentlicher Entscheidung
4. **Nächste Schritte** — max. 3, priorisiert

# Beispiele (Few-Shot)
Eingabe: {{realistisches Mini-Beispiel}}
Gute Ausgabe: {{Musterantwort, formatgetreu}}
Schlechte Ausgabe (abzulehnen): {{Gegenbeispiel}} — weil: {{konkreter Verstoß}}

# Abnahmekriterien
- [ ] {{objektiv prüfbar, z. B. „jede Kernaussage hat URL oder Label „unbestätigt""}}
- [ ] {{weitere Prüfung}}
- Ablehnungsgrund: {{z. B. „eine verletzte MUSS-Regel oder abweichendes Format"}}
```

## Ausgefülltes Beispiel (Recherche-Aufgabe)

Eingabe — die Vorlage, gefüllt für eine Belegrecherche:

```markdown
# Rolle
Du bist Recherche-Analyst für KI-Zitierung. Arbeite präzise, belege Aussagen und erfinde keine Fakten.

# Auftrag
Erstelle eine Belegtabelle der KI-Nennungen für Hotel VICTORIA, sodass jede
Aussage einzeln nachprüfbar ist.

# Kontext
- System/Umgebung: Perplexity, Duck.ai, ChatGPT (Web)
- Betroffene Artefakte: outbox/reports/hotel-victoria.md, outbox/evidence/
- Verbindliche Vorgaben: Zitations-Protokoll aus docs/protocol-daily-checklist.md

# Constraints
- MUSS: je Kernaussage mindestens eine Quelle mit URL nennen
- DARF NICHT: Ranking- oder Regularitätsaussagen aus Einzelmessungen ableiten
- Bei Unklarheit: Annahme im Abschnitt „Begründung" dokumentieren

# Vorgehen
1. Rohbelege in outbox/evidence/ lesen.
2. Je System die genannten Häuser in genannter Reihenfolge notieren.
3. Tabelle nach Ausgabeformat bauen.
Denke Schritt für Schritt; zeige die Begründung ausschließlich im Abschnitt „Begründung" der Ausgabe.

# Ausgabeformat
Gib ausschließlich diese Abschnitte in dieser Reihenfolge aus:
1. **Zusammenfassung** — max. 3 Sätze
2. **Ergebnis** — Tabelle: Aussage, Quelle (URL), Status
3. **Begründung** — ein Stichpunkt je wesentlicher Entscheidung
4. **Nächste Schritte** — max. 3, priorisiert

# Beispiele (Few-Shot)
Eingabe: Rohbeleg perplexity-run1: VICTORIA, Drei Raben, Elch (diese Reihenfolge).
Gute Ausgabe: „| VICTORIA auf Pos. 1 | https://…/search/… | belegt (Einzellauf) |"
Schlechte Ausgabe (abzulehnen): „VICTORIA ist regelmäßig auf Platz 1." — weil: Regularitätsbehauptung ohne Messreihe.

# Abnahmekriterien
- [ ] Jede Kernaussage hat URL oder Label „unbestätigt"
- [ ] Kein Satz leitet eine Regelmäßigkeit aus Einzeltagen ab
- Ablehnungsgrund: eine verletzte MUSS-Regel oder abweichendes Format
```

Erwartete Ausgabe (Ausschnitt) — so sieht eine Vorlage-konforme Antwort aus:

```markdown
## Ergebnis
| Aussage                             | Quelle (URL)          | Status              |
|-------------------------------------|-----------------------|---------------------|
| Perplexity nannte VICTORIA an Pos. 1 | https://…/search/…   | belegt (Einzellauf) |
| Hotel X erscheint regelmäßig oben    | —                     | unbestätigt         |
```

## Warum diese Bausteine

- **Rolle zuerst** — stabilisiert Stil und Fachniveau für die gesamte Antwort.
- **Messbarer Auftrag** — Erfolg ist erkennbar, nicht verhandelbar.
- **MUSS / DARF NICHT in positiver Umkehrung** — eindeutig prüfbar, ohne Negativflut.
- **Schrittfolge statt verdecktem Denken** — der Weg ist dokumentiert; Begründungen landen im dafür vorgesehenen Abschnitt, nicht verstreut im Ergebnis.
- **Echte Beispiele plus Gegenbeispiel** — das Format wird gelernt, nicht nur beschrieben; das Gegenbeispiel grenzt Fehlverhalten ab.
- **Abnahmekriterien mit Ablehnungsgrund** — macht „Accept/Reject" operational statt angekündigt.
- **Fixe Ausgabereihenfolge** — maschinen- und menschenlesbar, in Pipelines wiederverwendbar.
