import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seerahChapters } from "../client/src/data/seerahData";
import {
  SEERAH_GRAPH,
  SEERAH_GRAPH_ADMISSIONS,
  SEERAH_GRAPH_COUNTS,
  SEERAH_GRAPH_DEFERRED,
  getSeerahEventNode,
  seerahChapterKey,
  seerahEventKey,
} from "../client/src/visual-golden/services/seerah-graph";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const seerahDataFile = join(repoRoot, "client/src/data/seerahData.ts");
const seerahDataSource = readFileSync(seerahDataFile, "utf8");
const seerahPage = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/SeerahPage.tsx"),
  "utf8");
const seerahStyles = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/SeerahPage.module.css"),
  "utf8",
);
const visualSmoke = readFileSync(join(repoRoot, "scripts/smoke-visual-golden.mjs"), "utf8");
const visualCases = readFileSync(join(repoRoot, "scripts/capture-visual-evidence.mjs"), "utf8");

const REPLACEMENT_CHARACTER = "\uFFFD";

const recordedEvents = seerahChapters.flatMap((chapter) =>
  (chapter.timelineEvents ?? []).map((event) => ({
    chapterId: chapter.id,
    eventId: event.id,
    location: event.location ?? null,
    related: chapter.relatedChapters ?? [],
  })),
);

describe("Seerah event graph admits only recorded relations", () => {
  it("normalizes every recorded event into one chapter-scoped node", () => {
    assert.equal(SEERAH_GRAPH_COUNTS.events, recordedEvents.length);
    assert.equal(SEERAH_GRAPH_COUNTS.chapters, seerahChapters.length);
    const keys = SEERAH_GRAPH.events.map((event) => event.key);
    assert.equal(new Set(keys).size, keys.length, "event node keys must be unique");
    for (const recorded of recordedEvents) {
      const key = seerahEventKey(recorded.chapterId, recorded.eventId);
      assert.ok(keys.includes(key), `missing graph node for ${key}`);
    }
  });

  it("keeps event identity chapter-scoped instead of merging ids", () => {
    const collisions = SEERAH_GRAPH.findings.eventIdCollisions;
    for (const collision of collisions) {
      assert.ok(collision.chapterIds.length > 1);
      for (const chapterId of collision.chapterIds) {
        const node = SEERAH_GRAPH.events.find(
          (event) => event.chapterId === chapterId && event.eventId === collision.eventId,
        );
        assert.equal(node?.key, seerahEventKey(chapterId, collision.eventId));
      }
    }
    const chapterIdCollisions = SEERAH_GRAPH.findings.eventIdChapterIdCollisions;
    assert.ok(chapterIdCollisions.length > 0, "event ids must not shadow chapter ids silently");
    for (const collision of chapterIdCollisions) {
      const event = SEERAH_GRAPH.events.find(
        (item) => item.chapterId === collision.chapterId && item.eventId === collision.eventId,
      );
      const chapter = SEERAH_GRAPH.chapters.find((node) => node.chapterId === collision.eventId);
      assert.ok(event && chapter, "reported chapter-id collision must resolve to both nodes");
      assert.notEqual(event.key, chapter.key, "event and chapter keys must stay distinct");
    }
    assert.ok(
      chapterIdCollisions.some((collision) => collision.eventId === "prophet-death"),
      "prophet-death exists as both a chapter and an event id",
    );
  });

  it("emits chapter-relation edges only for recorded relatedChapters entries", () => {
    const relations = SEERAH_GRAPH.edges.filter((edge) => edge.kind === "chapter-relation");
    for (const edge of relations) {
      const sourceId = edge.from.replace("chapter:", "");
      const targetId = edge.to.replace("chapter:", "");
      const recorded = seerahChapters.find((chapter) => chapter.id === sourceId);
      assert.ok(
        recorded?.relatedChapters?.includes(targetId),
        `relation ${sourceId} → ${targetId} is not recorded in the source data`,
      );
      assert.equal(edge.basis, "chapter.relatedChapters[]");
      assert.equal(edge.certainty, "recorded");
    }
    assert.equal(SEERAH_GRAPH.findings.danglingRelations.length, 0);
    assert.ok(SEERAH_GRAPH.findings.chaptersWithoutRelations.length > 0, "gap should stay visible");
  });

  it("links events to places only when the curated Atlas slot matches exactly", () => {
    const placeEdges = SEERAH_GRAPH.edges.filter((edge) => edge.kind === "event-place");
    for (const edge of placeEdges) {
      const event = SEERAH_GRAPH.events.find((item) => item.key === edge.from);
      assert.ok(event?.place, `place edge without resolved place for ${edge.from}`);
      assert.equal(event.place.nodeId, edge.to);
      assert.equal(edge.certainty, "schematic");
    }
    for (const recorded of recordedEvents) {
      const node = SEERAH_GRAPH.events.find(
        (event) => event.chapterId === recorded.chapterId && event.eventId === recorded.eventId,
      );
      if (!node?.locationText) continue;
      if (node.place) {
        assert.equal(node.place.name, node.locationText);
      } else {
        assert.ok(
          SEERAH_GRAPH.findings.unresolvedLocations.includes(node.locationText),
          `unresolved location ${node.locationText} must be reported`,
        );
        assert.equal(
          SEERAH_GRAPH.edges.some((edge) => edge.from === node.key && edge.kind === "event-place"),
          false,
        );
      }
    }
    assert.ok(
      SEERAH_GRAPH.findings.unresolvedLocations.some((location) => location.includes("-")),
      "composite locations must stay unresolved",
    );
  });

  it("keeps sequence and continuity edges narrative, never chronological", () => {
    for (const edge of SEERAH_GRAPH.edges) {
      assert.ok(edge.basis.length > 0, "every edge must declare its source basis");
      if (edge.kind === "event-sequence" || edge.kind === "chapter-sequence" || edge.kind === "chapter-continuity") {
        assert.equal(edge.certainty, "narrative");
      }
    }
    const nodeKeys = new Set([
      ...SEERAH_GRAPH.events.map((event) => event.key),
      ...SEERAH_GRAPH.chapters.map((chapter) => chapter.key),
    ]);
    for (const edge of SEERAH_GRAPH.edges) {
      if (edge.kind === "event-place") continue;
      assert.ok(nodeKeys.has(edge.from), `dangling edge source ${edge.from}`);
      assert.ok(nodeKeys.has(edge.to), `dangling edge target ${edge.to}`);
    }
    assert.equal(SEERAH_GRAPH_ADMISSIONS.dateTextsParsed, false);
    assert.equal(SEERAH_GRAPH_ADMISSIONS.admittedTemporalBasis, "recorded-order");
  });

  it("defers person, scripture, hadith, reference and chronology relations with reasons", () => {
    const kinds = SEERAH_GRAPH_DEFERRED.map((relation) => relation.kind);
    for (const required of ["person", "quran-ayah", "hadith", "reference", "chronology", "event-identity", "place-outside-registry"]) {
      assert.ok(kinds.includes(required), `missing deferred relation kind ${required}`);
    }
    for (const relation of SEERAH_GRAPH_DEFERRED) {
      assert.ok(relation.reason.length > 10, `deferred relation ${relation.kind} needs a reason`);
    }
    const deferredKinds = new Set(kinds);
    for (const edge of SEERAH_GRAPH.edges) {
      assert.equal(
        deferredKinds.has(edge.kind),
        false,
        `deferred kind ${edge.kind} must never be emitted as an edge`,
      );
    }
  });
});

describe("Seerah event graph stays free of encoding damage", () => {
  it("keeps Seerah data free of replacement characters", () => {
    assert.equal(
      seerahDataSource.includes(REPLACEMENT_CHARACTER),
      false,
      "seerahData.ts must not contain U+FFFD replacement characters",
    );
    for (const event of SEERAH_GRAPH.events) {
      for (const value of [event.title, event.dateText, event.locationText ?? "", event.eventId]) {
        assert.equal(value.includes(REPLACEMENT_CHARACTER), false, `damaged value in ${event.key}`);
      }
    }
  });

  it("recovered the corrupted place so the recorded place edge is admitted", () => {
    const brotherhood = getSeerahEventNode("establishing-state", "brotherhood");
    assert.equal(brotherhood?.locationText, "المدينة المنورة");
    assert.equal(brotherhood?.place?.name, "المدينة المنورة");
    const placeEdge = SEERAH_GRAPH.edges.find(
      (edge) => edge.kind === "event-place" && edge.from === brotherhood?.key,
    );
    assert.equal(placeEdge?.to, brotherhood?.place?.nodeId);
    assert.equal(
      SEERAH_GRAPH.findings.unresolvedLocations.includes("المدينة المنورة"),
      false,
    );
  });
});

describe("Seerah event graph reaches the product surface", () => {
  it("renders recorded relations and the deferred boundary for the selected event", () => {
    assert.match(seerahPage, /data-visual="seerah-event-graph"/);
    assert.match(seerahPage, /getSeerahEventNode/);
    assert.match(seerahPage, /SEERAH_GRAPH_DEFERRED\.map/);
    assert.match(seerahPage, /data-graph-deferred/);
    assert.match(seerahPage, /ترتيب سردي لا تقويم تاريخي/);
    assert.match(seerahPage, /خارج المواضع التخطيطية المعتمدة/);
  });

  it("keeps the event → Atlas place link and date-uncertainty note", () => {
    assert.match(seerahPage, /href=\{`\/atlas\?place=\$\{encodeURIComponent\(place\.nodeId\)\}`\}/);
    assert.match(seerahPage, /غير موثقة في بيانات المحطة/);
  });

  it("styles the graph block for both wide and narrow viewports", () => {
    assert.match(seerahStyles, /\.graph\s*\{/);
    assert.match(seerahStyles, /\.graphDeferred\s*\{/);
    assert.match(seerahStyles, /overflow-wrap: anywhere/);
  });

  it("gates the graph in rendered smoke and visual evidence", () => {
    assert.match(seerahPage, /data-graph-relations/);
    assert.match(seerahStyles, /\.graphList\s*\{/);
    assert.equal(
      /\.graphList li/.test(visualSmoke),
      false,
      "smoke must not depend on hashed CSS-module class names",
    );
    assert.match(visualSmoke, /seerah-event-graph/);
    assert.match(visualSmoke, /graphDeferred/);
    assert.match(visualSmoke, /data-graph-relations/);
    assert.match(visualCases, /\[data-visual="seerah-event-graph"\]/);
  });

  it("stays scoped to the recorded graph surface", () => {
    const chapterKeys = new Set(SEERAH_GRAPH.chapters.map((chapter) => chapter.key));
    for (const chapter of SEERAH_GRAPH.chapters) {
      assert.equal(chapter.key, seerahChapterKey(chapter.chapterId));
      assert.ok(chapterKeys.has(chapter.key));
    }
  });
});
