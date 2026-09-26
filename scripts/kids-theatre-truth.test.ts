import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KIDS_VIDEO_CATALOG } from "../client/src/visual-golden/services/kids-media/catalog";
import { DISCOVERED_KIDS_VIDEOS } from "../client/src/visual-golden/data/kids-youtube-discovered.generated";
import { childrenAdaptationRegistry, mediaAssetRegistry } from "../shared/knowledge-registry";
import { mayPublishKidsMedia } from "../shared/kids-media-governance";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const room = read("client/src/visual-golden/components/kids-tv/KidsTVRoom.tsx");
const remote = read("client/src/visual-golden/components/kids-tv/KidsRemote.tsx");
const kidsPage = read("client/src/visual-golden/pages/KidsPage.tsx");

const playableCatalog = KIDS_VIDEO_CATALOG.filter((video) => video.embeddable);

describe("what the Kids theatre can actually play, measured", () => {
  it("publishes nothing until an episode clears review", () => {
    assert.equal(playableCatalog.length, 0, "the shipped catalogue holds no approved episode");
    assert.equal(
      mediaAssetRegistry.length,
      0,
      "no media asset is cleared for playback, so the theatre must not offer a video",
    );
  });

  it("keeps every discovered video in review", () => {
    for (const video of DISCOVERED_KIDS_VIDEOS) {
      assert.equal(
        video.reviewStatus,
        "pending",
        `${video.id} must stay pending until content, depiction, age and rights review finish`,
      );
      assert.notEqual(
        video.publicationStatus,
        "published",
        `${video.id} must not claim publication while it is pending`,
      );
    }
  });

  it("does not let a pending item publish itself", () => {
    assert.equal(
      mayPublishKidsMedia({
        sourceId: "test",
        providerVideoId: "test",
        review: "pending",
        depictionReviewed: false,
        ageVerified: false,
        rightsCleared: false,
      }),
      false,
      "a pending item with no depiction, age or rights clearance must not publish",
    );
  });

  it("counts adaptations separately from cleared media", () => {
    assert.ok(
      childrenAdaptationRegistry.length > 0,
      "the platform-authored adaptations are real content, separate from video",
    );
    assert.equal(mediaAssetRegistry.length, 0, "an adaptation is not a cleared video");
  });
});

describe("the theatre does not offer playback it cannot deliver", () => {
  it("derives the transport state instead of assuming a video exists", () => {
    assert.match(room, /const nothingPlayable = playable\.length === 0/);
    assert.match(room, /nothingPlayable=\{nothingPlayable\}/);
    assert.match(room, /unavailableReason=\{transportReason\}/);
  });

  it("states the reason in the reader's own language", () => {
    assert.match(room, /const transportReason = "/);
    assert.ok(
      room.includes("لا توجد حلقة معتمدة للتشغيل"),
      "the reason must be readable, not only attached to an aria-label",
    );
  });

  it("disables every video-bound control when nothing is playable", () => {
    assert.match(remote, /const locked = nothingPlayable/);
    assert.match(remote, /const lock = \{ disabled: locked, disabledReason: unavailableReason \}/);
    const lockedCount = (remote.match(/\{\.\.\.lock\}/g) ?? []).length;
    assert.ok(
      lockedCount >= 9,
      `expected the transport controls to be locked, found ${lockedCount}`,
    );
    for (const command of [
      "power",
      "previous",
      "play-pause",
      "next",
      "fullscreen",
      "volume-up",
      "volume-down",
      "channel-up",
      "channel-down",
      "mute",
      "captions",
    ]) {
      const line = remote
        .split(/\r?\n/)
        .find((candidate) => candidate.includes(`command="${command}"`));
      assert.ok(line, `${command} must exist on the remote`);
      assert.match(
        line,
        /\.\.\.lock/,
        `${command} can only act on a video, so it must be locked when none is playable`,
      );
    }
  });

  it("keeps leaving possible, because a locked theatre must not trap the reader", () => {
    for (const command of ["back", "home"]) {
      const line = remote
        .split(/\r?\n/)
        .find((candidate) => candidate.includes(`command="${command}"`));
      assert.ok(line, `${command} must exist`);
      assert.doesNotMatch(
        line,
        /\.\.\.lock/,
        `${command} is navigation and must stay enabled even when nothing plays`,
      );
    }
  });

  it("marks the disabled control's accessible name with the reason", () => {
    assert.match(
      remote,
      /aria-label=\{disabled && disabledReason \? `\$\{label\} — \$\{disabledReason\}` : label\}/,
    );
    assert.match(remote, /disabled=\{disabled\}/);
  });
});

describe("the reader is told the truth about what exists", () => {
  it("states that no episode is approved for playback", () => {
    assert.match(room, /لا توجد حلقات معتمدة للتشغيل في الفهرس الحالي/);
    assert.match(room, /الحلقات المختارة قيد المراجعة والتحقق قبل النشر/);
  });

  it("labels the acquired library as under review, not as content", () => {
    assert.match(room, /مكتبة الاستحواذ المرئي/);
    assert.match(room, /قيد المراجعة/);
    assert.match(
      room,
      /ولا يتحول أي عنصر إلى تشغيل عام/,
      "the reader must be told pending items never become public playback",
    );
  });

  it("shows the cleared-media count from the registry, not a hardcoded number", () => {
    assert.match(kidsPage, /KIDS_COUNTS\.clearedMedia/);
    const interfaceOnly = kidsPage
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^[ \t]*\/\/.*$/gm, "");
    assert.doesNotMatch(
      interfaceOnly,
      /نسخة فيديو معتمدة حتى الآن: \d/,
      "the cleared count must be derived, not typed in",
    );
  });

  it("never renders a play control for a pending item", () => {
    const start = room.indexOf("pendingRail");
    assert.ok(start > 0, "the pending rail must exist");
    const pendingBlock = room.slice(start, start + 900);
    assert.doesNotMatch(
      pendingBlock,
      /play-pause|<iframe|youtube\.com\/embed/,
      "a pending item must not carry a playback affordance",
    );
  });
});
