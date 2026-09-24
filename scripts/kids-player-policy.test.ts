import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const room = readFileSync("client/src/visual-golden/components/kids-tv/KidsTVRoom.tsx", "utf8");
const player = readFileSync("client/src/visual-golden/components/kids-tv/providers/YouTubePlayer.tsx", "utf8");
const css = readFileSync("client/src/visual-golden/components/kids-tv/KidsTVRoom.module.css", "utf8");
const catalog = readFileSync("client/src/visual-golden/services/kids-media/catalog.ts", "utf8");

test("kids tv does not auto-advance after a video ends", () => {
  assert.doesNotMatch(room, /if \(next === "ended"\)[\s\S]{0,180}changeBy\(1/);
  assert.match(room, /لن ننتقل تلقائيًا/);
  assert.match(room, /لا يوجد تشغيل تلقائي/);
});

test("active YouTube viewport is not covered by theatre chrome", () => {
  assert.match(room, /playerViewportActive/);
  assert.match(room, /showCurtains = !playerViewportActive/);
  assert.match(room, /showPoster = !playerViewportActive/);
  assert.match(css, /data-player-active="true"\]::after/);
  assert.match(player, /controls:\s*1/);
  assert.doesNotMatch(player, /controls:\s*0/);
});

test("public kids catalog contains only records emitted by the approval pipeline", () => {
  assert.match(catalog, /KIDS_VIDEO_CATALOG: KidsVideo\[\] = APPROVED_YOUTUBE_KIDS_VIDEOS/);
  assert.doesNotMatch(catalog, /CURATED_SEED_VIDEOS|providerVideoId:\s*["']/);
});
