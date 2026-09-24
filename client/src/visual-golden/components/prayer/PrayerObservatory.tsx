import { useEffect, useMemo, useRef, useState } from "react";
import { useInstitution, currentLocation } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import {
  cacheKey,
  computeNextPrayer,
  dateKeyInZone,
  gpsLocation,
  loadPrayerTimes,
  partsInZone,
  readCache,
  writeCache,
  type PrayerStatus,
  type PrayerTimesResult,
} from "@/visual-golden/services/prayer";
import { PrayerClock } from "./PrayerClock";
import { PrayerLocationSelector } from "./PrayerLocationSelector";
import { PrayerCards } from "./PrayerCards";
import { QiblaPanel } from "./QiblaPanel";
import { NextPrayer } from "./NextPrayer";
import { PrayerCalculationSheet } from "./PrayerCalculationSheet";
import styles from "./prayer.module.css";

export function PrayerObservatory() {
  const lang = useInstitution((s) => s.lang);
  const locId = useInstitution((s) => s.locationId);
  const custom = useInstitution((s) => s.customLocation);
  const calc = useInstitution((s) => s.calc);
  const setLocation = useInstitution((s) => s.setLocation);
  const setCalc = useInstitution((s) => s.setCalc);
  const setPanel = useInstitution((s) => s.setPanel);
  const notifyLeadMin = useInstitution((s) => s.notifyLeadMin);
  const notifyPrayers = useInstitution((s) => s.notifyPrayers);
  const location = custom ?? currentLocation();

  const [status, setStatus] = useState<PrayerStatus>("loading");
  const [data, setData] = useState<PrayerTimesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [geoBusy, setGeoBusy] = useState(false);
  const [openCalc, setOpenCalc] = useState(false);
  const [openMeta, setOpenMeta] = useState(false);
  const [openNight, setOpenNight] = useState(false);
  const fired = useRef<string | null>(null);

  useEffect(() => {
    const tmr = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(tmr);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      setError(null);
      setData(null);
      const tz = location.timezoneHint || "UTC";
      const dateKey = dateKeyInZone(tz);
      const key = cacheKey(location.lat, location.lng, dateKey, calc.method, calc.school);
      const cached = readCache(key);
      if (cached && Math.abs(cached.location.lat - location.lat) < 0.0001) {
        setData(cached);
        setStatus("loaded");
      }
      try {
        const result = await loadPrayerTimes(location, calc, dateKey);
        if (cancelled) return;
        writeCache(cacheKey(location.lat, location.lng, dateKey, calc.method, calc.school), result);
        setData(result);
        setStatus("loaded");
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "error";
        if (!cached) {
          setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "provider-error");
          setError(msg);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [location.id, location.lat, location.lng, calc.method, calc.school, calc.highLatitude, locId]);

  const next = useMemo(() => {
    if (!data) return null;
    return computeNextPrayer(data.timings, data.tomorrowFajr, data.timezone);
  }, [data, tick]);

  useEffect(() => {
    if (!next || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (!notifyPrayers.includes(next.name)) return;
    const lead = notifyLeadMin * 60;
    const stamp = `${data?.date.gregorian}-${next.name}-${next.isTomorrow ? "t" : "d"}`;
    if (next.remainingSeconds <= lead && next.remainingSeconds > lead - 2 && fired.current !== stamp) {
      fired.current = stamp;
      try {
        new Notification(lang === "ar" ? `اقتراب ${next.labelAr}` : `${next.labelEn} soon`, {
          body: lang === "ar" ? `تبقى ${Math.round(next.remainingSeconds / 60)} دقيقة · أثناء فتح الصفحة فقط` : `${Math.round(next.remainingSeconds / 60)} min remaining · only while this page is open`,
        });
      } catch {
        /* ignore */
      }
    }
  }, [next, notifyLeadMin, notifyPrayers, lang, data?.date.gregorian]);

  const nowLabel = data
    ? (() => {
        const p = partsInZone(new Date(), data.timezone);
        return `${p.hour}:${p.minute}:${p.second}`;
      })()
    : "—";

  async function onGeo() {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(gpsLocation(pos.coords.latitude, pos.coords.longitude));
        setGeoBusy(false);
      },
      (err) => {
        setGeoBusy(false);
        setStatus(err.code === err.PERMISSION_DENIED ? "permission-denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <section aria-label={t(lang, "observatory")}>
      <div className={styles.observatory}>
        <div className={styles.clockWrap}>
          {data && next ? (
            <>
              <PrayerClock
                timings={data.timings}
                timezone={data.timezone}
                next={next}
                city={lang === "ar" ? data.location.cityAr : data.location.cityEn}
                nowLabel={nowLabel}
              />
              <div className={styles.clockCaption}>
                <strong>{t(lang, "observatory")}</strong>
                <span>
                  {data.date.hijriWeekdayAr} · {data.date.hijri} {data.date.hijriMonthAr} {data.date.hijriYear} هـ
                </span>
                <span>
                  {data.date.gregorian} · {data.timezone} · {data.utcOffset}
                </span>
              </div>
            </>
          ) : (
            <p className={styles.status} role="status">
              {status === "loading" ? t(lang, "loading") : status === "offline" ? t(lang, "offline") : t(lang, "unavailable")}
            </p>
          )}
        </div>
        <div className={styles.sideCol}>
          <div className={styles.panel}>
            <PrayerLocationSelector location={location} onSelect={setLocation} onGeo={onGeo} geoBusy={geoBusy} />
            {status === "permission-denied" ? <p className={styles.err}>{t(lang, "permission")}</p> : null}
            {status === "offline" ? <p className={styles.err}>{t(lang, "offline")}</p> : null}
            {status === "provider-error" ? (
              <p className={styles.err}>
                {t(lang, "offline")} {error}
              </p>
            ) : null}
            {status === "unavailable" ? <p className={styles.err}>{t(lang, "unavailable")}</p> : null}
            {status === "loading" && data ? (
              <p className={styles.status} role="status">
                {t(lang, "loading")}
              </p>
            ) : null}
          </div>
          {next && data ? <NextPrayer next={next} lang={lang} onRemind={() => setPanel("notifications")} /> : null}
        </div>
      </div>

      {data && next ? <PrayerCards timings={data.timings} next={next} timezone={data.timezone} lang={lang} /> : null}

      <div className={styles.split}>
        {data ? <QiblaPanel lat={data.meta.latitude} lng={data.meta.longitude} lang={lang} /> : <div className={styles.panel} />}
        <PrayerCalculationSheet
          lang={lang}
          calc={calc}
          data={data}
          openCalc={openCalc}
          openMeta={openMeta}
          openNight={openNight}
          onToggleCalc={() => setOpenCalc((v) => !v)}
          onToggleMeta={() => setOpenMeta((v) => !v)}
          onToggleNight={() => setOpenNight((v) => !v)}
          onCalc={setCalc}
        />
      </div>
    </section>
  );
}
