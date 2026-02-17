import { DesignStyle, getDesignStyle, DESIGN_STYLES } from "../designStyles";
import { Evidence, Rule, RuleResult } from "../types";

function result(
  status: RuleResult["status"],
  scoreDelta: number,
  explanation: string,
  evidence: Evidence[],
  remediation: string[]
): RuleResult {
  return { status, scoreDelta, explanation, evidence, remediation };
}

/**
 * Extract design-related metrics from page content
 * In a real implementation, this would parse CSS/HTML
 * For now, we simulate with heuristics from extracted text
 */
interface DesignMetrics {
  fontFamilies: string[];
  fontSizes: number[];
  spacingValues: number[];
  colorCount: number;
  hasGrid: boolean;
  whitespaceRatio: number;
}

function extractDesignMetrics(context: any): DesignMetrics {
  // In a real implementation, this would parse actual CSS/HTML
  // For now, return reasonable defaults that can be overridden via ruleParams
  const pageText = context.pages.map((p: any) => p.extractedText).join(" ");
  
  return {
    fontFamilies: context.ruleParams.fontFamilies || ["Arial", "Helvetica"],
    fontSizes: context.ruleParams.fontSizes || [14, 16, 18, 24, 32],
    spacingValues: context.ruleParams.spacingValues || [8, 16, 24, 32, 48],
    colorCount: context.ruleParams.colorCount || 5,
    hasGrid: context.ruleParams.hasGrid !== false,
    whitespaceRatio: context.ruleParams.whitespaceRatio || 35
  };
}

/**
 * Get all design style quality gates
 */
export function getDesignStyleRules(): Rule[] {
  const rules: Rule[] = [];

  // Add rules for each design style
  const styles = Object.keys(DESIGN_STYLES) as DesignStyle[];
  
  styles.forEach((style) => {
    const styleDefinition = getDesignStyle(style);
    
    // Typography consistency rule
    rules.push({
      id: `design.${style}.typography`,
      title: `${styleDefinition.name}: Typography consistency`,
      description: `Ensure typography matches ${styleDefinition.name} standards`,
      severity: "high",
      appliesTo: (siteType) => {
        return siteType === "general" || siteType.includes(style);
      },
      evaluate: (context) => {
        const targetStyle = context.ruleParams.designStyle as DesignStyle;
        if (!targetStyle || targetStyle !== style) {
          return result("PASS", 0, "Not using this design style.", [], []);
        }

        const metrics = extractDesignMetrics(context);
        const typo = styleDefinition.typography;
        const issues: string[] = [];
        const evidence: Evidence[] = [];

        // Check font family count
        if (metrics.fontFamilies.length > typo.maxFontFamilies) {
          issues.push(
            `Too many font families: ${metrics.fontFamilies.length} (max ${typo.maxFontFamilies})`
          );
          evidence.push({
            type: "page",
            note: `Found ${metrics.fontFamilies.length} font families: ${metrics.fontFamilies.join(", ")}`
          });
        }

        // Check font sizes count
        if (metrics.fontSizes.length > typo.maxFontSizes) {
          issues.push(
            `Too many font sizes: ${metrics.fontSizes.length} (max ${typo.maxFontSizes})`
          );
          evidence.push({
            type: "page",
            note: `Found ${metrics.fontSizes.length} distinct font sizes`
          });
        }

        // Check font size range
        const minSize = Math.min(...metrics.fontSizes);
        const maxSize = Math.max(...metrics.fontSizes);
        if (minSize < typo.minFontSizePx) {
          issues.push(`Font size too small: ${minSize}px (min ${typo.minFontSizePx}px)`);
        }
        if (maxSize > typo.maxFontSizePx) {
          issues.push(`Font size too large: ${maxSize}px (max ${typo.maxFontSizePx}px)`);
        }

        if (issues.length === 0) {
          return result(
            "PASS",
            0,
            `Typography follows ${styleDefinition.name} standards.`,
            [],
            []
          );
        }

        const remediation = [
          `Limit font families to ${typo.maxFontFamilies}`,
          `Limit font sizes to ${typo.maxFontSizes} distinct values`,
          `Keep font sizes between ${typo.minFontSizePx}px and ${typo.maxFontSizePx}px`,
          typo.preferredFonts
            ? `Use preferred fonts: ${typo.preferredFonts.join(", ")}`
            : ""
        ].filter(Boolean);

        const severity = issues.length >= 3 ? "FAIL" : "WARN";
        const scoreDelta = issues.length >= 3 ? -20 : -10;

        return result(
          severity,
          scoreDelta,
          `Typography issues: ${issues.join("; ")}`,
          evidence,
          remediation
        );
      }
    });

    // Spacing consistency rule
    rules.push({
      id: `design.${style}.spacing`,
      title: `${styleDefinition.name}: Spacing consistency`,
      description: `Ensure spacing follows ${styleDefinition.name} standards`,
      severity: "high",
      appliesTo: (siteType) => {
        return siteType === "general" || siteType.includes(style);
      },
      evaluate: (context) => {
        const targetStyle = context.ruleParams.designStyle as DesignStyle;
        if (!targetStyle || targetStyle !== style) {
          return result("PASS", 0, "Not using this design style.", [], []);
        }

        const metrics = extractDesignMetrics(context);
        const spacing = styleDefinition.spacing;
        const issues: string[] = [];
        const evidence: Evidence[] = [];

        // Check spacing scale consistency
        if (spacing.useConsistentScale) {
          const expectedValues = spacing.scaleMultipliers.map(
            (m) => spacing.baseUnit * m
          );
          const unexpectedSpacing = metrics.spacingValues.filter(
            (val) => !expectedValues.includes(val)
          );

          if (unexpectedSpacing.length > 0) {
            issues.push(
              `Inconsistent spacing values found: ${unexpectedSpacing.join(", ")}px`
            );
            evidence.push({
              type: "page",
              note: `Expected spacing based on ${spacing.baseUnit}px base unit with multipliers`
            });
          }
        }

        // Check spacing variations
        if (metrics.spacingValues.length > spacing.maxSpacingVariations) {
          issues.push(
            `Too many spacing variations: ${metrics.spacingValues.length} (max ${spacing.maxSpacingVariations})`
          );
          evidence.push({
            type: "page",
            note: `Found spacing values: ${metrics.spacingValues.join(", ")}px`
          });
        }

        if (issues.length === 0) {
          return result(
            "PASS",
            0,
            `Spacing follows ${styleDefinition.name} standards.`,
            [],
            []
          );
        }

        const remediation = [
          `Use ${spacing.baseUnit}px as base spacing unit`,
          `Apply consistent scale with multipliers: ${spacing.scaleMultipliers.join(", ")}`,
          `Limit spacing variations to ${spacing.maxSpacingVariations} values`,
          spacing.gridSize ? `Align to ${spacing.gridSize}-column grid` : ""
        ].filter(Boolean);

        const severity = spacing.gapConsistency === "strict" && issues.length > 0 ? "FAIL" : "WARN";
        const scoreDelta = severity === "FAIL" ? -20 : -10;

        return result(
          severity,
          scoreDelta,
          `Spacing issues: ${issues.join("; ")}`,
          evidence,
          remediation
        );
      }
    });

    // Color palette rule
    rules.push({
      id: `design.${style}.color`,
      title: `${styleDefinition.name}: Color palette`,
      description: `Ensure color usage matches ${styleDefinition.name} standards`,
      severity: "med",
      appliesTo: (siteType) => {
        return siteType === "general" || siteType.includes(style);
      },
      evaluate: (context) => {
        const targetStyle = context.ruleParams.designStyle as DesignStyle;
        if (!targetStyle || targetStyle !== style) {
          return result("PASS", 0, "Not using this design style.", [], []);
        }

        const metrics = extractDesignMetrics(context);
        const color = styleDefinition.color;
        const issues: string[] = [];

        // Check color count
        if (metrics.colorCount > color.maxColors) {
          issues.push(
            `Too many colors: ${metrics.colorCount} (max ${color.maxColors})`
          );
        }

        if (issues.length === 0) {
          return result(
            "PASS",
            0,
            `Color palette follows ${styleDefinition.name} standards.`,
            [],
            []
          );
        }

        const remediation = [
          `Limit color palette to ${color.maxColors} colors`,
          `Use ${color.primaryColorCount} primary color(s)`,
          `Use ${color.accentColorCount} accent color(s)`,
          color.monochromaticOnly ? "Use monochromatic color scheme" : "",
          `Ensure WCAG ${color.contrastRatio}:1 contrast ratio`
        ].filter(Boolean);

        return result(
          "WARN",
          -8,
          `Color palette issues: ${issues.join("; ")}`,
          [],
          remediation
        );
      }
    });

    // Layout structure rule
    rules.push({
      id: `design.${style}.layout`,
      title: `${styleDefinition.name}: Layout structure`,
      description: `Ensure layout matches ${styleDefinition.name} standards`,
      severity: "med",
      appliesTo: (siteType) => {
        return siteType === "general" || siteType.includes(style);
      },
      evaluate: (context) => {
        const targetStyle = context.ruleParams.designStyle as DesignStyle;
        if (!targetStyle || targetStyle !== style) {
          return result("PASS", 0, "Not using this design style.", [], []);
        }

        const metrics = extractDesignMetrics(context);
        const layout = styleDefinition.layout;
        const issues: string[] = [];

        // Check grid usage
        if (layout.useGrid && !metrics.hasGrid) {
          issues.push("Layout should use grid system");
        }

        // Check whitespace ratio
        const whitespaceDiff = Math.abs(metrics.whitespaceRatio - layout.whitespaceRatio);
        if (whitespaceDiff > 15) {
          issues.push(
            `Whitespace ratio ${metrics.whitespaceRatio}% differs from target ${layout.whitespaceRatio}%`
          );
        }

        if (issues.length === 0) {
          return result(
            "PASS",
            0,
            `Layout follows ${styleDefinition.name} standards.`,
            [],
            []
          );
        }

        const remediation = [
          layout.useGrid
            ? `Use ${layout.gridColumns}-column grid system`
            : "Avoid rigid grid systems",
          `Target ${layout.whitespaceRatio}% whitespace ratio`,
          `Apply ${layout.symmetry} symmetry`,
          `Use ${layout.alignment} alignment`
        ];

        return result(
          "WARN",
          -8,
          `Layout issues: ${issues.join("; ")}`,
          [],
          remediation
        );
      }
    });

    // Style characteristics rule
    rules.push({
      id: `design.${style}.characteristics`,
      title: `${styleDefinition.name}: Design characteristics`,
      description: `Ensure key characteristics of ${styleDefinition.name} are present`,
      severity: "low",
      appliesTo: (siteType) => {
        return siteType === "general" || siteType.includes(style);
      },
      evaluate: (context) => {
        const targetStyle = context.ruleParams.designStyle as DesignStyle;
        if (!targetStyle || targetStyle !== style) {
          return result("PASS", 0, "Not using this design style.", [], []);
        }

        // This is an informational rule
        return result(
          "PASS",
          0,
          `${styleDefinition.name} key characteristics to maintain`,
          [],
          styleDefinition.characteristics
        );
      }
    });
  });

  // Add a general design consistency rule
  rules.push({
    id: "design.general.consistency",
    title: "General design consistency",
    description: "Ensure overall design consistency across the site",
    severity: "high",
    appliesTo: () => true,
    evaluate: (context) => {
      const metrics = extractDesignMetrics(context);
      const issues: string[] = [];
      const evidence: Evidence[] = [];

      // Check for reasonable font family limit (general best practice)
      if (metrics.fontFamilies.length > 3) {
        issues.push(
          `Too many font families for consistency: ${metrics.fontFamilies.length}`
        );
        evidence.push({
          type: "page",
          note: `Font families: ${metrics.fontFamilies.join(", ")}`
        });
      }

      // Check for reasonable font size limit
      if (metrics.fontSizes.length > 8) {
        issues.push(
          `Too many font sizes for consistency: ${metrics.fontSizes.length}`
        );
        evidence.push({
          type: "page",
          note: `${metrics.fontSizes.length} distinct font sizes found`
        });
      }

      // Check for spacing consistency
      if (metrics.spacingValues.length > 12) {
        issues.push(
          `Too many spacing variations: ${metrics.spacingValues.length}`
        );
        evidence.push({
          type: "page",
          note: "Consider using a consistent spacing scale"
        });
      }

      if (issues.length === 0) {
        return result(
          "PASS",
          0,
          "Design shows good consistency across elements.",
          [],
          []
        );
      }

      const remediation = [
        "Limit font families to 2-3 maximum",
        "Use a consistent type scale (6-8 sizes maximum)",
        "Apply a consistent spacing scale (8px or 4px base unit)",
        "Maintain consistent color palette throughout",
        "Use design tokens or CSS variables for consistency"
      ];

      const severity = issues.length >= 2 ? "FAIL" : "WARN";
      const scoreDelta = issues.length >= 2 ? -15 : -8;

      return result(
        severity,
        scoreDelta,
        `Design consistency issues: ${issues.join("; ")}`,
        evidence,
        remediation
      );
    }
  });

  return rules;
}
