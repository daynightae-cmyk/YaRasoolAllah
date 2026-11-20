import { AMBIENT_BASE_LEVEL, targetLevel, type AmbientPresence } from "./ambience-policy";

export interface AmbienceEngineOptions {
  /** Injectable for tests; defaults to the browser AudioContext. */
  createContext?: () => AudioContext | null;
  /** Looping noise bed length in seconds. */
  bufferSeconds?: number;
  baseLevel?: number;
  /** Ducking time constant in seconds. */
  fadeSeconds?: number;
  /** Slow amplitude drift ("breath") in hertz. */
  lfoHz?: number;
  lfoDepth?: number;
  /** Low-pass corner that keeps the bed soft rather than hissy. */
  filterHz?: number;
  onUnavailable?: (reason: "unsupported" | "create-failed") => void;
}

function defaultCreateContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  return new Ctor();
}

/**
 * A small, fully synthesized ambience bed.
 *
 * It is built from original synthesis only: a looping noise buffer shaped by a
 * low-pass filter and a slow amplitude drift, through a ducking gain. No
 * samples, no recordings, no network. The engine is inert until `start()` and
 * never resumes a context that has not been user-enabled by the caller.
 */
export class AmbienceEngine {
  private readonly createContext: () => AudioContext | null;
  private readonly bufferSeconds: number;
  private baseLevel: number;
  private readonly fadeSeconds: number;
  private readonly lfoHz: number;
  private readonly lfoDepth: number;
  private readonly filterHz: number;
  private readonly onUnavailable?: (reason: "unsupported" | "create-failed") => void;

  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private drift: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private duck: GainNode | null = null;
  private running = false;
  private voice: boolean = false;

  constructor(options: AmbienceEngineOptions = {}) {
    this.createContext = options.createContext ?? defaultCreateContext;
    this.bufferSeconds = options.bufferSeconds ?? 3;
    this.baseLevel = options.baseLevel ?? AMBIENT_BASE_LEVEL;
    this.fadeSeconds = options.fadeSeconds ?? 0.9;
    this.lfoHz = options.lfoHz ?? 0.07;
    this.lfoDepth = options.lfoDepth ?? 0.12;
    this.filterHz = options.filterHz ?? 1200;
    this.onUnavailable = options.onUnavailable;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get currentLevel(): number {
    return targetLevel(this.baseLevel, this.voice ? "voice" : "none");
  }

  private buildGraph(): boolean {
    let context: AudioContext | null = null;
    try {
      context = this.createContext();
      if (!context) {
        this.onUnavailable?.("unsupported");
        return false;
      }
      const length = Math.max(1, Math.floor(context.sampleRate * this.bufferSeconds));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        data[index] = Math.random() * 2 - 1;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = this.filterHz;
      filter.Q.value = 0.7;

      // Slow drift so the bed reads as air rather than a static hiss.
      const drift = context.createGain();
      drift.gain.value = 0.5;
      const lfo = context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = this.lfoHz;
      const lfoDepthGain = context.createGain();
      lfoDepthGain.gain.value = this.lfoDepth;
      lfo.connect(lfoDepthGain).connect(drift.gain);
      lfo.start();

      const duck = context.createGain();
      duck.gain.value = this.currentTarget();

      source.connect(filter).connect(drift).connect(duck).connect(context.destination);
      source.start();

      this.context = context;
      this.source = source;
      this.filter = filter;
      this.drift = drift;
      this.lfo = lfo;
      this.duck = duck;
      this.running = true;
      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }
      return true;
    } catch {
      this.onUnavailable?.("create-failed");
      this.teardownNodes();
      return false;
    }
  }

  private currentTarget(): number {
    return targetLevel(this.baseLevel, this.voice ? "voice" : "none");
  }

  private teardownNodes(): void {
    try {
      this.source?.stop();
    } catch {
      // Already stopped.
    }
    try {
      this.source?.disconnect();
    } catch {
      // Already detached.
    }
    this.source = null;
    try {
      this.filter?.disconnect();
    } catch {
      // Already detached.
    }
    this.filter = null;
    try {
      this.drift?.disconnect();
    } catch {
      // Already detached.
    }
    this.drift = null;
    try {
      this.lfo?.stop();
    } catch {
      // Already stopped.
    }
    try {
      this.lfo?.disconnect();
    } catch {
      // Already detached.
    }
    this.lfo = null;
    try {
      this.duck?.disconnect();
    } catch {
      // Already detached.
    }
    this.duck = null;
    this.running = false;
  }

  /** Start the bed. Idempotent; a no-op once running. */
  start(): boolean {
    if (this.running) return true;
    return this.buildGraph();
  }

  /** Fade out and release the graph, keeping the context for a later start. */
  stop(): void {
    if (this.running && this.duck && this.context) {
      const now = this.context.currentTime;
      const constant = Math.max(0.05, this.fadeSeconds / 3);
      this.duck.gain.setTargetAtTime(0, now, constant);
      const source = this.source;
      if (source) {
        try {
          source.stop(now + this.fadeSeconds * 3 + 0.05);
        } catch {
          // Already stopped.
        }
      }
    }
    this.teardownNodes();
  }

  dispose(): void {
    this.stop();
    try {
      this.context?.close();
    } catch {
      // Closing is best-effort.
    }
    this.context = null;
  }

  setVoiceActive(active: boolean): void {
    this.voice = active;
    if (this.duck && this.context) {
      const now = this.context.currentTime;
      const constant = Math.max(0.05, this.fadeSeconds / 3);
      this.duck.gain.setTargetAtTime(this.targetFor(this.baseLevel, active), now, constant);
    }
  }

  setBaseLevel(level: number): void {
    this.baseLevel = level;
    if (this.duck && this.context) {
      const now = this.context.currentTime;
      const constant = Math.max(0.05, this.fadeSeconds / 3);
      this.duck.gain.setTargetAtTime(this.currentTarget(), now, constant);
    }
  }

  private targetFor(base: number, active: boolean): number {
    return targetLevel(base, active ? "voice" : "none");
  }
}

let shared: AmbienceEngine | null = null;

export function getAmbientEngine(): AmbienceEngine {
  if (!shared) shared = new AmbienceEngine();
  return shared;
}

/** Test seam: release the process-wide engine. */
export function resetAmbientEngine(): void {
  shared?.dispose();
  shared = null;
}
