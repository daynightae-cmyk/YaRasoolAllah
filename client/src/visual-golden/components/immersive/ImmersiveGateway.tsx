import { useCallback, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, DoorOpen, Sparkles } from "lucide-react";
import styles from "./ImmersiveGateway.module.css";

type Props = {
  title: string;
  subtitle: string;
  description: string;
  enterLabel?: string;
  eyebrow?: string;
  Icon?: LucideIcon;
  children: ReactNode;
  autoEnter?: boolean;
};

function openingChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(196, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(392, context.currentTime + 0.42);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.7);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.72);
    window.setTimeout(() => void context.close(), 900);
  } catch {
    // Sound is an enhancement; the visual door must always remain usable.
  }
}

export function ImmersiveGateway({
  title,
  subtitle,
  description,
  enterLabel = "افتح الباب وادخل",
  eyebrow = "مدخل النور",
  Icon = DoorOpen,
  children,
  autoEnter = false,
}: Props) {
  const [entered, setEntered] = useState(autoEnter);
  const [opening, setOpening] = useState(false);
  const enter = useCallback(() => {
    if (opening || entered) return;
    openingChime();
    setOpening(true);
    window.setTimeout(() => setEntered(true), 920);
  }, [entered, opening]);

  if (entered) return <>{children}</>;

  return (
    <section className={`${styles.gateway} ${opening ? styles.opening : ""}`} aria-labelledby="immersive-gateway-title">
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.arch} aria-hidden="true"><span /><span /></div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}><Sparkles size={15} /> {eyebrow}</span>
        <div className={styles.icon}><Icon size={28} /></div>
        <h1 id="immersive-gateway-title">{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <p className={styles.description}>{description}</p>
        <button type="button" className={styles.enter} onClick={enter} disabled={opening}>
          <span>{opening ? "جاري فتح الباب…" : enterLabel}</span>
          {opening ? <span className={styles.loading} aria-hidden="true" /> : <ArrowLeft size={17} />}
        </button>
        <small className={styles.hint}>اضغط مرة واحدة، ثم اقترب من الرف أو القسم الذي تريد دخوله.</small>
      </div>
      <div className={`${styles.doorFrame} ${opening ? styles.isOpening : ""}`} aria-hidden="true">
        <div className={styles.doorGlow} />
        <div className={styles.doorLeft}><span className={styles.panelTop} /><span className={styles.panelBottom} /><i /></div>
        <div className={styles.doorRight}><span className={styles.panelTop} /><span className={styles.panelBottom} /><i /></div>
        <div className={styles.threshold} />
      </div>
    </section>
  );
}
