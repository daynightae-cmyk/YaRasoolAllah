import assert from "node:assert/strict";
import test from "node:test";
import {
  installMediaVoicePresence,
  isVoiceActive,
  resetVoiceActive,
  setVoiceActive,
  subscribeVoiceActive,
} from "../client/src/visual-golden/audio/voice-presence";

test("voice presence publishes changes to every subscriber", () => {
  resetVoiceActive();
  assert.equal(isVoiceActive(), false);
  const seen: boolean[] = [];
  const unsubscribe = subscribeVoiceActive((active) => seen.push(active));

  setVoiceActive(true);
  setVoiceActive(true);
  assert.equal(isVoiceActive(), true);
  assert.deepEqual(seen, [true]);

  setVoiceActive(false);
  assert.deepEqual(seen, [true, false]);
  unsubscribe();
  setVoiceActive(true);
  assert.deepEqual(seen, [true, false]);
  resetVoiceActive();
});

test("media presence installer is a no-op without a document", () => {
  const uninstall = installMediaVoicePresence(undefined);
  assert.equal(typeof uninstall, "function");
  uninstall();
});
