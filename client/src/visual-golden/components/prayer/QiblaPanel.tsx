import { useEffect, useState } from "react";
import { compassCardinal, distanceToKaabaKm, qiblaBearing } from "@/visual-golden/services/prayer/qibla";
import { t, type Lang } from "@/visual-golden/lib/i18n";
import styles from "./prayer.module.css";

interface Props {
  lat: number;
  lng: number;
  lang: Lang;
}

export function QiblaPanel({ lat, lng, lang }: Props) {
  const bearing = qiblaBearing(lat, lng);
  const km = distanceToKaabaKm(lat, lng);
  const [heading, setHeading] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [denied, setDenied] = useState(false);
  const sensor = typeof window !== "undefined" && "DeviceOrientationEvent" in window;

  useEffect(() => {
    if (!live) return;
    const onOri = (e: DeviceOrientationEvent) => {
      const abs = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      const alpha = typeof abs === "number" ? abs : e.alpha;
      if (typeof alpha === "number") setHeading(alpha);
    };
    window.addEventListener("deviceorientation", onOri);
    return () => window.removeEventListener("deviceorientation", onOri);
  }, [live]);

  async function enableLive() {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === "function") {
      const res = await DOE.requestPermission();
      if (res !== "granted") {
        setDenied(true);
        return;
      }
    }
    setLive(true);
  }

  const rotation = live && heading !== null ? bearing - heading : bearing;

  return (
    <div className={styles.panel}>
      <h3 style={{ margin: "0 0 0.6rem", color: "var(--gold-300)" }}>{t(lang, "qibla")}</h3>
      <div className={styles.qiblaBox}>
        <div className={styles.compass} aria-hidden>
          <svg viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="74" fill="#041612" stroke="rgba(212,160,23,0.5)" strokeWidth="2" />
            <text x="80" y="18" textAnchor="middle" fill="#e8c547" fontSize="10">N</text>
            <g transform={`rotate(${rotation} 80 80)`}>
              <polygon points="80,18 86,80 80,74 74,80" fill="#e8c547" />
              <polygon points="80,142 86,80 80,86 74,80" fill="rgba(255,255,255,0.25)" />
            </g>
            <circle cx="80" cy="80" r="8" fill="#0b3d32" stroke="#e8c547" />
          </svg>
        </div>
        <div className={styles.qiblaMeta}>
          <div className={styles.qiblaDeg}>{bearing.toFixed(1)}°</div>
          <p>
            {t(lang, "calculatedBearing")} — {compassCardinal(bearing, lang)}
          </p>
          <p className="muted">
            {lang === "ar" ? "المسافة إلى الكعبة" : "Distance to the Kaaba"}: {km.toFixed(0)} {lang === "ar" ? "كم" : "km"}
          </p>
          {sensor ? (
            <button type="button" className={styles.ghost} onClick={enableLive} style={{ marginTop: 8 }}>
              {t(lang, "liveCompass")}
            </button>
          ) : (
            <p className="muted">{lang === "ar" ? "مستشعر الاتجاه غير متاح على هذا الجهاز." : "Device orientation is not available on this device."}</p>
          )}
          {live && heading !== null ? (
            <p className={styles.liveOn}>
              {lang === "ar" ? "بوصلة حية" : "Live"} · {heading.toFixed(0)}°
            </p>
          ) : null}
          {denied ? <p className="muted">{lang === "ar" ? "رُفض إذن البوصلة." : "Compass permission denied."}</p> : null}
        </div>
      </div>
    </div>
  );
}
