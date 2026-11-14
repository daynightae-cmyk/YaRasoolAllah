import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { seerahChapters } from "../client/src/data/seerahData";
import { HADITH_DEVELOPMENT_SAMPLES } from "../client/src/data/hadithData";
import { sourceRegistry } from "../shared/source-registry";
import {
  buildLocalIndex,
  buildKnowledgeGraph,
  findRelatedRecords,
  type KnowledgeGraph,
} from "../client/src/visual-golden/services/basirah";

const records = buildLocalIndex();
const graph: KnowledgeGraph = buildKnowledgeGraph(records);
const nodeIds = new Set(graph.nodes.map((node) => node.id));

function chapterIdFromRecordId(recordId: string): string {
  return recordId.replace(/^seerah-/, "");
}

describe("Basirah knowledge graph provenance", () => {
  it("declares certainty, a reason, and source IDs on every local record", () => {
    for (const record of records) {
      assert.ok(
        ["verified", "approximate", "schematic"].includes(record.certainty),
        `${record.id} must declare a known certainty level`,
      );
      assert.ok(record.certaintyReasonAr.length > 10, `${record.id} must explain its certainty`);
      assert.ok(Array.isArray(record.sourceIds), `${record.id} must declare sourceIds`);
    }
  });

  it("matches source certainty to the editorial status, never to copy", () => {
    for (const record of records.filter((item) => item.scope === "sources")) {
      const sourceId = record.id.replace(/^source-/, "");
      const source = sourceRegistry.find((item) => item.sourceId === sourceId);
      assert.ok(source, `source record ${sourceId} must exist in the registry`);
      assert.equal(
        record.certainty,
        source.editorialStatus === "verified" ? "verified" : "approximate",
        `${record.id} certainty must follow source.editorialStatus`,
      );
      assert.deepEqual(record.sourceIds, [source.sourceId]);
    }
  });

  it("emits only declared relation types with basis and evidence", () => {
    const allowed = new Set([
      "chapter-sequence",
      "chapter-relation",
      "hadith-collection",
      "work-source",
      "source-evidence",
    ]);
    for (const edge of graph.edges) {
      assert.ok(allowed.has(edge.type), `unexpected relation type ${edge.type}`);
      assert.ok(nodeIds.has(edge.from), `dangling from ${edge.from}`);
      assert.ok(nodeIds.has(edge.to), `dangling to ${edge.to}`);
      assert.ok(edge.basis.length > 0, `edge ${edge.type} needs a basis`);
      assert.ok(edge.evidenceRef.length > 0, `edge ${edge.type} needs an evidence reference`);
      assert.ok(edge.labelAr.length > 0);
    }
    assert.equal(
      graph.edges.some((edge) => (edge.type as string) === "event-event"),
      false,
      "the untyped event-event relation must not return",
    );
  });

  it("orders seerah chapters by recorded order, not alphabetically", () => {
    const order = new Map(
      [...seerahChapters]
        .sort((a, b) => a.order - b.order)
        .map((chapter, index) => [chapter.id, index]),
    );
    const sequence = graph.edges.filter((edge) => edge.type === "chapter-sequence");
    assert.ok(sequence.length > 0);
    for (const edge of sequence) {
      const from = chapterIdFromRecordId(edge.from);
      const to = chapterIdFromRecordId(edge.to);
      assert.equal(order.get(to), (order.get(from) ?? -1) + 1, `${from} -> ${to} must follow chapter.order`);
    }
  });

  it("admits only chapter relations recorded in relatedChapters", () => {
    for (const edge of graph.edges.filter((item) => item.type === "chapter-relation")) {
      const from = chapterIdFromRecordId(edge.from);
      const to = chapterIdFromRecordId(edge.to);
      const chapter = seerahChapters.find((item) => item.id === from);
      assert.ok(chapter, `unknown chapter ${from}`);
      assert.ok(
        chapter.relatedChapters?.includes(to),
        `${from} -> ${to} is not declared in chapter.relatedChapters`,
      );
    }
  });

  it("links hadith samples to their declared collection identity only", () => {
    const hadithEdges = graph.edges.filter((edge) => edge.type === "hadith-collection");
    const samples = records.filter((record) => record.scope === "hadith");
    assert.equal(hadithEdges.length, samples.length);
    for (const edge of hadithEdges) {
      const sample = samples.find((item) => item.id === edge.from);
      assert.ok(sample?.collectionId, `missing sample for ${edge.from}`);
      assert.equal(
        edge.to,
        `hadith-collection-${sample.collectionId}`,
        "hadith edges must target the stable collection node",
      );
      assert.equal(edge.basis, "HADITH_DEVELOPMENT_SAMPLES[].collectionId");
    }
    assert.equal(
      graph.edges.some(
        (edge) =>
          edge.type === "hadith-collection" &&
          !HADITH_DEVELOPMENT_SAMPLES.some((sample) => `hadith-${sample.id}` === edge.from),
      ),
      false,
    );
  });

  it("links works only to source registry IDs declared on the work", () => {
    const sourceEdges = graph.edges.filter(
      (edge) => edge.type === "source-evidence" && edge.from.startsWith("work-"),
    );
    assert.ok(sourceEdges.length > 0, "verified works should expose their declared source links");
    for (const edge of sourceEdges) {
      const sourceId = edge.evidenceRef;
      assert.ok(
        sourceRegistry.some((source) => source.sourceId === sourceId),
        `unknown source ${sourceId}`,
      );
      assert.equal(edge.to, `source-${sourceId}`);
      assert.equal(edge.certainty, "verified");
    }
    assert.equal(
      graph.edges.some(
        (edge) => edge.type === "source-evidence" && edge.from.startsWith("seerah-"),
      ),
      false,
      "seerah chapters must not be linked to sources by title matching",
    );
  });

  it("returns complete related nodes, never partial graph stubs", () => {
    const chapter = records.find((record) => record.scope === "seerah");
    assert.ok(chapter);
    const related = findRelatedRecords(graph, chapter.id);
    assert.ok(related.length > 0, "the first seerah chapter should have a recorded neighbour");
    for (const node of related) {
      assert.ok(node.id !== chapter.id, "findRelatedRecords must not return the source record");
      assert.ok(node.hintAr.length > 0, "related nodes keep hintAr");
      assert.ok(node.hintEn.length > 0, "related nodes keep hintEn");
      assert.ok(node.availabilityAr.length > 0, "related nodes keep availabilityAr");
      assert.ok(node.certaintyReasonAr.length > 0);
    }
  });
});
