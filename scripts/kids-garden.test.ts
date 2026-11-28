/**
 * Children & family garden — directive §4.H completion slice.
 *
 * Real educational activity (quiz built ONLY from governed Quran chapter
 * metadata), age-appropriate navigation, opt-in accessible read-aloud with
 * honest device-voice disclosure, and no fabricated facts or safety claims.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildKidsQuiz, kidsQuizComplete, quizRng } from "../client/src/visual-golden/services/kids-quiz";
import type { QuranChapter } from "../client/src/services/quranService";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const CHAPTERS: QuranChapter[] = [
  { number: 1, name: "الفاتحة", arabicName: "الفاتحة", englishName: "Al-Fatihah", ayahCount: 7, revelationType: "meccan" },
  { number: 2, name: "البقرة", arabicName: "البقرة", englishName: "Al-Baqarah", ayahCount: 286, revelationType: "medinan" },
  { number: 112, name: "الإخلاص", arabicName: "الإخلاص", englishName: "Al-Ikhlas", ayahCount: 4, revelationType: "meccan" },
  { number: 113, name: "الفلق", arabicName: "الفلق", englishName: "Al-Falaq", ayahCount: 5, revelationType: "meccan" },
  { number: 114, name: "الناس", arabicName: "الناس", englishName: "An-Nas", ayahCount: 6, revelationType: "meccan" },
];

describe("kids quiz is built from real governed data only", () => {
  it("every option and answer maps to a real chapter name or ayah count", () => {
    const quiz = buildKidsQuiz(CHAPTERS, 42);
    assert.ok(quiz, "a quiz must build from real chapter metadata");
    assert.ok(quiz!.questions.length >= 4);
    const realNames = new Set(CHAPTERS.map((c) => c.arabicName));
    const realCounts = new Set(CHAPTERS.map((c) => c.ayahCount));
    for (const question of quiz!.questions) {
      assert.equal(question.options.length, 4, "four options per question");
      assert.equal(new Set(question.options).size, 4, "options must be distinct");
      assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
      for (const option of question.options) {
        if (question.kind === "ayah-count") {
          const value = Number(option.replace(" آية", ""));
          assert.ok(realCounts.has(value), `option ${option} must be a real ayah count`);
        } else {
          const name = option.replace("سورة ", "");
          assert.ok(realNames.has(name), `option ${option} must be a real surah name`);
        }
      }
      // The reference cites a real chapter and its real count.
      const chapter = CHAPTERS.find((c) => question.referenceAr.includes(`(${c.number})`));
      assert.ok(chapter, "reference must name a real chapter number");
      assert.ok(question.referenceAr.includes(`${chapter!.ayahCount} آية`));
    }
  });

  it("is deterministic per seed and refuses to build without enough real data", () => {
    const a = buildKidsQuiz(CHAPTERS, 7);
    const b = buildKidsQuiz(CHAPTERS, 7);
    assert.deepEqual(a, b, "same seed must produce the same quiz");
    assert.equal(buildKidsQuiz(CHAPTERS.slice(0, 3), 7), null, "fewer than 4 chapters cannot fill honest options");
    assert.equal(buildKidsQuiz([], 7), null);
    const rngA = quizRng(123);
    const rngB = quizRng(123);
    for (let i = 0; i < 5; i += 1) assert.equal(rngA(), rngB());
  });

  it("completion requires every question answered — no inflated progress", () => {
    assert.equal(kidsQuizComplete(0, 6), false);
    assert.equal(kidsQuizComplete(5, 6), false);
    assert.equal(kidsQuizComplete(6, 6), true);
    assert.equal(kidsQuizComplete(1, 0), false, "an empty quiz is never complete");
  });
});

describe("the garden wires the activity honestly", () => {
  const page = read("client/src/visual-golden/pages/KidsPage.tsx");
  const quiz = read("client/src/visual-golden/components/unique/KidsQuizGarden.tsx");
  const theatre = read("client/src/visual-golden/components/present/StoryTheatre.tsx");

  it("the quiz activity opens a real modal, not a placeholder", () => {
    assert.match(page, /data-visual="kids-quiz-open"/);
    assert.match(page, /<KidsQuizGarden/);
    assert.match(page, /onSessionComplete=\{recordQuizSession\}/);
    assert.doesNotMatch(page, /ألغاز إسلامية/);
    // Session count persists fail-closed and only on completed rounds.
    assert.match(page, /QUIZ_KEY = "kids-quiz-sessions-v1"/);
    assert.match(page, /!Number\.isInteger\(parsed\) \|\| parsed < 0/);
    assert.match(quiz, /kidsQuizComplete\(answeredCount, quiz\.questions\.length\)/);
    assert.match(quiz, /completionReportedRef\.current = true/);
    // Same accessible-modal contract as the coloring studio.
    assert.match(quiz, /role="dialog"/);
    assert.match(quiz, /aria-modal="true"/);
    assert.match(quiz, /event\.key === "Escape"/);
    assert.match(quiz, /focusin", keepFocusInside, true/);
    // Failure is visible and recoverable, never silent.
    assert.match(quiz, /role="alert"/);
    assert.match(quiz, /تعذر تجهيز الأسئلة/);
    // Result wording never claims a religious measure.
    assert.match(quiz, /ليس مقياسًا للدين/);
    assert.match(quiz, /لا تقييم ديني ولا مقارنة بالآخرين/);
  });

  it("age-band navigation filters the real registry with live counts", () => {
    assert.match(page, /data-visual="kids-age-filter"/);
    assert.match(page, /aria-pressed=\{ageFilter === band\}/);
    assert.match(page, /ageCounts\.get\(band\) \?\? 0/);
    // Age filter narrows stories to the selected band (behavioral contract,
    // not a specific source pattern).
    assert.match(page, /story\.ageBand !== ageFilter/);
    assert.match(page, /visibleStories\.map/);
    // Topic filter narrows by governed topic mapping.
    assert.match(page, /kidsTopicForAdaptation\(story\.adaptationId\)\?.id !== topicFilter/);
    // The full registry selector keeps covering every registered adaptation.
    assert.match(page, /KIDS_STORIES\.map\(\(story\) => \(/);
  });

  it("read-aloud is opt-in device speech reading the same governed text", () => {
    assert.match(theatre, /data-visual="kids-read-aloud"/);
    assert.match(theatre, /new SpeechSynthesisUtterance\(readAloudText\)/);
    assert.match(theatre, /const readAloudText = \[title, summary\]\.filter\(Boolean\)\.join\("\. "\)/);
    assert.match(theatre, /utterance\.lang = "ar"/);
    assert.match(theatre, /aria-pressed=\{speaking\}/);
    // Only offered when an Arabic-capable voice actually exists (async voices watched).
    assert.match(theatre, /speechSupported && arabicVoiceReady/);
    assert.match(theatre, /voiceschanged/);
    assert.match(theatre, /لا يوجد صوت عربي في محرك النطق بجهازك/);
    // Honest disclosure: device voice, not an approved recording; no autoplay.
    assert.match(theatre, /الصوت من محرك النطق في جهازك، وليس تسجيلًا معتمدًا\. لا تشغيل تلقائي\./);
    // Unsupported devices get a visible note, errors are announced.
    assert.match(theatre, /القراءة الصوتية غير مدعومة على هذا الجهاز/);
    assert.match(theatre, /role="alert"/);
    // Speech never bleeds across stories and stops on unmount.
    assert.match(theatre, /window\.speechSynthesis\.cancel\(\)/);
    // The existing no-approved-media honesty line stays intact.
    assert.match(theatre, /الوسائط المعتمدة \(فيديو\/صوت\) غير متوفرة بعد/);
  });

  it("parent guidance distinguishes fiction from history and claims no certification", () => {
    assert.match(page, /الشخصيات التعليمية افتراضية لا تُنسب\s*إلى وقائع دينية/);
    assert.match(page, /لا ندّعي اعتمادًا\s*علميًا أو شهادة سلامة محتوى/);
    assert.match(page, /القراءة الصوتية بصوت الجهاز اختيارية ولا تعمل تلقائيًا/);
    // Garden paths lead to real wings where they exist.
    assert.match(page, /<Link role="listitem" href="\/seerah">/);
    assert.match(page, /<Link role="listitem" href="\/quran">/);
  });
});
