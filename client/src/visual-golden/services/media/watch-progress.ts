/**
 * Local watch continuation for the Noor theatre.
 *
 * The provider player reports the real playback position through the YouTube
 * IFrame API; the theatre samples it while the frame is mounted and persists
 * the position locally so a returning visitor can resume. Nothing is sent
 * anywhere: the storage is the visitor's own browser, keyed by media id.
 *
 * Positions are exact provider-reported seconds. A video that reached its
 * end (within the end margin) is cleared so it restarts from the beginning
 * instead of resuming at a dead stop.
 */

export interface WatchProgressEntry {
  seconds: number;
  duration: number;
  updatedAt: number;
}

export const WATCH_PROGRESS_STORAGE_KEY = "noor-watch-progress-v1";

/** Below this the video is considered "not started" and no resume is offered. */
export const MIN_RESUME_SECONDS = 15;
/** Within this of the end the video counts as finished and is cleared. */
export const FINISHED_MARGIN_SECONDS = 30;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function isValidEntry(value: unknown): value is WatchProgressEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as WatchProgressEntry;
  return (
    Number.isFinite(entry.seconds) &&
    entry.seconds > 0 &&
    Number.isFinite(entry.duration) &&
    entry.duration > 0 &&
    Number.isFinite(entry.updatedAt)
  );
}

export function loadWatchProgress(storage: StorageLike): Record<string, WatchProgressEntry> {
  try {
    const raw = storage.getItem(WATCH_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, WatchProgressEntry> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (id && isValidEntry(value)) out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Persist a sampled position. Returns the stored entry, or null when the
 * sample was invalid or the video counts as finished (in which case any
 * previous entry is removed).
 */
export function saveWatchProgress(
  storage: StorageLike,
  id: string,
  seconds: number,
  duration: number,
): WatchProgressEntry | null {
  if (!id || !Number.isFinite(seconds) || seconds <= 0 || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }
  try {
    const all = loadWatchProgress(storage);
    if (seconds >= duration - FINISHED_MARGIN_SECONDS) {
      delete all[id];
      storage.setItem(WATCH_PROGRESS_STORAGE_KEY, JSON.stringify(all));
      return null;
    }
    const entry: WatchProgressEntry = {
      seconds: Math.floor(seconds),
      duration: Math.floor(duration),
      updatedAt: Date.now(),
    };
    all[id] = entry;
    storage.setItem(WATCH_PROGRESS_STORAGE_KEY, JSON.stringify(all));
    return entry;
  } catch {
    return null;
  }
}

/** The resumable position for a stored entry, or null when there is none. */
export function resumableProgress(entry: WatchProgressEntry | null | undefined): WatchProgressEntry | null {
  if (!entry || !isValidEntry(entry)) return null;
  if (entry.seconds < MIN_RESUME_SECONDS) return null;
  if (entry.duration - entry.seconds < FINISHED_MARGIN_SECONDS) return null;
  return entry;
}
