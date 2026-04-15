import { HeuristicLlmProvider } from "./heuristicLlmProvider";
import { OpenAiLlmProvider } from "./openAiLlmProvider";
import { LLMProvider } from "./types";

export type LlmProviderName = "heuristic" | "openai";

export interface LlmProviderConfig {
  provider: LlmProviderName;
  openAiApiKey?: string;
  openAiModel?: string;
}

export function createLlmProvider(config: LlmProviderConfig): LLMProvider {
  if (config.provider === "openai") {
    if (!config.openAiApiKey) {
      throw new Error("OPENAI_API_KEY is required for openai llm provider.");
    }
    return new OpenAiLlmProvider(config.openAiApiKey, config.openAiModel ?? "gpt-4o-mini");
  }
  return new HeuristicLlmProvider();
}
