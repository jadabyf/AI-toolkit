import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { ResearchRunStore } from "../src/research/storage/runStore";
import { GateReport } from "../src/quality/types";
import { ResearchRun } from "../src/core/models";

function buildGateReport(): GateReport {
  return {
    siteType: "general",
    overallStatus: "PASS",
    overallScore: 90,
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
  };
}

describe("run storage", () => {
  test("persists and loads run artifacts", () => {
    const tempBase = path.join(__dirname, ".tmp-runs");
    fs.rmSync(tempBase, { recursive: true, force: true });

    const store = new ResearchRunStore(tempBase);
    const runId = store.createRunId("storage test", new Date("2026-04-14T10:00:00.000Z"));
    const run: ResearchRun = {
      runId,
      startedAt: "2026-04-14T10:00:00.000Z",
      completedAt: "2026-04-14T10:02:00.000Z",
      query: {
        text: "storage test",
        siteType: "general",
        requestedAt: "2026-04-14T10:00:00.000Z"
      },
      rawSearchResults: [],
      sources: [],
      claims: [],
      gate: {
        status: "PASS",
        score: 90,
        report: buildGateReport()
      },
      report: {
        runId,
        generatedAt: "2026-04-14T10:02:00.000Z",
        question: "storage test",
        siteType: "general",
        providerSummary: { searchProvider: "mock", llmProvider: "heuristic" },
        summary: "ok",
        keyFindings: ["one"],
        claims: [],
        limitations: [],
        nextSteps: []
      }
    };

    const paths = store.saveRunArtifacts(run, "# report", "# gate");
    expect(fs.existsSync(paths.runJson)).toBe(true);
    expect(fs.existsSync(paths.reportMd)).toBe(true);
    expect(fs.existsSync(paths.gateMd)).toBe(true);

    const loaded = store.loadRun(runId);
    expect(loaded.runId).toBe(runId);

    fs.rmSync(tempBase, { recursive: true, force: true });
  });
});
