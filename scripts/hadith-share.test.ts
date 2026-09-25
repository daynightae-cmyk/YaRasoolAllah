import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_SAMPLES,
  buildHadithDeepLink,
  buildHadithShareText,
  getCollection,
} from "../client/src/visual-golden/services/hadith";

test("hadith share text stays honest about the development sample", () => {
  const sample = LOCAL_SAMPLES[0];
  assert.ok(sample, "expected at least one local development sample");
  const collection = getCollection(sample.collectionId);
  assert.ok(collection, "sample must reference a known collection");
  const text = buildHadithShareText(sample, collection.nameAr);
  assert.ok(text.includes(sample.textAr), "share text must carry the recorded matn verbatim");
  assert.ok(text.includes(sample.gradeSource), "share text must name the grade source");
  assert.ok(text.includes("عينة تطوير"), "share text must label the record as a development sample");
  assert.ok(text.includes("قيد المراجعة"), "share text must disclose the pending review state");
  assert.ok(!text.includes("متحقق"), "share text must never claim verification");
  assert.ok(!text.toLowerCase().includes("verified"), "share text must never claim verification in English");
});

test("hadith deep links only reopen governed local records", () => {
  const sample = LOCAL_SAMPLES[0];
  assert.ok(sample, "expected at least one local development sample");
  const link = buildHadithDeepLink(sample.id, sample.collectionId);
  assert.ok(link.startsWith("/hadith?"), "known sample must deep-link into the archive");
  assert.ok(link.includes(`sample=${encodeURIComponent(sample.id)}`), "deep link must carry the sample id");
  assert.equal(buildHadithDeepLink("no-such-sample", "all"), "/hadith");
});
