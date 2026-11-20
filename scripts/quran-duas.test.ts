/**
 * QuranDuas contract — supplications must come from the verified corpus.
 *
 * Guards:
 * - References point at real surah/ayah ranges in the canonical chapter list.
 * - No dua Arabic text is hard-coded in the component (runtime corpus read).
 * - The honest scope note about the pending hadith corpus stays present.
 * - DailyPage mounts the component instead of image-only scaffold cards.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getQuranChapters } from "../client/src/services/quranService";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const component = read("client/src/visual-golden/components/prayer/QuranDuas.tsx");
const adhkarComponent = read("client/src/visual-golden/components/prayer/QuranAdhkar.tsx");
const daily = read("client/src/visual-golden/pages/DailyPage.tsx");

describe("quran duas references", () => {
  it("uses only canonical surah/ayah ranges", async () => {
    const chapters = await getQuranChapters();
    const refs = [...component.matchAll(/surah: (\d+), ayah: (\d+)/g)].map((match) => ({
      surah: Number(match[1]),
      ayah: Number(match[2]),
    }));
    assert.ok(refs.length >= 5, "at least five Quranic supplications");
    for (const { surah, ayah } of refs) {
      const chapter = chapters.find((item) => item.number === surah);
      assert.ok(chapter, `surah ${surah} must exist`);
      assert.ok(ayah >= 1 && ayah <= chapter.ayahCount, `${surah}:${ayah} in range`);
    }
  });

  it("reads text at runtime from the governed corpus service", () => {
    assert.match(component, /getQuranVerse/);
    assert.match(component, /from "@\/services\/quranService"/);
    // No hard-coded Arabic verse text inside the component source.
    assert.doesNotMatch(component, /رَبَّنَا|رَبِّ اشْرَحْ|رَبِّ هَبْ/);
    assert.match(component, /لا يُعرض نص بديل غير موثق/);
    assert.match(component, /مدونة الحديث/);
  });

  it("is mounted in the daily sanctuary page", () => {
    assert.match(daily, /import \{ QuranDuas \}/);
    assert.match(daily, /<QuranDuas \/>/);
    assert.doesNotMatch(daily, /أدعية مختارة/);
  });
});

describe("quran adhkar references", () => {
  it("uses only canonical surah/ayah ranges", async () => {
    const chapters = await getQuranChapters();
    const refs = [...adhkarComponent.matchAll(/surah: (\d+), ayah: (\d+)/g)].map((match) => ({
      surah: Number(match[1]),
      ayah: Number(match[2]),
    }));
    assert.ok(refs.length >= 5, "at least five Quranic remembrance verses");
    for (const { surah, ayah } of refs) {
      const chapter = chapters.find((item) => item.number === surah);
      assert.ok(chapter, `surah ${surah} must exist`);
      assert.ok(ayah >= 1 && ayah <= chapter.ayahCount, `${surah}:${ayah} in range`);
    }
  });

  it("reads text at runtime and keeps the hadith boundary explicit", () => {
    assert.match(adhkarComponent, /getQuranVerse/);
    assert.match(adhkarComponent, /from "@\/services\/quranService"/);
    assert.doesNotMatch(adhkarComponent, /اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ|أَلَا بِذِكْرِ/);
    assert.match(adhkarComponent, /لا يُعرض نص بديل غير موثق/);
    assert.match(adhkarComponent, /مدونة الحديث/);
  });

  it("replaces the unbound adhkar scaffold in the daily page", () => {
    assert.match(daily, /import \{ QuranAdhkar \}/);
    assert.match(daily, /<QuranAdhkar \/>/);
    assert.doesNotMatch(daily, /غير مربوط بعد بمصدر موثق/);
  });
});
