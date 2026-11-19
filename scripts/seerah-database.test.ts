import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { art } from "../client/src/visual-golden/mock/art";
import { HADITH_DEVELOPMENT_SAMPLES } from "../client/src/data/hadithData";
import { UTHMANI_VERSES } from "../client/src/data/quranCorpus";
import {
  SEERAH_DATABASE,
  SEERAH_DATABASE_COUNTS,
  SEERAH_EVENTS,
  getSeerahEvent,
  getSeerahPerson,
  getSeerahPlace,
  getSeerahSource,
} from "../client/src/data/seerah";
import {
  SEERAH_DATABASE_STATS,
  auditSeerahDatabase,
  filterSeerahEvents,
  groupEventsByEra,
  hydrateSeerahEvent,
  hydrateSeerahEventById,
  normalizeSeerahSearch,
  resolveHadithRef,
  resolveQuranRef,
  resolveSeerahArtwork,
} from "../client/src/visual-golden/services/seerah-database";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const localSampleIds = new Set(HADITH_DEVELOPMENT_SAMPLES.map((sample) => sample.id));

describe("Seerah database coverage and identity", () => {
  it("contains a full birth-to-death arc at the promised scale", () => {
    assert.ok(SEERAH_DATABASE_COUNTS.events >= 90, `events: ${SEERAH_DATABASE_COUNTS.events}`);
    assert.ok(SEERAH_DATABASE_COUNTS.people >= 40, `people: ${SEERAH_DATABASE_COUNTS.people}`);
    assert.ok(SEERAH_DATABASE_COUNTS.places >= 20, `places: ${SEERAH_DATABASE_COUNTS.places}`);
    assert.equal(SEERAH_DATABASE_COUNTS.eras, 10);
    assert.equal(SEERAH_DATABASE_COUNTS.sources, 15);
    assert.ok(SEERAH_DATABASE_COUNTS.quranRefs >= 30);
    assert.ok(SEERAH_DATABASE_COUNTS.hadithRefs >= 8);
    assert.ok(SEERAH_DATABASE_COUNTS.eventsWithQuran >= 20);
    assert.ok(SEERAH_DATABASE_COUNTS.eventsWithHadith >= 6);
  });

  it("keeps every identifier unique", () => {
    for (const collection of [
      SEERAH_DATABASE.events,
      SEERAH_DATABASE.people,
      SEERAH_DATABASE.places,
      SEERAH_DATABASE.sources,
      SEERAH_DATABASE.eras,
    ]) {
      const ids = collection.map((record) => record.id);
      assert.equal(new Set(ids).size, ids.length, "duplicate id in collection");
    }
  });

  it("orders events continuously and starts before the birth, ending at the succession", () => {
    assert.equal(SEERAH_EVENTS[0]?.id, "lineage");
    assert.equal(SEERAH_EVENTS.at(-1)?.id, "usamah-army");
    SEERAH_EVENTS.forEach((event, index) => {
      assert.equal(event.order, index + 1, `order discontinuity at ${event.id}`);
    });
    const birth = getSeerahEvent("birth");
    const death = getSeerahEvent("prophet-death");
    assert.ok(birth && death);
    assert.ok(birth.order < death.order);
    assert.ok((birth.yearCE ?? 0) < (death.yearCE ?? 0));
  });

  it("marks every record and citation as pending review", () => {
    for (const event of SEERAH_DATABASE.events) {
      assert.equal(event.reviewStatus, "pending_review", event.id);
      assert.ok(event.summaryAr.trim().length > 20, event.id);
      assert.ok(event.sources.length > 0, event.id);
      for (const citation of event.sources) {
        assert.ok(citation.locusAr.trim().length > 0, event.id);
      }
    }
    for (const person of SEERAH_DATABASE.people) {
      assert.equal(person.reviewStatus, "pending_review", person.id);
    }
    for (const source of SEERAH_DATABASE.sources) {
      assert.equal(source.reviewStatus, "pending_review", source.id);
    }
  });
});

describe("Seerah database integrity is fail-closed", () => {
  it("reports no unresolved references, bad ids, or unknown visuals", () => {
    assert.deepEqual(auditSeerahDatabase(), []);
  });

  it("resolves every cross-reference to a real record", () => {
    for (const event of SEERAH_DATABASE.events) {
      if (event.placeId) assert.ok(getSeerahPlace(event.placeId), `${event.id}: ${event.placeId}`);
      for (const personId of event.peopleIds) {
        assert.ok(getSeerahPerson(personId), `${event.id}: ${personId}`);
      }
      for (const citation of event.sources) {
        assert.ok(getSeerahSource(citation.sourceId), `${event.id}: ${citation.sourceId}`);
      }
      assert.ok(event.visualKey in art, `${event.id}: ${event.visualKey}`);
    }
  });

  it("uses only Quran references that exist verbatim in the local Tanzil corpus", () => {
    for (const event of SEERAH_DATABASE.events) {
      for (const ref of event.quranRefs) {
        assert.ok(ref.surah >= 1 && ref.surah <= 114, event.id);
        assert.ok(ref.ayahStart >= 1 && ref.ayahEnd >= ref.ayahStart, event.id);
        const verses = resolveQuranRef(ref);
        assert.equal(verses.length, ref.ayahEnd - ref.ayahStart + 1, `${event.id} ${ref.surah}:${ref.ayahStart}-${ref.ayahEnd}`);
        for (const verse of verses) {
          assert.equal(verse.text, UTHMANI_VERSES[verse.key]);
          assert.ok(/[\u0600-\u06FF]/.test(verse.text), verse.key);
          assert.equal(verse.href, `/quran?surah=${ref.surah}&ayah=${verse.ayah}`);
        }
      }
    }
  });

  it("never invents hadith numbers or quoted text for external references", () => {
    for (const event of SEERAH_DATABASE.events) {
      for (const ref of event.hadithRefs) {
        if (ref.kind === "local_sample") {
          assert.ok(localSampleIds.has(ref.sampleId), `${event.id}: ${ref.sampleId}`);
          const resolved = resolveHadithRef(ref);
          assert.equal(resolved?.kind, "local_sample");
          if (resolved?.kind === "local_sample") {
            assert.ok(resolved.sample.textAr.length > 20);
          }
          continue;
        }
        assert.equal(ref.verification, "external_reference_only");
        assert.ok(getSeerahSource(ref.collectionId), `${event.id}: ${ref.collectionId}`);
        assert.ok(ref.bookNameAr.trim().length > 0);
        assert.ok(ref.chapterNameAr.trim().length > 0);
        assert.equal("hadithNumber" in ref, false);
        assert.equal("textAr" in ref, false);
        const resolved = resolveHadithRef(ref);
        assert.equal(resolved?.kind, "external_reference");
      }
    }
  });

  it("keeps every era populated and every event inside a known era", () => {
    const eraIds = new Set(SEERAH_DATABASE.eras.map((era) => era.id));
    for (const era of SEERAH_DATABASE.eras) {
      assert.ok(SEERAH_EVENTS.some((event) => event.eraId === era.id), era.id);
    }
    for (const event of SEERAH_EVENTS) {
      assert.ok(eraIds.has(event.eraId), event.id);
    }
  });
});

describe("Seerah database query and hydration layer", () => {
  it("filters by era, person, place, Quran, and hadith without changing source data", () => {
    const hijrah = filterSeerahEvents({ eraId: "hijrah" });
    assert.ok(hijrah.length >= 5);
    assert.ok(hijrah.every((event) => event.eraId === "hijrah"));

    const hamzah = filterSeerahEvents({ personId: "hamzah" });
    assert.ok(hamzah.some((event) => event.id === "uhud"));

    const badrPlace = filterSeerahEvents({ placeId: "badr" });
    assert.ok(badrPlace.some((event) => event.id === "badr"));

    const withQuran = filterSeerahEvents({ quranOnly: true });
    assert.ok(withQuran.length >= 20);
    assert.ok(withQuran.every((event) => event.quranRefs.length > 0));

    const withHadith = filterSeerahEvents({ hadithOnly: true });
    assert.ok(withHadith.every((event) => event.hadithRefs.length > 0));
  });

  it("searches Arabic with diacritics and alef variants normalized", () => {
    assert.equal(normalizeSeerahSearch("الْمَدِينَة"), normalizeSeerahSearch("المدينه"));
    assert.ok(filterSeerahEvents({ query: "بدر" }).some((event) => event.id === "badr"));
    assert.ok(filterSeerahEvents({ query: "خديجة" }).some((event) => event.id === "khadijah-death"));
    assert.ok(filterSeerahEvents({ query: "لا يوجد حدث بهذا الاسم" }).length === 0);
  });

  it("groups filtered events by canonical era order", () => {
    const groups = groupEventsByEra(filterSeerahEvents({}));
    assert.equal(groups.length, SEERAH_DATABASE.eras.length);
    for (let index = 1; index < groups.length; index += 1) {
      assert.ok(groups[index - 1].era.order < groups[index].era.order);
    }
  });

  it("hydrates Quran text, people, places, sources, and atlas links", () => {
    const conquest = hydrateSeerahEventById("mecca-conquest");
    assert.ok(conquest);
    assert.ok(conquest.quran.length >= 2);
    assert.ok(conquest.quran[0].verses[0].text.length > 0);
    assert.ok(conquest.people.some((person) => person.id === "bilal"));
    assert.ok(conquest.sources.every((entry) => entry.locusAr.length > 0));
    assert.equal(conquest.atlasHref, `/atlas?place=${encodeURIComponent("مكة المكرمة")}`);

    const brotherhood = hydrateSeerahEventById("brotherhood");
    assert.ok(brotherhood);
    assert.equal(brotherhood.hadith[0]?.kind, "local_sample");
    if (brotherhood.hadith[0]?.kind === "local_sample") {
      assert.ok(brotherhood.hadith[0].sample.textAr.includes("لا يؤمن أحدكم"));
    }

    const badr = hydrateSeerahEventById("badr");
    assert.ok(badr);
    const external = badr.hadith.find((ref) => ref.kind === "external_reference");
    assert.ok(external);
    if (external && external.kind === "external_reference") {
      assert.equal(external.verification, "external_reference_only");
      assert.equal("sample" in external, false);
    }
  });

  it("exposes stats that match recomputed records", () => {
    assert.equal(SEERAH_DATABASE_STATS.events, SEERAH_EVENTS.length);
    assert.equal(SEERAH_DATABASE_STATS.people, SEERAH_DATABASE.people.length);
    assert.equal(SEERAH_DATABASE_STATS.places, SEERAH_DATABASE.places.length);
    assert.equal(SEERAH_DATABASE_STATS.quranRefs, SEERAH_DATABASE_COUNTS.quranRefs);
    assert.ok(SEERAH_DATABASE_STATS.quranAyahs > SEERAH_DATABASE_STATS.quranRefs);
    assert.ok(SEERAH_DATABASE_STATS.peopleLinked >= 30);
    assert.ok(SEERAH_DATABASE_STATS.placesLinked >= 15);
  });

  it("links every event to bundled symbolic artwork without depicting persons", () => {
    for (const event of SEERAH_EVENTS) {
      const artHref = resolveSeerahArtwork(event.visualKey);
      assert.equal(artHref, art[event.visualKey as keyof typeof art], event.id);
      assert.ok(artHref.startsWith("/visual-golden/art/"), event.id);
      assert.equal(hydrateSeerahEvent(event).artHref, artHref, event.id);
    }
  });
});

describe("Seerah database surface stays wired to the product", () => {
  const app = read("client/src/App.tsx");
  const shell = read("client/src/visual-golden/lib/public-shell.ts");
  const seerahPage = read("client/src/visual-golden/pages/SeerahPage.tsx");
  const databasePage = read("client/src/visual-golden/pages/SeerahDatabasePage.tsx");
  const databaseStyles = read("client/src/visual-golden/pages/SeerahDatabasePage.module.css");

  it("registers the canonical public route and lazy page", () => {
    assert.ok(app.includes('path="/seerah/database"'));
    assert.ok(app.includes("VisualSeerahDatabasePage"));
    assert.ok(shell.includes('"/seerah/database"'));
    assert.ok(seerahPage.includes('href="/seerah/database"'));
  });

  it("renders filters, Quran text, hadith provenance, and review boundaries", () => {
    assert.ok(databasePage.includes("filterSeerahEvents"));
    assert.ok(databasePage.includes("hydrateSeerahEventById"));
    assert.ok(databasePage.includes("quranOnly"));
    assert.ok(databasePage.includes("hadithOnly"));
    assert.ok(databasePage.includes("verse.text"));
    assert.ok(databasePage.includes('ref.kind === "local_sample"'));
    assert.ok(databasePage.includes("إحالة كتابية فقط"));
    assert.ok(databasePage.includes("SEERAH_DATABASE_STATUS.noticeAr"));
    assert.ok(databasePage.includes('data-visual="seerah-database-art"'));
    assert.ok(databasePage.includes("resolveSeerahArtwork"));
    assert.ok(databaseStyles.includes(".timelinePane"));
    assert.ok(databaseStyles.includes(".eventArt"));
    assert.ok(databaseStyles.includes(".eventThumb"));
    assert.ok(databaseStyles.includes("@media"));
  });

  it("keeps the new surface out of the legacy AppLayout", () => {
    assert.equal(shell.includes('"/seerah/database"'), true);
    const block = app.slice(app.indexOf('path="/seerah/database"'), app.indexOf('path="/seerah"'));
    assert.ok(block.includes("VisualRoute"));
    assert.equal(block.includes("AppLayout"), false);
  });
});
