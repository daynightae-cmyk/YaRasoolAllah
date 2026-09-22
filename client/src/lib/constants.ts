export const PRAYER_NAMES = {
  ar: ["الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"],
  en: ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"],
  fr: ["Fajr", "Lever du soleil", "Dhuhr", "Asr", "Maghrib", "Isha"],
  ur: ["فجر", "طلوع آفتاب", "ظہر", "عصر", "مغرب", "عشاء"],
};

export const ISLAMIC_MONTHS = {
  ar: [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ],
  en: [
    "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
    "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ],
  fr: [
    "Mouharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
    "Joumada al-awwal", "Joumada al-thani", "Rajab", "Cha'ban",
    "Ramadan", "Chawwal", "Dhou al-Qi'dah", "Dhou al-Hijjah"
  ],
  ur: [
    "محرم", "صفر", "ربیع الاول", "ربیع الآخر",
    "جمادی الاول", "جمادی الآخر", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدہ", "ذو الحجہ"
  ],
};

export const API_ENDPOINTS = {
  PRAYER_TIMES: "http://api.aladhan.com/v1/timings",
  GEMINI_API: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
};

export const CALCULATION_METHODS = {
  MuslimWorldLeague: "Muslim World League",
  IslamicSocietyOfNorthAmerica: "Islamic Society of North America",
  EgyptianGeneralAuthorityOfSurvey: "Egyptian General Authority of Survey",
  UmmAlQuraUniversityMakkah: "Umm Al-Qura University, Makkah",
  UniversityOfIslamicSciencesKarachi: "University of Islamic Sciences, Karachi",
  InstituteOfGeophysicsUniversityOfTehran: "Institute of Geophysics, University of Tehran",
};

export const DEFAULT_COORDINATES = {
  latitude: 24.7136,
  longitude: 46.6753, // Riyadh, Saudi Arabia
};
