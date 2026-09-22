import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Zap,
  BookOpen,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SpiritualMood {
  id: string;
  name: string;
  icon: React.ReactNode;
  verse: string;
  verseRef: string;
  dua: string;
  color: string;
  bgGradient: string;
}

export default function SpiritualHub() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMood, setCurrentMood] = useState<SpiritualMood | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const spiritualMoods: SpiritualMood[] = [
    {
      id: "peaceful",
      name: "سكينة وطمأنينة",
      icon: <Heart className="w-6 h-6" />,
      verse: "ألا بذكر الله تطمئن القلوب",
      verseRef: "الرعد: 28",
      dua: "اللهم أعني على ذكرك وشكرك وحسن عبادتك",
      color: "emerald",
      bgGradient: "from-emerald-400 to-emerald-600",
    },
    {
      id: "grateful",
      name: "شكر وامتنان",
      icon: <Star className="w-6 h-6" />,
      verse: "لئن شكرتم لأزيدنكم",
      verseRef: "إبراهيم: 7",
      dua: "اللهم أعني على شكرك ونعمك الجليلة",
      color: "amber",
      bgGradient: "from-amber-400 to-amber-600",
    },
    {
      id: "hopeful",
      name: "أمل ورجاء",
      icon: <Sunrise className="w-6 h-6" />,
      verse: "ومن يتق الله يجعل له مخرجا",
      verseRef: "الطلاق: 2",
      dua: "اللهم إني أسألك من خير ما أنت أعلم به",
      color: "blue",
      bgGradient: "from-blue-400 to-blue-600",
    },
    {
      id: "seeking",
      name: "طلب وابتهال",
      icon: <Crown className="w-6 h-6" />,
      verse: "وإذا سألك عبادي عني فإني قريب",
      verseRef: "البقرة: 186",
      dua: "اللهم إني أسألك من فضلك ورحمتك",
      color: "purple",
      bgGradient: "from-purple-400 to-purple-600",
    },
  ];

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12)
      return {
        text: "صباح مبارك",
        icon: <Sun className="w-5 h-5" />,
        color: "text-amber-500",
      };
    if (hour >= 12 && hour < 17)
      return {
        text: "نهار مبارك",
        icon: <Sun className="w-5 h-5" />,
        color: "text-orange-500",
      };
    if (hour >= 17 && hour < 20)
      return {
        text: "مساء مبارك",
        icon: <Sunset className="w-5 h-5" />,
        color: "text-pink-500",
      };
    return {
      text: "ليلة مباركة",
      icon: <Moon className="w-5 h-5" />,
      color: "text-indigo-500",
    };
  };

  const greeting = getTimeBasedGreeting();

  useEffect(() => {
    // Set random mood on component mount
    const randomMood =
      spiritualMoods[Math.floor(Math.random() * spiritualMoods.length)];
    setCurrentMood(randomMood);
  }, []);

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-indigo-100/20 to-blue-100/20 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-blue-900/10 rounded-3xl blur-xl"></div>

      <Card className="relative bg-white/30 dark:bg-white/10 backdrop-blur-lg border border-white/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg animate-glow-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-amiri font-bold text-gray-900 dark:text-white">
                  🌌 باب السماء المفتوح
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                  مركزك الروحي الشخصي
                </p>
              </div>
            </div>

            <Badge className="bg-purple-500 text-white border-0 px-3 py-1 font-amiri animate-badge-glow">
              خارق
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Time and Greeting */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-4">
              <div className={greeting.color}>{greeting.icon}</div>
              <span className="text-sm font-amiri text-gray-700 dark:text-gray-300">
                {greeting.text}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-inter">
                {currentTime.toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          </div>

          {/* Current Spiritual State */}
          {currentMood && (
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10 rounded-2xl blur-sm",
                  currentMood.bgGradient,
                )}
              ></div>

              <div className="relative bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div
                    className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-lg animate-spiritual-breath",
                      `bg-gradient-to-br ${currentMood.bgGradient}`,
                    )}
                  >
                    <div className="text-white">{currentMood.icon}</div>
                  </div>
                  <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-2">
                    حالتك الروحية: {currentMood.name}
                  </h3>
                </div>

                {/* Verse */}
                <div className="text-center mb-4">
                  <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                    <p className="text-lg font-amiri text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
                      "{currentMood.verse}"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                      {currentMood.verseRef}
                    </p>
                  </div>
                </div>

                {/* Dua */}
                <div className="text-center mb-4">
                  <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse justify-center mb-2">
                      <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-inter text-gray-600 dark:text-gray-400">
                        دعاء مخصص لك
                      </span>
                    </div>
                    <p className="text-base font-amiri text-gray-800 dark:text-gray-200 italic">
                      {currentMood.dua}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/bab-alsamaa-settings" asChild>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-amiri py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Heart className="w-5 h-5 ml-2 rtl:mr-2" />
                تحدث معنا
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => {
                const newMood =
                  spiritualMoods[
                    Math.floor(Math.random() * spiritualMoods.length)
                  ];
                setCurrentMood(newMood);
              }}
              className="w-full bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20 font-amiri py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 ml-2 rtl:mr-2" />
              تحديث الحالة
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-amiri">
                12
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                جلسة اليوم
              </div>
            </div>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-amiri">
                85%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                السك��نة
              </div>
            </div>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-3">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-amiri">
                48
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                أجر اليوم
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
