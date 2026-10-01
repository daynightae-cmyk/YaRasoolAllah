import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const catalogSource = readFileSync(
  "client/src/visual-golden/components/library/LibraryCatalog.tsx",
  "utf8",
);
const page = readFileSync("client/src/visual-golden/pages/LibraryPage.tsx", "utf8");

// These two filters were recovered from the unmerged
// `feat/autonomous-production-closure-20260925` slice and ported onto the newer
// controlled-query component. The gate exists so neither facet can be dropped,
// silently emptied, or reintroduced over duplicate language spellings.
test("catalog offers subcategory and language filters", () => {
  assert.match(catalogSource, /allSubcategories: "/);
  assert.match(catalogSource, /allLanguages: "/);
  assert.match(catalogSource, /setSubcategory\(event\.target\.value\)/);
  assert.match(catalogSource, /setLanguage\(event\.target\.value\)/);
});

test("both facets filter over real record fields", () => {
  assert.match(catalogSource, /work\.subcategory/);
  assert.match(catalogSource, /canonicalLanguage\(work\.language\)/);
});

test("both facets reset pagination, so a filter change cannot strand the reader on an empty page", () => {
  assert.match(
    catalogSource,
    /useEffect\(\(\) => setPage\(1\), \[availability, category, language, query, subcategory\]\)/,
  );
});

test("the filtered list re-derives when either facet changes", () => {
  assert.match(
    catalogSource,
    /\}, \[availability, category, data, lang, language, query, subcategory\]\)/,
  );
});

// The catalog carries `language_original` verbatim from the research CSV, which
// spelled the same language two ways. Without a canonical code the facet would
// offer "العربية" and "Arabic" as two separate filters and hide the rows behind
// the second one.
test("language facets are canonicalized so one language is one filter", () => {
  assert.match(catalogSource, /const LANGUAGE_ALIASES: Record<string, string>/);
  assert.match(catalogSource, /function canonicalLanguage\(/);
  assert.doesNotMatch(
    catalogSource,
    /\.map\(\(work\) => work\.language \|\| UNKNOWN_LANGUAGE\)/,
    "facet must not be built over raw language values",
  );
});

test("the ported filters did not displace the controlled hero query", () => {
  assert.match(catalogSource, /query: externalQuery/);
  assert.match(catalogSource, /const query = externalQuery \?\? ownQuery/);
  assert.match(page, /query=\{q\}/);
  assert.match(page, /onQueryChange=\{setQ\}/);
});
