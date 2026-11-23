import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  EMPTY_NOOR_FILTERS,
  NOOR_MEDIA_RECORDS,
  approvedNoorEmbedUrl,
  clearedNoorThumbnail,
  filterNoorRecords,
  matchesNoorTopic,
  noorMediaDuration,
  noorMediaTitle,
} from "../client/src/visual-golden/services/media/noor-theatre";
import { isMediaRecordApproved, mediaReviewCounts } from "../client/src/visual-golden/services/media/review-gates";

const root = resolve(import.meta.dirname ?? ".", "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Noor is the governed non-kids projection, not a second fabricated media catalog", () => {
  assert.ok(NOOR_MEDIA_RECORDS.length > 0);
  const ids = NOOR_MEDIA_RECORDS.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(NOOR_MEDIA_RECORDS.every((record) => !["kids", "القرآن الكريم للأطفال"].includes(record.category ?? "")));
  const counts = mediaReviewCounts(NOOR_MEDIA_RECORDS);
  assert.equal(counts.total, ids.length);
  assert.equal(counts.approved + counts.pending, counts.total);
});

test("Playback and remote thumbnails stay blocked for every unapproved record", () => {
  const blocked = NOOR_MEDIA_RECORDS.filter((record) => !isMediaRecordApproved(record));
  assert.ok(blocked.length > 0, "test fixture currently needs at least one pending media record");
  for (const record of blocked) {
    assert.equal(approvedNoorEmbedUrl(record), null, "unreviewed media must not mount an embed");
    assert.equal(clearedNoorThumbnail(record), null, "unreviewed media must not hotlink thumbnails");
  }
});

test("Filtering preserves the complete catalog and has deterministic facets", () => {
  const all = filterNoorRecords(NOOR_MEDIA_RECORDS, EMPTY_NOOR_FILTERS);
  assert.equal(all.length, NOOR_MEDIA_RECORDS.length);
  assert.deepEqual(all.map((record) => record.id), NOOR_MEDIA_RECORDS.map((record) => record.id));
  const sample = all[0];
  assert.ok(sample);
  assert.ok(noorMediaTitle(sample).length > 0);
  const byCategory = filterNoorRecords(all, { ...EMPTY_NOOR_FILTERS, category: sample.category ?? "" });
  assert.ok(byCategory.includes(sample));
  assert.ok(byCategory.every((record) => record.category === sample.category));
  const nonsense = filterNoorRecords(all, { ...EMPTY_NOOR_FILTERS, query: "NOOR___IMPOSSIBLE_SEARCH___4F8D" });
  assert.equal(nonsense.length, 0);
  const reviewed = filterNoorRecords(all, { ...EMPTY_NOOR_FILTERS, availability: "approved" });
  assert.ok(reviewed.every(isMediaRecordApproved));
  const pending = filterNoorRecords(all, { ...EMPTY_NOOR_FILTERS, availability: "review" });
  assert.ok(pending.every((record) => !isMediaRecordApproved(record)));
  assert.equal(reviewed.length + pending.length, all.length);
});

test("Topic selection never changes record data or starts playback", () => {
  for (const topic of ["all", "seerah", "lectures", "stories"] as const) {
    const filtered = filterNoorRecords(NOOR_MEDIA_RECORDS, { ...EMPTY_NOOR_FILTERS, topic });
    assert.ok(filtered.every((record) => matchesNoorTopic(record, topic)));
    if (topic === "all") assert.equal(filtered.length, NOOR_MEDIA_RECORDS.length);
  }
});

test("Duration labels use exact known data and never invent estimates", () => {
  assert.equal(noorMediaDuration(null), null);
  assert.equal(noorMediaDuration(0), null);
  assert.equal(noorMediaDuration(-1), null);
  assert.equal(noorMediaDuration(Number.NaN), null);
  assert.equal(noorMediaDuration(62), "1:02");
  assert.equal(noorMediaDuration(3661), "1:01:01");
});

test("Noor has a canonical independent route and Seerah does not embed its media catalog", () => {
  const app = read("client/src/App.tsx");
  const seerah = read("client/src/visual-golden/pages/SeerahPage.tsx");
  const page = read("client/src/visual-golden/pages/NoorPage.tsx");
  const sidebar = read("client/src/visual-golden/components/shell/InstitutionSidebar.tsx");
  assert.match(app, /\/noor/);
  assert.match(app, /NoorPage/);
  assert.match(page, /<NoorMediaTheatre\s*\/>/);
  assert.doesNotMatch(seerah, /<MediaLibrarySection[^>]*kind=["']seerah["']/);
  assert.match(sidebar, /media:\s*Clapperboard/);
  assert.match(read("client/src/visual-golden/lib/institution/workspace.ts"), /\/noor/);
});

test("Noor screen is a functional governed component with a complete CSS module", () => {
  const jsx = read("client/src/visual-golden/components/media/NoorMediaTheatre.tsx");
  const css = read("client/src/visual-golden/components/media/NoorMediaTheatre.module.css");
  const names = [...jsx.matchAll(/styles\.([A-Za-z_][\w]*)/g)].map((match) => match[1]);
  const missing = [...new Set(names)].filter((name) => !new RegExp("\\." + name + "(?![\\w-])").test(css));
  assert.deepEqual(missing, [], "CSS selectors missing from the real theatre component");
  assert.match(jsx, /data-approved-count/);
  assert.match(jsx, /approvedNoorEmbedUrl/);
  assert.match(jsx, /<dialog/);
  assert.match(jsx, /requestFullscreen/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:\s*430px/);
});
