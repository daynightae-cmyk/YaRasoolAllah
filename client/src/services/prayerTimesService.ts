/**
 * QUARANTINED LEGACY SERVICE — NOT A LIVE AUTHORITY.
 *
 * The golden Prayer Observatory (`client/src/visual-golden/services/prayer/`)
 * is the only production prayer-times path. This module must never synthesize
 * prayer times: every network or geolocation failure throws so callers render
 * loading / offline / provider-error / permission-denied states instead of
 * fake live times. No hardcoded city fallback exists in this file.
 */

interface PrayerTimesResponse {
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      hijri: {
        date: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

export interface PrayerTime {
  name: string;
  time: string;
  timestamp: Date;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export class PrayerTimesService {
  private baseUrl = "https://api.aladhan.com/v1";
  
  async getPrayerTimes(location: Location, date?: Date): Promise<PrayerTime[]> {
    try {
      const dateStr = date ? this.formatDate(date) : this.formatDate(new Date());
      
      const response = await fetch(
        `${this.baseUrl}/timings/${dateStr}?latitude=${location.latitude}&longitude=${location.longitude}&method=4&tune=0,0,0,0,0,0,0,0,0`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PrayerTimesResponse = await response.json();
      
      return this.formatPrayerTimes(data.data.timings, date || new Date());
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      // Quarantined: network failure must surface as provider-error, never as
      // synthesized times presented as live.
      throw error instanceof Error ? error : new Error("Prayer-times provider unavailable");
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Quarantined: never silently resolve a hardcoded city. Callers must
          // ask the user to pick a location or show permission-denied.
          reject(error instanceof Error ? error : new Error("Geolocation unavailable"));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });
  }

  async getCityPrayerTimes(city: string, country: string, date?: Date): Promise<PrayerTime[]> {
    try {
      const dateStr = date ? this.formatDate(date) : this.formatDate(new Date());
      
      const response = await fetch(
        `${this.baseUrl}/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PrayerTimesResponse = await response.json();
      
      return this.formatPrayerTimes(data.data.timings, date || new Date());
    } catch (error) {
      console.error("Error fetching prayer times by city:", error);
      throw error instanceof Error ? error : new Error("Prayer-times provider unavailable");
    }
  }

  private formatPrayerTimes(timings: any, date: Date): PrayerTime[] {
    const prayers = [
      { name: "fajr", time: timings.Fajr },
      { name: "sunrise", time: timings.Sunrise },
      { name: "dhuhr", time: timings.Dhuhr },
      { name: "asr", time: timings.Asr },
      { name: "maghrib", time: timings.Maghrib },
      { name: "isha", time: timings.Isha },
    ];

    return prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const timestamp = new Date(date);
      timestamp.setHours(hours, minutes, 0, 0);

      return {
        name: prayer.name,
        time: this.formatTime12Hour(prayer.time),
        timestamp,
      };
    });
  }

  private formatTime12Hour(time24: string): string {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "م" : "ص";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCurrentPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (let i = prayerTimes.length - 1; i >= 0; i--) {
      const prayer = prayerTimes[i];
      const prayerTime = prayer.timestamp.getHours() * 60 + prayer.timestamp.getMinutes();
      
      if (currentTime >= prayerTime) {
        return prayer;
      }
    }

    // If no prayer found, return last prayer of previous day
    return prayerTimes[prayerTimes.length - 1];
  }

  getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayerTimes) {
      const prayerTime = prayer.timestamp.getHours() * 60 + prayer.timestamp.getMinutes();
      
      if (currentTime < prayerTime) {
        return prayer;
      }
    }

    // If no next prayer today, return first prayer of next day
    return prayerTimes[0];
  }

  getTimeRemaining(targetTime: Date): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    let diff = targetTime.getTime() - now.getTime();

    // If target time is tomorrow
    if (diff < 0) {
      const tomorrow = new Date(targetTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      diff = tomorrow.getTime() - now.getTime();
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }
}

export const prayerTimesService = new PrayerTimesService();

export async function getPrayerTimes(
  latitude: number,
  longitude: number,
): Promise<PrayerTimes> {
  const times = await prayerTimesService.getPrayerTimes({ latitude, longitude });
  return {
    fajr: times[0].timestamp.toISOString(),
    sunrise: times[1].timestamp.toISOString(),
    dhuhr: times[2].timestamp.toISOString(),
    asr: times[3].timestamp.toISOString(),
    maghrib: times[4].timestamp.toISOString(),
    isha: times[5].timestamp.toISOString(),
  };
}
