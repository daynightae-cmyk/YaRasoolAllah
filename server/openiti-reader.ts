import type { Express } from "express";
import { z } from "zod";
import { digitalVersionRegistry, workRegistry } from "../shared/knowledge-registry.js";
import { providerResourceRegistry, rightsLedger } from "../shared/source-registry.js";
import { evaluateResourceUsage } from "../shared/source-governance.js";

const querySchema = z.object({
  versionId: z.string().trim().min(1).max(220).optional(),
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(6).default(2),
});

const MAX_RAW_BYTES = 12 * 1024 * 1024;
const CACHE_TTL_MS = 30 * 60_000;
const CACHE_LIMIT = 12;
const PAGE_MARKER = /PageV\d{2}P\d{3}[AB]?/g;

type SegmentKind = "heading" | "paragraph";

interface ReaderSegment {
  index: number;
  kind: SegmentKind;
  text: string;
  locator: string | null;
}

interface ParsedBook {
  segments: ReaderSegment[];
  toc: Array<{ title: string; segmentIndex: number }>;
}

const cache = new Map<string, { expiresAt: number; parsed: ParsedBook }>();

function cleanInline(value: string) {
  return value
    .replace(PAGE_MARKER, " ")
    .replace(/~~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOpenIti(raw: string): ParsedBook {
  const splitter = "#META#Header#End#";
  const body = raw.includes(splitter) ? raw.slice(raw.indexOf(splitter) + splitter.length) : raw;
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
    segments.push({ index: segments.length, kind: "paragraph", text, locator: bufferLocator });
    buffer = "";
    bufferLocator = null;
  };

  for (const atom of atoms) {
    if (atom.kind === "heading") {
      flushBuffer();
      segments.push({ index: segments.length, ...atom });
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
    .map((segment) => ({ title: segment.text, segmentIndex: segment.index }));

  return { segments, toc };
}

async function loadParsedBook(version: (typeof digitalVersionRegistry)[number]): Promise<ParsedBook> {
  const cached = cache.get(version.versionId);
  if (cached && cached.expiresAt > Date.now()) return cached.parsed;

  const rawUrl = `https://raw.githubusercontent.com/OpenITI/RELEASE/${version.releaseCommit}/${version.artifactPath}`;
  const response = await fetch(rawUrl, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "text/plain",
      "User-Agent": "YaRasoolAllah/0.1 (historical OpenITI reading desk)",
    },
  });
  if (!response.ok) throw new Error(`OpenITI HTTP ${response.status}`);

  const declaredLength = Number(response.headers.get("content-length") || "0");
  if (declaredLength > MAX_RAW_BYTES) throw new Error("OpenITI artifact exceeds reader size limit");

  const raw = await response.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_RAW_BYTES) {
    throw new Error("OpenITI artifact exceeds reader size limit");
  }

  const parsed = parseOpenIti(raw);
  if (!parsed.segments.length) throw new Error("OpenITI artifact contains no readable segments");

  if (cache.size >= CACHE_LIMIT) {
    const firstKey = cache.keys().next().value as string | undefined;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(version.versionId, { parsed, expiresAt: Date.now() + CACHE_TTL_MS });
  return parsed;
}

export function registerOpenItiReaderRoutes(app: Express) {
  app.get("/api/content/library/read/:workId", async (req, res) => {
    const query = querySchema.safeParse(req.query);
    if (!query.success) return res.status(400).json({ message: "طلب القراءة غير صالح." });

    const work = workRegistry.find((item) => item.workId === req.params.workId);
    if (!work) return res.status(404).json({ message: "سجل الكتاب غير موجود." });

    const readableVersions = digitalVersionRegistry.filter(
      (version) => version.workId === work.workId && version.contentAvailability === "full_text_cleared",
    );
    const version = query.data.versionId
      ? readableVersions.find((item) => item.versionId === query.data.versionId)
      : readableVersions[0];

    if (!version) {
      return res.status(409).json({
        message: "لا توجد نسخة نصية مسموح بعرضها داخل المنصة لهذا العمل.",
        availability: "catalog_only",
      });
    }

    const resource = providerResourceRegistry.find(
      (item) => item.resourceId === "resource-openiti-historical-texts-pinned",
    );
    const rights = resource
      ? rightsLedger.find((item) => item.rightsId === resource.rightsId)
      : undefined;
    if (!resource || !rights) {
      return res.status(503).json({ message: "سجل حقوق القراءة غير مكتمل." });
    }

    const gate = evaluateResourceUsage(resource, rights, "full_text", "production");
    if (!gate.allowed) {
      return res.status(403).json({ message: gate.reason });
    }

    try {
      const parsed = await loadParsedBook(version);
      const cursor = Math.min(query.data.cursor, Math.max(0, parsed.segments.length - 1));
      const end = Math.min(parsed.segments.length, cursor + query.data.limit);
      const segments = parsed.segments.slice(cursor, end);

      return res.json({
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
        },
        reader: {
          cursor,
          nextCursor: end < parsed.segments.length ? end : null,
          previousCursor: cursor > 0 ? Math.max(0, cursor - query.data.limit) : null,
          totalSegments: parsed.segments.length,
          segments,
          toc: parsed.toc,
          numbering: "digital_segments_not_print_pages",
        },
        attribution: "Open Islamicate Texts Initiative (OpenITI) — pinned RELEASE commit",
        rightsUrl: "https://openiti.org/docs/Copyright_Questions.html",
      });
    } catch {
      return res.status(503).json({
        message: "تعذر تحميل النص المثبت من OpenITI الآن. سجل الكتاب وروابط المصدر ما زالت متاحة.",
      });
    }
  });
}
