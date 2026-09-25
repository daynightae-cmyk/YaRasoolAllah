import assert from "node:assert/strict";
import test from "node:test";
import {
  externalResourceRegistry,
  getExternalResourcesForWork,
  workRegistry,
} from "../shared/knowledge-registry";

const ALLOWED_PROVIDERS = new Set(["InternetArchive", "Perseus", "OPenn"]);
const ALLOWED_FORMATS = new Set(["PDF", "EPUB", "TXT", "TEI", "SCAN", "ITEM_PAGE"]);
const ALLOWED_RIGHTS = new Set(["RIGHTS_UNCLEAR", "UNKNOWN", "OPEN_LICENSE"]);

test("external resources use stable unique ids and https item urls", () => {
  const ids = externalResourceRegistry.map((item) => item.resourceId);
  assert.equal(new Set(ids).size, ids.length, "duplicate external resource ids");
  for (const item of externalResourceRegistry) {
    assert.ok(item.itemUrl.startsWith("https://"), `${item.resourceId} item url must be https`);
    if (item.fileUrl) assert.ok(item.fileUrl.startsWith("https://"), `${item.resourceId} file url must be https`);
  }
});

test("external resources reference real registry works and governed value sets", () => {
  const knownWorks = new Set(workRegistry.map((work) => work.workId));
  for (const item of externalResourceRegistry) {
    assert.ok(knownWorks.has(item.workId), `${item.resourceId} references missing work ${item.workId}`);
    assert.ok(ALLOWED_PROVIDERS.has(item.provider), `${item.resourceId} has ungoverned provider`);
    assert.ok(ALLOWED_FORMATS.has(item.format), `${item.resourceId} has ungoverned format`);
    assert.ok(ALLOWED_RIGHTS.has(item.rightsState), `${item.resourceId} has ungoverned rights state`);
    assert.ok(item.editionStatement.trim().length > 0, `${item.resourceId} needs an edition statement`);
    assert.ok(item.rightsNote.trim().length > 0, `${item.resourceId} needs a rights note`);
  }
});

test("external resources never grant in-app reading or approval", () => {
  for (const item of externalResourceRegistry) {
    assert.notEqual(
      item.rightsState,
      "cleared_public_domain_openiti_historical_text",
      `${item.resourceId} must not borrow the cleared OpenITI rights state`,
    );
  }
  const ibnHisham = getExternalResourcesForWork("work-ibn-hisham-sira");
  assert.ok(ibnHisham.length > 0, "Ibn Hisham work must expose its verified external resources");
  assert.ok(
    ibnHisham.every((item) => item.workId === "work-ibn-hisham-sira"),
    "helper must scope resources to the requested work",
  );
});
