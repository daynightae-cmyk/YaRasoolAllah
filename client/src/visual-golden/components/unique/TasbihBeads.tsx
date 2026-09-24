import styles from "./unique.module.css";

interface Props {
  count: number;
  onCount: (n: number) => void;
  max?: number;
}

export function TasbihBeads({ count, onCount, max = 33 }: Props) {
  const lit = Math.min(count, max);
  return (
    <div className={styles.string} role="group" aria-label="حبّات المسبحة">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`${styles.pearl} ${i < lit ? styles.lit : ""}`}
          aria-label={`حبّة ${i + 1}`}
          onClick={() => onCount(i + 1)}
        />
      ))}
    </div>
  );
}
