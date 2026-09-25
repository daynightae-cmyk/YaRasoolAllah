import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Star,
  ChevronRight,
  ChevronLeft,
  StickyNote,
  Headphones,
  Pause,
  Play,
  ShieldCheck,
  Search,
  Volume2,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import {
  getQuranChapterVerses,
  getQuranChapters,
  type QuranChapter,
  type QuranVerse,
} from "@/services/quranService";
import { getGovernanceRecord } from "@shared/source-registry";
import { searchVerifiedQuran, type QuranSearchHit } from "@/visual-golden/services/quran-search";
import {
  getQuranTranslation,
  type QuranTranslationLanguage,
  type QuranTranslationResponse,
} from "@/visual-golden/services/quran-translations";
import {
  getQuranRecitations,
  type QuranRecitationPayload,
  type QuranReciterStream,
} from "@/visual-golden/services/quran-recitation";
import styles from "./QuranPage.module.css";

type SidebarTab = "surah" | "marks";
type ReadingMode = "mushaf" | "study";
type TranslationState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; payload: QuranTranslationResponse };
type RecitationState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; payload: QuranRecitationPayload };

const BOOKMARK_KEY = "quran-bookmarks";
const NOTE_KEY = "quran-notes-v1";
const CONTINUE_KEY = "quran-last-position-v1";
const READING_SETTINGS_KEY = "quran-reading-settings-v1";

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Reading remains usable when storage is unavailable.
  }
}

function safeReadReadingSettings() {
  const settings = safeReadJson<{ fontScale?: number; lineHeight?: number }>(READING_SETTINGS_KEY, {});
  return {
    fontScale: Math.min(1.35, Math.max(0.9, settings.fontScale ?? 1)),
    lineHeight: Math.min(2.8, Math.max(1.8, settings.lineHeight ?? 2.35)),
  };
}

function verseKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

function initialQuranSelection() {
  try {
    const params = new URLSearchParams(window.location.search);
    const requestedSurah = Number(params.get("surah"));
    const requestedAyah = Number(params.get("ayah"));
    const saved = safeReadJson<{ surah: number; ayah: number } | null>(CONTINUE_KEY, null);
    const hasRequestedSurah = params.has("surah") && Number.isInteger(requestedSurah) && requestedSurah >= 1 && requestedSurah <= 114;
    const surah = hasRequestedSurah ? requestedSurah : saved?.surah;
    const ayah = hasRequestedSurah ? requestedAyah : saved?.ayah;
    return {
      surah: Number.isInteger(surah) && surah! >= 1 && surah! <= 114 ? surah! : 1,
      ayah: Number.isInteger(ayah) && ayah! >= 1 ? ayah! : 1,
    };
  } catch {
    return { surah: 1, ayah: 1 };
  }
}

export function QuranPage() {
  const initialSelection = useMemo(initialQuranSelection, []);
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [active, setActive] = useState(initialSelection.surah);
  const [ayah, setAyah] = useState(initialSelection.ayah);
  const [tab, setTab] = useState<SidebarTab>("surah");
  const [focus, setFocus] = useState(false);
  const [lamp, setLamp] = useState(true);
  const [query, setQuery] = useState("");
  const [verseQuery, setVerseQuery] = useState("");
  const [searchState, setSearchState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [searchResults, setSearchResults] = useState<QuranSearchHit[]>([]);
  const searchRequest = useRef(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNote, setShowNote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>("mushaf");
  const [translationLanguage, setTranslationLanguage] = useState<QuranTranslationLanguage>("en");
  const [translationState, setTranslationState] = useState<TranslationState>({ state: "idle" });
  const [recitationState, setRecitationState] = useState<RecitationState>({ state: "idle" });
  const [selectedReciterKey, setSelectedReciterKey] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.78);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [fontScale, setFontScale] = useState(() => safeReadReadingSettings().fontScale);
  const [lineHeight, setLineHeight] = useState(() => safeReadReadingSettings().lineHeight);

  const governance = useMemo(
    () => getGovernanceRecord("resource-tanzil-uthmani-min-1-1"),
    [],
  );

  useEffect(() => {
    setBookmarks(safeReadJson<string[]>(BOOKMARK_KEY, []));
    setNotes(safeReadJson<Record<string, string>>(NOTE_KEY, {}));
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("surah", String(active));
      url.searchParams.set("ayah", String(ayah));
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      safeWriteJson(CONTINUE_KEY, { surah: active, ayah });
    } catch {
      // URL synchronization is a convenience; Quran reading must still work.
    }
  }, [active, ayah]);

  useEffect(() => {
    safeWriteJson(READING_SETTINGS_KEY, { fontScale, lineHeight });
  }, [fontScale, lineHeight]);

  useEffect(() => {
    let cancelled = false;
    getQuranChapters()
      .then((items) => {
        if (!cancelled) setChapters(items);
      })
      .catch(() => {
        if (!cancelled) setLoadError("تعذر تحميل فهرس السور.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVerses([]);
    setLoadError(null);

    getQuranChapterVerses(active)
      .then((items) => {
        if (cancelled) return;
        if (items.length === 0) {
          setLoadError("لم يُعثر على نص هذه السورة في المصحف المحلي الموثق.");
          return;
        }
        setVerses(items);
        setAyah((current) =>
          items.some((item) => item.ayah === current) ? current : 1,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setVerses([]);
          setLoadError("تعذر تحميل نص السورة من المصحف المحلي الموثق.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (loading || ayah <= 1 || !verses.some((item) => item.ayah === ayah)) return;
    document.getElementById(`quran-ayah-${active}-${ayah}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active, ayah, loading, verses]);

  useEffect(() => {
    if (readingMode !== "study") {
      setTranslationState({ state: "idle" });
      return;
    }

    const controller = new AbortController();
    setTranslationState({ state: "loading" });
    getQuranTranslation(active, translationLanguage, controller.signal)
      .then((payload) => {
        if (!controller.signal.aborted) setTranslationState({ state: "ready", payload });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setTranslationState({
          state: "error",
          message: error instanceof Error ? error.message : "تعذر تحميل الترجمة.",
        });
      });

    return () => controller.abort();
  }, [active, readingMode, translationLanguage]);

  useEffect(() => {
    const controller = new AbortController();
    setRecitationState({ state: "loading" });
    setSelectedReciterKey(null);
    setAudioPlaying(false);
    getQuranRecitations(active, controller.signal)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setRecitationState({ state: "ready", payload });
        const first = payload.reciters[0];
        setSelectedReciterKey(first ? `${first.id}:${first.moshafId}` : null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRecitationState({
          state: "error",
          message: error instanceof Error ? error.message : "تعذر تحميل تلاوات السورة.",
        });
      });
    return () => controller.abort();
  }, [active]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume;
  }, [audioVolume]);

  useEffect(() => () => { searchRequest.current += 1; }, []);

  const currentChapter =
    chapters.find((chapter) => chapter.number === active) ?? null;
  const selectedVerse =
    verses.find((item) => item.ayah === ayah) ?? verses[0] ?? null;
  const translationByAyah = useMemo(() => {
    if (translationState.state !== "ready") return new Map<number, string>();
    return new Map(translationState.payload.ayahs.map((item) => [item.ayah, item.text] as const));
  }, [translationState]);
  const selectedTranslation = selectedVerse
    ? translationByAyah.get(selectedVerse.ayah) ?? null
    : null;
  const selectedReciter: QuranReciterStream | null = useMemo(() => {
    if (recitationState.state !== "ready") return null;
    const items = recitationState.payload.reciters;
    return items.find((item) => `${item.id}:${item.moshafId}` === selectedReciterKey)
      ?? items[0]
      ?? null;
  }, [recitationState, selectedReciterKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setAudioPlaying(false);
  }, [selectedReciter?.streamUrl]);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedReciter) return;
    if (audioPlaying) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setAudioPlaying(false);
    }
  };

  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter(
      (chapter) =>
        chapter.arabicName.includes(query.trim()) ||
        chapter.englishName.toLowerCase().includes(normalized) ||
        String(chapter.number).includes(normalized),
    );
  }, [chapters, query]);

  const bookmarkedEntries = useMemo(
    () =>
      bookmarks
        .map((key) => {
          const [surahNumber, ayahNumber] = key.split(":").map(Number);
          const chapter = chapters.find((item) => item.number === surahNumber);
          if (!chapter || !surahNumber || !ayahNumber) return null;
          return { key, surahNumber, ayahNumber, chapter };
        })
        .filter(
          (
            item,
          ): item is {
            key: string;
            surahNumber: number;
            ayahNumber: number;
            chapter: QuranChapter;
          } => Boolean(item),
        ),
    [bookmarks, chapters],
  );

  const totalAyahs = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.ayahCount, 0),
    [chapters],
  );

  const selectedKey = selectedVerse
    ? verseKey(selectedVerse.surah, selectedVerse.ayah)
    : null;
  const selectedBookmarked = selectedKey
    ? bookmarks.includes(selectedKey)
    : false;
  const selectedNote = selectedKey ? notes[selectedKey] ?? "" : "";

  const selectSurah = (surahNumber: number, targetAyah = 1) => {
    setActive(surahNumber);
    setAyah(targetAyah);
    setShowNote(false);
  };

  const stepAyah = (delta: -1 | 1) => {
    if (!selectedVerse || !currentChapter) return;
    const next = selectedVerse.ayah + delta;
    if (next >= 1 && next <= currentChapter.ayahCount) {
      setAyah(next);
    } else {
      const neighbor = chapters.find((chapter) => chapter.number === active + delta);
      if (neighbor) selectSurah(neighbor.number, delta === 1 ? 1 : neighbor.ayahCount);
    }
  };

  const searchVerses = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = verseQuery.trim();
    if (term.length < 2) return;
    const request = ++searchRequest.current;
    setSearchState("loading");
    try {
      const hits = await searchVerifiedQuran(term, 20);
      if (request !== searchRequest.current) return;
      setSearchResults(hits);
      setSearchState("ready");
    } catch {
      if (request === searchRequest.current) setSearchState("error");
    }
  };

  const toggleBookmark = () => {
    if (!selectedKey) return;
    const next = selectedBookmarked
      ? bookmarks.filter((key) => key !== selectedKey)
      : [...bookmarks, selectedKey];
    setBookmarks(next);
    safeWriteJson(BOOKMARK_KEY, next);
  };

  const saveNote = (value: string) => {
    if (!selectedKey) return;
    const next = { ...notes, [selectedKey]: value };
    if (!value.trim()) delete next[selectedKey];
    setNotes(next);
    safeWriteJson(NOTE_KEY, next);
  };

  const copySelectedVerse = async () => {
    if (!selectedVerse) return;
    const payload = `${selectedVerse.arabic}\n[سورة ${currentChapter?.arabicName ?? ""} — الآية ${selectedVerse.ayah}]`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const shareSelectedVerse = async () => {
    if (!selectedVerse) return;
    const text = `${selectedVerse.arabic}\nسورة ${currentChapter?.arabicName ?? ""} — الآية ${selectedVerse.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "القرآن الكريم", text });
        return;
      } catch {
        return;
      }
    }
    await copySelectedVerse();
  };

  const moveSurah = (delta: number) => {
    const next = Math.min(114, Math.max(1, active + delta));
    selectSurah(next, 1);
  };

  return (
    <div className={`${styles.page} ${focus ? styles.focus : ""}`}>
      {focus ? null : (
        <PageHero
          title="رواق القرآن"
          subtitle="المصحف العربي الكامل · نص موثّق"
          desc="النص العربي من نسخة Tanzil Uthmani-min 1.1 المحفوظة حرفيًا دون تعديل."
          image={art.mushafOpen}
          compact
          wing="quran"
        />
      )}

      <FocusBar
        focus={focus}
        onFocus={() => setFocus((value) => !value)}
        extra={{
          label: lamp ? "إطفاء المصباح" : "إضاءة المصباح",
          on: lamp,
          onClick: () => setLamp((value) => !value),
        }}
      />

      <div className={styles.workspace}>
        {focus ? null : (
          <aside id="quran-surah-nav" className={styles.surahNav} aria-label="فهرس القرآن">
            <div className={styles.tabs}>
              <button
                type="button"
                className={tab === "surah" ? styles.tabOn : ""}
                onClick={() => setTab("surah")}
              >
                السور
              </button>
              <button
                type="button"
                className={styles.disabledTab}
                disabled
                title="بيانات الأجزاء والصفحات لم تُربط بعد بمصدر معتمد."
              >
                الأجزاء
              </button>
              <button
                type="button"
                className={tab === "marks" ? styles.tabOn : ""}
                onClick={() => setTab("marks")}
              >
                العلامات
              </button>
            </div>

            <form className={styles.verseSearch} onSubmit={searchVerses} role="search">
              <label htmlFor="quran-verse-search">بحث في نص الآيات العربي</label>
              <div>
                <input id="quran-verse-search" value={verseQuery} onChange={(event) => setVerseQuery(event.target.value)} minLength={2} placeholder="كلمة أو عبارة من القرآن…" />
                <button type="submit" disabled={verseQuery.trim().length < 2 || searchState === "loading"} aria-label="ابحث في الآيات"><Search size={16} /></button>
              </div>
            </form>
            {searchState !== "idle" ? (
              <div className={styles.verseResults} aria-live="polite">
                {searchState === "loading" ? <p>جارٍ البحث في المصحف المحلي…</p> : null}
                {searchState === "error" ? <p>تعذر البحث الآن. حاول مرة أخرى.</p> : null}
                {searchState === "ready" ? (
                  <>
                    <p>{searchResults.length ? `أول ${searchResults.length} نتيجة من النص الموثق` : "لا توجد نتائج مطابقة في النص المحلي."}</p>
                    <ul>{searchResults.map((hit) => <li key={`${hit.surah}:${hit.ayah}`}>
                      <button type="button" onClick={() => { selectSurah(hit.surah, hit.ayah); setSearchState("idle"); }}>
                        <strong>سورة {hit.surahName} · الآية {hit.ayah}</strong>
                        <span lang="ar" dir="rtl">{hit.arabic}</span>
                      </button>
                    </li>)}</ul>
                  </>
                ) : null}
              </div>
            ) : null}

            {tab === "surah" ? (
              <>
                <label className={styles.searchWrap}>
                  <Search size={14} aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث باسم السورة أو رقمها..."
                    className={styles.search}
                  />
                </label>
                <ul>
                  {filteredChapters.map((chapter) => (
                    <li
                      key={chapter.number}
                      className={active === chapter.number ? styles.active : ""}
                    >
                      <button
                        type="button"
                        className={styles.surahButton}
                        onClick={() => selectSurah(chapter.number)}
                        aria-current={
                          active === chapter.number ? "true" : undefined
                        }
                      >
                        <span className={styles.num}>{chapter.number}</span>
                        <span>
                          <strong>سورة {chapter.arabicName}</strong>
                          <em>
                            {chapter.englishName} · {chapter.ayahCount} آية
                          </em>
                        </span>
                        <Star size={13} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={styles.bookmarkList}>
                {bookmarkedEntries.length === 0 ? (
                  <p className={styles.emptyState}>
                    لا توجد علامات محفوظة بعد. اختر آية ثم اضغط «حفظ».
                  </p>
                ) : (
                  bookmarkedEntries.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() =>
                        selectSurah(entry.surahNumber, entry.ayahNumber)
                      }
                    >
                      <BookmarkCheck size={14} />
                      <span>
                        سورة {entry.chapter.arabicName} · الآية{" "}
                        {entry.ayahNumber}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
            <a className={styles.readerJump} href="#quran-reader">العودة إلى المصحف ↑</a>
          </aside>
        )}

        <section id="quran-reader" className={styles.reader} aria-label="مصحف القراءة">
          <div className={styles.sheetHead}>
            <span>
              {currentChapter
                ? currentChapter.revelationType === "meccan"
                  ? "مكية"
                  : "مدنية"
                : "—"}
            </span>
            <h2>
              {currentChapter
                ? `سورة ${currentChapter.arabicName}`
                : "القرآن الكريم"}
            </h2>
            <span>
              {currentChapter ? `${currentChapter.ayahCount} آية` : "—"}
            </span>
          </div>
          <div className={styles.readingModes} role="tablist" aria-label="وضع القراءة">
            <button type="button" role="tab" aria-selected={readingMode === "mushaf"} className={readingMode === "mushaf" ? styles.modeOn : ""} onClick={() => setReadingMode("mushaf")}>مصحف</button>
            <button type="button" role="tab" aria-selected={readingMode === "study"} className={readingMode === "study" ? styles.modeOn : ""} onClick={() => setReadingMode("study")}>دراسة</button>
          </div>
          {readingMode === "study" ? (
            <label className={styles.translationPicker}>
              <span>ترجمة المعنى</span>
              <select
                value={translationLanguage}
                onChange={(event) => setTranslationLanguage(event.target.value as QuranTranslationLanguage)}
                aria-label="اختيار ترجمة القرآن"
              >
                <option value="en">English · Saheeh International</option>
                <option value="fr">Français · Muhammad Hamidullah</option>
                <option value="ur">اردو · فتح محمد جالندھری</option>
              </select>
              <small>
                {translationState.state === "ready"
                  ? `${translationState.payload.translator} · ${translationState.payload.source}`
                  : translationState.state === "loading"
                    ? "جارٍ تحميل الترجمة عبر الواجهة الداخلية…"
                    : translationState.state === "error"
                      ? translationState.message
                      : "اختر وضع الدراسة لتحميل الترجمة."}
              </small>
            </label>
          ) : null}
          <a className={styles.catalogJump} href="#quran-surah-nav">فهرس السور والبحث ↓</a>

          <div
            className={`${styles.sheet} ${lamp ? styles.lampOn : ""}`}
            dir="rtl"
            lang="ar"
          >
            <button
              className={styles.sheetNav}
              type="button"
              aria-label="السورة السابقة"
              disabled={active <= 1}
              onClick={() => moveSurah(-1)}
            >
              <ChevronRight size={18} />
            </button>

            <div className={`${styles.ayat} ${readingMode === "study" ? styles.studyAyat : ""}`} style={{ fontSize: `calc(clamp(1.25rem, 2.2vw, 1.7rem) * ${fontScale})`, lineHeight }}>
              {loading ? (
                <p className={styles.loadingState}>
                  جارٍ فتح السورة من المصحف المحلي…
                </p>
              ) : loadError ? (
                <p className={styles.errorState}>{loadError}</p>
              ) : (
                verses.map((item) => (
                  <button
                    type="button"
                    key={item.ayah}
                    id={`quran-ayah-${active}-${item.ayah}`}
                    className={`${styles.ayah} ${
                      ayah === item.ayah ? styles.ayahOn : ""
                    }`}
                    onClick={() => {
                      setAyah(item.ayah);
                      setShowNote(false);
                    }}
                    aria-pressed={ayah === item.ayah}
                    title={`الآية ${item.ayah}`}
                  >
                    <span>{item.arabic}</span>
                    <span className={styles.ayahNum}>{item.ayah}</span>
                  </button>
                ))
              )}
            </div>
            {readingMode === "study" && selectedVerse ? (
              <div className={styles.studyCard} aria-live="polite">
                <strong>مادة الدراسة · الآية {selectedVerse.ayah}</strong>
                {translationState.state === "loading" ? (
                  <p className={styles.pendingStudy}>جارٍ تحميل ترجمة السورة…</p>
                ) : translationState.state === "error" ? (
                  <p className={styles.pendingStudy}>{translationState.message}</p>
                ) : selectedTranslation && translationState.state === "ready" ? (
                  <p
                    className={styles.translationText}
                    dir={translationState.payload.direction}
                    lang={translationState.payload.language}
                  >
                    <b>ترجمة المعنى:</b> {selectedTranslation}
                  </p>
                ) : (
                  <p className={styles.pendingStudy}>لا توجد ترجمة متاحة لهذا الموضع من المزوّد الآن.</p>
                )}
                {selectedVerse.tafsir ? <p><b>تفسير:</b> {selectedVerse.tafsir}</p> : <p className={styles.pendingStudy}>لا يوجد تفسير إنتاجي موثق مربوط بهذا الموضع بعد.</p>}
                <small>
                  النص العربي المحلي مستقل عن الترجمة والتفسير. الترجمة تُجلب عبر خادم المنصة مع الحفاظ على هوية الإصدار والمترجم.
                </small>
              </div>
            ) : null}

            <button
              className={styles.sheetNav}
              type="button"
              aria-label="السورة التالية"
              disabled={active >= 114}
              onClick={() => moveSurah(1)}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className={styles.player}>
            <audio
              ref={audioRef}
              src={selectedReciter?.streamUrl}
              preload="metadata"
              onPlay={() => setAudioPlaying(true)}
              onPause={() => setAudioPlaying(false)}
              onEnded={() => setAudioPlaying(false)}
              onError={() => setAudioPlaying(false)}
            />
            <img src={art.kaaba} alt="" />
            <div className={styles.playerCopy}>
              <strong>تلاوة سورة {currentChapter?.arabicName ?? "القرآن"}</strong>
              {recitationState.state === "loading" ? (
                <span>جارٍ تحميل القراء المتاحين من MP3Quran…</span>
              ) : recitationState.state === "error" ? (
                <span role="alert">{recitationState.message}</span>
              ) : selectedReciter ? (
                <>
                  <select
                    className={styles.reciterSelect}
                    value={selectedReciterKey ?? ""}
                    onChange={(event) => setSelectedReciterKey(event.target.value)}
                    aria-label="اختيار قارئ السورة"
                  >
                    {recitationState.state === "ready" ? recitationState.payload.reciters.map((item) => (
                      <option key={`${item.id}:${item.moshafId}`} value={`${item.id}:${item.moshafId}`}>
                        {item.name} · {item.reading}
                      </option>
                    )) : null}
                  </select>
                  <span>بث مباشر داخل المنصة · MP3Quran.net</span>
                </>
              ) : (
                <span>لا توجد تلاوة متاحة لهذه السورة في استجابة المزوّد الآن.</span>
              )}
            </div>
            <div className={styles.inlineAudioControls}>
              <button
                type="button"
                className={styles.audioPlay}
                onClick={() => void toggleAudio()}
                disabled={!selectedReciter}
                aria-label={audioPlaying ? "إيقاف التلاوة مؤقتًا" : "تشغيل التلاوة"}
              >
                {audioPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <label className={styles.inlineVolume}>
                <Volume2 size={14} aria-hidden="true" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audioVolume}
                  onChange={(event) => setAudioVolume(Number(event.target.value))}
                  aria-label="مستوى صوت التلاوة"
                />
              </label>
              <Link href="/audio" className={styles.audioLink}>
                <Headphones size={15} />
                كل القراء
              </Link>
            </div>
          </div>
        </section>

        {focus ? null : (
          <aside className={styles.sidePanel}>
            <h4>الآية المحددة</h4>
            <div className={styles.selectedVerseMeta}>
              <strong>
                {currentChapter
                  ? `سورة ${currentChapter.arabicName}`
                  : "—"}
              </strong>
              <span>
                الآية {selectedVerse?.ayah ?? "—"} من{" "}
                {currentChapter?.ayahCount ?? "—"}
              </span>
            </div>

            <div className={styles.verseNavigation}>
              <button type="button" onClick={() => stepAyah(-1)} disabled={active === 1 && (selectedVerse?.ayah ?? 1) === 1}>الآية السابقة</button>
              <button type="button" onClick={() => stepAyah(1)} disabled={active === 114 && selectedVerse?.ayah === currentChapter?.ayahCount}>الآية التالية</button>
            </div>

            <h4>أدوات الآية</h4>
            <div className={styles.toolGrid}>
              <button type="button" onClick={copySelectedVerse}>
                <Copy size={14} /> {copied ? "تم النسخ" : "نسخ الآية"}
              </button>
              <button type="button" onClick={shareSelectedVerse}>
                <Share2 size={14} /> مشاركة
              </button>
              <button
                type="button"
                className={selectedBookmarked ? styles.toolOn : ""}
                onClick={toggleBookmark}
              >
                {selectedBookmarked ? (
                  <BookmarkCheck size={14} />
                ) : (
                  <Bookmark size={14} />
                )}
                {selectedBookmarked ? "محفوظة" : "حفظ"}
              </button>
              <button
                type="button"
                className={showNote ? styles.toolOn : ""}
                onClick={() => setShowNote((value) => !value)}
              >
                <StickyNote size={14} /> ملاحظة
              </button>
            </div>

            <div className={styles.readingControls} aria-label="ضبط عرض القرآن">
              <span>الخط {Math.round(fontScale * 100)}%</span>
              <button type="button" onClick={() => setFontScale((value) => Math.max(0.9, Number((value - 0.05).toFixed(2))))} aria-label="تصغير خط القرآن">−</button>
              <button type="button" onClick={() => setFontScale((value) => Math.min(1.35, Number((value + 0.05).toFixed(2))))} aria-label="تكبير خط القرآن">＋</button>
              <button type="button" onClick={() => setLineHeight((value) => Math.max(1.8, Number((value - 0.1).toFixed(2))))} aria-label="تقليل تباعد السطور">تضييق</button>
              <button type="button" onClick={() => setLineHeight((value) => Math.min(2.8, Number((value + 0.1).toFixed(2))))} aria-label="زيادة تباعد السطور">توسيع</button>
            </div>

            {showNote && selectedKey ? (
              <div className={styles.noteBox}>
                <label htmlFor="quran-personal-note">
                  ملاحظة شخصية على الآية
                </label>
                <textarea
                  id="quran-personal-note"
                  value={selectedNote}
                  onChange={(event) => saveNote(event.target.value)}
                  placeholder="اكتب ملاحظتك هنا…"
                />
                <small>
                  هذه ملاحظة شخصية محلية وليست تفسيرًا أو مادة مصدرية.
                </small>
              </div>
            ) : null}

            <h4>التفسير والترجمة</h4>
            <div className={styles.tafsirBox}>
              {selectedTranslation && translationState.state === "ready" ? (
                <p dir={translationState.payload.direction} lang={translationState.payload.language}>
                  <strong>الترجمة:</strong> {selectedTranslation}
                </p>
              ) : translationState.state === "loading" ? (
                <p>جارٍ تحميل ترجمة السورة…</p>
              ) : (
                <p>الترجمة غير متاحة من المزوّد لهذا الموضع حاليًا.</p>
              )}
              {translationState.state === "ready" ? (
                <small>{translationState.payload.attribution} · {translationState.payload.edition}</small>
              ) : null}
              {selectedVerse?.tafsir ? <p><strong>التفسير:</strong> {selectedVerse.tafsir}</p> : <p>لا يوجد تفسير إنتاجي موثق لهذا الموضع بعد.</p>}
              <Link href="/tafsir">فتح مساحة التفسير والتدبر</Link>
            </div>

            <h4>حالة المصدر</h4>
            <div className={styles.sourceBox}>
              <div>
                <ShieldCheck size={16} aria-hidden="true" />
                <strong>
                  {governance?.source.provider ?? "Tanzil"}
                </strong>
              </div>
              <span>
                الإصدار: {governance?.source.version ?? "1.1-uthmani-min"}
              </span>
              <span>
                الحالة:{" "}
                {governance?.source.editorialStatus === "verified"
                  ? "متحقق من سلامة الملف"
                  : governance?.source.editorialStatus ?? "غير متاحة"}
              </span>
              <span>
                الحقوق:{" "}
                {governance?.rights.decision === "cleared"
                  ? "مسموح بعرض النص العربي الحرفي مع النسبة"
                  : governance?.rights.decision ?? "غير متاحة"}
              </span>
              <small>
                النص العربي يُعرض كما هو من الملف المكتسب دون تعديل. ترجمة وضع الدراسة
                مستقلة عنه وتأتي عبر AlQuran Cloud مع اسم المترجم والإصدار؛ لا تُدمج
                الترجمة في النص القرآني ولا تُعامل كتفسير.
              </small>
            </div>
          </aside>
        )}
      </div>

      {focus ? null : (
        <footer className={styles.progress}>
          <span>المصحف المحلي الموثق</span>
          <b>{chapters.length ? `${chapters.length} سورة` : "السور: —"}</b>
          <span>{totalAyahs ? `${totalAyahs} آية` : "الآيات: —"}</span>
          <span>
            السورة الحالية: {currentChapter?.ayahCount ?? "—"} آية
          </span>
          <span>العلامات المحفوظة: {bookmarks.length}</span>
          <span>
            النسبة: {governance?.rights.attribution ?? "Tanzil Project"}
          </span>
        </footer>
      )}
    </div>
  );
}
