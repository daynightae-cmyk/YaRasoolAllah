/**
 * Source treasury inspection — directive §4.J.
 *
 * Cabinet filters must map to real registry categories; the record drawer
 * must show source/edition/version/rights/review state and ONLY established
 * registry relationships (work.sourceIds, resource.sourceId, rights.sourceId)
 * — never inferred links, approval bodies, or review counts.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sourceRegistry, rightsLedger, providerResourceRegistry } from "../shared/source-registry";
import { workRegistry, digitalVersionRegistry } from "../shared/knowledge-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("source treasury cabinets and inspection", () => {
  const page = read("client/src/pages/SourcesPage.tsx");
  const css = read("client/src/pages/SourcesPage.module.css");

  it("cabinet filters derive from real registry kinds with measured counts", () => {
    assert.match(page, /data-visual="source-cabinets"/);
    assert.match(page, /counts\.set\(source\.kind, \(counts\.get\(source\.kind\) \?\? 0\) \+ 1\)/);
    assert.match(page, /kindFilter === "all" \|\| source\.kind === kindFilter/);
    assert.match(page, /aria-pressed=\{kindFilter === kind\}/);
    assert.match(css, /\.cabinet/);
    // Every registry kind has a label; unknown kinds fall back to the raw id.
    const kinds = new Set(sourceRegistry.map((source) => source.kind));
    for (const kind of kinds) {
      assert.ok(page.includes(`${kind}:`), `kind ${kind} must have an Arabic label entry`);
    }
  });

  it("the drawer opens per record and is deep-linkable via ?source=", () => {
    assert.match(page, /data-visual="source-inspect"/);
    assert.match(page, /data-visual="source-drawer"/);
    assert.match(page, /role="dialog"/);
    assert.match(page, /aria-modal="true"/);
    assert.match(page, /get\("source"\)/);
    // Unknown source ids fail closed — no phantom drawer.
    assert.match(page, /sourceRegistry\.some\(\(source\) => source\.sourceId === requested\)/);
    assert.match(page, /event\.key === "Escape"/);
    assert.match(page, /url\.searchParams\.set\("source", sourceId\)/);
    assert.match(page, /url\.searchParams\.delete\("source"\)/);
  });

  it("the drawer shows the full governed record: version, review, hash, rights", () => {
    assert.match(page, /openSource\.artifactSha256 \?\? "غير مسجلة"/);
    assert.match(page, /reviewLabel\(openSource\.editorialStatus\)/);
    assert.match(page, /openSource\.version \?\? "غير محدد"/);
    assert.match(page, /rightsDecisionLabel\(rights\.decision\)/);
    assert.match(page, /PERMISSION_LABELS\[rights\.permissions\.streaming\]/);
    // Unknown values stay visibly unknown, never fabricated.
    assert.match(page, /لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح/);
    assert.match(page, /لا توجد أعمال مسجلة تشير إلى هذا المصدر/);
  });

  it("relationships are established registry references only", () => {
    // Works link strictly through recorded sourceIds.
    assert.match(page, /workRegistry\.filter\(\(work\) => work\.sourceIds\.includes\(openSource\.sourceId\)\)/);
    // Resources and rights link strictly through recorded sourceId.
    assert.match(page, /providerResourceRegistry\.filter\(\(resource\) => resource\.sourceId === openSource\.sourceId\)/);
    assert.match(page, /rightsLedger\.filter\(\(rights\) => rights\.sourceId === openSource\.sourceId\)/);
    // Versions reach the drawer only through the linked works' ids.
    assert.match(page, /const workIds = new Set\(openSourceWorks\.map\(\(work\) => work\.workId\)\)/);
    assert.match(page, /digitalVersionRegistry\.filter\(\(version\) => workIds\.has\(version\.workId\)\)/);
    assert.match(page, /العلاقات المعروضة مراجع مسجلة في الفهارس المحكومة فقط — لا استنتاج ولا اختراع/);

    // Data-level purity: every work→source reference resolves to a real source.
    const sourceIds = new Set(sourceRegistry.map((source) => source.sourceId));
    for (const work of workRegistry) {
      for (const id of work.sourceIds) {
        assert.ok(sourceIds.has(id), `work ${work.workId} cites unknown source ${id}`);
      }
    }
    for (const resource of providerResourceRegistry) {
      assert.ok(sourceIds.has(resource.sourceId), `resource ${resource.resourceId} cites unknown source`);
      assert.ok(rightsLedger.some((rights) => rights.rightsId === resource.rightsId));
    }
    // Every version belongs to a registered work.
    const workIds = new Set(workRegistry.map((work) => work.workId));
    for (const version of digitalVersionRegistry) {
      assert.ok(workIds.has(version.workId), `version ${version.versionId} cites unknown work`);
    }
  });

  it("readable-version claims come from the governed reader gate, not copy", () => {
    assert.match(page, /getEligibleDirectOpenItiVersions\(work\.workId\)\.length/);
    assert.match(page, /فهرس عمل — لا نص مقروء بعد/);
    assert.match(page, /\/library\/work\/\$\{encodeURIComponent\(work\.workId\)\}/);
    // Version pinning is shown from the registry, never invented.
    assert.match(page, /version\.releaseCommit\.slice\(0, 12\)/);
    assert.match(page, /version\.editionStatement/);
  });

  it("keeps the existing availability-honesty contract intact", () => {
    assert.match(page, /getProviderAvailabilityMetrics\(\)/);
    assert.doesNotMatch(page, /externalOnlyCount/);
    assert.match(page, /وجود الرابط لا يعني حق\s*القراءة أو التنزيل/);
  });
});
