import assert from "node:assert/strict";
import test from "node:test";
import {
  canDownloadInside,
  canReadPdfInside,
  canReadTextInside,
  canUseIiifInside,
  type CatalogWork,
} from "../client/src/visual-golden/services/catalog-library";

function work(overrides: Partial<CatalogWork> = {}): CatalogWork {
  return {
    id: "work-1",
    titleAr: "كتاب",
    titleEn: "Book",
    authorAr: "مؤلف",
    authorEn: "Author",
    deathHijri: null,
    category: "J-الفقه",
    subcategory: "العبادات",
    language: "ara",
    status: "VERIFIED",
    source: "OpenITI",
    sourceUrl: "https://example.test/source",
    openitiUri: "0001Author.Book",
    editionCount: 1,
    versionCount: 1,
    digital: {
      id: "dv-1",
      provider: "OpenITI",
      itemUrl: "https://example.test/item",
      fileUrl: "https://example.test/book.txt",
      iiifUrl: null,
      format: "TXT_MARKDOWN",
      rights: "CLEARED_WITH_ATTRIBUTION",
      download: "DIRECT_DOWNLOAD",
      reading: "CAN_IMPORT_TEXT",
      ocrAvailable: false,
      searchableText: true,
    },
    ...overrides,
  };
}

test("cleared structured text opens inside the platform", () => {
  assert.equal(canReadTextInside(work()), true);
});

test("rights review prevents internal full-text publication", () => {
  const candidate = work({
    digital: {
      ...work().digital!,
      rights: "NEEDS_ITEM_LEVEL_REVIEW",
    },
  });
  assert.equal(canReadTextInside(candidate), false);
  assert.equal(canDownloadInside(candidate), false);
});

test("cleared PDF and IIIF resources have internal modes", () => {
  assert.equal(
    canReadPdfInside(work({ digital: { ...work().digital!, format: "PDF" } })),
    true,
  );
  assert.equal(
    canUseIiifInside(work({ digital: { ...work().digital!, iiifUrl: "https://example.test/manifest" } })),
    true,
  );
});

test("download is shown only when the governed resource permits it", () => {
  assert.equal(canDownloadInside(work()), true);
  assert.equal(
    canDownloadInside(work({ digital: { ...work().digital!, download: "BLOCKED_PENDING_REVIEW" } })),
    false,
  );
});
