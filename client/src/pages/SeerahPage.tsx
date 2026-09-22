import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  seerahChapters,
  seerahCategories,
  getChaptersByCategory,
  getChapterById,
  getRelatedChapters,
  searchChapters,
  SeerahChapter,
  TimelineEvent,
} from "@/data/seerahData";
import {
  BookOpen,
  Search,
  Clock,
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  Play,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SeerahPage() {
  const { t, isRTL } = useLanguage();
  const { updateLastVisited } = useProgress();

  const [selectedChapter, setSelectedChapter] = useState<SeerahChapter | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState("early-life");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingProgress, setReadingProgress] = useState<
    Record<string, boolean>
  >({});
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    updateLastVisited("/seerah");

    // Load reading progress and bookmarks from localStorage
    const savedProgress = localStorage.getItem("seerah-reading-progress");
    const savedBookmarks = localStorage.getItem("seerah-bookmarks");

    if (savedProgress) {
      setReadingProgress(JSON.parse(savedProgress));
    }
    if (savedBookmarks) {
      setBookmarkedChapters(JSON.parse(savedBookmarks));
    }
  }, [updateLastVisited]);

  const markAsRead = (chapterId: string) => {
    const newProgress = { ...readingProgress, [chapterId]: true };
    setReadingProgress(newProgress);
    localStorage.setItem(
      "seerah-reading-progress",
      JSON.stringify(newProgress),
    );
  };

  const toggleBookmark = (chapterId: string) => {
    const newBookmarks = bookmarkedChapters.includes(chapterId)
      ? bookmarkedChapters.filter((id) => id !== chapterId)
      : [...bookmarkedChapters, chapterId];

    setBookmarkedChapters(newBookmarks);
    localStorage.setItem("seerah-bookmarks", JSON.stringify(newBookmarks));
  };

  const filteredChapters = searchQuery
    ? searchChapters(searchQuery)
    : getChaptersByCategory(selectedCategory);

  const getNextChapter = () => {
    if (!selectedChapter) return null;
    const currentIndex = seerahChapters.findIndex(
      (ch) => ch.id === selectedChapter.id,
    );
    return currentIndex < seerahChapters.length - 1
      ? seerahChapters[currentIndex + 1]
      : null;
  };

  const getPreviousChapter = () => {
    if (!selectedChapter) return null;
    const currentIndex = seerahChapters.findIndex(
      (ch) => ch.id === selectedChapter.id,
    );
    return currentIndex > 0 ? seerahChapters[currentIndex - 1] : null;
  };

  const formatReadingTime = (text: string) => {
    const wordsPerMinute = 200; // Average Arabic reading speed
    const words = text.split(" ").length;
    return Math.ceil(words / wordsPerMinute);
  };

  const renderTimeline = (events: TimelineEvent[]) => (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-lg font-amiri text-gray-900 dark:text-white">
        أحداث مهمة
      </h4>
      <div className="relative">
        <div className="absolute left-4 rtl:right-4 rtl:left-auto top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-blue-500"></div>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="relative flex items-start space-x-4 rtl:space-x-reverse"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10",
                  event.importance === "high"
                    ? "bg-red-500"
                    : event.importance === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500",
                )}
              >
                {index + 1}
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-gray-900 dark:text-white font-amiri">
                    {event.title}
                  </h5>
                  <Badge variant="outline" className="text-xs">
                    {event.date}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-inter">
                  {event.description}
                </p>
                {event.location && (
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1 rtl:ml-1" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (selectedChapter) {
    const relatedChapters = getRelatedChapters(selectedChapter.id);
    const nextChapter = getNextChapter();
    const previousChapter = getPreviousChapter();
    const readingTime = formatReadingTime(selectedChapter.details);

    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-950 dark:via-blue-950 dark:to-purple-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedChapter(null)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <ArrowRight className="w-4 h-4 mr-2 rtl:ml-2 rotate-180 rtl:rotate-0" />
              العودة للفهرس
            </Button>
          </div>

          {/* Chapter Header */}
          <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                    <Badge className="bg-white/20 text-white border-0">
                      الفصل {selectedChapter.order}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0">
                      {selectedChapter.category}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold font-amiri mb-4">
                    {selectedChapter.title}
                  </h1>
                  <p className="text-emerald-100 text-lg font-inter mb-4">
                    {selectedChapter.description}
                  </p>

                  <div className="flex items-center space-x-6 rtl:space-x-reverse text-emerald-100">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{readingTime} دقائق قراءة</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">{selectedChapter.format}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(selectedChapter.id)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Bookmark
                      className={cn(
                        "w-5 h-5",
                        bookmarkedChapters.includes(selectedChapter.id) &&
                          "fill-current",
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter Content */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div
                  className="text-gray-800 dark:text-gray-200 leading-relaxed font-inter text-lg"
                  style={{
                    lineHeight: "2",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {selectedChapter.details
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p key={index} className="mb-6">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>

              {/* Timeline Events */}
              {selectedChapter.timelineEvents &&
                selectedChapter.timelineEvents.length > 0 &&
                renderTimeline(selectedChapter.timelineEvents)}

              {/* Mark as Read */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {!readingProgress[selectedChapter.id] && (
                  <Button
                    onClick={() => markAsRead(selectedChapter.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    ✓ تم قراءة هذا الفصل
                  </Button>
                )}
                {readingProgress[selectedChapter.id] && (
                  <div className="flex items-center text-emerald-600">
                    <Star className="w-5 h-5 mr-2 rtl:ml-2 fill-current" />
                    <span className="font-medium">تم قراءة هذا الفصل</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Chapters */}
          {relatedChapters.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-amiri text-gray-900 dark:text-white">
                  فصول ذات صلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
                      onClick={() => setSelectedChapter(chapter)}
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white font-amiri mb-2">
                        {chapter.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-inter">
                        {chapter.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {previousChapter && (
              <Button
                variant="outline"
                onClick={() => setSelectedChapter(previousChapter)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:rotate-180" />
                الفصل السابق: {previousChapter.title}
              </Button>
            )}
            {nextChapter && (
              <Button
                onClick={() => setSelectedChapter(nextChapter)}
                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white ml-auto rtl:mr-auto"
              >
                الفصل التالي: {nextChapter.title}
                <ArrowRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main page view
  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-950 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              السيرة النبوية الشريفة
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            📖 سيرة النبي محمد ﷺ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-3xl mx-auto">
            تعرف على حياة خير البشر محمد ﷺ من الولادة حتى الوفاة، مع تفاصيل
            شاملة ومحققة عن محطات حياته الشريفة
          </p>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">
                {seerahChapters.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                فصل
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {
                  Object.keys(readingProgress).filter(
                    (id) => readingProgress[id],
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                مقروء
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {bookmarkedChapters.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                محفوظ
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">63</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                عام عاشها ﷺ
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ابحث في السيرة النبوية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-4"
                />
              </div>

              <div className="flex gap-2">
                {seerahCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "font-amiri",
                      selectedCategory === category.id
                        ? `bg-${category.color}-600 hover:bg-${category.color}-700 text-white`
                        : `border-${category.color}-200 dark:border-${category.color}-700 text-${category.color}-600 dark:text-${category.color}-400`,
                    )}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600"
              onClick={() => setSelectedChapter(chapter)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Badge variant="outline" className="text-xs">
                        الفصل {chapter.order}
                      </Badge>
                      {readingProgress[chapter.id] && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-0 text-xs">
                          ✓ مقروء
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-amiri text-gray-900 dark:text-white leading-tight">
                      {chapter.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(chapter.id);
                    }}
                    className="p-2"
                  >
                    <Bookmark
                      className={cn(
                        "w-4 h-4 text-gray-400",
                        bookmarkedChapters.includes(chapter.id) &&
                          "fill-current text-yellow-500",
                      )}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-inter mb-4 line-clamp-3">
                  {chapter.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Clock className="w-3 h-3" />
                      <span>{formatReadingTime(chapter.details)} دقائق</span>
                    </div>
                    {chapter.timelineEvents && (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Calendar className="w-3 h-3" />
                        <span>{chapter.timelineEvents.length} حدث</span>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {chapter.audience}
                  </Badge>
                </div>

                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-amiri">
                  قراءة الفصل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredChapters.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2 font-amiri">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-gray-500 dark:text-gray-500 font-inter">
              جرب تغيير مصطلح البحث أو التصنيف
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
