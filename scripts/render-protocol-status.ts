/**
 * Regenerates the protocol views from the raw evidence records.
 *
 * Usage: npm run render:status -- [--series-days 7]
 *
 * Writes `outbox/protocol-coverage.md` and `outbox/protocol-comparison.md` from
 * `outbox/evidence/*.md`. The evidence records are the only input; adding a day means
 * recording a run, not editing these views by hand.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildComparisonMarkdown,
  buildCoverageMarkdown,
  buildMeasurementPlanMarkdown,
  COMPARISON_PATH,
  COVERAGE_PATH,
  EVIDENCE_GLOB_DIR,
  parseEvidenceRecord,
  PLAN_PATH,
  type EvidenceRecord,
} from "../src/protocolStatus.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function numericFlag(name: string, fallback: number): number {
  const index = process.argv.indexOf(`--${name}`);
  const value = index === -1 ? Number.NaN : Number.parseInt(process.argv[index + 1], 10);
  return Number.isInteger(value) ? value : fallback;
}

const evidenceDir = join(REPO_ROOT, EVIDENCE_GLOB_DIR);
const files = existsSync(evidenceDir)
  ? readdirSync(evidenceDir)
      .filter((name) => name.endsWith(".md"))
      .sort()
  : [];

const records: EvidenceRecord[] = files.map((name) =>
  parseEvidenceRecord(name, readFileSync(join(evidenceDir, name), "utf8")),
);

function write(relative: string, content: string): void {
  const target = join(REPO_ROOT, relative);
  const before = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (before === content) {
    console.log(`Unverändert: ${relative}`);
    return;
  }
  writeFileSync(target, content, "utf8");
  console.log(`Neu geschrieben: ${relative}`);
}

console.log(`${records.length} Beleg(e) in ${EVIDENCE_GLOB_DIR} gelesen.`);
const seriesDays = numericFlag("series-days", 7);
write(COVERAGE_PATH, buildCoverageMarkdown(records, { seriesDays }));
write(COMPARISON_PATH, buildComparisonMarkdown(records));
write(PLAN_PATH, buildMeasurementPlanMarkdown(records, { seriesDays }));
