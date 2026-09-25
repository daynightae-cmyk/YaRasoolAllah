import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_LANGUAGE_FACTS,
  ROUTE_CONTENT_DECLARATIONS,
  contentLanguageNotice,
  routeContentDeclaration,
} from "../client/src/visual-golden/services/content-language";
import { CANONICAL_VISUAL_PATHS } from "../client/src/visual-golden/lib/public-shell";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const shell = read("client/src/visual-golden/components/shell/InstitutionShell.tsx");
const noticeComponent = read(
  "client/src/visual-golden/components/shell/ContentLanguageNotice.tsx",
);
const shellStyles = read("client/src/visual-golden/components/shell/shell.module.css");
const visualSmoke = read("scripts/smoke-visual-golden.mjs");
const visualCases = read("scripts/capture-visual-evidence.mjs");

describe("content language is declared, not assumed", () => {
  it("only declares routes that exist in the canonical shell", () => {
    for (const declaration of ROUTE_CONTENT_DECLARATIONS) {
      assert.ok(
        (CANONICAL_VISUAL_PATHS as readonly string[]).includes(declaration.path),
        `${declaration.path} is not a canonical public route`,
      );
    }
  });

  it("states a reason for every declaration", () => {
    for (const declaration of ROUTE_CONTENT_DECLARATIONS) {
      assert.ok(
        declaration.reason.length > 20,
        `${declaration.path} must say why its content is Arabic-only`,
      );
    }
    assert.equal(CONTENT_LANGUAGE_FACTS.declaredRoutes, ROUTE_CONTENT_DECLARATIONS.length);
  });

  it("makes no claim about routes it has not verified", () => {
    assert.equal(
      routeContentDeclaration("/quran"),
      undefined,
      "/quran has governed EN/FR/UR translations and must not be declared Arabic-only",
    );
    assert.equal(routeContentDeclaration("/library"), undefined);
    assert.equal(routeContentDeclaration("/sources"), undefined);
    assert.equal(routeContentDeclaration("/does-not-exist"), undefined);
  });

  it("tolerates trailing slashes", () => {
    assert.equal(routeContentDeclaration("/seerah/")?.path, "/seerah");
    assert.equal(routeContentDeclaration("/")?.path, undefined);
  });
});

describe("the notice appears only when the interface cannot present the content", () => {
  it("stays silent for an Arabic interface on Arabic content", () => {
    assert.equal(contentLanguageNotice("/seerah", "ar"), null);
  });

  it("states the boundary in both languages for an English interface", () => {
    const notice = contentLanguageNotice("/seerah", "en");
    assert.ok(notice, "an English interface over Arabic content must be disclosed");
    assert.match(notice!.textEn, /recorded in Arabic only and has not been translated/);
    assert.match(notice!.textAr, /مسجَّل بالعربية فقط ولم يُترجم/);
    assert.equal(notice!.contentLanguage, "ar");
    assert.equal(notice!.uiLang, "en");
    assert.ok(notice!.reason.length > 20);
  });

  it("never appears for an undeclared route", () => {
    assert.equal(contentLanguageNotice("/quran", "en"), null);
    assert.equal(contentLanguageNotice("/", "en"), null);
  });
});

describe("the shell surfaces the notice on every canonical route", () => {
  it("renders it from the shell, not from individual pages", () => {
    assert.match(shell, /ContentLanguageNotice/);
    assert.match(shell, /<ContentLanguageNotice pathname=\{pathname\}\/>/);
  });

  it("is readable in the interface language and exposes a visual hook", () => {
    assert.match(noticeComponent, /data-visual="content-language-notice"/);
    assert.match(noticeComponent, /contentLanguageNotice/);
    assert.match(noticeComponent, /if \(!notice\) return null/);
    assert.match(shellStyles, /\.contentLanguage\s*\{/);
    assert.match(shellStyles, /overflow-wrap: anywhere/);
  });

  it("is gated in rendered smoke and visual evidence", () => {
    assert.match(visualSmoke, /content-language-notice/);
    assert.match(visualCases, /\[data-visual="content-language-notice"\]/);
  });
});
