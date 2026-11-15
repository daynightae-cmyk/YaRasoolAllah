import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { DeviceTtsFallback } from "./DeviceTtsFallback";
import {
  buildPresentationEmbedUrl,
  canDownloadInside,
  canReadPdfInside,
  canReadTextInside,
  canUseIiifInside,
  canViewPresentationInside,
  displayAuthor,
  displayTitle,
  getGovernedReaderVersion,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import {
  DirectReaderError,
  getPinnedOpenItiRawUrl,
  loadDirectBookDocument,
  type DirectBookDocument,
  type DirectReaderErrorCode,
} from "@/visual-golden/services/direct-book-reader";
import { formatLabel, rightsLabel } from "@/visual-golden/services/library-catalog-presentation";
import styles from "./CatalogReadingChamber.module.css";

interface Props {
  work: CatalogWork;
  onClose: () => void;
}

type ReaderState =
  | { state: "idle" | "loading" }
  | { state: "error"; code: DirectReaderErrorCode; status?: number }
  | { state: "ready"; document: DirectBookDocument };

/**
 * Stable, translatable failure codes come from the governed reader service.
 * The interface chooses its own language; the service never decides which
 * language the reader sees.
 */
const READER_ERRORS: Record<DirectReaderErrorCode, { ar: string; en: string }> = {
  not_governed: {
    ar: "لا توجد نسخة نصية مؤهلة للقراءة داخل المنصة لهذا العمل.",
    en: "No text version is currently cleared for in-app reading for this work.",
  },
  too_large: {
    ar: "حجم النص أكبر من حد القارئ الداخلي.",
    en: "This text is larger than the internal reader limit.",
  },
  no_text: {
    ar: "المورد لا يحتوي نصًا قابلاً للعرض.",
    en: "This resource contains no displayable text.",
  },
  http: {
    ar: "تعذّر جلب النص من المصدر (HTTP).",
    en: "The text could not be fetched from its source (HTTP).",
  },
  timeout: {
    ar: "استغرق تحميل النص وقتًا أطول من المتوقع.",
    en: "Loading the text took longer than expected.",
  },
  failed: {
    ar: "تعذر فتح النص.",
    en: "The text could not be opened.",
  },
};

function readerErrorMessage(
  code: DirectReaderErrorCode,
  status: number | undefined,
  lang: "ar" | "en" | "fr" | "ur",
): string {
  const base = READER_ERRORS[code][lang === "ar" ? "ar" : "en"];
  return code === "http" && status ? `${base} (${status})` : base;
}
const READER_POSITION_KEY = "library-reader-position-v1";

/** Stored positions are user data from a previous session, so they are clamped. */
function readStoredPage(workId: string, totalPages: number): number {
  try {
    const raw = window.localStorage.getItem(READER_POSITION_KEY);
    if (!raw) return 1;
    const stored = JSON.parse(raw) as Record<string, number>;
    const value = Number(stored[workId]);
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.min(Math.floor(value), Math.max(1, totalPages));
  } catch {
    return 1;
  }
}

function writeStoredPage(workId: string, page: number) {
  try {
    const raw = window.localStorage.getItem(READER_POSITION_KEY);
    const stored = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    stored[workId] = page;
    window.localStorage.setItem(READER_POSITION_KEY, JSON.stringify(stored));
  } catch {
    // A reader without storage still reads; it just cannot resume.
  }
}
const PAGE_SIZE = 24;

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar");
}

export function CatalogReadingChamber({ work, onClose }: Props) {
  const lang = useInstitution((state) => state.lang);
  const title = displayTitle(work, lang);
  const author = displayAuthor(work, lang);
  const governedVersion = getGovernedReaderVersion(work);
  const pinnedRawUrl = governedVersion ? getPinnedOpenItiRawUrl(governedVersion) : null;
  const textAvailable = canReadTextInside(work) && Boolean(pinnedRawUrl);
  const pdfAvailable = canReadPdfInside(work);
  const iiifAvailable = canUseIiifInside(work);
  const downloadAvailable = canDownloadInside(work);
  const presentationAvailable = canViewPresentationInside(work);
  const presentationUrl = buildPresentationEmbedUrl(work);
  // Both catalogued scripts are right-to-left, so the direction is not in doubt;
  // what differed was the language: 8,755 Arabic and 351 Persian records, and the
  // article carried no lang attribute at all, so a Persian text was announced as
  // Arabic and assistive technology was given no language to work from.
  const textLanguage = work.language === "per" ? "fa" : "ar";
  const textDirection: "rtl" | "ltr" = "rtl";
  const [mode, setMode] = useState<"details" | "text" | "pdf" | "iiif" | "presentation">("details");
  const [reader, setReader] = useState<ReaderState>({ state: "idle" });
  const [page, setPage] = useState(1);
  // A stored position is user data from a previous session. The reader must
  // hydrate that value before it is allowed to write anything back; otherwise
  // the initial page (1) overwrites the real resume position during mount.
  const [hydratedWorkId, setHydratedWorkId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fontScale, setFontScale] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus went into the dialog, so it has to come back out. Previously the
    // reader closed and left focus on the body, losing the reader's place in
    // the catalog entirely.
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [onClose]);

  useEffect(() => {
    // A new work starts uninitialized. No page write is permitted until the
    // new work's stored position has been read and clamped.
    setHydratedWorkId(null);
    setPage(1);
    setMode("details");
    setReader({ state: "idle" });
  }, [work.id]);

  useEffect(() => {
    if (reader.state !== "ready") return;
    const totalPages = Math.max(1, Math.ceil(reader.document.segments.length / PAGE_SIZE));
    setPage(readStoredPage(work.id, totalPages));
    setHydratedWorkId(work.id);
  }, [reader.state, work.id]);

  useEffect(() => {
    if (hydratedWorkId !== work.id) return;
    writeStoredPage(work.id, page);
  }, [hydratedWorkId, page, work.id]);

  useEffect(() => {
    if (mode !== "text" || !textAvailable || !governedVersion) return;
    let active = true;
    setReader({ state: "loading" });
    loadDirectBookDocument({
      workId: work.id,
      openitiUri: governedVersion.openitiUri,
      versionId: governedVersion.versionId,
    })
      .then((document) => {
        if (active) setReader({ state: "ready", document });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setReader({
          state: "error",
          code: error instanceof DirectReaderError ? error.code : "failed",
          status: error instanceof DirectReaderError ? error.status : undefined,
        });
      });
    return () => {
      active = false;
    };
  }, [governedVersion, mode, textAvailable, work.id]);

  const matchedSegments = useMemo(() => {
    if (reader.state !== "ready") return [];
    const needle = normalize(query.trim());
    if (!needle) return reader.document.segments;
    return reader.document.segments.filter((segment) =>
      normalize(segment.text).includes(needle),
    );
  }, [query, reader]);

  const totalPages = Math.max(1, Math.ceil(matchedSegments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSegments = matchedSegments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const spokenText = pageSegments.map((segment) => segment.text).join("\n\n");

  const copy = lang === "ar" ? {
    details: "الكتاب",
    text: "قراءة",
    pdf: "PDF",
    iiif: "المخطوط/الصور",
    presentation: "عرض شرائح",
    download: "تحميل",
    source: "المصادر والتوثيق",
    rights: "حالة الحقوق",
    versions: "النسخ الرقمية",
    editions: "الطبعات",
    noInternal: "هذا العمل موجود على الرف، لكن المورد الحالي لم يجتز شروط العرض الداخلي بعد. يبقى الكتاب داخل المكتبة ولا نطرد القارئ إلى موقع آخر.",
    loading: "جارٍ فتح النص داخل غرفة القراءة…",
    search: "ابحث داخل هذا الكتاب…",
    page: "صفحة رقمية",
    previous: "السابق",
    next: "التالي",
    listen: "استمع إلى النص الحالي",
  } : {
    details: "Book",
    text: "Read",
    pdf: "PDF",
    iiif: "Scan / IIIF",
    presentation: "Slides",
    download: "Download",
    source: "Sources & provenance",
    rights: "Rights state",
    versions: "Digital versions",
    editions: "Editions",
    noInternal: "This work remains on the shelf, but its current resource has not passed the internal-display rules yet. The reader is not sent away as the primary experience.",
    loading: "Opening the text inside the Reading Chamber…",
    search: "Search inside this book…",
    page: "Digital page",
    previous: "Previous",
    next: "Next",
    listen: "Listen to the current text",
  };

  return (
    <div className={styles.scrim} role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={styles.chamber}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <span>{work.category || (lang === "ar" ? "المكتبة" : "Library")}</span>
            <strong>{title}</strong>
            <small>{author}</small>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={lang === "ar" ? "إغلاق" : "Close"}>
            <X size={17} />
          </button>
        </header>

        <nav className={styles.tabs} role="tablist" aria-label={lang === "ar" ? "أوضاع الكتاب" : "Book modes"}>
          <button type="button" role="tab" aria-selected={mode === "details"} className={mode === "details" ? styles.on : ""} onClick={() => setMode("details")}>
            <FileText size={14} /> {copy.details}
          </button>
          {textAvailable ? (
            <button type="button" role="tab" aria-selected={mode === "text"} className={mode === "text" ? styles.on : ""} onClick={() => setMode("text")}>
              <BookOpen size={14} /> {copy.text}
            </button>
          ) : null}
          {pdfAvailable ? (
            <button type="button" role="tab" aria-selected={mode === "pdf"} className={mode === "pdf" ? styles.on : ""} onClick={() => setMode("pdf")}>
              <FileText size={14} /> {copy.pdf}
            </button>
          ) : null}
          {iiifAvailable ? (
            <button type="button" role="tab" aria-selected={mode === "iiif"} className={mode === "iiif" ? styles.on : ""} onClick={() => setMode("iiif")}>
              <BookOpen size={14} /> {copy.iiif}
            </button>
          ) : null}
          {presentationAvailable && presentationUrl ? (
            <button type="button" role="tab" aria-selected={mode === "presentation"} className={mode === "presentation" ? styles.on : ""} onClick={() => setMode("presentation")}>
              <FileText size={14} /> {copy.presentation}
            </button>
          ) : null}
          {downloadAvailable && pinnedRawUrl ? (
            <a href={pinnedRawUrl} download>
              <Download size={14} /> {copy.download}
            </a>
          ) : null}
        </nav>

        <div className={styles.body}>
          {mode === "details" ? (
            <article className={styles.details}>
              <div className={styles.cover}>
                <span>✦</span>
                <strong>{title}</strong>
                <small>{author}</small>
              </div>
              <div className={styles.meta}>
                <dl>
                  <div><dt>{copy.editions}</dt><dd>{work.editionCount.toLocaleString(lang)}</dd></div>
                  <div><dt>{copy.versions}</dt><dd>{work.versionCount.toLocaleString(lang)}</dd></div>
                  <div><dt>{copy.rights}</dt><dd>{work.digital?.rights ? rightsLabel(work.digital.rights, lang) : (lang === "ar" ? "غير مثبتة" : "Not established")}</dd></div>
                  <div><dt>{lang === "ar" ? "الصيغة" : "Format"}</dt><dd>{work.digital?.format ? formatLabel(work.digital.format, lang) : (lang === "ar" ? "غير مثبتة" : "Not established")}</dd></div>
                </dl>
                {!textAvailable && !pdfAvailable && !iiifAvailable && !presentationAvailable ? <p className={styles.notice}>{copy.noInternal}</p> : null}
                <details className={styles.provenance}>
                  <summary><ShieldCheck size={14} /> {copy.source}</summary>
                  <p>{work.source}</p>
                  {work.sourceUrl ? <a href={work.sourceUrl} target="_blank" rel="noreferrer">{lang === "ar" ? "سجل المصدر" : "Source record"} <ExternalLink size={12} /></a> : null}
                  {work.digital?.itemUrl ? <a href={work.digital.itemUrl} target="_blank" rel="noreferrer">{lang === "ar" ? "صفحة المورد" : "Resource record"} <ExternalLink size={12} /></a> : null}
                </details>
              </div>
            </article>
          ) : null}

          {mode === "text" ? (
            <section
              className={styles.reader}
              data-reader-governed={reader.state === "ready" ? "true" : undefined}
              data-reader-version-id={reader.state === "ready" ? reader.document.version.versionId : governedVersion?.versionId}
              data-reader-provider={governedVersion?.provider}
              data-reader-content-availability={governedVersion?.contentAvailability}
              data-reader-rights-state={governedVersion?.rightsState}
              data-reader-release-commit={governedVersion?.releaseCommit}
              data-reader-raw-url={reader.state === "ready" ? reader.document.version.rawUrl : pinnedRawUrl ?? undefined}
            >
              {reader.state === "loading" || reader.state === "idle" ? <div className={styles.state} role="status">{copy.loading}</div> : null}
              {reader.state === "error" ? <div className={styles.state} role="alert">{readerErrorMessage(reader.code, reader.status, lang)}</div> : null}
              {reader.state === "ready" ? (
                <>
                  <div className={styles.tools}>
                    <label>
                      <Search size={14} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} aria-label={lang === "ar" ? "بحث داخل نص الكتاب" : "Search inside the book text"} />
                    </label>
                    <button type="button" aria-label={lang === "ar" ? "تصغير الخط" : "Decrease text size"} onClick={() => setFontScale((value) => Math.max(.9, value - .05))}><Minus size={14} /></button>
                    <span>{Math.round(fontScale * 100)}%</span>
                    <button type="button" aria-label={lang === "ar" ? "تكبير الخط" : "Increase text size"} onClick={() => setFontScale((value) => Math.min(1.4, value + .05))}><Plus size={14} /></button>
                  </div>
                  <div className={styles.readerIdentity}>
                    <strong>{lang === "ar" ? "قراءة داخلية" : "In-app reading"} · OpenITI</strong>
                    <span>
                      {lang === "ar"
                        ? `نسخة ${reader.document.version.versionId} مثبتة على إصدار ${reader.document.version.releaseCommit.slice(0, 12)}.`
                        : `Version ${reader.document.version.versionId}, pinned to release ${reader.document.version.releaseCommit.slice(0, 12)}.`}
                      {" · "}
                      {lang === "ar"
                        ? "الترقيم هنا مقاطع رقمية وليس أرقام صفحات طبعة إلا إذا نص المورد على ذلك."
                        : "The numbering here is digital segments, not print page numbers, unless the source states otherwise."}
                    </span>
                    <a href={reader.document.version.sourceUrl} target="_blank" rel="noreferrer">
                      {lang === "ar" ? "سجل النسخة المثبتة" : "Pinned version record"}
                      {" "}<ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                  <article className={styles.paper} dir={textDirection} lang={textLanguage} style={{ fontSize: `calc(1.08rem * ${fontScale})` }}>
                    {pageSegments.map((segment) => (
                      segment.kind === "heading"
                        ? <h3 key={segment.index}>{segment.text}</h3>
                        : <p key={segment.index}>{segment.text}</p>
                    ))}
                  </article>
                  <footer className={styles.pager}>
                    <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                      <ChevronRight size={15} /> {copy.previous}
                    </button>
                    <span>{copy.page} {currentPage.toLocaleString(lang)} / {totalPages.toLocaleString(lang)}</span>
                    <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                      {copy.next} <ChevronLeft size={15} />
                    </button>
                  </footer>
                  <div className={styles.listen}>
                    <Headphones size={16} />
                    <span>{copy.listen}</span>
                    <DeviceTtsFallback text={spokenText} />
                  </div>
                </>
              ) : null}
            </section>
          ) : null}

          {mode === "pdf" && work.digital?.fileUrl ? (
            <iframe className={styles.frame} src={work.digital.fileUrl} title={title} />
          ) : null}

          {mode === "iiif" && work.digital?.iiifUrl ? (
            <iframe className={styles.frame} src={work.digital.iiifUrl} title={title} />
          ) : null}

          {mode === "presentation" && presentationUrl ? (
            <section className={styles.reader}>
              <div className={styles.readerIdentity}>
                <strong>{lang === "ar" ? "عرض PowerPoint داخل المكتبة" : "PowerPoint inside the library"}</strong>
                <span>
                  {lang === "ar"
                    ? "العرض يتم داخل إطار المؤسسة عبر Microsoft Office Web Viewer؛ الملف الأصلي يبقى في مصدره ولا تعيد المنصة استضافته."
                    : "The deck stays at its governed source and is rendered inside the institution through Microsoft Office Web Viewer."}
                </span>
              </div>
              <iframe
                className={styles.frame}
                src={presentationUrl}
                title={`${title} · ${copy.presentation}`}
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
