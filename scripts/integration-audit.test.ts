import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DISCOVERED_MEDIA_CATALOG, DISCOVERED_MEDIA_COUNTS } from "../client/src/visual-golden/data/media-discovery.generated";
import { BASIRAH_COUNTS, QURAN_TEXT_SOURCE_ID } from "../client/src/visual-golden/services/basirah";
import { KIDS_COUNTS } from "../client/src/visual-golden/services/kids";
import { catalog, LIBRARY_COUNTS } from "../client/src/visual-golden/services/library";
import { workRegistry } from "../shared/knowledge-registry";

const root = path.resolve(import.meta.dirname, "..");

test("Quran provenance resolves to the acquired Tanzil source in Basirah", () => {
  assert.equal(QURAN_TEXT_SOURCE_ID, "src-tanzil-uthmani-min-1-1-acquired");
  const files = [
    "client/src/visual-golden/services/basirah.ts",
    "client/src/visual-golden/pages/BasirahPage.tsx",
  ];
  for (const relative of files) {
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    assert.doesNotMatch(source, /src-tanzil-uthmani-1-1-candidate/);
  }
});

test("Basirah and library counters are explicit and distinct", () => {
  assert.equal(BASIRAH_COUNTS.catalogWorks, LIBRARY_COUNTS.works);
  assert.equal(BASIRAH_COUNTS.catalogVersions, LIBRARY_COUNTS.versions);
  // Counters derive from the live registries, not from a frozen snapshot, so a
  // governed expansion updates them instead of tripping them.
  assert.equal(BASIRAH_COUNTS.indexedWorks, workRegistry.length);
  assert.equal(BASIRAH_COUNTS.catalogWorks, catalog.length);
  assert.ok(
    BASIRAH_COUNTS.catalogWorks <= BASIRAH_COUNTS.indexedWorks,
    "shelf-qualified works cannot exceed indexed registry works",
  );
  assert.ok(LIBRARY_COUNTS.readableWorks > 0, "at least one registry work must be readable in-app");
  assert.ok(LIBRARY_COUNTS.readableVersions > 0);
});

test("media discovery catalog has unique IDs, secure source URLs, and zero approvals", () => {
  const ids = DISCOVERED_MEDIA_CATALOG.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(DISCOVERED_MEDIA_COUNTS.total, DISCOVERED_MEDIA_CATALOG.length);
  assert.ok(DISCOVERED_MEDIA_COUNTS.total >= 1742);
  assert.equal(DISCOVERED_MEDIA_COUNTS.approved, 0);
  for (const item of DISCOVERED_MEDIA_CATALOG) {
    if (item.official_url) assert.match(item.official_url, /^https:\/\//);
    if (item.embed_url) assert.match(item.embed_url, /^https:\/\//);
    assert.ok(item.channel_name);
    assert.ok(item.category);
    assert.equal(item.publication_status, "DRAFT");
  }
});

test("the retired duplicate media catalog module is gone", () => {
  assert.equal(fs.existsSync(path.join(root, "client/src/data/mediaLibrary.ts")), false);
});

test("kids governance exposes the pending cleared-media state", () => {
  assert.equal(KIDS_COUNTS.clearedMedia, 0);
  assert.ok(KIDS_COUNTS.adaptations > 0);
});

test("preview route manifest is valid and includes core wings", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "client/public/manus-routes.json"), "utf8"));
  const paths = new Set(manifest.routes.map((route: { path: string }) => route.path));
  for (const route of ["/library", "/kids", "/quran", "/hadith", "/seerah", "/basirah", "/noor"]) {
    assert.ok(paths.has(route), `missing preview route ${route}`);
  }
});
