import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  BookOpen,
  Play,
  Pause,
  Volume2,
  Clock,
  Eye,
  Heart,
  Share2,
  Download,
  Bookmark,
  Star,
  Globe,
  Calendar,
  Award,
  Crown,
  Diamond,
  Sparkles,
  Flame,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  PieChart,
  Headphones,
  Radio,
  Mic2,
  Music,
  Disc3,
  Waves,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  MapPin,
  Timer,
  Hash,
  AlignLeft,
  FileText,
  Layers,
  Grid3X3,
  List,
  Map,
  Archive,
  Book,
  ScrollText,
  Feather,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  meaning: string;
  verses: number;
  type: "meccan" | "medinan";
  revelationOrder: number;
  juz: number[];
  rukus: number;
  sajdas: number;
  duration: string;
  description: string;
  themes: string[];
  difficulty: "easy" | "medium" | "hard";
  popularity: number;
  downloads: number;
  likes: number;
  recitations: number;
}

interface SurahListProps {
  className?: string;
  onSurahSelect?: (surah: Surah) => void;
  currentPlaying?: number;
  showStats?: boolean;
}

export default function SurahList({
  className,
  onSurahSelect,
  currentPlaying,
  showStats = true,
}: SurahListProps) {
  const { mode } = useTheme();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "order" | "name" | "verses" | "popularity" | "revelation"
  >("order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "meccan" | "medinan">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteSurahs, setFavoriteSurahs] = useState<number[]>([
    1, 2, 18, 36, 55,
  ]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<number[]>([1, 2, 18]);

  // Complete Surah data
  const surahs: Surah[] = [
    {
      id: 1,
      name: "الفاتحة",
      arabicName: "سُورَةُ الْفَاتِحَة",
      englishName: "Al-Fatihah",
      meaning: "الافتتاح",
      verses: 7,
      type: "meccan",
      revelationOrder: 5,
      juz: [1],
      rukus: 1,
      sajdas: 0,
      duration: "1:30",
      description: "أم الكتاب وأعظم سورة في القرآن الكريم",
      themes: ["الحمد", "الدعاء", "الهداية"],
      difficulty: "easy",
      popularity: 100,
      downloads: 50000,
      likes: 12000,
      recitations: 1000000,
    },
    {
      id: 2,
      name: "البقرة",
      arabicName: "سُورَةُ الْبَقَرَة",
      englishName: "Al-Baqarah",
      meaning: "البقرة",
      verses: 286,
      type: "medinan",
      revelationOrder: 87,
      juz: [1, 2, 3],
      rukus: 40,
      sajdas: 1,
      duration: "2:30:45",
      description: "أطول سورة في القرآن وتحتوي على آية الكرسي",
      themes: ["التشريع", "القصص", "العقيدة"],
      difficulty: "hard",
      popularity: 95,
      downloads: 45000,
      likes: 11000,
      recitations: 800000,
    },
    {
      id: 18,
      name: "الكهف",
      arabicName: "سُورَةُ الْكَهْف",
      englishName: "Al-Kahf",
      meaning: "الكهف",
      verses: 110,
      type: "meccan",
      revelationOrder: 69,
      juz: [15, 16],
      rukus: 12,
      sajdas: 0,
      duration: "1:15:30",
      description: "تحتوي على قصص تربوية عظيمة",
      themes: ["القصص", "الابتلاء", "الصبر"],
      difficulty: "medium",
      popularity: 90,
      downloads: 40000,
      likes: 9500,
      recitations: 750000,
    },
    {
      id: 36,
      name: "يس",
      arabicName: "سُورَةُ يس",
      englishName: "Ya-Sin",
      meaning: "يس",
      verses: 83,
      type: "meccan",
      revelationOrder: 41,
      juz: [22, 23],
      rukus: 5,
      sajdas: 0,
      duration: "45:20",
      description: "قلب القرآن الكريم",
      themes: ["البعث", "الوحدانية", "النبوة"],
      difficulty: "medium",
      popularity: 88,
      downloads: 35000,
      likes: 8500,
      recitations: 650000,
    },
    {
      id: 55,
      name: "الرحمن",
      arabicName: "سُورَةُ الرَّحْمَٰن",
      englishName: "Ar-Rahman",
      meaning: "الرحمن",
      verses: 78,
      type: "medinan",
      revelationOrder: 97,
      juz: [27],
      rukus: 3,
      sajdas: 0,
      duration: "35:15",
      description: "عروس القرآن",
      themes: ["النعم", "الرحمة", "الجنة"],
      difficulty: "easy",
      popularity: 85,
      downloads: 30000,
      likes: 7500,
      recitations: 600000,
    },
  ];

  // Filter and sort surahs
  const filteredAndSortedSurahs = useMemo(() => {
    let filtered = surahs.filter((surah) => {
      const matchesSearch =
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.themes.some((theme) =>
          theme.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesType = filterType === "all" || surah.type === filterType;

      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "verses":
          aValue = a.verses;
          bValue = b.verses;
          break;
        case "popularity":
          aValue = a.popularity;
          bValue = b.popularity;
          break;
        case "revelation":
          aValue = a.revelationOrder;
          bValue = b.revelationOrder;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue as string, "ar")
          : (bValue as string).localeCompare(aValue, "ar");
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [searchQuery, sortBy, sortDirection, filterType]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "from-green-400 to-emerald-500";
      case "medium":
        return "from-yellow-400 to-orange-500";
      case "hard":
        return "from-red-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "سهل";
      case "medium":
        return "متوسط";
      case "hard":
        return "صعب";
      default:
        return "غير محدد";
    }
  };

  const toggleFavorite = (surahId: number) => {
    setFavoriteSurahs((prev) =>
      prev.includes(surahId)
        ? prev.filter((id) => id !== surahId)
        : [...prev, surahId],
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Search and Controls */}
      <Card
        className={cn(
          "transition-all duration-700",
          mode === "heaven"
            ? "bg-white/10 border-white/20 backdrop-blur-md"
            : "bg-white border-gray-200",
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle
            className={cn(
              "flex items-center justify-between text-2xl font-amiri",
              mode === "heaven" ? "text-white" : "text-gray-800",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-xl",
                  mode === "heaven" ? "bg-white/20" : "bg-emerald-100",
                )}
              >
                <BookOpen
                  className={cn(
                    "w-8 h-8",
                    mode === "heaven" ? "text-white" : "text-emerald-600",
                  )}
                />
              </div>
              <div>
                <span>📖 فهرس السور الكريمة</span>
                <p
                  className={cn(
                    "text-sm font-inter font-normal mt-1",
                    mode === "heaven" ? "text-white/80" : "text-gray-600",
                  )}
                >
                  {filteredAndSortedSurahs.length} من {surahs.length} سورة
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className={cn(
                  "transition-all duration-300",
                  mode === "heaven"
                    ? "border-white/30 text-white hover:bg-white/20"
                    : "border-gray-200 hover:bg-gray-50",
                )}
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid3X3 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className={cn(
                "absolute left-4 rtl:right-4 rtl:left-auto top-1/2 transform -translate-y-1/2 w-5 h-5",
                mode === "heaven" ? "text-white/70" : "text-gray-400",
              )}
            />
            <Input
              placeholder="ابحث في السور بالاسم أو المعنى أو الموضوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-12 rtl:pr-12 rtl:pl-4 h-12 text-lg border rounded-xl font-amiri transition-all duration-700",
                mode === "heaven"
                  ? "bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
                  : "bg-white border-gray-200 focus:border-emerald-400",
              )}
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter
                className={cn(
                  "w-4 h-4",
                  mode === "heaven" ? "text-white/70" : "text-gray-500",
                )}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm border font-amiri transition-all duration-700",
                  mode === "heaven"
                    ? "bg-white/10 text-white border-white/20 backdrop-blur-md"
                    : "bg-white border-gray-200",
                )}
              >
                <option value="all">جميع السور</option>
                <option value="meccan">المكية</option>
                <option value="medinan">المدنية</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <SortAsc
                className={cn(
                  "w-4 h-4",
                  mode === "heaven" ? "text-white/70" : "text-gray-500",
                )}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm border font-amiri transition-all duration-700",
                  mode === "heaven"
                    ? "bg-white/10 text-white border-white/20 backdrop-blur-md"
                    : "bg-white border-gray-200",
                )}
              >
                <option value="order">ترتيب المصحف</option>
                <option value="name">الاسم</option>
                <option value="verses">عدد الآيات</option>
                <option value="popularity">الشعبية</option>
                <option value="revelation">ترتيب النزول</option>
              </select>
            </div>

            {/* Sort Direction */}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className={cn(
                "transition-all duration-300",
                mode === "heaven"
                  ? "border-white/30 text-white hover:bg-white/20"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              {sortDirection === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 ml-auto">
              <Badge
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSearchQuery("")}
              >
                الكل
              </Badge>
              <Badge
                className="bg-red-100 text-red-700 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSearchQuery("قصص")}
              >
                القصص
              </Badge>
              <Badge
                className="bg-blue-100 text-blue-700 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSearchQuery("الدعاء")}
              >
                الدعاء
              </Badge>
              <Badge
                className="bg-green-100 text-green-700 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSearchQuery("الأحكام")}
              >
                الأحكام
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "إجمالي السور",
              value: "114",
              icon: <BookOpen className="w-5 h-5" />,
              color: "from-emerald-500 to-green-600",
            },
            {
              label: "السور المكية",
              value: "86",
              icon: <MapPin className="w-5 h-5" />,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "السور المدنية",
              value: "28",
              icon: <Globe className="w-5 h-5" />,
              color: "from-purple-500 to-violet-600",
            },
            {
              label: "إجمالي الآيات",
              value: "6236",
              icon: <FileText className="w-5 h-5" />,
              color: "from-amber-500 to-yellow-600",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={cn(
                "transition-all duration-300 hover:scale-105",
                mode === "heaven"
                  ? "bg-white/10 border-white/20"
                  : "bg-white border-gray-200",
              )}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                    `bg-gradient-to-r ${stat.color}`,
                  )}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div
                  className={cn(
                    "text-2xl font-bold font-amiri mb-1",
                    mode === "heaven" ? "text-white" : "text-gray-800",
                  )}
                >
                  {stat.value}
                </div>
                <div
                  className={cn(
                    "text-sm font-inter",
                    mode === "heaven" ? "text-white/70" : "text-gray-600",
                  )}
                >
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Favorites Section */}
      {favoriteSurahs.length > 0 && (
        <Card
          className={cn(
            "transition-all duration-700",
            mode === "heaven"
              ? "bg-white/10 border-white/20 backdrop-blur-md"
              : "bg-white border-gray-200",
          )}
        >
          <CardHeader className="pb-4">
            <CardTitle
              className={cn(
                "flex items-center gap-3 text-lg font-amiri",
                mode === "heaven" ? "text-white" : "text-gray-800",
              )}
            >
              <Heart className="w-6 h-6 text-red-500" />
              السور المفضلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {favoriteSurahs.map((id) => {
                const surah = surahs.find((s) => s.id === id);
                if (!surah) return null;
                return (
                  <Button
                    key={id}
                    variant="outline"
                    onClick={() => onSurahSelect?.(surah)}
                    className={cn(
                      "flex items-center gap-2 transition-all duration-300 hover:scale-105",
                      mode === "heaven"
                        ? "border-white/30 text-white hover:bg-white/20"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <span className="font-amiri">{surah.name}</span>
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      {surah.verses}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Surah List/Grid */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4",
        )}
      >
        {filteredAndSortedSurahs.map((surah) => (
          <Card
            key={surah.id}
            className={cn(
              "group cursor-pointer transition-all duration-500 hover:scale-105",
              mode === "heaven"
                ? "bg-white/10 border-white/20 hover:bg-white/15"
                : "bg-white border-gray-200 hover:shadow-lg",
              currentPlaying === surah.id &&
                "ring-2 ring-emerald-400 shadow-xl",
              viewMode === "list" && "hover:bg-opacity-80",
            )}
          >
            <div
              onClick={() => onSurahSelect?.(surah)}
              className={cn(
                viewMode === "grid" ? "p-6" : "p-4",
                "relative overflow-hidden",
              )}
            >
              {/* Background Gradient */}
              <div
                className={cn(
                  "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500",
                  surah.type === "meccan"
                    ? "bg-gradient-to-br from-emerald-400 to-green-600"
                    : "bg-gradient-to-br from-blue-400 to-indigo-600",
                )}
              ></div>

              <div
                className={cn(
                  "relative z-10",
                  viewMode === "list" ? "flex items-center gap-4" : "space-y-4",
                )}
              >
                {/* Surah Number and Icon */}
                <div
                  className={cn(
                    "flex items-center gap-4",
                    viewMode === "list" ? "flex-shrink-0" : "justify-between",
                  )}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110",
                        surah.type === "meccan"
                          ? "bg-gradient-to-br from-emerald-400 to-green-500"
                          : "bg-gradient-to-br from-blue-400 to-indigo-500",
                      )}
                    >
                      <span className="text-white font-bold text-xl font-amiri">
                        {surah.id}
                      </span>
                    </div>

                    {/* Playing Indicator */}
                    {currentPlaying === surah.id && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Favorite Indicator */}
                    {favoriteSurahs.includes(surah.id) && (
                      <div className="absolute -top-2 -left-2">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </div>
                    )}
                  </div>

                  {viewMode === "grid" && (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-xs",
                          surah.type === "meccan"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700",
                        )}
                      >
                        {surah.type === "meccan" ? "مكية" : "مدنية"}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs",
                          `bg-gradient-to-r ${getDifficultyColor(surah.difficulty)} text-white`,
                        )}
                      >
                        {getDifficultyLabel(surah.difficulty)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Surah Info */}
                <div
                  className={cn(viewMode === "list" ? "flex-1" : "space-y-3")}
                >
                  {/* Names */}
                  <div
                    className={viewMode === "list" ? "space-y-1" : "space-y-2"}
                  >
                    <h3
                      className={cn(
                        "font-amiri font-bold transition-colors duration-700",
                        viewMode === "list" ? "text-xl" : "text-2xl",
                        mode === "heaven" ? "text-white" : "text-gray-800",
                      )}
                    >
                      {surah.arabicName}
                    </h3>
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        viewMode === "list" ? "text-sm" : "text-base",
                      )}
                    >
                      <span
                        className={cn(
                          "font-inter font-medium",
                          mode === "heaven" ? "text-white/80" : "text-gray-600",
                        )}
                      >
                        {surah.englishName}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          mode === "heaven"
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {surah.meaning}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-3 text-sm",
                      mode === "heaven" ? "text-white/70" : "text-gray-600",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{surah.verses} آية</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{surah.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>الجزء {surah.juz.join(", ")}</span>
                    </div>
                    {viewMode === "grid" && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{surah.popularity}%</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {viewMode === "grid" && (
                    <p
                      className={cn(
                        "text-sm leading-relaxed font-inter",
                        mode === "heaven" ? "text-white/80" : "text-gray-600",
                      )}
                    >
                      {surah.description}
                    </p>
                  )}

                  {/* Themes */}
                  {viewMode === "grid" && (
                    <div className="flex flex-wrap gap-2">
                      {surah.themes.slice(0, 3).map((theme, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn(
                            "text-xs",
                            mode === "heaven"
                              ? "border-white/30 text-white"
                              : "border-gray-300 text-gray-600",
                          )}
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {viewMode === "list" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(surah.id);
                      }}
                      className={cn(
                        "transition-all duration-300",
                        mode === "heaven"
                          ? "border-white/30 text-white hover:bg-white/20"
                          : "border-gray-200 hover:bg-gray-50",
                        favoriteSurahs.includes(surah.id) &&
                          "text-red-500 border-red-300",
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4",
                          favoriteSurahs.includes(surah.id) && "fill-current",
                        )}
                      />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "transition-all duration-300",
                        mode === "heaven"
                          ? "border-white/30 text-white hover:bg-white/20"
                          : "border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      {currentPlaying === surah.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Grid Actions */}
                {viewMode === "grid" && (
                  <div className="flex items-center justify-between pt-4 border-t border-opacity-20">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(surah.id);
                        }}
                        className={cn(
                          "transition-all duration-300",
                          mode === "heaven"
                            ? "border-white/30 text-white hover:bg-white/20"
                            : "border-gray-200 hover:bg-gray-50",
                          favoriteSurahs.includes(surah.id) &&
                            "text-red-500 border-red-300",
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4 mr-1 rtl:ml-1",
                            favoriteSurahs.includes(surah.id) && "fill-current",
                          )}
                        />
                        {surah.likes > 1000
                          ? `${Math.floor(surah.likes / 1000)}K`
                          : surah.likes}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "transition-all duration-300",
                          mode === "heaven"
                            ? "border-white/30 text-white hover:bg-white/20"
                            : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <Download className="w-4 h-4 mr-1 rtl:ml-1" />
                        {surah.downloads > 1000
                          ? `${Math.floor(surah.downloads / 1000)}K`
                          : surah.downloads}
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      className={cn(
                        "transition-all duration-300 hover:scale-105",
                        currentPlaying === surah.id
                          ? "bg-red-500 hover:bg-red-600"
                          : mode === "heaven"
                            ? "bg-white/20 hover:bg-white/30 text-white"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white",
                      )}
                    >
                      {currentPlaying === surah.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-1 rtl:ml-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1 rtl:ml-1" />
                          تشغيل
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedSurahs.length === 0 && (
        <Card
          className={cn(
            "text-center p-12 transition-all duration-700",
            mode === "heaven"
              ? "bg-white/10 border-white/20 backdrop-blur-md"
              : "bg-white border-gray-200",
          )}
        >
          <div
            className={cn(
              "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
              mode === "heaven" ? "bg-white/20" : "bg-gray-100",
            )}
          >
            <Search
              className={cn(
                "w-12 h-12",
                mode === "heaven" ? "text-white/60" : "text-gray-400",
              )}
            />
          </div>
          <h3
            className={cn(
              "text-xl font-amiri font-bold mb-2",
              mode === "heaven" ? "text-white" : "text-gray-800",
            )}
          >
            لم توجد نتائج
          </h3>
          <p
            className={cn(
              "font-inter",
              mode === "heaven" ? "text-white/70" : "text-gray-600",
            )}
          >
            جرب تغيير كلمات البحث أو المرشحات
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setFilterType("all");
            }}
            className="mt-4"
            variant="outline"
          >
            مسح الفلاتر
          </Button>
        </Card>
      )}
    </div>
  );
}
