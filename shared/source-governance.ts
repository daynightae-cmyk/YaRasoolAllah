import { z } from "zod";

export const sourceKindSchema = z.enum([
  "primary_text",
  "translation",
  "commentary",
  "hadith",
  "bibliography",
  "catalog_metadata",
  "audio_recording",
  "geodata",
  "font",
  "internal_development_sample",
]);

export const editorialStatusSchema = z.enum([
  "verified",
  "editorial_review_pending",
  "rights_review_pending",
  "blocked",
]);

export const rightsDecisionSchema = z.enum([
  "cleared",
  "api_only",
  "reference_only",
  "development_only",
  "needs_review",
  "blocked",
]);

export const permissionValueSchema = z.enum(["allowed", "forbidden", "unknown"]);

export const usageTypeSchema = z.enum([
  "api_access",
  "cache",
  "streaming",
  "catalog_metadata",
  "external_link",
  "full_text",
  "offline_bundle",
  "redistribution",
  "commercial",
]);

export const acquisitionStatusSchema = z.enum([
  "candidate",
  "registered",
  "acquired_immutable",
  "rejected",
]);

export const sourceRegistryEntrySchema = z.object({
  sourceId: z.string().min(1),
  title: z.string().min(1),
  provider: z.string().min(1),
  kind: sourceKindSchema,
  canonicalUrl: z.string().url().nullable(),
  version: z.string().nullable(),
  artifactSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  checkedAt: z.string().datetime({ offset: true }),
  editorialStatus: editorialStatusSchema,
  notes: z.string().min(1),
});

export const rightsLedgerEntrySchema = z.object({
  rightsId: z.string().min(1),
  sourceId: z.string().min(1),
  decision: rightsDecisionSchema,
  licenseName: z.string().nullable(),
  licenseUrl: z.string().url().nullable(),
  termsSnapshotPath: z.string().nullable(),
  attribution: z.string().nullable(),
  permissions: z.object({
    apiAccess: permissionValueSchema,
    caching: permissionValueSchema,
    streaming: permissionValueSchema,
    offline: permissionValueSchema,
    redistribution: permissionValueSchema,
    commercial: permissionValueSchema,
  }),
  checkedAt: z.string().datetime({ offset: true }),
  reviewNote: z.string().min(1),
});

export const providerResourceEntrySchema = z.object({
  resourceId: z.string().min(1),
  sourceId: z.string().min(1),
  rightsId: z.string().min(1),
  provider: z.string().min(1),
  resourceType: z.enum(["file", "api", "catalog", "local_sample"]),
  endpoint: z.string().url().nullable(),
  acquisitionStatus: acquisitionStatusSchema,
  credentialsRequired: z.boolean(),
  credentialsConfigured: z.boolean(),
  allowedUsages: z.array(usageTypeSchema),
  productionReady: z.boolean(),
});

export type SourceRegistryEntry = z.infer<typeof sourceRegistryEntrySchema>;
export type RightsLedgerEntry = z.infer<typeof rightsLedgerEntrySchema>;
export type ProviderResourceEntry = z.infer<typeof providerResourceEntrySchema>;
export type UsageType = z.infer<typeof usageTypeSchema>;
export type RightsDecision = z.infer<typeof rightsDecisionSchema>;

const permissionByUsage: Partial<
  Record<UsageType, keyof RightsLedgerEntry["permissions"]>
> = {
  api_access: "apiAccess",
  cache: "caching",
  streaming: "streaming",
  offline_bundle: "offline",
  redistribution: "redistribution",
  commercial: "commercial",
};

export interface UsageGateResult {
  allowed: boolean;
  reason: string;
}

export function evaluateResourceUsage(
  resource: ProviderResourceEntry,
  rights: RightsLedgerEntry,
  usage: UsageType,
  environment: "development" | "production",
): UsageGateResult {
  if (resource.rightsId !== rights.rightsId || resource.sourceId !== rights.sourceId) {
    return { allowed: false, reason: "السجل والحق لا يشيران إلى المورد نفسه." };
  }

  if (!resource.allowedUsages.includes(usage)) {
    return { allowed: false, reason: "نوع الاستخدام غير مسجل ضمن الاستخدامات المسموح بها." };
  }

  if (resource.credentialsRequired && !resource.credentialsConfigured) {
    return { allowed: false, reason: "بيانات اعتماد المزوّد غير مهيأة على الخادم." };
  }

  if (rights.decision === "blocked" || rights.decision === "needs_review") {
    return { allowed: false, reason: "قرار الحقوق لا يسمح بالاستخدام قبل اكتمال المراجعة." };
  }

  if (rights.decision === "development_only" && environment !== "development") {
    return { allowed: false, reason: "هذا المورد عينة تطوير ولا يجوز استخدامه في الإنتاج." };
  }

  if (
    rights.decision === "api_only" &&
    !(["api_access", "cache", "streaming"] as UsageType[]).includes(usage)
  ) {
    return { allowed: false, reason: "هذا المورد مرخص للاستهلاك عبر API فقط." };
  }

  if (
    rights.decision === "reference_only" &&
    !(["catalog_metadata", "external_link"] as UsageType[]).includes(usage)
  ) {
    return { allowed: false, reason: "هذا المورد مرجعي/فهرسي ولا يجيز عرض النص أو تنزيله." };
  }

  const permissionKey = permissionByUsage[usage];
  if (permissionKey && rights.permissions[permissionKey] !== "allowed") {
    return {
      allowed: false,
      reason: `إذن ${permissionKey} ليس مسجلاً كإذن صريح.`,
    };
  }

  if (environment === "production" && !resource.productionReady) {
    return { allowed: false, reason: "المورد غير معتمد للإنتاج." };
  }

  return { allowed: true, reason: "الاستخدام متوافق مع سجل الحقوق الحالي." };
}
