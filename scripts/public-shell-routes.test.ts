import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_VISUAL_PATHS,
  INTENTIONAL_APP_LAYOUT_PATHS,
  isCanonicalVisualPath,
  isIntentionalAppLayoutPath,
} from "../client/src/visual-golden/lib/public-shell";

test("public knowledge routes belong to the canonical visual shell", () => {
  const publicRoutes = [
    "/",
    "/library",
    "/quran",
    "/seerah",
    "/atlas",
    "/hadith",
    "/kids",
    "/daily",
    "/audio",
    "/basirah",
    "/sources",
    "/who-is-muhammad",
    "/prophetic-day",
    "/24-hours",
    "/daily-verse",
    "/prayer-guide",
    "/islamic-knowledge",
    "/five-pillars",
    "/women-in-islam",
    "/calendar",
    "/digital-tasbih",
    "/qibla-compass",
  ];

  for (const path of publicRoutes) {
    assert.equal(isCanonicalVisualPath(path), true, `${path} must use VisualInstitutionShell`);
    assert.equal(isIntentionalAppLayoutPath(path), false, `${path} is not an admin exception`);
  }
});

test("work and chapter deep links inherit the canonical visual shell", () => {
  assert.equal(isCanonicalVisualPath("/library/work/work-ibn-hisham-sira"), true);
  assert.equal(isCanonicalVisualPath("/who-is-muhammad/family-and-personal-character"), true);
});

test("dashboard and notification settings remain intentional AppLayout exceptions", () => {
  for (const path of INTENTIONAL_APP_LAYOUT_PATHS) {
    assert.equal(isIntentionalAppLayoutPath(path), true);
    assert.equal(isCanonicalVisualPath(path), false, `${path} must not be double-shelled`);
  }
});

test("canonical visual paths and AppLayout exceptions do not overlap", () => {
  const overlap = CANONICAL_VISUAL_PATHS.filter((path) => isIntentionalAppLayoutPath(path));
  assert.deepEqual(overlap, []);
});
