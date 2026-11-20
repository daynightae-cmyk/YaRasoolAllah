import type { SeerahSource } from "./types";

/**
 * Work-level bibliography. Citations point at a source id plus a chapter-level
 * locus; page numbers and edition claims are intentionally absent until a
 * human collates a specific printed edition.
 */
export const SEERAH_SOURCES: SeerahSource[] = [
  {
    id: "quran",
    titleAr: "القرآن الكريم",
    authorAr: "تنزيل — نسخة عثماني مصغّر 1.1",
    authorDeathHijri: null,
    genre: "quran",
    authorityNoteAr:
      "النص المعروض من النسخة المحلية المولدة من تنزيل، ومُتحقق منه في الاختبارات آيةً آية.",
    reviewStatus: "pending_review",
  },
  {
    id: "bukhari",
    titleAr: "صحيح البخاري",
    authorAr: "محمد بن إسماعيل البخاري",
    authorDeathHijri: 256,
    genre: "hadith",
    authorityNoteAr:
      "إحالات على مستوى الكتاب والباب؛ لا تُنسب أرقام أو نصوص غير موجودة في العينات المحلية.",
    reviewStatus: "pending_review",
  },
  {
    id: "muslim",
    titleAr: "صحيح مسلم",
    authorAr: "مسلم بن الحجاج النيسابوري",
    authorDeathHijri: 261,
    genre: "hadith",
    authorityNoteAr:
      "إحالات على مستوى الكتاب والباب؛ النص الكامل غير متوفر محليًا بعد.",
    reviewStatus: "pending_review",
  },
  {
    id: "tirmidhi",
    titleAr: "جامع الترمذي",
    authorAr: "محمد بن عيسى الترمذي",
    authorDeathHijri: 279,
    genre: "hadith",
    authorityNoteAr:
      "يُستعمل للشواهد والدرجات؛ لا تُنقل أحكام التصحيح دون مراجعة النسخة.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-hisham",
    titleAr: "السيرة النبوية لابن هشام",
    authorAr: "عبد الملك بن هشام، عن محمد بن إسحاق",
    authorDeathHijri: 218,
    genre: "sira",
    authorityNoteAr:
      "أصل سردي جامع، لكنه يجمع روايات متفاوتة الأسانيد؛ تُقرأ مع كتب المغازي والحديث.",
    reviewStatus: "pending_review",
  },
  {
    id: "al-waqidi",
    titleAr: "المغازي",
    authorAr: "محمد بن عمر الواقدي",
    authorDeathHijri: 207,
    genre: "maghazi",
    authorityNoteAr:
      "تفصيل زمني ومكاني غزير، مع كلام معروف في الواقدي؛ يُستأنس به ولا يُقدَّم على الصحيحين.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-saad",
    titleAr: "الطبقات الكبرى",
    authorAr: "محمد بن سعد",
    authorDeathHijri: 230,
    genre: "sira",
    authorityNoteAr:
      "تراجم الصحابة والنساء والأخبار الاجتماعية؛ يفيد في الناس والأنساب.",
    reviewStatus: "pending_review",
  },
  {
    id: "khalifa",
    titleAr: "تاريخ خليفة بن خياط",
    authorAr: "خليفة بن خياط",
    authorDeathHijri: 240,
    genre: "tarikh",
    authorityNoteAr:
      "تأريخ مختصر مبكر يفيد في ترتيب الأحداث والوفيات.",
    reviewStatus: "pending_review",
  },
  {
    id: "al-baladhuri",
    titleAr: "أنساب الأشراف",
    authorAr: "أحمد بن يحيى البلاذري",
    authorDeathHijri: 279,
    genre: "tarikh",
    authorityNoteAr:
      "أنساب وأخبار سياسية؛ يحتاج تمييز الروايات المتفاوتة.",
    reviewStatus: "pending_review",
  },
  {
    id: "al-tabari",
    titleAr: "تاريخ الطبري",
    authorAr: "محمد بن جرير الطبري",
    authorDeathHijri: 310,
    genre: "tarikh",
    authorityNoteAr:
      "جامع لأسانيد الأخبار؛ يُعرض على أنه ناقل للروايات لا حاكم عليها.",
    reviewStatus: "pending_review",
  },
  {
    id: "al-bayhaqi",
    titleAr: "دلائل النبوة",
    authorAr: "أحمد بن الحسين البيهقي",
    authorDeathHijri: 458,
    genre: "dalail",
    authorityNoteAr:
      "جمع أدلة النبوة والشمائل؛ تتفاوت أسانيده ويُستفاد منه مع التمييز.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-al-athir",
    titleAr: "الكامل في التاريخ",
    authorAr: "عز الدين ابن الأثير",
    authorDeathHijri: 630,
    genre: "tarikh",
    authorityNoteAr:
      "ترتيب سنوي حادثي مفيد للسياق، مع نقل عن مصادر سابقة.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-al-qayyim",
    titleAr: "زاد المعاد في هدي خير العباد",
    authorAr: "ابن قيم الجوزية",
    authorDeathHijri: 751,
    genre: "sira",
    authorityNoteAr:
      "تحليل فقهي وتربوي للسيرة؛ يُتميز فيه بين الثابت والمشهور.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-kathir",
    titleAr: "البداية والنهاية",
    authorAr: "إسماعيل بن عمر ابن كثير",
    authorDeathHijri: 774,
    genre: "tarikh",
    authorityNoteAr:
      "جمع وترتيب مع نقد إجمالي؛ لا يُغني عن الرجوع إلى الأصول.",
    reviewStatus: "pending_review",
  },
  {
    id: "ibn-hajar",
    titleAr: "فتح الباري بشرح صحيح البخاري",
    authorAr: "أحمد بن علي ابن حجر العسقلاني",
    authorDeathHijri: 852,
    genre: "rijal",
    authorityNoteAr:
      "شرح حديثي ونقد أسانيد؛ يفيد في تحرير مواضع الإحالات.",
    reviewStatus: "pending_review",
  },
];
