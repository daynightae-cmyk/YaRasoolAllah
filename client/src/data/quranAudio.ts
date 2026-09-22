export interface QuranRecitation {
  id: string;
  reciterName: string;
  reciterNameEn: string;
  description: string;
  language: string;
  duration: string;
  downloadUrl: string;
  archiveUrl?: string;
  totalSurahs: number;
  quality: "high" | "medium" | "low";
  style: "murattal" | "mujawwad" | "hafs" | "warsh";
  country: string;
  featured?: boolean;
  views: number;
  downloads: number;
  rating: number;
  coverImage?: string;
}

export interface QuranAudioCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const quranRecitations: QuranRecitation[] = [
  {
    id: "mishary-alafasy",
    reciterName: "مشاري بن راشد العفاسي",
    reciterNameEn: "Mishary Rashid Al-Afasy",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ مشاري بن راشد العفاسي بجودة عالية",
    language: "العربية",
    duration: "~72 ساعة",
    downloadUrl:
      "https://archive.org/details/MisharyRashidAlafasyQuranmp3.info",
    archiveUrl: "https://archive.org/details/MisharyRashidAlafasyQuranmp3.info",
    totalSurahs: 114,
    quality: "high",
    style: "mujawwad",
    country: "الكويت",
    featured: true,
    views: 15000000,
    downloads: 2500000,
    rating: 4.9,
    coverImage: "/images/reciters/mishary-alafasy.jpg",
  },
  {
    id: "abdulrahman-sudais",
    reciterName: "عبد الرحمن السديس",
    reciterNameEn: "Abdul Rahman Al-Sudais",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ عبد الرحمن السديس إمام الحرم المكي",
    language: "العربية",
    duration: "~30 ساعة",
    downloadUrl: "https://archive.org/details/sudaisrecitation",
    archiveUrl: "https://archive.org/details/sudaisrecitation",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "السعودية",
    featured: true,
    views: 12000000,
    downloads: 1800000,
    rating: 4.8,
    coverImage: "/images/reciters/sudais.jpg",
  },
  {
    id: "saud-shuraim",
    reciterName: "سعود الشريم",
    reciterNameEn: "Saud Al-Shuraim",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ سعود الشريم إمام الحرم المكي",
    language: "العربية",
    duration: "~30 ساعة",
    downloadUrl: "https://archive.org/details/Saud-Al-Shuraim",
    archiveUrl: "https://archive.org/details/Saud-Al-Shuraim",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "السعودية",
    featured: true,
    views: 10000000,
    downloads: 1500000,
    rating: 4.7,
    coverImage: "/images/reciters/shuraim.jpg",
  },
  {
    id: "maher-muaiqly",
    reciterName: "ماهر المعيقلي",
    reciterNameEn: "Maher Al-Muaiqly",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ ماهر المعيقلي إمام الحرم المكي",
    language: "العربية",
    duration: "~25 ساعة",
    downloadUrl: "https://archive.org/details/QuranCompleteMp3MaherAl-Muaiqly",
    archiveUrl: "https://archive.org/details/QuranCompleteMp3MaherAl-Muaiqly",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "السعودية",
    featured: true,
    views: 8500000,
    downloads: 1200000,
    rating: 4.8,
    coverImage: "/images/reciters/muaiqly.jpg",
  },
  {
    id: "abdul-basit",
    reciterName: "عبد الباسط عبد الصمد",
    reciterNameEn: "Abdul Basit Abdul Samad",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ عبد الباسط عبد الصمد (رواية حفص المرتلة)",
    language: "العربية",
    duration: "~20 ساعة",
    downloadUrl: "https://archive.org/search.php?query=abdul%20basit%20quran",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "مصر",
    featured: false,
    views: 7000000,
    downloads: 1000000,
    rating: 4.9,
    coverImage: "/images/reciters/abdul-basit.jpg",
  },
  {
    id: "khalil-husary",
    reciterName: "محمود خليل الحصري",
    reciterNameEn: "Mahmoud Khalil Al-Husary",
    description:
      "تلاوة القرآن الكريم كاملاً بصوت الشيخ محمود خليل الحصري بالترتيل المعلم",
    language: "العربية",
    duration: "~20 ساعة",
    downloadUrl: "https://archive.org/search.php?query=khalil%20husary%20quran",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "مصر",
    featured: false,
    views: 6500000,
    downloads: 900000,
    rating: 4.8,
    coverImage: "/images/reciters/husary.jpg",
  },
  {
    id: "saad-ghamdi",
    reciterName: "سعد الغامدي",
    reciterNameEn: "Saad Al-Ghamdi",
    description: "تلاوة القرآن الكريم كاملاً بصوت الشيخ سعد الغامدي",
    language: "العربية",
    duration: "~20 ساعة",
    downloadUrl: "https://archive.org/search.php?query=saad%20ghamdi%20quran",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "السعودية",
    featured: false,
    views: 5500000,
    downloads: 800000,
    rating: 4.7,
    coverImage: "/images/reciters/ghamdi.jpg",
  },
  {
    id: "abu-bakr-shatri",
    reciterName: "أبو بكر الشاطري",
    reciterNameEn: "Abu Bakr Al-Shatri",
    description: "تلاوة القرآن الكريم كاملاً بصوت الشيخ أبو بكر الشاطري",
    language: "العربية",
    duration: "~20 ساعة",
    downloadUrl:
      "https://archive.org/search.php?query=abu%20bakr%20shatri%20quran",
    totalSurahs: 114,
    quality: "high",
    style: "murattal",
    country: "السعودية",
    featured: false,
    views: 4500000,
    downloads: 700000,
    rating: 4.6,
    coverImage: "/images/reciters/shatri.jpg",
  },
];

export const quranAudioCategories: QuranAudioCategory[] = [
  {
    id: "featured",
    name: "التلاوات المميزة",
    description: "أشهر القراء وأكثرهم استماعاً",
    icon: "star",
    color: "gold",
  },
  {
    id: "haramain",
    name: "أئمة الحرمين",
    description: "أئمة المسجد الحرام والمسجد النبوي",
    icon: "mosque",
    color: "emerald",
  },
  {
    id: "classic",
    name: "القراء الكلاسيكيون",
    description: "القراء المشهورون من العصر الذهبي",
    icon: "history",
    color: "blue",
  },
  {
    id: "mujawwad",
    name: "التجويد المجود",
    description: "تلاوات بأسلوب التجويد المجود",
    icon: "music_note",
    color: "purple",
  },
  {
    id: "murattal",
    name: "المرتل",
    description: "تلاوات بأسلوب الترتيل الهادئ",
    icon: "self_improvement",
    color: "teal",
  },
];

// Helper functions
export const getRecitationsByCategory = (
  categoryId: string,
): QuranRecitation[] => {
  switch (categoryId) {
    case "featured":
      return quranRecitations.filter((r) => r.featured);
    case "haramain":
      return quranRecitations.filter((r) =>
        ["عبد الرحمن السديس", "سعود الشريم", "ماهر المعيقلي"].includes(
          r.reciterName,
        ),
      );
    case "classic":
      return quranRecitations.filter((r) =>
        ["عبد الباسط عبد الصمد", "محمود خليل الحصري"].includes(r.reciterName),
      );
    case "mujawwad":
      return quranRecitations.filter((r) => r.style === "mujawwad");
    case "murattal":
      return quranRecitations.filter((r) => r.style === "murattal");
    default:
      return quranRecitations;
  }
};

export const getReciterById = (id: string): QuranRecitation | undefined => {
  return quranRecitations.find((r) => r.id === id);
};

export const getFeaturedReciters = (): QuranRecitation[] => {
  return quranRecitations.filter((r) => r.featured).slice(0, 4);
};
