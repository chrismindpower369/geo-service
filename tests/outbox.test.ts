import { describe, expect, it } from "vitest";

interface Lead {
  id: string;
  name: string;
  sources: string[];
  probeAuditReport: string;
  status: string;
}

/** The one manually reviewed pilot; every other lead stays a placeholder simulation. */
const PILOT_LEAD_ID = "hotel-victoria-nuernberg";
const PILOT_REPORT_PATH = "../outbox/reports/hotel-victoria.md";

const PILOT_MARKERS = [
  "nicht verifiziert", // no claim of “regular” citations is asserted
  "27.09.2026", // review date of the official pages
  "keine Messreihe", // two documented runs are a snapshot, not a measurement series
  "Zitat-URLs",
  "perplexity.ai/search/f8a8111c", // documented run 1 answer URL
  "GPT-5.6 Luna", // documented run 2 model label as displayed
  "Empfehlungen",
  "Quellen",
];
const FORBIDDEN_PILOT_MARKERS = [
  "Simulation only", // the pilot is a reviewed report, not a simulation placeholder
  "Platzhalter",
  // Legacy of the unverified era that must never return as a finding:
  "401 Unauthorized",
  "wird daher nicht als gemessener Befund übernommen",
];
const SIMULATION_MARKERS = ["simulated", "kein sichtbarkeits-audit"];

const reportFiles = import.meta.glob("../outbox/reports/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const { default: leadsJson } = await import("../outbox/nuernberg-leads.json?raw");
const { default: drafts } = await import("../outbox/email-drafts.md?raw");
const evidenceFiles = import.meta.glob("../outbox/evidence/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function extractJsonLd(report: string): Record<string, unknown> {
  const match = report.match(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/);
  expect(match, "pilot report must embed the JSON-LD proposal").not.toBeNull();
  return JSON.parse(match![1]) as Record<string, unknown>;
}

describe("prepared Nürnberg outbox", () => {
  it("carries one sourced manual pilot report and four simulation placeholders", () => {
    const leads = JSON.parse(leadsJson) as Lead[];
    expect(leads).toHaveLength(5);

    const pilotLeads = leads.filter((lead) => lead.id === PILOT_LEAD_ID);
    expect(pilotLeads).toHaveLength(1);
    const pilotLead = pilotLeads[0];
    expect(pilotLead.status).toBe("reviewed");
    expect(pilotLead.probeAuditReport).toBe("reports/hotel-victoria.md");
    expect(leads.filter((lead) => lead.status === "simulated")).toHaveLength(4);

    const pilot = reportFiles[PILOT_REPORT_PATH];
    expect(pilot, `missing pilot report at ${PILOT_REPORT_PATH}`).toBeDefined();
    expect(pilot).toContain(pilotLead.name);
    expect(pilot).toContain("https://www.hotelvictoria.de/");
    expect(pilot).toContain("Königstraße 80");
    expect(pilot).toContain("book@hotelvictoria.de");
    for (const marker of PILOT_MARKERS) {
      expect(pilot, `pilot report is missing "${marker}"`).toContain(marker);
    }
    for (const marker of FORBIDDEN_PILOT_MARKERS) {
      expect(pilot, `pilot report must not contain "${marker}"`).not.toContain(marker);
    }

    for (const lead of leads) {
      expect(lead.sources.length).toBeGreaterThan(0);
      expect(lead.sources.every((source) => source.startsWith("https://"))).toBe(true);

      const report =
        lead.id === PILOT_LEAD_ID
          ? pilot
          : reportFiles[`../outbox/${lead.probeAuditReport}`];
      expect(report, `missing report for ${lead.probeAuditReport}`).toBeDefined();
      expect(report).toContain(lead.name);

      if (lead.id === PILOT_LEAD_ID) continue;
      for (const marker of SIMULATION_MARKERS) {
        expect(
          report.toLowerCase(),
          `${lead.probeAuditReport} is missing "${marker}"`,
        ).toContain(marker);
      }
    }
  });

  it("embeds a syntactically valid Schema.org Hotel JSON-LD proposal in the pilot report", () => {
    const pilot = reportFiles[PILOT_REPORT_PATH];
    expect(pilot).toBeDefined();

    const jsonLd = extractJsonLd(pilot!);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Hotel");
    expect(jsonLd["name"]).toContain("Hotel VICTORIA");

    const address = jsonLd["address"] as Record<string, unknown>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address["streetAddress"]).toBe("Königstraße 80");
    expect(address["postalCode"]).toBe("90402");

    expect(jsonLd["email"]).toBe("book@hotelvictoria.de");
    expect(typeof jsonLd["priceRange"]).toBe("string");

    for (const listKey of ["amenityFeature", "containsPlace", "makesOffer"]) {
      const list = jsonLd[listKey] as unknown[];
      expect(Array.isArray(list), `JSON-LD must define ${listKey}`).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  it("points at raw evidence files that exist and carry the recorded run", () => {
    const pilot = reportFiles[PILOT_REPORT_PATH];
    expect(pilot).toBeDefined();

    // Every `outbox/evidence/...` path named in the report must resolve to a real file,
    // so the recorded runs stay checkable instead of becoming dead references.
    const referenced = Array.from(
      new Set(pilot!.match(/outbox\/evidence\/[^`\s)]+/g) ?? []),
    );
    expect(referenced.length).toBeGreaterThan(0);

    for (const relative of referenced) {
      const evidence = evidenceFiles[`../${relative}`];
      expect(evidence, `pilot report references missing ${relative}`).toBeDefined();
      // Each record must carry the neutral prompt and a substantial verbatim answer block.
      expect(evidence).toContain("Empfiehl mir 3 charmante Tagungshotels");
      const block = evidence!.match(
        /## Vollständiger Antworttext \(wörtlich\)\n\n```text\n([\s\S]*?)\n```/,
      );
      expect(block, `${relative} has no verbatim answer block`).not.toBeNull();
      expect(block![1].trim().length).toBeGreaterThan(200);
    }

    // The Perplexity record is the one that stays checkable through its answer URL.
    expect(evidenceFiles["../outbox/evidence/2026-09-27-perplexity-run1.md"]).toContain(
      "https://www.perplexity.ai/search/",
    );
  });

  it("keeps five email drafts in the explicitly unsent outbox file", () => {
    expect(drafts).toContain("# E-Mail-Entwürfe – nicht versenden");
    expect(drafts.match(/^## [1-5]\./gm)).toHaveLength(5);
    expect(drafts).toContain("Es wurde keine E-Mail versendet");
    // The pilot draft references the real report, the two documented snapshot runs and
    // still marks the “regular top mentions” claim as unverified.
    expect(drafts).toContain("book@hotelvictoria.de");
    expect(drafts).toContain("nicht verifiziert");
    expect(drafts).toContain("keine Messreihe");
    expect(drafts).toContain("GPT-5.6 Luna"); // documented run 2 label as displayed
    // Legacy of the unverified era that must never return as a finding:
    expect(drafts).not.toContain("arena.ai");
    expect(drafts).not.toContain("401 Unauthorized");
  });
});
