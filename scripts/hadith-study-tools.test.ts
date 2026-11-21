/**
 * Hadith archive study tools & established cross-links — directive §4.F.
 *
 * Cross-links to Seerah/Quran must come ONLY from governed data relationships
 * (Seerah event hadithRefs citing the sample, or recorded related* fields) —
 * never inferred from topic similarity. Notes persist locally and carry the
 * record's governed identity. Reference search uses real registry numbers.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { establishedSeerahLinks, searchSamples, LOCAL_SAMPLES } from "../client/src/visual-golden/services/hadith";
import { SEERAH_EVENTS } from "../client/src/data/seerah";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("hadith archive study tools", () => {
  const page = read("client/src/visual-golden/pages/HadithPage.tsx");
  const css = read("client/src/visual-golden/pages/HadithPage.module.css");

  it("cross-links derive only from established Seerah hadithRefs", () => {
    // bukhari-1 is cited by a real governed Seerah event.
    const links = establishedSeerahLinks("bukhari-1");
    assert.ok(links.length > 0, "bukhari-1 must have at least one established link");
    for (const link of links) {
      const event = SEERAH_EVENTS.find((e) => e.id === link.eventId);
      assert.ok(event, "link must point at a real governed event");
      assert.equal(link.chapterId, event!.chapterId);
      assert.ok(
        event!.hadithRefs.some((ref) => ref.kind === "local_sample" && ref.sampleId === "bukhari-1"),
        "the event must actually cite this sample",
      );
      assert.equal(link.href, `/seerah/database?event=${encodeURIComponent(event!.id)}`);
      assert.ok(link.noteAr.length > 0, "citing note preserved verbatim");
    }
    // Unknown samples produce no links — nothing is invented.
    assert.deepEqual(establishedSeerahLinks("not-a-real-sample"), []);
    // Every returned link is backed by a citing event; no similarity inference.
    const allLinked = LOCAL_SAMPLES.flatMap((s) => establishedSeerahLinks(s.id));
    for (const link of allLinked) {
      const event = SEERAH_EVENTS.find((e) => e.id === link.eventId);
      assert.ok(event?.hadithRefs.some((ref) => ref.kind === "local_sample" && ref.sampleId && link.href.includes(encodeURIComponent(link.eventId))));
    }
  });

  it("the record view renders established links and recorded related fields", () => {
    assert.match(page, /data-visual="hadith-cross-links"/);
    assert.match(page, /establishedSeerahLinks\(active\.id\)/);
    assert.match(page, /روابط مثبتة في البيانات/);
    assert.match(page, /active\.relatedSeerahTopic/);
    assert.match(page, /active\.relatedQuranAyah/);
    assert.match(css, /\.crossLinks/);
    assert.match(css, /\.crossLink/);
  });

  it("notes persist locally with the governed record identity attached", () => {
    assert.match(page, /data-visual="hadith-note"/);
    assert.match(page, /data-visual="hadith-note-panel"/);
    assert.match(page, /useInstitution\(\(state\) => state\.addNote\)/);
    assert.match(page, /buildHadithShareText\(active, activeCollection\.nameAr\)/);
    assert.match(page, /if \(!body\) return;/);
    assert.match(page, /disabled=\{!noteDraft\.trim\(\)\}/);
    // Note is explicitly personal, never a grading or takhrij.
    assert.match(page, /ليست تخريجًا أو حكمًا/);
    // Draft resets when a different record opens.
    assert.match(page, /setNoteOpen\(false\);\s*setNoteDraft\(""\);\s*\}, \[active\?\.id\]\)/);
    assert.match(css, /\.notePanel/);
  });

  it("reference search matches real recorded numbers only", () => {
    // Hadith number 1 exists in the local samples (bukhari-1).
    const byNumber = searchSamples("1", "all");
    assert.ok(byNumber.some((s) => s.hadithNumber === 1 || s.bookNumber === 1));
    // A number absent from every record returns nothing — no fabrication.
    const absent = searchSamples("999999", "all");
    assert.equal(absent.length, 0);
    assert.match(page, /رقم الحديث/);
  });

  it("keeps the development-sample honesty boundary intact", () => {
    assert.match(page, /عينة تطوير/);
    assert.match(page, /ليست متنًا إنتاجيًا/);
    assert.match(page, /السلسلة الكاملة غير متوفرة كبنية بيانات/);
    assert.match(page, /الأعداد المعروضة على بطاقات المصنفات هي أعداد ببليوغرافية/);
  });
});
