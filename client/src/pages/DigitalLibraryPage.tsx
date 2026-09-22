import { useEffect, useState, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "wouter";
import booksData from "../data/books.json";
import { quranRecitations, getFeaturedReciters } from "../data/quranAudio";

// Lazy loading للمكونات
const BookCard = lazy(() => import("../components/Library/BookCard"));
const AudioPlayer = lazy(() => import("../components/Library/AudioPlayer"));
const BookReader = lazy(() => import("../components/Library/BookReader"));
const DownloadManager = lazy(
  () => import("../components/Library/DownloadManager"),
);

interface Book {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  authorEn: string;
  category: string;
  language: string;
  format: string;
  pages: number;
  description: string;
  descriptionEn: string;
  downloadUrl: string;
  coverImage: string;
  tags: string[];
  publishedYear: number;
  size: string;
  isAudioAvailable: boolean;
  audioUrl?: string;
  rating: number;
  downloads: number;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function DigitalLibraryPage() {
  const { updateLastVisited, completeLesson } = useProgress();
  const { direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "title" | "downloads" | "rating" | "year"
  >("downloads");
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  useEffect(() => {
    updateLastVisited("/digital-library");
    // محاكاة تحميل البيانات
    setTimeout(() => setIsLoading(false), 1000);
  }, [updateLastVisited]);

  const categories: Category[] = booksData.categories;
  const books: Book[] = booksData.books;

  // تصفية وترتيب الكتب
  const filteredBooks = books
    .filter((book) => {
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "downloads":
          return b.downloads - a.downloads;
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.publishedYear - a.publishedYear;
        default:
          return 0;
      }
    });

  const handleBookRead = (book: Book) => {
    setSelectedBook(book);
    completeLesson(`book-${book.id}`);
  };

  const handleDownload = async (book: Book) => {
    try {
      // إحصائية التحميل
      completeLesson(`download-${book.id}`);

      // فتح رابط التحميل في تبويب جديد
      window.open(book.downloadUrl, "_blank");

      // إشعار نجاح
      console.log(`تم بدء تحميل: ${book.title}`);
    } catch (error) {
      console.error("خطأ في التحميل:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950 dark:via-gray-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
              local_library
            </span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              المكتبة الرقمية الشاملة
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            📚 الكتاب المبين - المكتبة الإسلامية الرقمية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-3xl mx-auto">
            مكتبة شاملة تضم أهم الكتب والمؤلفات الإسلامية من القرآن والحديث
            والفقه والعقيدة والسيرة النبوية
          </p>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">
                {books.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                كتاب
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ��صنيف
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {books
                  .reduce((sum, book) => sum + book.downloads, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                تحميل
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {books.filter((book) => book.isAudioAvailable).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                كتاب صوتي
              </div>
            </div>
          </div>
        </div>

        {/* قسم القرآن الكريم الصوتي */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🎧</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-amiri mb-2">
                      القرآن الكريم الصوتي
                    </h2>
                    <p className="text-emerald-100 font-inter">
                      استمع إلى القرآن الكريم بأصوات أشهر القراء مع إمكانية
                      تخصيص القارئ المفضل
                    </p>
                  </div>
                </div>
                <Link href="/quran-audio">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-emerald-600 hover:bg-emerald-50 font-amiri"
                  >
                    استمع الآن
                  </Button>
                </Link>
              </div>

              {/* القراء المميزون */}
              <div className="mt-8">
                <h3 className="text-xl font-bold font-amiri mb-4 text-emerald-100">
                  القراء المميزون
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getFeaturedReciters().map((reciter) => (
                    <div
                      key={reciter.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">🎙️</span>
                      </div>
                      <h4 className="font-bold font-amiri text-sm mb-1">
                        {reciter.reciterName}
                      </h4>
                      <p className="text-emerald-100 text-xs font-inter">
                        {reciter.country}
                      </p>
                      <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mt-2 text-xs">
                        <span>⭐</span>
                        <span>{reciter.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">
                      {quranRecitations.length}
                    </div>
                    <div className="text-emerald-100">قارئ متاح</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">114</div>
                    <div className="text-emerald-100">سورة كاملة</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">مجاني</div>
                    <div className="text-emerald-100">100% تحميل</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والفلترة */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="ابحث في المكتبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${direction === "rtl" ? "text-right pr-12" : "text-left pl-12"}`}
                />
                <span
                  className={`material-symbols-outlined absolute ${direction === "rtl" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400`}
                >
                  search
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="downloads">الأكثر تحميلاً</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="title">ترتيب أبجدي</option>
                  <option value="year">الأحدث</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowDownloadManager(true)}
                  className="text-blue-600"
                >
                  <span className="material-symbols-outlined">download</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                >
                  <span className="material-symbols-outlined">
                    {viewMode === "grid" ? "view_list" : "grid_view"}
                  </span>
                </Button>
              </div>
            </div>

            {/* تصنيفات الكتب */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`h-auto p-3 ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <div className="text-center w-full">
                  <span className="material-symbols-outlined text-xl mb-1 block">
                    category
                  </span>
                  <span className="font-amiri text-xs block">الكل</span>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {books.length}
                  </Badge>
                </div>
              </Button>

              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-auto p-3 ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-600 text-white`
                      : `text-${category.color}-600 dark:text-${category.color}-400`
                  }`}
                >
                  <div className="text-center w-full">
                    <span className="material-symbols-outlined text-xl mb-1 block">
                      {category.icon}
                    </span>
                    <span className="font-amiri text-xs block">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {
                        books.filter((book) => book.category === category.id)
                          .length
                      }
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الكتب المميزة */}
        {selectedCategory === "all" && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-amiri font-bold text-gray-900 dark:text-white mb-6">
              📖 الكتب المميزة
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books
                .filter((book) => book.featured)
                .map((book) => (
                  <Suspense
                    key={book.id}
                    fallback={<Skeleton className="h-96 w-full" />}
                  >
                    <BookCard
                      book={book}
                      onRead={() => handleBookRead(book)}
                      onDownload={() => handleDownload(book)}
                      featured={true}
                    />
                  </Suspense>
                ))}
            </div>
          </div>
        )}

        {/* شبكة الكتب */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-amiri font-bold text-gray-900 dark:text-white">
              {selectedCategory === "all"
                ? "جميع الكتب"
                : categories.find((c) => c.id === selectedCategory)?.name}
              <span className="text-lg text-gray-500 mr-2">
                ({filteredBooks.length})
              </span>
            </h2>
          </div>

          <div
            className={`grid ${
              viewMode === "grid"
                ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            } gap-6`}
          >
            {filteredBooks.map((book) => (
              <Suspense
                key={book.id}
                fallback={<Skeleton className="h-96 w-full" />}
              >
                <BookCard
                  book={book}
                  onRead={() => handleBookRead(book)}
                  onDownload={() => handleDownload(book)}
                  viewMode={viewMode}
                />
              </Suspense>
            ))}
          </div>
        </div>

        {/* رسالة عدم وجود نتائج */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
              search_off
            </span>
            <h3 className="text-xl font-amiri font-bold text-gray-600 dark:text-gray-400 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              جرب تغيير مصطلح البحث أو التصنيف
            </p>
          </div>
        )}

        {/* قارئ الكتب */}
        {selectedBook && (
          <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <BookReader
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
            />
          </Suspense>
        )}

        {/* مدير التحميلات */}
        <Suspense fallback={null}>
          <DownloadManager
            isOpen={showDownloadManager}
            onClose={() => setShowDownloadManager(false)}
          />
        </Suspense>
      </div>
    </div>
  );
}
