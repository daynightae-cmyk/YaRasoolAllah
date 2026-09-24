export type KidsPublisherTopic =
  | "seerah"
  | "prophetic-character"
  | "hadith-stories"
  | "sahaba"
  | "prophets"
  | "quran"
  | "adhkar"
  | "manners"
  | "arabic"
  | "family";

export interface KidsYouTubePublisher {
  id: string;
  name: string;
  handle: string;
  languages: string[];
  defaultTopics: KidsPublisherTopic[];
  discoveryEvidence: string;
  runtimePolicy: "candidate_only_until_item_review";
}

/**
 * Discovery registry only.
 *
 * A publisher being listed here does NOT approve every upload for child playback.
 * The sync script creates candidates. Item-level content, depiction, age and rights
 * review must all be approved before promotion into the runtime catalog.
 */
export const KIDS_YOUTUBE_PUBLISHERS: KidsYouTubePublisher[] = [
  {
    id: "one4kids",
    name: "One4kids",
    handle: "@one4kids",
    languages: ["en", "ar"],
    defaultTopics: ["prophetic-character", "prophets", "manners", "quran", "family"],
    discoveryEvidence: "https://www.youtube.com/@one4kids",
    runtimePolicy: "candidate_only_until_item_review",
  },
  {
    id: "iqra-cartoon",
    name: "IQRA CARTOON - Islamic Prophets & Quran Stories",
    handle: "@iqracartoon",
    languages: ["en", "ar", "ur"],
    defaultTopics: ["prophets", "hadith-stories", "sahaba", "quran", "seerah", "manners"],
    discoveryEvidence: "https://www.youtube.com/@iqracartoon",
    runtimePolicy: "candidate_only_until_item_review",
  },
];
