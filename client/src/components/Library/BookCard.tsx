import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { downloadService } from "../../services/downloadService";
import {
  generateBookCover,
  generateQuranCover,
} from "../../utils/bookCoverGenerator";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  format: string;
  pages: number;
  description: string;
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

interface BookCardProps {
  book: Book;
  onRead: () => void;
  onDownload: () => void;
  viewMode?: "grid" | "list";
  featured?: boolean;
}

export default function BookCard({
  book,
  onRead,
  onDownload,
  viewMode = "grid",
  featured = false,
}: BookCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // استخدام خدمة التحميل
      await downloadService.startDownload(
        book.id,
        book.downloadUrl,
        `${book.title}.${book.format}`,
        book.size,
      );

      onDownload();
    } catch (error) {
      console.error("خطأ في التحميل:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      quran: "emerald",
      hadith: "blue",
      fiqh: "purple",
      aqeedah: "orange",
      seerah: "green",
      contemporary: "red",
    };
    return colors[category as keyof typeof colors] || "gray";
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      ar: "🇸🇦",
      en: "🇺🇸",
      fr: "🇫🇷",
      ur: "🇵🇰",
    };
    return flags[language as keyof typeof flags] || "🌐";
  };

  // توليد غلاف افتراضي باستخدام المولد
  const defaultCover =
    book.category === "quran"
      ? generateQuranCover(book.title, book.author)
      : generateBookCover(
          book.title,
          book.author,
          book.category,
          getCategoryColor(book.category),
        );

  if (viewMode === "list") {
    return (
      <Card
        className={`card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${featured ? "ring-2 ring-emerald-500" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* صورة الغلاف */}
            <div className="flex-shrink-0">
              <img
                src={imageError ? defaultCover : book.coverImage}
                alt={book.title}
                className="w-24 h-32 object-cover rounded-lg shadow-sm"
                onError={() => setImageError(true)}
              />
            </div>

            {/* محتوى الكتاب */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-amiri">
                    {book.author}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getLanguageFlag(book.language)}
                  </span>
                  {book.isAudioAvailable && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      <span className="material-symbols-outlined text-xs mr-1">
                        volume_up
                      </span>
                      صوتي
                    </Badge>
                  )}
                  {featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      <span className="material-symbols-outlined text-xs mr-1">
                        star
                      </span>
                      مميز
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  className={`bg-${getCategoryColor(book.category)}-100 text-${getCategoryColor(book.category)}-700`}
                >
                  {book.category}
                </Badge>
                <Badge variant="outline">{book.format.toUpperCase()}</Badge>
                <Badge variant="outline">{book.pages} صفحة</Badge>
                <Badge variant="outline">{book.size}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      star
                    </span>
                    <span>{book.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      download
                    </span>
                    <span>{book.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onRead}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      menu_book
                    </span>
                    قراءة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <span className="material-symbols-outlined text-sm mr-1 animate-spin">
                        download
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm mr-1">
                        download
                      </span>
                    )}
                    تحميل
                  </Button>
                </div>
              </div>

              {isDownloading && (
                <div className="mt-3">
                  <Progress value={downloadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    جاري التحميل... {downloadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${featured ? "ring-2 ring-emerald-500 ring-opacity-50" : ""}`}
    >
      <CardHeader className="p-4">
        {/* صورة الغلاف */}
        <div className="relative mb-4">
          <img
            src={imageError ? defaultCover : book.coverImage}
            alt={book.title}
            className="w-full h-48 object-cover rounded-lg shadow-sm"
            onError={() => setImageError(true)}
          />

          {/* العلامات المطلقة */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span className="text-lg">{getLanguageFlag(book.language)}</span>
            {book.isAudioAvailable && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 text-xs"
              >
                <span className="material-symbols-outlined text-xs">
                  volume_up
                </span>
              </Badge>
            )}
            {featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                <span className="material-symbols-outlined text-xs">star</span>
              </Badge>
            )}
          </div>

          {/* تقييم ومعلومات سريعة */}
          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">star</span>
                <span>{book.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">
                  download
                </span>
                <span>{(book.downloads / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الكتاب */}
        <div>
          <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-amiri mb-3">
            {book.author}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
          {book.description}
        </p>

        {/* العلامات والتصنيفات */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            className={`bg-${getCategoryColor(book.category)}-100 text-${getCategoryColor(book.category)}-700`}
          >
            {book.category}
          </Badge>
          <Badge variant="outline">{book.format.toUpperCase()}</Badge>
          <Badge variant="outline">{book.pages}</Badge>
        </div>

        {/* أزرار العمل */}
        <div className="flex gap-2">
          <Button
            onClick={onRead}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <span className="material-symbols-outlined text-sm mr-1">
              menu_book
            </span>
            قراءة
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1"
          >
            {isDownloading ? (
              <span className="material-symbols-outlined text-sm mr-1 animate-spin">
                download
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm mr-1">
                download
              </span>
            )}
            تحميل
          </Button>
        </div>

        {/* شريط التحميل */}
        {isDownloading && (
          <div className="mt-3">
            <Progress value={downloadProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              جاري التحميل... {downloadProgress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
