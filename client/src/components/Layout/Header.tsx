import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "../Common/ThemeToggle";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import { BRAND } from "@/config/brand";

export default function Header() {
  const [location] = useLocation();
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: t("nav.home"), icon: "home" },
    { href: "/who-is-muhammad", label: "من هو محمد ﷺ؟", icon: "favorite" },
    { href: "/quran", label: t("nav.quran"), icon: "menu_book" },
    { href: "/seerah", label: t("nav.seerah"), icon: "account_circle" },
    { href: "/sunnah", label: "دار الحديث", icon: "verified" },
    {
      href: "/digital-library",
      label: "📚 المكتبة الرقمية",
      icon: "local_library",
    },
    {
      href: "/prayer-guide",
      label: t("nav.prayer_guide"),
      icon: "self_improvement",
    },
    {
      href: "/daily-reminders",
      label: t("nav.daily_reminders"),
      icon: "auto_stories",
    },
    { href: "/calendar", label: t("nav.calendar"), icon: "calendar_month" },
    { href: "/kids", label: t("nav.children"), icon: "child_care" },
  ];

  const isActive = (href: string) => {
    return location === href || (href !== "/" && location.startsWith(href));
  };

  return (
    <header className="bg-white/90 dark:bg-emerald-900/90 backdrop-blur-sm border-b border-emerald-100 dark:border-emerald-700 sticky top-0 z-50 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 rounded-xl shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">
                menu_book
              </span>
            </div>
            <div className={`${isRTL ? "text-right" : "text-left"}`}>
              <h1 className="text-xl font-amiri font-bold text-emerald-700 dark:text-emerald-400">
                {t("app.name")}
              </h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-inter">
                {BRAND.name.en}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {navigationItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800"
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Desktop More Menu */}
            <div className="hidden lg:block">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <span className="material-symbols-outlined">
                      more_horiz
                    </span>
                    <span className="text-sm">{t("nav.more")}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <h3 className="font-amiri font-bold text-lg text-emerald-700 dark:text-emerald-300">
                      {t("nav.more_services")}
                    </h3>
                    {navigationItems.slice(4).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800"
                            : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <LanguageSwitcher />
            <ThemeToggle />

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="material-symbols-outlined">menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <h3 className="font-amiri font-bold text-lg text-emerald-700 dark:text-emerald-300">
                      {t("nav.menu")}
                    </h3>
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800"
                            : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Profile */}
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <span className="material-symbols-outlined text-white text-sm">
                person
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
