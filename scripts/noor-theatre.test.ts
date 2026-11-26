import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EMPTY_NOOR_FILTERS,
  NOOR_MEDIA_RECORDS,
  approvedNoorEmbedUrl,
  clearedNoorThumbnail,
  filterNoorRecords,
  matchesNoorDuration,
  matchesNoorTopic,
  noorMediaDuration,
  noorMediaTitle,
} from "../client/src/visual-golden/services/media/noor-theatre";
import { normalizeMediaSearch } from "../client/src/visual-golden/services/media/review-gates";
import {
  DISCOVERED_MEDIA_CATALOG,
  DISCOVERED_MEDIA_COUNTS,
} from "../client/src/visual-golden/data/media-discovery.generated";
import {
  isMediaRecordApproved,
  isOfficialProviderPlaybackCandidate,
  mediaReviewCounts,
} from "../client/src/visual-golden/services/media/review-gates";
import type { MediaDiscoveryRecord } from "../client/src/visual-golden/services/media/types";
import {
  CANONICAL_VISUAL_PATHS,
  isCanonicalVisualPath,
} from "../client/src/visual-golden/lib/public-shell";
import {
  INSTITUTION_NAVIGATION_WINGS,
  INSTITUTION_WINGS,
  workspaceContext,
} from "../client/src/visual-golden/lib/institution/workspace";
import { worldPlateForWing } from "../client/src/visual-golden/lib/institution/worlds";
import { discoveryWings } from "../client/src/visual-golden/services/discovery";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const kidsCategories = new Set(["kids", "القرآن الكريم للأطفال"]);

function record(
  overrides: Partial<MediaDiscoveryRecord> = {},
): MediaDiscoveryRecord {
  return {
    id: "fixture-record",
    provider: "youtube",
    video_id: "dQw4w9WgXcQ",
    official_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title_original: null,
    title_ar: null,
    description_ar: null,
    language: "ar",
    duration_seconds: null,
    published_at: null,
    channel_id: null,
    channel_name: "fixture channel",
    channel_url: null,
    publisher_status: "UNKNOWN",
    series_name: null,
    playlist_id: null,
    episode_number: null,
    category: null,
    subcategory: null,
    age_band: null,
    speaker: null,
    content_type: null,
    rights_holder: null,
    rights_notice: null,
    rights_status: "UNKNOWN",
    license_type: null,
    license_evidence_url: null,
    attribution_text: null,
    embedding_status: "UNTESTED",
    embed_url: null,
    editorial_status: "PENDING_REVIEW",
    publication_status: "DRAFT",
    religious_review_status: "PENDING_REVIEW",
    depiction_review_status: "PENDING_REVIEW",
    thumbnail_url: null,
    thumbnail_rights_status: "UNKNOWN",
    source_checked_at: null,
    verification_method: null,
    verification_evidence_urls: [],
    notes: null,
    rights_action: null,
    review_reason: null,
    review_next_action: null,
    provenance: {
      sourceFile: "noor-theatre.test.ts",
      sourceRow: 1,
      inputSha256: "0".repeat(64),
    },
    ...overrides,
  };
}

const PASSING = {
  publisher_status: "OFFICIAL",
  rights_status: "CLEARED",
  embedding_status: "VERIFIED",
  editorial_status: "APPROVED",
  religious_review_status: "APPROVED",
  depiction_review_status: "APPROVED",
  publication_status: "APPROVED",
} as const;

test("Noor is an independent governed wing and route", () => {
  assert.equal(isCanonicalVisualPath("/noor"), true);
  assert.ok((CANONICAL_VISUAL_PATHS as readonly string[]).includes("/noor"));
  assert.equal(INSTITUTION_WINGS.media.path, "/noor");
  assert.ok(INSTITUTION_NAVIGATION_WINGS.includes("media"));
  assert.equal(workspaceContext("/noor").wing.id, "media");
  assert.equal(worldPlateForWing("media").wing, "media");
  assert.ok(discoveryWings.some((wing) => wing.path === "/noor"));
});

test("Noor is wired to the application and keeps the editorial route distinct", () => {
  const app = read("client/src/App.tsx");
  assert.match(app, /path="\/noor"/);
  assert.match(app, /VisualNoorPage/);
  assert.match(app, /path="\/media-theater"/);
  assert.match(app, /Redirect to="\/noor"/);
  assert.match(app, /path="\/media-review"/);
  assert.match(app, /VisualMediaReviewPage/);
  assert.ok(existsSync(join(root, "client/src/visual-golden/pages/NoorPage.tsx")));
});

test("Seerah no longer embeds the media catalog and links out to Noor", () => {
  const seerah = read("client/src/visual-golden/pages/SeerahPage.tsx");
  assert.doesNotMatch(seerah, /MediaLibrarySection/);
  assert.doesNotMatch(seerah, /data-visual="media-library"/);
  assert.match(seerah, /href="\/noor"/);
});

test("the public Noor catalog stays a view over the governed catalog", () => {
  assert.ok(NOOR_MEDIA_RECORDS.length > 0);
  assert.equal(
    NOOR_MEDIA_RECORDS.length,
    DISCOVERED_MEDIA_CATALOG.filter(
      (item) =>
        item.provenance.sourceFile !== "kids-media-catalog.csv" &&
        !kidsCategories.has(item.category ?? ""),
    ).length,
  );
  assert.equal(DISCOVERED_MEDIA_COUNTS.approved, 0);
  assert.equal(mediaReviewCounts(NOOR_MEDIA_RECORDS).approved, 0);
  assert.equal(
    mediaReviewCounts(NOOR_MEDIA_RECORDS).pending,
    NOOR_MEDIA_RECORDS.length,
  );
});

test("no children's catalogue record leaks into the public theatre", () => {
  for (const item of NOOR_MEDIA_RECORDS) {
    assert.ok(
      !kidsCategories.has(item.category ?? ""),
      `${item.id} is a children's record`,
    );
  }
});

test("availability filters use provider eligibility without mutating approval state", () => {
  const pendingPlayable = record({
    publisher_status: "OFFICIAL",
    embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  });
  const explicitlyBlocked = record({
    id: "blocked-record",
    publisher_status: "OFFICIAL",
    rights_status: "PROHIBITED",
    embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  });
  const records = [pendingPlayable, explicitlyBlocked];
  assert.deepEqual(
    filterNoorRecords(records, { ...EMPTY_NOOR_FILTERS, availability: "approved" }),
    [pendingPlayable],
  );
  assert.deepEqual(
    filterNoorRecords(records, { ...EMPTY_NOOR_FILTERS, availability: "review" }),
    [explicitlyBlocked],
  );
  assert.equal(isMediaRecordApproved(pendingPlayable), false);
});

test("canonical topics, durations, series order, and Arabic search normalization work together", () => {
  const seerahAlias = record({ id: "seerah-alias", category: "seerah" });
  const second = record({ id: "episode-2", category: "seerah", series_name: "Series", episode_number: 2, duration_seconds: 3600 });
  const first = record({ id: "episode-1", category: "seerah", series_name: "Series", episode_number: 1, duration_seconds: 300 });
  const unknownDuration = record({ id: "unknown", category: "seerah", series_name: "Series", episode_number: 3, duration_seconds: null });

  assert.equal(matchesNoorTopic(seerahAlias, "seerah"), true);
  assert.equal(matchesNoorTopic(record({ category: "محاضرات ومواعظ" }), "lectures"), true);
  assert.deepEqual(
    filterNoorRecords([second, unknownDuration, first], { ...EMPTY_NOOR_FILTERS, topic: "seerah", series: "Series" }).map((item) => item.id),
    ["episode-1", "episode-2", "unknown"],
  );
  assert.equal(matchesNoorDuration(first, "short"), true);
  assert.equal(matchesNoorDuration(second, "long"), true);
  assert.equal(matchesNoorDuration(unknownDuration, "unknown"), true);
  assert.equal(matchesNoorDuration(unknownDuration, "short"), false);
  assert.equal(
    normalizeMediaSearch("\u0623\u0644\u0642\u0631\u0622\u0646"),
    normalizeMediaSearch("\u0627\u0644\u0642\u0631\u0627\u0646"),
  );
  assert.deepEqual(
    filterNoorRecords([record({ id: "hit", title_original: "\u0627\u0644\u0642\u0631\u0622\u0646" })], { ...EMPTY_NOOR_FILTERS, query: "\u0623\u0644\u0642\u0631\u0622\u0646" }).map((item) => item.id),
    ["hit"],
  );
});

test("pending editorial review does not fabricate approval or block an official provider candidate", () => {
  const pending = record({
    publisher_status: "OFFICIAL",
    embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  });
  assert.equal(isMediaRecordApproved(pending), false);
  assert.equal(isOfficialProviderPlaybackCandidate(pending), true);
  assert.ok(approvedNoorEmbedUrl(pending));
  assert.ok(clearedNoorThumbnail(pending));
});

test("every public theatre playback candidate remains subject to explicit negative decisions", () => {
  for (const item of NOOR_MEDIA_RECORDS) {
    assert.equal(
      Boolean(approvedNoorEmbedUrl(item)),
      isOfficialProviderPlaybackCandidate(item),
      item.id,
    );
  }
  for (const gate of [
    "rights_status",
    "embedding_status",
    "editorial_status",
    "religious_review_status",
    "depiction_review_status",
    "publication_status",
  ] as const) {
    const blocked = record({
      publisher_status: "OFFICIAL",
      embed_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      [gate]: "REJECTED",
    });
    assert.equal(approvedNoorEmbedUrl(blocked), null, gate);
  }
});

test("an approved record mounts only a no-autoplay YouTube embed", () => {
  const approved = record({
    ...PASSING,
    embed_url: "https://www.youtube.com/embed/abcdEFG1234?autoplay=1&t=60",
    thumbnail_url: "https://i.ytimg.com/vi/abcdEFG1234/hqdefault.jpg",
    thumbnail_rights_status: "CLEARED",
  });
  assert.equal(isMediaRecordApproved(approved), true);
  const embed = approvedNoorEmbedUrl(approved);
  assert.ok(embed);
  const url = new URL(embed);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "www.youtube-nocookie.com");
  assert.equal(url.searchParams.get("autoplay"), "0");
  assert.equal(url.searchParams.get("rel"), "0");
  assert.equal(url.searchParams.get("t"), null);
  assert.equal(clearedNoorThumbnail(approved), approved.thumbnail_url);
});

test("an approved record with an untrusted embed fails closed", () => {
  for (const embed of [
    "http://www.youtube.com/embed/abcdEFG1234",
    "https://example.com/embed/abcdEFG1234",
    "https://www.youtube.com/watch?v=abcdEFG1234",
    "javascript:alert(1)",
    "not-a-url",
  ]) {
    assert.equal(
      approvedNoorEmbedUrl(record({ ...PASSING, embed_url: embed })),
      null,
      `unsafe embed accepted: ${embed}`,
    );
  }
});

test("third-party acquisition records do not enter the institutional player", () => {
  assert.equal(
    approvedNoorEmbedUrl(
      record({
        publisher_status: "THIRD_PARTY",
        embed_url: "https://www.youtube.com/embed/abcdEFG1234",
      }),
    ),
    null,
  );
});

test("remote thumbnails stay restricted to provider hosts and eligible records", () => {
  assert.equal(
    clearedNoorThumbnail(
      record({
        publisher_status: "THIRD_PARTY",
        thumbnail_rights_status: "UNKNOWN",
        thumbnail_url: "https://i.ytimg.com/vi/abcdEFG1234/hqdefault.jpg",
      }),
    ),
    null,
  );
  assert.equal(
    clearedNoorThumbnail(
      record({
        thumbnail_rights_status: "CLEARED",
        thumbnail_url: "/local-cleared.png",
      }),
    ),
    null,
  );
  assert.equal(
    clearedNoorThumbnail(
      record({
        ...PASSING,
        thumbnail_rights_status: "CLEARED",
        thumbnail_url: "https://evil.example/image.png",
      }),
    ),
    null,
  );
  assert.ok(
    clearedNoorThumbnail(
      record({
        ...PASSING,
        video_id: "abcdEFG1234",
        thumbnail_rights_status: "CLEARED",
      }),
    )?.endsWith("/hqdefault.jpg"),
  );
});

test("duration and title render only recorded facts", () => {
  assert.equal(noorMediaDuration(null), null);
  assert.equal(noorMediaDuration(0), null);
  assert.equal(noorMediaDuration(-1), null);
  assert.equal(noorMediaDuration(Number.NaN), null);
  assert.equal(noorMediaDuration(59), "0:59");
  assert.equal(noorMediaDuration(61), "1:01");
  assert.equal(noorMediaDuration(3661), "1:01:01");
  assert.equal(
    noorMediaTitle(record({ title_ar: "  ", title_original: "Recorded" })),
    "Recorded",
  );
  assert.equal(
    noorMediaTitle(record({ title_ar: "العنوان", title_original: "Original" })),
    "العنوان",
  );
  assert.equal(
    noorMediaTitle(record({ title_ar: null, title_original: null })),
    "fixture-record",
  );
});

test("the page and the visible navigation entry exist", () => {
  assert.ok(
    read("client/src/visual-golden/pages/NoorPage.tsx").includes(
      "NoorMediaTheatre",
    ),
  );
  assert.match(
    read("client/src/visual-golden/components/shell/InstitutionSidebar.tsx"),
    /Clapperboard/,
  );
  assert.match(read("client/public/manus-routes.json"), /\/noor/);
});

test("capture evidence targets the actual Noor route and mount", () => {
  const capture = read("scripts/capture-visual-evidence.mjs");
  assert.match(capture, /path: "\/noor"/);
  assert.match(capture, /data-visual="noor-theatre"/);
  assert.doesNotMatch(
    capture,
    /path: "\/seerah"[^\n]*scrollSelector: '\[data-visual="media-library"\]'/,
  );
});
