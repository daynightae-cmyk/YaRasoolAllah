/**
 * Optional environmental population owned by the existing ThreeRuntime frame.
 * Essential terrain/player readiness never waits for this manager.
 */
import * as THREE from "three";
import type { WorldCollisionShape, WorldRuntimeContext, WorldSceneConfig } from "../world-types";
import { AmbientEntityFactory, type AmbientVisual } from "./AmbientEntityFactory";
import { OptionalAmbientAssetLoader, disposeAmbientAsset } from "./AmbientAssetLoader";
import { AmbientSpatialIndex, NavGrid } from "./AmbientNavigation";
import { AmbientPerformanceBudget } from "./AmbientPerformanceBudget";
import { createAmbientPresetDefinitions } from "./AmbientPresetRegistry";
import type {
  AmbientAssetLoader,
  AmbientCrowdManagerContract,
  AmbientEntityDefinition,
  AmbientEntityKind,
  AmbientPresetName,
  AmbientQualityTier,
  AmbientStats,
} from "./AmbientTypes";

interface RuntimeEntity {
  definition: AmbientEntityDefinition;
  visual: AmbientVisual;
  path: THREE.Vector3[];
  pathIndex: number;
  velocity: THREE.Vector3;
  desired: THREE.Vector3;
  waitSeconds: number;
  animationPhase: number;
  enabled: boolean;
  visible: boolean;
  lod: "detail" | "mid" | "far" | "culled";
  mixer: THREE.AnimationMixer | null;
  ownedAssetRoot: THREE.Group | null;
  radius: number;
}

export interface AmbientCrowdManagerOptions {
  sceneConfig: WorldSceneConfig;
  context: WorldRuntimeContext;
  collisionShapes: WorldCollisionShape[];
  groundHeightAt: (x: number, z: number) => number;
  assetLoader?: AmbientAssetLoader;
}

const KINDS: AmbientEntityKind[] = ["human", "horse", "camel", "sheep", "goat", "bird"];

export class AmbientCrowdManager implements AmbientCrowdManagerContract {
  private readonly sceneConfig: WorldSceneConfig;
  private readonly context: WorldRuntimeContext;
  private readonly groundHeightAt: (x: number, z: number) => number;
  private readonly collisionShapes: WorldCollisionShape[];
  private readonly loader: AmbientAssetLoader;
  private readonly factory = new AmbientEntityFactory();
  private readonly root = new THREE.Group();
  private readonly spatial = new AmbientSpatialIndex(5);
  private readonly performance: AmbientPerformanceBudget;
  private appliedQuality: AmbientQualityTier;
  private readonly abort = new AbortController();
  private readonly entities: RuntimeEntity[] = [];
  private readonly farMeshes = new Map<AmbientEntityKind, THREE.InstancedMesh>();
  private readonly activePresets = new Set<AmbientPresetName>();
  private navGrid: NavGrid | null = null;
  private initialized = false;
  private disposed = false;
  private paused = false;
  private reducedMotion = false;
  private assetFailures = 0;
  private generation = 0;
  private visibleEntities = 0;
  private animatedEntities = 0;
  private farAccumulator = 0;
  private frameTimeMs: number | null = null;
  private fps: number | null = null;

  constructor(options: AmbientCrowdManagerOptions) {
    this.sceneConfig = options.sceneConfig;
    this.context = options.context;
    this.collisionShapes = options.collisionShapes;
    this.groundHeightAt = options.groundHeightAt;
    this.loader = options.assetLoader ?? new OptionalAmbientAssetLoader();
    const tier = options.context.graphicsTier;
    this.performance = new AmbientPerformanceBudget(tier === "high" ? "high" : tier === "low" ? "low" : "medium");
    this.appliedQuality = this.performance.getQuality();
    this.root.name = "anonymous-ambient-world-life";
    this.root.userData.developmentFallbacksAreNotFinalAssets = true;
  }

  async initialize(signal?: AbortSignal): Promise<void> {
    if (this.initialized || this.disposed) return;
    if (signal) {
      if (signal.aborted) this.abort.abort();
      else signal.addEventListener("abort", () => this.abort.abort(), { once: true });
    }
    this.navGrid = new NavGrid({
      width: this.sceneConfig.bounds.width,
      depth: this.sceneConfig.bounds.depth,
      cellSize: this.context.graphicsTier === "low" ? 4 : 3,
      groundHeightAt: this.groundHeightAt,
      collisionShapes: this.collisionShapes,
    });
    for (const kind of KINDS) {
      const mesh = new THREE.InstancedMesh(this.factory.getFarGeometry(kind), this.factory.farMaterial(kind), 96);
      mesh.name = `ambient-far-${kind}`;
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.farMeshes.set(kind, mesh);
      this.root.add(mesh);
    }
    this.context.scene.add(this.root);
    this.initialized = true;
  }

  /** Replace the current preset by default; initial scene presets may append. */
  async spawnPresetCrowd(preset: AmbientPresetName, options: { append?: boolean } = {}): Promise<void> {
    await this.initialize();
    if (this.disposed || this.abort.signal.aborted) return;
    const generation = ++this.generation;
    if (!options.append) this.clearEntities();
    if (!options.append) this.activePresets.clear();
    this.activePresets.add(preset);
    // Build the bounded high-density layout once, then change the active/LOD
    // subset as quality moves. A later upgrade never needs a network refetch.
    const definitions = createAmbientPresetDefinitions(this.sceneConfig, preset, "high");
    let cursor = 0;
    const workers = Array.from({ length: Math.min(3, definitions.length) }, async () => {
      while (cursor < definitions.length && !this.disposed && generation === this.generation) {
        const definition = definitions[cursor++];
        await this.spawnOne(definition, generation);
        // Yield between small bounded batches; the essential world stays live.
        if (cursor % 3 === 0) await Promise.resolve();
      }
    });
    await Promise.all(workers);
    if (!this.disposed && generation === this.generation) {
      this.applyQualityVisibility();
      this.updateLOD(0.2);
      // Async population can finish after the one reduced-motion frame.
      this.context.invalidate();
    }
  }

  private async spawnOne(definition: AmbientEntityDefinition, generation: number): Promise<void> {
    const nav = this.navGrid;
    if (!nav || this.disposed) return;
    const requested = new THREE.Vector3(definition.position[0], 0, definition.position[1]);
    const start = nav.nearestWalkable(requested);
    if (!start) {
      console.warn(`[AmbientWorld] No walkable spawn for ${definition.id}; skipped.`);
      return;
    }
    let asset = null;
    try {
      asset = await this.loader.load(definition, this.abort.signal);
    } catch (error) {
      this.assetFailures++;
      console.warn(`[AmbientWorld] Optional asset failed for ${definition.id}; using development fallback.`, error);
      // Asset failures are local to this entity and never reach onUnavailable.
      asset = null;
    }
    if (this.disposed || this.abort.signal.aborted || generation !== this.generation) {
      if (asset) disposeAmbientAsset(asset.root);
      return;
    }

    const visual = this.factory.createFallback(definition);
    let mixer: THREE.AnimationMixer | null = null;
    if (asset) {
      visual.detail.clear();
      visual.detail.add(asset.root);
      visual.developmentFallback = asset.developmentFallback;
      visual.root.userData.developmentFallback = asset.developmentFallback;
      if (asset.animations?.length) {
        mixer = new THREE.AnimationMixer(asset.root);
        for (const clip of asset.animations) mixer.clipAction(clip).play();
      }
    }
    visual.root.position.copy(start);
    if (definition.kind === "bird") visual.root.position.y += 7 + (definition.phase % 3);
    const entity: RuntimeEntity = {
      definition,
      visual,
      path: [],
      pathIndex: 0,
      velocity: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      waitSeconds: definition.phase % 1.4,
      animationPhase: definition.phase,
      enabled: true,
      visible: false,
      lod: "culled",
      mixer,
      ownedAssetRoot: asset?.root ?? null,
      radius: definition.kind === "human" ? 0.34 : definition.kind === "bird" ? 0.1 : definition.kind === "sheep" || definition.kind === "goat" ? 0.32 : 0.72,
    };
    this.entities.push(entity);
    this.root.add(visual.root);
    this.planNextPath(entity, 1);
    this.applyQualityVisibility();
  }

  private planNextPath(entity: RuntimeEntity, waypointIndex?: number): void {
    if (!this.navGrid || entity.definition.waypoints.length < 2) { entity.path = []; return; }
    const waypoints = entity.definition.waypoints;
    const index = waypointIndex ?? ((entity.pathIndex + 1) % waypoints.length);
    const targetXZ = waypoints[index];
    const target = new THREE.Vector3(targetXZ[0], 0, targetXZ[1]);
    entity.path = this.navGrid.findPath(entity.visual.root.position, target);
    entity.pathIndex = index;
    if (!entity.path.length) entity.waitSeconds = 1.5 + (entity.animationPhase % 1.5);
  }

  update(deltaSeconds: number): void {
    if (this.disposed || !this.initialized) return;
    const perf = this.performance.sample();
    this.frameTimeMs = perf.frameTimeMs;
    this.fps = perf.fps;
    if (perf.quality !== this.appliedQuality) this.applyQualityVisibility();
    if (this.paused || this.reducedMotion || deltaSeconds <= 0) {
      this.animatedEntities = 0;
      this.updateLOD(deltaSeconds);
      return;
    }
    const dt = Math.min(deltaSeconds, 0.05);
    const player = this.context.playerState.position;
    const playerVelocity = this.context.playerState.velocity;
    this.spatial.clear();
    for (const entity of this.entities) {
      if (entity.enabled) this.spatial.insert({ id: entity.definition.id, position: entity.visual.root.position, radius: entity.radius });
    }

    this.animatedEntities = 0;
    for (const entity of this.entities) {
      if (!entity.enabled) continue;
      const { definition, visual } = entity;
      const moving = definition.state === "walk" || definition.state === "march";
      if (moving) this.updateMovement(entity, dt, player, playerVelocity);
      else entity.velocity.multiplyScalar(Math.max(0, 1 - dt * 8));

      entity.animationPhase += dt * (definition.state === "march" ? 5 : 3.2);
      entity.mixer?.update(dt);
      const distance = visual.root.position.distanceTo(player);
      const detailDistance = this.performance.getQuality() === "high" ? 30 : this.performance.getQuality() === "medium" ? 22 : 15;
      if (distance <= detailDistance) {
        this.animateDetail(entity);
        this.animatedEntities++;
      }
      if (definition.kind === "bird") {
        visual.root.position.y = this.groundHeightAt(visual.root.position.x, visual.root.position.z) + 7 + Math.sin(entity.animationPhase * 0.35) * 0.6;
      }
    }
    this.updateLOD(dt);
  }

  private updateMovement(entity: RuntimeEntity, dt: number, player: THREE.Vector3, playerVelocity: THREE.Vector3): void {
    const { definition, visual } = entity;
    if (entity.waitSeconds > 0) {
      entity.waitSeconds -= dt;
      entity.velocity.multiplyScalar(Math.max(0, 1 - dt * 6));
      return;
    }
    if (!entity.path.length && definition.waypoints.length > 1) {
      this.planNextPath(entity);
      return;
    }
    const target = entity.path[0];
    if (!target) return;
    const dx = target.x - visual.root.position.x;
    const dz = target.z - visual.root.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.55) {
      visual.root.position.x = target.x;
      visual.root.position.z = target.z;
      entity.path.shift();
      if (!entity.path.length) {
        entity.waitSeconds = 0.4 + (entity.animationPhase % 1.8);
        this.planNextPath(entity);
      }
      return;
    }

    const desiredSpeed = definition.speed * (definition.state === "march" ? 1.15 : 1);
    entity.desired.set((dx / distance) * desiredSpeed, 0, (dz / distance) * desiredSpeed);
    // Bounded local avoidance using adjacent spatial-hash buckets only.
    for (const neighbor of this.spatial.query(visual.root.position, 3.5)) {
      if (neighbor.id === definition.id) continue;
      const nx = visual.root.position.x - neighbor.position.x;
      const nz = visual.root.position.z - neighbor.position.z;
      const d2 = nx * nx + nz * nz;
      const safe = entity.radius + neighbor.radius + 0.45;
      if (d2 <= 1e-5 || d2 >= safe * safe) continue;
      const d = Math.sqrt(d2);
      const strength = (safe - d) / safe;
      entity.desired.x += (nx / d) * strength * desiredSpeed * 1.3;
      entity.desired.z += (nz / d) * strength * desiredSpeed * 1.3;
    }
    const predictedX = player.x + playerVelocity.x * 0.18;
    const predictedZ = player.z + playerVelocity.z * 0.18;
    const px = visual.root.position.x - predictedX;
    const pz = visual.root.position.z - predictedZ;
    const playerDistance = Math.hypot(px, pz);
    const playerSafe = entity.radius + 0.85;
    if (playerDistance > 0.001 && playerDistance < playerSafe) {
      entity.desired.x += (px / playerDistance) * desiredSpeed * 1.8;
      entity.desired.z += (pz / playerDistance) * desiredSpeed * 1.8;
    }

    const acceleration = Math.min(1, dt * 3.2);
    entity.velocity.lerp(entity.desired, acceleration);
    const maxSpeed = desiredSpeed * 1.25;
    if (entity.velocity.length() > maxSpeed) entity.velocity.setLength(maxSpeed);
    const oldX = visual.root.position.x;
    const oldZ = visual.root.position.z;
    const nextX = oldX + entity.velocity.x * dt;
    const nextZ = oldZ + entity.velocity.z * dt;
    if (this.navGrid?.isWalkablePoint(nextX, nextZ)) {
      visual.root.position.x = nextX;
      visual.root.position.z = nextZ;
    } else if (this.navGrid?.isWalkablePoint(nextX, oldZ)) {
      visual.root.position.x = nextX;
      entity.velocity.z = 0;
    } else if (this.navGrid?.isWalkablePoint(oldX, nextZ)) {
      visual.root.position.z = nextZ;
      entity.velocity.x = 0;
    } else {
      entity.velocity.set(0, 0, 0);
      entity.path = [];
      entity.waitSeconds = 0.35;
      return;
    }
    if (definition.kind !== "bird") {
      visual.root.position.y = this.groundHeightAt(visual.root.position.x, visual.root.position.z);
    }
    if (entity.velocity.lengthSq() > 0.01) {
      const targetYaw = Math.atan2(entity.velocity.x, entity.velocity.z);
      let delta = targetYaw - visual.root.rotation.y;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      visual.root.rotation.y += delta * Math.min(1, dt * 6);
    }
  }

  private animateDetail(entity: RuntimeEntity): void {
    const { definition, visual } = entity;
    const phase = entity.animationPhase + definition.phase;
    const moving = definition.state === "walk" || definition.state === "march";
    const speed = Math.min(1, entity.velocity.length() / Math.max(0.1, definition.speed));
    for (let i = 0; i < visual.limbs.length; i++) {
      const limb = visual.limbs[i];
      const alternating = i % 2 === 0 ? 1 : -1;
      const pair = Math.floor(i / 2) % 2 === 0 ? 1 : -1;
      const swing = moving ? Math.sin(phase + i * 0.35) * 0.48 * alternating * pair * speed : 0;
      limb.rotation.x = swing;
      if (definition.state === "work" && i === 0) limb.rotation.x = -0.65 + Math.sin(phase * 0.7) * 0.35;
      if (definition.state === "gesture" && i === 0) limb.rotation.z = -0.35 + Math.sin(phase * 0.4) * 0.12;
      if (definition.state === "rest") limb.rotation.x = 0.18;
    }
    for (let i = 0; i < visual.wings.length; i++) {
      visual.wings[i].rotation.z = Math.sin(phase * 3 + i * Math.PI) * 0.55;
    }
  }

  private updateLOD(dt: number): void {
    // Motion/quality can be synced while the essential world is still building,
    // before optional instanced meshes exist.
    if (!this.initialized || this.disposed) return;
    const player = this.context.playerState.position;
    const quality = this.performance.getQuality();
    const detailDistance = quality === "high" ? 30 : quality === "medium" ? 22 : 15;
    const midDistance = quality === "high" ? 68 : quality === "medium" ? 52 : 38;
    this.visibleEntities = 0;
    for (const entity of this.entities) {
      const distance = entity.visual.root.position.distanceTo(player);
      const previous = entity.lod;
      if (!entity.enabled || distance > 155) entity.lod = "culled";
      else if (distance <= detailDistance) entity.lod = "detail";
      else if (distance <= midDistance) entity.lod = "mid";
      else entity.lod = "far";
      entity.visible = entity.lod !== "culled";
      entity.visual.detail.visible = entity.lod === "detail";
      entity.visual.mid.visible = entity.lod === "mid";
      entity.visual.root.visible = entity.lod === "detail" || entity.lod === "mid";
      if (entity.visible) this.visibleEntities++;
      if (previous !== entity.lod && entity.lod === "detail") this.context.invalidate();
    }
    this.farAccumulator += dt;
    if (this.farAccumulator < 0.2) return;
    this.farAccumulator = 0;
    const counts: Record<AmbientEntityKind, number> = { human: 0, horse: 0, camel: 0, sheep: 0, goat: 0, bird: 0 };
    for (const entity of this.entities) {
      if (entity.lod !== "far") continue;
      const mesh = this.farMeshes.get(entity.definition.kind)!;
      const index = counts[entity.definition.kind]++;
      if (index >= mesh.instanceMatrix.count) continue;
      entity.visual.root.updateMatrix();
      mesh.setMatrixAt(index, entity.visual.root.matrix);
    }
    for (const kind of KINDS) {
      const mesh = this.farMeshes.get(kind)!;
      mesh.count = Math.min(counts[kind], mesh.instanceMatrix.count);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }

  private applyQualityVisibility(): void {
    const quality = this.performance.getQuality();
    this.appliedQuality = quality;
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      entity.enabled = quality === "high" ||
        quality === "medium" && i % 3 !== 2 ||
        quality === "low" && i % 3 === 0;
      if (!entity.enabled) {
        entity.velocity.set(0, 0, 0);
        entity.visual.root.visible = false;
        entity.lod = "culled";
      }
    }
  }

  /** Dynamic cylinders let the existing player controller avoid nearby life. */
  getCollisionShapesNear(position: THREE.Vector3, range = 10): WorldCollisionShape[] {
    const result: WorldCollisionShape[] = [];
    const rangeSq = range * range;
    for (const entity of this.entities) {
      if (!entity.enabled || entity.definition.kind === "bird") continue;
      const p = entity.visual.root.position;
      const dx = p.x - position.x, dz = p.z - position.z;
      if (dx * dx + dz * dz > rangeSq) continue;
      const height = entity.definition.kind === "human" ? 1.8 : entity.definition.kind === "sheep" || entity.definition.kind === "goat" ? 0.8 : 2.2;
      result.push({ type: "cylinder", center: new THREE.Vector3(p.x, p.y + height / 2, p.z), radiusTop: entity.radius, radiusBottom: entity.radius, height });
    }
    return result;
  }

  setQuality(tier: AmbientQualityTier): void {
    this.performance.setQuality(tier);
    this.applyQualityVisibility();
    this.updateLOD(0.2);
    this.context.invalidate();
  }
  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    this.performance.resetClock();
    if (reduced) {
      for (const entity of this.entities) {
        entity.velocity.set(0, 0, 0);
        // Actions stay cached but mixers are not advanced while reduced.
        for (const limb of entity.visual.limbs) limb.rotation.set(0, 0, 0);
        for (const wing of entity.visual.wings) wing.rotation.set(0, 0, 0);
      }
    }
    this.animatedEntities = 0;
    this.updateLOD(0.2);
    this.context.invalidate();
  }
  pause(): void { this.paused = true; this.animatedEntities = 0; this.performance.resetClock(); }
  resume(): void { this.paused = false; this.performance.resetClock(); this.context.invalidate(); }

  getAmbientStats(): AmbientStats {
    let humans = 0, horses = 0, camels = 0, otherAnimals = 0, active = 0, mixers = 0, fallbacks = 0;
    for (const entity of this.entities) {
      if (!entity.enabled) continue;
      active++;
      if (entity.definition.kind === "human") humans++;
      else if (entity.definition.kind === "horse") horses++;
      else if (entity.definition.kind === "camel") camels++;
      else otherAnimals++;
      if (entity.mixer) mixers++;
      if (entity.visual.developmentFallback) fallbacks++;
    }
    return {
      humans, horses, camels, otherAnimals,
      activeEntities: active,
      visibleEntities: this.visibleEntities,
      animatedEntities: this.animatedEntities,
      drawCalls: this.context.renderer.info.render.calls,
      triangles: this.context.renderer.info.render.triangles,
      fps: this.fps,
      frameTimeMs: this.frameTimeMs,
      activeAnimationMixers: mixers,
      qualityTier: this.performance.getQuality(),
      assetFailures: this.assetFailures,
      paused: this.paused,
      reducedMotion: this.reducedMotion,
      activePresets: [...this.activePresets],
      developmentFallbacks: fallbacks,
    };
  }

  /** Bounded diagnostic facts; available only through the opt-in world hook. */
  getDiagnosticSnapshot(): {
    navigation: { cellSize: number; columns: number; rows: number } | null;
    entities: Array<{ id: string; role: string; state: string; position: number[]; pathNodes: number; lod: string }>;
  } {
    return {
      navigation: this.navGrid ? { cellSize: this.navGrid.cellSize, columns: this.navGrid.columns, rows: this.navGrid.rows } : null,
      entities: this.entities.slice(0, 96).map((entity) => ({
        id: entity.definition.id,
        role: entity.definition.role,
        state: entity.definition.state,
        position: entity.visual.root.position.toArray().map((n) => Number(n.toFixed(3))),
        pathNodes: entity.path.length,
        lod: entity.lod,
      })),
    };
  }

  private clearEntities(): void {
    for (const entity of this.entities) {
      entity.mixer?.stopAllAction();
      entity.mixer?.uncacheRoot(entity.visual.root);
      entity.visual.root.removeFromParent();
      if (entity.ownedAssetRoot) disposeAmbientAsset(entity.ownedAssetRoot);
    }
    this.entities.length = 0;
    this.spatial.clear();
    for (const mesh of this.farMeshes.values()) mesh.count = 0;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.abort.abort();
    this.clearEntities();
    this.root.removeFromParent();
    for (const mesh of this.farMeshes.values()) mesh.dispose();
    this.farMeshes.clear();
    this.activePresets.clear();
    this.navGrid = null;
    this.factory.dispose();
  }
}
