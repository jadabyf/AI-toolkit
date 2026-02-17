import fs from "fs";
import { z } from "zod";
import { SiteType, Thresholds } from "./types";

const thresholdsSchema = z.object({
  passScore: z.number().min(0).max(100),
  warnScore: z.number().min(0).max(100)
});

const ruleOverrideSchema = z.object({
  enabled: z.boolean().optional(),
  params: z.record(z.unknown()).optional()
});

const ruleOverridesSchema = z.record(ruleOverrideSchema);

const siteTypeSchema = z.object({
  thresholds: thresholdsSchema.optional(),
  rules: ruleOverridesSchema.optional()
});

export const gateConfigSchema = z.object({
  defaults: z
    .object({
      thresholds: thresholdsSchema.optional(),
      rules: ruleOverridesSchema.optional()
    })
    .optional(),
  siteTypes: z.record(siteTypeSchema).optional()
});

export type GateConfig = z.infer<typeof gateConfigSchema>;

export function loadGateConfig(filePath?: string): GateConfig | undefined {
  if (!filePath) {
    return undefined;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const result = gateConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid gate config: ${result.error.message}`);
  }
  return result.data;
}

export function resolveThresholds(
  siteType: SiteType,
  config: GateConfig | undefined,
  defaultThresholds: Thresholds
): Thresholds {
  const defaults = config?.defaults?.thresholds;
  const siteSpecific = config?.siteTypes?.[siteType]?.thresholds;
  return {
    passScore: siteSpecific?.passScore ?? defaults?.passScore ?? defaultThresholds.passScore,
    warnScore: siteSpecific?.warnScore ?? defaults?.warnScore ?? defaultThresholds.warnScore
  };
}

export function resolveRuleConfig(
  ruleId: string,
  siteType: SiteType,
  config: GateConfig | undefined,
  defaultParams: Record<string, unknown> | undefined
): { enabled: boolean; params: Record<string, unknown> } {
  const defaults = config?.defaults?.rules?.[ruleId];
  const siteSpecific = config?.siteTypes?.[siteType]?.rules?.[ruleId];
  const enabled = siteSpecific?.enabled ?? defaults?.enabled ?? true;
  const params = {
    ...(defaultParams ?? {}),
    ...(defaults?.params ?? {}),
    ...(siteSpecific?.params ?? {})
  };
  return { enabled, params };
}
