import assert from "node:assert/strict";
import test from "node:test";
import { AmbienceEngine, resetAmbientEngine } from "../client/src/visual-golden/audio/ambience-engine";
import { AMBIENT_DUCK_RATIO } from "../client/src/visual-golden/audio/ambience-policy";

test("engine reports an unsupported environment without throwing", () => {
  const reasons: string[] = [];
  const engine = new AmbienceEngine({
    createContext: () => null,
    onUnavailable: (reason) => reasons.push(reason),
  });
  assert.equal(engine.start(), false);
  assert.equal(engine.isRunning, false);
  assert.deepEqual(reasons, ["unsupported"]);
  engine.dispose();
});

test("engine converts a context failure into the unavailable path", () => {
  const reasons: string[] = [];
  const engine = new AmbienceEngine({
    createContext: () => {
      throw new Error("no webgl / no audio");
    },
    onUnavailable: (reason) => reasons.push(reason),
  });
  assert.equal(engine.start(), false);
  assert.deepEqual(reasons, ["create-failed"]);
  engine.dispose();
});

test("engine is inert and disposable before a context exists", () => {
  resetAmbientEngine();
  const engine = new AmbienceEngine({ createContext: () => null });
  engine.setVoiceActive(true);
  engine.setBaseLevel(0.02);
  engine.stop();
  engine.dispose();
  assert.equal(engine.currentLevel, 0.02 * AMBIENT_DUCK_RATIO);
});
