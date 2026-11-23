/**
 * WorldAtmosphere — Sky, fog, lighting, and environmental particles.
 *
 * Features:
 * - Procedural sky dome with gradient
 * - Volumetric fog with height falloff
 * - Dynamic sun with time-of-day support
 * - Wind-driven sand/dust particles (GPU-accelerated)
 * - Distant horizon mountains/mesas
 * - Graphics tier adaptation
 * - Reduced motion: static particles, no animation
 */

import * as THREE from "three";
import type { WorldSceneConfig, WorldGraphicsTier, WorldRuntimeContext } from "./world-types";

/** Particle system for wind-blown sand/dust. */
export class WorldParticleSystem {
  private readonly context: WorldRuntimeContext;
  private readonly config: {
    count: number;
    area: THREE.Box3;
    particleSize: number;
    color: THREE.Color | THREE.Color[];
    opacity: number;
    velocity: THREE.Vector3;
    turbulence: number;
    lifetime: number;
  };
  private points: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.PointsMaterial | null = null;
  private positions: Float32Array | null = null;
  private velocities: Float32Array | null = null;
  private lifetimes: Float32Array | null = null;
  private ages: Float32Array | null = null;
  private time = 0;
  private reducedMotion = false;

  constructor(context: WorldRuntimeContext, config: WorldParticleSystemConfig) {
    this.context = context;
    this.config = {
      count: config.count,
      area: config.area,
      particleSize: config.particleSize,
      color: config.color,
      opacity: config.opacity,
      velocity: config.velocity,
      turbulence: config.turbulence,
      lifetime: config.lifetime,
    };
  }

  /** Build the particle system. */
  build(): THREE.Points {
    const count = this.config.count;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.lifetimes = new Float32Array(count);
    this.ages = new Float32Array(count);

    const { area } = this.config;
    const size = new THREE.Vector3().subVectors(area.max, area.min);
    const center = new THREE.Vector3().addVectors(area.max, area.min).multiplyScalar(0.5);

    for (let i = 0; i < count; i++) {
      this.resetParticle(i, center, size);
      this.ages[i] = Math.random() * this.lifetimes[i]; // Stagger
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aLifetime", new THREE.BufferAttribute(this.lifetimes, 1));
    this.geometry.setAttribute("aAge", new THREE.BufferAttribute(this.ages, 1));

    // Custom shader for particle animation
    const colorArray = Array.isArray(this.config.color) ? this.config.color : [this.config.color];
    const colorUniforms = colorArray.map((c, i) => ({ value: c }));

    this.material = new THREE.PointsMaterial({
      size: this.config.particleSize,
      color: colorArray[0],
      transparent: true,
      opacity: this.config.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false; // Particles cover large area

    this.context.registerDisposable(() => this.dispose());
    return this.points;
  }

  /** Reset a single particle. */
  private resetParticle(index: number, center: THREE.Vector3, size: THREE.Vector3): void {
    if (!this.positions || !this.velocities || !this.lifetimes) return;

    // Spawn within area, biased toward upwind edge
    const upwindBias = 0.3;
    const x = center.x + (Math.random() - 0.5 + upwindBias) * size.x;
    const z = center.z + (Math.random() - 0.5) * size.z;
    const y = center.y + Math.random() * size.y * 0.5 + size.y * 0.1;

    this.positions[index * 3] = x;
    this.positions[index * 3 + 1] = y;
    this.positions[index * 3 + 2] = z;

    // Base velocity + turbulence
    const turb = this.config.turbulence;
    this.velocities[index * 3] = this.config.velocity.x + (Math.random() - 0.5) * turb;
    this.velocities[index * 3 + 1] = this.config.velocity.y + Math.random() * turb * 0.2;
    this.velocities[index * 3 + 2] = this.config.velocity.z + (Math.random() - 0.5) * turb;

    this.lifetimes[index] = this.config.lifetime * (0.7 + Math.random() * 0.6);
  }

  /** Update particles each frame. */
  update(deltaTime: number, elapsedTime: number, playerPosition: THREE.Vector3): void {
    if (!this.points || !this.geometry || !this.positions || !this.velocities || !this.lifetimes || !this.ages) return;
    if (this.reducedMotion) return;

    this.time += deltaTime;
    const { area } = this.config;
    const size = new THREE.Vector3().subVectors(area.max, area.min);
    const center = new THREE.Vector3().addVectors(area.max, area.min).multiplyScalar(0.5);

    // Wind turbulence based on time
    const windX = Math.sin(elapsedTime * 0.3) * 0.5 + Math.sin(elapsedTime * 0.7) * 0.3;
    const windZ = Math.cos(elapsedTime * 0.25) * 0.4 + Math.cos(elapsedTime * 0.6) * 0.2;

    for (let i = 0; i < this.config.count; i++) {
      this.ages[i] += deltaTime;

      if (this.ages[i] >= this.lifetimes[i]) {
        this.resetParticle(i, center, size);
        this.ages[i] = 0;
        continue;
      }

      // Update position
      const vx = this.velocities[i * 3] + windX * this.config.turbulence * 0.5;
      const vy = this.velocities[i * 3 + 1];
      const vz = this.velocities[i * 3 + 2] + windZ * this.config.turbulence * 0.5;

      this.positions[i * 3] += vx * deltaTime;
      this.positions[i * 3 + 1] += vy * deltaTime;
      this.positions[i * 3 + 2] += vz * deltaTime;

      // Wrap around area (infinite scrolling)
      if (this.positions[i * 3] > area.max.x) this.positions[i * 3] = area.min.x;
      if (this.positions[i * 3] < area.min.x) this.positions[i * 3] = area.max.x;
      if (this.positions[i * 3 + 2] > area.max.z) this.positions[i * 3 + 2] = area.min.z;
      if (this.positions[i * 3 + 2] < area.min.z) this.positions[i * 3 + 2] = area.max.z;
      if (this.positions[i * 3 + 1] > area.max.y) this.positions[i * 3 + 1] = area.min.y;
      if (this.positions[i * 3 + 1] < area.min.y) this.positions[i * 3 + 1] = area.max.y;

      // Fade by age
      const ageRatio = this.ages[i] / this.lifetimes[i];
      // Could modulate alpha in shader, but PointsMaterial doesn't support per-particle alpha easily
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aAge.needsUpdate = true;
  }

  /** Set reduced motion mode. */
  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  /** Dispose resources. */
  dispose(): void {
    this.geometry?.dispose();
    this.material?.dispose();
    this.points = null;
    this.geometry = null;
    this.material = null;
    this.positions = null;
    this.velocities = null;
    this.lifetimes = null;
    this.ages = null;
  }
}

/** Sky dome with procedural gradient. */
export function createSkyDome(config: WorldSceneConfig, graphicsTier: WorldGraphicsTier): THREE.Mesh {
  const radius = Math.max(config.bounds.width, config.bounds.depth) * 1.2;
  const segments = graphicsTier === "low" ? 16 : 24;
  const rings = graphicsTier === "low" ? 12 : 18;

  const geometry = new THREE.SphereGeometry(radius, segments, rings);
  geometry.scale(-1, 1, 1); // Invert normals for inside view

  // Vertex colors for sky gradient
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const skyColor = new THREE.Color(config.skyColor);
  const horizonColor = new THREE.Color(config.fogColor).lerp(new THREE.Color(config.sunColor), 0.3);
  const zenithColor = skyColor.clone().multiplyScalar(0.6);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const normalizedY = THREE.MathUtils.clamp((y + radius) / (radius * 2), 0, 1);
    // Smooth gradient from zenith to horizon
    const color = zenithColor.clone().lerp(horizonColor, Math.pow(normalizedY, 0.7));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });

  return new THREE.Mesh(geometry, material);
}

/** Distant horizon geometry (mountains, mesas). */
export function createHorizonMeshes(
  config: WorldSceneConfig,
  graphicsTier: WorldGraphicsTier,
  shadowsEnabled: boolean,
): THREE.Group {
  const group = new THREE.Group();
  const random = mulberry(config.seed + 500);
  const worldRadius = Math.max(config.bounds.width, config.bounds.depth) * 0.6;
  const count = graphicsTier === "low" ? 6 : graphicsTier === "high" ? 14 : 10;

  const baseColor = new THREE.Color(config.groundColor).multiplyScalar(0.6);
  const rockColor = new THREE.Color(config.rockColor || "#5a4a3a");
  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.95,
    metalness: 0,
  });

  const mountainGeo = new THREE.ConeGeometry(1, 1, 6);
  const mesaGeo = new THREE.CylinderGeometry(1, 1, 1, 6);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + random() * 0.4;
    const distance = worldRadius * (0.85 + random() * 0.15);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    const isMesa = random() < 0.4;
    const geo = isMesa ? mesaGeo : mountainGeo;
    const height = isMesa ? 8 + random() * 12 : 15 + random() * 25;
    const radius = isMesa ? 6 + random() * 8 : 8 + random() * 12;

    const mesh = new THREE.Mesh(geo, material);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, height * 0.5, z);
    mesh.rotation.y = random() * Math.PI;
    mesh.castShadow = shadowsEnabled;
    mesh.receiveShadow = shadowsEnabled;
    group.add(mesh);
  }

  return group;
}

/** Fog configuration helper. */
export function setupFog(scene: THREE.Scene, config: WorldSceneConfig): void {
  scene.fog = new THREE.FogExp2(new THREE.Color(config.fogColor), 0.008);
  scene.background = new THREE.Color(config.skyColor);
}

/** Sun light setup with cinematic intensity. */
export function createSunLight(config: WorldSceneConfig, shadowsEnabled: boolean): THREE.DirectionalLight {
  const sun = new THREE.DirectionalLight(new THREE.Color(config.sunColor), config.sunIntensity);
  // Push the light far along its direction so the shadow camera's near plane
  // sits BEHIND the whole world. At the raw config distance (~78u) the near
  // plane cut through the terrain and painted everything in front of it with
  // a hard black shadow wall.
  const lightDistance = Math.max(config.bounds.width, config.bounds.depth) * 1.6;
  sun.position.copy(config.sunPosition.clone().normalize().multiplyScalar(lightDistance));
  sun.castShadow = shadowsEnabled;

  if (shadowsEnabled) {
    const frustumSize = Math.max(config.bounds.width, config.bounds.depth) * 0.65;
    sun.shadow.camera.left = -frustumSize;
    sun.shadow.camera.right = frustumSize;
    sun.shadow.camera.top = frustumSize;
    sun.shadow.camera.bottom = -frustumSize;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = frustumSize * 2.5;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
  }

  return sun;
}

/** Glowing sun disk + halo. Camera-facing sprites with a generated radial
 *  gradient — soft round glow from every viewing angle, no hard polygon
 *  edges, no external textures. Additive blending, depth-tested so terrain
 *  and tents occlude the sun naturally. */
export function createSunGlow(config: WorldSceneConfig): THREE.Group {
  const group = new THREE.Group();
  // Push the glow far along the sun direction so it sits behind the horizon
  // meshes and never z-fights the sky dome.
  const dir = config.sunPosition.clone().normalize();
  group.position.copy(dir.multiplyScalar(260));

  const sunColor = new THREE.Color(config.sunColor);
  const texture = makeGlowTexture(sunColor);

  const addSprite = (scale: number, opacity: number, tag: string) => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: sunColor,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.setScalar(scale);
    sprite.userData = { glowType: tag };
    group.add(sprite);
  };

  addSprite(26, 0.95, "sun-core");   // bright disk
  addSprite(64, 0.32, "sun-ring");   // inner glow
  addSprite(150, 0.14, "sun-halo");  // wide atmospheric halo

  // The shared texture is disposed once, with the group, by the caller's
  // traverse (materials dispose their maps via material.dispose + map).
  group.userData.glowTexture = texture;
  return group;
}

/** Soft radial-gradient glow texture generated on a canvas — no assets. */
function makeGlowTexture(color: THREE.Color): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(255,255,255,1)`);
  gradient.addColorStop(0.18, `rgba(${r},${g},${b},0.9)`);
  gradient.addColorStop(0.45, `rgba(${r},${g},${b},0.32)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Dust motes floating in sunbeams. A tiny shader points system: per-point
 *  size/opacity/phase attributes actually drive the rendering, motion is
 *  computed on the GPU from uTime (zero per-frame CPU work), and each mote
 *  oscillates around a fixed anchor so nothing ever drifts away. */
export function createDustMotes(config: WorldSceneConfig, graphicsTier: WorldGraphicsTier): THREE.Points {
  const count = graphicsTier === "low" ? 40 : graphicsTier === "high" ? 180 : 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);
  const phases = new Float32Array(count);

  const halfW = config.bounds.width / 2;
  const halfD = config.bounds.depth / 2;
  const baseY = config.bounds.height * 0.2;
  const rangeY = config.bounds.height * 1.2;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2 * halfW;
    positions[i * 3 + 1] = baseY + Math.random() * rangeY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * halfD;
    sizes[i] = 0.05 + Math.random() * 0.11;
    opacities[i] = 0.10 + Math.random() * 0.25;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(config.sunColor) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vOpacity;
      void main() {
        // Bounded oscillation around the anchor — motes never drift away.
        vec3 p = position;
        float t = uTime * 0.55 + aPhase;
        p.x += sin(t * 0.7) * 0.6;
        p.y += sin(t) * 0.45;
        p.z += cos(t * 0.9) * 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * 220.0 / max(1.0, -mv.z);
        // Gentle twinkle; fade out very near/far motes.
        float twinkle = 0.65 + 0.35 * sin(t * 1.7);
        float distFade = smoothstep(1.0, 3.0, -mv.z) * (1.0 - smoothstep(40.0, 70.0, -mv.z));
        vOpacity = aOpacity * twinkle * distFade;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vOpacity;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.05, d) * vOpacity;
        if (alpha < 0.004) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.userData = { motesMaterial: material };
  return points;
}

/** Advance mote time on the GPU — one uniform write, no buffer churn. */
export function updateDustMotes(points: THREE.Points, _deltaTime: number, elapsedTime: number): void {
  const material = (points.userData as { motesMaterial?: THREE.ShaderMaterial }).motesMaterial;
  if (material) material.uniforms.uTime.value = elapsedTime;
}

/** Freeze motes at a calm instant for reduced-motion rendering. */
export function settleDustMotes(points: THREE.Points): void {
  const material = (points.userData as { motesMaterial?: THREE.ShaderMaterial }).motesMaterial;
  if (material) material.uniforms.uTime.value = 0;
}

/** Hemisphere light for ambient fill. The sky term is lifted toward the sun
 *  colour so shadowed faces keep a warm golden bounce instead of going black
 *  under the dark zenith palette. */
export function createHemisphereLight(config: WorldSceneConfig): THREE.HemisphereLight {
  const skyFill = new THREE.Color(config.skyColor)
    .lerp(new THREE.Color(config.sunColor), 0.45);
  return new THREE.HemisphereLight(skyFill, new THREE.Color(config.groundColor), 0.9);
}

/** Mulberry32 PRNG. */
function mulberry(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Particle system config type (imported from world-types). */
import type { WorldParticleSystemConfig } from "./world-types";