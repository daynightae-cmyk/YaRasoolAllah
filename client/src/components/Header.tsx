import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import DivineToggle from "./DivineToggle";
import {
  Menu,
  X,
  User,
  Home,
  BookOpen,
  Library,
  Star,
  Baby,
  Brain,
  Headphones,
  Bell,
  Search,
  Calendar,
  Compass,
  Building2,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { t, direction } = useLanguage();
  const { mode } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const mainNavItems = [
    {
      href: "/home",
      label: "الرئيسية",
      englishLabel: "Home",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/dashboard",
      label: "لوحة التحكم",
      englishLabel: "Dashboard",
      badge: "جديد",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      href: "/quran",
      label: "القرآن الكريم",
      englishLabel: "Holy Quran",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      href: "/quran-audio",
      label: "القرآن الصوتي",
      englishLabel: "Audio Quran",
      badge: "HD",
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      href: "/daily-verse",
      label: "الآية اليومية",
      englishLabel: "Daily Verse",
      icon: <Star className="w-4 h-4" />,
    },
  ];

  const secondaryNavItems = [
    {
      href: "/children-tv",
      label: "الطفل المبين",
      englishLabel: "Children's Content",
      icon: <Baby className="w-4 h-4" />,
    },
    {
      href: "/digital-library",
      label: "المكتبة الرقمية",
      englishLabel: "Digital Library",
      icon: <Library className="w-4 h-4" />,
    },
    {
      href: "/calendar",
      label: "التقويم الإسلامي",
      englishLabel: "Islamic Calendar",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      href: "/qibla-compass",
      label: "اتجاه القبلة",
      englishLabel: "Qibla Compass",
      icon: <Compass className="w-4 h-4" />,
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return "🌙 ليلة مباركة";
    if (hour < 12) return "🌅 صباح الخير";
    if (hour < 17) return "☀️ نهار طيب";
    if (hour < 20) return "🌆 مساء الخير";
    return "✨ ليلة سعيدة";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 animate-fade-in",
        "backdrop-blur-sm border-b",
        mode === "heaven"
          ? "bg-gray-800/95 border-gray-700"
          : "bg-white/95 border-gray-200",
      )}
    >
      <div className="container-simple">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/home">
            <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-all duration-200">
              <div className="icon-primary w-10 h-10">
                <BookOpen className="w-5 h-5" />
              </div>

              <div
                className={`${direction === "rtl" ? "text-right" : "text-left"}`}
              >
                <h1 className="text-lg font-cairo font-bold text-primary">
                  الكت��ب المبين
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-tajawal text-muted-foreground">
                    {getGreeting()}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-primary/40"></div>
                  <span className="badge-primary text-xs px-2 py-1">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.slice(0, 4).map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "nav-item relative transition-all duration-200",
                    location === item.href
                      ? "active"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      location === item.href ? "bg-white/20" : "bg-muted/50",
                    )}
                  >
                    {item.icon}
                  </div>

                  <span className="hidden xl:inline text-sm font-medium font-cairo">
                    {item.label}
                  </span>

                  {item.badge && (
                    <Badge className="badge-accent text-xs">{item.badge}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Controls Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-10 h-10 rounded-lg"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </Button>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Divine Mode Toggle */}
            <DivineToggle />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-10 h-10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            {/* Profile Avatar */}
            <div className="hidden sm:block relative group">
              <div className="icon-primary w-10 h-10 cursor-pointer">
                <User className="w-4 h-4" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background"></div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              "lg:hidden border-t py-4 animate-slide-up",
              mode === "heaven" ? "border-gray-700" : "border-gray-200",
            )}
          >
            {/* Mobile Language Switcher */}
            <div className="px-3 py-3 mb-4">
              <LanguageSwitcher />
            </div>

            {/* Main Navigation */}
            <div className="space-y-2 mb-6">
              <h3 className="px-3 text-sm font-semibold font-cairo text-muted-foreground uppercase tracking-wider">
                الأقسام الرئيسية
              </h3>
              {mainNavItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "nav-item mx-2",
                      location === item.href
                        ? "active"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        location === item.href ? "bg-white/20" : "bg-muted/50",
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium font-cairo">{item.label}</div>
                      <div className="text-xs text-muted-foreground font-tajawal">
                        {item.englishLabel}
                      </div>
                    </div>
                    {item.badge && (
                      <Badge className="badge-accent text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="space-y-2">
              <h3 className="px-3 text-sm font-semibold font-cairo text-muted-foreground uppercase tracking-wider">
                أقسام إضافية
              </h3>
              {secondaryNavItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "nav-item mx-2",
                      location === item.href
                        ? "active"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium font-cairo">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
