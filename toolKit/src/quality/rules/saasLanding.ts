import { classifyDomain } from "../classify";
import { Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence: [], remediation };
}

const CLAIM_KEYWORDS = [
  "roi",
  "increase",
  "improve",
  "faster",
  "save",
  "reduce",
  "%"
];

export function getSaasLandingRules(): Rule[] {
  return [
    {
      id: "saas.claimsGate",
      title: "Claims gate",
      description: "Performance or ROI claims must be backed by credible sources.",
      severity: "high",
      appliesTo: (siteType) => siteType === "saasLanding",
      evaluate: (context) => {
        const claimBullets = context.summaries.flatMap((summary) =>
          summary.bullets.filter((bullet) =>
            CLAIM_KEYWORDS.some((keyword) => bullet.text.toLowerCase().includes(keyword))
          )
        );
        if (claimBullets.length === 0) {
          return result("PASS", 0, "No performance or ROI claims detected.", []);
        }
        const unbacked = claimBullets.filter((bullet) =>
          !bullet.citations.some((citation) => {
            const domainClass = classifyDomain(citation.url, context.index);
            return domainClass === "primary" || domainClass === "secondary";
          })
        );
        if (unbacked.length === 0) {
          return result("PASS", 0, "All claims are backed by credible sources.", []);
        }
        const status = unbacked.length >= 2 ? "FAIL" : "WARN";
        const scoreDelta = unbacked.length >= 2 ? -20 : -10;
        return result(status, scoreDelta, "Some claims lack credible sources.", [
          "Cite credible sources for all performance or ROI claims."
        ]);
      }
    },
    {
      id: "saas.marketingLanguage",
      title: "Marketing language",
      description: "Warn when marketing language is excessive.",
      severity: "low",
      defaultParams: { threshold: 0.1 },
      appliesTo: (siteType) => siteType === "saasLanding",
      evaluate: (context) => {
        const threshold = Number(context.ruleParams.threshold ?? 0.1);
        if (context.metrics.marketingScore <= threshold) {
          return result("PASS", 0, "Marketing language is within limits.", []);
        }
        return result("WARN", -6, "Marketing language appears excessive.", [
          "Reduce superlatives and add neutral, cited statements."
        ]);
      }
    }
  ];
}
