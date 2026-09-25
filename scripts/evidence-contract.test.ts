import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerPolicyRegistry } from "../shared/knowledge-registry";
import { sourceRegistry } from "../shared/source-registry";
import { rightsDecisionSchema, editorialStatusSchema } from "../shared/source-governance";
import {
  EVIDENCE_ALIAS_PRECEDENCE,
  EVIDENCE_CONTRACT_FACTS,
  EVIDENCE_FIELD_ALIASES,
  EVIDENCE_STATUSES,
  EVIDENCE_UNREGISTERED_LABEL,
  PROVIDER_RIGHTS_STATE_LABELS,
  RIGHTS_DECISION_LABELS,
  VOCABULARY_COLLISIONS,
  evidenceRecordFromRegistryEntry,
  evidenceStatusSchema,
  normalizeEvidence,
  type EvidenceStatus,
} from "../shared/evidence-contract";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const evidenceDrawer = read("client/src/components/Institution/EvidenceDrawer.tsx");
const sourceDrawer = read("client/src/components/common/SourceDrawer.tsx");
const sourcesPage = read("client/src/pages/SourcesPage.tsx");

const LEGACY_DRAWER_STATUSES: EvidenceStatus[] = [
  "verified",
  "multiple_sourced",
  "historically_approximate",
  "disputed",
  "editorial_review_pending",
  "scholarly_consensus",
];

describe("evidence contract is the single vocabulary", () => {
  it("keeps every status the drawers used before", () => {
    for (const status of LEGACY_DRAWER_STATUSES) {
      assert.ok(EVIDENCE_STATUSES[status], `unification dropped status ${status}`);
      assert.ok(evidenceStatusSchema.options.includes(status), `${status} left the schema`);
    }
  });

  it("maps every status that has a registry equivalent, and declares the rest", () => {
    const registryStatuses = new Set(sourceRegistry.map((entry) => entry.editorialStatus));
    for (const status of registryStatuses) {
      assert.ok(
        evidenceStatusSchema.options.includes(status),
        `registry status ${status} has no evidence status`,
      );
    }
    for (const definition of Object.values(EVIDENCE_STATUSES)) {
      if (definition.registryStatus === null) continue;
      assert.ok(
        editorialStatusSchema.options.includes(definition.registryStatus),
        `${definition.id} points at a registry status outside the governance schema`,
      );
    }
    const statesWithoutRegistryUse = Object.values(EVIDENCE_STATUSES).filter(
      (definition) => !registryStatuses.has(definition.registryStatus as never),
    );
    assert.ok(
      statesWithoutRegistryUse.length > 0,
      "drawer states with no registry entry in use must stay declared rather than implied",
    );
  });

  it("gives each status one unique label, in both languages", () => {
    const labelsAr = Object.values(EVIDENCE_STATUSES).map((status) => status.labelAr);
    const labelsEn = Object.values(EVIDENCE_STATUSES).map((status) => status.labelEn);
    assert.equal(new Set(labelsAr).size, labelsAr.length, "two statuses share an Arabic label");
    assert.equal(new Set(labelsEn).size, labelsEn.length, "two statuses share an English label");
    for (const status of Object.values(EVIDENCE_STATUSES)) {
      assert.equal(status.id in EVIDENCE_STATUSES, true);
      assert.ok(status.labelAr.length > 3 && status.labelEn.length > 3);
    }
  });

  it("labels every RightsDecision and every provider rights state", () => {
    for (const decision of rightsDecisionSchema.options) {
      assert.ok(RIGHTS_DECISION_LABELS[decision], `missing rights decision label ${decision}`);
    }
    const states = new Set(providerPolicyRegistry.map((policy) => policy.rightsState));
    for (const state of states) {
      assert.ok(
        PROVIDER_RIGHTS_STATE_LABELS[state],
        `provider rights state ${state} has no label of its own`,
      );
    }
    assert.equal(
      Object.keys(RIGHTS_DECISION_LABELS).length,
      rightsDecisionSchema.options.length,
      "the rights table must not carry values outside RightsDecision",
    );
  });

  it("declares the cross-vocabulary collision instead of merging it", () => {
    const overlap = Object.keys(RIGHTS_DECISION_LABELS).filter((value) =>
      Object.hasOwn(PROVIDER_RIGHTS_STATE_LABELS, value),
    );
    assert.ok(overlap.length > 0, "expected at least one value shared by both vocabularies");
    for (const value of overlap) {
      assert.ok(
        VOCABULARY_COLLISIONS.some((collision) => collision.value === value),
        `shared value ${value} is not declared as a collision`,
      );
      assert.notEqual(
        RIGHTS_DECISION_LABELS[value as keyof typeof RIGHTS_DECISION_LABELS].labelAr,
        PROVIDER_RIGHTS_STATE_LABELS[value].labelAr,
        `${value} means different things in the two vocabularies and must read differently`,
      );
    }
  });

  it("leaves no duplicated label table in the consumers", () => {
    for (const [name, source] of [
      ["EvidenceDrawer", evidenceDrawer],
      ["SourceDrawer", sourceDrawer],
      ["SourcesPage", sourcesPage],
    ] as const) {
      assert.equal(
        /const (STATUS_CONFIG|RIGHTS_LABELS)\b/.test(source),
        false,
        `${name} still defines its own status/rights table`,
      );
      assert.match(source, /@shared\/evidence-contract/, `${name} does not use the contract`);
    }
    assert.equal(/labelAr: "توثيق معتمد"/.test(sourceDrawer), false);
    assert.equal(/RightsDecision, string> = \{/.test(sourceDrawer), false);
  });
});

describe("evidence records normalize without inventing values", () => {
  it("maps every documented alias", () => {
    const record = normalizeEvidence({
      title: "أثر",
      collectionOrWork: "المصنف",
      bookNameAr: "الكتاب",
      authorOrCompiler: "المؤلف",
      compilerAr: "المحقق",
      textAr: "النص الأصلي",
      hadithGrade: "حسن",
      status: "scholarly_consensus",
    });
    assert.equal(record.container, "الكتاب", "the more specific alias must win");
    assert.equal(record.author, "المحقق");
    assert.equal(record.originalText, "النص الأصلي", "an alias must fill an empty canonical field");
    assert.equal(record.grade, "حسن");
    assert.equal(record.status, "scholarly_consensus");
  });

  it("uses an alias only when the canonical field is absent", () => {
    assert.equal(
      normalizeEvidence({ title: "x", chapterNameAr: "الفصل" }).chapter,
      "الفصل",
      "an alias must still be read when the canonical field is missing",
    );
    assert.equal(
      normalizeEvidence({ title: "x", chapter: "الباب", chapterNameAr: "الفصل" }).chapter,
      "الباب",
      "an explicit canonical field outranks a legacy alias",
    );
    assert.equal(
      normalizeEvidence({ title: "x", originalText: "النص", textAr: "النص الأصلي" })
        .originalText,
      "النص",
      "normalization must never overwrite a value given under the canonical name",
    );
    assert.equal(
      normalizeEvidence({ title: "x", translationExcerpt: "excerpt", textEn: "the text" })
        .translationExcerpt,
      "excerpt",
    );
    assert.equal(
      normalizeEvidence({ title: "x", textEn: "the text" }).translationExcerpt,
      "the text",
    );
    assert.equal(normalizeEvidence({ title: "x", referenceNumber: "٤٣٢" }).reference, "٤٣٢");
  });

  it("keeps explicit fields ahead of aliases", () => {
    const record = normalizeEvidence({ title: "x", container: "صريح", collectionOrWork: "بديل" });
    assert.equal(record.container, "صريح");
  });

  it("returns null for absent fields instead of empty strings", () => {
    const record = normalizeEvidence({ title: "أثر" });
    for (const field of [
      "container",
      "author",
      "reference",
      "chapter",
      "originalText",
      "translationExcerpt",
      "grade",
      "reviewNote",
      "uncertaintyNote",
      "sourceRegistryId",
      "provenanceDataset",
      "allowedUsageLabel",
      "rightsCheckedAt",
      "sourceUrl",
    ] as const) {
      assert.equal(record[field], null, `${field} must stay null when not provided`);
    }
    assert.equal(record.rightsDecision, null);
  });

  it("never upgrades an unknown or missing status", () => {
    assert.equal(normalizeEvidence({ title: "x" }).status, "editorial_review_pending");
    assert.equal(
      normalizeEvidence({ title: "x", status: "totally_made_up" as never }).status,
      "editorial_review_pending",
    );
  });

  it("drops a rights decision that is not a RightsDecision", () => {
    assert.equal(
      normalizeEvidence({ title: "x", rightsDecision: "item_by_item_review" as never })
        .rightsDecision,
      null,
      "a provider rights state must not be smuggled in as a RightsDecision",
    );
    assert.equal(normalizeEvidence({ title: "x", rightsDecision: "api_only" }).rightsDecision, "api_only");
  });

  it("labels an empty title as unregistered rather than blank", () => {
    assert.equal(normalizeEvidence({ title: "   " }).title, EVIDENCE_UNREGISTERED_LABEL);
  });

  it("builds records from real registry entries without guessing", () => {
    for (const entry of sourceRegistry) {
      const record = evidenceRecordFromRegistryEntry(entry);
      assert.equal(record.sourceRegistryId, entry.sourceId);
      assert.equal(record.container, entry.provider);
      assert.equal(record.reviewNote, entry.notes);
      assert.equal(record.rightsCheckedAt, entry.checkedAt);
      assert.equal(record.sourceUrl, entry.canonicalUrl, "an absent URL must stay null");
      assert.equal(record.status, entry.editorialStatus);
    }
  });

  it("documents its own facts consistently", () => {
    assert.equal(EVIDENCE_CONTRACT_FACTS.statuses, Object.keys(EVIDENCE_STATUSES).length);
    assert.equal(EVIDENCE_CONTRACT_FACTS.rightsDecisions, rightsDecisionSchema.options.length);
    assert.equal(
      EVIDENCE_CONTRACT_FACTS.fieldAliases,
      Object.keys(EVIDENCE_FIELD_ALIASES).length,
    );
    assert.equal(
      EVIDENCE_CONTRACT_FACTS.fieldAliases,
      Object.values(EVIDENCE_ALIAS_PRECEDENCE).flat().length,
      "the flat alias map must be derived from the precedence lists",
    );
    assert.equal(
      new Set(Object.values(EVIDENCE_ALIAS_PRECEDENCE).flat()).size,
      EVIDENCE_CONTRACT_FACTS.fieldAliases,
      "an alias may not appear in two precedence lists",
    );
    assert.ok(EVIDENCE_CONTRACT_FACTS.declaredCollisions >= 1);
  });
});
