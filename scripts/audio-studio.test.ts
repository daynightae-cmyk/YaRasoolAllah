/**
 * Audio & recitation studio — directive §4.E.
 *
 * Real studio controls over governed MP3Quran streams: repeat, favorites,
 * resume (exact surah + reciter + position), canonical auto-advance, browser
 * media-session integration, and honest progress visualization. No fabricated
 * audio, no permanent fake waveform motion.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("audio studio controls", () => {
  const page = read("client/src/visual-golden/pages/AudioPage.tsx");
  const css = read("client/src/visual-golden/pages/AudioPage.module.css");

  it("repeat loops the current surah natively and persists", () => {
    assert.match(page, /data-visual="audio-repeat"/);
    assert.match(page, /loop=\{repeat\}/);
    assert.match(page, /aria-pressed=\{repeat\}/);
    assert.match(page, /if \(repeat\) return;/);
    assert.match(page, /repeat: settings\.repeat === true/);
    assert.match(css, /\.playerIconButtonOn/);
  });

  it("favorites persist through the institution store with stable track identity", () => {
    assert.match(page, /data-visual="audio-favorite"/);
    assert.match(page, /useInstitution\(\(state\) => state\.favorites\)/);
    assert.match(page, /`audio:\$\{selectedReciter\.id\}:\$\{selectedReciter\.moshafId\}:surah-\$\{active\}`/);
    assert.match(page, /toggleFavorite\(\{/);
    assert.match(page, /path: `\/audio\?surah=\$\{active\}`/);
  });

  it("resume is exact: same surah AND reciter, position clamped to duration", () => {
    assert.match(page, /STUDIO_RESUME_KEY = "audio-studio-resume-v1"/);
    // Fail-closed validation of the stored record.
    assert.match(page, /!Number\.isInteger\(saved\.surah\) \|\| saved\.surah! < 1 \|\| saved\.surah! > 114/);
    assert.match(page, /\/\^\\d\+:\\d\+\$\/\.test\(saved\.reciterKey\)/);
    // Applied only when the exact saved stream loads.
    assert.match(page, /resume\.surah === active/);
    assert.match(page, /resume\.reciterKey === `\$\{selectedReciter\.id\}:\$\{selectedReciter\.moshafId\}`/);
    assert.match(page, /Math\.min\(resume\.position, Math\.max\(0, audio\.duration - 1\)\)/);
    assert.match(page, /pendingResume\.current = null/);
    // Deep link ?surah= wins over resume.
    assert.match(page, /params\.get\("surah"\)|get\("surah"\)/);
  });

  it("auto-advance is natural-end only, canonical order, never on browse", () => {
    assert.match(page, /const handleEnded = \(\) => \{[\s\S]*?if \(active < 114\) \{\s*changeSurah\(active \+ 1\);[\s\S]*?autoAdvanceRef\.current = true;/);
    assert.match(page, /const changeSurah = \(next: number\) => \{[\s\S]*?autoAdvanceRef\.current = false;/);
    assert.match(page, /reciters\.state === "error"\) \{\s*autoAdvanceRef\.current = false;/);
    assert.match(page, /لا تشغيل تلقائي عند التصفح اليدوي/);
  });

  it("reciter preference is a stable provider identity honored only when available", () => {
    assert.match(page, /preferredReciterKey\.current = `\$\{item\.id\}:\$\{item\.moshafId\}`/);
    assert.match(page, /items\.find\(\(item\) => `\$\{item\.id\}:\$\{item\.moshafId\}` === preferredReciterKey\.current\)/);
    assert.match(page, /setSelectedReciterId\(\(preferred \?\? items\[0\]\)\?\.id \?\? null\)/);
  });

  it("browser media-session controls drive the real player", () => {
    assert.match(page, /navigator\.mediaSession\.metadata = new MediaMetadata/);
    assert.match(page, /setActionHandler\("play"/);
    assert.match(page, /setActionHandler\("pause"/);
    assert.match(page, /setActionHandler\("previoustrack"/);
    assert.match(page, /setActionHandler\("nexttrack"/);
    assert.match(page, /setActionHandler\("seekto"/);
    assert.match(page, /setPositionState/);
    // Metadata names the real reciter and reading, never a synthetic voice.
    assert.match(page, /artist: `\$\{selectedReciter\.name\} · \$\{selectedReciter\.reading\}`/);
  });

  it("keeps governed wording, honest progress, and no fake waveform", () => {
    assert.match(page, /البث مباشر من خوادم MP3Quran\.net داخل المشغل/);
    assert.match(page, /لا أصوات مولدة، لا مدد مختلقة، ولا تنزيلات وهمية/);
    // Progress is the real media position; no decorative animation loop.
    assert.doesNotMatch(page, /waveform|Waveform|موجة صوتية/);
    assert.doesNotMatch(css, /@keyframes[^}]*wave/i);
  });
});
