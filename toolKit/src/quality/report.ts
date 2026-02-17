import { GateReport } from "./types";

export function createMarkdownReport(report: GateReport): string {
  const lines: string[] = [];
  lines.push("# Quality Gate Report");
  lines.push("");
  lines.push(`Site type: ${report.siteType}`);
  lines.push(`Overall status: ${report.overallStatus}`);
  lines.push(
    `Score: ${report.overallScore}/100 (pass >= ${report.thresholds.passScore}, warn >= ${report.thresholds.warnScore})`
  );
  lines.push("");
  lines.push("## Metrics");
  lines.push(`Source count: ${report.metricsSummary.sourceCount}`);
  lines.push(`Credible sources: ${report.metricsSummary.credibleSourceCount}`);
  lines.push(`Domain diversity: ${report.metricsSummary.domainDiversity}`);
  lines.push(`Citation coverage ratio: ${report.metricsSummary.citationCoverageRatio.toFixed(2)}`);
  lines.push(`Marketing language score: ${report.metricsSummary.marketingScore.toFixed(2)}`);
  lines.push(`Thin content pages: ${report.metricsSummary.thinContentCount}`);
  lines.push(`Recent sources (7d): ${report.metricsSummary.recentSources7}`);
  lines.push(`Recent sources (30d): ${report.metricsSummary.recentSources30}`);
  lines.push(`Recent sources (60d): ${report.metricsSummary.recentSources60}`);
  lines.push("");
  lines.push("## Rules");
  report.ruleResults.forEach((rule) => {
    const evidenceText = rule.evidence
      .map((item) => item.url || item.id || item.note || "")
      .filter(Boolean)
      .join(" | ");
    const remediationText = rule.remediation.join(" | ");
    lines.push(
      `- [${rule.status}] ${rule.id} (${rule.scoreDelta}): ${rule.explanation}` +
        (evidenceText ? ` Evidence: ${evidenceText}.` : "") +
        (remediationText ? ` Remediation: ${remediationText}.` : "")
    );
  });

  if (report.remediation.length > 0) {
    lines.push("");
    lines.push("## Remediation" );
    report.remediation.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  if (report.complianceChecklist && report.complianceChecklist.length > 0) {
    lines.push("");
    lines.push("## Compliance Checklist" );
    report.complianceChecklist.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  return lines.join("\n");
}
