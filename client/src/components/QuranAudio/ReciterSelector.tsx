import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  QuranRecitation,
  quranRecitations,
  quranAudioCategories,
  getRecitationsByCategory,
} from "@/data/quranAudio";
import { Search, Play, Download, Star, Clock, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReciterSelectorProps {
  selectedReciter: QuranRecitation | null;
  onReciterSelect: (reciter: QuranRecitation) => void;
  onPlay?: (reciter: QuranRecitation) => void;
  onDownload?: (reciter: QuranRecitation) => void;
  className?: string;
}

export default function ReciterSelector({
  selectedReciter,
  onReciterSelect,
  onPlay,
  onDownload,
  className,
}: ReciterSelectorProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Static category tones: Tailwind JIT only generates literal classes.
  const CATEGORY_TONES: Record<string, { active: string; idle: string }> = {
    blue: {
      active: "bg-blue-600 hover:bg-blue-700 text-white",
      idle: "border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400",
    },
    emerald: {
      active: "bg-emerald-600 hover:bg-emerald-700 text-white",
      idle: "border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400",
    },
    gold: {
      active: "bg-amber-600 hover:bg-amber-700 text-white",
      idle: "border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400",
    },
    purple: {
      active: "bg-purple-600 hover:bg-purple-700 text-white",
      idle: "border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400",
    },
    teal: {
      active: "bg-teal-600 hover:bg-teal-700 text-white",
      idle: "border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400",
    },
  };

  const categoryTone = (color: string, active: boolean) => {
    const tone = CATEGORY_TONES[color] ?? CATEGORY_TONES.emerald;
    return active ? tone.active : tone.idle;
  };

  const filteredReciters = (() => {
    let reciters =
      selectedCategory === "all"
        ? quranRecitations
        : getRecitationsByCategory(selectedCategory);

    if (searchQuery) {
      reciters = reciters.filter(
        (reciter) =>
          reciter.reciterName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reciter.reciterNameEn
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reciter.country.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return [...reciters].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Engagement metrics are unverified placeholders: never sort by them.
      return a.reciterNameEn.localeCompare(b.reciterNameEn);
    });
  })();

  const getReciterInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}م`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}ألف`;
    }
    return num.toString();
  };

  return (
    <Card
      className={cn(
        "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700",
        className,
      )}
    >
      <CardHeader className="border-b border-emerald-100 dark:border-emerald-800">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-amiri text-emerald-800 dark:text-emerald-200">
                🎧 القرآن الكريم الصوتي
              </h2>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-inter">
                اختر القارئ المفضل لديك
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-0">
            {filteredReciters.length} قارئ
          </Badge>
        </CardTitle>

        {/* Search and Filter */}
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن قارئ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-4 bg-white/50 dark:bg-gray-700/50 border-emerald-200 dark:border-emerald-700"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "font-amiri",
                selectedCategory === "all"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400",
              )}
            >
              الكل ({quranRecitations.length})
            </Button>
            {quranAudioCategories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "font-amiri",
                  categoryTone(
                    category.color,
                    selectedCategory === category.id,
                  ),
                )}
              >
                {category.name} ({getRecitationsByCategory(category.id).length})
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {filteredReciters.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2 font-amiri">
              لم يتم العثور على قراء
            </h3>
            <p className="text-gray-500 dark:text-gray-500 font-inter">
              جرب تغيير مصطلح البحث أو التصنيف
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1",
            )}
          >
            {filteredReciters.map((reciter) => (
              <Card
                key={reciter.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                  selectedReciter?.id === reciter.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600",
                )}
                onClick={() => onReciterSelect(reciter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={reciter.coverImage}
                          alt={reciter.reciterName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                          {getReciterInitials(reciter.reciterName)}
                        </AvatarFallback>
                      </Avatar>
                      {reciter.featured && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white font-amiri text-lg leading-tight">
                        {reciter.reciterName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                        {reciter.reciterNameEn}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {reciter.country} • {reciter.style}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 font-inter">
                    {reciter.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-3 h-3" />
                        <span>{reciter.duration}</span>
                      </div>
                      <span>إحصاءات الاستماع غير متاحة · حقوق التشغيل قيد المراجعة</span>
                    </div>

                    <div className="flex space-x-2 rtl:space-x-reverse">
                      {onPlay && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlay(reciter);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 p-2"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {onDownload && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(reciter);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-2"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedReciter?.id === reciter.id && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-emerald-600 dark:text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">القارئ المحدد</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
