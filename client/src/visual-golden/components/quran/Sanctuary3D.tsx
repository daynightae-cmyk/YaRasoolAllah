/**
 * Sanctuary3D — genuine 3D interior reading environment (directive §4.D).
 *
 * Builds real Three.js architecture (pointed arches, stone columns,
 * mashrabiya light window, carved rehal, brass lanterns, governed quiet)
 * on the bounded ThreeRuntime. The visitor is a neutral reader who:
 * - drags to look around from the current station,
 * - travels between linked stations via the node rail / travel buttons /
 *   keyboard (ArrowLeft/ArrowRight in RTL, Home/End), or by clicking a beacon,
 * - reads canonical scripture in the DOM overlay slot (never scene textures),
 * - exits back to the full reading surface at any time (button or Escape).
 *
 * Honesty: the space is a contemporary artistic interior inspired by Islamic
 * architecture — not a reconstruction of a documented historical building.
 * No Quran text is rendered into geometry or textures; the governed text
 * stays in the caller's DOM reading surfaces.
 *
 * Engine rules (three-runtime-contract): no renderer creation, no rAF, no
 * matchMedia here — ThreeRuntime owns scheduling, visibility and cleanup.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Compass, LogOut, RotateCcw } from "lucide-react";
import * as THREE from "three";
import {
  ThreeRuntime,
  type ThreeRuntimeContext,
  type ThreeSceneHandle,
} from "@/visual-golden/components/three/three-runtime";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { InteriorSceneConfig, InteriorNode } from "@/visual-golden/services/interior-scenes";
import styles from "./Sanctuary3D.module.css";

interface Sanctuary3DProps {
  scene: InteriorSceneConfig;
  /** The caller's reading lamp preference drives real scene lighting. */
  lampOn: boolean;
  /** DOM reading card rendered over the scene — canonical text lives here. */
  overlay?: ReactNode;
  onExit: () => void;
  /** Called when WebGL cannot run; caller keeps its normal reading surface. */
  onUnavailable: () => void;
}

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
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

/* ------------------------------------------------------------------ */
/* Pointed-arch geometry (real shape, extruded — not a texture)        */
/* ------------------------------------------------------------------ */

/**
 * A framed pointed (ogee-simplified) arch: outer rectangle with a pointed
 * opening cut as a shape hole. Span lies on local X, height on local Y.
 */
function pointedArchGeometry(span: number, height: number, depth: number, frame: number) {
  const outer = new THREE.Shape();
  outer.moveTo(-span / 2, 0);
  outer.lineTo(span / 2, 0);
  outer.lineTo(span / 2, height);
  outer.lineTo(-span / 2, height);
  outer.closePath();

  const half = span / 2 - frame;
  const spring = height * 0.52;
  const apex = height - frame;
  const hole = new THREE.Path();
  hole.moveTo(-half, 0);
  hole.lineTo(-half, spring);
  // Two circular-ish arcs meeting at a point — the classic pointed profile.
  hole.quadraticCurveTo(-half, apex * 0.92, 0, apex);
  hole.quadraticCurveTo(half, apex * 0.92, half, spring);
  hole.lineTo(half, 0);
  hole.closePath();
  outer.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Scene adapter                                                       */
/* ------------------------------------------------------------------ */

interface SanctuaryCallbacks {
  onNodeArrive: (nodeId: string) => void;
  onTravelState: (traveling: boolean) => void;
}

type SanctuaryEngineHandle = ThreeSceneHandle & {
  goToNode(index: number): void;
  resetView(): void;
  setLamp(on: boolean): void;
};

function buildSanctuaryScene(
  context: ThreeRuntimeContext,
  config: InteriorSceneConfig,
  initialLamp: boolean,
  callbacks: SanctuaryCallbacks,
): SanctuaryEngineHandle {
  const renderer = context.renderer;
  const scene3 = new THREE.Scene();
  const ink = new THREE.Color("#050d0c");
  scene3.background = ink;
  scene3.fog = new THREE.Fog(ink, 20, 46);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 90);
  const random = mulberry(config.seed);
  const disposables: Array<() => void> = [];
  const track = <T extends { dispose(): void }>(resource: T): T => {
    disposables.push(() => resource.dispose());
    return resource;
  };

  const wallC = new THREE.Color(config.wall);
  const floorC = new THREE.Color(config.floor);
  const accentC = new THREE.Color(config.accent);
  const lanternC = new THREE.Color(config.lantern);
  const stoneC = wallC.clone().lerp(new THREE.Color("#cfc4a6"), 0.55);
  const woodC = new THREE.Color("#5a3d22");

  const ROOM = 13; // half-extent; walls at ±13
  const WALL_H = 6.4;

  /* --- Materials --- */
  const wallMat = track(new THREE.MeshStandardMaterial({ color: wallC, roughness: 0.92 }));
  const stoneMat = track(new THREE.MeshStandardMaterial({ color: stoneC, roughness: 0.85 }));
  const goldMat = track(new THREE.MeshStandardMaterial({
    color: accentC, roughness: 0.35, metalness: 0.75,
    emissive: accentC.clone().multiplyScalar(0.12),
  }));
  const woodMat = track(new THREE.MeshStandardMaterial({ color: woodC, roughness: 0.8 }));
  const ivoryMat = track(new THREE.MeshStandardMaterial({ color: "#f3e9d2", roughness: 0.7 }));
  const emeraldMat = track(new THREE.MeshStandardMaterial({ color: "#123f33", roughness: 0.95 }));
  const glowMat = track(new THREE.MeshStandardMaterial({
    color: lanternC, emissive: lanternC, emissiveIntensity: 1.6, roughness: 0.6,
  }));
  const windowGlowMat = track(new THREE.MeshStandardMaterial({
    color: "#ffe6b8", emissive: new THREE.Color("#ffdba0"), emissiveIntensity: 1.4, roughness: 0.8,
  }));

  /* --- Floor: polished stone with subtle vertex variation --- */
  const floorGeo = track(new THREE.PlaneGeometry(ROOM * 2, ROOM * 2, 40, 40));
  floorGeo.rotateX(-Math.PI / 2);
  {
    const pos = floorGeo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const checker = (Math.floor((x + ROOM) / 2.6) + Math.floor((z + ROOM) / 2.6)) % 2;
      tint.copy(floorC).multiplyScalar(checker ? 1 : 1.18);
      tint.lerp(stoneC, 0.06 + random() * 0.05);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }
    floorGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }
  const floorMat = track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.12 }));
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.receiveShadow = context.shadowsEnabled;
  scene3.add(floor);

  /* --- Walls + gold trim + ceiling beams --- */
  const wallGeo = track(new THREE.BoxGeometry(1, 1, 1));
  const addSlab = (
    material: THREE.Material,
    x: number, y: number, z: number,
    w: number, h: number, d: number,
  ) => {
    const mesh = new THREE.Mesh(wallGeo, material);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.castShadow = context.shadowsEnabled;
    mesh.receiveShadow = context.shadowsEnabled;
    scene3.add(mesh);
    return mesh;
  };
  addSlab(wallMat, 0, WALL_H / 2, -ROOM, ROOM * 2, WALL_H, 0.5); // back (mihrab)
  addSlab(wallMat, -ROOM, WALL_H / 2, 0, 0.5, WALL_H, ROOM * 2); // left (window)
  addSlab(wallMat, ROOM, WALL_H / 2, 0, 0.5, WALL_H, ROOM * 2); // right (shelves)
  addSlab(wallMat, 0, WALL_H / 2, ROOM, ROOM * 2, WALL_H, 0.5); // front (entrance)
  addSlab(wallMat, 0, WALL_H + 0.2, 0, ROOM * 2, 0.4, ROOM * 2); // ceiling
  // Gold trim line running around the walls.
  for (const [x, z, w, d] of [
    [0, -ROOM + 0.3, ROOM * 2, 0.12],
    [0, ROOM - 0.3, ROOM * 2, 0.12],
    [-ROOM + 0.3, 0, 0.12, ROOM * 2],
    [ROOM - 0.3, 0, 0.12, ROOM * 2],
  ] as const) {
    addSlab(goldMat, x, WALL_H - 0.7, z, w, 0.1, d);
  }
  // Timber ceiling beams across the hall.
  for (const z of [-8, -3, 2, 7]) {
    addSlab(woodMat, 0, WALL_H - 0.12, z, ROOM * 2 - 1, 0.26, 0.4);
  }

  /* --- Colonnade: stone columns + pointed arches along both sides --- */
  const colGeo = track(new THREE.CylinderGeometry(0.42, 0.5, 4.4, 12));
  const baseGeo = track(new THREE.BoxGeometry(1.3, 0.35, 1.3));
  const capGeo = track(new THREE.BoxGeometry(1.15, 0.4, 1.15));
  const archGeo = track(pointedArchGeometry(5, 2.3, 0.5, 0.42));
  for (const side of [-9, 9]) {
    for (const z of [-8, -3, 2, 7]) {
      const base = new THREE.Mesh(baseGeo, stoneMat);
      base.position.set(side, 0.175, z);
      const shaft = new THREE.Mesh(colGeo, stoneMat);
      shaft.position.set(side, 0.35 + 2.2, z);
      const cap = new THREE.Mesh(capGeo, goldMat);
      cap.position.set(side, 4.75, z);
      for (const mesh of [base, shaft, cap]) {
        mesh.castShadow = context.shadowsEnabled;
        scene3.add(mesh);
      }
    }
    // Arches span between consecutive columns (5 units apart along z).
    for (const z of [-5.5, -0.5, 4.5]) {
      const arch = new THREE.Mesh(archGeo, stoneMat);
      arch.rotation.y = Math.PI / 2;
      arch.position.set(side, 4.95, z);
      arch.castShadow = context.shadowsEnabled;
      scene3.add(arch);
    }
  }

  /* --- Mihrab: grand pointed frame + luminous niche on the back wall --- */
  const mihrabGeo = track(pointedArchGeometry(4.6, 5.4, 0.6, 0.55));
  const mihrab = new THREE.Mesh(mihrabGeo, goldMat);
  mihrab.position.set(0, 0, -ROOM + 0.55);
  scene3.add(mihrab);
  const nicheGeo = track(new THREE.CylinderGeometry(1.55, 1.55, 4.2, 16, 1, true, 0, Math.PI));
  const nicheMat = track(new THREE.MeshStandardMaterial({
    color: wallC.clone().multiplyScalar(0.7), roughness: 0.9, side: THREE.DoubleSide,
  }));
  const niche = new THREE.Mesh(nicheGeo, nicheMat);
  niche.rotation.y = Math.PI / 2;
  niche.position.set(0, 2.1, -ROOM + 0.5);
  scene3.add(niche);
  const nicheGlowGeo = track(new THREE.PlaneGeometry(2.6, 3.6));
  const nicheGlow = new THREE.Mesh(nicheGlowGeo, windowGlowMat);
  nicheGlow.position.set(0, 2.2, -ROOM + 0.32);
  scene3.add(nicheGlow);

  /* --- Entrance arch on the front wall --- */
  const entranceGeo = track(pointedArchGeometry(4.2, 5, 0.6, 0.5));
  const entrance = new THREE.Mesh(entranceGeo, stoneMat);
  entrance.position.set(0, 0, ROOM - 0.55);
  scene3.add(entrance);
  const doorDarkGeo = track(new THREE.PlaneGeometry(3.2, 4.4));
  const doorDarkMat = track(new THREE.MeshBasicMaterial({ color: "#03080a" }));
  const doorDark = new THREE.Mesh(doorDarkGeo, doorDarkMat);
  doorDark.rotation.y = Math.PI;
  doorDark.position.set(0, 2.2, ROOM - 0.3);
  scene3.add(doorDark);

  /* --- Mashrabiya light window on the left wall --- */
  const winGlowGeo = track(new THREE.PlaneGeometry(3.6, 4.2));
  const winGlow = new THREE.Mesh(winGlowGeo, windowGlowMat);
  winGlow.rotation.y = Math.PI / 2;
  winGlow.position.set(-ROOM + 0.32, 3.1, -3.4);
  scene3.add(winGlow);
  const winFrameGeo = track(pointedArchGeometry(4.2, 4.9, 0.35, 0.4));
  const winFrame = new THREE.Mesh(winFrameGeo, goldMat);
  winFrame.rotation.y = Math.PI / 2;
  winFrame.position.set(-ROOM + 0.5, 0.6, -3.4);
  scene3.add(winFrame);
  // Geometric lattice: verticals, horizontals and diagonals — real bars.
  const barGeo = track(new THREE.BoxGeometry(0.06, 1, 0.06));
  const lattice = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const bar = new THREE.Mesh(barGeo, woodMat);
    bar.scale.set(1, 4.1, 1);
    bar.position.set(-ROOM + 0.62, 3.05, -5.1 + i * 0.57);
    lattice.add(bar);
  }
  for (let i = 0; i < 8; i += 1) {
    const bar = new THREE.Mesh(barGeo, woodMat);
    bar.rotation.x = Math.PI / 2;
    bar.scale.set(1, 3.5, 1);
    bar.position.set(-ROOM + 0.62, 1.25 + i * 0.53, -3.4);
    lattice.add(bar);
  }
  for (let i = 0; i < 6; i += 1) {
    for (const dir of [-1, 1]) {
      const bar = new THREE.Mesh(barGeo, woodMat);
      bar.rotation.x = dir * Math.PI / 4;
      bar.scale.set(0.8, 1.05, 0.8);
      bar.position.set(-ROOM + 0.6, 1.55 + i * 0.62, -3.4 + (i % 2 ? 0.85 : -0.85));
      lattice.add(bar);
    }
  }
  scene3.add(lattice);

  /* --- Light shaft from the window (subtle additive volume) --- */
  const shaftGeo = track(new THREE.ConeGeometry(2.6, 10, 4, 1, true));
  const shaftMat = track(new THREE.MeshBasicMaterial({
    color: "#ffdba0", transparent: true, opacity: 0.05,
    depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  }));
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.rotation.z = -Math.PI / 2.6;
  shaft.position.set(-8.4, 2.4, -3.4);
  scene3.add(shaft);

  /* --- Prayer rug + carved rehal + open mushaf shape (no text) --- */
  const rugGeo = track(new THREE.CircleGeometry(3.4, 48));
  rugGeo.rotateX(-Math.PI / 2);
  const rug = new THREE.Mesh(rugGeo, emeraldMat);
  rug.position.set(0, 0.02, -2.4);
  rug.receiveShadow = context.shadowsEnabled;
  scene3.add(rug);
  for (const radius of [3.2, 2.55]) {
    const ringGeo = track(new THREE.RingGeometry(radius - 0.07, radius, 48));
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.position.set(0, 0.035, -2.4);
    scene3.add(ring);
  }
  // Rehal: two crossed carved boards.
  const boardGeo = track(new THREE.BoxGeometry(2.3, 0.14, 0.62));
  for (const tilt of [-0.62, 0.62]) {
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.rotation.z = tilt;
    board.position.set(0, 0.62, -2.4);
    board.castShadow = context.shadowsEnabled;
    scene3.add(board);
  }
  const stretcherGeo = track(new THREE.BoxGeometry(0.5, 0.1, 1.5));
  const stretcher = new THREE.Mesh(stretcherGeo, woodMat);
  stretcher.position.set(0, 0.35, -2.4);
  scene3.add(stretcher);
  // Open mushaf: emerald cover + two ivory page blocks. Deliberately blank —
  // scripture is never painted into the scene; the DOM overlay carries it.
  const coverGeo = track(new THREE.BoxGeometry(2.15, 0.07, 1.5));
  const cover = new THREE.Mesh(coverGeo, emeraldMat);
  cover.position.set(0, 1.12, -2.4);
  cover.rotation.x = -0.12;
  scene3.add(cover);
  const pageGeo = track(new THREE.BoxGeometry(0.98, 0.06, 1.38));
  for (const side of [-1, 1]) {
    const page = new THREE.Mesh(pageGeo, ivoryMat);
    page.position.set(side * 0.52, 1.2, -2.4);
    page.rotation.z = side * -0.16;
    page.rotation.x = -0.12;
    page.castShadow = context.shadowsEnabled;
    scene3.add(page);
  }
  const spineGeo = track(new THREE.BoxGeometry(0.1, 0.09, 1.44));
  const spine = new THREE.Mesh(spineGeo, goldMat);
  spine.position.set(0, 1.17, -2.4);
  spine.rotation.x = -0.12;
  scene3.add(spine);

  /* --- Book wall on the right: shelves + instanced bindings --- */
  const shelfGeo = track(new THREE.BoxGeometry(0.5, 0.1, 10));
  for (const y of [1.1, 2.2, 3.3, 4.4]) {
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(ROOM - 0.6, y, -2);
    shelf.castShadow = context.shadowsEnabled;
    scene3.add(shelf);
  }
  const bookGeo = track(new THREE.BoxGeometry(0.34, 1, 0.16));
  const bookMat = track(new THREE.MeshStandardMaterial({ roughness: 0.85 }));
  const bookCount = context.graphicsTier === "low" ? 120 : 220;
  const books = new THREE.InstancedMesh(bookGeo, bookMat, bookCount);
  const bookPalette = ["#1d4a3c", "#5a3d22", "#7a1f24", "#274156", "#8a6a10", "#3c2f4a"].map(
    (hex) => new THREE.Color(hex),
  );
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const bookColor = new THREE.Color();
  for (let i = 0; i < bookCount; i += 1) {
    const shelfIndex = i % 4;
    const slot = Math.floor(i / 4);
    const h = 0.62 + random() * 0.3;
    const z = -6.7 + slot * 0.19 + (random() - 0.5) * 0.02;
    euler.set(0, (random() - 0.5) * 0.06, (random() - 0.5) * 0.05);
    quat.setFromEuler(euler);
    matrix.compose(
      new THREE.Vector3(ROOM - 0.62, 1.15 + shelfIndex * 1.1 + h / 2, z),
      quat,
      new THREE.Vector3(1, h, 0.8 + random() * 0.4),
    );
    books.setMatrixAt(i, matrix);
    bookColor.copy(bookPalette[Math.floor(random() * bookPalette.length)]);
    books.setColorAt(i, bookColor);
  }
  books.castShadow = context.shadowsEnabled;
  scene3.add(books);

  /* --- Brass lanterns: hanging + mihrab sconces + floor lanterns --- */
  const lanternBodyGeo = track(new THREE.CylinderGeometry(0.26, 0.34, 0.72, 8));
  const lanternCapGeo = track(new THREE.ConeGeometry(0.3, 0.3, 8));
  const chainGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1, 4));
  const lanternPositions: Array<[number, number, number, boolean]> = [
    [0, 4.1, -2.4, true], // hanging above the rehal (chain to ceiling)
    [-3.1, 2.7, -ROOM + 0.8, false],
    [3.1, 2.7, -ROOM + 0.8, false],
    [-11.2, 0.75, 4.6, false],
    [11.2, 0.75, -9.2, false],
  ];
  for (const [x, y, z, hanging] of lanternPositions) {
    const body = new THREE.Mesh(lanternBodyGeo, glowMat);
    body.position.set(x, y, z);
    const cap = new THREE.Mesh(lanternCapGeo, goldMat);
    cap.position.set(x, y + 0.5, z);
    scene3.add(body, cap);
    if (hanging) {
      const chain = new THREE.Mesh(chainGeo, goldMat);
      chain.scale.y = WALL_H - (y + 0.65);
      chain.position.set(x, y + 0.65 + chain.scale.y / 2, z);
      scene3.add(chain);
    }
  }

  /* --- Lighting: one warm key point light + window sun + soft ambient --- */
  const lampLight = new THREE.PointLight(lanternC, 2.4, 24, 1.6);
  lampLight.position.set(0, 4.0, -2.4);
  if (context.shadowsEnabled) {
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(1024, 1024);
  }
  scene3.add(lampLight);
  const windowSun = new THREE.DirectionalLight(new THREE.Color("#ffdba0"), 1.5);
  windowSun.position.set(-22, 7, -3.4);
  windowSun.target.position.set(2, 0, -2);
  scene3.add(windowSun, windowSun.target);
  const ambient = new THREE.HemisphereLight(new THREE.Color("#2a4a42"), floorC, 0.5);
  scene3.add(ambient);

  /* --- Dust motes drifting in the light shaft (full motion only) --- */
  const moteCount = context.graphicsTier === "low" ? 60 : 130;
  const moteGeo = track(new THREE.BufferGeometry());
  const motePositions = new Float32Array(moteCount * 3);
  const moteSpeeds = new Float32Array(moteCount);
  for (let i = 0; i < moteCount; i += 1) {
    motePositions[i * 3] = -12 + random() * 9;
    motePositions[i * 3 + 1] = 0.4 + random() * 4.4;
    motePositions[i * 3 + 2] = -6 + random() * 5.4;
    moteSpeeds[i] = 0.05 + random() * 0.12;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMat = track(new THREE.PointsMaterial({
    color: "#ffe6b8", size: 0.035, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const motes = new THREE.Points(moteGeo, moteMat);
  scene3.add(motes);

  /* --- Station beacons: brass ring + light column --- */
  const beaconGeo = track(new THREE.TorusGeometry(0.75, 0.05, 8, 40));
  const beaconMat = track(new THREE.MeshStandardMaterial({
    color: accentC, emissive: accentC.clone().multiplyScalar(0.5),
    emissiveIntensity: 0.8, roughness: 0.4, metalness: 0.6,
  }));
  const beamGeo = track(new THREE.CylinderGeometry(0.04, 0.1, 2.4, 6, 1, true));
  const beamMat = track(new THREE.MeshBasicMaterial({
    color: "#e8c547", transparent: true, opacity: 0.22, depthWrite: false,
  }));
  const beacons: THREE.Mesh[] = [];
  for (const node of config.nodes) {
    const [x, , z] = node.position;
    const ring = new THREE.Mesh(beaconGeo, beaconMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.1, z);
    ring.userData.nodeId = node.id;
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, 1.3, z);
    scene3.add(ring, beam);
    beacons.push(ring);
  }

  /* --- Lamp state: the caller's reading lamp drives real light levels --- */
  let lampTarget = initialLamp ? 1 : 0;
  let lampLevel = lampTarget;
  const applyLamp = () => {
    const lit = 0.12 + lampLevel * 0.88;
    lampLight.intensity = 2.4 * lit;
    windowSun.intensity = 0.25 + lampLevel * 1.25;
    glowMat.emissiveIntensity = 0.25 + lampLevel * 1.35;
    windowGlowMat.emissiveIntensity = 0.2 + lampLevel * 1.2;
    shaftMat.opacity = 0.012 + lampLevel * 0.045;
    moteMat.opacity = 0.15 + lampLevel * 0.4;
    ambient.intensity = 0.32 + lampLevel * 0.18;
  };
  applyLamp();

  /* --- Camera: station-anchored look-around + eased node travel --- */
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

  const nodeEye = (node: InteriorNode) => new THREE.Vector3(...node.position);
  const publishLook = () => {
    // Bounded diagnostics for browser evidence — written on interaction end,
    // never per frame.
    context.host.dataset.look = `${yaw.toFixed(2)},${pitch.toFixed(2)}`;
  };
  const applyStation = (index: number) => {
    const node = config.nodes[index];
    eye.copy(nodeEye(node));
    look.set(...node.lookAt);
    tmp.copy(look).sub(eye);
    yaw = Math.atan2(-tmp.x, -tmp.z);
    pitch = Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z));
    publishLook();
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

  /* Drag-to-look — bounded pitch, no free flight through walls. */
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
    pitch = Math.min(1.1, Math.max(-1.1, pitch + (event.clientY - lastY) * 0.0032));
    lastX = event.clientX;
    lastY = event.clientY;
    context.invalidate();
  };
  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    publishLook();
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
  let flickerPhase = random() * 10;

  context.registerDisposable(() => {
    for (const dispose of disposables) dispose();
  });

  return {
    frame(delta, elapsed) {
      if (travel) {
        travel.t = Math.min(1, travel.t + delta / 1.5);
        const k = easeInOut(travel.t);
        eye.lerpVectors(travel.from, travel.to, k);
        eye.y += Math.sin(k * Math.PI) * 0.22; // gentle walking bob, not a slide
        look.lerpVectors(travel.lookFrom, travel.lookTo, k);
        if (travel.t >= 1) {
          currentIndex = travel.index;
          travel = null;
          applyStation(currentIndex);
          callbacks.onTravelState(false);
          callbacks.onNodeArrive(config.nodes[currentIndex].id);
        }
      }
      // Smooth lamp transitions + a barely-there candle flicker (full motion).
      if (Math.abs(lampLevel - lampTarget) > 0.002) {
        lampLevel += (lampTarget - lampLevel) * Math.min(1, delta * 5);
        applyLamp();
      }
      if (context.motion === "full") {
        flickerPhase += delta;
        const flicker = 1 + Math.sin(elapsed * 2.3 + flickerPhase) * 0.035;
        lampLight.intensity = 2.4 * (0.12 + lampLevel * 0.88) * flicker;
        const pos = moteGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < moteCount; i += 1) {
          let y = pos.getY(i) + moteSpeeds[i] * delta;
          if (y > 4.9) y = 0.4;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
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
    setLamp(on: boolean) {
      lampTarget = on ? 1 : 0;
      if (context.motion === "reduced") {
        lampLevel = lampTarget;
        applyLamp();
      }
      context.invalidate();
    },
  };
}

/* ------------------------------------------------------------------ */
/* React shell — one runtime, engine captured in the adapter closure   */
/* ------------------------------------------------------------------ */

export function Sanctuary3D({ scene: config, lampOn, overlay, onExit, onUnavailable }: Sanctuary3DProps) {
  const effectiveMotion = useEffectiveMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const engineRef = useRef<SanctuaryEngineHandle | null>(null);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [traveling, setTraveling] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;
  const initialLampRef = useRef(lampOn);

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
          const handle = buildSanctuaryScene(context, config, initialLampRef.current, {
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
    // Motion and lamp sync through the effects below; rebuilding on those
    // changes would tear down live geometry for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sceneId]);

  useEffect(() => {
    runtimeRef.current?.setMotion(effectiveMotion);
  }, [effectiveMotion]);

  useEffect(() => {
    initialLampRef.current = lampOn;
    engineRef.current?.setLamp(lampOn);
  }, [lampOn]);

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
    // The DOM reading overlay owns its own keys (buttons, inputs); only the
    // scene surface handles travel keys.
    if (event.target instanceof HTMLElement && event.target.closest("[data-sanctuary-overlay]")) return;
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
      className={styles.sanctuary}
      data-visual="quran-sanctuary"
      data-scene={config.sceneId}
      data-node={node.id}
      data-lamp={lampOn ? "on" : "off"}
      aria-label="رواق القراءة ثلاثي الأبعاد — مساحة فنية للتدبر"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div ref={hostRef} className={styles.canvasHost} data-visual="quran-sanctuary-canvas" />

      <div className={styles.hud}>
        <div className={styles.hudTop}>
          <span className={styles.badge}>
            <Compass size={13} aria-hidden /> رواق ثلاثي الأبعاد — قراءة وتدبر
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
            <button type="button" className={styles.hudButton} onClick={onExit} aria-label="الخروج إلى القراءة الكاملة">
              <LogOut size={14} aria-hidden /> خروج
            </button>
          </div>
        </div>

        {overlay ? (
          <div className={styles.overlaySlot} data-sanctuary-overlay>
            {overlay}
          </div>
        ) : null}

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
          <div className={styles.nodeRail} role="tablist" aria-label="محطات الرواق">
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

Sanctuary3D.displayName = "Sanctuary3D";
