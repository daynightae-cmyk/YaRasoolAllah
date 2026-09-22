import { usePrayerTimes } from "../../hooks/usePrayerTimes";
import { useLanguage } from "../../contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrayerTimesCard() {
  const { t, isRTL } = useLanguage();
  const { prayerTimes, location, nextPrayer, timeRemaining, isLoading, error } =
    usePrayerTimes();

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-gold-200 dark:border-gold-700 shadow-xl">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !prayerTimes.length) {
    return (
      <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-red-200 dark:border-red-700 shadow-xl">
        <CardContent className="p-6 text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-4 block">
            error
          </span>
          <h3 className="text-lg font-amiri font-bold text-red-700 dark:text-red-400 mb-2">
            خطأ في أوقات الصلاة
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            {error || "لا يمكن تحميل أوقات الصلاة"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const prayers = prayerTimes.map((prayer) => ({
    nameAr: prayer.arabicName,
    nameEn: prayer.name,
    time: prayer.time,
    color: prayer.name === nextPrayer ? "gold" : "emerald",
  }));

  return (
    <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-gold-200 dark:border-gold-700 shadow-xl prayer-glow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-amiri font-bold text-emerald-800 dark:text-emerald-100">
            أوقات الصلاة
          </h3>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-sm">
              location_on
            </span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>

        {/* Current Prayer & Countdown */}
        {nextPrayer && timeRemaining && (
          <div className="bg-gradient-to-r from-gold-100 to-gold-50 dark:from-gold-900/20 dark:to-gold-800/20 rounded-xl p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gold-700 dark:text-gold-300 font-medium mb-1">
                الصلاة القادمة
              </p>
              <h4 className="text-lg font-amiri font-bold text-gold-800 dark:text-gold-200 mb-2">
                {prayers.find((p) => p.nameEn === nextPrayer)?.nameAr ||
                  nextPrayer}
              </h4>
              <div className="text-2xl font-mono font-bold text-gold-900 dark:text-gold-100">
                {timeRemaining}
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times Grid */}
        <div className="space-y-3">
          {prayers.map((prayer, index) => (
            <div
              key={prayer.nameEn}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                prayer.nameEn === nextPrayer
                  ? "bg-gold-50 dark:bg-gold-900/20 border-2 border-gold-200 dark:border-gold-700 shadow-md"
                  : "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
              }`}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    prayer.nameEn === nextPrayer
                      ? "bg-gold-500 text-white shadow-lg"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                </div>
                <div>
                  <h5 className="font-amiri font-semibold text-gray-900 dark:text-white">
                    {prayer.nameAr}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {prayer.nameEn}
                  </p>
                </div>
              </div>
              <div
                className={`text-lg font-mono font-bold ${
                  prayer.nameEn === nextPrayer
                    ? "text-gold-700 dark:text-gold-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {prayer.time}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>آخر تحديث: الآن</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
