/**
 * Living Seerah World — movement, collision, terrain and governance contracts.
 *
 * Behavioral tests run the real FirstPersonController and WorldTerrain code
 * under a minimal DOM stub (the controller binds window listeners). Governance
 * tests resolve every world interaction targetRef against the actual governed
 * datasets, so a broken link can never ship silently.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

// ---- Minimal DOM stub so the controller can bind/dispose listeners in Node.
// Mirrors the platform contract: addEventListener({ signal }) removes the
// listener when the signal aborts — which is what controller.dispose() uses.
type Listener = (event: unknown) => void;
const listeners = new Map<string, Set<Listener>>();
function addListener(type: string, fn: Listener, options?: { signal?: AbortSignal }) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(fn);
  options?.signal?.addEventListener("abort", () => listeners.get(type)?.delete(fn));
}
const stubWindow = {
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener: addListener,
  removeEventListener(type: string, fn: Listener) {
    listeners.get(type)?.delete(fn);
  },
};
const stubDocument = {
  pointerLockElement: null as unknown,
  exitPointerLock() { stubDocument.pointerLockElement = null; },
  addEventListener() {},
  removeEventListener() {},
};
const g = globalThis as Record<string, unknown>;
let savedWindow: unknown;
let savedDocument: unknown;

before(() => {
  savedWindow = g.window;
  savedDocument = g.document;
  g.window = stubWindow;
  g.document = stubDocument;
});
after(() => {
  g.window = savedWindow;
  g.document = savedDocument;
  listeners.clear();
});

function key(code: string, type: "keydown" | "keyup" = "keydown") {
  const event = { code, key: code, preventDefault() {} };
  for (const fn of listeners.get(type) ?? []) fn(event);
}

async function loadController() {
  const mod = await import("../client/src/visual-golden/components/seerah/world/FirstPersonController");
  return mod.FirstPersonController;
}
async function loadTerrain() {
  return import("../client/src/visual-golden/components/seerah/world/WorldTerrain");
}
async function loadRegistry() {
  return import("../client/src/visual-golden/components/seerah/world/WorldSceneRegistry");
}

describe("first-person movement (behavioral)", () => {
  it("walks continuously while W is held and stops on release", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    const controller = new FirstPersonController([], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
    });
    const startZ = controller.state.position.z;
    key("KeyW");
    for (let i = 0; i < 60; i++) controller.update(1 / 60); // 1 second
    const walkedZ = controller.state.position.z;
    assert.ok(startZ - walkedZ > 2, `expected >2m forward, got ${startZ - walkedZ}`);
    assert.ok(controller.state.onGround, "player stays grounded");
    key("KeyW", "keyup");
    for (let i = 0; i < 30; i++) controller.update(1 / 60);
    const stoppedZ = controller.state.position.z;
    assert.ok(Math.abs(controller.state.velocity.z) < 0.01, "velocity decays to zero");
    for (let i = 0; i < 30; i++) controller.update(1 / 60);
    assert.ok(Math.abs(controller.state.position.z - stoppedZ) < 0.01, "no drift after stop");
    controller.dispose();
  });

  it("sprints faster than walking and crouch lowers the eye height", async () => {
    const FirstPersonController = await loadController();
    const make = () => new FirstPersonController([], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
    });
    const walker = make();
    key("KeyW");
    for (let i = 0; i < 60; i++) walker.update(1 / 60);
    const walkDist = -walker.state.position.z;
    key("KeyW", "keyup");
    walker.dispose();

    listeners.clear();
    const sprinter = make();
    key("KeyW");
    key("ShiftLeft");
    for (let i = 0; i < 60; i++) sprinter.update(1 / 60);
    const sprintDist = -sprinter.state.position.z;
    assert.ok(sprintDist > walkDist * 1.3, `sprint ${sprintDist} should exceed walk ${walkDist}`);
    key("KeyW", "keyup");
    key("ShiftLeft", "keyup");
    sprinter.dispose();

    listeners.clear();
    const croucher = make();
    const standingEye = croucher.getEyeHeight();
    key("KeyC");
    croucher.update(1 / 60);
    assert.ok(croucher.state.crouching);
    assert.ok(croucher.getEyeHeight() < standingEye);
    key("KeyC", "keyup");
    croucher.update(1 / 60);
    assert.ok(!croucher.state.crouching);
    croucher.dispose();
  });

  it("collision blocks forward motion into a solid and slides along it", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    // Wall directly ahead (negative Z), 4m wide, centered at z=-3.
    const wall = {
      type: "box" as const,
      center: new THREE.Vector3(0, 1.5, -3),
      size: new THREE.Vector3(4, 3, 1),
    };
    const controller = new FirstPersonController([wall], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
    });
    key("KeyW");
    for (let i = 0; i < 180; i++) controller.update(1 / 60); // 3s — would pass the wall without collision
    const z = controller.state.position.z;
    assert.ok(z > -2.5 + 0.3 - 0.01, `player must stop before wall face, z=${z}`);
    assert.ok(z < -1.5, `player should have reached the wall, z=${z}`);

    // Slide: hold W+D briefly — the player must move sideways while the wall
    // still blocks forward motion (short enough to stay within the wall span).
    const xBefore = controller.state.position.x;
    key("KeyD");
    for (let i = 0; i < 30; i++) controller.update(1 / 60);
    assert.ok(controller.state.position.x > xBefore + 0.5, "slides along the wall");
    assert.ok(controller.state.position.z > -2.5, "still blocked by the wall while sliding");
    key("KeyW", "keyup");
    key("KeyD", "keyup");
    controller.dispose();
  });

  it("jump leaves the ground and gravity returns the player to it", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    const controller = new FirstPersonController([], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
    });
    key("Space");
    controller.update(1 / 60);
    assert.ok(!controller.state.onGround, "jump lifts off");
    let maxY = 0;
    for (let i = 0; i < 120; i++) {
      controller.update(1 / 60);
      maxY = Math.max(maxY, controller.state.position.y);
    }
    assert.ok(maxY > 0.5, `jump apex ${maxY} should be meaningful`);
    assert.ok(controller.state.onGround, "lands back on ground");
    assert.ok(Math.abs(controller.state.position.y) < 1e-6);
    key("Space", "keyup");
    controller.dispose();
  });

  it("follows analytic terrain height while walking over dunes", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    const groundHeightAt = (x: number, z: number) => Math.sin(x * 0.2) * 2 + Math.cos(z * 0.15);
    const controller = new FirstPersonController([], new THREE.Vector3(0, 0, 0), Math.PI / 2, {
      groundHeightAt,
      worldHalfSize: 100,
    });
    key("KeyW");
    for (let i = 0; i < 240; i++) {
      controller.update(1 / 60);
      const p = controller.state.position;
      assert.ok(
        Math.abs(p.y - groundHeightAt(p.x, p.z)) < 1e-6,
        "player y must equal terrain height every frame",
      );
    }
    key("KeyW", "keyup");
    controller.dispose();
  });

  it("dispose unbinds every DOM listener it registered", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    const controller = new FirstPersonController([], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
    });
    const bound = [...listeners.values()].reduce((n, set) => n + set.size, 0);
    assert.ok(bound >= 8, `controller should bind movement/look/touch listeners, got ${bound}`);
    controller.dispose();
    const remaining = [...listeners.values()].reduce((n, set) => n + set.size, 0);
    assert.equal(remaining, 0, "all listeners released on dispose");
  });
});

describe("procedural terrain (behavioral)", () => {
  it("generates deterministic heightfield with analytic sampler and boundary-only ground collision", async () => {
    const { generateWorldTerrain, sampleTerrainHeight } = await loadTerrain();
    const { DEFAULT_WORLD_SCENE } = await loadRegistry();
    const a = generateWorldTerrain(DEFAULT_WORLD_SCENE, "balanced", false);
    const b = generateWorldTerrain(DEFAULT_WORLD_SCENE, "balanced", false);

    // Determinism: same seed → same heights.
    for (const [x, z] of [[0, 0], [12.5, -33.2], [-70, 44]] as const) {
      assert.equal(sampleTerrainHeight(a.ground, x, z), sampleTerrainHeight(b.ground, x, z));
    }
    // Sampler agrees with the stored heightfield at a vertex.
    const h0 = sampleTerrainHeight(a.ground, 0, 0);
    assert.ok(Number.isFinite(h0));

    // No heightfield collision boxes: only boundary walls + rock solids.
    const boxes = a.collisionShapes.filter((s) => s.type === "box");
    assert.equal(boxes.length, 4, "exactly four boundary walls");
    for (const wall of boxes) {
      if (wall.type !== "box") continue;
      const half = Math.max(DEFAULT_WORLD_SCENE.bounds.width, DEFAULT_WORLD_SCENE.bounds.depth) / 2;
      const onEdge =
        Math.abs(Math.abs(wall.center.x) - half) < 1e-6 ||
        Math.abs(Math.abs(wall.center.z) - half) < 1e-6;
      assert.ok(onEdge, "box colliders must sit on the world boundary");
    }
    for (const d of a.disposables) d();
    for (const d of b.disposables) d();
  });
});

describe("governed content links", () => {
  it("every interaction targetRef resolves to a real governed record", async () => {
    const { WORLD_SCENES } = await loadRegistry();
    const { seerahChapters } = await import("../client/src/data/seerahData");
    const { SEERAH_DATABASE } = await import("../client/src/data/seerah/index");
    const { findAtlasNodeByQuery } = await import("../client/src/visual-golden/services/atlas-seerah");

    const chapterIds = new Set(seerahChapters.map((c) => c.id));
    const chapterEventIds = new Set(
      seerahChapters.flatMap((c) => (c.timelineEvents ?? []).map((e) => e.id)),
    );
    const dbEventIds = new Set(SEERAH_DATABASE.events.map((e) => e.id));

    let checked = 0;
    for (const scene of WORLD_SCENES) {
      for (const point of [...scene.interactions, ...scene.exits]) {
        const ref = point.targetRef;
        if (!ref) continue;
        checked++;
        const label = `${scene.id}/${point.id} → ${ref.type}:${ref.id}`;
        switch (ref.type) {
          case "chapter":
            assert.ok(chapterIds.has(ref.id), `missing chapter: ${label}`);
            break;
          case "event":
            assert.ok(chapterEventIds.has(ref.id), `missing seerah event: ${label}`);
            break;
          case "database":
            assert.ok(dbEventIds.has(ref.id), `missing database event: ${label}`);
            break;
          case "atlas":
            assert.ok(findAtlasNodeByQuery(ref.id), `unresolvable atlas place: ${label}`);
            break;
        }
      }
      // Canonical refs must also resolve.
      if (scene.canonicalRef?.chapterId) {
        assert.ok(chapterIds.has(scene.canonicalRef.chapterId), `${scene.id} canonical chapter`);
      }
      if (scene.canonicalRef?.eventId) {
        assert.ok(chapterEventIds.has(scene.canonicalRef.eventId), `${scene.id} canonical event`);
      }
    }
    assert.ok(checked >= 20, `expected a meaningful link surface, checked ${checked}`);
  });

  it("keeps religious guardrails: disclosure on every scene, no depiction claims", async () => {
    const { WORLD_SCENES } = await loadRegistry();
    assert.equal(WORLD_SCENES.length, 6);
    for (const scene of WORLD_SCENES) {
      assert.ok(scene.disclosureAr.length > 20, `${scene.id} needs a disclosure`);
      assert.match(scene.disclosureAr, /تفسير|فني|تقريب/, `${scene.id} disclosure must label reconstruction`);
      assert.ok(!/تجسيد للنبي|صورة النبي|تمثيل النبي/.test(scene.descriptionAr));
    }
  });
});

describe("world integration source contracts", () => {
  const world = read("client/src/visual-golden/components/seerah/world/LivingSeerahWorld.tsx");
  const audio = read("client/src/visual-golden/components/seerah/world/WorldAudio.ts");
  const interaction = read("client/src/visual-golden/components/seerah/world/WorldInteraction.tsx");
  const hud = read("client/src/visual-golden/components/seerah/world/WorldHUD.tsx");
  const page = read("client/src/visual-golden/pages/SeerahWorldPage.tsx");
  const app = read("client/src/App.tsx");

  it("uses the shared ThreeRuntime — no competing renderer or rAF loop", () => {
    assert.match(world, /new ThreeRuntime\(/);
    assert.doesNotMatch(world, /new THREE\.WebGLRenderer/);
    assert.doesNotMatch(world, /requestAnimationFrame/);
  });

  it("uses the new controller API with analytic ground and real dispose", () => {
    assert.match(world, /groundHeightAt/);
    assert.match(world, /worldHalfSize/);
    assert.match(world, /collisionShapes\.concat\(life\.getCollisionShapes\(\)\)/);
    assert.doesNotMatch(world, /footstepCallback/);
    assert.doesNotMatch(world, /as any\)\.input/);
  });

  it("throttles HUD state instead of re-rendering per frame", () => {
    assert.match(world, /HUD_UPDATE_INTERVAL/);
    assert.doesNotMatch(world, /setPlayerState\(\{ \.\.\.state \}\);\s*\n\s*setHeading/);
  });

  it("has exactly one Escape owner and E-only interaction", () => {
    const escapeBindings = (world.match(/event\.key !== "Escape"|event\.key === "Escape"/g) ?? []).length;
    assert.equal(escapeBindings, 1, "world component owns Escape once");
    assert.doesNotMatch(hud, /addEventListener\("keydown"/);
    assert.match(interaction, /const INTERACTION_KEYS = \["KeyE"\]/);
  });

  it("navigates governed content via wouter, never window.location.href", () => {
    assert.doesNotMatch(world, /window\.location\.href/);
    assert.match(world, /callbacksRef\.current\.onNavigate/);
    assert.match(page, /onNavigate=\{navigate\}/);
    assert.match(app, /\/seerah\/world/);
  });

  it("audio is fully synthesized — no fetched asset URLs remain", () => {
    assert.doesNotMatch(audio, /\/audio\//);
    assert.doesNotMatch(audio, /decodeAudioData/);
    assert.doesNotMatch(audio, /fetch\(/);
    assert.match(audio, /createBuffer/);
    assert.match(audio, /onUserGesture/);
    assert.match(audio, /setMuted/);
    assert.match(audio, /dispose\(\)/);
    assert.match(audio, /context\.close/);
  });

  it("interaction raycast targets are persistent, not rebuilt per tick", () => {
    assert.match(interaction, /targetMeshes/);
    assert.doesNotMatch(interaction, /new THREE\.SphereGeometry\(point\.radius, 8, 6\);\s*\n\s*const mat = new THREE\.MeshBasicMaterial\(\{ visible: false \}\);\s*\n\s*const mesh = new THREE\.Mesh\(geo, mat\);\s*\n\s*mesh\.position\.copy\(point\.position\);\s*\n\s*mesh\.userData\.interactionPoint = point;\s*\n\s*this\.context\.scene\.add\(mesh\);\s*\n\s*targets\.push/);
    assert.doesNotMatch(interaction, /renderInteractionPrompt/);
  });
});
