import { useEffect, useMemo, useState } from "react";
import { Copy, Bookmark, StickyNote } from "lucide-react";
import {
  BASIRAH_MODES,
  buildLocalIndex,
  searchBasirah,
  surahRecords,
  type BasirahMode,
  type BasirahRecord,
  type BasirahScope,
} from "@/visual-golden/services/basirah";
import { getQuranChapters } from "@/services/quranService";
import {
  searchVerifiedQuran,
  type QuranSearchHit,
} from "@/visual-golden/services/quran-search";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import { BasirahResearchBox } from "@/visual-golden/components/basirah/BasirahResearchBox";
import { BasirahModeSelector } from "@/visual-golden/components/basirah/BasirahModeSelector";
import { BasirahAnswer } from "@/visual-golden/components/basirah/BasirahAnswer";
import { BasirahSourceRail } from "@/visual-golden/components/basirah/BasirahSourceRail";
import { BasirahRelatedPath } from "@/visual-golden/components/basirah/BasirahRelatedPath";
import styles from "@/visual-golden/components/basirah/basirah.module.css";

export function BasirahPage() {
  const lang = useInstitution((s) => s.lang);
  const addNote = useInstitution((s) => s.addNote);
  const toggleFavorite = useInstitution((s) => s.toggleFavorite);
  const [q, setQ] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("q") ?? "";
    } catch {
      return "";
    }
  });
  const [scope, setScope] = useState<BasirahScope>("all");
  const [mode, setMode] = useState<BasirahMode>("sourced");
  const [ran, setRan] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).has("q");
    } catch {
      return false;
    }
  });
  const [surahs, setSurahs] = useState<BasirahRecord[]>([]);
  const [quranHits, setQuranHits] = useState<QuranSearchHit[]>([]);
  const [quranSearchState, setQuranSearchState] = useState<"idle" | "loading" | "ready">("idle");

  const localIndex = useMemo(() => buildLocalIndex(), []);
  const quranRecords = useMemo<BasirahRecord[]>(
    () =>
      quranHits.map((hit) => ({
        id: `quran-ayah-${hit.surah}-${hit.ayah}`,
        scope: "quran",
        titleAr: `سورة ${hit.surahName} · الآية ${hit.ayah}`,
        titleEn: `Quran ${hit.surah}:${hit.ayah}`,
        kindAr: "آية من المصحف المحلي الموثق",
        kindEn: "verified local Quran verse",
        path: `/quran?surah=${hit.surah}&ayah=${hit.ayah}`,
        hintAr: hit.arabic,
        hintEn: `Tanzil Uthmani-min 1.1 · ${hit.surah}:${hit.ayah}`,
        availabilityAr: "النص العربي المحلي متاح · لا ترجمة أو تفسير مضمّن في نتيجة البحث",
      })),
    [quranHits],
  );
  const index = useMemo(
    () => [...quranRecords, ...surahs, ...localIndex],
    [quranRecords, surahs, localIndex],
  );

  useEffect(() => {
    let cancelled = false;
    getQuranChapters()
      .then((chapters) => {
        if (!cancelled) setSurahs(surahRecords(chapters));
      })
      .catch(() => {
        if (!cancelled) setSurahs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const query = q.trim();
    if ((scope !== "all" && scope !== "quran") || query.length < 2) {
      setQuranHits([]);
      setQuranSearchState("idle");
      return () => {
        cancelled = true;
      };
    }

    setQuranSearchState("loading");
    const timer = window.setTimeout(() => {
      searchVerifiedQuran(query, 30)
        .then((items) => {
          if (!cancelled) {
            setQuranHits(items);
            setQuranSearchState("ready");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setQuranHits([]);
            setQuranSearchState("ready");
          }
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, scope]);

  const hits = useMemo(() => searchBasirah(index, q, scope), [index, q, scope]);

  const modeLabel = (lang === "ar" ? BASIRAH_MODES.find((m) => m.id === mode)?.ar : BASIRAH_MODES.find((m) => m.id === mode)?.en) ?? mode;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.heroArt} src={art.library} alt="" />
        <p className="muted">{t(lang, "basirahSub")}</p>
        <h1>{lang === "ar" ? "بَصِيرَة" : "Basirah"}</h1>
        <p>
          {lang === "ar"
            ? `رفيق اكتشاف المصادر المحلية — ${surahs.length + localIndex.length} سجلًا فهرسيًا، مع بحث نصي في المصحف العربي الكامل عند الاستعلام. بصيرة ليست مفتيًا ولا محرك فتوى.`
            : `Local source-discovery companion — ${surahs.length + localIndex.length} catalog records plus query-time search across the full local Arabic Quran. Basirah is not a mufti or fatwa engine.`}
        </p>
        <span className={styles.boundary}>{t(lang, "basirahBoundary")}</span>
      </header>

      <div className={styles.desk}>
        <section className={styles.surface}>
          <BasirahResearchBox
            value={q}
            onChange={setQ}
            onSubmit={() => setRan(true)}
            placeholder={t(lang, "basirahAsk")}
            submitLabel={lang === "ar" ? "ابحث" : "Search"}
          />
          <BasirahModeSelector scope={scope} mode={mode} lang={lang} onScope={setScope} onMode={setMode} />

          <div className={styles.thread} aria-hidden>
            <span>{lang === "ar" ? "استعلام" : "Query"}</span>
            <i />
            <span>{lang === "ar" ? "مصدر" : "Source"}</span>
            <i />
            <span>{lang === "ar" ? "موضع" : "Passage"}</span>
            <i />
            <span>{lang === "ar" ? "شرح" : "Explanation"}</span>
          </div>

          {quranSearchState === "loading" ? (
            <p className="muted" role="status">
              {lang === "ar" ? "جارٍ البحث في نص القرآن المحلي الموثق…" : "Searching the verified local Quran text…"}
            </p>
          ) : null}
          <BasirahRelatedPath records={hits} lang={lang} />
          <BasirahAnswer lang={lang} ran={ran} hitCount={hits.length} modeLabel={modeLabel} />

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() =>
                addNote(lang === "ar" ? "بحث بصيرة" : "Basirah research", q || (lang === "ar" ? "مسودة فارغة" : "Empty draft"))
              }
            >
              <StickyNote size={14} /> {lang === "ar" ? "حفظ في الملاحظات" : "Save to notes"}
            </button>
            <button type="button" onClick={() => toggleFavorite({ id: "basirah-query", title: q || "بصيرة", path: "/basirah" })}>
              <Bookmark size={14} /> {lang === "ar" ? "حفظ" : "Save"}
            </button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(q)}>
              <Copy size={14} /> {lang === "ar" ? "نسخ" : "Copy"}
            </button>
          </div>
        </section>

        <BasirahSourceRail records={hits} lang={lang} title={lang === "ar" ? "سكة المصادر" : "Source rail"} />
      </div>
    </div>
  );
}
