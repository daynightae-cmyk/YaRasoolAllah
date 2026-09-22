import { getDailyVerse } from "./quranService";

export interface ShareContact {
  id: string;
  name: string;
  platform: "whatsapp" | "telegram" | "sms" | "email";
  contact: string;
  active: boolean;
}

export interface AutoShareSettings {
  enabled: boolean;
  time: string;
  platforms: string[];
  contacts: ShareContact[];
  language: string;
  includeAudio: boolean;
  customMessage: string;
  lastShared: string;
}

export class AutoShareService {
  private static instance: AutoShareService;
  private settings: AutoShareSettings;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.settings = this.loadSettings();
    this.initialize();
  }

  public static getInstance(): AutoShareService {
    if (!AutoShareService.instance) {
      AutoShareService.instance = new AutoShareService();
    }
    return AutoShareService.instance;
  }

  private loadSettings(): AutoShareSettings {
    const defaultSettings: AutoShareSettings = {
      enabled: false,
      time: "09:00",
      platforms: [],
      contacts: [],
      language: "ar",
      includeAudio: false,
      customMessage: "",
      lastShared: "",
    };

    try {
      const saved = localStorage.getItem("auto-share-settings");
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
        "auto-share-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error("Failed to save auto-share settings:", error);
    }
  }

  public updateSettings(newSettings: Partial<AutoShareSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    if (newSettings.enabled !== undefined) {
      if (newSettings.enabled) {
        this.startScheduler();
      } else {
        this.stopScheduler();
      }
    }
  }

  public getSettings(): AutoShareSettings {
    return { ...this.settings };
  }

  private initialize(): void {
    if (this.settings.enabled) {
      this.startScheduler();
    }
  }

  private startScheduler(): void {
    this.stopScheduler();

    // Check every minute if it's time to share
    this.intervalId = setInterval(() => {
      this.checkAndShare();
    }, 60000);

    // Also check immediately
    this.checkAndShare();
  }

  private stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndShare(): Promise<void> {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toDateString();

    // Check if it's time to share and we haven't shared today
    if (
      currentTime === this.settings.time &&
      this.settings.lastShared !== currentDate
    ) {
      await this.performAutoShare();
      this.settings.lastShared = currentDate;
      this.saveSettings();
    }
  }

  private async performAutoShare(): Promise<void> {
    try {
      const dailyVerse = await getDailyVerse();
      if (!dailyVerse) return;

      const message = await this.generateShareMessage(dailyVerse);
      const activeContacts = this.settings.contacts.filter(
        (contact) => contact.active,
      );

      for (const contact of activeContacts) {
        if (this.settings.platforms.includes(contact.platform)) {
          await this.shareToContact(contact, message);
        }
      }

      // Notify user about successful sharing
      this.notifyUser(
        `تم مشاركة الآية اليومية مع ${activeContacts.length} جهة اتصال`,
      );

      // Update statistics
      this.updateShareStats(activeContacts.length);
    } catch (error) {
      console.error("Auto-share failed:", error);
      this.notifyUser("فشل في المشاركة التلقائية", "error");
    }
  }

  private async generateShareMessage(verse: any): Promise<string> {
    const dua = this.getDailyDua();
    const appLink = "https://yarasoolallah.org";

    let message = `🌟 الآية اليومية — منصة يا رسول الله ﷺ 🌟\n\n`;

    message += `${verse.arabic}\n\n`;
    message += `"${verse.translation}"\n\n`;
    message += `📖 ${verse.surahName} - آية ${verse.ayah}\n\n`;

    // Add simple tafsir
    message += `💡 تفسير مبسط:\n`;
    message += `${this.getSimpleTafsir(verse)}\n\n`;

    // Add daily dua
    message += `🤲 دعاء اليوم:\n`;
    message += `${dua}\n\n`;

    // Add custom message if provided
    if (this.settings.customMessage.trim()) {
      message += `💎 ${this.settings.customMessage}\n\n`;
    }

    message += `📱 منصة يا رسول الله ﷺ:\n${appLink}\n\n`;
    message += `#الآية_اليومية #القرآن_الكريم #يا_رسول_الله`;

    return message;
  }

  private getDailyDua(): string {
    const duas = [
      "اللهم اهدنا فيمن هديت، وعافنا فيمن عافيت",
      "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
      "اللهم أعنا على ذكرك وشكرك وحسن عبادتك",
      "ربنا اغفر لنا ذنوبنا وإسرافنا في أمرنا",
      "اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا",
      "اللهم اجعلنا من الذين يستمعون القول فيتبعون أحسنه",
      "ربنا لا تزغ قلوبنا بعد إذ هديتنا",
      "اللهم أصلح لنا ديننا ودنيانا وآخرتنا",
    ];

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return duas[dayOfYear % duas.length];
  }

  private getSimpleTafsir(verse: any): string {
    const tafsirs = [
      "هذه الآية تذكرنا بعظمة الله وقدرته على كل شيء، وتدعونا للتأمل في خلقه وحكمته",
      "آية كريمة تبين لنا أهمية التوكل على الله في جميع أمورنا، والاعتماد عليه وحده",
      "تدعونا هذه الآية إلى التأمل في خلق الله وعجائب قدرته، وتذكرنا بنعمه التي لا تُحصى",
      "آية مباركة تحثنا على الصبر والثبات على الحق، والاستعانة بالله في جميع الأحوال",
      "تذكرنا بأهمية الذكر والدعاء في حياتنا اليومية، وأن الله قريب مجيب الدعوات",
      "هذه الآية تُعلمنا القيم الإسلامية الأصيلة وتوجهنا لما فيه خيرنا في الدنيا والآخرة",
      "آية تحمل معاني عميقة عن الإيمان والعمل الصالح، وتحثنا على التقرب إلى الله",
      "تدعونا للتفكر في معاني القرآن وتطبيق تعاليمه في حياتنا العملية",
    ];

    return tafsirs[Math.floor(Math.random() * tafsirs.length)];
  }

  private async shareToContact(
    contact: ShareContact,
    message: string,
  ): Promise<void> {
    try {
      switch (contact.platform) {
        case "whatsapp":
          await this.shareToWhatsApp(contact.contact, message);
          break;
        case "telegram":
          await this.shareToTelegram(contact.contact, message);
          break;
        case "sms":
          await this.shareToSMS(contact.contact, message);
          break;
        case "email":
          await this.shareToEmail(contact.contact, message);
          break;
      }
    } catch (error) {
      console.error(
        `Failed to share to ${contact.name} (${contact.platform}):`,
        error,
      );
    }
  }

  private async shareToWhatsApp(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    // For web version, we can only open WhatsApp Web
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;

    // In a real app, this would use WhatsApp Business API
    // For now, we'll simulate the action
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }

  private async shareToTelegram(
    username: string,
    message: string,
  ): Promise<void> {
    // For Telegram, we can use the Telegram Bot API if configured
    const encodedMessage = encodeURIComponent(message);
    const url = `https://t.me/${username.replace("@", "")}`;

    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }

  private async shareToSMS(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    // SMS can only be triggered, not automatically sent from web
    const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    if (typeof window !== "undefined") {
      window.open(url);
    }
  }

  private async shareToEmail(email: string, message: string): Promise<void> {
    const subject = encodeURIComponent("الآية اليومية من الكتاب المبين");
    const body = encodeURIComponent(message);
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    if (typeof window !== "undefined") {
      window.open(url);
    }
  }

  private notifyUser(
    message: string,
    type: "success" | "error" = "success",
  ): void {
    // In a real app, this would use a toast notification system
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("الكتاب المبين", {
        body: message,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
      });
    }

    console.log(`[AutoShare ${type}]:`, message);
  }

  private updateShareStats(count: number): void {
    try {
      const stats = JSON.parse(localStorage.getItem("share-stats") || "{}");
      const today = new Date().toDateString();

      stats.total = (stats.total || 0) + count;
      stats.today =
        today === stats.lastDate ? (stats.today || 0) + count : count;
      stats.lastDate = today;

      // Weekly stats
      const thisWeek = this.getWeekNumber(new Date());
      if (stats.week !== thisWeek) {
        stats.weeklyCount = count;
        stats.week = thisWeek;
      } else {
        stats.weeklyCount = (stats.weeklyCount || 0) + count;
      }

      localStorage.setItem("share-stats", JSON.stringify(stats));
    } catch (error) {
      console.error("Failed to update share stats:", error);
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  public getShareStats(): { today: number; week: number; total: number } {
    try {
      const stats = JSON.parse(localStorage.getItem("share-stats") || "{}");
      const today = new Date().toDateString();
      const thisWeek = this.getWeekNumber(new Date());

      return {
        today: today === stats.lastDate ? stats.today || 0 : 0,
        week: thisWeek === stats.week ? stats.weeklyCount || 0 : 0,
        total: stats.total || 0,
      };
    } catch {
      return { today: 0, week: 0, total: 0 };
    }
  }

  // Manual sharing method
  public async shareNow(): Promise<void> {
    if (!this.settings.enabled) {
      throw new Error("Auto-share is not enabled");
    }

    await this.performAutoShare();
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
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

  // Test share functionality
  public async testShare(
    contact: ShareContact,
    customMessage?: string,
  ): Promise<void> {
    try {
      const verse = await getDailyVerse();
      if (!verse) throw new Error("Could not get daily verse");

      const message = customMessage || (await this.generateShareMessage(verse));
      await this.shareToContact(contact, message);

      this.notifyUser(`تم إرسال رسالة اختبار إلى ${contact.name}`);
    } catch (error) {
      this.notifyUser(`فشل في إرسال الرسالة الاختبارية: ${error}`, "error");
      throw error;
    }
  }

  // Get next share time
  public getNextShareTime(): Date | null {
    if (!this.settings.enabled) return null;

    const [hours, minutes] = this.settings.time.split(":").map(Number);
    const now = new Date();
    const nextShare = new Date();

    nextShare.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextShare <= now) {
      nextShare.setDate(nextShare.getDate() + 1);
    }

    return nextShare;
  }

  // Cleanup method
  public destroy(): void {
    this.stopScheduler();
  }
}

// Export singleton instance
export const autoShareService = AutoShareService.getInstance();

// Helper functions for components
export function useAutoShare() {
  const service = AutoShareService.getInstance();

  return {
    settings: service.getSettings(),
    updateSettings: (settings: Partial<AutoShareSettings>) =>
      service.updateSettings(settings),
    shareNow: () => service.shareNow(),
    testShare: (contact: ShareContact, message?: string) =>
      service.testShare(contact, message),
    getStats: () => service.getShareStats(),
    getNextShareTime: () => service.getNextShareTime(),
    requestPermission: () => service.requestNotificationPermission(),
  };
}
