import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildComparisonMarkdown,
  buildCoverageMarkdown,
  buildMeasurementPlanMarkdown,
  COMPARISON_PATH,
  COVERAGE_PATH,
  EVIDENCE_GLOB_DIR,
  parseEvidenceRecord,
  PLAN_PATH,
} from "../src/protocolStatus.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string): string =>
  readFileSync(join(REPO_ROOT, relative), "utf8").replaceAll("\r\n", "\n");

const perplexity = parseEvidenceRecord(
  "2026-09-27-perplexity-run1.md",
  read(`${EVIDENCE_GLOB_DIR}/2026-09-27-perplexity-run1.md`),
);
const chatgpt = parseEvidenceRecord(
  "2026-09-27-chatgpt-run1.md",
  read(`${EVIDENCE_GLOB_DIR}/2026-09-27-chatgpt-run1.md`),
);

describe("protocol status views", () => {
  it("reads the recorded metadata out of the raw evidence files", () => {
    // The product name must survive the descriptive suffix in the field.
    expect(perplexity.system).toBe("Perplexity");
    expect(perplexity.date).toBe("2026-09-27");
    expect(perplexity.anonymous).toBe(true);
    expect(perplexity.sources.length).toBeGreaterThan(0);
    expect(perplexity.answer).toContain("Hotel Victoria Nürnberg");
    expect(perplexity.mentionsHotelVictoria).toBe(true);

    expect(chatgpt.system).toBe("ChatGPT");
    expect(chatgpt.date).toBe("2026-09-27");
    expect(chatgpt.anonymous).toBe(false);
    expect(chatgpt.mentionsHotelVictoria).toBe(true);
    expect(chatgpt.model).toContain("ChatGPT");

    // The protocol only means something if every record answers the same question.
    expect(perplexity.prompt).toContain("Empfiehl mir 3 charmante Tagungshotels");
    expect(chatgpt.prompt).toBe(perplexity.prompt);
  });

  it("reads the recorded order of houses without guessing one", () => {
    expect(perplexity.ranking).toHaveLength(3);
    expect(perplexity.ranking[0]).toMatch(/victoria/i);
    expect(chatgpt.ranking).toHaveLength(3);
    expect(chatgpt.ranking[0]).toMatch(/victoria/i);

    const comparison = buildComparisonMarkdown([perplexity, chatgpt]);
    expect(comparison).toContain("Hotel VICTORIA → Hotel Elch Boutique");
    expect(comparison).toContain("In 2 von 2 Belegen mit protokollierter Reihenfolge");

    // Without a recorded order the column stays empty and the summary says so.
    const withoutOrder = { ...chatgpt, ranking: [] };
    const plain = buildComparisonMarkdown([withoutOrder]);
    expect(plain).toContain("nicht protokolliert");
    expect(plain).toContain("In keinem Beleg ist die Reihenfolge festgehalten");
  });

  it("refuses a record without metadata or without the verbatim answer", () => {
    expect(() =>
      parseEvidenceRecord("broken.md", "- **Datum/Zeit:** 2026-09-27\n- **System:** X\n"),
    ).toThrow(/answer/);
    expect(() =>
      parseEvidenceRecord("broken.md", "## Vollständiger Antworttext (wörtlich)\n\n```text\nx\n```"),
    ).toThrow(/date or system/);
  });

  it("names uncovered systems and missing days instead of hiding them", () => {
    const markdown = buildCoverageMarkdown([perplexity, chatgpt], { seriesDays: 3 });
    expect(markdown).toContain("| 2026-09-27 | ChatGPT, Perplexity |");
    expect(markdown).toContain("| 2026-09-28 | — fehlt |");
    expect(markdown).toContain("2 von 3 geplanten Tagen ohne Beleg");
    // Duck.ai has no record at all, so it must show up as a gap.
    expect(markdown).toContain("**Duck.ai:** kein Rohbeleg");
    expect(markdown).toContain("Anonymität fehlt");
  });

  it("states only what a single day supports", () => {
    const oneDay = buildComparisonMarkdown([perplexity, chatgpt]);
    expect(oneDay).toContain("an 1 Tag");
    expect(oneDay).toContain("nichts** über zeitliche Stabilität");
    expect(oneDay).toContain("Keine Rangfolge");

    // A second day changes the verdict without changing the shape of the records.
    const secondDay = { ...chatgpt, date: "2026-09-28", file: "2026-09-28-chatgpt-run1.md" };
    expect(buildComparisonMarkdown([perplexity, chatgpt, secondDay])).not.toContain(
      "nichts** über zeitliche Stabilität",
    );
  });

  it("keeps the measurement plan inside what the records support", () => {
    const plan = buildMeasurementPlanMarkdown([perplexity, chatgpt], { seriesDays: 7 });
    expect(plan).toContain("Empfiehl mir 3 charmante Tagungshotels");
    expect(plan).toContain("6 von 7 Tagen sind noch nicht gemessen");
    expect(plan).toContain("Duck.ai");
    expect(plan).toContain("Was diese Messung nicht ist");
    expect(plan).toContain("keine Erfolgszusage");

    // The plan may not claim more coverage than the records hold.
    const complete = buildMeasurementPlanMarkdown([perplexity, chatgpt], { seriesDays: 1 });
    expect(complete).not.toContain("sind noch nicht gemessen");
    expect(complete).toContain("Alle 1 geplanten Tage sind abgedeckt.");
  });

  it("pins the generated views to the committed files", () => {
    const records = [perplexity, chatgpt];
    expect(buildCoverageMarkdown(records, { seriesDays: 7 })).toBe(read(COVERAGE_PATH));
    expect(buildComparisonMarkdown(records)).toBe(read(COMPARISON_PATH));
    expect(buildMeasurementPlanMarkdown(records, { seriesDays: 7 })).toBe(read(PLAN_PATH));
  });
});
