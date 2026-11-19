import { useEffect, useMemo, useState } from "react";
import { Puzzle, Palette, Lightbulb, Star, BookOpen, Users, FileText, ExternalLink, Film, Heart, Leaf } from "lucide-react";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { ColoringStudio } from "@/visual-golden/components/unique/ColoringStudio";
import { StoryTheatre } from "@/visual-golden/components/present/StoryTheatre";
import { KidsTVRoom } from "@/visual-golden/components/kids-tv/KidsTVRoom";
import { MediaLibrarySection } from "@/visual-golden/components/media/MediaLibrarySection";
import {
  KIDS_COUNTS,
  KIDS_STORIES,
  ageBandLabel,
  countDistinctSeenKidsAdaptations,
  hasThreeStoryKidsBadge,
  isRegisteredKidsAdaptationId,
  kidsAdaptationPosition,
  kidsAdaptationSources,
} from "@/visual-golden/services/kids";
import styles from "./KidsPage.module.css";
import { PARENT_DISCOVERY_SOURCES } from "@shared/kids-media-governance";

const SEEN_KEY = "kids-seen-adaptations-v1";

function safeReadSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function KidsPage() {
  const [theatre, setTheatre] = useState(false);
  const [coloring, setColoring] = useState(false);
  const [seen, setSeen] = useState<string[]>(() => safeReadSeen());
  const [colorSessions, setColorSessions] = useState(0);
  const [activeRoom, setActiveRoom] = useState<"stories" | "parents">("stories");
  const [activeAdaptationId, setActiveAdaptationId] = useState("");
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);

  const current = KIDS_STORIES.find((story) => story.adaptationId === activeAdaptationId) ?? null;
  const currentSources = useMemo(() => (current ? kidsAdaptationSources(current) : []), [current]);
  const currentPosition = useMemo(
    () => (current ? kidsAdaptationPosition(current.adaptationId) : { index: -1, total: KIDS_STORIES.length }),
    [current],
  );
  const seenCount = useMemo(() => countDistinctSeenKidsAdaptations(seen), [seen]);
  const threeStoryEarned = useMemo(() => hasThreeStoryKidsBadge(seen), [seen]);

  useEffect(() => {
    if (!current) return;
    recordReadingProgress({
      id: "kids",
      surface: "kids",
      path: "/kids",
      titleAr: "الأطفال والعماية",
      titleEn: "Children and Family",
      locationAr: current.titleAr,
      locationEn: current.adaptationLabel,
      completed: seenCount,
      total: KIDS_STORIES.length,
      unitAr: "قصة",
      unitEn: "stories",
    });
  }, [current, recordReadingProgress, seenCount]);

  const markSeen = (adaptationId: string) => {
    if (!isRegisteredKidsAdaptationId(adaptationId)) return;
    setSeen((prev) => {
      if (prev.includes(adaptationId)) return prev;
      const next = [...prev, adaptationId];
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        // seen remains in-memory
      }
      return next;
    });
  };

  const openCurrentStory = () => {
    if (!current) return;
    markSeen(current.adaptationId);
    setTheatre(true);
  };

  /** Move to the previous/next registered adaptation and keep the theatre open. */
  const openRelativeStory = (offset: number) => {
    if (!KIDS_STORIES.length) return;
    const base = currentPosition.index >= 0 ? currentPosition.index : 0;
    const nextIndex = (base + offset + KIDS_STORIES.length) % KIDS_STORIES.length;
    const next = KIDS_STORIES[nextIndex];
    if (!next) return;
    setActiveAdaptationId(next.adaptationId);
    markSeen(next.adaptationId);
    setTheatre(true);
  };

  const badges = useMemo(
    () => [
      {
        title: "مستكشف القصص",
        en: threeStoryEarned ? `فُتحت ${seenCount} قصص محليًا ✓` : `افتح 3 قصص (${seenCount}/3 محليًا)`,
        earned: threeStoryEarned,
      },
      {
        title: "صديق التلوين",
        en: colorSessions >= 1 ? `جلسة تلوين محلية ✓` : "جرّب استوديو التلوين",
        earned: colorSessions >= 1,
      },
      {
        title: "قارئ صغير",
        en: seenCount >= 1 ? `قراءة محلية ✓` : "افتح أول قصة",
        earned: seenCount >= 1,
      },
      {
        title: "رفيق التعلّم",
        en: "تقدّم محلي على هذا الجهاز فقط",
        earned: false,
      },
    ],
    [seenCount, threeStoryEarned, colorSessions],
  );

  return (
    <div className={styles.page}>
      <section className={styles.garden} aria-label="مسارات واحة الأطفال">
        <div className={styles.gardenIntro}>
          <span className={styles.gardenMark}><Leaf size={18} aria-hidden="true" /> واحة الأطفال</span>
          <h2>كل حكاية تفتح بابًا للخير</h2>
          <p>شاهدوا الحلقات التعليمية داخل مسرح النور، ثم انتقلوا للقصص والأنشطة ومعلومات المصادر عند الحاجة.</p>
        </div>
        <div className={styles.gardenPaths} role="list" aria-label="مسارات التعلم">
          <span role="listitem"><Heart size={17} aria-hidden="true" /> سيرة النبي ﷺ</span>
          <span role="listitem"><Leaf size={17} aria-hidden="true" /> الأخلاق والآداب</span>
          <span role="listitem"><BookOpen size={17} aria-hidden="true" /> القرآن الكريم</span>
          <span role="listitem"><Star size={17} aria-hidden="true" /> قصص الأنبياء</span>
        </div>
        <div className={styles.roomTabs} role="group" aria-label="اختر قسم الأطفال">
          <button type="button" className={activeRoom === "stories" ? styles.roomActive : styles.roomTab}
            aria-pressed={activeRoom === "stories"} onClick={() => setActiveRoom("stories")}>مسرح النور</button>
          <button type="button" className={activeRoom === "parents" ? styles.roomActive : styles.roomTab}
            aria-pressed={activeRoom === "parents"} onClick={() => setActiveRoom("parents")}>دليل الوالدين للرسوم</button>
        </div>
      </section>
      {activeRoom === "parents" ? (
        <section className={styles.parentSources} aria-labelledby="parent-sources-title">
          <div className={styles.sourcesHead}>
            <div>
              <p className={styles.sourcesEyebrow}><Film size={18} aria-hidden="true" /> اكتشف مع طفلك</p>
              <h2 id="parent-sources-title">مصادر الرسوم من الناشرين</h2>
              <p>روابط استكشاف للأهل، وليست حلقات معتمدة أو مشغّل فيديو داخل المنصة. راجعوا كل حلقة قبل تشغيلها.</p>
            </div>
            <span className={styles.mediaState}>الوسائط المعتمدة هنا الآن: {KIDS_COUNTS.clearedMedia}</span>
          </div>
          <div className={styles.sourceGrid}>
            {PARENT_DISCOVERY_SOURCES.map((source, index) => (
              <article key={source.id} className={styles.sourceCard}>
                <span className={styles.sourceNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.sourceTopic}>{source.topic} · {source.language}</span>
                <h3>{source.title}</h3>
                <p>{source.note}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`فتح صفحة الناشر: ${source.title} (موقع خارجي)`}>
                  افتح صفحة الناشر <ExternalLink size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className={styles.panel} aria-label="اختيار التكييف المحلي" style={{ margin: "0 1.3rem 1rem" }}>
            <SectionHead title="التكييفات المسجلة" en="Registered local adaptations" />
            <label
              htmlFor="kids-adaptation-select"
              style={{ display: "block", marginBottom: "0.45rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}
            >
              اختيار سريع للتكييف
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
              <select
                id="kids-adaptation-select"
                value={activeAdaptationId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  if (nextId === "" || isRegisteredKidsAdaptationId(nextId)) {
                    setActiveAdaptationId(nextId);
                  }
                }}
                aria-describedby="kids-adaptation-help"
                disabled={KIDS_STORIES.length === 0}
                style={{
                  flex: "1 1 16rem",
                  minHeight: "2.75rem",
                  padding: "0.55rem 0.7rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-panel)",
                  background: "var(--bg-glass-strong)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">— لم يُختَر تكييف بعد —</option>
                {KIDS_STORIES.map((story) => (
                  <option key={story.adaptationId} value={story.adaptationId}>
                    {story.titleAr} · {ageBandLabel(story.ageBand)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-gold"
                onClick={openCurrentStory}
                disabled={!current}
                aria-label={current ? `فتح ${current.titleAr}` : "اختر تكييفًا أولًا"}
              >
                افتح التكييف المختار
              </button>
            </div>
            <p id="kids-adaptation-help" className="muted" style={{ margin: "0.55rem 0 0.6rem", fontSize: "0.76rem" }}>
              الاختيار وحده لا يُحتسب فتحًا؛ تُحتسب القصة عند فتحها فعليًا من القائمة أدناه.
            </p>
            <ul className={styles.adaptGrid} aria-label="قائمة التكييفات المحلية">
              {KIDS_STORIES.map((story, index) => {
                const isSeen = seen.includes(story.adaptationId);
                const isCurrent = story.adaptationId === activeAdaptationId;
                return (
                  <li key={story.adaptationId}>
                    <article className={styles.adaptCard} data-seen={isSeen} data-current={isCurrent}>
                      <span className={styles.adaptIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <div className={styles.adaptBody}>
                        <h3>{story.titleAr}</h3>
                        <p>{story.summaryAr}</p>
                        <div className={styles.adaptMeta}>
                          <span>{ageBandLabel(story.ageBand)}</span>
                          <span>{story.sourceIds.length} مصادر</span>
                          <span className={styles.adaptPending}>مراجعة تحريرية وعلمية معلّقة</span>
                          {isSeen ? <span className={styles.adaptSeen}>فُتحت</span> : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-gold"
                        onClick={() => {
                          setActiveAdaptationId(story.adaptationId);
                          markSeen(story.adaptationId);
                          setTheatre(true);
                        }}
                        aria-label={`فتح ${story.titleAr}`}
                      >
                        افتح القصة
                      </button>
                    </article>
                  </li>
                );
              })}
            </ul>
            {!KIDS_STORIES.length && (
              <p className="muted" style={{ fontSize: "0.8rem" }}>لا توجد تكييفات مسجلة بعد.</p>
            )}
          </section>
          <KidsTVRoom onReadStory={current ? openCurrentStory : undefined} />
        </>
      )}

      <MediaLibrarySection
        kind="kids"
        title="مكتبة نور للأطفال"
        subtitle="فيديوهات وقنوات أطفال من كتالوج المصادر، مع رابط الصفحة الأصلية وحالة المراجعة أسفل كل مادة."
      />

      <div className={styles.row}>
        <section className={styles.panel}>
          <SectionHead title="أنشطة وتحديات" en="Activities — local tools only" />
          <div className={styles.actGrid}>
            <button type="button" disabled title="الألغاز قيد الإعداد — غير متاحة بعد" style={{ opacity: 0.6 }}>
              <Puzzle size={18} />
              <strong>ألغاز إسلامية</strong>
              <span>قيد الإعداد</span>
            </button>
            <button type="button" onClick={() => setColoring(true)}>
              <Palette size={18} />
              <strong>تلوين</strong>
              <span>استوديو تفاعلي محلي</span>
            </button>
            <button type="button" disabled title="الأعمال اليدوية قيد الإعداد" style={{ opacity: 0.6 }}>
              <Lightbulb size={18} />
              <strong>اصنع بنفسك</strong>
              <span>قيد الإعداد</span>
            </button>
            <button type="button" disabled title="التحديات اليومية غير متوفرة بعد" style={{ opacity: 0.6 }}>
              <Star size={18} />
              <strong>تحديات يومية</strong>
              <span>غير متوفرة بعد</span>
            </button>
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="مسارات التعلّم" en="Local badges on this device" />
          <div className={styles.badges}>
            {badges.map((b) => (
              <div key={b.title} style={b.earned ? { borderColor: "var(--gold-400)" } : undefined}>
                <Star size={18} />
                <strong>{b.title}</strong>
                <span>{b.en}</span>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="دليل الوالدين" en="Parental Guidance" />
          <div className={styles.parentGrid}>
            <button type="button" disabled title="نصائح تربوية قيد الإعداد" style={{ opacity: 0.6 }}>
              <BookOpen size={18} />
              <strong>نصائح تربوية</strong>
              <span>قيد الإعداد</span>
            </button>
            <button type="button" disabled title="أنشطة عائلية قيد الإعداد" style={{ opacity: 0.6 }}>
              <Users size={18} />
              <strong>أنشطة عائلية</strong>
              <span>قيد الإعداد</span>
            </button>
            <button type="button" disabled title="موارد وقوالب قيد الإعداد" style={{ opacity: 0.6 }}>
              <FileText size={18} />
              <strong>موارد وقوالب</strong>
              <span>قيد الإعداد</span>
            </button>
          </div>
          <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
            {KIDS_COUNTS.adaptations} تكييفات أصلية مسجلة · المراجعة العلمية معلقة للجميع · لا تجسيد
            للنبي ﷺ
          </p>
        </section>
      </div>

      <footer className={styles.stats}>
        <span>
          <b>{KIDS_COUNTS.adaptations}</b> تكييفات مسجلة في الفهرس
        </span>
        <span>
          <b>{KIDS_COUNTS.clearedMedia}</b> وسائط معتمدة (فيديو/صوت)
        </span>
        <span>
          <b>{seenCount}</b> قصص فُتحت على هذا الجهاز
        </span>
        <span>
          <b>{colorSessions}</b> جلسات تلوين محلية
        </span>
      </footer>
      {theatre && current ? (
        <StoryTheatre
          title={current.titleAr}
          image={current.img}
          summary={current.summaryAr}
          ageBand={ageBandLabel(current.ageBand)}
          adaptationLabel={current.adaptationLabel}
          editorialStatus={current.editorialStatus}
          reviewStatus={current.reviewStatus}
          depictionPolicy={current.depictionPolicy}
          sourceCount={current.sourceIds.length}
          sources={currentSources}
          position={currentPosition}
          onPrevious={() => openRelativeStory(-1)}
          onNext={() => openRelativeStory(1)}
          onClose={() => setTheatre(false)}
        />
      ) : null}
      {coloring ? (
        <ColoringStudio
          onClose={() => setColoring(false)}
          onSessionComplete={() => setColorSessions((count) => count + 1)}
        />
      ) : null}
    </div>
  );
}
