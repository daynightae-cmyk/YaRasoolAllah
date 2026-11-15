import React, { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Compass,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  buildGlobalSearchIndex,
  filterGlobalSearchResults,
  GLOBAL_SEARCH_CATEGORY_TABS,
  type SearchResultCategory,
} from "./global-search-index";

export type {
  SearchResultCategory,
  UnifiedSearchResult,
} from "./global-search-index";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | SearchResultCategory>("all");

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

  // The legacy dialog consumes the canonical institution index through a small
  // compatibility adapter, so entity identity, paths, availability, and review
  // state cannot drift between the dialog and Basirah.
  const allIndexedItems = useMemo(() => buildGlobalSearchIndex(), []);
  const filteredResults = useMemo(
    () => filterGlobalSearchResults(allIndexedItems, query, selectedCategory),
    [allIndexedItems, query, selectedCategory],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-lg font-cairo font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              البحث المؤسسي الجامع
            </span>
            <span className="text-xs font-normal text-muted-foreground font-mono">
              يا رسول الله ﷺ
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            ابحث في السجلات المؤسسية الموثقة وافتح نتائج القرآن أو بصيرة مع الحفاظ على معرّف المصدر.
          </DialogDescription>
        </DialogHeader>

        {/* Input Bar */}
        <div className="relative mt-3">
          <label htmlFor="global-institutional-search" className="sr-only">
            نص البحث المؤسسي
          </label>
          <Search
            className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="global-institutional-search"
            name="global-institutional-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في السيرة النبوية، الكتب، الأحاديث، الأذكار، المصادر..."
            className="pr-10 pl-12 text-base font-cairo h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            autoComplete="off"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="مسح نص البحث"
              className="absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto py-2 border-b text-xs font-cairo"
          role="group"
          aria-label="تصفية نتائج البحث حسب النوع"
        >
          {GLOBAL_SEARCH_CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selectedCategory === tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`min-h-11 px-3 py-1 rounded-full whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
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
          {query.trim() ? (
            <p className="sr-only" role="status" aria-live="polite">
              {filteredResults.length} نتيجة مطابقة
            </p>
          ) : null}
          {query.trim() === "" ? (
            <div className="text-center py-10 text-muted-foreground font-cairo text-sm">
              <Compass className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" aria-hidden="true" />
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
                <h3 className="font-cairo font-bold text-base text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {result.title}
                </h3>
                <p className="text-xs text-muted-foreground font-tajawal line-clamp-2 mt-1 leading-relaxed">
                  {result.excerpt}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
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
