import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync("client/src/visual-golden/pages/LibraryPage.tsx", "utf8");
const catalog = readFileSync(
  "client/src/visual-golden/components/library/LibraryCatalog.tsx",
  "utf8",
);
const hall = readFileSync(
  "client/src/visual-golden/components/library/CatalogShelfHall.tsx",
  "utf8",
);

test("library hero search query is shared with the catalog view", () => {
  assert.match(page, /<LibraryCatalog[\s\S]*?query=\{q\}[\s\S]*?onQuery=\{setQ\}/);
});

test("catalog accepts a controlled query and keeps uncontrolled deep-link usage", () => {
  assert.match(catalog, /query\?: string; onQuery\?: \(value: string\) => void/);
  assert.match(catalog, /const query = onQuery \? \(controlledQuery \?\? ""\) : innerQuery/);
  assert.match(catalog, /const setQuery = onQuery \?\? setInnerQuery/);
});

test("shelves view still filters from the same hero query", () => {
  assert.match(page, /<CatalogShelfHall[\s\S]*?query=\{q\}/);
  assert.match(hall, /function workMatches\(work: CatalogWork, query: string\)/);
});

test("catalog exposes language and subcategory filters over real record fields", () => {
  assert.match(catalog, /allSubcategories: "/);
  assert.match(catalog, /allLanguages: "/);
  assert.match(catalog, /work\.language/);
  assert.match(catalog, /work\.subcategory/);
  assert.match(catalog, /setSubcategory\(event\.target\.value\)/);
  assert.match(catalog, /setLanguage\(event\.target\.value\)/);
});
