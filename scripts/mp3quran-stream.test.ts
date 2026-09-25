import assert from "node:assert/strict";
import test from "node:test";
import { buildMp3QuranStreamUrl } from "../server/mp3quran-catalog";

test("MP3Quran stream builder pins audio to provider HTTPS hosts", () => {
  assert.equal(
    buildMp3QuranStreamUrl("https://server6.mp3quran.net/akdr/", 1),
    "https://server6.mp3quran.net/akdr/001.mp3",
  );
  assert.equal(
    buildMp3QuranStreamUrl("https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/", 114),
    "https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/114.mp3",
  );
});

test("MP3Quran stream builder rejects non-provider and non-HTTPS origins", () => {
  assert.equal(buildMp3QuranStreamUrl("http://server6.mp3quran.net/akdr/", 1), null);
  assert.equal(buildMp3QuranStreamUrl("https://example.com/audio/", 1), null);
  assert.equal(buildMp3QuranStreamUrl("not-a-url", 1), null);
});
