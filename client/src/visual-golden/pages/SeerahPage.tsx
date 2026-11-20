import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  BookOpenCheck,
  Map,
  Database,
  ScrollText,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import {
  CHAPTERS,
  CATEGORIES,
  SEERAH_CONTENT_STATUS,
  SEERAH_COUNTS,
  buildSeerahSelectionUrl,
  chooseSeerahChapter,
  chooseSeerahEvent,
  getRelatedChapters,
  resolveSeerahSelection,
  stationCountLabel,
  type SeerahSelection,
} from "@/visual-golden/services/seerah";
import { getSeerahScene } from "@/visual-golden/services/seerah-scene";
import { getGhazawatScene } from "@/visual-golden/services/seerah-ghazawat";
import { chapterWorldPlate, eventWorldPlate } from "@/visual-golden/services/seerah-worlds";
import { ChapterEnvironment } from "@/visual-golden/components/seerah/ChapterEnvironment";
import { GhazawatEnvironment } from "@/visual-golden/components/seerah/GhazawatEnvironment";
import { SeerahChapterStage } from "@/visual-golden/components/seerah/SeerahChapterStage";
import {
  SEERAH_GRAPH,
  SEERAH_GRAPH_COUNTS,
  SEERAH_GRAPH_DEFERRED,
  SEERAH_GRAPH_EDGE_LABELS,
  getSeerahEventNode,
  type SeerahGraphEventNode,
} from "@/visual-golden/services/seerah-graph";
import styles from "./SeerahPage.module.css";
import { MediaLibrarySection } from "@/visual-golden/components/media/MediaLibrarySection";

const READ_KEY = "seerah-read-chapters-v1";

function safeReadRead(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function findEvent(key: string): SeerahGraphEventNode | null {
  return SEERAH_GRAPH.events.find((event) => event.key === key) ?? null;
}

const STAGE_ART = [
  art.sceneMakkah,
  art.sceneHira,
  art.sceneDawah,
  art.sceneHijrah,
  art.sceneMadinah,
  art.sceneBadr,
  art.sceneHajj,
  art.sceneFarewell,
];

const CATEGORY_ART = [art.sceneMakkah, art.sceneDawah, art.sceneHijrah];

/** Cinematic world plate first, then the recorded Ghazwah plate, then chapter art. */
function eventThumb(eventId: string, fallbackIndex: number): string {
  const world = eventWorldPlate(eventId);
  if (world) return world;
  const scene = getGhazawatScene(eventId);
  return scene ? art[scene.plate] : STAGE_ART[fallbackIndex % STAGE_ART.length];
}

/** Chapter rail thumbnail: cinematic world plate when available, else SVG scene. */
function chapterThumb(chapterId: string, fallbackIndex: number): string {
  return chapterWorldPlate(chapterId) ?? STAGE_ART[fallbackIndex % STAGE_ART.length];
}

export function SeerahPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const [read, setRead] = useState<string[]>(() => safeReadRead());
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);
  const effectiveMotion = useEffectiveMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  const selection = useMemo(
    () => resolveSeerahSelection(CHAPTERS, search),
    [search],
  );

  const index = Math.max(0, CHAPTERS.findIndex((chapter) => chapter.id === selection.chapterId));
  const chapter = CHAPTERS[index] ?? CHAPTERS[0];
  const scene = getSeerahScene(chapter.id);

  useEffect(() => {
    const rail = timelineRef.current;
    const active = rail?.querySelector<HTMLElement>(`[data-chapter-id="${chapter.id}"]`);
    if (!rail || !active) return;
    // Horizontal only: a direct chapter link must not drag the page vertically.
    // RTL scroll offsets run from 0 downwards, so clamp on the opposite side.
    const centered = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
    const rtl = getComputedStyle(rail).direction === "rtl";
    rail.scrollTo({
      left: rtl ? Math.min(0, centered) : Math.max(0, centered),
      behavior: effectiveMotion === "reduced" ? "auto" : "smooth",
    });
  }, [chapter.id, effectiveMotion]);
  const related = useMemo(() => getRelatedChapters(chapter.id), [chapter.id]);
  const events = chapter.timelineEvents ?? [];
  const selectedEvent = events.find((event) => event.id === selection.eventId) ?? null;
  const ghazawatScene = selectedEvent ? getGhazawatScene(selectedEvent.id) : null;
  const eventNode = selectedEvent ? getSeerahEventNode(chapter.id, selectedEvent.id) : undefined;
  const place = eventNode?.place ?? null;

  const navigateToSelection = (next: SeerahSelection) => {
    navigate(buildSeerahSelectionUrl(window.location.href, next), { replace: true });
  };

  const selectChapter = (chapterId: string) => {
    navigateToSelection(chooseSeerahChapter(CHAPTERS, chapterId));
  };

  const selectEvent = (target: { chapterId: string; eventId: string }) => {
    navigateToSelection(chooseSeerahEvent(CHAPTERS, target.chapterId, target.eventId));
  };

  const previousEvent = eventNode?.previousKey ? findEvent(eventNode.previousKey) : null;
  const nextEvent = eventNode?.nextKey ? findEvent(eventNode.nextKey) : null;
  const continuedEvent = eventNode?.continuesIntoKey ? findEvent(eventNode.continuesIntoKey) : null;

  const readCount = CHAPTERS.filter((c) => read.includes(c.id)).length;
  const percent = Math.round((readCount / CHAPTERS.length) * 100);

  useEffect(() => {
    // Avoid overwriting a URL that changed between render and effect execution.
    const renderedParams = new URLSearchParams(search);
    const currentParams = new URLSearchParams(window.location.search);
    if (renderedParams.toString() !== currentParams.toString()) return;

    const canonicalUrl = buildSeerahSelectionUrl(window.location.href, selection);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (canonicalUrl !== currentUrl) {
      navigate(canonicalUrl, { replace: true });
    }
  }, [navigate, search, selection.chapterId, selection.eventId]);

  useEffect(() => {
    recordReadingProgress({
      id: "seerah",
      surface: "seerah",
      path: `/seerah?chapter=${encodeURIComponent(chapter.id)}`,
      titleAr: "السيرة النبوية",
      titleEn: "Prophetic Biography",
      locationAr: `الفصل ${chapter.order}: ${chapter.title}`,
      locationEn: `Chapter ${chapter.order}`,
      completed: readCount,
      total: CHAPTERS.length,
      unitAr: "فصلًا",
      unitEn: "chapters",
    });
  }, [chapter.id, chapter.order, chapter.title, readCount, recordReadingProgress]);

  const toggleRead = () => {
    const next = read.includes(chapter.id)
      ? read.filter((id) => id !== chapter.id)
      : [...read, chapter.id];
    setRead(next);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next));
    } catch {
      // progress remains in-memory
    }
  };

  const step = (delta: number) => {
    const next = Math.min(CHAPTERS.length - 1, Math.max(0, index + delta));
    selectChapter(CHAPTERS[next].id);
  };

  const paragraphs = chapter.details.split("\n\n").filter((paragraph) => paragraph.trim().length > 0);

  return (
    <div className={styles.page} dir="rtl" lang="ar">
      <header className={styles.journeyHead} data-visual="seerah-journey-head">
        <div className={styles.journeyCopy}>
          <p className={styles.journeyKicker}>
            <span className={styles.journeyRule} aria-hidden />
            الموسوعة الحية للسيرة النبوية
          </p>
          <h1 className={styles.journeyTitle}>درب السيرة</h1>
          <p className={styles.journeyLead}>
            رحلة سردية في المكان والزمان: من مكة إلى المدينة، ومن الغار إلى الفتح.
            كل فصلٍ مسرحٌ قائم بذاته، وكل محطةٍ تعود إلى قاعدتها الزمنية وموضعها في الأطلس.
          </p>
          <div className={styles.journeyActions}>
            <Link href="/seerah/database" className="btn-gold">
              <Database size={14} /> قاعدة السيرة الزمنية
            </Link>
            <Link href="/atlas" className="btn-outline">
              <Map size={14} /> الأطلس التاريخي
            </Link>
            <button
              type="button"
              className="btn-outline"
              onClick={() => document.getElementById("chapter-reading")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ScrollText size={14} /> اقرأ الفصل الحالي
            </button>
          </div>
        </div>
        <dl className={styles.journeyStats} aria-label="إحصاءات السيرة">
          <div>
            <dt>فصول</dt>
            <dd>{SEERAH_COUNTS.chapters}</dd>
          </div>
          <div>
            <dt>محطات</dt>
            <dd>{SEERAH_COUNTS.timelineEvents}</dd>
          </div>
          <div>
            <dt>مراحل</dt>
            <dd>{SEERAH_COUNTS.categories}</dd>
          </div>
          <div>
            <dt>مقروء</dt>
            <dd>{readCount}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.timelineWrap} id="seerah-journey" aria-label="فصول السيرة بالترتيب السردي">
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="الفصل السابق">
          <ChevronRight size={17} />
        </button>
        <div className={styles.timeline} ref={timelineRef}>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.stage} ${i === index ? styles.stageOn : ""}`}
              onClick={() => selectChapter(c.id)}
              aria-current={i === index ? "true" : undefined}
              data-chapter-id={c.id}
            >
              <img src={chapterThumb(c.id, i)} alt="" loading="lazy" />
              <b>{c.title}</b>
              <span>مرحلة {c.order} · ترتيب سردي</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => step(1)}
          aria-label="الفصل التالي"
        >
          <ChevronLeft size={17} />
        </button>
      </section>

      <SeerahChapterStage
        chapter={chapter}
        scene={scene}
        index={index}
        total={CHAPTERS.length}
        events={events}
        selectedEventId={selectedEvent?.id}
        read={read.includes(chapter.id)}
        onSelectEvent={(eventId) => selectEvent({ chapterId: chapter.id, eventId })}
        onPrevious={() => step(-1)}
        onNext={() => step(1)}
        canPrevious={index > 0}
        canNext={index < CHAPTERS.length - 1}
      />

      <ChapterEnvironment scene={scene}>
        <div className={styles.reading} id="chapter-reading" data-visual="seerah-reading">
          <div className={styles.readingMain}>
            <article className={styles.chapterArticle} aria-labelledby="chapter-reading-title">
              <div className={styles.articleMeta}>
                <span className={styles.articleBadge}>الفصل {String(chapter.order).padStart(2, "0")}</span>
                <span>{scene?.eraAr ?? "مرحلة سردية من السيرة"}</span>
                <span>{stationCountLabel(events.length)} مسجلة</span>
              </div>
              <h2 id="chapter-reading-title" className={styles.articleTitle}>
                {chapter.title}
              </h2>
              <p className={styles.articleLead}>{chapter.description}</p>
              <p className={styles.notice}>{SEERAH_CONTENT_STATUS.noticeAr}</p>

              <div className={styles.prose}>
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${chapter.id}-p-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </div>

              <div className={styles.keywords} aria-label="كلمات مفتاحية">
                {chapter.keywords.slice(0, 8).map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>

              <div className={styles.articleActions}>
                <button type="button" className="btn-outline" onClick={() => step(-1)} disabled={index <= 0}>
                  <ChevronRight size={13} /> الفصل السابق
                </button>
                <button type="button" className="btn-gold" onClick={toggleRead}>
                  <BookOpenCheck size={13} />{" "}
                  {read.includes(chapter.id) ? "تمت القراءة محليًا ✓" : "تعليم كمقروء محليًا"}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => step(1)}
                  disabled={index >= CHAPTERS.length - 1}
                >
                  الفصل التالي <ChevronLeft size={13} />
                </button>
              </div>
            </article>

            {selectedEvent ? (
              <div className={styles.eventStage} data-visual="seerah-event-stage">
                <GhazawatEnvironment scene={ghazawatScene}>
                  <header className={styles.eventHead}>
                    <div>
                      <span className={styles.eventLabel}>بيئة المكان — مشهد توضيحي غير تاريخي</span>
                      <h3 data-visual="seerah-event-title">{selectedEvent.title}</h3>
                      <p className={styles.eventEra}>
                        {ghazawatScene?.eraAr ?? selectedEvent.date}
                      </p>
                    </div>
                    <div className={styles.eventExits}>
                      {place ? (
                        <Link
                          href={`/atlas?place=${encodeURIComponent(place.nodeId)}`}
                          className={styles.eventLink}
                        >
                          <Map size={13} /> {place.name} في الأطلس
                        </Link>
                      ) : null}
                      <Link
                        href={`/seerah/database?event=${encodeURIComponent(selectedEvent.id)}`}
                        className={styles.eventLink}
                      >
                        <Database size={13} /> سجل المحطة الكامل
                      </Link>
                    </div>
                  </header>

                  <article className={styles.eventDetail} aria-live="polite" aria-label="تفاصيل المحطة المختارة">
                    <p>{selectedEvent.description}</p>
                    <dl>
                      <div>
                        <dt>التاريخ الوارد</dt>
                        <dd>{selectedEvent.date}</dd>
                      </div>
                      <div>
                        <dt>دقة التاريخ</dt>
                        <dd>غير موثقة في بيانات المحطة</dd>
                      </div>
                      <div>
                        <dt>الموضع المذكور</dt>
                        <dd>{selectedEvent.location || "غير مسجل"}</dd>
                      </div>
                      <div>
                        <dt>حالة المراجعة</dt>
                        <dd>قيد الانتظار — مادة تحريرية محلية</dd>
                      </div>
                    </dl>
                    {place ? null : (
                      <p className={styles.eventCaveat}>
                        الموضع «{eventNode?.locationText ?? "غير مسجل"}» خارج المواضع التخطيطية المعتمدة، فلا رابط خريطة له.
                      </p>
                    )}

                    {eventNode ? (
                      <section
                        className={styles.graph}
                        data-visual="seerah-event-graph"
                        aria-label="علاقات المحطة المسجلة"
                      >
                        <h3>علاقات المحطة في البنية التحريرية المحلية</h3>
                        <ul className={styles.graphList} data-graph-relations>
                          <li>
                            <span>الفصل الحاوي</span>
                            <strong>مرحلة {chapter.order} · {chapter.title}</strong>
                          </li>
                          <li>
                            <span>الموضع</span>
                            <strong>
                              {eventNode.place
                                ? `${eventNode.place.name} · موضع تخطيطي`
                                : "غير مرتبط بموضع تخطيطي"}
                            </strong>
                          </li>
                          <li>
                            <span>الترتيب داخل الفصل</span>
                            <strong>
                              {previousEvent ? "تسبقها محطة مسجّلة" : "أول محطة في الفصل"}
                              {" · "}
                              {nextEvent ? "يليها محطة مسجّلة" : "آخر محطة في الفصل"}
                            </strong>
                          </li>
                          <li>
                            <span>فصول مرتبطة مسجّلة</span>
                            <strong>
                              {related.length > 0
                                ? `${related.length} فصل · ${SEERAH_GRAPH_EDGE_LABELS["chapter-relation"]}`
                                : "لا روابط مسجّلة لهذا الفصل"}
                            </strong>
                          </li>
                        </ul>
                        <div className={styles.graphNav}>
                          {previousEvent ? (
                            <button type="button" className={styles.graphButton} onClick={() => selectEvent(previousEvent)}>
                              <ChevronRight size={13} /> {previousEvent.title}
                            </button>
                          ) : null}
                          {nextEvent ? (
                            <button type="button" className={styles.graphButton} onClick={() => selectEvent(nextEvent)}>
                              {nextEvent.title} <ChevronLeft size={13} />
                            </button>
                          ) : null}
                          {continuedEvent ? (
                            <button
                              type="button"
                              className={styles.graphButton}
                              onClick={() => selectEvent(continuedEvent)}
                            >
                              <ChevronLeft size={13} /> تكملة السرد: {continuedEvent.title}
                            </button>
                          ) : null}
                        </div>
                        <p className={styles.graphLabel}>
                          الروابط أعلاه مبنية على {SEERAH_GRAPH_EDGE_LABELS["event-sequence"]} و
                          {SEERAH_GRAPH_EDGE_LABELS["chapter-continuity"]} — ترتيب سردي لا تقويم تاريخي.
                        </p>
                        <div className={styles.graphDeferred} data-graph-deferred>
                          <h4>علاقات غير مسجّلة في البنية الحالية</h4>
                          <ul>
                            {SEERAH_GRAPH_DEFERRED.map((relation) => (
                              <li key={relation.kind}>
                                <strong>{relation.label}</strong>
                                <span>{relation.reason}</span>
                              </li>
                            ))}
                          </ul>
                          <p>
                            {SEERAH_GRAPH_COUNTS.events} محطة · {SEERAH_GRAPH_COUNTS.edges} علاقة مسجّلة ·{" "}
                            {SEERAH_GRAPH_COUNTS.deferredKinds} أنواع علاقات مؤجّلة
                          </p>
                        </div>
                      </section>
                    ) : null}
                    <p className={styles.eventCaveat}>
                      التواريخ من نصوص المادة التحريرية المحلية ولا تُحسَب منها تواريخ مطلقة.
                    </p>
                  </article>
                </GhazawatEnvironment>
              </div>
            ) : (
              <div className={styles.readingPrompt}>
                <Compass size={18} aria-hidden />
                <div>
                  <strong>اختر محطة من الفصل</strong>
                  <p>
                    كل محطة تفتح تفاصيلها وموضعها في الأطلس وسجلها في قاعدة السيرة، دون تجاوز حدود
                    البنية التحريرية المحلية.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className={styles.readingSide}>
            <section className={styles.panel}>
              <SectionHead title="محطات الفصل" en="Local editorial chapter events · review pending" />
              {events.length === 0 ? (
                <p className="muted" style={{ fontSize: "0.8rem" }}>
                  لا توجد محطات في البنية التحريرية المحلية لهذا الفصل.
                </p>
              ) : (
                <ol className={styles.events} aria-label="محطات الفصل">
                  {events.map((e, eventIndex) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className={`${styles.eventButton} ${selectedEvent?.id === e.id ? styles.evOn : ""}`}
                        aria-pressed={selectedEvent?.id === e.id}
                        onClick={() => selectEvent({ chapterId: chapter.id, eventId: e.id })}
                      >
                        <span className={styles.eventThumb}>
                          <img
                            src={eventThumb(e.id, eventIndex + index)}
                            alt=""
                            loading="lazy"
                          />
                          <i aria-hidden>{String(eventIndex + 1).padStart(2, "0")}</i>
                        </span>
                        <span className={styles.eventText}>
                          <span>{e.date}</span>
                          <strong>{e.title}</strong>
                        </span>
                        <ArrowLeft size={13} className={styles.eventArrow} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className={styles.panel}>
              <SectionHead title="المراحل السردية" en="Narrative phases" />
              <div className={styles.miles}>
                {CATEGORIES.map((category, categoryIndex) => (
                  <article key={category.id}>
                    <img
                      src={CATEGORY_ART[categoryIndex % CATEGORY_ART.length]}
                      alt=""
                      loading="lazy"
                    />
                    <span>
                      {category.name} · {category.chapters.length}{" "}
                      {category.chapters.length === 1 ? "فصل" : "فصول"}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <SectionHead title="رحلتك في تعلم السيرة" en="Local progress only" />
              <p className={styles.progressLine}>
                {readCount} من {CHAPTERS.length} فصول مقروءة محليًا
              </p>
              <div className={styles.bar}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <span className={styles.progressNote}>{percent}% · تقدّم محلي على هذا الجهاز فقط</span>
            </section>

            <section className={styles.panel}>
              <SectionHead title="فصول مرتبطة" en="Related chapters" />
              <div className={styles.figures}>
                {related.length === 0 ? (
                  <span className="muted">لا توجد روابط مسجلة لهذا الفصل.</span>
                ) : (
                  related.map((r) => (
                    <button key={r.id} type="button" onClick={() => selectChapter(r.id)}>
                      فصل {r.order} · {r.title}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <SectionHead title="المواقع في السيرة" en="Schematic — not GIS" href="/atlas" action="عرض الخريطة" />
              <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.9 }}>
                المواقع المذكورة في هذا الفصل:{" "}
                {[...new Set(events.map((e) => e.location).filter(Boolean))].join(" · ") ||
                  "غير محددة كبنية مواقع"}
                . أي تمثيل بصري للمواقع تخطيطي وليس إحداثيات تاريخية دقيقة.
              </p>
            </section>
          </aside>
        </div>
      </ChapterEnvironment>

      <MediaLibrarySection
        kind="seerah"
        title="مسرح السيرة والميديا"
        subtitle="سلاسل سيرة ومحاضرات وخطب من صفحات الفيديو العامة، مع اسم القناة والناشر ورابط المصدر تحت كل بطاقة."
      />

      <section className={styles.closing} aria-label="متابعة الرحلة">
        <div>
          <p className={styles.closingKicker}>متابعة الرحلة</p>
          <h2>من الفصل إلى المكان، ومن المكان إلى المصدر</h2>
          <p>
            هذه البنية تحفظ الفصل بين السرد والمكان والمصدر. انتقل إلى الأطلس لترى الموضع التخطيطي،
            أو إلى القاعدة الزمنية لترى سجل الحدث وحالته ومراجعه.
          </p>
        </div>
        <div className={styles.closingActions}>
          <Link href="/atlas" className="btn-gold">
            <Map size={14} /> افتح الأطلس
          </Link>
          <Link href="/seerah/database" className="btn-outline">
            <Database size={14} /> قاعدة السيرة
          </Link>
        </div>
      </section>
    </div>
  );
}
