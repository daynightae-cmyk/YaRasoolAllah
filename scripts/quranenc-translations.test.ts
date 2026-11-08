import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuranEncSuraUrl,
  QURANENC_TRANSLATIONS,
} from "../server/quranenc-translations";

test("QuranEnc English and Urdu editions are pinned with visible versions", () => {
  assert.equal(QURANENC_TRANSLATIONS.english_rwwad.version, "1.0.19");
  assert.equal(QURANENC_TRANSLATIONS.urdu_junagarhi.version, "1.1.3");
  assert.equal(QURANENC_TRANSLATIONS.urdu_junagarhi.direction, "rtl");
});

test("QuranEnc requests stay on the official HTTPS API and valid surahs", () => {
  assert.equal(
    buildQuranEncSuraUrl("english_rwwad", 1),
    "https://quranenc.com/api/v1/translation/sura/english_rwwad/1",
  );
  assert.equal(
    buildQuranEncSuraUrl("urdu_junagarhi", 114),
    "https://quranenc.com/api/v1/translation/sura/urdu_junagarhi/114",
  );
  assert.throws(() => buildQuranEncSuraUrl("english_rwwad", 0));
  assert.throws(() => buildQuranEncSuraUrl("urdu_junagarhi", 115));
});
