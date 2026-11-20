/**
 * Windows desktop icon — derived from the institution logo (logo.webp).
 * electron-builder converts the 512px PNG into the multi-size .ico.
 *
 * Run: node scripts/build-desktop-icon.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logo = join(repoRoot, "client/public/visual-golden/art/logo.webp");
const outDir = join(repoRoot, "desktop");
mkdirSync(outDir, { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", logo,
    "-vf", "scale=512:512:flags=lanczos",
    join(outDir, "icon.png"),
  ],
  { stdio: "inherit" },
);

console.log("desktop/icon.png rebuilt from logo.webp");
