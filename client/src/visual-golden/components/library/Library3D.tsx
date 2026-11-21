import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Eye,
  Layers3,
  LocateFixed,
  Move3d,
  X,
} from "lucide-react";
import { Link } from "wouter";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  canReadTextInside,
  displayAuthor,
  displayTitle,
  hashWorkId,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import { categoryLabel } from "@/visual-golden/services/library-catalog-presentation";
import {
  ThreeRuntime,
  type ThreeRuntimeContext,
  type ThreeSceneHandle,
} from "@/visual-golden/components/three/three-runtime";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  buildLibraryHallShelves,
  type LibraryHallDefinition,
  type LibraryHallShelf,
} from "@/visual-golden/services/library-3d";
import styles from "./Library3D.module.css";

interface Library3DProps {
  works: CatalogWork[];
  lang: "ar" | "en" | "fr" | "ur";
  paused?: boolean;
  onOpenWork: (work: CatalogWork) => void;
  onBrowseShelves: (category?: string) => void;
}

interface SceneBookHit {
  work: CatalogWork;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
}

interface HoverState {
  work: CatalogWork;
  x: number;
  y: number;
}

interface LibrarySceneController extends ThreeSceneHandle {
  focusHall: (index: number) => void;
  resetView: () => void;
}

interface SceneCallbacks {
  onHover: (work: CatalogWork | null, x: number, y: number) => void;
  onSelect: (work: CatalogWork | null) => void;
}

const HALL_Z = [-9.6, -4.8, 0, 4.8, 9.6];
const HALL_X = 5.02;
const BOOKCASE_WIDTH = 4.1;
const BOOKCASE_HEIGHT = 4.0;
const SHELF_LEVELS = [0.4, 1.1, 1.8, 2.5, 3.2];
const BOOKS_PER_SHELF = 18;

/* -------------------------------------------------------------------------- */
/* Procedural textures                                                         */
/* -------------------------------------------------------------------------- */

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function canvasTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) paint(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function woodTexture() {
  return canvasTexture(512, 1024, (ctx) => {
    const random = seededRandom(11);
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, "#2a1a0c");
    gradient.addColorStop(0.35, "#4a3018");
    gradient.addColorStop(0.62, "#382410");
    gradient.addColorStop(1, "#1b1007");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 1024);
    for (let index = 0; index < 260; index += 1) {
      const x = random() * 512;
      const alpha = 0.025 + random() * 0.075;
      ctx.strokeStyle = `rgba(${random() > 0.5 ? "244, 208, 150" : "4, 2, 1"}, ${alpha})`;
      ctx.lineWidth = 0.6 + random() * 2.2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 1024; y += 80) {
        ctx.lineTo(x + Math.sin(y * 0.007 + index) * (1.5 + random() * 5), y);
      }
      ctx.stroke();
    }
  });
}

function stoneTexture() {
  const texture = canvasTexture(512, 512, (ctx) => {
    const random = seededRandom(29);
    ctx.fillStyle = "#161a13";
    ctx.fillRect(0, 0, 512, 512);
    const cell = 128;
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const shade = 24 + Math.floor(random() * 12);
        ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade - 2})`;
        ctx.fillRect(column * cell + 3, row * cell + 3, cell - 6, cell - 6);
        for (let speck = 0; speck < 34; speck += 1) {
          const alpha = 0.02 + random() * 0.045;
          ctx.fillStyle = random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
          ctx.fillRect(column * cell + random() * cell, row * cell + random() * cell, 1 + random() * 3, 1 + random() * 3);
        }
      }
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 10);
  return texture;
}

function plasterTexture() {
  const texture = canvasTexture(512, 512, (ctx) => {
    const random = seededRandom(53);
    ctx.fillStyle = "#20251c";
    ctx.fillRect(0, 0, 512, 512);
    for (let index = 0; index < 1800; index += 1) {
      const alpha = 0.012 + random() * 0.035;
      ctx.fillStyle = random() > 0.55 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.fillRect(random() * 512, random() * 512, 1 + random() * 4, 1 + random() * 4);
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  return texture;
}

function carpetTexture() {
  const texture = canvasTexture(512, 1024, (ctx) => {
    ctx.fillStyle = "#09291f";
    ctx.fillRect(0, 0, 512, 1024);
    ctx.strokeStyle = "rgba(212, 160, 23, 0.62)";
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 26, 456, 972);
    ctx.strokeStyle = "rgba(232, 197, 71, 0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 46, 416, 932);
    for (let y = 100; y < 960; y += 84) {
      ctx.save();
      ctx.translate(256, y);
      ctx.strokeStyle = "rgba(212, 160, 23, 0.2)";
      ctx.lineWidth = 2;
      for (let index = 0; index < 8; index += 1) {
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(20, 0);
        ctx.lineTo(0, 28);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      ctx.restore();
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

function mashrabiyaTexture() {
  return canvasTexture(512, 512, (ctx) => {
    const gradient = ctx.createRadialGradient(256, 250, 20, 256, 256, 350);
    gradient.addColorStop(0, "#f5d489");
    gradient.addColorStop(0.24, "#b47a20");
    gradient.addColorStop(0.62, "#4a2c0a");
    gradient.addColorStop(1, "#160d04");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(255, 232, 170, 0.55)";
    ctx.lineWidth = 3;
    for (let row = -1; row < 8; row += 1) {
      for (let column = -1; column < 8; column += 1) {
        const cx = column * 74 + (row % 2 === 0 ? 37 : 0);
        const cy = row * 64;
        ctx.beginPath();
        for (let point = 0; point < 8; point += 1) {
          const angle = (point * Math.PI) / 4 + Math.PI / 8;
          const x = cx + Math.cos(angle) * 34;
          const y = cy + Math.sin(angle) * 34;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  });
}

function plaqueTexture(
  hall: LibraryHallDefinition,
  total: number,
  lang: "ar" | "en" | "fr" | "ur",
) {
  return canvasTexture(1024, 256, (ctx) => {
    ctx.fillStyle = "#06100c";
    ctx.fillRect(0, 0, 1024, 256);
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "rgba(212, 160, 23, 0.16)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(212, 160, 23, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = "rgba(232, 197, 71, 0.65)";
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 996, 228);
    ctx.strokeStyle = "rgba(232, 197, 71, 0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 968, 200);

    const drawStar = (cx: number, cy: number, radius: number) => {
      ctx.beginPath();
      for (let point = 0; point < 16; point += 1) {
        const angle = (point * Math.PI) / 8 - Math.PI / 2;
        const r = point % 2 === 0 ? radius : radius * 0.44;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };
    ctx.strokeStyle = "rgba(232, 197, 71, 0.7)";
    ctx.lineWidth = 3;
    drawStar(104, 128, 44);
    drawStar(920, 128, 44);

    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f3df9a";
    ctx.font = '700 82px "Amiri", "Traditional Arabic", "Noto Naskh Arabic", serif';
    ctx.fillText(lang === "ar" ? hall.titleAr : hall.titleEn, 512, 118);
    ctx.fillStyle = "rgba(246, 239, 220, 0.6)";
    ctx.font = '600 26px "Cairo", "Segoe UI", sans-serif';
    ctx.fillText(lang === "ar" ? hall.titleEn.toUpperCase() : hall.titleAr, 512, 158);
    ctx.fillStyle = "rgba(232, 197, 71, 0.86)";
    ctx.font = '700 30px "Cairo", "Segoe UI", sans-serif';
    const count = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(total);
    ctx.fillText(lang === "ar" ? `${count} عمل في هذا الجناح` : `${count} works in this wing`, 512, 206);
  });
}

function entrancePlaqueTexture(lang: "ar" | "en" | "fr" | "ur") {
  return canvasTexture(1024, 192, (ctx) => {
    ctx.clearRect(0, 0, 1024, 192);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(243, 223, 154, 0.94)";
    ctx.font = '700 74px "Amiri", "Traditional Arabic", serif';
    ctx.fillText(lang === "ar" ? "المكتبة الكبرى" : "THE GRAND LIBRARY", 512, 92);
    ctx.fillStyle = "rgba(232, 197, 71, 0.6)";
    ctx.font = '600 26px "Cairo", "Segoe UI", sans-serif';
    ctx.fillText(lang === "ar" ? "THE GRAND LIBRARY" : "المكتبة الكبرى", 512, 140);
  });
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

function archShape(width: number, height: number) {
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

/* -------------------------------------------------------------------------- */
/* Scene                                                                       */
/* -------------------------------------------------------------------------- */

function createLibraryScene(
  context: ThreeRuntimeContext,
  shelves: LibraryHallShelf[],
  lang: "ar" | "en" | "fr" | "ur",
  callbacks: SceneCallbacks,
): LibrarySceneController {
  const { renderer } = context;
  let reducedMotion = context.motion === "reduced";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b08);
  scene.fog = new THREE.FogExp2(0x070b08, 0.017);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 70);
  camera.position.set(0, 1.86, 6.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.55, -1.8);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 2.1;
  controls.maxDistance = 8.6;
  controls.minPolarAngle = 0.72;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.rotateSpeed = -0.42;
  controls.zoomSpeed = 0.7;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const textures: THREE.Texture[] = [];
  let disposed = false;
  let detachInteraction = () => undefined;
  const disposeScene = () => {
    if (disposed) return;
    disposed = true;
    detachInteraction();
    controls.dispose();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.LineSegments ||
        object instanceof THREE.Points
      ) {
        geometries.add(object.geometry);
        const material = object.material;
        if (Array.isArray(material)) material.forEach((item) => materials.add(item));
        else materials.add(material);
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
  };
  // If a later geometry allocation throws, the runtime can still release the
  // partially-built scene through this registration.
  context.registerDisposable(disposeScene);

  const wood = woodTexture();
  const stone = stoneTexture();
  const plaster = plasterTexture();
  const carpet = carpetTexture();
  const mashrabiya = mashrabiyaTexture();
  textures.push(wood, stone, plaster, carpet, mashrabiya);

  const woodMaterial = new THREE.MeshStandardMaterial({
    map: wood,
    color: 0x8a6238,
    roughness: 0.62,
    metalness: 0.1,
  });
  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    map: wood,
    color: 0x4b3620,
    roughness: 0.7,
    metalness: 0.06,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    roughness: 0.28,
    metalness: 0.88,
    emissive: 0x2a1b00,
    emissiveIntensity: 0.45,
  });
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f6c2c,
    roughness: 0.38,
    metalness: 0.82,
  });
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: plaster,
    color: 0x5c6352,
    roughness: 0.94,
    metalness: 0.02,
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    map: stone,
    color: 0x73786a,
    roughness: 0.85,
    metalness: 0.04,
  });
  const carpetMaterial = new THREE.MeshStandardMaterial({
    map: carpet,
    color: 0xb8b2a0,
    roughness: 0.95,
    metalness: 0.01,
  });
  const bookMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.61,
    metalness: 0.07,
  });

  // Shell ------------------------------------------------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 26), stoneMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const runner = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 20.5), carpetMaterial);
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 0.012, 0);
  runner.receiveShadow = true;
  scene.add(runner);

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.8), wallMaterial);
    wall.rotation.y = side * (Math.PI / 2);
    wall.position.set(side * 5.98, 2.9, 0);
    wall.receiveShadow = true;
    scene.add(wall);

    const wainscot = new THREE.Mesh(
      new THREE.BoxGeometry(26, 1.22, 0.12),
      darkWoodMaterial,
    );
    wainscot.position.set(side * 5.88, 0.61, 0);
    wainscot.receiveShadow = true;
    scene.add(wainscot);

    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.045, 0.18),
      goldMaterial,
    );
    rail.position.set(side * 5.8, 1.24, 0);
    scene.add(rail);

    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.16, 0.3),
      darkWoodMaterial,
    );
    cornice.position.set(side * 5.86, 5.45, 0);
    scene.add(cornice);
  }

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 26),
    new THREE.MeshStandardMaterial({ color: 0x10140e, roughness: 0.98 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5.8;
  scene.add(ceiling);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.8), wallMaterial);
  backWall.position.set(0, 2.9, -12.98);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.8), wallMaterial);
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, 2.9, 12.98);
  scene.add(frontWall);

  // Focal arch at the far end ------------------------------------------------
  const archGeometry = new THREE.ShapeGeometry(archShape(4.2, 5.0), 48);
  const arch = new THREE.Mesh(
    archGeometry,
    new THREE.MeshBasicMaterial({
      map: mashrabiya,
      color: 0xffe6ae,
      toneMapped: false,
    }),
  );
  arch.position.set(0, 0.34, -12.92);
  scene.add(arch);

  const archOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.ShapeGeometry(archShape(4.34, 5.12), 48)),
    new THREE.LineBasicMaterial({ color: 0xd4a017, transparent: true, opacity: 0.75 }),
  );
  archOutline.position.set(0, 0.28, -12.9);
  scene.add(archOutline);

  const archLight = new THREE.PointLight(0xffd58c, 26, 17, 2);
  archLight.position.set(0, 2.4, -11.6);
  scene.add(archLight);

  const entrancePlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 1.2),
    new THREE.MeshBasicMaterial({
      map: entrancePlaqueTexture(lang),
      transparent: true,
      toneMapped: false,
    }),
  );
  entrancePlaque.position.set(0, 5.05, -12.9);
  scene.add(entrancePlaque);
  textures.push(entrancePlaque.material.map as THREE.Texture);

  // Architectural ribs and pilasters ---------------------------------------
  for (const z of HALL_Z) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(5.65, 0.1, 8, 40, Math.PI),
      darkWoodMaterial,
    );
    rib.position.set(0, 0.1, z);
    scene.add(rib);

    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(5.48, 0.015, 6, 40, Math.PI),
      goldMaterial,
    );
    trim.position.set(0, 0.1, z);
    scene.add(trim);

    for (const side of [-1, 1]) {
      const pilaster = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 5.8, 0.26),
        wallMaterial,
      );
      pilaster.position.set(side * 5.55, 2.9, z);
      scene.add(pilaster);
      const capital = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.12, 0.36),
        goldMaterial,
      );
      capital.position.set(side * 5.55, 1.25, z);
      scene.add(capital);
    }
  }

  // Chandeliers -------------------------------------------------------------
  for (const z of [-6.2, 3.2]) {
    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 1.5, 6),
      brassMaterial,
    );
    chain.position.set(0, 5.0, z);
    scene.add(chain);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.035, 8, 32),
      brassMaterial,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 4.22, z);
    scene.add(ring);

    for (let index = 0; index < 8; index += 1) {
      const angle = (index * Math.PI) / 4;
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe2a4, toneMapped: false }),
      );
      bulb.position.set(Math.cos(angle) * 0.62, 4.25, z + Math.sin(angle) * 0.62);
      scene.add(bulb);
    }

    const light = new THREE.PointLight(0xffd18a, 18, 14, 2);
    light.position.set(0, 3.95, z);
    scene.add(light);
  }

  // Reading table -----------------------------------------------------------
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.09, 1.5),
    woodMaterial,
  );
  tableTop.position.set(0, 0.82, -0.8);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);

  for (const x of [-2.45, 2.45]) {
    for (const z of [-1.4, -0.2]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.8, 0.11),
        darkWoodMaterial,
      );
      leg.position.set(x, 0.4, z - 0.4);
      scene.add(leg);
    }
  }

  for (const x of [-1.75, 1.75]) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.05, 0.62, 10),
      brassMaterial,
    );
    stem.position.set(x, 1.15, -0.8);
    scene.add(stem);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.2, 20, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x184a38,
        roughness: 0.5,
        metalness: 0.25,
        emissive: 0x2a6b4c,
        emissiveIntensity: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    shade.position.set(x, 1.47, -0.8);
    scene.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe4ad, toneMapped: false }),
    );
    bulb.position.set(x, 1.36, -0.8);
    scene.add(bulb);
    const lampLight = new THREE.PointLight(0xffc87a, 9, 5.5, 2);
    lampLight.position.set(x, 1.38, -0.8);
    scene.add(lampLight);
  }

  // Bookcases ---------------------------------------------------------------
  const bookMeshes: THREE.InstancedMesh[] = [];
  const plaqueTextures: THREE.Texture[] = [];
  const hitByMesh = new Map<THREE.InstancedMesh, SceneBookHit[]>();

  shelves.forEach((shelf, hallIndex) => {
    const side = hallIndex < 5 ? 1 : -1;
    const zIndex = hallIndex < 5 ? hallIndex : hallIndex - 5;
    const z = HALL_Z[zIndex];
    const group = new THREE.Group();
    group.position.set(side * HALL_X, 0, z);
    group.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(group);

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(BOOKCASE_WIDTH, BOOKCASE_HEIGHT, 0.09),
      darkWoodMaterial,
    );
    back.position.set(0, BOOKCASE_HEIGHT / 2, -0.27);
    back.receiveShadow = true;
    group.add(back);

    for (const x of [-2.05, 2.05]) {
      const upright = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, BOOKCASE_HEIGHT, 0.62),
        woodMaterial,
      );
      upright.position.set(x, BOOKCASE_HEIGHT / 2, 0);
      upright.castShadow = true;
      group.add(upright);
    }

    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(BOOKCASE_WIDTH + 0.22, 0.2, 0.72),
      darkWoodMaterial,
    );
    crown.position.set(0, BOOKCASE_HEIGHT + 0.02, 0.02);
    crown.castShadow = true;
    group.add(crown);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(BOOKCASE_WIDTH + 0.14, 0.34, 0.66),
      darkWoodMaterial,
    );
    plinth.position.set(0, 0.17, 0.01);
    group.add(plinth);

    for (const shelfY of SHELF_LEVELS) {
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(BOOKCASE_WIDTH - 0.08, 0.06, 0.58),
        woodMaterial,
      );
      board.position.set(0, shelfY - 0.05, 0.02);
      board.receiveShadow = true;
      group.add(board);

      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(BOOKCASE_WIDTH - 0.1, 0.018, 0.018),
        goldMaterial,
      );
      lip.position.set(0, shelfY - 0.016, 0.31);
      group.add(lip);
    }

    for (const x of [-2.06, 2.06]) {
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, BOOKCASE_HEIGHT - 0.1, 0.02),
        goldMaterial,
      );
      trim.position.set(x, BOOKCASE_HEIGHT / 2, 0.32);
      group.add(trim);
    }

    // Plaque
    const plaqueMap = plaqueTexture(shelf.hall, shelf.total, lang);
    plaqueTextures.push(plaqueMap);
    textures.push(plaqueMap);
    const plaqueBack = new THREE.Mesh(
      new THREE.BoxGeometry(3.55, 0.82, 0.06),
      darkWoodMaterial,
    );
    plaqueBack.position.set(0, 4.5, 0.1);
    group.add(plaqueBack);
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.78),
      new THREE.MeshBasicMaterial({ map: plaqueMap, toneMapped: false }),
    );
    plaque.position.set(0, 4.5, 0.14);
    group.add(plaque);

    // Books -----------------------------------------------------------------
    const works = shelf.works.slice(0, BOOKS_PER_SHELF * SHELF_LEVELS.length);
    const hits: SceneBookHit[] = [];
    if (works.length > 0) {
      const bookMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        bookMaterial,
        works.length,
      );
      bookMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      bookMesh.frustumCulled = true;
      bookMesh.receiveShadow = true;

      const bandMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        goldMaterial,
        works.length * 2,
      );
      bandMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      bandMesh.frustumCulled = true;

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const hash = (work: CatalogWork) => hashWorkId(work.id);

      let workIndex = 0;
      for (let row = 0; row < SHELF_LEVELS.length && workIndex < works.length; row += 1) {
        const available = BOOKCASE_WIDTH - 0.34;
        const slot = available / BOOKS_PER_SHELF;
        for (let column = 0; column < BOOKS_PER_SHELF && workIndex < works.length; column += 1) {
          const work = works[workIndex];
          const seed = hash(work);
          const width = slot * (0.56 + ((seed >>> 3) % 26) / 100);
          const height = 0.38 + ((seed >>> 7) % 13) / 100;
          const depth = 0.27 + ((seed >>> 11) % 8) / 100;
          const x = -available / 2 + slot * (column + 0.5) + (((seed >>> 15) % 7) - 3) / 100;
          const y = SHELF_LEVELS[row] + 0.02 + height / 2;
          const zOffset = 0.02;

          position.set(x, y, zOffset);
          scale.set(width, height, depth);
          matrix.compose(position, quaternion, scale);
          bookMesh.setMatrixAt(workIndex, matrix);

          const color = new THREE.Color(shelf.hall.tone);
          color.offsetHSL(
            ((seed % 17) - 8) / 900,
            (((seed >>> 6) % 13) - 6) / 160,
            (((seed >>> 12) % 17) - 8) / 130,
          );
          bookMesh.setColorAt(workIndex, color);

          const bandPosition = new THREE.Vector3();
          for (let band = 0; band < 2; band += 1) {
            bandPosition.set(
              x,
              y + (band === 0 ? -1 : 1) * height * 0.27,
              zOffset + depth / 2 + 0.002,
            );
            scale.set(width * 0.94, 0.014, 0.012);
            matrix.compose(bandPosition, quaternion, scale);
            bandMesh.setMatrixAt(workIndex * 2 + band, matrix);
          }

          hits.push({ work, x, y, z: zOffset, w: width, h: height, d: depth });
          workIndex += 1;
        }
      }

      bookMesh.instanceColor!.needsUpdate = true;
      bandMesh.instanceMatrix.needsUpdate = true;
      bookMesh.instanceMatrix.needsUpdate = true;
      bookMesh.userData.hits = hits;
      bookMesh.userData.hallIndex = hallIndex;
      group.add(bookMesh);
      group.add(bandMesh);
      bookMeshes.push(bookMesh);
      hitByMesh.set(bookMesh, hits);
    }
  });
  scene.updateMatrixWorld(true);
  bookMeshes.forEach((mesh) => mesh.computeBoundingSphere());

  // Hover outline ----------------------------------------------------------
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    new THREE.LineBasicMaterial({ color: 0xffe19a, transparent: true, opacity: 0.95 }),
  );
  outline.visible = false;
  outline.renderOrder = 4;
  scene.add(outline);

  // Dust -------------------------------------------------------------------
  const dustCount = context.graphicsTier === "low" ? 80 : context.graphicsTier === "balanced" ? 160 : 260;
  const dustPositions = new Float32Array(dustCount * 3);
  const random = seededRandom(97);
  for (let index = 0; index < dustCount; index += 1) {
    dustPositions[index * 3] = (random() - 0.5) * 10.5;
    dustPositions[index * 3 + 1] = random() * 4.8;
    dustPositions[index * 3 + 2] = (random() - 0.5) * 23;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xffdf9e,
      size: 0.018,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  // Lights -----------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0xfff1d6, 0.42));
  const hemisphere = new THREE.HemisphereLight(0x6f7d66, 0x171208, 0.75);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xffe0aa, 2.0);
  key.position.set(4.5, 7, 5);
  key.castShadow = context.shadowsEnabled;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.bias = -0.0004;
  scene.add(key);

  // Interaction ------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const rect = () => renderer.domElement.getBoundingClientRect();
  let hovered: THREE.InstancedMesh | null = null;
  let lastHoverAt = 0;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let pointerDownAt = 0;

  const clearHover = () => {
    if (!hovered) return;
    hovered = null;
    outline.visible = false;
    renderer.domElement.style.cursor = "grab";
    callbacks.onHover(null, 0, 0);
  };

  const setOutlineFor = (mesh: THREE.InstancedMesh, hit: SceneBookHit, instanceId: number) => {
    const instanceMatrix = new THREE.Matrix4();
    mesh.getMatrixAt(instanceId, instanceMatrix);
    const world = new THREE.Matrix4().multiplyMatrices(mesh.matrixWorld, instanceMatrix);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    world.decompose(position, quaternion, scale);
    outline.position.copy(position);
    outline.quaternion.copy(quaternion);
    outline.scale.set(scale.x + 0.014, scale.y + 0.014, scale.z + 0.014);
    outline.visible = true;
    void hit;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const now = performance.now();
    if (now - lastHoverAt < 55) return;
    lastHoverAt = now;
    const bounds = rect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(bookMeshes, false);
    const hit = intersections.find(
      (intersection) =>
        typeof intersection.instanceId === "number" &&
        intersection.object instanceof THREE.InstancedMesh,
    );
    if (!hit || typeof hit.instanceId !== "number" || !(hit.object instanceof THREE.InstancedMesh)) {
      clearHover();
      return;
    }
    const mesh = hit.object as THREE.InstancedMesh;
    const hits = hitByMesh.get(mesh);
    const book = hits?.[hit.instanceId];
    if (!book) {
      clearHover();
      return;
    }
    hovered = mesh;
    setOutlineFor(mesh, book, hit.instanceId);
    renderer.domElement.style.cursor = "pointer";
    callbacks.onHover(
      book.work,
      event.clientX - bounds.left,
      event.clientY - bounds.top,
    );
  };

  const onPointerLeave = () => clearHover();

  const onPointerDown = (event: PointerEvent) => {
    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
    pointerDownAt = performance.now();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
    if (moved > 7 || performance.now() - pointerDownAt > 700) return;
    const bounds = rect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(bookMeshes, false);
    const hit = intersections.find(
      (intersection) =>
        typeof intersection.instanceId === "number" &&
        intersection.object instanceof THREE.InstancedMesh,
    );
    if (!hit || typeof hit.instanceId !== "number" || !(hit.object instanceof THREE.InstancedMesh)) {
      callbacks.onSelect(null);
      return;
    }
    const hits = hitByMesh.get(hit.object as THREE.InstancedMesh);
    const book = hits?.[hit.instanceId];
    if (book) callbacks.onSelect(book.work);
  };

  const canvas = renderer.domElement;
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", clearHover);
  detachInteraction = () => {
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", clearHover);
  };

  // Camera focus animation ---------------------------------------------------
  const overviewPosition = new THREE.Vector3(0, 1.86, 6.2);
  const overviewTarget = new THREE.Vector3(0, 1.55, -1.8);
  let focusAnimation:
    | {
        fromPosition: THREE.Vector3;
        toPosition: THREE.Vector3;
        fromTarget: THREE.Vector3;
        toTarget: THREE.Vector3;
        startedAt: number;
      }
    | null = null;

  const animateCamera = (toPosition: THREE.Vector3, toTarget: THREE.Vector3) => {
    if (reducedMotion) {
      focusAnimation = null;
      camera.position.copy(toPosition);
      controls.target.copy(toTarget);
      controls.update();
      context.invalidate();
      return;
    }
    focusAnimation = {
      fromPosition: camera.position.clone(),
      toPosition,
      fromTarget: controls.target.clone(),
      toTarget,
      startedAt: performance.now(),
    };
    context.invalidate();
  };

  const focusHall = (index: number) => {
    const side = index < 5 ? 1 : -1;
    const z = HALL_Z[index < 5 ? index : index - 5];
    animateCamera(
      new THREE.Vector3(side * 1.15, 1.74, z + 1.55),
      new THREE.Vector3(side * 4.85, 1.92, z),
    );
  };

  const resetView = () => {
    animateCamera(overviewPosition.clone(), overviewTarget.clone());
  };

  const cancelFocus = () => {
    focusAnimation = null;
  };
  controls.addEventListener("start", cancelFocus);
  controls.addEventListener("change", context.invalidate);

  const frame = (_delta: number, elapsed: number) => {
    if (focusAnimation) {
      const progress = Math.min(1, (performance.now() - focusAnimation.startedAt) / 950);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(
        focusAnimation.fromPosition,
        focusAnimation.toPosition,
        eased,
      );
      controls.target.lerpVectors(focusAnimation.fromTarget, focusAnimation.toTarget, eased);
      if (progress >= 1) focusAnimation = null;
    }

    controls.update();
    // Keep the visitor inside the architectural shell.
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.55, 4.55);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.85, 4.55);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -10.6, 10.6);

    if (!reducedMotion) {
      dust.rotation.y = elapsed * 0.008;
      dust.position.y = Math.sin(elapsed * 0.2) * 0.05;
    }

    renderer.render(scene, camera);
  };

  const resize = (width: number, height: number) => {
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  };

  return {
    frame,
    resize,
    focusHall,
    resetView,
    setMotion(motion) {
      reducedMotion = motion === "reduced";
      controls.enableDamping = !reducedMotion;
      if (reducedMotion) focusAnimation = null;
      context.invalidate();
    },
    dispose: disposeScene,
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function Library3D({
  works,
  lang,
  paused = false,
  onOpenWork,
  onBrowseShelves,
}: Library3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<LibrarySceneController | null>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const effectiveMotion = useEffectiveMotion();
  const callbacksRef = useRef<SceneCallbacks>({
    onHover: () => undefined,
    onSelect: () => undefined,
  });

  const shelves = useMemo(() => buildLibraryHallShelves(works, 90), [works]);
  const [activeHall, setActiveHall] = useState(0);
  const [selected, setSelected] = useState<CatalogWork | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [railOpen, setRailOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 900,
  );

  callbacksRef.current = {
    onHover: (work, x, y) => setHover(work ? { work, x, y } : null),
    onSelect: (work) => {
      if (work) {
        setSelected(work);
        const hallIndex = shelves.findIndex((shelf) =>
          shelf.works.some((item) => item.id === work.id),
        );
        if (hallIndex >= 0) setActiveHall(hallIndex);
      } else {
        setSelected(null);
      }
    },
  };

  useEffect(() => {
    if (!works.length || !hostRef.current) {
      // An empty catalog must not leave the visitor staring at a spinner.
      if (!works.length) setReady(true);
      return undefined;
    }
    let disposed = false;
    let runtime: ThreeRuntime | null = null;

    const start = () => {
      if (disposed || !hostRef.current) return;
      runtime = new ThreeRuntime({
        host: hostRef.current,
        adapter: {
          build: (context) => {
            const controller = createLibraryScene(context, shelves, lang, callbacksRef.current);
            controllerRef.current = controller;
            return controller;
          },
        },
        active: true,
        paused: false,
        motion: effectiveMotion,
        onStateChange: (state) => {
          if (state === "running" || state === "paused") {
            setReady(true);
            setWebglFailed(false);
          }
          if (state === "context-lost") {
            setReady(true);
            setWebglFailed(true);
          }
          if (state === "fallback") {
            setReady(true);
            setWebglFailed(true);
          }
        },
        onFallback: () => {
          setReady(true);
          setWebglFailed(true);
        },
        onContextRestored: () => {
          setWebglFailed(false);
          setReady(true);
        },
      });
      runtimeRef.current = runtime;
      void runtime.start();
    };

    if (document.fonts?.status === "loaded") start();
    else void document.fonts.ready.then(start);

    return () => {
      disposed = true;
      runtime?.stop();
      runtimeRef.current = null;
      controllerRef.current = null;
    };
  }, [effectiveMotion, lang, shelves, works.length]);

  useEffect(() => {
    runtimeRef.current?.setPaused(paused || Boolean(selected));
  }, [paused, selected]);

  // The initial camera is the architectural overview. Hall chips call
  // `focusHall` directly, so mounting the scene must not jump the visitor into
  // a close-up of the first bookcase before they have chosen anything.

  useEffect(() => {
    if (!selected) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const activeShelf = shelves[activeHall] ?? shelves[0];
  const copy = lang === "ar"
    ? {
        eyebrow: "قاعة الأروقة",
        title: activeShelf?.hall.titleAr ?? "المكتبة الكبرى",
        subtitle: activeShelf?.hall.eyebrowAr ?? "بوابة المعرفة",
        halls: "أروقة المكتبة",
        hint: "اسحب لتدوير القاعة · مرّر للاقتراب · اضغط كتابًا لاختياره",
        dataNote: "الكتب والأعداد من الفهرس المحمّل؛ العمارة والمؤثرات زخرفية.",
        reset: "إعادة المشهد",
        shelf: "رف هذا الجناح",
        shelfCount: (visible: number, total: number) =>
          `${visible.toLocaleString("ar-EG")} كتابًا على الرف · ${total.toLocaleString("ar-EG")} مؤهلاً للقراءة`,
        collapse: "طيّ الرف",
        expand: "عرض الرف",
        open: "افتح في غرفة القراءة",
        browse: "استعرض رفوف الجناح",
        close: "إغلاق",
        loading: "يُفتح رواق المكتبة…",
        empty: "لم يصل الفهرس بعد. بقية المكتبة تعمل من تبويب الرفوف.",
        fallback: "تعذّر تشغيل المشهد ثلاثي الأبعاد في هذا المتصفح. رف الكتب أدناه يعمل بالكامل.",
        authorUnknown: "المؤلف غير مثبت",
        readable: "نص كامل قابل للقراءة",
        hintMobile: "اضغط كتابًا لاختياره",
      }
    : {
        eyebrow: "The Arcade",
        title: activeShelf?.hall.titleEn ?? "The Grand Library",
        subtitle: activeShelf?.hall.eyebrowEn ?? "Gateway of Knowledge",
        halls: "Library halls",
        hint: "Drag to turn the hall · scroll to approach · select a book",
        dataNote: "Books and counts come from the loaded catalog; the architecture and effects are decorative.",
        reset: "Reset view",
        shelf: "This wing's shelf",
        shelfCount: (visible: number, total: number) =>
          `${visible.toLocaleString("en-US")} on the shelf · ${total.toLocaleString("en-US")} cleared for reading`,
        collapse: "Collapse shelf",
        expand: "Show shelf",
        open: "Open in reading chamber",
        browse: "Browse this wing's shelves",
        close: "Close",
        loading: "Opening the Library arcade…",
        empty: "The catalog has not arrived yet. The Shelves tab still works.",
        fallback: "The 3D scene is unavailable in this browser. The book shelf below still works.",
        authorUnknown: "Author not established",
        readable: "Full text readable",
        hintMobile: "Select a book to begin",
      };

  const toneHex = activeShelf
    ? `#${activeShelf.hall.tone.toString(16).padStart(6, "0")}`
    : "#0d3a31";
  const visibleWorks = activeShelf?.works ?? [];
  const selectedHall = selected
    ? shelves.find((shelf) => shelf.works.some((item) => item.id === selected.id))
    : undefined;

  return (
    <div
      className={styles.scene}
      data-visual="library-3d"
      data-library-3d-state={ready ? "ready" : "loading"}
    >
      <div ref={hostRef} className={styles.canvasHost} aria-hidden="true" />
      <div className={styles.sceneVignette} aria-hidden="true" />

      <div className={styles.topOverlay}>
        <div className={styles.sceneIdentity}>
          <span className={styles.sceneEyebrow}>{copy.eyebrow}</span>
          <strong className={styles.sceneTitle}>{copy.title}</strong>
          <span className={styles.sceneSubtitle}>{copy.subtitle}</span>
          <small className={styles.sceneDataNote}>{copy.dataNote}</small>
        </div>
        <div className={styles.sceneActions}>
          <button
            type="button"
            className={styles.roundButton}
            onClick={() => {
              setSelected(null);
              controllerRef.current?.resetView();
            }}
            aria-label={copy.reset}
            title={copy.reset}
          >
            <LocateFixed size={17} />
          </button>
          <div className={styles.exitHall}>
            <DoorOpen size={14} aria-hidden="true" />
            <Link
              href="/library?view=shelves"
              data-visual="library-exit-hall"
              title="الإقامة في قاعة الرفوف بدل التجوال"
            >
              إلى الرفوف
            </Link>
          </div>
          <button
            type="button"
            className={styles.roundButton}
            onClick={() => onBrowseShelves(activeShelf?.hall.categories[0])}
            aria-label={copy.browse}
            title={copy.browse}
          >
            <Layers3 size={17} />
          </button>
        </div>
      </div>

      <div
        className={styles.hallRail}
        data-visual={ready ? "library-domains" : undefined}
        role="navigation"
        aria-label={copy.halls}
      >
        {shelves.map((shelf, index) => (
          <button
            key={shelf.hall.key}
            type="button"
            className={`${styles.hallChip} ${index === activeHall ? styles.hallChipOn : ""}`}
            onClick={() => {
              setActiveHall(index);
              setSelected(null);
              controllerRef.current?.focusHall(index);
            }}
            aria-pressed={index === activeHall}
            style={{ "--hall-accent": shelf.hall.accent } as CSSProperties}
          >
            <span>{lang === "ar" ? shelf.hall.titleAr : shelf.hall.titleEn}</span>
            <small>{shelf.total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</small>
          </button>
        ))}
      </div>

      <div className={styles.sceneHint} aria-hidden="true">
        <Move3d size={14} />
        <span>{copy.hintMobile}</span>
      </div>

      {!ready ? (
        <div className={styles.loading} role="status">
          <span className={styles.loadingMark} aria-hidden="true" />
          <span>{copy.loading}</span>
        </div>
      ) : null}

      {webglFailed ? (
        <div className={styles.fallbackPanel} role="status">
          <Layers3 size={22} />
          <p>{copy.fallback}</p>
        </div>
      ) : null}

      {hover && !selected ? (
        <div
          className={styles.hoverTip}
          style={{ left: hover.x, top: hover.y }}
          aria-hidden="true"
        >
          <strong>{displayTitle(hover.work, lang)}</strong>
          <span>{displayAuthor(hover.work, lang)}</span>
        </div>
      ) : null}

      {selected ? (
        <aside className={styles.detailPanel} aria-label={displayTitle(selected, lang)}>
          <button
            type="button"
            className={styles.detailClose}
            onClick={() => setSelected(null)}
            aria-label={copy.close}
          >
            <X size={16} />
          </button>
          <span className={styles.detailEyebrow}>
            {categoryLabel(selected.category, lang)}
          </span>
          <h3>{displayTitle(selected, lang)}</h3>
          <p className={styles.detailAuthor}>
            {displayAuthor(selected, lang)}
            {selected.deathHijri ? ` · ${selected.deathHijri} هـ` : ""}
          </p>
          <p className={styles.detailAvailability}>
            <Eye size={14} aria-hidden="true" />
            {canReadTextInside(selected) ? copy.readable : copy.authorUnknown}
          </p>
          <div className={styles.detailActions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onOpenWork(selected)}
            >
              <BookOpen size={16} aria-hidden="true" />
              {copy.open}
            </button>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() =>
                onBrowseShelves(selected.category ?? selectedHall?.hall.categories[0])
              }
            >
              <ArrowUpRight size={15} aria-hidden="true" />
              {copy.browse}
            </button>
          </div>
        </aside>
      ) : null}

      <section
        className={`${styles.bookRail} ${railOpen ? "" : styles.bookRailClosed}`}
        aria-label={copy.shelf}
      >
        <header className={styles.railHeader}>
          <div>
            <span className={styles.railEyebrow}>{copy.shelf}</span>
            <strong>
              {copy.shelfCount(visibleWorks.length, activeShelf?.total ?? 0)}
            </strong>
          </div>
          <button
            type="button"
            className={styles.railToggle}
            onClick={() => setRailOpen((value) => !value)}
            aria-expanded={railOpen}
          >
            {railOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            {railOpen ? copy.collapse : copy.expand}
          </button>
        </header>
        {railOpen ? (
          <div className={styles.railTrack}>
            {visibleWorks.map((work) => {
              const seed = hashWorkId(work.id);
              return (
                <button
                  key={work.id}
                  type="button"
                  className={`${styles.bookCard} ${selected?.id === work.id ? styles.bookCardOn : ""}`}
                  onClick={() => {
                    setSelected(work);
                    runtimeRef.current?.setPaused(true);
                  }}
                  style={
                    {
                      "--spine": `hsl(${(seed % 360)}, 26%, ${18 + (seed % 10)}%)`,
                    } as CSSProperties
                  }
                >
                  <span className={styles.spine} aria-hidden="true" />
                  <span className={styles.bookMeta}>
                    <strong>{displayTitle(work, lang)}</strong>
                    <small>{displayAuthor(work, lang)}</small>
                  </span>
                </button>
              );
            })}
            {visibleWorks.length === 0 ? (
              <p className={styles.emptyRail}>{copy.empty}</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

Library3D.displayName = "Library3D";
