import { Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence: [], remediation };
}

export function getBlogRules(): Rule[] {
  return [
    {
      id: "blog.sourceDepth",
      title: "Source depth",
      description: "Require long-form or multiple medium-length sources.",
      severity: "med",
      appliesTo: (siteType) => siteType === "blog",
      evaluate: (context) => {
        const longForm = context.metrics.longFormSourcesCount >= 1;
        const mediumForm = context.metrics.mediumSourcesCount >= 2;
        if (longForm || mediumForm) {
          return result("PASS", 0, "Source depth requirements met.", []);
        }
        return result("WARN", -10, "Not enough long-form sources detected.", [
          "Add one long-form source (800+ words) or two medium sources (400+ words)."
        ]);
      }
    }
  ];
}
