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

test("the audio gate waits long enough for a cold player to mount", () => {
  // The <audio> element only exists after the recitation catalog resolves. On a
  // cold dev server that is well past the 12s default, so the gate was failing
  // on a healthy application. Waiting longer asserts the same thing; it does not
  // assert less, because the alert must still appear.
  assert.match(visualSmoke, /const AUDIO_GATE_ATTEMPTS = \d+;/);
  const attempts = Number(/const AUDIO_GATE_ATTEMPTS = (\d+);/.exec(visualSmoke)?.[1] ?? 0);
  assert.ok(
    attempts * 150 >= 30_000,
    "the audio gate must allow at least 30s for the player to mount",
  );
  for (const step of ["stream error", "stream recovery", "stream pause"]) {
    const lines = visualSmoke.split(/\r?\n/);
    const index = lines.findIndex((candidate) => candidate.includes("${label} " + step));
    assert.ok(index >= 0, `the ${step} step must exist`);
    assert.match(
      lines.slice(index, index + 3).join("\n"),
      /AUDIO_GATE_ATTEMPTS/,
      `the ${step} step must use the real budget`,
    );
  }
});
test("a throwing poke cannot defeat the retry loop", () => {
  const audioBlock = visualSmoke.slice(
    visualSmoke.indexOf("async function verifyAudioFailureState"),
    visualSmoke.indexOf("const summary = []"),
  );
  assert.equal(
    /Audio element is missing/.test(visualSmoke),
    false,
    "the <audio> element mounts only after the catalog resolves, so the poke must not throw while it is absent",
  );
  assert.match(
    audioBlock,
    /if \(!document\.querySelector\("audio"\)\) return null;/,
    "the check must wait for the element instead of assuming it is there",
  );
  for (const step of ["error", "play", "pause"]) {
    assert.match(
      audioBlock,
      new RegExp(`\\?\\.dispatchEvent\\(new Event\\("${step}"\\)\\)`),
      `the ${step} poke must be a no-op while the element is missing`,
    );
  }
});
