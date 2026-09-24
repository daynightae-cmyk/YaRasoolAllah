import { useMemo, useState } from "react";
import { Copy, Bookmark, StickyNote } from "lucide-react";
import { BASIRAH_CATALOG, BASIRAH_MODES, type BasirahMode, type BasirahScope } from "@/visual-golden/mock/basirah";
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
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<BasirahScope>("all");
  const [mode, setMode] = useState<BasirahMode>("sourced");
  const [ran, setRan] = useState(false);

  const hits = useMemo(() => {
    const n = q.trim();
    return BASIRAH_CATALOG.filter((r) => {
      if (scope !== "all" && r.scope !== scope) return false;
      if (!n) return true;
      const hay = `${r.titleAr} ${r.titleEn} ${r.hintAr} ${r.hintEn} ${r.kindAr}`;
      return hay.toLowerCase().includes(n.toLowerCase()) || hay.includes(n);
    });
  }, [q, scope]);

  const modeLabel = (lang === "ar" ? BASIRAH_MODES.find((m) => m.id === mode)?.ar : BASIRAH_MODES.find((m) => m.id === mode)?.en) ?? mode;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.heroArt} src={art.library} alt="" />
        <p className="muted">{t(lang, "basirahSub")}</p>
        <h1>{lang === "ar" ? "بَصِيرَة" : "Basirah"}</h1>
        <p>
          {lang === "ar"
            ? "رفيق بحث يساعدك على الوصول إلى النصوص والمصادر وفهم مسارات المعرفة، مع إظهار المرجع وحدود الإجابة بوضوح."
            : "A research companion that helps you reach texts and sources, with citations and the limits of each answer made visible."}
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
