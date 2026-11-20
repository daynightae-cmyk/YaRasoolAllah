/**
 * Android launcher icons — derived from the institution logo (logo.webp).
 *
 * Reproducible ffmpeg pipeline (same toolchain as build-world-plates.mjs):
 * - Legacy ic_launcher / ic_launcher_round at 48–192px per density.
 * - Adaptive-icon foregrounds at 108dp densities with the logo inside the
 *   66dp safe zone, transparent padding over the emerald-night background.
 *
 * Run: node scripts/build-android-icons.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logo = join(repoRoot, "client/public/visual-golden/art/logo.webp");
const resRoot = join(repoRoot, "android/app/src/main/res");

const LEGACY = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192],
];

const ADAPTIVE = [
  ["mipmap-mdpi", 108],
  ["mipmap-hdpi", 162],
  ["mipmap-xhdpi", 216],
  ["mipmap-xxhdpi", 324],
  ["mipmap-xxxhdpi", 432],
];

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

for (const [folder, size] of LEGACY) {
  const dir = join(resRoot, folder);
  mkdirSync(dir, { recursive: true });
  for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
    ffmpeg(["-i", logo, "-vf", `scale=${size}:${size}:flags=lanczos`, join(dir, name)]);
  }
  console.log(`legacy ${folder} ${size}px`);
}

for (const [folder, size] of ADAPTIVE) {
  const dir = join(resRoot, folder);
  mkdirSync(dir, { recursive: true });
  // Logo occupies ~62% of the canvas: inside the 66/108 adaptive safe zone.
  const inner = Math.round(size * 0.62);
  ffmpeg([
    "-i", logo,
    "-vf",
    `scale=${inner}:${inner}:flags=lanczos,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=black@0,format=rgba`,
    join(dir, "ic_launcher_foreground.png"),
  ]);
  console.log(`adaptive ${folder} ${size}px`);
}

console.log("Android launcher icons rebuilt from logo.webp");

// Splash screens: logo centered on the emerald-night field, per orientation
// bucket. The launch theme uses @drawable/splash from each density bucket.
const SPLASH = [
  ["drawable-port-mdpi", 320, 480],
  ["drawable-port-hdpi", 480, 800],
  ["drawable-port-xhdpi", 720, 1280],
  ["drawable-port-xxhdpi", 960, 1600],
  ["drawable-port-xxxhdpi", 1280, 1920],
  ["drawable-land-mdpi", 480, 320],
  ["drawable-land-hdpi", 800, 480],
  ["drawable-land-xhdpi", 1280, 720],
  ["drawable-land-xxhdpi", 1600, 960],
  ["drawable-land-xxxhdpi", 1920, 1280],
  ["drawable", 480, 320],
];

for (const [folder, width, height] of SPLASH) {
  const dir = join(resRoot, folder);
  mkdirSync(dir, { recursive: true });
  const inner = Math.round(Math.min(width, height) * 0.42);
  ffmpeg([
    "-f", "lavfi", "-i", `color=c=0x020617:s=${width}x${height}`,
    "-i", logo,
    "-filter_complex",
    `[1:v]scale=${inner}:${inner}:flags=lanczos[fg];[0:v][fg]overlay=(W-w)/2:(H-h)/2`,
    "-frames:v", "1",
    join(dir, "splash.png"),
  ]);
  console.log(`splash ${folder} ${width}x${height}`);
}

console.log("Android splash screens rebuilt from logo.webp");
