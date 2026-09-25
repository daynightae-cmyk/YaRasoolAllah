export interface QuranChapter {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  ayahCount: number;
  revelationType: "meccan" | "medinan";
}

export interface QuranVerse {
  surah: number;
  ayah: number;
  arabic: string;
  /**
   * English development-sample translation. Present only for sample verses;
   * null everywhere else until licensed translation resources are acquired.
   */
  translation: string | null;
  transliteration?: string;
  tafsir?: string;
  surahName: string;
}

export interface SearchResult {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  surahName: string;
}

export interface DailyVerse {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string | null;
  surahName: string;
}

// Full Uthmani Arabic corpus (Tanzil v1.1, verbatim). Loaded lazily so the
// ~1.2MB text is code-split away from the initial bundle. Display text is
// never modified; translations/tafsir remain separate pending resources.
let corpusCache: Record<string, string> | null = null;

async function getCorpus(): Promise<Record<string, string>> {
  if (!corpusCache) {
    const module = await import("@/data/quranCorpus");
    corpusCache = module.UTHMANI_VERSES as Record<string, string>;
  }
  return corpusCache;
}

// Authentic Quran chapter data based on the actual Quran
const quranChapters: QuranChapter[] = [
  {
    number: 1,
    name: "الفاتحة",
    arabicName: "الفاتحة",
    englishName: "Al-Fatihah",
    ayahCount: 7,
    revelationType: "meccan",
  },
  {
    number: 2,
    name: "البقرة",
    arabicName: "البقرة",
    englishName: "Al-Baqarah",
    ayahCount: 286,
    revelationType: "medinan",
  },
  {
    number: 3,
    name: "آل عمران",
    arabicName: "آل عمران",
    englishName: "Ali 'Imran",
    ayahCount: 200,
    revelationType: "medinan",
  },
  {
    number: 4,
    name: "النساء",
    arabicName: "النساء",
    englishName: "An-Nisa",
    ayahCount: 176,
    revelationType: "medinan",
  },
  {
    number: 5,
    name: "المائدة",
    arabicName: "المائدة",
    englishName: "Al-Ma'idah",
    ayahCount: 120,
    revelationType: "medinan",
  },
  {
    number: 6,
    name: "الأنعام",
    arabicName: "الأنعام",
    englishName: "Al-An'am",
    ayahCount: 165,
    revelationType: "meccan",
  },
  {
    number: 7,
    name: "الأعراف",
    arabicName: "الأعراف",
    englishName: "Al-A'raf",
    ayahCount: 206,
    revelationType: "meccan",
  },
  {
    number: 8,
    name: "الأنفال",
    arabicName: "الأنفال",
    englishName: "Al-Anfal",
    ayahCount: 75,
    revelationType: "medinan",
  },
  {
    number: 9,
    name: "التوبة",
    arabicName: "التوبة",
    englishName: "At-Tawbah",
    ayahCount: 129,
    revelationType: "medinan",
  },
  {
    number: 10,
    name: "يونس",
    arabicName: "يونس",
    englishName: "Yunus",
    ayahCount: 109,
    revelationType: "meccan",
  },
  {
    number: 11,
    name: "هود",
    arabicName: "هود",
    englishName: "Hud",
    ayahCount: 123,
    revelationType: "meccan",
  },
  {
    number: 12,
    name: "يوسف",
    arabicName: "يوسف",
    englishName: "Yusuf",
    ayahCount: 111,
    revelationType: "meccan",
  },
  {
    number: 13,
    name: "الرعد",
    arabicName: "الرعد",
    englishName: "Ar-Ra'd",
    ayahCount: 43,
    revelationType: "medinan",
  },
  {
    number: 14,
    name: "إبراهيم",
    arabicName: "إبراهيم",
    englishName: "Ibrahim",
    ayahCount: 52,
    revelationType: "meccan",
  },
  {
    number: 15,
    name: "الحجر",
    arabicName: "الحجر",
    englishName: "Al-Hijr",
    ayahCount: 99,
    revelationType: "meccan",
  },
  {
    number: 16,
    name: "النحل",
    arabicName: "النحل",
    englishName: "An-Nahl",
    ayahCount: 128,
    revelationType: "meccan",
  },
  {
    number: 17,
    name: "الإسراء",
    arabicName: "الإسراء",
    englishName: "Al-Isra",
    ayahCount: 111,
    revelationType: "meccan",
  },
  {
    number: 18,
    name: "الكهف",
    arabicName: "الكهف",
    englishName: "Al-Kahf",
    ayahCount: 110,
    revelationType: "meccan",
  },
  {
    number: 19,
    name: "مريم",
    arabicName: "مريم",
    englishName: "Maryam",
    ayahCount: 98,
    revelationType: "meccan",
  },
  {
    number: 20,
    name: "طه",
    arabicName: "طه",
    englishName: "Taha",
    ayahCount: 135,
    revelationType: "meccan",
  },
  {
    number: 21,
    name: "الأنبياء",
    arabicName: "الأنبياء",
    englishName: "Al-Anbya",
    ayahCount: 112,
    revelationType: "meccan",
  },
  {
    number: 22,
    name: "الحج",
    arabicName: "الحج",
    englishName: "Al-Hajj",
    ayahCount: 78,
    revelationType: "medinan",
  },
  {
    number: 23,
    name: "المؤمنون",
    arabicName: "المؤمنون",
    englishName: "Al-Mu'minun",
    ayahCount: 118,
    revelationType: "meccan",
  },
  {
    number: 24,
    name: "النور",
    arabicName: "النور",
    englishName: "An-Nur",
    ayahCount: 64,
    revelationType: "medinan",
  },
  {
    number: 25,
    name: "الفرقان",
    arabicName: "الفرقان",
    englishName: "Al-Furqan",
    ayahCount: 77,
    revelationType: "meccan",
  },
  {
    number: 26,
    name: "الشعراء",
    arabicName: "الشعراء",
    englishName: "Ash-Shu'ara",
    ayahCount: 227,
    revelationType: "meccan",
  },
  {
    number: 27,
    name: "النمل",
    arabicName: "النمل",
    englishName: "An-Naml",
    ayahCount: 93,
    revelationType: "meccan",
  },
  {
    number: 28,
    name: "القصص",
    arabicName: "القصص",
    englishName: "Al-Qasas",
    ayahCount: 88,
    revelationType: "meccan",
  },
  {
    number: 29,
    name: "العنكبوت",
    arabicName: "العنكبوت",
    englishName: "Al-'Ankabut",
    ayahCount: 69,
    revelationType: "meccan",
  },
  {
    number: 30,
    name: "الروم",
    arabicName: "الروم",
    englishName: "Ar-Rum",
    ayahCount: 60,
    revelationType: "meccan",
  },
  {
    number: 31,
    name: "لقمان",
    arabicName: "لقمان",
    englishName: "Luqman",
    ayahCount: 34,
    revelationType: "meccan",
  },
  {
    number: 32,
    name: "السجدة",
    arabicName: "السجدة",
    englishName: "As-Sajdah",
    ayahCount: 30,
    revelationType: "meccan",
  },
  {
    number: 33,
    name: "الأحزاب",
    arabicName: "الأحزاب",
    englishName: "Al-Ahzab",
    ayahCount: 73,
    revelationType: "medinan",
  },
  {
    number: 34,
    name: "سبأ",
    arabicName: "سبأ",
    englishName: "Saba",
    ayahCount: 54,
    revelationType: "meccan",
  },
  {
    number: 35,
    name: "فاطر",
    arabicName: "فاطر",
    englishName: "Fatir",
    ayahCount: 45,
    revelationType: "meccan",
  },
  {
    number: 36,
    name: "يس",
    arabicName: "يس",
    englishName: "Ya-Sin",
    ayahCount: 83,
    revelationType: "meccan",
  },
  {
    number: 37,
    name: "الصافات",
    arabicName: "الصافات",
    englishName: "As-Saffat",
    ayahCount: 182,
    revelationType: "meccan",
  },
  {
    number: 38,
    name: "ص",
    arabicName: "ص",
    englishName: "Sad",
    ayahCount: 88,
    revelationType: "meccan",
  },
  {
    number: 39,
    name: "الزمر",
    arabicName: "الزمر",
    englishName: "Az-Zumar",
    ayahCount: 75,
    revelationType: "meccan",
  },
  {
    number: 40,
    name: "غافر",
    arabicName: "غافر",
    englishName: "Ghafir",
    ayahCount: 85,
    revelationType: "meccan",
  },
  {
    number: 41,
    name: "فصلت",
    arabicName: "فصلت",
    englishName: "Fussilat",
    ayahCount: 54,
    revelationType: "meccan",
  },
  {
    number: 42,
    name: "الشورى",
    arabicName: "الشورى",
    englishName: "Ash-Shuraa",
    ayahCount: 53,
    revelationType: "meccan",
  },
  {
    number: 43,
    name: "الزخرف",
    arabicName: "الزخرف",
    englishName: "Az-Zukhruf",
    ayahCount: 89,
    revelationType: "meccan",
  },
  {
    number: 44,
    name: "الدخان",
    arabicName: "الدخان",
    englishName: "Ad-Dukhan",
    ayahCount: 59,
    revelationType: "meccan",
  },
  {
    number: 45,
    name: "الجاثية",
    arabicName: "الجاثية",
    englishName: "Al-Jaathiya",
    ayahCount: 37,
    revelationType: "meccan",
  },
  {
    number: 46,
    name: "الأحقاف",
    arabicName: "الأحقاف",
    englishName: "Al-Ahqaf",
    ayahCount: 35,
    revelationType: "meccan",
  },
  {
    number: 47,
    name: "محمد",
    arabicName: "محمد",
    englishName: "Muhammad",
    ayahCount: 38,
    revelationType: "medinan",
  },
  {
    number: 48,
    name: "الفتح",
    arabicName: "الفتح",
    englishName: "Al-Fath",
    ayahCount: 29,
    revelationType: "medinan",
  },
  {
    number: 49,
    name: "الحجرات",
    arabicName: "الحجرات",
    englishName: "Al-Hujurat",
    ayahCount: 18,
    revelationType: "medinan",
  },
  {
    number: 50,
    name: "ق",
    arabicName: "ق",
    englishName: "Qaaf",
    ayahCount: 45,
    revelationType: "meccan",
  },
  {
    number: 51,
    name: "الذاريات",
    arabicName: "الذاريات",
    englishName: "Adh-Dhariyat",
    ayahCount: 60,
    revelationType: "meccan",
  },
  {
    number: 52,
    name: "الطور",
    arabicName: "الطور",
    englishName: "At-Tur",
    ayahCount: 49,
    revelationType: "meccan",
  },
  {
    number: 53,
    name: "النجم",
    arabicName: "النجم",
    englishName: "An-Najm",
    ayahCount: 62,
    revelationType: "meccan",
  },
  {
    number: 54,
    name: "القمر",
    arabicName: "القمر",
    englishName: "Al-Qamar",
    ayahCount: 55,
    revelationType: "meccan",
  },
  {
    number: 55,
    name: "الرحمن",
    arabicName: "الرحمن",
    englishName: "Ar-Rahman",
    ayahCount: 78,
    revelationType: "medinan",
  },
  {
    number: 56,
    name: "الواقعة",
    arabicName: "الواقعة",
    englishName: "Al-Waaqia",
    ayahCount: 96,
    revelationType: "meccan",
  },
  {
    number: 57,
    name: "الحديد",
    arabicName: "الحديد",
    englishName: "Al-Hadid",
    ayahCount: 29,
    revelationType: "medinan",
  },
  {
    number: 58,
    name: "المجادلة",
    arabicName: "المجادلة",
    englishName: "Al-Mujadila",
    ayahCount: 22,
    revelationType: "medinan",
  },
  {
    number: 59,
    name: "الحشر",
    arabicName: "الحشر",
    englishName: "Al-Hashr",
    ayahCount: 24,
    revelationType: "medinan",
  },
  {
    number: 60,
    name: "الممتحنة",
    arabicName: "الممتحنة",
    englishName: "Al-Mumtahina",
    ayahCount: 13,
    revelationType: "medinan",
  },
  {
    number: 61,
    name: "الصف",
    arabicName: "الصف",
    englishName: "As-Saff",
    ayahCount: 14,
    revelationType: "medinan",
  },
  {
    number: 62,
    name: "الجمعة",
    arabicName: "الجمعة",
    englishName: "Al-Jumua",
    ayahCount: 11,
    revelationType: "medinan",
  },
  {
    number: 63,
    name: "المنافقون",
    arabicName: "المنافقون",
    englishName: "Al-Munafiqun",
    ayahCount: 11,
    revelationType: "medinan",
  },
  {
    number: 64,
    name: "التغابن",
    arabicName: "التغابن",
    englishName: "At-Taghabun",
    ayahCount: 18,
    revelationType: "medinan",
  },
  {
    number: 65,
    name: "الطلاق",
    arabicName: "الطلاق",
    englishName: "At-Talaq",
    ayahCount: 12,
    revelationType: "medinan",
  },
  {
    number: 66,
    name: "التحريم",
    arabicName: "التحريم",
    englishName: "At-Tahrim",
    ayahCount: 12,
    revelationType: "medinan",
  },
  {
    number: 67,
    name: "الملك",
    arabicName: "الملك",
    englishName: "Al-Mulk",
    ayahCount: 30,
    revelationType: "meccan",
  },
  {
    number: 68,
    name: "القلم",
    arabicName: "القلم",
    englishName: "Al-Qalam",
    ayahCount: 52,
    revelationType: "meccan",
  },
  {
    number: 69,
    name: "الحاقة",
    arabicName: "الحاقة",
    englishName: "Al-Haaqqa",
    ayahCount: 52,
    revelationType: "meccan",
  },
  {
    number: 70,
    name: "المعارج",
    arabicName: "المعارج",
    englishName: "Al-Maarij",
    ayahCount: 44,
    revelationType: "meccan",
  },
  {
    number: 71,
    name: "نوح",
    arabicName: "نوح",
    englishName: "Nuh",
    ayahCount: 28,
    revelationType: "meccan",
  },
  {
    number: 72,
    name: "الجن",
    arabicName: "الجن",
    englishName: "Al-Jinn",
    ayahCount: 28,
    revelationType: "meccan",
  },
  {
    number: 73,
    name: "المزمل",
    arabicName: "المزمل",
    englishName: "Al-Muzzammil",
    ayahCount: 20,
    revelationType: "meccan",
  },
  {
    number: 74,
    name: "المدثر",
    arabicName: "المدثر",
    englishName: "Al-Muddaththir",
    ayahCount: 56,
    revelationType: "meccan",
  },
  {
    number: 75,
    name: "القيامة",
    arabicName: "القيامة",
    englishName: "Al-Qiyama",
    ayahCount: 40,
    revelationType: "meccan",
  },
  {
    number: 76,
    name: "الإنسان",
    arabicName: "الإنسان",
    englishName: "Al-Insan",
    ayahCount: 31,
    revelationType: "medinan",
  },
  {
    number: 77,
    name: "المرسلات",
    arabicName: "المرسلات",
    englishName: "Al-Mursalat",
    ayahCount: 50,
    revelationType: "meccan",
  },
  {
    number: 78,
    name: "النبأ",
    arabicName: "النبأ",
    englishName: "An-Naba",
    ayahCount: 40,
    revelationType: "meccan",
  },
  {
    number: 79,
    name: "النازعات",
    arabicName: "النازعات",
    englishName: "An-Naziat",
    ayahCount: 46,
    revelationType: "meccan",
  },
  {
    number: 80,
    name: "عبس",
    arabicName: "عبس",
    englishName: "Abasa",
    ayahCount: 42,
    revelationType: "meccan",
  },
  {
    number: 81,
    name: "التكوير",
    arabicName: "التكوير",
    englishName: "At-Takwir",
    ayahCount: 29,
    revelationType: "meccan",
  },
  {
    number: 82,
    name: "الانفطار",
    arabicName: "الانفطار",
    englishName: "Al-Infitar",
    ayahCount: 19,
    revelationType: "meccan",
  },
  {
    number: 83,
    name: "المطففين",
    arabicName: "المطففين",
    englishName: "Al-Mutaffifin",
    ayahCount: 36,
    revelationType: "meccan",
  },
  {
    number: 84,
    name: "الانشقاق",
    arabicName: "الانشقاق",
    englishName: "Al-Inshiqaq",
    ayahCount: 25,
    revelationType: "meccan",
  },
  {
    number: 85,
    name: "البروج",
    arabicName: "البروج",
    englishName: "Al-Buruj",
    ayahCount: 22,
    revelationType: "meccan",
  },
  {
    number: 86,
    name: "الطارق",
    arabicName: "الطارق",
    englishName: "At-Tariq",
    ayahCount: 17,
    revelationType: "meccan",
  },
  {
    number: 87,
    name: "الأعلى",
    arabicName: "الأعلى",
    englishName: "Al-Ala",
    ayahCount: 19,
    revelationType: "meccan",
  },
  {
    number: 88,
    name: "الغاشية",
    arabicName: "الغاشية",
    englishName: "Al-Ghashiya",
    ayahCount: 26,
    revelationType: "meccan",
  },
  {
    number: 89,
    name: "الفجر",
    arabicName: "الفجر",
    englishName: "Al-Fajr",
    ayahCount: 30,
    revelationType: "meccan",
  },
  {
    number: 90,
    name: "البلد",
    arabicName: "البلد",
    englishName: "Al-Balad",
    ayahCount: 20,
    revelationType: "meccan",
  },
  {
    number: 91,
    name: "الشمس",
    arabicName: "الشمس",
    englishName: "Ash-Shams",
    ayahCount: 15,
    revelationType: "meccan",
  },
  {
    number: 92,
    name: "الليل",
    arabicName: "الليل",
    englishName: "Al-Layl",
    ayahCount: 21,
    revelationType: "meccan",
  },
  {
    number: 93,
    name: "الضحى",
    arabicName: "الضحى",
    englishName: "Ad-Duha",
    ayahCount: 11,
    revelationType: "meccan",
  },
  {
    number: 94,
    name: "الشرح",
    arabicName: "الشرح",
    englishName: "Ash-Sharh",
    ayahCount: 8,
    revelationType: "meccan",
  },
  {
    number: 95,
    name: "التين",
    arabicName: "التين",
    englishName: "At-Tin",
    ayahCount: 8,
    revelationType: "meccan",
  },
  {
    number: 96,
    name: "العلق",
    arabicName: "العلق",
    englishName: "Al-Alaq",
    ayahCount: 19,
    revelationType: "meccan",
  },
  {
    number: 97,
    name: "القدر",
    arabicName: "القدر",
    englishName: "Al-Qadr",
    ayahCount: 5,
    revelationType: "meccan",
  },
  {
    number: 98,
    name: "البينة",
    arabicName: "البينة",
    englishName: "Al-Bayyina",
    ayahCount: 8,
    revelationType: "medinan",
  },
  {
    number: 99,
    name: "الزلزلة",
    arabicName: "الزلزلة",
    englishName: "Az-Zalzala",
    ayahCount: 8,
    revelationType: "medinan",
  },
  {
    number: 100,
    name: "العاديات",
    arabicName: "العاديات",
    englishName: "Al-Adiyat",
    ayahCount: 11,
    revelationType: "meccan",
  },
  {
    number: 101,
    name: "القارعة",
    arabicName: "القارعة",
    englishName: "Al-Qaria",
    ayahCount: 11,
    revelationType: "meccan",
  },
  {
    number: 102,
    name: "التكاثر",
    arabicName: "التكاثر",
    englishName: "At-Takathur",
    ayahCount: 8,
    revelationType: "meccan",
  },
  {
    number: 103,
    name: "العصر",
    arabicName: "العصر",
    englishName: "Al-Asr",
    ayahCount: 3,
    revelationType: "meccan",
  },
  {
    number: 104,
    name: "الهمزة",
    arabicName: "الهمزة",
    englishName: "Al-Humaza",
    ayahCount: 9,
    revelationType: "meccan",
  },
  {
    number: 105,
    name: "الفيل",
    arabicName: "الفيل",
    englishName: "Al-Fil",
    ayahCount: 5,
    revelationType: "meccan",
  },
  {
    number: 106,
    name: "قريش",
    arabicName: "قريش",
    englishName: "Quraysh",
    ayahCount: 4,
    revelationType: "meccan",
  },
  {
    number: 107,
    name: "الماعون",
    arabicName: "الماعون",
    englishName: "Al-Maun",
    ayahCount: 7,
    revelationType: "meccan",
  },
  {
    number: 108,
    name: "الكوثر",
    arabicName: "الكوثر",
    englishName: "Al-Kawthar",
    ayahCount: 3,
    revelationType: "meccan",
  },
  {
    number: 109,
    name: "الكافرون",
    arabicName: "الكافرون",
    englishName: "Al-Kafirun",
    ayahCount: 6,
    revelationType: "meccan",
  },
  {
    number: 110,
    name: "النصر",
    arabicName: "النصر",
    englishName: "An-Nasr",
    ayahCount: 3,
    revelationType: "medinan",
  },
  {
    number: 111,
    name: "المسد",
    arabicName: "المسد",
    englishName: "Al-Masad",
    ayahCount: 5,
    revelationType: "meccan",
  },
  {
    number: 112,
    name: "الإخلاص",
    arabicName: "الإخلاص",
    englishName: "Al-Ikhlas",
    ayahCount: 4,
    revelationType: "meccan",
  },
  {
    number: 113,
    name: "الفلق",
    arabicName: "الفلق",
    englishName: "Al-Falaq",
    ayahCount: 5,
    revelationType: "meccan",
  },
  {
    number: 114,
    name: "الناس",
    arabicName: "الناس",
    englishName: "An-Nas",
    ayahCount: 6,
    revelationType: "meccan",
  },
];

// Sample authentic verses for demonstration
const sampleVerses: Record<string, QuranVerse> = {
  "1-1": {
    surah: 1,
    ayah: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillahir Rahmanir Raheem",
    tafsir:
      "This is the Basmalah, the opening formula that begins every chapter of the Quran except At-Tawbah. It represents the seeking of Allah's blessing and mercy before any endeavor.",
    surahName: "الفاتحة",
  },
  "1-2": {
    surah: 1,
    ayah: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds.",
    transliteration: "Alhamdu lillahi rabbil alameen",
    tafsir:
      "This verse establishes Allah as the sole recipient of all praise and as the Lord and Sustainer of all creation, encompassing all realms of existence.",
    surahName: "الفاتحة",
  },
  "1-3": {
    surah: 1,
    ayah: 3,
    arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful.",
    transliteration: "Ar-Rahmanir Raheem",
    tafsir:
      "These two attributes of Allah emphasize His mercy - Rahman refers to His general mercy for all creation, while Raheem refers to His special mercy for the believers.",
    surahName: "الفاتحة",
  },
  "1-4": {
    surah: 1,
    ayah: 4,
    arabic: "مَالِكِ يَوْمِ الدِّينِ",
    translation: "Sovereign of the Day of Recompense.",
    transliteration: "Maliki yawmid deen",
    tafsir:
      "Allah is the ultimate judge and ruler of the Day of Judgment, when all will be held accountable for their deeds.",
    surahName: "الفاتحة",
  },
  "1-5": {
    surah: 1,
    ayah: 5,
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation: "It is You we worship and You we ask for help.",
    transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
    tafsir:
      "This verse combines worship and seeking help exclusively from Allah, establishing the foundation of Islamic monotheism and dependence on Allah alone.",
    surahName: "الفاتحة",
  },
  "1-6": {
    surah: 1,
    ayah: 6,
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path.",
    transliteration: "Ihdinas siratal mustaqeem",
    tafsir:
      "A prayer for guidance to the straight path of Islam, which leads to Allah's pleasure and paradise.",
    surahName: "الفاتحة",
  },
  "1-7": {
    surah: 1,
    ayah: 7,
    arabic:
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation:
      "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    transliteration:
      "Siratal latheena an'amta alayhim ghayril maghdoobi alayhim wa lad daaleen",
    tafsir:
      "This specifies the straight path as that of the prophets, righteous people, martyrs and the pious, while seeking protection from the path of those who earned Allah's anger or went astray.",
    surahName: "الفاتحة",
  },
  "2-1": {
    surah: 2,
    ayah: 1,
    arabic: "الم",
    translation: "Alif, Lam, Meem.",
    transliteration: "Alif Lam Meem",
    tafsir:
      "These are the mysterious letters (Huruf Muqatta'at) that begin certain chapters of the Quran. Their exact meaning is known only to Allah, but they draw attention to the miraculous nature of the Quran.",
    surahName: "البقرة",
  },
  "2-2": {
    surah: 2,
    ayah: 2,
    arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    translation:
      "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    transliteration: "Thaalikal kitaabu laa rayba feeh; hudal lil muttaqeen",
    tafsir:
      "The Quran is described as a book without any doubt or falsehood, serving as guidance specifically for those who are conscious of Allah and fear Him.",
    surahName: "البقرة",
  },
  "2-255": {
    surah: 2,
    ayah: 255,
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.",
    transliteration:
      "Allahu la ilaha illa huwal hayyul qayyuum, la ta'khuthuhu sinatun wa la nawm, lahu ma fis samaawaati wa ma fil ard",
    tafsir:
      "This is Ayat al-Kursi, one of the greatest verses in the Quran. It describes Allah's absolute sovereignty, His eternal existence, and His complete control over all creation.",
    surahName: "البقرة",
  },
  "3-19": {
    surah: 3,
    ayah: 19,
    arabic: "إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ",
    translation: "Indeed, the religion in the sight of Allah is Islam.",
    transliteration: "Inna ad-deena 'indallahil Islam",
    tafsir:
      "This verse affirms that Islam is the only religion acceptable to Allah, encompassing submission to His will and following His guidance.",
    surahName: "آل عمران",
  },
  "24-35": {
    surah: 24,
    ayah: 35,
    arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    translation: "Allah is the light of the heavens and the earth.",
    transliteration: "Allahu noorus samaawaati wal ard",
    tafsir:
      "This famous 'Light Verse' describes Allah as the source of all light, both physical and spiritual, illuminating the heavens and the earth with His guidance and presence.",
    surahName: "النور",
  },
  "36-36": {
    surah: 36,
    ayah: 36,
    arabic:
      "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا مِمَّا تُنبِتُ الْأَرْضُ وَمِنْ أَنفُسِهِمْ وَمِمَّا لَا يَعْلَمُونَ",
    translation:
      "Exalted is He who created all pairs - from what the earth grows and from themselves and from that which they do not know.",
    transliteration:
      "Subhaanal lathee khalaqal azwaaja kullaha mimma tumbitul ardu wa min anfusihim wa mimma la ya'lamoon",
    tafsir:
      "This verse glorifies Allah for creating everything in pairs, including plants, humans, and even things unknown to mankind, pointing to the balance and order in creation.",
    surahName: "يس",
  },
  "55-13": {
    surah: 55,
    ayah: 13,
    arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    translation: "So which of the favors of your Lord would you deny?",
    transliteration: "Fabi ayyi alaai rabbikuma tukaththiban",
    tafsir:
      "This refrain appears 31 times in Surah Ar-Rahman, repeatedly asking mankind and jinn to acknowledge Allah's countless blessings and not deny them.",
    surahName: "الرحمن",
  },
  "112-1": {
    surah: 112,
    ayah: 1,
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say, 'He is Allah, [who is] One,'",
    transliteration: "Qul huwa Allahu ahad",
    tafsir:
      "This chapter, Al-Ikhlas, summarizes the concept of pure monotheism. It begins by declaring Allah's absolute oneness and uniqueness.",
    surahName: "الإخلاص",
  },
  "112-2": {
    surah: 112,
    ayah: 2,
    arabic: "اللَّهُ الصَّمَدُ",
    translation: "Allah, the Eternal Refuge.",
    transliteration: "Allah us-Samad",
    tafsir:
      "As-Samad means Allah is the One to whom all creation turns for their needs, the Self-Sufficient Master who is needed by all.",
    surahName: "الإخلاص",
  },
  "112-3": {
    surah: 112,
    ayah: 3,
    arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    translation: "He neither begets nor is born,",
    transliteration: "Lam yalid wa lam yoolad",
    tafsir:
      "This verse negates any notion of Allah having offspring or being born, establishing His eternal and uncreated nature.",
    surahName: "الإخلاص",
  },
  "112-4": {
    surah: 112,
    ayah: 4,
    arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    translation: "Nor is there to Him any equivalent.",
    transliteration: "Wa lam yakun lahu kufuwan ahad",
    tafsir:
      "The final verse emphasizes that nothing in creation is comparable to Allah in His essence, attributes, or actions.",
    surahName: "الإخلاص",
  },
};

export async function getQuranChapters(): Promise<QuranChapter[]> {
  // Canonical chapter metadata used by the verified local Tanzil corpus.
  return Promise.resolve(quranChapters);
}

export async function getQuranVerse(
  surah: number,
  ayah: number,
  _language?: string,
): Promise<QuranVerse | null> {
  const chapter = quranChapters.find((c) => c.number === surah);
  if (!chapter || ayah < 1 || ayah > chapter.ayahCount) {
    return Promise.resolve(null);
  }

  const corpus = await getCorpus();
  // Corpus keys are canonical `surah:ayah`; legacy sample keys use a dash.
  const arabic = corpus[`${surah}:${ayah}`];
  if (!arabic) {
    // Genuinely absent from the corpus (should not happen after range
    // validation): absence stays absence, never a status sentence.
    return Promise.resolve(null);
  }

  const sample = sampleVerses[`${surah}-${ayah}`];
  return Promise.resolve({
    surah,
    ayah,
    arabic,
    translation: sample?.translation ?? null,
    transliteration: sample?.transliteration,
    tafsir: sample?.tafsir,
    surahName: sample?.surahName ?? chapter.arabicName,
  });
}

export async function getQuranChapterVerses(
  surah: number,
): Promise<QuranVerse[]> {
  const chapter = quranChapters.find((item) => item.number === surah);
  if (!chapter) return [];

  const corpus = await getCorpus();
  const verses: QuranVerse[] = [];

  for (let ayah = 1; ayah <= chapter.ayahCount; ayah += 1) {
    const arabic = corpus[`${surah}:${ayah}`];
    if (!arabic) continue;

    const sample = sampleVerses[`${surah}-${ayah}`];
    verses.push({
      surah,
      ayah,
      arabic,
      translation: sample?.translation ?? null,
      transliteration: sample?.transliteration,
      tafsir: sample?.tafsir,
      surahName: sample?.surahName ?? chapter.arabicName,
    });
  }

  return verses;
}

export async function searchQuran(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return [];

  const q = query.toLowerCase();
  const corpus = await getCorpus();
  const results: SearchResult[] = [];

  for (const key of Object.keys(corpus)) {
    if (results.length >= 50) break;
    const [surah, ayah] = key.split(":").map(Number);
    const arabic = corpus[key];
    const sample = sampleVerses[`${surah}-${ayah}`];
    const matchesArabic = arabic.includes(query);
    const matchesTranslation =
      (sample?.translation ?? "").toLowerCase().includes(q);
    const matchesTransliteration =
      sample?.transliteration?.toLowerCase().includes(q) ?? false;
    if (matchesArabic || matchesTranslation || matchesTransliteration) {
      const chapter = quranChapters.find((c) => c.number === surah);
      results.push({
        surah,
        ayah,
        arabic,
        translation: sample?.translation ?? null,
        surahName: sample?.surahName ?? chapter?.arabicName ?? "",
      });
    }
  }

  return Promise.resolve(results);
}

export async function getDailyVerse(): Promise<DailyVerse> {
  // Deterministic rotation over the full corpus by day of year.
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const corpus = await getCorpus();
  const keys = Object.keys(corpus);
  const selectedKey = keys[dayOfYear % keys.length];
  const [surah, ayah] = selectedKey.split(":").map(Number);
  const sample = sampleVerses[`${surah}-${ayah}`];
  const chapter = quranChapters.find((c) => c.number === surah);

  return Promise.resolve({
    surah,
    ayah,
    arabic: corpus[selectedKey],
    translation: sample?.translation ?? null,
    surahName: sample?.surahName ?? chapter?.arabicName ?? "",
  });
}

export async function getVersesByTopic(topic: string): Promise<SearchResult[]> {
  // In a real implementation, this would search by topic/theme
  const topicKeywords: Record<string, string[]> = {
    patience: ["صبر", "patience", "sabr"],
    forgiveness: ["غفر", "forgiveness", "maghfir"],
    prayer: ["صلاة", "prayer", "salah"],
    charity: ["زكاة", "charity", "zakat"],
    faith: ["إيمان", "faith", "iman"],
    paradise: ["جنة", "paradise", "jannah"],
  };

  const keywords = topicKeywords[topic.toLowerCase()] || [topic];
  const results: SearchResult[] = [];

  for (const keyword of keywords) {
    const searchResults = await searchQuran(keyword);
    results.push(...searchResults);
  }

  // Remove duplicates
  const uniqueResults = results.filter(
    (verse, index, self) =>
      index ===
      self.findIndex((v) => v.surah === verse.surah && v.ayah === verse.ayah),
  );

  return uniqueResults;
}

export async function getTafsir(
  surah: number,
  ayah: number,
  _scholar: string = "ibn-kathir",
): Promise<string | null> {
  // Foundation truth: no per-scholar tafsir corpus is ingested. The scholar
  // argument is accepted for API stability but intentionally ignored; the
  // UI must present scholar selection as disabled/pending (see QuranPage).
  const verse = await getQuranVerse(surah, ayah);
  return verse?.tafsir || null;
}
