/**
 * Protocol status derived from the raw evidence records.
 *
 * `outbox/evidence/*.md` is the source of truth; this module turns those records into a
 * coverage overview (which system and day is covered, what is still missing) and a
 * comparison table that states only what the recorded spread supports. Nothing here queries
 * a system, and nothing here invents a ranking: order comes from a human reading the page,
 * so this module only reports whether the house appears in the verbatim text at all.
 */

export const EVIDENCE_GLOB_DIR = "outbox/evidence";

/**
 * The systems the protocol sets out to cover (section 2 of the pilot report). A planned
 * system without a record is listed as a gap rather than silently disappearing.
 */
export const PROTOCOL_SYSTEMS = ["Perplexity", "Duck.ai", "ChatGPT"] as const;

export const COVERAGE_PATH = "outbox/protocol-coverage.md";
export const COMPARISON_PATH = "outbox/protocol-comparison.md";

export interface EvidenceRecord {
  /** File name inside the evidence directory. */
  file: string;
  date: string;
  system: string;
  model?: string;
  mode?: string;
  url?: string;
  answer: string;
  sources: string[];
  mentionsHotelVictoria: boolean;
  anonymous: boolean;
}

/** A field a record lacks, phrased as the gap a reader would have to work around. */
export interface RecordGap {
  file: string;
  field: string;
  reason: string;
}

function field(text: string, labels: string[]): string | undefined {
  const match = new RegExp(`^- \\*\\*(${labels.join("|")}):\\*\\* (.+)$`, "m").exec(text);
  return match?.[2]?.trim();
}

function isAnonymous(mode: string | undefined): boolean {
  if (!mode) return false;
  if (/nicht anonym|angemeldet/i.test(mode)) return false;
  return /anonym/i.test(mode);
}

/** Read one raw evidence record. Throws when the metadata contract is not met. */
export function parseEvidenceRecord(file: string, text: string): EvidenceRecord {
  const dateTime = field(text, ["Datum\\/Zeit", "Datum"]);
  const date = dateTime?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const systemField = field(text, ["System\\/Produkt", "System"]);
  // The field may carry a description after the product name, e.g.
  // "Perplexity, web-gerenderte Antwortseite". Only the product name identifies a system.
  const system = systemField?.split(",")[0]?.trim();
  if (!date || !system) throw new Error(`${file}: missing date or system`);

  const block = /## Vollständiger Antworttext[^\n]*\n\n```text\n([\s\S]*?)\n```/.exec(text);
  if (!block) throw new Error(`${file}: missing verbatim answer block`);
  const answer = block[1];

  const sourcesSection = /## Zitat- und Quellenangaben\n\n([\s\S]*?)\n\n## /.exec(text)?.[1] ?? "";
  const sources = sourcesSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());

  const mode = field(text, ["Sitzungsart", "Modus"]);
  return {
    file,
    date,
    system,
    model: field(text, ["Angezeigtes Modelllabel", "Modelllabel"]),
    mode,
    url: field(text, ["Antwort-URL", "URL"]),
    answer,
    sources,
    mentionsHotelVictoria: /victoria/i.test(answer),
    anonymous: isAnonymous(mode),
  };
}

/** What a single record does not document, so the overview can name it instead of hiding it. */
export function recordGaps(record: EvidenceRecord): RecordGap[] {
  const gaps: RecordGap[] = [];
  if (!record.model || /nicht angezeigt|kein Modelllabel/i.test(record.model)) {
    gaps.push({
      file: record.file,
      field: "Modelllabel",
      reason: "das Produkt zeigte kein Modelllabel an",
    });
  }
  if (!record.url || /^keine /i.test(record.url)) {
    gaps.push({
      file: record.file,
      field: "Antwort-URL",
      reason: "der Lauf ist nicht per Link nachprüfbar",
    });
  }
  if (!record.anonymous) {
    gaps.push({
      file: record.file,
      field: "Anonymität",
      reason: "der Lauf lief in einer bestehenden angemeldeten Sitzung",
    });
  }
  return gaps;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function sortRecords(records: EvidenceRecord[]): EvidenceRecord[] {
  return [...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.system.localeCompare(b.system),
  );
}

function yesNo(value: boolean): string {
  return value ? "ja" : "nein";
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Which system, day and attribute is covered — and what is still missing. */
export function buildCoverageMarkdown(
  records: EvidenceRecord[],
  options: { seriesDays?: number } = {},
): string {
  const seriesDays = options.seriesDays ?? 7;
  const sorted = sortRecords(records);
  const lines: string[] = [];

  lines.push("# Protokoll-Abdeckung: KI-Zitierungsprüfung Hotel VICTORIA");
  lines.push("");
  lines.push(
    "**Erzeugt aus:** `" +
      EVIDENCE_GLOB_DIR +
      "/*.md` (`npm run render:status`). Diese Übersicht leitet sich aus den Rohbelegen ab und enthält keine eigenen Messwerte.",
  );
  lines.push("");

  lines.push("## Belegte Läufe");
  lines.push("");
  lines.push("| Datum | System | Beleg | anonym | Modelllabel | Antwort-URL | Quellen |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const record of sorted) {
    const hasModel = !recordGaps(record).some((gap) => gap.field === "Modelllabel");
    const hasUrl = !recordGaps(record).some((gap) => gap.field === "Antwort-URL");
    lines.push(
      `| ${record.date} | ${record.system} | \`${record.file}\` | ${yesNo(
        record.anonymous,
      )} | ${yesNo(hasModel)} | ${yesNo(hasUrl)} | ${yesNo(record.sources.length > 0)} |`,
    );
  }
  lines.push("");

  const plannedSystems = Array.from(
    new Set([...PROTOCOL_SYSTEMS, ...sorted.map((record) => record.system)]),
  );
  lines.push("## Systeme");
  lines.push("");
  for (const system of plannedSystems) {
    const forSystem = sorted.filter((record) => record.system === system);
    if (forSystem.length === 0) {
      lines.push(
        `- **${system}:** kein Rohbeleg vorhanden — der Lauf ist nur als Zusammenfassung im Bericht dokumentiert.`,
      );
      continue;
    }
    const days = Array.from(new Set(forSystem.map((record) => record.date))).sort();
    lines.push(
      `- **${system}:** ${plural(forSystem.length, "Beleg", "Belege")} an ${plural(
        days.length,
        "Tag",
        "Tagen",
      )} (${days.join(", ")})` +
        (forSystem.every((record) => !record.anonymous)
          ? " — kein anonymer Lauf."
          : forSystem.some((record) => !record.anonymous)
            ? " — teils angemeldet, teils anonym."
            : " — anonym geprüft."),
    );
  }
  lines.push("");

  const firstDate = sorted[0]?.date;
  if (firstDate) {
    lines.push(`## Geplante Serie (${seriesDays} Tage ab ${firstDate})`);
    lines.push("");
    lines.push("| Tag | Beleg von |");
    lines.push("| --- | --- |");
    let missingDays = 0;
    for (let offset = 0; offset < seriesDays; offset += 1) {
      const day = addDays(firstDate, offset);
      const systemsOnDay = sorted
        .filter((record) => record.date === day)
        .map((record) => record.system);
      if (systemsOnDay.length === 0) missingDays += 1;
      lines.push(
        `| ${day} | ${systemsOnDay.length > 0 ? systemsOnDay.join(", ") : "— fehlt"} |`,
      );
    }
    lines.push("");
    lines.push("## Was noch fehlt");
    lines.push("");
    if (missingDays > 0) {
      lines.push(
        `- ${missingDays} von ${seriesDays} geplanten Tagen ohne Beleg, zuerst ab ${addDays(
          firstDate,
          1,
        )}. Eine Serie entsteht nur, wenn an aufeinanderfolgenden Tagen tatsächlich gemessen wird.`,
      );
    }
    const singleRunSystems = plannedSystems.filter(
      (system) => sorted.filter((record) => record.system === system).length === 1,
    );
    if (singleRunSystems.length > 0) {
      lines.push(
        `- Nur ein Lauf je System für: ${singleRunSystems.join(", ")} — Stabilität innerhalb eines Tages ist damit nicht belegt.`,
      );
    }
    if (sorted.length > 0) {
      lines.push(
        `- Kein System hat Läufe an mehr als einem Tag; jede Aussage über Regelmäßigkeit bleibt unbelegt.`,
      );
    }
    const gaps = sorted.flatMap((record) => recordGaps(record));
    for (const gap of gaps) {
      lines.push(`- \`${gap.file}\`: ${gap.field} fehlt (${gap.reason}).`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Which systems name the house and what the recorded spread does and does not support. */
export function buildComparisonMarkdown(records: EvidenceRecord[]): string {
  const sorted = sortRecords(records);
  const lines: string[] = [];

  lines.push("# Protokoll-Vergleich: nennt das System das Haus?");
  lines.push("");
  lines.push(
    "**Erzeugt aus:** `" +
      EVIDENCE_GLOB_DIR +
      "/*.md` (`npm run render:status`). Nur ableitbare Angaben: ob der Hausname im protokollierten Antworttext vorkommt und welche Quellenangaben festgehalten wurden. Rangfolgen stehen im Bericht, wo sie von Hand aus der Seite gelesen wurden — nicht hier.",
  );
  lines.push("");
  lines.push("| Datum | System | Beleg | Nennt das Haus | Quellen | anonym | Antwort-URL |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const record of sorted) {
    const hasUrl = !recordGaps(record).some((gap) => gap.field === "Antwort-URL");
    lines.push(
      `| ${record.date} | ${record.system} | \`${record.file}\` | ${yesNo(
        record.mentionsHotelVictoria,
      )} | ${record.sources.length} | ${yesNo(record.anonymous)} | ${yesNo(hasUrl)} |`,
    );
  }
  lines.push("");
  lines.push("## Was diese Belege stützen");
  lines.push("");
  const days = Array.from(new Set(sorted.map((record) => record.date))).sort();
  const mentioning = sorted.filter((record) => record.mentionsHotelVictoria);
  lines.push(
    `- ${plural(sorted.length, "Beleg", "Belege")} an ${plural(days.length, "Tag", "Tagen")}: Der Hausname kommt in ${mentioning.length} von ${sorted.length} Belegen vor.`,
  );
  if (days.length < 2) {
    lines.push(
      "- Alle Belege stammen von einem einzigen Tag. Damit ist **nichts** über zeitliche Stabilität oder „regelmäßige“ Nennungen belegt.",
    );
  }
  const uncovered = PROTOCOL_SYSTEMS.filter(
    (system) => !sorted.some((record) => record.system === system),
  );
  if (uncovered.length > 0) {
    lines.push(
      `- Für ${uncovered.join(", ")} liegt kein Rohbeleg vor; der Lauf ist dort nur im Bericht zusammengefasst und nicht neu prüfbar.`,
    );
  }
  lines.push("");
  lines.push("## Was diese Belege nicht stützen");
  lines.push("");
  lines.push("- Keine Rangfolge: die Tabelle prüft nur, ob der Name vorkommt, nicht an welcher Stelle.");
  lines.push("- Keine Aussage über andere Prompts, Regionen, Konten oder Sprachversionen.");
  lines.push("- Keine Wirkung des JSON-LD-Vorschlags: die Belege zeigen Antworten, keinen Ursache-Wirkungs-Zusammenhang.");
  lines.push("");
  return lines.join("\n");
}
