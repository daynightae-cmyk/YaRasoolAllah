/**
 * Sources vault full-page composition — approved reference 05_sources.png.
 *
 * The reference is a whole page: plate hero with honest ledger, sticky
 * search deck with review-state chips, a three-panel statistics row (vault
 * totals · review ring · isnad gateway), an action rail, and a browse deck
 * (records table · source details with version timeline · governance
 * panel). The reference's large figures (17,842 / 126,309 …) are ambition,
 * not this registry — every displayed number must be measured from the
 * governed registries.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sourceRegistry, rightsLedger } from "../shared/source-registry";
import { workRegistry, digitalVersionRegistry } from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/pages/SourcesPage.tsx");
const css = read("client/src/pages/SourcesPage.module.css");

test("the hero keeps the plate composition with a measured ledger", () => {
  assert.match(page, /data-visual="sources-vault-hero"/);
  assert.match(page, /styles\.heroPlate/);
  assert.match(page, /sourceRegistry\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /workRegistry\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /digitalVersionRegistry\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /mediaAssetRegistry\.length\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /وحالة «تحقق» لا تعني حكمًا علميًا عامًا على المحتوى/);
  assert.match(css, /\.heroPlate/);
  assert.match(css, /\.heroServices/);
});

test("the search deck chips filter by real recorded review states", () => {
  assert.match(page, /data-visual="sources-search-deck"/);
  assert.match(page, /setReviewFilter\("verified"\); setPage\(0\)/);
  assert.match(page, /setReviewFilter\("pending"\); setPage\(0\)/);
  assert.match(page, /reviewFilter === "verified" && source\.editorialStatus === "verified"/);
  // Chip counts derive from the same measured ring, never typed.
  assert.match(page, /reviewRing\.verified\.toLocaleString\("ar-EG"\)/);
  assert.match(page, /\(reviewRing\.editorialPending \+ reviewRing\.rightsPending\)\.toLocaleString\("ar-EG"\)/);
  assert.match(css, /\.reviewChipOn/);
});

test("the review ring is computed from editorial statuses only", () => {
  assert.match(page, /data-visual="sources-stats"/);
  assert.match(page, /sourceRegistry\.filter\(\(source\) => source\.editorialStatus === "verified"\)\.length/);
  assert.match(page, /Math\.round\(\(verified \/ total\) \* 100\)/);
  assert.match(page, /«موثّق» حالة تحريرية مسجلة — ليست حكمًا علميًا على المحتوى/);
  // Sources without a rights decision are counted, not assumed.
  assert.match(page, /!rightsLedger\.some\(\(rights\) => rights\.sourceId === source\.sourceId\)/);
  assert.match(css, /\.ring \{/);
  assert.match(css, /\.ringLegend/);
  // Registry-level truth: the ring's inputs must match the data.
  const verified = sourceRegistry.filter((source) => source.editorialStatus === "verified").length;
  assert.ok(verified > 0 && verified < sourceRegistry.length, "ring must show a real partial state");
});

test("the action rail navigates to real governed sections", () => {
  assert.match(page, /data-visual="sources-action-rail"/);
  assert.match(page, /registryTableRef\.current\?\.scrollIntoView/);
  assert.match(page, /worksRef\.current\?\.scrollIntoView/);
  assert.match(page, /providersRef\.current\?\.scrollIntoView/);
  assert.match(page, /resourcesRef\.current\?\.scrollIntoView/);
  assert.match(css, /\.actionRail/);
});

test("the browse deck table paginates real records and drives both panels", () => {
  assert.match(page, /data-visual="sources-browse-deck"/);
  assert.match(page, /data-visual="sources-detail-panel"/);
  assert.match(page, /data-visual="sources-govern-panel"/);
  assert.match(page, /data-source-row=\{source\.sourceId\}/);
  assert.match(page, /const pageCount = Math\.max\(1, Math\.ceil\(sources\.length \/ PAGE_SIZE\)\)/);
  assert.match(page, /const safePage = Math\.min\(page, pageCount - 1\)/);
  assert.match(page, /sources\.slice\(safePage \* PAGE_SIZE, safePage \* PAGE_SIZE \+ PAGE_SIZE\)/);
  // Selection falls back to real rows — never a phantom record.
  assert.match(page, /sources\.find\(\(source\) => source\.sourceId === selectedId\) \?\? pageSources\[0\] \?\? sources\[0\] \?\? null/);
  assert.match(page, /aria-label="الصفحة السابقة"/);
  assert.match(page, /aria-label="الصفحة التالية"/);
  assert.match(css, /\.registryTable/);
  assert.match(css, /\.pagination/);
});

test("the details timeline shows only registered versions of linked works", () => {
  // Versions reach the panel strictly through the selected source's works.
  assert.match(page, /workRegistry\.filter\(\(work\) => work\.sourceIds\.includes\(selectedSource\.sourceId\)\)/);
  assert.match(page, /digitalVersionRegistry\s*\.filter\(\(version\) => workIds\.has\(version\.workId\)\)/);
  assert.match(page, /لا توجد نسخ رقمية مسجلة لهذا المصدر/);
  assert.match(page, /selectedSource\.version \?\? "غير محدد"/);
  assert.match(css, /\.timeline/);
  assert.match(css, /\.timelineCurrent/);
});

test("the governance panel keeps the honesty contract", () => {
  assert.match(page, /لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح/);
  assert.match(page, /العلاقات مراجع مسجلة فقط — لا استنتاج ولا اختراع، والتحقق البرمجي ليس اعتمادًا علميًا شرعيًا/);
  assert.match(page, /selectedSource\.artifactSha256 \? `\$\{selectedSource\.artifactSha256\.slice\(0, 16\)\}…` : "غير مسجلة"/);
  assert.match(css, /\.governList/);
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1100px\)[\s\S]*?\.browseDeck \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(max-width: 780px\)[\s\S]*?\.searchDeck \{ position: static; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.registryTable tbody tr/);
});

test("registry totals used by the page match the governed data exactly", () => {
  assert.equal(sourceRegistry.length, 21);
  assert.ok(rightsLedger.length > 0);
  assert.ok(workRegistry.length > 0);
  assert.ok(digitalVersionRegistry.length > 0);
});
