import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PrayerCountdown from "./PrayerCountdown";
import { useEffect, useState } from "react";

export default function PrayerTimesCard() {
  const { t, isRTL } = useLanguage();
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const { prayerTimes, currentPrayer, isLoading } = usePrayerTimes(coordinates?.lat, coordinates?.lng);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Riyadh coordinates
          setCoordinates({ lat: 24.7136, lng: 46.6753 });
        }
      );
    } else {
      setCoordinates({ lat: 24.7136, lng: 46.6753 });
    }
  }, []);

  if (isLoading || !prayerTimes) {
    return (
      <Card className="prayer-glow">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="prayer-glow card-hover">
      <CardHeader>
        <CardTitle className={`flex items-center justify-between font-amiri ${isRTL ? 'text-right' : 'text-left'}`}>
          <span>{t("prayer.times_title")}</span>
          <div className={`flex items-center space-x-2 text-primary ${isRTL ? 'space-x-reverse' : ''}`}>
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-sm font-medium">
              {prayerTimes.location || t("prayer.riyadh")}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Current Prayer Highlight */}
        {currentPrayer && (
          <div className="gradient-emerald p-4 rounded-xl mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">{t("prayer.current")}</p>
                <p className="text-xl font-amiri font-bold">
                  {currentPrayer.arabicName}
                </p>
              </div>
              <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                <p className="text-emerald-100 text-sm">{t("prayer.remaining")}</p>
                <PrayerCountdown timeRemaining={currentPrayer.timeRemaining} />
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times List */}
        <div className="space-y-3">
          {prayerTimes.prayers?.map((prayer, index) => (
            <div 
              key={prayer.name}
              className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
            >
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${
                  currentPrayer?.name === prayer.name 
                    ? 'bg-primary' 
                    : index % 2 === 0 
                      ? 'bg-emerald-500' 
                      : 'bg-amber-500'
                }`}></div>
                <span className="font-amiri text-foreground">
                  {prayer.arabicName}
                </span>
              </div>
              <Badge variant="outline" className="font-mono">
                {prayer.time}
              </Badge>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          <span className="material-symbols-outlined mr-2">notifications</span>
          {t("prayer.enable_notifications")}
        </Button>
      </CardContent>
    </Card>
  );
}
