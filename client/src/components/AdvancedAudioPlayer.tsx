import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  Share2,
  Heart,
  Bookmark,
  Radio,
  Mic2,
  Headphones,
  Music,
  Disc3,
  Waves,
  Sliders,
  Settings,
  Clock,
  Star,
  Globe,
  Award,
  Users,
  Eye,
  MessageCircle,
  TrendingUp,
  Zap,
  Sparkles,
  Crown,
  Diamond,
  Flame,
  Target,
  RefreshCw,
  Timer,
  BarChart3,
  Activity,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  className?: string;
  currentTrack?: {
    id: string;
    title: string;
    arabic: string;
    reciter: string;
    duration: number;
    surah: string;
    verses: number;
    type: "meccan" | "medinan";
    meaning: string;
    cover?: string;
  };
}

export default function AdvancedAudioPlayer({
  className,
  currentTrack,
}: AudioPlayerProps) {
  const { mode } = useTheme();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [listeners, setListeners] = useState(1247);
  const [downloads, setDownloads] = useState(8924);
  const [likes, setLikes] = useState(2156);

  // Default track if none provided
  const track = currentTrack || {
    id: "1",
    title: "سورة الفاتحة",
    arabic: "سُورَةُ الْفَاتِحَة",
    reciter: "مشاري راشد العفاسي",
    duration: 90,
    surah: "الفاتحة",
    verses: 7,
    type: "meccan" as const,
    meaning: "الافتتاح",
  };

  // Equalizer bands
  const [equalizerBands, setEqualizerBands] = useState([
    { freq: "60Hz", value: 0 },
    { freq: "170Hz", value: 5 },
    { freq: "310Hz", value: 3 },
    { freq: "600Hz", value: 0 },
    { freq: "1kHz", value: -2 },
    { freq: "3kHz", value: 4 },
    { freq: "6kHz", value: 2 },
    { freq: "12kHz", value: 1 },
    { freq: "14kHz", value: 0 },
    { freq: "16kHz", value: -1 },
  ]);

  // Visualizer data
  const [visualizerData, setVisualizerData] = useState(
    Array.from({ length: 32 }, () => Math.random() * 100),
  );

  useEffect(() => {
    // Simulate audio visualizer
    if (isPlaying) {
      const interval = setInterval(() => {
        setVisualizerData((prev) => prev.map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      if (isPlaying) {
        setListeners((prev) => prev + Math.floor(Math.random() * 3));
        setCurrentTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentTime(0);
      setDuration(track.duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 transition-all duration-1000",
        mode === "heaven"
          ? "bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 border-white/20 backdrop-blur-xl"
          : "bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200 backdrop-blur-sm",
        className,
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient */}
        <div
          className={cn(
            "absolute inset-0 opacity-30 transition-all duration-1000",
            isPlaying && "animate-pulse",
            mode === "heaven"
              ? "bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"
              : "bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10",
          )}
        ></div>

        {/* Floating Particles */}
        {mode === "heaven" && isPlaying && (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            {/* Track Info */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500",
                    isPlaying && "animate-pulse scale-105",
                    mode === "heaven"
                      ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-md border border-white/30"
                      : "bg-gradient-to-br from-emerald-400 to-green-500",
                  )}
                >
                  {isPlaying ? (
                    <Waves
                      className={cn(
                        "w-10 h-10 animate-pulse",
                        mode === "heaven" ? "text-white" : "text-white",
                      )}
                    />
                  ) : (
                    <Music
                      className={cn(
                        "w-10 h-10",
                        mode === "heaven" ? "text-white" : "text-white",
                      )}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-3xl font-amiri font-bold mb-2 transition-colors duration-700",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    {track.arabic}
                  </h3>
                  <p
                    className={cn(
                      "text-xl font-inter mb-2 transition-colors duration-700",
                      mode === "heaven" ? "text-white/80" : "text-gray-600",
                    )}
                  >
                    {track.title} • {track.meaning}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        "text-sm",
                        track.type === "meccan"
                          ? "bg-emerald-500"
                          : "bg-blue-500",
                      )}
                    >
                      {track.type === "meccan" ? "مكية" : "مدنية"}
                    </Badge>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        mode === "heaven" ? "text-white/70" : "text-gray-500",
                      )}
                    >
                      {track.verses} آية
                    </span>
                  </div>
                </div>
              </div>

              {/* Reciter Info */}
              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl transition-all duration-700",
                  mode === "heaven" ? "bg-white/10" : "bg-gray-100",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    mode === "heaven" ? "bg-white/20" : "bg-white",
                  )}
                >
                  <Mic2
                    className={cn(
                      "w-6 h-6",
                      mode === "heaven" ? "text-white" : "text-gray-600",
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-amiri font-bold",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    {track.reciter}
                  </div>
                  <div
                    className={cn(
                      "text-sm",
                      mode === "heaven" ? "text-white/70" : "text-gray-600",
                    )}
                  >
                    القارئ المعتمد
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700">
                  <Crown className="w-3 h-3 mr-1 rtl:ml-1" />
                  معتمد
                </Badge>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="flex flex-col gap-3 ml-6 rtl:mr-6">
            {[
              {
                icon: <Users className="w-4 h-4" />,
                value: listeners.toLocaleString("ar"),
                label: "مستمع",
              },
              {
                icon: <Download className="w-4 h-4" />,
                value: downloads.toLocaleString("ar"),
                label: "تحميل",
              },
              {
                icon: <Heart className="w-4 h-4" />,
                value: likes.toLocaleString("ar"),
                label: "إعجاب",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-700",
                  mode === "heaven"
                    ? "bg-white/10 text-white"
                    : "bg-white/80 text-gray-700",
                )}
              >
                {stat.icon}
                <span className="font-bold">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Visualizer */}
        {isPlaying && (
          <div className="flex items-end justify-center gap-1 h-16 mb-8">
            {visualizerData.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 rounded-full transition-all duration-150 ease-out",
                  mode === "heaven"
                    ? "bg-gradient-to-t from-purple-400 to-pink-400"
                    : "bg-gradient-to-t from-emerald-400 to-blue-400",
                )}
                style={{ height: `${Math.max(height * 0.6, 8)}px` }}
              />
            ))}
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-6 mb-8">
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
                "flex justify-between items-center text-sm transition-colors duration-700",
                mode === "heaven" ? "text-white/80" : "text-gray-600",
              )}
            >
              <span className="font-mono">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-2">
                {isPlaying && (
                  <Badge className="bg-red-500 text-white animate-pulse text-xs px-2 py-1">
                    <Radio className="w-3 h-3 mr-1 rtl:ml-1" />
                    مباشر
                  </Badge>
                )}
                <span className="font-amiri">
                  {isPlaying ? "قيد التشغيل" : "متوقف"}
                </span>
              </div>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Secondary Controls */}
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
              <Shuffle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-all duration-300 hover:scale-110",
                mode === "heaven"
                  ? "text-white hover:bg-white/20"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            {/* Play/Pause Button */}
            <Button
              onClick={togglePlay}
              size="lg"
              className={cn(
                "w-20 h-20 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 relative overflow-hidden group",
                mode === "heaven"
                  ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700"
                  : "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700",
                isPlaying && "animate-pulse shadow-3xl",
              )}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white relative z-10" />
              ) : (
                <Play className="w-10 h-10 text-white ml-1 relative z-10" />
              )}

              {/* Ripple Effect */}
              <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-500"></div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-all duration-300 hover:scale-110",
                mode === "heaven"
                  ? "text-white hover:bg-white/20"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <SkipForward className="w-6 h-6" />
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
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume and Secondary Controls */}
          <div className="flex items-center justify-between">
            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={cn(
                  "transition-all duration-300",
                  mode === "heaven"
                    ? "text-white hover:bg-white/20"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
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
                {isMuted ? 0 : volume}%
              </span>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <Gauge
                className={cn(
                  "w-4 h-4",
                  mode === "heaven" ? "text-white/80" : "text-gray-600",
                )}
              />
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm transition-all duration-700 border",
                  mode === "heaven"
                    ? "bg-white/10 text-white border-white/20 backdrop-blur-md"
                    : "bg-white border-gray-200",
                )}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Equalizer Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEqualizer(!showEqualizer)}
              className={cn(
                "transition-all duration-300",
                mode === "heaven"
                  ? "text-white hover:bg-white/20"
                  : "text-gray-600 hover:bg-gray-100",
                showEqualizer &&
                  (mode === "heaven" ? "bg-white/20" : "bg-gray-100"),
              )}
            >
              <Sliders className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Equalizer */}
        {showEqualizer && (
          <div
            className={cn(
              "p-6 rounded-2xl mb-8 transition-all duration-700",
              mode === "heaven"
                ? "bg-white/10 backdrop-blur-md"
                : "bg-gray-100",
            )}
          >
            <h4
              className={cn(
                "text-lg font-amiri font-bold mb-4 text-center",
                mode === "heaven" ? "text-white" : "text-gray-800",
              )}
            >
              🎛️ معادل الصوت المتقدم
            </h4>
            <div className="flex items-end justify-center gap-4">
              {equalizerBands.map((band, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="h-32 flex items-end">
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={band.value}
                      onChange={(e) => {
                        const newBands = [...equalizerBands];
                        newBands[index].value = Number(e.target.value);
                        setEqualizerBands(newBands);
                      }}
                      className={cn(
                        "h-24 w-6 appearance-none bg-transparent cursor-pointer",
                        "[-webkit-appearance:slider-vertical]",
                      )}
                      style={{ writingMode: "vertical-lr" as any }}
                    />
                  </div>
                  <div
                    className={cn(
                      "text-xs font-mono",
                      mode === "heaven" ? "text-white/70" : "text-gray-600",
                    )}
                  >
                    {band.freq}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-bold",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    {band.value > 0 ? "+" : ""}
                    {band.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: Heart,
              label: "إعجاب",
              color: "from-red-500 to-pink-600",
              active: isLiked,
              onClick: toggleLike,
              count: likes,
            },
            {
              icon: Bookmark,
              label: "حفظ",
              color: "from-blue-500 to-indigo-600",
              active: isBookmarked,
              onClick: () => setIsBookmarked(!isBookmarked),
            },
            {
              icon: Share2,
              label: "مشاركة",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: Download,
              label: "تحميل",
              color: "from-purple-500 to-violet-600",
              count: downloads,
            },
          ].map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className={cn(
                "flex flex-col items-center py-6 rounded-2xl font-amiri transition-all duration-300 hover:scale-105 group relative overflow-hidden",
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
                  "p-3 rounded-xl mb-2 transition-all duration-300 group-hover:scale-110",
                  `bg-gradient-to-r ${action.color}`,
                )}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold">{action.label}</span>
              {action.count && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs">
                  {action.count > 1000
                    ? `${Math.floor(action.count / 1000)}K`
                    : action.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
