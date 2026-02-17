export type SiteType =
  | "newsletter"
  | "ecommerce"
  | "portfolio"
  | "saasLanding"
  | "blog"
  | "edtech"
  | "fintech"
  | "general";

export type RuleSeverity = "low" | "med" | "high";
export type RuleStatus = "PASS" | "WARN" | "FAIL";

export interface IndexFile {
  siteType?: SiteType;
  designStyle?: string; // Design style (swiss, minimalism, etc.)
  createdAt?: string;
  settings?: Record<string, unknown>;
}

export interface Source {
  id: string;
  url: string;
  title?: string;
  fetchedAt?: string;
  domain?: string;
}

export interface Page {
  id: string;
  url: string;
  title?: string;
  extractedText: string;
  extractedAt?: string;
  wordCount?: number;
}

export interface Citation {
  url: string;
  quote: string;
}

export interface SummaryBullet {
  text: string;
  citations: Citation[];
  tags?: string[];
}

export interface SummaryFields {
  whatHappened?: string;
  whyItMatters?: string;
  whatsNext?: string;
}

export interface Summary {
  id: string;
  pageId?: string;
  title?: string;
  bullets: SummaryBullet[];
  fields?: SummaryFields;
}

export type DomainClass = "primary" | "secondary" | "lowQuality";

export interface DomainStats {
  uniqueDomains: string[];
  domainClassifications: Record<string, DomainClass>;
  primaryDomains: string[];
  secondaryDomains: string[];
  lowQualityDomains: string[];
}

export interface Metrics {
  sourceCount: number;
  credibleSourceCount: number;
  domainDiversity: number;
  sourceAgesDays: number[];
  recentSources7: number;
  recentSources30: number;
  recentSources60: number;
  extractedWordCounts: number[];
  summaryWordCount: number;
  citationCoverageRatio: number;
  marketingScore: number;
  thinContentCount: number;
  priceMentioned: boolean;
  priceSourceRecent: boolean;
  longFormSourcesCount: number;
  mediumSourcesCount: number;
}

export interface Evidence {
  type: "source" | "page" | "citation" | "summary";
  id?: string;
  url?: string;
  quote?: string;
  note?: string;
}

export interface RuleResult {
  status: RuleStatus;
  scoreDelta: number;
  evidence: Evidence[];
  explanation: string;
  remediation: string[];
}

export interface RuleContext {
  siteType: SiteType;
  sources: Source[];
  pages: Page[];
  summaries: Summary[];
  index: IndexFile;
  metrics: Metrics;
  domainStats: DomainStats;
  now: Date;
  ruleParams: Record<string, unknown>;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  defaultParams?: Record<string, unknown>;
  appliesTo: (siteType: SiteType) => boolean;
  evaluate: (context: RuleContext) => RuleResult;
}

export interface RuleReport {
  id: string;
  title: string;
  status: RuleStatus;
  severity: RuleSeverity;
  scoreDelta: number;
  evidence: Evidence[];
  explanation: string;
  remediation: string[];
}

export interface Thresholds {
  passScore: number;
  warnScore: number;
}

export interface GateReport {
  siteType: SiteType;
  overallStatus: RuleStatus;
  overallScore: number;
  thresholds: Thresholds;
  ruleResults: RuleReport[];
  remediation: string[];
  metricsSummary: {
    sourceCount: number;
    credibleSourceCount: number;
    domainDiversity: number;
    citationCoverageRatio: number;
    marketingScore: number;
    thinContentCount: number;
    recentSources7: number;
    recentSources30: number;
    recentSources60: number;
  };
  complianceChecklist?: string[];
}
