import type { KidsWatchProgress } from "./types";

const STORAGE_KEY = "kids-tv-progress-v1";

export function readKidsProgress(): Record<string, KidsWatchProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, KidsWatchProgress>;
  } catch {
    return {};
  }
}

export function writeKidsProgress(progress: KidsWatchProgress): void {
  if (typeof window === "undefined") return;
  try {
    const current = readKidsProgress();
    current[progress.videoId] = progress;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Local progress is best-effort; playback must continue if storage is unavailable.
  }
}

export function getContinueWatchingIds(): string[] {
  return Object.values(readKidsProgress())
    .filter((item) => !item.completed && item.currentTime > 5)
    .sort((a, b) => b.lastWatchedAt.localeCompare(a.lastWatchedAt))
    .map((item) => item.videoId);
}
