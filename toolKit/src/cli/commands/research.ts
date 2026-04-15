import fs from "fs";
import path from "path";
import { Command } from "commander";
import { runResearchPipeline } from "../../research/pipeline/runPipeline";
import { createSearchProvider, SearchProviderName } from "../../providers/search/factory";
import { createLlmProvider, LlmProviderName } from "../../providers/llm/factory";
import { evaluateResearchFolder } from "../../evaluation/quality";
import { createResearchMarkdownReport } from "../../research/reporting/researchReport";
import { ResearchRunStore } from "../../research/storage/runStore";
import { SiteType } from "../../quality/types";

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

function parseSearchProvider(value: string): SearchProviderName {
  const allowed: SearchProviderName[] = ["mock", "tavily", "serpapi", "brave"];
  if (!allowed.includes(value as SearchProviderName)) {
    throw new Error(`Invalid search provider: ${value}`);
  }
  return value as SearchProviderName;
}

function parseLlmProvider(value: string): LlmProviderName {
  const allowed: LlmProviderName[] = ["heuristic", "openai"];
  if (!allowed.includes(value as LlmProviderName)) {
    throw new Error(`Invalid llm provider: ${value}`);
  }
  return value as LlmProviderName;
}

function resolveInputDir(target?: string, explicitInput?: string, baseDir: string = path.resolve("runs")): string {
  if (explicitInput) {
    return path.resolve(explicitInput);
  }
  if (!target) {
    throw new Error("Provide either a run id/path argument or --in <folder>.");
  }
  const asPath = path.resolve(target);
  if (fs.existsSync(asPath)) {
    return asPath;
  }
  return path.join(baseDir, target);
}

export function buildResearchCommand(): Command {
  const research = new Command("research").description("Run evidence-backed research workflows");

  research
    .command("run")
    .description('Run full pipeline: search -> extraction -> summary -> claims -> gates -> report. Example: toolkit research run "AI coding trends" --siteType newsletter')
    .argument("<query>", "Research question")
    .requiredOption("--siteType <siteType>", "Target site type", parseSiteType)
    .option("--maxResults <number>", "Maximum search results to process", (v) => Number(v), 8)
    .option("--searchProvider <provider>", "mock|tavily|serpapi|brave", parseSearchProvider, (process.env.SEARCH_PROVIDER as SearchProviderName) || "mock")
    .option("--llmProvider <provider>", "heuristic|openai", parseLlmProvider, (process.env.LLM_PROVIDER as LlmProviderName) || "heuristic")
    .option("--gateConfig <file>", "Path to gates config JSON")
    .option("--runsDir <dir>", "Run storage directory", "runs")
    .action(async (query: string, options) => {
      const searchProvider = createSearchProvider({
        provider: options.searchProvider,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        serpApiKey: process.env.SERPAPI_API_KEY,
        braveApiKey: process.env.BRAVE_SEARCH_API_KEY
      });

      const llmProvider = createLlmProvider({
        provider: options.llmProvider,
        openAiApiKey: process.env.OPENAI_API_KEY,
        openAiModel: process.env.OPENAI_MODEL
      });

      const result = await runResearchPipeline({
        query,
        siteType: options.siteType,
        maxResults: options.maxResults,
        gateConfigPath: options.gateConfig,
        outDir: options.runsDir,
        searchProvider,
        llmProvider
      });

      process.stdout.write(`Run completed: ${result.run.runId}\n`);
      process.stdout.write(`Overall gate status: ${result.run.gate.status} (${result.run.gate.score}/100)\n`);
      process.stdout.write(`Artifacts: ${result.paths.runDir}\n`);
    });

  research
    .command("gate")
    .description("Evaluate quality gates for an existing run or folder. Example: toolkit research gate 20260414-query --format md")
    .argument("[target]", "Run ID or folder path")
    .option("--in <folder>", "Input folder with index/sources/pages/summaries")
    .requiredOption("--out <file>", "Output gate json path")
    .option("--format <format>", "json|md", "json")
    .option("--gateConfig <file>", "Path to gates config JSON")
    .action((target: string | undefined, options) => {
      const inputDir = resolveInputDir(target, options.in);
      const { report, markdown } = evaluateResearchFolder(inputDir, options.gateConfig);
      const outPath = path.resolve(options.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");

      if (String(options.format).toLowerCase() === "md") {
        const mdPath = path.join(path.dirname(outPath), "gate.md");
        fs.writeFileSync(mdPath, markdown, "utf-8");
      }

      process.stdout.write(`Gate report saved to ${outPath}\n`);
    });

  research
    .command("report")
    .description("Generate a markdown report from a stored run. Example: toolkit research report 20260414-query")
    .argument("<runIdOrPath>", "Run ID or path to run.json")
    .option("--out <file>", "Optional output markdown path")
    .option("--runsDir <dir>", "Run storage directory", "runs")
    .action((runIdOrPath: string, options) => {
      const store = new ResearchRunStore(path.resolve(options.runsDir));
      const run = store.loadRun(runIdOrPath);
      const markdown = createResearchMarkdownReport(run);
      const outPath = options.out
        ? path.resolve(options.out)
        : path.join(path.resolve(options.runsDir), run.runId, "report.md");

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, markdown, "utf-8");
      process.stdout.write(`Report saved to ${outPath}\n`);
    });

  return research;
}
