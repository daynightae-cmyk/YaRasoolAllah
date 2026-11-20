/**
 * ChapterGateway — entrance threshold for a Seerah chapter.
 *
 * Renders an architectural doorway with chapter identity, atmosphere label,
 * and an accessible entry control. This is a DOM entry threshold (not a
 * toll gate): direct deep links always work, reduced motion skips it, and
 * it never traps the visitor.
 *
 * The physical door rendering reuses the existing SectionEntry3D door
 * engine when `use3D` is true; otherwise it renders a lightweight CSS door
 * frame with opening choreography.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { SectionEntry3D } from "@/visual-golden/components/entry/SectionEntry3D";
import { chapterWorldPlate } from "@/visual-golden/services/seerah-worlds";
import type { SeerahSceneConfig } from "@/visual-golden/services/seerah-scene";
import styles from "./ChapterGateway.module.css";

interface ChapterGatewayProps {
  chapterId: string;
  scene: SeerahSceneConfig | null;
  children: ReactNode;
  /** Whether to render the Three.js door engine (false = lightweight CSS door). */
  use3D?: boolean;
}

export function ChapterGateway({
  chapterId,
  scene,
  children,
  use3D = false,
}: ChapterGatewayProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const notifySound = useInstitution((state) => state.notifySound);
  const [showDoor, setShowDoor] = useState(() => {
    if (!use3D || reducedMotion || typeof window === "undefined") return false;
    try {
      const seen = sessionStorage.getItem(`yra-chapter-door-seen-${chapterId}`);
      return seen !== "1";
    } catch {
      return true;
    }
  });

  const rememberEntry = useCallback(() => {
    try {
      sessionStorage.setItem(`yra-chapter-door-seen-${chapterId}`, "1");
    } catch {
      // ignore
    }
  }, [chapterId]);

  const handleEntered = useCallback(() => {
    rememberEntry();
    setShowDoor(false);
  }, [rememberEntry]);

  useEffect(() => {
    if (!use3D || reducedMotion) setShowDoor(false);
  }, [use3D, reducedMotion]);

  const label = useMemo(() => {
    if (scene) return { ar: scene.titleAr, en: scene.eraAr };
    return { ar: chapterId, en: chapterId };
  }, [chapterId, scene]);

  // Prefer the 2026 cinematic world plate; the schematic SVG scene remains
  // the fallback for chapters the pack does not cover.
  const previewPlate = chapterWorldPlate(chapterId) ?? (scene ? art[scene.plate] ?? art.desert : art.desert);

  return (
    <div className={styles.root} data-chapter={chapterId}>
      {/* Atmosphere preview behind the door — only while the door is closed. */}
      {showDoor ? (
        <div className={styles.atmospherePreview} aria-hidden>
          <div className={styles.previewPlate} style={{ backgroundImage: `url(${previewPlate})` }} />
          <div className={styles.previewVignette} />
          <div className={styles.previewLabel}>
            <span className={styles.labelKicker}>مدخل الفصل</span>
            <h2 className={styles.labelTitle}>{label.ar}</h2>
            <span className={styles.labelEra}>{label.en}</span>
            <p className={styles.labelDesc}>
              بيئة توضيحية للفصل — ليست تصويرًا تاريخيًا دقيقًا.
            </p>
          </div>
        </div>
      ) : null}

      {showDoor ? (
        <SectionEntry3D
          wing="seerah"
          active
          onEntered={handleEntered}
        >
          {children}
        </SectionEntry3D>
      ) : (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}

ChapterGateway.displayName = "ChapterGateway";
