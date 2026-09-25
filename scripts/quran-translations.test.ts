import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTranslationRequestUrl,
  QURAN_TRANSLATION_EDITIONS,
} from "../server/quran-translations";

test("Quran translation proxy pins supported editions to HTTPS AlQuran Cloud", () => {
  assert.equal(
    buildTranslationRequestUrl(1, "en"),
    "https://api.alquran.cloud/v1/surah/1/en.sahih",
  );
  assert.equal(
    buildTranslationRequestUrl(114, "fr"),
    "https://api.alquran.cloud/v1/surah/114/fr.hamidullah",
  );
  assert.equal(
    buildTranslationRequestUrl(2, "ur"),
    "https://api.alquran.cloud/v1/surah/2/ur.jalandhry",
  );
  assert.equal(QURAN_TRANSLATION_EDITIONS.ur.direction, "rtl");
});

test("Quran translation proxy rejects invalid surah numbers", () => {
  assert.equal(buildTranslationRequestUrl(0, "en"), null);
  assert.equal(buildTranslationRequestUrl(115, "en"), null);
  assert.equal(buildTranslationRequestUrl(1.5, "en"), null);
});
