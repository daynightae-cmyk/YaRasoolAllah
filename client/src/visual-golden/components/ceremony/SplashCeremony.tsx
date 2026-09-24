import { useEffect, useRef, useState } from "react";
import styles from "./splash.module.css";

interface Props {
  onDone: () => void;
}

export function SplashCeremony({ onDone }: Props) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [canSkip, setCanSkip] = useState(false);
  const finishTimer = useRef<number | null>(null);
  const phaseClass = {
    enter: styles.phaseEntering,
    hold: styles.phaseHolding,
    exit: styles.phaseLeaving,
  }[phase];

  const leave = () => {
    setPhase("exit");
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = window.setTimeout(onDone, 350);
      return () => window.clearTimeout(t);
    }
    const skip = window.setTimeout(() => setCanSkip(true), 1300);
    const hold = window.setTimeout(() => setPhase((current) => current === "exit" ? current : "hold"), 1800);
    const exit = window.setTimeout(() => setPhase("exit"), 4700);
    return () => {
      window.clearTimeout(skip);
      window.clearTimeout(hold);
      window.clearTimeout(exit);
    };
  }, [onDone]);

  useEffect(() => {
    if (phase !== "exit") return;
    finishTimer.current = window.setTimeout(onDone, 1350);
    return () => {
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    };
  }, [phase, onDone]);

  return (
    <div
      className={`${styles.splash} ${phaseClass}`}
      role="dialog"
      aria-label="يا رسول الله"
      data-ceremony="splash"
    >
      <div className={styles.void} aria-hidden="true" />
      <div className={styles.arch} aria-hidden="true" />
      <div className={styles.silhouette} aria-hidden="true" />
      <div className={styles.lanterns} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <svg className={styles.ribbons} viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.ribbonA} d="M-80 430 C 180 210, 420 620, 780 390 S 1240 180, 1680 420" />
        <path className={styles.ribbonB} d="M-40 510 C 260 700, 520 280, 860 500 S 1280 720, 1700 480" />
        <path className={styles.ribbonC} d="M-120 360 C 300 90, 640 540, 980 330 S 1360 90, 1720 340" />
      </svg>
      <div className={styles.floor} aria-hidden="true" />

      <div className={styles.stage}>
        <p className={styles.kicker}>بوابة النور</p>
        <h1 className={styles.invocation}>يا رسول الله</h1>
        <p className={styles.peace}>صلى الله عليه وسلم</p>
        <div className={styles.rule} />
        <p className={styles.en}>YA RASOOL ALLAH · GATEWAY OF LIGHT</p>
      </div>

      {canSkip && phase !== "exit" ? (
        <button type="button" className={styles.enterButton} onClick={leave}>
          ادخل
        </button>
      ) : null}
    </div>
  );
}
