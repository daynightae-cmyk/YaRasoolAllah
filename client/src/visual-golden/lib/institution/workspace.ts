export type InstitutionWingId =
  | "home"
  | "library"
  | "seerah"
  | "hadith"
  | "quran"
  | "atlas"
  | "kids"
  | "daily"
  | "audio"
  | "media"
  | "basirah"
  | "sources"
  | "practice"
  | "reference";

export interface InstitutionWingDefinition {
  id: InstitutionWingId;
  path: string;
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
  roomAr: string;
  roomEn: string;
  state: "operational" | "review" | "catalog";
  stateLabelAr: string;
  stateLabelEn: string;
}

export const INSTITUTION_WINGS: Record<InstitutionWingId, InstitutionWingDefinition> = {
  home: {
    id: "home",
    path: "/",
    labelAr: "بوابة النور",
    labelEn: "Gateway of Light",
    shortLabelAr: "الردهة",
    roomAr: "الردهة الرئيسية",
    roomEn: "Main Hall",
    state: "operational",
    stateLabelAr: "المؤسسة متاحة",
    stateLabelEn: "Institution available",
  },
  library: {
    id: "library",
    path: "/library",
    labelAr: "المكتبة",
    labelEn: "Library",
    shortLabelAr: "المكتبة",
    roomAr: "رفوف الكتب",
    roomEn: "Book Shelves",
    state: "operational",
    stateLabelAr: "كتالوج ومحتوى متاح حسب الحقوق",
    stateLabelEn: "Catalog and rights-cleared content available",
  },
  seerah: {
    id: "seerah",
    path: "/seerah",
    labelAr: "السيرة النبوية",
    labelEn: "Prophetic Biography",
    shortLabelAr: "السيرة",
    roomAr: "الخط الزمني",
    roomEn: "Timeline",
    state: "review",
    stateLabelAr: "أحداث مرتبطة بمصادر ومراجعة تحريرية",
    stateLabelEn: "Source-linked events under editorial review",
  },
  hadith: {
    id: "hadith",
    path: "/hadith",
    labelAr: "دار الحديث",
    labelEn: "Hadith Hall",
    shortLabelAr: "الحديث",
    roomAr: "رفوف المجموعات",
    roomEn: "Collection Shelves",
    state: "review",
    stateLabelAr: "سجلات محلية قيد المراجعة وليست مدونة كاملة",
    stateLabelEn: "Local records under review, not a complete corpus",
  },
  quran: {
    id: "quran",
    path: "/quran",
    labelAr: "القرآن الكريم",
    labelEn: "Al-Qur'an",
    shortLabelAr: "القرآن",
    roomAr: "المصحف الرقمي",
    roomEn: "Digital Mushaf",
    state: "operational",
    stateLabelAr: "النص العربي المحلي متاح",
    stateLabelEn: "Local Arabic text available",
  },
  atlas: {
    id: "atlas",
    path: "/atlas",
    labelAr: "الأطلس التاريخي",
    labelEn: "Historical Atlas",
    shortLabelAr: "الأطلس",
    roomAr: "الخريطة التعليمية",
    roomEn: "Educational Map",
    state: "catalog",
    stateLabelAr: "مواضع ومسارات تعليمية موثقة بحدود معلنة",
    stateLabelEn: "Documented educational places and routes with stated limits",
  },
  kids: {
    id: "kids",
    path: "/kids",
    labelAr: "الأطفال والعائلة",
    labelEn: "Children and Family",
    shortLabelAr: "الأطفال",
    roomAr: "واحة الأسرة",
    roomEn: "Family Oasis",
    state: "review",
    stateLabelAr: "لا توجد وسائط معتمدة للعرض العام",
    stateLabelEn: "No media approved for public display",
  },
  daily: {
    id: "daily",
    path: "/daily",
    labelAr: "اليوم النبوي والعبادات",
    labelEn: "Daily Guidance and Worship",
    shortLabelAr: "المرصد",
    roomAr: "مرصد الصلاة",
    roomEn: "Prayer Observatory",
    state: "operational",
    stateLabelAr: "المواقيت مرتبطة بموقع محدد ومصدر وقت",
    stateLabelEn: "Prayer times tied to a location and time source",
  },
  audio: {
    id: "audio",
    path: "/audio",
    labelAr: "الصوت والتلاوات",
    labelEn: "Audio and Recitations",
    shortLabelAr: "الصوت",
    roomAr: "غرفة التلاوة",
    roomEn: "Recitation Room",
    state: "review",
    stateLabelAr: "يتاح التشغيل حيث يسمح المزود بإسناد rights",
    stateLabelEn: "Playback appears only where provider rights allow",
  },
  media: {
    id: "media",
    path: "/noor",
    labelAr: "مسرح النور",
    labelEn: "Noor Media Theatre",
    shortLabelAr: "المسرح",
    roomAr: "قاعة المعرفة المرئية",
    roomEn: "Visual Knowledge Hall",
    state: "review",
    stateLabelAr: "التشغيل بعد اكتمال بوابات الحقوق والمراجعة",
    stateLabelEn: "Playback follows rights and editorial clearance",
  },
  basirah: {
    id: "basirah",
    path: "/basirah",
    labelAr: "بصيرة البحث",
    labelEn: "Basirah Research",
    shortLabelAr: "بصيرة",
    roomAr: "مكتب البحث",
    roomEn: "Research Desk",
    state: "operational",
    stateLabelAr: "النتائج مربوطة بمعرفات ومصادر موثقة",
    stateLabelEn: "Results linked to documented identifiers and sources",
  },
  sources: {
    id: "sources",
    path: "/sources",
    labelAr: "خزانة المصادر",
    labelEn: "Sources Vault",
    shortLabelAr: "المصادر",
    roomAr: "سجل المصادر",
    roomEn: "Source Registry",
    state: "operational",
    stateLabelAr: "الحقوق ودرجة الثقة معلنة لكل سجل",
    stateLabelEn: "Rights and confidence declared per record",
  },
  practice: {
    id: "practice",
    path: "/daily",
    labelAr: "العبادات العملية",
    labelEn: "Practice",
    shortLabelAr: "العبادات",
    roomAr: "أدوات العبادة",
    roomEn: "Practice Tools",
    state: "operational",
    stateLabelAr: "أدوات عملية بمواصفات وقدرات معلنة",
    stateLabelEn: "Practical tools with declared capabilities",
  },
  reference: {
    id: "reference",
    path: "/sources",
    labelAr: "المراجع المؤسسية",
    labelEn: "Institutional Reference",
    shortLabelAr: "المراجع",
    roomAr: "المواد المرجعية",
    roomEn: "Reference Materials",
    state: "catalog",
    stateLabelAr: "محتوى مرجعي حسب حالة المراجعة",
    stateLabelEn: "Reference content according to review state",
  },
};

export const INSTITUTION_NAVIGATION_WINGS: readonly InstitutionWingId[] = [
  "home",
  "library",
  "seerah",
  "hadith",
  "quran",
  "atlas",
  "kids",
  "daily",
  "audio",
  "media",
  "basirah",
  "sources",
];

/**
 * Practice and Reference are real workspace rooms, but they share the Daily
 * and Sources navigation gates. Keeping this relationship explicit prevents
 * alias routes (for example /prayer-guide or /islamic-knowledge) from losing
 * the active navigation item.
 */
export const INSTITUTION_PRIMARY_NAVIGATION_WING: Partial<
  Record<InstitutionWingId, InstitutionWingId>
> = {
  practice: "daily",
  reference: "sources",
};

export function normalizeInstitutionPath(path: string): string {
  const withoutHash = path.split("#", 1)[0] ?? "/";
  const pathname = withoutHash.split("?", 1)[0] ?? "/";
  return pathname.startsWith("/") ? pathname : "/";
}

interface RouteWorkspaceDefinition {
  wing: InstitutionWingId;
  titleAr: string;
  titleEn: string;
  roomAr?: string;
  roomEn?: string;
  documentAr?: string;
  documentEn?: string;
}

const ROUTE_WORKSPACES: Record<string, RouteWorkspaceDefinition> = {
  "/": { wing: "home", titleAr: "بوابة النور", titleEn: "Gateway of Light", roomAr: "الردهة الرئيسية", roomEn: "Main Hall" },
  "/library": { wing: "library", titleAr: "المكتبة", titleEn: "Library", roomAr: "رفوف الكتب", roomEn: "Book Shelves" },
  "/digital-library": { wing: "library", titleAr: "المكتبة الرقمية", titleEn: "Digital Library", roomAr: "رفوف الكتب", roomEn: "Book Shelves" },
  "/books": { wing: "library", titleAr: "الكتب", titleEn: "Books", roomAr: "رفوف الكتب", roomEn: "Book Shelves" },
  "/library/work/:workId": { wing: "library", titleAr: "المكتبة", titleEn: "Library", roomAr: "غرفة القراءة", roomEn: "Reading Room", documentAr: "الكتاب المحدد", documentEn: "Selected work" },
  "/who-is-muhammad": { wing: "seerah", titleAr: "من هو محمد ﷺ", titleEn: "Who is Muhammad ﷺ", roomAr: "غرفة الشمائل", roomEn: "Character Room" },
  "/who-is-muhammad/:chapter": { wing: "seerah", titleAr: "من هو محمد ﷺ", titleEn: "Who is Muhammad ﷺ", roomAr: "غرفة الشمائل", roomEn: "Character Room", documentAr: "الفصل المحدد", documentEn: "Selected chapter" },
  "/character": { wing: "seerah", titleAr: "الشمائل", titleEn: "Character", roomAr: "غرفة الشمائل", roomEn: "Character Room" },
  "/seerah": { wing: "seerah", titleAr: "السيرة النبوية", titleEn: "Prophetic Biography", roomAr: "الخط الزمني", roomEn: "Timeline" },
  "/atlas": { wing: "atlas", titleAr: "الأطلس التاريخي", titleEn: "Historical Atlas", roomAr: "الخريطة التعليمية", roomEn: "Educational Map" },
  "/sunnah": { wing: "hadith", titleAr: "السنة النبوية", titleEn: "Prophetic Sunnah", roomAr: "رفوف المجموعات", roomEn: "Collection Shelves" },
  "/hadith": { wing: "hadith", titleAr: "دار الحديث", titleEn: "Hadith Hall", roomAr: "رفوف المجموعات", roomEn: "Collection Shelves" },
  "/quran": { wing: "quran", titleAr: "القرآن الكريم", titleEn: "Al-Qur'an", roomAr: "المصحف الرقمي", roomEn: "Digital Mushaf" },
  "/tafsir": { wing: "quran", titleAr: "القرآن والتفسير", titleEn: "Qur'an and Tafsir", roomAr: "غرفة التفسير", roomEn: "Tafsir Room" },
  "/daily": { wing: "daily", titleAr: "اليوم النبوي والعبادات", titleEn: "Daily Guidance and Worship", roomAr: "مرصد الصلاة", roomEn: "Prayer Observatory" },
  "/prophetic-day": { wing: "daily", titleAr: "الهدي النبوي", titleEn: "Prophetic Guidance", roomAr: "غرفة اليوم", roomEn: "Daily Room" },
  "/24-hours": { wing: "daily", titleAr: "الهدي النبوي", titleEn: "Prophetic Guidance", roomAr: "غرفة اليوم", roomEn: "Daily Room" },
  "/daily-verse": { wing: "daily", titleAr: "آية اليوم", titleEn: "Verse of the Day", roomAr: "غرفة اليوم", roomEn: "Daily Room" },
  "/prayer-guide": { wing: "practice", titleAr: "دليل الصلاة", titleEn: "Prayer Guide", roomAr: "أدوات العبادة", roomEn: "Practice Tools" },
  "/islamic-knowledge": { wing: "reference", titleAr: "المعرفة الإسلامية", titleEn: "Islamic Knowledge", roomAr: "المواد المرجعية", roomEn: "Reference Materials" },
  "/five-pillars": { wing: "reference", titleAr: "أركان الإسلام", titleEn: "Five Pillars", roomAr: "المواد المرجعية", roomEn: "Reference Materials" },
  "/women-in-islam": { wing: "reference", titleAr: "المرأة في الإسلام", titleEn: "Women in Islam", roomAr: "المواد المرجعية", roomEn: "Reference Materials" },
  "/kids": { wing: "kids", titleAr: "الأطفال والعائلة", titleEn: "Children and Family", roomAr: "واحة الأسرة", roomEn: "Family Oasis" },
  "/children-tv": { wing: "kids", titleAr: "الأطفال والعائلة", titleEn: "Children and Family", roomAr: "واحة الأسرة", roomEn: "Family Oasis" },
  "/media-review": { wing: "kids", titleAr: "مراجعة الوسائط", titleEn: "Media Review", roomAr: "غرفة المراجعة التحريرية", roomEn: "Editorial Review Room" },
  "/noor": { wing: "media", titleAr: "مسرح النور", titleEn: "Noor Media Theatre", roomAr: "قاعة المعرفة المرئية", roomEn: "Visual Knowledge Hall" },
  "/quran-audio": { wing: "audio", titleAr: "التلاوات الصوتية", titleEn: "Qur'an Recitations", roomAr: "غرفة التلاوة", roomEn: "Recitation Room" },
  "/audio": { wing: "audio", titleAr: "الصوت والتلاوات", titleEn: "Audio and Recitations", roomAr: "غرفة التلاوة", roomEn: "Recitation Room" },
  "/basirah": { wing: "basirah", titleAr: "بصيرة البحث", titleEn: "Basirah Research", roomAr: "مكتب البحث", roomEn: "Research Desk" },
  "/sources": { wing: "sources", titleAr: "خزانة المصادر", titleEn: "Sources Vault", roomAr: "سجل المصادر", roomEn: "Source Registry" },
  "/calendar": { wing: "practice", titleAr: "التقويم الإسلامي", titleEn: "Islamic Calendar", roomAr: "أدوات العبادة", roomEn: "Practice Tools" },
  "/digital-tasbih": { wing: "practice", titleAr: "التسبيح الرقمي", titleEn: "Digital Tasbih", roomAr: "أدوات العبادة", roomEn: "Practice Tools" },
  "/qibla-compass": { wing: "practice", titleAr: "بوصلة القبلة", titleEn: "Qibla Compass", roomAr: "أدوات العبادة", roomEn: "Practice Tools" },
};

export interface WorkspaceContext {
  wing: InstitutionWingDefinition;
  titleAr: string;
  titleEn: string;
  roomAr: string;
  roomEn: string;
  documentAr?: string;
  documentEn?: string;
  /** The original local path, including a deep-link query when present. */
  path: string;
  /** The normalized route path used for workspace and alias matching. */
  routePath: string;
}

function matchRoute(pathname: string): RouteWorkspaceDefinition | undefined {
  const exact = ROUTE_WORKSPACES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/library/work/")) return ROUTE_WORKSPACES["/library/work/:workId"];
  if (pathname.startsWith("/who-is-muhammad/")) return ROUTE_WORKSPACES["/who-is-muhammad/:chapter"];
  return undefined;
}

export function workspaceContext(pathname: string): WorkspaceContext {
  const routePath = normalizeInstitutionPath(pathname);
  const route = matchRoute(routePath);
  const wing = INSTITUTION_WINGS[route?.wing ?? "home"];
  return {
    wing,
    titleAr: route?.titleAr ?? wing.labelAr,
    titleEn: route?.titleEn ?? wing.labelEn,
    roomAr: route?.roomAr ?? wing.roomAr,
    roomEn: route?.roomEn ?? wing.roomEn,
    documentAr: route?.documentAr,
    documentEn: route?.documentEn,
    path: pathname,
    routePath,
  };
}

export function wingIdFromPath(pathname: string): InstitutionWingId {
  return workspaceContext(pathname).wing.id;
}

/** Returns the navigation gate that owns a route, including workspace aliases. */
export function navigationWingForPath(pathname: string): InstitutionWingId {
  const wing = wingIdFromPath(pathname);
  return INSTITUTION_PRIMARY_NAVIGATION_WING[wing] ?? wing;
}

export function isNavigationWingActive(pathname: string, wingId: InstitutionWingId): boolean {
  return navigationWingForPath(pathname) === wingId;
}
