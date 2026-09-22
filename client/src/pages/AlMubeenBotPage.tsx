import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { geminiService } from "../services/geminiService";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface QuickQuestion {
  id: string;
  question: string;
  category: string;
  icon: string;
}

export default function AlMubeenBotPage() {
  const { updateLastVisited } = useProgress();
  const { direction } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateLastVisited("/ai-assistant");
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      content: `السلام عليكم ورحمة الله وبركاته! 🌟

أهلاً وسهلاً بك في المساعد الإسلامي الذكي. أنا هنا لمساعدتك في الإجابة على أسئلتك الإسلامية.

يمكنني مساعدتك في:
• أسئلة عن القرآن الكريم والتفسير
• أحكام الفقه الإسلامي
• السيرة النبوية الشريفة
• الأدعية والأذكار
• الأخلاق والآداب الإسلامية
• أحكام العبادات

اطرح سؤالك وسأحاول الإجابة عليه بإذن الله، مع ذكر المصادر الموثوقة.`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [updateLastVisited]);

  const quickQuestions: QuickQuestion[] = [
    {
      id: "prayer-times",
      question: "كيف أحافظ على الصلاة في وقتها؟",
      category: "عبادات",
      icon: "schedule"
    },
    {
      id: "quran-reading",
      question: "كيف أختم القرآن في شهر؟",
      category: "قرآن",
      icon: "menu_book"
    },
    {
      id: "zakat",
      question: "كيف أحسب زكاة مالي؟",
      category: "فقه",
      icon: "calculate"
    },
    {
      id: "hijab",
      question: "ما حكم الحجاب في الإسلام؟",
      category: "أحكام",
      icon: "female"
    },
    {
      id: "dua",
      question: "ما هي آداب الدعاء؟",
      category: "أدعية",
      icon: "favorite"
    },
    {
      id: "ramadan",
      question: "كيف أستعد لشهر رمضان؟",
      category: "صوم",
      icon: "nights_stay"
    }
  ];

  const handleSendMessage = async (question?: string) => {
    const messageText = question || currentQuestion.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: Date.now().toString() + "_loading",
      content: "جاري البحث عن الإجابة...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await geminiService.askQuestion(messageText);
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const botMessage: ChatMessage = {
          id: Date.now().toString() + "_bot",
          content: response.response,
          isUser: false,
          timestamp: new Date()
        };
        return [...filtered, botMessage];
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Remove loading message and add error response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: Date.now().toString() + "_error",
          content: `عذراً، حدث خطأ أثناء البحث عن الإجابة. يرجى المحاولة مرة أخرى.

في هذه الأثناء، يمكنك:
• مراجعة القرآن الكريم والتفسير
• قراءة الأذكار اليومية
• مطالعة السيرة النبوية
• التواصل مع علماء أهل الثقة`,
          isUser: false,
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">psychology</span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">المساعد الإسلامي الذكي</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            المُبين بوت 🤖
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            اسأل عن أي موضوع إسلامي واحصل على إجابات دقيقة من مصادر موثوقة
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-10 h-10 gradient-emerald rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <div>
                  <h3 className="font-amiri text-lg">المُبين بوت</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">متصل ومستعد للمساعدة</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-gray-600"
              >
                <span className="material-symbols-outlined mr-2 rtl:ml-2">refresh</span>
                محادثة جديدة
              </Button>
            </CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.isUser
                          ? "bg-emerald-600 text-white"
                          : message.isLoading
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                          <span className="font-inter">{message.content}</span>
                        </div>
                      ) : (
                        <div className="font-amiri leading-relaxed whitespace-pre-line">
                          {message.content}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 opacity-70 ${message.isUser ? "text-emerald-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Input
                placeholder="اكتب سؤالك الإسلامي هنا..."
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className={`flex-1 ${direction === "rtl" ? "text-right" : "text-left"}`}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!currentQuestion.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined">send</span>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Questions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-amiri">أسئلة سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickQuestions.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  onClick={() => handleQuickQuestion(item.question)}
                  disabled={isLoading}
                  className="h-auto p-4 text-right justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse w-full">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
                      {item.icon}
                    </span>
                    <div className="flex-1 text-right">
                      <p className="font-amiri text-sm font-medium text-gray-900 dark:text-white">
                        {item.question}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-4">
              إرشادات الاستخدام
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-amiri font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                  ✅ يمكنني مساعدتك في:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 font-inter">
                  <li>• أسئلة عن القرآن والتفسير</li>
                  <li>• أحكام الفقه الإسلامي</li>
                  <li>• السيرة النبوية</li>
                  <li>• الأدعية والأذكار</li>
                  <li>• الأخلاق الإسلامية</li>
                </ul>
              </div>
              <div>
                <h4 className="font-amiri font-bold text-red-700 dark:text-red-400 mb-2">
                  ⚠️ تنبيه مهم:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 font-inter">
                  <li>• استشر علماء موثوقين للفتاوى المهمة</li>
                  <li>• تأكد من المصادر للقرارات الدينية</li>
                  <li>• هذا مساعد تعليمي وليس مفتياً</li>
                  <li>• اطلب المشورة في الأمور الخاصة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
