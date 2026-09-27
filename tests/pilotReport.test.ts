import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPilotReportMarkdown, PILOT_AUDIT, PILOT_JSON_LD_SCRIPT } from "../src/pilotReport.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = "outbox/reports/hotel-victoria.md";

const onDisk = readFileSync(join(REPO_ROOT, REPORT_PATH), "utf8").replaceAll("\r\n", "\n");

describe("pilot report renders from its data model", () => {
  it("renders byte-identical to the committed outbox file", () => (expect(
    buildPilotReportMarkdown(),
  ).toBe(onDisk)));

  it("exposes the audit data model with three stages", () => {
    expect(PILOT_AUDIT.checks.map(({ stage }) => stage)).toEqual([
      "direct-mention",
      "competitors",
      "technical-readiness",
    ]);
    expect(PILOT_AUDIT.status).toBe("reviewed");
    expect(PILOT_AUDIT.mode).toBe("simulation");
  });

  it("takes the numbered sections from the audit checks, not from separate prose", () => {
    const markdown = buildPilotReportMarkdown();
    expect(markdown).toContain("## 2. Direkte Nennung und Zitation durch KI-Systeme");
    expect(markdown).toContain("## 3. Technische Bestandsaufnahme");
    expect(markdown).toContain("### Mitbewerber (nicht Teil dieses Piloten)");

    // The coupling is real: changing the model changes the document.
    const renamed = buildPilotReportMarkdown({
      ...PILOT_AUDIT,
      companyName: "Hotel Beispiel",
      checks: PILOT_AUDIT.checks.map((check) =>
        check.stage === "technical-readiness" ? { ...check, title: "Geänderter Prüfbereich" } : check,
      ),
    });
    expect(renamed).toContain("# GEO-Pilot-Audit: Hotel Beispiel");
    expect(renamed).toContain("## 3. Geänderter Prüfbereich");
    expect(renamed).not.toContain("## 3. Technische Bestandsaufnahme");

    // A stage that loses its narrative must fail loudly instead of vanishing silently.
    const withoutTechnical = {
      ...PILOT_AUDIT,
      checks: PILOT_AUDIT.checks.filter((check) => check.stage !== "technical-readiness"),
    };
    expect(() => buildPilotReportMarkdown(withoutTechnical)).toThrow(/technical-readiness/);
  });

  it("keeps every evidence URL of the reviewed checks in the rendered report", () => {
    const markdown = buildPilotReportMarkdown();
    const evidence = PILOT_AUDIT.checks.flatMap((check) => check.evidence ?? []);
    expect(evidence.length).toBeGreaterThan(0);
    for (const url of evidence) {
      expect(markdown, `rendered report dropped evidence URL ${url}`).toContain(url);
    }
  });

  it("keeps the JSON-LD proposal parseable with the documented structure", () => {
    const json = JSON.parse(PILOT_JSON_LD_SCRIPT.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Hotel");
    expect(json["email"]).toBe("book@hotelvictoria.de");
  });
});
