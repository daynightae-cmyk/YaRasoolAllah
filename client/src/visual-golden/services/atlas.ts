import { seerahChapters } from "@/data/seerahData";

export type Certainty = "schematic";

export interface AtlasMention {
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  eventTitle: string;
  eventDate: string;
}

export interface AtlasNode {
  id: string;
  name: string;
  certainty: Certainty;
  /** Schematic illustration layout slot (percent). NOT geographic coordinates. */
  layout: { x: number; y: number };
  mentions: AtlasMention[];
  battleMention: boolean;
  journeyMention: boolean;
}

interface SlotSeed {
  name: string;
  x: number;
  y: number;
}

// Curated from seerahData timeline-event locations. Slots are fixed
// illustration-layout positions for the schematic experience.
const SLOTS: SlotSeed[] = [
  { name: "مكة المكرمة", x: 44, y: 78 },
  { name: "المدينة المنورة", x: 48, y: 50 },
  { name: "بدر", x: 34, y: 60 },
  { name: "جبل أحد", x: 52, y: 42 },
  { name: "غار حراء", x: 56, y: 82 },
  { name: "غار ثور", x: 38, y: 84 },
  { name: "قباء", x: 54, y: 56 },
  { name: "الأبواء", x: 40, y: 68 },
  { name: "جبل الصفا", x: 48, y: 74 },
];

const BATTLE_CHAPTER = "battles-conquests";
const JOURNEY_CHAPTERS = new Set(["hijra-to-madinah", "secret-public-dawah"]);

function slug(name: string, index: number) {
  return `node-${index}-${name.length}`;
}

function buildNodes(): AtlasNode[] {
  const byLocation = new Map<string, AtlasMention[]>();
  for (const chapter of seerahChapters) {
    for (const event of chapter.timelineEvents ?? []) {
      const location = (event.location ?? "").trim();
      if (!location || location.includes("-")) continue;
      const list = byLocation.get(location) ?? [];
      list.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterOrder: chapter.order,
        eventTitle: event.title,
        eventDate: event.date,
      });
      byLocation.set(location, list);
    }
  }

  return SLOTS.filter((slot) => byLocation.has(slot.name)).map((slot, index) => {
    const mentions = (byLocation.get(slot.name) ?? []).sort(
      (a, b) => a.chapterOrder - b.chapterOrder,
    );
    return {
      id: slug(slot.name, index),
      name: slot.name,
      certainty: "schematic" as Certainty,
      layout: { x: slot.x, y: slot.y },
      mentions,
      battleMention: mentions.some((mention) => mention.chapterId === BATTLE_CHAPTER),
      journeyMention: mentions.some((mention) => JOURNEY_CHAPTERS.has(mention.chapterId)),
    };
  });
}

export const ATLAS_NODES: AtlasNode[] = buildNodes();

export const ATLAS_COUNTS = {
  nodes: ATLAS_NODES.length,
  mentions: ATLAS_NODES.reduce((sum, node) => sum + node.mentions.length, 0),
};

export type AtlasFilter = "all" | "battles" | "journey";

export const ATLAS_FILTERS: Array<{ id: AtlasFilter; label: string }> = [
  { id: "all", label: "كل المواضع التخطيطية" },
  { id: "battles", label: "مواضع الغزوات" },
  { id: "journey", label: "مواضع الرحلة" },
];

export function filterNodes(filter: AtlasFilter): AtlasNode[] {
  if (filter === "battles") return ATLAS_NODES.filter((node) => node.battleMention);
  if (filter === "journey") return ATLAS_NODES.filter((node) => node.journeyMention);
  return ATLAS_NODES;
}

/** Narrative-sequence links between visible nodes, ordered by first mention. */
export function narrativeLinks(nodes: AtlasNode[]): string {
  const ordered = [...nodes].sort((a, b) => {
    const aFirst = Math.min(...a.mentions.map((mention) => mention.chapterOrder));
    const bFirst = Math.min(...b.mentions.map((mention) => mention.chapterOrder));
    return aFirst - bFirst;
  });
  if (ordered.length < 2) return "";
  return ordered.map((node) => `${node.layout.x},${node.layout.y}`).join(" ");
}
