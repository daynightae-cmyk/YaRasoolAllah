import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import SmartDashboard from "@/components/SmartDashboard";
import AdvancedAudioPlayer from "@/components/AdvancedAudioPlayer";
import SurahList from "@/components/SurahList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Crown,
  Diamond,
  Star,
  Award,
  Target,
  Rocket,
  Sparkles,
  Heart,
  Eye,
  Calendar,
  Clock,
  Globe,
  Headphones,
  BookOpen,
  Brain,
  Settings,
  Palette,
  Music,
  Radio,
  Mic2,
  Volume2,
  Play,
  Pause,
  Download,
  Share2,
  Bookmark,
  ChevronRight,
  ArrowRight,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Maximize2,
  Minimize2,
  Grid3X3,
  List,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  Gauge,
  Flame,
  Shield,
  Cpu,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { mode } = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    "overview" | "audio" | "surahs" | "analytics"
  >("overview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    id: "1",
    title: "سورة الفاتحة",
    arabic: "سُورَةُ الْفَاتِحَة",
    reciter: "مشاري راشد العفاسي",
    duration: 90,
    surah: "الفاتحة",
    verses: 7,
    type: "meccan" as const,
    meaning: "الافتتاح",
  });

  const [quickStats, setQuickStats] = useState({
    totalUsers: 2847691,
    dailyActive: 156432,
    monthlyGrowth: 12.5,
    satisfaction: 98.7,
    totalSessions: 1247893,
    avgSessionTime: "24:36",
    topFeature: "القرآن الصوتي",
    newFeatures: 3,
  });

  const tabs = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      description: "إحصائيات شاملة ومؤشرات الأداء",
    },
    {
      id: "audio",
      label: "المشغل الصوتي",
      icon: <Headphones className="w-5 h-5" />,
      color: "from-purple-500 to-pink-600",
      description: "مشغل القرآن الصوتي المتطور",
    },
    {
      id: "surahs",
      label: "فهرس السور",
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-emerald-500 to-green-600",
      description: "تصفح وإدارة السور الكريمة",
    },
    {
      id: "analytics",
      label: "التحليلات",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600",
      description: "تحليلات متقدمة وتقارير مفصلة",
    },
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setQuickStats((prev) => ({
        ...prev,
        dailyActive: prev.dailyActive + Math.floor(Math.random() * 10),
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSurahSelect = (surah: any) => {
    setCurrentTrack({
      id: surah.id.toString(),
      title: surah.name,
      arabic: surah.arabicName,
      reciter: "مشاري راشد العفاسي",
      duration:
        parseInt(surah.duration.split(":")[0]) * 60 +
        parseInt(surah.duration.split(":")[1]),
      surah: surah.name,
      verses: surah.verses,
      type: surah.type,
      meaning: surah.meaning,
    });
    setActiveTab("audio");
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-1000 relative",
        mode === "heaven"
          ? "bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50",
      )}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-float transition-all duration-1000",
            mode === "heaven" ? "bg-white/10" : "bg-emerald-200/10",
          )}
        ></div>
        <div
          className={cn(
            "absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-float-delayed transition-all duration-1000",
            mode === "heaven" ? "bg-purple-300/10" : "bg-blue-200/10",
          )}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={cn(
                "text-4xl font-amiri font-bold mb-2 transition-colors duration-700",
                mode === "heaven" ? "text-white" : "text-gray-800",
              )}
            >
              {mode === "heaven"
                ? "✨ لوحة التحكم المباركة"
                : "🎯 لوحة التحكم الذكية"}
            </h1>
            <p
              className={cn(
                "text-xl font-inter transition-colors duration-700",
                mode === "heaven" ? "text-white/80" : "text-gray-600",
              )}
            >
              {mode === "heaven"
                ? "إدارة شاملة لرحلتك الروحانية المباركة"
                : "مركز التحكم الشامل لجميع ميزات التطبيق"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                "transition-all duration-300 hover:scale-110",
                mode === "heaven"
                  ? "border-white/30 text-white hover:bg-white/20"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="outline"
              className={cn(
                "transition-all duration-300 hover:scale-110",
                mode === "heaven"
                  ? "border-white/30 text-white hover:bg-white/20"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "المستخدمون الإجمالي",
              value: quickStats.totalUsers.toLocaleString("ar"),
              icon: <Users className="w-6 h-6" />,
              color: "from-blue-500 to-indigo-600",
              change: "+2.3%",
            },
            {
              label: "النشط اليوم",
              value: quickStats.dailyActive.toLocaleString("ar"),
              icon: <Activity className="w-6 h-6" />,
              color: "from-emerald-500 to-green-600",
              change: "+5.7%",
            },
            {
              label: "النمو الشهري",
              value: `${quickStats.monthlyGrowth}%`,
              icon: <TrendingUp className="w-6 h-6" />,
              color: "from-amber-500 to-yellow-600",
              change: "+1.2%",
            },
            {
              label: "رضا المستخدمين",
              value: `${quickStats.satisfaction}%`,
              icon: <Heart className="w-6 h-6" />,
              color: "from-red-500 to-pink-600",
              change: "+0.3%",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={cn(
                "transition-all duration-300 hover:scale-105",
                mode === "heaven"
                  ? "bg-white/10 border-white/20 backdrop-blur-md"
                  : "bg-white border-gray-200",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      `bg-gradient-to-r ${stat.color}`,
                    )}
                  >
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      stat.change.startsWith("+")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {stat.change}
                  </Badge>
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={cn(
                "group flex items-center gap-3 px-6 py-4 rounded-2xl font-amiri text-lg transition-all duration-300 hover:scale-105 relative overflow-hidden",
                activeTab === tab.id
                  ? mode === "heaven"
                    ? "bg-white/20 text-white border-white/30 backdrop-blur-md shadow-lg"
                    : `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : mode === "heaven"
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-gray-200 hover:bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  activeTab === tab.id
                    ? "bg-white/20"
                    : mode === "heaven"
                      ? "bg-white/10"
                      : "bg-gray-100",
                )}
              >
                {tab.icon}
              </div>
              <div className="text-left rtl:text-right">
                <div className="font-bold">{tab.label}</div>
                <div
                  className={cn(
                    "text-xs opacity-80",
                    activeTab !== tab.id && "hidden group-hover:block",
                  )}
                >
                  {tab.description}
                </div>
              </div>

              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl"></div>
              )}
            </Button>
          ))}
        </div>

        {/* Content Sections */}
        <div
          className={cn(
            "transition-all duration-700",
            isFullscreen
              ? "fixed inset-4 z-50 bg-inherit rounded-3xl overflow-auto"
              : "",
          )}
        >
          {/* Overview Section */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome Card */}
              <Card
                className={cn(
                  "transition-all duration-700 overflow-hidden",
                  mode === "heaven"
                    ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 border-white/20 backdrop-blur-xl"
                    : "bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200",
                )}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center",
                        mode === "heaven"
                          ? "bg-white/20 backdrop-blur-md"
                          : "bg-gradient-to-br from-emerald-400 to-green-500",
                      )}
                    >
                      {mode === "heaven" ? (
                        <Sparkles className="w-10 h-10 text-white animate-twinkle" />
                      ) : (
                        <Rocket className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div>
                      <h2
                        className={cn(
                          "text-3xl font-amiri font-bold mb-2",
                          mode === "heaven" ? "text-white" : "text-gray-800",
                        )}
                      >
                        {mode === "heaven" ? "بارك الله فيك!" : "مرحباً بك!"}
                      </h2>
                      <p
                        className={cn(
                          "text-lg font-inter",
                          mode === "heaven" ? "text-white/80" : "text-gray-600",
                        )}
                      >
                        {mode === "heaven"
                          ? "لوحة التحكم المباركة جاهزة لخدمتك في رحلتك الروحانية"
                          : "لوحة التحكم الذكية محدثة ومستعدة لإدارة جميع احتياجاتك"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Dashboard Component */}
              <SmartDashboard className="animate-fade-in" />

              {/* Quick Actions */}
              <Card
                className={cn(
                  "transition-all duration-700",
                  mode === "heaven"
                    ? "bg-white/10 border-white/20 backdrop-blur-md"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      "flex items-center gap-3 text-xl font-amiri",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    <Zap className="w-6 h-6 text-amber-500" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: <Play className="w-5 h-5" />,
                        label: "تشغيل القرآن",
                        action: () => setActiveTab("audio"),
                      },
                      {
                        icon: <BookOpen className="w-5 h-5" />,
                        label: "تصفح السور",
                        action: () => setActiveTab("surahs"),
                      },
                      {
                        icon: <BarChart3 className="w-5 h-5" />,
                        label: "عرض التحليلات",
                        action: () => setActiveTab("analytics"),
                      },
                      {
                        icon: <Settings className="w-5 h-5" />,
                        label: "الإعدادات",
                        action: () => {},
                      },
                    ].map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.action}
                        variant="outline"
                        className={cn(
                          "h-20 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105",
                          mode === "heaven"
                            ? "border-white/30 text-white hover:bg-white/20"
                            : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        {action.icon}
                        <span className="text-sm font-amiri">
                          {action.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audio Player Section */}
          {activeTab === "audio" && (
            <div className="space-y-6">
              <AdvancedAudioPlayer
                currentTrack={currentTrack}
                className="animate-slide-up"
              />

              {/* Audio Controls and Playlists */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className={cn(
                    "transition-all duration-700",
                    mode === "heaven"
                      ? "bg-white/10 border-white/20 backdrop-blur-md"
                      : "bg-white border-gray-200",
                  )}
                >
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        "flex items-center gap-3 font-amiri",
                        mode === "heaven" ? "text-white" : "text-gray-800",
                      )}
                    >
                      <Music className="w-6 h-6 text-purple-500" />
                      قوائم التشغيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        name: "المفضلة",
                        count: 12,
                        color: "from-red-500 to-pink-600",
                      },
                      {
                        name: "للاستماع لاحقاً",
                        count: 8,
                        color: "from-blue-500 to-indigo-600",
                      },
                      {
                        name: "السور القصيرة",
                        count: 23,
                        color: "from-green-500 to-emerald-600",
                      },
                      {
                        name: "للتأمل",
                        count: 15,
                        color: "from-purple-500 to-violet-600",
                      },
                    ].map((playlist, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105",
                          mode === "heaven"
                            ? "bg-white/5 hover:bg-white/10"
                            : "bg-gray-50 hover:bg-gray-100",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            `bg-gradient-to-r ${playlist.color}`,
                          )}
                        >
                          <Music className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "font-amiri font-medium",
                              mode === "heaven"
                                ? "text-white"
                                : "text-gray-800",
                            )}
                          >
                            {playlist.name}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              mode === "heaven"
                                ? "text-white/70"
                                : "text-gray-600",
                            )}
                          >
                            {playlist.count} عنصر
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5",
                            mode === "heaven"
                              ? "text-white/70"
                              : "text-gray-400",
                          )}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "transition-all duration-700",
                    mode === "heaven"
                      ? "bg-white/10 border-white/20 backdrop-blur-md"
                      : "bg-white border-gray-200",
                  )}
                >
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        "flex items-center gap-3 font-amiri",
                        mode === "heaven" ? "text-white" : "text-gray-800",
                      )}
                    >
                      <Headphones className="w-6 h-6 text-blue-500" />
                      الاستماع مؤخراً
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        name: "سورة البقرة",
                        reciter: "السديس",
                        time: "2:30:45",
                      },
                      {
                        name: "سورة آل عمران",
                        reciter: "العفاسي",
                        time: "1:45:20",
                      },
                      {
                        name: "سورة الكهف",
                        reciter: "الشريم",
                        time: "1:15:30",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105",
                          mode === "heaven"
                            ? "bg-white/5 hover:bg-white/10"
                            : "bg-gray-50 hover:bg-gray-100",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-400 to-green-500",
                          )}
                        >
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "font-amiri font-medium",
                              mode === "heaven"
                                ? "text-white"
                                : "text-gray-800",
                            )}
                          >
                            {item.name}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              mode === "heaven"
                                ? "text-white/70"
                                : "text-gray-600",
                            )}
                          >
                            {item.reciter} • {item.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Surah List Section */}
          {activeTab === "surahs" && (
            <div className="animate-slide-up">
              <SurahList
                onSurahSelect={handleSurahSelect}
                currentPlaying={parseInt(currentTrack.id)}
              />
            </div>
          )}

          {/* Analytics Section */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fade-in">
              {/* Analytics Header */}
              <Card
                className={cn(
                  "transition-all duration-700",
                  mode === "heaven"
                    ? "bg-white/10 border-white/20 backdrop-blur-md"
                    : "bg-white border-gray-200",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className={cn(
                          "text-2xl font-amiri font-bold mb-2",
                          mode === "heaven" ? "text-white" : "text-gray-800",
                        )}
                      >
                        📊 التحليلات المتقدمة
                      </h2>
                      <p
                        className={cn(
                          "font-inter",
                          mode === "heaven" ? "text-white/80" : "text-gray-600",
                        )}
                      >
                        رؤى عميقة حول أداء التطبيق واستخدام المميزات
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          mode === "heaven"
                            ? "border-white/30 text-white hover:bg-white/20"
                            : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <Download className="w-4 h-4 mr-1 rtl:ml-1" />
                        تصدير
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          mode === "heaven"
                            ? "border-white/30 text-white hover:bg-white/20"
                            : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <RefreshCw className="w-4 h-4 mr-1 rtl:ml-1" />
                        تحديث
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "الاستخدام اليومي",
                    value: "156,432",
                    change: "+12.3%",
                    icon: <Activity className="w-8 h-8" />,
                    color: "from-blue-500 to-indigo-600",
                    chart: "line",
                  },
                  {
                    title: "المميزات الأكثر استخداماً",
                    value: "القرآن الصوتي",
                    change: "78%",
                    icon: <TrendingUp className="w-8 h-8" />,
                    color: "from-emerald-500 to-green-600",
                    chart: "pie",
                  },
                  {
                    title: "متوسط وقت الجلسة",
                    value: "24:36",
                    change: "+5.7%",
                    icon: <Clock className="w-8 h-8" />,
                    color: "from-purple-500 to-violet-600",
                    chart: "bar",
                  },
                  {
                    title: "التحميلات الجديدة",
                    value: "2,847",
                    change: "+18.9%",
                    icon: <Download className="w-8 h-8" />,
                    color: "from-amber-500 to-yellow-600",
                    chart: "area",
                  },
                  {
                    title: "التقييمات الإيجابية",
                    value: "98.7%",
                    change: "+0.3%",
                    icon: <Star className="w-8 h-8" />,
                    color: "from-red-500 to-pink-600",
                    chart: "gauge",
                  },
                  {
                    title: "المحتوى المشارك",
                    value: "45,678",
                    change: "+22.1%",
                    icon: <Share2 className="w-8 h-8" />,
                    color: "from-teal-500 to-cyan-600",
                    chart: "line",
                  },
                ].map((metric, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "group transition-all duration-300 hover:scale-105 cursor-pointer",
                      mode === "heaven"
                        ? "bg-white/10 border-white/20 hover:bg-white/15"
                        : "bg-white border-gray-200 hover:shadow-lg",
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                            `bg-gradient-to-r ${metric.color}`,
                          )}
                        >
                          <div className="text-white">{metric.icon}</div>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            metric.change.startsWith("+")
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {metric.change}
                        </Badge>
                      </div>

                      <h3
                        className={cn(
                          "font-amiri font-bold text-lg mb-2",
                          mode === "heaven" ? "text-white" : "text-gray-800",
                        )}
                      >
                        {metric.title}
                      </h3>

                      <div
                        className={cn(
                          "text-3xl font-bold font-amiri mb-4",
                          mode === "heaven" ? "text-white" : "text-gray-900",
                        )}
                      >
                        {metric.value}
                      </div>

                      {/* Mini Chart Placeholder */}
                      <div
                        className={cn(
                          "h-16 rounded-lg flex items-center justify-center",
                          mode === "heaven" ? "bg-white/10" : "bg-gray-100",
                        )}
                      >
                        {metric.chart === "line" && (
                          <LineChart className="w-8 h-8 text-gray-400" />
                        )}
                        {metric.chart === "bar" && (
                          <BarChart className="w-8 h-8 text-gray-400" />
                        )}
                        {metric.chart === "pie" && (
                          <PieChart className="w-8 h-8 text-gray-400" />
                        )}
                        {metric.chart === "gauge" && (
                          <Gauge className="w-8 h-8 text-gray-400" />
                        )}
                        {metric.chart === "area" && (
                          <TrendingUp className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
