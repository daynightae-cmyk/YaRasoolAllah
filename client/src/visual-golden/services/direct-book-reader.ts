import {
  digitalVersionRegistry,
  workRegistry,
  type DigitalVersionRecord,
} from "@shared/knowledge-registry";

const MAX_RAW_BYTES = 12 * 1024 * 1024;
const PAGE_MARKER = /PageV\d{2}P\d{3}[AB]?/g;
const cache = new Map<string, ParsedBook>();

type SegmentKind = "heading" | "paragraph";

export interface ReaderSegment {
  index: number;
  kind: SegmentKind;
  text: string;
  locator: string | null;
}

interface ParsedBook {
  segments: ReaderSegment[];
  toc: Array<{ title: string; segmentIndex: number }>;
}

export interface DirectReaderPayload {
  work: {
    workId: string;
    title: string;
    author: string;
    scholarlyReviewStatus: string;
  };
  version: {
    versionId: string;
    openitiUri: string;
    releaseCommit: string;
    sourceUrl: string;
    metadataUrl: string;
    rightsState: string;
    rawUrl: string;
  };
  reader: {
    cursor: number;
    nextCursor: number | null;
    previousCursor: number | null;
    totalSegments: number;
    segments: ReaderSegment[];
    toc: Array<{ title: string; segmentIndex: number }>;
    numbering: "digital_segments_not_print_pages";
  };
  attribution: string;
  rightsUrl: string;
}

function cleanInline(value: string) {
  return value
    .replace(PAGE_MARKER, " ")
    .replace(/~~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOpenIti(raw: string): ParsedBook {
  const splitter = "#META#Header#End#";
  const body = raw.includes(splitter)
    ? raw.slice(raw.indexOf(splitter) + splitter.length)
    : raw;
  const lines = body.replace(/\r/g, "").split("\n");
  const atoms: Array<{ kind: SegmentKind; text: string; locator: string | null }> = [];
  let paragraph = "";
  let locator: string | null = null;

  const flushParagraph = () => {
    const text = cleanInline(paragraph);
    if (text) atoms.push({ kind: "paragraph", text, locator });
    paragraph = "";
  };

  for (const rawLine of lines) {
    const markers = rawLine.match(PAGE_MARKER);
    if (markers?.length) locator = markers[markers.length - 1];

    const line = rawLine.replace(PAGE_MARKER, "").trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^###\s+\|+\s*(.*)$/);
    if (heading) {
      flushParagraph();
      const title = cleanInline(heading[1]);
      if (title) atoms.push({ kind: "heading", text: title, locator });
      continue;
    }

    if (/^#META#/.test(line) || /^######?OpenITI#/.test(line)) continue;

    if (/^#\s+/.test(line)) {
      flushParagraph();
      paragraph = line.replace(/^#\s+/, "");
      continue;
    }

    if (/^~~/.test(line)) {
      paragraph += ` ${line.replace(/^~~\s*/, "")}`;
      continue;
    }

    paragraph += ` ${line.replace(/^#+\s*/, "")}`;
  }
  flushParagraph();

  const segments: ReaderSegment[] = [];
  let buffer = "";
  let bufferLocator: string | null = null;

  const flushBuffer = () => {
    const text = cleanInline(buffer);
    if (!text) return;
    segments.push({
      index: segments.length,
      kind: "paragraph",
      text,
      locator: bufferLocator,
    });
    buffer = "";
    bufferLocator = null;
  };

  for (const atom of atoms) {
    if (atom.kind === "heading") {
      flushBuffer();
      segments.push({
        index: segments.length,
        kind: atom.kind,
        text: atom.text,
        locator: atom.locator,
      });
      continue;
    }

    if (!buffer) bufferLocator = atom.locator;
    if (buffer.length + atom.text.length > 2200) flushBuffer();
    if (!buffer) bufferLocator = atom.locator;
    buffer += `${buffer ? "\n\n" : ""}${atom.text}`;
  }
  flushBuffer();

  const toc = segments
    .filter((segment) => segment.kind === "heading")
    .slice(0, 180)
    .map((segment) => ({
      title: segment.text,
      segmentIndex: segment.index,
    }));

  return { segments, toc };
}

function toRawUrl(version: DigitalVersionRecord) {
  return `https://raw.githubusercontent.com/OpenITI/RELEASE/${version.releaseCommit}/${version.artifactPath}`;
}

async function fetchPinnedText(version: DigitalVersionRecord): Promise<ParsedBook> {
  const cached = cache.get(version.versionId);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(toRawUrl(version), {
      signal: controller.signal,
      headers: { Accept: "text/plain" },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`تعذر جلب النص من المصدر المباشر (HTTP ${response.status}).`);
    }

    const declaredLength = Number(response.headers.get("content-length") || "0");
    if (declaredLength > MAX_RAW_BYTES) {
      throw new Error("حجم النسخة أكبر من حد القارئ.");
    }

    const raw = await response.text();
    if (new Blob([raw]).size > MAX_RAW_BYTES) {
      throw new Error("حجم النسخة أكبر من حد القارئ.");
    }

    const parsed = parseOpenIti(raw);
    if (!parsed.segments.length) {
      throw new Error("النسخة المباشرة لا تحتوي مقاطع قابلة للقراءة.");
    }

    cache.set(version.versionId, parsed);
    return parsed;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("استغرق تحميل الكتاب وقتًا أطول من المتوقع. حاول مرة أخرى.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function loadDirectBookPage(args: {
  workId: string;
  cursor?: number;
  limit?: number;
  versionId?: string;
}): Promise<DirectReaderPayload> {
  const work = workRegistry.find((item) => item.workId === args.workId);
  if (!work) throw new Error("هذا الكتاب غير موجود في سجل المكتبة.");

  const eligible = digitalVersionRegistry.filter(
    (version) =>
      version.workId === work.workId &&
      version.contentAvailability === "full_text_cleared" &&
      version.rightsState === "cleared_public_domain_openiti_historical_text",
  );

  const version = args.versionId
    ? eligible.find((item) => item.versionId === args.versionId)
    : eligible[0];

  if (!version) {
    throw new Error("لا توجد نسخة نصية مصرح بعرضها داخل المنصة لهذا الكتاب.");
  }

  const parsed = await fetchPinnedText(version);
  const cursor = Math.min(
    Math.max(0, Math.floor(args.cursor ?? 0)),
    Math.max(0, parsed.segments.length - 1),
  );
  const limit = Math.min(Math.max(1, Math.floor(args.limit ?? 2)), 6);
  const segments = parsed.segments.slice(cursor, cursor + limit);
  const nextCursor =
    cursor + limit < parsed.segments.length ? cursor + limit : null;
  const previousCursor = cursor > 0 ? Math.max(0, cursor - limit) : null;

  return {
    work: {
      workId: work.workId,
      title: work.titleAr,
      author: work.authorAr,
      scholarlyReviewStatus: work.scholarlyReviewStatus,
    },
    version: {
      versionId: version.versionId,
      openitiUri: version.openitiUri,
      releaseCommit: version.releaseCommit,
      sourceUrl: version.sourceUrl,
      metadataUrl: version.versionMetadataUrl,
      rightsState: version.rightsState,
      rawUrl: toRawUrl(version),
    },
    reader: {
      cursor,
      nextCursor,
      previousCursor,
      totalSegments: parsed.segments.length,
      segments,
      toc: parsed.toc,
      numbering: "digital_segments_not_print_pages",
    },
    attribution: "Open Islamicate Texts Initiative (OpenITI) · pinned RELEASE commit",
    rightsUrl: "https://openiti.org/docs/Copyright_Questions.html",
  };
}
