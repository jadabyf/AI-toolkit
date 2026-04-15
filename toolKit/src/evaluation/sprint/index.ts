import fs from "fs";
import { formatSprintReportMarkdown, runSprintAcceptance } from "../../quality/sprintEngine";
import { SprintArtifact, SprintValidationContext } from "../../quality/agileTypes";

export function evaluateSprintArtifact(inputFile: string, configPath?: string) {
  const raw = fs.readFileSync(inputFile, "utf-8");
  const sprint = JSON.parse(raw) as SprintArtifact;
  const context: SprintValidationContext = {
    sprint,
    ruleParams: {}
  };
  const report = runSprintAcceptance(context, configPath);
  return {
    report,
    markdown: formatSprintReportMarkdown(report)
  };
}
