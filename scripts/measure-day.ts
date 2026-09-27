/**
 * Führt einen ganzen Mess-Tag in einem Aufruf: Erfassung, Belegprüfung, Ableitungen.
 *
 * Usage:
 *   npm run measure:day -- --day answers/2026-09-28.json
 *   npm run measure:day -- --day answers/2026-09-28.json --dry-run
 *
 * Die Läufe selbst fährt kein Skript: eine Person öffnet je System einen frischen Chat, sendet
 * den Prüfprompt und legt den wörtlichen Antworttext in `answers/<system>.txt`. Alles danach
 * liegt hier zusammen — Mess-Tag lesen, unvollständige Läufe abweisen, je System einen Beleg
 * schreiben, jeden Beleg mit demselben Parser wieder einlesen, Ableitungen erzeugen, Tests.
 *
 * Flags: `--day <Pfad>` (Pflicht), `--dry-run` (nur prüfen), `--dir <Belegordner>`,
 * `--force` (belegte Laufnummer ersetzen), `--no-derivations`, `--no-verify`.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EVIDENCE_DIR } from "../src/citationRun.ts";
import { checkRecord, parseDaySheet, planMeasurementDay } from "../src/measureDay.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** Repository-relative when the path lives inside the repo, absolute otherwise. */
function displayPath(target: string): string {
  const inside = relative(REPO_ROOT, target);
  return inside.startsWith("..") || inside === "" ? target : inside.replaceAll("\\", "/");
}

function runStep(label: string, args: string[]): boolean {
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, args, { cwd: REPO_ROOT, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`${label}: fehlgeschlagen (Exit ${result.status ?? "?"})`);
    return false;
  }
  return true;
}

const dayArgument = flag("day");
if (!dayArgument) {
  console.error("missing required --day <Pfad zum Tagesschein>");
  process.exit(1);
}

const dayPath = resolve(REPO_ROOT, dayArgument);
if (!existsSync(dayPath)) {
  console.error(`Mess-Tag nicht gefunden: ${dayArgument}`);
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const runDerivations = !process.argv.includes("--no-derivations");
const verify = !process.argv.includes("--no-verify");
const evidenceDir = resolve(REPO_ROOT, flag("dir") ?? EVIDENCE_DIR);

let plan;
try {
  const sheet = parseDaySheet(readFileSync(dayPath, "utf8"), dayArgument);
  plan = planMeasurementDay(sheet, {
    rootDir: REPO_ROOT,
    evidenceDir,
    existingFileNames: existsSync(evidenceDir) ? readdirSync(evidenceDir) : [],
    force,
  });
} catch (error) {
  console.error(`Mess-Tag abgelehnt: ${(error as Error).message}`);
  process.exit(1);
}

console.log(
  `${dryRun ? "Trockenlauf" : "Mess-Tag"} ${plan.date} — ${plan.runs.length} Lauf/Läufe, ${plan.skipped.length} bewusst ausgelassen`,
);
for (const run of plan.runs) {
  console.log(
    `  ${run.system.padEnd(11)} → ${displayPath(run.path)} ` +
      `(Durchlauf ${run.run}, Antwort ${run.answerChars} Zeichen)`,
  );
}
for (const skip of plan.skipped) {
  console.log(`  ${skip.system.padEnd(11)} ohne Lauf: ${skip.reason} — bleibt als Lücke in der Abdeckung`);
}
for (const warning of plan.warnings) console.warn(`Warnung: ${warning}`);

const checks = plan.runs.map((run) => ({
  run,
  expected: {
    date: plan.date,
    system: run.system,
    prompt: plan.prompt,
    answer: run.input.answer ?? "",
    ranking: run.input.ranking ?? [],
  },
}));

console.log("\nBelegprüfung (Parser der Ableitungen):");
const problems: string[] = [];
for (const { run, expected } of checks) {
  const found = checkRecord(run.fileName, run.markdown, expected);
  console.log(found.length === 0 ? `  ok  ${run.fileName}` : `  FEHLER ${run.fileName}`);
  problems.push(...found);
}
for (const problem of problems) console.error(`  ${problem}`);

if (problems.length > 0) {
  console.error("\nBelegprüfung fehlgeschlagen — nichts geschrieben.");
  process.exit(1);
}

if (dryRun) {
  console.log("\nTrockenlauf: nichts geschrieben, keine Ableitungen erzeugt.");
  process.exit(0);
}

mkdirSync(evidenceDir, { recursive: true });
for (const run of plan.runs) writeFileSync(run.path, run.markdown, "utf8");
console.log(`\n${plan.runs.length} Beleg(e) in ${displayPath(evidenceDir)} geschrieben.`);

// Read back what actually landed on disk: the file is the evidence, not the string in memory.
const diskProblems: string[] = [];
for (const { run, expected } of checks) {
  diskProblems.push(...checkRecord(run.fileName, readFileSync(run.path, "utf8"), expected));
}
if (diskProblems.length > 0) {
  for (const problem of diskProblems) console.error(`  ${problem}`);
  console.error("Die geschriebenen Belege weichen ab — bitte prüfen, bevor Ableitungen laufen.");
  process.exit(1);
}

if (runDerivations) {
  const ok = runStep("Ableitungen: render:status", [
    "--experimental-strip-types",
    "--no-warnings",
    "scripts/render-protocol-status.ts",
  ]);
  if (!ok) process.exit(1);
}

if (verify) {
  const vitest = join(REPO_ROOT, "node_modules", "vitest", "vitest.mjs");
  if (!existsSync(vitest)) {
    console.error("vitest nicht gefunden — erst `npm install` laufen lassen.");
    process.exit(1);
  }
  if (!runStep("Tests", [vitest, "run"])) process.exit(1);
}

console.log("\nFertig. Ein neuer Lauf gehört zusätzlich in Abschnitt 2 des Berichts —");
console.log("siehe docs/protocol-daily-checklist.md, «Einen Lauf in den Bericht bringen».");
