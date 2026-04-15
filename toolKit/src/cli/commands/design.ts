import fs from "fs";
import path from "path";
import { Command } from "commander";
import { evaluateDesignInput } from "../../evaluation/design";

export function buildDesignCommand(): Command {
  const design = new Command("design").description("Design quality evaluation commands");

  design
    .command("evaluate")
    .description("Evaluate design gates from a research folder containing index/sources/pages/summaries")
    .argument("<input>", "Input folder")
    .option("--gateConfig <file>", "Optional gate config override")
    .option("--out <file>", "Optional output json path")
    .action((input: string, options) => {
      const report = evaluateDesignInput(path.resolve(input), options.gateConfig);
      const outPath = options.out ? path.resolve(options.out) : path.join(path.resolve(input), "design-gate.json");
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
      process.stdout.write(`Design evaluation saved to ${outPath}\n`);
    });

  return design;
}
