import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/components/ThemeProvider";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import {
  Search,
  Star,
  ArrowRight,
  BookOpen,
  Users,
  Heart,
  Baby,
  ScrollText,
  Building2,
  Compass,
  Calendar,
  Headphones,
  TrendingUp,
  Award,
  Clock,
  Brain,
  Sparkles,
  Play,
  ChevronRight,
  Zap,
  Target,
  Globe,
  Gift,
  CheckCircle2,
  Bell,
  Moon,
  Sun,
  Settings,
  MoreHorizontal,
  Home,
  User,
  Archive,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const { updateLastVisited } = useProgress();
  const { mode } = useTheme();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [dhikrCount, setDhikrCount] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [visitors, setVisitors] = useState(12847);
  const [currentTime, setCurrentTime] = useState(new Date());

  // اقتباسات إسلامية
  const islamicQuotes = [
    {
      ar: "هذا الكتاب المبين الذي لا شك فيه، هدى للمتقين",
      en: "This is the Scripture whereof there is no doubt, a guidance unto those who ward off (evil)",
      source: "البقرة - 2",
    },
    {
      ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
      en: "And whoever fears Allah, He will make for him a way out",
      source: "الطلاق - 2",
    },
  ];

  useEffect(() => {
    updateLastVisited("/home");

    // تحديث عداد الزوار
    const interval = setInterval(() => {
      setVisitors((prev) => prev + Math.floor(Math.random() * 2));
    }, 8000);

    // تدوير الاقتباسات
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % islamicQuotes.length);
    }, 6000);

    // تحديث الوقت
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
      clearInterval(timeInterval);
    };
  }, [updateLastVisited]);

  const handleDhikrClick = () => {
    setDhikrCount((prev) => prev + 1);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "نهار طيب";
    if (hour < 20) return "مساء الخير";
    return "ليلة سعيدة";
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("ar-SA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getIslamicDate = () => {
    return "04 رمضان، 1445";
  };

  const categories = [
    {
      href: "/quran",
      title: "القرآن",
      subtitle: "القرآن الكريم",
      icon: <BookOpen className="w-5 h-5" />,
      color: "icon-ref-lime",
    },
    {
      href: "/quran-audio",
      title: "الصوتيات",
      subtitle: "القرآن الصوتي",
      icon: <Headphones className="w-5 h-5" />,
      color: "icon-ref-emerald",
    },
    {
      href: "/calendar",
      title: "التقويم",
      subtitle: "التقويم الإسلامي",
      icon: <Calendar className="w-5 h-5" />,
      color: "icon-ref-orange",
    },
    {
      href: "/digital-tasbih",
      title: "التسبيح",
      subtitle: "التسبيح الرقمي",
      icon: <Building2 className="w-5 h-5" />,
      color: "icon-ref-purple",
    },
  ];

  const schedule = [
    {
      name: "الفجر",
      time: "02:00 AM - 04:30 AM",
      icon: <Moon className="w-4 h-4" />,
      status: "active",
      avatar: "🌙",
    },
    {
      name: "الظهر",
      time: "04:20 AM - 05:50 AM",
      icon: <Sun className="w-4 h-4" />,
      status: "upcoming",
      avatar: "☀️",
    },
  ];

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 pb-20",
        mode === "heaven" ? "bg-slate-900" : "bg-gray-50",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Main Header Card - مطابق للمراجع تماماً */}
      <div className="p-4">
        <div className="card-ref card-ref-gradient text-white relative overflow-hidden animate-slide-up">
          {/* Decorative mosque silhouette */}
          <div className="mosque-ref">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M100 20 L80 50 L80 180 L120 180 L120 50 Z"
                fill="currentColor"
              />
              <path d="M70 60 L70 180 L90 180 L90 60 Z" fill="currentColor" />
              <path
                d="M110 60 L110 180 L130 180 L130 60 Z"
                fill="currentColor"
              />
              <circle cx="85" cy="35" r="6" fill="currentColor" />
              <circle cx="115" cy="35" r="6" fill="currentColor" />
              <path
                d="M95 20 L95 8 M105 20 L105 8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M60 70 Q100 50 140 70"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-cairo font-bold">
                  {getGreeting()}
                </h1>
                <p className="text-sm opacity-80 font-tajawal">محمد أحمد</p>
              </div>
              <Bell className="w-6 h-6 opacity-60" />
            </div>

            {/* Date */}
            <div className="mb-6">
              <p className="text-sm opacity-80 font-tajawal">{formatDate()}</p>
              <p className="text-lg font-amiri font-semibold">
                {getIslamicDate()}
              </p>
            </div>

            {/* Daily Quote - مطابق للمراجع */}
            <div className="card-ref bg-white/10 border-white/20 backdrop-blur-sm mb-0 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="icon-ref w-12 h-12 bg-white/20 flex-shrink-0 mt-1 animate-float">
                  <Moon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-cairo mb-1 text-sm">
                    آية اليوم
                  </h3>
                  <p className="text-sm opacity-90 font-amiri leading-relaxed mb-2">
                    {islamicQuotes[currentQuote].ar}
                  </p>
                  <p className="text-xs opacity-70 font-tajawal">
                    {islamicQuotes[currentQuote].source}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section - مطابق للمراجع */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-cairo font-bold">الأقسام</h2>
          <button
            className="text-sm font-tajawal hover:underline transition-all"
            style={{ color: "var(--ref-lime-bright)" }}
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {categories.map((category, index) => (
            <Link key={category.href} href={category.href}>
              <div
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={cn(
                    "icon-ref w-12 h-12 mx-auto mb-2 group-hover:scale-110 transition-all duration-300",
                    category.color,
                  )}
                >
                  {category.icon}
                </div>
                <p className="text-xs font-cairo font-medium text-center leading-tight mb-1">
                  {category.title}
                </p>
                <p className="text-xs opacity-60 font-tajawal text-center leading-tight">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Schedule Section - مطابق للمراجع */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-cairo font-bold">الجدول</h2>
          <button
            className="text-sm font-tajawal hover:underline transition-all"
            style={{ color: "var(--ref-lime-bright)" }}
          >
            عرض الكل
          </button>
        </div>

        <div className="space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className={cn(
                "card-ref hover:scale-[1.02] transition-all duration-300 animate-slide-up",
                item.status === "active" ? "glow-ref" : "",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{item.avatar}</div>
                  <div>
                    <h3 className="font-cairo font-semibold text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-opacity-60 font-tajawal">
                      {item.time}
                    </p>
                  </div>
                </div>
                {item.status === "active" && (
                  <div className="badge-ref badge-ref-lime animate-pulse">
                    نشط
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Button - مطابق للمراجع تماماً */}
      <div className="px-4 mb-6">
        <Link href="/" asChild>
          <button className="btn-ref btn-ref-primary w-full font-cairo font-bold animate-glow">
            <Brain className="w-5 h-5" />
            استكشف أبواب الدار
          </button>
        </Link>
      </div>

      {/* Bottom Navigation - مطابق للمراجع تماماً */}
      <div className="bottom-nav-ref">
        <div className="flex items-center justify-around py-2">
          <Link href="/calendar">
            <div className="bottom-nav-item">
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-xs font-cairo">التقويم</span>
            </div>
          </Link>

          <Link href="/digital-library">
            <div className="bottom-nav-item">
              <Archive className="w-5 h-5 mb-1" />
              <span className="text-xs font-cairo">الأرشيف</span>
            </div>
          </Link>

          <Link href="/home">
            <div
              className={cn(
                "bottom-nav-item",
                location === "/home" ? "active" : "",
              )}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-cairo">الرئيسية</span>
            </div>
          </Link>

          <Link href="/qibla-compass">
            <div className="bottom-nav-item">
              <Clock className="w-5 h-5 mb-1" />
              <span className="text-xs font-cairo">الأوقات</span>
            </div>
          </Link>

          <button className="bottom-nav-item">
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-cairo">الملف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
