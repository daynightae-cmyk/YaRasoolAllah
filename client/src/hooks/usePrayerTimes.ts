import { useState, useEffect } from "react";

interface PrayerTime {
  name: string;
  time: string;
  timestamp: Date;
}

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimeItem {
  name: string;
  time: string;
  arabicName: string;
}

interface UsePrayerTimesReturn {
  prayerTimes: PrayerTimeItem[];
  location: string;
  nextPrayer: string;
  timeRemaining: string;
  isLoading: boolean;
  error: string | null;
  currentPrayer: PrayerTime | null;
}

export function usePrayerTimes(): UsePrayerTimesReturn {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<string>("الرياض");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setIsLoading(true);

        // Get user's location
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );

        const { latitude, longitude } = position.coords;

        // Use the Prayer Times API
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prayer times");
        }

        const data = await response.json();
        const timings = data.data.timings;

        // Convert to our format
        const times: PrayerTimes = {
          fajr: timings.Fajr,
          sunrise: timings.Sunrise,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        };

        setPrayerTimes(times);
        setLocation(data.data.meta?.city || "الرياض");
        setError(null);
      } catch (err) {
        console.error("Error fetching prayer times:", err);

        // Fallback to static times for Riyadh
        const fallbackTimes: PrayerTimes = {
          fajr: "05:30",
          sunrise: "06:45",
          dhuhr: "12:15",
          asr: "15:30",
          maghrib: "18:20",
          isha: "19:50",
        };

        setPrayerTimes(fallbackTimes);
        setLocation("الرياض");
        setError("Using offline prayer times for Riyadh");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const updatePrayerStatus = () => {
      const now = new Date();

      const prayers = [
        { name: "fajr", arabicName: "الفجر", time: prayerTimes.fajr },
        { name: "sunrise", arabicName: "الشروق", time: prayerTimes.sunrise },
        { name: "dhuhr", arabicName: "الظهر", time: prayerTimes.dhuhr },
        { name: "asr", arabicName: "العصر", time: prayerTimes.asr },
        { name: "maghrib", arabicName: "المغرب", time: prayerTimes.maghrib },
        { name: "isha", arabicName: "العشاء", time: prayerTimes.isha },
      ];

      let current: PrayerTime | null = null;
      let next = "";
      let timeToNext = "";

      for (let i = 0; i < prayers.length; i++) {
        const [hours, minutes] = prayers[i].time.split(":").map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        if (now < prayerTime) {
          next = prayers[i].name; // Use English name for consistency
          if (i > 0) {
            current = {
              name: prayers[i - 1].name,
              time: prayers[i - 1].time,
              timestamp: new Date(),
            };
          }

          const diff = prayerTime.getTime() - now.getTime();
          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
          const minutesLeft = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60),
          );
          const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

          timeToNext = `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
          break;
        }
      }

      // If no next prayer found today, next is Fajr tomorrow
      if (!next) {
        next = "fajr";
        current = {
          name: "isha",
          time: prayerTimes.isha,
          timestamp: new Date(),
        };

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hours, minutes] = prayerTimes.fajr.split(":").map(Number);
        tomorrow.setHours(hours, minutes, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        timeToNext = `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
      }

      setCurrentPrayer(current);
      setNextPrayer(next);
      setTimeRemaining(timeToNext);
    };

    updatePrayerStatus();
    const interval = setInterval(updatePrayerStatus, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Convert prayer times object to array format expected by components
  const prayerTimesArray = prayerTimes
    ? [
        { name: "fajr", time: prayerTimes.fajr, arabicName: "الفجر" },
        { name: "sunrise", time: prayerTimes.sunrise, arabicName: "الشروق" },
        { name: "dhuhr", time: prayerTimes.dhuhr, arabicName: "الظهر" },
        { name: "asr", time: prayerTimes.asr, arabicName: "العصر" },
        { name: "maghrib", time: prayerTimes.maghrib, arabicName: "المغرب" },
        { name: "isha", time: prayerTimes.isha, arabicName: "العشاء" },
      ]
    : [];

  return {
    prayerTimes: prayerTimesArray,
    location,
    nextPrayer,
    timeRemaining,
    isLoading,
    error,
    currentPrayer,
  };
}
