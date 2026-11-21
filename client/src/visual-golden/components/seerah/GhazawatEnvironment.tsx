/**
 * GhazawatEnvironment - distinct immersive environment per Ghazwah event.
 *
 * Renders an atmosphere layer around a battle/historical event without
 * depicting people, combatants, or sacred personalities. The environment:
 * - Never depicts the Prophet, companions, angels, or Allah.
 * - No combat mechanics, no gore, no playable killing.
 * - Uses place/period textures only (stone, sand, mountain, night sky).
 * - Events with a registered terrain scene (seerah-terrain.ts) offer an opt-in door
 *   into a dedicated full-screen observer studio (/seerah/terrain?event=...).
 *   The plate stays the default AND the fallback whenever WebGL is unavailable.
 *   The studio lives on its own route because an inline 3D box inside the
 *   reading column collapses to ~479px and stops reading as an environment.
 * - Declares itself an illustrative reconstruction, not documentary evidence.
 * - Respects reduced motion: decorative movement stops when motion is reduced.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Boxes, Maximize2 } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { eventWorldPlate } from "@/visual-golden/services/seerah-worlds";
import { getTerrainScene } from "@/visual-golden/services/seerah-terrain";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { GhazawatSceneConfig } from "@/visual-golden/services/seerah-ghazawat";
import styles from "./GhazawatEnvironment.module.css";

interface GhazawatEnvironmentProps {
  scene: GhazawatSceneConfig | null;
  children: ReactNode;
  /** Full-screen observer studio for this event (own route). */
  studioHref?: string;
  /** Plate-only surface: never mount the inline 3D box. */
  plateOnly?: boolean;
}

export function GhazawatEnvironment({ scene, children, studioHref, plateOnly = false }: GhazawatEnvironmentProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const theme = useInstitution((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const terrainScene = scene ? getTerrainScene(scene.eventId) : null;
  const studioAvailable = plateOnly === true ? !!terrainScene && !!studioHref : false;

  const plate = scene
    ? eventWorldPlate(scene.eventId) ?? art[scene.plate] ?? art.desert
    : null;
  const hasPlate = !!plate;
  const sceneWeather = scene?.weather ?? "clear-dawn";
  const sceneMovement = scene?.movement ?? "none";

  return (
    <section
      className={styles.root}
      data-ghazwah={scene?.eventId ?? "none"}
      data-theme={theme}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-terrain-mode="plate"
    >
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

      {!reducedMotion && mounted ? (
        <div className={styles.movementLayer} aria-hidden data-movement={sceneMovement} />
      ) : null}

      <div className={styles.vignette} aria-hidden />

      {studioAvailable && studioHref ? (
        <Link href={studioHref} className={styles.terrainEnter} data-visual="seerah-terrain-enter">
          <Boxes size={14} aria-hidden />
          ادخل بيئة المكان ثلاثية الأبعاد — مراقب محايد
          <Maximize2 size={12} aria-hidden className={styles.enterIcon} />
        </Link>
      ) : null}

      <div className={styles.content}>{children}</div>

      {scene ? (
        <aside className={styles.disclosure} aria-label="تنبيه حول الطبيعة التوضيحية للبيئة">
          <span role="img" aria-hidden>
            ?
          </span>
          <span>{scene.disclosureAr}</span>
        </aside>
      ) : null}
    </section>
  );
}

GhazawatEnvironment.displayName = "GhazawatEnvironment";
