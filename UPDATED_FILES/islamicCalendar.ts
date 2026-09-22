export interface HijriDate {
  day: number;
  month: number;
  year: number;
}

export interface IslamicEvent {
  id: string;
  title: string;
  name: { ar: string; en: string };
  gregorianDate: string;
  hijriDate: HijriDate;
  type: string;
  description?: string;
}

export const islamicEvents: IslamicEvent[] = [];

/**
 * Format a Gregorian date using the Islamic calendar.
 * Defaults to Arabic locale.
 */
export function formatHijriDate(date: Date, locale = "ar-SA"): string {
  return new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Convert a Gregorian date to Hijri date
 */
export function getHijriDate(date: Date): HijriDate {
  // Use Intl.DateTimeFormat to get Hijri date
  const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const parts = hijriFormatter.formatToParts(date);
  const day = parseInt(parts.find((part) => part.type === "day")?.value || "1");
  const month = parseInt(
    parts.find((part) => part.type === "month")?.value || "1",
  );
  const year = parseInt(
    parts.find((part) => part.type === "year")?.value || "1445",
  );

  return { day, month, year };
}

/**
 * Get Islamic events for a specific Hijri date or within a date range
 */
export function getIslamicEvents(
  hijriDate: HijriDate,
  daysRange = 0,
): IslamicEvent[] {
  // For now, return empty array since islamicEvents is empty
  // This function would filter islamicEvents based on the hijriDate and range
  if (daysRange === 0) {
    return islamicEvents.filter(
      (event) =>
        event.hijriDate.day === hijriDate.day &&
        event.hijriDate.month === hijriDate.month &&
        event.hijriDate.year === hijriDate.year,
    );
  }

  // For range queries, we'd need more complex date math
  // For now, return empty array
  return [];
}
