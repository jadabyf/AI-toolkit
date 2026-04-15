import { ResearchQuery, SearchResult } from "../../core/models";
import { SearchProvider } from "./types";

export class MockSearchProvider implements SearchProvider {
  readonly name = "mock";

  async search(query: ResearchQuery): Promise<SearchResult[]> {
    const base = encodeURIComponent(query.text.slice(0, 40));
    return [
      {
        id: "mock-1",
        title: `Reference overview for ${query.text}`,
        url: `https://developer.mozilla.org/en-US/search?q=${base}`,
        snippet: "Reference documentation and standards details.",
        provider: this.name,
        publishedAt: new Date().toISOString()
      },
      {
        id: "mock-2",
        title: `${query.siteType} implementation guide`,
        url: `https://web.dev/search/?q=${base}`,
        snippet: "Practical implementation guidance.",
        provider: this.name,
        publishedAt: new Date().toISOString()
      },
      {
        id: "mock-3",
        title: `Industry coverage for ${query.siteType}`,
        url: `https://en.wikipedia.org/wiki/${base}`,
        snippet: "Background context from a secondary source.",
        provider: this.name
      }
    ];
  }
}
