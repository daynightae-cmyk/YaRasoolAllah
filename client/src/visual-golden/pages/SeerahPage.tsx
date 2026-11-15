import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  BookOpenCheck,
  Map,
  BookOpen,
  Feather,
  Compass,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import p from "@/visual-golden/components/present/present.module.css";
import u from "@/visual-golden/components/unique/unique.module.css";
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
  type SeerahSelection,
} from "@/visual-golden/services/seerah";
import {
  SEERAH_GRAPH,
  SEERAH_GRAPH_COUNTS,
  SEERAH_GRAPH_DEFERRED,
  SEERAH_GRAPH_EDGE_LABELS,
  getSeerahEventNode,
  type SeerahGraphEventNode,
} from "@/visual-golden/services/seerah-graph";
import styles from "./SeerahPage.module.css";

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
  art.reciterKaaba,
  art.lanternGlow,
  art.kaaba,
  art.storyHijrah,
  art.reciterDome,
  art.desert,
  art.mosque,
  art.mushafOpen,
];

export function SeerahPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const [read, setRead] = useState<string[]>(() => safeReadRead());
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);
  const selection = useMemo(
    () => resolveSeerahSelection(CHAPTERS, search),
    [search],
  );

  const index = Math.max(0, CHAPTERS.findIndex((chapter) => chapter.id === selection.chapterId));
  const chapter = CHAPTERS[index] ?? CHAPTERS[0];
  const related = useMemo(() => getRelatedChapters(chapter.id), [chapter.id]);
  const events = chapter.timelineEvents ?? [];
  const selectedEvent = events.find((event) => event.id === selection.eventId) ?? null;
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

  return (
    <div className={styles.page}>
      <PageHero
        title="درب السيرة"
        subtitle={`رحلة سردية · ${SEERAH_COUNTS.chapters} فصول · ${SEERAH_COUNTS.categories} مرحلة`}
        desc="بنية تحريرية محلية لفصول السيرة ومحطاتها — المراحل والتسلسل سرديان لا تقويمًا تاريخيًا دقيقًا"
        image={art.desert}
        tall
        wing="seerah"
      >
        <div className={styles.heroBtns}>
          <button
            className="btn-gold"
            type="button"
            onClick={() => document.getElementById("seerah-journey")?.scrollIntoView({ behavior: "smooth" })}
          >
            ابدأ الرحلة
          </button>
          <Link href="/atlas" className="btn-outline">
            <Map size={14} /> الخريطة التخطيطية
          </Link>
        </div>
      </PageHero>

      <section className={styles.timelineWrap} id="seerah-journey" aria-label="فصول السيرة بالترتيب السردي">
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="الفصل السابق">
          <ChevronRight size={17} />
        </button>
        <div className={styles.timeline}>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.stage} ${i === index ? styles.stageOn : ""}`}
              onClick={() => selectChapter(c.id)}
              aria-current={i === index ? "true" : undefined}
            >
              <img src={STAGE_ART[i % STAGE_ART.length]} alt="" />
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

      <div className={styles.main}>
        <aside className={styles.panel}>
          <SectionHead title="محطات الفصل" en="Local editorial chapter events · review pending" />
          {events.length === 0 ? (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              لا توجد محطات في البنية التحريرية المحلية لهذا الفصل.
            </p>
          ) : (
            <ol className={styles.events} aria-label="محطات الفصل">
              {events.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className={`${styles.eventButton} ${selectedEvent?.id === e.id ? styles.evOn : ""}`}
                    aria-pressed={selectedEvent?.id === e.id}
                    onClick={() => selectEvent({ chapterId: chapter.id, eventId: e.id })}
                  >
                    <img src={STAGE_ART[(e.title.length + index) % STAGE_ART.length]} alt="" />
                    <span className={styles.eventText}>
                      <span>{e.date}</span>
                      <strong>{e.title}</strong>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <section className={styles.mapCard}>
          <SectionHead title={chapter.title} en={`Local editorial chapter ${chapter.order} · narrative context`} />
          <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.8 }}>
            {SEERAH_CONTENT_STATUS.noticeAr}
          </p>
          <p style={{ lineHeight: 2, fontSize: "0.95rem" }}>{chapter.description}</p>
          <p className="muted" style={{ lineHeight: 2, fontSize: "0.86rem", whiteSpace: "pre-line" }}>
            {chapter.details.split("\n\n")[0]}
          </p>
          {selectedEvent ? (
            <article className={styles.eventDetail} aria-live="polite" aria-label="تفاصيل المحطة المختارة">
              <span className={styles.eventLabel}>المحطة المختارة من البنية التحريرية المحلية</span>
              <h3>{selectedEvent.title}</h3>
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
              </dl>
              {place ? (
                <Link href={`/atlas?place=${encodeURIComponent(place.nodeId)}`} className={styles.eventLink}>
                  <Map size={13} /> شاهد {place.name} في الأطلس التخطيطي
                </Link>
              ) : (
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
          ) : null}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            {chapter.keywords.slice(0, 6).map((keyword) => (
              <span
                key={keyword}
                style={{
                  fontSize: "0.72rem",
                  border: "1px solid rgba(212,160,23,0.35)",
                  borderRadius: 999,
                  padding: "0.15rem 0.55rem",
                  color: "var(--text-secondary)",
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button type="button" className="btn-outline" onClick={() => step(-1)} disabled={index <= 0}>
              <ChevronRight size={13} /> الفصل السابق
            </button>
            <button
              type="button"
              className="btn-gold"
              onClick={toggleRead}
            >
              <BookOpenCheck size={13} /> {read.includes(chapter.id) ? "تمت القراءة محليًا ✓" : "تعليم كمقروء محليًا"}
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
        </section>

        <aside className={styles.panel}>
          <SectionHead title="المراحل السردية" en="Narrative phases" />
          <div className={styles.miles}>
            {CATEGORIES.map((category) => (
              <article key={category.id}>
                <img src={STAGE_ART[category.chapters.length % STAGE_ART.length]} alt="" />
                <span>
                  {category.name} · {category.chapters.length} {category.chapters.length === 1 ? "فصل" : "فصول"}
                </span>
              </article>
            ))}
            <article>
              <img src={art.books} alt="" />
              <span>الفصول المقروءة محليًا: {readCount} من {CHAPTERS.length}</span>
            </article>
          </div>
        </aside>
      </div>

      <div className={styles.lower}>
        <section className={styles.panel}>
          <SectionHead title="فصول مرتبطة" en="Related chapters" />
          <div className={styles.figures}>
            {related.length === 0 ? (
              <span className="muted">لا توجد روابط مسجلة لهذا الفصل.</span>
            ) : (
              related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectChapter(r.id)}
                >
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
            {[...new Set(events.map((e) => e.location).filter(Boolean))].join(" · ") || "غير محددة كبنية مواقع"}.
            أي تمثيل بصري للمواقع تخطيطي وليس إحداثيات تاريخية دقيقة.
          </p>
        </section>
        <section className={styles.panel}>
          <SectionHead title="رحلتك في تعلم السيرة" en="Local progress only" />
          <p>{readCount} من {CHAPTERS.length} فصول مقروءة محليًا</p>
          <div className={styles.bar}>
            <i style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}% · تقدّم محلي على هذا الجهاز فقط</span>
        </section>
      </div>
    </div>
  );
}
