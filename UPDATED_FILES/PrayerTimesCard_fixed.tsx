import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { usePrayerTimes } from "../hooks/usePrayerTimes";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PrayerTimesCard() {
  const { t } = useLanguage();
  const { prayerTimes, isLoading, error, currentPrayer, nextPrayer } =
    usePrayerTimes();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (nextPrayer && prayerTimes.length > 0) {
        // Find the next prayer time from prayerTimes array
        const nextPrayerObj = prayerTimes.find((p) => p.name === nextPrayer);
        if (nextPrayerObj) {
          const now = new Date();
          const [hours, minutes] = nextPrayerObj.time.split(":").map(Number);
          const nextPrayerTime = new Date();
          nextPrayerTime.setHours(hours, minutes, 0, 0);

          // If next prayer time has passed today, it's tomorrow
          if (nextPrayerTime <= now) {
            nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
          }

          const diff = nextPrayerTime.getTime() - now.getTime();

          if (diff > 0) {
            const remainingHours = Math.floor(diff / (1000 * 60 * 60));
            const remainingMinutes = Math.floor(
              (diff % (1000 * 60 * 60)) / (1000 * 60),
            );
            const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining({
              hours: remainingHours,
              minutes: remainingMinutes,
              seconds: remainingSeconds,
            });
          }
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, prayerTimes]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-gold-200 dark:border-gold-700 prayer-glow">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-red-200 dark:border-red-700">
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-4xl mb-2">
              error
            </span>
            <p className="font-amiri">تعذر تحميل أوقات الصلاة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-emerald-900/80 backdrop-blur-sm border border-gold-200 dark:border-gold-700 prayer-glow card-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <h3 className="text-lg font-amiri font-bold text-emerald-800 dark:text-emerald-100">
            أوقات الصلاة
          </h3>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-sm font-medium">الرياض</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {/* Current Prayer Highlight */}
        {nextPrayer && (
          <div className="gradient-emerald p-4 rounded-xl mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">الصلاة القادمة</p>
                <p className="text-xl font-amiri font-bold">
                  {prayerTimes.find((p) => p.name === nextPrayer)?.arabicName ||
                    nextPrayer}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm">الوقت المتبقي</p>
                <p className="text-2xl font-bold font-mono">
                  {String(timeRemaining.hours).padStart(2, "0")}:
                  {String(timeRemaining.minutes).padStart(2, "0")}:
                  {String(timeRemaining.seconds).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times List */}
        <div className="space-y-3">
          {prayerTimes &&
            prayerTimes.length > 0 &&
            prayerTimes.map((prayer) => (
              <div
                key={prayer.name}
                className={`flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  currentPrayer?.name === prayer.name ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentPrayer?.name === prayer.name
                        ? "bg-gray-400"
                        : nextPrayer === prayer.name
                          ? "bg-gold-500"
                          : "bg-emerald-500"
                    }`}
                  ></div>
                  <span className="font-amiri text-gray-900 dark:text-white">
                    {prayer.arabicName}
                  </span>
                </div>
                <span className="font-mono text-gray-600 dark:text-gray-300">
                  {prayer.time}
                </span>
              </div>
            ))}
        </div>

        <Button
          className="w-full mt-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-0"
          variant="outline"
        >
          <span className="material-symbols-outlined mr-2 rtl:ml-2">
            notifications
          </span>
          تفعيل التنبيهات
        </Button>
      </CardContent>
    </Card>
  );
}
