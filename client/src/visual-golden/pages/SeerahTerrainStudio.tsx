/**
 * SeerahTerrainStudio - full-screen immersive page for one Ghazwah terrain.
 *
 * Route: /seerah/terrain?event=<ghazwah id>
 *
 * Why a page instead of an inline box: the observer environment lived inside the
 * reading column, which is only ~479px wide on desktop. A heightfield and a
 * drag-to-look camera are meaningless at postcard size, which is exactly why the
 * simulation read as "corrupted". Here the same genuine Three.js scene - same
 * config, same beacons, same node travel - gets the whole viewport.
 *
 * Honesty: artistic reconstruction, no people, no combat, no gameplay design.
 * Scripture and governed records never enter scene textures; the DOM keeps every
 * label, note and disclosure.
 */

import { Suspense, lazy, useEffect, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight, Compass, Map, ScrollText } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { getTerrainScene, listBattleTerrainScenes } from "@/visual-golden/services/seerah-terrain";
import { getGhazawatScene } from "@/visual-golden/services/seerah-ghazawat";
import styles from "./SeerahTerrainStudio.module.css";

const TerrainTheatre3D = lazy(() =>
  import("@/visual-golden/components/seerah/TerrainTheatre3D").then((module) => ({
    default: module.TerrainTheatre3D,
  })),
);

export function SeerahTerrainStudio() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);

  const requested = useMemo(() => new URLSearchParams(search).get("event") ?? "", [search]);
  const battles = useMemo(() => listBattleTerrainScenes(), []);
  const scene = useMemo(() => {
    const known = getTerrainScene(requested);
    if (known) return known;
   return battles[0] ?? null;
  }, [requested, battles]);
  const story = scene ? getGhazawatScene(scene.eventId) : null;

  const backToReading = () => {
    if (!scene) return;
    navigate(
      `/seerah?chapter=battles-conquests&event=${encodeURIComponent(scene.eventId)}`,
    );
  };

  useEffect(() => {
    if (!scene) return;
    recordReadingProgress({
      id: "seerah",
      surface: "seerah",
      path: `/seerah/terrain?event=${encodeURIComponent(scene.eventId)}`,
      titleAr: "السيرة النبوية",
      titleEn: "Prophetic Biography",
      locationAr: `استوديو التضاريس: ${story ? story.titleAr : scene.eventId}`,
      locationEn: `Terrain studio: ${scene.eventId}`,
      completed: 0,
      total: scene.nodes.length,
      unitAr: "محطة",
      unitEn: "station",
    });
  }, [recordReadingProgress, scene, story]);

  if (!scene) {
    return (
      <main className={styles.studio} data-visual="seerah-terrain-studio">
        <div className={styles.empty}>
          <Compass size={22} aria-hidden />
          <p>لا توجد بيئة تضاريس مسجلة لهذا الحدث بعد.</p>
          <Link href="/seerah?chapter=battles-conquests" className={styles.emptyLink}>
            العودة إلى درب السيرة
          </Link>
        </div>
      </main>
    );
  }

  const stationCount = Math.max(scene.nodes.length, 1);
  const eventId = scene.eventId;

  return (
    <main
      className={styles.studio}
      data-visual="seerah-terrain-studio"
      data-terrain-event={eventId}
    >
      <div className={styles.stage}>
        <Suspense
          fallback={
            <div className={styles.loading} data-visual="seerah-terrain-loading">
              <Compass size={20} aria-hidden />
              <span>يُبنى أرضية المراقبة…</span>
            </div>
          }
        >
          <TerrainTheatre3D
            key={eventId}
            scene={scene}
            immersive
            onExit={backToReading}
            onUnavailable={backToReading}
          />
        </Suspense>

        <header className={styles.caption}>
          <div className={styles.captionText}>
            <span className={styles.captionKicker}>السيرة النبوية · بيئة المكان</span>
            <h1>{story ? story.titleAr : eventId}</h1>
            <p>{story ? story.eraAr : "محطة موثقة في السجل"}</p>
          </div>
          <dl className={styles.captionStats}>
            <div>
              <dt>محطات المراقبة</dt>
              <dd>{stationCount}</dd>
            </div>
            <div>
              <dt>القراءة</dt>
              <dd>تفسيرية</dd>
            </div>
            <div>
              <dt>الشخصيات</dt>
              <dd>بلا تجسيد</dd>
            </div>
          </dl>
        </header>

        <nav className={styles.dock} aria-label="بيئات الغزوات">
          <Link
            href={`/seerah?chapter=battles-conquests&event=${encodeURIComponent(eventId)}`}
            className={styles.dockLink}
          >
            <ScrollText size={13} aria-hidden /> سجل المحطة
          </Link>
          <Link href="/seerah" className={styles.dockLink}>
            <ArrowRight size={13} aria-hidden /> درب السيرة
          </Link>
          <Link
            href={`/atlas${story?.atlasCampaignId ? `?place=${encodeURIComponent(story.atlasCampaignId)}` : ""}`}
            className={styles.dockLink}
          >
            <Map size={13} aria-hidden /> الأطلس
          </Link>
        </nav>

        <Link href="/seerah" className={styles.exitBar} data-visual="seerah-terrain-exit-bar">
          <ArrowRight size={13} aria-hidden /> العودة إلى القراءة
        </Link>
      </div>
    </main>
  );
}

SeerahTerrainStudio.displayName = "SeerahTerrainStudio";
