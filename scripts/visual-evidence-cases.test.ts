import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "./capture-visual-evidence.mjs";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(repoRoot, "..", "client", "src");

function readClientSources(): string {
  const parts: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(tsx?|css)$/.test(entry)) parts.push(readFileSync(full, "utf8"));
    }
  };
  walk(clientRoot);
  return parts.join("\n");
}

describe("visual evidence case targets stay wired to the real product", () => {
  const app = readFileSync(join(clientRoot, "App.tsx"), "utf8");
  const sources = readClientSources();

  for (const testCase of cases) {
    it(`${testCase.name} targets a route declared in App.tsx`, () => {
      assert.ok(
        testCase.path === "/" ? app.includes('path="/"') : app.includes(`path="${testCase.path}"`),
        `route ${testCase.path} is not declared in App.tsx`,
      );
    });

    if (testCase.clickText) {
      it(`${testCase.name} click target text exists in client sources`, () => {
        assert.ok(
          sources.includes(testCase.clickText as string),
          `click text for ${testCase.name} no longer exists in client sources`,
        );
      });
    }

    if (testCase.scrollSelector?.startsWith("[data-visual")) {
      const attribute = (testCase.scrollSelector as string).slice(1, -1).split("=")[0];
      it(`${testCase.name} scroll hook exists in client sources`, () => {
        assert.ok(
          sources.includes(attribute),
          `scroll hook ${testCase.scrollSelector} for ${testCase.name} no longer exists in client sources`,
        );
      });
    }
  }
});
