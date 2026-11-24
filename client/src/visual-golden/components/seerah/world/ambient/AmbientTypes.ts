/**
 * Shared contracts for the optional, anonymous environmental population.
 *
 * There are deliberately no historical-personality roles or asset mappings.
 * Every entity supports geography and daily activity; none represents the
 * Prophet ﷺ, a Prophet, a Companion, or another identified sacred figure.
 */
import type * as THREE from "three";
import type { WorldCollisionShape } from "../world-types";

export type AmbientPresetName = "market" | "camp" | "caravan" | "march";
export type AmbientBehaviorState = "idle" | "walk" | "gesture" | "work" | "rest" | "march";
export type AmbientQualityTier = "low" | "medium" | "high";
export type AmbientEntityKind = "human" | "horse" | "camel" | "sheep" | "goat" | "bird";

/** Neutral environmental purposes only. Never turn these into named roles. */
export type AmbientRole =
  | "merchant"
  | "craftsman"
  | "traveler"
  | "porter"
  | "water_carrier"
  | "shepherd"
  | "caravan_worker"
  | "infantry_unit"
  | "cavalry_unit"
  | "animal";

export interface AmbientEntityDefinition {
  /** Stable neutral id, for example ambient_merchant_001. */
  id: string;
  preset: AmbientPresetName;
  role: AmbientRole;
  kind: AmbientEntityKind;
  state: AmbientBehaviorState;
  position: [number, number];
  /** Approved route waypoints in XZ world metres. */
  waypoints: Array<[number, number]>;
  speed: number;
  scale: number;
  phase: number;
  /** Optional licensed production asset. No sacred-personality mapping. */
  asset?: {
    url: string;
    provenance: string;
    license: string;
    /** Explicit editorial check that the asset is anonymous/non-sacred. */
    anonymousReview: true;
  };
}

export interface AmbientStats {
  humans: number;
  horses: number;
  camels: number;
  otherAnimals: number;
  activeEntities: number;
  visibleEntities: number;
  animatedEntities: number;
  drawCalls: number;
  triangles: number;
  fps: number | null;
  frameTimeMs: number | null;
  activeAnimationMixers: number;
  qualityTier: AmbientQualityTier;
  assetFailures: number;
  paused: boolean;
  reducedMotion: boolean;
  activePresets: AmbientPresetName[];
  developmentFallbacks: number;
}

export interface AmbientAssetResult {
  root: THREE.Group;
  /** Optional genuine clips supplied by a licensed GLB/glTF asset. */
  animations?: THREE.AnimationClip[];
  /** Development fallbacks must never be presented as production assets. */
  developmentFallback: boolean;
}

/** Isolated optional loader. Rejections are contained by the crowd manager. */
export interface AmbientAssetLoader {
  load(definition: AmbientEntityDefinition, signal: AbortSignal): Promise<AmbientAssetResult | null>;
}

export interface AmbientUpdateContext {
  deltaSeconds: number;
  elapsedSeconds: number;
  playerPosition: THREE.Vector3;
  playerVelocity: THREE.Vector3;
}

export interface AmbientNavigationOptions {
  width: number;
  depth: number;
  cellSize?: number;
  agentRadius?: number;
  groundHeightAt: (x: number, z: number) => number;
  collisionShapes: WorldCollisionShape[];
}

export interface AmbientCrowdManagerContract {
  initialize(signal?: AbortSignal): Promise<void>;
  spawnPresetCrowd(preset: AmbientPresetName): Promise<void>;
  update(deltaSeconds: number): void;
  setQuality(tier: AmbientQualityTier): void;
  getAmbientStats(): AmbientStats;
  pause(): void;
  resume(): void;
  dispose(): void;
}
