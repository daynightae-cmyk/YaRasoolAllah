import type { PrayerLocation } from "./types";

/** Curated city catalog — coordinates and IANA timezone only. Prayer times always come from the provider. */
export const PRAYER_LOCATIONS: PrayerLocation[] = [
  { id: "ae-auh", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", cityAr: "أبوظبي", cityEn: "Abu Dhabi", lat: 24.4539, lng: 54.3773, timezoneHint: "Asia/Dubai" },
  { id: "ae-dxb", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", cityAr: "دبي", cityEn: "Dubai", lat: 25.2048, lng: 55.2708, timezoneHint: "Asia/Dubai" },
  { id: "ae-shj", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", cityAr: "الشارقة", cityEn: "Sharjah", lat: 25.3463, lng: 55.4209, timezoneHint: "Asia/Dubai" },
  { id: "sa-mak", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", cityAr: "مكة المكرمة", cityEn: "Makkah", lat: 21.3891, lng: 39.8579, timezoneHint: "Asia/Riyadh" },
  { id: "sa-med", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", cityAr: "المدينة المنورة", cityEn: "Madinah", lat: 24.5247, lng: 39.5692, timezoneHint: "Asia/Riyadh" },
  { id: "sa-ruh", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", cityAr: "الرياض", cityEn: "Riyadh", lat: 24.7136, lng: 46.6753, timezoneHint: "Asia/Riyadh" },
  { id: "sa-jed", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", cityAr: "جدة", cityEn: "Jeddah", lat: 21.4858, lng: 39.1925, timezoneHint: "Asia/Riyadh" },
  { id: "eg-cai", countryCode: "EG", countryAr: "مصر", countryEn: "Egypt", cityAr: "القاهرة", cityEn: "Cairo", lat: 30.0444, lng: 31.2357, timezoneHint: "Africa/Cairo" },
  { id: "eg-alx", countryCode: "EG", countryAr: "مصر", countryEn: "Egypt", cityAr: "الإسكندرية", cityEn: "Alexandria", lat: 31.2001, lng: 29.9187, timezoneHint: "Africa/Cairo" },
  { id: "gb-lon", countryCode: "GB", countryAr: "المملكة المتحدة", countryEn: "United Kingdom", cityAr: "لندن", cityEn: "London", lat: 51.5074, lng: -0.1278, timezoneHint: "Europe/London" },
  { id: "gb-bhx", countryCode: "GB", countryAr: "المملكة المتحدة", countryEn: "United Kingdom", cityAr: "برمنغهام", cityEn: "Birmingham", lat: 52.4862, lng: -1.8904, timezoneHint: "Europe/London" },
  { id: "us-nyc", countryCode: "US", countryAr: "الولايات المتحدة", countryEn: "United States", cityAr: "نيويورك", cityEn: "New York", lat: 40.7128, lng: -74.006, timezoneHint: "America/New_York" },
  { id: "us-chi", countryCode: "US", countryAr: "الولايات المتحدة", countryEn: "United States", cityAr: "شيكاغو", cityEn: "Chicago", lat: 41.8781, lng: -87.6298, timezoneHint: "America/Chicago" },
  { id: "us-lax", countryCode: "US", countryAr: "الولايات المتحدة", countryEn: "United States", cityAr: "لوس أنجلوس", cityEn: "Los Angeles", lat: 34.0522, lng: -118.2437, timezoneHint: "America/Los_Angeles" },
  { id: "fr-par", countryCode: "FR", countryAr: "فرنسا", countryEn: "France", cityAr: "باريس", cityEn: "Paris", lat: 48.8566, lng: 2.3522, timezoneHint: "Europe/Paris" },
  { id: "tr-ist", countryCode: "TR", countryAr: "تركيا", countryEn: "Turkey", cityAr: "إسطنبول", cityEn: "Istanbul", lat: 41.0082, lng: 28.9784, timezoneHint: "Europe/Istanbul" },
  { id: "id-jkt", countryCode: "ID", countryAr: "إندونيسيا", countryEn: "Indonesia", cityAr: "جاكرتا", cityEn: "Jakarta", lat: -6.2088, lng: 106.8456, timezoneHint: "Asia/Jakarta" },
  { id: "pk-khi", countryCode: "PK", countryAr: "باكستان", countryEn: "Pakistan", cityAr: "كراتشي", cityEn: "Karachi", lat: 24.8607, lng: 67.0011, timezoneHint: "Asia/Karachi" },
  { id: "pk-isb", countryCode: "PK", countryAr: "باكستان", countryEn: "Pakistan", cityAr: "إسلام آباد", cityEn: "Islamabad", lat: 33.6844, lng: 73.0479, timezoneHint: "Asia/Karachi" },
  { id: "jo-amm", countryCode: "JO", countryAr: "الأردن", countryEn: "Jordan", cityAr: "عمّان", cityEn: "Amman", lat: 31.9454, lng: 35.9284, timezoneHint: "Asia/Amman" },
  { id: "ma-cas", countryCode: "MA", countryAr: "المغرب", countryEn: "Morocco", cityAr: "الدار البيضاء", cityEn: "Casablanca", lat: 33.5731, lng: -7.5898, timezoneHint: "Africa/Casablanca" },
  { id: "my-kul", countryCode: "MY", countryAr: "ماليزيا", countryEn: "Malaysia", cityAr: "كوالالمبور", cityEn: "Kuala Lumpur", lat: 3.139, lng: 101.6869, timezoneHint: "Asia/Kuala_Lumpur" },
  { id: "qa-doh", countryCode: "QA", countryAr: "قطر", countryEn: "Qatar", cityAr: "الدوحة", cityEn: "Doha", lat: 25.2854, lng: 51.531, timezoneHint: "Asia/Qatar" },
  { id: "kw-kwi", countryCode: "KW", countryAr: "الكويت", countryEn: "Kuwait", cityAr: "مدينة الكويت", cityEn: "Kuwait City", lat: 29.3759, lng: 47.9774, timezoneHint: "Asia/Kuwait" },
  { id: "om-mct", countryCode: "OM", countryAr: "عُمان", countryEn: "Oman", cityAr: "مسقط", cityEn: "Muscat", lat: 23.588, lng: 58.3829, timezoneHint: "Asia/Muscat" },
  { id: "bh-bah", countryCode: "BH", countryAr: "البحرين", countryEn: "Bahrain", cityAr: "المنامة", cityEn: "Manama", lat: 26.2285, lng: 50.586, timezoneHint: "Asia/Bahrain" },
  { id: "tn-tun", countryCode: "TN", countryAr: "تونس", countryEn: "Tunisia", cityAr: "تونس", cityEn: "Tunis", lat: 36.8065, lng: 10.1815, timezoneHint: "Africa/Tunis" },
  { id: "dz-alg", countryCode: "DZ", countryAr: "الجزائر", countryEn: "Algeria", cityAr: "الجزائر", cityEn: "Algiers", lat: 36.7538, lng: 3.0588, timezoneHint: "Africa/Algiers" },
  { id: "iq-bgd", countryCode: "IQ", countryAr: "العراق", countryEn: "Iraq", cityAr: "بغداد", cityEn: "Baghdad", lat: 33.3152, lng: 44.3661, timezoneHint: "Asia/Baghdad" },
  { id: "ps-jrs", countryCode: "PS", countryAr: "فلسطين", countryEn: "Palestine", cityAr: "القدس", cityEn: "Jerusalem", lat: 31.7683, lng: 35.2137, timezoneHint: "Asia/Jerusalem" },
  { id: "lb-bey", countryCode: "LB", countryAr: "لبنان", countryEn: "Lebanon", cityAr: "بيروت", cityEn: "Beirut", lat: 33.8938, lng: 35.5018, timezoneHint: "Asia/Beirut" },
  { id: "sd-krt", countryCode: "SD", countryAr: "السودان", countryEn: "Sudan", cityAr: "الخرطوم", cityEn: "Khartoum", lat: 15.5007, lng: 32.5599, timezoneHint: "Africa/Khartoum" },
  { id: "ng-los", countryCode: "NG", countryAr: "نيجيريا", countryEn: "Nigeria", cityAr: "لاغوس", cityEn: "Lagos", lat: 6.5244, lng: 3.3792, timezoneHint: "Africa/Lagos" },
  { id: "bd-dac", countryCode: "BD", countryAr: "بنغلاديش", countryEn: "Bangladesh", cityAr: "دكا", cityEn: "Dhaka", lat: 23.8103, lng: 90.4125, timezoneHint: "Asia/Dhaka" },
  { id: "in-del", countryCode: "IN", countryAr: "الهند", countryEn: "India", cityAr: "دلهي", cityEn: "Delhi", lat: 28.6139, lng: 77.209, timezoneHint: "Asia/Kolkata" },
  { id: "au-syd", countryCode: "AU", countryAr: "أستراليا", countryEn: "Australia", cityAr: "سيدني", cityEn: "Sydney", lat: -33.8688, lng: 151.2093, timezoneHint: "Australia/Sydney" },
  { id: "ca-tor", countryCode: "CA", countryAr: "كندا", countryEn: "Canada", cityAr: "تورونتو", cityEn: "Toronto", lat: 43.6532, lng: -79.3832, timezoneHint: "America/Toronto" },
  { id: "de-ber", countryCode: "DE", countryAr: "ألمانيا", countryEn: "Germany", cityAr: "برلين", cityEn: "Berlin", lat: 52.52, lng: 13.405, timezoneHint: "Europe/Berlin" },
];

export function countriesFromCatalog() {
  const map = new Map<string, { code: string; ar: string; en: string }>();
  for (const loc of PRAYER_LOCATIONS) {
    if (!map.has(loc.countryCode)) {
      map.set(loc.countryCode, { code: loc.countryCode, ar: loc.countryAr, en: loc.countryEn });
    }
  }
  return [...map.values()];
}

export function citiesForCountry(code: string) {
  return PRAYER_LOCATIONS.filter((l) => l.countryCode === code);
}

export function findLocation(id: string) {
  return PRAYER_LOCATIONS.find((l) => l.id === id);
}

export function nearestLocation(lat: number, lng: number) {
  let best = PRAYER_LOCATIONS[0];
  let bestD = Infinity;
  for (const loc of PRAYER_LOCATIONS) {
    const d = (loc.lat - lat) ** 2 + (loc.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = loc;
    }
  }
  return best;
}

export function gpsLocation(lat: number, lng: number): PrayerLocation {
  return {
    id: `gps-${lat.toFixed(4)}-${lng.toFixed(4)}`,
    countryCode: "GPS",
    countryAr: "موقعك الحالي",
    countryEn: "Current location",
    cityAr: "إحداثيات الجهاز",
    cityEn: "Device coordinates",
    lat,
    lng,
  };
}
