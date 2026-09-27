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

  it("keeps the JSON-LD proposal parseable with the documented structure", () => {
    const json = JSON.parse(PILOT_JSON_LD_SCRIPT.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Hotel");
    expect(json["email"]).toBe("book@hotelvictoria.de");
  });
});
