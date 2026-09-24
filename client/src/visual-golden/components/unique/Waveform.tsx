import styles from "./unique.module.css";

export function Waveform({ playing }: { playing: boolean }) {
  return (
    <span className={`${styles.bars} ${playing ? styles.live : ""}`} aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <i key={i} style={{ animationDelay: `${(i % 6) * 90}ms`, height: playing ? undefined : `${20 + (i % 5) * 10}%` }} />
      ))}
    </span>
  );
}
