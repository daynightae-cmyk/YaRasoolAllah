/**
 * Quiz builder for the children's garden — directive §4.H optional
 * educational activities.
 *
 * Every question is derived from the governed Quran chapter metadata
 * (canonical names + real ayah counts). Nothing is fabricated: no invented
 * facts, no trick options outside the real registry. Pure functions so the
 * activity is deterministic under test and cheap on device.
 */

import type { QuranChapter } from "@/services/quranService";

export type KidsQuizKind = "ayah-count" | "name-match";

export interface KidsQuizQuestion {
  id: string;
  kind: KidsQuizKind;
  promptAr: string;
  /** The exact governed text shown as the subject (surah name or count). */
  subjectAr: string;
  options: string[];
  correctIndex: number;
  /** Real registry reference shown after answering — checkable, not invented. */
  referenceAr: string;
}

export interface KidsQuiz {
  questions: KidsQuizQuestion[];
}

/** Deterministic PRNG (mulberry32) — same seed, same quiz, no Math.random drift. */
export function quizRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = a;
  }
  return copy;
}

/**
 * Build a quiz from real chapter metadata. Distractor options are other
 * REAL chapters' names/counts — never invented numbers or names. Requires at
 * least 4 chapters so every question has 4 distinct options; returns null
 * otherwise (the activity then stays unavailable, honestly).
 */
export function buildKidsQuiz(chapters: readonly QuranChapter[], seed: number): KidsQuiz | null {
  if (chapters.length < 4) return null;
  const rng = quizRng(seed);
  const pool = shuffle([...chapters], rng).slice(0, 6);
  const questions: KidsQuizQuestion[] = [];

  pool.forEach((chapter, index) => {
    const kind: KidsQuizKind = index % 2 === 0 ? "ayah-count" : "name-match";
    if (kind === "ayah-count") {
      // Distractors: real ayah counts of other chapters, distinct values.
      const distractors = new Set<number>();
      for (const other of shuffle([...chapters], rng)) {
        if (other.number === chapter.number || distractors.has(other.ayahCount)) continue;
        distractors.add(other.ayahCount);
        if (distractors.size === 3) break;
      }
      if (distractors.size < 3) return;
      const values = shuffle([chapter.ayahCount, ...distractors], rng);
      questions.push({
        id: `q-${chapter.number}-count`,
        kind,
        promptAr: `كم عدد آيات سورة ${chapter.arabicName}؟`,
        subjectAr: `سورة ${chapter.arabicName}`,
        options: values.map((value) => `${value} آية`),
        correctIndex: values.indexOf(chapter.ayahCount),
        referenceAr: `سورة ${chapter.arabicName} (${chapter.number}) — ${chapter.ayahCount} آية · بيانات المصحف المعتمدة في المنصة`,
      });
    } else {
      const distractors = shuffle(
        chapters.filter((other) => other.number !== chapter.number),
        rng,
      ).slice(0, 3);
      const names = shuffle([chapter.arabicName, ...distractors.map((d) => d.arabicName)], rng);
      questions.push({
        id: `q-${chapter.number}-name`,
        kind,
        promptAr: `أي سورة عدد آياتها ${chapter.ayahCount} آية؟`,
        subjectAr: `${chapter.ayahCount} آية`,
        options: names.map((name) => `سورة ${name}`),
        correctIndex: names.indexOf(chapter.arabicName),
        referenceAr: `سورة ${chapter.arabicName} (${chapter.number}) — ${chapter.ayahCount} آية · بيانات المصحف المعتمدة في المنصة`,
      });
    }
  });

  if (questions.length === 0) return null;
  return { questions };
}

/**
 * A local completion is honest only when every question was answered —
 * mirrors shouldCountColoringSession's no-inflation rule.
 */
export function kidsQuizComplete(answeredCount: number, questionCount: number): boolean {
  return questionCount > 0 && answeredCount === questionCount;
}
