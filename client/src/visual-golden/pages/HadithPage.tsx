import { useEffect, useMemo, useState } from "react";
import { Search, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck, Database, Copy, Link2, Check } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { IsnadChain } from "@/visual-golden/components/unique/IsnadChain";
import p from "@/visual-golden/components/present/present.module.css";
import {
  COLLECTIONS,
  HADITH_COUNTS,
  LOCAL_SAMPLES,
  buildHadithDeepLink,
  buildHadithShareText,
  getCollection,
  getHadithCorpusStatus,
  searchSamples,
  type HadithCorpusStatus,
} from "@/visual-golden/services/hadith";
import styles from "./HadithPage.module.css";

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

  const results = useMemo(() => searchSamples(q, collectionId), [q, collectionId]);
  const active = results.find((sample) => sample.id === activeId) ?? results[0] ?? null;
  const activeCollection = active ? getCollection(active.collectionId) : null;
  const activeBookmarked = active ? bookmarks.includes(active.id) : false;

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
  }, [active]);

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

      {initial.invalidRequestedSample ? (
        <p className="muted" role="status" style={{ margin: "0.8rem 1.3rem 0", fontSize: "0.8rem" }}>
          السجل المطلوب غير موجود في العينات المحلية الحالية، لذلك عُرض أول سجل متاح دون اختراع بديل.
        </p>
      ) : null}

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
