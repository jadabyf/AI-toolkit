import fs from "fs";
import path from "path";
import { Command } from "commander";
import { evaluateSprintArtifact } from "../../evaluation/sprint";

export function buildSprintCommand(): Command {
  const sprint = new Command("sprint").description("Sprint quality evaluation commands");

  sprint
    .command("evaluate")
    .description("Evaluate agile sprint quality gates from a sprint artifact JSON file")
    .argument("<input>", "Sprint artifact JSON path")
    .option("--config <file>", "Optional agile gates config file")
    .option("--out <file>", "Optional output markdown path")
    .action((input: string, options) => {
      const { report, markdown } = evaluateSprintArtifact(path.resolve(input), options.config);
      const outPath = options.out
        ? path.resolve(options.out)
        : path.join(path.dirname(path.resolve(input)), "sprint-report.md");

      fs.writeFileSync(outPath, markdown, "utf-8");
      process.stdout.write(`Sprint report saved to ${outPath}\n`);
      process.stdout.write(`Sprint status: ${report.overallStatus} (${report.acceptanceScore}/100)\n`);
    });

  return sprint;
}
