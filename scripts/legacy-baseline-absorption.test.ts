import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRAYER_GUIDE_COUNTS,
  PRAYER_GUIDE_PROVENANCE,
  PRAYER_GUIDE_STEPS,
} from "../client/src/data/prayerGuideData";
import {
  ISLAMIC_KNOWLEDGE_COUNTS,
  ISLAMIC_KNOWLEDGE_DATA,
  ISLAMIC_KNOWLEDGE_PENDING_REVIEW,
} from "../client/src/data/islamicKnowledgeData";
import {
  KIDS_STORIES,
  kidsAdaptationPosition,
  kidsAdaptationSources,
  kidsReviewStatusLabel,
} from "../client/src/visual-golden/services/kids";
import { childrenAdaptationRegistry } from "../shared/knowledge-registry";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("the legacy prayer guide survives as a labelled, source-honest canonical module", () => {
  assert.equal(PRAYER_GUIDE_STEPS.length, 10);
  assert.equal(PRAYER_GUIDE_COUNTS.steps, 10);
  assert.equal(PRAYER_GUIDE_COUNTS.pendingReview, 10);
  assert.equal(new Set(PRAYER_GUIDE_STEPS.map((step) => step.id)).size, 10);
  assert.deepEqual(
    PRAYER_GUIDE_STEPS.map((step) => step.order),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.ok(PRAYER_GUIDE_STEPS.every((step) => step.reviewStatus === "pending_review"));
  assert.ok(PRAYER_GUIDE_STEPS.every((step) => step.sourceId.length > 0));
  assert.ok(PRAYER_GUIDE_STEPS.every((step) => step.title.length > 0 && step.description.length > 0));
  assert.ok(PRAYER_GUIDE_PROVENANCE.origin.includes("legacy baseline"));
  assert.ok(PRAYER_GUIDE_PROVENANCE.note.length > 20);
});

test("legacy knowledge drafts stay pending review and never count as published", () => {
  assert.equal(ISLAMIC_KNOWLEDGE_DATA.length, 0);
  assert.equal(ISLAMIC_KNOWLEDGE_COUNTS.published, 0);
  assert.equal(ISLAMIC_KNOWLEDGE_PENDING_REVIEW.length, 2);
  assert.equal(ISLAMIC_KNOWLEDGE_COUNTS.pendingReview, 2);
  for (const item of ISLAMIC_KNOWLEDGE_PENDING_REVIEW) {
    assert.equal(item.reviewStatus, "pending_review");
    assert.deepEqual(item.sourceIds, []);
    assert.ok(item.content.length > 40);
    assert.ok(item.reviewNote.length > 20);
  }
});

test("every kids adaptation resolves to a visible, checkable source title", () => {
  assert.equal(KIDS_STORIES.length, childrenAdaptationRegistry.length);
  for (const story of KIDS_STORIES) {
    const sources = kidsAdaptationSources(story);
    assert.equal(sources.length, story.sourceIds.length);
    for (const source of sources) {
      assert.ok(source.sourceId.length > 0);
      assert.ok(source.titleAr.length > 0);
      assert.ok(source.titleAr !== source.sourceId, `source ${source.sourceId} has no readable title`);
    }
    const position = kidsAdaptationPosition(story.adaptationId);
    assert.equal(position.total, KIDS_STORIES.length);
    assert.ok(position.index >= 0);
  }
});

test("kids review statuses render as honest Arabic labels", () => {
  assert.equal(kidsReviewStatusLabel("editorial_review_pending"), "مراجعة تحريرية معلّقة");
  assert.equal(kidsReviewStatusLabel("scholarly_review_pending"), "مراجعة علمية معلّقة");
  assert.equal(kidsReviewStatusLabel("draft"), "مسودة");
  assert.equal(kidsReviewStatusLabel(undefined), "قيد المراجعة");
});

test("the retired legacy duplicate folders are gone from the tracked tree", () => {
  assert.equal(existsSync(resolve(root, "UPDATED_FILES")), false);
  assert.equal(existsSync(resolve(root, "client/src/pages/ChildrenTVPage.tsx")), false);
});
