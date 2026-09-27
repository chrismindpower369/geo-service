/**
 * Records one run of the documented AI citation protocol as a raw evidence file.
 *
 * Usage:
 *   node --experimental-strip-types --no-warnings scripts/record-citation-run.ts \
 *     --system "ChatGPT" --time "21:32 (Europe/Berlin)" --model "ChatGPT" \
 *     --mode "angemeldete Sitzung, temporärer Chat" --answer answer.txt \
 *     --source-panel "3 Quellen" --source "https://example.com/page" \
 *     --note "Kopfzeile und Folgefragen sind Seitengerüst."
 *
 * The answer text comes from `--answer <file>` or stdin. This script queries nothing: the
 * recorded text is exactly what the browser produced. Without `--run` the next free run
 * number for that date and system is used, so a series never overwrites a record.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEvidenceMarkdown,
  EVIDENCE_DIR,
  evidenceFileName,
  NEUTRAL_PROMPT,
  nextRunNumber,
} from "../src/citationRun.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Value of a `--flag value` pair, if present. */
function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** Every value of a repeated `--flag value` pair. */
function repeated(name: string): string[] {
  return process.argv.flatMap((arg, index) =>
    arg === `--${name}` ? [process.argv[index + 1]] : [],
  );
}

function required(name: string): string {
  const value = flag(name);
  if (!value) throw new Error(`missing required --${name}`);
  return value;
}

function localDate(now = new Date()): string {
  return now.toLocaleDateString("sv-SE");
}

function readAnswer(): string {
  const answerPath = flag("answer");
  if (answerPath) return readFileSync(resolve(answerPath), "utf8");
  if (process.stdin.isTTY) {
    throw new Error("provide the answer text with --answer <file> or pipe it via stdin");
  }
  return readFileSync(0, "utf8");
}

const system = required("system");
const date = flag("date") ?? localDate();
const outDir = resolve(REPO_ROOT, flag("dir") ?? EVIDENCE_DIR);
mkdirSync(outDir, { recursive: true });

const existing = readdirSync(outDir);
const explicitRun = Number.parseInt(flag("run") ?? "", 10);
const run = Number.isInteger(explicitRun) ? explicitRun : nextRunNumber(existing, date, system);
const target = join(outDir, evidenceFileName(date, system, run));

if (existsSync(target) && !process.argv.includes("--force")) {
  throw new Error(`${target} already exists; pass --run or --force to replace it`);
}

const markdown = buildEvidenceMarkdown({
  date,
  run,
  system,
  prompt: flag("prompt") ?? NEUTRAL_PROMPT,
  answer: readAnswer(),
  time: flag("time"),
  model: flag("model"),
  mode: flag("mode"),
  url: flag("url"),
  method: flag("method"),
  sourcePanel: flag("source-panel"),
  sources: repeated("source"),
  notes: repeated("note"),
});

if (process.argv.includes("--dry-run")) {
  process.stdout.write(markdown);
} else {
  writeFileSync(target, markdown, "utf8");
  const relative = target.slice(REPO_ROOT.length + 1).replaceAll("\\", "/");
  console.log(`Beleg geschrieben: ${relative} (${system}, Durchlauf ${run})`);
  console.log(
    "Nächster Schritt: den Pfad in Abschnitt 2 des Pilotberichts verlinken und den Bericht mit scripts/render-pilot-report.ts neu rendern.",
  );
}
