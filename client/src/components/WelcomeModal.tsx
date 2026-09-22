import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "./ThemeProvider";
import {
  X,
  Brain,
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Headphones,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { t, direction } = useLanguage();
  const { mode } = useTheme();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "المفتي المبين AI",
      description: "مساعد ذكي للفتا��ى والاستشارات الدينية",
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "القرآن الكريم",
      description: "تلاوة مباركة مع تفسير ��ترجمة",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "الآية اليومية",
      description: "آية مختارة مع تدبر وتأمل",
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "القرآن الصوتي",
      description: "استمع للقرآن بأصوات أفضل القراء",
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, features.length]);

  const handleGetStarted = () => {
    onClose();
    window.location.href = "/";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md"
            dir={direction}
          >
            <Card
              className={cn(
                "relative overflow-hidden border-0 shadow-2xl simple-card",
                mode === "heaven" ? "bg-gray-800 text-white" : "bg-white",
              )}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "absolute top-3 right-3 z-10 rounded-full",
                  mode === "heaven"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <X className="w-4 h-4" />
              </Button>

              <CardHeader className="text-center pb-4 pt-8">
                {/* App Logo */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="icon-primary w-16 h-16 mx-auto mb-4"
                >
                  <BookOpen className="w-8 h-8" />
                </motion.div>

                <CardTitle
                  className={cn(
                    "text-2xl font-amiri font-bold mb-2",
                    mode === "heaven" ? "text-white" : "text-gray-900",
                  )}
                >
                  أهلاً بك في الكتاب المبين
                </CardTitle>

                <p
                  className={cn(
                    "text-sm font-tajawal",
                    mode === "heaven" ? "text-gray-300" : "text-gray-600",
                  )}
                >
                  رحلتك الروحانية تبدأ من هنا 🌟
                </p>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                {/* Features Display */}
                <div className="space-y-4">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "simple-card border-0",
                      mode === "heaven" ? "bg-gray-700/50" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                          features[currentFeature].color,
                        )}
                      >
                        {features[currentFeature].icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={cn(
                            "font-semibold font-cairo mb-1",
                            mode === "heaven" ? "text-white" : "text-gray-900",
                          )}
                        >
                          {features[currentFeature].title}
                        </h3>
                        <p
                          className={cn(
                            "text-sm font-tajawal",
                            mode === "heaven"
                              ? "text-gray-300"
                              : "text-gray-600",
                          )}
                        >
                          {features[currentFeature].description}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4",
                          features[currentFeature].textColor,
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Progress Indicators */}
                  <div className="flex justify-center gap-2">
                    {features.map((_, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          scale: index === currentFeature ? 1.2 : 1,
                          opacity: index === currentFeature ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          index === currentFeature
                            ? "bg-emerald-500"
                            : mode === "heaven"
                              ? "bg-gray-600"
                              : "bg-gray-300",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleGetStarted}
                    className="btn-primary w-full font-cairo font-semibold"
                  >
                    <Brain className="w-4 h-4 ml-2 rtl:mr-2" />
                    ابدأ مع المفتي المبين
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        direction === "rtl" ? "mr-2 rotate-180" : "ml-2",
                      )}
                    />
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/quran">
                      <Button
                        variant="outline"
                        className="btn-secondary w-full font-cairo"
                        onClick={onClose}
                      >
                        <BookOpen className="w-4 h-4 ml-1 rtl:mr-1" />
                        القرآن
                      </Button>
                    </Link>

                    <Link href="/daily-verse">
                      <Button
                        variant="outline"
                        className="btn-secondary w-full font-cairo"
                        onClick={onClose}
                      >
                        <Star className="w-4 h-4 ml-1 rtl:mr-1" />
                        الآية اليومية
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Features List */}
                <div
                  className={cn(
                    "simple-card border-0",
                    mode === "heaven" ? "bg-emerald-500/20" : "bg-emerald-50",
                  )}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span
                        className={cn(
                          "font-semibold font-cairo",
                          mode === "heaven"
                            ? "text-emerald-300"
                            : "text-emerald-700",
                        )}
                      >
                        مميزات مجانية 100%
                      </span>
                    </div>

                    <div className="space-y-2 text-sm font-tajawal">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span
                          className={cn(
                            mode === "heaven"
                              ? "text-emerald-200"
                              : "text-emerald-600",
                          )}
                        >
                          فتاوى معتمدة من العلماء
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span
                          className={cn(
                            mode === "heaven"
                              ? "text-emerald-200"
                              : "text-emerald-600",
                          )}
                        >
                          خدمة آلاف المسلمين يومياً
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-emerald-500" />
                        <span
                          className={cn(
                            mode === "heaven"
                              ? "text-emerald-200"
                              : "text-emerald-600",
                          )}
                        >
                          بدعوة صالحة لك ولأهلك
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-amiri",
                      mode === "heaven" ? "text-gray-300" : "text-gray-600",
                    )}
                  >
                    بارك الله فيك، أهلاً بك في رحلة مباركة
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
