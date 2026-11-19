export type PrayerStepCategory = "preparation" | "positions" | "recitations" | "completion";

export type PrayerGuideReviewStatus = "pending_review" | "reviewed";

export interface PrayerStep {
  id: string;
  title: string;
  description: string;
  arabicText?: string;
  transliteration?: string;
  category: PrayerStepCategory;
  order: number;
  isRequired: boolean;
  /**
   * Provenance of the step. The legacy baseline carried no source id, so the
   * honest label is the legacy import itself and the review stays pending.
   */
  sourceId: string;
  reviewStatus: PrayerGuideReviewStatus;
  reviewNote: string;
}

export const PRAYER_GUIDE_PROVENANCE = {
  origin: "legacy baseline import (UPDATED_FILES/prayerGuideData.ts)",
  importedAt: "2026-11-19",
  reviewStatus: "pending_review" as PrayerGuideReviewStatus,
  note: "خطوات إرشادية عامة مستوردة من النسخة الأساسية للمشروع؛ لم تُوثّق بعد بمصدر شرعي ولم تُراجع من متخصص، فتُعرض كخريطة تعلّم لا كأحكام أو فتاوى.",
} as const;

const LEGACY_SOURCE_ID = "legacy-baseline-prayer-guide";

export const PRAYER_GUIDE_STEPS: PrayerStep[] = [
  {
    id: "1",
    title: "الوضوء",
    description: "أداء الوضوء بالطريقة الصحيحة كشرط لصحة الصلاة",
    category: "preparation",
    order: 1,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "2",
    title: "استقبال القبلة",
    description: "التوجه نحو الكعبة المشرفة في مكة المكرمة",
    category: "preparation",
    order: 2,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "3",
    title: "النية",
    description: "استحضار نية الصلاة في القلب",
    category: "preparation",
    order: 3,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "4",
    title: "تكبيرة الإحرام",
    description: "قول «الله أكبر» مع رفع اليدين لبدء الصلاة",
    category: "positions",
    order: 4,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "5",
    title: "دعاء الاستفتاح",
    description: "قراءة دعاء الاستفتاح بعد تكبيرة الإحرام",
    category: "recitations",
    order: 5,
    isRequired: false,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "6",
    title: "سورة الفاتحة",
    description: "قراءة سورة الفاتحة في كل ركعة",
    category: "recitations",
    order: 6,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "7",
    title: "الركوع",
    description: "الانحناء مع وضع اليدين على الركبتين",
    category: "positions",
    order: 7,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "8",
    title: "السجود",
    description: "وضع الجبهة والأنف على الأرض مع الركبتين واليدين والقدمين",
    category: "positions",
    order: 8,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "9",
    title: "التشهد",
    description: "قراءة التشهد في الجلوس الأخير",
    category: "recitations",
    order: 9,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
  {
    id: "10",
    title: "التسليم",
    description: "إنهاء الصلاة بقول «السلام عليكم ورحمة الله» يمينًا ويسارًا",
    category: "completion",
    order: 10,
    isRequired: true,
    sourceId: LEGACY_SOURCE_ID,
    reviewStatus: "pending_review",
    reviewNote: PRAYER_GUIDE_PROVENANCE.note,
  },
];

export const PRAYER_GUIDE_COUNTS = {
  steps: PRAYER_GUIDE_STEPS.length,
  pendingReview: PRAYER_GUIDE_STEPS.filter((step) => step.reviewStatus === "pending_review").length,
} as const;
