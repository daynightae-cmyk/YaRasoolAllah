/**
 * World plates contract — cinematic 2026 reference integration.
 *
 * Guards:
 * 1. Every navigation wing resolves to a production world plate that exists
 *    on disk under client/public with a matching manifest provenance record.
 * 2. Every cinematic Seerah world plate exists and is recorded in the
 *    pipeline manifest with source + output SHA-256.
 * 3. The shell mounts WorldBackdrop and pages consume the world registry —
 *    no page may regress to obsolete June-2025 attached_assets artwork.
 * 4. Seerah environments prefer cinematic plates but keep the schematic SVG
 *    fallback and the reconstruction disclosure contract intact.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INSTITUTION_NAVIGATION_WINGS,
  INSTITUTION_WINGS,
} from "../client/src/visual-golden/lib/institution/workspace";
import {
  listWorldPlates,
  worldPlateForWing,
} from "../client/src/visual-golden/lib/institution/worlds";
import {
  chapterWorldPlate,
  eventWorldPlate,
  battlesTimelinePlate,
} from "../client/src/visual-golden/services/seerah-worlds";
import { listSeerahScenes } from "../client/src/visual-golden/services/seerah-scene";
import { listGhazawatScenes } from "../client/src/visual-golden/services/seerah-ghazawat";
import { CHAPTERS } from "../client/src/visual-golden/services/seerah";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const publicPath = (plateUrl: string) => join(repoRoot, "client", "public", plateUrl.replace(/^\//, ""));

interface ManifestPlate {
  kind: "wing" | "seerah";
  wing?: string;
  scene?: string;
  plate: string;
  source: string;
  sourceSha256: string;
  outputSha256: string;
  outputBytes: number;
}

const manifest = JSON.parse(
  read("client/public/visual-golden/art/worlds/manifest.json"),
) as { plates: ManifestPlate[] };

describe("wing world plates", () => {
  it("gives every navigation wing a distinct cinematic world identity", () => {
    for (const wingId of INSTITUTION_NAVIGATION_WINGS) {
      const world = worldPlateForWing(wingId);
      assert.ok(world.plate.startsWith("/visual-golden/art/worlds/"), wingId);
      assert.ok(existsSync(publicPath(world.plate)), `missing plate for ${wingId}: ${world.plate}`);
      assert.match(world.reference, /^02_ENVIRONMENT_ART\//, wingId);
    }
    // All 13 workspace wings (including practice/reference aliases) resolve.
    for (const wingId of Object.keys(INSTITUTION_WINGS)) {
      assert.ok(worldPlateForWing(wingId as never).plate.length > 0, wingId);
    }
    assert.equal(listWorldPlates().length, 13);
  });

  it("records pipeline provenance with a verifiable output hash per plate", () => {
    assert.equal(manifest.plates.length, 20, "10 wing plates + 10 seerah plates");
    for (const record of manifest.plates) {
      const file = publicPath(record.plate);
      assert.ok(existsSync(file), record.plate);
      const bytes = readFileSync(file);
      assert.equal(bytes.length, record.outputBytes, record.plate);
      const hash = createHash("sha256").update(bytes).digest("hex");
      assert.equal(hash, record.outputSha256, `hash drift: ${record.plate}`);
      assert.match(record.sourceSha256, /^[a-f0-9]{64}$/);
      assert.ok(
        record.source.startsWith("02_ENVIRONMENT_ART/") ||
          record.source.startsWith("03_IMMERSIVE_SEERAH/"),
        `plate must derive from the approved 2026 pack: ${record.source}`,
      );
    }
  });
});

describe("seerah cinematic worlds", () => {
  it("maps canonical chapters and events only — never invented ids", () => {
    const chapterIds = new Set(CHAPTERS.map((chapter) => chapter.id));
    const mappedChapters = [
      "birth-and-upbringing",
      "prophethood-beginning",
      "hijra-to-madinah",
      "establishing-state",
      "battles-conquests",
    ];
    for (const id of mappedChapters) {
      assert.ok(chapterIds.has(id), id);
      const plate = chapterWorldPlate(id);
      assert.ok(plate && existsSync(publicPath(plate)), id);
    }
    // Chapters without cinematic plates fall back to their schematic scene.
    assert.equal(chapterWorldPlate("secret-public-dawah"), null);
    assert.equal(chapterWorldPlate("farewell-hajj"), null);
    assert.equal(chapterWorldPlate("prophet-death"), null);
    assert.equal(chapterWorldPlate("not-a-chapter"), null);

    const eventIds = new Set(
      CHAPTERS.flatMap((chapter) => (chapter.timelineEvents ?? []).map((event) => event.id)),
    );
    for (const id of ["hijra-start", "cave-thawr", "arrival-quba", "arrival-madinah", "badr", "mecca-conquest"]) {
      assert.ok(eventIds.has(id), id);
      const plate = eventWorldPlate(id);
      assert.ok(plate && existsSync(publicPath(plate)), id);
    }
    // Battles without a dedicated cinematic plate keep their SVG scene.
    for (const id of ["uhud", "khandaq", "khaybar", "hunayn", "tabuk"]) {
      assert.equal(eventWorldPlate(id), null, id);
    }
    assert.ok(existsSync(publicPath(battlesTimelinePlate())));
  });

  it("keeps the honesty contract: disclosures and schematic fallbacks intact", () => {
    for (const scene of listSeerahScenes()) {
      assert.ok(scene.disclosureAr.length > 20, scene.chapterId);
      assert.ok(scene.plate.startsWith("scene"), "schematic SVG fallback plate must remain registered");
    }
    for (const scene of listGhazawatScenes()) {
      assert.ok(scene.disclosureAr.length > 20, scene.eventId);
    }
    const stage = read("client/src/visual-golden/components/seerah/SeerahChapterStage.tsx");
    assert.match(stage, /chapterWorldPlate\(chapter\.id\)/);
    assert.match(stage, /scene\.disclosureAr/);
    const chapterEnv = read("client/src/visual-golden/components/seerah/ChapterEnvironment.tsx");
    assert.match(chapterEnv, /chapterWorldPlate\(scene\.chapterId\)/);
    assert.match(chapterEnv, /scene\.disclosureAr/);
    const ghazawatEnv = read("client/src/visual-golden/components/seerah/GhazawatEnvironment.tsx");
    assert.match(ghazawatEnv, /eventWorldPlate\(scene\.eventId\)/);
    assert.match(ghazawatEnv, /scene\.disclosureAr/);
  });
});

describe("shell world integration", () => {
  it("mounts the cinematic backdrop inside the institution shell", () => {
    const shell = read("client/src/visual-golden/components/shell/InstitutionShell.tsx");
    assert.match(shell, /import \{ WorldBackdrop \} from "\.\/WorldBackdrop"/);
    assert.match(shell, /<WorldBackdrop wing=\{workspace\.wing\.id\} \/>/);
    const backdrop = read("client/src/visual-golden/components/shell/WorldBackdrop.tsx");
    assert.match(backdrop, /aria-hidden/);
    assert.match(backdrop, /theme === "contrast"/, "high-contrast must drop decorative art");
    assert.match(backdrop, /worldPlateForWing/);
    const backdropCss = read("client/src/visual-golden/components/shell/world-backdrop.module.css");
    assert.match(backdropCss, /pointer-events:\s*none/);
    assert.match(backdropCss, /prefers-reduced-motion/);
  });

  it("never references obsolete June-2025 attached_assets from visual pages", () => {
    // Strip comments: policy prose may mention the obsolete folder, but no
    // import, URL or path in executable code may reference it.
    const codeOnly = (source: string) =>
      source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const pageDir = join(repoRoot, "client/src/visual-golden/pages");
    const pages = [
      "HomePage.tsx", "QuranPage.tsx", "TafsirPage.tsx", "SeerahPage.tsx",
      "SeerahDatabasePage.tsx", "AtlasPage.tsx", "HadithPage.tsx", "LibraryPage.tsx",
      "KidsPage.tsx", "DailyPage.tsx", "AudioPage.tsx", "BasirahPage.tsx",
    ];
    for (const page of pages) {
      const source = codeOnly(readFileSync(join(pageDir, page), "utf8"));
      assert.doesNotMatch(source, /attached_assets|@assets/, `${page} must not use obsolete art`);
    }
    const worlds = codeOnly(read("client/src/visual-golden/lib/institution/worlds.ts"));
    assert.doesNotMatch(worlds, /attached_assets|@assets/);
  });
});
