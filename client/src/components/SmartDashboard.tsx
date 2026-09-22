import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Activity,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Target,
  Award,
  Zap,
  Brain,
  Heart,
  Star,
  Flame,
  Shield,
  Globe,
  Calendar,
  Headphones,
  Music,
  Radio,
  Cpu,
  Diamond,
  Crown,
  Sparkles,
  Rocket,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  Download,
  Volume2,
  Settings,
  Lightbulb,
  Palette,
  Camera,
  Video,
  Mic,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  className?: string;
}

export default function SmartDashboard({ className }: DashboardProps) {
  const { mode } = useTheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    dailyReads: 45,
    totalSessions: 1247,
    currentStreak: 12,
    completedGoals: 8,
    totalPoints: 2840,
    level: "متوسط",
    badges: 15,
    friends: 234,
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "read",
      title: "قراءة سورة البقرة",
      time: "10 دقائق",
      points: 50,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 2,
      type: "listen",
      title: "استماع للقرآن الصوتي",
      time: "25 دقيقة",
      points: 75,
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      id: 3,
      type: "dhikr",
      title: "تسبيح 100 مرة",
      time: "5 دقائق",
      points: 25,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 4,
      type: "ai",
      title: "سؤال للمفتي المبين",
      time: "2 دقيقة",
      points: 30,
      icon: <Brain className="w-4 h-4" />,
    },
  ]);

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "قارئ مبتدئ",
      description: "قرأت 10 سور",
      icon: <BookOpen className="w-5 h-5" />,
      earned: true,
      rarity: "common",
    },
    {
      id: 2,
      title: "مستمع نشط",
      description: "استمعت 100 ساعة",
      icon: <Headphones className="w-5 h-5" />,
      earned: true,
      rarity: "rare",
    },
    {
      id: 3,
      title: "باحث عن المعرفة",
      description: "سألت 50 سؤال",
      icon: <Brain className="w-5 h-5" />,
      earned: false,
      rarity: "epic",
    },
    {
      id: 4,
      title: "روح مؤمنة",
      description: "سبحت 10000 مرة",
      icon: <Crown className="w-5 h-5" />,
      earned: false,
      rarity: "legendary",
    },
  ]);

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-amber-400 to-yellow-600",
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 2),
        totalPoints: prev.totalPoints + Math.floor(Math.random() * 10),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "space-y-6 p-6 rounded-3xl border-2 transition-all duration-700",
        mode === "heaven"
          ? "bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-white/20 backdrop-blur-xl"
          : "bg-gradient-to-br from-white/80 to-blue-50/80 border-gray-200 backdrop-blur-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "text-3xl font-amiri font-bold transition-colors duration-700",
              mode === "heaven" ? "text-white" : "text-gray-800",
            )}
          >
            🎯 لوحة التحكم الذكية
          </h2>
          <p
            className={cn(
              "text-lg font-inter transition-colors duration-700",
              mode === "heaven" ? "text-white/80" : "text-gray-600",
            )}
          >
            تتبع تقدمك الروحاني اليومي
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-xl transition-all duration-300 hover:scale-110",
            mode === "heaven"
              ? "border-white/30 text-white hover:bg-white/20"
              : "border-gray-200 hover:bg-gray-50",
          )}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "قراءات اليوم",
            value: stats.dailyReads,
            icon: <BookOpen className="w-6 h-6" />,
            color: "from-emerald-500 to-green-600",
            change: "+12%",
          },
          {
            label: "إجمالي الجلسات",
            value: stats.totalSessions.toLocaleString("ar"),
            icon: <Activity className="w-6 h-6" />,
            color: "from-blue-500 to-indigo-600",
            change: "+8%",
          },
          {
            label: "الأيام المتتالية",
            value: stats.currentStreak,
            icon: <Flame className="w-6 h-6" />,
            color: "from-orange-500 to-red-600",
            change: "+1",
          },
          {
            label: "إجمالي النقاط",
            value: stats.totalPoints.toLocaleString("ar"),
            icon: <Star className="w-6 h-6" />,
            color: "from-amber-500 to-yellow-600",
            change: "+156",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className={cn(
              "transition-all duration-300 hover:scale-105 cursor-pointer",
              mode === "heaven"
                ? "bg-white/10 border-white/20"
                : "bg-white border-gray-200",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={cn(
                    "p-2 rounded-xl",
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

      {/* Progress Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Level Progress */}
        <Card
          className={cn(
            "transition-all duration-700",
            mode === "heaven"
              ? "bg-white/10 border-white/20"
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
              <Trophy className="w-6 h-6 text-amber-500" />
              مستوى التطور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-amiri font-bold text-xl",
                    mode === "heaven" ? "text-white" : "text-gray-800",
                  )}
                >
                  {stats.level}
                </span>
                <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                  المستوى 7
                </Badge>
              </div>

              {/* XP Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      mode === "heaven" ? "text-white/80" : "text-gray-600"
                    }
                  >
                    {stats.totalPoints} / 3000 نقطة
                  </span>
                  <span
                    className={
                      mode === "heaven" ? "text-white/80" : "text-gray-600"
                    }
                  >
                    {Math.round((stats.totalPoints / 3000) * 100)}%
                  </span>
                </div>
                <div
                  className={cn(
                    "w-full h-3 rounded-full overflow-hidden",
                    mode === "heaven" ? "bg-white/20" : "bg-gray-200",
                  )}
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 ease-out"
                    style={{ width: `${(stats.totalPoints / 3000) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    "text-sm font-inter",
                    mode === "heaven" ? "text-white/70" : "text-gray-600",
                  )}
                >
                  {3000 - stats.totalPoints} نقطة للمستوى التالي
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card
          className={cn(
            "transition-all duration-700",
            mode === "heaven"
              ? "bg-white/10 border-white/20"
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
              <Clock className="w-6 h-6 text-blue-500" />
              الأنشطة الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 4).map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105",
                    mode === "heaven"
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-gray-50 hover:bg-gray-100",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      activity.type === "read" &&
                        "bg-emerald-100 text-emerald-600",
                      activity.type === "listen" && "bg-blue-100 text-blue-600",
                      activity.type === "dhikr" && "bg-pink-100 text-pink-600",
                      activity.type === "ai" && "bg-purple-100 text-purple-600",
                    )}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-amiri font-medium text-sm",
                        mode === "heaven" ? "text-white" : "text-gray-800",
                      )}
                    >
                      {activity.title}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        mode === "heaven" ? "text-white/70" : "text-gray-600",
                      )}
                    >
                      {activity.time}
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    +{activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card
        className={cn(
          "transition-all duration-700",
          mode === "heaven"
            ? "bg-white/10 border-white/20"
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
            <Award className="w-6 h-6 text-amber-500" />
            الإنجازات والشارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer",
                  achievement.earned
                    ? mode === "heaven"
                      ? "bg-white/10 border-white/30"
                      : "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                    : mode === "heaven"
                      ? "bg-gray-800/20 border-gray-600/30 opacity-60"
                      : "bg-gray-50 border-gray-200 opacity-60",
                )}
              >
                {/* Badge Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto transition-all duration-300 group-hover:scale-110",
                    achievement.earned
                      ? `bg-gradient-to-r ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`
                      : "bg-gray-300",
                  )}
                >
                  <div
                    className={
                      achievement.earned ? "text-white" : "text-gray-500"
                    }
                  >
                    {achievement.icon}
                  </div>
                </div>

                {/* Achievement Details */}
                <div className="text-center">
                  <h4
                    className={cn(
                      "font-amiri font-bold text-sm mb-1",
                      achievement.earned
                        ? mode === "heaven"
                          ? "text-white"
                          : "text-gray-800"
                        : mode === "heaven"
                          ? "text-gray-400"
                          : "text-gray-500",
                    )}
                  >
                    {achievement.title}
                  </h4>
                  <p
                    className={cn(
                      "text-xs",
                      achievement.earned
                        ? mode === "heaven"
                          ? "text-white/70"
                          : "text-gray-600"
                        : mode === "heaven"
                          ? "text-gray-500"
                          : "text-gray-400",
                    )}
                  >
                    {achievement.description}
                  </p>
                </div>

                {/* Rarity Indicator */}
                <div className="absolute top-2 right-2">
                  {achievement.rarity === "legendary" && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                  {achievement.rarity === "epic" && (
                    <Diamond className="w-4 h-4 text-purple-400" />
                  )}
                  {achievement.rarity === "rare" && (
                    <Star className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                {/* Earned Indicator */}
                {achievement.earned && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <Target className="w-5 h-5" />,
            label: "تحديد أهداف",
            color: "from-green-500 to-emerald-600",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            label: "التقارير",
            color: "from-blue-500 to-indigo-600",
          },
          {
            icon: <Users className="w-5 h-5" />,
            label: "الأصدقاء",
            color: "from-purple-500 to-violet-600",
          },
          {
            icon: <Settings className="w-5 h-5" />,
            label: "الإعدادات",
            color: "from-gray-500 to-gray-600",
          },
        ].map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "h-16 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105",
              mode === "heaven"
                ? "border-white/30 text-white hover:bg-white/20"
                : "border-gray-200 hover:bg-gray-50",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                `bg-gradient-to-r ${action.color}`,
              )}
            >
              <div className="text-white">{action.icon}</div>
            </div>
            <span className="text-sm font-amiri">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Trophy component - make sure it's imported or add locally
const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-.78A9 9 0 0 1 13 17.77V20h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.23A9 9 0 0 1 6.78 11H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1zM6 9h.78A9 9 0 0 1 7 8V6H6a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zm12 0a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1v2c.26.32.5.66.72 1H18zM9 3v6a7 7 0 1 0 6 0V3H9z" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
