import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

interface PrayerTimesData {
  prayers: PrayerTime[];
  location: string;
  date: string;
}

export function usePrayerTimes(latitude?: number, longitude?: number) {
  const { data, isLoading, error } = useQuery<PrayerTimesData>({
    queryKey: ["/api/prayer-times", latitude, longitude],
    enabled: !!latitude && !!longitude,
  });

  const currentPrayer = useMemo(() => {
    if (!data?.prayers) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < data.prayers.length; i++) {
      const prayer = data.prayers[i];
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      // If current time is before this prayer time, this is the next prayer
      if (currentTime < prayerTime) {
        return {
          ...prayer,
          timeRemaining: prayerTime - currentTime,
        };
      }
    }

    // If no prayer found for today, next prayer is Fajr tomorrow
    const fajr = data.prayers[0];
    const [fajrHours, fajrMinutes] = fajr.time.split(":").map(Number);
    const fajrTime = fajrHours * 60 + fajrMinutes;
    const timeRemaining = 24 * 60 - currentTime + fajrTime;

    return {
      ...fajr,
      timeRemaining,
    };
  }, [data]);

  const formatTimeRemaining = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // We don't track seconds in this implementation

    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    prayerTimes: data as PrayerTimesData,
    currentPrayer,
    isLoading,
    error,
    formatTimeRemaining,
  };
}
