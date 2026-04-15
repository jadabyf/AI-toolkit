import { createMarkdownReport } from "../../quality/report";
import { runGateEngine } from "../../quality/engine";

export function evaluateResearchFolder(inputDir: string, gateConfigPath?: string) {
  const report = runGateEngine({ inputDir, gateConfigPath });
  return {
    report,
    markdown: createMarkdownReport(report)
  };
}
