import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KIDS_COUNTS,
  KIDS_STORIES,
  KIDS_TOPICS,
  kidsAdaptationsForTopic,
  kidsTopicForAdaptation,
} from "../client/src/visual-golden/services/kids";
import { KIDS_TOPIC_LABELS } from "../client/src/visual-golden/services/kids-media/catalog";
import {
  REVIEW_LOG_STORAGE_KEY,
  decisionFor,
  parseReviewLog,
  recordReviewDecision,
  summarizeReviewLog,
} from "../client/src/visual-golden/services/media/review-log";
import { APPROVED_YOUTUBE_KIDS_VIDEOS } from "../client/src/visual-golden/data/kids-youtube-approved.generated";
import { DISCOVERED_MEDIA_CATALOG } from "../client/src/visual-golden/data/media-discovery.generated";
import { childrenAdaptationRegistry } from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const kidsPage = readFileSync(join(repoRoot, "client/src/visual-golden/pages/KidsPage.tsx"), "utf8");
const reviewQueue = readFileSync(
  join(repoRoot, "client/src/visual-golden/components/kids/KidsReviewQueue.tsx"),
  "utf8",
);

const EXPECTED_TOPICS: Array<[string, string]> = [
  ["prophets-stories", "قصص الأنبياء"],
  ["quran-stories", "قصص القرآن"],
  ["seerah-kids", "السيرة النبوية للأطفال"],
  ["islamic-tales", "الحكايات الإسلامية"],
  ["prayer", "تعليم الصلاة"],
  ["wudu", "تعليم الوضوء"],
  ["quran-memorization", "تحفيظ القرآن"],
  ["adhkar", "الأذكار"],
  ["manners", "الأخلاق والآداب"],
  ["arabic-language", "الحروف واللغة العربية"],
  ["activities", "الأنشطة التعليمية"],
  ["quizzes", "المسابقات"],
];

describe("Children's World topic architecture", () => {
  it("covers exactly the twelve governed experiences with their labels", () => {
    assert.deepEqual(
      KIDS_TOPICS.map((topic) => [topic.id, topic.labelAr]),
      EXPECTED_TOPICS,
    );
  });

  it("assigns every registered adaptation to exactly one topic", () => {
    const assigned = KIDS_TOPICS.flatMap((topic) => topic.adaptationIds);
    assert.equal(new Set(assigned).size, assigned.length, "no adaptation may appear in two topics");
    assert.deepEqual(
      [...assigned].sort(),
      childrenAdaptationRegistry.map((item) => item.adaptationId).sort(),
      "every adaptation must belong to a topic",
    );
    for (const adaptation of childrenAdaptationRegistry) {
      const topic = kidsTopicForAdaptation(adaptation.adaptationId);
      assert.ok(topic, `${adaptation.adaptationId} must resolve to a topic`);
      assert.ok(
        kidsAdaptationsForTopic(topic.id).some((item) => item.adaptationId === adaptation.adaptationId),
        `${adaptation.adaptationId} must be listed under ${topic.id}`,
      );
    }
    assert.equal(kidsTopicForAdaptation("adaptation-does-not-exist"), null);
  });

  it("gives every topic real, resolvable content", () => {
    for (const topic of KIDS_TOPICS) {
      const adaptations = kidsAdaptationsForTopic(topic.id);
      const hasAdaptation = adaptations.length > 0;
      const hasVideoRow = topic.videoTopic ? topic.videoTopic in KIDS_TOPIC_LABELS : false;
      const hasActivity = Boolean(topic.activity);
      assert.ok(
        hasAdaptation || hasVideoRow || hasActivity,
        `topic ${topic.id} must point at adaptations, a video row, or a local activity`,
      );
      for (const adaptation of adaptations) {
        assert.ok(
          KIDS_STORIES.some((story) => story.adaptationId === adaptation.adaptationId),
          "topic adaptations must be real registered stories",
        );
        assert.ok(adaptation.sourceIds.length > 0, "every adaptation must cite sources");
        assert.equal(adaptation.adaptationLabel, "platform_original_not_a_direct_quote");
        assert.equal(adaptation.depictionPolicy, "no_prophetic_depiction");
      }
    }
  });

  it("keeps publication honest: nothing is cleared just because it is listed", () => {
    assert.equal(KIDS_COUNTS.clearedMedia, 0);
    assert.equal(APPROVED_YOUTUBE_KIDS_VIDEOS.length, 0);
    const kidsPending = DISCOVERED_MEDIA_CATALOG.filter(
      (record) => record.category === "kids" || record.category === "القرآن الكريم للأطفال",
    );
    assert.ok(kidsPending.length > 0, "the pending review queue must have real discovered items");
  });

  it("renders the topic rail and the review queue on the kids page", () => {
    assert.match(kidsPage, /data-visual="kids-topic-rail"/);
    assert.match(kidsPage, /<KidsReviewQueue \/>/);
    assert.match(kidsPage, /KIDS_TOPICS\.map/);
    assert.match(reviewQueue, /data-visual="kids-review-queue"/);
    assert.match(reviewQueue, /recordReviewDecision/);
    assert.match(reviewQueue, /التسجيل ليس نشرًا/);
  });
});

describe("governed review log", () => {
  it("records, replaces and summarizes decisions without mutating history inputs", () => {
    const base = recordReviewDecision([], {
      itemId: "adaptation-honesty-tale",
      itemKind: "adaptation",
      decision: "approved",
      note: "نص أصلي واضح",
      reviewer: "tester",
      at: "2026-11-27T00:00:00.000Z",
    });
    assert.equal(base.length, 1);
    const replaced = recordReviewDecision(base, {
      itemId: "adaptation-honesty-tale",
      itemKind: "adaptation",
      decision: "changes_requested",
      note: "",
      reviewer: "tester",
      at: "2026-11-27T01:00:00.000Z",
    });
    assert.equal(replaced.length, 1, "latest decision replaces the previous one for the same item");
    assert.equal(decisionFor(replaced, "adaptation", "adaptation-honesty-tale")?.decision, "changes_requested");
    assert.equal(base[0].decision, "approved", "the input array is not mutated");
    const summary = summarizeReviewLog(replaced);
    assert.deepEqual(summary, { approved: 0, rejected: 0, changes_requested: 1 });
  });

  it("parses only well-formed entries and ignores junk", () => {
    assert.deepEqual(parseReviewLog(null), []);
    assert.deepEqual(parseReviewLog("not json"), []);
    assert.deepEqual(parseReviewLog("{}"), []);
    assert.deepEqual(
      parseReviewLog(
        JSON.stringify([
          { itemId: "a", itemKind: "media", decision: "approved", note: "", reviewer: "r", at: "t" },
          { itemId: "b", itemKind: "bogus", decision: "approved", at: "t" },
          { itemId: "c", itemKind: "media", decision: "maybe", at: "t" },
          "garbage",
        ]),
      ).length,
      1,
    );
  });

  it("uses a dedicated storage key so review data never mixes with progress", () => {
    assert.equal(REVIEW_LOG_STORAGE_KEY, "yra-review-log-v1");
  });
});
