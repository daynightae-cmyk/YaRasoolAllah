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
  canDownloadInside,
  canReadPdfInside,
  canReadTextInside,
  canUseIiifInside,
  displayAuthor,
  displayTitle,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import styles from "./CatalogReadingChamber.module.css";

interface Props {
  work: CatalogWork;
  onClose: () => void;
}

type ReaderState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; segments: string[] };

const PAGE_SIZE = 24;
const MAX_BYTES = 12 * 1024 * 1024;
const PAGE_MARKER = /PageV\d{2}P\d{3}[AB]?/g;

function cleanText(raw: string) {
  const splitter = "#META#Header#End#";
  const body = raw.includes(splitter) ? raw.slice(raw.indexOf(splitter) + splitter.length) : raw;
  return body
    .replace(/\r/g, "")
    .replace(PAGE_MARKER, "")
    .replace(/^#META#.*$/gm, "")
    .replace(/^######?OpenITI#.*$/gm, "")
    .replace(/^###\s+\|+/gm, "\n\n### ")
    .replace(/^~~\s*/gm, "")
    .replace(/^#\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function segmentText(text: string) {
  const parts = text
    .split(/\n\n+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const segments: string[] = [];
  let buffer = "";
  for (const part of parts) {
    if (buffer.length + part.length > 2400 && buffer) {
      segments.push(buffer);
      buffer = "";
    }
    buffer += `${buffer ? "\n\n" : ""}${part}`;
  }
  if (buffer) segments.push(buffer);
  return segments;
}

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
  const textAvailable = canReadTextInside(work);
  const pdfAvailable = canReadPdfInside(work);
  const iiifAvailable = canUseIiifInside(work);
  const downloadAvailable = canDownloadInside(work);
  const [mode, setMode] = useState<"details" | "text" | "pdf" | "iiif">(
    textAvailable ? "text" : pdfAvailable ? "pdf" : iiifAvailable ? "iiif" : "details",
  );
  const [reader, setReader] = useState<ReaderState>({ state: "idle" });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [fontScale, setFontScale] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (mode !== "text" || !textAvailable || !work.digital?.fileUrl) return;
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20_000);
    setReader({ state: "loading" });
    fetch(work.digital.fileUrl, {
      signal: controller.signal,
      cache: "force-cache",
      headers: { Accept: "text/plain" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const declared = Number(response.headers.get("content-length") || "0");
        if (declared > MAX_BYTES) throw new Error("حجم النص أكبر من حد القارئ الداخلي.");
        const raw = await response.text();
        if (new Blob([raw]).size > MAX_BYTES) throw new Error("حجم النص أكبر من حد القارئ الداخلي.");
        const segments = segmentText(cleanText(raw));
        if (!segments.length) throw new Error("المورد لا يحتوي نصًا قابلاً للعرض.");
        if (active) setReader({ state: "ready", segments });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setReader({
          state: "error",
          message: controller.signal.aborted
            ? "استغرق تحميل النص وقتًا أطول من المتوقع."
            : error instanceof Error ? error.message : "تعذر فتح النص.",
        });
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [mode, textAvailable, work.digital?.fileUrl]);

  const matchedSegments = useMemo(() => {
    if (reader.state !== "ready") return [];
    const needle = normalize(query.trim());
    if (!needle) return reader.segments;
    return reader.segments.filter((segment) => normalize(segment).includes(needle));
  }, [query, reader]);

  const totalPages = Math.max(1, Math.ceil(matchedSegments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSegments = matchedSegments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const spokenText = pageSegments.join("\n\n");

  useEffect(() => setPage(1), [query, mode, work.id]);

  const copy = lang === "ar" ? {
    details: "الكتاب",
    text: "اقرأ",
    pdf: "PDF",
    iiif: "المخطوط/الصور",
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

        <nav className={styles.tabs} aria-label={lang === "ar" ? "أوضاع الكتاب" : "Book modes"}>
          <button type="button" className={mode === "details" ? styles.on : ""} onClick={() => setMode("details")}>
            <FileText size={14} /> {copy.details}
          </button>
          {textAvailable ? (
            <button type="button" className={mode === "text" ? styles.on : ""} onClick={() => setMode("text")}>
              <BookOpen size={14} /> {copy.text}
            </button>
          ) : null}
          {pdfAvailable ? (
            <button type="button" className={mode === "pdf" ? styles.on : ""} onClick={() => setMode("pdf")}>
              <FileText size={14} /> {copy.pdf}
            </button>
          ) : null}
          {iiifAvailable ? (
            <button type="button" className={mode === "iiif" ? styles.on : ""} onClick={() => setMode("iiif")}>
              <BookOpen size={14} /> {copy.iiif}
            </button>
          ) : null}
          {downloadAvailable && work.digital?.fileUrl ? (
            <a href={work.digital.fileUrl} download>
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
                  <div><dt>{copy.rights}</dt><dd>{work.digital?.rights || (lang === "ar" ? "غير مثبتة" : "Not established")}</dd></div>
                  <div><dt>{lang === "ar" ? "الصيغة" : "Format"}</dt><dd>{work.digital?.format || "—"}</dd></div>
                </dl>
                {!textAvailable && !pdfAvailable && !iiifAvailable ? <p className={styles.notice}>{copy.noInternal}</p> : null}
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
            <section className={styles.reader}>
              {reader.state === "loading" || reader.state === "idle" ? <div className={styles.state}>{copy.loading}</div> : null}
              {reader.state === "error" ? <div className={styles.state} role="alert">{reader.message}</div> : null}
              {reader.state === "ready" ? (
                <>
                  <div className={styles.tools}>
                    <label>
                      <Search size={14} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
                    </label>
                    <button type="button" onClick={() => setFontScale((value) => Math.max(.9, value - .05))}><Minus size={14} /></button>
                    <span>{Math.round(fontScale * 100)}%</span>
                    <button type="button" onClick={() => setFontScale((value) => Math.min(1.4, value + .05))}><Plus size={14} /></button>
                  </div>
                  <article className={styles.paper} dir="rtl" style={{ fontSize: `calc(1.08rem * ${fontScale})` }}>
                    {pageSegments.map((segment, index) => {
                      const heading = segment.startsWith("### ");
                      return heading
                        ? <h3 key={index}>{segment.replace(/^###\s*/, "")}</h3>
                        : <p key={index}>{segment}</p>;
                    })}
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
        </div>
      </section>
    </div>
  );
}
