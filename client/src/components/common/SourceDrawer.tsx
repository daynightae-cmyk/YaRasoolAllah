import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Layers,
  AlertCircle,
  Scroll,
  Scale,
  Sparkles,
  X,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { RightsDecision } from "@shared/source-governance";

export type EditorialStatus =
  | "verified"
  | "scholarly_consensus"
  | "multiple_sourced"
  | "historically_approximate"
  | "disputed"
  | "editorial_review_pending";

export type HadithGradeType =
  | "sahih"
  | "hasan"
  | "mutawatir"
  | "mashhur"
  | "historical_report"
  | "daif_caution"
  | "under_investigation";

export interface SourceProvenanceItem {
  id?: string;
  // Core Identifiers
  title: string;
  collectionNameAr?: string;
  collectionNameEn?: string;
  compilerAr?: string;
  compilerDeathHijri?: number | string;

  // Reference & Location
  referenceNumber?: string | number;
  bookNameAr?: string;
  chapterNameAr?: string;
  volumeNumber?: string | number;
  pageNumber?: string | number;

  // Editorial Review & Authenticity
  status?: EditorialStatus;
  hadithGrade?: HadithGradeType | string;
  gradeAssessor?: string;
  reviewNote?: string;
  uncertaintyNote?: string;

  // Texts
  textAr?: string;
  textEn?: string;
  isnadChainAr?: string;

  // Academic Citation & Physical Archive
  editionTahqiq?: string;
  publisher?: string;
  libraryShelfCode?: string;
  manuscriptReference?: string;
  sourceUrl?: string;
  provenanceDataset?: string;
  sourceRegistryId?: string;
  rightsDecision?: RightsDecision;
  allowedUsageLabel?: string;
  rightsCheckedAt?: string;

  // Backwards compatibility with EvidenceSource
  authorOrCompiler?: string;
  collectionOrWork?: string;
  chapter?: string;
  originalText?: string;
  translationExcerpt?: string;
  grade?: string;
}

export interface SourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  source: SourceProvenanceItem | null;
  claimContext?: string;
  viewMode?: "seerah" | "hadith" | "quran" | "general";
}

const STATUS_CONFIG: Record<
  EditorialStatus,
  {
    labelAr: string;
    labelEn: string;
    dotColor: string;
    descriptionAr: string;
  }
> = {
  verified: {
    labelAr: "توثيق معتمد ومحقق",
    labelEn: "Directly Sourced & Verified",
    dotColor: "bg-emerald-500",
    descriptionAr: "مروي بأسانيد صحيحة مثبتة في المصنفات الأصلية المعتمدة بإجماع المحدثين والمحققين.",
  },
  scholarly_consensus: {
    labelAr: "إجماع الأئمة والمحققين",
    labelEn: "Scholarly Consensus",
    dotColor: "bg-teal-500",
    descriptionAr: "ثابت بإجماع أئمة الصنعة الحديثية والتاريخية ونقلته الأمة بالقبول المتواتر.",
  },
  multiple_sourced: {
    labelAr: "متعدد الروايات والشواهد",
    labelEn: "Multiple Corroborated Reports",
    dotColor: "bg-cyan-500",
    descriptionAr: "ورد من عدة طرق متضافرة يعضد بعضها بعضاً وفق مناهج الاستدلال والترجيح المعتمدة.",
  },
  historically_approximate: {
    labelAr: "تقريبي تاريخياً وجغرافياً",
    labelEn: "Historically Approximate",
    dotColor: "bg-amber-500",
    descriptionAr: "موقع أو تسلسل تاريخي مقارب ومستقرأ من كتب المغازي والسير، مع وجود هامش تقريبي مشروع.",
  },
  disputed: {
    labelAr: "محل خلاف علمي مدوّن",
    labelEn: "Scholarly Divergence",
    dotColor: "bg-rose-500",
    descriptionAr: "تعددت فيه أقوال أئمة السير أو أهل الحديث، وأثبت هذا الخلاف التزاماً بالأمانة العلمية.",
  },
  editorial_review_pending: {
    labelAr: "قيد المراجعة التحريرية",
    labelEn: "Editorial Review Pending",
    dotColor: "bg-slate-400",
    descriptionAr: "بيانات هذا السجل لم تستكمل مراجعتها التحريرية أو مطابقتها بمورد موثق.",
  },
};

const RIGHTS_LABELS: Record<RightsDecision, string> = {
  cleared: "مسموح وفق السجل الحالي",
  api_only: "استخدام عبر API فقط",
  reference_only: "فهرسة ورابط خارجي فقط",
  development_only: "عينة تطوير فقط",
  needs_review: "مراجعة الحقوق مطلوبة",
  blocked: "الاستخدام محظور",
};

export default function SourceDrawer({
  isOpen,
  onClose,
  source,
  claimContext,
  viewMode = "general",
}: SourceDrawerProps) {
  const { toast } = useToast();
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showIsnad, setShowIsnad] = useState(false);

  if (!source) return null;

  // Normalized fields for cross-compatibility
  const title = source.title;
  const collection =
    source.collectionNameAr ||
    source.collectionOrWork ||
    "غير محدد في سجل المصدر";
  const compiler =
    source.compilerAr ||
    source.authorOrCompiler ||
    "غير محدد في سجل المصدر";
  const chapter = source.chapterNameAr || source.chapter;
  const refNum = source.referenceNumber;
  const arabicText = source.textAr || source.originalText || "";
  const englishText = source.textEn || source.translationExcerpt;
  const rawStatus = source.status ?? "editorial_review_pending";
  const statusInfo = STATUS_CONFIG[rawStatus] ?? STATUS_CONFIG.editorial_review_pending;
  const grade = source.hadithGrade || source.grade;

  // Generate standardized academic citation
  const generateCitation = () => {
    const parts = [
      compiler,
      `«${collection}»`,
      chapter ? `(باب: ${chapter})` : null,
      refNum ? `رقم: ${refNum}` : null,
      source.volumeNumber ? `ج${source.volumeNumber}` : null,
      source.pageNumber ? `ص${source.pageNumber}` : null,
      source.editionTahqiq ? `[${source.editionTahqiq}]` : null,
      "— منصة يا رسول الله ﷺ الرقمية المعيارية.",
    ].filter(Boolean);
    return parts.join("، ");
  };

  const handleCopyCitation = async () => {
    const citation = generateCitation();
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      toast({
        title: "تم نسخ العزو الأكاديمي",
        description: "تم نسخ بيانات المصدر والتوثيق إلى الحافظة بصيغة موحدة.",
      });
      setTimeout(() => setCopiedCitation(false), 2500);
    } catch {
      toast({
        variant: "destructive",
        title: "تعذر نسخ العزو",
        description: "لم تمنح المتصفح إذن الوصول إلى الحافظة. حاول مرة أخرى بعد السماح بالنسخ.",
      });
    }
  };

  const handleCopyText = async () => {
    const fullText = `«${arabicText}»\n\n[المصدر: ${collection} - ${compiler}]`;
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(fullText);
      setCopiedText(true);
      toast({
        title: "تم نسخ النص الأصلي",
        description: "تم نسخ المتن موثقاً بالمصدر إلى الحافظة بنجاح.",
      });
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      toast({
        variant: "destructive",
        title: "تعذر نسخ النص",
        description: "لم تمنح المتصفح إذن الوصول إلى الحافظة. حاول مرة أخرى بعد السماح بالنسخ.",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 bg-white dark:bg-slate-900 border-r border-border shadow-2xl flex flex-col h-full z-50 text-right overflow-hidden"
        dir="rtl"
      >
        {/* ========================================================
            HEADER: SCHOLARLY TITLE & STATUS
            ======================================================== */}
        <SheetHeader className="p-6 pb-4 border-b border-border bg-slate-50/70 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            {/* Zero-Pill Status Indicator: Clean text with subtle dot */}
            <div className="flex items-center gap-2 text-xs font-cairo">
              <span className={cn("w-2 h-2 rounded-full shrink-0", statusInfo.dotColor)} />
              <span className="font-bold text-foreground">{statusInfo.labelAr}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-muted-foreground text-[11px]">
                {viewMode === "hadith" ? "دار الحديث النبوي" : "خزانة التوثيق والسيرة"}
              </span>
            </div>

            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">إغلاق</span>
              </Button>
            </SheetClose>
          </div>

          <SheetTitle className="text-xl md:text-2xl font-amiri font-bold text-foreground leading-snug">
            {title}
          </SheetTitle>

          {/* Context claim highlight if available */}
          {claimContext && (
            <SheetDescription className="text-xs font-cairo bg-amber-500/10 dark:bg-amber-500/15 border-r-3 border-amber-600 dark:border-amber-400 p-3 rounded-lg text-slate-700 dark:text-slate-300 mt-2 text-right">
              <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                الشاهد أو المحطة الموثّقة:
              </span>
              {claimContext}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* ========================================================
            BODY: SCROLLABLE PROVENANCE & SCHOLARLY APPARATUS
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Primary Arabic Text Box */}
          {arabicText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-cairo">
                <span className="font-bold flex items-center gap-1.5 text-foreground">
                  <Scroll className="w-4 h-4 text-amber-600" />
                  النص كما ورد في المصنف الأصلي:
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 shadow-inner">
                <p className="font-amiri text-lg md:text-xl leading-loose text-foreground font-medium">
                  «{arabicText}»
                </p>
              </div>
            </div>
          )}

          {/* English / Second Language Excerpt */}
          {englishText && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border text-xs text-muted-foreground font-inter space-y-1" dir="ltr">
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500 block">
                Translation Reference
              </span>
              <p className="leading-relaxed">"{englishText}"</p>
            </div>
          )}

          {/* Isnad Chain (Expandable) */}
          {source.isnadChainAr && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowIsnad(!showIsnad)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-cairo font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  سلسلة السند والرواة (الإسناد)
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    showIsnad && "rotate-180"
                  )}
                />
              </button>

              {showIsnad && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-border text-xs font-amiri leading-loose text-muted-foreground">
                  {source.isnadChainAr}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              METADATA GRID (CITATION APPARATUS)
              ======================================================== */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-cairo text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              بيانات العزو والتحقيق الأكاديمي
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-border text-xs font-cairo">
              {/* Collection */}
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">المصنف / الكتاب:</span>
                <span className="font-amiri font-bold text-sm text-foreground block">{collection}</span>
              </div>

              {/* Compiler */}
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">المصنّف / الراوي:</span>
                <span className="font-semibold text-foreground block">
                  {compiler}
                  {source.compilerDeathHijri && (
                    <span className="font-mono text-[11px] text-muted-foreground mr-1">
                      (ت {source.compilerDeathHijri} هـ)
                    </span>
                  )}
                </span>
              </div>

              {/* Chapter */}
              {chapter && (
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">الباب / الفصل:</span>
                  <span className="font-medium text-foreground block">{chapter}</span>
                </div>
              )}

              {/* Reference Number */}
              {refNum && (
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">رقم الأثر / الحديث:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 block">
                    #{refNum}
                  </span>
                </div>
              )}

              {/* Edition Tahqiq */}
              {source.editionTahqiq && (
                <div className="space-y-0.5 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground block">التحقيق والطبعة المعتمدة:</span>
                  <span className="text-foreground block">{source.editionTahqiq}</span>
                </div>
              )}

              {/* Volume & Page */}
              {(source.volumeNumber || source.pageNumber) && (
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">الموضع في المطبوع:</span>
                  <span className="font-mono text-foreground block">
                    {source.volumeNumber && `الجزء ${source.volumeNumber}`}
                    {source.volumeNumber && source.pageNumber && " · "}
                    {source.pageNumber && `الصفحة ${source.pageNumber}`}
                  </span>
                </div>
              )}

              {/* Authenticity Grade if hadith */}
              {grade && (
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">درجة الحديث وحكم الأئمة:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" />
                    {grade}
                    {source.gradeAssessor && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({source.gradeAssessor})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Institutional Dataset ID */}
              {source.provenanceDataset && (
                <div className="space-y-0.5 sm:col-span-2 border-t pt-2 mt-1">
                  <span className="text-[11px] text-muted-foreground block">المعرف الرقمي المؤسسي:</span>
                  <span className="font-mono text-[11px] text-slate-500 block">
                    {source.provenanceDataset}
                  </span>
                </div>
              )}

              {source.sourceRegistryId && (
                <div className="space-y-0.5 sm:col-span-2 border-t pt-2 mt-1">
                  <span className="text-[11px] text-muted-foreground block">معرف سجل المصدر:</span>
                  <span className="font-mono text-[11px] text-slate-500 block">
                    {source.sourceRegistryId}
                  </span>
                </div>
              )}

              {source.rightsDecision && (
                <div className="space-y-0.5 sm:col-span-2 border-t pt-2 mt-1">
                  <span className="text-[11px] text-muted-foreground block">قرار الحقوق ونطاق الاستخدام:</span>
                  <span className="font-semibold text-foreground block">
                    {RIGHTS_LABELS[source.rightsDecision]}
                    {source.allowedUsageLabel ? ` · ${source.allowedUsageLabel}` : ""}
                  </span>
                  {source.rightsCheckedAt && (
                    <span className="font-mono text-[10px] text-muted-foreground block mt-1" dir="ltr">
                      checked_at: {source.rightsCheckedAt}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              EDITORIAL INTEGRITY & SCHOLARLY GUARANTEE
              ======================================================== */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5 text-xs font-cairo">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>حالة السجل وحدود الاعتماد</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {statusInfo.descriptionAr} لا تعني فهرسة المورد أن نصه أو طبعته أو حق إعادة توزيعه أصبح معتمدًا.
            </p>

            {(source.reviewNote || source.uncertaintyNote) && (
              <div className="pt-2 border-t border-emerald-500/20 text-slate-700 dark:text-slate-300">
                <span className="font-bold block mb-0.5">ملاحظة المراجعة:</span>
                {source.reviewNote || source.uncertaintyNote}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            FOOTER ACTIONS: COPY CITATION & EXTERNAL
            ======================================================== */}
        <div className="p-4 border-t border-border bg-slate-50/70 dark:bg-slate-950/60 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={handleCopyCitation}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-cairo text-xs font-bold rounded-xl h-10 gap-2 shadow-xs"
          >
            {copiedCitation ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم نسخ التوثيق الأكاديمي</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>نسخ العزو الأكاديمي المكتمل</span>
              </>
            )}
          </Button>

          {source.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-10 px-3 text-xs font-cairo rounded-xl gap-1.5"
            >
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                <span>المصدر الخارجي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}

          <SheetClose asChild>
            <Button variant="ghost" size="sm" className="h-10 px-4 text-xs font-cairo rounded-xl">
              إغلاق
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
