import type { CSSProperties } from "react";
import styles from "./unique.module.css";

export function CompassRose({ deg }: { deg: number }) {
  return (
    <div className={styles.compass} aria-hidden>
      <span className={styles.needle} style={{ "--deg": `${deg}deg` } as CSSProperties} />
    </div>
  );
}
