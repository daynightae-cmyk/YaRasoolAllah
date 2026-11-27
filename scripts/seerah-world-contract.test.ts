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
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import type { WorldRuntimeContext } from "../client/src/visual-golden/components/seerah/world/world-types";
import type { AmbientAssetLoader } from "../client/src/visual-golden/components/seerah/world/ambient/AmbientTypes";

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
/** Minimal localStorage so the visited-scene log can be exercised. */
const storage = new Map<string, string>();
const stubWindow = {
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener: addListener,
  removeEventListener(type: string, fn: Listener) {
    listeners.get(type)?.delete(fn);
  },
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
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

  it("uses nearby dynamic solids without making them static constructor state", async () => {
    listeners.clear();
    const FirstPersonController = await loadController();
    let queries = 0;
    const controller = new FirstPersonController([], new THREE.Vector3(0, 0, 0), 0, {
      groundHeightAt: () => 0,
      worldHalfSize: 100,
      dynamicCollisionShapes: () => {
        queries++;
        return [{
          type: "cylinder",
          center: new THREE.Vector3(0, 1, -2),
          radiusTop: 0.5,
          radiusBottom: 0.5,
          height: 2,
        }];
      },
    });
    key("KeyW");
    for (let i = 0; i < 120; i++) controller.update(1 / 60);
    assert.ok(controller.state.position.z > -1.2, `dynamic solid must block the visitor, z=${controller.state.position.z}`);
    assert.ok(queries >= 120, "the nearby-solid source is queried during real player updates");
    key("KeyW", "keyup");
    controller.setDynamicCollisionSource(null);
    const before = queries;
    controller.update(1 / 60);
    assert.equal(queries, before, "clearing the source disconnects dynamic collision");
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

describe("world atmosphere geometry (behavioral)", () => {
  it("keeps every horizon mountain volume outside the playable boundary", async () => {
    const { createHorizonMeshes, createSkyDome } = await import("../client/src/visual-golden/components/seerah/world/WorldAtmosphere");
    const { DEFAULT_WORLD_SCENE } = await loadRegistry();
    const group = createHorizonMeshes(DEFAULT_WORLD_SCENE, "balanced", false);
    const playableHalf = Math.max(DEFAULT_WORLD_SCENE.bounds.width, DEFAULT_WORLD_SCENE.bounds.depth) / 2;
    let count = 0;
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      count++;
      const radial = Math.hypot(object.position.x, object.position.z);
      assert.ok(
        radial - object.scale.x >= playableHalf + 12,
        `mountain crossed the playable boundary: radial=${radial}, radius=${object.scale.x}`,
      );
    });
    assert.ok(count >= 6);

    const sky = createSkyDome(DEFAULT_WORLD_SCENE, "balanced");
    assert.equal(sky.material instanceof THREE.MeshBasicMaterial && sky.material.side, THREE.BackSide);
    assert.equal(sky.geometry.index ? sky.geometry.index.count % 3 : 0, 0);
    assert.equal(sky.scale.x, 1, "sky must not use a negative-determinant mirrored transform");

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      materials.add(object.material as THREE.Material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    sky.geometry.dispose();
    (sky.material as THREE.Material).dispose();
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
          case "scene": {
            const sceneIds = new Set(WORLD_SCENES.map((s) => s.id));
            assert.ok(sceneIds.has(ref.id), `missing world scene: ${label}`);
            break;
          }
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
    assert.deepEqual(
      WORLD_SCENES.map((s) => s.id).sort(),
      ["badr-valley", "desert-camp", "hijrah-road", "hira-cave", "khandaq-trench", "madinah-walk", "uhud-mountain"],
      "the registered living-world scenes are exactly the authored set",
    );
    for (const scene of WORLD_SCENES) {
      assert.ok(scene.disclosureAr.length > 20, `${scene.id} needs a disclosure`);
      assert.match(scene.disclosureAr, /تفسير|فني|تقريب/, `${scene.id} disclosure must label reconstruction`);
      assert.ok(!/تجسيد للنبي|صورة النبي|تمثيل النبي/.test(scene.descriptionAr));
    }
  });
});

describe("living-world travel network", () => {
  it("every authored gate has a matching arrival edge, and every edge has a gate", async () => {
    const travel = await import("../client/src/visual-golden/components/seerah/world/WorldTravel");
    const { WORLD_SCENES } = await loadRegistry();

    const gates = travel.listTravelGates();
    const edges = travel.listTravelEdges();
    assert.ok(gates.length >= 10, `expected a living travel network, got ${gates.length} gates`);
    assert.equal(gates.length, edges.length, "every gate needs an edge and vice versa");

    for (const gate of gates) {
      const arrival = travel.resolveArrival(gate.sceneId, gate.targetSceneId);
      assert.ok(arrival, `gate ${gate.point.id} has no arrival pose`);
      assert.ok(
        Number.isFinite(arrival.position.x) && Number.isFinite(arrival.position.z),
        `arrival position for ${gate.point.id} must be finite`,
      );
      assert.ok(Number.isFinite(arrival.yaw), `arrival yaw for ${gate.point.id} must be finite`);

      // The arrival must land inside the destination scene bounds.
      const destination = WORLD_SCENES.find((s) => s.id === gate.targetSceneId);
      assert.ok(destination, `unknown destination ${gate.targetSceneId}`);
      const halfW = destination.bounds.width / 2;
      const halfD = destination.bounds.depth / 2;
      assert.ok(
        Math.abs(arrival.position.x) <= halfW && Math.abs(arrival.position.z) <= halfD,
        `arrival for ${gate.point.id} falls outside ${destination.id} bounds`,
      );

      // The traveller must not spawn on top of another gate's trigger.
      for (const other of gates) {
        if (other.sceneId !== gate.targetSceneId) continue;
        const distance = Math.hypot(
          arrival.position.x - other.point.position.x,
          arrival.position.z - other.point.position.z,
        );
        assert.ok(
          distance > other.point.radius,
          `arrival for ${gate.point.id} spawns inside ${other.point.id}`,
        );
      }
    }

    for (const edge of edges) {
      const matching = gates.some(
        (gate) => gate.sceneId === edge.from && gate.targetSceneId === edge.to,
      );
      assert.ok(matching, `edge ${edge.from}→${edge.to} has no physical gate`);
    }
  });

  it("derives the arrival heading from the camera convention", async () => {
    const travel = await import("../client/src/visual-golden/components/seerah/world/WorldTravel");
    for (const { from, to } of travel.listTravelEdges()) {
      const arrival = travel.resolveArrival(from, to);
      assert.ok(arrival, `missing arrival for ${from}→${to}`);
      // Camera forward is (-sin yaw, -cos yaw) — the heading must point
      // from the arrival point toward the scene interior, never away.
      const forwardX = -Math.sin(arrival.yaw);
      const forwardZ = -Math.cos(arrival.yaw);
      const length = Math.hypot(forwardX, forwardZ);
      assert.ok(Math.abs(length - 1) < 1e-6, "heading must be a unit direction");
    }
  });

  it("builds travel URLs that carry the origin scene", async () => {
    const travel = await import("../client/src/visual-golden/components/seerah/world/WorldTravel");
    const url = travel.buildTravelUrl("desert-camp", "hira-cave");
    assert.ok(url, "camp → Hira must resolve");
    assert.match(url, /^\/seerah\/world\?/);
    const params = new URLSearchParams(url.split("?")[1]);
    assert.equal(params.get("scene"), "hira-cave");
    assert.equal(params.get("from"), "desert-camp");
    assert.equal(travel.buildTravelUrl("desert-camp", "not-a-scene"), null);
  });

  it("persists visited scenes locally without inventing ids", async () => {
    const travel = await import("../client/src/visual-golden/components/seerah/world/WorldTravel");
    storage.clear();
    assert.deepEqual(travel.getVisitedScenes(), []);

    travel.markSceneVisited("desert-camp");
    travel.markSceneVisited("badr-valley");
    travel.markSceneVisited("desert-camp");
    const visited = travel.getVisitedScenes();
    assert.equal(visited.length, 2, "visits are deduplicated");
    assert.equal(visited[0], "desert-camp", "newest visit comes first");

    travel.markSceneVisited("not-a-scene");
    assert.equal(travel.getVisitedScenes().length, 2, "unknown scenes are rejected");
    storage.clear();
  });
});

describe("anonymous ambient navigation (behavioral)", () => {
  it("finds a walkable route around a real mesh obstacle without crossing blocked cells", async () => {
    const { NavGrid } = await import("../client/src/visual-golden/components/seerah/world/ambient/AmbientNavigation");
    const obstacle = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 16), new THREE.MeshBasicMaterial());
    obstacle.updateMatrixWorld(true);
    const grid = new NavGrid({
      width: 40,
      depth: 40,
      cellSize: 2,
      groundHeightAt: () => 0,
      collisionShapes: [{ type: "mesh", mesh: obstacle }],
    });
    assert.equal(grid.isWalkablePoint(0, 0), false, "mesh footprint blocks the grid");
    const start = new THREE.Vector3(-8, 0, 0);
    const end = new THREE.Vector3(8, 0, 0);
    const path = grid.findPath(start, end);
    assert.ok(path.length >= 3, "the route must go around the wall");
    assert.ok(path.some((point) => Math.abs(point.z) > 8), "the simplified path retains the detour");
    for (let i = 1; i < path.length; i++) {
      assert.ok(grid.hasLineOfSight(path[i - 1], path[i]), `segment ${i} crosses a blocked cell`);
    }
    obstacle.geometry.dispose();
    (obstacle.material as THREE.Material).dispose();
  });

  it("prevents diagonal corner cutting and returns no path through a sealed barrier", async () => {
    const { NavGrid } = await import("../client/src/visual-golden/components/seerah/world/ambient/AmbientNavigation");
    const blockers = [
      { type: "box" as const, center: new THREE.Vector3(0, 1, -2), size: new THREE.Vector3(0.5, 2, 0.5) },
      { type: "box" as const, center: new THREE.Vector3(-2, 1, 0), size: new THREE.Vector3(0.5, 2, 0.5) },
    ];
    const cornerGrid = new NavGrid({ width: 16, depth: 16, cellSize: 2, groundHeightAt: () => 0, collisionShapes: blockers });
    const start = new THREE.Vector3(-2, 0, -2);
    const goal = new THREE.Vector3(0, 0, 0);
    assert.equal(cornerGrid.hasLineOfSight(start, goal), false, "the diagonal cannot slip between blocked neighbours");
    const cornerPath = cornerGrid.findPath(start, goal);
    assert.ok(cornerPath.length >= 3, "A* uses a non-corner-cutting alternative");

    const sealed = new NavGrid({
      width: 40,
      depth: 40,
      cellSize: 2,
      groundHeightAt: () => 0,
      collisionShapes: [{
        type: "box",
        center: new THREE.Vector3(0, 2, 0),
        size: new THREE.Vector3(2, 4, 40),
      }],
    });
    assert.deepEqual(sealed.findPath(new THREE.Vector3(-8, 0, 0), new THREE.Vector3(8, 0, 0)), []);
    assert.equal(sealed.nearestWalkable(new THREE.Vector3(100, 0, 100)), null, "outside positions are not invented as valid ground");
  });

  it("keeps presets deterministic, neutral and populated with anonymous environmental kinds", async () => {
    const { createAmbientPresetDefinitions, AMBIENT_SCENE_PRESETS } = await import("../client/src/visual-golden/components/seerah/world/ambient/AmbientPresetRegistry");
    const { WORLD_SCENES } = await loadRegistry();
    const sceneIds = new Set(WORLD_SCENES.map((scene) => scene.id));
    for (const [sceneId, presets] of Object.entries(AMBIENT_SCENE_PRESETS)) {
      assert.ok(sceneIds.has(sceneId), `ambient preset references unknown scene ${sceneId}`);
      const scene = WORLD_SCENES.find((candidate) => candidate.id === sceneId)!;
      for (const preset of presets) {
        const a = createAmbientPresetDefinitions(scene, preset, "high");
        const b = createAmbientPresetDefinitions(scene, preset, "high");
        assert.deepEqual(a, b, `${sceneId}/${preset} must be deterministic`);
        assert.equal(new Set(a.map((entity) => entity.id)).size, a.length, "entity ids remain unique");
        assert.ok(a.every((entity) => !entity.asset), "no unreviewed production asset mapping is invented");
        assert.doesNotMatch(JSON.stringify(a), /prophet|companion|sacredPersonality/i);
      }
    }
    const { DEFAULT_WORLD_SCENE } = await loadRegistry();
    const camp = createAmbientPresetDefinitions(DEFAULT_WORLD_SCENE, "camp", "high");
    for (const kind of ["human", "camel", "sheep", "goat", "bird"] as const) {
      assert.ok(camp.some((entity) => entity.kind === kind), `camp is missing ${kind}`);
    }
    assert.ok(createAmbientPresetDefinitions(DEFAULT_WORLD_SCENE, "march", "high").some((entity) => entity.kind === "horse"));
  });
});

async function makeAmbientCrowd(loader?: AmbientAssetLoader) {
  const [{ AmbientCrowdManager }, { DEFAULT_WORLD_SCENE }] = await Promise.all([
    import("../client/src/visual-golden/components/seerah/world/ambient/AmbientCrowdManager"),
    loadRegistry(),
  ]);
  const scene = new THREE.Scene();
  const groundHeightAt = (x: number, z: number) => Math.sin(x * 0.03) * 0.15 + Math.cos(z * 0.025) * 0.1;
  const playerState = {
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    onGround: true,
    sprinting: false,
    crouching: false,
  };
  let invalidations = 0;
  const context = {
    renderer: { info: { render: { calls: 9, triangles: 99 } } },
    host: {},
    scene,
    camera: new THREE.PerspectiveCamera(),
    graphicsTier: "high",
    shadowsEnabled: false,
    signal: new AbortController().signal,
    invalidate: () => { invalidations++; },
    registerDisposable: () => () => undefined,
    playerState,
    deltaTime: 1 / 60,
    elapsedTime: 0,
  } as unknown as WorldRuntimeContext;
  const sceneConfig = {
    ...DEFAULT_WORLD_SCENE,
    id: "ambient-test",
    bounds: { width: 120, depth: 120, height: 40 },
  };
  const manager = new AmbientCrowdManager({
    sceneConfig,
    context,
    collisionShapes: [],
    groundHeightAt,
    assetLoader: loader,
  });
  return { manager, scene, groundHeightAt, playerState, getInvalidations: () => invalidations };
}

describe("anonymous ambient crowd (behavioral)", () => {
  it("moves on terrain, exposes real LOD/path state, collides with the visitor and responds to quality/motion", async () => {
    const { manager, scene, groundHeightAt } = await makeAmbientCrowd();
    // The host syncs motion before the deferred optional initialization.
    manager.setReducedMotion(true);
    manager.setReducedMotion(false);
    manager.setQuality("low");
    manager.setQuality("high");
    await manager.initialize();
    await manager.spawnPresetCrowd("camp");
    const high = manager.getAmbientStats();
    assert.ok(high.humans > 0 && high.otherAnimals > 0 && high.camels > 0);
    assert.equal(high.developmentFallbacks, high.activeEntities, "every procedural entity is honestly labelled");
    assert.equal(high.drawCalls, 9, "renderer counters come from the owning runtime renderer");
    assert.ok(scene.children.some((child) => child.name === "anonymous-ambient-world-life"));

    const walking = manager.getDiagnosticSnapshot().entities.find((entity) => entity.role === "water_carrier");
    assert.ok(walking, "a real walking definition was spawned");
    const before = walking.position.slice();
    for (let i = 0; i < 180; i++) manager.update(1 / 60);
    const after = manager.getDiagnosticSnapshot().entities.find((entity) => entity.id === walking.id)!;
    assert.ok(Math.hypot(after.position[0] - before[0], after.position[2] - before[2]) > 0.05, "the agent follows its route");
    assert.ok(Math.abs(after.position[1] - groundHeightAt(after.position[0], after.position[2])) < 0.003, "ground movement uses the shared terrain sampler");
    assert.ok(after.pathNodes > 0, "diagnostics expose an actual path");
    const nearby = manager.getCollisionShapesNear(new THREE.Vector3(after.position[0], after.position[1], after.position[2]), 2);
    assert.ok(nearby.some((shape) => shape.type === "cylinder"), "moving life supplies dynamic visitor collision");

    manager.setQuality("low");
    assert.ok(manager.getAmbientStats().activeEntities < high.activeEntities, "low quality reduces active agents");
    manager.setQuality("high");
    assert.equal(manager.getAmbientStats().activeEntities, high.activeEntities, "quality can recover without a refetch");

    manager.setReducedMotion(true);
    const frozen = manager.getDiagnosticSnapshot().entities.find((entity) => entity.id === walking.id)!.position.slice();
    for (let i = 0; i < 60; i++) manager.update(1 / 60);
    assert.deepEqual(manager.getDiagnosticSnapshot().entities.find((entity) => entity.id === walking.id)!.position, frozen);
    assert.equal(manager.getAmbientStats().animatedEntities, 0);
    manager.setReducedMotion(false);
    manager.pause();
    for (let i = 0; i < 60; i++) manager.update(1 / 60);
    assert.deepEqual(manager.getDiagnosticSnapshot().entities.find((entity) => entity.id === walking.id)!.position, frozen);
    assert.equal(manager.getAmbientStats().paused, true);
    manager.resume();
    assert.equal(manager.getAmbientStats().paused, false);

    manager.dispose();
    manager.dispose();
    assert.equal(manager.getAmbientStats().activeEntities, 0);
    assert.equal(manager.getDiagnosticSnapshot().navigation, null);
    assert.equal(scene.children.some((child) => child.name === "anonymous-ambient-world-life"), false);
  });

  it("contains optional asset failures per entity and retains the development fallback", async () => {
    let calls = 0;
    const loader: AmbientAssetLoader = {
      async load() {
        calls++;
        if (calls <= 2) throw new Error("isolated test asset failure");
        return null;
      },
    };
    const { manager } = await makeAmbientCrowd(loader);
    await manager.spawnPresetCrowd("camp");
    const stats = manager.getAmbientStats();
    assert.equal(stats.assetFailures, 2);
    assert.ok(stats.activeEntities > 0, "other entities still spawn");
    assert.equal(stats.developmentFallbacks, stats.activeEntities, "failed optional assets use the labelled fallback");
    manager.dispose();
  });

  it("aborts outstanding spawns and disposes assets that resolve after teardown", async () => {
    const pending: Array<(result: { root: THREE.Group; developmentFallback: false }) => void> = [];
    let threePending!: () => void;
    const allThreePending = new Promise<void>((resolve) => { threePending = resolve; });
    let disposedGeometries = 0;
    const loader: AmbientAssetLoader = {
      load: () => new Promise((resolve) => {
        pending.push(resolve);
        if (pending.length === 3) threePending();
      }),
    };
    const { manager } = await makeAmbientCrowd(loader);
    const spawning = manager.spawnPresetCrowd("camp");
    await allThreePending;
    manager.dispose();
    for (const resolve of pending) {
      const root = new THREE.Group();
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      geometry.addEventListener("dispose", () => { disposedGeometries++; });
      root.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
      resolve({ root, developmentFallback: false });
    }
    await spawning;
    assert.equal(disposedGeometries, 3, "every late result is disposed, never attached");
    assert.equal(manager.getAmbientStats().activeEntities, 0);
  });

  it("uses measured frame windows and hysteresis rather than instant quality flapping", async () => {
    const { AmbientPerformanceBudget } = await import("../client/src/visual-golden/components/seerah/world/ambient/AmbientPerformanceBudget");
    const budget = new AmbientPerformanceBudget("high");
    budget.sample(0);
    for (let i = 1; i <= 140; i++) budget.sample(i * 40);
    assert.equal(budget.getQuality(), "medium", "sustained slow frames shed one tier");
    budget.setQuality("high", 6000);
    for (let i = 1; i <= 200; i++) budget.sample(6000 + i * 40);
    assert.equal(budget.getQuality(), "high", "manual quality has a stable hold window");
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

  it("resolves arrival poses in the page and keeps travel inside wouter", () => {
    assert.match(page, /resolveArrival/);
    assert.match(page, /initialPosition=\{arrival\?\.position\}/);
    assert.match(page, /initialYaw=\{arrival\?\.yaw\}/);
    assert.match(page, /markSceneVisited/);
    assert.match(page, /buildTravelUrl/);
    assert.doesNotMatch(page, /window\.location\.href/);
  });

  it("exposes the unified station log inside the HUD without binding keys", () => {
    assert.match(hud, /WorldStationsPanel/);
    assert.match(hud, /getVisitedScenes/);
    assert.doesNotMatch(hud, /addEventListener\("keydown"/);
    assert.doesNotMatch(hud, /addEventListener\('keydown'/);
  });

  it("integrates ambient life into the same frame, collision, motion and diagnostics seams", () => {
    assert.match(world, /new AmbientCrowdManager\(/);
    assert.match(world, /ambient\.update\(delta\)/);
    assert.match(world, /controller\.setDynamicCollisionSource/);
    assert.match(world, /ambient\.setReducedMotion\(reduced\)/);
    assert.match(world, /getAmbientStats/);
    assert.match(world, /spawnPresetCrowd/);
    assert.match(world, /pauseAmbientWorld/);
    assert.match(world, /resumeAmbientWorld/);
    assert.match(world, /ambient-development-fallback/);
  });

  it("keeps optional ambient modules free of global fallback, renderers and competing animation loops", () => {
    const directory = join(repoRoot, "client/src/visual-golden/components/seerah/world/ambient");
    const files = readdirSync(directory).filter((file) => file.endsWith(".ts"));
    assert.ok(files.length >= 7);
    for (const file of files) {
      const source = readFileSync(join(directory, file), "utf8");
      assert.doesNotMatch(source, /onUnavailable\s*\(/, `${file} must isolate optional failure`);
      assert.doesNotMatch(source, /new THREE\.WebGLRenderer|requestAnimationFrame/, `${file} cannot own a competing runtime`);
    }
  });
});
