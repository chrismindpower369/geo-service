---
name: prompt-refine
description: Verbessert unklare oder lückenhafte User-Prompts anhand docs/prompt-template.md, bevor der Auftrag ausgeführt wird. Laden, wenn ein Auftrag ohne erkennbares Erfolgskriterium, mit vagen Verben ("mach mal", "optimiere"), undefinierten Begriffen oder widersprüchlichen Vorgaben beginnt.
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
   Arbeitsauftrag in einem Satz nennen — „Arbeitsauftrag: <messbarer Satz>". Bei
   irreversiblen oder mehrdeutigen Punkten zuerst Rückfragen stellen, statt zu raten.
3. Ändere nie die Absicht des Nutzers — schärfe nur Ziel, Grenzen und Outputform. Ist
   die Absicht unsicher, nachfragen statt interpretieren.
4. Den verbesserten Auftrag direkt ausführen. Nur `/skill:prompt-refine` ohne weiteren
   Auftrag liefert ausschließlich die verbesserte Version, ohne Ausführung.

## Grenzen
- Kein Rewriting bereits präziser Einzeiler („Typecheck laufen lassen").
- Der geschärfte Arbeitsauftrag ist immer sichtbar; nichts wird still umformuliert.
