import assert from "node:assert/strict";
import test from "node:test";
import { DISCOVERED_KIDS_VIDEOS } from "../client/src/visual-golden/data/kids-youtube-discovered.generated";
import { APPROVED_YOUTUBE_KIDS_VIDEOS } from "../client/src/visual-golden/data/kids-youtube-approved.generated";

test("recovered video links remain visible as pending intake without auto-publication", () => {
  assert.ok(DISCOVERED_KIDS_VIDEOS.length >= 5);
  const ids = new Set(DISCOVERED_KIDS_VIDEOS.map((item) => item.id));
  assert.equal(ids.size, DISCOVERED_KIDS_VIDEOS.length);
  for (const item of DISCOVERED_KIDS_VIDEOS) {
    assert.equal(item.reviewStatus, "pending");
    assert.equal(item.publicationStatus, "not_published");
    assert.match(item.sourceUrl, /^https:\/\/www\.youtube\.com\/watch\?v=/);
    assert.ok(item.providerVideoId.length >= 6);
  }
});

test("discovery recovery never silently promotes an item into the public runtime", () => {
  const approvedIds = new Set(APPROVED_YOUTUBE_KIDS_VIDEOS.map((item) => item.id));
  for (const item of DISCOVERED_KIDS_VIDEOS) {
    assert.equal(approvedIds.has(item.id), false);
  }
});
