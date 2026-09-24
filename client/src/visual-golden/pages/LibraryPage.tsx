import { useState } from "react";
import { Armchair, BookOpen, LibraryBig, Search, ExternalLink } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import {
  getLibraryBookByOpenitiUri,
  LIBRARY_COUNTS,
  type BookMode,
  type LibraryBook,
} from "@/visual-golden/services/library";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { BookshelfHall } from "@/visual-golden/components/library/BookshelfHall";
import { LibraryCatalog } from "@/visual-golden/components/library/LibraryCatalog";
import { ReadingChamber } from "@/visual-golden/components/library/ReadingChamber";
import styles from "./LibraryPage.module.css";

export function LibraryPage({ initialWorkId }: { initialWorkId?: string }) {
  const lang = useInstitution((state) => state.lang);
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<string | "الكل">("الكل");
  const [selected, setSelected] = useState<LibraryBook | null>(null);
  const [open, setOpen] = useState<{ book: LibraryBook; mode?: BookMode } | null>(null);
  const [view, setView] = useState<"shelves" | "catalog">(initialWorkId ? "catalog" : "shelves");
  const readableSelection = selected?.modes.includes("قراءة") ? selected : null;
  const labels = lang === "ar" ? {
    title: "المكتبة الكبرى",
    subtitle: `مكتبة رقمية مؤسسية · ${LIBRARY_COUNTS.works.toLocaleString("ar")} عملاً منقحاً على الرفوف · ٩٬١٢٩ عملاً في الفهرس العلمي`,
    description: "رفوف معمارية منقحة، وفهرس علمي شامل، وغرفة قراءة لا تُفتح إلا عندما تثبت نسخة نصية صالحة ومصرح بها.",
    search: "ابحث في الرفوف باسم الكتاب أو المؤلف أو القسم…",
    searchLabel: "بحث داخل الرفوف المعمارية",
    globalSearch: "بحث خارجي",
    shelves: "الرفوف المعمارية",
    shelvesHint: "مجموعة منقحة للعرض والاستكشاف",
    catalog: "الفهرس العلمي",
    catalogHint: "٩٬١٢٩ عملاً ببيانات المصدر والحقوق",
    reading: "غرفة القراءة",
    readingHint: readableSelection ? `قراءة ${readableSelection.title}` : "اختر من الرف كتاباً تتوفر له نسخة نصية",
    modesLabel: "طرق استكشاف المكتبة",
  } : {
    title: "The Grand Library",
    subtitle: `Institutional digital library · ${LIBRARY_COUNTS.works.toLocaleString("en")} curated shelf works · 9,129 works in the scholarly catalog`,
    description: "Curated architectural shelves, a comprehensive scholarly catalog, and a Reading Chamber that opens only for verified, permitted text versions.",
    search: "Search the shelves by title, author, or subject…",
    searchLabel: "Search the architectural shelves",
    globalSearch: "External search",
    shelves: "Architectural Shelves",
    shelvesHint: "A curated collection for discovery",
    catalog: "Scholarly Catalog",
    catalogHint: "9,129 works with source and rights states",
    reading: "Reading Chamber",
    readingHint: readableSelection ? `Read ${readableSelection.titleEn}` : "Select a shelf work with an available text",
    modesLabel: "Ways to explore the Library",
  };

  const openCatalogReader = (work: { openitiUri: string | null }) => {
    const shelfBook = getLibraryBookByOpenitiUri(work.openitiUri);
    if (shelfBook?.modes.includes("قراءة")) setOpen({ book: shelfBook, mode: "قراءة" });
  };

  return (
    <div className={styles.page}>
      <PageHero
        title={labels.title}
        subtitle={labels.subtitle}
        desc={labels.description}
        image={art.library}
        wing="library"
      >
        <div className={styles.search}>
          <Search size={16} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.searchLabel}
          />
          {q.trim().length > 1 ? (
            <a
              className="btn-outline"
              href={`https://openlibrary.org/search?q=${encodeURIComponent(q.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {labels.globalSearch} <ExternalLink size={13} />
            </a>
          ) : null}
        </div>
      </PageHero>

      {!initialWorkId ? (
        <nav className={styles.modeSwitch} aria-label={labels.modesLabel}>
          <button type="button" className={view === "shelves" ? styles.modeOn : ""} onClick={() => setView("shelves")}>
            <LibraryBig size={19} aria-hidden="true" /><span><strong>{labels.shelves}</strong><small>{labels.shelvesHint}</small></span>
          </button>
          <button type="button" className={view === "catalog" ? styles.modeOn : ""} onClick={() => setView("catalog")}>
            <BookOpen size={19} aria-hidden="true" /><span><strong>{labels.catalog}</strong><small>{labels.catalogHint}</small></span>
          </button>
          <button type="button" disabled={!readableSelection} onClick={() => readableSelection && setOpen({ book: readableSelection, mode: "قراءة" })}>
            <Armchair size={19} aria-hidden="true" /><span><strong>{labels.reading}</strong><small>{labels.readingHint}</small></span>
          </button>
        </nav>
      ) : null}

      {view === "shelves" ? (
        <BookshelfHall
          activeShelf={shelf}
          onShelf={setShelf}
          selected={selected}
          onSelect={setSelected}
          onOpen={(book, mode) => setOpen({ book, mode })}
          query={q}
        />
      ) : (
        <LibraryCatalog
          initialWorkId={initialWorkId}
          canOpenReader={(work) => Boolean(getLibraryBookByOpenitiUri(work.openitiUri)?.modes.includes("قراءة"))}
          onOpenReader={openCatalogReader}
        />
      )}

      {open ? (
        <ReadingChamber
          book={open.book}
          initialMode={open.mode}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
