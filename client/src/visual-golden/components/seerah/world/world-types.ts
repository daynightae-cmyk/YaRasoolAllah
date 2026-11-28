/**
 * Living Seerah World — Type Definitions
 *
 * Core types for the walkable 3D historical environment.
 * Separated from implementation to keep the architecture clean.
 */

import * as THREE from "three";

/** Graphics quality tiers for adaptive rendering. */
export type WorldGraphicsTier = "low" | "balanced" | "high";

/** Input mode for the first-person controller. */
export type WorldInputMode = "keyboard" | "touch" | "hybrid";

/** World lifecycle state. */
export type WorldState =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "paused"
  | "exiting"
  | "error";

/** Player movement state. */
export interface WorldPlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  yaw: number;
  pitch: number;
  onGround: boolean;
  sprinting: boolean;
  crouching: boolean;
}

/** Collision result from world collision system. */
export interface WorldCollisionResult {
  blocked: boolean;
  position: THREE.Vector3;
  normal: THREE.Vector3 | null;
  object: THREE.Object3D | null;
}

/** Audio zone definition for spatial ambience. */
export interface WorldAudioZone {
  id: string;
  bounds: THREE.Box3;
  ambienceId: string;
  fadeDistance: number;
  priority: number;
}

/** Interactive point of interest in the world. */
export interface WorldInteractionPoint {
  id: string;
  position: THREE.Vector3;
  radius: number;
  kind: "info" | "transition" | "ambience" | "narrative";
  labelAr: string;
  descriptionAr: string;
  /**
   * Canonical event/chapter link for governed content, or another scene in
   * the living world (travel gate — resolved through the travel network).
   */
  targetRef?: {
    type: "event" | "chapter" | "atlas" | "database" | "scene";
    id: string;
  };
  /** Optional custom interaction handler. */
  onInteract?: () => void;
}

/** Sections that expose an immersive surface in the institution shell. */
export type WorldStationSection =
  | "seerah"
  | "quran"
  | "hadith"
  | "sources"
  | "audio"
  | "atlas"
  | "library"
  | "noor"
  | "kids";

/**
 * A unified station in the cross-section immersion log. Every station points
 * at a REAL route (or a real scene id) — the registry never invents content.
 */
export interface WorldStation {
  id: string;
  sectionId: WorldStationSection;
  titleAr: string;
  subtitleAr: string;
  /** Deep link for surface stations; scene route for world stations. */
  href: string;
  kind: "world-scene" | "surface";
  /** Living-world scene id (only for `world-scene` stations). */
  sceneId?: string;
  /** Artistic-reconstruction disclosure for reconstructed spaces. */
  disclosureAr?: string;
}

/**
 * A static prop placed at an authored position in a scene (a well, a
 * campfire). Props are scenery — they never carry governed claims, and
 * their placement is artistic, not surveyed.
 */
export interface WorldSceneProp {
  id: string;
  type: "well" | "campfire";
  position: THREE.Vector3;
  /** Uniform scale multiplier (default 1). */
  scale?: number;
}

/** Interaction prompt for HUD display. */
export interface InteractionPrompt {
  point: WorldInteractionPoint;
  distance: number;
  /** Screen position for HUD (if using 2D overlay). */
  screenPosition?: { x: number; y: number };
}

/** Animated life entity (animal, cloth, vegetation). */
export interface WorldLifeEntity {
  id: string;
  mesh: THREE.Mesh | THREE.Group;
  animationType: "idle" | "walk" | "graze" | "sway" | "flutter" | "custom";
  animationSpeed: number;
  bounds: THREE.Box3;
  /** Distance at which animation pauses (performance). */
  cullDistance: number;
  /** Optional custom data for specific entity types. */
  customData?: Record<string, unknown>;
}

/** Particle system configuration. */
export interface WorldParticleSystemConfig {
  id: string;
  count: number;
  area: THREE.Box3;
  particleSize: number;
  color: THREE.Color | THREE.Color[];
  opacity: number;
  velocity: THREE.Vector3;
  turbulence: number;
  lifetime: number;
  spawnRate: number;
  material?: THREE.PointsMaterial;
}

/** World scene configuration. */
export interface WorldSceneConfig {
  id: string;
  nameAr: string;
  descriptionAr: string;
  /** Terrain seed for deterministic generation. */
  seed: number;
  /** Explicit terrain biome — authoritative over the colour heuristic. */
  biome?: "dunes" | "rocky-plain" | "wadi" | "oasis" | "settlement" | "mountain-pass";
  /** World bounds in meters. */
  bounds: { width: number; depth: number; height: number };
  /** Sky/atmosphere colors. */
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  /** Sun light configuration. */
  sunPosition: THREE.Vector3;
  sunColor: string;
  sunIntensity: number;
  /** Ground material base colors. */
  groundColor: string;
  groundRoughness: number;
  groundMetalness: number;
  /** Rock/accent color for horizon meshes and terrain features. */
  rockColor: string;
  /** Entry position for the player. */
  entryPosition: THREE.Vector3;
  entryYaw: number;
  /**
   * Optional authored sightline corridor: terrain and large rocks are
   * flattened/pushed aside along the entry forward axis so the first view
   * down the authored route stays open (e.g. a road scene).
   */
  vistaCorridor?: { halfWidth: number; length: number };
  /**
   * Optional wadi profile override. Badr is a broad valley; the Khandaq is a
   * narrow defensive trench. Both use the wadi biome, so the profile is
   * authored per scene instead of hard-coded in terrain generation.
   */
  wadiProfile?: { halfWidth: number; wallWidth: number; wallSlope?: number; depth?: number };
  /** Night scenes get a star field and cooler ambient contrast. */
  night?: boolean;
  /** Static scenery props (wells, campfires) at authored positions. */
  props?: WorldSceneProp[];
  /** Optional authored mountain profiles. Each peak deforms the terrain
   *  heightfield so a scene can be dominated by a real mountain (e.g. Uhud)
   *  instead of a small bump. Heights are artistic, not surveyed. */
  authoredMountains?: Array<{
    x: number;
    z: number;
    height: number;
    width: number;
    falloff?: number;
    /** Radians: direction the ridge is elongated along. */
    ridgeAngle?: number;
    /** How much the ridge is stretched along ridgeAngle (1 = round peak). */
    ridgeStretch?: number;
  }>;
  /** Optional authored settlement structures (mud-brick houses, market
   *  awnings) placed on the terrain. Artistic placement, not surveyed. */
  structures?: Array<{
    x: number;
    z: number;
    yaw?: number;
    width: number;
    height: number;
    depth: number;
    roof?: "flat" | "dome";
  }>;
  /** Exit/transition points to other worlds or pages. */
  exits: WorldInteractionPoint[];
  /** Points of interest in this world. */
  interactions: WorldInteractionPoint[];
  /** Audio zones for spatial ambience. */
  audioZones: WorldAudioZone[];
  /** Life entities to spawn. Optional explicit position overrides the anchor scatter. */
  lifeEntities: Array<Omit<WorldLifeEntity, "mesh" | "bounds"> & { position?: THREE.Vector3 }>;
  /** Particle systems. */
  particles: WorldParticleSystemConfig[];
  /** Reconstruction disclosure. */
  disclosureAr: string;
  /** Canonical chapter/event linkage. */
  canonicalRef?: {
    chapterId?: string;
    eventId?: string;
  };
}

/** Runtime context passed to world systems (mirrors ThreeRuntimeContext). */
export interface WorldRuntimeContext {
  renderer: THREE.WebGLRenderer;
  host: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  graphicsTier: WorldGraphicsTier;
  shadowsEnabled: boolean;
  signal: AbortSignal;
  invalidate(): void;
  registerDisposable(dispose: () => void): () => void;
  /** Current player state (updated by controller). */
  playerState: WorldPlayerState;
  /** Delta time in seconds. */
  deltaTime: number;
  /** Elapsed time in seconds. */
  elapsedTime: number;
}

/** Handle returned by world scene adapter. */
export interface WorldSceneHandle {
  frame(deltaSeconds: number, elapsedSeconds: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
  setMotion?(motion: "full" | "reduced"): void;
  /** Get current player state for HUD/external systems. */
  getPlayerState(): WorldPlayerState;
  /** Teleport player to a position (for transitions). */
  setPlayerPosition(position: THREE.Vector3, yaw?: number): void;
  /** Enable/disable input. */
  setInputEnabled(enabled: boolean): void;
}

/** World scene adapter interface (parallels ThreeSceneAdapter). */
export interface WorldSceneAdapter {
  build(context: WorldRuntimeContext): WorldSceneHandle | Promise<WorldSceneHandle>;
}

/** Input state for first-person controller. */
export interface WorldInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  /** Touch joystick delta for mobile. */
  touchMove?: { x: number; y: number };
  /** Touch look delta for mobile. */
  touchLook?: { x: number; y: number };
}

/** Collision shape for world objects. */
export type WorldCollisionShape =
  | { type: "box"; center: THREE.Vector3; size: THREE.Vector3; rotation?: THREE.Euler }
  | { type: "sphere"; center: THREE.Vector3; radius: number }
  | { type: "cylinder"; center: THREE.Vector3; radiusTop: number; radiusBottom: number; height: number }
  | { type: "mesh"; mesh: THREE.Mesh };

/** Asset loading result. */
export interface WorldAssetLoadResult {
  gltf: THREE.Group;
  animations: THREE.AnimationClip[];
  materials: Map<string, THREE.Material>;
  geometries: Map<string, THREE.BufferGeometry>;
}

/** Audio asset definition. */
export interface WorldAudioAsset {
  id: string;
  url: string;
  /** Loop the audio. */
  loop: boolean;
  /** Spatial (positional) or global ambience. */
  spatial: boolean;
  /** Volume multiplier. */
  volume: number;
  /** Distance model for spatial audio. */
  distanceModel?: "linear" | "inverse" | "exponential";
  /** Rolloff factor. */
  rolloffFactor?: number;
  /** Reference distance. */
  refDistance?: number;
  /** Max distance. */
  maxDistance?: number;
}