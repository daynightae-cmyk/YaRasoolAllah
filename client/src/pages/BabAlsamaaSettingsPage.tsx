import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  useBabAlsamaa,
  useBabAlsamaaAnalytics,
  useEmotionalDetection,
} from "@/hooks/useBabAlsamaa";
import { useSpiritualNotifications } from "@/services/spiritualNotifications";
import { cn } from "@/lib/utils";

export default function BabAlsamaaSettingsPage() {
  const { t, isRTL } = useLanguage();
  const { updateLastVisited } = useProgress();
  const {
    isNotificationsEnabled,
    enableNotifications,
    disableNotifications,
    openBab,
  } = useBabAlsamaa();

  const {
    settings,
    updateSettings,
    testNotification,
    getHistory,
    clearHistory,
  } = useSpiritualNotifications();

  const {
    totalOpens,
    autoOpens,
    manualOpens,
    notificationOpens,
    lastOpened,
    getHistory: getBabHistory,
    clearHistory: clearBabHistory,
  } = useBabAlsamaaAnalytics();

  const { getMoodAnalytics } = useEmotionalDetection();

  const [activeTab, setActiveTab] = useState("notifications");
  const [customQuietStart, setCustomQuietStart] = useState(
    settings.quietHours.start,
  );
  const [customQuietEnd, setCustomQuietEnd] = useState(settings.quietHours.end);

  useEffect(() => {
    updateLastVisited("/bab-alsamaa-settings");
  }, [updateLastVisited]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enableNotifications();
      if (!success) {
        // عرض رسالة خطأ
        alert("لا يمكن تفعيل الإشعارات. تأكد من السماح للإشعارات في المتصفح.");
      }
    } else {
      disableNotifications();
    }
  };

  const handleQuietHoursUpdate = () => {
    updateSettings({
      quietHours: {
        start: customQuietStart,
        end: customQuietEnd,
      },
    });
  };

  const getMoodDistribution = () => {
    const analytics = getMoodAnalytics();
    const total = Object.values(analytics.last7Days).reduce(
      (sum: number, count) => sum + (count as number),
      0,
    );

    return Object.entries(analytics.last7Days).map(([mood, count]) => ({
      mood,
      count: count as number,
      percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
    }));
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      fear: "😰",
      anger: "😠",
      confused: "🤔",
      hopeful: "🙏",
      neutral: "😐",
    };
    return emojis[mood] || "😐";
  };

  const getMoodLabel = (mood: string) => {
    const labels: Record<string, string> = {
      happy: "سعيد",
      sad: "حزين",
      fear: "خائف",
      anger: "غاضب",
      confused: "محتار",
      hopeful: "متفائل",
      neutral: "عادي",
    };
    return labels[mood] || mood;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* خلفية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* الهيدر */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">
                  settings
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  إعدادات باب السماء
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-inter mt-2">
                  تخصيص تجربتك الروحانية الشخصية
                </p>
              </div>
            </motion.div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalOpens}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      إجمالي الزيارات
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {autoOpens}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      إشعارات تلقائية
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {manualOpens}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      زيارات يدوية
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                      {lastOpened ? "✅" : "❌"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {lastOpened ? "نشط" : "غير نشط"}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* التبويبات الرئيسية */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="notifications" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  notifications
                </span>
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  analytics
                </span>
                الإحصائيات
              </TabsTrigger>
              <TabsTrigger value="mood" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  psychology
                </span>
                المزاج
              </TabsTrigger>
              <TabsTrigger value="advanced" className="font-amiri">
                <span className="material-symbols-outlined mr-2">tune</span>
                متقدم
              </TabsTrigger>
            </TabsList>

            {/* تبويب الإشعارات */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* الإعدادات الأساسية */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">
                        notifications_active
                      </span>
                      إعدادات الإشعارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* تفعيل الإشعارات */}
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <h4 className="font-amiri font-semibold text-purple-700 dark:text-purple-400">
                          تفعيل الإشعارات الروحانية
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-500">
                          اسمح لباب السماء بمناداتك في أوقات مناسبة
                        </p>
                      </div>
                      <Switch
                        checked={isNotificationsEnabled}
                        onCheckedChange={handleNotificationToggle}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    {/* تكرار الإشعارات */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        تكرار الإشعارات
                      </label>
                      <Select
                        value={settings.frequency}
                        onValueChange={(value: any) =>
                          updateSettings({ frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">
                            أقل ما يمكن (كل 3 ساعات)
                          </SelectItem>
                          <SelectItem value="moderate">
                            متوسط (كل ساعتين)
                          </SelectItem>
                          <SelectItem value="frequent">
                            كثير (كل ساعة)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ساعات الهدوء */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ساعات الهدوء
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">من</label>
                          <Input
                            type="time"
                            value={customQuietStart}
                            onChange={(e) =>
                              setCustomQuietStart(e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">إلى</label>
                          <Input
                            type="time"
                            value={customQuietEnd}
                            onChange={(e) => setCustomQuietEnd(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleQuietHoursUpdate}
                        className="w-full"
                      >
                        حفظ ساعات الهدوء
                      </Button>
                    </div>

                    {/* أنواع الإشعارات */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        أنواع الإشعارات المفعلة
                      </label>
                      <div className="space-y-2">
                        {[
                          {
                            key: "motivation",
                            label: "💪 تحفيزية",
                            color: "emerald",
                          },
                          {
                            key: "reminder",
                            label: "⏰ تذكيرية",
                            color: "blue",
                          },
                          { key: "comfort", label: "🤗 مواساة", color: "rose" },
                          {
                            key: "gratitude",
                            label: "🙏 شكر وامتنان",
                            color: "amber",
                          },
                          { key: "night", label: "🌙 ليلية", color: "indigo" },
                        ].map((type) => (
                          <div
                            key={type.key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{type.label}</span>
                            <Switch
                              checked={settings.enabledTypes.includes(type.key)}
                              onCheckedChange={(checked) => {
                                const types = checked
                                  ? [...settings.enabledTypes, type.key]
                                  : settings.enabledTypes.filter(
                                      (t) => t !== type.key,
                                    );
                                updateSettings({ enabledTypes: types });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* الإعدادات المتقدمة */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">
                        psychology
                      </span>
                      الذكاء العاطفي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">الوضع العشوائي</p>
                          <p className="text-xs text-gray-500">
                            إشعارات مفاجئة في أوقات عشوائية
                          </p>
                        </div>
                        <Switch
                          checked={settings.randomMode}
                          onCheckedChange={(checked) =>
                            updateSettings({ randomMode: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            كشف الحالة العاطفية
                          </p>
                          <p className="text-xs text-gray-500">
                            تحليل نشاطك لإرسال إشعارات مناسبة
                          </p>
                        </div>
                        <Switch
                          checked={settings.emotionalDetection}
                          onCheckedChange={(checked) =>
                            updateSettings({ emotionalDetection: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">الوضع الليلي</p>
                          <p className="text-xs text-gray-500">
                            إشعارات خاصة بالليل بعد 12
                          </p>
                        </div>
                        <Switch
                          checked={settings.nightMode}
                          onCheckedChange={(checked) =>
                            updateSettings({ nightMode: checked })
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* اختبار الإشعارات */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">اختبار النظام</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={testNotification}
                          className="text-purple-600 border-purple-300"
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">
                            science
                          </span>
                          اختبار إشعار
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBab("manual")}
                          className="text-emerald-600 border-emerald-300"
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">
                            door_open
                          </span>
                          فتح الباب
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* تبويب الإحصائيات */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* إحصائيات الاستخدام */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        trending_up
                      </span>
                      إحصائيات الاستخدام
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {totalOpens}
                        </div>
                        <div className="text-sm text-emerald-700 dark:text-emerald-400">
                          إجمالي الزيارات
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {autoOpens}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-400">
                          إشعارات تلقائية
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">الزيارات اليدوية</span>
                        <Badge variant="outline">{manualOpens}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">عبر الإشعارات</span>
                        <Badge variant="outline">{notificationOpens}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">آخر زيارة</span>
                        <Badge variant="outline">
                          {lastOpened
                            ? lastOpened.toLocaleDateString("ar-SA")
                            : "لم تزر بعد"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">تاريخ الاستخدام</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {getBabHistory()
                          .slice(0, 10)
                          .map((entry: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <span className="truncate flex-1 ml-2">
                                {entry.message}
                              </span>
                              <span className="text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString(
                                  "ar-SA",
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* إحصائيات الإشعارات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">
                        notifications
                      </span>
                      تاريخ الإشعارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {getHistory()
                        .slice(0, 15)
                        .map((notification: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {notification.icon === "auto_awesome"
                                  ? "✨"
                                  : "🔔"}
                              </span>
                              <span className="font-semibold text-sm">
                                {notification.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex justify-between items-center">
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  notification.timestamp,
                                ).toLocaleDateString("ar-SA")}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearHistory}
                      className="w-full"
                    >
                      <span className="material-symbols-outlined mr-2">
                        delete
                      </span>
                      مسح تاريخ الإشعارات
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* تبويب المزاج */}
            <TabsContent value="mood" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* تحليل المزاج */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600">
                        favorite
                      </span>
                      تحليل حالتك العاطفية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">
                        توزيع المشاعر - آخر 7 أيام
                      </h4>
                      <div className="space-y-2">
                        {getMoodDistribution().map((item) => (
                          <div
                            key={item.mood}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getMoodEmoji(item.mood)}
                              </span>
                              <span className="text-sm">
                                {getMoodLabel(item.mood)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-rose-400 to-purple-500 transition-all duration-500"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">
                                {item.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-rose-50 dark:from-purple-900/20 dark:to-rose-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                        مزاجك السائد
                      </h4>
                      <div className="text-3xl mb-2">
                        {getMoodEmoji(getMoodAnalytics().dominantMood)}
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-500">
                        {getMoodLabel(getMoodAnalytics().dominantMood)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* نصائح وتوصيات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        lightbulb
                      </span>
                      نصائح شخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {getMoodAnalytics().dominantMood === "sad" && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            💙 نصائح للحزن
                          </h5>
                          <ul className="text-sm text-blue-600 dark:text-blue-500 space-y-1">
                            <li>• أكثر من الاستغفار والذكر</li>
                            <li>• اقرأ سورة الضحى</li>
                            <li>• تذكر أن الله معك</li>
                          </ul>
                        </div>
                      )}

                      {getMoodAnalytics().dominantMood === "happy" && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <h5 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                            💚 نصائح للسعادة
                          </h5>
                          <ul className="text-sm text-emerald-600 dark:text-emerald-500 space-y-1">
                            <li>• احمد الله على نعمه</li>
                            <li>• شارك السعادة مع الآخرين</li>
                            <li>• ادع لمن تحب</li>
                          </ul>
                        </div>
                      )}

                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h5 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                          🔮 توصية ذكية
                        </h5>
                        <p className="text-sm text-purple-600 dark:text-purple-500">
                          بناءً على حالتك العاطفية، ننصحك بزيارة باب السماء
                          {getMoodAnalytics().dominantMood === "sad"
                            ? " للحصول على دعاء مواساة"
                            : getMoodAnalytics().dominantMood === "happy"
                              ? " لشكر الله على نعمه"
                              : " للحصول على دعاء مناسب لحالتك"}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => openBab("manual")}
                      className="w-full bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600"
                    >
                      <span className="material-symbols-outlined mr-2">
                        door_open
                      </span>
                      ادخل باب السماء الآن
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* تبويب الإعدادات المتقدمة */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">
                      settings
                    </span>
                    إعدادات متقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* استيراد وتصدير */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">النسخ الاحتياطي</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const data = {
                              settings,
                              history: getBabHistory(),
                              moodHistory: getMoodAnalytics(),
                            };
                            const blob = new Blob(
                              [JSON.stringify(data, null, 2)],
                              { type: "application/json" },
                            );
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "bab-alsamaa-backup.json";
                            a.click();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2">
                            download
                          </span>
                          تصدير البيانات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".json";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  try {
                                    const data = JSON.parse(
                                      e.target?.result as string,
                                    );
                                    if (data.settings)
                                      updateSettings(data.settings);
                                    alert("تم استيراد البيانات بنجاح");
                                  } catch {
                                    alert("خطأ في ملف البيانات");
                                  }
                                };
                                reader.readAsText(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2">
                            upload
                          </span>
                          استيراد البيانات
                        </Button>
                      </div>
                    </div>

                    {/* إعادة التعيين */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600">
                        إعادة التعيين
                      </h4>
                      <div className="space-y-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
                              clearBabHistory();
                              clearHistory();
                              localStorage.removeItem("user-mood-history");
                              alert("تم مسح جميع البيانات");
                            }
                          }}
                        >
                          <span className="material-symbols-outlined mr-2">
                            delete_forever
                          </span>
                          مسح جميع البيانات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-300 text-red-600"
                          onClick={() => {
                            updateSettings({
                              enabled: true,
                              frequency: "moderate",
                              quietHours: { start: "23:00", end: "06:00" },
                              enabledTypes: [
                                "motivation",
                                "reminder",
                                "comfort",
                              ],
                              randomMode: true,
                              emotionalDetection: true,
                              nightMode: true,
                            });
                            alert("تم إعادة تعيين الإعدادات للوضع الافتراضي");
                          }}
                        >
                          <span className="material-symbols-outlined mr-2">
                            restart_alt
                          </span>
                          إعادة تعيين الإعدادات
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
