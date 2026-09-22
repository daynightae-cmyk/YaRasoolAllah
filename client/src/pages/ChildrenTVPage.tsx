import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  childrenVideos,
  videoCategories,
  ChildrenVideo,
} from "@/data/childrenVideos";
import VideoPlayer from "@/components/ChildrenTV/VideoPlayer";
import CategorySidebar from "@/components/ChildrenTV/CategorySidebar";
import VideoGrid from "@/components/ChildrenTV/VideoGrid";
import AgeFilter from "@/components/ChildrenTV/AgeFilter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Settings, Volume2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ChildrenTVPage() {
  const { t, isRTL } = useLanguage();
  const { mode, toggleMode } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState<ChildrenVideo | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState("prophets");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  const filteredVideos = useMemo(() => {
    return childrenVideos.filter((video) => {
      const categoryMap: Record<string, string> = {
        prophets: "قصص الأنبياء",
        prayer: "تعليم الصلاة",
        morals: "الأخلاق والآداب",
        songs: "أناشيد",
        seerah: "السيرة",
        bedtime: "قصص قبل النوم",
        dhikr: "الأذكار اليومية",
      };

      return video.category === categoryMap[selectedCategory];
    });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating clouds */}
        <div className="absolute top-10 left-20 w-32 h-20 bg-white/30 dark:bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-32 right-32 w-24 h-16 bg-white/20 dark:bg-white/5 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-40 left-40 w-28 h-18 bg-white/25 dark:bg-white/8 rounded-full blur-xl animate-float-slow"></div>

        {/* Mosque silhouette */}
        <div className="absolute bottom-0 right-20 w-40 h-32 bg-gradient-to-t from-purple-200/30 to-transparent dark:from-purple-800/20 rounded-t-full opacity-60"></div>
        <div className="absolute bottom-0 right-32 w-8 h-24 bg-gradient-to-t from-purple-300/40 to-transparent dark:from-purple-700/30 rounded-full opacity-70"></div>

        {/* Stars */}
        <div className="absolute top-16 right-16 w-2 h-2 bg-yellow-300 dark:bg-yellow-400 rounded-full animate-twinkle"></div>
        <div className="absolute top-24 right-40 w-1.5 h-1.5 bg-yellow-300 dark:bg-yellow-400 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute top-40 right-60 w-1 h-1 bg-yellow-300 dark:bg-yellow-400 rounded-full animate-twinkle-slow"></div>

        {/* Colorful particles */}
        <div className="absolute top-20 left-1/4 w-3 h-3 bg-pink-300 dark:bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute top-60 left-1/3 w-2 h-2 bg-blue-300 dark:bg-blue-400 rounded-full animate-bounce-delayed"></div>
        <div className="absolute bottom-60 right-1/4 w-2.5 h-2.5 bg-green-300 dark:bg-green-400 rounded-full animate-bounce-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">📺</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-amiri">
                  الطفل المبين
                </h1>
                <p className="text-white/80 font-inter mt-1">
                  تلفازك التعليمي الإسلامي المفضل
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMode}
                className="text-white hover:bg-white/20 p-2"
              >
                {mode === "heaven" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20 p-2"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 flex items-center justify-center space-x-8 rtl:space-x-reverse">
            <div className="text-center">
              <div className="text-2xl font-bold font-amiri">
                {childrenVideos.length}
              </div>
              <div className="text-white/80 text-sm font-inter">
                فيديو تعليمي
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-amiri">
                {videoCategories.length}
              </div>
              <div className="text-white/80 text-sm font-inter">
                تصنيف متنوع
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-amiri">100%</div>
              <div className="text-white/80 text-sm font-inter">محتوى آمن</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-3 space-y-6">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            <AgeFilter
              selectedAgeGroup={selectedAgeGroup}
              onAgeGroupChange={setSelectedAgeGroup}
            />

            {/* Quick Stats Card */}
            <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🏆</span>
                </div>
                <h3 className="font-bold font-amiri text-yellow-800 dark:text-yellow-200 mb-2">
                  إنجازك اليوم
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-inter text-yellow-700 dark:text-yellow-300">
                      فيديوهات مشاهدة
                    </span>
                    <Badge className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-0">
                      3
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-inter text-yellow-700 dark:text-yellow-300">
                      دقائق تعلم
                    </span>
                    <Badge className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-0">
                      45
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Center - Video Player */}
          <div className="lg:col-span-6">
            <VideoPlayer
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
            />

            {/* Featured Video */}
            {!selectedVideo && (
              <Card className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold font-amiri text-purple-800 dark:text-purple-200 mb-2">
                    🌟 فيديو اليوم المميز
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-inter mb-4">
                    قصة سيدنا محمد ﷺ للأطفال - أشهر فيديو تعليمي إسلامي
                  </p>
                  <Button
                    onClick={() =>
                      setSelectedVideo(
                        childrenVideos.find((v) => v.id === "muhammad-story") ||
                          null,
                      )
                    }
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 font-amiri"
                  >
                    مشاهدة الآن
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right - Video Grid */}
          <div className="lg:col-span-3">
            <VideoGrid
              videos={filteredVideos}
              selectedCategory={selectedCategory}
              selectedAgeGroup={selectedAgeGroup}
              onVideoPlay={setSelectedVideo}
              onAgeGroupChange={setSelectedAgeGroup}
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white dark:bg-gray-800 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-amiri text-gray-900 dark:text-white">
                  إعدادات المشغل
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-gray-700 dark:text-gray-300">
                    الصوت
                  </span>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-inter text-gray-700 dark:text-gray-300">
                    تشغيل تلقائي
                  </span>
                  <Button variant="outline" size="sm" className="text-xs">
                    تفعيل
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-inter text-gray-700 dark:text-gray-300">
                    جودة الفيديو
                  </span>
                  <select className="px-2 py-1 rounded border text-sm">
                    <option>HD</option>
                    <option>SD</option>
                    <option>تلقائي</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
