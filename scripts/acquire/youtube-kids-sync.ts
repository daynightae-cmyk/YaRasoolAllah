import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KIDS_YOUTUBE_PUBLISHERS,
  type KidsPublisherTopic,
  type KidsYouTubePublisher,
} from "./kids-youtube-publishers";

const API = "https://www.googleapis.com/youtube/v3";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(root, "data-sources/kids/youtube/candidates.generated.json");
const apiKey = process.env.YOUTUBE_DATA_API_KEY?.trim();

type ApiList<T> = {
  items?: T[];
  nextPageToken?: string;
  error?: { message?: string };
};

type ChannelItem = {
  id: string;
  snippet?: {
    title?: string;
    customUrl?: string;
    defaultLanguage?: string;
  };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};

type PlaylistItem = {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
};

type VideoItem = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
    tags?: string[];
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: {
    duration?: string;
    caption?: string;
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
  };
  status?: {
    privacyStatus?: string;
    embeddable?: boolean;
    license?: string;
    madeForKids?: boolean;
    selfDeclaredMadeForKids?: boolean;
  };
};

type Candidate = {
  id: string;
  provider: "youtube";
  providerVideoId: string;
  publisherId: string;
  publisherName: string;
  publisherChannelId: string;
  titleOriginal: string;
  description: string;
  thumbnailUrl: string;
  topic: KidsPublisherTopic;
  language: string;
  durationSeconds: number | null;
  captionsAvailable: boolean;
  embeddable: boolean;
  madeForKids: boolean | null;
  privacyStatus: string | null;
  license: string | null;
  regionRestriction: VideoItem["contentDetails"] extends infer C
    ? C extends { regionRestriction?: infer R } ? R | null : null
    : null;
  sourceUrl: string;
  publishedAt: string | null;
  tags: string[];
  review: {
    content: "pending";
    depiction: "pending";
    age: "pending";
    rights: "pending";
  };
  discoveredAt: string;
};

function fail(message: string): never {
  console.error("youtube-kids-sync FAILED:", message);
  process.exit(1);
}

function assertRegistry(): void {
  const ids = new Set<string>();
  for (const publisher of KIDS_YOUTUBE_PUBLISHERS) {
    if (!publisher.id || !publisher.name || !publisher.handle.startsWith("@")) {
      fail("invalid publisher registry entry: " + JSON.stringify(publisher));
    }
    if (ids.has(publisher.id)) fail("duplicate publisher id: " + publisher.id);
    ids.add(publisher.id);
  }
}

async function request<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!apiKey) fail("YOUTUBE_DATA_API_KEY is required.");
  const url = new URL(API + path);
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json()) as ApiList<unknown>;
  if (!response.ok) {
    fail("YouTube API " + response.status + ": " + (payload.error?.message ?? "request failed"));
  }
  return payload as T;
}

async function resolvePublisher(publisher: KidsYouTubePublisher): Promise<{
  channelId: string;
  channelTitle: string;
  uploadsPlaylistId: string;
}> {
  const result = await request<ApiList<ChannelItem>>("/channels", {
    part: "snippet,contentDetails",
    forHandle: publisher.handle,
  });
  const channel = result.items?.[0];
  const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!channel?.id || !uploads) fail("channel/uploads playlist not found for " + publisher.handle);
  return {
    channelId: channel.id,
    channelTitle: channel.snippet?.title ?? publisher.name,
    uploadsPlaylistId: uploads,
  };
}

async function enumerateUploads(playlistId: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = "";

  do {
    const result = await request<ApiList<PlaylistItem>>("/playlistItems", {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
      pageToken,
    });

    for (const item of result.items ?? []) {
      const id = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (id) ids.push(id);
    }
    pageToken = result.nextPageToken ?? "";
  } while (pageToken);

  return [...new Set(ids)];
}

function durationSeconds(iso?: string): number | null {
  if (!iso) return null;
  const match = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;
  return (
    Number(match[1] ?? 0) * 86400 +
    Number(match[2] ?? 0) * 3600 +
    Number(match[3] ?? 0) * 60 +
    Number(match[4] ?? 0)
  );
}

function bestThumb(thumbnails?: Record<string, { url?: string }>): string {
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const url = thumbnails?.[key]?.url;
    if (url) return url;
  }
  return "";
}

function inferTopic(title: string, description: string, fallback: KidsPublisherTopic[]): KidsPublisherTopic {
  const text = (title + " " + description).toLowerCase();
  const rules: Array<[KidsPublisherTopic, RegExp]> = [
    ["seerah", /seerah|prophet muhammad|rasool|messenger|السيرة|الرسول|محمد/],
    ["hadith-stories", /hadith|حديث/],
    ["sahaba", /sahaba|companion|abu bakr|umar|uthman|ali ibn|صحاب|أبو بكر|عمر|عثمان/],
    ["prophets", /prophet|anbiya|adam|nuh|noah|ibrahim|yusuf|musa|moses|isa|أنبياء|نبي|نوح|إبراهيم|يوسف|موسى/],
    ["quran", /quran|surah|tafsir|ayah|قرآن|سورة|تفسير|آية/],
    ["adhkar", /dua|du'a|dhikr|adhkar|دعاء|ذكر|أذكار/],
    ["arabic", /arabic|alphabet|letter|عربي|الحروف/],
    ["manners", /manners|kind|truth|honest|parents|adab|akhlaq|صدق|رحم|والدين|أخلاق|آداب/],
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] ?? fallback[0] ?? "family";
}

function languageOf(item: VideoItem, publisher: KidsYouTubePublisher): string {
  return item.snippet?.defaultAudioLanguage
    ?? item.snippet?.defaultLanguage
    ?? publisher.languages[0]
    ?? "und";
}

async function enrich(
  ids: string[],
  publisher: KidsYouTubePublisher,
  channelId: string,
  channelTitle: string,
): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const discoveredAt = new Date().toISOString();

  for (let start = 0; start < ids.length; start += 50) {
    const batch = ids.slice(start, start + 50);
    const result = await request<ApiList<VideoItem>>("/videos", {
      part: "snippet,contentDetails,status",
      id: batch.join(","),
    });

    for (const item of result.items ?? []) {
      const embeddable = item.status?.embeddable === true && item.status?.privacyStatus === "public";
      const title = item.snippet?.title ?? item.id;
      const description = item.snippet?.description ?? "";
      out.push({
        id: "youtube-" + item.id,
        provider: "youtube",
        providerVideoId: item.id,
        publisherId: publisher.id,
        publisherName: item.snippet?.channelTitle ?? channelTitle,
        publisherChannelId: item.snippet?.channelId ?? channelId,
        titleOriginal: title,
        description,
        thumbnailUrl: bestThumb(item.snippet?.thumbnails),
        topic: inferTopic(title, description, publisher.defaultTopics),
        language: languageOf(item, publisher),
        durationSeconds: durationSeconds(item.contentDetails?.duration),
        captionsAvailable: item.contentDetails?.caption === "true",
        embeddable,
        madeForKids: typeof item.status?.madeForKids === "boolean" ? item.status.madeForKids : null,
        privacyStatus: item.status?.privacyStatus ?? null,
        license: item.status?.license ?? null,
        regionRestriction: item.contentDetails?.regionRestriction ?? null,
        sourceUrl: "https://www.youtube.com/watch?v=" + item.id,
        publishedAt: item.snippet?.publishedAt ?? null,
        tags: item.snippet?.tags ?? [],
        review: {
          content: "pending",
          depiction: "pending",
          age: "pending",
          rights: "pending",
        },
        discoveredAt,
      });
    }
  }

  return out;
}

async function main(): Promise<void> {
  assertRegistry();

  if (process.argv.includes("--validate-registry")) {
    console.log("youtube-kids-sync registry PASS:", KIDS_YOUTUBE_PUBLISHERS.length, "publishers");
    return;
  }

  if (!apiKey) fail("Set YOUTUBE_DATA_API_KEY before running acquisition.");

  const candidates: Candidate[] = [];
  const publishers: Array<Record<string, unknown>> = [];

  for (const publisher of KIDS_YOUTUBE_PUBLISHERS) {
    console.log("Resolving", publisher.name, publisher.handle);
    const resolved = await resolvePublisher(publisher);
    const ids = await enumerateUploads(resolved.uploadsPlaylistId);
    const items = await enrich(ids, publisher, resolved.channelId, resolved.channelTitle);
    candidates.push(...items);
    publishers.push({
      ...publisher,
      channelId: resolved.channelId,
      channelTitle: resolved.channelTitle,
      uploadsPlaylistId: resolved.uploadsPlaylistId,
      discoveredVideoCount: ids.length,
      embeddablePublicCount: items.filter((item) => item.embeddable).length,
    });
  }

  const deduped = [...new Map(candidates.map((item) => [item.providerVideoId, item])).values()]
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        provider: "youtube",
        policy: "candidate_only_until_item_review",
        publishers,
        stats: {
          totalCandidates: deduped.length,
          embeddablePublic: deduped.filter((item) => item.embeddable).length,
          pendingReview: deduped.length,
        },
        candidates: deduped,
      },
      null,
      2,
    ) + "\n",
    "utf-8",
  );

  console.log(
    "youtube-kids-sync PASS:",
    deduped.length,
    "candidates ->",
    OUT,
    "(all remain pending item-level review)",
  );
}

await main();
