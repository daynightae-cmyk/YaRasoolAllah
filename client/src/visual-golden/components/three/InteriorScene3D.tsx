/**
 * InteriorScene3D — shared React shell for every wing's genuine 3D interior.
 *
 * Owns one bounded ThreeRuntime per scene, captures the shared interior
 * engine handle, and renders the observer HUD: badge, reset/exit, DOM overlay
 * slot (governed text/records live here — never scene textures), station
 * note, RTL travel rail, always-visible Arabic artistic disclosure.
 *
 * Extracted from the live-verified Quran sanctuary shell (commit c52347e5);
 * Sanctuary3D is now a thin sanctuary-specific furnishing over this shell.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Compass, LogOut, RotateCcw } from "lucide-react";
import { ThreeRuntime } from "@/visual-golden/components/three/three-runtime";
import {
  buildInteriorRoom,
  type InteriorEngineHandle,
  type InteriorFurnisher,
} from "@/visual-golden/components/three/interior-engine";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import type { InteriorSceneConfig } from "@/visual-golden/services/interior-scenes";
import styles from "./InteriorScene3D.module.css";

export interface InteriorScene3DProps {
  scene: InteriorSceneConfig;
  /** Wing-specific real geometry added to the shared architectural shell. */
  furnish?: InteriorFurnisher;
  /** The caller's lamp preference drives real scene lighting. */
  lampOn: boolean;
  /** True while governed audio is actually playing (drives wing animations). */
  playing?: boolean;
  /** DOM card rendered over the scene — canonical text/records live here. */
  overlay?: ReactNode;
  /** Stable id for the section's data-visual attribute, e.g. "quran-sanctuary". */
  visualId: string;
  /** Arabic accessible label for the whole environment. */
  ariaLabelAr: string;
  /** Short Arabic badge text next to the compass icon. */
  badgeAr: string;
  /** Accessible label for the exit button. */
  exitLabelAr?: string;
  onExit: () => void;
  /** Called when WebGL cannot run; caller keeps its normal surface. */
  onUnavailable: () => void;
}

export function InteriorScene3D({
  scene: config,
  furnish,
  lampOn,
  playing = false,
  overlay,
  visualId,
  ariaLabelAr,
  badgeAr,
  exitLabelAr = "الخروج إلى الواجهة الكاملة",
  onExit,
  onUnavailable,
}: InteriorScene3DProps) {
  const effectiveMotion = useEffectiveMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ThreeRuntime | null>(null);
  const engineRef = useRef<InteriorEngineHandle | null>(null);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [traveling, setTraveling] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;
  const initialLampRef = useRef(lampOn);
  const furnishRef = useRef(furnish);
  furnishRef.current = furnish;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    setNodeIndex(0);
    setTraveling(false);
    const runtime = new ThreeRuntime({
      host,
      motion: effectiveMotion,
      adapter: {
        build: (context) => {
          const handle = buildInteriorRoom(context, config, initialLampRef.current, {
            onNodeArrive: (nodeId) => {
              if (disposed) return;
              const index = config.nodes.findIndex((node) => node.id === nodeId);
              if (index >= 0) setNodeIndex(index);
            },
            onTravelState: (isTraveling) => {
              if (!disposed) setTraveling(isTraveling);
            },
          }, furnishRef.current);
          engineRef.current = handle;
          return handle;
        },
      },
      onFallback: () => {
        if (disposed) return;
        setFailed(true);
        unavailableRef.current();
      },
    });
    runtimeRef.current = runtime;
    void runtime.start();
    return () => {
      disposed = true;
      engineRef.current = null;
      runtimeRef.current = null;
      runtime.stop();
    };
    // Motion, lamp and playback sync through the effects below; rebuilding on
    // those changes would tear down live geometry for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sceneId]);

  useEffect(() => {
    runtimeRef.current?.setMotion(effectiveMotion);
  }, [effectiveMotion]);

  useEffect(() => {
    initialLampRef.current = lampOn;
    engineRef.current?.setLamp(lampOn);
  }, [lampOn]);

  useEffect(() => {
    engineRef.current?.setPlaying(playing);
  }, [playing]);

  const goTo = useCallback(
    (index: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const clamped = Math.min(Math.max(0, index), config.nodes.length - 1);
      setNodeIndex(clamped);
      engine.goToNode(clamped);
    },
    [config.nodes.length],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    // The DOM overlay owns its own keys (buttons, inputs); only the scene
    // surface handles travel keys.
    if (event.target instanceof HTMLElement && event.target.closest("[data-interior-overlay]")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(nodeIndex + 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(nodeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(config.nodes.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onExit();
    }
  };

  const node = config.nodes[nodeIndex];

  if (failed) return null;

  return (
    <section
      className={styles.sanctuary}
      data-visual={visualId}
      data-scene={config.sceneId}
      data-node={node.id}
      data-lamp={lampOn ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      aria-label={ariaLabelAr}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div ref={hostRef} className={styles.canvasHost} data-visual={`${visualId}-canvas`} />

      <div className={styles.hud}>
        <div className={styles.hudTop}>
          <span className={styles.badge}>
            <Compass size={13} aria-hidden /> {badgeAr}
          </span>
          <div className={styles.hudActions}>
            <button
              type="button"
              className={styles.hudButton}
              onClick={() => engineRef.current?.resetView()}
              aria-label="إعادة ضبط النظر"
            >
              <RotateCcw size={14} aria-hidden />
            </button>
            <button type="button" className={styles.hudButton} onClick={onExit} aria-label={exitLabelAr}>
              <LogOut size={14} aria-hidden /> خروج
            </button>
          </div>
        </div>

        {overlay ? (
          <div className={styles.overlaySlot} data-interior-overlay>
            {overlay}
          </div>
        ) : null}

        <div className={styles.stationNote} aria-live="polite">
          <strong>{node.labelAr}</strong>
          <p>{node.noteAr}</p>
        </div>

        <div className={styles.travelRow}>
          <button
            type="button"
            className={styles.travelButton}
            onClick={() => goTo(nodeIndex - 1)}
            disabled={nodeIndex === 0 || traveling}
            aria-label="المحطة السابقة"
          >
            <ChevronRight size={16} aria-hidden /> السابقة
          </button>
          <div className={styles.nodeRail} role="tablist" aria-label="محطات البيئة">
            {config.nodes.map((candidate, index) => (
              <button
                key={candidate.id}
                type="button"
                role="tab"
                aria-selected={index === nodeIndex}
                className={`${styles.nodeChip} ${index === nodeIndex ? styles.nodeChipOn : ""}`}
                onClick={() => goTo(index)}
                disabled={traveling}
              >
                {candidate.labelAr}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.travelButton}
            onClick={() => goTo(nodeIndex + 1)}
            disabled={nodeIndex === config.nodes.length - 1 || traveling}
            aria-label="المحطة التالية"
          >
            التالية <ChevronLeft size={16} aria-hidden />
          </button>
        </div>

        <p className={styles.disclosure}>{config.disclosureAr}</p>
        <p className={styles.hint}>اسحب للنظر حولك · الأسهم للتنقل · انقر الحلقة النحاسية للانتقال · Esc للخروج</p>
      </div>
    </section>
  );
}

InteriorScene3D.displayName = "InteriorScene3D";
