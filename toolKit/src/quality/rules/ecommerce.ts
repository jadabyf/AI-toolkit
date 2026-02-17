import { classifyDomain, isReviewDomain } from "../classify";
import { Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence: [], remediation };
}

function isSpecBullet(text: string, tags?: string[]): boolean {
  if (tags?.some((tag) => ["spec", "specs", "specification"].includes(tag.toLowerCase()))) {
    return true;
  }
  return /\bspecs?\b|\bspecification\b/i.test(text);
}

function isReviewBullet(text: string, tags?: string[]): boolean {
  if (tags?.some((tag) => tag.toLowerCase().includes("review"))) {
    return true;
  }
  return /\breview\b|\brating\b/i.test(text);
}

export function getEcommerceRules(): Rule[] {
  return [
    {
      id: "ecommerce.primarySpecs",
      title: "Product truthfulness",
      description: "Specs must be backed by primary sources.",
      severity: "high",
      appliesTo: (siteType) => siteType === "ecommerce",
      evaluate: (context) => {
        const specBullets = context.summaries.flatMap((summary) =>
          summary.bullets.filter((bullet) => isSpecBullet(bullet.text, bullet.tags))
        );
        if (specBullets.length === 0) {
          return result("PASS", 0, "No spec claims detected.", []);
        }
        const missingPrimary = specBullets.filter((bullet) =>
          !bullet.citations.some((citation) => classifyDomain(citation.url, context.index) === "primary")
        );
        if (missingPrimary.length === 0) {
          return result("PASS", 0, "All spec claims backed by primary sources.", []);
        }
        return result("WARN", -12, "Some spec claims lack primary source citations.", [
          "Cite manufacturer or official listings for product specifications."
        ]);
      }
    },
    {
      id: "ecommerce.reviewSeparation",
      title: "Review separation",
      description: "Review claims must cite review sources, not marketing pages.",
      severity: "med",
      appliesTo: (siteType) => siteType === "ecommerce",
      evaluate: (context) => {
        const reviewBullets = context.summaries.flatMap((summary) =>
          summary.bullets.filter((bullet) => isReviewBullet(bullet.text, bullet.tags))
        );
        if (reviewBullets.length === 0) {
          return result("PASS", 0, "No review claims detected.", []);
        }
        const invalid = reviewBullets.filter((bullet) =>
          !bullet.citations.some((citation) => isReviewDomain(citation.url))
        );
        if (invalid.length === 0) {
          return result("PASS", 0, "Review claims cite review sources.", []);
        }
        return result("WARN", -8, "Some review claims lack review-source citations.", [
          "Cite review pages for review claims instead of marketing pages."
        ]);
      }
    },
    {
      id: "ecommerce.priceRecency",
      title: "Price volatility warning",
      description: "Price mentions must be backed by recent sources.",
      severity: "med",
      appliesTo: (siteType) => siteType === "ecommerce",
      evaluate: (context) => {
        if (!context.metrics.priceMentioned) {
          return result("PASS", 0, "No price mentions detected.", []);
        }
        if (context.metrics.priceSourceRecent) {
          return result("PASS", 0, "Price mentions backed by recent sources.", []);
        }
        return result("WARN", -10, "Price mentions without a recent source.", [
          "Refresh price sources within the last 7 days."
        ]);
      }
    },
    {
      id: "ecommerce.marketingLanguage",
      title: "Marketing language",
      description: "Warn when marketing language is excessive.",
      severity: "low",
      defaultParams: { threshold: 0.08 },
      appliesTo: (siteType) => siteType === "ecommerce",
      evaluate: (context) => {
        const threshold = Number(context.ruleParams.threshold ?? 0.08);
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
