import { Bell } from "lucide-react";
import type { NextPrayerState } from "@/visual-golden/services/prayer/types";
import { formatRemain } from "@/visual-golden/services/prayer/time";
import { t, type Lang } from "@/visual-golden/lib/i18n";
import styles from "./prayer.module.css";

interface Props {
  next: NextPrayerState;
  lang: Lang;
  onRemind: () => void;
}

export function NextPrayer({ next, lang, onRemind }: Props) {
  return (
    <div className={`${styles.panel} ${styles.nextCard}`}>
      <span>{t(lang, "nextPrayer")}</span>
      <em>
        {lang === "ar" ? next.labelAr : next.labelEn}
        {next.isTomorrow ? (lang === "ar" ? " (غدًا)" : " (tomorrow)") : ""} · {next.at}
      </em>
      <b aria-live="polite">{formatRemain(next.remainingSeconds)}</b>
      <button type="button" className={styles.ghost} onClick={onRemind}>
        <Bell size={14} /> {t(lang, "remind")}
      </button>
    </div>
  );
}
