import { runGateEngine } from "../../quality/engine";

export function evaluateDesignInput(inputDir: string, gateConfigPath?: string) {
  return runGateEngine({ inputDir, gateConfigPath });
}
