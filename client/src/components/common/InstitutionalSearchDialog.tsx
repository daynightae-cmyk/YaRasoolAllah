import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Compass,
  Library,
  Feather,
  Heart,
  ChevronLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import booksData from "@/data/books.json";
import { seerahChapters } from "@/data/seerahData";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "seerah" | "quran" | "hadith" | "library" | "overview";
  url: string;
}

interface InstitutionalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstitutionalSearchDialog({
  isOpen,
  onClose,
}: InstitutionalSearchDialogProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const results: SearchResultItem[] = [];

  if (query.trim().length > 1) {
    const q = query.toLowerCase();

    // 1. Search in Seerah chapters
    seerahChapters.forEach((ch) => {
      if (
        ch.title.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q) ||
        (ch.keywords && ch.keywords.some((k) => k.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `seerah-${ch.id}`,
          title: ch.title,
          subtitle: `درب السيرة النبوية · ${ch.category}`,
          category: "seerah",
          url: `/seerah`,
        });
      }
    });

    // 2. Search in Digital Library books
    booksData.books.forEach((b) => {
      if (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: `lib-${b.id}`,
          title: b.title,
          subtitle: `خزانة الرفوف · ${b.author} (${b.publishedYear}م)`,
          category: "library",
          url: `/digital-library`,
        });
      }
    });

    // 3. Core Pages
    const staticTopics = [
      {
        title: "من هو محمد ﷺ؟ (مدخل عالمي تعريفي)",
        subtitle: "التعريف الشامل بالنبي الخاتم ورسالته الإنسانية",
        category: "overview" as const,
        url: "/who-is-muhammad",
      },
      {
        title: "رِواق القرآن الكريم وعلومه وتفاسيره",
        subtitle: "المصحف الشريف، تلاوات أئمة الحرمين، والتفاسير المعتمدة",
        category: "quran" as const,
        url: "/quran",
      },
      {
        title: "دار الحديث الشريف وصحيح الرواية",
        subtitle: "الصحيحان والسنن المعتمدة مع بيان فقه الحديث ورجاله",
        category: "hadith" as const,
        url: "/sunnah",
      },
      {
        title: "أطلس الغزوات التضاريسي المتحرك",
        subtitle: "تضاريس ومسارات معارك بدر وأحد والخندق (تغطية المزيد قيد الإدخال)",
        category: "seerah" as const,
        url: "/seerah",
      },
      {
        title: "الهدي النبوي على مدار 24 ساعة",
        subtitle: "سنن الاستيقاظ والصلاة والعمل والتعامل والمجلس والمنام",
        category: "overview" as const,
        url: "/prophetic-day",
      },
    ];

    staticTopics.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: `static-${t.url}`,
          title: t.title,
          subtitle: t.subtitle,
          category: t.category,
          url: t.url,
        });
      }
    });
  }

  const handleSelect = (url: string) => {
    setLocation(url);
    onClose();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "seerah":
        return { label: "السيرة والشمائل", color: "text-emerald-700 dark:text-emerald-400" };
      case "quran":
        return { label: "القرآن والتفسير", color: "text-amber-700 dark:text-amber-400" };
      case "hadith":
        return { label: "الحديث والسنة", color: "text-blue-700 dark:text-blue-400" };
      case "library":
        return { label: "خزانة الرفوف", color: "text-purple-700 dark:text-purple-400" };
      default:
        return { label: "الصرح النبوي", color: "text-stone-700 dark:text-stone-400" };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-amber-900/30 dark:border-amber-500/20 bg-card text-card-foreground shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>البحث المؤسسي</DialogTitle>
        </DialogHeader>
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث في السيرة النبوية، القرآن، أمهات الكتب، وصحيح السنة..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 pl-4 py-2 font-tajawal text-sm bg-background border-border text-right"
              autoFocus
            />
          </div>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1 text-right">
          {query.trim().length <= 1 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Compass className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-tajawal">اكتب كلمتين أو أكثر للبحث في كامل الصرح المعرفي</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-tajawal text-muted-foreground">
                {[
                  ["بدر", "غزوة بدر"],
                  ["الشمائل", "الشمائل المحمدية"],
                  ["الخندق", "غزوة الخندق"],
                  ["زاد المعاد", "زاد المعاد"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="hover:text-primary underline-offset-4 hover:underline"
                    onClick={() => setQuery(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <p className="text-sm font-tajawal">لم نجد نتائج مطابقة لـ «{query}»</p>
              <p className="text-xs text-stone-400">تأكد من كتابة الكلمات بالرسم الشائع</p>
            </div>
          ) : (
            results.slice(0, 12).map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className="w-full p-3 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group border border-transparent hover:border-border text-right"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-amiri font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs font-tajawal text-muted-foreground line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>صرح يا رسول الله ﷺ · محرك البحث المعرفي الموحد</span>
          <span>ESC للإغلاق</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
