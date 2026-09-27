export type AuditStage = "direct-mention" | "competitors" | "technical-readiness";
export type AuditStatus = "simulated" | "reviewed" | "needs-review";

export interface AuditCheckData {
  stage: AuditStage;
  title: string;
  status: AuditStatus;
  finding: string;
  recommendation: string;
  evidence?: string[];
}

export interface AuditReportData {
  companyName: string;
  website: string;
  industry: string;
  location: string;
  generatedAt: string;
  status: AuditStatus;
  /** Kept for the existing simulation endpoint's response contract. */
  mode: "simulation";
  checks: AuditCheckData[];
  disclaimer: string;
}

export interface SimulatedAuditInput {
  companyName: string;
  website: string;
  industry: string;
  location?: string;
}

export const SIMULATION_DISCLAIMER =
  "Simulation only: no live AI models, search engines, websites, or APIs were queried. This report is illustrative and is not a measured visibility score or a guarantee of results.";

const GENERIC_RECOMMENDATIONS: Record<AuditStage, string> = {
  "direct-mention":
    "Manuell mit einem festgehaltenen Prompt, System, Datum und Antwort prüfen, bevor eine Aussage zur KI-Nennung getroffen wird.",
  competitors:
    "Mit derselben dokumentierten Suchfrage und denselben Systemen vergleichen; ohne Belege keine Mitbewerberaussage treffen.",
  "technical-readiness":
    "Öffentliche Website-Daten und strukturierte Daten mit einem separaten, autorisierten Audit prüfen.",
};

/** Return data for an illustrative audit without performing network or AI queries. */
export function createSimulatedAuditData(
  input: SimulatedAuditInput,
  now = new Date(),
): AuditReportData {
  const companyName = input.companyName.trim();
  const website = input.website.trim();
  const industry = input.industry.trim();
  const location = input.location?.trim() || "DACH";
  const titles: Record<AuditStage, string> = {
    "direct-mention": "Direkte Nennung",
    competitors: "Mitbewerber",
    "technical-readiness": "Technische Hebel (Schema.org / JSON-LD)",
  };
  const findings: Record<AuditStage, string> = {
    "direct-mention": `Die direkte Auffindbarkeit von ${companyName} in Antworten zu ${industry} wurde nicht live abgefragt.`,
    competitors: `Eine Live-Auswertung der Mitbewerber in ${location} fand nicht statt.`,
    "technical-readiness": `Schema.org- und JSON-LD-Markup auf ${website} wurde in dieser Simulation nicht abgerufen oder validiert.`,
  };
  const stages: AuditStage[] = ["direct-mention", "competitors", "technical-readiness"];

  return {
    companyName,
    website,
    industry,
    location,
    generatedAt: now.toISOString(),
    status: "simulated",
    mode: "simulation",
    checks: stages.map((stage) => ({
      stage,
      title: titles[stage],
      status: "needs-review",
      finding: findings[stage],
      recommendation: GENERIC_RECOMMENDATIONS[stage],
    })),
    disclaimer: SIMULATION_DISCLAIMER,
  };
}

/** Format an audit data object as a Markdown report. */
export function formatAuditReportMarkdown(audit: AuditReportData): string {
  const escapeCell = (value: string): string =>
    value.replaceAll("|", "\\|").replaceAll("\n", " ").trim();
  const rows = audit.checks
    .map(
      (check) =>
        `| ${escapeCell(check.title)} | ${escapeCell(check.status)} | ${escapeCell(check.finding)} | ${escapeCell(check.recommendation)} |`,
    )
    .join("\n");

  return [
    `# GEO-Sichtbarkeitscheck: ${audit.companyName.replace(/[\r\n]/g, " ")}`,
    "",
    `- **Branche:** ${escapeCell(audit.industry)}`,
    `- **Region:** ${escapeCell(audit.location)}`,
    `- **Website:** ${escapeCell(audit.website)}`,
    `- **Erstellt (UTC):** ${escapeCell(audit.generatedAt)}`,
    `- **Status:** ${audit.status}`,
    audit.mode === "simulation" ? "- **Modus:** Simulation; keine Live-Abfragen" : "",
    "",
    "| Prüfbereich | Status | Beobachtung | Empfehlung |",
    "| --- | --- | --- | --- |",
    rows,
    "",
    `> ${audit.disclaimer}`,
    "",
  ].join("\n");
}

export { GENERIC_RECOMMENDATIONS };
export type { AuditReportData as AuditResult };
export const runSimulatedAudit = createSimulatedAuditData;
export const generateMarkdownReport = formatAuditReportMarkdown;
