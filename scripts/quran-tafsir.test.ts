import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuranEncTafsirUrl,
  parseQuranEncMetadata,
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

test("QuranEnc metadata requires the named edition and preserves version fields", () => {
  const metadata = parseQuranEncMetadata({
    result: [{
      key: "arabic_moyassar",
      language_iso_code: "ar",
      version: 42,
      last_update: "2026-09-25",
      title: "التفسير الميسر",
    }],
  });
  assert.equal(metadata?.key, "arabic_moyassar");
  assert.equal(metadata?.version, "42");
  assert.equal(metadata?.last_update, "2026-09-25");
});
