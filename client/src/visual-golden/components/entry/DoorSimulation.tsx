import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./door.module.css";

interface DoorSimulationProps {
  /** Label shown above the door — site/wing name (Arabic) */
  siteNameAr: string;
  /** Label shown above the door — site/wing name (English) */
  siteNameEn?: string;
  /** Whether the door entry experience is active */
  active: boolean;
  /** Called when the door finishes opening and the user has "entered" */
  onEntered: () => void;
  /** Called when the user cancels/backs out */
  onCancel?: () => void;
  /** Text on the door open button (Arabic) */
  openLabelAr?: string;
  /** Text on the door open button (English) */
  openLabelEn?: string;
}

/**
 * Door Simulation entry experience.
 *
 * Flow:
 * 1. Light appears first (نور दिखाई أولاً) with site name
 * 2. Door appears closed with a glowing knob and "Open Door" button
 * 3. User clicks → door swings open → light floods in → onEntered() called
 *
 * This is the CSS Phase 1 implementation. Once Three.js is available,
 * this can be upgraded to a true 3D door in a 3D library/studio space.
 */
export function DoorSimulation({
  siteNameAr,
  siteNameEn,
  active,
  onEntered,
  onCancel,
  openLabelAr = "افتح الباب",
  openLabelEn = "Open the Door",
}: DoorSimulationProps) {
  const [phase, setPhase] = useState<"light" | "door" | "opening" | "entered">(
    active ? "light" : "entered",
  );
  const doorRef = useRef<HTMLDivElement>(null);

  // Start the sequence when activated
  useEffect(() => {
    if (!active) return;
    setPhase("light");
    // After light shows, reveal door
    const t = setTimeout(() => setPhase("door"), 900);
    return () => clearTimeout(t);
  }, [active]);

  const handleOpen = useCallback(() => {
    setPhase("opening");
    const door = doorRef.current;
    if (door) {
      door.classList.remove("closed");
      door.classList.add("opening");
    }
    // After door opens, call entered
    const t = setTimeout(() => {
      setPhase("entered");
      onEntered();
    }, 1100);
    return () => clearTimeout(t);
  }, [onEntered]);

  if (!active && phase === "entered") return null;

  const isOpenBtnVisible = phase === "door";

  return (
    <div
      className={`${styles.entryOverlay} ${phase === "entered" || phase === "opening" ? styles.exiting : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={siteNameAr}
    >
      {/* Light appears first */}
      {phase === "light" || phase === "door" || phase === "opening" ? (
        <div className={styles.entryLight} aria-hidden="true" />
      ) : null}

      {/* Site name (هيبة الموقع) */}
      {phase === "light" || phase === "door" || phase === "opening" ? (
        <div className={styles.entrySiteName}>
          <span className={styles.entrySiteNameAr}>{siteNameAr}</span>
          {siteNameEn && (
            <span className={styles.entrySiteNameEn}>{siteNameEn}</span>
          )}
        </div>
      ) : null}

      {/* Door */}
      {isOpenBtnVisible ? (
        <div className={styles.entryDoorWrap}>
          <div
            ref={doorRef}
            className={`${styles.entryDoor} ${styles.closed}`}
            aria-label="الباب"
          >
            <div className={styles.entryDoorFrame} aria-hidden="true" />
            <div className={styles.entryDoorGoldStripe} aria-hidden="true" />
            <div className={styles.entryDoorKnob} aria-hidden="true" />
            <div className={styles.entryDoorGlow} aria-hidden="true" />
            <div className={styles.entryDoorInner} aria-hidden="true" />
            <div className={styles.entryDoorText}>
              {typeof document !== "undefined" &&
              document.documentElement.dir === "rtl"
                ? "الباب مقفل — اضغط لفتحه"
                : "Door closed — click to open"}
            </div>
          </div>
          <button
            type="button"
            className={styles.entryOpenBtn}
            onClick={handleOpen}
            aria-label={openLabelAr}
          >
            {typeof document !== "undefined" &&
            document.documentElement.dir === "rtl"
              ? openLabelAr
              : openLabelEn}
          </button>
          {onCancel && (
            <button
              type="button"
              className={`${styles.entryOpenBtn} cancelBtn`}
              onClick={onCancel}
              aria-label="إلغاء"
              style={{
                marginTop: "0.7rem",
                borderColor: "rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              إلغاء / Cancel
            </button>
          )}
        </div>
      ) : null}

      {/* Brief entered overlay */}
      {phase === "entered" ? (
        <div className={styles.entryEntered} aria-hidden="true" />
      ) : null}
    </div>
  );
}

DoorSimulation.displayName = "DoorSimulation";