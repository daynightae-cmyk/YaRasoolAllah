/**
 * WorldTerrain — Procedural terrain generation for the Living Seerah World.
 *
 * Features:
 * - Deterministic fractal noise heightfield
 * - Multiple terrain biomes (dunes, rocky plains, oasis, wadi, settlement)
 * - PBR materials with vertex color blending
 * - Instanced rocks, vegetation, debris
 * - Collision shapes extraction for physics
 * - LOD support for performance
 * - Graphics tier adaptation
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { WorldSceneConfig, WorldCollisionShape, WorldGraphicsTier } from "./world-types";

/** Deterministic pseudo-random generator (mulberry32). */
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

/** Smooth noise with fractal Brownian motion. */
function makeFBM(random: () => number, octaves = 4) {
  const size = 256;
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = random();
  const at = (x: number, y: number) =>
    lattice[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  const smooth = (t: number) => t * t * (3 - 2 * t);

  return (x: number, z: number, frequency = 1, amplitude = 1) => {
    let value = 0;
    let amp = amplitude;
    let freq = frequency;
    for (let i = 0; i < octaves; i++) {
      const xi = Math.floor(x * freq);
      const zi = Math.floor(z * freq);
      const tx = smooth(x * freq - xi);
      const ty = smooth(z * freq - zi);
      const a = at(xi, zi);
      const b = at(xi + 1, zi);
      const c = at(xi, zi + 1);
      const d = at(xi + 1, zi + 1);
      const interp = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
      value += interp * amp;
      amp *= 0.5;
      freq *= 2;
    }
    return value;
  };
}

/** Biome definitions for terrain variation. */
type BiomeType = "dunes" | "rocky-plain" | "wadi" | "oasis" | "settlement" | "mountain-pass";

interface BiomeConfig {
  baseHeight: number;
  heightScale: number;
  roughness: number;
  rockDensity: number;
  vegetationDensity: number;
  colorBase: THREE.Color;
  colorRock: THREE.Color;
  colorAccent: THREE.Color;
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  "dunes": {
    baseHeight: 0,
    heightScale: 4.5,
    roughness: 0.65,
    rockDensity: 0.08,
    vegetationDensity: 0.02,
    colorBase: new THREE.Color("#c9a86a"),
    colorRock: new THREE.Color("#8b7355"),
    colorAccent: new THREE.Color("#e8d4a8"),
  },
  "rocky-plain": {
    baseHeight: 0.2,
    heightScale: 2.8,
    roughness: 0.85,
    rockDensity: 0.25,
    vegetationDensity: 0.04,
    colorBase: new THREE.Color("#7d6b52"),
    colorRock: new THREE.Color("#5a4f3f"),
    colorAccent: new THREE.Color("#9a876e"),
  },
  "wadi": {
    baseHeight: -1.5,
    heightScale: 3.2,
    roughness: 0.55,
    rockDensity: 0.18,
    vegetationDensity: 0.12,
    colorBase: new THREE.Color("#8a7558"),
    colorRock: new THREE.Color("#6b5a45"),
    colorAccent: new THREE.Color("#a89478"),
  },
  "oasis": {
    baseHeight: -0.5,
    heightScale: 1.8,
    roughness: 0.4,
    rockDensity: 0.06,
    vegetationDensity: 0.35,
    colorBase: new THREE.Color("#6d8a5a"),
    colorRock: new THREE.Color("#4a5d3e"),
    colorAccent: new THREE.Color("#8fc97a"),
  },
  "settlement": {
    baseHeight: 0.3,
    heightScale: 1.2,
    roughness: 0.35,
    rockDensity: 0.04,
    vegetationDensity: 0.15,
    colorBase: new THREE.Color("#9a7d5c"),
    colorRock: new THREE.Color("#6b5138"),
    colorAccent: new THREE.Color("#c4a57a"),
  },
  "mountain-pass": {
    baseHeight: 2,
    heightScale: 12,
    roughness: 0.9,
    rockDensity: 0.35,
    vegetationDensity: 0.03,
    colorBase: new THREE.Color("#5a4f42"),
    colorRock: new THREE.Color("#3d352c"),
    colorAccent: new THREE.Color("#7a6d5c"),
  },
};

/** Terrain generation result. */
export interface WorldTerrainResult {
  ground: THREE.Mesh;
  collisionShapes: WorldCollisionShape[];
  instances: THREE.InstancedMesh[];
  disposables: Array<() => void>;
  biomeMap: Float32Array; // Per-vertex biome index for blending
}

/** Generate terrain for a world scene. */
export function generateWorldTerrain(
  config: WorldSceneConfig,
  graphicsTier: WorldGraphicsTier,
  shadowsEnabled: boolean,
): WorldTerrainResult {
  const random = mulberry(config.seed);
  const fbm = makeFBM(random, 5);

  // Determine dominant biome from config
  const biome = inferBiome(config);
  const biomeCfg = BIOMES[biome];

  // World dimensions
  const worldSize = Math.max(config.bounds.width, config.bounds.depth);
  const segments = graphicsTier === "low" ? 96 : graphicsTier === "high" ? 160 : 128;
  const segmentSize = worldSize / segments;

  // Create heightfield geometry
  const groundGeo = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position as THREE.BufferAttribute;

  // Biome noise for blending
  const biomeNoise = makeFBM(mulberry(config.seed + 999), 3);
  const biomeMap = new Float32Array(pos.count);

  // Vertex colors
  const colors = new Float32Array(pos.count * 3);
  const baseColor = biomeCfg.colorBase.clone();
  const rockColor = biomeCfg.colorRock.clone();
  const accentColor = biomeCfg.colorAccent.clone();

  const heightData = new Float32Array(pos.count);
  // One phase per dune field. Sampling a new random phase per vertex created
  // metre-scale spikes and made the ground read as artificial faceting.
  const dunePhase = random() * 100;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Base FBM height
    let height = fbm(x * 0.03, z * 0.03) * biomeCfg.heightScale + biomeCfg.baseHeight;

    // Add biome-specific features
    switch (biome) {
      case "dunes": {
        // Large dune ridges
        const ridge1 = Math.sin(x * 0.018 + z * 0.012) * 2.5;
        const ridge2 = Math.sin(x * 0.035 - z * 0.022) * 1.4;
        const ridge3 = Math.sin(x * 0.008 + z * 0.006 + dunePhase) * 0.8;
        height += ridge1 + ridge2 + ridge3;
        // Sharp dune crests
        const crest = Math.max(0, Math.sin(x * 0.045) * Math.cos(z * 0.038)) * 1.2;
        height += crest;
        break;
      }
      case "rocky-plain": {
        // Eroded terrain with scattered rocks, plus the authored massif that
        // gives the Uhud viewpoint its landmark: a broad ridge on the far
        // side of the plain, visible from the southern entry.
        const erosion = fbm(x * 0.08, z * 0.08) * 1.5;
        height += erosion;
        const massif = Math.exp(-((x - 6) * (x - 6)) / 1400 - ((z + 64) * (z + 64)) / 700);
        height += massif * 26;
        break;
      }
      case "wadi": {
        // Per-scene channel profile: a narrow trench (Khandaq) or a broad
        // valley (Badr). Defaults preserve the original trench dimensions.
        const halfWidth = config.wadiProfile?.halfWidth ?? 12;
        const wallWidth = config.wadiProfile?.wallWidth ?? 6;
        const wallSlope = config.wadiProfile?.wallSlope ?? 0.8;
        const depth = config.wadiProfile?.depth ?? 2;
        const absX = Math.abs(x);
        const channelT = Math.min(1, absX / halfWidth);
        const channelDepth = depth * (1 - channelT * channelT);
        height -= channelDepth;
        if (absX > halfWidth && absX < halfWidth + wallWidth) {
          height += (absX - halfWidth) * wallSlope;
        }
        // Gentle rolls along the valley floor so a broad wadi reads as a
        // landscape rather than a flat plate under the camera.
        height += Math.sin(z * 0.028 + x * 0.012 + dunePhase) * 0.7;
        break;
      }
      case "oasis": {
        // Gentle depression with water area
        const distCenter = Math.hypot(x, z);
        const basin = Math.max(0, 25 - distCenter) * 0.08;
        height -= basin;
        // Palm grove mounds
        if (distCenter < 30 && distCenter > 10) {
          const moundNoise = fbm(x * 0.15, z * 0.15);
          if (moundNoise > 0.6) height += moundNoise * 0.6;
        }
        break;
      }
      case "settlement": {
        // Flat building areas with gentle undulation
        const flatness = Math.exp(-(x * x + z * z) / 800);
        height = height * (1 - flatness * 0.7) + flatness * 0.3;
        break;
      }
      case "mountain-pass": {
        // Steep walls with narrow pass — but the corridor opens into a wide
        // plain at both ends so the spawn point frames the camp ahead
        // instead of staring into a black canyon wall.
        const wallDist = Math.min(Math.abs(x - 20), Math.abs(x + 20));
        const passHeight = Math.max(0, 15 - wallDist) * 2;
        const endOpen = THREE.MathUtils.clamp((Math.abs(z) - 30) / 45, 0, 1);
        height += passHeight * (1 - endOpen * 0.8);
        // Pass floor
        if (Math.abs(x) < 10) {
          height = Math.min(height, 3 + fbm(x * 0.05, z * 0.05) * 1.5);
        }
        break;
      }
    }

    // Clamp minimum height
    height = Math.max(height, -5);

    pos.setY(i, height);
    heightData[i] = height;

    // Biome blending at edges
    const biomeBlend = biomeNoise(x * 0.008, z * 0.008);
    biomeMap[i] = biomeBlend;

    // Color based on height and slope
    const slope = estimateSlope(i, pos, segments);
    let colorMix = THREE.MathUtils.clamp(height / (biomeCfg.heightScale * 1.5) + slope * 0.3, 0, 1);
    colorMix += biomeBlend * 0.15;

    const color = baseColor.clone().lerp(rockColor, colorMix * 0.7).lerp(accentColor, biomeBlend * 0.1);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  // Authored sightline corridor: flatten the terrain along the entry forward
  // axis so the first view down the route (road scenes) stays open.
  const corridor = config.vistaCorridor;
  if (corridor) {
    const yaw = config.entryYaw ?? 0;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const ex = config.entryPosition.x;
    const ez = config.entryPosition.z;
    const sampleX = THREE.MathUtils.clamp(Math.floor((ex + worldSize / 2) / segmentSize), 0, segments);
    const sampleZ = THREE.MathUtils.clamp(Math.floor((ez + worldSize / 2) / segmentSize), 0, segments);
    const entryHeight = heightData[sampleZ * (segments + 1) + sampleX];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const rx = x - ex;
      const rz = z - ez;
      const along = rx * fx + rz * fz;
      const lateral = Math.abs(rx * fz - rz * fx);
      if (along > -4 && along < corridor.length && lateral < corridor.halfWidth) {
        const edge = THREE.MathUtils.clamp((lateral - (corridor.halfWidth - 3)) / 3, 0, 1);
        const startFade = THREE.MathUtils.clamp((along + 4) / 8, 0, 1);
        const factor = edge * startFade;
        const h = heightData[i];
        const flattened = entryHeight + (h - entryHeight) * factor;
        pos.setY(i, Math.max(flattened, -5));
        heightData[i] = Math.max(flattened, -5);
      }
    }
  }

  groundGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();

  // Ground material
  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: biomeCfg.roughness,
    metalness: 0,
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = shadowsEnabled;
  ground.userData.heightData = heightData;
  ground.userData.segmentSize = segmentSize;
  ground.userData.worldSize = worldSize;
  ground.userData.segments = segments;

  // Disposables
  const disposables: Array<() => void> = [];
  disposables.push(() => {
    groundGeo.dispose();
    groundMat.dispose();
  });

  // Shared transform objects for instancing
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();

  // Solid collision shapes accumulate here (rocks, boundary walls).
  const collisionShapes: WorldCollisionShape[] = [];

  // Generate instanced rocks
  const instances: THREE.InstancedMesh[] = [];
  const rockCount = Math.floor(
    (graphicsTier === "low" ? 60 : graphicsTier === "high" ? 180 : 120) * biomeCfg.rockDensity / 0.15,
  );

  if (rockCount > 0) {
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: rockColor,
      roughness: 0.9,
      metalness: 0.05,
    });
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);

    for (let i = 0; i < rockCount; i++) {
      let x = (random() - 0.5) * worldSize * 0.9;
      let z = (random() - 0.5) * worldSize * 0.9;
      // Keep the spawn vista clear of big rocks too.
      const dSpawn = Math.hypot(x - config.entryPosition.x, z - config.entryPosition.z);
      if (dSpawn < 14) {
        const push = (14 - dSpawn) + 2;
        x += ((x - config.entryPosition.x) / (dSpawn || 1)) * push;
        z += ((z - config.entryPosition.z) / (dSpawn || 1)) * push;
      }
      // Keep the authored sightline corridor clear of rocks as well.
      const corridorCfg = config.vistaCorridor;
      if (corridorCfg) {
        const cyaw = config.entryYaw ?? 0;
        const cfx = -Math.sin(cyaw);
        const cfz = -Math.cos(cyaw);
        const crx = x - config.entryPosition.x;
        const crz = z - config.entryPosition.z;
        const calong = crx * cfx + crz * cfz;
        const clateral = crx * cfz - crz * cfx;
        if (calong > 2 && calong < corridorCfg.length && Math.abs(clateral) < corridorCfg.halfWidth + 2) {
          const side = clateral >= 0 ? 1 : -1;
          const t = side * (corridorCfg.halfWidth + 2) - clateral;
          x += cfz * t;
          z += -cfx * t;
        }
      }
      const sampleX = Math.floor((x + worldSize / 2) / segmentSize);
      const sampleZ = Math.floor((z + worldSize / 2) / segmentSize);
      const idx = THREE.MathUtils.clamp(sampleZ * (segments + 1) + sampleX, 0, heightData.length - 1);
      const y = heightData[idx];

      const scale = 0.3 + random() * (biome === "rocky-plain" ? 2.8 : biome === "mountain-pass" ? 3.5 : 1.8);
      euler.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      quat.setFromEuler(euler);
      matrix.compose(
        new THREE.Vector3(x, y + scale * 0.2, z),
        quat,
        new THREE.Vector3(scale, scale * (0.5 + random() * 0.6), scale),
      );
      rocks.setMatrixAt(i, matrix);

      // Large rocks are walk blockers; small scatter stays passable.
      if (scale >= 1.1) {
        collisionShapes.push({
          type: "sphere",
          center: new THREE.Vector3(x, y + scale * 0.2, z),
          radius: scale * 0.85,
        });
      }
    }
    rocks.castShadow = shadowsEnabled;
    rocks.receiveShadow = shadowsEnabled;
    instances.push(rocks);

    disposables.push(() => {
      rockGeo.dispose();
      rockMat.dispose();
    });
  }

  // Generate vegetation (palms, bushes, grass tufts)
  const vegCount = Math.floor(
    (graphicsTier === "low" ? 30 : graphicsTier === "high" ? 100 : 60) * biomeCfg.vegetationDensity / 0.15,
  );

  if (vegCount > 0 && biome !== "dunes") {
    const vegType = biome === "oasis" ? "palm" : biome === "settlement" ? "mixed" : "bush";

    if (vegType === "palm" || vegType === "mixed") {
      const palmCount = vegType === "palm" ? vegCount : Math.floor(vegCount * 0.4);
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 3.8, 5);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 1 });
      // Crown = six flattened, drooping blades merged into one geometry so a
      // single InstancedMesh still draws the whole palm head (a cone read as
      // a green umbrella from the player's eye level).
      const blade = new THREE.PlaneGeometry(1.05, 2.9, 2, 6);
      blade.translate(0, 1.45, 0);
      {
        const bp = blade.attributes.position as THREE.BufferAttribute;
        for (let vi = 0; vi < bp.count; vi++) {
          const t = bp.getY(vi) / 2.9;
          // Leaf silhouette: narrow at crown, widest mid-blade, pointed tip.
          bp.setX(vi, bp.getX(vi) * Math.max(0.1, Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.9 + 0.15));
          bp.setZ(vi, Math.sin(t * Math.PI * 0.5) * 0.3 - t * t * 0.8);
        }
        blade.rotateX(Math.PI / 2);
        blade.computeVertexNormals();
      }
      const frondParts: THREE.BufferGeometry[] = [];
      for (let b = 0; b < 9; b++) {
        const part = blade.clone();
        part.rotateY((b / 9) * Math.PI * 2);
        frondParts.push(part);
      }
      blade.dispose();
      const frondGeo = mergeGeometries(frondParts)!;
      frondParts.forEach((p) => p.dispose());
      const frondMat = new THREE.MeshStandardMaterial({
        color: 0x3a6b3c,
        roughness: 0.9,
        // A touch of self-illumination keeps fronds reading green on the
        // shadow side instead of collapsing to black silhouettes at sunset.
        emissive: 0x0f2611,
        emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
      });

      const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, palmCount);
      const fronds = new THREE.InstancedMesh(frondGeo, frondMat, palmCount);

      for (let i = 0; i < palmCount; i++) {
        const angle = random() * Math.PI * 2;
        const radius = 8 + random() * (worldSize * 0.4 - 8);
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        // Keep the spawn clear and the authored sightline corridor open —
        // a palm trunk parked two metres in front of the camera reads as a
        // black wall, not a grove.
        const dSpawn = Math.hypot(x - config.entryPosition.x, z - config.entryPosition.z);
        if (dSpawn < 18) {
          const push = (18 - dSpawn) + 2;
          x += ((x - config.entryPosition.x) / (dSpawn || 1)) * push;
          z += ((z - config.entryPosition.z) / (dSpawn || 1)) * push;
        }
        const palmCorridor = config.vistaCorridor;
        if (palmCorridor) {
          const pyaw = config.entryYaw ?? 0;
          const pfx = -Math.sin(pyaw);
          const pfz = -Math.cos(pyaw);
          const prx = x - config.entryPosition.x;
          const prz = z - config.entryPosition.z;
          const palong = prx * pfx + prz * pfz;
          const plateral = prx * pfz - prz * pfx;
          if (palong > 0 && palong < palmCorridor.length && Math.abs(plateral) < palmCorridor.halfWidth + 2) {
            const side = plateral >= 0 ? 1 : -1;
            const t = side * (palmCorridor.halfWidth + 2) - plateral;
            x += pfz * t;
            z += -pfx * t;
          }
        }
        const sampleX = Math.floor((x + worldSize / 2) / segmentSize);
        const sampleZ = Math.floor((z + worldSize / 2) / segmentSize);
        const idx = THREE.MathUtils.clamp(sampleZ * (segments + 1) + sampleX, 0, heightData.length - 1);
        const y = heightData[idx];

        const lean = (random() - 0.5) * 0.12;
        euler.set(lean, random() * Math.PI, lean);
        quat.setFromEuler(euler);
        const trunkScale = 0.85 + random() * 0.3;
        matrix.compose(
          new THREE.Vector3(x, y + 1.9, z),
          quat,
          new THREE.Vector3(1, trunkScale, 1),
        );
        trunks.setMatrixAt(i, matrix);
        matrix.compose(
          new THREE.Vector3(x, y + 3.8 * trunkScale, z),
          quat,
          new THREE.Vector3(1, 1, 1),
        );
        fronds.setMatrixAt(i, matrix);
      }
      trunks.castShadow = shadowsEnabled;
      fronds.castShadow = shadowsEnabled;
      instances.push(trunks, fronds);

      disposables.push(() => {
        trunkGeo.dispose();
        trunkMat.dispose();
        frondGeo.dispose();
        frondMat.dispose();
      });
    }

    if (vegType === "bush" || vegType === "mixed") {
      const bushCount = vegType === "bush" ? vegCount : Math.floor(vegCount * 0.6);
      const bushGeo = new THREE.IcosahedronGeometry(1, 0);
      const bushMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3a5a2e"),
        roughness: 0.95,
        metalness: 0,
      });
      const bushes = new THREE.InstancedMesh(bushGeo, bushMat, bushCount);

      for (let i = 0; i < bushCount; i++) {
        let x = (random() - 0.5) * worldSize * 0.9;
        let z = (random() - 0.5) * worldSize * 0.9;
        // Keep the spawn vista clear — no bush parked in the player's face.
        const dSpawn = Math.hypot(x - config.entryPosition.x, z - config.entryPosition.z);
        if (dSpawn < 18) {
          const push = (18 - dSpawn) + 2;
          const nx = (x - config.entryPosition.x) / (dSpawn || 1);
          const nz = (z - config.entryPosition.z) / (dSpawn || 1);
          x += nx * push;
          z += nz * push;
        }
        const bushCorridor = config.vistaCorridor;
        if (bushCorridor) {
          const byaw = config.entryYaw ?? 0;
          const bfx = -Math.sin(byaw);
          const bfz = -Math.cos(byaw);
          const brx = x - config.entryPosition.x;
          const brz = z - config.entryPosition.z;
          const balong = brx * bfx + brz * bfz;
          const blateral = brx * bfz - brz * bfx;
          if (balong > 0 && balong < bushCorridor.length && Math.abs(blateral) < bushCorridor.halfWidth + 2) {
            const side = blateral >= 0 ? 1 : -1;
            const t = side * (bushCorridor.halfWidth + 2) - blateral;
            x += bfz * t;
            z += -bfx * t;
          }
        }
        const sampleX = Math.floor((x + worldSize / 2) / segmentSize);
        const sampleZ = Math.floor((z + worldSize / 2) / segmentSize);
        const idx = THREE.MathUtils.clamp(sampleZ * (segments + 1) + sampleX, 0, heightData.length - 1);
        const y = heightData[idx];

        const scale = 0.4 + random() * 0.8;
        euler.set(random() * 0.3, random() * Math.PI, random() * 0.3);
        quat.setFromEuler(euler);
        matrix.compose(
          new THREE.Vector3(x, y + scale * 0.5, z),
          quat,
          new THREE.Vector3(scale, scale * 0.7, scale),
        );
        bushes.setMatrixAt(i, matrix);
      }
      bushes.castShadow = shadowsEnabled;
      bushes.receiveShadow = shadowsEnabled;
      instances.push(bushes);

      disposables.push(() => {
        bushGeo.dispose();
        bushMat.dispose();
      });
    }
  }

  // Boundary walls (ground contact itself is analytic via sampleTerrainHeight).
  collisionShapes.push(
    ...generateTerrainCollisionShapes(config.bounds.height, worldSize),
  );

  return { ground, collisionShapes, instances, disposables, biomeMap };
}

/** Estimate slope at vertex for color variation. */
function estimateSlope(index: number, pos: THREE.BufferAttribute, segments: number): number {
  const x = index % (segments + 1);
  const z = Math.floor(index / (segments + 1));
  if (x === 0 || x === segments || z === 0 || z === segments) return 0;

  const y = pos.getY(index);
  const yX = pos.getY(index + 1);
  const yZ = pos.getY(index + segments + 1);
  const dx = Math.abs(yX - y);
  const dz = Math.abs(yZ - y);
  return Math.min(1, Math.max(dx, dz) * 2);
}

/** Boundary walls only. Ground contact is analytic (sampleTerrainHeight);
 * heightfield boxes are intentionally NOT emitted — they would trap the
 * player inside the terrain. Structures/rocks register their own solids. */
function generateTerrainCollisionShapes(
  maxHeight: number,
  worldSize: number,
): WorldCollisionShape[] {
  const shapes: WorldCollisionShape[] = [];
  const halfSize = worldSize / 2;

  const wallHeight = maxHeight + 10;
  const wallThickness = 2;
  shapes.push(
    { type: "box", center: new THREE.Vector3(0, wallHeight / 2, -halfSize), size: new THREE.Vector3(worldSize, wallHeight, wallThickness) },
    { type: "box", center: new THREE.Vector3(0, wallHeight / 2, halfSize), size: new THREE.Vector3(worldSize, wallHeight, wallThickness) },
    { type: "box", center: new THREE.Vector3(-halfSize, wallHeight / 2, 0), size: new THREE.Vector3(wallThickness, wallHeight, worldSize) },
    { type: "box", center: new THREE.Vector3(halfSize, wallHeight / 2, 0), size: new THREE.Vector3(wallThickness, wallHeight, worldSize) },
  );

  return shapes;
}

/** Infer biome from scene config. An explicit `config.biome` always wins —
 *  the colour heuristic below misread linear-space colour components and
 *  turned the desert camp and Madinah into mountain passes. */
function inferBiome(config: WorldSceneConfig): BiomeType {
  if (config.biome) return config.biome;
  const { skyColor, groundColor, sunColor } = config;

  // Simple heuristic based on colors
  const ground = new THREE.Color(groundColor);
  const sky = new THREE.Color(skyColor);

  // Oasis: greenish ground, brighter sky
  if (ground.g > ground.r * 0.8 && ground.g > ground.b * 1.1) return "oasis";

  // Settlement: warm brown/orange ground
  if (ground.r > 0.55 && ground.g > 0.4 && ground.b < 0.35) return "settlement";

  // Mountain: dark ground, cool sky
  if (ground.r < 0.4 && ground.g < 0.4 && ground.b < 0.35) return "mountain-pass";

  // Wadi: lower ground, distinct channel-like
  if (sky.r < 0.2 && sky.g < 0.2 && sky.b < 0.25) return "wadi";

  // Rocky plain: desaturated, medium brightness
  if (ground.r > 0.35 && ground.r < 0.55 && ground.g > 0.3 && ground.g < 0.5) return "rocky-plain";

  // Default to dunes
  return "dunes";
}

/** Get height at world position (for external systems). */
export function getTerrainHeightAt(
  ground: THREE.Mesh,
  x: number,
  z: number,
): number {
  const heightData = ground.userData.heightData as Float32Array | undefined;
  const segmentSize = ground.userData.segmentSize as number | undefined;
  const worldSize = ground.userData.worldSize as number | undefined;
  const segments = ground.userData.segments as number | undefined;

  if (!heightData || !segmentSize || !worldSize || !segments) return 0;

  const halfSize = worldSize / 2;
  const gx = Math.floor((x + halfSize) / segmentSize);
  const gz = Math.floor((z + halfSize) / segmentSize);

  if (gx < 0 || gx > segments || gz < 0 || gz > segments) return 0;

  const idx = gz * (segments + 1) + gx;
  return heightData[idx] ?? 0;
}

/** Sample height with bilinear interpolation. */
export function sampleTerrainHeight(
  ground: THREE.Mesh,
  x: number,
  z: number,
): number {
  const heightData = ground.userData.heightData as Float32Array | undefined;
  const segmentSize = ground.userData.segmentSize as number | undefined;
  const worldSize = ground.userData.worldSize as number | undefined;
  const segments = ground.userData.segments as number | undefined;

  if (!heightData || !segmentSize || !worldSize || !segments) return 0;

  const halfSize = worldSize / 2;
  const fx = (x + halfSize) / segmentSize;
  const fz = (z + halfSize) / segmentSize;

  const x0 = Math.floor(fx);
  const z0 = Math.floor(fz);
  const x1 = x0 + 1;
  const z1 = z0 + 1;

  if (x0 < 0 || x1 > segments || z0 < 0 || z1 > segments) return 0;

  const tx = fx - x0;
  const tz = fz - z0;

  const h00 = heightData[z0 * (segments + 1) + x0];
  const h10 = heightData[z0 * (segments + 1) + x1];
  const h01 = heightData[z1 * (segments + 1) + x0];
  const h11 = heightData[z1 * (segments + 1) + x1];

  const h0 = THREE.MathUtils.lerp(h00, h10, tx);
  const h1 = THREE.MathUtils.lerp(h01, h11, tx);
  return THREE.MathUtils.lerp(h0, h1, tz);
}