import { describe, expect, test } from "vitest";
import { createResearchMarkdownReport } from "../src/research/reporting/researchReport";
import { ResearchRun } from "../src/core/models";

describe("report generation", () => {
  test("creates professional markdown with required sections", () => {
    const run: ResearchRun = {
      runId: "run-1",
      startedAt: "2026-04-14T00:00:00.000Z",
      completedAt: "2026-04-14T00:01:00.000Z",
      query: { text: "test query", siteType: "blog", requestedAt: "2026-04-14T00:00:00.000Z" },
      rawSearchResults: [],
      sources: [
        {
          id: "source-1",
          title: "Example",
          url: "https://example.com",
          domain: "example.com",
          retrievedAt: "2026-04-14T00:00:20.000Z",
          extractedText: "example source text",
          wordCount: 300,
          domainClass: "primary"
        }
      ],
      claims: [
        {
          id: "claim-1",
          statement: "A cited claim",
          confidence: "high",
          inferred: false,
          citations: [{ sourceId: "source-1", url: "https://example.com", quote: "example quote" }]
        }
      ],
      gate: {
        status: "PASS",
        score: 88,
        report: {
          siteType: "blog",
          overallStatus: "PASS",
          overallScore: 88,
          thresholds: { passScore: 80, warnScore: 60 },
          ruleResults: [],
          remediation: [],
          metricsSummary: {
            sourceCount: 1,
            credibleSourceCount: 1,
            domainDiversity: 1,
            citationCoverageRatio: 1,
            marketingScore: 0,
            thinContentCount: 0,
            recentSources7: 1,
            recentSources30: 1,
            recentSources60: 1
          }
        }
      },
      report: {
        runId: "run-1",
        generatedAt: "2026-04-14T00:01:00.000Z",
        question: "test query",
        siteType: "blog",
        providerSummary: { searchProvider: "mock", llmProvider: "heuristic" },
        summary: "summary",
        keyFindings: ["finding"],
        claims: [],
        limitations: [],
        nextSteps: ["next"]
      }
    };

    const markdown = createResearchMarkdownReport(run);
    expect(markdown).toContain("# Research Report");
    expect(markdown).toContain("## Source Summary");
    expect(markdown).toContain("## Claims With Citations");
    expect(markdown).toContain("## Quality Gate Summary");
  });
});
