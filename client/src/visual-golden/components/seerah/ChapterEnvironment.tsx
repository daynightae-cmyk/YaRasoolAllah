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

import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Boxes } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { chapterWorldPlate } from "@/visual-golden/services/seerah-worlds";
import { getChapterTerrainScene } from "@/visual-golden/services/seerah-terrain";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { SeerahSceneConfig } from "@/visual-golden/services/seerah-scene";
import styles from "./ChapterEnvironment.module.css";

// Three.js stays out of the initial chunk: the terrain theatre loads only
// when the visitor opts into the 3D observer environment.
const TerrainTheatre3D = lazy(() =>
  import("./TerrainTheatre3D").then((module) => ({ default: module.TerrainTheatre3D })),
);

interface ChapterEnvironmentProps {
  scene: SeerahSceneConfig | null;
  children: ReactNode;
}

export function ChapterEnvironment({ scene, children }: ChapterEnvironmentProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const theme = useInstitution((state) => state.theme);
  const [mounted, setMounted] = useState(false);
  const [terrainOpen, setTerrainOpen] = useState(false);
  const [terrainFailed, setTerrainFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // A new chapter resets the observer session; the plate remains the default.
  useEffect(() => {
    setTerrainOpen(false);
    setTerrainFailed(false);
  }, [scene?.chapterId]);

  const terrainScene = scene ? getChapterTerrainScene(scene.chapterId) : null;
  const terrainAvailable = !!terrainScene && !terrainFailed;
  const showTerrain = terrainOpen && terrainAvailable && mounted;

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
      data-terrain-mode={showTerrain ? "3d" : "plate"}
    >
      {/* Genuine 3D observer terrain when available and requested */}
      {showTerrain && terrainScene ? (
        <Suspense fallback={<div className={styles.plateWrapper} aria-hidden><div className={styles.fallbackPlate} /></div>}>
          <TerrainTheatre3D
            scene={terrainScene}
            onExit={() => setTerrainOpen(false)}
            onUnavailable={() => {
              setTerrainFailed(true);
              setTerrainOpen(false);
            }}
          />
        </Suspense>
      ) : (
        <>
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
        </>
      )}

      {/* Opt-in entry to the 3D observer environment */}
      {terrainAvailable && !showTerrain && mounted ? (
        <button
          type="button"
          className={styles.terrainEnter}
          data-visual="seerah-chapter-terrain-enter"
          onClick={() => setTerrainOpen(true)}
        >
          <Boxes size={14} aria-hidden />
          ادخل بيئة الفصل ثلاثية الأبعاد — مراقب محايد
        </button>
      ) : null}

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
