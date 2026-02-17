#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { createMarkdownReport } from "./quality/report";
import { runGateEngine } from "./quality/engine";
import { getDomainFromUrl } from "./quality/classify";
import { IndexFile, Page, SiteType, Source, Summary } from "./quality/types";
import { getAiEnvConfig, logAiProviderWarning } from "./env";

const SITE_TYPES: SiteType[] = [
  "newsletter",
  "ecommerce",
  "portfolio",
  "saasLanding",
  "blog",
  "edtech",
  "fintech",
  "general"
];

function parseSiteType(value: string): SiteType {
  if (!SITE_TYPES.includes(value as SiteType)) {
    throw new Error(`Invalid siteType: ${value}`);
  }
  return value as SiteType;
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function normalizeSources(sources: Source[]): Source[] {
  return sources.map((source, index) => ({
    id: source.id || `source-${index + 1}`,
    url: source.url,
    title: source.title,
    fetchedAt: source.fetchedAt,
    domain: source.domain || getDomainFromUrl(source.url)
  }));
}

function normalizePages(pages: Page[]): Page[] {
  return pages.map((page, index) => ({
    id: page.id || `page-${index + 1}`,
    url: page.url,
    title: page.title,
    extractedText: page.extractedText || "",
    extractedAt: page.extractedAt,
    wordCount: page.wordCount
  }));
}

function normalizeSummaries(summaries: Summary[]): Summary[] {
  return summaries.map((summary, index) => ({
    id: summary.id || `summary-${index + 1}`,
    pageId: summary.pageId,
    title: summary.title,
    bullets: summary.bullets || [],
    fields: summary.fields
  }));
}

const program = new Command();
program.name("research").description("AI Web Research Toolkit CLI");

const aiConfig = getAiEnvConfig();
logAiProviderWarning(aiConfig);

program
  .command("run")
  .description("Create a research output folder")
  .requiredOption("--siteType <siteType>", "Site type", parseSiteType)
  .option("--out <folder>", "Output folder", "out")
  .option("--input <file>", "Optional JSON input file")
  .action((options) => {
    const outputDir = path.resolve(options.out);
    ensureDir(outputDir);

    let inputData: { index?: IndexFile; sources?: Source[]; pages?: Page[]; summaries?: Summary[] } = {};
    if (options.input) {
      inputData = readJsonFile(path.resolve(options.input)) as {
        index?: IndexFile;
        sources?: Source[];
        pages?: Page[];
        summaries?: Summary[];
      };
    }

    const index: IndexFile = {
      siteType: options.siteType,
      createdAt: new Date().toISOString(),
      settings: inputData.index?.settings ?? {}
    };

    const sources = normalizeSources(inputData.sources ?? []);
    const pages = normalizePages(inputData.pages ?? []);
    const summaries = normalizeSummaries(inputData.summaries ?? []);

    writeJson(path.join(outputDir, "index.json"), index);
    writeJson(path.join(outputDir, "sources.json"), sources);
    writeJson(path.join(outputDir, "pages.json"), pages);
    writeJson(path.join(outputDir, "summaries.json"), summaries);

    process.stdout.write(`Research output created at ${outputDir}\n`);
  });

program
  .command("gate")
  .description("Run quality gates on a research output folder")
  .requiredOption("--in <folder>", "Input folder")
  .requiredOption("--out <file>", "Output gate.json path")
  .option("--format <format>", "md or json", "json")
  .option("--gateConfig <file>", "Gate config JSON file")
  .action((options) => {
    const inputDir = path.resolve(options.in);
    const outPath = path.resolve(options.out);
    const format = String(options.format || "json").toLowerCase();

    const report = runGateEngine({ inputDir, gateConfigPath: options.gateConfig });
    writeJson(outPath, report);

    if (format === "md") {
      const md = createMarkdownReport(report);
      const mdPath = path.join(path.dirname(outPath), "gate.md");
      fs.writeFileSync(mdPath, md, "utf-8");
    }

    process.stdout.write(`Gate report saved to ${outPath}\n`);
  });

program.parse();
