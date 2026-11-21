/**
 * SourcesTreasury3D — the Sources wing's genuine 3D treasury
 * (directive §4.J).
 *
 * A wing-specific furnishing over the shared InteriorScene3D shell and
 * interior-engine observer contract. Reference authority:
 * YRA_REFERENCE_PACK/02_ENVIRONMENT_ART/02_sources.png — card-catalog cabinets
 * with brass label plates and ring pulls, an open drawer of documents, a
 * manuscript-inspection desk (scroll, wax seal, brass stamp, magnifier,
 * inkwell + quill, stacked bindings), and a glowing glass verification shield
 * on a marble pedestal.
 *
 * Honesty: contemporary artistic treasury, not a reconstruction of a
 * documented historical archive. No document text is rendered into geometry
 * or textures — governed record details (availability, certainty + reason,
 * source IDs) stay in the caller's DOM record card. The shield is a symbol of
 * declared verification states, never a claim of scholarly approval.
 */

import type { ReactNode } from "react";
import * as THREE from "three";
import { InteriorScene3D } from "@/visual-golden/components/three/InteriorScene3D";
import type { InteriorFurnishKit, InteriorFurnishHooks } from "@/visual-golden/components/three/interior-engine";
import type { InteriorSceneConfig } from "@/visual-golden/services/interior-scenes";

interface SourcesTreasury3DProps {
  scene: InteriorSceneConfig;
  lampOn: boolean;
  /** DOM record card rendered over the scene — governed records live here. */
  overlay?: ReactNode;
  onExit: () => void;
  onUnavailable: () => void;
}

/** Treasury furnishing: catalog cabinets, document desk, verification shield. */
function furnishTreasury({ scene3, context, random, track, mats, addSlab, ROOM }: InteriorFurnishKit): InteriorFurnishHooks {
  const { wood: woodMat, gold: goldMat, emerald: emeraldMat, stone: stoneMat } = mats;

  /* --- Card-catalog cabinet wall (left) --- */
  // Cabinet carcass: two tall sections with a crown cornice.
  const CAB = { x: -(ROOM - 0.75), z: -1.6, w: 1.1, d: 12.4, h: 4.4 };
  const cabinetMat = track(new THREE.MeshStandardMaterial({ color: "#5a4026", roughness: 0.72 }));
  addSlab(cabinetMat, CAB.x, CAB.h / 2, CAB.z, CAB.w, CAB.h, CAB.d);
  addSlab(goldMat, CAB.x, CAB.h + 0.06, CAB.z, CAB.w + 0.12, 0.12, CAB.d + 0.12);
  addSlab(cabinetMat, CAB.x, 0.12, CAB.z, CAB.w + 0.16, 0.24, CAB.d + 0.16);

  // Instanced drawer fronts + brass label plates + ring pulls, spanning the
  // full cabinet depth so every station along the wall faces real drawers.
  const cols = 8;
  const rows = 7;
  const drawerCount = cols * rows;
  const drawerGeo = track(new THREE.BoxGeometry(0.1, 0.5, 1.16));
  const drawerMat = track(new THREE.MeshStandardMaterial({ color: "#6e4e2c", roughness: 0.7 }));
  const drawers = new THREE.InstancedMesh(drawerGeo, drawerMat, drawerCount);
  const plateGeo = track(new THREE.BoxGeometry(0.03, 0.24, 0.66));
  const plates = new THREE.InstancedMesh(plateGeo, goldMat, drawerCount);
  const pullGeo = track(new THREE.TorusGeometry(0.07, 0.016, 6, 16));
  const pulls = new THREE.InstancedMesh(pullGeo, goldMat, drawerCount);
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const unit = new THREE.Vector3(1, 1, 1);
  const faceX = CAB.x + CAB.w / 2 + 0.02;
  // Two drawers stand open with blank documents peeking out (reference art).
  const openSlots = new Set([8, 15]);
  let cursor = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const y = 0.62 + row * 0.56;
      const z = CAB.z - CAB.d / 2 + 0.85 + col * 1.5 + (random() - 0.5) * 0.02;
      const open = openSlots.has(cursor);
      const protrude = open ? 0.55 : 0;
      matrix.compose(new THREE.Vector3(faceX + protrude, y, z), quat, unit);
      drawers.setMatrixAt(cursor, matrix);
      matrix.compose(new THREE.Vector3(faceX + protrude + 0.06, y + 0.06, z), quat, unit);
      plates.setMatrixAt(cursor, matrix);
      euler.set(0, Math.PI / 2, 0);
      quat.setFromEuler(euler);
      matrix.compose(new THREE.Vector3(faceX + protrude + 0.08, y - 0.14, z), quat, unit);
      pulls.setMatrixAt(cursor, matrix);
      euler.set(0, 0, 0);
      quat.setFromEuler(euler);
      if (open) {
        // Blank ivory document sheets — no text is ever painted into scenes.
        const sheetGeo = track(new THREE.BoxGeometry(0.5, 0.015, 0.9));
        const sheetMat = track(new THREE.MeshStandardMaterial({ color: "#e8d9b0", roughness: 0.75 }));
        for (let s = 0; s < 4; s += 1) {
          const sheet = new THREE.Mesh(sheetGeo, sheetMat);
          sheet.position.set(faceX + protrude - 0.1, y + 0.24 + s * 0.02, z + (random() - 0.5) * 0.12);
          sheet.rotation.y = (random() - 0.5) * 0.2;
          sheet.rotation.z = 0.06 + random() * 0.05;
          scene3.add(sheet);
        }
      }
      cursor += 1;
    }
  }
  drawers.castShadow = context.shadowsEnabled;
  scene3.add(drawers, plates, pulls);

  /* --- Manuscript-inspection desk (center) --- */
  const DESK = { x: 0, z: -3.0, w: 5.0, d: 2.4, h: 0.98 };
  addSlab(woodMat, DESK.x, DESK.h, DESK.z, DESK.w, 0.14, DESK.d);
  addSlab(goldMat, DESK.x, DESK.h - 0.1, DESK.z, DESK.w + 0.06, 0.05, DESK.d + 0.06);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      addSlab(woodMat, DESK.x + sx * (DESK.w / 2 - 0.24), DESK.h / 2 - 0.05, DESK.z + sz * (DESK.d / 2 - 0.22), 0.24, DESK.h - 0.1, 0.24);
    }
  }
  // Emerald leather inspection pad with gold edge.
  addSlab(emeraldMat, DESK.x, DESK.h + 0.08, DESK.z + 0.1, 3.2, 0.02, 1.6);

  /* --- Partially unrolled manuscript: blank aged sheet + end rolls --- */
  // Document text is never rendered into the scene; the DOM record card
  // carries the governed details. The sheet is deliberately blank.
  const sheetMat = track(new THREE.MeshStandardMaterial({ color: "#e6d5a8", roughness: 0.8 }));
  const docGeo = track(new THREE.BoxGeometry(1.9, 0.02, 1.15));
  const doc = new THREE.Mesh(docGeo, sheetMat);
  doc.position.set(DESK.x - 0.2, DESK.h + 0.11, DESK.z + 0.15);
  doc.rotation.y = 0.06;
  doc.receiveShadow = context.shadowsEnabled;
  scene3.add(doc);
  const rollGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 12));
  for (const side of [-1, 1]) {
    const roll = new THREE.Mesh(rollGeo, sheetMat);
    roll.rotation.x = Math.PI / 2;
    roll.rotation.z = 0.06;
    roll.position.set(DESK.x - 0.2 + side * 1.0, DESK.h + 0.18, DESK.z + 0.15);
    roll.castShadow = context.shadowsEnabled;
    scene3.add(roll);
  }
  // Wax seal + tassel on the document corner.
  const sealGeo = track(new THREE.CylinderGeometry(0.12, 0.13, 0.045, 14));
  const sealMat = track(new THREE.MeshStandardMaterial({ color: "#8a1f24", roughness: 0.45 }));
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.position.set(DESK.x + 0.45, DESK.h + 0.14, DESK.z + 0.55);
  scene3.add(seal);
  const tasselGeo = track(new THREE.ConeGeometry(0.045, 0.22, 8));
  const tassel = new THREE.Mesh(tasselGeo, goldMat);
  tassel.rotation.z = Math.PI / 2 + 0.3;
  tassel.position.set(DESK.x + 0.68, DESK.h + 0.12, DESK.z + 0.66);
  scene3.add(tassel);

  /* --- Brass stamp: base disc + turned handle + knob --- */
  const stampBaseGeo = track(new THREE.CylinderGeometry(0.13, 0.15, 0.06, 14));
  const stampBase = new THREE.Mesh(stampBaseGeo, goldMat);
  stampBase.position.set(DESK.x + 1.15, DESK.h + 0.12, DESK.z + 0.35);
  scene3.add(stampBase);
  const stampHandleGeo = track(new THREE.CylinderGeometry(0.05, 0.08, 0.24, 10));
  const stampHandleMat = track(new THREE.MeshStandardMaterial({ color: "#4a2c14", roughness: 0.6 }));
  const stampHandle = new THREE.Mesh(stampHandleGeo, stampHandleMat);
  stampHandle.position.set(DESK.x + 1.15, DESK.h + 0.27, DESK.z + 0.35);
  scene3.add(stampHandle);
  const knobGeo = track(new THREE.SphereGeometry(0.07, 10, 8));
  const knob = new THREE.Mesh(knobGeo, stampHandleMat);
  knob.position.set(DESK.x + 1.15, DESK.h + 0.42, DESK.z + 0.35);
  scene3.add(knob);

  /* --- Magnifier: brass ring + glass disc + handle --- */
  const lensRingGeo = track(new THREE.TorusGeometry(0.26, 0.035, 8, 28));
  const lensRing = new THREE.Mesh(lensRingGeo, goldMat);
  lensRing.rotation.x = -Math.PI / 2;
  lensRing.position.set(DESK.x - 1.75, DESK.h + 0.12, DESK.z + 0.45);
  scene3.add(lensRing);
  const glassGeo = track(new THREE.CircleGeometry(0.24, 24));
  glassGeo.rotateX(-Math.PI / 2);
  const glassMat = track(new THREE.MeshStandardMaterial({
    color: "#bcd8d2", transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.4,
  }));
  const lensGlass = new THREE.Mesh(glassGeo, glassMat);
  lensGlass.position.set(DESK.x - 1.75, DESK.h + 0.12, DESK.z + 0.45);
  scene3.add(lensGlass);
  const lensHandleGeo = track(new THREE.CylinderGeometry(0.035, 0.045, 0.6, 8));
  const lensHandle = new THREE.Mesh(lensHandleGeo, woodMat);
  lensHandle.rotation.z = Math.PI / 2;
  lensHandle.rotation.y = 0.45;
  lensHandle.position.set(DESK.x - 2.2, DESK.h + 0.12, DESK.z + 0.68);
  scene3.add(lensHandle);

  /* --- Inkwell + quill --- */
  const inkGeo = track(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 10));
  const ink = new THREE.Mesh(inkGeo, goldMat);
  ink.position.set(DESK.x + 1.7, DESK.h + 0.2, DESK.z - 0.35);
  scene3.add(ink);
  const quillGeo = track(new THREE.ConeGeometry(0.05, 0.95, 6));
  const quillMat = track(new THREE.MeshStandardMaterial({ color: "#f3e9d2", roughness: 0.6 }));
  const quill = new THREE.Mesh(quillGeo, quillMat);
  quill.position.set(DESK.x + 1.78, DESK.h + 0.65, DESK.z - 0.3);
  quill.rotation.z = -0.45;
  scene3.add(quill);

  /* --- Stacked bindings (left desk corner, emerald + gold like the art) --- */
  const stackPalette = ["#14453a", "#5a3d22", "#7a1f24"];
  for (let i = 0; i < 3; i += 1) {
    const bookMat = track(new THREE.MeshStandardMaterial({ color: stackPalette[i], roughness: 0.8 }));
    const w = 1.15 - i * 0.08;
    const d = 0.82 - i * 0.05;
    const y = DESK.h + 0.14 + i * 0.14;
    addSlab(bookMat, DESK.x - 1.7, y, DESK.z - 0.55, w, 0.12, d);
    addSlab(goldMat, DESK.x - 1.7, y + 0.065, DESK.z - 0.55, w * 0.82, 0.012, d * 0.82);
  }

  /* --- Rolled document bundle on a side bench (right of desk) --- */
  addSlab(woodMat, 4.6, 0.72, -4.4, 1.8, 0.12, 1.0);
  for (const sx of [-1, 1]) {
    addSlab(woodMat, 4.6 + sx * 0.78, 0.36, -4.4, 0.12, 0.72, 0.85);
  }
  const bundleGeo = track(new THREE.CylinderGeometry(0.08, 0.08, 0.95, 10));
  for (let i = 0; i < 3; i += 1) {
    const roll = new THREE.Mesh(bundleGeo, sheetMat);
    roll.rotation.z = Math.PI / 2;
    roll.rotation.y = (random() - 0.5) * 0.35;
    roll.position.set(4.6 + (random() - 0.5) * 0.3, 0.86 + (i === 2 ? 0.15 : 0), -4.55 + (i % 2) * 0.3);
    scene3.add(roll);
  }

  /* --- Verification shield: glass slab + gold shield + check + laurel --- */
  const SHIELD = { x: 6.2, z: -8.6 };
  // Marble pedestal with gold trim (emerald marble like the reference).
  addSlab(emeraldMat, SHIELD.x, 0.5, SHIELD.z, 1.5, 1.0, 1.0);
  addSlab(goldMat, SHIELD.x, 1.02, SHIELD.z, 1.6, 0.06, 1.1);
  addSlab(stoneMat, SHIELD.x, 0.06, SHIELD.z, 1.7, 0.12, 1.2);
  // Glass slab — the shield floats inside it.
  const slabGeo = track(new THREE.BoxGeometry(1.15, 1.35, 0.1));
  const slabMat = track(new THREE.MeshStandardMaterial({
    color: "#9fd8c4", transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0.3,
    emissive: new THREE.Color("#2a6a52"), emissiveIntensity: 0.35,
  }));
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(SHIELD.x, 1.78, SHIELD.z);
  scene3.add(slab);
  // Gold frame around the glass.
  addSlab(goldMat, SHIELD.x, 2.48, SHIELD.z, 1.22, 0.06, 0.14);
  addSlab(goldMat, SHIELD.x, 1.08, SHIELD.z, 1.22, 0.06, 0.14);
  for (const sx of [-1, 1]) {
    addSlab(goldMat, SHIELD.x + sx * 0.6, 1.78, SHIELD.z, 0.06, 1.46, 0.14);
  }
  // Heraldic shield outline, extruded — pure geometry, no texture text.
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.42);
  shieldShape.quadraticCurveTo(0.3, 0.36, 0.34, 0.28);
  shieldShape.lineTo(0.34, -0.02);
  shieldShape.quadraticCurveTo(0.32, -0.28, 0, -0.44);
  shieldShape.quadraticCurveTo(-0.32, -0.28, -0.34, -0.02);
  shieldShape.lineTo(-0.34, 0.28);
  shieldShape.quadraticCurveTo(-0.3, 0.36, 0, 0.42);
  const shieldGeo = track(new THREE.ExtrudeGeometry(shieldShape, { depth: 0.05, bevelEnabled: false }));
  const shieldMat = track(new THREE.MeshStandardMaterial({
    color: "#d4a017", roughness: 0.3, metalness: 0.7,
    emissive: new THREE.Color("#8a6a10"), emissiveIntensity: 0.5,
  }));
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  shield.position.set(SHIELD.x, 1.86, SHIELD.z + 0.01);
  scene3.add(shield);
  // Check mark: two thin gold bars meeting at an angle.
  const checkShortGeo = track(new THREE.BoxGeometry(0.16, 0.05, 0.06));
  const checkLongGeo = track(new THREE.BoxGeometry(0.3, 0.05, 0.06));
  const checkShort = new THREE.Mesh(checkShortGeo, goldMat);
  checkShort.rotation.z = -0.7;
  checkShort.position.set(SHIELD.x - 0.09, 1.83, SHIELD.z + 0.07);
  scene3.add(checkShort);
  const checkLong = new THREE.Mesh(checkLongGeo, goldMat);
  checkLong.rotation.z = 0.65;
  checkLong.position.set(SHIELD.x + 0.09, 1.88, SHIELD.z + 0.07);
  scene3.add(checkLong);
  // Laurel branches: two arcs of small gold leaves flanking the shield.
  const leafGeo = track(new THREE.SphereGeometry(0.045, 6, 5));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i += 1) {
      const angle = -0.5 + i * 0.22;
      const leaf = new THREE.Mesh(leafGeo, goldMat);
      leaf.scale.set(1.6, 0.7, 0.5);
      leaf.rotation.z = side * (angle + 0.6);
      leaf.position.set(
        SHIELD.x + side * (0.42 + Math.cos(angle) * 0.12),
        1.5 + i * 0.09,
        SHIELD.z + 0.06,
      );
      scene3.add(leaf);
    }
  }
  // Warm verification glow — a real light the lamp preference drives.
  const shieldLight = new THREE.PointLight("#ffd27a", 1.1, 7, 2);
  shieldLight.position.set(SHIELD.x, 2.0, SHIELD.z + 0.8);
  scene3.add(shieldLight);

  // Reading lights over the cabinet face and the shield corner: the shared
  // key light sits mid-room, and a tall cabinet against the wall would
  // otherwise read as a black slab from its own station (real archives light
  // their catalogs). Bounded point lights, lamp-driven like every lantern.
  const catalogLight = new THREE.PointLight("#ffc27a", 1.6, 11, 1.7);
  catalogLight.position.set(CAB.x + 2.4, 3.4, CAB.z + 0.6);
  scene3.add(catalogLight);
  const catalogFill = new THREE.PointLight("#ffc27a", 1.1, 9, 1.7);
  catalogFill.position.set(CAB.x + 1.8, 1.6, CAB.z + 2.2);
  scene3.add(catalogFill);
  const cornerLight = new THREE.PointLight("#ffc27a", 1.2, 12, 1.7);
  cornerLight.position.set(SHIELD.x - 1.4, 3.4, SHIELD.z + 2.4);
  scene3.add(cornerLight);
  // Desk reading light — the inspection surface must stay legible.
  const deskLight = new THREE.PointLight("#ffc27a", 1.3, 9, 1.7);
  deskLight.position.set(DESK.x, 2.7, DESK.z + 0.4);
  scene3.add(deskLight);

  /* --- Brass armillary on a pedestal between cabinet and desk --- */
  addSlab(stoneMat, -5.4, 0.55, -5.0, 0.8, 1.1, 0.8);
  addSlab(goldMat, -5.4, 1.12, -5.0, 0.9, 0.05, 0.9);
  const ringGeo = track(new THREE.TorusGeometry(0.48, 0.028, 8, 36));
  const armillary = new THREE.Group();
  for (const [rx, ry] of [[0, 0], [Math.PI / 3, 0], [0, Math.PI / 3]] as const) {
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = rx;
    ring.rotation.y = ry;
    armillary.add(ring);
  }
  const axisGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6));
  const axis = new THREE.Mesh(axisGeo, goldMat);
  axis.rotation.z = 0.4;
  armillary.add(axis);
  armillary.position.set(-5.4, 1.72, -5.0);
  scene3.add(armillary);

  // Contemplative motion (full only) + lamp-driven verification glow.
  return {
    onFrame(delta, elapsed, state) {
      if (context.motion === "full") {
        armillary.rotation.y += delta * 0.1 * (0.4 + state.lampLevel * 0.6);
        // Barely-there breathing of the shield glow — symbolic, not a metric.
        const breathe = 0.9 + Math.sin(elapsed * 0.8) * 0.1;
        shieldLight.intensity = (0.25 + state.lampLevel * 0.95) * breathe;
      }
    },
    onLamp(level) {
      shieldLight.intensity = 0.25 + level * 0.95;
      catalogLight.intensity = 0.15 + level * 1.5;
      catalogFill.intensity = 0.1 + level * 1.05;
      cornerLight.intensity = 0.12 + level * 1.1;
      deskLight.intensity = 0.12 + level * 1.2;
      slabMat.emissiveIntensity = 0.1 + level * 0.3;
      shieldMat.emissiveIntensity = 0.15 + level * 0.45;
    },
  };
}

export function SourcesTreasury3D({ scene, lampOn, overlay, onExit, onUnavailable }: SourcesTreasury3DProps) {
  return (
    <InteriorScene3D
      scene={scene}
      furnish={furnishTreasury}
      lampOn={lampOn}
      overlay={overlay}
      visualId="sources-treasury"
      ariaLabelAr="خزانة المصادر ثلاثية الأبعاد — مساحة فنية لتتبّع المصادر والتحقق"
      badgeAr="خزانة ثلاثية الأبعاد — فهرسة وتحقق"
      exitLabelAr="الخروج إلى خزانة المصادر الكاملة"
      onExit={onExit}
      onUnavailable={onUnavailable}
    />
  );
}

SourcesTreasury3D.displayName = "SourcesTreasury3D";