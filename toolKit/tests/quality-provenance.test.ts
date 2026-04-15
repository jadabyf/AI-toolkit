import path from "path";
import { describe, expect, test } from "vitest";
import { runGateEngine } from "../src/quality/engine";

describe("provenance-aware quality gates", () => {
  const inputDir = path.join(__dirname, "fixtures", "gates-edge");

  test("flags unsupported claims and duplicate sources", () => {
    const report = runGateEngine({ inputDir });
    const byId = new Map(report.ruleResults.map((rule) => [rule.id, rule]));

    expect(byId.get("base.unsupportedClaims")?.status).toMatch(/WARN|FAIL/);
    expect(byId.get("base.duplicateSources")?.status).toMatch(/WARN|FAIL/);
    expect(byId.get("base.excessiveInference")?.status).toMatch(/WARN|FAIL/);
  });

  test("applies scoring thresholds", () => {
    const report = runGateEngine({ inputDir });
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(["PASS", "WARN", "FAIL"]).toContain(report.overallStatus);
  });
});
