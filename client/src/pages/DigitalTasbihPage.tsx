import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  RotateCcw,
  Share2,
  Settings,
  Volume2,
  ArrowLeft,
  Star,
  ChevronDown,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DigitalTasbihPage() {
  const { t, isRTL } = useLanguage();
  const [count, setCount] = useState(33);
  const [currentDhikr, setCurrentDhikr] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isVibrating, setIsVibrating] = useState(false);

  const dhikrList = [
    {
      text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
      translation: "Glory be to Allah and praise be to Him",
      target: 100,
      reward: "من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه",
    },
    {
      text: "لَا إِلَٰهَ إِلَّا اللَّهُ",
      translation: "There is no god but Allah",
      target: 100,
      reward: "أفضل الذكر لا إله إلا الله",
    },
    {
      text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
      translation: "O Allah, send blessings upon Muhammad",
      target: 100,
      reward: "من صلى علي واحدة صلى الله عليه عشرا",
    },
    {
      text: "أَسْتَغْفِرُ اللَّهَ",
      translation: "I seek forgiveness from Allah",
      target: 100,
      reward: "من استغفر الله كان له من كل هم فرجا",
    },
    {
      text: "الْحَمْدُ لِلَّهِ",
      translation: "Praise be to Allah",
      target: 100,
      reward: "الحمد لله تملأ الميزان",
    },
  ];

  const currentDhikrData = dhikrList[currentDhikr];
  const progress = (count / currentDhikrData.target) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleTap = () => {
    setCount((prev) => prev + 1);
    setTotalCount((prev) => prev + 1);
    setIsVibrating(true);

    // Vibration effect
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setTimeout(() => setIsVibrating(false), 150);

    // Reset when target reached
    if (count >= currentDhikrData.target - 1) {
      setTimeout(() => {
        setCount(0);
        // Show completion message
      }, 500);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const nextDhikr = () => {
    setCurrentDhikr((prev) => (prev + 1) % dhikrList.length);
    setCount(0);
  };

  const previousDhikr = () => {
    setCurrentDhikr((prev) => (prev - 1 + dhikrList.length) % dhikrList.length);
    setCount(0);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString("ar-SA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-green-900 to-emerald-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <h1 className="text-xl font-bold font-amiri">التسبيح</h1>
          <p className="text-sm opacity-75 font-inter">Digital Dhikr</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Time and Date */}
      <div className="text-center mb-8">
        <div className="text-3xl font-bold font-mono mb-1">{formatTime()}</div>
        <div className="text-sm opacity-75 font-amiri">{formatDate()}</div>
      </div>

      {/* Dhikr Selector */}
      <div className="px-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousDhikr}
                className="text-white hover:bg-white/10"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </Button>

              <div className="text-center flex-1">
                <div className="text-lg font-amiri font-bold mb-1">
                  {currentDhikrData.text}
                </div>
                <div className="text-xs opacity-75 font-inter">
                  {currentDhikrData.translation}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextDhikr}
                className="text-white hover:bg-white/10"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <span className="text-xs opacity-75">الهدف:</span>
              <Badge className="bg-emerald-500 text-white">
                {currentDhikrData.target}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Counter Circle */}
      <div className="flex-1 flex items-center justify-center px-6 mb-8">
        <div className="relative">
          {/* Background Circle */}
          <div className="w-80 h-80 relative">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 250 250"
            >
              {/* Background track */}
              <circle
                cx="125"
                cy="125"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />

              {/* Progress circle */}
              <circle
                cx="125"
                cy="125"
                r="120"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out"
              />

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={handleTap}
                className={cn(
                  "w-52 h-52 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 border-4 border-white/20 shadow-2xl transition-all duration-150",
                  isVibrating ? "scale-95" : "scale-100",
                )}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold font-mono mb-2">
                    {count}
                  </div>
                  <div className="text-sm opacity-90 font-amiri">
                    اضغط للتسبيح
                  </div>
                  <div className="text-xs opacity-75 font-inter mt-1">TAP</div>
                </div>
              </Button>
            </div>

            {/* Progress indicators */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                <span className="text-sm font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                <span className="text-xs">
                  {count} / {currentDhikrData.target}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <RotateCcw className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">إعادة</span>
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">صوت</span>
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">مشاركة</span>
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <Star className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">المفضلة</span>
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 mb-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 divide-x divide-white/20 rtl:divide-x-reverse">
              <div className="text-center px-4">
                <div className="text-2xl font-bold font-mono">{totalCount}</div>
                <div className="text-xs opacity-75 font-amiri">
                  إجمالي اليوم
                </div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold font-mono">5</div>
                <div className="text-xs opacity-75 font-amiri">أنواع الذكر</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold font-mono">3</div>
                <div className="text-xs opacity-75 font-amiri">مكتملة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Text */}
      {currentDhikrData.reward && (
        <div className="px-6 mb-6">
          <Card className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-300/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-4 h-4 text-amber-900" />
                </div>
                <div className="flex-1">
                  <h3 className="font-amiri font-bold text-amber-100 mb-1">
                    فضل الذكر
                  </h3>
                  <p className="text-sm text-amber-200 leading-relaxed font-amiri">
                    {currentDhikrData.reward}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation Space */}
      <div className="h-20"></div>
    </div>
  );
}
