import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  Moon,
  Star,
  Sunrise,
  Sunset,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

/** Real Hijri date from the runtime Islamic calendar — never hardcoded. */
function getHijriToday() {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const ar = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).formatToParts(new Date());
  const arGet = (type: string) => ar.find((p) => p.type === type)?.value ?? "";
  const day = Number(get("day")) || 1;
  const monthNum = Number(get("month")) || 0;
  const monthName = arGet("month");
  return {
    day,
    month: monthName,
    monthNum,
    year: arGet("year"),
    dayName: arGet("weekday"),
    // The Prophetic birthday is observed on 12 Rabi' al-Awwal (month 3).
    occasion: monthNum === 3 && day === 12 ? "المولد النبوي الشريف" : null,
  };
}

export default function IslamicCalendarPage() {
  const { t, isRTL } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Real Hijri date + Ramadan derivation. Prayer times come from the live
  // AlAdhan-backed hook below; nothing here is hardcoded.
  const islamicDate = getHijriToday();
  const {
    prayerTimes: livePrayerTimes,
    nextPrayer,
    timeRemaining,
    isLoading: prayerLoading,
    error: prayerError,
  } = usePrayerTimes();

  const ramadanData =
    islamicDate.monthNum === 9
      ? {
          isRamadan: true,
          dayOfRamadan: islamicDate.day,
          suhoorTime: livePrayerTimes.find((p) => p.name === "fajr")?.time ?? "—",
          iftarTime: livePrayerTimes.find((p) => p.name === "maghrib")?.time ?? "—",
          daysLeft: 30 - islamicDate.day,
        }
      : { isRamadan: false, dayOfRamadan: 0, suhoorTime: "—", iftarTime: "—", daysLeft: 0 };

  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatCurrentDate = () => {
    return new Date().toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white">
      {/* Background Mosque Silhouette */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <path
            d="M50 250 L50 200 Q50 180 70 180 L90 180 L90 150 Q90 130 110 130 L130 130 L130 100 Q130 80 150 80 L250 80 Q270 80 270 100 L270 130 L290 130 Q310 130 310 150 L310 180 L330 180 Q350 180 350 200 L350 250 Z"
            fill="currentColor"
          />
          <circle cx="200" cy="60" r="20" fill="currentColor" />
          <path
            d="M180 60 Q190 40 200 60 Q210 40 220 60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold font-amiri">التقويم الإسلامي</h1>
            <p className="text-sm opacity-75 font-inter">Islamic Calendar</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>

        {/* Current Time */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold font-mono mb-2">
            {formatCurrentTime()}
          </div>
          <div className="text-sm opacity-75 font-amiri">
            {formatCurrentDate()}
          </div>
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mt-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>الرياض، السعودية</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 space-y-6">
        {/* Islamic Date Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-4">
              <Moon className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-3xl font-bold font-amiri">
                  {islamicDate.day} {islamicDate.month} {islamicDate.year}
                </div>
                <div className="text-sm opacity-75">{islamicDate.dayName}</div>
              </div>
            </div>
            {islamicDate.occasion && (
              <Badge className="bg-amber-500 text-amber-900 mt-2">
                {islamicDate.occasion}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Ramadan Card (if in Ramadan) */}
        {ramadanData.isRamadan && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-300/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-amiri flex items-center space-x-2 rtl:space-x-reverse">
                <Star className="w-6 h-6 text-amber-400" />
                <span>رمضان المبارك</span>
                <Badge className="bg-amber-500 text-amber-900">
                  اليوم {ramadanData.dayOfRamadan}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold font-mono">
                    {ramadanData.suhoorTime}
                  </div>
                  <div className="text-xs opacity-75 font-amiri">السحور</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono">
                    {ramadanData.iftarTime}
                  </div>
                  <div className="text-xs opacity-75 font-amiri">الإفطار</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono">
                    {ramadanData.daysLeft}
                  </div>
                  <div className="text-xs opacity-75 font-amiri">يوم باقي</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prayer Times */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-amiri flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-5 h-5" />
              <span>أوقات الصلاة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prayerLoading ? (
              <p className="text-sm font-amiri text-white/80 text-center py-4">
                جارٍ جلب المواقيت من خدمة الأذان حسب موقعك...
              </p>
            ) : prayerError || livePrayerTimes.length === 0 ? (
              <p className="text-sm font-amiri text-white/80 text-center py-4">
                تعذر جلب المواقيت (الموقع أو الشبكة). اسمح بالوصول للموقع ثم أعد المحاولة.
              </p>
            ) : (
              livePrayerTimes.map((prayer) => {
                const isNext = prayer.name === nextPrayer;
                return (
                  <div
                    key={prayer.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all",
                      isNext
                        ? "bg-emerald-400/20 border-l-4 border-emerald-400"
                        : "hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div>
                        <div
                          className={cn(
                            "font-amiri font-medium",
                            isNext ? "text-emerald-300" : "text-white",
                          )}
                        >
                          {prayer.arabicName}
                        </div>
                        {isNext && timeRemaining && (
                          <div className="text-xs text-emerald-400">
                            التالية — متبقٍ {timeRemaining}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-mono text-lg",
                        isNext
                          ? "text-emerald-300 font-bold"
                          : "text-gray-300",
                      )}
                    >
                      {prayer.time}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Monthly Calendar */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <CardTitle className="text-lg font-amiri">
                {currentMonth.toLocaleDateString("ar-SA", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="text-white hover:bg-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {[
                "الأحد",
                "الاثنين",
                "الثلاثاء",
                "الأربعاء",
                "الخميس",
                "الجمعة",
                "السبت",
              ].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-amiri opacity-75 p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "h-10 w-full text-sm font-mono",
                    day === null ? "invisible" : "",
                    day === new Date().getDate() &&
                      currentMonth.getMonth() === new Date().getMonth() &&
                      currentMonth.getFullYear() === new Date().getFullYear()
                      ? "bg-emerald-400 text-emerald-900 hover:bg-emerald-500"
                      : "text-white hover:bg-white/10",
                    day === 15 && "bg-amber-400/30 text-amber-200", // Special Islamic occasion
                  )}
                  onClick={() =>
                    day &&
                    setSelectedDate(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day,
                      ),
                    )
                  }
                >
                  {day}
                </Button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4 rtl:space-x-reverse text-xs">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span>اليوم</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span>مناسبة إسلامية</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-300/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-amiri flex items-center space-x-2 rtl:space-x-reverse">
              <CalendarIcon className="w-5 h-5" />
              <span>أهداف اليوم</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-amiri">صلاة الفجر في جماعة</span>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-amiri">قراءة جزء من القرآن</span>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
              <span className="text-sm font-amiri opacity-75">
                أذكار المساء
              </span>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
              <span className="text-sm font-amiri opacity-75">
                صلاة النوافل
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
