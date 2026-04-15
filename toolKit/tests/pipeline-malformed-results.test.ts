import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { runResearchPipeline } from "../src/research/pipeline/runPipeline";
import { SearchProvider } from "../src/providers/search/types";
import { HeuristicLlmProvider } from "../src/providers/llm/heuristicLlmProvider";
import { ResearchQuery, SearchResult } from "../src/core/models";

class MalformedSearchProvider implements SearchProvider {
  readonly name = "malformed";

  async search(_query: ResearchQuery): Promise<SearchResult[]> {
    return [
      {
        id: "bad-1",
        title: "Bad URL source",
        url: "not-a-valid-url",
        snippet: "fallback snippet content used when fetch fails",
        provider: this.name
      },
      {
        id: "bad-2",
        title: "Good URL source",
        url: "https://example.com",
        snippet: "example snippet",
        provider: this.name
      }
    ];
  }
}

describe("pipeline malformed search results", () => {
  test("completes run with malformed urls using fallback snippet", async () => {
    const runsDir = path.join(__dirname, ".tmp-pipeline-runs");
    fs.rmSync(runsDir, { recursive: true, force: true });

    const result = await runResearchPipeline({
      query: "malformed test",
      siteType: "general",
      maxResults: 2,
      outDir: runsDir,
      searchProvider: new MalformedSearchProvider(),
      llmProvider: new HeuristicLlmProvider()
    });

    expect(result.run.runId.length).toBeGreaterThan(0);
    expect(result.run.rawSearchResults.length).toBe(2);
    expect(result.run.gate.report.ruleResults.length).toBeGreaterThan(0);

    fs.rmSync(runsDir, { recursive: true, force: true });
  });
});
