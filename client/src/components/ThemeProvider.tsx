import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ThemeMode = "heaven" | "earth";

type Theme = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeProviderContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = "earth",
  storageKey = "divine-mode",
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeMode;
      if (stored && (stored === "heaven" || stored === "earth")) {
        setModeState(stored);
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = document.body;

    // Remove all theme classes
    root.classList.remove("theme-heaven", "theme-earth");
    body.classList.remove("theme-heaven", "theme-earth");

    // Add current theme class
    root.classList.add(`theme-${mode}`);
    body.classList.add(`theme-${mode}`);

    // Store in localStorage
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }

    // Apply theme-specific styles
    if (mode === "heaven") {
      // Heaven mode: Dark cosmic background with Arabic fonts
      body.style.cssText = `
        font-family: "Noto Naskh Arabic", "Amiri", serif;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        color: #ffffff;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      `;
    } else {
      // Earth mode: Clean white background with modern fonts
      body.style.cssText = `
        font-family: "Cairo", "IBM Plex Sans Arabic", sans-serif;
        background: #ffffff;
        color: #1a1a1a;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      `;
    }
  }, [mode, storageKey]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    const newMode = mode === "heaven" ? "earth" : "heaven";
    setModeState(newMode);

    // Add dramatic transition effect
    document.body.style.transition = "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)";

    // Play sound effect (if available)
    try {
      const audio = new Audio("/sounds/divine-toggle.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => {
        // Ignore errors if sound file doesn't exist
      });
    } catch (error) {
      // Ignore audio errors
    }

    // Trigger custom event for other components
    const event = new CustomEvent("divine-mode-change", {
      detail: {
        oldMode: mode,
        newMode,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  };

  const value = {
    mode,
    setMode,
    toggleMode,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
