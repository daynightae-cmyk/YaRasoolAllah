import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const audioPage = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/AudioPage.tsx"),
  "utf8",
);
const quranPage = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/QuranPage.tsx"),
  "utf8",
);
const audioStyles = readFileSync(
  join(repoRoot, "client/src/visual-golden/pages/AudioPage.module.css"),
  "utf8",
);

test("Quran audio surfaces provider stream failures accessibly", () => {
  for (const source of [audioPage, quranPage]) {
    assert.match(source, /onError=\{handle(?:Stream|AudioStream)Error\}/);
    assert.match(source, /role="alert"/);
    assert.match(source, /تعذر تشغيل البث من MP3Quran/);
  }
});

test("Quran audio clears stream failures when playback or source changes", () => {
  assert.match(audioPage, /setStreamError\(null\)/);
  assert.match(quranPage, /setAudioStreamError\(null\)/);
});

test("Audio theatre gives stream failures a visible treatment", () => {
  assert.match(audioStyles, /\.streamError\s*\{/);
});
