import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { BRAND, INSTITUTION_WINGS } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DivineToggle from "@/components/DivineToggle";
import LearningDepthSelector from "./LearningDepthSelector";
import GlobalSearchDialog from "./GlobalSearchDialog";
import {
  Search,
  Menu,
  X,
  Compass,
  BookOpen,
  Feather,
  Library,
  Baby,
  Sun,
  ShieldCheck,
  Sparkles,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", labelAr: "بوابة النور", labelEn: "Home", icon: Sparkles },
  { href: "/who-is-muhammad", labelAr: "من هو محمد ﷺ؟", labelEn: "Who is Muhammad?", icon: Heart, highlight: true },
  { href: "/seerah", labelAr: "درب السيرة", labelEn: "Seerah", icon: Compass },
  { href: "/quran", labelAr: "رِواق القرآن", labelEn: "Quran", icon: BookOpen },
  { href: "/sunnah", labelAr: "دار الحديث", labelEn: "Sunnah", icon: Feather },
  { href: "/library", labelAr: "مكتبة الرفوف", labelEn: "Library", icon: Library },
  { href: "/kids", labelAr: "ركن الطفل", labelEn: "Kids", icon: Baby },
  { href: "/daily", labelAr: "محراب اليوم", labelEn: "Daily", icon: Sun },
];

export default function InstitutionalHeader() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-amber-900/10 dark:border-amber-500/10 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Brand Emblem */}
            <Link href="/" className="flex items-center gap-3 group text-right">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-emerald-700 dark:to-emerald-900 flex items-center justify-center text-amber-300 shadow-md border border-amber-400/30 group-hover:scale-105 transition-transform">
                <span className="font-amiri font-bold text-lg leading-none select-none">
                  ﷺ
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-amiri font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                    {BRAND.name.ar}
                  </h1>
                </div>
                <p className="text-[11px] font-tajawal text-slate-500 dark:text-slate-400 hidden sm:block">
                  الصرح الرقمي للسيرة النبوية والقرآن والسنة
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden 2xl:flex items-center gap-1 text-sm font-cairo">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 relative",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800"
                        : "text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800/60",
                      item.highlight && !isActive && "text-amber-800 dark:text-amber-300 font-semibold"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <span>{item.labelAr}</span>
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              {/* Learning Depth Selector on Desktop */}
              <div className="hidden lg:block">
                <LearningDepthSelector compact />
              </div>

              {/* Global Search Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-xl border-slate-200 dark:border-slate-700 h-9 px-3 gap-2 text-xs font-cairo text-muted-foreground hover:text-foreground"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">بحث جامع...</span>
              </Button>

              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Day / Night Theme */}
              <DivineToggle />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="2xl:hidden w-9 h-9 rounded-xl"
                aria-label="القائمة الرئيسية"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="2xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-cairo text-muted-foreground">عمق المعرفة:</span>
              <LearningDepthSelector compact />
            </div>

            <nav className="grid grid-cols-2 gap-2 text-sm font-cairo">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border transition-colors",
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                        : "border-border/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{item.labelAr}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t flex items-center justify-between">
              <LanguageSwitcher />
              <span className="text-[11px] font-mono text-muted-foreground">{BRAND.domain}</span>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
