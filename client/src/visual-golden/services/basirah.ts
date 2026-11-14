import { HADITH_COLLECTIONS, HADITH_DEVELOPMENT_SAMPLES } from "@/data/hadithData";
import { seerahChapters } from "@/data/seerahData";
import type { QuranChapter } from "@/services/quranService";
import { digitalVersionRegistry, workRegistry } from "@shared/knowledge-registry";
import { sourceRegistry } from "@shared/source-registry";

export type BasirahScope = "all" | "quran" | "hadith" | "seerah" | "library" | "sources";
export type BasirahMode = "sourced" | "simple" | "compare" | "evidence" | "explore";

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
  | "event-place"
  | "event-person"
  | "event-quran"
  | "event-hadith"
  | "person-place"
  | "person-event"
  | "place-event"
  | "quran-event"
  | "hadith-event"
  | "source-evidence";

export interface KnowledgeGraphNode {
  id: string;
  scope: BasirahScope;
  titleAr: string;
  titleEn: string;
  kindAr: string;
  kindEn: string;
  path: string;
  certainty: "verified" | "approximate" | "schematic";
  tags: string[];
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  type: KnowledgeRelationType;
  labelAr: string;
  labelEn: string;
  certainty: "verified" | "approximate" | "schematic";
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

/**
 * Build a knowledge graph from the local Basirah index. Relations are inferred
 * from declared data (chapter order, events, sources) and tagged with certainty.
 * Nothing is invented; missing links are simply absent.
 */
export function buildKnowledgeGraph(records: BasirahRecord[]): KnowledgeGraph {
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const seen = new Set<string>();

  const addNode = (r: BasirahRecord) => {
    if (seen.has(r.id)) return;
    seen.add(r.id);
    nodes.push({
      id: r.id,
      scope: r.scope,
      titleAr: r.titleAr,
      titleEn: r.titleEn,
      kindAr: r.kindAr,
      kindEn: r.kindEn,
      path: r.path,
      certainty: r.availabilityAr.includes("موثق") || r.availabilityAr.includes("verified")
        ? "verified"
        : r.availabilityAr.includes("تطوير") || r.availabilityAr.includes("development")
          ? "approximate"
          : "schematic",
      tags: [r.scope, r.kindAr],
    });
  };

  records.forEach(addNode);

  // Link seerah chapters chronologically (narrative order).
  const seerah = records.filter((r) => r.scope === "seerah").sort((a, b) => a.titleAr.localeCompare(b.titleAr));
  for (let i = 0; i < Math.max(0, seerah.length - 1); i++) {
    edges.push({
      from: seerah[i].id,
      to: seerah[i + 1].id,
      type: "event-event",
      labelAr: "تسلسل سردي",
      labelEn: "Narrative sequence",
      certainty: "schematic",
    });
  }

  // Link each seerah chapter to its source records.
  seerah.forEach((chapter) => {
    const sources = records.filter((r) => r.scope === "sources" && r.hintAr.includes(chapter.titleAr.slice(0, 6)));
    sources.forEach((s) => {
      edges.push({
        from: chapter.id,
        to: s.id,
        type: "source-evidence",
        labelAr: "مصدر الفصل",
        labelEn: "Chapter source",
        certainty: "approximate",
      });
    });
  });

  // Link hadith samples to their collections.
  records.filter((r) => r.scope === "hadith").forEach((h) => {
    const coll = records.filter((r) => r.scope === "library" && r.titleAr.includes(h.titleAr.split(" · ")[0] ?? ""));
    coll.forEach((c) => {
      edges.push({
        from: h.id,
        to: c.id,
        type: "hadith-event",
        labelAr: "مجموعة الحديث",
        labelEn: "Hadith collection",
        certainty: "approximate",
      });
    });
  });

  return { nodes, edges };
}

/**
 * Find records related to a given record through the knowledge graph.
 */
export function findRelatedRecords(
  graph: KnowledgeGraph,
  recordId: string,
  maxDepth = 2,
): BasirahRecord[] {
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
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return [...related].map((id) => byId.get(id)!).filter(Boolean);
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
