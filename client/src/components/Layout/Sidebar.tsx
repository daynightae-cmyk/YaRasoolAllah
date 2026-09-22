import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Users,
  Baby,
  UserCheck,
  Brain,
  Zap,
  Crown,
  Star,
  Headphones,
  Library,
  Home,
  Calendar,
  Bell,
  Building2,
  Heart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { t, isRTL } = useLanguage();
  const [location] = useLocation();

  const mainItems = [
    {
      href: "/home",
      label: "الصفحة الرئيسية",
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: "/",
      label: "المُفتي المُبين",
      icon: <Brain className="w-5 h-5" />,
      badge: "مجاني",
    },
    {
      href: "/quran",
      label: "القرآن الكريم",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      href: "/daily-verse",
      label: "الآية اليومية العالمية",
      icon: <Crown className="w-5 h-5" />,
      badge: "ذهبي",
    },
    {
      href: "/bab-alsamaa-settings",
      label: "باب السماء المفتوح",
      icon: <Zap className="w-5 h-5" />,
      badge: "خارق",
    },
  ];

  const adultItems = [
    {
      href: "/quran-audio",
      label: "القرآن الصوتي",
      icon: <Headphones className="w-5 h-5" />,
      badge: "جديد",
    },
    {
      href: "/seerah",
      label: "السيرة النبوية",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      href: "/islamic-ai-management",
      label: "الذكاء الإسلامي",
      icon: <Brain className="w-5 h-5" />,
      badge: "مجاني",
    },
    {
      href: "/digital-library",
      label: "المكتبة الرقمية",
      icon: <Library className="w-5 h-5" />,
    },
    {
      href: "/five-pillars",
      label: "أركان الإسلام",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      href: "/islamic-knowledge",
      label: "المعرفة الإسلامية",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      href: "/calendar",
      label: "التقويم الإسلامي",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const womenItems = [
    {
      href: "/women-in-islam",
      label: "المرأة في الإسلام",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      href: "/prayer-guide",
      label: "صلاة المرأة",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      href: "/daily-reminders",
      label: "تذكيرات نسائية",
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  const childrenItems = [
    {
      href: "/children-tv",
      label: "الطفل المبين",
      icon: <Baby className="w-5 h-5" />,
      badge: "جديد",
    },
    {
      href: "/kids",
      label: "سيرة للأطفال",
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  const renderNavItem = (item: any) => (
    <Link key={item.href} href={item.href}>
      <a
        className={cn(
          "flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:scale-105 group",
          location === item.href
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
        )}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div
            className={cn(
              "transition-colors",
              location === item.href
                ? "text-white"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            {item.icon}
          </div>
          <span className="font-inter text-sm font-medium">{item.label}</span>
        </div>
        {item.badge && (
          <Badge className="bg-amber-500 text-white border-0 px-2 py-1 text-xs animate-pulse">
            {item.badge}
          </Badge>
        )}
      </a>
    </Link>
  );

  return (
    <div className="w-80 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-l border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-amiri font-bold text-gray-900 dark:text-white">
              التنقل السريع
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
              اختر حسب الفئة المناسبة
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Main Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-amiri mb-3 px-3">
              الأقسام الرئيسية
            </h3>
            <div className="space-y-1">{mainItems.map(renderNavItem)}</div>
          </div>

          <Separator />

          {/* For Adults */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-amiri mb-3 px-3 flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-4 h-4" />
              <span>للبالغين</span>
              <Badge variant="outline" className="text-xs">
                {adultItems.length}
              </Badge>
            </h3>
            <div className="space-y-1">{adultItems.map(renderNavItem)}</div>
          </div>

          <Separator />

          {/* For Women */}
          <div>
            <h3 className="text-sm font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider font-amiri mb-3 px-3 flex items-center space-x-2 rtl:space-x-reverse">
              <UserCheck className="w-4 h-4" />
              <span>للنساء</span>
              <Badge variant="outline" className="text-xs">
                {womenItems.length}
              </Badge>
            </h3>
            <div className="space-y-1">{womenItems.map(renderNavItem)}</div>
          </div>

          <Separator />

          {/* For Children */}
          <div>
            <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-amiri mb-3 px-3 flex items-center space-x-2 rtl:space-x-reverse">
              <Baby className="w-4 h-4" />
              <span>للأطفال</span>
              <Badge variant="outline" className="text-xs">
                {childrenItems.length}
              </Badge>
            </h3>
            <div className="space-y-1">{childrenItems.map(renderNavItem)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <Separator className="my-6" />

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="p-4">
            <CardTitle className="text-base font-amiri text-purple-700 dark:text-purple-300 flex items-center space-x-2 rtl:space-x-reverse">
              <Zap className="w-5 h-5" />
              <span>إجراءات سريعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Link href="/bab-alsamaa-settings">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-amiri text-sm py-2 rounded-lg">
                <Heart className="w-4 h-4 ml-2 rtl:mr-2" />
                تحدث مع باب السماء
              </Button>
            </Link>
            <Link href="/daily-verse">
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-amiri text-sm py-2 rounded-lg"
              >
                <Crown className="w-4 h-4 ml-2 rtl:mr-2" />
                آية اليوم
              </Button>
            </Link>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}
