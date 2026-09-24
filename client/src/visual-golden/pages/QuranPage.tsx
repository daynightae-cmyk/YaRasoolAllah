import { useEffect, useMemo, useState } from "react";
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
  ShieldCheck,
  Search,
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
import styles from "./QuranPage.module.css";

type SidebarTab = "surah" | "marks";

const BOOKMARK_KEY = "quran-bookmarks";
const NOTE_KEY = "quran-notes-v1";

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

function verseKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

function initialQuranSelection() {
  try {
    const params = new URLSearchParams(window.location.search);
    const requestedSurah = Number(params.get("surah"));
    const requestedAyah = Number(params.get("ayah"));
    return {
      surah:
        Number.isInteger(requestedSurah) && requestedSurah >= 1 && requestedSurah <= 114
          ? requestedSurah
          : 1,
      ayah: Number.isInteger(requestedAyah) && requestedAyah >= 1 ? requestedAyah : 1,
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNote, setShowNote] = useState(false);
  const [copied, setCopied] = useState(false);

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
    } catch {
      // URL synchronization is a convenience; Quran reading must still work.
    }
  }, [active, ayah]);

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
    setLoadError(null);

    getQuranChapterVerses(active)
      .then((items) => {
        if (cancelled) return;
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

  const currentChapter =
    chapters.find((chapter) => chapter.number === active) ?? null;
  const selectedVerse =
    verses.find((item) => item.ayah === ayah) ?? verses[0] ?? null;

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
          <aside className={styles.surahNav} aria-label="فهرس القرآن">
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
          </aside>
        )}

        <main className={styles.reader}>
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

            <div className={styles.ayat} aria-live="polite">
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
            <img src={art.kaaba} alt="" />
            <div className={styles.playerCopy}>
              <strong>التلاوة الصوتية</strong>
              <span>
                لم نربط بهذه الشاشة تسجيلًا صوتيًا معتمد الحقوق بعد.
              </span>
            </div>
            <Link href="/audio" className={styles.audioLink}>
              <Headphones size={15} />
              قسم التلاوات
            </Link>
          </div>
        </main>

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
            <div className={styles.unavailableBox}>
              <p>
                لم يُربط بهذه الواجهة حتى الآن تفسير أو ترجمة معتمدة للإنتاج.
              </p>
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
                النص العربي يُعرض كما هو من الملف المكتسب دون تعديل، ولا يشمل
                هذا الاعتماد الترجمات أو التفاسير أو التسجيلات الصوتية.
              </small>
            </div>
          </aside>
        )}
      </div>

      {focus ? null : (
        <footer className={styles.progress}>
          <span>المصحف المحلي الموثق</span>
          <b>{chapters.length || 114} سورة</b>
          <span>{totalAyahs || 6236} آية</span>
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
