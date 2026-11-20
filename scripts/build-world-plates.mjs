/**
 * build-world-plates — cinematic world plate pipeline (2026 reference pack).
 *
 * Converts the approved owner reference artwork into production WebP plates:
 *   02_ENVIRONMENT_ART  -> client/public/visual-golden/art/worlds/{wing}.webp
 *   03_IMMERSIVE_SEERAH -> client/public/visual-golden/art/worlds/seerah/{scene}.webp
 *
 * Provenance contract:
 * - Every output records its source file name, source SHA-256 and output
 *   SHA-256 in worlds/manifest.json. The reference pack manifest.json is the
 *   authority for source integrity; this script re-hashes sources itself.
 * - No June-2025 attached_assets art is read or written by this pipeline.
 * - Requires ffmpeg on PATH (libwebp encoder). Re-runnable and idempotent.
 *
 * Usage: node scripts/build-world-plates.mjs
 * Env:   YRA_REFERENCE_PACK — override the reference pack root directory.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packRoot =
  process.env.YRA_REFERENCE_PACK ??
  resolve(repoRoot, "..", "YRA_ULTIMATE_MULTIPLATFORM_PACK", "YRA_REFERENCE_PACK");

const outRoot = join(repoRoot, "client", "public", "visual-golden", "art", "worlds");

/** 02_ENVIRONMENT_ART file stem -> institution wing id. */
const WING_PLATES = [
  ["01_library", "library"],
  ["02_sources", "sources"],
  ["03_audio", "audio"],
  ["04_daily", "daily"],
  ["05_atlas", "atlas"],
  ["06_children", "kids"],
  ["07_quran", "quran"],
  ["08_hadith", "hadith"],
  ["09_seerah", "seerah"],
  ["10_home", "home"],
];

/** 03_IMMERSIVE_SEERAH file stem -> cinematic scene id. */
const SEERAH_PLATES = [
  ["84222_seerah_hijrah_overview", "hijrah-overview"],
  ["84223_hijrah_night", "hijrah-night"],
  ["84224_badr_immersive", "badr"],
  ["84225_fath_makkah", "fath-makkah"],
  ["84226_hijrah_thawr", "hijrah-thawr"],
  ["84227_badr_timeline", "badr-timeline"],
  ["84228_madinah_walk", "madinah-walk"],
  ["84229_makkah_before_islam", "makkah-before-islam"],
  ["84230_hijrah_desert", "hijrah-desert"],
  ["84231_hira", "hira"],
];

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function convert(sourcePath, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  execFileSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", "-i", sourcePath, "-c:v", "libwebp", "-quality", "88", outPath],
    { stdio: "inherit" },
  );
}

const records = [];
let failures = 0;

for (const [stem, wing] of WING_PLATES) {
  const source = join(packRoot, "02_ENVIRONMENT_ART", `${stem}.png`);
  const out = join(outRoot, `${wing}.webp`);
  if (!existsSync(source)) {
    console.error(`MISSING source: ${source}`);
    failures += 1;
    continue;
  }
  convert(source, out);
  records.push({
    kind: "wing",
    wing,
    plate: `/visual-golden/art/worlds/${wing}.webp`,
    source: `02_ENVIRONMENT_ART/${stem}.png`,
    sourceSha256: sha256(source),
    outputSha256: sha256(out),
    outputBytes: readFileSync(out).length,
  });
  console.log(`wing ${wing}: ${(readFileSync(out).length / 1024).toFixed(0)} KB`);
}

for (const [stem, scene] of SEERAH_PLATES) {
  const source = join(packRoot, "03_IMMERSIVE_SEERAH", `${stem}.png`);
  const out = join(outRoot, "seerah", `${scene}.webp`);
  if (!existsSync(source)) {
    console.error(`MISSING source: ${source}`);
    failures += 1;
    continue;
  }
  convert(source, out);
  records.push({
    kind: "seerah",
    scene,
    plate: `/visual-golden/art/worlds/seerah/${scene}.webp`,
    source: `03_IMMERSIVE_SEERAH/${stem}.png`,
    sourceSha256: sha256(source),
    outputSha256: sha256(out),
    outputBytes: readFileSync(out).length,
  });
  console.log(`seerah ${scene}: ${(readFileSync(out).length / 1024).toFixed(0)} KB`);
}

const manifest = {
  generatedBy: "scripts/build-world-plates.mjs",
  referencePack: "YRA_ULTIMATE_MULTIPLATFORM_PACK/YRA_REFERENCE_PACK (owner-approved 2026)",
  encoder: "ffmpeg libwebp quality=88",
  honesty:
    "لوحات فنية توضيحية لبيئات الأقسام ومشاهد السيرة — لا تجسيد للنبي ﷺ ولا لأصحابه، وليست توثيقًا أثريًا.",
  plates: records,
};
writeFileSync(join(outRoot, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`\n${records.length} plates written, ${failures} missing sources.`);
if (failures > 0 || records.length !== WING_PLATES.length + SEERAH_PLATES.length) {
  process.exit(1);
}
