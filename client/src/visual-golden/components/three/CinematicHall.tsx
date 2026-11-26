import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { ThreeRuntime, type ThreeSceneHandle, type ThreeRuntimeState } from "./three-runtime";
import styles from "./CinematicHall.module.css";

export type HallView = "explore" | "interactive" | "cinema";

interface HallProps {
  room: "noor" | "quran";
  view: HallView;
  illuminated: boolean;
}

interface HallHandle extends ThreeSceneHandle {
  updateView(view: HallView): void;
  updateLighting(illuminated: boolean): void;
}

export default function CinematicHall({ room, view, illuminated }: HallProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const sceneRef = useRef<HallHandle | null>(null);
  const viewRef = useRef(view);
  const lightingRef = useRef(illuminated);
  const motion = useEffectiveMotion();
  const [state, setState] = useState<ThreeRuntimeState>("idle");

  useEffect(() => {
    viewRef.current = view;
    sceneRef.current?.updateView(view);
  }, [view]);

  useEffect(() => {
    lightingRef.current = illuminated;
    sceneRef.current?.updateLighting(illuminated);
  }, [illuminated]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const runtime = new ThreeRuntime({
      host,
      motion,
      onStateChange: setState,
      adapter: {
        build({ renderer, invalidate, graphicsTier }) {
          const scene = new THREE.Scene();
          scene.background = new THREE.Color("#172748");
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.17;
          renderer.outputColorSpace = THREE.SRGBColorSpace;

          const camera = new THREE.PerspectiveCamera(53, 1, .15, 100);
          const orbit = new OrbitControls(camera, renderer.domElement);
          orbit.enablePan = false;
          orbit.minDistance = 13;
          orbit.maxDistance = 32;
          orbit.minPolarAngle = Math.PI * .27;
          orbit.maxPolarAngle = Math.PI * .49;
          orbit.addEventListener("change", invalidate);

          const reflectionRoom = new RoomEnvironment();
          const pmrem = new THREE.PMREMGenerator(renderer);
          const reflections = pmrem.fromScene(reflectionRoom, .08);
          scene.environment = reflections.texture;
          scene.environmentIntensity = .62;
          reflectionRoom.dispose();
          pmrem.dispose();

          const geometries = new Set<THREE.BufferGeometry>();
          const materials = new Set<THREE.Material>();
          const textures = new Set<THREE.Texture>();
          const sample = (path: string, left: number, bottom: number, width: number, height: number) => {
            const texture = new THREE.TextureLoader().load(path, invalidate);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.offset.set(left, bottom);
            texture.repeat.set(width, height);
            texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
            textures.add(texture);
            return texture;
          };
          const material = (settings: THREE.MeshStandardMaterialParameters) => {
            const value = new THREE.MeshStandardMaterial(settings);
            materials.add(value);
            return value;
          };
          const blue = material({ color: "#24478a", roughness: .46, metalness: .2 });
          const emerald = material({ color: "#175b4d", roughness: .52, metalness: .15 });
          const brass = material({ color: "#e2a64c", roughness: .27, metalness: .74 });
          const rim = material({ color: "#ffdd9b", emissive: "#ff9e24", emissiveIntensity: 1.65 });
          const ivory = material({ color: "#ba9364", roughness: .53 });
          const stone = sample("/visual-golden/art/worlds/quran.webp", .72, .06, .21, .12);
          const lattice = sample("/visual-golden/art/worlds/audio.webp", .082, .595, .105, .17);
          const marble = material({ color: "#ead5b8", map: stone, roughness: .19, metalness: .36 });
          const alternateTile = material({ color: "#98adc8", map: stone, roughness: .26, metalness: .31 });
          const velvet = material({ color: "#183574", roughness: .87 });
          const glass = material({ color: "#e7bd70", map: lattice, emissive: "#a76c32", emissiveMap: lattice, emissiveIntensity: .62, roughness: .29 });
          const led = material({ color: "#254776", emissive: "#204676", emissiveIntensity: .35 });
          const wood = material({ color: "#6b3e20", roughness: .53 });
          const page = material({ color: "#ffedc6", roughness: .59 });
          const equipment = material({ color: "#252a38", roughness: .41, metalness: .42 });

          const add = (geometry: THREE.BufferGeometry, finish: THREE.Material, x: number, y: number, z: number) => {
            geometries.add(geometry);
            const mesh = new THREE.Mesh(geometry, finish);
            mesh.position.set(x, y, z);
            mesh.receiveShadow = true;
            scene.add(mesh);
            return mesh;
          };
          const box = (w: number, h: number, d: number, finish: THREE.Material, x: number, y: number, z: number) =>
            add(new THREE.BoxGeometry(w, h, d), finish, x, y, z);
          const cylinder = (r: number, h: number, finish: THREE.Material, x: number, y: number, z: number) =>
            add(new THREE.CylinderGeometry(r, r, h, 64), finish, x, y, z);
          const arch = (span: number, rise: number, base: number, depth: number, thickness: number, finish: THREE.Material) => {
            const tip = new THREE.Vector3(0, base + rise, depth);
            const path = new THREE.CurvePath<THREE.Vector3>();
            path.add(new THREE.CubicBezierCurve3(
              new THREE.Vector3(-span, base, depth), new THREE.Vector3(-span, base + rise * .69, depth),
              new THREE.Vector3(-span * .38, base + rise * .79, depth), tip,
            ));
            path.add(new THREE.CubicBezierCurve3(
              tip, new THREE.Vector3(span * .38, base + rise * .79, depth),
              new THREE.Vector3(span, base + rise * .69, depth), new THREE.Vector3(span, base, depth),
            ));
            add(new THREE.TubeGeometry(path, 56, thickness, 7, false), finish, 0, 0, 0);
          };

          const ambient = new THREE.HemisphereLight("#fff2d9", "#426bbb", .92);
          scene.add(ambient);
          const key = new THREE.DirectionalLight("#ffe2b1", 1.48);
          key.position.set(-7, 14, 10);
          if (graphicsTier === "high") {
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            key.shadow.camera.left = -15;
            key.shadow.camera.right = 15;
            key.shadow.camera.bottom = -16;
            key.shadow.camera.top = 16;
            key.shadow.normalBias = .025;
          }
          scene.add(key);

          const stageSpots = [-6, 0, 6].map((x) => {
            const spot = new THREE.SpotLight("#ffce8b", 190, 28, .49, .68, 2);
            spot.position.set(x, 11.8, -2);
            spot.target.position.set(x * .55, 0, -9);
            scene.add(spot, spot.target);
            return spot;
          });

          box(31, .2, 51, marble, 0, -.2, 3);
          const tileGeometry = new THREE.BoxGeometry(3.42, .035, 3.42);
          for (let row = 0; row < 13; row += 1) {
            for (let column = -4; column <= 4; column += 1) {
              add(tileGeometry, (row + column) % 2 ? alternateTile : marble, column * 3.45, -.079, -16 + row * 3.45);
            }
          }
          box(30, 14, .6, blue, 0, 7, -19);
          box(31, .4, 48, blue, 0, 13.1, 3);
          const depths = [-16, -8, 1, 10, 21];
          const flute = new THREE.CylinderGeometry(.044, .036, 4.52, 6);
          const flutes = new THREE.InstancedMesh(flute, brass, depths.length * 2 * 12);
          const transform = new THREE.Matrix4();
          let fluteIndex = 0;
          geometries.add(flute);
          scene.add(flutes);
          const practicals: THREE.PointLight[] = [];
          for (const depth of depths) {
            arch(11, 6.1, 5.3, depth, .31, ivory);
            arch(10.78, 5.93, 5.3, depth + .27, .09, brass);
            arch(10.63, 5.8, 5.3, depth + .35, .033, rim);
            arch(10.27, 5.6, 5.32, depth + .28, .12, blue);
            arch(10.17, 5.49, 5.32, depth + .37, .047, brass);
            for (const side of [-1, 1]) {
              const x = side * 11;
              cylinder(.61, .4, ivory, x, .2, depth).castShadow = true;
              cylinder(.38, 4.9, ivory, x, 2.78, depth).castShadow = true;
              cylinder(.62, .28, brass, x, 5.3, depth);
              cylinder(.49, .17, rim, x, 5.09, depth);
              for (let rib = 0; rib < 12; rib += 1) {
                const angle = rib * Math.PI / 6;
                transform.makeTranslation(x + Math.cos(angle) * .385, 2.74, depth + Math.sin(angle) * .385);
                flutes.setMatrixAt(fluteIndex++, transform);
              }
              box(.24, 4.5, 4.35, glass, side * 13.55, 5.7, depth + 2);
              box(.3, .24, 4.65, brass, side * 13.23, 3.45, depth + 2);
              box(.23, 2.4, 4.7, emerald, side * 13.53, 1.2, depth + 2);
              for (const offset of [-1.46, 0, 1.46]) {
                box(.24, 4.34, .076, brass, side * 13.39, 5.7, depth + 2 + offset);
              }
              for (const height of [4.25, 5.7, 7.15]) {
                box(.24, .076, 4.3, brass, side * 13.39, height, depth + 2);
              }
              const lanternX = side * 9.15;
              cylinder(.028, 2.7, brass, lanternX, 9.15, depth);
              add(new THREE.OctahedronGeometry(.49), rim, lanternX, 7.5, depth);
              add(new THREE.TorusGeometry(.39, .064, 7, 16), brass, lanternX, 7.5, depth).rotation.x = Math.PI / 2;
              if (depth === -8 || depth === 10) {
                const glow = new THREE.PointLight("#ffc052", 72, 12, 2);
                glow.position.set(lanternX, 7.45, depth + .25);
                practicals.push(glow);
                scene.add(glow);
              }
            }
          }
          flutes.instanceMatrix.needsUpdate = true;

          for (const [radius, height, y] of [[7.7, .23, .12], [7.28, .26, .34], [6.78, .31, .61]]) {
            cylinder(radius, height, blue, 0, y, -8.2).castShadow = true;
            cylinder(radius + .018, .043, rim, 0, y + height / 2, -8.2);
          }
          const medallion = add(new THREE.RingGeometry(2.22, 2.28, 48), brass, 0, .78, -8.2);
          medallion.rotation.x = -Math.PI / 2;
          for (let point = 0; point < 16; point += 1) {
            const angle = point * Math.PI / 8;
            const ornament = box(.072, .019, 1.44, brass, Math.sin(angle) * 1.35, .785, -8.2 + Math.cos(angle) * 1.35);
            ornament.rotation.y = angle + Math.PI / 9;
          }

          const screen = new THREE.PlaneGeometry(15.8, 5.65, 36, 1);
          const screenPositions = screen.attributes.position;
          for (let index = 0; index < screenPositions.count; index += 1) {
            screenPositions.setZ(index, (screenPositions.getX(index) / 7.9) ** 2 * .72);
          }
          screen.computeVertexNormals();
          add(screen, led, 0, 5.15, -16.2);
          for (const y of [2.29, 8.02]) {
            const points = Array.from({ length: 17 }, (_, index) => {
              const x = (index / 16 - .5) * 15.94;
              return new THREE.Vector3(x, y, -16.13 + (x / 7.97) ** 2 * .72);
            });
            add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 42, .058, 7, false), rim, 0, 0, 0);
          }
          for (const side of [-1, 1]) {
            box(.1, 5.75, .12, rim, side * 7.97, 5.15, -15.43);
            box(2.1, 5.25, .28, brass, side * 9.72, 5, -16.25);
            box(1.91, 5.06, .3, led, side * 9.72, 5, -16.07);
          }

          const seatBase = new RoundedBoxGeometry(1.05, .38, .92, 2, .12);
          const seatBack = new RoundedBoxGeometry(1.05, 1.06, .25, 2, .09);
          const seatArm = new RoundedBoxGeometry(.10, .24, .92, 1, .045);
          for (let row = 0; row < 5; row += 1) {
            for (const side of [-1, 1]) {
              for (let seat = 0; seat < 3; seat += 1) {
                const x = side * (4.1 + seat * 1.39 + row * .23);
                const z = 4.8 + row * 2.23;
                add(seatBase, velvet, x, .44, z).castShadow = true;
                add(seatBack, velvet, x, .83, z + .41).castShadow = true;
                add(seatArm, brass, x + .56, .63, z);
                add(seatArm, brass, x - .56, .63, z);
              }
            }
          }

          if (room === "quran") {
            // Central circular illuminated platform — sapphire and gold stage.
            const platform = add(
              new THREE.CylinderGeometry(5.2, 5.2, .18, 64),
              brass,
              0, .1, -9.2,
            );
            platform.receiveShadow = true;
            const platformGlow = new THREE.PointLight("#e8c547", 120, 14, 2);
            platformGlow.position.set(0, 1.2, -9.2);
            scene.add(platformGlow);
            const platformRing = add(
              new THREE.RingGeometry(4.6, 5.4, 64),
              rim,
              0, .12, -9.19,
            );
            platformRing.rotation.x = -Math.PI / 2;

            // Elegant Quran stands — open Mushaf on carved wooden lecterns.
            for (const side of [-1, 1]) {
              box(.89, .16, 1.75, wood, side * .36, 1.18, -7.12).rotation.z = side * .6;
              box(1.1, .13, 1.52, brass, side * .56, 1.59, -7.12).rotation.z = side * -.16;
              box(1.06, .135, 1.48, page, side * .55, 1.66, -7.12).rotation.z = side * -.16;
              // Gilded stand ornament.
              add(new THREE.TorusGeometry(.14, .03, 8, 16), brass, side * .55, 1.76, -7.12);
              const x = side * 5.75;
              box(1.02, .55, .55, equipment, x, 2.24, -.55);
              cylinder(.087, 1.99, equipment, x, 1, -.55);
              cylinder(.46, .08, equipment, x, .06, -.55);
            }
            cylinder(.045, 1.67, brass, 2.75, 1.6, -7.15);
            add(new THREE.CapsuleGeometry(.11, .25, 4, 8), equipment, 2.75, 2.49, -7.15).rotation.z = .3;

            // Secondary auxiliary displays — flanking side walls.
            for (const side of [-1, 1]) {
              const aux = new THREE.PlaneGeometry(5.2, 2.6, 24, 1);
              add(aux, led, side * 9.4, 3.6, -13.2);
            }
          }

          const updateView = (next: HallView) => {
            const explore = next === "explore";
            camera.position.set(explore ? 3.4 : 0, explore ? 7.9 : 7.35, next === "cinema" ? 8.1 : 23);
            orbit.target.set(0, explore ? 3.7 : 3.05, -8.65);
            orbit.enabled = explore;
            orbit.update();
            invalidate();
          };
          const updateLighting = (lit: boolean) => {
            ambient.intensity = lit ? .92 : .58;
            key.intensity = lit ? 1.48 : .85;
            rim.emissiveIntensity = lit ? 1.65 : .75;
            stageSpots.forEach((spot) => { spot.intensity = lit ? 190 : 75; });
            practicals.forEach((lamp) => { lamp.intensity = lit ? 72 : 28; });
            invalidate();
          };
          const handle: HallHandle = {
            updateView,
            updateLighting,
            frame() {
              renderer.render(scene, camera);
              if (host.dataset.hallFrameView !== viewRef.current) host.dataset.hallFrameView = viewRef.current;
            },
            resize(width, height) {
              camera.aspect = width / Math.max(1, height);
              camera.zoom = THREE.MathUtils.clamp(Math.sqrt(camera.aspect / .85), .58, 1);
              camera.updateProjectionMatrix();
            },
            dispose() {
              orbit.dispose();
              flutes.dispose();
              reflections.dispose();
              key.shadow.dispose();
              geometries.forEach((geometry) => geometry.dispose());
              materials.forEach((finish) => finish.dispose());
              textures.forEach((texture) => texture.dispose());
              sceneRef.current = null;
            },
          };
          sceneRef.current = handle;
          updateView(viewRef.current);
          updateLighting(lightingRef.current);
          return handle;
        },
      },
    });
    runtimeRef.current = runtime;
    void runtime.start();
    return () => {
      runtime.stop();
      runtimeRef.current = null;
    };
  }, [room]);

  useEffect(() => { runtimeRef.current?.setMotion(motion); }, [motion]);

  return (
    <div className={styles.hall} data-hall={room} data-hall-view={view} data-hall-state={state} aria-hidden="true">
      <div ref={hostRef} className={styles.canvas} />
    </div>
  );
}
