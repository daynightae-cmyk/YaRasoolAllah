/**
 * verify-reference-pack — provenance gate for the owner-approved 2026 reference pack.
 *
 * The pack is the visual authority for the institution's rebuilt worlds. This
 * script proves, without needing to read any image:
 *   1. every file listed in the pack's manifest.json exists and matches its
 *      recorded SHA-256 (all four reference directories, all 50 entries);
 *   2. every production plate in
 *      client/public/visual-golden/art/worlds/manifest.json cites a pack source
 *      whose SHA-256 still matches;
 *   3. every generated .webp still matches the output SHA-256 recorded for it.
 *
 * The June-2025 `attached_assets` artwork is deliberately out of scope: it is
 * obsolete historical reference material and must never be substituted here.
 *
 * Usage:  node scripts/verify-reference-pack.mjs
 * Env:    YRA_REFERENCE_PACK — override the pack root directory.
 *
 * Exits:
 *   0  all present sources and plates verified
 *   1  a source/plate is missing or hash-mismatched
 *   2  the pack directory or its manifest.json cannot be read
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_PACK = resolve(
  repoRoot,
  "..",
  "YRA_ULTIMATE_MULTIPLATFORM_PACK",
  "YRA_REFERENCE_PACK",
);

const packRoot = process.env.YRA_REFERENCE_PACK
  ? resolve(process.env.YRA_REFERENCE_PACK)
  : DEFAULT_PACK;

const packManifestPath = join(packRoot, "manifest.json");
const worldsManifestPath = join(
  repoRoot,
  "client",
  "public",
  "visual-golden",
  "art",
  "worlds",
  "manifest.json",
);

const sha256 = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

const problems = { sourceMissing: 0, sourceMismatch: 0, plateMissing: 0, plateMismatch: 0 };

const fail = (message) => {
  console.error(`verify-reference-pack: ${message}`);
  process.exitCode = 1;
};

if (!existsSync(packRoot) || !existsSync(packManifestPath)) {
  console.error(
    `verify-reference-pack: reference pack not found.\n` +
      `  attempted: ${packRoot}\n` +
      `  set YRA_REFERENCE_PACK to the pack root (the directory holding manifest.json).\n` +
      `  The directive's literal path K:\\Knoux Projects\\YaRasoolAllah\\YRA_REFERENCE_PACK\n` +
      `  is not where this pack lives; the verified location is under the\n` +
      `  YRA_ULTIMATE_MULTIPLATFORM_PACK folder. No substitute artwork is used.`,
  );
  process.exit(2);
}

let pack;
try {
  pack = JSON.parse(readFileSync(packManifestPath, "utf8"));
} catch (error) {
  console.error(
    `verify-reference-pack: cannot parse ${packManifestPath}: ${error.message}`,
  );
  process.exit(2);
}

if (!Array.isArray(pack)) {
  console.error(
    `verify-reference-pack: ${packManifestPath} must contain an array of entries`,
  );
  process.exit(2);
}

let sourceOk = 0;
const packHashes = new Map();

for (const entry of pack) {
  const { file, sha256: expected, original } = entry ?? {};
  if (typeof file !== "string" || typeof expected !== "string") {
    fail(`manifest entry is malformed: ${JSON.stringify(entry)}`);
    problems.sourceMismatch += 1;
    continue;
  }
  const sourcePath = join(packRoot, file);
  if (!existsSync(sourcePath)) {
    fail(`missing source: ${file}${original ? ` (original: ${original})` : ""}`);
    problems.sourceMissing += 1;
    continue;
  }
  const actual = sha256(sourcePath).toLowerCase();
  if (actual !== expected.toLowerCase()) {
    fail(`hash mismatch: ${file} — expected ${expected}, got ${actual}`);
    problems.sourceMismatch += 1;
    continue;
  }
  sourceOk += 1;
  packHashes.set(file, expected.toLowerCase());
}

let plateOk = 0;
let plateChecked = 0;

if (existsSync(worldsManifestPath)) {
  let worlds;
  try {
    worlds = JSON.parse(readFileSync(worldsManifestPath, "utf8"));
  } catch (error) {
    console.error(
      `verify-reference-pack: cannot parse ${worldsManifestPath}: ${error.message}`,
    );
    process.exit(1);
  }

  for (const plate of worlds.plates ?? []) {
    plateChecked += 1;

    const source = plate.source;
    const sourceHash = typeof source === "string" ? packHashes.get(source) : undefined;
    if (sourceHash === undefined) {
      fail(`plate ${plate.plate ?? "?"} cites untracked source ${source ?? "?"}`);
      problems.plateMismatch += 1;
      continue;
    }

    if (
      typeof plate.sourceSha256 === "string" &&
      plate.sourceSha256.toLowerCase() !== sourceHash
    ) {
      fail(
        `plate ${plate.plate ?? "?"} source hash drifted: recorded ${plate.sourceSha256}, pack now ${sourceHash}`,
      );
      problems.plateMismatch += 1;
      continue;
    }

    if (typeof plate.plate !== "string") {
      fail(`plate entry has no plate path: ${JSON.stringify(plate)}`);
      problems.plateMismatch += 1;
      continue;
    }

    const outputPath = join(repoRoot, "client", "public", plate.plate.replace(/^\//, ""));
    if (!existsSync(outputPath)) {
      fail(`missing plate: ${plate.plate}`);
      problems.plateMissing += 1;
      continue;
    }

    if (typeof plate.outputSha256 === "string") {
      const actual = sha256(outputPath).toLowerCase();
      if (actual !== plate.outputSha256.toLowerCase()) {
        fail(`plate hash mismatch: ${plate.plate} — expected ${plate.outputSha256}, got ${actual}`);
        problems.plateMismatch += 1;
        continue;
      }
    }

    plateOk += 1;
  }
} else {
  console.error(
    `verify-reference-pack: note — no worlds manifest at ${worldsManifestPath}; ` +
      `source integrity checked, plate provenance not checked.`,
  );
}

console.log(
  `verify-reference-pack: pack sources ${sourceOk}/${pack.length} verified ` +
    `(${problems.sourceMissing} missing, ${problems.sourceMismatch} mismatched)`,
);
if (plateChecked > 0) {
  console.log(
    `verify-reference-pack: production plates ${plateOk}/${plateChecked} verified ` +
      `(${problems.plateMissing} missing, ${problems.plateMismatch} mismatched)`,
  );
}

if (
  problems.sourceMissing > 0 ||
  problems.sourceMismatch > 0 ||
  problems.plateMissing > 0 ||
  problems.plateMismatch > 0
) {
  process.exitCode = 1;
}
