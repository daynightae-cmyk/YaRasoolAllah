import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, BookOpen, LibraryBig, Search } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { categoryLabel } from "@/visual-golden/services/library-catalog-presentation";
import {
  displayAuthor,
  displayTitle,
  hashWorkId,
  loadFullLibraryCatalog,
  type CatalogPayload,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import styles from "./CatalogShelfHall.module.css";

interface Props {
  query: string;
  initialCategory?: string;
  onOpen: (work: CatalogWork) => void;
}

const PAGE_SIZE = 96;
const SPINE_COLORS = [
  "#14372f", "#4a2418", "#192947", "#4a1f2c",
  "#0e3f35", "#5a3a17", "#28324d", "#3f243f",
];

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar");
}

function workMatches(work: CatalogWork, query: string) {
  const q = normalized(query.trim());
  if (!q) return true;
  return [
    work.titleAr,
    work.titleEn,
    work.authorAr,
    work.authorEn,
    work.category,
    work.subcategory,
  ].some((value) => value && normalized(value).includes(q));
}

export function CatalogShelfHall({ query, initialCategory, onOpen }: Props) {
  const lang = useInstitution((state) => state.lang);
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    loadFullLibraryCatalog()
      .then((data) => active && setPayload(data))
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "تعذر تحميل المكتبة.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setSubcategory(null);
      setPage(1);
    }
  }, [initialCategory]);

  const filteredByQuery = useMemo(
    () => payload?.works.filter((work) => workMatches(work, query)) ?? [],
    [payload, query],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const work of filteredByQuery) {
      const key = work.category || "UNCLASSIFIED";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredByQuery]);

  const categoryWorks = useMemo(
    () => category
      ? filteredByQuery.filter((work) => (work.category || "UNCLASSIFIED") === category)
      : [],
    [category, filteredByQuery],
  );

  const subcategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const work of categoryWorks) {
      const key = work.subcategory || (lang === "ar" ? "عام" : "General");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [categoryWorks, lang]);

  const visibleWorks = useMemo(() => {
    if (!subcategory) return categoryWorks;
    return categoryWorks.filter(
      (work) => (work.subcategory || (lang === "ar" ? "عام" : "General")) === subcategory,
    );
  }, [categoryWorks, lang, subcategory]);

  const totalPages = Math.max(1, Math.ceil(visibleWorks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageWorks = visibleWorks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category, subcategory]);

  if (error) {
    return <div className={styles.state} role="alert">{error}</div>;
  }

  if (!payload) {
    return <div className={styles.state} role="status">{lang === "ar" ? "جارٍ فتح قاعات المكتبة…" : "Opening the Library halls…"}</div>;
  }

  const labels = lang === "ar" ? {
    eyebrow: "المكتبة المعمارية الكاملة",
    title: "كل كتاب له مكان على الرف",
    body: "الفهرس لم يعد مخزنًا منفصلًا: الأعمال المصنفة تظهر هنا ككتب فعلية، وتُحمّل الرفوف تدريجيًا حتى لا تنهار الصفحة تحت آلاف الكتب.",
    domains: "أبواب العلوم",
    back: "العودة إلى أبواب المكتبة",
    shelves: "رفوف",
    books: "كتاب",
    results: "عمل ظاهر",
    allSub: "كل الرفوف",
    search: "البحث يعمل داخل كل الرفوف",
    page: "صفحة",
    open: "افتح الكتاب",
    unclassified: "قيد التصنيف",
  } : {
    eyebrow: "Complete architectural library",
    title: "Every catalogued work has a shelf",
    body: "The catalog is no longer a separate warehouse. Classified works appear here as books and shelves load progressively for scale.",
    domains: "Knowledge domains",
    back: "Back to Library domains",
    shelves: "shelves",
    books: "books",
    results: "visible works",
    allSub: "All shelves",
    search: "Search runs across every shelf",
    page: "Page",
    open: "Open book",
    unclassified: "Awaiting classification",
  };

  return (
    <section className={styles.library} aria-label={labels.eyebrow}>
      <header className={styles.header}>
        <div>
          <span>{labels.eyebrow}</span>
          <h2>{labels.title}</h2>
          <p>{labels.body}</p>
        </div>
        <div className={styles.stats}>
          <strong>{payload.counts.works.toLocaleString(lang)}</strong>
          <span>{labels.books}</span>
          <small>{payload.counts.digitalVersions.toLocaleString(lang)} {lang === "ar" ? "نسخة رقمية" : "digital versions"}</small>
        </div>
      </header>

      {!category ? (
        <>
          <div className={styles.domainTitle}>
            <LibraryBig size={19} />
            <strong>{labels.domains}</strong>
            <span><Search size={14} /> {labels.search}</span>
          </div>
          <div className={styles.domains}>
            {categoryCounts.map(([key, count]) => {
              const title = key === "UNCLASSIFIED" || key.startsWith("UNCLASSIFIED")
                ? labels.unclassified
                : categoryLabel(key, lang);
              return (
                <button
                  key={key}
                  type="button"
                  className={styles.domainBook}
                  onClick={() => setCategory(key)}
                >
                  <span className={styles.domainOrnament}>✦</span>
                  <strong>{title}</strong>
                  <small>{count.toLocaleString(lang)} {labels.books}</small>
                  <em>{lang === "ar" ? "ادخل القاعة" : "Enter hall"}</em>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className={styles.hallBar}>
            <button type="button" onClick={() => { setCategory(null); setSubcategory(null); }}>
              {lang === "ar" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {labels.back}
            </button>
            <div>
              <span>{labels.shelves}</span>
              <strong>{category.startsWith("UNCLASSIFIED") ? labels.unclassified : categoryLabel(category, lang)}</strong>
              <small>{visibleWorks.length.toLocaleString(lang)} {labels.results}</small>
            </div>
          </div>

          <nav className={styles.subcategories} aria-label={labels.shelves}>
            <button
              type="button"
              className={!subcategory ? styles.subOn : ""}
              onClick={() => setSubcategory(null)}
            >
              {labels.allSub}
              <small>{categoryWorks.length.toLocaleString(lang)}</small>
            </button>
            {subcategoryCounts.map(([key, count]) => (
              <button
                type="button"
                key={key}
                className={subcategory === key ? styles.subOn : ""}
                onClick={() => setSubcategory(key)}
              >
                {key}
                <small>{count.toLocaleString(lang)}</small>
              </button>
            ))}
          </nav>

          <div className={styles.shelfCase}>
            <div className={styles.books} role="list">
              {pageWorks.map((work) => {
                const hash = hashWorkId(work.id);
                const style = {
                  "--spine": SPINE_COLORS[hash % SPINE_COLORS.length],
                  "--height": `${142 + (hash % 54)}px`,
                  "--width": `${50 + (hash % 20)}px`,
                } as CSSProperties;
                return (
                  <div role="listitem" key={work.id} className={styles.bookWrap}>
                    <button
                      type="button"
                      className={styles.book}
                      style={style}
                      onClick={() => onOpen(work)}
                      aria-label={`${labels.open}: ${displayTitle(work, lang)}`}
                    >
                      <span className={styles.cap} />
                      <span className={styles.bookTitle}>{displayTitle(work, lang)}</span>
                      <span className={styles.bookAuthor}>{displayAuthor(work, lang)}</span>
                      <BookOpen size={13} className={styles.bookIcon} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className={styles.wood} aria-hidden="true" />
          </div>

          {totalPages > 1 ? (
            <nav className={styles.pagination} aria-label={labels.page}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                {lang === "ar" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              </button>
              <span>{labels.page} {currentPage.toLocaleString(lang)} / {totalPages.toLocaleString(lang)}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                {lang === "ar" ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
