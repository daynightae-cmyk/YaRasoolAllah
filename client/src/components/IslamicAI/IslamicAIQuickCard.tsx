import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIslamicAI } from "@/services/islamicAI";
import { cn } from "@/lib/utils";

interface IslamicAIQuickCardProps {
  className?: string;
}

export default function IslamicAIQuickCard({
  className,
}: IslamicAIQuickCardProps) {
  const { isRTL } = useLanguage();
  const { getStats, generateResponse } = useIslamicAI();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setStats(getStats());
  }, []);

  const handleQuickQuestion = async (q: string) => {
    setQuestion(q);
    setIsLoading(true);
    setShowDemo(true);

    try {
      const response = await generateResponse(q);
      setAnswer(response.answer.substring(0, 200) + "...");
    } catch (error) {
      setAnswer("حدث خطأ في النظام، جرب مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "ما فضل سورة الفاتحة؟",
    "كيف أتوب إلى الله؟",
    "ما أركان الصلاة؟",
    "أخبرني عن رمضان",
  ];

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]",
        "bg-gradient-to-br from-white via-emerald-50 to-blue-50 dark:from-gray-800 dark:via-emerald-900/20 dark:to-blue-900/20",
        className,
      )}
    >
      <CardContent className="p-6 relative">
        {/* خلفية مُتحركة */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-xl animate-float-delayed"></div>
        </div>

        <div className="relative space-y-6">
          {/* الهيدر */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-white text-xl">
                  psychology
                </span>
              </div>
              <div>
                <h3 className="text-xl font-amiri font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  الذكاء الإسلامي Phi-3
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  نموذج مخصص للعلوم الشرعية
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className="bg-green-500 text-white animate-bounce">
                🆓 مجاني
              </Badge>
              <Badge variant="outline" className="text-xs">
                Microsoft Licensed
              </Badge>
            </div>
          </div>

          {/* المميزات الرئيسية */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <span className="material-symbols-outlined text-emerald-600">
                verified
              </span>
              <span>مصادر موثوقة</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <span className="material-symbols-outlined text-blue-600">
                speed
              </span>
              <span>إجابات سريعة</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <span className="material-symbols-outlined text-purple-600">
                library_books
              </span>
              <span>{stats.totalEntries || 0} مدخل معرفي</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
              <span className="material-symbols-outlined text-amber-600">
                model_training
              </span>
              <span>تدريب مخصص</span>
            </div>
          </div>

          {/* التجربة السريعة */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
            <h4 className="font-amiri font-semibold text-emerald-700 dark:text-emerald-400 mb-3 text-center">
              🤖 جرب الآن - اسأل أي سؤال شرعي
            </h4>

            {!showDemo ? (
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs h-auto p-2 text-right justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* السؤال */}
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-blue-600 text-sm">
                        person
                      </span>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        سؤالك:
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {question}
                    </p>
                  </div>

                  {/* الإجابة */}
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-emerald-600 text-sm">
                        smart_toy
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        المُبين بوت:
                      </span>
                    </div>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span className="text-xs text-emerald-600">
                          يفكر...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {answer}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDemo(false)}
                    className="w-full text-xs"
                  >
                    جرب سؤال آخر
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* التقنيات المستخدمة */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4">
            <h4 className="font-amiri font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              ⚡ تقنيات متقدمة
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold text-blue-700 dark:text-blue-400">
                  Phi-3 Mini
                </div>
                <div className="text-blue-600 dark:text-blue-500">
                  Microsoft
                </div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Fine-tuning
                </div>
                <div className="text-emerald-600 dark:text-emerald-500">
                  + LoRA
                </div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="font-semibold text-purple-700 dark:text-purple-400">
                  RAG
                </div>
                <div className="text-purple-600 dark:text-purple-500">
                  Vector DB
                </div>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-emerald-600">
                {stats.totalEntries || 0}
              </div>
              <div className="text-xs text-gray-500">مدخل معرفي</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">7</div>
              <div className="text-xs text-gray-500">علوم شرعية</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">∞</div>
              <div className="text-xs text-gray-500">أسئلة ممكنة</div>
            </div>
          </div>

          {/* الأزرار الرئيسية */}
          <div className="flex gap-3">
            <Link href="/islamic-ai-management" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white">
                <span className="material-symbols-outlined mr-2">
                  dashboard
                </span>
                إدارة النموذج
              </Button>
            </Link>

            <Link href="/al-mufti-al-mubeen">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <span className="material-symbols-outlined">chat</span>
              </Button>
            </Link>
          </div>

          {/* شارة الجودة */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full px-4 py-2 border border-amber-200 dark:border-amber-700">
              <span className="material-symbols-outlined text-amber-600 text-sm">
                verified
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                مُراجع من قِبل علماء معتمدين
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// مكون مصغر للاستخدام في الشريط الجانبي
export function IslamicAIMiniCard({ className }: { className?: string }) {
  const { getStats } = useIslamicAI();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <Card
      className={cn(
        "p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            psychology
          </span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            AI إسلامي
          </span>
          <Badge className="bg-green-500 text-white text-xs">مجاني</Badge>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          نموذج Phi-3 مخصص للأسئلة الشرعية مع {stats.totalEntries || 0} مدخل
          معرفي موثوق
        </p>

        <div className="flex items-center justify-between">
          <Link href="/islamic-ai-management">
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
              إدارة النموذج
            </Button>
          </Link>
          <Link href="/al-mufti-al-mubeen">
            <Button size="sm" className="h-6 px-2 text-xs bg-emerald-600">
              جرب الآن
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
