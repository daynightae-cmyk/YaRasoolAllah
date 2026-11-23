import { DISCOVERED_MEDIA_CATALOG } from "@/visual-golden/data/media-discovery.generated";
import { isMediaRecordApproved } from "./review-gates";
import type { MediaDiscoveryRecord } from "./types";

/** The public Noor room is a view over the governed catalog, never a second catalog. */
const KIDS_CATEGORIES = new Set(["kids", "القرآن الكريم للأطفال"]);
export const NOOR_MEDIA_RECORDS = DISCOVERED_MEDIA_CATALOG.filter(
  (record) => !KIDS_CATEGORIES.has(record.category ?? ""),
);

export type NoorTopic = "all" | "seerah" | "lectures" | "stories";
export type NoorAvailability = "all" | "approved" | "review";

export interface NoorFilters {
  query: string;
  topic: NoorTopic;
  category: string;
  channel: string;
  speaker: string;
  availability: NoorAvailability;
}

export const EMPTY_NOOR_FILTERS: NoorFilters = {
  query: "",
  topic: "all",
  category: "all",
  channel: "all",
  speaker: "all",
  availability: "all",
};

export function matchesNoorTopic(record: MediaDiscoveryRecord, topic: NoorTopic): boolean {
  if (topic === "all") return true;
  const category = record.category ?? "";
  if (topic === "seerah") return category === "seerah" || category.includes("سيرة");
  if (topic === "lectures") return category === "محاضرات ومواعظ";
  return category === "قصص الأنبياء والدروس";
}

export function filterNoorRecords(
  records: readonly MediaDiscoveryRecord[],
  filters: NoorFilters,
): MediaDiscoveryRecord[] {
  const query = filters.query.trim().toLocaleLowerCase("ar");
  return records.filter((record) => {
    if (!matchesNoorTopic(record, filters.topic)) return false;
    if (filters.category !== "all" && record.category !== filters.category) return false;
    if (filters.channel !== "all" && record.channel_name !== filters.channel) return false;
    if (filters.speaker !== "all" && record.speaker !== filters.speaker) return false;
    const approved = isMediaRecordApproved(record);
    if (filters.availability === "approved" && !approved) return false;
    if (filters.availability === "review" && approved) return false;
    if (!query) return true;
    return [
      record.title_ar,
      record.title_original,
      record.channel_name,
      record.category,
      record.subcategory,
      record.series_name,
      record.speaker,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ar")
      .includes(query);
  });
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
 * Remote thumbnails are a separate rights decision. Pending media uses local
 * non-figurative artwork/CSS instead of hotlinking an uncleared thumbnail.
 */
export function clearedNoorThumbnail(record: MediaDiscoveryRecord): string | null {
  if (!isMediaRecordApproved(record)) return null;
  if (!["CLEARED", "GRANTED", "APPROVED", "cleared", "granted", "approved"].includes(record.thumbnail_rights_status ?? "")) {
    return null;
  }
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
  if (!isMediaRecordApproved(record) || !record.embed_url) return null;
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
