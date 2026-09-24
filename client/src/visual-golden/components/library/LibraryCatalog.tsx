import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Link } from "wouter";
import styles from "./LibraryCatalog.module.css";

interface CatalogDigitalVersion {
  id: string;
  provider: string;
  itemUrl: string | null;
  fileUrl: string | null;
  format: string;
  rights: string;
  download: string;
  reading: string;
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

const PAGE_SIZE = 80;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase("ar");
}

function WorkDetail({ work, rightsNotice }: { work: CatalogWork; rightsNotice: string }) {
  const title = work.titleAr || work.titleEn || "عنوان غير متاح";
  return (
    <article className={styles.detail} aria-labelledby="catalog-work-title">
      <div className={styles.detailHead}>
        <div>
          <span>CATALOG RECORD · سجل فهرسي</span>
          <h2 id="catalog-work-title">{title}</h2>
          <p>{work.authorAr || work.authorEn || "المؤلف غير مثبت في السجل"}</p>
        </div>
        <Link href="/library" className={styles.back}>العودة إلى المكتبة</Link>
      </div>

      <dl className={styles.facts}>
        <div><dt>المعرّف الثابت</dt><dd dir="ltr">{work.id}</dd></div>
        <div><dt>القسم</dt><dd>{work.category || "غير مصنف"}</dd></div>
        <div><dt>لغة الأصل</dt><dd>{work.language || "غير معلومة"}</dd></div>
        <div><dt>وفاة المؤلف</dt><dd>{work.deathHijri ? `${work.deathHijri} هـ` : "غير معلومة"}</dd></div>
        <div><dt>الطبعات الموصولة</dt><dd>{work.editionCount}</dd></div>
        <div><dt>النسخ الرقمية</dt><dd>{work.versionCount}</dd></div>
      </dl>

      {work.digital ? (
        <section className={styles.version} aria-label="نسخة رقمية">
          <div>
            <strong>{work.digital.provider}</strong>
            <span>{work.digital.format} · {work.digital.reading}</span>
          </div>
          <p><b>الحقوق:</b> {work.digital.rights}. {rightsNotice}</p>
          {work.digital.itemUrl ? (
            <a href={work.digital.itemUrl} target="_blank" rel="noopener noreferrer">
              افتح سجل المصدر <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : null}
        </section>
      ) : (
        <p className={styles.unavailable}>
          سجل فهرسي — لا يتوفر نص رقمي موصول ومصرح به لهذا السجل.
        </p>
      )}
    </article>
  );
}

export function LibraryCatalog({ initialWorkId }: { initialWorkId?: string }) {
  const [data, setData] = useState<CatalogPayload | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/library-catalog.v1.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`catalog HTTP ${response.status}`);
        return response.json() as Promise<CatalogPayload>;
      })
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("تعذر تحميل الفهرس المحلي. تبقى الرفوف المنقحة متاحة.");
      });
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [...new Set((data?.works ?? []).map((work) => work.category || "غير مصنف"))].sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return (data?.works ?? []).filter((work) => {
      if (category !== "all" && (work.category || "غير مصنف") !== category) return false;
      if (availability === "digital" && !work.digital) return false;
      if (availability === "metadata" && work.digital) return false;
      if (!needle) return true;
      return normalize([
        work.titleAr,
        work.titleEn,
        work.authorAr,
        work.authorEn,
        work.openitiUri,
      ].filter(Boolean).join(" ")).includes(needle);
    });
  }, [availability, category, data, query]);

  useEffect(() => setPage(1), [availability, category, query]);

  if (error) return <p className={styles.state} role="alert">{error}</p>;
  if (!data) return <p className={styles.state} role="status">جاري تحميل الفهرس المؤسسي…</p>;

  if (initialWorkId) {
    const work = data.works.find((candidate) => candidate.id === initialWorkId);
    return work ? (
      <WorkDetail work={work} rightsNotice={data.rightsNotice} />
    ) : (
      <section className={styles.notFound}>
        <h2>السجل غير موجود</h2>
        <p>لا يوجد عمل بهذا المعرّف في إصدار الفهرس الحالي.</p>
        <Link href="/library">العودة إلى فهرس المكتبة</Link>
      </section>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className={styles.catalog} aria-labelledby="serious-catalog-title">
      <header className={styles.header}>
        <div>
          <span>VERSIONED CATALOG · {data.sourceVersion}</span>
          <h2 id="serious-catalog-title">الفهرس العلمي</h2>
          <p>{data.counts.works.toLocaleString("ar")} عملًا · {data.counts.editions.toLocaleString("ar")} سجل طبعة · {data.counts.digitalVersions.toLocaleString("ar")} نسخة رقمية</p>
        </div>
        <p className={styles.notice}>{data.rightsNotice}</p>
      </header>

      <div className={styles.filters}>
        <label>
          <span>العنوان أو المؤلف أو المعرّف</span>
          <span className={styles.searchBox}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} /></span>
        </label>
        <label><span>القسم</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">كل الأقسام</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>الإتاحة</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">الكل</option><option value="digital">نسخة رقمية موصولة</option><option value="metadata">بيانات فهرسية فقط</option></select></label>
      </div>

      <p className={styles.resultCount} aria-live="polite">{filtered.length.toLocaleString("ar")} نتيجة</p>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>العمل</th><th>المؤلف</th><th>القسم</th><th>النسخ</th><th>الإتاحة</th></tr></thead>
          <tbody>{visible.map((work) => (
            <tr key={work.id}>
              <td><Link href={`/library/work/${encodeURIComponent(work.id)}`}>{work.titleAr || work.titleEn || "عنوان غير متاح"}</Link><small dir="ltr">{work.openitiUri || work.id}</small></td>
              <td>{work.authorAr || work.authorEn || "غير مثبت"}</td>
              <td>{work.category || "غير مصنف"}</td>
              <td>{work.versionCount}</td>
              <td>{work.digital ? "مصدر رقمي" : "فهرس فقط"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <nav className={styles.pagination} aria-label="صفحات نتائج الفهرس">
        <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>السابق</button>
        <span>صفحة {page.toLocaleString("ar")} من {pageCount.toLocaleString("ar")}</span>
        <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>التالي</button>
      </nav>
    </section>
  );
}
