/**
 * Audio full-page composition — approved reference 10_audio.png.
 *
 * The reference is a whole page: hero (plate · identity · services · CTAs ·
 * measured ledger) above the real now-playing section and player. Every
 * number is measured from real registries/responses — the reference's
 * ambition figures (126,309 · 17,842 · 96%) are never printed. The real
 * player, reciter catalog, 3D studio entry and opt-in studio stay intact.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { AUDIO_COUNTS } from "../client/src/visual-golden/services/audio";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/AudioPage.tsx");
const css = read("client/src/visual-golden/pages/AudioPage.module.css");

test("the hero keeps the plate composition with measured ledger", () => {
  assert.match(page, /data-visual="audio-hero"/);
  assert.match(page, /worldPlateForWing\("audio"\)\.plate/);
  assert.match(page, /styles\.heroPlate/);
  assert.match(page, /عالم من التلاوة والصوت/);
  assert.match(page, /قارئ مباشرة من MP3Quran/);
  assert.match(page, /أرقام طموحة في المرجع/);
  assert.match(page, /reciters\.state === "ready"/);
  assert.match(page, /reciters\.items\.length/);
  assert.match(page, /studioAvailable \? "متاح"/);
  assert.match(page, /chapters\.length/);
  assert.match(page, /AUDIO_COUNTS\.streamingProviders/);
  assert.match(css, /\.heroPlate/);
  assert.match(css, /\.heroServices/);
  assert.match(css, /\.heroLedger/);
  assert.match(css, /\.heroStats/);
});

test("the hero never prints the reference's ambition figures", () => {
  for (const figure of ["126,309", "126309", "17,842", "17842", "96%"]) {
    assert.ok(!page.includes(figure), `page must not print the unmeasurable figure ${figure}`);
  }
});

test("the page keeps a single h1", () => {
  const h1Count = (page.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, "one page-level h1 in the hero only");
});

test("the service row and CTAs are wired to real behavior", () => {
  assert.match(page, /دخول الاستوديو/);
  assert.match(page, /افتح المشغل الكامل/);
  assert.match(page, /document\.getElementById\("audio-player"\)\?\.scrollIntoView/);
  assert.match(page, /setStudioOpen\(true\)/);
  assert.match(page, /studioAvailable/);
  assert.match(css, /\.heroPrimary/);
  assert.match(css, /\.heroGhost/);
});

test("the real player and studio entry stay intact", () => {
  assert.match(page, /data-visual="audio-player"/);
  assert.match(page, /<audio/);
  assert.match(page, /onTimeUpdate/);
  assert.match(page, /onEnded/);
  assert.match(page, /MP3Quran\.net/);
  assert.match(page, /data-visual="audio-studio-enter"/);
  assert.match(page, /ادخل استوديو الاستماع ثلاثي الأبعاد/);
  assert.match(css, /\.player/);
  assert.match(css, /\.studioEnter/);
});

test("reciter catalog remains governed — real MP3Quran response only", () => {
  assert.match(page, /api\/content\/audio\/reciters/);
  assert.match(page, /mp3quran\.net/);
  assert.match(page, /لا توجد تلاوة في استجابة المزوّد لهذه السورة الآن/);
  assert.match(page, /لا نعيد استضافة التسجيل ولا ننسب صوتًا مصطنعًا لقارئ/);
  assert.match(css, /\.streamReciters/);
});

test("registry totals match governed data", () => {
  assert.equal(AUDIO_COUNTS.streamingProviders, 1, "a single governed provider");
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1100px\)[\s\S]*?\.hero \{[\s\S]*?grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.heroStats \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
