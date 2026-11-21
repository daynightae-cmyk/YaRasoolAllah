/**
 * interior-engine — shared genuine-3D interior observer engine (directive §3).
 *
 * Extracted from the live-verified Quran sanctuary (commit c52347e5) so every
 * wing's interior runs the SAME bounded observer contract:
 * - station-anchored drag-to-look (bounded pitch, no free flight),
 * - eased node-to-node travel with a gentle walking bob (never background swaps),
 * - beacon raycast click travel, reduced-motion instant jumps + discrete frames,
 * - caller-driven lamp levels affecting real lights/emissives,
 * - caller-driven playback level (eased) for listening-room animations,
 * - full disposal through the runtime's registerDisposable.
 *
 * Wing personality lives in `furnish` hooks: each wing adds its own real
 * geometry (desks, cabinets,rehals, toys…) through the tracked kit. Scripture
 * and record text are NEVER painted into scene textures — governed text stays
 * in the callers' DOM overlays.
 *
 * Engine rules (three-runtime-contract): no renderer creation, no rAF, no
 * matchMedia here — ThreeRuntime owns scheduling, visibility and cleanup.
 */

import * as THREE from "three";
import type {
  ThreeRuntimeContext,
  ThreeSceneHandle,
} from "@/visual-golden/components/three/three-runtime";
import type { InteriorSceneConfig, InteriorNode } from "@/visual-golden/services/interior-scenes";

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

export function mulberry(seed: number) {
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
export function pointedArchGeometry(span: number, height: number, depth: number, frame: number) {
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
/* Furnishing kit — wings add their own tracked geometry               */
/* ------------------------------------------------------------------ */

export interface InteriorMaterials {
  wall: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  emerald: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
  windowGlow: THREE.MeshStandardMaterial;
}

export interface InteriorFurnishKit {
  scene3: THREE.Scene;
  context: ThreeRuntimeContext;
  config: InteriorSceneConfig;
  random: () => number;
  /** Track any disposable resource for guaranteed cleanup. */
  track: <T extends { dispose(): void }>(resource: T) => T;
  mats: InteriorMaterials;
  /** Unit box scaled to a slab — walls, shelves, desks, drawers. */
  addSlab: (
    material: THREE.Material,
    x: number, y: number, z: number,
    w: number, h: number, d: number,
  ) => THREE.Mesh;
  /** Tracked pointed-arch geometry. */
  pointedArch: (span: number, height: number, depth: number, frame: number) => THREE.ExtrudeGeometry;
  /** Room half-extent (walls at ±ROOM) and wall height. */
  ROOM: number;
  WALL_H: number;
}

export interface InteriorFrameState {
  lampLevel: number;
  playbackLevel: number;
}

export interface InteriorFurnishHooks {
  /** Extra per-frame animation (full motion only is the caller's choice). */
  onFrame?: (delta: number, elapsed: number, state: InteriorFrameState) => void;
  /** Extra lamp response for wing-specific emissives. */
  onLamp?: (level: number) => void;
}

export type InteriorFurnisher = (kit: InteriorFurnishKit) => InteriorFurnishHooks | void;

/** Optional architectural shell features (registry-governed per scene). */
export interface InteriorShellFlags {
  colonnade?: boolean;
  mashrabiyaWindow?: boolean;
  mihrab?: boolean;
  entranceArch?: boolean;
  ceilingBeams?: boolean;
  dustMotes?: boolean;
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export interface InteriorCallbacks {
  onNodeArrive: (nodeId: string) => void;
  onTravelState: (traveling: boolean) => void;
}

export type InteriorEngineHandle = ThreeSceneHandle & {
  goToNode(index: number): void;
  resetView(): void;
  setLamp(on: boolean): void;
  setPlaying(on: boolean): void;
};

export function buildInteriorRoom(
  context: ThreeRuntimeContext,
  config: InteriorSceneConfig,
  initialLamp: boolean,
  callbacks: InteriorCallbacks,
  furnish?: InteriorFurnisher,
): InteriorEngineHandle {
  const flags: Required<InteriorShellFlags> = {
    colonnade: true,
    mashrabiyaWindow: true,
    mihrab: true,
    entranceArch: true,
    ceilingBeams: true,
    dustMotes: true,
    ...config.shell,
  };
  const renderer = context.renderer;
  const scene3 = new THREE.Scene();
  const ink = new THREE.Color(config.ink ?? "#050d0c");
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
  const mats: InteriorMaterials = {
    wall: wallMat, stone: stoneMat, gold: goldMat, wood: woodMat,
    ivory: ivoryMat, emerald: emeraldMat, glow: glowMat, windowGlow: windowGlowMat,
  };

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
  addSlab(wallMat, 0, WALL_H / 2, -ROOM, ROOM * 2, WALL_H, 0.5); // back
  addSlab(wallMat, -ROOM, WALL_H / 2, 0, 0.5, WALL_H, ROOM * 2); // left
  addSlab(wallMat, ROOM, WALL_H / 2, 0, 0.5, WALL_H, ROOM * 2); // right
  addSlab(wallMat, 0, WALL_H / 2, ROOM, ROOM * 2, WALL_H, 0.5); // front (entrance)
  addSlab(wallMat, 0, WALL_H + 0.2, 0, ROOM * 2, 0.4, ROOM * 2); // ceiling
  // Warm bounce fill from the visitor's side so walls facing the entrance
  // never fall to pure black under the single key light (real rooms bounce).
  const bounce = new THREE.PointLight(lanternC, 0.85, 30, 1.8);
  bounce.position.set(0, 3.4, 7.5);
  scene3.add(bounce);
  // Gold trim line running around the walls.
  for (const [x, z, w, d] of [
    [0, -ROOM + 0.3, ROOM * 2, 0.12],
    [0, ROOM - 0.3, ROOM * 2, 0.12],
    [-ROOM + 0.3, 0, 0.12, ROOM * 2],
    [ROOM - 0.3, 0, 0.12, ROOM * 2],
  ] as const) {
    addSlab(goldMat, x, WALL_H - 0.7, z, w, 0.1, d);
  }
  if (flags.ceilingBeams) {
    for (const z of [-8, -3, 2, 7]) {
      addSlab(woodMat, 0, WALL_H - 0.12, z, ROOM * 2 - 1, 0.26, 0.4);
    }
  }

  /* --- Colonnade: stone columns + pointed arches along both sides --- */
  if (flags.colonnade) {
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
  }

  /* --- Mihrab: grand pointed frame + luminous niche on the back wall --- */
  if (flags.mihrab) {
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
  }

  /* --- Entrance arch on the front wall --- */
  if (flags.entranceArch) {
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
  }

  /* --- Mashrabiya light window on the left wall --- */
  const shaftMat = track(new THREE.MeshBasicMaterial({
    color: "#ffdba0", transparent: true, opacity: 0.05,
    depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  }));
  if (flags.mashrabiyaWindow) {
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

    /* Light shaft from the window (subtle additive volume). */
    const shaftGeo = track(new THREE.ConeGeometry(2.6, 10, 4, 1, true));
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = -Math.PI / 2.6;
    shaft.position.set(-8.4, 2.4, -3.4);
    scene3.add(shaft);
  }

  /* --- Brass lanterns: hanging + wall sconces + floor lanterns --- */
  const lanternBodyGeo = track(new THREE.CylinderGeometry(0.26, 0.34, 0.72, 8));
  const lanternCapGeo = track(new THREE.ConeGeometry(0.3, 0.3, 8));
  const chainGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1, 4));
  const lanternPositions: Array<[number, number, number, boolean]> = [
    [0, 4.1, -2.4, true], // hanging above the room's heart (chain to ceiling)
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
  const ambient = new THREE.HemisphereLight(new THREE.Color(config.ambient ?? "#2a4a42"), floorC, 0.5);
  scene3.add(ambient);

  /* --- Dust motes drifting in the light (full motion only) --- */
  const moteCount = flags.dustMotes ? (context.graphicsTier === "low" ? 60 : 130) : 0;
  const moteGeo = track(new THREE.BufferGeometry());
  const motePositions = new Float32Array(Math.max(1, moteCount) * 3);
  const moteSpeeds = new Float32Array(Math.max(1, moteCount));
  for (let i = 0; i < moteCount; i += 1) {
    motePositions[i * 3] = -12 + random() * 20;
    motePositions[i * 3 + 1] = 0.4 + random() * 4.4;
    motePositions[i * 3 + 2] = -8 + random() * 12;
    moteSpeeds[i] = 0.05 + random() * 0.12;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMat = track(new THREE.PointsMaterial({
    color: "#ffe6b8", size: 0.035, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const motes = new THREE.Points(moteGeo, moteMat);
  motes.visible = moteCount > 0;
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

  /* --- Wing furnishing: real geometry through the tracked kit --- */
  const hooks: InteriorFurnishHooks =
    furnish?.({
      scene3, context, config, random, track, mats, addSlab,
      pointedArch: (span, height, depth, frame) => track(pointedArchGeometry(span, height, depth, frame)),
      ROOM, WALL_H,
    }) ?? {};

  /* --- Lamp + playback state: caller preferences drive real levels --- */
  let lampTarget = initialLamp ? 1 : 0;
  let lampLevel = lampTarget;
  let playbackTarget = 0;
  let playbackLevel = 0;
  const applyLamp = () => {
    const lit = 0.12 + lampLevel * 0.88;
    lampLight.intensity = 2.4 * lit;
    bounce.intensity = 0.85 * lit;
    windowSun.intensity = 0.25 + lampLevel * 1.25;
    glowMat.emissiveIntensity = 0.25 + lampLevel * 1.35;
    windowGlowMat.emissiveIntensity = 0.2 + lampLevel * 1.2;
    shaftMat.opacity = 0.012 + lampLevel * 0.045;
    moteMat.opacity = 0.15 + lampLevel * 0.4;
    ambient.intensity = 0.32 + lampLevel * 0.18;
    hooks.onLamp?.(lampLevel);
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
    const node = config.nodes[clamped];
    if (context.motion === "reduced") {
      // Discrete frames: publish the arrival synchronously — the visitor's
      // action must never depend on the next (possibly throttled) frame.
      currentIndex = clamped;
      travel = null;
      applyStation(clamped);
      callbacks.onTravelState(false);
      callbacks.onNodeArrive(node.id);
      context.invalidate();
      return;
    }
    if (clamped === currentIndex && !travel) return;
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
  const flickerPhase = random() * 10;

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
      if (Math.abs(playbackLevel - playbackTarget) > 0.002) {
        playbackLevel += (playbackTarget - playbackLevel) * Math.min(1, delta * 4);
      }
      if (context.motion === "full") {
        const flicker = 1 + Math.sin(elapsed * 2.3 + flickerPhase) * 0.035;
        lampLight.intensity = 2.4 * (0.12 + lampLevel * 0.88) * flicker;
        if (moteCount > 0) {
          const pos = moteGeo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < moteCount; i += 1) {
            let y = pos.getY(i) + moteSpeeds[i] * delta;
            if (y > 4.9) y = 0.4;
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
        }
      }
      hooks.onFrame?.(delta, elapsed, { lampLevel, playbackLevel });
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
      if (motion === "reduced") {
        if (travel) {
          currentIndex = travel.index;
          travel = null;
          applyStation(currentIndex);
          callbacks.onTravelState(false);
          callbacks.onNodeArrive(config.nodes[currentIndex].id);
        } else {
          // A travel may have been requested while the engine still believed
          // motion was full (media emulation flips between frames). The
          // discrete-frame contract must still hold: complete it instantly.
          callbacks.onTravelState(false);
        }
        // Discrete frames: pending eased lamp/playback levels snap at once.
        lampLevel = lampTarget;
        applyLamp();
        playbackLevel = playbackTarget;
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
    setPlaying(on: boolean) {
      playbackTarget = on ? 1 : 0;
      if (context.motion === "reduced") playbackLevel = playbackTarget;
      context.invalidate();
    },
  };
}
