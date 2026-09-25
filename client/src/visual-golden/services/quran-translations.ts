export type QuranTranslationLanguage = "en" | "fr" | "ur";

export interface QuranTranslationAyah {
  ayah: number;
  text: string;
}

export interface QuranTranslationResponse {
  source: string;
  edition: string;
  translator: string;
  language: QuranTranslationLanguage;
  direction: "ltr" | "rtl";
  attribution: string;
  rightsUrl: string | null;
  ayahs: QuranTranslationAyah[];
}

export async function getQuranTranslation(
  surah: number,
  language: QuranTranslationLanguage,
  signal?: AbortSignal,
): Promise<QuranTranslationResponse> {
  const params = new URLSearchParams({
    surah: String(surah),
    language,
  });
  const response = await fetch(`/api/content/quran/translations?${params.toString()}`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message || `HTTP ${response.status}`);
  }
  return response.json() as Promise<QuranTranslationResponse>;
}
