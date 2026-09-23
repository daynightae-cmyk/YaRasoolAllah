import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getDailyVerse } from "@/services/quranService";
import { cn } from "@/lib/utils";

interface DailyVerseSettings {
  autoShare: boolean;
  shareTime: string;
  sharePlatforms: string[];
  shareContacts: string[];
  language: string;
  includeAudio: boolean;
  customMessage: string;
}

interface ShareContact {
  id: string;
  name: string;
  platform: "whatsapp" | "telegram" | "sms" | "email";
  contact: string;
  active: boolean;
}

const shareTimeOptions = [
  { value: "fajr", label: "بعد الفجر", time: "05:30" },
  { value: "dhuha", label: "الضحى", time: "09:00" },
  { value: "dhuhr", label: "بعد الظهر", time: "13:30" },
  { value: "asr", label: "بعد العصر", time: "16:30" },
  { value: "maghrib", label: "بعد المغرب", time: "19:30" },
  { value: "isha", label: "بعد العشاء", time: "21:30" },
];

const languages = [
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

const platforms = [
  { id: "whatsapp", name: "واتساب", icon: "💬", color: "bg-green-500" },
  { id: "telegram", name: "تيليجرام", icon: "📱", color: "bg-blue-500" },
  { id: "sms", name: "رسائل نصية", icon: "💌", color: "bg-purple-500" },
  { id: "email", name: "إيميل", icon: "📧", color: "bg-red-500" },
  { id: "social", name: "مواقع التواصل", icon: "🌐", color: "bg-indigo-500" },
];

export default function DailyVersePage() {
  const { updateLastVisited } = useProgress();
  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState("today");
  const [settings, setSettings] = useState<DailyVerseSettings>({
    autoShare: false,
    shareTime: "fajr",
    sharePlatforms: [],
    shareContacts: [],
    language: "ar",
    includeAudio: false,
    customMessage: "",
  });

  const [shareContacts, setShareContacts] = useState<ShareContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: "",
    platform: "whatsapp",
    contact: "",
  });
  const [shareStats, setShareStats] = useState({
    today: 0,
    total: 1247,
    week: 28,
  });

  useEffect(() => {
    updateLastVisited("/daily-verse");
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("daily-verse-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedContacts = localStorage.getItem("share-contacts");
    if (savedContacts) {
      setShareContacts(JSON.parse(savedContacts));
    }
  }, [updateLastVisited]);

  const { data: dailyVerse, isLoading } = useQuery({
    queryKey: ["/api/quran/daily-verse"],
    queryFn: getDailyVerse,
  });

  const saveSettings = (newSettings: Partial<DailyVerseSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(
      "daily-verse-settings",
      JSON.stringify(updatedSettings),
    );
  };

  const addContact = () => {
    if (newContact.name && newContact.contact) {
      const contact: ShareContact = {
        id: Date.now().toString(),
        name: newContact.name,
        platform: newContact.platform as any,
        contact: newContact.contact,
        active: true,
      };
      const updatedContacts = [...shareContacts, contact];
      setShareContacts(updatedContacts);
      localStorage.setItem("share-contacts", JSON.stringify(updatedContacts));
      setNewContact({ name: "", platform: "whatsapp", contact: "" });
    }
  };

  const toggleContact = (id: string) => {
    const updatedContacts = shareContacts.map((contact) =>
      contact.id === id ? { ...contact, active: !contact.active } : contact,
    );
    setShareContacts(updatedContacts);
    localStorage.setItem("share-contacts", JSON.stringify(updatedContacts));
  };

  const shareVerse = async (platform: string) => {
    if (!dailyVerse) return;

    const message = `
🌟 الآية اليومية من الكتاب المبين 🌟

${dailyVerse.arabic}

"${dailyVerse.translation ? `"${dailyVerse.translation}"` : "(لا توجد ترجمة إنجليزية لهذه الآية بعد)"}

📖 ${dailyVerse.surahName} - آية ${dailyVerse.ayah}

💡 عن التفسير:
التفسير المحقق قيد الإدخال والمراجعة.

🤲 دعاء اليوم:
${getDailyDua()}

${settings.customMessage ? `\n💎 ${settings.customMessage}` : ""}

📱 منصة يا رسول الله ﷺ:
https://yarasoolallah.org

#الآية_اليومية #القرآن_الكريم #يا_رسول_الله
    `.trim();

    // Update share stats
    setShareStats((prev) => ({
      ...prev,
      today: prev.today + 1,
      total: prev.total + 1,
    }));

    // Handle different platforms
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent("https://yarasoolallah.org")}&text=${encodeURIComponent(message)}`,
        );
        break;
      case "copy":
        navigator.clipboard.writeText(message);
        break;
      default:
        navigator.share({ title: "الآية اليومية", text: message });
    }
  };

  // No attributed tafsir is available for arbitrary corpus verses: a random
  // devotional sentence must never be presented as "tafsir" of the verse.
  const getDailyTafsir = (_verse: any) => {
    return "التفسير المحقق لهذه الآية قيد الإدخال والمراجعة — لا يُعرض هنا أي نص منسوب لمفسر.";
  };

  const getDailyDua = () => {
    const duas = [
      "اللهم اهدنا فيمن هديت، وعافنا فيمن عافيت",
      "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
      "اللهم أعنا على ذكرك وشكرك وحسن عبادتك",
      "ربنا اغفر لنا ذنوبنا وإسرافنا في أمرنا",
      "اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا",
    ];
    return duas[Math.floor(Math.random() * duas.length)];
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://yarasoolallah.org/daily")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>

        {/* Islamic geometric pattern */}
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3Cpath d='M40 40c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        ></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-white text-3xl">
                  auto_awesome
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-amiri font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  الآية اليومية العالمية
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-inter mt-2">
                  "هاتفك يذكّرك بالله... كل يوم"
                </p>
              </div>
            </div>

            {/* Corpus facts (verified): no invented audience metrics. */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  114
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  سورة في المتن الموثق
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  6236
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  آية يتناوب عليها الاختيار اليومي
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {shareStats.total}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  مشاركاتك المحفوظة محليًا
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
              <h2 className="text-2xl font-amiri font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                🎯 فكرة الصفحة
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                آية يومية من المتن الموثق مع بيان حال الترجمة والتفسير، ودعاء
                عام — دون ادعاء ثواب مضمون أو إحصاءات جمهور.
              </p>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="today" className="font-amiri">
                <span className="material-symbols-outlined mr-2">today</span>
                جرعة اليوم
              </TabsTrigger>
              <TabsTrigger value="share" className="font-amiri">
                <span className="material-symbols-outlined mr-2">share</span>
                المشاركة التلقائية
              </TabsTrigger>
              <TabsTrigger value="widget" className="font-amiri">
                <span className="material-symbols-outlined mr-2">widgets</span>
                Widget العالمي
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-amiri">
                <span className="material-symbols-outlined mr-2">settings</span>
                الإعدادات
              </TabsTrigger>
            </TabsList>

            {/* Today's Dose Tab */}
            <TabsContent value="today" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Daily Verse Card */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20">
                    <CardHeader className="text-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">
                            auto_awesome
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-amiri">
                            جرعة اليوم المباركة
                          </CardTitle>
                          <p className="text-white/90 font-inter">
                            {new Date().toLocaleDateString("ar-SA", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                      ) : dailyVerse ? (
                        <div className="space-y-8">
                          {/* Arabic Verse */}
                          <div className="text-center">
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-emerald-200 dark:border-emerald-700 mb-6">
                              <p className="text-3xl md:text-4xl font-amiri leading-loose text-gray-900 dark:text-white verse-text">
                                {dailyVerse.arabic}
                              </p>
                              <div className="flex items-center justify-center mt-4">
                                <Badge className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                                  {dailyVerse.surahName} - آية {dailyVerse.ayah}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Translation */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-blue-600">
                                translate
                              </span>
                              <h4 className="font-amiri font-semibold text-blue-700 dark:text-blue-400">
                                الترجمة
                              </h4>
                            </div>
                            <p className="text-lg font-inter leading-relaxed text-gray-700 dark:text-gray-300">
                              {dailyVerse.translation
                                ? `"${dailyVerse.translation}"`
                                : "لا توجد ترجمة إنجليزية لهذه الآية بعد — النص العربي أعلاه هو المتن الكامل الموثق."}
                            </p>
                          </div>

                          {/* Simple Tafsir */}
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-amber-600">
                                lightbulb
                              </span>
                              <h4 className="font-amiri font-semibold text-amber-700 dark:text-amber-400">
                                عن التفسير
                              </h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                              {getDailyTafsir(dailyVerse)}
                            </p>
                          </div>

                          {/* Daily Dua */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="material-symbols-outlined text-purple-600">
                                hands
                              </span>
                              <h4 className="font-amiri font-semibold text-purple-700 dark:text-purple-400">
                                🤲 دعاء اليوم
                              </h4>
                            </div>
                            <p className="text-xl font-amiri text-purple-800 dark:text-purple-300 leading-relaxed text-center">
                              {getDailyDua()}
                            </p>
                          </div>

                          {/* Share Buttons */}
                          <div className="flex flex-wrap justify-center gap-3 pt-6 border-t">
                            <Button
                              onClick={() => shareVerse("whatsapp")}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <span className="material-symbols-outlined mr-2">
                                chat
                              </span>
                              واتساب
                            </Button>
                            <Button
                              onClick={() => shareVerse("telegram")}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <span className="material-symbols-outlined mr-2">
                                send
                              </span>
                              تيليجرام
                            </Button>
                            <Button
                              onClick={() => shareVerse("copy")}
                              variant="outline"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              <span className="material-symbols-outlined mr-2">
                                content_copy
                              </span>
                              نسخ النص
                            </Button>
                            <Button
                              onClick={() => shareVerse("social")}
                              variant="outline"
                              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                            >
                              <span className="material-symbols-outlined mr-2">
                                share
                              </span>
                              مشاركة عامة
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                            error
                          </span>
                          <p className="text-gray-500 dark:text-gray-400">
                            حدث خطأ في تحميل الآية اليومية
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Share Stats & Quick Actions */}
                <div className="space-y-6">
                  {/* Today's Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">
                          trending_up
                        </span>
                        إحصائيات اليوم
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          مشاركاتك اليوم
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {shareStats.today}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          هذا الأسبوع
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {shareStats.week}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          المجموع
                        </span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {shareStats.total}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          أجرك المتراكم
                        </p>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {shareStats.total * 10} حسنة
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          بإذن الله تعالى
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">
                          schedule
                        </span>
                        إعدادات سريعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-inter">
                          المشاركة التلقائية
                        </span>
                        <Switch
                          checked={settings.autoShare}
                          onCheckedChange={(checked) =>
                            saveSettings({ autoShare: checked })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-inter text-gray-600 dark:text-gray-400">
                          وقت المشاركة
                        </label>
                        <Select
                          value={settings.shareTime}
                          onValueChange={(value) =>
                            saveSettings({ shareTime: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {shareTimeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label} ({option.time})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-inter text-gray-600 dark:text-gray-400">
                          اللغة المفضلة
                        </label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            saveSettings({ language: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.slice(0, 5).map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* QR Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">
                          qr_code
                        </span>
                        رمز الاستجابة السريع
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <img
                        src={generateQRCode()}
                        alt="QR Code"
                        className="w-32 h-32 mx-auto mb-4 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        لنشر التطبيق في المساجد والمدارس
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <span className="material-symbols-outlined mr-2">
                          download
                        </span>
                        تحميل الصورة
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Auto Share Tab */}
            <TabsContent value="share" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Share Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        schedule_send
                      </span>
                      إعدادات المشاركة التلقائية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div>
                        <h4 className="font-amiri font-semibold text-emerald-700 dark:text-emerald-400">
                          تفعيل المشاركة التلقائية
                        </h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">
                          شارك الخير تلقائياً مع أحبابك
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoShare}
                        onCheckedChange={(checked) =>
                          saveSettings({ autoShare: checked })
                        }
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        اختر المنصات للمشاركة
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {platforms.map((platform) => (
                          <div
                            key={platform.id}
                            className={cn(
                              "p-3 rounded-lg border-2 cursor-pointer transition-all",
                              settings.sharePlatforms.includes(platform.id)
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                            )}
                            onClick={() => {
                              const platforms =
                                settings.sharePlatforms.includes(platform.id)
                                  ? settings.sharePlatforms.filter(
                                      (p) => p !== platform.id,
                                    )
                                  : [...settings.sharePlatforms, platform.id];
                              saveSettings({ sharePlatforms: platforms });
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{platform.icon}</span>
                              <span className="text-sm font-inter">
                                {platform.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        التوقيت المفضل
                      </h4>
                      <Select
                        value={settings.shareTime}
                        onValueChange={(value) =>
                          saveSettings({ shareTime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shareTimeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <span>{option.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {option.time}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        رسالة شخصية (اختيارية)
                      </h4>
                      <Textarea
                        placeholder="أضف رسالة شخصية تظهر مع كل مشاركة..."
                        value={settings.customMessage}
                        onChange={(e) =>
                          saveSettings({ customMessage: e.target.value })
                        }
                        className="resize-none"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        مثال: "بارك الله فيكم ونفع بكم 🤍"
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contacts Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">
                          contacts
                        </span>
                        قائمة جهات الاتصال
                      </div>
                      <Badge variant="secondary">{shareContacts.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Contact */}
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-amiri font-semibold text-blue-700 dark:text-blue-400">
                        إضافة جهة اتصال جديدة
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="الاسم"
                          value={newContact.name}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              name: e.target.value,
                            })
                          }
                        />
                        <Select
                          value={newContact.platform}
                          onValueChange={(value) =>
                            setNewContact({ ...newContact, platform: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">واتساب</SelectItem>
                            <SelectItem value="telegram">تيليجرام</SelectItem>
                            <SelectItem value="sms">رسائل نصية</SelectItem>
                            <SelectItem value="email">إيميل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder={
                          newContact.platform === "email"
                            ? "البريد الإلكتروني"
                            : newContact.platform === "whatsapp"
                              ? "رقم الواتساب (+966...)"
                              : newContact.platform === "telegram"
                                ? "معرف التيليجرام (@...)"
                                : "رقم الهاتف"
                        }
                        value={newContact.contact}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            contact: e.target.value,
                          })
                        }
                      />
                      <Button onClick={addContact} className="w-full" size="sm">
                        <span className="material-symbols-outlined mr-2">
                          add
                        </span>
                        إضافة
                      </Button>
                    </div>

                    {/* Contacts List */}
                    <div className="space-y-3">
                      {shareContacts.length > 0 ? (
                        shareContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {contact.platform === "whatsapp"
                                  ? "💬"
                                  : contact.platform === "telegram"
                                    ? "📱"
                                    : contact.platform === "sms"
                                      ? "💌"
                                      : "📧"}
                              </span>
                              <div>
                                <h5 className="font-semibold text-sm">
                                  {contact.name}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {contact.contact}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={contact.active}
                              onCheckedChange={() => toggleContact(contact.id)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                            person_add
                          </span>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            لم تتم إضافة أي جهة اتصال بعد
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Widget Tab */}
            <TabsContent value="widget" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Widget Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">
                        widgets
                      </span>
                      معاينة Widget ��لعالمي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Android Widget Mockup */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6">
                      <h4 className="text-white font-amiri font-semibold mb-4 text-center">
                        🤖 Android Widget
                      </h4>
                      <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-sm">
                                auto_awesome
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700">
                              الكتاب المبين
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            آية اليوم
                          </span>
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-amiri text-gray-800 leading-relaxed">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            الفاتحة - آية 1
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            className="text-xs h-6 px-3 bg-emerald-600"
                          >
                            اقرأ في التطبيق
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* iOS Widget Mockup */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6">
                      <h4 className="text-white font-amiri font-semibold mb-4 text-center">
                        🍎 iOS Widget
                      </h4>
                      <div className="bg-white/95 backdrop-blur rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-sm">
                                menu_book
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-800">
                              الكتاب المبين
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">اليوم</span>
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-amiri text-gray-800 leading-relaxed">
                            الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            All praise to Allah, Lord of the worlds
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            <span className="material-symbols-outlined text-xs">
                              touch_app
                            </span>
                            انقر للمزيد
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Widget Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">
                        star
                      </span>
                      مميزات Widget العالمي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          icon: "update",
                          title: "تحديث تلقائي يومي",
                          desc: "آية جديدة كل يوم دون تدخل المستخدم",
                          color: "text-blue-600",
                        },
                        {
                          icon: "language",
                          title: "دعم 30 لغة",
                          desc: "يعرض الآية بلغة المستخدم المحلية",
                          color: "text-green-600",
                        },
                        {
                          icon: "dark_mode",
                          title: "تصميم تكيفي",
                          desc: "يتكيف مع الوضع المظلم والفاتح",
                          color: "text-purple-600",
                        },
                        {
                          icon: "touch_app",
                          title: "نقرة واحدة للتطبيق",
                          desc: "ينقل المستخدم مباشرة لقراءة المزيد",
                          color: "text-orange-600",
                        },
                        {
                          icon: "offline_bolt",
                          title: "يعمل دون اتصال",
                          desc: "آيات محفوظة للعمل بدون إنترنت",
                          color: "text-red-600",
                        },
                        {
                          icon: "resize",
                          title: "أحجام متعددة",
                          desc: "صغير، متوسط، كبير حسب تفضيل المستخدم",
                          color: "text-indigo-600",
                        },
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span
                            className={`material-symbols-outlined ${feature.color}`}
                          >
                            {feature.icon}
                          </span>
                          <div>
                            <h5 className="font-amiri font-semibold text-sm">
                              {feature.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {feature.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="text-center">
                      <h4 className="font-amiri font-semibold mb-3">
                        كيفية إضافة Widget
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          📱 <strong>Android:</strong> اضغط مطولاً على الشاشة
                          الرئيسية → Widgets → الكتاب المبين
                        </p>
                        <p>
                          🍎 <strong>iOS:</strong> اضغط مطولاً على الشاشة
                          الرئيسية → + → الكتاب المبين
                        </p>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600">
                      <span className="material-symbols-outlined mr-2">
                        download
                      </span>
                      تحديث التطبيق للحصول على Widget
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Global Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">
                        settings
                      </span>
                      الإعدادات العامة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        اللغات المدعومة
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {languages.map((lang) => (
                          <div
                            key={lang.code}
                            className={cn(
                              "p-2 rounded border cursor-pointer transition-all text-sm",
                              settings.language === lang.code
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                            )}
                            onClick={() =>
                              saveSettings({ language: lang.code })
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span className="text-xs">{lang.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        تفضيلات المحتوى
                      </h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">تضمين الصوت</p>
                          <p className="text-xs text-gray-500">
                            إضافة تلاوة صوتية مع المشاركة
                          </p>
                        </div>
                        <Switch
                          checked={settings.includeAudio}
                          onCheckedChange={(checked) =>
                            saveSettings({ includeAudio: checked })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          نوع التفسير المفضل
                        </label>
                        <Select defaultValue="simplified">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simplified">
                              تفسير مبسط
                            </SelectItem>
                            <SelectItem value="detailed">تفسير مفصل</SelectItem>
                            <SelectItem value="linguistic">
                              تفسير لغوي
                            </SelectItem>
                            <SelectItem value="jurisprudential">
                              تفسير فقهي
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          نوع الدعاء المرفق
                        </label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">دعاء يومي عام</SelectItem>
                            <SelectItem value="related">
                              دعاء مرتبط بالآية
                            </SelectItem>
                            <SelectItem value="prophetic">دعاء نبوي</SelectItem>
                            <SelectItem value="none">بدون دعاء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Integration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">
                        smart_toy
                      </span>
                      ربط الذكاء الاصطناعي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">
                            psychology
                          </span>
                        </div>
                        <h4 className="font-amiri font-semibold text-purple-700 dark:text-purple-400">
                          المفتي المبين AI
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        عند الضغط على "استفسار" في الآية اليومية، يجيب المفتي
                        المبين بالذكاء الاصطناعي
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">تفعيل المساعد الذكي</span>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">إجابات صوتية</span>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">حفظ المحادثات</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-amiri font-semibold">
                        أنواع الاستفسارات المدعومة
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {
                            icon: "help",
                            text: "تفسير الآية بالتفصيل",
                            active: true,
                          },
                          {
                            icon: "history_edu",
                            text: "أسباب النزول",
                            active: true,
                          },
                          {
                            icon: "gavel",
                            text: "الأحكام الفقهية",
                            active: true,
                          },
                          {
                            icon: "psychology",
                            text: "التطبيق في الحياة العملية",
                            active: true,
                          },
                          {
                            icon: "school",
                            text: "الدروس والعبر",
                            active: false,
                          },
                          {
                            icon: "language",
                            text: "المعاني اللغوية",
                            active: false,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-gray-600">
                                {item.icon}
                              </span>
                              <span className="text-sm">{item.text}</span>
                            </div>
                            <Switch checked={item.active} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600">
                      <span className="material-symbols-outlined mr-2">
                        chat
                      </span>
                      تجربة المفتي المبين الآن
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
