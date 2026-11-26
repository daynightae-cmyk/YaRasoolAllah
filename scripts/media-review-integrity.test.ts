import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeText, parseCsv, sha256Text } from "./acquire/ingest-media-catalog";
import { DISCOVERED_MEDIA_CATALOG, DISCOVERED_MEDIA_COUNTS } from "../client/src/visual-golden/data/media-discovery.generated";
import {
  filterMediaDiscoveryRecords,
  isMediaGatePassed,
  mediaReviewCounts,
} from "../client/src/visual-golden/services/media/review-gates";
import { mediaAssetRegistry } from "../shared/knowledge-registry";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const acquisition = resolve(root, "data-sources/media/acquisition");
const discovery = resolve(root, "data-sources/media/discovery");

const REGRESSION_IDS = [
  "n-wybr5unG4",
  "1c9vf842eDg",
  "P894h6fWjSQ",
  "JTzdoeJ0MEs",
] as const;

test("CSV parser preserves quoted commas and escaped quotes", () => {
  const parsed = parseCsv(
    'id,title,note\r\n1,"Prayer, duas, and stories","said ""hello"""\r\n',
    "fixture.csv",
  );
  assert.equal(parsed.header.length, 3);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].title, "Prayer, duas, and stories");
  assert.equal(parsed.rows[0].note, 'said "hello"');
  assert.equal(parsed.rows[0].__sourceLine, 2);
});

test("CSV parser rejects a shifted row before catalog generation", () => {
  assert.throws(
    () => parseCsv('id,title,status\n1,"Prayer, duas"\n', "broken.csv"),
    /expected 3 fields, received 2/,
  );
});

test("the four formerly shifted source rows keep every review field aligned", () => {
  const parsed = parseCsv(readFileSync(resolve(acquisition, "kids-media-catalog.csv"), "utf-8"), "kids-media-catalog.csv");
  for (const videoId of REGRESSION_IDS) {
    const row = parsed.rows.find((candidate) => candidate.video_id === videoId);
    assert.ok(row, `missing source row ${videoId}`);
    assert.equal(row.license_type, "UNKNOWN");
    assert.equal(row.embedding_status, "UNTESTED");
    assert.equal(row.editorial_status, "PENDING_REVIEW");
    assert.equal(row.publication_status, "DRAFT");
    assert.equal(row.religious_review_status, "PENDING_REVIEW");
    assert.equal(row.depiction_review_status, "PENDING_REVIEW");
    assert.equal(row.embed_url, `https://www.youtube.com/embed/${videoId}`);
  }
});

test("generated discovery catalog is fail-closed and repairs the shifted statuses", () => {
  const total = DISCOVERED_MEDIA_CATALOG.length;
  // Golden count of the governed discovery catalog: 2026-11-27 expansion to
  // 125 enumerated playlists (5 publishers) took it from 1742 to 3580 records.
  assert.equal(total, 3580);
  assert.equal(DISCOVERED_MEDIA_COUNTS.total, total);
  assert.equal(DISCOVERED_MEDIA_COUNTS.approved, 0);
  assert.equal(DISCOVERED_MEDIA_COUNTS.pending, total);
  assert.equal(new Set(DISCOVERED_MEDIA_CATALOG.map((record) => record.id)).size, total);
  assert.ok(DISCOVERED_MEDIA_CATALOG.every((record) => record.rights_status === "UNKNOWN"));
  assert.ok(DISCOVERED_MEDIA_CATALOG.every((record) => record.publication_status === "DRAFT"));
  assert.deepEqual(
    DISCOVERED_MEDIA_CATALOG
      .filter((record) => record.embedding_status === "PROVIDER_REFUSED")
      .map((record) => record.video_id)
      .sort(),
    ["9hga7dn0kOQ", "g5L6Vi6Y0lY", "wyAr0xvt43o"],
  );
  assert.ok(DISCOVERED_MEDIA_CATALOG.every((record) => ["UNTESTED", "PROVIDER_REFUSED"].includes(record.embedding_status ?? "")));

  for (const videoId of REGRESSION_IDS) {
    const record = DISCOVERED_MEDIA_CATALOG.find((candidate) => candidate.video_id === videoId);
    assert.ok(record, `missing generated record ${videoId}`);
    assert.equal(record.editorial_status, "PENDING_REVIEW");
    assert.equal(record.publication_status, "DRAFT");
    assert.equal(record.depiction_review_status, "PENDING_REVIEW");
    assert.equal(record.embed_url, `https://www.youtube.com/embed/${videoId}`);
    assert.ok(record.provenance.sourceFile.endsWith(".csv"));
    assert.ok(record.provenance.sourceRow >= 2);
    assert.match(record.provenance.inputSha256, /^[a-f0-9]{64}$/);
  }
});

test("the discovery manifest records canonical input and output hashes", () => {
  const manifest = JSON.parse(readFileSync(resolve(discovery, "ingestion-manifest.json"), "utf-8")) as {
    generatedAt: string;
    totalUniqueRecords: number;
    approvedForPublicDisplay: number;
    blockedPendingReview: number;
    rightsUnknown: number;
    inputs: { path: string; sha256: string; bytes: number; hashMode: string }[];
    outputs: { catalog: { sha256: string }; clientCatalog: { sha256: string } };
  };
  assert.match(manifest.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal(manifest.totalUniqueRecords, DISCOVERED_MEDIA_CATALOG.length);
  assert.equal(manifest.approvedForPublicDisplay, 0);
  assert.equal(manifest.blockedPendingReview, DISCOVERED_MEDIA_CATALOG.length);
  assert.equal(manifest.rightsUnknown, DISCOVERED_MEDIA_CATALOG.length);
  assert.ok(manifest.inputs.length >= 7);
  assert.ok(manifest.inputs.every((input) => input.hashMode === "utf8-lf" && /^[a-f0-9]{64}$/.test(input.sha256)));

  const catalogText = canonicalizeText(readFileSync(resolve(discovery, "media-discovery-catalog.json"), "utf-8"));
  assert.equal(sha256Text(catalogText), manifest.outputs.catalog.sha256);

  const clientText = canonicalizeText(readFileSync(resolve(root, "client/src/visual-golden/data/media-discovery.generated.ts"), "utf-8"));
  assert.equal(sha256Text(clientText), manifest.outputs.clientCatalog.sha256);
});

test("review filters and gate semantics are deterministic", () => {
  const counts = mediaReviewCounts(DISCOVERED_MEDIA_CATALOG);
  const total = DISCOVERED_MEDIA_CATALOG.length;
  assert.deepEqual(counts, {
    total,
    approved: 0,
    pending: total,
    rightsUnknown: total,
    embeddingUntested: DISCOVERED_MEDIA_CATALOG.filter((record) => record.embedding_status === "UNTESTED").length,
    editorialPending: total,
  });

  const quotedComma = filterMediaDiscoveryRecords(DISCOVERED_MEDIA_CATALOG, "Prayer, duas", "all", "all");
  assert.equal(quotedComma.length, 1);
  assert.equal(quotedComma[0].video_id, "1c9vf842eDg");

  const category = DISCOVERED_MEDIA_CATALOG[0].category;
  assert.ok(category);
  assert.ok(filterMediaDiscoveryRecords(DISCOVERED_MEDIA_CATALOG, "", category, "all").length > 0);
  assert.equal(filterMediaDiscoveryRecords(DISCOVERED_MEDIA_CATALOG, "", "all", "APPROVED").length, 0);

  assert.equal(isMediaGatePassed("publisher_status", "VERIFIED_PUBLISHER"), true);
  assert.equal(isMediaGatePassed("publisher_status", "OFFICIAL"), true);
  assert.equal(isMediaGatePassed("rights_status", "UNKNOWN"), false);
  assert.equal(isMediaGatePassed("embedding_status", "UNTESTED"), false);
});

test("discovery candidates never enter the public media asset registry", () => {
  assert.deepEqual(mediaAssetRegistry, []);
});
