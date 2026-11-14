import { HADITH_COLLECTIONS, HADITH_DEVELOPMENT_SAMPLES } from "@/data/hadithData";
import { seerahChapters } from "@/data/seerahData";
import type { QuranChapter } from "@/services/quranService";
import { digitalVersionRegistry, workRegistry } from "@shared/knowledge-registry";
import { sourceRegistry } from "@shared/source-registry";
import { SEERAH_GRAPH } from "@/visual-golden/services/seerah-graph";

export type BasirahScope = "all" | "quran" | "hadith" | "seerah" | "library" | "sources";
export type BasirahMode = "sourced" | "simple" | "compare" | "evidence" | "explore";
export type BasirahCertainty = "verified" | "approximate" | "schematic";

export interface BasirahRecord {
  id: string;
  scope: Exclude<BasirahScope, "all">;
  titleAr: string;
  titleEn: string;
  kindAr: string;
  kindEn: string;
  path: string;
  hintAr: string;
  hintEn: string;
  availabilityAr: string;
  /** Declared review/evidence level. Never inferred from copy. */
  certainty: BasirahCertainty;
  certaintyReasonAr: string;
  /** Stable source registry identifiers that back this record. */
  sourceIds: string[];
  /** Explicit collection identity for hadith samples. */
  collectionId?: string;
}

export const BASIRAH_SCOPES: { id: BasirahScope; ar: string; en: string }[] = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "quran", ar: "القرآن الكريم", en: "Qur’an" },
  { id: "hadith", ar: "الحديث والسنة", en: "Hadith & Sunnah" },
  { id: "seerah", ar: "السيرة النبوية", en: "Seerah" },
  { id: "library", ar: "المكتبة", en: "Library" },
  { id: "sources", ar: "المصادر", en: "Sources" },
];

export const BASIRAH_MODES: { id: BasirahMode; ar: string; en: string }[] = [
  { id: "sourced", ar: "بحث موثّق", en: "Sourced search" },
  { id: "simple", ar: "شرح مبسط", en: "Plain explanation" },
  { id: "compare", ar: "مقارنة المصادر", en: "Compare sources" },
  { id: "evidence", ar: "تتبع الدليل", en: "Follow the evidence" },
  { id: "explore", ar: "استكشاف الموضوع", en: "Explore a topic" },
];

function collectionName(collectionId: string): string {
  return HADITH_COLLECTIONS.find((c) => c.id === collectionId)?.nameAr ?? collectionId;
}

/** Local source-discovery index. Every record names its source, path, and availability. */
export function buildLocalIndex(): BasirahRecord[] {
  const records: BasirahRecord[] = [];

  for (const chapter of [...seerahChapters].sort((a, b) => a.order - b.order)) {
    records.push({
      id: `seerah-${chapter.id}`,
      scope: "seerah",
      titleAr: chapter.title,
      titleEn: `Seerah chapter ${chapter.order}`,
      kindAr: "فصل سيرة",
      kindEn: "seerah chapter",
      path: `/seerah?chapter=${encodeURIComponent(chapter.id)}`,
      hintAr: chapter.description.slice(0, 90),
      hintEn: `${chapter.timelineEvents?.length ?? 0} recorded events`,
      availabilityAr: "متن الفصل معروض من المصدر المعتمد",
      certainty: "schematic",
      certaintyReasonAr: "بنية سردية محلية؛ لم يُربط الفصل بعد بمعرّف مصدر فصل صريح.",
      sourceIds: [],
    });
  }

  for (const sample of HADITH_DEVELOPMENT_SAMPLES) {
    records.push({
      id: `hadith-${sample.id}`,
      scope: "hadith",
      titleAr: `${collectionName(sample.collectionId)} · حديث ${sample.hadithNumber}`,
      titleEn: `${sample.collectionId} ${sample.hadithNumber}`,
      kindAr: "سجل حديث محلي",
      kindEn: "local hadith record",
      path: `/hadith?sample=${encodeURIComponent(sample.id)}&collection=${encodeURIComponent(sample.collectionId)}`,
      hintAr: `${sample.bookNameAr} · ${sample.chapterNameAr}`,
      hintEn: `Narrator: ${sample.narratorEn ?? sample.narratorAr}`,
      availabilityAr: "عينة تطوير قيد المراجعة التحريرية",
      certainty: "approximate",
      certaintyReasonAr: "عينة تطوير مصرّح بها؛ المراجعة التحريرية ما زالت معلّقة.",
      sourceIds: [],
      collectionId: sample.collectionId,
    });
  }

  for (const work of workRegistry) {
    const versions = digitalVersionRegistry.filter((v) => v.workId === work.workId).length;
    records.push({
      id: `work-${work.workId}`,
      scope: "library",
      titleAr: work.titleAr,
      titleEn: work.titleEn,
      kindAr: "سجل عمل",
      kindEn: "work record",
      path: `/library/work/${work.workId}`,
      hintAr: `${work.authorAr} · ${versions} نسخة فهرسية`,
      hintEn: work.openitiWorkUri ?? "no OpenITI version pinned",
      availabilityAr: "سجل فهرسي فقط — النص الكامل غير متاح",
      certainty: work.bibliographicStatus === "verified_bibliographic" ? "verified" : "approximate",
      certaintyReasonAr:
        work.bibliographicStatus === "verified_bibliographic"
          ? "بيانات ببليوغرافية متحقق منها؛ المراجعة العلمية للنص ما زالت معلّقة."
          : "بيانات العمل لم تُصنّف بعد كبيانات ببليوغرافية متحقق منها.",
      sourceIds: work.sourceIds,
    });
  }

  for (const source of sourceRegistry) {
    records.push({
      id: `source-${source.sourceId}`,
      scope: "sources",
      titleAr: source.title,
      titleEn: source.provider,
      kindAr: "مصدر موثق",
      kindEn: "source",
      path: `/sources?q=${encodeURIComponent(source.sourceId)}`,
      hintAr: source.notes.slice(0, 90),
      hintEn: source.editorialStatus,
      availabilityAr:
        source.editorialStatus === "verified" ? "موثق" : "قيد المراجعة",
      certainty: source.editorialStatus === "verified" ? "verified" : "approximate",
      certaintyReasonAr:
        source.editorialStatus === "verified"
          ? "سجل مصدر بحالة تحريرية موثقة."
          : `سجل مصدر بحالة تحريرية: ${source.editorialStatus}.`,
      sourceIds: [source.sourceId],
    });
  }

  return records;
}

export function surahRecords(chapters: QuranChapter[]): BasirahRecord[] {
  return chapters.map((chapter) => ({
    id: `quran-surah-${chapter.number}`,
    scope: "quran" as const,
    titleAr: `سورة ${chapter.arabicName}`,
    titleEn: chapter.englishName,
    kindAr: "سورة",
    kindEn: "surah",
    path: `/quran?surah=${chapter.number}`,
    hintAr: `${chapter.ayahCount} آية · ${chapter.revelationType === "meccan" ? "مكية" : "مدنية"}`,
    hintEn: `${chapter.ayahCount} verses`,
    availabilityAr: "النص العربي من Tanzil Uthmani-min 1.1",
    certainty: "verified",
    certaintyReasonAr: "النص العربي محفوظ حرفيًا من نسخة Tanzil Uthmani-min 1.1؛ حالة الحقوق مسجلة في خزانة المصادر.",
    sourceIds: ["src-tanzil-uthmani-1-1-candidate"],
  }));
}

export function searchBasirah(records: BasirahRecord[], query: string, scope: BasirahScope): BasirahRecord[] {
  const n = query.trim();
  return records.filter((record) => {
    if (scope !== "all" && record.scope !== scope) return false;
    if (!n) return true;
    const hay = `${record.titleAr} ${record.titleEn} ${record.hintAr} ${record.hintEn} ${record.kindAr}`;
    return hay.toLowerCase().includes(n.toLowerCase()) || hay.includes(n);
  });
}

export const BASIRAH_COUNTS = {
  seerah: seerahChapters.length,
  hadithSamples: HADITH_DEVELOPMENT_SAMPLES.length,
  works: workRegistry.length,
  sources: sourceRegistry.length,
};

/* ============================================================================
   KNOWLEDGE GRAPH — deep knowledge linkage (Seerah <-> Quran <-> Hadith <-> People <-> Places <-> Sources)
   Every record becomes a node; relations are drawn from declared data only,
   never invented. Approximate/approximated places and dates are flagged.
   ============================================================================ */

export type KnowledgeRelationType =
  | "chapter-sequence"
  | "chapter-relation"
  | "hadith-collection"
  | "work-source"
  | "source-evidence";

export interface KnowledgeGraphNode extends BasirahRecord {
  tags: string[];
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  type: KnowledgeRelationType;
  labelAr: string;
  labelEn: string;
  certainty: BasirahCertainty;
  /** The recorded field/structure the relation comes from. */
  basis: string;
  /** Stable record, source, or registry identifier used as evidence. */
  evidenceRef: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

const RELATION_LABELS: Record<KnowledgeRelationType, { ar: string; en: string }> = {
  "chapter-sequence": { ar: "تسلسل سردي حسب ترتيب الفصول المسجل", en: "Recorded chapter sequence" },
  "chapter-relation": { ar: "علاقة فصل مسجلة", en: "Recorded chapter relation" },
  "hadith-collection": { ar: "انتماء إلى المصنف", en: "Collection membership" },
  "work-source": { ar: "إسناد العمل إلى مصدره", en: "Work source evidence" },
  "source-evidence": { ar: "إسناد نصي إلى مصدر", en: "Text source evidence" },
};

/**
 * Build a knowledge graph from explicit identifiers only:
 * - seerah chapter order/relations admitted by the audited SEERAH_GRAPH;
 * - hadith sample.collectionId -> collection registry node;
 * - work.sourceIds -> source registry nodes;
 * - surah.sourceIds -> source registry nodes.
 * No relation is inferred from title similarity, alphabetical order, or copy.
 * Missing evidence means a missing edge, never a guessed one.
 */
export function buildKnowledgeGraph(records: BasirahRecord[]): KnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = records.map((record) => ({
    ...record,
    tags: [record.scope, record.kindAr],
  }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges: KnowledgeGraphEdge[] = [];

  const addEdge = (edge: KnowledgeGraphEdge) => {
    if (!nodeById.has(edge.from) || !nodeById.has(edge.to)) return;
    const duplicate = edges.some(
      (existing) =>
        existing.from === edge.from &&
        existing.to === edge.to &&
        existing.type === edge.type &&
        existing.evidenceRef === edge.evidenceRef,
    );
    if (!duplicate) edges.push(edge);
  };

  // 1. Seerah: only chapter-level edges already admitted by the audited graph.
  for (const edge of SEERAH_GRAPH.edges) {
    if (edge.kind !== "chapter-sequence" && edge.kind !== "chapter-relation") continue;
    const from = `seerah-${edge.from.replace(/^chapter:/, "")}`;
    const to = `seerah-${edge.to.replace(/^chapter:/, "")}`;
    addEdge({
      from,
      to,
      type: edge.kind,
      labelAr: RELATION_LABELS[edge.kind].ar,
      labelEn: RELATION_LABELS[edge.kind].en,
      certainty: edge.kind === "chapter-relation" ? "approximate" : "schematic",
      basis: edge.basis,
      evidenceRef: `SEERAH_GRAPH:${edge.kind}`,
    });
  }

  // 2. Hadith collections are explicit registry identities, not title matches.
  const collectionIds = new Set(
    records
      .filter((record) => record.scope === "hadith" && record.collectionId)
      .map((record) => record.collectionId!),
  );
  for (const collectionId of collectionIds) {
    const collection = HADITH_COLLECTIONS.find((item) => item.id === collectionId);
    if (!collection) continue;
    const nodeId = `hadith-collection-${collection.id}`;
    if (!nodeById.has(nodeId)) {
      const node: KnowledgeGraphNode = {
        id: nodeId,
        scope: "hadith",
        titleAr: collection.nameAr,
        titleEn: collection.nameEn,
        kindAr: "مصنف حديث",
        kindEn: "hadith collection",
        path: `/hadith?collection=${encodeURIComponent(collection.id)}`,
        hintAr: `${collection.totalHadithCount} حديث في المصنف · ${collection.compiler}`,
        hintEn: `${collection.totalHadithCount} recorded hadiths · compiler d. ${collection.deathHijri} AH`,
        availabilityAr: collection.isAvailable
          ? "فهرس المصنف والنص المتاح"
          : "فهرس المصنف فقط — النص الكامل غير متاح",
        certainty: "approximate",
        certaintyReasonAr: "بيانات فهرسة المصنف محلية؛ النص الكامل غير متاح والحالة التحريرية معلّقة.",
        sourceIds: [],
        tags: ["hadith", "collection"],
      };
      nodes.push(node);
      nodeById.set(nodeId, node);
    }
    for (const sample of records) {
      if (sample.scope !== "hadith" || sample.collectionId !== collectionId) continue;
      addEdge({
        from: sample.id,
        to: nodeId,
        type: "hadith-collection",
        labelAr: RELATION_LABELS["hadith-collection"].ar,
        labelEn: RELATION_LABELS["hadith-collection"].en,
        certainty: "approximate",
        basis: "HADITH_DEVELOPMENT_SAMPLES[].collectionId",
        evidenceRef: `HADITH_COLLECTIONS:${collection.id}`,
      });
    }
  }

  // 3. Works and surahs point at their declared source registry records only.
  for (const record of records) {
    if (record.scope !== "library" && record.scope !== "quran") continue;
    for (const sourceId of record.sourceIds) {
      addEdge({
        from: record.id,
        to: `source-${sourceId}`,
        type: "source-evidence",
        labelAr: RELATION_LABELS["source-evidence"].ar,
        labelEn: RELATION_LABELS["source-evidence"].en,
        certainty: record.scope === "library" ? "verified" : "approximate",
        basis:
          record.scope === "library"
            ? "workRegistry[].sourceIds[]"
            : "surahRecords[].sourceIds[]",
        evidenceRef: sourceId,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Find records related to a given record through the knowledge graph.
 */
export function findRelatedRecords(
  graph: KnowledgeGraph,
  recordId: string,
  maxDepth = 2,
): KnowledgeGraphNode[] {
  const related = new Set<string>();
  let frontier = [recordId];
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const edge of graph.edges) {
        if (edge.from === id && !related.has(edge.to) && edge.to !== recordId) {
          related.add(edge.to);
          next.push(edge.to);
        }
        if (edge.to === id && !related.has(edge.from) && edge.from !== recordId) {
          related.add(edge.from);
          next.push(edge.from);
        }
      }
    }
    frontier = next;
  }
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  return [...related]
    .map((id) => byId.get(id))
    .filter((node): node is KnowledgeGraphNode => Boolean(node));
}

/**
 * Knowledge path between two records (shortest BFS), with relation labels.
 */
export function getKnowledgePath(
  graph: KnowledgeGraph,
  fromId: string,
  toId: string,
): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const adj = new Map<string, KnowledgeGraphEdge[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.to)!.push({ ...e, from: e.to, to: e.from });
  }
  const visited = new Set<string>([fromId]);
  const queue: Array<{ id: string; path: KnowledgeGraphEdge[] }> = [{ id: fromId, path: [] }];
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    if (id === toId) {
      return {
        nodes: path.flatMap((e) => [graph.nodes.find((n) => n.id === e.from)!, graph.nodes.find((n) => n.id === e.to)!]),
        edges: path,
      };
    }
    for (const e of adj.get(id) ?? []) {
      if (!visited.has(e.to)) {
        visited.add(e.to);
        queue.push({ id: e.to, path: [...path, e] });
      }
    }
  }
  return null;
}
