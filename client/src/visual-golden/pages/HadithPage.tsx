import { useMemo, useState } from "react";
import { Search, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Database } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { IsnadChain } from "@/visual-golden/components/unique/IsnadChain";
import p from "@/visual-golden/components/present/present.module.css";
import {
  COLLECTIONS,
  HADITH_COUNTS,
  getCollection,
  searchSamples,
} from "@/visual-golden/services/hadith";
import styles from "./HadithPage.module.css";

const BOOKMARK_KEY = "hadith-sample-bookmarks-v1";

function safeReadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const COLLECTION_ART = [art.books, art.bookStack, art.mushaf, art.lanternGlow, art.archesNight, art.mushafOpen];

export function HadithPage() {
  const [q, setQ] = useState("");
  const [collectionId, setCollectionId] = useState<string | "all">("all");
  const [activeId, setActiveId] = useState("bukhari-1");
  const [bookmarks, setBookmarks] = useState<string[]>(() => safeReadBookmarks());

  const results = useMemo(() => searchSamples(q, collectionId), [q, collectionId]);
  const active = results.find((sample) => sample.id === activeId) ?? results[0] ?? null;
  const activeCollection = active ? getCollection(active.collectionId) : null;
  const activeBookmarked = active ? bookmarks.includes(active.id) : false;

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

  return (
    <div className={styles.page}>
      <PageHero
        title="دار الحديث"
        subtitle={`ARCHIVE · ${HADITH_COUNTS.collections} مصنفات ببليوغرافية · ${HADITH_COUNTS.localSamples} سجلات محلية`}
        desc="أرشيف يفرّق بين بيانات المصنفات الببليوغرافية والسجلات التطويرية المحلية — العدد الكلي للمصنف ليس حجم المتن المحلي"
        image={art.shelves}
        wing="hadith"
      >
        <form className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في السجلات المحلية: النص، الراوي، الكتاب، الباب..."
          />
          <button className="btn-gold" type="submit">
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
        </div>
      </PageHero>

      <section className={styles.pad}>
        <SectionHead title="المصنفات الببليوغرافية" en="Collection Metadata — not local corpus" href="/library" />
        <div className={`${styles.grid} stagger`}>
          {COLLECTIONS.map((collection, i) => (
            <article key={collection.id} className={styles.card}>
              <img src={COLLECTION_ART[i % COLLECTION_ART.length]} alt="" />
              <div>
                <h3>{collection.nameAr}</h3>
                <p>{collection.compiler} (ت {collection.deathHijri}هـ)</p>
                <span>
                  العدد الببليوغرافي المعروف: {collection.totalHadithCount.toLocaleString("ar-EG")} حديث · غير
                  متاح محليًا
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.row}>
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
              <div className={styles.actions}>
                <button type="button" className={activeBookmarked ? styles.on : ""} onClick={toggleBookmark}>
                  {activeBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}{" "}
                  {activeBookmarked ? "محفوظ محليًا" : "حفظ محلي"}
                </button>
                <a href="https://dorar.net/hadith" target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                  ابحث في الموسوعة الحديثية لدى الدرر السنية <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
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
  );
}
