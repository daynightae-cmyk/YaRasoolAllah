import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDailyVerse } from "@/services/quranService";
import { cn } from "@/lib/utils";

interface WidgetSettings {
  size: "small" | "medium" | "large";
  showTranslation: boolean;
  showReference: boolean;
  showDua: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

interface DailyVerseWidgetProps {
  size?: "small" | "medium" | "large";
  showActions?: boolean;
  onNavigateToApp?: () => void;
  className?: string;
}

export default function DailyVerseWidget({
  size = "medium",
  showActions = true,
  onNavigateToApp,
  className,
}: DailyVerseWidgetProps) {
  const { isRTL } = useLanguage();
  const [settings, setSettings] = useState<WidgetSettings>({
    size,
    showTranslation: true,
    showReference: true,
    showDua: size !== "small",
    theme: "auto",
    language: "ar",
  });

  const { data: dailyVerse, isLoading } = useQuery({
    queryKey: ["/api/quran/daily-verse"],
    queryFn: getDailyVerse,
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours
  });

  useEffect(() => {
    // Load widget settings from localStorage
    const savedSettings = localStorage.getItem("widget-settings");
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const getDailyDua = () => {
    const duas = [
      "اللهم اهدنا فيمن هديت، وعافنا فيمن عافيت",
      "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
      "اللهم أعنا على ذكرك وشكرك وحسن عبادتك",
      "ربنا اغفر لنا ذنوبنا وإسرافنا في أمرنا",
      "اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا",
    ];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return duas[dayOfYear % duas.length];
  };

  const shareWidget = () => {
    if (!dailyVerse) return;

    const message = `
🌟 الآية اليومية من الكتاب المبين 🌟

${dailyVerse.arabic}

"${dailyVerse.translation}"

📖 ${dailyVerse.surahName} - آية ${dailyVerse.ayah}

${settings.showDua ? `🤲 ${getDailyDua()}\n` : ""}
📱 منصة يا رسول الله ﷺ: https://yarasoolallah.org

#الآية_اليومية #القرآن_الكريم
    `.trim();

    if (navigator.share) {
      navigator.share({ title: "الآية اليومية", text: message });
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  // Size-based styling
  const sizeStyles = {
    small: {
      container: "p-3 max-w-sm",
      arabic: "text-sm font-amiri leading-relaxed",
      translation: "text-xs",
      reference: "text-xs",
      dua: "text-xs",
      button: "text-xs h-6 px-2",
    },
    medium: {
      container: "p-4 max-w-md",
      arabic: "text-lg font-amiri leading-relaxed",
      translation: "text-sm",
      reference: "text-sm",
      dua: "text-sm",
      button: "text-sm h-8 px-3",
    },
    large: {
      container: "p-6 max-w-lg",
      arabic: "text-xl font-amiri leading-relaxed",
      translation: "text-base",
      reference: "text-base",
      dua: "text-base",
      button: "text-base h-10 px-4",
    },
  };

  const currentStyles = sizeStyles[settings.size];

  if (isLoading) {
    return (
      <Card
        className={cn("widget-loading", currentStyles.container, className)}
      >
        <CardContent className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyVerse) {
    return (
      <Card className={cn("widget-error", currentStyles.container, className)}>
        <CardContent className="text-center">
          <span className="material-symbols-outlined text-gray-400 mb-2">
            error
          </span>
          <p className="text-xs text-gray-500">خطأ في تحميل الآية</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "widget-daily-verse overflow-hidden border-0 shadow-lg",
        "bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20",
        currentStyles.container,
        className,
      )}
    >
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">
                auto_awesome
              </span>
            </div>
            <span
              className={cn(
                "font-bold text-emerald-700 dark:text-emerald-400",
                currentStyles.reference,
              )}
            >
              الكتاب المبين
            </span>
          </div>
          <Badge variant="secondary" className={currentStyles.reference}>
            آية اليوم
          </Badge>
        </div>

        {/* Arabic Verse */}
        <div className="text-center">
          <p
            className={cn(
              "text-gray-900 dark:text-white verse-text",
              currentStyles.arabic,
            )}
          >
            {dailyVerse.arabic}
          </p>
        </div>

        {/* Translation */}
        {settings.showTranslation && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <p
              className={cn(
                "text-gray-700 dark:text-gray-300 font-inter leading-relaxed",
                currentStyles.translation,
              )}
            >
              "{dailyVerse.translation}"
            </p>
          </div>
        )}

        {/* Reference */}
        {settings.showReference && (
          <div className="text-center">
            <Badge
              variant="outline"
              className={cn(
                "text-emerald-600 border-emerald-200",
                currentStyles.reference,
              )}
            >
              {dailyVerse.surahName} - آية {dailyVerse.ayah}
            </Badge>
          </div>
        )}

        {/* Daily Dua */}
        {settings.showDua && settings.size !== "small" && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-purple-600 text-sm">
                hands
              </span>
              <span
                className={cn(
                  "font-semibold text-purple-700 dark:text-purple-400",
                  currentStyles.reference,
                )}
              >
                دعاء اليوم
              </span>
            </div>
            <p
              className={cn(
                "text-purple-800 dark:text-purple-300 font-amiri",
                currentStyles.dua,
              )}
            >
              {getDailyDua()}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              size="sm"
              onClick={
                onNavigateToApp || (() => window.open("/daily-verse", "_blank"))
              }
              className={cn(
                "flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700",
                currentStyles.button,
              )}
            >
              <span className="material-symbols-outlined mr-1 text-sm">
                open_in_new
              </span>
              اقرأ في التطبيق
            </Button>

            {settings.size !== "small" && (
              <Button
                size="sm"
                variant="outline"
                onClick={shareWidget}
                className={cn(
                  "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
                  currentStyles.button,
                )}
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </Button>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            آخر تحديث: {new Date().toLocaleDateString("ar-SA")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Widget Configuration Component
export function DailyVerseWidgetConfig({
  settings,
  onSettingsChange,
}: {
  settings: WidgetSettings;
  onSettingsChange: (settings: WidgetSettings) => void;
}) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-amiri font-semibold">إعدادات Widget</h4>

      {/* Size Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">الحجم</label>
        <div className="flex gap-2">
          {(["small", "medium", "large"] as const).map((size) => (
            <Button
              key={size}
              size="sm"
              variant={settings.size === size ? "default" : "outline"}
              onClick={() => onSettingsChange({ ...settings, size })}
            >
              {size === "small" ? "صغير" : size === "medium" ? "متوسط" : "كبير"}
            </Button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">خيارات العرض</label>
        <div className="space-y-2">
          {[
            { key: "showTranslation", label: "إظهار الترجمة" },
            { key: "showReference", label: "إظهار المرجع" },
            { key: "showDua", label: "إظهار الدعاء" },
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <span className="text-sm">{option.label}</span>
              <input
                type="checkbox"
                checked={
                  settings[option.key as keyof WidgetSettings] as boolean
                }
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    [option.key]: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for widget management
export function useDailyVerseWidget() {
  const [settings, setSettings] = useState<WidgetSettings>({
    size: "medium",
    showTranslation: true,
    showReference: true,
    showDua: true,
    theme: "auto",
    language: "ar",
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("widget-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<WidgetSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("widget-settings", JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
  };
}
