/**
 * Renders outbox/reports/hotel-victoria.md from the pilot report data model.
 *
 * Usage: node --experimental-strip-types --no-warnings scripts/render-pilot-report.ts
 * The committed tests/pilotReport.test.ts pins the output byte-for-byte, so any manual
 * edit of the Markdown file (or of the data) makes the suite fail until re-rendered.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPilotReportMarkdown } from "../src/pilotReport.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = join(REPO_ROOT, "outbox/reports/hotel-victoria.md");

const current = readFileSync(REPORT_PATH, "utf8");
const rendered = buildPilotReportMarkdown();

if (current === rendered) {
  console.log(`Unverändert: ${REPORT_PATH}`);
} else {
  writeFileSync(REPORT_PATH, rendered, "utf8");
  console.log(`Neu geschrieben aus dem Datenmodell: ${REPORT_PATH}`);
}
