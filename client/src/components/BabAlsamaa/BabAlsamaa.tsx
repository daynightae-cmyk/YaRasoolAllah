import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpiritualResponse {
  dua: string;
  verse?: string;
  story?: string;
  audio?: string;
  source: string;
  mood: string;
}

interface BabAlsamaaProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredBy?: "auto" | "manual" | "notification";
}

export default function BabAlsamaa({
  isOpen,
  onClose,
  triggeredBy = "manual",
}: BabAlsamaaProps) {
  const { t, isRTL } = useLanguage();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<SpiritualResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const detectMood = (text: string): string => {
    const sadWords = ["حزين", "تايه", "مكتئب", "زعلان", "متضايق", "حزن", "ضيق"];
    const happyWords = ["فرحان", "سعيد", "مبسوط", "شكر", "الحمد"];
    const confusedWords = ["تايه", "محتار", "ضايع", "مش عارف", "حيران"];
    const fearWords = ["خايف", "قلقان", "متوتر", "خوف", "قلق"];
    const hopeWords = ["ربنا", "الله", "دعاء", "استغفار", "توبة"];

    const lowerText = text.toLowerCase();

    if (sadWords.some((word) => lowerText.includes(word))) return "sad";
    if (fearWords.some((word) => lowerText.includes(word))) return "fear";
    if (confusedWords.some((word) => lowerText.includes(word)))
      return "confused";
    if (happyWords.some((word) => lowerText.includes(word))) return "happy";
    if (hopeWords.some((word) => lowerText.includes(word))) return "hopeful";

    return "general";
  };

  const generateSpiritualResponse = async (
    userMessage: string,
    detectedMood: string,
  ): Promise<SpiritualResponse> => {
    // محاكاة استجابة الذكاء الاصطناعي الروحاني
    const responses = {
      sad: {
        dua: "اللهم اكشف عني البلاء والحزن، وأذهب عني الهم والغم، واشرح لي صدري ويسر لي أمري",
        verse:
          "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
        story:
          "قال النبي ﷺ: 'ما أصاب المسلم من نصب ولا و��ب ولا هم ولا حزن ولا أذى ولا غم، حتى الشوكة يشاكها، إلا كفر الله بها من خطاياه'",
        audio: "/audio/dua-sadness.mp3",
        source: "صحيح البخاري",
        mood: "محزون",
      },
      fear: {
        dua: "اللهم أنت ربي لا إله إلا أنت، عليك توكلت وأنت رب العرش العظيم، ما شاء الله كان وما لم يشأ لم يكن",
        verse:
          "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        story:
          "كان النبي ﷺ إذا خاف قوماً قال: 'اللهم إنا نجعلك في نحورهم ونعوذ بك من شرورهم'",
        audio: "/audio/dua-fear.mp3",
        source: "سورة الرعد",
        mood: "خائف",
      },
      confused: {
        dua: "اللهم اهدني فيمن هديت، وقني شر ما قضيت، وبارك لي فيما أعطيت",
        verse:
          "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
        story:
          "دعا موسى عليه ا��سلام: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي' فاستجاب الله له",
        audio: "/audio/dua-guidance.mp3",
        source: "سورة البقرة",
        mood: "محتار",
      },
      happy: {
        dua: "الحمد لله الذي بنعمته تتم الصالحات، وله الشكر على ما أنعم وتفضل",
        verse: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
        story:
          "قال النبي ﷺ: 'من لم يشكر الناس لم يشكر الله'، فالشكر سبب لزيادة النعم",
        audio: "/audio/dua-gratitude.mp3",
        source: "سورة إبراهيم",
        mood: "شاكر",
      },
      hopeful: {
        dua: "ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة إنك أنت الوهاب",
        verse: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
        story: "قال الله تعالى: 'أنا عند ظن عبدي بي، فليظن بي ما شاء'",
        audio: "/audio/dua-hope.mp3",
        source: "سورة الأعراف",
        mood: "راجي",
      },
      general: {
        dua: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
        verse: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
        story: "قال النبي ﷺ: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه'",
        audio: "/audio/dua-general.mp3",
        source: "سورة البقرة",
        mood: "مؤمن",
      },
    };

    return (
      responses[detectedMood as keyof typeof responses] || responses.general
    );
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const detectedMood = detectMood(message);
    setMood(detectedMood);

    try {
      // محاكاة تأخير لإضافة تشويق
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const spiritualResponse = await generateSpiritualResponse(
        message,
        detectedMood,
      );
      setResponse(spiritualResponse);

      // حفظ الرسالة في التاريخ
      saveToHistory(message, spiritualResponse);
    } catch (error) {
      console.error("خطأ في باب السماء:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (userMessage: string, response: SpiritualResponse) => {
    const history = JSON.parse(
      localStorage.getItem("bab-alsamaa-history") || "[]",
    );
    history.unshift({
      id: Date.now(),
      message: userMessage,
      response,
      timestamp: new Date().toISOString(),
    });
    // احتفظ بآخر 50 رسالة
    localStorage.setItem(
      "bab-alsamaa-history",
      JSON.stringify(history.slice(0, 50)),
    );
  };

  const playAudio = () => {
    if (audioRef.current && response?.audio) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const shareResponse = () => {
    if (!response) return;

    const shareText = `
🌌 من باب السماء المفتوح 🌌

${response.dua}

${response.verse ? `📖 ${response.verse}` : ""}

${response.story ? `✨ ${response.story}` : ""}

📱 الكتاب المبين - باب السماء مفتوح لك دائماً
https://elkitab-almubeen.app

#باب_السماء #دعاء #القرآن
    `.trim();

    if (navigator.share) {
      navigator.share({ title: "باب السماء المفتوح", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  const resetChat = () => {
    setMessage("");
    setResponse(null);
    setMood("");
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-gold-400/30 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <Card
            className={cn(
              "relative backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 border-white/20 shadow-2xl",
              "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
            )}
          >
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-amber-500 rounded-full shadow-lg"
                >
                  <span className="material-symbols-outlined text-white text-3xl">
                    mosque
                  </span>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-amiri font-bold bg-gradient-to-r from-gold-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                    🌌 باب السماء مفتوح 🌌
                  </h2>
                  <p className="text-lg text-white/90 font-inter leading-relaxed max-w-lg mx-auto">
                    اكتب ما في قلبك، وسنرد عليك بدعاء أو آية تلامس روحك من كلام
                    الله أو نبيه ﷺ
                  </p>

                  {triggeredBy === "auto" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">
                        notifications_active
                      </span>
                      الله يناديك... استجب للنداء
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              {!response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder="اكتب ما يؤلمك، ما يسعدك، ما تحتاجه... الله يسمعك 🤲"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={cn(
                        "min-h-[120px] resize-none text-lg leading-relaxed",
                        "bg-white/20 border-white/30 text-white placeholder:text-white/60",
                        "focus:bg-white/30 focus:border-gold-400/50 transition-all duration-300",
                        isRTL && "text-right",
                      )}
                      disabled={loading}
                    />

                    {/* Character count */}
                    <div className="absolute bottom-3 left-3 text-xs text-white/60">
                      {message.length}/500
                    </div>
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "أنا حزين 😢",
                      "أنا تايه 🤔",
                      "محتاج دعاء 🤲",
                      "أشكر الله 🙏",
                      "أنا خايف 😰",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="ghost"
                        size="sm"
                        onClick={() => setMessage(suggestion)}
                        className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                        disabled={loading}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className={cn(
                      "w-full h-14 text-lg font-amiri font-bold rounded-2xl shadow-lg transition-all duration-300",
                      "bg-gradient-to-r from-gold-400 via-amber-500 to-emerald-500",
                      "hover:from-gold-500 hover:via-amber-600 hover:to-emerald-600",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                        ⏳ جاري البحث عن النور...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">send</span>
                        ✨ أرسل إلى باب السماء
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* Golden Response Card */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-amber-500/20 rounded-2xl blur-xl"></div>
                    <Card className="relative bg-gradient-to-br from-white/20 to-gold-100/20 border-gold-400/30 shadow-xl">
                      <CardContent className="p-6 space-y-4">
                        {/* Mood Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/50">
                            <span className="material-symbols-outlined mr-1 text-sm">
                              psychology
                            </span>
                            حالتك: {response.mood}
                          </Badge>
                          <Badge className="bg-gold-500/20 text-gold-300 border-gold-400/50">
                            💎 رسالة من السماء
                          </Badge>
                        </div>

                        {/* Main Dua */}
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-gold-400">
                              hands
                            </span>
                            <h3 className="text-xl font-amiri font-bold text-gold-300">
                              دعاؤك المستجاب
                            </h3>
                          </div>
                          <p className="text-2xl md:text-3xl font-amiri leading-loose text-white verse-text">
                            {response.dua}
                          </p>
                        </div>

                        {/* Verse */}
                        {response.verse && (
                          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400/30">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-emerald-400">
                                menu_book
                              </span>
                              <span className="text-emerald-300 font-semibold">
                                آية كريمة
                              </span>
                            </div>
                            <p className="text-lg font-amiri leading-relaxed text-white">
                              {response.verse}
                            </p>
                          </div>
                        )}

                        {/* Story */}
                        {response.story && (
                          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-400/30">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-purple-400">
                                auto_stories
                              </span>
                              <span className="text-purple-300 font-semibold">
                                قصة مؤثرة
                              </span>
                            </div>
                            <p className="text-base font-inter leading-relaxed text-white/90">
                              {response.story}
                            </p>
                          </div>
                        )}

                        {/* Source */}
                        <div className="text-center">
                          <Badge
                            variant="outline"
                            className="text-white/70 border-white/30"
                          >
                            📚 المصدر: {response.source}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {response.audio && (
                      <Button
                        onClick={playAudio}
                        variant="outline"
                        className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                      >
                        <span className="material-symbols-outlined mr-2">
                          {isPlaying ? "pause" : "play_arrow"}
                        </span>
                        {isPlaying ? "إيقاف" : "استمع للدعاء"}
                      </Button>
                    )}

                    <Button
                      onClick={shareResponse}
                      variant="outline"
                      className="border-green-400/50 text-green-300 hover:bg-green-500/20"
                    >
                      <span className="material-symbols-outlined mr-2">
                        share
                      </span>
                      شارك الخير
                    </Button>

                    <Button
                      onClick={resetChat}
                      variant="outline"
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                    >
                      <span className="material-symbols-outlined mr-2">
                        refresh
                      </span>
                      جرعة روحية جديدة
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Audio element */}
              {response?.audio && (
                <audio
                  ref={audioRef}
                  src={response.audio}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}

              {/* Close button */}
              <Button
                onClick={onClose}
                variant="ghost"
                className="absolute top-4 right-4 w-10 h-10 p-0 text-white/60 hover:text-white hover:bg-white/20"
              >
                <span className="material-symbols-outlined">close</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
