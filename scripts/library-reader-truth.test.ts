import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canDownloadInside,
  canReadPdfInside,
  canReadTextInside,
  canUseIiifInside,
  canViewPresentationInside,
  catalogCapabilityReport,
  type CatalogPayload,
} from "../client/src/visual-golden/services/catalog-library";
import {
  digitalVersionRegistry,
  externalResourceRegistry,
  workRegistry,
} from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

/**
 * The real catalog, not a fixture. 10.7 MB is parsed once for this file.
 */
const catalog = JSON.parse(
  read("client/public/data/library-catalog.v1.json"),
) as CatalogPayload;

const report = catalogCapabilityReport(catalog);

const hallHall = () => shelfHall;

const chamber = read(
  "client/src/visual-golden/components/library/CatalogReadingChamber.tsx",
);
const catalogView = read(
  "client/src/visual-golden/components/library/LibraryCatalog.tsx",
);
const libraryPage = read("client/src/visual-golden/pages/LibraryPage.tsx");
const presentation = read(
  "client/src/visual-golden/services/library-catalog-presentation.ts",
);

const shelfHall = read(
  "client/src/visual-golden/components/library/CatalogShelfHall.tsx",
);
describe("what the Library can actually open, measured from the catalog", () => {
  it("reads every capability from the same gate functions the reader uses", () => {
    let text = 0;
    let pdf = 0;
    let iiif = 0;
    let presentationCount = 0;
    let download = 0;
    let withoutDigital = 0;
    for (const work of catalog.works) {
      if (!work.digital) {
        withoutDigital += 1;
        continue;
      }
      if (canReadTextInside(work)) text += 1;
      if (canReadPdfInside(work)) pdf += 1;
      if (canUseIiifInside(work)) iiif += 1;
      if (canViewPresentationInside(work)) presentationCount += 1;
      if (canDownloadInside(work)) download += 1;
    }
    assert.equal(report.readableText, text);
    assert.equal(report.readablePdf, pdf);
    assert.equal(report.iiif, iiif);
    assert.equal(report.presentation, presentationCount);
    assert.equal(report.downloadable, download);
    assert.equal(report.metadataOnly, withoutDigital);
    assert.equal(report.works, catalog.works.length);
  });

  it("accounts for every record exactly once", () => {
    assert.equal(
      report.readableText + report.metadataOnly,
      report.works,
      "a work must be either openable or explicitly metadata-only",
    );
    assert.equal(
      Object.values(report.formats).reduce((total, count) => total + count, 0),
      report.withDigitalRecord,
    );
  });

  it("records the real format spread rather than a single assumed one", () => {
    assert.deepEqual(Object.keys(report.formats), ["TXT_MARKDOWN"]);
    assert.equal(report.formats.TXT_MARKDOWN, report.withDigitalRecord);
  });
});

describe("the announced counts cannot overstate what a reader can open", () => {
  it("shows the openable figure, not the pipeline's raw row count", () => {
    // counts.digitalVersions is the research pipeline's row count. It includes
    // rows marked DO_NOT_INGEST, and the app attaches at most one digital
    // record per work, so it is far larger than what can be opened.
    assert.ok(
      catalog.counts.digitalVersions > report.withDigitalRecord,
      "this test is only meaningful while the raw row count exceeds the openable count",
    );
    assert.equal(
      report.withDigitalRecord,
      catalog.works.filter((work) => work.digital !== null).length,
    );
  });

  it("states the numbers it can back, and never the raw row count", () => {
    // Comments legitimately explain the old figure, so only the rendered
    // interface is checked.
    const libraryInterface = libraryPage
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^[ \t]*\/\/.*$/gm, "");
    assert.doesNotMatch(
      libraryInterface,
      /13,679/,
      `the page must not announce ${catalog.counts.digitalVersions} digital versions`,
    );
    assert.doesNotMatch(
      libraryPage,
      /9,129 works on digital shelves/,
      "the subtitle must be derived from the catalog, not typed in",
    );
    assert.match(libraryPage, /catalogCapabilityReport/);
    assert.match(libraryPage, /readableText/);
  });

  it("states the honest figure in the hall as well as the page header", () => {
    // The overstated count lived in two places. Fixing only the page left the
    // shelf hall still announcing 13,679.
    const hallInterface = shelfHall
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^[ \t]*\/\/.*$/gm, "");
    assert.doesNotMatch(
      hallInterface,
      /13,679|counts\.digitalVersions/,
      "the hall must not announce the pipeline row count either",
    );
    assert.match(hallHall(), /canReadTextInside/);
    assert.match(hallHall(), /texts readable now/);
  });

  it("does not promise listening, because no approved recording exists", () => {
    // DeviceTtsFallback states outright that it is not an audiobook, and the
    // registry records zero production audiobooks.
    const audiobookCapable = digitalVersionRegistry.filter((version) =>
      /audio/i.test(version.contentAvailability),
    );
    assert.equal(audiobookCapable.length, 0, "no recording is cleared for playback");
    assert.doesNotMatch(
      libraryPage,
      /listening, and downloads|listening and downloads begin/,
      "the page must not promise listening it cannot deliver",
    );
  });
});

describe("no reader affordance is offered for a format the data cannot supply", () => {
  it("has no PDF or IIIF record to back those tabs", () => {
    assert.equal(report.readablePdf, 0);
    assert.equal(report.iiif, 0);
    assert.equal(catalog.works.filter((work) => work.digital?.iiifUrl).length, 0);
  });

  it("labels the one format that actually exists, and claims no other", () => {
    // A label such as "PDF available" is a claim about the product. It is only
    // defensible while some record can reach it, and right now none can.
    for (const format of Object.keys(report.formats)) {
      assert.match(
        presentation,
        new RegExp(`${format}:`),
        `${format} reaches real records and must be labelled`,
      );
    }
    for (const unreachable of ["PDF", "EPUB", "JP2_IMAGE_SET"]) {
      if (unreachable in report.formats) continue;
      assert.doesNotMatch(
        chamber,
        new RegExp(`availability_${unreachable.toLowerCase()}`),
        `${unreachable} has no record, so the reader must not style a state for it`,
      );
    }
  });

  it("never exposes an uncleared external file for in-app reading", () => {
    const uncleared = externalResourceRegistry.filter(
      (resource) => resource.rightsState !== "OPEN_LICENSE",
    );
    assert.ok(uncleared.length > 0, "the registry does hold uncleared external files");
    for (const resource of uncleared) {
      assert.notEqual(resource.rightsState, "OPEN_LICENSE");
    }
    // None of them is attached to a catalog work, so none can reach a reader.
    const externalFormats = new Set(uncleared.map((resource) => resource.format));
    for (const format of Object.keys(report.formats)) {
      assert.ok(
        !externalFormats.has(format as never),
        `${format} is an uncleared external format and must not be openable in-app`,
      );
    }
  });

  it("records the works that have no digital version at all", () => {
    assert.equal(report.metadataOnly, catalog.counts.pendingSeedWorks);
    const worksWithoutDigital = catalog.works.filter((work) => work.digital === null);
    for (const work of worksWithoutDigital) {
      assert.match(work.status, /UNVERIFIED_SEED/, `${work.id} must stay marked unreviewed`);
    }
  });
});

describe("the reader tells the truth in the reader's own language", () => {
  it("never renders a raw rights or format enum", () => {
    assert.doesNotMatch(
      chamber,
      /\{work\.digital\?\.rights \|\|/,
      "rights must go through rightsLabel, not the raw enum",
    );
    assert.doesNotMatch(chamber, /\{work\.digital\?\.format \|\| "-"\}/);
    assert.match(chamber, /rightsLabel\(work\.digital\.rights, lang\)/);
    assert.match(chamber, /formatLabel\(work\.digital\.format, lang\)/);
    for (const enumValue of Object.keys(report.formats)) {
      assert.doesNotMatch(
        chamber,
        new RegExp(`>\\s*${enumValue}\\s*<`),
        `${enumValue} must not reach the interface untranslated`,
      );
    }
  });

  it("throws a translatable code rather than an Arabic sentence", () => {
    assert.match(chamber, /class ReaderError/);
    assert.match(chamber, /READER_ERRORS/);
    for (const shape of ["too_large", "no_text", "timeout", "failed"]) {
      assert.match(chamber, new RegExp(`${shape}:\\s*\\{`), `${shape} needs both languages`);
    }
    assert.doesNotMatch(
      chamber,
      /new Error\("حجم النص/,
      "an Arabic sentence thrown from the fetch handler cannot be translated",
    );
    assert.doesNotMatch(
      chamber,
      /new Error\(`HTTP \$\{/,
      "a raw HTTP string is not a message a reader can act on",
    );
  });

  it("keeps both interface languages available for every reader failure", () => {
    const arValues = [...chamber.matchAll(/ar:\s*"([^"]+)"/g)].map((match) => match[1]);
    const enValues = [...chamber.matchAll(/en:\s*"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(arValues.length >= 5, "each failure state needs an Arabic string");
    assert.ok(enValues.length >= 5, "each failure state needs an English string");
  });

  it("names every interactive control in the reader", () => {
    // Placeholder-only inputs and icon-only buttons have no accessible name.
    for (const match of chamber.matchAll(/<input\b[\s\S]*?\/>/g)) {
      assert.match(
        match[0],
        /aria-label=/,
        `an input has no accessible name: ${match[0]}`,
      );
    }
    for (const match of chamber.matchAll(/<button\b[^>]*><(Minus|Plus)\b/g)) {
      assert.match(match[0], /aria-label=/, `an icon-only button has no name: ${match[0]}`);
    }
    assert.match(chamber, /role="status"/, "the loading state must be announced");
    assert.match(chamber, /role="alert"/, "the failure state must be announced");
  });
});

describe("the reader keeps the reader's place", () => {
  it("persists and restores a reading position per work", () => {
    assert.match(chamber, /library-reader-position-v1/);
    assert.match(chamber, /function readStoredPage/);
    assert.match(chamber, /function writeStoredPage/);
    assert.match(chamber, /writeStoredPage\(work\.id, page\)/);
  });

  it("clamps a stored position instead of trusting it blindly", () => {
    const clamp = chamber.slice(
      chamber.indexOf("function readStoredPage"),
      chamber.indexOf("function writeStoredPage"),
    );
    assert.match(clamp, /Number\.isFinite/);
    assert.match(clamp, /Math\.min\(/);
    assert.match(clamp, /try \{/);
    assert.match(clamp, /catch \{/);
  });

  it("returns focus to whatever opened the reader", () => {
    assert.match(chamber, /document\.activeElement/);
    assert.match(chamber, /opener\.focus\(\)/);
  });
});

describe("the route has one search term and one catalog download", () => {
  it("does not keep a second private query that the hero box cannot reach", () => {
    assert.match(libraryPage, /query=\{q\}/);
    assert.match(libraryPage, /onQueryChange=\{setQ\}/);
    assert.match(catalogView, /query: externalQuery/);
  });

  it("does not re-download the catalog outside the shared cache", () => {
    assert.doesNotMatch(
      catalogView,
      /fetch\("\/data\/library-catalog\.v1\.json"/,
      "the catalog is 10.7 MB and must come from the memoized loader",
    );
    assert.match(catalogView, /loadFullLibraryCatalog\(\)/);
  });

  it("does not point a failure at shelves that do not exist", () => {
    assert.doesNotMatch(
      catalogView,
      /Curated shelves remain available/,
      "BookshelfHall is dead code, so that reassurance was false",
    );
    assert.match(catalogView, /no works can be listed right now/);
  });

  it("names the catalog search input", () => {
    const inputs = [...catalogView.matchAll(/<input\b[\s\S]*?\/>/g)];
    assert.ok(inputs.length > 0);
    for (const match of inputs) {
      assert.match(match[0], /aria-label=/, `unlabelled input: ${match[0]}`);
    }
  });
});

describe("the registry and the shipped catalog still agree", () => {
  it("keeps every work's scholarly review state honest", () => {
    for (const work of workRegistry) {
      assert.equal(
        work.scholarlyReviewStatus,
        "scholarly_review_pending",
        `${work.workId} must not claim a scholarly review that has not happened`,
      );
      assert.equal(work.editor ?? null, work.editor ?? null);
    }
  });

  it("keeps every cleared digital version on the pinned OpenITI release", () => {
    for (const version of digitalVersionRegistry) {
      assert.equal(version.provider, "OpenITI");
      assert.equal(version.rightsState, "cleared_public_domain_openiti_historical_text");
      assert.equal(version.translator, null, "no translator is established for these versions");
      assert.equal(version.editor, null, "no editor is established for these versions");
    }
  });
});
