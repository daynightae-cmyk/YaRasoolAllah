import type { NextPrayerState, PrayerName, PrayerTimings } from "./types";
import { PRAYER_LABELS } from "./types";

export function stripTime(raw: string) {
  return raw.trim().split(/\s+/)[0] ?? raw;
}

export function minutesFromHHMM(raw: string) {
  const t = stripTime(raw);
  const [h, m] = t.split(":").map((n) => Number.parseInt(n, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function hhmmFromMinutes(total: number) {
  const n = ((total % 1440) + 1440) % 1440;
  const h = String(Math.floor(n / 60)).padStart(2, "0");
  const m = String(n % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function partsInZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
  });
  const bag: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") bag[p.type] = p.value;
  }
  const hour = bag.hour === "24" ? "00" : bag.hour;
  return {
    year: bag.year,
    month: bag.month,
    day: bag.day,
    hour,
    minute: bag.minute,
    second: bag.second,
    weekday: bag.weekday,
  };
}

export function nowMinutesInZone(timeZone: string, at = new Date()) {
  const p = partsInZone(at, timeZone);
  return Number(p.hour) * 60 + Number(p.minute) + Number(p.second) / 60;
}

export function nowSecondsInZone(timeZone: string, at = new Date()) {
  const p = partsInZone(at, timeZone);
  return Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second);
}

export function formatOffset(timeZone: string, at = new Date()) {
  const str = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(at);
  return str.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

export function dateKeyInZone(timeZone: string, at = new Date()) {
  const p = partsInZone(at, timeZone);
  return `${p.day}-${p.month}-${p.year}`;
}

export function tomorrowDateKey(timeZone: string, at = new Date()) {
  return dateKeyInZone(timeZone, new Date(at.getTime() + 36 * 3600 * 1000));
}

const ORDER: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

export function computeNextPrayer(
  timings: PrayerTimings,
  tomorrowFajr: string,
  timeZone: string,
  at = new Date(),
): NextPrayerState {
  const nowMin = nowMinutesInZone(timeZone, at);
  for (const name of ORDER) {
    const t = minutesFromHHMM(timings[name]);
    if (nowMin < t) {
      const remainingSeconds = Math.max(0, Math.round((t - nowMin) * 60));
      return {
        name,
        labelAr: PRAYER_LABELS[name].ar,
        labelEn: PRAYER_LABELS[name].en,
        at: stripTime(timings[name]),
        remainingSeconds,
        isTomorrow: false,
      };
    }
  }
  const fajr = minutesFromHHMM(tomorrowFajr) + 1440;
  const remainingSeconds = Math.max(0, Math.round((fajr - nowMin) * 60));
  return {
    name: "Fajr",
    labelAr: PRAYER_LABELS.Fajr.ar,
    labelEn: PRAYER_LABELS.Fajr.en,
    at: stripTime(tomorrowFajr),
    remainingSeconds,
    isTomorrow: true,
  };
}

export function prayerStatus(name: PrayerName, timings: PrayerTimings, next: NextPrayerState, timeZone: string) {
  const now = nowMinutesInZone(timeZone);
  const t = minutesFromHHMM(timings[name]);
  if (next.name === name && !next.isTomorrow) return "next" as const;
  if (now >= t && name !== "Sunrise") return "past" as const;
  if (name === "Sunrise" && now >= t) return "past" as const;
  return "upcoming" as const;
}

export function formatRemain(total: number) {
  const s = Math.max(0, total);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h} : ${m} : ${sec}`;
}

/** Night-length calculations from Maghrib → next Fajr. Presented as time math, not rulings. */
export function nightWindows(maghrib: string, nextFajr: string) {
  const start = minutesFromHHMM(maghrib);
  let end = minutesFromHHMM(nextFajr);
  if (end <= start) end += 1440;
  const dur = end - start;
  return {
    durationMin: dur,
    midpoint: hhmmFromMinutes(start + dur / 2),
    lastThirdStart: hhmmFromMinutes(start + (dur * 2) / 3),
    formulaAr: "مدة الليل = الفجر التالي − المغرب. المنتصف = المغرب + نصف المدة. الثلث الأخير يبدأ عند المغرب + ثلثي المدة.",
    formulaEn: "Night length = next Fajr − Maghrib. Midpoint = Maghrib + half. Last third starts at Maghrib + ⅔ of the night.",
  };
}
