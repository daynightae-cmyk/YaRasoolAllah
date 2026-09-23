import React from "react";
import InstitutionalHeader from "./InstitutionalHeader";
import InstitutionalFooter from "./InstitutionalFooter";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sparkles,
  Compass,
  BookOpen,
  Library,
  Sun,
  Baby,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionShellProps {
  children: React.ReactNode;
  activeWing?: string;
  hideFooter?: boolean;
}

const DOCK_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Sparkles },
  { href: "/who-is-muhammad", label: "من هو ﷺ", icon: Heart },
  { href: "/seerah", label: "السيرة", icon: Compass },
  { href: "/quran", label: "القرآن", icon: BookOpen },
  { href: "/library", label: "المكتبة", icon: Library },
  { href: "/daily", label: "اليوم", icon: Sun },
];

export default function InstitutionShell({
  children,
  activeWing,
  hideFooter = false,
}: InstitutionShellProps) {
  const [location] = useLocation();
  // Shell direction follows the active language (ar/ur RTL, en/fr LTR).
  // Arabic Quran/Hadith excerpts keep their own local RTL containers.
  const { direction } = useLanguage();

  return (
      <div className="institution-shell min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors pb-16 md:pb-0" dir={direction} data-wing={activeWing}>
        <InstitutionalHeader />

        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>

        {!hideFooter && <InstitutionalFooter />}

        {/* Mobile Navigation Dock */}
        <nav
          className="institution-mobile-dock fixed bottom-0 inset-x-0 z-40 md:hidden flex items-center justify-around px-2 py-1.5"
          aria-label="شريط التنقل السريع"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-cairo transition-all",
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-0.5", isActive && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
  );
}
