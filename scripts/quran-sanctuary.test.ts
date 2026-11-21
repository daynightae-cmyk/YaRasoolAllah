/**
 * Quran sanctuary — directive §4.D immersive reading environment.
 *
 * A genuine 3D interior on the bounded ThreeRuntime: real geometry, node
 * travel, drag-look, exit, reduced-motion and WebGL fallback. Canonical
 * scripture is NEVER painted into scene textures — it stays in governed DOM
 * surfaces. The reading lamp toggle must drive actual scene lighting.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getInteriorScene, listInteriorScenes } from "../client/src/visual-golden/services/interior-scenes";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("quran sanctuary registry", () => {
  it("exposes one governed sanctuary scene with four linked stations", () => {
    const scenes = listInteriorScenes();
    assert.equal(scenes.length, 1);
    const scene = getInteriorScene("quran-sanctuary");
    assert.ok(scene);
    assert.equal(scene.kind, "sanctuary");
    assert.equal(scene.nodes.length, 4);
    const ids = scene.nodes.map((node) => node.id);
    assert.deepEqual(ids, ["entrance", "rehal", "light-window", "mihrab-corner"]);
    // Unique station ids; deterministic seed; valid eye positions above floor.
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(Number.isInteger(scene.seed) && scene.seed > 0);
    for (const node of scene.nodes) {
      assert.ok(node.position[1] > 1.2 && node.position[1] < 2.2, "eye height must be human observer scale");
      assert.ok(Math.abs(node.position[0]) < 13 && Math.abs(node.position[2]) < 13, "stations stay inside the room");
      assert.ok(node.labelAr.length > 0 && node.noteAr.length > 20);
    }
    // Unknown ids fail closed.
    assert.equal(getInteriorScene("not-a-scene"), null);
  });

  it("discloses the artistic nature and the text-outside-scene contract", () => {
    const scene = getInteriorScene("quran-sanctuary")!;
    assert.match(scene.disclosureAr, /فني/);
    assert.match(scene.disclosureAr, /ليس إعادة بناء/);
    assert.match(scene.disclosureAr, /لا يَرِد نص قرآني داخل المشهد/);
    const rehal = scene.nodes.find((node) => node.id === "rehal")!;
    assert.match(rehal.noteAr, /Tanzil/);
  });
});

describe("quran sanctuary engine (shared interior engine + shell)", () => {
  const component = read("client/src/visual-golden/components/quran/Sanctuary3D.tsx");
  const engine = read("client/src/visual-golden/components/three/interior-engine.ts");
  const shell = read("client/src/visual-golden/components/three/InteriorScene3D.tsx");
  const css = read("client/src/visual-golden/components/three/InteriorScene3D.module.css");

  it("sanctuary is a furnishing over the shared verified shell", () => {
    assert.match(component, /InteriorScene3D/);
    assert.match(component, /furnish=\{furnishSanctuary\}/);
    assert.match(component, /visualId="quran-sanctuary"/);
  });

  it("runs on the bounded ThreeRuntime — no rogue renderer or rAF", () => {
    assert.match(shell, /new ThreeRuntime\(\{/);
    assert.match(shell, /runtime\.stop\(\)/);
    for (const source of [component, engine, shell]) {
      assert.doesNotMatch(source, /new THREE\.WebGLRenderer/);
      assert.doesNotMatch(source, /requestAnimationFrame\(/);
      assert.doesNotMatch(source, /matchMedia\(/);
    }
    // Every geometry/material allocated through the tracker is disposed.
    assert.match(engine, /registerDisposable/);
    assert.match(engine, /scene3\.clear\(\)/);
  });

  it("builds real architecture, not a background swap", () => {
    // Pointed arches are extruded shape geometry with a cut opening.
    assert.match(engine, /THREE\.ExtrudeGeometry/);
    assert.match(engine, /outer\.holes\.push\(hole\)/);
    // Columns, lanterns and beacons in the shared shell; rug/rehal/books here.
    assert.match(engine, /CylinderGeometry\(0\.42, 0\.5, 4\.4, 12\)/);
    assert.match(component, /InstancedMesh\(bookGeo, bookMat, bookCount\)/);
    assert.match(engine, /TorusGeometry/); // station beacons
    assert.match(engine, /THREE\.PointLight/);
    assert.match(engine, /THREE\.DirectionalLight/);
  });

  it("never renders scripture into scene textures", () => {
    // No canvas-texture text pipeline exists in any scene builder at all.
    for (const source of [component, engine, shell]) {
      assert.doesNotMatch(source, /CanvasTexture/);
      assert.doesNotMatch(source, /fillText/);
      assert.doesNotMatch(source, /createElement\("canvas"\)/);
    }
    assert.match(component, /scripture is never painted into the scene/);
    // The mushaf pages are deliberately blank ivory geometry.
    assert.match(component, /Deliberately blank/);
  });

  it("supports node travel, drag-look, reset, exit and reduced motion", () => {
    assert.match(engine, /goToNode/);
    assert.match(engine, /pointerdown/);
    assert.match(engine, /setPointerCapture/);
    assert.match(shell, /event\.key === "Escape"/);
    assert.match(shell, /event\.key === "ArrowLeft"/);
    assert.match(shell, /event\.key === "Home"/);
    assert.match(engine, /context\.motion === "reduced"/);
    assert.match(engine, /resetView/);
    // Travel is eased movement between stations, not teleport slides.
    assert.match(engine, /eye\.lerpVectors\(travel\.from, travel\.to, k\)/);
    // Beacon click raycast targets stations by recorded node id.
    assert.match(engine, /userData\.nodeId = node\.id/);
    // Bounded look diagnostics for browser evidence.
    assert.match(engine, /dataset\.look/);
  });

  it("the reading lamp drives real light levels", () => {
    assert.match(engine, /setLamp\(on: boolean\)/);
    assert.match(engine, /lampLight\.intensity = 2\.4 \* lit/);
    assert.match(engine, /windowSun\.intensity = 0\.25 \+ lampLevel \* 1\.25/);
    assert.match(engine, /glowMat\.emissiveIntensity/);
    // Reduced motion applies lamp state instantly (discrete frames).
    assert.match(engine, /if \(context\.motion === "reduced"\) \{\s*lampLevel = lampTarget;/);
    // Playback level is eased and exposed to wing furnishings.
    assert.match(engine, /setPlaying\(on: boolean\)/);
    assert.match(engine, /playbackLevel/);
  });

  it("fails closed to the caller's reading surface", () => {
    assert.match(shell, /onFallback/);
    assert.match(shell, /if \(failed\) return null/);
    assert.match(css, /\.overlaySlot/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  });
});

describe("quran page sanctuary wiring", () => {
  const page = read("client/src/visual-golden/pages/QuranPage.tsx");
  const css = read("client/src/visual-golden/pages/QuranPage.module.css");

  it("offers an explicit opt-in entry, lazy-loaded", () => {
    assert.match(page, /data-visual="quran-sanctuary-enter"/);
    assert.match(page, /const Sanctuary3D = lazy\(/);
    assert.match(page, /getInteriorScene\("quran-sanctuary"\)/);
    assert.match(page, /setSanctuaryFailed\(true\)/);
    assert.match(page, /sanctuaryAvailable = !!sanctuaryScene && !sanctuaryFailed/);
  });

  it("reads canonical text in the DOM overlay from governed state", () => {
    assert.match(page, /data-visual="quran-sanctuary-reading"/);
    // The overlay verse comes from the same governed verse state as the sheet.
    assert.match(page, /selectedVerse\?\.arabic/);
    assert.match(page, /lampOn=\{lamp\}/);
    // Verse navigation and bookmarking operate on the real shared state.
    assert.match(page, /className=\{styles\.sanctuaryCardTools\}/);
  });

  it("keeps the full reading surface mounted for audio continuity", () => {
    assert.match(page, /showSanctuary \? styles\.sanctuaryHidden : undefined/);
    assert.match(css, /\.sanctuaryHidden/);
    assert.match(css, /clip-path: inset\(50%\)/);
    // The audio element is inside the always-mounted workspace.
    const workspaceStart = page.indexOf('<div className={styles.workspace}>');
    const audioTag = page.indexOf("<audio");
    assert.ok(workspaceStart > 0 && audioTag > workspaceStart);
  });

  it("preserves the existing listening and source contracts", () => {
    assert.match(page, /LISTENING_KEY = "quran-listening-settings-v1"/);
    assert.match(page, /autoAdvanceRef\.current = false/);
    assert.match(page, /getGovernanceRecord\("resource-tanzil-uthmani-min-1-1"\)/);
    assert.match(page, /data-visual="quran-sheet"/);
  });
});
