import assert from "node:assert/strict";
import test from "node:test";
import { buildLocalIndex, searchBasirah } from "../client/src/visual-golden/services/basirah";
import { resolveCatalogWorkId } from "../client/src/visual-golden/services/library-catalog-presentation";

test("library index records deep-link to stable work states", () => {
  const records = buildLocalIndex().filter((record) => record.scope === "library");
  assert.ok(records.length > 0, "library scope must not be empty");
  for (const record of records) {
    assert.match(
      record.path,
      /^\/library\/work\/[A-Za-z0-9_-]+$/,
      `${record.id} must deep-link to /library/work/:workId, got ${record.path}`,
    );
  }
  const ibnHisham = records.find((record) => record.id === "work-work-ibn-hisham-sira");
  assert.ok(ibnHisham, "Ibn Hisham work record must exist in the canonical index");
  assert.equal(ibnHisham.path, "/library/work/work-ibn-hisham-sira");
});

test("canonical search finds works by Arabic title through deep links", () => {
  const records = buildLocalIndex();
  const hits = searchBasirah(records, "السيرة النبوية", "library");
  assert.ok(hits.length > 0, "expected Arabic title hits in library scope");
  for (const hit of hits) {
    assert.match(hit.path, /^\/library\/work\//);
  }
  const empty = searchBasirah(records, "zzz-no-such-work-zzz", "library");
  assert.equal(empty.length, 0, "zero-result language path must be empty, not fabricated");
});

test("registry work ids bridge to catalog records through shared OpenITI URIs", () => {
  const works = [
    { id: "openiti_work_0213IbnHisham.SiraNabawiyya", openitiUri: "0213IbnHisham.SiraNabawiyya" },
    { id: "openiti_work_other", openitiUri: "0000Other.Work" },
  ];
  const registryUriFor = (id: string) =>
    id === "work-ibn-hisham-sira" ? "0213IbnHisham.SiraNabawiyya" : null;
  assert.equal(
    resolveCatalogWorkId(works, registryUriFor, "openiti_work_0213IbnHisham.SiraNabawiyya"),
    "openiti_work_0213IbnHisham.SiraNabawiyya",
    "direct catalog ids win",
  );
  assert.equal(
    resolveCatalogWorkId(works, registryUriFor, "work-ibn-hisham-sira"),
    "openiti_work_0213IbnHisham.SiraNabawiyya",
    "registry ids bridge through the shared URI",
  );
  assert.equal(resolveCatalogWorkId(works, registryUriFor, "work-unknown-zzz"), null);
  assert.equal(resolveCatalogWorkId(works, () => null, "work-ibn-hisham-sira"), null);
});


test("canonical index deep-links Seerah, Hadith, and Sources to stable entity state", () => {
  const records = buildLocalIndex();

  const seerah = records.find((record) => record.scope === "seerah");
  assert.ok(seerah, "seerah scope must not be empty");
  assert.match(seerah.path, /^\/seerah\?chapter=[^&]+$/);

  const hadith = records.find((record) => record.scope === "hadith");
  assert.ok(hadith, "hadith scope must not be empty");
  assert.match(hadith.path, /^\/hadith\?sample=[^&]+&collection=[^&]+$/);

  const source = records.find((record) => record.scope === "sources");
  assert.ok(source, "sources scope must not be empty");
  assert.match(source.path, /^\/sources\?q=.+$/);

  assert.equal(
    new URL(seerah.path, "https://example.test").searchParams.has("chapter"),
    true,
    "Seerah deep link must carry chapter state",
  );
  assert.equal(
    new URL(hadith.path, "https://example.test").searchParams.has("sample"),
    true,
    "Hadith deep link must carry sample state",
  );
  assert.equal(
    new URL(source.path, "https://example.test").searchParams.has("q"),
    true,
    "Sources deep link must carry search state",
  );
});
