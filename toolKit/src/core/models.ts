import { GateReport, SiteType } from "../quality/types";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ResearchQuery {
  text: string;
  siteType: SiteType;
  requestedAt: string;
  maxResults?: number;
  includeRecentOnly?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  score?: number;
  provider: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  url: string;
  domain: string;
  retrievedAt: string;
  publishedAt?: string;
  extractedText: string;
  wordCount: number;
  domainClass: "primary" | "secondary" | "lowQuality";
}

export interface EvidenceSnippet {
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string;
  domain: string;
  retrievalTimestamp: string;
  quote: string;
  directSupport: boolean;
}

export interface Citation {
  sourceId: string;
  url: string;
  quote: string;
}

export interface ResearchClaim {
  id: string;
  statement: string;
  confidence: ConfidenceLevel;
  inferred: boolean;
  citations: Citation[];
}

export interface GateResult {
  status: "PASS" | "WARN" | "FAIL";
  score: number;
  report: GateReport;
}

export interface ResearchReport {
  runId: string;
  generatedAt: string;
  question: string;
  siteType: SiteType;
  providerSummary: {
    searchProvider: string;
    llmProvider: string;
  };
  summary: string;
  keyFindings: string[];
  claims: ResearchClaim[];
  limitations: string[];
  nextSteps: string[];
}

export interface ResearchRun {
  runId: string;
  startedAt: string;
  completedAt: string;
  query: ResearchQuery;
  rawSearchResults: SearchResult[];
  sources: SourceDocument[];
  claims: ResearchClaim[];
  gate: GateResult;
  report: ResearchReport;
}
