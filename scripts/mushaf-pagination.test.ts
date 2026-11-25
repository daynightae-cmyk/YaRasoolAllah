import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMushafReadingPages, spreadForAyah } from "../client/src/visual-golden/components/quran/mushaf-pagination";

const verses = Array.from({ length: 12 }, (_, index) => ({ ayah: index + 1, arabic: `pagination fixture ${index + 1}` }));

test("page limits preserve every input record in order without rewriting text", () => {
  const pages = buildMushafReadingPages(verses, 10000, 4);
  assert.deepEqual(pages.map((page) => page.verses.length), [4, 4, 4]);
  assert.deepEqual(pages.flatMap((page) => page.verses), verses);
  pages.flatMap((page) => page.verses).forEach((verse, index) => assert.equal(verse, verses[index]));
});

test("seven short records occupy one spread when the opening-page limit is four", () => {
  const pages = buildMushafReadingPages(verses.slice(0, 7), 360, 4);
  assert.deepEqual(pages.map((page) => [page.firstAyah, page.lastAyah]), [[1, 4], [5, 7]]);
  assert.equal(spreadForAyah(pages, 7), 0);
});

test("a long record is retained whole on an independent page", () => {
  const long = { ayah: 2, arabic: "fixture ".repeat(500) };
  const input = [verses[0], long, verses[2]];
  const pages = buildMushafReadingPages(input);
  assert.equal(pages.length, 3);
  assert.equal(pages[1].verses[0], long);
  assert.deepEqual(pages.flatMap((page) => page.verses), input);
});

test("spread selection tracks records on later pages and empty input safely", () => {
  const pages = buildMushafReadingPages(verses, 10000, 2);
  assert.equal(spreadForAyah(pages, 1), 0);
  assert.equal(spreadForAyah(pages, 5), 1);
  assert.equal(spreadForAyah(pages, 12), 2);
  assert.deepEqual(buildMushafReadingPages([]), []);
  assert.equal(spreadForAyah([], 1), 0);
});
