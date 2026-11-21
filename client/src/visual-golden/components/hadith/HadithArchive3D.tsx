/**
 * HadithArchive3D — the Hadith wing's genuine 3D study archive (directive §4.F).
 *
 * A wing-specific furnishing over the shared InteriorScene3D shell and
 * interior-engine observer contract. Reference authority:
 * YRA_REFERENCE_PACK/02_ENVIRONMENT_ART/08_hadith.png — scholar's study:
 * tall binding walls, brass lanterns, carved desk with open rehal, quill and
 * inkwell, magnifier, rolled scroll, tufted chair, lattice light.
 *
 * The archive adds real geometry: the scholar's desk and its study props,
 * the tufted chair, full-height binding walls on both sides, and rolled
 * manuscript scrolls on a side table.
 *
 * Honesty: contemporary artistic study space, not a reconstruction of a
 * documented historical library. No hadith text is rendered into geometry or
 * textures; governed records (with grading attribution and the development-
 * sample label) stay in the caller's DOM record card.
 */

import type { ReactNode } from "react";
import * as THREE from "three";
import { InteriorScene3D } from "@/visual-golden/components/three/InteriorScene3D";
import type { InteriorFurnishKit, InteriorFurnishHooks } from "@/visual-golden/components/three/interior-engine";
import type { InteriorSceneConfig } from "@/visual-golden/services/interior-scenes";

interface HadithArchive3DProps {
  scene: InteriorSceneConfig;
  lampOn: boolean;
  /** DOM record card rendered over the scene — governed records live here. */
  overlay?: ReactNode;
  onExit: () => void;
  onUnavailable: () => void;
}

/** Archive furnishing: scholar desk + props, chair, binding walls, scrolls. */
function furnishArchive({ scene3, context, random, track, mats, addSlab, ROOM }: InteriorFurnishKit): InteriorFurnishHooks {
  const { wood: woodMat, gold: goldMat, ivory: ivoryMat, emerald: emeraldMat } = mats;

  /* --- Study rug under the desk --- */
  const rugGeo = track(new THREE.PlaneGeometry(7.4, 5.6));
  rugGeo.rotateX(-Math.PI / 2);
  const rug = new THREE.Mesh(rugGeo, emeraldMat);
  rug.position.set(0, 0.02, -2.6);
  rug.receiveShadow = context.shadowsEnabled;
  scene3.add(rug);
  // Simple gold edging via thin slabs (rectangular rug border).
  for (const [x, z, w, d] of [
    [0, -5.35, 7.4, 0.1], [0, 0.15, 7.4, 0.1],
    [-3.65, -2.6, 0.1, 5.6], [3.65, -2.6, 0.1, 5.6],
  ] as const) {
    addSlab(goldMat, x, 0.035, z, w, 0.012, d);
  }

  /* --- Scholar's desk: top, carved apron, four legs --- */
  const DESK = { x: 0, z: -3.2, w: 4.6, d: 2.2, h: 0.98 };
  addSlab(woodMat, DESK.x, DESK.h, DESK.z, DESK.w, 0.14, DESK.d);
  addSlab(goldMat, DESK.x, DESK.h - 0.1, DESK.z, DESK.w + 0.06, 0.05, DESK.d + 0.06);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      addSlab(woodMat, DESK.x + sx * (DESK.w / 2 - 0.22), DESK.h / 2 - 0.05, DESK.z + sz * (DESK.d / 2 - 0.2), 0.22, DESK.h - 0.1, 0.22);
    }
  }
  // Emerald leather writing pad.
  addSlab(emeraldMat, DESK.x, DESK.h + 0.08, DESK.z + 0.15, 2.6, 0.02, 1.4);

  /* --- Open rehal on the desk: crossed boards + blank manuscript pages --- */
  const boardGeo = track(new THREE.BoxGeometry(1.7, 0.1, 0.5));
  for (const tilt of [-0.6, 0.6]) {
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.rotation.z = tilt;
    board.position.set(DESK.x, DESK.h + 0.42, DESK.z - 0.35);
    board.castShadow = context.shadowsEnabled;
    scene3.add(board);
  }
  // Manuscript pages: aged ivory, deliberately blank — hadith text is never
  // painted into the scene; the DOM record card carries the governed text.
  const pageGeo = track(new THREE.BoxGeometry(0.78, 0.05, 1.05));
  const agedMat = track(new THREE.MeshStandardMaterial({ color: "#e8d9b0", roughness: 0.75 }));
  for (const side of [-1, 1]) {
    const page = new THREE.Mesh(pageGeo, agedMat);
    page.position.set(DESK.x + side * 0.41, DESK.h + 0.78, DESK.z - 0.35);
    page.rotation.z = side * -0.18;
    page.castShadow = context.shadowsEnabled;
    scene3.add(page);
  }
  const coverGeo = track(new THREE.BoxGeometry(1.72, 0.06, 1.16));
  const cover = new THREE.Mesh(coverGeo, emeraldMat);
  cover.position.set(DESK.x, DESK.h + 0.72, DESK.z - 0.35);
  scene3.add(cover);

  /* --- Inkwell + quill --- */
  const inkGeo = track(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 10));
  const ink = new THREE.Mesh(inkGeo, goldMat);
  ink.position.set(DESK.x + 1.35, DESK.h + 0.2, DESK.z - 0.1);
  scene3.add(ink);
  const quillGeo = track(new THREE.ConeGeometry(0.05, 0.9, 6));
  const quillMat = track(new THREE.MeshStandardMaterial({ color: "#f3e9d2", roughness: 0.6 }));
  const quill = new THREE.Mesh(quillGeo, quillMat);
  quill.position.set(DESK.x + 1.42, DESK.h + 0.62, DESK.z - 0.06);
  quill.rotation.z = -0.5;
  scene3.add(quill);

  /* --- Magnifier: brass ring + glass disc + handle --- */
  const lensRingGeo = track(new THREE.TorusGeometry(0.24, 0.035, 8, 28));
  const lensRing = new THREE.Mesh(lensRingGeo, goldMat);
  lensRing.rotation.x = -Math.PI / 2;
  lensRing.position.set(DESK.x - 1.5, DESK.h + 0.12, DESK.z + 0.4);
  scene3.add(lensRing);
  const glassGeo = track(new THREE.CircleGeometry(0.22, 24));
  glassGeo.rotateX(-Math.PI / 2);
  const glassMat = track(new THREE.MeshStandardMaterial({
    color: "#bcd8d2", transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.4,
  }));
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(DESK.x - 1.5, DESK.h + 0.12, DESK.z + 0.4);
  scene3.add(glass);
  const handleGeo = track(new THREE.CylinderGeometry(0.035, 0.045, 0.55, 8));
  const handle = new THREE.Mesh(handleGeo, woodMat);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = 0.5;
  handle.position.set(DESK.x - 1.95, DESK.h + 0.12, DESK.z + 0.62);
  scene3.add(handle);

  /* --- Rolled scroll with wax seal on the desk corner --- */
  const scrollGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 12));
  const scrollMat = track(new THREE.MeshStandardMaterial({ color: "#e2cfa0", roughness: 0.8 }));
  const scroll = new THREE.Mesh(scrollGeo, scrollMat);
  scroll.rotation.z = Math.PI / 2;
  scroll.rotation.y = 0.3;
  scroll.position.set(DESK.x + 1.5, DESK.h + 0.18, DESK.z + 0.65);
  scene3.add(scroll);
  const sealGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12));
  const sealMat = track(new THREE.MeshStandardMaterial({ color: "#8a1f24", roughness: 0.5 }));
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.position.set(DESK.x + 1.28, DESK.h + 0.2, DESK.z + 0.72);
  scene3.add(seal);

  /* --- Tufted scholar's chair behind the desk --- */
  const chairZ = DESK.z - 1.7;
  addSlab(woodMat, 0, 0.52, chairZ, 1.3, 0.14, 1.1); // seat frame
  addSlab(emeraldMat, 0, 0.62, chairZ, 1.2, 0.12, 1.0); // cushion
  addSlab(woodMat, 0, 1.45, chairZ - 0.55, 1.3, 1.8, 0.14); // back frame
  addSlab(emeraldMat, 0, 1.45, chairZ - 0.47, 1.14, 1.6, 0.08); // tufted back
  for (const sx of [-1, 1]) {
    addSlab(woodMat, sx * 0.58, 0.26, chairZ, 0.12, 0.52, 0.12);
    addSlab(woodMat, sx * 0.58, 0.26, chairZ - 0.45, 0.12, 0.52, 0.12);
    // Gold finials on the back posts.
    const finialGeo = track(new THREE.SphereGeometry(0.09, 10, 8));
    const finial = new THREE.Mesh(finialGeo, goldMat);
    finial.position.set(sx * 0.62, 2.42, chairZ - 0.55);
    scene3.add(finial);
  }
  // Tufting buttons: small gold studs on the back cushion.
  const studGeo = track(new THREE.SphereGeometry(0.03, 6, 5));
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const stud = new THREE.Mesh(studGeo, goldMat);
      stud.position.set(-0.35 + col * 0.35, 0.95 + row * 0.38, chairZ - 0.42);
      scene3.add(stud);
    }
  }

  /* --- Full-height binding walls on BOTH sides --- */
  const shelfGeo = track(new THREE.BoxGeometry(0.55, 0.1, 15));
  const bookGeo = track(new THREE.BoxGeometry(0.36, 1, 0.17));
  const bookMat = track(new THREE.MeshStandardMaterial({ roughness: 0.85 }));
  const bookPalette = ["#1d4a3c", "#5a3d22", "#7a1f24", "#274156", "#8a6a10", "#3c2f4a", "#20303a"].map(
    (hex) => new THREE.Color(hex),
  );
  const shelfCount = 5;
  const perShelf = context.graphicsTier === "low" ? 40 : 72;
  const bookCount = shelfCount * perShelf * 2;
  const books = new THREE.InstancedMesh(bookGeo, bookMat, bookCount);
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const bookColor = new THREE.Color();
  let cursor = 0;
  for (const side of [-1, 1]) {
    for (let s = 0; s < shelfCount; s += 1) {
      const shelf = new THREE.Mesh(shelfGeo, woodMat);
      shelf.position.set(side * (ROOM - 0.62), 0.9 + s * 1.05, -1.5);
      shelf.castShadow = context.shadowsEnabled;
      scene3.add(shelf);
      for (let i = 0; i < perShelf; i += 1) {
        const h = 0.6 + random() * 0.34;
        const z = -8.6 + i * 0.2 + (random() - 0.5) * 0.02;
        euler.set(0, (random() - 0.5) * 0.05, (random() - 0.5) * 0.05);
        quat.setFromEuler(euler);
        matrix.compose(
          new THREE.Vector3(side * (ROOM - 0.64), 0.95 + s * 1.05 + h / 2, z),
          quat,
          new THREE.Vector3(1, h, 0.8 + random() * 0.4),
        );
        books.setMatrixAt(cursor, matrix);
        bookColor.copy(bookPalette[Math.floor(random() * bookPalette.length)]);
        books.setColorAt(cursor, bookColor);
        cursor += 1;
      }
    }
  }
  books.castShadow = context.shadowsEnabled;
  scene3.add(books);

  /* --- Side table with manuscript scroll bundle (right, near verification corner) --- */
  addSlab(woodMat, 8.6, 0.78, -7.6, 2.2, 0.12, 1.2);
  for (const sx of [-1, 1]) {
    addSlab(woodMat, 8.6 + sx * 0.95, 0.39, -7.6, 0.14, 0.78, 1.0);
  }
  for (let i = 0; i < 4; i += 1) {
    const roll = new THREE.Mesh(scrollGeo, scrollMat);
    roll.rotation.z = Math.PI / 2;
    roll.rotation.y = (random() - 0.5) * 0.4;
    roll.position.set(8.6 + (random() - 0.5) * 0.5, 0.93 + (i > 1 ? 0.16 : 0), -7.85 + (i % 2) * 0.32);
    scene3.add(roll);
  }

  /* --- Brass astrolabe-style armillary on a pedestal (left of desk) --- */
  addSlab(mats.stone, -5.6, 0.55, -4.8, 0.8, 1.1, 0.8);
  const ringGeo = track(new THREE.TorusGeometry(0.5, 0.03, 8, 36));
  const armillary = new THREE.Group();
  for (const [rx, ry] of [[0, 0], [Math.PI / 3, 0], [0, Math.PI / 3]] as const) {
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = rx;
    ring.rotation.y = ry;
    armillary.add(ring);
  }
  const axisGeo = track(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 6));
  const axis = new THREE.Mesh(axisGeo, goldMat);
  axis.rotation.z = 0.4;
  armillary.add(axis);
  armillary.position.set(-5.6, 1.75, -4.8);
  scene3.add(armillary);

  // Slow contemplative rotation of the armillary — full motion only.
  return {
    onFrame(delta, _elapsed, state) {
      if (context.motion === "full") {
        armillary.rotation.y += delta * 0.12 * (0.4 + state.lampLevel * 0.6);
      }
    },
  };
}

export function HadithArchive3D({ scene, lampOn, overlay, onExit, onUnavailable }: HadithArchive3DProps) {
  return (
    <InteriorScene3D
      scene={scene}
      furnish={furnishArchive}
      lampOn={lampOn}
      overlay={overlay}
      visualId="hadith-archive"
      ariaLabelAr="دار الحديث ثلاثية الأبعاد — مساحة فنية للدراسة والتحقق"
      badgeAr="دار ثلاثية الأبعاد — دراسة وتخريج"
      exitLabelAr="الخروج إلى الأرشيف الكامل"
      onExit={onExit}
      onUnavailable={onUnavailable}
    />
  );
}

HadithArchive3D.displayName = "HadithArchive3D";
