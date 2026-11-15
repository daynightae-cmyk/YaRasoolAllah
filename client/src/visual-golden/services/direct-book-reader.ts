import {
  digitalVersionRegistry,
  workRegistry,
  type DigitalVersionRecord,
  type WorkRecord,
} from "@shared/knowledge-registry";
import {
  getPinnedOpenItiArtifactUrl,
  isOpenItiReaderEligible,
  isOpenItiReaderWithinBudget,
  OPENITI_READER_CONTENT_AVAILABILITY,
  OPENITI_READER_MAX_BYTES,
  OpenItiReaderBudgetError,
  readBoundedUtf8,
} from "@shared/openiti-reader-policy";

export const DIRECT_OPENITI_CONTENT_AVAILABILITY =
  OPENITI_READER_CONTENT_AVAILABILITY;
export const DIRECT_OPENITI_RIGHTS_STATE =
  "cleared_public_domain_openiti_historical_text" as const;
export const DIRECT_READER_MAX_BYTES = OPENITI_READER_MAX_BYTES;

/**
 * The direct reader has its own strict eligibility gate. Text availability and
 * rights clearance are independent facts: neither one implies the other, and
 * bibliographic, scholarly, or edition review never grants reading clearance.
 */
export function isDirectOpenItiReaderEligible(
  version: Pick<
    DigitalVersionRecord,
    "provider" | "contentAvailability" | "rightsState"
  >,
): boolean {
  return isOpenItiReaderEligible(version);
}

/** A verified artifact must fit the bounded reader before it is opened. */
export function isDirectReaderWithinBudget(
  version: Pick<DigitalVersionRecord, "artifactBytes">,
): boolean {
  return isOpenItiReaderWithinBudget(version);
}

/**
 * Identity accepted by the governed reader resolver.
 *
 * `workId` is the registry work identity. `openitiUri` may be either the
 * OpenITI work URI (as used by the large catalog) or an exact version URI.
 * Supplying both is safe only when they describe the same governed work.
 */
export interface DirectOpenItiIdentity {
  workId?: string | null;
  openitiUri?: string | null;
  versionId?: string | null;
}

export interface GovernedDirectOpenItiTarget {
  work: WorkRecord;
  version: DigitalVersionRecord;
}

const eligibleVersionsByWorkId = new Map<string, DigitalVersionRecord[]>();
for (const version of digitalVersionRegistry) {
  if (!isDirectOpenItiReaderEligible(version)) continue;
  const versions = eligibleVersionsByWorkId.get(version.workId) ?? [];
  versions.push(version);
  eligibleVersionsByWorkId.set(version.workId, versions);
}

const workByOpenitiUri = new Map<string, WorkRecord>();
for (const work of workRegistry) {
  if (work.openitiWorkUri) workByOpenitiUri.set(work.openitiWorkUri, work);
}

const workByVersionUri = new Map<string, WorkRecord>();
for (const version of digitalVersionRegistry) {
  const work = workRegistry.find((item) => item.workId === version.workId);
  if (work) workByVersionUri.set(version.openitiUri, work);
}

function resolveRegistryWork(identity: DirectOpenItiIdentity): WorkRecord | null {
  const workById = identity.workId
    ? workRegistry.find((item) => item.workId === identity.workId) ?? null
    : null;
  const uri = identity.openitiUri?.trim();
  const workByUri = uri
    ? workByOpenitiUri.get(uri)
      ?? workByVersionUri.get(uri)
      ?? workRegistry.find((item) =>
          Boolean(
            item.openitiWorkUri &&
            uri.startsWith(`${item.openitiWorkUri}.`),
          ),
        )
      ?? null
    : null;

  if (workById && workByUri && workById.workId !== workByUri.workId) {
    return null;
  }
  return workById ?? workByUri;
}

/**
 * Resolve only registry versions that pass the strict reader gate.
 *
 * The catalog is not an authority for reading clearance. It may bridge to a
 * governed version by work URI or exact version URI, but a missing, mismatched,
 * or uncleared registry record always fails closed.
 */
export function resolveEligibleDirectOpenItiVersions(
  identity: DirectOpenItiIdentity,
): DigitalVersionRecord[] {
  const work = resolveRegistryWork(identity);
  if (!work) return [];
  const versions = eligibleVersionsByWorkId.get(work.workId) ?? [];
  if (!identity.versionId) return versions;
  return versions.filter((version) => version.versionId === identity.versionId);
}

/** Resolve the exact governed work/version pair used by a reader request. */
export function resolveGovernedDirectOpenItiTarget(
  identity: DirectOpenItiIdentity,
): GovernedDirectOpenItiTarget | null {
  const work = resolveRegistryWork(identity);
  if (!work) return null;
  const version = resolveEligibleDirectOpenItiVersions({ ...identity, workId: work.workId })[0];
  if (!version || !getPinnedOpenItiRawUrl(version)) return null;
  return { work, version };
}

/** The governed registry is the only source of direct-reader versions. */
export function getEligibleDirectOpenItiVersions(
  workId?: string,
): DigitalVersionRecord[] {
  return workId
    ? resolveEligibleDirectOpenItiVersions({ workId })
    : digitalVersionRegistry.filter(isDirectOpenItiReaderEligible);
}

const PAGE_MARKER = /PageV\d{2}P\d{3}[AB]?/g;
const MAX_CACHED_BOOKS = 2;
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

export type DirectReaderErrorCode =
  | "not_governed"
  | "too_large"
  | "no_text"
  | "http"
  | "timeout"
  | "failed";

const DIRECT_READER_ERROR_MESSAGES_AR: Record<DirectReaderErrorCode, string> = {
  not_governed: "لا توجد نسخة نصية مصرح بعرضها داخل المنصة لهذا الكتاب.",
  too_large: "حجم النسخة أكبر من حد القارئ.",
  no_text: "النسخة المباشرة لا تحتوي مقاطع قابلة للقراءة.",
  http: "تعذر جلب النص من المصدر المباشر.",
  timeout: "استغرق تحميل الكتاب وقتًا أطول من المتوقع. حاول مرة أخرى.",
  failed: "تعذر فتح النص من المصدر المباشر.",
};

/** A machine-readable reader failure with a reader-facing fallback message. */
export class DirectReaderError extends Error {
  constructor(
    readonly code: DirectReaderErrorCode,
    readonly status?: number,
  ) {
    super(DIRECT_READER_ERROR_MESSAGES_AR[code]);
    this.name = "DirectReaderError";
  }
}

function toRawUrl(version: DigitalVersionRecord) {
  return getPinnedOpenItiArtifactUrl(version);
}

/**
 * The only raw text URL the reader may fetch.
 *
 * It is derived from a registry version that passes every reading gate and is
 * pinned to the approved immutable release. Catalog URLs and floating release
 * tags are deliberately not accepted.
 */
export function getPinnedOpenItiRawUrl(
  version: DigitalVersionRecord,
): string | null {
  return toRawUrl(version);
}

async function fetchPinnedText(version: DigitalVersionRecord): Promise<ParsedBook> {
  const cached = cache.get(version.versionId);
  if (cached) return cached;

  const rawUrl = getPinnedOpenItiRawUrl(version);
  if (!rawUrl) throw new DirectReaderError("not_governed");

  // Verified metadata lets the reader refuse an oversized artifact before any
  // network work. The streaming guard below still enforces the same ceiling.
  if (!isDirectReaderWithinBudget(version)) {
    throw new DirectReaderError("too_large");
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(rawUrl, {
      signal: controller.signal,
      headers: { Accept: "text/plain" },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new DirectReaderError("http", response.status);
    }

    // `content-length` may describe compressed bytes, so it is only an early
    // exit. The decoded UTF-8 budget is enforced while the body streams in.
    const declaredLength = Number(response.headers.get("content-length") || "0");
    if (declaredLength > DIRECT_READER_MAX_BYTES) {
      throw new DirectReaderError("too_large");
    }

    let raw: string;
    try {
      raw = await readBoundedUtf8(response, DIRECT_READER_MAX_BYTES);
    } catch (error) {
      if (error instanceof OpenItiReaderBudgetError) {
        throw new DirectReaderError("too_large");
      }
      throw error;
    }

    const parsed = parseOpenIti(raw);
    if (!parsed.segments.length) {
      throw new DirectReaderError("no_text");
    }

    if (cache.size >= MAX_CACHED_BOOKS) {
      const oldest = cache.keys().next().value as string | undefined;
      if (oldest) cache.delete(oldest);
    }
    cache.set(version.versionId, parsed);
    return parsed;
  } catch (error) {
    if (error instanceof DirectReaderError) throw error;
    if (controller.signal.aborted) {
      throw new DirectReaderError("timeout");
    }
    throw new DirectReaderError("failed");
  } finally {
    window.clearTimeout(timer);
  }
}

export interface DirectBookDocument {
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
  segments: ReaderSegment[];
  toc: Array<{ title: string; segmentIndex: number }>;
  attribution: string;
  rightsUrl: string;
}

/**
 * Load the complete governed document for a reader surface.
 *
 * The caller may identify the work by registry ID or OpenITI URI. No catalog
 * URL is accepted here: only a version that passes the registry gate and has a
 * pinned raw URL can reach the fetch.
 */
export async function loadDirectBookDocument(
  identity: DirectOpenItiIdentity,
): Promise<DirectBookDocument> {
  const target = resolveGovernedDirectOpenItiTarget(identity);
  if (!target) throw new DirectReaderError("not_governed");

  const parsed = await fetchPinnedText(target.version);
  const rawUrl = getPinnedOpenItiRawUrl(target.version);
  if (!rawUrl) throw new DirectReaderError("not_governed");

  return {
    work: {
      workId: target.work.workId,
      title: target.work.titleAr,
      author: target.work.authorAr,
      scholarlyReviewStatus: target.work.scholarlyReviewStatus,
    },
    version: {
      versionId: target.version.versionId,
      openitiUri: target.version.openitiUri,
      releaseCommit: target.version.releaseCommit,
      sourceUrl: target.version.sourceUrl,
      metadataUrl: target.version.versionMetadataUrl,
      rightsState: target.version.rightsState,
      rawUrl,
    },
    segments: parsed.segments,
    toc: parsed.toc,
    attribution: "Open Islamicate Texts Initiative (OpenITI) · pinned RELEASE commit",
    rightsUrl: "https://openiti.org/docs/Copyright_Questions.html",
  };
}

export async function loadDirectBookPage(args: {
  workId?: string;
  openitiUri?: string;
  cursor?: number;
  limit?: number;
  versionId?: string;
}): Promise<DirectReaderPayload> {
  const target = resolveGovernedDirectOpenItiTarget({
    workId: args.workId,
    openitiUri: args.openitiUri,
    versionId: args.versionId,
  });
  if (!target) throw new DirectReaderError("not_governed");

  const { work, version } = target;
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
      rawUrl: getPinnedOpenItiRawUrl(version) ?? "",
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
