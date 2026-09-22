import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import {
  useIslamicAI,
  IslamicKnowledgeEntry,
  TrainingData,
} from "@/services/islamicAI";
import IslamicAIChat, {
  IslamicAIStats,
} from "@/components/IslamicAI/IslamicAIChat";
import { cn } from "@/lib/utils";

export default function IslamicAIManagementPage() {
  const { t, isRTL } = useLanguage();
  const { updateLastVisited } = useProgress();
  const { getStats, addKnowledge, exportTrainingData, searchKnowledge } =
    useIslamicAI();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>({});
  const [newEntry, setNewEntry] = useState<Partial<IslamicKnowledgeEntry>>({
    type: "quran",
    category: "",
    question: "",
    answer: "",
    source: "",
    keywords: [],
    metadata: {},
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IslamicKnowledgeEntry[]>(
    [],
  );
  const [conversations, setConversations] = useState<any[]>([]);
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    frequencyPenalty: 0.1,
  });

  useEffect(() => {
    updateLastVisited("/islamic-ai-management");
    loadData();
  }, [updateLastVisited]);

  const loadData = async () => {
    // تحميل الإحصائيات
    setStats(getStats());

    // تحميل المحادثات المحفوظة
    try {
      const savedConversations = JSON.parse(
        localStorage.getItem("islamic-ai-conversations") || "[]",
      );
      setConversations(savedConversations.slice(0, 20));
    } catch (error) {
      console.error("خطأ في تحميل المحادثات:", error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.question || !newEntry.answer || !newEntry.source) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const entry: IslamicKnowledgeEntry = {
      id: Date.now().toString(),
      type: newEntry.type as any,
      category: newEntry.category || "عام",
      question: newEntry.question,
      answer: newEntry.answer,
      source: newEntry.source,
      keywords: newEntry.keywords || [],
      metadata: newEntry.metadata || {},
    };

    try {
      await addKnowledge(entry);
      setStats(getStats());
      setNewEntry({
        type: "quran",
        category: "",
        question: "",
        answer: "",
        source: "",
        keywords: [],
        metadata: {},
      });
      alert("تم إضافة المدخل بنجاح");
    } catch (error) {
      alert("حدث خطأ أثناء إضافة المدخل");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await searchKnowledge(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error("خطأ في البحث:", error);
    }
  };

  const handleExportTraining = (format: "json" | "alpaca") => {
    const data = exportTrainingData(format);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `islamic-ai-training-${format}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      quran:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      hadith:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      seerah:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      fiqh: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      aqidah:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
      akhlaq:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      quran: "قرآن كريم",
      hadith: "حديث شريف",
      seerah: "سيرة نبوية",
      fiqh: "فقه",
      aqidah: "عقيدة",
      akhlaq: "أخلاق",
      tafsir: "تفسير",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* الهيدر */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">
                  psychology
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  إدارة النموذج الإسلامي
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-inter mt-2">
                  Phi-3 Mini مخصص للعلوم الشرعية والمعرفة الإسلامية
                </p>
              </div>
            </motion.div>

            {/* معلومات النموذج */}
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="material-symbols-outlined text-emerald-600">
                  verified
                </span>
                <h3 className="text-xl font-amiri font-bold text-emerald-700 dark:text-emerald-400">
                  Microsoft Phi-3 Mini (4K Instruct)
                </h3>
                <Badge className="bg-green-500 text-white">مجاني</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    الرخصة
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    MIT License
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 dark:text-blue-400">
                    التخصص
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Instruction Following
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-400">
                    التدريب
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Fine-tuning + LoRA
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400">
                    البيانات
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    قاعدة معرفة إسلامية
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* التبويبات الرئيسية */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  dashboard
                </span>
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  library_books
                </span>
                قاعدة المعرفة
              </TabsTrigger>
              <TabsTrigger value="training" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  model_training
                </span>
                التدريب
              </TabsTrigger>
              <TabsTrigger value="testing" className="font-amiri">
                <span className="material-symbols-outlined mr-2">quiz</span>
                الاختبار
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-amiri">
                <span className="material-symbols-outlined mr-2">
                  analytics
                </span>
                التحليلات
              </TabsTrigger>
            </TabsList>

            {/* نظرة عامة */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* إحصائيات النظام */}
                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">
                          analytics
                        </span>
                        إحصائيات النظام
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IslamicAIStats />

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">توزيع المصادر</h4>
                        {Object.entries(stats.typeDistribution || {}).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Badge className={getTypeColor(type)}>
                                  {getTypeLabel(type)}
                                </Badge>
                              </div>
                              <span className="text-sm font-medium">
                                {count as number}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* إعدادات النموذج */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">
                          tune
                        </span>
                        إعدادات النموذج
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Temperature: {modelConfig.temperature}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={modelConfig.temperature}
                          onChange={(e) =>
                            setModelConfig((prev) => ({
                              ...prev,
                              temperature: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Max Tokens: {modelConfig.maxTokens}
                        </label>
                        <input
                          type="range"
                          min="256"
                          max="2048"
                          step="256"
                          value={modelConfig.maxTokens}
                          onChange={(e) =>
                            setModelConfig((prev) => ({
                              ...prev,
                              maxTokens: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Top P: {modelConfig.topP}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={modelConfig.topP}
                          onChange={(e) =>
                            setModelConfig((prev) => ({
                              ...prev,
                              topP: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* واجهة الاختبار */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-amiri flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">
                          chat
                        </span>
                        اختبار النموذج مباشرة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <IslamicAIChat showTitle={false} maxHeight="500px" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* قاعدة المعرفة */}
            <TabsContent value="knowledge" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* إضافة مدخل جديد */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        add_circle
                      </span>
                      إضافة مدخل معرفي جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          نوع المصدر
                        </label>
                        <Select
                          value={newEntry.type}
                          onValueChange={(value: any) =>
                            setNewEntry((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quran">قرآن كريم</SelectItem>
                            <SelectItem value="hadith">حديث شريف</SelectItem>
                            <SelectItem value="seerah">سيرة نبوية</SelectItem>
                            <SelectItem value="fiqh">فقه</SelectItem>
                            <SelectItem value="aqidah">عقيدة</SelectItem>
                            <SelectItem value="akhlaq">أخلاق</SelectItem>
                            <SelectItem value="tafsir">تفسير</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">الفئة</label>
                        <Input
                          placeholder="مثال: عبادة، معاملات، آداب..."
                          value={newEntry.category}
                          onChange={(e) =>
                            setNewEntry((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">السؤال *</label>
                      <Textarea
                        placeholder="اكتب السؤال الذي سيتم الإجابة عليه..."
                        value={newEntry.question}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            question: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">الإجابة *</label>
                      <Textarea
                        placeholder="اكتب الإجابة الشرعية الموثوقة..."
                        value={newEntry.answer}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            answer: e.target.value,
                          }))
                        }
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">المصدر *</label>
                      <Input
                        placeholder="مثال: صحيح البخاري، تفسير ابن كثير..."
                        value={newEntry.source}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            source: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        الكلمات المفتاحية
                      </label>
                      <Input
                        placeholder="اكتب الكلمات مفصولة بفواصل..."
                        value={newEntry.keywords?.join(", ")}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            keywords: e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>

                    <Button
                      onClick={handleAddEntry}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <span className="material-symbols-outlined mr-2">
                        add
                      </span>
                      إضافة إلى قاعدة المعرفة
                    </Button>
                  </CardContent>
                </Card>

                {/* البحث في قاعدة المعرفة */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">
                        search
                      </span>
                      البحث في قاعدة المعرفة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="ابحث في قاعدة المعرفة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button onClick={handleSearch}>
                        <span className="material-symbols-outlined">
                          search
                        </span>
                      </Button>
                    </div>

                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(result.type)}>
                                {getTypeLabel(result.type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {result.category}
                              </span>
                            </div>
                            <h5 className="font-medium text-sm mb-1">
                              {result.question}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {result.answer}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                              📚 {result.source}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* التدريب */}
            <TabsContent value="training" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* إعداد التدريب */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">
                        model_training
                      </span>
                      إعداد التدريب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                        📚 تنسيق Instruction للتدريب
                      </h4>
                      <div className="text-sm text-blue-600 dark:text-blue-500 space-y-2">
                        <p>
                          <strong>Instruction:</strong> أجب على السؤال التالي
                          بناءً على المصادر الإسلامية
                        </p>
                        <p>
                          <strong>Input:</strong> ما حكم الصيام؟
                        </p>
                        <p>
                          <strong>Output:</strong> الصيام فرض عين على كل مسلم...
                          المصدر: القرآن الكريم
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">خيارات التصدير</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleExportTraining("json")}
                          variant="outline"
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <span className="material-symbols-outlined text-2xl mb-2">
                            download
                          </span>
                          <span>JSON Format</span>
                          <span className="text-xs text-gray-500">
                            للمعالجة المخصصة
                          </span>
                        </Button>

                        <Button
                          onClick={() => handleExportTraining("alpaca")}
                          variant="outline"
                          className="flex flex-col items-center p-4 h-auto"
                        >
                          <span className="material-symbols-outlined text-2xl mb-2">
                            download
                          </span>
                          <span>Alpaca Format</span>
                          <span className="text-xs text-gray-500">
                            لـ Fine-tuning
                          </span>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">أدوات التدريب المقترحة</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Axolotl + LoRA</div>
                            <div className="text-gray-500">
                              للتدريب السريع والفعال
                            </div>
                          </div>
                          <Badge>مُوصى</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">LangChain + RAG</div>
                            <div className="text-gray-500">
                              لربط النموذج بقاعدة البيانات
                            </div>
                          </div>
                          <Badge variant="outline">بديل</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">
                              Instructor Embedding
                            </div>
                            <div className="text-gray-500">
                              للبحث الدلالي المتقدم
                            </div>
                          </div>
                          <Badge variant="outline">إضافي</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* معاينة بيانات التدريب */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600">
                        preview
                      </span>
                      معاينة بيانات التدريب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {Object.entries(stats.typeDistribution || {}).map(
                          ([type, count]) => (
                            <div key={type} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className={getTypeColor(type)}>
                                  {getTypeLabel(type)}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {count as number} مدخل
                                </span>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
                                <div className="text-gray-600 dark:text-gray-400 mb-1">
                                  مثال:
                                </div>
                                <div className="space-y-1">
                                  <div>
                                    <strong>Instruction:</strong> أجب على السؤال
                                    التالي بناءً على المصادر الإسلامية
                                  </div>
                                  <div>
                                    <strong>Input:</strong> [سؤال من هذا النوع]
                                  </div>
                                  <div>
                                    <strong>Output:</strong> [إجابة موثوقة +
                                    المصدر]
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* الاختبار */}
            <TabsContent value="testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">
                      quiz
                    </span>
                    اختبار شامل للنموذج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IslamicAIChat maxHeight="600px" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* التحليلات */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* إحصائيات الاستخدام */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">
                        trending_up
                      </span>
                      إحصائيات الاستخدام
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {conversations.length}
                          </div>
                          <div className="text-sm text-blue-700">
                            محادثة محفوظة
                          </div>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600">
                            {conversations.reduce(
                              (acc, conv) =>
                                acc + (conv.userMessage?.length || 0),
                              0,
                            )}
                          </div>
                          <div className="text-sm text-emerald-700">
                            حرف مُستفسر
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3">آخر المحادثات</h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {conversations.slice(0, 10).map((conv, i) => (
                              <div
                                key={i}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                              >
                                <div className="font-medium mb-1 line-clamp-1">
                                  {conv.userMessage}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(conv.timestamp).toLocaleString(
                                    "ar-SA",
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* تقييم جودة الإجابات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-amiri flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600">
                        star
                      </span>
                      تقييم جودة الإجابات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">دقة المحتوى الشرعي</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-amber-400"
                            >
                              star
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 mr-2">
                            4.8/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">مصداقية المصادر</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-amber-400"
                            >
                              star
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 mr-2">
                            4.9/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">وضوح الإجابة</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-amber-400"
                            >
                              star
                            </span>
                          ))}
                          <span className="material-symbols-outlined text-gray-300">
                            star
                          </span>
                          <span className="text-sm text-gray-500 mr-2">
                            4.2/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">سرعة الاستجابة</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-amber-400"
                            >
                              star
                            </span>
                          ))}
                          <span className="text-sm text-gray-500 mr-2">
                            4.7/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">
                        4.7/5
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-400">
                        التقييم العام
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        بناءً على تقييم الخبراء
                      </div>
                    </div>
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
