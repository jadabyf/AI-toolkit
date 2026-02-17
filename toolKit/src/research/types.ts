/**
 * Web Research Agent Types
 * Production-quality types for AI-powered web research
 */

export interface ResearchQuery {
  topic: string;
  context?: string;
  maxResults?: number;
  includeRecentOnly?: boolean;
  outputFormat?: "markdown" | "json";
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  domain?: string;
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet: string;
  relevance: "high" | "medium" | "low";
  publishedDate?: string;
  accessedAt: string;
}

export interface ResearchSection {
  heading: string;
  content: string;
  sources: ResearchSource[];
  confidence: "high" | "medium" | "low" | "insufficient";
}

export interface ResearchOutput {
  id: string;
  query: string;
  timestamp: string;
  summary: string;
  sections: ResearchSection[];
  allSources: ResearchSource[];
  metadata: {
    totalSources: number;
    searchesPerformed: number;
    confidenceLevel: "high" | "medium" | "low" | "insufficient";
    limitations?: string[];
  };
}

export interface OpenAIWebSearchConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  enableWebSearch: boolean;
}

export interface WebSearchToolCall {
  id: string;
  type: "web_search";
  query: string;
  results?: WebSearchResult[];
  status: "pending" | "completed" | "failed";
  error?: string;
}

export interface ResearchAgentOptions {
  allowHallucination: boolean; // Should always be false
  requireSources: boolean; // Should always be true
  minSourcesRequired: number;
  outputDirectory: string;
  verboseLogging: boolean;
}

export const DEFAULT_RESEARCH_OPTIONS: ResearchAgentOptions = {
  allowHallucination: false,
  requireSources: true,
  minSourcesRequired: 1,
  outputDirectory: "docs/research",
  verboseLogging: false
};
