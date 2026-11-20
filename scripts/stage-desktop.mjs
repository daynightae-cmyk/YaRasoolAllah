/**
 * Desktop staging — assemble a dependency-free Electron app directory.
 *
 * electron-builder walks parent directories for node_modules; staging the
 * shell into dist-desktop/app guarantees only the Electron host + the exact
 * production web build are packaged (no server/runtime dependency tree).
 *
 * Run via: npm run desktop:pack / desktop:dist
 */

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stage = join(repoRoot, "dist-desktop", "app");

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

for (const file of ["main.cjs", "preload.cjs", "icon.png"]) {
  cpSync(join(repoRoot, "desktop", file), join(stage, file));
}

cpSync(join(repoRoot, "dist", "public"), join(stage, "public"), { recursive: true });

// Minimal app manifest: no dependencies, main beside the web build.
writeFileSync(
  join(stage, "package.json"),
  JSON.stringify(
    {
      name: "ya-rasool-allah-desktop",
      productName: "Ya Rasool Allah",
      version: "0.1.0",
      description: "YA RASOOL ALLAH — Windows desktop institution shell",
      author: "Ya Rasool Allah Institution",
      license: "MIT",
      private: true,
      main: "main.cjs",
    },
    null,
    2,
  ),
);

console.log(`desktop app staged at ${stage}`);
