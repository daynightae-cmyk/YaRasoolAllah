/**
 * SeerahWorldPage — Full-page entry point for the Living Seerah World.
 *
 * Route: /seerah/world?scene=<scene-id>
 *
 * This page hosts the LivingSeerahWorld component in immersive mode.
 * It handles scene selection, loading states, and exit navigation.
 */

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight, Compass, RotateCcw, LogOut } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { LivingSeerahWorld } from "@/visual-golden/components/seerah/world/LivingSeerahWorld";
import { getWorldScene, listWorldSceneIds, DEFAULT_WORLD_SCENE } from "@/visual-golden/components/seerah/world/WorldSceneRegistry";
import styles from "./SeerahWorldPage.module.css";

export function SeerahWorldPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);

  const requestedSceneId = useMemo(
    () => new URLSearchParams(search).get("scene") ?? DEFAULT_WORLD_SCENE.id,
    [search],
  );

  const scene = useMemo(() => getWorldScene(requestedSceneId) ?? DEFAULT_WORLD_SCENE, [requestedSceneId]);
  const allSceneIds = useMemo(() => listWorldSceneIds(), []);

  const backToReading = useCallback(() => {
    if (scene.canonicalRef?.chapterId) {
      const params = new URLSearchParams();
      params.set("chapter", scene.canonicalRef.chapterId);
      if (scene.canonicalRef.eventId) params.set("event", scene.canonicalRef.eventId);
      navigate(`/seerah?${params.toString()}`);
    } else {
      navigate("/seerah");
    }
  }, [navigate, scene]);

  const handleUnavailable = useCallback(() => {
    backToReading();
  }, [backToReading]);

  // Track reading progress
  useEffect(() => {
    recordReadingProgress({
      id: "seerah",
      surface: "seerah",
      path: `/seerah/world?scene=${encodeURIComponent(scene.id)}`,
      titleAr: "السيرة النبوية",
      titleEn: "Prophetic Biography",
      locationAr: `العالم الحي: ${scene.nameAr}`,
      locationEn: `Living World: ${scene.id}`,
      completed: 0,
      total: scene.interactions.length + scene.exits.length,
      unitAr: "نقطة تفاعل",
      unitEn: "interaction points",
    });
  }, [recordReadingProgress, scene]);

  const switchScene = (sceneId: string) => {
    const params = new URLSearchParams(search);
    params.set("scene", sceneId);
    navigate(`/seerah/world?${params.toString()}`, { replace: true });
  };

  // The world's canvas + HUD are a fixed viewport layer; the page chrome
  // (dock, exit) must share that layer so it stacks ABOVE the world instead
  // of being buried under it. Portaled to <body> — no ancestor transform can
  // trap the fixed children, and the shell stays mounted underneath.
  const stageLayer = (
    <div className={styles.worldLayer} data-visual="seerah-world-layer">
      <Suspense
        fallback={
          <div className={styles.loading} data-visual="seerah-world-loading" role="status">
            <Compass size={24} aria-hidden />
            <span>يُبنى العالم الحي…</span>
          </div>
        }
      >
        <LivingSeerahWorld
          key={scene.id}
          sceneId={scene.id}
          immersive
          onExit={backToReading}
          onUnavailable={handleUnavailable}
          onNavigate={navigate}
        />
      </Suspense>

      {/* Scene selector dock */}
      <nav className={styles.dock} aria-label="بيئات العالم الحي">
        <div className={styles.dockScenes}>
          {allSceneIds.map((sceneId) => {
            const s = getWorldScene(sceneId);
            if (!s) return null;
            const isActive = sceneId === scene.id;
            return (
              <button
                key={sceneId}
                type="button"
                className={`${styles.dockScene} ${isActive ? styles.dockSceneActive : ""}`}
                onClick={() => switchScene(sceneId)}
                aria-current={isActive ? "true" : undefined}
                aria-label={isActive ? `${s.nameAr} (الحالي)` : s.nameAr}
                title={s.nameAr}
              >
                <span className={styles.dockSceneLabel}>{s.nameAr}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.dockLinks}>
          <Link
            href={scene.canonicalRef?.chapterId
              ? `/seerah?chapter=${encodeURIComponent(scene.canonicalRef.chapterId)}${scene.canonicalRef.eventId ? `&event=${encodeURIComponent(scene.canonicalRef.eventId)}` : ""}`
              : "/seerah"
            }
            className={styles.dockLink}
          >
            <RotateCcw size={13} aria-hidden /> سجل الحدث
          </Link>
          <Link href="/seerah" className={styles.dockLink}>
            <ArrowRight size={13} aria-hidden /> درب السيرة
          </Link>
          <Link href="/atlas" className={styles.dockLink}>
            <Compass size={13} aria-hidden /> الأطلس
          </Link>
        </div>
      </nav>

      <Link href="/seerah" className={styles.exitBar} data-visual="seerah-world-exit-bar">
        <LogOut size={13} aria-hidden /> الخروج إلى القراءة
      </Link>
    </div>
  );

  return (
    <main
      className={styles.page}
      data-visual="seerah-world-page"
      data-scene={scene.id}
      dir="rtl"
      lang="ar"
    >
      {/* In-flow placeholder keeps the route's layout height while the
          fixed world layer owns the viewport. */}
      <div className={styles.stage} aria-hidden="true" />
      {createPortal(stageLayer, document.body)}
    </main>
  );
}

SeerahWorldPage.displayName = "SeerahWorldPage";