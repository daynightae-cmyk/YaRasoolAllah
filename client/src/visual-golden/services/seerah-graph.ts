import { seerahChapters, type TimelineEvent } from "@/data/seerahData";
import { ATLAS_NODES } from "@/visual-golden/services/atlas";

export type SeerahGraphCertainty = "recorded" | "narrative" | "schematic";

export type SeerahGraphEdgeKind =
  | "chapter-sequence"
  | "chapter-relation"
  | "chapter-continuity"
  | "event-sequence"
  | "event-place";

export interface SeerahGraphEdge {
  kind: SeerahGraphEdgeKind;
  from: string;
  to: string;
  basis: string;
  certainty: SeerahGraphCertainty;
  reciprocal: boolean;
}

export interface SeerahGraphChapterNode {
  kind: "chapter";
  key: string;
  chapterId: string;
  order: number;
  title: string;
  eventKeys: string[];
  previousKey: string | null;
  nextKey: string | null;
  relatedChapterIds: string[];
}

export interface SeerahGraphPlaceRef {
  nodeId: string;
  name: string;
}

export interface SeerahGraphEventNode {
  kind: "event";
  key: string;
  chapterKey: string;
  chapterId: string;
  eventId: string;
  title: string;
  dateText: string;
  importance: TimelineEvent["importance"];
  locationText: string | null;
  place: SeerahGraphPlaceRef | null;
  previousKey: string | null;
  nextKey: string | null;
  continuesIntoKey: string | null;
}

export type SeerahGraphNode = SeerahGraphChapterNode | SeerahGraphEventNode;

export interface SeerahGraphDeferredRelation {
  kind: string;
  label: string;
  reason: string;
}

export interface SeerahGraphFindings {
  eventIdCollisions: Array<{ eventId: string; chapterIds: string[] }>;
  eventIdChapterIdCollisions: Array<{ eventId: string; chapterId: string }>;
  unresolvedLocations: string[];
  chaptersWithoutRelations: string[];
  danglingRelations: Array<{ chapterId: string; targetId: string }>;
}

export interface SeerahGraph {
  chapters: SeerahGraphChapterNode[];
  events: SeerahGraphEventNode[];
  edges: SeerahGraphEdge[];
  findings: SeerahGraphFindings;
}

export const SEERAH_GRAPH_EDGE_LABELS: Record<SeerahGraphEdgeKind, string> = {
  "chapter-sequence": "ترتيب الفصول المسجَّل",
  "chapter-relation": "فصول مرتبطة مسجّلة",
  "chapter-continuity": "المتابعة السردية بين الفصول",
  "event-sequence": "ترتيب المحطات داخل الفصل",
  "event-place": "موضع تخطيطي مسجَّل",
};

export const SEERAH_GRAPH_DEFERRED: SeerahGraphDeferredRelation[] = [
  {
    kind: "person",
    label: "الأشخاص",
    reason: "لا يوجد سجل أشخاص بمعرّفات، وإشارات الأشخاص نصوص حرة داخل الوصف والتفاصيل، فربطها يتطلب استخراجًا دلاليًا غير موثق.",
  },
  {
    kind: "quran-ayah",
    label: "القرآن",
    reason: "لا تسجّل المحطات أي سورة أو آية، فلا يمكن ربط المحطة بالقرآن من البيانات الحالية.",
  },
  {
    kind: "hadith",
    label: "الحديث",
    reason: "لا تسجّل المحطات أي حديث أو درجة، فلا يمكن ربط المحطة بالحديث من البيانات الحالية.",
  },
  {
    kind: "reference",
    label: "المراجع",
    reason: "لا تحمل المحطات حقول مصدر أو مرجع أو صفحة، فلا تُعرض إحالة مرجعية غير موثقة.",
  },
  {
    kind: "chronology",
    label: "التسلسل الزمني المطلق",
    reason: "تواريخ المحطات نصوص مختلطة (سنوات هجرية، أعمار نسبية، تقديرات) دون حقل زمني مُطبَّع، فلا يُشتق ترتيب زمني مطلق.",
  },
  {
    kind: "event-identity",
    label: "هوية المحطة عبر الفصول",
    reason: "معرّفات المحطات ليست فريدة عبر الفصول، وقد يطابق معرّف محطة معرّف فصل، فتُعرَّف كل محطة بمفتاح (الفصل + المحطة) ولا تُدمج محطات متشابهة في هوية واحدة.",
  },
  {
    kind: "place-outside-registry",
    label: "المواضع خارج السجل التخطيطي",
    reason: "بعض المواقع مركّبة أو خارج المواضع التخطيطية المعتمدة، فتُعرض كنص مذكور دون عقدة في الأطلس.",
  },
];

const chaptersByOrder = [...seerahChapters].sort((a, b) => a.order - b.order);
const placesByName = new Map(ATLAS_NODES.map((node) => [node.name, node]));

export function seerahEventKey(chapterId: string, eventId: string): string {
  return `${chapterId}::${eventId}`;
}

export function seerahChapterKey(chapterId: string): string {
  return `chapter:${chapterId}`;
}

function buildGraph(): SeerahGraph {
  const chapters: SeerahGraphChapterNode[] = [];
  const events: SeerahGraphEventNode[] = [];
  const edges: SeerahGraphEdge[] = [];
  const eventIdOwners = new Map<string, string[]>();
  const unresolvedLocations = new Set<string>();
  const danglingRelations: Array<{ chapterId: string; targetId: string }> = [];

  chaptersByOrder.forEach((chapter, chapterIndex) => {
    const chapterEvents = chapter.timelineEvents ?? [];
    const chapterKey = seerahChapterKey(chapter.id);
    const keys = chapterEvents.map((event) => seerahEventKey(chapter.id, event.id));

    chapterEvents.forEach((event, eventIndex) => {
      const key = keys[eventIndex]!;
      const owners = eventIdOwners.get(event.id) ?? [];
      owners.push(chapter.id);
      eventIdOwners.set(event.id, owners);

      const locationText = event.location?.trim() || null;
      const placeNode = locationText ? placesByName.get(locationText) : undefined;
      if (locationText && !placeNode) unresolvedLocations.add(locationText);

      events.push({
        kind: "event",
        key,
        chapterKey,
        chapterId: chapter.id,
        eventId: event.id,
        title: event.title,
        dateText: event.date,
        importance: event.importance,
        locationText,
        place: placeNode ? { nodeId: placeNode.id, name: placeNode.name } : null,
        previousKey: eventIndex > 0 ? keys[eventIndex - 1]! : null,
        nextKey: eventIndex < keys.length - 1 ? keys[eventIndex + 1]! : null,
        continuesIntoKey: null,
      });
    });

    chapters.push({
      kind: "chapter",
      key: chapterKey,
      chapterId: chapter.id,
      order: chapter.order,
      title: chapter.title,
      eventKeys: keys,
      previousKey: chapterIndex > 0 ? seerahChapterKey(chaptersByOrder[chapterIndex - 1]!.id) : null,
      nextKey:
        chapterIndex < chaptersByOrder.length - 1
          ? seerahChapterKey(chaptersByOrder[chapterIndex + 1]!.id)
          : null,
      relatedChapterIds: [],
    });
  });

  const eventByKey = new Map(events.map((event) => [event.key, event]));

  chaptersByOrder.forEach((chapter, chapterIndex) => {
    const chapterKey = seerahChapterKey(chapter.id);
    const chapterNode = chapters[chapterIndex]!;

    if (chapterNode.previousKey) {
      edges.push({
        kind: "chapter-sequence",
        from: chapterNode.previousKey,
        to: chapterKey,
        basis: "seerahChapters[].order",
        certainty: "narrative",
        reciprocal: false,
      });
    }

    const recordedRelations = (chapter.relatedChapters ?? []).filter((targetId) => {
      if (chapters.some((node) => node.chapterId === targetId)) return true;
      danglingRelations.push({ chapterId: chapter.id, targetId });
      return false;
    });
    chapterNode.relatedChapterIds = recordedRelations;

    recordedRelations.forEach((targetId) => {
      const targetChapter = chaptersByOrder.find((item) => item.id === targetId);
      edges.push({
        kind: "chapter-relation",
        from: chapterKey,
        to: seerahChapterKey(targetId),
        basis: "chapter.relatedChapters[]",
        certainty: "recorded",
        reciprocal: Boolean(targetChapter?.relatedChapters?.includes(chapter.id)),
      });
    });

    const lastEventKey = chapterNode.eventKeys[chapterNode.eventKeys.length - 1] ?? null;
    const nextChapter = chaptersByOrder[chapterIndex + 1];
    const firstEventKey = nextChapter
      ? chapters[chapterIndex + 1]?.eventKeys[0] ?? null
      : null;
    if (lastEventKey && firstEventKey) {
      const lastEvent = eventByKey.get(lastEventKey);
      if (lastEvent) lastEvent.continuesIntoKey = firstEventKey;
      edges.push({
        kind: "chapter-continuity",
        from: lastEventKey,
        to: firstEventKey,
        basis: "seerahChapters[].order + timelineEvents[] order",
        certainty: "narrative",
        reciprocal: false,
      });
    }

    for (let index = 1; index < chapterNode.eventKeys.length; index += 1) {
      edges.push({
        kind: "event-sequence",
        from: chapterNode.eventKeys[index - 1]!,
        to: chapterNode.eventKeys[index]!,
        basis: "chapter.timelineEvents[] order",
        certainty: "narrative",
        reciprocal: false,
      });
    }
  });

  events.forEach((event) => {
    if (!event.place) return;
    edges.push({
      kind: "event-place",
      from: event.key,
      to: event.place.nodeId,
      basis: "event.location → curated Atlas slot",
      certainty: "schematic",
      reciprocal: false,
    });
  });

  const eventIdCollisions = [...eventIdOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([eventId, owners]) => ({ eventId, chapterIds: owners }));

  const eventIdChapterIdCollisions = events
    .filter((event) => chapters.some((node) => node.chapterId === event.eventId))
    .map((event) => ({ eventId: event.eventId, chapterId: event.chapterId }));

  const chaptersWithoutRelations = chapters
    .filter((node) => node.relatedChapterIds.length === 0)
    .map((node) => node.chapterId);

  return {
    chapters,
    events,
    edges,
    findings: {
      eventIdCollisions,
      eventIdChapterIdCollisions,
      unresolvedLocations: [...unresolvedLocations].sort(),
      chaptersWithoutRelations,
      danglingRelations,
    },
  };
}

export const SEERAH_GRAPH: SeerahGraph = buildGraph();

export const SEERAH_GRAPH_ADMISSIONS = {
  admittedEdgeKinds: Object.keys(SEERAH_GRAPH_EDGE_LABELS) as SeerahGraphEdgeKind[],
  admittedTemporalBasis: "recorded-order",
  dateTextsParsed: false,
  deferred: SEERAH_GRAPH_DEFERRED,
} as const;

export const SEERAH_GRAPH_COUNTS = {
  chapters: SEERAH_GRAPH.chapters.length,
  events: SEERAH_GRAPH.events.length,
  edges: SEERAH_GRAPH.edges.length,
  placedEvents: SEERAH_GRAPH.events.filter((event) => event.place !== null).length,
  deferredKinds: SEERAH_GRAPH_DEFERRED.length,
  unresolvedLocations: SEERAH_GRAPH.findings.unresolvedLocations.length,
  eventIdCollisions: SEERAH_GRAPH.findings.eventIdCollisions.length,
  eventIdChapterIdCollisions: SEERAH_GRAPH.findings.eventIdChapterIdCollisions.length,
} as const;

const eventByKey = new Map(SEERAH_GRAPH.events.map((event) => [event.key, event]));

export function getSeerahChapterNode(chapterId: string): SeerahGraphChapterNode | undefined {
  return SEERAH_GRAPH.chapters.find((node) => node.chapterId === chapterId);
}

export function getSeerahEventNode(
  chapterId: string,
  eventId: string,
): SeerahGraphEventNode | undefined {
  return eventByKey.get(seerahEventKey(chapterId, eventId));
}

export function getSeerahNode(key: string): SeerahGraphNode | undefined {
  return (
    eventByKey.get(key) ??
    SEERAH_GRAPH.chapters.find((node) => node.key === key)
  );
}

export function getSeerahEventEdges(key: string): SeerahGraphEdge[] {
  return SEERAH_GRAPH.edges.filter((edge) => edge.from === key || edge.to === key);
}
