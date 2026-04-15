import { ResearchQuery, SearchResult } from "../../core/models";
import { fetchJson, fetchPageText } from "../../utils/http";
import { SearchProvider } from "./types";

interface TavilyResponse {
  results?: Array<{ title: string; url: string; content?: string; published_date?: string; score?: number }>;
}

interface BraveResponse {
  web?: { results?: Array<{ title?: string; url?: string; description?: string; age?: string }> };
}

interface SerpApiResponse {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string; date?: string; position?: number }>;
}

export class TavilySearchProvider implements SearchProvider {
  readonly name = "tavily";

  constructor(private readonly apiKey: string) {}

  async search(query: ResearchQuery): Promise<SearchResult[]> {
    const payload = {
      api_key: this.apiKey,
      query: query.text,
      max_results: query.maxResults ?? 8,
      search_depth: "advanced",
      include_answer: false
    };

    const response = await fetchJson<TavilyResponse>("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return (response.results ?? []).map((item, index) => ({
      id: `tavily-${index + 1}`,
      title: item.title,
      url: item.url,
      snippet: item.content ?? "",
      publishedAt: item.published_date,
      score: item.score,
      provider: this.name
    }));
  }

  async fetch(url: string): Promise<string> {
    return fetchPageText(url);
  }
}

export class BraveSearchProvider implements SearchProvider {
  readonly name = "brave";

  constructor(private readonly apiKey: string) {}

  async search(query: ResearchQuery): Promise<SearchResult[]> {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query.text);
    url.searchParams.set("count", String(query.maxResults ?? 8));

    const response = await fetchJson<BraveResponse>(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": this.apiKey
      }
    });

    return (response.web?.results ?? []).map((item, index) => ({
      id: `brave-${index + 1}`,
      title: item.title ?? `Result ${index + 1}`,
      url: item.url ?? "",
      snippet: item.description ?? "",
      publishedAt: item.age,
      provider: this.name
    })).filter((item) => item.url.length > 0);
  }

  async fetch(url: string): Promise<string> {
    return fetchPageText(url);
  }
}

export class SerpApiSearchProvider implements SearchProvider {
  readonly name = "serpapi";

  constructor(private readonly apiKey: string) {}

  async search(query: ResearchQuery): Promise<SearchResult[]> {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("q", query.text);
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("num", String(query.maxResults ?? 8));

    const response = await fetchJson<SerpApiResponse>(url.toString());
    return (response.organic_results ?? []).map((item, index) => ({
      id: `serpapi-${item.position ?? index + 1}`,
      title: item.title ?? `Result ${index + 1}`,
      url: item.link ?? "",
      snippet: item.snippet ?? "",
      publishedAt: item.date,
      provider: this.name
    })).filter((item) => item.url.length > 0);
  }

  async fetch(url: string): Promise<string> {
    return fetchPageText(url);
  }
}
