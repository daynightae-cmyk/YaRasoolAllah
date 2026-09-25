import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = join(repoRoot, "client/src");

function collectSources(): Array<{ file: string; text: string }> {
  const files: Array<{ file: string; text: string }> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|json)$/.test(entry)) continue;
      files.push({ file: relative(repoRoot, full).replace(/\\/g, "/"), text: readFileSync(full, "utf8") });
    }
  };
  walk(clientSrc);
  return files;
}

const sources = collectSources();
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const dailyVerse = read("client/src/pages/DailyVersePage.tsx");
const homePage = read("client/src/pages/HomePage.tsx");
const alMubeenBot = read("client/src/pages/AlMubeenBotPage.tsx");
const basirahPage = read("client/src/visual-golden/pages/BasirahPage.tsx");

/**
 * Presenting the assistant as a mufti is a religious-authority claim the audit
 * explicitly prohibits. The canonical route already refuses it ("ليست مفتي"),
 * but legacy surfaces branded it "المفتي المبين" while linking elsewhere.
 */
const AUTHORITY_BRANDING = ["المفتي المبين", "مفتي ذكي", "المفتي AI", "المفتي المبين AI"];
const EXPLICIT_NEGATION = ["ليس مفتياً", "ليست مفتي", "ليس مفتيًا", "ولا مصدرًا معتمدًا"];

describe("no surface brands the assistant as a religious authority", () => {
  it("finds no authority branding anywhere in the client", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      for (const brand of AUTHORITY_BRANDING) {
        if (text.includes(brand)) offenders.push(`${file}: ${brand}`);
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `the assistant must not be presented as a mufti:\n${offenders.join("\n")}`,
    );
  });

  it("states the boundary where the assistant is offered", () => {
    assert.match(dailyVerse, /مساعد تعليمي/);
    assert.match(dailyVerse, /ليس مفتياً/);
    assert.match(dailyVerse, /ولا مصدرًا معتمدًا/);
    assert.match(dailyVerse, /المساعد الذكي/);
  });

  it("keeps the honest wording consistent with the surfaces that already had it", () => {
    assert.match(alMubeenBot, /مساعد تعليمي وليس مفتياً/);
    const canonicalHonest = EXPLICIT_NEGATION.some((phrase) => basirahPage.includes(phrase));
    assert.equal(canonicalHonest, true, "the canonical Basirah route must keep its non-mufti boundary");
  });

  it("does not leave the home call-to-action promising a different destination", () => {
    assert.match(homePage, /استكشف أبواب الدار/);
    assert.equal(
      /استكشف الآن - المفتي المبين/.test(homePage),
      false,
      "the home CTA links to the gate, so it must not promise a mufti",
    );
  });

  it("scans a meaningful number of files", () => {
    assert.ok(sources.length > 100, `expected the whole client tree, scanned ${sources.length}`);
  });
});
