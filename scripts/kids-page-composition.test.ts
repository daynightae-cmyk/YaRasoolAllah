/**
 * Children & family full-page composition — approved reference 08_children.png.
 *
 * The reference is a whole page: a hero with identity, declared commitments,
 * two entry CTAs and a four-cell ledger; an interest chip row; a series band;
 * a safety band; and an explore rail. The reference's ambition figures
 * (+1200 stories · +780 lessons · +340 activities · +90 paths) are not this
 * registry, so every displayed number must be measured — and the safety band
 * may only declare design commitments, never a safety certificate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { KIDS_COUNTS, KIDS_STORIES } from "../client/src/visual-golden/services/kids";
import { PARENT_DISCOVERY_SOURCES } from "../shared/kids-media-governance";
import { mediaAssetRegistry, childrenAdaptationRegistry } from "../shared/knowledge-registry";
import { CANONICAL_VISUAL_PATHS } from "../client/src/visual-golden/lib/public-shell";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/KidsPage.tsx");
const css = read("client/src/visual-golden/pages/KidsPage.module.css");

test("the hero keeps the plate composition with a measured ledger", () => {
  assert.match(page, /data-visual="kids-hero"/);
  assert.match(page, /worldPlateForWing\("kids"\)\.plate/);
  assert.match(page, /styles\.heroPlate/);
  assert.match(page, /\{KIDS_COUNTS\.adaptations\}/);
  assert.match(page, /\{KIDS_COUNTS\.clearedMedia\}/);
  assert.match(page, /\{AGE_BANDS\.length\}/);
  assert.match(page, /\{PARENT_DISCOVERY_SOURCES\.length\}/);
  assert.match(page, /«موارد الاستكشاف» صفحات ناشرين ليراجعها الأهل، وليست حلقات معتمدة أو تشغيلًا داخل المنصة/);
  assert.match(css, /\.heroPlate|\.gardenWorld/);
  assert.match(css, /\.heroPledge/);
  assert.match(css, /\.heroLedger/);
});

test("the hero never prints the reference's ambition figures", () => {
  for (const figure of ["1,200", "1200", "+780", "780+", "+340", "340+", "+90", "90+"]) {
    assert.ok(!page.includes(figure), `page must not print the unmeasurable figure ${figure}`);
  }
});

test("the page keeps a single h1 and real entry CTAs", () => {
  const h1Count = (page.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, "one page-level h1 in the hero only");
  assert.match(page, /ابدأ الرحلة العائلية/);
  assert.match(page, /دليل ولي الأمر/);
  assert.match(page, /document\.getElementById\("kids-adapt-grid"\)\?\.scrollIntoView/);
  assert.match(page, /document\.getElementById\("parent-sources-title"\)\?\.scrollIntoView/);
  assert.match(css, /\.heroPrimary/);
  assert.match(css, /\.heroGhost/);
});

test("declared commitments stay commitments, never a certificate", () => {
  assert.match(page, /بلا تجسيد للنبي صلى الله عليه وسلم ولا للصحابة/);
  assert.match(page, /لا إعلانات ولا تتبّع داخل مسرح الأطفال/);
  assert.match(page, /المراجعة العلمية معلّقة على كل تكييف قبل النشر/);
  assert.match(page, /هذه التزامات تصميمية معلنة، وليست شهادة سلامة محتوى/);
  assert.doesNotMatch(page, /شهادة سلامة معتمدة/);
  assert.doesNotMatch(page, /معتمد علميًا/);
  assert.match(css, /\.safetyBand/);
  assert.match(css, /\.safetyList/);
});

test("the interest rail opens real wings or real in-page sections", () => {
  assert.match(page, /data-visual="kids-interest-rail"/);
  assert.match(page, /تصفح حسب الاهتمام/);
  assert.match(page, /<Link href="\/seerah">سيرة النبي صلى الله عليه وسلم<\/Link>/);
  assert.match(page, /<Link href="\/quran">لكل الأعمار<\/Link>/);
  // Every in-page chip target must be a real element id on this page.
  for (const anchor of ["kids-adapt-grid", "kids-tv-room", "parent-sources-title", "kids-activities"]) {
    assert.match(page, new RegExp(`id="${anchor}"`), `${anchor} must exist for the rail chips`);
    assert.match(page, new RegExp(`getElementById\\("${anchor}"\\)`), `${anchor} must be a chip target`);
  }
  assert.match(css, /\.interestChips/);
});

test("the series band keeps the governed selector contract intact", () => {
  assert.match(page, /id="kids-adapt-grid"/);
  assert.match(page, /سلسلة تكييفات الأطفال/);
  assert.match(page, /KIDS_COUNTS\.adaptations\} recorded/);
  // The accessible selector and the age filter remain untouched contracts.
  assert.match(page, /id="kids-adaptation-select"/);
  assert.match(page, /data-visual="kids-age-filter"/);
  assert.match(page, /aria-pressed=\{ageFilter === band\}/);
});

test("the explore rail routes into canonical governed surfaces only", () => {
  assert.match(page, /data-visual="kids-explore-rail"/);
  const railStart = page.indexOf('data-visual="kids-explore-rail"');
  assert.ok(railStart > 0, "the explore rail must exist");
  const rail = page.slice(railStart, railStart + 3200);
  const hrefs = [...rail.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(hrefs.length >= 5, "the rail must hold real gateways");
  for (const href of hrefs) {
    const path = href.split("?")[0];
    assert.ok(
      (CANONICAL_VISUAL_PATHS as readonly string[]).includes(path),
      `${href} must stay a canonical surface`,
    );
  }
  assert.match(page, /كل رابط يفتح سطحًا محكومًا داخل المنصة/);
  assert.match(css, /\.exploreGrid/);
  assert.match(css, /\.exploreCard/);
});

test("registry totals used by the composition match the governed data exactly", () => {
  assert.equal(KIDS_COUNTS.adaptations, childrenAdaptationRegistry.length);
  assert.equal(KIDS_COUNTS.clearedMedia, mediaAssetRegistry.length);
  assert.equal(KIDS_COUNTS.clearedMedia, 0, "no adaptation is a cleared video");
  assert.equal(KIDS_STORIES.length, childrenAdaptationRegistry.length);
  assert.ok(PARENT_DISCOVERY_SOURCES.length > 0);
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1000px\)[\s\S]*?\.exploreGrid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.exploreGrid \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
