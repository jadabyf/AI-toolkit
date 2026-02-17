/**
 * Agile Quality Gates for VS Code Vibe Coder (AI Research Tool)
 * Sprint-level validation to ensure AI-generated code meets quality standards
 */

export type SprintPhase =
  | "prompt-design"
  | "code-generation"
  | "validation"
  | "integration"
  | "acceptance";

export type AgileGateType =
  | "promptIntent"
  | "codeCorrectness"
  | "vibeCoderStandard"
  | "hallucinationSafety"
  | "reproducibility"
  | "documentation"
  | "vscodeIntegration";

export type AgileGateStatus = "PASS" | "WARN" | "FAIL" | "NOT_APPLICABLE";

export interface PromptMetadata {
  prompt: string;
  language?: string;
  expectedOutputFormat?: string;
  taskGoal?: string;
  isExplicit: boolean;
  isScoped: boolean;
  isReproducible: boolean;
}

export interface CodeArtifact {
  code: string;
  language: string;
  fileName?: string;
  dependencies?: string[];
  executionContext?: string;
}

export interface ConsistencyTest {
  runNumber: number;
  output: string;
  timestamp: string;
  isConsistent: boolean;
  deviationScore?: number;
}

export interface HallucinationCheck {
  apiOrMethod: string;
  isVerified: boolean;
  source?: string; // Documentation URL or reference
  confidence: "high" | "medium" | "low";
  note?: string;
}

export interface ReadabilityMetrics {
  averageLineLength: number;
  maxNestingDepth: number;
  variableNameQuality: "clear" | "acceptable" | "poor";
  commentCoverage: number; // percentage
  complexityScore: number; // 1-10, lower is better
}

export interface AgileGateEvidence {
  type:
    | "prompt"
    | "code"
    | "test-result"
    | "documentation"
    | "api-verification"
    | "consistency-check";
  description: string;
  data?: any;
  severity?: "critical" | "major" | "minor";
}

export interface AgileGateResult {
  gateType: AgileGateType;
  status: AgileGateStatus;
  score: number; // 0-100
  explanation: string;
  evidence: AgileGateEvidence[];
  remediation: string[];
  blocksSprintAcceptance: boolean;
}

export interface SprintArtifact {
  sprintId: string;
  sprintNumber: number;
  phase: SprintPhase;
  timestamp: string;
  prompt?: PromptMetadata;
  codeArtifacts: CodeArtifact[];
  documentation?: string;
  targetVSCodeVersion?: string;
  requiredExtensions?: string[];
}

export interface SprintValidationContext {
  sprint: SprintArtifact;
  previousSprints?: SprintArtifact[];
  consistencyTests?: ConsistencyTest[];
  hallucinationChecks?: HallucinationCheck[];
  readabilityMetrics?: ReadabilityMetrics;
  ruleParams: Record<string, unknown>;
}

export interface AgileGate {
  id: string;
  type: AgileGateType;
  name: string;
  description: string;
  phase: SprintPhase;
  isMandatory: boolean;
  appliesTo: (context: SprintValidationContext) => boolean;
  evaluate: (context: SprintValidationContext) => AgileGateResult;
}

export interface SprintAcceptanceReport {
  sprintId: string;
  sprintNumber: number;
  overallStatus: "ACCEPTED" | "REJECTED" | "CONDITIONAL";
  acceptanceScore: number; // 0-100
  gateResults: AgileGateResult[];
  blockers: AgileGateResult[]; // Gates that failed and block acceptance
  warnings: AgileGateResult[]; // Gates that warned but don't block
  remediation: string[];
  nextSteps: string[];
  sprintSummary: {
    totalGates: number;
    passedGates: number;
    failedGates: number;
    warnedGates: number;
    blockedByGates: string[];
  };
}

export interface AgileGateConfig {
  thresholds?: {
    acceptanceScore?: number;
    warningScore?: number;
  };
  gates?: {
    [gateId: string]: {
      enabled?: boolean;
      mandatory?: boolean;
      params?: Record<string, unknown>;
    };
  };
  vscodeSettings?: {
    minVersion?: string;
    allowedExtensions?: string[];
    requireLinting?: boolean;
    requireFormatting?: boolean;
  };
  vibeCoderStandards?: {
    maxNestingDepth?: number;
    maxLineLength?: number;
    minCommentCoverage?: number;
    maxComplexityScore?: number;
  };
  reproducibilitySettings?: {
    requiredConsistencyRuns?: number;
    maxDeviationThreshold?: number;
  };
}

/**
 * Default thresholds for sprint acceptance
 */
export const DEFAULT_AGILE_THRESHOLDS = {
  acceptanceScore: 85,
  warningScore: 70
};

/**
 * Default Vibe Coder standards
 */
export const DEFAULT_VIBE_CODER_STANDARDS = {
  maxNestingDepth: 3,
  maxLineLength: 100,
  minCommentCoverage: 15,
  maxComplexityScore: 6
};

/**
 * Default reproducibility settings
 */
export const DEFAULT_REPRODUCIBILITY_SETTINGS = {
  requiredConsistencyRuns: 3,
  maxDeviationThreshold: 0.1 // 10% deviation allowed
};
