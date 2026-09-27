import { describe, expect, it } from "vitest";
import { generateMarkdownReport, runSimulatedAudit } from "../src/audit.js";

const fixedDate = new Date("2026-09-27T12:00:00.000Z");

const sampleInput = {
  companyName: "Beispielbetrieb",
  website: "https://example.invalid",
  industry: "Handwerk",
  location: "Nürnberg",
};

describe("runSimulatedAudit", () => {
  it("returns three explicitly simulated review stages without live claims", () => {
    const audit = runSimulatedAudit(sampleInput, fixedDate);

    expect(audit.generatedAt).toBe("2026-09-27T12:00:00.000Z");
    expect(audit.mode).toBe("simulation");
    expect(audit.checks.map(({ stage }) => stage)).toEqual([
      "direct-mention",
      "competitors",
      "technical-readiness",
    ]);
    expect(audit.checks.every(({ status }) => status === "needs-review")).toBe(true);
    expect(audit.disclaimer).toContain("no live AI models");
  });

  it("trims fields and supplies a default location", () => {
    const audit = runSimulatedAudit(
      { ...sampleInput, companyName: "  Betrieb  ", location: " " },
      fixedDate,
    );

    expect(audit.companyName).toBe("Betrieb");
    expect(audit.location).toBe("DACH");
  });
});

describe("generateMarkdownReport", () => {
  it("writes all three stages and the simulation disclaimer", () => {
    const report = generateMarkdownReport(runSimulatedAudit(sampleInput, fixedDate));

    expect(report).toContain("# GEO-Sichtbarkeitscheck: Beispielbetrieb");
    expect(report).toContain("Direkte Nennung");
    expect(report).toContain("Mitbewerber");
    expect(report).toContain("Schema.org / JSON-LD");
    expect(report).toContain("keine Live-Abfragen");
  });

  it("escapes Markdown table delimiters", () => {
    const audit = runSimulatedAudit(
      { ...sampleInput, companyName: "Firma | Süd", industry: "Café\nund Hotel" },
      fixedDate,
    );
    const report = generateMarkdownReport(audit);

    expect(report).toContain("Firma | Süd");
    expect(report).toContain("Café und Hotel");
    expect(report).toContain("| Direkte Nennung |");
  });
});
