import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  spiritualNotificationService,
  SpiritualNotification,
  useSpiritualNotifications,
} from "@/services/spiritualNotifications";

interface BabAlsamaaContextType {
  isOpen: boolean;
  openBab: (triggeredBy?: "auto" | "manual" | "notification") => void;
  closeBab: () => void;
  triggerContext?: SpiritualNotification;
  isNotificationsEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
}

const BabAlsamaaContext = createContext<BabAlsamaaContextType | undefined>(
  undefined,
);

interface BabAlsamaaProviderProps {
  children: ReactNode;
}

export function BabAlsamaaProvider({ children }: BabAlsamaaProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerContext, setTriggerContext] = useState<
    SpiritualNotification | undefined
  >();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const { settings, updateSettings, requestPermission, setCallback } =
    useSpiritualNotifications();

  useEffect(() => {
    // تحديد حالة الإشعارات
    setIsNotificationsEnabled(
      settings.enabled &&
        "Notification" in window &&
        Notification.permission === "granted",
    );

    // تعيين callback للإشعارات
    setCallback((notification: SpiritualNotification) => {
      setTriggerContext(notification);
      openBab("auto");
    });
  }, [settings.enabled]);

  const openBab = (
    triggeredBy: "auto" | "manual" | "notification" = "manual",
  ) => {
    setIsOpen(true);

    // تتبع طريقة فتح باب السماء
    const analytics = JSON.parse(
      localStorage.getItem("bab-alsamaa-analytics") || "{}",
    );
    analytics[triggeredBy] = (analytics[triggeredBy] || 0) + 1;
    analytics.lastOpened = new Date().toISOString();
    localStorage.setItem("bab-alsamaa-analytics", JSON.stringify(analytics));
  };

  const closeBab = () => {
    setIsOpen(false);
    setTriggerContext(undefined);
  };

  const enableNotifications = async (): Promise<boolean> => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ enabled: true });
      setIsNotificationsEnabled(true);
      return true;
    }
    return false;
  };

  const disableNotifications = () => {
    updateSettings({ enabled: false });
    setIsNotificationsEnabled(false);
  };

  return (
    <BabAlsamaaContext.Provider
      value={{
        isOpen,
        openBab,
        closeBab,
        triggerContext,
        isNotificationsEnabled,
        enableNotifications,
        disableNotifications,
      }}
    >
      {children}
    </BabAlsamaaContext.Provider>
  );
}

export function useBabAlsamaa() {
  const context = useContext(BabAlsamaaContext);
  if (context === undefined) {
    throw new Error("useBabAlsamaa must be used within a BabAlsamaaProvider");
  }
  return context;
}

// Hook للحصول على إحصائيات الاستخدام
export function useBabAlsamaaAnalytics() {
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    const loadAnalytics = () => {
      const data = JSON.parse(
        localStorage.getItem("bab-alsamaa-analytics") || "{}",
      );
      setAnalytics(data);
    };

    loadAnalytics();

    // تحديث الإحصائيات كل دقيقة
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    totalOpens:
      (analytics.auto || 0) +
      (analytics.manual || 0) +
      (analytics.notification || 0),
    autoOpens: analytics.auto || 0,
    manualOpens: analytics.manual || 0,
    notificationOpens: analytics.notification || 0,
    lastOpened: analytics.lastOpened ? new Date(analytics.lastOpened) : null,
    getHistory: () => {
      return JSON.parse(localStorage.getItem("bab-alsamaa-history") || "[]");
    },
    clearHistory: () => {
      localStorage.removeItem("bab-alsamaa-history");
      localStorage.removeItem("bab-alsamaa-analytics");
      setAnalytics({});
    },
  };
}

// Hook لتتبع الحالة العاطفية للمستخدم
export function useEmotionalDetection() {
  const [currentMood, setCurrentMood] = useState<string>("neutral");
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  useEffect(() => {
    // تحميل تاريخ المزاج
    const history = JSON.parse(
      localStorage.getItem("user-mood-history") || "[]",
    );
    setMoodHistory(history);
  }, []);

  const detectMoodFromText = (text: string): string => {
    const sadWords = [
      "حزين",
      "تايه",
      "مكتئب",
      "زعلان",
      "متضايق",
      "حزن",
      "ضيق",
      "تع��ان",
      "مش قادر",
    ];
    const happyWords = [
      "فرحان",
      "سعيد",
      "مبسوط",
      "شكر",
      "الحمد",
      "رائع",
      "جميل",
    ];
    const confusedWords = [
      "تايه",
      "محتار",
      "ضايع",
      "مش عارف",
      "حيران",
      "مش فاهم",
    ];
    const fearWords = ["خايف", "قلقان", "متوتر", "خوف", "قلق", "مرعوب"];
    const hopeWords = [
      "ربنا",
      "الله",
      "دعاء",
      "استغفار",
      "توبة",
      "أمل",
      "رجاء",
    ];
    const angerWords = ["زعلان", "غضبان", "متنرفز", "مستفز", "مش طايق"];

    const lowerText = text.toLowerCase();

    if (sadWords.some((word) => lowerText.includes(word))) return "sad";
    if (fearWords.some((word) => lowerText.includes(word))) return "fear";
    if (angerWords.some((word) => lowerText.includes(word))) return "anger";
    if (confusedWords.some((word) => lowerText.includes(word)))
      return "confused";
    if (happyWords.some((word) => lowerText.includes(word))) return "happy";
    if (hopeWords.some((word) => lowerText.includes(word))) return "hopeful";

    return "neutral";
  };

  const updateMood = (mood: string, context?: string) => {
    setCurrentMood(mood);

    const moodEntry = {
      mood,
      context,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    const updatedHistory = [moodEntry, ...moodHistory.slice(0, 99)]; // آخر 100 إدخال
    setMoodHistory(updatedHistory);
    localStorage.setItem("user-mood-history", JSON.stringify(updatedHistory));
  };

  const getMoodAnalytics = () => {
    const last7Days = moodHistory.filter(
      (entry) =>
        new Date().getTime() - new Date(entry.timestamp).getTime() <
        7 * 24 * 60 * 60 * 1000,
    );

    const moodCounts = last7Days.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const dominantMood =
      Object.entries(moodCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ||
      "neutral";

    return {
      last7Days: moodCounts,
      dominantMood,
      totalEntries: moodHistory.length,
      lastMood: moodHistory[0]?.mood || "neutral",
    };
  };

  return {
    currentMood,
    moodHistory,
    detectMoodFromText,
    updateMood,
    getMoodAnalytics,
  };
}

// Hook للحصول على اقتراحات ذكية حسب وقت اليوم ونشاط المستخدم
export function useSmartSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();

      let timeSuggestions: string[] = [];

      if (hour >= 5 && hour < 9) {
        // الصباح الباكر
        timeSuggestions = [
          "اللهم بارك لنا في يومنا هذا",
          "أحتاج دعاء للتوفيق اليوم",
          "اللهم يسر أمري",
          "أشعر بطاقة إيجابية 😊",
        ];
      } else if (hour >= 9 && hour < 12) {
        // الضحى
        timeSuggestions = [
          "اللهم أعني على العمل",
          "أحتاج تركيز ونشاط",
          "بارك الله في وقتي",
          "أشكر الله على نعمه",
        ];
      } else if (hour >= 12 && hour < 15) {
        // بعد الظهر
        timeSuggestions = [
          "استراحة روحية قصيرة",
          "اللهم تقبل أعمالي",
          "أحتاج صبر وثبات",
          "الحمد لله على كل شيء",
        ];
      } else if (hour >= 15 && hour < 18) {
        // العصر
        timeSuggestions = [
          "اللهم أتمم علي نعمتك",
          "أحتاج دفعة للاستمرار",
          "اللهم اجعل باقي يومي خير",
          "أشعر بالتعب قليلاً 😔",
        ];
      } else if (hour >= 18 && hour < 21) {
        // المساء
        timeSuggestions = [
          "الحمد لله على يوم جميل",
          "اللهم اجعل مسائي مباركاً",
          "شكراً لله على كل شيء حدث اليوم",
          "أحتاج سكينة في قلبي",
        ];
      } else {
        // الليل
        timeSuggestions = [
          "اللهم أعني على قيام الليل",
          "أحتاج سكون وراحة",
          "استغفار قبل النوم",
          "أشعر بالوحدة قليلاً 🌙",
        ];
      }

      // إضافة اقتراحات خاصة بيوم الجمعة
      if (dayOfWeek === 5) {
        timeSuggestions.push(
          "دعاء يوم الجمعة المبارك",
          "اللهم تقبل دعائي في هذا اليوم",
        );
      }

      setSuggestions(timeSuggestions);
    };

    generateSuggestions();

    // تحديث الاقتراحات كل ساعة
    const interval = setInterval(generateSuggestions, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { suggestions };
}
