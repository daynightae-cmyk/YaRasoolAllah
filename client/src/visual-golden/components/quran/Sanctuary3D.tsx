/**
 * Sanctuary3D — the Quran wing's genuine 3D reading environment (directive §4.D).
 *
 * A thin wing-specific furnishing over the shared InteriorScene3D shell and
 * interior-engine observer contract (extracted from this component after live
 * verification, commit c52347e5). The shared shell provides the pointed-arch
 * riwaq, colonnade, mashrabiya light window, mihrab niche, brass lanterns,
 * drag-look, eased node travel, reduced-motion and WebGL fallback.
 *
 * The sanctuary adds its own real geometry: the prayer rug, carved rehal and
 * deliberately blank mushaf shape, and the instanced book wall.
 *
 * Honesty: the space is a contemporary artistic interior inspired by Islamic
 * architecture — not a reconstruction of a documented historical building.
 * No Quran text is rendered into geometry or textures; the governed text
 * stays in the caller's DOM reading surfaces.
 */

import type { ReactNode } from "react";
import * as THREE from "three";
import { InteriorScene3D } from "@/visual-golden/components/three/InteriorScene3D";
import type { InteriorFurnishKit } from "@/visual-golden/components/three/interior-engine";
import type { InteriorSceneConfig } from "@/visual-golden/services/interior-scenes";

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

/** Sanctuary furnishing: rug + carved rehal + blank mushaf + book wall. */
function furnishSanctuary({ scene3, context, random, track, mats, ROOM }: InteriorFurnishKit) {
  const { wood: woodMat, gold: goldMat, ivory: ivoryMat, emerald: emeraldMat } = mats;

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
}

export function Sanctuary3D({ scene, lampOn, overlay, onExit, onUnavailable }: Sanctuary3DProps) {
  return (
    <InteriorScene3D
      scene={scene}
      furnish={furnishSanctuary}
      lampOn={lampOn}
      overlay={overlay}
      visualId="quran-sanctuary"
      ariaLabelAr="رواق القراءة ثلاثي الأبعاد — مساحة فنية للتدبر"
      badgeAr="رواق ثلاثي الأبعاد — قراءة وتدبر"
      exitLabelAr="الخروج إلى القراءة الكاملة"
      onExit={onExit}
      onUnavailable={onUnavailable}
    />
  );
}

Sanctuary3D.displayName = "Sanctuary3D";
