import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildGlobalSearchIndex,
  buildGlobalSearchQueryActions,
  filterGlobalSearchResults,
  GLOBAL_SEARCH_CATEGORY_TABS,
} from "../client/src/components/Institution/global-search-index";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dialogSource = readFileSync(
  join(repoRoot, "client/src/components/Institution/GlobalSearchDialog.tsx"),
  "utf8",
);

describe("legacy global search compatibility contract", () => {
  it("keeps prefixed identities and canonical entity deep links", () => {
    const index = buildGlobalSearchIndex();
    assert.ok(index.length > 0);
    assert.equal(new Set(index.map((item) => item.id)).size, index.length);

    const library = index.filter((item) => item.category === "book");
    assert.ok(library.length > 0);
    for (const item of library) {
      assert.match(item.id, /^canonical:library:/);
      assert.match(item.path, /^\/library\/work\/[A-Za-z0-9_-]+$/);
    }

    assert.ok(index.some((item) => item.id.startsWith("kids:")));
    assert.ok(index.some((item) => item.id.startsWith("azkar:")));
    assert.ok(index.some((item) => item.id.startsWith("wing:")));
  });

  it("offers explicit Quran and Basirah query actions without claiming results", () => {
    const actions = buildGlobalSearchQueryActions("  الرحمة  ");
    assert.equal(actions.length, 2);
    assert.equal(actions[0]?.id, "action:quran-search");
    assert.equal(actions[1]?.id, "action:basirah-search");
    assert.equal(actions[0]?.category, "quran");
    assert.equal(actions[1]?.category, "basirah");
    assert.equal(
      new URL(actions[0]!.path, "https://example.test").searchParams.get("q"),
      "الرحمة",
    );
    assert.equal(
      new URL(actions[1]!.path, "https://example.test").searchParams.get("q"),
      "الرحمة",
    );
    assert.match(actions[0]!.provenance, /إجراء بحث/);
    assert.match(actions[1]!.provenance, /إجراء بحث/);
    assert.deepEqual(buildGlobalSearchQueryActions("   "), []);
  });

  it("filters by every exposed category while keeping query actions first", () => {
    const index = buildGlobalSearchIndex();
    const all = filterGlobalSearchResults(index, "السيرة", "all");
    assert.equal(all[0]?.id, "action:quran-search");
    assert.equal(all[1]?.id, "action:basirah-search");

    const quran = filterGlobalSearchResults(index, "السيرة", "quran");
    assert.ok(quran.length > 0);
    assert.ok(quran.every((item) => item.category === "quran"));

    const basirah = filterGlobalSearchResults(index, "السيرة", "basirah");
    assert.equal(basirah.length, 1);
    assert.equal(basirah[0]?.id, "action:basirah-search");

    const books = filterGlobalSearchResults(index, "السيرة", "book");
    assert.ok(books.length > 0);
    assert.ok(books.every((item) => item.category === "book"));
  });

  it("exposes the Basirah, Quran, Hadith, and source category tabs", () => {
    const ids = GLOBAL_SEARCH_CATEGORY_TABS.map((tab) => tab.id);
    for (const required of ["all", "quran", "basirah", "hadith", "source_record"]) {
      assert.ok(ids.includes(required as (typeof ids)[number]), `missing ${required}`);
    }
  });

  it("names the search input and exposes filter state accessibly", () => {
    assert.match(dialogSource, /<label htmlFor="global-institutional-search"/);
    assert.match(dialogSource, /id="global-institutional-search"/);
    assert.match(dialogSource, /aria-pressed=\{selectedCategory === tab\.id\}/);
    assert.match(dialogSource, /aria-label="مسح نص البحث"/);
  });
});
