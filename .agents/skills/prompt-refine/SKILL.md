---
name: prompt-refine
description: Verbessert unklare oder lückenhafte User-Prompts anhand docs/prompt-template.md, bevor der Auftrag ausgeführt wird. Laden, wenn ein Auftrag ohne erkennbares Erfolgskriterium, mit vagen Verben ("mach mal", "optimiere"), undefinierten Begriffen oder widersprüchlichen Vorgaben beginnt. Bei mehrdeutiger Richtung erzwingt er eine Rückfrage mit konkreten Optionen, statt zu raten.
metadata:
  category: quality
  language: de
---

# Prompt-Refine

Verbessere den Auftrag des Nutzers, bevor du ihn ausführst — sichtbar, nicht heimlich.

## Wissen
Die kanonische Vorlage liegt in `docs/prompt-template.md` (Rolle, Auftrag, Kontext,
Constraints, Vorgehen, Ausgabeformat, Beispiele, Abnahmekriterien). Ein Auftrag ist
verbesserungswürdig, wenn mindestens eines gilt:
- kein erkennbares Erfolgskriterium („woran ist Erfolg erkennbar?" nicht beantwortbar)
- vage Verben oder undefinierte Begriffe
- unklar, welche Artefakte/Dateien betroffen sind
- widersprüchliche oder fehlende Constraints

## Anweisungen
1. Prüfe jeden neuen Auftrag auf diese Signale. Klare, vollständige Aufträge: direkt
   arbeiten, Skill nicht anwenden.
2. Bei Verbesserungsbedarf: Vorlage im Stillen ausfüllen und zu Beginn der Antwort den
   Arbeitsauftrag in einem Satz nennen — „Arbeitsauftrag: <messbarer Satz>".
3. **Mehrdeutige Richtung ist ein Pflicht-Stopp.** Lässt der Auftrag mehrere sinnvolle
   Richtungen zu (etwa klarer / vollständiger / kürzer) oder ist die Absicht nicht sicher
   ableitbar, wird zuerst gefragt und nichts ausgeführt. Stelle dann genau eine Rückfrage
   mit zwei bis vier konkreten Optionen (ask_questions); jede Option nennt das Ergebnis,
   das sie erzeugt. Erst die Antwort entscheidet, was gearbeitet wird.
4. Ändere nie die Absicht des Nutzers — schärfe nur Ziel, Grenzen und Outputform.
5. Den verbesserten Auftrag direkt ausführen; nur `/skill:prompt-refine` ohne weiteren
   Auftrag liefert ausschließlich die verbesserte Version, ohne Ausführung.

## Rückfrage-Format (Pflicht bei mehrdeutiger Richtung)
- Eine Frage, ein Satz; die Richtungen stehen in den Antwortoptionen, nicht im Fließtext.
- Zwei bis vier Optionen mit sprechenden Labels; die empfohlene steht zuerst.
- Jede Option nennt ihr konkretes Ergebnis, z. B. „Kürze: nur Wiederholungen streichen,
  kein Inhalt geht verloren".
- Keine „Sonstiges"-Option — der freie Text der Rückfrage genügt.

## Grenzen
- Kein Rewriting bereits präziser Einzeiler („Typecheck laufen lassen").
- Der geschärfte Arbeitsauftrag ist immer sichtbar; nichts wird still umformuliert.
- Ohne Antwort auf eine Pflicht-Rückfrage wird nichts geändert und nichts ausgeführt.
