export interface QuranReciterStream {
  id: number;
  name: string;
  reading: string;
  moshafId: number;
  surahTotal: number;
  streamUrl: string;
  attribution: "MP3Quran.net";
}

export interface QuranRecitationPayload {
  source: string;
  availability: string;
  rightsUrl: string;
  reciters: QuranReciterStream[];
}

function isAllowedProviderStream(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === "mp3quran.net" || url.hostname.endsWith(".mp3quran.net"));
  } catch {
    return false;
  }
}

export async function getQuranRecitations(
  surah: number,
  signal?: AbortSignal,
): Promise<QuranRecitationPayload> {
  const response = await fetch(`/api/content/audio/reciters?sura=${surah}`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message || `HTTP ${response.status}`);
  }
  const data = await response.json() as QuranRecitationPayload;
  return {
    ...data,
    reciters: data.reciters.filter((item) => isAllowedProviderStream(item.streamUrl)),
  };
}
