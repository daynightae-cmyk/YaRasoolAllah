/**
 * WorldAudio — Opt-in spatial audio engine for the Living Seerah World.
 *
 * All sound is SYNTHESIZED with the Web Audio API (filtered noise beds,
 * granular murmurs, footstep thumps). No external audio files are fetched:
 * the project ships no ambience assets, and fetching missing URLs would
 * decode the SPA HTML fallback and throw EncodingError.
 *
 * Features:
 * - Web Audio spatialization (PannerNode, HRTF) with a camera listener
 * - Ambience zones with smooth crossfades
 * - One-shot footsteps / cloth / wind with pitch variation
 * - Autoplay-policy safe: silent until the first user gesture
 * - Mute + master volume, full dispose (context closed) on exit
 * - Reduced motion: ambience only, no one-shots
 *
 * No music, no recitation, no invented speech — neutral environmental sound.
 */

import * as THREE from "three";
import type { WorldAudioZone, WorldPlayerState, WorldGraphicsTier } from "./world-types";

type AudioEngineState = "suspended" | "running" | "closed";

/** Synthesized ambience recipes (looping noise beds). */
type AmbienceKind = "wind" | "camp" | "market" | "oasis";

interface AmbienceRecipe {
  kind: AmbienceKind;
  volume: number;
  spatial: boolean;
}

const AMBIENCE_RECIPES: Record<string, AmbienceRecipe> = {
  "ambience-desert-wind": { kind: "wind", volume: 0.5, spatial: false },
  "ambience-camp": { kind: "camp", volume: 0.42, spatial: true },
  "ambience-market": { kind: "market", volume: 0.4, spatial: true },
  "ambience-oasis": { kind: "oasis", volume: 0.4, spatial: true },
};

const CROSSFADE_TIME = 2.5;
const MAX_ONESHOTS = 12;
/** Loop length of synthesized beds (seconds). Long enough to avoid patterning. */
const BED_SECONDS = 6;

interface ActiveAmbience {
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: PannerNode | null;
  volume: number;
}

interface ActiveOneShot {
  id: number;
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: PannerNode | null;
}

export class WorldAudio {
  private context: AudioContext | null = null;
  private state: AudioEngineState = "suspended";
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private zones: WorldAudioZone[] = [];
  private currentZone: string | null = null;
  private activeAmbience: ActiveAmbience | null = null;
  private fadingOut: ActiveAmbience[] = [];
  private oneShots: ActiveOneShot[] = [];
  private oneShotId = 0;

  private masterVolume = 0.9;
  private muted = false;
  private userGestureReceived = false;
  private reducedMotion = false;
  private graphicsTier: WorldGraphicsTier = "balanced";

  // Cached synthesized buffers (shared across plays).
  private bufferCache = new Map<string, AudioBuffer>();
  private disposed = false;

  /** Initialize the engine. Silent until onUserGesture() (autoplay policy). */
  async initialize(options: {
    zones?: WorldAudioZone[];
    graphicsTier?: WorldGraphicsTier;
    reducedMotion?: boolean;
  } = {}): Promise<void> {
    if (this.context || this.disposed) return;

    this.zones = options.zones ?? [];
    this.graphicsTier = options.graphicsTier ?? "balanced";
    this.reducedMotion = options.reducedMotion ?? false;

    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API not supported");

    this.context = new Ctor();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    this.masterGain.connect(this.context.destination);

    this.ambienceGain = this.context.createGain();
    this.ambienceGain.gain.value = 1;
    this.ambienceGain.connect(this.masterGain);

    this.sfxGain = this.context.createGain();
    this.sfxGain.gain.value = 1;
    this.sfxGain.connect(this.masterGain);

    // Context starts suspended under autoplay policy; resume on gesture.
    this.state = this.context.state === "running" ? "running" : "suspended";
  }

  /** Unlock audio after a user gesture (canvas click / key press). */
  onUserGesture(): void {
    this.userGestureReceived = true;
    if (this.context?.state === "suspended") {
      this.context.resume().then(() => {
        this.state = "running";
        // Start the zone the player is already standing in.
        if (this.currentZone) {
          const zoneId = this.currentZone;
          this.currentZone = null;
          void this.playAmbienceZone(zoneId);
        }
      }).catch(() => undefined);
    }
  }

  // ==================== Synthesis ====================

  /** Deterministic PRNG so beds are stable across sessions. */
  private rng(seed: number): () => number {
    let value = seed >>> 0;
    return () => {
      value = (value + 0x6d2b79f5) >>> 0;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Low-passed noise via a simple one-pole filter (offline, per-sample). */
  private lowpassNoise(data: Float32Array, cutoff: number, random: () => number): void {
    const alpha = Math.min(1, cutoff);
    let prev = 0;
    for (let i = 0; i < data.length; i++) {
      const white = random() * 2 - 1;
      prev += alpha * (white - prev);
      data[i] = prev;
    }
  }

  private getBedBuffer(kind: AmbienceKind): AudioBuffer | null {
    if (!this.context) return null;
    const key = `bed-${kind}`;
    const cached = this.bufferCache.get(key);
    if (cached) return cached;

    const rate = this.context.sampleRate;
    const length = Math.floor(rate * BED_SECONDS);
    const buffer = this.context.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const random = this.rng(kind.length * 7919 + 13);

    switch (kind) {
      case "wind": {
        // Deep filtered noise with slow gust envelopes.
        this.lowpassNoise(data, 0.045, random);
        for (let i = 0; i < length; i++) {
          const t = i / rate;
          const gust =
            0.55 +
            0.3 * Math.sin((t / BED_SECONDS) * Math.PI * 2) +
            0.15 * Math.sin((t / BED_SECONDS) * Math.PI * 6 + 1.3);
          data[i] *= gust * 2.4;
        }
        break;
      }
      case "camp": {
        // Soft night air + sparse crackle ticks (fire-like, neutral).
        this.lowpassNoise(data, 0.03, random);
        for (let i = 0; i < length; i++) data[i] *= 1.6;
        const ticks = 26;
        for (let k = 0; k < ticks; k++) {
          const at = Math.floor(random() * (length - 400));
          const amp = 0.12 + random() * 0.2;
          const decay = 60 + Math.floor(random() * 220);
          for (let j = 0; j < decay && at + j < length; j++) {
            data[at + j] += (random() * 2 - 1) * amp * Math.exp(-j / (decay * 0.3));
          }
        }
        break;
      }
      case "market": {
        // Band-limited murmur: amplitude-modulated mid noise, no words.
        this.lowpassNoise(data, 0.12, random);
        const mod = this.rng(4242);
        let env = 0.5;
        for (let i = 0; i < length; i++) {
          const t = i / rate;
          env += 0.02 * ((mod() * 0.9 + 0.25) - env);
          const syllabic = 0.6 + 0.4 * Math.sin(t * 5.1 + Math.sin(t * 1.7) * 2);
          data[i] *= env * syllabic * 1.9;
        }
        break;
      }
      case "oasis": {
        // Gentle water-like shimmer: brighter noise, fast soft ripple.
        this.lowpassNoise(data, 0.2, random);
        for (let i = 0; i < length; i++) {
          const t = i / rate;
          const ripple = 0.65 + 0.35 * Math.sin(t * 9 + Math.sin(t * 2.3) * 3);
          data[i] *= ripple * 1.5;
        }
        break;
      }
    }

    // Loop seam: crossfade the last 150ms into the first 150ms.
    const seam = Math.floor(rate * 0.15);
    for (let i = 0; i < seam; i++) {
      const w = i / seam;
      const head = data[i];
      const tail = data[length - seam + i];
      data[length - seam + i] = tail * (1 - w) + head * w;
    }

    this.bufferCache.set(key, buffer);
    return buffer;
  }

  private getFootstepBuffer(stone: boolean): AudioBuffer | null {
    if (!this.context) return null;
    const key = stone ? "step-stone" : "step-sand";
    const cached = this.bufferCache.get(key);
    if (cached) return cached;

    const rate = this.context.sampleRate;
    const length = Math.floor(rate * 0.14);
    const buffer = this.context.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const random = this.rng(stone ? 991 : 337);
    this.lowpassNoise(data, stone ? 0.35 : 0.12, random);
    for (let i = 0; i < length; i++) {
      const env = Math.exp(-i / (length * 0.22));
      data[i] *= env * (stone ? 2.6 : 2.0);
    }
    this.bufferCache.set(key, buffer);
    return buffer;
  }

  private getClothBuffer(): AudioBuffer | null {
    if (!this.context) return null;
    const cached = this.bufferCache.get("cloth");
    if (cached) return cached;
    const rate = this.context.sampleRate;
    const length = Math.floor(rate * 0.4);
    const buffer = this.context.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const random = this.rng(777);
    this.lowpassNoise(data, 0.25, random);
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const flap = Math.sin(t * 22) * 0.5 + 0.5;
      data[i] *= Math.exp(-t * 5) * flap * 1.6;
    }
    this.bufferCache.set("cloth", buffer);
    return buffer;
  }

  private getGustBuffer(): AudioBuffer | null {
    if (!this.context) return null;
    const cached = this.bufferCache.get("gust");
    if (cached) return cached;
    const rate = this.context.sampleRate;
    const length = Math.floor(rate * 1.4);
    const buffer = this.context.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const random = this.rng(555);
    this.lowpassNoise(data, 0.06, random);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.sin(t * Math.PI); // rise and fall
      data[i] *= env * 2.2;
    }
    this.bufferCache.set("gust", buffer);
    return buffer;
  }

  // ==================== Ambience zones ====================

  private canPlay(): boolean {
    return Boolean(
      this.context &&
      this.masterGain &&
      this.userGestureReceived &&
      !this.muted &&
      !this.disposed &&
      this.context.state === "running",
    );
  }

  /** Play ambience for a zone (with crossfade). */
  async playAmbienceZone(zoneId: string): Promise<void> {
    if (!this.context || this.disposed) return;
    if (this.currentZone === zoneId) return;
    const zone = this.zones.find((z) => z.id === zoneId);
    if (!zone) return;

    this.currentZone = zoneId;
    if (!this.canPlay()) return; // will start on gesture / unmute

    const recipe = AMBIENCE_RECIPES[zone.ambienceId] ?? AMBIENCE_RECIPES["ambience-desert-wind"];
    const buffer = this.getBedBuffer(recipe.kind);
    if (!buffer || !this.ambienceGain) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.context.createGain();
    gain.gain.value = 0;

    let panner: PannerNode | null = null;
    if (recipe.spatial) {
      panner = this.createPanner("exponential", 0.6, 8, 120);
      const center = new THREE.Vector3();
      zone.bounds.getCenter(center);
      panner.positionX.value = center.x;
      panner.positionY.value = center.y;
      panner.positionZ.value = center.z;
      source.connect(panner).connect(gain).connect(this.ambienceGain);
    } else {
      source.connect(gain).connect(this.ambienceGain);
    }
    source.start(0);

    const incoming: ActiveAmbience = { source, gain, panner, volume: recipe.volume };
    const now = this.context.currentTime;
    gain.gain.setTargetAtTime(recipe.volume, now, CROSSFADE_TIME / 3);

    if (this.activeAmbience) {
      const outgoing = this.activeAmbience;
      outgoing.gain.gain.setTargetAtTime(0, now, CROSSFADE_TIME / 3);
      this.fadingOut.push(outgoing);
      // Stop after the fade; tracked so dispose() can cancel immediately.
      const stopAt = now + CROSSFADE_TIME + 0.2;
      try { outgoing.source.stop(stopAt); } catch { /* already stopped */ }
      outgoing.source.onended = () => {
        this.releaseAmbience(outgoing);
        this.fadingOut = this.fadingOut.filter((a) => a !== outgoing);
      };
    }
    this.activeAmbience = incoming;
  }

  private releaseAmbience(a: ActiveAmbience): void {
    try { a.source.disconnect(); } catch { /* ignore */ }
    try { a.gain.disconnect(); } catch { /* ignore */ }
    try { a.panner?.disconnect(); } catch { /* ignore */ }
  }

  /** Update the active zone from player position (call each frame). */
  updateZones(playerState: WorldPlayerState): void {
    if (!this.context || this.zones.length === 0 || this.disposed) return;

    const pos = playerState.position;
    let bestZone: WorldAudioZone | null = null;
    let bestPriority = -1;
    for (const zone of this.zones) {
      const expanded = zone.bounds.clone().expandByScalar(zone.fadeDistance);
      if (expanded.containsPoint(pos) && zone.priority > bestPriority) {
        bestPriority = zone.priority;
        bestZone = zone;
      }
    }
    if (bestZone && bestZone.id !== this.currentZone) {
      void this.playAmbienceZone(bestZone.id);
    }
  }

  // ==================== One-shots ====================

  private createPanner(
    model: "linear" | "inverse" | "exponential",
    rolloff: number,
    refDistance: number,
    maxDistance: number,
  ): PannerNode {
    const panner = this.context!.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = model;
    panner.rolloffFactor = rolloff;
    panner.refDistance = refDistance;
    panner.maxDistance = maxDistance;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 1;
    return panner;
  }

  private playBuffer(
    buffer: AudioBuffer,
    position: THREE.Vector3 | undefined,
    volume: number,
    pitch: number,
    spatial: boolean,
  ): void {
    if (!this.canPlay() || !this.sfxGain) return;
    if (this.reducedMotion) return; // ambience only under reduced motion

    const source = this.context!.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = this.context!.createGain();
    gain.gain.value = volume;

    let panner: PannerNode | null = null;
    if (spatial && position) {
      panner = this.createPanner("linear", 1, 1.5, 30);
      panner.positionX.value = position.x;
      panner.positionY.value = position.y;
      panner.positionZ.value = position.z;
      source.connect(panner).connect(gain).connect(this.sfxGain);
    } else {
      source.connect(gain).connect(this.sfxGain);
    }

    const entry: ActiveOneShot = { id: ++this.oneShotId, source, gain, panner };
    this.oneShots.push(entry);
    if (this.oneShots.length > MAX_ONESHOTS) {
      const old = this.oneShots.shift();
      if (old) this.releaseOneShot(old);
    }
    source.onended = () => {
      this.releaseOneShot(entry);
      this.oneShots = this.oneShots.filter((s) => s !== entry);
    };
    source.start(0);
  }

  private releaseOneShot(s: ActiveOneShot): void {
    try { s.source.stop(); } catch { /* already ended */ }
    try { s.source.disconnect(); } catch { /* ignore */ }
    try { s.gain.disconnect(); } catch { /* ignore */ }
    try { s.panner?.disconnect(); } catch { /* ignore */ }
  }

  /** Footstep with slight pitch variation; sand vs stone timbre. */
  async playFootstep(position: THREE.Vector3, material: "sand" | "stone" | "wood" | "gravel"): Promise<void> {
    const stone = material === "stone" || material === "wood";
    const buffer = this.getFootstepBuffer(stone);
    if (!buffer) return;
    this.playBuffer(buffer, position, 0.5, 0.9 + Math.random() * 0.2, true);
  }

  /** Environmental one-shot: cloth flutter or a wind gust. */
  async playEnvironmental(type: "cloth" | "camel" | "wind", position: THREE.Vector3): Promise<void> {
    // "camel" maps to a soft cloth/rustle — no animal vocal synthesis that
    // could read as cartoonish; the visual camel carries the life instead.
    const buffer = type === "wind" ? this.getGustBuffer() : this.getClothBuffer();
    if (!buffer) return;
    this.playBuffer(buffer, type === "wind" ? undefined : position, 0.4, 0.95 + Math.random() * 0.1, type !== "wind");
  }

  // ==================== Listener / controls ====================

  /** Update the audio listener from player state (call each frame). */
  updateListener(playerState: WorldPlayerState): void {
    if (!this.context || this.disposed) return;
    const listener = this.context.listener;
    const pos = playerState.position;
    const cosPitch = Math.cos(playerState.pitch);
    if (listener.positionX) {
      listener.positionX.value = pos.x;
      listener.positionY.value = pos.y + 1.6;
      listener.positionZ.value = pos.z;
      listener.forwardX.value = -Math.sin(playerState.yaw) * cosPitch;
      listener.forwardY.value = Math.sin(playerState.pitch);
      listener.forwardZ.value = -Math.cos(playerState.yaw) * cosPitch;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else {
      // Safari fallback (deprecated API).
      listener.setPosition(pos.x, pos.y + 1.6, pos.z);
      listener.setOrientation(
        -Math.sin(playerState.yaw) * cosPitch, Math.sin(playerState.pitch), -Math.cos(playerState.yaw) * cosPitch,
        0, 1, 0,
      );
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = THREE.MathUtils.clamp(volume, 0, 1);
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, this.context.currentTime, 0.05);
    }
    // Unmuting inside a zone restarts its bed if it never started.
    if (!muted && this.currentZone && !this.activeAmbience) {
      const zoneId = this.currentZone;
      this.currentZone = null;
      void this.playAmbienceZone(zoneId);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) {
      for (const s of this.oneShots) this.releaseOneShot(s);
      this.oneShots = [];
    }
  }

  /** Stop everything and close the context. Idempotent. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    if (this.activeAmbience) {
      try { this.activeAmbience.source.stop(); } catch { /* ignore */ }
      this.releaseAmbience(this.activeAmbience);
      this.activeAmbience = null;
    }
    for (const a of this.fadingOut) {
      try { a.source.stop(); } catch { /* ignore */ }
      this.releaseAmbience(a);
    }
    this.fadingOut = [];
    for (const s of this.oneShots) this.releaseOneShot(s);
    this.oneShots = [];

    try { this.ambienceGain?.disconnect(); } catch { /* ignore */ }
    try { this.sfxGain?.disconnect(); } catch { /* ignore */ }
    try { this.masterGain?.disconnect(); } catch { /* ignore */ }
    this.ambienceGain = null;
    this.sfxGain = null;
    this.masterGain = null;

    if (this.context) {
      try { void this.context.close(); } catch { /* ignore */ }
      this.context = null;
    }
    this.bufferCache.clear();
    this.state = "closed";
  }

  /** Diagnostics for browser evidence. */
  getState(): { state: AudioEngineState; currentZone: string | null; activeOneShots: number; unlocked: boolean } {
    return {
      state: this.context ? (this.context.state === "running" ? "running" : "suspended") : this.state,
      currentZone: this.currentZone,
      activeOneShots: this.oneShots.length,
      unlocked: this.userGestureReceived,
    };
  }
}
