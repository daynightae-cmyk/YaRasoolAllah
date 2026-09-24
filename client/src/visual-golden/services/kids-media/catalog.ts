import { APPROVED_YOUTUBE_KIDS_VIDEOS } from "@/visual-golden/data/kids-youtube-approved.generated";
import type { KidsVideo, KidsVideoTopic } from "./types";

/** Runtime media comes only from the item-level approval promotion pipeline. */
export const KIDS_VIDEO_CATALOG: KidsVideo[] = APPROVED_YOUTUBE_KIDS_VIDEOS;

export const KIDS_TOPIC_LABELS: Record<KidsVideoTopic, string> = {
  seerah: "السيرة النبوية ﷺ",
  "prophetic-character": "كن مثل رسول الله ﷺ",
  "hadith-stories": "قصص من الحديث",
  sahaba: "أصحاب رسول الله ﷺ",
  prophets: "قصص الأنبياء",
  quran: "القرآن للصغار",
  adhkar: "الأذكار والدعاء",
  manners: "الأخلاق والآداب",
  arabic: "تعلم العربية",
  family: "مختارات الأسرة",
};

export interface KidsVideoRowModel {
  id: string;
  title: string;
  videos: KidsVideo[];
}

export function buildKidsVideoRows(videos: KidsVideo[]): KidsVideoRowModel[] {
  const topicOrder: KidsVideoTopic[] = [
    "seerah",
    "prophetic-character",
    "hadith-stories",
    "sahaba",
    "prophets",
    "quran",
    "adhkar",
    "manners",
    "arabic",
    "family",
  ];

  return topicOrder
    .map((topic) => ({
      id: topic,
      title: KIDS_TOPIC_LABELS[topic],
      videos: videos.filter((video) => video.topic === topic && video.embeddable),
    }))
    .filter((row) => row.videos.length > 0);
}
