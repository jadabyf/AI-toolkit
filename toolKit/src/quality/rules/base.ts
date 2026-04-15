import { getDomainFromUrl, isLowQualityDomain } from "../classify";
import { wordCount } from "../metrics";
import { Evidence, Rule, RuleResult } from "../types";

function result(status: RuleResult["status"], scoreDelta: number, explanation: string, evidence: Evidence[], remediation: string[]): RuleResult {
  return { status, scoreDelta, explanation, evidence, remediation };
}

function collectClaimSignals(context: Parameters<Rule["evaluate"]>[0]): {
  totalBullets: number;
  unsupportedBullets: number;
  inferredBullets: number;
  lowConfidenceBullets: number;
} {
  let totalBullets = 0;
  let unsupportedBullets = 0;
  let inferredBullets = 0;
  let lowConfidenceBullets = 0;

  context.summaries.forEach((summary) => {
    summary.bullets.forEach((bullet) => {
      totalBullets += 1;
      if (!bullet.citations || bullet.citations.length === 0) {
        unsupportedBullets += 1;
      }
      const tags = (bullet.tags ?? []).map((tag) => tag.toLowerCase());
      if (tags.includes("inferred")) {
        inferredBullets += 1;
      }
      if (tags.includes("confidence-low")) {
        lowConfidenceBullets += 1;
      }
    });
  });

  return { totalBullets, unsupportedBullets, inferredBullets, lowConfidenceBullets };
}

export function getBaseRules(): Rule[] {
  return [
    {
      id: "base.minSources",
      title: "Minimum credible sources",
      description: "Ensure at least a minimum number of credible sources.",
      severity: "high",
      defaultParams: { min: 3 },
      appliesTo: () => true,
      evaluate: (context) => {
        const min = Number(context.ruleParams.min ?? 3);
        const credibleCount = context.metrics.credibleSourceCount;
        const evidence: Evidence[] = context.sources.map((source) => ({ type: "source", url: source.url }));
        if (credibleCount >= min) {
          return result("PASS", 0, `Credible sources: ${credibleCount} (min ${min}).`, evidence, []);
        }
        return result("FAIL", -25, `Credible sources: ${credibleCount} (min ${min}).`, evidence, [
          "Add more credible sources and remove low-quality sources."
        ]);
      }
    },
    {
      id: "base.domainDiversity",
      title: "Domain diversity",
      description: "Ensure sources span multiple unique domains.",
      severity: "med",
      defaultParams: { minDomains: 2 },
      appliesTo: () => true,
      evaluate: (context) => {
        const minDomains = Number(context.ruleParams.minDomains ?? 2);
        const diversity = context.metrics.domainDiversity;
        const evidence: Evidence[] = context.domainStats.uniqueDomains.map((domain) => ({ type: "source", note: domain }));
        if (diversity >= minDomains) {
          return result("PASS", 0, `Domain diversity: ${diversity} (min ${minDomains}).`, evidence, []);
        }
        return result("FAIL", -15, `Domain diversity: ${diversity} (min ${minDomains}).`, evidence, [
          "Add sources from additional unique domains."
        ]);
      }
    },
    {
      id: "base.authoritativeSources",
      title: "Authoritative source minimum",
      description: "Ensure a minimum number of primary/authoritative domains are represented.",
      severity: "med",
      defaultParams: { minPrimaryDomains: 1 },
      appliesTo: () => true,
      evaluate: (context) => {
        const minPrimaryDomains = Number(context.ruleParams.minPrimaryDomains ?? 1);
        const count = context.domainStats.primaryDomains.length;
        const evidence: Evidence[] = context.domainStats.primaryDomains.map((domain) => ({
          type: "source",
          note: `primary:${domain}`
        }));
        if (count >= minPrimaryDomains) {
          return result("PASS", 0, `Primary domains: ${count} (min ${minPrimaryDomains}).`, evidence, []);
        }
        return result("WARN", -10, `Primary domains: ${count} (min ${minPrimaryDomains}).`, evidence, [
          "Add at least one authoritative source (official docs, .gov/.edu, or primary vendor domain)."
        ]);
      }
    },
    {
      id: "base.duplicateSources",
      title: "Duplicate source detection",
      description: "Detect duplicated source URLs and over-reliance on identical pages.",
      severity: "med",
      defaultParams: { warnCount: 1, failCount: 3 },
      appliesTo: () => true,
      evaluate: (context) => {
        const warnCount = Number(context.ruleParams.warnCount ?? 1);
        const failCount = Number(context.ruleParams.failCount ?? 3);
        const counts = new Map<string, number>();
        context.sources.forEach((source) => {
          counts.set(source.url, (counts.get(source.url) ?? 0) + 1);
        });

        const duplicates = Array.from(counts.entries()).filter(([, count]) => count > 1);
        const evidence: Evidence[] = duplicates.map(([url, count]) => ({
          type: "source",
          url,
          note: `duplicate-count:${count}`
        }));

        if (duplicates.length >= failCount) {
          return result("FAIL", -20, `Duplicate source URLs found: ${duplicates.length}.`, evidence, [
            "Deduplicate URLs and replace repeated pages with additional independent sources."
          ]);
        }
        if (duplicates.length >= warnCount) {
          return result("WARN", -8, `Duplicate source URLs found: ${duplicates.length}.`, evidence, [
            "Reduce duplicate URLs to improve source breadth."
          ]);
        }
        return result("PASS", 0, "No duplicate source URLs detected.", [], []);
      }
    },
    {
      id: "base.freshness",
      title: "Source freshness",
      description: "Ensure recent sources are included when recency is required.",
      severity: "med",
      defaultParams: { required: false, maxAgeDays: 60, minRecent: 1 },
      appliesTo: () => true,
      evaluate: (context) => {
        const required = Boolean(context.ruleParams.required ?? false);
        const maxAgeDays = Number(context.ruleParams.maxAgeDays ?? 60);
        const minRecent = Number(context.ruleParams.minRecent ?? 1);
        if (!required) {
          return result("PASS", 0, "Recency not required for this site type.", [], []);
        }
        const recentCount = context.metrics.sourceAgesDays.filter((days) => days <= maxAgeDays).length;
        if (recentCount >= minRecent) {
          return result("PASS", 0, `Recent sources: ${recentCount} within ${maxAgeDays} days.`, [], []);
        }
        if (recentCount > 0) {
          return result("WARN", -10, `Recent sources: ${recentCount} within ${maxAgeDays} days.`, [], [
            "Add more recent sources within the required timeframe."
          ]);
        }
        return result("FAIL", -20, `No sources within ${maxAgeDays} days.`, [], [
          "Add recent sources within the required timeframe."
        ]);
      }
    },
    {
      id: "base.citationCompleteness",
      title: "Citation completeness",
      description: "Every summary bullet must include at least one citation with a quote.",
      severity: "high",
      appliesTo: () => true,
      evaluate: (context) => {
        const missing: Evidence[] = [];
        context.summaries.forEach((summary) => {
          summary.bullets.forEach((bullet, index) => {
            if (!bullet.citations || bullet.citations.length === 0) {
              missing.push({ type: "summary", id: summary.id, note: `Bullet ${index + 1} missing citation.` });
              return;
            }
            bullet.citations.forEach((citation) => {
              if (!citation.quote || citation.quote.trim().length === 0) {
                missing.push({ type: "citation", url: citation.url, note: `Empty quote in ${summary.id}.` });
              }
            });
          });
        });
        if (missing.length === 0) {
          return result("PASS", 0, "All bullets have citations with quotes.", [], []);
        }
        return result("FAIL", -25, "Some bullets are missing citations or quotes.", missing, [
          "Ensure every summary bullet includes at least one cited quote."
        ]);
      }
    },
    {
      id: "base.unsupportedClaims",
      title: "Unsupported claim detection",
      description: "Fail when claims appear without citation evidence.",
      severity: "high",
      defaultParams: { failRatio: 0.2, warnRatio: 0.05 },
      appliesTo: () => true,
      evaluate: (context) => {
        const failRatio = Number(context.ruleParams.failRatio ?? 0.2);
        const warnRatio = Number(context.ruleParams.warnRatio ?? 0.05);
        const signals = collectClaimSignals(context);
        if (signals.totalBullets === 0) {
          return result("WARN", -6, "No summary bullets available for claim verification.", [], [
            "Generate summary bullets with citations before gating."
          ]);
        }

        const ratio = signals.unsupportedBullets / signals.totalBullets;
        if (ratio >= failRatio) {
          return result("FAIL", -20, `Unsupported claim ratio: ${(ratio * 100).toFixed(1)}%.`, [], [
            "Add citations to unsupported bullets or remove unsupported claims."
          ]);
        }
        if (ratio >= warnRatio) {
          return result("WARN", -10, `Unsupported claim ratio: ${(ratio * 100).toFixed(1)}%.`, [], [
            "Improve citation coverage for remaining unsupported bullets."
          ]);
        }
        return result("PASS", 0, "Unsupported claim ratio is within limits.", [], []);
      }
    },
    {
      id: "base.excessiveInference",
      title: "Excessive inference without evidence",
      description: "Warn or fail when too many claims are marked inferred.",
      severity: "med",
      defaultParams: { warnRatio: 0.3, failRatio: 0.5 },
      appliesTo: () => true,
      evaluate: (context) => {
        const warnRatio = Number(context.ruleParams.warnRatio ?? 0.3);
        const failRatio = Number(context.ruleParams.failRatio ?? 0.5);
        const signals = collectClaimSignals(context);

        if (signals.totalBullets === 0) {
          return result("WARN", -5, "No claims available to evaluate inference ratio.", [], [
            "Provide structured claims with explicit evidence tags."
          ]);
        }

        const ratio = signals.inferredBullets / signals.totalBullets;
        if (ratio >= failRatio) {
          return result("FAIL", -15, `Inferred-claim ratio too high: ${(ratio * 100).toFixed(1)}%.`, [], [
            "Reduce inferred statements and replace with directly supported claims."
          ]);
        }
        if (ratio >= warnRatio) {
          return result("WARN", -8, `Inferred-claim ratio elevated: ${(ratio * 100).toFixed(1)}%.`, [], [
            "Add direct source evidence for inferred statements."
          ]);
        }
        return result("PASS", 0, "Inference ratio is within acceptable bounds.", [], []);
      }
    },
    {
      id: "base.lowConfidenceClaims",
      title: "Low-confidence section detection",
      description: "Warn when too many bullets are marked low confidence.",
      severity: "low",
      defaultParams: { warnRatio: 0.25 },
      appliesTo: () => true,
      evaluate: (context) => {
        const warnRatio = Number(context.ruleParams.warnRatio ?? 0.25);
        const signals = collectClaimSignals(context);
        if (signals.totalBullets === 0) {
          return result("PASS", 0, "No claim bullets available.", [], []);
        }

        const ratio = signals.lowConfidenceBullets / signals.totalBullets;
        if (ratio >= warnRatio) {
          return result("WARN", -6, `Low-confidence claim ratio: ${(ratio * 100).toFixed(1)}%.`, [], [
            "Collect stronger evidence for low-confidence sections."
          ]);
        }
        return result("PASS", 0, "Low-confidence ratio is within limits.", [], []);
      }
    },
    {
      id: "base.quoteQuality",
      title: "Quote quality",
      description: "Quotes must be concise and meaningful.",
      severity: "med",
      defaultParams: { maxWords: 25, minWords: 3 },
      appliesTo: () => true,
      evaluate: (context) => {
        const maxWords = Number(context.ruleParams.maxWords ?? 25);
        const minWords = Number(context.ruleParams.minWords ?? 3);
        const invalid: Evidence[] = [];
        context.summaries.forEach((summary) => {
          summary.bullets.forEach((bullet) => {
            bullet.citations.forEach((citation) => {
              const count = wordCount(citation.quote || "");
              if (count < minWords || count > maxWords) {
                invalid.push({ type: "citation", url: citation.url, quote: citation.quote });
              }
            });
          });
        });
        if (invalid.length === 0) {
          return result("PASS", 0, "All quotes meet quality thresholds.", [], []);
        }
        const status = invalid.length > 2 ? "FAIL" : "WARN";
        const scoreDelta = invalid.length > 2 ? -15 : -8;
        return result(status, scoreDelta, "Some quotes are too short or too long.", invalid, [
          "Keep quotes between 3 and 25 words and include context."
        ]);
      }
    },
    {
      id: "base.redFlags",
      title: "Red flag sources",
      description: "Detect low-quality or spam sources.",
      severity: "high",
      defaultParams: { warnCount: 1, failCount: 2, thinContentWarn: 2 },
      appliesTo: () => true,
      evaluate: (context) => {
        const warnCount = Number(context.ruleParams.warnCount ?? 1);
        const failCount = Number(context.ruleParams.failCount ?? 2);
        const thinContentWarn = Number(context.ruleParams.thinContentWarn ?? 2);
        const flaggedDomains = context.sources
          .filter((source) => isLowQualityDomain(source.url))
          .map((source) => getDomainFromUrl(source.url));

        const evidence: Evidence[] = flaggedDomains.map((domain) => ({ type: "source", note: domain }));
        if (context.metrics.thinContentCount >= thinContentWarn) {
          evidence.push({ type: "page", note: `Thin content pages: ${context.metrics.thinContentCount}` });
        }

        if (flaggedDomains.length >= failCount) {
          return result("FAIL", -25, "Multiple low-quality sources detected.", evidence, [
            "Remove low-quality sources and replace them with credible references."
          ]);
        }
        if (flaggedDomains.length >= warnCount || context.metrics.thinContentCount >= thinContentWarn) {
          return result("WARN", -10, "Low-quality indicators detected.", evidence, [
            "Reduce low-quality sources and increase content depth."
          ]);
        }
        return result("PASS", 0, "No low-quality indicators detected.", [], []);
      }
    },
    {
      id: "base.thinContent",
      title: "Thin content detection",
      description: "Warn if extracted pages have very low word counts.",
      severity: "low",
      appliesTo: () => true,
      evaluate: (context) => {
        if (context.metrics.thinContentCount === 0) {
          return result("PASS", 0, "No thin content pages detected.", [], []);
        }
        return result("WARN", -5, `Thin content pages: ${context.metrics.thinContentCount}.`, [], [
          "Expand or replace thin pages with more substantial sources."
        ]);
      }
    }
  ];
}
