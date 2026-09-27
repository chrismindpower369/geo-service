# Tages-Checkliste: ein Mess-Tag in fünf Minuten

Für die Serie der KI-Zitierungsprüfung. Ein Tag kostet: eine Antwort je System auslesen, drei `record:run`-Aufrufe, ein `render:status`, ein `test`. Die Belege selbst schreibt das Werkzeug — nichts wird von Hand in Markdown übertragen.

**Der Prüfprompt dieser Serie** — wörtlich identisch für alle Systeme und alle Läufe (Quelle: `NEUTRAL_PROMPT` in `src/citationRun.ts`):

> Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.

Ändert sich dieser Wortlaut, beginnt eine neue Serie: die alten Läufe bleiben nur unter ihrem alten Prompt vergleichbar.

## 1. Je System einen Lauf erfassen

Zuerst den Antworttext in eine Datei legen: Verzeichnis einmal anlegen (`mkdir -p answers`), je System eine Datei, Inhalt ist der wörtliche Text der Antwortseite — nicht in den Befehl einfügen. Diese Dateien sind reine Eingabe für das Werkzeug und gehören nicht ins Repo.

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

## 2. Ableitungen neu erzeugen

```bash
npm run render:status   # Abdeckung, Vergleich und Messplan aus den Rohbelegen
npm test                # die Ableitungen und der Report sind byte-genau gepinnt
```

`npm run render:report` nur, wenn sich Abschnitt 2 des Pilotberichts inhaltlich ändert (also wenn ein neues System oder eine neue Laufzahl dort stehen soll).

## 3. Regeln für das Auslesen

- Nur auslesen, was die Seite zeigt: vollständiger Antworttext, sichtbare Quellenangaben bzw. Zitat-Chips, angezeigtes Modelllabel, Uhrzeit.
- Keine Anmeldung beschaffen, keine Zugriffskontrolle umgehen. Verlangt ein System eine Anmeldung und es besteht keine Sitzung, bleibt es „nicht geprüft“ — und das wird so berichtet.
- Kein Tag wird nachgeholt, geschätzt oder doppelt gezählt. Fehlende Tage stehen als Lücke in der Abdeckung.
- Eine Antwort wird nie aus einem früheren Lauf wiederverwendet.
- Der Antworttext wird unverändert gespeichert; Ergänzungen gehören in Metadatenzeilen, nicht in den Block.
