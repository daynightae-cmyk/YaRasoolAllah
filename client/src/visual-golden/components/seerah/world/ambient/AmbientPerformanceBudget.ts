/** Real frame-time sampling and deliberately slow quality hysteresis. */
import type { AmbientQualityTier } from "./AmbientTypes";

export class AmbientPerformanceBudget {
  private samples = new Float32Array(90);
  private cursor = 0;
  private count = 0;
  private lastNow: number | null = null;
  private slowSeconds = 0;
  private fastSeconds = 0;
  private manualUntil = 0;

  constructor(private tier: AmbientQualityTier) {}

  setQuality(tier: AmbientQualityTier, now = this.now()): void {
    this.tier = tier;
    this.manualUntil = now + 15000;
    this.slowSeconds = 0;
    this.fastSeconds = 0;
  }
  getQuality(): AmbientQualityTier { return this.tier; }

  sample(now = this.now()): { frameTimeMs: number | null; fps: number | null; quality: AmbientQualityTier } {
    let frame: number | null = null;
    if (this.lastNow !== null) {
      const elapsed = now - this.lastNow;
      // Ignore sleep/debugger gaps instead of reporting them as rendering FPS.
      if (elapsed > 0 && elapsed < 500) {
        frame = elapsed;
        this.samples[this.cursor] = elapsed;
        this.cursor = (this.cursor + 1) % this.samples.length;
        this.count = Math.min(this.samples.length, this.count + 1);
      }
    }
    this.lastNow = now;
    const frameTimeMs = this.average();
    if (this.count >= 30 && now >= this.manualUntil && frameTimeMs !== null) {
      const seconds = Math.min(0.25, (frame ?? 0) / 1000);
      this.slowSeconds = frameTimeMs > 25 ? this.slowSeconds + seconds : 0;
      this.fastSeconds = frameTimeMs < 15 ? this.fastSeconds + seconds : 0;
      if (this.slowSeconds >= 4) {
        if (this.tier === "high") this.tier = "medium";
        else if (this.tier === "medium") this.tier = "low";
        this.slowSeconds = 0;
        this.fastSeconds = 0;
      } else if (this.fastSeconds >= 10) {
        if (this.tier === "low") this.tier = "medium";
        else if (this.tier === "medium") this.tier = "high";
        this.slowSeconds = 0;
        this.fastSeconds = 0;
      }
    }
    return { frameTimeMs, fps: frameTimeMs ? 1000 / frameTimeMs : null, quality: this.tier };
  }

  resetClock(): void { this.lastNow = null; }
  private average(): number | null {
    if (!this.count) return null;
    let total = 0;
    for (let i = 0; i < this.count; i++) total += this.samples[i];
    return total / this.count;
  }
  private now(): number { return typeof performance === "undefined" ? Date.now() : performance.now(); }
}
