import { APPROVED_YOUTUBE_KIDS_VIDEOS } from "@/visual-golden/data/kids-youtube-approved.generated";
import type { KidsVideo, KidsVideoTopic } from "./types";

const ytThumb = (id: string) => "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
const ytUrl = (id: string) => "https://www.youtube.com/watch?v=" + id;

const CURATED_SEED_VIDEOS: KidsVideo[] = [
  {
    id: "one4kids-be-like-muhammad-01",
    provider: "youtube",
    providerVideoId: "5XsRO-l64c0",
    titleAr: "قول الصدق",
    titleOriginal: "Telling the Truth | Be Just Like Muhammad ﷺ | Episode 1",
    description: "حلقة تربوية عن الصدق والاقتداء بأخلاق النبي محمد ﷺ.",
    publisherName: "One4Kids",
    thumbnailUrl: ytThumb("5XsRO-l64c0"),
    topic: "prophetic-character",
    series: "كن مثل رسول الله ﷺ",
    episode: 1,
    language: "en",
    ageMin: 5,
    ageMax: 12,
    captionsAvailable: true,
    embeddable: true,
    sourceUrl: ytUrl("5XsRO-l64c0"),
    publishedAt: "2026-06-18",
    tags: ["الصدق", "الأمانة", "أخلاق النبي ﷺ"],
  },
  {
    id: "one4kids-be-like-muhammad-02",
    provider: "youtube",
    providerVideoId: "PKbmh7mnYA4",
    titleAr: "كن رحيمًا ولطيفًا",
    titleOriginal: "Be Kind | Be Just Like Muhammad ﷺ | Episode 2",
    description: "حلقة تربوية عن اللطف والرحمة والاقتداء بأخلاق النبي محمد ﷺ.",
    publisherName: "One4Kids",
    thumbnailUrl: ytThumb("PKbmh7mnYA4"),
    topic: "prophetic-character",
    series: "كن مثل رسول الله ﷺ",
    episode: 2,
    language: "en",
    ageMin: 5,
    ageMax: 12,
    captionsAvailable: true,
    embeddable: true,
    sourceUrl: ytUrl("PKbmh7mnYA4"),
    publishedAt: "2026-06-26",
    tags: ["الرحمة", "اللطف", "أخلاق النبي ﷺ"],
  },
  {
    id: "one4kids-be-like-muhammad-03",
    provider: "youtube",
    providerVideoId: "eF7JcyiYncI",
    titleAr: "احترم والديك",
    titleOriginal: "Respect Your Parents | Be Just Like Muhammad ﷺ | Episode 3",
    description: "حلقة تربوية عن بر الوالدين واحترامهما.",
    publisherName: "One4Kids",
    thumbnailUrl: ytThumb("eF7JcyiYncI"),
    topic: "manners",
    series: "كن مثل رسول الله ﷺ",
    episode: 3,
    language: "en",
    ageMin: 5,
    ageMax: 12,
    captionsAvailable: true,
    embeddable: true,
    sourceUrl: ytUrl("eF7JcyiYncI"),
    publishedAt: "2026-07-11",
    tags: ["بر الوالدين", "الاحترام", "الأسرة"],
  },
];

export const KIDS_VIDEO_CATALOG: KidsVideo[] = [
  ...CURATED_SEED_VIDEOS,
  ...APPROVED_YOUTUBE_KIDS_VIDEOS,
];

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
