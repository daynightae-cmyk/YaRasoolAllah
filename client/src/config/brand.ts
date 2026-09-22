/**
 * Central Brand Authority for YA RASOOL ALLAH ﷺ
 * Canonical Product Identity & Institutional Configuration
 */

export interface WingDefinition {
  id: string;
  number: number;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  path: string;
  icon: string;
  badge?: string;
  color: string;
}

export type LearningDepth = "discover" | "learn" | "study" | "research";

export interface LearningDepthConfig {
  id: LearningDepth;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const BRAND = {
  name: {
    ar: "يا رسول الله ﷺ",
    en: "Ya Rasool Allah",
    fr: "Ya Rasool Allah",
    ur: "یا رسول اللہ ﷺ",
  },
  tagline: {
    ar: "صرح رقمي عالمي للسيرة النبوية العطرة، القرآن العظيم، والسنة المطهرة",
    en: "A global digital institution for the authentic Seerah, Holy Quran, and verified Sunnah",
    fr: "Une institution numérique pour la Sîrah authentique, le Noble Coran et la Sunna vérifiée",
    ur: "سیرت نبوی ﷺ، قرآن مجید اور سنت مطہرہ کا مستند عالمی ادارہ",
  },
  mission: {
    ar: "صرح رقمي عالمي مستقل يسعى لتقديم السيرة النبوية المطهرة ورسالة الإسلام السمحة إلى الإنسانية جمعاء، بأعلى معايير التوثيق العلمي والجمال البصري.",
    en: "An independent global digital institution presenting the authentic prophetic biography and the message of Islam to all humanity with scholarly rigor and aesthetic excellence.",
  },
  copyrightNotice: "جميع الحقوق محفوظة لوجه الله تعالى — وقف رقمي خيري غير ربحي.",
  scholarlyDisclaimer: {
    ar: "تنويه علمي: هذه المنصة مخصصة للبحث والاستكشاف المعرفي وليست جهة لإصدار الفتاوى الفقهية الخاصة بالنوازل المعاصرة.",
    en: "Scholarly note: This platform is dedicated to knowledge discovery and research, and does not issue legal verdicts (fatwas) for contemporary personal circumstances.",
  },
  domain: "yarasoolallah.it.com",
  canonicalUrl: "https://yarasoolallah.it.com",
  contactEmail: "contact@yarasoolallah.it.com",
  currentYear: 2026,
  nonPersonificationNotice: {
    ar: "تنويه شرعي: التزاماً بالإجماع الإسلامي، لا يحتوي هذا الصرح على أي تجسيد أو تصوير أو تمثيل بصري أو صوتي لشخص النبي محمد ﷺ، ويقتصر العرض على الخط العربي، الخرائط التاريخية، التوثيق الأثري، والسرد الموثق بالمصادر.",
    en: "Religious Notice: In adherence to Islamic consensus, this platform does not personify, depict, or visually/auditorily represent the Prophet Muhammad ﷺ. All content is presented via sacred calligraphy, historical cartography, archaeological documentation, and verified citations.",
  },
} as const;

export const LEARNING_DEPTHS: LearningDepthConfig[] = [
  {
    id: "discover",
    nameAr: "استكشاف",
    nameEn: "Discover",
    descriptionAr: "مدخل ميسر للمبتدئين وموجز للحقائق والمحطات الكبرى بدون مصطلحات معقدة",
    descriptionEn: "Gentle introduction for newcomers with visual milestones and core facts",
  },
  {
    id: "learn",
    nameAr: "تعلّم",
    nameEn: "Learn",
    descriptionAr: "دراسة منهجية مستمرة مع الشواهد وسياقات الأحداث والدروس المستفادة",
    descriptionEn: "Structured learning paths with contextual events and life lessons",
  },
  {
    id: "study",
    nameAr: "دراسة",
    nameEn: "Study",
    descriptionAr: "قراءة متعمقة مع نصوص المصادر والروايات المقارنة والتحليل التاريخي",
    descriptionEn: "In-depth study with source texts, comparative narrations, and historical context",
  },
  {
    id: "research",
    nameAr: "بحث",
    nameEn: "Research",
    descriptionAr: "أدوات متقدمة للباحثين مع أرقام الأبواب والمصنفات وحالة الأسانيد ووثائق التحقيق",
    descriptionEn: "Academic tools with compiler indices, provenance, editions, and citation exports",
  },
];

export const INSTITUTION_WINGS: WingDefinition[] = [
  {
    id: "gate-of-light",
    number: 1,
    nameAr: "بوابة النور",
    nameEn: "Gate of Light",
    taglineAr: "المدخل المؤسسي الجامع للمعرفة والسيرة",
    taglineEn: "The institutional grand portal of knowledge",
    path: "/",
    icon: "sparkles",
    color: "emerald",
  },
  {
    id: "prophetic-seerah",
    number: 2,
    nameAr: "درب السيرة",
    nameEn: "The Seerah Journey",
    taglineAr: "المسار الزمني والجغرافي الموثق لحياة خير الأنام ﷺ",
    taglineEn: "Chronological and geographic journey of the Prophet ﷺ",
    path: "/seerah",
    icon: "compass",
    badge: "رحلة تفاعلية",
    color: "amber",
  },
  {
    id: "quran-colonnade",
    number: 3,
    nameAr: "رِواق القرآن",
    nameEn: "Quran Colonnade",
    taglineAr: "تلاوة وتفسير وبحث وترجمات متصلة بالسياق النبوي",
    taglineEn: "Recitation, tafsir, and search connected to prophetic context",
    path: "/quran",
    icon: "book-open",
    color: "teal",
  },
  {
    id: "dar-al-hadith",
    number: 4,
    nameAr: "دار الحديث",
    nameEn: "Dar Al-Hadith",
    taglineAr: "أصول السنة النبوية، الكتب الستة، والتحقيق الإسنادي",
    taglineEn: "Authentic Sunnah collections, the Six Books, and verified narrations",
    path: "/sunnah",
    icon: "feather",
    badge: "توثيق معتمد",
    color: "cyan",
  },
  {
    id: "library-shelves",
    number: 5,
    nameAr: "مكتبة الرفوف",
    nameEn: "Library on Shelves",
    taglineAr: "أرفف تفاعلية للكتب والمصادر التراثية والمعاصرة",
    taglineEn: "Interactive physical shelves of classical and modern Islamic texts",
    path: "/library",
    icon: "library",
    color: "violet",
  },
  {
    id: "family-and-kids",
    number: 6,
    nameAr: "ركن الأسرة والطفل",
    nameEn: "Family & Child Oasis",
    taglineAr: "مساحة آمنة تربوية بلا تجسيد تحبب الأجيال في رسول الله ﷺ",
    taglineEn: "A secure, ad-free world nurturing the love of the Prophet ﷺ",
    path: "/kids",
    icon: "baby",
    color: "rose",
  },
  {
    id: "daily-sanctuary",
    number: 7,
    nameAr: "محراب اليوم",
    nameEn: "Daily Sanctuary",
    taglineAr: "المواقيت الدقيقة، الأذكار الصحيحة، القبلة، والتأمل اليومي",
    taglineEn: "Verified prayer times, authentic adhkar, qibla, and daily reflection",
    path: "/daily",
    icon: "sun",
    color: "emerald",
  },
  {
    id: "source-registry",
    number: 8,
    nameAr: "خزانة المصادر",
    nameEn: "Source & Provenance Registry",
    taglineAr: "سجل التوثيق، الطبعات المعتمدة، وضمانات النزاهة العلمية",
    taglineEn: "Authenticity records, editions, and editorial review standards",
    path: "/sources",
    icon: "shield-check",
    badge: "شفافية مطلقة",
    color: "slate",
  },
];
