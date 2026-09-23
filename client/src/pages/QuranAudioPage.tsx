import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Settings,
  Shuffle,
  Repeat,
  Bookmark,
  Clock,
  Music,
  Headphones,
  Globe,
  Mic,
  Radio,
  Award,
  ShieldCheck,
  TrendingUp,
  Eye,
  Calendar,
  Book,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  verses: number;
  type: "meccan" | "medinan";
  duration: string;
  revelation_order: number;
  meaning: string;
}

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  englishName: string;
  country: string;
  countryFlag: string;
  style: string;
  description: string;
  followers: string;
  rating: number;
  totalRecitations: number;
  speciality: string;
  avatar: string;
  isVerified: boolean;
  popularSurahs: string[];
}

export default function QuranAudioPage() {
  const { t, isRTL } = useLanguage();
  const { mode } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentSurah, setCurrentSurah] = useState(0);
  const [currentReciter, setCurrentReciter] = useState(0);
  const [showSurahList, setShowSurahList] = useState(true);
  const [showReciterList, setShowReciterList] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  // No media source is bound in this slice: in-platform playback stays
  // disabled until recording rights are documented per reciter.
  const [mediaBlocked, setMediaBlocked] = useState(false);

  const surahs: Surah[] = [
    {
      id: 1,
      name: "الفاتحة",
      arabicName: "سُورَةُ الْفَاتِحَة",
      englishName: "Al-Fatihah",
      verses: 7,
      type: "meccan",
      duration: "1:30",
      revelation_order: 5,
      meaning: "الافتتاح",
    },
    {
      id: 2,
      name: "��لبقرة",
      arabicName: "سُورَةُ الْبَقَرَة",
      englishName: "Al-Baqarah",
      verses: 286,
      type: "medinan",
      duration: "2:30:45",
      revelation_order: 87,
      meaning: "البقرة",
    },
    {
      id: 3,
      name: "آل عمران",
      arabicName: "سُورَةُ آلِ عِمْرَان",
      englishName: "Aal-E-Imran",
      verses: 200,
      type: "medinan",
      duration: "1:45:20",
      revelation_order: 89,
      meaning: "عائلة عمران",
    },
    {
      id: 4,
      name: "النساء",
      arabicName: "سُورَةُ النِّسَاء",
      englishName: "An-Nisa",
      verses: 176,
      type: "medinan",
      duration: "1:35:15",
      revelation_order: 92,
      meaning: "النساء",
    },
    {
      id: 5,
      name: "المائدة",
      arabicName: "سُورَةُ الْمَائِدَة",
      englishName: "Al-Ma'idah",
      verses: 120,
      type: "medinan",
      duration: "1:25:30",
      revelation_order: 112,
      meaning: "المائدة",
    },
    {
      id: 6,
      name: "الأنعام",
      arabicName: "سُورَةُ الْأَنْعَام",
      englishName: "Al-An'am",
      verses: 165,
      type: "meccan",
      duration: "1:40:25",
      revelation_order: 55,
      meaning: "الأنعام",
    },
    {
      id: 7,
      name: "الأعراف",
      arabicName: "سُورَةُ الْأَعْرَاف",
      englishName: "Al-A'raf",
      verses: 206,
      type: "meccan",
      duration: "1:50:10",
      revelation_order: 39,
      meaning: "الأعراف",
    },
  ];

  const reciters: Reciter[] = [
    {
      id: "mishary",
      name: "مشاري راشد العفاسي",
      arabicName: "مشاري راشد العفاسي",
      englishName: "Mishary Rashid Al-Afasy",
      country: "الكويت",
      countryFlag: "🇰🇼",
      style: "حفص عن عاصم",
      description: "قارئ مشهور بصوته العذب وتلاوته المؤثرة",
      followers: "غير متاح",
      rating: 0,
      totalRecitations: 0,
      speciality: "التلاوة المرتلة",
      avatar: "🎙️",
      isVerified: false,
      popularSurahs: ["الفاتحة", "البقرة", "آل عمران"],
    },
    {
      id: "sudais",
      name: "عبد الرحمن السديس",
      arabicName: "عبد الرحمن السديس",
      englishName: "Abdul Rahman Al-Sudais",
      country: "السعودية",
      countryFlag: "🇸🇦",
      style: "حفص عن عاصم",
      description: "إمام الحرم المكي الشريف",
      followers: "غير متاح",
      rating: 0,
      totalRecitations: 0,
      speciality: "التلاوة الخاشعة",
      avatar: "🕌",
      isVerified: false,
      popularSurahs: ["الكهف", "يس", "الرحمن"],
    },
    {
      id: "shuraim",
      name: "سعود الشريم",
      arabicName: "سعود الشريم",
      englishName: "Saud Al-Shuraim",
      country: "السعودية",
      countryFlag: "🇸🇦",
      style: "حفص عن عاصم",
      description: "إمام الحرم المكي الشريف سابقاً",
      followers: "غير متاح",
      rating: 0,
      totalRecitations: 0,
      speciality: "التلاوة العاطفية",
      avatar: "🎙️",
      isVerified: false,
      popularSurahs: ["الملك", "الفجر", "الليل"],
    },
    {
      id: "maher",
      name: "ماهر المعيقلي",
      arabicName: "ماهر المعيقلي",
      englishName: "Maher Al-Muaiqly",
      country: "السعودية",
      countryFlag: "🇸🇦",
      style: "حفص عن عاصم",
      description: "إمام الحرم المكي الشريف",
      followers: "غير متاح",
      rating: 0,
      totalRecitations: 0,
      speciality: "التلاوة الحزينة",
      avatar: "🎵",
      isVerified: false,
      popularSurahs: ["مريم", "طه", "الأنبياء"],
    },
    {
      id: "minshawi",
      name: "محمد صديق المنشاوي",
      arabicName: "محمد صديق المنشاوي",
      englishName: "Mohamed Siddiq Al-Minshawi",
      country: "مصر",
      countryFlag: "🇪🇬",
      style: "حفص عن عاصم",
      description: "أسطورة القراءة والتجويد",
      followers: "غير متاح",
      rating: 0,
      totalRecitations: 0,
      speciality: "التجويد المثالي",
      avatar: "👑",
      isVerified: false,
      popularSurahs: ["الواقعة", "الحاقة", "المعارج"],
    },
  ];

  const currentSurahData = surahs[currentSurah];
  const currentReciterData = reciters[currentReciter];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else if (currentSurah < surahs.length - 1) {
        setCurrentSurah((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeating, currentSurah]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Honesty gate: never present a playing state without bound media.
    if (!audio.currentSrc && !audio.src) {
      setMediaBlocked(true);
      setIsPlaying(false);
      return;
    }
    setMediaBlocked(false);

    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play().catch(() => {
        setMediaBlocked(true);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume / 100;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const nextSurah = () => {
    if (currentSurah < surahs.length - 1) {
      setCurrentSurah((prev) => prev + 1);
    }
  };

  const previousSurah = () => {
    if (currentSurah > 0) {
      setCurrentSurah((prev) => prev - 1);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-1000",
        mode === "heaven"
          ? "bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30"
          : "bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50",
      )}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-1000",
            mode === "heaven"
              ? "bg-gradient-to-r from-white/5 via-purple-200/10 to-pink-200/5"
              : "bg-gradient-to-r from-emerald-100/20 via-blue-100/20 to-purple-100/20",
          )}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-12">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-300 hover:scale-110",
            mode === "heaven"
              ? "text-white hover:bg-white/10"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <h1
            className={cn(
              "text-3xl font-bold font-amiri transition-colors duration-700",
              mode === "heaven" ? "text-white" : "text-gray-800",
            )}
          >
            {mode === "heaven"
              ? "🎙️ القرآن الصوتي المبارك"
              : "🎧 القرآن الصوتي"}
          </h1>
          <p
            className={cn(
              "text-sm font-inter transition-colors duration-700",
              mode === "heaven" ? "text-white/80" : "text-gray-600",
            )}
          >
            {mode === "heaven" ? "استمع بخشوع وتدبر" : "Audio Quran Collection"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-300 hover:scale-110",
            mode === "heaven"
              ? "text-white hover:bg-white/10"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      <div className="relative z-10 px-6 space-y-8">
        {/* Current Reciter Card - Enhanced */}
        <Card
          className={cn(
            "overflow-hidden transition-all duration-700",
            mode === "heaven" ? "divine-glow" : "earth-clean",
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Reciter Avatar */}
              <div className="relative">
                <div
                  className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110",
                    mode === "heaven"
                      ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/30"
                      : "bg-gradient-to-br from-emerald-400 to-green-500",
                  )}
                >
                  <span className="text-3xl">{currentReciterData.avatar}</span>
                </div>

                {/* Verified Badge */}
                {currentReciterData.isVerified && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Live Indicator */}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-bold",
                    isPlaying
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-500 text-white",
                  )}
                >
                  {isPlaying ? "LIVE" : "●"}
                </div>
              </div>

              {/* Reciter Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <h3
                    className={cn(
                      "text-xl font-amiri font-bold transition-colors duration-700",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    {currentReciterData.arabicName}
                  </h3>
                  <span className="text-lg">
                    {currentReciterData.countryFlag}
                  </span>
                </div>

                <p
                  className={cn(
                    "text-sm mb-2 transition-colors duration-700",
                    mode === "heaven" ? "text-white/80" : "text-gray-600",
                  )}
                >
                  {currentReciterData.englishName} •{" "}
                  {currentReciterData.country}
                </p>

                {/* Rights state: engagement metrics are not collected; audio
                    rights for in-platform playback are pending review. */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <ShieldCheck className="w-3 h-3" />
                    <span>بيانات الاستماع غير متاحة</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Music className="w-3 h-3" />
                    <span>حقوق التشغيل قيد المراجعة</span>
                  </div>
                </div>
              </div>

              {/* Change Reciter Button */}
              <Button
                onClick={() => setShowReciterList(!showReciterList)}
                variant="outline"
                size="sm"
                className={cn(
                  "transition-all duration-300 hover:scale-105",
                  mode === "heaven"
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                )}
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    showReciterList && "rotate-180",
                  )}
                />
                <span className="mr-2 rtl:ml-2 hidden sm:inline">
                  تغيير القارئ
                </span>
              </Button>
            </div>

            {/* Reciter Details */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "p-3 rounded-xl transition-all duration-700",
                  mode === "heaven" ? "bg-white/10" : "bg-gray-100",
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-1 transition-colors duration-700",
                    mode === "heaven" ? "text-white/70" : "text-gray-500",
                  )}
                >
                  طريقة القراءة
                </div>
                <div
                  className={cn(
                    "font-amiri font-bold transition-colors duration-700",
                    mode === "heaven" ? "text-white" : "text-gray-800",
                  )}
                >
                  {currentReciterData.style}
                </div>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl transition-all duration-700",
                  mode === "heaven" ? "bg-white/10" : "bg-gray-100",
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-1 transition-colors duration-700",
                    mode === "heaven" ? "text-white/70" : "text-gray-500",
                  )}
                >
                  التخصص
                </div>
                <div
                  className={cn(
                    "font-amiri font-bold transition-colors duration-700",
                    mode === "heaven" ? "text-white" : "text-gray-800",
                  )}
                >
                  {currentReciterData.speciality}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reciter Selection List */}
        {showReciterList && (
          <Card
            className={cn(
              "overflow-hidden transition-all duration-700",
              mode === "heaven" ? "divine-glow" : "earth-clean",
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle
                className={cn(
                  "text-lg font-amiri flex items-center space-x-2 rtl:space-x-reverse transition-colors duration-700",
                  mode === "heaven" ? "text-white" : "text-gray-800",
                )}
              >
                <Mic className="w-5 h-5" />
                <span>اختر القارئ المفضل</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reciters.map((reciter, index) => (
                <div
                  key={reciter.id}
                  onClick={() => {
                    setCurrentReciter(index);
                    setShowReciterList(false);
                  }}
                  className={cn(
                    "flex items-center space-x-4 rtl:space-x-reverse p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105",
                    index === currentReciter
                      ? mode === "heaven"
                        ? "bg-white/20 border-2 border-white/30"
                        : "bg-emerald-100 border-2 border-emerald-300"
                      : mode === "heaven"
                        ? "hover:bg-white/10"
                        : "hover:bg-gray-50",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                        index === currentReciter
                          ? mode === "heaven"
                            ? "bg-white/20 border border-white/30"
                            : "bg-emerald-500"
                          : mode === "heaven"
                            ? "bg-white/10"
                            : "bg-gray-200",
                      )}
                    >
                      <Book className="w-5 h-5 mr-2" />
                    </div>
                    {reciter.isVerified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Reciter Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                      <h4
                        className={cn(
                          "font-amiri font-bold transition-colors duration-700",
                          mode === "heaven" ? "text-white" : "text-gray-800",
                        )}
                      >
                        {reciter.name}
                      </h4>
                      <span>{reciter.countryFlag}</span>
                    </div>
                    <p
                      className={cn(
                        "text-sm mb-2 transition-colors duration-700",
                        mode === "heaven" ? "text-white/70" : "text-gray-600",
                      )}
                    >
                      {reciter.description}
                    </p>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <ShieldCheck className="w-3 h-3" />
                        <span>بيانات الاستماع غير متاحة</span>
                      </div>
                    </div>
                  </div>

                  {/* Popular Surahs */}
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-xs mb-1 transition-colors duration-700",
                        mode === "heaven" ? "text-white/60" : "text-gray-500",
                      )}
                    >
                      السور المشهورة
                    </div>
                    <div className="space-y-1">
                      {reciter.popularSurahs.slice(0, 2).map((surah, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            mode === "heaven"
                              ? "bg-white/10 text-white"
                              : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {surah}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Surah Info - Enhanced */}
        <Card
          className={cn(
            "overflow-hidden transition-all duration-700",
            mode === "heaven"
              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-300/30"
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
          )}
        >
          <CardContent className="p-8">
            <div className="text-center">
              {/* Surah Header */}
              <div className="mb-6">
                <h2
                  className={cn(
                    "text-4xl font-amiri font-bold mb-3 transition-colors duration-700",
                    mode === "heaven" ? "text-amber-200" : "text-amber-800",
                  )}
                >
                  {currentSurahData.arabicName}
                </h2>
                <h3
                  className={cn(
                    "text-xl font-inter mb-4 transition-colors duration-700",
                    mode === "heaven" ? "text-amber-300" : "text-amber-700",
                  )}
                >
                  {currentSurahData.englishName} • {currentSurahData.meaning}
                </h3>

                {/* Surah Stats */}
                <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse text-sm">
                  <Badge
                    className={cn(
                      "text-xs px-3 py-1",
                      currentSurahData.type === "meccan"
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-500 text-white",
                    )}
                  >
                    <Globe className="w-3 h-3 mr-1 rtl:ml-1" />
                    {currentSurahData.type === "meccan" ? "مكية" : "مدنية"}
                  </Badge>
                  <span
                    className={cn(
                      "flex items-center space-x-1 rtl:space-x-reverse transition-colors duration-700",
                      mode === "heaven" ? "text-white/80" : "text-gray-600",
                    )}
                  >
                    <Music className="w-4 h-4" />
                    <span>{currentSurahData.verses} آية</span>
                  </span>
                  <span
                    className={cn(
                      "flex items-center space-x-1 rtl:space-x-reverse transition-colors duration-700",
                      mode === "heaven" ? "text-white/80" : "text-gray-600",
                    )}
                  >
                    <Timer className="w-4 h-4" />
                    <span>مدة التسجيل: غير مربوطة</span>
                  </span>
                  <span
                    className={cn(
                      "flex items-center space-x-1 rtl:space-x-reverse transition-colors duration-700",
                      mode === "heaven" ? "text-white/80" : "text-gray-600",
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>#{currentSurahData.revelation_order}</span>
                  </span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-3">
                  <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div
                    className={cn(
                      "flex justify-between text-sm transition-colors duration-700",
                      mode === "heaven" ? "text-white/80" : "text-gray-600",
                    )}
                  >
                    <span>{formatTime(currentTime)}</span>
                    <span className="font-amiri">
                      {isPlaying ? "🔊 يُشغّل الآن" : "⏸️ متوقف"}
                    </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsShuffling(!isShuffling)}
                    className={cn(
                      "transition-all duration-300 hover:scale-110",
                      mode === "heaven"
                        ? "text-white hover:bg-white/20"
                        : "text-gray-600 hover:bg-gray-100",
                      isShuffling &&
                        (mode === "heaven"
                          ? "text-amber-300 bg-white/20"
                          : "text-amber-600 bg-amber-100"),
                    )}
                  >
                    <Shuffle className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousSurah}
                    disabled={currentSurah === 0}
                    className={cn(
                      "transition-all duration-300 hover:scale-110 disabled:opacity-50",
                      mode === "heaven"
                        ? "text-white hover:bg-white/20"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <SkipBack className="w-7 h-7" />
                  </Button>

                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className={cn(
                      "w-20 h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl",
                      mode === "heaven"
                        ? "bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        : "bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600",
                      isPlaying && "animate-pulse",
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSurah}
                    disabled={currentSurah === surahs.length - 1}
                    className={cn(
                      "transition-all duration-300 hover:scale-110 disabled:opacity-50",
                      mode === "heaven"
                        ? "text-white hover:bg-white/20"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <SkipForward className="w-7 h-7" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRepeating(!isRepeating)}
                    className={cn(
                      "transition-all duration-300 hover:scale-110",
                      mode === "heaven"
                        ? "text-white hover:bg-white/20"
                        : "text-gray-600 hover:bg-gray-100",
                      isRepeating &&
                        (mode === "heaven"
                          ? "text-amber-300 bg-white/20"
                          : "text-amber-600 bg-amber-100"),
                    )}
                  >
                    <Repeat className="w-6 h-6" />
                  </Button>
                </div>

                {/* Playback rights state: always visible, never implied. */}
                <div
                  role="status"
                  className={cn(
                    "mx-auto max-w-xl rounded-xl border px-4 py-2.5 text-center text-xs font-tajawal leading-relaxed",
                    mode === "heaven"
                      ? "border-amber-300/30 bg-white/10 text-white/85"
                      : "border-amber-600/30 bg-amber-50 text-amber-900",
                  )}
                >
                  {mediaBlocked
                    ? "لا يوجد ملف صوتي مربوط بهذا الزر — التشغيل الداخلي معطل حتى توثيق حقوق التسجيل لكل قارئ."
                    : "وحدة الاستماع الداخلية غير مفعّلة بعد: لا وسيط صوتي موثق الحقوق مربوط حاليًا."}
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse">
                  {/* Volume Control */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Volume2
                      className={cn(
                        "w-5 h-5 transition-colors duration-700",
                        mode === "heaven" ? "text-white/80" : "text-gray-600",
                      )}
                    />
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-24"
                    />
                    <span
                      className={cn(
                        "text-sm w-8 transition-colors duration-700",
                        mode === "heaven" ? "text-white/80" : "text-gray-600",
                      )}
                    >
                      {volume}%
                    </span>
                  </div>

                  {/* Speed Control */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <TrendingUp
                      className={cn(
                        "w-4 h-4 transition-colors duration-700",
                        mode === "heaven" ? "text-white/80" : "text-gray-600",
                      )}
                    />
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className={cn(
                        "px-2 py-1 rounded text-sm transition-all duration-700",
                        mode === "heaven"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white border border-gray-200",
                      )}
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Enhanced */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: Download,
              label: "تحميل",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Heart,
              label: "مفضلة",
              color: "from-red-500 to-pink-600",
              active: isFavorite,
              onClick: () => setIsFavorite(!isFavorite),
            },
            {
              icon: Share2,
              label: "مشاركة",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: Bookmark,
              label: "علامة",
              color: "from-purple-500 to-violet-600",
            },
          ].map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className={cn(
                "flex flex-col items-center py-6 rounded-2xl font-amiri transition-all duration-300 hover:scale-105 hover:shadow-lg",
                mode === "heaven"
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-white/80 border-gray-200 hover:bg-white",
                action.active &&
                  (mode === "heaven"
                    ? "bg-red-500/20 border-red-400/30"
                    : "bg-red-50 border-red-200"),
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-xl mb-2 transition-all duration-300",
                  `bg-gradient-to-r ${action.color}`,
                )}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
