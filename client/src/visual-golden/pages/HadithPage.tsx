import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Search, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Database, Copy, Link2, Check, ScrollText, NotebookPen, Boxes, Lamp, LibraryBig, Users, Tags, ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { IsnadChain } from "@/visual-golden/components/unique/IsnadChain";
import { getInteriorScene } from "@/visual-golden/services/interior-scenes";
import p from "@/visual-golden/components/present/present.module.css";
import {
  COLLECTIONS,
  HADITH_COUNTS,
  LOCAL_SAMPLES,
  buildHadithDeepLink,
  buildHadithShareText,
  establishedSeerahLinks,
  getCollection,
  getHadithCorpusStatus,
  searchSamples,
  type HadithCorpusStatus,
} from "@/visual-golden/services/hadith";
import styles from "./HadithPage.module.css";

// Three.js stays out of the initial chunk: the archive loads only when the
// visitor opts into the immersive study environment (directive §4.F).
const HadithArchive3D = lazy(() =>
  import("@/visual-golden/components/hadith/HadithArchive3D").then((module) => ({
    default: module.HadithArchive3D,
  })),
);

type CopyState = "idle" | "copied" | "error";
type CorpusState =
  | { state: "loading" }
  | { state: "ready"; payload: HadithCorpusStatus }
  | { state: "error"; message: string };

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy textarea path below.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

const BOOKMARK_KEY = "hadith-sample-bookmarks-v1";
const VISUALLY_HIDDEN_LABEL_STYLE = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function safeReadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const COLLECTION_ART = [art.books, art.bookStack, art.mushaf, art.lanternGlow, art.archesNight, art.mushafOpen];

function initialHadithSelection() {
  try {
    const params = new URLSearchParams(window.location.search);
    const requestedSampleId = params.get("sample");
    const requestedSample = requestedSampleId
      ? LOCAL_SAMPLES.find((sample) => sample.id === requestedSampleId) ?? null
      : null;
    const requestedCollection = params.get("collection");
    const validRequestedCollection =
      requestedCollection && COLLECTIONS.some((collection) => collection.id === requestedCollection)
        ? requestedCollection
        : null;
    return {
      activeId: requestedSample?.id ?? LOCAL_SAMPLES[0]?.id ?? "",
      collectionId: requestedSample?.collectionId ?? validRequestedCollection ?? "all",
      invalidRequestedSample: Boolean(requestedSampleId && !requestedSample),
    };
  } catch {
    return {
      activeId: LOCAL_SAMPLES[0]?.id ?? "",
      collectionId: "all" as const,
      invalidRequestedSample: false,
    };
  }
}

export function HadithPage() {
  const initial = useMemo(initialHadithSelection, []);
  const [q, setQ] = useState("");
  const [collectionId, setCollectionId] = useState<string | "all">(initial.collectionId);
  const [activeId, setActiveId] = useState(initial.activeId);
  const [bookmarks, setBookmarks] = useState<string[]>(() => safeReadBookmarks());
  const [matnCopy, setMatnCopy] = useState<CopyState>("idle");
  const [linkCopy, setLinkCopy] = useState<CopyState>("idle");
  const [corpusState, setCorpusState] = useState<CorpusState>({ state: "loading" });
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  // Deep link /hadith?archive=1 opens the archive hall directly (the unified
  // station log links straight into the immersive surface).
  const [archiveOpen, setArchiveOpen] = useState(
    () => new URLSearchParams(window.location.search).get("archive") === "1",
  );
  const [archiveFailed, setArchiveFailed] = useState(false);
  const [archiveLamp, setArchiveLamp] = useState(true);
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);
  const addNote = useInstitution((state) => state.addNote);

  const results = useMemo(() => searchSamples(q, collectionId), [q, collectionId]);
  const active = results.find((sample) => sample.id === activeId) ?? results[0] ?? null;
  const activeCollection = active ? getCollection(active.collectionId) : null;
  const activeBookmarked = active ? bookmarks.includes(active.id) : false;
  const seerahLinks = useMemo(() => active ? establishedSeerahLinks(active.id) : [], [active]);

  // Honest ledger numbers: the bibliographic sum is a sum of published
  // counts, never presented as local corpus size. Narrator count is derived
  // from the actual local registry — nothing typed by hand.
  const bibliographicTotal = useMemo(
    () => COLLECTIONS.reduce((sum, collection) => sum + collection.totalHadithCount, 0),
    [],
  );
  const narratorCount = useMemo(
    () => new Set(LOCAL_SAMPLES.map((sample) => sample.narratorAr)).size,
    [],
  );
  // Local records grouped by their real recorded book (باب/كتاب) — the
  // "browse by subject" rail shows only what the registry actually holds.
  const chapterGroups = useMemo(() => {
    const map = new Map<string, { book: string; count: number; firstId: string }>();
    for (const sample of results) {
      const entry = map.get(sample.bookNameAr);
      if (entry) entry.count += 1;
      else map.set(sample.bookNameAr, { book: sample.bookNameAr, count: 1, firstId: sample.id });
    }
    return [...map.values()];
  }, [results]);
  const recordListRef = useRef<HTMLElement | null>(null);
  const chapterListRef = useRef<HTMLElement | null>(null);
  const studyRef = useRef<HTMLDivElement | null>(null);
  // Feed filters are derived from real record fields and real local state —
  // "sahih" reads the recorded grade, "saved" reads the bookmark registry.
  const [feedFilter, setFeedFilter] = useState<"all" | "sahih" | "saved">("all");
  const feedResults = useMemo(() => {
    if (feedFilter === "sahih") return results.filter((sample) => sample.gradeAr.includes("صحيح"));
    if (feedFilter === "saved") return results.filter((sample) => bookmarks.includes(sample.id));
    return results;
  }, [results, feedFilter, bookmarks]);

  // A different record closes any open note draft — notes belong to a record.
  useEffect(() => {
    setNoteOpen(false);
    setNoteDraft("");
  }, [active?.id]);

  useEffect(() => {
    if (!active) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("sample", active.id);
      if (active.collectionId) url.searchParams.set("collection", active.collectionId);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // URL synchronization is a convenience; the archive must still work.
    }

    recordReadingProgress({
      id: `hadith:${active.id}`,
      surface: "hadith",
      path: `/hadith?sample=${encodeURIComponent(active.id)}${active.collectionId ? `&collection=${encodeURIComponent(active.collectionId)}` : ""}`,
      titleAr: "دار الحديث",
      titleEn: "Hadith Hall",
      locationAr: `${activeCollection?.nameAr ?? "سجل محلي"} · حديث رقم ${active.hadithNumber}`,
      locationEn: `${activeCollection?.nameEn ?? "Local record"} · Hadith ${active.hadithNumber}`,
      completed: null,
      total: null,
      unitAr: "سجلًا",
      unitEn: "records",
    });
  }, [active, activeCollection, recordReadingProgress]);

  useEffect(() => {
    const controller = new AbortController();
    getHadithCorpusStatus(controller.signal)
      .then((payload) => {
        if (!controller.signal.aborted) setCorpusState({ state: "ready", payload });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCorpusState({
          state: "error",
          message: error instanceof Error ? error.message : "تعذر تحميل حالة مزودي الحديث.",
        });
      });
    return () => controller.abort();
  }, []);

  const toggleBookmark = () => {
    if (!active) return;
    const next = activeBookmarked
      ? bookmarks.filter((id) => id !== active.id)
      : [...bookmarks, active.id];
    setBookmarks(next);
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    } catch {
      // bookmark remains in-memory
    }
  };

  const copyMatn = async () => {
    if (!active || !activeCollection) return;
    setMatnCopy("idle");
    const ok = await copyTextToClipboard(buildHadithShareText(active, activeCollection.nameAr));
    setMatnCopy(ok ? "copied" : "error");
  };

  const copyLink = async () => {
    if (!active) return;
    setLinkCopy("idle");
    let absolute = buildHadithDeepLink(active.id, active.collectionId);
    try {
      absolute = new URL(absolute, window.location.href).toString();
    } catch {
      // Keep the relative deep link if the absolute URL cannot be built.
    }
    const ok = await copyTextToClipboard(absolute);
    setLinkCopy(ok ? "copied" : "error");
  };

  const saveRecordNote = () => {
    if (!active || !activeCollection) return;
    const body = noteDraft.trim();
    if (!body) return;
    // The note carries the governed share text so the saved note keeps the
    // record's identity, grading attribution and development-sample label.
    addNote(
      `${activeCollection.nameAr} · حديث ${active.hadithNumber}`,
      `${body}\n\n${buildHadithShareText(active, activeCollection.nameAr)}`,
    );
    setNoteDraft("");
    setNoteOpen(false);
  };

  const archiveScene = useMemo(() => getInteriorScene("hadith-archive"), []);
  const archiveAvailable = !!archiveScene && !archiveFailed;
  const showArchive = archiveOpen && archiveAvailable;

  return (
    <div className={styles.page}>
      {showArchive && archiveScene ? (
        <Suspense fallback={<div className={styles.archiveLoading} role="status">جارٍ تهيئة دار الحديث ثلاثية الأبعاد…</div>}>
          <HadithArchive3D
            scene={archiveScene}
            lampOn={archiveLamp}
            onExit={() => setArchiveOpen(false)}
            onUnavailable={() => {
              setArchiveFailed(true);
              setArchiveOpen(false);
            }}
            overlay={
              <div className={styles.archiveCard} data-visual="hadith-archive-record">
                {active && activeCollection ? (
                  <>
                    <div className={styles.archiveCardHead}>
                      <strong>
                        {activeCollection.nameAr} · حديث {active.hadithNumber}
                      </strong>
                      <span className={styles.archiveSample}>عينة تطوير — قيد المراجعة التحريرية</span>
                    </div>
                    <p className={styles.archiveMatn} dir="rtl" lang="ar">
                      {active.textAr}
                    </p>
                    <p className={styles.archiveMeta}>
                      {active.bookNameAr} · {active.chapterNameAr} · الراوي: {active.narratorAr}
                    </p>
                    <p className={styles.archiveMeta}>
                      الدرجة: {active.gradeAr} · المصدر: {active.gradeSource}
                    </p>
                    <div className={styles.archiveRecords} role="tablist" aria-label="السجلات المحلية">
                      {results.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          role="tab"
                          aria-selected={sample.id === active.id}
                          className={sample.id === active.id ? styles.archiveRecordOn : ""}
                          onClick={() => setActiveId(sample.id)}
                        >
                          {getCollection(sample.collectionId)?.nameAr} · {sample.hadithNumber}
                        </button>
                      ))}
                    </div>
                    <div className={styles.archiveCardTools}>
                      <button type="button" className={activeBookmarked ? styles.archiveToolOn : ""} onClick={toggleBookmark}>
                        {activeBookmarked ? <BookmarkCheck size={13} aria-hidden /> : <Bookmark size={13} aria-hidden />}
                        {activeBookmarked ? "محفوظ" : "حفظ"}
                      </button>
                      <button type="button" onClick={copyMatn} aria-live="polite">
                        {matnCopy === "copied" ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
                        {matnCopy === "copied" ? "تم النسخ" : "نسخ المتن"}
                      </button>
                      <button
                        type="button"
                        className={archiveLamp ? styles.archiveToolOn : ""}
                        onClick={() => setArchiveLamp((value) => !value)}
                      >
                        <Lamp size={13} aria-hidden /> {archiveLamp ? "إطفاء المصباح" : "إضاءة المصباح"}
                      </button>
                      <a href="https://dorar.net/hadith" target="_blank" rel="noopener noreferrer">
                        البحث والتحقق <ExternalLink size={12} aria-hidden />
                      </a>
                      <button type="button" onClick={() => setArchiveOpen(false)}>
                        الأرشيف الكامل والفهرس
                      </button>
                    </div>
                  </>
                ) : (
                  <p className={styles.archiveMeta}>لا توجد سجلات محلية مطابقة للبحث الحالي.</p>
                )}
              </div>
            }
          />
        </Suspense>
      ) : (
        <section className={styles.archiveHero} data-visual="hadith-archive-hero">
          <img className={styles.heroImg} src={worldPlateForWing("hadith").plate} alt="" />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroBody}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}><LibraryBig size={15} aria-hidden="true" /> دار الحديث النبوي</span>
              <h1>أرشيف الحديث الشريف</h1>
              <p className={styles.heroDesc}>
                موسوعة رقمية تجمع كتب السنة المعتمدة وشروحها، مع أدوات بحث ودراسة —
                وعدد صادق: {HADITH_COUNTS.collections} مصنفات ببليوغرافية و{HADITH_COUNTS.localSamples} سجلات
                محلية قيد المراجعة. العدد الكلي للمصنف ليس حجم المتن المحلي.
              </p>
              <div className={styles.heroServices}>
                <span><ShieldCheck size={15} aria-hidden="true" /> كتب السنة المعتمدة بتحقاقات موثقة</span>
                <span><Users size={15} aria-hidden="true" /> أسانيد ورواة بخرائط مختصرة</span>
                <span><Search size={15} aria-hidden="true" /> بحث متقدم وفهرسة موضوعية</span>
              </div>
              {archiveAvailable ? (
                <button type="button" className={styles.heroCta} onClick={() => setArchiveOpen(true)}>
                  <Boxes size={16} aria-hidden="true" /> ادخل دار الحديث ثلاثية الأبعاد
                </button>
              ) : null}
            </div>
            <div className={styles.heroLedger} aria-label="أعداد الأرشيف">
              <div>
                <strong>{bibliographicTotal.toLocaleString("ar-EG")}</strong>
                <span>حديثًا — عدد ببليوغرافي مجموع</span>
              </div>
              <div>
                <strong>{HADITH_COUNTS.collections.toLocaleString("ar-EG")}</strong>
                <span>كتب رئيسة</span>
              </div>
              <div>
                <strong>{narratorCount.toLocaleString("ar-EG")}</strong>
                <span>رواة في السجلات المحلية</span>
              </div>
              <div>
                <strong>{HADITH_COUNTS.localSamples.toLocaleString("ar-EG")}</strong>
                <span>سجلات محلية قيد المراجعة</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full-width search bar + scope tabs, as in the approved composition. */}
      <div className={styles.searchDeck} data-visual="hadith-search-deck">
        <div className={styles.scopeTabs} role="tablist" aria-label="نطاق البحث">
          <button
            type="button"
            role="tab"
            aria-selected={collectionId === "all"}
            className={collectionId === "all" ? styles.scopeOn : ""}
            onClick={() => setCollectionId("all")}
          >
            <Search size={14} aria-hidden="true" /> بحث شامل
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={collectionId !== "all"}
            className={collectionId !== "all" ? styles.scopeOn : ""}
            onClick={() => setCollectionId(collectionId === "all" ? COLLECTIONS[0].id : collectionId)}
          >
            <BookOpen size={14} aria-hidden="true" /> حسب الكتاب
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={() => { setCollectionId("all"); setQ(""); recordListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          >
            <Users size={14} aria-hidden="true" /> حسب الراوي
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            onClick={() => { setCollectionId("all"); setQ(""); chapterListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          >
            <Tags size={14} aria-hidden="true" /> حسب الموضوع
          </button>
        </div>
        <form className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <Search size={16} aria-hidden="true" />
          <label htmlFor="hadith-local-search" style={VISUALLY_HIDDEN_LABEL_STYLE}>
            البحث في السجلات المحلية
          </label>
          <input
            id="hadith-local-search"
            aria-label="البحث في السجلات المحلية"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في السجلات المحلية: النص، الراوي، الكتاب، الباب، أو رقم الحديث..."
          />
          <button className="btn-gold" type="submit" aria-label="ابحث في السجلات المحلية">
            بحث
          </button>
        </form>
        <div className={styles.chips}>
          <button type="button" onClick={() => setCollectionId("all")} className={collectionId === "all" ? styles.on : ""}>
            كل السجلات المحلية ({HADITH_COUNTS.localSamples})
          </button>
          {COLLECTIONS.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => setCollectionId(collection.id)}
              className={collectionId === collection.id ? styles.on : ""}
            >
              {collection.nameAr}
            </button>
          ))}
          {(q || collectionId !== "all") ? (
            <button type="button" className={styles.resetChip} onClick={() => { setQ(""); setCollectionId("all"); }}>
              <RotateCcw size={13} aria-hidden="true" /> إعادة تعيين
            </button>
          ) : null}
        </div>
      </div>

      {archiveAvailable && !showArchive ? (
        <button
          type="button"
          className={styles.archiveEnter}
          data-visual="hadith-archive-enter"
          onClick={() => setArchiveOpen(true)}
        >
          <Boxes size={15} aria-hidden />
          ادخل دار الحديث ثلاثية الأبعاد — دراسة وتخريج
        </button>
      ) : null}

      {initial.invalidRequestedSample ? (
        <p className="muted" role="status" style={{ margin: "0.8rem 1.3rem 0", fontSize: "0.8rem" }}>
          السجل المطلوب غير موجود في العينات المحلية الحالية، لذلك عُرض أول سجل متاح دون اختراع بديل.
        </p>
      ) : null}

      {/* The full archive stays mounted while the 3D study room is open;
          it is only visually hidden (state, search and notes keep working). */}
      <div className={showArchive ? styles.archiveHidden : undefined}>
      <section className={styles.pad} data-visual="hadith-collection-shelf">
        <SectionHead title="أبرز كتب الحديث" en="Collection Metadata — not local corpus" href="/library" />
        <div className={`${styles.grid} stagger`}>
          {COLLECTIONS.map((collection, i) => {
            const localCount = LOCAL_SAMPLES.filter((sample) => sample.collectionId === collection.id).length;
            return (
              <button
                key={collection.id}
                type="button"
                className={`${styles.card} ${collectionId === collection.id ? styles.cardOn : ""}`}
                onClick={() => setCollectionId(collection.id)}
                aria-pressed={collectionId === collection.id}
                aria-label={`تصفح السجلات المحلية من ${collection.nameAr}`}
              >
                <img src={COLLECTION_ART[i % COLLECTION_ART.length]} alt="" />
                <div>
                  <span className={styles.countBadge}>
                    {collection.totalHadithCount.toLocaleString("ar-EG")} أحاديث
                  </span>
                  <h3>{collection.nameAr}</h3>
                  <p>{collection.compiler} (ت {collection.deathHijri}هـ)</p>
                  <span>
                    {localCount > 0
                      ? `${localCount.toLocaleString("ar-EG")} سجلات محلية من هذا المصنف · المتن الكامل غير متاح محليًا`
                      : "العدد ببليوغرافي معروف · لا سجلات محلية بعد"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Three-column browsing deck, as in the approved composition:
          subjects rail · hadith feed · books rail. Every card is a real
          local record; nothing is padded with invented ahadith. */}
      <div className={styles.browseDeck} data-visual="hadith-browse-deck">
        <aside className={styles.railPanel} ref={chapterListRef} aria-label="تصفح الأحاديث حسب الموضوع">
          <SectionHead title="تصفح حسب كتب الأبواب" en="By recorded book" />
          <div className={styles.railList}>
            {chapterGroups.map((group) => (
              <button
                key={group.book}
                type="button"
                onClick={() => { setActiveId(group.firstId); studyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              >
                <Tags size={14} aria-hidden="true" />
                <strong>{group.book}</strong>
                <small>({group.count.toLocaleString("ar-EG")} سجلات)</small>
              </button>
            ))}
            {chapterGroups.length === 0 ? <p className="muted">لا أبواب مطابقة للبحث الحالي.</p> : null}
          </div>
          <p className={styles.railNote}>
            الأعداد هنا للسجلات المحلية فقط — الأبواب الكاملة للمصنفات غير محمّلة بعد.
          </p>
        </aside>

        <section className={styles.feed} aria-label="السجلات المحلية" ref={recordListRef}>
          <div className={styles.feedTabs} role="tablist" aria-label="تصفية السجلات">
            <button
              type="button"
              role="tab"
              aria-selected={feedFilter === "all"}
              className={feedFilter === "all" ? styles.feedTabOn : styles.feedTab}
              onClick={() => setFeedFilter("all")}
            >
              <BookOpen size={14} aria-hidden="true" /> كل السجلات ({results.length.toLocaleString("ar-EG")})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={feedFilter === "sahih"}
              className={feedFilter === "sahih" ? styles.feedTabOn : styles.feedTab}
              onClick={() => setFeedFilter("sahih")}
            >
              <ShieldCheck size={14} aria-hidden="true" /> أحاديث صحيحة
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={feedFilter === "saved"}
              className={feedFilter === "saved" ? styles.feedTabOn : styles.feedTab}
              onClick={() => setFeedFilter("saved")}
            >
              <Bookmark size={14} aria-hidden="true" /> المحفوظة ({results.filter((s) => bookmarks.includes(s.id)).length.toLocaleString("ar-EG")})
            </button>
            <span className={styles.feedTabNote}>عينة تطوير — قيد المراجعة التحريرية</span>
          </div>
          {feedResults.map((sample) => {
            const collection = getCollection(sample.collectionId);
            const saved = bookmarks.includes(sample.id);
            return (
              <article
                key={sample.id}
                className={`${styles.feedCard} ${active?.id === sample.id ? styles.feedCardOn : ""}`}
                data-hadith-card={sample.id}
              >
                <header>
                  <span className={styles.feedCollection}>{collection?.nameAr}</span>
                  <span className={styles.feedBook}>{sample.bookNameAr} · {sample.chapterNameAr}</span>
                  <button
                    type="button"
                    className={saved ? styles.feedSaveOn : styles.feedSave}
                    aria-label={saved ? `إزالة حفظ حديث ${sample.hadithNumber}` : `حفظ حديث ${sample.hadithNumber} محليًا`}
                    aria-pressed={saved}
                    onClick={() => {
                      setActiveId(sample.id);
                      setBookmarks((current) =>
                        current.includes(sample.id)
                          ? current.filter((id) => id !== sample.id)
                          : [...current, sample.id],
                      );
                    }}
                  >
                    {saved ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
                  </button>
                </header>
                <p className={styles.feedMatn} dir="rtl" lang="ar">{sample.textAr}</p>
                <footer>
                  <span><Users size={13} aria-hidden="true" /> الراوي: {sample.narratorAr}</span>
                  <span><ShieldCheck size={13} aria-hidden="true" /> درجة الحديث: {sample.gradeAr}</span>
                  <span># رقم الحديث: {sample.hadithNumber.toLocaleString("ar-EG")}</span>
                  <button
                    type="button"
                    className={styles.feedOpen}
                    onClick={() => { setActiveId(sample.id); studyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  >
                    عرض التفاصيل <ArrowLeft size={13} aria-hidden="true" />
                  </button>
                </footer>
              </article>
            );
          })}
          {feedResults.length === 0 ? (
            <p className={styles.feedEmpty} role="status">
              {feedFilter === "saved"
                ? "لا سجلات محفوظة ضمن هذا النطاق بعد — احفظ حديثًا من زر العلامة ليظهر هنا."
                : "لا نتائج محلية لهذا البحث — جرّب نصًا آخر أو أعد تعيين النطاق."}
            </p>
          ) : null}
        </section>

        <aside className={styles.railPanel} aria-label="تصفح حسب كتب السنة">
          <SectionHead title="تصفح حسب كتب السنة" en="The six books" />
          <div className={styles.railList}>
            {COLLECTIONS.map((collection) => (
              <button
                key={collection.id}
                type="button"
                className={collectionId === collection.id ? styles.railOn : ""}
                onClick={() => setCollectionId(collection.id)}
              >
                <BookOpen size={14} aria-hidden="true" />
                <strong>{collection.nameAr}</strong>
                <small>({collection.totalHadithCount.toLocaleString("ar-EG")})</small>
              </button>
            ))}
          </div>
          <button type="button" className={styles.railAll} onClick={() => setCollectionId("all")}>
            عرض كل السجلات <ArrowLeft size={13} aria-hidden="true" />
          </button>
          <p className={styles.railNote}>
            الأعداد ببليوغرافية معروفة للمصنفات — المتن الكامل غير متاح محليًا.
          </p>
        </aside>
      </div>

      <section className={styles.scopeSection}>
        <article className={styles.scopePanel} data-visual="hadith-corpus-scope">
          <SectionHead title="نطاق المحتوى الحالي" en="Corpus scope" />
          {corpusState.state === "loading" ? (
            <p className={styles.scopeStatus} role="status">جارٍ التحقق من سجلات مزودي الحديث...</p>
          ) : corpusState.state === "error" ? (
            <p className={styles.scopeStatus} role="alert">
              تعذر تحميل حالة المزودين: {corpusState.message}. النطاق المحلي يظل {HADITH_COUNTS.localSamples} سجلات قيد المراجعة.
            </p>
          ) : (
            <>
              <p className={styles.scopeSummary}>
                <strong>{corpusState.payload.localSampleCount}</strong> سجلات محلية · {" "}
                <strong>{corpusState.payload.collectionCount}</strong> مصنفات ببليوغرافية · المتن الكامل غير متاح.
              </p>
              <p className={styles.scopeBlocker}>
                حالة المتن الكامل: محجوبة حتى تتوفر بيانات الاعتماد، ومراجعة الحقوق، ومراجعة تحريرية.
              </p>
              <ul className={styles.providerList} aria-label="حالة مزودي الحديث">
                {corpusState.payload.providers.map((provider) => (
                  <li key={provider.providerId} data-provider-state={provider.integrationState}>
                    <div>
                      <strong>{provider.provider}</strong>
                      <span>{provider.message}</span>
                      <small>{provider.rightsState} · {provider.contentAvailability}</small>
                    </div>
                    <span className={styles.providerState}>
                      {provider.integrationState === "credential_blocked" ? "محجوب: يحتاج بيانات اعتماد" : "مرجع خارجي فقط"}
                    </span>
                    <a href={provider.canonicalUrl} target="_blank" rel="noreferrer">
                      فتح السجل <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </section>

      <div className={styles.row} ref={studyRef}>
        <article className={styles.hotd}>
          <SectionHead
            title={active ? `السجل المحلي: ${activeCollection?.nameAr ?? ""}` : "السجل المحلي"}
            en={active ? `Hadith ${active.hadithNumber} · development sample` : "Local sample"}
          />
          {active && activeCollection ? (
            <>
              <div className={p.parchment}>
                <blockquote style={{ margin: 0 }}>
                  نص عينة تطويرية منسوبة للحديث، قيد مراجعة النقل والتخريج:
                  <br />
                  {active.textAr}
                </blockquote>
                <p style={{ margin: "0.6rem 0 0", fontSize: "0.8rem" }}>
                  {active.bookNameAr} · {active.chapterNameAr} · حديث رقم {active.hadithNumber}
                </p>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", opacity: 0.85 }}>
                  الراوي: {active.narratorAr}
                </p>
                <div className={p.seal}>عينة تطوير</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.8rem", fontSize: "0.78rem" }}>
                <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <Database size={13} /> الترجمة التطويرية (إنجليزية):
                </span>
                <p className="muted" dir="ltr" style={{ margin: 0, textAlign: "left" }}>
                  {active.textEn}
                </p>
                <span>
                  الدرجة: {active.gradeAr} · المصدر: {active.gradeSource}
                </span>
                <span>مقيّم الدرجة: {active.gradeAssessor ?? "غير مذكور في السجل — لم يُخترع"}</span>
                <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <ShieldCheck size={13} /> المراجعة التحريرية: {active.editorialReviewStatus === "editorial_review_pending" ? "قيد المراجعة التحريرية" : active.editorialReviewStatus}
                </span>
                <span>الإتاحة: عينة تطوير محلية — ليست متنًا إنتاجيًا</span>
                <span className="muted">المنشأ: {active.provenance}</span>
              </div>

              <p className="muted" style={{ margin: "0.85rem 0 0.35rem", fontSize: "0.78rem" }}>
                الراوي المسجل — السلسلة الكاملة غير متوفرة كبنية بيانات
              </p>
              <IsnadChain narrator={active.narratorAr} collection={activeCollection.nameAr} />

              {seerahLinks.length > 0 || active.relatedSeerahTopic || active.relatedQuranAyah ? (
                <div className={styles.crossLinks} data-visual="hadith-cross-links">
                  <span className={styles.crossLinksTitle}>
                    <ScrollText size={13} aria-hidden="true" /> روابط مثبتة في البيانات
                  </span>
                  {seerahLinks.map((link) => (
                    <Link key={link.eventId} href={link.href} className={styles.crossLink}>
                      <strong>السيرة: {link.titleAr}</strong>
                      <small>{link.noteAr}</small>
                    </Link>
                  ))}
                  {active.relatedSeerahTopic ? (
                    <span className={styles.crossTopic}>
                      موضوع سيري مسجل: {active.relatedSeerahTopic}
                    </span>
                  ) : null}
                  {active.relatedQuranAyah ? (
                    <span className={styles.crossTopic}>
                      صلة قرآنية مسجلة: {active.relatedQuranAyah}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className={styles.actions}>
                <button type="button" className={activeBookmarked ? styles.on : ""} onClick={toggleBookmark}>
                  {activeBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}{" "}
                  {activeBookmarked ? "محفوظ محليًا" : "حفظ محلي"}
                </button>
                <button
                  type="button"
                  data-visual="hadith-note"
                  className={noteOpen ? styles.on : ""}
                  aria-expanded={noteOpen}
                  onClick={() => setNoteOpen((value) => !value)}
                >
                  <NotebookPen size={14} /> ملاحظة على السجل
                </button>
                <button type="button" onClick={copyMatn} aria-live="polite">
                  {matnCopy === "copied" ? <Check size={14} /> : <Copy size={14} />}{" "}
                  {matnCopy === "copied" ? "تم نسخ المتن" : matnCopy === "error" ? "تعذر النسخ" : "نسخ المتن"}
                </button>
                <button type="button" onClick={copyLink} aria-live="polite">
                  {linkCopy === "copied" ? <Check size={14} /> : <Link2 size={14} />}{" "}
                  {linkCopy === "copied" ? "تم نسخ الرابط" : linkCopy === "error" ? "تعذر نسخ الرابط" : "نسخ رابط السجل"}
                </button>
                <a href="https://dorar.net/hadith" target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  ابحث في الموسوعة الحديثية لدى الدرر السنية <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
              {noteOpen ? (
                <div className={styles.notePanel} data-visual="hadith-note-panel">
                  <label htmlFor="hadith-record-note">ملاحظة شخصية على هذا السجل — تُحفظ محليًا وليست تخريجًا أو حكمًا</label>
                  <textarea
                    id="hadith-record-note"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="اكتب ملاحظتك… يُرفق بها نص السجل وبيانات درجته كما هي."
                    rows={3}
                  />
                  <div className={styles.noteActions}>
                    <button type="button" disabled={!noteDraft.trim()} onClick={saveRecordNote}>حفظ الملاحظة</button>
                    <button type="button" onClick={() => setNoteOpen(false)}>إلغاء</button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="muted">لا توجد سجلات محلية مطابقة للبحث الحالي.</p>
          )}
        </article>

        <article className={styles.panel}>
          <SectionHead title="السجلات المحلية المتاحة" en={`${results.length} local records`} />
          <div className={styles.topics} style={{ gridTemplateColumns: "1fr" }}>
            {results.map((sample) => {
              const collection = getCollection(sample.collectionId);
              return (
                <button
                  key={sample.id}
                  type="button"
                  className={active?.id === sample.id ? styles.on : ""}
                  onClick={() => setActiveId(sample.id)}
                  style={{ textAlign: "start" }}
                >
                  {collection?.nameAr} · حديث {sample.hadithNumber} — {sample.chapterNameAr}
                </button>
              );
            })}
            {results.length === 0 ? <p className="muted">لا نتائج محلية لهذا البحث.</p> : null}
          </div>
        </article>

        <article className={styles.panel}>
          <SectionHead title="تنبيه الأرشيف" en="Corpus honesty" />
          <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.9 }}>
            الأعداد المعروضة على بطاقات المصنفات هي أعداد ببليوغرافية معروفة للمصنف، وليست حجم
            المتن المحلي. المتاح محليًا هو {HADITH_COUNTS.localSamples} سجلات تطويرية فقط، كل
            منها قيد المراجعة التحريرية، ولا تُقدَّم على أنها المتن الكامل لأي مصنف.
          </p>
          <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.9 }}>
            رابط الدرر السنية يفتح المصدر الخارجي للبحث والتحقق، ولا يعني اعتماد نص العينة المحلية أو درجتها.
          </p>
        </article>
      </div>
      </div>
    </div>
  );
}
