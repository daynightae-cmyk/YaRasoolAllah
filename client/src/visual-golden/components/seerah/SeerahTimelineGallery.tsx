import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import {
  SEERAH_JOURNEY_STOPS,
  type JourneyStop,
  journeyStopHref,
} from "@/visual-golden/services/seerah-journey";
import styles from "./SeerahTimelineGallery.module.css";

interface ArchProps { accent?: boolean }

function TimelineArch({ accent = false }: ArchProps) {
  return (
    <svg
      className={styles.arch}
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="yraTimelineStone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a3d32" />
          <stop offset="50%" stopColor="#5c4c3d" />
          <stop offset="100%" stopColor="#423529" />
        </linearGradient>
      </defs>
      <path
        d="M24 180 L24 38 Q24 10 160 6 Q296 10 296 38 L296 180 Z"
        fill="url(#yraTimelineStone)"
        stroke="#8a7452"
        strokeWidth="2"
      />
      <path
        d="M24 180 L24 70 Q24 40 160 30 Q280 40 280 70 L280 180 Z"
        fill="#14100b"
        fillOpacity={0.85}
      />
      <path
        d="M24 70 Q24 40 160 30 Q280 40 280 70"
        fill="none"
        stroke="#c9a227"
        strokeWidth="2"
        opacity={accent ? 0.9 : 0.6}
      />
      <circle cx="160" cy="64" r="20" fill="#f3e3a8" opacity={accent ? 0.9 : 0.55} />
      <circle cx="160" cy="64" r="8" fill="#ffffff" opacity={accent ? 0.9 : 0.4} />
    </svg>
  );
}

export function SeerahTimelineGallery() {
  const stops = useMemo(() => SEERAH_JOURNEY_STOPS, []);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.children[index] as HTMLElement | undefined;
      if (!card) return;
      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      let scrollLeft = track.scrollLeft;
      if (cardRect.left < trackRect.left) {
        scrollLeft += cardRect.left - trackRect.left;
      } else if (cardRect.right > trackRect.right) {
        scrollLeft += cardRect.right - trackRect.right;
      }
      track.scrollTo({ left: scrollLeft, behavior: "smooth" });
      setActiveIndex(index);
    },
    [],
  );

  const goPrev = useCallback(() => {
    if (activeIndex <= 0) return;
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const goNext = useCallback(() => {
    if (activeIndex >= stops.length - 1) return;
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, stops.length, scrollToIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "Home") { e.preventDefault(); scrollToIndex(0); }
      else if (e.key === "End") { e.preventDefault(); scrollToIndex(stops.length - 1); }
    },
    [goPrev, goNext, scrollToIndex, stops.length],
  );

  return (
    <section
      className={styles.gallery}
      data-visual="seerah-timeline-gallery"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.galleryHead}>
        <h2 className={styles.galleryTitle}>
          الخط الزمني للسيرة النبوية · The Seerah Timeline
        </h2>
        <p className={styles.gallerySubtitle}>
          عشر محطات رحلة من مكة قبل البعثة إلى فتح مكة — كل محطة تربط بفصلها السردي الحقيقي.
        </p>
      </div>

      <div className={styles.scrollWrap}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={goPrev}
          disabled={activeIndex <= 0}
          aria-label="المحطة السابقة"
        >
          <ChevronRight size={16} aria-hidden style={{ transform: "rotate(180deg)" }}/>
        </button>
        <div ref={trackRef} className={styles.track} role="list" aria-label="محطات الخط الزمني">
          {stops.map((stop, i) => {
            const isActive = i === activeIndex;
            return (
              <Link
                key={stop.id}
                href={journeyStopHref(stop)}
                className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                data-visual={`seerah-timeline-card-${stop.id}`}
                aria-current={isActive ? "true" : undefined}
              >
                <TimelineArch accent={isActive} />
                <div className={styles.enter} data-visual="seerah-timeline-enter">
                  افتح المحطة · Open stop
                </div>
                <p className={styles.era}>{stop.eraAr}</p>
                <h3 className={styles.title} lang="ar" dir="rtl">
                  {stop.titleAr}
                </h3>
                <p className={styles.orientation} lang="ar" dir="rtl">
                  {stop.orientationAr}
                </p>
                <p className={styles.disclosure} lang="ar" dir="rtl">
                  {stop.disclosureAr}
                </p>
                <ChevronRight size={14} aria-hidden />
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={goNext}
          disabled={activeIndex >= stops.length - 1}
          aria-label="المحطة التالية"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      <div className={styles.timeRail}>
        <p className={styles.railTitle}>
          الفترة الزمنية · Periods
        </p>
        <div className={styles.rail} role="list" aria-label="فترات السيرة">
          {stops.map((stop, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={stop.id} className={styles.eraDot} aria-hidden={!isActive}>
                <span className={`${styles.eraLabel} ${isActive ? "active" : ""}`}>
                  {stop.eraAr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

SeerahTimelineGallery.displayName = "SeerahTimelineGallery";
