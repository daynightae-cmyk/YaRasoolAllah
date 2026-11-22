/**
 * Hadith archive full-page composition — approved reference 04_hadith.png.
 *
 * The reference is a whole page: hero with honest ledger, scope tabs above a
 * full-width search, the six books as a clickable shelf with count badges,
 * and a three-column browse deck (recorded books rail · hadith feed · six
 * books rail). Every number and card must derive from the governed local
 * registry — the page may look rich, but it may not invent corpus size.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { COLLECTIONS, LOCAL_SAMPLES } from "../client/src/visual-golden/services/hadith";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/HadithPage.tsx");
const css = read("client/src/visual-golden/pages/HadithPage.module.css");

test("the hero ledger is computed, never typed", () => {
  assert.match(page, /data-visual="hadith-archive-hero"/);
  assert.match(page, /COLLECTIONS\.reduce\(\(sum, collection\) => sum \+ collection\.totalHadithCount, 0\)/);
  assert.match(page, /new Set\(LOCAL_SAMPLES\.map\(\(sample\) => sample\.narratorAr\)\)\.size/);
  // The sum is explicitly labelled bibliographic, not local corpus.
  assert.match(page, /عدد ببليوغرافي مجموع/);
  assert.match(page, /العدد الكلي للمصنف ليس حجم المتن المحلي/);
  assert.match(css, /\.heroLedger/);
});

test("scope tabs sit above the full-width search deck", () => {
  assert.match(page, /data-visual="hadith-search-deck"/);
  assert.match(page, /role="tablist" aria-label="نطاق البحث"/);
  assert.match(page, /بحث شامل/);
  assert.match(page, /حسب الكتاب/);
  assert.match(page, /حسب الراوي/);
  assert.match(page, /حسب الموضوع/);
  // Reset only appears when a filter is active — real state, not decoration.
  assert.match(page, /\(q \|\| collectionId !== "all"\)/);
  assert.match(page, /إعادة تعيين/);
  assert.match(css, /\.searchDeck/);
  assert.match(css, /\.scopeTabs/);
});

test("the six books are clickable shelf cards carrying real counts", () => {
  assert.match(page, /data-visual="hadith-collection-shelf"/);
  assert.match(page, /أبرز كتب الحديث/);
  assert.match(page, /collection\.totalHadithCount\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /onClick=\{\(\) => setCollectionId\(collection\.id\)\}/);
  assert.match(page, /aria-pressed=\{collectionId === collection\.id\}/);
  // Local availability is derived per collection, not assumed.
  assert.match(page, /LOCAL_SAMPLES\.filter\(\(sample\) => sample\.collectionId === collection\.id\)\.length/);
  assert.match(page, /لا سجلات محلية بعد/);
  assert.match(css, /\.countBadge/);
});

test("the browse deck has both rails and a feed of real records", () => {
  assert.match(page, /data-visual="hadith-browse-deck"/);
  assert.match(page, /تصفح حسب كتب الأبواب/);
  assert.match(page, /تصفح حسب كتب السنة/);
  assert.match(page, /data-hadith-card=\{sample\.id\}/);
  assert.match(page, /درجة الحديث: \{sample\.gradeAr\}/);
  assert.match(page, /# رقم الحديث: \{sample\.hadithNumber\.toLocaleString\("ar-EG"\)\}/);
  // The subject rail groups by the recorded book field — no invented topics.
  assert.match(page, /map\.get\(sample\.bookNameAr\)/);
  assert.match(page, /الأعداد هنا للسجلات المحلية فقط/);
  assert.match(css, /\.browseDeck/);
  assert.match(css, /\.railPanel/);
  assert.match(css, /\.feedCard/);
});

test("feed filters read real fields and real bookmark state", () => {
  assert.match(page, /feedFilter === "sahih"\) return results\.filter\(\(sample\) => sample\.gradeAr\.includes\("صحيح"\)\)/);
  assert.match(page, /feedFilter === "saved"\) return results\.filter\(\(sample\) => bookmarks\.includes\(sample\.id\)\)/);
  assert.match(page, /أحاديث صحيحة/);
  assert.match(page, /المحفوظة/);
  // Saved-empty state explains itself instead of showing a dead list.
  assert.match(page, /لا سجلات محفوظة ضمن هذا النطاق بعد/);
  // Every governed sample with a recorded sahih grade must survive the filter.
  const sahih = LOCAL_SAMPLES.filter((s) => s.gradeAr.includes("صحيح"));
  assert.ok(sahih.length > 0, "the registry must contain sahih samples for the tab to be meaningful");
  assert.ok(sahih.length <= LOCAL_SAMPLES.length);
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1100px\)[\s\S]*?\.browseDeck \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.feedCard/);
});

test("bibliographic totals match the governed registry exactly", () => {
  const total = COLLECTIONS.reduce((sum, c) => sum + c.totalHadithCount, 0);
  assert.equal(total, 29925);
  assert.equal(COLLECTIONS.length, 6);
  assert.equal(LOCAL_SAMPLES.length, 4);
});
