import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  navigationWingForPath,
  normalizeInstitutionPath,
  workspaceContext,
} from "../client/src/visual-golden/lib/institution/workspace";
import {
  mergeReadingProgress,
  readingProgressPercent,
  readingResumeTarget,
  sanitizeReadingProgress,
  type ReadingProgressEntry,
} from "../client/src/visual-golden/lib/institution/reading-progress";
import { sourceRegistry } from "../shared/source-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const shell = read("client/src/visual-golden/components/shell/InstitutionShell.tsx");
const sidebar = read("client/src/visual-golden/components/shell/InstitutionSidebar.tsx");
const shellCss = read("client/src/visual-golden/components/shell/shell.module.css");
const home = read("client/src/visual-golden/pages/HomePage.tsx");
const homeCss = read("client/src/visual-golden/pages/HomePage.module.css");
const themeProvider = read("client/src/components/ThemeProvider.tsx");
const languageProvider = read("client/src/contexts/LanguageContext.tsx");
const header = read("client/src/visual-golden/components/shell/InstitutionHeader.tsx");
const quranPage = read("client/src/visual-golden/pages/QuranPage.tsx");
const discovery = read("client/src/visual-golden/services/discovery.ts");
const contentLanguage = read("client/src/visual-golden/services/content-language.ts");
const catalogReader = read("client/src/visual-golden/components/library/CatalogReadingChamber.tsx");

describe("institution workspace aliases", () => {
  it("keeps every public alias attached to its canonical navigation wing", () => {
    const cases = [
      ["/", "home"],
      ["/library", "library"],
      ["/digital-library", "library"],
      ["/books", "library"],
      ["/library/work/work-1", "library"],
      ["/who-is-muhammad", "seerah"],
      ["/who-is-muhammad/character", "seerah"],
      ["/character", "seerah"],
      ["/seerah", "seerah"],
      ["/sunnah", "hadith"],
      ["/hadith", "hadith"],
      ["/quran", "quran"],
      ["/tafsir", "quran"],
      ["/quran-audio", "audio"],
      ["/audio", "audio"],
      ["/children-tv", "kids"],
      ["/kids", "kids"],
      ["/prayer-guide", "daily"],
      ["/daily", "daily"],
      ["/islamic-knowledge", "sources"],
      ["/five-pillars", "sources"],
      ["/sources", "sources"],
    ] as const;

    for (const [path, expected] of cases) {
      assert.equal(navigationWingForPath(path), expected, path);
    }
  });

  it("normalizes query and hash only for matching while preserving the local deep link", () => {
    assert.equal(normalizeInstitutionPath("/quran?surah=2&ayah=255#ayah"), "/quran");
    const context = workspaceContext("/library/work/work-1?page=2");
    assert.equal(context.wing.id, "library");
    assert.equal(context.routePath, "/library/work/work-1");
    assert.equal(context.path, "/library/work/work-1?page=2");
  });
});

describe("unified local reading progress", () => {
  const entry: ReadingProgressEntry = {
    id: "quran:2",
    surface: "quran",
    path: "/quran?surah=2&ayah=255",
    titleAr: "القرآن الكريم",
    titleEn: "Al-Qur'an",
    locationAr: "البقرة · الآية 255",
    locationEn: "Al-Baqarah · Ayah 255",
    completed: 255,
    total: 286,
    unitAr: "آية",
    unitEn: "verses",
    updatedAt: 100,
  };

  it("derives a percentage only from a proven numerator and denominator", () => {
    assert.equal(readingProgressPercent(entry), 89);
    assert.equal(readingProgressPercent({ ...entry, completed: null, total: null }), null);
    assert.equal(readingProgressPercent({ ...entry, completed: 300, total: 286 }), null);
  });

  it("rejects external paths and forged surface values from local storage", () => {
    const sanitized = sanitizeReadingProgress([
      { ...entry, path: "https://example.com" },
      { ...entry, id: "forged", surface: "analytics" },
    ]);
    assert.equal(sanitized.length, 0);
  });

  it("keeps Quran denominators scoped to their surah identity", () => {
    const otherSurah: ReadingProgressEntry = {
      ...entry,
      id: "quran:3",
      path: "/quran?surah=3&ayah=1",
      completed: 1,
      total: 200,
      updatedAt: 150,
    };
    const merged = mergeReadingProgress([entry], otherSurah);
    assert.equal(merged.find((item) => item.id === "quran:3")?.total, 200);
    assert.equal(merged.find((item) => item.id === "quran:2")?.total, 286);
    assert.match(quranPage, /id: `quran:\$\{active\}`/);
  });

  it("hydrates the catalog reader before writing and preserves it across view changes", () => {
    assert.match(catalogReader, /hydratedWorkId/);
    assert.match(catalogReader, /if \(hydratedWorkId !== work\.id\) return;/);
    assert.match(catalogReader, /setPage\(readStoredPage\(work\.id, totalPages\)\)/);
    assert.doesNotMatch(catalogReader, /useEffect\(\(\) => setPage\(1\), \[query, mode, work\.id\]\)/);
  });

  it("merges the newest local position and selects it as the resume target", () => {
    const newer: ReadingProgressEntry = {
      ...entry,
      id: "seerah",
      surface: "seerah",
      path: "/seerah?chapter=birth-and-upbringing",
      completed: 1,
      total: 8,
      updatedAt: 200,
    };
    const merged = mergeReadingProgress([entry], newer);
    assert.equal(merged[0]?.id, "seerah");
    assert.equal(readingResumeTarget(merged)?.path, newer.path);
  });
});

describe("institution shell source contracts", () => {
  it("uses explicit CSS-module maps for every state tone", () => {
    assert.doesNotMatch(shellCss, /\.state\s*\{/);
    assert.doesNotMatch(shellCss, /\.state\s+blocked/);
    assert.doesNotMatch(sidebar, /styles\[`state/);
    assert.doesNotMatch(read("client/src/visual-golden/components/shell/InstitutionStatusCenter.tsx"), /styles\[`status/);
    for (const className of [
      "stateOperational",
      "stateReview",
      "stateCatalog",
      "statusAvailable",
      "statusReview",
      "statusBlocked",
      "statusNeutral",
      "statusCenter",
    ]) {
      assert.match(shellCss, new RegExp(`\\.${className}\\b`), `missing ${className}`);
    }
  });

  it("keeps primary shell controls at touch-friendly sizes on small screens", () => {
    const searchRule = shellCss.match(/\.searchWrap\s*\{([^}]*)\}/)?.[1] ?? "";
    const iconRule = shellCss.match(/\.iconBtn\s*\{([^}]*)\}/)?.[1] ?? "";
    const languageRule = shellCss.match(/\.langBtn\s*\{([^}]*)\}/)?.[1] ?? "";
    const preferenceRule = shellCss.match(/\.preferenceMenu button\s*\{([^}]*)\}/)?.[1] ?? "";
    assert.match(searchRule, /min-height:\s*44px/);
    assert.match(iconRule, /width:\s*44px/);
    assert.match(iconRule, /height:\s*44px/);
    assert.match(languageRule, /min-height:\s*44px/);
    assert.match(preferenceRule, /min-height:\s*44px/);
    assert.match(shellCss, /@media \(max-width: 640px\)[\s\S]*\.preferenceMenu\s*\{[\s\S]*position:\s*fixed/);
  });

  it("makes the mobile sidebar a focus-trapped dialog", () => {
    assert.match(sidebar, /role=\{open \? "dialog" : undefined\}/);
    assert.match(sidebar, /aria-modal=\{open \? true : undefined\}/);
    assert.match(sidebar, /event\.key === "Escape"/);
    assert.match(sidebar, /event\.key !== "Tab"/);
    assert.match(sidebar, /previousFocusRef\.current/);
  });

  it("excludes editing targets from the global command shortcut", () => {
    assert.match(shell, /isEditingTarget\(event\.target\)/);
    assert.match(shell, /textarea, select/);
    assert.match(shell, /event\.preventDefault\(\)/);
  });

  it("keeps shell overlays mutually exclusive", () => {
    assert.match(shell, /setDiscover\(false\)/);
    assert.match(shell, /setSidebarOpen\(false\)/);
    assert.match(shell, /setPanel\(null\)/);
    assert.match(
      shell,
      /if \(discover\)[\s\S]*closeDiscover\(\);[\s\S]*openDiscover\(\);/,
      "the command shortcut must route through the same overlay arbitration as header actions",
    );
  });

  it("uses the institution store as the shared theme and language authority", () => {
    assert.match(themeProvider, /useInstitution/);
    assert.match(themeProvider, /setInstitutionTheme/);
    assert.match(languageProvider, /useInstitution/);
    assert.match(languageProvider, /setInstitutionLanguage/);
  });

  it("keeps visible control labels inside their accessible names", () => {
    assert.ok(header.includes('aria-label={`${t(lang, "searchPh")} —'));
    assert.ok(header.includes('aria-describedby="institution-language-action"'));
    assert.ok(header.includes('id="institution-language-action"'));
  });

  it("keeps the Quran side-panel headings in sequential order", () => {
    assert.doesNotMatch(quranPage, /<h4>/);
    assert.match(quranPage, /<h3>الآية المحددة<\/h3>/);
  });

  it("contains no fixed reading percentage and resumes from a real registry entry", () => {
    assert.doesNotMatch(homeCss, /width:\s*42%/);
    assert.doesNotMatch(home, /continueSignals/);
    assert.match(home, /readingResumeTarget/);
    assert.match(home, /readingProgressPercent/);
    assert.match(home, /resumeTarget\?\.path/);
  });

  it("keeps provider playback wording aligned with the rights registry", () => {
    assert.doesNotMatch(discovery, /التشغيل غير مُجاز/);
    assert.match(discovery, /تشغيل مباشر حيث يتاح المزود/);
  });

  it("uses the acquired Tanzil source id consistently", () => {
    assert.ok(
      sourceRegistry.some((entry) => entry.sourceId === "src-tanzil-uthmani-min-1-1-acquired"),
      "the acquired Tanzil source must remain registered",
    );
    assert.match(contentLanguage, /src-tanzil-uthmani-min-1-1-acquired/);
  });
});
