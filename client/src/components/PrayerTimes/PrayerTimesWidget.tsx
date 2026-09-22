import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { CountdownTimer } from "./CountdownTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPrayerTimes, type PrayerTimes } from "@/services/prayerTimesService";
import { PRAYER_NAMES } from "@/lib/constants";
import { detectUserLocation, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PrayerTimesWidget() {
  const { t, language, isRTL } = useLanguage();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayerTime, setNextPrayerTime] = useState<Date | null>(null);

  const { data: prayerTimes, isLoading, error } = useQuery({
    queryKey: ["/api/prayer-times", location?.latitude, location?.longitude],
    queryFn: () => location ? getPrayerTimes(location.latitude, location.longitude) : null,
    enabled: !!location,
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const coords = await detectUserLocation();
        setLocation(coords);
      } catch (error) {
        console.error("Failed to get location:", error);
        // Use default location (Riyadh)
        setLocation({ latitude: 24.7136, longitude: 46.6753 });
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      const now = new Date();
      const times = [
        { name: "Fajr", time: new Date(prayerTimes.fajr) },
        { name: "Dhuhr", time: new Date(prayerTimes.dhuhr) },
        { name: "Asr", time: new Date(prayerTimes.asr) },
        { name: "Maghrib", time: new Date(prayerTimes.maghrib) },
        { name: "Isha", time: new Date(prayerTimes.isha) },
      ];

      // Find current and next prayer
      let current = "";
      let next: Date | null = null;

      for (let i = 0; i < times.length; i++) {
        if (now < times[i].time) {
          next = times[i].time;
          current = i === 0 ? "Isha" : times[i - 1].name; // If before Fajr, current is Isha
          break;
        }
      }

      // If after Isha, next is tomorrow's Fajr
      if (!next && times[0]) {
        const tomorrow = new Date(times[0].time);
        tomorrow.setDate(tomorrow.getDate() + 1);
        next = tomorrow;
        current = "Isha";
      }

      setCurrentPrayer(current);
      setNextPrayerTime(next);
    }
  }, [prayerTimes]);

  const getPrayerNames = () => PRAYER_NAMES[language] || PRAYER_NAMES.ar;

  const getPrayerDisplayTimes = () => {
    if (!prayerTimes) return [];
    
    const prayerNames = getPrayerNames();
    return [
      { name: prayerNames[0], time: formatTime(new Date(prayerTimes.fajr)) },
      { name: prayerNames[1], time: formatTime(new Date(prayerTimes.sunrise)) },
      { name: prayerNames[2], time: formatTime(new Date(prayerTimes.dhuhr)) },
      { name: prayerNames[3], time: formatTime(new Date(prayerTimes.asr)) },
      { name: prayerNames[4], time: formatTime(new Date(prayerTimes.maghrib)) },
      { name: prayerNames[5], time: formatTime(new Date(prayerTimes.isha)) },
    ];
  };

  if (isLoading) {
    return (
      <Card className="card-islamic animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-islamic">
        <CardContent className="p-6 text-center">
          <span className="material-symbols-outlined text-destructive text-4xl mb-4">error</span>
          <p className="text-destructive font-medium">{t("errors.prayerTimes")}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-islamic prayer-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-amiri">
          {t("prayer.title")}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-primary">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-sm font-medium font-inter">
              {t("prayer.location")}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Current Prayer Highlight */}
        {currentPrayer && nextPrayerTime && (
          <div className="gradient-emerald p-4 rounded-xl mb-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm font-inter">
                  {t("prayer.next")}
                </p>
                <p className="text-xl font-amiri font-bold">
                  {getPrayerNames()[0]} {/* This would need proper mapping */}
                </p>
              </div>
              <div className={cn("text-right", !isRTL && "text-left")}>
                <p className="text-primary-foreground/80 text-sm font-inter">
                  {t("prayer.timeRemaining")}
                </p>
                <CountdownTimer targetTime={nextPrayerTime} />
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times List */}
        <div className="space-y-3">
          {getPrayerDisplayTimes().map((prayer, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index % 2 === 0 ? "bg-primary" : "bg-secondary"
                  )}
                />
                <span className="font-amiri text-foreground">{prayer.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">{prayer.time}</span>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          <span className="material-symbols-outlined mr-2 rtl:ml-2">notifications</span>
          {t("prayer.enableNotifications")}
        </Button>
      </CardContent>
    </Card>
  );
}
