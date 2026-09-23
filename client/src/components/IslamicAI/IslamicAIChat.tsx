import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useIslamicAI,
  AIResponse,
  IslamicKnowledgeEntry,
} from "@/services/islamicAI";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  response?: AIResponse;
  isTyping?: boolean;
}

interface IslamicAIChatProps {
  className?: string;
  showTitle?: boolean;
  maxHeight?: string;
}

export default function IslamicAIChat({
  className,
  showTitle = true,
  maxHeight = "600px",
}: IslamicAIChatProps) {
  const { isRTL } = useLanguage();
  const { generateResponse, getStats } = useIslamicAI();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showSources, setShowSources] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // تحميل الإحصائيات
    setStats(getStats());

    // رسالة ترحيب
    const welcomeMessage: ChatMessage = {
      id: "0",
      type: "ai",
      content:
        "السلام عليكم ورحمة الله وبركاته 🌟\n\nأهلاً وسهلاً بك في المُبين بوت - مساعدك الذكي للعلوم الشرعية والمعرفة الإسلامية.\n\nيمكنني مساعدتك في:\n• تفسير الآيات القرآنية\n• شرح الأحاديث النبوية\n• أحداث السيرة ال��بوية\n• المسائل الفقهية\n• العقيدة الإسلامية\n• الأخلاق والآداب\n\nما الذي تود معرفته؟",
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // التمرير للأسفل عند إضافة رسائل جديدة
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // إضافة رسالة "يكتب..."
    const typingMessage: ChatMessage = {
      id: "typing",
      type: "ai",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await generateResponse(userMessage.content);

      // إزالة رسالة "يكتب..."
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.answer,
        timestamp: new Date(),
        response,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // حفظ المحادثة
      saveConversation(userMessage, aiMessage);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== "typing"));

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "أعتذر، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.\n\nإذا استمرت المشكلة، تواصل مع إدارة التطبيق.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const saveConversation = (userMsg: ChatMessage, aiMsg: ChatMessage) => {
    try {
      const conversations = JSON.parse(
        localStorage.getItem("islamic-ai-conversations") || "[]",
      );
      conversations.unshift({
        id: Date.now(),
        userMessage: userMsg.content,
        aiResponse: aiMsg.content,
        sources: aiMsg.response?.sources || [],
        timestamp: new Date().toISOString(),
      });

      // احتفظ بآخر 100 محادثة
      localStorage.setItem(
        "islamic-ai-conversations",
        JSON.stringify(conversations.slice(0, 100)),
      );
    } catch (error) {
      console.error("خطأ في حفظ المحادثة:", error);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleFollowUp = (question: string) => {
    setInput(question);
    handleSendMessage();
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.isTyping) {
      return (
        <div
          className={cn("flex gap-3", isRTL ? "flex-row-reverse" : "flex-row")}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-sm">
              smart_toy
            </span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 max-w-[80%]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 mr-2">
                المُبين يفكر...
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 mb-4",
          message.type === "user"
            ? isRTL
              ? "flex-row"
              : "flex-row-reverse"
            : isRTL
              ? "flex-row-reverse"
              : "flex-row",
        )}
      >
        {/* الأفاتار */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            message.type === "user"
              ? "bg-gradient-to-br from-blue-500 to-purple-600"
              : "bg-gradient-to-br from-emerald-500 to-blue-600",
          )}
        >
          <span className="material-symbols-outlined text-white text-sm">
            {message.type === "user" ? "person" : "smart_toy"}
          </span>
        </div>

        {/* محتوى الرسالة */}
        <div
          className={cn(
            "max-w-[80%]",
            message.type === "user" ? "text-right" : "text-right",
          )}
        >
          <div
            className={cn(
              "rounded-2xl p-4",
              message.type === "user"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            )}
          >
            <div className="prose prose-sm max-w-none">
              {message.content.split("\n").map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    "mb-2 last:mb-0 leading-relaxed",
                    message.type === "user"
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-200",
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* معلومات إضافية للإجابات */}
          {message.response && (
            <div className="mt-3 space-y-2">
              {/* مستوى الثقة: يعرض حالته الحقيقية، بلا شارة تحقق موهومة */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {message.response.confidence > 0
                    ? `مستوى الثقة: ${Math.round(message.response.confidence * 100)}%`
                    : "لا توجد إجابة مولدة موثقة — راجع المصادر أدناه"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {message.response.type === "direct"
                    ? "مصادر مباشرة"
                    : message.response.type === "general"
                      ? "فهرس محلي فقط"
                      : "استنتاج"}
                </Badge>
              </div>

              {/* التحذيرات */}
              {message.response.warnings &&
                message.response.warnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm">
                        warning
                      </span>
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                        تنبيه مهم
                      </span>
                    </div>
                    {message.response.warnings.map((warning, i) => (
                      <p
                        key={i}
                        className="text-sm text-amber-700 dark:text-amber-400"
                      >
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}

              {/* المصادر */}
              {message.response.sources.length > 0 && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowSources(
                        showSources === message.id ? null : message.id,
                      )
                    }
                    className="text-xs"
                  >
                    <span className="material-symbols-outlined mr-1 text-sm">
                      library_books
                    </span>
                    عرض المصادر ({message.response.sources.length})
                  </Button>

                  <AnimatePresence>
                    {showSources === message.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {message.response.sources.map((source, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSourceColor(source.type)}>
                                {getSourceLabel(source.type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {source.category}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">
                              {source.question}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {source.answer}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                              📚 {source.source}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* أسئلة المتابعة */}
              {message.response.followUpQuestions &&
                message.response.followUpQuestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      أسئلة مقترحة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.response.followUpQuestions.map((question, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollowUp(question)}
                          className="text-xs h-8"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* وقت الرسالة */}
          <p className="text-xs text-gray-400 mt-2">
            {message.timestamp.toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </motion.div>
    );
  };

  const getSourceColor = (type: string) => {
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

  const getSourceLabel = (type: string) => {
    const labels = {
      quran: "قرآن كريم",
      hadith: "حديث شريف",
      seerah: "سيرة نبوية",
      fiqh: "فقه",
      aqidah: "عقيدة",
      akhlaq: "أخ��اق",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const quickQuestions = [
    "ما فضل قراءة سورة الفاتحة؟",
    "كيف أقوي علاقتي بالله؟",
    "ما شروط الصيام؟",
    "أخبرني عن غزوة بدر",
    "ما حكم التجارة في الإسلام؟",
    "كيف أتعامل مع الغضب؟",
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showTitle && (
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
          <CardTitle className="font-amiri flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">
                psychology
              </span>
            </div>
            <div>
              <h3 className="text-xl">المُبين بوت - الذكاء الإسلامي</h3>
              <p className="text-white/90 text-sm font-inter">
                مدرب على {stats.totalEntries || 0} مدخل من المصادر الموثوقة
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* منطقة المحادثة */}
        <ScrollArea style={{ height: maxHeight }} className="p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>{renderMessage(message)}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* الأسئلة السريعة */}
        {messages.length <= 1 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              أسئلة سريعة للبدء:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.slice(0, 4).map((question, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs h-auto p-2 text-right justify-start"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* منطقة الإدخال */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="اسأل عن أي شيء في الدين الإسلامي..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className={cn("flex-1 text-right", isRTL && "text-right")}
              disabled={isLoading}
              dir="rtl"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <span className="material-symbols-outlined">send</span>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 نصيحة: كن محدداً في سؤالك للحصول على إجابة أفضل</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-emerald-600">
                verified
              </span>
              <span>مصادر موثوقة</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// إحصائيات النظام
export function IslamicAIStats() {
  const { getStats } = useIslamicAI();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-emerald-600">
          {stats.totalEntries || 0}
        </div>
        <div className="text-sm text-gray-600">مدخل معرفي</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {Object.keys(stats.typeDistribution || {}).length}
        </div>
        <div className="text-sm text-gray-600">نوع مصدر</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {Object.keys(stats.categoryDistribution || {}).length}
        </div>
        <div className="text-sm text-gray-600">فئة علمية</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-amber-600">
          {stats.isModelLoaded ? "✅" : "⚠️"}
        </div>
        <div className="text-sm text-gray-600">حالة النموذج</div>
      </Card>
    </div>
  );
}
