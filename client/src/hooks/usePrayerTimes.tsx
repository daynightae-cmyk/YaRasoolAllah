import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimesData {
  city: string;
  date: string;
  times: PrayerTimes;
}

interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

export function usePrayerTimes() {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: "الرياض", // Default city, would be resolved via reverse geocoding
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Riyadh
          setLocation({
            latitude: 24.7136,
            longitude: 46.6753,
            city: "الرياض",
          });
        }
      );
    } else {
      // Default to Riyadh
      setLocation({
        latitude: 24.7136,
        longitude: 46.6753,
        city: "الرياض",
      });
    }
  }, []);

  // Fetch prayer times
  const { data: prayerTimes, isLoading, error } = useQuery<PrayerTimesData>({
    queryKey: ["/api/prayer-times", location?.city],
    enabled: !!location,
  });

  // Calculate current prayer and countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const updatePrayerStatus = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const prayers = [
        { name: "الفجر", nameEn: "fajr", time: prayerTimes.times.fajr },
        { name: "الشروق", nameEn: "sunrise", time: prayerTimes.times.sunrise },
        { name: "الظهر", nameEn: "dhuhr", time: prayerTimes.times.dhuhr },
        { name: "العصر", nameEn: "asr", time: prayerTimes.times.asr },
        { name: "المغرب", nameEn: "maghrib", time: prayerTimes.times.maghrib },
        { name: "العشاء", nameEn: "isha", time: prayerTimes.times.isha },
      ];

      let current = "";
      let next = "";
      let timeToNext = "";

      for (let i = 0; i < prayers.length; i++) {
        const [hours, minutes] = prayers[i].time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        if (now < prayerTime) {
          next = prayers[i].name;
          current = i > 0 ? prayers[i - 1].name : "العشاء";
          
          const diff = prayerTime.getTime() - now.getTime();
          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
          const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
          
          timeToNext = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
          break;
        }
      }

      // If no next prayer found today, next is Fajr tomorrow
      if (!next) {
        next = "الفجر";
        current = "العشاء";
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hours, minutes] = prayerTimes.times.fajr.split(':').map(Number);
        tomorrow.setHours(hours, minutes, 0, 0);
        
        const diff = tomorrow.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
        
        timeToNext = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
      }

      setCurrentPrayer(current);
      setNextPrayer(next);
      setTimeRemaining(timeToNext);
    };

    updatePrayerStatus();
    const interval = setInterval(updatePrayerStatus, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return {
    prayerTimes: prayerTimes?.times || null,
    location,
    currentPrayer,
    nextPrayer,
    timeRemaining,
    isLoading,
    error,
  };
}
