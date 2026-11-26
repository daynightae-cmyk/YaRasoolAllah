import {
  getPinnedOpenItiRawUrl,
  isDirectReaderWithinBudget,
  resolveEligibleDirectOpenItiVersions,
} from "@/visual-golden/services/direct-book-reader";
import type { DigitalVersionRecord } from "@shared/knowledge-registry";

export interface CatalogDigitalVersion {
  id: string;
  provider: string;
  itemUrl: string | null;
  fileUrl: string | null;
  iiifUrl: string | null;
  format: string;
  rights: string;
  download: string;
  reading: string;
  ocrAvailable: boolean;
  searchableText: boolean;
}

export interface CatalogWork {
  id: string;
  titleAr: string | null;
  titleEn: string | null;
  authorAr: string | null;
  authorEn: string | null;
  deathHijri: string | null;
  category: string | null;
  subcategory: string | null;
  language: string | null;
  status: string;
  source: string;
  sourceUrl: string | null;
  openitiUri: string | null;
  editionCount: number;
  versionCount: number;
  digital: CatalogDigitalVersion | null;
}

export interface CatalogPayload {
  schemaVersion: number;
  sourceVersion: string;
  rightsNotice: string;
  counts: {
    works: number;
    editions: number;
    digitalVersions: number;
    openitiWorks: number;
    pendingSeedWorks: number;
  };
  works: CatalogWork[];
}

let catalogPromise: Promise<CatalogPayload> | null = null;

export function loadFullLibraryCatalog(): Promise<CatalogPayload> {
  if (!catalogPromise) {
    catalogPromise = fetch("/data/library-catalog.v1.json", { cache: "force-cache" }).then(async (response) => {
      if (!response.ok) throw new Error(`تعذر تحميل فهرس المكتبة (HTTP ${response.status}).`);
      return (await response.json()) as CatalogPayload;
    });
  }
  return catalogPromise;
}

const OPEN_RIGHTS = new Set([
  "CLEARED_WITH_ATTRIBUTION",
  "PUBLIC_DOMAIN",
  "OPEN_LICENSE",
  "PROVIDER_ALLOWS_ACCESS",
]);

export function isOpenRights(work: CatalogWork): boolean {
  return Boolean(work.digital && OPEN_RIGHTS.has(work.digital.rights));
}

function catalogVersionUri(
  work: Pick<CatalogWork, "digital">,
): string | null {
  const id = work.digital?.id;
  if (!id) return null;
  const prefix = "openiti_dv_";
  return id.startsWith(prefix) ? id.slice(prefix.length) : null;
}

/**
 * Bridge a catalog row to the governed reader registry.
 *
 * The catalog's own `CAN_IMPORT_TEXT` flag is research metadata, not reading
 * clearance. The version returned here has independently passed provider,
 * content-availability, rights, immutable-release, and bounded-size checks.
 * When the catalog names an exact OpenITI version, that exact version is
 * preferred if it fits the reader.
 */
export function getGovernedReaderVersion(
  work: Pick<CatalogWork, "id" | "openitiUri" | "digital">,
): DigitalVersionRecord | null {
  const versionUri = catalogVersionUri(work);
  if (versionUri) {
    const exact = resolveEligibleDirectOpenItiVersions({ openitiUri: versionUri });
    if (exact[0] && isDirectReaderWithinBudget(exact[0])) return exact[0];
  }

  const byWork = resolveEligibleDirectOpenItiVersions({
    workId: work.id,
    openitiUri: work.openitiUri,
  });
  return byWork.find(isDirectReaderWithinBudget) ?? null;
}

/**
 * In-app text is available only when both sides agree: the catalog row has an
 * open text record, and that row resolves to a governed eligible registry
 * version. Either side alone is insufficient.
 */
export function canReadTextInside(work: CatalogWork): boolean {
  const digital = work.digital;
  if (!digital?.fileUrl || !isOpenRights(work)) return false;
  if (digital.format !== "TXT_MARKDOWN") return false;
  if (digital.reading !== "CAN_IMPORT_TEXT" && !digital.searchableText) return false;
  const version = getGovernedReaderVersion(work);
  return Boolean(version && getPinnedOpenItiRawUrl(version));
}

export function canReadPdfInside(work: CatalogWork): boolean {
  const digital = work.digital;
  return Boolean(digital?.fileUrl && isOpenRights(work) && digital.format === "PDF");
}

export function canUseIiifInside(work: CatalogWork): boolean {
  return Boolean(work.digital?.iiifUrl && isOpenRights(work));
}

export function canViewPresentationInside(work: CatalogWork): boolean {
  const digital = work.digital;
  if (!digital?.fileUrl || !isOpenRights(work)) return false;
  const format = digital.format.trim().toUpperCase();
  return format === "PPT"
    || format === "PPTX"
    || format.includes("POWERPOINT")
    || format.includes("PRESENTATION");
}

export function buildPresentationEmbedUrl(work: CatalogWork): string | null {
  if (!canViewPresentationInside(work) || !work.digital?.fileUrl) return null;
  try {
    const source = new URL(work.digital.fileUrl);
    if (source.protocol !== "https:") return null;
    const viewer = new URL("https://view.officeapps.live.com/op/embed.aspx");
    viewer.searchParams.set("src", source.toString());
    return viewer.toString();
  } catch {
    return null;
  }
}

export function canDownloadInside(work: CatalogWork): boolean {
  const digital = work.digital;
  if (!digital?.fileUrl || !isOpenRights(work)) return false;
  if (!getGovernedReaderVersion(work)) return false;
  const state = digital.download.toUpperCase();
  return !state.includes("BLOCK")
    && !state.includes("RESTRICT")
    && !state.includes("REVIEW")
    && state !== "NONE"
    && state !== "NO";
}

export function displayTitle(work: CatalogWork, lang: "ar" | "en" | "fr" | "ur") {
  return (lang === "ar" ? work.titleAr || work.titleEn : work.titleEn || work.titleAr)
    || (lang === "ar" ? "عمل بلا عنوان مثبت" : "Untitled catalog work");
}

export function displayAuthor(work: CatalogWork, lang: "ar" | "en" | "fr" | "ur") {
  return (lang === "ar" ? work.authorAr || work.authorEn : work.authorEn || work.authorAr)
    || (lang === "ar" ? "المؤلف غير مثبت" : "Author not established");
}

export function hashWorkId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * What the Library can *actually* open, derived from the loaded catalog by
 * applying the same governed gate functions the reader uses.
 *
 * The catalog's own `counts.digitalVersions` is the raw research-pipeline row
 * count, not an in-app reading entitlement. Most attached catalog rows have a
 * text URL and a research `CAN_IMPORT_TEXT` flag but do not resolve to the
 * governed OpenITI version registry. They are counted separately as catalog
 * text pending review; only `readableText` may be described as readable now.
 */
export interface CatalogCapabilityReport {
  works: number;
  withDigitalRecord: number;
  readableText: number;
  catalogTextOnly: number;
  readablePdf: number;
  iiif: number;
  presentation: number;
  downloadable: number;
  metadataOnly: number;
  formats: Record<string, number>;
}

export function catalogCapabilityReport(payload: CatalogPayload): CatalogCapabilityReport {
  const formats: Record<string, number> = {};
  const report: CatalogCapabilityReport = {
    works: payload.works.length,
    withDigitalRecord: 0,
    readableText: 0,
    catalogTextOnly: 0,
    readablePdf: 0,
    iiif: 0,
    presentation: 0,
    downloadable: 0,
    metadataOnly: 0,
    formats,
  };

  for (const work of payload.works) {
    if (!work.digital) {
      report.metadataOnly += 1;
      continue;
    }
    report.withDigitalRecord += 1;
    formats[work.digital.format] = (formats[work.digital.format] ?? 0) + 1;
    if (canReadTextInside(work)) {
      report.readableText += 1;
    } else if (work.digital.format === "TXT_MARKDOWN") {
      report.catalogTextOnly += 1;
    }
    if (canReadPdfInside(work)) report.readablePdf += 1;
    if (canUseIiifInside(work)) report.iiif += 1;
    if (canViewPresentationInside(work)) report.presentation += 1;
    if (canDownloadInside(work)) report.downloadable += 1;
  }

  return report;
}

/**
 * The one Arabic-aware normalization every Library search surface uses.
 * Diacritics and the common alef/ya spelling variants are folded so a reader
 * who types "القران" finds "القرآن" and a reader who types "الامام" finds
 * "الإمام". No surface keeps a private copy of this.
 */
export function normalizeCatalogSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar");
}

/**
 * True when a catalog work matches the reader's query over its real fields.
 * An empty query matches everything, so callers can use this directly as a
 * filter predicate without a separate empty-search branch.
 */
export function workMatchesCatalogQuery(work: CatalogWork, query: string): boolean {
  const needle = normalizeCatalogSearch(query.trim());
  if (!needle) return true;
  return [
    work.titleAr,
    work.titleEn,
    work.authorAr,
    work.authorEn,
    work.category,
    work.subcategory,
  ].some((value) => Boolean(value) && normalizeCatalogSearch(value as string).includes(needle));
}