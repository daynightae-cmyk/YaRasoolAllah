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

export function filterMediaDiscoveryRecords(
  records: readonly MediaDiscoveryRecord[],
  query: string,
  category: string | "all",
  status: string | "all",
): MediaDiscoveryRecord[] {
  const normalized = query.trim().toLocaleLowerCase();
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
      .join(" ")
      .toLocaleLowerCase();
    return haystack.includes(normalized);
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
