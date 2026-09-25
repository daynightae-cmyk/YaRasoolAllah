import assert from "node:assert/strict";
import test from "node:test";
import { reconstructContentApiUrl } from "../api/public";

test("Vercel public-content bridge restores the original API path and query", () => {
  assert.equal(
    reconstructContentApiUrl("/api/public?__content_path=quran%2Ftranslations&surah=1&language=en"),
    "/api/content/quran/translations?surah=1&language=en",
  );
  assert.equal(
    reconstructContentApiUrl("/api/public?__content_path=audio%2Freciters&sura=114"),
    "/api/content/audio/reciters?sura=114",
  );
});

test("Vercel public-content bridge rejects empty and traversal paths", () => {
  assert.equal(reconstructContentApiUrl("/api/public"), null);
  assert.equal(reconstructContentApiUrl("/api/public?__content_path=../secret"), null);
});
