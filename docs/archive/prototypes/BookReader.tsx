import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../../contexts/ProgressContext";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  downloadUrl: string;
  isAudioAvailable: boolean;
  audioUrl?: string;
}

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export default function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState<"light" | "dark" | "sepia">(
    "light",
  );
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const { completeLesson } = useProgress();

  useEffect(() => {
    // تتبع وقت القراءة
    const interval = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // حفظ تقدم القراءة
    completeLesson(`reading-${book.id}-page-${currentPage}`);
  }, [currentPage, book.id, completeLesson]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addBookmark = () => {
    if (!bookmarks.includes(currentPage)) {
      setBookmarks((prev) => [...prev, currentPage].sort((a, b) => a - b));
    }
  };

  const removeBookmark = (page: number) => {
    setBookmarks((prev) => prev.filter((p) => p !== page));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= book.pages) {
      setCurrentPage(page);
    }
  };

  const formatReadingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} س ${minutes}د`;
    }
    return `${minutes}د`;
  };

  const getReadingModeStyles = () => {
    switch (readingMode) {
      case "dark":
        return "bg-gray-900 text-gray-100";
      case "sepia":
        return "bg-yellow-50 text-amber-900";
      default:
        return "bg-white text-gray-900";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${getReadingModeStyles()}`}>
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </Button>

          <div>
            <h1 className="font-amiri font-bold text-lg">{book.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {book.author}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* إعدادات القراءة */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={readingMode === "light" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReadingMode("light")}
            >
              <span className="material-symbols-outlined">light_mode</span>
            </Button>
            <Button
              variant={readingMode === "sepia" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReadingMode("sepia")}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
            </Button>
            <Button
              variant={readingMode === "dark" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReadingMode("dark")}
            >
              <span className="material-symbols-outlined">dark_mode</span>
            </Button>
          </div>

          {/* حجم الخط */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
            >
              <span className="material-symbols-outlined">text_decrease</span>
            </Button>
            <span className="text-sm font-medium w-8 text-center">
              {fontSize}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
            >
              <span className="material-symbols-outlined">text_increase</span>
            </Button>
          </div>

          {/* إشارة مرجعية */}
          <Button
            variant={bookmarks.includes(currentPage) ? "default" : "ghost"}
            size="sm"
            onClick={addBookmark}
          >
            <span className="material-symbols-outlined">
              {bookmarks.includes(currentPage) ? "bookmark" : "bookmark_border"}
            </span>
          </Button>

          {/* صوتي */}
          {book.isAudioAvailable && (
            <Button
              variant={showAudioPlayer ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            >
              <span className="material-symbols-outlined">headphones</span>
            </Button>
          )}

          {/* ملء الشاشة */}
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            <span className="material-symbols-outlined">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </Button>
        </div>
      </div>

      {/* محتوى الكتاب */}
      <div className="flex-1 flex">
        {/* الشريط الجانبي للتنقل */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 overflow-y-auto">
          {/* معلومات التقدم */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    التقدم
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round((currentPage / book.pages) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPage / book.pages) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  الصفحة {currentPage} من {book.pages}
                </div>
                <div className="text-xs text-gray-500">
                  وقت القراءة: {formatReadingTime(readingTime)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الإشارات المرجعية */}
          {bookmarks.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-amiri">
                  الإشارات المرجعية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {bookmarks.map((page) => (
                    <div
                      key={page}
                      className="flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer"
                      onClick={() => goToPage(page)}
                    >
                      <span>صفحة {page}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(page);
                        }}
                      >
                        <span className="material-symbols-outlined text-xs">
                          close
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* التنقل السريع */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-amiri">
                التنقل السريع
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToPage(1)}
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    first_page
                  </span>
                  الصفحة الأولى
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToPage(Math.floor(book.pages / 4))}
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    bookmark
                  </span>
                  الربع الأول
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToPage(Math.floor(book.pages / 2))}
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    bookmark
                  </span>
                  المنتصف
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToPage(Math.floor((book.pages * 3) / 4))}
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    bookmark
                  </span>
                  الربع الأخير
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => goToPage(book.pages)}
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    last_page
                  </span>
                  الصفحة الأخيرة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* منطقة القراءة */}
        <div className="flex-1 flex flex-col">
          {/* محتوى الصفحة */}
          <div
            className="flex-1 p-8 overflow-y-auto"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* محاكاة محتوى الكتاب */}
              <div className="font-amiri leading-relaxed">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {book.title} - الصفحة {currentPage}
                </h2>

                <div className="prose prose-lg max-w-none">
                  <p className="mb-4">
                    هذا نص تجريبي لمحاكاة محتوى الكتاب. في التطبيق الحقيقي، سيتم
                    تحميل المحتوى الفعلي من ملف PDF أو قاعدة البيانات.
                  </p>

                  <p className="mb-4">
                    يمكن أن يحتوي المحتوى على نصوص طويلة مع فقرات متعددة،
                    واقتباسات، وقوائم، والمزيد من العناصر النصية.
                  </p>

                  <blockquote className="border-r-4 border-emerald-500 pr-4 italic text-emerald-700 dark:text-emerald-400 my-6">
                    "هذا مثال على اقتباس أو آية قرآنية أو حديث شريف يمكن إبرازه
                    بشكل خاص."
                  </blockquote>

                  <p className="mb-4">
                    النص هنا يمكن أن يكون باللغة العربية مع دعم كامل للكتابة من
                    اليمين إلى اليسار، والخطوط العربية الجميلة.
                  </p>

                  <p className="mb-4">
                    يمكن للقارئ تعديل حجم الخط، ووضع القراءة، وإضافة إشارات
                    مرجعية، والاستفادة من المشغل الصوتي إذا كان متاحاً.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* شريط التنقل السفلي */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className="material-symbols-outlined mr-2">
                  chevron_right
                </span>
                الصفحة السابقة
              </Button>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max={book.pages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1 text-center border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  من {book.pages}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= book.pages}
              >
                الصفحة التالية
                <span className="material-symbols-outlined ml-2">
                  chevron_left
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* مشغل الصوت العائم */}
      {showAudioPlayer && book.isAudioAvailable && (
        <div className="fixed bottom-4 right-4 z-60">
          <Card className="w-80 bg-white dark:bg-gray-800 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-amiri font-medium">المشغل الصوتي</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAudioPlayer(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                </Button>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5:23 / 15:45</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
