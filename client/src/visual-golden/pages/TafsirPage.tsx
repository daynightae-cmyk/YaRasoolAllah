import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Headphones,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import p from "@/visual-golden/components/present/present.module.css";
import {
  getQuranChapterVerses,
  getQuranChapters,
  type QuranChapter,
  type QuranVerse,
} from "@/services/quranService";
import { TAFSIR_WORKS } from "@/visual-golden/services/tafsir";
import styles from "./TafsirPage.module.css";

const NOTE_KEY = "tafsir-user-notes-v1";
const BOOKMARK_KEY = "tafsir-bookmarks-v1";

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
    // Notes remain usable in-memory when storage is unavailable.
  }
}

function verseKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}

export function TafsirPage() {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [surah, setSurah] = useState(2);
  const [ayah, setAyah] = useState(255);
  const [src, setSrc] = useState(0);
  const [tab, setTab] = useState("تأمل");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    setNotes(safeReadJson<Record<string, string>>(NOTE_KEY, {}));
    setBookmarks(safeReadJson<string[]>(BOOKMARK_KEY, []));
  }, []);

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
    getQuranChapterVerses(surah)
      .then((items) => {
        if (cancelled) return;
        setVerses(items);
        setAyah((current) => (items.some((item) => item.ayah === current) ? current : 1));
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
  }, [surah]);

  const currentChapter = chapters.find((chapter) => chapter.number === surah) ?? null;
  const selectedVerse = verses.find((item) => item.ayah === ayah) ?? null;
  const prevVerse = verses.find((item) => item.ayah === ayah - 1) ?? null;
  const nextVerse = verses.find((item) => item.ayah === ayah + 1) ?? null;

  const activeTafsir = TAFSIR_WORKS[Math.min(src, TAFSIR_WORKS.length - 1)] ?? null;

  const selectedKey = useMemo(() => verseKey(surah, ayah), [surah, ayah]);
  const selectedNote = notes[selectedKey] ?? "";
  const selectedBookmarked = bookmarks.includes(selectedKey);

  const selectAyah = (value: number) => {
    if (!currentChapter) return;
    const clamped = Math.min(currentChapter.ayahCount, Math.max(1, value));
    setAyah(clamped);
    setSavedFlash(false);
  };

  const toggleBookmark = () => {
    const next = selectedBookmarked
      ? bookmarks.filter((key) => key !== selectedKey)
      : [...bookmarks, selectedKey];
    setBookmarks(next);
    safeWriteJson(BOOKMARK_KEY, next);
  };

  const saveNote = (value: string) => {
    const next = { ...notes, [selectedKey]: value };
    if (!value.trim()) delete next[selectedKey];
    setNotes(next);
    safeWriteJson(NOTE_KEY, next);
  };

  const copyVerse = async () => {
    if (!selectedVerse) return;
    const payload = `${selectedVerse.arabic}\n[سورة ${currentChapter?.arabicName ?? surah} — الآية ${selectedVerse.ayah}]`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const shareVerse = async () => {
    if (!selectedVerse) return;
    const text = `${selectedVerse.arabic}\nسورة ${currentChapter?.arabicName ?? surah} — الآية ${selectedVerse.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "التفسير والتدبر", text });
        return;
      } catch {
        return;
      }
    }
    await copyVerse();
  };

  return (
    <div className={`${styles.page} ${focus ? styles.focus : ""}`}>
      {focus ? null : (
        <PageHero
          title="التفسير والتدبر"
          subtitle={`غرفة الدراسة العلمية · ${TAFSIR_WORKS.length} مصنفات مفسّرة في الفهرس`}
          desc="الآية من المصحف المحلي الموثق، وقائمة المصنفات التفسيرية فهرسية — النص الكامل غير متاح داخل المنصة حتى مراجعة النسخة والحقوق"
          image={art.mushaf}
          compact
          wing="tafsir"
        />
      )}
      <FocusBar focus={focus} onFocus={() => setFocus((v) => !v)} extra={{ label: "لوحة الآية", on: focus, onClick: () => setFocus(true) }} />

      <div className={styles.toolbar}>
        <label>
          السورة{" "}
          <select
            value={surah}
            onChange={(e) => {
              setSurah(Number(e.target.value));
              setAyah(1);
            }}
            aria-label="اختيار السورة"
            style={{ background: "transparent", color: "inherit", border: "none", font: "inherit" }}
          >
            {chapters.map((chapter) => (
              <option key={chapter.number} value={chapter.number}>
                {chapter.number} · سورة {chapter.arabicName}
              </option>
            ))}
          </select>
        </label>
        <label>
          الآية{" "}
          <select
            value={ayah}
            onChange={(e) => selectAyah(Number(e.target.value))}
            aria-label="اختيار الآية"
            style={{ background: "transparent", color: "inherit", border: "none", font: "inherit" }}
          >
            {verses.map((verse) => (
              <option key={verse.ayah} value={verse.ayah}>
                {verse.ayah}
              </option>
            ))}
          </select>
          <b>من {currentChapter?.ayahCount ?? "—"}</b>
        </label>
        <div className={styles.tools}>
          <button
            type="button"
            className={selectedBookmarked ? styles.on : ""}
            onClick={toggleBookmark}
            aria-label="حفظ الآية"
            title="حفظ محلي"
          >
            {selectedBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <button type="button" title="لا يوجد تسجيل صوتي معتمد مربوط بهذه الشاشة" aria-label="استماع غير متاح" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
            <Headphones size={15} />
          </button>
          <button type="button" onClick={shareVerse} aria-label="مشاركة الآية">
            <Share2 size={15} />
          </button>
          <button type="button" onClick={copyVerse} aria-label="نسخ الآية">
            <Copy size={15} /> {copied ? "تم" : ""}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <SectionHead title="سياق الآيات" en="Verse Context" />
          {loading ? (
            <p className={styles.tafsir}>جارٍ تحميل السياق من المصحف المحلي…</p>
          ) : loadError ? (
            <p className={styles.tafsir}>{loadError}</p>
          ) : (
            <>
              <button type="button" className={styles.verseItem} onClick={() => prevVerse && selectAyah(prevVerse.ayah)} disabled={!prevVerse}>
                <span>الآية السابقة</span>
                <b>{prevVerse ? prevVerse.ayah : "—"}</b>
                <p>{prevVerse ? `${prevVerse.arabic.slice(0, 80)}…` : "لا توجد آية سابقة"}</p>
              </button>
              <button type="button" className={`${styles.verseItem} ${styles.current}`}>
                <span>الآية الحالية</span>
                <b>{selectedVerse ? selectedVerse.ayah : "—"}</b>
                <p>{selectedVerse ? `${selectedVerse.arabic.slice(0, 80)}…` : "—"}</p>
              </button>
              <button type="button" className={styles.verseItem} onClick={() => nextVerse && selectAyah(nextVerse.ayah)} disabled={!nextVerse}>
                <span>الآية التالية</span>
                <b>{nextVerse ? nextVerse.ayah : "—"}</b>
                <p>{nextVerse ? `${nextVerse.arabic.slice(0, 80)}…` : "لا توجد آية تالية"}</p>
              </button>
            </>
          )}
        </aside>

        <main className={styles.verseBox}>
          <h2>{currentChapter ? `سُورَةُ ${currentChapter.arabicName}` : "القرآن الكريم"}</h2>
          {loading ? (
            <p className={styles.arabic}>جارٍ فتح الآية…</p>
          ) : selectedVerse ? (
            <p className={styles.arabic} dir="rtl" lang="ar">
              {selectedVerse.arabic}
              <span>{selectedVerse.ayah}</span>
            </p>
          ) : (
            <p className={styles.arabic}>{loadError ?? "تعذر تحميل الآية."}</p>
          )}
          <p className={styles.en} style={{ opacity: 0.85 }}>
            لا تُعرض هنا ترجمة إنجليزية معتمدة — الترجمة الموثقة غير مربوطة بعد بمصدر مرخّص.
          </p>
          <small>
            سورة {currentChapter?.arabicName ?? surah} · الآية {ayah} · النص العربي من Tanzil Uthmani-min 1.1
          </small>
          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "0.7rem" }}>
            <button type="button" className="btn-outline" onClick={() => selectAyah(ayah - 1)} disabled={ayah <= 1}>
              <ChevronRight size={14} /> السابقة
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => selectAyah(ayah + 1)}
              disabled={!currentChapter || ayah >= currentChapter.ayahCount}
            >
              التالية <ChevronLeft size={14} />
            </button>
          </div>
        </main>

        <aside className={styles.panel}>
          <SectionHead title="التفسير والمصادر" en="Tafsir & Sources" />
          <div className={styles.srcTabs}>
            {TAFSIR_WORKS.map((item, i) => (
              <button key={item.work.workId} type="button" className={i === src ? styles.srcOn : ""} onClick={() => setSrc(i)}>
                {item.work.titleAr}
              </button>
            ))}
          </div>
          {activeTafsir ? (
            <div>
              <p className={styles.tafsir} style={{ fontWeight: 700 }}>
                {activeTafsir.work.titleAr} — {activeTafsir.work.authorAr}
              </p>
              <p className={styles.tafsir} style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                {activeTafsir.work.attributionCaveat}
              </p>
              <p className={styles.tafsir} style={{ fontSize: "0.82rem" }}>
                النص الكامل لهذا التفسير غير متاح داخل المنصة حتى مراجعة النسخة والحقوق
                ({activeTafsir.versionCount} نسخة فهرسية).
              </p>
              <p className={styles.tafsir} style={{ fontSize: "0.78rem", display: "flex", gap: 4, alignItems: "center" }}>
                <ShieldCheck size={13} /> الببليوغرافيا:{" "}
                {activeTafsir.work.bibliographicStatus === "verified_bibliographic" ? "موثقة" : "قيد المراجعة"} ·
                المراجعة العلمية: معلقة
              </p>
              <Link href="/library" className={styles.more}>
                فتح سجل العمل في المكتبة <ChevronLeft size={14} />
              </Link>
              {activeTafsir.versions.slice(0, 2).map((version) => (
                <p key={version.versionId} className={styles.tafsir} style={{ fontSize: "0.75rem" }}>
                  <a href={version.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink size={12} /> {version.openitiUri}
                  </a>
                </p>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      <div className={styles.bottom}>
        <section className={styles.panel}>
          <SectionHead title="معاني المفردات" en="Key Words & Meanings" />
          <p className={styles.tafsir} style={{ fontSize: "0.84rem" }}>
            معاني المفردات الموثقة غير مربوطة بعد بمصدر معتمد في هذا الإصدار — لا تُعرض هنا معانٍ
            مولّدة أو غير موثقة.
          </p>
        </section>
        <section className={styles.panel}>
          <SectionHead title="منهجية التدبر" en="Reflection & Contemplation" />
          <div className={styles.reflectTabs}>
            {["تأمل", "تطبيق", "أسئلة", "فوائد"].map((t) => (
              <button key={t} type="button" className={tab === t ? styles.srcOn : ""} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <ul className={styles.prompts}>
            <li>ما المعنى الذي يفتحه لك سياق هذه الآية ضمن سورتها؟</li>
            <li>كيف يتحول هذا المعنى إلى عمل صغير اليوم؟</li>
            <li>ما السؤال الذي تريد حمله إلى درس علم موثوق؟</li>
          </ul>
          <small style={{ opacity: 0.75 }}>أسئلة تدبر شخصية عامة — ليست تفسيرًا ولا فتوى.</small>
        </section>
        <section className={styles.panel}>
          <SectionHead title="ملاحظاتي وتطبيقاتي" en="My Notes & Application" />
          <textarea
            rows={5}
            value={selectedNote}
            onChange={(e) => saveNote(e.target.value)}
            placeholder="اكتب تأملاتك هنا..."
            aria-label="ملاحظة شخصية على الآية"
          />
          <button
            className="btn-gold"
            type="button"
            onClick={() => {
              setSavedFlash(true);
              window.setTimeout(() => setSavedFlash(false), 1600);
            }}
          >
            حفظ الملاحظة محليًا
          </button>
          <small style={{ display: "block", marginTop: "0.4rem", opacity: 0.75 }}>
            ملاحظة شخصية محلية على الآية {ayah} — ليست تفسيرًا ولا مادة مصدرية.
          </small>
          {savedFlash ? <div className={p.seal}>خُتم</div> : null}
        </section>
      </div>
    </div>
  );
}
