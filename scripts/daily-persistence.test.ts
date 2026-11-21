/**
 * Daily sanctuary persistence contract — the tasbih counter and chosen
 * dhikr survive navigation/reload through the institution store, and the
 * sanitizer fails closed on malformed stored values.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("daily sanctuary persistence", () => {
  const store = read("client/src/visual-golden/lib/institution/store.ts");
  const page = read("client/src/visual-golden/pages/DailyPage.tsx");

  it("persists the tasbih session through the institution store", () => {
    assert.match(store, /tasbih: \{ count: number; dhikr: string \}/);
    assert.match(store, /setTasbih/);
    assert.match(store, /sanitizeTasbih/);
    // Hydration reads the persisted value; save() spreads it automatically.
    assert.match(store, /tasbih: sanitizeTasbih\(parsed\.tasbih\)/);
    // The page no longer keeps the counter in volatile component state.
    assert.match(page, /useInstitution\(\(s\) => s\.tasbih\)/);
    assert.doesNotMatch(page, /useState\(33\)/);
    assert.doesNotMatch(page, /useState\("سبحان الله"\)/);
    // Functional updates resolve against live store state (rapid-tap safety).
    assert.match(store, /typeof tasbihPatch === "function" \? tasbihPatch\(state\.tasbih\) : tasbihPatch/);
    assert.match(page, /\(current\) => \(\{ count: next\(current\.count\) \}\)/);
    // Actions never leak into persisted storage.
    assert.match(store, /setTasbih: _setTasbih/);
    assert.match(store, /setAmbientEnabled: _setAmbientEnabled/);
  });

  it("sanitizer fails closed: bounded count, non-empty dhikr, sane defaults", () => {
    // Extract and evaluate the sanitizer in isolation (pure function).
    // Strip the TS annotations so plain JS can evaluate it.
    const match = store.match(/function sanitizeTasbih[\s\S]*?\n}/);
    assert.ok(match, "sanitizeTasbih must exist as a standalone function");
    const js = match[0]
      .replace(/value: unknown/, "value")
      .replace(/\): \{ count: number; dhikr: string \} \{/, ") {")
      .replace(/as \{ count\?: unknown; dhikr\?: unknown \}/, "");
    const sanitize = new Function(`${js}; return sanitizeTasbih;`)() as (
      value: unknown,
    ) => { count: number; dhikr: string };
    assert.deepEqual(sanitize(undefined), { count: 0, dhikr: "سبحان الله" });
    assert.deepEqual(sanitize(null), { count: 0, dhikr: "سبحان الله" });
    assert.deepEqual(sanitize("garbage"), { count: 0, dhikr: "سبحان الله" });
    assert.deepEqual(sanitize({ count: -5, dhikr: "" }), { count: 0, dhikr: "سبحان الله" });
    assert.deepEqual(sanitize({ count: NaN, dhikr: 42 }), { count: 0, dhikr: "سبحان الله" });
    assert.deepEqual(sanitize({ count: 33.9, dhikr: "الحمد لله" }), { count: 33, dhikr: "الحمد لله" });
    assert.equal(sanitize({ count: 1e12 }).count, 999999);
    assert.equal(sanitize({ dhikr: "x".repeat(500) }).dhikr.length, 80);
  });
});
