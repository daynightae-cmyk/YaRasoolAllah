import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { BookOpen, ChevronLeft, ChevronRight, Feather } from "lucide-react";
import type { QuranVerse } from "@/services/quranService";
import { buildMushafReadingPages, spreadForAyah, type MushafReadingPage } from "./mushaf-pagination";
import styles from "./QuranMushafBook.module.css";

interface QuranMushafBookProps {
  verses: QuranVerse[];
  chapterName: string;
  chapterNumber: number;
  selectedAyah: number;
  onSelectAyah(ayah: number): void;
  canPreviousChapter: boolean;
  canNextChapter: boolean;
  onPreviousChapter(): void;
  onNextChapter(): void;
  fontScale: number;
  lineHeight: number;
}

type TurnDirection = 1 | -1;
interface TurnState {
  from: number;
  to: number;
  direction: TurnDirection;
  progress: number;
  dragging: boolean;
}

interface DragState {
  pointerId: number;
  direction: TurnDirection;
  startX: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const settle = (value: number) => 1 - Math.pow(1 - value, 3);

function useReducedMotion() {
  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [userReduced, setUserReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return { reduced: systemReduced || userReduced, userReduced, setUserReduced, systemReduced };
}

function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg
      viewBox="0 0 82 82"
      className={`${styles.cornerOrnament} ${styles[`corner_${position}`]}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 79C3 38 38 3 79 3" />
      <path d="M12 79C12 44 44 12 79 12" />
      <path d="M3 59C29 57 43 43 41 23C40 10 28 7 20 13C12 19 14 31 25 32C34 33 37 24 32 22" />
      <path d="M59 3C57 29 43 43 23 41C10 40 7 28 13 20C19 12 23 22 16 32" />
      <path d="M3 3L17 3L3 17Z" className={styles.cornerSolid} />
      <circle cx="24" cy="24" r="2.6" />
    </svg>
  );
}

interface PageFaceProps {
  page?: MushafReadingPage<QuranVerse>;
  side: "right" | "left";
  selectedAyah: number;
  onSelectAyah(ayah: number): void;
  chapterName: string;
  chapterNumber: number;
  fontScale: number;
  lineHeight: number;
  back?: boolean;
  interactive?: boolean;
}

function PageFace({
  page,
  side,
  selectedAyah,
  onSelectAyah,
  chapterName,
  chapterNumber,
  fontScale,
  lineHeight,
  back = false,
  interactive = true,
}: PageFaceProps) {
  const pageTextLength = page?.verses.reduce((sum, verse) => sum + verse.arabic.length, 0) ?? 0;
  const densityFit = pageTextLength > 760 ? Math.max(0.64, 760 / pageTextLength) : 1;
  const isOpening = chapterNumber === 1;
  const style = {
    "--mushaf-font-scale": fontScale,
    "--mushaf-line-height": lineHeight,
    "--mushaf-density-fit": densityFit,
  } as CSSProperties;

  return (
    <div
      className={`${styles.paper} ${side === "right" ? styles.right : styles.left} ${back ? styles.back : ""} ${isOpening ? styles.openingPage : ""}`}
      data-quran-page={back ? undefined : side}
      style={style}
      aria-label={page ? `${side === "right" ? "الصفحة اليمنى" : "الصفحة اليسرى"}، الآيات ${page.firstAyah} إلى ${page.lastAyah}` : "صفحة ختام السورة"}
    >
      <div className={styles.frame} aria-hidden="true">
        <CornerOrnament position="tl" />
        <CornerOrnament position="tr" />
        <CornerOrnament position="bl" />
        <CornerOrnament position="br" />
        <span className={styles.frameBandTop} />
        <span className={styles.frameBandBottom} />
        <span className={styles.frameBandSideRight} />
        <span className={styles.frameBandSideLeft} />
        <span className={styles.frameDiamondTop} />
        <span className={styles.frameDiamondBottom} />
      </div>

      {isOpening && side === "right" ? (
        <div className={styles.openingCrest} aria-hidden="true">
          <svg viewBox="0 0 120 64" focusable="false">
            <path d="M60 4c11 12 23 18 38 18-8 12-13 22-14 34H36c-1-12-6-22-14-34 15 0 27-6 38-18Z" />
            <path d="M60 14c7 8 15 12 24 12-5 8-8 15-9 22H45c-1-7-4-14-9-22 9 0 17-4 24-12Z" />
            <circle cx="60" cy="32" r="4" />
            <path d="M30 58h60M36 53h48" />
          </svg>
        </div>
      ) : null}

      <div className={styles.pageHeading}>
        <span>{isOpening ? "سورة الفاتحة" : `سورة ${chapterName}`}</span>
        {page ? <small>الآيات {page.firstAyah}–{page.lastAyah}</small> : null}
      </div>

      <div
        className={`${styles.verses} ${isOpening ? styles.openingVerses : ""}`}
        style={style}
      >
        {page ? page.verses.map((verse) => (
          <button
            type="button"
            key={`${verse.surah}:${verse.ayah}`}
            id={interactive && !back ? `quran-ayah-${verse.surah}-${verse.ayah}` : undefined}
            data-ayah={`${verse.surah}:${verse.ayah}`}
            className={`${styles.ayah} ${verse.ayah === selectedAyah ? styles.ayahOn : ""}`}
            onClick={() => onSelectAyah(verse.ayah)}
            aria-pressed={verse.ayah === selectedAyah}
            title={`الآية ${verse.ayah}`}
            tabIndex={back || !interactive ? -1 : 0}
          >
            <span lang="ar" className={styles.ayahText}>{verse.arabic}</span>
            <span className={styles.ayahNumber} aria-label={`الآية ${verse.ayah}`}>{verse.ayah}</span>
          </button>
        )) : (
          <div className={styles.endMark}>
            <BookOpen aria-hidden="true" />
            <span>نهاية السورة</span>
          </div>
        )}
      </div>

      <div className={styles.pageFoot} aria-hidden="true">
        <i />
        <span>{page ? `${page.firstAyah} — ${page.lastAyah}` : "تمّ"}</span>
        <i />
      </div>
    </div>
  );
}

export function QuranMushafBook({
  verses,
  chapterName,
  chapterNumber,
  selectedAyah,
  onSelectAyah,
  canPreviousChapter,
  canNextChapter,
  onPreviousChapter,
  onNextChapter,
  fontScale,
  lineHeight,
}: QuranMushafBookProps) {
  const maxVersesPerPage = chapterNumber === 1 ? 4 : 5;
  const pages = useMemo(
    () => buildMushafReadingPages(verses, 360, maxVersesPerPage),
    [verses, maxVersesPerPage],
  );
  const spreadCount = Math.max(1, Math.ceil(pages.length / 2));
  const [spreadIndex, setSpreadIndex] = useState(() => spreadForAyah(pages, selectedAyah));
  const [turn, setTurn] = useState<TurnState | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressCornerClick = useRef(false);
  const touchStart = useRef<number | null>(null);
  const selectRef = useRef(onSelectAyah);
  const previousChapterRef = useRef(onPreviousChapter);
  const nextChapterRef = useRef(onNextChapter);
  selectRef.current = onSelectAyah;
  previousChapterRef.current = onPreviousChapter;
  nextChapterRef.current = onNextChapter;
  const { reduced, userReduced, setUserReduced, systemReduced } = useReducedMotion();

  const selectSpreadPosition = useCallback((index: number) => {
    const page = pages[index * 2] ?? pages[index * 2 + 1];
    if (page) selectRef.current(page.firstAyah);
  }, [pages]);

  useEffect(() => {
    if (turn) return;
    setSpreadIndex(Math.min(spreadForAyah(pages, selectedAyah), spreadCount - 1));
  }, [pages, selectedAyah, spreadCount, turn]);

  const finishTurn = useCallback((target: number) => {
    setSpreadIndex(target);
    setTurn(null);
    selectSpreadPosition(target);
  }, [selectSpreadPosition]);

  useEffect(() => {
    if (!turn || turn.dragging) return;
    let frame = 0;
    const fromProgress = turn.progress;
    const startedAt = performance.now();
    const duration = Math.max(180, 760 * (1 - fromProgress));
    const tick = (now: number) => {
      const elapsed = clamp((now - startedAt) / duration);
      const progress = fromProgress + (1 - fromProgress) * elapsed;
      if (elapsed >= 1) {
        finishTurn(turn.to);
        return;
      }
      setTurn((current) => current && current.to === turn.to ? { ...current, progress } : current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [turn?.from, turn?.to, turn?.dragging, finishTurn]);

  const startTurn = useCallback((direction: TurnDirection, dragging = false) => {
    if (turn) return;
    const target = spreadIndex + direction;
    if (target < 0) {
      if (canPreviousChapter) previousChapterRef.current();
      return;
    }
    if (target >= spreadCount) {
      if (canNextChapter) nextChapterRef.current();
      return;
    }
    if (reduced) {
      finishTurn(target);
      return;
    }
    setTurn({ from: spreadIndex, to: target, direction, progress: dragging ? 0 : 0.015, dragging });
  }, [turn, spreadIndex, spreadCount, canPreviousChapter, canNextChapter, reduced, finishTurn]);

  const goToSpread = (target: number) => {
    const bounded = Math.min(spreadCount - 1, Math.max(0, target));
    if (bounded === spreadIndex || turn) return;
    if (reduced || Math.abs(bounded - spreadIndex) > 1) {
      finishTurn(bounded);
      return;
    }
    startTurn(bounded > spreadIndex ? 1 : -1);
  };

  const cornerPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, direction: TurnDirection) => {
    if (turn || event.button !== 0) return;
    suppressCornerClick.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      direction,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };
    startTurn(direction, true);
  };

  const cornerPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const width = bookRef.current?.clientWidth ?? 800;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const now = performance.now();
    const delta = event.clientX - drag.startX;
    drag.velocity = (event.clientX - drag.lastX) / Math.max(1, now - drag.lastTime);
    drag.lastX = event.clientX;
    drag.lastTime = now;
    drag.moved ||= Math.abs(delta) > 4;
    const raw = drag.direction === 1 ? delta / (width * 0.42) : -delta / (width * 0.42);
    setTurn((current) => current ? { ...current, progress: clamp(raw), dragging: true } : current);
  };

  const cornerPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setTurn((current) => {
      if (!current) return null;
      const thrownForward = drag.direction === 1 ? drag.velocity > 0.45 : drag.velocity < -0.45;
      if (current.progress < 0.24 && !thrownForward && drag.moved) return null;
      return { ...current, dragging: false };
    });
  };

  const cornerClick = (direction: TurnDirection) => {
    if (suppressCornerClick.current) {
      suppressCornerClick.current = false;
      return;
    }
    startTurn(direction);
  };

  const touchStarted = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStart.current = null;
    if (event.target instanceof Element && event.target.closest("[data-page-corner]")) return;
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  };
  const touchEnded = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null || turn) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const distance = end - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) < 56) return;
    startTurn(distance > 0 ? 1 : -1);
  };

  const currentRight = pages[spreadIndex * 2];
  const currentLeft = pages[spreadIndex * 2 + 1];
  const targetRight = turn ? pages[turn.to * 2] : undefined;
  const targetLeft = turn ? pages[turn.to * 2 + 1] : undefined;
  const visualProgress = turn ? (turn.dragging ? turn.progress : settle(turn.progress)) : 0;
  const angle = visualProgress * 180;
  const lift = Math.sin(visualProgress * Math.PI);
  const leafStyle = turn ? {
    "--leaf-angle": `${turn.direction === 1 ? angle : -angle}deg`,
    "--leaf-lift": lift,
    "--leaf-curl": `${lift * 4.5}deg`,
  } as CSSProperties : undefined;
  const baseRight = turn?.direction === -1 ? targetRight : turn && visualProgress >= 0.5 ? targetRight : currentRight;
  const baseLeft = turn?.direction === 1 ? targetLeft : turn && visualProgress >= 0.5 ? targetLeft : currentLeft;
  const leafFront = turn?.direction === 1 ? currentLeft : currentRight;
  const leafBack = turn?.direction === 1 ? targetRight : targetLeft;
  const sharedFaceProps = {
    selectedAyah,
    onSelectAyah,
    chapterName,
    chapterNumber,
    fontScale,
    lineHeight,
  };

  return (
    <section
      className={`${styles.mushaf} ${chapterNumber === 1 ? styles.fatihaMushaf : ""}`}
      data-visual="quran-mushaf"
      data-spread-count="1"
      data-surah={chapterNumber}
      data-reduced-motion={reduced ? "true" : "false"}
      aria-label="المصحف — كتاب واحد مفتوح على صفحتين"
      dir="rtl"
    >
      <div
        ref={bookRef}
        className={styles.book}
        dir="rtl"
        lang="ar"
        tabIndex={0}
        role="group"
        aria-label="مصحف مفتوح. السهم الأيسر للموضع التالي والأيمن للسابق. يمكن سحب زاوية الورقة."
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "PageDown") { event.preventDefault(); startTurn(1); }
          if (event.key === "ArrowRight" || event.key === "PageUp") { event.preventDefault(); startTurn(-1); }
          if (event.key === "Home") { event.preventDefault(); goToSpread(0); }
          if (event.key === "End") { event.preventDefault(); goToSpread(spreadCount - 1); }
        }}
        onTouchStart={touchStarted}
        onTouchEnd={touchEnded}
      >
        <div className={styles.pageStack} aria-hidden="true" />
        <div className={styles.cover} aria-hidden="true" />
        <div className={styles.ribbon} aria-hidden="true" />
        <div className={styles.baseSpread} data-visual="quran-spread">
          <PageFace {...sharedFaceProps} page={baseRight} side="right" />
          <PageFace {...sharedFaceProps} page={baseLeft} side="left" />
        </div>
        <div className={styles.gutter} aria-hidden="true"><span /></div>

        {turn ? (
          <>
            <div
              className={`${styles.turnShadow} ${turn.direction === 1 ? styles.shadowNext : styles.shadowPrevious}`}
              style={{
                opacity: lift * 0.7,
                transform: `translateX(${turn.direction === 1 ? -visualProgress * 62 : visualProgress * 62}%) scaleY(${0.98 + lift * 0.02})`,
              }}
              aria-hidden="true"
            />
            <div
              className={`${styles.leaf} ${turn.direction === 1 ? styles.leafNext : styles.leafPrevious}`}
              style={leafStyle}
              data-visual="quran-turning-leaf"
              aria-hidden="true"
            >
              <div className={`${styles.face} ${turn.direction === 1 ? styles.faceRight : styles.faceLeft}`}>
                <PageFace {...sharedFaceProps} page={leafFront} side={turn.direction === 1 ? "left" : "right"} interactive={false} />
              </div>
              <div className={`${styles.face} ${styles.reverseFace}`}>
                <PageFace {...sharedFaceProps} page={leafBack} side={turn.direction === 1 ? "right" : "left"} back />
              </div>
              <div className={styles.curlEdge} aria-hidden="true" />
            </div>
          </>
        ) : null}

        <button
          type="button"
          className={`${styles.corner} ${styles.cornerNext}`}
          data-page-corner="next"
          aria-label="اقلب الورقة إلى الموضع التالي"
          title="اسحب الورقة أو اضغط للتالي"
          disabled={!canNextChapter && spreadIndex >= spreadCount - 1}
          onPointerDown={(event) => cornerPointerDown(event, 1)}
          onPointerMove={cornerPointerMove}
          onPointerUp={cornerPointerUp}
          onPointerCancel={() => { dragRef.current = null; setTurn(null); }}
          onClick={() => cornerClick(1)}
        />
        <button
          type="button"
          className={`${styles.corner} ${styles.cornerPrevious}`}
          data-page-corner="previous"
          aria-label="اقلب الورقة إلى الموضع السابق"
          title="اسحب الورقة أو اضغط للسابق"
          disabled={!canPreviousChapter && spreadIndex <= 0}
          onPointerDown={(event) => cornerPointerDown(event, -1)}
          onPointerMove={cornerPointerMove}
          onPointerUp={cornerPointerUp}
          onPointerCancel={() => { dragRef.current = null; setTurn(null); }}
          onClick={() => cornerClick(-1)}
        />
      </div>

      <div className={styles.bookCaption} aria-live="polite">
        <span>{chapterName}</span>
        <span>·</span>
        <span>الموضع {spreadIndex + 1} من {spreadCount}</span>
        <span>·</span>
        <span>{currentRight?.firstAyah ?? "—"}–{currentLeft?.lastAyah ?? currentRight?.lastAyah ?? "—"}</span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => startTurn(-1)}
          disabled={!canPreviousChapter && spreadIndex <= 0}
          aria-label="الموضع السابق"
        >
          <ChevronRight size={18} aria-hidden="true" /> السابق
        </button>
        <label>
          <span>الموضع</span>
          <select
            aria-label="اختيار موضع القراءة"
            value={spreadIndex}
            onChange={(event) => goToSpread(Number(event.target.value))}
            disabled={Boolean(turn)}
          >
            {Array.from({ length: spreadCount }, (_, index) => {
              const right = pages[index * 2];
              const left = pages[index * 2 + 1];
              return (
                <option key={index} value={index}>
                  {index + 1} / {spreadCount} · {right?.firstAyah ?? "—"}–{left?.lastAyah ?? right?.lastAyah ?? "—"}
                </option>
              );
            })}
          </select>
        </label>
        <button
          type="button"
          onClick={() => startTurn(1)}
          disabled={!canNextChapter && spreadIndex >= spreadCount - 1}
          aria-label="الموضع التالي"
        >
          التالي <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.motionButton}
          aria-pressed={userReduced || systemReduced}
          disabled={systemReduced}
          onClick={() => setUserReduced((value) => !value)}
          title={systemReduced ? "تقليل الحركة مفعّل من إعدادات النظام" : "بديل فوري دون حركة الورقة"}
        >
          <Feather size={15} aria-hidden="true" /> {systemReduced ? "تقليل الحركة" : userReduced ? "تحريك الورق" : "بلا حركة"}
        </button>
      </div>
      <p className={styles.instructions}>
        اضغط زاوية الورقة أو اسحبها · مرّر أفقيًا على الهاتف · الأسهم و Page Up / Page Down
      </p>
      {!turn ? (
        <span className={styles.srOnly} aria-live="polite">
          الموضع {spreadIndex + 1} من {spreadCount}. الآيات {currentRight?.firstAyah} إلى {currentLeft?.lastAyah ?? currentRight?.lastAyah}.
        </span>
      ) : null}
    </section>
  );
}
