import React, { useEffect, useState, Suspense, lazy } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import LivingShelf, { LibraryBook } from "@/components/Library/LivingShelf";
import BookCard from "@/components/Library/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import booksData from "@/data/books.json";
import {
  Library,
  Search,
  BookOpen,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BookReader = lazy(() => import("@/components/Library/BookReader"));
const DownloadManager = lazy(() => import("@/components/Library/DownloadManager"));

export default function DigitalLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"shelves" | "catalog">("shelves");
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  const allBooks: LibraryBook[] = booksData.books as LibraryBook[];

  // Filtered books for catalog search
  const filteredBooks = allBooks.filter((book) => {
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Shelf group sets
  const seerahBooks = allBooks.filter((b) => b.category === "seerah");
  const hadithBooks = allBooks.filter((b) => b.category === "hadith");
  const quranBooks = allBooks.filter((b) => b.category === "quran");
  const fiqhAqeedahBooks = allBooks.filter(
    (b) => b.category === "fiqh" || b.category === "aqeedah"
  );

  const handleInspectBookEvidence = (book: LibraryBook) => {
    setSelectedEvidence({
      title: book.title,
      collectionOrWork: book.titleEn || book.title,
      authorOrCompiler: book.author,
      referenceNumber: `LIB-${book.id.toUpperCase()}`,
      originalText: `كتاب: ${book.title}\nالمؤلف: ${book.author}\nالتصنيف: ${book.category}\nعدد الصفحات: ${book.pages} صفحة\nسنة النشر/التحقيق: ${book.publishedYear}م`,
      translationExcerpt: book.descriptionEn || book.description,
      status: "verified",
      provenanceDataset: "المكتبة الرقمية المحققة — صرح يا رسول الله ﷺ",
    });
  };

  return (
    <InstitutionShell activeWing="library">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Institutional Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-900/30 text-amber-50 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-mono text-amber-300">
                  خزانة التراث والمخطوطات
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-tajawal text-slate-300">
                  {allBooks.length} مؤلفاً محققاً
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight text-white">
                خزانة المعرفة والرفوف الرقمية
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 leading-relaxed">
                مكتبة مركزية شاملة لأمهات كتب السيرة والشمائل والحديث والفقه، بطبعات محققة وفهرسة علمية رصينة بدون أي ادعاءات أو تقييمات مصطنعة.
              </p>
            </div>

            {/* Mode Segmented Switch (Shelves vs Catalog) */}
            <div className="p-1 rounded-2xl bg-black/40 border border-amber-500/20 inline-flex self-start md:self-auto gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("shelves")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-cairo transition-all flex items-center gap-2",
                  activeTab === "shelves"
                    ? "bg-amber-600 text-white font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                )}
              >
                <Layers className="w-4 h-4" />
                <span>رفوف المكتبة</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-cairo transition-all flex items-center gap-2",
                  activeTab === "catalog"
                    ? "bg-amber-600 text-white font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>الفهرس والبحث</span>
              </button>
            </div>
          </div>
        </div>

        {/* SHELVES MODE */}
        {activeTab === "shelves" && (
          <div className="space-y-6">
            <LivingShelf
              shelfTitleAr="رف السيرة النبوية والشمائل الشريفة"
              shelfTitleEn="Prophetic Biography & Shama'il"
              shelfDescriptionAr="دراسات موثقة في حياة النبي ﷺ وأخلاقه وشمائله من أمهات المصادر المعتمدة"
              books={seerahBooks}
              onRead={(b) => setSelectedBook(b)}
              onDownload={(b) => handleInspectBookEvidence(b)}
              onInspectEvidence={(b) => handleInspectBookEvidence(b)}
            />

            <LivingShelf
              shelfTitleAr="رف الحديث ودواوين السنة المشرفة"
              shelfTitleEn="Hadith & Prophetic Traditions"
              shelfDescriptionAr="دواوين السنة الستة وشروحها المعتمدة بروايات محققة وتخريج علمي"
              books={hadithBooks}
              onRead={(b) => setSelectedBook(b)}
              onDownload={(b) => handleInspectBookEvidence(b)}
              onInspectEvidence={(b) => handleInspectBookEvidence(b)}
            />

            <LivingShelf
              shelfTitleAr="رف القرآن الكريم وتفاسيره"
              shelfTitleEn="Holy Quran & Exegesis"
              shelfDescriptionAr="المصاحف المرتلة وأصول التفاسير ودراسات علوم القرآن وبيانه"
              books={quranBooks}
              onRead={(b) => setSelectedBook(b)}
              onDownload={(b) => handleInspectBookEvidence(b)}
              onInspectEvidence={(b) => handleInspectBookEvidence(b)}
            />

            <LivingShelf
              shelfTitleAr="رف الفقه والأصول والعقيدة"
              shelfTitleEn="Jurisprudence, Principles & Creed"
              shelfDescriptionAr="أمهات مسائل الفقه الميسر وضوابط الأصول وأصول الاعتقاد الراسخ"
              books={fiqhAqeedahBooks}
              onRead={(b) => setSelectedBook(b)}
              onDownload={(b) => handleInspectBookEvidence(b)}
              onInspectEvidence={(b) => handleInspectBookEvidence(b)}
            />
          </div>
        )}

        {/* CATALOG / SEARCH MODE */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Search & Filter Controls */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالعنوان أو اسم المؤلف أو المحقق..."
                  className="pr-10 h-11 rounded-xl text-sm font-cairo"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-xs font-cairo text-foreground"
                >
                  <option value="all">جميع الأقسام ({allBooks.length})</option>
                  <option value="seerah">السيرة النبوية</option>
                  <option value="hadith">الحديث النبوي</option>
                  <option value="quran">القرآن الكريم</option>
                  <option value="fiqh">الفقه الإسلامي</option>
                  <option value="aqeedah">العقيدة</option>
                </select>

                {/* View Mode Toggle */}
                <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-colors",
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-700 text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label="عرض شبكي"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-colors",
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-700 text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label="عرض قائمة"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Counter (Zero-Pill Unboxed Text) */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-tajawal px-1">
              <div className="flex items-center gap-2">
                <span>النتائج المعروضة:</span>
                <span className="font-mono font-bold text-foreground">
                  {filteredBooks.length}
                </span>
                <span>كتاباً</span>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-amber-700 dark:text-amber-400 hover:underline text-xs"
                >
                  مسح البحث
                </button>
              )}
            </div>

            {/* Book Cards Grid / List */}
            {filteredBooks.length > 0 ? (
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "space-y-4"
                )}
              >
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book as any}
                    onRead={() => setSelectedBook(book)}
                    onDownload={() => handleInspectBookEvidence(book)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              /* Dignified Empty State */
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-border space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Library className="w-6 h-6" />
                </div>
                <h3 className="font-amiri font-bold text-xl text-foreground">
                  لم نعثر على كتب مطابقة لمعايير البحث
                </h3>
                <p className="text-xs font-tajawal text-muted-foreground max-w-sm mx-auto">
                  تأكد من كتابة الكلمات بدقة أو اختر "جميع الأقسام" لاستعراض كامل فهرس المكتبة.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs font-cairo"
                >
                  إعادة ضبط البحث
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Reader Modal */}
      {selectedBook && (
        <Suspense fallback={<Skeleton className="fixed inset-0 z-50" />}>
          <BookReader
            book={selectedBook as any}
            onClose={() => setSelectedBook(null)}
          />
        </Suspense>
      )}

      {/* Evidence Drawer for Verified Editions */}
      <EvidenceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
      />
    </InstitutionShell>
  );
}
