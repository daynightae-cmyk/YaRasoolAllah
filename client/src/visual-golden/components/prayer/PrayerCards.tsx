import type { NextPrayerState, PrayerName, PrayerTimings } from "@/visual-golden/services/prayer/types";
import { PRAYER_LABELS } from "@/visual-golden/services/prayer/types";
import { prayerStatus, stripTime } from "@/visual-golden/services/prayer/time";
import styles from "./prayer.module.css";

const ORDER: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface Props {
  timings: PrayerTimings;
  next: NextPrayerState | null;
  timezone: string;
  lang: "ar" | "en";
  onFocus?: (name: PrayerName) => void;
}

export function PrayerCards({ timings, next, timezone, lang, onFocus }: Props) {
  return (
    <div className={styles.prayerRow}>
      {ORDER.map((name) => {
        const st = prayerStatus(name, timings, next, timezone);
        return (
          <button
            key={name}
            type="button"
            className={`${styles.prayerCard} ${st === "next" ? styles.prayerNext : ""} ${st === "past" ? styles.prayerPast : ""}`}
            onClick={() => onFocus?.(name)}
            aria-current={st === "next" ? "true" : undefined}
          >
            <span>{lang === "ar" ? PRAYER_LABELS[name].ar : PRAYER_LABELS[name].en}</span>
            <b>{stripTime(timings[name])}</b>
            <small className="muted">
              {st === "next" ? (lang === "ar" ? "التالي" : "Next") : st === "past" ? (lang === "ar" ? "فاتت" : "Past") : lang === "ar" ? "قادمة" : "Upcoming"}
            </small>
          </button>
        );
      })}
    </div>
  );
}
