import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import InstitutionalHeader from "@/components/Institution/InstitutionalHeader";
import InstitutionalFooter from "@/components/Institution/InstitutionalFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { islamicEvents, formatHijriDate } from "@/utils/islamicCalendar";
import { ISLAMIC_MONTHS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { t, language, isRTL } = useLanguage();
  const { setLastPage } = useProgress();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"month" | "events">("month");

  useEffect(() => {
    setLastPage("calendar");
  }, [setLastPage]);

  const months = ISLAMIC_MONTHS[language] || ISLAMIC_MONTHS.ar;
  const currentHijriDate = formatHijriDate(currentDate);

  const upcomingEvents = islamicEvents
    .filter((event: any) => {
      const eventDate = new Date(event.gregorianDate);
      return eventDate > currentDate;
    })
    .sort((a: any, b: any) => new Date(a.gregorianDate).getTime() - new Date(b.gregorianDate).getTime())
    .slice(0, 6);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "religious":
        return "bg-primary/10 text-primary border-primary/20";
      case "holiday":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "observance":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasEvent = islamicEvents.some((event: any) => {
        const eventDate = new Date(event.gregorianDate);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push(
        <div
          key={day}
          className={cn(
            "p-2 text-center cursor-pointer rounded-lg transition-colors",
            hasEvent
              ? "bg-primary/10 text-primary font-bold"
              : "hover:bg-accent text-foreground",
            date.toDateString() === new Date().toDateString() &&
              "bg-primary text-primary-foreground"
          )}
        >
          <span className="text-sm">{day}</span>
          {hasEvent && (
            <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
          )}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <InstitutionalHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className={cn("mb-8", isRTL ? "text-right" : "text-left")}>
          <h1 className="text-3xl md:text-4xl font-amiri font-bold text-foreground mb-4">
            {t("calendar.title")}
          </h1>
          <p className="text-lg text-muted-foreground font-inter">
            {t("calendar.description")}
          </p>
        </div>

        {/* Current Date Display */}
        <Card className="card-islamic mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-amiri font-bold text-foreground mb-2">
                  {t("calendar.today")}
                </h2>
                <div className="space-y-2">
                  <p className="text-xl text-muted-foreground font-inter">
                    {currentDate.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-lg text-primary font-amiri">
                    {currentHijriDate}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
                </div>
                <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant={selectedView === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedView("month")}
                  >
                    {t("calendar.monthView")}
                  </Button>
                  <Button
                    variant={selectedView === "events" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedView("events")}
                  >
                    {t("calendar.eventsView")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar/Events Display */}
          <div className="lg:col-span-2">
            {selectedView === "month" ? (
              <Card className="card-islamic">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-amiri">
                    <span>
                      {currentDate.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth("prev")}
                      >
                        <span className="material-symbols-outlined">
                          {isRTL ? "chevron_right" : "chevron_left"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth("next")}
                      >
                        <span className="material-symbols-outlined">
                          {isRTL ? "chevron_left" : "chevron_right"}
                        </span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {t(`calendar.${day}`)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-islamic">
                <CardHeader>
                  <CardTitle className="font-amiri">
                    {t("calendar.allEvents")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {islamicEvents.map((event: any) => (
                      <div key={event.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-amiri font-bold text-foreground mb-1">
                              {event.name.ar}
                            </h3>
                            <p className="text-sm text-muted-foreground font-inter mb-2">
                              {event.name.en}
                            </p>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                              <span className="material-symbols-outlined text-sm">event</span>
                              <span>{new Date(event.gregorianDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{event.hijriDate}</span>
                            </div>
                          </div>
                          <Badge className={getEventTypeColor(event.type)}>
                            {t(`calendar.${event.type}`)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground font-inter text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <Card className="card-islamic">
              <CardHeader>
                <CardTitle className="font-amiri flex items-center">
                  <span className="material-symbols-outlined text-primary mr-3 rtl:ml-3">upcoming</span>
                  {t("calendar.upcomingEvents")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event: any) => (
                      <div key={event.id} className="border-l-4 border-primary pl-4">
                        <h4 className="font-amiri font-bold text-foreground text-sm mb-1">
                          {event.name.ar}
                        </h4>
                        <p className="text-xs text-muted-foreground font-inter mb-2">
                          {event.name.en}
                        </p>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          <span>
                            {Math.ceil((new Date(event.gregorianDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} {t("calendar.daysLeft")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-muted-foreground text-3xl mb-2">event_busy</span>
                      <p className="text-muted-foreground font-inter text-sm">
                        {t("calendar.noUpcomingEvents")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="card-islamic">
              <CardHeader>
                <CardTitle className="font-amiri flex items-center">
                  <span className="material-symbols-outlined text-primary mr-3 rtl:ml-3">info</span>
                  {t("calendar.quickInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2">mosque</span>
                    <h4 className="font-amiri font-bold text-foreground mb-1">
                      {t("calendar.islamicYear")}
                    </h4>
                    <p className="text-sm text-muted-foreground font-inter">
                      1446 هـ
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-accent/30 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-lg mb-1">nights_stay</span>
                      <p className="text-xs font-amiri text-foreground">
                        {t("calendar.moonPhase")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-accent/30 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-lg mb-1">calendar_today</span>
                      <p className="text-xs font-amiri text-foreground">
                        {t("calendar.hijriCalendar")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
