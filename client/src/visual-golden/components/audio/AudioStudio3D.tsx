/**
 * AudioStudio3D — the Audio wing's genuine 3D listening studio
 * (directive §4.E).
 *
 * A wing-specific furnishing over the shared InteriorScene3D shell and
 * interior-engine observer contract. Reference authority:
 * YRA_REFERENCE_PACK/02_ENVIRONMENT_ART/03_audio.png — a carved rehal holding
 * an ornate mushaf with headphones leaning on it, a round patterned carpet,
 * a floating golden sound ribbon with equalizer bars, a book niche with a
 * pierced brass lamp, and a dark smart speaker on a marble ledge.
 *
 * Honesty: contemporary artistic listening room, not a reconstruction of a
 * documented hall. No Quran text is rendered into geometry or textures — the
 * mushaf cover is pure geometric ornament and the governed text stays in the
 * Quran wing. The sound ribbon is an honest playback-state visualization: it
 * animates ONLY while governed audio is actually playing, freezes on pause
 * and under reduced motion, and never fabricates permanent motion. Reciter
 * names/streams come from the governed MP3Quran response in the DOM overlay.
 */

import type { ReactNode } from "react";
import * as THREE from "three";
import { InteriorScene3D } from "@/visual-golden/components/three/InteriorScene3D";
import type { InteriorFurnishKit, InteriorFurnishHooks } from "@/visual-golden/components/three/interior-engine";
import type { InteriorSceneConfig } from "@/visual-golden/services/interior-scenes";

interface AudioStudio3DProps {
  scene: InteriorSceneConfig;
  lampOn: boolean;
  /** True while the governed stream is actually playing. */
  playing: boolean;
  /** DOM listening card rendered over the scene — real controls live here. */
  overlay?: ReactNode;
  onExit: () => void;
  onUnavailable: () => void;
}

/** Studio furnishing: rehal + headphones, carpet, sound ribbon, catalog, speaker. */
function furnishStudio({ scene3, context, random, track, mats, addSlab, ROOM }: InteriorFurnishKit): InteriorFurnishHooks {
  const { wood: woodMat, gold: goldMat, stone: stoneMat, ivory: ivoryMat } = mats;

  /* --- Round listening carpet under the rehal (reference art) --- */
  const carpetMat = track(new THREE.MeshStandardMaterial({ color: "#123f33", roughness: 0.95 }));
  const carpetGeo = track(new THREE.CircleGeometry(2.7, 48));
  carpetGeo.rotateX(-Math.PI / 2);
  const carpet = new THREE.Mesh(carpetGeo, carpetMat);
  carpet.position.set(0, 0.02, -2.2);
  carpet.receiveShadow = context.shadowsEnabled;
  scene3.add(carpet);
  const carpetRingGeo = track(new THREE.TorusGeometry(2.45, 0.035, 6, 64));
  const carpetRing = new THREE.Mesh(carpetRingGeo, goldMat);
  carpetRing.rotation.x = -Math.PI / 2;
  carpetRing.position.set(0, 0.035, -2.2);
  scene3.add(carpetRing);
  const carpetInnerGeo = track(new THREE.TorusGeometry(1.7, 0.025, 6, 56));
  const carpetInner = new THREE.Mesh(carpetInnerGeo, goldMat);
  carpetInner.rotation.x = -Math.PI / 2;
  carpetInner.position.set(0, 0.035, -2.2);
  scene3.add(carpetInner);
  // Radial stitch marks — real thin bars, not a texture.
  const stitchGeo = track(new THREE.BoxGeometry(0.05, 0.012, 0.34));
  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * Math.PI * 2;
    const stitch = new THREE.Mesh(stitchGeo, goldMat);
    stitch.position.set(Math.sin(angle) * 2.08, 0.035, -2.2 + Math.cos(angle) * 2.08);
    stitch.rotation.y = angle;
    scene3.add(stitch);
  }

  /* --- Carved rehal (X-frame book stand) + ornate mushaf --- */
  const REHAL = { x: 0.2, z: -2.4 };
  const rehalGroup = new THREE.Group();
  const boardGeo = track(new THREE.BoxGeometry(1.5, 0.09, 1.05));
  for (const side of [-1, 1]) {
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.rotation.x = side * 0.62;
    board.position.set(0, 0.62, side * 0.28);
    board.castShadow = context.shadowsEnabled;
    rehalGroup.add(board);
    // Lattice cut-work on the lower board faces: thin crossed slats.
    const slatGeo = track(new THREE.BoxGeometry(0.05, 0.05, 0.9));
    for (let i = 0; i < 5; i += 1) {
      const slat = new THREE.Mesh(slatGeo, goldMat);
      slat.rotation.x = side * 0.62;
      slat.rotation.y = 0.5;
      slat.position.set(-0.55 + i * 0.28, 0.5 + i * 0.02, side * 0.3);
      rehalGroup.add(slat);
    }
  }
  const hingeGeo = track(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8));
  const hinge = new THREE.Mesh(hingeGeo, goldMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.86, 0);
  rehalGroup.add(hinge);
  // Foot rails.
  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(boardGeo, woodMat);
    foot.scale.set(1, 0.6, 0.35);
    foot.position.set(0, 0.06, side * 0.62);
    rehalGroup.add(foot);
  }
  rehalGroup.position.set(REHAL.x, 0, REHAL.z);
  rehalGroup.rotation.y = 0.16;
  scene3.add(rehalGroup);

  // Mushaf: emerald cover + gold geometric ornament (NO text anywhere).
  const mushafGroup = new THREE.Group();
  const coverGeo = track(new THREE.BoxGeometry(1.15, 0.12, 0.85));
  const coverMat = track(new THREE.MeshStandardMaterial({ color: "#14453a", roughness: 0.6 }));
  const cover = new THREE.Mesh(coverGeo, coverMat);
  cover.castShadow = context.shadowsEnabled;
  mushafGroup.add(cover);
  const pageGeo = track(new THREE.BoxGeometry(1.08, 0.09, 0.78));
  const pages = new THREE.Mesh(pageGeo, ivoryMat);
  pages.position.y = -0.02;
  mushafGroup.add(pages);
  // Gold border frame on the cover.
  const frameLongGeo = track(new THREE.BoxGeometry(1.05, 0.02, 0.05));
  const frameShortGeo = track(new THREE.BoxGeometry(0.05, 0.02, 0.75));
  for (const side of [-1, 1]) {
    const long = new THREE.Mesh(frameLongGeo, goldMat);
    long.position.set(0, 0.065, side * 0.36);
    mushafGroup.add(long);
    const short = new THREE.Mesh(frameShortGeo, goldMat);
    short.position.set(side * 0.5, 0.065, 0);
    mushafGroup.add(short);
  }
  // Central medallion: diamond + ring + corner dots — pure geometry.
  const medallionGeo = track(new THREE.BoxGeometry(0.3, 0.02, 0.3));
  const medallion = new THREE.Mesh(medallionGeo, goldMat);
  medallion.rotation.y = Math.PI / 4;
  medallion.position.y = 0.07;
  mushafGroup.add(medallion);
  const medallionRingGeo = track(new THREE.TorusGeometry(0.24, 0.018, 6, 28));
  const medallionRing = new THREE.Mesh(medallionRingGeo, goldMat);
  medallionRing.rotation.x = -Math.PI / 2;
  medallionRing.position.y = 0.07;
  mushafGroup.add(medallionRing);
  const dotGeo = track(new THREE.SphereGeometry(0.035, 8, 6));
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const dot = new THREE.Mesh(dotGeo, goldMat);
      dot.position.set(sx * 0.4, 0.07, sz * 0.27);
      mushafGroup.add(dot);
    }
  }
  // Rest the mushaf on the upper board of the rehal.
  mushafGroup.position.set(REHAL.x, 1.02, REHAL.z - 0.16);
  mushafGroup.rotation.x = -0.62;
  mushafGroup.rotation.y = 0.16;
  scene3.add(mushafGroup);

  /* --- Headphones leaning against the rehal (reference art) --- */
  const phonesGroup = new THREE.Group();
  const shellMat = track(new THREE.MeshStandardMaterial({ color: "#20242a", roughness: 0.45, metalness: 0.35 }));
  const cushionMat = track(new THREE.MeshStandardMaterial({ color: "#101318", roughness: 0.9 }));
  const bandGeo = track(new THREE.TorusGeometry(0.42, 0.05, 10, 32, Math.PI));
  const band = new THREE.Mesh(bandGeo, shellMat);
  band.position.y = 0.42;
  phonesGroup.add(band);
  const bandPadGeo = track(new THREE.TorusGeometry(0.4, 0.035, 8, 24, Math.PI * 0.7));
  const bandPad = new THREE.Mesh(bandPadGeo, cushionMat);
  bandPad.rotation.z = Math.PI * 0.15;
  bandPad.position.y = 0.42;
  phonesGroup.add(bandPad);
  const cupGeo = track(new THREE.CylinderGeometry(0.19, 0.21, 0.12, 18));
  const cushionGeo = track(new THREE.TorusGeometry(0.16, 0.05, 8, 20));
  const faceGeo = track(new THREE.CircleGeometry(0.17, 20));
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(cupGeo, shellMat);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(side * 0.42, 0.05, 0);
    cup.castShadow = context.shadowsEnabled;
    phonesGroup.add(cup);
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.rotation.y = Math.PI / 2;
    cushion.position.set(side * 0.35, 0.05, 0);
    phonesGroup.add(cushion);
    // Outer face with a small gold equalizer glyph (three bars, geometry).
    const face = new THREE.Mesh(faceGeo, shellMat);
    face.rotation.y = side * Math.PI / 2;
    face.position.set(side * 0.49, 0.05, 0);
    phonesGroup.add(face);
    const glyphGeo = track(new THREE.BoxGeometry(0.012, 0.07, 0.02));
    for (let i = 0; i < 3; i += 1) {
      const bar = new THREE.Mesh(glyphGeo, goldMat);
      bar.scale.y = 0.6 + (i === 1 ? 0.8 : 0.2);
      bar.position.set(side * 0.5, 0.05, -0.05 + i * 0.05);
      phonesGroup.add(bar);
    }
  }
  phonesGroup.position.set(REHAL.x - 0.85, 0.06, REHAL.z + 0.42);
  phonesGroup.rotation.z = 0.5; // leaning on the rehal like the reference art
  phonesGroup.rotation.y = 0.5;
  scene3.add(phonesGroup);

  /* --- Floating golden sound ribbon + equalizer bars (honest playback viz) --- */
  // The ribbon is a real tube following a gentle wave across the back of the
  // room; its amplitude breathes ONLY while playbackLevel > 0 (real playing
  // state, eased by the engine) and freezes at a flat rest pose otherwise.
  const RIBBON = { y: 2.6, z: -8.2, span: 15 };
  const ribbonPoints: THREE.Vector3[] = [];
  const ribbonSegments = 48;
  for (let i = 0; i <= ribbonSegments; i += 1) {
    const t = i / ribbonSegments;
    ribbonPoints.push(new THREE.Vector3(-RIBBON.span / 2 + t * RIBBON.span, 0, 0));
  }
  const ribbonCurve = new THREE.CatmullRomCurve3(ribbonPoints);
  const ribbonGeo = track(new THREE.TubeGeometry(ribbonCurve, 96, 0.022, 6, false));
  const ribbonMat = track(new THREE.MeshStandardMaterial({
    color: "#e8c547", emissive: new THREE.Color("#c79a1e"), emissiveIntensity: 0.7,
    roughness: 0.35, metalness: 0.5, transparent: true, opacity: 0.9,
  }));
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.set(0, RIBBON.y, RIBBON.z);
  scene3.add(ribbon);
  // A second, offset strand for the layered ribbon look of the reference.
  const ribbon2 = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon2.position.set(0, RIBBON.y + 0.16, RIBBON.z - 0.25);
  ribbon2.scale.set(0.96, 1, 1);
  scene3.add(ribbon2);
  const ribbonBase = ribbonGeo.attributes.position.array.slice() as Float32Array;

  // Equalizer bars at the ribbon's heart — heights follow playback, never a
  // permanent fake dance. At rest they hold a small honest idle silhouette.
  const eqGroup = new THREE.Group();
  const eqBarGeo = track(new THREE.BoxGeometry(0.07, 1, 0.07));
  const eqMat = track(new THREE.MeshStandardMaterial({
    color: "#f0d060", emissive: new THREE.Color("#d4a017"), emissiveIntensity: 0.9,
    roughness: 0.4, metalness: 0.4,
  }));
  const eqBars: THREE.Mesh[] = [];
  const eqCount = 21;
  for (let i = 0; i < eqCount; i += 1) {
    const bar = new THREE.Mesh(eqBarGeo, eqMat);
    const rest = 0.16 + Math.sin((i / (eqCount - 1)) * Math.PI) * 0.3;
    bar.scale.y = rest;
    bar.position.set(-2.1 + i * 0.21, rest / 2, 0);
    bar.userData.rest = rest;
    bar.userData.phase = random() * Math.PI * 2;
    eqGroup.add(bar);
    eqBars.push(bar);
  }
  eqGroup.position.set(0, RIBBON.y - 0.55, RIBBON.z + 0.4);
  scene3.add(eqGroup);
  const ribbonLight = new THREE.PointLight("#ffd27a", 0.9, 10, 1.8);
  ribbonLight.position.set(0, RIBBON.y, RIBBON.z + 1.2);
  scene3.add(ribbonLight);
  // Soft wash on the back wall so the ribbon reads against architecture,
  // not a black void (the shared key light sits mid-room).
  const ribbonWash = new THREE.PointLight("#ffc27a", 1.0, 14, 1.8);
  ribbonWash.position.set(0, 3.2, -10.6);
  scene3.add(ribbonWash);

  /* --- Reciter catalog cabinet (left wall): album spines + brass plates --- */
  const CAB = { x: -(ROOM - 0.75), z: -1.6, w: 1.0, d: 10.5, h: 3.6 };
  const cabinetMat = track(new THREE.MeshStandardMaterial({ color: "#5a4026", roughness: 0.72 }));
  addSlab(cabinetMat, CAB.x, CAB.h / 2, CAB.z, CAB.w, CAB.h, CAB.d);
  addSlab(goldMat, CAB.x, CAB.h + 0.06, CAB.z, CAB.w + 0.12, 0.12, CAB.d + 0.12);
  addSlab(cabinetMat, CAB.x, 0.12, CAB.z, CAB.w + 0.16, 0.24, CAB.d + 0.16);
  // Two shelf rows of record albums (spines out, like a recitation library).
  const spinePalette = ["#14453a", "#5a3d22", "#7a1f24", "#1d3a5f", "#3d2a52"];
  const spineGeo = track(new THREE.BoxGeometry(0.16, 0.86, 0.14));
  const plateGeo = track(new THREE.BoxGeometry(0.03, 0.3, 0.1));
  const faceX = CAB.x + CAB.w / 2 + 0.02;
  let spineCursor = 0;
  for (const shelfY of [1.05, 2.35]) {
    addSlab(woodMat, CAB.x + 0.1, shelfY - 0.48, CAB.z, CAB.w - 0.2, 0.08, CAB.d - 0.3);
    for (let i = 0; i < 30; i += 1) {
      const z = CAB.z - CAB.d / 2 + 0.5 + i * 0.33 + (random() - 0.5) * 0.03;
      const spineMat = track(new THREE.MeshStandardMaterial({
        color: spinePalette[spineCursor % spinePalette.length], roughness: 0.75,
      }));
      const spine = new THREE.Mesh(spineGeo, spineMat);
      spine.position.set(faceX + 0.05, shelfY, z);
      spine.rotation.x = (random() - 0.5) * 0.06;
      spine.castShadow = context.shadowsEnabled;
      scene3.add(spine);
      const plate = new THREE.Mesh(plateGeo, goldMat);
      plate.position.set(faceX + 0.14, shelfY + 0.1, z);
      scene3.add(plate);
      spineCursor += 1;
    }
  }
  // Pierced brass lamp on the cabinet top (reference niche lamp).
  const lampBaseGeo = track(new THREE.CylinderGeometry(0.16, 0.22, 0.1, 12));
  const lampBase = new THREE.Mesh(lampBaseGeo, goldMat);
  lampBase.position.set(CAB.x + 0.1, CAB.h + 0.17, CAB.z + 3.2);
  scene3.add(lampBase);
  const lampDomeGeo = track(new THREE.SphereGeometry(0.26, 14, 10));
  const lampDomeMat = track(new THREE.MeshStandardMaterial({
    color: "#d4a017", roughness: 0.4, metalness: 0.7,
    emissive: new THREE.Color("#8a6a10"), emissiveIntensity: 0.5,
  }));
  const lampDome = new THREE.Mesh(lampDomeGeo, lampDomeMat);
  lampDome.position.set(CAB.x + 0.1, CAB.h + 0.45, CAB.z + 3.2);
  scene3.add(lampDome);
  const lampFinialGeo = track(new THREE.ConeGeometry(0.06, 0.18, 8));
  const lampFinial = new THREE.Mesh(lampFinialGeo, goldMat);
  lampFinial.position.set(CAB.x + 0.1, CAB.h + 0.78, CAB.z + 3.2);
  scene3.add(lampFinial);

  /* --- Smart speaker on a marble ledge (right wall, reference art) --- */
  const LEDGE = { x: ROOM - 1.1, z: -4.6 };
  addSlab(stoneMat, LEDGE.x, 0.55, LEDGE.z, 1.6, 1.1, 2.6);
  addSlab(goldMat, LEDGE.x, 1.12, LEDGE.z, 1.7, 0.06, 2.7);
  const speakerMat = track(new THREE.MeshStandardMaterial({ color: "#181c20", roughness: 0.5, metalness: 0.3 }));
  const speakerGeo = track(new THREE.CapsuleGeometry(0.34, 0.7, 6, 16));
  const speaker = new THREE.Mesh(speakerGeo, speakerMat);
  speaker.rotation.z = Math.PI / 2;
  speaker.position.set(LEDGE.x - 0.1, 1.5, LEDGE.z);
  speaker.castShadow = context.shadowsEnabled;
  scene3.add(speaker);
  // Speaker status glyph: a row of tiny gold bars on its face — they follow
  // the same honest playback level as the ribbon (no permanent fake motion).
  const speakerBars: THREE.Mesh[] = [];
  const speakerBarGeo = track(new THREE.BoxGeometry(0.02, 0.1, 0.02));
  for (let i = 0; i < 7; i += 1) {
    const bar = new THREE.Mesh(speakerBarGeo, eqMat);
    const rest = 0.5 + Math.sin((i / 6) * Math.PI) * 0.5;
    bar.scale.y = rest;
    bar.position.set(LEDGE.x - 0.45, 1.5, LEDGE.z - 0.24 + i * 0.08);
    bar.userData.rest = rest;
    bar.userData.phase = random() * Math.PI * 2;
    scene3.add(bar);
    speakerBars.push(bar);
  }

  /* --- Reading lights: catalog face, rehal heart, speaker ledge --- */
  const catalogLight = new THREE.PointLight("#ffc27a", 1.5, 10, 1.7);
  catalogLight.position.set(CAB.x + 2.2, 3.2, CAB.z + 0.6);
  scene3.add(catalogLight);
  const catalogFill = new THREE.PointLight("#ffc27a", 1.0, 9, 1.7);
  catalogFill.position.set(CAB.x + 1.8, 1.5, CAB.z + 2.0);
  scene3.add(catalogFill);
  const rehalLight = new THREE.PointLight("#ffc27a", 2.2, 9, 1.7);
  rehalLight.position.set(REHAL.x + 0.4, 2.5, REHAL.z + 1.3);
  scene3.add(rehalLight);
  const ledgeLight = new THREE.PointLight("#ffc27a", 1.0, 8, 1.7);
  ledgeLight.position.set(LEDGE.x - 1.4, 2.8, LEDGE.z + 0.6);
  scene3.add(ledgeLight);

  /* --- Honest playback animation + lamp response --- */
  // The ribbon wave and equalizer heights are functions of playbackLevel
  // (the engine's eased real playing state). At playbackLevel 0 everything
  // holds its rest pose — a paused stream never animates. Under reduced
  // motion the engine snaps levels and the runtime renders discrete frames,
  // so no continuous motion is ever produced.
  const updatePlaybackViz = (level: number, elapsed: number) => {
    const pos = ribbonGeo.attributes.position as THREE.BufferAttribute;
    const amp = 0.34 * level;
    for (let i = 0; i < pos.count; i += 1) {
      const x = ribbonBase[i * 3];
      const wave = Math.sin(x * 0.55 + elapsed * 1.4) * Math.cos(x * 0.23 - elapsed * 0.6);
      pos.setY(i, ribbonBase[i * 3 + 1] + wave * amp);
      pos.setZ(i, ribbonBase[i * 3 + 2] + Math.sin(x * 0.4 + elapsed * 0.8) * amp * 0.4);
    }
    pos.needsUpdate = true;
    // The tube's normals were computed for the rest pose; recompute so the
    // displaced wave shades correctly (bounded: ~700 verts, playback only).
    ribbonGeo.computeVertexNormals();
    for (const bar of eqBars) {
      const rest = bar.userData.rest as number;
      const phase = bar.userData.phase as number;
      const live = 0.25 + Math.abs(Math.sin(elapsed * 2.2 + phase)) * 0.85;
      const height = rest + (live - rest) * level;
      bar.scale.y = height;
      bar.position.y = height / 2;
    }
    for (const bar of speakerBars) {
      const rest = bar.userData.rest as number;
      const phase = bar.userData.phase as number;
      const live = 0.4 + Math.abs(Math.sin(elapsed * 2.6 + phase)) * 0.9;
      bar.scale.y = rest + (live - rest) * level;
    }
    ribbonMat.emissiveIntensity = 0.35 + level * 0.75;
    eqMat.emissiveIntensity = 0.4 + level * 0.8;
    ribbonLight.intensity = 0.3 + level * 1.1;
    // Discrete-frame renders only happen on invalidate — a pose change must
    // request one (reduced motion never animates continuously).
    context.invalidate();
  };

  let appliedLevel = 0;
  return {
    onFrame(_delta, elapsed, state) {
      if (context.motion === "full") {
        // Animate only while there is real playback level (or its decay tail);
        // a paused stream holds its rest pose with zero per-frame work.
        if (state.playbackLevel > 0.002 || appliedLevel > 0.002) {
          updatePlaybackViz(state.playbackLevel, elapsed);
          appliedLevel = state.playbackLevel;
        }
      } else if (Math.abs(state.playbackLevel - appliedLevel) > 0.002) {
        // Discrete frames: one static pose per playback-state change — the
        // visitor sees playing vs paused without any continuous motion.
        updatePlaybackViz(state.playbackLevel, 1.2);
        appliedLevel = state.playbackLevel;
      }
    },
    onLamp(level) {
      catalogLight.intensity = 0.15 + level * 1.4;
      catalogFill.intensity = 0.1 + level * 0.95;
      rehalLight.intensity = 0.15 + level * 2.1;
      ledgeLight.intensity = 0.1 + level * 0.9;
      ribbonWash.intensity = 0.12 + level * 0.95;
      lampDomeMat.emissiveIntensity = 0.15 + level * 0.5;
      // Re-apply the current honest pose (rest when paused) after lamp change.
      updatePlaybackViz(Math.max(0, appliedLevel), 1.2);
    },
  };
}

export function AudioStudio3D({ scene, lampOn, playing, overlay, onExit, onUnavailable }: AudioStudio3DProps) {
  return (
    <InteriorScene3D
      scene={scene}
      furnish={furnishStudio}
      lampOn={lampOn}
      playing={playing}
      overlay={overlay}
      visualId="audio-studio"
      ariaLabelAr="استوديو التلاوة ثلاثي الأبعاد — مساحة استماع فنية ببث حقيقي مرخّص"
      badgeAr="استوديو ثلاثي الأبعاد — استماع حقيقي"
      exitLabelAr="الخروج إلى استوديو الصوت الكامل"
      onExit={onExit}
      onUnavailable={onUnavailable}
    />
  );
}

AudioStudio3D.displayName = "AudioStudio3D";