import { ResearchQuery, SearchResult } from "../../core/models";

export interface SearchProvider {
  readonly name: string;
  search(query: ResearchQuery): Promise<SearchResult[]>;
  fetch?(url: string): Promise<string>;
}
