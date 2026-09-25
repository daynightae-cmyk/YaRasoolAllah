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
const visualSmoke = readFileSync(
  join(repoRoot, "scripts/smoke-visual-golden.mjs"),
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

test("Visual smoke exercises rendered audio failure states", () => {
  assert.match(visualSmoke, /verifyAudioFailureState/);
  assert.match(visualSmoke, /audio-1440-rtl/);
  assert.match(visualSmoke, /quran-1440-rtl/);
});

test("the audio failure gate re-dispatches instead of racing the handler", () => {
  assert.match(
    visualSmoke,
    /async function dispatchUntil\(session, poke, check, label/,
    "the harness needs a poke/check retry loop",
  );
  assert.match(visualSmoke, /\$\{poke\}/, "dispatchUntil must run the poke on every attempt");
  assert.match(visualSmoke, /\$\{check\}/, "dispatchUntil must evaluate the check on every attempt");
  const audioBlock = visualSmoke.slice(
    visualSmoke.indexOf("async function verifyAudioFailureState"),
    visualSmoke.indexOf("const summary = []"),
  );
  assert.equal(
    /await evaluate\(session, `\(\(\) => \{\s*const audio[\s\S]*?dispatchEvent\(new Event\("error"\)\);[\s\S]*?\}\)\(\)`\)/.test(
      audioBlock,
    ),
    false,
    "the one-shot error dispatch is the flake and must be gone",
  );
  assert.equal(
    (audioBlock.match(/dispatchUntil\(/g) ?? []).length,
    3,
    "error, play recovery and pause must all be deterministic",
  );
  assert.match(audioBlock, /dispatchEvent\(new Event\("error"\)\)/);
  assert.match(audioBlock, /dispatchEvent\(new Event\("play"\)\)/);
  assert.match(audioBlock, /dispatchEvent\(new Event\("pause"\)\)/);
  assert.match(audioBlock, /stream pause/, "the pause step must assert a state, not fire and forget");
});
