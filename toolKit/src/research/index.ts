/**
 * Web Research Agent - Main Entry Point
 * Production-quality AI research with OpenAI web_search tool
 */

export { WebResearchAgent } from "./agent";
export { ResearchFileManager } from "./fileManager";
export { MarkdownGenerator } from "./markdown";
export { ResearchCLI, runResearch } from "./cli";
export { 
  ResearchValidator, 
  ResearchValidationError, 
  InsufficientDataError,
  safeResearch,
  formatError 
} from "./validation";

export type {
  ResearchQuery,
  ResearchOutput,
  ResearchSection,
  ResearchSource,
  WebSearchResult,
  OpenAIWebSearchConfig,
  WebSearchToolCall,
  ResearchAgentOptions
} from "./types";

export { DEFAULT_RESEARCH_OPTIONS } from "./types";
