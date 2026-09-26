import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_LANGUAGE_FACTS,
  ROUTE_CONTENT_DECLARATIONS,
  contentLanguageNotice,
  contentShape,
  isArabicOnly,
  routeContentDeclaration,
  translationChoices,
  type ContentShape,
} from "../client/src/visual-golden/services/content-language";
import { CANONICAL_VISUAL_PATHS, CANONICAL_VISUAL_PREFIXES } from "../client/src/visual-golden/lib/public-shell";
import { routeComponentMap, scanRouteContent } from "./lib/content-language-scan";
import { QURAN_TRANSLATION_EDITIONS } from "../server/quran-translations";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const app = read("client/src/App.tsx");
const routedComponents = routeComponentMap(app);
const declarations = ROUTE_CONTENT_DECLARATIONS;

describe("every canonical route declares its content language", () => {
  it("leaves no canonical route undeclared", () => {
    const declared = new Set(declarations.map((item) => item.path));
    const missing = CANONICAL_VISUAL_PATHS.filter((path) => !declared.has(path));
    assert.deepEqual(
      missing,
      [],
      "an undeclared route escapes scrutiny while the interface language is still switched",
    );
  });

  it("declares no route the shell does not serve", () => {
    const served = [
      ...(CANONICAL_VISUAL_PATHS as readonly string[]),
      ...(CANONICAL_VISUAL_PREFIXES as readonly string[]),
    ];
    for (const declaration of declarations) {
      assert.ok(
        served.includes(declaration.path),
        `${declaration.path} is declared but is not a canonical public route`,
      );
      if (declaration.pathPrefix) {
        assert.ok(
          (CANONICAL_VISUAL_PREFIXES as readonly string[]).includes(declaration.path),
          `${declaration.path} is marked as a prefix but is not a canonical prefix`,
        );
      }
    }
  });

  it("declares no route that App.tsx does not route", () => {
    for (const declaration of declarations) {
      if (declaration.pathPrefix) {
        const stem = declaration.path.replace(/\/$/, "");
        assert.ok(
          app.includes(`path="${stem}/:`),
          `${declaration.path} is declared as a prefix but App.tsx routes no dynamic path under it`,
        );
        continue;
      }
      assert.ok(
        app.includes(`path="${declaration.path}"`),
        `${declaration.path} is declared but not routed`,
      );
    }
  });

  it("leaves no canonical route prefix undeclared", () => {
    // A deep link is a real reader surface. /library was declared while
    // /library/work/ was not, so opening a book directly disclosed nothing.
    const declared = new Set(declarations.map((item) => item.path));
    const missing = CANONICAL_VISUAL_PREFIXES.filter((prefix) => !declared.has(prefix));
    assert.deepEqual(missing, [], "a canonical route prefix is undeclared, so it makes no claim");
  });

  it("states a reason and the files it was read from", () => {
    for (const declaration of declarations) {
      assert.ok(
        declaration.reason.length > 30,
        `${declaration.path} must say why it declares what it declares`,
      );
      assert.ok(
        declaration.verifiedIn.length > 0,
        `${declaration.path} must list the files the claim was read from`,
      );
    }
  });

  it("keeps its own facts honest", () => {
    assert.equal(CONTENT_LANGUAGE_FACTS.declaredRoutes, declarations.length);
    assert.deepEqual(
      CONTENT_LANGUAGE_FACTS.routesServingEnglish,
      declarations.filter((item) => item.contentLanguages.includes("en")).length,
    );
  });
});

describe("a declaration cannot claim Arabic-only while the code shows English", () => {
  it("finds no undeclared non-Arabic content on any Arabic-only route", () => {
    const offenders: string[] = [];
    for (const declaration of declarations) {
      if (!isArabicOnly(declaration)) continue;
      const component = routedComponents.get(declaration.path);
      if (!component) continue;
      for (const finding of scanRouteContent(component)) {
        offenders.push(
          `${declaration.path} is declared Arabic-only but ${declaration.path}'s component ${component} shows ${finding.language} via ${finding.field} at ${finding.at}`,
        );
      }
    }
    assert.deepEqual(
      offenders,
      [],
      "these routes tell an English reader their content is untranslated while showing them English",
    );
  });

  it("declares every language its own evidence proves", () => {
    for (const declaration of declarations) {
      for (const evidence of declaration.servesContent) {
        assert.ok(
          declaration.contentLanguages.includes(evidence.language),
          `${declaration.path} serves ${evidence.language} at ${evidence.at} but does not declare it`,
        );
      }
      const evidenced = new Set([
        ...declaration.servesContent.map((item) => item.language),
        ...declaration.translations.map((item) => item.language),
      ]);
      for (const language of declaration.contentLanguages) {
        if (language === "ar") continue;
        assert.ok(
          evidenced.has(language),
          `${declaration.path} declares ${language} but cites no evidence for it`,
        );
      }
    }
  });

  it("keeps every evidence anchor pointing at real content", () => {
    for (const declaration of declarations) {
      for (const evidence of declaration.servesContent) {
        const [file, line] = evidence.at.split(":");
        assert.ok(existsSync(join(repoRoot, file)), `${evidence.at} does not exist`);
        const sourceLine = read(file).split(/\r?\n/)[Number(line) - 1] ?? "";
        assert.match(
          sourceLine,
          new RegExp(`${evidence.field}\\s*:`),
          `${declaration.path} cites ${evidence.at} for ${evidence.field}, but that line does not define it`,
        );
        assert.ok(
          !isArabicOnly(declaration),
          `${declaration.path} is Arabic-only, so it cannot serve ${evidence.field}`,
        );
      }
    }
  });

  it("regress the exact routes that were declared Arabic-only while rendering English", () => {
    const proven = [
      ["/who-is-muhammad", "titleEn", "client/src/data/whoIsMuhammadData.ts"],
      ["/character", "summaryEn", "client/src/data/whoIsMuhammadData.ts"],
      ["/hadith", "textEn", "client/src/data/hadithData.ts"],
      ["/sunnah", "textEn", "client/src/data/hadithData.ts"],
      ["/daily-verse", "translation", "client/src/services/quranService.ts"],
      ["/digital-tasbih", "translation", "client/src/pages/DigitalTasbihPage.tsx"],
    ] as const;
    for (const [path, field, file] of proven) {
      const declaration = routeContentDeclaration(path);
      assert.ok(declaration, `${path} must be declared`);
      assert.ok(
        declaration.contentLanguages.includes("en"),
        `${path} shows ${field} from ${file}, so it must declare English`,
      );
      assert.ok(
        declaration.servesContent.some(
          (item) => item.field === field && item.at.startsWith(file),
        ),
        `${path} must cite ${field} in ${file} as its evidence`,
      );
    }
  });
});

describe("translation availability is published per route", () => {
  it("states the Quran editions the server actually serves", () => {
    const quran = routeContentDeclaration("/quran");
    assert.ok(quran);
    const served = Object.entries(QURAN_TRANSLATION_EDITIONS).map(([language, value]) => ({
      language,
      edition: value.edition,
      translator: value.translator,
    }));
    for (const expected of served) {
      const published = quran.translations.find((item) => item.language === expected.language);
      assert.ok(published, `/quran must publish its ${expected.language} edition`);
      assert.equal(published.edition, expected.edition);
      assert.equal(published.translator, expected.translator);
    }
  });

  it("keeps the reader's edition list in step with the server", () => {
    const page = read("client/src/visual-golden/pages/QuranPage.tsx");
    assert.match(
      page,
      /translationChoices\("\/quran"\)/,
      "the study-mode picker must read its editions from the declaration",
    );
    assert.doesNotMatch(
      page,
      /<option value="(en|fr|ur)">/,
      "a hand-written option list is how the reader and the server drift apart",
    );
    const choices = translationChoices("/quran");
    assert.deepEqual(
      choices.map((choice) => choice.edition).sort(),
      Object.values(QURAN_TRANSLATION_EDITIONS)
        .map((value) => value.edition)
        .sort(),
    );
    for (const choice of choices) {
      assert.match(choice.labelAr, new RegExp(choice.edition));
    }
  });

  it("names the Arabic original for every knowledge route that has one", () => {
    for (const declaration of declarations) {
      if (declaration.kind !== "knowledge") continue;
      const arabic = declaration.translations.find((item) => item.language === "ar");
      assert.ok(arabic, `${declaration.path} must state what its Arabic content is`);
      assert.ok(arabic.basis.length > 10, `${declaration.path} must say where its Arabic comes from`);
    }
  });

  it("asserts no translation for a route that has none", () => {
    const seerah = routeContentDeclaration("/seerah");
    assert.deepEqual(seerah?.translations.map((item) => item.language), ["ar"]);
    const tasbih = routeContentDeclaration("/digital-tasbih");
    assert.deepEqual(
      tasbih?.translations.map((item) => item.language).sort(),
      ["ar"],
      "the English tasbih lines are platform-authored beside the Arabic, not a governed edition",
    );
  });
});

describe("the notice tells the truth in all three cases, not one", () => {
  it("derives each route's shape from the data rather than from a label", () => {
    const expected: Record<string, ContentShape> = {
      "/": "no_content",
      "/ai-assistant": "no_content",
      "/al-mufti-al-mubeen": "no_content",
      // Arabic and nothing else.
      "/seerah": "arabic_only",
      "/atlas": "arabic_only",
      "/tafsir": "arabic_only",
      "/audio": "arabic_only",
      "/quran-audio": "arabic_only",
      "/daily": "arabic_only",
      "/kids": "arabic_only",
      "/children-tv": "arabic_only",
      "/prayer-guide": "arabic_only",
      "/islamic-knowledge": "arabic_only",
      "/five-pillars": "arabic_only",
      "/women-in-islam": "arabic_only",
      "/calendar": "arabic_only",
      "/qibla-compass": "arabic_only",
      // English the reader did not choose, shown beside untranslated Arabic.
      "/who-is-muhammad": "partly_translated",
      "/who-is-muhammad/": "partly_translated",
      "/character": "partly_translated",
      "/hadith": "partly_translated",
      "/sunnah": "partly_translated",
      "/daily-verse": "partly_translated",
      "/digital-tasbih": "partly_translated",
      "/basirah": "partly_translated",
      "/sources": "partly_translated",
      "/prophetic-day": "partly_translated",
      "/24-hours": "partly_translated",
      "/library": "partly_translated",
      "/library/work/": "partly_translated",
      "/books": "partly_translated",
      "/digital-library": "partly_translated",
      // English the reader picks from a labelled edition list.
      "/quran": "selectable_translations",
    };
    for (const declaration of declarations) {
      assert.equal(
        contentShape(declaration),
        expected[declaration.path],
        `${declaration.path} has the wrong content shape`,
      );
    }
    assert.equal(
      declarations.length,
      Object.keys(expected).length,
      "a canonical route is missing from the expected-shape table",
    );
  });

  it("says what kind of English a partly-translated route is showing", () => {
    for (const declaration of declarations) {
      if (contentShape(declaration) !== "partly_translated") continue;
      assert.ok(
        declaration.englishCaveat && declaration.englishCaveat.length > 30,
        `${declaration.path} shows English, so it must say whether that English is a published edition, a platform passage, or a development sample`,
      );
    }
  });

  it("never attaches a caveat to a route whose English the reader chose", () => {
    const quran = routeContentDeclaration("/quran");
    assert.equal(contentShape(quran!), "selectable_translations");
    assert.equal(quran!.englishCaveat, undefined);
  });

  it("stays silent for an Arabic interface over Arabic-only content", () => {
    assert.equal(contentLanguageNotice("/seerah", "ar"), null);
  });

  it("discloses an Arabic-only route to an English interface", () => {
    const notice = contentLanguageNotice("/seerah", "en");
    assert.ok(notice, "an English interface over Arabic content must be disclosed");
    assert.equal(notice!.shape, "arabic_only");
    assert.match(notice!.textEn, /recorded in Arabic only and has not been translated/);
    assert.match(notice!.textAr, /مسجَّل بالعربية فقط ولم يُترجم/);
    assert.deepEqual(notice!.available, []);
    assert.equal(notice!.englishCaveat, null);
  });

  it("tells an English reader which part of a bilingual page is still Arabic", () => {
    const notice = contentLanguageNotice("/who-is-muhammad", "en");
    assert.ok(notice, "unconditional English beside untranslated Arabic must still be disclosed");
    assert.equal(notice!.shape, "partly_translated");
    assert.match(notice!.textEn, /Part of this page appears in English/);
    assert.match(notice!.textEn, /anything not shown in English is untranslated/);
    assert.match(notice!.textAr, /جزء من هذه الصفحة بالإنجليزية/);
    assert.match(notice!.textAr, /غير مترجم/);
    assert.ok(
      notice!.englishCaveat?.includes("Arabic only"),
      "the reader must be told the narrative itself is Arabic only",
    );
  });

  it("distinguishes a development sample from a published translation", () => {
    const hadith = contentLanguageNotice("/hadith", "en");
    assert.match(hadith!.englishCaveat ?? "", /development sample/);
    assert.match(hadith!.englishCaveat ?? "", /not a published translation/);
  });

  it("does not present platform-authored English as a published edition", () => {
    for (const path of ["/who-is-muhammad", "/basirah", "/sources", "/library", "/daily-verse", "/digital-tasbih", "/prophetic-day"]) {
      const notice = contentLanguageNotice(path, "en");
      assert.ok(notice, `${path} must disclose its mixed content`);
      assert.doesNotMatch(
        notice!.textEn,
        /is an English edition|has been translated/,
        `${path} must not imply the whole page is available in English`,
      );
    }
  });

  it("stays silent where the reader chose the English themselves", () => {
    // Choosing a governed edition from a labelled list is not a mismatch, so
    // /quran must not claim the reader is looking at untranslated material.
    assert.equal(contentLanguageNotice("/quran", "en"), null);
  });

  it("never appears for a route that carries no content of its own", () => {
    assert.equal(contentLanguageNotice("/ai-assistant", "en"), null);
    assert.equal(contentLanguageNotice("/al-mufti-al-mubeen", "en"), null);
    assert.equal(contentLanguageNotice("/", "en"), null);
    assert.equal(contentLanguageNotice("/does-not-exist", "en"), null);
  });

  it("discloses every partly-translated route rather than only the Arabic-only ones", () => {
    for (const declaration of declarations) {
      if (contentShape(declaration) === "no_content") continue;
      if (declaration.contentLanguages.includes("en")) continue;
      const notice = contentLanguageNotice(declaration.path, "en");
      assert.ok(
        notice,
        `${declaration.path} has no English content, so an English interface must be told the boundary`,
      );
    }
  });

  it("tolerates trailing slashes", () => {
    assert.equal(routeContentDeclaration("/seerah/")?.path, "/seerah");
    assert.equal(routeContentDeclaration("/")?.path, "/");
  });
});

describe("the shell keeps rendering the notice", () => {
  it("renders it from the shell and exposes a visual hook", () => {
    assert.match(read("client/src/visual-golden/components/shell/InstitutionShell.tsx"), /<ContentLanguageNotice pathname=\{pathname\}\/>/);
    const component = read("client/src/visual-golden/components/shell/ContentLanguageNotice.tsx");
    assert.match(component, /data-visual="content-language-notice"/);
    assert.match(component, /if \(!notice\) return null/);
  });

  it("is gated in rendered smoke and visual evidence", () => {
    assert.match(read("scripts/smoke-visual-golden.mjs"), /content-language-notice/);
    assert.match(read("scripts/capture-visual-evidence.mjs"), /\[data-visual="content-language-notice"\]/);
  });
});
