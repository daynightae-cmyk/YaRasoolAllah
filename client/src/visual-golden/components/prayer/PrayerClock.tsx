import type { NextPrayerState, PrayerName, PrayerTimings } from "@/visual-golden/services/prayer/types";
import { minutesFromHHMM, nowMinutesInZone } from "@/visual-golden/services/prayer/time";
import { PRAYER_LABELS } from "@/visual-golden/services/prayer/types";
import styles from "./prayer.module.css";

function polar(cx: number, cy: number, r: number, minutes: number) {
  const a = ((minutes / 1440) * 360 - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, fromMin: number, toMin: number) {
  const start = polar(cx, cy, r, fromMin);
  let span = toMin - fromMin;
  if (span < 0) span += 1440;
  const end = polar(cx, cy, r, fromMin + span);
  const large = span > 720 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

const MARKERS: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface Props {
  timings: PrayerTimings;
  timezone: string;
  next: NextPrayerState;
  city: string;
  nowLabel: string;
}

export function PrayerClock({ timings, timezone, next, city, nowLabel }: Props) {
  const cx = 200;
  const cy = 200;
  const now = nowMinutesInZone(timezone);
  const sunrise = minutesFromHHMM(timings.Sunrise);
  const sunset = minutesFromHHMM(timings.Sunset || timings.Maghrib);
  const needle = polar(cx, cy, 132, now);

  return (
    <svg viewBox="0 0 400 400" className={styles.clockSvg} role="img" aria-label={`ساعة مواقيت على مدى 24 ساعة، الوقت الحالي ${nowLabel}`}>
      <defs>
        <radialGradient id="obsGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(232,197,71,0.22)" />
          <stop offset="55%" stopColor="rgba(6,78,59,0.15)" />
          <stop offset="100%" stopColor="rgba(2,10,12,0)" />
        </radialGradient>
        <linearGradient id="dayBand" x1="0" x2="1">
          <stop offset="0%" stopColor="#f0d78c" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r="188" fill="url(#obsGlow)" stroke="rgba(212,160,23,0.55)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="168" fill="none" stroke="rgba(16,185,129,0.18)" strokeWidth="14" />
      <path d={arcPath(cx, cy, 168, sunset, sunrise + (sunrise < sunset ? 1440 : 0))} fill="none" stroke="rgba(15,30,70,0.85)" strokeWidth="14" strokeLinecap="round" />
      <path d={arcPath(cx, cy, 168, sunrise, sunset)} fill="none" stroke="url(#dayBand)" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
      {Array.from({ length: 24 }, (_, h) => {
        const p1 = polar(cx, cy, 178, h * 60);
        const p2 = polar(cx, cy, h % 3 === 0 ? 164 : 171, h * 60);
        return <line key={h} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={h % 3 === 0 ? "#e8c547" : "rgba(232,197,71,0.35)"} strokeWidth={h % 3 === 0 ? 2 : 1} />;
      })}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
        const p = polar(cx, cy, 150, h * 60);
        return (
          <text key={h} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#f5e6b8" fontSize="11" fontFamily="Inter, sans-serif">
            {String(h).padStart(2, "0")}
          </text>
        );
      })}
      {MARKERS.map((name) => {
        const min = minutesFromHHMM(timings[name]);
        const p = polar(cx, cy, 168, min);
        const on = next.name === name && !next.isTomorrow;
        return (
          <g key={name}>
            <circle cx={p.x} cy={p.y} r={on ? 7 : 4.5} fill={on ? "#e8c547" : "#0b3d32"} stroke="#e8c547" strokeWidth="1.5" />
            <text x={p.x} y={p.y + (min > 720 ? 16 : -12)} textAnchor="middle" fill="#e8c547" fontSize="9" fontFamily="Cairo, sans-serif">
              {PRAYER_LABELS[name].ar}
            </text>
          </g>
        );
      })}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#f5e6b8" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="46" fill="#041612" stroke="rgba(212,160,23,0.55)" strokeWidth="1.5" />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e8c547" fontSize="11" fontFamily="Amiri, serif">
        {city}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#fefdf8" fontSize="13" fontFamily="Inter, sans-serif">
        {nowLabel}
      </text>
    </svg>
  );
}
