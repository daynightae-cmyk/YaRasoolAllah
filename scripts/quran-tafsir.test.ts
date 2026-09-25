import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuranEncTafsirUrl,
  parseQuranEncTafsirPayload,
} from "../server/quran-tafsir";

test("QuranEnc tafsir URL is pinned to the Arabic Muyassar edition", () => {
  assert.equal(
    buildQuranEncTafsirUrl(1),
    "https://quranenc.com/api/v1/translation/sura/arabic_moyassar/1",
  );
  assert.equal(buildQuranEncTafsirUrl(0), null);
  assert.equal(buildQuranEncTafsirUrl(115), null);
  assert.equal(buildQuranEncTafsirUrl(1.5), null);
});

test("QuranEnc tafsir parser accepts direct and result-wrapped API shapes", () => {
  const row = { sura: "1", aya: "1", translation: "تفسير موثق", footnotes: null };
  assert.equal(parseQuranEncTafsirPayload([row])?.[0]?.aya, 1);
  assert.equal(parseQuranEncTafsirPayload({ result: [row] })?.[0]?.translation, "تفسير موثق");
});
