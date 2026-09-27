/**
 * One measurement day: the planned runs, their evidence check and the derived views.
 *
 * No script can make the runs — a person opens the chat, sends the neutral prompt and saves
 * the verbatim answer. What this module owns is everything after that: reading the day sheet,
 * refusing a run that cannot be recorded, naming the records, and re-reading every record with
 * the same parser the derived views use. A day that cannot be recorded is refused, never
 * guessed, and a planned system may only be left out with a stated reason.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildEvidenceMarkdown,
  missingProtocolFields,
  NEUTRAL_PROMPT,
  planEvidenceTarget,
  type CitationRunInput,
} from "./citationRun.ts";
import { PROTOCOL_SYSTEMS, parseEvidenceRecord } from "./protocolStatus.ts";

/** A shorter answer is legal but usually means the read-out was cut off; warn, do not refuse. */
const SUSPICIOUSLY_SHORT_ANSWER = 200;

/** One system's line in a day sheet: either the run's facts, or the reason it was not run. */
export interface DaySheetSystem {
  /** Product name as shown to the user, e.g. "ChatGPT". */
  system: string;
  /** Verbatim answer text, relative to the repo root, e.g. `answers/chatgpt.txt`. */
  answer?: string;
  time?: string;
  model?: string;
  mode?: string;
  ranking?: string[];
  url?: string;
  sourcePanel?: string;
  sources?: string[];
  notes?: string[];
  method?: string;
  /** Reason for not measuring this system today; the gap then stays documented, not forgotten. */
  skip?: string;
  /** Reason for accepting a record that misses protocol fields on purpose. */
  waiver?: string;
}

/** What one measurement day states. Everything the records cannot show must be written here. */
export interface DaySheet {
  /** `YYYY-MM-DD`. */
  date: string;
  /** Only set this to deviate from the neutral prompt on purpose; the records then say so. */
  prompt?: string;
  systems: DaySheetSystem[];
}

export interface PlannedRun {
  system: string;
  run: number;
  fileName: string;
  path: string;
  input: CitationRunInput;
  answerChars: number;
  /** The record as it would be written; the evidence check runs on this before anything is saved. */
  markdown: string;
}

export interface SkippedSystem {
  system: string;
  reason: string;
}

export interface DayPlan {
  date: string;
  prompt: string;
  runs: PlannedRun[];
  skipped: SkippedSystem[];
  warnings: string[];
}

/** Read a day sheet. A malformed sheet is refused before a single answer file is touched. */
export function parseDaySheet(text: string, file: string): DaySheet {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: kein gültiges JSON (${(error as Error).message})`);
  }
  const sheet = raw as Partial<DaySheet>;
  if (typeof sheet?.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(sheet.date)) {
    throw new Error(`${file}: "date" fehlt oder steht nicht im Format JJJJ-MM-TT`);
  }
  if (!Array.isArray(sheet.systems) || sheet.systems.length === 0) {
    throw new Error(`${file}: "systems" fehlt oder ist leer`);
  }
  return { date: sheet.date, prompt: sheet.prompt, systems: sheet.systems };
}

/**
 * Turn a day sheet into the records it would produce. Nothing is written here: the plan is
 * complete before the first file appears, so a refusal never leaves half a day behind.
 */
export function planMeasurementDay(
  sheet: DaySheet,
  options: { rootDir: string; evidenceDir: string; existingFileNames: string[]; force?: boolean },
): DayPlan {
  const prompt = sheet.prompt?.trim() ? sheet.prompt.trim() : NEUTRAL_PROMPT;
  const systems: DaySheetSystem[] = sheet.systems;
  const seen = new Map<string, DaySheetSystem>();

  for (const entry of systems) {
    const name = typeof entry?.system === "string" ? entry.system.trim() : "";
    if (!name) throw new Error("Ein Eintrag des Mess-Tags nennt kein System.");
    if (!(PROTOCOL_SYSTEMS as readonly string[]).includes(name)) {
      throw new Error(
        `"${name}" steht nicht im Protokoll. Geplante Systeme: ${PROTOCOL_SYSTEMS.join(", ")}.`,
      );
    }
    if (seen.has(name)) throw new Error(`"${name}" steht doppelt im Mess-Tag.`);
    seen.set(name, entry);
  }

  const unexplained = PROTOCOL_SYSTEMS.filter((system) => !seen.has(system));
  if (unexplained.length > 0) {
    throw new Error(
      `Der Mess-Tag ist unvollständig: für ${unexplained.join(", ")} fehlt ein Lauf oder eine Begründung ("skip").`,
    );
  }

  const runs: PlannedRun[] = [];
  const skipped: SkippedSystem[] = [];
  const warnings: string[] = [];

  for (const system of PROTOCOL_SYSTEMS) {
    const entry = seen.get(system)!;
    const reason = entry.skip?.trim();
    if (reason) {
      skipped.push({ system, reason });
      continue;
    }

    const answerRelative = entry.answer?.trim();
    if (!answerRelative) throw new Error(`${system}: "answer" fehlt — Pfad zur Antwortdatei.`);
    const answerPath = resolve(options.rootDir, answerRelative);
    if (!existsSync(answerPath)) {
      throw new Error(`${system}: Antwortdatei nicht gefunden: ${answerRelative}`);
    }
    const answer = readFileSync(answerPath, "utf8").trim();
    if (!answer) throw new Error(`${system}: die Antwortdatei ${answerRelative} ist leer.`);
    if (answer.length < SUSPICIOUSLY_SHORT_ANSWER) {
      warnings.push(
        `${system}: die Antwort hat nur ${answer.length} Zeichen — wurde die Seite vollständig ausgelesen?`,
      );
    }

    const target = planEvidenceTarget({
      dir: options.evidenceDir,
      date: sheet.date,
      system,
      existingFileNames: options.existingFileNames,
      force: options.force,
    });

    const input: CitationRunInput = {
      date: sheet.date,
      run: target.run,
      system,
      prompt,
      answer,
      time: entry.time,
      model: entry.model,
      mode: entry.mode,
      url: entry.url,
      method: entry.method,
      sourcePanel: entry.sourcePanel,
      sources: entry.sources,
      ranking: entry.ranking,
      notes: entry.notes,
      waiver: entry.waiver,
    };

    const missing = missingProtocolFields(input);
    if (missing.length > 0 && !input.waiver) {
      throw new Error(
        `${system}: Beleg abgelehnt — folgende Protokollfelder fehlen: ${missing.join(", ")}. ` +
          'Entweder im Mess-Tag setzen (eine dokumentierte Absenz wie "nicht angezeigt" genügt) ' +
          'oder die Lücke bewusst annehmen: "waiver": "<Grund>".',
      );
    }

    runs.push({
      system,
      run: target.run,
      fileName: target.fileName,
      path: target.path,
      input,
      answerChars: answer.length,
      markdown: buildEvidenceMarkdown(input),
    });
  }

  return { date: sheet.date, prompt, runs, skipped, warnings };
}

/**
 * Read a finished record back with the parser the derived views use and report what no longer
 * matches the run it came from. An empty list means the record survived the round trip.
 */
export function checkRecord(
  fileName: string,
  markdown: string,
  expected: { date: string; system: string; prompt: string; answer: string; ranking: string[] },
): string[] {
  let record: ReturnType<typeof parseEvidenceRecord>;
  try {
    record = parseEvidenceRecord(fileName, markdown);
  } catch (error) {
    return [`${fileName}: nicht lesbar — ${(error as Error).message}`];
  }

  const problems: string[] = [];
  if (record.date !== expected.date) {
    problems.push(`${fileName}: Datum ist "${record.date}", erwartet "${expected.date}"`);
  }
  if (record.system !== expected.system) {
    problems.push(`${fileName}: System ist "${record.system}", erwartet "${expected.system}"`);
  }
  if (record.prompt !== expected.prompt) {
    problems.push(`${fileName}: Prompt weicht vom vereinbarten Wortlaut ab`);
  }
  if (record.answer.trim() !== expected.answer.trim()) {
    problems.push(`${fileName}: Antworttext wurde nicht unverändert übernommen`);
  }
  if (record.ranking.join("|") !== expected.ranking.join("|")) {
    problems.push(`${fileName}: Reihenfolge der genannten Häuser stimmt nicht mit dem Tag überein`);
  }
  return problems;
}
