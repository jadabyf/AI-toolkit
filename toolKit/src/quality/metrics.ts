import { classifyDomain, getDomainFromUrl } from "./classify";
import { IndexFile, Metrics, Page, Source, Summary } from "./types";

const MARKETING_TERMS = [
  "best",
  "world-class",
  "revolutionary",
  "game-changing",
  "unmatched",
  "cutting-edge",
  "leading",
  "ultimate",
  "seamless",
  "instant",
  "guaranteed"
];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function daysBetween(now: Date, then: Date): number {
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function computeMetrics(options: {
  index: IndexFile;
  sources: Source[];
  pages: Page[];
  summaries: Summary[];
  now: Date;
}): Metrics {
  const { index, sources, pages, summaries, now } = options;
  const sourceAgesDays: number[] = [];
  const extractedWordCounts: number[] = [];
  let summaryWordCountTotal = 0;
  let bulletsTotal = 0;
  let bulletsWithCitations = 0;
  let marketingHits = 0;
  let marketingWords = 0;
  let thinContentCount = 0;
  let priceMentioned = false;
  let priceSourceRecent = false;

  const sourceByUrl = new Map<string, Source>();
  sources.forEach((source) => {
    sourceByUrl.set(source.url, source);
    if (source.fetchedAt) {
      const age = daysBetween(now, new Date(source.fetchedAt));
      sourceAgesDays.push(age);
    }
  });

  pages.forEach((page) => {
    const count = page.wordCount ?? wordCount(page.extractedText || "");
    extractedWordCounts.push(count);
    if (count > 0 && count < 150) {
      thinContentCount += 1;
    }
  });

  summaries.forEach((summary) => {
    summary.bullets.forEach((bullet) => {
      const bulletWordCount = wordCount(bullet.text || "");
      summaryWordCountTotal += bulletWordCount;
      bulletsTotal += 1;
      if (bullet.citations && bullet.citations.length > 0) {
        bulletsWithCitations += 1;
      }

      if (/\$\d+|\b\d+\s?(usd|eur|gbp|dollars?)\b/i.test(bullet.text)) {
        priceMentioned = true;
        const recentCitation = bullet.citations.some((citation) => {
          const source = sourceByUrl.get(citation.url);
          if (!source?.fetchedAt) {
            return false;
          }
          const age = daysBetween(now, new Date(source.fetchedAt));
          return age <= 7;
        });
        if (recentCitation) {
          priceSourceRecent = true;
        }
      }

      const words = bullet.text.toLowerCase().split(/\s+/).filter(Boolean);
      marketingWords += words.length;
      words.forEach((word) => {
        if (MARKETING_TERMS.includes(word)) {
          marketingHits += 1;
        }
      });
    });
  });

  const recentSources7 = sourceAgesDays.filter((days) => days <= 7).length;
  const recentSources30 = sourceAgesDays.filter((days) => days <= 30).length;
  const recentSources60 = sourceAgesDays.filter((days) => days <= 60).length;

  const credibleSourceCount = sources.filter(
    (source) => classifyDomain(source.url, index) !== "lowQuality"
  ).length;

  const longFormSourcesCount = extractedWordCounts.filter((count) => count >= 800).length;
  const mediumSourcesCount = extractedWordCounts.filter((count) => count >= 400).length;

  const marketingScore = marketingWords === 0 ? 0 : marketingHits / marketingWords;
  const citationCoverageRatio = bulletsTotal === 0 ? 0 : bulletsWithCitations / bulletsTotal;

  const domains = Array.from(
    new Set(sources.map((source) => source.domain || getDomainFromUrl(source.url)).filter(Boolean))
  );

  return {
    sourceCount: sources.length,
    credibleSourceCount,
    domainDiversity: domains.length,
    sourceAgesDays,
    recentSources7,
    recentSources30,
    recentSources60,
    extractedWordCounts,
    summaryWordCount: summaryWordCountTotal,
    citationCoverageRatio,
    marketingScore,
    thinContentCount,
    priceMentioned,
    priceSourceRecent,
    longFormSourcesCount,
    mediumSourcesCount
  };
}
