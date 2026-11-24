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
  const brand = read("client/src/config/brand.ts");

  it("keeps web same-origin and maps only local WebView origins", () => {
    assert.match(origin, /https:\/\/localhost/);
    assert.match(origin, /capacitor:\/\/localhost/);
    assert.match(origin, /BRAND\.apiOrigin/);
    assert.match(origin, /VITE_API_ORIGIN/);
    assert.match(origin, /return "";/);
  });

  it("addresses the final deployment host, not the CORS-less redirecting apex", () => {
    // The apex host answers with a 308 to `www` and that redirect response
    // carries no Access-Control-Allow-Origin, so a browser aborts the whole
    // CORS request. Native shells must hit the final host directly.
    assert.match(brand, /apiOrigin: "https:\/\/www\.yarasoolallah\.it\.com"/);
    assert.doesNotMatch(origin, /BRAND\.canonicalUrl/);
    const apiOrigin = brand.match(/apiOrigin: "([^"]+)"/)?.[1];
    assert.ok(apiOrigin, "brand.apiOrigin must be declared");
    assert.ok(apiOrigin.startsWith("https://"), apiOrigin);
    assert.notEqual(apiOrigin, brand.match(/canonicalUrl: "([^"]+)"/)?.[1]);
  });

  it("routes every governed API call site through apiUrl", () => {
    const sites = [
      "client/src/visual-golden/services/hadith.ts",
      "client/src/visual-golden/services/quran-tafsir.ts",
      "client/src/visual-golden/services/quran-translations.ts",
      "client/src/visual-golden/services/quran-recitation.ts",
      "client/src/visual-golden/services/quranenc-translations.ts",
      "client/src/visual-golden/services/iiif.ts",
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
  const publicApp = read("server/create-public-content-app.ts");
  const policy = read("server/native-shell-cors.ts");

  it("allows only declared origins without credentials", () => {
    assert.match(policy, /NATIVE_SHELL_ORIGINS/);
    assert.match(policy, /"https:\/\/localhost"/);
    assert.match(policy, /"capacitor:\/\/localhost"/);
    assert.doesNotMatch(policy, /Access-Control-Allow-Origin", "\*/);
    assert.doesNotMatch(policy, /Access-Control-Allow-Credentials/);
    assert.match(app, /app\.use\(nativeShellCors\)/);
  });

  it("accepts the exact origins the shipped shells present", () => {
    // Capacitor Android serves the bundle from https://localhost
    // (androidScheme: "https"); the packaged desktop shell presents
    // yra://institution. Both must be answerable with their own origin.
    const policySet = read("server/native-shell-cors.ts");
    for (const origin of ["https://localhost", "http://localhost", "capacitor://localhost", "yra://institution"]) {
      assert.match(policySet, new RegExp(`"${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), origin);
    }
  });

  it("serves the same allowlist from the public content function", () => {
    // The Vercel public-content function is the entry that answers
    // /api/content/* in production, so it must apply the identical policy
    // or a native shell reads one origin and is blocked by another.
    assert.match(publicApp, /import \{ nativeShellCors \} from "\.\/native-shell-cors\.js"/);
    assert.match(publicApp, /app\.use\(nativeShellCors\)/);
    assert.doesNotMatch(publicApp, /Access-Control-Allow-Origin", "\*/);
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

describe("electron windows shell", () => {
  const main = read("desktop/main.cjs");

  it("loads only the bundled production build through a privileged scheme", () => {
    assert.match(main, /"dist", "public"/);
    assert.match(main, /PACKAGED_WEB_ROOT/);
    assert.match(main, /registerSchemesAsPrivileged/);
    assert.match(main, /contextIsolation: true/);
    assert.match(main, /nodeIntegration: false/);
    assert.match(main, /sandbox: true/);
    // Path traversal guard on the local protocol handler.
    assert.match(main, /startsWith\(WEB_ROOT\)/);
    // No remote navigation inside the shell window.
    assert.match(main, /will-navigate/);
    assert.match(main, /setWindowOpenHandler/);
  });

  it("marks the desktop runtime so governed calls use the canonical origin", () => {
    const preload = read("desktop/preload.cjs");
    assert.match(preload, /contextBridge\.exposeInMainWorld\("__YRA_DESKTOP__", true\)/);
    const origin = read("client/src/lib/api-origin.ts");
    assert.match(origin, /__YRA_DESKTOP__/);
    assert.match(origin, /yra:\/\/institution/);
  });

  it("packages the real web build, not a fork", () => {
    const builder = read("electron-builder.config.cjs");
    assert.match(builder, /app: "dist-desktop\/app"/);
    assert.match(builder, /appId: "org\.yarasoolallah\.desktop"/);
    // Zero-dependency host: beforeBuild → false marks node_modules handled
    // externally, skipping rebuild and parent-tree collection.
    assert.match(builder, /beforeBuild: \(\) => false/);
    assert.doesNotMatch(builder, /npmRebuild: false/);
    const stage = read("scripts/stage-desktop.mjs");
    assert.match(stage, /"dist", "public"/);
    assert.match(stage, /main\.cjs/);
    const appPackage = JSON.parse(read("desktop/package.json"));
    assert.equal(appPackage.main, "main.cjs");
    assert.equal(appPackage.dependencies, undefined);
  });
});
