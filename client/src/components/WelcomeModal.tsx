import { Link } from "wouter";
import { BookOpen, Compass, Library, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRUST_POINTS = [
  "المصدر وحالة المراجعة جزء من المعلومة، لا حاشية مخفية.",
  "المساعد المعرفي يرشد إلى المصادر ولا يصدر فتاوى شخصية.",
  "لا تجسيد للنبي محمد ﷺ بصريًا أو صوتيًا.",
];

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { direction } = useLanguage();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-xl overflow-hidden border-amber-900/15 bg-background p-0 text-right shadow-elevation-3 dark:border-amber-300/15"
        dir={direction}
      >
        <div className="border-b border-border bg-gradient-to-l from-emerald-950 to-emerald-800 px-6 py-8 text-stone-50 sm:px-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/35 bg-white/5 text-amber-200">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogHeader className="space-y-3 text-right">
            <DialogTitle className="font-amiri text-3xl font-bold leading-relaxed text-stone-50">
              أهلاً بك في يا رسول الله ﷺ
            </DialogTitle>
            <DialogDescription className="max-w-prose-ar font-tajawal text-sm leading-7 text-emerald-50/85">
              مؤسسة معرفية رقمية لاستكشاف السيرة والقرآن والسنة من خلال
              قراءة هادئة، ومسارات واضحة إلى المصادر، وحالات مراجعة صريحة.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div className="space-y-3" aria-label="ميثاق الأمانة العلمية">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-1 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <p className="font-tajawal text-sm leading-7 text-muted-foreground">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Link href="/who-is-muhammad" asChild>
              <Button onClick={onClose} className="gap-2 bg-emerald-800 text-white hover:bg-emerald-700">
                <Compass className="h-4 w-4" aria-hidden="true" />
                ابدأ الرحلة
              </Button>
            </Link>
            <Link href="/quran" asChild>
              <Button variant="outline" onClick={onClose} className="gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                القرآن
              </Button>
            </Link>
            <Link href="/library" asChild>
              <Button variant="outline" onClick={onClose} className="gap-2">
                <Library className="h-4 w-4" aria-hidden="true" />
                المكتبة
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mx-auto block text-xs font-cairo text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            متابعة التصفح من الصفحة الحالية
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
