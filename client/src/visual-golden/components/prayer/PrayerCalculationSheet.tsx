import { ChevronDown } from "lucide-react";
import { CALC_METHODS, nightWindows, type PrayerTimesResult } from "@/visual-golden/services/prayer";
import type { PrayerCalculationSettings } from "@/visual-golden/services/prayer/types";
import { t, type Lang } from "@/visual-golden/lib/i18n";
import styles from "./prayer.module.css";

interface Props {
  lang: Lang;
  calc: PrayerCalculationSettings;
  data: PrayerTimesResult | null;
  openCalc: boolean;
  openMeta: boolean;
  openNight: boolean;
  onToggleCalc: () => void;
  onToggleMeta: () => void;
  onToggleNight: () => void;
  onCalc: (patch: Partial<PrayerCalculationSettings>) => void;
}

export function PrayerCalculationSheet({
  lang,
  calc,
  data,
  openCalc,
  openMeta,
  openNight,
  onToggleCalc,
  onToggleMeta,
  onToggleNight,
  onCalc,
}: Props) {
  const night = data ? nightWindows(data.timings.Maghrib, data.tomorrowFajr) : null;

  return (
    <div className={styles.panel}>
      <button type="button" className={styles.detailsBtn} onClick={onToggleCalc} aria-expanded={openCalc}>
        {t(lang, "calcSettings")} <ChevronDown size={14} />
      </button>
      {openCalc ? (
        <div className={styles.sheet}>
          <label className={styles.field}>
            {lang === "ar" ? "طريقة الحساب" : "Method"}
            <select value={calc.method} onChange={(e) => onCalc({ method: Number(e.target.value) })}>
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {lang === "ar" ? m.ar : m.en}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            {lang === "ar" ? "حساب العصر" : "Asr convention"}
            <select value={calc.school} onChange={(e) => onCalc({ school: Number(e.target.value) as 0 | 1 })}>
              <option value={0}>{lang === "ar" ? "شافعي / مالكي / حنبلي" : "Standard (Shafi/Maliki/Hanbali)"}</option>
              <option value={1}>{lang === "ar" ? "حنفي" : "Hanafi"}</option>
            </select>
          </label>
          <label className={styles.field}>
            {lang === "ar" ? "خطوط العرض العليا" : "High latitudes"}
            <select
              value={calc.highLatitude}
              onChange={(e) => onCalc({ highLatitude: e.target.value as PrayerCalculationSettings["highLatitude"] })}
            >
              <option value="auto">Auto</option>
              <option value="ANGLE_BASED">Angle based</option>
              <option value="MIDNIGHT">Midnight</option>
              <option value="ONE_SEVENTH">One seventh</option>
            </select>
          </label>
        </div>
      ) : null}

      <button type="button" className={styles.detailsBtn} onClick={onToggleMeta} aria-expanded={openMeta}>
        {t(lang, "calcDetails")} <ChevronDown size={14} />
      </button>
      {openMeta && data ? (
        <dl className={styles.metaGrid}>
          <dt>{lang === "ar" ? "المدينة" : "City"}</dt>
          <dd>{lang === "ar" ? data.location.cityAr : data.location.cityEn}</dd>
          <dt>{lang === "ar" ? "خط العرض" : "Latitude"}</dt>
          <dd>{data.meta.latitude.toFixed(4)}</dd>
          <dt>{lang === "ar" ? "خط الطول" : "Longitude"}</dt>
          <dd>{data.meta.longitude.toFixed(4)}</dd>
          <dt>Timezone</dt>
          <dd>{data.timezone}</dd>
          <dt>UTC</dt>
          <dd>{data.utcOffset}</dd>
          <dt>{lang === "ar" ? "الطريقة" : "Method"}</dt>
          <dd>{data.meta.methodName}</dd>
          <dt>{lang === "ar" ? "المزوّد" : "Provider"}</dt>
          <dd>AlAdhan</dd>
          <dt>{lang === "ar" ? "ميلادي" : "Gregorian"}</dt>
          <dd>{data.date.gregorian}</dd>
          <dt>{lang === "ar" ? "هجري" : "Hijri"}</dt>
          <dd>
            {data.date.hijri} ({data.date.hijriMonthAr} {data.date.hijriYear})
          </dd>
          <dt>{lang === "ar" ? "طريقة الهجري" : "Hijri method"}</dt>
          <dd>{data.date.hijriMethod ?? (lang === "ar" ? "غير متاح من المزوّد" : "unavailable from provider")}</dd>
          <dt>{lang === "ar" ? "الشروق" : "Sunrise"}</dt>
          <dd>{data.timings.Sunrise}</dd>
          <dt>{lang === "ar" ? "الغروب" : "Sunset"}</dt>
          <dd>{data.timings.Sunset}</dd>
          <dt>{lang === "ar" ? "آخر تحديث" : "Fetched"}</dt>
          <dd>{new Date(data.meta.fetchedAt).toLocaleString(lang === "ar" ? "ar" : "en")}</dd>
        </dl>
      ) : null}

      <button type="button" className={styles.detailsBtn} onClick={onToggleNight} aria-expanded={openNight}>
        {t(lang, "nightStations")} <ChevronDown size={14} />
      </button>
      {openNight && night ? (
        <div className={styles.night}>
          <p>
            {lang === "ar" ? "مدة الليل" : "Night length"}: {Math.floor(night.durationMin / 60)}h {night.durationMin % 60}m
          </p>
          <p>
            {lang === "ar" ? "منتصف الليل الحسابي" : "Midpoint"}: {night.midpoint}
          </p>
          <p>
            {lang === "ar" ? "بداية الثلث الأخير (حساب زمني)" : "Last-third window start (time math)"}: {night.lastThirdStart}
          </p>
          <p className="muted">{lang === "ar" ? night.formulaAr : night.formulaEn}</p>
          <p className="muted">
            {lang === "ar"
              ? "هذه تقسيمات زمنية من المغرب إلى الفجر التالي، وليست أحكامًا فقهية."
              : "These are time divisions from Maghrib to next Fajr, not jurisprudential rulings."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
