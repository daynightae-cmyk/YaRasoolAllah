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

export function canReadTextInside(work: CatalogWork): boolean {
  const digital = work.digital;
  if (!digital?.fileUrl || !isOpenRights(work)) return false;
  return digital.format === "TXT_MARKDOWN"
    || digital.reading === "CAN_IMPORT_TEXT"
    || (digital.searchableText && !digital.format.includes("OCR"));
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
  const state = digital.download.toUpperCase();
  return !state.includes("BLOCK")
    && !state.includes("RESTRICT")
    && !state.includes("REVIEW")
    && state !== "NONE"
    && state !== "NO";
}

export function displayTitle(work: CatalogWork, lang: "ar" | "en") {
  return (lang === "ar" ? work.titleAr || work.titleEn : work.titleEn || work.titleAr)
    || (lang === "ar" ? "عمل بلا عنوان مثبت" : "Untitled catalog work");
}

export function displayAuthor(work: CatalogWork, lang: "ar" | "en") {
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
