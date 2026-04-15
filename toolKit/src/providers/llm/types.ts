import { ResearchClaim, SourceDocument } from "../../core/models";

export interface LLMProvider {
  readonly name: string;
  summarize(input: { query: string; sources: SourceDocument[] }): Promise<string>;
  extractClaims(input: { query: string; summary: string; sources: SourceDocument[] }): Promise<ResearchClaim[]>;
  scoreConfidence?(input: { claim: string; evidenceCount: number }): Promise<number>;
}
