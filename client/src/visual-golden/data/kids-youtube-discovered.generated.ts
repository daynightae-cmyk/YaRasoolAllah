export interface DiscoveredKidsVideo {
  id: string;
  providerVideoId: string;
  titleAr: string;
  titleOriginal: string;
  publisherName: string;
  topic: "seerah" | "prophetic-character" | "manners";
  language: string;
  sourceUrl: string;
  thumbnailUrl: string;
  reviewStatus: "pending";
  publicationStatus: "not_published";
}

export const DISCOVERED_KIDS_VIDEOS: DiscoveredKidsVideo[] = [
  {
    id: "one4kids-be-like-muhammad-01",
    providerVideoId: "5XsRO-l64c0",
    titleAr: "قول الصدق",
    titleOriginal: "Telling the Truth | Be Just Like Muhammad ﷺ | Episode 1",
    publisherName: "One4Kids",
    topic: "prophetic-character",
    language: "en",
    sourceUrl: "https://www.youtube.com/watch?v=5XsRO-l64c0",
    thumbnailUrl: "https://i.ytimg.com/vi/5XsRO-l64c0/hqdefault.jpg",
    reviewStatus: "pending",
    publicationStatus: "not_published",
  },
  {
    id: "one4kids-be-like-muhammad-02",
    providerVideoId: "PKbmh7mnYA4",
    titleAr: "كن رحيمًا ولطيفًا",
    titleOriginal: "Be Kind | Be Just Like Muhammad ﷺ | Episode 2",
    publisherName: "One4Kids",
    topic: "prophetic-character",
    language: "en",
    sourceUrl: "https://www.youtube.com/watch?v=PKbmh7mnYA4",
    thumbnailUrl: "https://i.ytimg.com/vi/PKbmh7mnYA4/hqdefault.jpg",
    reviewStatus: "pending",
    publicationStatus: "not_published",
  },
  {
    id: "one4kids-be-like-muhammad-03",
    providerVideoId: "eF7JcyiYncI",
    titleAr: "احترم والديك",
    titleOriginal: "Respect Your Parents | Be Just Like Muhammad ﷺ | Episode 3",
    publisherName: "One4Kids",
    topic: "manners",
    language: "en",
    sourceUrl: "https://www.youtube.com/watch?v=eF7JcyiYncI",
    thumbnailUrl: "https://i.ytimg.com/vi/eF7JcyiYncI/hqdefault.jpg",
    reviewStatus: "pending",
    publicationStatus: "not_published",
  },
  {
    id: "academy-seerah-birth",
    providerVideoId: "g0MbAeDpbIY",
    titleAr: "كرتون السيرة النبوية: مولد النبي ﷺ",
    titleOriginal: "كرتون السيرة النبوية: مولد النبي ﷺ",
    publisherName: "أكاديمية التأصيل الشرعي — هوية القناة بحاجة فحص",
    topic: "seerah",
    language: "ar",
    sourceUrl: "https://www.youtube.com/watch?v=g0MbAeDpbIY",
    thumbnailUrl: "https://i.ytimg.com/vi/g0MbAeDpbIY/hqdefault.jpg",
    reviewStatus: "pending",
    publicationStatus: "not_published",
  },
  {
    id: "zillnoorain-seerah-1",
    providerVideoId: "nkDXOiMvOlE",
    titleAr: "سلسلة السيرة للأطفال: الحلقة الأولى",
    titleOriginal: "Seerah Series for Kids: Episode 1",
    publisherName: "Zill Noorain Kids — هوية القناة بحاجة فحص",
    topic: "seerah",
    language: "en",
    sourceUrl: "https://www.youtube.com/watch?v=nkDXOiMvOlE",
    thumbnailUrl: "https://i.ytimg.com/vi/nkDXOiMvOlE/hqdefault.jpg",
    reviewStatus: "pending",
    publicationStatus: "not_published",
  },
];
