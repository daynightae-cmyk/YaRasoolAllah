import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  useInstitution,
  type ThemeMode as InstitutionThemeMode,
} from "@/visual-golden/lib/institution/store";

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

/**
 * The institutional store is the single persisted theme authority. The
 * legacy heaven/earth context remains as a compatibility adapter for pages
 * that still consume it, so the two providers cannot drift apart.
 */
export function ThemeProvider({
  children,
  defaultMode = "heaven",
  storageKey = "divine-mode",
}: ThemeProviderProps) {
  const institutionTheme = useInstitution((state) => state.theme);
  const setInstitutionTheme = useInstitution((state) => state.setTheme);
  const hydrate = useInstitution((state) => state.hydrate);
  const mode: ThemeMode = institutionTheme === "light" ? "earth" : "heaven";

  useEffect(() => {
    let hasInstitutionTheme = false;
    try {
      hasInstitutionTheme = localStorage.getItem("yra-visual-golden-v1") !== null;
      hydrate();
      if (!hasInstitutionTheme) {
        const legacy = localStorage.getItem(storageKey);
        if (legacy === "heaven" || legacy === "earth") {
          setInstitutionTheme(legacy === "earth" ? "light" : "dark");
        } else if (defaultMode === "heaven" || defaultMode === "earth") {
          setInstitutionTheme(defaultMode === "earth" ? "light" : "dark");
        }
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  }, [defaultMode, hydrate, setInstitutionTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = document.body;

    root.classList.remove("theme-heaven", "theme-earth", "dark", "light");
    body.classList.remove("theme-heaven", "theme-earth", "dark", "light");

    root.classList.add(`theme-${mode}`);
    body.classList.add(`theme-${mode}`);
    if (mode === "heaven") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.add("light");
      body.classList.add("light");
    }

    root.dataset.theme = institutionTheme;
    body.style.cssText = "";

    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [institutionTheme, mode, storageKey]);

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setInstitutionTheme(newMode === "earth" ? "light" : "dark");
    },
    [setInstitutionTheme],
  );

  const toggleMode = useCallback(() => {
    const newMode: ThemeMode = mode === "heaven" ? "earth" : "heaven";
    setMode(newMode);

    document.body.style.transition = "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)";

    try {
      const audio = new Audio("/sounds/divine-toggle.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => {
        // The visual preference still applies when the optional sound is absent.
      });
    } catch {
      // Audio is optional and must never block the theme change.
    }

    window.dispatchEvent(
      new CustomEvent("divine-mode-change", {
        detail: {
          oldMode: mode,
          newMode,
          timestamp: Date.now(),
        },
      }),
    );
  }, [mode, setMode]);

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

export type { InstitutionThemeMode };
