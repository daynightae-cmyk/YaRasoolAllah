/**
 * Play-to-Enter contract — the Seerah crossroads gates and the in-place
 * camera flight into the living world.
 *
 * Source-contract tests pin the wiring (play buttons, entry flight, fallback
 * route); registry tests resolve the hijrah-road scene and its travel edges
 * against the real governed datasets, so a portal can never lead somewhere
 * invented.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const crossroads = read("client/src/visual-golden/components/seerah/SeerahPortalCrossroads.tsx");
const world = read("client/src/visual-golden/components/seerah/world/LivingSeerahWorld.tsx");

describe("crossroads Play-to-Enter wiring", () => {
  it("renders the center gate as a play button, not a bare route link", () => {
    assert.match(crossroads, /data-visual="seerah-portal-world"/);
    // The center portal must be a <button> with a click handler…
    assert.match(crossroads, /<button[\s\S]*?data-visual="seerah-portal-world"[\s\S]*?onClick=\{/);
    // …and the old plain link to the world route must be gone from the center.
    assert.doesNotMatch(crossroads, /<Link href="\/seerah\/world"/);
  });

  it("maps world portals to real registered scenes", () => {
    for (const id of ["badr-valley", "madinah-walk", "hijrah-road"]) {
      assert.ok(crossroads.includes(`sceneId: "${id}"`), `portal for ${id} must exist`);
    }
    // Page portals stay honest route links.
    for (const href of ["/atlas", "/seerah/database", "/quran", "/hadith"]) {
      assert.ok(crossroads.includes(`href: "${href}"`), `route portal ${href} must exist`);
    }
  });

  it("mounts LivingSeerahWorld in place with an entry flight and a fallback route", () => {
    assert.match(crossroads, /<LivingSeerahWorld/);
    assert.match(crossroads, /entryFlight=\{reducedMotion \? undefined : entryFlight\}/);
    assert.match(crossroads, /createPortal\(/);
    // Non-3D fallback still reaches the full world page.
    assert.match(crossroads, /\/seerah\/world\?scene=/);
    // The flight start pose is derived from the scene's own entry pose.
    assert.match(crossroads, /scene\.entryPosition/);
    assert.match(crossroads, /scene\.entryYaw/);
  });

  it("locks page scroll and restores focus to the opening portal on exit", () => {
    assert.match(crossroads, /document\.body\.style\.overflow = "hidden"/);
    assert.match(crossroads, /opener\.focus\(\{ preventScroll: true \}\)/);
  });
});

describe("LivingSeerahWorld entry flight", () => {
  it("accepts an entryFlight prop and locks input during the flight", () => {
    assert.match(world, /entryFlight\?: \{ from: THREE\.Vector3; duration\?: number \}/);
    assert.match(world, /controller\.setInputEnabled\(false\)/);
    assert.match(world, /controller\.setInputEnabled\(true\)/);
  });

  it("drives the camera along an eased path and reports flight state", () => {
    assert.match(world, /flightRef\.current/);
    assert.match(world, /lerpVectors\(flight\.from, flight\.to, e\)/);
    assert.match(world, /worldEntryFlight/);
    assert.match(world, /onEntryFlightComplete\?\.\(\)/);
  });

  it("skips the flight under reduced motion", () => {
    assert.match(world, /flightSpec && !motionRef\.current/);
    assert.match(world, /"skipped-reduced-motion"/);
  });

  it("still owns no competing animation loop", () => {
    assert.doesNotMatch(world, /requestAnimationFrame/);
    assert.doesNotMatch(world, /new THREE\.WebGLRenderer/);
  });
});

describe("hijrah-road scene (REF-13) and its travel edges", () => {
  it("registers the hijrah road with a reconstruction disclosure and governed refs", async () => {
    const { WORLD_SCENES, getWorldScene } = await import("../client/src/visual-golden/components/seerah/world/WorldSceneRegistry");
    const { seerahChapters } = await import("../client/src/data/seerahData");
    const { findAtlasNodeByQuery } = await import("../client/src/visual-golden/services/atlas-seerah");

    const scene = getWorldScene("hijrah-road");
    assert.ok(scene, "hijrah-road must be registered");
    assert.ok(scene.disclosureAr.length > 20);
    assert.match(scene.disclosureAr, /فني|تقريبي|تفسيري/, "disclosure must label the route as illustrative");
    assert.equal(scene.canonicalRef?.chapterId, "hijra-to-madinah");

    const chapterEventIds = new Set(seerahChapters.flatMap((c) => (c.timelineEvents ?? []).map((e) => e.id)));
    const eventRefs = scene.interactions
      .map((p) => p.targetRef)
      .filter((r): r is NonNullable<typeof r> => Boolean(r) && r.type === "event")
      .map((r) => r.id);
    assert.ok(eventRefs.length >= 3, "route milestones must link governed events");
    for (const id of eventRefs) assert.ok(chapterEventIds.has(id), `unknown event ${id}`);

    for (const point of [...scene.interactions, ...scene.exits]) {
      if (point.targetRef?.type === "atlas") {
        assert.ok(findAtlasNodeByQuery(point.targetRef.id), `atlas place ${point.targetRef.id} must resolve`);
      }
      if (point.targetRef?.type === "scene") {
        assert.ok(WORLD_SCENES.some((s) => s.id === point.targetRef!.id), `scene ${point.targetRef.id} must exist`);
      }
    }
  });

  it("has authored travel edges to the desert camp and Madinah, with gates", async () => {
    const travel = await import("../client/src/visual-golden/components/seerah/world/WorldTravel");
    const { WORLD_SCENES } = await import("../client/src/visual-golden/components/seerah/world/WorldSceneRegistry");

    for (const [from, to] of [
      ["desert-camp", "hijrah-road"],
      ["hijrah-road", "desert-camp"],
      ["hijrah-road", "madinah-walk"],
      ["madinah-walk", "hijrah-road"],
    ] as const) {
      const arrival = travel.resolveArrival(from, to);
      assert.ok(arrival, `missing arrival ${from}→${to}`);
      const url = travel.buildTravelUrl(from, to);
      assert.ok(url?.includes(`scene=${to}`) && url.includes(`from=${from}`), `travel url for ${from}→${to}`);
      const dest = WORLD_SCENES.find((s) => s.id === to)!;
      assert.ok(
        Math.abs(arrival.position.x) <= dest.bounds.width / 2 && Math.abs(arrival.position.z) <= dest.bounds.depth / 2,
        `arrival ${from}→${to} inside bounds`,
      );
      // The destination must expose a physical gate back along this edge.
      const gates = travel.listTravelGates();
      assert.ok(
        gates.some((g) => g.sceneId === from && g.targetSceneId === to),
        `gate ${from}→${to} must exist in the registry`,
      );
    }
  });

  it("gives the hijrah road an ambient caravan preset", async () => {
    const { AMBIENT_SCENE_PRESETS } = await import("../client/src/visual-golden/components/seerah/world/ambient/AmbientPresetRegistry");
    const presets = AMBIENT_SCENE_PRESETS["hijrah-road"] ?? [];
    assert.ok(presets.includes("caravan"), "hijrah-road should carry a caravan preset");
    for (const p of presets) {
      assert.ok(["market", "camp", "caravan", "march"].includes(p), `unknown preset ${p}`);
    }
  });
});
