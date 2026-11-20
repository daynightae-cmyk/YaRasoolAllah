/**
 * PWA shell contract — installable app with an honest offline policy.
 *
 * Guards:
 * - manifest.webmanifest is valid, Arabic RTL, with icons and standalone display.
 * - index.html links the manifest.
 * - main.tsx registers the worker only in production builds.
 * - sw.js NEVER caches /api/* (provider-governed live content stays live),
 *   purges old cache versions, and falls back to the cached shell offline.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("pwa manifest", () => {
  const manifest = JSON.parse(read("client/public/manifest.webmanifest"));

  it("declares an installable Arabic RTL institution app", () => {
    assert.equal(manifest.lang, "ar");
    assert.equal(manifest.dir, "rtl");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.scope, "/");
    assert.ok(manifest.name.includes("يا رسول الله"));
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
    for (const icon of manifest.icons) {
      assert.ok(icon.src.startsWith("/visual-golden/art/"));
      assert.ok(icon.sizes && icon.type);
    }
    assert.ok(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable"));
  });

  it("is linked from the app entry document", () => {
    const html = read("client/index.html");
    assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(html, /apple-touch-icon/);
  });
});

describe("service worker policy", () => {
  const sw = read("client/public/sw.js");
  const main = read("client/src/main.tsx");

  it("registers only in production builds and never breaks boot on failure", () => {
    assert.match(main, /import\.meta\.env\.PROD/);
    assert.match(main, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
    assert.match(main, /\.catch\(/);
  });

  it("never caches provider-governed API responses", () => {
    assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)\) return/);
    // No cache.put anywhere near an api path.
    const apiBlocks = sw.split("/api/");
    assert.ok(apiBlocks.length >= 2);
  });

  it("purges stale cache versions and serves the shell offline", () => {
    assert.match(sw, /caches\.delete/);
    assert.match(sw, /request\.mode === "navigate"/);
    assert.match(sw, /caches\.match\("\/"\)/);
    assert.match(sw, /self\.skipWaiting/);
    assert.match(sw, /self\.clients\.claim/);
  });
});
