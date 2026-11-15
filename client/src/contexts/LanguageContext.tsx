import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

// Import translation files
import arTranslations from "@/data/locales/ar.json";
import enTranslations from "@/data/locales/en.json";
import frTranslations from "@/data/locales/fr.json";
import urTranslations from "@/data/locales/ur.json";
import {
  useInstitution,
  type UiLang,
} from "@/visual-golden/lib/institution/store";

type Language = UiLang;

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

function isLanguage(value: unknown): value is Language {
  return value === "ar" || value === "en" || value === "fr" || value === "ur";
}

/**
 * The institutional store is the single persisted UI-language authority. This
 * adapter keeps the global locale API in sync for legacy pages and preserves
 * the older preferred-language key as a migration source.
 */
export function LanguageProvider({
  children,
  defaultLanguage = "ar",
}: LanguageProviderProps) {
  const language = useInstitution((state) => state.lang);
  const setInstitutionLanguage = useInstitution((state) => state.setLang);
  const hydrate = useInstitution((state) => state.hydrate);

  useEffect(() => {
    let institutionalLanguage: Language | null = null;
    let hasInstitutionPreference = false;
    try {
      const raw = localStorage.getItem("yra-visual-golden-v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        hasInstitutionPreference = isLanguage(parsed.lang);
        if (hasInstitutionPreference && isLanguage(parsed.lang)) {
          institutionalLanguage = parsed.lang;
        }
      }
      hydrate();
    } catch (error) {
      console.warn("Failed to load language from localStorage:", error);
    }

    if (institutionalLanguage) {
      setInstitutionLanguage(institutionalLanguage);
      return;
    }

    try {
      const legacy = localStorage.getItem("preferred-language");
      if (isLanguage(legacy)) {
        setInstitutionLanguage(legacy);
      } else {
        setInstitutionLanguage(defaultLanguage);
      }
    } catch (error) {
      console.warn("Failed to migrate language preference:", error);
      setInstitutionLanguage(defaultLanguage);
    }
  }, [defaultLanguage, hydrate, setInstitutionLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem("preferred-language", language);
    } catch (error) {
      console.warn("Failed to save language to localStorage:", error);
    }

    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.includes(language)
      ? "rtl"
      : "ltr";
  }, [language]);

  const setLanguage = useCallback(
    (lang: Language) => {
      if (translations[lang]) {
        setInstitutionLanguage(lang);
      }
    },
    [setInstitutionLanguage],
  );

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
            // Fall back to English if the key is not in the active locale.
            value = translations.en;
            for (const fallbackKey of keys) {
              if (value && typeof value === "object" && fallbackKey in value) {
                value = value[fallbackKey];
              } else {
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
