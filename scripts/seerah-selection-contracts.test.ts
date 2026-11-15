import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEERAH_CONTENT_STATUS,
  buildSeerahSelectionSearch,
  buildSeerahSelectionUrl,
  chooseSeerahChapter,
  chooseSeerahEvent,
  resolveSeerahSelection,
} from "../client/src/visual-golden/services/seerah";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const seerahPage = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/SeerahPage.tsx"),
  "utf8",
);
const seerahStyles = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/SeerahPage.module.css"),
  "utf8",
);

const chapters = [
  { id: "alpha", timelineEvents: [{ id: "alpha-one" }, { id: "alpha-two" }] },
  { id: "beta", timelineEvents: [{ id: "beta-one" }] },
  { id: "empty", timelineEvents: [] },
] as const;

describe("Seerah selection is synchronized with the URL", () => {
  it("honors chapter and event parameters on initial load", () => {
    assert.deepEqual(
      resolveSeerahSelection(chapters, "chapter=beta&event=beta-one", "alpha"),
      { chapterId: "beta", eventId: "beta-one" },
    );
    assert.deepEqual(
      resolveSeerahSelection(chapters, "?event=beta-one", "alpha"),
      { chapterId: "beta", eventId: "beta-one" },
    );
    assert.deepEqual(
      resolveSeerahSelection(chapters, "?chapter=alpha", "alpha"),
      { chapterId: "alpha", eventId: "" },
    );
  });

  it("keeps event URLs chapter-scoped and preserves unrelated parameters", () => {
    const url = buildSeerahSelectionUrl("/seerah?keep=1#map", {
      chapterId: "alpha",
      eventId: "alpha-two",
    });

    assert.equal(url, "/seerah?chapter=alpha&event=alpha-two&keep=1#map");
    assert.equal(
      buildSeerahSelectionSearch("?chapter=empty&event=beta-one", {
        chapterId: "empty",
        eventId: "",
      }),
      "?chapter=empty",
    );
    assert.equal(
      buildSeerahSelectionSearch("", { chapterId: "", eventId: "alpha-one" }),
      "",
      "an event URL is never emitted without its chapter",
    );
  });

  it("uses replace navigation and URL-derived state in the page", () => {
    assert.match(seerahPage, /useSearch\(\)/);
    assert.match(seerahPage, /resolveSeerahSelection\(CHAPTERS, search\)/);
    assert.match(seerahPage, /navigate\([^\n]+\{ replace: true \}\)/);
    assert.doesNotMatch(seerahPage, /setSelection/);
  });
});

describe("Seerah events cannot escape their chapter", () => {
  it("does not borrow an event when the selected chapter has no events", () => {
    assert.deepEqual(
      resolveSeerahSelection(chapters, "?chapter=empty&event=beta-one", "alpha"),
      { chapterId: "empty", eventId: "" },
    );
    assert.deepEqual(chooseSeerahChapter(chapters, "empty"), {
      chapterId: "empty",
      eventId: "",
    });
    assert.deepEqual(chooseSeerahChapter(chapters, "alpha"), {
      chapterId: "alpha",
      eventId: "",
    });
  });

  it("rejects a mismatched event instead of silently substituting another one", () => {
    assert.deepEqual(
      resolveSeerahSelection(chapters, "?chapter=alpha&event=beta-one", "alpha"),
      { chapterId: "alpha", eventId: "" },
    );
    assert.deepEqual(chooseSeerahEvent(chapters, "alpha", "beta-one"), {
      chapterId: "alpha",
      eventId: "",
    });
  });

  it("does not infer an ambiguous event without a chapter", () => {
    const ambiguous = [
      { id: "one", timelineEvents: [{ id: "shared" }] },
      { id: "two", timelineEvents: [{ id: "shared" }] },
    ] as const;

    assert.deepEqual(resolveSeerahSelection(ambiguous, "?event=shared", "one"), {
      chapterId: "one",
      eventId: "",
    });
  });
});

describe("Seerah local editorial material is labelled honestly", () => {
  it("declares local editorial structure with review still pending", () => {
    assert.equal(SEERAH_CONTENT_STATUS.materialKind, "local-editorial-structure");
    assert.equal(SEERAH_CONTENT_STATUS.scholarlyReview, "pending");
    assert.equal(SEERAH_CONTENT_STATUS.editionReview, "pending");
    assert.equal(SEERAH_CONTENT_STATUS.governedSourceId, null);
    assert.equal(SEERAH_CONTENT_STATUS.governedEditionId, null);
    assert.equal(SEERAH_CONTENT_STATUS.governedVersionId, null);
    assert.match(SEERAH_CONTENT_STATUS.noticeAr, /مادة تحريرية محلية/);
    assert.match(SEERAH_CONTENT_STATUS.noticeAr, /المراجعة العلمية ومراجعة الطبعة قيد الانتظار/);
    assert.match(SEERAH_CONTENT_STATUS.noticeEn, /scholarly and edition review pending/i);
  });

  it("does not describe the local chapter/event records as source data", () => {
    assert.match(seerahPage, /SEERAH_CONTENT_STATUS\.noticeAr/);
    assert.doesNotMatch(seerahPage, /from source data/i);
    assert.doesNotMatch(seerahPage, /في المصدر/);
  });
});

describe("Seerah event detail keeps a coherent heading hierarchy", () => {
  it("uses a section heading before its nested deferred-relations heading", () => {
    assert.match(seerahPage, /<h3>علاقات المحطة/);
    assert.doesNotMatch(seerahPage, /<h4>علاقات المحطة/);
    assert.match(seerahPage, /<h4>علاقات غير مسجّلة/);
    assert.match(seerahStyles, /\.graph h3\s*\{/);
    assert.match(seerahStyles, /\.graphDeferred h4\s*\{/);
  });
});
