#!/usr/bin/env node
import * as dotenv from "dotenv";
import { createToolkitCli } from "./cli/index";

dotenv.config();

async function main(): Promise<void> {
  const program = createToolkitCli();
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
});
