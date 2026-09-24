import type { PrayerCalculationSettings, PrayerDateInfo, PrayerLocation, PrayerTimesResult, PrayerTimings } from "./types";
import { dateKeyInZone, stripTime } from "./time";

interface AladhanPayload {
  code: number;
  status: string;
  data?: {
    timings: Record<string, string>;
    date: {
      readable: string;
      hijri: {
        date: string;
        weekday: { ar: string; en: string };
        month: { ar: string; en: string };
        year: string;
        method?: string;
      };
      gregorian: {
        date: string;
        weekday: { en: string };
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: { id: number; name: string };
    };
  };
}

type FetchArgs = {
  lat: number;
  lng: number;
  date: string;
  method: number;
  school: number;
  highLatitude?: string;
};

function buildUrl(data: FetchArgs) {
  const params = new URLSearchParams({
    latitude: String(data.lat),
    longitude: String(data.lng),
    method: String(data.method),
    school: String(data.school),
  });
  if (data.highLatitude && data.highLatitude !== "auto") {
    params.set("latitudeAdjustmentMethod", data.highLatitude);
  }
  return `https://api.aladhan.com/v1/timings/${encodeURIComponent(data.date)}?${params.toString()}`;
}

async function fetchAladhanClient(data: FetchArgs) {
  const res = await fetch(buildUrl(data));
  if (!res.ok) {
    return { ok: false as const, error: `HTTP ${res.status}`, status: res.status };
  }
  const body = (await res.json()) as AladhanPayload;
  if (body.code !== 200 || !body.data) {
    return { ok: false as const, error: body.status || "provider error", status: body.code };
  }
  return { ok: true as const, data: body.data };
}

async function fetchDay(args: FetchArgs) {
  return fetchAladhanClient(args);
}

function pickTimings(t: Record<string, string>): PrayerTimings {
  return {
    Fajr: stripTime(t.Fajr),
    Sunrise: stripTime(t.Sunrise),
    Dhuhr: stripTime(t.Dhuhr),
    Asr: stripTime(t.Asr),
    Maghrib: stripTime(t.Maghrib),
    Isha: stripTime(t.Isha),
    Sunset: stripTime(t.Sunset ?? t.Maghrib),
    Midnight: t.Midnight ? stripTime(t.Midnight) : undefined,
    Firstthird: t.Firstthird ? stripTime(t.Firstthird) : undefined,
    Lastthird: t.Lastthird ? stripTime(t.Lastthird) : undefined,
  };
}

function pickDate(d: NonNullable<AladhanPayload["data"]>["date"]): PrayerDateInfo {
  return {
    gregorian: d.gregorian.date,
    gregorianWeekday: d.gregorian.weekday.en,
    hijri: d.hijri.date,
    hijriWeekdayAr: d.hijri.weekday.ar,
    hijriMonthAr: d.hijri.month.ar,
    hijriYear: d.hijri.year,
    hijriMethod: d.hijri.method,
  };
}

function offsetFor(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
  } catch {
    return timezone;
  }
}

function shiftDateKey(key: string, days: number) {
  const [dd, mm, yyyy] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd + days));
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${dt.getUTCFullYear()}`;
}

export async function loadPrayerTimes(
  location: PrayerLocation,
  settings: PrayerCalculationSettings,
  dateKey?: string,
): Promise<PrayerTimesResult> {
  const high = settings.highLatitude === "auto" ? undefined : settings.highLatitude;
  const initialKey = dateKey ?? dateKeyInZone(location.timezoneHint || "UTC");
  const args = {
    lat: location.lat,
    lng: location.lng,
    date: initialKey,
    method: settings.method,
    school: settings.school,
    highLatitude: high,
  };
  let today = await fetchDay(args);
  if (!today.ok) {
    const err = new Error(today.error);
    (err as Error & { kind: string }).kind = "provider-error";
    throw err;
  }

  const providerTz = today.data.meta.timezone;
  const actualKey = dateKeyInZone(providerTz);
  if (actualKey !== initialKey) {
    const refetch = await fetchDay({ ...args, date: actualKey });
    if (refetch.ok) today = refetch;
  }

  const usedKey = actualKey === initialKey ? initialKey : dateKeyInZone(providerTz);
  const tomorrowKey = shiftDateKey(usedKey, 1);
  const tomorrow = await fetchDay({ ...args, date: tomorrowKey });
  const tomorrowFajr = tomorrow.ok ? stripTime(tomorrow.data.timings.Fajr) : null;

  return {
    location,
    settings,
    timezone: today.data.meta.timezone,
    utcOffset: offsetFor(today.data.meta.timezone),
    timings: pickTimings(today.data.timings),
    tomorrowFajr,
    date: pickDate(today.data.date),
    meta: {
      provider: "aladhan",
      methodName: today.data.meta.method.name,
      latitude: today.data.meta.latitude,
      longitude: today.data.meta.longitude,
      fetchedAt: Date.now(),
    },
  };
}
