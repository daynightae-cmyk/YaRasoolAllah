import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuranRecitation } from "@/data/quranAudio";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Heart,
  Share2,
  Repeat,
  Shuffle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  recitation: QuranRecitation;
  currentSurah?: number;
  onSurahChange?: (surah: number) => void;
  autoPlay?: boolean;
  className?: string;
}

export default function AudioPlayer({
  recitation,
  currentSurah = 1,
  onSurahChange,
  autoPlay = false,
  className,
}: AudioPlayerProps) {
  const { t, isRTL } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock surah data - في التطبيق الحقيقي ستأتي من API
  const surahs = Array.from({ length: 114 }, (_, i) => ({
    number: i + 1,
    name: `سورة ${i + 1}`,
    nameEn: `Surah ${i + 1}`,
    verses: Math.floor(Math.random() * 200) + 1,
  }));

  const currentSurahData =
    surahs.find((s) => s.number === currentSurah) || surahs[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else if (currentSurah < 114) {
        handleNextSurah();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat, currentSurah]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      handlePlay();
    }
  }, [autoPlay, currentSurah]);

  const handlePlay = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume / 100 : 0;
    }
  };

  const handlePreviousSurah = () => {
    if (currentSurah > 1) {
      onSurahChange?.(currentSurah - 1);
    }
  };

  const handleNextSurah = () => {
    if (currentSurah < 114) {
      onSurahChange?.(currentSurah + 1);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    window.open(recitation.downloadUrl, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${recitation.reciterName} - ${currentSurahData.name}`,
        text: `استمع إلى تلاوة ${currentSurahData.name} بصوت ${recitation.reciterName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // يمكن إضافة toast notification هنا
    }
  };

  // In a real app, this would generate the actual audio URL for the specific surah
  const getAudioUrl = () => {
    // This is a placeholder - في التطبيق الحقيقي سيتم بناء رابط مناسب للسورة المحددة
    return `${recitation.downloadUrl}/surah_${currentSurah.toString().padStart(3, "0")}.mp3`;
  };

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 shadow-xl",
        className,
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">🎧</span>
            </div>
            <div>
              <h3 className="text-xl font-bold font-amiri text-emerald-800 dark:text-emerald-200">
                {currentSurahData.name}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-inter">
                {recitation.reciterName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Badge className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-0">
              {currentSurah} / 114
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "p-2",
                isFavorite ? "text-red-500" : "text-gray-500",
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} src={getAudioUrl()} preload="metadata" />

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(
              "p-2",
              isShuffle ? "text-emerald-600" : "text-gray-500",
            )}
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousSurah}
            disabled={currentSurah === 1}
            className="p-2"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            size="lg"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextSurah}
            disabled={currentSurah === 114}
            className="p-2"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn(
              "p-2",
              isRepeat ? "text-emerald-600" : "text-gray-500",
            )}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMute}
            className="p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
            {Math.round(isMuted ? 0 : volume)}%
          </span>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2 rtl:ml-2" />
              تحميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Share2 className="w-4 h-4 mr-2 rtl:ml-2" />
              مشاركة
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-500">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Surah Info */}
        <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 font-inter">
                السورة
              </div>
              <div className="font-bold text-emerald-800 dark:text-emerald-200 font-amiri">
                {currentSurahData.name}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 font-inter">
                عدد الآيات
              </div>
              <div className="font-bold text-emerald-800 dark:text-emerald-200">
                {currentSurahData.verses} آية
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
