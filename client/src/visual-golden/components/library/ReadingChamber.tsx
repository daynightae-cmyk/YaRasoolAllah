import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Headphones,
  Pause,
  Play,
  ShieldCheck,
  Square,
  Volume2,
  X,
} from "lucide-react";
import type { BookMode, LibraryBook } from "@/visual-golden/services/library";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./ReadingChamber.module.css";

interface Props {
  book: LibraryBook;
  initialMode?: BookMode;
  onClose: () => void;
}

interface ReaderPayload {
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
  };
  reader: {
    cursor: number;
    nextCursor: number | null;
    previousCursor: number | null;
    totalSegments: number;
    segments: Array<{
      index: number;
      kind: "heading" | "paragraph";
      text: string;
      locator: string | null;
    }>;
    toc: Array<{ title: string; segmentIndex: number }>;
    numbering: "digital_segments_not_print_pages";
  };
  attribution: string;
  rightsUrl: string;
}

type ReaderState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; data: ReaderPayload };

type SpeechState = "idle" | "playing" | "paused" | "error";

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
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const chamberRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      openerRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (mode === "عرض" || !book.modes.includes("قراءة")) return;
    const controller = new AbortController();
    setReader({ state: "loading" });

    fetch(
      `/api/content/library/read/${encodeURIComponent(book.workId)}?cursor=${cursor}&limit=2`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const body = (await response.json()) as ReaderPayload | { message?: string };
        if (!response.ok) {
          throw new Error("message" in body && body.message ? body.message : `HTTP ${response.status}`);
        }
        return body as ReaderPayload;
      })
      .then((data) => setReader({ state: "ready", data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setReader({
          state: "error",
          message: error instanceof Error ? error.message : "تعذر تحميل النص.",
        });
      });

    return () => controller.abort();
  }, [book.modes, book.workId, cursor, mode]);

  useEffect(() => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setSpeechState("idle");
  }, [cursor, mode, speechSupported]);

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
    if (speechSupported) window.speechSynthesis.cancel();
    setSpeechState("idle");
    setMode(nextMode);
  };

  const startSpeech = () => {
    if (!speechSupported || !currentText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.lang = "ar-SA";
    const arabicVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeechState("idle");
    utterance.onerror = () => setSpeechState("error");
    window.speechSynthesis.speak(utterance);
    setSpeechState("playing");
  };

  const pauseSpeech = () => {
    if (!speechSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    setSpeechState("paused");
  };

  const resumeSpeech = () => {
    if (!speechSupported || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    setSpeechState("playing");
  };

  const stopSpeech = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setSpeechState("idle");
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

        {book.openitiWorkUri ? (
          <p className="muted" style={{ fontSize: "0.75rem", direction: "ltr", textAlign: "end" }}>
            OpenITI: {book.openitiWorkUri}
          </p>
        ) : (
          <p className="muted" style={{ fontSize: "0.75rem" }}>
            لا توجد نسخة OpenITI مثبتة لهذا العمل في هذا الإصدار.
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className="btn-outline" onClick={toggleSaved}>
            <Bookmark size={14} /> {saved ? "في الرف الخاص (محلي)" : "أضف للرف الخاص (محلي)"}
          </button>
        </div>

        <div className={styles.versions}>
          <h4>النسخ الرقمية ({book.versions.length})</h4>
          {book.versions.length === 0 ? (
            <p className="muted">لم تُثبت أي نسخة رقمية لهذا العمل في هذا الإصدار.</p>
          ) : (
            <ul>
              {book.versions.map((version) => (
                <li key={version.versionId}>
                  <div className={styles.versionUri}>{version.openitiUri}</div>
                  <div className="muted">{version.editionStatement}</div>
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
        </div>
      </div>
    </article>
  );

  const readerStatus = reader.state === "loading" ? (
    <div className={styles.readerStatus} role="status">جارٍ إحضار النص المثبت من OpenITI…</div>
  ) : reader.state === "error" ? (
    <div className={styles.readerStatus} role="alert">
      <strong>تعذر فتح النص الآن.</strong>
      <span>{reader.message}</span>
      <button type="button" className="btn-outline" onClick={() => setCursor((value) => value)}>
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
            <span>قراءة داخلية · OpenITI</span>
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
            النسخة المثبتة <ExternalLink size={12} />
          </a>
          <a href={reader.data.rightsUrl} target="_blank" rel="noreferrer">
            سياسة الحقوق <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  ) : null;

  const listeningView = reader.state === "ready" ? (
    <div className={styles.listenDesk}>
      <div className={styles.listenDisc} aria-hidden>
        <Headphones size={42} />
      </div>
      <div className={styles.listenBody}>
        <span className={styles.listenKicker}>قراءة صوتية آلية من جهازك</span>
        <h3>{book.title}</h3>
        <p>
          هذه ليست نسخة صوتية أصلية للكتاب ولا تسجيلًا منسوبًا لمؤلف أو قارئ. يستخدم المتصفح
          محرك تحويل النص إلى كلام على المقطع المفتوح فقط، ويبدأ التشغيل باختيارك.
        </p>
        <div className={`${styles.wave} ${speechState === "playing" ? styles.playing : ""}`} aria-hidden>
          {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
        </div>
        {!speechSupported ? (
          <div className={styles.speechWarning}>متصفحك لا يوفر Speech Synthesis؛ القراءة النصية ما زالت متاحة.</div>
        ) : (
          <div className={styles.audioControls}>
            {speechState === "playing" ? (
              <button type="button" className="btn-gold" onClick={pauseSpeech}><Pause size={15} /> إيقاف مؤقت</button>
            ) : speechState === "paused" ? (
              <button type="button" className="btn-gold" onClick={resumeSpeech}><Play size={15} /> متابعة</button>
            ) : (
              <button type="button" className="btn-gold" onClick={startSpeech} disabled={!currentText}>
                <Play size={15} /> استمع للمقطع
              </button>
            )}
            <button type="button" className="btn-outline" onClick={stopSpeech} disabled={speechState === "idle"}>
              <Square size={14} /> إيقاف
            </button>
            <span><Volume2 size={14} /> العربية · حسب الأصوات المتاحة في جهازك</span>
          </div>
        )}
        {speechState === "error" ? (
          <div className={styles.speechWarning} role="alert">تعذر تشغيل القراءة الآلية على هذا الجهاز.</div>
        ) : null}
        <div className={styles.listenExcerpt} dir="rtl">
          {reader.data.reader.segments.map((segment) => (
            <p key={segment.index}>{segment.text}</p>
          ))}
        </div>
        <div className={styles.readerNav}>
          <button
            type="button"
            className="btn-outline"
            disabled={reader.data.reader.previousCursor === null}
            onClick={() => setCursor(reader.data.reader.previousCursor ?? 0)}
          >
            <ChevronRight size={15} /> المقطع السابق
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={reader.data.reader.nextCursor === null}
            onClick={() => setCursor(reader.data.reader.nextCursor ?? cursor)}
          >
            المقطع التالي <ChevronLeft size={15} />
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        ref={chamberRef}
        className={styles.chamber}
        role="dialog"
        aria-modal="true"
        aria-label={`${book.title} — مكتب القراءة والاستماع`}
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
            {mode === "عرض" ? catalogView : readerStatus}
            {mode === "قراءة" ? readingView : null}
            {mode === "استماع" ? listeningView : null}
          </div>
        </div>
      </div>
    </div>
  );
}
