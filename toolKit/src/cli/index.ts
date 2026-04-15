import { Command } from "commander";
import { buildDesignCommand } from "./commands/design";
import { buildResearchCommand } from "./commands/research";
import { buildSprintCommand } from "./commands/sprint";

export function createToolkitCli(): Command {
  const program = new Command();

  program
    .name("toolkit")
    .description("AI research quality toolkit")
    .addHelpText(
      "after",
      "\nExamples:\n  toolkit research run \"AI coding assistants in 2026\" --siteType newsletter\n  toolkit research gate my-run-id --out runs/my-run-id/gate.json --format md\n  toolkit research report my-run-id\n  toolkit design evaluate runs/my-run-id\n  toolkit sprint evaluate examples/sprint.json"
    );

  program.addCommand(buildResearchCommand());
  program.addCommand(buildDesignCommand());
  program.addCommand(buildSprintCommand());

  return program;
}
