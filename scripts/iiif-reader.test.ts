import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  clampManuscriptPage,
  clampManuscriptZoom,
  MANUSCRIPT_SOURCES,
  manuscriptKeyboardAction,
  manuscriptPageImage,
} from "../client/src/visual-golden/services/iiif";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const reader = read("client/src/visual-golden/components/library/ManuscriptReader.tsx");
const readerCss = read("client/src/visual-golden/components/library/ManuscriptReader.module.css");
const gallery = read("client/src/visual-golden/components/library/ManuscriptGallery.tsx");
const libraryPage = read("client/src/visual-golden/pages/LibraryPage.tsx");
const service = read("client/src/visual-golden/services/iiif.ts");

describe("manuscript source and pagination truth", () => {
  it("does not relabel last-known provider states as verified readers or catalog records", () => {
    const qdl = MANUSCRIPT_SOURCES.find((source) => source.id === "qdl-qnlhc-12933");
    const gallica = MANUSCRIPT_SOURCES.find((source) => source.id === "gallica-btv1b550076223");
    assert.equal(qdl?.state, "provider_blocked");
    assert.equal(qdl?.lastKnownUpstreamStatus, 403);
    assert.equal(gallica?.state, "live_check_required");
    assert.doesNotMatch(gallery, /verified_reader|تم التحقق الحي/);
    assert.match(gallery, /Live check on open/);
    assert.match(reader, /IiifServiceError/);
    assert.match(reader, /provider_blocked/);
  });

  it("clamps real canvas pagination and zoom bounds", () => {
    assert.equal(clampManuscriptPage(-4, 12), 0);
    assert.equal(clampManuscriptPage(3.8, 12), 3);
    assert.equal(clampManuscriptPage(30, 12), 11);
    assert.equal(clampManuscriptZoom(0.1), 0.7);
    assert.equal(clampManuscriptZoom(9), 2.6);
    assert.equal(clampManuscriptZoom(Number.NaN), 1);
    assert.match(reader, /load\.manifest\.canvases\[pageIndex\]/);
    assert.match(reader, /goToPage\(pageIndex [+-] 1\)/);
  });

  it("uses the normalized image service and raises its request size at high zoom", () => {
    const canvas = {
      imageService: "https://gallica.bnf.fr/iiif/image/info.json",
      imageUrl: "https://gallica.bnf.fr/iiif/image/full/1600,/0/default.jpg",
    };
    assert.equal(
      manuscriptPageImage(canvas, 1),
      "https://gallica.bnf.fr/iiif/image/full/1600,/0/default.jpg",
    );
    assert.equal(
      manuscriptPageImage(canvas, 2),
      "https://gallica.bnf.fr/iiif/image/full/2400,/0/default.jpg",
    );
    assert.equal(
      manuscriptPageImage({ imageUrl: canvas.imageUrl }, 2),
      canvas.imageUrl,
    );
  });

  it("maps previous, next, and zoom keyboard commands in both reading directions", () => {
    assert.equal(manuscriptKeyboardAction("ArrowLeft", "rtl"), "next");
    assert.equal(manuscriptKeyboardAction("ArrowRight", "rtl"), "previous");
    assert.equal(manuscriptKeyboardAction("ArrowRight", "ltr"), "next");
    assert.equal(manuscriptKeyboardAction("ArrowLeft", "ltr"), "previous");
    assert.equal(manuscriptKeyboardAction("PageDown", "ltr"), "next");
    assert.equal(manuscriptKeyboardAction("+", "ltr"), "zoom-in");
    assert.equal(manuscriptKeyboardAction("-", "ltr"), "zoom-out");
    assert.equal(manuscriptKeyboardAction("0", "ltr"), "zoom-reset");
    assert.match(reader, /isEditable\(event\.target\)/);
    assert.match(reader, /aria-keyshortcuts=/);
  });
});

describe("accessible manuscript dialog and mobile reader contract", () => {
  it("uses the native modal focus trap, restores focus, and locks background scroll", () => {
    assert.match(reader, /<dialog/);
    assert.match(reader, /dialog\.showModal\(\)/);
    assert.match(reader, /event\.key === "Tab"/);
    assert.match(reader, /const focusable =/);
    assert.match(reader, /document\.activeElement/);
    assert.match(reader, /opener\.focus\(\)/);
    assert.match(reader, /document\.body\.style\.overflow = "hidden"/);
    assert.match(reader, /document\.body\.style\.overflow = previousOverflow/);
    assert.match(reader, /onCancel=/);
    assert.match(readerCss, /\.reader::backdrop/);
  });

  it("supports drag panning, touch pointer capture, image failure, and reduced motion", () => {
    assert.match(reader, /setPointerCapture\(event\.pointerId\)/);
    assert.match(reader, /scrollLeft = pan\.left/);
    assert.match(reader, /scrollTop = pan\.top/);
    assert.match(reader, /touchAction: zoom > 1/);
    assert.match(reader, /draggable=\{false\}/);
    assert.match(reader, /onError=\{\(\) => setImageStatus\("error"\)\}/);
    assert.match(reader, /aria-live="polite"/);
    assert.match(readerCss, /prefers-reduced-motion: reduce/);
    assert.match(readerCss, /-webkit-overflow-scrolling: touch/);
  });

  it("is mounted surgically in the existing Library route", () => {
    assert.match(libraryPage, /<ManuscriptGallery onOpen=\{setManuscript\}/);
    assert.match(libraryPage, /<ManuscriptReader source=\{manuscript\}/);
    assert.match(libraryPage, /catalogCapabilityReport/);
  });

  it("addresses the governed endpoint through the native-aware API origin", () => {
    assert.match(service, /apiUrl\(`\/api\/content\/iiif\/manifest/);
    assert.doesNotMatch(service, /fetch\(`\/api\/content\/iiif\/manifest/);
  });
});
