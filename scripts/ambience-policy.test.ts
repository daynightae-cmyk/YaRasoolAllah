import assert from "node:assert/strict";
import test from "node:test";
import {
  AMBIENT_BASE_LEVEL,
  AMBIENT_DUCK_RATIO,
  clampLevel,
  targetLevel,
} from "../client/src/visual-golden/audio/ambience-policy";

test("ambience policy keeps the bed and ducks it for voice", () => {
  assert.equal(clampLevel(AMBIENT_BASE_LEVEL), AMBIENT_BASE_LEVEL);
  assert.equal(targetLevel(AMBIENT_BASE_LEVEL, "none"), AMBIENT_BASE_LEVEL);
  assert.equal(
    targetLevel(AMBIENT_BASE_LEVEL, "voice"),
    AMBIENT_BASE_LEVEL * AMBIENT_DUCK_RATIO,
  );
});

test("ambience policy clamps out-of-range and non-finite levels", () => {
  assert.equal(clampLevel(-1), 0);
  assert.equal(clampLevel(2), 1);
  assert.equal(clampLevel(Number.NaN), 0);
  assert.equal(targetLevel(Number.NaN, "none"), 0);
  assert.equal(targetLevel(2, "voice"), AMBIENT_DUCK_RATIO);
});
