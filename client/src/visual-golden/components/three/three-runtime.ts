import * as THREE from "three";
import type { EffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  isLowCapacityDevice,
  readDeviceCapacitySignals,
  type DeviceCapacitySignals,
} from "@/visual-golden/lib/institution/device-capacity";

export type ThreeRuntimeState =
  | "idle"
  | "starting"
  | "running"
  | "paused"
  | "context-lost"
  | "fallback"
  | "stopped";

export type GraphicsTier = "low" | "balanced" | "high";

export interface ThreeRuntimeContext {
  renderer: THREE.WebGLRenderer;
  host: HTMLDivElement;
  motion: EffectiveMotion;
  graphicsTier: GraphicsTier;
  shadowsEnabled: boolean;
  signal: AbortSignal;
  /** Request one discrete frame. In reduced-motion mode this renders once. */
  invalidate(): void;
  /** Register cleanup that must run even when scene construction throws. */
  registerDisposable(dispose: () => void): () => void;
}

export interface ThreeSceneHandle {
  frame(deltaSeconds: number, elapsedSeconds: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
  setMotion?(motion: EffectiveMotion): void;
}

export interface ThreeSceneAdapter {
  build(context: ThreeRuntimeContext): ThreeSceneHandle | Promise<ThreeSceneHandle>;
}

export interface ThreeRuntimeOptions {
  host: HTMLDivElement;
  adapter: ThreeSceneAdapter;
  active?: boolean;
  paused?: boolean;
  motion?: EffectiveMotion;
  onStateChange?: (state: ThreeRuntimeState) => void;
  onFallback?: (error: unknown) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

interface GraphicsSignals extends DeviceCapacitySignals {
  reducedMotion?: boolean;
}

/**
 * Resolve a conservative graphics tier from signals that are available in
 * browsers. The function is pure so the policy can be contract-tested without
 * creating a WebGL context.
 */
export function detectGraphicsTier(signals: GraphicsSignals = {}): GraphicsTier {
  const cores = signals.hardwareConcurrency ?? 4;
  const memory = signals.deviceMemory ?? 4;
  if (signals.reducedMotion || isLowCapacityDevice(signals)) return "low";
  if (cores >= 8 && memory >= 8) return "high";
  return "balanced";
}

function browserSignals(reducedMotion: boolean): GraphicsSignals {
  if (typeof navigator === "undefined") return { reducedMotion };
  return { ...readDeviceCapacitySignals(), reducedMotion };
}

const MIN_FRAME_INTERVAL: Record<GraphicsTier, number> = {
  low: 1000 / 30,
  balanced: 1000 / 45,
  high: 1000 / 60,
};

const MAX_PIXEL_RATIO: Record<GraphicsTier, number> = {
  low: 1,
  balanced: 1.25,
  high: 1.5,
};

/**
 * A bounded lifecycle owner for Three.js scenes.
 *
 * It owns exactly one animation-frame scheduler, the renderer, visibility and
 * intersection gating, resize handling, WebGL context-loss handling, and
 * idempotent cleanup. Scene adapters own only geometry, camera behaviour and
 * interaction.
 */
export class ThreeRuntime {
  private readonly options: ThreeRuntimeOptions;
  private readonly abortController = new AbortController();
  private readonly disposables = new Set<() => void>();
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: ThreeSceneHandle | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private frameId: number | null = null;
  private lastTimestamp = 0;
  private lastRenderTimestamp = 0;
  private elapsed = 0;
  private inView = true;
  private contextLost = false;
  private stopped = false;
  private active: boolean;
  private paused: boolean;
  private motion: EffectiveMotion;
  private state: ThreeRuntimeState = "idle";
  private graphicsTier: GraphicsTier = "balanced";

  constructor(options: ThreeRuntimeOptions) {
    this.options = options;
    this.active = options.active ?? true;
    this.paused = options.paused ?? false;
    this.motion = options.motion ?? "full";
  }

  getState(): ThreeRuntimeState {
    return this.state;
  }

  async start(): Promise<void> {
    if (this.stopped || this.state !== "idle") return;
    this.setState("starting");

    try {
      this.graphicsTier = detectGraphicsTier(browserSignals(this.motion === "reduced"));
      this.syncDiagnostics();
      const renderer = new THREE.WebGLRenderer({
        antialias: this.graphicsTier === "high",
        alpha: false,
        powerPreference: this.graphicsTier === "low" ? "low-power" : "default",
      });
      this.renderer = renderer;
      renderer.setPixelRatio(this.pixelRatio());
      renderer.shadowMap.enabled = this.shadowsEnabled();
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.touchAction = "none";
      this.options.host.appendChild(renderer.domElement);

      this.installContextHandlers(renderer);
      this.installObservers();

      const self = this;
      const context: ThreeRuntimeContext = {
        renderer,
        host: this.options.host,
        // Live view of the runtime's motion — a plain snapshot would freeze
        // the adapter's reduced-motion branches at build time, so later
        // setMotion flips would never reach scene travel/lamp decisions.
        get motion() {
          return self.motion;
        },
        graphicsTier: this.graphicsTier,
        shadowsEnabled: this.shadowsEnabled(),
        signal: this.abortController.signal,
        invalidate: () => this.invalidate(),
        registerDisposable: (dispose) => this.registerDisposable(dispose),
      };

      const scene = await this.options.adapter.build(context);
      if (this.stopped) {
        scene.dispose();
        return;
      }
      this.scene = scene;
      this.resize();
      this.setState(this.controlledState());
      this.updateScheduling();
      if (this.motion === "reduced") this.invalidate();
    } catch (error) {
      // A component may unmount while an asynchronous adapter is still
      // building. The unmount path already owns cleanup, so do not replace its
      // terminal state with a fallback notification.
      if (this.stopped) return;
      this.fail(error);
    }
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.cancelFrame();
    this.abortController.abort();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;

    try {
      this.scene?.dispose();
    } catch {
      // Cleanup is best-effort, but every registered resource is still tried.
    }
    this.scene = null;

    for (const dispose of [...this.disposables].reverse()) {
      try {
        dispose();
      } catch {
        // Continue releasing the remaining resources.
      }
    }
    this.disposables.clear();

    if (this.renderer) {
      const canvas = this.renderer.domElement;
      this.renderer.dispose();
      canvas.remove();
      this.renderer = null;
    }

    this.setState("stopped");
  }

  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (!active) this.cancelFrame();
    this.setState(this.controlledState());
    this.updateScheduling();
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused) this.cancelFrame();
    this.setState(this.controlledState());
    this.updateScheduling();
  }

  setMotion(motion: EffectiveMotion): void {
    if (this.motion === motion) return;
    this.motion = motion;
    this.scene?.setMotion?.(motion);
    this.syncDiagnostics();
    if (this.renderer) {
      this.renderer.setPixelRatio(this.pixelRatio());
      this.renderer.shadowMap.enabled = this.shadowsEnabled();
    }
    if (motion === "reduced") this.cancelFrame();
    this.updateScheduling();
    if (motion === "reduced") this.invalidate();
  }

  /** Request a frame. Reduced-motion scenes render one discrete frame only. */
  invalidate(): void {
    if (!this.canRender()) return;
    if (this.motion === "full") {
      this.scheduleContinuous();
      return;
    }
    this.scheduleDiscrete();
  }

  private pixelRatio(): number {
    const deviceRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    const cap = this.motion === "reduced" ? 1 : MAX_PIXEL_RATIO[this.graphicsTier];
    return Math.min(deviceRatio, cap);
  }

  private shadowsEnabled(): boolean {
    return this.motion === "full" && this.graphicsTier === "high";
  }

  private registerDisposable(dispose: () => void): () => void {
    // An asynchronous adapter can finish allocating after its component has
    // unmounted. Release such late resources immediately instead of adding
    // them to a collection that will never be iterated again.
    if (this.stopped) {
      try {
        dispose();
      } catch {
        // Cleanup remains best-effort.
      }
      return () => undefined;
    }
    this.disposables.add(dispose);
    return () => this.disposables.delete(dispose);
  }

  private controlledState(): ThreeRuntimeState {
    if (this.contextLost) return "context-lost";
    if (!this.active) return "paused";
    return this.paused ? "paused" : "running";
  }

  private setState(state: ThreeRuntimeState): void {
    if (this.state === state) return;
    this.state = state;
    this.options.onStateChange?.(state);
    this.syncDiagnostics();
  }

  /**
   * Publish bounded, non-sensitive runtime facts on the host element so
   * browser evidence can distinguish motion, visibility, and fallback states
   * without reaching into React internals or attaching a frame-by-frame
   * instrumentation cost.
   */
  private syncDiagnostics(): void {
    const host = this.options.host;
    host.dataset.threeRuntimeState = this.state;
    host.dataset.threeMotion = this.motion;
    host.dataset.threeGraphicsTier = this.graphicsTier;
    host.dataset.threeInView = String(this.inView);
    host.dataset.threeCanRender = String(this.canRender());
  }

  private fail(error: unknown): void {
    this.cancelFrame();
    this.abortController.abort();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;

    try {
      this.scene?.dispose();
    } catch {
      // Continue with the remaining cleanup.
    }
    this.scene = null;
    for (const dispose of [...this.disposables].reverse()) {
      try {
        dispose();
      } catch {
        // Continue with the remaining cleanup.
      }
    }
    this.disposables.clear();
    if (this.renderer) {
      const canvas = this.renderer.domElement;
      this.renderer.dispose();
      canvas.remove();
      this.renderer = null;
    }

    this.stopped = true;
    this.setState("fallback");
    this.options.onFallback?.(error);
  }

  private installContextHandlers(renderer: THREE.WebGLRenderer): void {
    const canvas = renderer.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      this.contextLost = true;
      this.cancelFrame();
      this.setState("context-lost");
      this.options.onContextLost?.();
    };
    const onRestored = () => {
      this.contextLost = false;
      this.renderer?.resetState();
      this.resize();
      this.setState(this.controlledState());
      this.options.onContextRestored?.();
      this.updateScheduling();
      this.invalidate();
    };
    canvas.addEventListener("webglcontextlost", onLost, { signal: this.abortController.signal });
    canvas.addEventListener("webglcontextrestored", onRestored, { signal: this.abortController.signal });
  }

  private installObservers(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.options.host);
    } else {
      window.addEventListener("resize", this.resize, { signal: this.abortController.signal });
    }

    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.inView = entries[0]?.isIntersecting ?? true;
        if (!this.inView) this.cancelFrame();
        this.syncDiagnostics();
        this.updateScheduling();
      });
      this.intersectionObserver.observe(this.options.host);
    }

    document.addEventListener("visibilitychange", this.onVisibilityChange, {
      signal: this.abortController.signal,
    });
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.cancelFrame();
    } else {
      this.lastTimestamp = 0;
    }
    this.syncDiagnostics();
    this.updateScheduling();
  };

  private readonly resize = () => {
    if (!this.renderer || !this.scene) return;
    const width = Math.max(1, this.options.host.clientWidth || 1);
    const height = Math.max(1, this.options.host.clientHeight || 1);
    this.renderer.setSize(width, height, false);
    this.scene.resize(width, height);
  };

  private canRender(): boolean {
    return Boolean(
      this.renderer &&
      this.scene &&
      this.active &&
      !this.paused &&
      !this.contextLost &&
      !this.stopped &&
      !document.hidden &&
      this.inView,
    );
  }

  private updateScheduling(): void {
    if (!this.canRender()) {
      this.cancelFrame();
      return;
    }
    if (this.motion === "full") this.scheduleContinuous();
  }

  private scheduleContinuous(): void {
    if (this.frameId !== null || !this.canRender()) return;
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  private scheduleDiscrete(): void {
    if (this.frameId !== null || !this.canRender()) return;
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  private cancelFrame(): void {
    if (this.frameId === null) return;
    window.cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.lastTimestamp = 0;
  }

  private readonly tick = (timestamp: number) => {
    this.frameId = null;
    if (!this.canRender()) return;

    const minimumInterval = MIN_FRAME_INTERVAL[this.graphicsTier];
    if (this.motion === "full" && timestamp - this.lastRenderTimestamp < minimumInterval) {
      this.scheduleContinuous();
      return;
    }

    const delta = this.lastTimestamp
      ? Math.min(Math.max(0, (timestamp - this.lastTimestamp) / 1000), 0.05)
      : 0;
    this.lastTimestamp = timestamp;
    this.lastRenderTimestamp = timestamp;
    this.elapsed += delta;

    try {
      this.scene?.frame(delta, this.elapsed);
    } catch (error) {
      this.fail(error);
      return;
    }

    if (this.motion === "full") this.scheduleContinuous();
  };
}
