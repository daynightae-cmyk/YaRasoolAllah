import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import {
  Send,
  Mic,
  RefreshCw,
  BookOpen,
  Users,
  Clock,
  Star,
  Brain,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Heart,
  Shield,
  Search,
  Copy,
  ThumbsUp,
  Bot,
  User,
  Zap,
  Moon,
  Settings,
  MoreHorizontal,
  ArrowLeft,
  Phone,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
}

export default function AlMuftiAlMubeenPage() {
  const { t, direction } = useLanguage();
  const { mode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample initial message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      content:
        "السلام عليكم ورحمة الله وبركاته 🌟\n\nأهلاً بك في المفتي المبين! أنا مساعدك الذكي للفتاوى الإسلامية.\n\nيمكنني مساعدتك في:\n• الفتاوى الشرعية المعتمدة\n• أحكام العبادات والمعاملات\n• التفسير والحديث\n• الأسئلة الفقهية\n\nكيف يمكنني مساعدتك اليوم؟",
      isUser: false,
      timestamp: new Date(),
      sources: ["القرآن الكريم", "السنة النبوية", "أقوال العلماء المعتبرين"],
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date(),
        sources: ["القرآن الكريم", "صحيح البخاري", "فتاوى اللجنة الدائمة"],
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const getAIResponse = (question: string): string => {
    const responses = [
      `بارك الله فيك على سؤالك الطيب.\n\nبناءً على الأدلة الشرعية المعتمدة:\n\n🔹 من القرآن الكريم: "وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ"\n\n🔹 من السنة النبوية: قال النبي ﷺ: "إنما الأعمال بالنيات"\n\n🔹 قول العلماء: أجمع أهل العلم على أن...\n\nوالله أعلم.`,
      `جزاك الله خيراً على حرصك على معرفة الحكم الشرعي.\n\nالراجح في هذه المسألة:\n\n✅ يجوز ذلك إذا توفرت الشروط التالية:\n• الشرط الأول\n• الشرط الثاني\n• الشرط الثالث\n\n📚 المراجع: كتاب الفقه الإسلامي وأدلته\n\nوالله تعالى أعلم.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickQuestions = [
    "ما حكم الصلاة في الطائرة؟",
    "كيفية الوضوء الصحيح؟",
    "أحكام الزكاة",
    "شروط الحج والعمرة",
  ];

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 flex flex-col",
        mode === "heaven" ? "bg-slate-900" : "bg-gray-50",
      )}
      dir={direction}
    >
      {/* Header - مطابق للمراجع */}
      <div
        className={cn(
          "border-b px-4 py-3",
          mode === "heaven"
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="icon-ref w-10 h-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="icon-ref icon-ref-lime w-12 h-12">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-cairo font-bold">المفتي المبين</h1>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--ref-lime-bright)" }}
                ></div>
                <span
                  className="text-sm font-tajawal"
                  style={{ color: "var(--ref-lime-bright)" }}
                >
                  متصل الآن
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="icon-ref w-10 h-10">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="icon-ref w-10 h-10">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="icon-ref w-10 h-10">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-slide-up",
              message.isUser ? "justify-end" : "justify-start",
            )}
          >
            {/* Avatar */}
            {!message.isUser && (
              <div className="icon-ref icon-ref-lime w-8 h-8 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Message */}
            <div
              className={cn(
                "max-w-[80%] p-4 rounded-3xl",
                message.isUser ? "rounded-br-lg" : "rounded-bl-lg",
              )}
              style={{
                backgroundColor: message.isUser
                  ? "var(--ref-lime-bright)"
                  : mode === "heaven"
                    ? "var(--ref-dark-card)"
                    : "white",
                color: message.isUser
                  ? "var(--ref-dark-bg)"
                  : mode === "heaven"
                    ? "var(--ref-text-white)"
                    : "var(--ref-dark-bg)",
                border:
                  mode === "heaven" && !message.isUser
                    ? "1px solid var(--ref-dark-border)"
                    : message.isUser
                      ? "none"
                      : "1px solid #e2e8f0",
              }}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap font-tajawal leading-relaxed text-sm">
                {message.content}
              </div>

              {/* Sources */}
              {message.sources && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs font-medium opacity-70 mb-2 font-cairo">
                    المراجع:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-black/10 rounded-full font-tajawal"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Time */}
              <p className="text-xs opacity-60 mt-2 font-tajawal">
                {message.timestamp.toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* User Avatar */}
            {message.isUser && (
              <div className="icon-ref icon-ref-blue w-8 h-8 flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Message */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-slide-up">
            <div className="icon-ref icon-ref-lime w-8 h-8 flex-shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="p-4 rounded-3xl rounded-bl-lg border max-w-[80%]"
              style={{
                backgroundColor:
                  mode === "heaven" ? "var(--ref-dark-card)" : "white",
                color:
                  mode === "heaven"
                    ? "var(--ref-text-white)"
                    : "var(--ref-dark-bg)",
                border:
                  mode === "heaven"
                    ? "1px solid var(--ref-dark-border)"
                    : "1px solid #e2e8f0",
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: "var(--ref-lime-bright)" }}
                />
                <span className="text-sm font-tajawal">
                  المفتي المبين يفكر...
                </span>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--ref-lime-bright)" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--ref-lime-bright)",
                      animationDelay: "0.1s",
                    }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--ref-lime-bright)",
                      animationDelay: "0.2s",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div
        className="p-4 border-t"
        style={{
          borderColor: mode === "heaven" ? "var(--ref-dark-border)" : "#e2e8f0",
        }}
      >
        <h4 className="text-sm font-semibold font-cairo mb-3">أسئلة سريعة:</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickQuestions.slice(0, 2).map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              className="card-ref hover:scale-[1.02] transition-all duration-300 text-right p-3 flex items-center gap-3"
            >
              <MessageCircle
                className="w-4 h-4"
                style={{ color: "var(--ref-lime-bright)" }}
              />
              <span className="font-tajawal text-sm flex-1">{question}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area - مطابق للمراجع */}
      <div
        className={cn(
          "p-4 border-t",
          mode === "heaven"
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="input-ref pr-12"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-xl"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-ref btn-ref-primary w-12 h-12 rounded-2xl p-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
