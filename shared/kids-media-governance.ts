/** Discovery entries are editorial intake, not a playable media library. */
export type KidsMediaReview = "pending" | "approved" | "rejected" | "stale";
export type KidsPlaybackMode = "unknown" | "external_link" | "official_embed" | "licensed_host";

export interface KidsMediaCandidate {
  id: string;
  canonicalUrl: string;
  publisherVerified: boolean;
  rightsMode: KidsPlaybackMode;
  contentReview: KidsMediaReview;
  depictionReview: KidsMediaReview;
  ageReview: KidsMediaReview;
  rightsReview: KidsMediaReview;
  reviewEvidenceUrl: string | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  revokedAt: string | null;
  embeddable?: boolean;
}

export function mayPublishKidsMedia(item: KidsMediaCandidate): boolean {
  let url: URL;
  try {
    url = new URL(item.canonicalUrl);
  } catch {
    return false;
  }

  return url.protocol === "https:"
    && item.publisherVerified
    && item.contentReview === "approved"
    && item.depictionReview === "approved"
    && item.ageReview === "approved"
    && item.rightsReview === "approved"
    && item.rightsMode !== "unknown"
    && (item.rightsMode !== "official_embed" || item.embeddable === true)
    && Boolean(item.reviewEvidenceUrl && item.reviewerId && item.reviewedAt)
    && item.revokedAt === null;
}

/** Publisher landing pages for parents; none is an approved episode or embed. */
export const PARENT_DISCOVERY_SOURCES = [
  {
    id: "saud-sara",
    title: "سعود وسارة",
    topic: "السيرة والأخلاق والقرآن",
    note: "صفحة منتج تعرض روضة القرآن ورحاب النبوة. افتحها مع طفلك وراجع الحلقة قبل المشاهدة.",
    url: "http://www.saudsara.com.sa/",
    language: "العربية",
  },
  {
    id: "istikana",
    title: "قصص من رحيق النبوة",
    topic: "قصص من الحديث",
    note: "فهرس المسلسل لدى منصة إستكانة؛ بعض الحلقات قد تتطلب اشتراكًا.",
    url: "https://www.istikana.com/ar/episodes/kisas-nabawi-0",
    language: "العربية",
  },
  {
    id: "one4kids",
    title: "قصص الأنبياء — One4Kids",
    topic: "قصص الأنبياء",
    note: "مجموعة الناشر الرسمية؛ راجع العمر وطريقة التصوير لكل عمل.",
    url: "https://www.one4kids.tv/stories-of-prophets",
    language: "الإنجليزية",
  },
  {
    id: "dawood",
    title: "داوود للأطفال",
    topic: "القرآن والتلاوة",
    note: "تعريف الناشر بمشروع تعليم القرآن بالرسوم المتحركة.",
    url: "https://www.dawoodkids.com/about-us-ar/",
    language: "العربية",
  },
  {
    id: "muslimkids",
    title: "MuslimKids.TV",
    topic: "مكتبة متنوعة",
    note: "فهرس أعمال حسب العمر لدى المنصة، وقد تتطلب المشاهدة اشتراكًا.",
    url: "https://www.muslimkids.tv/all/shows/?age_group=3",
    language: "الإنجليزية",
  },
] as const;
