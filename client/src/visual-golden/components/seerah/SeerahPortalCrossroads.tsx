/**
 * SeerahPortalCrossroads — REF-23 living Seerah portal crossroads.
 *
 * The arches are real destinations: page portals (atlas, timeline, Qur'an,
 * hadith) stay route links, while the world portals (center living world,
 * ghazawat, madinah, hijrah) are Play-to-Enter gates — pressing one expands
 * the portal plate over the viewport, mounts the matching LivingSeerahWorld
 * scene in place, and flies the camera from the portal framing into the
 * world's authored entry pose before handing over interactive control.
 * Exiting returns to this crossroads with a short fade (no route change).
 *
 * Reduced motion skips the expansion/flight (direct mount at the entry
 * pose); a WebGL failure falls back to the full world page route, so the
 * destination stays reachable without 3D.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import * as THREE from "three";
import { art } from "@/visual-golden/mock/art";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { LivingSeerahWorld } from "./world/LivingSeerahWorld";
import { DEFAULT_WORLD_SCENE, getWorldScene } from "./world/WorldSceneRegistry";
import { markSceneVisited } from "./world/WorldTravel";
import styles from "./SeerahPortalCrossroads.module.css";
import entryStyles from "./SeerahWorldEntry.module.css";

interface PortalDef {
  id: string;
  ar: string;
  en: string;
  image: string;
  /** Route-link portal (2D wing destination). */
  href?: string;
  /** Play-to-Enter portal: mounts this living-world scene in place. */
  sceneId?: string;
}

const portals: PortalDef[] = [
  { id: "atlas", ar: "الأطلس", en: "Atlas", href: "/atlas", image: art.atlas },
  { id: "timeline", ar: "الخط الزمني", en: "Timeline", href: "/seerah/database", image: art.lantern },
  { id: "ghazawat", ar: "الغزوات", en: "Ghazawat", sceneId: "badr-valley", image: "/visual-golden/art/badr-portal.webp" },
  { id: "quran", ar: "القرآن الكريم", en: "Qur’an", href: "/quran", image: art.mushafOpen },
  { id: "hadith", ar: "الحديث الشريف", en: "Hadith", href: "/hadith", image: art.shelves },
  { id: "madinah", ar: "المدينة المنورة", en: "Madinah", sceneId: "madinah-walk", image: "/visual-golden/art/madinah-walk-portal.webp" },
  { id: "hijrah", ar: "الهجرة", en: "Hijrah", sceneId: "hijrah-road", image: "/visual-golden/art/hijrah-night-portal.webp" },
];

const CENTER_PORTAL = {
  id: "world",
  ar: "ادخل العالم الحي",
  en: "Enter the Seerah",
  image: "/visual-golden/art/worlds/home.webp",
  sceneId: DEFAULT_WORLD_SCENE.id,
};

interface EntryState {
  sceneId: string;
  image: string;
  rect: { top: number; left: number; width: number; height: number };
}

type Phase = "idle" | "entering" | "active" | "exiting";
type VeilPhase = "rect" | "expand" | "out" | "gone";

export function SeerahPortalCrossroads({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const reducedMotion = useEffectiveMotion() === "reduced";
  const [entry, setEntry] = useState<EntryState | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [veilPhase, setVeilPhase] = useState<VeilPhase>("rect");
  const openerRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const scene = entry ? getWorldScene(entry.sceneId) ?? DEFAULT_WORLD_SCENE : null;

  // Camera flight: start behind the authored entry pose (opposite of the
  // view direction), clamped inside the scene bounds, then fly to it.
  const entryFlight = useMemo(() => {
    if (!scene) return undefined;
    const target = scene.entryPosition;
    const yaw = scene.entryYaw;
    const half = Math.max(scene.bounds.width, scene.bounds.depth) / 2;
    const clamp = (v: number) => Math.max(-half + 4, Math.min(half - 4, v));
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const from = new THREE.Vector3(
      clamp(target.x - fx * 30),
      target.y + 4.5,
      clamp(target.z - fz * 30),
    );
    return { from, duration: 2.8 };
  }, [scene]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }, []);

  const startEntry = useCallback((def: PortalDef, el: HTMLElement) => {
    if (!def.sceneId) return;
    const rect = el.getBoundingClientRect();
    openerRef.current = el;
    setVeilPhase("rect");
    setEntry({
      sceneId: def.sceneId,
      image: def.image,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });
    setPhase("entering");
  }, []);

  // Expand the portal plate after mount (two rAFs so the initial rect paints).
  useEffect(() => {
    if (!entry || reducedMotion) return;
    const raf = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setVeilPhase("expand"));
      timersRef.current.push(raf2 as unknown as number);
    });
    return () => cancelAnimationFrame(raf);
  }, [entry, reducedMotion]);

  const handleReady = useCallback(() => {
    setPhase("active");
    if (reducedMotion) {
      setVeilPhase("gone");
      return;
    }
    // Hold the expanded plate briefly, then fade it to reveal the flight.
    timersRef.current.push(window.setTimeout(() => setVeilPhase("out"), 1500));
    timersRef.current.push(window.setTimeout(() => setVeilPhase("gone"), 2500));
  }, [reducedMotion]);

  const handleExit = useCallback(() => {
    setPhase("exiting");
    timersRef.current.push(window.setTimeout(() => {
      clearTimers();
      setEntry(null);
      setPhase("idle");
      setVeilPhase("rect");
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    }, reducedMotion ? 60 : 420));
  }, [clearTimers, reducedMotion]);

  const handleUnavailable = useCallback(() => {
    // Non-3D fallback: the full world page route stays reachable.
    if (entry) navigate(`/seerah/world?scene=${encodeURIComponent(entry.sceneId)}`);
    clearTimers();
    setEntry(null);
    setPhase("idle");
    setVeilPhase("rect");
  }, [entry, navigate, clearTimers]);

  // Lock page scroll while the living world owns the viewport.
  useEffect(() => {
    if (!entry) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [entry]);

  useEffect(() => clearTimers, [clearTimers]);

  const portalFace = (p: PortalDef) => (
    <>
      <img src={p.image} alt="" />
      <span>{p.ar}</span>
      <small lang="en">{p.en}</small>
    </>
  );

  return (
    <section className={styles.crossroads} data-visual="seerah-crossroads" aria-labelledby="seerah-crossroads-title">
      <Link href="/" className={styles.crossroadsHome} data-visual="seerah-home-link">الرئيسية</Link>
      <div className={styles.arcade}>
        <header className={styles.title}>
          {children}
          <p lang="en">The Living Seerah</p>
        </header>
        <button
          type="button"
          className={`${styles.portal} ${styles.center}`}
          data-visual="seerah-portal-world"
          onClick={(e) => startEntry(CENTER_PORTAL, e.currentTarget)}
        >
          {portalFace(CENTER_PORTAL)}
        </button>
        {portals.map((p) =>
          p.sceneId ? (
            <button
              key={p.id}
              type="button"
              className={styles.portal}
              data-visual={`seerah-portal-${p.id}`}
              onClick={(e) => startEntry(p, e.currentTarget)}
            >
              {portalFace(p)}
            </button>
          ) : (
            <Link key={p.id} href={p.href ?? "/seerah"} className={styles.portal} data-visual={`seerah-portal-${p.id}`}>
              {portalFace(p)}
            </Link>
          ),
        )}
      </div>

      {entry && scene && createPortal(
        <div
          className={entryStyles.layer}
          data-visual="seerah-world-entry-layer"
          data-scene={scene.id}
          data-phase={phase}
        >
          {veilPhase !== "gone" && !reducedMotion && (
            <div
              className={[
                entryStyles.veil,
                veilPhase === "expand" ? entryStyles.veilExpand : "",
                veilPhase === "out" ? entryStyles.veilOut : "",
              ].join(" ")}
              style={
                {
                  "--vt": `${entry.rect.top}px`,
                  "--vl": `${entry.rect.left}px`,
                  "--vw": `${entry.rect.width}px`,
                  "--vh": `${entry.rect.height}px`,
                } as CSSProperties
              }
              data-visual="seerah-portal-veil"
              aria-hidden="true"
            >
              <img src={entry.image} alt="" />
            </div>
          )}
          {phase === "exiting" && (
            <div className={entryStyles.exitVeil} data-visual="seerah-exit-veil" aria-hidden="true" />
          )}
          <LivingSeerahWorld
            key={scene.id}
            sceneId={scene.id}
            immersive
            entryFlight={reducedMotion ? undefined : entryFlight}
            onReady={handleReady}
            onEntryFlightComplete={() => setPhase("active")}
            onSceneVisited={markSceneVisited}
            onExit={handleExit}
            onUnavailable={handleUnavailable}
            onNavigate={navigate}
          />
        </div>,
        document.body,
      )}
    </section>
  );
}

SeerahPortalCrossroads.displayName = "SeerahPortalCrossroads";
