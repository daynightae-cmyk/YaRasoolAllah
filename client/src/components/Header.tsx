import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import DivineToggle from "./DivineToggle";
import InstitutionalSearchDialog from "./common/InstitutionalSearchDialog";
import { BRAND } from "@/config/brand";
import {
  Menu,
  X,
  Search,
  Compass,
  BookOpen,
  Library,
  Feather,
  Heart,
  Baby,
  Calendar,
  Clock,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { direction } = useLanguage();
  const { mode } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.closest?.("input, textarea, [contenteditable='true'], [contenteditable='']") ??
        target?.matches?.("input, textarea, [contenteditable='true']");
      if (isEditing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const primaryWings = [
    {
      href: "/who-is-muhammad",
      labelAr: "من هو محمد ﷺ؟",
      labelEn: "Who is Muhammad?",
      icon: Heart,
    },
    {
      href: "/seerah",
      labelAr: "درب السيرة",
      labelEn: "Prophetic Seerah",
      icon: Compass,
    },
    {
      href: "/quran",
      labelAr: "رِواق القرآن",
      labelEn: "Noble Quran",
      icon: BookOpen,
    },
    {
      href: "/sunnah",
      labelAr: "دار الحديث",
      labelEn: "Hadith & Sunnah",
      icon: Feather,
    },
    {
      href: "/digital-library",
      labelAr: "خزانة الرفوف",
      labelEn: "Digital Library",
      icon: Library,
    },
    {
      href: "/prophetic-day",
      labelAr: "الهدي النبوي",
      labelEn: "Prophetic Day",
      icon: Clock,
    },
  ];

  const secondaryWings = [
    {
      href: "/children-tv",
      labelAr: "واحة الأسرة والطفل",
      labelEn: "Family Oasis",
      icon: Baby,
    },
    {
      href: "/prayer-guide",
      labelAr: "دليل الصلاة ومواقيتها",
      labelEn: "Prayer Guide",
      icon: Clock,
    },
    {
      href: "/calendar",
      labelAr: "التقويم الهجري الشريف",
      labelEn: "Hijri Calendar",
      icon: Calendar,
    },
    {
      href: "/qibla-compass",
      labelAr: "بوصلة القبلة",
      labelEn: "Qibla Compass",
      icon: Compass,
    },
    {
      href: "/evidence-network",
      labelAr: "شبكة الشواهد والإسناد",
      labelEn: "Evidence Network",
      icon: Layers,
    },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-colors duration-200 border-b backdrop-blur-md",
          "bg-background/95 border-border shadow-xs"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Right: Institutional Brand Emblem */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group select-none">
                {/* Calligraphic Seal */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-amiri font-bold text-lg border border-amber-500/30 group-hover:border-amber-400/60 shadow-sm transition-all duration-200">
                  ﷺ
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base sm:text-lg font-amiri font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {BRAND.name.ar}
                    </h1>
                  </div>
                  <p className="text-[11px] font-tajawal text-muted-foreground leading-none">
                    صرح السيرة والقرآن والسنة النبوية
                  </p>
                </div>
              </div>
            </Link>

            {/* Center: Primary Wing Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {primaryWings.map((wing) => {
                const isActive = location === wing.href;
                const IconComponent = wing.icon;
                return (
                  <Link key={wing.href} href={wing.href}>
                    <div
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs xl:text-sm font-cairo font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                        isActive
                          ? "bg-amber-600/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-600/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <IconComponent className={cn("w-3.5 h-3.5", isActive ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground")} />
                      <span>{wing.labelAr}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Secondary Wings Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsMoreDropdownOpen(false), 200)}
                  className="px-2.5 py-2 rounded-xl text-xs xl:text-sm font-cairo font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>الأروقة</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isMoreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl p-2 z-50 text-right space-y-1 animate-fade-in">
                    {secondaryWings.map((wing) => {
                      const IconComponent = wing.icon;
                      return (
                        <Link key={wing.href} href={wing.href}>
                          <div
                            onClick={() => setIsMoreDropdownOpen(false)}
                            className="p-2 rounded-xl text-xs font-cairo hover:bg-muted text-foreground transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-[11px] font-tajawal text-muted-foreground">{wing.labelEn}</span>
                            <div className="flex items-center gap-2">
                              <span>{wing.labelAr}</span>
                              <IconComponent className="w-3.5 h-3.5 text-primary" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Left: Search Affordance, Day/Night Toggle, Language & Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Institutional Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-tajawal transition-colors cursor-pointer"
                title="البحث في الصرح (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">بحث في الصرح...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Dignified Day/Night Mode Switch */}
              <DivineToggle />

              {/* Mobile Menu Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-9 h-9 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="القائمة الرئيسية"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card p-4 space-y-4 text-right animate-fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground block px-2">
                الأجنحة المعرفية الأساسية
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {primaryWings.map((wing) => {
                  const IconComponent = wing.icon;
                  return (
                    <Link key={wing.href} href={wing.href}>
                      <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs font-cairo flex items-center justify-between cursor-pointer",
                          location === wing.href
                            ? "bg-amber-600/15 border-amber-600/30 text-amber-800 dark:text-amber-300 font-bold"
                            : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        )}
                      >
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span>{wing.labelAr}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-border">
              <span className="text-[11px] font-mono text-muted-foreground block px-2">
                الأروقة المتخصصة والخدمات
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {secondaryWings.map((wing) => {
                  const IconComponent = wing.icon;
                  return (
                    <Link key={wing.href} href={wing.href}>
                      <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl border border-border bg-background text-xs font-cairo flex items-center justify-between cursor-pointer hover:bg-muted"
                      >
                        <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{wing.labelAr}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <LanguageSwitcher />
              <span className="text-[11px] font-mono text-muted-foreground">yarasoolallah.org</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Institutional Search Dialog */}
      <InstitutionalSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
