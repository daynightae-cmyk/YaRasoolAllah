import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ThreeRuntime, type ThreeSceneHandle } from "../three/three-runtime";
import { useEffectiveMotion } from "../../lib/institution/effective-motion";
import { ATLAS_NODES } from "../../services/atlas";
import { seerahEventsForAtlasNode } from "../../services/atlas-seerah";
import { getWorldSceneByRef } from "../seerah/world/WorldSceneRegistry";
import styles from "./AtlasTable3D.module.css";

interface TableHandle extends ThreeSceneHandle {
  focus(index: number): void;
}

export function AtlasTable3D() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<TableHandle | null>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState("starting");
  const motion = useEffectiveMotion();
  const node = ATLAS_NODES[selected];
  const events = seerahEventsForAtlasNode(node);
  const scene = events.map((event) => getWorldSceneByRef({ eventId: event.id })).find(Boolean);

  useEffect(() => {
    if (!host.current) return;
    const runtime = new ThreeRuntime({
      host: host.current,
      motion,
      onStateChange: setState,
      adapter: {
        build(context) {
          const world = new THREE.Scene();
          world.background = new THREE.Color("#4a3021");
          const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 90);
          camera.position.set(0, 8.5, 12.9);
          const controls = new OrbitControls(camera, context.renderer.domElement);
          controls.target.set(0, 1.5, 0);
          controls.minDistance = 3;
          controls.maxDistance = 22;
          controls.maxPolarAngle = Math.PI * 0.46;
          controls.enablePan = false;
          controls.addEventListener("change", context.invalidate);
          world.add(new THREE.HemisphereLight(0xfff5de, 0x87613a, 2.15));
          const lamp = new THREE.DirectionalLight(0xffe0a7, 3.1);
          lamp.position.set(-4, 12, 6);
          world.add(lamp);
          const wood = new THREE.MeshStandardMaterial({ color: "#7a492a", roughness: 0.58 });
          const gold = new THREE.MeshStandardMaterial({ color: "#c79c4c", metalness: 0.65, roughness: 0.35 });
          const sand = new THREE.MeshStandardMaterial({ color: "#dbac6b", roughness: 0.87, flatShading: true });
          const sea = new THREE.MeshStandardMaterial({ color: "#16606f", roughness: 0.46 });
          const geometries = new Set<THREE.BufferGeometry>();
          const box = (width: number, height: number, depth: number, material: THREE.Material, x: number, y: number, z: number) => {
            const geometry = new THREE.BoxGeometry(width, height, depth);
            geometries.add(geometry);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            world.add(mesh);
            return mesh;
          };
          box(12.6, 0.45, 10.6, wood, 0, 1.2, 0);
          box(12, 0.1, 10, sea, 0, 1.48, 0);
          for (const side of [-1, 1]) {
            box(0.16, 0.14, 10.5, gold, side * 6.15, 1.5, 0);
            box(12.4, 0.14, 0.16, gold, 0, 1.5, side * 5.15);
            for (const end of [-1, 1]) box(0.55, 2.2, 0.55, wood, side * 5.5, 0, end * 4.5);
          }
          const relief = new THREE.PlaneGeometry(10.6, 9.2, 56, 48);
          relief.rotateX(-Math.PI / 2);
          const positions = relief.attributes.position;
          for (let index = 0; index < positions.count; index += 1) {
            const x = positions.getX(index);
            const z = positions.getZ(index);
            const ridge = Math.exp(-((x + 1.6 + z * 0.25) ** 2) / 1.3);
            const coastalEdge = Math.exp(-((x + 5.3) ** 2) / .85);
            positions.setX(index, x + coastalEdge * (.42 + .23 * Math.sin(z * .8)));
            positions.setY(index, 1.6 + ridge * (.4 + .25 * Math.sin(z * 2.5 + x * 1.8)) + .06 * Math.sin(x * 3 + z));
          }
          relief.computeVertexNormals();
          geometries.add(relief);
          world.add(new THREE.Mesh(relief, sand));
          const markers = ATLAS_NODES.map((place, index) => {
            const geometry = new THREE.CylinderGeometry(0.12, 0.22, 0.6, 12);
            geometries.add(geometry);
            const marker = new THREE.Mesh(geometry, gold);
            marker.name = `atlas-marker-${place.id}`;
            marker.userData.index = index;
            marker.position.set((place.layout.x / 100 - 0.5) * 10.6, 2.25, (place.layout.y / 100 - 0.5) * 9.2);
            world.add(marker);
            return marker;
          });
          const haloGeometry = new THREE.TorusGeometry(0.32, 0.045, 6, 24);
          geometries.add(haloGeometry);
          const halo = new THREE.Mesh(haloGeometry, gold);
          halo.rotation.x = Math.PI / 2;
          halo.position.copy(markers[0].position);
          halo.position.y = 2;
          world.add(halo);
          const target = new THREE.Vector3(0, 1.5, 0);
          const destination = camera.position.clone();
          let travelling = false;
          const focus = (index: number) => {
            target.copy(markers[index].position);
            destination.copy(target).add(new THREE.Vector3(0, 5, 5));
            halo.position.set(target.x, 2, target.z);
            travelling = true;
            if (context.motion === "reduced") {
              camera.position.copy(destination);
              controls.target.copy(target);
              travelling = false;
            }
            controls.update();
            context.invalidate();
          };
          const raycaster = new THREE.Raycaster();
          let down = { x: 0, y: 0 };
          const canvas = context.renderer.domElement;
          const onDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
          const onUp = (event: PointerEvent) => {
            if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
            const bounds = canvas.getBoundingClientRect();
            raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
            const hit = raycaster.intersectObjects(markers)[0];
            if (hit) {
              const index = hit.object.userData.index as number;
              setSelected(index);
              focus(index);
            }
          };
          canvas.addEventListener("pointerdown", onDown);
          canvas.addEventListener("pointerup", onUp);
          const handle: TableHandle = {
            focus,
            frame(delta) {
              if (travelling) {
                const amount = context.motion === "reduced" ? 1 : 1 - Math.exp(-delta * 5);
                camera.position.lerp(destination, amount);
                controls.target.lerp(target, amount);
                if (camera.position.distanceTo(destination) < 0.01) travelling = false;
              }
              controls.update();
              context.renderer.render(world, camera);
            },
            resize(width, height) { camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); },
            dispose() {
              canvas.removeEventListener("pointerdown", onDown);
              canvas.removeEventListener("pointerup", onUp);
              controls.dispose();
              geometries.forEach((geometry) => geometry.dispose());
              [wood, gold, sand, sea].forEach((material) => material.dispose());
              controller.current = null;
            },
          };
          controller.current = handle;
          return handle;
        },
      },
    });
    runtimeRef.current = runtime;
    void runtime.start();
    return () => { runtime.stop(); runtimeRef.current = null; };
  }, []);

  useEffect(() => { runtimeRef.current?.setMotion(motion); }, [motion]);

  return <section className={styles.table} aria-label="طاولة الأطلس المجسمة" data-visual="atlas-table-3d">
    <h2>طاولة الأطلس التاريخي</h2>
    <p>تضاريس تعليمية تخطيطية ومواضع رمزية، وليست خريطة مساحية أو إعادة بناء تاريخية موثقة. اسحب للدوران، واقرص للتقريب، واختر علامة أو اسم موضع.</p>
    <div ref={host} className={styles.canvas} data-table-state={state} />
    {state === "fallback" || state === "context-lost" ? <p role="status">تعذّر العرض المجسم. المواضع والسجلات متاحة في القائمة التالية.</p> : null}
    <nav className={styles.places} aria-label="مواضع طاولة الأطلس">
      {ATLAS_NODES.map((place, index) => <button type="button" key={place.id} aria-pressed={selected === index} onClick={() => { setSelected(index); controller.current?.focus(index); }}>{place.name}</button>)}
    </nav>
    <article aria-live="polite" className={styles.record}>
      <h3>{node.name}</h3>
      {events.length ? <ol>{events.map((event) => <li key={event.id}><Link href={event.href}>{event.titleAr}</Link><span> · {event.dateTextAr} · {event.sourceCount} مراجع في السجل</span></li>)}</ol> : <p>لا توجد أحداث مرتبطة بهذا الموضع في قاعدة السيرة الحالية.</p>}
      {scene ? <Link href={`/seerah/world?scene=${encodeURIComponent(scene.id)}&return=atlas`}>دخول العالم: {scene.nameAr}</Link> : <p>لا يتوفر مشهد استكشاف مرتبط بهذا الموضع حاليًا.</p>}
    </article>
  </section>;
}
