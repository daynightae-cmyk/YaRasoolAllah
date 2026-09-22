import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  nativeName: string;
  nameEn: string;
  dir: "rtl" | "ltr";
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: "ar", nativeName: "العربية", nameEn: "Arabic", dir: "rtl" },
  { code: "en", nativeName: "English", nameEn: "English", dir: "ltr" },
  { code: "fr", nativeName: "Français", nameEn: "French", dir: "ltr" },
  { code: "ur", nativeName: "اردو", nameEn: "Urdu", dir: "rtl" },
  { code: "tr", nativeName: "Türkçe", nameEn: "Turkish", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", nameEn: "German", dir: "ltr" },
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-2.5 rounded-xl border-border bg-card hover:bg-muted text-foreground text-xs font-cairo gap-1.5"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-semibold">{currentLang.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-1 w-44 rounded-2xl bg-card border border-border shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-xs font-cairo flex items-center justify-between transition-colors",
                  isSelected
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
