import React, { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Compass,
  FileText,
  Baby,
  Sun,
  ShieldCheck,
  User,
  MapPin,
  X,
} from "lucide-react";
import { seerahChapters } from "@/data/seerahData";
import booksData from "@/data/books.json";
import { childrenVideos } from "@/data/childrenVideos";
import { azkarData } from "@/data/azkarData";

export type SearchResultCategory =
  | "quran"
  | "hadith"
  | "seerah_event"
  | "person"
  | "place"
  | "book"
  | "kids"
  | "daily_guidance"
  | "wing"
  | "source_record";

export interface UnifiedSearchResult {
  id: string;
  category: SearchResultCategory;
  categoryLabelAr: string;
  title: string;
  excerpt: string;
  path: string;
  sourceIdentifier?: string;
  provenance: string;
}

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Explicit Escape-to-close: the acceptance contract requires Escape to
  // close the topmost surface regardless of focus-trap library behavior.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Build searchable index from authentic datasets
  const allIndexedItems = useMemo<UnifiedSearchResult[]>(() => {
    const items: UnifiedSearchResult[] = [];

    // 1. Seerah chapters & timeline events
    seerahChapters.forEach((ch) => {
      items.push({
        id: `seerah-${ch.id}`,
        category: "seerah_event",
        categoryLabelAr: "حدث في السيرة",
        title: ch.title,
        excerpt: ch.description,
        path: `/seerah`,
        sourceIdentifier: `فصل ${ch.order}`,
        provenance: "موسوعة السيرة النبوية المعتمدة",
      });

      ch.timelineEvents?.forEach((ev) => {
        items.push({
          id: `seerah-ev-${ev.id}`,
          category: "seerah_event",
          categoryLabelAr: "محطة تاريخية",
          title: ev.title,
          excerpt: ev.description,
          path: `/seerah`,
          sourceIdentifier: ev.date,
          provenance: "التسلسل الزمني النبوي الشريف",
        });
      });
    });

    // 2. Curated Books
    const books = (booksData as any).books || [];
    books.forEach((b: any) => {
      items.push({
        id: `book-${b.id}`,
        category: "book",
        categoryLabelAr: "كتاب في مكتبة الرفوف",
        title: b.title,
        excerpt: `${b.author} — ${b.description?.slice(0, 100)}...`,
        path: `/library`,
        sourceIdentifier: b.category,
        provenance: `مكتبة الرفوف — طبعة معتمدة (${b.pages || 0} ص)`,
      });
    });

    // 3. Children content
    childrenVideos.forEach((v) => {
      items.push({
        id: `kids-${v.id}`,
        category: "kids",
        categoryLabelAr: "واحة الأطفال والأسرة",
        title: v.title,
        excerpt: v.description,
        path: `/kids`,
        sourceIdentifier: v.ageRange,
        provenance: "المحتوى التربوي للطفل المسلم",
      });
    });

    // 4. Azkar and daily supplications
    azkarData.forEach((az) => {
      items.push({
        id: `azkar-${az.id}`,
        category: "daily_guidance",
        categoryLabelAr: "هدي وأذكار نبوية",
        title: az.title || "ذكر ودعاء",
        excerpt: az.content?.slice(0, 120) || az.description || "",
        path: `/daily`,
        sourceIdentifier: az.reference,
        provenance: az.reference || "الصحاح والسنن المعتمدة",
      });
    });

    // 5. Institutional wings: real routes only, honestly described.
    // (Merged from the retired InstitutionalSearchDialog so no coverage
    // is lost in the single-owner consolidation.)
    const wings: Array<[string, string, string, string]> = [
      ["who-is-muhammad", "من هو محمد ﷺ؟ (مدخل تعريفي)", "التعريف بالنبي ورسالته الإنسانية", "/who-is-muhammad"],
      ["quran", "رِواق القرآن الكريم", "المصحف وعينة ترجمة إنجليزية؛ التفاسير المحققة قيد الإدخال", "/quran"],
      ["sunnah", "دار الحديث الشريف", "سجلات محلية بدرجاتها ومصادر أحكامها", "/sunnah"],
      ["prophetic-day", "الهدي النبوي اليومي", "ترتيب تعليمي للسنن والعادات الواردة", "/prophetic-day"],
      ["library", "مكتبة الرفوف", "فهرس ببليوغرافي أولي وروابط خارجية", "/library"],
      ["sources", "خزانة المصادر", "سجل التوثيق والحقوق الحي", "/sources"],
    ];
    wings.forEach(([id, title, excerpt, path]) => {
      items.push({
        id: `wing-${id}`,
        category: "wing",
        categoryLabelAr: "أروقة الصرح",
        title,
        excerpt,
        path,
        provenance: "التنقل المؤسسي",
      });
    });

    return items;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allIndexedItems.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesQuery =
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        (item.sourceIdentifier && item.sourceIdentifier.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [allIndexedItems, query, selectedCategory]);

  const CATEGORY_TABS = [
    { id: "all", label: "الكل" },
    { id: "seerah_event", label: "السيرة النبوية" },
    { id: "book", label: "المكتبة والكتب" },
    { id: "daily_guidance", label: "الأذكار والهدي" },
    { id: "kids", label: "ركن الطفل" },
    { id: "wing", label: "الأروقة" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-lg font-cairo font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              البحث المؤسسي الجامع
            </span>
            <span className="text-xs font-normal text-muted-foreground font-mono">
              يا رسول الله ﷺ
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Input Bar */}
        <div className="relative mt-3">
          <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في السيرة النبوية، الكتب، الأحاديث، الأذكار، المصادر..."
            className="pr-10 pl-10 text-base font-cairo h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-3.5 top-3.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b text-xs font-cairo">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? "bg-emerald-700 text-white font-bold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 mt-2 pr-1">
          {query.trim() === "" ? (
            <div className="text-center py-10 text-muted-foreground font-cairo text-sm">
              <Compass className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              أدخل كلمة أو عبارة للبحث في كافة السجلات الموثقة
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-cairo text-sm">
              لم نعثر على نتائج مطابقة لـ «{query}» في المصادر المعتمدة حالياً.
            </div>
          ) : (
            filteredResults.map((result) => (
              <Link
                key={result.id}
                href={result.path}
                onClick={onClose}
                className="block p-3 rounded-xl border border-border/70 hover:border-emerald-600 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all group text-right"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[11px] font-tajawal font-medium">
                    {result.categoryLabelAr}
                  </Badge>
                  {result.sourceIdentifier && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {result.sourceIdentifier}
                    </span>
                  )}
                </div>
                <h4 className="font-cairo font-bold text-base text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {result.title}
                </h4>
                <p className="text-xs text-muted-foreground font-tajawal line-clamp-2 mt-1 leading-relaxed">
                  {result.excerpt}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>المصدر: {result.provenance}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
