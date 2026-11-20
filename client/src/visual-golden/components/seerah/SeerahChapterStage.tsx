/**
 * SeerahChapterStage — the full-bleed entrance for one Seerah chapter.
 *
 * The stage is the chapter's doorway: environment plate, chapter identity,
 * era, a short orientation, the recorded stations of the chapter, and
 * direct links to the atlas and the chronological database.
 *
 * Honesty boundaries:
 * - The plate is an illustrative reconstruction, never documentary evidence.
 * - No prophetic or companion depiction; the artwork is terrain/architecture.
 * - Approximate places stay approximate and link to the existing atlas only.
 */

import { Link } from "wouter";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Database, Map, Sparkles } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import type { SeerahChapter } from "@/data/seerahData";
import type { SeerahSceneConfig } from "@/visual-golden/services/seerah-scene";
import { stationCountLabel } from "@/visual-golden/services/seerah";
import styles from "./SeerahChapterStage.module.css";

type SeerahTimelineEvent = NonNullable<SeerahChapter["timelineEvents"]>[number];

interface SeerahChapterStageProps {
  chapter: SeerahChapter;
  scene: SeerahSceneConfig | null;
  index: number;
  total: number;
  events: SeerahTimelineEvent[];
  selectedEventId?: string;
  read: boolean;
  onSelectEvent: (eventId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

function scrollToReading() {
  document.getElementById("chapter-reading")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SeerahChapterStage({
  chapter,
  scene,
  index,
  total,
  events,
  selectedEventId,
  read,
  onSelectEvent,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: SeerahChapterStageProps) {
  const plate = scene ? art[scene.plate] : art.desert;
  const visibleEvents = events.slice(0, 5);
  const hiddenCount = Math.max(0, events.length - visibleEvents.length);

  return (
    <section
      className={styles.stage}
      data-visual="seerah-chapter-stage"
      data-chapter-stage={chapter.id}
      data-order={String(chapter.order).padStart(2, "0")}
      data-light={scene?.light ?? "bronze-day"}
      aria-labelledby={`chapter-stage-title-${chapter.id}`}
    >
      <img className={styles.plate} src={plate} alt="" loading="eager" decoding="async" />
      <div className={styles.plateVeil} aria-hidden />
      <div className={styles.haze} aria-hidden />
      <div className={styles.ornament} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span className={styles.kickerIndex}>
              الفصل {String(chapter.order).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className={styles.kickerDot} aria-hidden />
            <span>{scene?.eraAr ?? "مرحلة سردية من السيرة"}</span>
          </p>
          <h2 id={`chapter-stage-title-${chapter.id}`} className={styles.title}>
            {chapter.title}
          </h2>
          <p className={styles.lead}>{chapter.description}</p>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={scrollToReading}>
              <BookOpen size={16} aria-hidden />
              اقرأ الفصل
            </button>
            <Link href="/seerah/database" className={styles.secondary}>
              <Database size={15} aria-hidden />
              القاعدة الزمنية
            </Link>
            <Link href="/atlas" className={styles.secondary}>
              <Map size={15} aria-hidden />
              الأطلس
            </Link>
          </div>

          <div className={styles.statusRow}>
            <span className={styles.status}>
              <Sparkles size={13} aria-hidden />
              {read ? "مقروء محليًا على هذا الجهاز" : "لم يُعلَّم كمقروء بعد"}
            </span>
            <span className={styles.statusMuted}>
              {stationCountLabel(events.length)} مسجلة · ترتيب سردي لا تقويم تاريخي
            </span>
          </div>

          {scene ? (
            <p className={styles.disclosure}>{scene.disclosureAr}</p>
          ) : null}
        </div>

        <aside className={styles.aside} aria-label="محطات هذا الفصل">
          <p className={styles.asideKicker}>في هذا الفصل</p>
          {visibleEvents.length === 0 ? (
            <p className={styles.asideEmpty}>لا توجد محطات مسجلة لهذا الفصل في البنية الحالية.</p>
          ) : (
            <ol className={styles.stations}>
              {visibleEvents.map((event, eventIndex) => (
                <li key={event.id}>
                  <button
                    type="button"
                    className={`${styles.station} ${selectedEventId === event.id ? styles.stationOn : ""}`}
                    aria-pressed={selectedEventId === event.id}
                    onClick={() => {
                      onSelectEvent(event.id);
                      scrollToReading();
                    }}
                  >
                    <span className={styles.stationNum}>{String(eventIndex + 1).padStart(2, "0")}</span>
                    <span className={styles.stationText}>
                      <span className={styles.stationDate}>{event.date}</span>
                      <strong>{event.title}</strong>
                    </span>
                    <ArrowLeft size={14} className={styles.stationArrow} aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
          )}
          {hiddenCount > 0 ? (
            <button type="button" className={styles.moreStations} onClick={scrollToReading}>
              عرض بقية المحطات (+{hiddenCount})
            </button>
          ) : null}
        </aside>
      </div>

      <div className={styles.rail}>
        <button type="button" className={styles.railButton} onClick={onPrevious} disabled={!canPrevious}>
          <ChevronRight size={16} aria-hidden />
          الفصل السابق
        </button>
        <div className={styles.progress} aria-hidden>
          <i style={{ width: `${((index + 1) / Math.max(1, total)) * 100}%` }} />
        </div>
        <span className={styles.railIndex}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button type="button" className={styles.railButton} onClick={onNext} disabled={!canNext}>
          الفصل التالي
          <ChevronLeft size={16} aria-hidden />
        </button>
      </div>
    </section>
  );
}

SeerahChapterStage.displayName = "SeerahChapterStage";
