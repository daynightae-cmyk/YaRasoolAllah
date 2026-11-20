/**
 * Native API-origin contract — one client, honest endpoints on every target.
 *
 * Guards:
 * - Every governed API call site routes through apiUrl (no bare /api fetch
 *   that would silently break inside the Android WebView).
 * - api-origin keeps web deployments same-origin and only redirects local
 *   WebView origins to the canonical institution URL.
 * - The server CORS allowlist matches the native origins exactly and never
 *   enables credentials or wildcards.
 * - Capacitor bundles the real production build (dist/public), not a fork.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("client api origin", () => {
  const origin = read("client/src/lib/api-origin.ts");

  it("keeps web same-origin and maps only local WebView origins", () => {
    assert.match(origin, /https:\/\/localhost/);
    assert.match(origin, /capacitor:\/\/localhost/);
    assert.match(origin, /BRAND\.canonicalUrl/);
    assert.match(origin, /VITE_API_ORIGIN/);
    assert.match(origin, /return "";/);
  });

  it("routes every governed API call site through apiUrl", () => {
    const sites = [
      "client/src/visual-golden/services/hadith.ts",
      "client/src/visual-golden/services/quran-tafsir.ts",
      "client/src/visual-golden/services/quran-translations.ts",
      "client/src/visual-golden/services/quran-recitation.ts",
      "client/src/visual-golden/services/quranenc-translations.ts",
      "client/src/visual-golden/pages/AudioPage.tsx",
    ];
    for (const site of sites) {
      const source = read(site);
      assert.match(source, /import \{ apiUrl \} from "@\/lib\/api-origin"/, site);
      // No raw fetch("/api...") or fetch(`/api...`) remains.
      assert.doesNotMatch(source, /fetch\((["'`])\/api/, site);
    }
  });
});

describe("server native CORS", () => {
  const app = read("server/create-app.ts");

  it("allows only declared origins without credentials", () => {
    assert.match(app, /NATIVE_SHELL_ORIGINS/);
    assert.match(app, /"https:\/\/localhost"/);
    assert.match(app, /"capacitor:\/\/localhost"/);
    assert.doesNotMatch(app, /Access-Control-Allow-Origin", "\*/);
    assert.doesNotMatch(app, /Access-Control-Allow-Credentials/);
    assert.match(app, /app\.use\(nativeShellCors\)/);
  });
});

describe("capacitor android shell", () => {
  it("bundles the production web build under the institution identity", () => {
    const config = read("capacitor.config.ts");
    assert.match(config, /webDir: "dist\/public"/);
    assert.match(config, /appId: "org\.yarasoolallah\.app"/);
    assert.match(config, /androidScheme: "https"/);
    assert.match(config, /allowMixedContent: false/);

    const manifest = read("android/app/src/main/AndroidManifest.xml");
    assert.match(manifest, /android:supportsRtl="true"/);
    assert.match(manifest, /android\.permission\.INTERNET/);

    const strings = read("android/app/src/main/res/values/strings.xml");
    assert.match(strings, /يا رسول الله/);
  });
});
