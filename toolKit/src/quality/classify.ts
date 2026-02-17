import allowlist from "./allowlist.json";
import { DomainClass, IndexFile } from "./types";

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return "";
  }
}

function hasTld(domain: string, tld: string): boolean {
  return domain.endsWith(tld);
}

function matchesAny(domain: string, patterns: string[]): boolean {
  return patterns.some((pattern) => domain === pattern || domain.endsWith(`.${pattern}`) || domain.includes(pattern));
}

export function classifyDomain(url: string, index: IndexFile): DomainClass {
  const domain = getDomainFromUrl(url);
  if (!domain) {
    return "secondary";
  }

  if (matchesAny(domain, allowlist.lowQualityDomains)) {
    return "lowQuality";
  }

  if (hasTld(domain, ".gov") || hasTld(domain, ".edu")) {
    return "primary";
  }

  if (matchesAny(domain, allowlist.primaryDomains)) {
    return "primary";
  }

  const brandKeywords = Array.isArray(index.settings?.brandKeywords)
    ? (index.settings?.brandKeywords as string[])
    : [];
  if (brandKeywords.some((keyword) => keyword && domain.includes(keyword.toLowerCase()))) {
    return "primary";
  }

  if (domain.includes("docs.") || domain.includes("developer.") || domain.includes("dev.")) {
    return "primary";
  }

  if (matchesAny(domain, allowlist.secondaryDomains)) {
    return "secondary";
  }

  return "secondary";
}

export function isReviewDomain(url: string): boolean {
  const domain = getDomainFromUrl(url);
  if (!domain) {
    return false;
  }
  return matchesAny(domain, allowlist.reviewDomains) || domain.includes("review");
}

export function isLowQualityDomain(url: string): boolean {
  const domain = getDomainFromUrl(url);
  if (!domain) {
    return false;
  }
  return matchesAny(domain, allowlist.lowQualityDomains);
}
