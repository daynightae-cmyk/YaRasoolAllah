import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDailyVerse } from "@/services/quranService";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface DailyVerseQuickCardProps {
  className?: string;
  showActions?: boolean;
}

export default function DailyVerseQuickCard({
  className,
  showActions = true,
}: DailyVerseQuickCardProps) {
  const { isRTL } = useLanguage();

  const { data: dailyVerse, isLoading } = useQuery({
    queryKey: ["/api/quran/daily-verse"],
    queryFn: getDailyVerse,
  });

  const shareVerse = () => {
    if (!dailyVerse) return;

    const message = `
🌟 الآية اليومية من الكتاب المبين 🌟

${dailyVerse.arabic}

"${dailyVerse.translation}"

📖 ${dailyVerse.surahName} - آية ${dailyVerse.ayah}

📱 منصة يا رسول الله ﷺ: https://yarasoolallah.org

#الآية_اليومية #القرآن_الكريم
    `.trim();

    if (navigator.share) {
      navigator.share({ title: "الآية اليومية", text: message });
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyVerse) {
    return (
      <Card className={cn("overflow-hidden border-dashed", className)}>
        <CardContent className="p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
            error
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            خطأ في تحميل الآية اليومية
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
        "bg-gradient-to-br from-white via-emerald-50 to-blue-50 dark:from-gray-800 dark:via-emerald-900/20 dark:to-blue-900/20",
        className,
      )}
    >
      <CardContent className="p-6 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-lg"></div>

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-white text-lg">
                  auto_awesome
                </span>
              </div>
              <div>
                <h3 className="font-amiri font-bold text-emerald-700 dark:text-emerald-400">
                  الآية اليومية العالمية
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString("ar-SA", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-bounce">
              🌟 ذهبي
            </Badge>
          </div>

          {/* Arabic Verse */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800">
              <p className="text-lg md:text-xl font-amiri leading-relaxed text-gray-900 dark:text-white verse-text">
                {dailyVerse.arabic}
              </p>
            </div>
          </div>

          {/* Translation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-inter leading-relaxed text-gray-700 dark:text-gray-300 text-center">
              "{dailyVerse.translation}"
            </p>
          </div>

          {/* Reference */}
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-emerald-600 border-emerald-200 dark:border-emerald-700"
            >
              📖 {dailyVerse.surahName} - آية {dailyVerse.ayah}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                1.2M+
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                مستخدم
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                30
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                لغة
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                24/7
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                مفعل
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-4">
              <Link href="/daily-verse" asChild>
                <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white">
                  <span className="material-symbols-outlined mr-2 text-sm">
                    explore
                  </span>
                  استكشف الميزة الذهبية
                </Button>
              </Link>

              <Button
                size="sm"
                variant="outline"
                onClick={shareVerse}
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </Button>
            </div>
          )}

          {/* Golden Feature Badge */}
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">✨</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for sidebar or compact spaces
export function DailyVerseMiniCard({ className }: { className?: string }) {
  const { data: dailyVerse, isLoading } = useQuery({
    queryKey: ["/api/quran/daily-verse"],
    queryFn: getDailyVerse,
  });

  if (isLoading || !dailyVerse) {
    return (
      <Card className={cn("p-3", className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700",
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-sm">
            auto_awesome
          </span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            آية اليوم
          </span>
        </div>

        <p className="text-sm font-amiri text-gray-800 dark:text-white leading-relaxed">
          {dailyVerse.arabic.length > 100
            ? dailyVerse.arabic.substring(0, 100) + "..."
            : dailyVerse.arabic}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {dailyVerse.surahName}
          </Badge>
          <Link href="/daily-verse" asChild>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              المزيد
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
