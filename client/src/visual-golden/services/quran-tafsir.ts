export interface QuranTafsirAyah {
  ayah: number;
  text: string;
  footnotes: string | null;
}

export interface QuranTafsirResponse {
  source: "QuranEnc.com";
  edition: "arabic_moyassar";
  title: string;
  version: string;
  lastUpdate: string;
  attribution: string;
  rightsUrl: string | null;
  ayahs: QuranTafsirAyah[];
}

export async function getQuranTafsir(
  surah: number,
  signal?: AbortSignal,
): Promise<QuranTafsirResponse> {
  const params = new URLSearchParams({ surah: String(surah) });
  const response = await fetch(`/api/content/quran/tafsir?${params.toString()}`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message || `HTTP ${response.status}`);
  }
  return response.json() as Promise<QuranTafsirResponse>;
}
