import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

type DivineEffects = {
  isTransitioning: boolean;
  playTransitionEffect: () => void;
  getThemeClasses: () => {
    card: string;
    text: string;
    button: string;
    background: string;
  };
};

export function useDivineMode(): DivineEffects {
  const { mode, toggleMode } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const playTransitionEffect = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Create cosmic transition effect
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
      background: ${
        mode === "heaven"
          ? "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle at center, rgba(147,51,234,0.1) 0%, transparent 70%)"
      };
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      toggleMode();
    }, 400);

    setTimeout(() => {
      overlay.style.opacity = "0";
    }, 800);

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      setIsTransitioning(false);
    }, 1600);
  };

  const getThemeClasses = () => {
    if (mode === "heaven") {
      return {
        card: "divine-glow",
        text: "divine-text",
        button: "divine-button",
        background:
          "bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20",
      };
    } else {
      return {
        card: "earth-clean",
        text: "earth-text",
        button: "earth-button",
        background: "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50",
      };
    }
  };

  // Listen for divine mode changes
  useEffect(() => {
    const handleDivineModeChange = (event: CustomEvent) => {
      console.log("Divine mode changed:", event.detail);

      // Add subtle screen flash effect
      document.body.style.transition = "filter 0.3s ease-in-out";
      document.body.style.filter = "brightness(1.1)";

      setTimeout(() => {
        document.body.style.filter = "brightness(1)";
      }, 300);

      setTimeout(() => {
        document.body.style.transition = "";
        document.body.style.filter = "";
      }, 600);
    };

    window.addEventListener(
      "divine-mode-change",
      handleDivineModeChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "divine-mode-change",
        handleDivineModeChange as EventListener,
      );
    };
  }, []);

  return {
    isTransitioning,
    playTransitionEffect,
    getThemeClasses,
  };
}

export default useDivineMode;
