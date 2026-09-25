export type TranslationKey = "english_rwwad" | "urdu_junagarhi";

export interface TranslationEdition {
  key: TranslationKey;
  language: string;
  label: string;
  direction: "ltr" | "rtl";
  version: string;
}

export interface TranslationVerse {
  sura: number;
  aya: number;
  translation: string;
  footnotes: unknown;
}

export interface TranslationPayload {
  provider: "QuranEnc.com";
  translation: TranslationEdition;
  termsUrl: string;
  verses: TranslationVerse[];
}

const cache = new Map<string, Promise<TranslationPayload>>();

export const QURAN_TRANSLATION_EDITIONS: TranslationEdition[] = [
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

export function getQuranTranslation(
  sura: number,
  translation: TranslationKey,
): Promise<TranslationPayload> {
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
    return response.json() as Promise<TranslationPayload>;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, request);
  return request;
}
