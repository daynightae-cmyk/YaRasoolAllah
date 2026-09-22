import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Import translation files
import arTranslations from "@/data/locales/ar.json";
import enTranslations from "@/data/locales/en.json";
import frTranslations from "@/data/locales/fr.json";
import urTranslations from "@/data/locales/ur.json";

type Language = "ar" | "en" | "fr" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  changeLanguage: (lang: Language) => void;
  direction: "ltr" | "rtl";
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translation data from imported files
const translations: Record<Language, any> = {
  ar: arTranslations,
  en: enTranslations,
  fr: frTranslations,
  ur: urTranslations,
};

// RTL languages
const RTL_LANGUAGES: Language[] = ["ar", "ur"];

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({
  children,
  defaultLanguage = "ar",
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
        "preferred-language",
      ) as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn("Failed to load language from localStorage:", error);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem("preferred-language", language);
    } catch (error) {
      console.warn("Failed to save language to localStorage:", error);
    }

    // Update document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.includes(language)
      ? "rtl"
      : "ltr";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  }, []);

  const changeLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage],
  );

  // Translation function with nested key support
  const t = useCallback(
    (key: string): string => {
      try {
        const keys = key.split(".");
        let value: any = translations[language];

        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            // Fallback to English if key not found in current language
            value = translations["en"];
            for (const k of keys) {
              if (value && typeof value === "object" && k in value) {
                value = value[k];
              } else {
                // If not found in English either, return the key
                return key;
              }
            }
            break;
          }
        }

        return typeof value === "string" ? value : key;
      } catch (error) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    },
    [language],
  );

  const direction = RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
  const isRTL = RTL_LANGUAGES.includes(language);

  const value: LanguageContextType = {
    language,
    setLanguage,
    changeLanguage,
    direction,
    isRTL,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Export types for external use
export type { Language, LanguageContextType };
