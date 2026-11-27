import test from "node:test";
import assert from "node:assert/strict";
import {
  FINISHED_MARGIN_SECONDS,
  MIN_RESUME_SECONDS,
  WATCH_PROGRESS_STORAGE_KEY,
  loadWatchProgress,
  resumableProgress,
  saveWatchProgress,
} from "../client/src/visual-golden/services/media/watch-progress";

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => { map.set(key, value); },
    snapshot: () => Object.fromEntries(map),
  };
}

test("empty and corrupt storage load as no progress", () => {
  assert.deepEqual(loadWatchProgress(memoryStorage()), {});
  assert.deepEqual(loadWatchProgress(memoryStorage({ [WATCH_PROGRESS_STORAGE_KEY]: "not json" })), {});
  assert.deepEqual(loadWatchProgress(memoryStorage({ [WATCH_PROGRESS_STORAGE_KEY]: "[1,2]" })), {});
  assert.deepEqual(
    loadWatchProgress(memoryStorage({ [WATCH_PROGRESS_STORAGE_KEY]: JSON.stringify({ bad: { seconds: -3 } }) })),
    {},
  );
});

test("saving stores a valid entry and load returns it", () => {
  const storage = memoryStorage();
  const saved = saveWatchProgress(storage, "youtube:abc123", 95.7, 1098);
  assert.ok(saved);
  assert.equal(saved.seconds, 95);
  assert.equal(saved.duration, 1098);
  assert.deepEqual(loadWatchProgress(storage)["youtube:abc123"]?.seconds, 95);
});

test("invalid samples are rejected and never persisted", () => {
  const storage = memoryStorage();
  assert.equal(saveWatchProgress(storage, "youtube:abc123", 0, 1098), null);
  assert.equal(saveWatchProgress(storage, "youtube:abc123", Number.NaN, 1098), null);
  assert.equal(saveWatchProgress(storage, "youtube:abc123", 10, 0), null);
  assert.equal(saveWatchProgress(storage, "", 10, 100), null);
  assert.deepEqual(loadWatchProgress(storage), {});
});

test("a video that reached its end is cleared, not resumed at a dead stop", () => {
  const storage = memoryStorage();
  saveWatchProgress(storage, "youtube:abc123", 100, 1098);
  const finished = saveWatchProgress(storage, "youtube:abc123", 1098 - FINISHED_MARGIN_SECONDS + 1, 1098);
  assert.equal(finished, null);
  assert.deepEqual(loadWatchProgress(storage), {});
});

test("resume is offered only for meaningful mid-video positions", () => {
  assert.equal(resumableProgress(null), null);
  assert.equal(resumableProgress({ seconds: MIN_RESUME_SECONDS - 1, duration: 1098, updatedAt: 1 }), null);
  const mid = resumableProgress({ seconds: 120, duration: 1098, updatedAt: 1 });
  assert.equal(mid?.seconds, 120);
  assert.equal(
    resumableProgress({ seconds: 1098 - FINISHED_MARGIN_SECONDS + 1, duration: 1098, updatedAt: 1 }),
    null,
  );
});

test("entries from other keys are preserved and malformed entries dropped on load", () => {
  const storage = memoryStorage({
    [WATCH_PROGRESS_STORAGE_KEY]: JSON.stringify({
      "youtube:good": { seconds: 42, duration: 600, updatedAt: 7 },
      "youtube:bad": { seconds: "lots", duration: 600, updatedAt: 7 },
    }),
  });
  const loaded = loadWatchProgress(storage);
  assert.deepEqual(Object.keys(loaded), ["youtube:good"]);
  saveWatchProgress(storage, "youtube:other", 50, 600);
  const after = loadWatchProgress(storage);
  assert.deepEqual(Object.keys(after).sort(), ["youtube:good", "youtube:other"]);
});
