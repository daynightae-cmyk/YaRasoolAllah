import { z } from "zod";
import {
  rightsDecisionSchema,
  sourceRegistryEntrySchema,
  type RightsDecision,
  type SourceRegistryEntry,
} from "./source-governance.js";

/**
 * Single semantic contract for every "where did this come from" surface.
 *
 * Before this file the same concepts were spelled three different ways:
 *   - `EvidenceDrawer.STATUS_CONFIG` (5 statuses) labelled `verified` as "توثيق معتمد"
 *   - `SourceDrawer.STATUS_CONFIG`  (6 statuses) labelled `verified` as "توثيق معتمد ومحقق"
 *   - `SourcesPage.reviewLabel`      (4 registry statuses) labelled it "تحقق محدد النطاق"
 *   - `EvidenceDrawer.RIGHTS_LABELS` (6 RightsDecision values) and
 *     `SourcesPage.rightsLabel`      (11 mixed values) labelled `cleared` differently
 *     and merged `RightsDecision` with `providerPolicyRegistry.rightsState`,
 *     where `api_only` exists in BOTH registries with different meanings.
 *
 * The tables below are the only place those words are defined. Every status
 * that existed before is preserved: unification removes duplication, it never
 * silently drops or upgrades a state.
 */

export const EVIDENCE_UNREGISTERED_LABEL = "غير مسجل";

export const evidenceStatusSchema = z.enum([
  "verified",
  "scholarly_consensus",
  "multiple_sourced",
  "historically_approximate",
  "disputed",
  "editorial_review_pending",
  "rights_review_pending",
  "blocked",
]);
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;

export interface EvidenceStatusDefinition {
  id: EvidenceStatus;
  labelAr: string;
  labelEn: string;
  /**
   * The `editorialStatusSchema` value this state corresponds to in the source
   * registry, or `null` when the state has no registry equivalent. Declared
   * explicitly so a drawer state is never mistaken for a registry clearance.
   */
  registryStatus: Extract<SourceRegistryEntry["editorialStatus"], string> | null;
}

export const EVIDENCE_STATUSES: Record<EvidenceStatus, EvidenceStatusDefinition> = {
  verified: {
    id: "verified",
    labelAr: "توثيق معتمد ومحقق",
    labelEn: "Directly Sourced & Verified",
    registryStatus: "verified",
  },
  scholarly_consensus: {
    id: "scholarly_consensus",
    labelAr: "إجماع الأئمة والمحققين",
    labelEn: "Scholarly Consensus",
    registryStatus: null,
  },
  multiple_sourced: {
    id: "multiple_sourced",
    labelAr: "روايات متعددة متطابقة",
    labelEn: "Multiple Sourced Reports",
    registryStatus: null,
  },
  historically_approximate: {
    id: "historically_approximate",
    labelAr: "تقريبي تاريخياً / جغرافياً",
    labelEn: "Historically Approximate",
    registryStatus: null,
  },
  disputed: {
    id: "disputed",
    labelAr: "محل خلاف بين المؤرخين",
    labelEn: "Disputed Among Sources",
    registryStatus: null,
  },
  editorial_review_pending: {
    id: "editorial_review_pending",
    labelAr: "قيد المراجعة التحريرية",
    labelEn: "Editorial Review Pending",
    registryStatus: "editorial_review_pending",
  },
  rights_review_pending: {
    id: "rights_review_pending",
    labelAr: "قيد مراجعة الحقوق",
    labelEn: "Rights Review Pending",
    registryStatus: "rights_review_pending",
  },
  blocked: {
    id: "blocked",
    labelAr: "محظور في السجل الحالي",
    labelEn: "Blocked In Current Registry",
    registryStatus: "blocked",
  },
};

/** Rights decisions on a governed source (`RightsDecision`). */
export const RIGHTS_DECISION_LABELS: Record<RightsDecision, { labelAr: string; labelEn: string }> = {
  cleared: { labelAr: "مسموح بسجل صريح", labelEn: "Explicitly Cleared" },
  api_only: { labelAr: "استخدام عبر API فقط", labelEn: "API Access Only" },
  reference_only: { labelAr: "فهرسة ورابط خارجي فقط", labelEn: "Reference / External Link Only" },
  development_only: { labelAr: "عينة تطوير فقط", labelEn: "Development Sample Only" },
  needs_review: { labelAr: "مراجعة الحقوق مطلوبة", labelEn: "Rights Review Required" },
  blocked: { labelAr: "الاستخدام محظور", labelEn: "Use Blocked" },
};

/**
 * Rights *state* of a provider policy (`providerPolicyRegistry.rightsState`).
 * Deliberately a separate table: `api_only` exists here AND in
 * `RightsDecision`, and they are not interchangeable.
 */
export const PROVIDER_RIGHTS_STATE_LABELS: Record<string, { labelAr: string; labelEn: string }> = {
  api_only: { labelAr: "محتوى المزوّد عبر API فقط", labelEn: "Provider Content via API Only" },
  cleared_with_attribution: { labelAr: "مسموح مع النسبة", labelEn: "Cleared With Attribution" },
  external_link_only: { labelAr: "رابط خارجي فقط", labelEn: "External Link Only" },
  needs_credential: { labelAr: "بيانات اعتماد مطلوبة", labelEn: "Credential Required" },
  needs_license_review: { labelAr: "مراجعة ترخيص مطلوبة", labelEn: "License Review Required" },
  item_by_item_review: { labelAr: "مراجعة كل عنصر", labelEn: "Item By Item Review" },
};

/** Known cross-vocabulary collisions, declared instead of silently merged. */
export const VOCABULARY_COLLISIONS: Array<{ value: string; left: string; right: string }> = [
  {
    value: "api_only",
    left: "RightsDecision (a decision about how a source may be used)",
    right: "providerPolicyRegistry.rightsState (a provider's content state)",
  },
];

export const evidenceRecordSchema = z.object({
  title: z.string().min(1),
  container: z.string().nullable(),
  author: z.string().nullable(),
  reference: z.string().nullable(),
  chapter: z.string().nullable(),
  originalText: z.string().nullable(),
  translationExcerpt: z.string().nullable(),
  status: evidenceStatusSchema,
  grade: z.string().nullable(),
  reviewNote: z.string().nullable(),
  uncertaintyNote: z.string().nullable(),
  sourceRegistryId: z.string().nullable(),
  provenanceDataset: z.string().nullable(),
  rightsDecision: rightsDecisionSchema.nullable(),
  allowedUsageLabel: z.string().nullable(),
  rightsCheckedAt: z.string().nullable(),
  sourceUrl: z.string().nullable(),
});
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;

/**
 * Every field alias that existed across the drawers, with an explicit
 * precedence per target: the first alias in a list wins. Precedence is data,
 * not object insertion order, so "which field is more specific" is reviewable.
 */
export const EVIDENCE_ALIAS_PRECEDENCE: Record<string, string[]> = {
  container: ["bookNameAr", "collectionNameAr", "collectionOrWork"],
  author: ["compilerAr", "authorOrCompiler"],
  reference: ["referenceNumber"],
  chapter: ["chapterNameAr", "chapter"],
  originalText: ["textAr", "originalText"],
  translationExcerpt: ["textEn", "translationExcerpt"],
  grade: ["hadithGrade", "grade"],
};

/** Flat view of the alias table, derived so the two can never disagree. */
export const EVIDENCE_FIELD_ALIASES: Record<string, keyof EvidenceRecord> = Object.fromEntries(
  Object.entries(EVIDENCE_ALIAS_PRECEDENCE).flatMap(([target, aliases]) =>
    aliases.map((alias) => [alias, target as keyof EvidenceRecord]),
  ),
);

function firstText(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return null;
}

export type EvidenceInput = Partial<{
  [K in keyof EvidenceRecord]: EvidenceRecord[K] | null;
}> & Record<string, unknown>;

/**
 * Normalizes any historical evidence shape into the one record. Absent fields
 * stay `null` so the UI must say "غير مسجل" instead of showing an empty or
 * invented value. A more specific alias never overwrites an explicit field.
 */
export function normalizeEvidence(input: EvidenceInput): EvidenceRecord {
  const aliasesFor = (target: keyof EvidenceRecord) =>
    (EVIDENCE_ALIAS_PRECEDENCE[target] ?? []).map((alias) => input[alias]);

  const pick = (target: keyof EvidenceRecord) =>
    firstText(input[target] as unknown, ...aliasesFor(target));

  const status = evidenceStatusSchema.safeParse(input.status);

  return evidenceRecordSchema.parse({
    title: firstText(input.title) ?? EVIDENCE_UNREGISTERED_LABEL,
    container: pick("container"),
    author: pick("author"),
    reference: firstText(input.reference as unknown, input.referenceNumber as unknown),
    chapter: pick("chapter"),
    originalText: pick("originalText"),
    translationExcerpt: pick("translationExcerpt"),
    status: status.success ? status.data : "editorial_review_pending",
    grade: pick("grade"),
    reviewNote: firstText(input.reviewNote as unknown, input.uncertaintyNote as unknown),
    uncertaintyNote: firstText(input.uncertaintyNote as unknown, input.reviewNote as unknown),
    sourceRegistryId: firstText(input.sourceRegistryId as unknown),
    provenanceDataset: firstText(input.provenanceDataset as unknown),
    rightsDecision: rightsDecisionSchema.safeParse(input.rightsDecision).success
      ? (input.rightsDecision as RightsDecision)
      : null,
    allowedUsageLabel: firstText(input.allowedUsageLabel as unknown),
    rightsCheckedAt: firstText(input.rightsCheckedAt as unknown),
    sourceUrl: firstText(input.sourceUrl as unknown),
  });
}

/**
 * Builds a record from a real registry entry. Fields the registry does not
 * carry (version, canonical URL, artifact hash) are never guessed: an absent
 * URL stays `null` rather than becoming a provider homepage.
 */
export function evidenceRecordFromRegistryEntry(entry: SourceRegistryEntry): EvidenceRecord {
  return normalizeEvidence({
    title: entry.title,
    container: entry.provider,
    status: entry.editorialStatus,
    sourceRegistryId: entry.sourceId,
    provenanceDataset: "shared/source-registry",
    sourceUrl: entry.canonicalUrl,
    reviewNote: entry.notes,
    rightsCheckedAt: entry.checkedAt,
  });
}

export const EVIDENCE_CONTRACT_FACTS = {
  statuses: Object.keys(EVIDENCE_STATUSES).length,
  rightsDecisions: Object.keys(RIGHTS_DECISION_LABELS).length,
  providerRightsStates: Object.keys(PROVIDER_RIGHTS_STATE_LABELS).length,
  fieldAliases: Object.keys(EVIDENCE_FIELD_ALIASES).length,
  aliasTargets: Object.keys(EVIDENCE_ALIAS_PRECEDENCE).length,
  declaredCollisions: VOCABULARY_COLLISIONS.length,
} as const;

export { sourceRegistryEntrySchema };
