import { useMemo } from "react";

interface IslamicEvent {
  name: string;
  arabicName: string;
  date: string;
  hijriDate: string;
  daysRemaining: number;
  type: "eid" | "blessed_night" | "special";
}

export function useIslamicCalendar() {
  const events = useMemo((): IslamicEvent[] => {
    // This would normally come from an API or database
    // For now, we'll calculate some upcoming events
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const events: IslamicEvent[] = [
      {
        name: "Laylat al-Qadr",
        arabicName: "ليلة القدر",
        date: `${currentYear}-04-15`, // Estimated
        hijriDate: "27 رمضان 1445",
        daysRemaining: 0,
        type: "blessed_night"
      },
      {
        name: "Eid al-Fitr",
        arabicName: "عيد الفطر",
        date: `${currentYear}-04-22`, // Estimated
        hijriDate: "1 شوال 1445",
        daysRemaining: 0,
        type: "eid"
      },
      {
        name: "Day of Arafah",
        arabicName: "يوم عرفة",
        date: `${currentYear}-06-28`, // Estimated
        hijriDate: "9 ذو الحجة 1445",
        daysRemaining: 0,
        type: "special"
      },
      {
        name: "Eid al-Adha",
        arabicName: "عيد الأضحى",
        date: `${currentYear}-06-29`, // Estimated
        hijriDate: "10 ذو الحجة 1445",
        daysRemaining: 0,
        type: "eid"
      }
    ];

    // Calculate days remaining for each event
    return events.map(event => {
      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...event,
        daysRemaining: diffDays
      };
    }).filter(event => event.daysRemaining >= 0);
  }, []);

  const nextEvent = events[0] || null;

  const getCurrentHijriDate = (): string => {
    // Simplified Hijri date calculation - in production, use proper library
    const hijriDay = new Date().getDate();
    const hijriMonths = [
      "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
      "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ];
    const currentMonth = hijriMonths[new Date().getMonth()];
    
    return `${hijriDay} ${currentMonth} 1445`;
  };

  return {
    events,
    nextEvent,
    getCurrentHijriDate,
  };
}
