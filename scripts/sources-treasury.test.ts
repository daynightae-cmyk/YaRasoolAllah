/**
 * Sources treasury 3D — directive §4.J immersive source-provenance treasury.
 *
 * Genuine 3D card-catalog treasury on the shared interior engine: catalog
 * cabinets, document-inspection desk, verification shield; node travel,
 * drag-look, exit, reduced-motion, WebGL fallback. Governed record details
 * (availability, certainty + reason, source IDs) are NEVER painted into
 * scene textures — they stay in the DOM record card. Drawer clicks filter
 * the REAL shared Basirah index; no invented approval bodies or counts.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getInteriorScene, listInteriorScenes } from "../client/src/visual-golden/services/interior-scenes";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("sources treasury registry", () => {
  it("exposes a governed treasury scene with four linked stations", () => {
    const scene = getInteriorScene("sources-treasury");
    assert.ok(scene);
    assert.equal(scene.kind, "treasury");
    assert.equal(scene.nodes.length, 4);
    const ids = scene.nodes.map((node) => node.id);
    assert.deepEqual(ids, ["entrance", "catalog-wall", "document-desk", "verification-shield"]);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(Number.isInteger(scene.seed) && scene.seed > 0);
    for (const node of scene.nodes) {
      assert.ok(node.position[1] > 1.2 && node.position[1] < 2.2, "human observer eye height");
      assert.ok(Math.abs(node.position[0]) < 13 && Math.abs(node.position[2]) < 13, "stations inside the room");
      assert.ok(node.labelAr.length > 0 && node.noteAr.length > 20);
    }
    // The treasury is an archive, not a prayer hall: no mihrab niche.
    assert.equal(scene.shell?.mihrab, false);
  });

  it("discloses artistic nature and the software-vs-scholarly boundary", () => {
    const scene = getInteriorScene("sources-treasury")!;
    assert.match(scene.disclosureAr, /فنية/);
    assert.match(scene.disclosureAr, /ليست إعادة بناء/);
    assert.match(scene.disclosureAr, /لا تُرسم نصوص الوثائق داخل المشهد/);
    assert.match(scene.disclosureAr, /التحقق البرمجي ليس اعتمادًا علميًا شرعيًا/);
    const catalog = scene.nodes.find((node) => node.id === "catalog-wall")!;
    // Drawer filtering must operate on real records, never invented counts.
    assert.match(catalog.noteAr, /يرشّح السجلات الفعلية فعلًا/);
    assert.match(catalog.noteAr, /لا تُعرض أعداد مختلقة/);
    const shield = scene.nodes.find((node) => node.id === "verification-shield")!;
    assert.match(shield.noteAr, /لا تُخترع جهات اعتماد ولا أعداد مراجعات/);
  });

  it("keeps every registered scene distinct and honest", () => {
    const scenes = listInteriorScenes();
    const ids = scenes.map((scene) => scene.sceneId);
    assert.equal(new Set(ids).size, ids.length);
    const seeds = scenes.map((scene) => scene.seed);
    assert.equal(new Set(seeds).size, seeds.length);
    for (const scene of scenes) {
      assert.match(scene.disclosureAr, /فني/);
    }
  });
});

describe("sources treasury engine", () => {
  const component = read("client/src/visual-golden/components/sources/SourcesTreasury3D.tsx");

  it("is a furnishing over the shared verified shell", () => {
    assert.match(component, /InteriorScene3D/);
    assert.match(component, /furnish=\{furnishTreasury\}/);
    assert.match(component, /visualId="sources-treasury"/);
  });

  it("builds the reference treasury: cabinets, desk, shield", () => {
    // Card-catalog cabinets: instanced drawers, label plates, ring pulls.
    assert.match(component, /Card-catalog cabinet wall/);
    assert.match(component, /InstancedMesh\(drawerGeo, drawerMat, drawerCount\)/);
    assert.match(component, /InstancedMesh\(plateGeo, goldMat, drawerCount\)/);
    assert.match(component, /InstancedMesh\(pullGeo, goldMat, drawerCount\)/);
    // Open drawers with blank documents.
    assert.match(component, /openSlots/);
    // Inspection desk: manuscript, wax seal, brass stamp, magnifier, inkwell.
    assert.match(component, /Manuscript-inspection desk/);
    assert.match(component, /Wax seal/);
    assert.match(component, /Brass stamp/);
    assert.match(component, /Magnifier/);
    assert.match(component, /Inkwell \+ quill/);
    // Verification shield: extruded heraldic shape + check + laurel + glow.
    assert.match(component, /Verification shield/);
    assert.match(component, /ExtrudeGeometry\(shieldShape/);
    assert.match(component, /Laurel branches/);
    assert.match(component, /PointLight/);
  });

  it("never renders document text into scene textures", () => {
    assert.doesNotMatch(component, /CanvasTexture/);
    assert.doesNotMatch(component, /fillText/);
    assert.doesNotMatch(component, /createElement\("canvas"\)/);
    assert.match(component, /deliberately blank/);
    assert.match(component, /no text is ever painted into scenes/);
  });

  it("respects motion, lamp and disposal rules", () => {
    assert.doesNotMatch(component, /new THREE\.WebGLRenderer/);
    assert.doesNotMatch(component, /requestAnimationFrame\(/);
    assert.doesNotMatch(component, /matchMedia\(/);
    // Shield breathing + armillary only under full motion; lamp drives glow.
    assert.match(component, /context\.motion === "full"/);
    assert.match(component, /onFrame/);
    assert.match(component, /onLamp\(level\)/);
    assert.match(component, /shieldLight\.intensity/);
  });
});

describe("sources page treasury wiring", () => {
  const page = read("client/src/pages/SourcesPage.tsx");
  const css = read("client/src/pages/SourcesPage.module.css");

  it("offers an explicit opt-in entry, lazy-loaded", () => {
    assert.match(page, /data-visual="sources-treasury-enter"/);
    assert.match(page, /const SourcesTreasury3D = lazy\(/);
    assert.match(page, /getInteriorScene\("sources-treasury"\)/);
    assert.match(page, /setTreasuryFailed\(true\)/);
    assert.match(page, /treasuryAvailable = !!treasuryScene && !treasuryFailed/);
  });

  it("drawer clicks filter the real governed source registry", () => {
    // The SAME kindFilter state the full registry uses; measured counts.
    assert.match(page, /setKindFilter\(kind\)/);
    assert.match(page, /kindCabinets\.map\(\(\[kind, count\]\)/);
    assert.match(page, /كل الأدراج \(\{sourceRegistry\.length\}\)/);
  });

  it("reads governed record details in the DOM overlay with honest labels", () => {
    assert.match(page, /data-visual="sources-treasury-record"/);
    assert.match(page, /reviewLabel\(treasuryRecord\.editorialStatus\)/);
    assert.match(page, /treasuryRecord\.version \?\? "غير محدد"/);
    // Rights decision from the governed ledger — truthful unknown otherwise.
    assert.match(page, /rightsDecisionLabel\(treasuryRights\[0\]\.decision\)/);
    assert.match(page, /لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح/);
    assert.match(page, /لا تُخترع بدائل/);
    // Real inspection: opens the SAME governed drawer with URL deep link.
    assert.match(page, /openDrawer\(treasuryRecord\.sourceId\)/);
    assert.match(page, /onClick=\{\(\) => openDrawer\(source\.sourceId\)\}/);
    assert.match(page, /التحقق البرمجي ليس اعتمادًا علميًا شرعيًا/);
  });

  it("keeps the full registry mounted for state continuity", () => {
    assert.match(page, /showTreasury \? styles\.treasuryHidden : undefined/);
    assert.match(css, /\.treasuryHidden/);
    assert.match(css, /clip-path: inset\(50%\)/);
    // The full inspection drawer must not stack over the 3D scene.
    assert.match(page, /openSource && !showTreasury/);
  });

  it("preserves the existing sources honesty contracts", () => {
    assert.match(page, /data-visual="source-cabinets"/);
    assert.match(page, /data-visual="source-drawer"/);
    assert.match(page, /العلاقات المعروضة مراجع مسجلة في الفهارس المحكومة فقط — لا استنتاج ولا اختراع/);
    assert.match(page, /وحالة «تحقق» لا تعني حكمًا علميًا عامًا على المحتوى/);
  });
});