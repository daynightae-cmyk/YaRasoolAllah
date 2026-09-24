export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerStatus = "loading" | "loaded" | "offline" | "provider-error" | "permission-denied" | "unavailable";

export interface PrayerLocation {
  id: string;
  countryCode: string;
  countryAr: string;
  countryEn: string;
  cityAr: string;
  cityEn: string;
  lat: number;
  lng: number;
  timezoneHint?: string;
}

export interface PrayerCalculationSettings {
  method: number;
  school: 0 | 1;
  highLatitude: "auto" | "ANGLE_BASED" | "MIDNIGHT" | "ONE_SEVENTH";
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunset: string;
  Midnight?: string;
  Firstthird?: string;
  Lastthird?: string;
}

export interface PrayerDateInfo {
  gregorian: string;
  gregorianWeekday: string;
  hijri: string;
  hijriWeekdayAr: string;
  hijriMonthAr: string;
  hijriYear: string;
  hijriMethod?: string;
}

export interface PrayerTimesResult {
  location: PrayerLocation;
  settings: PrayerCalculationSettings;
  timezone: string;
  utcOffset: string;
  timings: PrayerTimings;
  tomorrowFajr: string;
  date: PrayerDateInfo;
  meta: {
    provider: "aladhan";
    methodName: string;
    latitude: number;
    longitude: number;
    fetchedAt: number;
  };
}

export interface NextPrayerState {
  name: PrayerName;
  labelAr: string;
  labelEn: string;
  at: string;
  remainingSeconds: number;
  isTomorrow: boolean;
}

export const PRAYER_LABELS: Record<PrayerName, { ar: string; en: string }> = {
  Fajr: { ar: "الفجر", en: "Fajr" },
  Sunrise: { ar: "الشروق", en: "Sunrise" },
  Dhuhr: { ar: "الظهر", en: "Dhuhr" },
  Asr: { ar: "العصر", en: "Asr" },
  Maghrib: { ar: "المغرب", en: "Maghrib" },
  Isha: { ar: "العشاء", en: "Isha" },
};

export const CALC_METHODS: { id: number; ar: string; en: string }[] = [
  { id: 4, ar: "أم القرى — مكة", en: "Umm al-Qura, Makkah" },
  { id: 5, ar: "الهيئة المصرية للمساحة", en: "Egyptian General Authority" },
  { id: 3, ar: "رابطة العالم الإسلامي", en: "Muslim World League" },
  { id: 2, ar: "إسنا (أمريكا الشمالية)", en: "ISNA" },
  { id: 8, ar: "منطقة الخليج", en: "Gulf Region" },
  { id: 12, ar: "دبي", en: "Dubai" },
  { id: 13, ar: "الكويت", en: "Kuwait" },
  { id: 14, ar: "قطر", en: "Qatar" },
  { id: 7, ar: "جامعة العلوم الإسلامية كراتشي", en: "University of Islamic Sciences, Karachi" },
  { id: 15, ar: "سنغافورة", en: "Singapore" },
];
