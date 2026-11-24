/**
 * Gate of Light / Home wing contract — directive §4.A.
 *
 * The home page must be a genuine entrance (doorway, not a generic spinner),
 * show only registry-derived statistics, derive recent additions from actual
 * catalog records, and reflect persisted local state.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { discoveryFacts, recentCatalogAdditions } from "../client/src/visual-golden/services/discovery";
import { digitalVersionRegistry, workRegistry } from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("home gateway wing", () => {
  const home = read("client/src/visual-golden/pages/HomePage.tsx");
  const homeCss = read("client/src/visual-golden/pages/HomePage.module.css");
  const entry = read("client/src/visual-golden/components/entry/SectionEntry3D.tsx");

  it("opens through the genuine doorway, never a generic spinner", () => {
    assert.match(home, /<SectionEntry3D wing="home" variant="threshold">/);
    assert.match(home, /<\/SectionEntry3D>/);
    // The doorway defers to the shell splash ceremony — no double gate.
    assert.match(entry, /splashCeremonyActive/);
    assert.match(entry, /yra-splash/);
    assert.match(entry, /ceremony/);
  });

  it("shows every knowledge wing including the recitation studio", () => {
    assert.match(home, /to: "\/audio" as const/);
    assert.match(home, /ستوديو التلاوات/);
    // Card index derives from the actual gateway list, not a hard-coded total.
    assert.match(home, /gateways\.length/);
    assert.doesNotMatch(home, /\/ 08/);
  });

  it("statistics are registry-derived, with honest unknown states", () => {
    const facts = discoveryFacts([]);
    assert.equal(facts.works, workRegistry.length);
    assert.equal(facts.versions, digitalVersionRegistry.length);
    assert.equal(
      facts.readableVersions,
      digitalVersionRegistry.filter((v) => v.contentAvailability === "full_text_cleared").length,
    );
    assert.ok(facts.readableVersions > 0 && facts.readableVersions <= facts.versions);
    assert.ok(facts.atlasPlaces > 0);
    // Reciter count comes from the governed provider endpoint, null until proven.
    assert.match(home, /api\/content\/audio\/reciters\?sura=1/);
    assert.match(home, /reciterCount \?\? "—"/);
    assert.match(home, /mp3quran\.net/);
  });

  it("recent additions derive from actual catalog records with real dates", () => {
    const additions = recentCatalogAdditions(4);
    assert.equal(additions.length, 4);
    // Distinct works — four editions of one book are not four additions.
    assert.equal(new Set(additions.map((a) => a.workId)).size, additions.length);
    const workIds = new Set(workRegistry.map((w) => w.workId));
    const versionIds = new Set(digitalVersionRegistry.map((v) => v.versionId));
    for (const item of additions) {
      assert.ok(workIds.has(item.workId), `${item.workId} must be a real work`);
      assert.ok(versionIds.has(item.versionId), `${item.versionId} must be a real edition`);
      assert.equal(item.path, `/library/work/${encodeURIComponent(item.workId)}`);
      assert.ok(!Number.isNaN(Date.parse(item.checkedAt)), "real verification timestamp");
      const version = digitalVersionRegistry.find((v) => v.versionId === item.versionId);
      assert.equal(item.checkedAt, version?.checkedAt, "date is the registry's own checkedAt");
    }
    // Newest verification first.
    for (let i = 1; i < additions.length; i++) {
      assert.ok(additions[i - 1].checkedAt >= additions[i].checkedAt);
    }
    assert.match(home, /data-visual="home-recent-additions"/);
    assert.match(home, /recentCatalogAdditions/);
    assert.match(homeCss, /\.additions/);
  });

  it("learning journey reflects persisted local activity, never a piety score", () => {
    assert.match(home, /useInstitution\(\(s\) => s\.journey\)/);
    assert.match(home, /data-visual="home-learning-journey"/);
    assert.match(home, /ليس تقييمًا للعبادة|not a piety score/);
    assert.match(homeCss, /\.journeyList/);
  });

  it("keeps the persisted continue-reading surface intact", () => {
    assert.match(home, /readingResumeTarget/);
    assert.match(home, /readingProgressPercent/);
    assert.match(home, /resumeTarget\?\.path/);
    assert.match(home, /favorites/);
    assert.match(home, /notes/);
  });
});