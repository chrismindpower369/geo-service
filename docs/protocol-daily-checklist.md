# Tages-Checkliste: ein Mess-Tag in fünf Minuten

Für die Serie der KI-Zitierungsprüfung. Ein Tag kostet: eine Antwort je System auslesen, drei `record:run`-Aufrufe, ein `render:status`, ein `test`. Die Belege selbst schreibt das Werkzeug — nichts wird von Hand in Markdown übertragen.

## Voraussetzungen (einmal je Rechner)

- **Repo-Wurzel:** alle Befehle laufen dort, wo `package.json` liegt.
- **Node:** 22.6 oder neuer (die Skripte nutzen Nodes TypeScript-Stripping); getestet mit 24.x.
- **Abhängigkeiten:** einmal `npm install`.
- **Zeilenenden:** `.gitattributes` nagelt LF für alle Textdateien fest. Trotzdem kann ein alter Arbeitsbaum noch CRLF tragen — der Weg steht unter „Wenn etwas klemmt".

## 1. Je System einen Lauf erfassen

**Der Prüfprompt dieser Serie** — wörtlich identisch für alle Systeme und alle Läufe (Quelle: `NEUTRAL_PROMPT` in `src/citationRun.ts`):

> Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.

Ändert sich dieser Wortlaut, beginnt eine neue Serie: die alten Läufe bleiben nur unter ihrem alten Prompt vergleichbar.

### Den Antworttext auslesen

1. Frischer Chat je System: kein Kontext aus Vorfragen, keine Nachfragen.
2. Den Prüfprompt wörtlich senden.
3. Den vollständigen Antwortbereich auslesen — im Browser den sichtbaren Antworttext komplett kopieren (technisch der `innerText` des Hauptbereichs). Nichts kürzen, nichts glätten, nichts ergänzen.
4. In `answers/<system>.txt` speichern; Verzeichnis einmal anlegen mit `mkdir -p answers`. Diese Dateien sind reine Eingabe für das Werkzeug und gehören nicht ins Repo.
5. Für den Beleg zusätzlich notieren: Uhrzeit laut Antwortseite, angezeigtes Modelllabel, Sitzungsart, Antwort-URL (falls vorhanden), sichtbare Quellen bzw. Zitat-Chips und die Reihenfolge der genannten Häuser.

Die Reihenfolge immer als `A; B; C` mitgeben; wenn die Antwort keine Reihenfolge erkennen lässt, den Schalter weglassen — dann bleibt die Spalte leer statt geraten.

**Perplexity** (anonymer Chat, Antwort-URL vorhanden):

```bash
npm run record:run -- \
  --system "Perplexity" \
  --time "HH:MM laut Antwortseite (Europe/Berlin)" \
  --model "<angezeigtes Label, sonst „nicht angezeigt“>" \
  --mode "anonymer Chat, geteilte Sitzung" \
  --url "<Antwort-URL aus der Adresszeile>" \
  --source-panel "<z. B. 25 Quellen>" \
  --source "<erste zitierte Quelle>" \
  --ranking "Haus A; Haus B; Haus C" \
  --answer answers/perplexity.txt
```

Zeigt Perplexity kein Modelllabel an (so war es im ersten Lauf), ist `--model "nicht angezeigt"` die richtige Angabe: eine dokumentierte Absenz, keine Lücke.

**ChatGPT** (nur mit bestehender Sitzung; temporären Chat verwenden, Sitzungsart nicht verschweigen):

```bash
npm run record:run -- \
  --system "ChatGPT" \
  --time "HH:MM" \
  --model "ChatGPT (Menüeintrag „<Label>“)" \
  --mode "angemeldete Sitzung, temporärer Chat" \
  --source-panel "Chips: <Label>, <Label>" \
  --ranking "Haus A; Haus B; Haus C" \
  --answer answers/chatgpt.txt
```

Eine `--url` gibt es dort nicht; der Beleg vermerkt das selbst als „keine addressierbare URL“.

**Duck.ai** (anonymer Chat, Modelllabel anzeigen lassen und wörtlich übernehmen):

```bash
npm run record:run -- \
  --system "Duck.ai" \
  --time "HH:MM" \
  --model "<angezeigtes Label>" \
  --mode "anonymer Chat" \
  --ranking "Haus A; Haus B; Haus C" \
  --answer answers/duckai.txt
```

Die Laufnummern vergibt das Werkzeug selbst (`run1`, `run2`, … je Datum und System). `--run` nur setzen, wenn ein Beleg bewusst ersetzt wird — dann zusätzlich `--force`.

Bei Erfolg schreibt das Werkzeug genau eine Zeile dieser Form:

```text
Beleg geschrieben: outbox/evidence/2026-09-28-perplexity-run1.md (Perplexity, Durchlauf 1)
```

Kommt stattdessen „Beleg abgelehnt …“, fehlt ein Pflichtfeld — dann greift der nächste Abschnitt.

### Wenn ein Feld fehlt: das Werkzeug lehnt den Beleg ab

`--time`, `--mode`, `--model` und `--ranking` sind Pflicht. Fehlt eines, schreibt das Werkzeug nichts, sondern nennt die fehlenden Felder — damit kein vergessenes Feld die Serie unbemerkt schwächt. Zwei erlaubte Wege:

- **Dokumentierte Absenz** statt Lücke: `--time "keine Uhrzeit angezeigt"`, `--model "nicht angezeigt"`. Das ist der Normalfall, wenn das Produkt die Angabe nicht zeigt.
- **Bewusste Lücke** mit Begründung: `--allow-incomplete "die Antwort ergab keine erkennbare Reihenfolge"`. Der Beleg wird geschrieben und trägt diese Begründung sichtbar in sich; die Abdeckung listet das Feld weiterhin als fehlend.

Beide Wege halten den Unterschied zwischen „nicht vorhanden“ und „vergessen“ fest.

### Der ganze Tag in einem Aufruf

Statt drei einzelner `record:run`-Aufrufe lässt sich der Tag als **Tagesschein** beschreiben und in einem Aufruf fahren. Das Auslesen der drei Läufe bleibt Handarbeit, alles danach nicht mehr:

```json
{
  "date": "2026-09-28",
  "systems": [
    {
      "system": "Perplexity",
      "answer": "answers/perplexity.txt",
      "time": "20:49 laut Antwortseite (Europe/Berlin)",
      "model": "nicht angezeigt",
      "mode": "anonymer Chat, geteilte Sitzung",
      "ranking": ["Haus A", "Haus B", "Haus C"],
      "url": "https://www.perplexity.ai/search/…",
      "sourcePanel": "25 Quellen",
      "sources": ["https://www.hotelvictoria.de/"]
    },
    {
      "system": "Duck.ai",
      "answer": "answers/duck-ai.txt",
      "time": "22:15",
      "model": "GPT-5.6 Luna",
      "mode": "anonymer Chat",
      "ranking": ["Haus B", "Haus C", "Haus D"]
    },
    {
      "system": "ChatGPT",
      "answer": "answers/chatgpt.txt",
      "time": "21:28",
      "model": "ChatGPT",
      "mode": "angemeldete Sitzung, temporärer Chat",
      "ranking": ["Haus A", "Haus C", "Haus D"]
    }
  ]
}
```

```bash
npm run measure:day -- --day answers/2026-09-28.json --dry-run   # nur prüfen, nichts schreiben
npm run measure:day -- --day answers/2026-09-28.json             # schreiben, Ableitungen, Tests
```

Regeln des Tagesscheins:

- Er nennt **alle drei** Systeme — als Lauf oder mit `"skip": "<Grund>"`. Ohne Begründung wird der Tag abgewiesen; ein begründet ausgelassenes System bleibt als Lücke in der Abdeckung stehen.
- Ein Lauf ohne Pflichtfeld wird abgelehnt; bewusst annehmen nur mit `"waiver": "<Grund>"`.
- Ein System, das nicht im Protokoll steht, wird abgewiesen.
- Der Trockenlauf schreibt nichts und erzeugt keine Ableitungen — er prüft aber jeden Beleg mit demselben Parser, den die Ableitungen nutzen.

## 2. Ableitungen neu erzeugen

```bash
npm run render:status   # Abdeckung, Vergleich und Messplan aus den Rohbelegen
npm test                # die Ableitungen und der Report sind byte-genau gepinnt
```

`npm run render:report` nur, wenn sich Abschnitt 2 des Pilotberichts inhaltlich ändert — wie das geht, steht im nächsten Abschnitt.

## 3. Einen Lauf in den Bericht bringen

Der Pilotbericht ist gerendert, nicht handgeschrieben. Abschnitt 2 lebt in `src/pilotReport.ts`:

1. Lauf ergänzen: in `DIREKTE_NENNUNG` einen Block `### Durchlauf N — <System> (…)` anlegen, mit Zeit und Produkt, Sitzungsart, Antwort-URL oder dem ausdrücklichen Vermerk, dass keine existiert, dem Ergebnis samt wörtlichen Belegstellen und dem Pfad zum Rohbeleg.
2. Die Zusammenfassung in `KURZBEFUND` und die Quellenliste `QUELLEN` mitziehen — jede Aussage des Berichts nennt ihren Beleg.
3. `npm run render:report` schreibt `outbox/reports/hotel-victoria.md` neu.
4. `npm test`: `tests/pilotReport.test.ts` vergleicht die Datei byte-genau mit dem Modell. Eine Abweichung heißt rendern, nicht die Datei von Hand ändern.

Regel: Zahlen und Aussagen ändern sich nur im Modell, nie direkt in der Datei.

## 4. Wenn etwas klemmt

- **`Beleg abgelehnt: folgende Protokollfelder fehlen: Modelllabel.`** — `--model` fehlt. Echtes Label übernehmen oder `--model "nicht angezeigt"` setzen.
- **`… already exists; pass --run or --force to replace it`** — für diese Laufnummer gibt es schon einen Beleg. Für einen neuen Lauf die Nummer freilassen; bewusst ersetzen nur mit `--run <N> --force`.
- **`ENOENT: no such file or directory … answers/…txt`** — die Antwortdatei fehlt. `mkdir -p answers` und die Datei anlegen (Methode in Abschnitt 1).
- **`npm run record:run` kennt den Befehl nicht** — Abhängigkeiten fehlen: `npm install` in der Repo-Wurzel.
- **Tests rot, oder `render:status` bricht mit `missing verbatim answer block` ab** — der Arbeitsbaum trägt CRLF statt LF. Prüfen und neu materialisieren:

```bash
git ls-files --eol | grep -c 'w/crlf'          # muss 0 sein
git ls-files -z | xargs -0 rm -f && git checkout -- .
```

`.gitattributes` erzwingt LF; die zwei Schritte holen einen alten Arbeitsbaum nach. Der committete Inhalt war nie betroffen — danach `npm test` erneut laufen lassen.
- **`renders byte-identical to the committed outbox file` schlägt fehl** — die Berichtsdatei weicht vom Modell ab: `npm run render:report` statt Handarbeit in der Markdown-Datei.

## 5. Regeln für das Auslesen

- Nur auslesen, was die Seite zeigt: vollständiger Antworttext, sichtbare Quellenangaben bzw. Zitat-Chips, angezeigtes Modelllabel, Uhrzeit.
- Keine Anmeldung beschaffen, keine Zugriffskontrolle umgehen. Verlangt ein System eine Anmeldung und es besteht keine Sitzung, bleibt es „nicht geprüft“ — und das wird so berichtet.
- Kein Tag wird nachgeholt, geschätzt oder doppelt gezählt. Fehlende Tage stehen als Lücke in der Abdeckung.
- Eine Antwort wird nie aus einem früheren Lauf wiederverwendet.
- Der Antworttext wird unverändert gespeichert; Ergänzungen gehören in Metadatenzeilen, nicht in den Block.
