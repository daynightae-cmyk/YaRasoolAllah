import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Puzzle,
  Palette,
  Lightbulb,
  Star,
  BookOpen,
  Users,
  FileText,
  ExternalLink,
  Film,
  Heart,
  Leaf,
  ShieldCheck,
  BadgeCheck,
  ArrowLeft,
  GraduationCap,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import { ColoringStudio } from "@/visual-golden/components/unique/ColoringStudio";
import { KidsQuizGarden } from "@/visual-golden/components/unique/KidsQuizGarden";
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
const QUIZ_KEY = "kids-quiz-sessions-v1";
const AGE_BANDS = ["6-8", "9-12", "13-15"] as const;
type AgeBandFilter = "all" | (typeof AGE_BANDS)[number];

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

/** Fail-closed: only a non-negative integer count survives storage. */
function safeReadQuizSessions(): number {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    if (!raw) return 0;
    const parsed: unknown = Number(raw);
    if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < 0) return 0;
    return parsed;
  } catch {
    return 0;
  }
}

export function KidsPage() {
  const [theatre, setTheatre] = useState(false);
  const [coloring, setColoring] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizSessions, setQuizSessions] = useState(() => safeReadQuizSessions());
  const [seen, setSeen] = useState<string[]>(() => safeReadSeen());
  const [colorSessions, setColorSessions] = useState(0);
  const [activeRoom, setActiveRoom] = useState<"stories" | "parents">("stories");
  const [activeAdaptationId, setActiveAdaptationId] = useState("");
  const [ageFilter, setAgeFilter] = useState<AgeBandFilter>("all");
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);

  const current = KIDS_STORIES.find((story) => story.adaptationId === activeAdaptationId) ?? null;
  const currentSources = useMemo(() => (current ? kidsAdaptationSources(current) : []), [current]);
  const currentPosition = useMemo(
    () => (current ? kidsAdaptationPosition(current.adaptationId) : { index: -1, total: KIDS_STORIES.length }),
    [current],
  );
  const seenCount = useMemo(() => countDistinctSeenKidsAdaptations(seen), [seen]);
  const threeStoryEarned = useMemo(() => hasThreeStoryKidsBadge(seen), [seen]);
  // Age-appropriate navigation: the visible list narrows, the full registry
  // remains available through "الكل" and the theatre's prev/next rail.
  const visibleStories = useMemo(
    () => (ageFilter === "all" ? KIDS_STORIES : KIDS_STORIES.filter((story) => story.ageBand === ageFilter)),
    [ageFilter],
  );
  const ageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const story of KIDS_STORIES) counts.set(story.ageBand, (counts.get(story.ageBand) ?? 0) + 1);
    return counts;
  }, []);

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

  const recordQuizSession = () => {
    setQuizSessions((count) => {
      const next = count + 1;
      try {
        localStorage.setItem(QUIZ_KEY, String(next));
      } catch {
        // count remains in-memory
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
        en: quizSessions >= 1 ? `جولة ألغاز مكتملة محليًا ✓ (${quizSessions})` : "أكمل جولة في حديقة الألغاز",
        earned: quizSessions >= 1,
      },
    ],
    [seenCount, threeStoryEarned, colorSessions, quizSessions],
  );

  return (
    <div className={styles.page}>
      <section className={styles.garden} data-visual="kids-hero" aria-labelledby="kids-hero-title">
        <img
          className={`${styles.gardenWorld} ${styles.heroPlate}`}
          src={worldPlateForWing("kids").plate}
          alt=""
          loading="eager"
          decoding="async"
          aria-hidden
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.gardenIntro}>
          <span className={styles.gardenMark}><Leaf size={18} aria-hidden="true" /> واحة الأطفال والأسرة</span>
          <h1 id="kids-hero-title">عالم مُلهم للأطفال والأسرة</h1>
          <p className={styles.heroLead}>
            كل حكاية تفتح بابًا للخير: تكييفات تعليمية أصلية، وأنشطة محلية، ومسرح نور للحلقات التعليمية
            — بلا تجسيد، وبلا اعتماد علمي مزعوم.
          </p>
          <ul className={styles.heroPledge} aria-label="التزامات واحة الأطفال">
            <li><ShieldCheck size={15} aria-hidden="true" /> بلا تجسيد للنبي صلى الله عليه وسلم ولا للصحابة</li>
            <li><BadgeCheck size={15} aria-hidden="true" /> لا إعلانات ولا تتبّع داخل مسرح الأطفال</li>
            <li><Sparkles size={15} aria-hidden="true" /> المراجعة العلمية معلّقة على كل تكييف قبل النشر</li>
          </ul>
        </div>
        <div className={styles.gardenPaths} role="list" aria-label="مسارات التعلم">
          <Link role="listitem" href="/seerah"><Heart size={17} aria-hidden="true" /> سيرة النبي ﷺ</Link>
          <span role="listitem"><Leaf size={17} aria-hidden="true" /> الأخلاق والآداب</span>
          <Link role="listitem" href="/quran"><BookOpen size={17} aria-hidden="true" /> القرآن الكريم</Link>
          <span role="listitem"><Star size={17} aria-hidden="true" /> قصص الأنبياء</span>
        </div>
        <div className={styles.heroCtas}>
          <button
            type="button"
            className={styles.heroPrimary}
            onClick={() => {
              setActiveRoom("stories");
              document.getElementById("kids-adapt-grid")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <GraduationCap size={16} aria-hidden="true" /> ابدأ الرحلة العائلية
          </button>
          <button
            type="button"
            className={styles.heroGhost}
            onClick={() => {
              setActiveRoom("parents");
              document.getElementById("parent-sources-title")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Users size={16} aria-hidden="true" /> دليل ولي الأمر
          </button>
        </div>
        <div className={styles.heroLedger}>
          <dl className={styles.heroStats} aria-label="أعداد واحة الأطفال المسجلة">
            <div>
              <dt>تكييفات أصلية مسجلة</dt>
              <dd>{KIDS_COUNTS.adaptations}</dd>
            </div>
            <div>
              <dt>وسائط معتمدة (فيديو/صوت)</dt>
              <dd>{KIDS_COUNTS.clearedMedia}</dd>
            </div>
            <div>
              <dt>فئات عمرية مسجلة</dt>
              <dd>{AGE_BANDS.length}</dd>
            </div>
            <div>
              <dt>موارد استكشاف للأهل</dt>
              <dd>{PARENT_DISCOVERY_SOURCES.length}</dd>
            </div>
          </dl>
          <p className={styles.heroNote}>
            الأعداد من الفهرس المحكوم وهذا الجهاز فقط ({seenCount} قصة فُتحت · {quizSessions} جولة ألغاز).
            «موارد الاستكشاف» صفحات ناشرين ليراجعها الأهل، وليست حلقات معتمدة أو تشغيلًا داخل المنصة.
          </p>
        </div>
        <div className={styles.roomTabs} role="group" aria-label="اختر قسم الأطفال">
          <button type="button" className={activeRoom === "stories" ? styles.roomActive : styles.roomTab}
            aria-pressed={activeRoom === "stories"} onClick={() => setActiveRoom("stories")}>مسرح النور</button>
          <button type="button" className={activeRoom === "parents" ? styles.roomActive : styles.roomTab}
            aria-pressed={activeRoom === "parents"} onClick={() => setActiveRoom("parents")}>دليل الوالدين للرسوم</button>
        </div>
      </section>

      {/* Interest rail, as in the approved composition: every chip opens a
          real wing or scrolls to a real in-page section — nothing invented. */}
      <nav className={styles.interestRail} data-visual="kids-interest-rail" aria-label="تصفح حسب الاهتمام">
        <span className={styles.interestLabel}><Star size={15} aria-hidden="true" /> تصفح حسب الاهتمام:</span>
        <div className={styles.interestChips}>
          <button
            type="button"
            onClick={() => {
              setActiveRoom("stories");
              setAgeFilter("all");
              document.getElementById("kids-adapt-grid")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            القصص الإسلامية
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRoom("stories");
              document.getElementById("kids-adapt-grid")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            القيم والسلوك
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRoom("stories");
              document.getElementById("kids-tv-room")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            الحلقات التعليمية
          </button>
          <Link href="/seerah">سيرة النبي صلى الله عليه وسلم</Link>
          <button
            type="button"
            onClick={() => {
              setActiveRoom("parents");
              document.getElementById("parent-sources-title")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            الأسرة والتربية
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("kids-activities")?.scrollIntoView({ behavior: "smooth" })}
          >
            أنشطة وتطبيقات
          </button>
          <Link href="/quran">لكل الأعمار</Link>
        </div>
      </nav>
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
          <section
            className={styles.panel}
            id="kids-adapt-grid"
            aria-label="اختيار التكييف المحلي"
            style={{ margin: "0 1.3rem 1rem" }}
          >
            <SectionHead
              title="سلسلة تكييفات الأطفال"
              en={`Registered original adaptations · ${KIDS_COUNTS.adaptations} recorded`}
            />
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
            <div className={styles.ageFilter} role="group" aria-label="تصفية حسب الفئة العمرية" data-visual="kids-age-filter">
              <span className={styles.ageFilterLabel}>الفئة العمرية:</span>
              <button
                type="button"
                className={ageFilter === "all" ? styles.ageChipActive : styles.ageChip}
                aria-pressed={ageFilter === "all"}
                onClick={() => setAgeFilter("all")}
              >
                الكل ({KIDS_STORIES.length})
              </button>
              {AGE_BANDS.map((band) => (
                <button
                  key={band}
                  type="button"
                  className={ageFilter === band ? styles.ageChipActive : styles.ageChip}
                  aria-pressed={ageFilter === band}
                  onClick={() => setAgeFilter(band)}
                >
                  {ageBandLabel(band)} ({ageCounts.get(band) ?? 0})
                </button>
              ))}
            </div>
            <ul className={styles.adaptGrid} aria-label="قائمة التكييفات المحلية">
              {visibleStories.map((story, index) => {
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
            {!visibleStories.length && (
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                {KIDS_STORIES.length === 0 ? "لا توجد تكييفات مسجلة بعد." : "لا توجد تكييفات في هذه الفئة العمرية بعد."}
              </p>
            )}
          </section>
          <div id="kids-tv-room">
            <KidsTVRoom onReadStory={current ? openCurrentStory : undefined} />
          </div>
        </>
      )}

      <MediaLibrarySection
        kind="kids"
        title="مكتبة نور للأطفال"
        subtitle="فيديوهات وقنوات أطفال من كتالوج المصادر، مع رابط الصفحة الأصلية وحالة المراجعة أسفل كل مادة."
      />

      {/* Safety band, as in the approved composition: declared design
          commitments — never a safety certificate or scholarly approval. */}
      <section className={styles.safetyBand} data-visual="kids-safety-band" aria-label="التزامات واحة الأطفال">
        <div className={styles.safetyCopy}>
          <p className={styles.safetyKicker}><ShieldCheck size={16} aria-hidden="true" /> محتوى آمن للأطفال</p>
          <h2>التزاماتنا قبل أن يبدأ طفلك</h2>
          <ul className={styles.safetyList}>
            <li><BadgeCheck size={16} aria-hidden="true" /> تكييفات تعليمية أصلية، وشخصيات افتراضية لا تُنسب إلى وقائع دينية</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> لا تجسيد للنبي صلى الله عليه وسلم ولا للصحابة في أي رسم</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> لا تشغيل تلقائي: الصوت والقراءة الصوتية اختياريان وبصوت الجهاز</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> لا إعلانات ولا تتبّع داخل مسرح الأطفال، وكل مادة تُعرض بحالة مراجعتها</li>
          </ul>
          <p className={styles.safetyNote}>
            هذه التزامات تصميمية معلنة، وليست شهادة سلامة محتوى. راجعوا كل مادة قبل مشاركتها مع أطفالكم.
          </p>
        </div>
        <div className={styles.safetyArt} aria-hidden="true">
          <ShieldCheck size={58} />
        </div>
      </section>

      <div className={styles.row}>
        <section className={styles.panel} id="kids-activities">
          <SectionHead title="أنشطة وتحديات" en="Activities — local tools only" />
          <div className={styles.actGrid}>
            <button type="button" onClick={() => setQuizOpen(true)} data-visual="kids-quiz-open">
              <Puzzle size={18} />
              <strong>ألغاز المصحف</strong>
              <span>أسئلة من بيانات السور الحقيقية</span>
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
          <p className="muted" style={{ fontSize: "0.73rem", marginTop: "0.35rem", lineHeight: 1.8 }}>
            القصص تكييفات تعليمية أصلية وليست نصوصًا منقولة، والشخصيات التعليمية افتراضية لا تُنسب
            إلى وقائع دينية. القراءة الصوتية بصوت الجهاز اختيارية ولا تعمل تلقائيًا. لا ندّعي اعتمادًا
            علميًا أو شهادة سلامة محتوى؛ راجعوا كل مادة قبل مشاركتها مع أطفالكم.
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
        <span>
          <b>{quizSessions}</b> جولات ألغاز مكتملة محليًا
        </span>
      </footer>

      {/* Explore rail, as in the approved composition: internal governed
          surfaces only — publisher discovery links stay in the parents guide. */}
      <section className={styles.exploreRail} data-visual="kids-explore-rail" aria-label="استكشف مع الأطفال">
        <header className={styles.exploreHead}>
          <div>
            <p className={styles.exploreKicker}><Sparkles size={15} aria-hidden="true" /> سلاسل مفضلة ومصادر</p>
            <h2>استكشف مع الأطفال</h2>
          </div>
        </header>
        <div className={styles.exploreGrid}>
          <Link href="/seerah" className={styles.exploreCard}>
            <Heart size={17} aria-hidden="true" />
            <strong>سيرة النبي صلى الله عليه وسلم</strong>
            <small>فصول ومحطات مسجّلة، بلا مواضع مساحية</small>
          </Link>
          <Link href="/quran" className={styles.exploreCard}>
            <BookOpen size={17} aria-hidden="true" />
            <strong>القرآن الكريم</strong>
            <small>قراءة وسور من الفهارس المحكومة</small>
          </Link>
          <Link href="/hadith" className={styles.exploreCard}>
            <ScrollText size={17} aria-hidden="true" />
            <strong>الحديث الشريف</strong>
            <small>نطاق المحتوى الحالي معلن صراحة</small>
          </Link>
          <Link href="/daily" className={styles.exploreCard}>
            <Users size={17} aria-hidden="true" />
            <strong>اليوم والعبادة</strong>
            <small>تذكيرات محلية بلا أجر مزعوم</small>
          </Link>
          <Link href="/audio" className={styles.exploreCard}>
            <Film size={17} aria-hidden="true" />
            <strong>الصوت والتلاوات</strong>
            <small>استماع وتلاوة من الروافد المسجّلة</small>
          </Link>
          <Link href="/sources" className={styles.exploreCard}>
            <ShieldCheck size={17} aria-hidden="true" />
            <strong>خزانة المصادر</strong>
            <small>فهارس محكومة بقرارات حقوق وحالة تحريرية</small>
          </Link>
        </div>
        <p className={styles.exploreNote}>
          كل رابط يفتح سطحًا محكومًا داخل المنصة. موارد الناشرين تبقى في «دليل الوالدين» كصفحات استكشاف لا تشغيل.
        </p>
      </section>
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
      {quizOpen ? (
        <KidsQuizGarden
          onClose={() => setQuizOpen(false)}
          onSessionComplete={recordQuizSession}
        />
      ) : null}
    </div>
  );
}
