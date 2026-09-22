import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export default function DivineToggle() {
  const { mode, toggleMode } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Create ripple effect
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      pointer-events: none;
      transition: all 1s ease-out;
      background: ${
        mode === "heaven"
          ? "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
          : "radial-gradient(circle, rgba(103,126,234,0.3) 0%, rgba(118,75,162,0.1) 50%, transparent 100%)"
      };
    `;

    document.body.appendChild(ripple);

    // Animate ripple
    setTimeout(() => {
      ripple.style.width = "200vw";
      ripple.style.height = "200vw";
    }, 10);

    // Toggle theme
    setTimeout(() => {
      toggleMode();
    }, 600);

    // Clean up
    setTimeout(() => {
      if (document.body.contains(ripple)) {
        document.body.removeChild(ripple);
      }
      setIsTransitioning(false);
    }, 1200);
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isTransitioning}
      size="sm"
      className={cn(
        "divine-toggle relative overflow-hidden transition-all duration-300 px-3 py-2 rounded-xl font-amiri font-bold",
        mode === "heaven"
          ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50"
          : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-emerald-500/50",
        isTransitioning && "animate-pulse scale-110 shadow-2xl",
      )}
    >
      <span className="relative z-10 flex items-center space-x-1 rtl:space-x-reverse text-sm">
        <span className="text-lg">{mode === "heaven" ? "🌍" : "🌌"}</span>
        <span className="hidden sm:inline">
          {mode === "heaven" ? "الأرض" : "السماء"}
        </span>
      </span>

      {/* Animated background particles for heaven mode */}
      {mode === "heaven" && !isTransitioning && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle-delayed"></div>
          <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white rounded-full animate-twinkle-slow"></div>
        </div>
      )}

      {/* Clean indicator for earth mode */}
      {mode === "earth" && !isTransitioning && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full animate-pulse-gentle"></div>
      )}

      {/* Loading state */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Button>
  );
}
