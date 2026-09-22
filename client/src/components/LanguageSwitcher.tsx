import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";
import {
  ChevronDown,
  ChevronUp,
  Languages,
  Globe,
  Check,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  completeness: number;
  description: string;
}

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const { mode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = [
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      flag: "🇸🇦",
      rtl: true,
      isPopular: true,
      completeness: 100,
      description: "اللغة الأصلية للقرآن الكريم",
    },
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
      rtl: false,
      isPopular: true,
      completeness: 100,
      description: "Global language for Islamic studies",
    },
    {
      code: "fr",
      name: "French",
      nativeName: "Français",
      flag: "🇫🇷",
      rtl: false,
      isNew: true,
      completeness: 100,
      description: "Langue française pour l'Islam",
    },
    {
      code: "ur",
      name: "Urdu",
      nativeName: "اردو",
      flag: "🇵🇰",
      rtl: true,
      isNew: true,
      completeness: 100,
      description: "زبان اردو برائے اسلامی علوم",
    },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-2xl font-inter transition-all duration-300 hover:scale-105",
          mode === "heaven"
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
            : "bg-white/80 border-gray-200 hover:bg-white hover:shadow-lg",
          isOpen && "scale-105 shadow-lg",
        )}
      >
        {/* Flag and Language */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-lg">{currentLanguage.flag}</span>
          <div className="hidden sm:block">
            <div
              className={cn(
                "text-sm font-bold transition-colors duration-700",
                mode === "heaven" ? "text-white" : "text-gray-700",
              )}
            >
              {currentLanguage.nativeName}
            </div>
            <div
              className={cn(
                "text-xs transition-colors duration-700",
                mode === "heaven" ? "text-white/70" : "text-gray-500",
              )}
            >
              {currentLanguage.name}
            </div>
          </div>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Popular Badge */}
        {currentLanguage.isPopular && (
          <div className="absolute -top-2 -right-2">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                mode === "heaven"
                  ? "bg-amber-400 text-amber-900"
                  : "bg-amber-400 text-white",
              )}
            >
              {mode === "heaven" ? (
                <Sparkles className="w-3 h-3 animate-twinkle" />
              ) : (
                <Star className="w-3 h-3" />
              )}
            </div>
          </div>
        )}
      </Button>

      {/* Language Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute top-full mt-2 right-0 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 transition-all duration-300",
              mode === "heaven"
                ? "bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 border-white/20 backdrop-blur-xl"
                : "bg-white/95 border-gray-200 backdrop-blur-xl",
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "p-4 border-b transition-all duration-700",
                mode === "heaven" ? "border-white/20" : "border-gray-200",
              )}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-700",
                    mode === "heaven"
                      ? "bg-white/10 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                  )}
                >
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "font-amiri font-bold transition-colors duration-700",
                      mode === "heaven" ? "text-white" : "text-gray-800",
                    )}
                  >
                    {mode === "heaven" ? "اختر لغتك المباركة" : "اختر اللغة"}
                  </h3>
                  <p
                    className={cn(
                      "text-sm transition-colors duration-700",
                      mode === "heaven" ? "text-white/70" : "text-gray-600",
                    )}
                  >
                    Choose your language
                  </p>
                </div>
              </div>
            </div>

            {/* Language Options */}
            <div className="p-2">
              {languages.map((lang, index) => {
                const isActive = lang.code === language;

                return (
                  <div
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105",
                      isActive
                        ? mode === "heaven"
                          ? "bg-white/20 border-2 border-white/30 shadow-lg"
                          : "bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200"
                        : mode === "heaven"
                          ? "hover:bg-white/10"
                          : "hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {/* Flag */}
                      <div className="relative">
                        <span className="text-2xl">{lang.flag}</span>
                        {lang.isPopular && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                            <Crown className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Language Info */}
                      <div
                        className={cn(
                          "text-right",
                          lang.rtl ? "text-right" : "text-left",
                        )}
                      >
                        <div
                          className={cn(
                            "font-bold transition-colors duration-700",
                            mode === "heaven" ? "text-white" : "text-gray-800",
                          )}
                        >
                          {lang.nativeName}
                        </div>
                        <div
                          className={cn(
                            "text-sm transition-colors duration-700",
                            mode === "heaven"
                              ? "text-white/70"
                              : "text-gray-600",
                          )}
                        >
                          {lang.name}
                        </div>
                        <div
                          className={cn(
                            "text-xs mt-1 transition-colors duration-700",
                            mode === "heaven"
                              ? "text-white/60"
                              : "text-gray-500",
                          )}
                        >
                          {lang.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {/* Badges */}
                      <div className="flex flex-col items-end space-y-1">
                        {lang.isPopular && (
                          <Badge
                            className={cn(
                              "text-xs px-2 py-1",
                              mode === "heaven"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-amber-100 text-amber-700",
                            )}
                          >
                            شائع
                          </Badge>
                        )}
                        {lang.isNew && (
                          <Badge
                            className={cn(
                              "text-xs px-2 py-1",
                              mode === "heaven"
                                ? "bg-green-400/20 text-green-300 border border-green-400/30"
                                : "bg-green-100 text-green-700",
                            )}
                          >
                            جديد
                          </Badge>
                        )}
                      </div>

                      {/* Completeness */}
                      <div className="text-center">
                        <div
                          className={cn(
                            "text-xs mb-1 transition-colors duration-700",
                            mode === "heaven"
                              ? "text-white/70"
                              : "text-gray-500",
                          )}
                        >
                          {lang.completeness}%
                        </div>
                        <div
                          className={cn(
                            "w-12 h-2 rounded-full overflow-hidden",
                            mode === "heaven" ? "bg-white/20" : "bg-gray-200",
                          )}
                        >
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              lang.completeness === 100
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : "bg-gradient-to-r from-yellow-400 to-orange-500",
                            )}
                            style={{ width: `${lang.completeness}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                            mode === "heaven"
                              ? "bg-emerald-400 text-emerald-900"
                              : "bg-emerald-500 text-white",
                          )}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "p-4 border-t text-center transition-all duration-700",
                mode === "heaven" ? "border-white/20" : "border-gray-200",
              )}
            >
              <p
                className={cn(
                  "text-xs transition-colors duration-700",
                  mode === "heaven" ? "text-white/60" : "text-gray-500",
                )}
              >
                {mode === "heaven"
                  ? "🌟 جميع اللغات متاحة بفضل الله"
                  : "🌍 المزيد من اللغات قريباً"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
