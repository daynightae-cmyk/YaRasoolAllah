import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canReadTextInside,
  type CatalogPayload,
} from "../client/src/visual-golden/services/catalog-library";
import {
  buildLibraryHallShelves,
  hallForCategory,
  LIBRARY_HALLS,
} from "../client/src/visual-golden/services/library-3d";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(repoRoot, "client/public/data/library-catalog.v1.json"), "utf8"),
) as CatalogPayload;

const shelves = buildLibraryHallShelves(catalog.works);

describe("the walkable Library only shelves books the reader can open", () => {
  it("maps every catalog category to one of the ten halls", () => {
    const categories = new Set(
      catalog.works.map((work) => work.category).filter(Boolean) as string[],
    );
    for (const category of categories) {
      const hall = hallForCategory(category);
      assert.ok(
        LIBRARY_HALLS.some((candidate) => candidate.key === hall.key),
        `category ${category} did not resolve to a declared hall`,
      );
    }
  });

  it("keeps the four named wings on their own shelves", () => {
    assert.equal(hallForCategory("A-القرآن وعلومه").key, "quran");
    assert.equal(hallForCategory("C-الحديث النبوي").key, "hadith");
    assert.equal(hallForCategory("D-السيرة النبوية").key, "seerah");
    assert.equal(hallForCategory("P-اللغة العربية").key, "arabic");
  });

  it("falls back to the open corpus for an unknown machine category", () => {
    assert.equal(hallForCategory("UNKNOWN_MACHINE_ENUM").key, "openiti");
    assert.equal(hallForCategory(null).key, "openiti");
  });

  it("places only readable, titled works on the shelves", () => {
    for (const shelf of shelves) {
      for (const work of shelf.works) {
        assert.ok(canReadTextInside(work), `${work.id} is not readable`);
        assert.ok(work.titleAr || work.titleEn, `${work.id} has no title`);
      }
    }
  });

  it("never duplicates a work inside a hall or reuses a work across halls", () => {
    const seen = new Set<string>();
    for (const shelf of shelves) {
      const local = new Set<string>();
      for (const work of shelf.works) {
        assert.ok(!local.has(work.id), `${work.id} repeated inside ${shelf.hall.key}`);
        assert.ok(!seen.has(work.id), `${work.id} shelved in more than one hall`);
        local.add(work.id);
        seen.add(work.id);
      }
    }
  });

  it("shelves a deterministic selection without inventing books for empty halls", () => {
    const again = buildLibraryHallShelves(catalog.works);
    assert.equal(shelves.length, LIBRARY_HALLS.length);
    assert.ok(
      shelves.some((shelf) => shelf.works.length > 0),
      "the governed registry must contribute at least one shelfable work",
    );
    for (let index = 0; index < shelves.length; index += 1) {
      const shelf = shelves[index];
      assert.ok(shelf.works.length <= 90, `${shelf.hall.key} exceeds the shelf budget`);
      assert.ok(shelf.total >= shelf.works.length);
      assert.equal(
        shelf.works.length === 0,
        shelf.total === 0,
        `${shelf.hall.key} must not model a book without a governed total`,
      );
      assert.deepEqual(
        shelf.works.map((work) => work.id),
        again[index].works.map((work) => work.id),
        `${shelf.hall.key} selection changed between builds`,
      );
    }
  });

  it("accounts for every readable catalog work in a hall total", () => {
    const readable = catalog.works.filter(canReadTextInside).length;
    const accounted = shelves.reduce((sum, shelf) => sum + shelf.total, 0);
    assert.equal(accounted, readable);
  });
});
