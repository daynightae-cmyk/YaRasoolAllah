import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  useBabAlsamaa,
  useSmartSuggestions,
} from "@/hooks/useBabAlsamaa";
import { useTheme } from "../ThemeProvider";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BabAlsamaaFABProps {
  className?: string;
}
export default function BabAlsamaaFAB({ className }: BabAlsamaaFABProps) {
  const { openBab } = useBabAlsamaa();
  const { suggestions } = useSmartSuggestions();
  const { mode } = useTheme();

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");

  useEffect(() => {
    // إخفاء الزر عند التمرير لأسفل، وإظهاره عند التمرير لأعلى
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // تحديث الاقتراح كل دقيقة
    const updateSuggestion = () => {
      if (suggestions.length > 0) {
        const randomSuggestion =
          suggestions[Math.floor(Math.random() * suggestions.length)];
        setSuggestion(randomSuggestion);
      }
    };

    updateSuggestion();
    const interval = setInterval(updateSuggestion, 60000);
    return () => clearInterval(interval);
  }, [suggestions]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "صباح النور 🌅";
    if (hour >= 12 && hour < 17) return "نهار مبارك ☀️";
    if (hour >= 17 && hour < 21) return "مساء الخير 🌅";
    return "ليلة مباركة 🌙";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          className={cn(
            "fixed bottom-20 left-6 z-40 flex flex-col items-start gap-3",
            className,
          )}
        >
          {/* اقتراح سريع */}
          <AnimatePresence>
            {isHovered && suggestion && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className={cn(
                  "rounded-xl p-4 shadow-xl border max-w-xs",
                  mode === "heaven"
                    ? "bg-gray-800/90 backdrop-blur-lg border-purple-500/20 text-white"
                    : "bg-white/90 backdrop-blur-lg border-gray-200 text-gray-900",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles
                    className={cn(
                      "w-4 h-4",
                      mode === "heaven"
                        ? "text-purple-400"
                        : "text-emerald-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      mode === "heaven"
                        ? "text-purple-300"
                        : "text-emerald-600",
                    )}
                  >
                    اقتراح ذكي
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    mode === "heaven" ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {suggestion}
                </p>
                <div
                  className={cn(
                    "mt-2 text-xs",
                    mode === "heaven" ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {getGreeting()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* الزر الرئيسي - موضع محسن */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative"
          >
            <Button
              onClick={() => openBab("manual")}
              aria-label="فتح باب السماء"
              className={cn(
                "relative w-14 h-14 rounded-full shadow-xl border-2 transition-all duration-300 group overflow-hidden",
                mode === "heaven"
                  ? "bg-purple-600 hover:bg-purple-500 border-purple-400/30 hover:shadow-purple-500/25"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-400/30 hover:shadow-emerald-500/25",
              )}
            >
              {/* الأيقونة - مبسطة */}
              <Sparkles
                className="relative z-10 h-6 w-6 text-white drop-shadow-lg"
                aria-hidden="true"
              />
            </Button>
          </motion.div>

          {/* معلومات إضافية - مبسطة */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center"
              >
                <p
                  className={cn(
                    "text-xs font-medium font-amiri",
                    mode === "heaven" ? "text-purple-300" : "text-emerald-600",
                  )}
                >
                  باب السماء
                </p>
                <p
                  className={cn(
                    "text-xs font-inter",
                    mode === "heaven" ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  ادخل متى شئت
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
