import { Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence: [], remediation };
}

export function getNewsletterRules(): Rule[] {
  return [
    {
      id: "newsletter.recency30",
      title: "Newsletter recency",
      description: "At least two sources within 30 days.",
      severity: "high",
      appliesTo: (siteType) => siteType === "newsletter",
      evaluate: (context) => {
        const recentCount = context.metrics.recentSources30;
        if (recentCount >= 2) {
          return result("PASS", 0, `Recent sources within 30 days: ${recentCount}.`, []);
        }
        if (recentCount === 1) {
          return result("WARN", -10, "Only one recent source within 30 days.", [
            "Add at least one more recent source."
          ]);
        }
        return result("FAIL", -20, "No sources within 30 days.", [
          "Add at least two sources from the last 30 days."
        ]);
      }
    },
    {
      id: "newsletter.primaryBalance",
      title: "Primary source balance",
      description: "At least one primary or official source.",
      severity: "med",
      appliesTo: (siteType) => siteType === "newsletter",
      evaluate: (context) => {
        if (context.domainStats.primaryDomains.length >= 1) {
          return result("PASS", 0, "Primary or official source present.", []);
        }
        return result("FAIL", -15, "No primary or official sources detected.", [
          "Include a primary source (official docs, filings, .gov/.edu, company blog)."
        ]);
      }
    },
    {
      id: "newsletter.trendCoverage",
      title: "Trend coverage",
      description: "Summaries should include what happened, why it matters, and what is next.",
      severity: "med",
      appliesTo: (siteType) => siteType === "newsletter",
      evaluate: (context) => {
        if (context.summaries.length === 0) {
          return result("FAIL", -15, "No summaries provided.", ["Add structured summaries with trend coverage."]);
        }
        const summariesWithAllFields = context.summaries.filter((summary) => {
          const fields = summary.fields;
          return Boolean(fields?.whatHappened && fields?.whyItMatters && fields?.whatsNext);
        });
        if (summariesWithAllFields.length === context.summaries.length) {
          return result("PASS", 0, "All summaries include trend coverage fields.", []);
        }
        if (summariesWithAllFields.length > 0) {
          return result("WARN", -8, "Some summaries missing trend coverage fields.", [
            "Add what happened, why it matters, and whats next fields to all summaries."
          ]);
        }
        return result("FAIL", -15, "Trend coverage fields are missing across summaries.", [
          "Add what happened, why it matters, and whats next fields to summaries."
        ]);
      }
    }
  ];
}
