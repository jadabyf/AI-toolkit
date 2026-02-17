import { classifyDomain } from "../classify";
import { Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence: [], remediation };
}

function isDifferentiator(text: string, tags?: string[]): boolean {
  if (tags?.some((tag) => tag.toLowerCase() === "differentiator")) {
    return true;
  }
  return /\bdifferentiator\b|\bunique\b|\bstandout\b/i.test(text);
}

export function getPortfolioRules(): Rule[] {
  return [
    {
      id: "portfolio.credibilityLink",
      title: "Credibility evidence",
      description: "Core tech claims should link to official docs or reputable tutorials.",
      severity: "med",
      appliesTo: (siteType) => siteType === "portfolio",
      evaluate: (context) => {
        const hasCredibleLink = context.summaries.some((summary) =>
          summary.bullets.some((bullet) =>
            bullet.citations.some((citation) => {
              const domainClass = classifyDomain(citation.url, context.index);
              return domainClass === "primary" || /\bdocs\b|\btutorial\b/i.test(citation.url);
            })
          )
        );
        if (hasCredibleLink) {
          return result("PASS", 0, "Credibility evidence present.", []);
        }
        return result("WARN", -8, "No credible documentation links detected.", [
          "Include at least one official doc or reputable tutorial for core tech claims."
        ]);
      }
    },
    {
      id: "portfolio.simplicity",
      title: "Simplicity gate",
      description: "Keep report concise and highlight differentiators.",
      severity: "med",
      defaultParams: { maxWords: 400, minDifferentiators: 3 },
      appliesTo: (siteType) => siteType === "portfolio",
      evaluate: (context) => {
        const maxWords = Number(context.ruleParams.maxWords ?? 400);
        const minDifferentiators = Number(context.ruleParams.minDifferentiators ?? 3);
        const overLimit = context.metrics.summaryWordCount > maxWords;
        const differentiatorCount = context.summaries.reduce((total, summary) => {
          return total + summary.bullets.filter((bullet) => isDifferentiator(bullet.text, bullet.tags)).length;
        }, 0);
        const missingDifferentiators = differentiatorCount < minDifferentiators;

        if (!overLimit && !missingDifferentiators) {
          return result("PASS", 0, "Summary length and differentiators are within limits.", []);
        }
        if (overLimit && missingDifferentiators) {
          return result("FAIL", -15, "Summary is too long and lacks differentiators.", [
            "Trim the summary and highlight at least three differentiators."
          ]);
        }
        return result("WARN", -8, "Summary length or differentiators need improvement.", [
          "Trim the summary and highlight at least three differentiators."
        ]);
      }
    }
  ];
}
