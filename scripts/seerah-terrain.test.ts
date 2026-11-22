/**
 * Seerah terrain contract — genuine 3D observer environments for the five
 * Ghazawat events without a dedicated cinematic plate.
 *
 * Verifies:
 * - registry completeness/purity (canonical event ids, no historical facts,
 *   honest disclosures, valid palettes, linked observer nodes),
 * - the theatre obeys the bounded ThreeRuntime rules (no rogue renderer/rAF),
 * - reduced motion, exit freedom, and WebGL-failure fallback to the plate.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getTerrainScene,
  getChapterTerrainScene,
  listTerrainScenes,
  listBattleTerrainScenes,
  listChapterTerrainScenes,
} from "../client/src/visual-golden/services/seerah-terrain";
import { listGhazawatScenes } from "../client/src/visual-golden/services/seerah-ghazawat";
import { listSeerahScenes } from "../client/src/visual-golden/services/seerah-scene";
import { eventWorldPlate } from "../client/src/visual-golden/services/seerah-worlds";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("seerah terrain registry", () => {
  it("covers exactly the ghazawat events that have no cinematic plate", () => {
    const plateless = listGhazawatScenes()
      .filter((scene) => eventWorldPlate(scene.eventId) === null)
      .map((scene) => scene.eventId);
    const terrains = listBattleTerrainScenes().map((scene) => scene.eventId);
    assert.deepEqual([...terrains].sort(), [...plateless].sort());
    // The five known schematic-fallback battles.
    assert.deepEqual(
      [...terrains].sort(),
      ["hunayn", "khandaq", "khaybar", "tabuk", "uhud"],
    );
  });

  it("opens every canonical chapter with a distinct observer environment", () => {
    const chapters = listSeerahScenes().map((scene) => scene.chapterId);
    // Every chapter has an opening terrain; ids are canonical and unique.
    for (const chapterId of chapters) {
      const scene = getChapterTerrainScene(chapterId);
      assert.ok(scene, `chapter ${chapterId} needs an observer environment`);
      assert.equal(scene.chapterId, chapterId);
      assert.ok(getTerrainScene(scene.eventId), "chapter scene must resolve by event id too");
    }
    const openingIds = chapters.map((chapterId) => getChapterTerrainScene(chapterId)!.eventId);
    assert.equal(new Set(openingIds).size, chapters.length, "one distinct opening scene per chapter");
    const eventIds = listChapterTerrainScenes().map((scene) => scene.eventId);
    assert.equal(new Set(eventIds).size, eventIds.length, "scene event ids must be unique");
    // Directive destinations: Makkah, Hira cave, Thawr cave, lanes, hijrah
    // route, Quba, Madinah, Badr, Fath Makkah, Arafat.
    const kinds = new Set(listChapterTerrainScenes().map((scene) => scene.kind));
    assert.ok(kinds.has("settlement"));
    assert.ok(kinds.has("lanes"));
    assert.ok(kinds.has("mountain-cave"));
    assert.equal(getChapterTerrainScene("prophethood-beginning")?.kind, "mountain-cave");
    assert.equal(getChapterTerrainScene("nonexistent"), null);
  });

  it("keeps every scene honest, navigable and deterministic", () => {
    for (const scene of listTerrainScenes()) {
      assert.ok(scene.disclosureAr.length > 20, scene.eventId);
      assert.match(scene.disclosureAr, /ليست|غير|توضيحي|تفسيري|تقريبي/, scene.eventId);
      assert.ok(Number.isInteger(scene.seed), scene.eventId);
      assert.ok(scene.nodes.length >= 3, `${scene.eventId} needs linked observer stations`);
      const ids = new Set(scene.nodes.map((node) => node.id));
      assert.equal(ids.size, scene.nodes.length, `${scene.eventId} node ids must be unique`);
      for (const node of scene.nodes) {
        assert.ok(node.labelAr.length > 3, node.id);
        assert.ok(node.noteAr.length > 20, node.id);
        assert.equal(node.position.length, 3, node.id);
        assert.equal(node.lookAt.length, 3, node.id);
        // Observer eye heights stay human-scale above the terrain, and the
        // trench station may descend below grade but never absurdly deep.
        assert.ok(node.position[1] >= -2 && node.position[1] <= 6, node.id);
      }
      for (const key of ["sky", "fog", "ground", "rock", "sun"] as const) {
        assert.match(scene[key], /^#[0-9a-fA-F]{6}$/, `${scene.eventId}.${key}`);
      }
    }
    // Badr's cinematic plate stays the default; its terrain opens the chapter.
    assert.equal(getTerrainScene("badr")?.chapterId, "battles-conquests");
    assert.equal(getTerrainScene("nonexistent"), null);
  });
});

describe("terrain theatre engine contract", () => {
  const theatreRaw = read("client/src/visual-golden/components/seerah/TerrainTheatre3D.tsx");
  // Policy prose may name forbidden APIs ("no rAF, no matchMedia here");
  // only executable code is checked for violations.
  const theatre = theatreRaw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  it("runs on the bounded ThreeRuntime, never a rogue renderer loop", () => {
    assert.match(theatre, /new ThreeRuntime\(/);
    assert.doesNotMatch(theatre, /new THREE\.WebGLRenderer/);
    assert.doesNotMatch(theatre, /requestAnimationFrame/);
    assert.doesNotMatch(theatre, /matchMedia/);
    assert.match(theatre, /runtime\.stop\(\)/);
    assert.match(theatre, /context\.registerDisposable/);
    assert.match(theatre, /signal: context\.signal/, "listeners must abort with the runtime");
    assert.match(theatre, /context\.graphicsTier/, "geometry density must respect the tier");
  });

  it("is an observer, not a game: look-around, linked nodes, always an exit", () => {
    assert.match(theatre, /useEffectiveMotion/);
    assert.match(theatre, /config\.disclosureAr/);
    assert.match(theatre, /onExit/);
    assert.match(theatre, /Escape/);
    assert.match(theatre, /data-visual="seerah-terrain-theatre"/);
    assert.match(theatre, /aria-live="polite"/);
    // Reduced motion: instant station jumps, no eased travel.
    assert.match(theatre, /context\.motion === "reduced"/);
    // No people/combat anywhere in the scene builder.
    assert.doesNotMatch(theatre, /soldier|combatant|fighter|avatar/i);
    // All three new terrain families are built as real geometry.
    assert.match(theatre, /config\.kind === "settlement"/);
    assert.match(theatre, /config\.kind === "lanes"/);
    assert.match(theatre, /config\.kind === "mountain-cave"/);
  });

  it("routes the 3D observer into a full-screen studio instead of the reading column", () => {
    const env = read("client/src/visual-golden/components/seerah/GhazawatEnvironment.tsx");
    assert.match(env, /getTerrainScene\(scene\.eventId\)/);
    assert.match(env, /data-visual="seerah-terrain-enter"/);
    assert.match(env, /studioHref/);
    assert.match(env, /plateOnly/);
    // The entry is a navigation link, not an inline mount: inside the ~479px
    // reading column the heightfield read as a corrupted postage stamp.
    assert.doesNotMatch(env, /lazy\(\(\) =>\s*import\("\.\/TerrainTheatre3D"\)/);
    assert.match(env, /data-terrain-mode="plate"/);
    // The cinematic/schematic plate path stays intact as default and fallback.
    assert.match(env, /eventWorldPlate\(scene\.eventId\)/);
    assert.match(env, /scene\.disclosureAr/);
    const css = read("client/src/visual-golden/components/seerah/TerrainTheatre3D.module.css");
    assert.match(css, /prefers-reduced-motion/);
  });

  it("gives the studio a real full-viewport route page", () => {
    const page = read("client/src/visual-golden/pages/SeerahTerrainStudio.tsx");
    assert.match(page, /lazy\(/);
    assert.match(page, /TerrainTheatre3D/);
    assert.match(page, /immersive/);
    assert.match(page, /getTerrainScene/);
    assert.match(page, /listBattleTerrainScenes/);
    assert.match(page, /data-visual="seerah-terrain-studio"/);
    assert.match(page, /onUnavailable=\{backToReading\}/);
    // Heavy 3D lives only in the studio so the reading column never pays for WebGL.
    assert.match(page, /data-visual="seerah-terrain-loading"/);
    // The station HUD is rendered as DOM, never painted into the canvas.
    const theatre = read("client/src/visual-golden/components/seerah/TerrainTheatre3D.tsx");
    assert.match(theatre, /immersive/);
    // Global Escape so the key closes the studio even when focus sits on a HUD chip.
    assert.match(theatre, /window\.addEventListener\("keydown"/);
    // CSS gives the studio the whole viewport.
    const css = read("client/src/visual-golden/pages/SeerahTerrainStudio.module.css");
    assert.match(css, /100svh/);
    assert.match(css, /min-height: 520px/);
  });

  it("registers the studio route in the shell", () => {
    const app = read("client/src/App.tsx");
    assert.match(app, /path="\/seerah\/terrain"/);
    assert.match(app, /SeerahTerrainStudio/);
  });

  it("mounts lazily inside ChapterEnvironment with a plate fallback", () => {
    const env = read("client/src/visual-golden/components/seerah/ChapterEnvironment.tsx");
    assert.match(env, /lazy\(\(\) =>\s*import\("\.\/TerrainTheatre3D"\)/);
    assert.match(env, /getChapterTerrainScene\(scene\.chapterId\)/);
    assert.match(env, /onUnavailable/);
    assert.match(env, /data-visual="seerah-chapter-terrain-enter"/);
    // The cinematic/schematic plate path stays intact as default and fallback.
    assert.match(env, /chapterWorldPlate\(scene\.chapterId\)/);
    assert.match(env, /scene\.disclosureAr/);
  });
});
