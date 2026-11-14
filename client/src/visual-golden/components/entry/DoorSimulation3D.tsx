import { useCallback, useEffect, useRef, useState } from "react";
import { DoorOpen, SkipForward, Volume2, VolumeX } from "lucide-react";
import * as THREE from "three";
import styles from "./DoorSimulation3D.module.css";

interface DoorSimulation3DProps {
  siteNameAr: string;
  siteNameEn?: string;
  active: boolean;
  onEntered: () => void;
  onCancel?: () => void;
  openLabelAr?: string;
  openLabelEn?: string;
}

type DoorPhase = "light" | "door" | "opening" | "exiting" | "entered";

const DOOR_WIDTH = 2.2;
const DOOR_HEIGHT = 3.5;
const ARCH_RADIUS = DOOR_WIDTH / 2;
const WALL_Z = -2.65;
const SOUND_KEY = "yra-door-sound-v1";

/* -------------------------------------------------------------------------- */
/* Small Web Audio synthesizer                                                 */
/* -------------------------------------------------------------------------- */

class ThresholdAudio {
  private context: AudioContext | null = null;
  enabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!this.context) this.context = new Ctor();
    if (this.context.state === "suspended") {
      void this.context.resume().catch(() => undefined);
    }
    return this.context;
  }

  chime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const frequencies = [392, 523.25, 659.25];
    frequencies.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.03 + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 + index * 0.1);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now + index * 0.04);
      oscillator.stop(now + 2.7);
    });
  }

  creak() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const length = Math.floor(ctx.sampleRate * 1.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(310, now);
    filter.frequency.exponentialRampToValueAtTime(82, now + 1.35);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.42);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 1.5);

    const low = ctx.createOscillator();
    const lowGain = ctx.createGain();
    low.type = "triangle";
    low.frequency.setValueAtTime(84, now);
    low.frequency.exponentialRampToValueAtTime(52, now + 1.2);
    lowGain.gain.setValueAtTime(0.0001, now);
    lowGain.gain.linearRampToValueAtTime(0.035, now + 0.18);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    low.connect(lowGain).connect(ctx.destination);
    low.start(now);
    low.stop(now + 1.45);
  }

  threshold() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [261.63, 329.63, 392, 523.25].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index > 2 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(index > 2 ? 0.022 : 0.032, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now + index * 0.02);
      oscillator.stop(now + 3.6);
    });
  }

  dispose() {
    if (this.context) {
      void this.context.close().catch(() => undefined);
      this.context = null;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Procedural materials                                                        */
/* -------------------------------------------------------------------------- */

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function woodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const random = seededRandom(19);
  const gradient = ctx.createLinearGradient(0, 0, 512, 0);
  gradient.addColorStop(0, "#24170c");
  gradient.addColorStop(0.45, "#3d2915");
  gradient.addColorStop(0.7, "#2c1c0f");
  gradient.addColorStop(1, "#1a1008");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 1024);
  for (let index = 0; index < 220; index += 1) {
    const x = random() * 512;
    const alpha = 0.03 + random() * 0.09;
    ctx.strokeStyle = `rgba(${random() > 0.5 ? "255, 214, 153" : "8, 4, 2"}, ${alpha})`;
    ctx.lineWidth = 0.6 + random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 1024; y += 64) {
      ctx.lineTo(x + Math.sin(y * 0.008 + index) * (2 + random() * 5), y);
    }
    ctx.stroke();
  }
  for (let index = 0; index < 18; index += 1) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.06 + random() * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(random() * 512, random() * 1024, 8 + random() * 28, 2 + random() * 5, random() * Math.PI, 0, Math.PI * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function stoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const random = seededRandom(47);
  ctx.fillStyle = "#11150f";
  ctx.fillRect(0, 0, 512, 512);
  const cell = 128;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const shade = 18 + Math.floor(random() * 14);
      ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade - 2})`;
      ctx.fillRect(column * cell + 2, row * cell + 2, cell - 4, cell - 4);
      for (let speck = 0; speck < 40; speck += 1) {
        const alpha = 0.02 + random() * 0.05;
        ctx.fillStyle = random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
        ctx.fillRect(column * cell + random() * cell, row * cell + random() * cell, 1 + random() * 3, 1 + random() * 3);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  return texture;
}

function carpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = "#0a2b22";
  ctx.fillRect(0, 0, 512, 1024);
  ctx.strokeStyle = "rgba(212, 160, 23, 0.55)";
  ctx.lineWidth = 5;
  ctx.strokeRect(30, 24, 452, 976);
  ctx.strokeStyle = "rgba(232, 197, 71, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 44, 412, 936);
  for (let y = 90; y < 960; y += 86) {
    ctx.save();
    ctx.translate(256, y);
    ctx.strokeStyle = "rgba(212, 160, 23, 0.18)";
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index += 1) {
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(18, 0);
      ctx.lineTo(0, 26);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

function plasterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const random = seededRandom(83);
  ctx.fillStyle = "#1b2019";
  ctx.fillRect(0, 0, 512, 512);
  for (let index = 0; index < 1600; index += 1) {
    const alpha = 0.015 + random() * 0.04;
    ctx.fillStyle = random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(random() * 512, random() * 512, 1 + random() * 4, 1 + random() * 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                            */
/* -------------------------------------------------------------------------- */

function archShape(width: number, height: number): THREE.Shape {
  const radius = width / 2;
  const spring = height - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, spring);
  shape.absarc(0, spring, radius, 0, Math.PI, false);
  shape.lineTo(-width / 2, 0);
  shape.closePath();
  return shape;
}

function starShape(outer: number, inner: number, points = 8): THREE.Shape {
  const shape = new THREE.Shape();
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function DoorSimulation3D({
  siteNameAr,
  siteNameEn,
  active,
  onEntered,
  onCancel,
  openLabelAr = "افتح الباب",
  openLabelEn = "Open the Door",
}: DoorSimulation3DProps) {
  const [phase, setPhase] = useState<DoorPhase>(active ? "light" : "entered");
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(SOUND_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const [webglFailed, setWebglFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef<DoorPhase>(phase);
  const doorAngleRef = useRef(0);
  const audioRef = useRef<ThresholdAudio | null>(null);
  const enteredRef = useRef(onEntered);
  const cancelRef = useRef(onCancel);
  const timersRef = useRef<number[]>([]);

  phaseRef.current = phase;
  enteredRef.current = onEntered;
  cancelRef.current = onCancel;

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  useEffect(() => {
    const audio = new ThresholdAudio();
    audio.enabled = soundOn;
    audioRef.current = audio;
    return () => {
      audio.dispose();
      audioRef.current = null;
    };
  }, [soundOn]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {
      // The door still works when storage is unavailable.
    }
  }, [soundOn]);

  useEffect(() => {
    if (!active || phase !== "light") return undefined;
    const timer = window.setTimeout(() => setPhase("door"), 2300);
    return () => window.clearTimeout(timer);
  }, [active, phase]);

  useEffect(() => {
    if (phase !== "opening") return undefined;
    schedule(() => setPhase("exiting"), 1650);
    return () => clearTimers();
  }, [clearTimers, phase, schedule]);

  useEffect(() => {
    if (phase !== "exiting") return undefined;
    // Keep this timer in its own phase effect. Clearing the opening timer when
    // the phase changes used to cancel the entrance callback, leaving the
    // threshold stuck on "exiting" forever.
    schedule(() => {
      setPhase("entered");
      enteredRef.current();
    }, 730);
    return () => clearTimers();
  }, [clearTimers, phase, schedule]);

  useEffect(() => {
    if (phase !== "door") return;
    const frame = window.requestAnimationFrame(() => primaryButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPhase((current) => (current === "entered" ? current : "exiting"));
        schedule(() => (cancelRef.current ?? enteredRef.current)(), 560);
      }
      if (event.key === "Enter" && phaseRef.current === "light") {
        event.preventDefault();
        setPhase("door");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, schedule]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleOpen = useCallback(() => {
    if (phaseRef.current === "opening" || phaseRef.current === "exiting") return;
    audioRef.current?.creak();
    setPhase("opening");
    schedule(() => audioRef.current?.threshold(), 1450);
  }, [schedule]);

  const handleSkip = useCallback(() => {
    if (phaseRef.current === "entered" || phaseRef.current === "exiting") return;
    setPhase("exiting");
    schedule(() => (cancelRef.current ?? enteredRef.current)(), 620);
  }, [schedule]);

  /* ---------------------------------------------------------------------- */
  /* Three.js scene                                                          */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!active || phaseRef.current === "entered") return undefined;
    const host = containerRef.current;
    if (!host) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    setWebglFailed(false);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020607);
    scene.fog = new THREE.FogExp2(0x020607, 0.028);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 1.68, 4.35);
    camera.lookAt(0, 1.72, WALL_Z);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 1.75));
    renderer.setSize(host.clientWidth || 1, host.clientHeight || 1, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wood = woodTexture();
    const stone = stoneTexture();
    const carpet = carpetTexture();
    const plaster = plasterTexture();

    const woodMaterial = new THREE.MeshStandardMaterial({
      map: wood,
      color: 0x9a7448,
      roughness: 0.58,
      metalness: 0.12,
    });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({
      map: wood,
      color: 0x4a3622,
      roughness: 0.66,
      metalness: 0.08,
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a017,
      roughness: 0.26,
      metalness: 0.9,
      emissive: 0x6b4500,
      emissiveIntensity: 0.5,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: plaster,
      color: 0x59604f,
      roughness: 0.94,
      metalness: 0.02,
    });
    const stoneMaterial = new THREE.MeshStandardMaterial({
      map: stone,
      color: 0x5c6157,
      roughness: 0.83,
      metalness: 0.04,
    });

    // Floor -----------------------------------------------------------------
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), stoneMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const carpetMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 8.5),
      new THREE.MeshStandardMaterial({
        map: carpet,
        color: 0xb9b09a,
        roughness: 0.94,
        metalness: 0.01,
      }),
    );
    carpetMesh.rotation.x = -Math.PI / 2;
    carpetMesh.position.set(0, 0.012, 0.4);
    carpetMesh.receiveShadow = true;
    scene.add(carpetMesh);

    // Wall with an arched opening ------------------------------------------
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-7, 0);
    wallShape.lineTo(7, 0);
    wallShape.lineTo(7, 6.4);
    wallShape.lineTo(-7, 6.4);
    wallShape.closePath();
    const opening = new THREE.Path();
    opening.moveTo(-DOOR_WIDTH / 2, 0);
    opening.lineTo(DOOR_WIDTH / 2, 0);
    opening.lineTo(DOOR_WIDTH / 2, DOOR_HEIGHT - ARCH_RADIUS);
    opening.absarc(0, DOOR_HEIGHT - ARCH_RADIUS, ARCH_RADIUS, 0, Math.PI, false);
    opening.lineTo(-DOOR_WIDTH / 2, 0);
    opening.closePath();
    wallShape.holes.push(opening);
    const wallGeometry = new THREE.ExtrudeGeometry(wallShape, {
      depth: 0.38,
      bevelEnabled: false,
      curveSegments: 32,
    });
    wallGeometry.translate(0, 0, WALL_Z - 0.38);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.receiveShadow = true;
    wall.castShadow = true;
    scene.add(wall);

    // Stone threshold
    const threshold = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_WIDTH + 0.9, 0.14, 1.25),
      stoneMaterial,
    );
    threshold.position.set(0, 0.07, WALL_Z + 0.48);
    threshold.receiveShadow = true;
    scene.add(threshold);

    // Carved frame ----------------------------------------------------------
    const jambHeight = DOOR_HEIGHT - ARCH_RADIUS;
    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, jambHeight, 0.5),
        darkWoodMaterial,
      );
      jamb.position.set(side * (DOOR_WIDTH / 2 + 0.12), jambHeight / 2, WALL_Z + 0.2);
      jamb.castShadow = true;
      jamb.receiveShadow = true;
      scene.add(jamb);

      const fillet = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, jambHeight, 0.06),
        goldMaterial,
      );
      fillet.position.set(side * (DOOR_WIDTH / 2 + 0.015), jambHeight / 2, WALL_Z + 0.44);
      scene.add(fillet);

      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.22, 0.58),
        darkWoodMaterial,
      );
      plinth.position.set(side * (DOOR_WIDTH / 2 + 0.12), 0.11, WALL_Z + 0.2);
      scene.add(plinth);
    }

    const archFrame = new THREE.Mesh(
      new THREE.TorusGeometry(ARCH_RADIUS + 0.13, 0.13, 10, 64, Math.PI),
      darkWoodMaterial,
    );
    archFrame.position.set(0, jambHeight, WALL_Z + 0.2);
    archFrame.castShadow = true;
    scene.add(archFrame);

    const archFillet = new THREE.Mesh(
      new THREE.TorusGeometry(ARCH_RADIUS + 0.02, 0.016, 6, 64, Math.PI),
      goldMaterial,
    );
    archFillet.position.set(0, jambHeight, WALL_Z + 0.44);
    scene.add(archFillet);

    // Door leaf -------------------------------------------------------------
    const hinge = new THREE.Group();
    hinge.position.set(-DOOR_WIDTH / 2, 0, WALL_Z + 0.3);
    scene.add(hinge);

    const leafShape = archShape(DOOR_WIDTH, DOOR_HEIGHT);
    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 32,
    });
    const leaf = new THREE.Mesh(leafGeometry, woodMaterial);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    hinge.add(leaf);

    const bandGeometry = new THREE.BoxGeometry(DOOR_WIDTH - 0.26, 0.032, 0.02);
    for (const y of [0.82, 1.62, 2.42]) {
      const band = new THREE.Mesh(bandGeometry, goldMaterial);
      band.position.set(DOOR_WIDTH / 2, y, 0.185);
      hinge.add(band);
    }

    const starGeometry = new THREE.ExtrudeGeometry(starShape(0.3, 0.13), {
      depth: 0.012,
      bevelEnabled: false,
    });
    const star = new THREE.Mesh(starGeometry, goldMaterial);
    star.position.set(DOOR_WIDTH / 2, 1.72, 0.178);
    hinge.add(star);

    const innerStar = new THREE.Mesh(
      new THREE.ExtrudeGeometry(starShape(0.17, 0.075), { depth: 0.014, bevelEnabled: false }),
      goldMaterial,
    );
    innerStar.position.set(DOOR_WIDTH / 2, 1.72, 0.192);
    hinge.add(innerStar);

    const handleRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.105, 0.018, 10, 32),
      goldMaterial,
    );
    handleRing.position.set(DOOR_WIDTH - 0.28, 1.05, 0.26);
    hinge.add(handleRing);

    const handlePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.035, 24),
      goldMaterial,
    );
    handlePlate.rotation.x = Math.PI / 2;
    handlePlate.position.set(DOOR_WIDTH - 0.28, 1.16, 0.19);
    hinge.add(handlePlate);

    for (const y of [0.52, 1.7, 2.88]) {
      const hingePiece = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.2, 0.055),
        goldMaterial,
      );
      hingePiece.position.set(0.045, y, 0.19);
      hinge.add(hingePiece);
    }

    // Light behind the door ------------------------------------------------
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xfff2c8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(DOOR_WIDTH + 0.6, DOOR_HEIGHT + 0.4),
      glowMaterial,
    );
    glow.position.set(0, DOOR_HEIGHT / 2, WALL_Z - 0.1);
    scene.add(glow);

    const innerLight = new THREE.PointLight(0xffe4ad, 0.6, 16, 2);
    innerLight.position.set(0, 2.15, WALL_Z - 1.4);
    scene.add(innerLight);

    // Wall sconces
    for (const side of [-1, 1]) {
      const sconce = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.13, 0.42, 12),
        goldMaterial,
      );
      sconce.position.set(side * 2.15, 2.25, WALL_Z + 0.34);
      scene.add(sconce);
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe1a3 }),
      );
      flame.position.set(side * 2.15, 2.5, WALL_Z + 0.34);
      scene.add(flame);
      const sconceLight = new THREE.PointLight(0xffc978, 4.5, 6, 2);
      sconceLight.position.set(side * 2.15, 2.45, WALL_Z + 0.55);
      scene.add(sconceLight);
    }

    // Lighting --------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xfff4dc, 0.3));
    const keyLight = new THREE.DirectionalLight(0xffe3b0, 2.1);
    keyLight.position.set(3.5, 5.4, 4.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xffd39a, 7, 12, 2);
    fillLight.position.set(0, 3.2, 2.2);
    scene.add(fillLight);

    // Dust in the light -----------------------------------------------------
    const dustCount = 140;
    const dustPositions = new Float32Array(dustCount * 3);
    const random = seededRandom(113);
    for (let index = 0; index < dustCount; index += 1) {
      dustPositions[index * 3] = (random() - 0.5) * 7;
      dustPositions[index * 3 + 1] = random() * 4.6;
      dustPositions[index * 3 + 2] = WALL_Z + 0.4 + random() * 4;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xffe3a7,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Resize ----------------------------------------------------------------
    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    // Animation -------------------------------------------------------------
    const clock = new THREE.Clock();
    let frame = 0;
    let time = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      time += delta;
      const currentPhase = phaseRef.current;

      const targetAngle = currentPhase === "opening" || currentPhase === "exiting" ? 1.92 : 0;
      doorAngleRef.current += (targetAngle - doorAngleRef.current) * (1 - Math.exp(-delta * 3.2));
      hinge.rotation.y = doorAngleRef.current;

      const openRatio = THREE.MathUtils.clamp(doorAngleRef.current / 1.92, 0, 1);
      glowMaterial.opacity = openRatio * 0.9;
      innerLight.intensity = 0.6 + openRatio * 26;

      if (!reducedMotion) {
        dust.rotation.y = time * 0.014;
        dust.position.y = Math.sin(time * 0.22) * 0.06;
        const drift = currentPhase === "opening" || currentPhase === "exiting" ? 2.9 : 4.35;
        camera.position.z += (drift - camera.position.z) * (1 - Math.exp(-delta * 1.2));
        camera.position.x = Math.sin(time * 0.18) * 0.055;
        camera.position.y = 1.68 + Math.sin(time * 0.24) * 0.012;
      } else {
        camera.position.set(0, 1.68, 4.35);
      }
      camera.lookAt(0, 1.72 + openRatio * 0.12, WALL_Z);
      renderer.render(scene, camera);
    };
    animate();

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) material.dispose();
        }
      });
      wood.dispose();
      stone.dispose();
      carpet.dispose();
      plaster.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [active]);

  if (!active || phase === "entered") return null;

  const isLight = phase === "light";
  const isDoor = phase === "door";
  const isOpening = phase === "opening";
  const isExiting = phase === "exiting";
  const isRtl =
    typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const openLabel = isRtl ? openLabelAr : openLabelEn;
  const phaseClass = isLight
    ? styles.lightPhase
    : isDoor
      ? styles.doorPhase
      : isOpening || isExiting
        ? styles.openingPhase
        : "";
  const nameVisible = isLight || isDoor || isOpening;

  return (
    <div
      className={`${styles.overlay} ${phaseClass} ${isExiting ? styles.exiting : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${siteNameAr} — ${isDoor ? openLabel : "الدخول إلى الجناح"}`}
      dir={isRtl ? "rtl" : "ltr"}
      data-door-phase={phase}
    >
      {webglFailed ? (
        <div className={styles.fallbackWrap} aria-hidden="true">
          <div className={styles.fallbackFrame}>
            <div
              className={`${styles.fallbackLeaf} ${isOpening || isExiting ? styles.fallbackLeafOpen : ""}`}
            >
              <span className={styles.fallbackHandle} />
            </div>
            <div className={`${styles.fallbackGlow} ${isOpening || isExiting ? styles.fallbackGlowOpen : ""}`} />
          </div>
        </div>
      ) : (
        <div ref={containerRef} className={styles.canvasHost} aria-hidden="true" />
      )}

      <div className={styles.lightWash} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} />
          <span className={styles.brandName}>يا رسول الله ﷺ</span>
          <span className={styles.brandLatin}>Ya Rasool Allah · Institutional Threshold</span>
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setSoundOn((value) => !value)}
            aria-pressed={soundOn}
            aria-label={soundOn ? "إيقاف صوت الباب" : "تشغيل صوت الباب"}
            title={soundOn ? "الصوت مفعّل" : "الصوت مكتوم"}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button type="button" className={styles.quietButton} onClick={handleSkip}>
            <SkipForward size={14} aria-hidden="true" />
            <span style={{ marginInlineStart: 6 }}>{isRtl ? "تخطّي الدخول" : "Skip"}</span>
          </button>
        </div>
      </header>

      {nameVisible ? (
        <div
          className={`${styles.nameBlock} ${isLight ? styles.nameBlockLight : ""} ${isOpening ? styles.nameBlockOpening : ""}`}
        >
          <span className={styles.bismillah}>بسم الله الرحمن الرحيم</span>
          <h1 className={styles.nameAr}>{siteNameAr}</h1>
          {siteNameEn ? <span className={styles.nameEn}>{siteNameEn}</span> : null}
          <span className={styles.ornament} aria-hidden="true">
            <i />
            <span />
            <i />
          </span>
        </div>
      ) : null}

      {isLight ? (
        <div className={styles.lightCaption} aria-live="polite">
          <span className={styles.lightCaptionText}>يظهر النور أولًا…</span>
          <span className={styles.lightLine} aria-hidden="true">
            <i />
          </span>
        </div>
      ) : null}

      <div className={styles.doorPrompt}>
        <p className={styles.doorHint}>
          {isRtl
            ? "اقترب من العتبة. الباب الخشبي المحفور يفتح على الجناح، والنور يرسم الطريق قبلك."
            : "Approach the threshold. The carved wooden door opens onto the wing, and the light arrives before you."}
        </p>
        <button
          ref={primaryButtonRef}
          type="button"
          className={styles.primaryButton}
          onClick={handleOpen}
          disabled={!isDoor}
        >
          <DoorOpen size={19} aria-hidden="true" style={{ marginInlineEnd: 10, verticalAlign: -3 }} />
          {openLabel}
        </button>
        <span className={styles.doorMeta}>
          <i aria-hidden="true" /> {isRtl ? "باب المكتبة" : "Library door"}
          <i aria-hidden="true" /> {isRtl ? "عتبة واحدة لكل جناح" : "one threshold per wing"}
        </span>
      </div>

      {webglFailed ? (
        <p className={styles.fallbackNote}>
          {isRtl
            ? "تعذّر تشغيل المشهد ثلاثي الأبعاد في هذا المتصفح. الباب ما زال يفتح، ويمكنك متابعة الدخول."
            : "The 3D scene is unavailable in this browser. The door still opens and you can continue."}
        </p>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {isLight
          ? "يظهر النور ثم يظهر الباب."
          : isDoor
            ? "الباب جاهز. اضغط افتح الباب."
            : isOpening
              ? "الباب يُفتح."
              : "جارٍ الدخول إلى الجناح."}
      </span>
    </div>
  );
}

DoorSimulation3D.displayName = "DoorSimulation3D";
