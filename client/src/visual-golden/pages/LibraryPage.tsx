import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, ExternalLink } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { LIBRARY_COUNTS, type BookMode, type LibraryBook } from "@/visual-golden/services/library";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { BookshelfHall } from "@/visual-golden/components/library/BookshelfHall";
import { ReadingChamber } from "@/visual-golden/components/library/ReadingChamber";
import { ManuscriptGallery } from "@/visual-golden/components/library/ManuscriptGallery";
import { ManuscriptReader } from "@/visual-golden/components/library/ManuscriptReader";
import type { ManuscriptSource } from "@/visual-golden/services/iiif";
import styles from "./LibraryPage.module.css";

interface ExternalCatalogItem {
  workId: string;
  title: string;
  author: string | null;
  firstPublishYear: number | null;
  canonicalUrl: string;
}

type ExternalSearch =
  | { state: "idle" }
  | { state: "loading" | "error"; query: string }
  | { state: "ready"; query: string; items: ExternalCatalogItem[] };

export function LibraryPage() {
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<string | "الكل">("الكل");
  const [selected, setSelected] = useState<LibraryBook | null>(null);
  const [open, setOpen] = useState<{ book: LibraryBook; mode?: BookMode } | null>(null);
  const [external, setExternal] = useState<ExternalSearch>({ state: "idle" });
  const [manuscript, setManuscript] = useState<ManuscriptSource | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const searchExternal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    request.current?.abort();
    const query = q.trim();
    if (query.length < 2 || query.length > 90) {
      setExternal({ state: "idle" });
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setExternal({ state: "loading", query });
    try {
      const response = await fetch(`/api/content/library/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: { items: ExternalCatalogItem[] } = await response.json();
      if (!controller.signal.aborted) setExternal({ state: "ready", query, items: result.items });
    } catch {
      if (!controller.signal.aborted) setExternal({ state: "error", query });
    }
  };

  return (
    <div className={styles.page}>
      <PageHero
        title="المكتبة والرفوف الرقمية"
        subtitle={`DIGITAL LIBRARY · ${LIBRARY_COUNTS.works} عملًا · ${LIBRARY_COUNTS.versions} نسخة`}
        desc="سجلات فهرسية ونسخ رقمية موثقة من OpenITI — النص الكامل غير متاح داخل المنصة حتى مراجعة النسخة والحقوق"
        image={art.library}
        wing="library"
      >
        <form className={styles.search} onSubmit={searchExternal}>
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => { request.current?.abort(); setQ(e.target.value); setExternal({ state: "idle" }); }}
            placeholder="ابحث في عناوين الرفوف والمؤلفين..."
            aria-label="بحث في الرفوف المحلية والفهرس الخارجي"
          />
          <button className="btn-gold" type="submit">
            بحث
          </button>
        </form>
      </PageHero>

      {external.state !== "idle" ? (
        <section className={styles.externalResults} aria-live="polite" aria-label="نتائج فهرس Open Library">
          <div className={styles.externalHeader}>
            <h2>فهرس خارجي من Open Library</h2>
            <span>وصف أعمال وروابط أصلية · لا نصوص كاملة معتمدة</span>
          </div>
          {external.state === "loading" ? <p>جارٍ البحث في الفهرس الخارجي…</p> : null}
          {external.state === "error" ? (
            <p>تعذر جلب الفهرس الآن. يمكنك متابعة الرفوف المحلية أو <a href={`https://openlibrary.org/search?q=${encodeURIComponent(external.query)}`} target="_blank" rel="noopener noreferrer">البحث مباشرة لدى Open Library <ExternalLink size={14} aria-hidden="true" /></a>.</p>
          ) : null}
          {external.state === "ready" ? (
            external.items.length ? (
              <ul className={styles.externalGrid}>
                {external.items.map((item) => (
                  <li key={item.workId}>
                    <span>سجل عمل · {item.firstPublishYear ?? "تاريخ غير محدد"}</span>
                    <strong>{item.title}</strong>
                    <small>{item.author ?? "المؤلف غير محدد في هذه النتيجة"}</small>
                    <a href={item.canonicalUrl} target="_blank" rel="noopener noreferrer">افتح السجل الأصلي <ExternalLink size={14} aria-hidden="true" /></a>
                  </li>
                ))}
              </ul>
            ) : <p>لم يظهر سجل مطابق في الفهرس الخارجي. جرّب عنوانًا مختلفًا أو تصفح الرفوف المحلية.</p>
          ) : null}
        </section>
      ) : null}

      <ManuscriptGallery onOpen={setManuscript} />

      <BookshelfHall
        activeShelf={shelf}
        onShelf={setShelf}
        selected={selected}
        onSelect={setSelected}
        onOpen={(book, mode) => setOpen({ book, mode })}
        query={q}
      />

      {open ? (
        <ReadingChamber book={open.book} initialMode={open.mode} onClose={() => setOpen(null)} />
      ) : null}

      {manuscript ? (
        <ManuscriptReader source={manuscript} onClose={() => setManuscript(null)} />
      ) : null}
    </div>
  );
}
