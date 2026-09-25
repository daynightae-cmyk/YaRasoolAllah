interface DownloadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "pending" | "downloading" | "completed" | "error";
  url: string;
  size?: string;
}

class DownloadService {
  private downloads: Map<string, DownloadProgress> = new Map();
  private listeners: Set<(downloads: DownloadProgress[]) => void> = new Set();

  // بدء تحميل جديد
  async startDownload(
    id: string,
    url: string,
    fileName: string,
    size?: string,
  ): Promise<void> {
    const download: DownloadProgress = {
      id,
      fileName,
      progress: 0,
      status: "pending",
      url,
      size,
    };

    this.downloads.set(id, download);
    this.notifyListeners();

    try {
      // محاكاة تقدم التحميل
      await this.simulateDownload(id);

      // في التطبيق الحقيقي، ستستخدم fetch أو axios مع progress tracking
      this.updateDownload(id, { status: "completed", progress: 100 });

      // فتح رابط التحميل
      window.open(url, "_blank");
    } catch (error) {
      this.updateDownload(id, { status: "error" });
      throw error;
    }
  }

  // محاكاة تقدم التحميل
  private async simulateDownload(id: string): Promise<void> {
    return new Promise((resolve) => {
      let progress = 0;
      this.updateDownload(id, { status: "downloading" });

      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        this.updateDownload(id, { progress: Math.min(progress, 100) });
      }, 300);
    });
  }

  // تحديث حالة التحميل
  private updateDownload(id: string, updates: Partial<DownloadProgress>): void {
    const download = this.downloads.get(id);
    if (download) {
      Object.assign(download, updates);
      this.downloads.set(id, download);
      this.notifyListeners();
    }
  }

  // الحصول على تحميل محدد
  getDownload(id: string): DownloadProgress | undefined {
    return this.downloads.get(id);
  }

  // الحصول على جميع التحميلات
  getAllDownloads(): DownloadProgress[] {
    return Array.from(this.downloads.values());
  }

  // الحصول على التحميلات النشطة
  getActiveDownloads(): DownloadProgress[] {
    return this.getAllDownloads().filter(
      (d) => d.status === "pending" || d.status === "downloading",
    );
  }

  // إزالة تحميل
  removeDownload(id: string): void {
    this.downloads.delete(id);
    this.notifyListeners();
  }

  // مسح جميع التحميلات المكتملة
  clearCompleted(): void {
    const completed = this.getAllDownloads().filter(
      (d) => d.status === "completed" || d.status === "error",
    );
    completed.forEach((d) => this.downloads.delete(d.id));
    this.notifyListeners();
  }

  // الاستماع للتغييرات
  subscribe(listener: (downloads: DownloadProgress[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // إشعار المستمعين
  private notifyListeners(): void {
    const downloads = this.getAllDownloads();
    this.listeners.forEach((listener) => listener(downloads));
  }

  // حفظ التحميلات في localStorage
  saveToStorage(): void {
    const downloads = this.getAllDownloads();
    localStorage.setItem("elkitab_downloads", JSON.stringify(downloads));
  }

  // تحميل التحميلات من localStorage
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("elkitab_downloads");
      if (stored) {
        const downloads: DownloadProgress[] = JSON.parse(stored);
        downloads.forEach((download) => {
          this.downloads.set(download.id, download);
        });
        this.notifyListeners();
      }
    } catch (error) {
      console.error("خطأ في تحميل البيانات من التخزين المحلي:", error);
    }
  }

  // إحصائيات التحميل
  getStats(): {
    total: number;
    completed: number;
    active: number;
    errors: number;
  } {
    const all = this.getAllDownloads();
    return {
      total: all.length,
      completed: all.filter((d) => d.status === "completed").length,
      active: all.filter(
        (d) => d.status === "downloading" || d.status === "pending",
      ).length,
      errors: all.filter((d) => d.status === "error").length,
    };
  }
}

// إنشاء مثيل واحد للخدمة
export const downloadService = new DownloadService();

// تحمية البيانات عند بدء التطبيق
downloadService.loadFromStorage();

// حفظ البيانات عند تغييرها
downloadService.subscribe(() => {
  downloadService.saveToStorage();
});

export type { DownloadProgress };
