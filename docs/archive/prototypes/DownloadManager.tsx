import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  downloadService,
  DownloadProgress,
} from "../../services/downloadService";

interface DownloadManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadManager({
  isOpen,
  onClose,
}: DownloadManagerProps) {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">(
    "active",
  );

  useEffect(() => {
    if (!isOpen) return;

    // تحديث قائمة التحميلات
    setDownloads(downloadService.getAllDownloads());

    // الاستماع للتغييرات
    const unsubscribe = downloadService.subscribe((newDownloads) => {
      setDownloads(newDownloads);
    });

    return unsubscribe;
  }, [isOpen]);

  const filteredDownloads = downloads.filter((download) => {
    switch (activeTab) {
      case "active":
        return (
          download.status === "downloading" || download.status === "pending"
        );
      case "completed":
        return download.status === "completed" || download.status === "error";
      default:
        return true;
    }
  });

  const stats = downloadService.getStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "downloading":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "error":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "downloading":
        return "يتم التحميل...";
      case "pending":
        return "في الانتظار";
      case "error":
        return "خطأ";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "check_circle";
      case "downloading":
        return "download";
      case "pending":
        return "schedule";
      case "error":
        return "error";
      default:
        return "help";
    }
  };

  const formatFileSize = (size?: string) => {
    return size || "غير محدد";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-amiri text-xl flex items-center gap-2">
              <span className="material-symbols-outlined">download</span>
              مدير التحميلات
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                إجمالي
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                مكتمل
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.active}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                نشط
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.errors}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">خطأ</div>
            </div>
          </div>

          {/* تبويبات التصفية */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("active")}
              className={activeTab === "active" ? "bg-blue-600 text-white" : ""}
            >
              <span className="material-symbols-outlined mr-2 text-sm">
                downloading
              </span>
              النشطة ({stats.active})
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("completed")}
              className={
                activeTab === "completed" ? "bg-green-600 text-white" : ""
              }
            >
              <span className="material-symbols-outlined mr-2 text-sm">
                done
              </span>
              المكتملة ({stats.completed + stats.errors})
            </Button>
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className={activeTab === "all" ? "bg-gray-600 text-white" : ""}
            >
              <span className="material-symbols-outlined mr-2 text-sm">
                list
              </span>
              الكل ({stats.total})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto">
          {filteredDownloads.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                {activeTab === "active" ? "downloading" : "download_done"}
              </span>
              <h3 className="text-lg font-amiri font-bold text-gray-600 dark:text-gray-400 mb-2">
                {activeTab === "active"
                  ? "لا توجد تحميلات نشطة"
                  : "لا توجد تحميلات"}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {activeTab === "active"
                  ? "ابدأ بتحميل بعض الكتب لرؤيتها هنا"
                  : "قم بتحميل بعض الكتب أولاً"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDownloads.map((download) => (
                <Card key={download.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-amiri font-medium text-gray-900 dark:text-white">
                        {download.fileName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className={getStatusColor(download.status)}>
                          <span className="material-symbols-outlined text-xs mr-1">
                            {getStatusIcon(download.status)}
                          </span>
                          {getStatusText(download.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(download.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {download.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(download.url, "_blank")}
                        >
                          <span className="material-symbols-outlined text-sm">
                            open_in_new
                          </span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          downloadService.removeDownload(download.id)
                        }
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* شريط التقدم للتحميلات النشطة */}
                  {(download.status === "downloading" ||
                    download.status === "pending") && (
                    <div className="space-y-2">
                      <Progress value={download.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(download.progress)}%</span>
                        <span>
                          {download.status === "downloading"
                            ? "يتم التحميل..."
                            : "في الانتظار"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* رسالة الخطأ */}
                  {download.status === "error" && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                      فشل في التحميل. يرجى المحاولة مرة أخرى.
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>

        {/* أزرار الإجراءات السفلية */}
        {downloads.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => downloadService.clearCompleted()}
                disabled={stats.completed + stats.errors === 0}
              >
                <span className="material-symbols-outlined mr-2 text-sm">
                  clear_all
                </span>
                مسح المكتملة
              </Button>
              <Button variant="outline" onClick={onClose}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
