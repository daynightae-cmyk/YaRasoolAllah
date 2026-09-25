import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Headphones,
  ShieldCheck,
  X,
} from "lucide-react";
import type { BookMode, LibraryBook } from "@/visual-golden/services/library";
import {
  loadDirectBookPage,
  type DirectReaderPayload,
} from "@/visual-golden/services/direct-book-reader";
import { AudiobookPlayer } from "./AudiobookPlayer";
import { DeviceTtsFallback } from "./DeviceTtsFallback";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./ReadingChamber.module.css";

interface Props {
  book: LibraryBook;
  initialMode?: BookMode;
  onClose: () => void;
}

type ReaderState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; data: DirectReaderPayload };

const BOOKMARK_KEY = "library-shelf-bookmarks-v1";

function safeReadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function allowedMode(book: LibraryBook, requested?: BookMode): BookMode {
  return requested && book.modes.includes(requested) ? requested : "عرض";
}

export function ReadingChamber({ book, initialMode, onClose }: Props) {
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<BookMode>(() => allowedMode(book, initialMode));
  const [cursor, setCursor] = useState(0);
  const [reader, setReader] = useState<ReaderState>({ state: "idle" });
  const [retryToken, setRetryToken] = useState(0);
  const chamberRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const currentText = useMemo(() => {
    if (reader.state !== "ready") return "";
    return reader.data.reader.segments
      .map((segment) => segment.text)
      .join("\n\n")
      .trim();
  }, [reader]);

  useEffect(() => {
    setSaved(safeReadBookmarks().includes(book.workId));
    setMode(allowedMode(book, initialMode));
    setCursor(0);
    setReader({ state: "idle" });
  }, [book, initialMode]);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !chamberRef.current) return;
      const focusable = Array.from(
        chamberRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (mode !== "قراءة" || !book.modes.includes("قراءة")) return;
    let cancelled = false;
    setReader({ state: "loading" });

    loadDirectBookPage({
      workId: book.workId,
      cursor,
      limit: 2,
    })
      .then((data) => {
        if (!cancelled) setReader({ state: "ready", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setReader({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "تعذر تحميل النص من الرابط المباشر.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [book.modes, book.workId, cursor, mode, retryToken]);

  const toggleSaved = () => {
    try {
      const current = safeReadBookmarks();
      const next = current.includes(book.workId)
        ? current.filter((id) => id !== book.workId)
        : [...current, book.workId];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      setSaved(next.includes(book.workId));
    } catch {
      setSaved((value) => !value);
    }
  };

  const switchMode = (nextMode: BookMode) => {
    if (!book.modes.includes(nextMode)) return;
    setMode(nextMode);
  };

  const catalogView = (
    <article className={styles.coverCard}>
      <img src={book.cover} alt="" />
      <div>
        <h3>{book.title}</h3>
        <p className="muted">{book.author} · {book.authorEn}</p>
        <p className="muted" style={{ fontSize: "0.78rem" }}>
          {book.titleEn} · {book.shelf}
        </p>
        <div className={styles.meta}>
          <span>{book.tag}</span>
          <span>{book.shelf}</span>
          <span>{book.versionCount} نسخة رقمية</span>
          <span>
            {book.contentAvailability === "full_text_cleared" ? "قراءة داخلية متاحة" : "سجل فهرسي فقط"}
          </span>
        </div>

        <div className={p.parchment}>
          <p style={{ margin: 0, lineHeight: 1.9 }}>{book.attributionCaveat}</p>
          <p style={{ margin: "0.6rem 0 0", lineHeight: 1.9, fontSize: "0.85rem" }}>
            {book.contentAvailability === "full_text_cleared"
              ? "النص التاريخي المتاح للقراءة يأتي من نسخة OpenITI مثبتة على commit معلوم. إتاحة النص لا تعني اعتماد الطبعة أو اكتمال المراجعة العلمية."
              : "لا توجد نسخة نصية مسموح بعرضها داخل المنصة لهذا العمل في السجل الحالي."}
          </p>
        </div>

        <div className={styles.meta} style={{ marginTop: "0.8rem" }}>
          <span>
            <ShieldCheck size={12} style={{ verticalAlign: "-2px" }} /> الببليوغرافيا:{" "}
            {book.bibliographicStatus === "verified_bibliographic" ? "موثقة" : "قيد المراجعة"}
          </span>
          <span>المراجعة العلمية: معلقة</span>
          <span>
            الإتاحة: {book.contentAvailability === "full_text_cleared" ? "نص تاريخي متاح" : "فهرس فقط"}
          </span>
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn-outline" onClick={toggleSaved}>
            <Bookmark size={14} /> {saved ? "في الرف الخاص (محلي)" : "أضف للرف الخاص (محلي)"}
          </button>
        </div>

        <details className={styles.versions}>
          <summary>تفاصيل المصدر والنسخ الرقمية ({book.versions.length})</summary>
          {book.openitiWorkUri ? <p className="muted" dir="ltr">OpenITI URI: {book.openitiWorkUri}</p> : null}
          {book.versions.length === 0 ? (
            <p className="muted">لم تُثبت أي نسخة رقمية لهذا العمل في هذا الإصدار.</p>
          ) : (
            <ul>
              {book.versions.map((version) => (
                <li key={version.versionId}>
                  <strong>نسخة نصية رقمية موصولة</strong>
                  <div className="muted">{version.editionStatement}</div>
                  <div className={styles.versionUri} dir="ltr">{version.openitiUri}</div>
                  <div className={styles.versionLinks}>
                    <a href={version.sourceUrl} target="_blank" rel="noreferrer" className="btn-outline">
                      <ExternalLink size={12} /> المصدر
                    </a>
                    <a href={version.versionMetadataUrl} target="_blank" rel="noreferrer" className="btn-outline">
                      <ExternalLink size={12} /> بيانات النسخة
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {book.externalResources.length > 0 ? (
            <div style={{ marginTop: "0.9rem" }}>
              <strong>موارد خارجية موثقة ({book.externalResources.length})</strong>
              <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.9 }}>
                ملفات وصفحات تم التحقق من وجودها لدى المصدر. الحقوق غير محسومة:
                تُفتح صفحة العنصر لدى المصدر فقط، ولا يوجد تنزيل ولا قراءة داخلية من هذه الموارد.
              </p>
              <ul>
                {book.externalResources.map((resource) => (
                  <li key={resource.resourceId}>
                    <strong>{resource.provider} · {resource.format}</strong>
                    <div className="muted">{resource.editionStatement}</div>
                    <div className="muted">
                      الحقوق: {resource.rightsState === "RIGHTS_UNCLEAR" ? "غير محسومة" : resource.rightsState === "OPEN_LICENSE" ? "ترخيص مفتوح" : "غير معلومة"}
                      {resource.fileSize ? ` · ${(resource.fileSize / 1048576).toFixed(1)} م.ب` : ""}
                    </div>
                    <div className={styles.versionLinks}>
                      <a href={resource.itemUrl} target="_blank" rel="noreferrer" className="btn-outline">
                        <ExternalLink size={12} /> صفحة العنصر لدى المصدر
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
      </div>
    </article>
  );

  const readerStatus = reader.state === "loading" ? (
    <div className={styles.readerStatus} role="status">جارٍ إحضار النص المثبت من OpenITI…</div>
  ) : reader.state === "error" ? (
    <div className={styles.readerStatus} role="alert">
      <strong>تعذر فتح النص الآن.</strong>
      <span>{reader.message}</span>
      <button type="button" className="btn-outline" onClick={() => setRetryToken((value) => value + 1)}>
        حاول مرة أخرى
      </button>
    </div>
  ) : null;

  const readingView = reader.state === "ready" ? (
    <div className={styles.readerLayout}>
      <aside className={styles.toc} aria-label="فهرس العناوين">
        <strong>فهرس النص</strong>
        <p>العناوين مستخرجة من بنية OpenITI، وليست فهرس طبعة مطبوعة.</p>
        <div>
          {reader.data.reader.toc.length ? (
            reader.data.reader.toc.map((item) => (
              <button
                type="button"
                key={`${item.segmentIndex}-${item.title}`}
                onClick={() => setCursor(item.segmentIndex)}
                className={item.segmentIndex === reader.data.reader.cursor ? styles.tocOn : ""}
              >
                {item.title}
              </button>
            ))
          ) : (
            <span className="muted">لا توجد عناوين بنيوية كافية في هذه النسخة.</span>
          )}
        </div>
      </aside>

      <div className={styles.readerPaper}>
        <header className={styles.readerHeading}>
          <div>
            <span>قراءة مباشرة · OpenITI</span>
            <strong>{book.title}</strong>
          </div>
          <small>
            مقطع رقمي {reader.data.reader.cursor + 1} من {reader.data.reader.totalSegments}
          </small>
        </header>

        <article className={styles.readerText} dir="rtl">
          {reader.data.reader.segments.map((segment) =>
            segment.kind === "heading" ? (
              <h3 key={segment.index}>{segment.text}</h3>
            ) : (
              <div key={segment.index}>
                {segment.text.split("\n\n").map((paragraph, paragraphIndex) => (
                  <p key={`${segment.index}-${paragraphIndex}`}>{paragraph}</p>
                ))}
                {segment.locator ? <small className={styles.locator}>{segment.locator}</small> : null}
              </div>
            ),
          )}
        </article>

        <footer className={styles.readerNav}>
          <button
            type="button"
            className="btn-outline"
            disabled={reader.data.reader.previousCursor === null}
            onClick={() => setCursor(reader.data.reader.previousCursor ?? 0)}
          >
            <ChevronRight size={15} /> السابق
          </button>
          <span>الترقيم هنا مقاطع رقمية، وليس أرقام صفحات طبعة.</span>
          <button
            type="button"
            className="btn-outline"
            disabled={reader.data.reader.nextCursor === null}
            onClick={() => setCursor(reader.data.reader.nextCursor ?? cursor)}
          >
            التالي <ChevronLeft size={15} />
          </button>
        </footer>

        <div className={styles.readerSource}>
          <span>{reader.data.attribution}</span>
          <a href={reader.data.version.sourceUrl} target="_blank" rel="noreferrer">
            رابط النسخة الأصلية <ExternalLink size={12} />
          </a>
          <a href={reader.data.rightsUrl} target="_blank" rel="noreferrer">
            سياسة الحقوق <ExternalLink size={12} />
          </a>
        </div>

        <DeviceTtsFallback text={currentText} />
      </div>
    </div>
  ) : null;

  const audiobookView = book.audiobook ? (
    <AudiobookPlayer audiobook={book.audiobook} />
  ) : null;

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        ref={chamberRef}
        className={styles.chamber}
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title} — مكتب القراءة والكتاب الصوتي`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.bar}>
          <strong className="gold-text">{book.title}</strong>
          <div className={styles.tabs} role="tablist" aria-label="وضع الكتاب">
            {book.modes.map((item) => {
              const Icon = item === "عرض" ? Eye : item === "قراءة" ? BookOpen : Headphones;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={mode === item}
                  className={mode === item ? styles.on : ""}
                  onClick={() => switchMode(item)}
                >
                  <Icon size={14} />
                  {item}
                </button>
              );
            })}
          </div>
          <button ref={closeRef} type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق مكتب القراءة">
            <X size={14} />
          </button>
        </header>

        <div className={styles.desk}>
          <div className={styles.lamp} aria-hidden>
            <div className={styles.lampHead} />
            <div className={styles.lampArm} />
          </div>
          <div className={styles.glow} />
          <div className={styles.stage}>
            {mode === "عرض" ? catalogView : mode === "قراءة" ? readerStatus : null}
            {mode === "قراءة" ? readingView : null}
            {mode === "Audiobook" ? audiobookView : null}
          </div>
        </div>
      </div>
    </div>
  );
}
