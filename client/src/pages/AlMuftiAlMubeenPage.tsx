import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { BRAND } from "@/config/brand";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import { INITIAL_VERIFIED_HADITHS } from "@/data/hadithData";
import { WHO_IS_MUHAMMAD_CHAPTERS } from "@/data/whoIsMuhammadData";
import booksData from "@/data/books.json";
import {
  Send,
  BookOpen,
  Search,
  Bot,
  User,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass,
  Library,
  Feather,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoveryMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: {
    title: string;
    wing: string;
    reference: string;
    link?: string;
  }[];
}

export default function AlMuftiAlMubeenPage() {
  const { direction } = useLanguage();
  const { mode } = useTheme();
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: DiscoveryMessage = {
      id: "welcome-1",
      content:
        "أهلاً بك في المساعد المعرفي لاستكشاف مصادر السيرة والسنة والقرآن الكريم.\n\nأنا أداة استكشاف وتوثيق، أساعدك في العثور على النصوص والمصادر الموثقة داخل صرح «يا رسول الله ﷺ».\n\nتنويه شرعي ملزم:\nهذه الأداة للمساعدة في استكشاف المصادر وتوثيقها، ولا تصدر فتاوى شرعية على الإطلاق. للأحكام الفقهية يُرجى الرجوع للعلماء المختصين والمجامع الفقهية المعتمدة.",
      isUser: false,
      timestamp: new Date(),
      sources: [
        {
          title: "وثائق السيرة النبوية المحققة",
          wing: "درب السيرة",
          reference: "فصول السيرة النبوية الـ 12",
          link: "/who-is-muhammad",
        },
        {
          title: "الكتب الستة الجامعة",
          wing: "دار الحديث",
          reference: "صحيح البخاري وصحيح مسلم",
          link: "/sunnah",
        },
      ],
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    const q = inputMessage.trim();
    if (!q) return;

    const userMessage: DiscoveryMessage = {
      id: Date.now().toString(),
      content: q,
      isUser: true,
      timestamp: new Date(),
    };

    // Perform genuine discovery across our actual data index
    const lowerQ = q.toLowerCase();
    const matchedHadiths = INITIAL_VERIFIED_HADITHS.filter(
      (h) =>
        h.textAr.includes(lowerQ) ||
        h.narratorAr.includes(lowerQ) ||
        h.bookNameAr.includes(lowerQ) ||
        h.relatedSeerahTopic?.includes(lowerQ),
    );

    const matchedSeerah = WHO_IS_MUHAMMAD_CHAPTERS.filter(
      (c) =>
        c.titleAr.includes(lowerQ) ||
        c.summaryAr.includes(lowerQ) ||
        c.historicalContextAr.includes(lowerQ),
    );

    const matchedBooks = (booksData.books || []).filter(
      (b: any) =>
        b.title.toLowerCase().includes(lowerQ) ||
        b.author.toLowerCase().includes(lowerQ) ||
        b.description.toLowerCase().includes(lowerQ),
    ).slice(0, 2);

    let answerText = "";
    const matchedSources: { title: string; wing: string; reference: string; link?: string }[] = [];

    if (matchedHadiths.length > 0 || matchedSeerah.length > 0 || matchedBooks.length > 0) {
      answerText = `نتائج الاستكشاف والتوثيق لمصطلح «${q}» داخل مصادر الصرح:\n\n`;

      if (matchedSeerah.length > 0) {
        answerText += `🔹 في السيرة النبوية:\n`;
        matchedSeerah.forEach((s) => {
          answerText += `• ${s.titleAr}: ${s.summaryAr.slice(0, 140)}...\n`;
          matchedSources.push({
            title: s.titleAr,
            wing: "درب السيرة",
            reference: `الفصل رقم ${s.order} — ${s.subtitleAr}`,
            link: `/who-is-muhammad/${s.id}`,
          });
        });
        answerText += `\n`;
      }

      if (matchedHadiths.length > 0) {
        answerText += `🔹 في المرويات المسندة:\n`;
        matchedHadiths.forEach((h) => {
          answerText += `• ${h.textAr}\n(الراوي: ${h.narratorAr} — التخريج: ${h.gradeSource})\n`;
          matchedSources.push({
            title: `${h.bookNameAr} — ${h.chapterNameAr}`,
            wing: "دار الحديث",
            reference: `${h.gradeSource} (درجة: ${h.gradeAr})`,
            link: "/sunnah",
          });
        });
        answerText += `\n`;
      }

      if (matchedBooks.length > 0) {
        answerText += `🔹 في المراجع والمكتبة:\n`;
        matchedBooks.forEach((b: any) => {
          answerText += `• كتاب: ${b.title} للمؤلف ${b.author}\n`;
          matchedSources.push({
            title: b.title,
            wing: "المكتبة الرقمية",
            reference: `${b.author} (${b.publishedYear}م)`,
            link: "/digital-library",
          });
        });
      }
    } else {
      answerText = `تم فحص مصادر السيرة والسنّة والكتب للبحث عن «${q}».\n\nلم نعثر على تطابق مباشر بهذه الصياغة المحددة في الفهرس الحالي. يمكنك استعراض الفصول الكاملة من درب السيرة، أو البحث في دواوين الحديث الستة، أو مراجعة فهرس المصادر الرقمية.`;
      matchedSources.push(
        {
          title: "فهرس فصول السيرة الشريفة",
          wing: "درب السيرة",
          reference: "رحلة من هو محمد ﷺ في 12 محطة",
          link: "/who-is-muhammad",
        },
        {
          title: "دواوين الحديث النبوي",
          wing: "دار الحديث",
          reference: "صحيحا البخاري ومسلم والسنن",
          link: "/sunnah",
        },
      );
    }

    const assistantMessage: DiscoveryMessage = {
      id: (Date.now() + 1).toString(),
      content: answerText,
      isUser: false,
      timestamp: new Date(),
      sources: matchedSources,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputMessage("");
  };

  const quickTopics = [
    "الأمانة والصدق قبل البعثة",
    "الرحمة بالناس والرفق بالحيوان",
    "ميثاق حلف الفضول",
    "حديث إنما الأعمال بالنيات",
  ];

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-all duration-200",
        mode === "heaven" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
      )}
      dir={direction}
    >
      {/* Header */}
      <header className="border-b px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-amiri font-bold text-foreground">
                  المساعد المعرفي لاستكشاف المصادر
                </h1>
                <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
                  استكشاف وتوثيق
                </Badge>
              </div>
              <p className="text-[11px] font-tajawal text-muted-foreground">
                بحث دلالي ومفهرس في وثائق السيرة، دواوين الحديث، والكتب المعتمدة
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mandatory Scholarly Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs font-cairo text-amber-900 dark:text-amber-200">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {BRAND.scholarlyDisclaimer.ar}
          </span>
        </div>
      </div>

      {/* Chat Conversation Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.isUser ? "justify-end" : "justify-start")}
          >
            {!msg.isUser && (
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={cn(
                "max-w-2xl rounded-2xl p-4 text-sm font-cairo leading-relaxed space-y-3",
                msg.isUser
                  ? "bg-emerald-700 text-white rounded-tr-xs"
                  : "bg-white dark:bg-slate-900 border border-border shadow-xs rounded-tl-xs",
              )}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>المصادر والوثائق المحالة:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground truncate">{s.title}</span>
                          <Badge variant="outline" className="text-[9px]">
                            {s.wing}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{s.reference}</p>
                        {s.link && (
                          <Link href={s.link} className="inline-block text-[11px] text-cyan-700 dark:text-cyan-400 hover:underline pt-0.5">
                            فتح في الرواق ←
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground text-left font-mono">
                {msg.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {msg.isUser && (
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="border-t bg-white dark:bg-slate-900 border-border p-4 sticky bottom-0 z-20">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Quick topic buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-cairo">
            <span className="text-muted-foreground text-[11px]">مقترحات استكشاف:</span>
            {quickTopics.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputMessage(topic)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-muted-foreground hover:text-cyan-700 dark:hover:text-cyan-300 text-xs transition-colors border border-transparent hover:border-cyan-500/30"
              >
                {topic}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب عبارة أو حدثاً من السيرة أو موضوعاً لاستكشاف مصادره..."
              className="font-cairo text-sm h-12 rounded-xl"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim()}
              className="h-12 px-5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-cairo gap-2 shrink-0"
            >
              <span>استكشاف</span>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </footer>

      <EvidenceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
      />
    </div>
  );
}
