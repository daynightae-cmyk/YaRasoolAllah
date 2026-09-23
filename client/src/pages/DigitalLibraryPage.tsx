import React, { useEffect, useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import SourceDrawer, { SourceProvenanceItem } from "@/components/common/SourceDrawer";
import RealisticBookshelf, { LibraryBook } from "@/components/Library/RealisticBookshelf";
import ReadingDeskModal from "@/components/Library/ReadingDeskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import booksData from "@/data/books.json";
import {
  Library,
  Search,
  BookOpen,
  Filter,
  Grid3X3,
  Layers,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Download,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DigitalLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeMode, setActiveMode] = useState<"shelves" | "catalog">("shelves");
  const [selectedBookForDesk, setSelectedBookForDesk] = useState<LibraryBook | null>(null);
  const [selectedSourceForDrawer, setSelectedSourceForDrawer] = useState<SourceProvenanceItem | null>(null);

  const allBooks: LibraryBook[] = booksData.books as LibraryBook[];

  // Filtered books for structured catalog view
  const filteredBooks = allBooks.filter((book) => {
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.investigator && book.investigator.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Shelf group sets for the Living Shelves View
  const seerahBooks = allBooks.filter((b) => b.category === "seerah");
  const hadithBooks = allBooks.filter((b) => b.category === "hadith");
  const quranBooks = allBooks.filter((b) => b.category === "quran");
  const fiqhBooks = allBooks.filter((b) => b.category === "fiqh" || b.category === "aqeedah");
  const tazkiyahHistoryBooks = allBooks.filter(
    (b) => b.category === "tazkiyah" || b.category === "history" || b.category === "language"
  );

  const handleInspectProvenance = (book: LibraryBook) => {
    setSelectedSourceForDrawer({
      id: `LIB-${book.id}`,
      title: book.title,
      compilerAr: book.author,
      collectionNameAr: book.category,
      referenceNumber: `LIB-${book.id.toUpperCase()}`,
      chapterNameAr: book.edition,
      status: "editorial_review_pending",
      reviewNote: "بيانات هذا السجل الببليوغرافي بانتظار مراجعة حقوق النسخة ومعلومات النشر.",
      textAr: book.description,
      textEn: book.descriptionEn,
      provenanceDataset: "فهرس مكتبة الرفوف — سجل يحتاج مراجعة تحريرية",
    });
  };

  const handleOpenExternalSource = (book: LibraryBook) => {
    if (book.downloadUrl) {
      window.open(book.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <InstitutionShell activeWing="library">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Institutional Grand Header */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-stone-950 via-[#18110b] to-stone-950 border border-amber-900/30 text-amber-50 shadow-2xl overflow-hidden space-y-6">
          {/* Subtle Golden Radial Glow */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 opacity-15 pointer-events-none rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-mono text-amber-300">
                  فهرس التراث والمخطوطات
                </span>
                <span className="text-stone-500 text-xs">·</span>
                <span className="text-xs font-tajawal text-stone-300">
                  {allBooks.length} سجلًا ببليوغرافيًا
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold text-white tracking-tight leading-tight">
                خزانة الرفوف الرقمية وأمهات المصادر
              </h1>
              <p className="text-sm md:text-base font-tajawal text-stone-300 leading-relaxed">
                فهرس استكشافي لسجلات السيرة والحديث والفقه والتفسير. توفر النصوص الكاملة وحقوقها وحالة مراجعتها يبيّن لكل سجل عند تحققها.
              </p>
            </div>

            {/* Seamless Dual-Mode Segmented Switch */}
            <div className="p-1.5 rounded-2xl bg-black/60 border border-amber-500/25 inline-flex self-start lg:self-auto gap-1 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveMode("shelves")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-cairo font-semibold transition-all duration-200 flex items-center gap-2",
                  activeMode === "shelves"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-950/40"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>أروقة الرفوف الحية</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("catalog")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-cairo font-semibold transition-all duration-200 flex items-center gap-2",
                  activeMode === "catalog"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-950/40"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                )}
              >
                <Grid3X3 className="w-4 h-4 text-amber-300" />
                <span>الفهرس المصنف المنظم</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODE 1: LIVING SHELVES VIEW (Real Physical Shelves with 3D Spines) */}
        {/* ============================================================== */}
        {activeMode === "shelves" && (
          <div className="space-y-14 animate-fade-in">
            {/* Shelf 1: Seerah & Shama'il */}
            <RealisticBookshelf
              shelfTitleAr="رِواق السيرة النبوية والشمائل الشريفة"
              shelfTitleEn="Prophetic Seerah & Sublime Shama'il"
              shelfDescriptionAr="أمهات المراجع التوثيقية لسيرة المصطفى ﷺ، من سيرة ابن هشام والروض الأنف إلى زاد المعاد والرحيق المختوم."
              books={seerahBooks}
              onSelectBook={(book) => setSelectedBookForDesk(book)}
              onReadBook={(book) => setSelectedBookForDesk(book)}
              onDownloadBook={handleOpenExternalSource}
              onInspectProvenance={handleInspectProvenance}
            />

            {/* Shelf 2: Hadith & Sunnah */}
            <RealisticBookshelf
              shelfTitleAr="خزانة الحديث الشريف وصحيح الرواية"
              shelfTitleEn="Prophetic Sunnah & Canonical Compilations"
              shelfDescriptionAr="الجوامع والسنن والمسانيد، في مقدمتها الصحيحان وسنن أبي داود والترمذي والنسائي وابن ماجه."
              books={hadithBooks}
              onSelectBook={(book) => setSelectedBookForDesk(book)}
              onReadBook={(book) => setSelectedBookForDesk(book)}
              onDownloadBook={handleOpenExternalSource}
              onInspectProvenance={handleInspectProvenance}
            />

            {/* Shelf 3: Quran Sciences & Tafsir */}
            <RealisticBookshelf
              shelfTitleAr="رِواق التفسير وعلوم التنزيل العظيم"
              shelfTitleEn="Quranic Exegesis & Revelation Sciences"
              shelfDescriptionAr="تفاسير أئمة أهل السنة المعتمدة: تفسير الطبري، ابن كثير، القرطبي، والسعدي، وعلوم القرآن للإتقان."
              books={quranBooks}
              onSelectBook={(book) => setSelectedBookForDesk(book)}
              onReadBook={(book) => setSelectedBookForDesk(book)}
              onDownloadBook={handleOpenExternalSource}
              onInspectProvenance={handleInspectProvenance}
            />

            {/* Shelf 4: Fiqh & Usul */}
            <RealisticBookshelf
              shelfTitleAr="ديوان الفقه وأصول الاستنباط وقواعد الأحكام"
              shelfTitleEn="Jurisprudence, Legal Maxims & Foundations"
              shelfDescriptionAr="المتون الفقهية الكبرى للمذاهب الأربعة وأصول الفقه المعتمدة في الاستنباط الشرعي الرصين."
              books={fiqhBooks}
              onSelectBook={(book) => setSelectedBookForDesk(book)}
              onReadBook={(book) => setSelectedBookForDesk(book)}
              onDownloadBook={handleOpenExternalSource}
              onInspectProvenance={handleInspectProvenance}
            />

            {/* Shelf 5: Tazkiyah, History & Arabic */}
            <RealisticBookshelf
              shelfTitleAr="خزانة التزكية والآداب وتاريخ الأمة واللغة"
              shelfTitleEn="Spiritual Purification, Islamic History & Lexicons"
              shelfDescriptionAr="كتب الرقائق ومكارم الأخلاق النبوية وتاريخ صدر الإسلام والمعاجم اللغوية الشاملة."
              books={tazkiyahHistoryBooks}
              onSelectBook={(book) => setSelectedBookForDesk(book)}
              onReadBook={(book) => setSelectedBookForDesk(book)}
              onDownloadBook={handleOpenExternalSource}
              onInspectProvenance={handleInspectProvenance}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: STRUCTURED SCHOLARLY CATALOG (Filterable Tabular Grid) */}
        {/* ============================================================== */}
        {activeMode === "catalog" && (
          <div className="space-y-8 animate-fade-in">
            {/* Search & Category Filter Bar */}
            <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="ابحث بالعنوان، أو اسم المصنّف، أو المحقق..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 font-tajawal text-sm bg-background border-border"
                  />
                </div>

                {/* Categories Segmented Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "جميع الأقسام" },
                    { id: "seerah", label: "السيرة والشمائل" },
                    { id: "hadith", label: "الحديث والسنة" },
                    { id: "quran", label: "القرآن والتفسير" },
                    { id: "fiqh", label: "الفقه وأصوله" },
                    { id: "tazkiyah", label: "التزكية والأخلاق" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-tajawal font-medium whitespace-nowrap transition-colors",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counter Indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span>تم العثور على {filteredBooks.length} كتاباً</span>
                  {searchQuery && (
                    <>
                      <span>·</span>
                      <span>تصفية البحث: «{searchQuery}»</span>
                    </>
                  )}
                </div>
                <span>التصنيف المعتمد: الخزانة التراثية الشاملة</span>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="rounded-2xl border border-border bg-card p-5 hover:border-amber-500/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono text-primary font-bold">{book.format.toUpperCase()}</span>
                          <span>·</span>
                          <span>{book.publishedYear}م</span>
                          <span>·</span>
                          <span>{book.pages} ص</span>
                        </div>
                        <h3 className="text-lg font-amiri font-bold text-foreground group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs font-tajawal text-muted-foreground">
                          {book.author}
                        </p>
                      </div>

                      {/* Mini Book Icon Emblem */}
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-amiri font-bold text-base flex-shrink-0">
                        📖
                      </div>
                    </div>

                    {/* Book Synopsis */}
                    <p className="text-xs font-tajawal text-muted-foreground line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>

                    {/* Investigator info if available */}
                    {book.investigator && (
                      <p className="text-[11px] font-tajawal text-stone-500 dark:text-stone-400 pt-1">
                        المحقق: {book.investigator}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/70">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-tajawal gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleInspectProvenance(book)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>المصدر</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-tajawal gap-1"
                        onClick={() => handleOpenExternalSource(book)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>مصدر خارجي</span>
                      </Button>

                      <Button
                        size="sm"
                        className="h-8 text-xs font-tajawal font-bold gap-1 bg-primary text-primary-foreground"
                        onClick={() => setSelectedBookForDesk(book)}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>المطالعة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <h3 className="text-base font-bold font-cairo">لا توجد مصنفات مطابقة لبحثك</h3>
                <p className="text-xs font-tajawal text-muted-foreground max-w-sm mx-auto">
                  حاول تغيير مصطلح البحث أو اختيار قسم مختلف للوصول إلى كتب التراث المحققة.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="font-tajawal text-xs"
                >
                  إعادة ضبط البحث
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Reading Desk Modal (Opened when book is selected from shelf or catalog) */}
        <ReadingDeskModal
          book={selectedBookForDesk}
          isOpen={!!selectedBookForDesk}
          onClose={() => setSelectedBookForDesk(null)}
          onOpenExternalSource={handleOpenExternalSource}
          onInspectProvenance={handleInspectProvenance}
        />

        {/* Academic SourceDrawer */}
        <SourceDrawer
          source={selectedSourceForDrawer}
          isOpen={!!selectedSourceForDrawer}
          onClose={() => setSelectedSourceForDrawer(null)}
          viewMode="general"
        />

      </div>
    </InstitutionShell>
  );
}
