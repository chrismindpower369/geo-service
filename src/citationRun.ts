/**
 * Evidence records for the documented AI citation protocol.
 *
 * One browse session per system and prompt produces one record under `outbox/evidence/`.
 * The record carries exactly what the browser showed — date, system, displayed model label,
 * session kind, the prompt, the verbatim answer and the cited URLs — so a series stays
 * checkable later. This module only formats; `scripts/record-citation-run.ts` writes the file.
 */

export const NEUTRAL_PROMPT =
  "Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.";

export const EVIDENCE_DIR = "outbox/evidence";
export const PILOT_REPORT_PATH = "outbox/reports/hotel-victoria.md";

/**
 * The fields a record must state to be usable in a series. Each may be filled with a
 * documented absence ("nicht angezeigt", "keine Uhrzeit angezeigt") — the point is that the
 * reader decided, instead of forgetting. A deliberate gap needs a waiver, which is part of
 * the record from then on.
 */
export const PROTOCOL_FIELD_LABELS = {
  time: "Datum/Zeit",
  mode: "Sitzungsart",
  model: "Modelllabel",
  ranking: "Reihenfolge der genannten Häuser",
} as const;

export interface CitationRunInput {
  /** Local date of the run, `YYYY-MM-DD`. */
  date: string;
  /** Number of this run within the same date and system. */
  run: number;
  /** Product name as shown to the user, e.g. "ChatGPT". */
  system: string;
  /** The verbatim answer text, exactly as the page rendered it. */
  answer?: string;
  /** The prompt that was submitted, identical across systems. */
  prompt: string;
  /** Local time as shown by the product, e.g. "20:49 (Europe/Berlin)". */
  time?: string;
  /** Displayed model label, or left out when the product shows none. */
  model?: string;
  /** Session kind, e.g. "anonymer Chat" or "angemeldete Sitzung, temporärer Chat". */
  mode?: string;
  /** Addressable answer URL, when the product provides one. */
  url?: string;
  /** How the text was captured. */
  method?: string;
  /** The product's source panel summary, e.g. "25 Quellen". */
  sourcePanel?: string;
  /** Cited URLs as read during the run. */
  sources?: string[];
  /**
   * The houses in the order the answer presented them. Recorded by the reader during the
   * run, because only a person can tell whether a list is a ranking or a collection.
   */
  ranking?: string[];
  /** Extra reading notes, e.g. which page parts were chrome rather than answer. */
  notes?: string[];
  /** Reason for recording an incomplete run on purpose; written into the record. */
  waiver?: string;
}

/**
 * Which protocol fields the draft does not state. The caller decides whether to refuse the
 * record or to accept it with a waiver that names the reason.
 */
export function missingProtocolFields(input: CitationRunInput): string[] {
  const missing: string[] = [];
  if (!input.time?.trim()) missing.push(PROTOCOL_FIELD_LABELS.time);
  if (!input.mode?.trim()) missing.push(PROTOCOL_FIELD_LABELS.mode);
  if (!input.model?.trim()) missing.push(PROTOCOL_FIELD_LABELS.model);
  if (!input.ranking || input.ranking.length === 0) {
    missing.push(PROTOCOL_FIELD_LABELS.ranking);
  }
  return missing;
}

const UMLAUTS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

/** Filesystem-safe slug for a product name, e.g. "ChatGPT" → "chatgpt". */
export function slugifySystem(system: string): string {
  return system
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => UMLAUTS[char] ?? char)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Evidence file for one run, e.g. `2026-09-27-chatgpt-run1.md`. */
export function evidenceFileName(date: string, system: string, run: number): string {
  return `${date}-${slugifySystem(system)}-run${run}.md`;
}

/** Next free run number for that date and system, so a series never overwrites a record. */
export function nextRunNumber(
  existingFileNames: string[],
  date: string,
  system: string,
): number {
  const prefix = `${date}-${slugifySystem(system)}-run`;
  const used = existingFileNames
    .filter((name) => name.startsWith(prefix) && name.endsWith(".md"))
    .map((name) => Number.parseInt(name.slice(prefix.length, -".md".length), 10))
    .filter((value) => Number.isInteger(value));
  return used.length === 0 ? 1 : Math.max(...used) + 1;
}

/** Render one run as a raw evidence record. The reader must be able to re-check it. */
export function buildEvidenceMarkdown(input: CitationRunInput): string {
  const answer = (input.answer ?? "").trim();
  if (!answer) throw new Error("citation run needs the verbatim answer text");
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error("citation run needs the prompt that was submitted");

  const lines: string[] = [];
  lines.push(`# Rohbeleg: ${input.system}-Durchlauf ${input.run} (Hotel-VICTORIA-Pilot)`);
  lines.push("");
  lines.push(
    "**Zugehörig zu:** Abschnitt 2 des Pilotberichts `" +
      PILOT_REPORT_PATH +
      "`. Der Antworttext wird unverändert übernommen, nicht nachträglich geglättet oder gekürzt.",
  );
  lines.push("");
  lines.push(`- **Datum/Zeit:** ${input.date}${input.time ? ", " + input.time : ""}`);
  lines.push(`- **System/Produkt:** ${input.system}`);
  lines.push(`- **Angezeigtes Modelllabel:** ${input.model ?? "nicht angezeigt"}`);
  if (input.mode) lines.push(`- **Sitzungsart:** ${input.mode}`);
  lines.push(`- **Prompt (ohne Nennung des Hauses):** „${prompt}“`);
  lines.push(
    `- **Antwort-URL:** ${input.url ?? "keine adressierbare URL; der Lauf ist nicht wieder aufrufbar"}`,
  );
  lines.push(
    `- **Erfassungsmethode:** ${input.method ?? "Auslesen des gerenderten Seitentexts während des Durchlaufs"}`,
  );
  const missing = missingProtocolFields(input);
  if (missing.length > 0) {
    lines.push(
      input.waiver
        ? `- **Bewusst unvollständiger Beleg:** ${input.waiver} (fehlende Felder: ${missing.join(", ")})`
        : `- **Unvollständiger Beleg:** fehlende Felder: ${missing.join(", ")} (keine Begründung angegeben)`,
    );
  }
  if (prompt !== NEUTRAL_PROMPT) {
    lines.push(
      "- **Abweichender Prompt:** Dieser Lauf verwendet nicht die neutrale Standardfrage; er ist nicht direkt mit den übrigen Belegen vergleichbar.",
    );
  }
  const ranking = (input.ranking ?? []).map((entry) => entry.trim()).filter(Boolean);
  if (ranking.length > 0) {
    lines.push(`- **Reihenfolge der genannten Häuser:** ${ranking.join(" → ")}`);
  }

  lines.push("");
  lines.push("## Vollständiger Antworttext (wörtlich)");
  lines.push("");
  lines.push("```text");
  lines.push(answer);
  lines.push("```");

  const notes = (input.notes ?? []).map((note) => note.trim()).filter(Boolean);
  if (notes.length > 0) {
    lines.push("");
    lines.push("## Hinweise zum Auslesen");
    lines.push("");
    for (const note of notes) lines.push(`- ${note}`);
  }

  const sources = (input.sources ?? []).map((source) => source.trim()).filter(Boolean);
  lines.push("");
  lines.push("## Zitat- und Quellenangaben");
  lines.push("");
  const panel = input.sourcePanel?.trim();
  if (panel) lines.push(`- Quellenpanel der Seite: ${panel}`);
  if (sources.length > 0) lines.push(...sources.map((source) => `- ${source}`));
  if (!panel && sources.length === 0) {
    lines.push("- Der Lauf zeigte keine auslesbaren Quellenangaben.");
  }

  lines.push("");
  lines.push("## Was dieser Beleg nicht zeigt");
  lines.push("");
  lines.push(
    "- Keine Aussage über Wiederholbarkeit oder Regelmäßigkeit: ein einzelner Lauf an einem Tag.",
  );
  lines.push(
    "- Kein Ranking-Nachweis; die Reihenfolge einer Antwort ist eine Momentaufnahme.",
  );
  lines.push("- Keine Aussage über die Wirkung des JSON-LD-Vorschlags.");
  lines.push("");
  return lines.join("\n");
}
