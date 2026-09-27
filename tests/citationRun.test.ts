import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildEvidenceMarkdown,
  evidenceFileName,
  missingProtocolFields,
  NEUTRAL_PROMPT,
  nextRunNumber,
  PROTOCOL_FIELD_LABELS,
  slugifySystem,
} from "../src/citationRun.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** A fully documented run: every protocol field is stated. */
const completeRun = {
  date: "2026-09-27",
  run: 1,
  system: "ChatGPT",
  prompt: NEUTRAL_PROMPT,
  answer: "1. Hotel VICTORIA\n2. Anderes Haus",
  time: "21:28",
  model: "ChatGPT",
  mode: "angemeldete Sitzung, temporärer Chat",
  url: "https://chatgpt.com/c/abc",
  sourcePanel: "3 Quellen",
  sources: ["https://www.hotelvictoria.de/"],
  ranking: ["Hotel VICTORIA", "Hotel Elch Boutique", "Karl August"],
  notes: ["Kopfzeile und Folgefragen sind Seitengerüst."],
};

/** Run the capture CLI without touching the evidence directory. */
function runCli(args: string[], stdin = "Antworttext"): ReturnType<typeof spawnSync> {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", "scripts/record-citation-run.ts", ...args],
    { cwd: REPO_ROOT, input: stdin, encoding: "utf8" },
  );
}

describe("citation run evidence records", () => {
  it("names one file per date, system and run", () => {
    expect(slugifySystem("ChatGPT")).toBe("chatgpt");
    expect(slugifySystem("Duck.ai")).toBe("duck-ai");
    expect(evidenceFileName("2026-09-27", "ChatGPT", 1)).toBe("2026-09-27-chatgpt-run1.md");
  });

  it("continues a series per system instead of overwriting it", () => {
    const existing = [
      "2026-09-27-chatgpt-run1.md",
      "2026-09-27-chatgpt-run2.md",
      "2026-09-27-perplexity-run1.md",
      "notes.txt",
    ];
    expect(nextRunNumber(existing, "2026-09-27", "ChatGPT")).toBe(3);
    expect(nextRunNumber(existing, "2026-09-27", "Perplexity")).toBe(2);
    expect(nextRunNumber(existing, "2026-09-28", "ChatGPT")).toBe(1);
    expect(nextRunNumber([], "2026-09-27", "Duck.ai")).toBe(1);
  });

  it("records the prompt, the answer, the cited URLs and the order", () => {
    const markdown = buildEvidenceMarkdown(completeRun);

    expect(markdown).toContain("# Rohbeleg: ChatGPT-Durchlauf 1");
    expect(markdown).toContain("Empfiehl mir 3 charmante Tagungshotels");
    expect(markdown).toContain("angemeldete Sitzung, temporärer Chat");
    expect(markdown).toContain("```text");
    expect(markdown).toContain("1. Hotel VICTORIA");
    expect(markdown).toContain("https://www.hotelvictoria.de/");
    expect(markdown).toContain(
      "**Reihenfolge der genannten Häuser:** Hotel VICTORIA → Hotel Elch Boutique → Karl August",
    );
    expect(markdown).toContain("Kopfzeile und Folgefragen sind Seitengerüst.");
    expect(markdown).toContain("einzelner Lauf an einem Tag");
    expect(markdown.endsWith("\n")).toBe(true);
    // A complete run carries no incompleteness marker at all.
    expect(markdown).not.toContain("Unvollständiger Beleg");
  });

  it("marks a run without sources, URL or order as incomplete", () => {
    const markdown = buildEvidenceMarkdown({
      date: "2026-09-27",
      run: 2,
      system: "Duck.ai",
      prompt: NEUTRAL_PROMPT,
      answer: "Antwort ohne Quellenangaben",
    });

    expect(markdown).toContain("nicht angezeigt");
    expect(markdown).toContain("nicht wieder aufrufbar");
    expect(markdown).toContain("keine auslesbaren Quellenangaben");
    expect(markdown).not.toContain("Reihenfolge der genannten Häuser:**");
    expect(markdown).toContain("**Unvollständiger Beleg:**");
    expect(markdown).toContain("keine Begründung angegeben");
  });

  it("flags a run that does not use the neutral prompt", () => {
    const markdown = buildEvidenceMarkdown({ ...completeRun, prompt: "Ganz andere Frage" });
    expect(markdown).toContain("**Abweichender Prompt:**");
    expect(buildEvidenceMarkdown(completeRun)).not.toContain("Abweichender Prompt");
  });

  it("names the protocol fields a draft forgets", () => {
    expect(missingProtocolFields(completeRun)).toEqual([]);
    expect(missingProtocolFields({ ...completeRun, ranking: [] })).toEqual([
      PROTOCOL_FIELD_LABELS.ranking,
    ]);
    expect(
      missingProtocolFields({ ...completeRun, time: "   ", mode: undefined, model: undefined }),
    ).toEqual([
      PROTOCOL_FIELD_LABELS.time,
      PROTOCOL_FIELD_LABELS.mode,
      PROTOCOL_FIELD_LABELS.model,
    ]);
  });

  it("records a deliberate gap together with its reason", () => {
    const markdown = buildEvidenceMarkdown({
      ...completeRun,
      ranking: [],
      waiver: "die Antwort ergab keine erkennbare Reihenfolge",
    });
    expect(markdown).toContain(
      "**Bewusst unvollständiger Beleg:** die Antwort ergab keine erkennbare Reihenfolge (fehlende Felder: Reihenfolge der genannten Häuser)",
    );
  });

  it("refuses a record with missing protocol fields unless the gap is waived", () => {
    const base = ["--system", "Testlauf", "--dry-run"];

    const refused = runCli(base);
    expect(refused.status).toBe(1);
    expect(refused.stdout).toBe("");
    expect(refused.stderr).toContain("Beleg abgelehnt");
    expect(refused.stderr).toContain(PROTOCOL_FIELD_LABELS.ranking);
    expect(refused.stderr).toContain(PROTOCOL_FIELD_LABELS.mode);

    const waived = runCli([...base, "--allow-incomplete", "nur ein Rauchtest"]);
    expect(waived.status).toBe(0);
    expect(waived.stdout).toContain("Bewusst unvollständiger Beleg:** nur ein Rauchtest");

    const complete = runCli([
      ...base,
      "--time", "21:28",
      "--mode", "anonymer Chat",
      "--model", "nicht angezeigt",
      "--ranking", "Haus A; Haus B",
    ]);
    expect(complete.status).toBe(0);
    expect(complete.stdout).toContain("Haus A → Haus B");
    expect(complete.stdout).not.toContain("Unvollständiger Beleg");
  });

  it("refuses a record without an answer or without a prompt", () => {
    expect(() => buildEvidenceMarkdown({ ...completeRun, answer: "   " })).toThrow(/answer/);
    expect(() => buildEvidenceMarkdown({ ...completeRun, prompt: "  " })).toThrow(/prompt/);
  });
});
