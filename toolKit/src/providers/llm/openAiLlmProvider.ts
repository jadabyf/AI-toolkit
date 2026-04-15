import OpenAI from "openai";
import { ResearchClaim, SourceDocument } from "../../core/models";
import { trimQuote } from "../../utils/text";
import { LLMProvider } from "./types";

function parseJsonArray(content: string): Array<{ statement: string; confidence?: "high" | "medium" | "low"; inferred?: boolean }> {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export class OpenAiLlmProvider implements LLMProvider {
  readonly name = "openai";
  private readonly client: OpenAI;

  constructor(apiKey: string, private readonly model: string) {
    this.client = new OpenAI({ apiKey });
  }

  async summarize(input: { query: string; sources: SourceDocument[] }): Promise<string> {
    const sourceContext = input.sources
      .slice(0, 8)
      .map((source, index) => `${index + 1}. ${source.title} (${source.url})\n${trimQuote(source.extractedText, 80)}`)
      .join("\n\n");

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a careful research analyst. Summarize only what is supported by provided sources. Keep it concise and evidence-aware."
        },
        {
          role: "user",
          content: `Question: ${input.query}\n\nSources:\n${sourceContext}\n\nWrite 5-8 bullets with neutral wording.`
        }
      ],
      temperature: 0.2,
      max_tokens: 700
    });

    return response.choices[0]?.message?.content?.trim() ?? "No summary returned.";
  }

  async extractClaims(input: { query: string; summary: string; sources: SourceDocument[] }): Promise<ResearchClaim[]> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "Return strict JSON array. Each item: {statement, confidence: high|medium|low, inferred: boolean}. No markdown."
        },
        {
          role: "user",
          content: `Question: ${input.query}\n\nSummary:\n${input.summary}\n\nExtract up to 8 factual claims.`
        }
      ],
      temperature: 0,
      max_tokens: 700
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    const claims = parseJsonArray(content).slice(0, 8);

    return claims.map((item, index) => {
      const source = input.sources[index % Math.max(input.sources.length, 1)];
      return {
        id: `claim-${index + 1}`,
        statement: item.statement,
        confidence: item.confidence ?? "medium",
        inferred: Boolean(item.inferred),
        citations: source
          ? [
              {
                sourceId: source.id,
                url: source.url,
                quote: trimQuote(source.extractedText, 24)
              }
            ]
          : []
      };
    });
  }
}
