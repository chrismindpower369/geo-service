import { describe, expect, it } from "vitest";

interface Lead {
  id: string;
  name: string;
  sources: string[];
  probeAuditReport: string;
}

/** The one manually reviewed pilot; every other lead stays a placeholder simulation. */
const PILOT_LEAD_ID = "hotel-victoria-nuernberg";
const PILOT_MARKERS = [
  "nicht verifiziert", // no reproducible AI measurement is claimed
  "Duck.ai", // documented single run, system 1
  "arena.ai", // documented single run, system 2
  "2026-09-27",
  "Zitat-URLs",
  "nicht stabil",
  "keine Messung",
  "Empfehlung",
];
const SIMULATION_MARKERS = ["simulated", "kein sichtbarkeits-audit"];
const PILOT_REPORT_PATH = "../outbox/reports/hotel-victoria-nuernberg.md";

const reportFiles = import.meta.glob("../outbox/reports/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const { default: leadsJson } = await import("../outbox/nuernberg-leads.json?raw");
const { default: drafts } = await import("../outbox/email-drafts.md?raw");

describe("prepared Nürnberg outbox", () => {
  it("carries one sourced manual pilot report and four simulation placeholders", () => {
    const leads = JSON.parse(leadsJson) as Lead[];
    expect(leads).toHaveLength(5);

    const linked = leads.map((lead) => ({
      lead,
      reportPath: `../outbox/${lead.probeAuditReport}`,
    }));
    const pilotRefs = linked.filter(({ lead }) => lead.id === PILOT_LEAD_ID);
    expect(pilotRefs).toHaveLength(1);

    const pilotLead = pilotRefs[0].lead;
    const pilot = reportFiles[PILOT_REPORT_PATH];
    expect(pilot, `missing pilot report at ${PILOT_REPORT_PATH}`).toBeDefined();
    expect(pilot).toContain(pilotLead.name);
    expect(pilot).toContain("https://www.hotelvictoria.de/");
    expect(pilot).not.toContain("Simulation only");
    expect(pilot).not.toContain("Platzhalter");
    for (const marker of PILOT_MARKERS) {
      expect(pilot, `pilot report is missing "${marker}"`).toContain(marker);
    }

    for (const { lead, reportPath } of linked) {
      expect(lead.sources.length).toBeGreaterThan(0);
      expect(lead.sources.every((source) => source.startsWith("https://"))).toBe(true);

      const report =
        lead.id === PILOT_LEAD_ID ? reportFiles[PILOT_REPORT_PATH] : reportFiles[reportPath];
      expect(report, `missing report for ${reportPath}`).toBeDefined();
      expect(report).toContain(lead.name);

      if (lead.id === PILOT_LEAD_ID) continue;
      for (const marker of SIMULATION_MARKERS) {
        expect(report.toLowerCase(), `${reportPath} is missing "${marker}"`).toContain(marker);
      }
    }
  });

  it("keeps five email drafts in the explicitly unsent outbox file", async () => {
    expect(drafts).toContain("# E-Mail-Entwürfe – nicht versenden");
    expect(drafts.match(/^## [1-5]\./gm)).toHaveLength(5);
    expect(drafts).toContain("Es wurde keine E-Mail versendet");
  });
});
