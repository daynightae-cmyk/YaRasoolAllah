/**
 * WorldLife — Animated life entities for the Living Seerah World.
 *
 * Features:
 * - Procedural camel/horse animation (no external GLTF required for MVP)
 * - Wind-swaying cloth (tent flaps, awnings, fabric)
 * - Vegetation sway (palms, bushes, grass)
 * - Ambient particle effects (dust motes, heat shimmer)
 * - Distance-based culling for performance
 * - Graphics tier adaptation
 * - Reduced motion: static poses only
 */

import * as THREE from "three";
import type { WorldLifeEntity, WorldGraphicsTier, WorldRuntimeContext, WorldCollisionShape } from "./world-types";

/** Animation state for a life entity. */
interface LifeAnimationState {
  entity: WorldLifeEntity;
  phase: number;
  speed: number;
  /** For multi-part entities (camel: body, head, legs). */
  parts: Map<string, THREE.Object3D>;
  /** Original transforms for reset. */
  baseTransforms: Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>;
  /** Optional custom data for specific entity types (e.g., originalY for awnings, baseFrondRotations for palms). */
  customData?: Record<string, unknown>;
}

/** Built-in procedural entity creators. */
export class WorldLife {
  private readonly context: WorldRuntimeContext;
  private entities: LifeAnimationState[] = [];
  private reducedMotion = false;
  private graphicsTier: WorldGraphicsTier;
  private collisionShapes: WorldCollisionShape[] = [];

  constructor(context: WorldRuntimeContext, graphicsTier: WorldGraphicsTier) {
    this.context = context;
    this.graphicsTier = graphicsTier;
  }

  /** Solid shapes registered by entity creators (tents, palms, awnings). */
  getCollisionShapes(): WorldCollisionShape[] {
    return this.collisionShapes;
  }

  /** Create a procedural camel. */
  createCamel(position: THREE.Vector3, scale = 1, seed = 0): WorldLifeEntity {
    const random = mulberry(seed);
    const group = new THREE.Group();
    group.position.copy(position);

    // Colors
    const bodyColor = new THREE.Color(0x8b7355).lerp(new THREE.Color(0xa08d6a), random() * 0.3);
    const darkColor = new THREE.Color(0x5a4a3a);
    const matBody = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.9, metalness: 0 });
    const matDark = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.95, metalness: 0 });

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.5 * scale, 1.4 * scale, 4, 8);
    const body = new THREE.Mesh(bodyGeo, matBody);
    body.position.set(0, 1.3 * scale, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Neck
    const neckGeo = new THREE.CapsuleGeometry(0.12 * scale, 0.9 * scale, 4, 6);
    const neck = new THREE.Mesh(neckGeo, matBody);
    neck.position.set(0, 2.0 * scale, 0.6 * scale);
    neck.rotation.x = -0.4;
    neck.castShadow = true;
    group.add(neck);

    // Head
    const headGeo = new THREE.BoxGeometry(0.35 * scale, 0.3 * scale, 0.5 * scale);
    const head = new THREE.Mesh(headGeo, matBody);
    head.position.set(0, 2.55 * scale, 1.05 * scale);
    head.rotation.x = -0.3;
    head.castShadow = true;
    group.add(head);

    // Hump
    const humpGeo = new THREE.SphereGeometry(0.35 * scale, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hump = new THREE.Mesh(humpGeo, matBody);
    hump.position.set(0, 1.8 * scale, -0.2 * scale);
    hump.scale.set(1, 0.7, 1.2);
    hump.castShadow = true;
    group.add(hump);

    // Legs (4)
    const legGeo = new THREE.CapsuleGeometry(0.08 * scale, 1.2 * scale, 3, 6);
    const legs: THREE.Mesh[] = [];
    const legOffsets = [
      [-0.35, 0, 0.5], [0.35, 0, 0.5],  // Front legs
      [-0.3, 0, -0.6], [0.3, 0, -0.6],  // Back legs
    ];
    for (const [lx, ly, lz] of legOffsets) {
      const leg = new THREE.Mesh(legGeo, matDark);
      leg.position.set(lx * scale, 0.65 * scale, lz * scale);
      leg.castShadow = true;
      group.add(leg);
      legs.push(leg);
    }

    // Tail
    const tailGeo = new THREE.CylinderGeometry(0.02 * scale, 0.05 * scale, 0.5 * scale, 3);
    const tail = new THREE.Mesh(tailGeo, matDark);
    tail.position.set(0, 1.2 * scale, -0.8 * scale);
    tail.rotation.x = 0.5;
    group.add(tail);

    // Register parts for animation
    const parts = new Map<string, THREE.Object3D>();
    parts.set("body", body);
    parts.set("neck", neck);
    parts.set("head", head);
    parts.set("hump", hump);
    parts.set("tail", tail);
    legs.forEach((leg, i) => parts.set(`leg${i}`, leg));

    // Store base transforms
    const baseTransforms = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>();
    for (const [key, obj] of parts) {
      baseTransforms.set(key, {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
      });
    }

    const entity: WorldLifeEntity = {
      id: `camel-${seed}-${Date.now()}`,
      mesh: group,
      animationType: "walk",
      animationSpeed: 0.8 + random() * 0.4,
      bounds: new THREE.Box3().setFromObject(group).expandByScalar(2),
      cullDistance: 120,
    };

    this.entities.push({
      entity,
      phase: random() * Math.PI * 2,
      speed: entity.animationSpeed,
      parts,
      baseTransforms,
      customData: {
        // Small closed patrol loop so the camel actually translates.
        pathCenter: position.clone(),
        pathRadius: 2.5 + random() * 2,
        pathSpeed: 0.12 + random() * 0.08,
        groundHeightAt: null as ((x: number, z: number) => number) | null,
      },
    });

    this.context.scene.add(group);
    this.context.registerDisposable(() => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    });

    return entity;
  }

  /** Provide the terrain sampler so walking camels stay grounded. */
  setGroundSampler(sampler: (x: number, z: number) => number): void {
    for (const anim of this.entities) {
      if (anim.customData && "pathCenter" in anim.customData) {
        anim.customData.groundHeightAt = sampler;
      }
    }
  }

  /** Create a procedural tent with animated cloth flaps. */
  createTent(position: THREE.Vector3, scale = 1, seed = 0): WorldLifeEntity {
    const random = mulberry(seed);
    const group = new THREE.Group();
    group.position.copy(position);

    const fabricColor = new THREE.Color(0x8a4f2e).lerp(new THREE.Color(0xa67c52), random() * 0.4);
    const poleColor = new THREE.Color(0x4a3728);
    const matFabric = new THREE.MeshStandardMaterial({
      color: fabricColor,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const matPole = new THREE.MeshStandardMaterial({ color: poleColor, roughness: 1, metalness: 0 });

    // Center pole
    const poleGeo = new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 2.8 * scale, 6);
    const pole = new THREE.Mesh(poleGeo, matPole);
    pole.position.set(0, 1.4 * scale, 0);
    pole.castShadow = true;
    group.add(pole);

    // Tent canopy (cone)
    const canopyGeo = new THREE.ConeGeometry(2.2 * scale, 2.5 * scale, 8, 1, true);
    const canopy = new THREE.Mesh(canopyGeo, matFabric);
    canopy.position.set(0, 1.25 * scale, 0);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);

    // Entrance flap (animated)
    const flapGeo = new THREE.PlaneGeometry(1.2 * scale, 1.8 * scale, 4, 6);
    const flap = new THREE.Mesh(flapGeo, matFabric);
    flap.position.set(0, 0.9 * scale, 2.25 * scale);
    flap.rotation.x = -0.1;
    flap.castShadow = true;
    group.add(flap);

    // Side flaps (2)
    const sideFlaps: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      const sideFlap = new THREE.Mesh(flapGeo, matFabric);
      sideFlap.position.set(side * 2.1 * scale, 0.9 * scale, 0);
      sideFlap.rotation.y = side * Math.PI / 2;
      sideFlap.rotation.x = -0.1;
      sideFlap.castShadow = true;
      group.add(sideFlap);
      sideFlaps.push(sideFlap);
    }

    // Guy ropes
    const ropeGeo = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 3 * scale, 4);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x3a2f24, roughness: 1 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(Math.cos(angle) * 1.5 * scale, 1.5 * scale, Math.sin(angle) * 1.5 * scale);
      rope.lookAt(Math.cos(angle) * 3 * scale, 0, Math.sin(angle) * 3 * scale);
      rope.rotateX(-Math.PI / 2);
      group.add(rope);
    }

    const parts = new Map<string, THREE.Object3D>();
    parts.set("flap", flap);
    parts.set("sideFlap0", sideFlaps[0]);
    parts.set("sideFlap1", sideFlaps[1]);
    parts.set("canopy", canopy);

    const baseTransforms = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>();
    for (const [key, obj] of parts) {
      baseTransforms.set(key, {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
      });
    }

    const entity: WorldLifeEntity = {
      id: `tent-${seed}-${Date.now()}`,
      mesh: group,
      animationType: "sway",
      animationSpeed: 0.4 + random() * 0.3,
      bounds: new THREE.Box3().setFromObject(group).expandByScalar(1),
      cullDistance: 80,
    };

    this.entities.push({
      entity,
      phase: random() * Math.PI * 2,
      speed: entity.animationSpeed,
      parts,
      baseTransforms,
    });

    // Solid: the tent canopy footprint blocks the player (walk around it).
    this.collisionShapes.push({
      type: "cylinder",
      center: new THREE.Vector3(position.x, position.y + 1.25 * scale, position.z),
      radiusTop: 0.4 * scale,
      radiusBottom: 2.1 * scale,
      height: 2.5 * scale,
    });

    this.context.scene.add(group);
    this.context.registerDisposable(() => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    });

    return entity;
  }

  /** Create a market awning with animated fabric. */
  createAwning(position: THREE.Vector3, width = 3, depth = 2, seed = 0): WorldLifeEntity {
    const random = mulberry(seed);
    const group = new THREE.Group();
    group.position.copy(position);

    const fabricColor = new THREE.Color(0x7a5c3a).lerp(new THREE.Color(0x9a6b42), random() * 0.3);
    const postColor = new THREE.Color(0x3a2f24);
    const matFabric = new THREE.MeshStandardMaterial({
      color: fabricColor,
      roughness: 0.92,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const matPost = new THREE.MeshStandardMaterial({ color: postColor, roughness: 1 });

    // Posts (4 corners)
    const postGeo = new THREE.CylinderGeometry(0.07, 0.09, 2.2, 5);
    const posts: THREE.Mesh[] = [];
    for (const x of [-width / 2, width / 2]) {
      for (const z of [-depth / 2, depth / 2]) {
        const post = new THREE.Mesh(postGeo, matPost);
        post.position.set(x, 1.1, z);
        post.castShadow = true;
        group.add(post);
        posts.push(post);
      }
    }

    // Canopy with subtle wave geometry
    const canopyGeo = new THREE.PlaneGeometry(width, depth, 8, 6);
    const canopy = new THREE.Mesh(canopyGeo, matFabric);
    canopy.position.set(0, 2.2, 0);
    canopy.rotation.x = -Math.PI / 2;
    canopy.castShadow = true;
    group.add(canopy);

    // Store original vertex positions for wave animation
    const canopyPos = canopyGeo.attributes.position as THREE.BufferAttribute;
    const originalY = new Float32Array(canopyPos.count);
    for (let i = 0; i < canopyPos.count; i++) {
      originalY[i] = canopyPos.getY(i);
    }
    canopyGeo.setAttribute("originalY", new THREE.BufferAttribute(originalY, 1));

    const parts = new Map<string, THREE.Object3D>();
    parts.set("canopy", canopy);

    const baseTransforms = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>();
    for (const [key, obj] of parts) {
      baseTransforms.set(key, {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
      });
    }

    const entity: WorldLifeEntity = {
      id: `awning-${seed}-${Date.now()}`,
      mesh: group,
      animationType: "flutter",
      animationSpeed: 0.6 + random() * 0.4,
      bounds: new THREE.Box3().setFromObject(group).expandByScalar(1),
      cullDistance: 60,
    };

    this.entities.push({
      entity,
      phase: random() * Math.PI * 2,
      speed: entity.animationSpeed,
      parts,
      baseTransforms,
      customData: { originalY, canopyGeo },
    });

    // Solids: the four corner posts (player can walk under the canopy).
    for (const x of [-width / 2, width / 2]) {
      for (const z of [-depth / 2, depth / 2]) {
        this.collisionShapes.push({
          type: "cylinder",
          center: new THREE.Vector3(position.x + x, position.y + 1.1, position.z + z),
          radiusTop: 0.12,
          radiusBottom: 0.14,
          height: 2.2,
        });
      }
    }

    this.context.scene.add(group);
    this.context.registerDisposable(() => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    });

    return entity;
  }

  /** Create a palm tree with swaying fronds. */
  createPalm(position: THREE.Vector3, scale = 1, seed = 0): WorldLifeEntity {
    const random = mulberry(seed);
    const group = new THREE.Group();
    group.position.copy(position);

    const trunkColor = new THREE.Color(0x4a3728);
    const frondColor = new THREE.Color(0x2d5a30).lerp(new THREE.Color(0x4a7c3a), random() * 0.3);
    const matTrunk = new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 1 });
    const matFrond = new THREE.MeshStandardMaterial({ color: frondColor, roughness: 0.9, side: THREE.DoubleSide });

    // Trunk (slightly curved)
    const trunkHeight = 4.5 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, trunkHeight, 6, 4, true);
    const trunk = new THREE.Mesh(trunkGeo, matTrunk);
    trunk.position.set(0, trunkHeight / 2, 0);
    trunk.castShadow = true;
    group.add(trunk);

    // Fronds (7) — each blade is baked into an arching, tapering shape that
    // radiates outward (+Z local) and droops at the tip. The mesh itself is
    // pre-oriented horizontal, so the sway animation only adds small deltas
    // around a believable resting pose (the old vertical planes read as
    // green billboards standing on the trunk).
    const fronds: THREE.Mesh[] = [];
    const frondGeo = new THREE.PlaneGeometry(1.1 * scale, 3.4 * scale, 3, 10);
    frondGeo.translate(0, 1.7 * scale, 0); // pivot at the crown
    {
      const fp = frondGeo.attributes.position as THREE.BufferAttribute;
      for (let vi = 0; vi < fp.count; vi++) {
        const t = fp.getY(vi) / (3.4 * scale); // 0 at crown → 1 at tip
        // Leaf silhouette: narrow at crown, widest mid-blade, pointed tip.
        const taper = Math.max(0.1, Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.9 + 0.15);
        fp.setX(vi, fp.getX(vi) * taper);
        // Arch: rise briefly then droop toward the tip.
        fp.setZ(vi, Math.sin(t * Math.PI * 0.5) * 0.35 * scale - t * t * 1.1 * scale);
      }
      // Lay the blade along +Z, arch becoming vertical relief.
      frondGeo.rotateX(Math.PI / 2);
      frondGeo.computeVertexNormals();
    }
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + random() * 0.3;
      const tilt = -0.08 + random() * 0.16;
      const frond = new THREE.Mesh(frondGeo, matFrond);
      frond.position.set(0, trunkHeight * 0.98, 0);
      frond.rotation.y = angle;
      frond.rotation.x = tilt;
      frond.castShadow = true;
      group.add(frond);
      fronds.push(frond);
    }

    // Store original frond rotations
    const baseFrondRotations = fronds.map((f) => f.rotation.clone());

    const parts = new Map<string, THREE.Object3D>();
    parts.set("trunk", trunk);
    fronds.forEach((f, i) => parts.set(`frond${i}`, f));

    const baseTransforms = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }>();
    for (const [key, obj] of parts) {
      baseTransforms.set(key, {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
      });
    }

    const entity: WorldLifeEntity = {
      id: `palm-${seed}-${Date.now()}`,
      mesh: group,
      animationType: "sway",
      animationSpeed: 0.3 + random() * 0.2,
      bounds: new THREE.Box3().setFromObject(group).expandByScalar(2),
      cullDistance: 100,
    };

    this.entities.push({
      entity,
      phase: random() * Math.PI * 2,
      speed: entity.animationSpeed,
      parts,
      baseTransforms,
      customData: { baseFrondRotations, fronds },
    });

    // Solid: palm trunk.
    this.collisionShapes.push({
      type: "cylinder",
      center: new THREE.Vector3(position.x, position.y + trunkHeight / 2, position.z),
      radiusTop: 0.2 * scale,
      radiusBottom: 0.3 * scale,
      height: trunkHeight,
    });

    this.context.scene.add(group);
    this.context.registerDisposable(() => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
    });

    return entity;
  }

  /** Update all life entities (call each frame). */
  update(deltaTime: number, elapsedTime: number, playerPosition: THREE.Vector3): void {
    if (this.reducedMotion) return;

    const windX = Math.sin(elapsedTime * 0.25) * 0.4 + Math.sin(elapsedTime * 0.6) * 0.2;
    const windZ = Math.cos(elapsedTime * 0.2) * 0.3 + Math.cos(elapsedTime * 0.55) * 0.15;
    const windStrength = 0.08;

    for (const anim of this.entities) {
      // Distance culling
      const dist = anim.entity.mesh.position.distanceTo(playerPosition);
      if (dist > anim.entity.cullDistance) continue;

      const entity = anim.entity;
      const t = elapsedTime * entity.animationSpeed + anim.phase;

      switch (entity.animationType) {
        case "walk": // Camel walking cycle
          this.animateCamel(anim, t, windX, windZ, windStrength);
          break;
        case "sway": // Tent, palm swaying
          this.animateSway(anim, t, windX, windZ, windStrength);
          break;
        case "flutter": // Awning fabric flutter
          this.animateFlutter(anim, t, windX, windZ, windStrength);
          break;
        case "graze": // Camel grazing (idle)
          this.animateGraze(anim, t);
          break;
        case "idle":
          // Subtle breathing
          this.animateIdle(anim, t);
          break;
      }
    }
  }

  /** Animate camel walking/grazing. */
  private animateCamel(
    anim: LifeAnimationState,
    t: number,
    windX: number,
    windZ: number,
    windStrength: number,
  ): void {
    const parts = anim.parts;
    const bases = anim.baseTransforms;

    // Body bob
    const body = parts.get("body");
    if (body) {
      const base = bases.get("body")!;
      body.position.y = base.position.y + Math.sin(t * 2.5) * 0.03;
      body.rotation.z = Math.sin(t * 2.5) * 0.02;
    }

    // Neck/head counter-motion
    const neck = parts.get("neck");
    const head = parts.get("head");
    if (neck && head) {
      const neckBase = bases.get("neck")!;
      const headBase = bases.get("head")!;
      neck.rotation.x = neckBase.rotation.x + Math.sin(t * 2.5 + 0.5) * 0.08;
      head.rotation.x = headBase.rotation.x + Math.sin(t * 2.5 + 1) * 0.1;
    }

    // Legs walking cycle
    const legPhase = t * 4;
    for (let i = 0; i < 4; i++) {
      const leg = parts.get(`leg${i}`);
      if (!leg) continue;
      const base = bases.get(`leg${i}`)!;
      const phaseOffset = i < 2 ? 0 : Math.PI; // Front vs back
      const sideOffset = i % 2 === 0 ? 0 : Math.PI; // Left vs right
      const legAngle = Math.sin(legPhase + phaseOffset + sideOffset) * 0.35;
      leg.rotation.x = base.rotation.x + legAngle;
      leg.position.y = base.position.y + Math.max(0, -legAngle) * 0.15;
    }

    // Tail sway
    const tail = parts.get("tail");
    if (tail) {
      const base = bases.get("tail")!;
      tail.rotation.x = base.rotation.x + Math.sin(t * 1.5) * 0.2 + windX * windStrength;
      tail.rotation.z = base.rotation.z + Math.cos(t * 1.3) * 0.15 + windZ * windStrength;
    }

    // Translate along a small patrol loop so the camel visibly walks.
    const group = anim.entity.mesh;
    const center = anim.customData?.pathCenter as THREE.Vector3 | undefined;
    const radius = (anim.customData?.pathRadius as number | undefined) ?? 0;
    const pathSpeed = (anim.customData?.pathSpeed as number | undefined) ?? 0;
    const groundAt = anim.customData?.groundHeightAt as ((x: number, z: number) => number) | null;
    if (center && radius > 0 && pathSpeed > 0) {
      const angle = t * pathSpeed;
      const nx = center.x + Math.cos(angle) * radius;
      const nz = center.z + Math.sin(angle) * radius;
      // Face along the tangent of travel (model forward is +Z).
      group.rotation.y = Math.atan2(-Math.sin(angle), Math.cos(angle)) + Math.PI / 2;
      group.position.x = nx;
      group.position.z = nz;
      if (groundAt) group.position.y = groundAt(nx, nz) + 0.1;
    }
  }

  /** Animate swaying (tent, palm). */
  private animateSway(
    anim: LifeAnimationState,
    t: number,
    windX: number,
    windZ: number,
    windStrength: number,
  ): void {
    const parts = anim.parts;
    const bases = anim.baseTransforms;

    // Check if it's a tent (has flaps) or palm (has fronds)
    const flap = parts.get("flap");
    const sideFlap0 = parts.get("sideFlap0");
    const sideFlap1 = parts.get("sideFlap1");
    const canopy = parts.get("canopy");

    if (flap) {
      // Tent flaps
      const base = bases.get("flap")!;
      flap.rotation.x = base.rotation.x + Math.sin(t * 0.8) * 0.12 + windX * windStrength * 0.5;
      flap.rotation.z = base.rotation.z + Math.cos(t * 0.7) * 0.08 + windZ * windStrength * 0.3;
    }

    if (sideFlap0 && sideFlap1) {
      const base0 = bases.get("sideFlap0")!;
      const base1 = bases.get("sideFlap1")!;
      sideFlap0.rotation.x = base0.rotation.x + Math.sin(t * 0.9 + 0.5) * 0.1 + windX * windStrength * 0.4;
      sideFlap1.rotation.x = base1.rotation.x + Math.sin(t * 0.85 - 0.5) * 0.1 - windX * windStrength * 0.4;
    }

    // Palm fronds
    const fronds = anim.customData?.fronds as THREE.Mesh[] | undefined;
    const baseFrondRotations = anim.customData?.baseFrondRotations as THREE.Euler[] | undefined;
    if (fronds && baseFrondRotations) {
      for (let i = 0; i < fronds.length; i++) {
        const frond = fronds[i];
        const baseRot = baseFrondRotations[i];
        const phase = t + i * 0.8;
        frond.rotation.x = baseRot.x + Math.sin(phase * 0.7) * 0.15 + windX * windStrength;
        frond.rotation.z = baseRot.z + Math.cos(phase * 0.6) * 0.1 + windZ * windStrength;
        frond.rotation.y = baseRot.y + Math.sin(phase * 0.5) * 0.05;
      }
    }

    // Canopy subtle sway
    if (canopy) {
      const base = bases.get("canopy")!;
      canopy.rotation.x = base.rotation.x + Math.sin(t * 0.6) * 0.02;
      canopy.rotation.z = base.rotation.z + Math.cos(t * 0.55) * 0.015;
    }
  }

  /** Animate awning fabric flutter. */
  private animateFlutter(
    anim: LifeAnimationState,
    t: number,
    windX: number,
    windZ: number,
    windStrength: number,
  ): void {
    const canopy = anim.parts.get("canopy") as THREE.Mesh | undefined;
    const canopyGeo = anim.customData?.canopyGeo as THREE.BufferGeometry | undefined;
    const originalY = anim.customData?.originalY as Float32Array | undefined;

    if (canopy && canopyGeo && originalY) {
      const pos = canopyGeo.attributes.position as THREE.BufferAttribute;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Wave based on position and time
        const wave = Math.sin(x * 1.5 + t * 3) * 0.03 + Math.cos(z * 1.2 + t * 2.5) * 0.02;
        const wind = (windX * x * 0.01 + windZ * z * 0.01) * windStrength;
        pos.setY(i, originalY[i] + wave + wind);
      }
      pos.needsUpdate = true;
      canopyGeo.computeVertexNormals();
    }
  }

  /** Animate grazing (idle camel). */
  private animateGraze(anim: LifeAnimationState, t: number): void {
    const parts = anim.parts;
    const bases = anim.baseTransforms;

    const neck = parts.get("neck");
    const head = parts.get("head");
    if (neck && head) {
      const neckBase = bases.get("neck")!;
      const headBase = bases.get("head")!;
      neck.rotation.x = neckBase.rotation.x + Math.sin(t * 0.6) * 0.15 + 0.3;
      head.rotation.x = headBase.rotation.x + Math.sin(t * 0.6 + 0.5) * 0.2;
    }
  }

  /** Animate subtle idle breathing. */
  private animateIdle(anim: LifeAnimationState, t: number): void {
    const parts = anim.parts;
    const bases = anim.baseTransforms;

    for (const [key, obj] of parts) {
      const base = bases.get(key);
      if (!base) continue;
      // Very subtle scale pulse
      const pulse = Math.sin(t * 0.5) * 0.005;
      obj.scale.set(
        base.scale.x * (1 + pulse),
        base.scale.y * (1 + pulse * 0.5),
        base.scale.z * (1 + pulse),
      );
    }
  }

  /** Set reduced motion mode. */
  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) {
      // Reset all to base transforms
      for (const anim of this.entities) {
        for (const [key, obj] of anim.parts) {
          const base = anim.baseTransforms.get(key);
          if (base) {
            obj.position.copy(base.position);
            obj.rotation.copy(base.rotation);
            obj.scale.copy(base.scale);
          }
        }
      }
    }
  }

  /** Dispose all entities. */
  dispose(): void {
    for (const anim of this.entities) {
      anim.entity.mesh.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });
      this.context.scene.remove(anim.entity.mesh);
    }
    this.entities = [];
  }
}

/** Mulberry32 PRNG. */
function mulberry(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}