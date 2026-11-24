import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import styles from "./LivingThreshold.module.css";

export interface LivingThresholdProps {
  /** Label shown above the door — Arabic */
  siteNameAr: string;
  /** Label shown above the door — English */
  siteNameEn?: string;
  /** Whether the threshold experience is active */
  active: boolean;
  /** Called when the doors finish opening and the user has entered */
  onEntered: () => void;
  /** Called when the user cancels/skips the entrance */
  onCancel?: () => void;
  /** Text on the enter door button (Arabic) */
  openLabelAr?: string;
  /** Text on the enter door button (English) */
  openLabelEn?: string;
}

type Phase = "closed" | "opening" | "leaving";

const NAV_AR = [
  { label: "السيرة", href: "/seerah" },
  { label: "الأماكن", href: "/atlas" },
  { label: "الشخصيات", href: "/seerah/database" },
  { label: "الأحداث", href: "/seerah/world" },
  { label: "الدروس", href: "/library" },
] as const;

const NAV_EN = [
  { label: "JOURNEY", href: "/seerah" },
  { label: "PLACES", href: "/atlas" },
  { label: "PEOPLE", href: "/seerah/database" },
  { label: "EVENTS", href: "/seerah/world" },
  { label: "LESSONS", href: "/library" },
] as const;

/* Seeded pseudo-random stars so the sky is stable across renders. */
function seededStars(count = 110) {
  let s = 4321;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: count }, (_, i) => ({
    key: `star-${i}`,
    x: rand() * 100,
    y: rand() * 56,
    r: rand() * 1.6 + 0.3,
    o: rand() * 0.75 + 0.25,
  }));
}

/* Minimal palm-frond ornament for the top-left corner. */
const PALM_FRONDS = (
  <>
    <path
      d="M40 20 Q120 10 220 40 Q260 10 240 0 Q210 -30 150 -10 Q110 20 80 0 L40 20 Z"
      fill="none"
      stroke="#2d4a33"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M60 30 Q180 20 280 70 Q320 10 300 0 Q270 -40 210 -20 Q170 30 130 10 L90 30 Z"
      fill="none"
      stroke="#2d4a33"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M100 40 Q220 50 300 90 Q340 20 320 -10 Q290 -60 240 -30 Q200 40 160 20 L120 40 Z"
      fill="none"
      stroke="#2d4a33"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </>
);

export function LivingThreshold({
  siteNameAr,
  siteNameEn,
  active,
  onEntered,
  onCancel,
  openLabelAr,
  openLabelEn,
}: LivingThresholdProps) {
  const lang = useInstitution((s) => s.lang);
  const reducedMotion = useEffectiveMotion() === "reduced";
  const stars = useMemo(() => seededStars(110), []);
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const handleEnter = useCallback(() => {
    if (phase !== "closed") return;
    if (reducedMotion) {
      onEntered();
      return;
    }
    setPhase("opening");
    timers.current.push(window.setTimeout(() => setPhase("leaving"), 2100));
    timers.current.push(window.setTimeout(() => onEntered(), 2900));
  }, [phase, reducedMotion, onEntered]);

  const handleCancel = useCallback(() => {
    if (phase === "closed") onCancel?.();
  }, [phase, onCancel]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, handleCancel]);

  const enterLabelAr = openLabelAr ?? "ادخل إلى السيرة";
  const enterLabelEn = openLabelEn ?? "ENTER THE SEERAH";

  const isRtl = lang === "ar";
  const nav = isRtl ? NAV_AR : NAV_EN;

  return (
    <div
      className={`${styles.overlay} ${phase !== "leaving" ? styles.visible : ""}`}
      data-visual="living-threshold"
      data-phase={phase}
      aria-modal="true"
      role="dialog"
      aria-label={
        isRtl ? "باب الدخول إلى السيرة النبوية" : "Entrance to the Living Seerah"
      }
    >
      <svg className={styles.sky} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="yraSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05070f" />
            <stop offset="55%" stopColor="#0b1426" />
            <stop offset="100%" stopColor="#0a1220" />
          </linearGradient>
          <radialGradient id="yraMoonGrad">
            <stop offset="0%" stopColor="#f7f0d8" />
            <stop offset="55%" stopColor="#e6d9a4" />
            <stop offset="100%" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="yraFloorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#162036" />
            <stop offset="65%" stopColor="#0a0e18" />
            <stop offset="100%" stopColor="#04060d" />
          </linearGradient>
          <pattern id="yraArabesque" width="34" height="34" patternUnits="userSpaceOnUse">
            <path
              d="M17 3 L21 13 L31 17 L21 21 L17 31 L13 21 L3 17 L13 13 Z"
              fill="none"
              stroke="#6f7a99"
              strokeWidth="1.4"
            />
            <circle cx="17" cy="17" r="3" fill="#6f7a99" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#yraSkyGrad)" />
        {stars.map((st) => (
          <circle
            key={st.key}
            className={styles.star}
            cx={st.x}
            cy={st.y}
            r={st.r}
            opacity={st.o}
          />
        ))}
        {/* Moon upper-left */}
        <g transform="translate(215, 150)">
          <circle r="95" fill="url(#yraMoonGrad)" opacity="0.92" />
          <circle r="42" fill="#f4e8c4" />
        </g>
        {/* Mountains silhouette */}
        <path
          className={styles.mountain}
          d="M0 640 L150 510 L290 600 L430 490 L570 620 L730 520 L880 610 L1040 540 L1200 590 L1360 520 L1440 600 L1440 900 L0 900 Z"
          fill="#080b13"
        />
        <path
          className={styles.mountain}
          d="M90 680 L230 560 L370 650 L510 550 L650 670 L790 570 L930 660 L1070 590 L1210 640 L1350 580 L1440 650 L1440 900 L90 900 Z"
          fill="#0c111c"
          opacity="0.85"
        />
        {/* Distant lit town on the horizon */}
        {[98, 220, 345, 460, 590, 720, 840, 970, 1090, 1210, 1340].map((x, i) => (
          <g key={`town-${i}`} className={styles.townLight}>
            <circle cx={x} cy={628 - (i % 3) * 6} r={2 + (i % 4)} />
            <circle cx={x + 5} cy={634 - (i % 2) * 5} r={1.5} />
          </g>
        ))}
        {/* Palm fronds top-left */}
        <foreignObject x="0" y="0" width="340" height="300">
          {PALM_FRONDS}
        </foreignObject>
      </svg>

      {/* Floor + far horizon lines */}
      <div className={styles.floor} />
      <div className={styles.floorLine}>
        <span style={{ transform: "translatex(-50%) rotatex(42deg)" }} />
      </div>

      {/* Top navigation bar */}
      <header className={styles.topBar}>
        <div className={styles.logoWord}>
          يا رسول <span className={styles.logoSalat}>الله</span> ﷺ
        </div>
        <nav className={styles.navLinks}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLinks}>
              {item.label}
            </Link>
          ))}
        </nav>
        <a href="/library" className={styles.libraryButton}>
          {isRtl ? "المكتبة" : "THE LIBRARY"}
        </a>
      </header>

      {/* Skip control */}
      <button
        type="button"
        className={styles.skip}
        onClick={handleCancel}
        data-visual="threshold-skip"
      >
        {isRtl ? "تخطَّ" : "Skip"}
      </button>

      {/* Left title block */}
      <div className={styles.titleBlock} data-visual="threshold-title">
        <p className={styles.titleKick}>
          {isRtl ? "الموسوعة الحية للسيرة النبوية" : "The Living Seerah"}
        </p>
        <h1 className={styles.titleMain}>
          {siteNameAr || "يا رسول الله"} <span className={styles.logoSalat}>ﷺ</span>
        </h1>
        <p className={styles.titleEn}>
          {siteNameEn || "YA RASOOL ALLAH"}
        </p>
        <p className={styles.titleSub}>
          {isRtl
            ? "رحلة تفاعلية حيّة في سيرة النبي محمد ﷺ، من المبعث إلى المدينة، عبر الأطلس، المكتبة، القرآن والحديث."
            : "An immersive living journey through the Seerah of the Prophet ﷺ — from the revelation to Madinah, across the Atlas, the Library, the Qur'an and Hadith."}
        </p>
      </div>

      {/* Doorway */}
      <div
        className={`${styles.doorway} ${isRtl ? styles.doorwayMobile : ""}`}
        data-visual="threshold-doorway"
      >
        <div className={styles.floorPool} />
        <div className={styles.seam} />
        <div className={styles.spill} />
        <div className={styles.archWrap}>
          <svg className={styles.archSvg} viewBox="0 0 640 800" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="yraStoneGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2a3145" />
                <stop offset="50%" stopColor="#3d465e" />
                <stop offset="100%" stopColor="#232a3c" />
              </linearGradient>
            </defs>
            {/* Stone arch frame: outer arch minus inner opening, evenodd fill */}
            <path
              d="M40 800 L40 300 Q40 130 320 60 Q600 130 600 300 L600 800 Z
                 M130 800 L130 330 Q130 200 320 150 Q510 200 510 330 L510 800 Z"
              fill="url(#yraStoneGrad)"
              fillRule="evenodd"
              stroke="#4a5470"
              strokeWidth="2"
            />
            {/* Carved arabesque band along the arch crown */}
            <path
              d="M40 260 Q40 140 320 80 Q600 140 600 260 L600 330 Q600 400 320 470 Q40 400 40 330 Z"
              fill="url(#yraArabesque)"
              fillOpacity="0.5"
            />
            {/* Columns */}
            <rect x="44" y="310" width="86" height="490" fill="url(#yraStoneGrad)" stroke="#4a5470" strokeWidth="1.5" />
            <rect x="510" y="310" width="86" height="490" fill="url(#yraStoneGrad)" stroke="#4a5470" strokeWidth="1.5" />
            <line x1="72" y1="320" x2="72" y2="790" stroke="#5a657e" strokeWidth="1.2" opacity="0.6" />
            <line x1="538" y1="320" x2="538" y2="790" stroke="#5a657e" strokeWidth="1.2" opacity="0.6" />
            {/* Keystone star */}
            <polygon points="320,40 332,64 358,64 338,80 346,104 320,89 294,104 302,80 282,64 308,64 Z" fill="#c9a227" />
            {/* Base steps */}
            <rect x="20" y="785" width="600" height="15" fill="#1f2738" />
            <rect x="35" y="800" width="570" height="10" fill="#161c28" />
          </svg>
        </div>

        <div className={styles.doorInner}>
          <div className={`${styles.leaf} ${styles.leafL}`} data-visual="threshold-door-left">
            <div className={styles.leafFace}>
              <div className={styles.leafTexture} />
              <div className={styles.studs}>
                {[100, 220, 340].map((y) => (
                  <div key={`l-${y}`} className={styles.stud} style={{ left: "22px", top: y }} />
                ))}
                {[100, 220, 340].map((y) => (
                  <div key={`l2-${y}`} className={styles.stud} style={{ right: "22px", top: y }} />
                ))}
              </div>
              <div className={styles.medallionWrap}>
                <div className={styles.medallion} aria-hidden="true">
                  ★
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.leaf} ${styles.leafR}`} data-visual="threshold-door-right">
            <div className={styles.leafFace}>
              <div className={styles.leafTexture} />
              <div className={styles.studs}>
                {[100, 220, 340].map((y) => (
                  <div key={`r-${y}`} className={styles.stud} style={{ left: "22px", top: y }} />
                ))}
                {[100, 220, 340].map((y) => (
                  <div key={`r2-${y}`} className={styles.stud} style={{ right: "22px", top: y }} />
                ))}
              </div>
              <div className={styles.medallionWrap}>
                <div className={styles.medallion} aria-hidden="true">
                  ☪
                </div>
              </div>
              <div className={`${styles.handle} ${styles.handleR}`} />
            </div>
          </div>
        </div>

        {/* Lanterns */}
        <div className={`${styles.lanternWrap} ${styles.lanternL}`}>
          <div className={styles.glow} />
          <div className={styles.lantern}>
            <div className={styles.lanternGlass} />
            <div className={styles.flame} />
          </div>
        </div>
        <div className={`${styles.lanternWrap} ${styles.lanternR}`}>
          <div className={styles.glow} style={{ animationDelay: "1.1s" }} />
          <div className={styles.lantern} style={{ animationDelay: "0.7s" }}>
            <div className={styles.lanternGlass} />
            <div className={styles.flame} style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>

      {/* Foreground props ledge */}
      <div className={styles.foreground}>
        <svg className={styles.foregroundSvg} viewBox="0 0 1440 144" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="yraWoodGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a3728" />
              <stop offset="50%" stopColor="#5c4430" />
              <stop offset="100%" stopColor="#4a3728" />
            </linearGradient>
            <linearGradient id="yraStoneLedge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d465e" />
              <stop offset="100%" stopColor="#2a3145" />
            </linearGradient>
          </defs>
          <rect width="1440" height="52" y="92" fill="url(#yraStoneLedge)" />
          {/* Books stack left */}
          <rect x="60" y="72" width="62" height="34" rx="3" fill="url(#yraWoodGrad)" stroke="#8b7352" strokeWidth="1" transform="rotate(-4 91 89)" />
          <rect x="122" y="62" width="72" height="24" rx="3" fill="#3d2a1d" stroke="#8b7352" strokeWidth="1" transform="rotate(3 158 74)" />
          <rect x="68" y="86" width="56" height="20" rx="2" fill="#2e1f14" transform="rotate(-2 96 96)" />
          {/* Astrolabe center */}
          <g transform="translate(720, 90)">
            <circle r="30" fill="none" stroke="#c9a227" strokeWidth="2.5" opacity="0.9" />
            <circle r="22" fill="none" stroke="#6f7a99" strokeWidth="1" opacity="0.5" />
            <circle r="4" fill="#f3e3a8" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#c9a227" strokeWidth="1.5" opacity="0.7" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#c9a227" strokeWidth="1.5" opacity="0.7" />
          </g>
          {/* Small lantern left */}
          <g transform="translate(180, 78)">
            <rect x="18" y="22" width="12" height="26" fill="#5c4430" rx="2" />
            <rect x="14" y="46" width="20" height="12" fill="#3d2a1d" />
            <circle cx="24" cy="44" r="6" fill="#ffca6a" opacity="0.9" />
          </g>
          {/* Scroll right */}
          <g transform="translate(1180, 60)">
            <rect x="0" y="40" width="46" height="64" rx="3" fill="#2a3145" stroke="#5a657e" strokeWidth="1" />
            <ellipse cx="23" cy="40" rx="23" ry="7" fill="#1f2738" stroke="#5a657e" strokeWidth="1" />
            <rect x="4" y="50" width="38" height="10" fill="#c9a227" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* Enter button */}
      <div className={styles.enterWrap}>
        <button
          type="button"
          className={styles.enterBtn}
          onClick={handleEnter}
          data-visual="threshold-enter"
          autoFocus
        >
          <span className={styles.enterAr} lang="ar" dir="rtl">
            {enterLabelAr}
          </span>
          <span className={styles.enterEn} lang="en">
            {enterLabelEn}
          </span>
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={styles.pulse} />
        </button>
      </div>
    </div>
  );
}

LivingThreshold.displayName = "LivingThreshold";
