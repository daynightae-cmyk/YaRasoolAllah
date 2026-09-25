export type QuranEncTranslationKey = "english_rwwad" | "urdu_junagarhi";
export type TranslationKey = QuranEncTranslationKey;

export interface QuranEncTranslationEdition {
  key: QuranEncTranslationKey;
  language: string;
  label: string;
  direction: "ltr" | "rtl";
  version: string;
}
export type TranslationEdition = QuranEncTranslationEdition;

export interface QuranEncTranslationVerse {
  sura: number;
  aya: number;
  translation: string;
  footnotes: unknown;
}
export type TranslationVerse = QuranEncTranslationVerse;

export interface QuranEncTranslationPayload {
  provider: "QuranEnc.com";
  translation: QuranEncTranslationEdition;
  termsUrl: string;
  verses: QuranEncTranslationVerse[];
}
export type TranslationPayload = QuranEncTranslationPayload;

const cache = new Map<string, Promise<QuranEncTranslationPayload>>();

export const QURANENC_TRANSLATION_EDITIONS: QuranEncTranslationEdition[] = [
  {
    key: "english_rwwad",
    language: "en",
    label: "English · Rowwad Translation Center",
    direction: "ltr",
    version: "1.0.19",
  },
  {
    key: "urdu_junagarhi",
    language: "ur",
    label: "اردو · محمد ابراہیم جوناگڑھی",
    direction: "rtl",
    version: "1.1.3",
  },
];

export function getQuranEncTranslation(
  sura: number,
  translation: QuranEncTranslationKey,
): Promise<QuranEncTranslationPayload> {
  const key = `${translation}:${sura}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const request = fetch(
    `/api/content/quran/translation?sura=${encodeURIComponent(String(sura))}&translation=${encodeURIComponent(translation)}`,
    { headers: { Accept: "application/json" } },
  ).then(async (response) => {
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message || `HTTP ${response.status}`);
    }
    return response.json() as Promise<QuranEncTranslationPayload>;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, request);
  return request;
}

export const QURAN_TRANSLATION_EDITIONS = QURANENC_TRANSLATION_EDITIONS;
export const getQuranTranslation = getQuranEncTranslation;
