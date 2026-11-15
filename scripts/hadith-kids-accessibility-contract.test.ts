import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KIDS_STORIES,
  countDistinctSeenKidsAdaptations,
  hasThreeStoryKidsBadge,
  isRegisteredKidsAdaptationId,
  shouldCountColoringSession,
} from "../client/src/visual-golden/services/kids";
import { childrenAdaptationRegistry } from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const hadithPage = read("client/src/visual-golden/pages/HadithPage.tsx");
const kidsPage = read("client/src/visual-golden/pages/KidsPage.tsx");
const coloringStudio = read("client/src/visual-golden/components/unique/ColoringStudio.tsx");

const registeredIds = childrenAdaptationRegistry.map((story) => story.adaptationId);

describe("Hadith local search accessibility", () => {
  it("gives the local-search input and its submit button accessible names", () => {
    const searchForm = hadithPage.match(
      /<form className=\{styles\.search\}[\s\S]*?<\/form>/,
    )?.[0];
    assert.ok(searchForm, "the Hadith local search form must exist");

    assert.match(
      searchForm,
      /<label[^>]*htmlFor="hadith-local-search"[^>]*>/,
      "a programmatic label must be tied to the search input",
    );
    assert.match(
      searchForm,
      /id="hadith-local-search"[\s\S]{0,180}aria-label="البحث في السجلات المحلية"/,
      "the search input must expose its local-record scope as an accessible name",
    );
    assert.match(
      searchForm,
      /<button[^>]*type="submit"[^>]*aria-label="ابحث في السجلات المحلية"/,
      "the submit control must have an explicit accessible name",
    );
    assert.match(
      searchForm,
      /placeholder="ابحث في السجلات المحلية: النص، الراوي، الكتاب، الباب\.\.\."/,
      "the visible placeholder must remain useful",
    );
  });
});

describe("registered Kids adaptations", () => {
  it("exposes every registered adaptation through the local story selector", () => {
    assert.deepEqual(
      KIDS_STORIES.map((story) => story.adaptationId),
      registeredIds,
      "the selector source must cover the complete registered adaptation set",
    );
    for (const adaptationId of registeredIds) {
      assert.equal(
        isRegisteredKidsAdaptationId(adaptationId),
        true,
        `${adaptationId} must be selectable as a registered adaptation`,
      );
    }

    const selector = kidsPage.match(/<select[\s\S]*?<\/select>/)?.[0];
    assert.ok(selector, "an accessible local story selector must exist");
    assert.match(kidsPage, /<label[^>]*htmlFor="kids-adaptation-select"[^>]*>/);
    assert.match(selector, /id="kids-adaptation-select"/);
    assert.match(selector, /KIDS_STORIES\.map\(\(story\) => \(/);
    assert.match(
      selector,
      /<option key=\{story\.adaptationId\} value=\{story\.adaptationId\}>/,
      "each registered adaptation id must be an option value",
    );
    assert.match(kidsPage, /onClick=\{openCurrentStory\}/);
    assert.match(kidsPage, /markSeen\(current\.adaptationId\)/);
    assert.doesNotMatch(kidsPage, /KIDS_STORIES\[0\]/);
  });

  it("does not mark a story seen merely because it was selected", () => {
    const selector = kidsPage.match(/<select[\s\S]*?<\/select>/)?.[0];
    assert.ok(selector);
    assert.doesNotMatch(selector, /markSeen/);
  });

  it("earns the three-story badge only for three distinct registered ids", () => {
    assert.ok(registeredIds.length >= 3, "the registry must contain at least three adaptations");

    assert.equal(
      countDistinctSeenKidsAdaptations([registeredIds[0], registeredIds[0], registeredIds[1]]),
      2,
      "duplicate opens must count only once",
    );
    assert.equal(
      hasThreeStoryKidsBadge([registeredIds[0], registeredIds[0], registeredIds[0]]),
      false,
      "opening one adaptation repeatedly must not earn the badge",
    );
    assert.equal(
      hasThreeStoryKidsBadge([registeredIds[0], registeredIds[1], registeredIds[2]]),
      true,
      "three distinct registered opens must earn the badge",
    );
    assert.equal(
      hasThreeStoryKidsBadge([registeredIds[0], registeredIds[1], "not-registered"]),
      false,
      "unregistered ids must not complete local progress",
    );
    assert.equal(
      countDistinctSeenKidsAdaptations([registeredIds[0], "not-registered"]),
      1,
      "unregistered ids must not inflate the opened-story count",
    );
  });
});

describe("ColoringStudio modal lifecycle", () => {
  it("declares a labelled modal and manages Escape, focus entry, trapping, and restoration", () => {
    assert.match(coloringStudio, /role="dialog"/);
    assert.match(coloringStudio, /aria-modal="true"/);
    assert.match(coloringStudio, /aria-labelledby="coloring-studio-title"/);
    assert.match(coloringStudio, /id="coloring-studio-title"/);
    assert.match(coloringStudio, /event\.key === "Escape"/);
    assert.match(coloringStudio, /window\.requestAnimationFrame/);
    assert.match(coloringStudio, /firstFocusable[\s\S]{0,60}focus\(\)/);
    assert.match(coloringStudio, /event\.key !== "Tab"/);
    assert.match(coloringStudio, /last\.focus\(\)/);
    assert.match(coloringStudio, /document\.addEventListener\("focusin", keepFocusInside, true\)/);
    assert.match(coloringStudio, /opener\?\.isConnected\) opener\.focus\(\)/);
  });

  it("provides real labeled keyboard controls for every painting region", () => {
    const targetControls = coloringStudio.match(
      /<div className=\{styles\.paintTargets\}[\s\S]*?<\/div>/,
    )?.[0];
    assert.ok(targetControls, "the painting-region control group must exist");
    assert.match(targetControls, /role="group"/);
    assert.match(targetControls, /PAINT_TARGETS\.map/);
    assert.match(targetControls, /<button[\s\S]*?type="button"/);
    assert.match(
      targetControls,
      /aria-label=\{`لوّن \$\{target\.label\}`\}/,
      "each painting region must have a labeled keyboard-operable button",
    );
  });
});

describe("honest coloring-session counting", () => {
  it("does not count opening the dialog as a completed session", () => {
    assert.equal(
      shouldCountColoringSession(false, false),
      false,
      "an untouched dialog is not a completed coloring session",
    );
    assert.equal(
      shouldCountColoringSession(true, false),
      true,
      "an interacted session may be counted once",
    );
    assert.equal(
      shouldCountColoringSession(true, true),
      false,
      "one session must never be counted twice",
    );

    const openButton = kidsPage.match(
      /<button type="button" onClick=\{\(\) => setColoring\(true\)\}>/,
    )?.[0];
    assert.ok(openButton, "the coloring opener must exist");
    assert.doesNotMatch(
      openButton,
      /setColorSessions/,
      "opening the dialog alone must not increment the session counter",
    );
    assert.match(
      coloringStudio,
      /shouldCountColoringSession\(hasInteractedRef\.current, completionReportedRef\.current\)/,
    );
    assert.match(coloringStudio, /reportCompletion\(\);\s*onCloseRef\.current\(\);/);
    assert.match(kidsPage, /onSessionComplete=\{\(\) => setColorSessions/);
  });
});
