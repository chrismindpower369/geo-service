/**
 * Records one run of the documented AI citation protocol as a raw evidence file.
 *
 * Usage:
 *   node --experimental-strip-types --no-warnings scripts/record-citation-run.ts \
 *     --system "ChatGPT" --time "21:32 (Europe/Berlin)" --model "ChatGPT" \
 *     --mode "angemeldete Sitzung, temporärer Chat" --answer answer.txt \
 *     --source-panel "3 Quellen" --source "https://example.com/page" \
 *     --ranking "Haus A; Haus B; Haus C" \
 *     --note "Kopfzeile und Folgefragen sind Seitengerüst."
 *
 * A record is refused when `--time`, `--mode`, `--model` or `--ranking` is missing: a
 * forgotten field would quietly weaken the series. State a documented absence instead
 * ("nicht angezeigt"), or accept the gap on purpose with `--allow-incomplete "<Grund>"`,
 * which is then written into the record.
 *
 * The answer text comes from `--answer <file>` or stdin. This script queries nothing: the
 * recorded text is exactly what the browser produced. Without `--run` the next free run
 * number for that date and system is used, so a series never overwrites a record.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildEvidenceMarkdown,
  EVIDENCE_DIR,
  missingProtocolFields,
  NEUTRAL_PROMPT,
  planEvidenceTarget,
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
const { run, path: target } = planEvidenceTarget({
  dir: outDir,
  date,
  system,
  existingFileNames: existing,
  run: Number.isInteger(explicitRun) ? explicitRun : undefined,
  force: process.argv.includes("--force"),
});

const draft = {
  date,
  run,
  system,
  prompt: flag("prompt") ?? NEUTRAL_PROMPT,
  time: flag("time"),
  model: flag("model"),
  mode: flag("mode"),
  url: flag("url"),
  method: flag("method"),
  sourcePanel: flag("source-panel"),
  sources: repeated("source"),
  ranking: flag("ranking")
    ?.split(";")
    .map((entry) => entry.trim())
    .filter(Boolean),
  notes: repeated("note"),
  waiver: flag("allow-incomplete"),
};

// Validate before reading the answer, so a forgotten flag fails fast instead of after a paste.
const missing = missingProtocolFields(draft);
if (missing.length > 0 && !draft.waiver) {
  console.error(
    `Beleg abgelehnt: folgende Protokollfelder fehlen: ${missing.join(", ")}.`,
  );
  console.error(
    'Entweder die Felder setzen (eine dokumentierte Absenz wie "nicht angezeigt" genügt) oder die Lücke bewusst annehmen: --allow-incomplete "<Grund>".',
  );
  process.exit(1);
}
if (missing.length > 0) {
  console.warn(
    `Warnung: bewusst unvollständiger Beleg — ${missing.join(", ")} fehlt (${draft.waiver}).`,
  );
}

const markdown = buildEvidenceMarkdown({ ...draft, answer: readAnswer() });

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
