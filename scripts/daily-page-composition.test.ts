/**
 * Daily sanctuary full-page composition — approved reference 09_daily.png.
 *
 * The reference is a whole page: hero (identity · features · CTAs · today's
 * guidance card), prayer observatory, spiritual rhythm, calendar/wird cards,
 * tasbih counter, daily routine checklist, daily lessons, progress ring and
 * quick tools. Every number is measured from local state or real registries;
 * the prayer times come from the governed provider with honest fallback;
 * the daily verse comes from the governed Quran corpus with no reward claim.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const page = read("client/src/visual-golden/pages/DailyPage.tsx");
const css = read("client/src/visual-golden/pages/DailyPage.module.css");

test("the hero keeps the plate composition with identity, features and CTAs", () => {
  assert.match(page, /data-visual="daily-hero"/);
  assert.match(page, /worldPlateForWing\("daily"\)\.plate/);
  assert.match(page, /styles\.heroPlate/);
  assert.match(page, /الهداية اليومية والعبادة/);
  assert.match(page, /إرشادات عملية لعبادة أفضل/);
  assert.match(page, /ابدأ روتينك اليومي/);
  assert.match(page, /إيقاع العبادة اليومي/);
  assert.match(page, /document\.getElementById\("daily-routine"\)\?\.scrollIntoView/);
  assert.match(page, /document\.getElementById\("daily-rhythm"\)\?\.scrollIntoView/);
  assert.match(css, /\.heroPlate/);
  assert.match(css, /\.heroFeatures/);
  assert.match(css, /\.heroCtas/);
  assert.match(css, /\.heroPrimary/);
  assert.match(css, /\.heroGhost/);
});

test("today's guidance card reads a corpus-sourced verse with no reward claim", () => {
  assert.match(page, /data-visual="daily-today-guidance"/);
  assert.match(page, /getDailyVerse/);
  assert.match(page, /dailyVerseDayKey/);
  assert.match(page, /تعذّر قراءة آية اليوم من المصحف المحلي — لا يُعرض نص بديل غير موثق/);
  assert.match(page, /لا تُعرض نصًا بديلًا غير موثق|لا يُعرض نص بديل غير موثق/);
  // No fabricated reward arithmetic or guaranteed-thawab wording.
  assert.doesNotMatch(page, /أجرك|ثواب مضمون|حسنة|بإذن الله تعالى/);
});

test("the page keeps a single h1", () => {
  const h1Count = (page.match(/<h1[ >]/g) ?? []).length;
  assert.equal(h1Count, 1, "one page-level h1 in the hero only");
});

test("the prayer observatory and verified corpus components stay mounted", () => {
  assert.match(page, /<PrayerObservatory \/>/);
  assert.match(page, /<QuranAdhkar \/>/);
  assert.match(page, /<QuranDuas \/>/);
  assert.match(css, /\.hero/);
});

test("the spiritual rhythm stays schematic — stations only, no rulings", () => {
  assert.match(page, /data-visual="daily-rhythm"/);
  assert.match(page, /إيقاع اليوم الروحي/);
  assert.match(page, /محطات يومية إرشادية — لا مواقيت شرعية بديلة/);
  assert.match(page, /قيام الليل/);
  assert.match(page, /أذكار الصباح/);
  assert.match(page, /أذكار المساء/);
  assert.match(page, /مراجعة اليوم/);
  assert.match(css, /\.rhythm/);
  assert.match(css, /\.rhythmItem/);
});

test("the calendar is computed from the runtime calendar, never hardcoded", () => {
  assert.match(page, /readCalendar/);
  assert.match(page, /u-ca-islamic/);
  assert.match(page, /التقويم الهجري والميلادي/);
  assert.match(page, /التقويم الهجري محسوب محليًا/);
  assert.match(css, /\.calendarCard/);
  assert.match(css, /\.calRow/);
});

test("the wird card avoids ungoverned juz/hizb scheduling claims", () => {
  assert.match(page, /data-visual="daily-wird"/);
  assert.match(page, /وردك اليومي من القرآن الكريم/);
  assert.match(page, /لا نعرض مواعيد أجزاء أو أحزاب غير مربوطة بمصدر محكوم/);
  assert.doesNotMatch(page, /الحزب|الجزء\s*\d| juz |hizb /i);
});

test("the tasbih counter persists through the institution store", () => {
  assert.match(page, /useInstitution\(\(s\) => s\.tasbih\)/);
  assert.match(page, /setCount\(\(c\) => Math\.max\(0, c - 1\)\)/);
  assert.match(css, /\.tasbihHead/);
  assert.match(css, /\.quickDhikr/);
});

test("the routine checklist is local, persisted and fail-closed", () => {
  assert.match(page, /data-visual="daily-routine"/);
  assert.match(page, /روتينك العبادي اليومي/);
  assert.match(page, /yra-daily-routine-v1/);
  assert.match(page, /localDayKey/);
  assert.match(page, /لا تعبّر عن ثواب أو قبول/);
  assert.match(page, /أنجزت \$\{routineDone\} من/);
  assert.match(css, /\.routine/);
  assert.match(css, /\.routineCheck/);
});

test("the tools and lessons route only to canonical internal surfaces", () => {
  assert.match(page, /data-visual="daily-tools"/);
  assert.match(page, /data-visual="daily-lessons"/);
  // Every tool entry links to a real canonical internal surface.
  for (const path of [
    "/calendar",
    "/prayer-guide",
    "/qibla-compass",
    "/digital-tasbih",
    "/daily-verse",
    "/five-pillars",
    "/islamic-knowledge",
    "/prophetic-day",
  ]) {
    assert.match(page, new RegExp(`href:\\s*"${path}"`), `tool entry to ${path} must exist`);
  }
  assert.match(css, /\.toolsGrid/);
  assert.match(css, /\.toolItem/);
});

test("the progress ring is computed from local routine state only", () => {
  assert.match(page, /data-visual="daily-progress"/);
  assert.match(page, /متابعة روحيتك اليوم/);
  assert.match(page, /strokeDasharray/);
  assert.match(page, /خطوات روتينك المكتملة اليوم/);
  assert.match(css, /\.ringBar/);
  assert.match(css, /\.ringTrack/);
});

test("the composition stays responsive and motion-safe", () => {
  assert.match(css, /@media \(max-width: 1024px\)[\s\S]*?\.hero \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.lessonsGrid \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
