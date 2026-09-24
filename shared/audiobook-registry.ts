export type AudiobookRightsState =
  | "cleared_for_streaming"
  | "rights_review_pending"
  | "blocked";

export interface AudiobookChapter {
  chapterId: string;
  title: string;
  narrator: string;
  durationSeconds: number | null;
  audioUrl: string;
  sourcePageUrl: string;
  textCursor?: number | null;
}

export interface AudiobookRecord {
  audiobookId: string;
  workId: string;
  title: string;
  narrator: string;
  provider: string;
  coverUrl: string | null;
  sourcePageUrl: string;
  rightsUrl: string;
  licenseName: string;
  rightsState: AudiobookRightsState;
  streamingAllowed: boolean;
  offlineAllowed: boolean;
  checkedAt: string;
  chapters: AudiobookChapter[];
  synchronization:
    | { mode: "chapter_to_text_cursor"; verified: boolean }
    | { mode: "none"; verified: false };
  notes: string;
}

/**
 * Production audiobook registry.
 *
 * Deliberately empty until a recording has item-level provenance and explicit
 * streaming rights suitable for the audience served by this application.
 * A downloadable/streamable file existing on the web is not enough.
 */
export const audiobookRegistry: AudiobookRecord[] = [];

export function getProductionAudiobookForWork(workId: string): AudiobookRecord | null {
  const audiobook = audiobookRegistry.find((item) => item.workId === workId);
  if (!audiobook) return null;
  if (audiobook.rightsState !== "cleared_for_streaming") return null;
  if (!audiobook.streamingAllowed || audiobook.chapters.length === 0) return null;
  if (
    audiobook.chapters.some(
      (chapter) =>
        !chapter.audioUrl.startsWith("https://") ||
        !chapter.sourcePageUrl.startsWith("https://"),
    )
  ) {
    return null;
  }
  return audiobook;
}
