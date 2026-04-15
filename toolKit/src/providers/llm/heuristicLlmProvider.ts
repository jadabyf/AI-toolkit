import { ResearchClaim, SourceDocument } from "../../core/models";
import { trimQuote } from "../../utils/text";
import { LLMProvider } from "./types";

export class HeuristicLlmProvider implements LLMProvider {
  readonly name = "heuristic";

  async summarize(input: { query: string; sources: SourceDocument[] }): Promise<string> {
    const lines = input.sources.slice(0, 5).map((source, index) => {
      const sample = trimQuote(source.extractedText, 20);
      return `${index + 1}. ${source.title}: ${sample}`;
    });
    return `Research summary for: ${input.query}\n\n${lines.join("\n")}`;
  }

  async extractClaims(input: { query: string; summary: string; sources: SourceDocument[] }): Promise<ResearchClaim[]> {
    const sentences = input.summary
      .split(/[\n\.]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 30)
      .slice(0, 6);

    return sentences.map((statement, index) => {
      const source = input.sources[index % Math.max(input.sources.length, 1)];
      const quote = source ? trimQuote(source.extractedText, 22) : "No evidence snippet available.";
      return {
        id: `claim-${index + 1}`,
        statement,
        confidence: source ? "medium" : "low",
        inferred: false,
        citations: source
          ? [
              {
                sourceId: source.id,
                url: source.url,
                quote
              }
            ]
          : []
      };
    });
  }
}
