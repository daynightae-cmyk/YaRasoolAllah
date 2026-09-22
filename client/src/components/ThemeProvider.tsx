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

    // Remove previous theme classes
    root.classList.remove("theme-heaven", "theme-earth", "dark", "light");
    body.classList.remove("theme-heaven", "theme-earth", "dark", "light");

    // Add current theme class and standard Tailwind dark class
    root.classList.add(`theme-${mode}`);
    body.classList.add(`theme-${mode}`);
    if (mode === "heaven") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.add("light");
      body.classList.add("light");
    }

    // Clean inline body style override to let institutional CSS tokens govern smoothly
    body.style.cssText = "";

    // Store in localStorage
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
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
