import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import DivineToggle from "./DivineToggle";
import { BRAND } from "@/config/brand";
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
  Heart,
  Feather,
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
      href: "/",
      label: "بوابة النور",
      englishLabel: "Home",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/who-is-muhammad",
      label: "من هو محمد ﷺ؟",
      englishLabel: "Who is Muhammad?",
      badge: "جامع",
      icon: <Heart className="w-4 h-4 text-red-500" />,
    },
    {
      href: "/seerah",
      label: "درب السيرة",
      englishLabel: "Seerah",
      icon: <Compass className="w-4 h-4" />,
    },
    {
      href: "/quran",
      label: "رِواق القرآن",
      englishLabel: "Quran",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      href: "/sunnah",
      label: "دار الحديث",
      englishLabel: "Sunnah",
      icon: <Feather className="w-4 h-4" />,
    },
    {
      href: "/digital-library",
      label: "مكتبة الرفوف",
      englishLabel: "Library",
      icon: <Library className="w-4 h-4" />,
    },
  ];

  const secondaryNavItems = [
    {
      href: "/children-tv",
      label: "واحة الطفل والأسرة",
      englishLabel: "Children & Family",
      icon: <Baby className="w-4 h-4" />,
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
          ? "bg-slate-900/95 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-900",
      )}
    >
      <div className="container-simple">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-muted/50 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-amiri font-bold text-lg border border-amber-400/30 group-hover:scale-105 transition-transform">
                ﷺ
              </div>

              <div
                className={`${direction === "rtl" ? "text-right" : "text-left"}`}
              >
                <h1 className="text-lg font-amiri font-bold text-foreground">
                  {BRAND.name.ar}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-tajawal text-muted-foreground">
                    {BRAND.domain}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-emerald-500/40"></div>
                  <span className="text-[11px] text-muted-foreground font-mono">
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
