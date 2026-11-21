/**
 * Hadith archive 3D — directive §4.F immersive study environment.
 *
 * Genuine 3D scholar's archive on the shared interior engine: real desk,
 * binding walls, study props; node travel, drag-look, exit, reduced-motion,
 * WebGL fallback. Governed records (grading + development-sample label) are
 * NEVER painted into scene textures — they stay in the DOM record card.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getInteriorScene } from "../client/src/visual-golden/services/interior-scenes";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("hadith archive registry", () => {
  it("exposes a governed archive scene with four linked stations", () => {
    const scene = getInteriorScene("hadith-archive");
    assert.ok(scene);
    assert.equal(scene.kind, "archive");
    assert.equal(scene.nodes.length, 4);
    const ids = scene.nodes.map((node) => node.id);
    assert.deepEqual(ids, ["entrance", "study-desk", "collection-wall", "verification-corner"]);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(Number.isInteger(scene.seed) && scene.seed > 0);
    for (const node of scene.nodes) {
      assert.ok(node.position[1] > 1.2 && node.position[1] < 2.2, "human observer eye height");
      assert.ok(Math.abs(node.position[0]) < 13 && Math.abs(node.position[2]) < 13, "stations inside the room");
      assert.ok(node.labelAr.length > 0 && node.noteAr.length > 20);
    }
    // The archive is a study, not a prayer hall: no mihrab niche.
    assert.equal(scene.shell?.mihrab, false);
  });

  it("discloses artistic nature and keeps records outside the scene", () => {
    const scene = getInteriorScene("hadith-archive")!;
    assert.match(scene.disclosureAr, /فنية/);
    assert.match(scene.disclosureAr, /ليست إعادة بناء/);
    assert.match(scene.disclosureAr, /لا يَرِد نص أحاديث داخل المشهد/);
    assert.match(scene.disclosureAr, /عينات التطوير/);
    const desk = scene.nodes.find((node) => node.id === "study-desk")!;
    assert.match(desk.noteAr, /عينة تطوير/);
    const wall = scene.nodes.find((node) => node.id === "collection-wall")!;
    // Bibliographic counts vs local corpus honesty is part of the station note.
    assert.match(wall.noteAr, /ليست حجم المتن المحلي/);
    const corner = scene.nodes.find((node) => node.id === "verification-corner")!;
    assert.match(corner.noteAr, /لا يُخترع سند ولا حكم/);
  });
});

describe("hadith archive engine", () => {
  const component = read("client/src/visual-golden/components/hadith/HadithArchive3D.tsx");

  it("is a furnishing over the shared verified shell", () => {
    assert.match(component, /InteriorScene3D/);
    assert.match(component, /furnish=\{furnishArchive\}/);
    assert.match(component, /visualId="hadith-archive"/);
  });

  it("builds the reference study: desk, chair, binding walls, props", () => {
    // Scholar's desk + tufted chair.
    assert.match(component, /Scholar's desk/);
    assert.match(component, /Tufted scholar's chair/);
    // Full-height instanced binding walls on both sides.
    assert.match(component, /InstancedMesh\(bookGeo, bookMat, bookCount\)/);
    assert.match(component, /for \(const side of \[-1, 1\]\)/);
    // Study props: rehal, quill/inkwell, magnifier, scroll + wax seal, armillary.
    assert.match(component, /Inkwell \+ quill/);
    assert.match(component, /Magnifier/);
    assert.match(component, /wax seal/);
    assert.match(component, /armillary/);
  });

  it("never renders hadith text into scene textures", () => {
    assert.doesNotMatch(component, /CanvasTexture/);
    assert.doesNotMatch(component, /fillText/);
    assert.doesNotMatch(component, /createElement\("canvas"\)/);
    assert.match(component, /hadith text is never/);
    assert.match(component, /deliberately blank/);
  });

  it("respects motion and disposal rules", () => {
    assert.doesNotMatch(component, /new THREE\.WebGLRenderer/);
    assert.doesNotMatch(component, /requestAnimationFrame\(/);
    assert.doesNotMatch(component, /matchMedia\(/);
    // Armillary rotation only under full motion, through the engine hook.
    assert.match(component, /context\.motion === "full"/);
    assert.match(component, /onFrame/);
  });
});

describe("hadith page archive wiring", () => {
  const page = read("client/src/visual-golden/pages/HadithPage.tsx");
  const css = read("client/src/visual-golden/pages/HadithPage.module.css");

  it("offers an explicit opt-in entry, lazy-loaded", () => {
    assert.match(page, /data-visual="hadith-archive-enter"/);
    assert.match(page, /const HadithArchive3D = lazy\(/);
    assert.match(page, /getInteriorScene\("hadith-archive"\)/);
    assert.match(page, /setArchiveFailed\(true\)/);
    assert.match(page, /archiveAvailable = !!archiveScene && !archiveFailed/);
  });

  it("reads governed records in the DOM overlay with honest labels", () => {
    assert.match(page, /data-visual="hadith-archive-record"/);
    // Same governed record state as the full archive.
    assert.match(page, /\{active\.textAr\}/);
    assert.match(page, /عينة تطوير — قيد المراجعة التحريرية/);
    assert.match(page, /الدرجة: \{active\.gradeAr\} · المصدر: \{active\.gradeSource\}/);
    // Record switching operates on the real shared selection state.
    assert.match(page, /onClick=\{\(\) => setActiveId\(sample\.id\)\}/);
    // External verification link is preserved inside the scene overlay.
    assert.match(page, /https:\/\/dorar\.net\/hadith/);
  });

  it("keeps the full archive mounted for state continuity", () => {
    assert.match(page, /showArchive \? styles\.archiveHidden : undefined/);
    assert.match(css, /\.archiveHidden/);
    assert.match(css, /clip-path: inset\(50%\)/);
  });

  it("preserves the existing archive honesty contracts", () => {
    assert.match(page, /data-visual="hadith-corpus-scope"/);
    assert.match(page, /data-visual="hadith-cross-links"/);
    assert.match(page, /establishedSeerahLinks\(active\.id\)/);
    assert.match(page, /العدد الكلي للمصنف ليس حجم المتن المحلي/);
  });
});
