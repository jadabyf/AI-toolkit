import { describe, expect, test } from "vitest";
import { createSearchProvider } from "../src/providers/search/factory";
import { createLlmProvider } from "../src/providers/llm/factory";

describe("provider selection", () => {
  test("creates mock search provider", () => {
    const provider = createSearchProvider({ provider: "mock" });
    expect(provider.name).toBe("mock");
  });

  test("requires tavily key when configured", () => {
    expect(() => createSearchProvider({ provider: "tavily" })).toThrow(/TAVILY_API_KEY/);
  });

  test("creates heuristic llm provider", () => {
    const provider = createLlmProvider({ provider: "heuristic" });
    expect(provider.name).toBe("heuristic");
  });

  test("requires openai key when configured", () => {
    expect(() => createLlmProvider({ provider: "openai" })).toThrow(/OPENAI_API_KEY/);
  });
});
