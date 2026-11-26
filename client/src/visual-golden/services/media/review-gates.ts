import type { MediaDiscoveryRecord } from "./types";

export type MediaReviewGateKey =
  | "publisher_status"
  | "rights_status"
  | "embedding_status"
  | "editorial_status"
  | "religious_review_status"
  | "depiction_review_status"
  | "publication_status";

export const MEDIA_REVIEW_GATE_LABELS: Record<MediaReviewGateKey, string> = {
  publisher_status: "الناشر",
  rights_status: "الحقوق",
  embedding_status: "التضمين",
  editorial_status: "التحرير",
  religious_review_status: "المراجعة الدينية",
  depiction_review_status: "التصوير",
  publication_status: "النشر",
};

const PASSING_STATUS: Record<MediaReviewGateKey, ReadonlySet<string>> = {
  publisher_status: new Set(["OFFICIAL", "VERIFIED_PUBLISHER", "official", "verified_publisher"]),
  rights_status: new Set(["CLEARED", "GRANTED", "APPROVED", "cleared", "granted", "approved"]),
  embedding_status: new Set(["VERIFIED", "ALLOWED", "verified", "allowed"]),
  editorial_status: new Set(["APPROVED", "approved"]),
  religious_review_status: new Set(["APPROVED", "approved"]),
  depiction_review_status: new Set(["APPROVED", "approved"]),
  publication_status: new Set(["APPROVED", "approved"]),
};

export function isMediaGatePassed(gate: MediaReviewGateKey, status: string | null): boolean {
  return PASSING_STATUS[gate].has(status ?? "");
}

export function isMediaRecordApproved(record: MediaDiscoveryRecord): boolean {
  return (Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[]).every((gate) =>
    isMediaGatePassed(gate, record[gate]),
  );
}

/**
 * An explicit negative decision is different from an incomplete internal review.
 * Unknown rights never mean that a license is granted; playback remains inside
 * the publisher's official player and no license or ownership claim is made.
 */
const EXPLICIT_PLAYBACK_BLOCKERS = new Set([
  "AGE_RESTRICTED",
  "BLOCKED",
  "COPYRIGHT_BLOCKED",
  "DENIED",
  "DISABLED",
  "EMBEDDING_DISABLED",
  "NOT_EMBEDDABLE",
  "PRIVATE",
  "PROHIBITED",
  "PROVIDER_REFUSED",
  "REJECTED",
  "RESTRICTED",
  "REMOVED",
  "UNAUTHORIZED",
  "UNAVAILABLE",
  "UNTRUSTED",
]);

export function hasExplicitPlaybackBlocker(record: MediaDiscoveryRecord): boolean {
  return [
    record.publisher_status,
    record.rights_status,
    record.embedding_status,
    record.editorial_status,
    record.religious_review_status,
    record.depiction_review_status,
    record.publication_status,
  ].some((status) => EXPLICIT_PLAYBACK_BLOCKERS.has(status?.trim().toUpperCase() ?? ""));
}

/**
 * Adult institutional media may be offered through its official provider while
 * editorial review is still pending. This does not approve the content, clear
 * its copyright, or guarantee that the provider will allow the embed.
 */
export function isOfficialProviderPlaybackCandidate(record: MediaDiscoveryRecord): boolean {
  return (
    record.provider.trim().toLowerCase() === "youtube" &&
    record.publisher_status?.trim().toUpperCase() !== "THIRD_PARTY" &&
    Boolean(record.video_id?.trim()) &&
    Boolean(record.embed_url?.trim()) &&
    !hasExplicitPlaybackBlocker(record)
  );
}

export function normalizeMediaSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("ar")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function filterMediaDiscoveryRecords(
  records: readonly MediaDiscoveryRecord[],
  query: string,
  category: string | "all",
  status: string | "all",
): MediaDiscoveryRecord[] {
  const normalized = normalizeMediaSearch(query);
  return records.filter((record) => {
    if (category !== "all" && record.category !== category) return false;
    if (status !== "all" && record.publication_status !== status) return false;
    if (!normalized) return true;
    const haystack = [
      record.title_ar,
      record.title_original,
      record.channel_name,
      record.series_name,
      record.speaker,
      record.subcategory,
      record.review_reason,
    ]
      .filter(Boolean)
      .join(" ");
    return normalizeMediaSearch(haystack).includes(normalized);
  });
}

export function mediaReviewCounts(records: readonly MediaDiscoveryRecord[]) {
  const approved = records.filter(isMediaRecordApproved).length;
  return {
    total: records.length,
    approved,
    pending: records.length - approved,
    rightsUnknown: records.filter((record) => record.rights_status === "UNKNOWN").length,
    embeddingUntested: records.filter((record) => record.embedding_status === "UNTESTED").length,
    editorialPending: records.filter((record) => record.editorial_status === "PENDING_REVIEW").length,
  };
}
