import type { ReactNode } from "react";
import styles from "./shared.module.css";

interface Props {
  title: string;
  subtitle?: string;
  desc?: string;
  image: string;
  children?: ReactNode;
  tall?: boolean;
  compact?: boolean;
  wing?: "library" | "quran" | "tafsir" | "seerah" | "hadith" | "daily" | "home";
}

export function PageHero({
  title,
  subtitle,
  desc,
  image,
  children,
  tall,
  compact,
  wing,
}: Props) {
  return (
    <section
      className={`${styles.hero} ${tall ? styles.heroTall : ""} ${compact ? styles.heroCompact : ""}`}
      data-wing={wing}
    >
      <img className={styles.heroImg} src={image} alt="" />
      <div className={styles.heroFrame} />
      <div className={`${styles.mash} ${styles.mashL}`} />
      <div className={`${styles.mash} ${styles.mashR}`} />
      <div className={styles.heroCopy}>
        <h1>{title}</h1>
        {subtitle ? <p className={styles.heroSub}>{subtitle}</p> : null}
        {desc ? <p className={styles.heroDesc}>{desc}</p> : null}
        {children}
      </div>
    </section>
  );
}
