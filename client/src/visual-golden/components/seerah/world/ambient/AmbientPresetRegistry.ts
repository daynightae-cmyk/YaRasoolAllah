/** Deterministic anonymous population presets. No named participants, unit
 * counts, sacred routes, or re-enacted events are claimed by these layouts. */
import type { WorldSceneConfig } from "../world-types";
import type {
  AmbientBehaviorState,
  AmbientEntityDefinition,
  AmbientEntityKind,
  AmbientPresetName,
  AmbientQualityTier,
  AmbientRole,
} from "./AmbientTypes";

export const AMBIENT_SCENE_PRESETS: Record<string, AmbientPresetName[]> = {
  "desert-camp": ["camp", "caravan"],
  "madinah-walk": ["market", "caravan"],
  "badr-valley": ["march", "caravan"],
  "uhud-mountain": ["march"],
  "khandaq-trench": ["march", "camp"],
  // Hira receives only a distant, generic travelling route; nothing enacts
  // revelation or assigns an identity to anyone near the cave.
  "hira-cave": ["caravan"],
};

const DENSITY = {
  low: { market: 6, camp: 5, caravan: 5, march: 10 },
  medium: { market: 11, camp: 9, caravan: 8, march: 18 },
  high: { market: 17, camp: 14, caravan: 12, march: 28 },
} as const;

function random(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function definition(
  preset: AmbientPresetName,
  kind: AmbientEntityKind,
  role: AmbientRole,
  state: AmbientBehaviorState,
  index: number,
  position: [number, number],
  waypoints: Array<[number, number]>,
  phase: number,
  speed = 1,
): AmbientEntityDefinition {
  const serial = String(index + 1).padStart(3, "0");
  const prefix = role === "infantry_unit" || role === "cavalry_unit" ? "army" : "ambient";
  return {
    id: `${prefix}_${role === "animal" ? kind : role}_${preset}_${serial}`,
    preset,
    role,
    kind,
    state,
    position,
    waypoints,
    speed: speed * (0.88 + (phase % 0.17)),
    scale: 0.92 + (phase % 0.14),
    phase: phase * Math.PI * 2,
  };
}

function market(count: number, rng: () => number, sceneId: string): AmbientEntityDefinition[] {
  const result: AmbientEntityDefinition[] = [];
  const roles: Array<{ role: AmbientRole; state: AmbientBehaviorState }> = [
    { role: "merchant", state: "gesture" },
    { role: "craftsman", state: "work" },
    { role: "porter", state: "walk" },
    { role: "traveler", state: "walk" },
    { role: "water_carrier", state: "walk" },
  ];
  const cx = sceneId === "madinah-walk" ? -2 : 0;
  const cz = sceneId === "madinah-walk" ? 6 : 12;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 7 + (i % 3) * 3;
    const x = cx + Math.cos(angle) * radius;
    const z = cz + Math.sin(angle) * radius;
    const role = roles[i % roles.length];
    const stationary = role.state === "work" || role.state === "gesture";
    result.push(definition("market", "human", role.role, role.state, i, [x, z], stationary ? [] : [
      [x, z],
      [cx + Math.cos(angle + 1.4) * radius, cz + Math.sin(angle + 1.4) * radius],
      [cx + Math.cos(angle + 2.8) * (radius + 2), cz + Math.sin(angle + 2.8) * (radius + 2)],
    ], rng(), role.role === "porter" ? 0.82 : 0.68));
  }
  const packAnimals = Math.max(1, Math.floor(count / 5));
  for (let i = 0; i < packAnimals; i++) {
    const kind: AmbientEntityKind = i % 2 === 0 ? "camel" : "horse";
    result.push(definition("market", kind, "animal", "idle", count + i,
      [cx + 15 + i * 3, cz - 8], [], rng(), 0.45));
  }
  return result;
}

function camp(count: number, rng: () => number): AmbientEntityDefinition[] {
  const result: AmbientEntityDefinition[] = [];
  for (let i = 0; i < count; i++) {
    const role: AmbientRole = i % 5 === 0 ? "water_carrier" : i % 4 === 0 ? "shepherd" : "caravan_worker";
    const state: AmbientBehaviorState = role === "water_carrier" ? "walk" : i % 3 === 0 ? "rest" : i % 3 === 1 ? "work" : "idle";
    const angle = (i / count) * Math.PI * 2;
    const radius = 8 + (i % 4) * 2;
    const x = 5 + Math.cos(angle) * radius;
    const z = 12 + Math.sin(angle) * radius;
    result.push(definition("camp", "human", role, state, i, [x, z], state === "walk" ? [
      [x, z], [12, 8], [4, 2], [-4, 14],
    ] : [], rng(), 0.62));
  }
  const animals = Math.max(2, Math.floor(count / 3));
  for (let i = 0; i < animals; i++) {
    const kind: AmbientEntityKind = i % 3 === 0 ? "goat" : i % 3 === 1 ? "sheep" : "camel";
    const x = -13 - (i % 3) * 3;
    const z = 5 + Math.floor(i / 3) * 4;
    result.push(definition("camp", kind, "animal", kind === "camel" ? "rest" : "walk", count + i,
      [x, z], kind === "camel" ? [] : [[x, z], [x - 5, z + 3], [x + 2, z + 6]], rng(), 0.34));
  }
  const birds = Math.max(1, Math.floor(count / 5));
  for (let i = 0; i < birds; i++) {
    const offset = i * 5;
    result.push(definition("camp", "bird", "animal", "walk", count + animals + i,
      [-8 + offset, 18], [[-8 + offset, 18], [8 + offset, 4], [18 - offset, -10], [-12, -2], [-8 + offset, 18]],
      rng(), 1.15));
  }
  return result;
}

function caravan(count: number, rng: () => number, sceneId: string): AmbientEntityDefinition[] {
  const result: AmbientEntityDefinition[] = [];
  const distant = sceneId === "hira-cave";
  const route: Array<[number, number]> = distant
    ? [[42, 48], [48, 20], [43, -12], [50, -42], [42, 48]]
    : [[24, 52], [20, 28], [25, 2], [18, -26], [24, -52], [30, -24], [28, 8], [24, 52]];
  const humans = Math.max(2, Math.ceil(count * 0.55));
  for (let i = 0; i < count; i++) {
    const human = i < humans;
    const role: AmbientRole = human ? (i % 3 === 0 ? "porter" : "caravan_worker") : "animal";
    const start = route[i % (route.length - 1)];
    const offset = (i % 3 - 1) * 2.2;
    result.push(definition("caravan", human ? "human" : "camel", role, "walk", i,
      [start[0] + offset, start[1] + Math.floor(i / route.length) * 3],
      route.map(([x, z]) => [x + offset, z] as [number, number]), rng(), human ? 0.72 : 0.62));
  }
  return result;
}

function march(count: number, rng: () => number, sceneId: string): AmbientEntityDefinition[] {
  const result: AmbientEntityDefinition[] = [];
  const baseZ = sceneId === "khandaq-trench" ? -32 : -40;
  for (let i = 0; i < count; i++) {
    const cavalry = i > 0 && i % 9 === 0;
    const column = i % 7;
    const row = Math.floor(i / 7);
    const x = -27 + column * 8 + (row % 2) * 1.2;
    const z = baseZ - row * 5;
    const route: Array<[number, number]> = [[x, z], [x + 7, z + 18], [x + 12, z + 27], [x, z]];
    if (cavalry) {
      result.push(definition("march", "horse", "cavalry_unit", "march", i, [x, z], route, rng(), 0.95));
    } else {
      result.push(definition("march", "human", "infantry_unit", "march", i, [x, z], route, rng(), 0.66));
    }
  }
  return result;
}

export function createAmbientPresetDefinitions(
  scene: WorldSceneConfig,
  preset: AmbientPresetName,
  quality: AmbientQualityTier,
): AmbientEntityDefinition[] {
  const rng = random(scene.seed + preset.length * 7919 + DENSITY[quality][preset]);
  switch (preset) {
    case "market": return market(DENSITY[quality][preset], rng, scene.id);
    case "camp": return camp(DENSITY[quality][preset], rng);
    case "caravan": return caravan(DENSITY[quality][preset], rng, scene.id);
    case "march": return march(DENSITY[quality][preset], rng, scene.id);
  }
}
