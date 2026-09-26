import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, Info, Search, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { getLibraryBook, getLibraryBookByOpenitiUri } from "@/visual-golden/services/library";
import { loadFullLibraryCatalog } from "@/visual-golden/services/catalog-library";
import {
  availabilityLabel,
  availabilityState,
  categoryLabel,
  formatLabel,
  resolveCatalogWorkId,
  rightsLabel,
  type AvailabilityState,
  type CatalogDigitalEvidence,
  type LibraryUiLanguage,
} from "@/visual-golden/services/library-catalog-presentation";
import styles from "./LibraryCatalog.module.css";

interface CatalogDigitalVersion extends CatalogDigitalEvidence {
  id: string;
  provider: string;
  download: string;
}

interface CatalogWork {
  id: string;
  titleAr: string | null;
  titleEn: string | null;
  authorAr: string | null;
  authorEn: string | null;
  deathHijri: string | null;
  category: string | null;
  subcategory: string | null;
  language: string | null;
  status: string;
  source: string;
  sourceUrl: string | null;
  openitiUri: string | null;
  editionCount: number;
  versionCount: number;
  digital: CatalogDigitalVersion | null;
}

interface CatalogPayload {
  schemaVersion: number;
  sourceVersion: string;
  rightsNotice: string;
  counts: {
    works: number;
    editions: number;
    digitalVersions: number;
    openitiWorks: number;
    pendingSeedWorks: number;
  };
  works: CatalogWork[];
}

interface Props {
  initialWorkId?: string;
  initialCategory?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  onOpenReader?: (work: CatalogWork) => void;
  canOpenReader?: (work: CatalogWork) => boolean;
}

const PAGE_SIZE = 80;

const copy = {
  ar: {
    record: "سجل فهرسي",
    back: "العودة إلى المكتبة",
    unknownTitle: "عنوان غير متاح",
    unknownAuthor: "المؤلف غير مثبت في السجل",
    category: "القسم",
    language: "لغة الأصل",
    death: "وفاة المؤلف",
    unknown: "غير معلومة",
    editions: "الطبعات الموصولة",
    versions: "النسخ الرقمية",
    sourceDetails: "تفاصيل المصدر والمصدر التقني",
    source: "مصدر البيانات",
    catalogVersion: "إصدار الفهرس",
    review: "حالة المراجعة",
    reviewValue: "فهرسة آلية موثقة؛ المراجعة الببليوغرافية مستمرة",
    rights: "حقوق الاستخدام",
    openSource: "فتح سجل المصدر",
    openReader: "فتح غرفة القراءة",
    unavailable: "بيانات فهرسية فقط — لا تتوفر نسخة رقمية صالحة للقراءة لهذا السجل.",
    notFound: "السجل غير موجود",
    notFoundBody: "لا يوجد عمل بهذا المعرّف في إصدار الفهرس الحالي.",
    backCatalog: "العودة إلى فهرس المكتبة",
    loading: "جاري تحميل الفهرس المؤسسي…",
    loadError: "تعذر تحميل الفهرس المحلي. تبقى الرفوف المنقحة متاحة.",
    title: "الفهرس العلمي",
    versionLabel: "إصدار الفهرس",
    dataSource: "مصدر البيانات",
    dataSourceValue: "مشروع OpenITI / KITAB مع سجلات البذور المراجعة",
    reviewState: "حالة المراجعة",
    reviewStateValue: "مراجعة ببليوغرافية مستمرة",
    rightsStateValue: "تختلف بحسب النسخة؛ التفاصيل داخل سجل العمل",
    counts: (works: string, editions: string, versions: string) => `${works} عملًا · ${editions} سجل طبعة · ${versions} نسخة رقمية`,
    search: "العنوان أو المؤلف",
    searchPlaceholder: "ابحث في العناوين وأسماء المؤلفين…",
    allCategories: "كل الأقسام",
    availability: "الإتاحة",
    allAvailability: "كل حالات الإتاحة",
    results: (count: string) => `${count} نتيجة`,
    work: "العمل",
    author: "المؤلف",
    next: "التالي",
    previous: "السابق",
    page: (page: string, pages: string) => `صفحة ${page} من ${pages}`,
    provider: "الجهة الحافظة",
    format: "صيغة النسخة",
  },
  en: {
    record: "Catalog record",
    back: "Back to Library",
    unknownTitle: "Title unavailable",
    unknownAuthor: "Author not established in this record",
    category: "Subject",
    language: "Original language",
    death: "Author's death",
    unknown: "Unknown",
    editions: "Linked editions",
    versions: "Digital versions",
    sourceDetails: "Source and technical provenance",
    source: "Data source",
    catalogVersion: "Catalog release",
    review: "Review state",
    reviewValue: "Verified machine cataloguing; bibliographic review continues",
    rights: "Usage rights",
    openSource: "Open source record",
    openReader: "Open Reading Chamber",
    unavailable: "Catalog metadata only — no readable digital version is connected to this record.",
    notFound: "Record not found",
    notFoundBody: "No work with this identifier exists in the current catalog release.",
    backCatalog: "Back to Library catalog",
    loading: "Loading the institutional catalog…",
    loadError: "The local catalog could not be loaded, so no works can be listed right now.",
    title: "Scholarly Catalog",
    versionLabel: "Catalog release",
    dataSource: "Data source",
    dataSourceValue: "OpenITI / KITAB with reviewed seed records",
    reviewState: "Review state",
    reviewStateValue: "Bibliographic review in progress",
    rightsStateValue: "Version-specific; see each work record",
    counts: (works: string, editions: string, versions: string) => `${works} works · ${editions} edition records · ${versions} digital versions`,
    search: "Title or author",
    searchPlaceholder: "Search titles and author names…",
    allCategories: "All subjects",
    availability: "Availability",
    allAvailability: "All availability states",
    results: (count: string) => `${count} results`,
    work: "Work",
    author: "Author",
    next: "Next",
    previous: "Previous",
    page: (page: string, pages: string) => `Page ${page} of ${pages}`,
    provider: "Holding provider",
    format: "Digital format",
  },
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar");
}

function languageLabel(language: string | null, lang: LibraryUiLanguage): string {
  if (language === "ara") return lang === "ar" ? "العربية" : "Arabic";
  if (language === "per") return lang === "ar" ? "الفارسية" : "Persian";
  return copy[lang].unknown;
}

function WorkDetail({
  work,
  payload,
  lang,
  onOpenReader,
  canOpenReader,
}: {
  work: CatalogWork;
  payload: CatalogPayload;
  lang: LibraryUiLanguage;
  onOpenReader?: (work: CatalogWork) => void;
  canOpenReader?: (work: CatalogWork) => boolean;
}) {
  const c = copy[lang];
  const title = (lang === "en" ? work.titleEn || work.titleAr : work.titleAr || work.titleEn) || c.unknownTitle;
  const author = (lang === "en" ? work.authorEn || work.authorAr : work.authorAr || work.authorEn) || c.unknownAuthor;
  const availability = availabilityState(work.digital, work.versionCount);
  const readerAvailable = Boolean(onOpenReader && canOpenReader?.(work));

  return (
    <article className={styles.detail} aria-labelledby="catalog-work-title">
      <div className={styles.detailHead}>
        <div>
          <span>{c.record}</span>
          <h2 id="catalog-work-title">{title}</h2>
          <p>{author}</p>
        </div>
        <Link href="/library" className={styles.back}>{c.back}</Link>
      </div>

      <dl className={styles.facts}>
        <div><dt>{c.category}</dt><dd>{categoryLabel(work.category, lang)}</dd></div>
        <div><dt>{c.language}</dt><dd>{languageLabel(work.language, lang)}</dd></div>
        <div><dt>{c.death}</dt><dd>{work.deathHijri ? `${work.deathHijri} ${lang === "ar" ? "هـ" : "AH"}` : c.unknown}</dd></div>
        <div><dt>{c.editions}</dt><dd>{work.editionCount.toLocaleString(lang)}</dd></div>
        <div><dt>{c.versions}</dt><dd>{work.versionCount.toLocaleString(lang)}</dd></div>
        <div><dt>{c.availability}</dt><dd><span className={`${styles.availability} ${styles[`availability_${availability}`]}`}>{availabilityLabel(availability, lang)}</span></dd></div>
      </dl>

      {work.digital ? (
        <section className={styles.version} aria-label={c.versions}>
          <div className={styles.versionHead}>
            <div>
              <small>{c.provider}</small>
              <strong>{work.digital.provider}</strong>
            </div>
            <div>
              <small>{c.format}</small>
              <strong>{formatLabel(work.digital.format, lang)}</strong>
            </div>
          </div>
          <p className={styles.rights}><ShieldCheck size={16} aria-hidden="true" /><span><b>{c.rights}:</b> {rightsLabel(work.digital.rights, lang)}</span></p>
          <div className={styles.versionActions}>
            {readerAvailable ? (
              <button type="button" onClick={() => onOpenReader?.(work)}>
                <BookOpen size={15} aria-hidden="true" /> {c.openReader}
              </button>
            ) : null}
            {work.digital.itemUrl ? (
              <a href={work.digital.itemUrl} target="_blank" rel="noopener noreferrer">
                {c.openSource} <ExternalLink size={15} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </section>
      ) : (
        <p className={styles.unavailable}>{c.unavailable}</p>
      )}

      <details className={styles.provenance}>
        <summary><Info size={15} aria-hidden="true" /> {c.sourceDetails}</summary>
        <dl>
          <div><dt>{c.source}</dt><dd>{work.source}</dd></div>
          <div><dt>{c.catalogVersion}</dt><dd>{payload.sourceVersion}</dd></div>
          <div><dt>{c.review}</dt><dd>{c.reviewValue}</dd></div>
          <div><dt>{c.rights}</dt><dd>{payload.rightsNotice}</dd></div>
          <div><dt>Work ID</dt><dd dir="ltr">{work.id}</dd></div>
          {work.openitiUri ? <div><dt>OpenITI URI</dt><dd dir="ltr">{work.openitiUri}</dd></div> : null}
          {work.digital ? <div><dt>Digital version ID</dt><dd dir="ltr">{work.digital.id}</dd></div> : null}
        </dl>
      </details>
    </article>
  );
}

function resolveRegistryUri(id: string): string | null {
  return getLibraryBook(id)?.openitiWorkUri
    ?? getLibraryBookByOpenitiUri(id)?.openitiWorkUri
    ?? null;
}

export function LibraryCatalog({
  initialWorkId,
  initialCategory,
  query: externalQuery,
  onQueryChange,
  onOpenReader,
  canOpenReader,
}: Props) {
  const lang = useInstitution((state) => state.lang);
  const c = copy[lang];
  const [data, setData] = useState<CatalogPayload | null>(null);
  const [error, setError] = useState("");
  // The route has one search term. This view used to keep a second private box,
  // so the prominent hero search did nothing in the catalog view.
  const [ownQuery, setOwnQuery] = useState("");
  const query = externalQuery ?? ownQuery;
  const setQuery = onQueryChange ?? setOwnQuery;
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [availability, setAvailability] = useState<"all" | AvailabilityState>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // The catalog is 10.7 MB. This view used to fetch it a second time on its
    // own and outside the shared cache, so switching between halls and catalog
    // downloaded all of it again.
    let active = true;
    loadFullLibraryCatalog()
      .then((payload: CatalogPayload) => { if (active) setData(payload); })
      .catch(() => { if (active) setError(c.loadError); });
    return () => { active = false; };
  }, [c.loadError]);

  const categories = useMemo(
    () => [...new Set((data?.works ?? []).map((work) => work.category || "UNCLASSIFIED_OPENITI"))]
      .sort((a, b) => categoryLabel(a, lang).localeCompare(categoryLabel(b, lang), lang)),
    [data, lang],
  );

  const availabilityOptions = useMemo(
    () => [...new Set((data?.works ?? []).map((work) => availabilityState(work.digital, work.versionCount)))],
    [data],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return (data?.works ?? []).filter((work) => {
      const rawCategory = work.category || "UNCLASSIFIED_OPENITI";
      if (category !== "all" && rawCategory !== category) return false;
      if (availability !== "all" && availabilityState(work.digital, work.versionCount) !== availability) return false;
      if (!needle) return true;
      return normalize([
        work.titleAr,
        work.titleEn,
        work.authorAr,
        work.authorEn,
        categoryLabel(work.category, lang),
      ].filter(Boolean).join(" ")).includes(needle);
    });
  }, [availability, category, data, lang, query]);

  useEffect(() => setPage(1), [availability, category, query]);

  useEffect(() => {
    setCategory(initialCategory ?? "all");
    setPage(1);
  }, [initialCategory]);

  if (error) return <p className={styles.state} role="alert">{error}</p>;
  if (!data) return <p className={styles.state} role="status">{c.loading}</p>;

  if (initialWorkId) {
    const resolvedId = resolveCatalogWorkId(data.works, resolveRegistryUri, initialWorkId);
    const work = resolvedId ? data.works.find((candidate) => candidate.id === resolvedId) ?? null : null;
    return work ? (
      <WorkDetail
        work={work}
        payload={data}
        lang={lang}
        onOpenReader={onOpenReader}
        canOpenReader={canOpenReader}
      />
    ) : (
      <section className={styles.notFound}>
        <h2>{c.notFound}</h2>
        <p>{c.notFoundBody}</p>
        <Link href="/library">{c.backCatalog}</Link>
      </section>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const locale = lang === "ar" ? "ar" : "en";

  return (
    <section className={styles.catalog} aria-labelledby="serious-catalog-title">
      <header className={styles.header}>
        <div>
          <span>{c.versionLabel} · 2025.1.9</span>
          <h2 id="serious-catalog-title">{c.title}</h2>
          <p>{c.counts(data.counts.works.toLocaleString(locale), data.counts.editions.toLocaleString(locale), data.counts.digitalVersions.toLocaleString(locale))}</p>
        </div>
        <dl className={styles.catalogStatus}>
          <div><dt>{c.dataSource}</dt><dd>{c.dataSourceValue}</dd></div>
          <div><dt>{c.reviewState}</dt><dd>{c.reviewStateValue}</dd></div>
          <div><dt>{c.rights}</dt><dd>{c.rightsStateValue}</dd></div>
        </dl>
      </header>

      <div className={styles.filters}>
        <label>
          <span>{c.search}</span>
          <span className={styles.searchBox}><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.searchPlaceholder} aria-label={lang === "ar" ? "بحث في فهرس المكتبة" : "Search the Library catalog"} /></span>
        </label>
        <label><span>{c.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{c.allCategories}</option>{categories.map((item) => <option key={item} value={item}>{categoryLabel(item, lang)}</option>)}</select></label>
        <label><span>{c.availability}</span><select value={availability} onChange={(event) => setAvailability(event.target.value as "all" | AvailabilityState)}><option value="all">{c.allAvailability}</option>{availabilityOptions.map((item) => <option key={item} value={item}>{availabilityLabel(item, lang)}</option>)}</select></label>
      </div>

      <p className={styles.resultCount} aria-live="polite">{c.results(filtered.length.toLocaleString(locale))}</p>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>{c.work}</th><th>{c.author}</th><th>{c.category}</th><th>{c.versions}</th><th>{c.availability}</th></tr></thead>
          <tbody>{visible.map((work) => {
            const title = (lang === "en" ? work.titleEn || work.titleAr : work.titleAr || work.titleEn) || c.unknownTitle;
            const author = (lang === "en" ? work.authorEn || work.authorAr : work.authorAr || work.authorEn) || c.unknownAuthor;
            const state = availabilityState(work.digital, work.versionCount);
            return (
              <tr key={work.id}>
                <td data-label={c.work}><Link href={`/library/work/${encodeURIComponent(work.id)}`}>{title}</Link></td>
                <td data-label={c.author}>{author}</td>
                <td data-label={c.category}>{categoryLabel(work.category, lang)}</td>
                <td data-label={c.versions}>{work.versionCount.toLocaleString(locale)}</td>
                <td data-label={c.availability}><span className={`${styles.availability} ${styles[`availability_${state}`]}`}>{availabilityLabel(state, lang)}</span></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      <nav className={styles.pagination} aria-label={lang === "ar" ? "صفحات نتائج الفهرس" : "Catalog result pages"}>
        <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>{c.previous}</button>
        <span>{c.page(page.toLocaleString(locale), pageCount.toLocaleString(locale))}</span>
        <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>{c.next}</button>
      </nav>
    </section>
  );
}
