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

interface PageFaceProps {
  page?: MushafReadingPage<QuranVerse>;
  side: "right" | "left";
  selectedAyah: number;
  onSelectAyah(ayah: number): void;
  chapterName: string;
  fontScale: number;
  lineHeight: number;
  back?: boolean;
}

function PageFace({ page, side, selectedAyah, onSelectAyah, chapterName, fontScale, lineHeight, back = false }: PageFaceProps) {
  return (
    <div
      className={`${styles.paper} ${side === "right" ? styles.right : styles.left} ${back ? styles.back : ""}`}
      data-quran-page={back ? undefined : side}
      aria-label={page ? `${side === "right" ? "الصفحة اليمنى" : "الصفحة اليسرى"}، الآيات ${page.firstAyah} إلى ${page.lastAyah}` : "صفحة ختام السورة"}
    >
      <div className={styles.ornament} aria-hidden="true"><span /></div>
      <div className={styles.pageHeading}>
        <span>سورة {chapterName}</span>
        {page ? <small>الآيات {page.firstAyah}–{page.lastAyah}</small> : null}
      </div>
      <div
        className={styles.verses}
        style={{ fontSize: `calc(clamp(1.03rem, 1.65vw, 1.5rem) * ${fontScale})`, lineHeight }}
      >
        {page ? page.verses.map((verse) => (
          <button
            type="button"
            key={`${verse.surah}:${verse.ayah}`}
            className={`${styles.ayah} ${verse.ayah === selectedAyah ? styles.ayahOn : ""}`}
            onClick={() => onSelectAyah(verse.ayah)}
            aria-pressed={verse.ayah === selectedAyah}
            title={`الآية ${verse.ayah}`}
            tabIndex={back ? -1 : 0}
          >
            <span lang="ar">{verse.arabic}</span>
            <span className={styles.ayahNumber} aria-label={`الآية ${verse.ayah}`}>{verse.ayah}</span>
          </button>
        )) : (
          <div className={styles.endMark}><BookOpen aria-hidden="true" /><span>نهاية السورة</span></div>
        )}
      </div>
      <div className={styles.pageFoot} aria-hidden="true"><i />{page ? `${page.firstAyah} · ${page.lastAyah}` : "﷽"}<i /></div>
    </div>
  );
}

export function QuranMushafBook({
  verses,
  chapterName,
  selectedAyah,
  onSelectAyah,
  canPreviousChapter,
  canNextChapter,
  onPreviousChapter,
  onNextChapter,
  fontScale,
  lineHeight,
}: QuranMushafBookProps) {
  const pages = useMemo(() => buildMushafReadingPages(verses), [verses]);
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
    const raw = drag.direction === 1 ? -delta / (width * 0.42) : delta / (width * 0.42);
    setTurn((current) => current ? { ...current, progress: clamp(raw), dragging: true } : current);
  };

  const cornerPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setTurn((current) => {
      if (!current) return null;
      const thrownForward = drag.direction === 1 ? drag.velocity < -0.45 : drag.velocity > 0.45;
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
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  };
  const touchEnded = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null || turn) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const distance = end - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) < 56) return;
    startTurn(distance < 0 ? 1 : -1);
  };

  const currentRight = pages[spreadIndex * 2];
  const currentLeft = pages[spreadIndex * 2 + 1];
  const targetRight = turn ? pages[turn.to * 2] : undefined;
  const targetLeft = turn ? pages[turn.to * 2 + 1] : undefined;
  const visualProgress = turn ? (turn.dragging ? turn.progress : settle(turn.progress)) : 0;
  const angle = visualProgress * 180;
  const lift = Math.sin(visualProgress * Math.PI);
  const leafStyle = turn ? {
    "--leaf-angle": `${turn.direction === 1 ? -angle : angle}deg`,
    "--leaf-lift": lift,
    "--leaf-curl": `${lift * 4.5}deg`,
  } as CSSProperties : undefined;
  const baseRight = turn?.direction === 1 ? targetRight : turn && visualProgress >= 0.5 ? targetRight : currentRight;
  const baseLeft = turn?.direction === -1 ? targetLeft : turn && visualProgress >= 0.5 ? targetLeft : currentLeft;
  const leafFront = turn?.direction === 1 ? currentRight : currentLeft;
  const leafBack = turn?.direction === 1 ? targetLeft : targetRight;
  const sharedFaceProps = { selectedAyah, onSelectAyah, chapterName, fontScale, lineHeight };

  return (
    <section className={styles.mushaf} data-visual="quran-mushaf" data-spread-count="1" data-reduced-motion={reduced ? "true" : "false"} aria-label="المصحف — كتاب واحد مفتوح على صفحتين">
      <div className={styles.readingStatus}>
        <span><BookOpen size={15} aria-hidden="true" /> كتاب واحد · صفحتان</span>
        <span>تقسيم قراءة للسورة، وليس ترقيم المصحف المدني</span>
      </div>

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
        <div className={styles.cover} aria-hidden="true" />
        <div className={styles.pageStack} aria-hidden="true" />
        <div className={styles.baseSpread} data-visual="quran-spread">
          <PageFace {...sharedFaceProps} page={baseRight} side="right" />
          <PageFace {...sharedFaceProps} page={baseLeft} side="left" />
        </div>
        <div className={styles.binding} aria-hidden="true" />
        {turn ? (
          <>
            <div
              className={`${styles.turnShadow} ${turn.direction === 1 ? styles.shadowNext : styles.shadowPrevious}`}
              style={{ opacity: lift * 0.65, transform: `translateX(${turn.direction === 1 ? -visualProgress * 65 : visualProgress * 65}%)` }}
              aria-hidden="true"
            />
            <div
              className={`${styles.leaf} ${turn.direction === 1 ? styles.leafNext : styles.leafPrevious}`}
              style={leafStyle}
              data-visual="quran-turning-leaf"
              aria-hidden="true"
            >
              <div className={styles.face}>
                <PageFace {...sharedFaceProps} page={leafFront} side={turn.direction === 1 ? "right" : "left"} />
              </div>
              <div className={`${styles.face} ${styles.reverseFace}`}>
                <PageFace {...sharedFaceProps} page={leafBack} side={turn.direction === 1 ? "left" : "right"} back />
              </div>
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
        ><span aria-hidden="true" /></button>
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
        ><span aria-hidden="true" /></button>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => startTurn(-1)} disabled={!canPreviousChapter && spreadIndex <= 0}>
          <ChevronRight size={18} aria-hidden="true" /> الموضع السابق
        </button>
        <label>
          <span>موضع القراءة</span>
          <select aria-label="اختيار موضع القراءة" value={spreadIndex} onChange={(event) => goToSpread(Number(event.target.value))} disabled={Boolean(turn)}>
            {Array.from({ length: spreadCount }, (_, index) => {
              const right = pages[index * 2];
              const left = pages[index * 2 + 1];
              return <option key={index} value={index}>{index + 1} / {spreadCount} · الآيات {right?.firstAyah}–{left?.lastAyah ?? right?.lastAyah}</option>;
            })}
          </select>
        </label>
        <button type="button" onClick={() => startTurn(1)} disabled={!canNextChapter && spreadIndex >= spreadCount - 1}>
          الموضع التالي <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.motionButton}
          aria-pressed={userReduced || systemReduced}
          disabled={systemReduced}
          onClick={() => setUserReduced((value) => !value)}
          title={systemReduced ? "تقليل الحركة مفعّل من إعدادات النظام" : "بديل فوري دون حركة الورقة"}
        >
          <Feather size={15} aria-hidden="true" /> {systemReduced ? "تقليل الحركة مفعّل" : userReduced ? "تفعيل حركة الورقة" : "قراءة دون حركة"}
        </button>
      </div>
      <p className={styles.instructions}>اضغط زاوية الورقة أو اسحبها · مرّر أفقيًا على الهاتف · استخدم الأسهم وPage Up / Page Down</p>
      <span className={styles.srOnly} aria-live="polite">الموضع {spreadIndex + 1} من {spreadCount}. الآيات {currentRight?.firstAyah} إلى {currentLeft?.lastAyah ?? currentRight?.lastAyah}.</span>
    </section>
  );
}
