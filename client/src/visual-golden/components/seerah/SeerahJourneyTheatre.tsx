/**
 * SeerahJourneyTheatre — the immersive cinematic journey through the Seerah.
 *
 * A full-bleed theatre of ten ordered stops (2026 reference pack), each with
 * its own cinematic world plate, era, orientation text and honest disclosure.
 * The visitor moves stop by stop (buttons, rail, keyboard arrows) and every
 * stop deep-links into the canonical chapter reading and the database.
 *
 * Honesty boundaries:
 * - No prophetic/companion depiction anywhere; plates are environment art.
 * - Each stop shows its Arabic illustrative-reconstruction disclosure.
 * - Narrative order, not a calibrated historical calendar.
 * - Reduced motion: no drift/parallax animation; transitions become instant.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronLeft, ChevronRight, Database, Map } from "lucide-react";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  SEERAH_JOURNEY_STOPS,
  journeyStopHref,
  journeyStopPlate,
} from "@/visual-golden/services/seerah-journey";
import styles from "./SeerahJourneyTheatre.module.css";

interface SeerahJourneyTheatreProps {
  /** Initial stop index (e.g. from ?journey=). Defaults to the first stop. */
  initialIndex?: number;
}

export function SeerahJourneyTheatre({ initialIndex = 0 }: SeerahJourneyTheatreProps) {
  const stops = SEERAH_JOURNEY_STOPS;
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), stops.length - 1),
  );
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const railRef = useRef<HTMLDivElement>(null);
  const stop = stops[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.min(Math.max(0, next), stops.length - 1));
    },
    [stops.length],
  );

  // Keep the active stop visible in the horizontal rail (RTL-aware).
  useEffect(() => {
    const rail = railRef.current;
    const active = rail?.querySelector<HTMLElement>(`[data-stop-index="${index}"]`);
    if (!rail || !active) return;
    const centered = active.offsetLeft - (rail.clientWidth - active.clientWidth) / 2;
    const rtl = getComputedStyle(rail).direction === "rtl";
    rail.scrollTo({
      left: rtl ? Math.min(0, centered) : Math.max(0, centered),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [index, reducedMotion]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index + 1); // RTL: left advances forward
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(stops.length - 1);
    }
  };

  return (
    <section
      className={styles.theatre}
      data-visual="seerah-journey-theatre"
      data-journey-stop={stop.id}
      data-motion={reducedMotion ? "reduced" : "full"}
      aria-label="رحلة السيرة السينمائية"
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage} key={stop.id}>
        <img
          className={styles.plate}
          src={journeyStopPlate(stop)}
          alt=""
          loading="eager"
          decoding="async"
        />
        <div className={styles.veil} aria-hidden />
        <div className={styles.glow} aria-hidden />

        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span className={styles.kickerIndex}>
              المحطة {String(index + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}
            </span>
            <span className={styles.kickerDot} aria-hidden />
            <span>{stop.eraAr}</span>
          </p>
          <h2 className={styles.title}>{stop.titleAr}</h2>
          <p className={styles.orientation}>{stop.orientationAr}</p>

          <div className={styles.actions}>
            <Link href={journeyStopHref(stop)} className={styles.primary}>
              <BookOpen size={15} aria-hidden />
              اقرأ في الفصل
            </Link>
            <Link
              href={`/seerah/database${stop.eventId ? `?event=${encodeURIComponent(stop.eventId)}` : ""}`}
              className={styles.secondary}
            >
              <Database size={14} aria-hidden />
              السجل الزمني
            </Link>
            <Link href="/atlas" className={styles.secondary}>
              <Map size={14} aria-hidden />
              الأطلس
            </Link>
          </div>

          <p className={styles.disclosure}>{stop.disclosureAr}</p>
        </div>

        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="المحطة السابقة"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
          <div className={styles.progress} aria-hidden>
            <i style={{ width: `${((index + 1) / stops.length) * 100}%` }} />
          </div>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goTo(index + 1)}
            disabled={index === stops.length - 1}
            aria-label="المحطة التالية"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.rail} ref={railRef} role="tablist" aria-label="محطات الرحلة">
        {stops.map((candidate, candidateIndex) => (
          <button
            key={candidate.id}
            type="button"
            role="tab"
            aria-selected={candidateIndex === index}
            data-stop-index={candidateIndex}
            className={`${styles.railStop} ${candidateIndex === index ? styles.railStopOn : ""}`}
            onClick={() => goTo(candidateIndex)}
          >
            <img src={journeyStopPlate(candidate)} alt="" loading="lazy" decoding="async" />
            <span>
              <b>{candidate.titleAr}</b>
              <small>{candidate.eraAr}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

SeerahJourneyTheatre.displayName = "SeerahJourneyTheatre";
