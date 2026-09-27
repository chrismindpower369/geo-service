import { describe, expect, it } from "vitest";
import {
  buildEvidenceMarkdown,
  evidenceFileName,
  NEUTRAL_PROMPT,
  nextRunNumber,
  slugifySystem,
} from "../src/citationRun.js";

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

  it("records the prompt, the verbatim answer and the cited URLs", () => {
    const markdown = buildEvidenceMarkdown({
      date: "2026-09-27",
      run: 1,
      system: "ChatGPT",
      prompt: NEUTRAL_PROMPT,
      answer: "1. Hotel VICTORIA\n2. Anderes Haus",
      model: "ChatGPT",
      mode: "angemeldete Sitzung, temporärer Chat",
      url: "https://chatgpt.com/c/abc",
      sourcePanel: "3 Quellen",
      sources: ["https://www.hotelvictoria.de/"],
      notes: ["Kopfzeile und Folgefragen sind Seitengerüst."],
    });

    expect(markdown).toContain("# Rohbeleg: ChatGPT-Durchlauf 1");
    expect(markdown).toContain("Empfiehl mir 3 charmante Tagungshotels");
    expect(markdown).toContain("angemeldete Sitzung, temporärer Chat");
    expect(markdown).toContain("```text");
    expect(markdown).toContain("1. Hotel VICTORIA");
    expect(markdown).toContain("https://www.hotelvictoria.de/");
    expect(markdown).toContain("Kopfzeile und Folgefragen sind Seitengerüst.");
    expect(markdown).toContain("einzelner Lauf an einem Tag");
    expect(markdown.endsWith("\n")).toBe(true);
  });

  it("marks a run without sources and without a URL as such", () => {
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
  });

  it("refuses a record without an answer or without a prompt", () => {
    const base = {
      date: "2026-09-27",
      run: 1,
      system: "ChatGPT",
      prompt: NEUTRAL_PROMPT,
      answer: "Antwort",
    };
    expect(() => buildEvidenceMarkdown({ ...base, answer: "   " })).toThrow(/answer/);
    expect(() => buildEvidenceMarkdown({ ...base, prompt: "  " })).toThrow(/prompt/);
  });
});
