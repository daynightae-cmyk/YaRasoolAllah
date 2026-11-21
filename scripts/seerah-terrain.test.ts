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
  listTerrainScenes,
} from "../client/src/visual-golden/services/seerah-terrain";
import { listGhazawatScenes } from "../client/src/visual-golden/services/seerah-ghazawat";
import { eventWorldPlate } from "../client/src/visual-golden/services/seerah-worlds";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("seerah terrain registry", () => {
  it("covers exactly the ghazawat events that have no cinematic plate", () => {
    const plateless = listGhazawatScenes()
      .filter((scene) => eventWorldPlate(scene.eventId) === null)
      .map((scene) => scene.eventId);
    const terrains = listTerrainScenes().map((scene) => scene.eventId);
    assert.deepEqual([...terrains].sort(), [...plateless].sort());
    // The five known schematic-fallback battles.
    assert.deepEqual(
      [...terrains].sort(),
      ["hunayn", "khandaq", "khaybar", "tabuk", "uhud"],
    );
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
    assert.equal(getTerrainScene("badr"), null, "plated events keep their cinematic plate");
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
  });

  it("mounts lazily inside GhazawatEnvironment with a plate fallback", () => {
    const env = read("client/src/visual-golden/components/seerah/GhazawatEnvironment.tsx");
    assert.match(env, /lazy\(\(\) =>\s*import\("\.\/TerrainTheatre3D"\)/);
    assert.match(env, /getTerrainScene\(scene\.eventId\)/);
    assert.match(env, /onUnavailable/);
    assert.match(env, /data-visual="seerah-terrain-enter"/);
    // The cinematic/schematic plate path stays intact as default and fallback.
    assert.match(env, /eventWorldPlate\(scene\.eventId\)/);
    assert.match(env, /scene\.disclosureAr/);
    const css = read("client/src/visual-golden/components/seerah/TerrainTheatre3D.module.css");
    assert.match(css, /prefers-reduced-motion/);
  });
});
