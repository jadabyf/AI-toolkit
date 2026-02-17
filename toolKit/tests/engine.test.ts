import path from "path";
import { test, expect } from "vitest";
import { runGateEngine } from "../src/quality/engine";

test("runGateEngine passes newsletter fixture", () => {
  const inputDir = path.join(__dirname, "fixtures", "newsletter");
  const report = runGateEngine({ inputDir });

  expect(report.siteType).toBe("newsletter");
  expect(report.overallStatus).toBe("PASS");
  const ruleIds = report.ruleResults.map((rule) => rule.id);
  expect(ruleIds).toContain("newsletter.recency30");
  expect(ruleIds).toContain("base.minSources");
});
