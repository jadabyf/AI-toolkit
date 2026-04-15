import dotenv from "dotenv";
import { z } from "zod";

export type AiProvider = "openai" | "gemini" | "none";

export interface AiEnvConfig {
  provider: AiProvider;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiModel: string;
  geminiApiKey?: string;
  geminiModel: string;
  searchProvider?: "mock" | "tavily" | "serpapi" | "brave";
  llmProvider?: "heuristic" | "openai";
}

dotenv.config();

const envSchema = z.object({
  AI_PROVIDER: z.enum(["openai", "gemini", "auto"]).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SEARCH_PROVIDER: z.enum(["mock", "tavily", "serpapi", "brave"]).optional(),
  LLM_PROVIDER: z.enum(["heuristic", "openai"]).optional()
});

const defaultOpenAiModel = "gpt-4o-mini";
const defaultGeminiModel = "gemini-1.5-flash";

export function getAiEnvConfig(): AiEnvConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  const env = parsed.data;
  const providerSetting = env.AI_PROVIDER ?? "auto";
  const openaiKey = env.OPENAI_API_KEY;
  const geminiKey = env.GEMINI_API_KEY;

  let provider: AiProvider = "none";
  if (providerSetting === "openai") {
    provider = openaiKey ? "openai" : "none";
  } else if (providerSetting === "gemini") {
    provider = geminiKey ? "gemini" : "none";
  } else {
    if (openaiKey) {
      provider = "openai";
    } else if (geminiKey) {
      provider = "gemini";
    }
  }

  return {
    provider,
    openaiApiKey: openaiKey,
    openaiBaseUrl: env.OPENAI_BASE_URL,
    openaiModel: env.OPENAI_MODEL ?? defaultOpenAiModel,
    geminiApiKey: geminiKey,
    geminiModel: defaultGeminiModel,
    searchProvider: env.SEARCH_PROVIDER,
    llmProvider: env.LLM_PROVIDER
  };
}

export function logAiProviderWarning(config: AiEnvConfig): void {
  if (config.provider === "none") {
    process.stderr.write(
      "Warning: No AI provider configured. Using fallback summarization. Set AI_PROVIDER and API key env vars.\n"
    );
  }
}
