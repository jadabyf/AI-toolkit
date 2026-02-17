# Agile Quality Gates - Quick Reference

## Sprint Phases

1. **prompt-design** → Design clear, explicit prompts
2. **code-generation** → Generate code artifacts
3. **validation** → Validate consistency and safety
4. **integration** → Test VS Code integration
5. **acceptance** → Final sprint acceptance decision

---

## Quality Gates Summary

| Gate | ID | Phase | Mandatory | Blocks Sprint |
|------|----|-------|-----------|---------------|
| Prompt Intent | `agile.promptIntent` | prompt-design | ✅ | Yes |
| Code Correctness | `agile.codeCorrectness` | code-generation | ✅ | Yes |
| Vibe Coder Standard | `agile.vibeCoderStandard` | code-generation | ✅ | Yes |
| Hallucination Safety | `agile.hallucinationSafety` | validation | ✅ | Yes |
| Reproducibility | `agile.reproducibility` | validation | ✅ | Yes |
| Documentation | `agile.documentation` | validation | ❌ | No |
| VS Code Integration | `agile.vscodeIntegration` | integration | ✅ | Yes |

---

## Quick Start

### 1. Create Sprint Artifact

```typescript
const sprint = {
  sprintId: "sprint-001",
  sprintNumber: 1,
  phase: "code-generation",
  timestamp: new Date().toISOString(),
  prompt: {
    prompt: "Your prompt here",
    language: "TypeScript",
    taskGoal: "Clear goal",
    isExplicit: true,
    isScoped: true,
    isReproducible: true
  },
  codeArtifacts: [
    {
      code: "// Your code",
      language: "TypeScript",
      fileName: "example.ts"
    }
  ],
  documentation: "Brief explanation"
};
```

### 2. Run Validation

```typescript
import { runSprintAcceptance } from "./quality/sprintEngine";

const context = { sprint, ruleParams: {} };
const report = runSprintAcceptance(context);
```

### 3. Check Result

```typescript
if (report.overallStatus === "ACCEPTED") {
  console.log("✅ Sprint accepted!");
} else if (report.overallStatus === "CONDITIONAL") {
  console.log("⚠️ Conditional acceptance");
} else {
  console.log("❌ Sprint rejected");
  console.log("Blockers:", report.blockers);
}
```

---

## Vibe Coder Standards

| Metric | Limit | Description |
|--------|-------|-------------|
| Nesting Depth | 3 levels | Maximum nested blocks |
| Line Length | 100 chars | Maximum characters per line |
| Comment Coverage | 15% | Minimum inline documentation |
| Complexity Score | 6/10 | Maximum code complexity |

---

## Reproducibility Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Consistency Runs | 3 | Minimum test iterations |
| Deviation Threshold | 10% | Maximum acceptable deviation |

---

## Common Pass/Fail Patterns

### ✅ PASS Examples

**Prompt Intent:**
```typescript
{
  prompt: "Create a TypeScript function to validate email addresses using regex",
  language: "TypeScript",
  taskGoal: "Email validation with regex pattern",
  expectedOutputFormat: "function",
  isExplicit: true,
  isScoped: true,
  isReproducible: true
}
```

**Code Correctness:**
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Vibe Coder Standard:**
```typescript
// Clear variable names
function calculateTotal(prices: number[]): number {
  // Simple control flow
  let total = 0;
  for (const price of prices) {
    total += price;
  }
  return total;
}
```

---

### ❌ FAIL Examples

**Prompt Intent:**
```typescript
{
  prompt: "Make it work",  // ❌ Too vague
  language: undefined,     // ❌ Missing language
  isExplicit: false        // ❌ Not explicit
}
```

**Code Correctness:**
```typescript
function doSomething() {
  // TODO: implement this  // ❌ Placeholder logic
  return ...;              // ❌ Incomplete code
```

**Vibe Coder Standard:**
```typescript
// ❌ Poor variable names
function f(a,b,c,d,e) {
  // ❌ Excessive nesting (5 levels)
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            return true;
          }
        }
      }
    }
  }
}
```

**Hallucination Safety:**
```typescript
// ❌ Fabricated library
import { magicFix } from '@ai-magic/auto-fix';

// ❌ Non-existent method
const result = Array.superMap();
```

---

## Status Codes

| Status | Score Range | Meaning |
|--------|-------------|---------|
| PASS | 85-100 | Gate passed successfully |
| WARN | 70-84 | Gate passed with warnings |
| FAIL | 0-69 | Gate failed |
| NOT_APPLICABLE | - | Gate doesn't apply to this sprint |

---

## Sprint Acceptance Criteria

| Overall Status | Criteria |
|---------------|----------|
| **ACCEPTED** | Score ≥ 85 AND no blocking failures |
| **CONDITIONAL** | Score ≥ 70 OR warnings present (no blockers) |
| **REJECTED** | Score < 70 OR any blocking gate failed |

---

## Configuration Checklist

**Minimum Required:**
- ✅ Sprint ID and number
- ✅ Sprint phase
- ✅ At least one code artifact
- ✅ Prompt metadata (if in prompt-design phase)

**Recommended:**
- ✅ Consistency test results (3+ runs)
- ✅ Readability metrics
- ✅ Hallucination checks
- ✅ Documentation

**Optional:**
- Previous sprints for trend analysis
- Custom gate parameters
- VS Code version requirements

---

## Common Remediation Steps

### Prompt Intent Gate
1. Add explicit task goal
2. Specify programming language
3. Define expected output format
4. Test prompt reproducibility

### Code Correctness Gate
1. Remove all TODO/FIXME comments
2. Balance all braces and brackets
3. Complete all implementations
4. Test code execution

### Vibe Coder Standard Gate
1. Use descriptive variable names
2. Reduce nesting depth to ≤3
3. Break complex functions into smaller ones
4. Add inline comments (15%+ coverage)

### Hallucination Safety Gate
1. Verify all APIs against official docs
2. Remove invented functions/libraries
3. Provide documentation sources
4. Test all imports and dependencies

### Reproducibility Gate
1. Run 3+ consistency tests
2. Remove randomness and external state
3. Ensure consistent outputs
4. Refine prompt for stability

### Documentation Gate
1. Explain why, not just what
2. Add usage instructions
3. Include inline comments
4. Provide examples

### VS Code Integration Gate
1. Use relative paths (not hardcoded)
2. Test with VS Code extensions
3. Follow VS Code project structure
4. Minimize exotic dependencies

---

## Command Line Examples

**Run with default config:**
```bash
npm run sprint:validate
```

**Run with custom config:**
```bash
npm run sprint:validate -- --config agile-gates.json
```

**Generate Markdown report:**
```bash
npm run sprint:report -- --format md --output sprint-report.md
```

**Generate JSON report:**
```bash
npm run sprint:report -- --format json --output sprint-report.json
```

---

## Troubleshooting

**Problem:** All gates show NOT_APPLICABLE
- **Solution:** Ensure sprint has required data (code artifacts, prompt, etc.)

**Problem:** Reproducibility gate fails
- **Solution:** Run consistency tests and provide results in context

**Problem:** Hallucination gate shows warnings without explicit checks
- **Solution:** Provide hallucinationChecks array with API verifications

**Problem:** Low acceptance score despite no failures
- **Solution:** Check WARN statuses and address remediation steps

---

## Best Practices

1. ✅ **Run gates early** - Validate prompts before generating code
2. ✅ **Test consistency** - Always run 3+ test iterations
3. ✅ **Document thoroughly** - Explain reasoning, not just actions
4. ✅ **Verify APIs** - Check all external dependencies
5. ✅ **Keep it simple** - Follow Vibe Coder standards
6. ✅ **Iterate quickly** - Address failures in next sprint
7. ✅ **Track progress** - Monitor scores across sprints

---

## Related Documentation

- Full Guide: [docs/AGILE_GATES.md](../docs/AGILE_GATES.md)
- Configuration: [examples/agile-gates.json](../examples/agile-gates.json)
- Type Definitions: [src/quality/agileTypes.ts](../src/quality/agileTypes.ts)
- Gate Implementation: [src/quality/agileGates.ts](../src/quality/agileGates.ts)
- Sprint Engine: [src/quality/sprintEngine.ts](../src/quality/sprintEngine.ts)
