/**
 * WorldBackdrop — the cinematic environment plate behind every wing.
 *
 * Mounts one full-bleed world plate (2026 reference pack, see
 * lib/institution/worlds.ts) behind the shell content so each section reads
 * as its own living world under the shared emerald/gold identity.
 *
 * Contract:
 * - Decorative only: aria-hidden, pointer-events none, never intercepts UI.
 * - Theme aware: dimmed on dark, softened to a parchment wash on light,
 *   fully hidden in high-contrast mode.
 * - Motion aware: the slow breathing drift runs only with full motion and
 *   is killed by the shell's reduced-motion authority.
 * - Honest artwork: illustrative environments, no sacred-person depiction.
 */

import { useEffect, useState } from "react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import type { InstitutionWingId } from "@/visual-golden/lib/institution/workspace";
import styles from "./world-backdrop.module.css";

interface WorldBackdropProps {
  wing: InstitutionWingId;
}

export function WorldBackdrop({ wing }: WorldBackdropProps) {
  const theme = useInstitution((state) => state.theme);
  const [loaded, setLoaded] = useState(false);
  const world = worldPlateForWing(wing);

  useEffect(() => {
    setLoaded(false);
    const image = new Image();
    image.src = world.plate;
    image.onload = () => setLoaded(true);
    return () => {
      image.onload = null;
    };
  }, [world.plate]);

  if (theme === "contrast") return null;

  return (
    <div
      className={styles.backdrop}
      data-world={wing}
      data-world-loaded={loaded ? "true" : "false"}
      aria-hidden
    >
      <img className={styles.plate} src={world.plate} alt="" loading="eager" decoding="async" />
      <div className={styles.veil} />
      <div className={styles.horizon} />
    </div>
  );
}

WorldBackdrop.displayName = "WorldBackdrop";
