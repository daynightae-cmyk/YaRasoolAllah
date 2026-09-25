export interface MainSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  subsections: SubSection[];
  featured?: boolean;
  badge?: string;
  stats?: {
    count: number;
    label: string;
  };
}

export interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  count?: number;
  featured?: boolean;
  subsections?: SubSection[];
}

export const mainStructure: MainSection[] = [
  {
    id: "quran",
    title: "القرآن الكريم",
    description: "المصحف الشريف مع التفاسير والتلاوات",
    icon: "menu_book",
    color: "emerald",
    route: "/quran",
    featured: true,
    stats: {
      count: 114,
      label: "سورة",
    },
    subsections: [
      {
        id: "mushaf",
        title: "المصحف الكامل (روايات متعددة)",
        description: "النص الكامل للقرآن الكريم بروايات مختلفة",
        icon: "import_contacts",
        route: "/quran",
        count: 6236,
      },
      {
        id: "tafsir",
        title: "التفسير",
        description: "تفاسير القرآن من أمهات الكتب",
        icon: "psychology",
        count: 3,
        subsections: [
          {
            id: "ibn-kathir",
            title: "ابن كثير",
            description: "تفسير ابن كثير",
            icon: "book",
          },
          {
            id: "tabari",
            title: "الطبري",
            description: "جامع البيان للطبري",
            icon: "book",
          },
          {
            id: "saadi",
            title: "السعدي",
            description: "تيسير الكريم الرحمن",
            icon: "book",
          },
        ],
      },
      {
        id: "asbab-nuzul",
        title: "أسباب النزول",
        description: "أسباب نزول الآيات والسور",
        icon: "info",
        count: 470,
      },
      {
        id: "recitations",
        title: "التلاوات (صوت/فيديو)",
        description: "تلاوات بأصوات أشهر القراء",
        icon: "headphones",
        route: "/quran-audio",
        count: 8,
        featured: true,
      },
      {
        id: "search",
        title: "البحث في الآيات",
        description: "بحث متقدم في نص القرآن",
        icon: "search",
        route: "/quran",
      },
      {
        id: "ijaz",
        title: "الإعجاز العلمي",
        description: "الإعجاز العلمي في القرآن الكريم",
        icon: "science",
        count: 125,
      },
    ],
  },
  {
    id: "hadith",
    title: "الحديث الشريف",
    description: "الصحاح الستة وشروحها",
    icon: "format_quote",
    color: "blue",
    route: "/hadith",
    stats: {
      count: 6,
      label: "صحاح",
    },
    subsections: [
      {
        id: "sahah-sitta",
        title: "الصحاح الستة",
        description: "البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه",
        icon: "library_books",
        count: 6,
      },
      {
        id: "topics",
        title: "تصنيف حسب المواضيع",
        description: "العبادات، الأخلاق، الأسرة، المعاملات",
        icon: "category",
        count: 12,
      },
      {
        id: "sharh",
        title: "شروح الحديث",
        description: "شروح الأحاديث من كبار العلماء",
        icon: "description",
        count: 15,
      },
      {
        id: "ruwat",
        title: "رواة الحديث",
        description: "تراجم الرواة وعلم الرجال",
        icon: "people",
        count: 5000,
      },
    ],
  },
  {
    id: "seerah",
    title: "السيرة النبوية",
    description: "حياة النبي ﷺ كاملة مفصلة",
    icon: "person",
    color: "purple",
    route: "/seerah",
    featured: true,
    stats: {
      count: 8,
      label: "فصل",
    },
    subsections: [
      {
        id: "lineage",
        title: "نسب النبي ﷺ",
        description: "نسب النبي الشريف وأصوله",
        icon: "family_tree",
        route: "/seerah",
      },
      {
        id: "birth",
        title: "المولد والنشأة",
        description: "ولادة النبي ونشأته يتيماً",
        icon: "child_care",
        route: "/seerah",
        featured: true,
      },
      {
        id: "mission",
        title: "البعثة والدعوة",
        description: "نزول الوحي وبداية الدعوة",
        icon: "campaign",
        route: "/seerah",
      },
      {
        id: "battles",
        title: "الغزوات",
        description: "غزوات ومعارك النبي ﷺ",
        icon: "shield",
        route: "/seerah",
        count: 27,
      },
      {
        id: "characteristics",
        title: "صفات النبي ﷺ",
        description: "صفاته الخَلقية والخُلقية",
        icon: "star",
        route: "/seerah",
      },
      {
        id: "sayings-actions",
        title: "أقواله وأفعاله",
        description: "مواقف وأحاديث من حياته",
        icon: "record_voice_over",
        route: "/seerah",
      },
      {
        id: "death",
        title: "وفاته ﷺ",
        description: "مرضه الأخير ووفاته الشريفة",
        icon: "sentiment_very_satisfied",
        route: "/seerah",
      },
    ],
  },
  {
    id: "fiqh",
    title: "الفقه وأحكام الإسلام",
    description: "الأحكام الشرعية والفقه المقارن",
    icon: "gavel",
    color: "teal",
    route: "/fiqh",
    stats: {
      count: 8,
      label: "باب رئيسي",
    },
    subsections: [
      {
        id: "tahara",
        title: "الطهارة",
        description: "أحكام الوضوء والغسل والتيمم",
        icon: "clean_hands",
        count: 45,
      },
      {
        id: "salah",
        title: "الصلاة",
        description: "أحكام الصلاة وآدابها",
        icon: "self_improvement",
        route: "/prayer-guide",
        count: 120,
        featured: true,
      },
      {
        id: "sawm",
        title: "الصيام",
        description: "أحكام الصيام والاعتكاف",
        icon: "schedule",
        count: 35,
      },
      {
        id: "zakat",
        title: "الزكاة",
        description: "أحكام الزكاة والصدقات",
        icon: "volunteer_activism",
        count: 28,
      },
      {
        id: "hajj",
        title: "الحج",
        description: "مناسك الحج والعمرة",
        icon: "mosque",
        count: 55,
      },
      {
        id: "muamalat",
        title: "المعاملات",
        description: "البيع والشراء والتجارة",
        icon: "handshake",
        count: 80,
      },
      {
        id: "family",
        title: "الأسرة والزواج",
        description: "أحكام النكاح والطلاق والنفقة",
        icon: "family_restroom",
        count: 65,
      },
      {
        id: "comparative",
        title: "الفقه المقارن",
        description: "مقارنة بين المذاهب الفقهية",
        icon: "compare",
        count: 4,
      },
    ],
  },
  {
    id: "women",
    title: "المرأة في الإسلام",
    description: "أحكام وقضايا المرأة المسلمة",
    icon: "woman",
    color: "pink",
    route: "/women-in-islam",
    stats: {
      count: 5,
      label: "قسم",
    },
    subsections: [
      {
        id: "seerah-role",
        title: "دورها في السيرة",
        description: "دور المرأة في عهد النبي ﷺ",
        icon: "history_edu",
        count: 25,
      },
      {
        id: "ahkam",
        title: "أحكام المرأة",
        description: "أحكام الحيض والنفاس والحجاب",
        icon: "rule",
        count: 40,
      },
      {
        id: "fiqh-women",
        title: "فقه النساء",
        description: "الأحكام الخاصة بالمرأة",
        icon: "balance",
        count: 60,
      },
      {
        id: "sahabiyat",
        title: "الصحابيات",
        description: "قصص الصحابيات رضي الله عنهن",
        icon: "groups",
        count: 50,
        featured: true,
      },
      {
        id: "advice",
        title: "نصائح إيمانية خاصة",
        description: "إرشادات روحية للمرأة المسلمة",
        icon: "favorite",
        count: 30,
      },
    ],
  },
  {
    id: "children",
    title: "الطفل المبين",
    description: "المحتوى التعليمي للأطفال المسلمين",
    icon: "child_care",
    color: "orange",
    route: "/children-tv",
    featured: true,
    badge: "جديد",
    stats: {
      count: 6,
      label: "قسم",
    },
    subsections: [
      {
        id: "prophet-stories",
        title: "قصص الأنبياء للأطفال",
        description: "قصص الأنبياء بأسلوب مناسب للأطفال",
        icon: "auto_stories",
        route: "/children-tv",
        count: 25,
        featured: true,
      },
      {
        id: "cards",
        title: "بطاقات دعوية",
        description: "بطاقات تعليمية ملونة",
        icon: "style",
        count: 100,
      },
      {
        id: "prayer-learning",
        title: "تعليم الصلاة والوضوء",
        description: "تعلم العبادات بطريقة تفاعلية",
        icon: "school",
        route: "/children-tv",
        count: 15,
      },
      {
        id: "azkar-kids",
        title: "أذكار الأطفال",
        description: "الأذكار اليومية للأطفال",
        icon: "favorite",
        route: "/children-tv",
        count: 20,
      },
      {
        id: "kids-fatawa",
        title: "فتاوى مخصصة للأطفال",
        description: "أسئلة وأجوبة مناسبة للأطفال",
        icon: "help",
        count: 50,
      },
    ],
  },
  {
    id: "library",
    title: "الكتب والمراجع",
    description: "مكتبة شاملة من الكتب الإسلامية",
    icon: "local_library",
    color: "indigo",
    route: "/digital-library",
    featured: true,
    stats: {
      count: 500,
      label: "كتاب",
    },
    subsections: [
      {
        id: "aqidah-books",
        title: "كتب العقيدة",
        description: "كتب التوحيد والعقيدة",
        icon: "psychology",
        count: 85,
      },
      {
        id: "seerah-books",
        title: "كتب السيرة",
        description: "كتب السيرة النبوية والتاريخ",
        icon: "history",
        count: 120,
      },
      {
        id: "fiqh-books",
        title: "كتب الفقه",
        description: "كتب الفقه والأحكام",
        icon: "book",
        count: 200,
      },
      {
        id: "history-books",
        title: "كتب التاريخ الإسلامي",
        description: "تاريخ الإسلام والمسلمين",
        icon: "schedule",
        count: 95,
      },
      {
        id: "translations",
        title: "ترجمات",
        description: "كتب مترجمة للغات مختلفة",
        icon: "translate",
        count: 3,
        subsections: [
          {
            id: "english",
            title: "English",
            description: "Islamic books in English",
            icon: "language",
          },
          {
            id: "french",
            title: "Français",
            description: "Livres islamiques en français",
            icon: "language",
          },
          {
            id: "urdu",
            title: "اردو",
            description: "اردو اسلامی کتابیں",
            icon: "language",
          },
        ],
      },
    ],
  },
  {
    id: "ai-assistant",
    title: "الذكاء الاصطناعي الإسلامي",
    description: "المُبين بوت - مساعد ذكي للأسئلة الإسلامية",
    icon: "smart_toy",
    color: "cyan",
    route: "/",
    featured: true,
    badge: "مجاني",
    stats: {
      count: 5,
      label: "مساعد",
    },
    subsections: [
      {
        id: "quran-assistant",
        title: "مساعد القرآن",
        description: "أسئلة حول القرآن والتفسير",
        icon: "menu_book",
        route: "/",
        featured: true,
      },
      {
        id: "fatawa-assistant",
        title: "مساعد الفتاوى",
        description: "فتاوى وأحكام شرعية",
        icon: "gavel",
        route: "/",
      },
      {
        id: "seerah-assistant",
        title: "مساعد السيرة",
        description: "أسئلة حول السيرة النبوية",
        icon: "person",
        route: "/",
      },
      {
        id: "kids-assistant",
        title: "مساعد للأطفال",
        description: "إجابات مبسطة للأطفال",
        icon: "child_care",
        route: "/",
      },
      {
        id: "women-assistant",
        title: "مساعد المرأة المسلمة",
        description: "إجابات خاصة بقضايا المرأة",
        icon: "woman",
        route: "/",
      },
    ],
  },
  {
    id: "prayer-times",
    title: "أوقات الصلاة والتقويم الهجري",
    description: "مواقيت الصلاة والتقويم الإسلامي",
    icon: "schedule",
    color: "amber",
    route: "/prayer-times",
    stats: {
      count: 4,
      label: "خدمة",
    },
    subsections: [
      {
        id: "prayer-times-location",
        title: "مواقيت الصلاة حسب الموقع",
        description: "أوقات الصلاة لموقعك الحالي",
        icon: "location_on",
        featured: true,
      },
      {
        id: "date-converter",
        title: "تحويل التاريخ",
        description: "تحويل بين التاريخ الهجري والميلادي",
        icon: "date_range",
      },
      {
        id: "islamic-occasions",
        title: "المناسبات الإسلامية",
        description: "التذكير بالمناسبات الدينية",
        icon: "event",
        count: 25,
      },
      {
        id: "adhan",
        title: "الأذان والتذكير",
        description: "تنبيهات أوقات الصلاة",
        icon: "notifications",
        featured: true,
      },
    ],
  },
];

export const getUserSection = () => ({
  id: "user-area",
  title: "منطقة المستخدم",
  description: "إعداداتك الشخصية ومحتواك المحفوظ",
  icon: "account_circle",
  color: "gray",
  route: "/profile",
  subsections: [
    {
      id: "my-library",
      title: "مكتبتي (كتب محفوظة)",
      description: "الكتب والمواد المحفوظة",
      icon: "bookmark",
    },
    {
      id: "my-questions",
      title: "أسئلتي السابقة",
      description: "تاريخ أسئلتك للمساعد الذكي",
      icon: "quiz",
    },
    {
      id: "notifications",
      title: "إشعارات جديدة",
      description: "التنبيهات والإشعارات",
      icon: "notifications",
    },
    {
      id: "settings",
      title: "تخصيص واجهتي",
      description: "إعدادات الواجهة والتخصيص",
      icon: "settings",
    },
  ],
});

// Helper functions
export const getFeaturedSections = (): MainSection[] => {
  return mainStructure.filter((section) => section.featured);
};

export const getSectionById = (id: string): MainSection | undefined => {
  return mainStructure.find((section) => section.id === id);
};

export const getFeaturedSubsections = (): {
  section: MainSection;
  subsection: SubSection;
}[] => {
  const featured: { section: MainSection; subsection: SubSection }[] = [];

  mainStructure.forEach((section) => {
    section.subsections.forEach((subsection) => {
      if (subsection.featured) {
        featured.push({ section, subsection });
      }
    });
  });

  return featured;
};

export const getTotalCounts = () => {
  const counts = {
    sections: mainStructure.length,
    subsections: mainStructure.reduce(
      (total, section) => total + section.subsections.length,
      0,
    ),
    featuredSections: getFeaturedSections().length,
    featuredSubsections: getFeaturedSubsections().length,
  };

  return counts;
};
