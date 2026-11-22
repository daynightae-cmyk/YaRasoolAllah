/**
 * Seerah full-page composition — approved reference 07_seerah.png.
 *
 * The reference is a whole page: a plate hero with identity, a service row,
 * two entry CTAs and a ledger; a journey band above the interactive path; a
 * chapter rail with index chips and an "all chapters" gateway; and an
 * explore rail into the governed surfaces. The reference's ambition figures
 * (26 chapters · 180+ events · 350+ media) are not this registry, so every
 * displayed number must be measured from the local editorial structure, and
 * journey paths stay schematic.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CHAPTERS, CATEGORIES, SEERAH_COUNTS } from "../client/src/visual-golden/services/seerah";
import { SEERAH_JOURNEY_STOPS } from "../client/src/visual-golden/services/seerah-journey";
import { listGhazawatScenes } from "../client/src/visual-golden/services/seerah-ghazawat";
import { ATLAS_COUNTS } from "../client/src/visual-golden/services/atlas";
import { CANONICAL_VISUAL_PATHS } from "../client/src/visual-golden/lib/public-shell";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/SeerahPage.tsx");
const css = read("client/src/visual-golden/pages/SeerahPage.module.css");

test("the hero keeps the plate composition with a measured ledger", () => {
  assert.match(page, /data-visual="seerah-hero"/);
  assert.match(page, /styles\.heroPlate/);
  assert.match(page, /\/visual-golden\/art\/worlds\/seerah\.webp/);
  assert.match(page, /\{SEERAH_COUNTS\.chapters\}/);
  assert.match(page, /\{SEERAH_COUNTS\.timelineEvents\}/);
  assert.match(page, /\{SEERAH_JOURNEY_STOPS\.length\}/);
  assert.match(page, /\{SEERAH_COUNTS\.categories\}/);
  assert.match(page, /الأعداد من البنية التحريرية المحلية/);
  assert.match(css, /\.heroPlate/);
  assert.match(css, /\.heroServices/);
  assert.match(css, /\.heroLedger/);
});

test("the hero never prints the reference's ambition figures", () => {
  for (const figure of ["350+", "180+", "26 فصلًا رئيسيًا", "12 مسارًا"]) {
    assert.ok(!page.includes(figure), `page must not print the unmeasurable figure ${figure}`);
  }
});

test("the page keeps a single h1", () => {
  const h1Count = (page.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, "one page-level h1 in the hero only");
});

test("the service row and CTAs point at real surfaces", () => {
  assert.match(page, /<Link href="\/seerah\/database">/);
  assert.match(page, /<Link href="\/atlas">/);
  assert.match(page, /<Link href="\/sources">/);
  assert.match(page, /<Link href="\/basirah">/);
  assert.match(page, /ابدأ رحلة السيرة/);
  assert.match(page, /نبذة عن الرحلة السينمائية/);
  assert.match(page, /document\.getElementById\("chapter-reading"\)\?\.scrollIntoView/);
  assert.match(page, /document\.getElementById\("seerah-journey-theatre"\)\?\.scrollIntoView/);
  assert.match(css, /\.heroPrimary/);
  assert.match(css, /\.heroGhost/);
});

test("the journey band labels the recorded stops and keeps the theatre intact", () => {
  assert.match(page, /data-visual="seerah-journey-band"/);
  assert.match(page, /\{SEERAH_JOURNEY_STOPS\.length\} محطات رحلة مسجّلة/);
  assert.match(page, /عرض الخريطة التفاعلية/);
  // The real theatre component stays mounted exactly as contracted.
  assert.match(page, /<SeerahJourneyTheatre initialIndex=\{journeyInitialIndex\} \/>/);
  assert.match(page, /id="seerah-journey-theatre"/);
  assert.match(css, /\.journeyBand/);
  assert.match(css, /\.bandCta/);
});

test("the chapter rail keeps index chips and an all-chapters gateway", () => {
  assert.match(page, /data-chapter-id=\{c\.id\}/);
  assert.match(page, /styles\.stageIndex/);
  assert.match(page, /String\(c\.order\)\.padStart\(2, "0"\)/);
  assert.match(page, /className=\{styles\.allChapters\}/);
  assert.match(page, /جميع الفصول/);
  assert.match(page, /\{SEERAH_COUNTS\.timelineEvents\} محطة في القاعدة/);
  assert.match(css, /\.stageIndex/);
  assert.match(css, /\.allChapters/);
});

test("the explore rail routes into canonical governed surfaces only", () => {
  assert.match(page, /data-visual="seerah-explore-rail"/);
  assert.match(page, /المصادر والمراجع/);
  assert.match(page, /الخرائط والمسارات/);
  assert.match(page, /الرحلات والغزوات/);
  assert.match(page, /قاعدة السيرة الزمنية/);
  assert.match(page, /مقالات ودراسات/);
  assert.match(page, /الصوت والتلاوات/);
  // Measured counts only.
  assert.match(page, /\{ATLAS_COUNTS\.nodes\} موضعًا تخطيطيًا/);
  assert.match(page, /\{SEERAH_COUNTS\.timelineEvents\} محطة مسجّلة/);
  assert.match(page, /\{listGhazawatScenes\(\)\.length\} مشهدًا/);
  // The battles card selects the real recorded chapter — no invented route.
  assert.match(page, /selectChapter\("battles-conquests"\)/);
  assert.match(css, /\.exploreRail/);
  assert.match(css, /\.exploreGrid/);
  assert.match(css, /\.exploreCard/);
});

test("registry totals used by the composition match the governed data exactly", () => {
  assert.equal(CHAPTERS.length, SEERAH_COUNTS.chapters);
  assert.equal(CATEGORIES.length, SEERAH_COUNTS.categories);
  assert.equal(
    SEERAH_COUNTS.timelineEvents,
    CHAPTERS.reduce((sum, chapter) => sum + (chapter.timelineEvents?.length ?? 0), 0),
  );
  assert.equal(SEERAH_JOURNEY_STOPS.length, 10);
  assert.equal(ATLAS_COUNTS.nodes, 9);
  assert.equal(listGhazawatScenes().length, 7);
  // Every rail destination is a declared canonical public route.
  for (const path of ["/seerah/database", "/atlas", "/sources", "/basirah", "/audio"]) {
    assert.ok(
      (CANONICAL_VISUAL_PATHS as readonly string[]).includes(path),
      `${path} must stay a canonical route`,
    );
  }
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1000px\)[\s\S]*?\.exploreGrid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.exploreGrid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
