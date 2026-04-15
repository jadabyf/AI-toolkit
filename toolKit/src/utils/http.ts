import { stripHtml } from "./text";

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ai-web-research-toolkit/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch page (${response.status}): ${url}`);
  }
  const html = await response.text();
  return stripHtml(html);
}
