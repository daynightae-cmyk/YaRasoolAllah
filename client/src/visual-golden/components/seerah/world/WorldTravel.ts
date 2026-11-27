/**
 * WorldTravel — the travel network between Living Seerah World scenes.
 *
 * The living world is a network, not a set of isolated dioramas: every
 * scene in `WorldSceneRegistry` can be reached from another scene through
 * an authored travel edge, and the traveller always lands inside a
 * governed scene with a readable orientation (position + look direction).
 *
 * Conventions:
 * - Camera forward in this project is `(-sin(yaw), -cos(yaw))`, so a yaw
 *   solved from a look-at target is `atan2(-dx, -dz)`.
 * - Arrival poses are authored as a position plus a look-at point inside
 *   the destination scene; the yaw is derived, never hand-typed.
 * - A travel edge never invents content: it only moves between scenes that
 *   already exist in the registry.
 *
 * Visited scenes persist locally so the visitor's route through the
 * seerah environments survives a reload (no account, no server state).
 */

import * as THREE from "three";
import { WORLD_SCENES } from "./WorldSceneRegistry";
import type { WorldInteractionPoint } from "./world-types";

/** Local storage key for the visitor's visited world scenes. */
export const VISITED_SCENES_KEY = "seerah.world.visited.v1";

/** A resolved arrival pose inside a destination scene. */
export interface WorldArrival {
  position: THREE.Vector3;
  yaw: number;
}

/** Authored arrival data (position + look-at point) for one edge. */
interface ArrivalSpec {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/**
 * Arrival poses per directed edge, keyed by `${from}->${to}`.
 * The look-at points are ordinary scene landmarks (camp centre, valley
 * floor, the plain below Uhud, the trench edge, the mosque yard, the
 * mountain path) — never characters and never staged events.
 *
 * Every arrival lands a few metres inside the scene's travel gate so the
 * traveller never spawns on top of an interaction trigger.
 */
export const WORLD_TRAVEL_ARRIVALS: Record<string, ArrivalSpec> = {
  "desert-camp->hira-cave": { position: [-30, 2, 26], lookAt: [12, 2, -15] },
  "hira-cave->desert-camp": { position: [-50, 2, 50], lookAt: [0, 2, 0] },
  "desert-camp->badr-valley": { position: [-54, 2, -54], lookAt: [0, 2, 0] },
  "badr-valley->desert-camp": { position: [-50, 2, -50], lookAt: [0, 2, 0] },
  "desert-camp->uhud-mountain": { position: [52, 2, -52], lookAt: [0, 2, 0] },
  "uhud-mountain->desert-camp": { position: [50, 2, -50], lookAt: [0, 2, 0] },
  "desert-camp->madinah-walk": { position: [-50, 2, 48], lookAt: [0, 2, 0] },
  "madinah-walk->desert-camp": { position: [50, 2, 50], lookAt: [0, 2, 0] },
  "madinah-walk->khandaq-trench": { position: [50, 2, -48], lookAt: [0, 2, 0] },
  "khandaq-trench->madinah-walk": { position: [-44, 2, -42], lookAt: [0, 2, 0] },
  "desert-camp->hijrah-road": { position: [0, 2, 120], lookAt: [0, 2, 0] },
  "hijrah-road->desert-camp": { position: [-30, 2, 60], lookAt: [0, 2, 0] },
  "hijrah-road->madinah-walk": { position: [-50, 2, 48], lookAt: [0, 2, 0] },
  "madinah-walk->hijrah-road": { position: [50, 2, 120], lookAt: [0, 2, 40] },
};

/** Stable id for a directed travel edge. */
export function travelEdgeId(fromSceneId: string, toSceneId: string): string {
  return `${fromSceneId}->${toSceneId}`;
}

/** True when the id belongs to a real scene in the registry. */
export function isWorldSceneId(sceneId: string): boolean {
  return WORLD_SCENES.some((scene) => scene.id === sceneId);
}

/**
 * Resolve the arrival pose for a directed edge.
 * Returns null when the edge does not exist or either scene is unknown —
 * a broken travel edge must never teleport the visitor somewhere invented.
 */
export function resolveArrival(fromSceneId: string, toSceneId: string): WorldArrival | null {
  if (!isWorldSceneId(fromSceneId) || !isWorldSceneId(toSceneId)) return null;
  const spec = WORLD_TRAVEL_ARRIVALS[travelEdgeId(fromSceneId, toSceneId)];
  if (!spec) return null;

  const position = new THREE.Vector3(...spec.position);
  const lookAt = new THREE.Vector3(...spec.lookAt);
  const dx = lookAt.x - position.x;
  const dz = lookAt.z - position.z;
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) return null;

  // Forward is (-sin(yaw), -cos(yaw)) → yaw = atan2(-dx, -dz).
  const yaw = Math.atan2(-dx, -dz);
  return { position, yaw };
}

/**
 * Build the travel URL for a directed edge.
 * `from` is carried in the query so the destination can resolve the exact
 * arrival pose after the route changes.
 */
export function buildTravelUrl(fromSceneId: string, toSceneId: string): string | null {
  if (!resolveArrival(fromSceneId, toSceneId)) return null;
  const params = new URLSearchParams();
  params.set("scene", toSceneId);
  params.set("from", fromSceneId);
  return `/seerah/world?${params.toString()}`;
}

/** Scene ids reachable from a given scene (authored edges only). */
export function getTravelTargets(sceneId: string): string[] {
  return Object.keys(WORLD_TRAVEL_ARRIVALS)
    .filter((key) => key.startsWith(`${sceneId}->`))
    .map((key) => key.slice(`${sceneId}->`.length))
    .filter((id) => isWorldSceneId(id));
}

/** All authored edges, as `{from, to}` pairs. */
export function listTravelEdges(): Array<{ from: string; to: string }> {
  return Object.keys(WORLD_TRAVEL_ARRIVALS)
    .filter((key) => isWorldSceneId(key.split("->")[0]) && isWorldSceneId(key.split("->")[1]))
    .map((key) => {
      const [from, to] = key.split("->");
      return { from, to };
    });
}

/** One authored travel gate inside a scene. */
export interface WorldTravelGate {
  /** Scene that owns the gate. */
  sceneId: string;
  /** Scene the gate leads to. */
  targetSceneId: string;
  /** The interaction point that acts as the gate. */
  point: WorldInteractionPoint;
}

/**
 * Every travel gate declared in the scene registry. The registry is the
 * single source of truth for where a gate physically stands; the travel
 * network only owns where the traveller lands.
 */
export function listTravelGates(): WorldTravelGate[] {
  const gates: WorldTravelGate[] = [];
  for (const scene of WORLD_SCENES) {
    for (const point of scene.exits) {
      const ref = point.targetRef;
      if (!ref || ref.type !== "scene") continue;
      if (!isWorldSceneId(ref.id)) continue;
      gates.push({ sceneId: scene.id, targetSceneId: ref.id, point });
    }
  }
  return gates;
}

/** True when a scene exposes at least one travel gate. */
export function hasTravelGate(sceneId: string): boolean {
  return listTravelGates().some((gate) => gate.sceneId === sceneId);
}

/** Read the visited scenes from local storage (safe in SSR / private mode). */
export function getVisitedScenes(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(VISITED_SCENES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string => typeof id === "string" && isWorldSceneId(id),
    );
  } catch {
    return [];
  }
}

/** Persist a visited scene (deduplicated, newest first). */
export function markSceneVisited(sceneId: string): string[] {
  if (!isWorldSceneId(sceneId)) return getVisitedScenes();
  const visited = [sceneId, ...getVisitedScenes().filter((id) => id !== sceneId)];
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VISITED_SCENES_KEY, JSON.stringify(visited));
    }
  } catch {
    // A failed write must never break travel — the visit is a convenience.
  }
  return visited;
}
