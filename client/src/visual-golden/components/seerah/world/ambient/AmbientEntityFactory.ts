/**
 * Procedural DEVELOPMENT FALLBACKS for anonymous environmental entities.
 * These segmented meshes are functional navigation/LOD/animation stand-ins,
 * not a claim of final historical realism or licensed character art.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { AmbientEntityDefinition, AmbientEntityKind } from "./AmbientTypes";

export interface AmbientVisual {
  root: THREE.Group;
  detail: THREE.Group;
  mid: THREE.Group;
  limbs: THREE.Group[];
  wings: THREE.Group[];
  developmentFallback: boolean;
}

export class AmbientEntityFactory {
  private readonly geometries = new Map<string, THREE.BufferGeometry>();
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();
  private disposed = false;

  private geometry(key: string, create: () => THREE.BufferGeometry): THREE.BufferGeometry {
    let value = this.geometries.get(key);
    if (!value) { value = create(); this.geometries.set(key, value); }
    return value;
  }
  private material(key: string, color: number, roughness = 0.92): THREE.MeshStandardMaterial {
    let value = this.materials.get(key);
    if (!value) {
      value = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
      this.materials.set(key, value);
    }
    return value;
  }
  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false; // ambient shadows are the first performance budget to shed
    mesh.receiveShadow = true;
    return mesh;
  }

  createFallback(definition: AmbientEntityDefinition): AmbientVisual {
    if (this.disposed) throw new Error("AmbientEntityFactory is disposed");
    const root = new THREE.Group();
    const detail = new THREE.Group();
    const mid = new THREE.Group();
    root.add(detail, mid);
    root.name = definition.id;
    root.userData = {
      anonymousEnvironmentalEntity: true,
      sacredPersonalityMapping: null,
      developmentFallback: true,
      role: definition.role,
      preset: definition.preset,
    };
    const limbs: THREE.Group[] = [];
    const wings: THREE.Group[] = [];
    if (definition.kind === "human") this.buildHuman(definition, detail, limbs);
    else if (definition.kind === "camel" || definition.kind === "horse") this.buildLargeAnimal(definition, detail, limbs);
    else if (definition.kind === "bird") this.buildBird(detail, wings);
    else this.buildSmallAnimal(definition, detail, limbs);

    const farMesh = this.mesh(this.getFarGeometry(definition.kind), this.farMaterial(definition.kind));
    if (definition.kind === "bird") farMesh.position.y = 0.2;
    mid.add(farMesh);
    root.scale.setScalar(definition.scale);
    detail.visible = false;
    mid.visible = false;
    return { root, detail, mid, limbs, wings, developmentFallback: true };
  }

  /** A single batched silhouette used by the genuinely instanced far LOD. */
  getFarGeometry(kind: AmbientEntityKind): THREE.BufferGeometry {
    return this.geometry(`far-${kind}`, () => {
      const parts: THREE.BufferGeometry[] = [];
      if (kind === "human") {
        const robe = new THREE.CylinderGeometry(0.2, 0.32, 1.15, 6);
        robe.translate(0, 0.62, 0);
        const head = new THREE.SphereGeometry(0.14, 6, 4);
        head.translate(0, 1.46, 0);
        parts.push(robe, head);
      } else if (kind === "bird") {
        const wings = new THREE.PlaneGeometry(0.85, 0.25);
        wings.rotateX(-Math.PI / 2);
        parts.push(wings);
      } else {
        const large = kind === "camel" || kind === "horse";
        const body = new THREE.CapsuleGeometry(large ? 0.34 : 0.2, large ? 1.25 : 0.55, 2, 5);
        body.rotateX(Math.PI / 2);
        body.translate(0, large ? 1.05 : 0.48, 0);
        const head = new THREE.BoxGeometry(large ? 0.25 : 0.18, large ? 0.3 : 0.2, large ? 0.45 : 0.25);
        head.translate(0, large ? 1.55 : 0.62, large ? 1.05 : 0.52);
        parts.push(body, head);
        if (kind === "camel") {
          const hump = new THREE.SphereGeometry(0.31, 5, 4);
          hump.scale(1, 0.8, 1.15);
          hump.translate(0, 1.38, -0.1);
          parts.push(hump);
        }
        const leg = new THREE.CylinderGeometry(large ? 0.055 : 0.035, large ? 0.045 : 0.03, large ? 0.9 : 0.4, 4);
        for (const x of large ? [-0.22, 0.22] : [-0.13, 0.13]) {
          for (const z of large ? [-0.48, 0.48] : [-0.22, 0.22]) {
            const part = leg.clone();
            part.translate(x, large ? 0.45 : 0.2, z);
            parts.push(part);
          }
        }
        leg.dispose();
      }
      const merged = mergeGeometries(parts, false)!;
      for (const part of parts) part.dispose();
      return merged;
    });
  }

  farMaterial(kind: AmbientEntityKind): THREE.MeshStandardMaterial {
    const colors: Record<AmbientEntityKind, number> = {
      human: 0x6f5138,
      horse: 0x554236,
      camel: 0x8b7355,
      sheep: 0xc0b7a1,
      goat: 0x756b5b,
      bird: 0x39352f,
    };
    const material = this.material(`far-${kind}`, colors[kind]);
    if (kind === "bird") material.side = THREE.DoubleSide;
    return material;
  }

  private buildHuman(definition: AmbientEntityDefinition, group: THREE.Group, limbs: THREE.Group[]): void {
    const palettes = [0x76523a, 0x8a6a4b, 0x5e6255, 0x806047, 0x6a5144];
    const cloth = this.material(`human-cloth-${definition.role}-${definition.id.length % 3}`, palettes[definition.id.length % palettes.length]);
    const dark = this.material("human-dark", 0x352b24);
    const skin = this.material("anonymous-skin", 0x8f6d50);
    const robe = this.mesh(this.geometry("human-robe", () => new THREE.CylinderGeometry(0.22, 0.34, 1.05, 8)), cloth);
    robe.position.y = 0.68;
    group.add(robe);
    const torso = this.mesh(this.geometry("human-torso", () => new THREE.CapsuleGeometry(0.2, 0.36, 3, 7)), cloth);
    torso.position.y = 1.18;
    group.add(torso);
    const head = this.mesh(this.geometry("human-head", () => new THREE.SphereGeometry(0.145, 8, 6)), skin);
    head.position.y = 1.65;
    head.userData.noFacialIdentity = true;
    group.add(head);
    const wrap = this.mesh(this.geometry("human-wrap", () => new THREE.SphereGeometry(0.151, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.48)), cloth);
    wrap.position.y = 1.68;
    group.add(wrap);

    for (const side of [-1, 1]) {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.25, 1.36, 0);
      const arm = this.mesh(this.geometry("human-arm", () => new THREE.CapsuleGeometry(0.052, 0.43, 2, 5)), cloth);
      arm.position.y = -0.26;
      armPivot.add(arm);
      group.add(armPivot);
      limbs.push(armPivot);
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.11, 0.45, 0);
      const leg = this.mesh(this.geometry("human-leg", () => new THREE.CapsuleGeometry(0.06, 0.42, 2, 5)), dark);
      leg.position.y = -0.25;
      legPivot.add(leg);
      group.add(legPivot);
      limbs.push(legPivot);
    }

    if (definition.role === "porter" || definition.role === "caravan_worker") {
      const bundle = this.mesh(this.geometry("porter-bundle", () => new THREE.BoxGeometry(0.38, 0.42, 0.22)), this.material("bundle", 0x756044));
      bundle.position.set(0, 1.22, -0.24);
      bundle.rotation.z = 0.08;
      group.add(bundle);
    }
    if (definition.role === "water_carrier") {
      const jar = this.mesh(this.geometry("water-jar", () => new THREE.SphereGeometry(0.16, 7, 5)), this.material("jar", 0x8a5937));
      jar.scale.set(0.8, 1.25, 0.8);
      jar.position.set(0.32, 0.92, 0.04);
      group.add(jar);
    }
    if (definition.role === "craftsman") {
      const tool = this.mesh(this.geometry("craft-tool", () => new THREE.CylinderGeometry(0.025, 0.025, 0.48, 5)), dark);
      tool.position.set(0.27, 0.98, 0.2);
      tool.rotation.z = 0.55;
      group.add(tool);
    }
  }

  private buildLargeAnimal(definition: AmbientEntityDefinition, group: THREE.Group, limbs: THREE.Group[]): void {
    const camel = definition.kind === "camel";
    const coat = this.material(camel ? "camel-coat" : "horse-coat", camel ? 0x92785a : 0x5b4436);
    const dark = this.material("animal-dark", 0x382d25);
    const body = this.mesh(this.geometry(camel ? "camel-body" : "horse-body", () => new THREE.CapsuleGeometry(camel ? 0.42 : 0.36, camel ? 1.25 : 1.35, 3, 7)), coat);
    body.rotation.x = Math.PI / 2;
    body.position.y = camel ? 1.25 : 1.2;
    group.add(body);
    if (camel) {
      const hump = this.mesh(this.geometry("camel-hump", () => new THREE.SphereGeometry(0.38, 7, 5)), coat);
      hump.scale.set(0.9, 1.05, 1.15);
      hump.position.set(0, 1.66, -0.12);
      group.add(hump);
    }
    const neck = this.mesh(this.geometry(camel ? "camel-neck" : "horse-neck", () => new THREE.CapsuleGeometry(camel ? 0.13 : 0.17, camel ? 0.85 : 0.65, 3, 6)), coat);
    neck.position.set(0, camel ? 1.72 : 1.58, 0.77);
    neck.rotation.x = camel ? -0.48 : -0.35;
    group.add(neck);
    const head = this.mesh(this.geometry(camel ? "camel-head" : "horse-head", () => new THREE.BoxGeometry(camel ? 0.28 : 0.3, 0.3, camel ? 0.52 : 0.58)), coat);
    head.position.set(0, camel ? 2.13 : 1.95, camel ? 1.14 : 1.08);
    group.add(head);
    for (const x of [-0.27, 0.27]) {
      for (const z of [-0.48, 0.5]) {
        const pivot = new THREE.Group();
        pivot.position.set(x, camel ? 1.03 : 1.02, z);
        const leg = this.mesh(this.geometry(camel ? "camel-leg" : "horse-leg", () => new THREE.CapsuleGeometry(camel ? 0.065 : 0.055, camel ? 0.85 : 0.88, 2, 5)), dark);
        leg.position.y = -0.5;
        pivot.add(leg);
        group.add(pivot);
        limbs.push(pivot);
      }
    }
    if (!camel && definition.role === "cavalry_unit") {
      // A neutral pack saddle, never a rider mapped to a historical person.
      const saddle = this.mesh(this.geometry("horse-saddle", () => new THREE.BoxGeometry(0.5, 0.12, 0.62)), this.material("saddle", 0x65432d));
      saddle.position.set(0, 1.53, -0.05);
      group.add(saddle);
    }
  }

  private buildSmallAnimal(definition: AmbientEntityDefinition, group: THREE.Group, limbs: THREE.Group[]): void {
    const goat = definition.kind === "goat";
    const coat = this.material(goat ? "goat-coat" : "sheep-coat", goat ? 0x776c5b : 0xc2b9a4);
    const body = this.mesh(this.geometry("small-animal-body", () => new THREE.CapsuleGeometry(0.23, 0.52, 3, 6)), coat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.48;
    group.add(body);
    const head = this.mesh(this.geometry("small-animal-head", () => new THREE.BoxGeometry(0.22, 0.24, 0.3)), coat);
    head.position.set(0, 0.58, 0.52);
    group.add(head);
    for (const x of [-0.14, 0.14]) for (const z of [-0.2, 0.2]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.36, z);
      const leg = this.mesh(this.geometry("small-animal-leg", () => new THREE.CylinderGeometry(0.035, 0.028, 0.38, 5)), this.material("animal-dark", 0x382d25));
      leg.position.y = -0.19;
      pivot.add(leg);
      group.add(pivot);
      limbs.push(pivot);
    }
  }

  private buildBird(group: THREE.Group, wings: THREE.Group[]): void {
    const mat = this.material("bird", 0x3e3931);
    mat.side = THREE.DoubleSide;
    const body = this.mesh(this.geometry("bird-body", () => new THREE.CapsuleGeometry(0.06, 0.18, 2, 5)), mat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      const wing = this.mesh(this.geometry("bird-wing", () => new THREE.PlaneGeometry(0.42, 0.18)), mat);
      wing.position.x = side * 0.22;
      wing.rotation.x = -Math.PI / 2;
      pivot.add(wing);
      group.add(pivot);
      wings.push(pivot);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const geometry of this.geometries.values()) geometry.dispose();
    for (const material of this.materials.values()) material.dispose();
    this.geometries.clear();
    this.materials.clear();
  }
}
