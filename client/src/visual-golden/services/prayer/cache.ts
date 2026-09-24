import type { PrayerTimesResult } from "./types";

const PREFIX = "yra-prayer-v1:";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function cacheKey(lat: number, lng: number, date: string, method: number, school: number) {
  return `${PREFIX}${lat.toFixed(4)}|${lng.toFixed(4)}|${date}|${method}|${school}`;
}

export function readCache(key: string): PrayerTimesResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: PrayerTimesResult };
    if (Date.now() - parsed.at > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: PrayerTimesResult) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* quota */
  }
}
