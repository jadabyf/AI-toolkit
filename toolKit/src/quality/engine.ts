import fs from "fs";
import path from "path";
import { classifyDomain, getDomainFromUrl } from "./classify";
import { computeMetrics } from "./metrics";
import { resolveRuleConfig, resolveThresholds, loadGateConfig } from "./schema";
import { getBaseRules } from "./rules/base";
import { getBlogRules } from "./rules/blog";
import { getEcommerceRules } from "./rules/ecommerce";
import { getNewsletterRules } from "./rules/newsletter";
import { getPortfolioRules } from "./rules/portfolio";
import { getSaasLandingRules } from "./rules/saasLanding";
import { getDesignStyleRules } from "./rules/designStyle";
import {
  DomainStats,
  GateReport,
  IndexFile,
  Page,
  Rule,
  RuleReport,
  SiteType,
  Source,
  Summary,
  Thresholds
} from "./types";

const DEFAULT_THRESHOLDS: Record<SiteType, Thresholds> = {
  general: { passScore: 80, warnScore: 60 },
  newsletter: { passScore: 82, warnScore: 62 },
  ecommerce: { passScore: 80, warnScore: 60 },
  portfolio: { passScore: 78, warnScore: 58 },
  saasLanding: { passScore: 80, warnScore: 60 },
  blog: { passScore: 78, warnScore: 58 },
  edtech: { passScore: 82, warnScore: 62 },
  fintech: { passScore: 84, warnScore: 64 }
};

const COMPLIANCE_CHECKLIST = [
  "Document data privacy obligations (FERPA, COPPA, GDPR as applicable).",
  "Identify required security controls (MFA, encryption at rest/in transit).",
  "Clarify regulatory oversight for claims and disclosures.",
  "Confirm accessibility and auditability requirements."
];

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadResearchData(inputDir: string): {
  index: IndexFile;
  sources: Source[];
  pages: Page[];
  summaries: Summary[];
} {
  const index = readJsonFile<IndexFile>(path.join(inputDir, "index.json"), {});
  const sources = readJsonFile<Source[]>(path.join(inputDir, "sources.json"), []);
  const pages = readJsonFile<Page[]>(path.join(inputDir, "pages.json"), []);
  const summaries = readJsonFile<Summary[]>(path.join(inputDir, "summaries.json"), []);

  return { index, sources, pages, summaries };
}

function getDomainStats(sources: Source[], index: IndexFile): DomainStats {
  const domainClassifications: Record<string, DomainStats["domainClassifications"][string]> = {};
  sources.forEach((source) => {
    const domain = source.domain || getDomainFromUrl(source.url);
    if (!domain) {
      return;
    }
    if (!domainClassifications[domain]) {
      domainClassifications[domain] = classifyDomain(source.url, index);
    }
  });
  const uniqueDomains = Object.keys(domainClassifications);
  const primaryDomains = uniqueDomains.filter((domain) => domainClassifications[domain] === "primary");
  const secondaryDomains = uniqueDomains.filter((domain) => domainClassifications[domain] === "secondary");
  const lowQualityDomains = uniqueDomains.filter((domain) => domainClassifications[domain] === "lowQuality");

  return { uniqueDomains, domainClassifications, primaryDomains, secondaryDomains, lowQualityDomains };
}

function getSiteRules(siteType: SiteType): Rule[] {
  switch (siteType) {
    case "newsletter":
      return getNewsletterRules();
    case "ecommerce":
      return getEcommerceRules();
    case "portfolio":
      return getPortfolioRules();
    case "saasLanding":
      return getSaasLandingRules();
    case "blog":
      return getBlogRules();
    default:
      return [];
  }
}

export function runGateEngine(options: {
  inputDir: string;
  gateConfigPath?: string;
  siteTypeOverride?: SiteType;
}): GateReport {
  const { inputDir, gateConfigPath, siteTypeOverride } = options;
  const data = loadResearchData(inputDir);
  const siteType = siteTypeOverride ?? data.index.siteType ?? "general";
  const now = data.index.createdAt ? new Date(data.index.createdAt) : new Date();
  const metrics = computeMetrics({
    index: data.index,
    sources: data.sources,
    pages: data.pages,
    summaries: data.summaries,
    now
  });
  const domainStats = getDomainStats(data.sources, data.index);
  const config = loadGateConfig(gateConfigPath);
  const thresholds = resolveThresholds(siteType, config, DEFAULT_THRESHOLDS[siteType]);

  const rules = [...getBaseRules(), ...getSiteRules(siteType), ...getDesignStyleRules()];
  const ruleResults: RuleReport[] = [];
  let overallScore = 100;

  rules.forEach((rule) => {
    if (!rule.appliesTo(siteType)) {
      return;
    }
    const { enabled, params } = resolveRuleConfig(rule.id, siteType, config, rule.defaultParams);
    if (!enabled) {
      return;
    }
    const result = rule.evaluate({
      siteType,
      sources: data.sources,
      pages: data.pages,
      summaries: data.summaries,
      index: data.index,
      metrics,
      domainStats,
      now,
      ruleParams: params
    });
    overallScore = Math.max(0, Math.min(100, overallScore + result.scoreDelta));
    ruleResults.push({
      id: rule.id,
      title: rule.title,
      status: result.status,
      severity: rule.severity,
      scoreDelta: result.scoreDelta,
      evidence: result.evidence,
      explanation: result.explanation,
      remediation: result.remediation
    });
  });

  let overallStatus: GateReport["overallStatus"] = "FAIL";
  if (overallScore >= thresholds.passScore) {
    overallStatus = "PASS";
  } else if (overallScore >= thresholds.warnScore) {
    overallStatus = "WARN";
  }

  const remediation = Array.from(
    new Set(
      ruleResults
        .filter((rule) => rule.status !== "PASS")
        .flatMap((rule) => rule.remediation)
    )
  );

  const report: GateReport = {
    siteType,
    overallStatus,
    overallScore,
    thresholds,
    ruleResults,
    remediation,
    metricsSummary: {
      sourceCount: metrics.sourceCount,
      credibleSourceCount: metrics.credibleSourceCount,
      domainDiversity: metrics.domainDiversity,
      citationCoverageRatio: metrics.citationCoverageRatio,
      marketingScore: metrics.marketingScore,
      thinContentCount: metrics.thinContentCount,
      recentSources7: metrics.recentSources7,
      recentSources30: metrics.recentSources30,
      recentSources60: metrics.recentSources60
    },
    complianceChecklist:
      siteType === "fintech" || siteType === "edtech" ? COMPLIANCE_CHECKLIST : undefined
  };

  return report;
}
