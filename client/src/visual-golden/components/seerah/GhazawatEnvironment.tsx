/**
 * GhazawatEnvironment — distinct immersive environment per Ghazwah event.
 *
 * Renders an atmosphere layer around a battle/historical event without
 * depicting people, combatants, or sacred personalities. The environment:
 * - Never depicts the Prophet ﷺ, companions, angels, or Allah.
 * - No combat mechanics, no gore, no playable killing.
 * - Uses place/period textures only (stone, sand, mountain, night sky).
 * - Declares itself an illustrative reconstruction, not documentary evidence.
 * - Respects reduced motion: decorative movement stops when motion is reduced.
 */

import { useEffect, useState, type ReactNode } from "react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { GhazawatSceneConfig } from "@/visual-golden/services/seerah-ghazawat";
import styles from "./GhazawatEnvironment.module.css";

interface GhazawatEnvironmentProps {
  scene: GhazawatSceneConfig | null;
  children: ReactNode;
}

export function GhazawatEnvironment({ scene, children }: GhazawatEnvironmentProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const theme = useInstitution((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plate = scene ? art[scene.plate] ?? art.desert : null;
  const hasPlate = !!plate;
  const sceneWeather = scene?.weather ?? "clear-dawn";
  const sceneMovement = scene?.movement ?? "none";

  return (
    <section
      className={styles.root}
      data-ghazwah={scene?.eventId ?? "none"}
      data-theme={theme}
      data-motion={reducedMotion ? "reduced" : "full"}
    >
      {/* Background atmosphere plate */}
      {hasPlate && mounted ? (
        <div className={styles.plateWrapper} aria-hidden>
          <img className={styles.plate} src={plate} alt="" loading="lazy" decoding="async" />
          <div className={styles.atmosphere} data-weather={sceneWeather} />
        </div>
      ) : (
        <div className={styles.plateWrapper} aria-hidden>
          <div className={styles.fallbackPlate} />
        </div>
      )}

      {/* Subtle movement layer: only when motion is full */}
      {!reducedMotion && mounted ? (
        <div className={styles.movementLayer} aria-hidden data-movement={sceneMovement} />
      ) : null}

      {/* Vignette / depth */}
      <div className={styles.vignette} aria-hidden />

      <div className={styles.content}>{children}</div>

      {/* Reconstruction disclosure (always visible, unobtrusive) */}
      {scene ? (
        <aside className={styles.disclosure} aria-label="إفصاح عن المشهد التوضيحي للغزوة">
          <span role="img" aria-hidden>
            🖼
          </span>
          <span>{scene.disclosureAr}</span>
        </aside>
      ) : null}
    </section>
  );
}

GhazawatEnvironment.displayName = "GhazawatEnvironment";
