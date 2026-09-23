import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BookOpen, ExternalLink, Bookmark, Share2, AlertCircle } from "lucide-react";

export interface EvidenceSource {
  title: string;
  authorOrCompiler?: string;
  collectionOrWork?: string;
  referenceNumber?: string | number;
  chapter?: string;
  originalText?: string;
  translationExcerpt?: string;
  status?: "verified" | "multiple_sourced" | "historically_approximate" | "disputed" | "editorial_review_pending";
  grade?: string;
  uncertaintyNote?: string;
  provenanceDataset?: string;
  sourceUrl?: string;
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceSource | null;
  claimContext?: string;
}

const STATUS_CONFIG: Record<
  NonNullable<EvidenceSource["status"]>,
  { labelAr: string; labelEn: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  verified: {
    labelAr: "توثيق معتمد",
    labelEn: "Directly Sourced & Verified",
    variant: "default",
  },
  multiple_sourced: {
    labelAr: "روايات متعددة متطابقة",
    labelEn: "Multiple Sourced Reports",
    variant: "secondary",
  },
  historically_approximate: {
    labelAr: "تقريبي تاريخياً / جغرافيًا",
    labelEn: "Historically Approximate",
    variant: "outline",
  },
  disputed: {
    labelAr: "محل خلاف بين المؤرخين",
    labelEn: "Disputed Among Sources",
    variant: "outline",
  },
  editorial_review_pending: {
    labelAr: "قيد المراجعة التحريرية",
    labelEn: "Editorial Review Pending",
    variant: "destructive",
  },
};

export default function EvidenceDrawer({
  isOpen,
  onClose,
  evidence,
  claimContext,
}: EvidenceDrawerProps) {
  if (!evidence) return null;

  const status = evidence.status
    ? STATUS_CONFIG[evidence.status]
    : STATUS_CONFIG.editorial_review_pending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-amber-900/20 dark:border-amber-500/20 shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-right space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={status.variant} className="px-3 py-1 text-xs font-tajawal">
              <ShieldCheck className="w-3.5 h-3.5 ml-1.5 inline" />
              {status.labelAr}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              خزانة المصادر والتحقيق
            </span>
          </div>

          <DialogTitle className="text-xl font-amiri font-bold text-foreground">
            {evidence.title}
          </DialogTitle>

          {claimContext && (
            <DialogDescription className="text-sm font-cairo bg-muted/40 p-3 rounded-xl border-r-4 border-amber-600 dark:border-amber-500 text-muted-foreground">
              <span className="font-bold text-foreground block mb-1">المحطة أو الشاهد:</span>
              {claimContext}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-border/60 text-sm">
            {evidence.collectionOrWork && (
              <div>
                <span className="text-xs text-muted-foreground block font-cairo">المصنف / الكتاب:</span>
                <span className="font-semibold font-amiri text-foreground">{evidence.collectionOrWork}</span>
              </div>
            )}
            {evidence.authorOrCompiler && (
              <div>
                <span className="text-xs text-muted-foreground block font-cairo">المصنف / المؤلف:</span>
                <span className="font-semibold font-cairo text-foreground">{evidence.authorOrCompiler}</span>
              </div>
            )}
            {evidence.chapter && (
              <div>
                <span className="text-xs text-muted-foreground block font-cairo">الباب / الفصل:</span>
                <span className="font-medium font-cairo text-foreground">{evidence.chapter}</span>
              </div>
            )}
            {evidence.referenceNumber && (
              <div>
                <span className="text-xs text-muted-foreground block font-cairo">رقم الأثر / الحديث:</span>
                <span className="font-mono text-primary font-bold">{evidence.referenceNumber}</span>
              </div>
            )}
          </div>

          {/* Original Source Text */}
          {evidence.originalText && (
            <div className="space-y-1.5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-xs font-bold font-cairo text-amber-800 dark:text-amber-400 block">
                نص المصدر الأصلي:
              </span>
              <p className="font-amiri text-lg leading-relaxed text-foreground" dir="rtl">
                «{evidence.originalText}»
              </p>
            </div>
          )}

          {/* Translation excerpt if present */}
          {evidence.translationExcerpt && (
            <div className="space-y-1 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground font-inter">
              <span className="font-semibold block font-cairo">الترجمة الإنجليزية المعتمدة:</span>
              <p>"{evidence.translationExcerpt}"</p>
            </div>
          )}

          {/* Uncertainty / Cautionary Note if historically approximate or disputed */}
          {evidence.uncertaintyNote && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="font-bold block font-cairo">إيضاح منهجي وتحقيقي:</span>
                <p className="font-cairo leading-relaxed">{evidence.uncertaintyNote}</p>
              </div>
            </div>
          )}

          {/* Provenance */}
          <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-between pt-2 border-t">
            <span>سجل التحقيق: {evidence.provenanceDataset || "مجموعة السيرة النبوية المعتمدة v1.0"}</span>
            <span className="text-emerald-600 dark:text-emerald-400">خالٍ من التجسيد والتمثيل</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t mt-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="font-cairo">
            إغلاق
          </Button>
          {evidence.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              className="font-cairo gap-1.5"
              onClick={() => window.open(evidence.sourceUrl, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              الاطلاع على الأصل
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
