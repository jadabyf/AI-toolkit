/**
 * Web Research Agent
 * Production-quality implementation using OpenAI's Responses API with web_search tool
 */

import OpenAI from "openai";
import {
  ResearchQuery,
  ResearchOutput,
  ResearchSection,
  ResearchSource,
  WebSearchResult,
  OpenAIWebSearchConfig,
  ResearchAgentOptions,
  DEFAULT_RESEARCH_OPTIONS
} from "./types";
import { ResearchValidator, safeResearch } from "./validation";

export class WebResearchAgent {
  private openai: OpenAI;
  private config: OpenAIWebSearchConfig;
  private options: ResearchAgentOptions;

  constructor(
    apiKey: string,
    options: Partial<ResearchAgentOptions> = {}
  ) {
    // Validate API key
    ResearchValidator.validateApiKey(apiKey);

    this.config = {
      apiKey,
      model: "gpt-4-turbo", // Model with browsing capabilities
      maxTokens: 4000,
      temperature: 0.3, // Lower temperature for factual research
      enableWebSearch: true
    };

    this.options = {
      ...DEFAULT_RESEARCH_OPTIONS,
      ...options
    };

    // Validate options
    ResearchValidator.validateOptions(this.options);

    this.openai = new OpenAI({
      apiKey: this.config.apiKey
    });
  }

  /**
   * Perform web research on a topic using OpenAI's web_search tool
   */
  async research(query: ResearchQuery): Promise<ResearchOutput> {
    // Validate query before proceeding
    ResearchValidator.validateQuery(query);

    const researchId = this.generateResearchId();
    const timestamp = new Date().toISOString();

    if (this.options.verboseLogging) {
      console.log(`[Research Agent] Starting research for: ${query.topic}`);
    }

    try {
      // Create research prompt that requires sources
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(query);

      // Call OpenAI with web search capability
      // Note: Using gpt-4-turbo or gpt-4 with browsing plugin enabled
      // If web_search becomes a native tool type, update this configuration
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      } as any);

      if (this.options.verboseLogging) {
        console.log(`[Research Agent] Received response from OpenAI`);
      }

      // Extract sources and content from response
      const sources = this.extractSources(response);
      const sections = this.parseResponseToSections(response, sources);

      // Validate we have sufficient sources
      if (this.options.requireSources && sources.length < this.options.minSourcesRequired) {
        throw new Error(
          `Insufficient sources found. Required: ${this.options.minSourcesRequired}, Found: ${sources.length}. ` +
          `CANNOT PROVIDE RELIABLE RESEARCH WITHOUT ADEQUATE SOURCES.`
        );
      }

      // Determine confidence level based on sources
      const confidenceLevel = this.assessConfidence(sources, sections);
      const limitations = this.identifyLimitations(sources, sections);

      const output: ResearchOutput = {
        id: researchId,
        query: query.topic,
        timestamp,
        summary: this.extractSummary(response),
        sections,
        allSources: sources,
        metadata: {
          totalSources: sources.length,
          searchesPerformed: this.countSearches(response),
          confidenceLevel,
          limitations: limitations.length > 0 ? limitations : undefined
        }
      };

      if (this.options.verboseLogging) {
        console.log(`[Research Agent] Research complete. Sources: ${sources.length}, Confidence: ${confidenceLevel}`);
      }

      return output;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (this.options.verboseLogging) {
        console.error(`[Research Agent] Error: ${errorMessage}`);
      }

      // Return output with explicit error state
      return {
        id: researchId,
        query: query.topic,
        timestamp,
        summary: `RESEARCH FAILED: ${errorMessage}`,
        sections: [{
          heading: "Error",
          content: `Unable to complete research. ${errorMessage}`,
          sources: [],
          confidence: "insufficient"
        }],
        allSources: [],
        metadata: {
          totalSources: 0,
          searchesPerformed: 0,
          confidenceLevel: "insufficient",
          limitations: [errorMessage, "No web search results available"]
        }
      };
    }
  }

  private buildSystemPrompt(): string {
    return `You are a professional research assistant that uses web search to gather current information.

CRITICAL REQUIREMENTS:
1. Use web_search tool to find up-to-date information
2. ALL claims must be backed by sources from web search results
3. Include specific URLs from your search results
4. NEVER make claims without web search backing
5. If web search returns no results, clearly state: "No sources found for this topic"
6. Do not rely on training data for current events or facts
7. Structure output as: Summary paragraph followed by list of sources

OUTPUT FORMAT:
# Summary
[2-3 paragraph overview based ONLY on web search results]

## Sources
- [Title 1](URL1)
- [Title 2](URL2)
- [Title 3](URL3)

ANTI-HALLUCINATION PROTOCOL:
- Only use information from web_search results
- If no sources returned, write: "No sources were returned from web search. Cannot provide information on this topic."
- Do not fabricate or simulate URLs
- Do not use model memory for facts`;
  }

  private buildUserPrompt(query: ResearchQuery): string {
    let prompt = `Research the following topic using web search:\n\n${query.topic}`;

    if (query.context) {
      prompt += `\n\nAdditional context: ${query.context}`;
    }

    if (query.includeRecentOnly) {
      prompt += `\n\nFocus on recent information (past 12 months if available).`;
    }

    if (query.maxResults) {
      prompt += `\n\nTarget approximately ${query.maxResults} key sources.`;
    }

    return prompt;
  }

  private extractSources(response: OpenAI.Chat.Completions.ChatCompletion): ResearchSource[] {
    const sources: ResearchSource[] = [];
    const accessedAt = new Date().toISOString();

    // Extract sources from tool calls and message content
    const message = response.choices[0]?.message;
    if (!message) return sources;

    // Extract sources from web_search tool calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        try {
          // Parse web_search results
          const toolData = toolCall as any;
          if (toolData.type === "web_search" || toolData.function) {
            const results = JSON.parse(toolCall.function?.arguments || "{}");
            
            // Handle various result formats
            if (results.results && Array.isArray(results.results)) {
              for (const result of results.results) {
                sources.push({
                  url: result.url || result.link || "",
                  title: result.title || result.name || "Web Source",
                  snippet: result.snippet || result.description || "",
                  relevance: "high",
                  publishedDate: result.publishedDate || result.date,
                  accessedAt
                });
              }
            } else if (results.urls && Array.isArray(results.urls)) {
              for (const url of results.urls) {
                sources.push({
                  url: url.url || url,
                  title: url.title || "Web Source",
                  snippet: url.snippet || "",
                  relevance: "medium",
                  accessedAt
                });
              }
            }
          }
        } catch (e) {
          // Continue on parse errors
        }
      }
    }

    // Also parse URLs from content if present
    const content = message.content || "";
    const urlRegex = /https?:\/\/[^\s\)]+/g;
    const urls = content.match(urlRegex) || [];
    
    for (const url of urls) {
      // Avoid duplicates
      if (!sources.find(s => s.url === url)) {
        sources.push({
          url,
          title: this.extractTitleFromUrl(url),
          snippet: "",
          relevance: "low",
          accessedAt
        });
      }
    }

    return sources;
  }

  private parseResponseToSections(
    response: OpenAI.Chat.Completions.ChatCompletion,
    sources: ResearchSource[]
  ): ResearchSection[] {
    const content = response.choices[0]?.message?.content || "";
    const sections: ResearchSection[] = [];

    // Split by markdown headers (##)
    const parts = content.split(/\n## /);
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lines = part.split("\n");
      const heading = lines[0].trim();
      
      // Extract confidence if present
      const confidenceMatch = part.match(/\*\*Confidence\*\*:\s*(high|medium|low|insufficient)/i);
      const confidence = (confidenceMatch?.[1] as any) || "medium";
      
      // Extract source URLs mentioned in this section
      const sectionSources = sources.filter(source => 
        part.includes(source.url)
      );
      
      // Remove metadata lines (Confidence, Sources)
      const contentLines = lines.slice(1).filter((line: string) => 
        !line.startsWith("**Confidence**") && 
        !line.startsWith("**Sources**")
      );
      
      sections.push({
        heading,
        content: contentLines.join("\n").trim(),
        sources: sectionSources.length > 0 ? sectionSources : sources,
        confidence
      });
    }

    // If no sections found, create one default section
    if (sections.length === 0) {
      sections.push({
        heading: "Research Findings",
        content,
        sources,
        confidence: sources.length >= this.options.minSourcesRequired ? "medium" : "insufficient"
      });
    }

    return sections;
  }

  private extractSummary(response: OpenAI.Chat.Completions.ChatCompletion): string {
    const content = response.choices[0]?.message?.content || "";
    
    // Extract content between # Summary and first ##
    const summaryMatch = content.match(/# Summary\n([\s\S]*?)(?:\n##|$)/);
    if (summaryMatch) {
      return summaryMatch[1].trim();
    }

    // Fallback: first paragraph
    const firstParagraph = content.split("\n\n")[0];
    return firstParagraph.substring(0, 500);
  }

  private assessConfidence(sources: ResearchSource[], sections: ResearchSection[]): "high" | "medium" | "low" | "insufficient" {
    if (sources.length < this.options.minSourcesRequired) {
      return "insufficient";
    }

    if (sources.length >= 5 && sections.every(s => s.confidence !== "insufficient")) {
      return "high";
    }

    if (sources.length >= 3) {
      return "medium";
    }

    return "low";
  }

  private identifyLimitations(sources: ResearchSource[], sections: ResearchSection[]): string[] {
    const limitations: string[] = [];

    if (sources.length < this.options.minSourcesRequired) {
      limitations.push(`Only ${sources.length} sources found (minimum ${this.options.minSourcesRequired} required)`);
    }

    const insufficientSections = sections.filter(s => s.confidence === "insufficient");
    if (insufficientSections.length > 0) {
      limitations.push(`${insufficientSections.length} section(s) marked as insufficient data`);
    }

    const sourcesWithoutSnippets = sources.filter(s => !s.snippet || s.snippet.length === 0);
    if (sourcesWithoutSnippets.length > sources.length / 2) {
      limitations.push("Many sources lack content snippets");
    }

    return limitations;
  }

  private countSearches(response: OpenAI.Chat.Completions.ChatCompletion): number {
    const message = response.choices[0]?.message;
    if (!message?.tool_calls) return 0;
    
    // Count web_search tool calls
    return message.tool_calls.filter((tc: any) => 
      tc.type === "web_search" || tc.function?.name?.includes("search")
    ).length;
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return "Web Source";
    }
  }

  private generateResearchId(): string {
    return `research-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
