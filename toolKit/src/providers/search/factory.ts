import { MockSearchProvider } from "./mockSearchProvider";
import { SearchProvider } from "./types";
import { BraveSearchProvider, SerpApiSearchProvider, TavilySearchProvider } from "./apiSearchProviders";

export type SearchProviderName = "mock" | "tavily" | "serpapi" | "brave";

export interface SearchProviderConfig {
  provider: SearchProviderName;
  tavilyApiKey?: string;
  serpApiKey?: string;
  braveApiKey?: string;
}

export function createSearchProvider(config: SearchProviderConfig): SearchProvider {
  switch (config.provider) {
    case "tavily":
      if (!config.tavilyApiKey) {
        throw new Error("TAVILY_API_KEY is required for tavily search provider.");
      }
      return new TavilySearchProvider(config.tavilyApiKey);
    case "serpapi":
      if (!config.serpApiKey) {
        throw new Error("SERPAPI_API_KEY is required for serpapi search provider.");
      }
      return new SerpApiSearchProvider(config.serpApiKey);
    case "brave":
      if (!config.braveApiKey) {
        throw new Error("BRAVE_SEARCH_API_KEY is required for brave search provider.");
      }
      return new BraveSearchProvider(config.braveApiKey);
    case "mock":
    default:
      return new MockSearchProvider();
  }
}
