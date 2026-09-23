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
  ShieldCheck,
  FileText,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface ReadingDeskModalProps {
  book: LibraryBook | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSource: (book: LibraryBook) => void;
  onInspectProvenance: (book: LibraryBook) => void;
}

export default function ReadingDeskModal({
  book,
  isOpen,
  onClose,
  onOpenSource,
  onInspectProvenance,
}: ReadingDeskModalProps) {
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  const handleCopyCitation = async () => {
    const citation = `${book.author}. ${book.title}. ${book.publisher || "بيانات الناشر غير مسجلة"}، ${book.publishedYear}م. ${book.investigator ? `تحقيق: ${book.investigator}. ` : ""}فهرس يا رسول الله ﷺ — سجل أولي قيد مراجعة الحقوق والنسخة.`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
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
                  سجل الفهرسة والمصدر الخارجي
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-tajawal text-slate-300">
                  قيد مراجعة النسخة والحقوق
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
                {book.investigator || "غير مسجل في بيانات الفهرس"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-tajawal text-muted-foreground block">
                دار النشر / الطبعة
              </span>
              <p className="text-sm font-semibold font-cairo">
                {book.publisher || book.edition || "غير مسجل في بيانات الفهرس"}
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

          {/* Rights-safe catalog status. Raw source descriptions are not rendered
              before editorial and edition-level review. */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold font-cairo text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              حالة الوصف والنسخة
            </h3>
            <p className="text-sm font-tajawal text-foreground/90 leading-relaxed bg-background/50 p-4 rounded-xl border border-border/60">
              هذا سجل فهرسي أولي فقط. لم يُعتمد بعد وصف العمل أو بيانات الطبعة أو حق الملف المرتبط به، لذلك لا تعرض المنصة نصًا أو ملخصًا منقولًا بوصفه مادة محققة.
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
                صيغة استشهاد أولية (Citation)
              </span>
            </div>
            <div className="p-3 bg-muted/30 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground select-all leading-normal text-left" dir="ltr">
              {book.author}. "{book.titleEn || book.title}." {book.publisher || "Publisher not recorded"}, {book.publishedYear}. Ya Rasool Allah preliminary catalog record; edition and rights review pending.
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
              <Button
                size="sm"
                className="flex-1 sm:flex-none bg-primary text-primary-foreground font-tajawal font-semibold gap-1.5 shadow-md hover:brightness-105"
                onClick={() => onOpenSource(book)}
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح المصدر الخارجي</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
