import { DISCOVERED_MEDIA_CATALOG } from "@/visual-golden/data/media-discovery.generated";
import { isOfficialProviderPlaybackCandidate, normalizeMediaSearch } from "./review-gates";
import { recordMediaCategory } from "./taxonomy";
import type { MediaDiscoveryRecord } from "./types";

/** The public Noor room is a view over the governed catalog, never a second catalog. */
const KIDS_CATEGORIES = new Set(["kids", "القرآن الكريم للأطفال"]);
export const NOOR_MEDIA_RECORDS = DISCOVERED_MEDIA_CATALOG.filter(
  (record) =>
    record.provenance.sourceFile !== "kids-media-catalog.csv" &&
    !KIDS_CATEGORIES.has(record.category ?? ""),
);

export type NoorTopic = "all" | "seerah" | "quran" | "history" | "companions" | "worship" | "lectures" | "stories";
export type NoorAvailability = "all" | "approved" | "review";
export type NoorDuration = "all" | "short" | "medium" | "long" | "unknown";

export interface NoorFilters {
  query: string;
  topic: NoorTopic;
  category: string;
  series: string;
  channel: string;
  speaker: string;
  duration: NoorDuration;
  availability: NoorAvailability;
}

export const EMPTY_NOOR_FILTERS: NoorFilters = {
  query: "",
  topic: "all",
  category: "all",
  series: "all",
  channel: "all",
  speaker: "all",
  duration: "all",
  availability: "all",
};

/**
 * Topic matching uses canonical presentation categories while the catalog keeps
 * the original acquisition category untouched in provenance.
 */
export function matchesNoorTopic(record: MediaDiscoveryRecord, topic: NoorTopic): boolean {
  if (topic === "all") return true;
  const category = recordMediaCategory(record);
  if (topic === "seerah") return category === "السيرة النبوية";
  if (topic === "quran") return category === "القرآن وعلومه";
  if (topic === "history") return category === "التاريخ الإسلامي";
  if (topic === "companions") return category === "الصحابة والأئمة";
  if (topic === "worship") return category === "العبادات";
  if (topic === "lectures") return category === "محاضرات ومواعظ";
  return category === "قصص الأنبياء والدروس";
}

export function matchesNoorDuration(record: MediaDiscoveryRecord, duration: NoorDuration): boolean {
  if (duration === "all") return true;
  const seconds = record.duration_seconds;
  if (duration === "unknown") return !Number.isFinite(seconds) || !seconds || seconds <= 0;
  if (!Number.isFinite(seconds) || !seconds || seconds <= 0) return false;
  if (duration === "short") return seconds <= 900;
  if (duration === "medium") return seconds > 900 && seconds <= 2700;
  return seconds > 2700;
}

export function compareNoorEpisodes(a: MediaDiscoveryRecord, b: MediaDiscoveryRecord): number {
  const episode = (a.episode_number ?? Number.MAX_SAFE_INTEGER) - (b.episode_number ?? Number.MAX_SAFE_INTEGER);
  if (episode !== 0) return episode;
  return noorMediaTitle(a).localeCompare(noorMediaTitle(b), "ar");
}

export function filterNoorRecords(
  records: readonly MediaDiscoveryRecord[],
  filters: NoorFilters,
): MediaDiscoveryRecord[] {
  const query = normalizeMediaSearch(filters.query);
  const matched = records.filter((record) => {
    if (!matchesNoorTopic(record, filters.topic)) return false;
    if (filters.category !== "all" && recordMediaCategory(record) !== filters.category) return false;
    if (filters.series !== "all" && record.series_name !== filters.series) return false;
    if (filters.channel !== "all" && record.channel_name !== filters.channel) return false;
    if (filters.speaker !== "all" && record.speaker !== filters.speaker) return false;
    if (!matchesNoorDuration(record, filters.duration)) return false;
    const playable = isOfficialProviderPlaybackCandidate(record);
    if (filters.availability === "approved" && !playable) return false;
    if (filters.availability === "review" && playable) return false;
    if (!query) return true;
    return normalizeMediaSearch([
      record.title_ar,
      record.title_original,
      record.channel_name,
      record.category,
      recordMediaCategory(record),
      record.subcategory,
      record.series_name,
      record.speaker,
    ].filter(Boolean).join(" ")).includes(query);
  });
  return filters.series === "all" ? matched : [...matched].sort(compareNoorEpisodes);
}

export function noorMediaTitle(record: MediaDiscoveryRecord): string {
  return record.title_ar?.trim() || record.title_original?.trim() || record.id;
}

/** Exact recorded duration only. Unknown duration remains unknown, never estimated. */
export function noorMediaDuration(seconds: number | null): string | null {
  if (!Number.isFinite(seconds) || !seconds || seconds <= 0) return null;
  const whole = Math.round(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainingSeconds = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

/**
 * Remote thumbnails are served directly by the official media provider for an
 * eligible embedded record. Other media still requires an explicit art decision.
 */
export function clearedNoorThumbnail(record: MediaDiscoveryRecord): string | null {
  const thumbnailApproved = ["CLEARED", "GRANTED", "APPROVED", "cleared", "granted", "approved"].includes(
    record.thumbnail_rights_status ?? "",
  );
  if (!thumbnailApproved && !isOfficialProviderPlaybackCandidate(record)) return null;
  const candidate = record.thumbnail_url ??
    (record.video_id ? `https://i.ytimg.com/vi/${encodeURIComponent(record.video_id)}/hqdefault.jpg` : null);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && ["i.ytimg.com", "img.youtube.com"].includes(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Fail closed at the final playback boundary as well as in the catalog UI.
 * Only an official YouTube embed can be mounted, with autoplay explicitly off.
 */
export function approvedNoorEmbedUrl(record: MediaDiscoveryRecord): string | null {
  if (!isOfficialProviderPlaybackCandidate(record) || !record.embed_url) return null;
  try {
    const url = new URL(record.embed_url);
    const allowedHost = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].includes(url.hostname);
    if (url.protocol !== "https:" || !allowedHost || !/^\/embed\/[A-Za-z0-9_-]{6,20}\/?$/.test(url.pathname)) {
      return null;
    }
    url.hostname = "www.youtube-nocookie.com";
    url.search = "";
    url.hash = "";
    url.searchParams.set("autoplay", "0");
    url.searchParams.set("rel", "0");
    return url.toString();
  } catch {
    return null;
  }
}
