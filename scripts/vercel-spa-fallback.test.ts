import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * The SPA fallback rewrite excludes any path containing a dot, because dots
 * mark static assets. Catalog deep links carry OpenITI URIs, which always
 * contain dots (e.g. /library/work/openiti_work_0310Tabari.Tarikh), so without
 * explicit prefix rewrites those URLs 404 on Vercel instead of loading the
 * app. These tests pin the rewrite table so deep links can never regress.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8")) as {
  rewrites: Array<{ source: string; destination: string }>;
};
const rewrites = vercel.rewrites;

function matchesSource(source: string, path: string): boolean {
  if (source.endsWith("/:path*")) {
    return path.startsWith(source.slice(0, -":path*".length));
  }
  if (source.startsWith("/:path(")) {
    // Catch-all of the form "/:path((?!api/|assets/|...|.*\\.).*)": the single
    // named parameter carries a custom regex that decides the whole match.
    const inner = source.slice("/:path(".length, -1);
    return new RegExp(`^/${inner}$`).test(path);
  }
  return source === path;
}

function destinationFor(path: string): string | null {
  for (const rewrite of rewrites) {
    if (matchesSource(rewrite.source, path)) return rewrite.destination;
  }
  return null;
}

test("dotted deep links are rewritten to the SPA shell before the catch-all", () => {
  const deepLinks = [
    "/library/work/openiti_work_0310Tabari.Tarikh",
    "/library/work/openiti_work_0213IbnHisham.SiraNabawiyya",
    "/library/work/work-ibn-hisham-sira",
    "/who-is-muhammad/family-and-personal-character",
  ];
  for (const path of deepLinks) {
    assert.equal(
      destinationFor(path),
      "/index.html",
      `${path} must be served the SPA shell, not 404 as a static file`,
    );
  }
});

test("explicit prefix rewrites are ordered before the dot-excluding catch-all", () => {
  const catchAllIndex = rewrites.findIndex((rewrite) => rewrite.source.startsWith("/:path("));
  assert.ok(catchAllIndex >= 0, "catch-all rewrite must exist");
  const libraryIndex = rewrites.findIndex((rewrite) => rewrite.source === "/library/work/:path*");
  const whoIndex = rewrites.findIndex((rewrite) => rewrite.source === "/who-is-muhammad/:path*");
  assert.ok(libraryIndex >= 0 && libraryIndex < catchAllIndex, "/library/work/:path* must precede the catch-all");
  assert.ok(whoIndex >= 0 && whoIndex < catchAllIndex, "/who-is-muhammad/:path* must precede the catch-all");
});

test("plain app routes still resolve to the SPA shell", () => {
  for (const path of ["/", "/library", "/quran", "/noor", "/seerah", "/hadith", "/kids"]) {
    assert.equal(destinationFor(path), "/index.html", `${path} must load the app`);
  }
});

test("static assets and API paths are not swallowed by the SPA fallback", () => {
  assert.equal(destinationFor("/assets/index-abc123.js"), null);
  assert.equal(destinationFor("/visual-golden/art/logo.webp"), null);
  assert.equal(destinationFor("/manifest.webmanifest"), null);
  assert.ok(
    (destinationFor("/api/content/hadith/status") ?? "").includes("/api/public"),
    "API content paths must reach the API function, not the SPA",
  );
});
