/**
 * ChapterEnvironment — distinct immersive environment per Seerah chapter.
 *
 * Renders an atmosphere layer (lighting, texture, weather, subtle movement)
 * around chapter content without depending on WebGL. The environment:
 * - Never depicts the Prophet ﷺ, companions, angels or Allah.
 * - Uses place/period textures only (stone, sand, mountain, night sky).
 * - Declares itself an illustrative reconstruction, not documentary evidence.
 * - Respects reduced motion: decorative movement stops when motion is reduced.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { art } from "@/visual-golden/mock/art";
import { chapterWorldPlate } from "@/visual-golden/services/seerah-worlds";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { SeerahSceneConfig } from "@/visual-golden/services/seerah-scene";
import styles from "./ChapterEnvironment.module.css";

interface ChapterEnvironmentProps {
  scene: SeerahSceneConfig | null;
  children: ReactNode;
}

export function ChapterEnvironment({ scene, children }: ChapterEnvironmentProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const theme = useInstitution((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plate = scene
    ? chapterWorldPlate(scene.chapterId) ?? art[scene.plate] ?? art.desert
    : null;
  const hasPlate = !!plate;
  const sceneWeather = scene?.weather ?? "clear-dawn";
  const sceneMovement = scene?.movement ?? "none";

  return (
    <section
      className={styles.root}
      data-scene={scene?.chapterId ?? "none"}
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
        <aside className={styles.disclosure} aria-label="إفصاح عن المشهد التوضيحي">
          <span role="img" aria-hidden>
            🖼
          </span>
          <span>{scene.disclosureAr}</span>
        </aside>
      ) : null}
    </section>
  );
}

ChapterEnvironment.displayName = "ChapterEnvironment";
