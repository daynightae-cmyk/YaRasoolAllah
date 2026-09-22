import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuranRecitation } from "@/data/quranAudio";
import { Search, Play, Download, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurahData {
  number: number;
  name: string;
  nameEn: string;
  nameArabic: string;
  verses: number;
  type: "meccan" | "medinan";
  revelationOrder: number;
  duration?: string;
  meaning: string;
}

interface SurahListProps {
  recitation: QuranRecitation;
  currentSurah: number;
  onSurahSelect: (surah: number) => void;
  onPlay?: (surah: number) => void;
  onDownload?: (surah: number) => void;
  className?: string;
}

// بيانات السور - في التطبيق الحقيقي ستأتي من API
const surahs: SurahData[] = [
  {
    number: 1,
    name: "الفاتحة",
    nameEn: "Al-Fatiha",
    nameArabic: "ٱلْفَاتِحَة",
    verses: 7,
    type: "meccan",
    revelationOrder: 5,
    duration: "2:15",
    meaning: "The Opening",
  },
  {
    number: 2,
    name: "البقرة",
    nameEn: "Al-Baqarah",
    nameArabic: "ٱلْبَقَرَة",
    verses: 286,
    type: "medinan",
    revelationOrder: 87,
    duration: "2:30:45",
    meaning: "The Cow",
  },
  {
    number: 3,
    name: "آل عمران",
    nameEn: "Ali Imran",
    nameArabic: "آل عِمْرَان",
    verses: 200,
    type: "medinan",
    revelationOrder: 89,
    duration: "1:45:20",
    meaning: "Family of Imran",
  },
  {
    number: 4,
    name: "النساء",
    nameEn: "An-Nisa",
    nameArabic: "ٱلنِّسَاء",
    verses: 176,
    type: "medinan",
    revelationOrder: 92,
    duration: "1:35:30",
    meaning: "The Women",
  },
  {
    number: 5,
    name: "المائدة",
    nameEn: "Al-Maidah",
    nameArabic: "ٱلْمَائِدَة",
    verses: 120,
    type: "medinan",
    revelationOrder: 112,
    duration: "1:15:45",
    meaning: "The Table Spread",
  },
  {
    number: 6,
    name: "الأنعام",
    nameEn: "Al-Anam",
    nameArabic: "ٱلْأَنْعَام",
    verses: 165,
    type: "meccan",
    revelationOrder: 55,
    duration: "1:25:20",
    meaning: "The Cattle",
  },
  {
    number: 7,
    name: "الأعراف",
    nameEn: "Al-Araf",
    nameArabic: "ٱلْأَعْرَاف",
    verses: 206,
    type: "meccan",
    revelationOrder: 39,
    duration: "1:40:15",
    meaning: "The Heights",
  },
  {
    number: 8,
    name: "الأنفال",
    nameEn: "Al-Anfal",
    nameArabic: "ٱلْأَنْفَال",
    verses: 75,
    type: "medinan",
    revelationOrder: 88,
    duration: "45:30",
    meaning: "The Spoils of War",
  },
  {
    number: 9,
    name: "التوبة",
    nameEn: "At-Tawbah",
    nameArabic: "ٱلتَّوْبَة",
    verses: 129,
    type: "medinan",
    revelationOrder: 113,
    duration: "1:05:45",
    meaning: "The Repentance",
  },
  {
    number: 10,
    name: "يونس",
    nameEn: "Yunus",
    nameArabic: "يُونُس",
    verses: 109,
    type: "meccan",
    revelationOrder: 51,
    duration: "55:20",
    meaning: "Jonah",
  },
  // إضافة باقي السور...
  ...Array.from({ length: 104 }, (_, i) => ({
    number: i + 11,
    name: `سورة ${i + 11}`,
    nameEn: `Surah ${i + 11}`,
    nameArabic: `سورة ${i + 11}`,
    verses: Math.floor(Math.random() * 200) + 1,
    type: Math.random() > 0.5 ? "meccan" : ("medinan" as "meccan" | "medinan"),
    revelationOrder: i + 11,
    duration: `${Math.floor(Math.random() * 60)}:${Math.floor(
      Math.random() * 60,
    )
      .toString()
      .padStart(2, "0")}`,
    meaning: `Meaning ${i + 11}`,
  })),
];

export default function SurahList({
  recitation,
  currentSurah,
  onSurahSelect,
  onPlay,
  onDownload,
  className,
}: SurahListProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "meccan" | "medinan">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch =
      searchQuery === "" ||
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery);

    const matchesType = typeFilter === "all" || surah.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    return type === "meccan" ? "🕋" : "🕌";
  };

  const getTypeColor = (type: string) => {
    return type === "meccan"
      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
  };

  return (
    <Card
      className={cn(
        "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-teal-200 dark:border-teal-700",
        className,
      )}
    >
      <CardHeader className="border-b border-teal-100 dark:border-teal-800">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-amiri text-teal-800 dark:text-teal-200">
                📖 سور القرآن الكريم
              </h2>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-inter">
                {recitation.reciterName}
              </p>
            </div>
          </div>
          <Badge className="bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 border-0">
            {filteredSurahs.length} سورة
          </Badge>
        </CardTitle>

        {/* Search and Filter */}
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن سورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-4 bg-white/50 dark:bg-gray-700/50 border-teal-200 dark:border-teal-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "font-amiri",
                  typeFilter === "all"
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400",
                )}
              >
                الكل ({surahs.length})
              </Button>
              <Button
                variant={typeFilter === "meccan" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("meccan")}
                className={cn(
                  "font-amiri",
                  typeFilter === "meccan"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400",
                )}
              >
                🕋 مكية ({surahs.filter((s) => s.type === "meccan").length})
              </Button>
              <Button
                variant={typeFilter === "medinan" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("medinan")}
                className={cn(
                  "font-amiri",
                  typeFilter === "medinan"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-green-200 dark:border-green-700 text-green-600 dark:text-green-400",
                )}
              >
                🕌 مدنية ({surahs.filter((s) => s.type === "medinan").length})
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {filteredSurahs.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2 font-amiri">
                لم يتم العثور على سور
              </h3>
              <p className="text-gray-500 dark:text-gray-500 font-inter">
                جرب تغيير مصطلح البحث أو النوع
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                    currentSurah === surah.number &&
                      "bg-teal-100 dark:bg-teal-900/30",
                  )}
                  onClick={() => onSurahSelect(surah.number)}
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        currentSurah === surah.number
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
                      )}
                    >
                      {surah.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white font-amiri text-lg">
                          {surah.name}
                        </h3>
                        <Badge
                          className={cn(
                            "text-xs border-0",
                            getTypeColor(surah.type),
                          )}
                        >
                          {getTypeIcon(surah.type)}{" "}
                          {surah.type === "meccan" ? "مكية" : "مدنية"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-inter">{surah.nameEn}</span>
                        <span>•</span>
                        <span>{surah.verses} آية</span>
                        {surah.duration && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Clock className="w-3 h-3" />
                              <span>{surah.duration}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {onPlay && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(surah.number);
                        }}
                        className="text-teal-600 hover:text-teal-700 p-2"
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
                          onDownload(surah.number);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
