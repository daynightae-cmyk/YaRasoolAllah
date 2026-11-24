/** Optional production GLB loader. Missing assets use the explicitly labelled
 * procedural fallback; rejected/late assets never reach the live scene. */
import * as THREE from "three";
import type { AmbientAssetLoader, AmbientAssetResult, AmbientEntityDefinition } from "./AmbientTypes";

export class OptionalAmbientAssetLoader implements AmbientAssetLoader {
  constructor(private readonly timeoutMs = 6000) {}

  async load(definition: AmbientEntityDefinition, signal: AbortSignal): Promise<AmbientAssetResult | null> {
    if (!definition.asset) return null;
    const { url, license, provenance, anonymousReview } = definition.asset;
    if (!license || !provenance || anonymousReview !== true) {
      throw new Error(`Asset governance incomplete for ${definition.id}`);
    }
    if (!/\.glb(?:$|\?)/i.test(url) && !/\.gltf(?:$|\?)/i.test(url)) {
      throw new Error(`Unsupported ambient asset format for ${definition.id}`);
    }
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    if (signal.aborted) return null;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    let onAbort: (() => void) | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => { timedOut = true; reject(new Error(`Timed out loading ${definition.id}`)); }, this.timeoutMs);
    });
    const abortPromise = new Promise<never>((_, reject) => {
      onAbort = () => {
        const error = new Error(`Cancelled loading ${definition.id}`);
        error.name = "AbortError";
        reject(error);
      };
      signal.addEventListener("abort", onAbort, { once: true });
    });
    const loading = new GLTFLoader().loadAsync(url).then((gltf): AmbientAssetResult => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const largest = Math.max(size.x, size.y, size.z);
      if (![size.x, size.y, size.z].every(Number.isFinite) || largest < 0.01 || largest > 100) {
        throw new Error(`Invalid model scale for ${definition.id}`);
      }
      gltf.scene.userData = {
        ...gltf.scene.userData,
        anonymousEnvironmentalEntity: true,
        sacredPersonalityMapping: null,
        developmentFallback: false,
        license,
        provenance,
      };
      return { root: gltf.scene, animations: gltf.animations, developmentFallback: false };
    });
    try {
      const result = await Promise.race([loading, timeoutPromise, abortPromise]);
      if (signal.aborted || timedOut) {
        disposeAmbientAsset(result.root);
        return null;
      }
      return result;
    } catch (error) {
      // GLTFLoader has no universal AbortSignal transport across browsers.
      // Cancellation is immediate to the caller, and any late result is still
      // disposed here rather than entering the scene or leaking GPU resources.
      if (timedOut || signal.aborted) void loading.then((result) => disposeAmbientAsset(result.root)).catch(() => undefined);
      if (signal.aborted) return null;
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
      if (onAbort) signal.removeEventListener("abort", onAbort);
    }
  }
}

export function disposeAmbientAsset(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
  root.removeFromParent();
}
