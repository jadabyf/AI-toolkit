import fs from "fs";
import path from "path";
import { test, expect } from "vitest";
import { computeMetrics } from "../src/quality/metrics";
import { IndexFile, Page, Source, Summary } from "../src/quality/types";

const fixtureDir = path.join(__dirname, "fixtures", "newsletter");

function loadJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), "utf-8")) as T;
}

test("computeMetrics returns expected counts", () => {
  const index = loadJson<IndexFile>("index.json");
  const sources = loadJson<Source[]>("sources.json");
  const pages = loadJson<Page[]>("pages.json");
  const summaries = loadJson<Summary[]>("summaries.json");
  const now = new Date(index.createdAt || new Date().toISOString());

  const metrics = computeMetrics({ index, sources, pages, summaries, now });

  expect(metrics.sourceCount).toBe(3);
  expect(metrics.credibleSourceCount).toBe(3);
  expect(metrics.domainDiversity).toBe(3);
  expect(metrics.recentSources30).toBe(3);
  expect(metrics.citationCoverageRatio).toBe(1);
  expect(metrics.thinContentCount).toBe(2);
});
