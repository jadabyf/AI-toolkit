import { test, expect } from "vitest";
import { resolveRuleConfig, resolveThresholds } from "../src/quality/schema";
import { Thresholds } from "../src/quality/types";

const defaults: Thresholds = { passScore: 80, warnScore: 60 };

test("resolveThresholds applies site overrides", () => {
  const config = {
    defaults: { thresholds: { passScore: 80, warnScore: 60 } },
    siteTypes: {
      newsletter: { thresholds: { passScore: 90, warnScore: 70 } }
    }
  };

  const thresholds = resolveThresholds("newsletter", config, defaults);
  expect(thresholds.passScore).toBe(90);
  expect(thresholds.warnScore).toBe(70);
});

test("resolveRuleConfig applies enable and params", () => {
  const config = {
    defaults: {
      rules: {
        "base.minSources": { enabled: false, params: { min: 5 } }
      }
    }
  };

  const resolved = resolveRuleConfig("base.minSources", "general", config, { min: 3 });
  expect(resolved.enabled).toBe(false);
  expect(resolved.params.min).toBe(5);
});
