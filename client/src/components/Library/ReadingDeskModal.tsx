import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LibraryBook } from "./RealisticBookshelf";
import {
  BookOpen,
  Download,
  ShieldCheck,
  FileText,
  User,
  Calendar,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Award,
} from "lucide-react";
import { useState } from "react";

interface ReadingDeskModalProps {
  book: LibraryBook | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExternalSource: (book: LibraryBook) => void;
  onInspectProvenance: (book: LibraryBook) => void;
}

export default function ReadingDeskModal({
  book,
  isOpen,
  onClose,
  onOpenExternalSource,
  onInspectProvenance,
}: ReadingDeskModalProps) {
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  const handleCopyCitation = () => {
    const citation = `${book.author}. ${book.title}. ${book.publisher || "بيانات الناشر غير متاحة"}، ${book.publishedYear}م. ${book.investigator ? `تحقيق: ${book.investigator}. ` : ""}مكتبة صرح يا رسول الله ﷺ الرقمية.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-amber-900/30 dark:border-amber-500/20 bg-card text-card-foreground shadow-2xl">
        {/* Top Illuminated Header */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950 text-amber-50 p-6 sm:p-8 border-b border-amber-800/30 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-mono text-amber-300">
                  خزانة التراث والتحقيق العلمي
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-tajawal text-slate-300">
                  سجل ببليوغرافي — حالة النسخة قيد المراجعة
                </span>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-amiri font-bold text-white text-right">
                {book.title}
              </DialogTitle>
              <DialogDescription className="text-amber-200/80 font-tajawal text-sm text-right">
                تأليف: {book.author} ({book.publishedYear}م)
              </DialogDescription>
            </div>

            {/* Book Volume Badge */}
            <div className="hidden sm:flex flex-col items-center justify-center w-16 h-20 rounded-md border border-amber-500/30 bg-black/40 text-center p-1.5 flex-shrink-0">
              <span className="text-[10px] font-mono text-amber-400 uppercase">
                {book.format}
              </span>
              <BookOpen className="w-5 h-5 text-amber-300 my-1" />
              <span className="text-[10px] font-mono text-slate-300">
                {book.pages} ص
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body / Bibliographic Dossier */}
        <div className="p-6 sm:p-8 space-y-6 text-right max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="space-y-1">
              <span className="text-[11px] font-tajawal text-muted-foreground block">
                المصنّف والمؤلف
              </span>
              <p className="text-sm font-semibold font-cairo">{book.author}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-tajawal text-muted-foreground block">
                المحقق / المعتني به
              </span>
              <p className="text-sm font-semibold font-cairo">
                {book.investigator || "غير متاح في السجل"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-tajawal text-muted-foreground block">
                دار النشر / الطبعة
              </span>
              <p className="text-sm font-semibold font-cairo">
                {book.publisher || book.edition || "غير متاح في السجل"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-tajawal text-muted-foreground block">
                الحجم وعدد الصفحات
              </span>
              <p className="text-sm font-semibold font-mono">
                {book.pages} صفحة · {book.size}
              </p>
            </div>
          </div>

          {/* Book Synopsis & Scholarly Value */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold font-cairo text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              التعريف بالمصنَّف وقيمته العلمية
            </h3>
            <p className="text-sm font-tajawal text-foreground/90 leading-relaxed bg-background/50 p-4 rounded-xl border border-border/60">
              {book.description}
            </p>
          </div>

          {/* Citation Generation Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 font-tajawal text-muted-foreground hover:text-foreground"
                onClick={handleCopyCitation}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم نسخ التوثيق</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ التوثيق الأكاديمي</span>
                  </>
                )}
              </Button>
              <span className="text-xs font-tajawal text-muted-foreground">
                مسودة استشهاد ببليوغرافي (بيانات تحتاج مراجعة)
              </span>
            </div>
            <div className="p-3 bg-muted/30 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground select-all leading-normal text-left" dir="ltr">
              {book.author}. "{book.titleEn || book.title}." {book.publisher || "Critical Scholarly Edition"}, {book.publishedYear}. Ya Rasool Allah Digital Library.
            </div>
          </div>

          {/* Action Hub */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto font-tajawal gap-1.5"
              onClick={() => onInspectProvenance(book)}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>فحص الإسناد والمصدر (SourceDrawer)</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {book.downloadUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-none font-tajawal gap-1.5"
                  onClick={() => onOpenExternalSource(book)}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح المصدر الخارجي</span>
                </Button>
              )}

              <div className="flex-1 sm:flex-none text-xs font-tajawal text-muted-foreground" role="status">
                المطالعة داخل المنصة غير متاحة لعدم وجود نص أو ملف مرخّص ومراجع.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
