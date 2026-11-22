/**
 * Atlas full-page composition — approved reference 06_atlas.png.
 *
 * The reference is a whole page: plate hero with honest ledger, a Seerah
 * era timeline rail with playback, the living theatre stage, and a lower
 * deck (latest recorded events · featured campaign maps · specialized
 * atlas gateways). The reference's polity-era labels (الخلفاء الراشدون،
 * الأمويون…) are ambition — this registry records ten Seerah narrative
 * eras, and the rail must show exactly those, never invented borders or
 * dynasties. Every displayed number must be measured.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { SEERAH_DATABASE, SEERAH_DATABASE_COUNTS, getEventsForEra } from "../client/src/data/seerah/index";
import { LIVING_CAMPAIGNS } from "../client/src/visual-golden/data/living-atlas";
import { ATLAS_COUNTS, ATLAS_NODES } from "../client/src/visual-golden/services/atlas";
import { listGhazawatScenes } from "../client/src/visual-golden/services/seerah-ghazawat";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/AtlasPage.tsx");
const css = read("client/src/visual-golden/pages/LivingAtlasPage.module.css");

test("the hero keeps the plate composition with a measured ledger", () => {
  assert.match(page, /data-visual="atlas-hero"/);
  assert.match(page, /styles\.atlasHeroPlate/);
  assert.match(page, /ATLAS_COUNTS\.nodes\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /LIVING_CAMPAIGNS\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /SEERAH_DATABASE_COUNTS\.events\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /SEERAH_DATABASE_COUNTS\.eras\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /بلا تجسيد للنبي ﷺ ولا محاكاة قتال، وبلا إحداثيات مساحية/);
  assert.match(css, /\.atlasHeroPlate/);
  assert.match(css, /\.atlasServices/);
  assert.match(css, /\.atlasLedger/);
});

test("the page keeps a single h1 — the stage title is an h2", () => {
  const h1Count = (page.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, "one page-level h1 in the hero only");
  assert.match(page, /<h2 className=\{styles\.stageTitle\}>/);
  assert.match(css, /\.stageTitle/);
});

test("the era rail walks the ten recorded Seerah eras — never invented dynasties", () => {
  assert.match(page, /data-visual="atlas-era-rail"/);
  assert.match(page, /SEERAH_DATABASE\.eras\.map\(\(era\) => \(\{ era, count: getEventsForEra\(era\.id\)\.length \}\)\)/);
  assert.match(page, /role="tablist" aria-label="عصور السيرة"/);
  // Playback exists, is labelled, and yields to reduced motion.
  assert.match(page, /aria-label=\{eraPlaying \? "إيقاف التشغيل التلقائي للعصور" : "تشغيل تلقائي للعصور"\}/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /if \(reduced\) \{\s*setEraPlaying\(false\);/);
  // Selecting an era deep-links the chronological database, which reads ?era=.
  assert.match(page, /\/seerah\/database\?era=/);
  const database = read("client/src/visual-golden/pages/SeerahDatabasePage.tsx");
  assert.match(database, /params\.get\("era"\)/);
  assert.match(database, /SEERAH_DATABASE\.eras\.some\(\(era\) => era\.id === requestedEraId\)/);
  assert.match(css, /\.eraRail\b/);
  assert.match(css, /\.eraOn/);
  // Registry-level truth: ten eras, all with at least one recorded event.
  assert.equal(SEERAH_DATABASE.eras.length, 10);
  assert.equal(SEERAH_DATABASE_COUNTS.eras, 10);
  for (const era of SEERAH_DATABASE.eras) {
    assert.ok(getEventsForEra(era.id).length > 0, `era ${era.id} must have recorded events`);
  }
});

test("the living theatre stage stays intact inside the full page", () => {
  // The hero wraps the stage; it never replaces the interactive theatre.
  assert.match(page, /<LivingTerrainTheatre/);
  assert.match(page, /plate=\{campaign\.plate\}/);
  assert.match(page, /data-visual="atlas-observer-enter"/);
  assert.match(page, /TerrainTheatre3D/);
  assert.match(page, /onUnavailable/);
  assert.match(page, /نعيش الحدث بالمكان والزمن والرواية\. لا صورة لرسول الله ﷺ ولا محاكاة قتال/);
});

test("the lower deck shows latest recorded events from the registry", () => {
  assert.match(page, /data-visual="atlas-lower-deck"/);
  assert.match(page, /\[\.\.\.SEERAH_DATABASE\.events\]\.sort\(\(a, b\) => b\.order - a\.order\)\.slice\(0, 4\)/);
  assert.match(page, /\/seerah\/database\?event=/);
  assert.match(page, /عرض جميع الأحداث \(\{SEERAH_DATABASE_COUNTS\.events\.toLocaleString\("ar-EG"\)\}\)/);
  assert.match(css, /\.lowerDeck/);
  assert.match(css, /\.latestList/);
});

test("featured maps are the real campaign theatres with distinct scene plates", () => {
  assert.match(page, /const FEATURED_CAMPAIGNS = LIVING_CAMPAIGNS\.map/);
  assert.match(page, /ghazawatScenes\.find\(\(item\) => item\.atlasCampaignId === campaign\.id\)/);
  assert.match(page, /setMode\("theatre"\);\s*setCampaignId\(item\.id\);\s*stageRef\.current\?\.scrollIntoView/);
  assert.match(page, /كل خريطة مسرح حي بطبقات ومراحل وشاهد نصي — وليست صورة ثابتة/);
  assert.match(css, /\.featuredGrid/);
  assert.match(css, /\.featuredOn/);
  // Every living campaign has a documented ghazawat scene plate.
  const scenes = listGhazawatScenes();
  for (const campaign of LIVING_CAMPAIGNS) {
    assert.ok(
      scenes.some((scene) => scene.atlasCampaignId === campaign.id),
      `campaign ${campaign.id} needs a distinct featured plate`,
    );
  }
});

test("specialized atlas gateways route to real views with measured counts", () => {
  assert.match(page, /أطلس الغزوات/);
  assert.match(page, /filterNodes\("battles"\)\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /filterNodes\("journey"\)\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /setPlaceFilter\("battles"\)/);
  assert.match(page, /setPlaceFilter\("journey"\)/);
  assert.match(page, /href="\/seerah\/database"/);
  assert.match(page, /href="\/library"/);
  assert.match(css, /\.specialGrid/);
  // Registry-level truth used by the gateways.
  assert.equal(ATLAS_COUNTS.nodes, ATLAS_NODES.length);
  assert.ok(LIVING_CAMPAIGNS.length >= 4);
});

test("the composition ends with the reconstruction disclosure", () => {
  assert.match(page, /الأطلس إعادة بناء فنية تعليمية: المواضع تخطيطية على لوحات، لا خرائط مساحية ولا إحداثيات/);
  assert.match(page, /العلاقات والأحداث من قاعدة السيرة المحكومة فقط/);
  assert.match(css, /\.atlasBoundary/);
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1100px\)[\s\S]*?\.lowerDeck \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.eraRail \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
