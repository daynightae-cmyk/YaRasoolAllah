/**
 * TerrainTheatre3D — genuine 3D observer terrain for Seerah battle events.
 *
 * Builds real Three.js geometry (procedural heightfield, rocks, trench cut,
 * palm groves, fort blocks) on the bounded ThreeRuntime. The visitor is a
 * neutral observer who:
 * - drags to look around from the current station,
 * - travels between linked observer nodes via the node rail / travel buttons /
 *   keyboard (ArrowLeft/ArrowRight in RTL, Home/End), or by clicking a beacon,
 * - reads an educational note per station,
 * - exits back to the reading surface at any time (button or Escape).
 *
 * Honesty: no people, no combat, no gore, no gameplay. Every scene declares
 * itself an artistic interpretation. Reduced motion renders discrete frames
 * and instant node jumps; WebGL failure falls back to the caller's plate.
 *
 * Engine rules (three-runtime-contract): no renderer creation, no rAF, no
 * matchMedia here — ThreeRuntime owns scheduling, visibility and cleanup.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Compass, LogOut, RotateCcw } from "lucide-react";
import * as THREE from "three";
import {
  ThreeRuntime,
  type ThreeRuntimeContext,
  type ThreeSceneHandle,
} from "@/visual-golden/components/three/three-runtime";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { TerrainSceneConfig, TerrainNode } from "@/visual-golden/services/seerah-terrain";
import styles from "./TerrainTheatre3D.module.css";

interface TerrainTheatre3DProps {
  scene: TerrainSceneConfig;
  onExit: () => void;
  /** Called when WebGL cannot run; caller shows its plate fallback. */
  onUnavailable: () => void;
}

/* ------------------------------------------------------------------ */
/* Deterministic noise                                                 */
/* ------------------------------------------------------------------ */

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

/** Smooth value noise over a seeded lattice — cheap, deterministic, no deps. */
function makeNoise(seed: number) {
  const random = mulberry(seed);
  const size = 64;
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i += 1) lattice[i] = random();
  const at = (x: number, y: number) =>
    lattice[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

/* ------------------------------------------------------------------ */
/* Heightfield per terrain kind                                        */
/* ------------------------------------------------------------------ */

const WORLD_SIZE = 90;

function heightFactory(scene: TerrainSceneConfig): (x: number, z: number) => number {
  const noise = makeNoise(scene.seed);
  const fbm = (x: number, z: number) =>
    noise(x * 0.045, z * 0.045) * 0.62 +
    noise(x * 0.11, z * 0.11) * 0.26 +
    noise(x * 0.28, z * 0.28) * 0.12;

  switch (scene.kind) {
    case "mountain": {
      // A granite massif rising toward -z with a pass near x≈8.
      return (x, z) => {
        const ridge = Math.max(0, (-z - 2) / 34);
        const passDip = Math.exp(-((x - 8) ** 2) / 60) * ridge * 5;
        return fbm(x, z) * 3.2 + ridge * ridge * 22 - passDip;
      };
    }
    case "trench": {
      // Flat approach ground with a defensive cut running along x at z≈0.
      return (x, z) => {
        const base = fbm(x, z) * 1.1;
        const dist = Math.abs(z);
        if (dist < 3.2) return base - 3.6 + dist * 0.18; // inside the cut
        if (dist < 5.2) return base + (5.2 - dist) * 0.55; // spoil banks
        return base;
      };
    }
    case "oasis-forts": {
      // Gentle basin; fort mesas are added as geometry, not heightfield.
      return (x, z) => fbm(x, z) * 1.6 - Math.exp(-(x * x + z * z) / 900) * 0.8;
    }
    case "valley": {
      // Narrow corridor along z with steep walls on both sides.
      return (x, z) => {
        const wall = Math.max(0, Math.abs(x) - 7) / 10;
        return fbm(x, z) * 2 + wall * wall * 16;
      };
    }
    case "arid-plain": {
      // Long low dunes and near-flat distance.
      return (x, z) =>
        fbm(x, z) * 1.4 + Math.sin(x * 0.09 + z * 0.05) * 0.55 + Math.max(0, -z - 20) * 0.06;
    }
    case "settlement": {
      // Gentle inhabited basin ringed by low rocky rises.
      return (x, z) => {
        const rim = Math.max(0, Math.hypot(x, z) - 26) / 12;
        return fbm(x, z) * 1.5 + rim * rim * 9;
      };
    }
    case "lanes": {
      // Flat valley floor; the lane walls are geometry, not heightfield.
      return (x, z) => fbm(x, z) * 0.9 + Math.max(0, Math.abs(x) - 12) * 0.22;
    }
    case "mountain-cave": {
      // Steep massif toward -z with the cave chamber near (10, -18).
      return (x, z) => {
        const ridge = Math.max(0, (-z - 2) / 26);
        const shoulder = Math.exp(-((x - 10) ** 2) / 220) * ridge * 3;
        return fbm(x, z) * 3 + ridge * ridge * 26 + shoulder;
      };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scene adapter                                                       */
/* ------------------------------------------------------------------ */

interface TerrainCallbacks {
  onNodeArrive: (nodeId: string) => void;
  onTravelState: (traveling: boolean) => void;
}

type TerrainEngineHandle = ThreeSceneHandle & {
  goToNode(index: number): void;
  resetView(): void;
};

function buildTerrainScene(
  context: ThreeRuntimeContext,
  config: TerrainSceneConfig,
  callbacks: TerrainCallbacks,
): TerrainEngineHandle {
  const renderer = context.renderer;
  const scene3 = new THREE.Scene();
  scene3.background = new THREE.Color(config.sky);
  scene3.fog = new THREE.Fog(new THREE.Color(config.fog), 26, 82);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
  const height = heightFactory(config);

  /* Lighting: warm key + cool ambient, shadows only when the tier allows. */
  const sun = new THREE.DirectionalLight(new THREE.Color(config.sun), 2.1);
  sun.position.set(-24, 32, 14);
  if (context.shadowsEnabled) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
  }
  scene3.add(sun);
  scene3.add(
    new THREE.HemisphereLight(new THREE.Color(config.sky), new THREE.Color(config.ground), 0.85),
  );

  /* Ground heightfield with vertex-color variation. */
  const segments = context.graphicsTier === "low" ? 72 : 110;
  const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color(config.ground);
  const rockC = new THREE.Color(config.rock);
  const tint = new THREE.Color();
  const noise = makeNoise(config.seed + 7);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = height(x, z);
    pos.setY(i, y);
    const mix = Math.min(1, Math.max(0, y / 14 + noise(x * 0.2, z * 0.2) * 0.35));
    tint.copy(base).lerp(rockC, mix);
    colors[i * 3] = tint.r;
    colors[i * 3 + 1] = tint.g;
    colors[i * 3 + 2] = tint.b;
  }
  groundGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = context.shadowsEnabled;
  scene3.add(ground);
  context.registerDisposable(() => {
    groundGeo.dispose();
    groundMat.dispose();
  });

  /* Scatter rocks; instanced for one draw call. */
  const random = mulberry(config.seed + 13);
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: rockC, roughness: 0.9 });
  const rockCount = context.graphicsTier === "low" ? 40 : 90;
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  for (let i = 0; i < rockCount; i += 1) {
    const x = (random() - 0.5) * (WORLD_SIZE - 12);
    const z = (random() - 0.5) * (WORLD_SIZE - 12);
    const s = 0.35 + random() * (config.kind === "mountain" ? 2.6 : 1.2);
    euler.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    quat.setFromEuler(euler);
    matrix.compose(
      new THREE.Vector3(x, height(x, z) + s * 0.25, z),
      quat,
      new THREE.Vector3(s, s * (0.6 + random() * 0.7), s),
    );
    rocks.setMatrixAt(i, matrix);
  }
  rocks.castShadow = context.shadowsEnabled;
  scene3.add(rocks);
  context.registerDisposable(() => {
    rockGeo.dispose();
    rockMat.dispose();
  });

  /* Kind-specific set dressing. */
  const dressingDisposables: Array<() => void> = [];
  if (config.kind === "oasis-forts") {
    // Fort mesas: stacked stone blocks on plinths — generic, not a documented fort.
    const fortMat = new THREE.MeshStandardMaterial({ color: rockC.clone().multiplyScalar(0.85), roughness: 0.95 });
    const fortGeo = new THREE.BoxGeometry(1, 1, 1);
    const forts: Array<[number, number, number, number]> = [
      [-12, -12, 7, 6],
      [9, -18, 5.5, 5],
      [-20, 4, 4.5, 4],
    ];
    for (const [fx, fz, w, h] of forts) {
      const plinth = new THREE.Mesh(fortGeo, fortMat);
      plinth.scale.set(w + 2, 1.2, w + 2);
      plinth.position.set(fx, height(fx, fz) + 0.6, fz);
      const tower = new THREE.Mesh(fortGeo, fortMat);
      tower.scale.set(w, h, w);
      tower.position.set(fx, height(fx, fz) + 1.2 + h / 2, fz);
      const crown = new THREE.Mesh(fortGeo, fortMat);
      crown.scale.set(w * 0.7, 1, w * 0.7);
      crown.position.set(fx, height(fx, fz) + 1.2 + h + 0.5, fz);
      for (const mesh of [plinth, tower, crown]) {
        mesh.castShadow = context.shadowsEnabled;
        scene3.add(mesh);
      }
    }
    dressingDisposables.push(() => {
      fortGeo.dispose();
      fortMat.dispose();
    });
    // Palm groves: cylinder trunk + cone fronds, instanced.
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 3.4, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4326, roughness: 1 });
    const frondGeo = new THREE.ConeGeometry(1.5, 1.1, 6);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e5d34, roughness: 0.9 });
    const palmCount = context.graphicsTier === "low" ? 18 : 34;
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, palmCount);
    const fronds = new THREE.InstancedMesh(frondGeo, frondMat, palmCount);
    for (let i = 0; i < palmCount; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 6 + random() * 22;
      const x = Math.cos(angle) * radius + 8;
      const z = Math.sin(angle) * radius - 2;
      const y = height(x, z);
      const lean = (random() - 0.5) * 0.16;
      euler.set(lean, random() * Math.PI, lean);
      quat.setFromEuler(euler);
      matrix.compose(new THREE.Vector3(x, y + 1.7, z), quat, new THREE.Vector3(1, 0.85 + random() * 0.4, 1));
      trunks.setMatrixAt(i, matrix);
      matrix.compose(new THREE.Vector3(x, y + 3.6, z), quat, new THREE.Vector3(1, 1, 1));
      fronds.setMatrixAt(i, matrix);
    }
    trunks.castShadow = context.shadowsEnabled;
    scene3.add(trunks, fronds);
    dressingDisposables.push(() => {
      trunkGeo.dispose();
      trunkMat.dispose();
      frondGeo.dispose();
      frondMat.dispose();
    });
  }
  if (config.kind === "trench") {
    // Spoil-bank stones along both lips so the cut reads clearly at night.
    const bankMat = new THREE.MeshStandardMaterial({ color: rockC.clone().multiplyScalar(1.1), roughness: 1 });
    const bankGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const bankCount = 60;
    const banks = new THREE.InstancedMesh(bankGeo, bankMat, bankCount);
    for (let i = 0; i < bankCount; i += 1) {
      const x = (i / bankCount - 0.5) * 60 + (random() - 0.5) * 2;
      const side = i % 2 === 0 ? 1 : -1;
      const z = side * (4.4 + random() * 0.8);
      const s = 0.5 + random() * 0.8;
      euler.set(random() * 3, random() * 3, random() * 3);
      quat.setFromEuler(euler);
      matrix.compose(new THREE.Vector3(x, height(x, z) + 0.2, z), quat, new THREE.Vector3(s, s * 0.6, s));
      banks.setMatrixAt(i, matrix);
    }
    scene3.add(banks);
    dressingDisposables.push(() => {
      bankGeo.dispose();
      bankMat.dispose();
    });
  }
  if (config.kind === "settlement" || config.kind === "lanes") {
    // Historically plausible generic dwellings: mud/stone blocks with flat
    // roofs and timber lintels. No documented house is claimed; no people.
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9a7d5c, roughness: 0.97 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x6b5138, roughness: 0.95 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a4326, roughness: 1 });
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const dwellings: Array<[number, number, number, number, number]> = [];
    if (config.kind === "settlement") {
      dwellings.push(
        [-10, -6, 4, 2.6, 3.4],
        [-4, -12, 3.4, 2.2, 3],
        [6, -8, 4.4, 2.8, 3.6],
        [12, -14, 3.2, 2.2, 2.8],
        [-14, 6, 3.6, 2.4, 3.2],
        [8, 4, 3.8, 2.5, 3.4],
        [0, -18, 5, 3, 4],
        [-8, 14, 3.2, 2.2, 3],
      );
    } else {
      // Lane walls: two staggered rows forming a narrow winding passage.
      for (let i = 0; i < 7; i += 1) {
        const z = 18 - i * 6;
        const wobble = Math.sin(i * 1.7) * 1.4;
        dwellings.push([-6 + wobble, z, 3.6, 3.4 + (i % 3) * 0.5, 5.2]);
        dwellings.push([6 - wobble, z - 2.5, 3.8, 3.1 + ((i + 1) % 3) * 0.6, 5.4]);
      }
    }
    for (const [dx, dz, w, h, d] of dwellings) {
      const body = new THREE.Mesh(boxGeo, wallMat);
      body.scale.set(w, h, d);
      body.position.set(dx, height(dx, dz) + h / 2, dz);
      const parapet = new THREE.Mesh(boxGeo, darkMat);
      parapet.scale.set(w + 0.3, 0.35, d + 0.3);
      parapet.position.set(dx, height(dx, dz) + h + 0.17, dz);
      const door = new THREE.Mesh(boxGeo, darkMat);
      door.scale.set(0.9, 1.6, 0.15);
      door.position.set(dx, height(dx, dz) + 0.8, dz + d / 2 + 0.06);
      const lintel = new THREE.Mesh(boxGeo, woodMat);
      lintel.scale.set(1.2, 0.18, 0.25);
      lintel.position.set(dx, height(dx, dz) + 1.72, dz + d / 2 + 0.1);
      for (const mesh of [body, parapet, door, lintel]) {
        mesh.castShadow = context.shadowsEnabled;
        scene3.add(mesh);
      }
    }
    dressingDisposables.push(() => {
      boxGeo.dispose();
      wallMat.dispose();
      darkMat.dispose();
      woodMat.dispose();
    });
    // Palms around settlements (generic oasis vegetation).
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 3.4, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4326, roughness: 1 });
    const frondGeo = new THREE.ConeGeometry(1.5, 1.1, 6);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e5d34, roughness: 0.9 });
    const palmCount = context.graphicsTier === "low" ? 14 : 26;
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, palmCount);
    const fronds = new THREE.InstancedMesh(frondGeo, frondMat, palmCount);
    for (let i = 0; i < palmCount; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 10 + random() * 18;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height(x, z);
      const lean = (random() - 0.5) * 0.16;
      euler.set(lean, random() * Math.PI, lean);
      quat.setFromEuler(euler);
      matrix.compose(new THREE.Vector3(x, y + 1.7, z), quat, new THREE.Vector3(1, 0.85 + random() * 0.4, 1));
      trunks.setMatrixAt(i, matrix);
      matrix.compose(new THREE.Vector3(x, y + 3.6, z), quat, new THREE.Vector3(1, 1, 1));
      fronds.setMatrixAt(i, matrix);
    }
    trunks.castShadow = context.shadowsEnabled;
    scene3.add(trunks, fronds);
    dressingDisposables.push(() => {
      trunkGeo.dispose();
      trunkMat.dispose();
      frondGeo.dispose();
      frondMat.dispose();
    });
    if (config.kind === "lanes") {
      // Simple market awnings: timber posts + fabric canopy (generic stalls).
      const postGeo = new THREE.CylinderGeometry(0.07, 0.09, 2.1, 5);
      const canopyGeo = new THREE.BoxGeometry(2.6, 0.08, 1.8);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x8a4f2e, roughness: 0.92 });
      const stalls: Array<[number, number]> = [
        [3, 2],
        [-3, -4],
        [2.5, -9],
      ];
      for (const [sx, sz] of stalls) {
        const y = height(sx, sz);
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(sx, y + 2.1, sz);
        canopy.rotation.z = 0.06;
        scene3.add(canopy);
        for (const ox of [-1.1, 1.1]) {
          for (const oz of [-0.7, 0.7]) {
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(sx + ox, y + 1.05, sz + oz);
            scene3.add(post);
          }
        }
      }
      dressingDisposables.push(() => {
        postGeo.dispose();
        canopyGeo.dispose();
        canopyMat.dispose();
      });
    }
    if (config.eventId === "arrival-madinah") {
      // First-mosque idea: open courtyard with palm-trunk columns and a
      // frond roof on one side — the sources' description, artistically.
      const colGeo = new THREE.CylinderGeometry(0.16, 0.2, 2.6, 6);
      const roofGeo = new THREE.BoxGeometry(8, 0.25, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x4c6b35, roughness: 1 });
      const courtX = -10;
      const courtZ = -10;
      const y0 = height(courtX, courtZ);
      for (let cx = 0; cx < 4; cx += 1) {
        for (let cz = 0; cz < 2; cz += 1) {
          const col = new THREE.Mesh(colGeo, trunkMat);
          col.position.set(courtX - 3 + cx * 2, y0 + 1.3, courtZ - 1.4 + cz * 2.8);
          col.castShadow = context.shadowsEnabled;
          scene3.add(col);
        }
      }
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(courtX, y0 + 2.75, courtZ);
      roof.castShadow = context.shadowsEnabled;
      scene3.add(roof);
      dressingDisposables.push(() => {
        colGeo.dispose();
        roofGeo.dispose();
        roofMat.dispose();
      });
    }
  }
  if (config.kind === "mountain-cave") {
    // Cave chamber near (10, -18): rock shell with an opening facing +z.
    const caveMat = new THREE.MeshStandardMaterial({ color: rockC.clone().multiplyScalar(0.7), roughness: 1, side: THREE.DoubleSide });
    const chamberGeo = new THREE.SphereGeometry(3.4, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const cx = 10;
    const cz = -18;
    const cy = height(cx, cz);
    const chamber = new THREE.Mesh(chamberGeo, caveMat);
    chamber.position.set(cx, cy + 0.4, cz);
    chamber.scale.set(1.15, 0.85, 1.25);
    scene3.add(chamber);
    // Boulder lips framing the mouth (opening toward +z where the lookout is).
    const lipGeo = new THREE.DodecahedronGeometry(1.4, 0);
    const lips: Array<[number, number, number]> = [
      [cx - 2.6, cy + 1, cz + 3.2],
      [cx + 2.6, cy + 1.2, cz + 3.2],
      [cx, cy + 3.1, cz + 3.4],
      [cx - 3.4, cy + 0.6, cz + 1],
      [cx + 3.4, cy + 0.8, cz + 1],
    ];
    for (const [lx, ly, lz] of lips) {
      const lip = new THREE.Mesh(lipGeo, caveMat);
      lip.position.set(lx, ly, lz);
      lip.rotation.set(random() * 3, random() * 3, random() * 3);
      lip.castShadow = context.shadowsEnabled;
      scene3.add(lip);
    }
    // Stepping stones up the approach path (artistic, not the actual route).
    const stepGeo = new THREE.BoxGeometry(1.6, 0.22, 1.1);
    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const sx = 1 + t * 8;
      const sz = 16 - t * 28;
      const step = new THREE.Mesh(stepGeo, caveMat);
      step.position.set(sx, height(sx, sz) + 0.12, sz);
      step.rotation.y = (random() - 0.5) * 0.4;
      scene3.add(step);
    }
    dressingDisposables.push(() => {
      chamberGeo.dispose();
      lipGeo.dispose();
      stepGeo.dispose();
      caveMat.dispose();
    });
  }
  context.registerDisposable(() => {
    for (const dispose of dressingDisposables) dispose();
  });

  /* Observer-node beacons: a brass ring + light column per station. */
  const beaconGeo = new THREE.TorusGeometry(0.9, 0.06, 8, 40);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    emissive: 0x8a6a10,
    emissiveIntensity: 0.7,
    roughness: 0.4,
    metalness: 0.6,
  });
  const beamGeo = new THREE.CylinderGeometry(0.05, 0.12, 3.2, 6, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, transparent: true, opacity: 0.28, depthWrite: false });
  const beacons: THREE.Mesh[] = [];
  const beaconGroup = new THREE.Group();
  for (const node of config.nodes) {
    const [x, , z] = node.position;
    const y = height(x, z);
    const ring = new THREE.Mesh(beaconGeo, beaconMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y + 0.12, z);
    ring.userData.nodeId = node.id;
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, y + 1.7, z);
    beaconGroup.add(ring, beam);
    beacons.push(ring);
  }
  scene3.add(beaconGroup);
  context.registerDisposable(() => {
    beaconGeo.dispose();
    beaconMat.dispose();
    beamGeo.dispose();
    beamMat.dispose();
  });

  /* Camera state: station-anchored look-around + eased node travel. */
  let currentIndex = 0;
  let yaw = 0;
  let pitch = 0;
  let travel: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    lookFrom: THREE.Vector3;
    lookTo: THREE.Vector3;
    t: number;
    index: number;
  } | null = null;
  const eye = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const nodeEye = (node: TerrainNode) => {
    const [x, dy, z] = node.position;
    return new THREE.Vector3(x, height(x, z) + dy, z);
  };
  const applyStation = (index: number) => {
    const node = config.nodes[index];
    eye.copy(nodeEye(node));
    look.set(...node.lookAt);
    tmp.copy(look).sub(eye);
    yaw = Math.atan2(-tmp.x, -tmp.z);
    pitch = Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z));
  };
  applyStation(0);

  const goTo = (index: number) => {
    const clamped = Math.min(Math.max(0, index), config.nodes.length - 1);
    if (clamped === currentIndex && !travel) return;
    const node = config.nodes[clamped];
    if (context.motion === "reduced") {
      currentIndex = clamped;
      travel = null;
      applyStation(clamped);
      callbacks.onNodeArrive(node.id);
      context.invalidate();
      return;
    }
    travel = {
      from: eye.clone(),
      to: nodeEye(node),
      lookFrom: look.clone(),
      lookTo: new THREE.Vector3(...node.lookAt),
      t: 0,
      index: clamped,
    };
    callbacks.onTravelState(true);
    context.invalidate();
  };

  /* Drag-to-look (pointer) — bounded pitch, no free flight. */
  const canvas = renderer.domElement;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    // Synthetic pointers (tests/automation) have no active pointer to capture.
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Drag-look still works without capture.
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || travel) return;
    yaw -= (event.clientX - lastX) * 0.0042;
    pitch = Math.min(1.15, Math.max(-1.15, pitch + (event.clientY - lastY) * 0.0032));
    lastX = event.clientX;
    lastY = event.clientY;
    context.invalidate();
  };
  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener("pointerdown", onPointerDown, { signal: context.signal });
  canvas.addEventListener("pointermove", onPointerMove, { signal: context.signal });
  canvas.addEventListener("pointerup", onPointerUp, { signal: context.signal });
  canvas.addEventListener("pointercancel", onPointerUp, { signal: context.signal });

  /* Click a beacon to travel to its station. */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const onClick = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(beacons, false);
    const nodeId = hits[0]?.object.userData.nodeId as string | undefined;
    if (!nodeId) return;
    const index = config.nodes.findIndex((node) => node.id === nodeId);
    if (index >= 0) goTo(index);
  };
  canvas.addEventListener("click", onClick, { signal: context.signal });

  const easeInOut = (t: number) => t * t * (3 - 2 * t);

  return {
    frame(delta) {
      if (travel) {
        travel.t = Math.min(1, travel.t + delta / 1.6);
        const k = easeInOut(travel.t);
        eye.lerpVectors(travel.from, travel.to, k);
        // Arc the path slightly upward so travel reads as movement, not a slide.
        eye.y += Math.sin(k * Math.PI) * 1.4;
        look.lerpVectors(travel.lookFrom, travel.lookTo, k);
        if (travel.t >= 1) {
          currentIndex = travel.index;
          travel = null;
          applyStation(currentIndex);
          callbacks.onTravelState(false);
          callbacks.onNodeArrive(config.nodes[currentIndex].id);
        }
      }
      const cosPitch = Math.cos(pitch);
      camera.position.copy(eye);
      camera.lookAt(
        eye.x - Math.sin(yaw) * cosPitch * 10,
        eye.y + Math.sin(pitch) * 10,
        eye.z - Math.cos(yaw) * cosPitch * 10,
      );
      renderer.render(scene3, camera);
    },
    resize(width, heightPx) {
      camera.aspect = width / heightPx;
      camera.updateProjectionMatrix();
      context.invalidate();
    },
    setMotion(motion) {
      if (motion === "reduced" && travel) {
        currentIndex = travel.index;
        travel = null;
        applyStation(currentIndex);
        callbacks.onTravelState(false);
        callbacks.onNodeArrive(config.nodes[currentIndex].id);
      }
      context.invalidate();
    },
    dispose() {
      scene3.clear();
    },
    goToNode: goTo,
    resetView() {
      applyStation(currentIndex);
      context.invalidate();
    },
  };
}

/* ------------------------------------------------------------------ */
/* React shell — one runtime, engine captured in the adapter closure   */
/* ------------------------------------------------------------------ */

export function TerrainTheatre3D({ scene: config, onExit, onUnavailable }: TerrainTheatre3DProps) {
  const effectiveMotion = useEffectiveMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const engineRef = useRef<TerrainEngineHandle | null>(null);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [traveling, setTraveling] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    setNodeIndex(0);
    setTraveling(false);
    const runtime = new ThreeRuntime({
      host,
      motion: effectiveMotion,
      adapter: {
        build: (context) => {
          const handle = buildTerrainScene(context, config, {
            onNodeArrive: (nodeId) => {
              if (disposed) return;
              const index = config.nodes.findIndex((node) => node.id === nodeId);
              if (index >= 0) setNodeIndex(index);
            },
            onTravelState: (isTraveling) => {
              if (!disposed) setTraveling(isTraveling);
            },
          });
          engineRef.current = handle;
          return handle;
        },
      },
      onFallback: () => {
        if (disposed) return;
        setFailed(true);
        unavailableRef.current();
      },
    });
    runtimeRef.current = runtime;
    void runtime.start();
    return () => {
      disposed = true;
      engineRef.current = null;
      runtimeRef.current = null;
      runtime.stop();
    };
    // Motion is synced through the effect below; rebuilding on motion change
    // would tear down live geometry for no benefit.
  }, [config.eventId]);

  useEffect(() => {
    runtimeRef.current?.setMotion(effectiveMotion);
  }, [effectiveMotion]);

  const goTo = useCallback(
    (index: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const clamped = Math.min(Math.max(0, index), config.nodes.length - 1);
      setNodeIndex(clamped);
      engine.goToNode(clamped);
    },
    [config.nodes.length],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(nodeIndex + 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(nodeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(config.nodes.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onExit();
    }
  };

  const node = config.nodes[nodeIndex];

  if (failed) return null;

  return (
    <section
      className={styles.theatre}
      data-visual="seerah-terrain-theatre"
      data-terrain={config.eventId}
      data-node={node.id}
      aria-label={`بيئة ${config.eventId} ثلاثية الأبعاد — مراقب محايد`}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div ref={hostRef} className={styles.canvasHost} data-visual="seerah-terrain-canvas" />

      <div className={styles.hud}>
        <div className={styles.hudTop}>
          <span className={styles.badge}>
            <Compass size={13} aria-hidden /> بيئة ثلاثية الأبعاد — مراقب محايد
          </span>
          <div className={styles.hudActions}>
            <button
              type="button"
              className={styles.hudButton}
              onClick={() => engineRef.current?.resetView()}
              aria-label="إعادة ضبط النظر"
            >
              <RotateCcw size={14} aria-hidden />
            </button>
            <button type="button" className={styles.hudButton} onClick={onExit} aria-label="الخروج إلى القراءة">
              <LogOut size={14} aria-hidden /> خروج
            </button>
          </div>
        </div>

        <div className={styles.stationNote} aria-live="polite">
          <strong>{node.labelAr}</strong>
          <p>{node.noteAr}</p>
        </div>

        <div className={styles.travelRow}>
          <button
            type="button"
            className={styles.travelButton}
            onClick={() => goTo(nodeIndex - 1)}
            disabled={nodeIndex === 0 || traveling}
            aria-label="المحطة السابقة"
          >
            <ChevronRight size={16} aria-hidden /> السابقة
          </button>
          <div className={styles.nodeRail} role="tablist" aria-label="محطات المراقبة">
            {config.nodes.map((candidate, index) => (
              <button
                key={candidate.id}
                type="button"
                role="tab"
                aria-selected={index === nodeIndex}
                className={`${styles.nodeChip} ${index === nodeIndex ? styles.nodeChipOn : ""}`}
                onClick={() => goTo(index)}
                disabled={traveling}
              >
                {candidate.labelAr}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.travelButton}
            onClick={() => goTo(nodeIndex + 1)}
            disabled={nodeIndex === config.nodes.length - 1 || traveling}
            aria-label="المحطة التالية"
          >
            التالية <ChevronLeft size={16} aria-hidden />
          </button>
        </div>

        <p className={styles.disclosure}>{config.disclosureAr}</p>
        <p className={styles.hint}>اسحب للنظر حولك · الأسهم للتنقل · انقر الحلقة النحاسية للانتقال · Esc للخروج</p>
      </div>
    </section>
  );
}

TerrainTheatre3D.displayName = "TerrainTheatre3D";
