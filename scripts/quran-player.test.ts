/**
 * Quran sanctuary listening player — directive §4.D.
 *
 * Real playback controls over the governed MP3Quran stream: seek, repeat,
 * canonical-order queue with honest auto-advance, and a persistent reciter
 * preference. No invented word-level timings; no auto-play on manual browse.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("quran sanctuary listening player", () => {
  const page = read("client/src/visual-golden/pages/QuranPage.tsx");
  const css = read("client/src/visual-golden/pages/QuranPage.module.css");

  it("seek operates on the real governed stream position", () => {
    assert.match(page, /data-visual="quran-seek"/);
    assert.match(page, /audio\.currentTime = target/);
    // Seek is clamped to the actual media duration, never beyond it.
    assert.match(page, /Math\.min\(Math\.max\(0, seconds\), audio\.duration\)/);
    // Disabled until the provider stream's metadata proves a duration.
    assert.match(page, /disabled=\{!selectedReciter \|\| audioDuration <= 0\}/);
    assert.match(page, /onTimeUpdate=/);
    assert.match(page, /onLoadedMetadata=/);
    assert.match(css, /\.seekBar/);
  });

  it("repeat is native looping of the current surah, persisted locally", () => {
    assert.match(page, /data-visual="quran-repeat"/);
    assert.match(page, /loop=\{audioRepeat\}/);
    assert.match(page, /aria-pressed=\{audioRepeat\}/);
    // Repeat short-circuits the auto-advance path — the surah loops instead.
    assert.match(page, /if \(audioRepeat\) return;/);
    assert.match(page, /LISTENING_KEY = "quran-listening-settings-v1"/);
    assert.match(page, /repeat: audioRepeat/);
  });

  it("queue advances in canonical Mushaf order, never auto-plays on browse", () => {
    assert.match(page, /data-visual="quran-queue"/);
    assert.match(page, /data-visual="quran-queue-toggle"/);
    // Auto-advance is armed ONLY by a natural playback end below surah 114.
    // Auto-advance arms AFTER selectSurah clears manual intent — the natural
    // end is the only path that re-arms it.
    assert.match(page, /const handleAudioEnded = \(\) => \{[\s\S]*?if \(active < 114\) \{\s*selectSurah\(active \+ 1\);[\s\S]*?autoAdvanceRef\.current = true;/);
    // Manual selection always clears the intent.
    assert.match(page, /const selectSurah = \(surahNumber: number, targetAyah = 1\) => \{\s*\/\/ Manual navigation cancels[\s\S]*?autoAdvanceRef\.current = false;/);
    // A failed provider response consumes the flag — no stale auto-play.
    assert.match(page, /recitationState\.state === "error"\) \{\s*autoAdvanceRef\.current = false;/);
    // The queue discloses its rules honestly in Arabic.
    assert.match(page, /لا تشغيل تلقائي عند التصفح اليدوي/);
    assert.match(page, /نهاية المصحف — يتوقف الاستماع بعد الناس/);
    assert.match(css, /\.queuePanel/);
  });

  it("reciter preference is a stable provider identity, honored only when available", () => {
    // Preference persists as "id:moshafId" and survives surah changes.
    assert.match(page, /reciterKey: selectedReciterKey \?\? preferredReciterKey\.current/);
    assert.match(page, /preferredReciterKey\.current = key/);
    // On a new surah the preferred reciter is used only if actually present.
    assert.match(page, /payload\.reciters\.find\(\(item\) => `\$\{item\.id\}:\$\{item\.moshafId\}` === preferredReciterKey\.current\)/);
    assert.match(page, /const chosen = preferred \?\? payload\.reciters\[0\]/);
  });

  it("volume and listening settings persist across restarts, fail-closed", () => {
    assert.match(page, /volume: Number\.isFinite\(settings\.volume\) \? Math\.min\(1, Math\.max\(0, settings\.volume!\)\) : 0\.78/);
    assert.match(page, /repeat: settings\.repeat === true/);
    assert.match(page, /safeWriteJson\(LISTENING_KEY/);
  });

  it("keeps governed provider wording and honest failure states", () => {
    assert.match(page, /بث مباشر داخل المنصة · MP3Quran\.net/);
    assert.match(page, /لا توجد تلاوة متاحة لهذه السورة في استجابة المزوّد الآن/);
    assert.match(page, /handleAudioStreamError/);
    // No fabricated verse-level timing claims anywhere in the player.
    assert.doesNotMatch(page, /word.?level|توقيت الكلمات|مزامنة الآية/);
  });
});
