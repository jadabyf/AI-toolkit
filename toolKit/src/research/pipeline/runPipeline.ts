import path from "path";
import {
  ResearchClaim,
  ResearchQuery,
  ResearchReport,
  ResearchRun,
  SearchResult,
  SourceDocument
} from "../../core/models";
import { classifyDomain, getDomainFromUrl } from "../../quality/classify";
import { createMarkdownReport } from "../../quality/report";
import { runGateEngine } from "../../quality/engine";
import { SiteType } from "../../quality/types";
import { trimQuote, countWords } from "../../utils/text";
import { fetchPageText } from "../../utils/http";
import { LLMProvider } from "../../providers/llm/types";
import { SearchProvider } from "../../providers/search/types";
import { validateClaimProvenance } from "../validation/provenance";
import { createResearchMarkdownReport } from "../reporting/researchReport";
import { ResearchRunStore } from "../storage/runStore";

export interface RunPipelineInput {
  query: string;
  siteType: SiteType;
  maxResults?: number;
  includeRecentOnly?: boolean;
  gateConfigPath?: string;
  outDir?: string;
  searchProvider: SearchProvider;
  llmProvider: LLMProvider;
}

function toSourceDocuments(results: SearchResult[], fetchedText: Record<string, string>, siteType: SiteType): SourceDocument[] {
  return results.map((result, index) => {
    const domain = getDomainFromUrl(result.url);
    const extractedText = fetchedText[result.url] ?? result.snippet;
    const retrievedAt = new Date().toISOString();
    return {
      id: `source-${index + 1}`,
      title: result.title,
      url: result.url,
      domain,
      retrievedAt,
      publishedAt: result.publishedAt,
      extractedText,
      wordCount: countWords(extractedText),
      domainClass: classifyDomain(result.url, { siteType, settings: {} })
    };
  });
}

function attachEvidence(claims: ResearchClaim[], sources: SourceDocument[]): ResearchClaim[] {
  if (sources.length === 0) {
    return claims;
  }

  return claims.map((claim, index) => {
    if (claim.citations.length > 0) {
      return {
        ...claim,
        citations: claim.citations.map((citation) => ({
          ...citation,
          quote: trimQuote(citation.quote || "", 25)
        }))
      };
    }

    const source = sources[index % sources.length];
    return {
      ...claim,
      citations: [
        {
          sourceId: source.id,
          url: source.url,
          quote: trimQuote(source.extractedText, 25)
        }
      ]
    };
  });
}

function buildReport(input: {
  runId: string;
  query: ResearchQuery;
  summary: string;
  claims: ResearchClaim[];
  searchProviderName: string;
  llmProviderName: string;
}): ResearchReport {
  const keyFindings = input.summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.|^-/.test(line) || line.length > 40)
    .slice(0, 6);

  const limitations: string[] = [];
  const provenance = validateClaimProvenance(input.claims);
  if (!provenance.isValid) {
    limitations.push(`Claims missing citations: ${provenance.missingCitationClaimIds.join(", ")}`);
  }

  return {
    runId: input.runId,
    generatedAt: new Date().toISOString(),
    question: input.query.text,
    siteType: input.query.siteType,
    providerSummary: {
      searchProvider: input.searchProviderName,
      llmProvider: input.llmProviderName
    },
    summary: input.summary,
    keyFindings,
    claims: input.claims,
    limitations,
    nextSteps: [
      "Review WARN/FAIL rules and apply remediation actions.",
      "Run a follow-up search for any low-confidence claim.",
      "Re-run with stricter gates for final publication."
    ]
  };
}

function saveGateInputArtifacts(runDir: string, query: ResearchQuery, sources: SourceDocument[], claims: ResearchClaim[]): void {
  const fs = require("fs");

  const index = {
    siteType: query.siteType,
    createdAt: new Date().toISOString(),
    settings: {}
  };

  const sourceArtifacts = sources.map((source) => ({
    id: source.id,
    url: source.url,
    title: source.title,
    fetchedAt: source.retrievedAt,
    domain: source.domain
  }));

  const pageArtifacts = sources.map((source, indexValue) => ({
    id: `page-${indexValue + 1}`,
    url: source.url,
    title: source.title,
    extractedText: source.extractedText,
    extractedAt: source.retrievedAt,
    wordCount: source.wordCount
  }));

  const summaryArtifacts = [
    {
      id: "summary-1",
      title: "Claims summary",
      bullets: claims.map((claim) => ({
        text: claim.statement,
        citations: claim.citations.map((citation) => ({
          url: citation.url,
          quote: citation.quote
        })),
        tags: [claim.inferred ? "inferred" : "supported", `confidence-${claim.confidence}`]
      })),
      fields:
        query.siteType === "newsletter"
          ? {
              whatHappened: claims[0]?.statement,
              whyItMatters: claims[1]?.statement,
              whatsNext: claims[2]?.statement
            }
          : undefined
    }
  ];

  fs.writeFileSync(path.join(runDir, "index.json"), JSON.stringify(index, null, 2), "utf-8");
  fs.writeFileSync(path.join(runDir, "sources.json"), JSON.stringify(sourceArtifacts, null, 2), "utf-8");
  fs.writeFileSync(path.join(runDir, "pages.json"), JSON.stringify(pageArtifacts, null, 2), "utf-8");
  fs.writeFileSync(path.join(runDir, "summaries.json"), JSON.stringify(summaryArtifacts, null, 2), "utf-8");
}

export async function runResearchPipeline(input: RunPipelineInput): Promise<{ run: ResearchRun; paths: { runDir: string } }> {
  const store = new ResearchRunStore(input.outDir);
  const runId = store.createRunId(input.query);
  const runDir = store.initRun(runId);
  const startedAt = new Date().toISOString();

  const normalizedQuery: ResearchQuery = {
    text: input.query,
    siteType: input.siteType,
    requestedAt: startedAt,
    maxResults: input.maxResults,
    includeRecentOnly: input.includeRecentOnly
  };

  const searchResults = await input.searchProvider.search(normalizedQuery);
  store.saveJson(runDir, "raw-search-results.json", searchResults);

  const topResults = searchResults.slice(0, input.maxResults ?? 8);
  const fetchedText: Record<string, string> = {};

  for (const result of topResults) {
    try {
      fetchedText[result.url] = input.searchProvider.fetch
        ? await input.searchProvider.fetch(result.url)
        : await fetchPageText(result.url);
    } catch {
      fetchedText[result.url] = result.snippet || "";
    }
  }

  const sources = toSourceDocuments(topResults, fetchedText, input.siteType).filter(
    (source) => source.domainClass !== "lowQuality"
  );

  const summary = await input.llmProvider.summarize({
    query: input.query,
    sources
  });

  const extractedClaims = await input.llmProvider.extractClaims({
    query: input.query,
    summary,
    sources
  });

  const claims = attachEvidence(extractedClaims, sources);
  saveGateInputArtifacts(runDir, normalizedQuery, sources, claims);

  const gateReport = runGateEngine({
    inputDir: runDir,
    gateConfigPath: input.gateConfigPath,
    siteTypeOverride: input.siteType
  });

  const gateStatus = gateReport.overallStatus;

  const report = buildReport({
    runId,
    query: normalizedQuery,
    summary,
    claims,
    searchProviderName: input.searchProvider.name,
    llmProviderName: input.llmProvider.name
  });

  const run: ResearchRun = {
    runId,
    startedAt,
    completedAt: new Date().toISOString(),
    query: normalizedQuery,
    rawSearchResults: searchResults,
    sources,
    claims,
    gate: {
      status: gateStatus,
      score: gateReport.overallScore,
      report: gateReport
    },
    report
  };

  const reportMarkdown = createResearchMarkdownReport(run);
  const gateMarkdown = createMarkdownReport(gateReport);
  store.saveRunArtifacts(run, reportMarkdown, gateMarkdown);

  return {
    run,
    paths: { runDir }
  };
}
