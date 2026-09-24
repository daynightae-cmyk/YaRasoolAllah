export type KidsVideoProvider = "youtube" | "vimeo" | "wikimedia" | "native";

export type KidsVideoTopic =
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

export interface KidsVideo {
  id: string;
  provider: KidsVideoProvider;
  providerVideoId: string;
  titleAr: string;
  titleOriginal: string;
  description?: string;
  publisherName: string;
  publisherChannelId?: string;
  thumbnailUrl: string;
  topic: KidsVideoTopic;
  series?: string;
  episode?: number;
  language: string;
  ageMin?: number;
  ageMax?: number;
  durationSeconds?: number;
  captionsAvailable?: boolean;
  embeddable: boolean;
  sourceUrl: string;
  publishedAt?: string;
  tags: string[];
}

export type KidsTVState =
  | "idle"
  | "selected"
  | "curtain-closing"
  | "loading"
  | "curtain-opening"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type KidsPlayerState =
  | "idle"
  | "ready"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export interface KidsPlayerHandle {
  load(videoId: string, autoplay?: boolean): void;
  play(): void;
  pause(): void;
  seekBy(seconds: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  toggleCaptions(enabled: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
}

export interface KidsWatchProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}
