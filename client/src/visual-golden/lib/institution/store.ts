import { useSyncExternalStore } from "react";
import type { PrayerLocation, PrayerCalculationSettings } from "@/visual-golden/services/prayer/types";
import { findLocation } from "@/visual-golden/services/prayer/locations";
import {
  mergeReadingProgress,
  sanitizeReadingProgress,
  type ReadingProgressEntry,
  type ReadingProgressInput,
} from "./reading-progress";

export type ThemeMode = "dark" | "light" | "contrast";
export type UiLang = "ar" | "en" | "fr" | "ur";
export type MotionPreference = "system" | "reduced" | "full";
export type ShellPanel = null | "favorites" | "notes" | "journey" | "notifications" | "status";

export interface FavoriteItem {
  id: string;
  title: string;
  path: string;
  at: number;
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  at: number;
}

export interface JourneyEvent {
  id: string;
  kind: "visit" | "bookmark" | "note";
  label: string;
  path?: string;
  at: number;
}

interface InstitutionState {
  theme: ThemeMode;
  lang: UiLang;
  motion: MotionPreference;
  panel: ShellPanel;
  hydrated: boolean;
  storageScope: "local";
  favorites: FavoriteItem[];
  notes: NoteItem[];
  journey: JourneyEvent[];
  visits: Record<string, number>;
  lastVisitedPath: string | null;
  recentPaths: string[];
  readingProgress: ReadingProgressEntry[];
  notifyLeadMin: 5 | 10 | 15 | 30;
  notifyPrayers: string[];
  notifySound: boolean;
  ambientEnabled: boolean;
  locationId: string;
  customLocation: PrayerLocation | null;
  calc: PrayerCalculationSettings;
  recentLocationIds: string[];
  hydrate: () => void;
  setTheme: (theme: ThemeMode) => void;
  setLang: (lang: UiLang) => void;
  setMotion: (motion: MotionPreference) => void;
  setPanel: (panel: ShellPanel) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "at">) => void;
  addNote: (title: string, body: string) => void;
  removeNote: (id: string) => void;
  recordVisit: (path: string, label: string) => void;
  recordReadingProgress: (entry: ReadingProgressInput) => void;
  setNotify: (patch: Partial<Pick<InstitutionState, "notifyLeadMin" | "notifyPrayers" | "notifySound">>) => void;
  setAmbientEnabled: (enabled: boolean) => void;
  setLocation: (loc: PrayerLocation) => void;
  setCalc: (patch: Partial<PrayerCalculationSettings>) => void;
}

const KEY = "yra-visual-golden-v1";
let state: InstitutionState;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

function save() {
  if (typeof window === "undefined") return;
  const {
    panel: _panel,
    hydrated: _hydrated,
    hydrate: _hydrate,
    setTheme: _setTheme,
    setLang: _setLang,
    setMotion: _setMotion,
    setPanel: _setPanel,
    toggleFavorite: _toggleFavorite,
    addNote: _addNote,
    removeNote: _removeNote,
    recordVisit: _recordVisit,
    recordReadingProgress: _recordReadingProgress,
    setNotify: _setNotify,
    setLocation: _setLocation,
    setCalc: _setCalc,
    ...persisted
  } = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(persisted));
  } catch {
    // The product remains usable when storage is unavailable or full.
  }
}

function patch(next: Partial<InstitutionState>) {
  state = { ...state, ...next };
  save();
  emit();
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light" || value === "contrast";
}

function isUiLang(value: unknown): value is UiLang {
  return value === "ar" || value === "en" || value === "fr" || value === "ur";
}

function isMotionPreference(value: unknown): value is MotionPreference {
  return value === "system" || value === "reduced" || value === "full";
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function sanitizeFavorites(value: unknown): FavoriteItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is FavoriteItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.path === "string" &&
        isFiniteTimestamp(item.at),
    )
    .slice(0, 40);
}

function sanitizeNotes(value: unknown): NoteItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is NoteItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.body === "string" &&
        isFiniteTimestamp(item.at),
    )
    .slice(0, 50);
}

function sanitizeJourney(value: unknown): JourneyEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is JourneyEvent =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        (item.kind === "visit" || item.kind === "bookmark" || item.kind === "note") &&
        typeof item.label === "string" &&
        (item.path === undefined || typeof item.path === "string") &&
        isFiniteTimestamp(item.at),
    )
    .slice(0, 40);
}

function sanitizeVisits(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([path, count]) => path.startsWith("/") && typeof count === "number" && Number.isFinite(count) && count >= 0,
    ),
  );
}

function sanitizeRecentPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((path): path is string => typeof path === "string" && path.startsWith("/")))].slice(0, 8);
}

function sanitizeNotifyLead(value: unknown): 5 | 10 | 15 | 30 {
  return value === 5 || value === 10 || value === 15 || value === 30 ? value : 10;
}

function hydrateState(raw: string | null): void {
  if (!raw) {
    state = { ...state, hydrated: true };
    emit();
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const theme = isThemeMode(parsed.theme) ? parsed.theme : state.theme;
    const lang = isUiLang(parsed.lang) ? parsed.lang : state.lang;
    const motion = isMotionPreference(parsed.motion) ? parsed.motion : state.motion;
    const notifyPrayers = Array.isArray(parsed.notifyPrayers)
      ? parsed.notifyPrayers.filter((name): name is string => typeof name === "string").slice(0, 8)
      : state.notifyPrayers;
    const locationId = typeof parsed.locationId === "string" ? parsed.locationId : state.locationId;
    const recentLocationIds = Array.isArray(parsed.recentLocationIds)
      ? parsed.recentLocationIds.filter((id): id is string => typeof id === "string").slice(0, 6)
      : state.recentLocationIds;
    const calc =
      parsed.calc && typeof parsed.calc === "object" && !Array.isArray(parsed.calc)
        ? ({ ...state.calc, ...(parsed.calc as Partial<PrayerCalculationSettings>) })
        : state.calc;
    const customLocation =
      parsed.customLocation && typeof parsed.customLocation === "object" && !Array.isArray(parsed.customLocation)
        ? (parsed.customLocation as PrayerLocation)
        : null;

    state = {
      ...state,
      theme,
      lang,
      motion,
      favorites: sanitizeFavorites(parsed.favorites),
      notes: sanitizeNotes(parsed.notes),
      journey: sanitizeJourney(parsed.journey),
      visits: sanitizeVisits(parsed.visits),
      lastVisitedPath: typeof parsed.lastVisitedPath === "string" ? parsed.lastVisitedPath : null,
      recentPaths: sanitizeRecentPaths(parsed.recentPaths),
      readingProgress: sanitizeReadingProgress(parsed.readingProgress),
      notifyLeadMin: sanitizeNotifyLead(parsed.notifyLeadMin),
      notifyPrayers,
      notifySound: typeof parsed.notifySound === "boolean" ? parsed.notifySound : state.notifySound,
      ambientEnabled: typeof parsed.ambientEnabled === "boolean" ? parsed.ambientEnabled : state.ambientEnabled,
      locationId,
      customLocation,
      calc,
      recentLocationIds,
      hydrated: true,
    };
  } catch {
    state = { ...state, hydrated: true };
  }
  emit();
}

const actions = {
  hydrate() {
    if (typeof window === "undefined" || state.hydrated) return;
    try {
      hydrateState(localStorage.getItem(KEY));
    } catch {
      state = { ...state, hydrated: true };
      emit();
    }
  },
  setTheme(theme: ThemeMode) {
    patch({ theme });
  },
  setLang(lang: UiLang) {
    patch({ lang });
  },
  setMotion(motion: MotionPreference) {
    patch({ motion });
  },
  setPanel(panel: ShellPanel) {
    state = { ...state, panel };
    emit();
  },
  toggleFavorite(item: Omit<FavoriteItem, "at">) {
    const exists = state.favorites.some((favorite) => favorite.id === item.id);
    const favorites = exists
      ? state.favorites.filter((favorite) => favorite.id !== item.id)
      : [{ ...item, at: Date.now() }, ...state.favorites].slice(0, 40);
    const journey = exists
      ? state.journey
      : [{ id: `j-${Date.now()}`, kind: "bookmark" as const, label: item.title, path: item.path, at: Date.now() }, ...state.journey].slice(0, 40);
    patch({ favorites, journey });
  },
  addNote(title: string, body: string) {
    const note = { id: `n-${Date.now()}`, title, body, at: Date.now() };
    patch({
      notes: [note, ...state.notes].slice(0, 50),
      journey: [{ id: `j-${Date.now()}`, kind: "note" as const, label: title, at: Date.now() }, ...state.journey].slice(0, 40),
    });
  },
  removeNote(id: string) {
    patch({ notes: state.notes.filter((note) => note.id !== id) });
  },
  recordVisit(path: string, label: string) {
    const visits = { ...state.visits, [path]: (state.visits[path] ?? 0) + 1 };
    const recentPaths = [path, ...state.recentPaths.filter((recentPath) => recentPath !== path)].slice(0, 8);
    const last = state.journey[0];
    if (last?.kind === "visit" && last.path === path) {
      patch({ visits, lastVisitedPath: path, recentPaths });
      return;
    }
    patch({
      visits,
      lastVisitedPath: path,
      recentPaths,
      journey: [{ id: `v-${Date.now()}`, kind: "visit" as const, label, path, at: Date.now() }, ...state.journey].slice(0, 40),
    });
  },
  recordReadingProgress(entry: ReadingProgressInput) {
    patch({ readingProgress: mergeReadingProgress(state.readingProgress, entry) });
  },
  setNotify(notifyPatch: Partial<Pick<InstitutionState, "notifyLeadMin" | "notifyPrayers" | "notifySound">>) {
    patch(notifyPatch);
  },
  setAmbientEnabled(enabled: boolean) {
    patch({ ambientEnabled: enabled });
  },
  setLocation(loc: PrayerLocation) {
    const known = findLocation(loc.id);
    const recents = [loc.id, ...state.recentLocationIds.filter((id) => id !== loc.id)].slice(0, 6);
    patch({ locationId: loc.id, customLocation: known ? null : loc, recentLocationIds: recents });
  },
  setCalc(calcPatch: Partial<PrayerCalculationSettings>) {
    patch({ calc: { ...state.calc, ...calcPatch } });
  },
};

const initialTheme: ThemeMode =
  typeof document !== "undefined" && document.documentElement.dataset.initialTheme === "light" ? "light" : "dark";

state = {
  theme: initialTheme,
  lang: "ar",
  motion: "system",
  panel: null,
  hydrated: false,
  storageScope: "local",
  favorites: [],
  notes: [],
  journey: [],
  visits: {},
  lastVisitedPath: null,
  recentPaths: [],
  readingProgress: [],
  notifyLeadMin: 10,
  notifyPrayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  notifySound: false,
  ambientEnabled: false,
  locationId: "ae-auh",
  customLocation: null,
  calc: { method: 8, school: 0, highLatitude: "auto" },
  recentLocationIds: ["ae-auh"],
  ...actions,
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useInstitution<T>(selector: (state: InstitutionState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export function currentLocation(): PrayerLocation {
  return state.customLocation ?? findLocation(state.locationId) ?? findLocation("ae-auh")!;
}
