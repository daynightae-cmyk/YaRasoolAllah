import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getQuranChapters,
  getQuranVerse,
  searchQuran,
  getTafsir,
  type QuranChapter,
  type QuranVerse,
} from "@/services/quranService";
import { QuranSearch } from "@/components/Search/QuranSearch";
import { cn } from "@/lib/utils";

interface TafsirScholar {
  id: string;
  name: string;
  arabicName: string;
  description: string;
}

const tafsirScholars: TafsirScholar[] = [
  {
    id: "ibn-kathir",
    name: "Ibn Kathir",
    arabicName: "ابن كثير",
    description: "Comprehensive classical commentary",
  },
  {
    id: "tabari",
    name: "Al-Tabari",
    arabicName: "الطبري",
    description: "Historical and linguistic interpretation",
  },
  {
    id: "qurtubi",
    name: "Al-Qurtubi",
    arabicName: "القرطبي",
    description: "Juridical and practical commentary",
  },
  {
    id: "saadi",
    name: "As-Sa'di",
    arabicName: "السعدي",
    description: "Modern clear explanation",
  },
];

const translationLanguages = [
  { code: "en", name: "English", arabicName: "الإنجليزية" },
  { code: "fr", name: "French", arabicName: "الفرنسية" },
  { code: "ur", name: "Urdu", arabicName: "الأردية" },
  { code: "tr", name: "Turkish", arabicName: "التركية" },
  { code: "es", name: "Spanish", arabicName: "الإسبانية" },
];

export default function QuranPage() {
  const { updateLastVisited } = useProgress();
  const { t, isRTL } = useLanguage();

  const [selectedChapter, setSelectedChapter] = useState<QuranChapter | null>(
    null,
  );
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTafsir, setSelectedTafsir] = useState("ibn-kathir");
  const [selectedTranslation, setSelectedTranslation] = useState("en");
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("reading");

  useEffect(() => {
    updateLastVisited("/quran");
  }, [updateLastVisited]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("quran-bookmarks");
    if (savedBookmarks) {
      setBookmarkedVerses(JSON.parse(savedBookmarks));
    }
  }, []);

  const { data: chapters = [] } = useQuery({
    queryKey: ["/api/quran/chapters"],
    queryFn: getQuranChapters,
  });

  const { data: verse, isLoading: verseLoading } = useQuery({
    queryKey: ["/api/quran/verse", selectedChapter?.number, currentVerse],
    queryFn: () =>
      selectedChapter
        ? getQuranVerse(selectedChapter.number, currentVerse)
        : null,
    enabled: !!selectedChapter,
  });

  const { data: tafsirText } = useQuery({
    queryKey: [
      "/api/quran/tafsir",
      selectedChapter?.number,
      currentVerse,
      selectedTafsir,
    ],
    queryFn: () =>
      selectedChapter
        ? getTafsir(selectedChapter.number, currentVerse, selectedTafsir)
        : null,
    enabled: !!selectedChapter && showTafsir,
  });

  const handleChapterSelect = (chapter: QuranChapter) => {
    setSelectedChapter(chapter);
    setCurrentVerse(1);
    setShowTafsir(false);
  };

  const handleVerseNavigation = (direction: "prev" | "next") => {
    if (!selectedChapter) return;

    if (direction === "next" && currentVerse < selectedChapter.ayahCount) {
      setCurrentVerse((prev) => prev + 1);
    } else if (direction === "prev" && currentVerse > 1) {
      setCurrentVerse((prev) => prev - 1);
    }
  };

  const toggleBookmark = (surah: number, ayah: number) => {
    const bookmarkId = `${surah}-${ayah}`;
    const newBookmarks = bookmarkedVerses.includes(bookmarkId)
      ? bookmarkedVerses.filter((id) => id !== bookmarkId)
      : [...bookmarkedVerses, bookmarkId];

    setBookmarkedVerses(newBookmarks);
    localStorage.setItem("quran-bookmarks", JSON.stringify(newBookmarks));
  };

  const isBookmarked = (surah: number, ayah: number) => {
    return bookmarkedVerses.includes(`${surah}-${ayah}`);
  };

  const getChapterTypeColor = (type: "meccan" | "medinan") => {
    return type === "meccan"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-float-delayed"></div>

        {/* Islamic pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-15c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">
                  menu_book
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                  القرآن الكريم
                </h1>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-3xl mx-auto leading-relaxed">
              اقرأ وتدبر كلام الله العزيز مع التفاسير الموثوقة والترجمات
              المعتمدة
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  114
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  سورة
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  6,236
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  آية
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {bookmarkedVerses.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  محفوظة
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="reading" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  menu_book
                </span>
                القراءة والتدبر
              </TabsTrigger>
              <TabsTrigger value="search" className="font-amiri">
                <span className="material-symbols-outlined mr-2">search</span>
                البحث المتقدم
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  bookmarks
                </span>
                الآيات المحفوظة
              </TabsTrigger>
            </TabsList>

            {/* Reading Tab */}
            <TabsContent value="reading" className="space-y-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Chapters List */}
                <div className="lg:col-span-1">
                  <Card className="h-[600px]">
                    <CardHeader className="pb-4">
                      <CardTitle className="font-amiri text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600">
                            list
                          </span>
                          فهرس السور
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px] px-4">
                        <div className="space-y-2">
                          {chapters.map((chapter) => (
                            <button
                              key={chapter.number}
                              onClick={() => handleChapterSelect(chapter)}
                              className={cn(
                                "w-full p-4 rounded-lg text-right border transition-all duration-200 hover:scale-[1.02]",
                                selectedChapter?.number === chapter.number
                                  ? "bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border-emerald-200 dark:border-emerald-700"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className={`${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <h3 className="font-amiri font-bold text-gray-900 dark:text-white">
                                    {chapter.number}. {chapter.arabicName}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                    {chapter.englishName} • {chapter.ayahCount}{" "}
                                    آية
                                  </p>
                                  <Badge
                                    className={cn(
                                      "text-xs mt-1",
                                      getChapterTypeColor(
                                        chapter.revelationType,
                                      ),
                                    )}
                                  >
                                    {chapter.revelationType === "meccan"
                                      ? "مكية"
                                      : "مدنية"}
                                  </Badge>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-800 dark:to-blue-800 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 dark:text-emerald-300 font-bold text-sm">
                                    {chapter.number}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Verse Display */}
                <div className="lg:col-span-3">
                  {selectedChapter ? (
                    <Card className="min-h-[600px]">
                      <CardHeader className="text-center border-b">
                        <div className="space-y-4">
                          <div>
                            <h2 className="text-3xl font-amiri font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                              سورة {selectedChapter.arabicName}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-inter">
                              {selectedChapter.englishName} •{" "}
                              {selectedChapter.ayahCount} آية •{" "}
                              {selectedChapter.revelationType === "meccan"
                                ? "مكية"
                                : "مدنية"}
                            </p>
                          </div>

                          {/* Settings Row */}
                          <div className="flex flex-wrap items-center justify-center gap-4">
                            <Select
                              value={selectedTranslation}
                              onValueChange={setSelectedTranslation}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {translationLanguages.map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.arabicName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={selectedTafsir}
                              onValueChange={setSelectedTafsir}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tafsirScholars.map((scholar) => (
                                  <SelectItem
                                    key={scholar.id}
                                    value={scholar.id}
                                  >
                                    {scholar.arabicName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button
                              variant={showTafsir ? "default" : "outline"}
                              onClick={() => setShowTafsir(!showTafsir)}
                              className="text-sm"
                            >
                              <span className="material-symbols-outlined mr-2 text-sm">
                                library_books
                              </span>
                              التفسير
                            </Button>
                          </div>

                          {/* Bismillah for applicable surahs */}
                          {selectedChapter.number !== 1 &&
                            selectedChapter.number !== 9 && (
                              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
                                <p className="text-2xl font-amiri text-emerald-700 dark:text-emerald-400 text-center leading-relaxed">
                                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </p>
                              </div>
                            )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-8">
                        {verseLoading ? (
                          <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                          </div>
                        ) : verse ? (
                          <div className="space-y-8">
                            {/* Arabic Verse */}
                            <div className="text-center space-y-4">
                              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-8 border">
                                <p className="text-3xl md:text-4xl font-amiri leading-loose text-gray-900 dark:text-white verse-text">
                                  {verse.arabic}
                                  <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-full text-lg font-bold mx-3 shadow-lg">
                                    {verse.ayah}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Translation */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-blue-600">
                                  translate
                                </span>
                                <h4 className="font-amiri font-semibold text-blue-700 dark:text-blue-400">
                                  الترجمة -{" "}
                                  {
                                    translationLanguages.find(
                                      (l) => l.code === selectedTranslation,
                                    )?.arabicName
                                  }
                                </h4>
                              </div>
                              <p className="text-lg font-inter leading-relaxed text-gray-700 dark:text-gray-300">
                                {verse.translation}
                              </p>
                              {verse.transliteration && (
                                <p className="text-gray-500 dark:text-gray-400 font-inter mt-3 italic">
                                  {verse.transliteration}
                                </p>
                              )}
                            </div>

                            {/* Tafsir */}
                            {showTafsir && (
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="material-symbols-outlined text-amber-600">
                                    auto_stories
                                  </span>
                                  <h4 className="font-amiri font-semibold text-amber-700 dark:text-amber-400">
                                    التفسير -{" "}
                                    {
                                      tafsirScholars.find(
                                        (s) => s.id === selectedTafsir,
                                      )?.arabicName
                                    }
                                  </h4>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                                  {tafsirText ||
                                    verse.tafsir ||
                                    "التفسير غير متوفر حالياً لهذه الآية"}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                size="sm"
                                variant={
                                  isBookmarked(verse.surah, verse.ayah)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  toggleBookmark(verse.surah, verse.ayah)
                                }
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <span className="material-symbols-outlined text-sm mr-2">
                                  {isBookmarked(verse.surah, verse.ayah)
                                    ? "bookmark"
                                    : "bookmark_add"}
                                </span>
                                {isBookmarked(verse.surah, verse.ayah)
                                  ? "محفوظة"
                                  : "حفظ"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600"
                              >
                                <span className="material-symbols-outlined text-sm mr-2">
                                  volume_up
                                </span>
                                استماع
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600"
                              >
                                <span className="material-symbols-outlined text-sm mr-2">
                                  share
                                </span>
                                مشاركة
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600"
                              >
                                <span className="material-symbols-outlined text-sm mr-2">
                                  content_copy
                                </span>
                                نسخ
                              </Button>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                variant="outline"
                                onClick={() => handleVerseNavigation("prev")}
                                disabled={currentVerse === 1}
                                className="flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined">
                                  navigate_before
                                </span>
                                الآية السابقة
                              </Button>

                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  الآية {currentVerse} من{" "}
                                  {selectedChapter.ayahCount}
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={selectedChapter.ayahCount}
                                  value={currentVerse}
                                  onChange={(e) =>
                                    setCurrentVerse(
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  className="w-20 text-center"
                                />
                              </div>

                              <Button
                                variant="outline"
                                onClick={() => handleVerseNavigation("next")}
                                disabled={
                                  currentVerse === selectedChapter.ayahCount
                                }
                                className="flex items-center gap-2"
                              >
                                الآية التالية
                                <span className="material-symbols-outlined">
                                  navigate_next
                                </span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                              error
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 font-inter">
                              لم يتم العثور على الآية المطلوبة
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-[600px] flex items-center justify-center">
                      <CardContent className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-800 dark:to-blue-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                          <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">
                            menu_book
                          </span>
                        </div>
                        <h3 className="text-2xl font-amiri font-bold text-gray-600 dark:text-gray-400 mb-4">
                          اختر سورة للقراءة
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 font-inter max-w-md mx-auto leading-relaxed">
                          اختر سورة من القائمة على اليسار لبدء القراءة والتدبر
                          مع التفاسير الموثوقة
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-6">
              <QuranSearch />

              {/* Advanced Search Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">
                      tune
                    </span>
                    خيارات البحث المتقدم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-amiri font-semibold mb-3">
                        البحث حسب الموضوع
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "الصبر",
                          "الجنة",
                          "الرحمة",
                          "الإيمان",
                          "التوبة",
                          "الصلاة",
                          "الزكاة",
                          "الحج",
                        ].map((topic) => (
                          <Button
                            key={topic}
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery(topic)}
                            className="justify-start"
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-amiri font-semibold mb-3">
                        بحث متقدم
                      </h4>
                      <div className="space-y-3">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="نوع السورة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meccan">مكية</SelectItem>
                            <SelectItem value="medinan">مدنية</SelectItem>
                            <SelectItem value="all">الكل</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="طول السورة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">
                              قصيرة (أقل من 50 آية)
                            </SelectItem>
                            <SelectItem value="medium">
                              متوسطة (50-100 آية)
                            </SelectItem>
                            <SelectItem value="long">
                              طويلة (أكثر من 100 آية)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        bookmarks
                      </span>
                      الآيات المحفوظة
                    </div>
                    <Badge variant="secondary">
                      {bookmarkedVerses.length} آية
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookmarkedVerses.length > 0 ? (
                    <div className="space-y-4">
                      {bookmarkedVerses.map((bookmarkId) => {
                        const [surah, ayah] = bookmarkId.split("-").map(Number);
                        const chapter = chapters.find(
                          (c) => c.number === surah,
                        );

                        return (
                          <div
                            key={bookmarkId}
                            className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-amiri font-semibold text-emerald-700 dark:text-emerald-400">
                                {chapter?.arabicName} - الآية {ayah}
                              </h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleBookmark(surah, ayah)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <span className="material-symbols-outlined">
                                  bookmark_remove
                                </span>
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                              انقر للانتقال إلى الآية في صفحة القراءة
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                        bookmark_border
                      </span>
                      <h3 className="text-xl font-amiri font-bold text-gray-600 dark:text-gray-400 mb-2">
                        لا توجد آيات محفوظة
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 font-inter">
                        احفظ الآيات المفضلة لديك للوصول إليها بسهولة
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
