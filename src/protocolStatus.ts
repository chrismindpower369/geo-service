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

/** A planned system without a raw record, and the reason that gap is accepted. */
export interface SystemWaiver {
  system: string;
  reason: string;
}

/**
 * Planned systems whose missing record is accepted on purpose. A waiver must give a reason to
 * count, and it must not outlive its gap: once the system has a record, the waiver has to go.
 * An empty list is the state to aim for — it means every planned system carries raw evidence.
 */
export const COVERAGE_WAIVERS: readonly SystemWaiver[] = [];

export interface CoverageGap {
  system: string;
  waived: boolean;
  reason?: string;
}

function hasRecord(records: EvidenceRecord[], system: string): boolean {
  return records.some((record) => record.system === system);
}

/** Planned systems without a record, each with the waiver that covers it, if any. */
export function coverageGaps(
  records: EvidenceRecord[],
  options: { systems?: readonly string[]; waivers?: readonly SystemWaiver[] } = {},
): CoverageGap[] {
  const systems = options.systems ?? PROTOCOL_SYSTEMS;
  const waivers = options.waivers ?? COVERAGE_WAIVERS;
  return systems
    .filter((system) => !hasRecord(records, system))
    .map((system) => {
      const waiver = waivers.find(
        (entry) => entry.system === system && entry.reason.trim().length > 0,
      );
      return {
        system,
        waived: waiver !== undefined,
        ...(waiver ? { reason: waiver.reason.trim() } : {}),
      };
    });
}

/** Gaps nobody accepted on purpose. Empty is the expected state of the protocol. */
export function unwaivedCoverageGaps(
  records: EvidenceRecord[],
  options: { systems?: readonly string[]; waivers?: readonly SystemWaiver[] } = {},
): string[] {
  return coverageGaps(records, options)
    .filter((gap) => !gap.waived)
    .map((gap) => gap.system);
}

/** Waivers whose system now has a record; such a waiver has to be removed. */
export function staleSystemWaivers(
  records: EvidenceRecord[],
  waivers: readonly SystemWaiver[] = COVERAGE_WAIVERS,
): string[] {
  return waivers.filter((waiver) => hasRecord(records, waiver.system)).map((waiver) => waiver.system);
}

export const COVERAGE_PATH = "outbox/protocol-coverage.md";
export const COMPARISON_PATH = "outbox/protocol-comparison.md";
export const PLAN_PATH = "outbox/messplan-hotel-victoria.md";

/** Field label shared by the record writer and this parser. */
export const RANKING_FIELD = "Reihenfolge der genannten Häuser";

export interface EvidenceRecord {
  /** File name inside the evidence directory. */
  file: string;
  date: string;
  system: string;
  model?: string;
  mode?: string;
  url?: string;
  /** The prompt that was submitted, as recorded in the run. */
  prompt: string;
  answer: string;
  sources: string[];
  /** Houses in the order the answer presented them, as recorded during the run. */
  ranking: string[];
  /** Reason recorded when a run was accepted with protocol fields missing. */
  waiver?: string;
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

  const prompt = /^- \*\*Prompt[^:]*:\*\*\s*„([^“]+)“/m.exec(text)?.[1]?.trim() ?? "";
  const mode = field(text, ["Sitzungsart", "Modus"]);
  const ranking = (field(text, [RANKING_FIELD]) ?? "")
    .split("→")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return {
    file,
    date,
    system,
    model: field(text, ["Angezeigtes Modelllabel", "Modelllabel"]),
    mode,
    url: field(text, ["Antwort-URL", "URL"]),
    prompt,
    answer,
    sources,
    ranking,
    waiver: /^- \*\*Bewusst unvollständiger Beleg:\*\* (.+)$/m.exec(text)?.[1]?.trim(),
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
  if (record.ranking.length === 0) {
    gaps.push({
      file: record.file,
      field: "Reihenfolge",
      reason: "die Reihenfolge der genannten Häuser wurde beim Lauf nicht festgehalten",
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
      const waiver = COVERAGE_WAIVERS.find(
        (entry) => entry.system === system && entry.reason.trim().length > 0,
      );
      lines.push(
        waiver
          ? `- **${system}:** kein Rohbeleg vorhanden — bewusst offen: ${waiver.reason.trim()}`
          : `- **${system}:** kein Rohbeleg vorhanden — offene Lücke ohne Begründung.`,
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
    for (const record of sorted.filter((entry) => entry.waiver)) {
      lines.push(`- \`${record.file}\`: bewusst unvollständig aufgenommen — ${record.waiver}`);
    }
    const acknowledged = coverageGaps(sorted).filter((gap) => gap.waived);
    for (const gap of acknowledged) {
      lines.push(`- **${gap.system}:** ohne Rohbeleg eingeplant und begründet — ${gap.reason}`);
    }
    const openGaps = unwaivedCoverageGaps(sorted);
    if (openGaps.length > 0) {
      lines.push(`- **Offene Lücken ohne Begründung:** ${openGaps.join(", ")}.`);
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
      "/*.md` (`npm run render:status`). Nur ableitbare Angaben: ob der Hausname im protokollierten Antworttext vorkommt und welche Reihenfolge beim Lauf festgehalten wurde. Fehlt die Reihenfolge, bleibt die Spalte leer — sie wird nicht geschätzt.",
  );
  lines.push("");
  lines.push(
    "| Datum | System | Beleg | Nennt das Haus | Reihenfolge (protokolliert) | Quellen | anonym | Antwort-URL |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const record of sorted) {
    const hasUrl = !recordGaps(record).some((gap) => gap.field === "Antwort-URL");
    lines.push(
      `| ${record.date} | ${record.system} | \`${record.file}\` | ${yesNo(
        record.mentionsHotelVictoria,
      )} | ${record.ranking.length > 0 ? record.ranking.join(" → ") : "— nicht protokolliert"} | ${
        record.sources.length
      } | ${yesNo(record.anonymous)} | ${yesNo(hasUrl)} |`,
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
  const withRanking = sorted.filter((record) => record.ranking.length > 0);
  if (withRanking.length > 0) {
    const firstNamed = withRanking.filter((record) => /victoria/i.test(record.ranking[0]));
    lines.push(
      `- In ${firstNamed.length} von ${withRanking.length} Belegen mit protokollierter Reihenfolge nennt die Antwort das Haus an erster Stelle.`,
    );
  } else {
    lines.push(
      "- In keinem Beleg ist die Reihenfolge festgehalten; über die Position des Hauses ist damit nichts ausgesagt.",
    );
  }
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
  lines.push(
    "- Keine Rangfolge über diese Läufe hinaus: die Spalte „Reihenfolge“ gibt nur wieder, was beim jeweiligen Lauf festgehalten wurde — nicht, wie das System bei anderen Fragen oder zu anderen Zeiten sortiert.",
  );
  lines.push("- Keine Aussage über andere Prompts, Regionen, Konten oder Sprachversionen.");
  lines.push("- Keine Wirkung des JSON-LD-Vorschlags: die Belege zeigen Antworten, keinen Ursache-Wirkungs-Zusammenhang.");
  lines.push("");
  return lines.join("\n");
}

/**
 * Plain-language plan a hotel can be shown: what the series measures, what already exists,
 * what is still missing. Every number comes from the records, so the offer cannot outgrow
 * the evidence.
 */
export function buildMeasurementPlanMarkdown(
  records: EvidenceRecord[],
  options: { seriesDays?: number } = {},
): string {
  const seriesDays = options.seriesDays ?? 7;
  const sorted = sortRecords(records);
  const days = Array.from(new Set(sorted.map((record) => record.date))).sort();
  const plannedSystems = Array.from(
    new Set<string>([...PROTOCOL_SYSTEMS, ...sorted.map((record) => record.system)]),
  );
  const prompt = sorted[0]?.prompt ?? "";
  const lines: string[] = [];

  lines.push("# Messplan: KI-Empfehlungen für Hotel VICTORIA Nürnberg");
  lines.push("");
  lines.push(
    "**Was das ist:** der Vorschlag für eine protokollierte Messreihe dazu, wie Ihr Haus in KI-Antworten vorkommt. Der Plan beschreibt, was gemessen wird — nicht, was dabei herauskommt. Er ist aus den Rohbelegen in `" +
      EVIDENCE_GLOB_DIR +
      "` abgeleitet.",
  );
  lines.push("");
  lines.push("## Wie gemessen wird");
  lines.push("");
  if (prompt) {
    lines.push(`- In jedem Lauf dieselbe Frage, ohne Nennung Ihres Hauses: „${prompt}“`);
  }
  lines.push(
    "- Je Lauf ein frischer Chat und ein System. Festgehalten werden Datum, System, angezeigtes Modelllabel, die vollständige Antwort und alle sichtbaren Quellenangaben.",
  );
  lines.push(
    "- Jeder Lauf wird als Rohbeleg abgelegt und ist damit später nachprüfbar; Zusammenfassungen ersetzen keinen Beleg.",
  );
  lines.push("");
  lines.push("## Was schon vorliegt");
  lines.push("");
  if (sorted.length === 0) {
    lines.push("- Noch kein Lauf protokolliert.");
  } else {
    lines.push("| Tag | System | Ihr Haus genannt | Position in der Antwort |");
    lines.push("| --- | --- | --- | --- |");
    for (const record of sorted) {
      lines.push(
        `| ${record.date} | ${record.system} | ${yesNo(record.mentionsHotelVictoria)} | ${
          record.ranking.length > 0 ? record.ranking.join(" → ") : "nicht festgehalten"
        } |`,
      );
    }
    lines.push("");
    const mentioning = sorted.filter((record) => record.mentionsHotelVictoria);
    lines.push(
      `- ${plural(sorted.length, "Beleg", "Belege")} von ${plural(seriesDays, "geplantem Tag", "geplanten Tagen")}: In ${mentioning.length} von ${sorted.length} Antworten wird Ihr Haus genannt.`,
    );
  }
  for (const gap of coverageGaps(sorted)) {
    lines.push(
      gap.waived
        ? `- Für **${gap.system}** gibt es keinen Rohbeleg (bewusst offen: ${gap.reason}); der Lauf ist damit nicht neu prüfbar.`
        : `- Für **${gap.system}** gibt es keinen Rohbeleg und keine Begründung; der Lauf ist nicht neu prüfbar.`,
    );
  }
  lines.push("");
  lines.push("## Was noch fehlt");
  lines.push("");
  if (days.length > 0) {
    const missing = seriesDays - days.length;
    lines.push(
      `- ${missing > 0 ? `${missing} von ${seriesDays} Tagen sind noch nicht gemessen; bisher belegt ist ${days.join(", ")}.` : `Alle ${seriesDays} geplanten Tage sind abgedeckt.`}`,
    );
    lines.push(
      "- Pro Tag und System ein Lauf: erst mehrere Tage erlauben eine Aussage darüber, ob eine Nennung stabil bleibt. Ein einzelner Tag belegt das nicht.",
    );
  }
  const gaps = sorted.flatMap((record) => recordGaps(record));
  for (const gap of gaps) {
    lines.push(`- \`${gap.file}\`: ${gap.field} fehlt (${gap.reason}).`);
  }
  for (const record of sorted.filter((entry) => entry.waiver)) {
    lines.push(`- \`${record.file}\`: bewusst unvollständig aufgenommen — ${record.waiver}`);
  }
  lines.push("");
  lines.push("## Was diese Messung nicht ist");
  lines.push("");
  lines.push(
    "- Kein Ranking-Audit, kein Sichtbarkeits-Score und keine Erfolgszusage. Die Reihenfolge einer Antwort ist eine Momentaufnahme des jeweiligen Systems.",
  );
  lines.push(
    "- Keine Aussage über andere Fragen, Orte, Sprachen, Konten oder Zeitpunkte als die protokollierten.",
  );
  lines.push(
    "- Kein Nachweis, dass ein technischer Eingriff auf Ihrer Website eine Nennung verändert — dafür wäre ein Vorher-Nachher-Vergleich nötig.",
  );
  lines.push("");
  lines.push("## Was wir dafür brauchen");
  lines.push("");
  lines.push("- Ihre Freigabe für genau diese Frage und die genannten Systeme.");
  lines.push(`- ${plural(seriesDays, "Messtag", "Messtage")}, an denen tatsächlich gemessen wird.`);
  lines.push(
    "- Für Systeme mit Anmeldepflicht eine bestehende Sitzung; ohne sie bleibt das System ausdrücklich „nicht geprüft“.",
  );
  lines.push("");
  return lines.join("\n");
}
