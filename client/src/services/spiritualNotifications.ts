export interface SpiritualNotification {
  id: string;
  title: string;
  message: string;
  type: "motivation" | "reminder" | "comfort" | "gratitude" | "night" | "dawn";
  trigger: "time" | "activity" | "random" | "emotion";
  timePattern?: string;
  icon: string;
  color: string;
  priority: "low" | "medium" | "high";
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: "minimal" | "moderate" | "frequent";
  quietHours: { start: string; end: string };
  enabledTypes: string[];
  randomMode: boolean;
  emotionalDetection: boolean;
  nightMode: boolean;
}

export class SpiritualNotificationService {
  private static instance: SpiritualNotificationService;
  private settings: NotificationSettings;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private onNotificationCallback?: (
    notification: SpiritualNotification,
  ) => void;

  private constructor() {
    this.settings = this.loadSettings();
    this.initialize();
  }

  public static getInstance(): SpiritualNotificationService {
    if (!SpiritualNotificationService.instance) {
      SpiritualNotificationService.instance =
        new SpiritualNotificationService();
    }
    return SpiritualNotificationService.instance;
  }

  private loadSettings(): NotificationSettings {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      frequency: "moderate",
      quietHours: { start: "23:00", end: "06:00" },
      enabledTypes: ["motivation", "reminder", "comfort"],
      randomMode: true,
      emotionalDetection: true,
      nightMode: true,
    };

    try {
      const saved = localStorage.getItem("spiritual-notifications-settings");
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        "spiritual-notifications-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error("Failed to save spiritual notification settings:", error);
    }
  }

  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // إعادة تهيئة الإشعارات حسب الإعدادات الجديدة
    if (newSettings.enabled !== undefined) {
      if (newSettings.enabled) {
        this.startNotifications();
      } else {
        this.stopNotifications();
      }
    }
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public setNotificationCallback(
    callback: (notification: SpiritualNotification) => void,
  ): void {
    this.onNotificationCallback = callback;
  }

  private initialize(): void {
    if (this.settings.enabled) {
      this.startNotifications();
    }
  }

  private startNotifications(): void {
    this.stopNotifications();

    // إعداد الإشعارات حسب النوع والتكرار
    this.scheduleTimeBasedNotifications();
    this.scheduleRandomNotifications();
    this.setupActivityBasedTriggers();
  }

  private stopNotifications(): void {
    this.scheduledNotifications.forEach((timeout) => clearTimeout(timeout));
    this.scheduledNotifications.clear();
  }

  private scheduleTimeBasedNotifications(): void {
    const notifications = this.getTimeBasedNotifications();

    notifications.forEach((notification) => {
      if (!this.settings.enabledTypes.includes(notification.type)) return;

      const interval = this.getIntervalForFrequency();
      const timeout = setInterval(() => {
        if (this.shouldShowNotification(notification)) {
          this.triggerNotification(notification);
        }
      }, interval);

      this.scheduledNotifications.set(notification.id, timeout as any);
    });
  }

  private scheduleRandomNotifications(): void {
    if (!this.settings.randomMode) return;

    const scheduleNext = () => {
      const delay = this.getRandomDelay();
      const timeout = setTimeout(() => {
        const notification = this.getRandomNotification();
        if (notification && this.shouldShowNotification(notification)) {
          this.triggerNotification(notification);
        }
        scheduleNext(); // جدولة التالي
      }, delay);

      this.scheduledNotifications.set("random", timeout);
    };

    scheduleNext();
  }

  private setupActivityBasedTriggers(): void {
    // تتبع نشاط المستخدم لإطلاق إشعارات مناسبة
    this.detectUserInactivity();
    this.detectScrollPatterns();
    this.detectTimeSpent();
  }

  private detectUserInactivity(): void {
    let inactiveTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactiveTimer);
      inactiveTimer = setTimeout(
        () => {
          const notification = this.getInactivityNotification();
          if (this.shouldShowNotification(notification)) {
            this.triggerNotification(notification);
          }
        },
        10 * 60 * 1000,
      ); // 10 دقائق خمول
    };

    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetTimer, true);
      },
    );

    resetTimer();
  }

  private detectScrollPatterns(): void {
    let scrollCount = 0;
    let lastScrollTime = Date.now();

    window.addEventListener("scroll", () => {
      const now = Date.now();
      if (now - lastScrollTime > 1000) {
        // إذا مر أكثر من ثانية
        scrollCount++;
        lastScrollTime = now;

        // إذا كان يتصفح كثيراً، قد يحتاج تذكير
        if (scrollCount > 50) {
          const notification = this.getBrowsingNotification();
          if (this.shouldShowNotification(notification)) {
            this.triggerNotification(notification);
            scrollCount = 0; // إعادة تصفير
          }
        }
      }
    });
  }

  private detectTimeSpent(): void {
    const startTime = Date.now();

    setInterval(
      () => {
        const timeSpent = Date.now() - startTime;

        // بعد 30 دقيقة من الاستخدام
        if (timeSpent > 30 * 60 * 1000) {
          const notification = this.getLongSessionNotification();
          if (this.shouldShowNotification(notification)) {
            this.triggerNotification(notification);
          }
        }
      },
      5 * 60 * 1000,
    ); // كل 5 دقائق فحص
  }

  private shouldShowNotification(notification: SpiritualNotification): boolean {
    // فحص ساعات الهدوء
    if (this.isQuietTime()) {
      return notification.type === "night"; // فقط إشعارات الليل في الساعات الهادئة
    }

    // فحص إذا كان النوع مفعل
    if (!this.settings.enabledTypes.includes(notification.type)) {
      return false;
    }

    // فحص آخر إشعار لتجنب الإزعاج
    const lastNotification = localStorage.getItem(
      "last-spiritual-notification",
    );
    if (lastNotification) {
      const lastTime = new Date(lastNotification).getTime();
      const minInterval = this.getMinInterval();
      if (Date.now() - lastTime < minInterval) {
        return false;
      }
    }

    return true;
  }

  private isQuietTime(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = this.settings.quietHours.start
      .split(":")
      .map(Number);
    const [endH, endM] = this.settings.quietHours.end.split(":").map(Number);

    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime > endTime) {
      // يمتد عبر منتصف الليل
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  private triggerNotification(notification: SpiritualNotification): void {
    // حفظ وقت آخر إشعار
    localStorage.setItem(
      "last-spiritual-notification",
      new Date().toISOString(),
    );

    // إطلاق الإشعار
    if (this.onNotificationCallback) {
      this.onNotificationCallback(notification);
    }

    // إشعار المتصفح إذا كان مسموح
    this.showBrowserNotification(notification);

    // حفظ في التاريخ
    this.saveToHistory(notification);
  }

  private showBrowserNotification(notification: SpiritualNotification): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "spiritual-notification",
        requireInteraction: false,
        silent: false,
      });
    }
  }

  private saveToHistory(notification: SpiritualNotification): void {
    try {
      const history = JSON.parse(
        localStorage.getItem("spiritual-notifications-history") || "[]",
      );
      history.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(
        "spiritual-notifications-history",
        JSON.stringify(history.slice(0, 100)),
      );
    } catch (error) {
      console.error("Failed to save notification history:", error);
    }
  }

  private getTimeBasedNotifications(): SpiritualNotification[] {
    return [
      {
        id: "morning-motivation",
        title: "🌅 صباح النور",
        message: "هل تحب أن تبدأ يومك بدعاء جميل؟",
        type: "motivation",
        trigger: "time",
        timePattern: "07:00",
        icon: "wb_sunny",
        color: "amber",
        priority: "medium",
      },
      {
        id: "afternoon-reminder",
        title: "☀️ وقت الاستراحة",
        message: "خذ نفساً عميقاً... الله معك",
        type: "reminder",
        trigger: "time",
        timePattern: "14:00",
        icon: "self_care",
        color: "emerald",
        priority: "low",
      },
      {
        id: "evening-gratitude",
        title: "🌅 شكر وامتنان",
        message: "ما أجمل شيء حدث لك اليوم؟",
        type: "gratitude",
        trigger: "time",
        timePattern: "19:00",
        icon: "favorite",
        color: "rose",
        priority: "medium",
      },
      {
        id: "night-comfort",
        title: "🌙 ليلة مباركة",
        message: "اختتم يومك بدعاء من القلب...",
        type: "night",
        trigger: "time",
        timePattern: "22:00",
        icon: "bedtime",
        color: "indigo",
        priority: "high",
      },
    ];
  }

  private getRandomNotification(): SpiritualNotification {
    const randomNotifications: SpiritualNotification[] = [
      {
        id: "surprise-1",
        title: "💫 مفاجأة روحانية",
        message: "الله يفتح لك باب رحمته... ادخل الآن",
        type: "motivation",
        trigger: "random",
        icon: "auto_awesome",
        color: "purple",
        priority: "high",
      },
      {
        id: "surprise-2",
        title: "🤲 دعوة مستجابة",
        message: "هناك دعاء ينتظرك... قل ما في قلبك",
        type: "comfort",
        trigger: "random",
        icon: "favorite",
        color: "emerald",
        priority: "high",
      },
      {
        id: "surprise-3",
        title: "✨ نور يناديك",
        message: "توقف للحظة... الله يريد أن يكلمك",
        type: "reminder",
        trigger: "random",
        icon: "flare",
        color: "gold",
        priority: "medium",
      },
      {
        id: "surprise-4",
        title: "🌟 همسة سماوية",
        message: "روحك تحتاج لمسة حنان... تعال",
        type: "comfort",
        trigger: "random",
        icon: "healing",
        color: "blue",
        priority: "high",
      },
    ];

    return randomNotifications[
      Math.floor(Math.random() * randomNotifications.length)
    ];
  }

  private getInactivityNotification(): SpiritualNotification {
    return {
      id: "inactivity",
      title: "🕊️ استراحة روحية",
      message: "يبدو أنك تحتاج لحظة صفاء... باب السماء مفتوح",
      type: "reminder",
      trigger: "activity",
      icon: "spa",
      color: "teal",
      priority: "low",
    };
  }

  private getBrowsingNotification(): SpiritualNotification {
    return {
      id: "browsing",
      title: "📚 بين القراءة والدعاء",
      message: "تقرأ كثيراً... ما رأيك في دعاء قصير؟",
      type: "reminder",
      trigger: "activity",
      icon: "menu_book",
      color: "indigo",
      priority: "low",
    };
  }

  private getLongSessionNotification(): SpiritualNotification {
    return {
      id: "long-session",
      title: "⏰ وقت للراحة",
      message: "أخذت من وقتك الكثير... استرح مع دعاء جميل",
      type: "reminder",
      trigger: "activity",
      icon: "schedule",
      color: "orange",
      priority: "medium",
    };
  }

  private getIntervalForFrequency(): number {
    switch (this.settings.frequency) {
      case "minimal":
        return 3 * 60 * 60 * 1000; // كل 3 ساعات
      case "moderate":
        return 2 * 60 * 60 * 1000; // كل ساعتين
      case "frequent":
        return 60 * 60 * 1000; // كل ساعة
      default:
        return 2 * 60 * 60 * 1000;
    }
  }

  private getRandomDelay(): number {
    // تأخير عشوائي بين 15 دقيقة إلى 4 ساعات
    const min = 15 * 60 * 1000; // 15 دقيقة
    const max = 4 * 60 * 60 * 1000; // 4 ساعات
    return Math.random() * (max - min) + min;
  }

  private getMinInterval(): number {
    // حد أدنى بين الإشعارات لتجنب الإزعاج
    switch (this.settings.frequency) {
      case "minimal":
        return 2 * 60 * 60 * 1000; // ساعتين
      case "moderate":
        return 30 * 60 * 1000; // 30 دقيقة
      case "frequent":
        return 15 * 60 * 1000; // 15 دقيقة
      default:
        return 30 * 60 * 1000;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  public getNotificationHistory(): any[] {
    try {
      return JSON.parse(
        localStorage.getItem("spiritual-notifications-history") || "[]",
      );
    } catch {
      return [];
    }
  }

  public clearHistory(): void {
    localStorage.removeItem("spiritual-notifications-history");
  }

  public testNotification(): void {
    const testNotification: SpiritualNotification = {
      id: "test",
      title: "🧪 اختبار الإشعار",
      message: "هذا اختبار لنظام الإشعارات الروحانية",
      type: "reminder",
      trigger: "random",
      icon: "science",
      color: "blue",
      priority: "medium",
    };

    this.triggerNotification(testNotification);
  }

  public destroy(): void {
    this.stopNotifications();
  }
}

// تصدير خدمة واحدة
export const spiritualNotificationService =
  SpiritualNotificationService.getInstance();

// Hook للاستخدام في المكونات
export function useSpiritualNotifications() {
  const service = SpiritualNotificationService.getInstance();

  return {
    settings: service.getSettings(),
    updateSettings: (settings: Partial<NotificationSettings>) =>
      service.updateSettings(settings),
    requestPermission: () => service.requestPermission(),
    testNotification: () => service.testNotification(),
    getHistory: () => service.getNotificationHistory(),
    clearHistory: () => service.clearHistory(),
    setCallback: (callback: (notification: SpiritualNotification) => void) =>
      service.setNotificationCallback(callback),
  };
}
