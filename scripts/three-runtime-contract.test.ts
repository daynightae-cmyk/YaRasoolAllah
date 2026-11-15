import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectGraphicsTier } from "../client/src/visual-golden/components/three/three-runtime";
import { isLowCapacityDevice } from "../client/src/visual-golden/lib/institution/device-capacity";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const runtime = read("client/src/visual-golden/components/three/three-runtime.ts");
const library = read("client/src/visual-golden/components/library/Library3D.tsx");
const door = read("client/src/visual-golden/components/entry/DoorSimulation3D.tsx");
const doorCss = read("client/src/visual-golden/components/entry/DoorSimulation3D.module.css");
const entry = read("client/src/visual-golden/components/entry/SectionEntry3D.tsx");
const libraryPage = read("client/src/visual-golden/pages/LibraryPage.tsx");
const effectiveMotion = read("client/src/visual-golden/lib/institution/effective-motion.ts");

describe("bounded Three.js runtime", () => {
  it("selects conservative graphics tiers from explicit browser signals", () => {
    assert.equal(detectGraphicsTier({ hardwareConcurrency: 8, deviceMemory: 8 }), "high");
    assert.equal(detectGraphicsTier({ hardwareConcurrency: 4, deviceMemory: 4 }), "balanced");
    assert.equal(detectGraphicsTier({ hardwareConcurrency: 2, deviceMemory: 8 }), "low");
    assert.equal(detectGraphicsTier({ hardwareConcurrency: 8, deviceMemory: 8, reducedMotion: true }), "low");
  });

  it("owns one gated scheduler plus visibility, intersection, context, and cleanup", () => {
    assert.match(runtime, /requestAnimationFrame\(this\.tick\)/);
    assert.match(runtime, /IntersectionObserver/);
    assert.match(runtime, /visibilitychange/);
    assert.match(runtime, /webglcontextlost/);
    assert.match(runtime, /webglcontextrestored/);
    assert.match(runtime, /registerDisposable/);
    assert.match(runtime, /if \(this\.stopped\) return;/);
    assert.match(runtime, /THREE\.PCFShadowMap/);
    assert.doesNotMatch(runtime, /PCFSoftShadowMap/);
    assert.match(runtime, /powerPreference: this\.graphicsTier === "low" \? "low-power" : "default"/);
  });

  it("keeps all scene-owned schedulers, renderer creation, and motion queries out of scenes", () => {
    for (const source of [library, door]) {
      assert.doesNotMatch(source, /new THREE\.WebGLRenderer/);
      assert.doesNotMatch(source, /requestAnimationFrame/);
      assert.doesNotMatch(source, /matchMedia/);
      assert.doesNotMatch(source, /PCFSoftShadowMap/);
      assert.match(source, /ThreeRuntime/);
    }
  });

  it("keeps context state authoritative and releases late partial allocations", () => {
    assert.match(runtime, /private controlledState\(\)/);
    assert.match(runtime, /if \(this\.contextLost\) return "context-lost"/);
    assert.match(runtime, /this\.setState\(this\.controlledState\(\)\)/);
    assert.match(runtime, /if \(this\.stopped\) \{[\s\S]*dispose\(\);/);
    assert.match(runtime, /this\.renderer\?\.resetState\(\)/);
    assert.match(runtime, /host\.dataset\.threeRuntimeState/);
    assert.match(runtime, /host\.dataset\.threeMotion/);
    assert.match(runtime, /host\.dataset\.threeInView/);
    assert.match(runtime, /host\.dataset\.threeCanRender/);
  });

  it("keeps the door canvas mounted beneath its DOM fallback", () => {
    const canvasHost = door.indexOf("<div ref={containerRef}");
    const fallback = door.indexOf("{webglFailed ? (", canvasHost);
    assert.ok(canvasHost >= 0);
    assert.ok(fallback > canvasHost);
    assert.match(door, /context\.registerDisposable\(\(\) => wood\.dispose\(\)\)/);
    assert.match(door, /context\.registerDisposable\(\(\) => stone\.dispose\(\)\)/);
  });

  it("uses one effective motion authority and resolves live system changes", () => {
    assert.match(effectiveMotion, /preference === "reduced"/);
    assert.match(effectiveMotion, /preference === "full"/);
    assert.match(effectiveMotion, /addEventListener\("change", update\)/);
    assert.doesNotMatch(library, /matchMedia/);
    assert.doesNotMatch(door, /matchMedia/);
  });

  it("loads the engine only for explicit immersive surfaces", () => {
    assert.match(libraryPage, /const Library3D = lazy\(/);
    assert.match(libraryPage, /import\("@\/visual-golden\/components\/library\/Library3D"\)/);
    assert.doesNotMatch(libraryPage, /import \{ Library3D \} from/);
    assert.match(entry, /const DoorSimulation3D = lazy/);
    assert.match(entry, /import\("\.\/DoorSimulation3D"\)/);
    assert.match(libraryPage, /active=\{!initialWorkId\}/);
  });

  it("keeps route content mounted and lets reduced motion bypass the decorative door", () => {
    const reducedCheck = entry.indexOf("reducedMotion ||");
    const forcedDoor = entry.indexOf('forced === "1"');
    assert.ok(reducedCheck >= 0);
    assert.ok(forcedDoor > reducedCheck);
    assert.match(entry, /className="sectionEntry3DContent"[\s\S]*\{children\}[\s\S]*\{showDoor \?/);
    assert.doesNotMatch(entry, /aria-modal="true"/);
  });

  it("keeps the URL door preference authoritative after mount", () => {
    // `?door=0` was only applied to useState before, and the mount effect
    // re-showed an unseen door over the content. The effect must re-evaluate
    // through the same preference function instead of unconditionally showing.
    assert.match(entry, /function forcedDoorPreference\(\)/);
    assert.match(entry, /if \(forced === "0"\) return false/);
    assert.match(
      entry,
      /setShowDoor\(shouldShowDoor\(active, wing, reducedMotion\)\)/,
    );
    assert.doesNotMatch(entry, /if \(!hasSeenDoor\(wing\)\) setShowDoor\(true\)/);
  });

  it("defaults the Library to the complete shelves on reduced motion or a weak device", () => {
    assert.equal(isLowCapacityDevice({ hardwareConcurrency: 2 }), true);
    assert.equal(isLowCapacityDevice({ deviceMemory: 1 }), true);
    assert.equal(isLowCapacityDevice({ saveData: true }), true);
    assert.equal(
      isLowCapacityDevice({ hardwareConcurrency: 8, deviceMemory: 8 }),
      false,
    );
    assert.match(libraryPage, /useEffectiveMotion\(\)/);
    assert.match(libraryPage, /isLowCapacityDevice\(/);
    assert.match(
      libraryPage,
      /motion === "reduced" \|\| lowCapacity \? "shelves" : "library3d"/,
    );
    assert.match(libraryPage, /labels\.auto2d/);
    assert.match(libraryPage, /viewChoice === "auto" \? autoView : viewChoice/);
    assert.match(libraryPage, /الرفوف والبحث يعملان دونه/);
  });

  it("declares the 3D threshold decorative in visible copy", () => {
    assert.match(door, /المشهد ثلاثي الأبعاد زخرفي/);
    assert.match(door, /The 3D threshold is decorative/);
    assert.match(doorCss, /\.decorativeNote/);
    assert.match(door, /not required to reach the wing's content/);
  });
});
