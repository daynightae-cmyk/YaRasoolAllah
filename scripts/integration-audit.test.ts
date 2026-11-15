import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MEDIA_LIBRARY } from "../client/src/data/mediaLibrary";
import { BASIRAH_COUNTS } from "../client/src/visual-golden/services/basirah";
import { KIDS_COUNTS } from "../client/src/visual-golden/services/kids";
import { LIBRARY_COUNTS } from "../client/src/visual-golden/services/library";

const root = path.resolve(import.meta.dirname, "..");

test("Quran provenance uses the acquired Tanzil source in Basirah", () => {
  const files = [
    "client/src/visual-golden/services/basirah.ts",
    "client/src/visual-golden/pages/BasirahPage.tsx",
  ];
  for (const relative of files) {
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    assert.match(source, /src-tanzil-uthmani-min-1-1-acquired/);
    assert.doesNotMatch(source, /src-tanzil-uthmani-1-1-candidate/);
  }
});

test("Basirah and library counters are explicit and distinct", () => {
  assert.equal(BASIRAH_COUNTS.catalogWorks, LIBRARY_COUNTS.works);
  assert.equal(BASIRAH_COUNTS.catalogVersions, LIBRARY_COUNTS.versions);
  assert.equal(BASIRAH_COUNTS.indexedWorks, 17);
  assert.equal(BASIRAH_COUNTS.catalogWorks, 16);
});

test("media catalog has unique IDs and secure source URLs", () => {
  const ids = MEDIA_LIBRARY.map((item) => item.id);
  const videoIds = MEDIA_LIBRARY.map((item) => item.videoId);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(videoIds).size, videoIds.length);
  for (const item of MEDIA_LIBRARY) {
    assert.match(item.sourceUrl, /^https:\/\//);
    assert.match(item.thumbnail, /^https:\/\//);
    assert.ok(item.channel);
    assert.ok(item.category);
  }
});

test("kids governance exposes the pending cleared-media state", () => {
  assert.equal(KIDS_COUNTS.clearedMedia, 0);
  assert.ok(KIDS_COUNTS.adaptations > 0);
});

test("preview route manifest is valid and includes core wings", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "client/public/manus-routes.json"), "utf8"));
  const paths = new Set(manifest.routes.map((route: { path: string }) => route.path));
  for (const route of ["/library", "/kids", "/quran", "/hadith", "/seerah", "/basirah"]) {
    assert.ok(paths.has(route), `missing preview route ${route}`);
  }
});
