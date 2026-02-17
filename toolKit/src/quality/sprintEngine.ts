import { getAgileGates } from "./agileGates";
import {
  AgileGate,
  AgileGateConfig,
  AgileGateResult,
  SprintAcceptanceReport,
  SprintValidationContext,
  DEFAULT_AGILE_THRESHOLDS
} from "./agileTypes";

/**
 * Load Agile gate configuration from file or use defaults
 */
export function loadAgileGateConfig(configPath?: string): AgileGateConfig {
  if (!configPath) {
    return {};
  }

  try {
    const fs = require("fs");
    if (!fs.existsSync(configPath)) {
      return {};
    }
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as AgileGateConfig;
  } catch (error) {
    console.warn(`Failed to load Agile gate config from ${configPath}:`, error);
    return {};
  }
}

/**
 * Resolve gate configuration for a specific gate
 */
function resolveGateConfig(
  gateId: string,
  config: AgileGateConfig,
  defaultParams?: Record<string, unknown>
): { enabled: boolean; mandatory: boolean; params: Record<string, unknown> } {
  const gateConfig = config.gates?.[gateId];

  return {
    enabled: gateConfig?.enabled ?? true,
    mandatory: gateConfig?.mandatory ?? true,
    params: { ...defaultParams, ...(gateConfig?.params || {}) }
  };
}

/**
 * Run Sprint Acceptance Engine
 */
export function runSprintAcceptance(
  context: SprintValidationContext,
  configPath?: string
): SprintAcceptanceReport {
  const config = loadAgileGateConfig(configPath);
  const thresholds = {
    ...DEFAULT_AGILE_THRESHOLDS,
    ...(config.thresholds || {})
  };

  // Merge config settings into context
  const enrichedContext: SprintValidationContext = {
    ...context,
    ruleParams: {
      ...context.ruleParams,
      vibeCoderStandards: config.vibeCoderStandards,
      reproducibilitySettings: config.reproducibilitySettings,
      vscodeSettings: config.vscodeSettings
    }
  };

  const gates = getAgileGates();
  const gateResults: AgileGateResult[] = [];
  let totalScore = 0;
  let applicableGatesCount = 0;

  // Evaluate each gate
  gates.forEach((gate) => {
    if (!gate.appliesTo(enrichedContext)) {
      return;
    }

    const { enabled, mandatory, params } = resolveGateConfig(
      gate.id,
      config,
      {}
    );

    if (!enabled) {
      return;
    }

    // Run gate evaluation
    const result = gate.evaluate({
      ...enrichedContext,
      ruleParams: { ...enrichedContext.ruleParams, ...params }
    });

    // Override mandatory setting if specified in config
    const finalResult: AgileGateResult = {
      ...result,
      blocksSprintAcceptance: mandatory && result.blocksSprintAcceptance
    };

    gateResults.push(finalResult);
    totalScore += result.score;
    applicableGatesCount++;
  });

  // Calculate acceptance score
  const acceptanceScore =
    applicableGatesCount > 0 ? Math.round(totalScore / applicableGatesCount) : 0;

  // Determine overall status
  const blockers = gateResults.filter((r) => r.blocksSprintAcceptance && r.status === "FAIL");
  const warnings = gateResults.filter((r) => r.status === "WARN");

  let overallStatus: SprintAcceptanceReport["overallStatus"];
  if (blockers.length > 0) {
    overallStatus = "REJECTED";
  } else if (acceptanceScore >= thresholds.acceptanceScore) {
    overallStatus = "ACCEPTED";
  } else if (acceptanceScore >= thresholds.warningScore || warnings.length > 0) {
    overallStatus = "CONDITIONAL";
  } else {
    overallStatus = "REJECTED";
  }

  // Collect remediation
  const remediation = Array.from(
    new Set(
      gateResults
        .filter((r) => r.status !== "PASS")
        .flatMap((r) => r.remediation)
    )
  );

  // Generate next steps
  const nextSteps: string[] = [];
  if (overallStatus === "REJECTED") {
    nextSteps.push("Address all blocking gate failures before proceeding to next sprint");
    nextSteps.push("Refine and re-test sprint artifacts");
    blockers.forEach((blocker) => {
      nextSteps.push(`Fix ${blocker.gateType} issues: ${blocker.explanation}`);
    });
  } else if (overallStatus === "CONDITIONAL") {
    nextSteps.push("Sprint can proceed with warnings - address issues in next iteration");
    warnings.forEach((warning) => {
      nextSteps.push(`Improve ${warning.gateType}: ${warning.explanation}`);
    });
  } else {
    nextSteps.push("Sprint ACCEPTED - proceed to next sprint phase");
    nextSteps.push("Continue monitoring quality gates in subsequent sprints");
  }

  // Build sprint summary
  const sprintSummary = {
    totalGates: applicableGatesCount,
    passedGates: gateResults.filter((r) => r.status === "PASS").length,
    failedGates: gateResults.filter((r) => r.status === "FAIL").length,
    warnedGates: gateResults.filter((r) => r.status === "WARN").length,
    blockedByGates: blockers.map((b) => b.gateType)
  };

  const report: SprintAcceptanceReport = {
    sprintId: context.sprint.sprintId,
    sprintNumber: context.sprint.sprintNumber,
    overallStatus,
    acceptanceScore,
    gateResults,
    blockers,
    warnings,
    remediation,
    nextSteps,
    sprintSummary
  };

  return report;
}

/**
 * Format sprint acceptance report as Markdown
 */
export function formatSprintReportMarkdown(report: SprintAcceptanceReport): string {
  const lines: string[] = [];

  lines.push(`# Sprint ${report.sprintNumber} Acceptance Report`);
  lines.push("");
  lines.push(`**Sprint ID:** ${report.sprintId}`);
  lines.push(`**Overall Status:** ${report.overallStatus}`);
  lines.push(`**Acceptance Score:** ${report.acceptanceScore}/100`);
  lines.push("");

  // Sprint Summary
  lines.push("## Sprint Summary");
  lines.push("");
  lines.push(`- Total Gates Evaluated: ${report.sprintSummary.totalGates}`);
  lines.push(`- Passed: ${report.sprintSummary.passedGates}`);
  lines.push(`- Warned: ${report.sprintSummary.warnedGates}`);
  lines.push(`- Failed: ${report.sprintSummary.failedGates}`);
  if (report.sprintSummary.blockedByGates.length > 0) {
    lines.push(`- Blocked By: ${report.sprintSummary.blockedByGates.join(", ")}`);
  }
  lines.push("");

  // Gate Results
  lines.push("## Gate Results");
  lines.push("");

  report.gateResults.forEach((result) => {
    const statusIcon =
      result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    const blockingLabel = result.blocksSprintAcceptance ? " [BLOCKING]" : "";

    lines.push(`### ${statusIcon} ${result.gateType}${blockingLabel}`);
    lines.push("");
    lines.push(`**Status:** ${result.status}`);
    lines.push(`**Score:** ${result.score}/100`);
    lines.push(`**Explanation:** ${result.explanation}`);
    lines.push("");

    if (result.evidence.length > 0) {
      lines.push("**Evidence:**");
      result.evidence.forEach((ev) => {
        const severityLabel = ev.severity ? `[${ev.severity.toUpperCase()}]` : "";
        lines.push(`- ${severityLabel} ${ev.description}`);
      });
      lines.push("");
    }

    if (result.remediation.length > 0) {
      lines.push("**Remediation:**");
      result.remediation.forEach((rem) => {
        lines.push(`- ${rem}`);
      });
      lines.push("");
    }
  });

  // Blockers
  if (report.blockers.length > 0) {
    lines.push("## ❌ Blocking Issues");
    lines.push("");
    report.blockers.forEach((blocker) => {
      lines.push(`- **${blocker.gateType}:** ${blocker.explanation}`);
    });
    lines.push("");
  }

  // Warnings
  if (report.warnings.length > 0) {
    lines.push("## ⚠️ Warnings");
    lines.push("");
    report.warnings.forEach((warning) => {
      lines.push(`- **${warning.gateType}:** ${warning.explanation}`);
    });
    lines.push("");
  }

  // Remediation
  if (report.remediation.length > 0) {
    lines.push("## Recommended Actions");
    lines.push("");
    report.remediation.slice(0, 10).forEach((rem, index) => {
      lines.push(`${index + 1}. ${rem}`);
    });
    lines.push("");
  }

  // Next Steps
  lines.push("## Next Steps");
  lines.push("");
  report.nextSteps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });
  lines.push("");

  // Decision
  lines.push("## Sprint Decision");
  lines.push("");
  if (report.overallStatus === "ACCEPTED") {
    lines.push("✅ **SPRINT ACCEPTED** - All quality gates passed or met acceptable thresholds.");
    lines.push("");
    lines.push("The sprint output is approved for integration into the next development phase.");
  } else if (report.overallStatus === "CONDITIONAL") {
    lines.push("⚠️ **CONDITIONAL ACCEPTANCE** - Sprint can proceed with noted warnings.");
    lines.push("");
    lines.push("Address warnings in the next sprint iteration to improve quality.");
  } else {
    lines.push("❌ **SPRINT REJECTED** - Critical quality gates failed.");
    lines.push("");
    lines.push("Sprint output must be refined and re-submitted before proceeding.");
  }

  return lines.join("\n");
}

/**
 * Format sprint acceptance report as JSON
 */
export function formatSprintReportJSON(report: SprintAcceptanceReport): string {
  return JSON.stringify(report, null, 2);
}
