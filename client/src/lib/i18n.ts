import arTranslations from "@/data/locales/ar.json";
import enTranslations from "@/data/locales/en.json";
import frTranslations from "@/data/locales/fr.json";
import urTranslations from "@/data/locales/ur.json";

export type Language = "ar" | "en" | "fr" | "ur";

export const translations: Record<Language, Record<string, any>> = {
  ar: arTranslations,
  en: enTranslations,
  fr: frTranslations,
  ur: urTranslations,
};

export const languageNames: Record<Language, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  ur: "اردو",
};

export const supportedLanguages: Language[] = ["ar", "en", "fr", "ur"];
export const rtlLanguages: Language[] = ["ar", "ur"];
