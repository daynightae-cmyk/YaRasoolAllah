import assert from "node:assert/strict";
import test from "node:test";
import {
  availabilityLabel,
  availabilityState,
  categoryLabel,
  qualifiesForArchitecturalShelf,
  type CatalogDigitalEvidence,
} from "../client/src/visual-golden/services/library-catalog-presentation";

const textVersion: CatalogDigitalEvidence = {
  format: "TXT_MARKDOWN",
  rights: "CLEARED_WITH_ATTRIBUTION",
  reading: "CAN_IMPORT_TEXT",
  itemUrl: "https://example.test/item",
  fileUrl: "https://example.test/item.txt",
  iiifUrl: null,
  ocrAvailable: false,
  searchableText: true,
};

test("internal category values never become normal user labels", () => {
  assert.equal(categoryLabel("UNCLASSIFIED_OPENITI", "ar"), "غير مصنف بعد");
  assert.equal(categoryLabel("UNCLASSIFIED_OPENITI", "en"), "Not yet classified");
  assert.equal(categoryLabel("C-الحديث النبوي", "ar"), "الحديث النبوي");
  assert.equal(categoryLabel("C-الحديث النبوي", "en"), "Hadith");
  assert.equal(categoryLabel("UNKNOWN_MACHINE_ENUM", "ar"), "غير مصنف بعد");
});

test("availability labels are derived from version evidence with rights taking precedence", () => {
  assert.equal(availabilityState(textVersion, 1), "full_text");
  assert.equal(availabilityLabel("full_text", "ar"), "نص كامل متاح");
  assert.equal(
    availabilityState({ ...textVersion, format: "PDF", rights: "NEEDS_ITEM_LEVEL_REVIEW" }, 1),
    "rights_review",
  );
  assert.equal(availabilityState({ ...textVersion, format: "PDF", searchableText: false, reading: "EXTERNAL_READER_ONLY" }, 1), "pdf");
  assert.equal(availabilityState({ ...textVersion, iiifUrl: "https://example.test/manifest", searchableText: false, reading: "EXTERNAL_READER_ONLY" }, 1), "iiif");
  assert.equal(availabilityState({ ...textVersion, format: "OCR_TEXT", ocrAvailable: true }, 1), "ocr");
  assert.equal(availabilityState(null, 0), "metadata_only");
  assert.equal(availabilityState(null, 2), "digital_unavailable");
});

test("architectural shelf promotion requires complete scholarly display evidence", () => {
  const complete = {
    titleAr: "السيرة النبوية",
    titleEn: "Prophetic Biography",
    authorAr: "ابن هشام",
    authorEn: "Ibn Hisham",
    category: "seerah",
    sourceIds: ["src-openiti"],
    bibliographicStatus: "verified_bibliographic",
    versionCount: 1,
  };
  assert.equal(qualifiesForArchitecturalShelf(complete), true);
  assert.equal(qualifiesForArchitecturalShelf({ ...complete, authorAr: "" }), false);
  assert.equal(qualifiesForArchitecturalShelf({ ...complete, bibliographicStatus: "editorial_review_pending" }), false);
  assert.equal(qualifiesForArchitecturalShelf({ ...complete, versionCount: 0 }), false);
});
