import { useMemo, useState } from "react";
import { Puzzle, Palette, Lightbulb, Star, BookOpen, Users, FileText } from "lucide-react";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { ColoringStudio } from "@/visual-golden/components/unique/ColoringStudio";
import { StoryTheatre } from "@/visual-golden/components/present/StoryTheatre";
import { TvLounge } from "@/visual-golden/components/ceremony/TvLounge";
import {
  KIDS_COUNTS,
  KIDS_STORIES,
  ageBandLabel,
} from "@/visual-golden/services/kids";
import styles from "./KidsPage.module.css";

const SEEN_KEY = "kids-seen-adaptations-v1";

function safeReadSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function KidsPage() {
  const [currentId, setCurrentId] = useState(KIDS_STORIES[0]?.adaptationId ?? "");
  const [theatre, setTheatre] = useState(false);
  const [coloring, setColoring] = useState(false);
  const [seen, setSeen] = useState<string[]>(() => safeReadSeen());
  const [colorSessions, setColorSessions] = useState(0);

  const current = KIDS_STORIES.find((story) => story.adaptationId === currentId) ?? KIDS_STORIES[0];

  const markSeen = (adaptationId: string) => {
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

  const badges = useMemo(
    () => [
      {
        title: "مستكشف القصص",
        en: seen.length >= 3 ? `فُتحت ${seen.length} قصص محليًا ✓` : `افتح 3 قصص (${seen.length}/3 محليًا)`,
        earned: seen.length >= 3,
      },
      {
        title: "صديق التلوين",
        en: colorSessions >= 1 ? `جلسة تلوين محلية ✓` : "جرّب استوديو التلوين",
        earned: colorSessions >= 1,
      },
      {
        title: "قارئ صغير",
        en: seen.length >= 1 ? `قراءة محلية ✓` : "افتح أول قصة",
        earned: seen.length >= 1,
      },
      {
        title: "رفيق التعلّم",
        en: "تقدّم محلي على هذا الجهاز فقط",
        earned: false,
      },
    ],
    [seen.length, colorSessions],
  );

  if (!current) {
    return (
      <div className={styles.page}>
        <p className="muted">لا توجد تكييفات مسجلة في هذا الإصدار.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <TvLounge
        stories={KIDS_STORIES.map((story) => ({
          title: story.titleAr,
          en: `${ageBandLabel(story.ageBand)} · تكييف تعليمي`,
          age: ageBandLabel(story.ageBand),
          img: story.img,
          summary: story.summaryAr,
        }))}
        current={{
          title: current.titleAr,
          en: `${ageBandLabel(current.ageBand)} · تكييف تعليمي`,
          age: ageBandLabel(current.ageBand),
          img: current.img,
          summary: current.summaryAr,
        }}
        playing={false}
        onSelect={(s) => {
          const story = KIDS_STORIES.find((item) => item.titleAr === s.title);
          if (story) {
            setCurrentId(story.adaptationId);
            markSeen(story.adaptationId);
          }
        }}
        onPlay={() => {
          markSeen(current.adaptationId);
          setTheatre(true);
        }}
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
            <button
              type="button"
              onClick={() => {
                setColoring(true);
                setColorSessions((n) => n + 1);
              }}
            >
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
          <b>{seen.length}</b> قصص فُتحت على هذا الجهاز
        </span>
        <span>
          <b>{colorSessions}</b> جلسات تلوين محلية
        </span>
      </footer>
      {theatre ? (
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
          onClose={() => setTheatre(false)}
        />
      ) : null}
      {coloring ? <ColoringStudio onClose={() => setColoring(false)} /> : null}
    </div>
  );
}
