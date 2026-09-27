import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NEUTRAL_PROMPT } from "../src/citationRun.js";
import { checkRecord, parseDaySheet, planMeasurementDay } from "../src/measureDay.js";
import { parseEvidenceRecord } from "../src/protocolStatus.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const LONG_ANSWER = `Meine drei Empfehlungen: 1. Hotel Beispiel, 2. Hotel Zweit, 3. Hotel Dritt.
Begründung: historisches Haus, zentrale Lage, je Eintrag eine Quelle. ${"Weitere Begründung mit Beleg. ".repeat(6)}`;

const ANSWERS = {
  "perplexity.txt": LONG_ANSWER,
  "duck-ai.txt": LONG_ANSWER,
  "chatgpt.txt": LONG_ANSWER,
};

/**
 * A day sheet for one system per product. Answer paths are absolute, so the sheet works from
 * any directory — the same way the checklist resolves paths against the repository root.
 */
function baseSheet(answersDir: string) {
  const file = (name: string) => join(answersDir, name);
  return {
    date: "2026-09-28",
    systems: [
      {
        system: "Perplexity",
        answer: file("perplexity.txt"),
        time: "20:49",
        model: "nicht angezeigt",
        mode: "anonymer Chat, geteilte Sitzung",
        ranking: ["Hotel Beispiel", "Hotel Zweit", "Hotel Dritt"],
        url: "https://www.perplexity.ai/search/x",
      },
      {
        system: "Duck.ai",
        answer: file("duck-ai.txt"),
        time: "22:15",
        model: "GPT-5.6 Luna",
        mode: "anonymer Chat",
        ranking: ["Hotel Zweit", "Hotel Dritt", "Hotel Viert"],
      },
      {
        system: "ChatGPT",
        answer: file("chatgpt.txt"),
        time: "21:28",
        model: "ChatGPT",
        mode: "angemeldete Sitzung, temporärer Chat",
        ranking: ["Hotel Beispiel", "Hotel Dritt", "Hotel Viert"],
      },
    ],
  };
}

interface DayWorkspace {
  root: string;
  answersDir: string;
  evidenceDir: string;
}

/** A day in the temporary directory: answer files and an empty evidence directory. */
function makeDay(answerFiles: Record<string, string> = ANSWERS): DayWorkspace {
  const root = mkdtempSync(join(tmpdir(), "measure-day-"));
  const answersDir = join(root, "answers");
  const evidenceDir = join(root, "evidence");
  mkdirSync(answersDir, { recursive: true });
  mkdirSync(evidenceDir, { recursive: true });
  for (const [name, content] of Object.entries(answerFiles)) {
    writeFileSync(join(answersDir, name), content, "utf8");
  }
  return { root, answersDir, evidenceDir };
}

function writeSheet(day: DayWorkspace, sheet: unknown): string {
  const dayPath = join(day.root, "day.json");
  writeFileSync(dayPath, JSON.stringify(sheet, null, 2), "utf8");
  return dayPath;
}

function planOf(build: (answersDir: string) => unknown, answerFiles = ANSWERS) {
  const day = makeDay(answerFiles);
  const parsed = parseDaySheet(readFileSync(writeSheet(day, build(day.answersDir)), "utf8"), "day.json");
  const plan = planMeasurementDay(parsed, {
    rootDir: day.root,
    evidenceDir: day.evidenceDir,
    existingFileNames: [],
  });
  return { day, plan };
}

function runCli(args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", "scripts/measure-day.ts", ...args],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
}

describe("measurement day", () => {
  it("plans one record per planned system, in protocol order", () => {
    const { plan } = planOf(baseSheet);

    expect(plan.runs.map((run) => run.fileName)).toEqual([
      "2026-09-28-perplexity-run1.md",
      "2026-09-28-duck-ai-run1.md",
      "2026-09-28-chatgpt-run1.md",
    ]);
    expect(plan.skipped).toEqual([]);
    expect(plan.warnings).toEqual([]);
    expect(plan.prompt).toBe(NEUTRAL_PROMPT);
  });

  it("refuses a day that leaves a planned system unexplained", () => {
    expect(() =>
      planOf((dir) => ({ ...baseSheet(dir), systems: baseSheet(dir).systems.slice(0, 2) })),
    ).toThrow(/ChatGPT/);
  });

  it("refuses a run that does not state its protocol fields", () => {
    expect(() =>
      planOf((dir) => ({
        date: "2026-09-28",
        systems: baseSheet(dir).systems.map((entry) =>
          entry.system === "ChatGPT" ? { ...entry, model: undefined } : entry,
        ),
      })),
    ).toThrow(/Modelllabel/);
  });

  it("refuses an empty answer file and a system outside the protocol", () => {
    expect(() =>
      planOf((dir) => baseSheet(dir), { ...ANSWERS, "duck-ai.txt": "   " }),
    ).toThrow(/leer/);

    expect(() =>
      planOf((dir) => ({
        date: "2026-09-28",
        systems: [
          ...baseSheet(dir).systems,
          {
            system: "Gemini",
            answer: join(dir, "perplexity.txt"),
            time: "10:00",
            model: "Gemini",
            mode: "anonym",
            ranking: ["Haus A"],
          },
        ],
      })),
    ).toThrow(/nicht im Protokoll/);
  });

  it("flags a record whose answer did not survive the round trip", () => {
    const { plan } = planOf(baseSheet);
    const run = plan.runs[0];
    const expected = {
      date: plan.date,
      system: run.system,
      prompt: plan.prompt,
      answer: run.input.answer ?? "",
      ranking: run.input.ranking ?? [],
    };

    expect(checkRecord(run.fileName, run.markdown, expected)).toEqual([]);

    const shortened = run.markdown.replace(expected.answer, "Gekürzter Text.");
    expect(shortened).not.toBe(run.markdown);
    expect(checkRecord(run.fileName, shortened, expected).join(" ")).toMatch(/unverändert/);
  });

  it("checks every record in a dry run and writes nothing", () => {
    const day = makeDay();
    const dayPath = writeSheet(day, baseSheet(day.answersDir));
    const result = runCli(["--day", dayPath, "--dir", day.evidenceDir, "--dry-run"]);

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Trockenlauf");
    expect(result.stdout).toContain("ok  2026-09-28-duck-ai-run1.md");
    expect(readdirSync(day.evidenceDir)).toEqual([]);
  });

  it("records the day, keeps a skipped system documented and stays readable for the views", () => {
    const day = makeDay();
    const sheet = {
      ...baseSheet(day.answersDir),
      systems: baseSheet(day.answersDir).systems.map((entry) =>
        entry.system === "Duck.ai" ? { system: "Duck.ai", skip: "keine Sitzung verfügbar" } : entry,
      ),
    };
    const dayPath = writeSheet(day, sheet);
    const result = runCli([
      "--day",
      dayPath,
      "--dir",
      day.evidenceDir,
      "--no-derivations",
      "--no-verify",
    ]);

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(readdirSync(day.evidenceDir).sort()).toEqual([
      "2026-09-28-chatgpt-run1.md",
      "2026-09-28-perplexity-run1.md",
    ]);
    expect(result.stdout).toContain("keine Sitzung verfügbar");

    const file = "2026-09-28-perplexity-run1.md";
    const record = parseEvidenceRecord(file, readFileSync(join(day.evidenceDir, file), "utf8"));
    expect(record.system).toBe("Perplexity");
    expect(record.answer).toContain("Hotel Beispiel");
    expect(record.ranking).toEqual(["Hotel Beispiel", "Hotel Zweit", "Hotel Dritt"]);
  });
});
