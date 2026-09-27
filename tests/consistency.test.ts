import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Drift guard for the pilot/simulation split.
 *
 * Exactly one lead report — the manually reviewed Hotel VICTORIA pilot — is not a
 * simulation. When the deliverables around it were updated, files outside the change
 * scope kept claiming the opposite. These tests fail if that claim ever comes back.
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCANNED_EXTENSIONS = [".md", ".json", ".ts", ".toml"];
const SKIPPED_DIRS = new Set(["node_modules", ".git", ".wrangler", "dist", "coverage", "tests"]);
const SKIPPED_FILES = new Set(["package-lock.json"]);

const LEADS = "outbox/nuernberg-leads.json";
const PILOT_LEAD_ID = "hotel-victoria-nuernberg";
const DRAFTS = "outbox/email-drafts.md";

const VICTORIA = /hotel[\s_-]*victoria/i;
const SIMULATION = /simulat/i;
/** Turns a simulation mention into a correction of it rather than a claim about it. */
const CORRECTION =
  /\b(kein|keine|keinen|keinem|keiner|nicht|ohne|weder|statt|früher|ehemals|vormalig|fälschlich)\b/i;

/**
 * Splits prose into clause-sized units. Clauses are needed, not just sentences: one sentence
 * may name the pilot and, in a second clause, call the *other* candidates simulations.
 */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?;:])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/** Sentences that name the VICTORIA report and call it a simulation. */
function victoriaSimulationClaims(text: string): string[] {
  return sentences(text).filter(
    (sentence) =>
      VICTORIA.test(sentence) && SIMULATION.test(sentence) && !CORRECTION.test(sentence),
  );
}

/** Markdown `##`-sections keyed by heading, so a lead's own heading scopes its own draft. */
function victoriaSections(text: string): { heading: string; body: string }[] {
  return text
    .split(/^(?=## )/m)
    .filter((part) => part.startsWith("## "))
    .map((part) => ({ heading: part.split("\n")[0], body: part }))
    .filter(({ heading }) => VICTORIA.test(heading));
}

function trackedFiles(): { rel: string; text: string }[] {
  const collected: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (
        SCANNED_EXTENSIONS.includes(extname(entry.name)) &&
        !SKIPPED_FILES.has(entry.name)
      ) {
        collected.push(join(dir, entry.name));
      }
    }
  };
  walk(REPO_ROOT);
  return collected.map((path) => ({
    rel: relative(REPO_ROOT, path).replaceAll("\\", "/"),
    text: readFileSync(path, "utf8"),
  }));
}

const files = trackedFiles();
const read = (rel: string): string => {
  const file = files.find((candidate) => candidate.rel === rel);
  if (!file) throw new Error(`missing tracked file ${rel}`);
  return file.text;
};

/** Resolves the pilot report from the lead data, so renaming the file cannot break this guard. */
function pilotReportPath(): string {
  const leads = JSON.parse(read(LEADS)) as { id: string; probeAuditReport: string }[];
  const lead = leads.find((entry) => entry.id === PILOT_LEAD_ID);
  if (!lead) throw new Error(`missing lead ${PILOT_LEAD_ID}`);
  return `outbox/${lead.probeAuditReport}`;
}

describe("pilot report is never described as a simulation", () => {
  it("catches the stale wording this guard exists for", () => {
    const staleDraft = "## 5. Hotel VICTORIA Nürnberg\n\nDer vorbereitete Probe-Report ist ausschließlich eine Simulation.\n";
    expect(victoriaSections(staleDraft)).toHaveLength(1);
    expect(victoriaSections(staleDraft)[0].body).toMatch(SIMULATION);

    expect(victoriaSimulationClaims("Der Bericht zu Hotel VICTORIA ist eine Simulation."))
      .toHaveLength(1);
    expect(victoriaSimulationClaims("Der Hotel-VICTORIA-Bericht ist kein Simulationsreport."))
      .toHaveLength(0);
    expect(victoriaSimulationClaims("Die drei übrigen Berichte sind Simulationen.")).toHaveLength(0);
  });

  it("finds no file claiming the VICTORIA report is a simulation", () => {
    const offenders = files.flatMap(({ rel, text }) =>
      victoriaSimulationClaims(text).map((sentence) => `${rel}: ${sentence}`),
    );
    expect(offenders, "stale simulation claim about the VICTORIA pilot report").toEqual([]);
  });

  it("keeps the VICTORIA draft section free of any simulation wording", () => {
    const victoriaSection = victoriaSections(read(DRAFTS));
    expect(victoriaSection).toHaveLength(1);
    expect(victoriaSection[0].body).not.toMatch(SIMULATION);
  });

  it("keeps the pilot report itself free of any simulation wording", () => {
    expect(read(pilotReportPath())).not.toMatch(SIMULATION);
  });
});
