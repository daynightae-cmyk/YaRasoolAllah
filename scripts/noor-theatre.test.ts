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
  noorMediaDuration,
  noorMediaTitle,
} from "../client/src/visual-golden/services/media/noor-theatre";
import {
  DISCOVERED_MEDIA_CATALOG,
  DISCOVERED_MEDIA_COUNTS,
} from "../client/src/visual-golden/data/media-discovery.generated";
import {
  isMediaRecordApproved,
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
      (item) => !kidsCategories.has(item.category ?? ""),
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

test("availability filters never mutate approval state", () => {
  const filters = { ...EMPTY_NOOR_FILTERS, availability: "approved" as const };
  assert.deepEqual(filterNoorRecords(NOOR_MEDIA_RECORDS, filters), []);
});

test("pending catalogue never fabricates a player or remote art", () => {
  for (const item of NOOR_MEDIA_RECORDS) {
    assert.equal(approvedNoorEmbedUrl(item), null);
    assert.equal(clearedNoorThumbnail(item), null);
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

test("pending records never resolve a stored provider URL", () => {
  assert.equal(
    approvedNoorEmbedUrl(
      record({ embed_url: "https://www.youtube.com/embed/abcdEFG1234" }),
    ),
    null,
  );
});

test("remote thumbnails require approval and a cleared rights decision", () => {
  assert.equal(
    clearedNoorThumbnail(
      record({
        ...PASSING,
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
