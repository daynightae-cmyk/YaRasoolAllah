import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { art } from "../client/src/visual-golden/mock/art";
import { SEERAH_DATABASE } from "../client/src/data/seerah";
import {
  SEERAH_REVIEW_CHECKLIST_VERSION,
  SEERAH_REVIEW_POLICY,
  buildSeerahReviewChecklist,
  renderSeerahReviewSummary,
} from "../client/src/visual-golden/services/seerah-review";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const checklist = buildSeerahReviewChecklist();

describe("Seerah review checklist boundaries", () => {
  it("covers every database record exactly once", () => {
    const expected = [
      ...SEERAH_DATABASE.events.map((record) => `event:${record.id}`),
      ...SEERAH_DATABASE.people.map((record) => `person:${record.id}`),
      ...SEERAH_DATABASE.places.map((record) => `place:${record.id}`),
      ...SEERAH_DATABASE.sources.map((record) => `source:${record.id}`),
    ];
    const actual = checklist.records.map((record) => `${record.recordType}:${record.recordId}`);

    assert.equal(actual.length, expected.length);
    assert.equal(new Set(actual).size, actual.length, "duplicate checklist record");
    assert.deepEqual(new Set(actual), new Set(expected));

    assert.deepEqual(checklist.summary.records, {
      events: 101,
      people: 58,
      places: 32,
      sources: 15,
      total: 206,
    });
  });

  it("never signs, approves, or auto-fills a record", () => {
    assert.equal(SEERAH_REVIEW_POLICY.autoApproval, false);
    assert.equal(SEERAH_REVIEW_POLICY.humanReviewRequired, true);
    assert.equal(SEERAH_REVIEW_POLICY.scholarlyReviewStatus, "pending");
    assert.equal(SEERAH_REVIEW_POLICY.editionReviewStatus, "pending");
    assert.equal(SEERAH_REVIEW_POLICY.sacredDepictionForbidden, true);

    assert.equal(checklist.summary.humanReview.required, 206);
    assert.equal(checklist.summary.humanReview.signed, 0);
    assert.equal(checklist.summary.humanReview.pending, 206);

    for (const record of checklist.records) {
      assert.equal(record.reviewStatus, "pending_review", `${record.recordId} changed review status`);
      assert.equal(record.humanReview.required, true);
      assert.equal(record.humanReview.reviewer, null, `${record.recordId} has a reviewer`);
      assert.equal(record.humanReview.reviewerRole, null, `${record.recordId} has a reviewer role`);
      assert.equal(record.humanReview.reviewedAt, null, `${record.recordId} has a review date`);
      assert.equal(record.humanReview.decision, null, `${record.recordId} has a decision`);

      const human = record.checklist.find((item) => item.key === "human-scholarly-review");
      assert.ok(human, `${record.recordId} is missing the human review item`);
      assert.equal(human?.status, "open", `${record.recordId} auto-closed human review`);

      const edition = record.checklist.find((item) => item.key === "edition-review");
      assert.ok(edition, `${record.recordId} is missing the edition review item`);
      assert.equal(edition?.status, "open", `${record.recordId} auto-closed edition review`);

      assert.ok(
        record.checklist.some((item) => item.status === "open"),
        `${record.recordId} must retain at least one open gate`,
      );
    }
  });

  it("records bilingual evidence for every checklist item", () => {
    for (const record of checklist.records) {
      assert.ok(record.checklist.length >= 6, `${record.recordId} has too few checklist items`);
      for (const item of record.checklist) {
        assert.ok(item.labelAr.trim(), `${record.recordId}/${item.key} has no Arabic label`);
        assert.ok(item.labelEn.trim(), `${record.recordId}/${item.key} has no English label`);
        assert.ok(item.evidenceAr.trim(), `${record.recordId}/${item.key} has no Arabic evidence`);
        assert.ok(item.evidenceEn.trim(), `${record.recordId}/${item.key} has no English evidence`);
        assert.ok(
          item.status === "verified" || item.status === "open" || item.status === "not_applicable",
          `${record.recordId}/${item.key} has an unknown status`,
        );
      }
    }
  });

  it("keeps symbolic art and status provenance honest", () => {
    const eventRecords = checklist.records.filter((record) => record.recordType === "event");
    for (const record of eventRecords) {
      const visualKey = record.provenance.visualKey;
      assert.ok(visualKey, `${record.recordId} has no visual key`);
      assert.ok(visualKey! in art, `${record.recordId} uses unregistered art ${visualKey}`);
      assert.equal(record.provenance.certainty !== null, true, `${record.recordId} has no certainty`);
      assert.equal(record.provenance.precision !== null, true, `${record.recordId} has no precision`);
    }

    const eventCount = checklist.records.filter(
      (record) => record.recordType === "event" && record.reviewStatusSource === "record",
    ).length;
    assert.equal(eventCount, 101);

    const placeCount = checklist.records.filter(
      (record) => record.recordType === "place" && record.reviewStatusSource === "checklist",
    ).length;
    assert.equal(placeCount, 32);
  });

  it("summarizes the open technical items without hiding them", () => {
    assert.equal(checklist.summary.recordsWithOpenTechnicalItems, 53);
    assert.deepEqual(checklist.summary.openItemsByKey, {
      "atlas-link": 30,
      "atlas-mapping": 23,
    });

    assert.deepEqual(checklist.summary.certainty, {
      established: 25,
      well_reported: 68,
      reported: 8,
    });
    assert.deepEqual(checklist.summary.precision, {
      approximate: 40,
      exact_day: 13,
      month_year: 21,
      undated: 2,
      year_only: 25,
    });
    assert.deepEqual(checklist.summary.places, {
      withAtlasName: 9,
      withoutAtlasName: 23,
    });
    assert.deepEqual(checklist.summary.events, {
      withPlace: 95,
      withoutPlace: 6,
      withAtlasLink: 65,
      withoutAtlasLink: 30,
    });
  });

  it("renders a summary that states the human boundary", () => {
    const markdown = renderSeerahReviewSummary(checklist);
    assert.match(markdown, /technical preflight, not a scholarly review or an approval/i);
    assert.match(markdown, /\*\*206\*\*/);
    assert.match(markdown, /\*\*Total\*\* \| \*\*206\*\* \| \*\*0\*\* \| \*\*206\*\*/);
    assert.match(markdown, /No record was approved, published, or given a scholarly decision/);
    assert.doesNotMatch(markdown, /approved by/i);
  });

  it("rebuilds deterministically", () => {
    const second = buildSeerahReviewChecklist();
    assert.equal(second.version, SEERAH_REVIEW_CHECKLIST_VERSION);
    assert.deepEqual(second, checklist);
    assert.equal(renderSeerahReviewSummary(second), renderSeerahReviewSummary(checklist));
  });

  it("keeps the committed artifacts in sync with the builder", () => {
    const artifact = JSON.parse(read("artifacts/seerah/review-checklist.json")) as ReturnType<
      typeof buildSeerahReviewChecklist
    >;
    assert.equal(artifact.version, checklist.version);
    assert.deepEqual(artifact.summary, checklist.summary);
    assert.equal(artifact.records.length, checklist.records.length);
    assert.equal(
      read("artifacts/seerah/review-checklist-summary.md"),
      renderSeerahReviewSummary(checklist),
    );
  });
});
