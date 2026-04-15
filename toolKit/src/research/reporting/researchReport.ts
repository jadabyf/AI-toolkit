import { ResearchRun } from "../../core/models";

function fmtDate(value: string): string {
  return new Date(value).toISOString();
}

export function createResearchMarkdownReport(run: ResearchRun): string {
  const lines: string[] = [];
  lines.push("# Research Report");
  lines.push("");
  lines.push(`Run ID: ${run.runId}`);
  lines.push(`Execution timestamp: ${fmtDate(run.completedAt)}`);
  lines.push(`Research question: ${run.query.text}`);
  lines.push(`Site type: ${run.query.siteType}`);
  lines.push("");

  lines.push("## Providers");
  lines.push(`Search provider: ${run.report.providerSummary.searchProvider}`);
  lines.push(`LLM provider: ${run.report.providerSummary.llmProvider}`);
  lines.push("");

  lines.push("## Source Summary");
  lines.push("| # | Domain | Title | URL | Retrieved | Words |");
  lines.push("|---|---|---|---|---|---|");
  run.sources.forEach((source, index) => {
    lines.push(
      `| ${index + 1} | ${source.domain} | ${source.title.replace(/\|/g, "\\|")} | ${source.url} | ${fmtDate(source.retrievedAt)} | ${source.wordCount} |`
    );
  });
  lines.push("");

  lines.push("## Key Findings");
  run.report.keyFindings.forEach((finding) => lines.push(`- ${finding}`));
  lines.push("");

  lines.push("## Claims With Citations");
  run.claims.forEach((claim) => {
    lines.push(`- ${claim.statement} (confidence: ${claim.confidence}, inferred: ${claim.inferred ? "yes" : "no"})`);
    claim.citations.forEach((citation) => {
      lines.push(`  - citation: ${citation.url}`);
      lines.push(`  - quote: \"${citation.quote}\"`);
    });
  });
  lines.push("");

  lines.push("## Freshness And Diversity");
  lines.push(`- Source count: ${run.gate.report.metricsSummary.sourceCount}`);
  lines.push(`- Domain diversity: ${run.gate.report.metricsSummary.domainDiversity}`);
  lines.push(`- Recent sources (7d): ${run.gate.report.metricsSummary.recentSources7}`);
  lines.push(`- Recent sources (30d): ${run.gate.report.metricsSummary.recentSources30}`);
  lines.push("");

  lines.push("## Quality Gate Summary");
  lines.push(`- Overall status: ${run.gate.status}`);
  lines.push(`- Overall score: ${run.gate.score}`);
  run.gate.report.ruleResults.forEach((rule) => {
    lines.push(`- [${rule.status}] ${rule.id}: ${rule.explanation}`);
  });
  lines.push("");

  lines.push("## Warnings And Limitations");
  if (run.report.limitations.length === 0) {
    lines.push("- None reported.");
  } else {
    run.report.limitations.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push("");

  lines.push("## Recommended Next Steps");
  run.report.nextSteps.forEach((item) => lines.push(`- ${item}`));

  return lines.join("\n");
}
