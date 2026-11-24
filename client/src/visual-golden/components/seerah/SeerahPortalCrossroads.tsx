import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import styles from "./SeerahPortalCrossroads.module.css";

interface Portal {
  readonly id: string;
  readonly ar: string;
  readonly en: string;
  readonly href: string;
}

const PORTALS: readonly Portal[] = [
  { id: "atlas", ar: "الأطلس التاريخي", en: "Historical Atlas", href: "/atlas" },
  { id: "timeline", ar: "الخط الزمني", en: "Timeline", href: "/seerah" },
  { id: "ghazawat", ar: "الغزوات", en: "Ghazawat", href: "/seerah?chapter=badr" },
  { id: "quran", ar: "القرآن الكريم", en: "The Qur'an", href: "/quran" },
  { id: "hadith", ar: "الحديث الشريف", en: "Hadith", href: "/hadith" },
  { id: "madinah", ar: "المدينة والهجرة", en: "Madinah & Hijrah", href: "/seerah?chapter=hijra-to-madinah" },
];

const CENTER: Portal = {
  id: "world",
  ar: "العالم الحي",
  en: "The Living Seerah",
  href: "/seerah/world",
};

const CENTER_NOTE_AR = "السيرة النبوية الحيوية — المدينة،المسجد،المعارف، والحياة.";
const CENTER_NOTE_EN = "The living city, the mosque, the knowledge, and the life of the message.";

/* Stone arch with a luminous opening. Each portal is a real link; the arch
   drawing is architecture, never a backdrop for opaque buttons. */
function PortalArch({ center }: { center?: boolean }) {
  return (
    <svg
      className={styles.portalArch}
      viewBox="0 0 320 420"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="yraPortalStone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a3d32" />
          <stop offset="50%" stopColor="#5c4c3d" />
          <stop offset="100%" stopColor="#423529" />
        </linearGradient>
        <linearGradient id="yraPortalLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e3a8" />
          <stop offset="55%" stopColor="#e8d9a4" />
          <stop offset="100%" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M24 420 L24 130 Q24 44 160 24 Q296 44 296 130 L296 420 Z"
        fill="url(#yraPortalStone)"
        stroke="#8a7452"
        strokeWidth="3"
      />
      <path
        d="M74 420 L74 170 Q74 100 160 70 Q246 100 246 170 L246 420 Z"
        fill="#14100b"
        fillOpacity={center ? 0.9 : 0.85}
      />
      <path
        d="M74 170 Q74 100 160 70 Q246 100 246 170"
        fill="none"
        stroke="#c9a227"
        strokeWidth="2"
        opacity={center ? 0.9 : 0.6}
      />
      {/* Light through the opening */}
      <path
        d="M84 200 Q160 80 236 200 L236 420 Q160 380 84 200 Z"
        fill="url(#yraPortalLight)"
        opacity={center ? 0.45 : 0.25}
      />
      <circle cx="160" cy="150" r="26" fill="#f3e3a8" opacity={center ? 0.9 : 0.55} />
      <circle cx="160" cy="150" r="10" fill="#ffffff" opacity={center ? 0.9 : 0.4} />
    </svg>
  );
}

export function SeerahPortalCrossroads() {
  return (
    <section className={styles.crossroads} data-visual="seerah-crossroads">
      <div className={styles.crossroadsHead}>
        <h2 className={styles.crossroadsTitle}>
          أبواب السيرة النبوية — Portals of the Seerah
        </h2>
        <Link href="/" className={styles.crossroadsHome} data-visual="seerah-home-link">
          واجهة الموقع الرئيسية → Home
        </Link>
      </div>

      <div className={styles.arcade} role="region" aria-label="أبواب وجهات السيرة">
        {/* Central luminous arch → the living Seerah world */}
        <Link
          href={CENTER.href}
          className={`${styles.portal} ${styles.center}`}
          data-visual="seerah-portal-world"
        >
          <PortalArch center />
          <span className={styles.portalLabel} lang="ar" dir="rtl">
            {CENTER.ar}
          </span>
          <span className={styles.portalEn} lang="en">
            {CENTER.en}
          </span>
          <ChevronRight size={14} aria-hidden />
          <p className={styles.portalNote}>
            {CENTER_NOTE_AR}
          </p>
          <span className={styles.portalNote}>{CENTER_NOTE_EN}</span>
        </Link>

        {PORTALS.map((portal) => (
          <Link
            key={portal.id}
            href={portal.href}
            className={styles.portal}
            data-visual={`seerah-portal-${portal.id}`}
          >
            <PortalArch />
            <span className={styles.portalLabel} lang="ar" dir="rtl">
              {portal.ar}
            </span>
            <span className={styles.portalEn} lang="en">{portal.en}</span>
            <ChevronRight size={14} aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}

SeerahPortalCrossroads.displayName = "SeerahPortalCrossroads";
